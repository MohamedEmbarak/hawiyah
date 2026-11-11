import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act } from 'react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import { getCalendarMonth, resetTextWarnings, sortRows } from '@hawiyah/core';
import { AppShell, Calendar, Carousel, Combobox, ContentNavigation, CookieConsent, DataTable, DatePicker, Feedback, FileDropzone, FileUploadList, MultiSelect, NotificationList, Pagination, PortalFooter, PortalHeader, PortalLayout, RangeSlider, Rating, SearchField, Tabs, TagInput } from './src/index.js';
import type { TabsProps } from './src/index.js';
import type { PaginationProps } from './src/index.js';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let container: HTMLDivElement; let root: Root; let warn: ReturnType<typeof vi.spyOn>;
async function render(node: ReactNode) { await act(async () => root.render(node)); }
const warnings = () => (warn.mock.calls as unknown[][]).map(call => String(call[0])).filter(message => message.startsWith('Hawiyah:'));
const pageTexts = { label: 'الصفحات', previousLabel: 'السابقة', nextLabel: 'التالية', getPageLabel: (page: number) => `الصفحة ${page}`, getGapLabel: (start: number, end: number) => `${start}–${end}`, jumpLabel: 'رقم الصفحة', goLabel: 'انتقال' };

beforeEach(() => { resetTextWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined); container = document.createElement('div'); document.body.append(container); root = createRoot(container); });
afterEach(async () => { await act(async () => root.unmount()); container.remove(); document.head.querySelectorAll('base').forEach(base => base.remove()); warn.mockRestore(); });

it('renders nothing for missing required text and warns once per input in development', async () => {
  const { previousLabel: _omitted, ...rest } = pageTexts;
  const props = rest as unknown as PaginationProps;
  await render(<Pagination {...props} totalPages={3} />);
  const previous = container.querySelector<HTMLButtonElement>('.hw-pagination button')!;
  expect(previous.hasAttribute('aria-label')).toBe(false);
  expect(previous.textContent).toBe('');
  await render(<Pagination {...props} totalPages={4} />);
  expect(warnings()).toEqual([expect.stringContaining('Pagination requires "previousLabel"')]);
  await render(<SearchField label="البحث" clearLabel="" />);
  expect(container.querySelector('.hw-search-clear')!.hasAttribute('aria-label')).toBe(false);
  expect(warnings().at(-1)).toContain('SearchField requires "clearLabel"');
});

it('passes the documented arguments to templated texts and adds nothing to the result', async () => {
  const slide = vi.fn((position: number, total: number) => `${position}/${total}`);
  const page = vi.fn((value: number) => `p${value}`);
  const rating = vi.fn((value: number, max: number) => `${value}:${max}`);
  const sort = vi.fn((column: { key: string }, direction: 'ascending' | 'descending') => `${column.key}-${direction}`);
  const progress = vi.fn((name: string) => `progress ${name}`);
  await render(<>
    <Carousel label="الشرائح" previousLabel="السابقة" nextLabel="التالية" indicatorsLabel="المؤشرات" emptyLabel="لا شيء" getSlideLabel={slide} slides={['أ', 'ب']} />
    <Pagination {...pageTexts} getPageLabel={page} totalPages={2} />
    <Rating label="التقييم" max={3} getRatingLabel={rating} />
    <DataTable caption="الطلبات" locale="ar-SA" emptyMessage="لا توجد سجلات" getSortLabel={sort} columns={[{ key: 'name', label: 'الاسم', sortable: true }]} rows={[{ name: 'أ' }]} />
    <FileUploadList items={[{ id: 'one', name: 'a.pdf', status: 'uploading', progress: 40 }]} labels={{ selected: 'جاهز', uploading: 'جارٍ الرفع', complete: 'اكتمل', error: 'تعذر', remove: 'إزالة', getProgressLabel: progress, getRemoveLabel: name => `إزالة ${name}` }} />
  </>);
  expect(slide).toHaveBeenCalledWith(1, 2); expect(slide).toHaveBeenCalledWith(2, 2); expect(slide).not.toHaveBeenCalledWith(0, 2);
  expect(container.querySelector('.hw-carousel-slide')!.getAttribute('aria-label')).toBe('1/2');
  expect(container.querySelector('.hw-carousel-slide')!.hasAttribute('aria-roledescription')).toBe(false);
  expect(page).toHaveBeenCalledWith(1); expect(container.querySelector('[aria-label="p2"]')).not.toBeNull();
  expect(rating).toHaveBeenCalledWith(3, 3); expect(container.querySelector('input[aria-label="2:3"]')).not.toBeNull();
  expect(sort).toHaveBeenCalledWith(expect.objectContaining({ key: 'name' }), 'ascending');
  expect(progress).toHaveBeenCalledWith('a.pdf'); expect(container.querySelector('progress')!.getAttribute('aria-label')).toBe('progress a.pdf');
  expect(warnings()).toEqual([]);
});

