import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createApp, createSSRApp, defineComponent, h, nextTick, ref, type App, type Component } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { resetTextWarnings } from '@hawiyah/core';
import { FileUpload } from '../src/forms.js';
import { Combobox } from '../src/interactive.js';
import { FileDropzone, MultiSelect, PasswordField, PinInput, SearchField, TagInput } from '../src/controls.js';
import { comboboxText, dropzoneText, multiSelectText, tagInputText } from './texts.js';

let app: App | undefined;
let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => { resetTextWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
afterEach(() => { app?.unmount(); app = undefined; document.body.replaceChildren(); warn.mockRestore(); });
const warnings = () => (warn.mock.calls as unknown[][]).map(call => String(call[0])).filter(message => message.startsWith('Hawiyah:'));
function mount(render: () => ReturnType<typeof h>) {
  const host = document.createElement('div'); document.body.append(host);
  app = createApp(defineComponent(() => render)); app.mount(host); return host;
}
const settle = async () => { await Promise.resolve(); await nextTick(); await nextTick(); };
const type = (input: HTMLInputElement, value: string, inputType = 'insertText') => {
  input.value = value; const event = new Event('input', { bubbles: true }); Object.defineProperty(event, 'inputType', { value: inputType }); input.dispatchEvent(event);
};
const key = (target: Element, name: string) => target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));
const options = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }, { value: 'c', label: 'Gamma' }];
const passwordText = { showLabel: 'Show password', hideLabel: 'Hide password' };
const searchText = { clearLabel: 'Clear search' };
/** jsdom cannot build a FileList: the input's `files` is replaced by a settable list. */
function stubFiles(input: HTMLInputElement) {
  let files: File[] = [];
  Object.defineProperty(input, 'files', { configurable: true, get: () => files, set: (value: ArrayLike<File>) => { files = Array.from(value); } });
  Object.defineProperty(input, 'value', { configurable: true, get: () => files.length ? `C:\\fakepath\\${files[0]!.name}` : '', set: (value: string) => { if (value === '') files = []; } });
  return { choose(next: File[]) { files = next; input.dispatchEvent(new Event('change', { bubbles: true })); } };
}
const file = (name: string, size = 1, mime = '') => new File(['x'.repeat(size)], name, { type: mime });
const names = (files: readonly File[]) => files.map(entry => entry.name);
function dropEvent(type: string, files: File[], types = ['Files']) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'dataTransfer', { value: { files, types, dropEffect: 'none' } });
  return event;
}

// Combobox

it('[COMBOBOX-01][REQ-01][rich-inputs-1] div.hw-combobox holds only the input, hidden input, listbox and status; label, hint and error are its siblings', () => {
  const host = mount(() => h(Combobox, { ...comboboxText, label: 'City', hint: 'H', error: 'E', required: true, options }));
  const box = host.querySelector('.hw-combobox')!;
  expect([...box.children].map(child => child.localName + (child.getAttribute('type') === 'hidden' ? '[hidden]' : ''))).toEqual(['input', 'input[hidden]', 'ul', 'span']);
  expect(box.querySelector('span')!.getAttribute('role')).toBe('status');
  expect(box.previousElementSibling!.matches('label.hw-label')).toBe(true);
  expect(box.previousElementSibling!.lastElementChild!.className).toBe('hw-required-marker');
  expect([box.nextElementSibling!.className, box.nextElementSibling!.nextElementSibling!.className]).toEqual(['hw-hint', 'hw-error']);
  expect(box.parentElement!.className).toBe('hw-field');
});

it('[STATE-01] Combobox open, uncontrolled: focus opens and notifies true once; Escape closes and notifies false once', async () => {
  const opened: boolean[] = [];
  const host = mount(() => h(Combobox, { ...comboboxText, label: 'City', options, 'onUpdate:open': (value: boolean) => opened.push(value) }));
  const input = host.querySelector<HTMLInputElement>('[role=combobox]')!;
  input.focus(); await nextTick();
  expect(input.getAttribute('aria-expanded')).toBe('true'); expect(opened).toEqual([true]);
  key(input, 'Escape'); await nextTick();
  expect(input.getAttribute('aria-expanded')).toBe('false'); expect(host.querySelector('ul')!.hidden).toBe(true); expect(opened).toEqual([true, false]);
});

it('[STATE-02][STATE-03] Combobox controlled open: Escape notifies false and the list stays open; a prop change does not notify', async () => {
  const opened: boolean[] = []; const open = ref(true);
  const host = mount(() => h(Combobox, { ...comboboxText, label: 'City', options, open: open.value, 'onUpdate:open': (value: boolean) => opened.push(value) }));
  const input = host.querySelector<HTMLInputElement>('[role=combobox]')!;
  key(input, 'Escape'); await nextTick();
  expect(opened).toEqual([false]); expect(input.getAttribute('aria-expanded')).toBe('true'); expect(host.querySelector('ul')!.hidden).toBe(false);
  open.value = false; await nextTick();
  expect(input.getAttribute('aria-expanded')).toBe('false'); expect(opened).toEqual([false]);
});

it('[STATE-04][rich-inputs-2] v-model:open round-trips and show() opens', async () => {
  const open = ref(false); const combobox = ref<{ show(): void; close(): void }>();
  const host = mount(() => h(Combobox, { ...comboboxText, ref: combobox, label: 'City', options, open: open.value, 'onUpdate:open': (value: boolean) => { open.value = value; } }));
  const input = host.querySelector<HTMLInputElement>('[role=combobox]')!;
  combobox.value!.show(); await nextTick();
  expect(open.value).toBe(true); expect(input.getAttribute('aria-expanded')).toBe('true');
  key(input, 'Escape'); await nextTick();
  expect(open.value).toBe(false); expect(input.getAttribute('aria-expanded')).toBe('false');
});

it('[STATE-05] Combobox with defaultOpen and with open renders the list open on the server and hydrates the same', async () => {
  const Application = defineComponent(() => () => h('div', [h(Combobox, { ...comboboxText, label: 'A', options, defaultOpen: true }), h(Combobox, { ...comboboxText, label: 'B', options, open: true })]));
  const markup = await renderToString(createSSRApp(Application));
  expect(markup.match(/aria-expanded="true"/g)).toHaveLength(2); expect(markup).not.toMatch(/<ul[^>]*hidden/);
  const container = document.createElement('div'); container.innerHTML = markup; document.body.append(container);
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  const hydrated = createSSRApp(Application);
  try {
    hydrated.mount(container); await nextTick();
    expect(warn).not.toHaveBeenCalled(); expect(error).not.toHaveBeenCalled();
    expect([...container.querySelectorAll('[role=combobox]')].map(input => input.getAttribute('aria-expanded'))).toEqual(['true', 'true']);
  } finally { hydrated.unmount(); error.mockRestore(); }
});

