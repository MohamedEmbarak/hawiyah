import { expect, it } from 'vitest';
import { formatNumber, formatDate, formatCalendarDate, getCalendarMonth, normalizeDigits, getCalendarDateParts } from '../src/index.js';

it('uses Latin digits even with Arabic locales and explicit alternative numbering preferences', () => {
  for (const locale of ['ar-SA', 'ar-SA-u-nu-arab', 'fa-IR']) {
    expect(formatNumber(1234.5, { locale, numberingSystem: 'arab' })).toBe('1,234.5');
    expect(formatDate('2026-10-28', { locale, year: 'numeric', month: '2-digit', day: '2-digit', numberingSystem: 'arab' })).not.toMatch(/[٠-٩۰-۹]/u);
    for (const calendar of ['gregory', 'islamic-umalqura'] as const) {
      expect(formatCalendarDate('2029-08-11', { locale, calendar, numberingSystem: 'arab' })).not.toMatch(/[٠-٩۰-۹]/u);
      const month = getCalendarMonth({ month: '2029-08-11', locale, calendar });
      expect(month.label).not.toMatch(/[٠-٩۰-۹]/u);
      expect(month.days.every(day => !day.label || /^[0-9]+$/.test(day.label))).toBe(true);
    }
  }
  expect(getCalendarDateParts('2029-08-11', 'islamic-umalqura')).toMatchObject({ year: 1451, month: 4, day: 1 });
  expect(normalizeDigits('١٢٣۴۵۶')).toBe('123456');
});
