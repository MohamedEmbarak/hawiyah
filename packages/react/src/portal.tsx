import { useId } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Breadcrumb } from './display.js';
import type { BreadcrumbItem } from './display.js';
import { PortalHeader, PortalFooter } from './expanded-content.js';
import type { PortalHeaderProps, PortalFooterProps, PortalNavItem } from './expanded-content.js';
import { cx } from './shared.js';

export interface SecondaryNavItem extends PortalNavItem { /** Decorative icon name from the Nasaq icon stylesheet. */ icon?: string }
export interface SecondaryNavProps extends ComponentPropsWithRef<'nav'> { items: readonly SecondaryNavItem[]; label?: string; variant?: 'default' | 'mobile' }
/** Ordinary page links: Tab navigates links, without tablist/menu keyboard semantics. */
export function SecondaryNav({ items, label = 'التنقل الثانوي', variant = 'default', className, ...props }: SecondaryNavProps) {
  return <nav {...props} className={cx('nq-secondary-nav', className)} aria-label={label} data-variant={variant}><ul>{items.map((item, index) => <li key={index}><a href={item.href} aria-current={item.current ? 'page' : undefined}>{variant === 'mobile' && item.icon && <span className="nq-icon" data-icon={item.icon} aria-hidden="true" />}<span>{item.label}</span></a></li>)}</ul></nav>;
}
export interface PortalLayoutProps extends ComponentPropsWithRef<'div'> {
  brand: ReactNode; headerProps?: Omit<PortalHeaderProps, 'brand' | 'mainId'>;
  footerProps?: PortalFooterProps; secondaryNavigation?: readonly PortalNavItem[];
  secondaryLabel?: string; breadcrumbs?: readonly BreadcrumbItem[]; breadcrumbLabel?: string;
  mainId?: string; skipLabel?: string;
}
/** Complete public portal shell; application content supplies its own page heading. */
export function PortalLayout({ brand, headerProps, footerProps, secondaryNavigation, secondaryLabel, breadcrumbs, breadcrumbLabel = 'مسار التنقل', mainId, skipLabel = 'انتقل إلى المحتوى', lang = 'ar', dir = 'rtl', children, className, ...props }: PortalLayoutProps) {
  const id = useId(); const contentId = mainId ?? `${id}-main`;
  return <div {...props} lang={lang} dir={dir} className={cx('nq-portal-layout', className)}>
    <PortalHeader {...headerProps} brand={brand} mainId={contentId} skipLabel={skipLabel} />
    {secondaryNavigation?.length ? <SecondaryNav items={secondaryNavigation} label={secondaryLabel} /> : null}
    <main id={contentId} tabIndex={-1} className="nq-portal-layout-main nq-container">
      {breadcrumbs?.length ? <Breadcrumb items={breadcrumbs} label={breadcrumbLabel} /> : null}{children}
    </main>
    <PortalFooter brand={brand} linksLabel="روابط التذييل" {...footerProps} />
  </div>;
}