it('[COMBOBOX-03][COMBOBOX-04][rich-inputs-2] typing notifies query once per input event and no value; selecting, resetting and writing do not notify query', async () => {
  const queries: string[] = []; const values: string[] = []; const value = ref<string | undefined>(undefined);
  const host = mount(() => h('form', [h(Combobox, { ...comboboxText, label: 'City', options, modelValue: value.value, 'onUpdate:query': (next: string) => queries.push(next), 'onUpdate:modelValue': (next: string) => { values.push(next); value.value = next; } })]));
  const input = host.querySelector<HTMLInputElement>('[role=combobox]')!;
  input.focus(); type(input, 'Al'); await nextTick(); type(input, 'Alp'); await nextTick();
  expect(queries).toEqual(['Al', 'Alp']); expect(values).toEqual([]);
  host.querySelector<HTMLElement>('[role=option]')!.click(); await nextTick();
  value.value = 'c'; await nextTick();
  host.querySelector('form')!.reset(); await settle();
  expect(queries).toEqual(['Al', 'Alp']); expect(values).toEqual(['a', '']);
});

// Native form reset for the controls of this cluster

interface Case { name: string; component: Component; props: Record<string, unknown>; change(host: HTMLElement): Promise<void> | void; shown(host: HTMLElement): unknown; target: unknown; other: unknown; shownTarget: unknown; shownOther: unknown; submitted: [unknown, unknown] }
const control = (host: HTMLElement, selector = 'input:not([type=hidden])') => host.querySelector<HTMLInputElement>(selector)!;
const cases: Case[] = [
  { name: 'Combobox', component: Combobox, props: { ...comboboxText, label: 'City', options, defaultValue: 'a' },
    change: host => { control(host).focus(); host.querySelectorAll<HTMLElement>('[role=option]')[2]!.click(); }, shown: host => control(host).value,
    target: 'a', other: 'c', shownTarget: 'Alpha', shownOther: 'Gamma', submitted: [['a'], ['c']] },
  { name: 'PasswordField', component: PasswordField, props: { ...passwordText, label: 'Password', defaultValue: 'a' }, change: host => type(control(host), 'b'), shown: host => control(host).value,
    target: 'a', other: 'b', shownTarget: 'a', shownOther: 'b', submitted: [['a'], ['b']] },
  { name: 'SearchField', component: SearchField, props: { ...searchText, label: 'Search', defaultValue: 'a' }, change: host => type(control(host), 'b'), shown: host => control(host).value,
    target: 'a', other: 'b', shownTarget: 'a', shownOther: 'b', submitted: [['a'], ['b']] },
  { name: 'PinInput', component: PinInput, props: { label: 'Code', length: 4, defaultValue: '1234' }, change: host => type(control(host), '5678', 'insertFromPaste'), shown: host => control(host).value,
    target: '1234', other: '5678', shownTarget: '1234', shownOther: '5678', submitted: [['1234'], ['5678']] },
  { name: 'TagInput', component: TagInput, props: { ...tagInputText, label: 'Tags', defaultValue: ['a'] }, change: host => { const input = control(host); type(input, 'b'); key(input, 'Enter'); },
    shown: host => [...host.querySelectorAll('li.hw-chip')].map(chip => chip.firstChild!.textContent), target: ['a'], other: ['a', 'b'], shownTarget: ['a'], shownOther: ['a', 'b'], submitted: [['a'], ['a', 'b']] },
  { name: 'MultiSelect', component: MultiSelect, props: { ...multiSelectText, label: 'Letters', options, defaultValue: ['a'] }, change: host => host.querySelectorAll<HTMLInputElement>('input[type=checkbox]')[1]!.click(),
    shown: host => [...host.querySelectorAll<HTMLInputElement>('input[type=checkbox]')].map(box => box.checked), target: ['a'], other: ['a', 'b'], shownTarget: [true, false, false], shownOther: [true, true, false], submitted: [['a'], ['a', 'b']] },
];
for (const test of cases) {
  it(`[RESET-01][RESET-02][rich-inputs-5] ${test.name}: a changed control returns to its target, shows and submits it, and notifies once`, async () => {
    const events: unknown[] = [];
    const host = mount(() => h('form', [h(test.component, { ...test.props, name: 'v', 'onUpdate:modelValue': (next: unknown) => events.push(next) })]));
    const form = host.querySelector('form')!;
    await test.change(host); await nextTick();
    expect(test.shown(host)).toEqual(test.shownOther); expect(new FormData(form).getAll('v')).toEqual(test.submitted[1]);
    events.length = 0;
    form.reset(); await settle();
    expect(events).toEqual([test.target]); expect(test.shown(host)).toEqual(test.shownTarget); expect(new FormData(form).getAll('v')).toEqual(test.submitted[0]);
  });
  it(`[RESET-03] ${test.name}: an untouched control does not notify on reset`, async () => {
    const events: unknown[] = [];
    const host = mount(() => h('form', [h(test.component, { ...test.props, name: 'v', 'onUpdate:modelValue': (next: unknown) => events.push(next) })]));
    host.querySelector('form')!.reset(); await settle();
    expect(events).toEqual([]); expect(test.shown(host)).toEqual(test.shownTarget);
  });
  it(`[RESET-04] ${test.name}: a bound value that applies the notification agrees with the DOM and FormData`, async () => {
    const value = ref<unknown>(test.other);
    const host = mount(() => h('form', [h(test.component, { ...test.props, name: 'v', modelValue: value.value, 'onUpdate:modelValue': (next: unknown) => { value.value = next; } })]));
    host.querySelector('form')!.reset(); await settle();
    expect(value.value).toEqual(test.target); expect(test.shown(host)).toEqual(test.shownTarget); expect(new FormData(host.querySelector('form')!).getAll('v')).toEqual(test.submitted[0]);
  });
  it(`[RESET-05] ${test.name}: a bound value that ignores the notification is shown and submitted again`, async () => {
    const events: unknown[] = [];
    const host = mount(() => h('form', [h(test.component, { ...test.props, name: 'v', modelValue: test.other, 'onUpdate:modelValue': (next: unknown) => events.push(next) })]));
    host.querySelector('form')!.reset(); await settle();
    expect(events).toEqual([test.target]); expect(test.shown(host)).toEqual(test.shownOther); expect(new FormData(host.querySelector('form')!).getAll('v')).toEqual(test.submitted[1]);
  });
  it(`[RESET-06] ${test.name}: a default-prevented reset changes nothing and notifies nothing`, async () => {
    const events: unknown[] = [];
    const host = mount(() => h('form', [h(test.component, { ...test.props, name: 'v', 'onUpdate:modelValue': (next: unknown) => events.push(next) })]));
    const form = host.querySelector('form')!;
    await test.change(host); await nextTick(); events.length = 0;
    form.addEventListener('reset', event => event.preventDefault());
    form.reset(); await settle();
    expect(events).toEqual([]); expect(test.shown(host)).toEqual(test.shownOther);
  });
}

