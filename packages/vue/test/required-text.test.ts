// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createApp, createSSRApp, h, nextTick } from 'vue';
import type { App, Component } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { formatCalendarDate, getCalendarMonth, resetTextWarnings, sortRows } from '@hawiyah/core';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Breadcrumb, Calendar, DataTable, DatePicker, FileDropzone, PortalFooter, SiteVerification, Spinner, Stat, Table } from '../src/index.js';
import { calendarText, datePickerText, dropzoneText, paginationText } from './texts.js';
import { AppShell, Carousel, ContentNavigation, CookieConsent, Dialog, Drawer, Feedback, Field, NotificationList, Pagination, PortalHeader, PortalLayout, Rating, RatingDisplay, SearchField, Tabs, TagInput, ToastRegion, TreeView } from '../src/index.js';

const apps: App[] = [];
function mount(component: Component) { const root = document.createElement('div'); document.body.append(root); const app = createApp(component); apps.push(app); app.mount(root); return root; }
// Deliberately incomplete props: the type error a TypeScript caller would see is the point of these cases.
const loose = (component: unknown) => component as Component;
const hawiyahWarnings = (warn: { mock: { calls: unknown[][] } }): string[] => warn.mock.calls.map(call => String(call[0])).filter(message => message.startsWith('Hawiyah:'));
beforeEach(() => { resetTextWarnings(); Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value() { this.open = true; } }); Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value() { this.open = false; } }); });
afterEach(() => { apps.splice(0).forEach(app => app.unmount()); document.body.replaceChildren(); vi.restoreAllMocks(); });

it('renders nothing in place of missing required text and warns once in development', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const root = mount({ render: () => h('div', [
    h(loose(Dialog), { title: 'Review', defaultOpen: true }, () => 'Body'),
    h(loose(Dialog), { title: 'Second review', defaultOpen: true }, () => 'Body'),
    h(loose(Carousel), { label: 'Highlights', previousLabel: 'Previous slide', nextLabel: 'Next slide', showIndicators: false, getSlideLabel: (position: number, total: number) => `${position} / ${total}`, slides: [] }),
  ]) });
  await nextTick();
  const closes = root.querySelectorAll<HTMLButtonElement>('.hw-dialog-header button');
  expect(closes).toHaveLength(2);
  for (const close of closes) { expect(close.hasAttribute('aria-label')).toBe(false); expect(close.textContent).toBe(''); }
  expect(root.querySelector('.hw-carousel-empty')!.textContent).toBe('');
  expect(root.querySelector('.hw-carousel [role=status]')!.textContent).toBe('');
  const messages = hawiyahWarnings(warn);
  expect(messages.filter(message => message.includes('Dialog requires "closeLabel"'))).toHaveLength(1);
  expect(messages.filter(message => message.includes('Carousel requires "emptyLabel"'))).toHaveLength(1);
  expect(messages.some(message => /[؀-ۿ]/.test(message))).toBe(false);
});

it('omits missing text from server output instead of rendering an empty attribute', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const html = await renderToString(createSSRApp({ render: () => h(loose(Pagination), { label: 'Pages', previousLabel: 'Previous page', nextLabel: 'Next page', jumpLabel: 'Go to page', goLabel: 'Go', getGapLabel: (start: number, end: number) => `Pages ${start} to ${end}`, totalPages: 3 }) }));
  expect(html).not.toContain('aria-label=""');
  expect(html).toContain('aria-label="Previous page"');
  expect(hawiyahWarnings(warn).filter(message => message.includes('Pagination requires "getPageLabel"'))).toHaveLength(1);
});

it('warns for conditional text only while its condition holds', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  mount({ render: () => h('form', [h(TagInput, { label: 'Tags', getRemoveLabel: (tag: string) => `Remove ${tag}` })]) });
  await nextTick();
  expect(hawiyahWarnings(warn)).toEqual([]);
  const root = mount({ render: () => h('form', [h(TagInput, { label: 'Tags', required: true, getRemoveLabel: (tag: string) => `Remove ${tag}` })]) });
  await nextTick();
  expect(hawiyahWarnings(warn)).toEqual([expect.stringContaining('TagInput requires "requiredMessage" when required is set')]);
  const input = root.querySelector<HTMLInputElement>('input')!;
  expect(input.checkValidity()).toBe(false);
});

