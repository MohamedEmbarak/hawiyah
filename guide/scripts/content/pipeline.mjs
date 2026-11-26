// The content step: reads docs/components/<id>.md and <id>.ar.md for each id
// in components.json, checks them (structure, links, live groups, parity) and,
// when no finding remains, writes the model, the manifest, the loaders and the
// live groups. Every finding of every file is collected before the step fails.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { H2, LANGS, finding, formatFinding } from './config.mjs';
import { DOCUMENT_KINDS, KINDS, TEMPLATE_H2, isKey, kindDirs, pageKey, parseKey, readIndex } from './kinds.mjs';
import { writeOutputs } from './manifest.mjs';
import { buildModel, inlineText } from './model.mjs';
import { checkParity, readArabicExceptions } from './parity.mjs';
import { parseMarkdown } from './parse.mjs';
import {
  blockShows, componentNames, emptyFindings, liveComponentFindings, readClaimExceptions, readLiveComponentExceptions, readMarketingTerms, textFindings,
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

/** Reads pending-translation.json: the keys it lists (<id> of a component page, guide:<id>, template:<id>). */
export function readPending(file = PENDING_FILE) {
  if (!existsSync(file)) return new Set();
  const data = JSON.parse(readFileSync(file, 'utf8'));
  const pages = data.pages ?? [];
  if (!Array.isArray(pages) || pages.some((id) => typeof id !== 'string' || !isKey(id))) {
    throw new Error('content: scripts/content/pending-translation.json must be { "pages": ["<id>" | "guide:<id>" | "template:<id>", ...] }');
  }
  return new Set(pages);
}

/** The ids of one kind among keys (pending-translation.json). */
export function idsOfKind(keys, kind) {
  return new Set([...keys].map(parseKey).filter((key) => key && key.kind === kind).map((key) => key.id));
}

/**
 * Checks the file names of the directory of a guide or template kind against its
 * index.json (HWC-FILE): every page is listed, every listed id has its English page, and
 * the language siblings exist, or the English page is pending translation. The contract
 * files of the kind (README.md; docs/guides/glossary.md) are not pages.
 * @param {{ names: string[], index: { ids: string[], error: string | null, exists: boolean }, dirLabel: string,
 *           kind: 'guide' | 'template', pending?: Set<string> }} input pending: ids of the kind
 * @returns {{ ids: string[], pending: string[], findings: any[] }} ids in the order of index.json
 */
export function listDocumentSources({ names, index, dirLabel, kind, pending = new Set() }) {
  const findings = [];
  const english = new Set();
  const arabic = new Set();
  const key = (id) => pageKey(kind, id);
  if (index.error) findings.push(finding('HWC-FILE', `${dirLabel}/index.json`, 1, index.error));
  const contract = new Set(KINDS[kind].contractFiles);
  for (const name of names.filter((entry) => entry.endsWith('.md') && !contract.has(entry)).sort()) {
    const file = `${dirLabel}/${name}`;
    const match = /^([a-z][a-z0-9-]*)(\.ar)?\.md$/.exec(name);
    if (!match) {
      findings.push(finding('HWC-FILE', file, 1, 'the file name is not <id>.md or <id>.ar.md'));
      continue;
    }
    const [, id, ar] = match;
    (ar ? arabic : english).add(id);
    if (!ar && !index.ids.includes(id) && !index.error) findings.push(finding('HWC-FILE', file, 1, `${id} is not listed in ${dirLabel}/index.json; add it to "pages" in the order of the guide`));
  }
  for (const id of index.ids) if (!english.has(id)) findings.push(finding('HWC-FILE', `${dirLabel}/index.json`, 1, `${dirLabel}/index.json lists ${id}, but ${dirLabel}/${id}.md does not exist`));
  const waiting = [];
  for (const id of english) {
    if (arabic.has(id)) continue;
    if (pending.has(id)) waiting.push(key(id));
    else findings.push(finding('HWC-FILE', `${dirLabel}/${id}.md`, 1, `the English page has no Arabic sibling ${id}.ar.md`));
  }
  for (const id of arabic) if (!english.has(id)) findings.push(finding('HWC-FILE', `${dirLabel}/${id}.ar.md`, 1, `the Arabic page has no English sibling ${id}.md`));
  for (const id of [...pending].sort()) {
    if (arabic.has(id)) findings.push(finding('HWC-FILE', 'guide/scripts/content/pending-translation.json', 1, `${key(id)} is listed as pending translation, but ${dirLabel}/${id}.ar.md exists; remove the entry`));
    else if (!english.has(id)) findings.push(finding('HWC-FILE', 'guide/scripts/content/pending-translation.json', 1, `${key(id)} is listed as pending translation, but ${dirLabel}/${id}.md does not exist`));
  }
  return { ids: index.ids.filter((id) => english.has(id) && arabic.has(id)), pending: waiting.sort(), findings };
}

/** The keys of the built guides and templates of the directories: listed in index.json, with both languages. */
export function builtDocuments(dirs) {
  const keys = [];
  for (const kind of DOCUMENT_KINDS) {
    const dir = dirs[kind];
    if (!dir || !existsSync(dir)) continue;
    const names = readdirSync(dir);
    for (const id of readIndex(dir).ids) if (names.includes(`${id}.md`) && names.includes(`${id}.ar.md`)) keys.push(pageKey(kind, id));
  }
  return keys;
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

/**
 * The placeholder of content:scaffold-ar --placeholder is accepted only in a page read from
 * outside docs/components, docs/guides and docs/templates.
 */
export const isPlaceholderAllowed = (dir, repoDir) => !Object.values(KINDS).some((def) => resolve(dir) === resolve(repoDir, 'docs', def.dir));

/** The required sections of an outline: the fixed ones of a component page or a template, every h2 of a guide. */
export function requiredSections(outline) {
  if (outline.kind === 'guide') return new Set(outline.sections.map((section) => section.id).filter(Boolean));
  if (outline.kind === 'template') return new Set(TEMPLATE_H2.map((entry) => entry.id));
  return REQUIRED_SECTIONS;
}

/**
 * HWC-COMP of a template: every component of its Composition section is a component of
 * components.json that some live group shows in all four frameworks, and every live group
 * shows a component of the section in each of its four blocks.
 * @param {{ outline: any, file: string, known: Map<string, any>, nodeModules: string, names?: (id: string) => any }} input
 */
export function compositionFindings({ outline, file, known, nodeModules, names = null }) {
  const findings = [];
  const listed = [];
  for (const item of outline.composition ?? []) {
    if (!known.has(item.id)) {
      findings.push(finding('HWC-COMP', file, item.line, `${item.id} is not a component id in components.json; the Composition section lists the components the template uses`));
      continue;
    }
    listed.push({ ...item, names: names ? names(item.id) : componentNames(item.id, known.get(item.id), nodeModules) });
  }
  const shows = (group, entry) => Object.entries(group.blocks).every(([framework, block]) => blockShows(framework, block.code, entry.names));
  for (const item of listed) {
    if (!outline.groups.some((group) => shows(group, item))) findings.push(finding('HWC-COMP', file, item.line, `no live group of the Example section shows ${item.id} in all four frameworks; list only the components the template uses`));
  }
  if (listed.length) {
    for (const group of outline.groups) {
      const missing = Object.entries(group.blocks).filter(([framework, block]) => !listed.some((item) => blockShows(framework, block.code, item.names))).map(([framework]) => framework);
      if (missing.length) findings.push(finding('HWC-COMP', file, group.line, `the live group "${group.example}" shows none of the components of the Composition section in ${missing.join(', ')}`));
    }
  }
  return findings;
}

/**
 * The text gates of prose.mjs on one page in one language (G2 and G3 of the 5a fix
 * round): claims, hollow sections, placeholders, marketing terms, install text and,
 * on a component page, the page's component in each live group (HWC-LIVE7); on a
 * template, its Composition (HWC-COMP). `pair` carries the lists a test passes
 * instead of the lead's files (claimExceptions, marketing, liveExceptions).
 */
export function pageTextFindings({ tree, outline, lang, file, used, placeholderAllowed, names, fixtureNames = null, pair = {}, known = null, nodeModules = null }) {
  const kind = outline.kind ?? 'component';
  return [
    ...textFindings({
      tree, groups: outline.groups, lang, file, compliance: COMPLIANCE[lang], used, placeholderAllowed,
      claimExceptions: pair.claimExceptions ?? readClaimExceptions(), marketing: pair.marketing ?? readMarketingTerms(),
    }),
    ...emptyFindings({ outline, file, compliance: COMPLIANCE[lang], isCaption: (node) => captionPrefix(node) !== null, required: requiredSections(outline) }),
    ...(kind === 'component'
      ? liveComponentFindings({ groups: outline.groups, file, names, exceptions: pair.liveExceptions ?? readLiveComponentExceptions(), used, fixtureNames })
      : []),
    ...(kind === 'template' && known ? compositionFindings({ outline, file, known, nodeModules, names: pair.compositionNames ?? null }) : []),
  ];
}

/**
 * The entry of a live group in live-groups.json (steps 25 and 80): its id is the key of
 * the page, so the group key <key>/<lang>/<example> of a guide or a template cannot be
 * that of a component page; a guide or a template group also carries its kind and its
 * Markdown file.
 */
export function groupEntry(group, { id, kind = 'component', lang, sourcePath }) {
  const item = { id, lang, example: group.example };
  if (kind !== 'component') {
    item.kind = kind;
    item.sourcePath = sourcePath;
  }
  if (group.check !== undefined) item.check = group.check;
  if (group.static) item.static = true;
  if (group.differences !== undefined) item.differences = group.differences;
  if (group.frame) item.frame = true;
  if (group.width !== undefined) item.width = group.width;
  item.blocks = Object.fromEntries(Object.entries(group.blocks).map(([framework, block]) => [framework, { lang: block.lang, form: block.form, code: block.code, line: block.line }]));
  return item;
}

/**
 * Checks one page pair and builds its models.
 * @param {{ id: string, kind?: 'component' | 'guide' | 'template', entry: any, enText: string, arText: string, enPath: string, arPath: string,
 *           repoDir: string, componentsDir?: string, dirs?: Record<string, string>, built: Set<string>, enLabel?: string, arLabel?: string }} pair
 *   id: the id inside the kind (the key of a guide is guide:<id>); entry: the components.json entry
 *   of a component page; built: the keys of the built pages. enLabel and arLabel replace the file
 *   paths in messages (tests read a file from elsewhere).
 */
export function processPair(pair) {
  const { id: slug, entry, enText, arText, enPath, arPath, repoDir, built } = pair;
  const kind = pair.kind ?? 'component';
  const id = pageKey(kind, slug);
  const repoDirs = kindDirs({ repoDir });
  const dirs = pair.dirs ?? { ...repoDirs, component: pair.componentsDir ?? repoDirs.component };
  const componentsDir = pair.componentsDir ?? dirs.component;
  const ownDir = kind === 'component' ? componentsDir : dirs[kind];
  const label = (path) => (path === enPath && pair.enLabel) || (path === arPath && pair.arLabel) || toPosix(relative(repoDir, path));
  const findings = [];
  const outlines = {};
  // The text gates of the fix round of 5a (prose.mjs): claims, hollow sections,
  // placeholders, marketing terms, install text and the page's component in each group.
  const used = pair.used ?? new Set();
  const nodeModules = join(repoDir, 'guide', 'node_modules');
  const names = kind === 'component' ? (pair.names ?? componentNames(slug, entry, nodeModules)) : null;
  const fixture = kind !== 'component' ? null : pair.fixture === undefined ? readFixture(componentsDir, repoDir) : pair.fixture;
  const fixtureNames = fixture ? componentNames(fixture.showsComponent, pair.fixtureEntry ?? null, nodeModules) : null;
  const placeholderAllowed = isPlaceholderAllowed(ownDir, repoDir);
  const known = kind === 'template' ? (pair.known ?? readComponents(join(repoDir, 'components.json'))) : null;
  for (const [lang, text, path] of [['en', enText, enPath], ['ar', arText, arPath]]) {
    const file = label(path);
    const parsed = parseMarkdown(text, file);
    findings.push(...parsed.findings);
    // An Arabic guide takes the section ids of its English page by position.
    const sectionIds = lang === 'ar' && kind === 'guide' ? outlines.en.sections.map((section) => section.id) : undefined;
    const outline = analysePage({ tree: parsed.tree, frontMatter: parsed.frontMatter, lang, file, id: slug, entry, kind, sectionIds });
    findings.push(...outline.findings);
    outlines[lang] = outline;
    findings.push(...pageTextFindings({ tree: parsed.tree, outline, lang, file, used, placeholderAllowed, names, fixtureNames, pair, known, nodeModules }));
  }
  const common = { id, slug, kind, repoDir, componentsDir, dirs, built, entry: kind === 'component' ? entry : null };
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
    groupEntries[lang] = outline.groups.map((group) => groupEntry(group, { id, kind, lang, sourcePath: toPosix(relative(repoDir, lang === 'en' ? enPath : arPath)) }));
  }
  const manifestPage = {
    id,
    ...(kind === 'component' ? {} : { kind, slug }),
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
  // The directories of guides and templates: options.dirs (--docs), else the repository's.
  const dirs = { ...kindDirs({ repoDir }), ...(options.dirs ?? {}), component: componentsDir };
  const pendingKeys = options.pending ?? readPending(options.pendingFile);
  const { ids, pending, findings } = listSources(names, known, dirLabel, idsOfKind(pendingKeys, 'component'));
  const documents = [];
  for (const kind of DOCUMENT_KINDS) {
    const dir = dirs[kind];
    if (!existsSync(dir)) continue;
    const listed = listDocumentSources({
      names: readdirSync(dir), index: readIndex(dir), dirLabel: toPosix(relative(repoDir, dir)), kind, pending: idsOfKind(pendingKeys, kind),
    });
    findings.push(...listed.findings);
    pending.push(...listed.pending);
    documents.push(...listed.ids.map((id) => ({ kind, id, dir })));
  }
  const built = new Set([...ids, ...documents.map((doc) => pageKey(doc.kind, doc.id))]);
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
      enPath, arPath, repoDir, componentsDir, dirs, built, used, fixture,
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
  // The guides and the templates, in the order of their index.json (a key per page: guide:<id>, template:<id>).
  for (const { kind, id, dir } of documents) {
    const enPath = join(dir, `${id}.md`);
    const arPath = join(dir, `${id}.ar.md`);
    const result = processPair({
      id, kind, entry: null, enText: readFileSync(enPath, 'utf8'), arText: readFileSync(arPath, 'utf8'),
      enPath, arPath, repoDir, componentsDir, dirs, built, used, known, claimExceptions, liveExceptions,
      compositionNames: options.compositionNames,
    });
    files.add(toPosix(relative(repoDir, enPath)));
    files.add(toPosix(relative(repoDir, arPath)));
    findings.push(...result.findings);
    crossLinks.push(...result.crossLinks);
    for (const lang of LANGS) {
      pages.push({ id: pageKey(kind, id), lang, page: result.models[lang] });
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
