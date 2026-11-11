import { describe, expect, it } from 'vitest';
import { clampRange, convertCalendarDate, formatCalendarDate, getCalendarDateParts, getCalendarMonth, isCalendarDateSupported, isDateInRange, moveCalendarDate, normalizeDigits, sortRows, UMALQURA_MAX_DATE, UMALQURA_MIN_DATE } from '../src/index.js';

describe('expanded shared controls', () => {
  it('normalizes both Arabic digit sets without changing other characters', () => {
    expect(normalizeDigits('Code ٠١٢٣٤٥٦٧٨٩ / ۰۱۲۳۴۵۶۷۸۹')).toBe('Code 0123456789 / 0123456789');
  });
  it('constrains the moved range thumb and handles invalid bounds explicitly', () => {
    expect(clampRange([90, 40], 0, 100, 'lower')).toEqual([40, 40]);
    expect(clampRange([80, 20], 0, 100, 'upper')).toEqual([80, 80]);
    expect(clampRange([-10, 500], 0, 100, 'upper')).toEqual([0, 100]);
    expect(() => clampRange([1, 2], 10, 0, 'lower')).toThrow(RangeError);
  });
  it('sorts numeric and localized strings stably without mutating rows', () => {
    const rows = [{ id: 1, value: 'Item 10' }, { id: 2, value: 'Item 2' }, { id: 3, value: 'item 2' }];
    expect(sortRows(rows, 'value', 'ascending', 'en').map(row => row.id)).toEqual([2, 3, 1]);
    expect(rows.map(row => row.id)).toEqual([1, 2, 3]);
    expect(sortRows([{ value: null }, { value: 1 }, { value: 3 }], 'value', 'descending', 'ar-SA')).toEqual([{ value: 3 }, { value: 1 }, { value: null }]);
  });
});

describe('bounded calendar math and canonical formatting', () => {
  it('rejects impossible dates and unsupported Hijri conversions without fallback', () => {
    expect(isDateInRange('2025-02-29')).toBe(false);
    expect(isDateInRange('2024-02-29', '2024-02-01', '2024-02-29')).toBe(true);
    expect(isDateInRange('2024-2-29')).toBe(false);
    expect(isDateInRange('0000-01-01')).toBe(false);
    expect(() => convertCalendarDate({ year: 0, month: 1, day: 1 })).toThrow(RangeError);
    expect(isCalendarDateSupported('1800-01-01', 'islamic-umalqura')).toBe(false);
    expect(() => getCalendarDateParts('1800-01-01', 'islamic-umalqura')).toThrow(RangeError);
    expect(() => moveCalendarDate(UMALQURA_MIN_DATE, -1, 'day', 'islamic-umalqura')).toThrow(RangeError);
    expect(() => moveCalendarDate(UMALQURA_MAX_DATE, 1, 'month', 'islamic-umalqura')).toThrow(RangeError);
  });
  it('uses display-calendar month lengths, including historical 28- and 31-day records', () => {
    expect(moveCalendarDate('2024-01-31', 1, 'month')).toBe('2024-02-29');
    const previous = convertCalendarDate({ year: 1343, month: 8, day: 30 }, 'islamic-umalqura');
    const next = moveCalendarDate(previous, 1, 'month', 'islamic-umalqura');
    expect(getCalendarDateParts(next, 'islamic-umalqura')).toEqual({ year: 1343, month: 9, day: 28 });
    expect(convertCalendarDate({ year: 1345, month: 5, day: 31 }, 'islamic-umalqura')).toBe('1926-12-06');
    expect(() => convertCalendarDate({ year: 1343, month: 9, day: 29 }, 'islamic-umalqura')).toThrow(RangeError);
  });
  it('keeps a complete seven-day grid and blanks unsupported boundary spillover', () => {
    const first = getCalendarMonth({ month: '1800-01-01', calendar: 'islamic-umalqura', locale: 'en', weekStartsOn: 1 });
    expect(first.previous).toBe(UMALQURA_MIN_DATE);
    expect(first.days.length % 7).toBe(0);
    expect(first.weekdays[0]).toBe('Mon');
    expect(first.days.filter(day => day.value < UMALQURA_MIN_DATE).every(day => day.disabled && day.label === '')).toBe(true);
    const last = getCalendarMonth({ month: '2100-01-01', calendar: 'islamic-umalqura', locale: 'en' });
    expect(last.next).toBe(last.days.find(day => !day.outside)?.value);
    expect(last.days.filter(day => day.value > UMALQURA_MAX_DATE).every(day => day.disabled && day.label === '')).toBe(true);
  });
  it('formats canonical Hijri numbers from the reference rather than host ICU', () => {
    expect(formatCalendarDate('2029-08-11', { calendar: 'islamic-umalqura', locale: 'en-GB', year: 'numeric', month: '2-digit', day: '2-digit' })).toBe('01/04/1451 AH');
    expect(formatCalendarDate('2029-08-11', { calendar: 'islamic-umalqura', locale: 'ar-SA', numberingSystem: 'latn' })).toContain('1451');
    expect(formatCalendarDate('2029-08-11', { calendar: 'islamic-umalqura', locale: 'en', numberingSystem: 'deva' })).toContain('1451');
    expect(() => formatCalendarDate('1800-01-01', { calendar: 'islamic-umalqura', locale: 'en' })).toThrow(RangeError);
  });
});
