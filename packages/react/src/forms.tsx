import { Children, isValidElement, useEffect, useId, useRef } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { assignRef, cx, ControlField, Field, useFieldControl, useFieldValueRef } from './shared.js';
import type { FieldDecoration } from './shared.js';
import { observeReadonlyChoice, isDisabled, type Option } from '@nasaq/core';

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: 'primary' | 'default' | 'secondary' | 'outline' | 'outline-white' | 'light' | 'danger' | 'ghost' | 'soft' | 'link';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}
export function Button({ variant = 'primary', size = 'md', loading, disabled, type = 'button', className, children, ...props }: ButtonProps) {
  return <button {...props} type={type} disabled={disabled || loading} aria-busy={loading || props['aria-busy']} className={cx('nq-button', className)} data-variant={variant} data-size={size}>{children}</button>;
}
export interface TextFieldProps extends ComponentPropsWithRef<'input'>, FieldDecoration {}
function InputControl(props: ComponentPropsWithRef<'input'>) {
  const field = useFieldControl(props);
  const ref = useFieldValueRef(props.ref);
  return <input {...props} {...field} ref={ref} className={cx('nq-input', props.className)} />;
}
export function TextField({ label, hint, error, ...props }: TextFieldProps) {
  if (label == null && hint == null && error == null) return <InputControl {...props} />;
  return <ControlField label={label} hint={hint} error={error} required={props.required} controlId={props.id}><InputControl {...props} /></ControlField>;
}
export interface TextareaProps extends ComponentPropsWithRef<'textarea'>, FieldDecoration {}
function TextareaControl(props: ComponentPropsWithRef<'textarea'>) {
  const field = useFieldControl(props);
  const ref = useFieldValueRef(props.ref);
  return <textarea {...props} {...field} ref={ref} className={cx('nq-textarea', props.className)} />;
}
export function Textarea({ label, hint, error, ...props }: TextareaProps) {
  if (label == null && hint == null && error == null) return <TextareaControl {...props} />;
  return <ControlField label={label} hint={hint} error={error} required={props.required} controlId={props.id}><TextareaControl {...props} /></ControlField>;
}
export interface SelectProps extends ComponentPropsWithRef<'select'>, FieldDecoration { options?: readonly Option[]; placeholder?: string }
function SelectControl({ options, children, placeholder, ...props }: SelectProps) {
  const field = useFieldControl(props);
  const ref = useFieldValueRef(props.ref);
  const hasEmptyOption = options?.some(option => option.value === '') || Children.toArray(children).some(child => isValidElement<{value?: string}>(child) && child.type === 'option' && child.props.value === '');
  return <select {...props} {...field} ref={ref} className={cx('nq-select', props.className)}>{placeholder && !props.multiple && !hasEmptyOption && <option value="">{placeholder}</option>}{options?.map(option => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}{children}</select>;
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
  useEffect(() => { if (input.current) input.current.indeterminate = Boolean(indeterminate); }, [indeterminate]);
  useEffect(() => {
    if (!input.current) return;
    const guard = observeReadonlyChoice(input.current);
    return () => guard.destroy();
  });
  return <div className="nq-field">
    <label className="nq-choice" htmlFor={field.id}>
      <input {...props} {...field} ref={node => { input.current = node; assignRef(ref, node); }} type={kind === 'radio' ? 'radio' : 'checkbox'} role={kind === 'switch' ? 'switch' : props.role} className={cx(`nq-${kind}`, className)} aria-disabled={props.readOnly || props['aria-disabled']} aria-invalid={error ? true : field['aria-invalid']} aria-describedby={[field['aria-describedby'], hintId, errorId].filter(Boolean).join(' ') || undefined}
        onClick={event => { onClick?.(event); if (props.readOnly || isDisabled(event.currentTarget)) { event.preventDefault(); } }}
        onKeyDown={event => { onKeyDown?.(event); if (props.readOnly && (event.key === ' ' || kind === 'radio' && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key))) event.preventDefault(); }}
        onChange={event => { if (!props.readOnly && !isDisabled(event.currentTarget)) onChange?.(event); }} />
      {label}
    </label>
    {hint && <span id={hintId} className="nq-hint">{hint}</span>}
    {error && <span id={errorId} className="nq-error">{error}</span>}
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
  const id = useId();
  return <Field label={label} hint={hint} error={error} required={props.required} controlId={props.id ?? id} className="nq-upload">
    <InputControl {...props} className={className} type="file" onChange={event => { onChange?.(event); onFilesChange?.(Array.from(event.currentTarget.files ?? [])); }} />
    {children}
  </Field>;
}
