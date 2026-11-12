import { Children, isValidElement, useCallback, useEffect, useId, useRef } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { assignRef, cx, ControlField, Field, useFieldControl, useFieldValueRef } from './shared.js';
import type { FieldDecoration } from './shared.js';
import { observeReadonlyChoice, isDisabled, type Option } from '@hawiyah/core';
import { useFormReset } from './expanded-shared.js';

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: 'primary' | 'default' | 'secondary' | 'outline' | 'outline-white' | 'light' | 'danger' | 'ghost' | 'soft' | 'link';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}
export function Button({ variant = 'primary', size = 'md', loading, disabled, type = 'button', className, children, ...props }: ButtonProps) {
  return <button {...props} type={type} disabled={disabled || loading} aria-busy={loading || props['aria-busy']} className={cx('hw-button', className)} data-variant={variant} data-size={size}>{children}</button>;
}
export interface TextFieldProps extends ComponentPropsWithRef<'input'>, FieldDecoration {}
function InputControl(props: ComponentPropsWithRef<'input'>) {
  const field = useFieldControl(props);
  const ref = useFieldValueRef(props.ref);
  return <input {...props} {...field} ref={ref} className={cx('hw-input', props.className)} />;
}
export function TextField({ label, hint, error, ...props }: TextFieldProps) {
  if (label == null && hint == null && error == null) return <InputControl {...props} />;
  return <ControlField label={label} hint={hint} error={error} required={props.required} controlId={props.id}><InputControl {...props} /></ControlField>;
}
export interface TextareaProps extends ComponentPropsWithRef<'textarea'>, FieldDecoration {}
function TextareaControl(props: ComponentPropsWithRef<'textarea'>) {
  const field = useFieldControl(props);
  const ref = useFieldValueRef(props.ref);
  return <textarea {...props} {...field} ref={ref} className={cx('hw-textarea', props.className)} />;
}
export function Textarea({ label, hint, error, ...props }: TextareaProps) {
  if (label == null && hint == null && error == null) return <TextareaControl {...props} />;
  return <ControlField label={label} hint={hint} error={error} required={props.required} controlId={props.id}><TextareaControl {...props} /></ControlField>;
}
export interface SelectProps extends ComponentPropsWithRef<'select'>, FieldDecoration { options?: readonly Option[]; placeholder?: string }
function SelectControl({ options, children, placeholder, ...props }: SelectProps) {
  const field = useFieldControl(props);
  const select = useRef<HTMLSelectElement | null>(null);
  const { ref: forwarded } = props;
  // A native reset shows the browser default; the extra render writes a controlled `value` back.
  useFormReset(select);
  const ref = useFieldValueRef(useCallback((node: HTMLSelectElement | null) => { select.current = node; if (typeof forwarded === 'function') return forwarded(node); assignRef(forwarded, node); }, [forwarded]));
  const hasEmptyOption = options?.some(option => option.value === '') || Children.toArray(children).some(child => isValidElement<{value?: string}>(child) && child.type === 'option' && child.props.value === '');
  return <select {...props} {...field} ref={ref} className={cx('hw-select', props.className)}>{placeholder && !props.multiple && !hasEmptyOption && <option value="">{placeholder}</option>}{options?.map(option => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}{children}</select>;
}
export function Select({ label, hint, error, ...props }: SelectProps) {
  if (label == null && hint == null && error == null) return <SelectControl {...props} />;
  return <ControlField label={label} hint={hint} error={error} required={props.required} controlId={props.id}><SelectControl {...props} /></ControlField>;
}
export interface CheckboxProps extends Omit<ComponentPropsWithRef<'input'>, 'type'>, FieldDecoration { indeterminate?: boolean }
interface ChoiceProps extends CheckboxProps { kind: 'checkbox' | 'radio' | 'switch' }
function Choice({ kind, label, hint, error, className, indeterminate, ref, onClick, onKeyDown, onChange, ...props }: ChoiceProps) {
  const field = useFieldControl(props);
  const input = useRef<HTMLInputElement | null>(null);
  const hintId = hint ? `${field.id}-hint` : undefined;
  const errorId = error ? `${field.id}-error` : undefined;
  // A native reset shows the browser default; the extra render writes a controlled `checked` back.
  useFormReset(input);
  useEffect(() => { if (input.current) input.current.indeterminate = Boolean(indeterminate); }, [indeterminate]);
  useEffect(() => {
    if (!input.current) return;
    const guard = observeReadonlyChoice(input.current);
    return () => guard.destroy();
  });
  return <div className="hw-field">
    <label className="hw-choice" htmlFor={field.id}>
      <input {...props} {...field} ref={node => { input.current = node; assignRef(ref, node); }} type={kind === 'radio' ? 'radio' : 'checkbox'} role={kind === 'switch' ? 'switch' : props.role} className={cx(`hw-${kind}`, className)} aria-disabled={props.readOnly || props['aria-disabled']} aria-invalid={error ? true : field['aria-invalid']} aria-describedby={[field['aria-describedby'], hintId, errorId].filter(Boolean).join(' ') || undefined}
        onClick={event => { onClick?.(event); if (props.readOnly || isDisabled(event.currentTarget)) { event.preventDefault(); } }}
        onKeyDown={event => { onKeyDown?.(event); if (props.readOnly && (event.key === ' ' || kind === 'radio' && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key))) event.preventDefault(); }}
        onChange={event => { if (!props.readOnly && !isDisabled(event.currentTarget)) onChange?.(event); }} />
      {label}
    </label>
    {hint && <p id={hintId} className="hw-hint">{hint}</p>}
    {error && <p id={errorId} className="hw-error">{error}</p>}
  </div>;
}
export function Checkbox(props: CheckboxProps) { return <Choice {...props} kind="checkbox" />; }
export type RadioProps = Omit<CheckboxProps, 'indeterminate'>;
export function Radio(props: RadioProps) { return <Choice {...props} kind="radio" />; }
export type SwitchProps = Omit<CheckboxProps, 'indeterminate'>;
export function Switch(props: SwitchProps) { return <Choice {...props} kind="switch" />; }
export interface FileUploadProps extends Omit<TextFieldProps, 'type' | 'value' | 'defaultValue'> {
  onFilesChange?: (files: File[]) => void;
  children?: ReactNode;
}
export function FileUpload({ label, hint, error, onFilesChange, onChange, children, className, ...props }: FileUploadProps) {
  const id = useId(); const input = useRef<HTMLInputElement | null>(null); const held = useRef(0); const { ref } = props;
  // The browser empties the input on a native reset; report [] once when files were held.
  useFormReset(input, () => { if (held.current) { held.current = 0; onFilesChange?.([]); } });
  return <Field label={label} hint={hint} error={error} required={props.required} controlId={props.id ?? id} className="hw-upload">
    <InputControl {...props} ref={node => { input.current = node; assignRef(ref, node); }} className={className} type="file" onChange={event => { onChange?.(event); const files = Array.from(event.currentTarget.files ?? []); held.current = files.length; onFilesChange?.(files); }} />
    {children}
  </Field>;
}
