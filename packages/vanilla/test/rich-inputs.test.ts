// @vitest-environment jsdom
import { resetTextWarnings } from '@hawiyah/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createCombobox, createFileDropzone, createMultiSelect, createPasswordField, createPinInput, createSearchField, createTagInput } from '../src/index.js';

// Vanilla fixtures of the cross-adapter cases of the rich inputs and the file dropzone, on the documented markup.
let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => { resetTextWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
afterEach(() => { warn.mockRestore(); document.body.innerHTML = ''; });
function mount(markup: string): HTMLElement { document.body.innerHTML = markup; return document.body.firstElementChild as HTMLElement; }
function key(node: HTMLElement, value: string) { const event = new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }); node.dispatchEvent(event); return event; }
function type(input: HTMLInputElement, value: string, inputType = 'insertText') { input.value = value; input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType })); }
const details = (handler: ReturnType<typeof vi.fn>) => handler.mock.calls.map(([event]) => (event as CustomEvent).detail);

const combobox = (attributes = '', input = '') => `<form><div class="hw-field"><label class="hw-label" for="city">City</label><div class="hw-combobox" data-hw="combobox" data-hw-results-message="{count} results" data-hw-required-message="Choose a city." ${attributes}><input id="city" class="hw-input" data-hw-combobox-input autocomplete="off" aria-describedby="city-hint" ${input}><input type="hidden" name="city" data-hw-combobox-value><ul class="hw-listbox" data-hw-combobox-list hidden><li data-hw-value="riyadh">Riyadh</li><li data-hw-value="abha">Abha</li></ul><span class="hw-sr-only" data-hw-combobox-status role="status"></span></div><p class="hw-hint" id="city-hint">Choose a city.</p></div></form>`;

describe('combobox', () => {
  it('[COMBOBOX-01] the listbox parent wraps only input, hidden input, listbox and status; label, hint and error are field siblings', () => {
    const form = mount(combobox()); const root = form.querySelector<HTMLElement>('[data-hw=combobox]')!; const controller = createCombobox(root);
    expect([...root.children].map(node => node.localName + (node.getAttribute('type') === 'hidden' ? '[hidden]' : ''))).toEqual(['input', 'input[hidden]', 'ul', 'span']);
    expect(root.querySelector('[role=status]')!.getAttribute('aria-live')).toBe('polite');
    expect(root.previousElementSibling!.localName).toBe('label'); expect(root.nextElementSibling!.matches('p.hw-hint')).toBe(true);
    expect(root.querySelector('ul')!.getAttribute('aria-labelledby')).toBe(form.querySelector('label')!.id); controller.destroy();
  });

  it('[STATE-01] [STATE-06] notifies open once per change with detail {open} and query with detail {query}', () => {
    const root = mount(combobox()).querySelector<HTMLElement>('[data-hw=combobox]')!; const changed = vi.fn(); const open = vi.fn(); const query = vi.fn(); root.addEventListener('hw:change', changed);
    const controller = createCombobox(root, { onOpenChange: open, onQueryChange: query }); const input = root.querySelector<HTMLInputElement>('input')!;
    input.click(); expect(open.mock.calls).toEqual([[true]]); key(input, 'ArrowDown'); expect(open).toHaveBeenCalledTimes(1);
    key(input, 'Escape'); expect(open.mock.calls).toEqual([[true], [false]]); expect(details(changed)).toEqual([{ open: true }, { open: false }]);
    type(input, 'Ab'); expect(query.mock.calls).toEqual([['Ab']]); expect(details(changed).slice(-2)).toEqual([{ open: true }, { query: 'Ab' }]);
    expect(controller.open).toBe(true); controller.destroy();
  });

  it('[COMBOBOX-03] [COMBOBOX-04] typing notifies query each time and no value; selection, reset and script do not notify query', async () => {
    const form = mount(combobox()) as HTMLFormElement; const root = form.querySelector<HTMLElement>('[data-hw=combobox]')!; const query = vi.fn(); const value = vi.fn();
    const controller = createCombobox(root, { onQueryChange: query, onValueChange: value }); const input = root.querySelector<HTMLInputElement>('input')!;
    type(input, 'R'); type(input, 'Ri'); expect(query.mock.calls).toEqual([['R'], ['Ri']]); expect(value).not.toHaveBeenCalled();
    controller.select('riyadh'); expect(value.mock.calls).toEqual([['riyadh']]);
    form.reset(); await Promise.resolve(); expect(query).toHaveBeenCalledTimes(2); controller.destroy();
  });

  it('[RESET-01] [RESET-02] [RESET-03] [RESET-09] reset returns to the authored value, closes the popup and notifies once', async () => {
    const form = mount(combobox()) as HTMLFormElement; const root = form.querySelector<HTMLElement>('[data-hw=combobox]')!; const value = vi.fn(); const open = vi.fn();
    const controller = createCombobox(root, { onValueChange: value, onOpenChange: open });
    form.reset(); await Promise.resolve(); expect(value).not.toHaveBeenCalled();
    controller.select('abha'); controller.show(); value.mockClear(); open.mockClear();
    form.reset(); await Promise.resolve();
    expect(controller.value).toBe(''); expect(new FormData(form).get('city')).toBe(''); expect(controller.open).toBe(false);
    expect(value.mock.calls).toEqual([['']]); expect(open.mock.calls).toEqual([[false]]); controller.destroy();
  });

  it('[RESET-06] [RESET-07] [RESET-08] prevented reset changes nothing; read-only and external-form comboboxes reset', async () => {
    const prevented = mount(combobox()) as HTMLFormElement; prevented.addEventListener('reset', event => event.preventDefault());
    const a = createCombobox(prevented.querySelector<HTMLElement>('[data-hw=combobox]')!); a.select('abha'); prevented.reset(); await Promise.resolve(); expect(a.value).toBe('abha'); a.destroy();
    document.body.innerHTML = `<form id="outer"></form>${combobox().replace('<form>', '').replace('</form>', '').replace('data-hw-combobox-value', 'data-hw-combobox-value form="outer"').replace('data-hw-combobox-input', 'data-hw-combobox-input form="outer"')}`;
    const outer = document.querySelector('form')!; const root = document.querySelector<HTMLElement>('[data-hw=combobox]')!; const changed = vi.fn(); const b = createCombobox(root, { value: 'riyadh', onValueChange: changed });
    b.select('abha'); root.querySelector('input')!.readOnly = true; changed.mockClear(); outer.reset(); await Promise.resolve();
    expect(b.value).toBe('riyadh'); expect(new FormData(outer).get('city')).toBe('riyadh'); expect(changed.mock.calls).toEqual([['riyadh']]); b.destroy();
  });

  it('[INV-01] [INV-02] [INV-03] [INV-04] [INV-05] [INV-06] marks a failed submission until a valid choice or reset; keeps authored aria-invalid', async () => {
    const form = mount(combobox('', 'required')) as HTMLFormElement; const root = form.querySelector<HTMLElement>('[data-hw=combobox]')!; const controller = createCombobox(root); const input = root.querySelector<HTMLInputElement>('input')!;
    expect(input.hasAttribute('aria-invalid')).toBe(false); const invalid = vi.fn(); input.addEventListener('invalid', invalid);
    form.requestSubmit(); expect(input.getAttribute('aria-invalid')).toBe('true'); expect(invalid.mock.calls[0]![0].defaultPrevented).toBe(false);
    controller.select('abha'); expect(input.hasAttribute('aria-invalid')).toBe(false);
    form.reset(); await Promise.resolve(); form.checkValidity(); expect(input.getAttribute('aria-invalid')).toBe('true');
    form.reset(); await Promise.resolve(); expect(input.hasAttribute('aria-invalid')).toBe(false); controller.destroy();
    warn.mockClear(); resetTextWarnings();
    const missing = mount(combobox('', 'required').replace(' data-hw-required-message="Choose a city."', '')); const c = createCombobox(missing.querySelector<HTMLElement>('[data-hw=combobox]')!); const field = missing.querySelector<HTMLInputElement>('[data-hw-combobox-input]')!;
    expect(field.hasAttribute('aria-invalid')).toBe(false); expect(field.validity.customError).toBe(true); expect(warn).toHaveBeenCalledTimes(1); c.destroy();
    const authored = mount(combobox('', 'aria-invalid="true"')); const d = createCombobox(authored.querySelector<HTMLElement>('[data-hw=combobox]')!);
    expect(authored.querySelector('[data-hw-combobox-input]')!.getAttribute('aria-invalid')).toBe('true'); d.select('abha'); expect(authored.querySelector('[data-hw-combobox-input]')!.getAttribute('aria-invalid')).toBe('true'); d.destroy();
  });
});

