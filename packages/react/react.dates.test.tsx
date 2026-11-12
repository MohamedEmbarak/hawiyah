import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, useState } from 'react';
import type { ReactNode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { formatCalendarDate, resetTextWarnings } from '@hawiyah/core';
import { Calendar, DatePicker } from './src/index.js';
import type { CalendarProps, DatePickerProps } from './src/index.js';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const calendarTexts = { locale: 'en-GB', label: 'Appointment date', previousLabel: 'Previous month', nextLabel: 'Next month' };
const pickerTexts = { locale: 'en-GB', calendarLabel: 'Choose a date', openLabel: 'Open calendar', closeLabel: 'Close calendar', previousLabel: 'Previous month', nextLabel: 'Next month', calendarSystemLabel: 'Calendar system', gregorianLabel: 'Gregorian', hijriLabel: 'Hijri', rangeLabel: 'Supported Hijri dates', invalidMessage: 'Enter a date as YYYY-MM-DD.', unsupportedMessage: 'The Umm al-Qura calendar cannot show this date.' };
const weekend = (date: string) => [5, 6].includes(new Date(`${date}T00:00:00Z`).getUTCDay());
let container: HTMLDivElement; let root: Root; let warn: ReturnType<typeof vi.spyOn>;
const warnings = () => (warn.mock.calls as unknown[][]).map(call => String(call[0])).filter(message => message.startsWith('Hawiyah:'));
async function render(node: ReactNode) { await act(async () => root.render(node)); }
async function edit(input: HTMLInputElement, value: string) { await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })); }); }
async function key(element: Element, name: string) { await act(async () => { element.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true })); }); }
async function reset(form: HTMLFormElement) { await act(async () => { form.reset(); await Promise.resolve(); }); }
const day = (date: string) => container.querySelector<HTMLButtonElement>(`button.hw-calendar-day[data-date="${date}"]`)!;
const text = () => container.querySelector<HTMLInputElement>('input[type=text]')!;
const form = () => container.querySelector('form')!;
const Picker = DatePicker as (props: Partial<DatePickerProps> & Record<string, unknown>) => ReactNode;
const Cal = Calendar as (props: Partial<CalendarProps> & Record<string, unknown>) => ReactNode;

beforeAll(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: function (this: HTMLDialogElement) { this.open = false; this.dispatchEvent(new Event('close')); } });
});
beforeEach(() => { resetTextWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined); container = document.createElement('div'); document.body.append(container); root = createRoot(container); });
afterEach(async () => { await act(async () => root.unmount()); container.remove(); warn.mockRestore(); vi.useRealTimers(); });

