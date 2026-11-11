import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, createRef, StrictMode, useState } from 'react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { Button, Checkbox, Combobox, Dialog, Field, Pagination, Tabs, TextField, Tooltip } from './src/index.js';
const comboTexts = { emptyMessage: 'No options found', getResultsMessage: (count: number) => `${count} results available`, requiredMessage: 'Choose an option from the list.' };
const pageTexts = { label: 'Pages', previousLabel: 'Previous page', nextLabel: 'Next page', getPageLabel: (page: number) => `Page ${page}`, getGapLabel: (start: number, end: number) => `Pages ${start} to ${end}`, jumpLabel: 'Go to page', goLabel: 'Go' };

// JSDOM has dialog elements but no modal lifecycle; browser checks exercise the native implementation.
if (!HTMLDialogElement.prototype.showModal) Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, writable: true, value() {} });
if (!HTMLDialogElement.prototype.close) Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, writable: true, value() {} });

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let container: HTMLDivElement;
let root: Root;
async function render(node: ReactNode) { await act(async () => root.render(node)); }
async function key(element: Element, key: string) { await act(async () => element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))); }
async function click(element: HTMLElement) { await act(async () => element.click()); }
async function input(element: HTMLInputElement, value: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
beforeEach(() => { container = document.createElement('div'); document.body.append(container); root = createRoot(container); });
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.restoreAllMocks(); });

describe('native field integration', () => {
  it('associates a field, hint, error and forwarded input ref without losing form behavior', async () => {
    const ref = createRef<HTMLInputElement>();
    await render(<form><Field label="Email" hint="Use your work email" error="Check this address" required><TextField ref={ref} name="email" defaultValue="demo@example.com" /></Field><Checkbox name="agree" label="Agree" defaultChecked /></form>);
    const control = ref.current!;
    expect(container.querySelector('label')?.htmlFor).toBe(control.id);
    expect(control.required).toBe(true);
    expect(control.getAttribute('aria-invalid')).toBe('true');
    for (const id of control.getAttribute('aria-describedby')!.split(' ')) expect(document.getElementById(id)).not.toBeNull();
    expect(new FormData(container.querySelector('form')!).get('email')).toBe('demo@example.com');
    expect(new FormData(container.querySelector('form')!).get('agree')).toBe('on');
  });
});

describe('tabs', () => {
  const items = [{ value: 'a', label: 'First', content: 'A' }, { value: 'disabled', label: 'Unavailable', content: 'Disabled', disabled: true }, { value: 'c', label: 'Last', content: 'C' }];
  it('follows RTL arrow direction, skips disabled tabs and maintains roving focus', async () => {
    const changed = vi.fn();
    await render(<Tabs dir="rtl" label="Sections" overflowLabel="More tabs" items={items} onValueChange={changed} />);
    const tabs = [...container.querySelectorAll<HTMLButtonElement>('[role=tab]')];
    await act(async () => tabs[0]!.focus());
    await key(tabs[0]!, 'ArrowLeft');
    expect(document.activeElement).toBe(tabs[2]);
    expect(tabs[2]!.getAttribute('aria-selected')).toBe('true');
    expect(changed).toHaveBeenLastCalledWith('c');
    expect(container.querySelectorAll('[role=tabpanel]:not([hidden])')).toHaveLength(1);
    await key(tabs[2]!, 'Home');
    expect(document.activeElement).toBe(tabs[0]);
  });
  it('manual activation moves focus before selecting, and controlled selection stays with the caller', async () => {
    const changed = vi.fn();
    await render(<Tabs label="Sections" overflowLabel="More tabs" items={items} activationMode="manual" value="a" onValueChange={changed} />);
    const tabs = [...container.querySelectorAll<HTMLButtonElement>('[role=tab]')];
    await key(tabs[0]!, 'End');
    expect(document.activeElement).toBe(tabs[2]);
    expect(tabs[0]!.getAttribute('aria-selected')).toBe('true');
    expect(changed).not.toHaveBeenCalled();
    await click(tabs[2]!);
    expect(changed).toHaveBeenLastCalledWith('c');
    expect(tabs[0]!.getAttribute('aria-selected')).toBe('true');
  });
});

