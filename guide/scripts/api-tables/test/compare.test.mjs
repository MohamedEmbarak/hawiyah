// Table comparison: the pilot fixtures pass, and each kind of mismatch fails
// with exactly one HWC-APIX finding in the specified wording (5a.3 negative
// fixtures: a wrong type, a wrong default, an invented name, a missing member,
// an invented slot and a defaults.json entry whose evidence text is absent).
import { beforeAll, describe, expect, it } from 'vitest';
import { checkPages } from '../cli.mjs';
import { apiTablesOf, compareTable, formatFinding } from '../compare.mjs';
import { stylesheetMembers } from '../members.mjs';
import { generatedNote } from '../notes.mjs';
import { BUTTON, TABS, pageModel, replaceRow, variant } from './fixtures/tables.mjs';
import { testReaders } from './helpers.mjs';

let readers;
beforeAll(() => { readers = testReaders(); }, 120000);

const check = (pages, withReaders = readers) => checkPages({ readers: withReaders, pages: pages.map((page) => ({ id: page.id, lang: page.lang, page })) });
const messages = (result) => result.findings.map(formatFinding);

describe('pilot fixtures', () => {
  it('Button and Tabs tables match the installed packages in both languages, all five columns', () => {
    const result = check([pageModel('button', BUTTON), pageModel('button', BUTTON, { lang: 'ar' }), pageModel('tabs', TABS), pageModel('tabs', TABS, { lang: 'ar' })]);
    expect(messages(result)).toEqual([]);
    expect(result.tables).toBe(16);
    expect(result.rows).toBe(2 * (10 + 3 + 6 + 5 + 5 + 11 + 11 + 17));
  });
  it('apiTablesOf reads name, kind, required, type and default from the content model', () => {
    const tables = apiTablesOf(pageModel('tabs', TABS));
    expect(tables.vue[8]).toEqual({ name: 'update:modelValue', kind: 'event', required: false, type: '(value: string) => void', default: '—' });
    expect(tables.javascript[0]).toEqual({ name: 'value', kind: 'option', required: false, type: 'string', default: '—' });
  });
  it('the order of a union and the names of parameters do not count', () => {
    const tables = variant(TABS, 'react', (rows) => replaceRow(rows, 'onValueChange', (row) => [row[0], row[1], '(next: string) => void', row[3], row[4]]));
    const swapped = variant(tables, 'angular', (rows) => replaceRow(rows, 'orientation', (row) => [row[0], row[1], "'vertical' | 'horizontal'", row[3], row[4]]));
    expect(messages(check([pageModel('tabs', swapped)]))).toEqual([]);
  });
});