it('[RESET-07] read-only and disabled Combobox, TagInput, MultiSelect and PinInput reset like editable ones', async () => {
  const events: string[] = [];
  const record = (name: string) => (next: unknown) => events.push(`${name}:${JSON.stringify(next)}`);
  const host = mount(() => h('form', ['readonly', 'disabled'].flatMap(state => [
    h(Combobox, { ...comboboxText, label: 'C', options, [state]: true, defaultValue: 'a', modelValue: 'b', 'onUpdate:modelValue': record(`combobox-${state}`) }),
    h(TagInput, { ...tagInputText, label: 'T', [state]: true, defaultValue: ['a'], modelValue: ['b'], 'onUpdate:modelValue': record(`tags-${state}`) }),
    h(MultiSelect, { ...multiSelectText, label: 'M', options, [state]: true, defaultValue: ['a'], modelValue: ['b'], 'onUpdate:modelValue': record(`multi-${state}`) }),
    h(PinInput, { label: 'P', length: 4, [state]: true, defaultValue: '1234', modelValue: '5678', 'onUpdate:modelValue': record(`pin-${state}`) }),
  ])));
  host.querySelector('form')!.reset(); await settle();
  expect(events).toEqual(['readonly', 'disabled'].flatMap(state => [`combobox-${state}:"a"`, `tags-${state}:["a"]`, `multi-${state}:["a"]`, `pin-${state}:"1234"`]));
});

it('[RESET-08] Combobox, TagInput and MultiSelect hidden inputs follow an external form and its reset', async () => {
  const host = mount(() => h('div', [
    h('form', { id: 'outside' }),
    h(Combobox, { ...comboboxText, label: 'C', options, name: 'c', form: 'outside', defaultValue: 'a' }),
    h(TagInput, { ...tagInputText, label: 'T', name: 't', form: 'outside', defaultValue: ['a'] }),
    h(MultiSelect, { ...multiSelectText, label: 'M', options, name: 'm', form: 'outside', defaultValue: ['a'] }),
  ]));
  const form = host.querySelector('form')!;
  const tag = host.querySelector<HTMLInputElement>('.hw-tag-input > input')!; type(tag, 'z'); key(tag, 'Enter');
  host.querySelectorAll<HTMLInputElement>('input[type=checkbox]')[2]!.click(); await nextTick();
  expect([new FormData(form).getAll('c'), new FormData(form).getAll('t'), new FormData(form).getAll('m')]).toEqual([['a'], ['a', 'z'], ['a', 'c']]);
  form.reset(); await settle();
  expect([new FormData(form).getAll('c'), new FormData(form).getAll('t'), new FormData(form).getAll('m')]).toEqual([['a'], ['a'], ['a']]);
});

it('[RESET-09] secondary state returns: popup closed and notified, filter and results status empty, draft empty, password hidden and notified, submission aria-invalid gone', async () => {
  const opened: boolean[] = []; const visible: boolean[] = [];
  const host = mount(() => h('form', [
    h(Combobox, { ...comboboxText, label: 'C', options, required: true, 'onUpdate:open': (value: boolean) => opened.push(value) }),
    h(MultiSelect, { ...multiSelectText, label: 'M', options, required: true }),
    h(TagInput, { ...tagInputText, label: 'T' }),
    h(PasswordField, { ...passwordText, label: 'P', 'onUpdate:visible': (value: boolean) => visible.push(value) }),
  ]));
  const form = host.querySelector('form')!;
  form.checkValidity(); await nextTick();
  expect(host.querySelectorAll('[aria-invalid=true]').length).toBeGreaterThan(0);
  const combobox = host.querySelector<HTMLInputElement>('[role=combobox]')!; combobox.focus(); await nextTick();
  const filter = host.querySelector<HTMLInputElement>('input[type=search]')!; type(filter, 'Al'); await nextTick();
  const draft = host.querySelector<HTMLInputElement>('.hw-tag-input > input')!; type(draft, 'draft'); await nextTick();
  host.querySelector<HTMLButtonElement>('.hw-password-toggle')!.click(); await nextTick();
  expect(host.querySelector('.hw-multi-select > span[role=status]')!.textContent).toBe('1 options shown');
  opened.length = 0; visible.length = 0;
  form.reset(); await settle();
  expect(combobox.getAttribute('aria-expanded')).toBe('false'); expect(opened).toEqual([false]);
  expect(filter.value).toBe(''); expect(host.querySelectorAll('input[type=checkbox]')).toHaveLength(3);
  expect(host.querySelector('.hw-multi-select > span[role=status]')!.textContent).toBe('');
  expect(draft.value).toBe('');
  expect(host.querySelector<HTMLInputElement>('.hw-password-control input')!.type).toBe('password'); expect(visible).toEqual([false]);
  expect(host.querySelectorAll('[aria-invalid=true]')).toHaveLength(0);
});

// MultiSelect

it('[MULTISELECT-01][MULTISELECT-02][FMT-05][rich-inputs-6][R10][R09] fieldset children, a visible filter label and the two status elements', () => {
  const host = mount(() => h(MultiSelect, { ...multiSelectText, label: 'Letters', options, hint: 'H', error: 'E', name: 'm', defaultValue: ['a'], getSelectedMessage: (count: number) => `${count} selected` }));
  const fieldset = host.querySelector('fieldset.hw-field.hw-multi-select')!;
  expect([...fieldset.children].map(child => child.localName + (child.className ? `.${child.className.split(' ').join('.')}` : ''))).toEqual(['legend.hw-label', 'label.hw-label', 'input.hw-input', 'div.hw-multi-select-options', 'span.hw-sr-only', 'p.hw-multi-select-selected', 'input', 'p.hw-hint', 'p.hw-error']);
  const filter = fieldset.querySelector<HTMLInputElement>('input[type=search]')!;
  expect(filter.hasAttribute('aria-label')).toBe(false); expect(fieldset.querySelector(`label[for="${filter.id}"]`)!.textContent).toBe('Search options');
  for (const row of fieldset.querySelectorAll('.hw-multi-select-options > *')) expect(row.matches('label.hw-choice')).toBe(true);
  expect(fieldset.querySelector('.hw-multi-select-selected')!.getAttribute('role')).toBe('status');
  expect(fieldset.querySelector('.hw-multi-select-selected')!.textContent).toBe('1 selected');
});

