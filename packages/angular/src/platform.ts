import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';

/** Call in an injection context. Server rendering stays declarative: measurement, motion,
 * document listeners and choice guards start only in the browser, during hydration. */
export function injectIsBrowser(): boolean { return isPlatformBrowser(inject(PLATFORM_ID)); }

/** Constraint validation exists only in browsers; a server DOM has no setCustomValidity. */
export function setCustomValidity(element: HTMLInputElement | undefined, message: string): void {
  if (typeof element?.setCustomValidity === 'function') element.setCustomValidity(message);
}
