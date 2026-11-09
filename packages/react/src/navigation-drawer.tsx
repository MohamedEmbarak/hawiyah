import type { MouseEvent, ReactNode } from 'react';
import { Drawer } from './expanded-interactive.js';
import type { DrawerProps } from './expanded-interactive.js';
import { cx } from './shared.js';

export interface NavigationDrawerItem {
  id: string; label: string; href?: string; icon?: string; current?: boolean;
  disabled?: boolean; children?: readonly NavigationDrawerItem[];
}
export interface NavigationDrawerProps extends Omit<DrawerProps, 'children' | 'side'> {
  items: readonly NavigationDrawerItem[];
  navigationLabel?: string;
  userContent?: ReactNode;
  side?: 'start' | 'end';
}

function label(item: NavigationDrawerItem) {
  return <>{item.icon && <span className="hw-icon" data-icon={item.icon} aria-hidden="true" />}<span className="hw-navigation-drawer-label">{item.label}</span></>;
}
function groupEntries(item: NavigationDrawerItem): readonly NavigationDrawerItem[] {
  const children = item.children ?? [];
  if (!item.href) return children;
  let id = `${item.id}-page`;
  while (children.some(child => child.id === id)) id += '-page';
  return [{ ...item, id, children: undefined }, ...children];
}
function entries(items: readonly NavigationDrawerItem[]): ReactNode {
  return <ul>{items.map(item => <li key={item.id} data-hw-value={item.id}>
    {item.disabled ? <span className="hw-navigation-drawer-row" aria-disabled="true">{label(item)}</span>
      : item.children?.length ? <details className="hw-navigation-drawer-group">
        <summary className="hw-navigation-drawer-row">{label(item)}</summary>
        {entries(groupEntries(item))}
      </details>
        : item.href ? <a className="hw-navigation-drawer-row" href={item.href} aria-current={item.current ? 'page' : undefined}>{label(item)}</a>
          : <span className="hw-navigation-drawer-row">{label(item)}</span>}
  </li>)}</ul>;
}
function routeActivation(event: MouseEvent<HTMLElement>, close: () => void) {
  const link = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
  if (!link || !event.currentTarget.contains(link) || link.closest('[aria-disabled="true"], [inert]')) return;
  if (event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
  const native = event.nativeEvent;
  // Let router/consumer handlers decide whether this route activation proceeds.
  queueMicrotask(() => { if (!native.defaultPrevented && link.isConnected) close(); });
}

/** Page navigation in an existing modal Drawer; groups are native disclosures. */
export function NavigationDrawer({ items, navigationLabel = 'التنقل الرئيسي', userContent, side = 'start', closeLabel = 'إغلاق القائمة', className, ...props }: NavigationDrawerProps) {
  return <Drawer {...props} side={side} closeLabel={closeLabel} className={cx('hw-navigation-drawer', className)}>
    {({ close }) => <>{userContent && <div className="hw-navigation-drawer-user">{userContent}</div>}
      <nav className="hw-navigation-drawer-nav" aria-label={navigationLabel} onClick={event => routeActivation(event, close)}>{entries(items)}</nav>
    </>}
  </Drawer>;
}
