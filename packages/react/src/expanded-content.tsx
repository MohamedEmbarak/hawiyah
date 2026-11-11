import { useEffect, useId, useRef, useState } from 'react';
import type { ComponentPropsWithRef, Key, ReactNode, HTMLAttributes, Ref } from 'react';
import { sortRows } from '@hawiyah/core';
import { Button, Radio, Textarea } from './forms.js';
import type { ButtonProps } from './forms.js';
import { Avatar, Badge, Card } from './display.js';
import type { AvatarProps, CardProps } from './display.js';
import { cx, rootLabel, text, useBrandCheck, useControllable, useFragmentLink } from './shared.js';
import type { RootName } from './shared.js';

export interface LinkProps extends ComponentPropsWithRef<'a'> { external?: boolean; disabled?: boolean; variant?: 'default' | 'subtle' | 'neutral' | 'standalone'; 'data-variant'?: string }
export function Link({ external, disabled=false, variant, 'data-variant': dataVariant, className, target, rel, href, tabIndex, onClick, onAuxClick, ...props }: LinkProps) {
  const unavailable=disabled || props['aria-disabled']===true || props['aria-disabled']==='true';
  return <a {...props} className={cx('hw-link', className)} data-variant={variant ?? dataVariant} href={unavailable ? undefined : href} role={unavailable ? 'link' : props.role} aria-disabled={unavailable || undefined} tabIndex={unavailable ? -1 : tabIndex} target={external ? '_blank' : target} rel={external ? [rel, 'noopener', 'noreferrer'].filter(Boolean).join(' ') : rel} onClick={event=>{if(unavailable){event.preventDefault();event.stopPropagation();}else onClick?.(event);}} onAuxClick={event=>{if(unavailable){event.preventDefault();event.stopPropagation();}else onAuxClick?.(event);}} />;
}
export interface IconButtonProps extends ButtonProps { label: string; shape?: 'square' | 'circle'; 'data-shape'?: string }
export function IconButton({ label, shape, variant = 'ghost', className, children, ...props }: IconButtonProps) { return <Button {...props} variant={variant} data-shape={shape ?? props['data-shape']} aria-label={label} className={cx('hw-icon-button', className)}><span aria-hidden="true">{children}</span></Button>; }
export interface ButtonGroupProps extends ComponentPropsWithRef<'div'> { label: string; variant?: 'default' | 'attached'; orientation?: 'horizontal' | 'vertical'; 'data-variant'?: string; 'data-orientation'?: string }
export function ButtonGroup({ label, variant, orientation, className, ...props }: ButtonGroupProps) { return <div {...props} data-variant={variant ?? props['data-variant']} data-orientation={orientation ?? props['data-orientation']} role="group" aria-label={label} className={cx('hw-button-group', className)} />; }
interface ChipBaseProps extends ComponentPropsWithRef<'span'> { disabled?: boolean; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' }
/** `removeLabel` names the remove button rendered with `onRemove`. */
export type ChipProps = ChipBaseProps & ({ onRemove?: undefined; removeLabel?: string } | { onRemove?: () => void; removeLabel: string });
export function Chip({ onRemove, removeLabel, disabled, tone = 'neutral', children, className, ...props }: ChipProps) { return <span {...props} className={cx('hw-chip', className)} data-tone={tone}>{children}{onRemove && <Button variant="ghost" size="sm" disabled={disabled} aria-label={text('Chip', 'removeLabel', removeLabel, 'onRemove is given')} onClick={onRemove}><span className="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true" /></Button>}</span>; }
export interface DescriptionItem { term: ReactNode; description: ReactNode; key?: Key }
export interface DescriptionListProps extends ComponentPropsWithRef<'dl'> { items: readonly DescriptionItem[] }
export function DescriptionList({ items, className, ...props }: DescriptionListProps) { return <dl {...props} className={cx('hw-description-list', className)}>{items.map((item, index) => <div key={item.key ?? index}><dt>{item.term}</dt><dd>{item.description}</dd></div>)}</dl>; }
export interface StatProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> { label: ReactNode; value: ReactNode; description?: ReactNode; trend?: ReactNode }
export function Stat({ label, value, description, trend, className, ...props }: StatProps) { return <div {...props} className={cx('hw-stat', className)}><dl><dt>{label}</dt><dd className="hw-stat-value">{value}</dd></dl>{description && <p>{description}</p>}{trend && <div className="hw-stat-trend">{trend}</div>}</div>; }
export interface TimelineItem { id: string; title: ReactNode; description?: ReactNode; dateTime?: string; dateLabel?: ReactNode; status?: 'complete' | 'active' | 'upcoming' }
export type TimelineProps = ComponentPropsWithRef<'ol'> & { items: readonly TimelineItem[] } & RootName;
export function Timeline({ items, label, className, ...props }: TimelineProps) { return <ol {...props} className={cx('hw-timeline', className)} aria-label={rootLabel('Timeline', props, label)}>{items.map(item => <li key={item.id} data-state={item.status} aria-current={item.status === 'active' ? 'step' : undefined}><h3>{item.title}</h3>{item.description && <div>{item.description}</div>}{item.dateLabel && <time dateTime={item.dateTime}>{item.dateLabel}</time>}</li>)}</ol>; }
export interface MeterProps extends ComponentPropsWithRef<'meter'> { label: string }
export function Meter({ label, className, ...props }: MeterProps) { return <meter {...props} aria-label={label} className={cx('hw-meter', className)} />; }
/** `getOverflowLabel(count)` names the "+N" marker for the hidden avatars. */
export type AvatarGroupProps = ComponentPropsWithRef<'div'> & { items: readonly AvatarProps[]; max?: number; getOverflowLabel: (count: number) => string } & RootName;
export function AvatarGroup({ items, label, max = 5, getOverflowLabel, className, ...props }: AvatarGroupProps) {
  const overflowLabel = text('AvatarGroup', 'getOverflowLabel', getOverflowLabel);
  const rounded = Math.floor(max);
  const visible = items.slice(0, Number.isNaN(rounded) ? 5 : Math.max(0, rounded));
  const remaining = items.length - visible.length;
  return <div {...props} className={cx('hw-avatar-group', className)} role="group" aria-label={rootLabel('AvatarGroup', props, label)}>
    {visible.map((item, index) => <Avatar key={index} {...item} />)}
    {remaining > 0 && <span className="hw-avatar" role="img" aria-label={overflowLabel?.(remaining) || undefined}>+{remaining}</span>}
  </div>;
}
export interface DataTableColumn<Row> { key: keyof Row & string; label: ReactNode; sortable?: boolean; render?: (value: Row[keyof Row], row: Row) => ReactNode; rowHeader?: boolean }
export interface DataTableSort { key: string; direction: 'ascending' | 'descending' }
export interface DataTableProps<Row extends Record<string, unknown>> extends Omit<ComponentPropsWithRef<'table'>, 'children' | 'onChange'> { variant?: 'default' | 'striped' | 'bordered'; size?: 'sm' | 'md' | 'lg'; 'data-variant'?: string; 'data-size'?: string; wrapperProps?: HTMLAttributes<HTMLDivElement>; columns: readonly DataTableColumn<Row>[]; rows: readonly Row[]; caption: ReactNode; rowKey?: (row: Row, index: number) => Key; sort?: DataTableSort | null; defaultSort?: DataTableSort | null; onSortChange?: (sort: DataTableSort) => void; locale?: string; emptyMessage: ReactNode; getSortLabel?: (column: DataTableColumn<Row>, direction: 'ascending' | 'descending') => string }
export function DataTable<Row extends Record<string, unknown>>({ columns, rows, caption, rowKey = (_, index) => index, sort, defaultSort = null, onSortChange, locale = 'ar-SA', emptyMessage, getSortLabel, className, variant, size, wrapperProps, ...props }: DataTableProps<Row>) {
  const captionId = useId(); const empty = text('DataTable', 'emptyMessage', emptyMessage);
  const [sorting, setSort] = useControllable<DataTableSort | null>(sort, defaultSort, next => { if (next) onSortChange?.(next); }); const sorted = sorting ? sortRows(rows, sorting.key, sorting.direction, locale) : rows;
  return <div tabIndex={0} role="region" aria-labelledby={captionId} {...wrapperProps} className={cx('hw-table-wrap', wrapperProps?.className)}><table {...props} data-variant={variant ?? props['data-variant']} data-size={size ?? props['data-size']} className={cx('hw-table hw-data-table', className)}><caption id={captionId}>{caption}</caption><thead><tr>{columns.map(column => { const active = sorting?.key === column.key; const direction = active && sorting.direction === 'ascending' ? 'descending' : 'ascending'; return <th key={column.key} scope="col" aria-sort={column.sortable ? active ? sorting.direction : 'none' : undefined}>{column.sortable ? <Button variant="ghost" aria-label={getSortLabel?.(column, direction) || undefined} onClick={() => setSort({ key: column.key, direction })}>{column.label}<span className="hw-icon" data-size="sm" aria-hidden="true" data-icon={active ? sorting.direction === 'ascending' ? 'arrow-up-02' : 'arrow-down-02' : 'arrow-data-transfer-vertical'} /></Button> : column.label}</th>; })}</tr></thead><tbody>{sorted.length ? sorted.map((row, index) => <tr key={rowKey(row, index)}>{columns.map(column => { const content = column.render ? column.render(row[column.key], row) : String(row[column.key] ?? ''); return column.rowHeader ? <th key={column.key} scope="row">{content}</th> : <td key={column.key}>{content}</td>; })}</tr>) : <tr><td colSpan={columns.length || 1}>{empty}</td></tr>}</tbody></table></div>;
}
interface ServiceCardBaseProps extends Omit<CardProps, 'header' | 'footer' | 'title'> { title: ReactNode; description?: ReactNode; category?: ReactNode; metadata?: readonly DescriptionItem[]; icon?: ReactNode }
/** With `href` and no `action`, the card renders its own action link named by `actionLabel`. */
export type ServiceCardProps = ServiceCardBaseProps & ({ href?: undefined; action?: ReactNode; actionLabel?: string } | { href?: string; action: ReactNode; actionLabel?: string } | { href?: string; action?: ReactNode; actionLabel: string });
export function ServiceCard({ title, description, href, action, actionLabel, category, metadata, icon, children, className, ...props }: ServiceCardProps) { return <Card {...props} className={cx('hw-service-card', className)} header={<>{icon && <span aria-hidden="true">{icon}</span>}<div>{category && <Badge>{category}</Badge>}<h3>{title}</h3></div></>} footer={action ?? (href && <Link href={href}>{text('ServiceCard', 'actionLabel', actionLabel, 'href is given without action')}</Link>)}>{description && <p>{description}</p>}{metadata && <DescriptionList items={metadata} />}{children}</Card>; }
interface ServiceDetailsBaseProps extends Omit<ComponentPropsWithRef<'article'>, 'title'> { title: ReactNode; description?: ReactNode; metadata?: readonly DescriptionItem[]; action?: ReactNode }
/** `requirementsLabel` is the heading of the `requirements` list. */
export type ServiceDetailsProps = ServiceDetailsBaseProps & ({ requirements?: undefined; requirementsLabel?: string } | { requirements?: readonly ReactNode[]; requirementsLabel: string });
export function ServiceDetails({ title, description, metadata, requirements, requirementsLabel, action, children, className, ...props }: ServiceDetailsProps) { return <article {...props} className={cx('hw-service-details', className)}><header><h2>{title}</h2>{description && <p>{description}</p>}</header>{metadata && <DescriptionList items={metadata} />}{requirements && <section>{text('ServiceDetails', 'requirementsLabel', requirementsLabel, 'requirements are given') && <h3>{requirementsLabel}</h3>}<ul>{requirements.map((item, index) => <li key={index}>{item}</li>)}</ul></section>}{children}{action && <footer>{action}</footer>}</article>; }
export interface PortalNavLink { label: ReactNode; href: string; current?: boolean }
export interface PortalNavItem extends PortalNavLink { groups?: readonly { label?: string; links: readonly PortalNavLink[] }[] }
export interface PortalHeaderBaseProps extends ComponentPropsWithRef<'header'> {
  /** Application brand: text, artwork or both. Artwork alone takes its accessible name from `brandLabel`. */
  brand: ReactNode; brandHref?: string; brandLabel?: string;
  navigation?: readonly PortalNavItem[]; navigationLabel: string; menuLabel: string; navigationId?: string; actions?: ReactNode; notice?: ReactNode;
}
/** With `mainId` the header renders a skip link named by `skipLabel`. */
export type PortalHeaderProps = PortalHeaderBaseProps & ({ mainId?: undefined; skipLabel?: string } | { mainId?: string; skipLabel: string });
export function PortalHeader({ brand, brandHref, brandLabel, navigation, navigationLabel, menuLabel, navigationId, mainId, skipLabel, actions, notice, children, className, onKeyDown, onBlur, ...props }: PortalHeaderProps) {
  const copy = { navigation: text('PortalHeader', 'navigationLabel', navigationLabel), menu: text('PortalHeader', 'menuLabel', menuLabel), skip: mainId ? text('PortalHeader', 'skipLabel', skipLabel, 'mainId is set') : undefined };
  const skipLink = useFragmentLink(mainId); const brandRef = useBrandCheck('PortalHeader', brandLabel); const brandName = brandLabel?.trim() ? brandLabel : undefined;
  const id = useId(); const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null); const trigger = useRef<HTMLButtonElement>(null);
  const navId = navigationId ?? `${id}-navigation`;
  const [branch, setBranch] = useState<HTMLDetailsElement | null>(null);
  const closeNavigation = () => { setBranch(null); setOpen(false); };
  useEffect(() => {
    if (!open && !branch) return;
    const root = container.current;
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!branch?.contains(target)) setBranch(null);
      if (!root?.contains(target)) setOpen(false);
    };
    root?.ownerDocument.addEventListener('pointerdown', outside);
    return () => root?.ownerDocument.removeEventListener('pointerdown', outside);
  }, [open, branch]);
  const link = (item: PortalNavLink, overview = false) =>
    <Link href={item.href} className={overview ? 'hw-portal-branch-overview' : undefined} aria-current={item.current ? 'page' : undefined} onClick={closeNavigation}>{item.label}</Link>;
  return <header {...props} className={cx('hw-portal-header', className)} onKeyDown={event => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.key !== 'Escape') return;
    if (branch?.isConnected) {
      event.preventDefault(); event.stopPropagation(); setBranch(null);
      branch.querySelector<HTMLElement>(':scope > summary')?.focus();
    } else if (open) {
      event.preventDefault(); event.stopPropagation(); closeNavigation(); trigger.current?.focus();
    }
  }} onBlur={event => {
    onBlur?.(event);
    const target = event.relatedTarget ?? event.currentTarget.ownerDocument.activeElement;
    if (!branch?.contains(target as Node | null)) setBranch(null);
    if (!event.currentTarget.contains(target as Node | null)) setOpen(false);
  }}>
    {mainId && <a ref={skipLink.ref} className="hw-skip-link" href={skipLink.href}>{copy.skip}</a>}
    {notice && <div className="hw-portal-notice">{notice}</div>}
    <div ref={container} className="hw-portal-header-main">
      {brandHref ? <Link ref={brandRef as Ref<HTMLAnchorElement>} href={brandHref} className="hw-portal-brand" aria-label={brandName}>{brand}</Link> : <div ref={brandRef as Ref<HTMLDivElement>} className="hw-portal-brand" role={brandName ? 'img' : undefined} aria-label={brandName}>{brand}</div>}
      {!!navigation?.length && <><button ref={trigger} className="hw-button hw-portal-menu-toggle" type="button" aria-expanded={open} aria-controls={navId} onClick={() => { setBranch(null); setOpen(!open); }}><span className="hw-icon" data-icon={open ? 'cancel-01' : 'menu-01'} aria-hidden="true" />{copy.menu}</button>
        <nav id={navId} aria-label={copy.navigation} data-open={open}><ul>{navigation.map(item => {
          const groups = item.groups?.filter(group => group.links.length);
          if (!groups?.length) return <li key={item.href}>{link(item)}</li>;
          const childCurrent = groups.some(group => group.links.some(child => child.current));
          const current = item.current || childCurrent;
          return <li key={item.href}><details data-hw-portal-branch="" className="hw-portal-branch" data-current={current || undefined} open={Boolean(branch?.isConnected && branch.dataset.branchHref === item.href)} data-branch-href={item.href}>
            <summary onClick={event => {
              event.preventDefault();
              const details = event.currentTarget.parentElement as HTMLDetailsElement;
              setBranch(branch === details ? null : details);
            }}>{item.label}</summary>
            <div className="hw-portal-branch-panel">{link({...item, current: item.current && !childCurrent}, true)}
              {groups.map((group, i) => <section className="hw-portal-branch-group" key={i}>{group.label && <h2>{group.label}</h2>}
                <ul>{group.links.map(child => <li key={child.href}>{link(child)}</li>)}</ul>
              </section>)}
            </div>
          </details></li>;
        })}</ul></nav></>}
      {actions && <div className="hw-portal-actions">{actions}</div>}{children}
    </div>
  </header>;
}
export interface PortalFooterLink extends PortalNavLink { external?: boolean }
export interface PortalFooterGroup { title: string; links: readonly PortalFooterLink[] }
export interface PortalFooterBaseProps extends ComponentPropsWithRef<'footer'> {
  /** Application brand line: text, artwork or both. Artwork alone takes its accessible name from `brandLabel`. */
  brand?: ReactNode; brandLabel?: string; description?: ReactNode; legal?: ReactNode;
  groups?: readonly PortalFooterGroup[]; partners?: ReactNode;
  /** Screen-reader text added to links marked external. */
  externalLabel: string;
}
/** Each list or section is named by its own text: `navigationLabel` for `links`, `legalLinksLabel` for `legalLinks`, `supportLabel` for `support`. */
export type PortalFooterProps = PortalFooterContentProps & ({ links?: undefined; navigationLabel?: string } | { links?: readonly PortalFooterLink[]; navigationLabel: string });
/** Footer content without the name of the `links` list, for components that supply it under another name. */
export type PortalFooterContentProps = PortalFooterBaseProps & { links?: readonly PortalFooterLink[] }
  & ({ legalLinks?: undefined; legalLinksLabel?: string } | { legalLinks?: readonly PortalFooterLink[]; legalLinksLabel: string })
  & ({ support?: undefined; supportLabel?: string } | { support?: ReactNode; supportLabel: string });
