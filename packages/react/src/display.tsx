import { createElement, useId, useLayoutEffect, useRef } from 'react';
import { createAccordionMotion } from '@nasaq/core';
import type { AccordionMotion } from '@nasaq/core';
import type { ComponentPropsWithRef, HTMLAttributes, Key, ReactNode } from 'react';
import { cx, useControllable } from './shared.js';
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
  return <details ref={details} className="nq-accordion-item" name={name} open={initialOpen.current} onToggle={() => motion.current?.nativeToggle()}>
    <summary className="nq-accordion-trigger" onClick={event => {
      if ((event.target as Element).closest('a,button,input,select,textarea')) return;
      event.preventDefault(); setOpen(!open);
    }}>{item.title}</summary><div ref={content} className="nq-accordion-content">{item.content}</div>
  </details>;
}
export function Accordion({ items, exclusive, className, ...props }: AccordionProps) {
  const group = useId();
  return <div {...props} className={cx('nq-accordion', className)}>{items.map(item => <AccordionDetail key={item.value} item={item} name={exclusive ? group : undefined} />)}</div>;
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
    ...props, className: cx('nq-card', action && 'nq-card-action', className),
    'data-variant': variant ?? (props as Record<string, unknown>)['data-variant'],
    'data-disabled': disabled || undefined,
    ...(action ? { href: disabled ? undefined : href, role: disabled ? 'link' : props.role, 'aria-disabled': disabled || undefined, tabIndex: disabled ? -1 : props.tabIndex } : {}),
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      if (disabled) { event.preventDefault(); event.stopPropagation(); return; }
      onClick?.(event);
    },
  }, header && <header className="nq-card-header">{header}</header>, <div className="nq-card-body">{children}</div>, footer && <footer className="nq-card-footer">{footer}</footer>);
}
export interface BadgeProps extends ComponentPropsWithRef<'span'> { tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' }
export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) { return <span {...props} className={cx('nq-badge', className)} data-tone={tone} />; }
export interface AlertProps extends ComponentPropsWithRef<'div'> {
  tone?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
}
/** Informational messages use status; urgent errors use alert. Override role when static. */
export function Alert({ tone = 'info', title, children, className, role, ...props }: AlertProps) {
  return <div {...props} className={cx('nq-alert', className)} data-tone={tone} role={role ?? (tone === 'danger' ? 'alert' : 'status')}>{title && <strong>{title}</strong>}{children}</div>;
}
export interface TableColumn<Row> { key: string; header: ReactNode; cell: (row: Row, index: number) => ReactNode; rowHeader?: boolean }
export interface TableProps<Row = unknown> extends Omit<ComponentPropsWithRef<'table'>, 'children'> {
  columns?: readonly TableColumn<Row>[];
  rows?: readonly Row[];
  rowKey?: (row: Row, index: number) => Key;
  caption?: ReactNode;
  children?: ReactNode;
  wrapperProps?: HTMLAttributes<HTMLDivElement>;
}
/** Either provide columns/rows or compose native thead/tbody children. */
export function Table<Row>({ columns, rows = [], rowKey = (_, index) => index, caption, children, className, wrapperProps, ...props }: TableProps<Row>) {
  return <div {...wrapperProps} className={cx('nq-table-wrap', wrapperProps?.className)}><table {...props} className={cx('nq-table', className)}>{caption && <caption>{caption}</caption>}{columns ? <><thead><tr>{columns.map(column => <th key={column.key} scope="col">{column.header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={rowKey(row, index)}>{columns.map(column => column.rowHeader ? <th key={column.key} scope="row">{column.cell(row, index)}</th> : <td key={column.key}>{column.cell(row, index)}</td>)}</tr>)}</tbody></> : children}</table></div>;
}
export interface PaginationProps extends Omit<ComponentPropsWithRef<'nav'>, 'onChange'> {
  page?: number;
  defaultPage?: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  label?: string;
  previousLabel?: string;
  nextLabel?: string;
  getPageLabel?: (page: number) => string;
  formatPage?: (page: number) => ReactNode;
  /** Number of neighboring pages shown around the active page. */
  siblingCount?: number;
}
export function Pagination({ page, defaultPage = 1, totalPages, onPageChange, label = 'Pagination', previousLabel = 'Previous', nextLabel = 'Next', getPageLabel = number => `Page ${number}`, formatPage = number => number, siblingCount = 1, className, ...props }: PaginationProps) {
  const total = Number.isFinite(totalPages) ? Math.max(1, Math.floor(totalPages)) : 1;
  const [stored, select] = useControllable(page, defaultPage, onPageChange);
  const current = Math.min(total, Math.max(1, Math.floor(stored) || 1));
  const radius = Math.min(5, Math.max(0, Math.floor(siblingCount)));
  const pages = [...new Set([1, total, ...Array.from({ length: radius * 2 + 1 }, (_, index) => current - radius + index)])].filter(number => number >= 1 && number <= total).sort((a, b) => a - b);
  return <nav {...props} className={cx('nq-pagination', className)} aria-label={props['aria-label'] ?? label}>
    <Button variant="secondary" disabled={current === 1} onClick={() => select(current - 1)}>{previousLabel}</Button>
    {pages.map((number, index) => <span key={number}>{index > 0 && number > (pages[index - 1] ?? 0) + 1 && <span aria-hidden="true">…</span>}<Button variant={number === current ? 'primary' : 'ghost'} aria-label={getPageLabel(number)} aria-current={number === current ? 'page' : undefined} onClick={() => select(number)}>{formatPage(number)}</Button></span>)}
    <Button variant="secondary" disabled={current === total} onClick={() => select(current + 1)}>{nextLabel}</Button>
  </nav>;
}
export interface BreadcrumbItem { label: ReactNode; href?: string; current?: boolean }
export interface BreadcrumbProps extends ComponentPropsWithRef<'nav'> { items: readonly BreadcrumbItem[]; label?: string }
export function Breadcrumb({ items, label = 'Breadcrumb', className, ...props }: BreadcrumbProps) {
  return <nav {...props} className={cx('nq-breadcrumb', className)} aria-label={props['aria-label'] ?? label}><ol>{items.map((item, index) => <li key={index}>{item.href ? <a href={item.href} aria-current={item.current || index === items.length - 1 ? 'page' : undefined}>{item.label}</a> : <span aria-current={item.current || index === items.length - 1 ? 'page' : undefined}>{item.label}</span>}</li>)}</ol></nav>;
}
export interface ProgressProps extends ComponentPropsWithRef<'progress'> { label: string }
export function Progress({ label, className, max = 100, ...props }: ProgressProps) { return <progress {...props} max={max} className={cx('nq-progress', className)} aria-label={label} />; }
export interface SkeletonProps extends ComponentPropsWithRef<'span'> {}
export function Skeleton({ className, ...props }: SkeletonProps) { return <span aria-hidden="true" {...props} className={cx('nq-skeleton', className)} />; }
export interface SpinnerProps extends ComponentPropsWithRef<'span'> { label?: string }
export function Spinner({ label = 'Loading', className, children, ...props }: SpinnerProps) { return <span {...props} role="status" className={cx('nq-spinner', className)}><span className="nq-sr-only">{label}</span>{children}</span>; }
export interface AvatarProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> { src?: string; name: string; initials?: string; imageProps?: Omit<ComponentPropsWithRef<'img'>, 'src' | 'alt'> }
export function Avatar({ src, name, initials, imageProps, className, ...props }: AvatarProps) { return <span {...props} className={cx('nq-avatar', className)} role={src ? undefined : 'img'} aria-label={src ? undefined : name}>{src ? <img {...imageProps} src={src} alt={name} /> : initials ?? name.trim().split(/\s+/u).slice(0, 2).map(part => Array.from(part)[0]).join('')}</span>; }
export interface DividerProps extends ComponentPropsWithRef<'hr'> {}
export function Divider({ className, ...props }: DividerProps) { return <hr {...props} className={cx('nq-divider', className)} />; }
export interface StepItem { value: string; label: ReactNode; description?: ReactNode; status?: 'complete' | 'current' | 'upcoming' }
export interface StepperProps extends ComponentPropsWithRef<'ol'> {
  items: readonly StepItem[]; current?: string; label?: string;
  /** Zero-based active step; -1 means not started, items.length means complete. Overrides current. */
  activeIndex?: number;
}
export function Stepper({ items, current, activeIndex, label = 'التقدم', className, ...props }: StepperProps) {
  const requested = activeIndex ?? items.findIndex(item => item.value === current);
  const index = Number.isInteger(requested) && requested >= -1 && requested <= items.length ? requested : -1;
  return <ol {...props} className={cx('nq-stepper', className)} aria-label={props['aria-label'] ?? label}>{items.map((item, itemIndex) => {
    const status = item.status ?? (itemIndex === index ? 'current' : index > itemIndex ? 'complete' : 'upcoming');
    return <li key={item.value} className="nq-step" data-state={status} aria-current={status === 'current' ? 'step' : undefined}><span>{item.label}</span>{item.description && <p className="nq-hint">{item.description}</p>}</li>;
  })}</ol>;
}
export interface EmptyStateProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> { title: ReactNode; description?: ReactNode; icon?: ReactNode; action?: ReactNode }
export function EmptyState({ title, description, icon, action, children, className, ...props }: EmptyStateProps) { return <div {...props} className={cx('nq-empty', className)}>{icon && <span aria-hidden="true">{icon}</span>}<h3>{title}</h3>{description && <p>{description}</p>}{children}{action}</div>; }