it('calls templated text functions with the documented arguments', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const getPageLabel = vi.fn((page: number) => `Page ${page}`);
  const getGapLabel = vi.fn((start: number, end: number) => `Pages ${start} to ${end}`);
  const getSlideLabel = vi.fn((position: number, total: number) => `Slide ${position} of ${total}`);
  const getRatingLabel = vi.fn((value: number, max: number) => `${value} of ${max} stars`);
  const getValueLabel = vi.fn((value: number, max: number) => `Rated ${value} of ${max}`);
  const getExpandLabel = vi.fn((node: { label: string }) => `Expand ${node.label}`);
  const getDismissLabel = vi.fn((message: { message: string }) => `Dismiss ${message.message}`);
  const parent = { id: 'parent', label: 'Parent', children: [{ id: 'child', label: 'Child' }] };
  const root = mount({ render: () => h('div', [
    h(Pagination, { label: 'Pages', previousLabel: 'Previous page', nextLabel: 'Next page', jumpLabel: 'Go to page', goLabel: 'Go', totalPages: 20, defaultValue: 10, getPageLabel, getGapLabel }),
    h(Carousel, { label: 'Highlights', previousLabel: 'Previous slide', nextLabel: 'Next slide', indicatorsLabel: 'Choose a slide', emptyLabel: 'No slides', getSlideLabel, slides: [{ id: 'a', content: 'One' }, { id: 'b', content: 'Two' }] }),
    h(Rating, { label: 'Score', max: 3, getRatingLabel }),
    h(RatingDisplay, { value: 2, max: 5, getValueLabel }),
    h(TreeView, { label: 'Services', items: [parent], getExpandLabel, getCollapseLabel: (node: { label: string }) => `Collapse ${node.label}` }),
    h(ToastRegion, { label: 'Notifications', messages: [{ id: 'saved', message: 'Saved' }], getDismissLabel, onDismiss: () => {} }),
  ]) });
  await nextTick();
  expect(getPageLabel).toHaveBeenCalledWith(1); expect(getPageLabel).toHaveBeenCalledWith(20);
  expect(root.querySelector('[aria-label="Page 20"]')).not.toBeNull();
  expect(getGapLabel.mock.calls.every(([start, end]) => Number.isInteger(start) && Number.isInteger(end) && start <= end)).toBe(true);
  expect(getGapLabel).toHaveBeenCalled();
  expect(getSlideLabel).toHaveBeenCalledWith(1, 2); expect(getSlideLabel).toHaveBeenCalledWith(2, 2);
  expect(getSlideLabel.mock.calls.some(([position]) => position === 0)).toBe(false);
  expect(root.querySelector('.hw-carousel-slide')!.getAttribute('aria-label')).toBe('Slide 1 of 2');
  expect(root.querySelector('.hw-carousel [role=status]')!.textContent).toBe('Slide 1 of 2');
  expect(getRatingLabel.mock.calls).toEqual([[1, 3], [2, 3], [3, 3]]);
  expect(root.querySelector('.hw-rating-display')!.getAttribute('aria-label')).toBe('Rated 2 of 5');
  expect(getValueLabel).toHaveBeenCalledWith(2, 5);
  expect(getExpandLabel).toHaveBeenCalledWith(parent);
  expect(getDismissLabel).toHaveBeenCalledWith(expect.objectContaining({ id: 'saved', message: 'Saved' }));
  expect(root.querySelector('[aria-label="Dismiss Saved"]')).not.toBeNull();
  expect(hawiyahWarnings(warn)).toEqual([]);
});

