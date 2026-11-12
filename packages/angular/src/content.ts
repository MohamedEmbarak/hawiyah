import { afterNextRender, booleanAttribute, ChangeDetectorRef, Component, Directive, ElementRef, EventEmitter, HostAttributeToken, HostListener, Input, Output, Renderer2, TemplateRef, ViewChild, inject, signal } from '@angular/core';
import type { AfterViewChecked, DoCheck, OnDestroy } from '@angular/core';
import { getPortalBranchSummary, prepareRemovalFocus, sortRows } from '@hawiyah/core';
import type { ConsentChoice, FeedbackValue } from '@hawiyah/core';
import { NgTemplateOutlet } from '@angular/common';
import { HwAvatarComponent, HwBadgeComponent } from './presentation';
import { HwTextareaComponent } from './forms';
import { cellTemplate, tableCell, tableCells } from './table-templates';
import { forwardedAriaHost, hostHasName, injectHostAttribute } from './host-attributes';
import { HwNamedRoot } from './root-name';
import { bindAngularFragmentLinks } from './fragment-links';
import { injectId } from './ids';
import { HwObservedEmitter, injectIsBrowser } from './platform';
import { HwTexts, reportUnnamedBrand } from './text';

export interface HwLinkItem { label: string; href: string; current?: boolean; }
export interface HwDescription { term: string; description: string; }
/** `dateLabel` is the visible date and `dateTime` its machine-readable value; an item is unread until `read` is true. */
export interface HwNotification { id: string; title: string; description?: string; href?: string; dateTime?: string; dateLabel?: string; read?: boolean; }
export interface HwAvatarItem { name: string; src?: string; initials?: string; size?: 'sm' | 'md' | 'lg' | 'xl' | '40' | '64' | '80' | '120'; variant?: 'circle' | 'square' }
/** `dateLabel` is the visible date and `dateTime` its machine-readable value; `id` keys the item. */
export interface HwTimelineItem { id: string; title: string; description?: string; dateTime?: string; dateLabel?: string; status?: 'complete' | 'current' | 'upcoming' }
export type HwFeedbackValue = FeedbackValue;
export type HwConsentChoice = ConsentChoice;
export type HwDataRow = Record<string, unknown>;
/** `label` is the plain heading of the column and the text of its sort button; `cell` displays the cell of each row. */
export interface HwDataColumn<Row = HwDataRow> { key: string; label: string; sortable?: boolean; rowHeader?: boolean; cell?: TemplateRef<{$implicit: Row; index: number; column: HwDataColumn<Row>}>; }

/** The link is the application's own anchor: href, routerLink, ARIA and every native attribute stay on the real element.
 * aria-current, target, rel, role, aria-disabled and tabindex are written only while the directive has a value for them;
 * what the application wrote comes back otherwise. A disabled link has no href, is not focusable and cancels its activation. */
