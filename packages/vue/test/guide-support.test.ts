import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createApp, createSSRApp, h, nextTick, ref } from 'vue';
import type { App, Component, VNodeChild } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { bindLinkNavigation, resetTextWarnings } from '@hawiyah/core';
import type { LinkNavigation } from '@hawiyah/core';
import { AppShell, Breadcrumb, ContentNavigation, NavigationDrawer, PortalHeader, PortalLayout, SideNavigation, ToggleGroup } from '../src/index.js';
import type { SideNavigationItem } from '../src/index.js';

const apps: App[] = []; const cleanups: (() => void)[] = [];
let warn: ReturnType<typeof vi.spyOn>; let error: ReturnType<typeof vi.spyOn>;
const warnings = () => (warn.mock.calls as unknown[][]).map(call => String(call[0])).filter(message => message.startsWith('Hawiyah:'));
const loose = (component: unknown) => component as Component;
function mount(render: () => VNodeChild) { const root = document.createElement('div'); document.body.append(root); const app = createApp({ render }); apps.push(app); app.mount(root); return root; }
const flush = async () => { for (let index = 0; index < 10; index += 1) await Promise.resolve(); await nextTick(); };
const before = (first: Node, second: Node) => Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING);
const withoutComments = (html: string) => html.replace(/<!--[\s\S]*?-->/g, '');
// Stops the test DOM from following a link that no handler prevented, after every assertion listener ran.
function settleClicks(record?: (event: MouseEvent) => void) { const listener = (event: Event) => { record?.(event as MouseEvent); event.preventDefault(); }; window.addEventListener('click', listener); cleanups.push(() => window.removeEventListener('click', listener)); }
function routed() { const paths: string[] = []; const links: LinkNavigation = bindLinkNavigation(document, { navigate: ({ path }) => { paths.push(path); } }); cleanups.push(() => links.destroy()); return paths; }
const drawerText = { title: 'القائمة', navigationLabel: 'التنقل الرئيسي', closeLabel: 'إغلاق القائمة' } as const;
const items: SideNavigationItem[] = [
  { id: 'home', label: 'الرئيسية', href: '/home', icon: 'home-06' },
  { id: 'components', label: 'المكونات', children: [{ id: 'button', label: 'الزر', href: '/components/button', current: true }, { id: 'forms', label: 'النماذج', children: [{ id: 'field', label: 'الحقل', href: '/components/field' }] }] },
  { id: 'guides', label: 'الأدلة', href: '/guides', children: [{ id: 'start', label: 'البدء', href: '/guides/start' }] },
  { id: 'note', label: 'ملاحظة' },
  { id: 'soon', label: 'قريبا', href: '/soon', disabled: true, children: [{ id: 'hidden', label: 'مخفي', href: '/hidden' }] },
];
const group = (root: Element, id: string) => root.querySelector<HTMLDetailsElement>(`li[data-hw-value="${id}"] > details`)!;