it('accepts artwork alone as the brand and names it with brandLabel', async () => {
  const artwork = <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M0 0h10v10H0z" /></svg>;
  await render(<><PortalHeader brand={artwork} brandHref="/" brandLabel="هوية" navigationLabel="التنقل الرئيسي" menuLabel="القائمة" /><PortalFooter brand={artwork} brandLabel="هوية" externalLabel="يفتح في نافذة جديدة" /></>);
  const link = container.querySelector<HTMLAnchorElement>('a.hw-portal-brand')!;
  expect(link.getAttribute('aria-label')).toBe('هوية'); expect(link.textContent).toBe(''); expect(link.querySelector('svg')).not.toBeNull();
  expect(container.querySelector('.hw-portal-footer-brand-marks')!.getAttribute('aria-label')).toBe('هوية'); expect(container.querySelector('.hw-portal-footer-brand-marks')!.getAttribute('role')).toBe('group');
  expect(container.querySelector('.hw-portal-footer-brand')!.hasAttribute('role')).toBe(false); expect(container.querySelector('.hw-portal-footer-brand')!.hasAttribute('aria-label')).toBe(false);
  expect(container.querySelector('.hw-portal-footer-support')).toBeNull();
  expect(warnings()).toEqual([]);
  await render(<PortalHeader brand={artwork} navigationLabel="التنقل الرئيسي" menuLabel="القائمة" />);
  const brand = container.querySelector('.hw-portal-brand')!;
  expect(brand.localName).toBe('div'); expect(brand.hasAttribute('href')).toBe(false); expect(brand.hasAttribute('role')).toBe(false);
  expect(warnings()).toEqual([expect.stringContaining('PortalHeader requires "brandLabel" when the brand has no text')]);
  await render(<PortalHeader brand="هوية" brandHref="/" navigationLabel="التنقل الرئيسي" menuLabel="القائمة" />);
  expect(container.querySelector('a.hw-portal-brand')!.hasAttribute('aria-label')).toBe(false);
});

it('never warns about the brand during server rendering', () => {
  const html = renderToString(<PortalHeader brand={<svg aria-hidden="true" />} navigationLabel="التنقل الرئيسي" menuLabel="القائمة" />);
  expect(html).toContain('hw-portal-brand'); expect(warnings()).toEqual([]);
});

