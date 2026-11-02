import { clampRange, createCleanup, formatNumber, isDisabled, normalizeDigits, normalizeSearch } from '@nasaq/core';
import { emit, ensureId, eventElement, localeOf, nativeChange, readOnly, remember, required, translated } from './dom.js';

export interface ValueController<T> { readonly value: T; destroy(): void }
export interface PasswordFieldOptions { showLabel?: string; hideLabel?: string; toggleVariant?: 'icon' | 'text' }
export function createPasswordField(root: HTMLElement, options: PasswordFieldOptions = {}): { toggle(): void; destroy(): void } {
  const input = required<HTMLInputElement>(root, '[data-nq-password-input]');
  const button = required<HTMLButtonElement>(root, '[data-nq-password-toggle]');
  const scope = createCleanup();
  remember(scope, input, ['type']); remember(scope, button, ['aria-pressed', 'aria-label', 'aria-controls', 'type', 'disabled', 'class', 'data-toggle-variant']);
  const children = [...button.childNodes]; scope.add(() => button.replaceChildren(...children));
  const show = options.showLabel || button.dataset.nqShowLabel || button.getAttribute('aria-label') || translated(root, 'Show password', 'إظهار كلمة المرور');
  const hide = options.hideLabel || button.dataset.nqHideLabel || translated(root, 'Hide password', 'إخفاء كلمة المرور');
  const variant = options.toggleVariant ?? button.dataset.nqToggleVariant ?? root.dataset.nqToggleVariant ?? 'icon';
  button.type = 'button'; button.classList.add('nq-password-toggle'); button.setAttribute('aria-controls', ensureId(scope, input, 'password'));
  button.dataset.toggleVariant = variant === 'text' ? 'text' : 'icon';
  const render = () => {
    const visible = input.type === 'text'; button.setAttribute('aria-pressed', String(visible));
    if (variant === 'text') button.textContent = visible ? hide : show;
    else { const icon = input.ownerDocument.createElement('span'); icon.className = 'nq-password-icon'; icon.setAttribute('aria-hidden', 'true'); button.replaceChildren(icon); }
    button.setAttribute('aria-label', visible ? hide : show); button.disabled = isDisabled(input);
  };
  const toggle = () => { if (scope.destroyed || isDisabled(input)) return; input.type = input.type === 'password' ? 'text' : 'password'; render(); emit(root, { visible: input.type === 'text' }); };
  scope.listen(button, 'click', toggle);
  if (input.form) scope.listen(input.form, 'reset', event => queueMicrotask(() => { if (!scope.destroyed && !event.defaultPrevented) { input.type = 'password'; render(); } }));
  const Observer = input.ownerDocument.defaultView?.MutationObserver;
  if (Observer) { const observer = new Observer(render); observer.observe(input, { attributes: true, attributeFilter: ['disabled'] }); scope.add(() => observer.disconnect()); }
  render(); return { toggle, destroy: () => scope.destroy() };
}