beforeEach(() => {
  resetTextWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); error = vi.spyOn(console, 'error').mockImplementation(() => {});
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value() { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value() { this.open = false; this.dispatchEvent(new Event('close')); } });
});
afterEach(() => { apps.splice(0).forEach(app => app.unmount()); cleanups.splice(0).forEach(cleanup => cleanup()); document.body.replaceChildren(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });

// SideNavigation
it('[sn-root] renders a labelled nav with the two classes and one list', () => {
  const root = mount(() => h(SideNavigation, { label: 'أقسام الدليل', items, class: 'application' }));
  const nav = root.firstElementChild!;
  expect(nav.tagName).toBe('NAV'); expect(nav.className).toBe('hw-side-navigation hw-navigation-drawer-nav application'); expect(nav.getAttribute('aria-label')).toBe('أقسام الدليل');
  expect(nav.children).toHaveLength(1); expect(nav.firstElementChild!.tagName).toBe('UL'); expect(warnings()).toEqual([]);
});
it('[sn-kinds] renders each item kind', () => {
  const root = mount(() => h(SideNavigation, { label: 'أقسام', items }));
  const row = (id: string) => root.querySelector(`li[data-hw-value="${id}"]`)!.firstElementChild!;
  const disabled = row('soon'); expect(disabled.tagName).toBe('SPAN'); expect(disabled.className).toBe('hw-navigation-drawer-row'); expect(disabled.getAttribute('aria-disabled')).toBe('true');
  expect(root.querySelector('[data-hw-value="hidden"], a[href="/soon"], a[href="/hidden"]')).toBeNull();
  const details = row('components'); expect(details.tagName).toBe('DETAILS'); expect(details.className).toBe('hw-navigation-drawer-group');
  expect(details.firstElementChild!.tagName).toBe('SUMMARY'); expect(details.firstElementChild!.className).toBe('hw-navigation-drawer-row'); expect(details.lastElementChild!.tagName).toBe('UL');
  const link = row('home'); expect(link.tagName).toBe('A'); expect(link.getAttribute('href')).toBe('/home'); expect(link.className).toBe('hw-navigation-drawer-row');
  const text = row('note'); expect(text.tagName).toBe('SPAN'); expect(text.className).toBe('hw-navigation-drawer-row'); expect(text.hasAttribute('aria-disabled')).toBe(false);
  const icon = link.querySelector('.hw-icon')!; expect(icon.getAttribute('data-icon')).toBe('home-06'); expect(icon.getAttribute('aria-hidden')).toBe('true'); expect(link.lastElementChild!.className).toBe('hw-navigation-drawer-label');
  expect(text.querySelector('.hw-icon')).toBeNull(); expect(text.textContent).toBe('ملاحظة');
});
it('[sn-current] marks only the current link', () => {
  const root = mount(() => h(SideNavigation, { label: 'أقسام', items: [...items, { id: 'plain', label: 'نص', current: true }, { id: 'off', label: 'معطل', href: '/off', current: true, disabled: true }] }));
  const current = root.querySelectorAll('[aria-current]'); expect(current).toHaveLength(1);
  expect(current[0]!.tagName).toBe('A'); expect(current[0]!.getAttribute('aria-current')).toBe('page'); expect(current[0]!.getAttribute('href')).toBe('/components/button');
});
it('[sn-group-href] repeats a group with its own href as the first link', () => {
  const root = mount(() => h(SideNavigation, { label: 'أقسام', items: [{ id: 'guides', label: 'الأدلة', href: '/guides', current: true, children: [{ id: 'start', label: 'البدء', href: '/guides/start' }] }] }));
  const details = group(root, 'guides'); expect(details.querySelector('summary a')).toBeNull();
  const first = details.querySelector('ul > li')!; expect(first.getAttribute('data-hw-value')).toBe('guides-page');
  expect(first.firstElementChild!.getAttribute('href')).toBe('/guides'); expect(first.firstElementChild!.getAttribute('aria-current')).toBe('page'); expect(details.hasAttribute('open')).toBe(true);
});
it('[sn-group-open] opens the group of the current page and expanded groups', () => {
  const root = mount(() => h(SideNavigation, { label: 'أقسام', items: [
    { id: 'deep', label: 'عميق', children: [{ id: 'inner', label: 'داخلي', children: [{ id: 'leaf', label: 'ورقة', href: '/leaf', current: true }] }] },
    { id: 'expanded', label: 'موسع', expanded: true, children: [{ id: 'a', label: 'أ', href: '/a' }] },
    { id: 'closed', label: 'مغلق', children: [{ id: 'b', label: 'ب', href: '/b' }] },
  ] }));
  expect(group(root, 'deep').hasAttribute('open')).toBe(true); expect(group(root, 'inner').hasAttribute('open')).toBe(true);
  expect(group(root, 'expanded').hasAttribute('open')).toBe(true); expect(group(root, 'closed').hasAttribute('open')).toBe(false);
});
it('[sn-reader-toggle-stands] keeps the reader toggles across a re-render with the same open values', async () => {
  const list = ref(items); const root = mount(() => h(SideNavigation, { label: 'أقسام', items: list.value }));
  group(root, 'components').open = false; group(root, 'guides').open = true;
  list.value = items.map(item => item.id === 'note' ? { ...item, label: 'ملاحظة جديدة' } : { ...item }); await nextTick();
  expect(root.querySelector('[data-hw-value="note"]')!.textContent).toBe('ملاحظة جديدة');
  expect(group(root, 'components').hasAttribute('open')).toBe(false); expect(group(root, 'guides').hasAttribute('open')).toBe(true);
});
it('[sn-current-moves] opens the group of the new current page and closes the old one', async () => {
  const build = (expanded: boolean, inB: boolean): SideNavigationItem[] => [
    { id: 'a', label: 'أ', expanded, children: [{ id: 'a1', label: 'أ ١', href: '/a1', current: !inB }] },
    { id: 'b', label: 'ب', children: [{ id: 'b1', label: 'ب ١', href: '/b1', current: inB }] },
  ];
  for (const expanded of [false, true]) {
    const list = ref(build(expanded, false)); const root = mount(() => h(SideNavigation, { label: 'أقسام', items: list.value }));
    expect(group(root, 'a').hasAttribute('open')).toBe(true); expect(group(root, 'b').hasAttribute('open')).toBe(false);
    list.value = build(expanded, true); await nextTick();
    expect(group(root, 'b').hasAttribute('open')).toBe(true); expect(group(root, 'a').hasAttribute('open')).toBe(expanded);
  }
});
it('[sn-sticky] writes data-sticky only when sticky', () => {
  const root = mount(() => h('div', [h(SideNavigation, { label: 'أ', items, sticky: true }), h(SideNavigation, { label: 'ب', items })]));
  const [sticky, plain] = [...root.querySelectorAll('nav')];
  expect(sticky!.getAttribute('data-sticky')).toBe('true'); expect(plain!.hasAttribute('data-sticky')).toBe(false);
});
it('[sn-reveal] scrolls only the navigation to the current link after mount and when the current page changes', async () => {
  const navScroll = vi.fn(); const windowScroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {}); const intoView = vi.fn();
  const define = (target: object, key: string, descriptor: PropertyDescriptor) => { Object.defineProperty(target, key, { configurable: true, ...descriptor }); cleanups.push(() => { delete (target as Record<string, unknown>)[key]; }); };
  define(HTMLElement.prototype, 'clientHeight', { get(this: HTMLElement) { return this.tagName === 'NAV' ? 200 : 20; } });
  define(HTMLElement.prototype, 'scrollHeight', { get(this: HTMLElement) { return this.tagName === 'NAV' ? 2000 : 20; } });
  define(HTMLElement.prototype, 'getBoundingClientRect', { value(this: HTMLElement) { const top = this.tagName === 'NAV' ? 0 : this.getAttribute('aria-current') === 'page' ? 900 : 10; const height = this.tagName === 'NAV' ? 200 : 20; return { top, bottom: top + height, left: 0, right: 200, x: 0, y: top, width: 200, height, toJSON() {} }; } });
  define(HTMLElement.prototype, 'scrollTo', { value(this: HTMLElement, options: ScrollToOptions) { navScroll(this.tagName, options); } });
  define(Element.prototype, 'scrollIntoView', { value: intoView });
  const list = ref(items); const outside = document.createElement('button'); document.body.append(outside); outside.focus();
  mount(() => h(SideNavigation, { label: 'أقسام', items: list.value })); await nextTick();
  expect(navScroll).toHaveBeenCalledTimes(1); expect(navScroll.mock.calls[0]![0]).toBe('NAV'); expect(navScroll.mock.calls[0]![1]).toMatchObject({ behavior: 'instant' });
  expect(windowScroll).not.toHaveBeenCalled(); expect(intoView).not.toHaveBeenCalled(); expect(document.activeElement).toBe(outside);
  list.value = items.map(item => item.id === 'note' ? { ...item, label: 'تغيير' } : item); await nextTick(); await nextTick();
  expect(navScroll).toHaveBeenCalledTimes(1);
  list.value = items.map(item => item.id === 'components' ? { ...item, children: [{ id: 'button', label: 'الزر', href: '/components/button' }, { id: 'forms', label: 'النماذج', children: [{ id: 'field', label: 'الحقل', href: '/components/field', current: true }] }] } : item); await nextTick(); await nextTick();
  expect(navScroll).toHaveBeenCalledTimes(2); expect(navScroll.mock.calls[1]![0]).toBe('NAV');
  expect(windowScroll).not.toHaveBeenCalled(); expect(intoView).not.toHaveBeenCalled(); expect(document.activeElement).toBe(outside);
});
it('[sn-missing-label] omits the name and warns once without a label', () => {
  const root = mount(() => h('div', [h(loose(SideNavigation), { items }), h(loose(SideNavigation), { items })]));
  for (const nav of root.querySelectorAll('nav')) expect(nav.hasAttribute('aria-label')).toBe(false);
  expect(warnings()).toEqual([expect.stringContaining('SideNavigation requires "label"')]);
  resetTextWarnings(); warn.mockClear();
  const named = mount(() => h('div', [h(SideNavigation, { label: 'أقسام', items }), h(loose(SideNavigation), { items, 'aria-label': 'أقسام الدليل' }), h('h2', { id: 'heading' }, 'الدليل'), h(loose(SideNavigation), { items, 'aria-labelledby': 'heading' })]));
  expect(named.querySelectorAll('nav')[1]!.getAttribute('aria-label')).toBe('أقسام الدليل'); expect(warnings()).toEqual([]);
});
it('[sn-no-listeners] leaves link clicks to the browser and emits nothing', () => {
  const root = mount(() => h(SideNavigation, { label: 'أقسام', items }));
  let prevented: boolean | undefined; settleClicks(event => { prevented = event.defaultPrevented; });
  root.querySelector<HTMLAnchorElement>('a[href="/home"]')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
  expect(prevented).toBe(false);
});
it('[sn-shared-list] renders the same list as an open NavigationDrawer', async () => {
  const root = mount(() => h('div', [h(SideNavigation, { label: drawerText.navigationLabel, items }), h(NavigationDrawer, { ...drawerText, items, defaultOpen: true })]));
  await nextTick();
  const side = root.querySelector('nav.hw-side-navigation')!; const drawer = root.querySelector('dialog nav.hw-navigation-drawer-nav')!;
  expect(drawer).not.toBe(side); expect(withoutComments(side.innerHTML)).toBe(withoutComments(drawer.innerHTML));
});
it('[sn-server] renders open groups and the current page on the server and hydrates without a mismatch', async () => {
  const measure = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect');
  const application = { render: () => h(SideNavigation, { label: 'أقسام', items, sticky: true }) };
  const markup = await renderToString(createSSRApp(application));
  expect(markup).toMatch(/<details class="hw-navigation-drawer-group" open/); expect(markup).toContain('aria-current="page"'); expect(measure).not.toHaveBeenCalled();
  const container = document.createElement('div'); container.innerHTML = markup; document.body.append(container);
  const html = container.innerHTML; const app = createSSRApp(application); apps.push(app); app.mount(container); await nextTick();
  expect(warn).not.toHaveBeenCalled(); expect(error).not.toHaveBeenCalled(); expect(container.innerHTML).toBe(html);
  expect(group(container, 'components').open).toBe(true); expect(group(container, 'guides').open).toBe(false);
});

