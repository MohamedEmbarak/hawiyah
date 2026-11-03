import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp, defineComponent, h, nextTick, ref } from 'vue';
import type { App, Component } from 'vue';
import { Checkbox, Combobox, Dialog, Field, Pagination, Tabs, TextField, Tooltip } from '../src/index.js';

const apps: App[] = [];
function mount(component: Component) {
  const container = document.createElement('div'); document.body.append(container);
  const app = createApp(component); apps.push(app); app.mount(container); return container;
}
async function key(element: Element, value: string) { element.dispatchEvent(new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true })); await nextTick(); }
afterEach(() => { apps.splice(0).forEach(app => app.unmount()); document.body.replaceChildren(); vi.restoreAllMocks(); });

describe('Vue controls', () => {
  it('connects Field labels, error and required state to native inputs and forwards handlers', async () => {
    const input = vi.fn(); const value = ref('');
    const host = mount(defineComponent(() => () => h(Field, { label: 'Name', hint: 'Full name', error: 'Required', required: true }, { default: () => h(TextField, { name: 'name', modelValue: value.value, 'onUpdate:modelValue': v => { value.value = v; }, onInput: input }) })));
    const control = host.querySelector('input')!;
    expect(host.querySelector('label')!.htmlFor).toBe(control.id);
    expect(control.required).toBe(true);
    expect(control.getAttribute('aria-invalid')).toBe('true');
    control.getAttribute('aria-describedby')!.split(' ').forEach(id => expect(document.getElementById(id)).not.toBeNull());
    control.value = 'ليان'; control.dispatchEvent(new Event('input', { bubbles: true })); await nextTick();
    expect(value.value).toBe('ليان'); expect(input).toHaveBeenCalledOnce();
  });

  it('commits only enabled combobox options, retains typed query, and restores form defaults', async () => {
    const value = ref('r');
    const options = [{ value: 'r', label: 'الرياض' }, { value: 'j', label: 'جدة', disabled: true }, { value: 'd', label: 'الدمام' }];
    const host = mount(defineComponent(() => () => h('form', {}, h(Combobox, { label: 'City', name: 'city', modelValue: value.value, defaultValue: 'r', options, required: true, 'onUpdate:modelValue': v => { value.value = v; } }))));
    const input = host.querySelector<HTMLInputElement>('input[role=combobox]')!;
    input.focus(); await nextTick();
    expect(host.querySelectorAll('[role=option]')).toHaveLength(3);
    input.value = 'الد'; input.dispatchEvent(new Event('input', { bubbles: true })); await nextTick();
    expect(value.value).toBe(''); expect(input.value).toBe('الد'); expect(input.validity.customError).toBe(true);
    await key(input, 'ArrowDown'); await key(input, 'Enter');
    expect(value.value).toBe('d'); expect(input.value).toBe('الدمام'); expect(input.validity.valid).toBe(true);
    expect(new FormData(host.querySelector('form')!).get('city')).toBe('d');
    await key(input, 'ArrowDown'); await key(input, 'ArrowDown');
    expect(document.getElementById(input.getAttribute('aria-activedescendant')!)?.textContent).toBe('الدمام');
    await key(input, 'Escape'); expect(input.getAttribute('aria-expanded')).toBe('false');
    host.querySelector('form')!.reset(); await Promise.resolve(); await nextTick();
    expect(value.value).toBe('r'); expect(input.value).toBe('الرياض');
    input.focus(); input.click(); await nextTick();
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true })); await nextTick();
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('keeps readonly combobox values fixed and reconciles rejected controlled selections', async () => {
    const options = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }];
    const change = vi.fn();
    const host = mount(defineComponent(() => () => h('div', {}, [
      h(Combobox, { label: 'Readonly', name: 'readonly', readonly: true, defaultValue: 'a', options }),
      h(Combobox, { label: 'Controlled', name: 'controlled', modelValue: 'a', options, 'onUpdate:modelValue': change }),
    ])));
    const inputs = host.querySelectorAll<HTMLInputElement>('[role=combobox]');
    inputs[0]!.focus(); await key(inputs[0]!, 'ArrowDown'); await key(inputs[0]!, 'End'); await key(inputs[0]!, 'Enter');
    expect(inputs[0]!.value).toBe('Alpha'); expect(inputs[0]!.getAttribute('aria-expanded')).toBe('false');
    inputs[1]!.focus(); await nextTick(); await key(inputs[1]!, 'End'); await key(inputs[1]!, 'Enter');
    expect(change).toHaveBeenCalledWith('b');
    expect(inputs[1]!.value).toBe('Alpha'); expect(host.querySelector<HTMLInputElement>('[name=controlled]')!.value).toBe('a');
    inputs[1]!.click(); await nextTick(); await key(inputs[1]!, 'Escape');
    expect(inputs[1]!.value).toBe('Alpha');
  });

  it('makes tabs follow RTL, skip disabled items and preserve manual activation', async () => {
    const host = mount(defineComponent(() => () => h('div', { dir: 'rtl' }, [h(Tabs, { label: 'Details', activationMode: 'manual', items: [{ value: 'a', label: 'First', content: 'A' }, { value: 'b', label: 'Disabled', disabled: true }, { value: 'c', label: 'Last', content: 'C' }] })])));
    const tabs = host.querySelectorAll<HTMLButtonElement>('[role=tab]');
    tabs[0]!.focus(); await key(tabs[0]!, 'ArrowLeft');
    expect(document.activeElement).toBe(tabs[2]); expect(tabs[0]!.getAttribute('aria-selected')).toBe('true');
    tabs[2]!.click(); await nextTick();
    expect(tabs[2]!.getAttribute('aria-selected')).toBe('true');
    expect(host.querySelectorAll<HTMLElement>('[role=tabpanel]')[2]!.hidden).toBe(false);
  });

  it('uses native dialog lifecycle, emits cancellation and returns focus', async () => {
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: function(this: HTMLDialogElement) { this.open = true; } });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: function(this: HTMLDialogElement) { this.open = false; this.dispatchEvent(new Event('close')); } });
    const open = ref(false);
    const host = mount(defineComponent(() => () => h('div', {}, [h('button', { onClick: () => { open.value = true; } }, 'Review'), h(Dialog, { title: 'Review request', open: open.value, 'onUpdate:open': v => { open.value = v; } }, () => h('input', { 'aria-label': 'Note' }))])));
    const trigger = host.querySelector('button')!; trigger.focus(); trigger.click(); await nextTick();
    const dialog = host.querySelector('dialog')!; expect(dialog.open).toBe(true);
    dialog.dispatchEvent(new Event('cancel', { cancelable: true })); await nextTick();
    expect(open.value).toBe(false); expect(dialog.open).toBe(false); expect(document.activeElement).toBe(trigger);
  });

  it('bounds pagination and updates boolean v-model', async () => {
    const page = ref(1); const checked = ref(false);
    const host = mount(defineComponent(() => () => h('div', {}, [h(Pagination, { totalPages: 100, modelValue: page.value, 'onUpdate:modelValue': v => { page.value = v; } }), h(Checkbox, { label: 'Confirm', modelValue: checked.value, 'onUpdate:modelValue': v => { checked.value = Boolean(v); } })])));
    const buttons = host.querySelectorAll<HTMLButtonElement>('.nq-pagination > button'); expect(buttons[0]!.disabled).toBe(true); expect(buttons.length).toBeLessThan(10);
    const gap = host.querySelector<HTMLDetailsElement>('.nq-pagination-gap')!;
    expect(gap.open).toBe(false);
    expect([...gap.querySelectorAll<HTMLElement>('[data-nq-page]')].map(node => Number(node.dataset.nqPage))).toEqual(Array.from({length: 94}, (_, index) => index + 6));
    expect(gap.querySelectorAll('button').length).toBeLessThanOrEqual(100);
    buttons[buttons.length - 1]!.click(); host.querySelector<HTMLInputElement>('input')!.click(); await nextTick();
    expect(page.value).toBe(2); expect(checked.value).toBe(true);
  });

  it('keeps tooltip description attached while handling focus and Escape', async () => {
    const host = mount(defineComponent(() => () => h(Tooltip, { content: 'Helpful description' }, () => h('button', {}, 'Help'))));
    const trigger = host.querySelector('button')!; const tooltip = host.querySelector<HTMLElement>('[role=tooltip]')!;
    expect(trigger.getAttribute('aria-describedby')).toBe(tooltip.id);
    trigger.focus(); await nextTick(); expect(tooltip.hidden).toBe(false);
    await key(trigger, 'Escape'); expect(tooltip.hidden).toBe(true);
  });
});