it('accepts artwork alone as the brand and names it with brandLabel', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const artwork = () => h('svg', { 'aria-hidden': 'true', viewBox: '0 0 10 10' }, [h('path', { d: 'M0 0h10v10z' })]);
  const html = await renderToString(createSSRApp({ render: () => h(PortalHeader, { brandLabel: 'Hawiyah home', homeHref: '/', menuLabel: 'Menu', navigationLabel: 'Main' }, { brand: artwork }) }));
  expect(html).toContain('aria-label="Hawiyah home"');
  const root = mount({ render: () => h('div', [
    h(PortalHeader, { brandLabel: 'Hawiyah home', homeHref: '/', menuLabel: 'Menu', navigationLabel: 'Main' }, { brand: artwork }),
    h(PortalHeader, { brandLabel: 'Hawiyah', homeHref: '', menuLabel: 'Menu', navigationLabel: 'Main' }, { brand: artwork }),
  ]) });
  await nextTick();
  const [link, plain] = root.querySelectorAll<HTMLElement>('.hw-portal-brand');
  expect(link!.tagName).toBe('A'); expect(link!.getAttribute('aria-label')).toBe('Hawiyah home'); expect(link!.textContent).toBe('');
  expect(link!.querySelector('span')).toBeNull(); expect(link!.querySelector('svg')).not.toBeNull();
  expect(plain!.tagName).toBe('DIV'); expect(plain!.hasAttribute('href')).toBe(false); expect(plain!.getAttribute('role')).toBe('img');
  expect(hawiyahWarnings(warn)).toEqual([]);
  mount({ render: () => h(loose(PortalHeader), { homeHref: '/', menuLabel: 'Menu', navigationLabel: 'Main' }, { brand: artwork }) });
  await nextTick();
  expect(hawiyahWarnings(warn)).toEqual([expect.stringContaining('PortalHeader requires "brandLabel" when the brand has no text')]);
  const text = mount({ render: () => h(PortalHeader, { brand: 'هوية', menuLabel: 'Menu', navigationLabel: 'Main' }) });
  expect(text.querySelector('.hw-portal-brand')!.hasAttribute('aria-label')).toBe(false);
});

it('renders packaged fragment links as "#id" on the server and on first render, then resolves them on interaction', async () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  const items = [{ id: 'intro', label: 'Introduction' }, { id: 'details', label: 'Details' }];
  const app = () => h('div', [h(AppShell, { mainId: 'main', skipLabel: 'Skip to content' }, () => h('p', 'Content')), h(ContentNavigation, { label: 'On this page', items }), h('section', { id: 'intro' }, 'Intro'), h('section', { id: 'details' }, 'Details')]);
  const html = await renderToString(createSSRApp({ render: app }));
  expect(html).toContain('href="#main"'); expect(html).toContain('href="#intro"'); expect(html).toContain('href="#details"');
  const base = document.createElement('base'); base.href = `${location.origin}/elsewhere/`; document.head.append(base);
  try {
    const root = document.createElement('div'); root.innerHTML = html; document.body.append(root);
    const hydrated = createSSRApp({ render: app }); apps.push(hydrated); hydrated.mount(root); await nextTick();
    const skip = root.querySelector<HTMLAnchorElement>('.hw-skip-link')!; const link = root.querySelector<HTMLAnchorElement>('a.hw-content-nav-link')!;
    expect(skip.getAttribute('href')).toBe('#main'); expect(link.getAttribute('href')).toBe('#intro');
    skip.dispatchEvent(new FocusEvent('focus'));
    expect(skip.getAttribute('href')).toBe(`${location.pathname}${location.search}#main`);
    skip.click(); await nextTick();
    expect(document.activeElement).toBe(root.querySelector('main'));
  } finally { base.remove(); }
});

it('renders listener-switched actions only while the listener is bound', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const items = [{ id: 'n1', title: 'Saved' }];
  const read = vi.fn(); const dismiss = vi.fn(); const preferences = vi.fn();
  const root = mount({ render: () => h('div', [
    h('div', { class: 'without' }, [h(NotificationList, { label: 'Notifications', emptyMessage: 'None', unreadLabel: 'Unread', items }), h(CookieConsent, { title: 'Cookies', description: 'Choose', acceptLabel: 'Accept', rejectLabel: 'Reject' })]),
    h('div', { class: 'with' }, [
      h(NotificationList, { label: 'Notifications', emptyMessage: 'None', unreadLabel: 'Unread', items, getMarkReadLabel: item => `Mark ${item.title} as read`, getDismissLabel: item => `Dismiss ${item.title}`, onRead: read, onDismiss: dismiss }),
      h(CookieConsent, { title: 'Cookies', description: 'Choose', acceptLabel: 'Accept', rejectLabel: 'Reject', preferencesLabel: 'Preferences', onPreferences: preferences }),
    ]),
  ]) });
  await nextTick();
  expect(root.querySelectorAll('.without button')).toHaveLength(2);
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('.with button')];
  expect(buttons.map(button => button.getAttribute('aria-label') ?? button.textContent)).toEqual(['Mark Saved as read', 'Dismiss Saved', 'Accept', 'Reject', 'Preferences']);
  buttons[0]!.click(); buttons[1]!.click(); buttons[4]!.click();
  expect(read).toHaveBeenCalledExactlyOnceWith('n1'); expect(dismiss).toHaveBeenCalledExactlyOnceWith('n1'); expect(preferences).toHaveBeenCalledOnce();
  expect(warn).not.toHaveBeenCalled();
});