const multi = (attributes = '', extra = '') => `<form><fieldset class="hw-field hw-multi-select" data-hw="multi-select" data-hw-results-message="{count} shown" data-hw-required-message="Choose one." ${attributes}><legend class="hw-label">Services</legend><label class="hw-label" for="find">Find</label><input class="hw-input" id="find" type="search" data-hw-multiselect-search><div class="hw-multi-select-options"><label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="services" value="a" checked>Alpha</label><label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="services" value="b">Beta</label></div>${extra}<p class="hw-hint" id="services-hint">Choose at least one.</p></fieldset></form>`;

describe('multi-select', () => {
  it('[MULTISELECT-01] keeps the documented order and creates the polite results status after the options', () => {
    const root = mount(multi()).firstElementChild as HTMLElement; const controller = createMultiSelect(root);
    expect([...root.children].map(node => node.localName + (node.className ? '.' + node.className.split(' ')[0] : ''))).toEqual(['legend.hw-label', 'label.hw-label', 'input.hw-input', 'div.hw-multi-select-options', 'p.hw-hint', 'span.hw-sr-only']);
    expect(root.querySelectorAll('.hw-multi-select-options > label.hw-choice')).toHaveLength(2);
    const status = root.querySelector('[data-hw-status]')!; expect([status.getAttribute('role'), status.getAttribute('aria-live'), status.getAttribute('aria-atomic')]).toEqual(['status', 'polite', 'true']);
    controller.destroy(); expect(root.querySelector('[data-hw-status]')).toBeNull();
  });

  it('[FMT-05] the results status is empty at first, counts after filtering and empties on reset; the selected status follows the selection', async () => {
    const form = mount(multi('data-hw-selected-message="{count} selected"', '<p class="hw-multi-select-selected" data-hw-selected-status role="status"></p>')) as HTMLFormElement; const root = form.firstElementChild as HTMLElement;
    const controller = createMultiSelect(root); const status = root.querySelector('[data-hw-status]')!; const selected = root.querySelector('[data-hw-selected-status]')!; const search = root.querySelector<HTMLInputElement>('[type=search]')!;
    expect(status.textContent).toBe(''); expect(selected.textContent).toBe('1 selected');
    type(search, 'Be'); expect(status.textContent).toBe('1 shown'); type(search, 'zz'); expect(status.textContent).toBe('0 shown');
    root.querySelector<HTMLInputElement>('[value=b]')!.click(); expect(selected.textContent).toBe('2 selected');
    form.reset(); await Promise.resolve(); expect(status.textContent).toBe(''); expect(search.value).toBe(''); expect(selected.textContent).toBe('1 selected');
    controller.destroy(); expect(selected.textContent).toBe('');
    const plain = mount(multi()).firstElementChild as HTMLElement; const other = createMultiSelect(plain); expect(plain.querySelector('[data-hw-selected-status]')).toBeNull(); other.destroy(); expect(warn).not.toHaveBeenCalled();
  });

  it('[TEXT-01] a missing getResultsMessage leaves the status empty and warns once', () => {
    const root = mount(multi().replace(' data-hw-results-message="{count} shown"', '')).firstElementChild as HTMLElement; const controller = createMultiSelect(root);
    type(root.querySelector<HTMLInputElement>('[type=search]')!, 'A'); expect(root.querySelector('[data-hw-status]')!.textContent).toBe('');
    expect(warn).toHaveBeenCalledTimes(1); expect(String(warn.mock.calls[0]![0])).toMatch(/^Hawiyah: MultiSelect requires "getResultsMessage"/); controller.destroy();
  });

  it('[RO-01] [RO-02] [RO-03] read-only checkboxes stay focusable, change nothing and keep submitting', () => {
    const form = mount(multi('data-hw-readonly="true"')) as HTMLFormElement; const root = form.firstElementChild as HTMLElement; const changed = vi.fn(); const controller = createMultiSelect(root, { onValueChange: changed });
    const box = root.querySelector<HTMLInputElement>('[value=b]')!; expect(box.disabled).toBe(false); expect(box.getAttribute('aria-disabled')).toBe('true'); box.focus(); expect(document.activeElement).toBe(box);
    box.click(); expect(box.checked).toBe(false); expect(changed).not.toHaveBeenCalled(); expect(new FormData(form).getAll('services')).toEqual(['a']); controller.destroy();
  });

  it('[RESET-01] [RESET-02] [RESET-03] [RESET-06] [RESET-07] [RESET-08] resets to the authored selection with one notification', async () => {
    const form = mount(multi()) as HTMLFormElement; const root = form.firstElementChild as HTMLElement; const changed = vi.fn(); const controller = createMultiSelect(root, { onValueChange: changed });
    form.reset(); await Promise.resolve(); expect(changed).not.toHaveBeenCalled();
    root.querySelector<HTMLInputElement>('[value=b]')!.click(); changed.mockClear(); root.dataset.hwReadonly = 'true';
    form.reset(); await Promise.resolve(); expect(controller.value).toEqual(['a']); expect(new FormData(form).getAll('services')).toEqual(['a']); expect(changed.mock.calls).toEqual([[['a']]]);
    root.removeAttribute('data-hw-readonly'); await Promise.resolve(); form.addEventListener('reset', event => event.preventDefault(), { once: true }); root.querySelector<HTMLInputElement>('[value=b]')!.click(); changed.mockClear();
    form.reset(); await Promise.resolve(); expect(controller.value).toEqual(['a', 'b']); expect(changed).not.toHaveBeenCalled(); controller.destroy();
    document.body.innerHTML = `<form id="outer"></form>${multi().replace('<form>', '').replace('</form>', '').replaceAll('<input', '<input form="outer"')}`;
    const outer = document.querySelector('form')!; const external = createMultiSelect(document.querySelector<HTMLElement>('fieldset')!, { onValueChange: changed });
    document.querySelector<HTMLInputElement>('[value=b]')!.click(); changed.mockClear(); outer.reset(); await Promise.resolve(); expect(changed.mock.calls).toEqual([[['a']]]); external.destroy();
  });

  it('[INV-01] [INV-03] [INV-04] [INV-05] marks the filter input and the fieldset after a failed submission', async () => {
    const form = mount(multi().replace(' checked', '')) as HTMLFormElement; const root = form.firstElementChild as HTMLElement; const controller = createMultiSelect(root, { required: true }); const search = root.querySelector<HTMLInputElement>('[type=search]')!;
    expect(search.hasAttribute('aria-invalid') || root.hasAttribute('aria-invalid')).toBe(false);
    form.requestSubmit(); expect([search.getAttribute('aria-invalid'), root.getAttribute('aria-invalid')]).toEqual(['true', 'true']);
    root.querySelector<HTMLInputElement>('[value=a]')!.click(); expect(search.hasAttribute('aria-invalid') || root.hasAttribute('aria-invalid')).toBe(false);
    form.reset(); await Promise.resolve(); form.checkValidity(); expect(root.getAttribute('aria-invalid')).toBe('true');
    form.reset(); await Promise.resolve(); expect(root.hasAttribute('aria-invalid')).toBe(false); controller.destroy();
  });
});

