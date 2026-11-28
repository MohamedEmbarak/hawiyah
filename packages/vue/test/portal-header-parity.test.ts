// PortalHeader cases shared by the four adapters (milestone 3: portal-shell-1, portal-shell-4).
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createApp, createSSRApp, defineComponent, h, nextTick, ref, type App } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { PortalHeader } from '../src/patterns.js';

let app: App | undefined;
let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
afterEach(() => { app?.unmount(); app = undefined; document.body.replaceChildren(); warn.mockRestore(); });
function mount(render: () => ReturnType<typeof h>) {
  const host = document.createElement('div'); document.body.append(host);
  app = createApp(defineComponent(() => render)); app.mount(host); return host;
}
const links = [
  { label: 'Services', href: '/services', groups: [{ label: 'Individuals', links: [{ label: 'Passports', href: '/passports' }] }] },
  { label: 'About', href: '/about', groups: [{ links: [{ label: 'Mission', href: '/mission' }] }] },
  { label: 'Contact', href: '/contact' },
];
const header = (props: Record<string, unknown> = {}) => h('div', [h(PortalHeader, { brand: 'Portal', menuLabel: 'Menu', navigationLabel: 'Main', links, ...props }), h('button', { id: 'outside' }, 'Outside')]);
const settle = async () => { await nextTick(); await nextTick(); };
const branches = (host: Element) => [...host.querySelectorAll<HTMLDetailsElement>('details.hw-portal-branch')];
const summaries = (host: Element) => branches(host).map(branch => branch.querySelector<HTMLElement>('summary')!);
const focusout = (from: Element, to: Element | null) => from.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: to }));

it('[PORTAL-01][portal-shell-1] a press on another branch heading leaves the open branch until the click opens the new one', async () => {
  const host = mount(() => header());
  const [first, second] = summaries(host);
  first!.click(); await settle(); expect(branches(host)[0]!.open).toBe(true);
  second!.dispatchEvent(new Event('pointerdown', { bubbles: true }));
  focusout(branches(host)[0]!.querySelector('a')!, second!); await settle();
  expect(branches(host)[0]!.open).toBe(true);
  second!.click(); await settle();
  expect(branches(host).map(branch => branch.open)).toEqual([false, true]);
});

it('[PORTAL-02] without a press, focus moving from branch 1 to the heading of branch 2 closes branch 1', async () => {
  const host = mount(() => header());
  const [first, second] = summaries(host);
  first!.click(); await settle();
  focusout(branches(host)[0]!.querySelector('a')!, second!); await settle();
  expect(branches(host)[0]!.open).toBe(false);
});

it('[PORTAL-03] pointercancel or a keydown after the press clears it', async () => {
  for (const clear of [(_header: Element) => document.dispatchEvent(new Event('pointercancel')), (root: Element) => root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))]) {
    const host = mount(() => header());
    const [first, second] = summaries(host);
    first!.click(); await settle();
    second!.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    clear(host.querySelector('header')!);
    focusout(branches(host)[0]!.querySelector('a')!, second!); await settle();
    expect(branches(host)[0]!.open).toBe(false);
    app!.unmount(); app = undefined; document.body.replaceChildren();
  }
});

const toggle = (host: Element) => host.querySelector<HTMLButtonElement>('.hw-portal-menu-toggle')!;
const navOpen = (host: Element) => host.querySelector('nav')!.getAttribute('data-open');

it('[STATE-01][STATE-02][STATE-03][STATE-04][portal-shell-4] open: notified once per change; controlled follows the application; v-model:open round-trips', async () => {
  const changes = vi.fn();
  let host = mount(() => header({ 'onUpdate:open': changes }));
  toggle(host).click(); await settle(); toggle(host).click(); await settle();
  expect(changes.mock.calls).toEqual([[true], [false]]);
  app!.unmount(); document.body.replaceChildren(); changes.mockClear();
  const open = ref(false);
  host = mount(() => header({ open: open.value, 'onUpdate:open': changes }));
  toggle(host).click(); await settle();
  expect(changes.mock.calls).toEqual([[true]]); expect(navOpen(host)).toBe('false'); expect(toggle(host).getAttribute('aria-expanded')).toBe('false');
  changes.mockClear(); open.value = true; await settle();
  expect(changes).not.toHaveBeenCalled(); expect(navOpen(host)).toBe('true');
  app!.unmount(); document.body.replaceChildren();
  const model = ref(false);
  host = mount(() => header({ open: model.value, 'onUpdate:open': (value: boolean) => { model.value = value; } }));
  toggle(host).click(); await settle(); expect(model.value).toBe(true); expect(navOpen(host)).toBe('true');
});

