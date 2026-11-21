#!/usr/bin/env node
// check:page: the proof of one component page for its writer (5a.6 of
// milestone 5), run after one production build of the guide:
//
//   npm run check:page -- <id> [--lang en] [--draft] [--docs <dir>] [--workers <n>]
//
// It runs, for that page only, the content step (structure, links, live groups
// and, when the Arabic page exists, parity), the compile of its live groups, the
// API tables and the vocabulary pass of step 30, the glossary and compliance
// assertions of the script tests and the Latin-script guard of step 72 on the
// page's own Markdown (content/page-rules.mjs), the coverage report
// (leadAmendments A5, a report only) and step 80 for its groups in the languages
// that exist. It does not run the browser tests (npm run test:page) nor the parts
// of step 72 that need a prerendered document (icons, svg, emoji, and the Latin
// guard over the examples and the generated text: a --pages build). A finding in
// another page does not fail it. It writes only below
// .cache/page-<id>/ (live groups, compiled payloads, generated native examples,
// the equivalence report and diff images) and never into dist/ or src/generated/:
// step 80 serves the built dist/browser with the payloads of .cache/page-<id>/
// in place of dist/browser/examples/. So several writers can run it at once:
// step 80 takes a lock, so one check:page compares its groups at a time and the
// others wait (leadAmendments A8), and a second run for the same page waits until
// the first has ended.
//
// --lang en checks the English page alone (while its Arabic page is behind). An
// English page without its Arabic sibling is checked in English only, and only
// while scripts/content/pending-translation.json lists it. --draft leaves out
// HWE-KEYS (5a.8: the keys of the keyboard table equal the keys the steps of the
// page's checks press), since a check is written after the page; the steps that
// exist still assert their outcomes. check:page is a
// writer's tool: it never replaces the full build of a stage gate.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkPages, formatFinding as formatApiFinding, memberCache } from './api-tables/cli.mjs';
import { coverageLines, coverageOf } from './api-tables/coverage.mjs';
import { checkLeadLists, readLeadLists } from './api-tables/lists.mjs';
import { createReaders } from './api-tables/members.mjs';
import { checkVocabulary, createVocabularyContext, readVocabularyExceptions } from './api-tables/vocabulary.mjs';
import { formatFinding, LANGS } from './content/config.mjs';
import { componentsDirOf } from './content/hash.mjs';
import { buildModel, inlineText } from './content/model.mjs';
import { parseMarkdown } from './content/parse.mjs';
import { isPlaceholderAllowed, keyboardOf, pageTextFindings, processPair, readComponents, readFixture, readPending } from './content/pipeline.mjs';
import { pageRuleFindings } from './content/page-rules.mjs';
import { componentNames } from './content/prose.mjs';
import { analysePage } from './content/structure.mjs';
import { runEquivalence } from './equivalence/run.mjs';
import { runExamples } from './examples/cli.mjs';

const guideDir = resolve(fileURLToPath(new URL('..', import.meta.url)));
const repoDir = resolve(guideDir, '..');
export const LOCK_DIR = join(guideDir, '.cache', 'check-page');
const toPosix = (path) => path.split('\\').join('/');

export function parseArgs(argv) {
  const options = { id: null, lang: null, draft: false, docs: null, workers: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const value = () => {
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) throw new Error(`${arg} needs a value`);
      i += 1;
      return next;
    };
    if (arg === '--lang') options.lang = value();
    else if (arg === '--draft') options.draft = true;
    else if (arg === '--docs') options.docs = value();
    else if (arg === '--workers') options.workers = value();
    else if (!arg.startsWith('--') && options.id === null) options.id = arg;
    else throw new Error(`check:page: unknown argument ${arg}`);
  }
  if (!options.id || !/^[a-z0-9-]+$/.test(options.id)) throw new Error('usage: npm run check:page -- <id> [--lang en] [--draft] [--docs <dir>] [--workers <n>]');
  if (options.lang !== null && options.lang !== 'en') throw new Error('check:page: --lang takes en (the English page alone); without it every language that exists is checked');
  return options;
}

// ---------------------------------------------------------------------------
// Concurrency (leadAmendments A8): one lock file per run.

