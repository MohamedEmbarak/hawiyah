import { afterEach, expect, it, vi } from 'vitest';
import { enhance } from '../packages/vanilla/src/index';
import { bindInputTemporal, inputTemporalMarkup, projectInputTemporal } from '../apps/playground/src/input-temporal';
import { inputPage } from '../apps/playground/src/layout-studio';

const disposers: (() => void)[] = [];
afterEach(() => { disposers.splice(0).reverse().forEach(dispose => dispose()); document.body.replaceChildren(); });

it.each([
  ['2015-12-31', '2015-W53'], ['2016-01-01', '2015-W53'], ['2016-01-04', '2016-W01'],
  ['2018-12-31', '2019-W01'], ['2020-12-31', '2020-W53'], ['2021-01-03', '2020-W53'],
  ['2026-10-28', '2026-W44'], ['2027-01-01', '2026-W53'], ['2024-03-10', '2024-W10'],
])('projects %s to ISO week %s without local timezone arithmetic', (date, week) => {
  expect(projectInputTemporal('week', date)).toBe(week);
});

it('validates Gregorian days and preserves month/year and local time without offset conversion', () => {
  expect(projectInputTemporal('month', '2027-01-01')).toBe('2027-01');
  expect(projectInputTemporal('month', '2000-02-29')).toBe('2000-02');
  expect(projectInputTemporal('month', '0096-02-29')).toBe('0096-02');
  for (const date of ['', '2026-02-29', '1900-02-29', '2026-13-01', '2026-04-31', '0000-01-01', '2026-1-1']) {
    expect(projectInputTemporal('month', date)).toBe(''); expect(projectInputTemporal('week', date)).toBe('');
  }
  expect(projectInputTemporal('datetime-local', '2026-10-28', '09:30')).toBe('2026-10-28T09:30');
  expect(projectInputTemporal('datetime-local', '2026-10-28', '23:59:30.125')).toBe('2026-10-28T23:59:30.125');
  for (const time of ['', '24:00', '12:60', '09:30Z', '09:30+03:00']) expect(projectInputTemporal('datetime-local', '2026-10-28', time)).toBe('');
});

it('renders custom date compositions for all date-related inputs and submits each ISO value once', async () => {
  document.body.innerHTML = inputPage('ar');
  expect(document.querySelectorAll('input[type=date], input[type=month], input[type=week], input[type=datetime-local]')).toHaveLength(0);
  expect(document.querySelectorAll('[data-nq="date-picker"]')).toHaveLength(4);
  for (const dialog of document.querySelectorAll('dialog')) { dialog.showModal = vi.fn(() => { dialog.open = true; }); dialog.close = vi.fn(() => { dialog.open = false; }); }
  disposers.push(enhance(document.body)); disposers.push(bindInputTemporal(document.body));
  const form = document.querySelector<HTMLFormElement>('#native-input-lab')!;
  const values = () => new FormData(form);
  expect(values().getAll('date')).toEqual(['2026-10-28']); expect(values().getAll('month')).toEqual(['2026-10']); expect(values().getAll('week')).toEqual(['2026-W44']); expect(values().getAll('datetime-local')).toEqual(['2026-10-28T09:30']);
  expect(values().getAll('appointment')).toEqual([]);
  const inputFor = (kind: string) => document.querySelector<HTMLInputElement>(`[data-input-temporal="${kind}"] [data-nq-date-input]`)!;
  const type = (input: HTMLInputElement, value: string) => { input.focus(); input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); };
  type(inputFor('month'), '2027-01-01'); type(inputFor('week'), '2027-01-01'); type(inputFor('datetime-local'), '2027-01-01');
  const time = document.querySelector<HTMLInputElement>('[data-temporal-time]')!; time.value = '17:45'; time.dispatchEvent(new Event('input', { bubbles: true }));
  expect(values().getAll('month')).toEqual(['2027-01']); expect(values().getAll('week')).toEqual(['2026-W53']); expect(values().getAll('datetime-local')).toEqual(['2027-01-01T17:45']);
  type(inputFor('week'), 'invalid'); expect(inputFor('week').checkValidity()).toBe(false); expect(values().getAll('week')).toEqual(['2026-W53']);
  type(inputFor('week'), ''); expect(values().getAll('week')).toEqual(['']); expect(document.querySelector('[data-input-temporal="week"] [data-temporal-output]')?.textContent).toBe('—');
  time.value = ''; time.dispatchEvent(new Event('input', { bubbles: true })); expect(time.checkValidity()).toBe(false); expect(values().getAll('datetime-local')).toEqual(['']);
  form.reset(); await Promise.resolve(); expect(values().getAll('month')).toEqual(['2026-10']); expect(values().getAll('week')).toEqual(['2026-W44']); expect(values().getAll('datetime-local')).toEqual(['2026-10-28T09:30']); expect(time.checkValidity()).toBe(true);
});

it('ignores calendar-only events and cancelled reset, and stops synchronizing after cleanup', async () => {
  document.body.innerHTML = `<form>${inputTemporalMarkup('month', 'en')}</form>`;
  const form = document.querySelector('form')!; const picker = form.querySelector<HTMLElement>('[data-nq="date-picker"]')!;
  const cleanup = bindInputTemporal(form); disposers.push(cleanup);
  picker.dispatchEvent(new CustomEvent('nq:change', { bubbles: true, detail: { value: '2027-02-01' } }));
  picker.dispatchEvent(new CustomEvent('nq:change', { bubbles: true, detail: { calendar: 'islamic-umalqura' } }));
  expect(new FormData(form).getAll('month')).toEqual(['2027-02']);
  form.addEventListener('reset', event => event.preventDefault()); form.reset(); await Promise.resolve(); expect(new FormData(form).getAll('month')).toEqual(['2027-02']);
  cleanup(); picker.dispatchEvent(new CustomEvent('nq:change', { bubbles: true, detail: { value: '2027-03-01' } })); expect(new FormData(form).getAll('month')).toEqual(['2027-02']);
});
