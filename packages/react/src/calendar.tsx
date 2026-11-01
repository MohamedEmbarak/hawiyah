import { useEffect, useId, useRef, useState } from 'react';
import type { ComponentPropsWithRef } from 'react';
import { formatCalendarDate, getCalendarMonth, getDirection, isCalendarDateSupported, isDateInRange, moveCalendarDate, UMALQURA_MIN_DATE, UMALQURA_MAX_DATE } from '@nasaq/core';
import type { CalendarSystem } from '@nasaq/core';
import { Button, Select, TextField } from './forms.js';
import type { TextFieldProps } from './forms.js';
import { Dialog } from './interactive.js';
import { InputGroup } from './expanded-controls.js';
import { assignRef, cx, Field, useControllable } from './shared.js';
import { useFormReset } from './expanded-shared.js';

function dateMessage(message: string) {
  return message.split(/([0-9٠-٩]{4}-[0-9٠-٩]{2}-[0-9٠-٩]{2})/u).map((part, index) =>
    /^[0-9٠-٩]{4}-[0-9٠-٩]{2}-[0-9٠-٩]{2}$/u.test(part) ? <bdi key={index} dir="ltr">{part}</bdi> : part);
}

export interface CalendarProps extends Omit<ComponentPropsWithRef<'section'>, 'defaultValue' | 'onChange'> {
  value?: string; defaultValue?: string; onValueChange?: (value: string) => void;
  month?: string; defaultMonth?: string; onMonthChange?: (month: string) => void;
  min?: string; max?: string; locale?: string; calendar?: CalendarSystem; weekStartsOn?: number;
  isDateDisabled?: (value: string) => boolean; disabled?: boolean; readOnly?: boolean;
  label?: string; previousLabel?: string; nextLabel?: string; getDayLabel?: (value: string) => string;
  name?: string; form?: string;
}
export function Calendar({ value, defaultValue = '', onValueChange, month, defaultMonth, onMonthChange, min, max, locale = 'ar-SA', calendar = 'gregory', weekStartsOn = 0, isDateDisabled, disabled, readOnly, label = 'Calendar', previousLabel = 'Previous month', nextLabel = 'Next month', getDayLabel, name, form, className, ...props }: CalendarProps) {
  const id = useId(); const nativeValue = useRef<HTMLInputElement | null>(null); const [selected, select] = useControllable(value, defaultValue, onValueChange);
  const [visibleMonth, setMonth] = useControllable<string | undefined>(month, defaultMonth ?? (isDateInRange(selected) ? selected : undefined), next => { if (next) onMonthChange?.(next); });
  const previousSelected = useRef(selected);
  useEffect(() => {
    if (previousSelected.current === selected) return;
    previousSelected.current = selected;
    if (month === undefined && isDateInRange(selected)) { setMonth(selected); setFocused(selected); }
  }, [selected, month]);
  const [focused, setFocused] = useState<string | undefined>(selected || undefined); const shouldFocus = useRef(false); const buttons = useRef(new Map<string, HTMLButtonElement>());
  const model = getCalendarMonth({ month: visibleMonth, value: isDateInRange(selected) ? selected : undefined, min, max, locale, calendar, weekStartsOn });
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
  return <section {...props} className={cx('nq-calendar', className)} aria-label={props['aria-label'] ?? label} data-calendar={calendar}>
    <header className="nq-calendar-header"><Button variant="ghost" className="nq-calendar-prev" aria-label={previousLabel} disabled={disabled || model.previous === first || Boolean(min && moveCalendarDate(first, -1, 'day', 'gregory') < min)} onClick={() => { setMonth(model.previous); setFocused(undefined); }}>‹</Button><h3 id={`${id}-month`} aria-live="polite">{model.label}</h3><Button variant="ghost" className="nq-calendar-next" aria-label={nextLabel} disabled={disabled || model.next === first || Boolean(max && model.next > max)} onClick={() => { setMonth(model.next); setFocused(undefined); }}>›</Button></header>
    <table role="grid" aria-readonly={readOnly || undefined} aria-labelledby={`${id}-month`} className="nq-calendar-grid"><thead><tr>{model.weekdays.map((day, index) => <th key={index} scope="col">{day}</th>)}</tr></thead><tbody>{Array.from({ length: model.days.length / 7 }, (_, row) => <tr key={row}>{model.days.slice(row * 7, row * 7 + 7).map(day => <td key={day.value} role="gridcell" aria-selected={day.selected}><button type="button" className="nq-calendar-day" data-date={day.value} data-outside={day.outside || undefined} aria-label={fullLabel(day.value)} aria-current={day.today ? 'date' : undefined} disabled={unavailable(day.value)} tabIndex={focusValue === day.value ? 0 : -1} ref={node => { if (node) buttons.current.set(day.value, node); else buttons.current.delete(day.value); }} onFocus={() => setFocused(day.value)} onClick={() => { if (!readOnly) { select(day.value); setFocused(day.value); if (day.outside) setMonth(day.value); } }} onKeyDown={event => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) { event.preventDefault(); navigate(day.value, event.key, event.shiftKey, getDirection(event.currentTarget)); } }}>{day.label}</button></td>)}</tr>)}</tbody></table>
    <input ref={nativeValue} type="hidden" name={name} form={form} value={isCalendarDateSupported(selected, calendar) && isDateInRange(selected, min, max) && !isDateDisabled?.(selected) ? selected : ''} disabled={disabled} />
  </section>;
}
export interface DatePickerProps extends Omit<TextFieldProps, 'type' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max'> { value?: string; defaultValue?: string; onValueChange?: (value: string) => void; min?: string; max?: string; locale?: string; calendar?: CalendarSystem; defaultCalendar?: CalendarSystem; onCalendarChange?: (calendar: CalendarSystem) => void; calendarSystemLabel?: string; gregorianLabel?: string; hijriLabel?: string; weekStartsOn?: number; isDateDisabled?: (value: string) => boolean; calendarLabel?: string; buttonLabel?: string; previousLabel?: string; nextLabel?: string; closeLabel?: string; unavailableMessage?: string; unsupportedCalendarMessage?: string }
export function DatePicker({ value, defaultValue = '', onValueChange, min, max, locale = 'ar-SA', calendar: controlledCalendar, defaultCalendar = 'gregory', onCalendarChange, calendarSystemLabel = 'Calendar system', gregorianLabel = 'Gregorian', hijriLabel = 'Hijri — Umm al-Qura', weekStartsOn, isDateDisabled, calendarLabel = 'Choose date', buttonLabel = 'Open calendar', previousLabel, nextLabel, closeLabel, unavailableMessage = 'This date is unavailable.', unsupportedCalendarMessage = `Umm al-Qura is available from ${UMALQURA_MIN_DATE} through ${UMALQURA_MAX_DATE}. The selected ISO date is unchanged.`, label, hint, error, ref, className, ...props }: DatePickerProps) {
  const [calendar, setCalendar] = useControllable(controlledCalendar, defaultCalendar, onCalendarChange);
  const id = useId(); const input = useRef<HTMLInputElement | null>(null); const [selected, select] = useControllable(value, defaultValue, onValueChange); const [open, setOpen] = useState(false); const [month, setMonth] = useState<string | undefined>(selected || undefined);
  useFormReset(input, () => { if (value === undefined) select(defaultValue); setOpen(false); setMonth(defaultValue || undefined); }, props.form);
  const formatted = selected && isCalendarDateSupported(selected, calendar) ? formatCalendarDate(selected, { locale, calendar, dateStyle: 'full' }) : '';
  const formattedId = `${props.id ?? id}-formatted`;
  const unsupported = Boolean(selected && calendar === 'islamic-umalqura' && !isCalendarDateSupported(selected, calendar));
  const unavailable = Boolean(selected && isDateDisabled?.(selected));
  const invalid = unsupported || unavailable || Boolean(selected && !isDateInRange(selected, min, max));
  useEffect(() => { input.current?.setCustomValidity(unsupported ? unsupportedCalendarMessage : unavailable ? unavailableMessage : ''); }, [unsupported, unavailable, unsupportedCalendarMessage, unavailableMessage]);
  return <Field label={label} hint={hint} error={error ?? (unsupported ? dateMessage(unsupportedCalendarMessage) : undefined)} required={props.required} controlId={props.id ?? id} className={cx('nq-date-picker', className)}><InputGroup end={<Dialog open={open} onOpenChange={setOpen} title={calendarLabel} closeLabel={closeLabel} trigger={<Button variant="secondary" disabled={props.disabled || props.readOnly} aria-label={buttonLabel} onClick={() => setMonth(isDateInRange(selected) ? selected : undefined)}>▦</Button>}><Select label={calendarSystemLabel} value={calendar} onChange={event => { setCalendar(event.currentTarget.value as CalendarSystem); if (isDateInRange(selected)) setMonth(selected); }} options={[{ value: 'gregory', label: gregorianLabel }, { value: 'islamic-umalqura', label: hijriLabel }]} />{selected && !isCalendarDateSupported(selected, calendar) && <p role="status" className="nq-hint">{dateMessage(unsupportedCalendarMessage)}</p>}<Calendar disabled={props.disabled} readOnly={props.readOnly} value={selected} onValueChange={date => { select(date); setOpen(false); }} month={month} onMonthChange={setMonth} min={min} max={max} calendar={calendar} locale={locale} weekStartsOn={weekStartsOn} isDateDisabled={isDateDisabled} label={calendarLabel} previousLabel={previousLabel} nextLabel={nextLabel} /></Dialog>}><TextField {...props} ref={node => { input.current = node; assignRef(ref, node); }} type="date" min={min} max={max} aria-invalid={invalid ? true : props['aria-invalid']} aria-describedby={[props['aria-describedby'], formatted ? formattedId : undefined].filter(Boolean).join(' ') || undefined} value={selected} onChange={event => select(event.currentTarget.value)} /></InputGroup><output id={formattedId} htmlFor={props.id ?? id} className="nq-hint nq-date-picker-value" aria-live="polite" aria-atomic="true" hidden={!formatted}>{formatted}</output></Field>;
}
