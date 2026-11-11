import { act } from 'react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { resetTextWarnings } from '@hawiyah/core';
import { AppShell, ContentNavigation, PortalHeader, PortalLayout, ToggleGroup } from './src/index.js';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let container: HTMLDivElement; let root: Root; let warn: ReturnType<typeof vi.spyOn>;
const warnings = () => (warn.mock.calls as unknown[][]).map(call => String(call[0])).filter(message => message.startsWith('Hawiyah:'));
async function render(node: ReactNode) { await act(async () => root.render(node)); }
const options = [{ value: 'light', label: 'فاتح' }, { value: 'dark', label: 'داكن' }];
const header = { brand: 'هوية', navigationLabel: 'التنقل الرئيسي', menuLabel: 'القائمة', navigation: [{ label: 'الخدمات', href: '#services' }] };
const before = (first: Node, second: Node) => Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING);

beforeEach(() => { resetTextWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined); container = document.createElement('div'); document.body.append(container); root = createRoot(container); });
afterEach(async () => { await act(async () => root.unmount()); container.remove(); warn.mockRestore(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });

it('[tg-label-hidden] hides the legend visually and keeps it first with its text', async () => {
  await render(<ToggleGroup label="المظهر" labelHidden options={options} />);
  const fieldset = container.querySelector('fieldset')!; const legend = fieldset.firstElementChild!;
  expect(legend.tagName).toBe('LEGEND'); expect(legend.className).toBe('hw-label hw-sr-only'); expect(legend.textContent).toBe('المظهر');
  expect(fieldset.hasAttribute('labelhidden')).toBe(false); expect(fieldset.hasAttribute('labelHidden')).toBe(false);
});
it('[tg-label-visible] keeps the visible legend by default', async () => {
  await render(<><ToggleGroup label="المظهر" options={options} /><ToggleGroup label="الحجم" labelHidden={false} options={options} /></>);
  for (const legend of container.querySelectorAll('legend')) expect(legend.className).toBe('hw-label');
});
it('[tg-name-unchanged] keeps the name, options and value in single and multiple mode', async () => {
  const single = vi.fn(); const multiple = vi.fn();
  await render(<><ToggleGroup label="المظهر" labelHidden options={options} onValueChange={single} /><ToggleGroup multiple label="الأنماط" labelHidden options={options} onValueChange={multiple} /></>);
  const [first, second] = container.querySelectorAll('fieldset');
  for (const [fieldset, text] of [[first!, 'المظهر'], [second!, 'الأنماط']] as const) { expect(fieldset.hasAttribute('aria-label')).toBe(false); expect(fieldset.hasAttribute('aria-labelledby')).toBe(false); expect(fieldset.querySelector('legend')!.textContent).toBe(text); }
  expect(first!.querySelectorAll('input[type="radio"]')).toHaveLength(2); expect(second!.querySelectorAll('button[aria-pressed]')).toHaveLength(2);
  await act(async () => first!.querySelector<HTMLInputElement>('input[value="dark"]')!.click()); expect(single).toHaveBeenCalledWith('dark');
  await act(async () => second!.querySelector<HTMLButtonElement>('button')!.click()); expect(multiple).toHaveBeenCalledWith(['light']);
  expect(warnings()).toEqual([]);
});
it('[tg-hint-error] leaves the description association unchanged', async () => {
  // React ToggleGroup has no hint or error inputs; the application's aria-describedby stands as written.
  await render(<><p id="hint">تلميح</p><p id="error">خطأ</p><ToggleGroup label="المظهر" options={options} aria-describedby="hint error" /><ToggleGroup label="المظهر" labelHidden options={options} aria-describedby="hint error" /></>);
  const [visible, hidden] = container.querySelectorAll('fieldset');
  expect(hidden!.getAttribute('aria-describedby')).toBe(visible!.getAttribute('aria-describedby')); expect(hidden!.getAttribute('aria-describedby')).toBe('hint error');
});
it('[ph-notice] renders the notice first after the skip link, before the brand', async () => {
  await render(<PortalHeader {...header} mainId="main" skipLabel="انتقل إلى المحتوى" notice={<a href="#verify">منصة حكومية</a>} />);
  const root = container.querySelector('header.hw-portal-header')!; const notice = root.querySelector('.hw-portal-notice')!;
  expect(notice.tagName).toBe('DIV'); expect(notice.parentElement).toBe(root); expect(notice.innerHTML).toBe('<a href="#verify">منصة حكومية</a>');
  expect(before(root.querySelector('a.hw-skip-link')!, notice)).toBe(true); expect(before(notice, root.querySelector('.hw-portal-brand')!)).toBe(true);
});
it('[ph-notice-absent] renders no notice container without a notice', async () => {
  await render(<PortalHeader {...header} />); expect(container.querySelector('.hw-portal-notice')).toBeNull();
});
it('[ph-notice-no-text-contract] adds no warning, role or aria attribute to the notice', async () => {
  await render(<><PortalHeader {...header} notice="منصة حكومية" /><PortalHeader {...header} /></>);
  const notice = container.querySelector('.hw-portal-notice')!;
  expect(notice.hasAttribute('role')).toBe(false); expect(notice.getAttributeNames().filter(name => name.startsWith('aria-'))).toEqual([]); expect(warnings()).toEqual([]);
});
it('[ph-actions-class] renders actions in div.hw-portal-header-actions after the nav', async () => {
  await render(<PortalHeader {...header} actions={<button type="button">دخول</button>} />);
  const actions = container.querySelector('.hw-portal-header-actions')!;
  expect(actions.tagName).toBe('DIV'); expect(actions.innerHTML).toBe('<button type="button">دخول</button>'); expect(before(container.querySelector('header nav')!, actions)).toBe(true);
  expect(container.querySelector('.hw-portal-actions')).toBeNull();
});
it('[ph-actions-absent] renders no actions container without actions', async () => {
  await render(<PortalHeader {...header} />); expect(container.querySelector('.hw-portal-header-actions, .hw-portal-actions')).toBeNull();
});
it('[ph-layout-notice] passes headerProps.notice to the header', async () => {
  await render(<PortalLayout brand="هوية" skipLabel="انتقل إلى المحتوى" menuLabel="القائمة" navigationLabel="التنقل الرئيسي" headerProps={{ notice: <span>منصة حكومية</span> }} footerProps={{ externalLabel: 'يفتح في نافذة جديدة' }}><h1>العنوان</h1></PortalLayout>);
  expect(warnings()).toEqual([]); expect(container.querySelector('header.hw-portal-header > div.hw-portal-notice')!.innerHTML).toBe('<span>منصة حكومية</span>');
});
it('[ph-menu-unchanged] keeps the menu disclosure and Escape with a notice and actions', async () => {
  await render(<PortalHeader {...header} notice={<a href="#verify">منصة حكومية</a>} actions={<button type="button">دخول</button>} />);
  const trigger = container.querySelector<HTMLButtonElement>('.hw-portal-menu-toggle')!; const nav = container.querySelector('header nav') as HTMLElement; const link = nav.querySelector('a')!;
  await act(async () => trigger.click()); expect(nav.dataset.open).toBe('true');
  await act(async () => { link.focus(); link.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })); });
  expect(nav.dataset.open).toBe('false'); expect(document.activeElement).toBe(trigger);
});
it('[al-app-shell-regions] renders the shell regions without its own banner or contentinfo', async () => {
  await render(<AppShell mainId="main" skipLabel="انتقل إلى المحتوى" header={<header>الترويسة</header>} sidebar={<nav aria-label="أقسام">روابط</nav>} footer={<p>التذييل</p>}><h1>العنوان</h1></AppShell>);
  const shell = container.querySelector('.hw-app-shell')!;
  expect(shell.querySelector('.hw-app-shell-header')!.tagName).toBe('DIV'); expect(shell.querySelector('.hw-app-shell-sidebar')!.tagName).toBe('ASIDE');
  expect(shell.querySelector('.hw-app-shell-main')!.tagName).toBe('MAIN'); expect(shell.querySelector('.hw-app-shell-footer')!.tagName).toBe('DIV');
  const headers = shell.querySelectorAll('header'); expect(headers).toHaveLength(1); expect(headers[0]!.parentElement!.className).toBe('hw-app-shell-header');
  expect(shell.querySelector('footer')).toBeNull();
});