it('[MULTISELECT-02] a missing searchLabel renders no filter label and warns once', () => {
  const { searchLabel: _missing, ...rest } = multiSelectText;
  const host = mount(() => h('div', [h(MultiSelect as Component, { ...rest, label: 'A', options }), h(MultiSelect as Component, { ...rest, label: 'B', options })]));
  expect(host.querySelectorAll('label.hw-label')).toHaveLength(0);
  expect(warnings()).toEqual([expect.stringContaining('MultiSelect requires "searchLabel"')]);
});

it('[FMT-05][R09][R10] the results status is empty until the reader filters; the selected status follows the selection', async () => {
  const host = mount(() => h(MultiSelect, { ...multiSelectText, label: 'Letters', options, getSelectedMessage: (count: number) => `${count} selected` }));
  const status = host.querySelector('span[role=status]')!;
  expect(status.textContent).toBe(''); expect(status.getAttribute('aria-live')).toBe('polite'); expect(status.getAttribute('aria-atomic')).toBe('true');
  expect(status.previousElementSibling!.className).toBe('hw-multi-select-options');
  const filter = host.querySelector<HTMLInputElement>('input[type=search]')!;
  type(filter, 'zzz'); await nextTick();
  expect(status.textContent).toBe('0 options shown'); expect(host.querySelector('.hw-multi-select-options > p.hw-hint')!.textContent).toBe('No options found');
  type(filter, ''); await nextTick();
  expect(host.querySelector('.hw-multi-select-selected')!.textContent).toBe('0 selected');
  host.querySelector<HTMLInputElement>('input[type=checkbox]')!.click(); await nextTick();
  expect(host.querySelector('.hw-multi-select-selected')!.textContent).toBe('1 selected');
  const plain = mount(() => h(MultiSelect, { ...multiSelectText, label: 'Plain', options }));
  expect(plain.querySelector('.hw-multi-select-selected')).toBeNull();
});

it('[TEXT-01][R09] a missing getResultsMessage leaves the status empty and warns once', async () => {
  const { getResultsMessage: _missing, ...rest } = multiSelectText;
  const host = mount(() => h(MultiSelect as Component, { ...rest, label: 'Letters', options }));
  type(host.querySelector<HTMLInputElement>('input[type=search]')!, 'a'); await nextTick();
  expect(host.querySelector('span[role=status]')!.textContent).toBe('');
  expect(warnings()).toEqual([expect.stringContaining('MultiSelect requires "getResultsMessage"')]);
});

it('[NAME-02][REQ-01][REQ-02] MultiSelect: aria-label alone names the fieldset without legend or warning; required shows one marker', () => {
  const host = mount(() => h('div', [h(MultiSelect, { ...multiSelectText, 'aria-label': 'Letters', options }), h(MultiSelect, { ...multiSelectText, label: 'Required', required: true, options }), h(MultiSelect, { ...multiSelectText, label: 'Optional', options })]));
  const [named, required, optional] = [...host.querySelectorAll('fieldset')];
  expect(named!.getAttribute('aria-label')).toBe('Letters'); expect(named!.querySelector('legend')).toBeNull();
  expect(named!.querySelector('input[type=search]')!.hasAttribute('aria-label')).toBe(false);
  expect(required!.querySelector('legend')!.lastElementChild!.className).toBe('hw-required-marker');
  expect(optional!.querySelector('.hw-required-marker')).toBeNull();
  expect(warnings()).toEqual([]);
});

it('[RO-01][RO-02][RO-03][rich-inputs-6] read-only MultiSelect checkboxes stay focusable and named; click and Space change nothing; hidden inputs submit', async () => {
  const changed = vi.fn();
  const host = mount(() => h('form', [h(MultiSelect, { ...multiSelectText, label: 'Letters', options, name: 'm', readonly: true, defaultValue: ['a'], 'onUpdate:modelValue': changed })]));
  const boxes = [...host.querySelectorAll<HTMLInputElement>('input[type=checkbox]')];
  expect(boxes.map(box => [box.disabled, box.getAttribute('aria-disabled')])).toEqual([[false, 'true'], [false, 'true'], [false, 'true']]);
  expect(host.querySelector('fieldset')!.getAttribute('data-hw-readonly')).toBe('true');
  boxes[1]!.focus(); expect(document.activeElement).toBe(boxes[1]);
  boxes[1]!.click(); boxes[0]!.click(); key(boxes[1]!, ' '); await nextTick();
  expect(boxes.map(box => box.checked)).toEqual([true, false, false]); expect(changed).not.toHaveBeenCalled();
  expect(new FormData(host.querySelector('form')!).getAll('m')).toEqual(['a']);
});

// Submission state (E01)

for (const [name, render, owner] of [
  ['Combobox', () => h(Combobox, { ...comboboxText, label: 'C', options, required: true }), '[role=combobox]'],
  ['TagInput', () => h(TagInput, { ...tagInputText, label: 'T', required: true }), '.hw-tag-input > input'],
  ['MultiSelect', () => h(MultiSelect, { ...multiSelectText, label: 'M', options, required: true }), 'input[type=search]'],
] as const) {
  it(`[INV-01][INV-03][INV-04][INV-05][E01] ${name}: aria-invalid only after a failed submission, until the value is valid or the form resets`, async () => {
    const host = mount(() => h('form', [render()]));
    const form = host.querySelector('form')!; const element = host.querySelector<HTMLInputElement>(owner)!;
    const invalid = () => [element.getAttribute('aria-invalid'), ...(name === 'MultiSelect' ? [host.querySelector('fieldset')!.getAttribute('aria-invalid')] : [])];
    expect(invalid().every(value => value === null)).toBe(true);
    let prevented = true; element.addEventListener('invalid', event => { prevented = event.defaultPrevented; });
    form.checkValidity(); await nextTick();
    expect(invalid().every(value => value === 'true')).toBe(true); expect(prevented).toBe(false);
    if (name === 'Combobox') { element.focus(); await nextTick(); host.querySelector<HTMLElement>('[role=option]')!.click(); }
    if (name === 'TagInput') { type(element, 'x'); key(element, 'Enter'); }
    if (name === 'MultiSelect') host.querySelector<HTMLInputElement>('input[type=checkbox]')!.click();
    await nextTick(); await nextTick();
    expect(invalid().every(value => value === null)).toBe(true);
    form.reset(); await settle(); form.checkValidity(); await nextTick();
    expect(invalid().every(value => value === 'true')).toBe(true);
    form.reset(); await settle();
    expect(invalid().every(value => value === null)).toBe(true);
  });
}

