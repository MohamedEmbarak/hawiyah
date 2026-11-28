import { createElement, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createAccordionMotion, getPaginationItems, normalizePaginationPage, normalizePaginationTotal } from '@hawiyah/core';
import type { AccordionMotion } from '@hawiyah/core';
import type { ComponentPropsWithRef, HTMLAttributes, Key, ReactNode } from 'react';
import { assignRef, cx, rootLabel, text, useControllable, useFieldValueRef } from './shared.js';
import type { RootName } from './shared.js';
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
interface AlertBaseProps extends ComponentPropsWithRef<'div'> {
  tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  variant?: 'default' | 'outline' | 'minimal';
  title?: string;
}
/** `onDismiss` renders a close button named by `closeLabel`; the application removes the alert and places focus. */
export type AlertProps = AlertBaseProps & ({ onDismiss?: undefined; closeLabel?: string } | { onDismiss: () => void; closeLabel: string });
/** Informational messages use status; urgent errors use alert. Override role when static. */
export function Alert({ tone = 'info', variant, title, onDismiss, closeLabel, children, className, role, ...props }: AlertProps) {
  return <div {...props} {...(variant ? { 'data-variant': variant } : {})} className={cx('hw-alert', className)} data-tone={tone} role={role ?? (tone === 'danger' ? 'alert' : 'status')}><div className="hw-alert-content">{title && <strong>{title}</strong>}{children}</div>{onDismiss && <Button variant="ghost" className="hw-alert-dismiss" aria-label={text('Alert', 'closeLabel', closeLabel, 'onDismiss is given')} onClick={() => onDismiss()}><span className="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true" /></Button>}</div>;
}
/** Without `cell` a column shows the row's value under `key` as text. */
export interface TableColumn<Row> { key: string; label: ReactNode; cell?: (row: Row, index: number) => ReactNode; rowHeader?: boolean }
const cellContent = <Row,>(column: { key: string; cell?: (row: Row, index: number) => ReactNode }, row: Row, index: number): ReactNode => column.cell ? column.cell(row, index) : String((row as Record<string, unknown>)[column.key] ?? '');
interface TableBaseProps<Row> extends Omit<ComponentPropsWithRef<'table'>, 'children'> {
  variant?: 'default' | 'striped' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
  'data-variant'?: string;
  'data-size'?: string;
  rows?: readonly Row[];
  rowKey?: (row: Row, index: number) => Key;
  caption?: ReactNode;
  children?: ReactNode;
  wrapperProps?: HTMLAttributes<HTMLDivElement>;
}
/** With `columns`, `emptyMessage` is the text of the single cell rendered when there are no rows. */
export type TableProps<Row = unknown> = TableBaseProps<Row> & ({ columns?: undefined; emptyMessage?: ReactNode } | { columns: readonly TableColumn<Row>[]; emptyMessage: ReactNode });
/** Either provide columns/rows or compose native thead/tbody children. */
export function Table<Row>({ columns, rows = [], rowKey = (_, index) => index, caption, children, className, wrapperProps, variant, size, emptyMessage, ...props }: TableProps<Row>) {
  const captionId = useId(); const empty = columns ? text('Table', 'emptyMessage', emptyMessage, 'columns are given') : undefined;
  return <div tabIndex={0} role={caption ? 'region' : undefined} aria-labelledby={caption ? captionId : undefined} {...wrapperProps} className={cx('hw-table-wrap', wrapperProps?.className)}><table {...props} data-variant={variant ?? props['data-variant']} data-size={size ?? props['data-size']} className={cx('hw-table', className)}>{caption && <caption id={captionId}>{caption}</caption>}{columns ? <><thead><tr>{columns.map(column => <th key={column.key} scope="col">{column.label}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row, index) => <tr key={rowKey(row, index)}>{columns.map(column => column.rowHeader ? <th key={column.key} scope="row">{cellContent(column, row, index)}</th> : <td key={column.key}>{cellContent(column, row, index)}</td>)}</tr>) : <tr><td colSpan={columns.length || 1}>{empty}</td></tr>}</tbody></> : children}</table></div>;
}
function PaginationJumpInput({start, end}: {start: number; end: number}) {
  const ref = useFieldValueRef<HTMLInputElement>(undefined);
  return <input ref={ref} className="hw-input" data-hw-jump-input="" data-hw-filled="true" form="" type="number" inputMode="numeric" required min={start} max={end} step={1} defaultValue={start} onInput={event => {
    const input = event.currentTarget;
    if(input.dataset.hwJumpTouched === 'true') {if(input.checkValidity()) input.removeAttribute('aria-invalid'); else input.setAttribute('aria-invalid','true');}
  }} />;
}
interface PaginationBaseProps extends Omit<ComponentPropsWithRef<'nav'>, 'onChange'> {
  page?: number; defaultPage?: number; totalPages: number; onPageChange?: (page: number) => void;
  previousLabel: string; nextLabel: string;
  getPageLabel: (page: number) => string; formatPage?: (page: number) => ReactNode;
  siblingCount?: number; disabled?: boolean; hideOnSinglePage?: boolean;
  getGapLabel: (start: number, end: number) => string; jumpLabel: string; goLabel: string;
}
export type PaginationProps = PaginationBaseProps & RootName;
export function Pagination({ page, defaultPage = 1, totalPages, onPageChange,
  label, previousLabel, nextLabel, getPageLabel, formatPage = String, siblingCount = 1,
  disabled = false, hideOnSinglePage = false, getGapLabel, jumpLabel, goLabel, className, ref, ...props
}: PaginationProps) {
  const copy = { label: rootLabel('Pagination', props, label), previous: text('Pagination', 'previousLabel', previousLabel), next: text('Pagination', 'nextLabel', nextLabel), page: text('Pagination', 'getPageLabel', getPageLabel), gap: text('Pagination', 'getGapLabel', getGapLabel), jump: text('Pagination', 'jumpLabel', jumpLabel), go: text('Pagination', 'goLabel', goLabel) };
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
  return <nav {...props} ref={node => {root.current = node; assignRef(ref, node);}} className={cx('hw-pagination', className)} aria-label={copy.label} data-disabled={disabled || undefined} hidden={props.hidden || hideOnSinglePage && total === 1} onClickCapture={event => {props.onClickCapture?.(event);if(blocked()) {event.preventDefault();event.stopPropagation();syncInherited();}}} onKeyDown={event => {
    props.onKeyDown?.(event);
    if(blocked() && ['Enter',' '].includes(event.key)) {event.preventDefault();syncInherited();return;}
    if (event.defaultPrevented || event.key !== 'Escape') return;
    const details = (event.target as HTMLElement).closest<HTMLDetailsElement>('.hw-pagination-gap[open]');
    if (details) {event.preventDefault(); details.open = false; details.querySelector<HTMLElement>('summary')?.focus();}
  }}>
    <button className="hw-button hw-pagination-arrow" data-variant="ghost" data-hw-previous="" type="button" aria-label={copy.previous} disabled={disabled} aria-disabled={!disabled && current === 1 ? true : undefined} onClick={() => select(current - 1)} />
    {items.map(item => typeof item === 'number' ? <button key={item} className="hw-button hw-pagination-item" data-variant="ghost" data-hw-page={item} type="button" disabled={disabled} aria-label={copy.page?.(item) || undefined} aria-current={item === current ? 'page' : undefined} onClick={() => select(item)}>{formatPage(item)}</button> :
      disabled ? <span key={'gap-' + item.start} className="hw-pagination-ellipsis" aria-hidden="true">…</span> :
      <details key={'gap-' + item.start} className="hw-pagination-gap" onToggle={event => {if(blocked()) syncInherited();else if(event.currentTarget.open) close(event.currentTarget);}}>
        <summary className="hw-pagination-gap-trigger" aria-label={copy.gap?.(item.start, item.end) || undefined}>…</summary>
        <div className="hw-pagination-menu">
          {item.end - item.start < 100 ? Array.from({length: item.end - item.start + 1}, (_, index) => item.start + index).map(number => <button key={number} type="button" className="hw-button hw-pagination-item" data-variant="ghost" data-hw-page={number} aria-label={copy.page?.(number) || undefined} onClick={event => select(number, event.currentTarget.closest('details'))}>{formatPage(number)}</button>) :
          <div className="hw-pagination-jump" onKeyDown={event => {if(event.key === 'Enter') {event.preventDefault(); jump(event.currentTarget, item.start, item.end);}}}><label className="hw-label">{copy.jump}<PaginationJumpInput start={item.start} end={item.end} /></label><button type="button" className="hw-button" data-hw-jump-submit="" onClick={event => jump(event.currentTarget.parentElement!, item.start, item.end)}>{copy.go}</button></div>}
        </div>
      </details>)}
    <button className="hw-button hw-pagination-arrow" data-variant="ghost" data-hw-next="" type="button" aria-label={copy.next} disabled={disabled} aria-disabled={!disabled && current === total ? true : undefined} onClick={() => select(current + 1)} />
  </nav>;
}
export interface BreadcrumbItem { label: ReactNode; href?: string; current?: boolean; disabled?: boolean }
export type BreadcrumbProps = ComponentPropsWithRef<'nav'> & { items: readonly BreadcrumbItem[] } & RootName;
/** The current item (the first with `current`, else the last) is text with aria-current="page", never a link. */
export function Breadcrumb({ items, label, className, ...props }: BreadcrumbProps) {
  const flagged = items.findIndex(item => item.current); const currentIndex = flagged === -1 ? items.length - 1 : flagged;
  return <nav {...props} className={cx('hw-breadcrumb', className)} aria-label={rootLabel('Breadcrumb', props, label)}><ol>{items.map((item, index) => <li key={index}>{index === currentIndex ? <span aria-current="page">{item.label}</span> : item.href && !item.disabled ? <a href={item.href}>{item.label}</a> : <span role={item.disabled ? 'link' : undefined} aria-disabled={item.disabled || undefined}>{item.label}</span>}</li>)}</ol></nav>;
}
/** A native progress named by `label` (or aria-label / aria-labelledby); without `value` it is indeterminate. */
export type ProgressProps = ComponentPropsWithRef<'progress'> & { size?: 'sm' | 'lg' } & RootName;
export function Progress({ label, size, className, max = 100, ...props }: ProgressProps) { return <progress {...props} max={max} data-size={size ?? (props as Record<string, unknown>)['data-size']} className={cx('hw-progress', className)} aria-label={rootLabel('Progress', props, label)} />; }
/** Decorative placeholder; size it with style or className. */
export interface SkeletonProps extends ComponentPropsWithRef<'span'> { variant?: 'text' | 'circle' }
export function Skeleton({ variant, className, ...props }: SkeletonProps) { return <span aria-hidden="true" {...props} data-variant={variant ?? (props as Record<string, unknown>)['data-variant']} className={cx('hw-skeleton', className)} />; }
/** A spinner marked aria-hidden by the application is decorative and needs no name. */
export type SpinnerProps = ComponentPropsWithRef<'span'> & { size?: 'sm' | 'lg' } & (RootName | { label?: string; 'aria-hidden': true | 'true' });
export function Spinner({ label, size, className, children, ...props }: SpinnerProps) { const decorative = props['aria-hidden'] === true || props['aria-hidden'] === 'true'; const name = decorative ? undefined : hasTextOrAria(props) ? label : text('Spinner', 'label', label); return <span {...props} role="status" data-size={size ?? (props as Record<string, unknown>)['data-size']} className={cx('hw-spinner', className)}>{name && <span className="hw-sr-only">{name}</span>}{children}</span>; }
const hasTextOrAria = (props: { 'aria-label'?: string; 'aria-labelledby'?: string }) => Boolean(props['aria-label']?.trim() || props['aria-labelledby']?.trim());
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
interface StepperBaseProps extends ComponentPropsWithRef<'ol'> {
  items: readonly StepItem[]; current?: string;
  /** Zero-based active step; -1 means not started, items.length means complete. Overrides current. */
  activeIndex?: number;
  /** Visually hidden state text after the label of a complete step. */
  completeLabel: string;
  /** Visually hidden state text after the label of an upcoming step. */
  upcomingLabel: string;
}
export type StepperProps = StepperBaseProps & RootName;
export function Stepper({ items, current, activeIndex, completeLabel, upcomingLabel, label, className, ...props }: StepperProps) {
  const stateText = { complete: text('Stepper', 'completeLabel', completeLabel), upcoming: text('Stepper', 'upcomingLabel', upcomingLabel), current: undefined };
  const requested = activeIndex ?? items.findIndex(item => item.value === current);
  const index = Number.isInteger(requested) && requested >= -1 && requested <= items.length ? requested : -1;
  return <ol {...props} className={cx('hw-stepper', className)} aria-label={rootLabel('Stepper', props, label)}>{items.map((item, itemIndex) => {
    const status = item.status ?? (itemIndex === index ? 'current' : index > itemIndex ? 'complete' : 'upcoming');
    return <li key={item.value} className="hw-step" data-state={status} aria-current={status === 'current' ? 'step' : undefined}><span>{item.label}</span>{stateText[status] && <span className="hw-sr-only" data-hw-step-status="">{stateText[status]}</span>}{item.description && <p className="hw-hint">{item.description}</p>}</li>;
  })}</ol>;
}
export interface EmptyStateProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> { title: ReactNode; description?: ReactNode; icon?: ReactNode; action?: ReactNode }
export function EmptyState({ title, description, icon, action, children, className, ...props }: EmptyStateProps) { return <div {...props} className={cx('hw-empty', className)}>{icon && <span className="hw-empty-icon" aria-hidden="true">{icon}</span>}<h3>{title}</h3>{description && <p>{description}</p>}{children}{action}</div>; }
