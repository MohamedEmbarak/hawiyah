import '@angular/compiler';
import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import { HwDialogComponent, HwDrawerComponent } from '@hawiyah/angular';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value() { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value() { this.open = false; this.dispatchEvent(new Event('close')); } });
});
afterEach(() => { TestBed.resetTestingModule(); vi.restoreAllMocks(); });
function dispatch(element: Element, type: string, outside = true) {
  element.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, clientX: outside ? 0 : 150, clientY: outside ? 0 : 150 }));
}
for (const Component of [HwDialogComponent, HwDrawerComponent]) {
  it(`${Component.name} honors gesture origin, cancellation, consumer prevention and reopen`, () => {
    const fixture = TestBed.createComponent(Component); fixture.componentRef.setInput('title', 'Review'); fixture.componentRef.setInput('closeLabel', 'Close'); fixture.detectChanges();
    fixture.componentInstance.show(); fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({ left: 100, top: 100, right: 400, bottom: 400 } as DOMRect);
    let preventClick = false; let preventDown = false;
    dialog.addEventListener('click', event => { if (preventClick) event.preventDefault(); }, true);
    dialog.addEventListener('pointerdown', event => { if (preventDown) event.preventDefault(); }, true);
    dispatch(dialog.querySelector('.hw-dialog-body')!, 'pointerdown', false); dispatch(dialog, 'click'); expect(dialog.open).toBe(true);
    dispatch(dialog, 'pointerdown'); dispatch(dialog, 'pointercancel'); dispatch(dialog, 'click'); expect(dialog.open).toBe(true);
    preventClick = true; dispatch(dialog, 'pointerdown'); dispatch(dialog, 'click');
    preventClick = false; dispatch(dialog, 'click'); expect(dialog.open).toBe(true);
    preventDown = true; dispatch(dialog, 'pointerdown'); dispatch(dialog, 'click'); expect(dialog.open).toBe(true);
    preventDown = false; dispatch(dialog, 'pointerdown'); fixture.componentInstance.close(); fixture.componentInstance.show();
    dispatch(dialog, 'click'); expect(dialog.open).toBe(true);
    dispatch(dialog, 'pointerdown'); dispatch(dialog, 'click'); expect(dialog.open).toBe(false);
  });
}
