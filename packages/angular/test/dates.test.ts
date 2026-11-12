import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { formatCalendarDate } from '@hawiyah/core';
import { HwDatePickerComponent } from '@hawiyah/angular';
import { page } from './fixtures/page';
import { missingTextWarnings } from './fixtures/texts';

beforeAll(() => {
  TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
  if (!HTMLDialogElement.prototype.showModal) HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  if (!HTMLDialogElement.prototype.close) HTMLDialogElement.prototype.close = function () { if (!this.open) return; this.open = false; this.dispatchEvent(new Event('close')); };
});
afterEach(() => { vi.useRealTimers(); TestBed.resetTestingModule(); document.body.replaceChildren(); });

const calendarText = 'locale="en-GB" direction="ltr" previousLabel="Previous month" nextLabel="Next month"';
const pickerText = 'locale="en-GB" calendarLabel="Choose a date" openLabel="Open calendar" closeLabel="Close" previousLabel="Previous month" nextLabel="Next month" calendarSystemLabel="Calendar system" gregorianLabel="Gregorian" hijriLabel="Hijri" rangeLabel="Supported dates" invalidMessage="Enter a valid date." unsupportedMessage="Choose a date from 1900-04-30."';
/** Friday and Saturday. */
const weekend = (value: string) => [5, 6].includes(new Date(`${value}T12:00:00Z`).getUTCDay());
const day = (root: Element, value: string) => root.querySelector<HTMLButtonElement>(`.hw-calendar-day[data-date="${value}"]`)!;
const press = (element: Element, key: string) => element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
const type = (input: HTMLInputElement, value: string) => { input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); };
const submitted = (form: HTMLFormElement) => [...new FormData(form).entries()].map(([name, value]) => `${name}=${String(value)}`);
/** A reset from script is reported in the next microtask. */
async function reset(form: HTMLFormElement, fixture: { detectChanges(): void }) { form.reset(); await Promise.resolve(); await Promise.resolve(); fixture.detectChanges(); }

