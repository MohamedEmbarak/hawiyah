// Golden members: fixtures/golden.md is a
// table written by hand from the installed declarations and published
// JavaScript before the printer ran on them. The printer and the default readers
// must give exactly its cells (the written form, not only an equal one), and the
// table must pass the comparison of step 30.
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { parseMarkdown, plainText } from '../../content/parse.mjs';
import { compareTable } from '../compare.mjs';
import { declaredMembers } from '../members.mjs';
import { testReaders } from './helpers.mjs';

const source = readFileSync(new URL('./fixtures/golden.md', import.meta.url), 'utf8');

function goldenRows() {
  const { tree } = parseMarkdown(source, 'golden.md');
  const table = tree.children.find((node) => node.type === 'table');
  return table.children.slice(1).map((row) => {
    const [id, framework, name, kind, type, required, fallback] = row.children.map((cell) => plainText(cell).trim());
    return { id, framework, name, kind, type, required: required === 'true', default: fallback };
  });
}

const rows = goldenRows();
let readers;
const cache = new Map();
const declared = (id) => {
  if (!cache.has(id)) cache.set(id, declaredMembers(readers, id));
  return cache.get(id);
};
beforeAll(() => { readers = testReaders(); }, 120000);

describe('golden members', () => {
  it('covers about 40 members across the four adapters', () => {
    expect(rows.length).toBeGreaterThanOrEqual(40);
    expect(new Set(rows.map((row) => row.framework))).toEqual(new Set(['vanilla', 'react', 'vue', 'angular']));
    for (const kind of ['prop', 'event', 'slot', 'input', 'output', 'option']) expect(rows.some((row) => row.kind === kind)).toBe(true);
  });
  it.each(rows.map((row) => [`${row.id} ${row.framework} ${row.name}`, row]))('%s', (_label, row) => {
    const member = declared(row.id)[row.framework].members.find((item) => item.name === row.name);
    expect(member, `${row.id} ${row.framework} declares ${row.name}`).toBeDefined();
    const shown = (value) => (value === null || value === undefined ? '—' : value);
    expect({ kind: member.kind, type: member.compare?.type === false ? '—' : shown(member.type), required: member.required, default: shown(member.default) })
      .toEqual({ kind: row.kind, type: row.type, required: row.required, default: row.default });
  });
  it('the hand-written table passes the comparison of step 30 row by row', () => {
    for (const row of rows) {
      const decl = declared(row.id)[row.framework];
      const member = decl.members.find((item) => item.name === row.name);
      const findings = compareTable([row], [member], { file: 'golden.md', label: row.framework, checkRequired: decl.source !== 'stylesheet' });
      expect(findings.filter((item) => !/lists no/.test(item.message))).toEqual([]);
    }
  });
});
