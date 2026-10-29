import { createCleanup, getDirection, getNextEnabledIndex, isDisabled } from '@nasaq/core';
import { emit, ensureId, eventElement, remember, required } from './dom.js';

export interface TabsOptions {
  value?: string;
  activationMode?: 'automatic' | 'manual';
  onValueChange?: (value: string) => void;
}

export interface TabsController {
  readonly value: string;
  select(value: string): void;
  destroy(): void;
}

export function createTabs(root: HTMLElement, options: TabsOptions = {}): TabsController {
  const list = required<HTMLElement>(root, '[role="tablist"]');
  const tabs = [...list.querySelectorAll<HTMLElement>('[role="tab"]')]
    .filter(tab => tab.closest('[role="tablist"]') === list);
  if (!tabs.length) throw new Error('Nasaq: tabs requires at least one tab.');
  const panels = tabs.map(tab => {
    const id = tab.getAttribute('aria-controls');
    const panel = id ? root.ownerDocument.getElementById(id) : null;
    if (!panel || !root.contains(panel)) throw new Error('Nasaq: each tab requires aria-controls pointing to a panel inside its root.');
    return panel;
  });
  const scope = createCleanup();
  const values = tabs.map((tab, index) => tab.dataset.nqValue ?? ensureId(scope, tab, `tab-${index}`));
  if (new Set(values).size !== values.length) { scope.destroy(); throw new Error('Nasaq: tab values must be unique.'); }
  const manual = (options.activationMode ?? root.dataset.nqActivation) === 'manual';
  tabs.forEach((tab, index) => {
    remember(scope, tab, ['aria-selected', 'tabindex']);
    const panel = panels[index]!;
    remember(scope, panel, ['hidden', 'role', 'aria-labelledby', 'tabindex']);
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', ensureId(scope, tab, 'tab'));
    // Panels themselves remain keyboard reachable when their content has no controls.
    if (!panel.hasAttribute('tabindex')) panel.tabIndex = 0;
  });
  let selected = options.value === undefined
    ? tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true' && !isDisabled(tab))
    : values.findIndex((value, index) => value === options.value && !isDisabled(tabs[index]!));
  if (selected < 0) selected = tabs.findIndex(tab => !isDisabled(tab));
  const render = (focusIndex = selected) => tabs.forEach((tab, index) => {
    tab.setAttribute('aria-selected', String(index === selected));
    tab.tabIndex = index === focusIndex ? 0 : -1;
    panels[index]!.hidden = index !== selected;
  });
  const select = (value: string) => {
    if (scope.destroyed) return;
    const index = values.indexOf(value);
    if (index < 0 || isDisabled(tabs[index]!)) return;
    const changed = selected !== index;
    selected = index;
    render();
    if (changed) { emit(root, { value }); options.onValueChange?.(value); }
  };
  scope.listen(list, 'click', event => {
    const tab = eventElement(event)?.closest<HTMLElement>('[role="tab"]');
    const index = tab ? tabs.indexOf(tab) : -1;
    if (index >= 0) { event.preventDefault(); select(values[index]!); }
  });
  scope.listen(list, 'keydown', event => {
    const keyboard = event as KeyboardEvent;
    if (keyboard.altKey || keyboard.ctrlKey || keyboard.metaKey || keyboard.isComposing) return;
    const tab = eventElement(event)?.closest<HTMLElement>('[role="tab"]');
    const index = tab ? tabs.indexOf(tab) : -1;
    if (index < 0) return;
    if (manual && (keyboard.key === 'Enter' || keyboard.key === ' ')) {
      keyboard.preventDefault(); select(values[index]!); return;
    }
    const orientation = list.getAttribute('aria-orientation') === 'vertical' ? 'vertical' : 'horizontal';
    const recognized = keyboard.key === 'Home' || keyboard.key === 'End' ||
      (orientation === 'vertical' ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight']).includes(keyboard.key);
    if (!recognized) return;
    keyboard.preventDefault();
    const next = getNextEnabledIndex(index, keyboard.key, tabs.map(item => ({ disabled: isDisabled(item) })), getDirection(list), orientation);
    if (next < 0) return;
    if (!manual) select(values[next]!); else render(next);
    tabs[next]!.focus();
    tabs[next]!.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  });
  render();
  return { get value() { return values[selected] ?? ''; }, select, destroy: () => scope.destroy() };
}
