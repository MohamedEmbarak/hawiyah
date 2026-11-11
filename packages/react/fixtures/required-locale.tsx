// Type fixture for react.text-contract.test.tsx. It is compiled, never run: every element marked
// with @ts-expect-error must be rejected by the compiler (an unused marker is itself an error),
// and every unmarked element must compile.
import { Calendar, CookieConsent, DataTable, DatePicker } from '../src/index.js';

const calendar = { label: 'التقويم', previousLabel: 'الشهر السابق', nextLabel: 'الشهر التالي' };
const picker = { label: 'التاريخ', calendarLabel: 'اختر التاريخ', openLabel: 'فتح التقويم', closeLabel: 'إغلاق التقويم', previousLabel: 'الشهر السابق', nextLabel: 'الشهر التالي', calendarSystemLabel: 'نظام التقويم', gregorianLabel: 'ميلادي', hijriLabel: 'هجري', rangeLabel: 'النطاق المدعوم', invalidMessage: 'تاريخ غير صالح', unsupportedMessage: 'تاريخ خارج النطاق' };
const table = { caption: 'الطلبات', emptyMessage: 'لا توجد سجلات', columns: [{ key: 'name' as const, label: 'الاسم', sortable: true }], rows: [{ name: 'أ' }] };
const consent = { title: 'ملفات تعريف الارتباط', description: 'وصف', acceptLabel: 'قبول', rejectLabel: 'رفض' };

export const accepted = <>
  <Calendar {...calendar} locale="ar-SA" />
  <DatePicker {...picker} locale="ar-SA" />
  <DataTable {...table} locale="ar-SA" />
  <CookieConsent {...consent} />
  <CookieConsent {...consent} onPreferences={() => undefined} preferencesLabel="التفضيلات" />
</>;

export const rejected = <>
  {/* @ts-expect-error locale is required */}
  <Calendar {...calendar} />
  {/* @ts-expect-error locale is required */}
  <DatePicker {...picker} />
  {/* @ts-expect-error locale is required */}
  <DataTable {...table} />
  {/* @ts-expect-error preferencesLabel is required with onPreferences */}
  <CookieConsent {...consent} onPreferences={() => undefined} />
</>;
