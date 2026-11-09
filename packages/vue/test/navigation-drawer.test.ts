import { afterEach, beforeEach, expect, it } from 'vitest';
import { createApp, h, nextTick } from 'vue';
import type { App } from 'vue';
import { NavigationDrawer } from '../src/navigation-drawer.js';

const apps: App[] = [];
beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value() { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value() { this.open = false; this.dispatchEvent(new Event('close')); } });
});
afterEach(() => { apps.splice(0).forEach(app => app.unmount()); document.body.replaceChildren(); });
it('composes native drawer/groups with disabled entries, route cancellation and focus return', async () => {
  const container = document.createElement('div'); document.body.append(container);
  let prevent = false;
  const app = createApp({ render: () => h(NavigationDrawer, { title: 'القائمة', items: [
    { id: 'group', label: 'الخدمات', children: [{ id: 'route', label: 'طلب خدمة', href: '#service', current: true, icon: 'home-06' }] },
    { id: 'disabled', label: 'غير متاح', href: '#blocked', disabled: true },
    { id: 'disabled-group', label: 'Disabled group', disabled: true, children: [{ id: 'hidden', label: 'Hidden', href: '#hidden' }] },
  ], onClick: (event: MouseEvent) => { if (prevent) event.preventDefault(); } }, {
    trigger: ({ open }: { open: () => void }) => h('button', { onClick: open }, 'Open'),
    user: () => h('p', {}, 'حساب المستخدم'), footer: () => h('p', {}, 'Footer'),
  }) }); apps.push(app); app.mount(container);
  const trigger = container.querySelector('button')!; trigger.focus(); trigger.click(); await nextTick();
  const dialog = container.querySelector('dialog')!;
  expect(dialog.open).toBe(true); expect(dialog.classList.contains('hw-navigation-drawer')).toBe(true);
  expect(dialog.querySelector('nav')!.getAttribute('aria-label')).toBe('التنقل الرئيسي');
  expect(dialog.querySelector('a[href="#blocked"], a[href="#hidden"]')).toBeNull();
  const summary = dialog.querySelector('summary')!; summary.focus(); summary.click(); await nextTick();
  expect(summary.parentElement!.hasAttribute('open')).toBe(true); expect(dialog.open).toBe(true);
  const link = dialog.querySelector<HTMLAnchorElement>('a')!; link.focus();
  prevent = true; link.click(); await nextTick(); expect(dialog.open).toBe(true);
  prevent = false; link.click(); await nextTick(); await nextTick();
  expect(dialog.open).toBe(false); expect(document.activeElement).toBe(trigger);
});
