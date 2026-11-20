// The union of the browser tests run in shards (scripts/e2e/merge.mjs): every listed
// test passed in exactly one shard, and the structure results cover every page with
// every listed declaration used.
import { describe, expect, it } from 'vitest';
import { reportTests, structureLabels, structureUnion, testCoverage } from '../merge.mjs';

/** A JSON report of the given specs: [file, title, status?] (status undefined: listed only). */
function report(specs) {
  const files = [...new Set(specs.map(([file]) => file))];
  return {
    suites: files.map((file) => ({
      title: file,
      file,
      specs: specs.filter(([name]) => name === file).map(([, title, status]) => ({
        id: `${file}-${title}`,
        title,
        file,
        tests: [{ projectName: 'prod', results: status === undefined ? [] : [{ status }] }],
      })),
    })),
  };
}

const LIST = [['a.spec.ts', 'one'], ['a.spec.ts', 'two'], ['b.spec.ts', 'three'], ['b.spec.ts', 'four']];
const ran = (rows, status = 'passed') => report(rows.map(([file, title]) => [file, title, status]));

describe('test coverage of the shards', () => {
  it('passes when every listed test passed in exactly one shard', () => {
    const shards = [{ file: 's1.json', report: ran(LIST.slice(0, 2)) }, { file: 's2.json', report: ran(LIST.slice(2)) }];
    expect(testCoverage(report(LIST), shards)).toEqual({ problems: [], tests: 4, ran: 4 });
    expect(reportTests(report(LIST))[0]).toEqual({ key: 'a.spec.ts-one prod', title: 'a.spec.ts › one [prod]', status: 'not run' });
  });

  it('joins the eight shards of guide.yml (lead decision L11 of 5a), and misses a test of a lost shard', () => {
    const list = Array.from({ length: 20 }, (_, n) => [`p${n % 5}.spec.ts`, `test ${n}`]);
    // playwright test --shard=i/8 gives each shard a contiguous part of the tests.
    const shards = Array.from({ length: 8 }, (_, i) => ({ file: `s${i + 1}.json`, report: ran(list.filter((_, n) => Math.floor((n * 8) / list.length) === i)) }));
    expect(shards.every((shard) => reportTests(shard.report).length > 0)).toBe(true);
    expect(testCoverage(report(list), shards)).toEqual({ problems: [], tests: 20, ran: 20 });
    const lost = testCoverage(report(list), shards.filter((shard) => shard.file !== 's8.json'));
    expect(lost.problems).toEqual(reportTests(shards[7].report).map((test) => `HWT-MERGE: ${test.title} ran in no shard`));
  });

  it('fails on a test that ran in no shard, in two shards, failed, was skipped or is not listed', () => {
    const shards = [
      { file: 's1.json', report: report([['a.spec.ts', 'one', 'passed'], ['a.spec.ts', 'two', 'failed']]) },
      { file: 's2.json', report: report([['a.spec.ts', 'one', 'passed'], ['b.spec.ts', 'three', 'skipped'], ['c.spec.ts', 'five', 'passed']]) },
    ];
    const { problems } = testCoverage(report(LIST), shards);
    expect(problems).toEqual([
      'HWT-MERGE s2.json: a.spec.ts › one [prod] ran in two shards (also s1.json)',
      'HWT-MERGE s2.json: c.spec.ts › five [prod] is not in the list of the build',
      'HWT-MERGE s1.json: a.spec.ts › two [prod] ended failed',
      'HWT-MERGE s2.json: b.spec.ts › three [prod] ended skipped',
      'HWT-MERGE: b.spec.ts › four [prod] ran in no shard',
    ]);
    expect(testCoverage(report([]), []).problems).toEqual(['HWT-MERGE: the list of tests is empty']);
  });
});

describe('union of the structure results', () => {
  const documents = [
    { kind: 'page', route: '' },
    { kind: 'page', route: '404' },
    { kind: 'redirect', route: 'en' },
    { kind: 'page', route: 'en/components' },
  ];
  const labels = structureLabels(documents);
  const listed = ['x', 'y'];
  const results = (used) => labels.map((label, n) => ({ file: `${n}.json`, label, used: used[n] ?? [], listed }));

  it('names every page document and both opened states', () => {
    expect(labels).toEqual(['root document', '404 document', 'en/components', 'opened states (ar)', 'opened states (en)']);
  });

  it('passes when every listed declaration is used on some page', () => {
    expect(structureUnion(results([['x'], [], ['y']]), labels)).toEqual({ complete: true, missing: [], problems: [], unused: [] });
  });

  it('fails on a listed declaration no page uses, and on results that list other declarations', () => {
    const union = structureUnion(results([['x']]), labels);
    expect(union.problems).toEqual(['HWT-UNION: listed declaration used by no rule on any page: y']);
    const other = results([['x', 'y']]);
    other[2] = { ...other[2], listed: ['x'] };
    expect(structureUnion(other, labels).problems).toEqual(['HWT-UNION 2.json: lists other declarations than 0.json']);
  });

  it('judges nothing while a page has no result (a filtered or sharded run)', () => {
    const partial = results([['x']]).slice(1);
    expect(structureUnion(partial, labels)).toEqual({ complete: false, missing: ['root document'], problems: [], unused: [] });
  });
});
