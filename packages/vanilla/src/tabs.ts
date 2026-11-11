import { createCleanup, getDirection, getNextEnabledIndex, isDisabled, observeTabOverflow } from '@hawiyah/core';
import { emit, ensureId, eventElement, remember, required, text, writeOptional, writeText } from './dom.js';

export interface TabsOptions {
  value?: string;
  activationMode?: 'automatic' | 'manual';
  overflow?: 'menu' | 'scroll';
  /** Accessible name of the overflow disclosure (data-hw-overflow-label). Required when overflow is 'menu', the default. */
  overflowLabel?: string;
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
  if (!tabs.length) throw new Error('Hawiyah: tabs requires at least one tab.');
  const panels = tabs.map(tab => {
    const id = tab.getAttribute('aria-controls');
    const panel = id ? root.ownerDocument.getElementById(id) : null;
    if (!panel || !root.contains(panel)) throw new Error('Hawiyah: each tab requires aria-controls pointing to a panel inside its root.');
    return panel;
  });
  const scope = createCleanup();
  const values = tabs.map((tab, index) => tab.dataset.hwValue ?? ensureId(scope, tab, `tab-${index}`));
  if (new Set(values).size !== values.length) { scope.destroy(); throw new Error('Hawiyah: tab values must be unique.'); }
  const manual = (options.activationMode ?? root.dataset.hwActivation) === 'manual';
  const overflowMode = () => (options.overflow ?? root.dataset.hwOverflow) === 'scroll' ? 'scroll' : 'menu';
  const overflowEnabled = () => overflowMode() === 'menu' && list.getAttribute('aria-orientation') !== 'vertical';
  const bar = root.ownerDocument.createElement('div'); bar.className = 'hw-tab-bar';
  const details = root.ownerDocument.createElement('details'); details.className = 'hw-tabs-overflow'; details.hidden = true;
  const summary = root.ownerDocument.createElement('summary'); summary.className = 'hw-tab-overflow-trigger'; summary.textContent = '…';
  const menu = root.ownerDocument.createElement('div'); menu.className = 'hw-tab-overflow-menu';
  details.append(summary, menu);
  list.before(bar); bar.append(list, details);
  scope.add(() => { bar.replaceWith(list); });
  remember(scope, list, ['data-hw-overflow', 'aria-hidden']);
  tabs.forEach((tab, index) => {
    remember(scope, tab, ['aria-selected', 'tabindex', 'data-hw-overflow-hidden', 'aria-hidden']);
    const panel = panels[index]!;
    remember(scope, panel, ['hidden', 'role', 'aria-labelledby', 'tabindex']);
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', ensureId(scope, tab, 'tab'));
    if (!panel.hasAttribute('tabindex')) panel.tabIndex = 0;
  });
  const overflowButtons = tabs.map((tab, index) => {
    const button = root.ownerDocument.createElement('button');
    button.type = 'button'; button.className = 'hw-tab-overflow-item'; button.dataset.hwOverflowIndex = String(index);
    button.setAttribute('aria-controls', panels[index]!.id);
    return button;
  });
  let hidden = new Set<number>();
  let selected = options.value === undefined
    ? tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true' && !isDisabled(tab))
    : values.findIndex((value, index) => value === options.value && !isDisabled(tabs[index]!));
  if (selected < 0) selected = tabs.findIndex(tab => !isDisabled(tab));
  const blocked = () => isDisabled(root) || tabs.every(isDisabled);
  const firstVisible = () => tabs.findIndex((tab, index) => !hidden.has(index) && !isDisabled(tab));
  const render = (focusIndex = selected) => {
    const overflowLabel = text(root, 'overflowLabel', options.overflowLabel);
    if (overflowMode() === 'menu') writeText(summary, 'aria-label', 'Tabs', 'overflowLabel', overflowLabel, "overflow is 'menu'"); else writeOptional(summary, 'aria-label', overflowLabel);
    if (selected < 0 || isDisabled(tabs[selected]!)) selected = tabs.findIndex(tab => !isDisabled(tab));
    if (hidden.has(focusIndex) || focusIndex < 0 || isDisabled(tabs[focusIndex]!)) focusIndex = firstVisible();
    bar.dataset.hwOverflow = overflowMode(); list.dataset.hwOverflow = overflowMode();
    if (hidden.size === tabs.length) list.setAttribute('aria-hidden', 'true'); else list.removeAttribute('aria-hidden');
    tabs.forEach((tab, index) => {
      tab.setAttribute('aria-selected', String(index === selected));
      tab.tabIndex = !hidden.has(index) && index === focusIndex ? 0 : -1;
      if (hidden.has(index)) { tab.dataset.hwOverflowHidden = 'true'; tab.setAttribute('aria-hidden', 'true'); }
      else { tab.removeAttribute('data-hw-overflow-hidden'); tab.removeAttribute('aria-hidden'); }
      panels[index]!.hidden = index !== selected;
      const button = overflowButtons[index]!;
      const label = tab.getAttribute('aria-label') || tab.textContent?.trim() || values[index]!;
      if (button.textContent !== label) button.textContent = label;
      button.disabled = isDisabled(tab) || isDisabled(root);
      button.setAttribute('aria-pressed', String(index === selected));
    });
    details.hidden = hidden.size === 0;
    summary.toggleAttribute('data-active', hidden.has(selected));
    if (hidden.has(selected)) summary.setAttribute('data-active', 'true');
    if (blocked()) { details.open = false; summary.setAttribute('aria-disabled', 'true'); summary.tabIndex = -1; }
    else { summary.removeAttribute('aria-disabled'); summary.removeAttribute('tabindex'); }
  };
  const select = (value: string) => {
    if (scope.destroyed || isDisabled(root)) return;
    const index = values.indexOf(value);
    if (index < 0 || isDisabled(tabs[index]!)) return;
    const changed = selected !== index;
    selected = index; details.open = false; render();
    if (changed) { emit(root, { value }); options.onValueChange?.(value); }
  };
  scope.listen(list, 'click', event => {
    const tab = eventElement(event)?.closest<HTMLElement>('[role="tab"]');
    const index = tab ? tabs.indexOf(tab) : -1;
    if (index >= 0) { event.preventDefault(); if (!hidden.has(index)) select(values[index]!); }
  });
  scope.listen(list, 'keydown', event => {
    const keyboard = event as KeyboardEvent;
    if (keyboard.altKey || keyboard.ctrlKey || keyboard.metaKey || keyboard.isComposing || isDisabled(root)) return;
    const tab = eventElement(event)?.closest<HTMLElement>('[role="tab"]');
    const index = tab ? tabs.indexOf(tab) : -1;
    if (index < 0 || hidden.has(index) || isDisabled(tabs[index]!)) return;
    if (manual && (keyboard.key === 'Enter' || keyboard.key === ' ')) {
      keyboard.preventDefault(); select(values[index]!); return;
    }
    const orientation = list.getAttribute('aria-orientation') === 'vertical' ? 'vertical' : 'horizontal';
    const recognized = keyboard.key === 'Home' || keyboard.key === 'End' ||
      (orientation === 'vertical' ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight']).includes(keyboard.key);
    if (!recognized) return;
    keyboard.preventDefault();
    const next = getNextEnabledIndex(index, keyboard.key, tabs.map((item, i) => ({ disabled: isDisabled(item) || hidden.has(i) })), getDirection(list), orientation);
    if (next < 0) return;
    if (!manual) select(values[next]!); else render(next);
    tabs[next]!.focus();
    if (!overflowEnabled()) tabs[next]!.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  });
  scope.listen(details, 'click', event => {
    if (blocked()) { event.preventDefault(); details.open = false; return; }
    const button = eventElement(event)?.closest<HTMLButtonElement>('[data-hw-overflow-index]');
    if (!button || !menu.contains(button)) return;
    event.preventDefault();
    const index = Number(button.dataset.hwOverflowIndex);
    if (!hidden.has(index) || isDisabled(button) || isDisabled(tabs[index]!)) return;
    select(values[index]!); summary.focus({preventScroll: true});
  });
  scope.listen(details, 'keydown', event => {
    const key = event as KeyboardEvent;
    if (blocked()) { if (key.key === 'Enter' || key.key === ' ') event.preventDefault(); details.open = false; return; }
    if (key.key === 'Escape' && details.open) { event.preventDefault(); details.open = false; summary.focus({preventScroll: true}); }
  });
  scope.listen(details, 'toggle', () => { if (blocked() || details.hidden) details.open = false; });
  scope.listen(root.ownerDocument, 'click', event => {
    if (event.target && !details.contains(event.target as Node)) details.open = false;
  });
  const observer = observeTabOverflow({ container: bar, tabs: () => tabs, enabled: overflowEnabled, onChange: indices => {
    if (scope.destroyed) return;
    const activeElement = root.ownerDocument.activeElement;
    const focusedTab = tabs.indexOf(activeElement as HTMLElement);
    const focusedOverflow = overflowButtons.indexOf(activeElement as HTMLButtonElement);
    const focusInDisclosure = details.contains(activeElement);
    hidden = new Set(indices);
    menu.replaceChildren(...indices.map(index => overflowButtons[index]!));
    if (!hidden.size) details.open = false;
    render();
    if (focusedTab >= 0 && hidden.has(focusedTab) && !blocked()) summary.focus({preventScroll: true});
    else if (focusInDisclosure && focusedOverflow >= 0 && !hidden.has(focusedOverflow) && !isDisabled(tabs[focusedOverflow]!)) {
      details.open = false; render(focusedOverflow); tabs[focusedOverflow]!.focus({preventScroll: true});
    } else if (focusInDisclosure && !hidden.size) {
      const target = selected >= 0 && !isDisabled(tabs[selected]!) ? selected : firstVisible();
      tabs[target]?.focus({preventScroll: true});
    } else if (focusInDisclosure && !blocked()) {
      // Replacing the disclosure's children can blur a retained destination too.
      if (activeElement && menu.contains(activeElement) && !isDisabled(activeElement)) (activeElement as HTMLElement).focus({preventScroll: true});
      else summary.focus({preventScroll: true});
    }
  }});
  scope.add(observer.destroy);
  const MutationObserver = root.ownerDocument.defaultView?.MutationObserver;
  if (MutationObserver) {
    const mutations = new MutationObserver(() => { render(); observer.refresh(); });
    mutations.observe(root, {attributes: true, attributeFilter: ['aria-disabled', 'disabled', 'data-hw-overflow', 'data-hw-overflow-label']});
    mutations.observe(list, {attributes: true, attributeFilter: ['aria-orientation', 'dir']});
    for (const tab of tabs) mutations.observe(tab, {attributes: true, attributeFilter: ['disabled', 'aria-disabled', 'aria-label'], childList: true, characterData: true, subtree: true});
    for (let ancestor = root.parentElement; ancestor; ancestor = ancestor.parentElement) {
      if (ancestor.localName === 'fieldset') mutations.observe(ancestor, {attributes: true, attributeFilter: ['disabled']});
    }
    scope.add(() => mutations.disconnect());
  }
  render();
  return { get value() { return values[selected] ?? ''; }, select, destroy: () => scope.destroy() };
}
