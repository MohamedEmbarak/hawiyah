import { createCleanup, isDisabled, restoreFocus } from '@hawiyah/core';
import { emit, eventElement } from './dom.js';

export interface DialogOptions {
  closeOnBackdrop?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface DialogController {
  readonly open: boolean;
  show(trigger?: HTMLElement): void;
  close(returnValue?: string): void;
  destroy(): void;
}

/** Uses native modal focus containment and the browser's top layer. */
export function createDialog(dialog: HTMLDialogElement, options: DialogOptions = {}): DialogController {
  if (dialog.localName !== 'dialog') throw new Error('Hawiyah: createDialog requires a native dialog element.');
  const scope = createCleanup();
  let trigger: HTMLElement | null = null;
  let openedHere = false;
  let notifiedOpen = dialog.open;
  let backdropStarted = false;
  const notify = () => {
    if (notifiedOpen === dialog.open) return;
    notifiedOpen = dialog.open;
    emit(dialog, { open: dialog.open });
    options.onOpenChange?.(dialog.open);
  };
  const finishClose = () => {
    if (dialog.open) return;
    backdropStarted = false;
    openedHere = false;
    notify();
    const previous = trigger;
    trigger = null;
    restoreFocus(previous);
  };
  const close = (returnValue?: string) => {
    if (scope.destroyed || !dialog.open) return;
    backdropStarted = false;
    dialog.close(returnValue);
    finishClose();
  };
  const show = (opener?: HTMLElement) => {
    if (scope.destroyed || dialog.open) return;
    backdropStarted = false;
    if (typeof dialog.showModal !== 'function') throw new Error('Hawiyah: this browser must support HTMLDialogElement.showModal().');
    const active = dialog.ownerDocument.activeElement;
    const candidate = opener ?? (active && 'focus' in active ? active as HTMLElement : null);
    dialog.showModal();
    trigger = candidate;
    openedHere = true;
    notify();
  };
  scope.listen(dialog.ownerDocument, 'click', event => {
    const opener = eventElement(event)?.closest<HTMLElement>('[data-hw-dialog-open]');
    if (!opener || !dialog.id || opener.dataset.hwDialogOpen !== dialog.id || isDisabled(opener)) return;
    event.preventDefault(); show(opener);
  });
  scope.listen(dialog, 'click', event => {
    const started = backdropStarted; backdropStarted = false;
    if (event.defaultPrevented) return;
    const closer = eventElement(event)?.closest<HTMLElement>('[data-hw-dialog-close]');
    if (closer && closer.closest('dialog') === dialog && !isDisabled(closer)) {
      event.preventDefault(); close(closer.dataset.hwDialogClose); return;
    }
    const pointer = event as MouseEvent;
    const rect = dialog.getBoundingClientRect();
    const outside = pointer.clientX < rect.left || pointer.clientX > rect.right || pointer.clientY < rect.top || pointer.clientY > rect.bottom;
    if (options.closeOnBackdrop !== false && event.target === dialog && started && outside) close();
  });
  scope.listen(dialog, 'pointerdown', event => {
    const pointer = event as PointerEvent;
    const rect = dialog.getBoundingClientRect();
    backdropStarted = !event.defaultPrevented && pointer.button === 0 && event.target === dialog && (pointer.clientX < rect.left || pointer.clientX > rect.right || pointer.clientY < rect.top || pointer.clientY > rect.bottom);
  });
  scope.listen(dialog, 'pointercancel', () => { backdropStarted = false; });
  scope.listen(dialog, 'cancel', () => { backdropStarted = false; });
  scope.listen(dialog, 'close', finishClose);
  // Escape's native cancel default and method="dialog" form submission both emit close.
  return {
    get open() { return dialog.open; }, show, close,
    destroy() {
      if (scope.destroyed) return;
      if (openedHere && dialog.open) close();
      scope.destroy();
      trigger = null;
    },
  };
}
