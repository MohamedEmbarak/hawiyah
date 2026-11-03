import { useEffect, useId, useRef, useState } from 'react';
import type { ComponentPropsWithRef, Key, ReactNode, HTMLAttributes } from 'react';
import { sortRows } from '@nasaq/core';
import { Button, Radio, Textarea } from './forms.js';
import type { ButtonProps } from './forms.js';
import { Avatar, Badge, Card } from './display.js';
import type { AvatarProps, CardProps } from './display.js';
import { cx, useControllable } from './shared.js';

export interface LinkProps extends ComponentPropsWithRef<'a'> { external?: boolean; disabled?: boolean; variant?: 'default' | 'subtle' | 'neutral' | 'standalone'; 'data-variant'?: string }
export function Link({ external, disabled=false, variant, 'data-variant': dataVariant, className, target, rel, href, tabIndex, onClick, onAuxClick, ...props }: LinkProps) {
  const unavailable=disabled || props['aria-disabled']===true || props['aria-disabled']==='true';
  return <a {...props} className={cx('nq-link', className)} data-variant={variant ?? dataVariant} href={unavailable ? undefined : href} role={unavailable ? 'link' : props.role} aria-disabled={unavailable || undefined} tabIndex={unavailable ? -1 : tabIndex} target={external ? '_blank' : target} rel={external ? [rel, 'noopener', 'noreferrer'].filter(Boolean).join(' ') : rel} onClick={event=>{if(unavailable){event.preventDefault();event.stopPropagation();}else onClick?.(event);}} onAuxClick={event=>{if(unavailable){event.preventDefault();event.stopPropagation();}else onAuxClick?.(event);}} />;
}
export interface IconButtonProps extends ButtonProps { label: string; shape?: 'square' | 'circle'; 'data-shape'?: string }
export function IconButton({ label, shape, variant = 'ghost', className, children, ...props }: IconButtonProps) { return <Button {...props} variant={variant} data-shape={shape ?? props['data-shape']} aria-label={label} className={cx('nq-icon-button', className)}><span aria-hidden="true">{children}</span></Button>; }
export interface ButtonGroupProps extends ComponentPropsWithRef<'div'> { label: string; variant?: 'default' | 'attached'; orientation?: 'horizontal' | 'vertical'; 'data-variant'?: string; 'data-orientation'?: string }
export function ButtonGroup({ label, variant, orientation, className, ...props }: ButtonGroupProps) { return <div {...props} data-variant={variant ?? props['data-variant']} data-orientation={orientation ?? props['data-orientation']} role="group" aria-label={label} className={cx('nq-button-group', className)} />; }
export interface ChipProps extends ComponentPropsWithRef<'span'> { onRemove?: () => void; removeLabel?: string; disabled?: boolean; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' }
export function Chip({ onRemove, removeLabel = 'Remove', disabled, tone = 'neutral', children, className, ...props }: ChipProps) { return <span {...props} className={cx('nq-chip', className)} data-tone={tone}>{children}{onRemove && <Button variant="ghost" size="sm" disabled={disabled} aria-label={removeLabel} onClick={onRemove}>×</Button>}</span>; }
export interface DescriptionItem { term: ReactNode; description: ReactNode; key?: Key }
export interface DescriptionListProps extends ComponentPropsWithRef<'dl'> { items: readonly DescriptionItem[] }
export function DescriptionList({ items, className, ...props }: DescriptionListProps) { return <dl {...props} className={cx('nq-description-list', className)}>{items.map((item, index) => <div key={item.key ?? index}><dt>{item.term}</dt><dd>{item.description}</dd></div>)}</dl>; }
export interface StatProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> { label: ReactNode; value: ReactNode; description?: ReactNode; trend?: ReactNode }
export function Stat({ label, value, description, trend, className, ...props }: StatProps) { return <div {...props} className={cx('nq-stat', className)}><dl><dt>{label}</dt><dd className="nq-stat-value">{value}</dd></dl>{description && <p>{description}</p>}{trend && <div className="nq-stat-trend">{trend}</div>}</div>; }
export interface TimelineItem { id: string; title: ReactNode; description?: ReactNode; dateTime?: string; dateLabel?: ReactNode; status?: 'complete' | 'active' | 'upcoming' }
export interface TimelineProps extends ComponentPropsWithRef<'ol'> { items: readonly TimelineItem[]; label?: string }
export function Timeline({ items, label = 'Timeline', className, ...props }: TimelineProps) { return <ol {...props} className={cx('nq-timeline', className)} aria-label={props['aria-label'] ?? label}>{items.map(item => <li key={item.id} data-state={item.status} aria-current={item.status === 'active' ? 'step' : undefined}><h3>{item.title}</h3>{item.description && <div>{item.description}</div>}{item.dateLabel && <time dateTime={item.dateTime}>{item.dateLabel}</time>}</li>)}</ol>; }
export interface MeterProps extends ComponentPropsWithRef<'meter'> { label: string }
export function Meter({ label, className, ...props }: MeterProps) { return <meter {...props} aria-label={label} className={cx('nq-meter', className)} />; }
export interface AvatarGroupProps extends ComponentPropsWithRef<'div'> { items: readonly AvatarProps[]; label: string; max?: number; getOverflowLabel?: (count: number) => string }
export function AvatarGroup({ items, label, max = 5, getOverflowLabel = count => `${count} more people`, className, ...props }: AvatarGroupProps) { const count = Math.max(0, Math.floor(max)); return <div {...props} className={cx('nq-avatar-group', className)} role="group" aria-label={label}>{items.slice(0, count).map((item, index) => <Avatar key={index} {...item} />)}{items.length > count && <span className="nq-avatar" role="img" aria-label={getOverflowLabel(items.length - count)}>+{items.length - count}</span>}</div>; }
export interface DataTableColumn<Row> { key: keyof Row & string; label: ReactNode; sortable?: boolean; render?: (value: Row[keyof Row], row: Row) => ReactNode; rowHeader?: boolean }
export interface DataTableSort { key: string; direction: 'ascending' | 'descending' }
export interface DataTableProps<Row extends Record<string, unknown>> extends Omit<ComponentPropsWithRef<'table'>, 'children' | 'onChange'> { variant?: 'default' | 'striped' | 'bordered'; size?: 'sm' | 'md' | 'lg'; 'data-variant'?: string; 'data-size'?: string; wrapperProps?: HTMLAttributes<HTMLDivElement>; columns: readonly DataTableColumn<Row>[]; rows: readonly Row[]; caption: ReactNode; rowKey?: (row: Row, index: number) => Key; sort?: DataTableSort | null; defaultSort?: DataTableSort | null; onSortChange?: (sort: DataTableSort) => void; locale?: string; emptyMessage?: ReactNode; getSortLabel?: (label: ReactNode, direction: 'ascending' | 'descending') => string }
export function DataTable<Row extends Record<string, unknown>>({ columns, rows, caption, rowKey = (_, index) => index, sort, defaultSort = null, onSortChange, locale = 'ar-SA', emptyMessage = 'لا توجد سجلات', getSortLabel, className, variant, size, wrapperProps, ...props }: DataTableProps<Row>) {
  const captionId = useId();
  const [sorting, setSort] = useControllable<DataTableSort | null>(sort, defaultSort, next => { if (next) onSortChange?.(next); }); const sorted = sorting ? sortRows(rows, sorting.key, sorting.direction, locale) : rows;
  return <div tabIndex={0} role="region" aria-labelledby={captionId} {...wrapperProps} className={cx('nq-table-wrap', wrapperProps?.className)}><table {...props} data-variant={variant ?? props['data-variant']} data-size={size ?? props['data-size']} className={cx('nq-table nq-data-table', className)}><caption id={captionId}>{caption}</caption><thead><tr>{columns.map(column => { const active = sorting?.key === column.key; const direction = active && sorting.direction === 'ascending' ? 'descending' : 'ascending'; return <th key={column.key} scope="col" aria-sort={column.sortable ? active ? sorting.direction : 'none' : undefined}>{column.sortable ? <Button variant="ghost" aria-label={getSortLabel?.(column.label, direction)} onClick={() => setSort({ key: column.key, direction })}>{column.label}<span aria-hidden="true">{active ? sorting.direction === 'ascending' ? ' ↑' : ' ↓' : ' ↕'}</span></Button> : column.label}</th>; })}</tr></thead><tbody>{sorted.length ? sorted.map((row, index) => <tr key={rowKey(row, index)}>{columns.map(column => { const content = column.render ? column.render(row[column.key], row) : String(row[column.key] ?? ''); return column.rowHeader ? <th key={column.key} scope="row">{content}</th> : <td key={column.key}>{content}</td>; })}</tr>) : <tr><td colSpan={columns.length || 1}>{emptyMessage}</td></tr>}</tbody></table></div>;
}
export interface ServiceCardProps extends Omit<CardProps, 'header' | 'footer' | 'title'> { title: ReactNode; description?: ReactNode; href?: string; action?: ReactNode; actionLabel?: string; category?: ReactNode; metadata?: readonly DescriptionItem[]; icon?: ReactNode }
export function ServiceCard({ title, description, href, action, actionLabel = 'View service', category, metadata, icon, children, className, ...props }: ServiceCardProps) { return <Card {...props} className={cx('nq-service-card', className)} header={<>{icon && <span aria-hidden="true">{icon}</span>}<div>{category && <Badge>{category}</Badge>}<h3>{title}</h3></div></>} footer={action ?? (href && <Link href={href}>{actionLabel}</Link>)}>{description && <p>{description}</p>}{metadata && <DescriptionList items={metadata} />}{children}</Card>; }
export interface ServiceDetailsProps extends Omit<ComponentPropsWithRef<'article'>, 'title'> { title: ReactNode; description?: ReactNode; metadata?: readonly DescriptionItem[]; requirements?: readonly ReactNode[]; requirementsLabel?: string; action?: ReactNode }
export function ServiceDetails({ title, description, metadata, requirements, requirementsLabel = 'Requirements', action, children, className, ...props }: ServiceDetailsProps) { return <article {...props} className={cx('nq-service-details', className)}><header><h2>{title}</h2>{description && <p>{description}</p>}</header>{metadata && <DescriptionList items={metadata} />}{requirements && <section><h3>{requirementsLabel}</h3><ul>{requirements.map((item, index) => <li key={index}>{item}</li>)}</ul></section>}{children}{action && <footer>{action}</footer>}</article>; }
export interface PortalNavItem { label: ReactNode; href: string; current?: boolean }
export interface PortalHeaderProps extends ComponentPropsWithRef<'header'> { brand: ReactNode; brandHref?: string; navigation?: readonly PortalNavItem[]; navigationLabel?: string; menuLabel?: string; navigationId?: string; mainId?: string; skipLabel?: string; actions?: ReactNode; notice?: ReactNode }
export function PortalHeader({ brand, brandHref, navigation, navigationLabel = 'التنقل الرئيسي', menuLabel = 'القائمة', navigationId, mainId, skipLabel = 'انتقل إلى المحتوى', actions, notice, children, className, onKeyDown, onBlur, ...props }: PortalHeaderProps) {
  const id = useId(); const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null); const trigger = useRef<HTMLButtonElement>(null);
  const navId = navigationId ?? `${id}-navigation`;
  useEffect(() => {
    if (!open) return;
    const root = container.current; const document = root?.ownerDocument;
    const outside = (event: PointerEvent) => { if (!root?.contains(event.target as Node)) setOpen(false); };
    document?.addEventListener('pointerdown', outside);
    return () => document?.removeEventListener('pointerdown', outside);
  }, [open]);
  return <header {...props} className={cx('nq-portal-header', className)} onKeyDown={event => {
    onKeyDown?.(event);
    if (!event.defaultPrevented && event.key === 'Escape' && open) { event.preventDefault(); setOpen(false); trigger.current?.focus(); }
  }} onBlur={event => { onBlur?.(event); if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false); }}>
    {mainId && <a className="nq-skip-link" href={`#${mainId}`}>{skipLabel}</a>}
    {notice && <div className="nq-portal-notice">{notice}</div>}
    <div ref={container} className="nq-portal-header-main">
      {brandHref ? <Link href={brandHref} className="nq-portal-brand">{brand}</Link> : <div className="nq-portal-brand">{brand}</div>}
      {!!navigation?.length && <><button ref={trigger} className="nq-button nq-portal-menu-toggle" type="button" aria-expanded={open} aria-controls={navId} onClick={() => setOpen(!open)}><span className="nq-icon" data-icon={open ? 'cancel-01' : 'menu-01'} aria-hidden="true" />{menuLabel}</button>
        <nav id={navId} aria-label={navigationLabel} data-open={open}><ul>{navigation.map((item, index) => <li key={index}><Link href={item.href} aria-current={item.current ? 'page' : undefined} onClick={() => setOpen(false)}>{item.label}</Link></li>)}</ul></nav></>}
      {actions && <div className="nq-portal-actions">{actions}</div>}{children}
    </div>
  </header>;
}
export interface PortalFooterLink extends PortalNavItem { external?: boolean }
export interface PortalFooterGroup { title: string; links: readonly PortalFooterLink[] }
export interface PortalFooterProps extends ComponentPropsWithRef<'footer'> {
  brand?: ReactNode; description?: ReactNode; links?: readonly PortalFooterLink[]; linksLabel?: string; legal?: ReactNode;
  groups?: readonly PortalFooterGroup[]; legalLinks?: readonly PortalFooterLink[]; legalLinksLabel?: string;
  support?: ReactNode; supportLabel?: string; partners?: ReactNode; externalLabel?: string;
}
export function PortalFooter({ brand, description, links, linksLabel = 'روابط التذييل', legal, groups = [], legalLinks = [], legalLinksLabel = 'السياسات وإمكانية الوصول', support, supportLabel = 'المساعدة والتواصل', partners, externalLabel = 'يفتح في نافذة جديدة', children, className, ...props }: PortalFooterProps) {
  const linkList = (items: readonly PortalFooterLink[]) => <ul className="nq-portal-footer-links">{items.map((item, index) => <li key={index}><Link href={item.href} external={item.external}>{item.label}{item.external && <><span className="nq-portal-footer-external" aria-hidden="true">↗</span><span className="nq-sr-only"> · {externalLabel}</span></>}</Link></li>)}</ul>;
  return <footer {...props} className={cx('nq-portal-footer', className)}>
    <div className="nq-portal-footer-main">
      {(brand || description) && <div className="nq-portal-footer-brand">{brand && <div className="nq-portal-footer-brand-marks">{brand}</div>}{description && <p>{description}</p>}</div>}
      {!!links?.length && <nav className="nq-portal-footer-group" aria-label={linksLabel}><h2>{linksLabel}</h2>{linkList(links)}</nav>}
      {groups.map((group, index) => group.links.length > 0 && <nav className="nq-portal-footer-group" aria-label={group.title} key={index}><h2>{group.title}</h2>{linkList(group.links)}</nav>)}
      {support && <section className="nq-portal-footer-support" aria-label={supportLabel}><h2>{supportLabel}</h2><div className="nq-portal-footer-support-content">{support}</div></section>}
      {children && <div className="nq-portal-footer-extra">{children}</div>}
    </div>
    {(legal || legalLinks.length > 0 || partners) && <div className="nq-portal-footer-bottom">{legal && <small>{legal}</small>}{legalLinks.length > 0 && <nav className="nq-portal-footer-legal" aria-label={legalLinksLabel}>{linkList(legalLinks)}</nav>}{partners && <div className="nq-portal-footer-partners">{partners}</div>}</div>}
  </footer>;
}
export interface FeedbackValue { helpful: 'yes' | 'no' | ''; comment: string }
export interface FeedbackProps extends Omit<ComponentPropsWithRef<'form'>, 'onSubmit' | 'onChange' | 'defaultValue'> { label: ReactNode; value?: FeedbackValue; defaultValue?: FeedbackValue; onValueChange?: (value: FeedbackValue) => void; onFeedback?: (value: FeedbackValue) => void; yesLabel?: string; noLabel?: string; commentLabel?: string; submitLabel?: string; successMessage?: ReactNode; disabled?: boolean; choiceVariant?: 'text' | 'icon' | 'icon-text' }
export function Feedback({ label, value, defaultValue = { helpful: '', comment: '' }, onValueChange, onFeedback, yesLabel = 'Yes', noLabel = 'No', commentLabel = 'Tell us more (optional)', submitLabel = 'Send feedback', successMessage = 'Thank you for your feedback.', choiceVariant = 'text', disabled, className, onReset, ...props }: FeedbackProps) {
  const id = useId(); const [current, setCurrent] = useControllable(value, defaultValue, onValueChange); const [sent, setSent] = useState(false);
  return <form {...props} className={cx('nq-feedback', className)} data-choice-variant={choiceVariant} onReset={event => { onReset?.(event); const native = event.nativeEvent; queueMicrotask(() => { if (!native.defaultPrevented) { if (value === undefined) setCurrent(defaultValue); setSent(false); } }); }} onSubmit={event => { event.preventDefault(); if (disabled || !current.helpful) return; onFeedback?.(current); setSent(true); }}><fieldset disabled={disabled}><legend>{label}</legend><div className="nq-feedback-actions"><Radio name={`${id}-helpful`} label={<><span className="nq-icon nq-feedback-icon" data-icon="thumbs-up" aria-hidden="true" /><span className="nq-feedback-label">{yesLabel}</span></>} value="yes" checked={current.helpful === 'yes'} required onChange={() => { setCurrent({ ...current, helpful: 'yes' }); setSent(false); }} /><Radio name={`${id}-helpful`} label={<><span className="nq-icon nq-feedback-icon" data-icon="thumbs-down" aria-hidden="true" /><span className="nq-feedback-label">{noLabel}</span></>} value="no" checked={current.helpful === 'no'} onChange={() => { setCurrent({ ...current, helpful: 'no' }); setSent(false); }} /></div><Textarea label={commentLabel} name="comment" value={current.comment} onChange={event => { setCurrent({ ...current, comment: event.currentTarget.value }); setSent(false); }} /><Button type="submit" disabled={disabled || !current.helpful}>{submitLabel}</Button></fieldset><div role="status">{sent ? successMessage : null}</div></form>;
}
export type CookieChoice = 'accepted' | 'rejected' | null;
export interface CookieConsentProps extends Omit<ComponentPropsWithRef<'section'>, 'onChange' | 'defaultValue' | 'title'> { title: ReactNode; description: ReactNode; value?: CookieChoice; defaultValue?: CookieChoice; onValueChange?: (value: Exclude<CookieChoice, null>) => void; acceptLabel?: string; rejectLabel?: string; policyHref?: string; policyLabel?: string }
export function CookieConsent({ title, description, value, defaultValue = null, onValueChange, acceptLabel = 'Accept optional cookies', rejectLabel = 'Reject optional cookies', policyHref, policyLabel = 'Cookie policy', className, ...props }: CookieConsentProps) {
  const id = useId(); const [choice, setChoice] = useControllable<CookieChoice>(value, defaultValue, next => { if (next) onValueChange?.(next); });
  return <section {...props} hidden={choice !== null} className={cx('nq-cookie-consent', className)} aria-labelledby={`${id}-title`}><h2 id={`${id}-title`}>{title}</h2><p>{description}</p>{policyHref && <Link href={policyHref}>{policyLabel}</Link>}<div className="nq-inline"><Button variant="secondary" onClick={() => setChoice('rejected')}>{rejectLabel}</Button><Button onClick={() => setChoice('accepted')}>{acceptLabel}</Button></div></section>;
}
export interface NotificationItem { id: string; title: ReactNode; description?: ReactNode; href?: string; dateTime?: string; dateLabel?: ReactNode; read?: boolean }
export interface NotificationListProps extends ComponentPropsWithRef<'section'> { items: readonly NotificationItem[]; label: ReactNode; emptyMessage?: ReactNode; onMarkRead?: (id: string) => void; getMarkReadLabel?: (item: NotificationItem) => string; unreadLabel?: string }
export function NotificationList({ items, label, emptyMessage = 'No notifications', onMarkRead, getMarkReadLabel = () => 'Mark as read', unreadLabel = 'Unread', className, ...props }: NotificationListProps) { const id = useId(); return <section {...props} className={cx('nq-notification-list', className)} aria-labelledby={`${id}-title`}><h2 id={`${id}-title`}>{label}</h2>{items.length ? <ul>{items.map(item => <li key={item.id} data-state={item.read ? 'read' : 'unread'}><h3>{item.href ? <Link href={item.href}>{item.title}</Link> : item.title}</h3>{!item.read && <Badge tone="info">{unreadLabel}</Badge>}{item.description && <p>{item.description}</p>}{item.dateLabel && <time dateTime={item.dateTime}>{item.dateLabel}</time>}{!item.read && onMarkRead && <Button variant="ghost" onClick={() => onMarkRead(item.id)}>{getMarkReadLabel(item)}</Button>}</li>)}</ul> : <p>{emptyMessage}</p>}</section>; }
