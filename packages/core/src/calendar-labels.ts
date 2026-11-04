import { UMALQURA_MAX_DATE, UMALQURA_MIN_DATE } from './saudi-calendar.js';

const labels = {
  ar: Object.freeze({
    calendar: 'التقويم', date: 'التاريخ', choose: 'اختر التاريخ',
    previous: 'الشهر السابق', next: 'الشهر التالي',
    open: 'فتح التقويم', close: 'إغلاق التقويم', system: 'نظام التقويم',
    gregorian: 'ميلادي', hijri: 'هجري · أم القرى', range: 'التواريخ الهجرية المدعومة',
    invalid: 'أدخل تاريخًا ميلاديًا متاحًا بصيغة YYYY-MM-DD.',
    unavailable: 'هذا التاريخ غير متاح.',
    unsupported: `يدعم تقويم أم القرى التواريخ من ${UMALQURA_MIN_DATE} إلى ${UMALQURA_MAX_DATE}. تبقى القيمة الميلادية بصيغة ISO دون تغيير.`,
  }),
  en: Object.freeze({
    calendar: 'Calendar', date: 'Date', choose: 'Choose date',
    previous: 'Previous month', next: 'Next month',
    open: 'Open calendar', close: 'Close calendar', system: 'Calendar system',
    gregorian: 'Gregorian', hijri: 'Hijri · Umm al-Qura', range: 'Supported Hijri dates',
    invalid: 'Enter an available Gregorian date in YYYY-MM-DD format.',
    unavailable: 'This date is unavailable.',
    unsupported: `Umm al-Qura is available from ${UMALQURA_MIN_DATE} through ${UMALQURA_MAX_DATE}. The selected ISO date is unchanged.`,
  }),
} as const;

/** UI copy for the two supported guide languages. Day formatting uses its own locale. */
export function getCalendarLabels(locale = 'ar-SA') {
  return /^ar(?:-|$)/i.test(locale) ? labels.ar : labels.en;
}
