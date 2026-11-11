import { getNavigationGroupEntries, getNavigationItemKind, isNavigationGroupOpen, resetTextWarnings, type NavigationItem } from '@hawiyah/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createNavigationDrawer, createSideNavigation, enhance } from '../src/index.js';

// The documented markup, written as an application or a server template would write it. Vanilla reads an
// authored open attribute as expanded: `authored` writes open only for expanded groups.
let openRule: (item: NavigationItem) => boolean = isNavigationGroupOpen;
const authored = <T>(render: () => T) => { openRule = item => item.expanded === true; try { return render(); } finally { openRule = isNavigationGroupOpen; } };
const content = (item: NavigationItem) => `${item.icon ? `<span class="hw-icon" data-icon="${item.icon}" aria-hidden="true"></span>` : ''}<span class="hw-navigation-drawer-label">${item.label}</span>`;
const row = (item: NavigationItem): string => {
  switch (getNavigationItemKind(item)) {
    case 'disabled': return `<span class="hw-navigation-drawer-row" aria-disabled="true">${content(item)}</span>`;
    case 'group': return `<details class="hw-navigation-drawer-group"${openRule(item) ? ' open=""' : ''}><summary class="hw-navigation-drawer-row">${content(item)}</summary>${list(getNavigationGroupEntries(item))}</details>`;
    case 'link': return `<a class="hw-navigation-drawer-row" href="${item.href}"${item.current ? ' aria-current="page"' : ''}>${content(item)}</a>`;
    default: return `<span class="hw-navigation-drawer-row">${content(item)}</span>`;
  }
};
const list = (items: readonly NavigationItem[]): string => `<ul>${items.map(item => `<li data-hw-value="${item.id}">${row(item)}</li>`).join('')}</ul>`;
const side = (items: readonly NavigationItem[], attributes = ' aria-label="أقسام الدليل"') => `<nav class="hw-side-navigation hw-navigation-drawer-nav" data-hw="side-navigation"${attributes}>${list(items)}</nav>`;
const mount = (html: string) => { document.body.insertAdjacentHTML('beforeend', html); return document.body.lastElementChild as HTMLElement; };
const group = (nav: Element, id: string) => nav.querySelector<HTMLDetailsElement>(`li[data-hw-value="${id}"] > details`)!;
const items: NavigationItem[] = [
  { id: 'home', label: 'الرئيسية', href: '/', icon: 'home-01' },
  { id: 'note', label: 'ملاحظة' },
  { id: 'old', label: 'قديم', href: '/old', current: true, children: [{ id: 'hidden', label: 'مخفي', href: '/hidden' }], disabled: true },
  { id: 'components', label: 'المكونات', children: [{ id: 'forms', label: 'النماذج', children: [{ id: 'button', label: 'الزر', href: '/button', current: true }] }, { id: 'copy', label: 'النسخ', href: '/copy' }] },
  { id: 'foundations', label: 'الأسس', expanded: true, children: [{ id: 'colour', label: 'الألوان', href: '/colour' }] },
  { id: 'patterns', label: 'الأنماط', href: '/patterns', children: [{ id: 'forms-pattern', label: 'النماذج', href: '/patterns/forms' }] },
];
let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => { resetTextWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
afterEach(() => { warn.mockRestore(); document.body.replaceChildren(); });
const hawiyah = () => warn.mock.calls.filter(([message]) => String(message).startsWith('Hawiyah:'));

describe('SideNavigation', () => {
  it('[sn-root] keeps the classes, names the landmark and holds one list', () => {
    const nav = mount(side(items, ''));
    const controller = createSideNavigation(nav, { label: 'أقسام الدليل' });
    expect(nav.localName).toBe('nav'); expect(nav.className).toBe('hw-side-navigation hw-navigation-drawer-nav'); expect(nav.getAttribute('aria-label')).toBe('أقسام الدليل');
    expect([...nav.children].map(child => child.localName)).toEqual(['ul']);
    controller.destroy(); expect(nav.hasAttribute('aria-label')).toBe(false);
    const bare = mount('<nav class="application" data-hw-label="Sections"><ul></ul></nav>');
    const added = createSideNavigation(bare); expect(bare.className).toBe('hw-side-navigation hw-navigation-drawer-nav application'); expect(bare.getAttribute('aria-label')).toBe('Sections');
    added.destroy(); expect(bare.className).toBe('application'); expect(hawiyah()).toEqual([]);
  });
  it('[sn-kinds] leaves each row kind as authored', () => {
    const nav = mount(side(items)); createSideNavigation(nav);
    const rowOf = (id: string) => nav.querySelector(`li[data-hw-value="${id}"]`)!.firstElementChild!;
    expect(rowOf('old').outerHTML).toBe('<span class="hw-navigation-drawer-row" aria-disabled="true" tabindex="-1"><span class="hw-navigation-drawer-label">قديم</span></span>');
    expect(nav.querySelector('[data-hw-value="hidden"]')).toBeNull();
    expect(rowOf('components').localName).toBe('details'); expect(rowOf('components').firstElementChild!.outerHTML).toBe('<summary class="hw-navigation-drawer-row"><span class="hw-navigation-drawer-label">المكونات</span></summary>');
    expect(rowOf('home').outerHTML).toBe('<a class="hw-navigation-drawer-row" href="/"><span class="hw-icon" data-icon="home-01" aria-hidden="true"></span><span class="hw-navigation-drawer-label">الرئيسية</span></a>');
    expect(rowOf('note').outerHTML).toBe('<span class="hw-navigation-drawer-row"><span class="hw-navigation-drawer-label">ملاحظة</span></span>');
    expect(nav.querySelectorAll('.hw-icon')).toHaveLength(1);
  });
  it('[sn-current] marks only the current link', () => {
    const nav = mount(side([...items, { id: 'plain', label: 'نص', current: true }])); createSideNavigation(nav);
    expect([...nav.querySelectorAll('[aria-current]')].map(element => element.closest('li')!.dataset.hwValue)).toEqual(['button']);
  });
  it('[sn-group-href] repeats a group with its own href as its first link', () => {
    const nav = mount(side([{ id: 'patterns', label: 'الأنماط', href: '/patterns', current: true, children: [{ id: 'forms', label: 'النماذج', href: '/patterns/forms' }] }])); createSideNavigation(nav);
    const details = group(nav, 'patterns');
    expect(details.querySelector('summary a')).toBeNull(); expect(details.open).toBe(true);
    const first = details.querySelector('ul > li')!; expect(first.getAttribute('data-hw-value')).toBe('patterns-page');
    expect(first.querySelector('a')!.getAttribute('href')).toBe('/patterns'); expect(first.querySelector('a')!.getAttribute('aria-current')).toBe('page');
  });
  it('[sn-group-open] opens the group of the current page and expanded groups', () => {
    const nav = mount(authored(() => side(items)));
    createSideNavigation(nav);
    expect(group(nav, 'components').open).toBe(true); expect(group(nav, 'forms').open).toBe(true);
    expect(group(nav, 'foundations').open).toBe(true); expect(group(nav, 'patterns').open).toBe(false);
  });
  it('[sn-reader-toggle-stands] keeps the reader\'s toggles when the answer did not change', () => {
    const nav = mount(side(items)); const controller = createSideNavigation(nav);
    group(nav, 'components').open = false; group(nav, 'patterns').open = true;
    nav.querySelector('li[data-hw-value="copy"] .hw-navigation-drawer-label')!.textContent = 'نسخ';
    controller.refresh();
    expect(group(nav, 'components').open).toBe(false); expect(group(nav, 'patterns').open).toBe(true);
  });
  it('[sn-current-moves] follows the current link after refresh()', () => {
    const nav = mount(authored(() => side(items))); const controller = createSideNavigation(nav);
    const move = (from: string, to: string) => { nav.querySelector(`li[data-hw-value="${from}"] > a`)!.removeAttribute('aria-current'); nav.querySelector(`li[data-hw-value="${to}"] > a`)!.setAttribute('aria-current', 'page'); controller.refresh(); };
    group(nav, 'patterns').open = false;
    move('button', 'forms-pattern');
    expect(group(nav, 'patterns').open).toBe(true); expect(group(nav, 'components').open).toBe(false); expect(group(nav, 'forms').open).toBe(false);
    move('forms-pattern', 'colour'); expect(group(nav, 'foundations').open).toBe(true); expect(group(nav, 'patterns').open).toBe(false);
    move('colour', 'copy'); expect(group(nav, 'foundations').open).toBe(true); expect(group(nav, 'components').open).toBe(true);
    controller.destroy();
    expect(group(nav, 'components').hasAttribute('open')).toBe(false); expect(group(nav, 'foundations').hasAttribute('open')).toBe(true); expect(group(nav, 'patterns').hasAttribute('open')).toBe(false);
  });
  it('[sn-sticky] keeps the authored data-sticky', () => {
    const sticky = mount(side(items, ' aria-label="x" data-sticky="true"')); createSideNavigation(sticky);
    const plain = mount(side(items)); createSideNavigation(plain);
    expect(sticky.dataset.sticky).toBe('true'); expect(plain.hasAttribute('data-sticky')).toBe(false);
  });
  it('[sn-reveal] scrolls the nav only, without animation or focus, when the current link changes', () => {
    const scrollTo = vi.fn(); const windowScroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const intoView = vi.fn(); Element.prototype.scrollIntoView = intoView;
    const nav = mount(side(items, ' aria-label="x" data-sticky="true"'));
    Object.defineProperties(nav, { clientHeight: { configurable: true, value: 300 }, scrollHeight: { configurable: true, value: 1200 }, scrollTop: { configurable: true, writable: true, value: 0 } });
    nav.scrollTo = scrollTo as unknown as typeof nav.scrollTo;
    nav.getBoundingClientRect = () => ({ top: 0, bottom: 300, left: 0, right: 200, x: 0, y: 0, width: 200, height: 300, toJSON() {} }) as DOMRect;
    const place = (id: string, top: number) => { nav.querySelector<HTMLElement>(`li[data-hw-value="${id}"] > a`)!.getBoundingClientRect = () => ({ top, bottom: top + 40, left: 0, right: 200, x: 0, y: top, width: 200, height: 40, toJSON() {} }) as DOMRect; };
    place('button', 900); place('copy', 1000);
    const active = document.activeElement;
    const controller = createSideNavigation(nav);
    expect(scrollTo).toHaveBeenCalledTimes(1); expect(scrollTo.mock.calls[0]![0]).toMatchObject({ behavior: 'instant' });
    controller.refresh(); expect(scrollTo).toHaveBeenCalledTimes(1);
    nav.querySelector('li[data-hw-value="button"] > a')!.removeAttribute('aria-current'); nav.querySelector('li[data-hw-value="copy"] > a')!.setAttribute('aria-current', 'page');
    controller.refresh(); expect(scrollTo).toHaveBeenCalledTimes(2);
    expect(windowScroll).not.toHaveBeenCalled(); expect(intoView).not.toHaveBeenCalled(); expect(document.activeElement).toBe(active);
    windowScroll.mockRestore(); delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView;
  });
  it('[sn-missing-label] warns once and writes no aria-label', () => {
    const nav = mount(side(items, '')); createSideNavigation(nav);
    expect(nav.hasAttribute('aria-label')).toBe(false);
    expect(hawiyah().map(([message]) => String(message).slice(0, 44))).toEqual(['Hawiyah: SideNavigation requires "label". Ha']);
    warn.mockClear(); resetTextWarnings();
    for (const attributes of [' aria-label="x"', ' aria-labelledby="t"', ' data-hw-label="x"']) createSideNavigation(mount(side(items, attributes)));
    createSideNavigation(mount(side(items, '')), { label: 'x' });
    expect(hawiyah()).toEqual([]);
  });
  it('[sn-no-listeners] leaves link clicks alone and emits nothing', () => {
    const nav = mount(side(items)); const release = enhance(nav);
    const events: Event[] = []; nav.addEventListener('hw:change', event => events.push(event));
    let prevented: boolean | undefined;
    const cancel = (event: Event) => { prevented = event.defaultPrevented; event.preventDefault(); };
    document.addEventListener('click', cancel);
    nav.querySelector<HTMLAnchorElement>('li[data-hw-value="copy"] > a')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(prevented).toBe(false); expect(events).toEqual([]);
    document.removeEventListener('click', cancel); release();
  });
  it('[sn-shared-list] gives the same list as an open NavigationDrawer', () => {
    const nav = mount(side(items));
    const dialog = mount(`<dialog aria-label="x"><nav class="hw-navigation-drawer-nav" aria-label="y">${list(items)}</nav></dialog>`) as HTMLDialogElement;
    dialog.showModal = () => { dialog.open = true; };
    createSideNavigation(nav); const drawer = createNavigationDrawer(dialog); drawer.show();
    expect(nav.innerHTML).toBe(dialog.querySelector('nav')!.innerHTML);
  });
  it('[sn-server] markup is complete without the controller and creation needs no layout', () => {
    const nav = mount(side(items));
    expect(group(nav, 'components').hasAttribute('open')).toBe(true); expect(nav.querySelector('[aria-current="page"]')).not.toBeNull();
    const detached = document.implementation.createHTMLDocument('');
    detached.body.innerHTML = side(items);
    const controller = createSideNavigation(detached.body.firstElementChild as HTMLElement);
    expect(() => { controller.refresh(); controller.destroy(); }).not.toThrow();
  });
});

describe('NavigationDrawer groups', () => {
  it('[nd-group-open] opens the group of the current page and authored expanded groups only', () => {
    const dialog = mount(`<dialog><nav class="hw-navigation-drawer-nav" aria-label="x">${authored(() => list(items))}</nav></dialog>`) as HTMLDialogElement;
    const controller = createNavigationDrawer(dialog);
    expect(group(dialog, 'components').open).toBe(true); expect(group(dialog, 'forms').open).toBe(true);
    expect(group(dialog, 'foundations').open).toBe(true); expect(group(dialog, 'patterns').open).toBe(false);
    controller.destroy(); expect(group(dialog, 'components').hasAttribute('open')).toBe(false);
  });
});