describe('hw-calendar', () => {
  it('[CALENDAR-01][dates-2] days that isDateDisabled rejects are disabled buttons and never the tab stop', () => {
    const { root } = page(`<hw-calendar label="Day" ${calendarText} value="2026-10-30" [isDateDisabled]="weekend" />`, { weekend });
    const days = [...root.querySelectorAll<HTMLButtonElement>('.hw-calendar-day')];
    expect(days.length).toBe(42);
    for (const button of days) { expect(button.disabled, button.dataset['date']).toBe(weekend(button.dataset['date']!)); if (button.disabled) expect(button.tabIndex).toBe(-1); }
    // The selected day is rejected: the tab stop is the first available day of the month instead.
    expect(root.querySelectorAll('.hw-calendar-day[tabindex="0"]')).toHaveLength(1); expect(root.querySelector<HTMLElement>('.hw-calendar-day[tabindex="0"]')!.dataset['date']).toBe('2026-10-01');
  });

  it('[CALENDAR-02][dates-2] an arrow key passes over rejected days in the direction of travel', () => {
    const { root, fixture } = page(`<hw-calendar label="Day" ${calendarText} value="2026-10-29" [isDateDisabled]="weekend" />`, { weekend });
    day(root, '2026-10-29').focus(); press(day(root, '2026-10-29'), 'ArrowRight'); fixture.detectChanges();
    expect((document.activeElement as HTMLElement).dataset['date']).toBe('2026-11-01');
    press(document.activeElement!, 'ArrowLeft'); fixture.detectChanges();
    expect((document.activeElement as HTMLElement).dataset['date']).toBe('2026-10-29');
  });

  it('[CALENDAR-02] an arrow key does not move when the next available day is beyond max', () => {
    const { root, fixture } = page(`<hw-calendar label="Day" ${calendarText} value="2026-10-29" max="2026-10-31" [isDateDisabled]="weekend" />`, { weekend });
    day(root, '2026-10-29').focus(); press(day(root, '2026-10-29'), 'ArrowRight'); fixture.detectChanges();
    expect((document.activeElement as HTMLElement).dataset['date']).toBe('2026-10-29');
  });

  it('[CALENDAR-03] a click and Enter on a rejected day change nothing and notify nothing', () => {
    const changed = vi.fn();
    const { root, fixture } = page(`<hw-calendar label="Day" name="day" ${calendarText} value="2026-10-29" [isDateDisabled]="weekend" (valueChange)="changed($event)" />`, { weekend, changed });
    const rejected = day(root, '2026-10-30');
    rejected.click(); rejected.dispatchEvent(new MouseEvent('click', { bubbles: true })); press(rejected, 'Enter'); fixture.detectChanges();
    expect(changed).not.toHaveBeenCalled(); expect(root.querySelector<HTMLInputElement>('input[type=hidden]')!.value).toBe('2026-10-29');
    day(root, '2026-10-28').click(); fixture.detectChanges(); expect(changed).toHaveBeenCalledExactlyOnceWith('2026-10-28');
  });

  it('[CALENDAR-04][dates-6] the tab stop of an empty calendar is today, or the first available day of the month when today is unavailable', () => {
    vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date('2026-10-14T09:00:00Z'));
    const { root } = page(`<hw-calendar label="Day" ${calendarText} /><hw-calendar label="Day" ${calendarText} [isDateDisabled]="today" />`, { today: (value: string) => value === '2026-10-14' });
    const [open, blocked] = [...root.querySelectorAll('hw-calendar')];
    expect(open!.querySelector<HTMLElement>('.hw-calendar-day[tabindex="0"]')!.dataset['date']).toBe('2026-10-14');
    expect(blocked!.querySelector<HTMLElement>('.hw-calendar-day[tabindex="0"]')!.dataset['date']).toBe('2026-10-01');
  });

  it('[CALENDAR-05][R01] one status element after the grid announces a value the Umm al-Qura calendar cannot show', () => {
    const { root, update } = page(`<hw-calendar label="Day" ${calendarText} rangeLabel="Supported dates" unsupportedMessage="Choose a date from 1900-04-30." [calendar]="calendar" [value]="value" />`, { calendar: 'islamic-umalqura', value: '1900-01-01' });
    const status = () => root.querySelector('table.hw-calendar-grid + p[role=status]')!;
    expect(root.querySelectorAll('[role=status]')).toHaveLength(1); expect(status().className).toBe('hw-sr-only');
    expect(status().textContent).toBe('Choose a date from 1900-04-30.'); expect(status().querySelector('bdi[dir=ltr]')!.textContent).toBe('1900-04-30');
    update({ value: '2026-10-28' }); expect(status().childNodes.length ? [...status().childNodes].every(node => node.nodeType === Node.COMMENT_NODE) : true).toBe(true); expect(status().textContent).toBe('');
    update({ calendar: 'gregory', value: '1900-01-01' }); expect(status().textContent).toBe('');
  });

  it('[CALENDAR-06][R01] a standalone calendar renders no calendar-system switch', () => {
    const { root } = page(`<hw-calendar label="Day" ${calendarText} />`);
    expect(root.querySelector('.hw-calendar-switch, .hw-calendar-options, [role=radiogroup]')).toBeNull();
  });

  it('[TEXT-01][TEXT-02][R01] unsupportedMessage is required only while the calendar is islamic-umalqura', () => {
    const warnings = missingTextWarnings();
    const { root, update } = page(`<hw-calendar label="Day" ${calendarText} rangeLabel="Supported dates" [calendar]="calendar" value="1900-01-01" />`, { calendar: 'gregory' });
    expect(warnings).toEqual([]);
    update({ calendar: 'islamic-umalqura' }); update();
    expect(warnings.map(warning => warning.split('.')[0])).toEqual([`Hawiyah: hw-calendar requires "unsupportedMessage" when calendar is islamic-umalqura`]);
    expect(root.querySelector('p[role=status]')!.textContent).toBe('');
  });

  it('[RESET-01][RESET-02][RESET-03][dates-5] a native reset returns the value, the selected day and the month, and notifies once', async () => {
    const changed = vi.fn();
    const { root, fixture } = page(`<form><hw-calendar label="Day" name="day" ${calendarText} value="2026-10-28" (valueChange)="changed($event)" /></form>`, { changed });
    const form = root.querySelector('form')!;
    await reset(form, fixture); expect(changed).not.toHaveBeenCalled();
    root.querySelector<HTMLButtonElement>('.hw-calendar-next')!.click(); fixture.detectChanges(); day(root, '2026-11-05').click(); fixture.detectChanges();
    expect(submitted(form)).toEqual(['day=2026-11-05']); expect(changed).toHaveBeenCalledTimes(1);
    await reset(form, fixture);
    expect(submitted(form)).toEqual(['day=2026-10-28']); expect(changed).toHaveBeenCalledTimes(2); expect(changed).toHaveBeenLastCalledWith('2026-10-28');
    expect(day(root, '2026-10-28').dataset['selected']).toBe('true'); expect(day(root, '2026-10-28').tabIndex).toBe(0); expect(root.querySelector('h3')!.textContent).toContain('October');
    await reset(form, fixture); expect(changed).toHaveBeenCalledTimes(2);
  });

  it('[RESET-01] the month input held at the start returns with the reset', async () => {
    const { root, fixture } = page(`<form><hw-calendar label="Day" name="day" ${calendarText} month="2026-03-01" /></form>`);
    root.querySelector<HTMLButtonElement>('.hw-calendar-next')!.click(); fixture.detectChanges(); expect(root.querySelector('h3')!.textContent).toContain('April');
    await reset(root.querySelector('form')!, fixture); expect(root.querySelector('h3')!.textContent).toContain('March');
  });
});

