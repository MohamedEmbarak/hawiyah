import { cloneElement, useEffect, useId, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, ComponentPropsWithRef, HTMLAttributes, ReactElement, ReactNode } from 'react';
import { createComboboxState, getComboboxOptions, getDirection, getNextEnabledIndex, isDisabled, transitionCombobox } from '@nasaq/core';
import type { ComboboxEvent, Option, Orientation } from '@nasaq/core';
import { assignRef, cx, Field, useControllable, useFieldControl } from './shared.js';
import type { FieldDecoration } from './shared.js';
import { Button } from './forms.js';

export interface TabItem { value: string; label: ReactNode; content: ReactNode; disabled?: boolean }
export interface TabsProps extends Omit<ComponentPropsWithRef<'div'>, 'defaultValue' | 'onChange'> {
  items: readonly TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  label: string;
  orientation?: Orientation;
  activationMode?: 'automatic' | 'manual';
}
export function Tabs({ items, value, defaultValue, onValueChange, label, orientation = 'horizontal', activationMode = 'automatic', className, ...props }: TabsProps) {
  const id = useId();
  const [selected, select] = useControllable(value, defaultValue ?? items.find(item => !item.disabled)?.value ?? '', onValueChange);
  const [focused, setFocused] = useState<string | undefined>();
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const active = items.find(item => item.value === selected && !item.disabled)?.value ?? items.find(item => !item.disabled)?.value;
  const focusValue = items.find(item => item.value === focused && !item.disabled)?.value ?? active;
  return <div {...props} className={cx('nq-tabs', className)}>
    <div className="nq-tab-list" role="tablist" aria-label={label} aria-orientation={orientation}>
      {items.map((item, index) => <button key={item.value} type="button" role="tab" className="nq-tab" id={`${id}-tab-${index}`} aria-controls={`${id}-panel-${index}`} aria-selected={active === item.value} tabIndex={focusValue === item.value ? 0 : -1} disabled={item.disabled}
        ref={node => { if (node) buttons.current.set(item.value, node); else buttons.current.delete(item.value); }}
        onFocus={() => setFocused(item.value)} onClick={() => select(item.value)}
        onKeyDown={event => {
          const keys = orientation === 'vertical' ? ['ArrowDown', 'ArrowUp', 'Home', 'End'] : ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
          if (!keys.includes(event.key)) return;
          event.preventDefault();
          const next = items[getNextEnabledIndex(index, event.key, items, getDirection(event.currentTarget), orientation)];
          if (!next) return;
          setFocused(next.value);
          buttons.current.get(next.value)?.focus();
          if (activationMode === 'automatic') select(next.value);
        }}>{item.label}</button>)}
    </div>
    {items.map((item, index) => <section key={item.value} className="nq-tab-panel" id={`${id}-panel-${index}`} role="tabpanel" aria-labelledby={`${id}-tab-${index}`} tabIndex={0} hidden={active !== item.value}>{item.content}</section>)}
  </div>;
}