it('names the layout and drawer inputs in their warnings', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  mount({ render: () => h('div', [
    h(loose(PortalLayout), { skipLabel: 'Skip', menuLabel: 'Menu', navigationLabel: 'Main', secondaryNavigation: [{ label: 'A', href: '/a' }], breadcrumbs: [{ label: 'Home', href: '/' }], footerLinks: [{ label: 'Terms', href: '/terms' }] }),
    h(loose(Drawer), { title: 'Filters', defaultOpen: true }, () => 'Body'),
  ]) });
  await nextTick();
  const messages = hawiyahWarnings(warn);
  for (const name of ['secondaryLabel', 'breadcrumbLabel', 'footerLabel', 'footerProps.externalLabel']) expect(messages.some(message => message.startsWith(`Hawiyah: PortalLayout requires "${name}"`))).toBe(true);
  expect(messages.some(message => message.startsWith('Hawiyah: Drawer requires "closeLabel"'))).toBe(true);
});

it('takes the name of RatingDisplay from aria-labelledby or getValueLabel without writing a second aria-label', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const named = mount({ render: () => h(loose(RatingDisplay), { value: 3, 'aria-labelledby': 'rating-heading' }) });
  expect(named.querySelector('.hw-rating-display')!.hasAttribute('aria-label')).toBe(false);
  expect(warn).not.toHaveBeenCalled();
  const unnamed = mount({ render: () => h(loose(RatingDisplay), { value: 3 }) });
  expect(unnamed.querySelector('.hw-rating-display')!.hasAttribute('aria-label')).toBe(false);
  expect(hawiyahWarnings(warn).filter(message => message.includes('RatingDisplay requires "getValueLabel"'))).toHaveLength(1);
});

it('renders the FileDropzone instruction only when dropLabel is given', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const root = mount({ render: () => h(loose(FileDropzone), { label: 'Attachments' }) });
  expect(root.querySelector('.hw-file-dropzone-instruction')).toBeNull();
  expect(root.querySelector('input[type=file]')!.getAttribute('aria-describedby') ?? '').not.toContain('-instruction');
  expect(hawiyahWarnings(warn).filter(message => message.includes('FileDropzone requires "dropLabel"'))).toHaveLength(1);
  const given = mount({ render: () => h(FileDropzone, { label: 'Attachments', ...dropzoneText }) });
  const instruction = given.querySelector('.hw-file-dropzone-instruction')!;
  expect(instruction.textContent).toBe(dropzoneText.dropLabel);
  expect(given.querySelector('input[type=file]')!.getAttribute('aria-describedby')!.split(' ')[0]).toBe(instruction.id);
});

it('accepts aria-label in place of a root label and warns once for an unnamed root', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const items = [{ label: 'Home', href: '/' }];
  mount({ render: () => h('div', [
    h(loose(Breadcrumb), { items, 'aria-label': 'Breadcrumb' }),
    h(loose(Pagination), { ...paginationText, label: undefined, totalPages: 3, 'aria-label': 'Pages' }),
    h(loose(Spinner), { 'aria-label': 'Loading' }),
    h(loose(Spinner), { 'aria-hidden': 'true' }),
    h(loose(Spinner), { 'aria-hidden': true }),
  ]) });
  expect(warn).not.toHaveBeenCalled();
  const root = mount({ render: () => h('div', [
    h(loose(Breadcrumb), { items }),
    h(loose(Pagination), { ...paginationText, label: undefined, totalPages: 3 }),
    h(loose(Spinner), {}),
  ]) });
  const messages = hawiyahWarnings(warn);
  for (const name of ['Breadcrumb', 'Pagination', 'Spinner']) expect(messages.filter(message => message.includes(`${name} requires "label"`))).toHaveLength(1);
  expect(messages).toHaveLength(3);
  expect(root.querySelector('.hw-breadcrumb')!.hasAttribute('aria-label')).toBe(false);
  expect(root.querySelector('.hw-pagination')!.hasAttribute('aria-label')).toBe(false);
  expect(root.querySelector('.hw-spinner')!.hasAttribute('aria-label')).toBe(false);
});

