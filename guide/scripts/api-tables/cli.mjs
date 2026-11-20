#!/usr/bin/env node
// Step 30: checks the API tables of every built page against the installed
// adapter packages (members.mjs): names, kinds, required flags, types and
// defaults, and writes src/generated/parity.json with the members of all
// components of components.json, whether or not a page exists.
//
//   node scripts/api-tables/cli.mjs [--content <dir>] [--node-modules <dir>] [--components <file>]
//                                   [--exclusions <file>] [--defaults <file>] [--parity <file>]
//                                   [--live-groups <file>] [--vocabulary-exceptions <file>]
//   node scripts/api-tables/cli.mjs --declared-all [--node-modules <dir>] [--components <file>]
//
// --content is the output of step 20 (default src/generated/content: its
// manifest.json lists the built pages and pages/<id>.<lang>.json holds each
// model). Every finding is printed as 'HWC-APIX <file>: ...', and each finding of
// the vocabulary pass (vocabulary.mjs; the html live blocks come from
// --live-groups, default .cache/content/live-groups.json) as 'HWC-VOCAB <file>: ...';
// the exit code is 1 when any remains. --declared-all prints one line per id and framework of
// components.json with what the readers declare, and exits 1 on a reader error or
// an id without a target.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CODE, TABLES, apiTablesOf, blockText, compareTable, finding, formatFinding } from './compare.mjs';
import { checkLeadLists, readLeadLists } from './lists.mjs';
import { DEFAULT_DEFAULTS, DEFAULT_EXCLUSIONS, FRAMEWORKS, createReaders, declaredMembers } from './members.mjs';
import { generatedNote, stylesVersion } from './notes.mjs';
import { TARGET_OVERRIDES } from './targets.mjs';
import { DEFAULT_VOCABULARY_EXCEPTIONS, VOCAB_CODE, checkVocabulary, createVocabularyContext, readVocabularyExceptions } from './vocabulary.mjs';

export { formatFinding };

const here = dirname(fileURLToPath(import.meta.url));
export const guideDir = resolve(here, '..', '..');
export { DEFAULT_EXCLUSIONS, DEFAULT_DEFAULTS };

/** What step 30 compares, stated in its success line (with the counts of a run). */
export function comparedLine(stats) {
  return `${stats.tables} API tables of ${stats.pages} page models, ${stats.rows} rows: names, kinds, required flags, types and defaults match the installed packages `
    + `(types in the written form of scripts/api-tables/types.mjs; defaults from the published JavaScript of React, Vue and Angular, an em dash for a default that is absent, generated or computed, `
    + `and for vanilla options and stylesheet attributes unless defaults.json quotes the published line: ${stats.defaultsEntries} defaults.json entries; `
    + `${stats.stylesheetRows} rows of components without a controller compared with the styles contract and the attribute selectors of dist/styles.css, required flags not compared there; `
    + `${stats.excluded} rows of exclusions.json compared by name only; Vue slots read from the published build, ${stats.slotPatterns} slot patterns; ${stats.overrides} target overrides); `
    + `parity.json: members of ${stats.parity} components; `
    + `vocabulary: ${stats.vocabulary.codes} code values outside the API tables (${stats.vocabulary.terms} terms) and ${stats.vocabulary.markup} classes, hooks and data attributes of html live blocks exist in the installed packages (${stats.vocabulary.excepted} vocabulary-exceptions.json entries)`;
}

/** Declared members of every id, cached for a run. */
export function memberCache(readers) {
  const cache = new Map();
  return (id) => {
    if (!cache.has(id)) cache.set(id, declaredMembers(readers, id));
    return cache.get(id);
  };
}

/**
 * Checks the API tables of the given page models.
 * @param {{ pages: { id: string, lang: string, page: any }[], readers: any, members?: (id: string) => any }} input
 */
