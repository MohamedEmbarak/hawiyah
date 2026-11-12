import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, useState } from 'react';
import type { ReactNode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import { resetTextWarnings } from '@hawiyah/core';
import { Combobox, FileDropzone, FileUpload, MultiSelect, PasswordField, PinInput, SearchField, TagInput } from './src/index.js';
import type { ComboboxProps, FileDropzoneProps, MultiSelectProps, SearchFieldProps, TagInputProps } from './src/index.js';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const roots: ReturnType<typeof createRoot>[] = [];
let warn: ReturnType<typeof vi.spyOn>;
let expected: RegExp[] = [];
const warnings = () => (warn.mock.calls as unknown[][]).map(call => String(call[0])).filter(message => message.startsWith('Hawiyah:'));
beforeEach(() => { resetTextWarnings(); expected = []; warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined); });
afterEach(async () => {
  for (const root of roots.splice(0)) await act(async () => root.unmount());
  document.body.replaceChildren();
  const seen = warnings();
  expect(seen.length, seen.join('\n')).toBe(expected.length); expected.forEach((pattern, index) => expect(seen[index]).toMatch(pattern));
  warn.mockRestore();
});
async function mount(node: ReactNode) {
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host); roots.push(root);
  await act(async () => root.render(node));
  return { host, form: host.querySelector('form')!, render: (next: ReactNode) => act(async () => root.render(next)) };
}
const q = <T extends Element = HTMLInputElement>(host: Element, selector: string) => host.querySelector<T>(selector)!;
const children = (element: Element) => Array.from(element.children).map(child => child.localName + (child.className ? `.${child.className.split(' ').join('.')}` : ''));
function setValue(element: HTMLInputElement, value: string, inputType?: string) {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(element, value);
  element.dispatchEvent(inputType ? new InputEvent('input', { bubbles: true, inputType }) : new Event('input', { bubbles: true }));
}
const key = (element: Element, value: string) => element.dispatchEvent(new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }));
const reset = (form: HTMLFormElement) => act(async () => { form.reset(); });
const submit = (form: HTMLFormElement) => act(async () => { form.requestSubmit(); });
const options = [{ value: 'a', label: 'أ' }, { value: 'b', label: 'ب' }, { value: 'c', label: 'ج' }];
const comboTexts = { options, emptyMessage: 'لا نتائج', getResultsMessage: (count: number) => `${count} نتائج` };
const multiTexts = { options, searchLabel: 'تصفية', emptyMessage: 'لا نتائج', getResultsMessage: (count: number) => `${count} خيارات` };
const tagTexts = { getRemoveLabel: (tag: string) => `إزالة ${tag}` };
const file = (name: string, type: string, content = 'x') => new File([content], name, { type });
function choose(input: HTMLInputElement, files: File[]) {
  Object.defineProperty(input, 'files', { configurable: true, value: files });
  return act(async () => { input.dispatchEvent(new Event('change', { bubbles: true })); });
}
async function drag(target: Element, type: 'dragover' | 'dragleave' | 'drop', transfer: Record<string, unknown>, related?: Element) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'dataTransfer', { value: transfer }); if (related) Object.defineProperty(event, 'relatedTarget', { value: related });
  await act(async () => { target.dispatchEvent(event); });
  return event;
}

/* Combobox */
it('[COMBOBOX-01][REQ-01][rich-inputs-1] the field holds label, div.hw-combobox, hint and error; the box holds input, hidden input, listbox and status', async () => {
  const { host } = await mount(<Combobox id="city" label="المدينة" hint="تلميح" error="خطأ" required requiredMessage="اختر مدينة" {...comboTexts} />);
  const field = q(host, '.hw-field');
  expect(children(field)).toEqual(['label.hw-label', 'div.hw-combobox', 'p.hw-hint', 'p.hw-error']);
  expect(children(q(host, '.hw-combobox'))).toEqual(['input.hw-input', 'input', 'ul.hw-listbox', 'span.hw-sr-only']);
  expect(q(host, 'label').lastElementChild!.className).toBe('hw-required-marker');
  expect(q(host, 'ul').getAttribute('aria-labelledby')).toBe('city-label');
});

it('[STATE-01][STATE-02][STATE-03][rich-inputs-2] open is notified for reader actions only; a controlled open stays as the application holds it', async () => {
  const opened = vi.fn();
  const { host, render } = await mount(<Combobox label="المدينة" {...comboTexts} onOpenChange={opened} />);
  const input = q(host, 'input[role=combobox]');
  await act(async () => { input.focus(); });
  expect(opened.mock.calls).toEqual([[true]]); expect(input.getAttribute('aria-expanded')).toBe('true');
  await act(async () => { key(input, 'Escape'); });
  expect(opened.mock.calls).toEqual([[true], [false]]); expect(q(host, 'ul').hidden).toBe(true);
  opened.mockClear();
  await render(<Combobox label="المدينة" {...comboTexts} open onOpenChange={opened} />);
  expect(opened).not.toHaveBeenCalled(); expect(q(host, 'ul').hidden).toBe(false);
  await act(async () => { key(input, 'Escape'); });
  expect(opened.mock.calls).toEqual([[false]]); expect(q(host, 'ul').hidden).toBe(false);
  await render(<Combobox label="المدينة" {...comboTexts} open={false} onOpenChange={opened} />);
  expect(opened).toHaveBeenCalledTimes(1);
});

