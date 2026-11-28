// vocabulary-allow.json is a list of the
// guide, not a lead list, of the names that HTML, ARIA, the DOM, CSS and the Vue and
// Angular template syntax define. Every entry names its specification; the file fails
// to load, and this test fails, on an entry without one.
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { DEFAULT_ALLOW, allowErrors, readAllow } from '../vocabulary.mjs';

const data = JSON.parse(readFileSync(DEFAULT_ALLOW, 'utf8'));
const group = { kind: 'html-attribute', specification: 'https://html.spec.whatwg.org/multipage/indices.html#attributes-3', names: ['hidden', 'type'], values: { type: ['button'] } };
const dir = mkdtempSync(join(tmpdir(), 'hawiyah-vocabulary-allow-'));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe('vocabulary-allow.json', () => {
  it('names the specification of every entry, and is a list of the guide without approvedBy or reasons', () => {
    expect(allowErrors(data)).toEqual([]);
    expect(data.groups.length).toBeGreaterThan(0);
    for (const entry of data.groups) {
      expect(entry.specification, entry.kind).toMatch(/^https:\/\//);
      expect(entry, entry.kind).not.toHaveProperty('approvedBy');
      expect(entry, entry.kind).not.toHaveProperty('reason');
    }
    expect(readAllow().names.size).toBe(data.groups.reduce((sum, entry) => sum + entry.names.length, 0));
  });

  it('fails on an entry without a specification, with one that is not an https address, and with approvedBy', () => {
    const { specification, ...without } = group;
    expect(specification).toBeTruthy();
    expect(allowErrors({ groups: [without] })).toEqual(['vocabulary-allow.json group 1 (html-attribute) needs its specification as an https address']);
    expect(allowErrors({ groups: [{ ...group, specification: 'HTML' }] })).toEqual(['vocabulary-allow.json group 1 (html-attribute) needs its specification as an https address']);
    expect(allowErrors({ groups: [{ ...group, specification: '' }] })).toEqual(['vocabulary-allow.json group 1 (html-attribute) needs its specification as an https address']);
    expect(allowErrors({ groups: [{ ...group, approvedBy: 'lead' }] })).toEqual(['vocabulary-allow.json group 1 (html-attribute) has unknown fields approvedBy (the file is a list of the guide: kind, specification, names, values)']);
  });

  it('fails on an entry without names, a name listed twice and values of a name it does not list', () => {
    expect(allowErrors({ groups: [{ ...group, names: [] }] })).toEqual(['vocabulary-allow.json group 1 (html-attribute) needs a non-empty list of names']);
    expect(allowErrors({ groups: [group, { kind: group.kind, specification: group.specification, names: ['type'] }] })).toEqual(['vocabulary-allow.json group 2 (html-attribute): type is listed twice as html-attribute']);
    expect(allowErrors({ groups: [{ ...group, values: { dir: ['ltr'] } }] })).toEqual(['vocabulary-allow.json group 1 (html-attribute): values of dir, which the group does not list']);
    expect(allowErrors({})).toEqual(['vocabulary-allow.json must hold { groups: [...] }']);
  });

  it('is refused by the reader of step 30 when an entry has no specification', () => {
    const file = join(dir, 'allow.json');
    const { specification, ...without } = group;
    expect(specification).toBeTruthy();
    writeFileSync(file, JSON.stringify({ groups: [without] }));
    expect(() => readAllow(file)).toThrow('api-tables: vocabulary-allow.json group 1 (html-attribute) needs its specification as an https address');
    writeFileSync(file, JSON.stringify({ groups: [group] }));
    expect(readAllow(file).values(['html-attribute'], 'type')).toEqual(['button']);
  });
});
