import { afterEach, expect, it, vi } from 'vitest';
import { createDialog } from '../src/dialog.js';
import { createDrawer } from '../src/disclosures.js';

afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks(); });
function dispatch(element: Element, type: string, outside = true) {
  element.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, clientX: outside ? 0 : 150, clientY: outside ? 0 : 150 }));
}
for (const create of [createDialog, createDrawer]) {
  it(`${create.name} resets canceled/prevented gestures and ignores content drags`, () => {
    const dialog = document.createElement('dialog'); dialog.innerHTML = '<button>Content</button>'; document.body.append(dialog);
    dialog.showModal = () => { dialog.open = true; };
    dialog.close = () => { dialog.open = false; dialog.dispatchEvent(new Event('close')); };
    vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({ left: 100, top: 100, right: 400, bottom: 400 } as DOMRect);
    let preventClick = false; let preventDown = false;
    dialog.addEventListener('click', event => { if (preventClick) event.preventDefault(); }, true);
    dialog.addEventListener('pointerdown', event => { if (preventDown) event.preventDefault(); }, true);
    const controller = create(dialog); controller.show();
    dispatch(dialog.querySelector('button')!, 'pointerdown', false); dispatch(dialog, 'click'); expect(dialog.open).toBe(true);
    dispatch(dialog, 'pointerdown'); dispatch(dialog, 'pointercancel'); dispatch(dialog, 'click'); expect(dialog.open).toBe(true);
    preventClick = true; dispatch(dialog, 'pointerdown'); dispatch(dialog, 'click');
    preventClick = false; dispatch(dialog, 'click'); expect(dialog.open).toBe(true);
    preventDown = true; dispatch(dialog, 'pointerdown'); dispatch(dialog, 'click'); expect(dialog.open).toBe(true);
    preventDown = false; dispatch(dialog, 'pointerdown'); controller.close(); controller.show(); dispatch(dialog, 'click'); expect(dialog.open).toBe(true);
    dispatch(dialog, 'pointerdown'); dispatch(dialog, 'click'); expect(dialog.open).toBe(false);
    controller.destroy();
  });
}