export interface RangeSliderOptions { min?: number; max?: number; onValueChange?: (value: [number, number]) => void }
export function createRangeSlider(root: HTMLElement, options: RangeSliderOptions = {}): ValueController<[number, number]> {
  const lower = required<HTMLInputElement>(root, '[data-nq-lower]');
  const upper = required<HTMLInputElement>(root, '[data-nq-upper]');
  const scope = createCleanup();
  const min = options.min ?? Math.max(Number(lower.min || 0), Number(upper.min || 0));
  const max = options.max ?? Math.min(Number(lower.max || 100), Number(upper.max || 100));
  let value = clampRange([lower.valueAsNumber, upper.valueAsNumber], min, max, 'lower');
  for (const input of [lower, upper]) { const original = input.value; scope.add(() => { input.value = original; }); remember(scope, input, ['min', 'max', 'aria-valuetext', 'aria-readonly']); input.min = String(min); input.max = String(max); }
  const readonlyState = () => { for (const input of [lower, upper]) { if (readOnly(root)) input.setAttribute('aria-readonly', 'true'); else input.removeAttribute('aria-readonly'); } };
  const output = root.querySelector<HTMLOutputElement>('[data-nq-range-output]');
  const originalText = output?.textContent; if (output) scope.add(() => { output.textContent = originalText ?? ''; });
  const render = () => { lower.value = String(value[0]); upper.value = String(value[1]); if (output) output.textContent = `${formatNumber(value[0], { locale: localeOf(root) })} – ${formatNumber(value[1], { locale: localeOf(root) })}`; };
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
  if (lower.form) scope.listen(lower.form, 'reset', event => queueMicrotask(() => { if (!scope.destroyed && !event.defaultPrevented) { value = clampRange([lower.valueAsNumber, upper.valueAsNumber], min, max, 'lower'); render(); } }));
  const Observer = root.ownerDocument.defaultView?.MutationObserver;
  if (Observer) { const observer = new Observer(readonlyState); observer.observe(root, { attributes: true, attributeFilter: ['data-nq-readonly', 'aria-readonly'] }); scope.add(() => observer.disconnect()); }
  readonlyState(); render(); return { get value(): [number, number] { return [...value]; }, destroy: () => scope.destroy() };
}

