import { NgTemplateOutlet } from '@angular/common';
import { booleanAttribute, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { HwDrawerComponent } from './interactions';

export interface HwNavigationDrawerItem {
  id: string; label: string; href?: string; icon?: string; current?: boolean;
  disabled?: boolean; children?: readonly HwNavigationDrawerItem[];
}
@Component({ selector: 'hw-navigation-drawer', standalone: true, imports: [HwDrawerComponent, NgTemplateOutlet], host: { class: 'hw-navigation-drawer-host' }, template: `
  <hw-drawer #drawer [title]="title" [open]="open" [side]="side" [closeLabel]="closeLabel" [closeOnBackdrop]="closeOnBackdrop" (openChange)="changed($event)">
    <div class="hw-navigation-drawer-user"><ng-content select="[hwNavigationDrawerUser]" /></div>
    <nav class="hw-navigation-drawer-nav" [attr.aria-label]="navigationLabel" (click)="routeActivation($event)"><ng-container [ngTemplateOutlet]="list" [ngTemplateOutletContext]="{ $implicit: items }" /></nav>
    <div hwDrawerFooter><ng-content select="[hwNavigationDrawerFooter]" /></div>
  </hw-drawer>
  <ng-template #label let-item>@if (item.icon) {<span class="hw-icon" [attr.data-icon]="item.icon" aria-hidden="true"></span>}<span class="hw-navigation-drawer-label">{{ item.label }}</span></ng-template>
  <ng-template #list let-entries><ul>@for (item of entries; track item.id) {<li [attr.data-hw-value]="item.id">
    @if (item.disabled) {<span class="hw-navigation-drawer-row" aria-disabled="true"><ng-container [ngTemplateOutlet]="label" [ngTemplateOutletContext]="{ $implicit: item }" /></span>}
    @else if (item.children?.length) {<details class="hw-navigation-drawer-group"><summary class="hw-navigation-drawer-row"><ng-container [ngTemplateOutlet]="label" [ngTemplateOutletContext]="{ $implicit: item }" /></summary><ng-container [ngTemplateOutlet]="list" [ngTemplateOutletContext]="{ $implicit: groupEntries(item) }" /></details>}
    @else if (item.href) {<a class="hw-navigation-drawer-row" [href]="item.href" [attr.aria-current]="item.current ? 'page' : null"><ng-container [ngTemplateOutlet]="label" [ngTemplateOutletContext]="{ $implicit: item }" /></a>}
    @else {<span class="hw-navigation-drawer-row"><ng-container [ngTemplateOutlet]="label" [ngTemplateOutletContext]="{ $implicit: item }" /></span>}
  </li>}</ul></ng-template>` })
export class HwNavigationDrawerComponent {
  @Input({ required: true }) title = '';
  @Input() items: readonly HwNavigationDrawerItem[] = [];
  @Input() navigationLabel = 'التنقل الرئيسي';
  @Input() closeLabel = 'إغلاق القائمة';
  @Input() side: 'start' | 'end' = 'start';
  @Input({ transform: booleanAttribute }) open = false;
  @Input({ transform: booleanAttribute }) closeOnBackdrop = true;
  @Output() readonly openChange = new EventEmitter<boolean>();
  @ViewChild('drawer') drawer?: HwDrawerComponent;
  changed(open: boolean) { this.open = open; this.openChange.emit(open); }
  show(trigger?: HTMLElement) { this.drawer?.show(trigger); }
  close() { this.drawer?.close(); }
  groupEntries(item: HwNavigationDrawerItem): readonly HwNavigationDrawerItem[] {
    const children = item.children ?? [];
    if (!item.href) return children;
    let id = item.id + '-page';
    while (children.some(child => child.id === id)) id += '-page';
    return [{ ...item, id, children: undefined }, ...children];
  }
  routeActivation(event: MouseEvent) {
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
    if (!link || !(event.currentTarget as Element).contains(link) || link.closest('[aria-disabled="true"], [inert]')) return;
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    queueMicrotask(() => { if (!event.defaultPrevented && link.isConnected) this.close(); });
  }
}