export function PortalFooter({ brand, brandLabel, description, links, navigationLabel, legal, groups = [], legalLinks = [], legalLinksLabel, support, supportLabel, partners, externalLabel, children, className, ...props }: PortalFooterProps) {
  const copy = { navigation: links?.length ? text('PortalFooter', 'navigationLabel', navigationLabel, 'links are given') : undefined, legal: legalLinks.length ? text('PortalFooter', 'legalLinksLabel', legalLinksLabel, 'legalLinks are given') : undefined, support: support ? text('PortalFooter', 'supportLabel', supportLabel, 'support content is given') : undefined, external: text('PortalFooter', 'externalLabel', externalLabel) };
  const brandRef = useBrandCheck('PortalFooter', brandLabel); const brandName = brandLabel?.trim() ? brandLabel : undefined;
  const linkList = (items: readonly PortalFooterLink[]) => <ul className="hw-portal-footer-links">{items.map((item, index) => <li key={index}><Link href={item.href} external={item.external}>{item.label}{item.external && <><span className="hw-portal-footer-external hw-icon" data-icon="link-square-02" data-size="sm" aria-hidden="true" />{copy.external && <span className="hw-sr-only"> {copy.external}</span>}</>}</Link></li>)}</ul>;
  return <footer {...props} className={cx('hw-portal-footer', className)}>
    <div className="hw-portal-footer-main">
      {(brand || description) && <div className="hw-portal-footer-brand">{brand && <div ref={brandRef as Ref<HTMLDivElement>} className="hw-portal-footer-brand-marks" role={brandName ? 'img' : undefined} aria-label={brandName}>{brand}</div>}{description && <p>{description}</p>}</div>}
      {!!links?.length && <nav className="hw-portal-footer-group" aria-label={copy.navigation}>{copy.navigation && <h2>{copy.navigation}</h2>}{linkList(links)}</nav>}
      {groups.map((group, index) => group.links.length > 0 && <nav className="hw-portal-footer-group" aria-label={group.title} key={index}><h2>{group.title}</h2>{linkList(group.links)}</nav>)}
      {support && <section className="hw-portal-footer-support" aria-label={copy.support}>{copy.support && <h2>{copy.support}</h2>}<div className="hw-portal-footer-support-content">{support}</div></section>}
      {children && <div className="hw-portal-footer-extra">{children}</div>}
    </div>
    {(legal || legalLinks.length > 0 || partners) && <div className="hw-portal-footer-bottom">{legal && <small>{legal}</small>}{legalLinks.length > 0 && <nav className="hw-portal-footer-legal" aria-label={copy.legal}>{linkList(legalLinks)}</nav>}{partners && <div className="hw-portal-footer-partners">{partners}</div>}</div>}
  </footer>;
}
export interface FeedbackValue { helpful: 'yes' | 'no' | ''; comment: string }
export interface FeedbackProps extends Omit<ComponentPropsWithRef<'form'>, 'onSubmit' | 'onChange' | 'defaultValue'> { label: ReactNode; value?: FeedbackValue; defaultValue?: FeedbackValue; onValueChange?: (value: FeedbackValue) => void; onFeedback?: (value: FeedbackValue) => void; yesLabel: string; noLabel: string; commentLabel: string; submitLabel: string; successMessage: ReactNode; disabled?: boolean; choiceVariant?: 'text' | 'icon' | 'icon-text' }
export function Feedback({ label, value, defaultValue = { helpful: '', comment: '' }, onValueChange, onFeedback, yesLabel, noLabel, commentLabel, submitLabel, successMessage, choiceVariant = 'text', disabled, className, onReset, ...props }: FeedbackProps) {
  const id = useId(); const [current, setCurrent] = useControllable(value, defaultValue, onValueChange); const [sent, setSent] = useState(false);
  const copy = { yes: text('Feedback', 'yesLabel', yesLabel), no: text('Feedback', 'noLabel', noLabel), comment: text('Feedback', 'commentLabel', commentLabel), submit: text('Feedback', 'submitLabel', submitLabel), success: text('Feedback', 'successMessage', successMessage) };
  return <form {...props} className={cx('hw-feedback', className)} data-choice-variant={choiceVariant} onReset={event => { onReset?.(event); const native = event.nativeEvent; queueMicrotask(() => { if (!native.defaultPrevented) { if (value === undefined) setCurrent(defaultValue); setSent(false); } }); }} onSubmit={event => { event.preventDefault(); if (disabled || !current.helpful) return; onFeedback?.(current); setSent(true); }}><fieldset disabled={disabled}><legend>{label}</legend><div className="hw-feedback-actions"><Radio name={`${id}-helpful`} label={<><span className="hw-icon hw-feedback-icon" data-icon="thumbs-up" aria-hidden="true" /><span className="hw-feedback-label">{copy.yes}</span></>} value="yes" checked={current.helpful === 'yes'} required onChange={() => { setCurrent({ ...current, helpful: 'yes' }); setSent(false); }} /><Radio name={`${id}-helpful`} label={<><span className="hw-icon hw-feedback-icon" data-icon="thumbs-down" aria-hidden="true" /><span className="hw-feedback-label">{copy.no}</span></>} value="no" checked={current.helpful === 'no'} onChange={() => { setCurrent({ ...current, helpful: 'no' }); setSent(false); }} /></div><Textarea label={copy.comment} name="comment" value={current.comment} onChange={event => { setCurrent({ ...current, comment: event.currentTarget.value }); setSent(false); }} /><Button type="submit" disabled={disabled || !current.helpful}>{copy.submit}</Button></fieldset><div role="status">{sent ? copy.success : null}</div></form>;
}
export type CookieChoice = 'accepted' | 'rejected' | null;
interface CookieConsentBaseProps extends Omit<ComponentPropsWithRef<'section'>, 'onChange' | 'defaultValue' | 'title'> { title: ReactNode; description: ReactNode; value?: CookieChoice; defaultValue?: CookieChoice; onValueChange?: (value: Exclude<CookieChoice, null>) => void; acceptLabel: string; rejectLabel: string }
/** `policyLabel` is the text of the policy link rendered with `policyHref`. */
export type CookieConsentProps = CookieConsentBaseProps & ({ policyHref?: undefined; policyLabel?: string } | { policyHref?: string; policyLabel: string });
export function CookieConsent({ title, description, value, defaultValue = null, onValueChange, acceptLabel, rejectLabel, policyHref, policyLabel, className, ...props }: CookieConsentProps) {
  const id = useId(); const [choice, setChoice] = useControllable<CookieChoice>(value, defaultValue, next => { if (next) onValueChange?.(next); });
  return <section {...props} hidden={choice !== null} className={cx('hw-cookie-consent', className)} aria-labelledby={`${id}-title`}><h2 id={`${id}-title`}>{title}</h2><p>{description}</p>{policyHref && <Link href={policyHref}>{text('CookieConsent', 'policyLabel', policyLabel, 'policyHref is set')}</Link>}<div className="hw-inline"><Button variant="secondary" onClick={() => setChoice('rejected')}>{text('CookieConsent', 'rejectLabel', rejectLabel)}</Button><Button onClick={() => setChoice('accepted')}>{text('CookieConsent', 'acceptLabel', acceptLabel)}</Button></div></section>;
}
export interface NotificationItem { id: string; title: ReactNode; description?: ReactNode; href?: string; dateTime?: string; dateLabel?: ReactNode; read?: boolean }
interface NotificationListBaseProps extends ComponentPropsWithRef<'section'> { items: readonly NotificationItem[]; label: ReactNode; emptyMessage: ReactNode; unreadLabel: string }
/** `getMarkReadLabel(item)` is the text of the mark-read button rendered with `onMarkRead`. */
export type NotificationListProps = NotificationListBaseProps & ({ onMarkRead?: undefined; getMarkReadLabel?: (item: NotificationItem) => string } | { onMarkRead?: (id: string) => void; getMarkReadLabel: (item: NotificationItem) => string });
export function NotificationList({ items, label, emptyMessage, onMarkRead, getMarkReadLabel, unreadLabel, className, ...props }: NotificationListProps) { const id = useId(); const copy = { empty: text('NotificationList', 'emptyMessage', emptyMessage), unread: text('NotificationList', 'unreadLabel', unreadLabel), markRead: onMarkRead ? text('NotificationList', 'getMarkReadLabel', getMarkReadLabel, 'onMarkRead is given') : undefined }; return <section {...props} className={cx('hw-notification-list', className)} aria-labelledby={`${id}-title`}><h2 id={`${id}-title`}>{label}</h2>{items.length ? <ul>{items.map(item => <li key={item.id} data-state={item.read ? 'read' : 'unread'}><h3>{item.href ? <Link href={item.href}>{item.title}</Link> : item.title}</h3>{!item.read && copy.unread && <Badge tone="info">{copy.unread}</Badge>}{item.description && <p>{item.description}</p>}{item.dateLabel && <time dateTime={item.dateTime}>{item.dateLabel}</time>}{!item.read && onMarkRead && <Button variant="ghost" onClick={() => onMarkRead(item.id)}>{copy.markRead?.(item)}</Button>}</li>)}</ul> : <p>{copy.empty}</p>}</section>; }
