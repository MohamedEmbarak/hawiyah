// The stylesheet contract table of the @hawiyah/styles README.
import { describe, expect, it } from 'vitest';
import { readExclusions } from '../members.mjs';
import { contractFor, parseContract } from '../stylesheet-contract.mjs';
import { contractRows } from './helpers.mjs';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe('stylesheet contract', () => {
  it('reads the Actions row of the installed styles README for hw-button', () => {
    expect(contractFor(contractRows(), ['hw-button'])).toEqual({
      families: ['Actions'], classes: ['hw-button'], attributes: ['data-variant', 'data-size', 'data-icon-only'],
      values: new Map([
        ['data-variant', ['primary', 'default', 'secondary', 'outline', 'outline-white', 'light', 'danger', 'ghost', 'soft', 'link']],
        ['data-size', ['sm', 'md', 'lg']],
        ['data-icon-only', []],
      ]),
    });
  });
  it('reads the Tabs row with its ARIA attributes', () => {
    const tabs = contractFor(contractRows(), ['hw-tabs', 'hw-tab-list', 'hw-tab', 'hw-tab-panel']);
    expect(tabs.families).toEqual(['Tabs']);
    expect(tabs.attributes).toEqual(['aria-selected', 'aria-orientation']);
  });
  it('keeps code spans that contain a pipe in one cell', () => {
    const rows = parseContract('# x\n\n## Stable class and state API\n\n| Family | Classes and attributes |\n| --- | --- |\n| A | `hw-a`; `data-x="1|2"` |\n\n## Next\n');
    expect(rows).toEqual([{ family: 'A', tokens: ['hw-a', 'data-x="1|2"'] }]);
  });
  it('fails without the section', () => {
    expect(() => parseContract('# README\n')).toThrow(/Stable class and state API/);
  });
});

describe('exclusions.json', () => {
  const write = (data) => {
    const file = join(mkdtempSync(join(tmpdir(), 'api-tables-')), 'exclusions.json');
    writeFileSync(file, JSON.stringify(data));
    return file;
  };
  it('accepts only vanilla stylesheet-contract entries with reasons and approvedBy', () => {
    const ok = { rule: 'stylesheet-contract', reason: 'r', approvedBy: 'lead' };
    expect(() => readExclusions(write({ components: { x: { react: ok } } }))).toThrow(/only vanilla/);
    expect(() => readExclusions(write({ components: { x: { vanilla: { ...ok, rule: 'other' } } } }))).toThrow(/stylesheet-contract/);
    expect(() => readExclusions(write({ components: { x: { vanilla: { ...ok, reason: '' } } } }))).toThrow(/needs a reason/);
    expect(() => readExclusions(write({ components: { x: { vanilla: { ...ok, approvedBy: ' ' } } } }))).toThrow(/needs approvedBy/);
    expect(() => readExclusions(write({ components: { x: { vanilla: { ...ok, nativeAttributes: { type: '' } } } } }))).toThrow(/nativeAttributes.type needs a reason/);
    expect(readExclusions(write({ components: { x: { vanilla: ok } } }))).toEqual({ x: { vanilla: ok } });
  });
});
