// Imported by the Angular tests for its hooks: a test that leaves a required text
// unsupplied fails, unless it asks for the warnings because missing text is its subject.
import { resetTextWarnings } from '@hawiyah/core';
import { afterEach, beforeEach, expect } from 'vitest';

let warnings: string[] = [];
let checked = true;
let restore = () => {};
beforeEach(() => {
  resetTextWarnings(); warnings = []; checked = true;
  const warn = console.warn;
  console.warn = (...values: unknown[]) => { const message = values.map(String).join(' '); if (message.startsWith('Hawiyah:')) warnings.push(message); else warn(...values); };
  restore = () => { console.warn = warn; };
});
afterEach(() => { restore(); if (checked) expect(warnings, 'every required text is supplied').toEqual([]); });

/** The "Hawiyah:" warnings of the running test. Calling it turns off the check above. */
export function missingTextWarnings(): string[] { checked = false; return warnings; }

/** Sets every input of `inputs` on a component created directly by TestBed. Later setInput calls still win. */
export function supplyText(fixture: { componentRef: { setInput(name: string, value: unknown): void } }, inputs: Record<string, unknown>): void {
  for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
}