describe('combobox', () => {
  const options = [{ value: 'riyadh', label: 'الرِّياض' }, { value: 'jeddah', label: 'جدة', disabled: true }, { value: 'abha', label: 'أبها' }];
  it('filters Arabic, commits enabled options by keyboard, and submits the selected value', async () => {
    const changed = vi.fn();
    await render(<form><Combobox {...comboTexts} label="City" name="city" options={options} onValueChange={changed} required /></form>);
    const control = container.querySelector<HTMLInputElement>('[role=combobox]')!;
    await input(control, 'ابها');
    expect(container.querySelectorAll('[role=option]')).toHaveLength(1);
    await key(control, 'ArrowDown');
    expect(control.getAttribute('aria-activedescendant')).toBe(container.querySelector('[role=option]')!.id);
    await key(control, 'Enter');
    expect(control.value).toBe('أبها');
    expect(control.getAttribute('aria-expanded')).toBe('false');
    expect(changed).toHaveBeenLastCalledWith('abha', options[2]);
    expect(new FormData(container.querySelector('form')!).get('city')).toBe('abha');
    expect(control.checkValidity()).toBe(true);
    await key(control, 'ArrowDown');
    expect(container.querySelectorAll('[role=option]')).toHaveLength(3);
    await key(control, 'ArrowDown');
    await key(control, 'Enter');
    expect(changed).toHaveBeenLastCalledWith('abha', options[2]);
  });
  it('retains the first typed character when controlled selection is cleared and leaves arbitrary queries uncommitted', async () => {
    function Controlled() {
      const [value, setValue] = useState('riyadh');
      return <form><Combobox {...comboTexts} name="city" aria-label="City" options={options} value={value} onValueChange={setValue} required /></form>;
    }
    await render(<Controlled />);
    const control = container.querySelector<HTMLInputElement>('[role=combobox]')!;
    await input(control, 'ا');
    expect(control.value).toBe('ا');
    expect(new FormData(container.querySelector('form')!).get('city')).toBe('');
    expect(control.checkValidity()).toBe(false);
    await key(control, 'Escape');
    expect(control.getAttribute('aria-expanded')).toBe('false');
    expect(control.value).toBe('ا');
  });
  it('keeps a controlled committed selection when the caller rejects a new option', async () => {
    const changed = vi.fn();
    await render(<form><Combobox {...comboTexts} label="City" name="city" options={options} value="riyadh" onValueChange={changed} /></form>);
    const control = container.querySelector<HTMLInputElement>('[role=combobox]')!;
    await key(control, 'ArrowDown'); await key(control, 'End'); await key(control, 'Enter');
    expect(changed).toHaveBeenLastCalledWith('abha', options[2]);
    expect(control.value).toBe('الرِّياض');
    expect(new FormData(container.querySelector('form')!).get('city')).toBe('riyadh');
  });
  it('does not treat a disabled controlled option as a valid form value', async () => {
    await render(<form><Combobox {...comboTexts} label="City" name="city" options={options} value="jeddah" required /></form>);
    expect(new FormData(container.querySelector('form')!).get('city')).toBe('');
    expect(container.querySelector<HTMLInputElement>('[role=combobox]')!.checkValidity()).toBe(false);
  });
  it('reconciles changed option labels without erasing a query and honors canceled resets', async () => {
    const updated = options.map(option => ({ ...option, label: option.value === 'riyadh' ? 'Riyadh' : option.label }));
    await render(<form onReset={event => event.preventDefault()}><Combobox {...comboTexts} name="city" label="City" options={options} defaultValue="riyadh" /></form>);
    const control = container.querySelector<HTMLInputElement>('[role=combobox]')!;
    await render(<form onReset={event => event.preventDefault()}><Combobox {...comboTexts} name="city" label="City" options={updated} defaultValue="riyadh" /></form>);
    expect(control.value).toBe('Riyadh');
    await input(control, 'Ab');
    await render(<form onReset={event => event.preventDefault()}><Combobox {...comboTexts} name="city" label="City" options={options} defaultValue="riyadh" /></form>);
    expect(control.value).toBe('Ab');
    await act(async () => container.querySelector('form')!.reset());
    expect(control.value).toBe('Ab');
    expect(new FormData(container.querySelector('form')!).get('city')).toBe('');
  });
  it('resets uncontrolled selection with its owning native form', async () => {
    await render(<form id="combo-form"><Combobox {...comboTexts} name="city" label="City" options={options} defaultValue="riyadh" /></form>);
    const control = container.querySelector<HTMLInputElement>('[role=combobox]')!;
    await input(control, 'ابها');
    await key(control, 'ArrowDown'); await key(control, 'Enter');
    expect(control.value).toBe('أبها');
    await act(async () => container.querySelector('form')!.reset());
    expect(control.value).toBe('الرِّياض');
    expect(new FormData(container.querySelector('form')!).get('city')).toBe('riyadh');
  });
});