function picker(attributes = '', state: Record<string, unknown> = {}, wrap = (control: string) => `<form>${control}</form>`) {
  const changed = vi.fn();
  const view = page(wrap(`<hw-date-picker label="Date" name="date" controlId="date" ${pickerText} ${attributes} (valueChange)="changed($event)" />`), { changed, weekend, ...state });
  const host = view.root.querySelector('hw-date-picker')!, form = view.root.querySelector('form')!;
  const input = host.querySelector<HTMLInputElement>('input[type=text]')!, dialog = host.querySelector('dialog')!;
  const edit = (value: string) => { type(input, value); view.fixture.detectChanges(); };
  return { ...view, changed, host, form, input, dialog, edit, error: () => host.querySelector('.hw-error'), reset: () => reset(form, view.fixture) };
}

describe('hw-date-picker', () => {
  it('[INV-08][dates-2][R02] a typed date that isDateDisabled rejects is invalid at once, with the application\'s message', () => {
    const view = picker('[isDateDisabled]="weekend" unavailableMessage="Choose a working day."');
    view.edit('2026-10-30');
    expect(view.input.getAttribute('aria-invalid')).toBe('true'); expect(view.input.validity.customError).toBe(true); expect(view.input.validationMessage).toBe('Choose a working day.');
    expect(view.error()!.textContent).toBe('Choose a working day.'); expect(view.error()!.getAttribute('role')).toBe('alert');
    // The typed ISO date still becomes the value; it blocks submission.
    expect(view.changed).toHaveBeenLastCalledWith('2026-10-30'); expect(view.form.checkValidity()).toBe(false);
    view.edit('2026-10-29'); expect(view.input.hasAttribute('aria-invalid')).toBe(false); expect(view.error()).toBeNull(); expect(view.form.checkValidity()).toBe(true);
    // The calendar of the picker gets the predicate.
    expect(day(view.host, '2026-10-30').disabled).toBe(true); expect(day(view.host, '2026-10-29').disabled).toBe(false);
  });

  it('[INV-08] a date that breaks two constraints reports them in one order: outside min and max before unavailable', () => {
    const view = picker('[isDateDisabled]="weekend" unavailableMessage="Choose a working day." max="2026-10-29"');
    view.edit('2026-10-30'); expect(view.error()!.textContent).toBe('Enter a valid date.');
  });

  it('[TEXT-02][MSG-06] unavailableMessage is required only with isDateDisabled; without the text the date still blocks submission', () => {
    const warnings = missingTextWarnings();
    const plain = picker(); plain.edit('2026-10-30'); expect(warnings).toEqual([]);
    const view = picker('[isDateDisabled]="weekend"'); view.edit('2026-10-30'); view.fixture.detectChanges();
    expect(warnings.map(warning => warning.split('.')[0])).toEqual(['Hawiyah: hw-date-picker requires "unavailableMessage" when isDateDisabled is given']);
    expect(view.error()).toBeNull(); expect(view.input.validity.customError).toBe(true); expect(view.form.checkValidity()).toBe(false); expect(view.input.getAttribute('aria-invalid')).toBe('true');
  });

  it('[MSG-01][MSG-02][dates-7] label, control, hint and error in that order; the description lists the application\'s id, the formatted date, the hint and the error', () => {
    const view = picker('hint="Working days only" aria-describedby="note" value="2026-10-28"', {}, control => `<p id="note">Note</p><form>${control}</form>`);
    const field = view.host.querySelector('.hw-field.hw-date-picker')!;
    view.edit('2026-13-45');
    const order = [...field.children].filter(child => child.matches('label, .hw-date-picker-control, .hw-hint, .hw-error')).map(child => child.matches('label') ? 'label' : child.className);
    expect(order).toEqual(['label', 'hw-date-picker-control', 'hw-hint', 'hw-error']);
    expect(field.lastElementChild).toBe(view.error());
    expect(field.querySelector('p.hw-hint')!.id).toBe('date-hint'); expect(field.querySelector('p.hw-error')!.id).toBe('date-error'); expect(view.host.querySelector('[id$="-date-error"]')).toBeNull();
    expect(view.input.getAttribute('aria-describedby')).toBe('note date-formatted date-hint date-error');
  });

  it('[MSG-03][MSG-05] the application\'s error is the one error element, without a role, also while the draft violates a constraint', () => {
    const view = picker('error="Choose another date."');
    expect(view.host.querySelectorAll('.hw-error')).toHaveLength(1); expect(view.error()!.textContent).toBe('Choose another date.'); expect(view.error()!.hasAttribute('role')).toBe(false);
    view.edit('2026-13-45');
    expect(view.host.querySelectorAll('.hw-error')).toHaveLength(1); expect(view.error()!.textContent).toBe('Choose another date.'); expect(view.error()!.hasAttribute('role')).toBe(false);
    expect(view.input.validationMessage).toBe('Enter a valid date.');
  });

  it('[MSG-04][MSG-07][dates-4][dates-7] a malformed date shows one alert with invalidMessage, which leaves when the draft is valid again', () => {
    const view = picker();
    expect(view.error()).toBeNull();
    view.edit('2026-13-45');
    expect(view.host.querySelectorAll('.hw-error')).toHaveLength(1); expect(view.error()!.getAttribute('role')).toBe('alert'); expect(view.error()!.textContent).toBe('Enter a valid date.');
    expect(view.input.validationMessage).toBe('Enter a valid date.'); expect(view.input.getAttribute('aria-invalid')).toBe('true');
    view.edit('2026-10-28'); expect(view.error()).toBeNull(); expect(view.input.hasAttribute('aria-invalid')).toBe(false);
    view.edit('nonsense'); expect(view.error()).not.toBeNull(); view.edit(''); expect(view.error()).toBeNull();
  });

  it('[MSG-06] without invalidMessage the constraint still holds: no error element, one warning', () => {
    const warnings = missingTextWarnings();
    const { root, fixture } = page(`<form><hw-date-picker label="Date" ${pickerText.replace('invalidMessage="Enter a valid date."', '')} /></form>`);
    const input = root.querySelector<HTMLInputElement>('input[type=text]')!;
    type(input, '2026-13-45'); fixture.detectChanges(); fixture.detectChanges();
    expect(input.validity.customError).toBe(true); expect(root.querySelector('.hw-error')).toBeNull();
    expect(warnings.map(warning => warning.split('.')[0])).toEqual(['Hawiyah: hw-date-picker requires "invalidMessage"']);
  });

  it('[DATE-PICKER-05] an ISO date inside a produced message is isolated as left-to-right text', () => {
    const view = picker('calendar="islamic-umalqura"');
    view.edit('1900-01-01');
    expect(view.error()!.textContent).toBe('Choose a date from 1900-04-30.'); expect([...view.error()!.querySelectorAll('bdi[dir=ltr]')].map(part => part.textContent)).toEqual(['1900-04-30']);
  });

  it('[DATE-PICKER-06][R01] an unsupported value is announced by exactly one status element, the one of the calendar in the dialog', () => {
    const view = picker('calendar="islamic-umalqura" value="1900-01-01"');
    const statuses = [...view.host.querySelectorAll('[role=status]')];
    expect(statuses).toHaveLength(1); expect(view.dialog.contains(statuses[0]!)).toBe(true); expect(statuses[0]!.textContent).toBe('Choose a date from 1900-04-30.');
  });

  it('[CALENDAR-06][R01] the dialog of a picker has one calendar-system switch, before the calendar, and it changes and reports the calendar', () => {
    const changed = vi.fn();
    const view = picker('(calendarChange)="system($event)"', { system: changed });
    const switches = view.host.querySelectorAll('.hw-calendar-options > .hw-calendar-system.hw-calendar-switch[role=radiogroup]');
    expect(switches).toHaveLength(1); expect(switches[0]!.parentElement!.nextElementSibling!.localName).toBe('hw-calendar'); expect(view.host.querySelector('hw-calendar .hw-calendar-switch')).toBeNull();
    view.host.querySelector<HTMLInputElement>('.hw-calendar-switch input[value="islamic-umalqura"]')!.click(); view.fixture.detectChanges();
    expect(changed).toHaveBeenCalledExactlyOnceWith('islamic-umalqura'); expect(switches[0]!.getAttribute('data-calendar')).toBe('islamic-umalqura');
  });

  it('[INV-01][INV-03][INV-04][INV-05] a required empty picker is invalid only after a failed submission, until a valid date or a reset', async () => {
    const view = picker('required');
    expect(view.input.hasAttribute('aria-invalid')).toBe(false);
    expect(view.form.checkValidity()).toBe(false); view.fixture.detectChanges();
    expect(view.input.getAttribute('aria-invalid')).toBe('true');
    view.edit('2026-10-28'); expect(view.input.hasAttribute('aria-invalid')).toBe(false);
    view.edit(''); expect(view.input.hasAttribute('aria-invalid')).toBe(false);
    view.form.checkValidity(); view.fixture.detectChanges(); expect(view.input.getAttribute('aria-invalid')).toBe('true');
    await view.reset(); expect(view.input.hasAttribute('aria-invalid')).toBe(false);
  });

  it('[REQ-01][REQ-02][dates-7] the label carries one required marker as its last child, and none when the picker is not required', () => {
    const { root } = page(`<hw-date-picker label="Date" ${pickerText} required /><hw-date-picker label="Date" ${pickerText} />`);
    const [required, optional] = [...root.querySelectorAll('hw-date-picker label.hw-label')];
    expect(required!.querySelectorAll('.hw-required-marker')).toHaveLength(1); expect(required!.lastElementChild!.className).toBe('hw-required-marker'); expect(required!.lastElementChild!.textContent).toBe(' *'); expect(required!.lastElementChild!.getAttribute('aria-hidden')).toBe('true');
    expect(required!.id).toMatch(/-label$/); expect(optional!.querySelector('.hw-required-marker')).toBeNull();
  });

  it('[DATE-PICKER-02][DATE-PICKER-04][dates-6] opening moves focus to the selected day; closing returns it to the opener', () => {
    const view = picker('value="2026-10-28"');
    view.input.focus(); press(view.input, 'ArrowDown'); view.fixture.detectChanges();
    expect(view.dialog.open).toBe(true); expect(document.activeElement).toBe(day(view.dialog, '2026-10-28'));
    view.dialog.close(); view.fixture.detectChanges(); expect(document.activeElement).toBe(view.input);
    const trigger = view.host.querySelector<HTMLButtonElement>('.hw-date-picker-trigger')!;
    trigger.focus(); trigger.click(); view.fixture.detectChanges();
    expect(document.activeElement).toBe(day(view.dialog, '2026-10-28')); expect(trigger.getAttribute('aria-expanded')).toBe('true');
    view.dialog.close(); view.fixture.detectChanges(); expect(document.activeElement).toBe(trigger);
  });

  it('[DATE-PICKER-03][dates-6] opening an empty picker moves focus to today', () => {
    vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date('2026-10-14T09:00:00Z'));
    const view = picker();
    view.host.querySelector<HTMLButtonElement>('.hw-date-picker-trigger')!.click(); view.fixture.detectChanges();
    expect(document.activeElement).toBe(day(view.dialog, '2026-10-14'));
  });

  it('[DATE-PICKER-07][R03] the output announces the full date with the weekday, and is empty and hidden without a date it can show', () => {
    const view = picker('value="2026-10-28" [calendar]="calendar"', { calendar: 'gregory' });
    const output = view.host.querySelector<HTMLOutputElement>('output.hw-date-picker-value')!;
    expect(output.textContent).toBe(formatCalendarDate('2026-10-28', { locale: 'en-GB', calendar: 'gregory', dateStyle: 'full' })); expect(output.textContent).toContain('Wednesday'); expect(output.hidden).toBe(false);
    expect(output.getAttribute('aria-live')).toBe('polite'); expect(output.getAttribute('aria-atomic')).toBe('true');
    view.edit('1900-01-01'); view.update({ calendar: 'islamic-umalqura' }); expect(output.textContent).toBe(''); expect(output.hidden).toBe(true);
    view.update({ calendar: 'gregory' }); view.edit(''); expect(output.textContent).toBe(''); expect(output.hidden).toBe(true);
  });

  it('[DATE-PICKER-08][R25] getDayLabel names every day button of the calendar of the picker', () => {
    const view = picker('value="2026-10-28" [getDayLabel]="name"', { name: (value: string) => `Day ${value}` });
    const days = [...view.dialog.querySelectorAll<HTMLElement>('.hw-calendar-day')];
    expect(days).toHaveLength(42); for (const button of days) expect(button.getAttribute('aria-label')).toBe(`Day ${button.dataset['date']}`);
  });

  it('[RESET-01][RESET-02][RESET-03][dates-5] a native reset returns the shown, submitted and held date, and notifies once', async () => {
    const view = picker('value="2026-10-28"');
    const shown = view.input.value;
    await view.reset(); expect(view.changed).not.toHaveBeenCalled();
    view.input.focus(); view.edit('2026-11-05'); view.input.blur(); view.fixture.detectChanges();
    expect(submitted(view.form)).toEqual(['date=2026-11-05']); expect(view.changed).toHaveBeenCalledTimes(1);
    await view.reset();
    expect(view.input.value).toBe(shown); expect(submitted(view.form)).toEqual(['date=2026-10-28']);
    expect(view.changed).toHaveBeenCalledTimes(2); expect(view.changed).toHaveBeenLastCalledWith('2026-10-28');
    expect(view.host.querySelector('output')!.textContent).toBe(formatCalendarDate('2026-10-28', { locale: 'en-GB', calendar: 'gregory', dateStyle: 'full' }));
    await view.reset(); expect(view.changed).toHaveBeenCalledTimes(2);
  });

  it('[RESET-04][RESET-05] with a two-way value all three agree after a reset; with a one-way value the initial value returns', async () => {
    const two = picker('[(value)]="date"', { date: '2026-10-28' });
    two.edit('2026-11-05'); expect((two.state as { date?: string }).date).toBe('2026-11-05');
    await two.reset(); expect((two.state as { date?: string }).date).toBe('2026-10-28'); expect(submitted(two.form)).toEqual(['date=2026-10-28']);
    const one = picker('[value]="date"', { date: '2026-10-28' });
    one.edit('2026-11-05'); await one.reset();
    expect(submitted(one.form)).toEqual(['date=2026-10-28']); expect(one.input.value).toBe(two.input.value);
  });

  it('[RESET-06] a reset that a listener prevents changes nothing', async () => {
    const view = picker('value="2026-10-28"');
    view.form.addEventListener('reset', event => event.preventDefault());
    view.edit('2026-11-05'); view.form.dispatchEvent(new Event('reset', { bubbles: true, cancelable: true })); await Promise.resolve(); await Promise.resolve(); view.fixture.detectChanges();
    expect(submitted(view.form)).toEqual(['date=2026-11-05']); expect(view.changed).toHaveBeenCalledTimes(1);
  });

  it('[RESET-07] read-only and disabled pickers are reset like an editable one', async () => {
    for (const state of ['readOnly', 'disabled'] as const) {
      const view = picker(`value="2026-10-28" [${state}]="locked"`, { locked: false });
      view.edit('2026-11-05'); view.update({ locked: true });
      await view.reset();
      expect(view.changed, state).toHaveBeenLastCalledWith('2026-10-28'); expect(view.host.querySelector<HTMLInputElement>('input[type=hidden]')!.value, state).toBe('2026-10-28');
      TestBed.resetTestingModule(); document.body.replaceChildren();
    }
  });

  it('[RESET-09] a reset with the dialog open and a malformed draft closes the dialog and clears the draft, the message and the invalid state', async () => {
    const view = picker('value="2026-10-28" required');
    const trigger = view.host.querySelector<HTMLButtonElement>('.hw-date-picker-trigger')!;
    trigger.click(); view.fixture.detectChanges();
    view.dialog.querySelector<HTMLButtonElement>('.hw-calendar-next')!.click(); view.fixture.detectChanges();
    view.edit('2026-13-45'); expect(view.error()).not.toBeNull(); expect(view.dialog.open).toBe(true);
    await view.reset(); view.fixture.detectChanges();
    expect(view.dialog.open).toBe(false); expect(trigger.getAttribute('aria-expanded')).toBe('false'); expect(view.error()).toBeNull(); expect(view.input.hasAttribute('aria-invalid')).toBe(false);
    expect(view.input.validity.valid).toBe(true); expect(submitted(view.form)).toEqual(['date=2026-10-28']);
    trigger.click(); view.fixture.detectChanges(); expect(view.dialog.querySelector('h3')!.textContent).toContain('October');
  });

  it('[DATE-PICKER-09] the calendar inside the picker is not a control of the surrounding form: one notification with the reset target', async () => {
    const view = picker();
    expect(view.host.querySelector<HTMLInputElement>('hw-calendar input[type=hidden]')!.getAttribute('form')).toBe('');
    view.edit('2026-11-05'); expect(view.changed).toHaveBeenCalledTimes(1);
    await view.reset();
    expect(view.changed).toHaveBeenCalledTimes(2); expect(view.changed).toHaveBeenLastCalledWith(''); expect(view.input.value).toBe(''); expect(submitted(view.form)).toEqual(['date=']);
  });

  it('[ATTR-03] the date input takes form, and reports focus and blur', () => {
    const focused = vi.fn(), blurred = vi.fn();
    const view = picker('form="outer" (focused)="focused($event)" (blurred)="blurred($event)"', { focused, blurred }, control => `<form id="outer"></form><form>${control}</form>`);
    expect(view.input.getAttribute('form')).toBe('outer'); expect(view.host.querySelector('input[type=hidden][name=date]')!.getAttribute('form')).toBe('outer');
    view.input.focus(); view.input.blur(); expect(focused).toHaveBeenCalledTimes(1); expect(blurred).toHaveBeenCalledTimes(1);
  });
});

