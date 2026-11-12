// Calendar and DatePicker cases shared by the four adapters (milestone 3: dates-2, R02, dates-4..7, R01).
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createApp, createSSRApp, defineComponent, h, nextTick, ref, type App } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { formatCalendarDate, resetTextWarnings } from '@hawiyah/core';
import { Calendar, DatePicker } from '../src/calendar.js';
import { calendarText, datePickerText } from './texts.js';

let app: App | undefined;
let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  resetTextWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value(this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value(this: HTMLDialogElement) { this.open = false; } });
});
afterEach(() => { app?.unmount(); app = undefined; document.body.replaceChildren(); warn.mockRestore(); vi.useRealTimers(); });
const warnings = () => (warn.mock.calls as unknown[][]).map(call => String(call[0])).filter(message => message.startsWith('Hawiyah:'));
function mount(render: () => ReturnType<typeof h>) {
  const host = document.createElement('div'); document.body.append(host);
  app = createApp(defineComponent(() => render)); app.mount(host); return host;
}
const settle = async () => { await Promise.resolve(); await nextTick(); await nextTick(); };
const type = async (input: HTMLInputElement, value: string) => { input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); await nextTick(); await nextTick(); };
const weekend = (date: string) => [5, 6].includes(new Date(`${date}T00:00:00Z`).getUTCDay());
const day = (host: ParentNode, date: string) => [...host.querySelectorAll<HTMLButtonElement>('button.hw-calendar-day')].find(button => button.getAttribute('aria-label') === formatCalendarDate(date, { locale: 'en-US', calendar: 'gregory', dateStyle: 'full' }))!;
const key = (target: Element, name: string) => target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));
const picker = (props: Record<string, unknown> = {}) => h(DatePicker, { ...datePickerText, label: 'Date', name: 'date', ...props });

it('[CALENDAR-01][dates-2] days the predicate rejects are disabled buttons and never the tab stop', () => {
  const host = mount(() => h(Calendar, { ...calendarText, month: '2026-10-01', isDateDisabled: weekend }));
  const rejected = [...host.querySelectorAll<HTMLButtonElement>('button.hw-calendar-day')].filter(button => weekend(button.getAttribute('aria-label') ? isoOf(button) : ''));
  expect(rejected.length).toBeGreaterThan(0);
  for (const button of rejected) { expect(button.disabled).toBe(true); expect(button.tabIndex).toBe(-1); }
});
function isoOf(button: HTMLButtonElement) {
  const label = button.getAttribute('aria-label')!;
  for (let offset = -10; offset < 45; offset++) { const date = new Date(Date.UTC(2026, 9, 1 + offset)).toISOString().slice(0, 10); if (formatCalendarDate(date, { locale: 'en-US', calendar: 'gregory', dateStyle: 'full' }) === label) return date; }
  return '';
}

it('[CALENDAR-02][dates-2] arrows skip rejected days in the direction of travel', async () => {
  const host = mount(() => h(Calendar, { ...calendarText, defaultValue: '2026-10-29', isDateDisabled: weekend }));
  key(day(host, '2026-10-29'), 'ArrowRight'); await settle();
  expect(document.activeElement).toBe(day(host, '2026-11-01'));
  key(day(host, '2026-11-01'), 'ArrowLeft'); await settle();
  expect(document.activeElement).toBe(day(host, '2026-10-29'));
});

it('[CALENDAR-03][dates-2] click and Enter on a rejected day change and notify nothing', async () => {
  const changes = vi.fn();
  const host = mount(() => h(Calendar, { ...calendarText, defaultValue: '2026-10-29', isDateDisabled: weekend, 'onUpdate:modelValue': changes }));
  const friday = day(host, '2026-10-30');
  friday.click(); key(friday, 'Enter'); await settle();
  expect(changes).not.toHaveBeenCalled();
  expect(host.querySelector('[aria-selected="true"] button')).toBe(day(host, '2026-10-29'));
});

it('[CALENDAR-04][dates-6] an empty calendar puts the tab stop on today, else on the first available day of the month', () => {
  vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date(2026, 9, 14, 12));
  let host = mount(() => h(Calendar, { ...calendarText }));
  expect(host.querySelector('button.hw-calendar-day[tabindex="0"]')).toBe(day(host, '2026-10-14'));
  app!.unmount(); document.body.replaceChildren();
  host = mount(() => h(Calendar, { ...calendarText, isDateDisabled: (date: string) => date === '2026-10-14' || date === '2026-10-01' }));
  expect(host.querySelector('button.hw-calendar-day[tabindex="0"]')).toBe(day(host, '2026-10-02'));
});