it('[COMBOBOX-03][COMBOBOX-04][rich-inputs-2] query is notified per accepted input event only; value only when it changed', async () => {
  const query = vi.fn(), value = vi.fn();
  const { host, form, render } = await mount(<form><Combobox name="city" label="المدينة" {...comboTexts} onQueryChange={query} onValueChange={value} /></form>);
  const input = q(host, 'input[role=combobox]');
  await act(async () => { input.focus(); setValue(input, 'ب'); });
  expect(query.mock.calls).toEqual([['ب']]); expect(value).not.toHaveBeenCalled();
  await act(async () => { q<HTMLElement>(host, '[role=option]').click(); });
  expect(value.mock.calls).toEqual([['b', options[1]]]); expect(query).toHaveBeenCalledTimes(1);
  await reset(form);
  await render(<form><Combobox name="city" label="المدينة" {...comboTexts} value="c" onQueryChange={query} onValueChange={value} /></form>);
  expect(query).toHaveBeenCalledTimes(1);
});

it('[RESET-01][RESET-02][RESET-03][RESET-04][RESET-05][RESET-09][rich-inputs-5] Combobox reset target, single notification and closed popup', async () => {
  const value = vi.fn(), opened = vi.fn(), untouched = vi.fn();
  function Controlled() { const [city, setCity] = useState('c'); return <Combobox name="applied" label="م" {...comboTexts} defaultValue="a" value={city} onValueChange={next => setCity(next)} />; }
  const { host, form } = await mount(<form>
    <Combobox name="city" label="المدينة" {...comboTexts} defaultValue="a" onValueChange={value} onOpenChange={opened} />
    <Combobox name="untouched" label="ثابت" {...comboTexts} defaultValue="b" onValueChange={untouched} />
    <Combobox name="ignored" label="مقيد" {...comboTexts} value="c" onValueChange={value} />
    <Controlled />
  </form>);
  const input = q(host, 'input[role=combobox]');
  await act(async () => { input.focus(); setValue(input, 'ج'); });
  await act(async () => { q<HTMLElement>(host, '[role=option]').click(); });
  await act(async () => { input.focus(); setValue(input, 'ب'); });
  value.mockClear(); opened.mockClear();
  await reset(form);
  expect(value.mock.calls).toEqual([['a', options[0]], ['', undefined]]); expect(opened.mock.calls).toEqual([[false]]); expect(untouched).not.toHaveBeenCalled();
  expect(input.value).toBe('أ'); expect(q(host, 'ul').hidden).toBe(true);
  expect(Object.fromEntries(new FormData(form))).toEqual({ city: 'a', untouched: 'b', ignored: 'c', applied: 'a' });
  expect(q(host, 'input[role=combobox][aria-controls$=listbox]').value).toBe('أ');
  expect(Array.from(host.querySelectorAll<HTMLInputElement>('input[role=combobox]'), element => element.value)).toEqual(['أ', 'ب', 'ج', 'أ']);
});

it('[INV-01][INV-02][INV-03][INV-04][INV-05][E01] Combobox is invalid after a failed submission until valid or reset', async () => {
  const { host, form } = await mount(<form><Combobox name="city" label="المدينة" {...comboTexts} required requiredMessage="اختر مدينة" /><Combobox {...({ name: 'free', label: 'دون رسالة', ...comboTexts, required: true } as unknown as ComboboxProps)} /></form>);
  const [input, unnamed] = Array.from(host.querySelectorAll<HTMLInputElement>('input[role=combobox]'));
  expect(input.hasAttribute('aria-invalid')).toBe(false); expect(unnamed.hasAttribute('aria-invalid')).toBe(false); expect(unnamed.validity.customError).toBe(true);
  const invalid = vi.fn((event: Event) => event.defaultPrevented); input.addEventListener('invalid', invalid);
  await submit(form);
  expect(input.getAttribute('aria-invalid')).toBe('true'); expect(invalid.mock.results[0]!.value).toBe(false);
  await act(async () => { input.focus(); });
  await act(async () => { q<HTMLElement>(host, '[role=option]').click(); });
  expect(input.hasAttribute('aria-invalid')).toBe(false);
  await reset(form); await submit(form); expect(input.getAttribute('aria-invalid')).toBe('true');
  await reset(form); expect(input.hasAttribute('aria-invalid')).toBe(false);
  expected = [/Combobox requires "requiredMessage"/];
});

