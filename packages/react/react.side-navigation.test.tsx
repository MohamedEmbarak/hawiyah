import { act, StrictMode } from 'react';
import type { ReactNode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { bindLinkNavigation, resetTextWarnings } from '@hawiyah/core';
import { Breadcrumb, NavigationDrawer, PortalHeader, SideNavigation } from './src/index.js';
import type { NavigationDrawerItem, SideNavigationItem } from './src/index.js';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let container: HTMLDivElement; let root: Root | undefined; let warn: ReturnType<typeof vi.spyOn>;
const cleanups: (() => void)[] = [];
const warnings = () => (warn.mock.calls as unknown[][]).map(call => String(call[0])).filter(message => message.startsWith('Hawiyah:'));
async function render(node: ReactNode) { root ??= createRoot(container); await act(async () => root!.render(node)); }
const nav = () => container.querySelector<HTMLElement>('nav.hw-side-navigation')!;
const group = (id: string) => nav().querySelector<HTMLDetailsElement>(`li[data-hw-value="${id}"] > details`)!;
const items: readonly SideNavigationItem[] = [
  { id: 'home', label: 'الرئيسية', href: '/home', icon: 'home-06' },
  { id: 'a', label: 'المجموعة أ', children: [{ id: 'a1', label: 'أ ١', href: '/a/1' }, { id: 'a2', label: 'أ ٢', children: [{ id: 'a2x', label: 'أ ٢ س', href: '/a/2/x' }] }] },
  { id: 'b', label: 'المجموعة ب', children: [{ id: 'b1', label: 'ب ١', href: '/b/1' }] },
];
const withCurrent = (list: readonly NavigationDrawerItem[], id: string): NavigationDrawerItem[] => list.map(item => ({ ...item, current: item.id === id || undefined, children: item.children && withCurrent(item.children, id) }));
/** Clicks are cancelled at the window, after every handler ran, so the test DOM never navigates; `prevented` records what the handlers did. */
function recordClicks() { const prevented: boolean[] = []; const listener = (event: Event) => { prevented.push(event.defaultPrevented); event.preventDefault(); }; window.addEventListener('click', listener); cleanups.push(() => window.removeEventListener('click', listener)); return prevented; }

beforeEach(() => {
  resetTextWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined); container = document.createElement('div'); document.body.append(container);
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value() { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value() { this.open = false; this.dispatchEvent(new Event('close')); } });
});
afterEach(async () => { if (root) await act(async () => root!.unmount()); root = undefined; for (const cleanup of cleanups.splice(0)) cleanup(); container.remove(); warn.mockRestore(); vi.restoreAllMocks(); });