it('keeps packaged in-page links as "#id" on first render and resolves them under <base href> on interaction', async () => {
  const html = renderToString(<AppShell mainId="main content" skipLabel="انتقل إلى المحتوى">Main</AppShell>);
  expect(html).toContain('href="#main%20content"');
  const base = document.createElement('base'); base.href = '/other/'; document.head.append(base);
  await render(<><AppShell mainId="main" skipLabel="انتقل إلى المحتوى"><h1>العنوان</h1></AppShell><ContentNavigation label="في هذه الصفحة" items={[{ id: 'intro', label: 'مقدمة' }]} /><section id="intro">مقدمة</section></>);
  const skip = container.querySelector<HTMLAnchorElement>('.hw-skip-link')!; const local = container.querySelector<HTMLAnchorElement>('.hw-content-nav-link')!;
  expect(skip.getAttribute('href')).toBe('#main'); expect(local.getAttribute('href')).toBe('#intro');
  await act(async () => { skip.dispatchEvent(new FocusEvent('focus')); local.dispatchEvent(new FocusEvent('focus')); });
  expect(skip.getAttribute('href')).toBe(`${location.pathname}#main`); expect(local.getAttribute('href')).toBe(`${location.pathname}#intro`);
  const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
  await act(async () => { skip.dispatchEvent(event); });
  expect(event.defaultPrevented).toBe(true); expect(document.activeElement).toBe(container.querySelector('main'));
  expect(container.querySelector('.hw-content-nav')!.getAttribute('aria-label')).toBe('في هذه الصفحة');
  expect(container.querySelector('.hw-content-nav-heading')!.textContent).toBe('في هذه الصفحة');
});

// JavaScript callers can omit texts the types require; these renders model them.
const untyped = (component: unknown) => component as (props: Record<string, unknown>) => ReactNode;
it('warns for missing always-texts that the types already require and renders no empty element in their place', async () => {
  const [Cookie, Form, List, Range] = [untyped(CookieConsent), untyped(Feedback), untyped(NotificationList), untyped(RangeSlider)];
  await render(<><Cookie description="وصف" acceptLabel="قبول" rejectLabel="رفض" /><Form yesLabel="نعم" noLabel="لا" commentLabel="تعليق" submitLabel="إرسال" successMessage="شكرًا" /><List items={[]} unreadLabel="غير مقروء" /><Range label="النطاق" /></>);
  expect(warnings().map(message => message.match(/^Hawiyah: (\w+) requires "(\w+)"/)!.slice(1).join('.')).sort()).toEqual(['CookieConsent.title', 'Feedback.label', 'NotificationList.emptyMessage', 'NotificationList.label', 'RangeSlider.lowerLabel', 'RangeSlider.upperLabel']);
  expect(container.querySelector('.hw-cookie-consent')!.hasAttribute('aria-labelledby')).toBe(false);
  expect(container.querySelector('.hw-notification-list')!.hasAttribute('aria-labelledby')).toBe(false);
  expect(container.querySelector('.hw-notification-list > p')).toBeNull();
  expect(container.querySelector('.hw-feedback legend')!.textContent).toBe('');
  container.querySelectorAll('.hw-range-slider input[type="range"]').forEach(input => { expect(input.hasAttribute('aria-label')).toBe(false); expect(input.getAttribute('aria-labelledby') ?? '').toBe(''); });
});

it('omits names that application functions return empty and keeps required controls without a message blocking without marking them invalid', async () => {
  const options = [{ value: 'a', label: 'أ' }]; const [Tags, Multi, Combo] = [untyped(TagInput), untyped(MultiSelect), untyped(Combobox)];
  await render(<><Rating label="التقييم" getRatingLabel={() => ''} /><TagInput label="الوسوم" defaultValue={['x']} getRemoveLabel={() => ''} /><form id="f"><Tags label="وسوم مطلوبة" required getRemoveLabel={(tag: string) => tag} /><Multi label="اختيارات" options={options} searchLabel="بحث" emptyMessage="لا نتائج" required /><Combo label="خيار" options={options} emptyMessage="لا نتائج" getResultsMessage={(count: number) => String(count)} required /></form></>);
  container.querySelectorAll('.hw-rating input[type="radio"]').forEach(input => expect(input.hasAttribute('aria-label')).toBe(false));
  expect(container.querySelector('.hw-chip button')!.hasAttribute('aria-label')).toBe(false);
  const controls = Array.from(container.querySelectorAll<HTMLInputElement>('#f input:not([type="hidden"]):not([type="checkbox"])'));
  expect(controls).toHaveLength(3);
  controls.forEach(input => { expect(input.validationMessage).toBe(' '); expect(input.validity.customError).toBe(true); expect(input.hasAttribute('aria-invalid')).toBe(false); });
  expect((container.querySelector('#f') as HTMLFormElement).checkValidity()).toBe(false);
  expect(warnings().filter(message => message.includes('"requiredMessage"')).map(message => message.match(/^Hawiyah: (\w+) /)![1]).sort()).toEqual(['Combobox', 'MultiSelect', 'TagInput']);
});

