import { observeFieldValue, observeFormReset, sameValue, clampRange, createCleanup, formatNumber, isDisabled, normalizePinInput, normalizeSearch, prepareRemovalFocus, evaluateFileSelection, isFileDrag, requireText } from '@hawiyah/core';
import { emit, ensureId, eventElement, nativeChange, readOnly, remember, required, templated, text, validityMessage, writeText } from './dom.js';

export interface ValueController<T> { readonly value: T; destroy(): void }
/** showLabel and hideLabel are required. showLabel: the option, else the toggle's authored aria-label or text, else data-hw-show-label
 * on the toggle or the root. hideLabel: the option, else data-hw-hide-label on the toggle or the root. */
export interface PasswordFieldOptions {
  showLabel?: string; hideLabel?: string; toggleVariant?: 'icon' | 'text';
  /** Called with the new state after the toggle or a form reset changed the visibility (also as hw:change detail {visible}). */
  onVisibleChange?: (visible: boolean) => void;
}
export interface PasswordFieldController { readonly visible: boolean; toggle(): void; destroy(): void }
export function createPasswordField(root: HTMLElement, options: PasswordFieldOptions = {}): PasswordFieldController {
  const input = required<HTMLInputElement>(root, '[data-hw-password-input]');
  const button = required<HTMLButtonElement>(root, '[data-hw-password-toggle]');
  const scope = createCleanup();
  const presence = observeFieldValue(input); scope.add(() => presence.destroy());
  remember(scope, input, ['type']); remember(scope, button, ['aria-pressed', 'aria-label', 'aria-controls', 'type', 'disabled', 'class', 'data-toggle-variant']);
  const children = [...button.childNodes]; scope.add(() => button.replaceChildren(...children));
  const authored = button.getAttribute('aria-label')?.trim() || button.textContent?.trim() || undefined;
  const show = options.showLabel ?? authored ?? button.dataset.hwShowLabel ?? text(root, 'showLabel');
  const hide = options.hideLabel ?? button.dataset.hwHideLabel ?? text(root, 'hideLabel');
  const variant = options.toggleVariant ?? button.dataset.hwToggleVariant ?? root.dataset.hwToggleVariant ?? 'icon';
  button.type = 'button'; button.classList.add('hw-password-toggle'); button.setAttribute('aria-controls', ensureId(scope, input, 'password'));
  button.dataset.toggleVariant = variant === 'text' ? 'text' : 'icon';
  const render = () => {
    const visible = input.type === 'text'; button.setAttribute('aria-pressed', String(visible));
    const label = visible ? hide : show; const present = requireText('PasswordField', visible ? 'hideLabel' : 'showLabel', label);
    if (variant === 'text') button.textContent = present ? label! : '';
    else { const icon = input.ownerDocument.createElement('span'); icon.className = 'hw-password-icon'; icon.setAttribute('aria-hidden', 'true'); button.replaceChildren(icon); }
    if (present) button.setAttribute('aria-label', label!); else button.removeAttribute('aria-label'); button.disabled = isDisabled(input);
  };
  const notifyVisible = () => { const visible = input.type === 'text'; emit(root, { visible }); options.onVisibleChange?.(visible); };
  const toggle = () => { if (scope.destroyed || isDisabled(input)) return; input.type = input.type === 'password' ? 'text' : 'password'; render(); notifyVisible(); };
  scope.listen(button, 'click', toggle);
  const reset = observeFormReset(input, () => { if (scope.destroyed) return; const wasVisible = input.type === 'text'; input.type = 'password'; render(); if (wasVisible) notifyVisible(); });
  scope.add(() => reset.destroy());
  const Observer = input.ownerDocument.defaultView?.MutationObserver;
  if (Observer) { const observer = new Observer(render); observer.observe(input, { attributes: true, attributeFilter: ['disabled'] }); scope.add(() => observer.disconnect()); }
  requireText('PasswordField', 'hideLabel', hide); render(); return { get visible() { return input.type === 'text'; }, toggle, destroy: () => scope.destroy() };
}

