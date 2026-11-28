#!/usr/bin/env node
// The union of the browser tests run in shards (playwright test --shard=i/n).
//
//   node scripts/e2e/merge.mjs --list <list.json> --used <dir> [--used <dir> ...] <report.json> ...
//
// list.json is `playwright test --project=prod --list --reporter=json` of the same
// build; each report.json is the JSON report of one shard; each --used directory is
// the structure-used/ directory of a shard's output (tests/e2e/support/structure-used.ts).
// Fails (exit 1, one 'HWT-MERGE ...' line per problem) unless every listed test ran in
// exactly one shard and passed, no shard ran a test the list lacks, and the structural
// half of the styling rule ran on every prerendered page and both opened states with
// every listed declaration used by a rule on some page (structureUnion).
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expectedDocuments } from '../postbuild/verify-routes.mjs';

/** Every test of a JSON report as { key, title, status }: key = spec id and project. */
export function reportTests(report) {
  const out = [];
  const walk = (suite, path) => {
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        const last = test.results?.at(-1);
        out.push({ key: `${spec.id} ${test.projectName}`, title: `${spec.file} › ${[...path, spec.title].join(' › ')} [${test.projectName}]`, status: last?.status ?? 'not run' });
      }
    }
    for (const child of suite.suites ?? []) walk(child, [...path, child.title]);
  };
  for (const suite of report?.suites ?? []) walk(suite, []);
  return out;
}

/**
 * Problems of the union of shard reports against the list of the build: every listed
 * test passed in exactly one report, and no report holds a test that is not listed.
 */
export function testCoverage(list, reports) {
  const problems = [];
  const listed = new Map(reportTests(list).map((test) => [test.key, test]));
  if (listed.size === 0) problems.push('HWT-MERGE: the list of tests is empty');
  const ran = new Map();
  for (const { file, report } of reports) {
    for (const test of reportTests(report)) {
      if (!listed.has(test.key)) problems.push(`HWT-MERGE ${file}: ${test.title} is not in the list of the build`);
      if (ran.has(test.key)) problems.push(`HWT-MERGE ${file}: ${test.title} ran in two shards (also ${ran.get(test.key).file})`);
      else ran.set(test.key, { ...test, file });
    }
  }
  for (const [key, test] of listed) {
    const result = ran.get(key);
    if (!result) problems.push(`HWT-MERGE: ${test.title} ran in no shard`);
    else if (result.status !== 'passed') problems.push(`HWT-MERGE ${result.file}: ${test.title} ended ${result.status}`);
  }
  return { problems, tests: listed.size, ran: ran.size };
}

/** The labels the structure tests write: every page document by its route, and the two opened states. */
export function structureLabels(documents) {
  const pages = documents.filter((doc) => doc.kind === 'page').map((doc) => (doc.route === '' ? 'root document' : doc.route === '404' ? '404 document' : doc.route));
  return [...pages, 'opened states (ar)', 'opened states (en)'];
}

/** Reads the files of structure-used directories: [{ label, used, listed }]. */
export function readUsed(dirs) {
  const out = [];
  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir).filter((entry) => entry.endsWith('.json')).sort()) out.push({ file: join(dir, name), ...JSON.parse(readFileSync(join(dir, name), 'utf8')) });
  }
  return out;
}

/**
 * The union of the structure results: a result for every label, one listed set in
 * all of them, and every listed declaration used by a rule on some page. Returns
 * { complete, missing, problems, unused }: complete is false when a label has no
 * result (a filtered or sharded run), and then nothing else is judged.
 */
export function structureUnion(results, labels) {
  const have = new Set(results.map((result) => result.label));
  const missing = labels.filter((label) => !have.has(label));
  if (missing.length > 0) return { complete: false, missing, problems: [], unused: [] };
  const problems = [];
  const listed = results[0]?.listed ?? [];
  for (const result of results) {
    if (JSON.stringify(result.listed) !== JSON.stringify(listed)) problems.push(`HWT-UNION ${result.file}: lists other declarations than ${results[0].file}`);
  }
  const used = new Set(results.flatMap((result) => result.used));
  const unused = listed.filter((key) => !used.has(key));
  for (const key of unused) problems.push(`HWT-UNION: listed declaration used by no rule on any page: ${key}`);
  return { complete: true, missing, problems, unused };
}

/** The page documents of a build, from its src/generated/features.json and content manifest. */
export function buildDocuments(guideDir) {
  const generated = join(guideDir, 'src', 'generated');
  const features = JSON.parse(readFileSync(join(generated, 'features.json'), 'utf8'));
  const manifestFile = join(generated, 'content', 'manifest.json');
  const manifest = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, 'utf8')) : null;
  return expectedDocuments({ features, manifest });
}

export function parseArgs(argv) {
  const options = { list: null, used: [], reports: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const value = () => {
      if (argv[i + 1] === undefined) throw new Error(`${argv[i]} needs a value`);
      return argv[++i];
    };
    if (argv[i] === '--list') options.list = value();
    else if (argv[i] === '--used') options.used.push(value());
    else if (argv[i].startsWith('--')) throw new Error(`unknown option ${argv[i]}`);
    else options.reports.push(argv[i]);
  }
  if (!options.list || options.reports.length === 0 || options.used.length === 0) throw new Error('usage: node scripts/e2e/merge.mjs --list <list.json> --used <dir> ... <report.json> ...');
  return options;
}

function main(argv) {
  const options = parseArgs(argv);
  const guideDir = resolve(fileURLToPath(new URL('../..', import.meta.url)));
  const read = (file) => JSON.parse(readFileSync(file, 'utf8'));
  const coverage = testCoverage(read(options.list), options.reports.map((file) => ({ file, report: read(file) })));
  const labels = structureLabels(buildDocuments(guideDir));
  const union = structureUnion(readUsed(options.used), labels);
  const problems = [...coverage.problems, ...union.problems];
  if (!union.complete) problems.push(`HWT-UNION: no structure result for ${union.missing.join(', ')}`);
  if (problems.length > 0) {
    console.log(problems.join('\n'));
    process.exit(1);
  }
  console.log(`e2e: ${coverage.tests} tests of the build passed in ${options.reports.length} shards; the structural half of the styling rule ran on ${labels.length - 2} pages and 2 opened states, every listed declaration used`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.log(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
