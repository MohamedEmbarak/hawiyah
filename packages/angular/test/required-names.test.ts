import { resolve } from 'node:path';
import './fixtures/texts';
import { NgtscProgram } from '@angular/compiler-cli';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import ts from 'typescript';
import { afterEach, beforeAll, expect, it } from 'vitest';
import { text, withText } from './fixtures/application-text';
import { page } from './fixtures/page';
import { missingTextWarnings } from './fixtures/texts';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); });

// A search field, a toggle group and a tree view are named by label, aria-label or aria-labelledby and are checked when
// they render, so a missing label is no compile error.
it('[NAME-04][RENAME-01] makes the removed inputs and the missing required inputs compile errors in an application template', () => {
  const fixture = resolve(import.meta.dirname, 'fixtures/required-names.ts');
  const options = { strict: true, noEmit: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022, moduleResolution: ts.ModuleResolutionKind.Bundler, lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'], skipLibCheck: true, experimentalDecorators: true, types: [], strictTemplates: true };
  const program = new NgtscProgram([fixture], options, ts.createCompilerHost(options));
  const message = (diagnostic: ts.Diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ');
  expect([...program.getTsOptionDiagnostics(), ...program.getTsSyntacticDiagnostics(), ...program.getTsSemanticDiagnostics()].map(message)).toEqual([]);
  // The three fixture components share one import list; an unused import (NG8113) is not the subject here.
  const findings = program.getNgSemanticDiagnostics().map(diagnostic => ({ code: Math.abs(diagnostic.code) % 10000, message: message(diagnostic).split('.')[0] })).filter(finding => finding.code !== 8113);
  expect(findings).toEqual([
    { code: 8002, message: `Can't bind to 'addLabel' since it isn't a known property of 'hw-tag-input'` },
    { code: 8002, message: `Can't bind to 'describedBy' since it isn't a known property of 'hw-text-field'` },
    { code: 8008, message: `Required input 'options' from component HwToggleGroupComponent must be specified` },
    { code: 8008, message: `Required input 'getResultsMessage' from component HwMultiSelectComponent must be specified` },
  ]);
}, 120_000);

const cities = [{ value: 'riyadh', label: 'Riyadh' }, { value: 'jeddah', label: 'Jeddah' }];

it('[NAME-04][E02] a toggle group with neither label nor forwarded name renders no legend and warns once', () => {
  const warnings = missingTextWarnings();
  const { root, fixture } = page(`<hw-toggle-group [options]="cities" /><hw-toggle-group [options]="cities" multiple />`, { cities });
  fixture.detectChanges(); fixture.detectChanges();
  expect(root.querySelector('legend')).toBeNull(); for (const fieldset of root.querySelectorAll('fieldset')) { expect(fieldset.hasAttribute('aria-label')).toBe(false); expect(fieldset.hasAttribute('aria-labelledby')).toBe(false); }
  expect(warnings).toEqual(['Hawiyah: hw-toggle-group requires "label". Hawiyah ships no built-in strings, so the application supplies this text; nothing is rendered in its place.']);
});

it('[NAME-02][NAME-03] a toggle group, a search field and a file dropzone named by aria-label or aria-labelledby alone render no legend or label and do not warn', () => {
  const { root } = page(`<h2 id="heading">Heading</h2><hw-toggle-group aria-label="View" [options]="cities" /><hw-toggle-group aria-labelledby="heading" [options]="cities" /><hw-search-field aria-label="Search the site" clearLabel="Clear" [suggestions]="['Passport']" [getResultsMessage]="text.searchField.getResultsMessage" /><hw-search-field aria-labelledby="heading" clearLabel="Clear" [suggestions]="['Passport']" [getResultsMessage]="text.searchField.getResultsMessage" /><hw-file-dropzone aria-label="Documents" dropLabel="Drop files here" /><hw-file-dropzone aria-labelledby="heading" dropLabel="Drop files here" /><hw-field label="Attachments"><hw-file-dropzone dropLabel="Drop files here" /></hw-field>`, { cities, text });
  expect(root.querySelector('legend, hw-toggle-group label.hw-label, hw-search-field label, hw-file-dropzone label')).toBeNull();
  const [labelled, labelledBy] = [...root.querySelectorAll('hw-toggle-group fieldset')];
  expect(labelled!.getAttribute('aria-label')).toBe('View'); expect(labelledBy!.getAttribute('aria-labelledby')).toBe('heading');
  // The suggestion list takes the name of its input.
  const [search, searchBy] = [...root.querySelectorAll('hw-search-field')];
  expect(search!.querySelector('input')!.getAttribute('aria-label')).toBe('Search the site'); expect(search!.querySelector('[role=listbox]')!.getAttribute('aria-label')).toBe('Search the site'); expect(search!.querySelector('[role=listbox]')!.hasAttribute('aria-labelledby')).toBe(false);
  expect(searchBy!.querySelector('input')!.getAttribute('aria-labelledby')).toBe('heading'); expect(searchBy!.querySelector('[role=listbox]')!.getAttribute('aria-labelledby')).toBe('heading');
  const [zone, zoneBy, inField] = [...root.querySelectorAll('hw-file-dropzone input')];
  expect(zone!.getAttribute('aria-label')).toBe('Documents'); expect(zoneBy!.getAttribute('aria-labelledby')).toBe('heading'); expect(inField!.getAttribute('aria-labelledby')).toBe(root.querySelector('hw-field label')!.id);
});

it('[NAME-01] the visible label of a search field names its input and its suggestion list', () => {
  const { root } = page(`<hw-search-field label="Find" clearLabel="Clear" [suggestions]="['Passport']" [getResultsMessage]="text.searchField.getResultsMessage" />`, { text });
  const label = root.querySelector('label.hw-label')!, input = root.querySelector('input')!;
  expect(label.getAttribute('for')).toBe(input.id); expect(root.querySelector('[role=listbox]')!.getAttribute('aria-labelledby')).toBe(label.id); expect(root.querySelector('[role=listbox]')!.hasAttribute('aria-label')).toBe(false);
});

it('[ATTR-03][rich-inputs-1] aria-label and aria-labelledby written on hw-combobox reach the input and name the listbox; the host keeps none', () => {
  const { root } = page(`<h2 id="heading">Heading</h2><hw-combobox aria-label="City" [options]="cities" ${withText.combobox} /><hw-combobox aria-labelledby="heading" [options]="cities" ${withText.combobox} /><hw-combobox label="Branch" [options]="cities" ${withText.combobox} />`, { cities, text });
  const [labelled, labelledBy, visible] = [...root.querySelectorAll('hw-combobox')];
  for (const host of [labelled!, labelledBy!]) { expect(host.hasAttribute('aria-label')).toBe(false); expect(host.hasAttribute('aria-labelledby')).toBe(false); expect(host.querySelector('label')).toBeNull(); }
  expect(labelled!.querySelector('input[role=combobox]')!.getAttribute('aria-label')).toBe('City'); expect(labelled!.querySelector('[role=listbox]')!.getAttribute('aria-label')).toBe('City'); expect(labelled!.querySelector('[role=listbox]')!.hasAttribute('aria-labelledby')).toBe(false);
  expect(labelledBy!.querySelector('input[role=combobox]')!.getAttribute('aria-labelledby')).toBe('heading'); expect(labelledBy!.querySelector('[role=listbox]')!.getAttribute('aria-labelledby')).toBe('heading');
  // With a visible label the list is named by the label element, as in the other adapters.
  const label = visible!.querySelector('label.hw-label')!; expect(label.id).not.toBe(''); expect(visible!.querySelector('[role=listbox]')!.getAttribute('aria-labelledby')).toBe(label.id); expect(visible!.querySelector('[role=listbox]')!.hasAttribute('aria-label')).toBe(false);
});

// Wrapper components whose inner landmark, list or group takes the name (HwNamedRoot): the element that is named.
const tabs = '<hw-tab value="one" label="One">Panel</hw-tab>';
const roots: [tag: string, attributes: string, named: string, content?: string, finding?: string][] = [
  ['hw-tabs', `overflowLabel="More"`, '[role=tablist]', tabs],
  ['hw-breadcrumb', `[items]="[{label: 'Home', href: '/'}, {label: 'Here'}]"`, 'nav.hw-breadcrumb'],
  ['hw-pagination', withText.pagination.replace(/(^|\s)label="[^"]*"/, ''), 'nav.hw-pagination'],
  ['hw-stepper', `${withText.stepper} [items]="[{value: 'a', label: 'A'}]"`, 'ol.hw-stepper'],
  ['hw-secondary-nav', `[items]="[{label: 'Home', href: '/'}]"`, 'nav.hw-secondary-nav'],
  ['hw-content-navigation', `[items]="[{id: 'intro', label: 'Intro'}]"`, 'nav.hw-content-nav'],
  // Feedback and content: one native element, list or button inside the host takes the name.
  ['hw-progress', `[value]="40"`, 'progress.hw-progress', '', 'feedback-status-7'],
  ['hw-meter', `[value]="10"`, 'meter.hw-meter', '', 'feedback-status-8'],
  ['hw-timeline', `[items]="[{id: 'sent', title: 'Sent'}]"`, 'ol.hw-timeline', '', 'content-display-16'],
  ['hw-icon-button', '', 'button.hw-icon-button', '<span class="hw-icon" data-icon="search-01"></span>', 'content-display-1'],
];
for (const [tag, attributes, named, content = '', finding] of roots) {
  it(`[NAME-01][NAME-02][NAME-03][ATTR-03]${finding ? `[${finding}]` : '[E08][R22]'} ${tag}: label, aria-label or aria-labelledby names ${named}; the host keeps none of the attributes`, () => {
    const { root, update } = page(`<h2 id="heading">Heading</h2><p id="note">Note</p>
      <${tag} label="By label" ${attributes}>${content}</${tag}><${tag} aria-label="Static name" aria-describedby="note" ${attributes}>${content}</${tag}>
      <${tag} aria-labelledby="heading" ${attributes}>${content}</${tag}><${tag} [aria-label]="name" [aria-describedby]="'note'" ${attributes}>${content}</${tag}>
      <${tag} aria-labelledby="heading" label="Both" ${attributes}>${content}</${tag}>`, { text, name: 'Bound name' });
    const hosts = [...root.querySelectorAll(tag)], targets = hosts.map(host => host.querySelector(named)!);
    for (const host of hosts) for (const attribute of ['aria-label', 'aria-labelledby', 'aria-describedby']) expect(host.hasAttribute(attribute), attribute).toBe(false);
    expect(targets[0]!.getAttribute('aria-label')).toBe('By label'); expect(targets[0]!.hasAttribute('aria-labelledby')).toBe(false); expect(targets[0]!.hasAttribute('aria-describedby')).toBe(false);
    expect(targets[1]!.getAttribute('aria-label')).toBe('Static name'); expect(targets[1]!.getAttribute('aria-describedby')).toBe('note');
    expect(targets[2]!.getAttribute('aria-labelledby')).toBe('heading'); expect(targets[2]!.hasAttribute('aria-label')).toBe(false);
    expect(targets[3]!.getAttribute('aria-label')).toBe('Bound name'); expect(targets[3]!.getAttribute('aria-describedby')).toBe('note'); update({ name: 'Other name' }); expect(targets[3]!.getAttribute('aria-label')).toBe('Other name');
    expect(targets[4]!.getAttribute('aria-labelledby')).toBe('heading'); expect(targets[4]!.getAttribute('aria-label')).toBe('Both');
  });

  it(`[NAME-04]${finding ? `[${finding}]` : '[E08]'} ${tag} without any name writes no aria-label and warns once under its selector`, () => {
    const warnings = missingTextWarnings();
    const { root, update } = page(`<${tag} ${attributes}>${content}</${tag}>`, { text });
    update();
    expect(root.querySelector(named)!.hasAttribute('aria-label')).toBe(false); expect(root.querySelector(named)!.hasAttribute('aria-labelledby')).toBe(false);
    expect(warnings.map(warning => warning.split('.')[0])).toEqual([`Hawiyah: ${tag} requires "label"`]);
  });
}

it('[E08] hw-content-navigation prints its heading only while showHeading is on and label has text', () => {
  const { root } = page(`<hw-content-navigation label="On this page" [items]="items" /><hw-content-navigation aria-label="On this page" [items]="items" /><hw-content-navigation label="On this page" [showHeading]="false" [items]="items" />`, { items: [{ id: 'intro', label: 'Intro' }] });
  expect([...root.querySelectorAll('hw-content-navigation')].map(host => host.querySelector('h2.hw-content-nav-heading')?.textContent ?? null)).toEqual(['On this page', null, null]);
});
