// Type fixture for required-locale.test.ts. It is compiled, never run: every call marked
// with @ts-expect-error must be rejected by the compiler (an unused marker is itself an
// error), and every unmarked call must compile.
import { formatCalendarDate, formatDate, formatNumber, getCalendarMonth, sortRows, type DateFormatOptions, type NumberFormatOptions } from '../../src/index.js';

const rows = [{ value: 'b' }, { value: 'a' }];

formatNumber(1, { locale: 'ar-SA' });
formatNumber(1, { locale: ['ar-SA', 'en'], maximumFractionDigits: 1 });
formatDate(0, { locale: 'ar-SA' });
formatDate(0, { locale: 'en-GB', calendar: 'islamic-umalqura', timeZone: 'UTC' });
sortRows(rows, 'value', 'ascending', 'ar-SA');
sortRows(rows, 'value', 'descending', ['ar-SA', 'en']);
getCalendarMonth({ locale: 'ar-SA' });
formatCalendarDate('2026-01-01', { locale: 'ar-SA' });

// @ts-expect-error formatNumber has no default options.
formatNumber(1);
// @ts-expect-error locale is required.
formatNumber(1, {});
// @ts-expect-error locale is required beside other options.
formatNumber(1, { maximumFractionDigits: 1 });
// @ts-expect-error undefined is not a locale.
formatNumber(1, { locale: undefined });
// @ts-expect-error formatDate has no default options.
formatDate(0);
// @ts-expect-error locale is required.
formatDate(0, {});
// @ts-expect-error a time zone and a calendar are not a locale.
formatDate(0, { calendar: 'gregory', timeZone: 'Asia/Riyadh' });
// @ts-expect-error sortRows has no default locale.
sortRows(rows, 'value', 'ascending');
// @ts-expect-error undefined is not a locale.
sortRows(rows, 'value', 'ascending', undefined);
// @ts-expect-error locale is required.
getCalendarMonth({});
// @ts-expect-error locale is required.
formatCalendarDate('2026-01-01', {});
// @ts-expect-error locale is required in the options type.
const numberOptions: NumberFormatOptions = {};
// @ts-expect-error locale is required in the options type.
const dateOptions: DateFormatOptions = { timeZone: 'UTC' };

export { numberOptions, dateOptions };
