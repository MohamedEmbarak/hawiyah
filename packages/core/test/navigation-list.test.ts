import { afterEach, describe, expect, it, vi } from 'vitest';
import { getNavigationCurrentId, getNavigationGroupEntries, getNavigationItemKind, isNavigationGroupOpen, revealNavigationCurrent, type NavigationItem } from '../src/navigation-list.js';

const page = (id: string, extra: Partial<NavigationItem> = {}): NavigationItem => ({ id, label: id, href: `/${id}`, ...extra });
afterEach(() => { document.body.replaceChildren(); });

describe('navigation list rules', () => {
  it('chooses how an entry is rendered: disabled, then group, then link, then text', () => {
    expect(getNavigationItemKind(page('a', { disabled: true, children: [page('b')] }))).toBe('disabled');
    expect(getNavigationItemKind(page('a', { children: [page('b')] }))).toBe('group');
    expect(getNavigationItemKind(page('a', { children: [] }))).toBe('link');
    expect(getNavigationItemKind({ id: 'a', label: 'a' })).toBe('text');
  });
  it('repeats a group with its own href as the first link, under an unused id', () => {
    const group = page('forms', { current: true, expanded: true, children: [page('select'), page('forms-page')] });
    const entries = getNavigationGroupEntries(group);
    expect(entries.map(item => item.id)).toEqual(['forms-page-page', 'select', 'forms-page']);
    expect(entries[0]).toMatchObject({ href: '/forms', current: true, children: undefined, expanded: undefined });
    const plain: NavigationItem = { id: 'forms', label: 'Forms', children: [page('select')] };
    expect(getNavigationGroupEntries(plain)).toBe(plain.children); expect(getNavigationGroupEntries(page('leaf'))).toEqual([{ ...page('leaf'), id: 'leaf-page', children: undefined, expanded: undefined }]);
  });
  it('opens a group when expanded is true or a rendered link inside it is the current page', () => {
    expect(isNavigationGroupOpen({ id: 'g', label: 'g', children: [page('a')] })).toBe(false);
    expect(isNavigationGroupOpen({ id: 'g', label: 'g', expanded: true, children: [page('a')] })).toBe(true);
    expect(isNavigationGroupOpen({ id: 'g', label: 'g', expanded: false, children: [page('a', { current: true })] })).toBe(true);
    expect(isNavigationGroupOpen({ id: 'g', label: 'g', children: [{ id: 'h', label: 'h', children: [page('a', { current: true })] }] })).toBe(true);
    expect(isNavigationGroupOpen(page('g', { current: true, children: [page('a')] }))).toBe(true);
    // Entries that are not rendered as a current link do not open their group.
    expect(isNavigationGroupOpen({ id: 'g', label: 'g', current: true, children: [page('a')] })).toBe(false);
    expect(isNavigationGroupOpen({ id: 'g', label: 'g', children: [page('a', { current: true, disabled: true })] })).toBe(false);
    expect(isNavigationGroupOpen({ id: 'g', label: 'g', children: [{ id: 'a', label: 'a', current: true }] })).toBe(false);
    expect(isNavigationGroupOpen({ id: 'g', label: 'g', children: [{ id: 'h', label: 'h', disabled: true, children: [page('a', { current: true })] }] })).toBe(false);
  });
  it('finds the first current link in document order', () => {
    expect(getNavigationCurrentId([])).toBe(''); expect(getNavigationCurrentId([page('a'), { id: 'g', label: 'g', children: [page('b')] }])).toBe('');
    expect(getNavigationCurrentId([page('a'), { id: 'g', label: 'g', children: [page('b', { current: true })] }, page('c', { current: true })])).toBe('b');
    expect(getNavigationCurrentId([page('g', { current: true, children: [page('b', { current: true })] })])).toBe('g-page');
    expect(getNavigationCurrentId([page('a', { current: true, disabled: true }), { id: 't', label: 't', current: true }, page('c', { current: true })])).toBe('c');
  });
});

describe('revealNavigationCurrent', () => {
  const number = (element: object, key: string, value: number) => Object.defineProperty(element, key, { configurable: true, value });
  const rect = (element: HTMLElement, top: number, height: number) => { element.getBoundingClientRect = () => ({ top, bottom: top + height, left: 0, right: 200, x: 0, y: top, width: 200, height, toJSON() {} }); };
  const setup = (linkTop: number, linkHeight = 40) => {
    document.body.innerHTML = '<nav><ul><li><a href="/a">A</a></li><li><a href="/b" aria-current="page">B</a></li></ul></nav><button>Outside</button>';
    const navigation = document.querySelector('nav')!, link = navigation.querySelector<HTMLElement>('[aria-current]')!;
    number(navigation, 'clientHeight', 200); number(navigation, 'scrollHeight', 1000); number(navigation, 'clientTop', 0); navigation.scrollTop = 100;
    rect(navigation, 50, 200); rect(link, linkTop, linkHeight); navigation.scrollTo = vi.fn();
    return { navigation, link };
  };
  it('centres a current link that is out of view, without animation, page scroll or focus', () => {
    const { navigation } = setup(600); const page = vi.spyOn(window, 'scrollTo').mockImplementation(() => {}); const view = vi.fn(); Element.prototype.scrollIntoView = view;
    const button = document.querySelector('button')!; button.focus();
    expect(revealNavigationCurrent(navigation)).toBe(true);
    expect(navigation.scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 570, behavior: 'instant' });
    expect(page).not.toHaveBeenCalled(); expect(view).not.toHaveBeenCalled(); expect(document.activeElement).toBe(button);
    page.mockRestore(); delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView;
  });
  it('clamps to the scroll range and writes scrollTop where scrollTo is missing', () => {
    const above = setup(-400); expect(revealNavigationCurrent(above.navigation)).toBe(true); expect(above.navigation.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' });
    const below = setup(5000); (below.navigation as { scrollTo?: unknown }).scrollTo = undefined;
    expect(revealNavigationCurrent(below.navigation)).toBe(true); expect(below.navigation.scrollTop).toBe(800);
  });
  it('does nothing when the link is visible, the list does not overflow, the group is closed or nothing is current', () => {
    const visible = setup(100); expect(revealNavigationCurrent(visible.navigation)).toBe(false); expect(visible.navigation.scrollTo).not.toHaveBeenCalled();
    const fits = setup(600); number(fits.navigation, 'scrollHeight', 200); expect(revealNavigationCurrent(fits.navigation)).toBe(false);
    const closed = setup(0, 0); expect(revealNavigationCurrent(closed.navigation)).toBe(false);
    const none = setup(600); none.link.removeAttribute('aria-current'); expect(revealNavigationCurrent(none.navigation)).toBe(false); expect(none.navigation.scrollTo).not.toHaveBeenCalled();
  });
  it('is inert without layout or without an element', () => {
    const { navigation } = setup(600); Object.defineProperty(navigation, 'getBoundingClientRect', { configurable: true, value: undefined });
    expect(revealNavigationCurrent(navigation)).toBe(false); expect(revealNavigationCurrent(null)).toBe(false); expect(revealNavigationCurrent(undefined)).toBe(false);
  });
});
