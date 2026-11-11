import { createCleanup } from '@hawiyah/core';
import { createDrawer } from './disclosures.js';
import type { DialogController, DialogOptions } from './dialog.js';
import { eventElement, named, remember, text, writeText } from './dom.js';

/** navigationLabel names the nav landmark: the option, else the nav's authored aria-label, else data-hw-navigation-label on the dialog. Required. */
export interface NavigationDrawerOptions extends DialogOptions { navigationLabel?: string }
export type NavigationDrawerController = DialogController;

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
  // Disabled native links cannot be disabled with ARIA alone. Preserve their
  // original attributes for cleanup, then remove them from navigation/tab order.
  for (const disabled of navigation.querySelectorAll<HTMLElement>('[aria-disabled="true"]')) {
    for (const element of [disabled, ...disabled.querySelectorAll<HTMLElement>('a,summary,button,input,select,textarea,[tabindex]')]) {
      remember(scope, element, ['href', 'tabindex', 'inert']);
      element.removeAttribute('href'); element.tabIndex = -1;
      if (element !== disabled) element.setAttribute('inert', '');
    }
  }
  let drawer: DialogController;
  try { drawer = createDrawer(dialog, options); } catch (error) { scope.destroy(); throw error; }
  scope.add(() => drawer.destroy());
  scope.listen(navigation, 'click', event => {
    const target = eventElement(event);
    if (target?.closest('[aria-disabled="true"], [inert]')) { event.preventDefault(); return; }
    const link = target?.closest<HTMLAnchorElement>('a[href]');
    if (!link || !navigation.contains(link)) return;
    const pointer = event as MouseEvent;
    if (pointer.button !== 0 || pointer.ctrlKey || pointer.metaKey || pointer.altKey || pointer.shiftKey || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    queueMicrotask(() => { if (!scope.destroyed && !event.defaultPrevented && link.isConnected) drawer.close(); });
  });
  return { get open() { return drawer.open; }, show: trigger => drawer.show(trigger), close: value => drawer.close(value), destroy: () => scope.destroy() };
}
