import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { text, withText } from './fixtures/application-text';
import { contentOf, page } from './fixtures/page';
import { missingTextWarnings } from './fixtures/texts';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); });

const cities = [{ value: 'riyadh', label: 'Riyadh' }, { value: 'jeddah', label: 'Jeddah' }, { value: 'dammam', label: 'Dammam', disabled: true }];
const shape = (element: Element) => [...element.children].map(child => `${child.localName}${child.className ? `.${child.className.split(' ').join('.')}` : ''}`);
const type = (input: HTMLInputElement, value: string, inputType?: string) => { input.value = value; input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType })); };
const key = (element: Element, name: string) => { const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }); element.dispatchEvent(event); return event; };
const settle = async (fixture: { detectChanges(): void }) => { await Promise.resolve(); await Promise.resolve(); fixture.detectChanges(); };
const submitted = (form: HTMLFormElement) => [...new FormData(form).entries()].map(([name, value]) => `${name}=${String(value)}`);
/** A submission that fails validation fires `invalid` on each invalid control; a valid one is not sent anywhere. */
const submit = (form: HTMLFormElement) => { form.addEventListener('submit', event => event.preventDefault(), { once: true }); const seen: boolean[] = []; const listen = (event: Event) => seen.push(event.defaultPrevented); form.addEventListener('invalid', listen, true); form.requestSubmit(); form.removeEventListener('invalid', listen, true); return seen; };

