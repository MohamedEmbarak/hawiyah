import { createCleanup, getNextEnabledIndex, isDisabled, normalizeSearch, restoreFocus, prepareToastDismissFocus } from '@nasaq/core';
import { createDialog, type DialogController, type DialogOptions } from './dialog.js';
import { emit, ensureId, eventElement, remember, required, translated } from './dom.js';

export interface PopoverOptions { onOpenChange?: (open: boolean) => void; focusOnOpen?: boolean }
export interface PopoverController { readonly open: boolean; show(): void; close(restore?: boolean): void; destroy(): void }
export function createPopover(root: HTMLElement, options: PopoverOptions = {}): PopoverController {
  const trigger = required<HTMLElement>(root, '[data-nq-trigger]');
  const panel = required<HTMLElement>(root, '[data-nq-panel]');
  const scope = createCleanup();
  remember(scope, trigger, ['aria-expanded', 'aria-controls']); remember(scope, panel, ['hidden', 'role', 'tabindex']);
  trigger.setAttribute('aria-controls', ensureId(scope, panel, 'popover'));
  if (!panel.hasAttribute('role')) panel.setAttribute('role', 'region');
  let open = !panel.hidden;
  const render = () => { panel.hidden = !open; trigger.setAttribute('aria-expanded', String(open)); };
  const close = (restore = false) => { if (scope.destroyed || !open) return; open = false; render(); if (restore) restoreFocus(trigger); emit(root, { open }); options.onOpenChange?.(open); };
  const show = () => {
    if (scope.destroyed || open || isDisabled(trigger)) return; open = true; render();
    if (options.focusOnOpen) { const focus = panel.querySelector<HTMLElement>('input:not(:disabled), button:not(:disabled), a[href], select:not(:disabled), textarea:not(:disabled), [tabindex="0"]'); if (focus) focus.focus(); else { panel.tabIndex = -1; panel.focus(); } }
    emit(root, { open }); options.onOpenChange?.(open);
  };
  scope.listen(trigger, 'click', event => { if (isDisabled(trigger)) return; event.preventDefault(); if (open) close(); else show(); });
  scope.listen(root, 'click', event => { if (eventElement(event)?.closest('[data-nq-close]')) { event.preventDefault(); close(true); } });
  scope.listen(root, 'keydown', event => { if ((event as KeyboardEvent).key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); close(true); } });
  scope.listen(root.ownerDocument, 'pointerdown', event => { if (!root.contains(event.target as Node | null)) close(); });
  scope.listen(root, 'focusout', event => { const next = (event as FocusEvent).relatedTarget as Node | null; if (next && !root.contains(next)) close(); });
  render();
  return { get open() { return open; }, show, close, destroy() { if (scope.destroyed) return; if (open && panel.contains(root.ownerDocument.activeElement)) restoreFocus(trigger); scope.destroy(); } };
}

