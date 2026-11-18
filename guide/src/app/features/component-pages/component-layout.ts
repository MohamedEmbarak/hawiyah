import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import {
  HwButtonDirective,
  HwContainerComponent,
  HwNavigationDrawerComponent,
  HwSideNavigationComponent,
  HwSidebarComponent,
  type HwNavigationDrawerItem,
} from '@hawiyah/angular';
import { map } from 'rxjs';
import { contentManifest } from '../../content/content-loader';
import { page } from '../../core/links';
import { LocaleService } from '../../core/locale';
import { pick, type Lang } from '../../i18n/text';
import { componentPageTexts } from './i18n';

/** One side navigation entry per component page, in manifest order; the current page is marked. */
export function componentNavItems(lang: Lang, currentId: string | null): HwNavigationDrawerItem[] {
  return contentManifest.pages
    .filter((entry) => entry.langs.includes(lang))
    .map((entry) => ({
      id: entry.id,
      label: entry.title[lang],
      href: page(lang, `components/${entry.id}`),
      current: entry.id === currentId,
    }));
}

/**
 * Layout of the component pages: a container with a start sidebar holding the sticky
 * side navigation from 64rem; below 64rem a button opens a navigation drawer with the
 * same entries.
 */
@Component({
  selector: 'guide-component-layout',
  imports: [HwButtonDirective, HwContainerComponent, HwNavigationDrawerComponent, HwSideNavigationComponent, HwSidebarComponent, RouterOutlet],
  template: `<hw-container><div class="layout"><div class="drawer-bar"><button hwButton variant="secondary" size="sm" type="button" aria-haspopup="dialog" (click)="openDrawer($event)">{{ t().sideNavLabel }}</button></div><hw-sidebar side="start" collapseAt="lg"><div hwSidebar class="side"><hw-side-navigation [items]="items()" [label]="t().sideNavLabel" sticky /></div><div class="content"><router-outlet /></div></hw-sidebar></div><hw-navigation-drawer [title]="t().sideNavLabel" [navigationLabel]="t().sideNavLabel" [closeLabel]="t().close" [items]="items()" side="start" [(open)]="drawerOpen" /></hw-container>`,
  styleUrl: './component-layout.css',
})
export class ComponentLayout {
  private readonly locale = inject(LocaleService);
  private readonly id = toSignal(inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('id'))), { initialValue: null });
  private readonly drawer = viewChild.required(HwNavigationDrawerComponent);

  protected readonly t = computed(() => pick(componentPageTexts, this.locale.lang()));
  protected readonly items = computed(() => componentNavItems(this.locale.lang(), this.id()));
  protected readonly drawerOpen = signal(false);

  protected openDrawer(event: MouseEvent): void {
    this.drawer().show(event.currentTarget instanceof HTMLElement ? event.currentTarget : undefined);
  }
}
