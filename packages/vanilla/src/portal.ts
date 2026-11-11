import { createCleanup, hasText, isDisabled, requireText } from '@hawiyah/core';
import { emit, ensureId, eventElement, named, remember, required, text, writeText } from './dom.js';
import { createSkipLink } from './skip-link.js';

export interface PortalHeaderOptions {
  onOpenChange?: (open: boolean) => void;
  /** Name of the menu toggle (data-hw-menu-label), used when the toggle has no aria-label and no text. Required. */
  menuLabel?: string;
  /** Name of the primary nav landmark (data-hw-navigation-label), used when the nav has no aria-label or aria-labelledby. Required. */
  navigationLabel?: string;
  /** Accessible name of `.hw-portal-brand` (data-hw-brand-label), for artwork without visible text. Optional. */
  brandLabel?: string;
}
export interface PortalHeaderController { readonly open: boolean; show(): void; close(restoreFocus?: boolean): void; destroy(): void }
/** Enhances a disclosure navigation. CSS keeps the links visible on desktop. */
export function createPortalHeader(root: HTMLElement, options: PortalHeaderOptions = {}): PortalHeaderController {
  const trigger = required<HTMLButtonElement>(root, '[data-hw-portal-toggle]');
  const navigation = required<HTMLElement>(root, '[data-hw-portal-navigation]');
  const scope = createCleanup();
  remember(scope, trigger, ['aria-expanded', 'aria-controls']);
  remember(scope, navigation, ['data-open', 'aria-label']); remember(scope, trigger, ['aria-label']);
  if (!named(trigger) && !hasText(trigger.textContent)) writeText(trigger, 'aria-label', 'PortalHeader', 'menuLabel', text(root, 'menuLabel', options.menuLabel));
  if (!named(navigation)) writeText(navigation, 'aria-label', 'PortalHeader', 'navigationLabel', text(root, 'navigationLabel', options.navigationLabel));
  const brand = [...root.querySelectorAll<HTMLElement>('.hw-portal-brand')].find(node => node.closest('[data-hw="portal-header"]') === root || !node.closest('[data-hw="portal-header"]'));
  if (brand) {
    remember(scope, brand, ['aria-label']);
    const brandLabel = text(root, 'brandLabel', options.brandLabel);
    if (hasText(brandLabel) && (options.brandLabel !== undefined || !named(brand))) brand.setAttribute('aria-label', brandLabel!);
    // An artwork-only brand needs a name; checked once mounted in a browser, never during server rendering.
    const alternative = [...brand.querySelectorAll('img[alt], [role="img"][aria-label]')].some(node => hasText(node.getAttribute('alt') ?? node.getAttribute('aria-label')));
    if (root.ownerDocument.defaultView && !hasText(brand.textContent) && !named(brand) && !alternative) requireText('PortalHeader', 'brandLabel', undefined, 'the brand has no text');
  }
  for (const link of root.querySelectorAll<HTMLAnchorElement>('a.hw-skip-link')) { const skip = createSkipLink(link); scope.add(() => skip.destroy()); }
  trigger.setAttribute('aria-controls', ensureId(scope, navigation, 'portal-navigation'));
  const branches = [...navigation.querySelectorAll<HTMLDetailsElement>('details[data-hw-portal-branch]')]
    .filter(branch => branch.closest('[data-hw-portal-navigation]') === navigation);
  for (const branch of branches) remember(scope, branch, ['open']);
  const closeBranchesOutside = (inside: Node | null = null) => {
    for (const branch of branches) if (branch.open && !branch.contains(inside)) branch.open = false;
  };
  let open = false;
  const render = () => { trigger.setAttribute('aria-expanded', String(open)); navigation.dataset.open = String(open); };
  const change = (next: boolean, restore = false) => {
    if (scope.destroyed || open === next) return;
    open = next; render(); if (restore) trigger.focus();
    emit(root, { open }); options.onOpenChange?.(open);
  };
  const close = (restore = false) => {
    if (scope.destroyed) return;
    closeBranchesOutside();
    change(false, restore);
  };
  scope.listen(trigger, 'click', () => {
    if (isDisabled(trigger)) return;
    closeBranchesOutside();
    change(!open);
  });
  scope.listen(navigation, 'click', event => {
    const target = eventElement(event);
    if (target?.closest('[data-hw-portal-navigation]') !== navigation) return;
    if (target.closest('a[href]')) close();
    else if (target.closest('summary')) closeBranchesOutside(target);
  });
  scope.listen(root, 'keydown', event => {
    if ((event as KeyboardEvent).key !== 'Escape' || event.defaultPrevented) return;
    const target = eventElement(event);
    const owner = target?.closest<HTMLDetailsElement>('details[data-hw-portal-branch][open]');
    const branch = owner && branches.includes(owner) ? owner : branches.find(item => item.open);
    if (branch) {
      event.preventDefault();
      event.stopPropagation();
      closeBranchesOutside(branch.parentElement);
      branch.querySelector<HTMLElement>(':scope > summary')?.focus();
    } else if (open) {
      event.preventDefault();
      event.stopPropagation();
      close(true);
    }
  });
  const leave = (next: Node | null) => {
    if (scope.destroyed) return;
    if (!root.contains(next)) close();
    else closeBranchesOutside(next);
  };
  scope.listen(root.ownerDocument, 'pointerdown', event => leave(event.target as Node | null));
  scope.listen(root, 'focusout', event => {
    const next = (event as FocusEvent).relatedTarget as Node | null;
    if (next) leave(next);
    else queueMicrotask(() => leave(root.ownerDocument.activeElement));
  });
  render();
  return { get open() { return open; }, show() { if (!isDisabled(trigger)) change(true); }, close, destroy() { scope.destroy(); } };
}
