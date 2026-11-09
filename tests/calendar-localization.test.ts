import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { HwDatePickerComponent } from '../packages/angular/dist/fesm2022/hawiyah-angular.mjs';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createApp, h, nextTick, shallowRef } from 'vue';
import { afterEach, beforeAll, expect, it } from 'vitest';
import { getCalendarLabels } from '../packages/core/src/calendar-labels';
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
async function mount(adapter: Adapter) {
  const form = document.createElement('form'); form.lang = 'en'; form.dir = 'ltr';
  const root = document.createElement('div'); form.append(root); document.body.append(form);
  let options: Record<string, string> = {};
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
  it(`${adapter} changes calendar labels and draft validation with locale while preserving its ISO value`, async () => {
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
    expect(ui.input.validationMessage).toBe(getCalendarLabels('ar').invalid);
    expect(new FormData(ui.form).getAll('appointment')).toEqual([initial]);
    await ui.set({locale: 'en'});
    expect(previous.getAttribute('aria-label')).toBe('Previous month');
    expect(next.getAttribute('aria-label')).toBe('Next month');
    expect(open.getAttribute('aria-label')).toBe('Open calendar');
    expect(close.getAttribute('aria-label')).toBe('Close calendar');
    expect(group.textContent).toContain('Gregorian');
    expect(ui.input.validationMessage).toBe(getCalendarLabels('en').invalid);
    expect(new FormData(ui.form).getAll('appointment')).toEqual([initial]);
    await ui.set({previousLabel: 'Back one period', closeLabel: 'Return to form', invalidMessage: 'Application validation', locale: 'ar-SA'});
    expect(previous.getAttribute('aria-label')).toBe('Back one period');
    expect(close.getAttribute('aria-label')).toBe('Return to form');
    expect(ui.input.validationMessage).toBe('Application validation');
    expect(new FormData(ui.form).getAll('appointment')).toEqual([initial]);
  }, 30000);
}

it('vanilla navigation follows the explicit locale independently of host language and direction', () => {
  for (const [locale, hostLocale] of [['ar-SA', 'en'], ['en', 'ar']]) {
    const root = document.createElement('div'); root.lang = hostLocale!; root.dir = hostLocale === 'ar' ? 'rtl' : 'ltr'; document.body.append(root);
    const api = createCalendar(root, {locale, value: initial, calendar: 'islamic-umalqura'});
    const copy = getCalendarLabels(locale);
    expect(root.querySelector('.hw-calendar-prev')?.getAttribute('aria-label')).toBe(copy.previous);
    expect(root.querySelector('.hw-calendar-next')?.getAttribute('aria-label')).toBe(copy.next);
    expect(root.querySelector('.hw-calendar-switch')?.getAttribute('aria-label')).toBe(copy.system);
    expect(root.querySelector('.hw-calendar-info-icon')?.getAttribute('aria-label')).toBe(copy.range);
    expect(api.value).toBe(initial); api.destroy();
  }
}, 15000);

it('uses the Arabic language subtag, immutable copy and Latin ISO bounds in both languages', () => {
  expect(getCalendarLabels()).toBe(getCalendarLabels('AR-sa-u-nu-latn'));
  expect(getCalendarLabels('arn').previous).toBe('Previous month');
  for (const locale of ['ar', 'en']) {
    const copy = getCalendarLabels(locale);
    expect(Object.isFrozen(copy)).toBe(true);
    expect(copy.unsupported).toContain('1924-08-01'); expect(copy.unsupported).toContain('2077-11-16');
  }
});