const tags = (attributes = '', input = '') => `<form><div class="hw-field"><label class="hw-label" for="topics">Topics</label><div class="hw-tag-input" data-hw="tag-input" data-hw-name="topics" data-hw-value='["One","Two","Three"]' data-hw-remove-label="Remove {tag}" data-hw-required-message="Add a topic." ${attributes}><ul data-hw-tags></ul><input class="hw-input" id="topics" data-hw-tag-input ${input}></div><p class="hw-hint">Press Enter to add.</p></div></form>`;

describe('tag input', () => {
  it('[TAGINPUT-01] [TAGINPUT-02] renders li chips in a list beside the input, and only remove buttons', () => {
    const form = mount(tags()) as HTMLFormElement; const root = form.querySelector<HTMLElement>('[data-hw=tag-input]')!; const controller = createTagInput(root);
    expect([...root.children].map(node => node.localName)).toEqual(['ul', 'input']); expect(root.querySelector('ul')!.getAttribute('role')).toBe('list');
    const chip = root.querySelector('li.hw-chip')!; expect(chip.hasAttribute('role')).toBe(false); expect([...chip.childNodes].map(node => node.nodeName)).toEqual(['#text', 'BUTTON', 'INPUT']);
    expect(root.querySelectorAll('button')).toHaveLength(3); expect([...root.querySelectorAll('button')].every(button => button.hasAttribute('data-hw-remove-tag'))).toBe(true);
    const input = root.querySelector<HTMLInputElement>('[data-hw-tag-input]')!; input.value = 'Four'; key(input, 'Enter'); input.value = 'Five'; key(input, ',');
    expect(controller.value).toEqual(['One', 'Two', 'Three', 'Four', 'Five']); controller.destroy();
    const span = mount('<div data-hw="tag-input" data-hw-value=\'["A"]\' data-hw-remove-label="Remove {tag}"><div data-hw-tags></div><input data-hw-tag-input aria-label="Tags"></div>'); const other = createTagInput(span);
    expect(span.querySelector('span.hw-chip')!.getAttribute('role')).toBe('listitem'); other.destroy();
  });

  it('[FOCUS-04] removing a focused chip moves focus to the next, else the previous button, else the input; Backspace keeps it in the input', () => {
    const root = mount(tags()).querySelector<HTMLElement>('[data-hw=tag-input]')!; const controller = createTagInput(root); const input = root.querySelector<HTMLInputElement>('[data-hw-tag-input]')!;
    const button = (name: string) => root.querySelector<HTMLButtonElement>(`button[aria-label="Remove ${name}"]`)!;
    button('One').focus(); button('One').click(); expect(document.activeElement).toBe(button('Two'));
    button('Three').focus(); button('Three').click(); expect(document.activeElement).toBe(button('Two'));
    button('Two').click(); expect(document.activeElement).toBe(input); expect(controller.value).toEqual([]);
    controller.add('X'); input.focus(); key(input, 'Backspace'); expect(controller.value).toEqual([]); expect(document.activeElement).toBe(input); controller.destroy();
  });

  it('[RO-02] read-only: remove buttons are present and disabled; keys and clicks change nothing', () => {
    const root = mount(tags('data-hw-readonly="true"')).querySelector<HTMLElement>('[data-hw=tag-input]')!; const changed = vi.fn(); const controller = createTagInput(root, { onValueChange: changed });
    const buttons = [...root.querySelectorAll<HTMLButtonElement>('button')]; expect(buttons).toHaveLength(3); expect(buttons.every(button => button.disabled)).toBe(true);
    const input = root.querySelector<HTMLInputElement>('[data-hw-tag-input]')!; key(input, 'Backspace'); input.value = 'New'; key(input, 'Enter'); buttons[0]!.click();
    expect(controller.value).toEqual(['One', 'Two', 'Three']); expect(changed).not.toHaveBeenCalled(); controller.destroy();
  });

  it('[RESET-01] [RESET-02] [RESET-03] [RESET-07] [RESET-09] resets chips, hidden inputs and draft with one notification', async () => {
    const form = mount(tags()) as HTMLFormElement; const root = form.querySelector<HTMLElement>('[data-hw=tag-input]')!; const changed = vi.fn(); const controller = createTagInput(root, { onValueChange: changed });
    form.reset(); await Promise.resolve(); expect(changed).not.toHaveBeenCalled();
    controller.remove('Two'); const input = root.querySelector<HTMLInputElement>('[data-hw-tag-input]')!; input.value = 'draft'; input.disabled = true; changed.mockClear();
    form.reset(); await Promise.resolve(); input.disabled = false; await Promise.resolve();
    expect(controller.value).toEqual(['One', 'Two', 'Three']); expect(new FormData(form).getAll('topics')).toEqual(['One', 'Two', 'Three']); expect(input.value).toBe(''); expect(changed.mock.calls).toEqual([[['One', 'Two', 'Three']]]); controller.destroy();
  });

  it('[RESET-08] hidden inputs follow an external form and its reset', async () => {
    document.body.innerHTML = `<form id="outer"></form>${tags().replace('<form>', '').replace('</form>', '').replace('data-hw-tag-input', 'data-hw-tag-input form="outer"')}`;
    const form = document.querySelector('form')!; const controller = createTagInput(document.querySelector<HTMLElement>('[data-hw=tag-input]')!);
    controller.remove('One'); expect(new FormData(form).getAll('topics')).toEqual(['Two', 'Three']); form.reset(); await Promise.resolve(); expect(new FormData(form).getAll('topics')).toEqual(['One', 'Two', 'Three']); controller.destroy();
  });

  it('[INV-01] [INV-03] [INV-04] [INV-05] marks the text input after a failed submission until a tag is added or the form resets', async () => {
    const form = mount(tags('', 'required').replace(`data-hw-value='["One","Two","Three"]'`, '')) as HTMLFormElement; const root = form.querySelector<HTMLElement>('[data-hw=tag-input]')!; const controller = createTagInput(root); const input = root.querySelector<HTMLInputElement>('[data-hw-tag-input]')!;
    expect(input.hasAttribute('aria-invalid')).toBe(false); form.requestSubmit(); expect(input.getAttribute('aria-invalid')).toBe('true');
    controller.add('One'); expect(input.hasAttribute('aria-invalid')).toBe(false);
    form.reset(); await Promise.resolve(); form.checkValidity(); expect(input.getAttribute('aria-invalid')).toBe('true'); form.reset(); await Promise.resolve(); expect(input.hasAttribute('aria-invalid')).toBe(false); controller.destroy();
  });
});

