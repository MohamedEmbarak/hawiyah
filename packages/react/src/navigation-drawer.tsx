import { useEffect, useImperativeHandle, useRef } from 'react';
import type { ComponentPropsWithRef, MouseEvent, ReactNode } from 'react';
import { getNavigationCurrentId, getNavigationGroupEntries, getNavigationItemKind, isLinkNavigationHandled, isNavigationGroupOpen, revealNavigationCurrent } from '@hawiyah/core';
import type { NavigationItem } from '@hawiyah/core';
import { Drawer } from './expanded-interactive.js';
import type { DrawerProps } from './expanded-interactive.js';
import { cx, rootLabel, text } from './shared.js';
import type { RootName } from './shared.js';

/** One item model for NavigationDrawer and SideNavigation. `expanded` opens a group; the group that holds the current page opens by itself. */
export interface NavigationDrawerItem extends NavigationItem {
  id: string; label: string; href?: string; icon?: string; current?: boolean;
  disabled?: boolean; expanded?: boolean; children?: readonly NavigationDrawerItem[];
}
/** The same item model; one array feeds SideNavigation and NavigationDrawer. */
export type SideNavigationItem = NavigationDrawerItem;
export interface NavigationDrawerProps extends Omit<DrawerProps, 'children' | 'side'> {
  items: readonly NavigationDrawerItem[];
  /** Name of the navigation landmark. `closeLabel` names the close button. */
  navigationLabel: string;
  userContent?: ReactNode;
  side?: 'start' | 'end';
}

function label(item: NavigationItem) {
  return <>{item.icon && <span className="hw-icon" data-icon={item.icon} aria-hidden="true" />}<span className="hw-navigation-drawer-label">{item.label}</span></>;
}
/** The list of NavigationDrawer and SideNavigation. Groups are native disclosures; `open` is written only when its computed value changes, so the reader's own toggles stand. */
function entries(items: readonly NavigationItem[]): ReactNode {
  return <ul>{items.map(item => {
    const kind = getNavigationItemKind(item);
    return <li key={item.id} data-hw-value={item.id}>
      {kind === 'disabled' ? <span className="hw-navigation-drawer-row" aria-disabled="true">{label(item)}</span>
        : kind === 'group' ? <details className="hw-navigation-drawer-group" open={isNavigationGroupOpen(item)}><summary className="hw-navigation-drawer-row">{label(item)}</summary>{entries(getNavigationGroupEntries(item))}</details>
          : kind === 'link' ? <a className="hw-navigation-drawer-row" href={item.href} aria-current={item.current ? 'page' : undefined}>{label(item)}</a>
            : <span className="hw-navigation-drawer-row">{label(item)}</span>}
    </li>;
  })}</ul>;
}
function routeActivation(event: MouseEvent<HTMLElement>, close: () => void) {
  const link = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
  if (!link || !event.currentTarget.contains(link) || link.closest('[aria-disabled="true"], [inert]')) return;
  if (event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
  const native = event.nativeEvent;
  // Let router/consumer handlers decide whether this route activation proceeds; a click that bindLinkNavigation handed to the router still closes.
  queueMicrotask(() => { if ((!native.defaultPrevented || isLinkNavigationHandled(native)) && link.isConnected) close(); });
}

/** Page navigation in an existing modal Drawer; groups are native disclosures. */
export function NavigationDrawer({ items, navigationLabel, userContent, side = 'start', closeLabel, className, ...props }: NavigationDrawerProps) {
  const name = text('NavigationDrawer', 'navigationLabel', navigationLabel);
  return <Drawer {...props} side={side} closeLabel={closeLabel} className={cx('hw-navigation-drawer', className)}>
    {({ close }) => <>{userContent && <div className="hw-navigation-drawer-user">{userContent}</div>}
      <nav className="hw-navigation-drawer-nav" aria-label={name} onClick={event => routeActivation(event, close)}>{entries(items)}</nav>
    </>}
  </Drawer>;
}

interface SideNavigationBaseProps extends Omit<ComponentPropsWithRef<'nav'>, 'children'> {
  items: readonly NavigationDrawerItem[];
  /** Writes data-sticky="true": from 64rem the navigation sticks and scrolls inside its own box. */
  sticky?: boolean;
}
/** `label` names the navigation landmark; an aria-label or aria-labelledby from the application names it instead. */
export type SideNavigationProps = SideNavigationBaseProps & RootName;
/** The NavigationDrawer list outside a drawer: page links and native group disclosures, no script but revealing the current link inside its own scroll box. */
export function SideNavigation({ items, label, sticky = false, className, ref, ...props }: SideNavigationProps) {
  const name = rootLabel('SideNavigation', props, label);
  const navigation = useRef<HTMLElement>(null);
  useImperativeHandle(ref, () => navigation.current!, []);
  const current = getNavigationCurrentId(items);
  useEffect(() => { revealNavigationCurrent(navigation.current); }, [current]);
  return <nav {...props} ref={navigation} className={cx('hw-side-navigation', 'hw-navigation-drawer-nav', className)} aria-label={name} data-sticky={sticky ? 'true' : undefined}>{entries(items)}</nav>;
}