it('[INV-02][E01] a missing requiredMessage still blocks submission without aria-invalid before it, with one warning', async () => {
  const host = mount(() => h('form', [h(Combobox, { emptyMessage: 'None', getResultsMessage: (count: number) => `${count}`, label: 'C', options, required: true })]));
  const input = host.querySelector<HTMLInputElement>('[role=combobox]')!;
  expect(input.hasAttribute('aria-invalid')).toBe(false); expect(input.validity.customError).toBe(true);
  expect(warnings()).toEqual([expect.stringContaining('Combobox requires "requiredMessage"')]);
});

it('[INV-06][INV-07] Combobox, TagInput and MultiSelect: `error` and an explicit aria-invalid set it', () => {
  const host = mount(() => h('div', [
    h(Combobox, { ...comboboxText, label: 'C', options, error: 'E' }), h(TagInput, { ...tagInputText, label: 'T', 'aria-invalid': 'true' }), h(MultiSelect, { ...multiSelectText, label: 'M', options, error: 'E' }),
  ]));
  expect([host.querySelector('[role=combobox]'), host.querySelector('.hw-tag-input > input'), host.querySelector('input[type=search]'), host.querySelector('fieldset')].map(node => node!.getAttribute('aria-invalid'))).toEqual(['true', 'true', 'true', 'true']);
});

// TagInput

it('[TAGINPUT-01][TAGINPUT-02][rich-inputs-8][R19] the box holds the chip list and the text input; each chip holds text, a bare remove button and its hidden input', () => {
  const host = mount(() => h(TagInput, { ...tagInputText, label: 'Tags', hint: 'H', error: 'E', name: 't', form: 'f', defaultValue: ['a', 'b'] }));
  const box = host.querySelector('.hw-tag-input')!;
  expect([...box.children].map(child => child.localName)).toEqual(['ul', 'input']);
  expect(box.firstElementChild!.getAttribute('role')).toBe('list');
  expect(box.lastElementChild!.getAttribute('type')).toBe('text');
  expect(box.previousElementSibling!.localName).toBe('label'); expect(box.nextElementSibling!.className).toBe('hw-hint');
  for (const chip of box.querySelectorAll('li')) {
    expect(chip.className).toBe('hw-chip');
    expect([...chip.childNodes].map(node => node.nodeName)).toEqual(['#text', 'BUTTON', 'INPUT']);
    const button = chip.querySelector('button')!;
    expect([button.type, button.className, button.querySelector('span.hw-icon')!.getAttribute('data-icon')]).toEqual(['button', '', 'cancel-01']);
    const hidden = chip.querySelector('input')!;
    expect([hidden.type, hidden.name, hidden.getAttribute('form'), hidden.value]).toEqual(['hidden', 't', 'f', chip.firstChild!.textContent]);
  }
  expect(host.querySelectorAll('button')).toHaveLength(2);
  const empty = mount(() => h(TagInput, { ...tagInputText, label: 'Empty' }));
  expect(empty.querySelector('ul[role=list]')).not.toBeNull();
});

it('[TAGINPUT-02] Enter and comma commit a draft', async () => {
  const value = ref<readonly string[]>([]);
  const host = mount(() => h(TagInput, { ...tagInputText, label: 'Tags', modelValue: value.value, 'onUpdate:modelValue': (next: readonly string[]) => { value.value = next; } }));
  const input = host.querySelector<HTMLInputElement>('.hw-tag-input > input')!;
  type(input, 'one'); key(input, 'Enter'); await nextTick(); type(input, 'two'); key(input, ','); await nextTick();
  expect(value.value).toEqual(['one', 'two']);
});

it('[FOCUS-04][rich-inputs-8] removing a focused chip moves focus to the next, else the previous remove button, else the input; Backspace keeps focus in the input', async () => {
  const host = mount(() => h(TagInput, { ...tagInputText, label: 'Tags', defaultValue: ['a', 'b', 'c'] }));
  const input = host.querySelector<HTMLInputElement>('.hw-tag-input > input')!;
  const button = (index: number) => host.querySelectorAll<HTMLButtonElement>('li button')[index]!;
  button(1).focus(); button(1).click(); await nextTick(); await nextTick();
  expect(document.activeElement!.getAttribute('aria-label')).toBe('Remove c');
  button(1).click(); await nextTick(); await nextTick();
  expect(document.activeElement!.getAttribute('aria-label')).toBe('Remove a');
  button(0).click(); await nextTick(); await nextTick();
  expect(document.activeElement).toBe(input);
  type(input, 'x'); key(input, 'Enter'); await nextTick(); type(input, ''); input.focus();
  key(input, 'Backspace'); await nextTick(); await nextTick();
  expect(host.querySelectorAll('li')).toHaveLength(0); expect(document.activeElement).toBe(input);
});

it('[RO-02][rich-inputs-8] read-only TagInput: remove buttons are present and disabled; keys and clicks change nothing', async () => {
  const changed = vi.fn();
  const host = mount(() => h(TagInput, { ...tagInputText, label: 'Tags', readonly: true, defaultValue: ['a'], 'onUpdate:modelValue': changed }));
  const button = host.querySelector<HTMLButtonElement>('li button')!;
  expect(button.disabled).toBe(true); button.click();
  const input = host.querySelector<HTMLInputElement>('.hw-tag-input > input')!; key(input, 'Backspace'); await nextTick();
  expect(host.querySelectorAll('li')).toHaveLength(1); expect(changed).not.toHaveBeenCalled();
});

// PinInput

