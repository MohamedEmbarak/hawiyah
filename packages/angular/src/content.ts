import { afterNextRender, booleanAttribute, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, inject, signal } from '@angular/core';
import { sortRows } from '@hawiyah/core';
import { HwAvatarComponent } from './presentation';
import { bindAngularFragmentLinks } from './fragment-links';
import { injectId } from './ids';
import { HwObservedEmitter } from './platform';
import { HwTexts, reportUnnamedBrand } from './text';

export interface HwLinkItem { label: string; href: string; current?: boolean; }
export interface HwDescription { term: string; description: string; }
export interface HwNotification { id: string; title: string; description?: string; time?: string; href?: string; unread?: boolean; }
export interface HwDataColumn { key: string; label: string; sortable?: boolean; rowHeader?: boolean; }
export type HwDataRow = Record<string, string | number | boolean | null | undefined>;

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
@Component({selector: 'hw-chip', standalone: true, template: `<span class="hw-chip" [attr.data-tone]="tone" [attr.data-variant]="variant"><ng-content />@if (removable) {<button type="button" [disabled]="disabled" [attr.aria-label]="texts.need('removeLabel', removeLabel, 'the chip is removable')" (click)="removed.emit()"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>}</span>`})
export class HwChipComponent { @Input() tone = 'neutral'; @Input() variant = 'soft'; @Input({transform: booleanAttribute}) removable = false; @Input({transform: booleanAttribute}) disabled = false; /** Accessible name of the remove button. Required when the chip is removable. */ @Input() removeLabel = ''; @Output() readonly removed = new EventEmitter<void>(); protected readonly texts = new HwTexts('hw-chip'); }
@Component({selector: 'hw-description-list', standalone: true, template: `<dl class="hw-description-list" [attr.data-variant]="variant">@for (item of items; track $index) {<div><dt>{{ item.term }}</dt><dd>{{ item.description }}</dd></div>}<ng-content /></dl>`})
export class HwDescriptionListComponent { @Input() items: readonly HwDescription[] = []; @Input() variant: 'stacked' | 'horizontal' = 'stacked'; }
@Component({selector: 'hw-stat', standalone: true, template: `<div class="hw-stat" [attr.data-tone]="tone"><div class="hw-stat-label">{{ label }}</div><strong class="hw-stat-value">{{ value }}</strong>@if (description) {<p class="hw-stat-description">{{ description }}</p>}<ng-content /></div>`})
export class HwStatComponent { @Input({required: true}) label = ''; @Input() value: string | number = ''; @Input() description = ''; @Input() tone = 'neutral'; }
@Component({selector: 'hw-timeline', standalone: true, template: `<ol class="hw-timeline" [attr.aria-label]="texts.need('label', label)">@for (item of items; track $index) {<li class="hw-timeline-item" [attr.data-state]="item.state || null" [attr.aria-current]="item.state === 'current' ? 'step' : null">@if (item.time) {<time [attr.datetime]="item.dateTime || null">{{ item.time }}</time>}<h3>{{ item.title }}</h3>@if (item.description) {<p>{{ item.description }}</p>}</li>}</ol>`})
export class HwTimelineComponent { protected readonly texts = new HwTexts('hw-timeline'); @Input({required: true}) label = ''; @Input() items: readonly {title: string; description?: string; time?: string; dateTime?: string; state?: 'complete' | 'current' | 'pending'}[] = []; }
@Component({selector: 'hw-meter', standalone: true, template: `<label class="hw-meter"><span>{{ label }}</span><meter [value]="value" [min]="min" [max]="max" [low]="low" [high]="high" [optimum]="optimum">{{ value }}</meter></label>`})
export class HwMeterComponent { @Input({required: true}) label = ''; @Input() value = 0; @Input() min = 0; @Input() max = 100; @Input() low = 25; @Input() high = 75; @Input() optimum = 100; }
@Component({selector: 'hw-avatar-group', standalone: true, imports: [HwAvatarComponent], template: `<div class="hw-avatar-group" role="group" [attr.aria-label]="texts.need('label', label)">@for (avatar of visibleAvatars; track $index) {<hw-avatar [name]="avatar.name" [src]="avatar.src || ''" />}@if (remaining > 0) {<span class="hw-avatar" role="img" [attr.aria-label]="texts.call('getOverflowLabel', getOverflowLabel, [remaining])">+{{ remaining }}</span>}</div>`})
export class HwAvatarGroupComponent { protected readonly texts = new HwTexts('hw-avatar-group'); @Input({required: true}) label = ''; @Input() avatars: readonly {name: string; src?: string}[] = []; @Input() max = 5; /** Accessible name of the "+N" marker; count is the number of hidden avatars. */ @Input({required: true}) getOverflowLabel!: (count: number) => string; get visibleAvatars() {
    const rounded = Math.floor(this.max);
    return this.avatars.slice(0, Number.isNaN(rounded) ? 5 : Math.max(0, rounded));
  } get remaining() { return this.avatars.length - this.visibleAvatars.length; } }
