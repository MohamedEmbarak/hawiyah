import { getCalendarLabels, observeFieldValue, createCleanup, formatCalendarDate, getCalendarMonth, getDirection, isCalendarDateSupported, isDateInRange, isDisabled, moveCalendarDate, UMALQURA_MAX_DATE, UMALQURA_MIN_DATE, type CalendarMonth, type CalendarSystem } from '@hawiyah/core';
import { createTooltip } from './tooltip.js';
import { createDialog } from './dialog.js';
import { emit, ensureId, eventElement, localeOf, nativeChange, readOnly, remember, required } from './dom.js';

// Isolate displayed ISO dates from surrounding RTL prose without changing values.
function appendDateMessage(node: HTMLElement, message: string) {
  node.replaceChildren();
  for (const part of message.split(/([0-9٠-٩]{4}-[0-9٠-٩]{2}-[0-9٠-٩]{2})/u)) {
    if (/^[0-9٠-٩]{4}-[0-9٠-٩]{2}-[0-9٠-٩]{2}$/u.test(part)) {
      const date = node.ownerDocument.createElement('bdi'); date.dir = 'ltr'; date.textContent = part; node.append(date);
    } else node.append(node.ownerDocument.createTextNode(part));
  }
}

export interface CalendarOptions {
  value?: string; month?: string; min?: string; max?: string; locale?: string; calendar?: CalendarSystem;
  weekStartsOn?: number; disabled?: boolean; readOnly?: boolean; name?: string;
  isDateDisabled?: (value: string) => boolean; onValueChange?: (value: string) => void;
  onSelect?: (value: string) => void;
  onCalendarChange?: (calendar: CalendarSystem) => void;
}
export interface CalendarController {
  readonly value: string; readonly calendar: CalendarSystem;
  select(value: string): void; setValue(value: string): void; setMonth(value: string): void; setCalendar(calendar: CalendarSystem): void; destroy(): void;
}