it('[sn-root] renders a named nav with the two classes and one list', async () => {
  await render(<SideNavigation items={items} label="أقسام الدليل" className="extra" id="guide-nav" />);
  expect(nav().tagName).toBe('NAV'); expect(nav().className).toBe('hw-side-navigation hw-navigation-drawer-nav extra'); expect(nav().id).toBe('guide-nav');
  expect(nav().getAttribute('aria-label')).toBe('أقسام الدليل'); expect(nav().children).toHaveLength(1); expect(nav().firstElementChild!.tagName).toBe('UL');
  expect(warnings()).toEqual([]);
});
it('[sn-kinds] renders each item kind exactly', async () => {
  await render(<SideNavigation label="أقسام" items={[
    { id: 'off', label: 'معطل', href: '/off', disabled: true, children: [{ id: 'hidden', label: 'مخفي', href: '/hidden' }] },
    { id: 'group', label: 'مجموعة', icon: 'folder-01', children: [{ id: 'child', label: 'فرع', href: '/child' }] },
    { id: 'link', label: 'رابط', href: '/link', icon: 'home-06' },
    { id: 'text', label: 'نص' },
  ]} />);
  expect(nav().innerHTML).toBe('<ul>'
    + '<li data-hw-value="off"><span class="hw-navigation-drawer-row" aria-disabled="true"><span class="hw-navigation-drawer-label">معطل</span></span></li>'
    + '<li data-hw-value="group"><details class="hw-navigation-drawer-group"><summary class="hw-navigation-drawer-row"><span class="hw-icon" data-icon="folder-01" aria-hidden="true"></span><span class="hw-navigation-drawer-label">مجموعة</span></summary><ul><li data-hw-value="child"><a class="hw-navigation-drawer-row" href="/child"><span class="hw-navigation-drawer-label">فرع</span></a></li></ul></details></li>'
    + '<li data-hw-value="link"><a class="hw-navigation-drawer-row" href="/link"><span class="hw-icon" data-icon="home-06" aria-hidden="true"></span><span class="hw-navigation-drawer-label">رابط</span></a></li>'
    + '<li data-hw-value="text"><span class="hw-navigation-drawer-row"><span class="hw-navigation-drawer-label">نص</span></span></li>'
    + '</ul>');
});
it('[sn-current] marks only the current link', async () => {
  await render(<SideNavigation label="أقسام" items={[{ id: 'one', label: 'واحد', href: '/one', current: true }, { id: 'two', label: 'اثنان', href: '/two' }, { id: 'plain', label: 'نص', current: true }, { id: 'off', label: 'معطل', href: '/off', disabled: true, current: true }]} />);
  const marked = nav().querySelectorAll('[aria-current]');
  expect(marked).toHaveLength(1); expect(marked[0]!.getAttribute('aria-current')).toBe('page'); expect(marked[0]!.getAttribute('href')).toBe('/one');
});
it('[sn-group-href] repeats a group with its own page as the first link inside', async () => {
  await render(<SideNavigation label="أقسام" items={[{ id: 'services', label: 'الخدمات', href: '/services', current: true, children: [{ id: 'request', label: 'طلب', href: '/services/request' }] }]} />);
  const details = group('services'); expect(details.querySelector(':scope > summary a')).toBeNull();
  const first = details.querySelector(':scope > ul > li')!;
  expect(first.getAttribute('data-hw-value')).toBe('services-page'); expect(first.querySelector('a')!.getAttribute('href')).toBe('/services'); expect(first.querySelector('a')!.getAttribute('aria-current')).toBe('page');
  expect(details.open).toBe(true);
});
it('[sn-group-open] opens the group of the current page, an expanded group, and nothing else', async () => {
  await render(<SideNavigation label="أقسام" items={[...withCurrent(items, 'a2x'), { id: 'c', label: 'ج', expanded: true, children: [{ id: 'c1', label: 'ج ١', href: '/c/1' }] }]} />);
  expect(group('a').open).toBe(true); expect(group('a2').open).toBe(true); expect(group('b').open).toBe(false); expect(group('c').open).toBe(true);
});
it('[sn-reader-toggle-stands] keeps the reader\'s toggle across a re-render with the same open value', async () => {
  const current = withCurrent(items, 'a1');
  await render(<SideNavigation label="أقسام" items={current} />);
  expect(group('a').open).toBe(true); expect(group('b').open).toBe(false);
  group('a').open = false; group('b').open = true;
  await render(<SideNavigation label="أقسام" items={current.map(item => ({ ...item, label: `${item.label} *` }))} />);
  expect(group('a').open).toBe(false); expect(group('b').open).toBe(true);
});
it('[sn-current-moves] opens the new group and closes the old one unless it is expanded', async () => {
  await render(<SideNavigation label="أقسام" items={withCurrent(items, 'a1')} />);
  expect(group('a').open).toBe(true); expect(group('b').open).toBe(false);
  await render(<SideNavigation label="أقسام" items={withCurrent(items, 'b1')} />);
  expect(group('a').open).toBe(false); expect(group('b').open).toBe(true);
  const expanded = (id: string) => withCurrent(items, id).map(item => (item.id === 'a' ? { ...item, expanded: true } : item));
  await render(<SideNavigation label="أقسام" items={expanded('a1')} />); await render(<SideNavigation label="أقسام" items={expanded('b1')} />);
  expect(group('a').open).toBe(true); expect(group('b').open).toBe(true);
});
it('[sn-sticky] writes data-sticky only when sticky', async () => {
  await render(<SideNavigation label="أقسام" items={items} />); expect(nav().hasAttribute('data-sticky')).toBe(false);
  await render(<SideNavigation label="أقسام" items={items} sticky={false} />); expect(nav().hasAttribute('data-sticky')).toBe(false);
  await render(<SideNavigation label="أقسام" items={items} sticky />); expect(nav().getAttribute('data-sticky')).toBe('true');
});
it('[sn-reveal] scrolls only the navigation box to the current link, once per current item', async () => {
  const restore: (() => void)[] = [];
  const define = (key: 'clientHeight' | 'scrollHeight', get: (this: HTMLElement) => number) => { const previous = Object.getOwnPropertyDescriptor(HTMLElement.prototype, key); Object.defineProperty(HTMLElement.prototype, key, { configurable: true, get }); restore.push(() => { if (previous) Object.defineProperty(HTMLElement.prototype, key, previous); }); };
  define('clientHeight', function () { return this.tagName === 'NAV' ? 200 : 20; });
  define('scrollHeight', function () { return this.tagName === 'NAV' ? 1000 : 20; });
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) { const top = this.tagName === 'NAV' ? 0 : this.tagName === 'A' ? 600 : 0; const height = this.tagName === 'NAV' ? 200 : 20; return { top, bottom: top + height, left: 0, right: 200, x: 0, y: top, width: 200, height, toJSON() {} } as DOMRect; });
  const scrollTo = vi.fn(); Object.defineProperty(HTMLElement.prototype, 'scrollTo', { configurable: true, writable: true, value: scrollTo }); restore.push(() => { delete (HTMLElement.prototype as { scrollTo?: unknown }).scrollTo; });
  const windowScroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined); const intoView = vi.fn(); Element.prototype.scrollIntoView = intoView;
  cleanups.push(() => { restore.forEach(step => step()); delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView; });
  const outside = document.createElement('button'); document.body.append(outside); outside.focus(); cleanups.push(() => outside.remove());
  await render(<SideNavigation label="أقسام" sticky items={withCurrent(items, 'home')} />);
  expect(scrollTo).toHaveBeenCalledTimes(1); expect(scrollTo.mock.contexts[0]).toBe(nav()); expect(scrollTo.mock.calls[0]![0]).toMatchObject({ behavior: 'instant' });
  await render(<SideNavigation label="أقسام" sticky items={withCurrent(items, 'home').map(item => ({ ...item }))} />); expect(scrollTo).toHaveBeenCalledTimes(1);
  await render(<SideNavigation label="أقسام" sticky items={withCurrent(items, 'b1')} />); expect(scrollTo).toHaveBeenCalledTimes(2);
  expect(windowScroll).not.toHaveBeenCalled(); expect(intoView).not.toHaveBeenCalled(); expect(document.activeElement).toBe(outside);
});
it('[sn-missing-label] omits aria-label and warns once without a name', async () => {
  const Untyped = SideNavigation as unknown as (props: Record<string, unknown>) => ReactNode;
  await render(<Untyped items={items} />);
  expect(nav().hasAttribute('aria-label')).toBe(false); expect(warnings()).toEqual([expect.stringContaining('Hawiyah: SideNavigation requires "label"')]);
  await act(async () => root!.unmount()); root = undefined; resetTextWarnings(); warn.mockClear();
  await render(<><h2 id="sections">أقسام</h2><SideNavigation items={items} aria-labelledby="sections" /><SideNavigation items={items} aria-label="أقسام" /><SideNavigation items={items} label="أقسام" /></>);
  expect(warnings()).toEqual([]);
});
it('[sn-no-listeners] adds no click handling to its links', async () => {
  const prevented = recordClicks(); const onClick = vi.fn();
  await render(<div onClick={onClick}><SideNavigation label="أقسام" items={withCurrent(items, 'a1')} /></div>);
  nav().querySelector<HTMLAnchorElement>('a[href="/a/1"]')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  expect(prevented).toEqual([false]); expect(onClick).toHaveBeenCalledTimes(1);
});
it('[sn-shared-list] renders the same list as an open NavigationDrawer', async () => {
  const list = [...withCurrent(items, 'a2x'), { id: 'off', label: 'معطل', disabled: true }, { id: 'plain', label: 'نص' }];
  await render(<><SideNavigation label="أقسام" items={list} /><NavigationDrawer title="القائمة" navigationLabel="أقسام" closeLabel="إغلاق" defaultOpen items={list} /></>);
  const drawerNav = container.querySelector('dialog nav')!; expect(drawerNav).not.toBeNull();
  expect(drawerNav.innerHTML).toBe(nav().innerHTML);
});
it('[sn-server] renders open groups and the current page on the server and hydrates without a mismatch', async () => {
  const measure = vi.spyOn(Element.prototype, 'getBoundingClientRect');
  const node = <SideNavigation label="أقسام" sticky items={withCurrent(items, 'a2x')} />;
  const html = renderToString(node);
  expect(measure).not.toHaveBeenCalled(); expect(html).toContain('aria-current="page"');
  container.innerHTML = html;
  expect(group('a').hasAttribute('open')).toBe(true); expect(group('a2').hasAttribute('open')).toBe(true); expect(group('b').hasAttribute('open')).toBe(false);
  const recoverable = vi.fn(); const error = vi.spyOn(console, 'error'); const serverNav = nav();
  await act(async () => { root = hydrateRoot(container, <StrictMode>{node}</StrictMode>, { onRecoverableError: recoverable }); });
  expect(recoverable).not.toHaveBeenCalled(); expect(error).not.toHaveBeenCalled(); expect(nav()).toBe(serverNav); expect(container.innerHTML).toBe(html); expect(warnings()).toEqual([]);
});
it('[nd-group-open] opens the group of the current page and expanded groups in NavigationDrawer', async () => {
  const list = [...withCurrent(items, 'b1'), { id: 'c', label: 'ج', expanded: true, children: [{ id: 'c1', label: 'ج ١', href: '/c/1' }] }];
  await render(<NavigationDrawer title="القائمة" navigationLabel="أقسام" closeLabel="إغلاق" defaultOpen items={list} />);
  const details = (id: string) => container.querySelector<HTMLDetailsElement>(`dialog li[data-hw-value="${id}"] > details`)!;
  expect(details('b').open).toBe(true); expect(details('c').open).toBe(true); expect(details('a').open).toBe(false); expect(details('a2').open).toBe(false);
});
it('[nd-closes-after-routed-click] [ln-drawer-closes] closes after a click handed to the router, not after a prevented or modified one', async () => {
  const paths: string[] = []; const drawer = () => container.querySelector('dialog')!;
  const open = async () => { await render(<NavigationDrawer title="القائمة" navigationLabel="أقسام" closeLabel="إغلاق" trigger={<button type="button">فتح</button>} items={withCurrent(items, 'b1')} />); await act(async () => container.querySelector<HTMLButtonElement>('button')!.click()); expect(drawer().open).toBe(true); };
  const prevented = recordClicks();
  await open(); const links = bindLinkNavigation(document, { navigate: ({ path }) => { paths.push(path); } });
  await act(async () => drawer().querySelector<HTMLAnchorElement>('a[href="/b/1"]')!.click());
  expect(paths).toEqual(['/b/1']); expect(drawer().open).toBe(false);
  await open();
  await act(async () => { drawer().querySelector<HTMLAnchorElement>('a[href="/b/1"]')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true })); });
  expect(paths).toEqual(['/b/1']); expect(drawer().open).toBe(true); expect(prevented.at(-1)).toBe(false);
  links.destroy();
  const preventOnly = (event: Event) => event.preventDefault(); document.addEventListener('click', preventOnly); cleanups.push(() => document.removeEventListener('click', preventOnly));
  await act(async () => drawer().querySelector<HTMLAnchorElement>('a[href="/b/1"]')!.click());
  expect(drawer().open).toBe(true); expect(paths).toEqual(['/b/1']);
});
it('[ln-routed] hands a plain click on a packaged link to the router', async () => {
  const paths: string[] = []; const prevented = recordClicks();
  await render(<><Breadcrumb label="مسار التنقل" items={[{ label: 'الرئيسية', href: '/home' }, { label: 'الخدمات', current: true }]} /><SideNavigation label="أقسام" items={withCurrent(items, 'a1')} /></>);
  const links = bindLinkNavigation(document, { navigate: ({ path }) => { paths.push(path); } }); cleanups.push(() => links.destroy());
  const events = ['.hw-breadcrumb a[href="/home"], nav:not(.hw-side-navigation) a[href="/home"]', '.hw-side-navigation a[href="/b/1"]'].map(selector => { const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }); container.querySelector(selector)!.dispatchEvent(event); return event; });
  expect(paths).toEqual(['/home', '/b/1']); expect(events.every(event => event.defaultPrevented)).toBe(true); expect(prevented).toEqual([true, true]);
});
it('[ln-modified] leaves modified and middle clicks to the browser', async () => {
  const paths: string[] = []; const prevented = recordClicks();
  await render(<SideNavigation label="أقسام" items={items} />);
  const links = bindLinkNavigation(document, { navigate: ({ path }) => { paths.push(path); } }); cleanups.push(() => links.destroy());
  const link = nav().querySelector<HTMLAnchorElement>('a[href="/home"]')!;
  for (const init of [{ ctrlKey: true }, { metaKey: true }, { button: 1 }]) link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...init }));
  expect(paths).toEqual([]); expect(prevented).toEqual([false, false, false]);
});
it('[ln-prevented] does not route a click the application already prevented', async () => {
  const paths: string[] = []; recordClicks();
  await render(<SideNavigation label="أقسام" items={items} />);
  const links = bindLinkNavigation(document, { navigate: ({ path }) => { paths.push(path); } }); cleanups.push(() => links.destroy());
  const link = nav().querySelector<HTMLAnchorElement>('a[href="/home"]')!; link.addEventListener('click', event => event.preventDefault());
  link.click(); expect(paths).toEqual([]);
});
it('[ln-no-handler-prevents] packaged link handlers never prevent a plain navigation', async () => {
  const prevented = recordClicks();
  await render(<><PortalHeader brand="هوية" navigationLabel="التنقل الرئيسي" menuLabel="القائمة" navigation={[{ label: 'الخدمات', href: '/services' }]} /><NavigationDrawer title="القائمة" navigationLabel="أقسام" closeLabel="إغلاق" defaultOpen items={items} /></>);
  await act(async () => { container.querySelector<HTMLAnchorElement>('.hw-portal-header a[href="/services"]')!.click(); });
  await act(async () => { container.querySelector<HTMLAnchorElement>('dialog a[href="/home"]')!.click(); });
  expect(prevented).toEqual([false, false]);
});
it('[ln-server] server rendering the routed components touches no document listener', () => {
  const add = vi.spyOn(document, 'addEventListener'); const windowAdd = vi.spyOn(window, 'addEventListener');
  const html = renderToString(<><Breadcrumb label="مسار التنقل" items={[{ label: 'الرئيسية', href: '/home' }]} /><SideNavigation label="أقسام" items={items} /><NavigationDrawer title="القائمة" navigationLabel="أقسام" closeLabel="إغلاق" items={items} /><PortalHeader brand="هوية" navigationLabel="التنقل الرئيسي" menuLabel="القائمة" navigation={[{ label: 'الخدمات', href: '/services' }]} /></>);
  expect(html).toContain('href="/home"'); expect(add).not.toHaveBeenCalled(); expect(windowAdd).not.toHaveBeenCalled();
});
