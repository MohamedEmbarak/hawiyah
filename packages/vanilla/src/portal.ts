import { createCleanup, isDisabled } from '@nasaq/core';
import { emit, ensureId, eventElement, remember, required } from './dom.js';

export interface PortalHeaderOptions { onOpenChange?: (open: boolean) => void }
export interface PortalHeaderController { readonly open: boolean; show(): void; close(restoreFocus?: boolean): void; destroy(): void }
/** Enhances a disclosure navigation. CSS keeps the links visible on desktop. */
export function createPortalHeader(root: HTMLElement, options: PortalHeaderOptions = {}): PortalHeaderController {
  const trigger = required<HTMLButtonElement>(root, '[data-nq-portal-toggle]');
  const navigation = required<HTMLElement>(root, '[data-nq-portal-navigation]');
  const scope = createCleanup();
  remember(scope, trigger, ['aria-expanded', 'aria-controls']);
  remember(scope, navigation, ['data-open']);
  trigger.setAttribute('aria-controls', ensureId(scope, navigation, 'portal-navigation'));
  let open = false;
  const render = () => { trigger.setAttribute('aria-expanded', String(open)); navigation.dataset.open = String(open); };
  const change = (next: boolean, restore = false) => {
    if (scope.destroyed || open === next) return;
    open = next; render(); if (restore) trigger.focus();
    emit(root, { open }); options.onOpenChange?.(open);
  };
  const close = (restore = false) => change(false, restore);
  scope.listen(trigger, 'click', () => { if (!isDisabled(trigger)) change(!open); });
  scope.listen(navigation, 'click', event => { if (eventElement(event)?.closest('a[href]')) close(); });
  scope.listen(root, 'keydown', event => { if ((event as KeyboardEvent).key === 'Escape' && open) { event.preventDefault(); close(true); } });
  scope.listen(root.ownerDocument, 'pointerdown', event => { if (!root.contains(event.target as Node | null)) close(); });
  scope.listen(root, 'focusout', event => { const next = (event as FocusEvent).relatedTarget as Node | null; if (next && !root.contains(next)) close(); });
  render();
  return { get open() { return open; }, show() { if (!isDisabled(trigger)) change(true); }, close, destroy() { scope.destroy(); } };
}
