// Shards of step 80 (run.mjs --shard i/n) and their merge (merge.mjs): the shards
// are a partition of the groups, and the merge fails on a missing, repeated or extra
// group, on a missing or repeated shard and on a failed shard.
import { describe, expect, it } from 'vitest';
import { manifestKeys, mergeReports } from '../merge.mjs';
import { groupKey, pagesErrors, parseArgs, parseShard, shardGroups, summaryLine, workerCount } from '../run.mjs';

const manifest = {
  pages: [
    { id: 'button', langs: ['ar', 'en'], liveGroups: ['primary', 'variants', 'sizes', 'loading', 'disabled'].map((example) => ({ example })) },
    { id: 'tabs', langs: ['ar', 'en'], liveGroups: ['basic', 'vertical', 'manual', 'disabled-tab'].map((example) => ({ example })) },
  ],
};
const groups = manifest.pages.flatMap((page) => page.langs.flatMap((lang) => page.liveGroups.map(({ example }) => ({ id: page.id, lang, example }))));
const checks = (key) => (key.startsWith('tabs/') ? 2 : 0);

/** The report a shard of a passing run writes. */
function shardReport(index, total, selected = groups, extra = {}) {
  const part = shardGroups(selected, { index, total });
  return {
    pin: '0.3.0',
    scope: { pages: null, only: null, shard: { index, total } },
    selected: selected.map(groupKey).sort(),
    compared: part.map((group) => ({ key: groupKey(group), checks: checks(groupKey(group)) })),
    documentedDifferences: part.some((group) => group.id === 'tabs') ? [{ id: 'tabs-bar-orientation' }] : [],
    failures: [],
    ...extra,
  };
}
const reports = (total) => Array.from({ length: total }, (_, n) => ({ file: `shard-${n + 1}.json`, report: shardReport(n + 1, total) }));

describe('shards of step 80', () => {
  it('split the sorted group keys into a partition: every group in exactly one shard', () => {
    for (const total of [1, 2, 3, 4, 7, 18, 25]) {
      const parts = Array.from({ length: total }, (_, n) => shardGroups(groups, { index: n + 1, total }).map(groupKey));
      const all = parts.flat();
      expect(all.length, `${total} shards`).toBe(groups.length);
      expect(new Set(all).size, `${total} shards`).toBe(groups.length);
      expect([...all].sort()).toEqual(groups.map(groupKey).sort());
      // Balanced: the sizes differ by at most one.
      const sizes = parts.map((part) => part.length);
      expect(Math.max(...sizes) - Math.min(...sizes), `${total} shards`).toBeLessThanOrEqual(1);
    }
  });

  it('do not depend on the order of the live groups file', () => {
    const reversed = [...groups].reverse();
    for (let index = 1; index <= 4; index += 1) {
      expect(shardGroups(reversed, { index, total: 4 }).map(groupKey)).toEqual(shardGroups(groups, { index, total: 4 }).map(groupKey));
    }
  });

  it('parse <i>/<n>, the worker count and --pages, and refuse anything else', () => {
    expect(parseShard('2/4')).toEqual({ index: 2, total: 4 });
    for (const bad of ['0/4', '5/4', '1/0', '2', 'a/b', '1/4/2']) expect(() => parseShard(bad), bad).toThrow('HWE-SCOPE --shard:1');
    expect(workerCount(undefined)).toBe(2);
    expect(workerCount('3')).toBe(3);
    for (const bad of ['0', '9', '1.5', 'x']) expect(() => workerCount(bad), bad).toThrow('HWE-SCOPE --workers:1');
    expect(pagesErrors(groups, ['tabs'])).toEqual([]);
    expect(pagesErrors(groups, null)).toEqual([]);
    expect(pagesErrors(groups, ['tabs', 'dialog'])).toEqual(['HWE-SCOPE --pages:1: dialog names no built page with live groups']);
  });
});

