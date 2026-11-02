import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { DatePicker } from './src/calendar.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const roots: ReturnType<typeof createRoot>[] = [];
afterEach(async () => { for (const root of roots.splice(0)) await act(() => root.unmount()); document.body.replaceChildren(); vi.restoreAllMocks(); });
async function edit(input: HTMLInputElement, value: string) { await act(() => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })); }); }

it('keeps malformed drafts focusable and submits only canonical ISO while enforcing text-date constraints', async () => {
  const container = document.createElement('div'); document.body.append(container); const root = createRoot(container); roots.push(root); const changed = vi.fn();
  await act(() => root.render(<form><DatePicker label="Date" name="date" required defaultCalendar="islamic-umalqura" defaultValue="2026-10-15" min="2026-10-01" max="2026-10-31" isDateDisabled={date => date === '2026-10-20'} onValueChange={changed} /></form>));
  const input = container.querySelector<HTMLInputElement>('input[type=text]')!; const form = container.querySelector('form')!;
  expect(container.querySelector('input[type=date]')).toBeNull(); expect(input.name).toBe(''); expect(input.willValidate).toBe(true);
  input.focus(); await edit(input, '2026-02-30');
  expect(input.value).toBe('2026-02-30'); expect(input.checkValidity()).toBe(false); expect(changed).not.toHaveBeenCalled(); expect(new FormData(form).get('date')).toBe('2026-10-15'); expect(document.activeElement).toBe(input);
  await edit(input, '2026-11-01'); expect(changed).toHaveBeenLastCalledWith('2026-11-01'); expect(input.checkValidity()).toBe(false);
  await edit(input, '2026-10-20'); expect(input.checkValidity()).toBe(false);
  await edit(input, '2026-10-21'); expect(input.checkValidity()).toBe(true); expect(new FormData(form).getAll('date')).toEqual(['2026-10-21']);
  await edit(input, ''); expect(changed).toHaveBeenLastCalledWith(''); expect(input.validity.valueMissing).toBe(true); expect(new FormData(form).get('date')).toBe('');
  await act(async () => { form.reset(); await Promise.resolve(); }); expect(input.value).toBe('2026-10-15'); expect(input.checkValidity()).toBe(true); expect(new FormData(form).get('date')).toBe('2026-10-15'); expect(container.querySelector<HTMLInputElement>('.nq-calendar-switch input:checked')!.value).toBe('islamic-umalqura');
});

it('opens only the custom dialog from ArrowDown and leaves click/Enter editing semantics intact', async () => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: function (this: HTMLDialogElement) { this.open = false; this.dispatchEvent(new Event('close')); } });
  const container = document.createElement('div'); document.body.append(container); const root = createRoot(container); roots.push(root);
  await act(() => root.render(<DatePicker label="Date" />)); const input = container.querySelector<HTMLInputElement>('input[type=text]')!; const dialog = container.querySelector('dialog')!;
  await act(() => input.click()); expect(dialog.open).toBe(false);
  const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }); await act(() => input.dispatchEvent(enter)); expect(enter.defaultPrevented).toBe(false);
  input.focus(); await act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true, bubbles: true, cancelable: true })));
  expect(dialog.open).toBe(true); expect(input.hasAttribute('aria-expanded')).toBe(false); expect(container.querySelector('button[aria-haspopup=dialog]')!.getAttribute('aria-expanded')).toBe('true'); expect(input.getAttribute('aria-controls')).toBe(dialog.id);
});

it('keeps malformed external values as invalid text instead of using them as a calendar month', async () => {
  const container = document.createElement('div'); document.body.append(container); const root = createRoot(container); roots.push(root);
  await act(() => root.render(<form><DatePicker label="Date" name="date" value="not-a-date" /></form>));
  const input = container.querySelector<HTMLInputElement>('input[type=text]')!;
  expect(input.value).toBe('not-a-date'); expect(input.checkValidity()).toBe(false); expect(new FormData(container.querySelector('form')!).get('date')).toBe('');
});
