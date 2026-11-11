import { useId } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Breadcrumb } from './display.js';
import type { BreadcrumbItem } from './display.js';
import { PortalHeader, PortalFooter } from './expanded-content.js';
import type { PortalHeaderBaseProps, PortalFooterContentProps, PortalFooterProps, PortalNavItem } from './expanded-content.js';
import { cx, rootLabel, text } from './shared.js';
import type { RootName } from './shared.js';

export interface SecondaryNavItem extends PortalNavItem { /** Decorative icon name from the Hawiyah icon stylesheet. */ icon?: string }
export type SecondaryNavProps = ComponentPropsWithRef<'nav'> & { items: readonly SecondaryNavItem[]; variant?: 'default' | 'mobile' } & RootName;
/** Ordinary page links: Tab navigates links, without tablist/menu keyboard semantics. */
export function SecondaryNav({ items, label, variant = 'default', className, ...props }: SecondaryNavProps) {
  return <nav {...props} className={cx('hw-secondary-nav', className)} aria-label={rootLabel('SecondaryNav', props, label)} data-variant={variant}><ul>{items.map((item, index) => <li key={index}><a href={item.href} aria-current={item.current ? 'page' : undefined}>{variant === 'mobile' && item.icon && <span className="hw-icon" data-icon={item.icon} aria-hidden="true" />}<span>{item.label}</span></a></li>)}</ul></nav>;
}
interface PortalLayoutBaseProps extends ComponentPropsWithRef<'div'> {
  /** Application brand for the header and footer: text, artwork or both. Artwork alone is named by `brandLabel`. */
  brand: ReactNode; brandLabel?: string;
  headerProps?: Omit<PortalHeaderBaseProps, 'brand' | 'brandLabel' | 'navigationLabel' | 'menuLabel'>;
  /** Footer content and texts under the PortalFooter names; the name of `footerProps.links` is `footerLabel`. */
  footerProps: PortalFooterContentProps; footerLabel?: string;
  mainId?: string; skipLabel: string; menuLabel: string; navigationLabel: string;
}
/** `secondaryLabel` names the secondary navigation and `breadcrumbLabel` the breadcrumb when they are given. */
export type PortalLayoutProps = PortalLayoutBaseProps
  & ({ secondaryNavigation?: undefined; secondaryLabel?: string } | { secondaryNavigation?: readonly PortalNavItem[]; secondaryLabel: string })
  & ({ breadcrumbs?: undefined; breadcrumbLabel?: string } | { breadcrumbs?: readonly BreadcrumbItem[]; breadcrumbLabel: string });
/** Complete public portal shell; application content supplies its own page heading. */
export function PortalLayout({ brand, brandLabel, headerProps, footerProps, footerLabel, secondaryNavigation, secondaryLabel, breadcrumbs, breadcrumbLabel, mainId, skipLabel, menuLabel, navigationLabel, children, className, ...props }: PortalLayoutProps) {
  const id = useId(); const contentId = mainId ?? `${id}-main`;
  // A missing footerProps is a missing externalLabel: PortalFooter reports it and nothing throws.
  const footerLinksLabel = footerProps?.links?.length ? text('PortalLayout', 'footerLabel', footerLabel, 'footer links are given') : undefined;
  return <div {...props} className={cx('hw-portal-layout', className)}>
    <PortalHeader {...headerProps} brand={brand} brandLabel={brandLabel} mainId={contentId} skipLabel={text('PortalLayout', 'skipLabel', skipLabel) as string} menuLabel={text('PortalLayout', 'menuLabel', menuLabel) as string} navigationLabel={text('PortalLayout', 'navigationLabel', navigationLabel) as string} />
    {secondaryNavigation?.length ? <SecondaryNav items={secondaryNavigation} label={text('PortalLayout', 'secondaryLabel', secondaryLabel, 'secondary navigation items are given') as string} /> : null}
    <main id={contentId} tabIndex={-1} className="hw-portal-layout-main hw-container">
      {breadcrumbs?.length ? <Breadcrumb items={breadcrumbs} label={text('PortalLayout', 'breadcrumbLabel', breadcrumbLabel, 'breadcrumbs are given') as string} /> : null}{children}
    </main>
    <PortalFooter {...{ brand, brandLabel, ...footerProps, navigationLabel: footerLinksLabel } as PortalFooterProps} />
  </div>;
}
