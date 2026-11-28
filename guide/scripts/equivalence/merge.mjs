#!/usr/bin/env node
// Joins the reports of the shards of step 80 (run.mjs --shard i/n --report <file>).
//
//   node scripts/equivalence/merge.mjs [--manifest src/generated/content/manifest.json] [--record dist/build-info.json] <report> ...
//
// Fails (exit 1, one 'HWE-MERGE ...' line per problem) unless the reports are the n
// shards 1..n of one run of the same pin over the same selection, without --pages or
// --only, each without a failure, every group key compared in exactly one shard, and
// the union of the compared keys is exactly the groups of the content manifest, and
// unless every entry of angular-hosts.json matched an element in the Angular result
// of a group of its component in one of the shards (an entry of a component without
// a group whose page exists, a page pending translation, is not judged). A passing merge prints the
// summary line a run without --shard prints.
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contentManifestHash } from '../build-scope.mjs';
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
export function mergeReports(reports, manifest, identity = null) {
  const problems = [];
  if (reports.length === 0) return { problems: ['HWE-MERGE: no shard report given'], summary: null, keys: [] };
  const first = reports[0].report;
  // The shards belong to one build: each report carries the hash of the
  // content manifest it compared, equal to that of the manifest given and of the build record.
  if (identity) {
    for (const { file, report } of reports) {
      if (report?.contentManifest !== identity.manifest) problems.push(`HWE-MERGE ${file}: the shard compared the content manifest ${report?.contentManifest ?? '(none recorded)'}, the build has ${identity.manifest ?? '(none)'}`);
    }
    if (identity.record !== undefined && identity.record !== identity.manifest) problems.push(`HWE-MERGE ${identity.recordFile}: the build record has the content manifest ${identity.record ?? '(none recorded)'}, the manifest given ${identity.manifest ?? '(none)'}`);
  }
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
    if (report.scope.draft) problems.push(`HWE-MERGE ${file}: the shard ran with --draft (HWE-KEYS left out); a merge needs the keyboard rule`);
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

  // Each entry of angular-hosts.json must match an element in the Angular result of a
  // group of its component in some shard (the shards record every entry).
  const hosts = new Map();
  for (const { report } of reports) {
    for (const item of report?.angularHosts ?? []) {
      const key = `${item.entry} ${item.component} ${item.element}`;
      const seenHost = hosts.get(key) ?? { ...item, compared: 0, matched: false };
      seenHost.compared += (item.compared ?? []).length;
      seenHost.matched ||= item.matched === true;
      hosts.set(key, seenHost);
    }
  }
  for (const item of hosts.values()) {
    // A component without a group in the build whose page exists (pending translation) is not judged.
    if (item.matched || (item.compared === 0 && item.page === true)) continue;
    const where = item.compared > 0 ? `the Angular result of the groups of ${item.component} has no element ${item.element} with an hw- class` : `docs/components/ has no page ${item.component}`;
    problems.push(`HWE-MERGE scripts/equivalence/angular-hosts.json:1: entry ${item.entry} (${item.component}, ${item.element}) matches nothing: ${where}; remove it`);
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
    asserted: items.reduce((sum, item) => sum + (item.asserted ?? 0), 0),
    axeFrames: reports.reduce((sum, { report }) => sum + (report?.axeFrames ?? 0), 0),
    afterInteraction: interacted.size,
    restOnly: groups.size - interacted.size,
    documented: documented.size,
  });
  return { problems, summary: `${summary}; merged from ${reports.length} shards`, keys: [...compared.keys()].sort() };
}

function main(argv) {
  let manifestFile = 'src/generated/content/manifest.json';
  let recordFile = 'dist/build-info.json';
  const files = [];
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--manifest' && argv[i + 1] !== undefined) manifestFile = argv[++i];
    else if (argv[i] === '--record' && argv[i + 1] !== undefined) recordFile = argv[++i];
    else if (argv[i].startsWith('--')) throw new Error(`unknown option ${argv[i]}`);
    else files.push(argv[i]);
  }
  const reports = files.map((file) => ({ file, report: existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null }));
  for (const { file, report } of reports) if (!report) throw new Error(`HWE-MERGE ${file}: the report does not exist`);
  const manifest = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, 'utf8')) : null;
  const record = existsSync(recordFile) ? JSON.parse(readFileSync(recordFile, 'utf8')) : null;
  const identity = { manifest: contentManifestHash(manifestFile), record: record ? (record.contentManifest ?? null) : undefined, recordFile };
  const { problems, summary } = mergeReports(reports, manifest, identity);
  if (!record) problems.push(`HWE-MERGE ${recordFile}: the build record does not exist; the shards are merged against the record of the build they compared`);
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