it('[STATE-05] server render with open true equals the first client render', async () => {
  const render = () => header({ defaultOpen: true });
  const html = await renderToString(createSSRApp(defineComponent(() => render)));
  expect(html).toContain('data-open="true"'); expect(html).toContain('aria-expanded="true"');
  const host = document.createElement('div'); host.innerHTML = html; document.body.append(host); const server = host.innerHTML;
  app = createSSRApp(defineComponent(() => render)); app.mount(host); await nextTick();
  expect(host.innerHTML).toBe(server);
});

it('[PORTAL-05] Escape, an outside press, focus leaving and link activation each notify false once; Escape focuses the toggle', async () => {
  const changes = vi.fn();
  const host = mount(() => header({ 'onUpdate:open': changes }));
  const paths: (() => void)[] = [
    () => { host.querySelector('nav a')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })); },
    () => { document.querySelector('#outside')!.dispatchEvent(new Event('pointerdown', { bubbles: true })); },
    () => { focusout(toggle(host), document.querySelector('#outside')); },
    () => { host.querySelector<HTMLAnchorElement>('nav li:last-child > a')!.addEventListener('click', event => event.preventDefault(), { once: true }); host.querySelector<HTMLAnchorElement>('nav li:last-child > a')!.click(); },
  ];
  for (const [index, path] of paths.entries()) {
    toggle(host).click(); await settle(); changes.mockClear();
    path(); await settle();
    expect(changes.mock.calls).toEqual([[false]]);
    if (index === 0) expect(document.activeElement).toBe(toggle(host));
  }
});

it('[PORTAL-08][E04] a brand without a home link is a div, with role=img and the label only when brandLabel is given', () => {
  const host = mount(() => h('div', [
    h(PortalHeader, { brand: 'Portal', brandLabel: 'Portal home', homeHref: '', menuLabel: 'Menu', navigationLabel: 'Main' }),
    h(PortalHeader, { brand: 'Portal', homeHref: '', menuLabel: 'Menu', navigationLabel: 'Main' }),
    h(PortalHeader, { brand: 'Portal', brandLabel: 'Portal home', homeHref: '/', menuLabel: 'Menu', navigationLabel: 'Main' }),
  ]));
  const [labelled, plain, link] = [...host.querySelectorAll('.hw-portal-brand')];
  expect([labelled!.tagName, labelled!.getAttribute('role'), labelled!.getAttribute('aria-label')]).toEqual(['DIV', 'img', 'Portal home']);
  expect([plain!.tagName, plain!.getAttribute('role'), plain!.getAttribute('aria-label')]).toEqual(['DIV', null, null]);
  expect([link!.tagName, link!.getAttribute('href'), link!.getAttribute('role')]).toEqual(['A', '/', null]);
});

it('[SHAPE-01][PORTAL-06][E06] the shared props render brand, toggle, nav and actions as direct children of the header, in order', () => {
  const props = { brand: 'Portal', brandLabel: 'Portal home', homeHref: '/', links, navigationLabel: 'Main', menuLabel: 'Menu' };
  const host = mount(() => h(PortalHeader, props, { actions: () => h('button', 'Sign in') }));
  const root = host.querySelector('header.hw-portal-header')!;
  expect([...root.children].map(child => child.className || child.tagName)).toEqual(['hw-portal-brand', 'hw-button hw-portal-menu-toggle', 'NAV', 'hw-portal-header-actions']);
  expect(root.querySelector('.hw-portal-header-main')).toBeNull();
  expect([...root.querySelectorAll('nav > ul > li')].map(item => item.querySelector('summary, a')!.textContent)).toEqual(['Services', 'About', 'Contact']);
  expect(branches(host)).toHaveLength(2);
});
