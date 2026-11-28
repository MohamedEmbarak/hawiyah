import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import { bindFragmentLink, getFragmentHref, hasText, observeFieldValue, requireText, sameValue, type FieldValueElement, type FieldValueObserver, type FragmentLinkOptions } from '@hawiyah/core';
import type { ComponentPropsWithRef, Dispatch, HTMLAttributes, ReactNode, Ref, SetStateAction } from 'react';

export const cx = (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' ');
/** Text the application must supply. Missing text warns once in development and renders nothing. */
export function text<T>(component: string, name: string, value: T | null | undefined, when?: string): T | undefined {
  return requireText(component, name, value, when) ? value as T : undefined;
}
/** A root that needs an accessible name: `label`, or an aria-label / aria-labelledby the application passes. */
export type RootName = { label: string } | { label?: string; 'aria-label': string } | { label?: string; 'aria-labelledby': string };
/** A form field that needs a name: its visible `label`, or an aria-label / aria-labelledby on the control. */
export type FieldName = { label: ReactNode } | { label?: ReactNode; 'aria-label': string } | { label?: ReactNode; 'aria-labelledby': string };
/** The aria-label of a root: the application's aria-label, else `label`. An aria-labelledby satisfies the requirement. */
export function rootLabel(component: string, props: { 'aria-label'?: string; 'aria-labelledby'?: string }, label: string | undefined, name = 'label'): string | undefined {
  if (hasText(props['aria-label'])) return props['aria-label'];
  if (hasText(props['aria-labelledby'])) return hasText(label) ? label : undefined;
  return text(component, name, label);
}
/** Custom validity for a failed constraint. A missing message still blocks submission. */
export function validity(component: string, name: string, invalid: boolean, message: string | undefined): string {
  if (!invalid) return '';
  return text(component, name, message) ?? ' ';
}
/** Binds a packaged in-page link once mounted. The rendered href stays the bare "#id". */
export function useFragmentLink(id: string | undefined, options: Omit<FragmentLinkOptions, 'id'> = {}) {
  const latest = useRef({ id, options }); latest.current = { id, options };
  const { updateHash } = options; const custom = Boolean(options.navigate);
  const callback = useCallback((link: HTMLAnchorElement | null) => {
    if (!link) return;
    const binding = bindFragmentLink(link, { id: () => latest.current.id ?? '', updateHash, navigate: custom ? (target, element) => latest.current.options.navigate?.(target, element) : undefined });
    return () => binding.destroy();
  }, [updateHash, custom]);
  return { ref: callback, href: id ? getFragmentHref(id) : undefined };
}
/** Warns in development, after mount, when an application brand has no accessible text. */
export function useBrandCheck(component: string, brandLabel: string | undefined) {
  const brand = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const node = brand.current;
    if (!node || hasText(brandLabel)) return;
    const named = (element: Element) => hasText(element.getAttribute('aria-label')) || hasText(element.getAttribute('aria-labelledby'));
    const image = Array.from(node.querySelectorAll('img')).some(img => hasText(img.getAttribute('alt')));
    if (hasText(node.textContent) || named(node) || Array.from(node.querySelectorAll('[aria-label], [aria-labelledby]')).some(named) || image) return;
    requireText(component, 'brandLabel', undefined, 'the brand has no text');
  });
  return brand;
}
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
    if (!sameValue(next, value === undefined ? internal : value)) onChange?.(next);
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
/** Space-separated id list in the given order, without duplicates; undefined when empty. */
export function descriptionIds(...values: (string | undefined)[]): string | undefined {
  const ids = values.flatMap(value => value?.trim().split(/\s+/) ?? []).filter(Boolean);
  return [...new Set(ids)].join(' ') || undefined;
}
export interface FieldProps extends ComponentPropsWithRef<'div'>, FieldDecoration {
  controlId?: string;
  required?: boolean;
  /** @internal Set by a component for a message it produced itself; the application's `error` has no role. */
  errorRole?: 'alert';
}
/** The one required marker, last child of label.hw-label or legend.hw-label. */
export const requiredMarker = <span className="hw-required-marker" aria-hidden="true"> *</span>;
/** A label and description provider for a single Hawiyah form control. */
export function Field(props: FieldProps) {
  return <FieldLayout {...props} />;
}
/** A decorated native control can add its own helpers inside a surrounding Field. */
export function ControlField(props: FieldProps) {
  const parent = useContext(FieldContext);
  return <FieldLayout {...props} parent={parent} />;
}
function FieldLayout({ label, hint, error, errorRole, controlId, required, children, className, parent, ...props }: FieldProps & {parent?: FieldContextValue}) {
  const generatedId = useId();
  const id = controlId ?? parent?.id ?? `hw-field-${generatedId}`;
  const decorationId = parent ? `hw-field-${generatedId}` : id;
  const labelId = label != null ? `${decorationId}-label` : parent?.labelId;
  const description = descriptionIds(parent?.description, hint ? `${decorationId}-hint` : undefined, error ? `${decorationId}-error` : undefined);
  const isRequired = required ?? parent?.required;
  return <FieldContext.Provider value={{ id, labelId, description, invalid: Boolean(error || parent?.invalid), required: isRequired }}>
    <div {...props} className={cx('hw-field', className)}>
      {label != null && <label className="hw-label" htmlFor={id} id={labelId}>{label}{isRequired && requiredMarker}</label>}
      {children}
      {hint && <p className="hw-hint" id={`${decorationId}-hint`}>{hint}</p>}
      {error && <p className="hw-error" id={`${decorationId}-error`} role={errorRole}>{error}</p>}
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