/* MultiSelect */
it('[MULTISELECT-01][MULTISELECT-02][REQ-01][FMT-05][rich-inputs-6][R10][R09] MultiSelect structure, visible filter label and status texts', async () => {
  const { host, form } = await mount(<form><MultiSelect id="services" name="services" label="الخدمات" {...multiTexts} required requiredMessage="اختر خدمة" defaultValue={['a']} getSelectedMessage={count => `${count} مختارة`} hint="تلميح" error="خطأ" /></form>);
  const fieldset = q(host, 'fieldset');
  expect(fieldset.className).toBe('hw-field hw-multi-select');
  expect(children(fieldset)).toEqual(['legend.hw-label', 'label.hw-label', 'input.hw-input', 'div.hw-multi-select-options', 'span.hw-sr-only', 'p.hw-multi-select-selected', 'input', 'p.hw-hint', 'p.hw-error']);
  expect(q(host, 'legend').lastElementChild!.outerHTML).toBe('<span class="hw-required-marker" aria-hidden="true"> *</span>');
  const filter = q(host, 'input[type=search]');
  expect(filter.hasAttribute('aria-label')).toBe(false); expect(q(host, `label[for="${filter.id}"]`).textContent).toBe('تصفية');
  expect(children(q(host, '.hw-multi-select-options'))).toEqual(['label.hw-choice', 'label.hw-choice', 'label.hw-choice']);
  const status = q(host, 'span[role=status]'); const selected = q(host, '.hw-multi-select-selected');
  expect([status.getAttribute('aria-live'), status.getAttribute('aria-atomic'), status.textContent]).toEqual(['polite', 'true', '']);
  expect(selected.getAttribute('role')).toBe('status'); expect(selected.textContent).toBe('1 مختارة');
  await act(async () => { setValue(filter, 'ب'); });
  expect(status.textContent).toBe('1 خيارات');
  await act(async () => { setValue(filter, 'zz'); });
  expect(status.textContent).toBe('0 خيارات'); expect(q(host, '.hw-multi-select-options .hw-hint').textContent).toBe('لا نتائج');
  await act(async () => { setValue(filter, ''); });
  await act(async () => { host.querySelectorAll<HTMLInputElement>('[type=checkbox]')[2].click(); });
  expect(selected.textContent).toBe('2 مختارة');
  await reset(form);
  expect(status.textContent).toBe(''); expect(filter.value).toBe(''); expect(selected.textContent).toBe('1 مختارة');
});

it('[MULTISELECT-02][TEXT-01][NAME-02] a missing searchLabel or getResultsMessage renders nothing and warns once; aria-label alone names the group', async () => {
  const { host } = await mount(<div>
    <MultiSelect {...({ label: 'الخدمات', options, emptyMessage: 'لا نتائج' } as unknown as MultiSelectProps)} />
    <MultiSelect aria-label="الخدمات" {...multiTexts} />
  </div>);
  const [first, second] = Array.from(host.querySelectorAll('fieldset'));
  expect(first!.querySelector('label.hw-label')).toBeNull();
  await act(async () => { setValue(first!.querySelector('input[type=search]')!, 'أ'); });
  expect(first!.querySelector('span[role=status]')!.textContent).toBe('');
  expect(second!.querySelector('legend')).toBeNull(); expect(second!.getAttribute('aria-label')).toBe('الخدمات');
  expected = [/MultiSelect requires "searchLabel"/, /MultiSelect requires "getResultsMessage"/];
});

it('[RO-01][RO-02][RO-03][rich-inputs-6] read-only MultiSelect checkboxes stay focusable and change nothing', async () => {
  const changed = vi.fn();
  const { host, form } = await mount(<form><MultiSelect name="services" label="الخدمات" {...multiTexts} defaultValue={['a']} readOnly onValueChange={changed} /></form>);
  const box = q(host, '[type=checkbox]');
  expect(box.disabled).toBe(false); expect(box.getAttribute('aria-disabled')).toBe('true'); expect(q(host, 'fieldset').getAttribute('data-hw-readonly')).toBe('true');
  box.focus(); expect(document.activeElement).toBe(box);
  await act(async () => { box.click(); host.querySelectorAll<HTMLInputElement>('[type=checkbox]')[1].click(); });
  expect(changed).not.toHaveBeenCalled(); expect(box.checked).toBe(true); expect(new FormData(form).getAll('services')).toEqual(['a']);
});

it('[RESET-02][RESET-05][RESET-07][RESET-09][INV-03][INV-04][INV-05][E01][rich-inputs-5] MultiSelect reset and failed submission', async () => {
  const changed = vi.fn();
  const { host, form } = await mount(<form>
    <MultiSelect id="m" name="services" label="الخدمات" {...multiTexts} required requiredMessage="اختر خدمة" onValueChange={changed} />
    <MultiSelect name="held" label="مقيد" {...multiTexts} value={['b']} onValueChange={changed} readOnly />
  </form>);
  const fieldset = q(host, '#m'); const filter = fieldset.querySelector<HTMLInputElement>('input[type=search]')!;
  expect(fieldset.hasAttribute('aria-invalid')).toBe(false);
  await submit(form);
  expect(fieldset.getAttribute('aria-invalid')).toBe('true'); expect(filter.getAttribute('aria-invalid')).toBe('true');
  await act(async () => { fieldset.querySelector<HTMLInputElement>('[type=checkbox]')!.click(); });
  expect(fieldset.hasAttribute('aria-invalid')).toBe(false); expect(changed.mock.calls).toEqual([[['a']]]);
  const held = host.querySelectorAll('fieldset')[1]!; const heldBox = held.querySelectorAll<HTMLInputElement>('[type=checkbox]')[1]!;
  heldBox.checked = false; changed.mockClear();
  await reset(form);
  // Both values differ from the empty target: the controlled one is notified too and keeps the application's value.
  expect(changed.mock.calls).toEqual([[[]], [[]]]);
  expect(held.querySelectorAll<HTMLInputElement>('[type=checkbox]')[1]!.checked).toBe(true);
  expect(new FormData(form).getAll('held')).toEqual(['b']); expect(new FormData(form).getAll('services')).toEqual([]);
  await submit(form); await reset(form);
  expect(fieldset.hasAttribute('aria-invalid')).toBe(false); expect(filter.hasAttribute('aria-invalid')).toBe(false);
});