@Directive({selector: 'a[hwLink]', standalone: true, host: {class: 'hw-link', '[attr.data-variant]': 'variant'}})
export class HwLinkDirective implements DoCheck, AfterViewChecked, OnDestroy {
  @Input() variant?: 'default' | 'subtle' | 'neutral' | 'standalone';
  /** Writes aria-current="page". */
  @Input({transform: booleanAttribute}) current = false;
  @Input({transform: booleanAttribute}) disabled = false;
  /** Writes target="_blank" and adds noopener noreferrer to the rel the anchor was written with. */
  @Input({transform: booleanAttribute}) external = false;
  private readonly host = inject<ElementRef<HTMLAnchorElement>>(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);
  private readonly authoredRel = inject(new HostAttributeToken('rel'), {optional: true});
  private readonly currentAttribute = injectHostAttribute('aria-current');
  private readonly targetAttribute = injectHostAttribute('target');
  private readonly relAttribute = injectHostAttribute('rel');
  private readonly roleAttribute = injectHostAttribute('role');
  private readonly disabledAttribute = injectHostAttribute('aria-disabled');
  private readonly tabindexAttribute = injectHostAttribute('tabindex');
  private savedHref: string | null = null;
  // In the capture phase, so that neither the browser, a router directive nor a listener of the application acts on a disabled link.
  private readonly guard = (event: Event): void => { if (this.disabled) { event.preventDefault(); event.stopImmediatePropagation(); } };
  private readonly browser = injectIsBrowser();
  constructor() { if (this.browser) { this.host.addEventListener('click', this.guard, true); this.host.addEventListener('auxclick', this.guard, true); } }
  ngDoCheck(): void {
    this.currentAttribute.set(this.current ? 'page' : null);
    this.targetAttribute.set(this.external ? '_blank' : null);
    this.relAttribute.set(this.external ? [this.authoredRel, 'noopener', 'noreferrer'].filter(Boolean).join(' ') : null);
    this.roleAttribute.set(this.disabled ? 'link' : null);
    this.disabledAttribute.set(this.disabled ? 'true' : null);
    this.tabindexAttribute.set(this.disabled ? '-1' : null);
    this.syncHref();
  }
  /** Again after the host bindings of the other directives on the anchor, which may write href in the same pass. */
  ngAfterViewChecked(): void { this.syncHref(); }
  // While disabled the href is taken off; the value the application last wrote is put back when disabled ends.
  private syncHref(): void {
    if (this.disabled) { const href = this.host.getAttribute('href'); if (href !== null) { this.savedHref = href; this.renderer.removeAttribute(this.host, 'href'); } }
    else if (this.savedHref !== null) { if (!this.host.hasAttribute('href')) this.renderer.setAttribute(this.host, 'href', this.savedHref); this.savedHref = null; }
  }
  ngOnDestroy(): void { if (this.browser) { this.host.removeEventListener('click', this.guard, true); this.host.removeEventListener('auxclick', this.guard, true); } }
}
/** The button is named by an aria-label or aria-labelledby written on the host, else by `label`; the host keeps none of them. */
@Component({selector: 'hw-icon-button', standalone: true, template: `<button #button class="hw-button hw-icon-button" [type]="type" [disabled]="disabled || loading" [attr.form]="form" [attr.name]="name || null" [value]="value" [attr.aria-label]="rootName" [attr.aria-labelledby]="ariaLabelledby" [attr.aria-describedby]="ariaDescribedby" [attr.aria-pressed]="pressed" [attr.aria-busy]="loading || null" [attr.aria-controls]="controls || null" [attr.aria-expanded]="expanded" [attr.aria-haspopup]="hasPopup || null" [attr.data-variant]="variant" [attr.data-size]="size" [attr.data-shape]="shape" (click)="activated.emit($event)"><span aria-hidden="true"><ng-content /></span></button>`})
export class HwIconButtonComponent extends HwNamedRoot {
  protected readonly texts = new HwTexts('hw-icon-button'); @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input({transform: booleanAttribute}) disabled = false; @Input({transform: booleanAttribute}) loading = false;
  @Input() pressed: boolean | null = null; @Input() variant = 'ghost'; @Input() size = 'md'; @Input() shape: 'square' | 'circle' = 'square';
  @Input() form?: string | null; @Input() name = ''; @Input() value = ''; @Input() controls = '';
  @Input({transform: (value: unknown) => value == null ? null : booleanAttribute(value)}) expanded: boolean | null = null; @Input() hasPopup: 'true' | 'false' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | null = null;
  @Output() readonly activated = new EventEmitter<MouseEvent>(); @ViewChild('button') button?: ElementRef<HTMLButtonElement>;
  focus() { this.button?.nativeElement.focus(); }
}
/** The host is the group. role and aria-label are written only while the component has a value for them: an aria-label or
 * aria-labelledby the application writes on the host names the group when `label` is not given. */
@Component({selector: 'hw-button-group', standalone: true, host: {class: 'hw-button-group', '[attr.data-variant]': 'variant', '[attr.data-orientation]': 'orientation'}, template: `<ng-content />`})
export class HwButtonGroupComponent implements DoCheck {
  /** Name of the group. Required unless the host carries aria-label or aria-labelledby. */
  @Input() label = ''; @Input() variant?: 'default' | 'attached'; @Input() orientation?: 'horizontal' | 'vertical';
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly role = injectHostAttribute('role'); private readonly name = injectHostAttribute('aria-label');
  protected readonly texts = new HwTexts('hw-button-group');
  ngDoCheck(): void { this.role.set('group'); this.name.set(this.label || null); if (!this.label && !hostHasName(this.host)) this.texts.need('label', this.label); }
}
/** The host is the chip. The remove button is rendered while a (removed) listener is bound; the application removes the chip.
 * A chip removed while its button had focus hands focus to the remove button of the next chip beside it, else of the previous one. */