const calendarTexts = { label: 'التقويم', previousLabel: 'الشهر السابق', nextLabel: 'الشهر التالي' };
const pickerTexts = { label: 'التاريخ', calendarLabel: 'اختر التاريخ', openLabel: 'فتح التقويم', closeLabel: 'إغلاق التقويم', previousLabel: 'الشهر السابق', nextLabel: 'الشهر التالي', calendarSystemLabel: 'نظام التقويم', gregorianLabel: 'ميلادي', hijriLabel: 'هجري', rangeLabel: 'النطاق المدعوم', invalidMessage: 'تاريخ غير صالح', unsupportedMessage: 'تاريخ خارج النطاق' };

it('makes a missing locale and a preferences action without its label type errors', () => {
  // jsdom gives import.meta.url no file scheme; Vitest runs from the repository root.
  const fixture = resolve('packages/react/fixtures/required-locale.tsx');
  const program = ts.createProgram([fixture], { strict: true, noEmit: true, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, lib: ['lib.es2022.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'], skipLibCheck: true, isolatedModules: true });
  const diagnostics = ts.getPreEmitDiagnostics(program).map(diagnostic => `${diagnostic.file?.fileName.split('/').pop() ?? ''}:${diagnostic.file && diagnostic.start !== undefined ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line + 1 : 0} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`);
  // An accepted element under @ts-expect-error is reported as an unused directive, so an empty list proves all four are rejected.
  expect(diagnostics).toEqual([]);
  expect(readFileSync(fixture, 'utf8').match(/{\/\* @ts-expect-error/g)).toHaveLength(4);
}, 60_000);

it('reports a tab list without a label and writes no empty name', async () => {
  const items = [{ value: 'a', label: 'First', content: 'One' }, { value: 'b', label: 'Second', content: 'Two' }];
  await render(<Tabs items={items} label="Sections" overflowLabel="More tabs" />);
  expect(container.querySelector('[role=tablist]')!.getAttribute('aria-label')).toBe('Sections'); expect(warnings()).toEqual([]);
  await render(<Tabs {...({ items, overflowLabel: 'More tabs' } as unknown as TabsProps)} />);
  expect(container.querySelector('[role=tablist]')!.hasAttribute('aria-label')).toBe(false);
  expect(warnings()).toEqual([expect.stringMatching(/^Hawiyah: Tabs requires "label"\./)]);
});

it('names ContentNavigation by its label, or by an aria-label or aria-labelledby that the application passes', async () => {
  const items = [{ id: 'intro', label: 'Introduction' }];
  await render(<><ContentNavigation items={items} label="On this page" /><ContentNavigation items={items} aria-label="Contents" /><h2 id="contents-heading">Contents</h2><ContentNavigation items={items} aria-labelledby="contents-heading" /></>);
  const [labelled, named, referenced] = [...container.querySelectorAll('nav')];
  expect(labelled!.getAttribute('aria-label')).toBe('On this page'); expect(labelled!.querySelector('h2')!.textContent).toBe('On this page');
  // The heading is the label: an aria-label names the landmark and prints nothing.
  expect(named!.getAttribute('aria-label')).toBe('Contents'); expect(named!.querySelector('h2')).toBeNull();
  expect(referenced!.getAttribute('aria-labelledby')).toBe('contents-heading'); expect(referenced!.hasAttribute('aria-label')).toBe(false); expect(referenced!.querySelector('h2')).toBeNull();
  expect(warnings()).toEqual([]);
  // jsdom gives import.meta.url no file scheme; Vitest runs from the repository root.
  const fixture = resolve('packages/react/fixtures/root-names.tsx');
  const program = ts.createProgram([fixture], { strict: true, noEmit: true, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, lib: ['lib.es2022.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'], skipLibCheck: true, isolatedModules: true });
  const diagnostics = ts.getPreEmitDiagnostics(program).map(diagnostic => `${diagnostic.file?.fileName.split('/').pop() ?? ''}:${diagnostic.file && diagnostic.start !== undefined ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line + 1 : 0} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`);
  expect(diagnostics).toEqual([]);
  expect(readFileSync(fixture, 'utf8').match(/{\/\* @ts-expect-error/g)).toHaveLength(2);
}, 60_000);

it('renders Calendar and DatePicker without Intl output and without throwing when locale is missing, and as core formats it when given', async () => {
  const [Cal, Picker] = [untyped(Calendar), untyped(DatePicker)];
  await render(<form id="dates"><Cal {...calendarTexts} name="day" defaultValue="2026-03-15" /><Picker {...pickerTexts} name="date" defaultValue="2026-03-15" /></form>);
  const root = container.querySelector('.hw-calendar')!;
  expect(root.getAttribute('aria-label')).toBe('التقويم'); expect(root.querySelector('header, [role="grid"], [role="status"], h3')).toBeNull();
  expect(container.querySelector('[role="grid"]')).toBeNull();
  expect(container.querySelector<HTMLInputElement>('.hw-date-picker input[type="text"]')!.value).toBe('2026-03-15');
  expect(container.querySelector('.hw-date-picker-value')!.textContent).toBe('');
  expect(new FormData(container.querySelector<HTMLFormElement>('#dates')!).getAll('day')).toEqual(['2026-03-15']);
  expect(new FormData(container.querySelector<HTMLFormElement>('#dates')!).getAll('date')).toEqual(['2026-03-15']);
  const locales = warnings().filter(message => message.includes('"locale"'));
  expect(locales.filter(message => message.startsWith('Hawiyah: Calendar '))).toHaveLength(1);
  expect(locales.filter(message => message.startsWith('Hawiyah: DatePicker '))).toHaveLength(1);
  expect(warnings()).toHaveLength(2);
  await render(<Calendar {...calendarTexts} locale="ar-SA" defaultValue="2026-03-15" />);
  expect(container.querySelector('.hw-calendar h3')!.textContent).toBe(getCalendarMonth({ locale: 'ar-SA', month: '2026-03-15', value: '2026-03-15', calendar: 'gregory', weekStartsOn: 0, fixedWeeks: true }).label);
  expect(container.querySelector('[role="grid"]')).not.toBeNull();
  expect(warnings()).toHaveLength(2);
});

it('keeps DataTable rows in source order when locale is missing and sorts as core does with the locale given', async () => {
  const rows = [{ name: 'ياسر' }, { name: 'أحمد' }, { name: 'باسم' }]; const columns = [{ key: 'name' as const, label: 'الاسم', sortable: true }];
  const Table = untyped(DataTable);
  await render(<Table caption="الطلبات" emptyMessage="لا توجد سجلات" columns={columns} rows={rows} />);
  const names = () => Array.from(container.querySelectorAll('tbody td')).map(cell => cell.textContent);
  await act(async () => container.querySelector<HTMLButtonElement>('th button')!.click());
  expect(container.querySelector('th')!.getAttribute('aria-sort')).toBe('ascending');
  expect(names()).toEqual(['ياسر', 'أحمد', 'باسم']);
  expect(warnings()).toEqual([expect.stringMatching(/^Hawiyah: DataTable requires "locale"/)]);
  await render(<DataTable caption="الطلبات" emptyMessage="لا توجد سجلات" locale="ar-SA" columns={columns} rows={rows} defaultSort={{ key: 'name', direction: 'ascending' }} key="sorted" />);
  expect(names()).toEqual(sortRows(rows, 'name', 'ascending', 'ar-SA').map(row => row.name));
  expect(names()).toEqual(['أحمد', 'باسم', 'ياسر']);
  expect(warnings()).toHaveLength(1);
});

it('renders the FileDropzone selection status only with getSelectedMessage', async () => {
  await render(<FileDropzone label="المرفقات" dropLabel="أفلت الملفات هنا" />);
  expect(container.querySelector('[role="status"]')).toBeNull();
  await render(<form id="upload"><FileDropzone label="المرفقات" dropLabel="أفلت الملفات هنا" getSelectedMessage={files => `تم اختيار ${files.length}`} key="status" /></form>);
  const status = () => container.querySelector('.hw-file-dropzone p[role="status"]')!;
  expect(status().textContent).toBe(''); expect(status().classList.contains('hw-sr-only')).toBe(false);
  const input = container.querySelector<HTMLInputElement>('input[type="file"]')!; // JSDOM has no DataTransfer; give the input a selection directly.
  let selection: File[] = []; Object.defineProperty(input, 'files', { configurable: true, get: () => selection, set: value => { selection = Array.from(value as Iterable<File>); } });
  selection = [new File(['a'], 'a.pdf', { type: 'application/pdf' })]; await act(async () => input.dispatchEvent(new Event('change', { bubbles: true })));
  expect(status().textContent).toBe('تم اختيار 1');
  await act(async () => { container.querySelector<HTMLFormElement>('#upload')!.reset(); await Promise.resolve(); });
  expect(status().textContent).toBe('');
  expect(warnings()).toEqual([]);
});

it('renders the CookieConsent preferences action only while its handler is bound', async () => {
  const texts = { title: 'ملفات تعريف الارتباط', description: 'وصف', acceptLabel: 'قبول', rejectLabel: 'رفض' };
  await render(<CookieConsent {...texts} />);
  expect(container.querySelectorAll('.hw-cookie-consent button')).toHaveLength(2);
  const onPreferences = vi.fn();
  await render(<CookieConsent {...texts} onPreferences={onPreferences} preferencesLabel="التفضيلات" />);
  const buttons = container.querySelectorAll<HTMLButtonElement>('.hw-cookie-consent button'); const preferences = buttons[buttons.length - 1]!;
  expect(buttons).toHaveLength(3); expect(preferences.textContent).toBe('التفضيلات'); expect(preferences.dataset.variant).toBe('ghost');
  await act(async () => preferences.click());
  expect(onPreferences).toHaveBeenCalledTimes(1); expect(container.querySelector('.hw-cookie-consent')!.hasAttribute('hidden')).toBe(false);
  expect(warnings()).toEqual([]);
  const Cookie = untyped(CookieConsent);
  await render(<Cookie {...texts} onPreferences={onPreferences} />); await render(<Cookie {...texts} onPreferences={onPreferences} />);
  expect(container.querySelectorAll('.hw-cookie-consent button')[2]!.textContent).toBe('');
  expect(warnings()).toEqual([expect.stringMatching(/^Hawiyah: CookieConsent requires "preferencesLabel" when onPreferences is given/)]);
});

it('reports a missing PortalLayout menuLabel under PortalLayout first', async () => {
  const Layout = untyped(PortalLayout);
  await render(<Layout brand="هوية" footerProps={{ externalLabel: 'يفتح في نافذة جديدة' }} skipLabel="تخطي إلى المحتوى" navigationLabel="التنقل الرئيسي"><p>محتوى</p></Layout>);
  expect(warnings()[0]).toMatch(/^Hawiyah: PortalLayout requires "menuLabel"/);
});

it('calls no Intl, toLocaleString or localeCompare in the React sources and chooses no locale', () => {
  const directory = resolve('packages/react/src') + '/';
  for (const name of readdirSync(directory)) {
    const source = readFileSync(directory + name, 'utf8');
    expect(source, name).not.toMatch(/\bIntl\s*\.|toLocale\w*\s*\(|localeCompare|resolvedOptions|navigator\.languages?\b/);
    expect(source, name).not.toMatch(/['"](ar|en)(-[A-Za-z]{2})?['"]/);
    expect(source, name).not.toMatch(/locale\s*=\s*['"]/);
  }
});
