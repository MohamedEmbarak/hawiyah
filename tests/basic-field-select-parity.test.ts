import '@angular/compiler';
import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BrowserTestingModule, platformBrowserTesting} from '@angular/platform-browser/testing';
import {HwFieldComponent, HwSelectComponent} from '../packages/angular/dist/fesm2022/hawiyah-angular.mjs';
import {act, createElement as r} from 'react';
import {createRoot} from 'react-dom/client';
import {createApp, createSSRApp, h, nextTick, reactive} from 'vue';
import {renderToString} from 'vue/server-renderer';
import {afterEach, beforeAll, expect, it} from 'vitest';
import {Field as ReactField} from '../packages/react/src/shared';
import {Select as ReactSelect, Textarea as ReactTextarea, TextField as ReactTextField} from '../packages/react/src/forms';
import {Field as VueField, Select as VueSelect, Textarea as VueTextarea, TextField as VueTextField} from '../packages/vue/src/forms';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const cleanup: Array<() => void | Promise<void>> = [];
const choices = [{value: 'unavailable', label: 'Unavailable', disabled: true}, {value: 'city', label: 'City'}, {value: 'region', label: 'Region'}];

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(async () => {
  for (const dispose of cleanup.splice(0)) await dispose();
  TestBed.resetTestingModule();
  document.body.replaceChildren();
});

function createForm() {
  const form = document.createElement('form');
  const external = document.createElement('p');
  external.id = 'external';
  external.textContent = 'External instructions';
  const host = document.createElement('div');
  document.body.append(form);
  form.append(external, host);
  return {form, host};
}

function descriptions(control: HTMLElement) {
  const ids = control.getAttribute('aria-describedby')?.split(/\s+/) ?? [];
  expect(new Set(ids).size).toBe(ids.length);
  return ids.map(id => {
    const nodes = [...document.querySelectorAll('[id]')].filter(node => node.id === id);
    expect(nodes, `Expected exactly one helper with ID ${id}`).toHaveLength(1);
    return nodes[0]!.textContent;
  });
}

for (const adapter of ['react', 'vue'] as const) {
  it(`${adapter} keeps parent labels and required state when a basic control adds its own helpers`, async () => {
    const {host} = createForm();
    const state = reactive({error: 'Child error', hint: 'Child hint'});
    const kinds = ['select', 'text', 'textarea'] as const;
    const parentProps = (kind: string) => ({controlId: kind, label: `Label ${kind}`, hint: 'Parent hint', required: true});
    const childProps = () => ({hint: state.hint, error: state.error, 'aria-describedby': 'external external'});
    let render: () => Promise<void>;
    if (adapter === 'react') {
      const root = createRoot(host);
      cleanup.push(async () => {await act(() => root.unmount());});
      render = async () => {await act(() => root.render(r('div', null, ...kinds.map(kind => r(ReactField, {...parentProps(kind), key: kind},
        kind === 'select' ? r(ReactSelect, {...childProps(), options: choices}) : kind === 'text' ? r(ReactTextField, childProps()) : r(ReactTextarea, childProps()),
      )))));};
    } else {
      const app = createApp({render: () => h('div', kinds.map(kind => h(VueField, {...parentProps(kind), key: kind}, () =>
        kind === 'select' ? h(VueSelect, {...childProps(), options: choices}) : kind === 'text' ? h(VueTextField, childProps()) : h(VueTextarea, childProps()),
      )))});
      app.mount(host);
      cleanup.push(() => app.unmount());
      render = async () => {await nextTick();};
    }
    await render();
    for (const kind of kinds) {
      const input = document.getElementById(kind) as HTMLInputElement;
      const label = host.querySelector<HTMLLabelElement>(`label[for="${kind}"]`)!;
      expect(label.control).toBe(input);
      expect(input.required).toBe(true);
      expect(input.getAttribute('aria-labelledby')).toBe(label.id);
      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(descriptions(input)).toEqual(['External instructions', 'Parent hint', 'Child hint', 'Child error']);
    }
    state.error = '';
    state.hint = '';
    await render();
    for (const kind of kinds) {
      const input = document.getElementById(kind)!;
      expect(input.getAttribute('aria-invalid')).not.toBe('true');
      expect(descriptions(input)).toEqual(['External instructions', 'Parent hint']);
    }
  });

  it(`${adapter} preserves native selection defaults and resolves optional prompts without duplicating an empty choice`, async () => {
    const {form, host} = createForm();
    const state = reactive({placeholder: undefined as string | undefined, options: choices});
    const selectProps = () => ({name: 'place', label: 'Place', required: true, 'aria-label': 'Custom accessible name', options: state.options, placeholder: state.placeholder});
    let render: () => Promise<void>;
    if (adapter === 'react') {
      const root = createRoot(host);
      cleanup.push(async () => {await act(() => root.unmount());});
      render = async () => {await act(() => root.render(r(ReactSelect, {...selectProps(), key: state.placeholder})));};
    } else {
      const app = createApp({render: () => h(VueSelect, {...selectProps(), key: state.placeholder})});
      app.mount(host);
      cleanup.push(() => app.unmount());
      render = async () => {await nextTick();};
    }
    await render();
    const select = () => host.querySelector('select')!;
    expect(select().selectedOptions[0]!.textContent).toBe('City');
    expect(new FormData(form).get('place')).toBe('city');
    expect(select().getAttribute('aria-label')).toBe('Custom accessible name');
    expect(select().hasAttribute('aria-labelledby')).toBe(false);
    state.placeholder = 'Choose a place';
    await render();
    expect(select().selectedOptions[0]!.textContent).toBe('Choose a place');
    expect(select().validity.valueMissing).toBe(true);
    state.options = [{value: '', label: 'Authored prompt'}, ...choices];
    await render();
    expect([...select().options].filter(option => option.value === '').map(option => option.textContent)).toEqual(['Authored prompt']);
  });
}