@Component({selector: 'hw-chip', standalone: true, host: {class: 'hw-chip', '[attr.data-tone]': 'tone', '[attr.data-variant]': 'variant', '[attr.data-size]': 'size'}, template: `<ng-content />@if (hasRemoveListener()) {<button type="button" [disabled]="disabled" [attr.aria-label]="texts.need('removeLabel', removeLabel, 'a removed listener is bound')" (click)="remove($event)"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>}`})
export class HwChipComponent implements OnDestroy {
  @Input() tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' = 'neutral'; @Input() variant?: 'soft' | 'outline'; @Input() size?: 'sm' | 'lg';
  @Input({transform: booleanAttribute}) disabled = false;
  /** Accessible name of the remove button. Required while a (removed) listener is bound. */
  @Input() removeLabel = '';
  protected readonly hasRemoveListener = signal(false);
  @Output() readonly removed: EventEmitter<void> = new HwObservedEmitter<void>(observed => this.hasRemoveListener.set(observed));
  protected readonly texts = new HwTexts('hw-chip');
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private pending?: () => void;
  protected remove(event: Event): void {
    const parent = this.host.parentElement;
    this.pending = parent ? prepareRemovalFocus(parent, event.currentTarget as HTMLElement, {item: ':scope > .hw-chip', control: ':scope > button'}) : undefined;
    this.removed.emit();
  }
  // After the render that removed the chip: the node is detached once the destroy hooks have run.
  ngOnDestroy(): void { const run = this.pending; if (run) queueMicrotask(run); }
}
@Component({selector: 'hw-description-list', standalone: true, template: `<dl class="hw-description-list" [attr.data-variant]="variant">@for (item of items; track $index) {<div><dt>{{ item.term }}</dt><dd>{{ item.description }}</dd></div>}<ng-content /></dl>`})
export class HwDescriptionListComponent { @Input() items: readonly HwDescription[] = []; /** Stacked unless given. */ @Input() variant?: 'stacked' | 'horizontal' | 'compact'; }
/** The host is the stat. [hwStatValue] and [hwStatTrend] project rich content into the value and the trend, after the string
 * input: pass one of the two. Both regions are always rendered, without whitespace; the stylesheet hides an empty trend. */
@Component({selector: 'hw-stat', standalone: true, host: {class: 'hw-stat', '[attr.data-tone]': 'tone', '[attr.data-variant]': 'variant'}, template: `<span class="hw-stat-label">{{ label }}</span><strong class="hw-stat-value">@if (value !== '') {<ng-container>{{ value }}</ng-container>}<ng-content select="[hwStatValue]" /></strong>@if (description) {<p class="hw-stat-description">{{ description }}</p>}<span class="hw-stat-trend" [attr.data-tone]="trendTone">@if (trend) {<ng-container>{{ trend }}</ng-container>}<ng-content select="[hwStatTrend]" /></span><ng-content />`})
export class HwStatComponent { @Input({required: true}) label = ''; @Input() value: string | number = ''; @Input() description = ''; @Input() trend = ''; @Input() trendTone?: 'success' | 'danger'; @Input() tone?: 'neutral' | 'success' | 'danger'; @Input() variant?: 'plain'; }
/** Named by an aria-label or aria-labelledby written on the host, else by `label`. A dateTime without dateLabel shows no date. */
@Component({selector: 'hw-timeline', standalone: true, template: `<ol class="hw-timeline" [attr.aria-label]="rootName" [attr.aria-labelledby]="ariaLabelledby" [attr.aria-describedby]="ariaDescribedby">@for (item of items; track item.id) {<li class="hw-timeline-item" [attr.data-state]="item.status || null" [attr.aria-current]="item.status === 'current' ? 'step' : null"><h3>{{ item.title }}</h3>@if (item.dateLabel) {<time [attr.datetime]="item.dateTime || null">{{ item.dateLabel }}</time>}@if (item.description) {<p>{{ item.description }}</p>}</li>}</ol>`})
export class HwTimelineComponent extends HwNamedRoot { protected readonly texts = new HwTexts('hw-timeline'); @Input() items: readonly HwTimelineItem[] = []; }
/** One native meter named through aria-label: an aria-label or aria-labelledby written on the host, else `label`.
 * No visible label is rendered; low, high and optimum are written only when given. */
@Component({selector: 'hw-meter', standalone: true, template: `<meter class="hw-meter" [attr.aria-label]="rootName" [attr.aria-labelledby]="ariaLabelledby" [attr.aria-describedby]="ariaDescribedby" [attr.min]="min" [attr.max]="max" [attr.value]="value" [attr.low]="low ?? null" [attr.high]="high ?? null" [attr.optimum]="optimum ?? null"></meter>`})
export class HwMeterComponent extends HwNamedRoot { protected readonly texts = new HwTexts('hw-meter'); @Input() value = 0; @Input() min = 0; @Input() max = 100; @Input() low?: number; @Input() high?: number; @Input() optimum?: number; }
/** The host is the group; each member is an hw-avatar. role and aria-label are written as hw-button-group writes them. */
@Component({selector: 'hw-avatar-group', standalone: true, imports: [HwAvatarComponent], host: {class: 'hw-avatar-group'}, template: `@for (item of visibleItems; track $index) {<hw-avatar [name]="item.name" [src]="item.src || ''" [initials]="item.initials" [size]="item.size" [variant]="item.variant" />}@if (remaining > 0) {<span class="hw-avatar" role="img" [attr.aria-label]="texts.call('getOverflowLabel', getOverflowLabel, [remaining])">+{{ remaining }}</span>}`})
export class HwAvatarGroupComponent implements DoCheck {
  protected readonly texts = new HwTexts('hw-avatar-group');
  /** Name of the group. Required unless the host carries aria-label or aria-labelledby. */
  @Input() label = ''; @Input() items: readonly HwAvatarItem[] = []; @Input() max = 5;
  /** Accessible name of the "+N" marker; count is the number of hidden avatars. */
  @Input({required: true}) getOverflowLabel!: (count: number) => string;
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly role = injectHostAttribute('role'); private readonly name = injectHostAttribute('aria-label');
  ngDoCheck(): void { this.role.set('group'); this.name.set(this.label || null); if (!this.label && !hostHasName(this.host)) this.texts.need('label', this.label); }
  get visibleItems() {
    const rounded = Math.floor(this.max);
    return this.items.slice(0, Number.isNaN(rounded) ? 5 : Math.max(0, rounded));
  } get remaining() { return this.items.length - this.visibleItems.length; } }