describe('PIN input', () => {
  const pin = (attributes = '') => `<form><div data-hw="pin-input"><input data-hw-pin-input name="code" aria-label="Code" maxlength="6" ${attributes}></div></form>`;
  it('[PININPUT-01] has no maxlength while enhanced and normalises separators and digits before the length', () => {
    const root = mount(pin()).firstElementChild as HTMLElement; const changed = vi.fn(); const controller = createPinInput(root, { onValueChange: changed }); const input = root.querySelector<HTMLInputElement>('input')!;
    expect(input.hasAttribute('maxlength')).toBe(false); expect(input.pattern).toBe('[0-9]{6}');
    type(input, '123 456', 'insertFromPaste'); expect(input.value).toBe('123456'); type(input, '', 'deleteContent'); type(input, '12-34-56', 'insertFromPaste'); expect(input.value).toBe('123456');
    type(input, '٤٥٦-١٢٣', 'insertFromPaste'); expect(input.value).toBe('456123'); expect(changed.mock.calls).toEqual([['123456'], [''], ['123456'], ['456123']]);
    controller.destroy(); expect(input.getAttribute('maxlength')).toBe('6');
  });

  it('[PININPUT-02] one more typed digit keeps a full code; a longer paste is cut to the length', () => {
    const root = mount(pin()).firstElementChild as HTMLElement; const changed = vi.fn(); const controller = createPinInput(root, { onValueChange: changed }); const input = root.querySelector<HTMLInputElement>('input')!;
    type(input, '123456', 'insertFromPaste'); changed.mockClear(); type(input, '1234567'); expect(input.value).toBe('123456'); expect(changed).not.toHaveBeenCalled();
    type(input, '98765432', 'insertFromPaste'); expect(input.value).toBe('987654'); controller.destroy();
  });

  it('[INV-08] [INV-03] [INV-05] marks an incomplete code after blur or a failed submission until complete, empty or reset', async () => {
    const form = mount(pin('required')) as HTMLFormElement; const root = form.firstElementChild as HTMLElement; const controller = createPinInput(root); const input = root.querySelector<HTMLInputElement>('input')!;
    input.focus(); type(input, '123'); expect(input.hasAttribute('aria-invalid')).toBe(false); input.blur(); expect(input.getAttribute('aria-invalid')).toBe('true');
    type(input, '123456'); expect(input.hasAttribute('aria-invalid')).toBe(false);
    type(input, '12'); form.requestSubmit(); expect(input.getAttribute('aria-invalid')).toBe('true');
    form.reset(); await Promise.resolve(); expect(input.hasAttribute('aria-invalid')).toBe(false); controller.destroy();
  });

  it('[RESET-01] [RESET-02] [RESET-03] [RESET-07] resets to the authored code and notifies once', async () => {
    const form = mount(pin('value="111111"')) as HTMLFormElement; const changed = vi.fn(); const controller = createPinInput(form.firstElementChild as HTMLElement, { onValueChange: changed }); const input = form.querySelector('input')!;
    form.reset(); await Promise.resolve(); expect(changed).not.toHaveBeenCalled();
    type(input, '222222', 'insertFromPaste'); input.readOnly = true; changed.mockClear(); form.reset(); await Promise.resolve();
    expect(controller.value).toBe('111111'); expect(new FormData(form).get('code')).toBe('111111'); expect(changed.mock.calls).toEqual([['111111']]); controller.destroy();
  });
});

