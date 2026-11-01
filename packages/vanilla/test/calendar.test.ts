// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCalendar, createDatePicker, enhance } from '../src/index.js';

afterEach(() => { document.body.innerHTML = ''; });
function mount(markup: string): HTMLElement { document.body.innerHTML = markup; return document.body.firstElementChild as HTMLElement; }
function key(node: HTMLElement, key: string, extra: KeyboardEventInit = {}) { node.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...extra })); }

describe('calendar', () => {
  it('navigates RTL weeks, skips disabled dates, submits ISO and resets to the original value', async () => {
    const form = mount('<form><div data-nq="calendar" dir="rtl" data-nq-name="appointment" data-nq-value="2026-10-28"></div></form>') as HTMLFormElement;
    const root = form.firstElementChild as HTMLElement; const before = root.outerHTML;
    const controller = createCalendar(root, { locale: 'en-GB', min: '2026-10-26', max: '2026-11-03', isDateDisabled: date => date === '2026-10-29' });
    const current = root.querySelector<HTMLElement>('[data-nq-date="2026-10-28"]')!; current.focus(); key(current, 'ArrowLeft');
    expect((document.activeElement as HTMLElement).dataset.nqDate).toBe('2026-10-30');
    key(document.activeElement as HTMLElement, 'Home');
    expect((document.activeElement as HTMLElement).dataset.nqDate).toBe('2026-10-26');
    root.querySelector<HTMLButtonElement>('[data-nq-date="2026-10-30"]')!.click();
    expect(controller.value).toBe('2026-10-30'); expect(new FormData(form).get('appointment')).toBe('2026-10-30');
    controller.select('2026-10-29'); expect(controller.value).toBe('2026-10-30');
    form.reset(); await Promise.resolve(); expect(controller.value).toBe('2026-10-28');
    controller.destroy(); controller.destroy(); expect(root.outerHTML).toBe(before);
  });
  it('switches display calendars without changing selected ISO and has accurate reference day labels', () => {
    const root = mount('<div data-nq="calendar" data-nq-value="2029-08-11" data-nq-name="day"></div>');
    const changed = vi.fn(); const controller = createCalendar(root, { locale: 'en-GB', onValueChange: changed });
    controller.setCalendar('islamic-umalqura');
    expect(controller.value).toBe('2029-08-11');
    expect([...root.querySelectorAll('bdi[dir=ltr]')].map(node => node.textContent)).toEqual(['1924-08-01 – 2077-11-16']);
    expect(root.querySelector('[data-nq-date="2029-08-11"]')!.textContent).toBe('1');
    expect(root.querySelector('[data-nq-date="2029-08-11"]')!.getAttribute('aria-label')).toContain('1451');
    expect(root.querySelectorAll('[data-selected]')).toHaveLength(1);
    controller.setCalendar('gregory');
    expect(root.querySelector('[data-nq-date="2029-08-11"]')!.textContent).toBe('11');
    expect(changed).not.toHaveBeenCalled(); controller.destroy();
  });
  it('keeps unsupported boundary cells blank, blocks crossing bounds, and respects readonly', () => {
    const root = mount('<div data-nq="calendar" data-nq-calendar="islamic-umalqura" data-nq-value="1924-08-01" data-nq-readonly="true"></div>');
    const controller = createCalendar(root, { locale: 'en' });
    expect(root.querySelector<HTMLButtonElement>('[data-nq-calendar-action="previous"]')!.disabled).toBe(true);
    const first = root.querySelector<HTMLElement>('[data-nq-date="1924-08-01"]')!; first.focus(); key(first, 'PageUp');
    expect(document.activeElement).toBe(first);
    controller.select('1924-08-02'); expect(controller.value).toBe('1924-08-01');
    expect(root.querySelector('[data-nq-date="1924-07-31"]')).toBeNull(); controller.destroy();
  });
});