it('requires the Feedback comment texts in every use, before a reader answers', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const props = (Feedback as unknown as { props: Record<string, { required?: boolean }> }).props;
  expect(props.commentLabel!.required).toBe(true); expect(props.submitLabel!.required).toBe(true);
  const root = mount({ render: () => h(loose(Feedback), { label: 'Was this page helpful?', yesLabel: 'Yes', noLabel: 'No', successMessage: 'Thank you' }) });
  // Vue reports the missing props at mount; no answer has been chosen yet.
  const vue = warn.mock.calls.map(call => String(call[0]));
  for (const name of ['commentLabel', 'submitLabel']) expect(vue.some(message => message.includes(`Missing required prop: "${name}"`))).toBe(true);
  expect(hawiyahWarnings(warn).map(message => message.split('.')[0])).toEqual(['Hawiyah: Feedback requires "commentLabel"', 'Hawiyah: Feedback requires "submitLabel"']);
  // Choosing an answer shows the field and the button with nothing in place of the missing texts.
  root.querySelector<HTMLButtonElement>('.hw-feedback-actions button')!.click(); await nextTick();
  expect(root.querySelector('textarea')).not.toBeNull(); expect(root.querySelector('label')).toBeNull();
  expect(hawiyahWarnings(warn)).toHaveLength(2);
});

it('reports a SearchField that has no field name and accepts a label, an aria-label, an aria-labelledby or a parent Field', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  mount({ render: () => h('div', [
    h(SearchField, { clearLabel: 'Clear', label: 'Search' }),
    h(SearchField, { clearLabel: 'Clear', 'aria-label': 'Search' }),
    h('span', { id: 'search-heading' }, 'Search'), h(SearchField, { clearLabel: 'Clear', 'aria-labelledby': 'search-heading' }),
    h(Field, { label: 'Search' }, () => h(SearchField, { clearLabel: 'Clear' })),
  ]) });
  expect(warn).not.toHaveBeenCalled();
  const root = mount({ render: () => h('div', [h(SearchField, { clearLabel: 'Clear' }), h(SearchField, { clearLabel: 'Clear' })]) });
  expect(hawiyahWarnings(warn)).toEqual([expect.stringMatching(/^Hawiyah: SearchField requires "label"\./)]);
  const input = root.querySelector('input')!;
  expect(input.hasAttribute('aria-label')).toBe(false); expect(input.hasAttribute('aria-labelledby')).toBe(false); expect(root.querySelector('label')).toBeNull();
});

it('reports a tab list without a label and writes no empty name', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const items = [{ value: 'a', label: 'First', content: 'One' }, { value: 'b', label: 'Second', content: 'Two' }];
  const named = mount({ render: () => h(Tabs, { items, label: 'Sections', overflowLabel: 'More tabs' }) });
  expect(named.querySelector('[role=tablist]')!.getAttribute('aria-label')).toBe('Sections'); expect(hawiyahWarnings(warn)).toEqual([]);
  const unnamed = mount({ render: () => h(loose(Tabs), { items, overflowLabel: 'More tabs' }) });
  expect(unnamed.querySelector('[role=tablist]')!.hasAttribute('aria-label')).toBe(false);
  expect(hawiyahWarnings(warn)).toEqual([expect.stringMatching(/^Hawiyah: Tabs requires "label"\./)]);
});

it('keeps the space before externalLabel inside the visually hidden span', async () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  const root = mount({ render: () => h('div', [
    h(loose(SiteVerification), { label: 'Verified site', detailsLabel: 'Details', domainLabel: 'Domain', domainDescription: 'Official domain.', httpsLabel: 'HTTPS', httpsDescription: 'Encrypted.', registrationLabel: 'Registered', registrationHref: 'https://example.test/registry', registrationExternal: true, externalLabel: 'opens in a new tab' }),
    h(loose(PortalFooter), { navigationLabel: 'Footer', externalLabel: 'opens in a new tab', links: [{ label: 'Portal', href: 'https://example.test', external: true }] }),
  ]) });
  const links = [root.querySelector<HTMLAnchorElement>('.hw-verification-registration a')!, root.querySelector<HTMLAnchorElement>('.hw-portal-footer-links a')!];
  for (const link of links) {
    expect(link.textContent!.endsWith(' opens in a new tab')).toBe(true);
    expect(link.querySelector('.hw-sr-only')!.textContent).toBe(' opens in a new tab');
    expect(link.lastChild).toBe(link.querySelector('.hw-sr-only'));
  }
});

