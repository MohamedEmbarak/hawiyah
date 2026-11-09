import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import { observeFieldValue, type FieldValueElement, type FieldValueObserver } from '@hawiyah/core';
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
function descriptionIds(...values: (string | undefined)[]): string | undefined {
  const ids = values.flatMap(value => value?.trim().split(/\s+/) ?? []).filter(Boolean);
  return [...new Set(ids)].join(' ') || undefined;
}
export interface FieldProps extends ComponentPropsWithRef<'div'>, FieldDecoration {
  controlId?: string;
  required?: boolean;
}
/** A label and description provider for a single Hawiyah form control. */
export function Field(props: FieldProps) {
  return <FieldLayout {...props} />;
}
/** A decorated native control can add its own helpers inside a surrounding Field. */
export function ControlField(props: FieldProps) {
  const parent = useContext(FieldContext);
  return <FieldLayout {...props} parent={parent} />;
}
function FieldLayout({ label, hint, error, controlId, required, children, className, parent, ...props }: FieldProps & {parent?: FieldContextValue}) {
  const generatedId = useId();
  const id = controlId ?? parent?.id ?? `hw-field-${generatedId}`;
  const decorationId = parent ? `hw-field-${generatedId}` : id;
  const labelId = label != null ? `${decorationId}-label` : parent?.labelId;
  const description = descriptionIds(parent?.description, hint ? `${decorationId}-hint` : undefined, error ? `${decorationId}-error` : undefined);
  const isRequired = required ?? parent?.required;
  return <FieldContext.Provider value={{ id, labelId, description, invalid: Boolean(error || parent?.invalid), required: isRequired }}>
    <div {...props} className={cx('hw-field', className)}>
      {label != null && <label className="hw-label" htmlFor={id} id={labelId}>{label}{isRequired && <span className="hw-required-marker" aria-hidden="true"> *</span>}</label>}
      {children}
      {hint && <div className="hw-hint" id={`${decorationId}-hint`}>{hint}</div>}
      {error && <div className="hw-error" id={`${decorationId}-error`}>{error}</div>}
    </div>
  </FieldContext.Provider>;
}
export function useFieldControl(props: { id?: string; required?: boolean; 'aria-label'?: string; 'aria-labelledby'?: string; 'aria-describedby'?: string; 'aria-invalid'?: HTMLAttributes<HTMLElement>['aria-invalid'] }) {
  const field = useContext(FieldContext);
  const generated = useId();
  return {
    id: props.id ?? field?.id ?? `hw-input-${generated}`,
    required: props.required ?? field?.required,
    'aria-labelledby': props['aria-labelledby'] ?? (props['aria-label'] ? undefined : field?.labelId),
    'aria-describedby': descriptionIds(props['aria-describedby'], field?.description),
    'aria-invalid': props['aria-invalid'] ?? (field?.invalid || undefined),
  };
}