// Content navigation: the layout is mocked as in the core hold tests.
const sections = ['one', 'two', 'three', 'four', 'five'];
async function contentNavigation(onCurrentChange: (id: string) => void) {
  let y = 0; vi.useFakeTimers();
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  const number = (element: object, key: string, value: () => number) => Object.defineProperty(element, key, { configurable: true, get: value });
  number(window, 'scrollY', () => y); number(window, 'innerHeight', () => 600); number(document.documentElement, 'scrollHeight', () => 3000); number(document.body, 'scrollHeight', () => 3000);
  (window as { onscrollend?: unknown }).onscrollend = null;
  const tops = [0, 500, 1000, 1500, 2400], heights = [500, 500, 500, 900, 600];
  await render(<><ContentNavigation label="في هذه الصفحة" items={sections.map(id => ({ id, label: id }))} onCurrentChange={onCurrentChange} />{sections.map(id => <section key={id} id={id} />)}</>);
  const rect = (element: Element, top: () => number, height: number) => { (element as HTMLElement).getBoundingClientRect = () => ({ top: top(), bottom: top() + height, left: 0, right: 300, x: 0, y: top(), height, width: 300, toJSON() {} }) as DOMRect; };
  rect(container.querySelector('nav')!, () => 0, 100);
  sections.forEach((id, index) => rect(document.getElementById(id)!, () => tops[index]! - y, heights[index]!));
  const frame = async (ms = 20) => { await act(async () => { await vi.advanceTimersByTimeAsync(ms); }); };
  const scroll = async (position: number) => { y = position; window.dispatchEvent(new Event('scroll')); await frame(); };
  await act(async () => { window.dispatchEvent(new Event('resize')); }); await frame();
  const cleanup = () => { delete (window as { onscrollend?: unknown }).onscrollend; for (const [element, key] of [[window, 'scrollY'], [window, 'innerHeight'], [document.documentElement, 'scrollHeight'], [document.body, 'scrollHeight']] as const) delete (element as unknown as Record<string, unknown>)[key]; };
  return { frame, scroll, cleanup, link: (id: string) => container.querySelector<HTMLAnchorElement>(`a[data-hw-section="${id}"]`)! };
}
it('[cn-one-change] reports one change for one activation while a smooth scroll passes the sections between', async () => {
  const changes: string[] = []; const { scroll, frame, cleanup, link } = await contentNavigation(id => changes.push(id));
  try {
    const start = changes.length; const marked: string[] = [];
    await act(async () => { link('five').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 })); });
    for (const position of [120, 480, 900, 1300, 1800, 2200, 2320]) { await scroll(position); marked.push(...Array.from(container.querySelectorAll('a[aria-current="location"]'), element => element.getAttribute('data-hw-section')!)); }
    window.dispatchEvent(new Event('scrollend')); await frame();
    expect(changes.slice(start)).toEqual(['five']); expect(new Set(marked)).toEqual(new Set(['five']));
  } finally { cleanup(); }
});
it('[cn-reader-takes-over] moves the marker to the measured section after the reader scrolls', async () => {
  const changes: string[] = []; const { scroll, frame, cleanup, link } = await contentNavigation(id => changes.push(id));
  try {
    await act(async () => { link('five').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 })); });
    await scroll(600); expect(changes.at(-1)).toBe('five');
    window.dispatchEvent(new Event('wheel')); await scroll(1100); await frame();
    expect(changes.at(-1)).toBe('three'); expect(container.querySelector('a[aria-current="location"]')!.getAttribute('data-hw-section')).toBe('three');
  } finally { cleanup(); }
});
