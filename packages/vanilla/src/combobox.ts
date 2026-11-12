import { observeFieldValue, observeFormReset, createCleanup, requireText, createComboboxState, getComboboxOptions, isDisabled, transitionCombobox } from '@hawiyah/core';
import type { ComboboxEvent, Option } from '@hawiyah/core';
import { emit, ensureId, eventElement, nativeChange, remember, required, templated, text, validityMessage } from './dom.js';

export interface ComboboxOptions {
  value?: string;
  onValueChange?: (value: string) => void;
  /** Live-region announcement of the number of matches (data-hw-results-message="{count} …"). Required. */
  getResultsMessage?: (count: number) => string;
  /** Custom validity message while a required combobox has no selected option (data-hw-required-message). Required when the input is required. */
  requiredMessage?: string;
  /** Called with the new open state whenever the popup opens or closes (also as hw:change detail {open}). */
  onOpenChange?: (open: boolean) => void;
  /** Called with the input text for every accepted input event (also as hw:change detail {query}). */
  onQueryChange?: (query: string) => void;
}

export interface ComboboxController {
  readonly value: string;
  readonly open: boolean;
  select(value: string): void;
  show(): void;
  close(): void;
  destroy(): void;
}

export function createCombobox(root: HTMLElement, options: ComboboxOptions = {}): ComboboxController {
  const input = required<HTMLInputElement>(root, '[data-hw-combobox-input]');
  const list = required<HTMLElement>(root, '[data-hw-combobox-list]');
  if (input.localName !== 'input') throw new Error('Hawiyah: combobox input must be a native input.');
  const nodes = [...list.querySelectorAll<HTMLElement>('[data-hw-value]')];
  const items: Option[] = nodes.map(node => ({
    value: node.dataset.hwValue ?? '', label: node.textContent?.trim() ?? '', disabled: isDisabled(node),
  }));
  if (items.some(item => !item.value) || new Set(items.map(item => item.value)).size !== items.length) {
    throw new Error('Hawiyah: combobox option values must be non-empty and unique.');
  }
  const scope = createCleanup();
  const presence = observeFieldValue(input); scope.add(() => presence.destroy());
  const hidden = root.querySelector<HTMLInputElement>('[data-hw-combobox-value]');
  let status = root.querySelector<HTMLElement>('[data-hw-combobox-status]');
  if (!status) {
    status = root.ownerDocument.createElement('span');
    status.className = 'hw-sr-only';
    status.dataset.hwComboboxStatus = '';
    root.append(status);
    const generated = status;
    scope.add(() => generated.remove());
  } else {
    const originalText = status.textContent;
    scope.add(() => { status!.textContent = originalText; });
  }
  remember(scope, status, ['role', 'aria-live', 'aria-atomic']);
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  remember(scope, input, ['role', 'aria-autocomplete', 'aria-expanded', 'aria-controls', 'aria-activedescendant', 'aria-readonly', 'autocomplete', 'aria-invalid']);
  // A failed submission marks the input invalid until its validity is valid again or the form resets.
  const authoredInvalid = input.getAttribute('aria-invalid'); let failed = false;
  const applyInvalid = () => { if (failed) input.setAttribute('aria-invalid', 'true'); else if (authoredInvalid === null) input.removeAttribute('aria-invalid'); else input.setAttribute('aria-invalid', authoredInvalid); };
  remember(scope, list, ['role', 'hidden', 'aria-label', 'aria-labelledby']);
  const originalInputValue = input.value;
  const originalHiddenValue = hidden?.value;
  const originalHiddenDisabled = hidden?.disabled ?? false;
  const originalCustomValidity = input.validity.customError ? input.validationMessage : '';
  // Hidden inputs reflect their value property to the HTML attribute.
  if (hidden) remember(scope, hidden, ['value', 'disabled']);
  scope.add(() => {
    input.value = originalInputValue;
    input.setCustomValidity(originalCustomValidity);
    if (hidden) hidden.value = originalHiddenValue ?? '';
  });
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('aria-controls', ensureId(scope, list, 'listbox'));
  list.setAttribute('role', 'listbox');
  if (!list.hasAttribute('aria-label') && !list.hasAttribute('aria-labelledby')) {
    const labelledBy = input.getAttribute('aria-labelledby');
    const label = input.getAttribute('aria-label');
    if (labelledBy) list.setAttribute('aria-labelledby', labelledBy);
    else if (label) list.setAttribute('aria-label', label);
    else if (input.labels?.length) {
      list.setAttribute('aria-labelledby', [...input.labels].map(node => ensureId(scope, node, 'combobox-label')).join(' '));
    }
  }
  nodes.forEach(node => {
    ensureId(scope, node, 'option');
    remember(scope, node, ['role', 'aria-selected', 'data-active', 'hidden']);
    node.setAttribute('role', 'option');
  });
  const initialValue = options.value ?? hidden?.value ?? nodes.find(node => node.getAttribute('aria-selected') === 'true')?.dataset.hwValue ?? '';
  let state = createComboboxState(items, initialValue);
  if (!state.value && originalInputValue && options.value === undefined) state = { ...state, query: originalInputValue };
  let composing = false;
  const refreshDisabled = () => nodes.forEach((node, index) => { items[index]!.disabled = isDisabled(node); });
  const resultsMessage = templated(root, 'getResultsMessage', options.getResultsMessage, (count: number) => ({ count }));
  requireText('Combobox', 'getResultsMessage', options.getResultsMessage ?? root.getAttribute('data-hw-results-message'));
  if (input.required) requireText('Combobox', 'requiredMessage', text(root, 'requiredMessage', options.requiredMessage), 'required is set');
  const render = (announce = false) => {
    const visible = getComboboxOptions(state, items);
    const visibleValues = new Set(visible.map(item => item.value));
    const active = visible[state.activeIndex];
    input.value = state.query;
    presence.refresh();
    if (input.readOnly) input.setAttribute('aria-readonly', 'true'); else input.removeAttribute('aria-readonly');
    input.setCustomValidity(input.required && !state.value && !isDisabled(input)
      ? validityMessage('Combobox', 'requiredMessage', text(root, 'requiredMessage', options.requiredMessage), 'required is set')
      : originalCustomValidity);
    if (failed && input.validity.valid) { failed = false; applyInvalid(); }
    input.setAttribute('aria-expanded', String(state.open));
    list.hidden = !state.open;
    let activeNode: HTMLElement | undefined;
    nodes.forEach((node, index) => {
      const item = items[index]!;
      node.hidden = !visibleValues.has(item.value);
      node.setAttribute('aria-selected', String(item.value === state.value));
      const highlighted = state.open && item === active;
      node.toggleAttribute('data-active', highlighted);
      if (highlighted) activeNode = node;
    });
    if (activeNode) {
      input.setAttribute('aria-activedescendant', activeNode.id);
      activeNode.scrollIntoView?.({ block: 'nearest' });
    } else input.removeAttribute('aria-activedescendant');
    if (hidden) {
      hidden.value = state.value;
      hidden.disabled = originalHiddenDisabled || isDisabled(input);
    }
    if (!state.open) status!.textContent = '';
    else if (announce) { const message = resultsMessage(visible.length); status!.textContent = requireText('Combobox', 'getResultsMessage', message) ? message! : ''; }
  };
  const send = (event: ComboboxEvent) => {
    if (scope.destroyed) return;
    refreshDisabled();
    const previousValue = state.value; const previousOpen = state.open;
    state = transitionCombobox(state, event, items);
    render(event.type === 'input' || event.type === 'open');
    if (previousOpen !== state.open) { emit(root, { open: state.open }); options.onOpenChange?.(state.open); }
    if (previousValue !== state.value) {
      if (hidden) nativeChange(hidden);
      emit(root, { value: state.value, label: state.value ? state.query : '' });
      options.onValueChange?.(state.value);
    }
  };
  const canOpen = () => !isDisabled(input) && !input.readOnly;
  const show = () => { if (canOpen()) send({ type: 'open' }); };
  const close = () => send({ type: 'close' });
  const select = (value: string) => { if (canOpen()) send({ type: 'select', value }); };
  const query = () => { const text = input.value; send({ type: 'input', query: text }); if (!scope.destroyed) { emit(root, { query: text }); options.onQueryChange?.(text); } };
  scope.listen(input, 'input', event => {
    if (!canOpen()) { render(); return; }
    if (!composing && !(event as InputEvent).isComposing && canOpen()) query();
  });
  scope.listen(input, 'compositionstart', () => { composing = true; });
  scope.listen(input, 'compositionend', () => {
    composing = false;
    if (canOpen()) query(); else render();
  });
  scope.listen(input, 'click', () => { if (!state.open) show(); });
  scope.listen(input, 'keydown', event => {
    const keyboard = event as KeyboardEvent;
    if (composing || keyboard.isComposing || keyboard.altKey || keyboard.ctrlKey || keyboard.metaKey || !canOpen()) return;
    const key = keyboard.key;
    if (key === 'ArrowDown' || key === 'ArrowUp' || (state.open && (key === 'Home' || key === 'End'))) {
      keyboard.preventDefault();
      send({ type: 'navigate', key });
    } else if (key === 'Enter' && state.open && state.activeIndex >= 0) {
      const active = getComboboxOptions(state, items)[state.activeIndex];
      if (active && !active.disabled) { keyboard.preventDefault(); select(active.value); }
    } else if (key === 'Escape' && state.open) {
      keyboard.preventDefault();
      // Dismiss the child overlay before the surrounding native modal.
      keyboard.stopPropagation();
      close();
    } else if (key === 'Tab') close();
  });
  scope.listen(list, 'pointerdown', event => {
    if (eventElement(event)?.closest('[data-hw-value]')) event.preventDefault();
  });
  scope.listen(list, 'click', event => {
    const option = eventElement(event)?.closest<HTMLElement>('[data-hw-value]');
    if (!option || !nodes.includes(option) || option.hidden || isDisabled(option)) return;
    select(option.dataset.hwValue ?? '');
    input.focus();
  });
  scope.listen(root, 'focusout', event => {
    const related = (event as FocusEvent).relatedTarget as Node | null;
    if (!related || !root.contains(related)) close();
  });
  scope.listen(root.ownerDocument, 'pointerdown', event => {
    const target = event.target as Node | null;
    if (!target || !root.contains(target)) close();
  });
  scope.listen(input, 'invalid', () => { failed = true; applyInvalid(); });
  const reset = observeFormReset(input, () => { failed = false; applyInvalid(); send({ type: 'reset', value: initialValue }); });
  scope.add(() => reset.destroy());
  const Observer = input.ownerDocument.defaultView?.MutationObserver;
  if (Observer) {
    const observer = new Observer(() => {
      if (scope.destroyed) return;
      if (!canOpen() && state.open) close(); else render();
    });
    observer.observe(input, { attributes: true, attributeFilter: ['required', 'disabled', 'readonly'] });
    for (let ancestor = input.parentElement; ancestor; ancestor = ancestor.parentElement) {
      if (ancestor.localName === 'fieldset') observer.observe(ancestor, { attributes: true, attributeFilter: ['disabled'] });
    }
    scope.add(() => observer.disconnect());
  }
  render();
  return { get value() { return state.value; }, get open() { return state.open; }, select, show, close, destroy: () => scope.destroy() };
}