export function createCalendar(root: HTMLElement, options: CalendarOptions = {}): CalendarController {
  const scope = createCleanup(); const document = root.ownerDocument;
  const locale = options.locale ?? localeOf(root);
  const copy = getCalendarLabels(locale);
  let calendar = options.calendar ?? (root.dataset.hwCalendar === 'islamic-umalqura' ? 'islamic-umalqura' : 'gregory');
  let min = options.min ?? root.dataset.hwMin; let max = options.max ?? root.dataset.hwMax;
  const refreshBounds = () => { min = options.min ?? root.dataset.hwMin; max = options.max ?? root.dataset.hwMax; };
  const weekStartsOn = options.weekStartsOn ?? Number(root.dataset.hwWeekStartsOn || 0);
  const initial = options.value ?? root.dataset.hwValue ?? '';
  let value = isDateInRange(initial, min, max) ? initial : '';
  let month = options.month ?? root.dataset.hwMonth ?? (value || undefined);
  let focused = value;
  const disabled = () => !!options.disabled || root.dataset.hwDisabled === 'true' || root.getAttribute('aria-disabled') === 'true';
  const readonly = () => !!options.readOnly || readOnly(root);
  const selectable = (date: string) => { refreshBounds(); return isDateInRange(date, min, max) && isCalendarDateSupported(date, calendar) && !options.isDateDisabled?.(date); };
  const host = document.createElement('div'); host.className = 'hw-calendar-content'; root.append(host); scope.add(() => host.remove());
  const hidden = document.createElement('input'); hidden.type = 'hidden'; hidden.name = options.name ?? root.dataset.hwName ?? ''; if (hidden.name) { root.append(hidden); scope.add(() => hidden.remove()); }
  const titleId = ensureId(scope, host, 'calendar') + '-title';
  const systemGroup = document.createElement('div'); systemGroup.className = 'hw-calendar-system hw-calendar-switch'; systemGroup.setAttribute('role', 'radiogroup'); systemGroup.setAttribute('aria-label', copy.system);
  for (const [id, text] of [['gregory', copy.gregorian], ['islamic-umalqura', copy.hijri]]) {
    const label = document.createElement('label'); const radio = document.createElement('input'); radio.type = 'radio'; radio.name = `${titleId}-system`; radio.setAttribute('form', ''); radio.value = id!; radio.dataset.hwCalendarSystem = ''; const caption = document.createElement('span'); caption.textContent = text!; label.append(radio, caption); systemGroup.append(label);
  }
  const optionsRow = document.createElement('div'); optionsRow.className = 'hw-calendar-options';
  const info = document.createElement('div'); info.className = 'hw-calendar-info';
  const infoButton = document.createElement('span'); infoButton.tabIndex = 0; infoButton.className = 'hw-calendar-info-icon hw-tooltip-trigger'; infoButton.dataset.hwTooltipTrigger = ''; infoButton.setAttribute('role', 'img'); infoButton.textContent = copy.range;
  infoButton.setAttribute('aria-label', infoButton.textContent); const infoPanel = document.createElement('span'); infoPanel.className = 'hw-tooltip hw-calendar-range'; infoPanel.setAttribute('role', 'tooltip'); infoPanel.hidden = true; infoPanel.setAttribute('aria-label', infoButton.textContent);
  const infoLabel = document.createElement('span'); infoLabel.textContent = infoButton.textContent;
  const infoRange = document.createElement('bdi'); infoRange.dir = 'ltr'; infoRange.textContent = `${UMALQURA_MIN_DATE} – ${UMALQURA_MAX_DATE}`;
  infoPanel.append(infoLabel, infoRange); info.append(infoButton, infoPanel); optionsRow.append(systemGroup); root.insertBefore(optionsRow, host);
  const infoTooltip = createTooltip(info); scope.add(() => { infoTooltip.destroy(); optionsRow.remove(); });
  scope.listen(info, 'keydown', event => { if ((event as KeyboardEvent).key === 'Escape' && !infoPanel.hidden) { event.preventDefault(); event.stopPropagation(); infoTooltip.hide(); } });
  let model: CalendarMonth;
  const button = (label: string, action: string) => { const node = document.createElement('button'); node.type = 'button'; node.className = `hw-button hw-calendar-${action === 'previous' ? 'prev' : 'next'}`; node.setAttribute('aria-label', label); node.dataset.variant = 'ghost'; node.dataset.hwCalendarAction = action; node.textContent = label; return node; };
  const render = (focusDate?: string, focusAction?: string) => {
    refreshBounds();
    model = getCalendarMonth({ month, value, min, max, locale, calendar, weekStartsOn, fixedWeeks: true });
    const first = model.days.find(day => !day.outside)!;
    month = first.value;
    const active = model.days.find(day => day.value === (focusDate || focused) && !day.disabled && selectable(day.value))
      ?? model.days.find(day => day.selected && !day.disabled && selectable(day.value))
      ?? model.days.find(day => !day.outside && !day.disabled && selectable(day.value))
      ?? model.days.find(day => !day.disabled && selectable(day.value));
    focused = active?.value || '';
    host.replaceChildren();
    const header = document.createElement('div'); header.className = 'hw-calendar-header';
    const previous = button(copy.previous, 'previous');
    const next = button(copy.next, 'next');
    const heading = document.createElement('h3'); heading.id = titleId; heading.textContent = model.label; heading.setAttribute('aria-live', 'polite');
    previous.disabled = disabled() || model.previous === month || !!min && getCalendarMonth({ month: model.previous, calendar, min, max }).days.filter(day => !day.outside).every(day => day.disabled);
    next.disabled = disabled() || model.next === month || !!max && getCalendarMonth({ month: model.next, calendar, min, max }).days.filter(day => !day.outside).every(day => day.disabled);
    const headingGroup = document.createElement('div'); headingGroup.className = 'hw-calendar-heading'; headingGroup.append(heading, info); header.append(previous, headingGroup, next); host.append(header);
    systemGroup.dataset.calendar = calendar;
    systemGroup.querySelectorAll<HTMLInputElement>('input').forEach(radio => { radio.checked = radio.value === calendar; radio.disabled = disabled() || readonly(); });
    const grid = document.createElement('table'); grid.className = 'hw-calendar-grid'; grid.setAttribute('role', 'grid'); grid.setAttribute('aria-labelledby', titleId); grid.setAttribute('aria-readonly', String(readonly()));
    const head = document.createElement('thead'); const headings = document.createElement('tr');
    model.weekdays.forEach(label => { const cell = document.createElement('th'); cell.scope = 'col'; cell.className = 'hw-calendar-weekday'; cell.textContent = label; headings.append(cell); }); head.append(headings); grid.append(head);
    const body = document.createElement('tbody');
    for (let offset = 0; offset < 42; offset += 7) {
      const row = document.createElement('tr');
      for (const day of model.days.slice(offset, offset + 7)) {
        const cell = document.createElement('td'); cell.setAttribute('role', 'gridcell'); cell.setAttribute('aria-selected', String(day.selected));
        if (day.label) {
          const dateButton = document.createElement('button'); dateButton.type = 'button'; dateButton.className = 'hw-calendar-day'; dateButton.dataset.hwDate = day.value; dateButton.textContent = day.label;
          dateButton.setAttribute('aria-label', formatCalendarDate(day.value, { locale, calendar, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
          dateButton.toggleAttribute('data-selected', day.selected); if (day.today) dateButton.setAttribute('aria-current', 'date');
          dateButton.toggleAttribute('data-outside', day.outside); dateButton.toggleAttribute('data-today', day.today);
          dateButton.disabled = disabled() || day.disabled || !selectable(day.value); dateButton.tabIndex = day.value === focused && !dateButton.disabled ? 0 : -1; cell.append(dateButton);
        }
        row.append(cell);
      }
      body.append(row);
    }
    grid.append(body); host.append(grid);
    info.hidden = calendar !== 'islamic-umalqura'; infoTooltip.hide();
    if (value && !isCalendarDateSupported(value, calendar)) {
      const message = document.createElement('p'); message.className = 'hw-sr-only'; message.setAttribute('role', 'status'); message.textContent = copy.unsupported; host.append(message);
    }
    hidden.value = value; hidden.disabled = disabled();
    if (focusAction === 'system') systemGroup.querySelector<HTMLInputElement>('input:checked')?.focus(); else if (focusAction) host.querySelector<HTMLElement>(`[data-hw-calendar-action="${focusAction}"]`)?.focus();
    else if (focusDate) [...host.querySelectorAll<HTMLElement>('[data-hw-date]')].find(node => node.dataset.hwDate === focused)?.focus();
  };
  const select = (date: string) => {
    if (scope.destroyed || disabled() || readonly() || !selectable(date)) return;
    const changed = value !== date; value = date; focused = date; month = date; render(date);
    if (changed) { emit(root, { value }); options.onValueChange?.(value); if (hidden.name) nativeChange(hidden); }
    options.onSelect?.(value);
  };
  const setMonth = (date: string) => { if (scope.destroyed || !isDateInRange(date)) return; month = date; render(); };
  const setValue = (date: string) => { if (scope.destroyed || date && !isDateInRange(date)) return; value = date; if (date) month = date; render(); };
  const setCalendar = (system: CalendarSystem) => { if (scope.destroyed || calendar === system) return; calendar = system; month = value || month; render(undefined, host.contains(document.activeElement) ? 'system' : undefined); emit(root, { calendar }); options.onCalendarChange?.(calendar); };
  scope.listen(systemGroup, 'change', event => { const target = eventElement(event) as HTMLInputElement | null; if (target?.checked && !disabled() && !readonly()) setCalendar(target.value as CalendarSystem); });
  scope.listen(host, 'click', event => {
    const target = eventElement(event)?.closest<HTMLElement>('button'); if (!target || isDisabled(target)) return;
    if (target.dataset.hwDate) select(target.dataset.hwDate);
    else if (target.dataset.hwCalendarAction) { const action = target.dataset.hwCalendarAction; month = action === 'previous' ? model.previous : model.next; focused = ''; render(undefined, action); }
  });
  scope.listen(host, 'keydown', event => {
    const key = event as KeyboardEvent; const target = eventElement(event)?.closest<HTMLElement>('[data-hw-date]');
    if (!target || disabled() || key.ctrlKey || key.altKey || key.metaKey || key.isComposing) return;
    const current = target.dataset.hwDate!; let amount = 0; let unit: 'day' | 'month' | 'year' = 'day';
    if (key.key === 'ArrowLeft' || key.key === 'ArrowRight') amount = (key.key === 'ArrowRight' ? 1 : -1) * (getDirection(root) === 'rtl' ? -1 : 1);
    else if (key.key === 'ArrowUp' || key.key === 'ArrowDown') amount = key.key === 'ArrowDown' ? 7 : -7;
    else if (key.key === 'Home' || key.key === 'End') { const index = model.days.findIndex(day => day.value === current) % 7; amount = key.key === 'Home' ? -index : 6 - index; }
    else if (key.key === 'PageUp' || key.key === 'PageDown') { amount = key.key === 'PageDown' ? 1 : -1; unit = key.shiftKey ? 'year' : 'month'; }
    else return;
    key.preventDefault();
    try {
      let candidate = moveCalendarDate(current, amount, unit, calendar);
      for (let count = 0; count < 366 && !selectable(candidate); count++) {
        const weekEdge = key.key === 'Home' || key.key === 'End';
        if (weekEdge && count >= 6 || !weekEdge && ((min && candidate < min) || (max && candidate > max))) return;
        candidate = moveCalendarDate(candidate, key.key === 'Home' ? 1 : key.key === 'End' ? -1 : amount < 0 ? -1 : 1, 'day', calendar);
      }
      if (!selectable(candidate)) return; month = candidate; focused = candidate; render(candidate);
    } catch (error) { if (!(error instanceof RangeError)) throw error; }
  });
  const form = root.closest('form'); if (form) scope.listen(form, 'reset', event => queueMicrotask(() => { if (!scope.destroyed && !event.defaultPrevented) { value = isDateInRange(initial, min, max) ? initial : ''; month = value || options.month; render(); } }));
  const Observer = document.defaultView?.MutationObserver; if (Observer) { const observer = new Observer(() => { if (!scope.destroyed) render(); }); observer.observe(root, { attributes: true, attributeFilter: ['data-hw-disabled', 'aria-disabled', 'data-hw-readonly', 'aria-readonly'] }); scope.add(() => observer.disconnect()); }
  render(); return { get value() { return value; }, get calendar() { return calendar; }, select, setValue, setMonth, setCalendar, destroy: () => scope.destroy() };
}

export interface DatePickerOptions { calendar?: CalendarSystem; locale?: string; onValueChange?: (value: string) => void; onCalendarChange?: (calendar: CalendarSystem) => void; isDateDisabled?: (value: string) => boolean; invalidMessage?: string }
export interface DatePickerController extends CalendarController { show(): void; close(): void }
export function createDatePicker(root: HTMLElement, options: DatePickerOptions = {}): DatePickerController {
  const copy = getCalendarLabels(options.locale ?? localeOf(root));
  const input = required<HTMLInputElement>(root, '[data-hw-date-input]'); const trigger = required<HTMLButtonElement>(root, '[data-hw-date-trigger]');
  const dialog = required<HTMLDialogElement>(root, '[data-hw-date-dialog]'); const host = required<HTMLElement>(dialog, '[data-hw-date-calendar]');
  const scope = createCleanup(); const validity = input.validity.customError ? input.validationMessage : ''; const originalValue = input.value;
  const presence = observeFieldValue(input); scope.add(() => presence.destroy());
  let value = isDateInRange(input.value) ? input.value : ''; let lastNotifiedValue = value; let draft = input.value; let editing = false; let renderedValue = input.value;
  remember(scope, input, ['type', 'name', 'aria-describedby', 'aria-invalid', 'aria-haspopup', 'aria-expanded', 'aria-controls']);
  const originalInvalid = input.getAttribute('aria-invalid');
  const canonical = input.ownerDocument.createElement('input'); canonical.type = 'hidden'; canonical.name = input.name;
  const synchronizeSubmission = () => { canonical.value = value; canonical.disabled = input.disabled; const form = input.getAttribute('form'); if (form) canonical.setAttribute('form', form); else canonical.removeAttribute('form'); };
  input.type = 'text'; input.name = ''; root.append(canonical); scope.add(() => canonical.remove());
  const dialogId = ensureId(scope, dialog, 'date-picker');
  remember(scope, trigger, ['aria-haspopup', 'aria-controls', 'aria-expanded', 'disabled']); trigger.setAttribute('aria-haspopup', 'dialog'); trigger.setAttribute('aria-controls', dialogId);
  remember(scope, trigger, ['class', 'aria-label']);
  const originalTriggerContent = [...trigger.childNodes]; scope.add(() => trigger.replaceChildren(...originalTriggerContent));
  if (!trigger.hasAttribute('aria-label')) trigger.setAttribute('aria-label', trigger.textContent?.trim() || copy.open);
  trigger.classList.add('hw-date-picker-trigger');
  const icon = input.ownerDocument.createElement('span'); icon.className = 'hw-date-picker-icon'; icon.setAttribute('aria-hidden', 'true'); trigger.replaceChildren(icon);
  const control = input.parentElement;
  if (control && control === trigger.parentElement && control !== root) { remember(scope, control, ['class']); control.classList.add('hw-date-picker-control'); }
  input.setAttribute('aria-haspopup', 'dialog'); input.setAttribute('aria-controls', dialogId); input.removeAttribute('aria-expanded'); trigger.setAttribute('aria-expanded', 'false');
  scope.add(() => { input.setCustomValidity(validity); input.value = originalValue; });
  const display = root.ownerDocument.createElement('output'); display.className = 'hw-sr-only hw-date-picker-value'; display.dataset.hwDateDisplay = ''; display.setAttribute('aria-live', 'polite');
  root.append(display); scope.add(() => display.remove());
  const displayId = ensureId(scope, display, 'date-display');
  input.setAttribute('aria-describedby', [...new Set((input.getAttribute('aria-describedby') || '').split(/\s+/u).filter(Boolean).concat(displayId))].join(' '));
  const modal = createDialog(dialog); scope.add(() => modal.destroy());
  const system = options.calendar ?? (root.dataset.hwCalendar === 'islamic-umalqura' ? 'islamic-umalqura' : 'gregory');
  const blocked = () => isDisabled(input) || input.readOnly;
  const validate = () => {
    const supported = !draft || isDateInRange(draft, input.min || undefined, input.max || undefined) && isCalendarDateSupported(draft, calendar.calendar) && !options.isDateDisabled?.(draft);
    const unsupportedRange = draft && isDateInRange(draft) && calendar.calendar === 'islamic-umalqura' && !isCalendarDateSupported(draft, calendar.calendar);
    input.setCustomValidity(supported ? validity : options.invalidMessage ?? (unsupportedRange ? copy.unsupported : copy.invalid));
    if (!supported) input.setAttribute('aria-invalid', 'true'); else if (originalInvalid === null) input.removeAttribute('aria-invalid'); else input.setAttribute('aria-invalid', originalInvalid);
    trigger.disabled = blocked(); synchronizeSubmission();
    display.hidden = !value;
    if (!value) display.textContent = '';
    else if (isCalendarDateSupported(value, calendar.calendar)) display.textContent = formatCalendarDate(value, { locale: options.locale ?? localeOf(root), calendar: calendar.calendar });
    else display.textContent = calendar.calendar === 'islamic-umalqura'
      ? copy.unsupported
      : copy.invalid;
    appendDateMessage(display, display.textContent || '');
    renderedValue = !editing && draft && supported ? formatCalendarDate(draft, { locale: options.locale ?? localeOf(root), calendar: calendar.calendar, dateStyle: 'medium' }) : draft;
    input.value = renderedValue;
    presence.refresh();
  };
  const calendar = createCalendar(host, {
    value, get min() { return input.min || undefined; }, get max() { return input.max || undefined; }, locale: options.locale ?? localeOf(root), calendar: system, isDateDisabled: options.isDateDisabled,
    onSelect(date) { if (blocked() || !isDateInRange(date, input.min || undefined, input.max || undefined)) return; input.value = date; nativeChange(input); modal.close(); },
    onCalendarChange(next) { validate(); emit(root, { calendar: next }); options.onCalendarChange?.(next); },
  });
  scope.add(() => calendar.destroy());
  scope.listen(host, 'hw:change', event => event.stopPropagation());
  const acceptDraft = () => {
    if (scope.destroyed) return;
    if (blocked()) { validate(); return; }
    if (input.value === renderedValue) return;
    draft = input.value;
    if (!draft || isDateInRange(draft)) { value = draft; calendar.setValue(value); }
    validate();
    if (lastNotifiedValue !== value) { lastNotifiedValue = value; emit(root, { value }); options.onValueChange?.(value); }
  };
  const show = (origin: HTMLElement = trigger) => { if (scope.destroyed || blocked()) return; calendar.setValue(value); modal.show(origin); trigger.setAttribute('aria-expanded', 'true'); };
  scope.listen(trigger, 'click', event => { event.preventDefault(); show(); });
  scope.listen(input, 'keydown', event => { const key = event as KeyboardEvent; if (!key.defaultPrevented && !key.isComposing && !key.ctrlKey && !key.metaKey && !key.shiftKey && key.key === 'ArrowDown' && !blocked()) { key.preventDefault(); show(input); } });
  scope.listen(dialog, 'click', event => { if (eventElement(event)?.closest('[data-hw-date-close]')) { event.preventDefault(); modal.close(); } });
  scope.listen(dialog, 'close', () => trigger.setAttribute('aria-expanded', 'false'));
  scope.listen(input, 'input', acceptDraft); scope.listen(input, 'change', acceptDraft);
  scope.listen(input, 'focus', () => { if (!blocked()) { editing = true; validate(); input.select(); } });
  scope.listen(input, 'blur', () => { editing = false; validate(); });
  if (input.form) scope.listen(input.form, 'reset', event => queueMicrotask(() => { if (!scope.destroyed && !event.defaultPrevented) { draft = input.defaultValue; value = isDateInRange(draft) ? draft : ''; lastNotifiedValue = value; calendar.setValue(value); validate(); modal.close(); } }));
  const Observer = input.ownerDocument.defaultView?.MutationObserver;
  if (Observer) {
    const observer = new Observer(records => {
      const renames = records.filter(record => record.attributeName === 'name');
      const name = input.getAttribute('name');
      // Ignore our own nonempty-name -> empty-name mutation. Explicit caller
      // clears (oldValue is already empty) still remove the submission name.
      if (renames.length && (name !== '' || renames.some(record => record.oldValue === ''))) {
        canonical.name = name ?? ''; if (name !== '') input.name = '';
      }
      if (records.some(record => record.attributeName === 'min' || record.attributeName === 'max')) calendar.setValue(value);
      validate(); if (blocked()) modal.close();
    });
    observer.observe(input, { attributes: true, attributeOldValue: true, attributeFilter: ['disabled', 'readonly', 'min', 'max', 'form', 'name'] });
    scope.add(() => observer.disconnect());
  }
  validate();
  return { get value() { return value; }, get calendar() { return calendar.calendar; }, select: calendar.select, setValue(next) { if (!next || isDateInRange(next)) { value = next; draft = next; lastNotifiedValue = next; calendar.setValue(next); validate(); } }, setMonth: calendar.setMonth, setCalendar: calendar.setCalendar, show: () => show(), close: () => modal.close(), destroy: () => scope.destroy() };
}
