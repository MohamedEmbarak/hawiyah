// The content step: reads docs/components/<id>.md and <id>.ar.md for each id
// in components.json, checks them (structure, links, live groups, parity) and,
// when no finding remains, writes the model, the manifest, the loaders and the
// live groups. Every finding of every file is collected before the step fails.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { H2, LANGS, finding, formatFinding } from './config.mjs';
import { writeOutputs } from './manifest.mjs';
import { buildModel, inlineText } from './model.mjs';
import { checkParity, readArabicExceptions } from './parity.mjs';
import { parseMarkdown } from './parse.mjs';
import {
  componentNames, emptyFindings, liveComponentFindings, readClaimExceptions, readLiveComponentExceptions, readMarketingTerms, textFindings,
} from './prose.mjs';
import { analysePage, captionPrefix } from './structure.mjs';

const COMPLIANCE = JSON.parse(readFileSync(new URL('../../src/app/i18n/compliance.json', import.meta.url), 'utf8'));
const REQUIRED_SECTIONS = new Set(H2.filter((entry) => entry.required).map((entry) => entry.id));

/**
 * The fixture a docs directory outside docs/components declares (fixture.json beside
 * its components directory, or in it): { fixture, showsComponent, reason }. A
 * fixture's generic live groups show the component showsComponent instead of the
 * page's own (HWC-LIVE7); the scale fixture writes one. The file is never read for
 * docs/components of the repository, whose builds alone are deployable.
 */
export function readFixture(componentsDir, repoDir) {
  if (resolve(componentsDir) === resolve(repoDir, 'docs', 'components')) return null;
  const file = [join(componentsDir, '..', 'fixture.json'), join(componentsDir, 'fixture.json')].find((path) => existsSync(path));
  if (!file) return null;
  const data = JSON.parse(readFileSync(file, 'utf8'));
  const keys = Object.keys(data ?? {}).sort().join(',');
  if (keys !== 'fixture,reason,showsComponent' || ![data.fixture, data.reason, data.showsComponent].every((value) => typeof value === 'string' && value.trim())) {
    throw new Error(`content: ${file} must be { "fixture", "showsComponent", "reason" } with non-empty values`);
  }
  return data;
}

const toPosix = (path) => path.split('\\').join('/');

/** The components of components.json as a Map id -> entry. */
export function readComponents(componentsFile) {
  const data = JSON.parse(readFileSync(componentsFile, 'utf8'));
  const list = Array.isArray(data) ? data : data.components;
  if (!Array.isArray(list)) throw new Error(`content: ${componentsFile} has no components array`);
  return new Map(list.map((entry) => [entry.id, entry]));
}

/** The default list of English pages whose Arabic sibling is still being written (5a.6). */
export const PENDING_FILE = join(dirname(fileURLToPath(import.meta.url)), 'pending-translation.json');

/** The line of step 20 that counts the English pages pending translation (printed by every build, deployable or not). */
export function pendingLine(pending) {
  return `content: ${pending.length} pages pending translation${pending.length ? ` (${pending.join(', ')}: English only, no route until the Arabic page exists)` : ''}`;
}

/** Reads pending-translation.json: the ids it lists. */
export function readPending(file = PENDING_FILE) {
  if (!existsSync(file)) return new Set();
  const data = JSON.parse(readFileSync(file, 'utf8'));
  const pages = data.pages ?? [];
  if (!Array.isArray(pages) || pages.some((id) => typeof id !== 'string' || !/^[a-z0-9-]+$/.test(id))) {
    throw new Error('content: scripts/content/pending-translation.json must be { "pages": ["<id>", ...] }');
  }
  return new Set(pages);
}

/**
 * Checks the file names of a components directory (HWC-FILE).
 * @param {string[]} names File names in the directory.
 * @param {Map<string, any> | Set<string>} known Ids of components.json.
 * @param {string} dirLabel Repository-relative directory for messages.
 * @param {Set<string>} [pending] Ids of pending-translation.json: an English page
 *   without its Arabic sibling is accepted for these and gets no route.
 * @returns {{ ids: string[], pending: string[], findings: any[] }}
 */
