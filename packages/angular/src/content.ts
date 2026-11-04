import { booleanAttribute, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, inject } from '@angular/core';
import { sortRows } from '@nasaq/core';
import { NqAvatarComponent } from './presentation';

export interface NqLinkItem { label: string; href: string; current?: boolean; }
export interface NqDescription { term: string; description: string; }
export interface NqNotification { id: string; title: string; description?: string; time?: string; href?: string; unread?: boolean; }
export interface NqDataColumn { key: string; label: string; sortable?: boolean; rowHeader?: boolean; }
export type NqDataRow = Record<string, string | number | boolean | null | undefined>;
let nextPortalId = 0;

@Component({selector: 'nq-link', standalone: true, template: `<a class="nq-link" [attr.href]="disabled ? null : href" [attr.role]="disabled ? 'link' : null" [attr.aria-disabled]="disabled || null" [attr.tabindex]="disabled ? -1 : null" (click)="guard($event)" (auxclick)="guard($event)" [attr.target]="target || null" [attr.rel]="rel || (target === '_blank' ? 'noopener noreferrer' : null)" [attr.aria-current]="current ? 'page' : null" [attr.data-variant]="variant"><ng-content /></a>`})
export class NqLinkComponent {
  @Input({required: true}) href = ''; @Input() target = ''; @Input() rel = ''; @Input() variant: 'default' | 'subtle' | 'neutral' | 'standalone' = 'default'; @Input({transform: booleanAttribute}) current = false;
  @Input({transform: booleanAttribute}) disabled = false;
  guard(event:MouseEvent){if(this.disabled){event.preventDefault();event.stopPropagation();}}
}
@Component({selector: 'nq-icon-button', standalone: true, template: `<button #button class="nq-button nq-icon-button" [type]="type" [disabled]="disabled || loading" [attr.form]="form" [attr.name]="name || null" [value]="value" [attr.aria-label]="label" [attr.aria-pressed]="pressed" [attr.aria-busy]="loading || null" [attr.aria-controls]="controls || null" [attr.aria-expanded]="expanded" [attr.aria-describedby]="describedBy || null" [attr.aria-haspopup]="hasPopup || null" [attr.data-variant]="variant" [attr.data-size]="size" [attr.data-shape]="shape" (click)="activated.emit($event)"><span aria-hidden="true"><ng-content /></span></button>`})
export class NqIconButtonComponent {
  @Input({required: true}) label = ''; @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input({transform: booleanAttribute}) disabled = false; @Input({transform: booleanAttribute}) loading = false;
  @Input() pressed: boolean | null = null; @Input() variant = 'ghost'; @Input() size = 'md'; @Input() shape: 'square' | 'circle' = 'square';
  @Input() form?: string | null; @Input() name = ''; @Input() value = ''; @Input() controls = ''; @Input() describedBy = '';
  @Input({transform: (value: unknown) => value == null ? null : booleanAttribute(value)}) expanded: boolean | null = null; @Input() hasPopup: 'true' | 'false' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | null = null;
  @Output() readonly activated = new EventEmitter<MouseEvent>(); @ViewChild('button') button?: ElementRef<HTMLButtonElement>;
  focus() { this.button?.nativeElement.focus(); }
}
@Component({selector: 'nq-button-group', standalone: true, template: `<div class="nq-button-group" role="group" [attr.aria-label]="label" [attr.data-orientation]="orientation" [attr.data-variant]="variant"><ng-content /></div>`})
export class NqButtonGroupComponent { @Input({required: true}) label = ''; @Input() variant: 'default' | 'attached' = 'default'; @Input() orientation: 'horizontal' | 'vertical' = 'horizontal'; }
@Component({selector: 'nq-chip', standalone: true, template: `<span class="nq-chip" [attr.data-tone]="tone" [attr.data-variant]="variant"><ng-content />@if (removable) {<button type="button" [disabled]="disabled" [attr.aria-label]="removeLabel" (click)="removed.emit()">×</button>}</span>`})
export class NqChipComponent { @Input() tone = 'neutral'; @Input() variant = 'soft'; @Input({transform: booleanAttribute}) removable = false; @Input({transform: booleanAttribute}) disabled = false; @Input() removeLabel = 'Remove'; @Output() readonly removed = new EventEmitter<void>(); }
@Component({selector: 'nq-description-list', standalone: true, template: `<dl class="nq-description-list" [attr.data-variant]="variant">@for (item of items; track $index) {<div><dt>{{ item.term }}</dt><dd>{{ item.description }}</dd></div>}<ng-content /></dl>`})
export class NqDescriptionListComponent { @Input() items: readonly NqDescription[] = []; @Input() variant: 'stacked' | 'horizontal' = 'stacked'; }
@Component({selector: 'nq-stat', standalone: true, template: `<div class="nq-stat" [attr.data-tone]="tone"><div class="nq-stat-label">{{ label }}</div><strong class="nq-stat-value">{{ value }}</strong>@if (description) {<p class="nq-stat-description">{{ description }}</p>}<ng-content /></div>`})
export class NqStatComponent { @Input({required: true}) label = ''; @Input() value: string | number = ''; @Input() description = ''; @Input() tone = 'neutral'; }
@Component({selector: 'nq-timeline', standalone: true, template: `<ol class="nq-timeline" [attr.aria-label]="label">@for (item of items; track $index) {<li class="nq-timeline-item" [attr.data-state]="item.state || null" [attr.aria-current]="item.state === 'current' ? 'step' : null">@if (item.time) {<time [attr.datetime]="item.dateTime || null">{{ item.time }}</time>}<h3>{{ item.title }}</h3>@if (item.description) {<p>{{ item.description }}</p>}</li>}</ol>`})
export class NqTimelineComponent { @Input() label = 'Timeline'; @Input() items: readonly {title: string; description?: string; time?: string; dateTime?: string; state?: 'complete' | 'current' | 'pending'}[] = []; }
@Component({selector: 'nq-meter', standalone: true, template: `<label class="nq-meter"><span>{{ label }}</span><meter [value]="value" [min]="min" [max]="max" [low]="low" [high]="high" [optimum]="optimum">{{ value }}</meter></label>`})
export class NqMeterComponent { @Input({required: true}) label = ''; @Input() value = 0; @Input() min = 0; @Input() max = 100; @Input() low = 25; @Input() high = 75; @Input() optimum = 100; }
@Component({selector: 'nq-avatar-group', standalone: true, imports: [NqAvatarComponent], template: `<div class="nq-avatar-group" role="group" [attr.aria-label]="label">@for (avatar of visibleAvatars; track $index) {<nq-avatar [name]="avatar.name" [src]="avatar.src || ''" />}@if (remaining > 0) {<span class="nq-avatar" role="img" [attr.aria-label]="overflowLabel(remaining)">+{{ remaining }}</span>}</div>`})
export class NqAvatarGroupComponent { @Input() label = 'People'; @Input() avatars: readonly {name: string; src?: string}[] = []; @Input() max = 5; @Input() overflowLabel = (count: number) => `${count} more people`; get visibleAvatars() {
    const rounded = Math.floor(this.max);
    return this.avatars.slice(0, Number.isNaN(rounded) ? 5 : Math.max(0, rounded));
  } get remaining() { return this.avatars.length - this.visibleAvatars.length; } }
