#!/usr/bin/env node
// The scope of a build and whether its output may be deployed.
//
// A full production build (no --pages, --docs, --only or --generate-only, not a
// preview) is deployable. The scope options are for local gates: --pages limits
// step 80 to the groups of the named pages, --docs reads the component pages from
// another directory. Such a build, and every --only run, is not deployable: the
// final line and build-info.json say so, the plan leaves out step 90 (which refuses
// a build that is not deployable), and guide.yml refuses an output whose record
// <outDir>/build-info.json is missing or not deployable.
//
// --defer-equivalence leaves step 80 to the shard jobs of guide.yml: the build stays
// deployable only together with the merged report of every shard
// (scripts/equivalence/merge.mjs).
//
//   node scripts/build-scope.mjs --require-deployable [--dir dist]
//
// exits 1 unless <dir>/build-info.json records a deployable production build.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** File name of the record a build leaves in its output directory (dist/, not deployed itself). */
export const RECORD_FILE = 'build-info.json';

/**
 * The scope of a build from the options of scripts/build.mjs.
 * @param {{ configuration: string, generateOnly: boolean, only: string[] | null, preview: string | null,
 *           pages?: string[] | null, docs?: string | null, deferEquivalence?: boolean }} options
 */
export function scopeOf(options) {
  return {
    pages: options.pages ?? null,
    docs: options.docs ?? null,
    only: options.only ?? null,
    generateOnly: Boolean(options.generateOnly),
    equivalence: options.configuration !== 'production' || options.generateOnly ? 'none' : options.deferEquivalence ? 'deferred' : options.only ? 'partial' : options.pages ? 'pages' : 'all',
  };
}

/** The options that limit what a build covers (--pages, --docs, --only), as written on the command line. */
export function limits(options) {
  const out = [];
  if (options.pages) out.push(`--pages ${options.pages.join(',')}`);
  if (options.docs) out.push(`--docs ${options.docs}`);
  if (options.only) out.push(`--only ${options.only.join(',')}`);
  return out;
}

/** Why the output of a build is not deployable; empty for a deployable build. */
export function notDeployableReasons(options) {
  const reasons = limits(options);
  if (options.generateOnly) reasons.push('--generate-only');
  if (options.preview) reasons.push(`--preview ${options.preview}`);
  if (options.configuration !== 'production') reasons.push(`--configuration ${options.configuration}`);
  return reasons;
}

/** Reads <outDir>/build-info.json, or null. */
export function readRecord(outDir) {
  const file = join(outDir, RECORD_FILE);
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null;
}

/**
 * The hash of the content manifest of a build (G16 of the 5a fix round): the first 16
 * hex characters of the sha256 of src/generated/content/manifest.json, or null when the
 * file does not exist. The build record and every report of step 80 carry it, and the
 * merge of the shard reports compares them, so the shards are tied to one build.
 */
export function contentManifestHash(file) {
  if (!existsSync(file)) return null;
  return createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 16);
}

export function writeRecord(outDir, record) {
  writeFileSync(join(outDir, RECORD_FILE), `${JSON.stringify(record, null, 2)}\n`);
}

export function removeRecord(outDir) {
  rmSync(join(outDir, RECORD_FILE), { force: true });
}

/** Problems that keep a record from being deployed; empty when it may be deployed. */
export function deployProblems(record) {
  if (!record) return [`${RECORD_FILE} is missing: the output is not that of one complete build`];
  const problems = [];
  if (record.deployable !== true) problems.push(`the build is not deployable (${(record.notDeployable ?? []).join(', ') || 'no reason recorded'})`);
  if (record.configuration !== 'production') problems.push(`the configuration is ${record.configuration}, not production`);
  return problems;
}

function main(argv) {
  let dir = 'dist';
  let require = false;
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--require-deployable') require = true;
    else if (argv[i] === '--dir' && argv[i + 1] !== undefined) dir = argv[++i];
    else throw new Error(`build-scope: unknown argument ${argv[i]}`);
  }
  if (!require) throw new Error('usage: node scripts/build-scope.mjs --require-deployable [--dir dist]');
  const record = readRecord(resolve(dir));
  const problems = deployProblems(record);
  if (problems.length > 0) {
    console.log(`build-scope: ${dir}/ is not deployable: ${problems.join('; ')}`);
    process.exit(1);
  }
  const equivalence = record.scope?.equivalence === 'deferred' ? '; step 80 deferred: deployable only with the merged report of every shard' : '';
  console.log(`build-scope: ${dir}/ is the output of a deployable production build (${record.steps.length} steps${equivalence})`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.log(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