/* TagInput */
it('[TAGINPUT-01][TAGINPUT-02][rich-inputs-8][R19] TagInput box holds the list and the input; Enter and comma commit; no add button', async () => {
  const changed = vi.fn();
  const { host, form } = await mount(<form><TagInput id="tags" name="tags" label="الوسوم" hint="تلميح" {...tagTexts} onValueChange={changed} /></form>);
  const field = q(host, '.hw-field'); const box = q(host, '.hw-tag-input');
  expect(children(field)).toEqual(['label.hw-label', 'div.hw-tag-input', 'p.hw-hint']);
  expect(children(box)).toEqual(['ul', 'input.hw-input']); expect(q(host, 'ul').getAttribute('role')).toBe('list');
  const input = q(host, '#tags');
  await act(async () => { setValue(input, 'أول'); }); await act(async () => { key(input, 'Enter'); });
  await act(async () => { setValue(input, 'ثان'); }); await act(async () => { key(input, ','); });
  expect(changed.mock.calls).toEqual([[['أول']], [['أول', 'ثان']]]); expect(new FormData(form).getAll('tags')).toEqual(['أول', 'ثان']);
  const chip = q(host, 'li.hw-chip');
  expect(children(chip)).toEqual(['button', 'input']); expect(chip.firstChild!.textContent).toBe('أول');
  expect(q(host, 'li.hw-chip button').className).toBe(''); expect(q(host, 'li.hw-chip button').getAttribute('type')).toBe('button');
  expect(Array.from(host.querySelectorAll('button'), button => button.getAttribute('aria-label'))).toEqual(['إزالة أول', 'إزالة ثان']);
});

it('[FOCUS-04][rich-inputs-8] removing a chip with its button moves focus next, else previous, else to the input; Backspace keeps focus in the input', async () => {
  const { host } = await mount(<TagInput id="tags" label="الوسوم" {...tagTexts} defaultValue={['أ', 'ب', 'ج', 'د']} />);
  const buttons = () => Array.from(host.querySelectorAll<HTMLButtonElement>('li button'));
  const remove = async (index: number) => { const button = buttons()[index]!; button.focus(); await act(async () => { button.click(); }); };
  await remove(1); expect(document.activeElement).toBe(buttons()[1]); expect(document.activeElement!.getAttribute('aria-label')).toBe('إزالة ج');
  await remove(2); expect(document.activeElement).toBe(buttons()[1]); expect(document.activeElement!.getAttribute('aria-label')).toBe('إزالة ج');
  const input = q(host, '#tags'); input.focus();
  await act(async () => { key(input, 'Backspace'); }); expect(document.activeElement).toBe(input);
  await remove(0); expect(document.activeElement).toBe(input); expect(buttons()).toHaveLength(0);
});

it('[RO-02][RESET-07][RESET-09][INV-03][INV-04][INV-05][E01] TagInput read-only buttons, reset of a read-only input and failed submission', async () => {
  const changed = vi.fn();
  const { host, form, render } = await mount(<form><TagInput id="tags" name="tags" label="الوسوم" {...tagTexts} defaultValue={['أ']} readOnly onValueChange={changed} /></form>);
  const button = q<HTMLButtonElement>(host, 'li button');
  expect(button.disabled).toBe(true);
  await act(async () => { key(q(host, '#tags'), 'Backspace'); }); expect(changed).not.toHaveBeenCalled();
  await render(<form><TagInput id="tags" name="tags" label="الوسوم" {...tagTexts} defaultValue={['أ']} required requiredMessage="أضف وسمًا" onValueChange={changed} /></form>);
  const input = q(host, '#tags');
  await act(async () => { q<HTMLButtonElement>(host, 'li button').click(); });
  await act(async () => { setValue(input, 'مسودة'); });
  await submit(form); expect(input.getAttribute('aria-invalid')).toBe('true');
  await act(async () => { key(input, 'Enter'); }); expect(input.hasAttribute('aria-invalid')).toBe(false);
  await act(async () => { setValue(input, 'مسودة ثانية'); }); changed.mockClear();
  await reset(form);
  expect(changed.mock.calls).toEqual([[['أ']]]); expect(input.value).toBe(''); expect(new FormData(form).getAll('tags')).toEqual(['أ']);
});

/* PinInput */
it('[PININPUT-01][PININPUT-02][rich-inputs-12] separators and Arabic-Indic digits are normalised before the length is applied', async () => {
  const changed = vi.fn();
  const { host } = await mount(<PinInput id="pin" label="الرمز" onValueChange={changed} />);
  const input = q(host, '#pin');
  expect(input.hasAttribute('maxlength')).toBe(false); expect(input.getAttribute('pattern')).toBe('[0-9]{6}');
  for (const [raw, value] of [['123 456', '123456'], ['12-34-56', '123456'], ['٤٥٦-١٢٣', '456123']] as const) {
    await act(async () => { setValue(input, ''); }); changed.mockClear();
    await act(async () => { setValue(input, raw); });
    expect(input.value).toBe(value); expect(changed.mock.calls).toEqual([[value]]);
  }
  changed.mockClear();
  await act(async () => { setValue(input, '4561237', 'insertText'); });
  expect(input.value).toBe('456123'); expect(changed).not.toHaveBeenCalled();
  await act(async () => { setValue(input, '9876543', 'insertFromPaste'); });
  expect(input.value).toBe('987654'); expect(changed.mock.calls).toEqual([['987654']]);
});