it('[CALENDAR-05][R01] one status element after the grid holds unsupportedMessage only while the value cannot be shown', async () => {
  const value = ref('1900-01-01'); const system = ref<'gregory' | 'islamic-umalqura'>('islamic-umalqura');
  const host = mount(() => h(Calendar, { ...calendarText, locale: 'en-US', modelValue: value.value, calendar: system.value }));
  const status = () => host.querySelector('table.hw-calendar-grid + p.hw-sr-only[role=status]')!;
  expect(status().textContent).toBe(calendarText.unsupportedMessage);
  value.value = '2026-10-28'; await nextTick(); expect(status().textContent).toBe('');
  value.value = '1900-01-01'; system.value = 'gregory'; await nextTick(); expect(status().textContent).toBe('');
  expect(host.querySelectorAll('[role=status]')).toHaveLength(1);
});

it('[CALENDAR-06][R01] a standalone Calendar has no system switch; the DatePicker dialog has one, directly before the calendar', async () => {
  let host = mount(() => h(Calendar, { ...calendarText }));
  expect(host.querySelector('.hw-calendar-switch')).toBeNull();
  app!.unmount(); document.body.replaceChildren();
  const changes = vi.fn();
  host = mount(() => picker({ locale: 'en-US', 'onUpdate:calendar': changes }));
  const switches = host.querySelectorAll('dialog .hw-calendar-switch');
  expect(switches).toHaveLength(1);
  expect(switches[0]!.parentElement!.matches('.hw-calendar-options')).toBe(true);
  expect(switches[0]!.parentElement!.nextElementSibling!.matches('.hw-calendar')).toBe(true);
  const hijri = switches[0]!.querySelector<HTMLInputElement>('input[value="islamic-umalqura"]')!;
  hijri.checked = true; hijri.dispatchEvent(new Event('change', { bubbles: true })); await settle();
  expect(changes).toHaveBeenCalledWith('islamic-umalqura');
  expect(host.querySelector('.hw-calendar-info')).not.toBeNull();
});

it('[TEXT-01][R01] islamic-umalqura without unsupportedMessage: one warning and an empty status; [TEXT-02] gregory: no warning', () => {
  const { unsupportedMessage: _omit, ...text } = calendarText;
  let host = mount(() => h(Calendar, { ...text, calendar: 'islamic-umalqura', modelValue: '1900-01-01' }));
  expect(host.querySelector('p[role=status]')!.textContent).toBe('');
  expect(warnings().filter(message => message.includes('unsupportedMessage'))).toHaveLength(1);
  app!.unmount(); document.body.replaceChildren(); resetTextWarnings(); warn.mockClear();
  host = mount(() => h(Calendar, { ...text, calendar: 'gregory' }));
  expect(warnings()).toEqual([]);
});

it('[TEXT-02][dates-2] DatePicker: unavailableMessage is required only with isDateDisabled; without it the submission is still blocked', async () => {
  const { unavailableMessage: _omit, ...text } = datePickerText;
  let host = mount(() => h(DatePicker, { ...text, label: 'Date' }));
  expect(warnings()).toEqual([]);
  app!.unmount(); document.body.replaceChildren();
  host = mount(() => h(DatePicker, { ...text, label: 'Date', isDateDisabled: weekend }));
  const input = host.querySelector<HTMLInputElement>('input.hw-input')!;
  await type(input, '2026-10-30');
  expect(warnings().filter(message => message.includes('unavailableMessage'))).toHaveLength(1);
  expect(warnings()).toHaveLength(1);
  expect(host.querySelector('.hw-error')).toBeNull();
  expect(input.validity.customError).toBe(true);
});

it('[INV-08][dates-2][R02] typing a rejected ISO date marks the input invalid without a submission', async () => {
  const host = mount(() => picker({ locale: 'en-US', isDateDisabled: weekend }));
  const input = host.querySelector<HTMLInputElement>('input.hw-input')!;
  await type(input, '2026-10-30');
  expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(input.validity.customError).toBe(true);
  expect(input.validationMessage).toBe(datePickerText.unavailableMessage);
});

