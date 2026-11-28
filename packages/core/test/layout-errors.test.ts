// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { layoutStyles, type LayoutProps } from '../src/layout.js';

// Developer diagnostics stay in English and carry the "Hawiyah:" prefix.
describe('layout errors', () => {
  const cases: Array<[string, LayoutProps, ErrorConstructor]> = [
    ['an empty CSS length', { maxWidth: ' ' }, TypeError],
    ['a spacing number outside the token scale', { gap: 17 }, RangeError],
    ['a column count below one', { columns: 0 }, RangeError],
    ['a ratio that is not positive', { ratio: 0 }, RangeError],
  ];
  for (const [name, props, type] of cases) it(`reports ${name} with the Hawiyah prefix`, () => {
    expect(() => layoutStyles(props)).toThrow(type);
    expect(() => layoutStyles(props)).toThrow(/^Hawiyah: Layout /);
  });
});