it('[INV-08][INV-03][INV-05][RESET-01][RESET-07][rich-inputs-12] an incomplete PIN is invalid after blur or a failed submission until complete, empty or reset', async () => {
  const { host, form } = await mount(<form><PinInput id="pin" name="pin" label="الرمز" defaultValue="12" /><PinInput id="locked" name="locked" label="مقفل" defaultValue="99" readOnly /></form>);
  const input = q(host, '#pin');
  await act(async () => { input.focus(); setValue(input, '123'); });
  expect(input.hasAttribute('aria-invalid')).toBe(false);
  await act(async () => { input.blur(); }); expect(input.getAttribute('aria-invalid')).toBe('true');
  await act(async () => { setValue(input, '123456'); }); expect(input.hasAttribute('aria-invalid')).toBe(false);
  await act(async () => { setValue(input, '123'); input.blur(); }); await act(async () => { setValue(input, ''); });
  expect(input.hasAttribute('aria-invalid')).toBe(false);
  await act(async () => { setValue(input, '1'); }); await submit(form);
  expect(input.getAttribute('aria-invalid')).toBe('true');
  await reset(form);
  expect(input.hasAttribute('aria-invalid')).toBe(false); expect(Object.fromEntries(new FormData(form))).toEqual({ pin: '12', locked: '99' });
});

/* PasswordField */
it('[STATE-01][STATE-02][STATE-03][RESET-09][rich-inputs-14][rich-inputs-5] PasswordField visible: notified per toggle, controlled by the application, hidden by a reset', async () => {
  const visible = vi.fn(); const texts = { label: 'كلمة المرور', showLabel: 'إظهار', hideLabel: 'إخفاء' };
  const { host, form, render } = await mount(<form><PasswordField id="p" {...texts} defaultVisible onVisibleChange={visible} /></form>);
  const input = q(host, '#p'); const toggle = () => act(async () => { q<HTMLButtonElement>(host, '.hw-password-toggle').click(); });
  expect(input.type).toBe('text');
  await toggle(); expect(visible.mock.calls).toEqual([[false]]); expect(input.type).toBe('password');
  await toggle(); expect(visible.mock.calls).toEqual([[false], [true]]);
  visible.mockClear(); await reset(form);
  expect(input.type).toBe('password'); expect(visible.mock.calls).toEqual([[false]]);
  visible.mockClear();
  await render(<form><PasswordField id="p" {...texts} visible={false} onVisibleChange={visible} /></form>);
  await toggle(); expect(visible.mock.calls).toEqual([[true]]); expect(q(host, '#p').type).toBe('password');
  await render(<form><PasswordField id="p" {...texts} visible onVisibleChange={visible} /></form>);
  expect(visible).toHaveBeenCalledTimes(1); expect(q(host, '#p').type).toBe('text');
});

/* SearchField */
it('[SEARCH-01][TEXT-02][R27][RESET-02][rich-inputs-5] the search button is off by default and requires searchLabel only when on; a reset notifies the target once', async () => {
  const changed = vi.fn();
  const { host, form, render } = await mount(<form><SearchField name="q" label="البحث" clearLabel="مسح" defaultValue="أ" onValueChange={changed} /></form>);
  expect(host.querySelector('.hw-search-submit')).toBeNull();
  await act(async () => { setValue(q(host, 'input[type=search]'), 'ب'); }); changed.mockClear();
  await reset(form); expect(changed.mock.calls).toEqual([['أ']]); expect(q(host, 'input[type=search]').value).toBe('أ');
  await render(<form><SearchField {...({ name: 'q', label: 'البحث', clearLabel: 'مسح', showSearchButton: true } as unknown as SearchFieldProps)} /></form>);
  expect(host.querySelector('.hw-search-submit')).not.toBeNull();
  expected = [/SearchField requires "searchLabel" when showSearchButton is on/];
});

/* FileDropzone */
it('[FILEDROPZONE-01][FILEDROPZONE-02][FILEDROPZONE-04][files-2][files-3][R07] any rejected file empties the selection and is reported once', async () => {
  const files = vi.fn(), rejected = vi.fn();
  const message = (list: readonly File[]) => `${list.length} مرفوض`;
  const { host, render } = await mount(<FileDropzone id="d" label="المرفقات" dropLabel="أفلت" accept=".pdf,.png" multiple getRejectedMessage={message} onFilesChange={files} onReject={rejected} />);
  const input = q(host, '#d'); const pdf = file('b.pdf', 'application/pdf'), txt = file('c.txt', 'text/plain');
  await choose(input, [pdf, txt]);
  expect(rejected.mock.calls).toEqual([[[txt]]]); expect(files).not.toHaveBeenCalled(); expect(input.value).toBe('');
  rejected.mockClear();
  await render(<FileDropzone id="d" label="المرفقات" dropLabel="أفلت" getRejectedMessage={message} onFilesChange={files} onReject={rejected} />);
  const two = [file('a.pdf', 'application/pdf'), file('b.pdf', 'application/pdf')];
  await drag(q(host, '.hw-file-dropzone'), 'drop', { files: two, types: ['Files'] });
  expect(rejected.mock.calls).toEqual([[two]]); expect(files).not.toHaveBeenCalled();
  rejected.mockClear();
  const large = file('big.pdf', 'application/pdf', '0123456789');
  await render(<FileDropzone id="d" label="المرفقات" dropLabel="أفلت" maxSize={5} getRejectedMessage={message} onFilesChange={files} onReject={rejected} />);
  await choose(input, [large]); expect(rejected.mock.calls).toEqual([[[large]]]); expect(files).not.toHaveBeenCalled();
  await render(<FileDropzone id="d" label="المرفقات" dropLabel="أفلت" getRejectedMessage={message} onFilesChange={files} onReject={rejected} />);
  await choose(input, [large]); expect(files.mock.calls).toEqual([[[large]]]); expect(rejected).toHaveBeenCalledTimes(1);
});

