// The content step: reads docs/components/<id>.md and <id>.ar.md for each id
// in components.json, checks them (structure, links, live groups, parity) and,
// when no finding remains, writes the model, the manifest, the loaders and the
// live groups. Every finding of every file is collected before the step fails.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { LANGS, finding, formatFinding } from './config.mjs';
import { writeOutputs } from './manifest.mjs';
import { buildModel, inlineText } from './model.mjs';
import { checkParity } from './parity.mjs';
import { parseMarkdown } from './parse.mjs';
import { analysePage } from './structure.mjs';

const toPosix = (path) => path.split('\\').join('/');

/** The components of components.json as a Map id -> entry. */
export function readComponents(componentsFile) {
  const data = JSON.parse(readFileSync(componentsFile, 'utf8'));
  const list = Array.isArray(data) ? data : data.components;
  if (!Array.isArray(list)) throw new Error(`content: ${componentsFile} has no components array`);
  return new Map(list.map((entry) => [entry.id, entry]));
}

/**
 * Checks the file names of a components directory (HWC-FILE).
 * @param {string[]} names File names in the directory.
 * @param {Map<string, any> | Set<string>} known Ids of components.json.
 * @param {string} dirLabel Repository-relative directory for messages.
 * @returns {{ ids: string[], findings: any[] }}
 */
export function listSources(names, known, dirLabel) {
  const findings = [];
  const english = new Set();
  const arabic = new Set();
  for (const name of names.filter((entry) => entry.endsWith('.md') && entry !== 'README.md').sort()) {
    const file = `${dirLabel}/${name}`;
    const match = /^([a-z0-9-]+)(\.ar)?\.md$/.exec(name);
    if (!match) {
      findings.push(finding('HWC-FILE', file, 1, `the file name is not <id>.md or <id>.ar.md`));
      continue;
    }
    const [, id, ar] = match;
    if (!known.has(id)) {
      findings.push(finding('HWC-FILE', file, 1, `"${id}" is not a component id in components.json`));
      continue;
    }
    (ar ? arabic : english).add(id);
  }
  for (const id of english) if (!arabic.has(id)) findings.push(finding('HWC-FILE', `${dirLabel}/${id}.md`, 1, `the English page has no Arabic sibling ${id}.ar.md`));
  for (const id of arabic) if (!english.has(id)) findings.push(finding('HWC-FILE', `${dirLabel}/${id}.ar.md`, 1, `the Arabic page has no English sibling ${id}.md`));
  return { ids: [...english].filter((id) => arabic.has(id)).sort(), findings };
}

/**
 * Checks one page pair and builds its models.
 * @param {{ id: string, entry: any, enText: string, arText: string, enPath: string, arPath: string,
 *           repoDir: string, componentsDir: string, built: Set<string>, enLabel?: string, arLabel?: string }} pair
 *   enLabel and arLabel replace the file paths in messages (tests read a file from elsewhere).
 */
export function processPair(pair) {
  const { id, entry, enText, arText, enPath, arPath, repoDir, componentsDir, built } = pair;
  const label = (path) => (path === enPath && pair.enLabel) || (path === arPath && pair.arLabel) || toPosix(relative(repoDir, path));
  const findings = [];
  const outlines = {};
  for (const [lang, text, path] of [['en', enText, enPath], ['ar', arText, arPath]]) {
    const file = label(path);
    const parsed = parseMarkdown(text, file);
    findings.push(...parsed.findings);
    const outline = analysePage({ tree: parsed.tree, frontMatter: parsed.frontMatter, lang, file, id, entry });
    findings.push(...outline.findings);
    outlines[lang] = outline;
  }
  const common = { id, repoDir, componentsDir, built };
  const en = buildModel(outlines.en, { ...common, filePath: enPath, sourcePath: toPosix(relative(repoDir, enPath)) });
  const ar = buildModel(outlines.ar, {
    ...common, filePath: arPath, sourcePath: toPosix(relative(repoDir, arPath)),
    englishIds: en.ids, englishLevels: outlines.en.headings.map((heading) => heading.level),
  });
  findings.push(...en.findings, ...ar.findings);
  findings.push(...checkParity(outlines.en, outlines.ar, { enText, arText, id }));

  const idOf = (outline, ids, node) => ids[outline.headings.findIndex((heading) => heading.node === node)];
  const groupEntries = {};
  for (const lang of LANGS) {
    const outline = outlines[lang];
    groupEntries[lang] = outline.groups.map((group) => {
      const item = { id, lang, example: group.example };
      if (group.check !== undefined) item.check = group.check;
      if (group.differences !== undefined) item.differences = group.differences;
      item.blocks = Object.fromEntries(Object.entries(group.blocks).map(([framework, block]) => [framework, { lang: block.lang, form: block.form, code: block.code, line: block.line }]));
      return item;
    });
  }
  const manifestPage = {
    id,
    langs: [...LANGS],
    title: { en: en.page.title, ar: ar.page.title },
    summaryText: { en: inlineText(en.page.summary), ar: inlineText(ar.page.summary) },
    headings: { en: en.page.headings, ar: ar.page.headings },
    liveGroups: outlines.en.groups.map((group) => {
      const item = {
        example: group.example,
        section: group.h3 ? idOf(outlines.en, en.ids, group.h3) : group.section,
        frameworks: 4,
      };
      if (group.check !== undefined) item.check = group.check;
      if (group.differences !== undefined) item.differences = group.differences;
      return item;
    }),
  };
  return { findings, models: { en: en.page, ar: ar.page }, groupEntries, manifestPage };
}

/**
 * Runs the content step.
 * @param {{ guideDir: string, repoDir: string, componentsDir: string, componentsFile: string,
 *           outDir: string, liveGroupsFile: string, write?: boolean }} options
 * @returns {{ findings: any[], pages: number, groups: number, manifest: any }}
 */
export function runContent(options) {
  const { guideDir, repoDir, componentsDir, componentsFile, outDir, liveGroupsFile } = options;
  const known = readComponents(componentsFile);
  const names = existsSync(componentsDir) ? readdirSync(componentsDir) : [];
  const dirLabel = toPosix(relative(repoDir, componentsDir));
  const { ids, findings } = listSources(names, known, dirLabel);
  const built = new Set(ids);
  const pages = [];
  const manifestPages = [];
  const liveGroups = [];
  for (const id of ids) {
    const enPath = join(componentsDir, `${id}.md`);
    const arPath = join(componentsDir, `${id}.ar.md`);
    const result = processPair({
      id, entry: known.get(id), enText: readFileSync(enPath, 'utf8'), arText: readFileSync(arPath, 'utf8'),
      enPath, arPath, repoDir, componentsDir, built,
    });
    findings.push(...result.findings);
    for (const lang of LANGS) {
      pages.push({ id, lang, page: result.models[lang] });
      liveGroups.push(...result.groupEntries[lang]);
    }
    manifestPages.push(result.manifestPage);
  }
  if (findings.length > 0 || options.write === false) return { findings, pages: pages.length, groups: liveGroups.length, manifest: null };
  const manifest = writeOutputs({ guideDir, outDir, liveGroupsFile, pages, manifestPages, liveGroups });
  return { findings, pages: pages.length, groups: liveGroups.length, manifest };
}

export { formatFinding };
