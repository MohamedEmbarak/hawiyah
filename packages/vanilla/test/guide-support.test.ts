import { bindLinkNavigation, resetTextWarnings, type LinkNavigation } from '@hawiyah/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createContentNavigation, createNavigationDrawer, createPortalHeader, createToggleGroup, enhance } from '../src/index.js';

const mount = (html: string) => { document.body.insertAdjacentHTML('beforeend', html); return document.body.lastElementChild as HTMLElement; };
let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => { resetTextWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
afterEach(() => { expect(warn.mock.calls.filter(([message]) => String(message).startsWith('Hawiyah:'))).toEqual([]); warn.mockRestore(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); document.body.replaceChildren(); });

describe('ToggleGroup labelHidden (authored legend)', () => {
  const radios = '<label><input type="radio" name="view" value="list" checked>قائمة</label><label><input type="radio" name="view" value="grid">شبكة</label>';
  const buttons = '<button type="button" data-hw-value="bold" aria-pressed="false">Bold</button><button type="button" data-hw-value="italic" aria-pressed="false">Italic</button>';
  const group = (legend: string, items = radios, attributes = '') => mount(`<fieldset class="hw-toggle-group" data-hw="toggle-group"${attributes}><legend class="${legend}">طريقة العرض</legend>${items}</fieldset>`);
  it('[tg-label-hidden] keeps the visually hidden legend first with its text', () => {
    const root = group('hw-label hw-sr-only'); createToggleGroup(root);
    const legend = root.firstElementChild!; expect(legend.localName).toBe('legend'); expect([...legend.classList]).toEqual(['hw-label', 'hw-sr-only']); expect(legend.textContent).toBe('طريقة العرض');
  });
  it('[tg-label-visible] keeps the visible legend with hw-label only', () => {
    const root = group('hw-label'); createToggleGroup(root); expect([...root.querySelector('legend')!.classList]).toEqual(['hw-label']);
  });
  it('[tg-name-unchanged] adds no name and keeps selection in both modes', () => {
    for (const [items, multiple, value, expected] of [[radios, false, 'grid', 'grid'], [buttons, true, 'italic', ['italic']]] as const) {
      const root = group('hw-label hw-sr-only', items, multiple ? ' data-hw-multiple="true"' : '');
      const values: unknown[] = []; const controller = createToggleGroup(root, { onValueChange: next => values.push(next) });
      expect(root.hasAttribute('aria-label')).toBe(false); expect(root.hasAttribute('aria-labelledby')).toBe(false); expect(root.querySelector('legend')!.textContent).toBe('طريقة العرض');
      controller.select(value); expect(values).toEqual([expected]);
    }
  });
  it('[tg-hint-error] keeps the authored descriptions', () => {
    const describe = (legend: string) => { const root = group(legend, `${radios}<p id="hint-${legend.length}" class="hw-hint">تلميح</p><p id="error-${legend.length}" class="hw-error">خطأ</p>`, ` aria-describedby="hint-${legend.length} error-${legend.length}"`); createToggleGroup(root); return root.getAttribute('aria-describedby')!.replace(/-\d+/g, ''); };
    expect(describe('hw-label hw-sr-only')).toBe(describe('hw-label'));
  });
  it('[tg-vanilla-authored] leaves the legend as authored through destroy()', () => {
    const root = group('hw-label hw-sr-only'); const legend = root.querySelector('legend')!; const before = legend.cloneNode(true);
    createToggleGroup(root).destroy(); expect(legend.isEqualNode(before)).toBe(true); expect(root.firstElementChild).toBe(legend);
  });
});

describe('PortalHeader notice and actions (authored)', () => {
  const header = ({ notice = true, actions = true } = {}) => mount(`<header class="hw-portal-header" data-hw="portal-header"><a class="hw-skip-link" href="#main">انتقل إلى المحتوى</a>${notice ? '<div class="hw-portal-notice"><a href="/verify">موقع حكومي رسمي</a></div>' : ''}<a class="hw-portal-brand" href="/">هوية</a><button type="button" class="hw-button hw-portal-menu-toggle" data-hw-portal-toggle>القائمة</button><nav aria-label="التنقل الرئيسي" data-hw-portal-navigation><ul><li><a href="/services">الخدمات</a></li></ul></nav>${actions ? '<div class="hw-portal-header-actions"><button type="button">English</button></div>' : ''}</header>`);
  const order = (root: Element, first: Element, second: Element) => expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  it('[ph-notice] keeps the notice between the skip link and the brand', () => {
    const root = header(); const release = enhance(root);
    const notice = root.querySelector('.hw-portal-notice')!;
    expect(notice.parentElement).toBe(root); order(root, root.querySelector('a.hw-skip-link')!, notice); order(root, notice, root.querySelector('.hw-portal-brand')!);
    expect(notice.innerHTML).toBe('<a href="/verify">موقع حكومي رسمي</a>'); release();
  });
  it('[ph-notice-absent] adds no notice container', () => { const root = header({ notice: false }); const release = enhance(root); expect(root.querySelector('.hw-portal-notice')).toBeNull(); release(); });
  it('[ph-notice-no-text-contract] adds no role, aria attribute or warning to the notice', () => {
    for (const notice of [true, false]) { const root = header({ notice }); const release = enhance(root); const element = root.querySelector('.hw-portal-notice'); if (element) expect([...element.attributes].map(attribute => attribute.name)).toEqual(['class']); release(); }
  });
  it('[ph-actions-class] keeps the actions container after the navigation', () => {
    const root = header(); const release = enhance(root);
    const actions = root.querySelector('div.hw-portal-header-actions')!; order(root, root.querySelector('nav')!, actions);
    expect(root.querySelector('.hw-portal-actions')).toBeNull(); release();
  });
  it('[ph-actions-absent] adds no actions container', () => { const root = header({ actions: false }); const release = enhance(root); expect(root.querySelector('.hw-portal-header-actions')).toBeNull(); release(); });
  it('[ph-menu-unchanged] still opens, closes and returns focus with both regions filled', () => {
    const root = header(); const controller = createPortalHeader(root);
    const toggle = root.querySelector<HTMLButtonElement>('[data-hw-portal-toggle]')!;
    toggle.click(); expect(controller.open).toBe(true);
    root.querySelector<HTMLAnchorElement>('nav a')!.focus();
    root.querySelector('nav a')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(controller.open).toBe(false); expect(document.activeElement).toBe(toggle); controller.destroy();
  });
});

describe('Client-side routing with core bindLinkNavigation', () => {
  let links: LinkNavigation | undefined; let paths: string[]; let outcome: boolean | undefined;
  // Records whether the default was prevented once every handler ran, then cancels so that the test DOM does not navigate.
  const settle = (event: Event) => { outcome = event.defaultPrevented; event.preventDefault(); };
  beforeEach(() => { paths = []; outcome = undefined; window.addEventListener('click', settle); });
  afterEach(() => { links?.destroy(); links = undefined; window.removeEventListener('click', settle); });
  const route = () => { links = bindLinkNavigation(document, { navigate: ({ path }) => { paths.push(path); } }); };
  const click = (link: Element, init: MouseEventInit = {}) => { const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init }); link.dispatchEvent(event); return event; };
  const page = () => mount('<div><nav class="hw-breadcrumb" aria-label="مسار التنقل"><ol><li><a href="/guide">الدليل</a></li><li><span aria-current="page">النسخ</span></li></ol></nav><nav class="hw-side-navigation hw-navigation-drawer-nav" data-hw="side-navigation" aria-label="الأقسام"><ul><li data-hw-value="copy"><a class="hw-navigation-drawer-row" href="/components/copy-button"><span class="hw-navigation-drawer-label">النسخ</span></a></li></ul></nav></div>');
  it('[ln-routed] hands packaged links to the router', () => {
    const root = page(); const release = enhance(root); route();
    expect(click(root.querySelector('.hw-breadcrumb a')!).defaultPrevented).toBe(true);
    expect(click(root.querySelector('.hw-side-navigation a')!).defaultPrevented).toBe(true);
    expect(paths).toEqual(['/guide', '/components/copy-button']); release();
  });
  it('[ln-modified] leaves modified and middle clicks to the browser', () => {
    const root = page(); const release = enhance(root); route();
    for (const init of [{ ctrlKey: true }, { metaKey: true }, { button: 1 }]) { click(root.querySelector('.hw-side-navigation a')!, init); expect(outcome).toBe(false); }
    expect(paths).toEqual([]); release();
  });
  it('[ln-prevented] ignores a click the application already prevented', () => {
    const root = page(); const release = enhance(root); route();
    const link = root.querySelector('.hw-side-navigation a')!; link.addEventListener('click', event => event.preventDefault());
    click(link); expect(paths).toEqual([]); release();
  });
  const drawer = () => {
    const dialog = mount('<dialog><nav class="hw-navigation-drawer-nav" aria-label="القائمة"><ul><li data-hw-value="copy"><a class="hw-navigation-drawer-row" href="/components/copy-button"><span class="hw-navigation-drawer-label">النسخ</span></a></li></ul></nav></dialog>') as HTMLDialogElement;
    dialog.showModal = () => { dialog.open = true; }; dialog.close = () => { dialog.open = false; };
    const controller = createNavigationDrawer(dialog); controller.show(); return { dialog, controller, link: dialog.querySelector('a')! };
  };
  it('[nd-closes-after-routed-click] [ln-drawer-closes] closes the drawer after a routed click only', async () => {
    route();
    const routed = drawer(); routed.link.click(); await Promise.resolve();
    expect(paths).toEqual(['/components/copy-button']); expect(routed.dialog.open).toBe(false); routed.controller.destroy();
    const modified = drawer(); click(modified.link, { ctrlKey: true }); await Promise.resolve();
    expect(paths).toHaveLength(1); expect(modified.dialog.open).toBe(true); modified.controller.destroy();
    links!.destroy(); links = undefined;
    const prevent = (event: Event) => event.preventDefault(); document.addEventListener('click', prevent);
    const guarded = drawer(); guarded.link.click(); await Promise.resolve();
    expect(guarded.dialog.open).toBe(true); document.removeEventListener('click', prevent); guarded.controller.destroy();
  });
  it('[ln-no-handler-prevents] packaged link handlers do not prevent a plain navigation', () => {
    const header = mount('<header class="hw-portal-header" data-hw="portal-header"><button type="button" data-hw-portal-toggle>القائمة</button><nav aria-label="التنقل" data-hw-portal-navigation><a href="/services">الخدمات</a></nav></header>');
    const release = enhance(header);
    click(header.querySelector('a')!); expect(outcome).toBe(false);
    const { link, controller } = drawer(); click(link); expect(outcome).toBe(false);
    controller.destroy(); release();
  });
});