export function listSources(names, known, dirLabel, pending = new Set()) {
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
  const waiting = [];
  for (const id of english) {
    if (arabic.has(id)) continue;
    if (pending.has(id)) waiting.push(id);
    else findings.push(finding('HWC-FILE', `${dirLabel}/${id}.md`, 1, `the English page has no Arabic sibling ${id}.ar.md`));
  }
  for (const id of arabic) if (!english.has(id)) findings.push(finding('HWC-FILE', `${dirLabel}/${id}.ar.md`, 1, `the Arabic page has no English sibling ${id}.md`));
  for (const id of [...pending].sort()) {
    if (arabic.has(id)) findings.push(finding('HWC-FILE', 'guide/scripts/content/pending-translation.json', 1, `${id} is listed as pending translation, but ${dirLabel}/${id}.ar.md exists; remove the entry`));
    else if (!english.has(id)) findings.push(finding('HWC-FILE', 'guide/scripts/content/pending-translation.json', 1, `${id} is listed as pending translation, but ${dirLabel}/${id}.md does not exist`));
  }
  return { ids: [...english].filter((id) => arabic.has(id)).sort(), pending: waiting.sort(), findings };
}

/**
 * The keyboard table of each language for the manifest (5a.8): { <lang>: { caption,
 * rows: [{ keys, action }] } | null }. Step 80 binds its keys to the keyboard checks
 * (HWE-KEYS).
 * @param {Record<string, any>} outlines analysePage() results by language
 */
export function keyboardOf(outlines) {
  return Object.fromEntries(Object.entries(outlines).map(([lang, outline]) => [lang, outline.keyboard
    ? { caption: outline.keyboard.caption, line: outline.keyboard.node.position?.start.line ?? 1, rows: outline.keyboard.rows }
    : null]));
}

/** The placeholder of content:scaffold-ar --placeholder is accepted only in a page read from outside docs/components. */
export const isPlaceholderAllowed = (componentsDir, repoDir) => resolve(componentsDir) !== resolve(repoDir, 'docs', 'components');

/**
 * The text gates of prose.mjs on one page in one language (G2 and G3 of the 5a fix
 * round): claims, hollow sections, placeholders, marketing terms, install text and
 * the page's component in each live group. `pair` carries the lists a test passes
 * instead of the lead's files (claimExceptions, marketing, liveExceptions).
 */
