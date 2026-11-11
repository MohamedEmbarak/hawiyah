import { NgTemplateOutlet } from '@angular/common';
import { booleanAttribute, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { getNavigationGroupEntries, getNavigationItemKind, isLinkNavigationHandled, isNavigationGroupOpen, type NavigationItem } from '@hawiyah/core';
import { HwDrawerComponent } from './interactions';
import { injectId } from './ids';
import { navigationListTemplate } from './navigation-list';
import { HwTexts } from './text';

/** The item model of NavigationDrawer and SideNavigation: one array feeds both. A group is open when
 * `expanded` is true or when a link inside it is the current page. */
export interface HwNavigationDrawerItem extends NavigationItem { children?: readonly HwNavigationDrawerItem[]; }
// The input named title is not a native tooltip on the wrapper element.
@Component({ selector: 'hw-navigation-drawer', standalone: true, imports: [HwDrawerComponent, NgTemplateOutlet], host: { class: 'hw-navigation-drawer-host', '[attr.title]': 'null' }, template: `
  <hw-drawer #drawer [title]="title" [titleId]="titleId" [open]="open" [side]="side" [closeLabel]="closeLabel" [closeOnBackdrop]="closeOnBackdrop" (openChange)="changed($event)">
    <div class="hw-navigation-drawer-user"><ng-content select="[hwNavigationDrawerUser]" /></div>
    <nav class="hw-navigation-drawer-nav" [attr.aria-label]="texts.need('navigationLabel', navigationLabel)" (click)="routeActivation($event)"><ng-container [ngTemplateOutlet]="list" [ngTemplateOutletContext]="{ $implicit: items }" /></nav>
    <div hwDrawerFooter><ng-content select="[hwNavigationDrawerFooter]" /></div>
  </hw-drawer>
  ${navigationListTemplate}` })
export class HwNavigationDrawerComponent {
  @Input({ required: true }) title = '';
  @Input() items: readonly HwNavigationDrawerItem[] = [];
  /** Id of the drawer title, which names the dialog. Generated when omitted. */
  @Input() titleId = injectId('hw-navigation-drawer-title');
  /** Name of the navigation landmark. */
  @Input({ required: true }) navigationLabel = '';
  /** Accessible name of the close button. */
  @Input({ required: true }) closeLabel = '';
  protected readonly texts = new HwTexts('hw-navigation-drawer');
  @Input() side: 'start' | 'end' = 'start';
  @Input({ transform: booleanAttribute }) open = false;
  @Input({ transform: booleanAttribute }) closeOnBackdrop = true;
  @Output() readonly openChange = new EventEmitter<boolean>();
  @ViewChild('drawer') drawer?: HwDrawerComponent;
  changed(open: boolean) { this.open = open; this.openChange.emit(open); }
  show(trigger?: HTMLElement) { this.drawer?.show(trigger); }
  close() { this.drawer?.close(); }
  protected readonly kind = getNavigationItemKind; protected readonly entries = getNavigationGroupEntries; protected readonly isOpen = isNavigationGroupOpen;
  /** Closes after a link was followed: by the browser, or by the application's router through core bindLinkNavigation,
   * which prevents the default although the navigation went ahead. Returns nothing, so Angular never cancels the click. */
  routeActivation(event: MouseEvent): void {
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
    if (!link || !(event.currentTarget as Element).contains(link) || link.closest('[aria-disabled="true"], [inert]')) return;
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    // A timer, not a microtask: during a user click a microtask runs as soon as this listener returns, before listeners on ancestors.
    setTimeout(() => { if ((!event.defaultPrevented || isLinkNavigationHandled(event)) && link.isConnected) this.close(); });
  }
}