it('renders the CookieConsent policy link only with policyHref and requires policyLabel then', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const base = { title: 'Cookies', description: 'We use cookies.', acceptLabel: 'Accept', rejectLabel: 'Reject' };
  const none = mount({ render: () => h(CookieConsent, base) });
  expect(none.querySelector('a')).toBeNull();
  const given = mount({ render: () => h(CookieConsent, { ...base, policyHref: '/privacy', policyLabel: 'Cookie policy' }) });
  expect(given.querySelector('a')!.getAttribute('href')).toBe('/privacy');
  expect(given.querySelector('a')!.textContent).toBe('Cookie policy');
  expect(warn).not.toHaveBeenCalled();
  const missing = mount({ render: () => h(CookieConsent, { ...base, policyHref: '/privacy' }) });
  expect(missing.querySelector('a')!.textContent).toBe('');
  expect(hawiyahWarnings(warn).filter(message => message.includes('CookieConsent requires "policyLabel" when policyHref is set'))).toHaveLength(1);
});

it('requires Table emptyMessage only when columns is given', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  mount({ render: () => h(Table, { caption: 'Slots' }, () => h('tbody')) });
  expect(warn).not.toHaveBeenCalled();
  const root = mount({ render: () => h(Table, { caption: 'Requests', columns: [{ key: 'id', label: 'ID' }], rows: [] }) });
  expect(root.querySelector('tbody td')!.textContent).toBe('');
  expect(hawiyahWarnings(warn).filter(message => message.includes('Table requires "emptyMessage" when columns is given'))).toHaveLength(1);
});

it('sorts DataTable rows only with the application locale', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const rows = [{ name: 'ب' }, { name: 'a' }, { name: 'أ' }, { name: 'B' }];
  const props = { caption: 'Names', emptyMessage: 'No names', rows, columns: [{ key: 'name', label: 'Name', sortable: true }], defaultSortKey: 'name' };
  const cells = (root: Element) => [...root.querySelectorAll('tbody td, tbody th')].map(cell => cell.textContent);
  const missing = mount({ render: () => h(loose(DataTable), props) });
  expect(cells(missing)).toEqual(rows.map(row => row.name));
  expect(missing.querySelector('th[aria-sort]')!.getAttribute('aria-sort')).toBe('ascending');
  expect(hawiyahWarnings(warn).filter(message => message.includes('Hawiyah: DataTable requires "locale"'))).toHaveLength(1);
  const sorted = mount({ render: () => h(DataTable, { ...props, locale: 'ar-SA' }) });
  expect(cells(sorted)).toEqual(sortRows(rows, 'name', 'ascending', 'ar-SA').map(row => row.name));
});

it('renders Stat values as given and takes no locale', async () => {
  const root = mount({ render: () => h(loose(Stat), { label: 'Requests', value: 1234567, locale: 'ar-SA' }) });
  expect(root.querySelector('.hw-stat-value')!.textContent).toBe('1234567');
  expect(Object.keys((Stat as unknown as { props: object }).props)).not.toContain('locale');
});

