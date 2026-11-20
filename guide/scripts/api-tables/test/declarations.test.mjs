// The declaration readers on the installed 0.3.0 packages.
import { beforeAll, describe, expect, it } from 'vitest';
import { angularMembers, qualifier } from '../declarations-angular.mjs';
import { reactMembers } from '../declarations-react.mjs';
import { hasController, vanillaMembers } from '../declarations-vanilla.mjs';
import { vueMembers } from '../declarations-vue.mjs';
import { targetsFor } from '../targets.mjs';
import { resolveExport } from '../program.mjs';
import { canonicalType } from '../types.mjs';
import { BUTTON, TABS } from './fixtures/tables.mjs';
import { declarationContext } from './helpers.mjs';

let context;
beforeAll(() => { context = declarationContext(); }, 120000);

// Name, kind, required flag and written type; defaults and the slots read at run
// time come from members.mjs (readers.test.mjs).
// Types as step 30 compares them (canonical form: union order does not count).
const key = (type) => (type === '—' ? type : canonicalType(type));
const asRows = (members) => members.map((m) => `${m.name}|${m.kind}|${m.required}|${key(m.type)}`).sort();
const fromFixture = (rows) => rows.filter((row) => row[1] !== 'slot').map((row) => `${row[0]}|${row[1]}|${row[3]}|${key(row[2])}`).sort();

describe('targets', () => {
  it('maps a page id to the documented exports', () => {
    const exists = (framework, name) => resolveExport(context, framework, name) !== null;
    expect(targetsFor('button', exists)).toEqual({ vanilla: ['createButton'], react: ['Button'], vue: ['Button'], angular: ['HwButtonDirective'] });
    expect(targetsFor('tabs', exists)).toEqual({ vanilla: ['createTabs'], react: ['Tabs'], vue: ['Tabs'], angular: ['HwTabsComponent', 'HwTabComponent'] });
    expect(targetsFor('file-upload', exists)).toEqual({
      vanilla: ['createFileUpload', 'createFileUploadList'], react: ['FileUpload', 'FileUploadList'], vue: ['FileUpload', 'FileUploadList'],
      angular: ['HwFileUploadComponent', 'HwFileUploadListComponent'],
    });
  });
  it('qualifies further Angular classes by their element', () => {
    expect(qualifier('hw-tab', 'HwTabComponent')).toBe('hw-tab');
    expect(qualifier('button[hwButton],a[hwButton]', 'HwButtonDirective')).toBe('button[hwButton]');
    expect(qualifier(null, 'HwX')).toBe('HwX');
  });
});

describe('vanilla', () => {
  it('reads the options of createTabs', () => {
    const result = vanillaMembers(context, 'createTabs');
    expect(result.problems).toEqual([]);
    expect(asRows(result.members)).toEqual(fromFixture(TABS.javascript));
  });
  it('finds no controller for Button', () => {
    expect(hasController(context, 'createButton')).toBe(false);
    expect(vanillaMembers(context, 'createButton').problems).toEqual(['@hawiyah/vanilla exports no createButton']);
  });
});

describe('React', () => {
  it('reads Button props without the members of @types/react', () => {
    expect(asRows(reactMembers(context, 'Button').members)).toEqual(fromFixture(BUTTON.react));
  });
  it('reads Tabs props through the union of TabsProps and RootName', () => {
    expect(asRows(reactMembers(context, 'Tabs').members)).toEqual(fromFixture(TABS.react));
  });
  it('reports a missing export', () => {
    expect(reactMembers(context, 'NoSuchComponent').problems).toEqual(['@hawiyah/react exports no NoSuchComponent']);
  });
});

describe('Vue', () => {
  it('reads Button props (defaults make a prop optional)', () => {
    expect(asRows(vueMembers(context, 'Button').members)).toEqual(fromFixture(BUTTON.vue));
  });
  it('reads Tabs props and emits with their types; the declaration types no slots', () => {
    expect(asRows(vueMembers(context, 'Tabs').members)).toEqual(fromFixture(TABS.vue));
  });
  it('follows the WithNativeAttributes wrapper of Button and reads its props from the options literal', () => {
    expect(vueMembers(context, 'Button').members.map((m) => m.name)).toEqual(['variant', 'size', 'loading', 'disabled', 'type']);
  });
  it('reads required props of Dialog', () => {
    const members = vueMembers(context, 'Dialog').members;
    expect(members.filter((m) => m.required).map((m) => m.name).sort()).toEqual(['closeLabel', 'title']);
    expect(members.filter((m) => m.kind === 'event').map((m) => m.name)).toEqual(['update:open']);
  });
});

describe('Angular', () => {
  it('reads the directive inputs of button[hwButton]', () => {
    expect(asRows(angularMembers(context, ['HwButtonDirective']).members)).toEqual(fromFixture(BUTTON.angular));
  });
  it('reads hw-tabs with the inputs of its base class HwNamedRoot, and hw-tab qualified', () => {
    expect(asRows(angularMembers(context, ['HwTabsComponent', 'HwTabComponent']).members)).toEqual(fromFixture(TABS.angular));
  });
  it('reads an output of a generic base class as its payload type on the documented class', () => {
    const members = angularMembers(context, ['HwCalendarComponent']).members;
    expect(members.find((m) => m.name === 'valueChange')).toMatchObject({ kind: 'output', type: 'string' });
    expect(members.find((m) => m.name === 'focused')).toMatchObject({ kind: 'output', type: 'FocusEvent' });
  });
  it('reports a missing class', () => {
    expect(angularMembers(context, ['HwNoSuchComponent']).problems).toEqual(['@hawiyah/angular exports no class HwNoSuchComponent']);
  });
});
