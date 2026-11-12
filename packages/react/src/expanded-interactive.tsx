import { cloneElement, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, ComponentPropsWithRef, CSSProperties, ReactElement, ReactNode } from 'react';
import { createTypeahead, getDirection, getNextEnabledIndex, hasText, isTypeaheadKey, observeReadonlyChoice, prepareToastDismissFocus } from '@hawiyah/core';
import type { Option } from '@hawiyah/core';
import { Button } from './forms.js';
import { Dialog } from './interactive.js';
import type { DialogProps } from './interactive.js';
import { assignRef, cx, descriptionIds, requiredMarker, rootLabel, text, useControllable } from './shared.js';
import type { FieldName, RootName } from './shared.js';
import { useFormReset } from './expanded-shared.js';

type ToggleBase = Omit<ComponentPropsWithRef<'fieldset'>, 'defaultValue' | 'onChange'> & FieldName & { options: readonly Option[]; hint?: ReactNode; error?: ReactNode; /** Applies to single selection: every radio is required. A multiple group is not constrained. */ required?: boolean; name?: string; form?: string; readOnly?: boolean; variant?: 'segmented' | 'outline'; /** Hides the legend visually; it stays the accessible name of the group. */ labelHidden?: boolean };
export type SingleToggleGroupProps = ToggleBase & { multiple?: false; value?: string; defaultValue?: string; onValueChange?: (value: string) => void };
export type MultipleToggleGroupProps = ToggleBase & { multiple: true; value?: readonly string[]; defaultValue?: readonly string[]; onValueChange?: (value: string[]) => void };
export type ToggleGroupProps = SingleToggleGroupProps | MultipleToggleGroupProps;
export function ToggleGroup(props: ToggleGroupProps) {
  const { options, label, labelHidden = false, hint, error, required, name, form, readOnly, variant = 'segmented', multiple, value, defaultValue, onValueChange: _onValueChange, className, disabled, ref, ...native } = props;
  const legend = hasText(native['aria-label']) || hasText(native['aria-labelledby']) ? label : text('ToggleGroup', 'label', label);
  const group = useRef<HTMLFieldSetElement | null>(null);
  useEffect(() => { const guards = Array.from(group.current?.querySelectorAll<HTMLInputElement>('input[type="radio"]') ?? [], observeReadonlyChoice); return () => guards.forEach(guard => guard.destroy()); });
  const id = useId(); const empty = multiple ? [] : ''; const [failed, setFailed] = useState(false);
  const [current, setCurrent] = useControllable<string | readonly string[]>(value, defaultValue ?? empty, next => { if (props.multiple) props.onValueChange?.([...next]); else props.onValueChange?.(next as string); });
  const change = (next: string | string[]) => { if (disabled || readOnly) return; setFailed(false); setCurrent(next); };
  // A reset is not a reader action: read-only and disabled groups reset too. The extra render writes `checked` back.
  useFormReset(group, () => { setFailed(false); setCurrent(defaultValue ?? empty); });
  const values = typeof current === 'string' ? [current] : current;
  return <fieldset {...native} ref={node => {group.current=node;assignRef(ref,node);}} data-hw-readonly={readOnly || undefined} className={cx('hw-toggle-group', className)} data-variant={variant} disabled={disabled} aria-describedby={descriptionIds(native['aria-describedby'], hint ? `${id}-hint` : undefined, error ? `${id}-error` : undefined)} aria-invalid={native['aria-invalid'] ?? (error || failed ? true : undefined)}>{hasText(legend) && <legend className={labelHidden ? 'hw-label hw-sr-only' : 'hw-label'}>{legend}{required && !multiple && requiredMarker}</legend>}{multiple && <input type="hidden" form={form} disabled />}{options.map(option => multiple ? <Button key={option.value} variant="secondary" aria-pressed={values.includes(option.value)} aria-disabled={readOnly || undefined} disabled={disabled || option.disabled} onClick={() => change(values.includes(option.value) ? values.filter(item => item !== option.value) : [...values, option.value])}>{option.label}</Button> : <label key={option.value}><input type="radio" name={name ?? id} form={form} value={option.value} required={required} readOnly={readOnly} aria-disabled={readOnly || undefined} disabled={option.disabled} checked={current === option.value} onInvalid={() => setFailed(true)} onChange={() => change(option.value)} />{option.label}</label>)}{hint && <p className="hw-hint" id={`${id}-hint`}>{hint}</p>}{error && <p className="hw-error" id={`${id}-error`}>{error}</p>}{multiple && values.filter(item => options.some(option => option.value === item && !option.disabled)).map(item => <input key={item} type="hidden" name={name} form={form} value={item} disabled={disabled} />)}</fieldset>;
}
interface PopoverBaseProps extends ComponentPropsWithRef<'div'> { trigger: ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; disabled?: boolean }
/** `label` (or an aria-label / aria-labelledby prop) names the panel and prints nothing; a visible heading is content of your own. */
export type PopoverProps = PopoverBaseProps & RootName;
export function Popover({ trigger, label, open: controlled, defaultOpen = false, onOpenChange, disabled = false, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby, children, className, ref, onBlur, onKeyDown, ...props }: PopoverProps) {
  const id = useId(); const root = useRef<HTMLDivElement | null>(null); const opener = useRef<HTMLButtonElement | null>(null); const [open, setOpen] = useControllable(controlled, defaultOpen, onOpenChange);
  const name = rootLabel('Popover', { 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby }, label);
  useEffect(() => { if (disabled && open) setOpen(false); }, [disabled, open]);
  useEffect(() => {
    if (!open) return; const doc = root.current?.ownerDocument; const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    doc?.addEventListener('pointerdown', outside); return () => doc?.removeEventListener('pointerdown', outside);
  }, [open, setOpen]);
  return <div {...props} className={cx('hw-popover', className)} ref={node => { root.current = node; assignRef(ref, node); }}
    onBlur={event => { onBlur?.(event); const next = event.relatedTarget as Node | null; if (open && next && !event.currentTarget.contains(next)) setOpen(false); }}
    onKeyDown={event => { onKeyDown?.(event); if (event.key !== 'Escape' || !open || event.defaultPrevented) return; event.preventDefault(); event.stopPropagation(); setOpen(false); (opener.current ?? root.current?.querySelector<HTMLElement>('[aria-expanded][aria-controls]'))?.focus(); }}>
    {cloneElement(trigger, { 'aria-expanded': open, 'aria-controls': `${id}-panel`, disabled: trigger.props.disabled || disabled || undefined, onClick: event => { trigger.props.onClick?.(event); if (!event.defaultPrevented) { opener.current = event.currentTarget; setOpen(!open); } } })}
    <div id={`${id}-panel`} className="hw-popover-panel" role="region" aria-label={ariaLabelledby ? undefined : name} aria-labelledby={ariaLabelledby} hidden={!open || disabled}>{children}</div>
  </div>;
}
export interface MenuItem { value: string; label: ReactNode; disabled?: boolean; href?: string; onSelect?: () => void }
interface MenuBaseProps extends Omit<ComponentPropsWithRef<'div'>, 'onSelect'> { items: readonly MenuItem[]; trigger: ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; onAction?: (value: string) => void; disabled?: boolean }
/** `label` (or an aria-label / aria-labelledby prop) names the menu element, not the root. */
export type MenuProps = MenuBaseProps & RootName;
export function Menu({ items, label, trigger, open: controlled, defaultOpen = false, onOpenChange, onAction, disabled = false, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby, className, ref, onBlur, ...props }: MenuProps) {
  const id = useId(); const root = useRef<HTMLDivElement | null>(null); const opener = useRef<HTMLButtonElement | null>(null); const entries = useRef(new Map<number, HTMLElement>()); const first = getNextEnabledIndex(-1, 'Home', items, 'ltr', 'vertical'); const [active, setActive] = useState(first); const [open, setOpen] = useControllable(controlled, defaultOpen, onOpenChange);
  const name = rootLabel('Menu', { 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby }, label); const typeahead = useRef(createTypeahead());
  const close = (restore = true) => { setOpen(false); if (restore) opener.current?.focus(); };
  useEffect(() => { if (disabled && open) setOpen(false); }, [disabled, open]);
  useEffect(() => { if (!open) typeahead.current.reset(); const current = typeahead.current; return () => current.reset(); }, [open]);
  useEffect(() => { if (open) entries.current.get(active)?.focus(); }, [open, active]);
  useEffect(() => { if (!open) return; const doc = root.current?.ownerDocument; const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) close(false); }; doc?.addEventListener('pointerdown', outside); return () => doc?.removeEventListener('pointerdown', outside); }, [open, setOpen]);
  const entry = (index: number) => (node: HTMLElement | null) => { if (node) entries.current.set(index, node); else entries.current.delete(index); };
  return <div {...props} className={cx('hw-menu', className)} ref={node => { root.current = node; assignRef(ref, node); }} onBlur={event => { onBlur?.(event); const next = event.relatedTarget as Node | null; if (open && next && !event.currentTarget.contains(next)) close(false); }}>{cloneElement(trigger, { 'aria-haspopup': 'menu', 'aria-expanded': open, 'aria-controls': `${id}-menu`, disabled: trigger.props.disabled || disabled || undefined, onClick: event => { trigger.props.onClick?.(event); if (!event.defaultPrevented) { opener.current = event.currentTarget; setActive(first); setOpen(!open); } }, onKeyDown: event => { trigger.props.onKeyDown?.(event); if (!event.defaultPrevented && ['ArrowDown', 'ArrowUp'].includes(event.key)) { event.preventDefault(); opener.current = event.currentTarget; setActive(getNextEnabledIndex(-1, event.key === 'ArrowUp' ? 'End' : 'Home', items, 'ltr', 'vertical')); setOpen(true); } } })}<div role="menu" id={`${id}-menu`} className="hw-menu-content" aria-label={ariaLabelledby ? undefined : name} aria-labelledby={ariaLabelledby} hidden={!open || disabled} onKeyDown={event => {
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) { event.preventDefault(); setActive(getNextEnabledIndex(active, event.key, items, 'ltr', 'vertical')); }
    else if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
    else if (event.key === 'Tab') close(false);
    else if (!event.nativeEvent.isComposing && isTypeaheadKey(event)) { const next = typeahead.current.next(event.key, items.map((_, index) => entries.current.get(index)?.textContent ?? ''), active, index => Boolean(items[index]?.disabled)); if (next >= 0) { event.preventDefault(); setActive(next); } }
  }}>
    {items.map((item, index) => item.href ? <a key={item.value} className="hw-menu-item" href={item.disabled ? undefined : item.href} role="menuitem" aria-disabled={item.disabled || undefined} tabIndex={active === index ? 0 : -1} ref={entry(index)} onFocus={() => setActive(index)} onClick={event => { if (item.disabled) { event.preventDefault(); return; } item.onSelect?.(); onAction?.(item.value); close(); }}>{item.label}</a> : <button key={item.value} type="button" className="hw-menu-item" role="menuitem" disabled={item.disabled} tabIndex={active === index ? 0 : -1} ref={entry(index)} onFocus={() => setActive(index)} onClick={() => { item.onSelect?.(); onAction?.(item.value); close(); }}>{item.label}</button>)}
  </div></div>;
}
export interface DrawerProps extends DialogProps { side?: 'start' | 'end' | 'bottom' }
export function Drawer({ side = 'end', className, ...props }: DrawerProps) { return <Dialog {...props} className={cx('hw-drawer', className)} data-side={side} />; }
export interface ToastMessage { id: string; title?: ReactNode; message: ReactNode; tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger'; urgent?: boolean; dismissible?: boolean }
interface ToastRegionBaseProps extends ComponentPropsWithRef<'section'> {
  messages: readonly ToastMessage[];
  variant?: 'default' | 'inline' | 'banner';
  position?: 'inline' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
}
/** `getDismissLabel` names a toast's dismiss button and is required with `onDismiss`. */
export type ToastRegionProps = ToastRegionBaseProps & RootName & ({ onDismiss?: undefined; getDismissLabel?: (message: ToastMessage) => string } | { onDismiss?: (id: string) => void; getDismissLabel: (message: ToastMessage) => string });
export function ToastRegion({ messages, onDismiss, label, getDismissLabel, variant, position, className, ref, ...props }: ToastRegionProps) {
  const name = rootLabel('ToastRegion', props, label); const dismissLabel = onDismiss ? text('ToastRegion', 'getDismissLabel', getDismissLabel, 'onDismiss is given') : undefined;
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
    <div className="hw-toast-content">{message.title && <strong>{message.title}</strong>}<p>{message.message}</p></div>
    {onDismiss && message.dismissible !== false && <Button type="button" variant="ghost" className="hw-toast-dismiss" data-hw-dismiss="" aria-label={dismissLabel?.(message) || undefined} onClick={event => {
      const notice = event.currentTarget.closest<HTMLElement>('[data-hw-toast]');
      if (region.current && notice) pending.current = prepareToastDismissFocus(region.current, notice);
      try { onDismiss(message.id); } finally {
        // Even a rejected request gets a commit boundary and discards its snapshot.
        setRequest(previous => previous + 1);
      }
    }}><span className="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true" /></Button>}
  </article>;
  return <section {...props} ref={element => {region.current = element; assignRef(ref, element);}} className={cx('hw-toast-region', className)} tabIndex={props.tabIndex ?? -1} aria-label={name} data-variant={presentation} data-position={position ?? data['data-position']}>
    <div role="status" aria-live="polite" aria-relevant="additions text" data-hw-live="polite">{messages.filter(message => !message.urgent).map(render)}</div>
    <div role="alert" aria-live="assertive" aria-relevant="additions text" data-hw-live="assertive">{messages.filter(message => message.urgent).map(render)}</div>
  </section>;
}
/** `label` is the content of the summary. */
export interface CollapsibleProps extends Omit<ComponentPropsWithRef<'details'>, 'open' | 'onToggle'> { label: ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; disabled?: boolean }
export function Collapsible({ label, open: controlled, defaultOpen = false, onOpenChange, disabled, children, className, ...props }: CollapsibleProps) {
  const id = useId(); const [open, setOpen] = useControllable(controlled, defaultOpen, onOpenChange);
  return <details {...props} className={cx('hw-collapsible', className)} open={open} onToggle={event => { if (!disabled) setOpen(event.currentTarget.open); }}><summary aria-disabled={disabled || undefined} aria-controls={`${id}-content`} onClick={event => { event.preventDefault(); if (!disabled) setOpen(!open); }}>{label}</summary><div id={`${id}-content`}>{children}</div></details>;
}
export interface TreeNode { id: string; label: ReactNode; disabled?: boolean; children?: readonly TreeNode[] }
interface TreeViewBaseProps extends Omit<ComponentPropsWithRef<'ul'>, 'onChange' | 'defaultValue'> { items: readonly TreeNode[]; value?: string; defaultValue?: string; onValueChange?: (value: string) => void; expanded?: readonly string[]; defaultExpanded?: readonly string[]; onExpandedChange?: (expanded: string[]) => void; disabled?: boolean; getExpandLabel: (node: TreeNode) => string; getCollapseLabel: (node: TreeNode) => string }
/** Named by `label`, or by an aria-label / aria-labelledby prop. */
export type TreeViewProps = TreeViewBaseProps & RootName;
export function TreeView({ items, label, value, getExpandLabel, getCollapseLabel, defaultValue = '', onValueChange, expanded, defaultExpanded = [], onExpandedChange, disabled, className, ...props }: TreeViewProps) {
  const toggleLabel = { expand: text('TreeView', 'getExpandLabel', getExpandLabel), collapse: text('TreeView', 'getCollapseLabel', getCollapseLabel) };
  const id = useId(); const [selected, select] = useControllable(value, defaultValue, onValueChange); const [opened, setOpened] = useControllable<readonly string[]>(expanded, defaultExpanded, next => onExpandedChange?.([...next])); const [focused, setFocused] = useState<string | undefined>(selected || undefined); const nodes = useRef(new Map<string, HTMLLIElement>()); const typeahead = useRef(createTypeahead());
  useEffect(() => { const current = typeahead.current; return () => current.reset(); }, []);
  const visible: { node: TreeNode; level: number; parent?: string; index: number; count: number }[] = [];
  const walk = (children: readonly TreeNode[], level: number, parent?: string) => children.forEach((node, index) => { visible.push({ node, level, parent, index, count: children.length }); if (opened.includes(node.id) && node.children?.length) walk(node.children, level + 1, node.id); }); walk(items, 1);
  const enabled = visible.filter(item => !item.node.disabled && !disabled); const tabStop = enabled.find(item => item.node.id === focused)?.node.id ?? enabled.find(item => item.node.id === selected)?.node.id ?? enabled[0]?.node.id;
  const expand = (node: TreeNode, next: boolean) => setOpened(next ? [...new Set([...opened, node.id])] : opened.filter(item => item !== node.id)); const focus = (next?: string) => { if (next) { setFocused(next); nodes.current.get(next)?.focus(); } };
  return <ul {...props} className={cx('hw-tree-view', className)} role="tree" aria-label={rootLabel('TreeView', props, label)}>{visible.map(({ node, level, parent, index, count }) => <li key={node.id} role="treeitem" className="hw-tree-item" aria-level={level} aria-posinset={index + 1} aria-setsize={count} aria-selected={selected === node.id} aria-expanded={node.children?.length ? opened.includes(node.id) : undefined} aria-disabled={disabled || node.disabled || undefined} aria-labelledby={`${id}-${encodeURIComponent(node.id)}`} tabIndex={tabStop === node.id ? 0 : -1} style={{ '--hw-tree-depth': level - 1 } as CSSProperties} ref={element => { if (element) nodes.current.set(node.id, element); else nodes.current.delete(node.id); }} onFocus={() => setFocused(node.id)} onClick={() => { if (!disabled && !node.disabled) { select(node.id); focus(node.id); } }} onKeyDown={event => {
    if (disabled || node.disabled) return; const position = enabled.findIndex(item => item.node.id === node.id); const forward = getDirection(event.currentTarget) === 'rtl' ? 'ArrowLeft' : 'ArrowRight'; const backward = forward === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';
    if (['ArrowUp', 'ArrowDown', 'Home', 'End', forward, backward, 'Enter', ' '].includes(event.key)) event.preventDefault();
    if (event.key === 'ArrowDown') focus(enabled[Math.min(enabled.length - 1, position + 1)]?.node.id); else if (event.key === 'ArrowUp') focus(enabled[Math.max(0, position - 1)]?.node.id); else if (event.key === 'Home') focus(enabled[0]?.node.id); else if (event.key === 'End') focus(enabled.at(-1)?.node.id); else if (event.key === forward && node.children?.length) { if (!opened.includes(node.id)) expand(node, true); else focus(node.children.find(child => !child.disabled)?.id); } else if (event.key === backward) { if (node.children?.length && opened.includes(node.id)) expand(node, false); else if (parent) focus(parent); } else if (event.key === 'Enter' || event.key === ' ') select(node.id);
    else if (!event.nativeEvent.isComposing && isTypeaheadKey(event)) { const next = typeahead.current.next(event.key, visible.map(item => nodes.current.get(item.node.id)?.querySelector(`[id="${id}-${encodeURIComponent(item.node.id)}"]`)?.textContent ?? ''), visible.findIndex(item => item.node.id === node.id), index => Boolean(disabled || visible[index]?.node.disabled)); if (next >= 0) { event.preventDefault(); focus(visible[next]!.node.id); } }
  }}>{node.children?.length ? <button type="button" className="hw-tree-toggle" tabIndex={-1} disabled={disabled || node.disabled} aria-label={(opened.includes(node.id) ? toggleLabel.collapse : toggleLabel.expand)?.(node) || undefined} onClick={event => { event.stopPropagation(); expand(node, !opened.includes(node.id)); focus(node.id); }}><span className="hw-icon" data-size="sm" aria-hidden="true" data-icon={opened.includes(node.id) ? 'minus-sign' : 'add-01'} /></button> : null}<span id={`${id}-${encodeURIComponent(node.id)}`}>{node.label}</span></li>)}</ul>;
}
interface CarouselBaseProps extends Omit<ComponentPropsWithRef<'section'>, 'onChange'> {
  slides: readonly ReactNode[]; index?: number; defaultIndex?: number;
  onIndexChange?: (index: number) => void; previousLabel: string; nextLabel: string;
  /** Name of each slide and indicator and the live status; `position` is one-based. */
  getSlideLabel: (position: number, total: number) => string; loop?: boolean;
  emptyLabel: string; carouselDescription?: string; slideDescription?: string;
}
/** `indicatorsLabel` names the indicator group and is required unless `showIndicators` is false. */
export type CarouselProps = CarouselBaseProps & RootName & ({ showIndicators: false; indicatorsLabel?: string } | { showIndicators?: boolean; indicatorsLabel: string });
export function Carousel({ slides, label, index, defaultIndex = 0, onIndexChange,
  previousLabel, nextLabel, getSlideLabel, loop = false, showIndicators = true, indicatorsLabel, emptyLabel,
  carouselDescription, slideDescription, className, style, ...props
}: CarouselProps) {
  const copy = { label: rootLabel('Carousel', props, label), previous: text('Carousel', 'previousLabel', previousLabel), next: text('Carousel', 'nextLabel', nextLabel), slide: text('Carousel', 'getSlideLabel', getSlideLabel), empty: text('Carousel', 'emptyLabel', emptyLabel), indicators: showIndicators ? text('Carousel', 'indicatorsLabel', indicatorsLabel, 'showIndicators is on') : undefined };
  const slideLabel = (number: number) => copy.slide?.(number + 1, total) || undefined;
  const [stored, setIndex] = useControllable(index, defaultIndex, onIndexChange);
  const total = slides.length;
  const current = Math.max(0, Math.min(total - 1, Number.isFinite(stored) ? Math.floor(stored) : 0));
  const select = (requested: number) => {
    if (!total || !Number.isFinite(requested)) return;
    const rounded = Math.floor(requested);
    const next = loop ? ((rounded % total) + total) % total : Math.max(0, Math.min(total - 1, rounded));
    if (next !== current) setIndex(next);
  };
  return <section {...props} className={cx('hw-carousel', className)} data-hw-carousel-ready="" style={{...style, '--hw-carousel-index': current} as CSSProperties} role="region" aria-roledescription={carouselDescription || undefined} aria-label={copy.label}>
    <div className="hw-carousel-viewport hw-carousel-slides"><div className="hw-carousel-track">{slides.map((slide, number) => <div className="hw-carousel-slide" key={number} role="group" aria-roledescription={slideDescription || undefined} aria-label={slideLabel(number)} hidden={current !== number} inert={current !== number} aria-hidden={current !== number ? 'true' : undefined}>{slide}</div>)}</div>{!total && copy.empty && <p className="hw-carousel-empty">{copy.empty}</p>}</div>
    <div className="hw-carousel-controls hw-inline">
      {showIndicators && total > 0 && <div className="hw-carousel-pagination" role="group" aria-label={copy.indicators}>{slides.map((_, number) => <button className="hw-carousel-dot" key={number} type="button" aria-label={slideLabel(number)} aria-current={number === current ? 'true' : undefined} onClick={() => select(number)} />)}</div>}
      <div className="hw-carousel-arrows"><Button className="hw-carousel-arrow" variant="secondary" type="button" data-hw-previous="" aria-label={copy.previous} disabled={total < 2} aria-disabled={total > 1 && !loop && current === 0 ? true : undefined} onClick={() => select(current - 1)} /><Button className="hw-carousel-arrow" variant="secondary" type="button" data-hw-next="" aria-label={copy.next} disabled={total < 2} aria-disabled={total > 1 && !loop && current === total - 1 ? true : undefined} onClick={() => select(current + 1)} /></div>
      <span className="hw-carousel-status hw-sr-only" role="status" aria-live="polite">{total ? slideLabel(current) : copy.empty}</span>
    </div>
  </section>;
}
