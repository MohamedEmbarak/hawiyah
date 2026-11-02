import { GregorianCalendar, parseDate, startOfMonth, today, toCalendar, type CalendarDate } from '@internationalized/date';
import { convertCalendarDate, getCalendarDateParts, isCalendarDateSupported, SaudiUmalquraCalendar, UMALQURA_MAX_DATE, UMALQURA_MIN_DATE } from './saudi-calendar.js';

export type CalendarSystem = 'gregory' | 'islamic-umalqura';
export interface CalendarDay {
  value: string;
  label: string;
  disabled: boolean;
  outside: boolean;
  selected: boolean;
  today: boolean;
}
export interface CalendarMonthOptions {
  month?: string;
  value?: string;
  min?: string;
  max?: string;
  locale?: string;
  calendar?: CalendarSystem;
  weekStartsOn?: number;
}
export interface CalendarMonth {
  label: string;
  weekdays: string[];
  days: CalendarDay[];
  previous: string;
  next: string;
}

export interface CalendarDateFormatOptions extends Pick<Intl.DateTimeFormatOptions, 'weekday' | 'era' | 'year' | 'month' | 'day' | 'dateStyle' | 'numberingSystem'> {
  locale?: string;
  calendar?: CalendarSystem;
}

/** Canonical date-only formatting using the same numeric fields as the picker. */
export function formatCalendarDate(value: string, options: CalendarDateFormatOptions = {}): string {
  const { locale = 'ar-SA', calendar = 'gregory', ...requested } = options;
  const fields = getCalendarDateParts(value, calendar);
  const format = Object.keys(requested).some(key => ['dateStyle', 'year', 'month', 'day', 'weekday', 'era'].includes(key)) ? requested : { ...requested, year: 'numeric' as const, month: 'long' as const, day: 'numeric' as const };
  const formatter = new Intl.DateTimeFormat(locale, { ...format, calendar, timeZone: 'UTC', numberingSystem: 'latn' });
  if (calendar === 'gregory') return formatter.format(date(value).toDate('UTC'));
  // AH1447 agrees with the pinned reference and ICU. Use its localized skeleton,
  // month names and era only, replacing every numeric field from the reference.
  const reference = convertCalendarDate({ year: 1447, month: fields.month, day: 5 }, calendar);
  return formatter.formatToParts(date(reference).toDate('UTC')).map(part => {
    if (part.type === 'weekday') return new Intl.DateTimeFormat(locale, { weekday: format.weekday ?? 'long', timeZone: 'UTC' }).format(date(value).toDate('UTC'));
    const digitCount = [...part.value].filter(character => /\p{Decimal_Number}/u.test(character)).length;
    if (!digitCount || (part.type === 'month' && !/^[\p{Decimal_Number}\u200e\u200f]+$/u.test(part.value))) return part.value;
    let number: number;
    if (part.type === 'day') number = fields.day;
    else if (part.type === 'month') number = fields.month;
    else if (part.type === 'year') number = digitCount === 2 ? fields.year % 100 : fields.year;
    else return part.value;
    return new Intl.NumberFormat(locale, { numberingSystem: 'latn', useGrouping: false, minimumIntegerDigits: digitCount === 2 ? 2 : 1 }).format(number);
  }).join('');
}

function date(value: string): CalendarDate {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) throw new RangeError('Nasaq: dates must use Gregorian YYYY-MM-DD.');
  const parsed = parseDate(value);
  if (parsed.toString() !== value) throw new RangeError('Nasaq: Gregorian date is outside the supported range.');
  return parsed;
}
function iso(value: CalendarDate): string { return toCalendar(value, new GregorianCalendar()).toString(); }

export function isDateInRange(value: string, min?: string, max?: string): boolean {
  try {
    const candidate = date(value);
    const lower = min ? date(min) : undefined;
    const upper = max ? date(max) : undefined;
    return (!lower || candidate.compare(lower) >= 0) && (!upper || candidate.compare(upper) <= 0);
  } catch { return false; }
}