it('[PININPUT-01][rich-inputs-12] no maxlength; separators and Arabic-Indic digits are normalised before the length applies', async () => {
  const events: string[] = [];
  const host = mount(() => h(PinInput, { label: 'Code', length: 6, 'onUpdate:modelValue': (next: string) => events.push(next) }));
  const input = host.querySelector('input')!;
  expect(input.hasAttribute('maxlength')).toBe(false); expect(input.getAttribute('pattern')).toBe('[0-9]{6}');
  const results: string[] = [];
  for (const raw of ['123 456', '12-34-56', '٤٥٦-١٢٣']) { type(input, '', 'deleteContentBackward'); await nextTick(); events.length = 0; type(input, raw, 'insertFromPaste'); await nextTick(); results.push(input.value); expect(events).toEqual([input.value]); }
  expect(results).toEqual(['123456', '123456', '456123']);
});

it('[PININPUT-02] one more typed character keeps the full code and notifies nothing; a longer paste is cut to the length', async () => {
  const events: string[] = [];
  const host = mount(() => h(PinInput, { label: 'Code', length: 4, defaultValue: '1234', 'onUpdate:modelValue': (next: string) => events.push(next) }));
  const input = host.querySelector('input')!;
  type(input, '12345', 'insertText'); await nextTick();
  expect(input.value).toBe('1234'); expect(events).toEqual([]);
  type(input, '987654', 'insertFromPaste'); await nextTick();
  expect(input.value).toBe('9876'); expect(events).toEqual(['9876']);
});

it('[INV-08][INV-03][INV-05][rich-inputs-12] an incomplete code is invalid after blur, after a failed submission, until complete, empty or reset', async () => {
  const host = mount(() => h('form', [h(PinInput, { label: 'Code', length: 6, name: 'pin' })]));
  const form = host.querySelector('form')!; const input = host.querySelector('input')!;
  input.focus(); type(input, '123'); await nextTick();
  expect(input.hasAttribute('aria-invalid')).toBe(false);
  input.blur(); await nextTick(); expect(input.getAttribute('aria-invalid')).toBe('true');
  type(input, '123456'); await nextTick(); expect(input.hasAttribute('aria-invalid')).toBe(false);
  input.focus(); type(input, '12', 'deleteContentBackward'); await nextTick(); input.blur(); await nextTick(); expect(input.getAttribute('aria-invalid')).toBe('true');
  type(input, '', 'deleteContentBackward'); await nextTick(); expect(input.hasAttribute('aria-invalid')).toBe(false);
  type(input, '1'); await nextTick(); form.checkValidity(); await nextTick(); expect(input.getAttribute('aria-invalid')).toBe('true');
  form.reset(); await settle(); expect(input.hasAttribute('aria-invalid')).toBe(false);
});

// PasswordField

it('[STATE-01] PasswordField visible, uncontrolled: the toggle shows and notifies true, then hides and notifies false', async () => {
  const events: boolean[] = [];
  const host = mount(() => h(PasswordField, { ...passwordText, label: 'P', 'onUpdate:visible': (value: boolean) => events.push(value) }));
  const toggle = host.querySelector<HTMLButtonElement>('.hw-password-toggle')!; const input = host.querySelector('input')!;
  toggle.click(); await nextTick(); expect([input.type, toggle.getAttribute('aria-pressed'), toggle.getAttribute('aria-label')]).toEqual(['text', 'true', 'Hide password']);
  toggle.click(); await nextTick(); expect(input.type).toBe('password');
  expect(events).toEqual([true, false]);
});

it('[STATE-02][STATE-03] PasswordField controlled and ignored keeps type=password; a prop change does not notify', async () => {
  const events: boolean[] = []; const visible = ref(false);
  const host = mount(() => h(PasswordField, { ...passwordText, label: 'P', visible: visible.value, 'onUpdate:visible': (value: boolean) => events.push(value) }));
  const input = host.querySelector('input')!;
  host.querySelector<HTMLButtonElement>('.hw-password-toggle')!.click(); await nextTick();
  expect(events).toEqual([true]); expect(input.type).toBe('password');
  visible.value = true; await nextTick(); expect(input.type).toBe('text'); expect(events).toEqual([true]);
});

it('[STATE-04][rich-inputs-14] v-model:visible round-trips', async () => {
  const visible = ref(false);
  const host = mount(() => h(PasswordField, { ...passwordText, label: 'P', visible: visible.value, 'onUpdate:visible': (value: boolean) => { visible.value = value; } }));
  host.querySelector<HTMLButtonElement>('.hw-password-toggle')!.click(); await nextTick();
  expect(visible.value).toBe(true); expect(host.querySelector('input')!.type).toBe('text');
  visible.value = false; await nextTick(); expect(host.querySelector('input')!.type).toBe('password');
});

it('[STATE-05] PasswordField with defaultVisible and with visible renders type=text on the server and hydrates the same', async () => {
  const Application = defineComponent(() => () => h('div', [h(PasswordField, { ...passwordText, label: 'A', defaultVisible: true }), h(PasswordField, { ...passwordText, label: 'B', visible: true })]));
  const markup = await renderToString(createSSRApp(Application));
  expect(markup.match(/type="text"/g)).toHaveLength(2);
  const container = document.createElement('div'); container.innerHTML = markup; document.body.append(container);
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  const hydrated = createSSRApp(Application);
  try { hydrated.mount(container); await nextTick(); expect(warn).not.toHaveBeenCalled(); expect(error).not.toHaveBeenCalled(); }
  finally { hydrated.unmount(); error.mockRestore(); }
});

// SearchField

it('[SEARCH-01][TEXT-02][R27] without showSearchButton there is no submit button and searchLabel is not asked for; with it, it is required', () => {
  const host = mount(() => h('div', [h(SearchField, { ...searchText, label: 'Search' })]));
  expect(host.querySelector('.hw-search-submit')).toBeNull(); expect(warnings()).toEqual([]);
  const shown = mount(() => h(SearchField, { ...searchText, label: 'Search', showSearchButton: true }));
  expect(shown.querySelector('.hw-search-submit')).not.toBeNull();
  expect(warnings()).toEqual([expect.stringContaining('SearchField requires "searchLabel"')]);
});

// FileDropzone

function dropzone(props: Record<string, unknown> = {}) {
  const changed: File[][] = []; const rejected: File[][] = [];
  const host = mount(() => h('form', [h(FileDropzone, { ...dropzoneText, label: 'Upload', name: 'upload', ...props, 'onUpdate:files': (files: File[]) => changed.push(files), onReject: (files: File[]) => rejected.push(files) })]));
  const input = host.querySelector<HTMLInputElement>('input[type=file]')!;
  return { host, input, zone: host.querySelector<HTMLElement>('.hw-file-dropzone')!, form: host.querySelector('form')!, changed, rejected, files: stubFiles(input) };
}

