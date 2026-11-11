import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act } from 'react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { resetTextWarnings } from '@hawiyah/core';
import { AppShell, Carousel, Combobox, ContentNavigation, CookieConsent, DataTable, Feedback, FileUploadList, MultiSelect, NotificationList, Pagination, PortalFooter, PortalHeader, RangeSlider, Rating, SearchField, TagInput } from './src/index.js';
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
    <DataTable caption="الطلبات" emptyMessage="لا توجد سجلات" getSortLabel={sort} columns={[{ key: 'name', label: 'الاسم', sortable: true }]} rows={[{ name: 'أ' }]} />
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
  expect(container.querySelector('.hw-portal-footer-brand-marks')!.getAttribute('aria-label')).toBe('هوية');
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

it('omits names that application functions return empty and keeps required controls without a message invalid', async () => {
  const options = [{ value: 'a', label: 'أ' }]; const [Tags, Multi, Combo] = [untyped(TagInput), untyped(MultiSelect), untyped(Combobox)];
  await render(<><Rating label="التقييم" getRatingLabel={() => ''} /><TagInput label="الوسوم" defaultValue={['x']} getRemoveLabel={() => ''} /><form id="f"><Tags label="وسوم مطلوبة" required getRemoveLabel={(tag: string) => tag} /><Multi label="اختيارات" options={options} searchLabel="بحث" emptyMessage="لا نتائج" required /><Combo label="خيار" options={options} emptyMessage="لا نتائج" getResultsMessage={(count: number) => String(count)} required /></form></>);
  container.querySelectorAll('.hw-rating input[type="radio"]').forEach(input => expect(input.hasAttribute('aria-label')).toBe(false));
  expect(container.querySelector('.hw-chip button')!.hasAttribute('aria-label')).toBe(false);
  const controls = Array.from(container.querySelectorAll<HTMLInputElement>('#f input:not([type="hidden"]):not([type="checkbox"])'));
  expect(controls).toHaveLength(3);
  controls.forEach(input => { expect(input.validity.customError).toBe(true); expect(input.getAttribute('aria-invalid')).toBe('true'); });
  expect((container.querySelector('#f') as HTMLFormElement).checkValidity()).toBe(false);
  expect(warnings().filter(message => message.includes('"requiredMessage"'))).toHaveLength(3);
});