describe('password field', () => {
  const password = '<form><div data-hw="password-field" data-hw-show-label="Show password" data-hw-hide-label="Hide password"><input type="password" data-hw-password-input aria-label="Password" value="secret"><button type="button" data-hw-password-toggle></button></div></form>';
  it('[STATE-01] [STATE-06] the toggle notifies once per activation; visible reads the state', () => {
    const root = mount(password).firstElementChild as HTMLElement; const changed = vi.fn(); const visible = vi.fn(); root.addEventListener('hw:change', changed);
    const controller = createPasswordField(root, { onVisibleChange: visible }); expect(controller.visible).toBe(false);
    root.querySelector('button')!.click(); expect(controller.visible).toBe(true); root.querySelector('button')!.click();
    expect(visible.mock.calls).toEqual([[true], [false]]); expect(details(changed)).toEqual([{ visible: true }, { visible: false }]); controller.destroy();
  });

  it('[RESET-09] a native reset hides a visible password and notifies false once', async () => {
    const form = mount(password) as HTMLFormElement; const visible = vi.fn(); const controller = createPasswordField(form.firstElementChild as HTMLElement, { onVisibleChange: visible });
    form.reset(); await Promise.resolve(); expect(visible).not.toHaveBeenCalled();
    controller.toggle(); visible.mockClear(); form.reset(); await Promise.resolve();
    expect(controller.visible).toBe(false); expect(form.querySelector('input')!.type).toBe('password'); expect(form.querySelector('button')!.getAttribute('aria-pressed')).toBe('false'); expect(visible.mock.calls).toEqual([[false]]); controller.destroy();
  });
});