// NavigationDrawer
it('[nd-group-open] opens the group that holds the current page and expanded groups', async () => {
  const root = mount(() => h(NavigationDrawer, { ...drawerText, defaultOpen: true, items: [...items, { id: 'more', label: 'المزيد', expanded: true, children: [{ id: 'm', label: 'م', href: '/m' }] }] }));
  await nextTick();
  expect(group(root, 'components').hasAttribute('open')).toBe(true); expect(group(root, 'more').hasAttribute('open')).toBe(true);
  expect(group(root, 'guides').hasAttribute('open')).toBe(false); expect(group(root, 'forms').hasAttribute('open')).toBe(false);
});
it('[nd-closes-after-routed-click] [ln-drawer-closes] closes after a click the application routed', async () => {
  const paths = routed();
  const root = mount(() => h(NavigationDrawer, { ...drawerText, defaultOpen: true, items })); await nextTick();
  const dialog = root.querySelector('dialog')!; expect(dialog.open).toBe(true);
  root.querySelector<HTMLAnchorElement>('a[href="/home"]')!.click(); await flush();
  expect(paths).toEqual(['/home']); expect(dialog.open).toBe(false);
  cleanups.splice(0).forEach(cleanup => cleanup());
  const preventOnly = (event: Event) => event.preventDefault(); document.addEventListener('click', preventOnly); cleanups.push(() => document.removeEventListener('click', preventOnly));
  const second = mount(() => h(NavigationDrawer, { ...drawerText, defaultOpen: true, items })); await nextTick();
  second.querySelector<HTMLAnchorElement>('a[href="/home"]')!.click(); await flush();
  expect(second.querySelector('dialog')!.open).toBe(true);
  cleanups.splice(0).forEach(cleanup => cleanup());
  const modified = routed(); settleClicks();
  const third = mount(() => h(NavigationDrawer, { ...drawerText, defaultOpen: true, items })); await nextTick();
  third.querySelector<HTMLAnchorElement>('a[href="/home"]')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true })); await flush();
  expect(modified).toEqual([]); expect(third.querySelector('dialog')!.open).toBe(true);
});