describe('hw-combobox', () => {
  const combobox = (attributes: string, state: Record<string, unknown> = {}) => {
    const view = page(`<form><hw-combobox controlId="city" name="city" [options]="cities" ${withText.combobox} ${attributes} /></form>`, { cities, text, ...state });
    return { ...view, form: view.root.querySelector('form')!, input: view.root.querySelector<HTMLInputElement>('input[role=combobox]')!, list: view.root.querySelector<HTMLElement>('[role=listbox]')! };
  };

  it('[COMBOBOX-01][rich-inputs-1] div.hw-combobox wraps only the input, the hidden input, the list and the status; label, hint and error are its siblings in the field', () => {
    const { root, input, list } = combobox('label="City" hint="Hint" error="Error" required');
    const field = root.querySelector('hw-combobox > div.hw-field')!, box = field.querySelector(':scope > div.hw-combobox')!;
    expect(shape(field)).toEqual(['label.hw-label', 'div.hw-combobox', 'p.hw-hint', 'p.hw-error']); expect(field.classList.contains('hw-combobox')).toBe(false);
    expect(shape(box)).toEqual(['input.hw-input', 'input', 'ul.hw-listbox', 'span.hw-sr-only']);
    expect(input.type).toBe('text'); expect(input.getAttribute('autocomplete')).toBe('off'); expect(input.getAttribute('aria-autocomplete')).toBe('list'); expect(input.hasAttribute('aria-haspopup')).toBe(false);
    expect(input.getAttribute('aria-controls')).toBe('city-listbox'); expect(list.id).toBe('city-listbox'); expect(list.hidden).toBe(true); expect(input.getAttribute('aria-expanded')).toBe('false');
    expect((box.children[1] as HTMLInputElement).type).toBe('hidden'); expect(box.children[1]!.getAttribute('name')).toBe('city');
    const status = box.children[3]!; expect(status.getAttribute('role')).toBe('status'); expect(status.getAttribute('aria-live')).toBe('polite'); expect(status.getAttribute('aria-atomic')).toBe('true');
    expect(field.querySelector('label')!.textContent).toBe('City *'); expect(field.querySelector('label')!.getAttribute('for')).toBe('city');
  });

  it('[STATE-01] open, left to the component: focus opens the list and reports true once; Escape closes it and reports false once', () => {
    const seen = vi.fn(), { fixture, input, list } = combobox('label="City" (openChange)="seen($event)"', { seen });
    input.dispatchEvent(new Event('focus')); fixture.detectChanges();
    expect(list.hidden).toBe(false); expect(input.getAttribute('aria-expanded')).toBe('true'); expect(seen.mock.calls).toEqual([[true]]);
    input.dispatchEvent(new Event('click')); fixture.detectChanges(); expect(seen).toHaveBeenCalledTimes(1);
    key(input, 'Escape'); fixture.detectChanges();
    expect(list.hidden).toBe(true); expect(seen.mock.calls).toEqual([[true], [false]]);
  });

  it('[STATE-02][STATE-03] a bound open is the initial state and a later request: writing it reports nothing, and the reader\'s action is reported once', () => {
    const seen = vi.fn(), { fixture, input, list, update } = combobox('label="City" [open]="open" (openChange)="seen($event)"', { seen, open: true });
    expect(list.hidden).toBe(false); expect(input.getAttribute('aria-expanded')).toBe('true'); expect(seen).not.toHaveBeenCalled();
    update({ open: false }); expect(list.hidden).toBe(true); update({ open: true }); expect(list.hidden).toBe(false); expect(seen).not.toHaveBeenCalled();
    // Angular has no controlled mode: after the reader closes the list the component holds the new state.
    key(input, 'Escape'); fixture.detectChanges(); expect(seen.mock.calls).toEqual([[false]]); expect(list.hidden).toBe(true);
  });

  it('[STATE-03] open is refused while the control is disabled or read-only, without a notification', () => {
    const seen = vi.fn(), { list, update } = combobox('label="City" [open]="open" [readOnly]="locked" (openChange)="seen($event)"', { seen, open: true, locked: true });
    expect(list.hidden).toBe(true); update({ locked: false, open: false }); update({ open: true }); expect(list.hidden).toBe(false);
    update({ locked: true }); expect(list.hidden).toBe(true); expect(seen).not.toHaveBeenCalled();
  });

  it('[STATE-04] [(open)] round-trips', () => {
    const { fixture, input, list, state, update } = combobox('label="City" [(open)]="open"', { open: false });
    input.dispatchEvent(new Event('focus')); fixture.detectChanges(); expect((state as { open: boolean }).open).toBe(true);
    key(input, 'Escape'); fixture.detectChanges(); expect((state as { open: boolean }).open).toBe(false); expect(list.hidden).toBe(true);
    update({ open: true }); expect(list.hidden).toBe(false);
  });

  it('[COMBOBOX-03][COMBOBOX-04][rich-inputs-2] typing reports the query once per input event and no value; a selection, an application write and a reset report no query', async () => {
    const query = vi.fn(), value = vi.fn(), { fixture, input, list, form, update } = combobox('label="City" [value]="city" (queryChange)="query($event)" (valueChange)="value($event)"', { query, value, city: '' });
    type(input, 'J'); fixture.detectChanges(); type(input, 'Je'); fixture.detectChanges();
    expect(query.mock.calls).toEqual([['J'], ['Je']]); expect(value).not.toHaveBeenCalled();
    list.querySelector<HTMLElement>('[role=option]')!.click(); fixture.detectChanges();
    expect(value.mock.calls).toEqual([['jeddah']]); expect(input.value).toBe('Jeddah'); expect(query).toHaveBeenCalledTimes(2);
    // An application write keeps the popup as it is.
    input.dispatchEvent(new Event('click')); fixture.detectChanges(); expect(list.hidden).toBe(false);
    update({ city: 'riyadh' }); expect(input.value).toBe('Riyadh'); expect(list.hidden).toBe(false);
    form.reset(); await settle(fixture);
    expect(query).toHaveBeenCalledTimes(2); expect(value).toHaveBeenCalledTimes(2); expect(value).toHaveBeenLastCalledWith('');
    // Typing over a selection clears it: one value notification, because the value changed.
    update({ city: 'jeddah' }); value.mockClear(); type(input, 'Jedda'); fixture.detectChanges(); expect(value.mock.calls).toEqual([['']]); expect(query).toHaveBeenLastCalledWith('Jedda');
  });

  it('[INV-01][INV-03][INV-04][INV-05][E01] a required combobox is exposed as invalid only after a failed submission, until a valid value or a reset', async () => {
    const { fixture, form, input, list } = combobox('label="City" required');
    expect(input.validity.customError).toBe(true); expect(input.hasAttribute('aria-invalid')).toBe(false);
    expect(submit(form)).toEqual([false]); fixture.detectChanges(); expect(input.getAttribute('aria-invalid')).toBe('true');
    input.dispatchEvent(new Event('focus')); fixture.detectChanges(); list.querySelector<HTMLElement>('[role=option]')!.click(); fixture.detectChanges();
    expect(input.validity.valid).toBe(true); expect(input.hasAttribute('aria-invalid')).toBe(false);
    type(input, ''); fixture.detectChanges(); expect(input.hasAttribute('aria-invalid')).toBe(false);
    submit(form); fixture.detectChanges(); expect(input.getAttribute('aria-invalid')).toBe('true');
    form.reset(); await settle(fixture); expect(input.hasAttribute('aria-invalid')).toBe(false); expect(input.validity.customError).toBe(true);
  });

  it('[RESET-01][RESET-02][RESET-07][RESET-09][rich-inputs-5] a reset restores text and hidden input, closes the popup and reports value and open once each, also while read-only', async () => {
    const value = vi.fn(), open = vi.fn(), { fixture, form, input, list, update } = combobox('label="City" value="riyadh" [readOnly]="locked" (valueChange)="value($event)" (openChange)="open($event)"', { value, open, locked: false });
    input.dispatchEvent(new Event('focus')); fixture.detectChanges(); list.querySelectorAll<HTMLElement>('[role=option]')[1]!.click(); fixture.detectChanges();
    expect(submitted(form)).toEqual(['city=jeddah']); input.dispatchEvent(new Event('click')); fixture.detectChanges(); expect(list.hidden).toBe(false);
    value.mockClear(); open.mockClear();
    form.reset(); await settle(fixture);
    expect(input.value).toBe('Riyadh'); expect(submitted(form)).toEqual(['city=riyadh']); expect(list.hidden).toBe(true); expect(value.mock.calls).toEqual([['riyadh']]); expect(open.mock.calls).toEqual([[false]]);
    form.reset(); await settle(fixture); expect(value).toHaveBeenCalledTimes(1); expect(open).toHaveBeenCalledTimes(1);
    input.dispatchEvent(new Event('focus')); fixture.detectChanges(); list.querySelectorAll<HTMLElement>('[role=option]')[1]!.click(); update({ locked: true }); value.mockClear();
    form.reset(); await settle(fixture); expect(input.value).toBe('Riyadh'); expect(submitted(form)).toEqual(['city=riyadh']); expect(value.mock.calls).toEqual([['riyadh']]);
  });
});

