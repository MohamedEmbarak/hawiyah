// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createPortalHeader } from '../src/index.js';

// Vanilla fixtures of the cross-adapter PortalHeader cases: the documented authored markup and its controller.
afterEach(() => { document.body.innerHTML = ''; vi.restoreAllMocks(); });
function header(brand = '<a class="hw-portal-brand" href="/">هوية</a>') {
  document.body.innerHTML = `<header class="hw-portal-header" data-hw="portal-header">${brand}<button type="button" class="hw-portal-menu-toggle" data-hw-portal-toggle aria-label="Menu"></button><nav data-hw-portal-navigation aria-label="Main"><details class="hw-portal-branch" data-hw-portal-branch><summary>Services</summary><div class="hw-portal-branch-panel"><a href="#licenses">Licenses</a></div></details><details class="hw-portal-branch" data-hw-portal-branch><summary>Resources</summary><div class="hw-portal-branch-panel"><a href="#help">Help</a></div></details></nav><div class="hw-portal-header-actions"><a href="/en/" lang="en">English</a></div></header><button type="button" id="outside">Outside</button>`;
  return document.querySelector<HTMLElement>('header')!;
}
const press = (target: Element, type = 'pointerdown') => target.dispatchEvent(new Event(type, { bubbles: true }));
const leave = (from: Element, to: Element | null) => from.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: to }));

describe('portal header', () => {
  it('[PORTAL-01] a press on another branch heading closes nothing until its click, which opens it and closes the first', () => {
    const root = header(); const controller = createPortalHeader(root); const [first, second] = [...root.querySelectorAll('details')];
    first!.querySelector('summary')!.click(); expect(first!.open).toBe(true);
    const heading = second!.querySelector('summary')!; press(heading); leave(first!.querySelector('a')!, heading);
    expect(first!.open).toBe(true);
    heading.click(); expect(second!.open).toBe(true); expect(first!.open).toBe(false); controller.destroy();
  });
  it('[PORTAL-02] without a press, focus moving to another heading closes the open branch', () => {
    const root = header(); const controller = createPortalHeader(root); const [first, second] = [...root.querySelectorAll('details')];
    first!.querySelector('summary')!.click(); leave(first!.querySelector('a')!, second!.querySelector('summary')); expect(first!.open).toBe(false); controller.destroy();
  });
  it('[PORTAL-03] pointercancel or a keydown after the press clears it', () => {
    for (const clear of ['pointercancel', 'keydown']) {
      const root = header(); const controller = createPortalHeader(root); const [first, second] = [...root.querySelectorAll('details')];
      first!.querySelector('summary')!.click(); const heading = second!.querySelector('summary')!; press(heading);
      if (clear === 'pointercancel') press(heading, 'pointercancel'); else first!.querySelector('a')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
      leave(first!.querySelector('a')!, heading); expect(first!.open).toBe(false); controller.destroy();
    }
  });
  it('[STATE-06] [PORTAL-05] every closing path notifies false once through onOpenChange and hw:change; Escape focuses the toggle', () => {
    const root = header(); const changed = vi.fn(); const details: unknown[] = []; root.addEventListener('hw:change', event => details.push((event as CustomEvent).detail));
    const controller = createPortalHeader(root, { onOpenChange: changed }); const toggle = root.querySelector<HTMLElement>('[data-hw-portal-toggle]')!; const link = root.querySelector<HTMLAnchorElement>('nav a')!;
    const paths: Array<() => void> = [
      () => { link.focus(); link.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })); expect(document.activeElement).toBe(toggle); },
      () => press(document.getElementById('outside')!),
      () => { link.focus(); document.getElementById('outside')!.focus(); },
      () => { link.addEventListener('click', event => event.preventDefault(), { once: true }); link.click(); },
    ];
    for (const path of paths) { toggle.click(); changed.mockClear(); details.length = 0; path(); expect(changed.mock.calls).toEqual([[false]]); expect(details).toEqual([{ open: false }]); }
    controller.destroy();
  });
  it('[PORTAL-08] a brand that is not a link is an image named by brandLabel; without it no role; a home link gets no role', () => {
    let root = header('<div class="hw-portal-brand">هوية</div>'); let controller = createPortalHeader(root, { brandLabel: 'Hawiyah home' }); let brand = root.querySelector('.hw-portal-brand')!;
    expect([brand.localName, brand.getAttribute('role'), brand.getAttribute('aria-label')]).toEqual(['div', 'img', 'Hawiyah home']); controller.destroy();
    root = header('<div class="hw-portal-brand">هوية</div>'); controller = createPortalHeader(root); brand = root.querySelector('.hw-portal-brand')!;
    expect([brand.hasAttribute('role'), brand.hasAttribute('aria-label')]).toEqual([false, false]); controller.destroy();
    root = header(); controller = createPortalHeader(root, { brandLabel: 'Hawiyah home' }); brand = root.querySelector('.hw-portal-brand')!;
    expect([brand.localName, brand.hasAttribute('href'), brand.hasAttribute('role')]).toEqual(['a', true, false]); controller.destroy();
  });
  it('[PORTAL-06] brand, menu toggle, navigation and actions are direct children of the header in the documented order', () => {
    const root = header(); const controller = createPortalHeader(root);
    expect([...root.children].map(node => node.classList[0] ?? node.localName)).toEqual(['hw-portal-brand', 'hw-portal-menu-toggle', 'nav', 'hw-portal-header-actions']);
    expect(root.querySelector('.hw-portal-header-main')).toBeNull(); controller.destroy();
  });
});
