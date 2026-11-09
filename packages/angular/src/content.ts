import { booleanAttribute, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, inject } from '@angular/core';
import { sortRows } from '@hawiyah/core';
import { HwAvatarComponent } from './presentation';

export interface HwLinkItem { label: string; href: string; current?: boolean; }
export interface HwDescription { term: string; description: string; }
export interface HwNotification { id: string; title: string; description?: string; time?: string; href?: string; unread?: boolean; }
export interface HwDataColumn { key: string; label: string; sortable?: boolean; rowHeader?: boolean; }
export type HwDataRow = Record<string, string | number | boolean | null | undefined>;
let nextPortalId = 0;

@Component({selector: 'hw-link', standalone: true, template: `<a class="hw-link" [attr.href]="disabled ? null : href" [attr.role]="disabled ? 'link' : null" [attr.aria-disabled]="disabled || null" [attr.tabindex]="disabled ? -1 : null" (click)="guard($event)" (auxclick)="guard($event)" [attr.target]="target || null" [attr.rel]="rel || (target === '_blank' ? 'noopener noreferrer' : null)" [attr.aria-current]="current ? 'page' : null" [attr.data-variant]="variant"><ng-content /></a>`})
export class HwLinkComponent {
  @Input({required: true}) href = ''; @Input() target = ''; @Input() rel = ''; @Input() variant: 'default' | 'subtle' | 'neutral' | 'standalone' = 'default'; @Input({transform: booleanAttribute}) current = false;
  @Input({transform: booleanAttribute}) disabled = false;
  guard(event:MouseEvent){if(this.disabled){event.preventDefault();event.stopPropagation();}}
}
@Component({selector: 'hw-icon-button', standalone: true, template: `<button #button class="hw-button hw-icon-button" [type]="type" [disabled]="disabled || loading" [attr.form]="form" [attr.name]="name || null" [value]="value" [attr.aria-label]="label" [attr.aria-pressed]="pressed" [attr.aria-busy]="loading || null" [attr.aria-controls]="controls || null" [attr.aria-expanded]="expanded" [attr.aria-describedby]="describedBy || null" [attr.aria-haspopup]="hasPopup || null" [attr.data-variant]="variant" [attr.data-size]="size" [attr.data-shape]="shape" (click)="activated.emit($event)"><span aria-hidden="true"><ng-content /></span></button>`})
export class HwIconButtonComponent {
  @Input({required: true}) label = ''; @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input({transform: booleanAttribute}) disabled = false; @Input({transform: booleanAttribute}) loading = false;
  @Input() pressed: boolean | null = null; @Input() variant = 'ghost'; @Input() size = 'md'; @Input() shape: 'square' | 'circle' = 'square';
  @Input() form?: string | null; @Input() name = ''; @Input() value = ''; @Input() controls = ''; @Input() describedBy = '';
  @Input({transform: (value: unknown) => value == null ? null : booleanAttribute(value)}) expanded: boolean | null = null; @Input() hasPopup: 'true' | 'false' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | null = null;
  @Output() readonly activated = new EventEmitter<MouseEvent>(); @ViewChild('button') button?: ElementRef<HTMLButtonElement>;
  focus() { this.button?.nativeElement.focus(); }
}
@Component({selector: 'hw-button-group', standalone: true, template: `<div class="hw-button-group" role="group" [attr.aria-label]="label" [attr.data-orientation]="orientation" [attr.data-variant]="variant"><ng-content /></div>`})
export class HwButtonGroupComponent { @Input({required: true}) label = ''; @Input() variant: 'default' | 'attached' = 'default'; @Input() orientation: 'horizontal' | 'vertical' = 'horizontal'; }
@Component({selector: 'hw-chip', standalone: true, template: `<span class="hw-chip" [attr.data-tone]="tone" [attr.data-variant]="variant"><ng-content />@if (removable) {<button type="button" [disabled]="disabled" [attr.aria-label]="removeLabel" (click)="removed.emit()">×</button>}</span>`})
export class HwChipComponent { @Input() tone = 'neutral'; @Input() variant = 'soft'; @Input({transform: booleanAttribute}) removable = false; @Input({transform: booleanAttribute}) disabled = false; @Input() removeLabel = 'Remove'; @Output() readonly removed = new EventEmitter<void>(); }
@Component({selector: 'hw-description-list', standalone: true, template: `<dl class="hw-description-list" [attr.data-variant]="variant">@for (item of items; track $index) {<div><dt>{{ item.term }}</dt><dd>{{ item.description }}</dd></div>}<ng-content /></dl>`})
export class HwDescriptionListComponent { @Input() items: readonly HwDescription[] = []; @Input() variant: 'stacked' | 'horizontal' = 'stacked'; }
@Component({selector: 'hw-stat', standalone: true, template: `<div class="hw-stat" [attr.data-tone]="tone"><div class="hw-stat-label">{{ label }}</div><strong class="hw-stat-value">{{ value }}</strong>@if (description) {<p class="hw-stat-description">{{ description }}</p>}<ng-content /></div>`})
export class HwStatComponent { @Input({required: true}) label = ''; @Input() value: string | number = ''; @Input() description = ''; @Input() tone = 'neutral'; }
@Component({selector: 'hw-timeline', standalone: true, template: `<ol class="hw-timeline" [attr.aria-label]="label">@for (item of items; track $index) {<li class="hw-timeline-item" [attr.data-state]="item.state || null" [attr.aria-current]="item.state === 'current' ? 'step' : null">@if (item.time) {<time [attr.datetime]="item.dateTime || null">{{ item.time }}</time>}<h3>{{ item.title }}</h3>@if (item.description) {<p>{{ item.description }}</p>}</li>}</ol>`})
export class HwTimelineComponent { @Input() label = 'Timeline'; @Input() items: readonly {title: string; description?: string; time?: string; dateTime?: string; state?: 'complete' | 'current' | 'pending'}[] = []; }
@Component({selector: 'hw-meter', standalone: true, template: `<label class="hw-meter"><span>{{ label }}</span><meter [value]="value" [min]="min" [max]="max" [low]="low" [high]="high" [optimum]="optimum">{{ value }}</meter></label>`})
export class HwMeterComponent { @Input({required: true}) label = ''; @Input() value = 0; @Input() min = 0; @Input() max = 100; @Input() low = 25; @Input() high = 75; @Input() optimum = 100; }
@Component({selector: 'hw-avatar-group', standalone: true, imports: [HwAvatarComponent], template: `<div class="hw-avatar-group" role="group" [attr.aria-label]="label">@for (avatar of visibleAvatars; track $index) {<hw-avatar [name]="avatar.name" [src]="avatar.src || ''" />}@if (remaining > 0) {<span class="hw-avatar" role="img" [attr.aria-label]="overflowLabel(remaining)">+{{ remaining }}</span>}</div>`})
export class HwAvatarGroupComponent { @Input() label = 'People'; @Input() avatars: readonly {name: string; src?: string}[] = []; @Input() max = 5; @Input() overflowLabel = (count: number) => `${count} more people`; get visibleAvatars() {
    const rounded = Math.floor(this.max);
    return this.avatars.slice(0, Number.isNaN(rounded) ? 5 : Math.max(0, rounded));
  } get remaining() { return this.avatars.length - this.visibleAvatars.length; } }
