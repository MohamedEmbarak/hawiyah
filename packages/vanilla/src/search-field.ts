import { createCleanup, observeFormReset, getSearchSuggestions, requireText, isDisabled, observeFieldValue, requestSearchDialogClose, type SearchSuggestionMatch } from '@hawiyah/core';
import { emit, ensureId, eventElement, nativeChange, readOnly, remember, required, templated, text, writeText } from './dom.js';

export interface SearchFieldOptions {
  /** Accessible name of the clear button: the option, else its authored aria-label or text, else data-hw-clear-label. Required. */
  clearLabel?: string;
  suggestions?: readonly string[];
  maxSuggestions?: number;
  /** Live-region announcement of the suggestion count (data-hw-results-message="{count} …"). Required when suggestions are given. */
  getResultsMessage?: (count: number) => string;
  onValueChange?: (value: string) => void;
  onSearch?: (query: string) => void;
}
export interface SearchFieldController {
  readonly value: string;
  clear(): void;
  setValue(value: string): void;
  setSuggestions(items: readonly string[]): void;
  destroy(): void;
}

/** Optional local suggestions; native form submission remains owned by the application. */
export function createSearchField(root: HTMLElement, options: SearchFieldOptions = {}): SearchFieldController {
  const input = required<HTMLInputElement>(root, '[data-hw-search-input]');
  const button = required<HTMLButtonElement>(root, '[data-hw-search-clear]');
  const scope = createCleanup(); const children = [...button.childNodes];
  const presence = observeFieldValue(input); scope.add(() => presence.destroy());
  remember(scope, button, ['type', 'class', 'hidden', 'disabled', 'aria-label', 'aria-controls']);
  scope.add(() => button.replaceChildren(...children));
  button.type = 'button'; button.classList.add('hw-search-clear');
  // The icon replaces the button's children below, so authored text is read first and kept as the name.
  const authored = button.getAttribute('aria-label')?.trim() || button.textContent?.trim() || undefined;
  writeText(button, 'aria-label', 'SearchField', 'clearLabel', options.clearLabel ?? authored ?? text(root, 'clearLabel'));
  const resultsMessage = templated(root, 'getResultsMessage', options.getResultsMessage, (count: number) => ({ count }));
  button.setAttribute('aria-controls', ensureId(scope, input, 'search'));
  const icon = input.ownerDocument.createElement('span'); icon.className = 'hw-search-clear-icon'; icon.setAttribute('aria-hidden', 'true'); button.replaceChildren(icon);
  const aria = ['role', 'aria-autocomplete', 'aria-expanded', 'aria-controls', 'aria-activedescendant', 'autocomplete'].map(name => [name, input.getAttribute(name)] as const);
  const restoreAria = () => { for (const [name, value] of aria) { if (value === null) input.removeAttribute(name); else input.setAttribute(name, value); } };
  let list: HTMLDivElement | undefined, status: HTMLDivElement | undefined;
  let explicitSuggestions = options.suggestions;
  let previous = input.value, composing = false, suppressSuggestions = false, open = false, active = -1;
  let matches: SearchSuggestionMatch[] = [];
  const rootDisabled = () => root.getAttribute('aria-disabled') === 'true' || (root.localName !== 'fieldset' && root.hasAttribute('disabled'));
  const disabled = () => isDisabled(input) || rootDisabled();
  const blocked = () => disabled() || readOnly(root, input);
  const enabled = () => explicitSuggestions !== undefined || root.hasAttribute('data-hw-suggestions');
  const dictionary = (): readonly string[] => {
    if (explicitSuggestions !== undefined) return explicitSuggestions;
    try { const value: unknown = JSON.parse(root.dataset.hwSuggestions ?? '[]'); return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []; } catch { return []; }
  };
  const limit = () => options.maxSuggestions ?? Number(root.dataset.hwMaxSuggestions ?? 8);
  const host = input.closest<HTMLElement>('.hw-search-control');
  const popupHost = host && root.contains(host) ? host : root;
  const close = () => {
    open = false; active = -1; matches = [];
    if (list) { list.hidden = true; list.replaceChildren(); input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); }
    if (status) status.textContent = '';
  };
  const configure = () => {
    if (!enabled()) {
      if (list) { close(); list.remove(); status?.remove(); list = undefined; status = undefined; restoreAria(); }
      return;
    }
    if (!list) {
      list = input.ownerDocument.createElement('div'); list.className = 'hw-search-suggestions'; list.hidden = true;
      list.setAttribute('role', 'listbox'); ensureId(scope, list, 'search-suggestions');
      // The suggestion list is named like the input; it adds no name of its own.
      const labelledBy = input.getAttribute('aria-labelledby'); const label = input.getAttribute('aria-label');
      if (labelledBy) list.setAttribute('aria-labelledby', labelledBy); else if (label) list.setAttribute('aria-label', label);
      else if (input.labels?.length) list.setAttribute('aria-labelledby', [...input.labels].map(node => ensureId(scope, node, 'search-label')).join(' '));
      requireText('SearchField', 'getResultsMessage', options.getResultsMessage ?? root.getAttribute('data-hw-results-message'), 'suggestions are given');
      status = input.ownerDocument.createElement('div'); status.className = 'hw-sr-only'; status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); status.setAttribute('aria-atomic', 'true');
      popupHost.append(list); root.append(status);
    }
    input.setAttribute('role', 'combobox'); input.setAttribute('aria-autocomplete', 'list'); input.setAttribute('aria-expanded', String(open)); input.setAttribute('aria-controls', list.id); input.setAttribute('autocomplete', 'off');
  };
  scope.add(() => { list?.remove(); status?.remove(); restoreAria(); });
  const renderBase = () => {
    presence.refresh(); button.hidden = !input.value || readOnly(root, input);
    // Inherited fieldset disabled is native and must not become a stale own attribute.
    button.disabled = input.disabled || input.getAttribute('aria-disabled') === 'true' || rootDisabled();
  };
  const renderSuggestions = () => {
    configure();
    if (!list || !status || blocked() || composing || suppressSuggestions || input.ownerDocument.activeElement !== input) { close(); return; }
    matches = getSearchSuggestions(input.value, dictionary(), limit()); active = -1;
    input.removeAttribute('aria-activedescendant');
    list.replaceChildren(...matches.map((match, index) => {
      const option = input.ownerDocument.createElement('div'); option.className = 'hw-search-option'; option.id = `${list!.id}-${index}`;
      option.setAttribute('role', 'option'); option.setAttribute('aria-selected', 'false'); option.dataset.hwSearchIndex = String(index); option.dir = 'auto';
      for (const segment of match.segments) {
        if (segment.match) { const strong = input.ownerDocument.createElement('strong'); strong.textContent = segment.text; option.append(strong); }
        else option.append(input.ownerDocument.createTextNode(segment.text));
      }
      return option;
    }));
    open = matches.length > 0; list.hidden = !open; input.setAttribute('aria-expanded', String(open));
    const message = input.value.trim() ? resultsMessage(matches.length) : '';
    status.textContent = message && requireText('SearchField', 'getResultsMessage', message, 'suggestions are given') ? message : '';
  };
  const updateActive = () => {
    if (!list) return;
    [...list.children].forEach((option, index) => option.setAttribute('aria-selected', String(index === active)));
    const option = list.children[active] as HTMLElement | undefined;
    if (!option) { input.removeAttribute('aria-activedescendant'); return; }
    input.setAttribute('aria-activedescendant', option.id);
    // Scroll the list only; scrollIntoView can move a surrounding modal or page.
    const optionRect = option.getBoundingClientRect(), listRect = list.getBoundingClientRect();
    if (list.clientHeight && list.scrollHeight > list.clientHeight) {
      if (optionRect.top < listRect.top) list.scrollTop += optionRect.top - listRect.top;
      else if (optionRect.bottom > listRect.top + list.clientHeight) list.scrollTop += optionRect.bottom - listRect.top - list.clientHeight;
    }
  };
  const changed = (event: Event) => {
    renderBase();
    if (event.type === 'input') {
      if ((event as InputEvent).isComposing || composing || suppressSuggestions) close(); else renderSuggestions();
    }
    if (input.value === previous) return;
    previous = input.value; emit(root, { value: input.value }); options.onValueChange?.(input.value);
  };
  const dispatchChange = () => {
    const EventType = input.ownerDocument.defaultView?.Event;
    if (EventType) input.dispatchEvent(new EventType('input', { bubbles: true }));
    nativeChange(input);
  };
  const choose = (index: number) => {
    const match = matches[index];
    if (scope.destroyed || blocked() || composing || !match) return;
    input.value = match.value; suppressSuggestions = true;
    try { close(); input.focus({preventScroll: true}); dispatchChange(); } finally { suppressSuggestions = false; }
    close();
  };
  const clear = () => {
    if (scope.destroyed || blocked() || !input.value) return;
    input.value = ''; close(); input.focus(); dispatchChange();
  };
  scope.listen(button, 'click', clear);
  scope.listen(input, 'beforeinput', event => { if (blocked()) event.preventDefault(); });
  scope.listen(input, 'input', changed); scope.listen(input, 'change', changed);
  scope.listen(input, 'focus', renderSuggestions); scope.listen(input, 'blur', close);
  scope.listen(input, 'compositionstart', () => { composing = true; close(); });
  scope.listen(input, 'compositionend', () => { composing = false; renderSuggestions(); });
  scope.listen(input, 'keydown', event => {
    const key = event as KeyboardEvent;
    if (event.defaultPrevented || composing || key.isComposing || key.keyCode === 229 || key.altKey || key.ctrlKey || key.metaKey || key.shiftKey || disabled()) return;
    if (key.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); close(); return; }
    if (key.key === 'Escape' && requestSearchDialogClose(input)) { event.preventDefault(); event.stopPropagation(); return; }
    if ((key.key === 'ArrowDown' || key.key === 'ArrowUp') && enabled() && !blocked()) {
      if (!open) renderSuggestions();
      if (!open || !matches.length) return;
      event.preventDefault(); active = key.key === 'ArrowDown' ? (active + 1) % matches.length : (active < 0 ? matches.length - 1 : (active + matches.length - 1) % matches.length); updateActive();
    } else if (key.key === 'Enter') {
      if (open && active >= 0 && !blocked()) { event.preventDefault(); choose(active); }
      else { const query = input.value.trim(); close(); if (query) options.onSearch?.(query); }
    }
  });
  const optionFrom = (event: Event) => {
    const option = eventElement(event)?.closest<HTMLElement>('[data-hw-search-index]');
    return option && list?.contains(option) ? option : undefined;
  };
  for (const type of ['pointerdown', 'mousedown']) scope.listen(root, type, event => {
    const pointer = event as MouseEvent;
    const target = eventElement(event);
    if (pointer.button === 0 && (optionFrom(event) || (target && button.contains(target))) && !blocked()) event.preventDefault();
  });
  scope.listen(root, 'click', event => {
    const pointer = event as MouseEvent, option = optionFrom(event);
    if (option && pointer.button === 0 && !pointer.ctrlKey && !pointer.metaKey && !pointer.altKey && !pointer.shiftKey) { event.preventDefault(); choose(Number(option.dataset.hwSearchIndex)); }
  });
  scope.listen(input.ownerDocument, 'pointerdown', event => { if (event.target && !root.contains(event.target as Node)) close(); });
  scope.listen(input.ownerDocument, 'click', event => { if (event.target && !root.contains(event.target as Node)) close(); });
  const reset = observeFormReset(input, () => {
    if (scope.destroyed) return;
    const changedValue = input.value !== previous; previous = input.value; composing = false; close(); renderBase();
    if (changedValue) { emit(root, { value: input.value }); options.onValueChange?.(input.value); }
  });
  scope.add(() => reset.destroy());
  const Observer = input.ownerDocument.defaultView?.MutationObserver;
  if (Observer) {
    const observer = new Observer(() => { renderBase(); renderSuggestions(); });
    observer.observe(input, { attributes: true, attributeFilter: ['disabled', 'aria-disabled', 'readonly', 'value'] });
    observer.observe(root, { attributes: true, attributeFilter: ['data-hw-readonly', 'aria-readonly', 'aria-disabled', 'disabled', 'data-hw-suggestions', 'data-hw-max-suggestions'] });
    for (let ancestor = root.parentElement; ancestor; ancestor = ancestor.parentElement) if (ancestor.localName === 'fieldset') observer.observe(ancestor, {attributes: true, attributeFilter: ['disabled']});
    scope.add(() => observer.disconnect());
  }
  configure(); renderBase();
  return {
    get value() { return input.value; }, clear,
    setValue(value) { if (!scope.destroyed) { input.value = value; previous = value; close(); renderBase(); } },
    setSuggestions(items) { if (!scope.destroyed) { explicitSuggestions = [...items]; renderSuggestions(); } },
    destroy: () => scope.destroy(),
  };
}