@Component({selector: 'nq-data-table', standalone: true, styles: [':host { display: block; min-inline-size: 0; max-inline-size: 100%; }'], template: `<div class="nq-table-wrap nq-data-table" tabindex="0" role="region" [attr.aria-label]="caption"><table class="nq-table" [attr.data-variant]="variant" [attr.data-size]="size"><caption>{{ caption }}</caption><thead><tr>@for (column of columns; track column.key) {<th scope="col" [attr.aria-sort]="sortKey === column.key ? sortDirection : (column.sortable ? 'none' : null)">@if (column.sortable) {<button type="button" (click)="sort(column.key)">{{ column.label }}<span aria-hidden="true">{{ sortKey === column.key ? (sortDirection === 'ascending' ? ' ↑' : ' ↓') : ' ↕' }}</span></button>} @else { {{ column.label }} }</th>}</tr></thead><tbody>@for (row of sortedRows; track $index) {<tr>@for (column of columns; track column.key) {@if (column.rowHeader) {<th scope="row">{{ row[column.key] }}</th>} @else {<td>{{ row[column.key] }}</td>}}</tr>} @empty {<tr><td [attr.colspan]="columns.length || 1">{{ emptyMessage }}</td></tr>}</tbody></table></div>`})
export class NqDataTableComponent {
  @Input({required: true}) caption = ''; @Input() columns: readonly NqDataColumn[] = []; @Input() rows: readonly NqDataRow[] = []; @Input() locale = 'ar-SA'; @Input() emptyMessage = 'لا توجد نتائج'; @Input() sortKey = ''; @Input() sortDirection: 'ascending' | 'descending' = 'ascending'; @Output() readonly sortChange = new EventEmitter<{key: string; direction: 'ascending' | 'descending'}>();
  @Input() variant?: 'default' | 'striped' | 'bordered';
  @Input() size?: 'sm' | 'md' | 'lg';
  get sortedRows(): readonly NqDataRow[] { return this.sortKey ? sortRows(this.rows, this.sortKey, this.sortDirection, this.locale) : this.rows; }
  sort(key: string): void { this.sortDirection = this.sortKey === key && this.sortDirection === 'ascending' ? 'descending' : 'ascending'; this.sortKey = key; this.sortChange.emit({key, direction: this.sortDirection}); }
}

