// Dialog, Drawer and Tooltip cases shared by the four adapters (milestone 3: overlays-1, overlays-10, overlays-14).
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createApp, defineComponent, h, nextTick, type App } from 'vue';
import { Dialog, Tooltip } from '../src/interactive.js';
import { Drawer } from '../src/expansion-interactive.js';

let app: App | undefined;
beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value(this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value(this: HTMLDialogElement) { this.open = false; } });
});
afterEach(() => { app?.unmount(); app = undefined; document.body.replaceChildren(); });
function mount(render: () => ReturnType<typeof h>) {
  const host = document.createElement('div'); document.body.append(host);
  app = createApp(defineComponent(() => render)); app.mount(host); return host;
}

it('[DIALOG-01][overlays-1] a dialog or drawer without footer content renders no footer', () => {
  const host = mount(() => h('div', [
    h(Dialog, { title: 'Dialog', closeLabel: 'Close', defaultOpen: true }, () => 'Body'),
    h(Drawer, { title: 'Drawer', closeLabel: 'Close', defaultOpen: true }, { default: () => 'Body' }),
  ]));
  expect(host.querySelectorAll('dialog')).toHaveLength(2);
  expect(host.querySelector('.hw-dialog-footer')).toBeNull();
});

it('[DIALOG-02][overlays-10] the description is associated with the native dialog of Dialog and Drawer', () => {
  const host = mount(() => h('div', [
    h(Dialog, { title: 'Dialog', closeLabel: 'Close', description: 'Dialog description' }),
    h(Drawer, { title: 'Drawer', closeLabel: 'Close', description: 'Drawer description' }),
  ]));
  const described = [...host.querySelectorAll('dialog')].map(dialog => document.getElementById(dialog.getAttribute('aria-describedby')!)?.textContent);
  expect(described).toEqual(['Dialog description', 'Drawer description']);
});

it('[TOOLTIP-01][TOOLTIP-02][overlays-14] one tab stop: the trigger keeps its own description first and the wrapper is not focusable', () => {
  const host = mount(() => h('div', [h('p', { id: 'own' }, 'Own'), h(Tooltip, { content: 'Saves the draft' }, () => h('button', { type: 'button', 'aria-describedby': 'own' }, 'Save'))]));
  const wrapper = host.querySelector('[data-hw=tooltip]')!; const tip = host.querySelector('[role=tooltip]')!;
  expect(wrapper.hasAttribute('tabindex')).toBe(false);
  expect(host.querySelectorAll('[tabindex]')).toHaveLength(0);
  expect(host.querySelector('button')!.getAttribute('aria-describedby')).toBe(`own ${tip.id}`);
});

it('[TOOLTIP-03][overlays-14] focus shows the tooltip, Escape hides it with focus kept on the trigger, blur hides it', async () => {
  const host = mount(() => h('div', [h(Tooltip, { content: 'Saves the draft' }, () => h('button', { type: 'button' }, 'Save')), h('button', { type: 'button', id: 'after' }, 'After')]));
  const trigger = host.querySelector('button')!; const tip = host.querySelector<HTMLElement>('[role=tooltip]')!;
  trigger.focus(); await nextTick(); expect(tip.hidden).toBe(false);
  const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
  trigger.dispatchEvent(escape); await nextTick();
  expect(tip.hidden).toBe(true); expect(escape.defaultPrevented).toBe(true); expect(document.activeElement).toBe(trigger);
  trigger.blur(); trigger.focus(); await nextTick(); expect(tip.hidden).toBe(false);
  host.querySelector<HTMLButtonElement>('#after')!.focus(); await nextTick(); expect(tip.hidden).toBe(true);
  vi.restoreAllMocks();
});
