import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { HwSideNavigationComponent, type HwNavigationDrawerItem, type HwSideNavigationItem } from '@hawiyah/angular';
import { markup, page } from './fixtures/page';
import { missingTextWarnings } from './fixtures/texts';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value(this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value(this: HTMLDialogElement) { this.open = false; this.dispatchEvent(new Event('close')); } });
});
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); vi.restoreAllMocks(); delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView; });

// One array type feeds both components.
const items: readonly HwSideNavigationItem[] = [
  { id: 'home', label: 'Home', href: '/home', icon: 'home-01' },
  { id: 'guides', label: 'Guides', children: [{ id: 'install', label: 'Install', href: '/guides/install', current: true }, { id: 'theme', label: 'Theme', href: '/guides/theme' }] },
  { id: 'off', label: 'Unavailable', href: '/off', disabled: true, children: [{ id: 'hidden', label: 'Hidden', href: '/hidden' }] },
  { id: 'note', label: 'Note' },
] satisfies readonly HwNavigationDrawerItem[];
const group = (id: string, links: Array<[string, boolean?]>, expanded?: boolean): HwSideNavigationItem => ({ id, label: id, expanded, children: links.map(([link, current]) => ({ id: link, label: link, href: `/${link}`, current })) });
const row = (root: Element, id: string) => root.querySelector(`li[data-hw-value="${id}"]`)!.firstElementChild!;
const details = (root: Element, id: string) => row(root, id) as HTMLDetailsElement;
const label = (text: string) => `<span class="hw-navigation-drawer-label">${text}</span>`;

