// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createApp, createSSRApp, h, nextTick } from 'vue';
import type { App, Component } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { resetTextWarnings } from '@hawiyah/core';
import { AppShell, Carousel, ContentNavigation, CookieConsent, Dialog, Drawer, NotificationList, Pagination, PortalHeader, PortalLayout, Rating, RatingDisplay, TagInput, ToastRegion, TreeView } from '../src/index.js';

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
  expect(plain!.tagName).toBe('SPAN'); expect(plain!.hasAttribute('href')).toBe(false); expect(plain!.getAttribute('role')).not.toBe('link');
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
    h('div', { class: 'without' }, [h(NotificationList, { label: 'Notifications', emptyMessage: 'None', items }), h(CookieConsent, { title: 'Cookies', description: 'Choose', acceptLabel: 'Accept', rejectLabel: 'Reject' })]),
    h('div', { class: 'with' }, [
      h(NotificationList, { label: 'Notifications', emptyMessage: 'None', items, getMarkReadLabel: item => `Mark ${item.title} as read`, getDismissLabel: item => `Dismiss ${item.title}`, onRead: read, onDismiss: dismiss }),
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
