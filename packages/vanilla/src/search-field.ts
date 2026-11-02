import { createCleanup, isDisabled, observeFieldValue } from '@nasaq/core';
import { emit, ensureId, nativeChange, readOnly, remember, required, translated } from './dom.js';

export interface SearchFieldOptions { clearLabel?: string; onValueChange?: (value: string) => void }
export interface SearchFieldController { readonly value: string; clear(): void; setValue(value: string): void; destroy(): void }

/** Optional clear-action enhancement; search submission remains owned by the form. */
export function createSearchField(root: HTMLElement, options: SearchFieldOptions = {}): SearchFieldController {
  const input = required<HTMLInputElement>(root, '[data-nq-search-input]');
  const button = required<HTMLButtonElement>(root, '[data-nq-search-clear]');
  const scope = createCleanup(); const children = [...button.childNodes];
  const presence = observeFieldValue(input); scope.add(() => presence.destroy());
  remember(scope, button, ['type', 'class', 'hidden', 'disabled', 'aria-label', 'aria-controls']);
  scope.add(() => button.replaceChildren(...children));
  button.type = 'button'; button.classList.add('nq-search-clear');
  button.setAttribute('aria-label', options.clearLabel ?? button.getAttribute('aria-label') ?? translated(root, 'Clear search', 'مسح البحث'));
  button.setAttribute('aria-controls', ensureId(scope, input, 'search'));
  const icon = input.ownerDocument.createElement('span'); icon.className = 'nq-search-clear-icon'; icon.setAttribute('aria-hidden', 'true'); button.replaceChildren(icon);
  let previous = input.value;
  const blocked = () => isDisabled(input) || readOnly(root, input);
  const render = () => { presence.refresh(); button.hidden = !input.value || readOnly(root, input); button.disabled = input.disabled; };
  const changed = () => {
    render(); if (input.value === previous) return;
    previous = input.value; emit(root, { value: input.value }); options.onValueChange?.(input.value);
  };
  const clear = () => {
    if (scope.destroyed || blocked() || !input.value) return;
    input.value = ''; input.focus();
    const EventType = input.ownerDocument.defaultView?.Event;
    if (EventType) input.dispatchEvent(new EventType('input', { bubbles: true }));
    nativeChange(input);
  };
  scope.listen(button, 'click', clear);
  scope.listen(input, 'input', changed); scope.listen(input, 'change', changed);
  if (input.form) scope.listen(input.form, 'reset', event => queueMicrotask(() => { if (!scope.destroyed && !event.defaultPrevented) { previous = input.value; render(); } }));
  const Observer = input.ownerDocument.defaultView?.MutationObserver;
  if (Observer) {
    const observer = new Observer(render);
    observer.observe(input, { attributes: true, attributeFilter: ['disabled', 'readonly', 'value'] });
    observer.observe(root, { attributes: true, attributeFilter: ['data-nq-readonly', 'aria-readonly'] });
    scope.add(() => observer.disconnect());
  }
  render();
  return { get value() { return input.value; }, clear, setValue(value) { if (!scope.destroyed) { input.value = value; previous = value; render(); } }, destroy: () => scope.destroy() };
}
