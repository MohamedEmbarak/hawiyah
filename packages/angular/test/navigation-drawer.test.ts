import '@angular/compiler';
import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import { HwNavigationDrawerComponent } from '@hawiyah/angular';
import { bindLinkNavigation } from '@hawiyah/core';
import { page } from './fixtures/page';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value() { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value() { this.open = false; this.dispatchEvent(new Event('close')); } });
});
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); });
// The drawer decides in a timer after the click was dispatched, so that listeners on ancestors have run (a microtask would run before them during a user click).
const dispatched = () => new Promise<void>(resolve => setTimeout(resolve));
it('composes the native Drawer with page links, disclosure groups and disabled entries', async () => {
  const fixture = TestBed.createComponent(HwNavigationDrawerComponent);
  fixture.componentRef.setInput('title', 'القائمة'); fixture.componentRef.setInput('navigationLabel', 'التنقل الرئيسي'); fixture.componentRef.setInput('closeLabel', 'إغلاق القائمة'); fixture.componentRef.setInput('titleId', 'menu-title'); fixture.componentRef.setInput('items', [
    { id: 'services', label: 'الخدمات', href: '#services', children: [{ id: 'request', label: 'طلب خدمة', href: '#request', current: true }] },
    { id: 'disabled', label: 'غير متاح', href: '#disabled', disabled: true },
    { id: 'disabled-group', label: 'Disabled group', disabled: true, children: [{ id: 'hidden', label: 'Hidden', href: '#hidden' }] },
  ]); fixture.detectChanges();
  const trigger = document.createElement('button'); document.body.append(trigger); trigger.focus();
  fixture.componentInstance.show(trigger); fixture.detectChanges();
  const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
  expect(dialog.open).toBe(true); expect(dialog.dataset.side).toBe('start');
  expect(dialog.querySelector('nav')!.getAttribute('aria-label')).toBe('التنقل الرئيسي');
  expect(dialog.querySelector('.hw-dialog-header button')!.getAttribute('aria-label')).toBe('إغلاق القائمة');
  expect(dialog.getAttribute('aria-labelledby')).toBe('menu-title'); expect(dialog.querySelector('h2')!.id).toBe('menu-title');
  expect((fixture.nativeElement as HTMLElement).hasAttribute('title')).toBe(false);
  expect(dialog.querySelector('a[href="#disabled"], a[href="#hidden"]')).toBeNull();
  // The group that holds the current page starts open; the summary is a native disclosure.
  const summary = dialog.querySelector('summary')!; expect(summary.parentElement!.hasAttribute('open')).toBe(true); summary.click(); expect(summary.parentElement!.hasAttribute('open')).toBe(false); summary.click(); expect(summary.parentElement!.hasAttribute('open')).toBe(true);
  const link = dialog.querySelector<HTMLAnchorElement>('a[href="#request"]')!;
  const prevent = (event: Event) => event.preventDefault(); dialog.addEventListener('click', prevent);
  link.click(); await dispatched(); expect(dialog.open).toBe(true);
  dialog.removeEventListener('click', prevent); link.focus(); link.click(); await Promise.resolve(); expect(dialog.open).toBe(true); await dispatched(); fixture.detectChanges();
  expect(dialog.open).toBe(false); expect(document.activeElement).toBe(trigger);
});

it('[nd-group-open] opens the group that holds the current page and a group marked expanded, and no other', () => {
  const items = [
    { id: 'guides', label: 'Guides', children: [{ id: 'install', label: 'Install', href: '/install', current: true }] },
    { id: 'reference', label: 'Reference', expanded: true, children: [{ id: 'tokens', label: 'Tokens', href: '/tokens' }] },
    { id: 'more', label: 'More', children: [{ id: 'about', label: 'About', href: '/about' }] },
  ];
  const { root, update } = page(`<hw-navigation-drawer title="Menu" navigationLabel="Main" closeLabel="Close" open [items]="items" />`, { items });
  const open = () => ['guides', 'reference', 'more'].map(id => (root.querySelector(`li[data-hw-value="${id}"] > details`) as HTMLDetailsElement).hasAttribute('open'));
  expect(open()).toEqual([true, true, false]);
  // The current page moves: its new group opens, the one it left closes, the expanded one stays.
  update({ items: [{ ...items[0]!, children: [{ id: 'install', label: 'Install', href: '/install' }] }, items[1]!, { ...items[2]!, children: [{ id: 'about', label: 'About', href: '/about', current: true }] }] as typeof items });
  expect(open()).toEqual([false, true, true]);
});
it('[nd-closes-after-routed-click] [ln-drawer-closes] closes after a click the application router took, stays open after a cancelled click, and ignores a modified one', async () => {
  const items = [{ id: 'guides', label: 'Guides', children: [{ id: 'install', label: 'Install', href: '/guides/install' }] }, { id: 'home', label: 'Home', href: '/home' }];
  const { root, fixture } = page(`<hw-navigation-drawer title="Menu" navigationLabel="Main" closeLabel="Close" open [items]="items" />`, { items });
  const dialog = root.querySelector('dialog') as HTMLDialogElement; const drawer = () => { fixture.detectChanges(); return dialog.open; };
  const reopen = () => { (root.querySelector('hw-navigation-drawer dialog') as HTMLDialogElement).showModal(); };
  expect(drawer()).toBe(true);
  // A listener that only cancels the click: nothing navigated, so the drawer stays open.
  const cancel = (event: Event) => event.preventDefault(); document.addEventListener('click', cancel);
  root.querySelector<HTMLAnchorElement>('a[href="/home"]')!.click(); await dispatched(); expect(drawer()).toBe(true);
  document.removeEventListener('click', cancel);
  // The router took it: the default is prevented although the navigation went ahead, and the drawer closes.
  const navigate = vi.fn(); const links = bindLinkNavigation(document, { navigate: ({ path }) => { navigate(path); } });
  const routed = new MouseEvent('click', { bubbles: true, cancelable: true }); root.querySelector<HTMLAnchorElement>('a[href="/guides/install"]')!.dispatchEvent(routed); await Promise.resolve(); expect(drawer()).toBe(true); await dispatched();
  expect(navigate.mock.calls).toEqual([['/guides/install']]); expect(routed.defaultPrevented).toBe(true); expect(drawer()).toBe(false);
  // A synthetic link.click() is the same activation.
  reopen(); expect(drawer()).toBe(true);
  root.querySelector<HTMLAnchorElement>('a[href="/home"]')!.click(); await dispatched(); expect(navigate.mock.calls).toEqual([['/guides/install'], ['/home']]); expect(drawer()).toBe(false);
  // Ctrl-click opens a new tab: it is not handed to the router and the drawer stays as it is.
  reopen(); expect(drawer()).toBe(true);
  const seen: boolean[] = []; const last = (event: Event) => { seen.push(event.defaultPrevented); event.preventDefault(); }; window.addEventListener('click', last);
  root.querySelector<HTMLAnchorElement>('a[href="/home"]')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true })); await dispatched();
  window.removeEventListener('click', last); links.destroy();
  expect(seen).toEqual([false]); expect(navigate).toHaveBeenCalledTimes(2); expect(drawer()).toBe(true);
});
