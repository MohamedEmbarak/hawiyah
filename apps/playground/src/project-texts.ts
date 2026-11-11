import {UMALQURA_MAX_DATE, UMALQURA_MIN_DATE} from '@hawiyah/core';
import type {Locale} from './data';

/*
 * The application's own texts for the editor projects and live demos. The
 * packages hold no wording; each example passes these, in its language, under
 * the same input names in vanilla, React, Vue and Angular.
 */
export type TextSyntax = 'react' | 'vue' | 'angular';
type Texts = Record<string, string>;

/** Locale for formatting, sorting and calendars in each guide language. */
export const projectLocale = (locale: Locale) => locale === 'ar' ? 'ar-SA' : 'en';

const kebab = (name: string) => name.replace(/[A-Z]/g, letter => '-' + letter.toLowerCase());
const attribute = (value: string) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');

/** Static text attributes for a framework template: camelCase, or kebab-case in Vue. */
export function textAttributes(texts: Texts, syntax: TextSyntax) {
  return Object.entries(texts).map(([name, value]) => `${syntax === 'vue' ? kebab(name) : name}="${attribute(value)}"`).join(' ');
}
/** The same texts as vanilla data attributes. */
export function textDataAttributes(texts: Texts) {
  return Object.entries(texts).map(([name, value]) => `data-hw-${kebab(name)}="${attribute(value)}"`).join(' ');
}

const pick = <T>(locale: Locale, en: T, ar: T) => locale === 'ar' ? ar : en;

/** Former calendar wording (packages/core calendar-labels before 0.3.0). */
export function calendarTexts(locale: Locale) {
  return pick(locale, {
    label: 'Calendar', date: 'Date', calendarLabel: 'Choose date',
    previousLabel: 'Previous month', nextLabel: 'Next month',
    openLabel: 'Open calendar', closeLabel: 'Close calendar', calendarSystemLabel: 'Calendar system',
    gregorianLabel: 'Gregorian', hijriLabel: 'Hijri · Umm al-Qura', rangeLabel: 'Supported Hijri dates',
    invalidMessage: 'Enter an available Gregorian date in YYYY-MM-DD format.',
    unavailableMessage: 'This date is unavailable.',
    unsupportedMessage: `Umm al-Qura is available from ${UMALQURA_MIN_DATE} through ${UMALQURA_MAX_DATE}. The selected ISO date is unchanged.`,
  }, {
    label: 'التقويم', date: 'التاريخ', calendarLabel: 'اختر التاريخ',
    previousLabel: 'الشهر السابق', nextLabel: 'الشهر التالي',
    openLabel: 'فتح التقويم', closeLabel: 'إغلاق التقويم', calendarSystemLabel: 'نظام التقويم',
    gregorianLabel: 'ميلادي', hijriLabel: 'هجري · أم القرى', rangeLabel: 'التواريخ الهجرية المدعومة',
    invalidMessage: 'أدخل تاريخًا ميلاديًا متاحًا بصيغة YYYY-MM-DD.',
    unavailableMessage: 'هذا التاريخ غير متاح.',
    unsupportedMessage: `يدعم تقويم أم القرى التواريخ من ${UMALQURA_MIN_DATE} إلى ${UMALQURA_MAX_DATE}. تبقى القيمة الميلادية بصيغة ISO دون تغيير.`,
  });
}
/** Texts of a standalone calendar month. */
export function calendarMonthTexts(locale: Locale, umalqura: boolean) {
  const c = calendarTexts(locale);
  return {previousLabel: c.previousLabel, nextLabel: c.nextLabel, ...(umalqura ? {rangeLabel: c.rangeLabel} : {})};
}
/** Texts of a date picker; `unavailableMessage` only accompanies isDateDisabled. */
export function datePickerTexts(locale: Locale, unavailable = false) {
  const {label: _calendar, date: _date, unavailableMessage, ...texts} = calendarTexts(locale);
  // The former format hint; the packages no longer print it by themselves.
  return {...texts, placeholder: 'YYYY-MM-DD', ...(unavailable ? {unavailableMessage} : {})};
}

/** Former portal wording (header, layout, footer and verification defaults). */
export function portalTexts(locale: Locale) {
  return pick(locale, {
    skipLabel: 'Skip to content', menuLabel: 'Menu', navigationLabel: 'Main navigation',
    secondaryLabel: 'Secondary navigation', breadcrumbLabel: 'Breadcrumb', footerLabel: 'Footer links',
    legalLinksLabel: 'Policies and accessibility', supportLabel: 'Help and contact', externalLabel: 'opens in a new window',
  }, {
    skipLabel: 'انتقل إلى المحتوى', menuLabel: 'القائمة', navigationLabel: 'التنقل الرئيسي',
    secondaryLabel: 'التنقل الثانوي', breadcrumbLabel: 'مسار التنقل', footerLabel: 'روابط التذييل',
    legalLinksLabel: 'السياسات وإمكانية الوصول', supportLabel: 'المساعدة والتواصل', externalLabel: 'يفتح في نافذة جديدة',
  });
}
/** Header texts; `skipLabel` only accompanies a main target. */
export function portalHeaderTexts(locale: Locale, skip = false) {
  const {skipLabel, menuLabel, navigationLabel} = portalTexts(locale);
  return {...(skip ? {skipLabel} : {}), menuLabel, navigationLabel};
}
/** Texts of the vanilla calendar, which always renders the calendar-system switch. */
export function vanillaCalendarTexts(locale: Locale) {
  const {previousLabel, nextLabel, calendarSystemLabel, gregorianLabel, hijriLabel, rangeLabel, unsupportedMessage} = calendarTexts(locale);
  return {previousLabel, nextLabel, calendarSystemLabel, gregorianLabel, hijriLabel, rangeLabel, unsupportedMessage};
}
