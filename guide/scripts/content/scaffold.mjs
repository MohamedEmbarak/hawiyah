#!/usr/bin/env node
// content:scaffold: the English skeleton of a component page, written from the
// installed packages (5a.4): the h1 (components.json name), the fixed h2
// sections, the four API tables with their captions filled by
// scripts/api-tables/write.mjs (and the generated note of a table read from the
// stylesheet alone), and the compliance sentence that opens the section
// Platforms Code reference. It writes no summary, no other prose and no example:
// the writer adds them, then runs content:scaffold-ar.
//
//   npm run content:scaffold -- <id> [--docs <dir>] [--force]
//
// The file is docs/components/<id>.md (or <dir>/<id>.md, <dir>/components/<id>.md);
// an existing file is kept unless --force is given.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createReaders, declaredMembers } from '../api-tables/members.mjs';
import { generatedNoteMarkdown, stylesVersion } from '../api-tables/notes.mjs';
import { H3_FRAMEWORK, H3_TEXT, captionLine, tableSource } from '../api-tables/write.mjs';
import { H2 } from './config.mjs';
import { componentsDirOf } from './hash.mjs';

export const guideDir = resolve(fileURLToPath(new URL('../..', import.meta.url)));
export const repoDir = resolve(guideDir, '..');

export function complianceSentence(lang) {
  return JSON.parse(readFileSync(join(guideDir, 'src', 'app', 'i18n', 'compliance.json'), 'utf8'))[lang];
}

/** The problems that keep the tables of an id from being written (reader errors and list gaps). */
export function tableProblems(declared) {
  return Object.values(H3_FRAMEWORK).flatMap((framework) => [...declared[framework].problems, ...declared[framework].gaps, ...declared[framework].findings]
    .map((problem) => `${framework}: ${problem}`));
}

/** The API section of a page in a language (h2 to the last table or note). */
export function apiSection(lang, declared, entry, version) {
  const lines = [`## ${H2.find((item) => item.id === 'api')[lang]}`];
  for (const [h3, framework] of Object.entries(H3_FRAMEWORK)) {
    lines.push('', `### ${H3_TEXT[h3]}`, '', captionLine(h3, lang, declared, entry), '', tableSource(h3, lang, declared[framework].members));
    if (h3 === 'javascript' && declared.vanilla.source === 'stylesheet' && declared.vanilla.generatedNote) lines.push('', generatedNoteMarkdown(lang, version));
  }
  return lines.join('\n');
}

/** The English skeleton of a page. */
export function scaffoldPage(declared, entry, version) {
  const heading = (id) => `## ${H2.find((item) => item.id === id).en}`;
  return [
    `# ${entry.name}`,
    '',
    heading('example'),
    '',
    apiSection('en', declared, entry, version),
    '',
    heading('accessibility'),
    '',
    heading('rtl-and-localisation'),
    '',
    heading('platforms-code-reference'),
    '',
    complianceSentence('en'),
    '',
  ].join('\n');
}

function parseArgs(argv) {
  const options = { id: null, docs: join(repoDir, 'docs', 'components'), force: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--force') options.force = true;
    else if (arg === '--docs') {
      if (argv[i + 1] === undefined) throw new Error('--docs needs a directory');
      options.docs = resolve(argv[i + 1]);
      i += 1;
    } else if (!arg.startsWith('--') && options.id === null) options.id = arg;
    else throw new Error(`content:scaffold: unknown argument ${arg}`);
  }
  if (!options.id || !/^[a-z0-9-]+$/.test(options.id)) throw new Error('usage: npm run content:scaffold -- <id> [--docs <dir>] [--force]');
  return options;
}

function main(argv) {
  const options = parseArgs(argv);
  const nodeModules = join(guideDir, 'node_modules');
  const readers = createReaders({ nodeModules, componentsFile: join(repoDir, 'components.json') });
  const entry = readers.components.get(options.id);
  if (!entry) throw new Error(`content:scaffold: "${options.id}" is not a component id in components.json`);
  const declared = declaredMembers(readers, options.id);
  const problems = tableProblems(declared);
  if (problems.length) throw new Error(`content:scaffold: the tables of ${options.id} cannot be written:\n  ${problems.join('\n  ')}`);
  mkdirSync(options.docs, { recursive: true });
  const file = join(componentsDirOf(options.docs), `${options.id}.md`);
  if (existsSync(file) && !options.force) throw new Error(`content:scaffold: ${file} exists; it is kept (use content:api-tables to rewrite its tables, or --force)`);
  writeFileSync(file, scaffoldPage(declared, entry, stylesVersion(nodeModules)));
  process.stdout.write(`content:scaffold: wrote ${file}: h1, sections, four API tables and the compliance sentence; write the summary, the example and the prose\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}