it('Vue serializes a preselected option for a server-rendered Select', async () => {
  const html = await renderToString(createSSRApp({render: () => h(VueSelect, {label: 'Place', options: choices, defaultValue: 'region'})}));
  const host = document.createElement('div');
  host.innerHTML = html;
  expect(host.querySelector('select')!.selectedOptions[0]!.textContent).toBe('Region');
});

it('Angular Select localizes its default prompt and connects external and changing field helpers', () => {
  const {host} = createForm();
  const fixture = TestBed.createComponent(HwSelectComponent);
  host.append(fixture.nativeElement);
  const set = (key: string, value: unknown) => fixture.componentRef.setInput(key, value);
  set('options', choices); set('controlId', 'place'); set('label', 'المنطقة'); set('required', true);
  set('hint', 'Hint'); set('error', 'Error'); set('describedBy', 'external external'); fixture.detectChanges();
  const select = host.querySelector('select')!;
  expect(select.selectedOptions[0]!.textContent).toBe('اختر خيارًا');
  expect(select.validity.valueMissing).toBe(true);
  expect(host.querySelector('label')!.control).toBe(select);
  expect(host.querySelector('.hw-required-marker')?.getAttribute('aria-hidden')).toBe('true');
  expect(descriptions(select)).toEqual(['External instructions', 'Hint', 'Error']);
  set('placeholder', 'Choose a place'); set('error', ''); fixture.detectChanges();
  expect(select.options[0]!.textContent).toBe('Choose a place');
  expect(descriptions(select)).toEqual(['External instructions', 'Hint']);
  set('options', [{value: '', label: 'Authored prompt'}, ...choices]); fixture.detectChanges();
  expect([...select.options].filter(option => option.value === '').map(option => option.textContent)).toEqual(['Authored prompt']);
});

it('Angular projected controls can bind to the Field helper IDs and required state', () => {
  class Host {error = 'Error';}
  Component({standalone: true, imports: [HwFieldComponent], template: `<hw-field #field controlId="place" label="Place" hint="Hint" [error]="error" describedBy="external external" required><select id="place" [required]="field.required" [attr.aria-describedby]="field.descriptionIds"><option value="">Choose a place</option></select></hw-field>`})(Host);
  const {host} = createForm();
  const fixture = TestBed.createComponent(Host);
  host.append(fixture.nativeElement); fixture.detectChanges();
  const select = host.querySelector('select')!;
  expect(host.querySelector('label')!.control).toBe(select);
  expect(select.required).toBe(true);
  expect(descriptions(select)).toEqual(['External instructions', 'Hint', 'Error']);
});