export interface RatingOptions { onValueChange?: (value: number) => void }
/** Native radios own selection, keyboard navigation and form values. Enhancement adds readonly guards. */
export function createRating(root: HTMLElement, options: RatingOptions = {}): ValueController<number> {
  const inputs = [...root.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
  if (!inputs.length) throw new Error('Nasaq: Rating requires native radio inputs.');
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
  if (Observer) { const observer = new Observer(readonlyState); observer.observe(root, { attributes: true, attributeFilter: ['data-nq-readonly', 'aria-readonly'] }); scope.add(() => observer.disconnect()); }
  readonlyState();
  return { get value() { return value; }, destroy: () => scope.destroy() };
}

export interface PinInputOptions { length?: number; onValueChange?: (value: string) => void }
export function createPinInput(root: HTMLElement, options: PinInputOptions = {}): ValueController<string> {
  const input = required<HTMLInputElement>(root, '[data-nq-pin-input]');
  const length = options.length ?? (input.maxLength > 0 ? input.maxLength : 6);
  if (!Number.isInteger(length) || length < 1) throw new RangeError('Nasaq: PIN length must be positive.');
  const scope = createCleanup(); const original = input.value;
  remember(scope, input, ['type', 'inputmode', 'autocomplete', 'pattern', 'maxlength']); scope.add(() => { input.value = original; });
  input.type = 'text'; input.inputMode = 'numeric'; input.autocomplete = 'one-time-code'; input.pattern = `[0-9]{${length}}`; input.maxLength = length;
  const slots = [...root.querySelectorAll<HTMLElement>('[data-nq-pin-slot]')];
  slots.forEach(slot => { remember(scope, slot, ['aria-hidden']); const text = slot.textContent; scope.add(() => { slot.textContent = text; }); slot.setAttribute('aria-hidden', 'true'); });
  let composing = false;
  const render = (announce = false) => { input.value = normalizeDigits(input.value).replace(/\D/gu, '').slice(0, length); slots.forEach((slot, index) => { slot.textContent = input.value[index] || ''; }); if (announce) { emit(root, { value: input.value }); options.onValueChange?.(input.value); } };
  scope.listen(input, 'compositionstart', () => { composing = true; });
  scope.listen(input, 'compositionend', () => { composing = false; if (!isDisabled(input) && !input.readOnly) render(true); });
  scope.listen(input, 'input', () => { if (!composing && !isDisabled(input) && !input.readOnly) render(true); });
  if (input.form) scope.listen(input.form, 'reset', event => queueMicrotask(() => { if (!scope.destroyed && !event.defaultPrevented) render(); }));
  render(); return { get value() { return input.value; }, destroy: () => scope.destroy() };
}

export interface TagInputOptions { value?: readonly string[]; name?: string; onValueChange?: (values: string[]) => void; getRemoveLabel?: (value: string) => string; requiredMessage?: string }
export function createTagInput(root: HTMLElement, options: TagInputOptions = {}): ValueController<string[]> & { add(value: string): void; remove(value: string): void } {
  const input = required<HTMLInputElement>(root, '[data-nq-tag-input]');
  const host = required<HTMLElement>(root, '[data-nq-tags]');
  const source: unknown = options.value ?? JSON.parse(root.dataset.nqValue || '[]');
  if (!Array.isArray(source) || source.some(value => typeof value !== 'string')) throw new TypeError('Nasaq: tag values must be a string array.');
  const initial = [...new Set((source as string[]).map(value => value.trim()).filter(Boolean))];
  let value = [...initial]; let composing = false;
  const scope = createCleanup(); const children = [...host.childNodes]; const originalInput = input.value;
  const originalValidity = input.validity.customError ? input.validationMessage : ''; const requiredValue = input.required;
  const name = options.name ?? root.dataset.nqName ?? input.name;
  remember(scope, host, ['role']); remember(scope, input, ['name', 'required', 'aria-required']);
  scope.add(() => { host.replaceChildren(...children); input.value = originalInput; input.setCustomValidity(originalValidity); });
  host.setAttribute('role', 'list'); input.removeAttribute('name'); input.required = false; if (requiredValue) input.setAttribute('aria-required', 'true');
  const render = () => {
    host.replaceChildren();
    value.forEach((tag, index) => {
      const chip = root.ownerDocument.createElement('span'); chip.className = 'nq-chip'; chip.setAttribute('role', 'listitem'); chip.append(root.ownerDocument.createTextNode(tag));
      const remove = root.ownerDocument.createElement('button'); remove.type = 'button'; remove.dataset.nqRemoveTag = String(index); remove.textContent = '×';
      remove.setAttribute('aria-label', options.getRemoveLabel?.(tag) ?? translated(root, `Remove ${tag}`, `إزالة ${tag}`)); remove.disabled = isDisabled(input) || readOnly(root, input); chip.append(remove);
      if (name) { const hidden = root.ownerDocument.createElement('input'); hidden.type = 'hidden'; hidden.name = name; hidden.value = tag; hidden.disabled = isDisabled(input); const form = input.getAttribute('form'); if (form) hidden.setAttribute('form', form); chip.append(hidden); }
      host.append(chip);
    });
    input.setCustomValidity(requiredValue && !value.length && !isDisabled(input) ? options.requiredMessage ?? translated(root, 'Add at least one tag.', 'أضف وسمًا واحدًا على الأقل.') : originalValidity);
  };
  const notify = () => { render(); emit(root, { value: [...value] }); options.onValueChange?.([...value]); };
  const add = (tag: string) => { if (scope.destroyed || isDisabled(input) || readOnly(root, input)) return; const next = tag.trim(); if (!next || value.some(existing => normalizeSearch(existing) === normalizeSearch(next))) return; value.push(next); input.value = ''; notify(); };
  const remove = (tag: string) => { if (scope.destroyed || isDisabled(input) || readOnly(root, input)) return; const index = value.indexOf(tag); if (index < 0) return; value.splice(index, 1); notify(); input.focus(); };
  scope.listen(host, 'click', event => { const button = eventElement(event)?.closest<HTMLElement>('[data-nq-remove-tag]'); if (button) remove(value[Number(button.dataset.nqRemoveTag)] || ''); });
  scope.listen(input, 'compositionstart', () => { composing = true; }); scope.listen(input, 'compositionend', () => { composing = false; });
  scope.listen(input, 'keydown', event => {
    const key = event as KeyboardEvent; if (key.defaultPrevented || composing || key.isComposing || key.ctrlKey || key.metaKey || key.altKey || isDisabled(input) || readOnly(root, input)) return;
    if ((key.key === 'Enter' || key.key === ',') && input.value.trim()) { key.preventDefault(); add(input.value); }
    else if (key.key === 'Backspace' && !input.value && value.length) { key.preventDefault(); remove(value.at(-1)!); }
  });
  scope.listen(input, 'paste', event => { if (isDisabled(input) || readOnly(root, input)) return; const text = (event as ClipboardEvent).clipboardData?.getData('text') || ''; if (/[,\n]/u.test(text)) { event.preventDefault(); text.split(/[,\n]/u).forEach(add); } });
  if (input.form) scope.listen(input.form, 'reset', event => queueMicrotask(() => { if (!scope.destroyed && !event.defaultPrevented) { value = [...initial]; render(); } }));
  const Observer = input.ownerDocument.defaultView?.MutationObserver; if (Observer) { const observer = new Observer(render); observer.observe(input, { attributes: true, attributeFilter: ['disabled', 'readonly'] }); scope.add(() => observer.disconnect()); }
  render(); return { get value() { return [...value]; }, add, remove, destroy: () => scope.destroy() };
}

export interface MultiSelectOptions { required?: boolean; requiredMessage?: string; onValueChange?: (values: string[]) => void; getResultsMessage?: (count: number) => string }
export function createMultiSelect(root: HTMLElement, options: MultiSelectOptions = {}): ValueController<string[]> {
  const search = required<HTMLInputElement>(root, '[data-nq-multiselect-search]');
  const items = [...root.querySelectorAll<HTMLElement>('[data-nq-option]')];
  const inputs = items.map(item => required<HTMLInputElement>(item, 'input[type="checkbox"]'));
  const scope = createCleanup(); const status = root.querySelector<HTMLElement>('[data-nq-status]'); const originalStatus = status?.textContent;
  items.forEach(item => remember(scope, item, ['hidden'])); if (status) scope.add(() => { status.textContent = originalStatus ?? ''; });
  const originalQuery = search.value; scope.add(() => { search.value = originalQuery; });
  const originalValidity = search.validity.customError ? search.validationMessage : '';
  const originalDisabled = inputs.map(input => input.getAttribute('aria-disabled'));
  remember(scope, search, ['aria-required']); inputs.forEach(input => remember(scope, input, ['aria-disabled']));
  scope.add(() => search.setCustomValidity(originalValidity));
  const values = () => inputs.filter(input => input.checked && !input.matches(':disabled')).map(input => input.value);
  const validate = () => {
    const requiredSelection = options.required ?? root.dataset.nqRequired === 'true';
    if (requiredSelection) search.setAttribute('aria-required', 'true'); else search.removeAttribute('aria-required');
    inputs.forEach((input, index) => { const value = readOnly(root) ? 'true' : originalDisabled[index]; if (value != null) input.setAttribute('aria-disabled', value); else input.removeAttribute('aria-disabled'); });
    search.setCustomValidity(requiredSelection && !isDisabled(search) && !values().length ? options.requiredMessage ?? translated(root, 'Choose at least one option.', 'اختر خيارًا واحدًا على الأقل.') : originalValidity);
  };
  let selected = inputs.map(input => input.checked);
  const filter = () => { const query = normalizeSearch(search.value); let count = 0; items.forEach(item => { item.hidden = !normalizeSearch(item.textContent || '').includes(query); if (!item.hidden) count++; }); if (status) status.textContent = options.getResultsMessage?.(count) ?? translated(root, `${count} options`, `${count} خيارات`); validate(); };
  scope.listen(search, 'input', filter);
  scope.listen(root, 'click', event => { const target = eventElement(event); if (readOnly(root) && target?.matches('input[type="checkbox"], label')) event.preventDefault(); });
  scope.listen(root, 'change', event => { const index = inputs.indexOf(event.target as HTMLInputElement); if (index < 0) return; if (readOnly(root) || isDisabled(inputs[index]!)) { inputs[index]!.checked = selected[index]!; return; } selected = inputs.map(input => input.checked); validate(); const value = values(); emit(root, { value }); options.onValueChange?.(value); });
  if (search.form) scope.listen(search.form, 'reset', event => queueMicrotask(() => { if (!scope.destroyed && !event.defaultPrevented) { selected = inputs.map(input => input.checked); filter(); } }));
  const Observer = root.ownerDocument.defaultView?.MutationObserver;
  if (Observer) {
    const observer = new Observer(validate);
    observer.observe(root, { subtree: true, attributes: true, attributeFilter: ['disabled', 'data-nq-required', 'data-nq-readonly', 'aria-readonly'] });
    for (let parent = root.parentElement; parent; parent = parent.parentElement) if (parent.tagName === 'FIELDSET') observer.observe(parent, { attributes: true, attributeFilter: ['disabled'] });
    scope.add(() => observer.disconnect());
  }
  filter(); return { get value() { return values(); }, destroy: () => scope.destroy() };
}

export interface FileDropzoneOptions { maxSize?: number; onValueChange?: (files: File[]) => void; getStatusMessage?: (files: File[], rejected: boolean) => string }
export function createFileDropzone(root: HTMLElement, options: FileDropzoneOptions = {}): ValueController<File[]> {
  const input = required<HTMLInputElement>(root, '[data-nq-file-input]');
  const scope = createCleanup(); const status = root.querySelector<HTMLElement>('[data-nq-file-status]'); const initialText = status?.textContent;
  remember(scope, root, ['data-dragover']); if (status) scope.add(() => { status.textContent = initialText ?? ''; });
  const maxSize = options.maxSize ?? Number(root.dataset.nqMaxSize || Infinity);
  const accepted = (file: File) => file.size <= maxSize && (!input.accept || input.accept.split(',').some(pattern => { const rule = pattern.trim().toLowerCase(); return rule.startsWith('.') ? file.name.toLowerCase().endsWith(rule) : rule.endsWith('/*') ? file.type.toLowerCase().startsWith(rule.slice(0, -1)) : file.type.toLowerCase() === rule; }));
  const announce = (rejected: boolean) => { const value = [...(input.files || [])]; if (status) status.textContent = options.getStatusMessage?.(value, rejected) ?? (rejected ? translated(root, 'Choose files matching the allowed type and size.', 'اختر ملفات توافق النوع والحجم المسموح.') : value.map(file => file.name).join('، ')); emit(root, { value, rejected }); options.onValueChange?.(value); };
  scope.listen(input, 'change', () => { const rejected = [...(input.files || [])].some(file => !accepted(file)); if (rejected) input.value = ''; announce(rejected); });
  scope.listen(input, 'click', event => { if (readOnly(root)) event.preventDefault(); });
  scope.listen(root, 'dragover', event => { if (!isDisabled(input) && !readOnly(root)) { event.preventDefault(); root.setAttribute('data-dragover', ''); } });
  scope.listen(root, 'dragleave', event => { if (!root.contains((event as DragEvent).relatedTarget as Node | null)) root.removeAttribute('data-dragover'); });
  scope.listen(root, 'drop', event => {
    event.preventDefault(); root.removeAttribute('data-dragover'); if (isDisabled(input) || readOnly(root)) return;
    const files = [...((event as DragEvent).dataTransfer?.files || [])]; const selected = input.multiple ? files : files.slice(0, 1);
    if (selected.some(file => !accepted(file))) { input.value = ''; announce(true); return; }
    const Transfer = input.ownerDocument.defaultView?.DataTransfer; if (!Transfer) { if (status) status.textContent = translated(root, 'Use the file chooser to attach documents.', 'استخدم اختيار الملفات لإرفاق المستندات.'); return; }
    const transfer = new Transfer(); selected.forEach(file => transfer.items.add(file)); input.files = transfer.files; nativeChange(input);
  });
  if (input.form) scope.listen(input.form, 'reset', event => queueMicrotask(() => { if (!scope.destroyed && !event.defaultPrevented && status) status.textContent = ''; }));
  return { get value() { return [...(input.files || [])]; }, destroy: () => scope.destroy() };
}