it('[MSG-01][MSG-02][dates-7] label, control, hint, error; aria-describedby lists application, formatted, hint and error ids', async () => {
  const host = mount(() => h('div', [h('p', { id: 'context' }, 'Context'), picker({ locale: 'en-US', hint: 'Day of the visit', defaultValue: '2026-10-28', 'aria-describedby': 'context', min: '2026-10-01' })]));
  const input = host.querySelector<HTMLInputElement>('input.hw-input')!;
  await type(input, '2025-01-01');
  const field = host.querySelector('.hw-field')!;
  expect([...field.children].map(child => child.className)).toEqual(['hw-label', 'hw-date-picker', 'hw-hint', 'hw-error']);
  expect(field.querySelector('p.hw-hint')!.id).toBe(`${input.id}-hint`);
  expect(field.querySelector('p.hw-error')!.id).toBe(`${input.id}-error`);
  expect(input.getAttribute('aria-describedby')).toBe(`context ${input.id}-formatted ${input.id}-hint ${input.id}-error`);
});

it('[MSG-03] the application error is one p.hw-error without a role', () => {
  const host = mount(() => picker({ locale: 'en-US', error: 'Choose a date' }));
  const errors = host.querySelectorAll('p.hw-error');
  expect(errors).toHaveLength(1); expect(errors[0]!.hasAttribute('role')).toBe(false);
});

it('[MSG-04][dates-4][dates-7] a malformed draft gives one alert with invalidMessage, the same validity and aria-invalid', async () => {
  const host = mount(() => picker({ locale: 'en-US' }));
  const input = host.querySelector<HTMLInputElement>('input.hw-input')!;
  await type(input, '2026-13-45');
  const errors = host.querySelectorAll('p.hw-error');
  expect(errors).toHaveLength(1); expect(errors[0]!.getAttribute('role')).toBe('alert');
  expect(errors[0]!.textContent).toBe(datePickerText.invalidMessage);
  expect(input.validationMessage).toBe(datePickerText.invalidMessage);
  expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(host.querySelector('[id$="-validation-error"]')).toBeNull();
});

it('[MSG-05] the application error wins over a violating draft', async () => {
  const host = mount(() => picker({ locale: 'en-US', error: 'Choose a date' }));
  await type(host.querySelector<HTMLInputElement>('input.hw-input')!, '2026-13-45');
  const errors = host.querySelectorAll('p.hw-error');
  expect(errors).toHaveLength(1); expect(errors[0]!.textContent).toBe('Choose a date'); expect(errors[0]!.hasAttribute('role')).toBe(false);
});

it('[MSG-06] a missing invalidMessage blocks submission without an element and warns once', async () => {
  const { invalidMessage: _omit, ...text } = datePickerText;
  const host = mount(() => h(DatePicker, { ...text, label: 'Date', locale: 'en-US' } as never));
  const input = host.querySelector<HTMLInputElement>('input.hw-input')!;
  await type(input, '2026-13-45');
  expect(input.validity.customError).toBe(true);
  expect(host.querySelector('.hw-error')).toBeNull();
  expect(warnings().filter(message => message.includes('invalidMessage'))).toHaveLength(1);
});

it('[MSG-07] the message disappears when the draft becomes valid and on a form reset', async () => {
  const host = mount(() => h('form', picker({ locale: 'en-US' })));
  const input = host.querySelector<HTMLInputElement>('input.hw-input')!;
  await type(input, '2026-13-45'); expect(host.querySelector('.hw-error')).not.toBeNull();
  await type(input, '2026-10-28'); expect(host.querySelector('.hw-error')).toBeNull();
  await type(input, '2026-13-45'); host.querySelector('form')!.reset(); await settle();
  expect(host.querySelector('.hw-error')).toBeNull(); expect(input.hasAttribute('aria-invalid')).toBe(false);
});

it('[DATE-PICKER-05] ISO dates inside a produced message are isolated in bdi[dir=ltr]', async () => {
  const host = mount(() => picker({ locale: 'en-US', invalidMessage: 'Choose between 2026-10-01 and 2026-10-31.', min: '2026-10-01', max: '2026-10-31' }));
  await type(host.querySelector<HTMLInputElement>('input.hw-input')!, '2026-11-05');
  expect([...host.querySelectorAll('p.hw-error bdi[dir="ltr"]')].map(node => node.textContent)).toEqual(['2026-10-01', '2026-10-31']);
});