describe('names of hw-calendar and hw-date-picker', () => {
  it('[NAME-01][NAME-02][NAME-03][ATTR-03][E08] label, aria-label or aria-labelledby names the grid; the host keeps none of the attributes', () => {
    const { root, update } = page(`<h2 id="heading">Heading</h2><p id="note">Note</p>
      <hw-calendar label="Day" ${calendarText} hint="Working days" />
      <hw-calendar aria-label="Static name" aria-describedby="note" ${calendarText} />
      <hw-calendar aria-labelledby="heading" ${calendarText} />
      <hw-calendar [aria-label]="name" ${calendarText} />
      <hw-field label="Appointment"><hw-calendar ${calendarText} /></hw-field>`, { name: 'Bound name' });
    const hosts = [...root.querySelectorAll('hw-calendar')], grids = hosts.map(host => host.querySelector('table.hw-calendar-grid')!);
    for (const host of hosts) for (const name of ['aria-label', 'aria-labelledby', 'aria-describedby', 'aria-invalid']) expect(host.hasAttribute(name), name).toBe(false);
    expect(grids[0]!.getAttribute('aria-label')).toBe('Day'); expect(grids[0]!.hasAttribute('aria-labelledby')).toBe(false); expect(grids[0]!.getAttribute('aria-describedby')).toBe(hosts[0]!.querySelector('.hw-hint')!.id);
    expect(grids[1]!.getAttribute('aria-label')).toBe('Static name'); expect(grids[1]!.getAttribute('aria-describedby')).toBe('note');
    expect(grids[2]!.getAttribute('aria-labelledby')).toBe('heading'); expect(grids[2]!.hasAttribute('aria-label')).toBe(false);
    expect(grids[3]!.getAttribute('aria-label')).toBe('Bound name'); update({ name: 'Other name' }); expect(grids[3]!.getAttribute('aria-label')).toBe('Other name');
    // [NAME-05] inside a field the grid is named by the label of the field.
    expect(grids[4]!.getAttribute('aria-labelledby')).toBe(root.querySelector('hw-field label')!.id);
  });

  it('[NAME-04][E08] a calendar with neither label nor forwarded name has an unnamed grid and warns once', () => {
    const warnings = missingTextWarnings();
    const { root, update } = page(`<hw-calendar ${calendarText} />`);
    update();
    expect(root.querySelector('table')!.hasAttribute('aria-label')).toBe(false); expect(root.querySelector('table')!.hasAttribute('aria-labelledby')).toBe(false);
    expect(warnings.map(warning => warning.split('.')[0])).toEqual(['Hawiyah: hw-calendar requires "label"']);
  });

  it('[NAME-02][NAME-03][ATTR-03][dates-7] a date picker named by aria-label or aria-labelledby renders no label and does not warn', () => {
    const { root } = page(`<h2 id="heading">Heading</h2><hw-date-picker aria-label="Appointment" aria-invalid="true" ${pickerText} /><hw-date-picker aria-labelledby="heading" ${pickerText} /><hw-field label="Visit"><hw-date-picker ${pickerText} /></hw-field>`);
    const hosts = [...root.querySelectorAll('hw-date-picker')], inputs = hosts.map(host => host.querySelector('input[type=text]')!);
    expect(root.querySelector('hw-date-picker label.hw-label')).toBeNull();
    for (const host of hosts) for (const name of ['aria-label', 'aria-labelledby', 'aria-describedby', 'aria-invalid']) expect(host.hasAttribute(name), name).toBe(false);
    expect(inputs[0]!.getAttribute('aria-label')).toBe('Appointment'); expect(inputs[0]!.getAttribute('aria-invalid')).toBe('true');
    expect(inputs[1]!.getAttribute('aria-labelledby')).toBe('heading'); expect(inputs[1]!.hasAttribute('aria-invalid')).toBe(false);
    expect(inputs[2]!.getAttribute('aria-labelledby')).toBe(root.querySelector('hw-field label')!.id); expect(inputs[2]!.id).toBe(root.querySelector('hw-field label')!.getAttribute('for'));
  });
});

