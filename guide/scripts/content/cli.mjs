#!/usr/bin/env node
// Runs the content step outside the build.
//
//   node scripts/content/cli.mjs [--docs <dir>] [--out <dir>] [--components <file>]
//
// --docs        the components directory, or a directory that holds components/
//               (default ../docs/components)
// --components  components.json (default: <docs>/components.json when --docs holds
//               a components/ directory and that file exists, else ../components.json)
// --out         output directory (default src/generated/content); with --out,
//               live-groups.json is written to the same directory, else to
//               .cache/content/live-groups.json
//
// Prints every finding as '<code> <file>:<line>: <message>' and exits 1 when
// there is one.

import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatFinding } from './config.mjs';
import { componentsDirOf } from './hash.mjs';
import { kindDirs } from './kinds.mjs';
import { runContent } from './pipeline.mjs';

export const guideDir = resolve(fileURLToPath(new URL('../..', import.meta.url)));

export function parseArgs(argv) {
  const options = { docs: null, out: null, components: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const key = arg.replace(/^--/, '').split('=')[0];
    if (!['docs', 'out', 'components'].includes(key) || !arg.startsWith('--')) throw new Error(`content: unknown argument ${arg}`);
    if (arg.includes('=')) options[key] = arg.slice(arg.indexOf('=') + 1);
    else {
      if (argv[i + 1] === undefined) throw new Error(`content: ${arg} needs a value`);
      options[key] = argv[i + 1];
      i += 1;
    }
  }
  return options;
}

/** Resolves the paths of a content run from the CLI options. */
export function resolvePaths(options, cwd = process.cwd()) {
  const repoDir = resolve(guideDir, '..');
  const docs = options.docs ? resolve(cwd, options.docs) : join(repoDir, 'docs', 'components');
  const componentsDir = componentsDirOf(docs);
  let componentsFile = join(repoDir, 'components.json');
  if (options.components) componentsFile = resolve(cwd, options.components);
  else if (componentsDir !== docs && existsSync(join(docs, 'components.json'))) componentsFile = join(docs, 'components.json');
  const outDir = options.out ? resolve(cwd, options.out) : join(guideDir, 'src', 'generated', 'content');
  const liveGroupsFile = options.out ? join(outDir, 'live-groups.json') : join(guideDir, '.cache', 'content', 'live-groups.json');
  // Guides and templates: below --docs when it holds components/, else the repository's.
  const dirs = { ...kindDirs({ repoDir, docsDir: componentsDir !== docs ? docs : null }), component: componentsDir };
  return { guideDir, repoDir, componentsDir, componentsFile, outDir, liveGroupsFile, dirs };
}

function main() {
  const paths = resolvePaths(parseArgs(process.argv.slice(2)));
  const result = runContent(paths);
  for (const item of result.findings) process.stdout.write(`${formatFinding(item)}\n`);
  if (result.findings.length > 0) {
    process.stdout.write(`content: ${result.findings.length} finding(s); nothing written\n`);
    process.exit(1);
  }
  process.stdout.write(`content: ${result.pages} page(s), ${result.groups} live group(s) -> ${result.manifest.liveGroupsFile}\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}