export function checkPages(input) {
  const { pages, readers } = input;
  const declared = input.members ?? memberCache(readers);
  const version = stylesVersion(readers.nodeModules);
  const findings = [];
  const seen = new Set();
  const once = (item) => {
    if (seen.has(item.message)) return;
    seen.add(item.message);
    findings.push(item);
  };
  const stats = { tables: 0, rows: 0, stylesheetRows: 0, excluded: 0 };
  for (const { id, lang, page } of pages) {
    const file = page.sourcePath ?? `docs/components/${id}${lang === 'ar' ? '.ar' : ''}.md`;
    const pageTables = apiTablesOf(page);
    const members = declared(id);
    for (const [h3, spec] of Object.entries(TABLES)) {
      const rows = pageTables[h3];
      const decl = members[spec.framework];
      for (const problem of [...decl.problems, ...decl.gaps]) findings.push(finding(file, `${spec.label} table cannot be checked: ${problem}`));
      for (const message of decl.findings) once(finding('scripts/api-tables/defaults.json', message));
      if (!rows) {
        findings.push(finding(file, `the API section has no ${spec.label} table`));
        continue;
      }
      if (decl.problems.length || decl.gaps.length) continue;
      stats.tables += 1;
      stats.rows += rows.length;
      if (decl.source === 'stylesheet') {
        stats.stylesheetRows += rows.length;
        stats.excluded += decl.members.filter((member) => member.from === 'exclusions.json').length;
        const note = generatedNote(lang, version);
        const after = blockText(pageTables.after?.[h3]);
        const isNote = pageTables.after?.[h3]?.type === 'alert' && pageTables.after[h3].kind === 'note' && after === note;
        if (decl.generatedNote && !isNote) findings.push(finding(file, `the JavaScript table of ${id} is read from the published stylesheet (no row of the styles contract names its classes); it is followed by the note "> [!NOTE] ${note}"`));
        if (!decl.generatedNote && isNote) findings.push(finding(file, `the JavaScript table of ${id} is followed by the note of a table read from the stylesheet, but the styles contract documents ${decl.classes.join(', ')}; remove the note`));
      }
      // A stylesheet table compares no required flag, except on the rows of a further controller (file-upload).
      const checkRequired = decl.source !== 'stylesheet' || decl.members.some((member) => member.controller);
      findings.push(...compareTable(rows, decl.members, { file, label: spec.label, checkRequired }));
    }
  }
  return { findings, ...stats };
}

/** The parity data of all components: their members per adapter, whether or not a page exists. */
export function parityData(readers, declared, version) {
  const components = [];
  const problems = [];
  for (const [id, entry] of readers.components) {
    const members = declared(id);
    const frameworks = {};
    for (const framework of FRAMEWORKS) {
      const decl = members[framework];
      for (const problem of decl.problems) problems.push(`${id} ${framework}: ${problem}`);
      frameworks[framework] = {
        source: decl.source,
        exports: decl.exports,
        members: decl.members.map((member) => ({
          name: member.name, kind: member.kind, required: member.required, type: member.type ?? null, default: member.default ?? null,
          ...(member.from ? { from: member.from } : {}),
        })),
        ...(decl.gaps.length ? { gaps: decl.gaps } : {}),
        ...(decl.source === 'stylesheet' ? { stylesheetOnly: decl.generatedNote } : {}),
      };
    }
    components.push({ id, name: entry.name, category: entry.category, frameworks });
  }
  return { data: { version, components }, problems };
}

/** Reads the built pages from the content output of step 20, checks them and writes parity.json. */
export function runApiTables(options = {}) {
  const contentDir = options.contentDir ?? join(guideDir, 'src', 'generated', 'content');
  const nodeModules = options.nodeModules ?? join(guideDir, 'node_modules');
  const componentsFile = options.componentsFile ?? join(guideDir, '..', 'components.json');
  const manifestFile = join(contentDir, 'manifest.json');
  if (!existsSync(manifestFile)) throw new Error(`api-tables: ${manifestFile} is missing; run step 20 first`);
  const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
  const pages = [];
  for (const entry of manifest.pages ?? []) {
    for (const lang of entry.langs ?? []) {
      pages.push({ id: entry.id, lang, page: JSON.parse(readFileSync(join(contentDir, 'pages', `${entry.id}.${lang}.json`), 'utf8')) });
    }
  }
  const readers = options.readers ?? createReaders({
    nodeModules, componentsFile, exclusionsFile: options.exclusionsFile ?? DEFAULT_EXCLUSIONS, defaultsFile: options.defaultsFile ?? DEFAULT_DEFAULTS, context: options.context,
  });
  const declared = memberCache(readers);
  const result = checkPages({ pages, readers, members: declared });
  // The vocabulary pass (HWC-VOCAB, vocabulary.mjs) over the same pages.
  const liveGroupsFile = options.liveGroupsFile ?? join(guideDir, '.cache', 'content', 'live-groups.json');
  const liveGroups = existsSync(liveGroupsFile) ? JSON.parse(readFileSync(liveGroupsFile, 'utf8')) : [];
  const vocabulary = checkVocabulary({
    pages, vocab: createVocabularyContext(readers, { repoDir: resolve(componentsFile, '..') }), declared, liveGroups,
    exceptions: options.vocabularyExceptions ?? readVocabularyExceptions(options.vocabularyExceptionsFile ?? DEFAULT_VOCABULARY_EXCEPTIONS),
  });
  result.findings.push(...vocabulary.findings);
  const lists = checkLeadLists(options.lists ?? readLeadLists(guideDir));
  for (const problem of lists.problems) result.findings.push(finding('scripts/api-tables/lists.mjs', problem));
  const version = stylesVersion(nodeModules);
  const parity = parityData(readers, declared, version);
  for (const problem of parity.problems) result.findings.push(finding('components.json', `the members of ${problem.split(':')[0]} cannot be read: ${problem.slice(problem.indexOf(':') + 2)}`));
  const parityFile = options.parityFile === undefined ? join(guideDir, 'src', 'generated', 'parity.json') : options.parityFile;
  if (parityFile && result.findings.length === 0) {
    mkdirSync(dirname(parityFile), { recursive: true });
    writeFileSync(parityFile, `${JSON.stringify(parity.data, null, 2)}\n`);
  }
  const stats = {
    tables: result.tables, pages: pages.length, rows: result.rows, stylesheetRows: result.stylesheetRows, excluded: result.excluded,
    defaultsEntries: readers.defaults.length, slotPatterns: Object.values(readers.slotPatterns).flat().length,
    overrides: Object.keys(TARGET_OVERRIDES).length, parity: parity.data.components.length, vocabulary: vocabulary.stats,
  };
  return { findings: result.findings, stats, pages: pages.length, tables: result.tables, parity: parity.data };
}