describe('hw-side-navigation', () => {
  it('[sn-root] is a navigation landmark named by label, with the two classes in order and one list', () => {
    const { root } = page(`<hw-side-navigation class="docs" id="pages" label="Documentation" [items]="items" /><nav hwSideNavigation label="Second" [items]="items"></nav>`, { items });
    const host = root.querySelector('hw-side-navigation')!;
    expect(host.className).toBe('hw-side-navigation hw-navigation-drawer-nav docs'); expect(host.id).toBe('pages');
    expect(host.getAttribute('aria-label')).toBe('Documentation'); expect(host.getAttribute('role')).toBe('navigation');
    expect([...host.children].map(child => child.localName)).toEqual(['ul']);
    // On a nav element the landmark is native: no role is added.
    const nav = root.querySelector('nav[hwSideNavigation]')!;
    expect(nav.localName).toBe('nav'); expect(nav.hasAttribute('role')).toBe(false); expect(nav.className).toBe('hw-side-navigation hw-navigation-drawer-nav'); expect(nav.getAttribute('aria-label')).toBe('Second');
    expect([...nav.children].map(child => child.localName)).toEqual(['ul']); expect(markup(nav.firstElementChild!)).toBe(markup(host.firstElementChild!));
    expect(root.querySelector('[role="tree"], [aria-expanded], [id]:not(#pages)')).toBeNull();
  });

  it('[sn-kinds] renders a disabled entry, a group, a link and plain text, with an icon only where one is given', () => {
    const { root } = page(`<hw-side-navigation label="Documentation" [items]="items" />`, { items });
    const host = root.querySelector('hw-side-navigation')!;
    expect([...host.querySelectorAll(':scope > ul > li')].map(entry => entry.getAttribute('data-hw-value'))).toEqual(['home', 'guides', 'off', 'note']);
    expect(markup(row(host, 'home'))).toBe(markup(`<a class="hw-navigation-drawer-row" href="/home"><span class="hw-icon" data-icon="home-01" aria-hidden="true"></span>${label('Home')}</a>`));
    expect(markup(row(host, 'guides'))).toBe(markup(`<details class="hw-navigation-drawer-group" open=""><summary class="hw-navigation-drawer-row">${label('Guides')}</summary><ul><li data-hw-value="install"><a class="hw-navigation-drawer-row" href="/guides/install" aria-current="page">${label('Install')}</a></li><li data-hw-value="theme"><a class="hw-navigation-drawer-row" href="/guides/theme">${label('Theme')}</a></li></ul></details>`));
    // A disabled entry is text: no link, no tab stop, and its children are not rendered.
    expect(markup(row(host, 'off'))).toBe(markup(`<span class="hw-navigation-drawer-row" aria-disabled="true">${label('Unavailable')}</span>`));
    expect(markup(row(host, 'note'))).toBe(markup(`<span class="hw-navigation-drawer-row">${label('Note')}</span>`));
    expect(host.querySelectorAll('.hw-icon')).toHaveLength(1); expect(host.querySelector('[data-hw-value="hidden"], a[href="/off"], [tabindex]')).toBeNull();
  });

  it('[sn-current] marks only the link of the current item', () => {
    const entries: HwSideNavigationItem[] = [{ id: 'a', label: 'A', href: '/a', current: true }, { id: 'b', label: 'B', href: '/b' }, { id: 'text', label: 'Text', current: true }, { id: 'off', label: 'Off', href: '/off', current: true, disabled: true }];
    const { root } = page(`<hw-side-navigation label="Documentation" [items]="items" />`, { items: entries });
    const marked = [...root.querySelectorAll('[aria-current]')];
    expect(marked).toEqual([row(root, 'a')]); expect(marked[0]!.getAttribute('aria-current')).toBe('page'); expect(marked[0]!.localName).toBe('a');
  });

  it('[sn-group-href] repeats a group that has its own href as the first link inside it', () => {
    const entries: HwSideNavigationItem[] = [{ id: 'services', label: 'Services', href: '/services', current: true, children: [{ id: 'permits', label: 'Permits', href: '/permits' }, { id: 'services-page', label: 'Taken', href: '/taken' }] }];
    const { root } = page(`<hw-side-navigation label="Documentation" [items]="items" />`, { items: entries });
    const services = details(root, 'services'), summary = services.querySelector(':scope > summary')!;
    expect(summary.querySelector('a')).toBeNull(); expect(summary.hasAttribute('aria-current')).toBe(false); expect(summary.textContent).toBe('Services');
    // The id is suffixed until no child uses it.
    expect([...services.querySelectorAll(':scope > ul > li')].map(entry => entry.getAttribute('data-hw-value'))).toEqual(['services-page-page', 'permits', 'services-page']);
    const own = row(services, 'services-page-page');
    expect(own.localName).toBe('a'); expect(own.getAttribute('href')).toBe('/services'); expect(own.getAttribute('aria-current')).toBe('page'); expect(services.hasAttribute('open')).toBe(true);
    expect(root.querySelectorAll('[aria-current]')).toHaveLength(1);
  });

  it('[sn-group-open] opens a group that holds the current page or is expanded, and no other', () => {
    const entries: HwSideNavigationItem[] = [
      group('direct', [['one', true]]),
      { id: 'outer', label: 'Outer', children: [{ id: 'inner', label: 'Inner', children: [{ id: 'deep', label: 'Deep', href: '/deep', current: true }] }, group('sibling', [['two']])] },
      group('expanded', [['three']], true), group('closed', [['four']]), group('collapsed', [['five']], false),
      // A current entry that renders no link opens nothing.
      { id: 'inert', label: 'Inert', children: [{ id: 'text', label: 'Text', current: true }, { id: 'off', label: 'Off', href: '/off', current: true, disabled: true }] },
    ];
    const { root } = page(`<hw-side-navigation label="Documentation" [items]="items" />`, { items: entries });
    expect(Object.fromEntries(['direct', 'outer', 'inner', 'sibling', 'expanded', 'closed', 'collapsed', 'inert'].map(id => [id, details(root, id).hasAttribute('open')]))).toEqual({ direct: true, outer: true, inner: true, sibling: false, expanded: true, closed: false, collapsed: false, inert: false });
  });

  it('[sn-reader-toggle-stands] leaves a group as the reader set it while its computed value is unchanged', () => {
    const { root, update } = page(`<hw-side-navigation label="Documentation" [items]="items" />`, { items: [group('a', [['one', true]]), group('b', [['two']])] as HwSideNavigationItem[] });
    const a = details(root, 'a'), b = details(root, 'b');
    expect([a.open, b.open]).toEqual([true, false]);
    a.open = false; b.open = true;
    update({ items: [{ ...group('a', [['one', true]]), label: 'Renamed' }, { ...group('b', [['two']]), label: 'Also renamed' }] });
    expect(a.querySelector('summary')!.textContent).toBe('Renamed'); expect(details(root, 'a')).toBe(a); expect([a.open, b.open]).toEqual([false, true]);
    update(); expect([a.open, b.open]).toEqual([false, true]);
  });

  it('[sn-current-moves] opens the group the current page moved to and closes the one it left, unless that one is expanded', () => {
    const before = [group('a', [['one', true]]), group('b', [['two']]), group('kept', [['three']], true)];
    const { root, update } = page(`<hw-side-navigation label="Documentation" [items]="items" />`, { items: before as HwSideNavigationItem[] });
    const open = () => ['a', 'b', 'kept'].map(id => details(root, id).open);
    expect(open()).toEqual([true, false, true]);
    update({ items: [group('a', [['one']]), group('b', [['two', true]]), group('kept', [['three']], true)] });
    expect(open()).toEqual([false, true, true]); expect(row(root, 'two').getAttribute('aria-current')).toBe('page'); expect(row(root, 'one').hasAttribute('aria-current')).toBe(false);
    // An expanded group stays open when the current page leaves it.
    update({ items: [group('a', [['one']], true), group('b', [['two', true]]), group('kept', [['three']], true)] }); expect(open()).toEqual([true, true, true]);
    update({ items: [group('a', [['one', true]], true), group('b', [['two']]), group('kept', [['three']], true)] }); expect(open()).toEqual([true, false, true]);
    update({ items: [group('a', [['one']], true), group('b', [['two', true]]), group('kept', [['three']], true)] }); expect(open()).toEqual([true, true, true]);
  });

  it('[sn-sticky] writes data-sticky="true" only when sticky', () => {
    const { root, update } = page(`<hw-side-navigation label="One" [sticky]="sticky" [items]="items" /><hw-side-navigation label="Two" sticky [items]="items" /><hw-side-navigation label="Three" [items]="items" />`, { items, sticky: false });
    const [bound, bare, plain] = [...root.querySelectorAll('hw-side-navigation')];
    expect(bound!.hasAttribute('data-sticky')).toBe(false); expect(bare!.getAttribute('data-sticky')).toBe('true'); expect(plain!.hasAttribute('data-sticky')).toBe(false);
    update({ sticky: true }); expect(bound!.getAttribute('data-sticky')).toBe('true');
    update({ sticky: false }); expect(bound!.hasAttribute('data-sticky')).toBe(false);
  });

  it('[sn-reveal] brings the current link into view inside the navigation only, after the first render and when the current page changes', () => {
    const fixture = TestBed.createComponent(HwSideNavigationComponent); const nav = fixture.nativeElement as HTMLElement; document.body.append(nav);
    // The navigation overflows: 200px of 1000px are visible, and every link sits below the visible part.
    Object.defineProperty(nav, 'clientHeight', { configurable: true, value: 200 }); Object.defineProperty(nav, 'scrollHeight', { configurable: true, value: 1000 });
    const box = (top: number, height: number) => ({ top, bottom: top + height, left: 0, right: 200, x: 0, y: top, width: 200, height, toJSON() {} });
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) { return this === nav ? box(0, 200) : box(600, 40); });
    const scrolled = vi.fn(); nav.scrollTo = scrolled as never;
    const page = vi.spyOn(window, 'scrollTo').mockImplementation(() => {}); const intoView = vi.fn(); Element.prototype.scrollIntoView = intoView;
    const outside = document.createElement('button'); document.body.append(outside); outside.focus();
    const entries = (current: string): HwSideNavigationItem[] => [group('a', [['one', current === 'one'], ['two', current === 'two']]), { id: 'three', label: 'three', href: '/three', current: current === 'three' }];
    fixture.componentRef.setInput('label', 'Documentation'); fixture.componentRef.setInput('items', entries('one')); fixture.detectChanges();
    expect(scrolled).toHaveBeenCalledTimes(1); expect(scrolled.mock.calls[0]![0]).toEqual({ top: 520, behavior: 'instant' });
    // The same current page, in a new array: nothing moves.
    fixture.componentRef.setInput('items', entries('one')); fixture.detectChanges(); fixture.detectChanges(); expect(scrolled).toHaveBeenCalledTimes(1);
    fixture.componentRef.setInput('items', entries('three')); fixture.detectChanges(); expect(scrolled).toHaveBeenCalledTimes(2); expect(scrolled.mock.calls[1]![0]).toMatchObject({ behavior: 'instant' });
    fixture.componentRef.setInput('items', entries('two')); fixture.detectChanges(); fixture.detectChanges(); expect(scrolled).toHaveBeenCalledTimes(3);
    expect(page).not.toHaveBeenCalled(); expect(intoView).not.toHaveBeenCalled(); expect(document.activeElement).toBe(outside);
  });

  it('[sn-missing-label] omits aria-label and warns once when label is missing, and is silent when it is given', () => {
    const warnings = missingTextWarnings();
    const named = page(`<hw-side-navigation label="Documentation" [items]="items" />`, { items }); named.update();
    expect(warnings).toEqual([]);
    const unnamed = page(`<hw-side-navigation [items]="items" /><nav hwSideNavigation [items]="items"></nav>`, { items }); unnamed.update();
    for (const host of unnamed.root.querySelectorAll('.hw-side-navigation')) { expect(host.hasAttribute('aria-label')).toBe(false); expect(host.querySelector('ul')).not.toBeNull(); }
    expect(warnings).toEqual(['Hawiyah: hw-side-navigation requires "label". Hawiyah ships no built-in strings, so the application supplies this text; nothing is rendered in its place.']);
  });

  it('[sn-no-listeners] adds no click handler and has no output: a link is followed by the browser', () => {
    const { root } = page(`<hw-side-navigation label="Documentation" [items]="items" />`, { items });
    const seen: boolean[] = []; const last = (event: Event) => { seen.push(event.defaultPrevented); event.preventDefault(); };
    window.addEventListener('click', last);
    for (const link of root.querySelectorAll('a')) link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    window.removeEventListener('click', last);
    expect(seen).toEqual([false, false, false]);
    expect((HwSideNavigationComponent as unknown as { ɵcmp: { outputs: object } }).ɵcmp.outputs).toEqual({});
  });

  it('[sn-shared-list] renders the same list as an open navigation drawer for the same items', () => {
    const { root } = page(`<hw-side-navigation label="Documentation" [items]="items" /><hw-navigation-drawer title="Menu" navigationLabel="Main" closeLabel="Close" open [items]="items" />`, { items });
    const side = root.querySelector('hw-side-navigation')!, drawer = root.querySelector('hw-navigation-drawer nav.hw-navigation-drawer-nav')!;
    const withoutComments = (html: string) => html.replace(/<!--[\s\S]*?-->/g, '');
    expect(withoutComments(side.innerHTML)).toBe(withoutComments(drawer.innerHTML)); expect(withoutComments(side.innerHTML)).toMatch(/^<ul>.*<\/ul>$/s);
    expect(side.querySelectorAll('li')).toHaveLength(6);
  });
});
