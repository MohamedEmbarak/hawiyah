import { afterEach, expect, it } from 'vitest';
import { createNavigationDrawer } from '../src/navigation-drawer.js';

afterEach(() => document.body.replaceChildren());
it('enhances native navigation, guards disabled entries, respects prevention and restores attributes/focus', async () => {
  const trigger = document.createElement('button'); trigger.textContent = 'Open'; document.body.append(trigger);
  const dialog = document.createElement('dialog');
  dialog.innerHTML = '<h2>القائمة</h2><nav class="nq-navigation-drawer-nav"><ul><li><details><summary>الخدمات</summary><ul><li><a href="#service" aria-current="page">طلب خدمة</a></li></ul></details></li><li><a href="#disabled" aria-disabled="true">Disabled</a></li><li><details aria-disabled="true"><summary>Disabled group</summary><a href="#child">Child</a></details></li></ul></nav>';
  document.body.append(dialog); const before = dialog.cloneNode(true);
  dialog.showModal = () => { dialog.open = true; };
  dialog.close = () => { dialog.open = false; dialog.dispatchEvent(new Event('close')); };
  let prevent = false;
  dialog.addEventListener('click', event => { if (prevent) event.preventDefault(); });
  const controller = createNavigationDrawer(dialog);
  trigger.focus(); controller.show(trigger);
  expect(dialog.dataset.side).toBe('start'); expect(dialog.querySelector('nav')!.getAttribute('aria-label')).toBe('التنقل الرئيسي');
  const disabled = dialog.querySelector<HTMLAnchorElement>('a[aria-disabled]')!;
  expect(disabled.hasAttribute('href')).toBe(false); expect(disabled.tabIndex).toBe(-1);
  disabled.click(); await Promise.resolve(); expect(dialog.open).toBe(true);
  const group = dialog.querySelector<HTMLElement>('details[aria-disabled]')!;
  expect(group.querySelector('summary')!.hasAttribute('inert')).toBe(true);
  group.querySelector('summary')!.click(); expect(group.hasAttribute('open')).toBe(false);
  const summary = dialog.querySelector('summary')!; summary.click(); expect(summary.parentElement!.hasAttribute('open')).toBe(true);
  const link = dialog.querySelector<HTMLAnchorElement>('a[href="#service"]')!;
  prevent = true; link.click(); await Promise.resolve(); expect(dialog.open).toBe(true);
  prevent = false; link.focus(); expect(document.activeElement).toBe(link);
  link.click(); await Promise.resolve(); expect(dialog.open).toBe(false); expect(document.activeElement).toBe(trigger);
  summary.parentElement!.removeAttribute('open'); controller.destroy();
  expect(dialog.isEqualNode(before)).toBe(true);
});
it('does not close after destruction while a route activation is queued', async () => {
  const dialog = document.createElement('dialog'); dialog.innerHTML = '<nav class="nq-navigation-drawer-nav"><a href="#service">Service</a></nav>'; document.body.append(dialog);
  dialog.open = true;
  let closed = 0; dialog.close = () => { closed++; dialog.open = false; };
  const controller = createNavigationDrawer(dialog); dialog.querySelector('a')!.click(); controller.destroy();
  await Promise.resolve(); expect(closed).toBe(0);
});
