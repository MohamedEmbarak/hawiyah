// @vitest-environment jsdom
import { formatCalendarDate, resetTextWarnings } from '@hawiyah/core';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createCalendar, createDatePicker } from '../src/index.js';

// Vanilla fixtures of the cross-adapter Calendar and DatePicker cases (calendar-parity and date-picker-parity).
let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => { resetTextWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
afterEach(() => { document.body.innerHTML = ''; vi.useRealTimers(); vi.restoreAllMocks(); });
function mount(markup: string): HTMLElement { document.body.innerHTML = markup; return document.body.firstElementChild as HTMLElement; }
function key(node: Element, key: string) { node.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })); }
const active = () => (document.activeElement as HTMLElement).dataset.hwDate;
const weekend = (date: string) => [5, 6].includes(new Date(`${date}T00:00:00Z`).getUTCDay());
const warnings = (name: string) => warn.mock.calls.filter(([message]: unknown[]) => String(message).includes(`"${name}"`)).length;

describe('calendar parity', () => {
  it('[CALENDAR-01] rejected days are disabled buttons and none is the tab stop', () => {
    const root = mount('<div data-hw-locale="en-GB" data-hw-month="2026-10-01" aria-label="Date"></div>');
    const controller = createCalendar(root, { isDateDisabled: weekend });
    const rejected = [...root.querySelectorAll<HTMLButtonElement>('.hw-calendar-day')].filter(day => weekend(day.dataset.hwDate!));
    expect(rejected.length).toBeGreaterThan(0);
    rejected.forEach(day => { expect(day.disabled).toBe(true); expect(day.tabIndex).toBe(-1); }); controller.destroy();
  });
  it('[CALENDAR-02] arrows skip rejected days in the direction of travel', () => {
    const root = mount('<div data-hw-locale="en-GB" data-hw-value="2026-10-29" aria-label="Date"></div>');
    const controller = createCalendar(root, { isDateDisabled: weekend });
    root.querySelector<HTMLElement>('[data-hw-date="2026-10-29"]')!.focus(); key(document.activeElement!, 'ArrowRight');
    expect(active()).toBe('2026-11-01'); key(document.activeElement!, 'ArrowLeft'); expect(active()).toBe('2026-10-29'); controller.destroy();
  });
  it('[CALENDAR-03] click and Enter on a rejected day change nothing and notify nothing', () => {
    const root = mount('<div data-hw-locale="en-GB" data-hw-value="2026-10-29" aria-label="Date"></div>');
    const changed = vi.fn(); const controller = createCalendar(root, { isDateDisabled: weekend, onValueChange: changed }); root.addEventListener('hw:change', changed);
    const day = root.querySelector<HTMLButtonElement>('[data-hw-date="2026-10-30"]')!; day.click(); key(day, 'Enter'); controller.select('2026-10-30');
    expect(controller.value).toBe('2026-10-29'); expect(changed).not.toHaveBeenCalled(); controller.destroy();
  });
  it('[CALENDAR-04] an empty calendar puts the tab stop on today, else on the first available day of the month', () => {
    vi.useFakeTimers({ now: new Date('2026-10-14T09:00:00Z'), toFake: ['Date'] });
    let root = mount('<div data-hw-locale="en-GB" aria-label="Date"></div>'); let controller = createCalendar(root);
    expect(root.querySelector<HTMLElement>('.hw-calendar-day[tabindex="0"]')!.dataset.hwDate).toBe('2026-10-14'); controller.destroy();
    root = mount('<div data-hw-locale="en-GB" aria-label="Date"></div>'); controller = createCalendar(root, { isDateDisabled: date => date === '2026-10-14' });
    expect(root.querySelector<HTMLElement>('.hw-calendar-day[tabindex="0"]')!.dataset.hwDate).toBe('2026-10-01'); controller.destroy();
  });
  it('[CALENDAR-05] one status after the grid holds unsupportedMessage only while the Hijri calendar cannot show the value', () => {
    const root = mount('<div data-hw-locale="en" data-hw-calendar="islamic-umalqura" data-hw-value="1900-01-01" aria-label="Date" data-hw-unsupported-message="Choose a date from 1924-08-01."></div>');
    const controller = createCalendar(root); const status = () => root.querySelectorAll('[role=status]');
    expect(status()).toHaveLength(1); expect(status()[0]!.previousElementSibling!.querySelector('table.hw-calendar-grid')).not.toBeNull();
    expect(status()[0]!.textContent).toBe('Choose a date from 1924-08-01.'); expect(status()[0]!.querySelector('bdi[dir=ltr]')!.textContent).toBe('1924-08-01');
    controller.setValue('2026-10-28'); expect(status()).toHaveLength(1); expect(status()[0]!.textContent).toBe('');
    controller.setValue('1900-01-01'); controller.setCalendar('gregory'); expect(status()).toHaveLength(1); expect(status()[0]!.textContent).toBe('');
    controller.destroy(); expect(status()).toHaveLength(0);
  });
  it('[CALENDAR-06] a standalone calendar renders no calendar-system switch', () => {
    const root = mount('<div data-hw-locale="en" aria-label="Date"></div>'); const controller = createCalendar(root);
    expect(root.querySelector('.hw-calendar-switch')).toBeNull(); controller.destroy();
  });
  it('[TEXT-01] [TEXT-02] unsupportedMessage is required only for the Hijri calendar', () => {
    let root = mount('<div data-hw-locale="en" aria-label="Date"></div>'); let controller = createCalendar(root);
    expect(warnings('unsupportedMessage')).toBe(0); controller.destroy();
    root = mount('<div data-hw-locale="en" data-hw-calendar="islamic-umalqura" data-hw-value="1900-01-01" aria-label="Date"></div>'); controller = createCalendar(root);
    expect(warnings('unsupportedMessage')).toBe(1); expect(root.querySelector('[role=status]')!.textContent).toBe(''); controller.destroy();
  });
  it('[RESET-01] [RESET-02] [RESET-03] [RESET-06] a native reset restores the authored value and notifies once when it changed', async () => {
    const form = mount('<form><div data-hw-locale="en-GB" data-hw-value="2026-10-28" data-hw-name="day" aria-label="Date"></div></form>') as HTMLFormElement;
    const root = form.firstElementChild as HTMLElement; const changed = vi.fn(); const events = vi.fn(); root.addEventListener('hw:change', events);
    const controller = createCalendar(root, { onValueChange: changed });
    controller.select('2026-11-05'); changed.mockClear(); events.mockClear();
    const prevent = (event: Event) => event.preventDefault(); form.addEventListener('reset', prevent); form.reset(); await Promise.resolve();
    expect(controller.value).toBe('2026-11-05'); form.removeEventListener('reset', prevent);
    form.reset(); await Promise.resolve();
    expect(controller.value).toBe('2026-10-28'); expect(new FormData(form).get('day')).toBe('2026-10-28');
    expect(root.querySelector('[data-hw-date="2026-10-28"]')!.hasAttribute('data-selected')).toBe(true);
    expect(changed.mock.calls).toEqual([['2026-10-28']]); expect(events).toHaveBeenCalledTimes(1);
    form.reset(); await Promise.resolve(); expect(changed).toHaveBeenCalledTimes(1); controller.destroy();
  });
});