export interface DialogProps extends Omit<ComponentPropsWithRef<'dialog'>, 'open' | 'children' | 'title'> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  trigger?: ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>;
  children?: ReactNode | ((context: { close: () => void }) => ReactNode);
  footer?: ReactNode | ((context: { close: () => void }) => ReactNode);
  closeOnBackdrop?: boolean;
  closeLabel?: string;
}
export function Dialog({ open: controlled, defaultOpen = false, onOpenChange, title, description, trigger, children, footer, closeOnBackdrop = true, closeLabel = 'Close', ref, className, onCancel, onClose, onClick, onPointerDown, onPointerCancel, ...props }: DialogProps) {
  const id = useId();
  const [open, setOpen] = useControllable(controlled, defaultOpen, onOpenChange);
  const [nativeCloseVersion, setNativeCloseVersion] = useState(0);
  const dialog = useRef<HTMLDialogElement | null>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const backdropStarted = useRef(false);
  const close = () => { backdropStarted.current = false; setOpen(false); };
  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (open && !node.open) {
      backdropStarted.current = false;
      previousFocus.current = node.ownerDocument.activeElement as HTMLElement | null;
      node.showModal();
    } else if (!open && node.open) {
      backdropStarted.current = false;
      node.close();
      if (previousFocus.current?.isConnected) previousFocus.current.focus();
    }
  }, [open, nativeCloseVersion]);
  useEffect(() => {
    const node = dialog.current;
    return () => {
      if (node?.open) {
        node.close();
        if (previousFocus.current?.isConnected) previousFocus.current.focus();
      }
    };
  }, []);
  const context = { close };
  return <>
    {trigger && cloneElement(trigger, { onClick: event => { trigger.props.onClick?.(event); if (!event.defaultPrevented) setOpen(true); }, 'aria-haspopup': 'dialog' })}
    <dialog {...props} ref={node => { dialog.current = node; assignRef(ref, node); }} className={cx('nq-dialog', className)} aria-labelledby={props['aria-labelledby'] ?? `${id}-title`} aria-describedby={props['aria-describedby'] ?? (description ? `${id}-description` : undefined)}
      onCancel={event => { backdropStarted.current = false; onCancel?.(event); if (!event.defaultPrevented) { event.preventDefault(); close(); } }}
      onClose={event => {
        backdropStarted.current = false;
        onClose?.(event);
        if (open && !event.currentTarget.open) {
          close();
          if (controlled !== undefined) setNativeCloseVersion(version => version + 1);
        }
      }}
      onPointerDown={event => {
        onPointerDown?.(event);
        const bounds = event.currentTarget.getBoundingClientRect();
        backdropStarted.current = !event.defaultPrevented && event.button === 0 && event.target === event.currentTarget &&
          (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom);
      }}
      onPointerCancel={event => { backdropStarted.current = false; onPointerCancel?.(event); }}
      onClick={event => {
        const started = backdropStarted.current;
        backdropStarted.current = false;
        onClick?.(event);
        if (event.defaultPrevented || !closeOnBackdrop || !started || event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
      }}>
      <header className="nq-dialog-header"><h2 id={`${id}-title`}>{title}</h2><Button variant="ghost" aria-label={closeLabel} onClick={close}>×</Button></header>
      <div className="nq-dialog-body">{description && <p id={`${id}-description`}>{description}</p>}{typeof children === 'function' ? children(context) : children}</div>
      {footer && <footer className="nq-dialog-footer">{typeof footer === 'function' ? footer(context) : footer}</footer>}
    </dialog>
  </>;
}