describe('dialog and tooltip', () => {
  it('uses native modality, cancel and focus restoration', async () => {
    const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(function (this: HTMLDialogElement) { this.open = true; });
    const close = vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(function (this: HTMLDialogElement) { this.open = false; this.dispatchEvent(new Event('close')); });
    const changed = vi.fn();
    await render(<Dialog title="Review" closeLabel="Close" trigger={<Button>Open</Button>} onOpenChange={changed}>Details</Dialog>);
    const trigger = container.querySelector<HTMLButtonElement>('button')!;
    trigger.focus(); await click(trigger);
    const dialog = container.querySelector('dialog')!;
    expect(showModal).toHaveBeenCalledOnce();
    expect(dialog.open).toBe(true);
    await act(async () => dialog.dispatchEvent(new Event('cancel', { cancelable: true })));
    expect(close).toHaveBeenCalledOnce();
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
    expect(changed).toHaveBeenLastCalledWith(false);
  });
  it('keeps a default-open modal open after StrictMode replays its effects', async () => {
    vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(function (this: HTMLDialogElement) { this.open = true; });
    vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(function (this: HTMLDialogElement) {
      this.open = false;
      queueMicrotask(() => this.dispatchEvent(new Event('close')));
    });
    const changed = vi.fn();
    await render(<StrictMode><Dialog title="Review" closeLabel="Close" defaultOpen onOpenChange={changed}>Details</Dialog></StrictMode>);
    expect(container.querySelector('dialog')!.open).toBe(true);
    expect(changed).not.toHaveBeenCalled();
  });
  it('reconciles a native close when a controlled caller keeps the dialog open', async () => {
    vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(function (this: HTMLDialogElement) { this.open = true; });
    vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(function (this: HTMLDialogElement) { this.open = false; this.dispatchEvent(new Event('close')); });
    const changed = vi.fn();
    await render(<Dialog title="Review" closeLabel="Close" open onOpenChange={changed}>Details</Dialog>);
    const dialog = container.querySelector('dialog')!;
    await act(async () => dialog.close());
    expect(changed).toHaveBeenCalledWith(false);
    expect(dialog.open).toBe(true);
  });
  it('reveals a descriptive tooltip on focus and dismisses it with Escape', async () => {
    await render(<Tooltip content="Helpful detail"><Button>Help</Button></Tooltip>);
    const trigger = container.querySelector('button')!;
    const tooltip = container.querySelector<HTMLElement>('[role=tooltip]')!;
    expect(tooltip.hidden).toBe(true);
    await act(async () => trigger.focus());
    expect(tooltip.hidden).toBe(false);
    expect(trigger.getAttribute('aria-describedby')).toBe(tooltip.id);
    await key(trigger, 'Escape');
    expect(tooltip.hidden).toBe(true);
  });
});

it('keeps pagination bounded, including large result sets', async () => {
  const changed = vi.fn();
  await render(<Pagination {...pageTexts} totalPages={10000} defaultPage={1} onPageChange={changed} />);
  expect(container.querySelectorAll('button').length).toBeLessThan(10);
  expect(container.querySelector<HTMLButtonElement>('button')!.disabled).toBe(true);
  await click([...container.querySelectorAll('button')].at(-1)!);
  expect(changed).toHaveBeenLastCalledWith(2);
});
