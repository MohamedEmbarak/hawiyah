import { observeFieldValue, clampRange, createCleanup, formatNumber, isDisabled, normalizeDigits, normalizeSearch, requireText } from '@hawiyah/core';
import { emit, ensureId, eventElement, nativeChange, readOnly, remember, required, templated, text, validityMessage, writeText } from './dom.js';

export interface ValueController<T> { readonly value: T; destroy(): void }
/** showLabel and hideLabel are required. showLabel: the option, else the toggle's authored aria-label or text, else data-hw-show-label
 * on the toggle or the root. hideLabel: the option, else data-hw-hide-label on the toggle or the root. */
export interface PasswordFieldOptions { showLabel?: string; hideLabel?: string; toggleVariant?: 'icon' | 'text' }
export function createPasswordField(root: HTMLElement, options: PasswordFieldOptions = {}): { toggle(): void; destroy(): void } {
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
  const toggle = () => { if (scope.destroyed || isDisabled(input)) return; input.type = input.type === 'password' ? 'text' : 'password'; render(); emit(root, { visible: input.type === 'text' }); };
  scope.listen(button, 'click', toggle);
  if (input.form) scope.listen(input.form, 'reset', event => queueMicrotask(() => { if (!scope.destroyed && !event.defaultPrevented) { input.type = 'password'; render(); } }));
  const Observer = input.ownerDocument.defaultView?.MutationObserver;
  if (Observer) { const observer = new Observer(render); observer.observe(input, { attributes: true, attributeFilter: ['disabled'] }); scope.add(() => observer.disconnect()); }
  requireText('PasswordField', 'hideLabel', hide); render(); return { toggle, destroy: () => scope.destroy() };
}