export interface ComboboxProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'onChange' | 'type' | 'children'>, FieldDecoration {
  options: readonly Option[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, option?: Option) => void;
  onInputChange?: (query: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  emptyMessage?: string;
  getResultsMessage?: (count: number) => string;
  requiredMessage?: string;
}
function ComboboxControl({ options, value, defaultValue = '', onValueChange, onInputChange, open: controlledOpen, defaultOpen = false, onOpenChange, emptyMessage = 'No options found', getResultsMessage = count => `${count} results available`, requiredMessage = 'Choose an option from the list.', className, ref, onKeyDown, onFocus, onBlur, onClick, name, form, disabled, ...props }: Omit<ComboboxProps, keyof FieldDecoration>) {
  const field = useFieldControl(props);
  const [state, setState] = useState(() => ({ ...createComboboxState(options, value ?? defaultValue), open: controlledOpen ?? defaultOpen }));
  const input = useRef<HTMLInputElement | null>(null);
  const [ancestorDisabled, setAncestorDisabled] = useState(false);
  const blocked = () => disabled || props.readOnly || !!(input.current && isDisabled(input.current));
  const requestedValue = value ?? state.value;
  const selected = options.some(option => option.value === requestedValue && !option.disabled) ? requestedValue : '';
  const open = !disabled && !ancestorDisabled && !props.readOnly && (controlledOpen ?? state.open);
  const query = value !== undefined && state.value && state.value !== selected ? options.find(option => option.value === selected)?.label ?? '' : state.query;
  const effectiveState = { ...state, value: selected, query, open };
  const results = getComboboxOptions(effectiveState, options);
  const active = results[state.activeIndex];
  const listId = `${field.id}-listbox`;
  const statusId = `${field.id}-status`;
  const lastEmittedValue = useRef<string | undefined>(undefined);
  const latestOptions = useRef(options);
  const previousOptions = useRef(options);
  latestOptions.current = options;
  useEffect(() => {
    const element = input.current;
    if (!element) return;
    const refresh = () => setAncestorDisabled(isDisabled(element));
    const Observer = element.ownerDocument.defaultView?.MutationObserver;
    const observer = Observer ? new Observer(refresh) : undefined;
    for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
      if (ancestor.localName === 'fieldset') observer?.observe(ancestor, { attributes: true, attributeFilter: ['disabled'] });
    }
    refresh();
    return () => observer?.disconnect();
  }, []);
  useEffect(() => {
    if (disabled || ancestorDisabled || props.readOnly) setState(current => ({ ...current, open: false, activeIndex: -1 }));
  }, [disabled, ancestorDisabled, props.readOnly]);
  useEffect(() => {
    if (value === undefined) return;
    if (value === lastEmittedValue.current) {
      lastEmittedValue.current = undefined;
      setState(current => ({ ...current, value }));
    } else {
      setState(current => ({ ...createComboboxState(latestOptions.current, value), open: current.open }));
    }
  }, [value]);
  useEffect(() => {
    const previousLabel = previousOptions.current.find(option => option.value === selected)?.label;
    const nextLabel = options.find(option => option.value === selected)?.label;
    previousOptions.current = options;
    if (!selected || nextLabel === undefined || previousLabel === nextLabel) return;
    setState(current => current.value === selected && current.query === previousLabel
      ? { ...current, query: nextLabel, activeIndex: -1 } : current);
  }, [options, selected]);
  useEffect(() => {
    input.current?.setCustomValidity(field.required && !selected ? requiredMessage : '');
  }, [field.required, selected, requiredMessage]);
  useEffect(() => {
    const formElement = input.current?.form;
    let mounted = true;
    const reset = (event: Event) => {
      queueMicrotask(() => {
        if (mounted && !event.defaultPrevented && value === undefined) setState(createComboboxState(latestOptions.current, defaultValue));
      });
    };
    formElement?.addEventListener('reset', reset);
    return () => { mounted = false; formElement?.removeEventListener('reset', reset); };
  }, [value, defaultValue, form]);
  useEffect(() => {
    if (open && state.activeIndex >= 0) input.current?.ownerDocument.getElementById(`${field.id}-option-${state.activeIndex}`)?.scrollIntoView?.({ block: 'nearest' });
  }, [open, state.activeIndex, field.id]);
  function dispatch(event: ComboboxEvent) {
    if (blocked() && event.type !== 'close' && event.type !== 'reset') return;
    const next = transitionCombobox(effectiveState, event, options);
    setState(next);
    if (next.value !== selected) {
      lastEmittedValue.current = next.value;
      onValueChange?.(next.value, options.find(option => option.value === next.value));
    }
    if (next.open !== open) onOpenChange?.(next.open);
  }
  return <div className="nq-combobox" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) dispatch({ type: 'close' }); }}>
    <input {...props} {...field} ref={node => { input.current = node; assignRef(ref, node); }} form={form} disabled={disabled} className={cx('nq-input', className)} type="text" role="combobox" autoComplete="off" aria-autocomplete="list" aria-readonly={props.readOnly || undefined} aria-expanded={open} aria-controls={listId} aria-activedescendant={open && active && !active.disabled ? `${field.id}-option-${state.activeIndex}` : undefined}
      value={query} onChange={event => { if (blocked()) { event.currentTarget.value = query; return; } dispatch({ type: 'input', query: event.currentTarget.value }); onInputChange?.(event.currentTarget.value); }}
      onFocus={event => { onFocus?.(event); if (!event.defaultPrevented) dispatch({ type: 'open' }); }} onBlur={onBlur}
      onClick={event => { onClick?.(event); if (!event.defaultPrevented && !open) dispatch({ type: 'open' }); }}
      onKeyDown={event => {
        onKeyDown?.(event);
        if (event.defaultPrevented || event.nativeEvent.isComposing || blocked()) return;
        if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
          if (!open && (event.key === 'Home' || event.key === 'End')) return;
          event.preventDefault();
          dispatch({ type: 'navigate', key: event.key as 'ArrowDown' | 'ArrowUp' | 'Home' | 'End' });
        } else if (event.key === 'Enter' && open && active && !active.disabled) {
          event.preventDefault(); dispatch({ type: 'select', value: active.value });
        } else if (event.key === 'Escape' && open) {
          event.preventDefault(); event.stopPropagation(); dispatch({ type: 'close' });
        } else if (event.key === 'Tab') dispatch({ type: 'close' });
      }} />
    <input type="hidden" name={name} form={form} value={selected} disabled={disabled} />
    <ul className="nq-listbox" id={listId} role="listbox" aria-label={props['aria-label']} aria-labelledby={field['aria-labelledby']} hidden={!open}>
      {results.map((option, index) => <li key={option.value} id={`${field.id}-option-${index}`} className="nq-option" role="option" aria-selected={selected === option.value} aria-disabled={option.disabled || undefined} data-active={state.activeIndex === index ? 'true' : undefined} data-state={state.activeIndex === index ? 'active' : undefined}
        onPointerDown={event => event.preventDefault()} onClick={() => { if (!option.disabled) { dispatch({ type: 'select', value: option.value }); input.current?.focus(); } }}>{option.label}</li>)}
      {!results.length && <li role="presentation" className="nq-hint">{emptyMessage}</li>}
    </ul>
    <span id={statusId} className="nq-sr-only" role="status" aria-live="polite" aria-atomic="true">{open ? getResultsMessage(results.length) : ''}</span>
  </div>;
}
export function Combobox({ label, hint, error, ...props }: ComboboxProps) {
  const id = useId();
  if (label == null && hint == null && error == null) return <ComboboxControl {...props} />;
  return <Field label={label} hint={hint} error={error} required={props.required} controlId={props.id ?? id}><ComboboxControl {...props} /></Field>;
}

