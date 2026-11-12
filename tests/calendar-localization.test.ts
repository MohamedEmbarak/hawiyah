import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { HwDatePickerComponent } from '../packages/angular/dist/fesm2022/hawiyah-angular.mjs';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createApp, h, nextTick, shallowRef } from 'vue';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import * as core from '../packages/core/dist/index.js';
import { resetTextWarnings, UMALQURA_MAX_DATE, UMALQURA_MIN_DATE } from '../packages/core/dist/index.js';
import { DatePicker as ReactPicker } from '../packages/react/src/calendar';
import { DatePicker as VuePicker } from '../packages/vue/src/calendar';
import { createCalendar } from '../packages/vanilla/src/calendar';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const dispose: Array<() => void | Promise<void>> = [];
beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(async () => {
  for (const fn of dispose.splice(0)) await fn();
  TestBed.resetTestingModule(); document.body.replaceChildren();
});

type Adapter = 'react' | 'vue' | 'angular';
const initial = '2026-10-28';
// The application's copy: the strings the packages used to supply.
const copy = {
  ar: {
    label: 'التاريخ', calendarLabel: 'اختر التاريخ', previousLabel: 'الشهر السابق', nextLabel: 'الشهر التالي',
    openLabel: 'فتح التقويم', closeLabel: 'إغلاق التقويم', calendarSystemLabel: 'نظام التقويم',
    gregorianLabel: 'ميلادي', hijriLabel: 'هجري · أم القرى', rangeLabel: 'التواريخ الهجرية المدعومة',
    invalidMessage: 'أدخل تاريخًا ميلاديًا متاحًا بصيغة YYYY-MM-DD.',
    unsupportedMessage: `يدعم تقويم أم القرى التواريخ من ${UMALQURA_MIN_DATE} إلى ${UMALQURA_MAX_DATE}. تبقى القيمة الميلادية بصيغة ISO دون تغيير.`,
  },
  en: {
    label: 'Date', calendarLabel: 'Choose date', previousLabel: 'Previous month', nextLabel: 'Next month',
    openLabel: 'Open calendar', closeLabel: 'Close calendar', calendarSystemLabel: 'Calendar system',
    gregorianLabel: 'Gregorian', hijriLabel: 'Hijri · Umm al-Qura', rangeLabel: 'Supported Hijri dates',
    invalidMessage: 'Enter an available Gregorian date in YYYY-MM-DD format.',
    unsupportedMessage: `Umm al-Qura is available from ${UMALQURA_MIN_DATE} through ${UMALQURA_MAX_DATE}. The selected ISO date is unchanged.`,
  },
} as const;
async function mount(adapter: Adapter) {
  const form = document.createElement('form'); form.lang = 'en'; form.dir = 'ltr';
  const root = document.createElement('div'); form.append(root); document.body.append(form);
  let options: Record<string, string> = {locale: 'ar-SA', ...copy.ar};
  let paint: () => void, run: (action: () => void) => Promise<void>;
  if (adapter === 'react') {
    const app = createRoot(root);
    paint = () => app.render(createElement(ReactPicker, {defaultValue: initial, name: 'appointment', ...options}));
    run = async action => { await act(async () => action()); };
    dispose.push(() => run(() => app.unmount()));
  } else if (adapter === 'vue') {
    const props = shallowRef(options);
    const app = createApp({render: () => h(VuePicker, {defaultValue: initial, name: 'appointment', ...props.value})});
    app.mount(root); paint = () => { props.value = options; };
    run = async action => { action(); await nextTick(); };
    dispose.push(() => app.unmount());
  } else {
    const fixture = TestBed.createComponent(HwDatePickerComponent); root.append(fixture.nativeElement);
    fixture.componentRef.setInput('name', 'appointment'); fixture.componentRef.setInput('value', initial);
    paint = () => { for (const [key, value] of Object.entries(options)) fixture.componentRef.setInput(key, value); };
    run = async action => { action(); fixture.detectChanges(); };
    dispose.push(() => fixture.destroy());
  }
  await run(paint);
  const input = root.querySelector<HTMLInputElement>('.hw-date-picker-control input')!;
  return {
    form, root, input,
    set: (next: Record<string, string>) => run(() => { options = {...options, ...next}; paint(); }),
    edit: (value: string) => run(() => {
      input.focus();
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value);
      input.dispatchEvent(new Event('input', {bubbles: true}));
    }),
  };
}

