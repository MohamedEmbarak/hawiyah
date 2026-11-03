import { expect, it } from 'vitest';
import { normalizeRatingMax, normalizeRatingValue } from '../packages/core/src/rating';

it('bounds rating capacity and recovers from nonfinite data without allocating unbounded stars', () => {
  expect(normalizeRatingMax()).toBe(5);
  for (const value of [NaN, Infinity, -Infinity]) expect(normalizeRatingMax(value)).toBe(5);
  expect(normalizeRatingMax(-10)).toBe(1);
  expect(normalizeRatingMax(4.9)).toBe(4);
  expect(normalizeRatingMax(500000)).toBe(20);
});
it('preserves fractional scores while rejecting invalid and out-of-range values', () => {
  expect(normalizeRatingValue(3.5, 5)).toBe(3.5);
  expect(normalizeRatingValue(0.25, 5)).toBe(.25);
  expect(normalizeRatingValue(7, 5)).toBe(5);
  expect(normalizeRatingValue(-2, 5)).toBe(0);
  for (const value of [NaN, Infinity, -Infinity]) expect(normalizeRatingValue(value, 5)).toBe(0);
});