/** The thumbs are named in markup (label or aria-label). `locale` (or data-hw-locale) formats the numbers in a [data-hw-range-output] element and is required when one is present; without it the controller warns in development and leaves the output empty. */
export interface RangeSliderOptions { min?: number; max?: number; locale?: string; onValueChange?: (value: [number, number]) => void }
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
  const render = () => {
    lower.max = String(value[1]);
    upper.min = String(value[0]);
    lower.value = String(value[0]);
    upper.value = String(value[1]);
    const locale = options.locale ?? root.dataset.hwLocale;
    if (output) output.textContent = requireText('RangeSlider', 'locale', locale, 'a [data-hw-range-output] element is present') ? `${formatNumber(value[0], { locale: locale! })} – ${formatNumber(value[1], { locale: locale! })}` : '';
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
  if (lower.form) scope.listen(lower.form, 'reset', event => queueMicrotask(() => {
    if (scope.destroyed || event.defaultPrevented) return;
    // Reset against the full range before reapplying the bounds between handles.
    // Otherwise the previous upper value could truncate the lower default.
    lower.max = String(max);
    upper.min = String(min);
    lower.value = lower.defaultValue;
    upper.value = upper.defaultValue;
    value = clampRange([lower.valueAsNumber, upper.valueAsNumber], min, max, 'lower');
    render();
  }));
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
  const form = inputs[0]?.form;
  if (form) scope.listen(form, 'reset', event => queueMicrotask(() => { if (!scope.destroyed && !event.defaultPrevented) value = selected(); }));
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
  remember(scope, input, ['type', 'inputmode', 'autocomplete', 'pattern', 'maxlength']); scope.add(() => { input.value = original; });
  input.type = 'text'; input.inputMode = 'numeric'; input.autocomplete = 'one-time-code'; input.pattern = `[0-9]{${length}}`; input.maxLength = length;
  const slots = [...root.querySelectorAll<HTMLElement>('[data-hw-pin-slot]')];
  slots.forEach(slot => { remember(scope, slot, ['aria-hidden']); const text = slot.textContent; scope.add(() => { slot.textContent = text; }); slot.setAttribute('aria-hidden', 'true'); });
  let composing = false;
  const render = (announce = false) => { input.value = normalizeDigits(input.value).replace(/\D/gu, '').slice(0, length); presence.refresh(); slots.forEach((slot, index) => { slot.textContent = input.value[index] || ''; }); if (announce) { emit(root, { value: input.value }); options.onValueChange?.(input.value); } };
  scope.listen(input, 'compositionstart', () => { composing = true; });
  scope.listen(input, 'compositionend', () => { composing = false; if (!isDisabled(input) && !input.readOnly) render(true); });
  scope.listen(input, 'input', () => { if (!composing && !isDisabled(input) && !input.readOnly) render(true); });
  if (input.form) scope.listen(input.form, 'reset', event => queueMicrotask(() => { if (!scope.destroyed && !event.defaultPrevented) render(); }));
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
  remember(scope, host, ['role']); remember(scope, input, ['name', 'required', 'aria-required']);
  scope.add(() => { host.replaceChildren(...children); input.value = originalInput; input.setCustomValidity(originalValidity); });
  host.setAttribute('role', 'list'); input.removeAttribute('name'); input.required = false; if (requiredValue) input.setAttribute('aria-required', 'true');
  const removeLabel = templated(root, 'getRemoveLabel', options.getRemoveLabel, (tag: string) => ({ tag }));
  requireText('TagInput', 'getRemoveLabel', options.getRemoveLabel ?? root.getAttribute('data-hw-remove-label'));
  if (requiredValue) requireText('TagInput', 'requiredMessage', text(root, 'requiredMessage', options.requiredMessage), 'required is set');
  const render = () => {
    host.replaceChildren();
    presence.refresh();
    const controlDisabled = input.disabled || input.getAttribute('aria-disabled') === 'true';
    const fieldsetDisabled = input.matches(':disabled');
    const syncDisabled = (peer: HTMLInputElement | HTMLButtonElement) => {
      // Controls in the same disabled fieldset already inherit its state synchronously.
      peer.disabled = controlDisabled || (fieldsetDisabled && !peer.matches(':disabled'));
    };
    value.forEach((tag, index) => {
      const chip = root.ownerDocument.createElement('span'); chip.className = 'hw-chip'; chip.setAttribute('role', 'listitem'); chip.append(root.ownerDocument.createTextNode(tag));
      host.append(chip);
      const remove = root.ownerDocument.createElement('button'); remove.type = 'button'; remove.dataset.hwRemoveTag = String(index);
      const glyph = root.ownerDocument.createElement('span'); glyph.className = 'hw-icon'; glyph.dataset.icon = 'cancel-01'; glyph.dataset.size = 'md'; glyph.setAttribute('aria-hidden', 'true'); remove.append(glyph);
      writeText(remove, 'aria-label', 'TagInput', 'getRemoveLabel', removeLabel(tag));
      chip.append(remove); syncDisabled(remove);
      if (readOnly(root, input)) remove.disabled = true;
      if (name) { const hidden = root.ownerDocument.createElement('input'); hidden.type = 'hidden'; hidden.name = name; hidden.value = tag; const form = input.getAttribute('form'); if (form) hidden.setAttribute('form', form); chip.append(hidden); syncDisabled(hidden); }
    });
    input.setCustomValidity(requiredValue && !value.length && input.getAttribute('aria-disabled') !== 'true' ? validityMessage('TagInput', 'requiredMessage', text(root, 'requiredMessage', options.requiredMessage), 'required is set') : originalValidity);
  };
  const notify = () => { render(); emit(root, { value: [...value] }); options.onValueChange?.([...value]); };
  const add = (tag: string) => { if (scope.destroyed || isDisabled(input) || readOnly(root, input)) return; const next = tag.trim(); if (!next || value.some(existing => normalizeSearch(existing) === normalizeSearch(next))) return; value.push(next); input.value = ''; notify(); };
  const remove = (tag: string) => { if (scope.destroyed || isDisabled(input) || readOnly(root, input)) return; const index = value.indexOf(tag); if (index < 0) return; value.splice(index, 1); notify(); input.focus(); };
  scope.listen(host, 'click', event => { const button = eventElement(event)?.closest<HTMLElement>('[data-hw-remove-tag]'); if (button) remove(value[Number(button.dataset.hwRemoveTag)] || ''); });
  scope.listen(input, 'compositionstart', () => { composing = true; }); scope.listen(input, 'compositionend', () => { composing = false; });
  scope.listen(input, 'keydown', event => {
    const key = event as KeyboardEvent; if (key.defaultPrevented || composing || key.isComposing || key.ctrlKey || key.metaKey || key.altKey || isDisabled(input) || readOnly(root, input)) return;
    if ((key.key === 'Enter' || key.key === ',') && input.value.trim()) { key.preventDefault(); add(input.value); }
    else if (key.key === 'Backspace' && !input.value && value.length) { key.preventDefault(); remove(value.at(-1)!); }
  });
  scope.listen(input, 'paste', event => { if (isDisabled(input) || readOnly(root, input)) return; const text = (event as ClipboardEvent).clipboardData?.getData('text') || ''; if (/[,\n]/u.test(text)) { event.preventDefault(); text.split(/[,\n]/u).forEach(add); } });
  if (input.form) scope.listen(input.form, 'reset', event => queueMicrotask(() => { if (!scope.destroyed && !event.defaultPrevented) { value = [...initial]; render(); } }));
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
  /** Live-region text with the filtered count (data-hw-results-message="{count} …"). Required when [data-hw-status] exists. */
  getResultsMessage?: (count: number) => string;
}
export function createMultiSelect(root: HTMLElement, options: MultiSelectOptions = {}): ValueController<string[]> {
  const search = required<HTMLInputElement>(root, '[data-hw-multiselect-search]');
  const items = [...root.querySelectorAll<HTMLElement>('[data-hw-option]')];
  const inputs = items.map(item => required<HTMLInputElement>(item, 'input[type="checkbox"]'));
  const scope = createCleanup(); const status = root.querySelector<HTMLElement>('[data-hw-status]'); const originalStatus = status?.textContent;
  const presence = observeFieldValue(search); scope.add(() => presence.destroy());
  items.forEach(item => remember(scope, item, ['hidden'])); if (status) scope.add(() => { status.textContent = originalStatus ?? ''; });
  const originalQuery = search.value; scope.add(() => { search.value = originalQuery; });
  const originalValidity = search.validity.customError ? search.validationMessage : '';
  const originalDisabled = inputs.map(input => input.getAttribute('aria-disabled'));
  remember(scope, search, ['aria-required']); inputs.forEach(input => remember(scope, input, ['aria-disabled']));
  scope.add(() => search.setCustomValidity(originalValidity));
  const values = () => inputs.filter(input => input.checked && !input.matches(':disabled')).map(input => input.value);
  const validate = () => {
    const requiredSelection = options.required ?? root.dataset.hwRequired === 'true';
    if (requiredSelection) search.setAttribute('aria-required', 'true'); else search.removeAttribute('aria-required');
    inputs.forEach((input, index) => { const value = readOnly(root) ? 'true' : originalDisabled[index]; if (value != null) input.setAttribute('aria-disabled', value); else input.removeAttribute('aria-disabled'); });
    search.setCustomValidity(requiredSelection && !isDisabled(search) && !values().length ? validityMessage('MultiSelect', 'requiredMessage', text(root, 'requiredMessage', options.requiredMessage), 'required is set') : originalValidity);
  };
  let selected = inputs.map(input => input.checked);
  const resultsMessage = templated(root, 'getResultsMessage', options.getResultsMessage, (count: number) => ({ count }));
  if (options.required ?? root.dataset.hwRequired === 'true') requireText('MultiSelect', 'requiredMessage', text(root, 'requiredMessage', options.requiredMessage), 'required is set');
  const filter = () => { const query = normalizeSearch(search.value); let count = 0; items.forEach(item => { item.hidden = !normalizeSearch(item.textContent || '').includes(query); if (!item.hidden) count++; }); if (status) { const message = resultsMessage(count); status.textContent = requireText('MultiSelect', 'getResultsMessage', message, 'the filtered count is announced') ? message! : ''; } validate(); };
  scope.listen(search, 'input', filter);
  scope.listen(root, 'click', event => { const target = eventElement(event); if (readOnly(root) && target?.matches('input[type="checkbox"], label')) event.preventDefault(); });
  scope.listen(root, 'change', event => { const index = inputs.indexOf(event.target as HTMLInputElement); if (index < 0) return; if (readOnly(root) || isDisabled(inputs[index]!)) { inputs[index]!.checked = selected[index]!; return; } selected = inputs.map(input => input.checked); validate(); const value = values(); emit(root, { value }); options.onValueChange?.(value); });
  if (search.form) scope.listen(search.form, 'reset', event => queueMicrotask(() => { if (!scope.destroyed && !event.defaultPrevented) { selected = inputs.map(input => input.checked); filter(); } }));
  const Observer = root.ownerDocument.defaultView?.MutationObserver;
  if (Observer) {
    const observer = new Observer(validate);
    observer.observe(root, { subtree: true, attributes: true, attributeFilter: ['disabled', 'data-hw-required', 'data-hw-readonly', 'aria-readonly'] });
    for (let parent = root.parentElement; parent; parent = parent.parentElement) if (parent.tagName === 'FIELDSET') observer.observe(parent, { attributes: true, attributeFilter: ['disabled'] });
    scope.add(() => observer.disconnect());
  }
  filter(); return { get value() { return values(); }, destroy: () => scope.destroy() };
}