describe('hw-multi-select', () => {
  const multi = (attributes: string, state: Record<string, unknown> = {}, texts = withText.multiSelect) => {
    const view = page(`<form><hw-multi-select controlId="cities" name="cities" [options]="cities" ${texts} ${attributes} /></form>`, { cities, text, ...state });
    return { ...view, form: view.root.querySelector('form')!, fieldset: view.root.querySelector('fieldset')!, search: view.root.querySelector<HTMLInputElement>('input[type=search]')!, boxes: () => [...view.root.querySelectorAll<HTMLInputElement>('input[type=checkbox]')] };
  };

  it('[MULTISELECT-01][rich-inputs-6] one fieldset with the legend, the visible filter label, the filter, the option rows, both statuses, the hidden inputs, the hint and the error', () => {
    const { fieldset, root } = multi('label="Cities" hint="Hint" error="Error" required [value]="[\'riyadh\']"');
    expect(fieldset.className).toBe('hw-field hw-multi-select');
    expect(shape(fieldset)).toEqual(['legend.hw-label', 'label.hw-label', 'input.hw-input', 'div.hw-multi-select-options', 'span.hw-sr-only', 'p.hw-multi-select-selected', 'input', 'p.hw-hint', 'p.hw-error']);
    expect(fieldset.querySelector('legend')!.textContent).toBe('Cities *');
    const rows = [...root.querySelectorAll('.hw-multi-select-options > *')];
    expect(rows.map(row => `${row.localName}.${row.className}`)).toEqual(['label.hw-choice', 'label.hw-choice', 'label.hw-choice']);
    for (const [index, row] of rows.entries()) { const [box, label] = contentOf(row) as [HTMLInputElement, Text]; expect(box.className).toBe('hw-checkbox'); expect(box.value).toBe(cities[index]!.value); expect(label.nodeType).toBe(Node.TEXT_NODE); expect(label.textContent).toBe(cities[index]!.label); expect(row.querySelector('span')).toBeNull(); }
    expect(rows.map(row => row.querySelector('input')!.disabled)).toEqual([false, false, true]);
    const status = fieldset.querySelector('span.hw-sr-only')!; expect(status.getAttribute('role')).toBe('status'); expect(status.getAttribute('aria-live')).toBe('polite'); expect(status.getAttribute('aria-atomic')).toBe('true'); expect(status.textContent).toBe('');
  });

  it('[MULTISELECT-02] the filter input is named by a visible label and has no aria-label; a missing searchLabel renders no label and warns once', () => {
    const warnings = missingTextWarnings();
    const { search, fieldset } = multi('label="Cities"');
    const label = fieldset.querySelector(':scope > label.hw-label')!; expect(label.textContent).toBe('Search options'); expect(label.getAttribute('for')).toBe(search.id); expect(label.classList.contains('hw-sr-only')).toBe(false); expect(search.hasAttribute('aria-label')).toBe(false);
    expect(warnings).toEqual([]);
    const bare = multi('label="Cities"', {}, withText.multiSelect.replace(/searchLabel="[^"]*"/, ''));
    bare.fixture.detectChanges(); expect(bare.fieldset.querySelector(':scope > label')).toBeNull();
    expect(warnings.map(warning => warning.split('.')[0])).toEqual(['Hawiyah: hw-multi-select requires "searchLabel"']);
  });

  it('[FMT-05][R10][R09] the selected status exists only with getSelectedMessage and follows the selection; the results status is empty until the reader filters and after a reset', async () => {
    const { fixture, fieldset, search, form, boxes } = multi('label="Cities"');
    const selected = fieldset.querySelector('p.hw-multi-select-selected')!, results = fieldset.querySelector('span[role=status]')!;
    expect(selected.getAttribute('role')).toBe('status'); expect(selected.textContent).toBe('0 selected'); expect(results.textContent).toBe('');
    boxes()[0]!.click(); fixture.detectChanges(); expect(selected.textContent).toBe('1 selected'); expect(results.textContent).toBe('');
    type(search, 'j'); fixture.detectChanges(); expect(results.textContent).toBe('1 options match'); expect(boxes()).toHaveLength(1);
    type(search, 'zzz'); fixture.detectChanges(); expect(results.textContent).toBe('0 options match'); expect(fieldset.querySelector('.hw-multi-select-options > p.hw-hint')!.textContent).toBe('No options');
    form.reset(); await settle(fixture); expect(results.textContent).toBe(''); expect(search.value).toBe(''); expect(boxes()).toHaveLength(3); expect(selected.textContent).toBe('0 selected');
    const without = multi('label="Cities"', {}, withText.multiSelect.replace(/\[getSelectedMessage\]="[^"]*"/, ''));
    expect(without.fieldset.querySelector('.hw-multi-select-selected')).toBeNull(); expect(without.fieldset.querySelectorAll('[role=status]')).toHaveLength(1);
  });

  it('[RO-01][RO-02][RO-03] read-only checkboxes stay focusable and enabled with aria-disabled; click and Space change nothing; the hidden inputs still submit', () => {
    const changed = vi.fn(), { fixture, fieldset, form, boxes, search } = multi('label="Cities" readOnly [value]="[\'riyadh\']" (valueChange)="changed($event)"', { changed });
    expect(fieldset.getAttribute('data-hw-readonly')).toBe('true');
    const [first, second, third] = boxes();
    expect([first!.disabled, second!.disabled, third!.disabled]).toEqual([false, false, true]); expect(first!.getAttribute('aria-disabled')).toBe('true'); expect(second!.getAttribute('aria-disabled')).toBe('true');
    second!.focus(); expect(document.activeElement).toBe(second);
    second!.click(); fixture.detectChanges(); expect(second!.checked).toBe(false); expect(key(second!, ' ').defaultPrevented).toBe(true);
    first!.click(); fixture.detectChanges(); expect(changed).not.toHaveBeenCalled(); expect(submitted(form)).toEqual(['cities=riyadh']);
    // Filtering stays available.
    type(search, 'j'); fixture.detectChanges(); expect(boxes()).toHaveLength(1);
  });

  it('[NAME-02] aria-label alone names the fieldset: no legend and no warning', () => {
    const { fieldset } = multi('aria-label="Cities"');
    expect(fieldset.getAttribute('aria-label')).toBe('Cities'); expect(fieldset.querySelector('legend')).toBeNull();
  });

  it('[INV-01][INV-03][INV-04][INV-05][E01] a failed submission marks the fieldset and the filter input until a box is checked or the form resets', async () => {
    const { fixture, fieldset, form, search, boxes } = multi('label="Cities" required');
    expect(search.validity.customError).toBe(true); expect(fieldset.hasAttribute('aria-invalid')).toBe(false); expect(search.hasAttribute('aria-invalid')).toBe(false); expect(search.getAttribute('aria-required')).toBe('true');
    expect(submit(form)).toEqual([false]); fixture.detectChanges(); expect(fieldset.getAttribute('aria-invalid')).toBe('true'); expect(search.getAttribute('aria-invalid')).toBe('true');
    boxes()[0]!.click(); fixture.detectChanges(); expect(fieldset.hasAttribute('aria-invalid')).toBe(false); expect(search.hasAttribute('aria-invalid')).toBe(false);
    boxes()[0]!.click(); fixture.detectChanges(); submit(form); fixture.detectChanges(); expect(search.getAttribute('aria-invalid')).toBe('true');
    form.reset(); await settle(fixture); expect(search.hasAttribute('aria-invalid')).toBe(false); expect(fieldset.hasAttribute('aria-invalid')).toBe(false);
  });

  it('[RESET-01][RESET-02][RESET-07][rich-inputs-5] a reset restores the checkboxes and the hidden inputs and reports the initial selection once, also while disabled', async () => {
    const changed = vi.fn(), { fixture, form, boxes, update } = multi('label="Cities" [disabled]="off" (valueChange)="changed($event)"', { changed, off: false });
    boxes()[0]!.click(); boxes()[1]!.click(); fixture.detectChanges(); expect(submitted(form)).toEqual(['cities=riyadh', 'cities=jeddah']); changed.mockClear();
    form.reset(); await settle(fixture);
    expect(changed.mock.calls).toEqual([[[]]]); expect(form.querySelector('input[type=hidden]')).toBeNull(); expect(boxes().map(box => box.checked)).toEqual([false, false, false]);
    form.reset(); await settle(fixture); expect(changed).toHaveBeenCalledTimes(1);
    boxes()[1]!.click(); fixture.detectChanges(); update({ off: true }); changed.mockClear();
    form.reset(); await settle(fixture); expect(changed.mock.calls).toEqual([[[]]]); update({ off: false }); expect(form.querySelector('input[type=hidden]')).toBeNull(); expect(boxes().map(box => box.checked)).toEqual([false, false, false]);
  });

  it('[RESET-05] with an initial selection the checkboxes and FormData show it again after a reset', async () => {
    const { fixture, form, boxes } = multi('label="Cities" [value]="[\'jeddah\']"');
    boxes()[0]!.click(); boxes()[1]!.click(); fixture.detectChanges(); expect(submitted(form)).toEqual(['cities=riyadh']);
    form.reset(); await settle(fixture); expect(boxes().map(box => box.checked)).toEqual([false, true, false]); expect(submitted(form)).toEqual(['cities=jeddah']);
  });
});

describe('hw-tag-input', () => {
  const tags = (attributes: string, state: Record<string, unknown> = {}) => {
    const view = page(`<form><hw-tag-input controlId="tags" name="tags" ${withText.tagInput} ${attributes} /></form>`, { text, ...state });
    return { ...view, form: view.root.querySelector('form')!, box: view.root.querySelector<HTMLElement>('div.hw-tag-input')!, input: view.root.querySelector<HTMLInputElement>('input.hw-input')!, removes: () => [...view.root.querySelectorAll<HTMLButtonElement>('.hw-chip button')] };
  };

  it('[TAGINPUT-01][rich-inputs-8] the box holds only the list and the text input; label, hint and error are its siblings; a chip is text, button and hidden input', () => {
    const { root, box, input } = tags('label="Tags" hint="Hint" error="Error" required [value]="[\'alpha\', \'beta\']"');
    expect(shape(root.querySelector('hw-tag-input > div.hw-field')!)).toEqual(['label.hw-label', 'div.hw-tag-input', 'p.hw-hint', 'p.hw-error']);
    expect(shape(box)).toEqual(['ul', 'input.hw-input']); expect(box.firstElementChild!.getAttribute('role')).toBe('list'); expect(input.type).toBe('text'); expect(input.getAttribute('aria-required')).toBe('true'); expect(input.required).toBe(false);
    const chip = box.querySelector('li.hw-chip')!, [name, button, hidden] = contentOf(chip) as [Text, HTMLButtonElement, HTMLInputElement];
    expect(contentOf(chip)).toHaveLength(3); expect(name.nodeType).toBe(Node.TEXT_NODE); expect(name.textContent).toBe('alpha');
    expect(button.type).toBe('button'); expect(button.hasAttribute('class')).toBe(false); expect(button.getAttribute('aria-label')).toBe('Remove alpha'); expect(button.querySelector('span.hw-icon[data-icon="cancel-01"][data-size="md"][aria-hidden="true"]')).not.toBeNull();
    expect(hidden.type).toBe('hidden'); expect(hidden.name).toBe('tags'); expect(hidden.value).toBe('alpha');
    // An empty input still renders its list.
    expect(shape(tags('label="Empty"').box)).toEqual(['ul', 'input.hw-input']);
  });

  it('[TAGINPUT-02][R19] there is no Add button: Enter and comma commit the draft', () => {
    const { fixture, root, input, form } = tags('label="Tags"');
    expect(root.querySelectorAll('button')).toHaveLength(0); expect(root.querySelector('.hw-input-group, .hw-button')).toBeNull();
    type(input, 'alpha'); fixture.detectChanges(); expect(key(input, 'Enter').defaultPrevented).toBe(true); fixture.detectChanges();
    type(input, 'beta'); fixture.detectChanges(); expect(key(input, ',').defaultPrevented).toBe(true); fixture.detectChanges();
    expect(submitted(form)).toEqual(['tags=alpha', 'tags=beta']); expect(input.value).toBe(''); expect(root.querySelectorAll('button')).toHaveLength(2);
  });

  it('[FOCUS-04] removing the focused chip moves focus to the next remove button, else the previous one, else the text input; Backspace keeps focus in the input', () => {
    const { fixture, input, removes, form } = tags('label="Tags" [value]="[\'a\', \'b\', \'c\', \'d\']"');
    removes()[1]!.focus(); removes()[1]!.click(); fixture.detectChanges();
    expect(submitted(form)).toEqual(['tags=a', 'tags=c', 'tags=d']); expect(document.activeElement).toBe(removes()[1]); expect(removes()[1]!.getAttribute('aria-label')).toBe('Remove c');
    removes()[2]!.focus(); removes()[2]!.click(); fixture.detectChanges(); expect(document.activeElement).toBe(removes()[1]); expect(removes()[1]!.getAttribute('aria-label')).toBe('Remove c');
    input.focus(); key(input, 'Backspace'); fixture.detectChanges(); expect(submitted(form)).toEqual(['tags=a']); expect(document.activeElement).toBe(input);
    removes()[0]!.focus(); removes()[0]!.click(); fixture.detectChanges(); expect(submitted(form)).toEqual([]); expect(document.activeElement).toBe(input);
  });

  it('[FOCUS-04] a pointer activation that left focus elsewhere moves nothing', () => {
    const { fixture, removes } = tags('label="Tags" [value]="[\'a\', \'b\']"');
    const outside = document.createElement('button'); document.body.append(outside); outside.focus();
    removes()[0]!.click(); fixture.detectChanges(); expect(removes()).toHaveLength(1); expect(document.activeElement).toBe(outside);
  });

  it('[RO-02] read-only: the remove buttons are present and disabled, and keys and clicks change nothing', () => {
    const changed = vi.fn(), { fixture, input, removes, form } = tags('label="Tags" readOnly [value]="[\'a\', \'b\']" (valueChange)="changed($event)"', { changed });
    expect(removes().map(button => button.disabled)).toEqual([true, true]); expect(input.readOnly).toBe(true);
    removes()[0]!.click(); key(input, 'Backspace'); type(input, 'c'); key(input, 'Enter'); fixture.detectChanges();
    expect(changed).not.toHaveBeenCalled(); expect(submitted(form)).toEqual(['tags=a', 'tags=b']);
  });

  it('[INV-01][INV-03][INV-04][INV-05][E01] a failed submission marks the text input until a tag is added or the form resets', async () => {
    const { fixture, input, form } = tags('label="Tags" required');
    expect(input.validity.customError).toBe(true); expect(input.hasAttribute('aria-invalid')).toBe(false);
    expect(submit(form)).toEqual([false]); fixture.detectChanges(); expect(input.getAttribute('aria-invalid')).toBe('true');
    type(input, 'alpha'); key(input, 'Enter'); fixture.detectChanges(); expect(input.hasAttribute('aria-invalid')).toBe(false);
    key(input, 'Backspace'); fixture.detectChanges(); submit(form); fixture.detectChanges(); expect(input.getAttribute('aria-invalid')).toBe('true');
    form.reset(); await settle(fixture); expect(input.hasAttribute('aria-invalid')).toBe(false);
  });

  it('[RESET-01][RESET-02][RESET-09][rich-inputs-5] a reset restores chips and hidden inputs, empties the draft and reports the initial tags once', async () => {
    const changed = vi.fn(), { fixture, input, form, removes } = tags('label="Tags" [value]="[\'a\']" (valueChange)="changed($event)"', { changed });
    type(input, 'b'); key(input, 'Enter'); fixture.detectChanges(); type(input, 'draft'); fixture.detectChanges(); changed.mockClear();
    form.reset(); await settle(fixture);
    expect(changed.mock.calls).toEqual([[['a']]]); expect(submitted(form)).toEqual(['tags=a']); expect(removes()).toHaveLength(1); expect(input.value).toBe('');
    form.reset(); await settle(fixture); expect(changed).toHaveBeenCalledTimes(1);
  });
});

describe('hw-pin-input', () => {
  const pin = (attributes = '', state: Record<string, unknown> = {}) => {
    const view = page(`<form><hw-pin-input name="code" label="Code" ${attributes} /></form>`, state);
    return { ...view, form: view.root.querySelector('form')!, input: view.root.querySelector<HTMLInputElement>('input')! };
  };

  it('[PININPUT-01][rich-inputs-12] the input has no maxlength, and separators and other digit systems are removed before the length is applied', () => {
    const changed = vi.fn(), { fixture, input } = pin('(valueChange)="changed($event)"', { changed });
    expect(input.hasAttribute('maxlength')).toBe(false); expect(input.getAttribute('pattern')).toBe('[0-9]{6}'); expect(input.getAttribute('inputmode')).toBe('numeric'); expect(input.getAttribute('autocomplete')).toBe('one-time-code');
    for (const [raw, code] of [['123 456', '123456'], ['12-34-56', '123456'], ['٤٥٦-١٢٣', '456123']] as const) {
      type(input, ''); fixture.detectChanges(); changed.mockClear();
      type(input, raw, 'insertFromPaste'); fixture.detectChanges();
      expect(input.value).toBe(code); expect(changed.mock.calls).toEqual([[code]]);
    }
  });

  it('[PININPUT-02] one more typed character keeps a full code and reports nothing; a longer pasted code is cut to the length', () => {
    const changed = vi.fn(), { fixture, input } = pin('value="123456" (valueChange)="changed($event)"', { changed });
    type(input, '1234567', 'insertText'); fixture.detectChanges(); expect(input.value).toBe('123456'); expect(changed).not.toHaveBeenCalled();
    type(input, '987654321', 'insertFromPaste'); fixture.detectChanges(); expect(input.value).toBe('987654'); expect(changed.mock.calls).toEqual([['987654']]);
  });

  it('[INV-08][INV-03][INV-05] an incomplete code is invalid after blur, and after a failed submission, until it is complete, empty or the form resets', async () => {
    const { fixture, input, form } = pin('required');
    type(input, '123'); fixture.detectChanges(); expect(input.hasAttribute('aria-invalid')).toBe(false);
    input.dispatchEvent(new FocusEvent('blur')); fixture.detectChanges(); expect(input.getAttribute('aria-invalid')).toBe('true');
    type(input, '123456'); fixture.detectChanges(); expect(input.hasAttribute('aria-invalid')).toBe(false);
    type(input, '12'); input.dispatchEvent(new FocusEvent('blur')); fixture.detectChanges(); expect(input.getAttribute('aria-invalid')).toBe('true');
    type(input, ''); fixture.detectChanges(); expect(input.hasAttribute('aria-invalid')).toBe(false);
    expect(submit(form)).toEqual([false]); fixture.detectChanges(); expect(input.getAttribute('aria-invalid')).toBe('true');
    form.reset(); await settle(fixture); expect(input.hasAttribute('aria-invalid')).toBe(false);
    type(input, '12'); input.dispatchEvent(new FocusEvent('blur')); fixture.detectChanges(); expect(input.getAttribute('aria-invalid')).toBe('true');
    form.reset(); await settle(fixture); expect(input.hasAttribute('aria-invalid')).toBe(false); expect(input.value).toBe('');
  });
});

describe('hw-password-field', () => {
  const password = (attributes: string, state: Record<string, unknown> = {}) => {
    const view = page(`<form><hw-password-field label="Password" name="password" ${withText.passwordField} ${attributes} /></form>`, state);
    return { ...view, form: view.root.querySelector('form')!, input: view.root.querySelector<HTMLInputElement>('input')!, toggle: view.root.querySelector<HTMLButtonElement>('button')! };
  };

  it('[STATE-01][rich-inputs-14] visible, left to the component: the toggle shows and reports true once, then hides and reports false once', () => {
    const seen = vi.fn(), { fixture, input, toggle } = password('(visibleChange)="seen($event)"', { seen });
    toggle.click(); fixture.detectChanges(); expect(input.type).toBe('text'); expect(toggle.getAttribute('aria-pressed')).toBe('true'); expect(seen.mock.calls).toEqual([[true]]);
    toggle.click(); fixture.detectChanges(); expect(input.type).toBe('password'); expect(seen.mock.calls).toEqual([[true], [false]]);
  });

  it('[STATE-02][STATE-03] a bound visible is the initial state and a later request: writing it reports nothing, and the toggle is reported once', () => {
    const seen = vi.fn(), { fixture, input, toggle, update } = password('[visible]="shown" (visibleChange)="seen($event)"', { seen, shown: true });
    expect(input.type).toBe('text'); update({ shown: false }); expect(input.type).toBe('password'); update({ shown: true }); expect(input.type).toBe('text'); expect(seen).not.toHaveBeenCalled();
    toggle.click(); fixture.detectChanges(); expect(seen.mock.calls).toEqual([[false]]);
  });

  it('[STATE-04] [(visible)] round-trips, and a value written by Angular Forms does not hide the value', () => {
    const { fixture, input, toggle, state, update } = password('[(visible)]="shown"', { shown: false });
    toggle.click(); fixture.detectChanges(); expect((state as { shown: boolean }).shown).toBe(true);
    const component = fixture.debugElement.query(By.css('hw-password-field')).componentInstance as { writeValue(value: string): void; revealed?: boolean };
    component.writeValue('written'); fixture.detectChanges(); expect(input.type).toBe('text'); expect(input.value).toBe('written'); expect('revealed' in component).toBe(false);
    update({ shown: false }); expect(input.type).toBe('password');
  });

  it('[RESET-09] a native reset hides a visible password and reports false once; a hidden one reports nothing', async () => {
    const seen = vi.fn(), { fixture, form, input, toggle } = password('value="secret" (visibleChange)="seen($event)"', { seen });
    form.reset(); await settle(fixture); expect(seen).not.toHaveBeenCalled(); expect(input.value).toBe('secret');
    toggle.click(); fixture.detectChanges(); seen.mockClear();
    form.reset(); await settle(fixture); expect(input.type).toBe('password'); expect(toggle.getAttribute('aria-pressed')).toBe('false'); expect(seen.mock.calls).toEqual([[false]]);
  });
});

describe('hw-search-field', () => {
  it('[SEARCH-01][TEXT-02][R27] the search button is rendered only on request, and searchLabel is required only then', () => {
    const warnings = missingTextWarnings();
    const { root, fixture } = page(`<hw-search-field label="Find" clearLabel="Clear" /><hw-search-field label="Find" clearLabel="Clear" showSearchButton searchLabel="Search" />`);
    const [plain, withButton] = [...root.querySelectorAll('hw-search-field')];
    expect(plain!.querySelector('.hw-search-submit')).toBeNull(); expect(withButton!.querySelector('.hw-search-submit')!.getAttribute('aria-label')).toBe('Search'); expect(warnings).toEqual([]);
    const missing = page(`<hw-search-field label="Find" clearLabel="Clear" showSearchButton />`); missing.fixture.detectChanges(); fixture.detectChanges();
    expect(missing.root.querySelector('.hw-search-submit')!.hasAttribute('aria-label')).toBe(false);
    expect(warnings.map(warning => warning.split('.')[0])).toEqual(['Hawiyah: hw-search-field requires "searchLabel" when showSearchButton is on']);
  });

  it('[RESET-09] a native reset closes the suggestions and restores the text', async () => {
    const { root, fixture } = page(`<form><hw-search-field label="Find" name="q" clearLabel="Clear" [suggestions]="['Passport renewal', 'Passport status']" [getResultsMessage]="text.searchField.getResultsMessage" /></form>`, { text });
    const input = root.querySelector<HTMLInputElement>('input')!, list = root.querySelector<HTMLElement>('[role=listbox]')!;
    input.dispatchEvent(new Event('focus')); type(input, 'Pass'); fixture.detectChanges(); expect(list.hidden).toBe(false);
    root.querySelector('form')!.reset(); await settle(fixture); expect(list.hidden).toBe(true); expect(input.value).toBe('');
  });
});