describe('hw-date-picker with Angular Forms', () => {
  const mount = () => {
    class Host { date = new FormControl('2026-10-28'); weekend = weekend; }
    Component({ standalone: true, imports: [ReactiveFormsModule, HwDatePickerComponent], template: `<form><hw-date-picker label="Date" name="date" ${pickerText} [formControl]="date" [isDateDisabled]="weekend" unavailableMessage="Choose a working day." /></form>` })(Host);
    const fixture = TestBed.createComponent(Host); document.body.append(fixture.nativeElement); fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    return { fixture, control: fixture.componentInstance.date, form: root.querySelector('form')!, input: root.querySelector<HTMLInputElement>('input[type=text]')! };
  };

  it('[DATE-PICKER-10][dates-2] a rejected date is the calendarUnavailable error of the control', () => {
    const { fixture, control, input } = mount();
    expect(control.errors).toBeNull();
    type(input, '2026-10-30'); fixture.detectChanges();
    expect(control.errors).toEqual({ calendarUnavailable: { actual: '2026-10-30' } }); expect(control.value).toBe('2026-10-30');
    type(input, '2026-10-29'); fixture.detectChanges(); expect(control.errors).toBeNull();
  });

  it('[RESET-10][DATE-PICKER-09] with a form control a native reset writes nothing: the picker and its calendar show what Angular Forms holds', async () => {
    const { fixture, control, form, input } = mount();
    type(input, '2026-11-05'); fixture.detectChanges();
    const written = vi.fn(); control.valueChanges.subscribe(written);
    await reset(form, fixture);
    // Validation runs again, with the value Angular Forms already holds; the component writes no value of its own.
    expect(written.mock.calls.every(([value]) => value === '2026-11-05')).toBe(true); expect(control.value).toBe('2026-11-05'); expect(submitted(form)).toEqual(['date=2026-11-05']);
    control.reset('2026-10-28'); fixture.detectChanges(); expect(submitted(form)).toEqual(['date=2026-10-28']);
  });
});
