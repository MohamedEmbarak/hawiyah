import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import { observeFieldValue, type FieldValueElement, type FieldValueObserver } from '@nasaq/core';
import type { ComponentPropsWithRef, Dispatch, HTMLAttributes, ReactNode, Ref, SetStateAction } from 'react';

export const cx = (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' ');
export function useFieldValueRef<T extends FieldValueElement>(ref: Ref<T> | undefined) {
  const observer = useRef<FieldValueObserver | undefined>(undefined);
  useEffect(() => { observer.current?.refresh(); });
  return useCallback((element: T | null) => {
    observer.current?.destroy(); observer.current = undefined;
    if (!element) { assignRef(ref, null); return; }
    const current = observeFieldValue(element); observer.current = current;
    const cleanup = typeof ref === 'function' ? ref(element) : (assignRef(ref, element), undefined);
    return () => {
      current.destroy(); if (observer.current === current) observer.current = undefined;
      if (typeof cleanup === 'function') cleanup(); else assignRef(ref, null);
    };
  }, [ref]);
}
export function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}
export function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (value: T) => void): [T, (value: T) => void] {
  const [internal, setInternal] = useState(defaultValue);
  return [value === undefined ? internal : value, (next) => {
    if (value === undefined) setInternal(next);
    if (next !== (value === undefined ? internal : value)) onChange?.(next);
  }];
}
export type { Dispatch, SetStateAction };
export interface FieldDecoration {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
}
interface FieldContextValue { id: string; labelId?: string; description?: string; invalid: boolean; required?: boolean }
const FieldContext = createContext<FieldContextValue | undefined>(undefined);
export interface FieldProps extends ComponentPropsWithRef<'div'>, FieldDecoration {
  controlId?: string;
  required?: boolean;
}
/** A label and description provider for a single Nasaq form control. */
export function Field({ label, hint, error, controlId, required, children, className, ...props }: FieldProps) {
  const generatedId = useId();
  const id = controlId ?? `nq-field-${generatedId}`;
  const description = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;
  return <FieldContext.Provider value={{ id, labelId: label != null ? `${id}-label` : undefined, description, invalid: Boolean(error), required }}>
    <div {...props} className={cx('nq-field', className)}>
      {label != null && <label className="nq-label" htmlFor={id} id={`${id}-label`}>{label}{required && <span aria-hidden="true"> *</span>}</label>}
      {children}
      {hint && <div className="nq-hint" id={`${id}-hint`}>{hint}</div>}
      {error && <div className="nq-error" id={`${id}-error`}>{error}</div>}
    </div>
  </FieldContext.Provider>;
}
export function useFieldControl(props: { id?: string; required?: boolean; 'aria-label'?: string; 'aria-labelledby'?: string; 'aria-describedby'?: string; 'aria-invalid'?: HTMLAttributes<HTMLElement>['aria-invalid'] }) {
  const field = useContext(FieldContext);
  const generated = useId();
  return {
    id: props.id ?? field?.id ?? `nq-input-${generated}`,
    required: props.required ?? field?.required,
    'aria-labelledby': props['aria-labelledby'] ?? (props['aria-label'] ? undefined : field?.labelId),
    'aria-describedby': [props['aria-describedby'], field?.description].filter(Boolean).join(' ') || undefined,
    'aria-invalid': props['aria-invalid'] ?? (field?.invalid || undefined),
  };
}
