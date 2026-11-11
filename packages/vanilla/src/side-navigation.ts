import { createCleanup, revealNavigationCurrent } from '@hawiyah/core';
import { nameRoot, remember, text } from './dom.js';
import { followCurrentGroups, guardDisabledRows } from './navigation-drawer.js';

/** label names the nav landmark: an authored aria-label or aria-labelledby, else the option, else data-hw-label. Required. */
export interface SideNavigationOptions { label?: string }
export interface SideNavigationController { refresh(): void; destroy(): void }

/** Enhances the authored NavigationDrawer list outside a drawer. Entries are native links and disclosures; no listener is added. */
export function createSideNavigation(nav: HTMLElement, options: SideNavigationOptions = {}): SideNavigationController {
  const scope = createCleanup();
  remember(scope, nav, ['class', 'aria-label']);
  const own = ['hw-side-navigation', 'hw-navigation-drawer-nav'];
  if (!own.every(name => nav.classList.contains(name))) nav.className = [...own, ...[...nav.classList].filter(name => !own.includes(name))].join(' ');
  nameRoot(nav, 'SideNavigation', text(nav, 'label', options.label));
  guardDisabledRows(scope, nav);
  const groups = followCurrentGroups(scope, nav);
  let revealed: Element | null = null;
  // Scrolls only the nav's own box, and only when the current link changed; never on a server DOM.
  const reveal = () => {
    const current = nav.querySelector('a[href][aria-current="page"]');
    if (current === revealed) return;
    revealed = current;
    if (current && nav.ownerDocument.defaultView) revealNavigationCurrent(nav);
  };
  reveal();
  return { refresh() { if (scope.destroyed) return; groups(); reveal(); }, destroy: () => scope.destroy() };
}
