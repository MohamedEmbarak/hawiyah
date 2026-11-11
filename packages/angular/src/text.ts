import { hasText, requireText } from '@hawiyah/core';

declare const ngDevMode: unknown;
// Angular production builds define ngDevMode as false, which removes the report entirely.
const usable = (component: string, name: string, value: unknown, when?: string): boolean => typeof ngDevMode === 'undefined' || ngDevMode !== false ? requireText(component, name, value, when) : hasText(value);

/** Hawiyah ships no user-visible or accessible-name strings: the application supplies them.
 * A template asks here for the text it is about to render and receives null where a required
 * one is missing, so Angular writes no text and removes the attribute. The missing input is
 * reported once per component and input, in development only. */
export class HwTexts {
  constructor(private readonly component: string) {}
  /** A required string: `value` when it is usable text, otherwise null. */
  need(name: string, value: string | null | undefined, when?: string): string | null { return usable(this.component, name, value, when) ? value! : null; }
  /** A required templated text: what the application's function returns for `args`, otherwise null. */
  call<A extends unknown[]>(name: string, get: ((...args: A) => string) | null | undefined, args: A, when?: string): string | null { return usable(this.component, name, get, when) && typeof get === 'function' ? get(...args) || null : null; }
}