/** --declared-all: one line per id and framework. */
export function declaredAll(options = {}) {
  const nodeModules = options.nodeModules ?? join(guideDir, 'node_modules');
  const componentsFile = options.componentsFile ?? join(guideDir, '..', 'components.json');
  const readers = createReaders({ nodeModules, componentsFile });
  const lines = [];
  let readerErrors = 0;
  let members = 0;
  const withoutTarget = new Set();
  const gaps = [];
  for (const id of readers.components.keys()) {
    const declared = declaredMembers(readers, id);
    for (const framework of FRAMEWORKS) {
      const decl = declared[framework];
      members += decl.members.length;
      const counts = ['prop', 'option', 'event', 'slot', 'input', 'output', 'content']
        .map((kind) => [kind, decl.members.filter((member) => member.kind === kind).length]).filter(([, n]) => n > 0)
        .map(([kind, n]) => `${n} ${kind}${n === 1 ? '' : 's'}`).join(', ') || 'no members';
      const what = decl.source === 'stylesheet'
        ? `stylesheet (${decl.generatedNote ? 'no contract row: generated note' : `contract ${decl.contractFamilies.join(', ')}`}; classes ${decl.classes.join(', ')})`
        : decl.exports.join(', ');
      lines.push(`${id} ${framework}: ${what}: ${counts}`);
      for (const problem of decl.problems) {
        lines.push(`  reader error: ${problem}`);
        readerErrors += 1;
      }
      for (const message of decl.findings) {
        lines.push(`  defaults.json: ${message}`);
        readerErrors += 1;
      }
      for (const gap of decl.gaps) {
        lines.push(`  list gap: ${gap}`);
        gaps.push(`${id}: ${gap}`);
      }
      if (decl.missingTarget) withoutTarget.add(id);
    }
  }
  const summary = `api-tables: declared members of ${readers.components.size} ids in ${FRAMEWORKS.length} frameworks: ${members} members; `
    + `${readerErrors} reader errors; ${withoutTarget.size} ids without a target${withoutTarget.size ? ` (${[...withoutTarget].join(', ')})` : ''}; `
    + `${gaps.length} list gaps (dynamic Vue slots without a VUE_SLOT_PATTERNS entry; a page of such an id fails step 30 until the lead adds one)`;
  return { lines, summary, ok: readerErrors === 0 && withoutTarget.size === 0, gaps };
}

function parseArgs(argv) {
  const options = {};
  const keys = {
    '--content': 'contentDir', '--node-modules': 'nodeModules', '--components': 'componentsFile', '--exclusions': 'exclusionsFile',
    '--defaults': 'defaultsFile', '--parity': 'parityFile', '--live-groups': 'liveGroupsFile', '--vocabulary-exceptions': 'vocabularyExceptionsFile',
  };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--declared-all') {
      options.declaredAll = true;
      continue;
    }
    const key = keys[argv[i]];
    if (!key || argv[i + 1] === undefined) throw new Error(`api-tables: unknown or incomplete option ${argv[i]}`);
    options[key] = resolve(argv[i + 1]);
    i += 1;
  }
  return options;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.declaredAll) {
      const result = declaredAll(options);
      for (const line of result.lines) console.log(line);
      console.log(result.summary);
      process.exit(result.ok ? 0 : 1);
    }
    const result = runApiTables(options);
    for (const item of result.findings) console.log(formatFinding(item));
    if (result.findings.length) {
      console.log(`api-tables: ${result.findings.length} ${CODE} or ${VOCAB_CODE} finding(s) in ${result.pages} page model(s)`);
      process.exit(1);
    }
    console.log(`api-tables: ${comparedLine(result.stats)}`);
  } catch (error) {
    console.log(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