it('[FILEDROPZONE-03][MSG-04][MSG-05][MSG-07][INV-08][files-4][R06] an accepted drop is assigned; a rejection is the alert error until the next accepted batch', async () => {
  const files = vi.fn();
  const message = (list: readonly File[]) => `${list.map(item => item.name).join('، ')} غير مقبول`;
  const { host, render } = await mount(<FileDropzone id="d" label="المرفقات" dropLabel="أفلت" accept=".pdf" getRejectedMessage={message} getSelectedMessage={list => `${list.length} ملف`} onFilesChange={files} aria-describedby="extra" />);
  const root = q(host, '.hw-file-dropzone'); const input = q(host, '#d');
  let assigned: unknown = undefined;
  Object.defineProperty(input, 'files', { configurable: true, get: () => assigned, set: (value: unknown) => { assigned = value; } });
  const pdf = file('a.pdf', 'application/pdf');
  await drag(root, 'drop', { files: [pdf], types: ['Files'] });
  expect(assigned).toEqual([pdf]); expect(files.mock.calls).toEqual([[[pdf]]]);
  await drag(root, 'drop', { files: [file('b.txt', 'text/plain')], types: ['Files'] });
  expect(files.mock.calls).toEqual([[[pdf]], [[]]]);
  const error = q(host, '.hw-error');
  expect(error.getAttribute('role')).toBe('alert'); expect(error.textContent).toBe('b.txt غير مقبول'); expect(root.lastElementChild).toBe(error);
  expect(input.getAttribute('aria-describedby')).toBe(`extra d-instruction ${error.id}`); expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(input.validity.customError).toBe(false); expect(root.getAttribute('data-state')).toBe('error'); expect(q(host, 'p[role=status]').textContent).toBe('');
  await render(<FileDropzone id="d" label="المرفقات" dropLabel="أفلت" accept=".pdf" getRejectedMessage={message} onFilesChange={files} error="خطأ التطبيق" />);
  expect(host.querySelectorAll('.hw-error')).toHaveLength(1); expect(q(host, '.hw-error').textContent).toBe('خطأ التطبيق'); expect(q(host, '.hw-error').hasAttribute('role')).toBe(false);
  await render(<FileDropzone id="d" label="المرفقات" dropLabel="أفلت" accept=".pdf" getRejectedMessage={message} onFilesChange={files} />);
  await choose(input, [pdf]);
  expect(host.querySelector('.hw-error')).toBeNull(); expect(input.hasAttribute('aria-invalid')).toBe(false); expect(root.hasAttribute('data-state')).toBe(false);
});

it('[MSG-06][MSG-07][RESET-02][RESET-03][RESET-09][files-4][files-5] missing rejection text still marks the input invalid; a reset clears the rejection and notifies [] only when files were held', async () => {
  const files = vi.fn();
  const { host, form } = await mount(<form><FileDropzone {...({ id: 'd', label: 'المرفقات', dropLabel: 'أفلت', accept: '.pdf', onFilesChange: files } as unknown as FileDropzoneProps)} /></form>);
  const input = q(host, '#d'); const root = q(host, '.hw-file-dropzone');
  await reset(form); expect(files).not.toHaveBeenCalled();
  await choose(input, [file('a.txt', 'text/plain')]);
  expect(host.querySelector('.hw-error')).toBeNull(); expect(input.getAttribute('aria-invalid')).toBe('true'); expect(root.getAttribute('data-state')).toBe('error');
  await reset(form);
  expect(input.hasAttribute('aria-invalid')).toBe(false); expect(root.hasAttribute('data-state')).toBe(false); expect(files).not.toHaveBeenCalled();
  await choose(input, [file('a.pdf', 'application/pdf')]); files.mockClear();
  await reset(form); expect(files.mock.calls).toEqual([[[]]]);
  expected = [/FileDropzone requires "getRejectedMessage" when accept or maxSize is set/];
});