/** The thumbs are named in markup (label or aria-label). */
export interface RangeSliderOptions {
  min?: number; max?: number; onValueChange?: (value: [number, number]) => void;
  /** Optional locale (data-hw-locale) for the numbers of the range label when formatValue is not given. */
  locale?: string;
  /** Text of one thumb's value, written as its aria-valuetext. Without it the inputs have no aria-valuetext. */
  formatValue?: (value: number) => string;
  /** Visible text of a [data-hw-range-output] element (data-hw-range-label="{lower} – {upper}"). Required when the output is present. */
  getRangeLabel?: (lower: number, upper: number) => string;
}
export function createRangeSlider(root: HTMLElement, options: RangeSliderOptions = {}): ValueController<[number, number]> {
  const lower = required<HTMLInputElement>(root, '[data-hw-lower]');
  const upper = required<HTMLInputElement>(root, '[data-hw-upper]');
  const scope = createCleanup();
  const min = options.min ?? Math.max(Number(lower.min || 0), Number(upper.min || 0));
  const max = options.max ?? Math.min(Number(lower.max || 100), Number(upper.max || 100));
  let value = clampRange([lower.valueAsNumber, upper.valueAsNumber], min, max, 'lower');
  for (const input of [lower, upper]) { const original = input.value; scope.add(() => { input.value = original; }); remember(scope, input, ['min', 'max', 'aria-valuetext', 'aria-readonly']); input.min = String(min); input.max = String(max); }
  const readonlyState = () => { for (const input of [lower, upper]) { if (readOnly(root)) input.setAttribute('aria-readonly', 'true'); else input.removeAttribute('aria-readonly'); } };
  const output = root.querySelector<HTMLOutputElement>('[data-hw-range-output]');
  const originalText = output?.textContent; if (output) scope.add(() => { output.textContent = originalText ?? ''; });
  const shown = (number: number) => { const locale = options.locale ?? root.dataset.hwLocale; return options.formatValue ? options.formatValue(number) : locale ? formatNumber(number, { locale }) : String(number); };
  const rangeLabel = templated(root, 'getRangeLabel', options.getRangeLabel, (low: number, high: number) => ({ lower: shown(low), upper: shown(high) }));
  const render = () => {
    lower.max = String(value[1]);
    upper.min = String(value[0]);
    lower.value = String(value[0]);
    upper.value = String(value[1]);
    [lower, upper].forEach((input, index) => { if (options.formatValue) input.setAttribute('aria-valuetext', options.formatValue(value[index]!)); });
    if (output) { const label = rangeLabel(value[0], value[1]); output.textContent = requireText('RangeSlider', 'getRangeLabel', label, 'a [data-hw-range-output] element is present') ? label! : ''; }
  };
  const update = (changed: 'lower' | 'upper') => {
    if (readOnly(root) || isDisabled(changed === 'lower' ? lower : upper)) { render(); return; }
    value = clampRange([lower.valueAsNumber, upper.valueAsNumber], min, max, changed); render(); emit(root, { value: [...value] }); options.onValueChange?.([...value]);
  };
  for (const [input, changed] of [[lower, 'lower'], [upper, 'upper']] as const) {
    scope.listen(input, 'input', () => update(changed));
    scope.listen(input, 'keydown', event => {
      // Block value changes, while leaving Tab, Escape and browser shortcuts native.
      if (readOnly(root) && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes((event as KeyboardEvent).key)) event.preventDefault();
    });
    scope.listen(input, 'pointerdown', event => { if (readOnly(root)) event.preventDefault(); });
  }
  const reset = observeFormReset(lower, () => {
    if (scope.destroyed) return;
    const previous = value;
    // Reset against the full range before reapplying the bounds between handles.
    // Otherwise the previous upper value could truncate the lower default.
    lower.max = String(max);
    upper.min = String(min);
    lower.value = lower.defaultValue;
    upper.value = upper.defaultValue;
    value = clampRange([lower.valueAsNumber, upper.valueAsNumber], min, max, 'lower');
    render();
    if (!sameValue(previous, value)) { emit(root, { value: [...value] }); options.onValueChange?.([...value]); }
  });
  scope.add(() => reset.destroy());
  const Observer = root.ownerDocument.defaultView?.MutationObserver;
  if (Observer) { const observer = new Observer(readonlyState); observer.observe(root, { attributes: true, attributeFilter: ['data-hw-readonly', 'aria-readonly'] }); scope.add(() => observer.disconnect()); }
  readonlyState(); render(); return { get value(): [number, number] { return [...value]; }, destroy: () => scope.destroy() };
}