const alive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === 'EPERM';
  }
};

/** The other check:page runs whose process is alive: [{ pid, id }]. */
export function otherRuns(dir = LOCK_DIR) {
  if (!existsSync(dir)) return [];
  const runs = [];
  for (const name of readdirSync(dir).filter((item) => /^\d+\.json$/.test(item))) {
    let lock;
    try {
      lock = JSON.parse(readFileSync(join(dir, name), 'utf8'));
    } catch {
      continue; // being written or removed
    }
    if (lock.pid === process.pid) continue;
    if (alive(lock.pid)) runs.push(lock);
    else rmSync(join(dir, name), { force: true });
  }
  return runs;
}

/** Takes the lock of this run; waits while another run checks the same page. Returns the release function. */
export async function takeLock(id, { dir = LOCK_DIR, log = () => {}, timeoutMs = 30 * 60_000 } = {}) {
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${process.pid}.json`);
  const started = Date.now();
  for (;;) {
    const same = otherRuns(dir).filter((run) => run.id === id);
    if (same.length === 0) break;
    if (Date.now() - started > timeoutMs) throw new Error(`check:page: another check:page of ${id} (process ${same[0].pid}) has run for more than ${timeoutMs / 60_000} minutes`);
    log(`check:page: waiting for the check:page of ${id} in process ${same[0].pid}`);
    await new Promise((done) => setTimeout(done, 1000));
  }
  writeFileSync(file, JSON.stringify({ pid: process.pid, id, started: new Date().toISOString() }));
  // Two runs of the same page that started together: the one with the lower pid goes first.
  const twin = otherRuns(dir).find((run) => run.id === id && run.pid < process.pid);
  if (twin) {
    rmSync(file, { force: true });
    return takeLock(id, { dir, log, timeoutMs });
  }
  const release = () => rmSync(file, { force: true });
  process.once('exit', release);
  return release;
}

/**
 * The lock of step 80 (one comparison at a time on the machine): the file
 * equivalence.lock holds the pid of its owner; a lock whose process has ended is
 * taken over. Returns the release function.
 */
export async function takeEquivalenceLock({ dir = LOCK_DIR, log = () => {}, timeoutMs = 60 * 60_000 } = {}) {
  mkdirSync(dir, { recursive: true });
  const file = join(dir, 'equivalence.lock');
  const started = Date.now();
  let announced = false;
  for (;;) {
    try {
      writeFileSync(file, String(process.pid), { flag: 'wx' });
      const release = () => {
        try {
          if (readFileSync(file, 'utf8') === String(process.pid)) rmSync(file, { force: true });
        } catch {
          // already gone
        }
      };
      process.once('exit', release);
      return release;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
    let owner = NaN;
    try {
      owner = Number(readFileSync(file, 'utf8'));
    } catch {
      continue;
    }
    if (!Number.isInteger(owner) || !alive(owner)) {
      rmSync(file, { force: true });
      continue;
    }
    if (Date.now() - started > timeoutMs) throw new Error(`check:page: step 80 of process ${owner} has held the lock for more than ${timeoutMs / 60_000} minutes`);
    if (!announced) log(`check:page: step 80 of another check:page (process ${owner}) is running; waiting`);
    announced = true;
    await new Promise((done) => setTimeout(done, 500));
  }
}

// ---------------------------------------------------------------------------
// The content step for one page.

/** The English page alone: its model and live groups, without parity (a page pending translation, or --lang en). */
export function processEnglish({ id, entry, enText, enPath, componentsDir, built }) {
  const file = toPosix(relative(repoDir, enPath));
  const parsed = parseMarkdown(enText, file);
  const outline = analysePage({ tree: parsed.tree, frontMatter: parsed.frontMatter, lang: 'en', file, id, entry });
  const model = buildModel(outline, { id, repoDir, componentsDir, built, entry, filePath: enPath, sourcePath: file });
  const names = componentNames(id, entry, join(guideDir, 'node_modules'));
  const fixture = readFixture(componentsDir, repoDir);
  const fixtureNames = fixture ? componentNames(fixture.showsComponent, readComponents(join(repoDir, 'components.json')).get(fixture.showsComponent), join(guideDir, 'node_modules')) : null;
  const text = pageTextFindings({ tree: parsed.tree, outline, lang: 'en', file, used: new Set(), placeholderAllowed: isPlaceholderAllowed(componentsDir, repoDir), names, fixtureNames });
  const groups = outline.groups.map((group) => {
    const item = { id, lang: 'en', example: group.example };
    if (group.check !== undefined) item.check = group.check;
    if (group.static) item.static = true;
    if (group.differences !== undefined) item.differences = group.differences;
    if (group.frame) item.frame = true;
    if (group.width !== undefined) item.width = group.width;
    item.blocks = Object.fromEntries(Object.entries(group.blocks).map(([framework, block]) => [framework, { lang: block.lang, form: block.form, code: block.code, line: block.line }]));
    return item;
  });
  const manifestPage = {
    id, langs: ['en'], title: { en: model.page.title }, summaryText: { en: inlineText(model.page.summary) }, headings: { en: model.page.headings },
    liveGroups: outline.groups.map((group) => ({ example: group.example, frameworks: 4, ...(group.check !== undefined ? { check: group.check } : {}), ...(group.static ? { static: true } : {}), ...(group.frame ? { frame: true } : {}), ...(group.width !== undefined ? { width: group.width } : {}) })),
    keyboard: keyboardOf({ en: outline }),
  };
  return { findings: [...parsed.findings, ...outline.findings, ...text, ...model.findings], models: { en: model.page }, groupEntries: { en: groups }, manifestPage, crossLinks: model.crossLinks };
}

/**
 * The content step of one page: { langs, findings, models, groups, manifest, pending }.
 * @param {{ id: string, lang: string | null, componentsDir: string, componentsFile: string, pendingFile?: string }} options
 */
export function pageContent(options) {
  const { id, componentsDir } = options;
  const known = readComponents(options.componentsFile);
  const entry = known.get(id);
  if (!entry) throw new Error(`check:page: "${id}" is not a component id in components.json`);
  const enPath = join(componentsDir, `${id}.md`);
  const arPath = join(componentsDir, `${id}.ar.md`);
  const dirLabel = toPosix(relative(repoDir, componentsDir));
  if (!existsSync(enPath)) throw new Error(`check:page: ${dirLabel}/${id}.md does not exist`);
  const pending = readPending(options.pendingFile);
  const findings = [];
  const hasArabic = existsSync(arPath);
  if (!hasArabic && !pending.has(id)) {
    findings.push({ code: 'HWC-FILE', file: `${dirLabel}/${id}.md`, line: 1, message: `the English page has no Arabic sibling ${id}.ar.md` });
  }
  if (hasArabic && pending.has(id)) {
    findings.push({ code: 'HWC-FILE', file: 'guide/scripts/content/pending-translation.json', line: 1, message: `${id} is listed as pending translation, but ${dirLabel}/${id}.ar.md exists; remove the entry` });
  }
  const names = readdirSync(componentsDir);
  const built = new Set(names.filter((name) => /^[a-z0-9-]+\.md$/.test(name)).map((name) => name.slice(0, -3)).filter((other) => names.includes(`${other}.ar.md`) && known.has(other)));
  const both = hasArabic && options.lang !== 'en';
  const enText = readFileSync(enPath, 'utf8');
  const result = both
    ? processPair({ id, entry, enText, arText: readFileSync(arPath, 'utf8'), enPath, arPath, repoDir, componentsDir, built })
    : processEnglish({ id, entry, enText, enPath, componentsDir, built });
  findings.push(...result.findings);
  const langs = both ? [...LANGS] : ['en'];
  // A fragment of a link to another built page names one of its headings.
  for (const link of result.crossLinks) {
    if (!built.has(link.id)) continue;
    const other = processPair({
      id: link.id, entry: known.get(link.id), enText: readFileSync(join(componentsDir, `${link.id}.md`), 'utf8'), arText: readFileSync(join(componentsDir, `${link.id}.ar.md`), 'utf8'),
      enPath: join(componentsDir, `${link.id}.md`), arPath: join(componentsDir, `${link.id}.ar.md`), repoDir, componentsDir, built, exceptions: [],
    });
    const headings = new Set(Object.values(other.manifestPage.headings).flat().map((heading) => heading.id));
    if (!headings.has(link.fragment)) findings.push({ code: 'HWC-LINK', file: link.file, line: link.line, message: `the link "${link.url}" names no heading of the page ${link.id}` });
  }
  const groups = langs.flatMap((lang) => result.groupEntries[lang]);
  const manifestPage = { ...result.manifestPage, langs };
  return { entry, langs, findings, models: result.models, groups, manifest: { pages: [manifestPage] }, pending: !hasArabic };
}

// ---------------------------------------------------------------------------

function stage(log, name, started, findings, extra = '') {
  log(`check:page: ${name} ${findings.length ? `FAILED (${findings.length} finding(s))` : 'ok'} (${Date.now() - started} ms)${extra}`);
}

/**
 * Runs check:page. Returns { ok, findings: string[], timings: { [stage]: ms }, lines }.
 * Options: id, lang, draft, docs, workers, basePath, log, browserDir, pendingFile, lockDir.
 */
export async function checkPage(options) {
  const log = options.log ?? ((line) => console.log(line));
  const id = options.id;
  const timings = {};
  const failures = [];
  const browserDir = options.browserDir ?? 'dist/browser';
  if (!existsSync(join(guideDir, browserDir, 'runtime', 'import-map.json'))) {
    throw new Error(`check:page: ${browserDir}/runtime/import-map.json does not exist; run HAWIYAH_BASE_PATH=/hawiyah/ npm run build once first`);
  }
  const release = await takeLock(id, { dir: options.lockDir ?? LOCK_DIR, log });
  const startedAll = Date.now();
  try {
    const pageDir = join(guideDir, '.cache', `page-${id}`);
    rmSync(pageDir, { recursive: true, force: true });
    mkdirSync(pageDir, { recursive: true });

    // 1. Content.
    let started = Date.now();
    const componentsDir = options.docs ? componentsDirOf(resolve(options.docs)) : join(repoDir, 'docs', 'components');
    const content = pageContent({ id, lang: options.lang ?? null, componentsDir, componentsFile: join(repoDir, 'components.json'), pendingFile: options.pendingFile });
    const contentLines = content.findings.map(formatFinding);
    failures.push(...contentLines);
    contentLines.forEach((line) => log(line));
    timings.content = Date.now() - started;
    stage(log, 'content', started, contentLines, ` ${content.langs.join(' and ')}${content.pending ? ', Arabic page pending translation' : ''}`);
    if (contentLines.length && !content.groups.length && !content.models.en) return finish();

    // 1b. The rules of the page that the build checks outside step 20 (G8 of the 5a fix round):
    // the glossary and compliance assertions of the script tests and the Latin-script guard of step 72.
    started = Date.now();
    const source = (lang) => {
      const path = join(componentsDir, `${id}${lang === 'ar' ? '.ar' : ''}.md`);
      return content.langs.includes(lang) && existsSync(path) ? { text: readFileSync(path, 'utf8'), file: toPosix(relative(repoDir, path)) } : null;
    };
    const ruleLines = pageRuleFindings({ id, en: source('en'), ar: source('ar') }).map(formatFinding);
    failures.push(...ruleLines);
    ruleLines.forEach((line) => log(line));
    timings.rules = Date.now() - started;
    stage(log, 'glossary, compliance and Latin-script rules', started, ruleLines);
    const groupsFile = join(pageDir, 'live-groups.json');
    const manifestFile = join(pageDir, 'manifest.json');
    writeFileSync(groupsFile, `${JSON.stringify(content.groups, null, 2)}\n`);
    writeFileSync(manifestFile, `${JSON.stringify(content.manifest, null, 2)}\n`);

    // 2. Compile of the live groups (step 25 for this page).
    started = Date.now();
    const compiled = await runExamples({ groups: groupsFile, out: join(pageDir, 'examples'), generated: join(pageDir, 'examples', 'generated') });
    const compileLines = compiled.findings.map((finding) => finding.text);
    failures.push(...compileLines);
    compileLines.forEach((line) => log(line));
    timings.compile = Date.now() - started;
    stage(log, 'compile', started, compileLines, ` ${compiled.groups} groups, ${compiled.payloads.length} payloads`);

    // 3. API tables, vocabulary and the lead's lists (step 30 for this page).
    started = Date.now();
    const readers = createReaders({ nodeModules: join(guideDir, 'node_modules'), componentsFile: join(repoDir, 'components.json') });
    const declared = memberCache(readers);
    const pages = content.langs.filter((lang) => content.models[lang]).map((lang) => ({ id, lang, page: content.models[lang] }));
    const api = checkPages({ pages, readers, members: declared });
    const vocabulary = checkVocabulary({ pages, vocab: createVocabularyContext(readers, { repoDir }), declared, liveGroups: content.groups, exceptions: readVocabularyExceptions() });
    const lists = checkLeadLists(readLeadLists(guideDir)).problems.map((problem) => `HWC-APIX scripts/api-tables/lists.mjs: ${problem}`);
    const apiLines = [...api.findings.map(formatApiFinding), ...vocabulary.findings.map(formatApiFinding), ...lists];
    failures.push(...apiLines);
    apiLines.forEach((line) => log(line));
    timings.api = Date.now() - started;
    stage(log, 'api-tables and vocabulary', started, apiLines, ` ${api.tables} tables, ${api.rows} rows, ${vocabulary.stats.codes} code values, ${vocabulary.stats.markup} markup names`);

    // 4. Coverage report (leadAmendments A5): a report, never a failure.
    if (content.models.en) {
      const groupsEn = content.groups.filter((group) => group.lang === 'en');
      for (const line of coverageLines(coverageOf({ id, page: content.models.en, groups: groupsEn, declared: declared(id) }))) log(line);
    }

    // 5. Step 80 for the groups of the page.
    started = Date.now();
    if (compileLines.length) {
      log('check:page: equivalence not run: the live groups do not compile');
    } else if (!content.groups.length) {
      log('check:page: equivalence not run: the page has no live group');
    } else {
      // One step 80 at a time (leadAmendments A8): a run waits while another check:page compares its groups.
      const releaseEquivalence = await takeEquivalenceLock({ dir: options.lockDir ?? LOCK_DIR, log });
      const waited = Date.now() - started;
      started = Date.now();
      try {
        const report = await runEquivalence({
          guideDir, browserDir, basePath: options.basePath ?? process.env.HAWIYAH_BASE_PATH ?? '/hawiyah/',
          groupsFile, manifestFile, outDir: join(pageDir, 'equivalence'), examplesDir: join(pageDir, 'examples', 'frames'),
          workers: options.workers ?? undefined, log: (line) => log(`  ${line}`),
          keys: !options.draft, keyReport: true,
        });
        log(report.summary);
      } catch (error) {
        const lines = (error instanceof Error ? error.message : String(error)).split('\n');
        failures.push(...lines);
        lines.forEach((line) => log(line));
      } finally {
        releaseEquivalence();
      }
      timings.equivalence = Date.now() - started;
      timings.waited = waited;
      if (waited > 1000) log(`check:page: waited ${waited} ms for another check:page to finish its step 80`);
      stage(log, 'equivalence', started, failures.filter((line) => /^HWE-/.test(line)));
    }
    if (options.draft) log('check:page: --draft: HWE-KEYS left out (the keys of the keyboard table are not bound to the steps of the checks); the build and check:page without --draft apply it');
    return finish();
  } finally {
    release();
  }

  function finish() {
    const seconds = ((Date.now() - startedAll) / 1000).toFixed(1);
    const line = failures.length
      ? `check:page: ${id} FAILED with ${failures.length} finding(s) in ${seconds} s`
      : `check:page: ${id} OK in ${seconds} s (content ${timings.content ?? 0} ms, compile ${timings.compile ?? 0} ms, api-tables and vocabulary ${timings.api ?? 0} ms, equivalence ${timings.equivalence ?? 0} ms); not deployable, the full build remains the gate`;
    log(line);
    return { ok: failures.length === 0, findings: failures, timings };
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = await checkPage(options);
    process.exit(result.ok ? 0 : 1);
  } catch (error) {
    console.log(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