describe('Calendar', () => {
  it('[CALENDAR-01][dates-2] rejected days are disabled buttons and never the tab stop', async () => {
    await render(<Calendar {...calendarTexts} defaultMonth="2026-10-01" isDateDisabled={weekend} />);
    const rejected = Array.from(container.querySelectorAll<HTMLButtonElement>('button.hw-calendar-day')).filter(button => weekend(button.dataset.date!));
    expect(rejected.length).toBeGreaterThan(0);
    expect(rejected.every(button => button.disabled && button.tabIndex !== 0)).toBe(true);
  });
  it('[CALENDAR-02][dates-2] arrow keys skip rejected days in the direction of travel', async () => {
    await render(<Calendar {...calendarTexts} defaultValue="2026-10-29" isDateDisabled={weekend} />);
    act(() => day('2026-10-29').focus()); await key(day('2026-10-29'), 'ArrowRight');
    expect((document.activeElement as HTMLElement).dataset.date).toBe('2026-11-01');
    await key(document.activeElement!, 'ArrowLeft');
    expect((document.activeElement as HTMLElement).dataset.date).toBe('2026-10-29');
  });
  it('[CALENDAR-03] click and Enter on a rejected day change nothing and notify nothing', async () => {
    const changed = vi.fn();
    await render(<form><Calendar {...calendarTexts} name="date" defaultValue="2026-10-29" isDateDisabled={weekend} onValueChange={changed} /></form>);
    await act(async () => day('2026-10-30').click()); await key(day('2026-10-30'), 'Enter');
    expect(changed).not.toHaveBeenCalled(); expect(new FormData(form()).get('date')).toBe('2026-10-29');
  });
  it('[CALENDAR-04][dates-6] an empty calendar puts the tab stop on today, else on the first available day', async () => {
    vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date('2026-10-14T09:00:00Z'));
    await render(<Calendar {...calendarTexts} />);
    expect(container.querySelector('button.hw-calendar-day[tabindex="0"]')!.getAttribute('data-date')).toBe('2026-10-14');
    await render(<Calendar {...calendarTexts} isDateDisabled={date => date === '2026-10-14'} />);
    expect(container.querySelector('button.hw-calendar-day[tabindex="0"]')!.getAttribute('data-date')).toBe('2026-10-01');
  });
  it('[CALENDAR-05][R01] one status after the grid announces a value the Umm al-Qura calendar cannot show', async () => {
    const status = () => container.querySelector('table.hw-calendar-grid + p.hw-sr-only[role=status]')!;
    await render(<Calendar {...calendarTexts} calendar="islamic-umalqura" rangeLabel="Supported dates" unsupportedMessage="Not shown before 1924-08-01." value="1900-01-01" />);
    expect(status().textContent).toBe('Not shown before 1924-08-01.'); expect(status().querySelector('bdi[dir=ltr]')!.textContent).toBe('1924-08-01');
    await render(<Calendar {...calendarTexts} calendar="islamic-umalqura" rangeLabel="Supported dates" unsupportedMessage="Not shown before 1924-08-01." value="2026-10-28" />);
    expect(status().textContent).toBe('');
    await render(<Calendar {...calendarTexts} value="1900-01-01" />);
    expect(status().textContent).toBe('');
  });
  it('[CALENDAR-06][R01] a standalone Calendar has no calendar-system switch', async () => {
    await render(<Calendar {...calendarTexts} />);
    expect(container.querySelector('.hw-calendar-switch')).toBeNull();
  });
  it('[TEXT-01][R01] islamic-umalqura without unsupportedMessage warns once and leaves the status empty; [TEXT-02] gregory does not warn', async () => {
    await render(<Cal {...calendarTexts} calendar="islamic-umalqura" rangeLabel="Supported dates" value="1900-01-01" />);
    expect(warnings().filter(message => message.includes('unsupportedMessage'))).toHaveLength(1);
    expect(container.querySelector('p[role=status]')!.textContent).toBe('');
    warn.mockClear(); resetTextWarnings();
    await render(<Calendar {...calendarTexts} value="1900-01-01" />);
    expect(warnings()).toEqual([]);
  });
  it('[RESET-01][RESET-02][dates-5] a native reset returns the calendar to defaultValue and notifies once', async () => {
    const changed = vi.fn();
    await render(<form><Calendar {...calendarTexts} name="date" defaultValue="2026-10-28" onValueChange={changed} /></form>);
    await act(async () => day('2026-10-05').click()); changed.mockClear();
    await reset(form());
    expect(new FormData(form()).get('date')).toBe('2026-10-28'); expect(changed.mock.calls).toEqual([['2026-10-28']]);
    expect(day('2026-10-28').closest('td')!.getAttribute('aria-selected')).toBe('true'); expect(day('2026-10-28').tabIndex).toBe(0);
  });
  it('[SSR-01][R01] the server HTML contains the empty status and equals the first client render', async () => {
    const node = <Calendar {...calendarTexts} defaultValue="2026-10-28" />;
    const html = renderToString(node); expect(html).toContain('<p role="status" class="hw-sr-only"></p>');
    await act(async () => root.unmount()); const errors = vi.fn(); const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    container.innerHTML = html; await act(async () => { root = hydrateRoot(container, node, { onRecoverableError: errors }); });
    expect(errors).not.toHaveBeenCalled(); expect(error).not.toHaveBeenCalled(); error.mockRestore();
  });
});

