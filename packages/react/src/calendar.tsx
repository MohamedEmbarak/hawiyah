import { useEffect, useId, useRef, useState } from 'react';
import type { ComponentPropsWithRef } from 'react';
import { formatCalendarDate, getCalendarMonth, hasText, getDirection, isCalendarDateSupported, isDateInRange, isDisabled, moveCalendarDate, UMALQURA_MIN_DATE, UMALQURA_MAX_DATE } from '@hawiyah/core';
import type { CalendarSystem } from '@hawiyah/core';
import { Button, TextField } from './forms.js';
import type { TextFieldProps } from './forms.js';
import { Dialog, Tooltip } from './interactive.js';
import { assignRef, cx, Field, rootLabel, text, useControllable } from './shared.js';
import type { FieldName, RootName } from './shared.js';
import { useFormReset } from './expanded-shared.js';

function dateMessage(message: string) {
  return message.split(/([0-9٠-٩]{4}-[0-9٠-٩]{2}-[0-9٠-٩]{2})/u).map((part, index) =>
    /^[0-9٠-٩]{4}-[0-9٠-٩]{2}-[0-9٠-٩]{2}$/u.test(part) ? <bdi key={index} dir="ltr">{part}</bdi> : part);
}

interface CalendarBaseProps extends Omit<ComponentPropsWithRef<'section'>, 'defaultValue' | 'onChange'> {
  value?: string; defaultValue?: string; onValueChange?: (value: string) => void;
  month?: string; defaultMonth?: string; onMonthChange?: (month: string) => void;
  /** BCP 47 tag for the month, weekday and date names that Intl prints. */
  min?: string; max?: string; locale: string; weekStartsOn?: number;
  isDateDisabled?: (value: string) => boolean; disabled?: boolean; readOnly?: boolean;
  previousLabel: string; nextLabel: string; getDayLabel?: (value: string) => string;
  name?: string; form?: string;
}
/** `rangeLabel` names the supported-range information shown with the Umm al-Qura calendar. */
export type CalendarProps = CalendarBaseProps & RootName & ({ calendar?: 'gregory'; rangeLabel?: string } | { calendar?: CalendarSystem; rangeLabel: string });
export function Calendar({ value, defaultValue = '', onValueChange, month, defaultMonth, onMonthChange, min, max, locale, calendar = 'gregory', weekStartsOn = 0, isDateDisabled, disabled, readOnly, label, previousLabel, nextLabel, rangeLabel, getDayLabel, name, form, className, ...props }: CalendarProps) {
  const names = { label: rootLabel('Calendar', props, label), previous: text('Calendar', 'previousLabel', previousLabel), next: text('Calendar', 'nextLabel', nextLabel), range: calendar === 'islamic-umalqura' ? text('Calendar', 'rangeLabel', rangeLabel, "calendar is 'islamic-umalqura'") : undefined };
  const id = useId(); const nativeValue = useRef<HTMLInputElement | null>(null); const [selected, select] = useControllable(value, defaultValue, onValueChange);
  const [visibleMonth, setMonth] = useControllable<string | undefined>(month, defaultMonth ?? (isDateInRange(selected) ? selected : undefined), next => { if (next) onMonthChange?.(next); });
  const previousSelected = useRef(selected);
  useEffect(() => {
    if (previousSelected.current === selected) return;
    previousSelected.current = selected;
    if (month === undefined && isDateInRange(selected)) { setMonth(selected); setFocused(selected); }
  }, [selected, month]);
  const [focused, setFocused] = useState<string | undefined>(isDateInRange(selected) ? selected : undefined); const shouldFocus = useRef(false); const buttons = useRef(new Map<string, HTMLButtonElement>());
  const model = getCalendarMonth({ month: visibleMonth && isDateInRange(visibleMonth) ? visibleMonth : undefined, value: isDateInRange(selected) ? selected : undefined, min, max, locale, calendar, weekStartsOn, fixedWeeks: true });
  const unavailable = (day: string) => Boolean(disabled || !isCalendarDateSupported(day, calendar) || !isDateInRange(day, min, max) || isDateDisabled?.(day));
  const focusValue = model.days.find(day => day.value === focused && !unavailable(day.value))?.value ?? model.days.find(day => day.selected && !unavailable(day.value))?.value ?? model.days.find(day => day.today && !unavailable(day.value))?.value ?? model.days.find(day => !day.outside && !unavailable(day.value))?.value ?? model.days.find(day => !unavailable(day.value))?.value;
  useFormReset(nativeValue, () => { if (value === undefined) select(defaultValue); if (month === undefined) setMonth(defaultMonth ?? (defaultValue || undefined)); setFocused(defaultValue || undefined); }, form);
  useEffect(() => { if (shouldFocus.current && focused) { const button = buttons.current.get(focused); if (button) { button.focus(); shouldFocus.current = false; } } }, [focused, model.label]);
  const first = model.days.find(day => !day.outside)!.value;
  const fullLabel = (date: string) => getDayLabel?.(date) ?? (isCalendarDateSupported(date, calendar) ? formatCalendarDate(date, { locale, calendar, dateStyle: 'full' }) : date);
  function navigate(current: string, key: string, shift: boolean, direction: string) {
    try {
    const column = model.days.findIndex(day => day.value === current) % 7;
    let next: string; let step = 1;
    if (key === 'ArrowLeft' || key === 'ArrowRight') { step = (key === 'ArrowRight' ? 1 : -1) * (direction === 'rtl' ? -1 : 1); next = moveCalendarDate(current, step, 'day', calendar); }
    else if (key === 'ArrowUp' || key === 'ArrowDown') { step = key === 'ArrowDown' ? 7 : -7; next = moveCalendarDate(current, step, 'day', calendar); }
    else if (key === 'Home' || key === 'End') { step = key === 'Home' ? 1 : -1; next = moveCalendarDate(current, key === 'Home' ? -column : 6 - column, 'day', calendar); }
    else { step = key === 'PageDown' ? 1 : -1; next = moveCalendarDate(current, step, shift ? 'year' : 'month', calendar); }
    for (let attempts = 0; attempts < 366 && unavailable(next); attempts++) {
      if ((min && next < min && step < 0) || (max && next > max && step > 0)) return;
      next = moveCalendarDate(next, step, 'day', calendar);
    }
    if (unavailable(next)) return;
    shouldFocus.current = true; setFocused(next);
    if (!model.days.some(day => day.value === next && !day.outside)) setMonth(next);
    } catch (error) { if (!(error instanceof RangeError)) throw error; }
  }
  return <section {...props} className={cx('hw-calendar', className)} aria-label={names.label} data-calendar={calendar}>
    <header className="hw-calendar-header"><Button variant="ghost" className="hw-calendar-prev" aria-label={names.previous} disabled={disabled || model.previous === first || Boolean(min && moveCalendarDate(first, -1, 'day', 'gregory') < min)} onClick={() => { setMonth(model.previous); setFocused(undefined); }}><span className="hw-icon" data-icon="arrow-left-01" data-directional="true" data-size="md" aria-hidden="true" /></Button><div className="hw-calendar-heading"><h3 id={`${id}-month`} aria-live="polite">{model.label}</h3>{calendar === 'islamic-umalqura' && <Tooltip className="hw-calendar-info" content={[names.range, `\u2066${UMALQURA_MIN_DATE} – ${UMALQURA_MAX_DATE}\u2069`].filter(Boolean).join(' ')}><span tabIndex={0} role="img" className="hw-calendar-info-icon hw-tooltip-trigger" aria-label={names.range}>i</span></Tooltip>}</div><Button variant="ghost" className="hw-calendar-next" aria-label={names.next} disabled={disabled || model.next === first || Boolean(max && model.next > max)} onClick={() => { setMonth(model.next); setFocused(undefined); }}><span className="hw-icon" data-icon="arrow-right-01" data-directional="true" data-size="md" aria-hidden="true" /></Button></header>
    <table role="grid" aria-readonly={readOnly || undefined} aria-labelledby={`${id}-month`} className="hw-calendar-grid"><thead><tr>{model.weekdays.map((day, index) => <th key={index} scope="col">{day}</th>)}</tr></thead><tbody>{Array.from({ length: 6 }, (_, row) => <tr key={row}>{model.days.slice(row * 7, row * 7 + 7).map(day => <td key={day.value} role="gridcell" aria-selected={day.selected}><button type="button" className="hw-calendar-day" data-date={day.value} data-outside={day.outside || undefined} aria-label={fullLabel(day.value)} aria-current={day.today ? 'date' : undefined} disabled={unavailable(day.value)} tabIndex={focusValue === day.value ? 0 : -1} ref={node => { if (node) buttons.current.set(day.value, node); else buttons.current.delete(day.value); }} onFocus={() => setFocused(day.value)} onClick={() => { if (!readOnly) { select(day.value); setFocused(day.value); if (day.outside) setMonth(day.value); } }} onKeyDown={event => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) { event.preventDefault(); navigate(day.value, event.key, event.shiftKey, getDirection(event.currentTarget)); } }}>{day.label}</button></td>)}</tr>)}</tbody></table>
    <input ref={nativeValue} type="hidden" name={name} form={form} value={isCalendarDateSupported(selected, calendar) && isDateInRange(selected, min, max) && !isDateDisabled?.(selected) ? selected : ''} disabled={disabled} />
  </section>;
}
interface DatePickerBaseProps extends Omit<TextFieldProps, 'type' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'label'> { value?: string; defaultValue?: string; onValueChange?: (value: string) => void; min?: string; max?: string; locale: string; calendar?: CalendarSystem; defaultCalendar?: CalendarSystem; onCalendarChange?: (calendar: CalendarSystem) => void; calendarSystemLabel: string; gregorianLabel: string; hijriLabel: string; rangeLabel: string; weekStartsOn?: number; calendarLabel: string; openLabel: string; previousLabel: string; nextLabel: string; closeLabel: string; unsupportedMessage: string; invalidMessage: string }
/** `unavailableMessage` is required with `isDateDisabled`. */
export type DatePickerProps = DatePickerBaseProps & FieldName & ({ isDateDisabled?: undefined; unavailableMessage?: string } | { isDateDisabled?: (value: string) => boolean; unavailableMessage: string });
export function DatePicker({ value, defaultValue = '', onValueChange, min, max, locale, calendar: controlledCalendar, defaultCalendar = 'gregory', onCalendarChange, calendarSystemLabel, gregorianLabel, hijriLabel, rangeLabel, weekStartsOn, isDateDisabled, calendarLabel, openLabel, previousLabel, nextLabel, closeLabel, unavailableMessage, invalidMessage, unsupportedMessage, label, hint, error, ref, className, name, onKeyDown, onFocus, onBlur, ...props }: DatePickerProps) {
  const copy = { calendar: text('DatePicker', 'calendarLabel', calendarLabel), open: text('DatePicker', 'openLabel', openLabel), close: text('DatePicker', 'closeLabel', closeLabel), system: text('DatePicker', 'calendarSystemLabel', calendarSystemLabel), gregorian: text('DatePicker', 'gregorianLabel', gregorianLabel), hijri: text('DatePicker', 'hijriLabel', hijriLabel), invalid: text('DatePicker', 'invalidMessage', invalidMessage), unsupported: text('DatePicker', 'unsupportedMessage', unsupportedMessage), unavailable: isDateDisabled ? text('DatePicker', 'unavailableMessage', unavailableMessage, 'isDateDisabled is given') : undefined };
  if (!hasText(props['aria-label']) && !hasText(props['aria-labelledby'])) text('DatePicker', 'label', label);
  const [calendar, setCalendar] = useControllable(controlledCalendar, defaultCalendar, onCalendarChange);
  const id = useId(); const input = useRef<HTMLInputElement | null>(null);
  const [selected, select] = useControllable(value, defaultValue, onValueChange);
  const [draft, setDraft] = useState(selected); const previousValue = useRef(selected);
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false); const [month, setMonth] = useState<string | undefined>(isDateInRange(selected) ? selected : undefined);
  useEffect(() => { if (previousValue.current !== selected) { previousValue.current = selected; setDraft(selected); } }, [selected]);
  useEffect(() => { if (props.disabled || props.readOnly) setOpen(false); }, [props.disabled, props.readOnly]);
  useFormReset(input, () => { if (value === undefined) select(defaultValue); setDraft(value ?? defaultValue); setOpen(false); setMonth(isDateInRange(value ?? defaultValue) ? (value ?? defaultValue) : undefined); }, props.form);
  const formatted = selected && isCalendarDateSupported(selected, calendar) ? formatCalendarDate(selected, { locale, calendar, dateStyle: 'full' }) : '';
  const formattedId = `${props.id ?? id}-formatted`; const dialogId = `${props.id ?? id}-dialog`;
  const malformed = Boolean(draft && !isDateInRange(draft));
  const unsupported = Boolean(draft && !malformed && calendar === 'islamic-umalqura' && !isCalendarDateSupported(draft, calendar));
  const unavailable = Boolean(draft && !malformed && isDateDisabled?.(draft));
  const outside = Boolean(draft && !malformed && !isDateInRange(draft, min, max));
  const invalid = malformed || outside || unsupported || unavailable;
  const message = malformed || outside ? copy.invalid : unsupported ? copy.unsupported : unavailable ? copy.unavailable : undefined;
  const displayed = !editing && draft && !invalid && isCalendarDateSupported(draft, calendar) ? formatCalendarDate(draft, { locale, calendar, dateStyle: 'medium' }) : draft;
  useEffect(() => { input.current?.setCustomValidity(invalid ? message ?? ' ' : ''); }, [invalid, message]);
  const blocked = () => props.disabled || props.readOnly || !input.current || isDisabled(input.current);
  const show = () => { if (!blocked()) { setMonth(isDateInRange(selected) ? selected : undefined); setOpen(true); } };
  const commit = (date: string) => { const canonical = !date || isDateInRange(date); setDraft(canonical && value !== undefined ? value : date); if (canonical) select(date); };
  return <Field label={label} hint={hint} error={error ?? (message ? dateMessage(message) : undefined)} required={props.required} controlId={props.id ?? id} className={cx('hw-date-picker', className)}>
    <div className="hw-date-picker-control">
      <TextField {...props} ref={node => { input.current = node; assignRef(ref, node); }} type="text" min={min} max={max} inputMode="text" aria-haspopup="dialog" aria-controls={dialogId} aria-invalid={invalid ? true : props['aria-invalid']} aria-describedby={[props['aria-describedby'], formatted ? formattedId : undefined].filter(Boolean).join(' ') || undefined} value={displayed} onFocus={event => { if (!blocked()) { event.currentTarget.value = draft; event.currentTarget.select(); setEditing(true); } onFocus?.(event); }} onBlur={event => { setEditing(false); onBlur?.(event); }} onChange={event => { if (!blocked()) commit(event.currentTarget.value); }} onKeyDown={event => { onKeyDown?.(event); if (!event.defaultPrevented && !event.nativeEvent.isComposing && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key === 'ArrowDown' && !blocked()) { event.preventDefault(); show(); } }} />
    <Dialog id={dialogId} open={open} onOpenChange={next => { if (!next || !blocked()) setOpen(next); }} title={copy.calendar} closeLabel={copy.close as string} trigger={<Button className="hw-date-picker-trigger" variant="ghost" disabled={props.disabled || props.readOnly} aria-label={copy.open} aria-controls={dialogId} aria-expanded={open} onClick={show}><span className="hw-date-picker-icon" aria-hidden="true" /></Button>}>
      <div className="hw-calendar-options"><div className="hw-calendar-system hw-calendar-switch" role="radiogroup" aria-label={copy.system} data-calendar={calendar}>{(['gregory', 'islamic-umalqura'] as const).map(system => <label key={system}><input type="radio" name={`${id}-calendar-system`} form="" value={system} checked={calendar === system} disabled={props.disabled || props.readOnly} onChange={() => { setCalendar(system); if (isDateInRange(selected)) setMonth(selected); }} /><span>{system === 'gregory' ? copy.gregorian : copy.hijri}</span></label>)}</div>
      </div>
      {unsupported && copy.unsupported && <p role="status" className="hw-sr-only">{dateMessage(copy.unsupported)}</p>}
      <Calendar disabled={props.disabled} readOnly={props.readOnly} value={isDateInRange(selected) ? selected : ''} onValueChange={date => { if (!blocked()) { commit(date); setOpen(false); } }} month={month} onMonthChange={setMonth} min={min} max={max} calendar={calendar} locale={locale} weekStartsOn={weekStartsOn} isDateDisabled={isDateDisabled} label={calendarLabel} previousLabel={previousLabel} nextLabel={nextLabel} rangeLabel={rangeLabel} />
    </Dialog>
    </div>
    <input type="hidden" name={name} form={props.form} disabled={props.disabled} value={isDateInRange(selected) ? selected : ''} />
    <output id={formattedId} htmlFor={props.id ?? id} className="hw-sr-only hw-date-picker-value" aria-live="polite" aria-atomic="true" hidden={!formatted}>{formatted}</output>
  </Field>;
}
