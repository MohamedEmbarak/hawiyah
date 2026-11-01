import { afterEach, expect, it } from 'vitest';
import { createPortalHeader, enhance } from '../src/index.js';

afterEach(() => { document.body.innerHTML = ''; });
function markup() {
  document.body.innerHTML = `<header class="nq-portal-header" data-nq="portal-header"><button type="button" data-nq-portal-toggle>القائمة</button><nav data-nq-portal-navigation><a href="#main">الخدمات</a></nav></header><main id="main" tabindex="-1">المحتوى</main><button id="outside">خارج</button>`;
  return document.querySelector('header')!;
}
it('discloses navigation, returns focus on Escape and leaves Tab native', () => {
  const root = markup(); const controller = createPortalHeader(root);
  const trigger = root.querySelector('button')!; const nav = root.querySelector('nav')!; const link = root.querySelector('a')!;
  expect(trigger.getAttribute('aria-controls')).toBe(nav.id);
  trigger.click(); expect(controller.open).toBe(true);
  link.focus();
  const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
  link.dispatchEvent(tab); expect(tab.defaultPrevented).toBe(false);
  link.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
  expect(controller.open).toBe(false); expect(document.activeElement).toBe(trigger);
  trigger.click(); link.click(); expect(controller.open).toBe(false);
  trigger.click(); document.querySelector('#outside')!.dispatchEvent(new Event('pointerdown', { bubbles: true })); expect(controller.open).toBe(false);
  trigger.click(); document.querySelector<HTMLButtonElement>('#outside')!.focus(); expect(controller.open).toBe(false);
  controller.destroy(); expect(nav.hasAttribute('data-open')).toBe(false); expect(trigger.hasAttribute('aria-expanded')).toBe(false);
  trigger.click(); expect(nav.hasAttribute('data-open')).toBe(false);
});
it('participates in enhancement cleanup and leaves no collapsed navigation without JS', () => {
  const root = markup(); const release = enhance(root);
  expect(root.querySelector('nav')!.dataset.open).toBe('false'); release();
  expect(root.querySelector('nav')!.hasAttribute('data-open')).toBe(false);
});
