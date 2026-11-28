import { hasText, requireText } from '@hawiyah/core';

declare const ngDevMode: unknown;
// Angular production builds define ngDevMode as false, which removes the report entirely.
const usable = (component: string, name: string, value: unknown, when?: string): boolean => typeof ngDevMode === 'undefined' || ngDevMode !== false ? requireText(component, name, value, when) : hasText(value);

/** Hawiyah ships no user-visible or accessible-name strings: the application supplies them.
 * A template asks here for the text it is about to render and receives null where a required
 * one is missing, so Angular writes no text and removes the attribute. The missing input is
 * reported once per component and input, in development only. */
/** Development only, after the first render in a browser: a brand that is artwork alone needs
 * `brandLabel` unless the artwork already carries text, an accessible name or an image alt. */
export function reportUnnamedBrand(component: string, brand: Element | null | undefined): void {
  if (!brand || (typeof ngDevMode !== 'undefined' && ngDevMode === false)) return;
  if (brand.textContent?.trim() || brand.matches('[aria-label], [aria-labelledby]') || brand.querySelector('[aria-label], [aria-labelledby], img[alt]:not([alt=""])')) return;
  requireText(component, 'brandLabel', '', 'the brand has no text');
}

export class HwTexts {
  constructor(private readonly component: string) {}
  /** A required string: `value` when it is usable text, otherwise null. */
  need(name: string, value: string | null | undefined, when?: string): string | null { return usable(this.component, name, value, when) ? value! : null; }
  /** Whether a required text or text function was supplied, without rendering it. A missing one is reported like the others. */
  has(name: string, value: unknown, when?: string): boolean { return usable(this.component, name, value, when); }
  /** A required templated text: what the application's function returns for `args`, otherwise null. */
  call<A extends unknown[]>(name: string, get: ((...args: A) => string) | null | undefined, args: A, when?: string): string | null { return usable(this.component, name, get, when) && typeof get === 'function' ? get(...args) || null : null; }
}