@Component({selector: 'hw-data-table', standalone: true, imports: [NgTemplateOutlet], host: forwardedAriaHost, template: `<div class="hw-table-wrap hw-data-table" tabindex="0" role="region" [attr.aria-labelledby]="captionId"><table class="hw-table" [attr.data-variant]="variant" [attr.data-size]="size" [attr.aria-label]="ariaLabel" [attr.aria-labelledby]="ariaLabelledby" [attr.aria-describedby]="ariaDescribedby"><caption [id]="captionId">{{ caption }}</caption><thead><tr>@for (column of columns; track column.key) {<th scope="col" [attr.aria-sort]="sortKey === column.key ? sortDirection : (column.sortable ? 'none' : null)">@if (column.sortable) {<button type="button" [attr.aria-label]="getSortLabel ? getSortLabel(column, nextDirection(column.key)) || null : null" (click)="sort(column.key)">{{ column.label }}<span class="hw-icon" data-size="sm" aria-hidden="true" [attr.data-icon]="sortKey === column.key ? (sortDirection === 'ascending' ? 'arrow-up-02' : 'arrow-down-02') : 'arrow-data-transfer-vertical'"></span></button>} @else {<ng-container>{{ column.label }}</ng-container>}</th>}</tr></thead><tbody>@for (row of sortedRows; track trackRow($index, row); let index = $index) {<tr>${tableCells}</tr>} @empty {<tr><td [attr.colspan]="columns.length || 1">{{ texts.need('emptyMessage', emptyMessage) }}</td></tr>}</tbody></table></div>${tableCell}`})
export class HwDataTableComponent<Row extends HwDataRow = HwDataRow> {
  protected readonly captionId = injectId('hw-data-table-caption');
  protected readonly cellTemplate = cellTemplate;
  /** Written on the host, these reach the table; the host keeps none of them. */
  @Input({alias: 'aria-label'}) ariaLabel: string | null = null;
  @Input({alias: 'aria-labelledby'}) ariaLabelledby: string | null = null;
  @Input({alias: 'aria-describedby'}) ariaDescribedby: string | null = null;
  /** Identity of a row for rendering; without it rows are tracked by index, and sorting rewrites the rows in place. */
  @Input() rowKey?: (row: Row, index: number) => string | number;
  trackRow(index: number, row: Row): string | number { return this.rowKey ? this.rowKey(row, index) : index; }
  @Input({required: true}) caption = ''; @Input() columns: readonly HwDataColumn<Row>[] = []; @Input() rows: readonly Row[] = []; /** BCP 47 tag handed to core sortRows. There is no default: without it the rows keep their source order. */ @Input({required: true}) locale = ''; /** Text of the single cell rendered when there are no rows. */ @Input({required: true}) emptyMessage = ''; @Input() sortKey = ''; @Input() sortDirection: 'ascending' | 'descending' = 'ascending'; @Output() readonly sortKeyChange = new EventEmitter<string>(); @Output() readonly sortDirectionChange = new EventEmitter<'ascending' | 'descending'>();
  @Input() variant?: 'default' | 'striped' | 'bordered';
  @Input() size?: 'sm' | 'md' | 'lg';
  /** Optional accessible name of a sort button; direction is the order the button will apply. Without it the button is named by the column label and aria-sort carries the state. */
  @Input() getSortLabel?: (column: HwDataColumn<Row>, direction: 'ascending' | 'descending') => string;
  protected readonly texts = new HwTexts('hw-data-table');
  nextDirection(key: string): 'ascending' | 'descending' { return this.sortKey === key && this.sortDirection === 'ascending' ? 'descending' : 'ascending'; }
  get sortedRows(): readonly Row[] { return this.sortKey && this.texts.need('locale', this.locale) ? sortRows(this.rows, this.sortKey, this.sortDirection, this.locale) : this.rows; }
  /** The key is reported when it changed, then the direction when it changed. */
  sort(key: string): void { const direction = this.nextDirection(key); if (this.sortKey !== key) { this.sortKey = key; this.sortKeyChange.emit(key); } if (this.sortDirection !== direction) { this.sortDirection = direction; this.sortDirectionChange.emit(direction); } }
}

