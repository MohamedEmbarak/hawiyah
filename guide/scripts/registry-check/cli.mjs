#!/usr/bin/env node
// node scripts/registry-check/cli.mjs [--dist <browserDir>] [--preview <tarballDir>] [--require-runtime]
// Strict mode by default. --preview is accepted only inside a preview build,
// which sets HAWIYAH_PREVIEW_BUILD=1 (build steps 05 and 90 call the library
// directly with the build context's tarball directory).

import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkRegistry, failureLines, successLines } from './check.mjs';

const guideDir = resolve(fileURLToPath(new URL('../..', import.meta.url)));

function parseArgs(argv) {
  const options = { mode: 'strict' };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = () => {
      const next = argv[index + 1];
      if (next === undefined || next.startsWith('--')) throw new Error(`${arg} needs a directory`);
      index += 1;
      return next;
    };
    if (arg === '--dist') { options.mode = 'dist'; options.distDir = value(); }
    else if (arg === '--preview') { options.mode = 'preview'; options.previewDir = value(); }
    else if (arg === '--require-runtime') options.requireRuntime = true;
    else throw new Error(`unknown argument ${arg}`);
  }
  // --preview with --dist checks a preview build's runtime files (step 90).
  if (options.previewDir) options.mode = 'preview';
  return options;
}

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`registry-check: ${error.message}`);
    return 2;
  }
  if (options.mode === 'preview' && process.env.HAWIYAH_PREVIEW_BUILD !== '1') {
    console.error('registry-check: --preview is only valid in a preview build');
    return 1;
  }
  const cwd = process.cwd();
  const result = await checkRegistry({
    guideDir,
    mode: options.mode,
    distDir: options.distDir ? resolve(cwd, options.distDir) : undefined,
    previewDir: options.previewDir ? resolve(cwd, options.previewDir) : undefined,
    requireRuntime: options.requireRuntime,
    // With --dist: the Angular metafiles beside the browser directory and the
    // runtime derived again, as in build step 90.
    metafiles: options.distDir
      ? ['browser-stats.json', 'server-stats.json'].map((name) => ({ label: name, file: resolve(cwd, options.distDir, '..', name) }))
      : [],
    derive: Boolean(options.distDir),
  });
  if (!result.ok) {
    for (const line of failureLines(result)) console.error(line);
    return 1;
  }
  const label = (dir) => relative(guideDir, resolve(cwd, dir)).split('\\').join('/') || '.';
  for (const line of successLines(result, {
    distLabel: options.distDir ? label(options.distDir) : '',
    previewLabel: options.previewDir ? label(options.previewDir) : '',
  })) console.log(line);
  return 0;
}

process.exitCode = await main();