describe('DatePicker', () => {
  it('[INV-08][dates-2][R02] a typed rejected ISO date is invalid without a submission', async () => {
    await render(<DatePicker {...pickerTexts} label="Date" isDateDisabled={weekend} unavailableMessage="That day is closed." />);
    text().focus(); await edit(text(), '2026-10-30');
    expect(text().getAttribute('aria-invalid')).toBe('true'); expect(text().validity.customError).toBe(true);
    expect(container.querySelector('.hw-error')!.textContent).toBe('That day is closed.');
  });
  it('[TEXT-02][dates-2] unavailableMessage is required only with isDateDisabled', async () => {
    await render(<DatePicker {...pickerTexts} label="Date" />);
    expect(warnings()).toEqual([]);
    await render(<Picker {...pickerTexts} label="Date" isDateDisabled={weekend} />);
    expect(warnings().filter(message => message.includes('unavailableMessage'))).toHaveLength(1);
    text().focus(); await edit(text(), '2026-10-30');
    expect(container.querySelector('.hw-error')).toBeNull(); expect(text().checkValidity()).toBe(false);
  });
  it('[DATE-PICKER-01][dates-2] a date outside min/max and outside the Umm al-Qura range gets unsupportedMessage', async () => {
    await render(<DatePicker {...pickerTexts} label="Date" defaultCalendar="islamic-umalqura" min="2000-01-01" />);
    text().focus(); await edit(text(), '1900-01-01');
    expect(container.querySelector('.hw-error')!.textContent).toBe(pickerTexts.unsupportedMessage);
  });
  it('[MSG-01][MSG-02][dates-7] label, control, hint, error in order; aria-describedby lists application, formatted, hint and error ids', async () => {
    await render(<><p id="app">Note</p><DatePicker {...pickerTexts} id="when" label="Date" hint="Hint" error="Error" aria-describedby="app" defaultValue="2026-10-28" /></>);
    const field = container.querySelector('.hw-field')!;
    const order = ['label.hw-label', '.hw-date-picker-control', 'p.hw-hint', 'p.hw-error'].map(selector => field.querySelector(selector)!);
    for (let index = 1; index < order.length; index++) expect(order[index - 1].compareDocumentPosition(order[index]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(field.querySelector('p.hw-hint')!.id).toBe('when-hint'); expect(field.querySelector('p.hw-error')!.id).toBe('when-error');
    expect(text().getAttribute('aria-describedby')).toBe('app when-formatted when-hint when-error');
  });
  it('[MSG-03] the application error is one p.hw-error without role', async () => {
    await render(<DatePicker {...pickerTexts} label="Date" error="Choose a date" />);
    expect(container.querySelectorAll('.hw-error')).toHaveLength(1); expect(container.querySelector('.hw-error')!.hasAttribute('role')).toBe(false);
  });
  it('[MSG-04][dates-4][dates-7] a malformed draft gives one announced message, the same custom validity and aria-invalid', async () => {
    await render(<DatePicker {...pickerTexts} label="Date" />);
    text().focus(); await edit(text(), '2026-13-45');
    const errors = container.querySelectorAll('.hw-error');
    expect(errors).toHaveLength(1); expect(errors[0].getAttribute('role')).toBe('alert'); expect(errors[0].textContent).toBe(pickerTexts.invalidMessage);
    expect(text().validationMessage).toBe(pickerTexts.invalidMessage); expect(text().getAttribute('aria-invalid')).toBe('true');
  });
  it('[MSG-05] the application error wins over a violating draft', async () => {
    await render(<DatePicker {...pickerTexts} label="Date" error="Choose a date" />);
    text().focus(); await edit(text(), 'abc');
    const errors = container.querySelectorAll('.hw-error');
    expect(errors).toHaveLength(1); expect(errors[0].textContent).toBe('Choose a date'); expect(errors[0].hasAttribute('role')).toBe(false);
  });
  it('[MSG-06] a missing invalidMessage still blocks, renders no message and warns once', async () => {
    const { invalidMessage: _omitted, ...rest } = pickerTexts;
    await render(<Picker {...rest} label="Date" />);
    text().focus(); await edit(text(), 'abc');
    expect(text().validity.customError).toBe(true); expect(container.querySelector('.hw-error')).toBeNull();
    expect(warnings().filter(message => message.includes('invalidMessage'))).toHaveLength(1);
  });
  it('[MSG-07] the message disappears when the draft becomes valid and on a form reset', async () => {
    await render(<form><DatePicker {...pickerTexts} label="Date" /></form>);
    text().focus(); await edit(text(), 'abc'); expect(container.querySelector('.hw-error')).not.toBeNull();
    await edit(text(), '2026-10-28'); expect(container.querySelector('.hw-error')).toBeNull();
    await edit(text(), 'abc'); await reset(form()); expect(container.querySelector('.hw-error')).toBeNull();
  });
  it('[DATE-PICKER-05] ISO dates inside a produced message are isolated left to right', async () => {
    await render(<DatePicker {...pickerTexts} label="Date" invalidMessage="Choose a date after 2026-01-01." />);
    text().focus(); await edit(text(), 'abc');
    expect(container.querySelector('.hw-error bdi[dir=ltr]')!.textContent).toBe('2026-01-01');
  });
  it('[INV-01][INV-03][INV-04][INV-05] aria-invalid follows a failed submission until the value is valid or the form resets', async () => {
    await render(<form><DatePicker {...pickerTexts} label="Date" name="date" required /></form>);
    expect(text().hasAttribute('aria-invalid')).toBe(false);
    await act(async () => form().requestSubmit());
    expect(text().getAttribute('aria-invalid')).toBe('true');
    text().focus(); await edit(text(), '2026-10-28'); expect(text().hasAttribute('aria-invalid')).toBe(false);
    await edit(text(), ''); await act(async () => form().requestSubmit()); expect(text().getAttribute('aria-invalid')).toBe('true');
    await reset(form()); expect(text().hasAttribute('aria-invalid')).toBe(false);
  });
  it('[REQ-01][REQ-02][dates-7] a required picker shows one marker, last child of the label', async () => {
    await render(<DatePicker {...pickerTexts} label="Date" required />);
    const markers = container.querySelectorAll('.hw-required-marker');
    expect(markers).toHaveLength(1); expect(container.querySelector('label.hw-label')!.lastElementChild).toBe(markers[0]); expect(markers[0].textContent).toBe(' *');
    await render(<DatePicker {...pickerTexts} label="Date" />);
    expect(container.querySelector('.hw-required-marker')).toBeNull();
  });
  it('[SSR-01][dates-7] the server HTML of a valid picker has no message and equals the first client render', async () => {
    const node = <form><DatePicker {...pickerTexts} label="Date" name="date" defaultValue="2026-10-28" /></form>;
    const html = renderToString(node); expect(html).not.toContain('hw-error');
    await act(async () => root.unmount()); const errors = vi.fn(); const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    container.innerHTML = html; await act(async () => { root = hydrateRoot(container, node, { onRecoverableError: errors }); });
    expect(errors).not.toHaveBeenCalled(); expect(error).not.toHaveBeenCalled(); error.mockRestore();
  });
  it('[RESET-01][RESET-02][RESET-03][dates-5] reset returns to defaultValue, notifies once, and not at all when unchanged', async () => {
    const changed = vi.fn();
    await render(<form><DatePicker {...pickerTexts} label="Date" name="date" defaultValue="2026-10-28" onValueChange={changed} /></form>);
    text().focus(); await edit(text(), '2026-11-05'); act(() => text().blur()); changed.mockClear();
    await reset(form());
    expect(new FormData(form()).get('date')).toBe('2026-10-28'); expect(changed.mock.calls).toEqual([['2026-10-28']]);
    expect(text().value).toBe(formatCalendarDate('2026-10-28', { locale: 'en-GB', calendar: 'gregory', dateStyle: 'medium' }));
    changed.mockClear(); await reset(form()); expect(changed).not.toHaveBeenCalled();
  });
  it('[RESET-04][RESET-05] controlled: an applied notification and an ignored one', async () => {
    function Applied() { const [value, setValue] = useState('2026-11-05'); return <form><DatePicker {...pickerTexts} label="Date" name="date" value={value} onValueChange={setValue} defaultValue="2026-10-28" /><output data-value>{value}</output></form>; }
    await render(<Applied />); await reset(form());
    expect(new FormData(form()).get('date')).toBe('2026-10-28'); expect(container.querySelector('[data-value]')!.textContent).toBe('2026-10-28');
    expect(text().value).toBe(formatCalendarDate('2026-10-28', { locale: 'en-GB', calendar: 'gregory', dateStyle: 'medium' }));
    await act(async () => root.unmount()); root = createRoot(container);
    await render(<form><DatePicker {...pickerTexts} label="Date" name="date" value="2026-11-05" onValueChange={() => undefined} /></form>); await reset(form());
    expect(new FormData(form()).get('date')).toBe('2026-11-05');
    expect(text().value).toBe(formatCalendarDate('2026-11-05', { locale: 'en-GB', calendar: 'gregory', dateStyle: 'medium' }));
  });
  it('[RESET-06] a default-prevented reset changes nothing', async () => {
    await render(<form onReset={event => event.preventDefault()}><DatePicker {...pickerTexts} label="Date" name="date" defaultValue="2026-10-28" /></form>);
    text().focus(); await edit(text(), '2026-11-05'); await reset(form());
    expect(new FormData(form()).get('date')).toBe('2026-11-05');
  });
  it('[RESET-07] read-only and disabled pickers are reset too', async () => {
    for (const state of [{ readOnly: true }, { disabled: true }]) {
      const changed = vi.fn();
      await render(<form><DatePicker {...pickerTexts} label="Date" name="date" defaultValue="2026-10-28" onValueChange={changed} /></form>);
      text().focus(); await edit(text(), '2026-11-05'); act(() => text().blur());
      await render(<form><DatePicker {...pickerTexts} label="Date" name="date" defaultValue="2026-10-28" onValueChange={changed} {...state} /></form>);
      changed.mockClear(); await reset(form());
      expect(changed.mock.calls).toEqual([['2026-10-28']]); expect(container.querySelector<HTMLInputElement>('input[type=hidden][name=date]')!.value).toBe('2026-10-28');
      await act(async () => root.unmount()); root = createRoot(container);
    }
  });
  it('[RESET-09] reset with the dialog open and a malformed draft closes the dialog and clears the draft and message', async () => {
    await render(<form><DatePicker {...pickerTexts} label="Date" name="date" defaultValue="2026-10-28" /></form>);
    text().focus(); await edit(text(), 'abc'); await key(text(), 'ArrowDown');
    expect(container.querySelector('dialog')!.open).toBe(true);
    await act(async () => container.querySelector<HTMLButtonElement>('.hw-calendar-next')!.click());
    await reset(form());
    expect(container.querySelector('dialog')!.open).toBe(false); expect(container.querySelector('.hw-error')).toBeNull(); expect(text().hasAttribute('aria-invalid')).toBe(false);
    expect(container.querySelector('.hw-date-picker-trigger')!.getAttribute('aria-expanded')).toBe('false');
    expect(container.querySelector('.hw-calendar-heading h3')!.textContent).toBe(formatCalendarDate('2026-10-28', { locale: 'en-GB', calendar: 'gregory', month: 'long', year: 'numeric' } as never));
  });
  it('[DATE-PICKER-09][dates-5] the nested calendar does not notify or change the picker on reset', async () => {
    const changed = vi.fn();
    await render(<form><DatePicker {...pickerTexts} label="Date" name="date" onValueChange={changed} /></form>);
    text().focus(); await edit(text(), '2026-10-28'); act(() => text().blur()); changed.mockClear();
    expect(container.querySelector('.hw-calendar input[type=hidden]')!.getAttribute('form')).toBe('');
    await reset(form());
    expect(changed.mock.calls).toEqual([['']]);
  });
  it('[DATE-PICKER-02][dates-6] opening moves focus to the selected day, from ArrowDown and from the trigger', async () => {
    await render(<DatePicker {...pickerTexts} label="Date" defaultValue="2026-10-28" />);
    text().focus(); await key(text(), 'ArrowDown');
    expect(document.activeElement).toBe(container.querySelector('dialog button.hw-calendar-day[data-date="2026-10-28"]'));
    await act(async () => root.unmount()); root = createRoot(container);
    await render(<DatePicker {...pickerTexts} label="Date" defaultValue="2026-10-28" />);
    await act(async () => container.querySelector<HTMLButtonElement>('.hw-date-picker-trigger')!.click());
    expect(document.activeElement).toBe(container.querySelector('dialog button.hw-calendar-day[data-date="2026-10-28"]'));
  });
  it('[DATE-PICKER-03][dates-6] an empty picker focuses today', async () => {
    vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date('2026-10-14T09:00:00Z'));
    await render(<DatePicker {...pickerTexts} label="Date" />);
    text().focus(); await key(text(), 'ArrowDown');
    expect((document.activeElement as HTMLElement).dataset.date).toBe('2026-10-14');
  });
  it('[DATE-PICKER-04] Escape returns focus to the element that opened the dialog', async () => {
    await render(<DatePicker {...pickerTexts} label="Date" defaultValue="2026-10-28" />);
    const trigger = container.querySelector<HTMLButtonElement>('.hw-date-picker-trigger')!;
    trigger.focus(); await act(async () => trigger.click());
    await act(async () => { container.querySelector('dialog')!.dispatchEvent(new Event('cancel', { cancelable: true })); });
    expect(document.activeElement).toBe(trigger);
  });
  it('[CALENDAR-06][R01] the picker dialog has one calendar-system switch directly before the calendar, and switching notifies', async () => {
    const changed = vi.fn();
    await render(<DatePicker {...pickerTexts} label="Date" onCalendarChange={changed} />);
    const switches = container.querySelectorAll('dialog .hw-calendar-switch');
    expect(switches).toHaveLength(1); expect(switches[0].closest('.hw-calendar-options')!.nextElementSibling!.matches('section.hw-calendar')).toBe(true);
    await act(async () => container.querySelector<HTMLInputElement>('.hw-calendar-switch input[value="islamic-umalqura"]')!.click());
    expect(changed).toHaveBeenCalledWith('islamic-umalqura'); expect(container.querySelector('section.hw-calendar')!.getAttribute('data-calendar')).toBe('islamic-umalqura');
  });
  it('[DATE-PICKER-06][R01] an unsupported value gives exactly one status with the message in the dialog', async () => {
    await render(<DatePicker {...pickerTexts} label="Date" defaultCalendar="islamic-umalqura" defaultValue="1900-01-01" />);
    const statuses = container.querySelectorAll('dialog [role=status]');
    expect(statuses).toHaveLength(1); expect(statuses[0].textContent).toBe(pickerTexts.unsupportedMessage);
  });
  it('[DATE-PICKER-07][R03] the output announces the full date, and is empty and hidden otherwise', async () => {
    const output = () => container.querySelector('output.hw-date-picker-value')!;
    await render(<DatePicker {...pickerTexts} label="Date" defaultValue="2026-10-28" />);
    expect(output().textContent).toBe(formatCalendarDate('2026-10-28', { locale: 'en-GB', calendar: 'gregory', dateStyle: 'full' })); expect(output().textContent).toContain('Wednesday');
    await render(<DatePicker {...pickerTexts} label="Date" key="empty" />);
    expect(output().textContent).toBe(''); expect(output().hasAttribute('hidden')).toBe(true);
    await render(<DatePicker {...pickerTexts} label="Date" key="unsupported" defaultCalendar="islamic-umalqura" defaultValue="1900-01-01" />);
    expect(output().textContent).toBe(''); expect(output().hasAttribute('hidden')).toBe(true);
  });
  it('[DATE-PICKER-08][R25] getDayLabel names every day button of the picker calendar', async () => {
    await render(<DatePicker {...pickerTexts} label="Date" defaultValue="2026-10-28" getDayLabel={date => `Day ${date}`} />);
    const days = Array.from(container.querySelectorAll<HTMLButtonElement>('dialog button.hw-calendar-day'));
    expect(days.length).toBe(42); expect(days.every(button => button.getAttribute('aria-label') === `Day ${button.dataset.date}`)).toBe(true);
  });
});
