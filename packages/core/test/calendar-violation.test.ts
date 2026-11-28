import { expect, it } from 'vitest';
import { getDateViolation, UMALQURA_MAX_DATE, UMALQURA_MIN_DATE } from '../src/index.js';

it('[DATE-VIOLATION-01] names the first constraint a typed date violates, in one order', () => {
  expect(getDateViolation('', { calendar: 'gregory', min: '2026-01-01', isDateDisabled: () => true })).toBe('');
  expect(getDateViolation('2026-13-45', { calendar: 'gregory' })).toBe('invalid');
  expect(getDateViolation('28/10/2026', { calendar: 'islamic-umalqura' })).toBe('invalid');
  expect(getDateViolation('1900-01-01', { calendar: 'islamic-umalqura' })).toBe('unsupported');
  expect(getDateViolation('1900-01-01', { calendar: 'gregory' })).toBe('');
  expect(getDateViolation(UMALQURA_MIN_DATE, { calendar: 'islamic-umalqura' })).toBe('');
  expect(getDateViolation(UMALQURA_MAX_DATE, { calendar: 'islamic-umalqura' })).toBe('');
  expect(getDateViolation('2026-10-28', { calendar: 'gregory', min: '2026-11-01' })).toBe('invalid');
  expect(getDateViolation('2026-10-28', { calendar: 'gregory', max: '2026-10-01' })).toBe('invalid');
  expect(getDateViolation('2026-10-28', { calendar: 'gregory', min: '2026-10-28', max: '2026-10-28' })).toBe('');
  // Outside min and max and outside the Umm al-Qura range: the calendar's limit is reported.
  expect(getDateViolation('1900-01-01', { calendar: 'islamic-umalqura', min: '2026-01-01' })).toBe('unsupported');
  const friday = (value: string) => new Date(`${value}T00:00:00Z`).getUTCDay() === 5;
  expect(getDateViolation('2026-10-30', { calendar: 'gregory', isDateDisabled: friday })).toBe('unavailable');
  expect(getDateViolation('2026-10-28', { calendar: 'islamic-umalqura', isDateDisabled: friday })).toBe('');
  // A date outside the range is 'invalid' before the predicate is asked.
  expect(getDateViolation('2026-10-30', { calendar: 'gregory', max: '2026-10-01', isDateDisabled: friday })).toBe('invalid');
  expect(getDateViolation('2026-10-30', { calendar: 'gregory', isDateDisabled: () => 'yes' as unknown as boolean })).toBe('');
});