it('[INV-01] a required, empty, untouched picker has no aria-invalid', () => {
  const host = mount(() => picker({ locale: 'en-US', required: true }));
  expect(host.querySelector('input.hw-input')!.hasAttribute('aria-invalid')).toBe(false);
});

it('[INV-03][INV-04][INV-05] a failed submission marks the input until a valid date or a reset', async () => {
  const host = mount(() => h('form', picker({ locale: 'en-US', required: true })));
  const form = host.querySelector('form')!; const input = host.querySelector<HTMLInputElement>('input.hw-input')!;
  expect(form.checkValidity()).toBe(false); await nextTick();
  expect(input.getAttribute('aria-invalid')).toBe('true');
  await type(input, '2026-10-28'); expect(input.hasAttribute('aria-invalid')).toBe(false);
  await type(input, ''); form.checkValidity(); await nextTick(); expect(input.getAttribute('aria-invalid')).toBe('true');
  form.reset(); await settle(); expect(input.hasAttribute('aria-invalid')).toBe(false);
});

it('[REQ-01][REQ-02][dates-7] the label carries one required marker only when required', async () => {
  const required = ref(true);
  const host = mount(() => picker({ locale: 'en-US', required: required.value }));
  const markers = host.querySelectorAll('label.hw-label > span.hw-required-marker');
  expect(markers).toHaveLength(1); expect(markers[0]!.textContent).toBe(' *'); expect(host.querySelector('label.hw-label')!.lastElementChild).toBe(markers[0]);
  required.value = false; await nextTick();
  expect(host.querySelector('.hw-required-marker')).toBeNull();
});

it('[SSR-01][dates-7][R01] server HTML has no produced error, holds the empty calendar status and hydrates without a mismatch', async () => {
  const render = () => h('div', [picker({ locale: 'en-US', defaultValue: '2026-10-28' }), h(Calendar, { ...calendarText, defaultValue: '2026-10-28' })]);
  const html = await renderToString(createSSRApp(defineComponent(() => render)));
  expect(html).not.toContain('hw-error');
  expect(html).toContain('<p role="status" class="hw-sr-only"></p>');
  const host = document.createElement('div'); host.innerHTML = html; document.body.append(host);
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  app = createSSRApp(defineComponent(() => render)); app.mount(host); await nextTick();
  // data-hw-filled is the value-presence attribute added after mount.
  const server = document.createElement('div'); server.innerHTML = html;
  expect(host.innerHTML.replaceAll(' data-hw-filled="true"', '')).toBe(server.innerHTML);
  expect([...warn.mock.calls, ...errors.mock.calls].map(call => String(call[0])).filter(message => /hydration/i.test(message))).toEqual([]);
  errors.mockRestore();
});

it('[RESET-01][RESET-02][dates-5] reset returns the picker to its default value and notifies once', async () => {
  const changes = vi.fn();
  const host = mount(() => h('form', picker({ locale: 'en-US', defaultValue: '2026-10-28', 'onUpdate:modelValue': changes })));
  const form = host.querySelector('form')!; const input = host.querySelector<HTMLInputElement>('input.hw-input')!;
  await type(input, '2026-11-05'); changes.mockClear();
  form.reset(); await settle();
  expect(input.value).toBe(formatCalendarDate('2026-10-28', { locale: 'en-US', calendar: 'gregory', dateStyle: 'medium' }));
  expect(new FormData(form).get('date')).toBe('2026-10-28');
  expect(host.querySelector('output.hw-date-picker-value')!.textContent).toBe(formatCalendarDate('2026-10-28', { locale: 'en-US', calendar: 'gregory', dateStyle: 'full' }));
  expect(changes.mock.calls).toEqual([['2026-10-28']]);
});

it('[RESET-01][RESET-02][RESET-03][dates-5] Calendar: reset selects the default value and notifies once, or not at all when unchanged', async () => {
  const changes = vi.fn();
  const host = mount(() => h('form', h(Calendar, { ...calendarText, name: 'day', defaultValue: '2026-10-28', 'onUpdate:modelValue': changes })));
  const form = host.querySelector('form')!;
  form.reset(); await settle(); expect(changes).not.toHaveBeenCalled();
  day(host, '2026-10-05').click(); await nextTick(); changes.mockClear();
  form.reset(); await settle();
  expect(changes.mock.calls).toEqual([['2026-10-28']]);
  expect(new FormData(form).get('day')).toBe('2026-10-28');
  expect(host.querySelector('button.hw-calendar-day[tabindex="0"]')).toBe(day(host, '2026-10-28'));
});