it('[FILEDROPZONE-05][FILEDROPZONE-06][MSG-02][REQ-01][files-6][R08] one field root with label, instruction, input, status, content, hint and error', async () => {
  const { host } = await mount(<FileDropzone id="d" className="extra" label="المرفقات" dropLabel="أفلت" hint="تلميح" error="خطأ" required getSelectedMessage={list => `${list.length} ملف`}><ul className="list" /></FileDropzone>);
  const root = q(host, '.hw-file-dropzone');
  expect(root.parentElement).toBe(host); expect(root.className).toBe('hw-field hw-file-dropzone extra');
  expect(children(root)).toEqual(['label.hw-label', 'p.hw-file-dropzone-instruction', 'input.hw-input', 'p', 'ul.list', 'p.hw-hint', 'p.hw-error']);
  expect(q(host, 'label').lastElementChild!.className).toBe('hw-required-marker');
  expect(q(host, '#d').getAttribute('aria-describedby')).toBe('d-instruction d-hint d-error');
  await choose(q(host, '#d'), [file('a.pdf', 'application/pdf', '12345')]);
  expect(host.querySelectorAll('ul')).toHaveLength(1); expect(root.textContent).not.toMatch(/\d+\s*(B|bytes|بايت)/);
});

it('[FILEDROPZONE-07][FILEDROPZONE-09][FILEDROPZONE-10][FILEDROPZONE-11][files-8] dragover is cancelled for file drags only, with dropEffect none while unavailable', async () => {
  const files = vi.fn(), rejected = vi.fn();
  const { host, render } = await mount(<fieldset><FileDropzone id="d" label="المرفقات" dropLabel="أفلت" onFilesChange={files} onReject={rejected} /></fieldset>);
  const root = q(host, '.hw-file-dropzone'); const inner = q(host, '.hw-file-dropzone-instruction');
  const text = await drag(root, 'dragover', { types: ['text/plain'], dropEffect: 'move' });
  expect(text.defaultPrevented).toBe(false); expect(root.hasAttribute('data-state')).toBe(false);
  const transfer = { types: ['Files'], dropEffect: 'move', files: [file('a.pdf', 'application/pdf')] };
  const over = await drag(root, 'dragover', transfer);
  expect(over.defaultPrevented).toBe(true); expect(transfer.dropEffect).toBe('copy'); expect(root.getAttribute('data-state')).toBe('dragging');
  expect(root.hasAttribute('data-dragging')).toBe(false); expect(root.hasAttribute('data-dragover')).toBe(false);
  await drag(root, 'dragleave', transfer, inner); expect(root.getAttribute('data-state')).toBe('dragging');
  await drag(root, 'dragleave', transfer, document.body); expect(root.hasAttribute('data-state')).toBe(false);
  await drag(root, 'dragover', transfer); (host.querySelector('fieldset') as HTMLFieldSetElement).disabled = true;
  const drop = await drag(root, 'drop', transfer);
  expect(drop.defaultPrevented).toBe(true); expect(files).not.toHaveBeenCalled(); expect(rejected).not.toHaveBeenCalled();
  for (const props of [{ disabled: true }, { readOnly: true }]) {
    await render(<fieldset><FileDropzone id="d" label="المرفقات" dropLabel="أفلت" onFilesChange={files} {...props} /></fieldset>);
    const blocked = { types: ['Files'], dropEffect: 'copy', files: transfer.files };
    const event = await drag(q(host, '.hw-file-dropzone'), 'dragover', blocked);
    expect(event.defaultPrevented).toBe(true); expect(blocked.dropEffect).toBe('none'); expect(q(host, '.hw-file-dropzone').hasAttribute('data-state')).toBe(false);
    await drag(q(host, '.hw-file-dropzone'), 'drop', blocked); expect(files).not.toHaveBeenCalled();
  }
});

it('[RO-01][RO-02][RO-04][RO-05][files-9] a read-only dropzone keeps a focusable, named, enabled input and blocks the chooser', async () => {
  const files = vi.fn();
  const { host, render } = await mount(<form><FileDropzone id="d" name="files" label="المرفقات" dropLabel="أفلت" readOnly onFilesChange={files} getSelectedMessage={list => `${list.length} ملف`} /></form>);
  const input = q(host, '#d'); const root = q(host, '.hw-file-dropzone');
  expect(input.disabled).toBe(false); expect(input.name).toBe('files'); expect(input.getAttribute('aria-disabled')).toBe('true'); expect(input.hasAttribute('aria-readonly')).toBe(false);
  expect(input.hasAttribute('readonly')).toBe(false); expect(root.getAttribute('data-hw-readonly')).toBe('true');
  input.focus(); expect(document.activeElement).toBe(input);
  const click = new MouseEvent('click', { bubbles: true, cancelable: true }); await act(async () => { input.dispatchEvent(click); });
  expect(click.defaultPrevented).toBe(true);
  await choose(input, [file('a.pdf', 'application/pdf')]); expect(files).not.toHaveBeenCalled();
  await render(<form><FileDropzone id="d" name="files" label="المرفقات" dropLabel="أفلت" onFilesChange={files} getSelectedMessage={list => `${list.length} ملف`} /></form>);
  expect(input.hasAttribute('aria-disabled')).toBe(false); expect(root.hasAttribute('data-hw-readonly')).toBe(false);
  await choose(input, [file('a.pdf', 'application/pdf')]); expect(q(host, 'p[role=status]').textContent).toBe('1 ملف');
  await render(<form><FileDropzone id="d" name="files" label="المرفقات" dropLabel="أفلت" readOnly onFilesChange={files} getSelectedMessage={list => `${list.length} ملف`} /></form>);
  expect(input.getAttribute('aria-disabled')).toBe('true'); expect(q(host, 'p[role=status]').textContent).toBe('1 ملف'); expect(files).toHaveBeenCalledTimes(1);
});