// The input named title is not a native tooltip on the wrapper element.
// The Card anatomy: header with icon, category and title, body, footer with the one action. The icon region and the
// footer are always rendered, without white space, and the stylesheet hides an empty one: projection cannot be detected.
@Component({selector: 'hw-service-card', standalone: true, host: {'[attr.title]': 'null'}, template: `<article class="hw-card hw-service-card" [attr.data-variant]="variant"><header class="hw-card-header"><div class="hw-service-card-icon" aria-hidden="true"><ng-content select="[hwServiceIcon]" /></div><div>@if (category) {<span class="hw-badge" data-tone="neutral">{{ category }}</span>}<h3>{{ title }}</h3></div></header><div class="hw-card-body">@if (description) {<p>{{ description }}</p>}@if (metadata.length) {<dl class="hw-description-list">@for (item of metadata; track $index) {<div><dt>{{ item.term }}</dt><dd>{{ item.description }}</dd></div>}</dl>}<ng-content /></div><footer class="hw-card-footer"><ng-content select="[hwServiceAction]">@if (href) {<a class="hw-link" [href]="href">{{ texts.need('actionLabel', actionLabel, 'href is set and no [hwServiceAction] content is projected') }}</a>}</ng-content></footer></article>`})
export class HwServiceCardComponent {
  @Input({required: true}) title = '';
  /** Target of the packaged action link, which is rendered only when this is given and no [hwServiceAction] content is projected. */
  @Input() href = '';
  @Input() description = ''; @Input() category = '';
  /** Service facts, printed as the application wrote them, as one description list. */
  @Input() metadata: readonly HwDescription[] = [];
  /** The whole text and accessible name of the action link; nothing is appended to it. Required when href is given, unless [hwServiceAction] content replaces the link. */
  @Input() actionLabel = ''; @Input() variant = 'default'; protected readonly texts = new HwTexts('hw-service-card');
}
// The footer is always rendered, without white space, and the stylesheet hides it while no [hwServiceAction] content is projected.
@Component({selector: 'hw-service-details', standalone: true, imports: [NgTemplateOutlet], host: {'[attr.title]': 'null'}, template: `<article class="hw-service-details"><header><h2>{{ title }}</h2>@if (description) {<p>{{ description }}</p>}</header>@if (metadata.length) {<dl class="hw-description-list">@for (item of metadata; track $index) {<div><dt>{{ item.term }}</dt><dd>{{ item.description }}</dd></div>}</dl>}@if (requirements.length) {<section>@if (texts.need('requirementsLabel', requirementsLabel, 'requirements are given')) {<h3>{{ requirementsLabel }}</h3>}<ul>@for (requirement of requirements; track $index; let index = $index) {<li>@if (requirementTemplate) {<ng-container [ngTemplateOutlet]="requirementTemplate" [ngTemplateOutletContext]="{$implicit: requirement, index: index}" />} @else {<ng-container>{{ requirement }}</ng-container>}</li>}</ul></section>}<ng-content /><footer><ng-content select="[hwServiceAction]" /></footer></article>`})
export class HwServiceDetailsComponent {
  @Input({required: true}) title = ''; @Input() description = '';
  /** Service facts, printed as the application wrote them, as one description list. */
  @Input() metadata: readonly HwDescription[] = [];
  @Input() requirements: readonly string[] = [];
  /** Displays each requirement in its list item; the strings stay what is listed without it. */
  @Input() requirementTemplate?: TemplateRef<{$implicit: string; index: number}>;
  /** Heading of the requirements list. Required when requirements are given. */ @Input() requirementsLabel = ''; protected readonly texts = new HwTexts('hw-service-details');
}
export interface HwPortalNavItem extends HwLinkItem {
  groups?: readonly { label?: string; links: readonly HwLinkItem[] }[];
}
@Component({selector: 'hw-portal-header', standalone: true, imports: [NgTemplateOutlet], template: `<header class="hw-portal-header">
  @if (mainId) {<a class="hw-skip-link" [attr.href]="fragment(mainId)">{{ texts.need('skipLabel', skipLabel, 'mainId is set') }}</a>}
  <div class="hw-portal-notice"><ng-content select="[hwPortalNotice]" /></div>
  <ng-template #brandContent><ng-content select="[hwBrand]" />@if (brand) {<span>{{ brand }}</span>}</ng-template>@if (homeHref) {<a #brandElement class="hw-portal-brand" [attr.href]="homeHref" [attr.aria-label]="brandLabel || null"><ng-container [ngTemplateOutlet]="brandContent" /></a>} @else {<div #brandElement class="hw-portal-brand" [attr.role]="brandLabel ? 'img' : null" [attr.aria-label]="brandLabel || null"><ng-container [ngTemplateOutlet]="brandContent" /></div>}
  @if (links.length) {
    <button #menuToggle class="hw-button hw-portal-menu-toggle" type="button" [attr.aria-expanded]="open" [attr.aria-controls]="navigationId" (click)="toggleMenu()"><span class="hw-icon" [attr.data-icon]="open ? 'cancel-01' : 'menu-01'" aria-hidden="true"></span>{{ texts.need('menuLabel', menuLabel) }}</button>
    <nav [id]="navigationId" [attr.aria-label]="texts.need('navigationLabel', navigationLabel)" [attr.data-open]="open"><ul>
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
  /** An empty homeHref renders the brand as a div, not a link; brandLabel then gives it role="img" and its name. */
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
  /** The disclosure of the navigation below 48rem; above it the links are always visible. */
  @Input({transform: booleanAttribute}) open = false;
  @Output() readonly openChange = new EventEmitter<boolean>();
  private setOpen(next: boolean): void { if (this.open === next) return; this.open = next; this.openChange.emit(next); }
  branch?: HTMLDetailsElement;
  /** The branch heading under a press that has not produced its click yet: that click opens it and closes the others. */
  private pressed: HTMLElement | null = null;
  @ViewChild('menuToggle') menuToggle?: ElementRef<HTMLButtonElement>;
  private readonly host = inject(ElementRef<HTMLElement>);
  hasGroups(item: HwPortalNavItem) { return item.groups?.some(group => group.links.length); }
  hasCurrentChild(item: HwPortalNavItem) { return item.groups?.some(group => group.links.some(link => link.current)); }
  toggleBranch(event: MouseEvent, details: HTMLDetailsElement) {
    event.preventDefault();
    this.branch = this.branch === details ? undefined : details;
    this.pressed = null;
  }
  /** Closes the menu and the open branch, for example after a client-side route change. */
  close() { this.branch = undefined; this.setOpen(false); }
  /** Returns nothing: Angular cancels an event whose template listener returns false. */
  protected toggleMenu(): void { this.branch = undefined; this.setOpen(!this.open); }
  @HostListener('document:pointercancel') released() { this.pressed = null; }
  @HostListener('keydown', ['$event']) keydown(event: KeyboardEvent) {
    this.pressed = null;
    if (event.defaultPrevented || event.key !== 'Escape') return;
    if (this.branch?.isConnected) {
      event.preventDefault(); event.stopPropagation();
      const summary = this.branch.querySelector<HTMLElement>(':scope > summary');
      this.branch = undefined; summary?.focus();
    } else if (this.open) {
      event.preventDefault(); event.stopPropagation(); this.close(); this.menuToggle?.nativeElement.focus();
    }
  }
  @HostListener('document:pointerdown', ['$event']) outside(event: PointerEvent) {
    const target = event.target as Node;
    // A press on a branch heading closes nothing by itself: the heading would move away before its click.
    this.pressed = getPortalBranchSummary(event.target, this.host.nativeElement);
    if (!this.pressed && !this.branch?.contains(target)) this.branch = undefined;
    if (!this.host.nativeElement.contains(target)) this.setOpen(false);
  }
  @HostListener('focusout', ['$event']) focusout(event: FocusEvent) {
    const target = (event.relatedTarget ?? this.host.nativeElement.ownerDocument.activeElement) as Node | null;
    if (!this.pressed?.contains(target) && !this.branch?.contains(target)) this.branch = undefined;
    if (!this.host.nativeElement.contains(target)) this.setOpen(false);
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
/** A named group with two pressed-state choices, then a comment field and a submit button once a choice exists. Nothing is
 * sent anywhere: (valueChange) reports each change of the value and (feedback) the value at submit. An aria-label or
 * aria-labelledby written on the host names the group in place of `label`; the host keeps none of them. */
@Component({selector: 'hw-feedback', standalone: true, imports: [HwTextareaComponent], template: `<div class="hw-feedback" role="group" [attr.data-choice-variant]="choiceVariant" [attr.aria-label]="ariaLabel" [attr.aria-labelledby]="ariaLabelledby ?? (!ariaLabel && label ? id + '-label' : null)" [attr.aria-describedby]="ariaDescribedby">@if (question; as text) {<p [id]="id + '-label'">{{ text }}</p>}<div class="hw-feedback-actions"><button type="button" class="hw-button" data-variant="secondary" data-size="md" [disabled]="disabled" [attr.aria-pressed]="value.helpful === true" (click)="choose(true)"><span class="hw-icon hw-feedback-icon" data-icon="thumbs-up" aria-hidden="true"></span><span class="hw-feedback-label">{{ texts.need('yesLabel', yesLabel) }}</span></button><button type="button" class="hw-button" data-variant="secondary" data-size="md" [disabled]="disabled" [attr.aria-pressed]="value.helpful === false" (click)="choose(false)"><span class="hw-icon hw-feedback-icon" data-icon="thumbs-down" aria-hidden="true"></span><span class="hw-feedback-label">{{ texts.need('noLabel', noLabel) }}</span></button></div>@if (value.helpful !== null) {<div class="hw-feedback-comment"><hw-textarea [label]="texts.need('commentLabel', commentLabel) ?? ''" [value]="value.comment" [disabled]="disabled" (valueChange)="comment($event)" /><button type="button" class="hw-button" data-variant="primary" data-size="md" [disabled]="disabled" (click)="submit()">{{ texts.need('submitLabel', submitLabel) }}</button></div>}<p role="status">{{ sent ? texts.need('successMessage', successMessage) : '' }}</p><ng-content /></div>`})
export class HwFeedbackComponent extends HwNamedRoot {
  @Input() choiceVariant: 'text' | 'icon' | 'icon-text' = 'text';
  /** The two answers; the label of the comment field and the text of the submit button, shown once an answer exists; the status text after a submit. `label` is the question, which also names the group. */
  @Input({required: true}) yesLabel = ''; @Input({required: true}) noLabel = ''; @Input({required: true}) commentLabel = ''; @Input({required: true}) submitLabel = ''; @Input({required: true}) successMessage = '';
  protected readonly texts = new HwTexts('hw-feedback');
  /** helpful is null until an answer is chosen. */
  @Input() value: HwFeedbackValue = {helpful: null, comment: ''};
  @Input({transform: booleanAttribute}) disabled = false;
  @Output() readonly valueChange = new EventEmitter<HwFeedbackValue>();
  /** The value when the reader submits. */
  @Output() readonly feedback = new EventEmitter<HwFeedbackValue>();
  readonly id = injectId('hw-feedback');
  protected sent = false;
  protected get question(): string | null { return this.ariaLabel || this.ariaLabelledby ? this.label || null : this.texts.need('label', this.label); }
  private change(value: HwFeedbackValue): void { this.sent = false; this.value = value; this.valueChange.emit(value); }
  choose(helpful: boolean): void { if (!this.disabled && this.value.helpful !== helpful) this.change({...this.value, helpful}); }
  protected comment(comment: string): void { if (!this.disabled && comment !== this.value.comment) this.change({...this.value, comment}); }
  protected submit(): void { if (this.disabled) return; this.feedback.emit(this.value); this.sent = true; }
}
/** The host is the consent region: it carries role="region", is labelled by its heading and is hidden while closed. An
 * aria-label or aria-labelledby the application writes on the host replaces the reference to the heading. Nothing is persisted. */
@Component({selector: 'hw-cookie-consent', standalone: true, host: {class: 'hw-cookie-consent', '[attr.title]': 'null', '[attr.hidden]': "open ? null : ''", '[attr.data-variant]': 'variant'}, template: `@if (texts.need('title', title); as text) {<h2 [id]="titleId">{{ text }}</h2>}<p>{{ texts.need('description', description) }}</p>@if (policyHref) {<a class="hw-link" [href]="policyHref">{{ texts.need('policyLabel', policyLabel, 'policyHref is set') }}</a>}<ng-content /><div class="hw-button-group"><button type="button" class="hw-button" data-variant="primary" data-size="md" (click)="choose('accepted')">{{ texts.need('acceptLabel', acceptLabel) }}</button><button type="button" class="hw-button" data-variant="secondary" data-size="md" (click)="choose('rejected')">{{ texts.need('rejectLabel', rejectLabel) }}</button>@if (hasPreferencesListener()) {<button type="button" class="hw-button" data-variant="ghost" data-size="md" (click)="preferences.emit()">{{ texts.need('preferencesLabel', preferencesLabel, 'a preferences listener is bound') }}</button>}</div>`})
export class HwCookieConsentComponent implements DoCheck {
  protected readonly texts = new HwTexts('hw-cookie-consent');
  /** Heading and accessible name of the region. */
  @Input({required: true}) title = ''; @Input({required: true}) description = ''; @Input({required: true}) acceptLabel = ''; @Input({required: true}) rejectLabel = '';
  /** Text of the preferences button, which is rendered while a (preferences) listener is bound. */
  @Input() preferencesLabel = '';
  /** A policy link is rendered when policyHref is set, and then needs policyLabel. */
  @Input() policyHref = ''; @Input() policyLabel = '';
  /** The fixed banner at the block end of the viewport. */
  @Input() variant?: 'banner';
  protected readonly hasPreferencesListener = signal(false);
  @Input({transform: booleanAttribute}) open = true;
  @Output() readonly openChange = new EventEmitter<boolean>();
  @Output() readonly consent = new EventEmitter<HwConsentChoice>();
  @Output() readonly preferences: EventEmitter<void> = new HwObservedEmitter<void>(observed => this.hasPreferencesListener.set(observed));
  protected readonly titleId = injectId('hw-cookie-consent') + '-title';
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly role = injectHostAttribute('role'); private readonly labelledby = injectHostAttribute('aria-labelledby');
  private written: string | null = null;
  // The reference to the heading is written unless the application named the host; its own value is told apart from the application's.
  ngDoCheck(): void {
    const labelledby = this.host.getAttribute('aria-labelledby');
    const named = !!this.host.getAttribute('aria-label')?.trim() || (!!labelledby?.trim() && labelledby !== this.written);
    this.written = named || !this.title ? null : this.titleId;
    this.role.set('region'); this.labelledby.set(this.written);
  }
  protected choose(choice: HwConsentChoice): void { this.consent.emit(choice); this.open = false; this.openChange.emit(false); }
}
/** A section named by its visible heading (`label`), or by an aria-label or aria-labelledby written on the host, which the host
 * does not keep. The list is application state: (read) and (dismissed) report the item id and the application updates `items`.
 * After an action focus goes to the same control of the next item, else of the previous one, else to the section. */
@Component({selector: 'hw-notification-list', standalone: true, imports: [HwBadgeComponent], template: `<section #region class="hw-notification-list" [attr.tabindex]="hasReadListener() || hasDismissListener() ? -1 : null" [attr.aria-label]="ariaLabel" [attr.aria-labelledby]="ariaLabelledby ?? (!ariaLabel && label ? titleId : null)" [attr.aria-describedby]="ariaDescribedby">@if (heading; as text) {<h2 [id]="titleId">{{ text }}</h2>}@if (items.length) {<ul>@for (item of items; track item.id) {<li [attr.data-state]="item.read ? 'read' : 'unread'"><h3>@if (item.href) {<a class="hw-link" [href]="item.href">{{ item.title }}</a>} @else {<ng-container>{{ item.title }}</ng-container>}</h3>@if (!item.read && texts.need('unreadLabel', unreadLabel); as text) {<hw-badge [tone]="'info'">{{ text }}</hw-badge>}@if (item.description) {<p>{{ item.description }}</p>}@if (item.dateLabel) {<time [attr.datetime]="item.dateTime || null">{{ item.dateLabel }}</time>}@if (!item.read && hasReadListener()) {@if (texts.call('getMarkReadLabel', getMarkReadLabel, [item], 'a read listener is bound'); as text) {<button type="button" class="hw-button" data-variant="ghost" data-size="md" data-hw-mark-read (click)="act(read, item, $event)">{{ text }}</button>}}@if (hasDismissListener()) {<button type="button" class="hw-button" data-variant="ghost" data-size="md" data-hw-dismiss [attr.aria-label]="texts.call('getDismissLabel', getDismissLabel, [item], 'a dismissed listener is bound')" (click)="act(dismissed, item, $event)"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>}</li>}</ul>} @else {@if (texts.need('emptyMessage', emptyMessage); as text) {<p>{{ text }}</p>}}</section>`})
export class HwNotificationListComponent extends HwNamedRoot implements AfterViewChecked {
  /** Text of the paragraph shown in place of the list when it is empty; text of the badge on unread items. `label` is the visible heading. */
  @Input() items: readonly HwNotification[] = []; @Input({required: true}) emptyMessage = ''; @Input({required: true}) unreadLabel = '';
  /** Accessible name of an item's dismiss button, which is rendered while a (dismissed) listener is bound. */
  @Input() getDismissLabel?: (item: HwNotification) => string;
  /** Text of the button that marks an unread item read, which is rendered while a (read) listener is bound. */
  @Input() getMarkReadLabel?: (item: HwNotification) => string;
  protected readonly texts = new HwTexts('hw-notification-list');
  protected readonly titleId = injectId('hw-notification-list') + '-title';
  protected readonly hasDismissListener = signal(false);
  protected readonly hasReadListener = signal(false);
  @Output() readonly dismissed: EventEmitter<string> = new HwObservedEmitter<string>(observed => this.hasDismissListener.set(observed));
  @Output() readonly read: EventEmitter<string> = new HwObservedEmitter<string>(observed => this.hasReadListener.set(observed));
  @ViewChild('region') private region?: ElementRef<HTMLElement>;
  private pending?: () => void;
  protected get heading(): string | null { return this.ariaLabel || this.ariaLabelledby ? this.label || null : this.texts.need('label', this.label); }
  protected act(output: EventEmitter<string>, item: HwNotification, event: Event): void {
    const region = this.region?.nativeElement;
    this.pending = region ? prepareRemovalFocus(region, event.currentTarget as HTMLElement, {item: ':scope > ul > li', control: output === this.read ? '[data-hw-mark-read]' : '[data-hw-dismiss]', fallback: region}) : undefined;
    output.emit(item.id);
  }
  ngAfterViewChecked(): void { this.pending?.(); this.pending = undefined; }
}
