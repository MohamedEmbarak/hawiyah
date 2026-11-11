import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createApp, h, nextTick } from 'vue';
import type { App } from 'vue';
import { Dialog } from '../src/interactive.js';
import { Drawer } from '../src/expansion-interactive.js';

const apps: App[] = [];
beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value() { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value() { this.open = false; this.dispatchEvent(new Event('close')); } });
});
afterEach(() => { apps.splice(0).forEach(app => app.unmount()); document.body.replaceChildren(); vi.restoreAllMocks(); });
async function dispatch(element: Element, type: string, outside = true) {
  element.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, clientX: outside ? 0 : 150, clientY: outside ? 0 : 150 })); await nextTick();
}
for (const Component of [Dialog, Drawer]) {
  it(`${Component.name} only dismisses gestures starting on backdrop and clears stale state`, async () => {
    const container = document.createElement('div'); document.body.append(container);
    let preventClick = false; let preventDown = false;
    const app = createApp({ render: () => h(Component, {
      title: 'Review', defaultOpen: true, closeLabel: 'Close',
      onClick: (event: MouseEvent) => { if (preventClick) event.preventDefault(); },
      onPointerdown: (event: PointerEvent) => { if (preventDown) event.preventDefault(); },
    }, { default: () => h('button', {}, 'Content'), trigger: ({ open }: { open: () => void }) => h('button', { onClick: open }, 'Open') }) });
    apps.push(app); app.mount(container); await nextTick();
    const dialog = container.querySelector('dialog')!;
    vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({ left: 100, top: 100, right: 400, bottom: 400 } as DOMRect);
    await dispatch(dialog.querySelector('.hw-dialog-body button')!, 'pointerdown', false); await dispatch(dialog, 'click'); expect(dialog.open).toBe(true);
    await dispatch(dialog, 'pointerdown'); await dispatch(dialog, 'pointercancel'); await dispatch(dialog, 'click'); expect(dialog.open).toBe(true);
    preventClick = true;
    await dispatch(dialog, 'pointerdown'); await dispatch(dialog, 'click');
    preventClick = false; await dispatch(dialog, 'click'); expect(dialog.open).toBe(true);
    preventDown = true;
    await dispatch(dialog, 'pointerdown'); await dispatch(dialog, 'click'); expect(dialog.open).toBe(true);
    preventDown = false;
    await dispatch(dialog, 'pointerdown'); dialog.close(); await nextTick();
    container.querySelector('button')!.click(); await nextTick();
    await dispatch(dialog, 'click'); expect(dialog.open).toBe(true);
    await dispatch(dialog, 'pointerdown'); await dispatch(dialog, 'click'); expect(dialog.open).toBe(false);
  });
}
