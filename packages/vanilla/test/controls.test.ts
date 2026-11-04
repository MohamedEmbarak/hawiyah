// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFileDropzone, createMenu, createMultiSelect, createPasswordField, createPinInput, createPopover, createRangeSlider, createTagInput, createToastRegion } from '../src/index.js';

afterEach(() => { document.body.innerHTML = ''; vi.useRealTimers(); });
function mount(markup: string): HTMLElement { document.body.innerHTML = markup; return document.body.firstElementChild as HTMLElement; }
function key(node: HTMLElement, key: string, extra: KeyboardEventInit = {}) { const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...extra }); node.dispatchEvent(event); return event; }

describe('native control enhancements', () => {
  it('exposes each range handle’s available bounds and restores defaults after a narrow selection', async () => {
    const form = mount('<form><fieldset><input type="range" data-nq-lower min="0" max="100" value="20"><input type="range" data-nq-upper min="0" max="100" value="80"></fieldset></form>') as HTMLFormElement;
    const field = form.querySelector('fieldset')!;
    const [lower, upper] = field.querySelectorAll('input');
    const controller = createRangeSlider(field);
    expect(lower!.max).toBe('80');
    expect(upper!.min).toBe('20');
    lower!.value = '0'; lower!.dispatchEvent(new Event('input'));
    upper!.value = '10'; upper!.dispatchEvent(new Event('input'));
    expect(lower!.max).toBe('10');
    expect(controller.value).toEqual([0, 10]);
    form.reset(); await Promise.resolve();
    expect(controller.value).toEqual([20, 80]);
    expect(lower!.max).toBe('80');
    expect(upper!.min).toBe('20');
    controller.destroy();
    expect(lower!.max).toBe('100');
    expect(upper!.min).toBe('0');
  });
  it('toggles password visibility without changing its value and restores markup', async () => {
    const root = mount('<div><label>Password<input data-nq-password-input type="password" value="secret"></label><button data-nq-password-toggle>Show</button></div>'); const before = root.outerHTML;
    const controller = createPasswordField(root, { showLabel: 'Show password', hideLabel: 'Hide password' });
    const input = root.querySelector('input')!; const button = root.querySelector('button')!; button.click();
    expect(input.type).toBe('text'); expect(input.value).toBe('secret'); expect(button.getAttribute('aria-pressed')).toBe('true');
    input.disabled = true; await Promise.resolve(); expect(button.disabled).toBe(true); input.disabled = false;
    controller.destroy(); expect(root.outerHTML).toBe(before);
  });
  it('normalizes PIN paste/input, preserves one input, and ignores composition keys', () => {
    const root = mount('<div><label>Code<input data-nq-pin-input maxlength="6" name="code"></label><span data-nq-pin-slot></span></div>');
    const controller = createPinInput(root); const input = root.querySelector('input')!;
    input.value = '١٢۳۴56'; input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(controller.value).toBe('123456'); expect(root.querySelectorAll('input')).toHaveLength(1); expect(input.autocomplete).toBe('one-time-code');
    expect(root.querySelector('[data-nq-pin-slot]')!.getAttribute('aria-hidden')).toBe('true'); controller.destroy();
  });
  it('clamps only the moved range thumb, resets, and restores narrower overridden bounds', async () => {
    const form = mount('<form><div><input type="range" data-nq-lower min="0" max="100" value="10"><input type="range" data-nq-upper min="0" max="100" value="80"><output data-nq-range-output></output></div></form>') as HTMLFormElement;
    const root = form.firstElementChild as HTMLElement; const controller = createRangeSlider(root, { min: 20 }); const lower = root.querySelector<HTMLInputElement>('[data-nq-lower]')!;
    lower.value = '90'; lower.dispatchEvent(new Event('input', { bubbles: true })); expect(controller.value).toEqual([80, 80]);
    form.reset(); await Promise.resolve(); expect(controller.value).toEqual([20, 80]); controller.destroy(); expect(lower.value).toBe('10'); expect(lower.min).toBe('0');
  });
  it('keeps readonly range thumbs in native tab order while rejecting value changes', () => {
    const root = mount('<div data-nq-readonly="true"><label>Minimum<input type="range" data-nq-lower value="20"></label><label>Maximum<input type="range" data-nq-upper value="80"></label></div>');
    const changed = vi.fn(); const controller = createRangeSlider(root, { onValueChange: changed });
    for (const input of root.querySelectorAll('input')) {
      expect(key(input, 'Tab').defaultPrevented).toBe(false);
      expect(key(input, 'Tab', { shiftKey: true }).defaultPrevented).toBe(false);
      expect(key(input, 'Escape').defaultPrevented).toBe(false);
      expect(key(input, 'c', { ctrlKey: true }).defaultPrevented).toBe(false);
      for (const direction of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown']) expect(key(input, direction).defaultPrevented).toBe(true);
      const pointer = new Event('pointerdown', { bubbles: true, cancelable: true }); input.dispatchEvent(pointer); expect(pointer.defaultPrevented).toBe(true);
      input.value = '50'; input.dispatchEvent(new Event('input', { bubbles: true }));
      expect(controller.value).toEqual([20, 80]);
    }
    expect([...root.querySelectorAll('input')].map(input => input.value)).toEqual(['20', '80']); expect(changed).not.toHaveBeenCalled();
    root.dataset.nqReadonly = 'false';
    const lower = root.querySelector('input')!;
    expect(key(lower, 'ArrowRight').defaultPrevented).toBe(false);
    lower.value = '30'; lower.dispatchEvent(new Event('input', { bubbles: true })); expect(changed).toHaveBeenCalledWith([30, 80]);
    root.dataset.nqReadonly = 'true'; controller.destroy(); expect(key(lower, 'ArrowRight').defaultPrevented).toBe(false);
  });
  it('commits/removes unique tags, submits repeated values, validates required selection and resets', async () => {
    const form = mount('<form><div data-nq-name="tags" data-nq-value=\'["Design"]\'><label>Tags<input data-nq-tag-input required></label><div data-nq-tags></div></div></form>') as HTMLFormElement;
    const root = form.firstElementChild as HTMLElement; const before = root.outerHTML; const controller = createTagInput(root); const input = root.querySelector<HTMLInputElement>('[data-nq-tag-input]')!;
    expect(input.checkValidity()).toBe(true); input.value = 'Research'; key(input, 'Enter'); controller.add('research');
    expect(controller.value).toEqual(['Design', 'Research']); expect(new FormData(form).getAll('tags')).toEqual(['Design', 'Research']);
    input.value = ''; key(input, 'Backspace'); controller.remove('Design'); expect(input.checkValidity()).toBe(false);
    form.reset(); await Promise.resolve(); expect(controller.value).toEqual(['Design']); controller.destroy(); expect(root.outerHTML).toBe(before);
  });
  it('filters checkbox options without losing selected native form values', async () => {
    const form = mount('<form><fieldset><legend>Services</legend><input data-nq-multiselect-search type="search" aria-label="Find"><label data-nq-option><input type="checkbox" name="services" value="a" checked>الرياض</label><label data-nq-option><input type="checkbox" name="services" value="b">أبها</label><span data-nq-status></span></fieldset></form>') as HTMLFormElement;
    const root = form.firstElementChild as HTMLElement; const controller = createMultiSelect(root); const input = root.querySelector<HTMLInputElement>('[type=search]')!;
    input.value = 'ابها'; input.dispatchEvent(new Event('input', { bubbles: true })); expect(root.querySelector<HTMLElement>('[data-nq-option]')!.hidden).toBe(true);
    root.querySelector<HTMLInputElement>('[value=b]')!.click(); expect(controller.value).toEqual(['a', 'b']); expect(new FormData(form).getAll('services')).toEqual(['a', 'b']);
    form.reset(); await Promise.resolve(); expect(controller.value).toEqual(['a']); expect(input.value).toBe(''); controller.destroy();
  });
  it('rejects oversized or mismatched dropped files without pretending to upload them', () => {
    const root = mount('<label><input type="file" data-nq-file-input accept=".pdf"><span data-nq-file-status role="status"></span></label>');
    const changed = vi.fn(); const controller = createFileDropzone(root, { maxSize: 2, onValueChange: changed });
    const event = new Event('drop', { bubbles: true, cancelable: true }); Object.defineProperty(event, 'dataTransfer', { value: { files: [new File(['four'], 'sample.pdf', { type: 'application/pdf' })] } }); root.dispatchEvent(event);
    expect(controller.value).toEqual([]); expect(changed).toHaveBeenCalledWith([]); expect(root.querySelector('[role=status]')!.textContent).not.toBe(''); controller.destroy();
  });
});

describe('nonmodal disclosures and notifications', () => {
  it('closes a popover on outside press without stealing focus and returns focus on Escape', () => {
    const outer = mount('<main><div><button data-nq-trigger>Open</button><section data-nq-panel aria-label="Help" hidden><input aria-label="Details"><button data-nq-close>Close</button></section></div><button id="outside">Outside</button></main>');
    const root = outer.firstElementChild as HTMLElement; const before = root.outerHTML; const controller = createPopover(root, { focusOnOpen: true }); const trigger = root.querySelector<HTMLButtonElement>('[data-nq-trigger]')!;
    trigger.click(); expect(document.activeElement).toBe(root.querySelector('input')); key(root.querySelector('input')!, 'Escape'); expect(controller.open).toBe(false); expect(document.activeElement).toBe(trigger);
    controller.show(); const outside = document.getElementById('outside')!; outside.focus(); outside.dispatchEvent(new Event('pointerdown', { bubbles: true })); expect(controller.open).toBe(false); expect(document.activeElement).toBe(outside);
    controller.destroy(); expect(root.outerHTML).toBe(before);
  });
  it('navigates menu enabled items, activates with keyboard and removes typeahead timers', () => {
    vi.useFakeTimers(); const root = mount('<div><button data-nq-trigger>Actions</button><div data-nq-panel role="menu" aria-label="Actions" hidden><button role="menuitem" data-nq-value="edit">Edit</button><button role="menuitem" disabled>Delete</button><button role="menuitem" data-nq-value="print">Print</button></div></div>');
    const selected = vi.fn(); const controller = createMenu(root, { onSelect: selected }); const trigger = root.querySelector<HTMLButtonElement>('[data-nq-trigger]')!;
    key(trigger, 'ArrowDown'); expect(document.activeElement?.textContent).toBe('Edit'); key(document.activeElement as HTMLElement, 'ArrowDown'); expect(document.activeElement?.textContent).toBe('Print');
    key(document.activeElement as HTMLElement, 'Enter'); expect(selected).toHaveBeenCalledWith('print'); expect(document.activeElement).toBe(trigger); expect(controller.open).toBe(false);
    controller.show(); const scheduled = vi.spyOn(globalThis, 'setTimeout'); const cleared = vi.spyOn(globalThis, 'clearTimeout'); key(document.activeElement as HTMLElement, 'p');
    const index = scheduled.mock.calls.findIndex(call => call[1] === 500); expect(index).toBeGreaterThanOrEqual(0);
    const timer = scheduled.mock.results[index]!.value; controller.destroy(); expect(cleared).toHaveBeenCalledWith(timer);
  });
  it('dismisses caller-owned toast messages, focuses the next action and restores on cleanup', () => {
    const root = mount('<div><div data-nq-toast id="one"><p>Saved</p><button data-nq-dismiss>Dismiss first</button></div><div data-nq-toast id="two"><p>Ready</p><button data-nq-dismiss>Dismiss second</button></div></div>'); const before = root.outerHTML;
    const controller = createToastRegion(root); const first = root.querySelector('button')!; first.focus(); first.click();
    expect(root.querySelector<HTMLElement>('#one')!.hidden).toBe(true); expect(document.activeElement?.textContent).toBe('Dismiss second'); expect(root.getAttribute('aria-live')).toBe('polite');
    controller.destroy(); expect(root.outerHTML).toBe(before);
  });
});
