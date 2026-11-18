#!/usr/bin/env node
// Compiles the live groups listed in a live-groups.json file.
//
//   node scripts/examples/cli.mjs [--groups <file>] [--out <dir>]
//
// --groups defaults to .cache/content/live-groups.json (written by step 20).
// --out defaults to .cache/examples; the native components go to src/generated/examples
// unless --out is given, in which case they go to <out>/generated so that a fixture
// run never replaces the guide's generated sources. Paths are relative to guide/.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileGroups } from './compile.mjs';
import { writeGenerated, writePayloads } from './write.mjs';

export const guideDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

export const DEFAULT_GROUPS = '.cache/content/live-groups.json';
export const DEFAULT_OUT = '.cache/examples';
export const DEFAULT_GENERATED = 'src/generated/examples';

/**
 * Reads, compiles and writes. Returns { findings, payloads, natives, written }.
 * Paths may be absolute or relative to the guide directory.
 */
export async function runExamples({ groups = DEFAULT_GROUPS, out = DEFAULT_OUT, generated = DEFAULT_GENERATED } = {}) {
  const groupsPath = resolve(guideDir, groups);
  if (!existsSync(groupsPath)) throw new Error(`${groups} does not exist; build step 20-content (scripts/content) writes it`);
  const list = JSON.parse(readFileSync(groupsPath, 'utf8'));
  const outDir = resolve(guideDir, out);
  const result = await compileGroups(list, { guideDir, workDir: outDir });
  writePayloads(result.payloads, join(outDir, 'frames'));
  const written = writeGenerated(result.natives, resolve(guideDir, generated));
  return { ...result, groups: list.length, written };
}

export function parseArgs(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => {
      const value = argv[i + 1];
      if (value === undefined || value.startsWith('--')) throw new Error(`${arg} needs a value`);
      i += 1;
      return value;
    };
    if (arg === '--groups') options.groups = next();
    else if (arg === '--out') options.out = next();
    else throw new Error(`unknown option ${arg}`);
  }
  if (options.out) options.generated = join(options.out, 'generated');
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const result = await runExamples(options);
  for (const finding of result.findings) console.log(finding.text);
  const summary = `examples: ${result.groups} groups, ${result.payloads.length} payloads, ${result.natives.length} native Angular components`;
  if (result.findings.length) {
    console.log(`${summary}; ${result.findings.length} finding(s)`);
    process.exit(1);
  }
  console.log(`${summary}; 0 findings`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`examples: ${error.message}`);
    process.exit(1);
  });
}
