import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Dialog } from './src/interactive.js';
import { Drawer } from './src/expanded-interactive.js';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const roots: ReturnType<typeof createRoot>[] = [];
beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value() { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value() { this.open = false; this.dispatchEvent(new Event('close')); } });
});
afterEach(async () => { for (const root of roots.splice(0)) await act(() => root.unmount()); document.body.replaceChildren(); vi.restoreAllMocks(); });
async function dispatch(element: Element, type: string, outside = true) {
  await act(() => element.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, clientX: outside ? 0 : 150, clientY: outside ? 0 : 150 })));
}
for (const Component of [Dialog, Drawer]) {
  it(`${Component.name} ignores content-to-backdrop drags and accepts a genuine backdrop gesture`, async () => {
    const container = document.createElement('div'); document.body.append(container);
    const root = createRoot(container); roots.push(root);
    await act(() => root.render(<Component title="Review" defaultOpen><button>Content</button></Component>));
    const dialog = container.querySelector('dialog')!;
    vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({ left: 100, top: 100, right: 400, bottom: 400 } as DOMRect);
    await dispatch(dialog.querySelector('.nq-dialog-body button')!, 'pointerdown', false);
    await dispatch(dialog, 'click');
    expect(dialog.open).toBe(true);
    await dispatch(dialog, 'pointerdown'); await dispatch(dialog, 'click');
    expect(dialog.open).toBe(false);
  });

  it(`${Component.name} resets canceled/prevented gestures and stale state across reopen`, async () => {
    const container = document.createElement('div'); document.body.append(container);
    const root = createRoot(container); roots.push(root);
    let preventClick = false; let preventDown = false;
    const canceled = vi.fn();
    await act(() => root.render(<Component title="Review" defaultOpen trigger={<button>Open</button>}
      onClick={event => { if (preventClick) event.preventDefault(); }}
      onPointerDown={event => { if (preventDown) event.preventDefault(); }} onPointerCancel={canceled}>Content</Component>));
    const dialog = container.querySelector('dialog')!;
    vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({ left: 100, top: 100, right: 400, bottom: 400 } as DOMRect);
    await dispatch(dialog, 'pointerdown'); await dispatch(dialog, 'pointercancel'); await dispatch(dialog, 'click');
    expect(dialog.open).toBe(true); expect(canceled).toHaveBeenCalledOnce();
    preventClick = true;
    await dispatch(dialog, 'pointerdown'); await dispatch(dialog, 'click');
    preventClick = false; await dispatch(dialog, 'click'); expect(dialog.open).toBe(true);
    preventDown = true;
    await dispatch(dialog, 'pointerdown'); await dispatch(dialog, 'click'); expect(dialog.open).toBe(true);
    preventDown = false;
    await dispatch(dialog, 'pointerdown'); await act(() => dialog.close());
    await act(() => container.querySelector('button')!.click());
    await dispatch(dialog, 'click'); expect(dialog.open).toBe(true);
    await dispatch(dialog, 'pointerdown'); await dispatch(dialog, 'click'); expect(dialog.open).toBe(false);
  });
}