// Client-side routing through core bindLinkNavigation
it('[ln-routed] hands packaged links to the application router', () => {
  const paths = routed();
  const root = mount(() => h('div', [h(Breadcrumb, { label: 'مسار التنقل', items: [{ label: 'الأدلة', href: '/guides' }, { label: 'البدء', current: true }] }), h(SideNavigation, { label: 'أقسام', items })]));
  const crumb = new MouseEvent('click', { bubbles: true, cancelable: true }); root.querySelector('.hw-breadcrumb a')!.dispatchEvent(crumb);
  const side = new MouseEvent('click', { bubbles: true, cancelable: true }); root.querySelector('.hw-side-navigation a[href="/components/button"]')!.dispatchEvent(side);
  expect(paths).toEqual(['/guides', '/components/button']); expect(crumb.defaultPrevented).toBe(true); expect(side.defaultPrevented).toBe(true);
});
it('[ln-modified] leaves modified and non-primary clicks to the browser', () => {
  const paths = routed(); const states: boolean[] = []; settleClicks(event => states.push(event.defaultPrevented));
  const root = mount(() => h(SideNavigation, { label: 'أقسام', items })); const link = root.querySelector('a[href="/home"]')!;
  for (const init of [{ ctrlKey: true }, { metaKey: true }, { button: 1 }]) link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...init }));
  expect(paths).toEqual([]); expect(states).toEqual([false, false, false]);
});
it('[ln-prevented] leaves a click the application prevented', () => {
  const paths = routed();
  const root = mount(() => h(SideNavigation, { label: 'أقسام', items })); const link = root.querySelector('a[href="/home"]')!;
  link.addEventListener('click', event => event.preventDefault());
  link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); expect(paths).toEqual([]);
});
it('[ln-no-handler-prevents] packaged link handlers never prevent a plain navigation', async () => {
  const states: boolean[] = []; settleClicks(event => states.push(event.defaultPrevented));
  const root = mount(() => h('div', [h(PortalHeader, { brand: 'هوية', menuLabel: 'القائمة', navigationLabel: 'التنقل الرئيسي', links: [{ label: 'الخدمات', href: '/services' }, { label: 'الدليل', href: '/guide', groups: [{ label: 'البدء', links: [{ label: 'التثبيت', href: '/guide/install' }] }] }] }), h(NavigationDrawer, { ...drawerText, defaultOpen: true, items })]));
  await nextTick();
  const links = [...root.querySelectorAll<HTMLAnchorElement>('.hw-portal-header nav a, dialog nav a')]; expect(links.length).toBeGreaterThan(3);
  for (const link of links) link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  expect(states).toEqual(links.map(() => false));
});
it('[ln-server] adds no listener while rendering on the server', async () => {
  const add = vi.spyOn(document, 'addEventListener'); const addWindow = vi.spyOn(window, 'addEventListener');
  const markup = await renderToString(createSSRApp({ render: () => h('div', [h(Breadcrumb, { label: 'مسار', items: [{ label: 'أ', href: '/a' }] }), h(SideNavigation, { label: 'أقسام', items }), h(PortalHeader, { brand: 'هوية', menuLabel: 'القائمة', navigationLabel: 'التنقل', links: [{ label: 'أ', href: '/a' }] }), h(NavigationDrawer, { ...drawerText, items })]) }));
  expect(markup).toContain('hw-side-navigation'); expect(add).not.toHaveBeenCalled(); expect(addWindow).not.toHaveBeenCalled();
});

