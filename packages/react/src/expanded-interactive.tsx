import { cloneElement, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, ComponentPropsWithRef, CSSProperties, ReactElement, ReactNode } from 'react';
import { getDirection, getNextEnabledIndex, observeReadonlyChoice, prepareToastDismissFocus } from '@hawiyah/core';
import type { Option } from '@hawiyah/core';
import { Button } from './forms.js';
import { Dialog } from './interactive.js';
import type { DialogProps } from './interactive.js';
import { assignRef, cx, useControllable } from './shared.js';
import { useFormReset } from './expanded-shared.js';

interface ToggleBase extends Omit<ComponentPropsWithRef<'fieldset'>, 'defaultValue' | 'onChange'> { options: readonly Option[]; label: ReactNode; name?: string; form?: string; readOnly?: boolean; variant?: 'segmented' | 'outline' }
export interface SingleToggleGroupProps extends ToggleBase { multiple?: false; value?: string; defaultValue?: string; onValueChange?: (value: string) => void }
export interface MultipleToggleGroupProps extends ToggleBase { multiple: true; value?: readonly string[]; defaultValue?: readonly string[]; onValueChange?: (value: string[]) => void }
export type ToggleGroupProps = SingleToggleGroupProps | MultipleToggleGroupProps;
export function ToggleGroup(props: ToggleGroupProps) {
  const { options, label, name, form, readOnly, variant = 'segmented', multiple, value, defaultValue, onValueChange, className, disabled, ref, ...native } = props;
  const group = useRef<HTMLFieldSetElement | null>(null);
  useEffect(() => { const guards = Array.from(group.current?.querySelectorAll<HTMLInputElement>('input[type="radio"]') ?? [], observeReadonlyChoice); return () => guards.forEach(guard => guard.destroy()); });
  const id = useId(); const input = useRef<HTMLInputElement | null>(null); const [internal, setInternal] = useState<string | readonly string[]>(defaultValue ?? (multiple ? [] : '')); const current = value ?? internal;
  const change = (next: string | string[]) => { if (disabled || readOnly) return; if (value === undefined) setInternal(next); if (props.multiple) props.onValueChange?.(next as string[]); else props.onValueChange?.(next as string); };
  useFormReset(input, () => { if (value === undefined) setInternal(defaultValue ?? (multiple ? [] : '')); }, form);
  const values = typeof current === 'string' ? [current] : current;
  return <fieldset {...native} ref={node => {group.current=node;assignRef(ref,node);}} data-hw-readonly={readOnly || undefined} className={cx('hw-toggle-group', className)} data-variant={variant} disabled={disabled}><legend className="hw-label">{label}</legend>{options.map(option => multiple ? <Button key={option.value} variant="secondary" aria-pressed={values.includes(option.value)} aria-disabled={readOnly || undefined} disabled={disabled || option.disabled} onClick={() => change(values.includes(option.value) ? values.filter(item => item !== option.value) : [...values, option.value])}>{option.label}</Button> : <label className="hw-choice" key={option.value}><input className="hw-radio" type="radio" name={name ?? id} form={form} value={option.value} readOnly={readOnly} aria-disabled={readOnly || undefined} disabled={option.disabled} checked={current === option.value} onChange={() => change(option.value)} />{option.label}</label>)}<input ref={input} type="hidden" form={form} disabled />{multiple && values.filter(item => options.some(option => option.value === item && !option.disabled)).map(item => <input key={item} type="hidden" name={name} form={form} value={item} disabled={disabled} />)}</fieldset>;
}
export interface PopoverProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> { title: ReactNode; trigger: ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void }
export function Popover({ title, trigger, open: controlled, defaultOpen = false, onOpenChange, children, className, ref, ...props }: PopoverProps) {
  const id = useId(); const root = useRef<HTMLDivElement | null>(null); const opener = useRef<HTMLButtonElement | null>(null); const [open, setOpen] = useControllable(controlled, defaultOpen, onOpenChange);
  useEffect(() => {
    if (!open) return; const doc = root.current?.ownerDocument; const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); }; const escape = (event: KeyboardEvent) => { if (event.key === 'Escape' && !event.defaultPrevented) { event.preventDefault(); setOpen(false); opener.current?.focus(); } };
    doc?.addEventListener('pointerdown', outside); doc?.addEventListener('keydown', escape); return () => { doc?.removeEventListener('pointerdown', outside); doc?.removeEventListener('keydown', escape); };
  }, [open, setOpen]);
  return <div {...props} className={cx('hw-popover', className)} ref={node => { root.current = node; assignRef(ref, node); }}>{cloneElement(trigger, { 'aria-expanded': open, 'aria-controls': `${id}-panel`, onClick: event => { trigger.props.onClick?.(event); if (!event.defaultPrevented) { opener.current = event.currentTarget; setOpen(!open); } } })}<section id={`${id}-panel`} className="hw-popover-panel" role="region" aria-labelledby={`${id}-title`} hidden={!open}><h3 id={`${id}-title`}>{title}</h3>{children}</section></div>;
}
export interface MenuItem { value: string; label: ReactNode; disabled?: boolean; href?: string; onSelect?: () => void }
export interface MenuProps extends Omit<ComponentPropsWithRef<'div'>, 'onSelect'> { items: readonly MenuItem[]; label: string; trigger: ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; onAction?: (value: string) => void }
export function Menu({ items, label, trigger, open: controlled, defaultOpen = false, onOpenChange, onAction, className, ref, ...props }: MenuProps) {
  const id = useId(); const root = useRef<HTMLDivElement | null>(null); const opener = useRef<HTMLButtonElement | null>(null); const entries = useRef(new Map<number, HTMLElement>()); const first = getNextEnabledIndex(-1, 'Home', items, 'ltr', 'vertical'); const [active, setActive] = useState(first); const [open, setOpen] = useControllable(controlled, defaultOpen, onOpenChange);
  const close = (restore = true) => { setOpen(false); if (restore) opener.current?.focus(); };
  useEffect(() => { if (open) entries.current.get(active)?.focus(); }, [open, active]);
  useEffect(() => { if (!open) return; const doc = root.current?.ownerDocument; const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) close(false); }; doc?.addEventListener('pointerdown', outside); return () => doc?.removeEventListener('pointerdown', outside); }, [open, setOpen]);
  return <div {...props} className={cx('hw-menu', className)} ref={node => { root.current = node; assignRef(ref, node); }}>{cloneElement(trigger, { 'aria-haspopup': 'menu', 'aria-expanded': open, 'aria-controls': `${id}-menu`, onClick: event => { trigger.props.onClick?.(event); if (!event.defaultPrevented) { opener.current = event.currentTarget; setActive(first); setOpen(!open); } }, onKeyDown: event => { trigger.props.onKeyDown?.(event); if (!event.defaultPrevented && ['ArrowDown', 'ArrowUp'].includes(event.key)) { event.preventDefault(); opener.current = event.currentTarget; setActive(getNextEnabledIndex(-1, event.key === 'ArrowUp' ? 'End' : 'Home', items, 'ltr', 'vertical')); setOpen(true); } } })}<ul role="menu" id={`${id}-menu`} aria-label={label} hidden={!open} className="hw-menu-list" onKeyDown={event => { if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) { event.preventDefault(); setActive(getNextEnabledIndex(active, event.key, items, 'ltr', 'vertical')); } else if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); } else if (event.key === 'Tab') close(false); }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null) && !root.current?.contains(event.relatedTarget as Node | null)) close(false); }}>
    {items.map((item, index) => <li role="none" key={item.value}>{item.href ? <a href={item.disabled ? undefined : item.href} role="menuitem" aria-disabled={item.disabled || undefined} tabIndex={active === index ? 0 : -1} ref={node => { if (node) entries.current.set(index, node); else entries.current.delete(index); }} onFocus={() => setActive(index)} onClick={event => { if (item.disabled) { event.preventDefault(); return; } item.onSelect?.(); onAction?.(item.value); close(); }}>{item.label}</a> : <button type="button" role="menuitem" disabled={item.disabled} tabIndex={active === index ? 0 : -1} ref={node => { if (node) entries.current.set(index, node); else entries.current.delete(index); }} onFocus={() => setActive(index)} onClick={() => { item.onSelect?.(); onAction?.(item.value); close(); }}>{item.label}</button>}</li>)}
  </ul></div>;
}
export interface DrawerProps extends DialogProps { side?: 'start' | 'end' | 'bottom' }
export function Drawer({ side = 'end', className, ...props }: DrawerProps) { return <Dialog {...props} className={cx('hw-drawer', className)} data-side={side} />; }
export interface ToastMessage { id: string; title?: ReactNode; description: ReactNode; tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger'; urgent?: boolean; dismissible?: boolean }
export interface ToastRegionProps extends ComponentPropsWithRef<'section'> {
  messages: readonly ToastMessage[];
  onDismiss?: (id: string) => void;
  label?: string;
  getDismissLabel?: (message: ToastMessage) => string;
  variant?: 'default' | 'inline' | 'banner';
  position?: 'inline' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
}
function dismissName(message: ToastMessage) {
  const text = (typeof message.title === 'string' && message.title.trim()) ||
    (typeof message.description === 'string' && message.description.trim());
  return text ? `إغلاق الإشعار: ${text}` : 'إغلاق الإشعار';
}
export function ToastRegion({ messages, onDismiss, label = 'الإشعارات', getDismissLabel = dismissName, variant, position, className, ref, ...props }: ToastRegionProps) {
  const region = useRef<HTMLElement | null>(null);
  const pending = useRef<(() => void) | undefined>(undefined);
  const [request, setRequest] = useState(0);
  const data = props as Record<string, unknown>;
  const presentation = variant ?? data['data-variant'];
  useLayoutEffect(() => {
    pending.current?.();
    pending.current = undefined;
  }, [request]);
  const render = (message: ToastMessage) => <article key={message.id} className="hw-toast" data-hw-toast={message.id} data-tone={message.tone ?? 'info'}>
    {presentation === 'banner' && <span className="hw-toast-icon" aria-hidden="true" />}
    <div className="hw-toast-content">{message.title && <strong>{message.title}</strong>}<div>{message.description}</div></div>
    {onDismiss && message.dismissible !== false && <Button type="button" variant="ghost" className="hw-toast-dismiss" data-hw-dismiss="" aria-label={getDismissLabel(message)} onClick={event => {
      const notice = event.currentTarget.closest<HTMLElement>('[data-hw-toast]');
      if (region.current && notice) pending.current = prepareToastDismissFocus(region.current, notice);
      try { onDismiss(message.id); } finally {
        // Even a rejected request gets a commit boundary and discards its snapshot.
        setRequest(previous => previous + 1);
      }
    }}>×</Button>}
  </article>;
  return <section {...props} ref={element => {region.current = element; assignRef(ref, element);}} className={cx('hw-toast-region', className)} tabIndex={props.tabIndex ?? -1} aria-label={props['aria-label'] ?? label} data-variant={presentation} data-position={position ?? data['data-position']}>
    <div role="status" aria-live="polite" aria-relevant="additions text" data-hw-live="polite">{messages.filter(message => !message.urgent).map(render)}</div>
    <div role="alert" aria-live="assertive" aria-relevant="additions text" data-hw-live="assertive">{messages.filter(message => message.urgent).map(render)}</div>
  </section>;
}
export interface CollapsibleProps extends Omit<ComponentPropsWithRef<'details'>, 'open' | 'onToggle' | 'title'> { title: ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; disabled?: boolean }
export function Collapsible({ title, open: controlled, defaultOpen = false, onOpenChange, disabled, children, className, ...props }: CollapsibleProps) {
  const id = useId(); const [open, setOpen] = useControllable(controlled, defaultOpen, onOpenChange);
  return <details {...props} className={cx('hw-collapsible', className)} open={open} onToggle={event => { if (!disabled) setOpen(event.currentTarget.open); }}><summary aria-disabled={disabled || undefined} aria-controls={`${id}-content`} onClick={event => { event.preventDefault(); if (!disabled) setOpen(!open); }}>{title}</summary><div id={`${id}-content`}>{children}</div></details>;
}
export interface TreeNode { id: string; label: ReactNode; disabled?: boolean; children?: readonly TreeNode[] }
export interface TreeViewProps extends Omit<ComponentPropsWithRef<'ul'>, 'onChange' | 'defaultValue'> { items: readonly TreeNode[]; label: string; value?: string; defaultValue?: string; onValueChange?: (value: string) => void; expanded?: readonly string[]; defaultExpanded?: readonly string[]; onExpandedChange?: (expanded: string[]) => void; disabled?: boolean }
export function TreeView({ items, label, value, defaultValue = '', onValueChange, expanded, defaultExpanded = [], onExpandedChange, disabled, className, ...props }: TreeViewProps) {
  const id = useId(); const [selected, select] = useControllable(value, defaultValue, onValueChange); const [opened, setOpened] = useControllable<readonly string[]>(expanded, defaultExpanded, next => onExpandedChange?.([...next])); const [focused, setFocused] = useState<string | undefined>(selected || undefined); const nodes = useRef(new Map<string, HTMLLIElement>());
  const visible: { node: TreeNode; level: number; parent?: string; index: number; count: number }[] = [];
  const walk = (children: readonly TreeNode[], level: number, parent?: string) => children.forEach((node, index) => { visible.push({ node, level, parent, index, count: children.length }); if (opened.includes(node.id) && node.children?.length) walk(node.children, level + 1, node.id); }); walk(items, 1);
  const enabled = visible.filter(item => !item.node.disabled && !disabled); const tabStop = enabled.find(item => item.node.id === focused)?.node.id ?? enabled.find(item => item.node.id === selected)?.node.id ?? enabled[0]?.node.id;
  const expand = (node: TreeNode, next: boolean) => setOpened(next ? [...new Set([...opened, node.id])] : opened.filter(item => item !== node.id)); const focus = (next?: string) => { if (next) { setFocused(next); nodes.current.get(next)?.focus(); } };
  return <ul {...props} className={cx('hw-tree-view', className)} role="tree" aria-label={props['aria-label'] ?? label}>{visible.map(({ node, level, parent, index, count }) => <li key={node.id} role="treeitem" className="hw-tree-item" aria-level={level} aria-posinset={index + 1} aria-setsize={count} aria-selected={selected === node.id} aria-expanded={node.children?.length ? opened.includes(node.id) : undefined} aria-disabled={disabled || node.disabled || undefined} aria-labelledby={`${id}-${encodeURIComponent(node.id)}`} tabIndex={tabStop === node.id ? 0 : -1} style={{ paddingInlineStart: `${level - 1}rem` }} ref={element => { if (element) nodes.current.set(node.id, element); else nodes.current.delete(node.id); }} onFocus={() => setFocused(node.id)} onClick={() => { if (!disabled && !node.disabled) { select(node.id); focus(node.id); } }} onKeyDown={event => {
    if (disabled || node.disabled) return; const position = enabled.findIndex(item => item.node.id === node.id); const forward = getDirection(event.currentTarget) === 'rtl' ? 'ArrowLeft' : 'ArrowRight'; const backward = forward === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';
    if (['ArrowUp', 'ArrowDown', 'Home', 'End', forward, backward, 'Enter', ' '].includes(event.key)) event.preventDefault();
    if (event.key === 'ArrowDown') focus(enabled[Math.min(enabled.length - 1, position + 1)]?.node.id); else if (event.key === 'ArrowUp') focus(enabled[Math.max(0, position - 1)]?.node.id); else if (event.key === 'Home') focus(enabled[0]?.node.id); else if (event.key === 'End') focus(enabled.at(-1)?.node.id); else if (event.key === forward && node.children?.length) { if (!opened.includes(node.id)) expand(node, true); else focus(node.children.find(child => !child.disabled)?.id); } else if (event.key === backward) { if (node.children?.length && opened.includes(node.id)) expand(node, false); else if (parent) focus(parent); } else if (event.key === 'Enter' || event.key === ' ') select(node.id);
  }}>{node.children?.length ? <button type="button" tabIndex={-1} disabled={disabled || node.disabled} aria-label={`${opened.includes(node.id) ? 'Collapse' : 'Expand'} ${typeof node.label === 'string' ? node.label : ''}`} onClick={event => { event.stopPropagation(); expand(node, !opened.includes(node.id)); focus(node.id); }}>{opened.includes(node.id) ? '−' : '+'}</button> : null}<span id={`${id}-${encodeURIComponent(node.id)}`}>{node.label}</span></li>)}</ul>;
}
export interface CarouselProps extends Omit<ComponentPropsWithRef<'section'>, 'onChange'> {
  slides: readonly ReactNode[]; label: string; index?: number; defaultIndex?: number;
  onIndexChange?: (index: number) => void; previousLabel?: string; nextLabel?: string;
  getSlideLabel?: (index: number, count: number) => string; loop?: boolean;
  showIndicators?: boolean; indicatorsLabel?: string; emptyLabel?: string;
  carouselDescription?: string; slideDescription?: string;
}
export function Carousel({ slides, label, index, defaultIndex = 0, onIndexChange,
  previousLabel = 'الشريحة السابقة', nextLabel = 'الشريحة التالية',
  getSlideLabel = (current, count) => `${current + 1} من ${count}`, loop = false,
  showIndicators = true, indicatorsLabel = 'اختيار الشريحة', emptyLabel = 'لا توجد شرائح',
  carouselDescription = 'عرض شرائح', slideDescription = 'شريحة', className, style, ...props
}: CarouselProps) {
  const [stored, setIndex] = useControllable(index, defaultIndex, onIndexChange);
  const total = slides.length;
  const current = Math.max(0, Math.min(total - 1, Number.isFinite(stored) ? Math.floor(stored) : 0));
  const select = (requested: number) => {
    if (!total || !Number.isFinite(requested)) return;
    const rounded = Math.floor(requested);
    const next = loop ? ((rounded % total) + total) % total : Math.max(0, Math.min(total - 1, rounded));
    if (next !== current) setIndex(next);
  };
  return <section {...props} className={cx('hw-carousel', className)} data-hw-carousel-ready="" style={{...style, '--hw-carousel-index': current} as CSSProperties} role="region" aria-roledescription={carouselDescription} aria-label={props['aria-label'] ?? label}>
    <div className="hw-carousel-viewport hw-carousel-slides"><div className="hw-carousel-track">{slides.map((slide, number) => <div className="hw-carousel-slide" key={number} role="group" aria-roledescription={slideDescription} aria-label={getSlideLabel(number, total)} hidden={current !== number} inert={current !== number} aria-hidden={current !== number ? 'true' : undefined}>{slide}</div>)}</div>{!total && <p className="hw-carousel-empty">{emptyLabel}</p>}</div>
    <div className="hw-carousel-controls hw-inline">
      {showIndicators && total > 0 && <div className="hw-carousel-pagination" role="group" aria-label={indicatorsLabel}>{slides.map((_, number) => <button className="hw-carousel-dot" key={number} type="button" aria-label={getSlideLabel(number, total)} aria-current={number === current ? 'true' : undefined} onClick={() => select(number)} />)}</div>}
      <div className="hw-carousel-arrows"><Button className="hw-carousel-arrow" variant="secondary" type="button" data-hw-previous="" aria-label={previousLabel} disabled={total < 2 || !loop && current === 0} onClick={() => select(current - 1)} /><Button className="hw-carousel-arrow" variant="secondary" type="button" data-hw-next="" aria-label={nextLabel} disabled={total < 2 || !loop && current === total - 1} onClick={() => select(current + 1)} /></div>
      <span className="hw-carousel-status hw-sr-only" role="status" aria-live="polite">{total ? getSlideLabel(current, total) : emptyLabel}</span>
    </div>
  </section>;
}
