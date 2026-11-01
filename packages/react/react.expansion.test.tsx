import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, useState } from 'react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { formatCalendarDate, moveCalendarDate, UMALQURA_MIN_DATE, UMALQURA_MAX_DATE } from '@nasaq/core';
import { Button, Calendar, CookieConsent, DataTable, DatePicker, Feedback, Menu, MultiSelect, PinInput, Popover, RangeSlider, SearchField, TagInput, ToastRegion, ToggleGroup, TreeView } from './src/index.js';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let container: HTMLDivElement; let root: Root;
async function render(node: ReactNode) { await act(async () => root.render(node)); }
async function click(node: HTMLElement) { await act(async () => node.click()); }
async function key(node: Element, key: string, shiftKey = false) { await act(async () => node.dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true }))); }
async function input(node: HTMLInputElement, value: string) { await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(node, value); node.dispatchEvent(new Event('input', { bubbles: true })); }); }
beforeEach(() => { container = document.createElement('div'); document.body.append(container); root = createRoot(container); });
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.restoreAllMocks(); });

it('normalizes Arabic PIN digits in one native input and honors canceled and native resets', async () => {
  await render(<form onReset={event => event.preventDefault()}><PinInput label="Verification code" name="code" defaultValue="123456" required showSlots /></form>);
  const control = container.querySelector('input')!;
  expect(container.querySelectorAll('input')).toHaveLength(1);
  await input(control, '١٢۳۴٥۶');
  expect(control.value).toBe('123456');
  await input(control, '٩٨٧٦٥٤');
  expect(new FormData(container.querySelector('form')!).get('code')).toBe('987654');
  await act(async () => container.querySelector('form')!.reset());
  expect(control.value).toBe('987654');
  await render(<form><PinInput label="Verification code" name="code" defaultValue="123456" required showSlots /></form>);
  await act(async () => container.querySelector('form')!.reset());
  expect(control.value).toBe('123456');
});
it('keeps tag and multiple-option form values explicit across filtering and reset', async () => {
  await render(<form><TagInput name="tags" label="Tags" defaultValue={['initial']} /><MultiSelect name="cities" label="Cities" defaultValue={['riyadh']} options={[{ value: 'riyadh', label: 'الرياض' }, { value: 'abha', label: 'أبها' }]} /></form>);
  const tag = container.querySelector<HTMLInputElement>('.nq-tag-input input[type=text]')!;
  await input(tag, 'new'); await key(tag, 'Enter');
  const search = container.querySelector<HTMLInputElement>('input[type=search]')!;
  await input(search, 'ابها'); await click(container.querySelector<HTMLInputElement>('input[type=checkbox]')!);
  const form = container.querySelector('form')!;
  expect(new FormData(form).getAll('tags')).toEqual(['initial', 'new']);
  expect(new FormData(form).getAll('cities')).toEqual(['riyadh', 'abha']);
  await act(async () => form.reset());
  expect(new FormData(form).getAll('tags')).toEqual(['initial']);
  expect(new FormData(form).getAll('cities')).toEqual(['riyadh']);
  expect(search.value).toBe('');
});
it('keeps range handles ordered and resets custom controls with an external form', async () => {
  await render(<><form id="outside" /><RangeSlider form="outside" lowerName="from" upperName="to" label="Range" lowerLabel="From" upperLabel="To" defaultValue={[20, 70]} /><SearchField form="outside" name="query" label="Search" defaultValue="start" /><ToggleGroup form="outside" name="modes" label="Modes" multiple defaultValue={['a']} options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]} /></>);
  const ranges = [...container.querySelectorAll<HTMLInputElement>('input[type=range]')];
  await input(ranges[0]!, '90');
  expect(Number(ranges[0]!.value)).toBeLessThanOrEqual(Number(ranges[1]!.value));
  await input(container.querySelector<HTMLInputElement>('input[type=search]')!, 'changed');
  await click([...container.querySelectorAll('button')].find(button => button.textContent === 'B')!);
  expect(new FormData(container.querySelector('form')!).getAll('modes')).toEqual(['a', 'b']);
  await act(async () => container.querySelector('form')!.reset());
  const form = new FormData(container.querySelector('form')!);
  expect(form.get('from')).toBe('20'); expect(form.get('to')).toBe('70'); expect(form.get('query')).toBe('start'); expect(form.getAll('modes')).toEqual(['a']);
});
it('navigates calendar dates in RTL, skips disabled days, and uses Hijri month arithmetic', async () => {
  await render(<Calendar dir="rtl" locale="en-SA" calendar="islamic-umalqura" defaultValue="2026-10-28" min="2026-01-01" max="2027-12-31" isDateDisabled={date => date === '2026-10-29'} />);
  const selected = container.querySelector<HTMLButtonElement>('[data-date="2026-10-28"]')!;
  await act(async () => selected.focus()); await key(selected, 'ArrowLeft');
  expect((document.activeElement as HTMLElement).dataset.date).toBe('2026-10-30');
  await key(document.activeElement!, 'PageDown');
  expect((document.activeElement as HTMLElement).dataset.date).toBe(moveCalendarDate('2026-10-30', 1, 'month', 'islamic-umalqura'));
  expect(container.querySelectorAll('.nq-calendar-day[tabindex="0"]')).toHaveLength(1);
  await key(document.activeElement!, 'Home');
  expect(document.activeElement?.closest('td')?.cellIndex).toBe(0);
});
it('recenters externally updated calendar selection while respecting an explicit month', async () => {
  await render(<Calendar value="2026-01-15" locale="en-SA" />);
  await render(<Calendar value="2026-06-15" locale="en-SA" />);
  expect(container.querySelector('.nq-calendar-header h3')?.textContent).toContain('June');
  expect(container.querySelector('[data-date="2026-06-15"]')?.closest('td')?.getAttribute('aria-selected')).toBe('true');
  expect(container.querySelector('.nq-calendar-day[tabindex="0"]')?.getAttribute('data-date')).toBe('2026-06-15');
  await render(<Calendar value="2026-08-15" month="2026-03-01" locale="en-SA" />);
  expect(container.querySelector('.nq-calendar-header h3')?.textContent).toContain('March');
});
it('stops Hijri month and keyboard navigation at the authoritative table boundaries', async () => {
  await render(<Calendar value={UMALQURA_MIN_DATE} month={UMALQURA_MIN_DATE} calendar="islamic-umalqura" locale="en-SA" />);
  const first = container.querySelector<HTMLButtonElement>(`[data-date="${UMALQURA_MIN_DATE}"]`)!;
  expect(container.querySelector<HTMLButtonElement>('[aria-label="Previous month"]')!.disabled).toBe(true);
  expect(first.getAttribute('aria-label')).toContain('1343');
  await act(async () => first.focus()); await key(first, 'PageUp'); expect(document.activeElement).toBe(first);
  await render(<Calendar value={UMALQURA_MAX_DATE} month={UMALQURA_MAX_DATE} calendar="islamic-umalqura" locale="en-SA" />);
  const last = container.querySelector<HTMLButtonElement>(`[data-date="${UMALQURA_MAX_DATE}"]`)!;
  expect(container.querySelector<HTMLButtonElement>('[aria-label="Next month"]')!.disabled).toBe(true);
  expect(last.getAttribute('aria-label')).toContain('1500');
  await act(async () => last.focus()); await key(last, 'PageDown'); expect(document.activeElement).toBe(last);
});
it('switches picker calendar systems without changing the ISO date and reopens at the selected month', async () => {
  if (!HTMLDialogElement.prototype.showModal) Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, writable: true, value() {} });
  if (!HTMLDialogElement.prototype.close) Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, writable: true, value() {} });
  vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(function (this: HTMLDialogElement) { this.open = true; });
  vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(function (this: HTMLDialogElement) { this.open = false; this.dispatchEvent(new Event('close')); });
  const changed = vi.fn();
  await render(<form><DatePicker label="Appointment" name="date" defaultValue="2026-10-28" locale="en-SA" onValueChange={changed} /></form>);
  const opener = container.querySelector<HTMLButtonElement>('[aria-label="Open calendar"]')!; await click(opener);
  const dateInput = container.querySelector<HTMLInputElement>('input[type=date]')!; const calendar = container.querySelector('.nq-calendar')!;
  const before = container.querySelector('.nq-calendar-header h3')!.textContent;
  const select = container.querySelector('select')!;
  await act(async () => { select.value = 'islamic-umalqura'; select.dispatchEvent(new Event('change', { bubbles: true })); });
  expect(calendar.getAttribute('data-calendar')).toBe('islamic-umalqura'); expect(container.querySelector('.nq-calendar-header h3')!.textContent).not.toBe(before);
  expect(dateInput.value).toBe('2026-10-28'); expect(changed).not.toHaveBeenCalled();
  await click(container.querySelector<HTMLButtonElement>('[aria-label="Next month"]')!);
  await click(container.querySelector<HTMLButtonElement>('[aria-label="Close"]')!); await click(opener);
  expect(container.querySelector('[data-date="2026-10-28"]')?.closest('td')?.getAttribute('aria-selected')).toBe('true');
  await act(async () => { select.value = 'gregory'; select.dispatchEvent(new Event('change', { bubbles: true })); });
  expect(new FormData(container.querySelector('form')!).get('date')).toBe('2026-10-28');
  expect(container.querySelector('.nq-calendar-header h3')!.textContent).toBe(before);
});
it('preserves an unsupported ISO date while explicitly limiting its Hijri display', async () => {
  await render(<form><DatePicker label="Historical date" name="date" defaultValue="1900-01-01" defaultCalendar="islamic-umalqura" locale="en-SA" /></form>);
  const date = container.querySelector<HTMLInputElement>('input[type=date]')!;
  expect(date.value).toBe('1900-01-01');
  expect(date.checkValidity()).toBe(false);
  expect(date.getAttribute('aria-invalid')).toBe('true');
  expect(date.validationMessage).toContain(UMALQURA_MIN_DATE);
  expect(container.querySelector('[role=status]')?.textContent).toContain(UMALQURA_MIN_DATE);
  expect([...container.querySelectorAll('[role=status] bdi[dir=ltr]')].map(node => node.textContent)).toEqual([UMALQURA_MIN_DATE, UMALQURA_MAX_DATE]);
  expect(container.querySelectorAll('[role=gridcell][aria-selected=true]')).toHaveLength(0);
  expect(container.querySelector<HTMLButtonElement>('[aria-label="Previous month"]')!.disabled).toBe(true);
  const select = container.querySelector('select')!;
  await act(async () => { select.value = 'gregory'; select.dispatchEvent(new Event('change', { bubbles: true })); });
  expect(container.querySelector('[data-date="1900-01-01"]')?.closest('td')?.getAttribute('aria-selected')).toBe('true');
  expect(new FormData(container.querySelector('form')!).get('date')).toBe('1900-01-01');
  expect(container.querySelector('[role=status]')).toBeNull();
  expect(date.checkValidity()).toBe(true);
  expect(date.getAttribute('aria-invalid')).not.toBe('true');
});
it('rejects unsupported Hijri form submission and keeps application bounds after calendar changes', async () => {
  const submitted = vi.fn();
  await render(<form onSubmit={event => { event.preventDefault(); submitted(); }}><DatePicker label="Historical date" name="date" defaultValue="1900-01-01" defaultCalendar="islamic-umalqura" min="1890-01-01" max="1910-12-31" unsupportedCalendarMessage="خارج نطاق أم القرى" /><Button type="submit">Submit</Button></form>);
  const date = container.querySelector<HTMLInputElement>('input[type=date]')!;
  const button = [...container.querySelectorAll('button')].find(item => item.textContent === 'Submit')!;
  await click(button); expect(submitted).not.toHaveBeenCalled(); expect(date.validationMessage).toBe('خارج نطاق أم القرى');
  const calendar = container.querySelector('select')!;
  await act(async () => { calendar.value = 'gregory'; calendar.dispatchEvent(new Event('change', { bubbles: true })); });
  expect(date.value).toBe('1900-01-01'); expect(date.checkValidity()).toBe(true);
  await click(button); expect(submitted).toHaveBeenCalledOnce();
  await input(date, '1880-01-01'); expect(date.checkValidity()).toBe(false); expect(date.validity.rangeUnderflow).toBe(true);
  await click(button); expect(submitted).toHaveBeenCalledOnce();
  await input(date, '1920-01-01'); expect(date.checkValidity()).toBe(false); expect(date.validity.rangeOverflow).toBe(true);
});
it('shows and associates the selected calendar date outside the closed picker dialog', async () => {
  const supported = '2029-08-11';
  await render(<DatePicker id="visible-date" label="Date" hint="Original day" value={supported} calendar="islamic-umalqura" locale="en-SA" />);
  const date = container.querySelector<HTMLInputElement>('input[type=date]')!;
  const output = container.querySelector<HTMLOutputElement>('.nq-date-picker-value')!;
  expect(container.querySelector('dialog')!.open).toBe(false);
  expect(output.hidden).toBe(false);
  expect(output.textContent).toBe(formatCalendarDate(supported, { calendar: 'islamic-umalqura', locale: 'en-SA', dateStyle: 'full' }));
  expect(output.htmlFor.value).toBe(date.id);
  expect(output.getAttribute('aria-live')).toBe('polite');
  expect(date.getAttribute('aria-describedby')!.split(' ')).toEqual(expect.arrayContaining([output.id, 'visible-date-hint']));
  await render(<DatePicker id="visible-date" label="Date" value={supported} calendar="gregory" locale="en-SA" />);
  expect(date.value).toBe(supported);
  expect(output.textContent).toBe(formatCalendarDate(supported, { calendar: 'gregory', locale: 'en-SA', dateStyle: 'full' }));
  await render(<DatePicker id="visible-date" label="Date" value="" calendar="islamic-umalqura" />);
  expect(output.hidden).toBe(true); expect(output.textContent).toBe('');
  await render(<DatePicker id="visible-date" label="Date" value="1900-01-01" calendar="islamic-umalqura" />);
  expect(output.hidden).toBe(true); expect(output.textContent).toBe(''); expect(date.checkValidity()).toBe(false);
});
it('supports menu roving focus, disabled skipping, actions and focus return', async () => {
  const action = vi.fn(); await render(<Menu label="Actions" trigger={<Button>Actions</Button>} onAction={action} items={[{ value: 'first', label: 'First' }, { value: 'disabled', label: 'Disabled', disabled: true }, { value: 'last', label: 'Last' }]} />);
  const trigger = container.querySelector('button')!; await key(trigger, 'ArrowDown');
  expect(document.activeElement?.textContent).toBe('First'); await key(document.activeElement!, 'ArrowDown'); expect(document.activeElement?.textContent).toBe('Last'); await click(document.activeElement as HTMLButtonElement);
  expect(action).toHaveBeenCalledWith('last'); expect(document.activeElement).toBe(trigger); expect(trigger.getAttribute('aria-expanded')).toBe('false');
});
it('closes popovers outside and with Escape without trapping ordinary Tab order', async () => {
  await render(<><Popover title="Help" trigger={<Button>Open</Button>}><Button>Inside</Button></Popover><Button>Outside</Button></>);
  const buttons = [...container.querySelectorAll('button')]; await click(buttons[0]!); expect(container.querySelector<HTMLElement>('[role=region]')!.hidden).toBe(false);
  await key(buttons[1]!, 'Escape'); expect(container.querySelector<HTMLElement>('[role=region]')!.hidden).toBe(true); expect(document.activeElement).toBe(buttons[0]);
  await click(buttons[0]!); await act(async () => buttons[2]!.dispatchEvent(new Event('pointerdown', { bubbles: true }))); expect(container.querySelector<HTMLElement>('[role=region]')!.hidden).toBe(true);
});
it('expands a flattened RTL tree and selects with keyboard', async () => {
  const changed = vi.fn(); await render(<TreeView dir="rtl" label="Services" onValueChange={changed} items={[{ id: 'parent', label: 'Parent', children: [{ id: 'disabled', label: 'Unavailable', disabled: true }, { id: 'child', label: 'Child' }] }, { id: 'last', label: 'Last' }]} />);
  const parent = container.querySelector<HTMLElement>('[role=treeitem]')!; await act(async () => parent.focus()); await key(parent, 'ArrowLeft'); expect(parent.getAttribute('aria-expanded')).toBe('true'); await key(parent, 'ArrowLeft'); expect(document.activeElement?.getAttribute('aria-level')).toBe('2'); await key(document.activeElement!, 'Enter'); expect(changed).toHaveBeenCalledWith('child'); await key(document.activeElement!, 'ArrowRight'); expect(document.activeElement).toBe(parent);
});
it('sorts a native data table stably and exposes direction on headers', async () => {
  await render(<DataTable caption="Requests" locale="en" rows={[{ id: 'b', name: 'Same', score: 20 }, { id: 'a', name: 'Same', score: 10 }, { id: 'c', name: 'Other', score: 30 }]} columns={[{ key: 'id', label: 'ID' }, { key: 'name', label: 'Name', sortable: true }, { key: 'score', label: 'Score', sortable: true }]} />);
  const name = [...container.querySelectorAll('button')].find(button => button.textContent?.includes('Name'))!; await click(name);
  expect(name.closest('th')?.getAttribute('aria-sort')).toBe('ascending'); expect([...container.querySelectorAll('tbody tr')].map(row => row.firstElementChild?.textContent)).toEqual(['c', 'b', 'a']);
  await click(name); expect(name.closest('th')?.getAttribute('aria-sort')).toBe('descending'); expect([...container.querySelectorAll('tbody tr')].map(row => row.firstElementChild?.textContent)).toEqual(['b', 'a', 'c']);
});
it('keeps toasts caller owned, with only urgent messages in the assertive region', async () => {
  const dismiss = vi.fn(); await render(<ToastRegion messages={[{ id: 'saved', description: 'Saved', tone: 'success' }, { id: 'urgent', description: 'Connection lost', urgent: true }]} onDismiss={dismiss} />);
  expect(container.querySelector('[role=status]')?.textContent).toContain('Saved'); expect(container.querySelector('[role=alert]')?.textContent).toContain('Connection lost'); await click(container.querySelector('button')!); expect(dismiss).toHaveBeenCalledWith('saved'); expect(container.querySelectorAll('.nq-toast')).toHaveLength(2);
});
it('reports configurable consent and feedback without implied persistence or network requests', async () => {
  const consent = vi.fn(); const feedback = vi.fn(); await render(<><CookieConsent title="Optional cookies" description="Choose a preference" onValueChange={consent} /><Feedback label="Was this helpful?" onFeedback={feedback} /></>);
  await click([...container.querySelectorAll('button')].find(button => button.textContent === 'Reject optional cookies')!); expect(consent).toHaveBeenCalledWith('rejected'); expect(container.querySelector<HTMLElement>('.nq-cookie-consent')!.hidden).toBe(true);
  await click(container.querySelector<HTMLInputElement>('input[value=yes]')!); await click([...container.querySelectorAll('button')].find(button => button.textContent === 'Send feedback')!); expect(feedback).toHaveBeenCalledWith({ helpful: 'yes', comment: '' }); expect(container.querySelector('[role=status]')?.textContent).toContain('Thank you');
});
