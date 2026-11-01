import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { NavigationDrawer } from './src/navigation-drawer.js';
import type { NavigationDrawerItem } from './src/navigation-drawer.js';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const roots: ReturnType<typeof createRoot>[] = [];
const items: readonly NavigationDrawerItem[] = [
  { id: 'home', label: 'الرئيسية', href: '#home', icon: 'home-06', current: true },
  { id: 'services', label: 'الخدمات', href: '#services', children: [{ id: 'request', label: 'طلب خدمة', href: '#request' }] },
  { id: 'disabled', label: 'غير متاح', href: '#disabled', disabled: true },
  { id: 'disabled-group', label: 'مجموعة غير متاحة', disabled: true, children: [{ id: 'hidden', label: 'Hidden', href: '#hidden' }] },
];
beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value() { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value() { this.open = false; this.dispatchEvent(new Event('close')); } });
});
afterEach(async () => { for (const root of roots.splice(0)) await act(() => root.unmount()); document.body.replaceChildren(); vi.restoreAllMocks(); });
it('renders page links and native groups, suppresses disabled actions, closes routes and restores focus', async () => {
  const container = document.createElement('div'); document.body.append(container);
  const root = createRoot(container); roots.push(root);
  await act(() => root.render(<NavigationDrawer title="القائمة" items={items} trigger={<button>Open</button>} userContent={<p>حساب المستخدم</p>} footer={<p>Footer</p>} />));
  const trigger = container.querySelector('button')!; trigger.focus();
  await act(() => trigger.click());
  const dialog = container.querySelector('dialog')!;
  expect(dialog.open).toBe(true); expect(dialog.dataset.side).toBe('start');
  expect(dialog.querySelector('nav')!.getAttribute('aria-label')).toBe('التنقل الرئيسي');
  expect(dialog.querySelector('[role="menu"], [role="tree"], [role="tablist"]')).toBeNull();
  expect(dialog.querySelector('a[aria-current="page"]')!.textContent).toBe('الرئيسية');
  expect(dialog.querySelector('a[href="#disabled"], a[href="#hidden"]')).toBeNull();
  expect(dialog.querySelector('[aria-disabled="true"]')!.tagName).toBe('SPAN');
  const summary = dialog.querySelector('summary')!;
  summary.focus(); await act(() => summary.click());
  expect(summary.parentElement!.hasAttribute('open')).toBe(true); expect(dialog.open).toBe(true);
  const route = dialog.querySelector<HTMLAnchorElement>('a[href="#request"]')!; route.focus();
  expect(document.activeElement).toBe(route);
  await act(() => route.click());
  expect(dialog.open).toBe(false); expect(document.activeElement).toBe(trigger);
});
it('respects a consumer prevented route and preserves modifier-click navigation', async () => {
  const container = document.createElement('div'); document.body.append(container);
  const root = createRoot(container); roots.push(root);
  let prevent = true;
  await act(() => root.render(<NavigationDrawer title="القائمة" defaultOpen items={items} onClick={event => { if (prevent) event.preventDefault(); }} />));
  const dialog = container.querySelector('dialog')!; const link = dialog.querySelector('a')!;
  await act(() => link.click()); expect(dialog.open).toBe(true);
  prevent = false;
  await act(() => link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true })));
  expect(dialog.open).toBe(true);
  await act(() => link.click()); expect(dialog.open).toBe(false);
});
