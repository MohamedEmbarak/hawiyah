// tests/host/inventory.json lists every old-guide browser spec with its
// disposition for milestones 5 and 6; tests/host/gaps.json records the known
// package defects the fixture-host cases mark with test.fail().
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

// A string path: under jsdom the global URL is not the Node class fileURLToPath accepts.
const root = `${join(dirname(fileURLToPath(import.meta.url)), '..')}/`;
const read = (path: string) => JSON.parse(readFileSync(`${root}${path}`, 'utf8'));

interface Entry { file: string; disposition: string; reason: string; target: string }
const inventory = read('tests/host/inventory.json') as { entries: Entry[] };
const specs = readdirSync(`${root}tests/browser`).filter((name) => name.endsWith('.spec.ts')).map((name) => `tests/browser/${name}`).sort();

it('lists every tests/browser spec file exactly once', () => {
  const files = inventory.entries.map((entry) => entry.file);
  const counts = new Map<string, number>();
  for (const file of files) counts.set(file, (counts.get(file) ?? 0) + 1);
  expect([...counts].filter(([, count]) => count > 1).map(([file]) => file), 'files with two or more entries').toEqual([]);
  expect(specs.filter((file) => !counts.has(file)), 'spec files without an entry').toEqual([]);
});

it('has no entry for a missing file', () => {
  expect(inventory.entries.filter((entry) => !existsSync(`${root}${entry.file}`)).map((entry) => entry.file)).toEqual([]);
});

it('gives every entry a disposition, a reason and a target', () => {
  for (const entry of inventory.entries) {
    expect(['move', 'port', 'retire'], entry.file).toContain(entry.disposition);
    expect(entry.reason.trim(), entry.file).not.toBe('');
    expect(entry.target.trim(), entry.file).not.toBe('');
  }
});

it('moves a spec unchanged only to a free target and only when it does not import from apps/playground', () => {
  const moves = inventory.entries.filter((entry) => entry.disposition === 'move');
  const target = (entry: Entry) => entry.target.split(/\s/)[0];
  for (const entry of moves) expect(target(entry), entry.file).toMatch(/^tests\/host\/[\w.-]+\.spec\.ts$/);
  expect(moves.filter((entry) => existsSync(`${root}${target(entry)}`)).map((entry) => `${entry.file} -> ${target(entry)}`), 'move targets that exist already').toEqual([]);
  const targets = moves.map(target);
  expect(targets.filter((path, index) => targets.indexOf(path) !== index), 'move targets named twice').toEqual([]);
  expect(moves.filter((entry) => readFileSync(`${root}${entry.file}`, 'utf8').includes('apps/playground')).map((entry) => entry.file), 'specs to move that import from apps/playground').toEqual([]);
});

it('records each known package defect once, with evidence and a referencing test', () => {
  const gaps = read('tests/host/gaps.json') as { gaps: { id: string; case: string; adapter: string; observed: string; expected: string; evidence: string }[] };
  const sources = readdirSync(`${root}tests/host`).filter((name) => name.endsWith('.spec.ts')).map((name) => readFileSync(`${root}tests/host/${name}`, 'utf8')).join('\n');
  const ids = gaps.gaps.map((gap) => gap.id);
  expect(new Set(ids).size).toBe(ids.length);
  for (const gap of gaps.gaps) {
    expect(gap.id).toBe(`GAP-${gap.case}-${gap.adapter}`);
    for (const key of ['observed', 'expected', 'evidence'] as const) expect(gap[key].trim(), `${gap.id} ${key}`).not.toBe('');
    expect(gap.evidence, `${gap.id} evidence is file:line`).toMatch(/^[\w./@-]+:\d+/);
    expect(sources, `${gap.id} is referenced by a test`).toContain(`'${gap.id}'`);
  }
});