describe('merge of the shard reports', () => {
  const full = summaryLine({ groups: 9, languages: 2, frameworks: 4, interactionChecks: 16, afterInteraction: 4, restOnly: 5, documented: 1 });

  it('passes on the four shards of one run and prints the counts of a run without --shard', () => {
    const { problems, summary, keys } = mergeReports(reports(4), manifest);
    expect(problems).toEqual([]);
    expect(keys).toEqual(manifestKeys(manifest));
    expect(summary).toBe(`${full}; merged from 4 shards`);
    expect(mergeReports(reports(1), manifest).summary).toBe(`${full}; merged from 1 shards`);
  });

  it('fails on a missing shard and therefore on groups compared in no shard', () => {
    const { problems } = mergeReports(reports(4).filter((_, n) => n !== 2), manifest);
    expect(problems).toContain('HWE-MERGE: the report of shard 3/4 is missing');
    expect(problems.some((line) => /group\(s\) of the content manifest were compared in no shard: /.test(line))).toBe(true);
  });

  it('fails on a repeated shard and on a group compared twice', () => {
    const list = reports(4);
    const { problems } = mergeReports([...list, { file: 'again.json', report: list[0].report }], manifest);
    expect(problems).toContain('HWE-MERGE again.json: shard 1 is repeated (also shard-1.json)');
    expect(problems.some((line) => /^HWE-MERGE again\.json: \S+ was compared in two shards \(also shard-1\.json\)$/.test(line))).toBe(true);
  });

  it('fails when a group of the manifest is missing from the run, or a compared group belongs to no built page', () => {
    const fewer = groups.filter((group) => !(group.id === 'tabs' && group.example === 'manual'));
    const short = Array.from({ length: 4 }, (_, n) => ({ file: `shard-${n + 1}.json`, report: shardReport(n + 1, 4, fewer) }));
    expect(mergeReports(short, manifest).problems).toEqual([
      'HWE-MERGE: 2 group(s) of the content manifest were compared in no shard: tabs/ar/manual, tabs/en/manual',
    ]);
    const smaller = { pages: [manifest.pages[0]] };
    expect(mergeReports(reports(4), smaller).problems[0]).toMatch(/^HWE-MERGE: 8 compared group\(s\) belong to no built page: tabs\/ar\/basic/);
    expect(mergeReports(reports(4), null).problems).toContain('HWE-MERGE src/generated/content/manifest.json: the content manifest cannot be read');
  });

  it('fails on a failed shard, a shard of another split, another pin, a scoped shard and a report that is not a shard', () => {
    const list = reports(4);
    list[1] = { file: 'shard-2.json', report: { ...list[1].report, failures: ['HWE-SHOT docs/components/tabs.md:19: x'] } };
    list[2] = { file: 'shard-3.json', report: { ...list[2].report, pin: '0.3.1', scope: { pages: ['tabs'], only: null, shard: { index: 3, total: 4 } } } };
    const { problems } = mergeReports([...list, { file: 'report.json', report: { scope: { shard: null } } }], manifest);
    expect(problems).toContain('HWE-MERGE shard-2.json: the shard failed: HWE-SHOT docs/components/tabs.md:19: x');
    expect(problems).toContain('HWE-MERGE shard-3.json: the shard ran with --pages; a merge covers every group');
    expect(problems).toContain('HWE-MERGE shard-3.json: pin 0.3.1, the first report has 0.3.0');
    expect(problems).toContain('HWE-MERGE report.json: not the report of a shard (run.mjs --shard <i>/<n>)');
    const mixed = [...reports(4).slice(0, 3), { file: 'other.json', report: shardReport(3, 3) }];
    expect(mergeReports(mixed, manifest).problems).toContain('HWE-MERGE other.json: shard 3/3 belongs to a split into 3, the first report to one into 4');
    expect(mergeReports([], manifest).problems).toEqual(['HWE-MERGE: no shard report given']);
  });

  // The shards are tied to one build.
  it('fails on a shard of another content manifest and on a build record of another one', () => {
    const tagged = (hash) => reports(4).map((item) => ({ ...item, report: { ...item.report, contentManifest: hash } }));
    expect(mergeReports(tagged('aaaa'), manifest, { manifest: 'aaaa', record: 'aaaa', recordFile: 'dist/build-info.json' }).problems).toEqual([]);
    const list = tagged('aaaa');
    list[2] = { ...list[2], report: { ...list[2].report, contentManifest: 'bbbb' } };
    expect(mergeReports(list, manifest, { manifest: 'aaaa', record: 'aaaa', recordFile: 'dist/build-info.json' }).problems).toEqual([
      'HWE-MERGE shard-3.json: the shard compared the content manifest bbbb, the build has aaaa',
    ]);
    expect(mergeReports(tagged('aaaa'), manifest, { manifest: 'aaaa', record: 'cccc', recordFile: 'dist/build-info.json' }).problems).toEqual([
      'HWE-MERGE dist/build-info.json: the build record has the content manifest cccc, the manifest given aaaa',
    ]);
    expect(mergeReports(reports(4), manifest, { manifest: 'aaaa', record: 'aaaa', recordFile: 'dist/build-info.json' }).problems).toHaveLength(4);
  });

  it('fails on an entry of angular-hosts.json that matched nothing in any shard', () => {
    const host = (index, total, matched) => ({ entry: 1, component: 'button', element: 'hw-button', compared: shardGroups(groups, { index, total }).filter((group) => group.id === 'button').map(groupKey), matched });
    const list = (matchedIn) => reports(4).map(({ file, report }, n) => ({ file, report: { ...report, angularHosts: [host(n + 1, 4, n + 1 === matchedIn)] } }));
    expect(mergeReports(list(3), manifest).problems).toEqual([]);
    expect(mergeReports(list(0), manifest).problems).toEqual(['HWE-MERGE scripts/equivalence/angular-hosts.json:1: entry 1 (button, hw-button) matches nothing: the Angular result of the groups of button has no element hw-button with an hw- class; remove it']);
    const none = (page) => reports(4).map(({ file, report }) => ({ file, report: { ...report, angularHosts: [{ entry: 1, component: 'chip', element: 'hw-chip', page, compared: [], matched: false }] } }));
    expect(mergeReports(none(false), manifest).problems).toEqual(['HWE-MERGE scripts/equivalence/angular-hosts.json:1: entry 1 (chip, hw-chip) matches nothing: docs/components/ has no page chip; remove it']);
    // A component whose page exists without a group in the build (pending translation) is not judged.
    expect(mergeReports(none(true), manifest).problems).toEqual([]);
  });

  it('fails on a shard that ran with --draft (the keyboard rule left out)', () => {
    const list = reports(4);
    list[0] = { file: 'shard-1.json', report: { ...list[0].report, scope: { ...list[0].report.scope, draft: true } } };
    expect(mergeReports(list, manifest).problems).toEqual(['HWE-MERGE shard-1.json: the shard ran with --draft (HWE-KEYS left out); a merge needs the keyboard rule']);
    expect(parseArgs(['--shard', '1/4', '--draft'])).toMatchObject({ shard: '1/4', keys: false });
  });
});