export interface RatingOptions { onValueChange?: (value: number) => void }
/** Native radios own selection, keyboard navigation and form values. Enhancement adds readonly guards. */
export function createRating(root: HTMLElement, options: RatingOptions = {}): ValueController<number> {
  const inputs = [...root.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
  if (!inputs.length) throw new Error('Hawiyah: Rating requires native radio inputs.');
  const scope = createCleanup();
  const selected = () => Number(inputs.find(input => input.checked)?.value ?? 0);
  let value = selected();
  const restore = () => inputs.forEach(input => { input.checked = Number(input.value) === value; });
  const readonlyState = () => inputs.forEach(input => { if (readOnly(root)) input.setAttribute('aria-disabled', 'true'); else input.removeAttribute('aria-disabled'); });
  for (const input of inputs) {
    const checked = input.checked;
    remember(scope, input, ['aria-disabled']); scope.add(() => { input.checked = checked; });
    scope.listen(input, 'click', event => { if (readOnly(root)) { event.preventDefault(); restore(); } });
    scope.listen(input, 'keydown', event => {
      if (readOnly(root) && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes((event as KeyboardEvent).key)) event.preventDefault();
    });
    scope.listen(input, 'change', () => {
      if (readOnly(root) || isDisabled(input)) { restore(); return; }
      value = selected(); emit(root, { value }); options.onValueChange?.(value);
    });
  }
  const reset = observeFormReset(inputs[0]!, () => {
    if (scope.destroyed) return;
    const previous = value; value = selected();
    if (previous !== value) { emit(root, { value }); options.onValueChange?.(value); }
  });
  scope.add(() => reset.destroy());
  const Observer = root.ownerDocument.defaultView?.MutationObserver;
  if (Observer) { const observer = new Observer(readonlyState); observer.observe(root, { attributes: true, attributeFilter: ['data-hw-readonly', 'aria-readonly'] }); scope.add(() => observer.disconnect()); }
  readonlyState();
  return { get value() { return value; }, destroy: () => scope.destroy() };
}

export interface PinInputOptions { length?: number; onValueChange?: (value: string) => void }
export function createPinInput(root: HTMLElement, options: PinInputOptions = {}): ValueController<string> {
  const input = required<HTMLInputElement>(root, '[data-hw-pin-input]');
  const length = options.length ?? (input.maxLength > 0 ? input.maxLength : 6);
  if (!Number.isInteger(length) || length < 1) throw new RangeError('Hawiyah: PIN length must be positive.');
  const scope = createCleanup(); const original = input.value;
  const presence = observeFieldValue(input); scope.add(() => presence.destroy());
  remember(scope, input, ['type', 'inputmode', 'autocomplete', 'pattern', 'maxlength', 'aria-invalid']); scope.add(() => { input.value = original; });
  // No maxlength: a pasted code with separators is normalised before the length applies.
  input.type = 'text'; input.inputMode = 'numeric'; input.autocomplete = 'one-time-code'; input.pattern = `[0-9]{${length}}`; input.removeAttribute('maxlength');
  const authoredInvalid = input.getAttribute('aria-invalid'); let incomplete = false; let failed = false;
  const applyInvalid = () => { if (incomplete || failed) input.setAttribute('aria-invalid', 'true'); else if (authoredInvalid === null) input.removeAttribute('aria-invalid'); else input.setAttribute('aria-invalid', authoredInvalid); };
  const settleInvalid = () => { const size = input.value.length; if (incomplete && (size === 0 || size === length)) incomplete = false; if (failed && input.validity.valid) failed = false; applyInvalid(); };
  const slots = [...root.querySelectorAll<HTMLElement>('[data-hw-pin-slot]')];
  slots.forEach(slot => { remember(scope, slot, ['aria-hidden']); const text = slot.textContent; scope.add(() => { slot.textContent = text; }); slot.setAttribute('aria-hidden', 'true'); });
  let composing = false;
  let last = '';
  const notify = () => { if (input.value === last) return; last = input.value; emit(root, { value: last }); options.onValueChange?.(last); };
  const render = (announce = false, inputType?: string) => { input.value = normalizePinInput(input.value, length, last, inputType); presence.refresh(); slots.forEach((slot, index) => { slot.textContent = input.value[index] || ''; }); settleInvalid(); if (announce) notify(); else last = input.value; };
  scope.listen(input, 'compositionstart', () => { composing = true; });
  scope.listen(input, 'compositionend', () => { composing = false; if (!isDisabled(input) && !input.readOnly) render(true); });
  scope.listen(input, 'input', event => { if (!composing && !isDisabled(input) && !input.readOnly) render(true, (event as InputEvent).inputType); });
  scope.listen(input, 'blur', () => { const size = input.value.length; incomplete = size > 0 && size < length; applyInvalid(); });
  scope.listen(input, 'invalid', () => { failed = true; applyInvalid(); });
  const reset = observeFormReset(input, () => { if (scope.destroyed) return; incomplete = false; failed = false; render(true); });
  scope.add(() => reset.destroy());
  render(); return { get value() { return input.value; }, destroy: () => scope.destroy() };
}

export interface TagInputOptions {
  value?: readonly string[]; name?: string; onValueChange?: (values: string[]) => void;
  /** Accessible name of a tag's remove button (data-hw-remove-label="… {tag}"). Required. */
  getRemoveLabel?: (tag: string) => string;
  /** Custom validity message while a required tag input is empty (data-hw-required-message). Required when the input is required. */
  requiredMessage?: string;
}
export function createTagInput(root: HTMLElement, options: TagInputOptions = {}): ValueController<string[]> & { add(value: string): void; remove(value: string): void } {
  const input = required<HTMLInputElement>(root, '[data-hw-tag-input]');
  const host = required<HTMLElement>(root, '[data-hw-tags]');
  const source: unknown = options.value ?? JSON.parse(root.dataset.hwValue || '[]');
  if (!Array.isArray(source) || source.some(value => typeof value !== 'string')) throw new TypeError('Hawiyah: tag values must be a string array.');
  const initial = [...new Set((source as string[]).map(value => value.trim()).filter(Boolean))];
  let value = [...initial]; let composing = false;
  const scope = createCleanup(); const children = [...host.childNodes]; const originalInput = input.value;
  const presence = observeFieldValue(input); scope.add(() => presence.destroy());
  const originalValidity = input.validity.customError ? input.validationMessage : ''; const requiredValue = input.required;
  const name = options.name ?? root.dataset.hwName ?? input.name;
  remember(scope, host, ['role']); remember(scope, input, ['name', 'required', 'aria-required', 'aria-invalid']);
  scope.add(() => { host.replaceChildren(...children); input.value = originalInput; input.setCustomValidity(originalValidity); });
  host.setAttribute('role', 'list'); host.replaceChildren(); input.removeAttribute('name'); input.required = false; if (requiredValue) input.setAttribute('aria-required', 'true');
  const removeLabel = templated(root, 'getRemoveLabel', options.getRemoveLabel, (tag: string) => ({ tag }));
  requireText('TagInput', 'getRemoveLabel', options.getRemoveLabel ?? root.getAttribute('data-hw-remove-label'));
  if (requiredValue) requireText('TagInput', 'requiredMessage', text(root, 'requiredMessage', options.requiredMessage), 'required is set');
  // A failed submission marks the input invalid until its validity is valid again or the form resets.
  const authoredInvalid = input.getAttribute('aria-invalid'); let failed = false;
  const applyInvalid = () => { if (failed) input.setAttribute('aria-invalid', 'true'); else if (authoredInvalid === null) input.removeAttribute('aria-invalid'); else input.setAttribute('aria-invalid', authoredInvalid); };
  // Chips are kept per tag, so a removal leaves the other remove buttons (and focus on them) in place.
  const chipElement = host.localName === 'ul' || host.localName === 'ol' ? 'li' : 'span';
  const chips = new Map<string, { chip: HTMLElement; remove: HTMLButtonElement; hidden?: HTMLInputElement }>();
  const chipFor = (tag: string) => {
    const existing = chips.get(tag); if (existing) return existing;
    const document = root.ownerDocument; const chip = document.createElement(chipElement); chip.className = 'hw-chip'; if (chipElement === 'span') chip.setAttribute('role', 'listitem'); chip.append(document.createTextNode(tag));
    const remove = document.createElement('button'); remove.type = 'button';
    const glyph = document.createElement('span'); glyph.className = 'hw-icon'; glyph.dataset.icon = 'cancel-01'; glyph.dataset.size = 'md'; glyph.setAttribute('aria-hidden', 'true'); remove.append(glyph); chip.append(remove);
    let hidden: HTMLInputElement | undefined;
    if (name) { hidden = document.createElement('input'); hidden.type = 'hidden'; hidden.name = name; hidden.value = tag; const form = input.getAttribute('form'); if (form) hidden.setAttribute('form', form); chip.append(hidden); }
    const entry = { chip, remove, hidden }; chips.set(tag, entry); return entry;
  };
  const render = () => {
    presence.refresh();
    const controlDisabled = input.disabled || input.getAttribute('aria-disabled') === 'true';
    const fieldsetDisabled = input.matches(':disabled');
    const syncDisabled = (peer: HTMLInputElement | HTMLButtonElement) => {
      // Controls in the same disabled fieldset already inherit its state synchronously.
      peer.disabled = controlDisabled || (fieldsetDisabled && !peer.matches(':disabled'));
    };
    for (const tag of [...chips.keys()]) if (!value.includes(tag)) chips.delete(tag);
    value.forEach((tag, index) => {
      const { chip, remove, hidden } = chipFor(tag);
      if (host.children[index] !== chip) host.insertBefore(chip, host.children[index] ?? null);
      remove.dataset.hwRemoveTag = String(index);
      writeText(remove, 'aria-label', 'TagInput', 'getRemoveLabel', removeLabel(tag));
      syncDisabled(remove); if (readOnly(root, input)) remove.disabled = true;
      if (hidden) syncDisabled(hidden);
    });
    while (host.children.length > value.length) host.lastElementChild!.remove();
    input.setCustomValidity(requiredValue && !value.length && input.getAttribute('aria-disabled') !== 'true' ? validityMessage('TagInput', 'requiredMessage', text(root, 'requiredMessage', options.requiredMessage), 'required is set') : originalValidity);
    if (failed && input.validity.valid) { failed = false; applyInvalid(); }
  };
  const notify = () => { render(); emit(root, { value: [...value] }); options.onValueChange?.([...value]); };
  const add = (tag: string) => { if (scope.destroyed || isDisabled(input) || readOnly(root, input)) return; const next = tag.trim(); if (!next || value.some(existing => normalizeSearch(existing) === normalizeSearch(next))) return; value.push(next); input.value = ''; notify(); };
  const removeTag = (tag: string, button?: HTMLElement) => {
    if (scope.destroyed || isDisabled(input) || readOnly(root, input)) return; const index = value.indexOf(tag); if (index < 0) return;
    // A remove button hands focus to its neighbour's button, else to the text input.
    const restore = button ? prepareRemovalFocus(root, button, { item: '.hw-chip', control: 'button', fallback: input }) : undefined;
    value.splice(index, 1); notify(); if (restore) restore(); else input.focus();
  };
  const remove = (tag: string) => removeTag(tag);
  scope.listen(host, 'click', event => { const button = eventElement(event)?.closest<HTMLElement>('[data-hw-remove-tag]'); if (button) removeTag(value[Number(button.dataset.hwRemoveTag)] || '', button); });
  scope.listen(input, 'compositionstart', () => { composing = true; }); scope.listen(input, 'compositionend', () => { composing = false; });
  scope.listen(input, 'keydown', event => {
    const key = event as KeyboardEvent; if (key.defaultPrevented || composing || key.isComposing || key.ctrlKey || key.metaKey || key.altKey || isDisabled(input) || readOnly(root, input)) return;
    if ((key.key === 'Enter' || key.key === ',') && input.value.trim()) { key.preventDefault(); add(input.value); }
    else if (key.key === 'Backspace' && !input.value && value.length) { key.preventDefault(); remove(value.at(-1)!); }
  });
  scope.listen(input, 'paste', event => { if (isDisabled(input) || readOnly(root, input)) return; const text = (event as ClipboardEvent).clipboardData?.getData('text') || ''; if (/[,\n]/u.test(text)) { event.preventDefault(); text.split(/[,\n]/u).forEach(add); } });
  scope.listen(input, 'invalid', () => { failed = true; applyInvalid(); });
  const reset = observeFormReset(input, () => {
    if (scope.destroyed) return;
    const previous = value; value = [...initial]; input.value = ''; failed = false; applyInvalid(); render();
    if (!sameValue(previous, value)) { emit(root, { value: [...value] }); options.onValueChange?.([...value]); }
  });
  scope.add(() => reset.destroy());
  const Observer = input.ownerDocument.defaultView?.MutationObserver;
  if (Observer) {
    const observer = new Observer(render);
    observer.observe(input, { attributes: true, attributeFilter: ['disabled', 'aria-disabled', 'readonly'] });
    for (let ancestor = input.parentElement; ancestor; ancestor = ancestor.parentElement) {
      if (ancestor.localName === 'fieldset') observer.observe(ancestor, { attributes: true, attributeFilter: ['disabled'] });
    }
    scope.add(() => observer.disconnect());
  }
  render(); return { get value() { return [...value]; }, add, remove, destroy: () => scope.destroy() };
}

export interface MultiSelectOptions {
  required?: boolean; onValueChange?: (values: string[]) => void;
  /** Custom validity message while a required multi-select has no selection (data-hw-required-message). Required when required is set. */
  requiredMessage?: string;
  /** Live-region text with the number of rows shown after the reader filters (data-hw-results-message="{count} …"). Required. */
  getResultsMessage?: (count: number) => string;
  /** Text of an authored [data-hw-selected-status] element with the number of selected options (data-hw-selected-message="{count} …"). Optional. */
  getSelectedMessage?: (count: number) => string;
}
export function createMultiSelect(root: HTMLElement, options: MultiSelectOptions = {}): ValueController<string[]> {
  const search = required<HTMLInputElement>(root, '[data-hw-multiselect-search]');
  const items = [...root.querySelectorAll<HTMLElement>('[data-hw-option]')];
  const inputs = items.map(item => required<HTMLInputElement>(item, 'input[type="checkbox"]'));
  const scope = createCleanup();
  let status = root.querySelector<HTMLElement>('[data-hw-status]');
  if (!status) {
    status = root.ownerDocument.createElement('span'); status.className = 'hw-sr-only'; status.dataset.hwStatus = ''; root.append(status);
    const generated = status; scope.add(() => generated.remove());
  } else { const authored = status; const originalStatus = authored.textContent; scope.add(() => { authored.textContent = originalStatus; }); }
  const liveStatus = status;
  remember(scope, liveStatus, ['role', 'aria-live', 'aria-atomic']); liveStatus.setAttribute('role', 'status'); liveStatus.setAttribute('aria-live', 'polite'); liveStatus.setAttribute('aria-atomic', 'true');
  const selectedStatus = root.querySelector<HTMLElement>('[data-hw-selected-status]'); const originalSelected = selectedStatus?.textContent;
  if (selectedStatus) scope.add(() => { selectedStatus.textContent = originalSelected ?? ''; });
  const presence = observeFieldValue(search); scope.add(() => presence.destroy());
  items.forEach(item => remember(scope, item, ['hidden']));
  const originalQuery = search.value; scope.add(() => { search.value = originalQuery; });
  const originalValidity = search.validity.customError ? search.validationMessage : '';
  const originalDisabled = inputs.map(input => input.getAttribute('aria-disabled'));
  remember(scope, search, ['aria-required', 'aria-invalid']); remember(scope, root, ['aria-invalid']); inputs.forEach(input => remember(scope, input, ['aria-disabled']));
  scope.add(() => search.setCustomValidity(originalValidity));
  // A failed submission marks the filter input and the root invalid until a selection makes it valid or the form resets.
  const authoredInvalid = [search.getAttribute('aria-invalid'), root.getAttribute('aria-invalid')] as const; let failed = false;
  const applyInvalid = () => [search, root].forEach((element, index) => { const authored = authoredInvalid[index]; if (failed) element.setAttribute('aria-invalid', 'true'); else if (authored == null) element.removeAttribute('aria-invalid'); else element.setAttribute('aria-invalid', authored); });
  const values = () => inputs.filter(input => input.checked && !input.matches(':disabled')).map(input => input.value);
  const selectedMessage = templated(root, 'getSelectedMessage', options.getSelectedMessage, (count: number) => ({ count }));
  const showSelected = () => { if (!selectedStatus) return; const message = selectedMessage(values().length); if (message !== undefined) selectedStatus.textContent = message; };
  const validate = () => {
    const requiredSelection = options.required ?? root.dataset.hwRequired === 'true';
    if (requiredSelection) search.setAttribute('aria-required', 'true'); else search.removeAttribute('aria-required');
    inputs.forEach((input, index) => { const value = readOnly(root) ? 'true' : originalDisabled[index]; if (value != null) input.setAttribute('aria-disabled', value); else input.removeAttribute('aria-disabled'); });
    search.setCustomValidity(requiredSelection && !isDisabled(search) && !values().length ? validityMessage('MultiSelect', 'requiredMessage', text(root, 'requiredMessage', options.requiredMessage), 'required is set') : originalValidity);
    if (failed && search.validity.valid) { failed = false; applyInvalid(); }
  };
  let selected = inputs.map(input => input.checked); let lastValue = values();
  const resultsMessage = templated(root, 'getResultsMessage', options.getResultsMessage, (count: number) => ({ count }));
  requireText('MultiSelect', 'getResultsMessage', options.getResultsMessage ?? root.getAttribute('data-hw-results-message'));
  if (options.required ?? root.dataset.hwRequired === 'true') requireText('MultiSelect', 'requiredMessage', text(root, 'requiredMessage', options.requiredMessage), 'required is set');
  const filter = (announce = false) => {
    const query = normalizeSearch(search.value); let count = 0; items.forEach(item => { item.hidden = !normalizeSearch(item.textContent || '').includes(query); if (!item.hidden) count++; });
    if (announce) { const message = resultsMessage(count); liveStatus.textContent = requireText('MultiSelect', 'getResultsMessage', message) ? message! : ''; }
    validate();
  };
  scope.listen(search, 'input', () => filter(true));
  scope.listen(search, 'invalid', () => { failed = true; applyInvalid(); });
  scope.listen(root, 'click', event => { const target = eventElement(event); if (readOnly(root) && target?.matches('input[type="checkbox"], label')) event.preventDefault(); });
  scope.listen(root, 'change', event => { const index = inputs.indexOf(event.target as HTMLInputElement); if (index < 0) return; if (readOnly(root) || isDisabled(inputs[index]!)) { inputs[index]!.checked = selected[index]!; return; } selected = inputs.map(input => input.checked); validate(); showSelected(); const value = values(); lastValue = value; emit(root, { value }); options.onValueChange?.(value); });
  const reset = observeFormReset(search, () => {
    if (scope.destroyed) return;
    selected = inputs.map(input => input.checked); search.value = ''; presence.refresh(); liveStatus.textContent = ''; failed = false; applyInvalid(); filter(); showSelected();
    const value = values(); if (!sameValue(lastValue, value)) { lastValue = value; emit(root, { value }); options.onValueChange?.(value); }
  });
  scope.add(() => reset.destroy());
  const Observer = root.ownerDocument.defaultView?.MutationObserver;
  if (Observer) {
    const observer = new Observer(validate);
    observer.observe(root, { subtree: true, attributes: true, attributeFilter: ['disabled', 'data-hw-required', 'data-hw-readonly', 'aria-readonly'] });
    for (let parent = root.parentElement; parent; parent = parent.parentElement) if (parent.tagName === 'FIELDSET') observer.observe(parent, { attributes: true, attributeFilter: ['disabled'] });
    scope.add(() => observer.disconnect());
  }
  filter(); showSelected(); return { get value() { return values(); }, destroy: () => scope.destroy() };
}

export interface FileDropzoneOptions {
  maxSize?: number; onValueChange?: (files: File[]) => void;
  /** Called once with the rejected files of a batch; the dropzone then holds no file. */
  onReject?: (files: File[]) => void;
  /** Status text after a selection (data-hw-selected-message="{count} …"). Required when [data-hw-file-status] exists. */
  getSelectedMessage?: (files: readonly File[]) => string;
  /** Error text when files are rejected (data-hw-rejected-message="{count} …"), shown in [data-hw-error] or a created p.hw-error. Required when accept or maxSize is set. */
  getRejectedMessage?: (rejected: readonly File[]) => string;
  /** Status when the browser cannot assign dropped files to the input (data-hw-unsupported-drop-message). Without it the status is left unchanged. */
  unsupportedDropMessage?: string;
}
export function createFileDropzone(root: HTMLElement, options: FileDropzoneOptions = {}): ValueController<File[]> {
  const input = required<HTMLInputElement>(root, '[data-hw-file-input]');
  const scope = createCleanup(); const status = root.querySelector<HTMLElement>('[data-hw-file-status]'); const initialText = status?.textContent;
  const presence = observeFieldValue(input); scope.add(() => presence.destroy());
  remember(scope, root, ['data-state']); remember(scope, input, ['aria-disabled', 'aria-invalid', 'aria-describedby']);
  if (status) scope.add(() => { status.textContent = initialText ?? ''; });
  const authoredState = root.getAttribute('data-state'); const authoredInvalid = input.getAttribute('aria-invalid'); const authoredDescribedBy = input.getAttribute('aria-describedby');
  // An authored [data-hw-error] that already holds text is the application's error: it wins over a rejection and keeps no role.
  const authoredError = root.querySelector<HTMLElement>('[data-hw-error]'); const authoredErrorText = authoredError?.textContent ?? '';
  if (authoredError) { remember(scope, authoredError, ['role']); scope.add(() => { authoredError.textContent = authoredErrorText; }); }
  let createdError: HTMLElement | undefined; scope.add(() => createdError?.remove());
  const maxSize = () => options.maxSize ?? Number(root.dataset.hwMaxSize || Infinity);
  const evaluate = (files: readonly File[]) => evaluateFileSelection(files, { accept: input.accept, multiple: input.multiple, maxSize: maxSize() });
  const selectedMessage = templated(root, 'getSelectedMessage', options.getSelectedMessage, (files: readonly File[]) => ({ count: files.length }));
  const rejectedMessage = templated(root, 'getRejectedMessage', options.getRejectedMessage, (files: readonly File[]) => ({ count: files.length }));
  const restricted = () => !!input.accept || Number.isFinite(maxSize());
  if (status) requireText('FileDropzone', 'getSelectedMessage', options.getSelectedMessage ?? root.getAttribute('data-hw-selected-message'), 'a selection status is rendered');
  if (status) requireText('FileDropzone', 'unsupportedDropMessage', text(root, 'unsupportedDropMessage', options.unsupportedDropMessage), 'a selection status is rendered');
  if (restricted()) requireText('FileDropzone', 'getRejectedMessage', options.getRejectedMessage ?? root.getAttribute('data-hw-rejected-message'), 'accept or maxSize is set');
  let rejection = false; let held = [...(input.files || [])];
  const restoreState = () => { if (rejection) root.setAttribute('data-state', 'error'); else if (authoredState === null) root.removeAttribute('data-state'); else root.setAttribute('data-state', authoredState); };
  const describe = (id?: string) => { const ids = [...new Set([...(authoredDescribedBy ?? '').split(/\s+/u).filter(Boolean), ...(id ? [id] : [])])]; if (ids.length) input.setAttribute('aria-describedby', ids.join(' ')); else input.removeAttribute('aria-describedby'); };
  const clearError = () => {
    rejection = false; restoreState(); describe();
    if (authoredInvalid === null) input.removeAttribute('aria-invalid'); else input.setAttribute('aria-invalid', authoredInvalid);
    createdError?.remove(); createdError = undefined;
    if (authoredError && !authoredErrorText.trim()) { authoredError.textContent = authoredErrorText; authoredError.removeAttribute('role'); }
  };
  const showError = (files: readonly File[]) => {
    clearError(); rejection = true; restoreState(); input.setAttribute('aria-invalid', 'true');
    if (authoredError && authoredErrorText.trim()) { describe(ensureId(scope, authoredError, 'file-error')); return; }
    const message = rejectedMessage(files);
    if (!requireText('FileDropzone', 'getRejectedMessage', message, restricted() ? 'accept or maxSize is set' : 'a selection was rejected')) return;
    let target = authoredError;
    if (!target) {
      target = root.ownerDocument.createElement('p'); target.className = 'hw-error'; createdError = target;
      const hint = [...root.children].reverse().find(child => child.classList.contains('hw-hint'));
      if (hint) hint.after(target); else root.append(target);
    }
    target.textContent = message!; target.setAttribute('role', 'alert'); describe(ensureId(scope, target, 'file-error'));
  };
  const announce = (rejectedFiles: File[]) => {
    const value = [...(input.files || [])]; const rejected = rejectedFiles.length > 0; const changed = !sameValue(held, value); held = value;
    if (status) {
      const message = !rejected && value.length ? selectedMessage(value) : '';
      status.textContent = !rejected && value.length > 0 && requireText('FileDropzone', 'getSelectedMessage', message, 'a selection status is rendered') ? message! : '';
    }
    if (!rejected && !changed) return;
    emit(root, { value, rejected, rejectedFiles }); if (rejected) options.onReject?.(rejectedFiles); if (changed) options.onValueChange?.(value);
  };
  const reject = (files: File[]) => { input.value = ''; presence.refresh(); showError(files); announce(files); };
  const blocked = () => isDisabled(input) || readOnly(root);
  scope.listen(input, 'change', () => { const result = evaluate([...(input.files || [])]); if (result.rejected.length) { reject(result.rejected); return; } clearError(); announce([]); });
  scope.listen(input, 'click', event => { if (readOnly(root)) event.preventDefault(); });
  scope.listen(input, 'keydown', event => { const key = (event as KeyboardEvent).key; if (readOnly(root) && (key === ' ' || key === 'Enter')) event.preventDefault(); });
  const clearDragging = () => { if (root.getAttribute('data-state') === 'dragging') restoreState(); };
  scope.listen(root, 'dragover', event => {
    const transfer = (event as DragEvent).dataTransfer; if (!isFileDrag(transfer)) return;
    event.preventDefault(); const unavailable = blocked(); if (transfer) transfer.dropEffect = unavailable ? 'none' : 'copy';
    if (unavailable) clearDragging(); else root.setAttribute('data-state', 'dragging');
  });
  scope.listen(root, 'dragleave', event => { if (!root.contains((event as DragEvent).relatedTarget as Node | null)) clearDragging(); });
  scope.listen(root, 'drop', event => {
    event.preventDefault(); clearDragging(); if (blocked()) return;
    const list = (event as DragEvent).dataTransfer?.files; const files = [...(list || [])]; if (!files.length) return;
    const result = evaluate(files); if (result.rejected.length) { reject(result.rejected); return; }
    try { input.files = list!; } catch { /* The browser refused the assignment. */ }
    if ((input.files?.length ?? 0) !== files.length) { const message = text(root, 'unsupportedDropMessage', options.unsupportedDropMessage); if (status && requireText('FileDropzone', 'unsupportedDropMessage', message, 'a selection status is rendered')) status.textContent = message!; return; }
    nativeChange(input);
  });
  const reset = observeFormReset(input, () => {
    if (scope.destroyed) return;
    clearError(); if (status) status.textContent = '';
    const value = [...(input.files || [])]; if (!sameValue(held, value)) { held = value; emit(root, { value, rejected: false, rejectedFiles: [] }); options.onValueChange?.(value); }
  });
  scope.add(() => reset.destroy());
  const authoredDisabled = input.getAttribute('aria-disabled');
  const syncReadonly = () => { if (readOnly(root)) input.setAttribute('aria-disabled', 'true'); else if (authoredDisabled === null) input.removeAttribute('aria-disabled'); else input.setAttribute('aria-disabled', authoredDisabled); };
  const Observer = root.ownerDocument.defaultView?.MutationObserver;
  if (Observer) { const observer = new Observer(syncReadonly); observer.observe(root, { attributes: true, attributeFilter: ['data-hw-readonly', 'aria-readonly'] }); scope.add(() => observer.disconnect()); }
  syncReadonly();
  return { get value() { return [...(input.files || [])]; }, destroy: () => scope.destroy() };
}