@Component({selector: 'hw-data-table', standalone: true, styles: [':host { display: block; min-inline-size: 0; max-inline-size: 100%; }'], template: `<div class="hw-table-wrap hw-data-table" tabindex="0" role="region" [attr.aria-label]="caption"><table class="hw-table" [attr.data-variant]="variant" [attr.data-size]="size"><caption>{{ caption }}</caption><thead><tr>@for (column of columns; track column.key) {<th scope="col" [attr.aria-sort]="sortKey === column.key ? sortDirection : (column.sortable ? 'none' : null)">@if (column.sortable) {<button type="button" (click)="sort(column.key)">{{ column.label }}<span aria-hidden="true">{{ sortKey === column.key ? (sortDirection === 'ascending' ? ' ↑' : ' ↓') : ' ↕' }}</span></button>} @else { {{ column.label }} }</th>}</tr></thead><tbody>@for (row of sortedRows; track $index) {<tr>@for (column of columns; track column.key) {@if (column.rowHeader) {<th scope="row">{{ row[column.key] }}</th>} @else {<td>{{ row[column.key] }}</td>}}</tr>} @empty {<tr><td [attr.colspan]="columns.length || 1">{{ emptyMessage }}</td></tr>}</tbody></table></div>`})
export class HwDataTableComponent {
  @Input({required: true}) caption = ''; @Input() columns: readonly HwDataColumn[] = []; @Input() rows: readonly HwDataRow[] = []; @Input() locale = 'ar-SA'; @Input() emptyMessage = 'لا توجد نتائج'; @Input() sortKey = ''; @Input() sortDirection: 'ascending' | 'descending' = 'ascending'; @Output() readonly sortChange = new EventEmitter<{key: string; direction: 'ascending' | 'descending'}>();
  @Input() variant?: 'default' | 'striped' | 'bordered';
  @Input() size?: 'sm' | 'md' | 'lg';
  get sortedRows(): readonly HwDataRow[] { return this.sortKey ? sortRows(this.rows, this.sortKey, this.sortDirection, this.locale) : this.rows; }
  sort(key: string): void { this.sortDirection = this.sortKey === key && this.sortDirection === 'ascending' ? 'descending' : 'ascending'; this.sortKey = key; this.sortChange.emit({key, direction: this.sortDirection}); }
}