for (const adapter of ['react', 'vue', 'angular'] as const) {
  it(`${adapter} renders the supplied calendar labels and draft validation while preserving its ISO value`, async () => {
    const ui = await mount(adapter);
    const previous = ui.root.querySelector('.hw-calendar-prev')!;
    const next = ui.root.querySelector('.hw-calendar-next')!;
    const open = ui.root.querySelector('.hw-date-picker-trigger')!;
    const close = ui.root.querySelector('.hw-dialog-header button')!;
    expect(ui.input.type).toBe('text');
    expect(ui.root.querySelector('input[type="date"]')).toBeNull();
    expect(ui.input.labels?.[0]?.textContent).toContain('التاريخ');
    expect(previous.getAttribute('aria-label')).toBe('الشهر السابق');
    expect(next.getAttribute('aria-label')).toBe('الشهر التالي');
    expect(open.getAttribute('aria-label')).toBe('فتح التقويم');
    expect(close.getAttribute('aria-label')).toBe('إغلاق التقويم');
    const group = ui.root.querySelector('.hw-calendar-switch')!;
    expect(group.getAttribute('aria-label')).toBe('نظام التقويم');
    expect(group.textContent).toContain('أم القرى');
    await ui.edit('2026-02-30');
    expect(ui.input.validationMessage).toBe(copy.ar.invalidMessage);
    expect(new FormData(ui.form).getAll('appointment')).toEqual([initial]);
    // The locale formats dates only; it never selects interface text.
    await ui.set({locale: 'en'});
    expect(previous.getAttribute('aria-label')).toBe('الشهر السابق');
    expect(group.getAttribute('aria-label')).toBe('نظام التقويم');
    expect(ui.input.validationMessage).toBe(copy.ar.invalidMessage);
    await ui.set({...copy.en});
    expect(previous.getAttribute('aria-label')).toBe('Previous month');
    expect(next.getAttribute('aria-label')).toBe('Next month');
    expect(open.getAttribute('aria-label')).toBe('Open calendar');
    expect(close.getAttribute('aria-label')).toBe('Close calendar');
    expect(group.textContent).toContain('Gregorian');
    expect(ui.input.validationMessage).toBe(copy.en.invalidMessage);
    expect(new FormData(ui.form).getAll('appointment')).toEqual([initial]);
    await ui.set({previousLabel: 'Back one period', closeLabel: 'Return to form', invalidMessage: 'Application validation', locale: 'ar-SA'});
    expect(previous.getAttribute('aria-label')).toBe('Back one period');
    expect(close.getAttribute('aria-label')).toBe('Return to form');
    expect(ui.input.validationMessage).toBe('Application validation');
    expect(new FormData(ui.form).getAll('appointment')).toEqual([initial]);
  }, 30000);
}

it('vanilla navigation renders the supplied copy independently of the explicit locale, host language and direction', () => {
  for (const [locale, hostLocale, language] of [['ar-SA', 'en', 'ar'], ['en', 'ar', 'en'], ['en', 'en', 'ar']] as const) {
    const root = document.createElement('div'); root.lang = hostLocale; root.dir = hostLocale === 'ar' ? 'rtl' : 'ltr'; document.body.append(root);
    const texts = copy[language];
    const api = createCalendar(root, {locale, value: initial, calendar: 'islamic-umalqura', ...texts});
    expect(root.querySelector('.hw-calendar-prev')?.getAttribute('aria-label')).toBe(texts.previousLabel);
    expect(root.querySelector('.hw-calendar-next')?.getAttribute('aria-label')).toBe(texts.nextLabel);
    // The Gregorian / Hijri switch and its three texts belong to DatePicker, never to a standalone Calendar.
    expect(root.querySelector('.hw-calendar-switch, .hw-calendar-options')).toBeNull();
    expect(root.querySelector('.hw-calendar-info-icon')?.getAttribute('aria-label')).toBe(texts.rangeLabel);
    expect(api.value).toBe(initial); api.destroy();
  }
}, 15000);

it('removes the built-in calendar copy: a missing text renders nothing and warns in development', () => {
  expect('getCalendarLabels' in core).toBe(false);
  expect([UMALQURA_MIN_DATE, UMALQURA_MAX_DATE]).toEqual(['1924-08-01', '2077-11-16']);
  resetTextWarnings();
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    const root = document.createElement('div'); root.lang = 'ar'; root.dir = 'rtl'; document.body.append(root);
    const api = createCalendar(root, {locale: 'ar-SA', value: initial, calendar: 'islamic-umalqura'});
    for (const selector of ['.hw-calendar-prev', '.hw-calendar-next', '.hw-calendar-info-icon']) {
      const node = root.querySelector(selector);
      expect(node?.hasAttribute('aria-label')).toBe(false);
    }
    expect(root.querySelector('.hw-calendar-prev')?.textContent).toBe('');
    expect(root.textContent).not.toMatch(/الشهر|month|أم القرى|Umm al-Qura/u);
    expect(api.value).toBe(initial);
    expect(warn.mock.calls.map(call => String(call[0])).filter(message => message.startsWith('Hawiyah: Calendar'))).toEqual(expect.arrayContaining([
      expect.stringContaining('"previousLabel"'), expect.stringContaining('"nextLabel"'),
    ]));
    api.destroy();
  } finally { warn.mockRestore(); }
});
