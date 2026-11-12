import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { ComponentPropsWithRef, Key, ReactNode, HTMLAttributes, Ref } from 'react';
import { getPortalBranchSummary, hasText, prepareRemovalFocus, sortRows } from '@hawiyah/core';
import type { ConsentChoice, FeedbackValue } from '@hawiyah/core';
import { Button, Textarea } from './forms.js';
import type { ButtonProps } from './forms.js';
import { Avatar, Badge, Card } from './display.js';
import type { AvatarProps, CardProps } from './display.js';
import { assignRef, cx, rootLabel, text, useBrandCheck, useControllable, useFragmentLink } from './shared.js';
import type { FieldName, RootName } from './shared.js';

export interface LinkProps extends ComponentPropsWithRef<'a'> { external?: boolean; disabled?: boolean; variant?: 'default' | 'subtle' | 'neutral' | 'standalone'; 'data-variant'?: string }
export function Link({ external, disabled=false, variant, 'data-variant': dataVariant, className, target, rel, href, tabIndex, onClick, onAuxClick, ...props }: LinkProps) {
  const unavailable=disabled || props['aria-disabled']===true || props['aria-disabled']==='true';
  return <a {...props} className={cx('hw-link', className)} data-variant={variant ?? dataVariant} href={unavailable ? undefined : href} role={unavailable ? 'link' : props.role} aria-disabled={unavailable || undefined} tabIndex={unavailable ? -1 : tabIndex} target={external ? '_blank' : target} rel={external ? [rel, 'noopener', 'noreferrer'].filter(Boolean).join(' ') : rel} onClick={event=>{if(unavailable){event.preventDefault();event.stopPropagation();}else onClick?.(event);}} onAuxClick={event=>{if(unavailable){event.preventDefault();event.stopPropagation();}else onAuxClick?.(event);}} />;
}
export interface IconButtonProps extends ButtonProps { label: string; shape?: 'square' | 'circle'; 'data-shape'?: string }
export function IconButton({ label, shape, variant = 'ghost', className, children, ...props }: IconButtonProps) { return <Button {...props} variant={variant} data-shape={shape ?? props['data-shape']} aria-label={label} className={cx('hw-icon-button', className)}><span aria-hidden="true">{children}</span></Button>; }
export type ButtonGroupProps = ComponentPropsWithRef<'div'> & { variant?: 'default' | 'attached'; orientation?: 'horizontal' | 'vertical'; 'data-variant'?: string; 'data-orientation'?: string } & RootName;
export function ButtonGroup({ label, variant, orientation, className, ...props }: ButtonGroupProps) { return <div {...props} data-variant={variant ?? props['data-variant']} data-orientation={orientation ?? props['data-orientation']} role="group" aria-label={rootLabel('ButtonGroup', props, label)} className={cx('hw-button-group', className)} />; }
interface ChipBaseProps extends ComponentPropsWithRef<'span'> { disabled?: boolean; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info'; variant?: 'soft' | 'outline'; size?: 'sm' | 'lg' }
/** `removeLabel` names the remove button rendered with `onRemove`. */
export type ChipProps = ChipBaseProps & ({ onRemove?: undefined; removeLabel?: string } | { onRemove?: () => void; removeLabel: string });
/** Removing a chip whose button has focus moves focus to the next (else previous) chip's button; with no chip left the application places it. */
export function Chip({ onRemove, removeLabel, disabled, tone = 'neutral', variant, size, children, className, ...props }: ChipProps) {
  const pending = useRef<(() => void) | undefined>(undefined);
  // The cleanup runs before React detaches the node, hence the microtask.
  useLayoutEffect(() => () => { const run = pending.current; if (run) queueMicrotask(run); }, []);
  const data = props as Record<string, unknown>;
  return <span {...props} className={cx('hw-chip', className)} data-tone={tone} data-variant={variant ?? data['data-variant']} data-size={size ?? data['data-size']}>{children}{onRemove && <button type="button" disabled={disabled} aria-label={text('Chip', 'removeLabel', removeLabel, 'onRemove is given')} onClick={event => { const chip = event.currentTarget.parentElement!; pending.current = chip.parentElement ? prepareRemovalFocus(chip.parentElement, event.currentTarget, { item: ':scope > .hw-chip', control: ':scope > button' }) : undefined; onRemove(); }}><span className="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true" /></button>}</span>;
}
export interface DescriptionItem { term: ReactNode; description: ReactNode; key?: Key }
/** `variant` stacked (default) | horizontal | compact. */
export interface DescriptionListProps extends ComponentPropsWithRef<'dl'> { items: readonly DescriptionItem[]; variant?: 'stacked' | 'horizontal' | 'compact' }
export function DescriptionList({ items, variant, className, ...props }: DescriptionListProps) { return <dl {...props} data-variant={variant ?? (props as Record<string, unknown>)['data-variant']} className={cx('hw-description-list', className)}>{items.map((item, index) => <div key={item.key ?? index}><dt>{item.term}</dt><dd>{item.description}</dd></div>)}</dl>; }
/** `value` and `trend` accept rich content, such as the riyal pattern of docs/saudi-riyal.md. */
export interface StatProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> { label: ReactNode; value: ReactNode; description?: ReactNode; trend?: ReactNode; tone?: 'neutral' | 'success' | 'danger'; variant?: 'plain'; trendTone?: 'success' | 'danger' }
export function Stat({ label, value, description, trend, tone, variant, trendTone, children, className, ...props }: StatProps) { const data = props as Record<string, unknown>; return <div {...props} data-tone={tone ?? data['data-tone']} data-variant={variant ?? data['data-variant']} className={cx('hw-stat', className)}><span className="hw-stat-label">{label}</span><strong className="hw-stat-value">{value}</strong>{description && <p className="hw-stat-description">{description}</p>}{trend && <span className="hw-stat-trend" data-tone={trendTone}>{trend}</span>}{children}</div>; }
export interface TimelineItem { id: string; title: ReactNode; description?: ReactNode; dateTime?: string; dateLabel?: ReactNode; status?: 'complete' | 'current' | 'upcoming' }
export type TimelineProps = ComponentPropsWithRef<'ol'> & { items: readonly TimelineItem[] } & RootName;
export function Timeline({ items, label, className, ...props }: TimelineProps) { return <ol {...props} className={cx('hw-timeline', className)} aria-label={rootLabel('Timeline', props, label)}>{items.map(item => <li key={item.id} className="hw-timeline-item" data-state={item.status} aria-current={item.status === 'current' ? 'step' : undefined}><h3>{item.title}</h3>{item.dateLabel && <time dateTime={item.dateTime}>{item.dateLabel}</time>}{item.description && <p>{item.description}</p>}</li>)}</ol>; }
/** A native meter named by `label` (or aria-label / aria-labelledby); min 0, max 100, value 0 and no regions unless given. */
export type MeterProps = ComponentPropsWithRef<'meter'> & RootName;
export function Meter({ label, className, min = 0, max = 100, value = 0, ...props }: MeterProps) { return <meter {...props} min={min} max={max} value={value} aria-label={rootLabel('Meter', props, label)} className={cx('hw-meter', className)} />; }
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
/** Without `cell` a column shows the row's value under `key` as text. */
export interface DataTableColumn<Row> { key: keyof Row & string; label: ReactNode; sortable?: boolean; cell?: (row: Row, index: number) => ReactNode; rowHeader?: boolean }
/** The sort is two states: `sortKey` ('' = unsorted) and `sortDirection`, each controlled or uncontrolled. */
export interface DataTableProps<Row extends Record<string, unknown>> extends Omit<ComponentPropsWithRef<'table'>, 'children' | 'onChange'> { variant?: 'default' | 'striped' | 'bordered'; size?: 'sm' | 'md' | 'lg'; 'data-variant'?: string; 'data-size'?: string; wrapperProps?: HTMLAttributes<HTMLDivElement>; columns: readonly DataTableColumn<Row>[]; rows: readonly Row[]; caption: ReactNode; rowKey?: (row: Row, index: number) => Key; sortKey?: string; defaultSortKey?: string; onSortKeyChange?: (key: string) => void; sortDirection?: 'ascending' | 'descending'; defaultSortDirection?: 'ascending' | 'descending'; onSortDirectionChange?: (direction: 'ascending' | 'descending') => void; /** BCP 47 tag used to collate text when a column is sorted. Required; there is no default. */ locale: string; emptyMessage: ReactNode; getSortLabel?: (column: DataTableColumn<Row>, direction: 'ascending' | 'descending') => string }
export function DataTable<Row extends Record<string, unknown>>({ columns, rows, caption, rowKey = (_, index) => index, sortKey, defaultSortKey, onSortKeyChange, sortDirection, defaultSortDirection, onSortDirectionChange, locale, emptyMessage, getSortLabel, className, variant, size, wrapperProps, ...props }: DataTableProps<Row>) {
  const captionId = useId(); const empty = text('DataTable', 'emptyMessage', emptyMessage); const collation = text('DataTable', 'locale', locale);
  const [key, setKey] = useControllable(sortKey, defaultSortKey ?? '', onSortKeyChange); const [direction, setDirection] = useControllable(sortDirection, defaultSortDirection ?? 'ascending', onSortDirectionChange); const sorted = key && collation ? sortRows(rows, key, direction, collation) : rows;
  return <div tabIndex={0} role="region" aria-labelledby={captionId} {...wrapperProps} className={cx('hw-table-wrap hw-data-table', wrapperProps?.className)}><table {...props} data-variant={variant ?? props['data-variant']} data-size={size ?? props['data-size']} className={cx('hw-table', className)}><caption id={captionId}>{caption}</caption><thead><tr>{columns.map(column => { const active = key === column.key; const next = active && direction === 'ascending' ? 'descending' : 'ascending'; return <th key={column.key} scope="col" aria-sort={column.sortable ? active ? direction : 'none' : undefined}>{column.sortable ? <Button variant="ghost" aria-label={getSortLabel?.(column, next) || undefined} onClick={() => { setKey(column.key); setDirection(next); }}>{column.label}<span className="hw-icon" data-size="sm" aria-hidden="true" data-icon={active ? direction === 'ascending' ? 'arrow-up-02' : 'arrow-down-02' : 'arrow-data-transfer-vertical'} /></Button> : column.label}</th>; })}</tr></thead><tbody>{sorted.length ? sorted.map((row, index) => <tr key={rowKey(row, index)}>{columns.map(column => { const content = column.cell ? column.cell(row, index) : String(row[column.key] ?? ''); return column.rowHeader ? <th key={column.key} scope="row">{content}</th> : <td key={column.key}>{content}</td>; })}</tr>) : <tr><td colSpan={columns.length || 1}>{empty}</td></tr>}</tbody></table></div>;
}
interface ServiceCardBaseProps extends Omit<CardProps, 'header' | 'footer' | 'title'> { title: ReactNode; description?: ReactNode; category?: ReactNode; metadata?: readonly DescriptionItem[]; icon?: ReactNode }
/** With `href` and no `action`, the card renders its own action link named by `actionLabel`. */
export type ServiceCardProps = ServiceCardBaseProps & ({ href?: undefined; action?: ReactNode; actionLabel?: string } | { href?: string; action: ReactNode; actionLabel?: string } | { href?: string; action?: ReactNode; actionLabel: string });
export function ServiceCard({ title, description, href, action, actionLabel, category, metadata, icon, children, className, ...props }: ServiceCardProps) { return <Card {...props} className={cx('hw-service-card', className)} header={<>{icon && <div className="hw-service-card-icon" aria-hidden="true">{icon}</div>}<div>{category && <Badge>{category}</Badge>}<h3>{title}</h3></div></>} footer={action ?? (href && <Link href={href}>{text('ServiceCard', 'actionLabel', actionLabel, 'href is given without action')}</Link>)}>{description && <p>{description}</p>}{!!metadata?.length && <DescriptionList items={metadata} />}{children}</Card>; }
interface ServiceDetailsBaseProps extends Omit<ComponentPropsWithRef<'article'>, 'title'> { title: ReactNode; description?: ReactNode; metadata?: readonly DescriptionItem[]; action?: ReactNode }
/** `requirementsLabel` is the heading of the `requirements` list. */
export type ServiceDetailsProps = ServiceDetailsBaseProps & ({ requirements?: undefined; requirementsLabel?: string } | { requirements?: readonly ReactNode[]; requirementsLabel: string });
export function ServiceDetails({ title, description, metadata, requirements, requirementsLabel, action, children, className, ...props }: ServiceDetailsProps) { return <article {...props} className={cx('hw-service-details', className)}><header><h2>{title}</h2>{description && <p>{description}</p>}</header>{!!metadata?.length && <DescriptionList items={metadata} />}{!!requirements?.length && <section>{text('ServiceDetails', 'requirementsLabel', requirementsLabel, 'requirements are given') && <h3>{requirementsLabel}</h3>}<ul>{requirements.map((item, index) => <li key={index}>{item}</li>)}</ul></section>}{children}{action && <footer>{action}</footer>}</article>; }
export interface PortalNavLink { label: ReactNode; href: string; current?: boolean }
export interface PortalNavItem extends PortalNavLink { groups?: readonly { label?: string; links: readonly PortalNavLink[] }[] }
export interface PortalHeaderBaseProps extends ComponentPropsWithRef<'header'> {
  /** Application brand: text, artwork or both. Artwork alone takes its accessible name from `brandLabel`. */
  /** `homeHref` is the brand's home link (default '/'); an empty string renders the brand as a div. */
  brand: ReactNode; homeHref?: string; brandLabel?: string;
  links?: readonly PortalNavItem[]; navigationLabel: string; menuLabel: string; navigationId?: string; actions?: ReactNode; notice?: ReactNode;
  /** The disclosure of the navigation below 48rem. */
  open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void;
}
/** With `mainId` the header renders a skip link named by `skipLabel`. */
export type PortalHeaderProps = PortalHeaderBaseProps & ({ mainId?: undefined; skipLabel?: string } | { mainId?: string; skipLabel: string });
export function PortalHeader({ brand, homeHref = '/', brandLabel, links, navigationLabel, menuLabel, navigationId, mainId, skipLabel, actions, notice, open: controlled, defaultOpen = false, onOpenChange, children, className, onKeyDown, onBlur, ref, ...props }: PortalHeaderProps) {
  const copy = { navigation: text('PortalHeader', 'navigationLabel', navigationLabel), menu: text('PortalHeader', 'menuLabel', menuLabel), skip: mainId ? text('PortalHeader', 'skipLabel', skipLabel, 'mainId is set') : undefined };
  const skipLink = useFragmentLink(mainId); const brandRef = useBrandCheck('PortalHeader', brandLabel); const brandName = brandLabel?.trim() ? brandLabel : undefined;
  const id = useId(); const [open, setOpen] = useControllable(controlled, defaultOpen, onOpenChange);
  const container = useRef<HTMLElement | null>(null); const pressed = useRef<HTMLElement | null>(null); const trigger = useRef<HTMLButtonElement>(null);
  const navId = navigationId ?? `${id}-navigation`;
  const [branch, setBranch] = useState<HTMLDetailsElement | null>(null);
  const closeNavigation = () => { setBranch(null); setOpen(false); };
  useEffect(() => {
    if (!open && !branch) return;
    const root = container.current;
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      pressed.current = getPortalBranchSummary(event.target, root);
      if (!pressed.current && !branch?.contains(target)) setBranch(null);
      if (!root?.contains(target)) setOpen(false);
    };
    const cancel = () => { pressed.current = null; };
    root?.ownerDocument.addEventListener('pointerdown', outside); root?.ownerDocument.addEventListener('pointercancel', cancel);
    return () => { root?.ownerDocument.removeEventListener('pointerdown', outside); root?.ownerDocument.removeEventListener('pointercancel', cancel); };
  }, [open, branch]);
  const link = (item: PortalNavLink, overview = false) =>
    <Link href={item.href} className={overview ? 'hw-portal-branch-overview' : undefined} aria-current={item.current ? 'page' : undefined} onClick={closeNavigation}>{item.label}</Link>;
  return <header {...props} ref={node => { container.current = node; assignRef(ref, node); }} className={cx('hw-portal-header', className)} onKeyDown={event => {
    onKeyDown?.(event);
    pressed.current = null;
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
    if (!pressed.current?.contains(target as Node | null) && !branch?.contains(target as Node | null)) setBranch(null);
    if (!event.currentTarget.contains(target as Node | null)) setOpen(false);
  }}>
    {mainId && <a ref={skipLink.ref} className="hw-skip-link" href={skipLink.href}>{copy.skip}</a>}
    {notice && <div className="hw-portal-notice">{notice}</div>}
    {homeHref ? <Link ref={brandRef as Ref<HTMLAnchorElement>} href={homeHref} className="hw-portal-brand" aria-label={brandName}>{brand}</Link> : <div ref={brandRef as Ref<HTMLDivElement>} className="hw-portal-brand" role={brandName ? 'img' : undefined} aria-label={brandName}>{brand}</div>}
    {!!links?.length && <><button ref={trigger} className="hw-button hw-portal-menu-toggle" type="button" aria-expanded={open} aria-controls={navId} onClick={() => { setBranch(null); setOpen(!open); }}><span className="hw-icon" data-icon={open ? 'cancel-01' : 'menu-01'} aria-hidden="true" />{copy.menu}</button>
        <nav id={navId} aria-label={copy.navigation} data-open={open}><ul>{links.map(item => {
          const groups = item.groups?.filter(group => group.links.length);
          if (!groups?.length) return <li key={item.href}>{link(item)}</li>;
          const childCurrent = groups.some(group => group.links.some(child => child.current));
          const current = item.current || childCurrent;
          return <li key={item.href}><details data-hw-portal-branch="" className="hw-portal-branch" data-current={current || undefined} open={Boolean(branch?.isConnected && branch.dataset.branchHref === item.href)} data-branch-href={item.href}>
            <summary onClick={event => {
              event.preventDefault();
              const details = event.currentTarget.parentElement as HTMLDetailsElement;
              setBranch(branch === details ? null : details);
              pressed.current = null;
            }}>{item.label}</summary>
            <div className="hw-portal-branch-panel">{link({...item, current: item.current && !childCurrent}, true)}
              {groups.map((group, i) => <section className="hw-portal-branch-group" key={i}>{group.label && <h2>{group.label}</h2>}
                <ul>{group.links.map(child => <li key={child.href}>{link(child)}</li>)}</ul>
              </section>)}
            </div>
          </details></li>;
        })}</ul></nav></>}
    {actions && <div className="hw-portal-header-actions">{actions}</div>}{children}
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
      {(brand || description) && <div className="hw-portal-footer-brand">{brand && <div ref={brandRef as Ref<HTMLDivElement>} className="hw-portal-footer-brand-marks" role={brandName ? 'group' : undefined} aria-label={brandName}>{brand}</div>}{description && <p>{description}</p>}</div>}
      {!!links?.length && <nav className="hw-portal-footer-group" aria-label={copy.navigation}>{copy.navigation && <h2>{copy.navigation}</h2>}{linkList(links)}</nav>}
      {groups.map((group, index) => group.links.length > 0 && <nav className="hw-portal-footer-group" aria-label={group.title} key={index}><h2>{group.title}</h2>{linkList(group.links)}</nav>)}
      {support && <section className="hw-portal-footer-support" aria-label={copy.support}>{copy.support && <h2>{copy.support}</h2>}<div className="hw-portal-footer-support-content">{support}</div></section>}
      {children && <div className="hw-portal-footer-extra">{children}</div>}
    </div>
    {(legal || legalLinks.length > 0 || partners) && <div className="hw-portal-footer-bottom">{legal && <small>{legal}</small>}{legalLinks.length > 0 && <nav className="hw-portal-footer-legal" aria-label={copy.legal}>{linkList(legalLinks)}</nav>}{partners && <div className="hw-portal-footer-partners">{partners}</div>}</div>}
  </footer>;
}
export type { FeedbackValue, ConsentChoice } from '@hawiyah/core';
interface FeedbackBaseProps extends Omit<ComponentPropsWithRef<'div'>, 'onChange' | 'defaultValue'> { value?: FeedbackValue; defaultValue?: FeedbackValue; onValueChange?: (value: FeedbackValue) => void; onFeedback?: (value: FeedbackValue) => void; yesLabel: string; noLabel: string; commentLabel: string; submitLabel: string; successMessage: ReactNode; disabled?: boolean; choiceVariant?: 'text' | 'icon' | 'icon-text' }
/** `label` is the visible question that names the group (or pass aria-label / aria-labelledby). The comment step appears after the first choice; submit reports `onFeedback(value)`. */
export type FeedbackProps = FeedbackBaseProps & FieldName;
const noFeedback: FeedbackValue = { helpful: null, comment: '' };
export function Feedback({ label, value, defaultValue = noFeedback, onValueChange, onFeedback, yesLabel, noLabel, commentLabel, submitLabel, successMessage, choiceVariant = 'text', disabled, children, className, ...props }: FeedbackProps) {
  const id = useId(); const [current, setCurrent] = useControllable(value, defaultValue, onValueChange); const [sent, setSent] = useState(false);
  const named = hasText(props['aria-label']) || hasText(props['aria-labelledby']);
  const question = named ? (hasText(label) ? label : undefined) : text('Feedback', 'label', label);
  const copy = { yes: text('Feedback', 'yesLabel', yesLabel), no: text('Feedback', 'noLabel', noLabel), comment: text('Feedback', 'commentLabel', commentLabel), submit: text('Feedback', 'submitLabel', submitLabel), success: text('Feedback', 'successMessage', successMessage) };
  const change = (next: FeedbackValue) => { setSent(false); setCurrent(next); };
  const choose = (helpful: boolean) => { if (disabled || current.helpful === helpful) return; change({ ...current, helpful }); };
  const choice = (helpful: boolean) => <Button variant="secondary" disabled={disabled} aria-pressed={current.helpful === helpful} onClick={() => choose(helpful)}><span className="hw-icon hw-feedback-icon" data-icon={helpful ? 'thumbs-up' : 'thumbs-down'} aria-hidden="true" /><span className="hw-feedback-label">{helpful ? copy.yes : copy.no}</span></Button>;
  return <div {...props} role="group" className={cx('hw-feedback', className)} data-choice-variant={choiceVariant} aria-labelledby={props['aria-labelledby'] ?? (question && !hasText(props['aria-label']) ? `${id}-label` : undefined)}>
    {question && <p id={`${id}-label`}>{question}</p>}
    <div className="hw-feedback-actions">{choice(true)}{choice(false)}</div>
    {current.helpful !== null && <div className="hw-feedback-comment"><Textarea label={copy.comment} value={current.comment} disabled={disabled} onChange={event => change({ ...current, comment: event.currentTarget.value })} /><Button disabled={disabled} onClick={() => { if (disabled) return; onFeedback?.(current); setSent(true); }}>{copy.submit}</Button></div>}
    <p role="status">{sent ? copy.success : null}</p>{children}
  </div>;
}
interface CookieConsentBaseProps extends Omit<ComponentPropsWithRef<'section'>, 'title'> { title: ReactNode; description: ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; onConsent?: (choice: ConsentChoice) => void; acceptLabel: string; rejectLabel: string; variant?: 'banner' }
/** `policyLabel` is the text of the policy link rendered with `policyHref`; `preferencesLabel` is the text of the button rendered with `onPreferences`. */
export type CookieConsentProps = CookieConsentBaseProps & ({ policyHref?: undefined; policyLabel?: string } | { policyHref?: string; policyLabel: string }) & ({ onPreferences?: undefined; preferencesLabel?: string } | { onPreferences: () => void; preferencesLabel: string });
/** Accept or Reject reports `onConsent(choice)` and closes; nothing is stored. The application places focus after it closes. */
export function CookieConsent({ title, description, open: openProp, defaultOpen = true, onOpenChange, onConsent, acceptLabel, rejectLabel, policyHref, policyLabel, onPreferences, preferencesLabel, variant, children, className, ...props }: CookieConsentProps) {
  const id = useId(); const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange); const heading = text('CookieConsent', 'title', title);
  const choose = (choice: ConsentChoice) => { onConsent?.(choice); setOpen(false); };
  return <section {...props} hidden={!open} data-variant={variant ?? (props as Record<string, unknown>)['data-variant']} className={cx('hw-cookie-consent', className)} aria-labelledby={props['aria-labelledby'] ?? (heading && !hasText(props['aria-label']) ? `${id}-title` : undefined)}>{heading && <h2 id={`${id}-title`}>{heading}</h2>}{hasText(description) ? <p>{description}</p> : text('CookieConsent', 'description', description)}{policyHref && <Link href={policyHref}>{text('CookieConsent', 'policyLabel', policyLabel, 'policyHref is set')}</Link>}{children}<div className="hw-button-group"><Button onClick={() => choose('accepted')}>{text('CookieConsent', 'acceptLabel', acceptLabel)}</Button><Button variant="secondary" onClick={() => choose('rejected')}>{text('CookieConsent', 'rejectLabel', rejectLabel)}</Button>{onPreferences && <Button variant="ghost" onClick={onPreferences}>{text('CookieConsent', 'preferencesLabel', preferencesLabel, 'onPreferences is given')}</Button>}</div></section>;
}
export interface NotificationItem { id: string; title: ReactNode; description?: ReactNode; href?: string; dateTime?: string; dateLabel?: ReactNode; read?: boolean }
interface NotificationListBaseProps extends ComponentPropsWithRef<'section'> { items: readonly NotificationItem[]; emptyMessage: ReactNode; unreadLabel: string }
/** `label` is the visible heading (or pass aria-label / aria-labelledby). `getMarkReadLabel(item)` is the text of the mark-read button rendered with `onRead`; `getDismissLabel(item)` names the dismiss button rendered with `onDismiss`. */
export type NotificationListProps = NotificationListBaseProps & FieldName
  & ({ onRead?: undefined; getMarkReadLabel?: (item: NotificationItem) => string } | { onRead: (id: string) => void; getMarkReadLabel: (item: NotificationItem) => string })
  & ({ onDismiss?: undefined; getDismissLabel?: (item: NotificationItem) => string } | { onDismiss: (id: string) => void; getDismissLabel: (item: NotificationItem) => string });