export function pageTextFindings({ tree, outline, lang, file, used, placeholderAllowed, names, fixtureNames = null, pair = {} }) {
  return [
    ...textFindings({
      tree, groups: outline.groups, lang, file, compliance: COMPLIANCE[lang], used, placeholderAllowed,
      claimExceptions: pair.claimExceptions ?? readClaimExceptions(), marketing: pair.marketing ?? readMarketingTerms(),
    }),
    ...emptyFindings({ outline, file, compliance: COMPLIANCE[lang], isCaption: (node) => captionPrefix(node) !== null, required: REQUIRED_SECTIONS }),
    ...liveComponentFindings({ groups: outline.groups, file, names, exceptions: pair.liveExceptions ?? readLiveComponentExceptions(), used, fixtureNames }),
  ];
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
  // The text gates of the fix round of 5a (prose.mjs): claims, hollow sections,
  // placeholders, marketing terms, install text and the page's component in each group.
  const used = pair.used ?? new Set();
  const nodeModules = join(repoDir, 'guide', 'node_modules');
  const names = pair.names ?? componentNames(id, entry, nodeModules);
  const fixture = pair.fixture === undefined ? readFixture(componentsDir, repoDir) : pair.fixture;
  const fixtureNames = fixture ? componentNames(fixture.showsComponent, pair.fixtureEntry ?? null, nodeModules) : null;
  const placeholderAllowed = isPlaceholderAllowed(componentsDir, repoDir);
  for (const [lang, text, path] of [['en', enText, enPath], ['ar', arText, arPath]]) {
    const file = label(path);
    const parsed = parseMarkdown(text, file);
    findings.push(...parsed.findings);
    const outline = analysePage({ tree: parsed.tree, frontMatter: parsed.frontMatter, lang, file, id, entry });
    findings.push(...outline.findings);
    outlines[lang] = outline;
    findings.push(...pageTextFindings({ tree: parsed.tree, outline, lang, file, used, placeholderAllowed, names, fixtureNames, pair }));
  }
  const common = { id, repoDir, componentsDir, built, entry };
  const en = buildModel(outlines.en, { ...common, filePath: enPath, sourcePath: toPosix(relative(repoDir, enPath)) });
  const ar = buildModel(outlines.ar, {
    ...common, filePath: arPath, sourcePath: toPosix(relative(repoDir, arPath)),
    englishIds: en.ids, englishLevels: outlines.en.headings.map((heading) => heading.level),
  });
  findings.push(...en.findings, ...ar.findings);
  findings.push(...checkParity(outlines.en, outlines.ar, { enText, arText, id, exceptions: pair.exceptions ?? readArabicExceptions() }));

  const idOf = (outline, ids, node) => ids[outline.headings.findIndex((heading) => heading.node === node)];
  const groupEntries = {};
  for (const lang of LANGS) {
    const outline = outlines[lang];
    groupEntries[lang] = outline.groups.map((group) => {
      const item = { id, lang, example: group.example };
      if (group.check !== undefined) item.check = group.check;
      if (group.static) item.static = true;
      if (group.differences !== undefined) item.differences = group.differences;
      if (group.frame) item.frame = true;
      if (group.width !== undefined) item.width = group.width;
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
      if (group.static) item.static = true;
      if (group.differences !== undefined) item.differences = group.differences;
      if (group.frame) item.frame = true;
      if (group.width !== undefined) item.width = group.width;
      return item;
    }),
    keyboard: keyboardOf(outlines),
  };
  return { findings, models: { en: en.page, ar: ar.page }, groupEntries, manifestPage, crossLinks: [...en.crossLinks, ...ar.crossLinks] };
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
  const pendingIds = options.pending ?? readPending(options.pendingFile);
  const { ids, pending, findings } = listSources(names, known, dirLabel, pendingIds);
  const built = new Set(ids);
  const used = new Set();
  const files = new Set();
  const fixture = readFixture(componentsDir, repoDir);
  const claimExceptions = options.claimExceptions ?? readClaimExceptions();
  const liveExceptions = options.liveExceptions ?? readLiveComponentExceptions();
  const pages = [];
  const manifestPages = [];
  const liveGroups = [];
  const crossLinks = [];
  for (const id of ids) {
    const enPath = join(componentsDir, `${id}.md`);
    const arPath = join(componentsDir, `${id}.ar.md`);
    const result = processPair({
      id, entry: known.get(id), enText: readFileSync(enPath, 'utf8'), arText: readFileSync(arPath, 'utf8'),
      enPath, arPath, repoDir, componentsDir, built, used, fixture,
      fixtureEntry: fixture ? (known.get(fixture.showsComponent) ?? readComponents(join(repoDir, 'components.json')).get(fixture.showsComponent)) : null,
      claimExceptions, liveExceptions, names: options.names?.(id),
    });
    files.add(toPosix(relative(repoDir, enPath)));
    files.add(toPosix(relative(repoDir, arPath)));
    findings.push(...result.findings);
    crossLinks.push(...result.crossLinks);
    for (const lang of LANGS) {
      pages.push({ id, lang, page: result.models[lang] });
      liveGroups.push(...result.groupEntries[lang]);
    }
    manifestPages.push(result.manifestPage);
  }
  // An entry of the lead's lists of prose.mjs that names a built page and matches nothing fails.
  for (const [list, code, name] of [[claimExceptions, 'HWC-CLAIM', 'claim-exceptions.json'], [liveExceptions, 'HWC-LIVE7', 'live-component-exceptions.json']]) {
    list.forEach((entry, index) => {
      if (files.has(entry.file) && !used.has(entry)) findings.push(finding(code, `guide/scripts/content/${name}`, 1, `entry ${index + 1} (${entry.file}: ${entry.text ?? entry.example}) matches nothing; remove it`));
    });
  }
  // Fragments of links to other component pages name a heading of that page.
  const headingsOf = new Map(manifestPages.map((page) => [page.id, new Set(Object.values(page.headings).flat().map((heading) => heading.id))]));
  for (const link of crossLinks) {
    if (!headingsOf.get(link.id)?.has(link.fragment)) {
      findings.push(finding('HWC-LINK', link.file, link.line, `the link "${link.url}" names no heading of the page ${link.id}`));
    }
  }
  if (findings.length > 0 || options.write === false) return { findings, pages: pages.length, groups: liveGroups.length, pending, manifest: null };
  const manifest = writeOutputs({ guideDir, outDir, liveGroupsFile, pages, manifestPages, liveGroups, components: [...known.values()] });
  return { findings, pages: pages.length, groups: liveGroups.length, pending, manifest };
}

export { formatFinding };
