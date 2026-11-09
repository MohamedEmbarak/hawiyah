import { createCleanup, isDisabled } from '@hawiyah/core';
import { ensureId, remember, required } from './dom.js';

export interface TooltipOptions { hideDelay?: number; placement?: 'top' | 'bottom' | 'start' | 'end'; align?: 'start' | 'center' | 'end' }
export interface TooltipController { show(): void; hide(): void; destroy(): void }

/** Descriptive text only; use a dialog/popover for interactive content. */
export function createTooltip(root: HTMLElement, options: TooltipOptions = {}): TooltipController {
  const trigger = required<HTMLElement>(root, '[data-hw-tooltip-trigger]');
  const tooltip = required<HTMLElement>(root, '[role="tooltip"]');
  const scope = createCleanup();
  remember(scope, trigger, ['aria-describedby']);
  remember(scope, tooltip, ['hidden', 'data-placement', 'data-align']);
  if (options.placement) tooltip.dataset.placement = options.placement;
  if (options.align) tooltip.dataset.align = options.align;
  const id = ensureId(scope, tooltip, 'tooltip');
  const descriptions = new Set((trigger.getAttribute('aria-describedby') ?? '').split(/\s+/u).filter(Boolean));
  descriptions.add(id);
  trigger.setAttribute('aria-describedby', [...descriptions].join(' '));
  let overTrigger = false;
  let overTooltip = false;
  let focused = false;
  let dismissed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const clearTimer = () => { if (timer !== undefined) { clearTimeout(timer); timer = undefined; } };
  scope.add(clearTimer);
  const show = () => {
    if (scope.destroyed || isDisabled(trigger) || dismissed) return;
    clearTimer(); tooltip.hidden = false;
  };
  const hide = () => { if (!scope.destroyed) { clearTimer(); tooltip.hidden = true; } };
  const scheduleHide = () => {
    clearTimer();
    timer = setTimeout(() => { if (!overTrigger && !overTooltip && !focused) hide(); }, options.hideDelay ?? 80);
  };
  scope.listen(trigger, 'pointerenter', () => { overTrigger = true; dismissed = false; show(); });
  scope.listen(trigger, 'pointerleave', () => { overTrigger = false; scheduleHide(); });
  scope.listen(tooltip, 'pointerenter', () => { overTooltip = true; show(); });
  scope.listen(tooltip, 'pointerleave', () => { overTooltip = false; scheduleHide(); });
  scope.listen(trigger, 'focus', () => { focused = true; dismissed = false; show(); });
  scope.listen(trigger, 'blur', () => { focused = false; if (!overTrigger && !overTooltip) hide(); });
  scope.listen(root.ownerDocument, 'keydown', event => {
    if ((event as KeyboardEvent).key === 'Escape' && !tooltip.hidden) {
      event.preventDefault(); event.stopPropagation(); dismissed = true; hide();
    }
  });
  scope.listen(root.ownerDocument, 'pointerdown', event => {
    if (!root.contains(event.target as Node | null)) {
      focused = false; overTrigger = false; overTooltip = false; dismissed = true; hide();
    }
  });
  tooltip.hidden = true;
  return { show, hide, destroy: () => scope.destroy() };
}