@Component({selector: 'hw-data-table', standalone: true, styles: [':host { display: block; min-inline-size: 0; max-inline-size: 100%; }'], template: `<div class="hw-table-wrap hw-data-table" tabindex="0" role="region" [attr.aria-label]="caption || null"><table class="hw-table" [attr.data-variant]="variant" [attr.data-size]="size"><caption>{{ caption }}</caption><thead><tr>@for (column of columns; track column.key) {<th scope="col" [attr.aria-sort]="sortKey === column.key ? sortDirection : (column.sortable ? 'none' : null)">@if (column.sortable) {<button type="button" [attr.aria-label]="getSortLabel ? getSortLabel(column, nextDirection(column.key)) || null : null" (click)="sort(column.key)">{{ column.label }}<span class="hw-icon" data-size="sm" aria-hidden="true" [attr.data-icon]="sortKey === column.key ? (sortDirection === 'ascending' ? 'arrow-up-02' : 'arrow-down-02') : 'arrow-data-transfer-vertical'"></span></button>} @else { {{ column.label }} }</th>}</tr></thead><tbody>@for (row of sortedRows; track $index) {<tr>@for (column of columns; track column.key) {@if (column.rowHeader) {<th scope="row">{{ row[column.key] }}</th>} @else {<td>{{ row[column.key] }}</td>}}</tr>} @empty {<tr><td [attr.colspan]="columns.length || 1">{{ texts.need('emptyMessage', emptyMessage) }}</td></tr>}</tbody></table></div>`})
export class HwDataTableComponent {
  @Input({required: true}) caption = ''; @Input() columns: readonly HwDataColumn[] = []; @Input() rows: readonly HwDataRow[] = []; /** BCP 47 tag handed to core sortRows. There is no default: without it the rows keep their source order. */ @Input({required: true}) locale = ''; /** Text of the single cell rendered when there are no rows. */ @Input({required: true}) emptyMessage = ''; @Input() sortKey = ''; @Input() sortDirection: 'ascending' | 'descending' = 'ascending'; @Output() readonly sortChange = new EventEmitter<{key: string; direction: 'ascending' | 'descending'}>();
  @Input() variant?: 'default' | 'striped' | 'bordered';
  @Input() size?: 'sm' | 'md' | 'lg';
  /** Optional accessible name of a sort button; direction is the order the button will apply. Without it the button is named by the column label and aria-sort carries the state. */
  @Input() getSortLabel?: (column: HwDataColumn, direction: 'ascending' | 'descending') => string;
  protected readonly texts = new HwTexts('hw-data-table');
  nextDirection(key: string): 'ascending' | 'descending' { return this.sortKey === key && this.sortDirection === 'ascending' ? 'descending' : 'ascending'; }
  get sortedRows(): readonly HwDataRow[] { return this.sortKey && this.texts.need('locale', this.locale) ? sortRows(this.rows, this.sortKey, this.sortDirection, this.locale) : this.rows; }
  sort(key: string): void { this.sortDirection = this.nextDirection(key); this.sortKey = key; this.sortChange.emit({key, direction: this.sortDirection}); }
}