export interface FileDropzoneOptions {
  maxSize?: number; onValueChange?: (files: File[]) => void;
  /** Status text after a selection (data-hw-selected-message="{count} …"). Required when [data-hw-file-status] exists. */
  getSelectedMessage?: (files: readonly File[]) => string;
  /** Error text when files are rejected (data-hw-rejected-message="{count} …"). Required when accept or maxSize is set. */
  getRejectedMessage?: (rejected: readonly File[]) => string;
  /** Status when the browser cannot assign dropped files to the input (data-hw-unsupported-drop-message). Without it the status is left unchanged. */
  unsupportedDropMessage?: string;
}
export function createFileDropzone(root: HTMLElement, options: FileDropzoneOptions = {}): ValueController<File[]> {
  const input = required<HTMLInputElement>(root, '[data-hw-file-input]');
  const scope = createCleanup(); const status = root.querySelector<HTMLElement>('[data-hw-file-status]'); const initialText = status?.textContent;
  const presence = observeFieldValue(input); scope.add(() => presence.destroy());
  remember(scope, root, ['data-dragover']); if (status) scope.add(() => { status.textContent = initialText ?? ''; });
  const maxSize = options.maxSize ?? Number(root.dataset.hwMaxSize || Infinity);
  const accepted = (file: File) => file.size <= maxSize && (!input.accept || input.accept.split(',').some(pattern => { const rule = pattern.trim().toLowerCase(); return rule.startsWith('.') ? file.name.toLowerCase().endsWith(rule) : rule.endsWith('/*') ? file.type.toLowerCase().startsWith(rule.slice(0, -1)) : file.type.toLowerCase() === rule; }));
  const selectedMessage = templated(root, 'getSelectedMessage', options.getSelectedMessage, (files: readonly File[]) => ({ count: files.length }));
  const rejectedMessage = templated(root, 'getRejectedMessage', options.getRejectedMessage, (files: readonly File[]) => ({ count: files.length }));
  const restricted = () => !!input.accept || Number.isFinite(maxSize);
  if (status) requireText('FileDropzone', 'getSelectedMessage', options.getSelectedMessage ?? root.getAttribute('data-hw-selected-message'), 'a selection status is rendered');
  if (status) requireText('FileDropzone', 'unsupportedDropMessage', text(root, 'unsupportedDropMessage', options.unsupportedDropMessage), 'a selection status is rendered');
  if (status && restricted()) requireText('FileDropzone', 'getRejectedMessage', options.getRejectedMessage ?? root.getAttribute('data-hw-rejected-message'), 'accept or maxSize is set');
  const announce = (rejectedFiles: readonly File[]) => {
    const value = [...(input.files || [])]; const rejected = rejectedFiles.length > 0;
    if (status) {
      const message = rejected ? rejectedMessage(rejectedFiles) : value.length ? selectedMessage(value) : '';
      status.textContent = (rejected || value.length > 0) && requireText('FileDropzone', rejected ? 'getRejectedMessage' : 'getSelectedMessage', message, rejected ? 'accept or maxSize is set' : 'a selection status is rendered') ? message! : '';
    }
    emit(root, { value, rejected }); options.onValueChange?.(value);
  };
  scope.listen(input, 'change', () => { const rejected = [...(input.files || [])].filter(file => !accepted(file)); if (rejected.length) input.value = ''; announce(rejected); });
  scope.listen(input, 'click', event => { if (readOnly(root)) event.preventDefault(); });
  scope.listen(root, 'dragover', event => { if (!isDisabled(input) && !readOnly(root)) { event.preventDefault(); root.setAttribute('data-dragover', ''); } });
  scope.listen(root, 'dragleave', event => { if (!root.contains((event as DragEvent).relatedTarget as Node | null)) root.removeAttribute('data-dragover'); });
  scope.listen(root, 'drop', event => {
    event.preventDefault(); root.removeAttribute('data-dragover'); if (isDisabled(input) || readOnly(root)) return;
    const files = [...((event as DragEvent).dataTransfer?.files || [])]; const selected = input.multiple ? files : files.slice(0, 1);
    const rejected = selected.filter(file => !accepted(file)); if (rejected.length) { input.value = ''; announce(rejected); return; }
    const Transfer = input.ownerDocument.defaultView?.DataTransfer; if (!Transfer) { const message = text(root, 'unsupportedDropMessage', options.unsupportedDropMessage); if (status && requireText('FileDropzone', 'unsupportedDropMessage', message, 'a selection status is rendered')) status.textContent = message!; return; }
    const transfer = new Transfer(); selected.forEach(file => transfer.items.add(file)); input.files = transfer.files; nativeChange(input);
  });
  if (input.form) scope.listen(input.form, 'reset', event => queueMicrotask(() => { if (!scope.destroyed && !event.defaultPrevented && status) status.textContent = ''; }));
  return { get value() { return [...(input.files || [])]; }, destroy: () => scope.destroy() };
}