/* FileUpload */
it('[FILEUPLOAD-01][REQ-01][REQ-04][RESET-02][files-10][files-5] FileUpload renders content after the input and reports [] once after a reset', async () => {
  const files = vi.fn();
  const { host, form } = await mount(<form><FileUpload id="u" label="الملف" hint="تلميح" required onFilesChange={files}><ul className="list" /></FileUpload></form>);
  expect(children(q(host, '.hw-upload'))).toEqual(['label.hw-label', 'input.hw-input', 'ul.list', 'p.hw-hint']);
  expect(q(host, 'label').lastElementChild!.className).toBe('hw-required-marker'); expect(q(host, '#u').required).toBe(true);
  await reset(form); expect(files).not.toHaveBeenCalled();
  await choose(q(host, '#u'), [file('a.pdf', 'application/pdf')]); files.mockClear();
  await reset(form); expect(files.mock.calls).toEqual([[[]]]);
});

/* Shared */
it('[RESET-08][RESET-03][rich-inputs-5] controls associated through `form` reset with the external form; untouched controls notify nothing', async () => {
  const changed = vi.fn();
  const { host } = await mount(<div><form id="ext" />
    <Combobox name="city" form="ext" label="م" {...comboTexts} defaultValue="a" onValueChange={changed} />
    <TagInput name="tags" form="ext" label="و" {...tagTexts} defaultValue={['x']} onValueChange={changed} />
    <MultiSelect name="services" form="ext" label="خ" {...multiTexts} defaultValue={['b']} onValueChange={changed} />
    <PinInput name="pin" form="ext" label="ر" defaultValue="12" onValueChange={changed} />
  </div>);
  const form = q<HTMLFormElement>(host, '#ext');
  await reset(form); expect(changed).not.toHaveBeenCalled();
  await act(async () => { q<HTMLButtonElement>(host, 'li button').click(); host.querySelectorAll<HTMLInputElement>('[type=checkbox]')[0].click(); setValue(q(host, '[name=pin]'), '345'); });
  changed.mockClear();
  await reset(form);
  expect(changed.mock.calls).toEqual([[['x']], [['b']], ['12']]);
  const data = new FormData(form);
  expect([data.get('city'), data.getAll('tags'), data.getAll('services'), data.get('pin')]).toEqual(['a', ['x'], ['b'], '12']);
});

it('[SSR-01][STATE-05][SSR-03] server HTML equals the first client render; no interaction state and no reset listener on the server', async () => {
  const node = <form>
    <Combobox name="c" label="م" {...comboTexts} defaultOpen required requiredMessage="اختر" />
    <PasswordField label="كلمة المرور" showLabel="إظهار" hideLabel="إخفاء" defaultVisible />
    <MultiSelect name="m" label="خ" {...multiTexts} required requiredMessage="اختر" getSelectedMessage={count => `${count}`} />
    <TagInput name="t" label="و" {...tagTexts} required requiredMessage="أضف" />
    <PinInput name="p" label="ر" required />
    <FileDropzone name="f" label="ملفات" dropLabel="أفلت" accept=".pdf" getRejectedMessage={() => 'مرفوض'} getSelectedMessage={() => ''} />
    <FileUpload name="u" label="ملف" />
  </form>;
  const listen = vi.spyOn(EventTarget.prototype, 'addEventListener');
  const html = renderToString(node);
  expect(listen.mock.calls.filter(call => call[0] === 'reset')).toEqual([]); listen.mockRestore();
  const host = document.createElement('div'); host.innerHTML = html; document.body.append(host);
  expect(host.querySelector('[aria-invalid], .hw-error')).toBeNull(); expect(host.querySelector('ul.hw-listbox')!.hasAttribute('hidden')).toBe(false);
  expect(host.querySelector<HTMLInputElement>('.hw-password-field input')!.type).toBe('text'); expect(host.querySelector('.hw-multi-select span[role=status]')!.textContent).toBe('');
  const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  let root!: ReturnType<typeof hydrateRoot>;
  await act(async () => { root = hydrateRoot(host, node); });
  expect(errors).not.toHaveBeenCalled(); errors.mockRestore();
  await act(async () => root.unmount());
});

it('[RENAME-02][TEXT-01][TEXT-02][NAME-04] removed and required props are type errors', () => {
  // jsdom gives import.meta.url no file scheme; Vitest runs from the repository root.
  const fixture = resolve('packages/react/fixtures/rich-inputs-types.tsx');
  const program = ts.createProgram([fixture], { strict: true, noEmit: true, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, lib: ['lib.es2022.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'], skipLibCheck: true, isolatedModules: true });
  const diagnostics = ts.getPreEmitDiagnostics(program).map(diagnostic => `${diagnostic.file?.fileName.split('/').pop() ?? ''}:${diagnostic.file && diagnostic.start !== undefined ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line + 1 : 0} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`);
  expect(diagnostics).toEqual([]);
  expect(readFileSync(fixture, 'utf8').match(/{\/\* @ts-expect-error/g)).toHaveLength(4);
}, 60_000);

void (null as unknown as TagInputProps);