describe('search field', () => {
  it('[RESET-01] [RESET-02] [RESET-03] notifies the reset text once when it changed', async () => {
    const form = mount('<form><div data-hw="search-field" data-hw-clear-label="Clear"><input type="search" name="q" data-hw-search-input aria-label="Search"><button type="button" data-hw-search-clear></button></div></form>') as HTMLFormElement;
    const changed = vi.fn(); const controller = createSearchField(form.firstElementChild as HTMLElement, { onValueChange: changed }); const input = form.querySelector('input')!;
    form.reset(); await Promise.resolve(); expect(changed).not.toHaveBeenCalled();
    type(input, 'forms'); changed.mockClear(); form.reset(); await Promise.resolve(); expect(controller.value).toBe(''); expect(changed.mock.calls).toEqual([['']]); controller.destroy();
  });
});

// jsdom cannot build a FileList; the stub stands in for the browser's file list, cleared by input.value = '' and a form reset.
function stubFiles(input: HTMLInputElement) {
  let files: File[] = [];
  Object.defineProperty(input, 'files', { configurable: true, get: () => files, set: (list: ArrayLike<File>) => { files = [...Array.from(list)]; } });
  Object.defineProperty(input, 'value', { configurable: true, get: () => files.length ? `C:\\fakepath\\${files[0]!.name}` : '', set: (value: string) => { if (value === '') files = []; } });
  input.form?.addEventListener('reset', () => { files = []; });
  return { choose(list: File[]) { files = list; input.dispatchEvent(new Event('change', { bubbles: true })); } };
}
function drag(target: HTMLElement, type: string, files: File[] = [], kinds = ['Files']) {
  const event = new Event(type, { bubbles: true, cancelable: true }); const transfer = { files, types: kinds, dropEffect: 'none' };
  Object.defineProperty(event, 'dataTransfer', { value: transfer }); target.dispatchEvent(event); return { event, transfer };
}
const pdf = (name = 'b.pdf', size = 3) => new File(['x'.repeat(size)], name, { type: 'application/pdf' });
const dropzone = (attributes = '', input = 'accept=".pdf,.png" multiple', extra = '') => `<form><div class="hw-field hw-file-dropzone" data-hw="file-dropzone" data-hw-selected-message="{count} selected" data-hw-rejected-message="{count} rejected" data-hw-unsupported-drop-message="Use the chooser." ${attributes}><label class="hw-label" for="documents">Documents</label><p class="hw-file-dropzone-instruction" id="documents-instruction">Choose or drop documents</p><input class="hw-input" type="file" id="documents" data-hw-file-input name="documents" ${input} aria-describedby="app-note documents-instruction documents-hint"><p data-hw-file-status role="status"></p>${extra}<p class="hw-hint" id="documents-hint">PDF or PNG</p></div></form>`;
function setup(attributes?: string, input?: string, extra?: string, options = {}) {
  const form = mount(dropzone(attributes, input, extra)) as HTMLFormElement; const root = form.firstElementChild as HTMLElement; const field = root.querySelector<HTMLInputElement>('[data-hw-file-input]')!; const files = stubFiles(field);
  const value = vi.fn(); const reject = vi.fn(); const changed = vi.fn(); root.addEventListener('hw:change', changed);
  const controller = createFileDropzone(root, { onValueChange: value, onReject: reject, ...options });
  return { form, root, field, files, value, reject, changed, controller };
}