export interface MenuOptions { onSelect?: (value: string) => void }
export function createMenu(root: HTMLElement, options: MenuOptions = {}): PopoverController {
  const trigger = required<HTMLElement>(root, '[data-nq-trigger]'); const panel = required<HTMLElement>(root, '[data-nq-panel]');
  const items = [...panel.querySelectorAll<HTMLElement>('[role="menuitem"]')]; const scope = createCleanup();
  remember(scope, trigger, ['aria-haspopup']); remember(scope, panel, ['role']); trigger.setAttribute('aria-haspopup', 'menu'); panel.setAttribute('role', 'menu');
  items.forEach(item => { remember(scope, item, ['tabindex']); item.tabIndex = -1; });
  const disclosure = createPopover(root);
  const focus = (index: number) => { if (index < 0) return; items.forEach((item, position) => { item.tabIndex = position === index ? 0 : -1; }); items[index]!.focus(); };
  const navigate = (current: number, key: string) => focus(getNextEnabledIndex(current, key, items.map(item => ({ disabled: isDisabled(item) })), 'ltr', 'vertical'));
  let query = ''; let timer: ReturnType<typeof setTimeout> | undefined;
  scope.add(() => { if (timer !== undefined) clearTimeout(timer); });
  scope.listen(trigger, 'keydown', event => { const key = event as KeyboardEvent; if (isDisabled(trigger) || key.altKey || key.ctrlKey || key.metaKey) return; if (['ArrowDown', 'ArrowUp'].includes(key.key)) { event.preventDefault(); disclosure.show(); navigate(-1, key.key); } });
  scope.listen(trigger, 'click', () => { if (disclosure.open) navigate(-1, 'ArrowDown'); });
  scope.listen(panel, 'keydown', event => {
    const key = event as KeyboardEvent; if (key.altKey || key.ctrlKey || key.metaKey || key.isComposing) return;
    const current = items.indexOf(eventElement(event)?.closest<HTMLElement>('[role="menuitem"]') as HTMLElement);
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key.key)) { event.preventDefault(); navigate(current, key.key); }
    else if ((key.key === 'Enter' || key.key === ' ') && current >= 0 && !isDisabled(items[current]!)) { event.preventDefault(); items[current]!.click(); }
    else if (key.key === 'Tab') disclosure.close();
    else if (key.key.length === 1 && key.key !== ' ') {
      query += normalizeSearch(key.key); if (timer !== undefined) clearTimeout(timer); timer = setTimeout(() => { query = ''; }, 500);
      for (let offset = 1; offset <= items.length; offset++) { const index = (current + offset + items.length) % items.length; if (!isDisabled(items[index]!) && normalizeSearch(items[index]!.textContent || '').startsWith(query)) { event.preventDefault(); focus(index); break; } }
    }
  });
  scope.listen(panel, 'click', event => { const item = eventElement(event)?.closest<HTMLElement>('[role="menuitem"]'); if (!item || !items.includes(item)) return; if (isDisabled(item)) { event.preventDefault(); return; } const value = item.dataset.nqValue ?? item.textContent?.trim() ?? ''; disclosure.close(true); emit(root, { value }); options.onSelect?.(value); });
  return { get open() { return disclosure.open; }, show() { disclosure.show(); navigate(-1, 'ArrowDown'); }, close: disclosure.close, destroy() { disclosure.destroy(); scope.destroy(); } };
}

export function createDrawer(dialog: HTMLDialogElement, options: DialogOptions = {}): DialogController { return createDialog(dialog, options); }

