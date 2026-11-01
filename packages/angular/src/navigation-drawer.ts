import { NgTemplateOutlet } from '@angular/common';
import { booleanAttribute, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NqDrawerComponent } from './interactions';

export interface NqNavigationDrawerItem {
  id: string; label: string; href?: string; icon?: string; current?: boolean;
  disabled?: boolean; children?: readonly NqNavigationDrawerItem[];
}
@Component({ selector: 'nq-navigation-drawer', standalone: true, imports: [NqDrawerComponent, NgTemplateOutlet], host: { class: 'nq-navigation-drawer-host' }, template: `
  <nq-drawer #drawer [title]="title" [open]="open" [side]="side" [closeLabel]="closeLabel" [closeOnBackdrop]="closeOnBackdrop" (openChange)="changed($event)">
    <div class="nq-navigation-drawer-user"><ng-content select="[nqNavigationDrawerUser]" /></div>
    <nav class="nq-navigation-drawer-nav" [attr.aria-label]="navigationLabel" (click)="routeActivation($event)"><ng-container [ngTemplateOutlet]="list" [ngTemplateOutletContext]="{ $implicit: items }" /></nav>
    <div nqDrawerFooter><ng-content select="[nqNavigationDrawerFooter]" /></div>
  </nq-drawer>
  <ng-template #label let-item>@if (item.icon) {<span class="nq-icon" [attr.data-icon]="item.icon" aria-hidden="true"></span>}<span class="nq-navigation-drawer-label">{{ item.label }}</span></ng-template>
  <ng-template #list let-entries><ul>@for (item of entries; track item.id) {<li [attr.data-nq-value]="item.id">
    @if (item.disabled) {<span class="nq-navigation-drawer-row" aria-disabled="true"><ng-container [ngTemplateOutlet]="label" [ngTemplateOutletContext]="{ $implicit: item }" /></span>}
    @else if (item.children?.length) {<details class="nq-navigation-drawer-group"><summary class="nq-navigation-drawer-row"><ng-container [ngTemplateOutlet]="label" [ngTemplateOutletContext]="{ $implicit: item }" /></summary><ng-container [ngTemplateOutlet]="list" [ngTemplateOutletContext]="{ $implicit: groupEntries(item) }" /></details>}
    @else if (item.href) {<a class="nq-navigation-drawer-row" [href]="item.href" [attr.aria-current]="item.current ? 'page' : null"><ng-container [ngTemplateOutlet]="label" [ngTemplateOutletContext]="{ $implicit: item }" /></a>}
    @else {<span class="nq-navigation-drawer-row"><ng-container [ngTemplateOutlet]="label" [ngTemplateOutletContext]="{ $implicit: item }" /></span>}
  </li>}</ul></ng-template>` })
export class NqNavigationDrawerComponent {
  @Input({ required: true }) title = '';
  @Input() items: readonly NqNavigationDrawerItem[] = [];
  @Input() navigationLabel = 'التنقل الرئيسي';
  @Input() closeLabel = 'إغلاق القائمة';
  @Input() side: 'start' | 'end' = 'start';
  @Input({ transform: booleanAttribute }) open = false;
  @Input({ transform: booleanAttribute }) closeOnBackdrop = true;
  @Output() readonly openChange = new EventEmitter<boolean>();
  @ViewChild('drawer') drawer?: NqDrawerComponent;
  changed(open: boolean) { this.open = open; this.openChange.emit(open); }
  show(trigger?: HTMLElement) { this.drawer?.show(trigger); }
  close() { this.drawer?.close(); }
  groupEntries(item: NqNavigationDrawerItem): readonly NqNavigationDrawerItem[] {
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