describe('ContentNavigation steady current', () => {
  const sections = ['one', 'two', 'three', 'four', 'five'];
  async function contentNavigation(onCurrentChange: (id: string) => void) {
    let y = 0; vi.useFakeTimers();
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const number = (element: object, key: string, value: () => number) => Object.defineProperty(element, key, { configurable: true, get: value });
    number(window, 'scrollY', () => y); number(window, 'innerHeight', () => 600); number(document.documentElement, 'scrollHeight', () => 3000); number(document.body, 'scrollHeight', () => 3000);
    (window as { onscrollend?: unknown }).onscrollend = null;
    const tops = [0, 500, 1000, 1500, 2400], heights = [500, 500, 500, 900, 600];
    const nav = mount(`<nav aria-label="في هذه الصفحة" data-hw="content-navigation"><ul>${sections.map(id => `<li><a href="#${id}">${id}</a></li>`).join('')}</ul></nav>`);
    sections.forEach(id => mount(`<section id="${id}"></section>`));
    const rect = (element: Element, top: () => number, height: number) => { (element as HTMLElement).getBoundingClientRect = () => ({ top: top(), bottom: top() + height, left: 0, right: 300, x: 0, y: top(), height, width: 300, toJSON() {} }) as DOMRect; };
    rect(nav, () => 0, 100);
    sections.forEach((id, index) => rect(document.getElementById(id)!, () => tops[index]! - y, heights[index]!));
    const controller = createContentNavigation(nav, { onCurrentChange });
    const frame = async (ms = 20) => { await vi.advanceTimersByTimeAsync(ms); };
    const scroll = async (position: number) => { y = position; window.dispatchEvent(new Event('scroll')); await frame(); };
    window.dispatchEvent(new Event('resize')); await frame();
    const cleanup = () => { controller.destroy(); delete (window as { onscrollend?: unknown }).onscrollend; for (const [element, key] of [[window, 'scrollY'], [window, 'innerHeight'], [document.documentElement, 'scrollHeight'], [document.body, 'scrollHeight']] as const) delete (element as unknown as Record<string, unknown>)[key]; };
    return { frame, scroll, cleanup, nav, link: (id: string) => nav.querySelector<HTMLAnchorElement>(`a[href="#${id}"]`)! };
  }
  it('[cn-one-change] reports one change for one activation while a smooth scroll passes the sections between', async () => {
    const changes: string[] = []; const { scroll, frame, cleanup, link, nav } = await contentNavigation(id => changes.push(id));
    try {
      const start = changes.length; const marked: string[] = [];
      link('five').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }));
      for (const position of [120, 480, 900, 1300, 1800, 2200, 2320]) { await scroll(position); marked.push(...Array.from(nav.querySelectorAll('a[aria-current="location"]'), element => element.getAttribute('href')!)); }
      window.dispatchEvent(new Event('scrollend')); await frame();
      expect(changes.slice(start)).toEqual(['five']); expect(new Set(marked)).toEqual(new Set(['#five']));
    } finally { cleanup(); }
  });
  it('[cn-reader-takes-over] moves the marker to the measured section after the reader scrolls', async () => {
    const changes: string[] = []; const { scroll, frame, cleanup, link, nav } = await contentNavigation(id => changes.push(id));
    try {
      link('five').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }));
      await scroll(600); expect(changes.at(-1)).toBe('five');
      window.dispatchEvent(new Event('wheel')); await scroll(1100); await frame();
      expect(changes.at(-1)).toBe('three'); expect(nav.querySelector('a[aria-current="location"]')!.getAttribute('href')).toBe('#three');
    } finally { cleanup(); }
  });
});