export interface ToastRegionOptions {
  variant?: 'default' | 'inline' | 'banner';
  position?: 'inline' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
  label?: string;
  getDismissLabel?: (toast: HTMLElement) => string;
  onDismiss?: (id: string) => void;
}
export function createToastRegion(root: HTMLElement, options: ToastRegionOptions = {}): { dismiss(target: string | HTMLElement): void; destroy(): void } {
  const scope = createCleanup();
  remember(scope, root, ['role', 'aria-live', 'aria-label', 'tabindex', 'data-variant', 'data-position']);
  const originalRole = root.getAttribute('role');
  const originalLive = root.getAttribute('aria-live');
  const own = (element: HTMLElement) => {
    const owner = element.closest('.nq-toast-region, [data-nq="toast-region"]');
    return root.contains(element) && (!owner || owner === root || !root.contains(owner));
  };
  if (options.variant) root.dataset.variant = options.variant;
  if (options.position) root.dataset.position = options.position;
  if (options.label || (!root.hasAttribute('aria-label') && !root.hasAttribute('aria-labelledby'))) root.setAttribute('aria-label', options.label ?? translated(root, 'Notifications', 'الإشعارات'));
  if (!root.hasAttribute('tabindex')) root.tabIndex = -1;

  const grouped = root.querySelectorAll<HTMLElement>(':scope > :is([data-nq-live="polite"], [data-nq-live="assertive"], [role="status"], [role="alert"], [aria-live="polite"], [aria-live="assertive"]):not([data-nq-toast], .nq-toast)');
  for (const bucket of grouped) {
    const urgency = bucket.dataset.nqLive ?? bucket.getAttribute('aria-live');
    const urgent = urgency ? urgency === 'assertive' : bucket.getAttribute('role') === 'alert';
    remember(scope, bucket, ['role', 'aria-live', 'aria-relevant']);
    bucket.setAttribute('role', urgent ? 'alert' : 'status');
    bucket.setAttribute('aria-live', urgent ? 'assertive' : 'polite');
    if (!bucket.hasAttribute('aria-relevant')) bucket.setAttribute('aria-relevant', 'additions text');
  }
  if (grouped.length) {
    if (!originalRole || originalRole === 'alert' || originalRole === 'status') root.setAttribute('role', 'region');
    if (originalLive !== 'off') root.removeAttribute('aria-live');
  } else {
    if (!originalRole) root.setAttribute('role', 'status');
    if (!originalLive) root.setAttribute('aria-live', originalRole === 'alert' ? 'assertive' : 'polite');
  }

  const protectedControls = new Map<HTMLElement, string | null>();
  const generatedLabels = new Map<HTMLElement, string>();
  const dismissedNotices = new Set<HTMLElement>();
  const restoreControl = (button: HTMLElement) => {
    const hidden = protectedControls.get(button);
    if (hidden === null) button.removeAttribute('hidden');
    else if (hidden !== undefined) button.setAttribute('hidden', hidden);
    protectedControls.delete(button);
  };
  const restoreLabel = (button: HTMLElement) => {
    if (button.getAttribute('aria-label') === generatedLabels.get(button)) button.removeAttribute('aria-label');
    generatedLabels.delete(button);
  };
  const sync = () => {
    for (const button of protectedControls.keys()) if (!own(button)) restoreControl(button);
    for (const button of generatedLabels.keys()) if (!own(button)) restoreLabel(button);
    for (const notice of dismissedNotices) if (!own(notice)) { notice.hidden = false; dismissedNotices.delete(notice); }
    for (const button of root.querySelectorAll<HTMLElement>('[data-nq-dismiss]')) {
      const toast = button.closest<HTMLElement>('[data-nq-toast]');
      if (!toast || !own(toast) || !own(button)) continue;
      if (toast.dataset.nqDismissible === 'false') {
        if (!protectedControls.has(button)) protectedControls.set(button, button.getAttribute('hidden'));
        button.hidden = true;
      } else if (protectedControls.has(button)) restoreControl(button);
      const generated = generatedLabels.get(button);
      const current = button.getAttribute('aria-label');
      if (current?.trim() && current !== generated) { generatedLabels.delete(button); continue; }
      if (button.hasAttribute('aria-labelledby') || (!options.getDismissLabel && button.textContent?.replace(/[×x\s]/gi, ''))) {
        if (generated !== undefined) restoreLabel(button);
        continue;
      }
      const heading = toast.querySelector('[data-nq-toast-title], strong, h2, h3, h4');
      const title = (heading ?? toast.querySelector('.nq-toast-content, p'))?.textContent?.trim();
      const prefix = translated(root, 'Dismiss notification', 'إغلاق الإشعار');
      const label = options.getDismissLabel?.(toast) ?? (title ? `${prefix}: ${title}` : prefix);
      button.setAttribute('aria-label', label);
      generatedLabels.set(button, label);
    }
  };
  sync();
  const Observer = root.ownerDocument.defaultView?.MutationObserver;
  if (Observer) {
    const observer = new Observer(sync);
    observer.observe(root, {childList: true, subtree: true, attributes: true, attributeFilter: ['data-nq-dismissible']});
    scope.add(() => observer.disconnect());
  }
  scope.add(() => {
    for (const button of protectedControls.keys()) restoreControl(button);
    for (const button of generatedLabels.keys()) restoreLabel(button);
    for (const notice of dismissedNotices) notice.hidden = false;
    dismissedNotices.clear();
  });
  const dismiss = (target: string | HTMLElement) => {
    if (scope.destroyed) return;
    const toast = typeof target === 'string' ? [...root.querySelectorAll<HTMLElement>('[data-nq-toast]')].find(node => own(node) && (node.id === target || node.dataset.nqToast === target)) : target;
    if (!toast || !own(toast) || !toast.hasAttribute('data-nq-toast') || toast.hidden || toast.dataset.nqDismissible === 'false') return;
    dismissedNotices.add(toast);
    const recover = prepareToastDismissFocus(root, toast);
    toast.hidden = true;
    const id = toast.id || toast.dataset.nqToast || '';
    try { emit(root, {dismissed: id}); options.onDismiss?.(id); } finally { recover(); }
  };
  scope.listen(root, 'click', event => {
    const button = eventElement(event)?.closest<HTMLElement>('[data-nq-dismiss]');
    if (!button || !own(button) || isDisabled(button)) return;
    const toast = button.closest<HTMLElement>('[data-nq-toast]');
    if (toast && own(toast)) { event.preventDefault(); dismiss(toast); }
  });
  return {dismiss, destroy: () => scope.destroy()};
}
