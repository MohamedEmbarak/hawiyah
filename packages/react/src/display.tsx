import { createElement, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createAccordionMotion, getPaginationItems, normalizePaginationPage, normalizePaginationTotal } from '@hawiyah/core';
import type { AccordionMotion } from '@hawiyah/core';
import type { ComponentPropsWithRef, HTMLAttributes, Key, ReactNode } from 'react';
import { assignRef, cx, useControllable, useFieldValueRef } from './shared.js';
import { Button } from './forms.js';

export interface AccordionItem { value: string; title: ReactNode; content: ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void }
export interface AccordionProps extends ComponentPropsWithRef<'div'> {
  items: readonly AccordionItem[];
  /** Coordinate one logical open item; controlled owners must accept peer close requests. */
  exclusive?: boolean;
}
function AccordionDetail({ item, name }: { item: AccordionItem; name?: string }) {
  const [open, setOpen] = useControllable(item.open, item.defaultOpen ?? false, item.onOpenChange);
  const details = useRef<HTMLDetailsElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const motion = useRef<AccordionMotion | undefined>(undefined);
  const initialOpen = useRef(open);
  const latest = useRef({ open, setOpen });
  latest.current = { open, setOpen };
  useLayoutEffect(() => {
    if (name) details.current!.setAttribute('name', name); else details.current!.removeAttribute('name');
    const instance = createAccordionMotion(details.current!, content.current!, next => latest.current.setOpen(next));
    motion.current = instance;
    instance.setOpen(latest.current.open, true);
    return () => { instance.destroy(); motion.current = undefined; };
  }, [name]);
  useLayoutEffect(() => { motion.current?.setOpen(open); }, [open]);
  return <details ref={details} className="hw-accordion-item" name={name} open={initialOpen.current} onToggle={() => motion.current?.nativeToggle()}>
    <summary className="hw-accordion-trigger" onClick={event => {
      if ((event.target as Element).closest('a,button,input,select,textarea')) return;
      event.preventDefault(); setOpen(!open);
    }}>{item.title}</summary><div ref={content} className="hw-accordion-content">{item.content}</div>
  </details>;
}
export function Accordion({ items, exclusive, className, ...props }: AccordionProps) {
  const group = useId();
  return <div {...props} className={cx('hw-accordion', className)}>{items.map(item => <AccordionDetail key={item.value} item={item} name={exclusive ? group : undefined} />)}</div>;
}
export interface CardProps extends ComponentPropsWithRef<'article'> {
  header?: ReactNode;
  footer?: ReactNode;
  variant?: 'default' | 'flat' | 'elevated' | 'outlined' | 'ghost';
  /** Turns the complete card into a native link. Do not nest interactive content. */
  href?: string;
  target?: string;
  rel?: string;
  disabled?: boolean;
}
export function Card({ header, footer, children, className, variant, href, disabled, onClick, ...props }: CardProps) {
  const action = href !== undefined;
  return createElement(action ? 'a' : 'article', {
    ...props, className: cx('hw-card', action && 'hw-card-action', className),
    'data-variant': variant ?? (props as Record<string, unknown>)['data-variant'],
    'data-disabled': disabled || undefined,
    ...(action ? { href: disabled ? undefined : href, role: disabled ? 'link' : props.role, 'aria-disabled': disabled || undefined, tabIndex: disabled ? -1 : props.tabIndex } : {}),
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      if (disabled) { event.preventDefault(); event.stopPropagation(); return; }
      onClick?.(event);
    },
  }, header && <header className="hw-card-header">{header}</header>, <div className="hw-card-body">{children}</div>, footer && <footer className="hw-card-footer">{footer}</footer>);
}
export interface BadgeProps extends ComponentPropsWithRef<'span'> { tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info'; variant?: 'soft' | 'outline' | 'dot' }
export function Badge({ tone = 'neutral', variant, className, ...props }: BadgeProps) { return <span {...props} className={cx('hw-badge', className)} data-tone={tone} data-variant={variant ?? (props as Record<string, unknown>)['data-variant']} />; }
export interface AlertProps extends ComponentPropsWithRef<'div'> {
  tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  variant?: 'default' | 'outline' | 'minimal';
  title?: string;
}
/** Informational messages use status; urgent errors use alert. Override role when static. */
export function Alert({ tone = 'info', variant, title, children, className, role, ...props }: AlertProps) {
  return <div {...props} {...(variant ? { 'data-variant': variant } : {})} className={cx('hw-alert', className)} data-tone={tone} role={role ?? (tone === 'danger' ? 'alert' : 'status')}><div className="hw-alert-content">{title && <strong>{title}</strong>}{children}</div></div>;
}
export interface TableColumn<Row> { key: string; header: ReactNode; cell: (row: Row, index: number) => ReactNode; rowHeader?: boolean }
export interface TableProps<Row = unknown> extends Omit<ComponentPropsWithRef<'table'>, 'children'> {
  variant?: 'default' | 'striped' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
  'data-variant'?: string;
  'data-size'?: string;
  emptyMessage?: ReactNode;
  columns?: readonly TableColumn<Row>[];
  rows?: readonly Row[];
  rowKey?: (row: Row, index: number) => Key;
  caption?: ReactNode;
  children?: ReactNode;
  wrapperProps?: HTMLAttributes<HTMLDivElement>;
}
/** Either provide columns/rows or compose native thead/tbody children. */
export function Table<Row>({ columns, rows = [], rowKey = (_, index) => index, caption, children, className, wrapperProps, variant, size, emptyMessage = 'لا توجد سجلات', ...props }: TableProps<Row>) {
  const captionId = useId();
  return <div tabIndex={0} role={caption ? 'region' : undefined} aria-labelledby={caption ? captionId : undefined} {...wrapperProps} className={cx('hw-table-wrap', wrapperProps?.className)}><table {...props} data-variant={variant ?? props['data-variant']} data-size={size ?? props['data-size']} className={cx('hw-table', className)}>{caption && <caption id={captionId}>{caption}</caption>}{columns ? <><thead><tr>{columns.map(column => <th key={column.key} scope="col">{column.header}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row, index) => <tr key={rowKey(row, index)}>{columns.map(column => column.rowHeader ? <th key={column.key} scope="row">{column.cell(row, index)}</th> : <td key={column.key}>{column.cell(row, index)}</td>)}</tr>) : <tr><td colSpan={columns.length || 1}>{emptyMessage}</td></tr>}</tbody></> : children}</table></div>;
}
function PaginationJumpInput({start, end}: {start: number; end: number}) {
  const ref = useFieldValueRef<HTMLInputElement>(undefined);
  return <input ref={ref} className="hw-input" data-hw-jump-input="" data-hw-filled="true" form="" type="number" inputMode="numeric" required min={start} max={end} step={1} defaultValue={start} onInput={event => {
    const input = event.currentTarget;
    if(input.dataset.hwJumpTouched === 'true') {if(input.checkValidity()) input.removeAttribute('aria-invalid'); else input.setAttribute('aria-invalid','true');}
  }} />;
}
export interface PaginationProps extends Omit<ComponentPropsWithRef<'nav'>, 'onChange'> {
  page?: number; defaultPage?: number; totalPages: number; onPageChange?: (page: number) => void;
  label?: string; previousLabel?: string; nextLabel?: string;
  getPageLabel?: (page: number) => string; formatPage?: (page: number) => ReactNode;
  siblingCount?: number; disabled?: boolean; hideOnSinglePage?: boolean;
  getGapLabel?: (start: number, end: number) => string; jumpLabel?: string; goLabel?: string;
}
export function Pagination({ page, defaultPage = 1, totalPages, onPageChange,
  label = 'ترقيم الصفحات', previousLabel = 'الصفحة السابقة', nextLabel = 'الصفحة التالية',
  getPageLabel = number => 'الصفحة ' + number, formatPage = String, siblingCount = 1,
  disabled = false, hideOnSinglePage = false, getGapLabel = (start, end) => 'الصفحات ' + start + ' إلى ' + end,
  jumpLabel = 'الانتقال إلى صفحة', goLabel = 'انتقال', className, ref, ...props
}: PaginationProps) {
  const total = normalizePaginationTotal(totalPages);
  const [stored, setPage] = useControllable(page, defaultPage, onPageChange);
  const current = normalizePaginationPage(stored, total), items = getPaginationItems(current, total, siblingCount);
  const root = useRef<HTMLElement | null>(null), pendingFocus = useRef<number | null>(null);
  const disabledState = useRef(disabled); disabledState.current = disabled;
  const close = (except?: HTMLDetailsElement) => root.current?.querySelectorAll<HTMLDetailsElement>('.hw-pagination-gap[open]').forEach(details => {if (details !== except) details.open = false;});
  const blocked = () => disabledState.current || !!root.current?.querySelector<HTMLButtonElement>(':scope > [data-hw-page]')?.matches(':disabled');
  const syncInherited = () => {
    const unavailable = blocked();
    root.current?.querySelectorAll<HTMLElement>('.hw-pagination-gap > summary').forEach(summary => {
      if(unavailable) {summary.setAttribute('aria-disabled','true'); summary.tabIndex = -1;}
      else {summary.removeAttribute('aria-disabled'); summary.removeAttribute('tabindex');}
    });
    if(unavailable) close();
  };
  useEffect(() => {
    const node = root.current; if (!node) return;
    const outside = (event: Event) => {if (!node.contains(event.target as Node)) close();};
    node.ownerDocument.addEventListener('click', outside);
    const Observer = node.ownerDocument.defaultView?.MutationObserver;
    const observer = Observer ? new Observer(syncInherited) : undefined;
    for(let ancestor = node.parentElement; ancestor; ancestor = ancestor.parentElement) if(ancestor.tagName === 'FIELDSET') observer?.observe(ancestor,{attributes:true,attributeFilter:['disabled']});
    syncInherited();
    return () => {node.ownerDocument.removeEventListener('click', outside);observer?.disconnect();};
  }, []);
  useLayoutEffect(() => {
    close(); syncInherited();
    if (pendingFocus.current !== null) {const requested = pendingFocus.current; pendingFocus.current = null; if(current === requested) root.current?.querySelector<HTMLElement>('[aria-current="page"]')?.focus();}
  }, [current, total, disabled, siblingCount]);
  const select = (requested: number, gap?: HTMLDetailsElement | null) => {
    if (blocked() || !Number.isFinite(requested)) return;
    const next = normalizePaginationPage(requested, total);
    close();
    if (gap) {gap.querySelector<HTMLElement>('summary')?.focus(); pendingFocus.current = next !== current ? next : null;}
    if (next !== current) setPage(next);
  };
  const jump = (node: HTMLElement, start: number, end: number) => {
    const input = node.querySelector<HTMLInputElement>('input');
    if(!input || blocked()) return;
    input.dataset.hwJumpTouched = 'true';
    if (input.checkValidity() && Number.isInteger(input.valueAsNumber) && input.valueAsNumber >= start && input.valueAsNumber <= end) {input.removeAttribute('aria-invalid');select(input.valueAsNumber, node.closest('details'));}
    else {input.setAttribute('aria-invalid','true');input.reportValidity();}
  };
  return <nav {...props} ref={node => {root.current = node; assignRef(ref, node);}} className={cx('hw-pagination', className)} aria-label={props['aria-label'] ?? label} data-disabled={disabled || undefined} hidden={props.hidden || hideOnSinglePage && total === 1} onClickCapture={event => {props.onClickCapture?.(event);if(blocked()) {event.preventDefault();event.stopPropagation();syncInherited();}}} onKeyDown={event => {
    props.onKeyDown?.(event);
    if(blocked() && ['Enter',' '].includes(event.key)) {event.preventDefault();syncInherited();return;}
    if (event.defaultPrevented || event.key !== 'Escape') return;
    const details = (event.target as HTMLElement).closest<HTMLDetailsElement>('.hw-pagination-gap[open]');
    if (details) {event.preventDefault(); details.open = false; details.querySelector<HTMLElement>('summary')?.focus();}
  }}>
    <button className="hw-button hw-pagination-arrow" data-variant="ghost" data-hw-previous="" type="button" aria-label={previousLabel} disabled={disabled || current === 1} onClick={() => select(current - 1)} />
    {items.map(item => typeof item === 'number' ? <button key={item} className="hw-button hw-pagination-item" data-variant="ghost" data-hw-page={item} type="button" disabled={disabled} aria-label={getPageLabel(item)} aria-current={item === current ? 'page' : undefined} onClick={() => select(item)}>{formatPage(item)}</button> :
      disabled ? <span key={'gap-' + item.start} className="hw-pagination-ellipsis" aria-hidden="true">…</span> :
      <details key={'gap-' + item.start} className="hw-pagination-gap" onToggle={event => {if(blocked()) syncInherited();else if(event.currentTarget.open) close(event.currentTarget);}}>
        <summary className="hw-pagination-gap-trigger" aria-label={getGapLabel(item.start, item.end)}>…</summary>
        <div className="hw-pagination-menu">
          {item.end - item.start < 100 ? Array.from({length: item.end - item.start + 1}, (_, index) => item.start + index).map(number => <button key={number} type="button" className="hw-button hw-pagination-item" data-variant="ghost" data-hw-page={number} aria-label={getPageLabel(number)} onClick={event => select(number, event.currentTarget.closest('details'))}>{formatPage(number)}</button>) :
          <div className="hw-pagination-jump" onKeyDown={event => {if(event.key === 'Enter') {event.preventDefault(); jump(event.currentTarget, item.start, item.end);}}}><label className="hw-label">{jumpLabel}<PaginationJumpInput start={item.start} end={item.end} /></label><button type="button" className="hw-button" data-hw-jump-submit="" onClick={event => jump(event.currentTarget.parentElement!, item.start, item.end)}>{goLabel}</button></div>}
        </div>
      </details>)}
    <button className="hw-button hw-pagination-arrow" data-variant="ghost" data-hw-next="" type="button" aria-label={nextLabel} disabled={disabled || current === total} onClick={() => select(current + 1)} />
  </nav>;
}
export interface BreadcrumbItem { label: ReactNode; href?: string; current?: boolean; disabled?: boolean }
export interface BreadcrumbProps extends ComponentPropsWithRef<'nav'> { items: readonly BreadcrumbItem[]; label?: string }
export function Breadcrumb({ items, label = 'مسار التنقل', className, ...props }: BreadcrumbProps) {
  return <nav {...props} className={cx('hw-breadcrumb', className)} aria-label={props['aria-label'] ?? label}><ol>{items.map((item, index) => <li key={index}>{item.href && !item.disabled ? <a href={item.href} aria-current={item.current || index === items.length - 1 ? 'page' : undefined}>{item.label}</a> : <span role={item.disabled ? 'link' : undefined} aria-disabled={item.disabled || undefined} aria-current={item.current || index === items.length - 1 ? 'page' : undefined}>{item.label}</span>}</li>)}</ol></nav>;
}
export interface ProgressProps extends ComponentPropsWithRef<'progress'> { label: string }
export function Progress({ label, className, max = 100, ...props }: ProgressProps) { return <progress {...props} max={max} className={cx('hw-progress', className)} aria-label={label} />; }
export interface SkeletonProps extends ComponentPropsWithRef<'span'> {}
export function Skeleton({ className, ...props }: SkeletonProps) { return <span aria-hidden="true" {...props} className={cx('hw-skeleton', className)} />; }
export interface SpinnerProps extends ComponentPropsWithRef<'span'> { label?: string }
export function Spinner({ label = 'Loading', className, children, ...props }: SpinnerProps) { return <span {...props} role="status" className={cx('hw-spinner', className)}><span className="hw-sr-only">{label}</span>{children}</span>; }
export interface AvatarProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  src?: string; name: string; initials?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '40' | '64' | '80' | '120'; variant?: 'circle' | 'square';
  imageProps?: Omit<ComponentPropsWithRef<'img'>, 'src' | 'alt'>;
}
export function Avatar({ src, name, initials, size, variant, imageProps, className, ...props }: AvatarProps) {
  const [image, setImage] = useState({src, failed: false});
  // Reset during the prop transition so a newly supplied source renders immediately.
  if (image.src !== src) setImage({src, failed: false});
  const visible = !!src && !(image.src === src && image.failed);
  return <span {...props} className={cx('hw-avatar', className)} data-size={size ?? (props as Record<string, unknown>)['data-size']} data-variant={variant ?? (props as Record<string, unknown>)['data-variant']} role={visible ? undefined : 'img'} aria-label={visible ? undefined : name}>{visible ? <img {...imageProps} key={src} src={src} alt={name} onError={event => {setImage(current => current.src === src ? {src, failed: true} : current); imageProps?.onError?.(event);}} /> : <span aria-hidden="true">{initials ?? name.trim().split(/\s+/u).slice(0, 2).map(part => Array.from(part)[0]).join('')}</span>}</span>;
}
export interface DividerProps extends ComponentPropsWithRef<'hr'> {
  tone?: 'neutral' | 'primary' | 'gold' | 'tertiary';
  orientation?: 'horizontal' | 'vertical';
}
export function Divider({ className, tone, orientation, ...props }: DividerProps) {
  return <hr data-tone={tone} aria-orientation={orientation} {...props} className={cx('hw-divider', className)} />;
}
export interface StepItem { value: string; label: ReactNode; description?: ReactNode; status?: 'complete' | 'current' | 'upcoming' }
export interface StepperProps extends ComponentPropsWithRef<'ol'> {
  items: readonly StepItem[]; current?: string; label?: string;
  /** Zero-based active step; -1 means not started, items.length means complete. Overrides current. */
  activeIndex?: number;
}
export function Stepper({ items, current, activeIndex, label = 'التقدم', className, ...props }: StepperProps) {
  const requested = activeIndex ?? items.findIndex(item => item.value === current);
  const index = Number.isInteger(requested) && requested >= -1 && requested <= items.length ? requested : -1;
  return <ol {...props} className={cx('hw-stepper', className)} aria-label={props['aria-label'] ?? label}>{items.map((item, itemIndex) => {
    const status = item.status ?? (itemIndex === index ? 'current' : index > itemIndex ? 'complete' : 'upcoming');
    return <li key={item.value} className="hw-step" data-state={status} aria-current={status === 'current' ? 'step' : undefined}><span>{item.label}</span>{item.description && <p className="hw-hint">{item.description}</p>}</li>;
  })}</ol>;
}
export interface EmptyStateProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> { title: ReactNode; description?: ReactNode; icon?: ReactNode; action?: ReactNode }
export function EmptyState({ title, description, icon, action, children, className, ...props }: EmptyStateProps) { return <div {...props} className={cx('hw-empty', className)}>{icon && <span aria-hidden="true">{icon}</span>}<h3>{title}</h3>{description && <p>{description}</p>}{children}{action}</div>; }