// ToggleGroup labelHidden
const options = [{ value: 'light', label: 'فاتح' }, { value: 'dark', label: 'داكن' }];
it('[tg-label-hidden] hides the legend visually and keeps it first with its text', () => {
  const root = mount(() => h(ToggleGroup, { label: 'المظهر', labelHidden: true, options }));
  const fieldset = root.querySelector('fieldset')!; const legend = fieldset.firstElementChild!;
  expect(legend.tagName).toBe('LEGEND'); expect(legend.className).toBe('hw-label hw-sr-only'); expect(legend.textContent).toBe('المظهر');
  expect(fieldset.hasAttribute('labelhidden')).toBe(false); expect(fieldset.hasAttribute('label-hidden')).toBe(false);
});
it('[tg-label-visible] keeps the visible legend by default', () => {
  const root = mount(() => h('div', [h(ToggleGroup, { label: 'المظهر', options }), h(ToggleGroup, { label: 'الحجم', labelHidden: false, options })]));
  for (const legend of root.querySelectorAll('legend')) expect(legend.className).toBe('hw-label');
});
it('[tg-name-unchanged] keeps the name, options and value in single and multiple mode', async () => {
  const single = vi.fn(); const multiple = vi.fn();
  const root = mount(() => h('div', [h(ToggleGroup, { label: 'المظهر', labelHidden: true, options, 'onUpdate:modelValue': single }), h(ToggleGroup, { multiple: true, label: 'الأنماط', labelHidden: true, options, 'onUpdate:modelValue': multiple })]));
  const [first, second] = [...root.querySelectorAll('fieldset')];
  for (const [fieldset, text] of [[first!, 'المظهر'], [second!, 'الأنماط']] as const) { expect(fieldset.hasAttribute('aria-label')).toBe(false); expect(fieldset.hasAttribute('aria-labelledby')).toBe(false); expect(fieldset.querySelector('legend')!.textContent).toBe(text); }
  expect(first!.querySelectorAll('input[type="radio"]')).toHaveLength(2); expect(second!.querySelectorAll('button[aria-pressed]')).toHaveLength(2);
  first!.querySelector<HTMLInputElement>('input[value="dark"]')!.click(); await nextTick(); expect(single).toHaveBeenCalledWith('dark');
  second!.querySelector<HTMLButtonElement>('button')!.click(); await nextTick(); expect(multiple).toHaveBeenCalledWith(['light']);
  expect(warnings()).toEqual([]);
});
it('[tg-hint-error] leaves the description association unchanged', () => {
  // Vue ToggleGroup has no hint or error inputs: an application aria-describedby is the association, with and without labelHidden.
  const root = mount(() => h('div', [h('p', { id: 'theme-hint' }, 'يطبق على كل الصفحات'), h(ToggleGroup, { label: 'المظهر', options, 'aria-describedby': 'theme-hint' }), h(ToggleGroup, { label: 'المظهر', labelHidden: true, options, 'aria-describedby': 'theme-hint' })]));
  const [visible, hidden] = [...root.querySelectorAll('fieldset')];
  expect(hidden!.getAttribute('aria-describedby')).toBe(visible!.getAttribute('aria-describedby')); expect(hidden!.getAttribute('aria-describedby')).toBe('theme-hint');
});