// The input named title is not a native tooltip on the wrapper element.
@Component({selector: 'hw-service-card', standalone: true, host: {'[attr.title]': 'null'}, template: `<article class="hw-card hw-service-card" [attr.data-variant]="variant"><div class="hw-service-card-icon" aria-hidden="true"><ng-content select="[hwServiceIcon]" /></div>@if (category) {<p class="hw-badge">{{ category }}</p>}<h3><a class="hw-link" [href]="href">{{ title }}</a></h3><p>{{ description }}</p><div class="hw-service-card-meta">@if (duration) {<span>{{ duration }}</span>}@if (fee) {<span>{{ fee }}</span>}</div><ng-content /><ng-content select="[hwServiceAction]"><a class="hw-button" data-variant="secondary" [href]="href">{{ texts.need('actionLabel', actionLabel, 'no [hwServiceAction] content is projected') }}</a></ng-content></article>`})
export class HwServiceCardComponent { @Input({required: true}) title = ''; @Input({required: true}) href = ''; @Input() description = ''; @Input() category = ''; @Input() duration = ''; @Input() fee = ''; /** The whole text and accessible name of the action link; nothing is appended to it. Required unless [hwServiceAction] content replaces the link. */ @Input() actionLabel = ''; @Input() variant = 'default'; protected readonly texts = new HwTexts('hw-service-card'); }
@Component({selector: 'hw-service-details', standalone: true, imports: [HwDescriptionListComponent], host: {'[attr.title]': 'null'}, template: `<section class="hw-service-details"><header><h2>{{ title }}</h2><p>{{ description }}</p></header><hw-description-list [items]="details" variant="horizontal" />@if (requirements.length) {<h3>{{ texts.need('requirementsLabel', requirementsLabel, 'requirements are given') }}</h3><ul>@for (requirement of requirements; track $index) {<li>{{ requirement }}</li>}</ul>}<ng-content /></section>`})
export class HwServiceDetailsComponent { @Input({required: true}) title = ''; @Input() description = ''; @Input() details: readonly HwDescription[] = []; @Input() requirements: readonly string[] = []; /** Heading of the requirements list. Required when requirements are given. */ @Input() requirementsLabel = ''; protected readonly texts = new HwTexts('hw-service-details'); }
export interface HwPortalNavItem extends HwLinkItem {
  groups?: readonly { label?: string; links: readonly HwLinkItem[] }[];
}
@Component({selector: 'hw-portal-header', standalone: true, template: `<header class="hw-portal-header">
  @if (mainId) {<a class="hw-skip-link" [attr.href]="fragment(mainId)">{{ texts.need('skipLabel', skipLabel, 'mainId is set') }}</a>}
  <a #brandElement class="hw-portal-brand" [attr.href]="homeHref || null" [attr.aria-label]="brandLabel || null"><ng-content select="[hwBrand]" />@if (brand) {<span>{{ brand }}</span>}</a>
  @if (links.length) {
    <button #menuToggle class="hw-button hw-portal-menu-toggle" type="button" [attr.aria-expanded]="menuOpen" [attr.aria-controls]="navigationId" (click)="toggleMenu()"><span class="hw-icon" [attr.data-icon]="menuOpen ? 'cancel-01' : 'menu-01'" aria-hidden="true"></span>{{ texts.need('menuLabel', menuLabel) }}</button>
    <nav [id]="navigationId" [attr.aria-label]="texts.need('navigationLabel', navigationLabel)" [attr.data-open]="menuOpen"><ul>
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
  /** Plain brand text. Optional: projected [hwBrand] artwork can stand alone, and brandLabel then names it. */
  @Input() brand = '';
  /** Accessible name of the brand, for artwork without text. Nothing is added when it is omitted. */
  @Input() brandLabel = '';
  /** An empty homeHref renders the brand without an href, so it is not a link. */
  @Input() homeHref = '/';
  /** Id of the main landmark. The skip link is rendered only when it is set, and then needs skipLabel. */
  @Input() mainId = ''; @Input() skipLabel = '';
  @Input({required: true}) menuLabel = ''; @Input({required: true}) navigationLabel = '';
  @Input() navigationId = injectId('hw-portal-navigation'); @Input() links: readonly HwPortalNavItem[] = [];
  protected readonly texts = new HwTexts('hw-portal-header');
  @ViewChild('brandElement') private brandElement?: ElementRef<HTMLElement>;
  constructor() {
    bindAngularFragmentLinks(':scope > .hw-portal-header > a.hw-skip-link');
    afterNextRender(() => reportUnnamedBrand('hw-portal-header', this.brandElement?.nativeElement));
  }
  protected fragment(id: string): string { return `#${encodeURIComponent(id)}`; }
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
  /** Returns nothing: Angular cancels an event whose template listener returns false. */
  protected toggleMenu(): void { this.branch = undefined; this.menuOpen = !this.menuOpen; }
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
    <div class="hw-portal-footer-brand"><div #brandMarks class="hw-portal-footer-brand-marks" [attr.role]="brandName ? 'group' : null" [attr.aria-label]="brandName"><ng-content select="[hwFooterBrand]" />@if (brand) {<strong>{{ brand }}</strong>}</div>@if (description) {<p>{{ description }}</p>}</div>
    @if (links.length) {<nav class="hw-portal-footer-group" [attr.aria-label]="texts.need('navigationLabel', navigationLabel, 'links are given')"><h2>{{ texts.need('navigationLabel', navigationLabel, 'links are given') }}</h2><ul class="hw-portal-footer-links">@for (link of links; track $index) {<li><a class="hw-link" [href]="link.href" [attr.target]="link.external ? '_blank' : null" [attr.rel]="link.external ? 'noopener noreferrer' : null">{{ link.label }}@if (link.external) {<span class="hw-portal-footer-external hw-icon" data-icon="link-square-02" data-size="sm" aria-hidden="true"></span>@if (texts.need('externalLabel', externalLabel); as external) {<span class="hw-sr-only"> {{ external }}</span>}}</a></li>}</ul></nav>}
    @for (group of groups; track $index) {@if (group.links.length) {<nav class="hw-portal-footer-group" [attr.aria-label]="group.title"><h2>{{ group.title }}</h2><ul class="hw-portal-footer-links">@for (link of group.links; track $index) {<li><a class="hw-link" [href]="link.href" [attr.target]="link.external ? '_blank' : null" [attr.rel]="link.external ? 'noopener noreferrer' : null">{{ link.label }}@if (link.external) {<span class="hw-portal-footer-external hw-icon" data-icon="link-square-02" data-size="sm" aria-hidden="true"></span>@if (texts.need('externalLabel', externalLabel); as external) {<span class="hw-sr-only"> {{ external }}</span>}}</a></li>}</ul></nav>}}
    <section class="hw-portal-footer-support" [attr.hidden]="hasSupport ? null : ''" [attr.aria-label]="hasSupport ? texts.need('supportLabel', supportLabel, 'support content is projected') : null">@if (hasSupport) {<h2>{{ texts.need('supportLabel', supportLabel, 'support content is projected') }}</h2>}<div #supportContent class="hw-portal-footer-support-content"><ng-content select="[hwFooterSupport]" /></div></section>
    <div class="hw-portal-footer-extra"><ng-content /></div>
  </div>
  <div class="hw-portal-footer-bottom">@if (copyright) {<small>{{ copyright }}</small>}@if (legalLinks.length) {<nav class="hw-portal-footer-legal" [attr.aria-label]="texts.need('legalLinksLabel', legalLinksLabel, 'legalLinks are given')"><ul class="hw-portal-footer-links">@for (link of legalLinks; track $index) {<li><a class="hw-link" [href]="link.href" [attr.target]="link.external ? '_blank' : null" [attr.rel]="link.external ? 'noopener noreferrer' : null">{{ link.label }}@if (link.external) {<span class="hw-portal-footer-external hw-icon" data-icon="link-square-02" data-size="sm" aria-hidden="true"></span>@if (texts.need('externalLabel', externalLabel); as external) {<span class="hw-sr-only"> {{ external }}</span>}}</a></li>}</ul></nav>}<div class="hw-portal-footer-partners"><ng-content select="[hwFooterPartners]" /></div></div>
</footer>`})
export class HwPortalFooterComponent {
  @Input() brand = ''; @Input() description = ''; @Input() copyright = '';
  /** Accessible name of the brand group (.hw-portal-footer-brand-marks, with role="group"), for projected [hwFooterBrand] artwork without text. Written only while the group has brand text or artwork; the description stays outside it. */
  @Input() brandLabel = '';
  /** Name and heading of the links landmark. Required when links are given. */
  @Input() navigationLabel = ''; @Input() links: readonly HwPortalFooterLink[] = [];
  @Input() groups: readonly HwPortalFooterGroup[] = []; @Input() legalLinks: readonly HwPortalFooterLink[] = [];
  /** legalLinksLabel is required when legalLinks are given, supportLabel when [hwFooterSupport] content is projected. */
  @Input() legalLinksLabel = ''; @Input() supportLabel = '';
  /** Screen-reader text appended to links marked external. */
  @Input({required: true}) externalLabel = '';
  protected readonly texts = new HwTexts('hw-portal-footer');
  /** The support heading and its section are shown only while the application projects support content. */
  protected hasSupport = false;
  protected hasBrandMarks = false;
  protected get brandName(): string | null { return this.brandLabel.trim() && (this.brand.trim() || this.hasBrandMarks) ? this.brandLabel : null; }
  @ViewChild('supportContent', {static: true}) private supportContent?: ElementRef<HTMLElement>;
  @ViewChild('brandMarks', {static: true}) private brandMarks?: ElementRef<HTMLElement>;
  constructor() { afterNextRender(() => { const marks = this.brandMarks?.nativeElement; if (marks?.childElementCount && !this.brand.trim() && !this.brandLabel.trim()) reportUnnamedBrand('hw-portal-footer', marks); }); }
  private readonly changeDetector = inject(ChangeDetectorRef);
  /** Projected nodes are in place before this component's own bindings are checked. */
  ngAfterContentChecked(): void {
    const filled = (element?: HTMLElement): boolean => !!element && Array.from(element.childNodes).some(node => node.nodeType === 1 || (node.nodeType === 3 && !!node.textContent?.trim()));
    const hasSupport = filled(this.supportContent?.nativeElement), hasBrandMarks = filled(this.brandMarks?.nativeElement);
    if (hasSupport !== this.hasSupport || hasBrandMarks !== this.hasBrandMarks) { this.hasSupport = hasSupport; this.hasBrandMarks = hasBrandMarks; this.changeDetector.markForCheck(); }
  }
}
@Component({selector: 'hw-feedback', standalone: true, template: `<section class="hw-feedback" [attr.aria-label]="texts.need('label', label)" [attr.data-choice-variant]="choiceVariant"><p>{{ texts.need('label', label) }}</p><div class="hw-button-group hw-feedback-actions" role="group" [attr.aria-label]="texts.need('label', label)"><button class="hw-button" data-variant="secondary" type="button" [disabled]="disabled" [attr.aria-pressed]="value === true" (click)="choose(true)"><span class="hw-icon hw-feedback-icon" data-icon="thumbs-up" aria-hidden="true"></span><span class="hw-feedback-label">{{ texts.need('yesLabel', yesLabel) }}</span></button><button class="hw-button" data-variant="secondary" type="button" [disabled]="disabled" [attr.aria-pressed]="value === false" (click)="choose(false)"><span class="hw-icon hw-feedback-icon" data-icon="thumbs-down" aria-hidden="true"></span><span class="hw-feedback-label">{{ texts.need('noLabel', noLabel) }}</span></button></div><p role="status">{{ value !== null ? texts.need('successMessage', successMessage) : '' }}</p><ng-content /></section>`})
export class HwFeedbackComponent { @Input() choiceVariant: 'text' | 'icon' | 'icon-text' = 'text'; /** The question, which also names the group; the two answers; and the status text after an answer. */ @Input({required: true}) label = ''; @Input({required: true}) yesLabel = ''; @Input({required: true}) noLabel = ''; @Input({required: true}) successMessage = ''; protected readonly texts = new HwTexts('hw-feedback'); @Input() value: boolean | null = null; @Input({transform: booleanAttribute}) disabled = false; @Output() readonly valueChange = new EventEmitter<boolean>(); choose(value: boolean) { if (!this.disabled) { this.value = value; this.valueChange.emit(value); } } }
@Component({selector: 'hw-cookie-consent', standalone: true, host: {'[attr.title]': 'null'}, template: `@if (visible) {<section class="hw-cookie-consent" role="region" [attr.aria-label]="texts.need('title', title)"><h2>{{ texts.need('title', title) }}</h2><p>{{ description }}</p>@if (policyHref) {<a class="hw-link" [href]="policyHref">{{ texts.need('policyLabel', policyLabel, 'policyHref is set') }}</a>}<ng-content /><div class="hw-button-group"><button class="hw-button" type="button" (click)="choose('accepted')">{{ texts.need('acceptLabel', acceptLabel) }}</button><button class="hw-button" data-variant="secondary" type="button" (click)="choose('rejected')">{{ texts.need('rejectLabel', rejectLabel) }}</button>@if (hasPreferencesListener()) {<button class="hw-button" data-variant="ghost" type="button" (click)="preferences.emit()">{{ texts.need('preferencesLabel', preferencesLabel, 'a preferences listener is bound') }}</button>}</div></section>}`})
export class HwCookieConsentComponent { protected readonly texts = new HwTexts('hw-cookie-consent'); /** Heading and accessible name of the region. */ @Input({required: true}) title = ''; @Input() description = ''; @Input({required: true}) acceptLabel = ''; @Input({required: true}) rejectLabel = ''; /** Text of the preferences button, which is rendered while a (preferences) listener is bound. */ @Input() preferencesLabel = ''; /** A policy link is rendered when policyHref is set, and then needs policyLabel. */ @Input() policyHref = ''; @Input() policyLabel = ''; protected readonly hasPreferencesListener = signal(false); @Input({transform: booleanAttribute}) visible = true; @Output() readonly visibleChange = new EventEmitter<boolean>(); @Output() readonly consent = new EventEmitter<'accepted' | 'rejected'>(); @Output() readonly preferences: EventEmitter<void> = new HwObservedEmitter<void>(observed => this.hasPreferencesListener.set(observed)); choose(value: 'accepted' | 'rejected') { this.visible = false; this.visibleChange.emit(false); this.consent.emit(value); } }
@Component({selector: 'hw-notification-list', standalone: true, template: `<section class="hw-notification-list" [attr.aria-label]="texts.need('label', label)"><ul>@for (item of items; track item.id) {<li class="hw-notification" [attr.data-unread]="item.unread"><div>@if (item.href) {<a class="hw-link" [href]="item.href">{{ item.title }}</a>} @else {<strong>{{ item.title }}</strong>}@if (item.unread) {<span class="hw-sr-only">{{ texts.need('unreadLabel', unreadLabel) }}</span>}@if (item.description) {<p>{{ item.description }}</p>}@if (item.time) {<span>{{ item.time }}</span>}</div>@if (hasDismissListener()) {<button type="button" class="hw-button" data-variant="ghost" [attr.aria-label]="texts.call('getDismissLabel', getDismissLabel, [item], 'a dismissed listener is bound')" (click)="dismissed.emit(item.id)"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>}</li>} @empty {<li>{{ texts.need('emptyMessage', emptyMessage) }}</li>}</ul></section>`})
export class HwNotificationListComponent {
  /** Name of the list; text of the single item shown when it is empty; screen-reader text on unread items. */
  @Input({required: true}) label = ''; @Input() items: readonly HwNotification[] = []; @Input({required: true}) emptyMessage = ''; @Input({required: true}) unreadLabel = '';
  /** Accessible name of an item's dismiss button, which is rendered while a (dismissed) listener is bound. */
  @Input() getDismissLabel?: (item: HwNotification) => string;
  protected readonly texts = new HwTexts('hw-notification-list');
  protected readonly hasDismissListener = signal(false);
  @Output() readonly dismissed: EventEmitter<string> = new HwObservedEmitter<string>(observed => this.hasDismissListener.set(observed));
}