@Component({selector: 'hw-service-card', standalone: true, template: `<article class="hw-card hw-service-card" [attr.data-variant]="variant"><div class="hw-service-card-icon" aria-hidden="true"><ng-content select="[hwServiceIcon]" /></div>@if (category) {<p class="hw-badge">{{ category }}</p>}<h3><a class="hw-link" [href]="href">{{ title }}</a></h3><p>{{ description }}</p><div class="hw-service-card-meta">@if (duration) {<span>{{ duration }}</span>}@if (fee) {<span>{{ fee }}</span>}</div><ng-content /><a class="hw-button" data-variant="secondary" [href]="href">{{ actionLabel }}<span class="hw-sr-only">: {{ title }}</span></a></article>`})
export class HwServiceCardComponent { @Input({required: true}) title = ''; @Input({required: true}) href = ''; @Input() description = ''; @Input() category = ''; @Input() duration = ''; @Input() fee = ''; @Input() actionLabel = 'View service'; @Input() variant = 'default'; }
@Component({selector: 'hw-service-details', standalone: true, imports: [HwDescriptionListComponent], template: `<section class="hw-service-details"><header><h2>{{ title }}</h2><p>{{ description }}</p></header><hw-description-list [items]="details" variant="horizontal" />@if (requirements.length) {<h3>{{ requirementsLabel }}</h3><ul>@for (requirement of requirements; track $index) {<li>{{ requirement }}</li>}</ul>}<ng-content /></section>`})
export class HwServiceDetailsComponent { @Input({required: true}) title = ''; @Input() description = ''; @Input() details: readonly HwDescription[] = []; @Input() requirements: readonly string[] = []; @Input() requirementsLabel = 'Requirements'; }
export interface HwPortalNavItem extends HwLinkItem {
  groups?: readonly { label?: string; links: readonly HwLinkItem[] }[];
}
@Component({selector: 'hw-portal-header', standalone: true, template: `<header class="hw-portal-header">
  @if (mainId) {<a class="hw-skip-link" [href]="'#' + mainId">{{ skipLabel }}</a>}
  <a class="hw-portal-brand" [href]="homeHref"><ng-content select="[hwBrand]" /><span>{{ brand }}</span></a>
  @if (links.length) {
    <button #menuToggle class="hw-button hw-portal-menu-toggle" type="button" [attr.aria-expanded]="menuOpen" [attr.aria-controls]="navigationId" (click)="branch = undefined; menuOpen = !menuOpen"><span class="hw-icon" [attr.data-icon]="menuOpen ? 'cancel-01' : 'menu-01'" aria-hidden="true"></span>{{ menuLabel }}</button>
    <nav [id]="navigationId" [attr.aria-label]="navigationLabel" [attr.data-open]="menuOpen"><ul>
      @for (item of links; track item.href) {<li>
        @if (hasGroups(item)) {
          <details #details data-hw-portal-branch class="hw-portal-branch" [attr.data-current]="item.current || hasCurrentChild(item) || null" [open]="branch === details">
            <summary (click)="toggleBranch($event, details)">{{ item.label }}</summary>
            <div class="hw-portal-branch-panel">
              <a class="hw-link hw-portal-branch-overview" [href]="item.href" [attr.aria-current]="item.current && !hasCurrentChild(item) ? 'page' : null" (click)="close()">{{ item.label }}</a>
              @for (group of item.groups; track $index) {@if (group.links.length) {
                <section class="hw-portal-branch-group">@if (group.label) {<h2>{{ group.label }}</h2>}
                  <ul>@for (link of group.links; track link.href) {<li><a class="hw-link" [href]="link.href" [attr.aria-current]="link.current ? 'page' : null" (click)="close()">{{ link.label }}</a></li>}</ul>
                </section>
              }}
            </div>
          </details>
        } @else {<a class="hw-link" [href]="item.href" [attr.aria-current]="item.current ? 'page' : null" (click)="close()">{{ item.label }}</a>}
      </li>}
    </ul></nav>
  }
  <div class="hw-portal-header-actions"><ng-content /></div>
</header>`})
export class HwPortalHeaderComponent {
  @Input({required: true}) brand = ''; @Input() homeHref = '/'; @Input() mainId = 'main-content';
  @Input() skipLabel = 'انتقل إلى المحتوى'; @Input() menuLabel = 'القائمة'; @Input() navigationLabel = 'التنقل الرئيسي';
  @Input() navigationId = `hw-portal-navigation-${++nextPortalId}`; @Input() links: readonly HwPortalNavItem[] = [];
  menuOpen = false;
  branch?: HTMLDetailsElement;
  @ViewChild('menuToggle') menuToggle?: ElementRef<HTMLButtonElement>;
  private readonly host = inject(ElementRef<HTMLElement>);
  hasGroups(item: HwPortalNavItem) { return item.groups?.some(group => group.links.length); }
  hasCurrentChild(item: HwPortalNavItem) { return item.groups?.some(group => group.links.some(link => link.current)); }
  toggleBranch(event: MouseEvent, details: HTMLDetailsElement) {
    event.preventDefault();
    this.branch = this.branch === details ? undefined : details;
  }
  close() { this.branch = undefined; this.menuOpen = false; }
  @HostListener('keydown', ['$event']) keydown(event: KeyboardEvent) {
    if (event.defaultPrevented || event.key !== 'Escape') return;
    if (this.branch?.isConnected) {
      event.preventDefault(); event.stopPropagation();
      const summary = this.branch.querySelector<HTMLElement>(':scope > summary');
      this.branch = undefined; summary?.focus();
    } else if (this.menuOpen) {
      event.preventDefault(); event.stopPropagation(); this.close(); this.menuToggle?.nativeElement.focus();
    }
  }
  @HostListener('document:pointerdown', ['$event']) outside(event: PointerEvent) {
    const target = event.target as Node;
    if (!this.branch?.contains(target)) this.branch = undefined;
    if (!this.host.nativeElement.contains(target)) this.menuOpen = false;
  }
  @HostListener('focusout', ['$event']) focusout(event: FocusEvent) {
    const target = (event.relatedTarget ?? this.host.nativeElement.ownerDocument.activeElement) as Node | null;
    if (!this.branch?.contains(target)) this.branch = undefined;
    if (!this.host.nativeElement.contains(target)) this.menuOpen = false;
  }
}
export interface HwPortalFooterLink extends HwLinkItem { external?: boolean }
export interface HwPortalFooterGroup { title: string; links: readonly HwPortalFooterLink[] }
@Component({selector: 'hw-portal-footer', standalone: true, template: `<footer class="hw-portal-footer">
  <div class="hw-portal-footer-main">
    <div class="hw-portal-footer-brand"><div class="hw-portal-footer-brand-marks"><ng-content select="[hwFooterBrand]" /></div>@if (brand) {<strong>{{ brand }}</strong>}@if (description) {<p>{{ description }}</p>}</div>
    @if (links.length) {<nav class="hw-portal-footer-group" [attr.aria-label]="navigationLabel"><h2>{{ navigationLabel }}</h2><ul class="hw-portal-footer-links">@for (link of links; track $index) {<li><a class="hw-link" [href]="link.href" [attr.target]="link.external ? '_blank' : null" [attr.rel]="link.external ? 'noopener noreferrer' : null">{{ link.label }}@if (link.external) {<span class="hw-portal-footer-external" aria-hidden="true">↗</span><span class="hw-sr-only"> · {{ externalLabel }}</span>}</a></li>}</ul></nav>}
    @for (group of groups; track $index) {@if (group.links.length) {<nav class="hw-portal-footer-group" [attr.aria-label]="group.title"><h2>{{ group.title }}</h2><ul class="hw-portal-footer-links">@for (link of group.links; track $index) {<li><a class="hw-link" [href]="link.href" [attr.target]="link.external ? '_blank' : null" [attr.rel]="link.external ? 'noopener noreferrer' : null">{{ link.label }}@if (link.external) {<span class="hw-portal-footer-external" aria-hidden="true">↗</span><span class="hw-sr-only"> · {{ externalLabel }}</span>}</a></li>}</ul></nav>}}
    <section class="hw-portal-footer-support" [attr.aria-label]="supportLabel"><h2>{{ supportLabel }}</h2><div class="hw-portal-footer-support-content"><ng-content select="[hwFooterSupport]" /></div></section>
    <div class="hw-portal-footer-extra"><ng-content /></div>
  </div>
  <div class="hw-portal-footer-bottom">@if (copyright) {<small>{{ copyright }}</small>}@if (legalLinks.length) {<nav class="hw-portal-footer-legal" [attr.aria-label]="legalLinksLabel"><ul class="hw-portal-footer-links">@for (link of legalLinks; track $index) {<li><a class="hw-link" [href]="link.href" [attr.target]="link.external ? '_blank' : null" [attr.rel]="link.external ? 'noopener noreferrer' : null">{{ link.label }}@if (link.external) {<span class="hw-portal-footer-external" aria-hidden="true">↗</span><span class="hw-sr-only"> · {{ externalLabel }}</span>}</a></li>}</ul></nav>}<div class="hw-portal-footer-partners"><ng-content select="[hwFooterPartners]" /></div></div>
</footer>`})
export class HwPortalFooterComponent {
  @Input() brand = ''; @Input() description = ''; @Input() copyright = '';
  @Input() navigationLabel = 'روابط التذييل'; @Input() links: readonly HwPortalFooterLink[] = [];
  @Input() groups: readonly HwPortalFooterGroup[] = []; @Input() legalLinks: readonly HwPortalFooterLink[] = [];
  @Input() legalLinksLabel = 'السياسات وإمكانية الوصول'; @Input() supportLabel = 'المساعدة والتواصل'; @Input() externalLabel = 'يفتح في نافذة جديدة';
}
@Component({selector: 'hw-feedback', standalone: true, template: `<section class="hw-feedback" [attr.aria-label]="label" [attr.data-choice-variant]="choiceVariant"><p>{{ label }}</p><div class="hw-button-group hw-feedback-actions" role="group" [attr.aria-label]="label"><button class="hw-button" data-variant="secondary" type="button" [disabled]="disabled" [attr.aria-pressed]="value === true" (click)="choose(true)"><span class="hw-icon hw-feedback-icon" data-icon="thumbs-up" aria-hidden="true"></span><span class="hw-feedback-label">{{ positiveLabel }}</span></button><button class="hw-button" data-variant="secondary" type="button" [disabled]="disabled" [attr.aria-pressed]="value === false" (click)="choose(false)"><span class="hw-icon hw-feedback-icon" data-icon="thumbs-down" aria-hidden="true"></span><span class="hw-feedback-label">{{ negativeLabel }}</span></button></div><p role="status">{{ value !== null ? thanksMessage : '' }}</p><ng-content /></section>`})
export class HwFeedbackComponent { @Input() choiceVariant: 'text' | 'icon' | 'icon-text' = 'text'; @Input() label = 'Was this page helpful?'; @Input() positiveLabel = 'Yes'; @Input() negativeLabel = 'No'; @Input() thanksMessage = 'Thank you for your feedback'; @Input() value: boolean | null = null; @Input({transform: booleanAttribute}) disabled = false; @Output() readonly valueChange = new EventEmitter<boolean>(); choose(value: boolean) { if (!this.disabled) { this.value = value; this.valueChange.emit(value); } } }
@Component({selector: 'hw-cookie-consent', standalone: true, template: `@if (visible) {<section class="hw-cookie-consent" role="region" [attr.aria-label]="title"><h2>{{ title }}</h2><p>{{ description }}</p><ng-content /><div class="hw-button-group"><button class="hw-button" type="button" (click)="choose('accepted')">{{ acceptLabel }}</button><button class="hw-button" data-variant="secondary" type="button" (click)="choose('rejected')">{{ rejectLabel }}</button><button class="hw-button" data-variant="ghost" type="button" (click)="preferences.emit()">{{ preferencesLabel }}</button></div></section>}`})
export class HwCookieConsentComponent { @Input() title = 'Cookie preferences'; @Input() description = ''; @Input() acceptLabel = 'Accept optional cookies'; @Input() rejectLabel = 'Reject optional cookies'; @Input() preferencesLabel = 'Manage preferences'; @Input({transform: booleanAttribute}) visible = true; @Output() readonly visibleChange = new EventEmitter<boolean>(); @Output() readonly consent = new EventEmitter<'accepted' | 'rejected'>(); @Output() readonly preferences = new EventEmitter<void>(); choose(value: 'accepted' | 'rejected') { this.visible = false; this.visibleChange.emit(false); this.consent.emit(value); } }
@Component({selector: 'hw-notification-list', standalone: true, template: `<section class="hw-notification-list" [attr.aria-label]="label"><ul>@for (item of items; track item.id) {<li class="hw-notification" [attr.data-unread]="item.unread"><div>@if (item.href) {<a class="hw-link" [href]="item.href">{{ item.title }}</a>} @else {<strong>{{ item.title }}</strong>}@if (item.unread) {<span class="hw-sr-only">{{ unreadLabel }}</span>}@if (item.description) {<p>{{ item.description }}</p>}@if (item.time) {<span>{{ item.time }}</span>}</div><button type="button" class="hw-button" data-variant="ghost" [attr.aria-label]="dismissLabel + ': ' + item.title" (click)="dismissed.emit(item.id)">×</button></li>} @empty {<li>{{ emptyMessage }}</li>}</ul></section>`})
export class HwNotificationListComponent { @Input() label = 'Notifications'; @Input() items: readonly HwNotification[] = []; @Input() emptyMessage = 'No notifications'; @Input() unreadLabel = 'Unread'; @Input() dismissLabel = 'Dismiss'; @Output() readonly dismissed = new EventEmitter<string>(); }