it('[FILEDROPZONE-01][files-2] a mixed batch from the chooser leaves the dropzone empty and reports only the rejected file', async () => {
  const f = dropzone({ accept: '.pdf,.png', multiple: true });
  f.files.choose([file('b.pdf'), file('c.txt')]); await nextTick();
  expect(f.input.files).toHaveLength(0); expect(f.changed).toEqual([]); expect(f.rejected.map(names)).toEqual([['c.txt']]);
});

it('[FILEDROPZONE-02][files-2] two files dropped on a single-file dropzone are both rejected and nothing is held', async () => {
  const f = dropzone({ accept: '.pdf' });
  f.zone.dispatchEvent(dropEvent('drop', [file('a.pdf'), file('b.pdf')])); await nextTick();
  expect(f.input.files).toHaveLength(0); expect(f.changed).toEqual([]); expect(f.rejected.map(names)).toEqual([['a.pdf', 'b.pdf']]);
});

it('[FILEDROPZONE-03] an accepted drop is assigned to the input and notified once; a later rejected batch empties it and notifies [] once', async () => {
  const f = dropzone({ accept: '.pdf' });
  f.zone.dispatchEvent(dropEvent('drop', [file('a.pdf')])); await nextTick();
  expect(names(Array.from(f.input.files!))).toEqual(['a.pdf']); expect(f.changed.map(names)).toEqual([['a.pdf']]);
  f.zone.dispatchEvent(dropEvent('drop', [file('b.txt')])); await nextTick();
  expect(f.input.files).toHaveLength(0); expect(f.changed.map(names)).toEqual([['a.pdf'], []]); expect(f.rejected.map(names)).toEqual([['b.txt']]);
});

it('[FILEDROPZONE-04][TEXT-02][files-3][R07] maxSize rejects a larger file; getRejectedMessage is required with maxSize alone and not without restrictions', async () => {
  const { getRejectedMessage: _missing, ...rest } = dropzoneText;
  const host = mount(() => h('div', [h(FileDropzone as Component, { ...rest, label: 'Plain' })]));
  expect(warnings()).toEqual([]);
  const limited = dropzone({ maxSize: 5 });
  limited.files.choose([file('big.bin', 10)]); await nextTick();
  expect(limited.changed).toEqual([]); expect(limited.rejected.map(names)).toEqual([['big.bin']]);
  const open = dropzone();
  open.files.choose([file('big.bin', 10)]); await nextTick();
  expect(open.changed.map(names)).toEqual([['big.bin']]);
  mount(() => h(FileDropzone as Component, { ...rest, label: 'Limited', maxSize: 5 }));
  expect(warnings()).toEqual([expect.stringContaining('FileDropzone requires "getRejectedMessage" when accept or maxSize is set')]);
  void host;
});

it('[MSG-04][INV-08][files-4][R06] a rejection renders one p.hw-error with role=alert as last child, described by the input, marked invalid, without custom validity', async () => {
  const f = dropzone({ accept: '.pdf', getSelectedMessage: (files: readonly File[]) => `${files.length} selected` });
  f.files.choose([file('c.txt')]); await nextTick();
  const errors = f.zone.querySelectorAll('.hw-error');
  expect(errors).toHaveLength(1); expect(f.zone.lastElementChild).toBe(errors[0]);
  expect([errors[0]!.getAttribute('role'), errors[0]!.textContent]).toEqual(['alert', 'Not accepted: c.txt']);
  expect(f.input.getAttribute('aria-describedby')!.split(' ')).toContain(errors[0]!.id);
  expect(f.input.getAttribute('aria-invalid')).toBe('true'); expect(f.zone.getAttribute('data-state')).toBe('error');
  expect(f.input.validity.customError).toBe(false); expect(f.zone.querySelector('p[role=status]')!.textContent).toBe('');
});

it('[MSG-05] an application error and a rejection render one element with the application text and no role', async () => {
  const f = dropzone({ accept: '.pdf', error: 'Upload the signed form' });
  f.files.choose([file('c.txt')]); await nextTick();
  const errors = f.zone.querySelectorAll('.hw-error');
  expect(errors).toHaveLength(1); expect(errors[0]!.textContent).toBe('Upload the signed form'); expect(errors[0]!.hasAttribute('role')).toBe(false);
});

it('[MSG-06] a missing getRejectedMessage renders no error but keeps aria-invalid and data-state=error, with one warning', async () => {
  const changed: File[][] = [];
  const { getRejectedMessage: _missing, ...rest } = dropzoneText;
  const host = mount(() => h(FileDropzone as Component, { ...rest, label: 'Upload', 'onUpdate:files': (files: File[]) => changed.push(files) }));
  const input = host.querySelector<HTMLInputElement>('input')!; const files = stubFiles(input);
  expect(warnings()).toEqual([]);
  host.querySelector<HTMLElement>('.hw-file-dropzone')!.dispatchEvent(dropEvent('drop', [file('a'), file('b')])); await nextTick();
  expect(host.querySelector('.hw-error')).toBeNull(); expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(host.querySelector('.hw-file-dropzone')!.getAttribute('data-state')).toBe('error');
  expect(warnings()).toEqual([expect.stringContaining('FileDropzone requires "getRejectedMessage" when a selection was rejected')]);
  void files;
});

it('[MSG-07][RESET-02][RESET-03][RESET-09][files-5] the message goes after an accepted batch and after a reset; a reset notifies [] only when files were held', async () => {
  const f = dropzone({ accept: '.pdf' });
  f.files.choose([file('c.txt')]); await nextTick();
  f.files.choose([file('a.pdf')]); await nextTick();
  expect(f.zone.querySelector('.hw-error')).toBeNull(); expect(f.input.hasAttribute('aria-invalid')).toBe(false); expect(f.zone.hasAttribute('data-state')).toBe(false);
  f.files.choose([file('c.txt')]); await nextTick(); f.changed.length = 0;
  f.form.reset(); await settle();
  expect(f.zone.querySelector('.hw-error')).toBeNull(); expect(f.zone.hasAttribute('data-state')).toBe(false); expect(f.changed).toEqual([]);
  f.files.choose([file('a.pdf')]); await nextTick(); f.changed.length = 0;
  f.form.reset(); await settle();
  expect(f.changed).toEqual([[]]);
});