describe('date picker', () => {
  function picker(value = '2029-08-11') {
    const root = mount(`<div data-nq="date-picker"><label>Appointment<input type="date" data-nq-date-input name="date" value="${value}"></label><button type="button" data-nq-date-trigger>Choose date</button><dialog data-nq-date-dialog aria-label="Choose date"><button type="button" data-nq-date-close>Close</button><div data-nq-date-calendar></div></dialog></div>`);
    const dialog = root.querySelector('dialog')!;
    dialog.showModal = vi.fn(() => { dialog.open = true; dialog.querySelector<HTMLButtonElement>('button')!.focus(); });
    dialog.close = vi.fn(() => { dialog.open = false; dialog.dispatchEvent(new Event('close')); });
    return { root, dialog, input: root.querySelector<HTMLInputElement>('[data-nq-date-input]')!, trigger: root.querySelector<HTMLButtonElement>('[data-nq-date-trigger]')! };
  }
  it('switches inside the open native modal, commits ISO, restores focus and cleans up', () => {
    const { root, dialog, input, trigger } = picker(); const before = root.outerHTML;
    const controller = createDatePicker(root, { locale: 'en-GB' }); trigger.focus(); trigger.click();
    const select = root.querySelector<HTMLSelectElement>('[data-nq-calendar-system]')!; select.value = 'islamic-umalqura'; select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(dialog.open).toBe(true); expect(input.value).toBe('2029-08-11'); expect(dialog.showModal).toHaveBeenCalledTimes(1);
    const display = root.querySelector<HTMLOutputElement>('[data-nq-date-display]')!; expect(display.textContent).toContain('1451'); expect(input.getAttribute('aria-describedby')).toContain(display.id);
    root.querySelector<HTMLButtonElement>('[data-nq-date="2029-08-12"]')!.click();
    expect(input.value).toBe('2029-08-12'); expect(dialog.open).toBe(false); expect(document.activeElement).toBe(trigger);
    controller.destroy(); expect(root.outerHTML).toBe(before);
  });
  it('does not silently convert or clear an unsupported selection on switching to Hijri', () => {
    const { root, input, dialog, trigger } = picker('1800-01-01'); const controller = createDatePicker(root, { locale: 'en' });
    controller.setCalendar('islamic-umalqura'); expect(input.value).toBe('1800-01-01'); expect(input.checkValidity()).toBe(false);
    expect(root.querySelector('[data-nq-date-display]')!.textContent).toContain('1924-08-01');
    expect(input.validationMessage).toContain('1924-08-01'); controller.setCalendar('gregory'); expect(input.checkValidity()).toBe(true);
    input.readOnly = true; trigger.click(); expect(dialog.open).toBe(false); controller.destroy();
  });
  it('enhances nested picker calendar only once and preserves native typed input on reopening', () => {
    const { root, input, trigger } = picker(); const cleanup = enhance(root);
    input.value = '2029-08-13'; input.dispatchEvent(new Event('change', { bubbles: true })); trigger.click();
    expect(root.querySelectorAll('.nq-calendar-grid')).toHaveLength(1);
    expect(root.querySelector('[data-selected]')?.getAttribute('data-nq-date')).toBe('2029-08-13'); cleanup();
  });
  it('reports native edits once and closes when confirming the already selected date', () => {
    const { root, input, trigger, dialog } = picker(); const changed = vi.fn(); const bubbled = vi.fn(); root.addEventListener('nq:change', bubbled); const controller = createDatePicker(root, { onValueChange: changed });
    input.value = '2029-08-13'; input.dispatchEvent(new Event('change', { bubbles: true })); expect(changed).toHaveBeenCalledExactlyOnceWith('2029-08-13');
    trigger.click(); root.querySelector<HTMLButtonElement>('[data-nq-date="2029-08-13"]')!.click(); expect(dialog.open).toBe(false); expect(changed).toHaveBeenCalledTimes(1);
    const values = bubbled.mock.calls.filter(call => (call[0] as CustomEvent).detail.value); expect(values).toHaveLength(1); controller.destroy();
  });
  it('updates the associated date display on typing, blank values and native form reset', async () => {
    const { root, input } = picker(); const form = document.createElement('form'); document.body.replaceChildren(form); form.append(root);
    const controller = createDatePicker(root, { locale: 'en', calendar: 'islamic-umalqura' }); const display = root.querySelector<HTMLOutputElement>('[data-nq-date-display]')!;
    expect(display.textContent).toContain('1451'); controller.setValue(''); expect(display.hidden).toBe(true);
    input.value = '2026-10-28'; input.dispatchEvent(new Event('input', { bubbles: true })); expect(display.textContent).toContain('1448'); expect(display.hidden).toBe(false);
    form.reset(); await Promise.resolve(); expect(input.value).toBe('2029-08-11'); expect(display.textContent).toContain('1451'); controller.destroy();
  });
});
