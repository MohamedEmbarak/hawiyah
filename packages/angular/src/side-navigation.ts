import { NgTemplateOutlet } from '@angular/common';
import { afterNextRender, booleanAttribute, Component, ElementRef, inject, Injector, Input } from '@angular/core';
import { getNavigationCurrentId, getNavigationGroupEntries, getNavigationItemKind, isNavigationGroupOpen, revealNavigationCurrent } from '@hawiyah/core';
import type { HwNavigationDrawerItem } from './navigation-drawer';
import { navigationListTemplate } from './navigation-list';
import { HwTexts } from './text';

export type HwSideNavigationItem = HwNavigationDrawerItem;
/** The page list of NavigationDrawer outside a drawer: native links and native disclosure, no listener.
 * The host element is the navigation landmark, because a sticky box must be the child of the application's column. */
@Component({ selector: 'hw-side-navigation, nav[hwSideNavigation]', standalone: true, imports: [NgTemplateOutlet], host: { class: 'hw-side-navigation hw-navigation-drawer-nav', '[attr.role]': 'role', '[attr.aria-label]': "texts.need('label', label)", '[attr.data-sticky]': "sticky ? 'true' : null" }, template: `<ng-container [ngTemplateOutlet]="list" [ngTemplateOutletContext]="{ $implicit: items }" />${navigationListTemplate}` })
export class HwSideNavigationComponent {
  /** The same array NavigationDrawer takes. The application marks the current page with `current` on each route change. */
  @Input({ required: true }) items: readonly HwNavigationDrawerItem[] = [];
  /** Accessible name of the navigation landmark. */
  @Input({ required: true }) label = '';
  /** From 64rem the navigation stays in view and scrolls inside its own box. */
  @Input({ transform: booleanAttribute }) sticky = false;
  protected readonly texts = new HwTexts('hw-side-navigation');
  protected readonly kind = getNavigationItemKind; protected readonly entries = getNavigationGroupEntries; protected readonly isOpen = isNavigationGroupOpen;
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  /** A nav element is the landmark already; any other host is given the role. */
  protected readonly role = this.host.tagName.toLowerCase() === 'nav' ? null : 'navigation';
  private currentId?: string;
  /** In the browser only: after the first render, and again once the DOM shows a new current page, the current
   * link is brought into view inside the navigation's own scroll box. The page never scrolls and focus never moves. */
  constructor() { afterNextRender(() => { revealNavigationCurrent(this.host); }); }
  ngDoCheck(): void {
    const id = getNavigationCurrentId(this.items);
    if (this.currentId !== undefined && id !== this.currentId) afterNextRender(() => { revealNavigationCurrent(this.host); }, { injector: this.injector });
    this.currentId = id;
  }
}