export function moveCalendarDate(value: string, amount: number, unit: 'day' | 'month' | 'year', calendar: CalendarSystem = 'gregory'): string {
  if (!Number.isInteger(amount)) throw new RangeError('Nasaq: calendar movement must be an integer.');
  const current = toCalendar(date(value), calendar === 'gregory' ? new GregorianCalendar() : new SaudiUmalquraCalendar());
  if (unit === 'day') { const result = date(value).add({ days: amount }).toString(); if (!isCalendarDateSupported(result, calendar)) throw new RangeError('Nasaq: calendar movement is outside the supported range.'); return result; }
  if (calendar === 'islamic-umalqura') {
    const targetMonth = (current.year - 1343) * 12 + current.month - 1 + (unit === 'month' ? amount : amount * 12);
    if (targetMonth < 0 || targetMonth >= 158 * 12) throw new RangeError('Nasaq: calendar movement is outside AH 1343–1500.');
  } else {
    const targetMonth = (current.year - 1) * 12 + current.month - 1 + (unit === 'month' ? amount : amount * 12);
    if (targetMonth < 0 || targetMonth >= 9999 * 12) throw new RangeError('Nasaq: Gregorian movement is outside years 1–9999.');
  }
  const duration = unit === 'month' ? { months: amount } : { years: amount };
  return iso(current.add(duration));
}

export function getCalendarMonth(options: CalendarMonthOptions = {}): CalendarMonth {
  const { locale = 'ar-SA', calendar = 'gregory', weekStartsOn = 0 } = options;
  if (!Number.isInteger(weekStartsOn) || weekStartsOn < 0 || weekStartsOn > 6) throw new RangeError('Nasaq: weekStartsOn must be 0 through 6.');
  const system = calendar === 'gregory' ? new GregorianCalendar() : new SaudiUmalquraCalendar();
  const currentDay = today('Asia/Riyadh');
  let anchor = iso(date(options.month || options.value || iso(currentDay)));
  if (calendar === 'islamic-umalqura') anchor = anchor < UMALQURA_MIN_DATE ? UMALQURA_MIN_DATE : anchor > UMALQURA_MAX_DATE ? UMALQURA_MAX_DATE : anchor;
  const first = startOfMonth(toCalendar(date(anchor), system));
  const offset = (first.toDate('UTC').getUTCDay() - weekStartsOn + 7) % 7;
  const start = date(iso(first)).subtract({ days: offset });
  const count = Math.ceil((offset + system.getDaysInMonth(first)) / 7) * 7;
  const number = new Intl.NumberFormat(locale, { useGrouping: false, numberingSystem: 'latn' });
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });
  const baseSunday = parseDate('2024-01-07');
  // Intl supplies translated month names only. Numeric Hijri fields always come
  // from the Saudi table, since ICU disagrees with historical/future table dates.
  const nameAnchor = calendar === 'gregory' ? first.toDate('UTC') : parseDate(convertCalendarDate({ year: 1447, month: first.month, day: 15 }, calendar)).toDate('UTC');
  const monthName = new Intl.DateTimeFormat(locale, { month: 'long', calendar, timeZone: 'UTC' }).format(nameAnchor);
  const label = `${monthName} ${number.format(first.year)}${calendar === 'islamic-umalqura' ? locale.startsWith('ar') ? ' هـ' : ' AH' : ''}`;
  const adjacent = (amount: number) => { try { return moveCalendarDate(iso(first), amount, 'month', calendar); } catch { return iso(first); } };
  return {
    label,
    weekdays: Array.from({ length: 7 }, (_, index) => weekday.format(baseSunday.add({ days: (weekStartsOn + index) % 7 }).toDate('UTC'))),
    days: Array.from({ length: count }, (_, index) => {
      const gregorian = start.add({ days: index });
      const value = gregorian.toString();
      if (!isCalendarDateSupported(value, calendar)) return { value, label: '', disabled: true, outside: true, selected: false, today: false };
      const day = toCalendar(gregorian, system);
      return {
        value, label: number.format(day.day), disabled: !isDateInRange(value, options.min, options.max),
        outside: day.month !== first.month || day.year !== first.year || day.era !== first.era,
        selected: value === options.value, today: value === iso(currentDay),
      };
    }),
    previous: adjacent(-1),
    next: adjacent(1),
  };
}