it('[RESET-03] no notification when the picker already holds its reset target', async () => {
  const changes = vi.fn();
  const host = mount(() => h('form', picker({ locale: 'en-US', defaultValue: '2026-10-28', 'onUpdate:modelValue': changes })));
  host.querySelector('form')!.reset(); await settle();
  expect(changes).not.toHaveBeenCalled();
});

it('[RESET-04][RESET-05] controlled: an applied notification and an ignored one both leave shown value and FormData equal to the application value', async () => {
  const value = ref('2026-11-05'); const apply = ref(true);
  const host = mount(() => h('form', picker({ locale: 'en-US', defaultValue: '2026-10-28', modelValue: value.value, 'onUpdate:modelValue': (next: string) => { if (apply.value) value.value = next; } })));
  const form = host.querySelector('form')!; const input = host.querySelector<HTMLInputElement>('input.hw-input')!;
  const shown = (date: string) => formatCalendarDate(date, { locale: 'en-US', calendar: 'gregory', dateStyle: 'medium' });
  form.reset(); await settle();
  expect(value.value).toBe('2026-10-28'); expect(input.value).toBe(shown('2026-10-28')); expect(new FormData(form).get('date')).toBe('2026-10-28');
  value.value = '2026-11-05'; apply.value = false; await nextTick();
  form.reset(); await settle();
  expect(input.value).toBe(shown('2026-11-05')); expect(new FormData(form).get('date')).toBe('2026-11-05');
});

it('[RESET-06] a default-prevented reset changes nothing', async () => {
  const changes = vi.fn();
  const host = mount(() => h('form', { onReset: (event: Event) => event.preventDefault() }, picker({ locale: 'en-US', defaultValue: '2026-10-28', 'onUpdate:modelValue': changes })));
  const input = host.querySelector<HTMLInputElement>('input.hw-input')!;
  await type(input, '2026-11-05'); changes.mockClear();
  host.querySelector('form')!.reset(); await settle();
  expect(changes).not.toHaveBeenCalled(); expect(new FormData(host.querySelector('form')!).get('date')).toBe('2026-11-05');
});

it('[RESET-07] read-only and disabled pickers reset like an editable one', async () => {
  const value = ref('2026-11-05');
  for (const state of [{ readonly: true }, { disabled: true }]) {
    value.value = '2026-11-05';
    const host = mount(() => h('form', picker({ locale: 'en-US', defaultValue: '2026-10-28', modelValue: value.value, 'onUpdate:modelValue': (next: string) => { value.value = next; }, ...state })));
    host.querySelector('form')!.reset(); await settle();
    expect(value.value).toBe('2026-10-28');
    app!.unmount(); app = undefined; document.body.replaceChildren();
  }
});

it('[RESET-09] reset with the dialog open and a malformed draft closes the dialog and clears draft, message and month', async () => {
  const host = mount(() => h('form', picker({ locale: 'en-US', defaultValue: '2026-10-28' })));
  const input = host.querySelector<HTMLInputElement>('input.hw-input')!; const trigger = host.querySelector<HTMLButtonElement>('.hw-date-picker-trigger')!;
  trigger.click(); await settle();
  key(host.querySelector('button.hw-calendar-day[tabindex="0"]')!, 'PageDown'); await settle();
  await type(input, '2026-13-45');
  host.querySelector('form')!.reset(); await settle();
  expect(host.querySelector('dialog')!.open).toBe(false); expect(trigger.getAttribute('aria-expanded')).toBe('false');
  expect(host.querySelector('.hw-error')).toBeNull(); expect(input.hasAttribute('aria-invalid')).toBe(false);
  expect(input.value).toBe(formatCalendarDate('2026-10-28', { locale: 'en-US', calendar: 'gregory', dateStyle: 'medium' }));
  trigger.click(); await settle();
  expect(document.activeElement).toBe(day(host, '2026-10-28'));
});

