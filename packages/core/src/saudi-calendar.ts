import { CalendarDate, GregorianCalendar, parseDate, type AnyCalendarDate, type Calendar } from '@internationalized/date';
import { UMALQURA_FIRST_YEAR, UMALQURA_LAST_YEAR, UMALQURA_MONTH_STARTS } from './ummalqura-data.js';

export const UMALQURA_MIN_DATE = '1924-08-01';
export const UMALQURA_MAX_DATE = '2077-11-16';
export interface CalendarDateParts { year: number; month: number; day: number }

/** Pinned published Saudi reference table. Never falls back to civil arithmetic. */
export class SaudiUmalquraCalendar implements Calendar {
  readonly identifier = 'islamic-umalqura' as const;
  private index(date: Pick<AnyCalendarDate, 'year' | 'month'>): number {
    if (!Number.isInteger(date.year) || date.year < UMALQURA_FIRST_YEAR || date.year > UMALQURA_LAST_YEAR || !Number.isInteger(date.month) || date.month < 1 || date.month > 12) throw new RangeError('Hawiyah: Umm al-Qura supports AH 1343–1500 only.');
    return (date.year - UMALQURA_FIRST_YEAR) * 12 + date.month - 1;
  }
  fromJulianDay(julianDay: number): CalendarDate {
    if (!Number.isInteger(julianDay) || julianDay < UMALQURA_MONTH_STARTS[0]! || julianDay >= UMALQURA_MONTH_STARTS.at(-1)!) throw new RangeError('Hawiyah: date is outside the supported Saudi Umm al-Qura table.');
    let low = 0; let high = UMALQURA_MONTH_STARTS.length - 2;
    while (low <= high) { const middle = Math.floor((low + high) / 2); if (julianDay < UMALQURA_MONTH_STARTS[middle]!) high = middle - 1; else if (julianDay >= UMALQURA_MONTH_STARTS[middle + 1]!) low = middle + 1; else return new CalendarDate(this, UMALQURA_FIRST_YEAR + Math.floor(middle / 12), middle % 12 + 1, julianDay - UMALQURA_MONTH_STARTS[middle]! + 1); }
    throw new RangeError('Hawiyah: invalid Umm al-Qura table lookup.');
  }
  toJulianDay(date: Pick<AnyCalendarDate, 'year' | 'month' | 'day'>): number {
    const index = this.index(date);
    if (!Number.isInteger(date.day) || date.day < 1 || date.day > this.getDaysInMonth(date)) throw new RangeError('Hawiyah: invalid Umm al-Qura day.');
    return UMALQURA_MONTH_STARTS[index]! + date.day - 1;
  }
  getDaysInMonth(date: Pick<AnyCalendarDate, 'year' | 'month'>): number { const index = this.index(date); return UMALQURA_MONTH_STARTS[index + 1]! - UMALQURA_MONTH_STARTS[index]!; }
  getDaysInYear(date: AnyCalendarDate): number { const index = this.index({ year: date.year, month: 1 }); return UMALQURA_MONTH_STARTS[index + 12]! - UMALQURA_MONTH_STARTS[index]!; }
  getMonthsInYear(): number { return 12; }
  getMaximumMonthsInYear(): number { return 12; }
  // Historical official records include 28- and 31-day months.
  getMaximumDaysInMonth(): number { return 31; }
  getYearsInEra(): number { return UMALQURA_LAST_YEAR; }
  getEras(): string[] { return ['AH']; }
}

export function getCalendarDateParts(value: string, calendar: 'gregory' | 'islamic-umalqura' = 'gregory'): CalendarDateParts {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) throw new RangeError('Hawiyah: dates must use Gregorian YYYY-MM-DD.');
  const gregorian = parseDate(value);
  if (gregorian.toString() !== value) throw new RangeError('Hawiyah: Gregorian date is outside years 1–9999.');
  const date = calendar === 'gregory' ? gregorian : new SaudiUmalquraCalendar().fromJulianDay(gregorian.calendar.toJulianDay(gregorian));
  return { year: date.year, month: date.month, day: date.day };
}

export function convertCalendarDate(parts: CalendarDateParts, calendar: 'gregory' | 'islamic-umalqura' = 'gregory'): string {
  if (![parts.year, parts.month, parts.day].every(Number.isInteger)) throw new RangeError('Hawiyah: date parts must be integers.');
  if (calendar === 'gregory') {
    const value = `${String(parts.year).padStart(4, '0')}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
    getCalendarDateParts(value); return value;
  }
  const provider = new SaudiUmalquraCalendar();
  const julianDay = provider.toJulianDay(parts);
  return new GregorianCalendar().fromJulianDay(julianDay).toString();
}

export function isCalendarDateSupported(value: string, calendar: 'gregory' | 'islamic-umalqura' = 'gregory'): boolean {
  try { getCalendarDateParts(value, calendar); return true; } catch { return false; }
}