it('renders no Intl output from Calendar and DatePicker without a locale, and the core output with one', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const value = '2026-11-11';
  const root = mount({ render: () => h('div', [
    h(loose(Calendar), { ...calendarText, locale: undefined, defaultValue: value }),
    h(loose(DatePicker), { ...datePickerText, label: 'Date', locale: undefined, defaultValue: value }),
  ]) });
  await nextTick();
  const calendar = root.querySelector('.hw-calendar')!;
  expect(calendar.querySelector('table, .hw-calendar-toolbar')).toBeNull();
  expect(calendar.querySelector<HTMLInputElement>('input[type=hidden]')!.value).toBe(value);
  const input = root.querySelector<HTMLInputElement>('.hw-date-picker input.hw-input')!;
  expect(input.value).toBe(value);
  expect(root.querySelector('[id$="-formatted"]')?.textContent ?? '').toBe('');
  const messages = hawiyahWarnings(warn);
  expect(messages.filter(message => message.includes('Hawiyah: Calendar requires "locale"'))).toHaveLength(1);
  expect(messages.filter(message => message.includes('Hawiyah: DatePicker requires "locale"'))).toHaveLength(1);
  const localized = mount({ render: () => h('div', [
    h(Calendar, { ...calendarText, locale: 'ar-SA', defaultValue: value }),
    h(DatePicker, { ...datePickerText, label: 'Date', locale: 'ar-SA', defaultValue: value }),
  ]) });
  await nextTick();
  const month = getCalendarMonth({ month: value, value, locale: 'ar-SA', calendar: 'gregory', weekStartsOn: 0, fixedWeeks: true });
  expect(localized.querySelector('.hw-calendar-heading [aria-live]')!.textContent).toBe(month.label);
  expect([...localized.querySelector('.hw-calendar')!.querySelectorAll('thead th')].map(cell => cell.textContent)).toEqual(month.weekdays);
  expect(localized.querySelector('[id$="-formatted"]')!.textContent).toBe(formatCalendarDate(value, { locale: 'ar-SA', calendar: 'gregory', dateStyle: 'full' }));
  expect(localized.querySelector<HTMLInputElement>('.hw-date-picker input.hw-input')!.value).toBe(formatCalendarDate(value, { locale: 'ar-SA', calendar: 'gregory', dateStyle: 'medium' }));
});

it('chooses no locale: no Intl, toLocaleString, localeCompare or locale literal in packages/vue/src', () => {
  const directory = join(__dirname, '../src');
  expect(readdirSync(directory).filter(name => name.endsWith('.ts')).length).toBeGreaterThan(10);
  for (const file of readdirSync(directory).filter(name => name.endsWith('.ts'))) {
    const source = readFileSync(join(directory, file), 'utf8');
    expect(source, file).not.toMatch(/\bIntl\.|toLocale\w*\(|localeCompare|resolvedOptions|\b[a-z]{2}-[A-Z]{2}\b|navigator\.language/);
  }
});

it('[NAME-01][NAME-02][NAME-03][NAME-04][E05] Tabs and TreeView are named by label, aria-label or aria-labelledby on the tablist or tree; none warns once', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const tabs = [{ value: 'a', label: 'A', content: 'First' }];
  const nodes = [{ id: 'a', label: 'A' }];
  const tree = { items: nodes, getExpandLabel: () => 'Expand', getCollapseLabel: () => 'Collapse' };
  const root = mount({ render: () => h('div', [
    h('h2', { id: 'heading' }, 'Sections'),
    h(Tabs, { items: tabs, overflowLabel: 'More tabs', label: 'By label' }),
    h(Tabs, { items: tabs, overflowLabel: 'More tabs', 'aria-label': 'By attribute' }),
    h(Tabs, { items: tabs, overflowLabel: 'More tabs', 'aria-labelledby': 'heading' }),
    h(TreeView, { ...tree, label: 'By label' }),
    h(TreeView, { ...tree, 'aria-label': 'By attribute' }),
    h(TreeView, { ...tree, 'aria-labelledby': 'heading' }),
  ]) });
  await nextTick();
  const names = [...root.querySelectorAll('[role=tablist], [role=tree]')].map(node => [node.getAttribute('aria-label'), node.getAttribute('aria-labelledby')]);
  expect(names).toEqual([['By label', null], ['By attribute', null], [null, 'heading'], ['By label', null], ['By attribute', null], [null, 'heading']]);
  for (const wrapper of root.querySelectorAll('.hw-tabs')) { expect(wrapper.hasAttribute('aria-label')).toBe(false); expect(wrapper.hasAttribute('aria-labelledby')).toBe(false); }
  expect(hawiyahWarnings(warn)).toEqual([]);
  const unnamed = mount({ render: () => h('div', [h(loose(Tabs), { items: tabs, overflowLabel: 'More tabs' }), h(loose(TreeView), tree)]) });
  await nextTick();
  expect(unnamed.querySelectorAll('[role=tablist][aria-label], [role=tree][aria-label]')).toHaveLength(0);
  expect(hawiyahWarnings(warn)).toEqual([expect.stringMatching(/^Hawiyah: Tabs requires "label"/), expect.stringMatching(/^Hawiyah: TreeView requires "label"/)]);
});