/** After an action, focus moves to the same control of the next item, else the previous one, else the list. */
export function NotificationList({ items, label, emptyMessage, onRead, getMarkReadLabel, onDismiss, getDismissLabel, unreadLabel, className, ref, ...props }: NotificationListProps) {
  const id = useId(); const named = hasText(props['aria-label']) || hasText(props['aria-labelledby']);
  const heading = named ? (hasText(label) ? label : undefined) : text('NotificationList', 'label', label);
  const copy = { empty: text('NotificationList', 'emptyMessage', emptyMessage), unread: text('NotificationList', 'unreadLabel', unreadLabel), markRead: onRead ? text('NotificationList', 'getMarkReadLabel', getMarkReadLabel, 'onRead is given') : undefined, dismiss: onDismiss ? text('NotificationList', 'getDismissLabel', getDismissLabel, 'onDismiss is given') : undefined };
  const region = useRef<HTMLElement | null>(null); const pending = useRef<(() => void) | undefined>(undefined); const [request, setRequest] = useState(0);
  useLayoutEffect(() => { pending.current?.(); pending.current = undefined; }, [request]);
  const act = (notify: (id: string) => void, control: string) => (event: React.MouseEvent<HTMLButtonElement>, itemId: string) => {
    if (region.current) pending.current = prepareRemovalFocus(region.current, event.currentTarget, { item: ':scope > ul > li', control, fallback: region.current });
    try { notify(itemId); } finally { setRequest(value => value + 1); }
  };
  const read = onRead && act(onRead, '[data-hw-mark-read]'); const dismiss = onDismiss && act(onDismiss, '[data-hw-dismiss]');
  return <section {...props} ref={node => { region.current = node; assignRef(ref, node); }} tabIndex={props.tabIndex ?? (onRead || onDismiss ? -1 : undefined)} className={cx('hw-notification-list', className)} aria-labelledby={props['aria-labelledby'] ?? (heading && !hasText(props['aria-label']) ? `${id}-title` : undefined)}>{heading && <h2 id={`${id}-title`}>{heading}</h2>}{items.length ? <ul>{items.map(item => { const markRead = !item.read && read ? copy.markRead?.(item) : undefined; return <li key={item.id} data-state={item.read ? 'read' : 'unread'}><h3>{item.href ? <Link href={item.href}>{item.title}</Link> : item.title}</h3>{!item.read && copy.unread && <Badge tone="info">{copy.unread}</Badge>}{item.description && <p>{item.description}</p>}{item.dateLabel && <time dateTime={item.dateTime}>{item.dateLabel}</time>}{markRead && <Button variant="ghost" data-hw-mark-read="" onClick={event => read!(event, item.id)}>{markRead}</Button>}{dismiss && <Button variant="ghost" data-hw-dismiss="" aria-label={copy.dismiss?.(item) || undefined} onClick={event => dismiss(event, item.id)}><span className="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true" /></Button>}</li>; })}</ul> : copy.empty && <p>{copy.empty}</p>}</section>;
}
