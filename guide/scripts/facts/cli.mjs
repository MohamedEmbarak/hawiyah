#!/usr/bin/env node
// content:facts: writes the fact sheet of a component (facts.mjs) as
// <out>/<id>.json and <out>/<id>.md. The default <out> is .cache/facts/, which
// Git ignores; the sheets are generated output for page writers, never committed,
// and nothing in the build or the application reads them.
//
//   npm run content:facts -- <id> | --all [--out <dir>]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createReaders } from '../api-tables/members.mjs';
import { stylesVersion } from '../api-tables/notes.mjs';
import { loadPublished } from '../api-tables/published-js.mjs';
import { enhanceHooks, factSheet, factSheetMarkdown, readSources } from './facts.mjs';

export const guideDir = resolve(fileURLToPath(new URL('../..', import.meta.url)));
export const repoDir = resolve(guideDir, '..');

function parseArgs(argv) {
  const options = { ids: null, all: false, out: join(guideDir, '.cache', 'facts') };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--all') options.all = true;
    else if (arg === '--out') {
      if (argv[i + 1] === undefined) throw new Error('--out needs a directory');
      options.out = resolve(argv[i + 1]);
      i += 1;
    } else if (!arg.startsWith('--')) (options.ids ??= []).push(arg);
    else throw new Error(`content:facts: unknown argument ${arg}`);
  }
  if (!options.all && !options.ids) throw new Error('usage: npm run content:facts -- <id> | --all [--out <dir>]');
  return options;
}

function main(argv) {
  const options = parseArgs(argv);
  const nodeModules = join(guideDir, 'node_modules');
  const readers = createReaders({ nodeModules, componentsFile: join(repoDir, 'components.json') });
  const ids = options.all ? [...readers.components.keys()] : options.ids;
  for (const id of ids) if (!readers.components.has(id)) throw new Error(`content:facts: "${id}" is not a component id in components.json`);
  const version = stylesVersion(nodeModules);
  const sources = readSources(guideDir, repoDir, version);
  sources.vanilla = loadPublished(nodeModules, '@hawiyah/vanilla');
  sources.enhanceHooks = enhanceHooks(sources.vanilla);
  mkdirSync(options.out, { recursive: true });
  let problems = 0;
  for (const id of ids) {
    const sheet = factSheet(readers, id, sources);
    problems += sheet.problems.length;
    writeFileSync(join(options.out, `${id}.json`), `${JSON.stringify(sheet, null, 2)}\n`);
    writeFileSync(join(options.out, `${id}.md`), factSheetMarkdown(sheet));
  }
  process.stdout.write(`content:facts: ${ids.length} fact sheet(s) in ${options.out} (${problems} reader problem(s))\n`);
  if (problems) process.exit(1);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}
