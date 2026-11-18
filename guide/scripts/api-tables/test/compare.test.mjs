// Table comparison: the pilot fixtures pass, and each kind of mismatch fails
// with HWC-APIX in the specified wording.
import { beforeAll, describe, expect, it } from 'vitest';
import { checkPages, stylesheetMembers } from '../cli.mjs';
import { apiTablesOf, compareTable, formatFinding } from '../compare.mjs';
import { BUTTON, TABS, pageModel, variant } from './fixtures/tables.mjs';
import { components, contractRows, declarationContext, exclusions } from './helpers.mjs';

let base;
beforeAll(() => {
  base = { context: declarationContext(), components: components(), contractRows: contractRows(), exclusions: exclusions() };
}, 120000);

const check = (pages, overrides = {}) => checkPages({ ...base, ...overrides, pages: pages.map((page) => ({ id: page.id, lang: page.lang, page })) });
const messages = (result) => result.findings.map(formatFinding);

describe('pilot fixtures', () => {
  it('Button and Tabs tables match the declarations in both languages', () => {
    const result = check([pageModel('button', BUTTON), pageModel('button', BUTTON, { lang: 'ar' }), pageModel('tabs', TABS), pageModel('tabs', TABS, { lang: 'ar' })]);
    expect(messages(result)).toEqual([]);
    expect(result.tables).toBe(16);
  });
  it('apiTablesOf reads name, kind and required from the content model', () => {
    const tables = apiTablesOf(pageModel('tabs', TABS));
    expect(tables.vue.at(-1)).toEqual({ name: 'update:modelValue', kind: 'event', required: false });
    expect(tables.javascript[0]).toEqual({ name: 'value', kind: 'option', required: false });
  });
});

describe('one mismatch per kind', () => {
  it('a name the declarations do not have (React)', () => {
    const tables = variant(TABS, 'react', (rows) => [...rows, ['closeLabel', false]]);
    expect(messages(check([pageModel('tabs', tables)]))).toEqual([
      'HWC-APIX docs/components/tabs.md: React table lists closeLabel (prop, required false); the declarations have no closeLabel',
    ]);
  });
  it('a declared name the table does not list (vanilla controller)', () => {
    const tables = variant(TABS, 'javascript', (rows) => rows.filter((row) => row[0] !== 'onValueChange'));
    expect(messages(check([pageModel('tabs', tables)]))).toEqual([
      'HWC-APIX docs/components/tabs.md: JavaScript table lists no onValueChange; the declarations have onValueChange (option, required false)',
    ]);
  });
  it('a wrong kind (Vue event written as prop)', () => {
    const tables = variant(TABS, 'vue', (rows) => rows.map((row) => (row[0] === 'update:modelValue' ? [row[0], 'prop', false] : row)));
    expect(messages(check([pageModel('tabs', tables)]))).toEqual([
      'HWC-APIX docs/components/tabs.md: Vue table lists update:modelValue (prop, required false); the declarations have update:modelValue (event, required false)',
    ]);
  });
  it('a wrong requiredness (Angular hw-tab value)', () => {
    const tables = variant(TABS, 'angular', (rows) => rows.map((row) => (row[0] === 'hw-tab value' ? [row[0], 'input', false] : row)));
    expect(messages(check([pageModel('tabs', tables)]))).toEqual([
      'HWC-APIX docs/components/tabs.md: Angular table lists hw-tab value (input, required false); the declarations have hw-tab value (input, required true)',
    ]);
  });
  it('an Angular content selector missing and an inherited input missing', () => {
    const tables = variant(TABS, 'angular', (rows) => rows.filter((row) => row[0] !== '*' && row[0] !== 'aria-describedby'));
    expect(messages(check([pageModel('tabs', tables)]))).toEqual([
      'HWC-APIX docs/components/tabs.md: Angular table lists no aria-describedby; the declarations have aria-describedby (input, required false)',
      'HWC-APIX docs/components/tabs.md: Angular table lists no *; the declarations have * (content, required false)',
    ]);
  });
  it('a name listed twice', () => {
    const tables = variant(BUTTON, 'vue', (rows) => [...rows, ['size', 'prop', false]]);
    expect(messages(check([pageModel('button', tables)]))).toEqual([
      'HWC-APIX docs/components/button.md: Vue table lists size twice; the declarations have size (prop, required false)',
    ]);
  });
  it('a missing table', () => {
    expect(messages(check([pageModel('button', BUTTON, { omit: 'react', lang: 'ar' })]))).toEqual([
      'HWC-APIX docs/components/button.ar.md: the API section has no React table',
    ]);
  });
  it('compareTable reports names, kinds and requiredness together', () => {
    const findings = compareTable(
      [{ name: 'a', kind: 'input', required: true }, { name: 'b', kind: 'output', required: false }],
      [{ name: 'a', kind: 'input', required: false }, { name: 'c', kind: 'content', required: false }],
      { file: 'f.md', label: 'Angular' },
    );
    expect(findings.map(formatFinding)).toEqual([
      'HWC-APIX f.md: Angular table lists a (input, required true); the declarations have a (input, required false)',
      'HWC-APIX f.md: Angular table lists b (output, required false); the declarations have no b',
      'HWC-APIX f.md: Angular table lists no c; the declarations have c (content, required false)',
    ]);
  });
});