describe('file dropzone', () => {
  it('[FILEDROPZONE-01] a chooser batch with one mismatched file holds nothing and notifies the rejection once', () => {
    const { field, files, value, reject, changed, controller } = setup(); const text = new File(['x'], 'c.txt', { type: 'text/plain' });
    files.choose([pdf(), text]); expect(controller.value).toEqual([]); expect(field.value).toBe(''); expect(reject.mock.calls).toEqual([[[text]]]); expect(value).not.toHaveBeenCalled();
    expect(details(changed)).toEqual([{ value: [], rejected: true, rejectedFiles: [text] }]); controller.destroy();
  });

  it('[FILEDROPZONE-02] two files dropped on a single-file dropzone are both rejected', () => {
    const { root, reject, controller } = setup('', 'accept=".pdf"'); const files = [pdf('a.pdf'), pdf('b.pdf')];
    drag(root, 'drop', files); expect(controller.value).toEqual([]); expect(reject.mock.calls).toEqual([[files]]); controller.destroy();
  });

  it('[FILEDROPZONE-03] an accepted drop assigns the files and notifies once; a rejected batch then empties and notifies [] once', () => {
    const { root, value, reject, controller } = setup(); const accepted = [pdf('a.pdf'), pdf('b.pdf')];
    drag(root, 'drop', accepted); expect(controller.value).toEqual(accepted); expect(value.mock.calls).toEqual([[accepted]]); expect(root.querySelector('[data-hw-file-status]')!.textContent).toBe('2 selected');
    const text = new File(['x'], 'c.txt', { type: 'text/plain' }); drag(root, 'drop', [text]); expect(controller.value).toEqual([]); expect(value.mock.calls).toEqual([[accepted], [[]]]); expect(reject.mock.calls).toEqual([[[text]]]); controller.destroy();
  });

  it('[FILEDROPZONE-04] [TEXT-02] maxSize rejects a larger file; getRejectedMessage is required only with accept or maxSize', () => {
    const big = pdf('big.pdf', 10); const limited = setup('data-hw-max-size="5"', 'multiple'); limited.files.choose([big]); expect(limited.controller.value).toEqual([]); expect(limited.reject.mock.calls).toEqual([[[big]]]); limited.controller.destroy();
    const open = setup('', 'multiple'); open.files.choose([big]); expect(open.controller.value).toEqual([big]); open.controller.destroy(); expect(warn).not.toHaveBeenCalled();
    const markup = (attributes: string) => `<div ${attributes}><input type="file" data-hw-file-input aria-label="File"></div>`;
    createFileDropzone(mount(markup(''))).destroy(); expect(warn).not.toHaveBeenCalled();
    createFileDropzone(mount(markup('data-hw-max-size="5"'))).destroy(); expect(warn).toHaveBeenCalledTimes(1); expect(String(warn.mock.calls[0]![0])).toMatch(/^Hawiyah: FileDropzone requires "getRejectedMessage" when accept or maxSize is set/);
  });

  it('[MSG-04] [MSG-07] [INV-08] [MSG-02] a rejection shows one alert after the hint, described by the input, until an accepted batch or reset', async () => {
    const { form, root, field, files, controller } = setup();
    files.choose([new File(['x'], 'c.txt', { type: 'text/plain' })]);
    const error = root.querySelector<HTMLElement>('.hw-error')!; expect(root.lastElementChild).toBe(error); expect(error.getAttribute('role')).toBe('alert'); expect(error.textContent).toBe('1 rejected');
    expect(field.getAttribute('aria-describedby')).toBe(`app-note documents-instruction documents-hint ${error.id}`); expect(field.getAttribute('aria-invalid')).toBe('true'); expect(field.validity.customError).toBe(false);
    expect(root.getAttribute('data-state')).toBe('error'); expect(root.querySelector('[data-hw-file-status]')!.textContent).toBe('');
    files.choose([pdf()]); expect(root.querySelector('.hw-error')).toBeNull(); expect(field.hasAttribute('aria-invalid')).toBe(false); expect(root.hasAttribute('data-state')).toBe(false); expect(field.getAttribute('aria-describedby')).toBe('app-note documents-instruction documents-hint');
    files.choose([new File(['x'], 'c.txt', { type: 'text/plain' })]); form.reset(); await Promise.resolve(); expect(root.querySelector('.hw-error')).toBeNull(); expect(root.hasAttribute('data-state')).toBe(false); controller.destroy();
  });

  it('[MSG-05] an authored application error wins over a rejection and has no role; an empty [data-hw-error] carries the rejection', () => {
    const app = setup('', undefined, '<p class="hw-error" id="documents-error" data-hw-error>Upload your passport.</p>'); app.files.choose([new File(['x'], 'c.txt', { type: 'text/plain' })]);
    expect(app.root.querySelectorAll('.hw-error')).toHaveLength(1); expect(app.root.querySelector('.hw-error')!.textContent).toBe('Upload your passport.'); expect(app.root.querySelector('.hw-error')!.hasAttribute('role')).toBe(false); app.controller.destroy();
    const empty = setup('', undefined, '<p class="hw-error" data-hw-error></p>'); empty.files.choose([new File(['x'], 'c.txt', { type: 'text/plain' })]);
    expect(empty.root.querySelectorAll('.hw-error')).toHaveLength(1); expect(empty.root.querySelector('.hw-error')!.textContent).toBe('1 rejected'); expect(empty.root.querySelector('.hw-error')!.getAttribute('role')).toBe('alert');
    empty.controller.destroy(); expect(empty.root.querySelector('.hw-error')!.textContent).toBe(''); expect(empty.root.querySelector('.hw-error')!.hasAttribute('role')).toBe(false);
  });

  it('[MSG-06] without getRejectedMessage no error element is rendered; aria-invalid and data-state still apply; one warning', () => {
    const { root, field, files, controller } = setup('data-hw-rejected-message', undefined); warn.mockClear();
    root.removeAttribute('data-hw-rejected-message'); files.choose([new File(['x'], 'c.txt', { type: 'text/plain' })]);
    expect(root.querySelector('.hw-error')).toBeNull(); expect(field.getAttribute('aria-invalid')).toBe('true'); expect(root.getAttribute('data-state')).toBe('error'); expect(warn).toHaveBeenCalledTimes(1); controller.destroy();
  });

  it('[FILEDROPZONE-05] keeps the documented order: label, instruction, input, status, content, hint', () => {
    const { root, controller } = setup('', undefined, '<ul class="hw-file-upload-list"></ul>');
    expect([...root.children].map(node => node.localName + (node.className ? '.' + node.className.split(' ')[0] : ''))).toEqual(['label.hw-label', 'p.hw-file-dropzone-instruction', 'input.hw-input', 'p', 'ul.hw-file-upload-list', 'p.hw-hint']); controller.destroy();
  });

  it('[FILEDROPZONE-07] [FILEDROPZONE-10] a file drag sets data-state=dragging until it leaves the root; a text drag is left alone', () => {
    const { root, controller } = setup(); const { event, transfer } = drag(root, 'dragover');
    expect(event.defaultPrevented).toBe(true); expect(transfer.dropEffect).toBe('copy'); expect(root.getAttribute('data-state')).toBe('dragging'); expect(root.hasAttribute('data-dragover') || root.hasAttribute('data-dragging')).toBe(false);
    const leave = (related: Element | null) => { const out = new Event('dragleave', { bubbles: true }); Object.defineProperty(out, 'relatedTarget', { value: related }); root.dispatchEvent(out); };
    leave(root.querySelector('label')); expect(root.getAttribute('data-state')).toBe('dragging'); leave(document.body); expect(root.hasAttribute('data-state')).toBe(false);
    const text = drag(root, 'dragover', [], ['text/plain']); expect(text.event.defaultPrevented).toBe(false); expect(root.hasAttribute('data-state')).toBe(false); controller.destroy();
  });

  it('[FILEDROPZONE-09] [FILEDROPZONE-11] a disabled or read-only zone cancels a file drag with dropEffect none and ignores the drop', () => {
    for (const [attributes, input] of [['', 'disabled'], ['data-hw-readonly="true"', '']] as const) {
      const { root, value, reject, controller } = setup(attributes, input); const { event, transfer } = drag(root, 'dragover');
      expect(event.defaultPrevented).toBe(true); expect(transfer.dropEffect).toBe('none'); expect(root.getAttribute('data-state')).not.toBe('dragging');
      const drop = drag(root, 'drop', [pdf()]); expect(drop.event.defaultPrevented).toBe(true); expect(controller.value).toEqual([]); expect(value).not.toHaveBeenCalled(); expect(reject).not.toHaveBeenCalled(); controller.destroy();
    }
    const nested = mount(`<form><fieldset>${dropzone().replace('<form>', '').replace('</form>', '')}</fieldset></form>`); const root = nested.querySelector<HTMLElement>('[data-hw=file-dropzone]')!; stubFiles(root.querySelector('input')!); const value = vi.fn(); const controller = createFileDropzone(root, { onValueChange: value });
    drag(root, 'dragover'); nested.querySelector('fieldset')!.disabled = true; const drop = drag(root, 'drop', [pdf()]); expect(drop.event.defaultPrevented).toBe(true); expect(controller.value).toEqual([]); expect(value).not.toHaveBeenCalled(); controller.destroy();
  });

  it('[RO-01] [RO-02] [RO-03] [RO-04] [RO-05] read-only keeps the input focusable with aria-disabled, blocks the chooser and keeps the selection', async () => {
    const { root, field, files, value, controller } = setup(); const chosen = [pdf()]; files.choose(chosen); value.mockClear();
    root.dataset.hwReadonly = 'true'; await Promise.resolve();
    expect(field.disabled).toBe(false); expect(field.getAttribute('aria-disabled')).toBe('true'); expect(field.hasAttribute('aria-readonly')).toBe(false); expect(field.name).toBe('documents'); field.focus(); expect(document.activeElement).toBe(field);
    const click = new MouseEvent('click', { bubbles: true, cancelable: true }); field.dispatchEvent(click); expect(click.defaultPrevented).toBe(true); expect(key(field, ' ').defaultPrevented).toBe(true);
    drag(root, 'drop', [pdf('other.pdf')]); expect(controller.value).toEqual(chosen); expect(value).not.toHaveBeenCalled();
    root.removeAttribute('data-hw-readonly'); await Promise.resolve(); expect(field.hasAttribute('aria-disabled')).toBe(false); root.dataset.hwReadonly = 'true'; await Promise.resolve(); expect(field.getAttribute('aria-disabled')).toBe('true'); expect(controller.value).toEqual(chosen);
    controller.destroy(); expect(field.hasAttribute('aria-disabled')).toBe(false);
  });

  it('[RESET-01] [RESET-02] [RESET-03] [RESET-09] a reset empties the dropzone, clears status and rejection and notifies [] once when files were held', async () => {
    const { form, root, files, value, changed, controller } = setup();
    form.reset(); await Promise.resolve(); expect(value).not.toHaveBeenCalled(); expect(changed).not.toHaveBeenCalled();
    files.choose([pdf()]); value.mockClear(); changed.mockClear(); form.reset(); await Promise.resolve();
    expect(controller.value).toEqual([]); expect(root.querySelector('[data-hw-file-status]')!.textContent).toBe(''); expect(value.mock.calls).toEqual([[[]]]); expect(details(changed)).toEqual([{ value: [], rejected: false, rejectedFiles: [] }]); controller.destroy();
  });
});
