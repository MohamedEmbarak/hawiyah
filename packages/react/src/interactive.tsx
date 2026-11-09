import { cloneElement, useEffect, useId, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, ComponentPropsWithRef, HTMLAttributes, ReactElement, ReactNode } from 'react';
import { createComboboxState, getComboboxOptions, getDirection, getNextEnabledIndex, isDisabled, observeTabOverflow, transitionCombobox } from '@hawiyah/core';
import type { ComboboxEvent, Option, Orientation } from '@hawiyah/core';
import { assignRef, cx, Field, useControllable, useFieldControl, useFieldValueRef } from './shared.js';
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
  overflow?: 'menu' | 'scroll';
  overflowLabel?: string;
}
export function Tabs({ items, value, defaultValue, onValueChange, label, orientation = 'horizontal', activationMode = 'automatic', overflow = 'menu', overflowLabel = 'المزيد من التبويبات', className, ...props }: TabsProps) {
  const id = useId();
  const [selected, select] = useControllable(value, defaultValue ?? items.find(item => !item.disabled)?.value ?? '', onValueChange);
  const [focused, setFocused] = useState<string | undefined>();
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const bar = useRef<HTMLDivElement>(null);
  const disclosure = useRef<HTMLDetailsElement>(null);
  const [hidden, setHidden] = useState<number[]>([]);
  const observer = useRef<ReturnType<typeof observeTabOverflow> | undefined>(undefined);
  const latest = useRef({items, overflow, orientation}); latest.current = {items, overflow, orientation};
  const pendingFocus = useRef<{kind: 'summary' | 'tab' | 'menu'; value?: string} | undefined>(undefined);
  const active = items.find(item => item.value === selected && !item.disabled)?.value ?? items.find(item => !item.disabled)?.value;
  const visible = items.filter((item, index) => !hidden.includes(index) && !item.disabled);
  const focusValue = visible.find(item => item.value === focused)?.value ?? visible.find(item => item.value === active)?.value ?? visible[0]?.value;
  const close = () => { if (disclosure.current) disclosure.current.open = false; };
  useEffect(() => {
    const node = bar.current; if (!node) return;
    observer.current = observeTabOverflow({container: node,
      tabs: () => latest.current.items.map(item => buttons.current.get(item.value)!).filter(Boolean),
      enabled: () => latest.current.overflow === 'menu' && latest.current.orientation === 'horizontal',
      onChange: next => {
        const focusedElement = node.ownerDocument.activeElement;
        const menuValue = (focusedElement as HTMLElement | null)?.dataset.hwOverflowValue;
        const itemIndex = latest.current.items.findIndex(item => item.value === menuValue);
        if (menuValue !== undefined && itemIndex >= 0 && next.includes(itemIndex)) pendingFocus.current = {kind:'menu',value:menuValue};
        else {
          if (menuValue !== undefined && itemIndex >= 0) pendingFocus.current = {kind:'tab',value:menuValue};
          else if (next.some(index => buttons.current.get(latest.current.items[index]?.value ?? '') === focusedElement)) pendingFocus.current = {kind:'summary'};
          else if (disclosure.current?.contains(focusedElement)) pendingFocus.current = {kind:next.length ? 'summary' : 'tab'};
          close();
        }
        setHidden(next);
      }});
    const outside = (event: Event) => { if (!node.contains(event.target as Node)) close(); };
    node.ownerDocument.addEventListener('click', outside);
    return () => { observer.current?.destroy(); node.ownerDocument.removeEventListener('click', outside); };
  }, []);
  useEffect(() => { observer.current?.refresh(); const focusedElement = bar.current?.ownerDocument.activeElement; if (focusedElement?.getAttribute('data-hw-overflow-hidden') === 'true' && bar.current?.contains(focusedElement)) disclosure.current?.querySelector('summary')?.focus(); }, [items, overflow, orientation]);
  useEffect(() => { close(); }, [active]);
  useEffect(() => {
    const destination = pendingFocus.current; pendingFocus.current = undefined;
    if (destination?.kind === 'summary') disclosure.current?.querySelector('summary')?.focus();
    else if (destination?.kind === 'tab' && (destination.value ?? focusValue)) buttons.current.get(destination.value ?? focusValue!)?.focus();
    else if (destination?.kind === 'menu') [...(disclosure.current?.querySelectorAll<HTMLElement>('[data-hw-overflow-value]') ?? [])].find(button => button.dataset.hwOverflowValue === destination.value)?.focus();
  }, [hidden, focusValue]);
  return <div {...props} className={cx('hw-tabs', className)}>
    <div className="hw-tab-bar" ref={bar} data-hw-overflow={overflow} data-orientation={orientation}>
    <div className="hw-tab-list" data-hw-overflow={overflow} role="tablist" aria-label={label} aria-orientation={orientation} aria-hidden={hidden.length === items.length || undefined}>
      {items.map((item, index) => <button key={item.value} type="button" role="tab" className="hw-tab" id={`${id}-tab-${index}`} aria-controls={`${id}-panel-${index}`} aria-selected={active === item.value} aria-hidden={hidden.includes(index) || undefined} data-hw-overflow-hidden={hidden.includes(index) || undefined} tabIndex={!hidden.includes(index) && focusValue === item.value ? 0 : -1} disabled={item.disabled}
        ref={node => { if (node) buttons.current.set(item.value, node); else buttons.current.delete(item.value); }}
        onFocus={() => setFocused(item.value)} onClick={() => { if (!item.disabled) select(item.value); }}
        onKeyDown={event => {
          if (event.altKey || event.ctrlKey || event.metaKey || event.nativeEvent.isComposing) return;
          const keys = orientation === 'vertical' ? ['ArrowDown', 'ArrowUp', 'Home', 'End'] : ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
          if (!keys.includes(event.key)) return;
          event.preventDefault();
          const next = items[getNextEnabledIndex(index, event.key, items.map((candidate, i) => ({disabled: candidate.disabled || hidden.includes(i)})), getDirection(event.currentTarget), orientation)];
          if (!next) return;
          setFocused(next.value);
          buttons.current.get(next.value)?.focus();
          if (activationMode === 'automatic') select(next.value);
        }}>{item.label}</button>)}
    </div>
    <details ref={disclosure} className="hw-tabs-overflow" hidden={!hidden.length} onKeyDown={event => { if (event.key === 'Escape' && event.currentTarget.open) { event.preventDefault(); close(); event.currentTarget.querySelector('summary')?.focus(); } }}>
      <summary className="hw-tab-overflow-trigger" aria-label={overflowLabel} data-active={hidden.some(index => items[index]?.value === active) || undefined}>…</summary>
      <div className="hw-tab-overflow-menu">{hidden.map(index => { const item = items[index]; return item && <button key={item.value} type="button" className="hw-tab-overflow-item" data-hw-overflow-value={item.value} disabled={item.disabled} aria-pressed={item.value === active} onClick={() => { if (item.disabled) return; select(item.value); close(); disclosure.current?.querySelector('summary')?.focus(); }}>{item.label}</button>; })}</div>
    </details>
    </div>
    {items.map((item, index) => <section key={item.value} className="hw-tab-panel" id={`${id}-panel-${index}`} role="tabpanel" aria-labelledby={`${id}-tab-${index}`} tabIndex={0} hidden={active !== item.value}>{item.content}</section>)}
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
    <dialog {...props} ref={node => { dialog.current = node; assignRef(ref, node); }} className={cx('hw-dialog', className)} aria-labelledby={props['aria-labelledby'] ?? `${id}-title`} aria-describedby={props['aria-describedby'] ?? (description ? `${id}-description` : undefined)}
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
      <header className="hw-dialog-header"><h2 id={`${id}-title`}>{title}</h2><Button variant="ghost" aria-label={closeLabel} onClick={close}>×</Button></header>
      <div className="hw-dialog-body">{description && <p id={`${id}-description`}>{description}</p>}{typeof children === 'function' ? children(context) : children}</div>
      {footer && <footer className="hw-dialog-footer">{typeof footer === 'function' ? footer(context) : footer}</footer>}
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
  const presenceRef = useFieldValueRef((node: HTMLInputElement | null) => { input.current = node; assignRef(ref, node); });
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
  return <div className="hw-combobox" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) dispatch({ type: 'close' }); }}>
    <input {...props} {...field} ref={presenceRef} form={form} disabled={disabled} className={cx('hw-input', className)} type="text" role="combobox" autoComplete="off" aria-autocomplete="list" aria-readonly={props.readOnly || undefined} aria-expanded={open} aria-controls={listId} aria-activedescendant={open && active && !active.disabled ? `${field.id}-option-${state.activeIndex}` : undefined}
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
    <ul className="hw-listbox" id={listId} role="listbox" aria-label={props['aria-label']} aria-labelledby={field['aria-labelledby']} hidden={!open}>
      {results.map((option, index) => <li key={option.value} id={`${field.id}-option-${index}`} className="hw-option" role="option" aria-selected={selected === option.value} aria-disabled={option.disabled || undefined} data-active={state.activeIndex === index ? 'true' : undefined} data-state={state.activeIndex === index ? 'active' : undefined}
        onPointerDown={event => event.preventDefault()} onClick={() => { if (!option.disabled) { dispatch({ type: 'select', value: option.value }); input.current?.focus(); } }}>{option.label}</li>)}
      {!results.length && <li role="presentation" className="hw-hint">{emptyMessage}</li>}
    </ul>
    <span id={statusId} className="hw-sr-only" role="status" aria-live="polite" aria-atomic="true">{open ? getResultsMessage(results.length) : ''}</span>
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
  placement?: 'top' | 'bottom' | 'start' | 'end';
  align?: 'start' | 'center' | 'end';
}
export function Tooltip({ children, content, placement = 'top', align = 'start', className, ref, onMouseEnter, onMouseLeave, onFocus, onBlur, onKeyDown, ...props }: TooltipProps) {
  const id = useId();
  const root = useRef<HTMLSpanElement>(null);
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
  useEffect(() => {
    const doc = root.current?.ownerDocument;
    if (!open || !doc) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      event.preventDefault(); event.stopPropagation();
      clearTimeout(hideTimer.current); setOpen(false);
    };
    doc.addEventListener('keydown', escape);
    return () => doc.removeEventListener('keydown', escape);
  }, [open]);
  return <span {...props} data-hw="tooltip" className={className} ref={node => { root.current = node; assignRef(ref, node); }}
    onMouseEnter={event => { onMouseEnter?.(event); hovered.current = true; if (!event.defaultPrevented) show(); }}
    onMouseLeave={event => { onMouseLeave?.(event); hovered.current = false; hideAfterPointerTravel(); }}
    onFocus={event => { onFocus?.(event); focused.current = true; if (!event.defaultPrevented) show(); }}
    onBlur={event => { onBlur?.(event); if (!event.currentTarget.contains(event.relatedTarget as Node | null)) { focused.current = false; hideAfterPointerTravel(); } }}
    onKeyDown={event => { onKeyDown?.(event); if (event.key === 'Escape' && open && !event.defaultPrevented) { event.preventDefault(); event.stopPropagation(); clearTimeout(hideTimer.current); setOpen(false); } }}>
    {cloneElement(children, { 'aria-describedby': [children.props['aria-describedby'], id].filter(Boolean).join(' ') })}
    <span className="hw-tooltip" role="tooltip" id={id} data-placement={placement} data-align={align} hidden={!open}>{content}</span>
  </span>;
}