// PortalHeader notice and actions
const header = { brand: 'هوية', navigationLabel: 'التنقل الرئيسي', menuLabel: 'القائمة', links: [{ label: 'الخدمات', href: '#services' }] };
it('[ph-notice] renders the notice after the skip link and before the brand', () => {
  const root = mount(() => h(PortalHeader, { ...header, mainId: 'main', skipLabel: 'انتقل إلى المحتوى' }, { notice: () => h('p', 'موقع حكومي رسمي') }));
  const portal = root.querySelector('header.hw-portal-header')!; const notice = portal.querySelector('.hw-portal-notice')!;
  expect(notice.tagName).toBe('DIV'); expect(notice.parentElement).toBe(portal); expect(notice.innerHTML).toBe('<p>موقع حكومي رسمي</p>');
  expect(before(portal.querySelector('a.hw-skip-link')!, notice)).toBe(true); expect(before(notice, portal.querySelector('.hw-portal-brand')!)).toBe(true);
});
it('[ph-notice-absent] renders no notice container without a notice', () => {
  const root = mount(() => h(PortalHeader, header)); expect(root.querySelector('.hw-portal-notice')).toBeNull();
});
it('[ph-notice-no-text-contract] adds no text requirement, role or aria attribute to the notice', () => {
  const root = mount(() => h('div', [h(PortalHeader, header), h(PortalHeader, header, { notice: () => 'إشعار' })]));
  const notice = root.querySelector('.hw-portal-notice')!;
  expect([...notice.attributes].map(attribute => attribute.name)).toEqual(['class']); expect(warnings()).toEqual([]);
});
it('[ph-actions-class] renders actions in hw-portal-header-actions after the nav', () => {
  const root = mount(() => h(PortalHeader, header, { actions: () => h('a', { href: '/login' }, 'تسجيل الدخول') }));
  const actions = root.querySelector('.hw-portal-header-actions')!;
  expect(actions.tagName).toBe('DIV'); expect(actions.textContent).toBe('تسجيل الدخول'); expect(before(root.querySelector('header nav')!, actions)).toBe(true);
  expect(root.querySelector('.hw-portal-actions')).toBeNull();
});
it('[ph-actions-absent] renders no actions container without actions', () => {
  const root = mount(() => h(PortalHeader, header)); expect(root.querySelector('.hw-portal-header-actions, .hw-portal-actions')).toBeNull();
});
it('[ph-layout-notice] forwards the PortalLayout notice slot to its header', () => {
  const root = mount(() => h(PortalLayout, { ...header, mainId: 'main', skipLabel: 'انتقل إلى المحتوى', footerProps: { externalLabel: 'يفتح في نافذة جديدة' } }, { notice: () => h('p', 'موقع حكومي رسمي'), default: () => h('h1', 'العنوان') }));
  const notice = root.querySelector('header.hw-portal-header > .hw-portal-notice')!; expect(notice.textContent).toBe('موقع حكومي رسمي'); expect(warnings()).toEqual([]);
});
it('[ph-menu-unchanged] keeps the menu disclosure with both regions filled', async () => {
  const root = mount(() => h('div', [h(PortalHeader, header, { notice: () => h('a', { href: '/about' }, 'كيف تتحقق'), actions: () => h('button', 'دخول') }), h('button', { id: 'outside' }, 'خارج')]));
  const trigger = root.querySelector<HTMLButtonElement>('.hw-portal-menu-toggle')!; const nav = root.querySelector('header nav')! as HTMLElement; const link = nav.querySelector('a')!;
  trigger.click(); await nextTick(); expect(nav.dataset.open).toBe('true'); link.focus();
  link.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })); await nextTick();
  expect(nav.dataset.open).toBe('false'); expect(document.activeElement).toBe(trigger);
});