describe('components without a vanilla controller (leadAmendments A6)', () => {
  it('compares Button with the stylesheet contract and the exclusions entry', () => {
    const result = stylesheetMembers('button', base.components.get('button'), base.contractRows, base.exclusions.button.vanilla);
    expect(result.problems).toEqual([]);
    expect(result.members.map((m) => m.name).sort()).toEqual(['aria-busy', 'class', 'data-icon-only', 'data-size', 'data-variant', 'disabled', 'type']);
  });
  it('an attribute that neither the contract nor the exclusions declare', () => {
    const tables = variant(BUTTON, 'javascript', (rows) => [...rows, ['data-tone', false]]);
    expect(messages(check([pageModel('button', tables)]))).toEqual([
      'HWC-APIX docs/components/button.md: JavaScript table lists data-tone (option); the declarations have no data-tone',
    ]);
  });
  it('a documented attribute removed from the table', () => {
    const tables = variant(BUTTON, 'javascript', (rows) => rows.filter((row) => row[0] !== 'data-size'));
    expect(messages(check([pageModel('button', tables)]))).toEqual([
      'HWC-APIX docs/components/button.md: JavaScript table lists no data-size; the declarations have data-size (option)',
    ]);
  });
  it('data-icon-only is a documented row, no longer an exclusion', () => {
    expect(base.exclusions.button.vanilla.notListed).toBeUndefined();
    const tables = variant(BUTTON, 'javascript', (rows) => rows.filter((row) => row[0] !== 'data-icon-only'));
    expect(messages(check([pageModel('button', tables)]))).toEqual([
      'HWC-APIX docs/components/button.md: JavaScript table lists no data-icon-only; the declarations have data-icon-only (option)',
    ]);
  });
  it('a component without a controller and without an exclusions entry', () => {
    const result = check([pageModel('button', BUTTON)], { exclusions: {} });
    expect(messages(result)).toEqual([
      'HWC-APIX docs/components/button.md: JavaScript table cannot be checked: @hawiyah/vanilla exports no controller for button and scripts/api-tables/exclusions.json has no entry for it',
    ]);
  });
  it('a stale exclusions entry', () => {
    const entry = { ...base.exclusions.button.vanilla, notListed: { 'data-shape': 'x' }, nativeAttributes: { ...base.exclusions.button.vanilla.nativeAttributes, 'data-variant': 'x' } };
    const result = stylesheetMembers('button', base.components.get('button'), base.contractRows, entry);
    expect(result.problems).toEqual([
      'exclusions.json button.vanilla.notListed names data-shape, which the styles contract does not document',
      'exclusions.json button.vanilla.nativeAttributes names data-variant, which the styles contract documents',
    ]);
  });
});
