import { afterEveryRender, DestroyRef, ElementRef, inject } from '@angular/core';
import { observeReadonlyChoice, observeFieldValue, type FieldValueElement, type FieldValueObserver } from '@nasaq/core';

/** Share value-presence tracking with projected native inputs; Angular owns rendering. */
export function observeAngularFieldPresence(): void {
  const host: HTMLElement = inject(ElementRef).nativeElement;
  const fields = new Map<FieldValueElement, FieldValueObserver>();
  afterEveryRender(() => {
    for (const [element, observer] of fields) if (!host.contains(element)) { observer.destroy(); fields.delete(element); }
    for (const element of host.querySelectorAll<FieldValueElement>('input.nq-input, textarea.nq-textarea, select.nq-select, input.nq-checkbox, input.nq-radio, input.nq-switch')) {
      if (!fields.has(element)) fields.set(element, element.matches('.nq-checkbox, .nq-radio, .nq-switch') ? observeReadonlyChoice(element as HTMLInputElement) : observeFieldValue(element));
      fields.get(element)!.refresh();
    }
  });
  inject(DestroyRef).onDestroy(() => { for (const observer of fields.values()) observer.destroy(); fields.clear(); });
}