it('[FILEDROPZONE-05][FILEDROPZONE-06][MSG-02][REQ-01][files-6][R08] one root holds label, instruction, input, status, content, hint and error; no file list', async () => {
  const f = dropzone({ required: true, hint: 'H', error: 'E', 'aria-describedby': 'app', getSelectedMessage: (files: readonly File[]) => `${files.length} selected` });
  void f;
  const host = mount(() => h(FileDropzone, { ...dropzoneText, label: 'Upload', required: true, hint: 'H', error: 'E', 'aria-describedby': 'app', getSelectedMessage: (files: readonly File[]) => `${files.length} selected` }, () => h('ul', { class: 'hw-file-upload-list' })));
  const root = host.firstElementChild!;
  expect(root.className).toBe('hw-field hw-file-dropzone');
  expect([...root.children].map(child => child.localName + (child.className ? `.${child.className.split(' ').join('.')}` : ''))).toEqual(['label.hw-label', 'p.hw-file-dropzone-instruction', 'input.hw-input', 'p', 'ul.hw-file-upload-list', 'p.hw-hint', 'p.hw-error']);
  const label = root.querySelector('label')!;
  expect(label.lastElementChild!.className).toBe('hw-required-marker'); expect(root.querySelectorAll('.hw-required-marker')).toHaveLength(1);
  const input = root.querySelector('input')!;
  expect(input.required).toBe(true);
  expect(input.getAttribute('aria-describedby')).toBe(`app ${input.id}-instruction ${input.id}-hint ${input.id}-error`);
  const files = stubFiles(input); files.choose([file('a.pdf', 1234)]); await nextTick();
  expect(root.querySelectorAll(':scope > ul:not(.hw-file-upload-list)')).toHaveLength(0); expect(root.textContent).not.toMatch(/1234/);
});

it('[FILEDROPZONE-07][files-6] a file drag sets data-state=dragging; leaving to a child keeps it, leaving the root clears it', async () => {
  const f = dropzone();
  const over = dropEvent('dragover', []); f.zone.dispatchEvent(over); await nextTick();
  expect(over.defaultPrevented).toBe(true); expect(f.zone.getAttribute('data-state')).toBe('dragging');
  expect(f.zone.hasAttribute('data-dragging')).toBe(false); expect(f.zone.hasAttribute('data-dragover')).toBe(false);
  f.zone.dispatchEvent(new MouseEvent('dragleave', { bubbles: true, relatedTarget: f.input })); await nextTick();
  expect(f.zone.getAttribute('data-state')).toBe('dragging');
  f.zone.dispatchEvent(new MouseEvent('dragleave', { bubbles: true, relatedTarget: document.body })); await nextTick();
  expect(f.zone.hasAttribute('data-state')).toBe(false);
});

it('[RO-01][RO-02][RO-04][files-9] a read-only dropzone keeps an enabled, focusable, named input with aria-disabled; click and Space are prevented; drops change nothing', async () => {
  const f = dropzone({ readonly: true });
  expect(f.input.disabled).toBe(false); expect(f.input.name).toBe('upload');
  expect(f.input.getAttribute('aria-disabled')).toBe('true'); expect(f.input.hasAttribute('aria-readonly')).toBe(false);
  expect(f.zone.getAttribute('data-hw-readonly')).toBe('true');
  f.input.focus(); expect(document.activeElement).toBe(f.input);
  const click = new MouseEvent('click', { bubbles: true, cancelable: true }); f.input.dispatchEvent(click);
  const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }); f.input.dispatchEvent(space);
  expect([click.defaultPrevented, space.defaultPrevented]).toEqual([true, true]);
  f.zone.dispatchEvent(dropEvent('drop', [file('a.pdf')])); await nextTick();
  expect(f.input.files).toHaveLength(0); expect(f.changed).toEqual([]); expect(f.rejected).toEqual([]);
});

it('[RO-03][RO-05][files-9] files chosen before read-only stay selected, and switching read-only off and on keeps them', async () => {
  const readonly = ref(false); const changed: File[][] = [];
  const host = mount(() => h(FileDropzone, { ...dropzoneText, label: 'Upload', readonly: readonly.value, 'onUpdate:files': (files: File[]) => changed.push(files) }));
  const input = host.querySelector<HTMLInputElement>('input')!; const files = stubFiles(input);
  files.choose([file('a.pdf')]); await nextTick();
  readonly.value = true; await nextTick(); expect(input.getAttribute('aria-disabled')).toBe('true'); expect(input.files).toHaveLength(1);
  readonly.value = false; await nextTick(); expect(input.hasAttribute('aria-disabled')).toBe(false); expect(input.files).toHaveLength(1);
  expect(changed.map(names)).toEqual([['a.pdf']]);
});

it('[SSR-01] a dropzone with accept renders no error and no aria-invalid on the server; required Combobox, TagInput and MultiSelect render no aria-invalid', async () => {
  const markup = await renderToString(createSSRApp({ render: () => h('form', [
    h(FileDropzone, { ...dropzoneText, label: 'Upload', accept: '.pdf' }),
    h(Combobox, { ...comboboxText, label: 'C', options, required: true }), h(TagInput, { ...tagInputText, label: 'T', required: true }),
    h(MultiSelect, { ...multiSelectText, label: 'M', options, required: true, getSelectedMessage: (count: number) => `${count}` }),
  ]) }));
  expect(markup).not.toContain('hw-error'); expect(markup).not.toContain('aria-invalid');
  expect(markup).toContain('role="status" aria-live="polite" aria-atomic="true"></span>');
});

// FileUpload

it('[FILEUPLOAD-01][REQ-01][REQ-04][files-10] slot content follows the input inside div.hw-upload, before the hint; required shows one marker', () => {
  const host = mount(() => h(FileUpload, { label: 'Upload', hint: 'H', required: true }, () => h('ul', { class: 'hw-file-upload-list' })));
  const root = host.querySelector('.hw-field.hw-upload')!;
  expect([...root.children].map(child => child.localName)).toEqual(['label', 'input', 'ul', 'p']);
  expect(root.querySelector('label')!.lastElementChild!.className).toBe('hw-required-marker');
  expect(root.querySelector('input')!.required).toBe(true);
});

it('[RESET-03][files-5] FileUpload notifies [] on reset only when files were held', async () => {
  const changed: File[][] = [];
  const host = mount(() => h('form', [h(FileUpload, { label: 'Upload', 'onUpdate:files': (files: File[]) => changed.push(files) })]));
  const form = host.querySelector('form')!; const files = stubFiles(host.querySelector('input')!);
  form.reset(); await settle(); expect(changed).toEqual([]);
  files.choose([file('a.pdf')]); await nextTick(); changed.length = 0;
  form.reset(); await settle(); expect(changed).toEqual([[]]);
});
