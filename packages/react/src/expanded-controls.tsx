import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';
import { clampRange, evaluateFileSelection, filterOptions, hasText, isDisabled, isFileDrag, normalizePinInput, normalizeRatingMax, normalizeRatingValue, observeReadonlyChoice, prepareRemovalFocus } from '@hawiyah/core';
import type { Option } from '@hawiyah/core';
import { Button, TextField } from './forms.js';
import type { TextFieldProps } from './forms.js';
import { assignRef, cx, descriptionIds, Field, requiredMarker, text, useControllable, useFieldControl } from './shared.js';
import type { FieldDecoration, FieldName } from './shared.js';
import { useFormReset } from './expanded-shared.js';

export interface InputGroupProps extends ComponentPropsWithRef<'div'> { start?: ReactNode; end?: ReactNode }
export function InputGroup({ start, end, children, className, ...props }: InputGroupProps) { return <div {...props} className={cx('hw-input-group', className)}>{start != null && <span className="hw-input-addon">{start}</span>}{children}{end != null && <span className="hw-input-addon">{end}</span>}</div>; }
export interface PasswordFieldProps extends Omit<TextFieldProps, 'type'> { visible?: boolean; defaultVisible?: boolean; onVisibleChange?: (visible: boolean) => void; showLabel: string; hideLabel: string; toggleVariant?: 'icon' | 'text' }
export function PasswordField({ visible, defaultVisible = false, onVisibleChange, showLabel, hideLabel, toggleVariant = 'icon', label, hint, error, className, ref, ...props }: PasswordFieldProps) {
  const toggleName = { show: text('PasswordField', 'showLabel', showLabel), hide: text('PasswordField', 'hideLabel', hideLabel) };
  const id = useId(); const input = useRef<HTMLInputElement | null>(null); const [shown, setShown] = useControllable(visible, defaultVisible, onVisibleChange);
  useFormReset(input, () => setShown(false));
  return <Field label={label} hint={hint} error={error} controlId={props.id ?? id} required={props.required} className="hw-password-field"><div className="hw-password-control"><TextField {...props} ref={node => { input.current = node; assignRef(ref, node); }} className={className} type={shown ? 'text' : 'password'} /><Button className="hw-password-toggle" data-toggle-variant={toggleVariant} variant="ghost" disabled={props.disabled} aria-label={shown ? toggleName.hide : toggleName.show} aria-pressed={shown} aria-controls={props.id ?? id} onClick={() => { if (input.current && !isDisabled(input.current)) setShown(!shown); }}>{toggleVariant === 'text' ? shown ? toggleName.hide : toggleName.show : <span className="hw-password-icon" aria-hidden="true" />}</Button></div></Field>;
}
export {SearchField} from './search-field.js';
export type {SearchFieldProps} from './search-field.js';
export interface NumberFieldProps extends Omit<TextFieldProps, 'type'> {}
export function NumberField({ className, ...props }: NumberFieldProps) { return <TextField {...props} type="number" className={cx('hw-number-field', className)} />; }
export interface SliderProps extends Omit<TextFieldProps, 'type' | 'value' | 'defaultValue' | 'onChange'> { value?: number; defaultValue?: number; onValueChange?: (value: number) => void; showValue?: boolean; formatValue?: (value: number) => string }
function SliderInput(props: ComponentPropsWithRef<'input'>) {
  const field = useFieldControl(props);
  return <input {...props} {...field} className={cx('hw-slider', props.className)} />;
}
export function Slider({ value, defaultValue, onValueChange, showValue = false, formatValue, min = 0, max = 100, required, label, hint, error, ref, className, onPointerDown, onKeyDown, ...props }: SliderProps) {
  const id = useId(); const input = useRef<HTMLInputElement | null>(null); const initial = defaultValue ?? (Number(min) + Number(max)) / 2; const [current, setCurrent] = useControllable(value, initial, onValueChange);
  useFormReset(input, () => setCurrent(initial));
  // `required` shows the marker only: HTML does not allow it on a range input, which always has a value.
  return <Field label={label} hint={hint} error={error} required={required} controlId={props.id ?? id}><SliderInput {...props} required={false} min={min} max={max} type="range" value={current} className={className} ref={node => { input.current = node; assignRef(ref, node); }} aria-valuetext={formatValue ? formatValue(current) : props['aria-valuetext']} aria-readonly={props.readOnly || props['aria-readonly']}
    onPointerDown={event => { onPointerDown?.(event); if (props.readOnly) event.preventDefault(); }}
    onKeyDown={event => { onKeyDown?.(event); if (props.readOnly && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) event.preventDefault(); }}
    onChange={event => { if (props.readOnly || isDisabled(event.currentTarget)) { event.currentTarget.value = String(current); return; } setCurrent(event.currentTarget.valueAsNumber); }} />{showValue && <output className="hw-slider-value" htmlFor={props.id ?? id}>{formatValue ? formatValue(current) : String(current)}</output>}</Field>;
}
export interface RangeSliderProps extends Omit<ComponentPropsWithRef<'fieldset'>, 'onChange' | 'defaultValue'>, FieldDecoration { value?: readonly [number, number]; defaultValue?: readonly [number, number]; onValueChange?: (value: [number, number]) => void; min?: number; max?: number; step?: number; lowerLabel: string; upperLabel: string; name?: string; lowerName?: string; upperName?: string; form?: string; readOnly?: boolean; required?: boolean; formatValue?: (value: number) => string; getRangeLabel?: (lower: number, upper: number) => string }
const sliderKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'];
export function RangeSlider({ value, defaultValue, onValueChange, min = 0, max = 100, step, lowerLabel, upperLabel, name, lowerName, upperName, form, readOnly, required, formatValue, getRangeLabel, label, hint, error, className, disabled, ...props }: RangeSliderProps) {
  const id = useId(); const first = useRef<HTMLInputElement | null>(null); const initial = defaultValue ?? [min, max] as const; const [stored, setStored] = useControllable<readonly [number, number]>(value, initial, next => onValueChange?.([next[0], next[1]])); const current = clampRange([stored[0], stored[1]], min, max, 'lower');
  useFormReset(first, () => setStored(initial));
  const thumb = (index: 0 | 1) => {
    const own = current[index]; const which = index ? 'upper' : 'lower';
    // `required` shows the marker only: HTML does not allow it on a range input, which always has a value.
    return <label className="hw-label">{index ? text('RangeSlider', 'upperLabel', upperLabel) : text('RangeSlider', 'lowerLabel', lowerLabel)}<input ref={index ? undefined : first} className="hw-slider" type="range" id={`${id}-${which}`} name={(index ? upperName : lowerName) ?? name} form={form} min={index ? current[0] : min} max={index ? max : current[1]} step={step} value={own} aria-valuetext={formatValue?.(own)} aria-readonly={readOnly || undefined}
      onPointerDown={event => { if (readOnly) event.preventDefault(); }}
      onKeyDown={event => { if (readOnly && sliderKeys.includes(event.key)) event.preventDefault(); }}
      onChange={event => { if (readOnly || isDisabled(event.currentTarget)) { event.currentTarget.value = String(own); return; } const next = event.currentTarget.valueAsNumber; setStored(index ? clampRange([current[0], next], min, max, 'upper') : clampRange([next, current[1]], min, max, 'lower')); }} /></label>;
  };
  return <fieldset {...props} disabled={disabled} className={cx('hw-field hw-range-slider', className)} aria-describedby={descriptionIds(props['aria-describedby'], hint ? `${id}-hint` : undefined, error ? `${id}-error` : undefined)} aria-invalid={props['aria-invalid'] ?? (error ? true : undefined)}>{label != null && <legend className="hw-label">{label}{required && requiredMarker}</legend>}
    {thumb(0)}{thumb(1)}
    {getRangeLabel && <output className="hw-range-slider-value" htmlFor={`${id}-lower ${id}-upper`}>{getRangeLabel(current[0], current[1])}</output>}
    {hint && <p className="hw-hint" id={`${id}-hint`}>{hint}</p>}{error && <p className="hw-error" id={`${id}-error`}>{error}</p>}</fieldset>;
}
export interface RatingProps extends Omit<ComponentPropsWithRef<'fieldset'>, 'onChange' | 'defaultValue'>, FieldDecoration { value?: number; defaultValue?: number; onValueChange?: (value: number) => void; max?: number; name?: string; form?: string; required?: boolean; readOnly?: boolean; getRatingLabel: (value: number, max: number) => string }
export function Rating({ value, defaultValue = 0, onValueChange, max = 5, name, form, required, readOnly, getRatingLabel, label, hint, error, className, disabled, ...props }: RatingProps) {
  const optionLabel = text('Rating', 'getRatingLabel', getRatingLabel); const id = useId(); const input = useRef<HTMLInputElement | null>(null); const total = normalizeRatingMax(max); const [stored, setCurrent] = useControllable(value, defaultValue, onValueChange); const current = Math.floor(normalizeRatingValue(stored, total));
  useFormReset(input, () => setCurrent(defaultValue));
  return <fieldset {...props} className={cx('hw-rating', className)} disabled={disabled} data-hw-readonly={readOnly || undefined} aria-describedby={[hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined} aria-invalid={error ? true : undefined}><legend className="hw-label">{label}{required && requiredMarker}</legend>{Array.from({ length: total }, (_, index) => index + 1).map(number => <label key={number}><input ref={number === 1 ? input : undefined} type="radio" className="hw-radio" name={name ?? id} form={form} value={number} checked={current === number} required={required} aria-label={optionLabel?.(number, total) || undefined} aria-disabled={readOnly || undefined} onClick={event => { if (readOnly) event.preventDefault(); }} onKeyDown={event => { if (readOnly && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(event.key)) event.preventDefault(); }} onChange={event => { if (!readOnly && !isDisabled(event.currentTarget)) setCurrent(number); }} /><span aria-hidden="true" data-state={number <= current ? 'selected' : undefined}>★</span></label>)}{hint && <p id={`${id}-hint`} className="hw-hint">{hint}</p>}{error && <p id={`${id}-error`} className="hw-error">{error}</p>}</fieldset>;
}
/** Read-only aggregate score; use Rating for integer input selection.
 * `getValueLabel` returns the complete text alternative, for example the subject and the score. */
export interface RatingDisplayProps extends ComponentPropsWithRef<'div'> {
  value?: number; max?: number; showValue?: boolean;
  getValueLabel: (value: number, max: number) => string;
}
export function RatingDisplay({ value = 0, max = 5, showValue = true, getValueLabel, className, ...props }: RatingDisplayProps) {
  const total = normalizeRatingMax(max), score = normalizeRatingValue(value, total);
  const name = props['aria-label'] ?? (props['aria-labelledby'] ? undefined : text('RatingDisplay', 'getValueLabel', getValueLabel)?.(score, total));
  return <div {...props} className={cx('hw-rating-display', className)} role="img" aria-label={name || undefined}>
    <span className="hw-rating-stars" aria-hidden="true">{Array.from({length: total}, (_, index) => <span className="hw-rating-star" key={index}>★<span className="hw-rating-fill" style={{'--hw-rating-fill': `${Math.min(1, Math.max(0, score - index)) * 100}%`} as CSSProperties} /></span>)}</span>
    {showValue && <span className="hw-rating-score" aria-hidden="true">{score}/{total}</span>}
  </div>;
}
export interface PinInputProps extends Omit<TextFieldProps, 'type' | 'value' | 'defaultValue' | 'onChange' | 'maxLength'> { value?: string; defaultValue?: string; onValueChange?: (value: string) => void; length?: number; showSlots?: boolean }
export function PinInput({ value, defaultValue = '', onValueChange, length = 6, showSlots = false, label, hint, error, ref, className, onBlur, onInvalid, ...props }: PinInputProps) {
  const id = useId(); const input = useRef<HTMLInputElement | null>(null); const count = Math.max(1, Math.min(32, Math.floor(length))); const normalize = (text: string, previous?: string, inputType?: string) => normalizePinInput(text, count, previous, inputType); const [stored, setStored] = useControllable(value, normalize(defaultValue), onValueChange); const current = normalize(stored);
  // An incomplete code left on blur, and a failed submission, are exposed as invalid until the code is valid again.
  const [incomplete, setIncomplete] = useState(false); const [failed, setFailed] = useState(false);
  useFormReset(input, () => { setStored(normalize(defaultValue)); setIncomplete(false); setFailed(false); });
  useEffect(() => { if (failed && input.current?.validity.valid) setFailed(false); }, [current, failed]);
  // No maxlength: the browser would cut a pasted '123 456' before the separators are removed.
  return <Field label={label} hint={hint} error={error} required={props.required} controlId={props.id ?? id} className="hw-pin-input"><TextField {...props} ref={node => { input.current = node; assignRef(ref, node); }} className={className} type="text" inputMode="numeric" autoComplete="one-time-code" pattern={`[0-9]{${count}}`} value={current} aria-invalid={props['aria-invalid'] ?? (incomplete || failed ? true : undefined)}
    onChange={event => { const next = normalize(event.currentTarget.value, current, (event.nativeEvent as InputEvent).inputType); if (!next || next.length === count) setIncomplete(false); setStored(next); }}
    onBlur={event => { onBlur?.(event); setIncomplete(current.length > 0 && current.length < count); }}
    onInvalid={event => { onInvalid?.(event); setFailed(true); }} />{showSlots && <span aria-hidden="true" className="hw-pin-slots">{Array.from({ length: count }, (_, index) => <span key={index}>{current[index] || '·'}</span>)}</span>}</Field>;
}
interface TagInputBaseProps extends Omit<TextFieldProps, 'type' | 'value' | 'defaultValue' | 'onChange' | 'required'> { value?: readonly string[]; defaultValue?: readonly string[]; onValueChange?: (value: string[]) => void; getRemoveLabel: (tag: string) => string }
/** `requiredMessage` is the custom validity message of a required tag input without tags. */
export type TagInputProps = TagInputBaseProps & ({ required?: false; requiredMessage?: string } | { required?: boolean; requiredMessage: string });
export function TagInput({ value, defaultValue = [], onValueChange, getRemoveLabel, requiredMessage, label, hint, error, name, ref, onKeyDown, onInvalid, className, ...props }: TagInputProps) {
  const removeLabel = text('TagInput', 'getRemoveLabel', getRemoveLabel); const requiredText = props.required ? text('TagInput', 'requiredMessage', requiredMessage, 'required is set') : undefined; const composing = useRef(false); const id = useId(); const input = useRef<HTMLInputElement | null>(null); const box = useRef<HTMLDivElement | null>(null); const restoreFocus = useRef<(() => void) | undefined>(undefined); const [query, setQuery] = useState(''); const [failed, setFailed] = useState(false); const [tags, setTags] = useControllable<readonly string[]>(value, defaultValue, next => onValueChange?.([...next]));
  useFormReset(input, () => { setTags(defaultValue); setQuery(''); setFailed(false); });
  useEffect(() => { const element = input.current; if (!element) return; element.setCustomValidity(props.required && !tags.length ? requiredText ?? ' ' : ''); if (element.validity.valid) setFailed(false); }, [props.required, tags.length, requiredText]);
  // Focus leaves a removed chip for the next remove button, else the previous one, else the text input.
  useLayoutEffect(() => { const restore = restoreFocus.current; restoreFocus.current = undefined; restore?.(); });
  const blocked = props.disabled || props.readOnly;
  return <Field label={label} hint={hint} error={error} required={props.required} controlId={props.id ?? id}><div className="hw-tag-input" ref={box}><ul role="list">{tags.map(tag => <li className="hw-chip" key={tag}>{tag}<button type="button" disabled={blocked} aria-label={removeLabel?.(tag) || undefined} onClick={event => { if (blocked || !input.current || isDisabled(input.current)) return; if (box.current) restoreFocus.current = prepareRemovalFocus(box.current, event.currentTarget, { item: '.hw-chip', control: 'button', fallback: input.current }); setTags(tags.filter(item => item !== tag)); }}><span className="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true" /></button><input type="hidden" name={name} form={props.form} value={tag} disabled={props.disabled} /></li>)}</ul><TextField {...props} required={false} aria-required={props.required ? true : props['aria-required']} aria-invalid={props['aria-invalid'] ?? (failed || undefined)} ref={node => { input.current = node; assignRef(ref, node); }} className={className} type="text" value={query} onChange={event => setQuery(event.currentTarget.value)} onInvalid={event => { onInvalid?.(event); setFailed(true); }} onCompositionStart={event => { composing.current = true; props.onCompositionStart?.(event); }} onCompositionEnd={event => { composing.current = false; props.onCompositionEnd?.(event); }} onKeyDown={event => { onKeyDown?.(event); if (event.defaultPrevented || props.disabled || props.readOnly || isDisabled(event.currentTarget) || composing.current || event.nativeEvent.isComposing || event.ctrlKey || event.altKey || event.metaKey) return; if ((event.key === 'Enter' || event.key === ',') && query.trim()) { event.preventDefault(); const tag = query.trim(); if (tag && !tags.includes(tag)) setTags([...tags, tag]); setQuery(''); } else if (event.key === 'Backspace' && !query && tags.length) { event.preventDefault(); setTags(tags.slice(0, -1)); } }} /></div></Field>;
}
interface MultiSelectBaseProps extends Omit<ComponentPropsWithRef<'fieldset'>, 'onChange' | 'defaultValue'>, Omit<FieldDecoration, 'label'> { options: readonly Option[]; value?: readonly string[]; defaultValue?: readonly string[]; onValueChange?: (value: string[]) => void; name?: string; form?: string; readOnly?: boolean; /** Visible label of the filter input. */ searchLabel: string; placeholder?: string; emptyMessage: string; /** Polite announcement of the number of options shown, after the reader filters. */ getResultsMessage: (count: number) => string; /** When given, a visible status shows the returned text for the number of selected options. */ getSelectedMessage?: (count: number) => string }
/** The group is named by `label` (or aria-label / aria-labelledby). `requiredMessage` is the custom validity message of a required multi-select without a selection. */
export type MultiSelectProps = MultiSelectBaseProps & FieldName & ({ required?: false; requiredMessage?: string } | { required?: boolean; requiredMessage: string });
export function MultiSelect({ options, value, defaultValue = [], onValueChange, name, form, required, readOnly, searchLabel, placeholder, emptyMessage, getResultsMessage, getSelectedMessage, requiredMessage, label, hint, error, className, disabled, ...props }: MultiSelectProps) {
  const legend = hasText(props['aria-label']) || hasText(props['aria-labelledby']) ? label : text('MultiSelect', 'label', label);
  const copy = { search: text('MultiSelect', 'searchLabel', searchLabel), empty: text('MultiSelect', 'emptyMessage', emptyMessage), results: text('MultiSelect', 'getResultsMessage', getResultsMessage), required: required ? text('MultiSelect', 'requiredMessage', requiredMessage, 'required is set') : undefined };
  const id = useId(); const input = useRef<HTMLInputElement | null>(null); const [query, setQuery] = useState(''); const [announce, setAnnounce] = useState(false); const [failed, setFailed] = useState(false); const [resetCount, setResetCount] = useState(0); const [selected, setSelected] = useControllable<readonly string[]>(value, defaultValue, next => onValueChange?.([...next])); const allowed = selected.filter(item => options.some(option => option.value === item && !option.disabled)); const results = filterOptions(options, query);
  // The reset remounts the checkboxes, so that `checked` follows a controlled value the application kept.
  useFormReset(input, () => { setSelected(defaultValue); setQuery(''); setAnnounce(false); setFailed(false); setResetCount(count => count + 1); });
  useEffect(() => { const element = input.current; if (!element) return; element.setCustomValidity(required && !disabled && !allowed.length ? copy.required ?? ' ' : ''); if (element.validity.valid) setFailed(false); }, [required, disabled, allowed.length, copy.required]);
  // Read-only checkboxes stay focusable and named; the core guard blocks pointer and Space activation.
  const list = useRef<HTMLDivElement | null>(null);
  useEffect(() => { const guards = Array.from(list.current?.querySelectorAll<HTMLInputElement>('input[type="checkbox"]') ?? [], observeReadonlyChoice); return () => guards.forEach(guard => guard.destroy()); });
  const described = descriptionIds(props['aria-describedby'], hint ? `${id}-hint` : undefined, error ? `${id}-error` : undefined); const invalid = props['aria-invalid'] ?? (error || failed ? true : undefined);
  return <fieldset {...props} disabled={disabled} className={cx('hw-field hw-multi-select', className)} data-hw-readonly={readOnly || undefined} aria-describedby={described} aria-invalid={invalid}>{legend != null && <legend className="hw-label">{legend}{required && requiredMarker}</legend>}{copy.search && <label className="hw-label" htmlFor={id}>{copy.search}</label>}<TextField ref={input} id={id} form={form} type="search" placeholder={placeholder || undefined} aria-required={required || undefined} aria-describedby={described} aria-invalid={invalid} value={query} onChange={event => { setQuery(event.currentTarget.value); setAnnounce(true); }} onInvalid={() => setFailed(true)} disabled={disabled} /><div className="hw-multi-select-options" key={resetCount} ref={list}>{results.map(option => <label className="hw-choice" key={option.value}><input className="hw-checkbox" type="checkbox" checked={allowed.includes(option.value)} disabled={disabled || option.disabled} aria-disabled={readOnly || undefined} value={option.value} onChange={event => { if (!disabled && !readOnly) setSelected(event.currentTarget.checked ? [...allowed, option.value] : allowed.filter(item => item !== option.value)); }} />{option.label}</label>)}{!results.length && copy.empty && <p className="hw-hint">{copy.empty}</p>}</div><span className="hw-sr-only" role="status" aria-live="polite" aria-atomic="true">{announce ? copy.results?.(results.length) || '' : ''}</span>{getSelectedMessage && <p className="hw-multi-select-selected" role="status">{getSelectedMessage(allowed.length)}</p>}{allowed.map(item => <input key={item} type="hidden" name={name} form={form} value={item} disabled={disabled} />)}{hint && <p id={`${id}-hint`} className="hw-hint">{hint}</p>}{error && <p id={`${id}-error`} className="hw-error">{error}</p>}</fieldset>;
}
interface FileDropzoneBaseProps extends Omit<TextFieldProps, 'type' | 'value' | 'defaultValue' | 'label' | 'accept' | 'children'> { onFilesChange?: (files: File[]) => void; /** Called with the files of a rejected batch; the selection is then empty. */ onReject?: (files: File[]) => void; /** Visible instruction inside the drop area. The field is named by `label`. */ dropLabel: ReactNode; /** When given, a visible status after the input shows the returned text for the selected files. */ getSelectedMessage?: (files: readonly File[]) => string; /** Rendered after the status, for example a FileUploadList. The dropzone renders no file list itself. */ children?: ReactNode }
/** `getRejectedMessage` is required with `accept` or `maxSize` (bytes); it receives the rejected files. */
export type FileDropzoneProps = FileDropzoneBaseProps & FieldName & ({ accept?: undefined; maxSize?: undefined; getRejectedMessage?: (rejected: readonly File[]) => string } | { accept?: string; maxSize?: number; getRejectedMessage: (rejected: readonly File[]) => string });
export function FileDropzone({ onFilesChange, onReject, dropLabel, getRejectedMessage, getSelectedMessage, maxSize, readOnly, children, label, hint, error, ref, onChange, onClick, className, ...props }: FileDropzoneProps) {
  const instruction = text('FileDropzone', 'dropLabel', dropLabel); if (!props['aria-label'] && !props['aria-labelledby']) text('FileDropzone', 'label', label);
  const input = useRef<HTMLInputElement | null>(null); const id = useId(); const controlId = props.id ?? id; const [dragging, setDragging] = useState(false); const [files, setFiles] = useState<File[]>([]); const [rejected, setRejected] = useState<readonly File[]>([]);
  const restricted = Boolean(props.accept) || Boolean(maxSize);
  const rejectedMessage = restricted ? text('FileDropzone', 'getRejectedMessage', getRejectedMessage, 'accept or maxSize is set') : undefined;
  const rejection = rejected.length ? (restricted ? rejectedMessage : text('FileDropzone', 'getRejectedMessage', getRejectedMessage, 'a selection was rejected'))?.(rejected) || undefined : undefined;
  useFormReset(input, () => { if (files.length) onFilesChange?.([]); setFiles([]); setRejected([]); setDragging(false); });
  const unavailable = () => props.disabled || readOnly || !input.current || isDisabled(input.current);
  const reject = (batch: File[]) => {
    if (input.current) input.current.value = '';
    if (files.length) onFilesChange?.([]);
    setFiles([]); setRejected(batch); onReject?.(batch);
  };
  const evaluate = (batch: File[]) => evaluateFileSelection(batch, { accept: props.accept, multiple: props.multiple, maxSize });
  // The application's `error` wins; a rejection is announced once through role=alert.
  return <Field className={cx('hw-file-dropzone', className)} data-state={dragging ? 'dragging' : rejected.length || error ? 'error' : undefined} data-hw-readonly={readOnly ? 'true' : undefined} label={label} hint={hint} error={error || rejection} errorRole={!error && rejection ? 'alert' : undefined} required={props.required} controlId={controlId}
    onDragOver={event => { if (!isFileDrag(event.dataTransfer)) return; event.preventDefault(); const blocked = unavailable(); event.dataTransfer.dropEffect = blocked ? 'none' : 'copy'; setDragging(!blocked); }}
    onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }}
    onDrop={event => { event.preventDefault(); setDragging(false); if (unavailable() || !input.current) return; const incoming = Array.from(event.dataTransfer.files); const result = evaluate(incoming); if (result.rejected.length) { reject(result.rejected); return; } if (!incoming.length) return; try { input.current.files = event.dataTransfer.files; } catch { return; } if (input.current.files?.length !== incoming.length) return; input.current.dispatchEvent(new Event('change', { bubbles: true })); }}>
    {instruction != null && <p id={`${controlId}-instruction`} className="hw-file-dropzone-instruction">{instruction}</p>}
    <TextField {...props} aria-describedby={[props['aria-describedby'], instruction != null ? `${controlId}-instruction` : undefined].filter(Boolean).join(' ') || undefined} aria-disabled={readOnly || props['aria-disabled']} aria-invalid={props['aria-invalid'] ?? (rejected.length ? true : undefined)} ref={node => { input.current = node; assignRef(ref, node); }} type="file"
      onClick={event => { onClick?.(event); if (readOnly) event.preventDefault(); }}
      onChange={event => { if (unavailable()) return; onChange?.(event); const next = Array.from(event.currentTarget.files ?? []); const result = evaluate(next); if (result.rejected.length) { reject(result.rejected); return; } setRejected([]); if (!next.length && !files.length) return; setFiles(next); onFilesChange?.(next); }} />
    {getSelectedMessage && <p role="status">{files.length ? getSelectedMessage(files) || undefined : undefined}</p>}
    {children}
  </Field>;
}