@Component({selector: 'nq-service-card', standalone: true, template: `<article class="nq-card nq-service-card" [attr.data-variant]="variant"><div class="nq-service-card-icon" aria-hidden="true"><ng-content select="[nqServiceIcon]" /></div>@if (category) {<p class="nq-badge">{{ category }}</p>}<h3><a class="nq-link" [href]="href">{{ title }}</a></h3><p>{{ description }}</p><div class="nq-service-card-meta">@if (duration) {<span>{{ duration }}</span>}@if (fee) {<span>{{ fee }}</span>}</div><ng-content /><a class="nq-button" data-variant="secondary" [href]="href">{{ actionLabel }}<span class="nq-sr-only">: {{ title }}</span></a></article>`})
export class NqServiceCardComponent { @Input({required: true}) title = ''; @Input({required: true}) href = ''; @Input() description = ''; @Input() category = ''; @Input() duration = ''; @Input() fee = ''; @Input() actionLabel = 'View service'; @Input() variant = 'default'; }
@Component({selector: 'nq-service-details', standalone: true, imports: [NqDescriptionListComponent], template: `<section class="nq-service-details"><header><h2>{{ title }}</h2><p>{{ description }}</p></header><nq-description-list [items]="details" variant="horizontal" />@if (requirements.length) {<h3>{{ requirementsLabel }}</h3><ul>@for (requirement of requirements; track $index) {<li>{{ requirement }}</li>}</ul>}<ng-content /></section>`})
export class NqServiceDetailsComponent { @Input({required: true}) title = ''; @Input() description = ''; @Input() details: readonly NqDescription[] = []; @Input() requirements: readonly string[] = []; @Input() requirementsLabel = 'Requirements'; }
export interface NqPortalNavItem extends NqLinkItem {
  groups?: readonly { label?: string; links: readonly NqLinkItem[] }[];
}
@Component({selector: 'nq-portal-header', standalone: true, template: `<header class="nq-portal-header">
  @if (mainId) {<a class="nq-skip-link" [href]="'#' + mainId">{{ skipLabel }}</a>}
  <a class="nq-portal-brand" [href]="homeHref"><ng-content select="[nqBrand]" /><span>{{ brand }}</span></a>
  @if (links.length) {
    <button #menuToggle class="nq-button nq-portal-menu-toggle" type="button" [attr.aria-expanded]="menuOpen" [attr.aria-controls]="navigationId" (click)="branch = undefined; menuOpen = !menuOpen"><span class="nq-icon" [attr.data-icon]="menuOpen ? 'cancel-01' : 'menu-01'" aria-hidden="true"></span>{{ menuLabel }}</button>
    <nav [id]="navigationId" [attr.aria-label]="navigationLabel" [attr.data-open]="menuOpen"><ul>
      @for (item of links; track item.href) {<li>
        @if (hasGroups(item)) {
          <details #details data-nq-portal-branch class="nq-portal-branch" [attr.data-current]="item.current || hasCurrentChild(item) || null" [open]="branch === details">
            <summary (click)="toggleBranch($event, details)">{{ item.label }}</summary>
            <div class="nq-portal-branch-panel">
              <a class="nq-link nq-portal-branch-overview" [href]="item.href" [attr.aria-current]="item.current && !hasCurrentChild(item) ? 'page' : null" (click)="close()">{{ item.label }}</a>
              @for (group of item.groups; track $index) {@if (group.links.length) {
                <section class="nq-portal-branch-group">@if (group.label) {<h2>{{ group.label }}</h2>}
                  <ul>@for (link of group.links; track link.href) {<li><a class="nq-link" [href]="link.href" [attr.aria-current]="link.current ? 'page' : null" (click)="close()">{{ link.label }}</a></li>}</ul>
                </section>
              }}
            </div>
          </details>
        } @else {<a class="nq-link" [href]="item.href" [attr.aria-current]="item.current ? 'page' : null" (click)="close()">{{ item.label }}</a>}
      </li>}
    </ul></nav>
  }
  <div class="nq-portal-header-actions"><ng-content /></div>
</header>`})
export class NqPortalHeaderComponent {
  @Input({required: true}) brand = ''; @Input() homeHref = '/'; @Input() mainId = 'main-content';
  @Input() skipLabel = 'انتقل إلى المحتوى'; @Input() menuLabel = 'القائمة'; @Input() navigationLabel = 'التنقل الرئيسي';
  @Input() navigationId = `nq-portal-navigation-${++nextPortalId}`; @Input() links: readonly NqPortalNavItem[] = [];
  menuOpen = false;
  branch?: HTMLDetailsElement;
  @ViewChild('menuToggle') menuToggle?: ElementRef<HTMLButtonElement>;
  private readonly host = inject(ElementRef<HTMLElement>);
  hasGroups(item: NqPortalNavItem) { return item.groups?.some(group => group.links.length); }
  hasCurrentChild(item: NqPortalNavItem) { return item.groups?.some(group => group.links.some(link => link.current)); }
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
export interface NqPortalFooterLink extends NqLinkItem { external?: boolean }
export interface NqPortalFooterGroup { title: string; links: readonly NqPortalFooterLink[] }
@Component({selector: 'nq-portal-footer', standalone: true, template: `<footer class="nq-portal-footer">
  <div class="nq-portal-footer-main">
    <div class="nq-portal-footer-brand"><div class="nq-portal-footer-brand-marks"><ng-content select="[nqFooterBrand]" /></div>@if (brand) {<strong>{{ brand }}</strong>}@if (description) {<p>{{ description }}</p>}</div>
    @if (links.length) {<nav class="nq-portal-footer-group" [attr.aria-label]="navigationLabel"><h2>{{ navigationLabel }}</h2><ul class="nq-portal-footer-links">@for (link of links; track $index) {<li><a class="nq-link" [href]="link.href" [attr.target]="link.external ? '_blank' : null" [attr.rel]="link.external ? 'noopener noreferrer' : null">{{ link.label }}@if (link.external) {<span class="nq-portal-footer-external" aria-hidden="true">↗</span><span class="nq-sr-only"> · {{ externalLabel }}</span>}</a></li>}</ul></nav>}
    @for (group of groups; track $index) {@if (group.links.length) {<nav class="nq-portal-footer-group" [attr.aria-label]="group.title"><h2>{{ group.title }}</h2><ul class="nq-portal-footer-links">@for (link of group.links; track $index) {<li><a class="nq-link" [href]="link.href" [attr.target]="link.external ? '_blank' : null" [attr.rel]="link.external ? 'noopener noreferrer' : null">{{ link.label }}@if (link.external) {<span class="nq-portal-footer-external" aria-hidden="true">↗</span><span class="nq-sr-only"> · {{ externalLabel }}</span>}</a></li>}</ul></nav>}}
    <section class="nq-portal-footer-support" [attr.aria-label]="supportLabel"><h2>{{ supportLabel }}</h2><div class="nq-portal-footer-support-content"><ng-content select="[nqFooterSupport]" /></div></section>
    <div class="nq-portal-footer-extra"><ng-content /></div>
  </div>
  <div class="nq-portal-footer-bottom">@if (copyright) {<small>{{ copyright }}</small>}@if (legalLinks.length) {<nav class="nq-portal-footer-legal" [attr.aria-label]="legalLinksLabel"><ul class="nq-portal-footer-links">@for (link of legalLinks; track $index) {<li><a class="nq-link" [href]="link.href" [attr.target]="link.external ? '_blank' : null" [attr.rel]="link.external ? 'noopener noreferrer' : null">{{ link.label }}@if (link.external) {<span class="nq-portal-footer-external" aria-hidden="true">↗</span><span class="nq-sr-only"> · {{ externalLabel }}</span>}</a></li>}</ul></nav>}<div class="nq-portal-footer-partners"><ng-content select="[nqFooterPartners]" /></div></div>
</footer>`})
export class NqPortalFooterComponent {
  @Input() brand = ''; @Input() description = ''; @Input() copyright = '';
  @Input() navigationLabel = 'روابط التذييل'; @Input() links: readonly NqPortalFooterLink[] = [];
  @Input() groups: readonly NqPortalFooterGroup[] = []; @Input() legalLinks: readonly NqPortalFooterLink[] = [];
  @Input() legalLinksLabel = 'السياسات وإمكانية الوصول'; @Input() supportLabel = 'المساعدة والتواصل'; @Input() externalLabel = 'يفتح في نافذة جديدة';
}
@Component({selector: 'nq-feedback', standalone: true, template: `<section class="nq-feedback" [attr.aria-label]="label" [attr.data-choice-variant]="choiceVariant"><p>{{ label }}</p><div class="nq-button-group nq-feedback-actions" role="group" [attr.aria-label]="label"><button class="nq-button" data-variant="secondary" type="button" [disabled]="disabled" [attr.aria-pressed]="value === true" (click)="choose(true)"><span class="nq-icon nq-feedback-icon" data-icon="thumbs-up" aria-hidden="true"></span><span class="nq-feedback-label">{{ positiveLabel }}</span></button><button class="nq-button" data-variant="secondary" type="button" [disabled]="disabled" [attr.aria-pressed]="value === false" (click)="choose(false)"><span class="nq-icon nq-feedback-icon" data-icon="thumbs-down" aria-hidden="true"></span><span class="nq-feedback-label">{{ negativeLabel }}</span></button></div><p role="status">{{ value !== null ? thanksMessage : '' }}</p><ng-content /></section>`})
export class NqFeedbackComponent { @Input() choiceVariant: 'text' | 'icon' | 'icon-text' = 'text'; @Input() label = 'Was this page helpful?'; @Input() positiveLabel = 'Yes'; @Input() negativeLabel = 'No'; @Input() thanksMessage = 'Thank you for your feedback'; @Input() value: boolean | null = null; @Input({transform: booleanAttribute}) disabled = false; @Output() readonly valueChange = new EventEmitter<boolean>(); choose(value: boolean) { if (!this.disabled) { this.value = value; this.valueChange.emit(value); } } }
@Component({selector: 'nq-cookie-consent', standalone: true, template: `@if (visible) {<section class="nq-cookie-consent" role="region" [attr.aria-label]="title"><h2>{{ title }}</h2><p>{{ description }}</p><ng-content /><div class="nq-button-group"><button class="nq-button" type="button" (click)="choose('accepted')">{{ acceptLabel }}</button><button class="nq-button" data-variant="secondary" type="button" (click)="choose('rejected')">{{ rejectLabel }}</button><button class="nq-button" data-variant="ghost" type="button" (click)="preferences.emit()">{{ preferencesLabel }}</button></div></section>}`})
export class NqCookieConsentComponent { @Input() title = 'Cookie preferences'; @Input() description = ''; @Input() acceptLabel = 'Accept optional cookies'; @Input() rejectLabel = 'Reject optional cookies'; @Input() preferencesLabel = 'Manage preferences'; @Input({transform: booleanAttribute}) visible = true; @Output() readonly visibleChange = new EventEmitter<boolean>(); @Output() readonly consent = new EventEmitter<'accepted' | 'rejected'>(); @Output() readonly preferences = new EventEmitter<void>(); choose(value: 'accepted' | 'rejected') { this.visible = false; this.visibleChange.emit(false); this.consent.emit(value); } }
@Component({selector: 'nq-notification-list', standalone: true, template: `<section class="nq-notification-list" [attr.aria-label]="label"><ul>@for (item of items; track item.id) {<li class="nq-notification" [attr.data-unread]="item.unread"><div>@if (item.href) {<a class="nq-link" [href]="item.href">{{ item.title }}</a>} @else {<strong>{{ item.title }}</strong>}@if (item.unread) {<span class="nq-sr-only">{{ unreadLabel }}</span>}@if (item.description) {<p>{{ item.description }}</p>}@if (item.time) {<span>{{ item.time }}</span>}</div><button type="button" class="nq-button" data-variant="ghost" [attr.aria-label]="dismissLabel + ': ' + item.title" (click)="dismissed.emit(item.id)">×</button></li>} @empty {<li>{{ emptyMessage }}</li>}</ul></section>`})
export class NqNotificationListComponent { @Input() label = 'Notifications'; @Input() items: readonly NqNotification[] = []; @Input() emptyMessage = 'No notifications'; @Input() unreadLabel = 'Unread'; @Input() dismissLabel = 'Dismiss'; @Output() readonly dismissed = new EventEmitter<string>(); }