describe('date picker parity', () => {
  const texts = 'data-hw-locale="en-GB" data-hw-previous-label="Previous month" data-hw-next-label="Next month" data-hw-calendar-system-label="Calendar" data-hw-gregorian-label="Gregorian" data-hw-hijri-label="Hijri" data-hw-range-label="Supported range" data-hw-invalid-message="Enter a valid date." data-hw-unsupported-message="Choose a date from 1924-08-01." data-hw-unavailable-message="This date is unavailable."';
  function picker({ value = '', attrs = texts, input = '', after = '<p class="hw-hint" id="d-hint">YYYY-MM-DD</p>', describedby = 'app d-hint' } = {}) {
    const form = mount(`<form><div class="hw-field hw-date-picker" data-hw="date-picker" ${attrs}><label class="hw-label" for="d">Appointment</label><div class="hw-date-picker-control"><input class="hw-input" id="d" type="text" data-hw-date-input name="date" value="${value}" aria-describedby="${describedby}" ${input}><button type="button" data-hw-date-trigger aria-label="Choose date"></button></div>${after}<dialog data-hw-date-dialog aria-label="Choose date"><button type="button" data-hw-date-close>Close</button><div class="hw-dialog-body"><div data-hw-date-calendar></div></div></dialog></div></form><p id="app">Application</p>`) as HTMLFormElement;
    const root = form.firstElementChild as HTMLElement; const dialog = root.querySelector('dialog')!;
    dialog.showModal = vi.fn(() => { dialog.open = true; dialog.querySelector<HTMLButtonElement>('button')!.focus(); });
    dialog.close = vi.fn(() => { if (!dialog.open) return; dialog.open = false; dialog.dispatchEvent(new Event('close')); });
    return { form, root, dialog, input: root.querySelector<HTMLInputElement>('[data-hw-date-input]')!, trigger: root.querySelector<HTMLButtonElement>('[data-hw-date-trigger]')! };
  }
  const type = (input: HTMLInputElement, value: string) => { input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); };

  it('[INV-08] [TEXT-02] typing a rejected date marks the field invalid; unavailableMessage is required only with the predicate', () => {
    let { input } = picker({ attrs: texts.replace(' data-hw-unavailable-message="This date is unavailable."', '') });
    let controller = createDatePicker(input.closest<HTMLElement>('[data-hw]')!); expect(warnings('unavailableMessage')).toBe(0); controller.destroy();
    ({ input } = picker({ attrs: texts.replace(' data-hw-unavailable-message="This date is unavailable."', '') }));
    const root = input.closest<HTMLElement>('[data-hw]')!; controller = createDatePicker(root, { isDateDisabled: weekend });
    expect(warnings('unavailableMessage')).toBe(1); type(input, '2026-10-30');
    expect(input.getAttribute('aria-invalid')).toBe('true'); expect(input.validity.customError).toBe(true); expect(root.querySelector('.hw-error')).toBeNull(); controller.destroy();
    ({ input } = picker()); controller = createDatePicker(input.closest<HTMLElement>('[data-hw]')!, { isDateDisabled: weekend }); type(input, '2026-10-30');
    expect(input.validationMessage).toBe('This date is unavailable.'); expect(input.closest('[data-hw]')!.querySelector('.hw-error')!.textContent).toBe('This date is unavailable.'); controller.destroy();
  });
  it('[MSG-01] [MSG-02] [MSG-04] a malformed draft gives one alert after the hint, read last by the input', () => {
    const { root, input } = picker({ value: '2026-10-28' }); const controller = createDatePicker(root);
    const display = root.querySelector('output')!;
    expect(input.getAttribute('aria-describedby')).toBe(`app ${display.id} d-hint`);
    type(input, '2026-13-45');
    const errors = root.querySelectorAll('.hw-error'); expect(errors).toHaveLength(1);
    expect(errors[0]!.localName).toBe('p'); expect(errors[0]!.id).toBe('d-error'); expect(errors[0]!.getAttribute('role')).toBe('alert'); expect(errors[0]!.previousElementSibling!.className).toBe('hw-hint');
    expect([...root.children].slice(0, 4).map(node => node.className)).toEqual(['hw-label', 'hw-date-picker-control', 'hw-hint', 'hw-error']);
    expect(errors[0]!.textContent).toBe('Enter a valid date.'); expect(input.validationMessage).toBe('Enter a valid date.'); expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(`app ${display.id} d-hint d-error`);
    controller.destroy(); expect(input.getAttribute('aria-describedby')).toBe('app d-hint');
  });
  it('[MSG-03] [MSG-05] the application error wins: one element, its text, no role', () => {
    const { root, input } = picker({ after: '<p class="hw-hint" id="d-hint">YYYY-MM-DD</p><p class="hw-error" id="d-error">Choose your appointment.</p>', describedby: 'd-hint d-error', input: 'aria-invalid="true"' });
    const controller = createDatePicker(root); type(input, '2026-13-45');
    const errors = root.querySelectorAll('.hw-error'); expect(errors).toHaveLength(1); expect(errors[0]!.textContent).toBe('Choose your appointment.'); expect(errors[0]!.hasAttribute('role')).toBe(false);
    expect(input.getAttribute('aria-invalid')).toBe('true'); controller.destroy();
  });
  it('[MSG-06] a missing invalidMessage blocks submission without an element and warns once', () => {
    const { root, input } = picker({ attrs: texts.replace(' data-hw-invalid-message="Enter a valid date."', '') }); const controller = createDatePicker(root);
    type(input, '2026-13-45'); expect(input.validity.customError).toBe(true); expect(root.querySelector('.hw-error')).toBeNull(); expect(warnings('invalidMessage')).toBe(1); controller.destroy();
  });
  it('[MSG-07] the message leaves when the draft is valid, on reset and on destroy; an authored slot is restored', async () => {
    let { form, root, input } = picker(); let controller = createDatePicker(root);
    type(input, '2026-13-45'); expect(root.querySelector('.hw-error')).not.toBeNull(); type(input, '2026-10-28'); expect(root.querySelector('.hw-error')).toBeNull();
    type(input, '2026-13-45'); form.reset(); await Promise.resolve(); expect(root.querySelector('.hw-error')).toBeNull();
    type(input, '2026-13-45'); controller.destroy(); expect(root.querySelector('.hw-error')).toBeNull();
    ({ form, root, input } = picker({ after: '<p class="hw-hint" id="d-hint">YYYY-MM-DD</p><p class="hw-error" data-hw-error></p>' })); const slot = root.querySelector('[data-hw-error]')!; const before = slot.outerHTML;
    controller = createDatePicker(root); type(input, '2026-13-45');
    expect(root.querySelectorAll('.hw-error')).toHaveLength(1); expect(slot.textContent).toBe('Enter a valid date.'); expect(slot.getAttribute('role')).toBe('alert');
    expect(input.getAttribute('aria-describedby')!.split(' ').at(-1)).toBe(slot.id);
    type(input, ''); expect(slot.hasAttribute('role')).toBe(false); controller.destroy(); expect(slot.outerHTML).toBe(before);
  });
  it('[DATE-PICKER-05] an ISO date inside a produced message is isolated in bdi[dir=ltr]', () => {
    const { root, input } = picker({ attrs: texts.replace('data-hw-locale="en-GB"', 'data-hw-locale="en-GB" data-hw-calendar="islamic-umalqura"') }); const controller = createDatePicker(root);
    type(input, '1900-01-01'); expect(root.querySelector('.hw-error bdi[dir=ltr]')!.textContent).toBe('1924-08-01'); controller.destroy();
  });
  it('[INV-01] [INV-03] [INV-04] [INV-05] a failed submission marks the field until it is valid or the form resets', async () => {
    const { form, root, input } = picker({ input: 'required' }); const controller = createDatePicker(root);
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    const invalid = vi.fn((event: Event) => expect(event.defaultPrevented).toBe(false)); input.addEventListener('invalid', invalid);
    form.requestSubmit = form.requestSubmit ?? (() => form.checkValidity()); form.checkValidity(); expect(invalid).toHaveBeenCalled();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    type(input, '2026-10-28'); expect(input.hasAttribute('aria-invalid')).toBe(false);
    type(input, ''); expect(input.hasAttribute('aria-invalid')).toBe(false); form.checkValidity(); expect(input.getAttribute('aria-invalid')).toBe('true');
    form.reset(); await Promise.resolve(); expect(input.hasAttribute('aria-invalid')).toBe(false); controller.destroy();
  });
  it('[DATE-PICKER-02] [DATE-PICKER-04] opening focuses the selected day; Escape returns focus to the opener', () => {
    const { root, dialog, input, trigger } = picker({ value: '2026-10-28' }); const controller = createDatePicker(root);
    input.focus(); key(input, 'ArrowDown'); expect(dialog.contains(document.activeElement)).toBe(true); expect(active()).toBe('2026-10-28');
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })); controller.close(); expect(document.activeElement).toBe(input);
    trigger.focus(); trigger.click(); expect(active()).toBe('2026-10-28'); controller.close(); expect(document.activeElement).toBe(trigger); controller.destroy();
  });
  it('[DATE-PICKER-03] an empty picker focuses today', () => {
    vi.useFakeTimers({ now: new Date('2026-10-14T09:00:00Z'), toFake: ['Date'] });
    const { root, trigger } = picker(); const controller = createDatePicker(root); trigger.click(); expect(active()).toBe('2026-10-14'); controller.destroy();
  });
  it('[CALENDAR-06] [DATE-PICKER-06] the picker owns one switch before its calendar and one status', () => {
    const { root, dialog } = picker({ value: '1900-01-01' }); const changed = vi.fn(); root.addEventListener('hw:change', event => changed((event as CustomEvent).detail));
    const controller = createDatePicker(root); const host = root.querySelector('[data-hw-date-calendar]')!;
    expect(dialog.querySelectorAll('.hw-calendar-switch')).toHaveLength(1); expect(host.previousElementSibling!.className).toBe('hw-calendar-options');
    expect(host.querySelector('.hw-calendar-switch')).toBeNull();
    const hijri = dialog.querySelector<HTMLInputElement>('input[value="islamic-umalqura"]')!; hijri.checked = true; hijri.dispatchEvent(new Event('change', { bubbles: true }));
    expect(controller.calendar).toBe('islamic-umalqura'); expect(changed).toHaveBeenCalledWith({ calendar: 'islamic-umalqura' });
    expect(dialog.querySelectorAll('[role=status]')).toHaveLength(1); expect(dialog.querySelector('[role=status]')!.textContent).toBe('Choose a date from 1924-08-01.');
    controller.destroy(); expect(dialog.querySelector('.hw-calendar-options')).toBeNull();
  });
  it('[DATE-PICKER-07] the output announces the full date only', () => {
    const { root, input } = picker({ value: '2026-10-28' }); const controller = createDatePicker(root); const output = root.querySelector('output')!;
    expect(output.textContent).toBe(formatCalendarDate('2026-10-28', { locale: 'en-GB', calendar: 'gregory', dateStyle: 'full' })); expect(output.textContent).toContain('Wednesday');
    expect(output.getAttribute('aria-atomic')).toBe('true'); expect(output.getAttribute('for')).toBe('d');
    type(input, ''); expect(output.textContent).toBe(''); expect(output.hidden).toBe(true);
    type(input, '1900-01-01'); controller.setCalendar('islamic-umalqura'); expect(output.textContent).toBe(''); expect(output.hidden).toBe(true); controller.destroy();
  });
  it('[FMT-06] the output is never formatted without dateStyle', () => {
    const source = readFileSync(join(process.cwd(), 'packages/vanilla/src/calendar.ts'), 'utf8');
    expect(source.match(/formatCalendarDate\([^)]*\)/gu)!.filter(call => !call.includes('dateStyle'))).toEqual([]);
  });
  it('[DATE-PICKER-08] getDayLabel names every day button of the picker calendar', () => {
    const { root, trigger } = picker({ value: '2026-10-28' }); const controller = createDatePicker(root, { getDayLabel: date => `Day ${date}` }); trigger.click();
    root.querySelectorAll<HTMLElement>('.hw-calendar-day').forEach(day => expect(day.getAttribute('aria-label')).toBe(`Day ${day.dataset.hwDate}`)); controller.destroy();
  });
  it('[RESET-01] [RESET-02] [RESET-03] [RESET-06] a native reset restores the authored date and notifies once', async () => {
    const { form, root, input } = picker({ value: '2026-10-28' }); const changed = vi.fn(); const controller = createDatePicker(root, { onValueChange: changed });
    const prevent = (event: Event) => event.preventDefault();
    type(input, '2026-11-05'); changed.mockClear(); form.addEventListener('reset', prevent); form.reset(); await Promise.resolve(); expect(controller.value).toBe('2026-11-05'); form.removeEventListener('reset', prevent);
    form.reset(); await Promise.resolve();
    expect(controller.value).toBe('2026-10-28'); expect(new FormData(form).get('date')).toBe('2026-10-28'); expect(input.value).toBe(formatCalendarDate('2026-10-28', { locale: 'en-GB', calendar: 'gregory', dateStyle: 'medium' }));
    expect(changed.mock.calls).toEqual([['2026-10-28']]); form.reset(); await Promise.resolve(); expect(changed).toHaveBeenCalledTimes(1); controller.destroy();
  });
  it('[RESET-07] read-only and disabled pickers reset too', async () => {
    for (const state of ['readonly', 'disabled']) {
      const { form, root, input } = picker({ value: '2026-10-28' }); const controller = createDatePicker(root); controller.setValue('2026-11-05'); input.toggleAttribute(state, true);
      form.reset(); await Promise.resolve(); expect(controller.value).toBe('2026-10-28'); controller.destroy();
    }
  });
  it('[RESET-09] a reset with the dialog open and a malformed draft restores everything', async () => {
    const { form, root, dialog, input, trigger } = picker({ value: '2026-10-28' }); const controller = createDatePicker(root);
    trigger.click(); key(document.activeElement!, 'PageDown'); type(input, '2026-13-45'); form.checkValidity();
    form.reset(); await Promise.resolve();
    expect(dialog.open).toBe(false); expect(trigger.getAttribute('aria-expanded')).toBe('false'); expect(root.querySelector('.hw-error')).toBeNull(); expect(input.hasAttribute('aria-invalid')).toBe(false);
    trigger.click(); expect(active()).toBe('2026-10-28'); controller.destroy();
  });
  it('[DATE-PICKER-09] the nested calendar does not notify on reset', async () => {
    const { form, root, input } = picker(); const changed = vi.fn(); const controller = createDatePicker(root, { onValueChange: changed }); const events = vi.fn(); root.addEventListener('hw:change', events);
    type(input, '2026-10-28'); changed.mockClear(); events.mockClear();
    form.reset(); await Promise.resolve(); expect(changed.mock.calls).toEqual([['']]); expect(events).toHaveBeenCalledTimes(1); controller.destroy();
  });
});