describe('one finding per mismatch (negative fixtures)', () => {
  it('a wrong type', () => {
    const tables = variant(TABS, 'vue', (rows) => replaceRow(rows, 'overflow', (row) => [row[0], row[1], "'menu' | 'scroll' | 'wrap'", row[3], row[4]]));
    expect(messages(check([pageModel('tabs', tables)]))).toEqual([
      "HWC-APIX docs/components/tabs.md: Vue table gives overflow the type 'menu' | 'scroll' | 'wrap'; the declarations have 'menu' | 'scroll'",
    ]);
  });
  it('a type that is not a type', () => {
    const tables = variant(TABS, 'angular', (rows) => replaceRow(rows, 'id', (row) => [row[0], row[1], 'a string', row[3], row[4]]));
    expect(messages(check([pageModel('tabs', tables)]))).toEqual([
      'HWC-APIX docs/components/tabs.md: Angular table gives id the type "a string", which is not a type; the declarations have string',
    ]);
  });
  it('a content row with a type', () => {
    const tables = variant(TABS, 'angular', (rows) => replaceRow(rows, '*', (row) => [row[0], row[1], 'hw-tab', row[3], row[4]]));
    expect(messages(check([pageModel('tabs', tables)]))).toEqual([
      'HWC-APIX docs/components/tabs.md: Angular table gives * the type hw-tab; the declarations have no type for a content row (an em dash)',
    ]);
  });
  it('a wrong default', () => {
    const tables = variant(BUTTON, 'react', (rows) => replaceRow(rows, 'size', (row) => [row[0], row[1], row[2], row[3], "'lg'"]));
    expect(messages(check([pageModel('button', tables)]))).toEqual([
      "HWC-APIX docs/components/button.md: React table gives size the default 'lg'; the installed packages give 'md'",
    ]);
  });
  it('a default where the published build applies none (a vanilla option)', () => {
    const tables = variant(TABS, 'javascript', (rows) => replaceRow(rows, 'overflowLabel', (row) => [row[0], row[1], row[2], row[3], "'More'"]));
    expect(messages(check([pageModel('tabs', tables)]))).toEqual([
      "HWC-APIX docs/components/tabs.md: JavaScript table gives overflowLabel the default 'More'; the installed packages give —",
    ]);
    // Without its defaults.json entry (L2), the default of activationMode is an em dash again.
    const stated = variant(TABS, 'javascript', (rows) => rows);
    expect(messages(check([pageModel('tabs', stated)], testReaders({ defaults: [] })))).toEqual([
      "HWC-APIX docs/components/tabs.md: JavaScript table gives activationMode the default 'automatic'; the installed packages give —",
      "HWC-APIX docs/components/tabs.md: JavaScript table gives overflow the default 'menu'; the installed packages give —",
    ]);
  });
  it('an invented name', () => {
    const tables = variant(TABS, 'react', (rows) => [...rows, ['closeLabel', 'prop', 'string', false, '—']]);
    expect(messages(check([pageModel('tabs', tables)]))).toEqual([
      'HWC-APIX docs/components/tabs.md: React table lists closeLabel (prop, required false); the declarations have no closeLabel',
    ]);
  });
  it('a missing member', () => {
    const tables = variant(TABS, 'javascript', (rows) => rows.filter((row) => row[0] !== 'onValueChange'));
    expect(messages(check([pageModel('tabs', tables)]))).toEqual([
      'HWC-APIX docs/components/tabs.md: JavaScript table lists no onValueChange; the declarations have onValueChange (option, required false)',
    ]);
  });
  it('an invented slot', () => {
    const tables = variant(BUTTON, 'vue', (rows) => [...rows, ['icon', 'slot', '—', false, '—']]);
    expect(messages(check([pageModel('button', tables)]))).toEqual([
      'HWC-APIX docs/components/button.md: Vue table lists icon (slot, required false); the declarations have no icon',
    ]);
  });
  it('a slot the published build reads, left out', () => {
    const tables = variant(TABS, 'vue', (rows) => rows.filter((row) => row[0] !== 'tab:<value>'));
    expect(messages(check([pageModel('tabs', tables)]))).toEqual([
      'HWC-APIX docs/components/tabs.md: Vue table lists no tab:<value>; the declarations have tab:<value> (slot, required false)',
    ]);
  });
  it('a defaults.json entry whose evidence text is absent', () => {
    const entry = {
      id: 'tabs', framework: 'vanilla', name: 'activationMode', default: "'automatic'",
      evidence: { file: '@hawiyah/vanilla/dist/tabs.js', text: 'activationMode = "automatic" // not in the file' }, approvedBy: 'test', reason: 'test',
    };
    const dashes = variant(TABS, 'javascript', (rows) => replaceRow(replaceRow(rows, 'activationMode', (row) => [row[0], row[1], row[2], row[3], '—']), 'overflow', (row) => [row[0], row[1], row[2], row[3], '—']));
    const result = check([pageModel('tabs', dashes), pageModel('tabs', dashes, { lang: 'ar' })], testReaders({ defaults: [entry] }));
    expect(messages(result)).toEqual([
      `HWC-APIX scripts/api-tables/defaults.json: defaults.json gives tabs activationMode the default 'automatic'; its evidence text "${entry.evidence.text}" does not occur in the installed @hawiyah/vanilla/dist/tabs.js`,
    ]);
  });
  it('a defaults.json entry whose evidence occurs gives the default, which the table then states', () => {
    const entry = {
      id: 'button', framework: 'vanilla', name: 'data-size', default: "'md'",
      evidence: { file: '@hawiyah/styles/README.md', text: 'Defaults are primary/medium buttons' }, approvedBy: 'test', reason: 'test',
    };
    const withDefaults = testReaders({ defaults: [entry] });
    const dashes = variant(BUTTON, 'javascript', (rows) => replaceRow(replaceRow(rows, 'data-size', (row) => [row[0], row[1], row[2], row[3], '—']), 'data-variant', (row) => [row[0], row[1], row[2], row[3], '—']));
    expect(messages(check([pageModel('button', dashes)], withDefaults))).toEqual([
      "HWC-APIX docs/components/button.md: JavaScript table gives data-size the default —; the installed packages give 'md'",
    ]);
    const tables = variant(dashes, 'javascript', (rows) => replaceRow(rows, 'data-size', (row) => [row[0], row[1], row[2], row[3], "'md'"]));
    expect(messages(check([pageModel('button', tables)], withDefaults))).toEqual([]);
  });
  it('a wrong kind (Vue event written as prop)', () => {
    const tables = variant(TABS, 'vue', (rows) => replaceRow(rows, 'update:modelValue', (row) => [row[0], 'prop', row[2], row[3], row[4]]));
    expect(messages(check([pageModel('tabs', tables)]))).toEqual([
      'HWC-APIX docs/components/tabs.md: Vue table lists update:modelValue (prop, required false); the declarations have update:modelValue (event, required false)',
    ]);
  });
  it('a wrong requiredness (Angular hw-tab value)', () => {
    const tables = variant(TABS, 'angular', (rows) => replaceRow(rows, 'hw-tab value', (row) => [row[0], row[1], row[2], false, row[4]]));
    expect(messages(check([pageModel('tabs', tables)]))).toEqual([
      'HWC-APIX docs/components/tabs.md: Angular table lists hw-tab value (input, required false); the declarations have hw-tab value (input, required true)',
    ]);
  });
  it('a name listed twice', () => {
    const tables = variant(BUTTON, 'vue', (rows) => [...rows, ['size', 'prop', "'sm' | 'md' | 'lg'", false, "'md'"]]);
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

describe('components without a vanilla controller', () => {
  it('compares Button with the stylesheet contract, the stylesheet selectors and the exclusions entry', () => {
    const result = stylesheetMembers(readers, 'button');
    expect(result.problems).toEqual([]);
    expect(result.generatedNote).toBe(false);
    expect(result.members.map((m) => `${m.name} ${m.type} (${m.from})`)).toEqual([
      "class 'hw-button' (contract)",
      "data-variant 'primary' | 'default' | 'secondary' | 'outline' | 'outline-white' | 'light' | 'danger' | 'ghost' | 'soft' | 'link' (contract and stylesheet)",
      "data-size 'sm' | 'md' | 'lg' (contract and stylesheet)",
      'data-icon-only boolean (contract and stylesheet)',
      "aria-disabled 'true' (stylesheet)",
      "aria-busy 'true' (stylesheet)",
      "aria-pressed 'true' (stylesheet)",
      "data-shape 'circle' (stylesheet)",
      'disabled boolean (stylesheet)',
      'type null (exclusions.json)',
    ]);
  });
  it('an attribute that neither the contract, the stylesheet nor the exclusions declare', () => {
    const tables = variant(BUTTON, 'javascript', (rows) => [...rows, ['data-tone', 'option', "'info'", false, '—']]);
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
  it('the type of a native attribute of exclusions.json is not compared, its name is', () => {
    const tables = variant(BUTTON, 'javascript', (rows) => replaceRow(rows, 'type', (row) => [row[0], row[1], 'string', row[3], "'button'"]));
    expect(messages(check([pageModel('button', tables)]))).toEqual([]);
    const without = variant(BUTTON, 'javascript', (rows) => rows.filter((row) => row[0] !== 'type'));
    expect(messages(check([pageModel('button', without)]))).toEqual([
      'HWC-APIX docs/components/button.md: JavaScript table lists no type; the declarations have type (option)',
    ]);
  });
  it('a stale exclusions entry', () => {
    const entry = { ...readers.exclusions.button.vanilla, notListed: { 'data-tone': 'x' }, nativeAttributes: { ...readers.exclusions.button.vanilla.nativeAttributes, 'data-variant': 'x' } };
    const result = stylesheetMembers(testReaders({ exclusions: { button: { vanilla: entry } } }), 'button');
    expect(result.problems).toEqual([
      'exclusions.json button.vanilla.notListed names data-tone, which neither the styles contract nor dist/styles.css declares on hw-button',
      'exclusions.json button.vanilla.nativeAttributes names data-variant, which the styles contract documents',
    ]);
  });
  it('a component without a contract row needs the generated note after its JavaScript table (A11)', () => {
    const declared = stylesheetMembers(readers, 'stat');
    expect(declared.generatedNote).toBe(true);
    const rows = declared.members.map((m) => [m.name, m.kind, m.type, m.required, m.default]);
    const tables = { ...BUTTON, javascript: rows };
    const page = (lang, after) => pageModel('stat', tables, { lang, after });
    const only = (result) => messages(result).filter((line) => line.includes('JavaScript table of stat'));
    const note = (lang) => ({ type: 'alert', kind: 'note', blocks: [{ type: 'paragraph', children: [{ type: 'text', value: generatedNote(lang, '0.3.0') }] }] });
    expect(only(check([page('en', {})]))).toEqual([
      `HWC-APIX docs/components/stat.md: the JavaScript table of stat is read from the published stylesheet (no row of the styles contract names its classes); it is followed by the note "> [!NOTE] ${generatedNote('en', '0.3.0')}"`,
    ]);
    expect(only(check([page('en', { javascript: note('en') }), page('ar', { javascript: note('ar') })]))).toEqual([]);
    expect(messages(check([pageModel('button', BUTTON, { after: { javascript: note('en') } })]))).toEqual([
      'HWC-APIX docs/components/button.md: the JavaScript table of button is followed by the note of a table read from the stylesheet, but the styles contract documents hw-button; remove the note',
    ]);
  });
});
