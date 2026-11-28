import { createCleanup, isLinkNavigationHandled, type CleanupScope } from '@hawiyah/core';
import { createDrawer } from './disclosures.js';
import type { DialogController, DialogOptions } from './dialog.js';
import { eventElement, named, remember, text, writeText } from './dom.js';

/** navigationLabel names the nav landmark: the option, else the nav's authored aria-label, else data-hw-navigation-label on the dialog. Required. */
export interface NavigationDrawerOptions extends DialogOptions { navigationLabel?: string }
/** refresh() recomputes which groups hold the current page, for an application that moves aria-current while the drawer is open. */
export interface NavigationDrawerController extends DialogController { refresh(): void }

/** Existing semantic dialog/nav/details markup stays owned by the caller. */
export function createNavigationDrawer(dialog: HTMLDialogElement, options: NavigationDrawerOptions = {}): NavigationDrawerController {
  const navigation = dialog.querySelector<HTMLElement>('.hw-navigation-drawer-nav');
  if (!navigation || navigation.closest('dialog') !== dialog) throw new Error('Hawiyah: navigation drawer requires its own .hw-navigation-drawer-nav.');
  const scope = createCleanup();
  remember(scope, dialog, ['class', 'data-side']);
  remember(scope, navigation, ['aria-label']);
  dialog.classList.add('hw-dialog', 'hw-drawer', 'hw-navigation-drawer');
  if (!dialog.hasAttribute('data-side')) dialog.dataset.side = 'start';
  if (options.navigationLabel !== undefined || !named(navigation)) writeText(navigation, 'aria-label', 'NavigationDrawer', 'navigationLabel', text(dialog, 'navigationLabel', options.navigationLabel));
  guardDisabledRows(scope, navigation);
  const follow = followCurrentGroups(scope, navigation);
  const refresh = () => { if (!scope.destroyed) follow(); };
  let drawer: DialogController;
  // The current page may have moved while the drawer was closed: the groups follow it each time the drawer is shown.
  try { drawer = createDrawer(dialog, { ...options, onOpenChange: open => { if (open) refresh(); options.onOpenChange?.(open); } }); } catch (error) { scope.destroy(); throw error; }
  scope.add(() => drawer.destroy());
  scope.listen(navigation, 'click', event => {
    const target = eventElement(event);
    if (target?.closest('[aria-disabled="true"], [inert]')) { event.preventDefault(); return; }
    const link = target?.closest<HTMLAnchorElement>('a[href]');
    if (!link || !navigation.contains(link)) return;
    const pointer = event as MouseEvent;
    if (pointer.button !== 0 || pointer.ctrlKey || pointer.metaKey || pointer.altKey || pointer.shiftKey || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    // A timer, not a microtask: during a user click a microtask runs as soon as this listener returns, before listeners on ancestors.
    setTimeout(() => { if (!scope.destroyed && (!event.defaultPrevented || isLinkNavigationHandled(event)) && link.isConnected) drawer.close(); });
  });
  return { get open() { return drawer.open; }, show: trigger => drawer.show(trigger), close: value => drawer.close(value), refresh, destroy: () => scope.destroy() };
}

// Shared by NavigationDrawer and SideNavigation, which enhance the same authored list.
/** Disabled native links cannot be disabled with ARIA alone. Preserve their original attributes for cleanup, then remove them from navigation/tab order. */
export function guardDisabledRows(scope: CleanupScope, navigation: HTMLElement): void {
  for (const disabled of navigation.querySelectorAll<HTMLElement>('[aria-disabled="true"]')) {
    for (const element of [disabled, ...disabled.querySelectorAll<HTMLElement>('a,summary,button,input,select,textarea,[tabindex]')]) {
      remember(scope, element, ['href', 'tabindex', 'inert']);
      element.removeAttribute('href'); element.tabIndex = -1;
      if (element !== disabled) element.setAttribute('inert', '');
    }
  }
}
/** Authored open attributes are the expanded flag. A group that holds the current link (a[href][aria-current="page"]) is opened; when that answer
 * changes the group is opened, or returns to its authored state; otherwise the reader's own toggle stands. Returns the recompute function. */
export function followCurrentGroups(scope: CleanupScope, navigation: HTMLElement): () => void {
  const groups = new Map<HTMLDetailsElement, { authored: boolean; current?: boolean }>();
  const update = () => {
    for (const group of navigation.querySelectorAll<HTMLDetailsElement>('details.hw-navigation-drawer-group')) {
      let entry = groups.get(group);
      if (!entry) { remember(scope, group, ['open']); entry = { authored: group.hasAttribute('open') }; groups.set(group, entry); }
      const current = !!group.querySelector('a[href][aria-current="page"]');
      if (current === entry.current) continue;
      const first = entry.current === undefined; entry.current = current;
      if (current) group.open = true; else if (!first) group.open = entry.authored;
    }
  };
  update();
  return update;
}