// AppShell regions (no source change)
it('[al-app-shell-regions] renders the shell regions without its own banner or contentinfo', () => {
  const root = mount(() => h(AppShell, { mainId: 'main', skipLabel: 'انتقل إلى المحتوى' }, { header: () => h('header', 'الترويسة'), sidebar: () => h('nav', { 'aria-label': 'أقسام' }, 'روابط'), footer: () => h('p', 'التذييل'), default: () => h('h1', 'العنوان') }));
  const shell = root.querySelector('.hw-app-shell')!;
  expect(shell.querySelector('.hw-app-shell-header')!.tagName).toBe('DIV'); expect(shell.querySelector('.hw-app-shell-sidebar')!.tagName).toBe('ASIDE');
  expect(shell.querySelector('.hw-app-shell-main')!.tagName).toBe('MAIN'); expect(shell.querySelector('.hw-app-shell-footer')!.tagName).toBe('DIV');
  const headers = shell.querySelectorAll('header'); expect(headers).toHaveLength(1); expect(headers[0]!.parentElement!.className).toBe('hw-app-shell-header');
  expect(shell.querySelector('footer')).toBeNull();
});

// ContentNavigation: the layout is mocked as in the core hold tests.
const sections = ['one', 'two', 'three', 'four', 'five'];
async function contentNavigation(onCurrentChange: (id: string) => void) {
  let y = 0; vi.useFakeTimers();
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  const number = (element: object, key: string, value: () => number) => Object.defineProperty(element, key, { configurable: true, get: value });
  number(window, 'scrollY', () => y); number(window, 'innerHeight', () => 600); number(document.documentElement, 'scrollHeight', () => 3000); number(document.body, 'scrollHeight', () => 3000);
  (window as { onscrollend?: unknown }).onscrollend = null;
  cleanups.push(() => { delete (window as { onscrollend?: unknown }).onscrollend; for (const [element, key] of [[window, 'scrollY'], [window, 'innerHeight'], [document.documentElement, 'scrollHeight'], [document.body, 'scrollHeight']] as const) delete (element as unknown as Record<string, unknown>)[key]; });
  const tops = [0, 500, 1000, 1500, 2400], heights = [500, 500, 500, 900, 600];
  const root = mount(() => h('div', [h(ContentNavigation, { label: 'في هذه الصفحة', items: sections.map(id => ({ id, label: id })), onCurrentChange }), ...sections.map(id => h('section', { key: id, id }))]));
  const rect = (element: Element, top: () => number, height: number) => { (element as HTMLElement).getBoundingClientRect = () => ({ top: top(), bottom: top() + height, left: 0, right: 300, x: 0, y: top(), height, width: 300, toJSON() {} }) as DOMRect; };
  rect(root.querySelector('nav')!, () => 0, 100);
  sections.forEach((id, index) => rect(document.getElementById(id)!, () => tops[index]! - y, heights[index]!));
  const frame = async (ms = 20) => { await vi.advanceTimersByTimeAsync(ms); await nextTick(); };
  const scroll = async (position: number) => { y = position; window.dispatchEvent(new Event('scroll')); await frame(); };
  window.dispatchEvent(new Event('resize')); await frame();
  return { root, frame, scroll, link: (id: string) => root.querySelector<HTMLAnchorElement>(`a[data-hw-section="${id}"]`)! };
}
it('[cn-one-change] reports one change for one activation while a smooth scroll passes the sections between', async () => {
  const changes: string[] = []; const { root, scroll, frame, link } = await contentNavigation(id => changes.push(id));
  const start = changes.length; const marked: string[] = [];
  link('five').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 })); await nextTick();
  for (const position of [120, 480, 900, 1300, 1800, 2200, 2320]) { await scroll(position); marked.push(...Array.from(root.querySelectorAll('a[aria-current="location"]'), element => element.getAttribute('data-hw-section')!)); }
  window.dispatchEvent(new Event('scrollend')); await frame();
  expect(changes.slice(start)).toEqual(['five']); expect(new Set(marked)).toEqual(new Set(['five']));
});
it('[cn-reader-takes-over] moves the marker to the measured section after the reader scrolls', async () => {
  const changes: string[] = []; const { root, scroll, frame, link } = await contentNavigation(id => changes.push(id));
  link('five').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 })); await nextTick();
  await scroll(600); expect(changes.at(-1)).toBe('five');
  window.dispatchEvent(new Event('wheel')); await scroll(1100); await frame();
  expect(changes.at(-1)).toBe('three'); expect(root.querySelector('a[aria-current="location"]')!.getAttribute('data-hw-section')).toBe('three');
});
