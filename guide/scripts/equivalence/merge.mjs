#!/usr/bin/env node
// Joins the reports of the shards of step 80 (run.mjs --shard i/n --report <file>).
//
//   node scripts/equivalence/merge.mjs [--manifest src/generated/content/manifest.json] <report> ...
//
// Fails (exit 1, one 'HWE-MERGE ...' line per problem) unless the reports are the n
// shards 1..n of one run of the same pin over the same selection, without --pages or
// --only, each without a failure, every group key compared in exactly one shard, and
// the union of the compared keys is exactly the groups of the content manifest. A
// passing merge prints the summary line a run without --shard prints.
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FRAMEWORKS } from './compare.mjs';
import { summaryLine } from './run.mjs';

/** The group keys of the built pages: <id>/<lang>/<example> for every page, language and live group of the manifest. */
export function manifestKeys(manifest) {
  const keys = [];
  for (const page of manifest?.pages ?? []) {
    for (const lang of page.langs ?? []) for (const group of page.liveGroups ?? []) keys.push(`${page.id}/${lang}/${group.example}`);
  }
  return keys.sort();
}

/**
 * Merges shard reports. Returns { problems, summary, keys }: problems is empty when
 * the reports together compared exactly the groups of the manifest.
 * @param {{ file: string, report: any }[]} reports
 * @param {any} manifest The content manifest, or null when it cannot be read.
 */
export function mergeReports(reports, manifest) {
  const problems = [];
  if (reports.length === 0) return { problems: ['HWE-MERGE: no shard report given'], summary: null, keys: [] };
  const first = reports[0].report;
  const total = first?.scope?.shard?.total;
  const seen = new Map();
  for (const { file, report } of reports) {
    const shard = report?.scope?.shard;
    if (!shard) {
      problems.push(`HWE-MERGE ${file}: not the report of a shard (run.mjs --shard <i>/<n>)`);
      continue;
    }
    if (shard.total !== total) problems.push(`HWE-MERGE ${file}: shard ${shard.index}/${shard.total} belongs to a split into ${shard.total}, the first report to one into ${total}`);
    if (seen.has(shard.index)) problems.push(`HWE-MERGE ${file}: shard ${shard.index} is repeated (also ${seen.get(shard.index)})`);
    seen.set(shard.index, file);
    if (report.scope.pages || report.scope.only) problems.push(`HWE-MERGE ${file}: the shard ran with ${report.scope.pages ? '--pages' : '--only'}; a merge covers every group`);
    if (report.pin !== first.pin) problems.push(`HWE-MERGE ${file}: pin ${report.pin}, the first report has ${first.pin}`);
    if (JSON.stringify(report.selected) !== JSON.stringify(first.selected)) problems.push(`HWE-MERGE ${file}: the shard split another list of groups than the first report`);
    for (const line of report.failures ?? []) problems.push(`HWE-MERGE ${file}: the shard failed: ${line}`);
  }
  for (let index = 1; index <= (Number.isInteger(total) ? total : 0); index += 1) {
    if (!seen.has(index)) problems.push(`HWE-MERGE: the report of shard ${index}/${total} is missing`);
  }

  const compared = new Map();
  for (const { file, report } of reports) {
    for (const item of report?.compared ?? []) {
      if (compared.has(item.key)) problems.push(`HWE-MERGE ${file}: ${item.key} was compared in two shards (also ${compared.get(item.key).file})`);
      else compared.set(item.key, { ...item, file });
    }
  }
  const expected = manifest ? manifestKeys(manifest) : null;
  if (!expected) problems.push('HWE-MERGE src/generated/content/manifest.json: the content manifest cannot be read');
  else {
    const missing = expected.filter((key) => !compared.has(key));
    const extra = [...compared.keys()].filter((key) => !expected.includes(key)).sort();
    if (missing.length > 0) problems.push(`HWE-MERGE: ${missing.length} group(s) of the content manifest were compared in no shard: ${missing.join(', ')}`);
    if (extra.length > 0) problems.push(`HWE-MERGE: ${extra.length} compared group(s) belong to no built page: ${extra.join(', ')}`);
  }

  const items = [...compared.values()];
  const groupOf = (key) => key.split('/').filter((_, n) => n !== 1).join('/');
  const groups = new Set(items.map((item) => groupOf(item.key)));
  const languages = new Set(items.map((item) => item.key.split('/')[1]));
  const interacted = new Set(items.filter((item) => item.checks > 0).map((item) => groupOf(item.key)));
  const documented = new Set(reports.flatMap(({ report }) => (report?.documentedDifferences ?? []).map((entry) => entry.id)));
  const summary = summaryLine({
    groups: groups.size,
    languages: languages.size,
    frameworks: FRAMEWORKS.length,
    interactionChecks: items.reduce((sum, item) => sum + item.checks, 0),
    afterInteraction: interacted.size,
    restOnly: groups.size - interacted.size,
    documented: documented.size,
  });
  return { problems, summary: `${summary}; merged from ${reports.length} shards`, keys: [...compared.keys()].sort() };
}

function main(argv) {
  let manifestFile = 'src/generated/content/manifest.json';
  const files = [];
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--manifest' && argv[i + 1] !== undefined) manifestFile = argv[++i];
    else if (argv[i].startsWith('--')) throw new Error(`unknown option ${argv[i]}`);
    else files.push(argv[i]);
  }
  const reports = files.map((file) => ({ file, report: existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null }));
  for (const { file, report } of reports) if (!report) throw new Error(`HWE-MERGE ${file}: the report does not exist`);
  const manifest = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, 'utf8')) : null;
  const { problems, summary } = mergeReports(reports, manifest);
  if (problems.length > 0) {
    console.log(problems.join('\n'));
    process.exit(1);
  }
  console.log(summary);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.log(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
