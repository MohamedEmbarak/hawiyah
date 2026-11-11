import { isPlatformBrowser } from '@angular/common';
import { EventEmitter, inject, PLATFORM_ID } from '@angular/core';

/** Call in an injection context. Server rendering stays declarative: measurement, motion,
 * document listeners and choice guards start only in the browser, during hydration. */
export function injectIsBrowser(): boolean { return isPlatformBrowser(inject(PLATFORM_ID)); }

/** Constraint validation exists only in browsers; a server DOM has no setCustomValidity. */
export function setCustomValidity(element: HTMLInputElement | undefined, message: string): void {
  if (typeof element?.setCustomValidity === 'function') element.setCustomValidity(message);
}

/** Validation never depends on text: a constraint whose message the application did not
 * supply still blocks submission, with a single space as its custom validity. */
export function setConstraintValidity(element: HTMLInputElement | undefined, violated: boolean, message: string | null | undefined): void {
  setCustomValidity(element, violated ? message?.trim() ? message : ' ' : '');
}

/** Angular output subscriptions are independent of component inputs. Notify the
 * template when their presence changes, including an imperative unsubscription. */
export class HwObservedEmitter<T> extends EventEmitter<T> {
  constructor(private readonly changed: (observed: boolean) => void) { super(); }
  override subscribe(...args: Parameters<EventEmitter<T>['subscribe']>) {
    const subscription = super.subscribe(...args);
    this.changed(this.observed);
    subscription.add(() => this.changed(this.observed));
    return subscription;
  }
}