it('[DATE-PICKER-09][dates-5] the calendar nested in the picker does not notify or change the picker on reset', async () => {
  const changes = vi.fn();
  const host = mount(() => h('form', picker({ locale: 'en-US', 'onUpdate:modelValue': changes })));
  expect(host.querySelector<HTMLInputElement>('.hw-calendar input[type=hidden]')!.getAttribute('form')).toBe('');
  await type(host.querySelector<HTMLInputElement>('input.hw-input')!, '2026-10-28'); changes.mockClear();
  host.querySelector('form')!.reset(); await settle();
  expect(changes.mock.calls).toEqual([['']]);
});

it('[DATE-PICKER-02][dates-6] opening moves focus to the selected day inside the dialog (ArrowDown and trigger)', async () => {
  const host = mount(() => picker({ locale: 'en-US', defaultValue: '2026-10-28' }));
  const input = host.querySelector<HTMLInputElement>('input.hw-input')!;
  input.focus(); key(input, 'ArrowDown'); await settle();
  expect(document.activeElement).toBe(day(host.querySelector('dialog')!, '2026-10-28'));
  host.querySelector('dialog')!.dispatchEvent(new Event('cancel', { cancelable: true })); await settle();
  host.querySelector<HTMLButtonElement>('.hw-date-picker-trigger')!.click(); await settle();
  expect(document.activeElement).toBe(day(host.querySelector('dialog')!, '2026-10-28'));
});

it('[DATE-PICKER-03][dates-6] an empty picker focuses today', async () => {
  vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date(2026, 9, 14, 12));
  const host = mount(() => picker({ locale: 'en-US' }));
  host.querySelector<HTMLButtonElement>('.hw-date-picker-trigger')!.click(); await settle();
  expect(document.activeElement).toBe(day(host, '2026-10-14'));
});

it('[DATE-PICKER-04] Escape returns focus to the element that opened the dialog', async () => {
  const host = mount(() => picker({ locale: 'en-US', defaultValue: '2026-10-28' }));
  const trigger = host.querySelector<HTMLButtonElement>('.hw-date-picker-trigger')!;
  trigger.focus(); trigger.click(); await settle();
  expect(document.activeElement).not.toBe(trigger);
  host.querySelector('dialog')!.dispatchEvent(new Event('cancel', { cancelable: true })); await settle();
  expect(document.activeElement).toBe(trigger);
});

it('[DATE-PICKER-06][R01] an unsupported value gives exactly one status element, inside the dialog', () => {
  const host = mount(() => picker({ locale: 'en-US', calendar: 'islamic-umalqura', defaultValue: '1900-01-01' }));
  const statuses = host.querySelectorAll('[role=status]');
  expect(statuses).toHaveLength(1);
  expect(statuses[0]!.closest('dialog')).not.toBeNull();
  expect(statuses[0]!.textContent).toBe(datePickerText.unsupportedMessage);
});

it('[DATE-PICKER-07][R03] the output announces the full date, and is empty and hidden without a value or for a value the calendar cannot show', async () => {
  const value = ref('2026-10-28'); const system = ref<'gregory' | 'islamic-umalqura'>('gregory');
  const host = mount(() => picker({ locale: 'en-GB', modelValue: value.value, calendar: system.value }));
  const output = host.querySelector<HTMLOutputElement>('output.hw-sr-only.hw-date-picker-value[aria-live=polite][aria-atomic=true]')!;
  expect(output.textContent).toBe(formatCalendarDate('2026-10-28', { locale: 'en-GB', calendar: 'gregory', dateStyle: 'full' }));
  expect(output.textContent).toContain('Wednesday'); expect(output.hidden).toBe(false);
  value.value = ''; await nextTick(); expect(output.textContent).toBe(''); expect(output.hidden).toBe(true);
  value.value = '1900-01-01'; system.value = 'islamic-umalqura'; await nextTick(); expect(output.textContent).toBe(''); expect(output.hidden).toBe(true);
});

it('[DATE-PICKER-08][R25] getDayLabel names every day button of the picker calendar', () => {
  const host = mount(() => picker({ locale: 'en-US', defaultValue: '2026-10-28', getDayLabel: (date: string) => `Day ${date}` }));
  const buttons = [...host.querySelectorAll<HTMLButtonElement>('dialog button.hw-calendar-day')];
  expect(buttons).toHaveLength(42);
  expect(buttons.every(button => /^Day \d{4}-\d{2}-\d{2}$/.test(button.getAttribute('aria-label')!))).toBe(true);
});
