import { createCleanup, formatCalendarDate, getCalendarMonth, getDirection, isCalendarDateSupported, isDateInRange, isDisabled, moveCalendarDate, UMALQURA_MAX_DATE, UMALQURA_MIN_DATE, type CalendarMonth, type CalendarSystem } from '@nasaq/core';
import { createDialog } from './dialog.js';
import { emit, ensureId, eventElement, localeOf, nativeChange, readOnly, remember, required, translated } from './dom.js';

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
  let calendar = options.calendar ?? (root.dataset.nqCalendar === 'islamic-umalqura' ? 'islamic-umalqura' : 'gregory');
  const min = options.min ?? root.dataset.nqMin; const max = options.max ?? root.dataset.nqMax;
  const weekStartsOn = options.weekStartsOn ?? Number(root.dataset.nqWeekStartsOn || 0);
  const initial = options.value ?? root.dataset.nqValue ?? '';
  let value = isDateInRange(initial, min, max) ? initial : '';
  let month = options.month ?? root.dataset.nqMonth ?? (value || undefined);
  let focused = value;
  const disabled = () => !!options.disabled || root.dataset.nqDisabled === 'true' || root.getAttribute('aria-disabled') === 'true';
  const readonly = () => !!options.readOnly || readOnly(root);
  const selectable = (date: string) => isDateInRange(date, min, max) && isCalendarDateSupported(date, calendar) && !options.isDateDisabled?.(date);
  const host = document.createElement('div'); host.className = 'nq-calendar-content'; root.append(host); scope.add(() => host.remove());
  const hidden = document.createElement('input'); hidden.type = 'hidden'; hidden.name = options.name ?? root.dataset.nqName ?? ''; if (hidden.name) { root.append(hidden); scope.add(() => hidden.remove()); }
  const titleId = ensureId(scope, host, 'calendar') + '-title';
  let model: CalendarMonth;
  const button = (label: string, action: string) => { const node = document.createElement('button'); node.type = 'button'; node.className = `nq-button nq-calendar-${action === 'previous' ? 'prev' : 'next'}`; node.setAttribute('aria-label', label); node.dataset.variant = 'ghost'; node.dataset.nqCalendarAction = action; node.textContent = label; return node; };
  const render = (focusDate?: string, focusAction?: string) => {
    model = getCalendarMonth({ month, value, min, max, locale, calendar, weekStartsOn });
    const first = model.days.find(day => !day.outside)!;
    month = first.value;
    const active = model.days.find(day => day.value === (focusDate || focused) && !day.disabled && selectable(day.value))
      ?? model.days.find(day => day.selected && !day.disabled && selectable(day.value))
      ?? model.days.find(day => !day.outside && !day.disabled && selectable(day.value))
      ?? model.days.find(day => !day.disabled && selectable(day.value));
    focused = active?.value || '';
    host.replaceChildren();
    const header = document.createElement('div'); header.className = 'nq-calendar-header';
    const previous = button(translated(root, 'Previous month', 'الشهر السابق'), 'previous');
    const next = button(translated(root, 'Next month', 'الشهر التالي'), 'next');
    const heading = document.createElement('h3'); heading.id = titleId; heading.textContent = model.label; heading.setAttribute('aria-live', 'polite');
    previous.disabled = disabled() || model.previous === month || !!min && getCalendarMonth({ month: model.previous, calendar, min, max }).days.filter(day => !day.outside).every(day => day.disabled);
    next.disabled = disabled() || model.next === month || !!max && getCalendarMonth({ month: model.next, calendar, min, max }).days.filter(day => !day.outside).every(day => day.disabled);
    header.append(previous, heading, next); host.append(header);
    const systemLabel = document.createElement('label'); systemLabel.className = 'nq-calendar-system'; systemLabel.append(document.createTextNode(translated(root, 'Calendar system', 'نظام التقويم')));
    const system = document.createElement('select'); system.className = 'nq-select'; system.dataset.nqCalendarSystem = ''; system.disabled = disabled();
    for (const [id, label] of [['gregory', translated(root, 'Gregorian', 'ميلادي')], ['islamic-umalqura', translated(root, 'Hijri · Umm al-Qura', 'هجري · أم القرى')]]) { const option = document.createElement('option'); option.value = id!; option.textContent = label!; system.append(option); }
    system.value = calendar; systemLabel.append(system); host.append(systemLabel);
    const grid = document.createElement('table'); grid.className = 'nq-calendar-grid'; grid.setAttribute('role', 'grid'); grid.setAttribute('aria-labelledby', titleId); grid.setAttribute('aria-readonly', String(readonly()));
    const head = document.createElement('thead'); const headings = document.createElement('tr');
    model.weekdays.forEach(label => { const cell = document.createElement('th'); cell.scope = 'col'; cell.className = 'nq-calendar-weekday'; cell.textContent = label; headings.append(cell); }); head.append(headings); grid.append(head);
    const body = document.createElement('tbody');
    for (let offset = 0; offset < model.days.length; offset += 7) {
      const row = document.createElement('tr');
      for (const day of model.days.slice(offset, offset + 7)) {
        const cell = document.createElement('td'); cell.setAttribute('role', 'gridcell'); cell.setAttribute('aria-selected', String(day.selected));
        if (day.label) {
          const dateButton = document.createElement('button'); dateButton.type = 'button'; dateButton.className = 'nq-calendar-day'; dateButton.dataset.nqDate = day.value; dateButton.textContent = day.label;
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
    if (calendar === 'islamic-umalqura') {
      const note = document.createElement('p'); note.className = 'nq-hint nq-calendar-range';
      const label = document.createElement('span'); label.textContent = translated(root, 'Supported dates', 'التواريخ المدعومة');
      const range = document.createElement('bdi'); range.dir = 'ltr'; range.textContent = `${UMALQURA_MIN_DATE} – ${UMALQURA_MAX_DATE}`;
      note.append(label, range);
      if (value && !isCalendarDateSupported(value, calendar)) {
        note.setAttribute('role', 'status');
        const message = document.createElement('span'); message.textContent = translated(root, 'The selected date is outside this range; its ISO value is unchanged.', 'التاريخ المحدد خارج النطاق؛ بقيت قيمته الميلادية دون تغيير.'); note.append(message);
      }
      host.append(note);
    }
    hidden.value = value; hidden.disabled = disabled();
    if (focusAction === 'system') system.focus(); else if (focusAction) host.querySelector<HTMLElement>(`[data-nq-calendar-action="${focusAction}"]`)?.focus();
    else if (focusDate) [...host.querySelectorAll<HTMLElement>('[data-nq-date]')].find(node => node.dataset.nqDate === focused)?.focus();
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
  scope.listen(host, 'change', event => { const target = eventElement(event) as HTMLSelectElement | null; if (target?.hasAttribute('data-nq-calendar-system')) setCalendar(target.value as CalendarSystem); });
  scope.listen(host, 'click', event => {
    const target = eventElement(event)?.closest<HTMLElement>('button'); if (!target || isDisabled(target)) return;
    if (target.dataset.nqDate) select(target.dataset.nqDate);
    else if (target.dataset.nqCalendarAction) { const action = target.dataset.nqCalendarAction; month = action === 'previous' ? model.previous : model.next; focused = ''; render(undefined, action); }
  });
  scope.listen(host, 'keydown', event => {
    const key = event as KeyboardEvent; const target = eventElement(event)?.closest<HTMLElement>('[data-nq-date]');
    if (!target || disabled() || key.ctrlKey || key.altKey || key.metaKey || key.isComposing) return;
    const current = target.dataset.nqDate!; let amount = 0; let unit: 'day' | 'month' | 'year' = 'day';
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
  const Observer = document.defaultView?.MutationObserver; if (Observer) { const observer = new Observer(() => { if (!scope.destroyed) render(); }); observer.observe(root, { attributes: true, attributeFilter: ['data-nq-disabled', 'aria-disabled', 'data-nq-readonly', 'aria-readonly'] }); scope.add(() => observer.disconnect()); }
  render(); return { get value() { return value; }, get calendar() { return calendar; }, select, setValue, setMonth, setCalendar, destroy: () => scope.destroy() };
}

export interface DatePickerOptions { calendar?: CalendarSystem; locale?: string; onValueChange?: (value: string) => void; onCalendarChange?: (calendar: CalendarSystem) => void }
export interface DatePickerController extends CalendarController { show(): void; close(): void }
export function createDatePicker(root: HTMLElement, options: DatePickerOptions = {}): DatePickerController {
  const input = required<HTMLInputElement>(root, '[data-nq-date-input]'); const trigger = required<HTMLButtonElement>(root, '[data-nq-date-trigger]');
  const dialog = required<HTMLDialogElement>(root, '[data-nq-date-dialog]'); const host = required<HTMLElement>(dialog, '[data-nq-date-calendar]');
  const scope = createCleanup(); const validity = input.validity.customError ? input.validationMessage : ''; const originalValue = input.value;
  let lastNotifiedValue = input.value;
  remember(scope, trigger, ['aria-haspopup', 'aria-controls', 'disabled']); trigger.setAttribute('aria-haspopup', 'dialog'); trigger.setAttribute('aria-controls', ensureId(scope, dialog, 'date-picker'));
  scope.add(() => { input.setCustomValidity(validity); input.value = originalValue; });
  const display = root.ownerDocument.createElement('output'); display.className = 'nq-hint nq-date-picker-value'; display.dataset.nqDateDisplay = ''; display.setAttribute('aria-live', 'polite');
  root.append(display); scope.add(() => display.remove());
  const displayId = ensureId(scope, display, 'date-display'); remember(scope, input, ['aria-describedby']);
  input.setAttribute('aria-describedby', [...new Set((input.getAttribute('aria-describedby') || '').split(/\s+/u).filter(Boolean).concat(displayId))].join(' '));
  const modal = createDialog(dialog); scope.add(() => modal.destroy());
  const system = options.calendar ?? (root.dataset.nqCalendar === 'islamic-umalqura' ? 'islamic-umalqura' : 'gregory');
  const validate = () => {
    const supported = !input.value || isDateInRange(input.value, input.min || undefined, input.max || undefined) && isCalendarDateSupported(input.value, calendar.calendar);
    input.setCustomValidity(supported ? validity : translated(root, `Choose a valid date${calendar.calendar === 'islamic-umalqura' ? ` from ${UMALQURA_MIN_DATE} through ${UMALQURA_MAX_DATE}` : ''}.`, `اختر تاريخًا صحيحًا${calendar.calendar === 'islamic-umalqura' ? ` بين ${UMALQURA_MIN_DATE} و${UMALQURA_MAX_DATE}` : ''}.`));
    trigger.disabled = isDisabled(input) || input.readOnly;
    display.hidden = !input.value;
    if (!input.value) display.textContent = '';
    else if (isCalendarDateSupported(input.value, calendar.calendar)) display.textContent = formatCalendarDate(input.value, { locale: options.locale ?? localeOf(root), calendar: calendar.calendar });
    else display.textContent = calendar.calendar === 'islamic-umalqura'
      ? translated(root, `Hijri display supports ${UMALQURA_MIN_DATE} through ${UMALQURA_MAX_DATE}; the Gregorian value is unchanged.`, `العرض الهجري يدعم ${UMALQURA_MIN_DATE} إلى ${UMALQURA_MAX_DATE}؛ القيمة الميلادية لم تتغير.`)
      : translated(root, 'Enter a valid Gregorian ISO date.', 'أدخل تاريخًا ميلاديًا صحيحًا بصيغة ISO.');
    appendDateMessage(display, display.textContent || '');
  };
  const calendar = createCalendar(host, {
    value: input.value, min: input.min || undefined, max: input.max || undefined, locale: options.locale ?? localeOf(root), calendar: system,
    onSelect(value) { if (isDisabled(input) || input.readOnly || !isDateInRange(value, input.min || undefined, input.max || undefined)) return; input.value = value; validate(); nativeChange(input); modal.close(); },
    onCalendarChange(value) { validate(); emit(root, { calendar: value }); options.onCalendarChange?.(value); },
  });
  scope.add(() => calendar.destroy());
  // The picker owns the composed public events; internal calendar changes must
  // not produce a second bubbling value notification on the picker root.
  scope.listen(host, 'nq:change', event => event.stopPropagation());
  const show = () => { if (scope.destroyed || isDisabled(input) || input.readOnly) return; calendar.setValue(isDateInRange(input.value) ? input.value : ''); modal.show(trigger); };
  scope.listen(trigger, 'click', event => { event.preventDefault(); show(); });
  scope.listen(dialog, 'click', event => { if (eventElement(event)?.closest('[data-nq-date-close]')) { event.preventDefault(); modal.close(); } });
  scope.listen(input, 'input', validate); scope.listen(input, 'change', () => { validate(); calendar.setValue(isDateInRange(input.value) ? input.value : ''); if (lastNotifiedValue !== input.value) { lastNotifiedValue = input.value; emit(root, { value: input.value }); options.onValueChange?.(input.value); } });
  if (input.form) scope.listen(input.form, 'reset', event => queueMicrotask(() => { if (!scope.destroyed && !event.defaultPrevented) { lastNotifiedValue = input.value; validate(); calendar.setValue(input.value); modal.close(); } }));
  const Observer = input.ownerDocument.defaultView?.MutationObserver; if (Observer) { const observer = new Observer(() => { validate(); if (isDisabled(input) || input.readOnly) modal.close(); }); observer.observe(input, { attributes: true, attributeFilter: ['disabled', 'readonly'] }); scope.add(() => observer.disconnect()); }
  validate();
  return { get value() { return input.value; }, get calendar() { return calendar.calendar; }, select: calendar.select, setValue(value) { if (!value || isDateInRange(value)) { input.value = value; lastNotifiedValue = value; calendar.setValue(value); validate(); } }, setMonth: calendar.setMonth, setCalendar: calendar.setCalendar, show, close: () => modal.close(), destroy: () => scope.destroy() };
}