export interface TooltipProps extends Omit<ComponentPropsWithRef<'span'>, 'children' | 'content'> {
  children: ReactElement<HTMLAttributes<HTMLElement>>;
  content: string;
}
export function Tooltip({ children, content, className, onMouseEnter, onMouseLeave, onFocus, onBlur, onKeyDown, ...props }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const hovered = useRef(false);
  const focused = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const show = () => { clearTimeout(hideTimer.current); setOpen(true); };
  const hideAfterPointerTravel = () => {
    clearTimeout(hideTimer.current);
    if (!hovered.current && !focused.current) hideTimer.current = setTimeout(() => setOpen(false), 120);
  };
  useEffect(() => () => clearTimeout(hideTimer.current), []);
  return <span {...props} data-nq="tooltip" className={className}
    onMouseEnter={event => { onMouseEnter?.(event); hovered.current = true; if (!event.defaultPrevented) show(); }}
    onMouseLeave={event => { onMouseLeave?.(event); hovered.current = false; hideAfterPointerTravel(); }}
    onFocus={event => { onFocus?.(event); focused.current = true; if (!event.defaultPrevented) show(); }}
    onBlur={event => { onBlur?.(event); if (!event.currentTarget.contains(event.relatedTarget as Node | null)) { focused.current = false; hideAfterPointerTravel(); } }}
    onKeyDown={event => { onKeyDown?.(event); if (event.key === 'Escape' && open && !event.defaultPrevented) { event.preventDefault(); event.stopPropagation(); clearTimeout(hideTimer.current); setOpen(false); } }}>
    {cloneElement(children, { 'aria-describedby': [children.props['aria-describedby'], id].filter(Boolean).join(' ') })}
    <span className="nq-tooltip" role="tooltip" id={id} hidden={!open}>{content}</span>
  </span>;
}
