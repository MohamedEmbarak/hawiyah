import { booleanAttribute, Component, Directive, ElementRef, EventEmitter, HostListener, Input, Output, TemplateRef, inject, signal } from '@angular/core';
import type { AfterViewInit, DoCheck, OnChanges, OnDestroy } from '@angular/core';
import { createAccordionMotion } from '@hawiyah/core';
import type { AccordionMotion } from '@hawiyah/core';
import { NgTemplateOutlet } from '@angular/common';
import { HwObservedEmitter, injectIsBrowser } from './platform';
import { injectId } from './ids';
import { HwTexts } from './text';
import { forwardedAriaHost, hostHasName, injectHostAttribute } from './host-attributes';
import { HwNamedRoot } from './root-name';
import { cellTemplate, tableCell, tableCells } from './table-templates';

/** Native button keeps native form, keyboard, disabled and event semantics. A button is type="button" unless a type
 * is written; `type`, `disabled` and `loading` are inputs, so `[attr.type]`, `[attr.disabled]` and `[attr.aria-busy]`
 * bound on the element are not supported. On an anchor no type and no disabled attribute is written. */
@Directive({selector: 'button[hwButton],a[hwButton]', standalone: true, host: {'class': 'hw-button', '[attr.data-variant]': 'variant', '[attr.data-size]': 'size', '[attr.type]': "type ?? (native ? 'button' : null)", '[attr.disabled]': "native && (disabled || loading) ? '' : null"}})
export class HwButtonDirective implements DoCheck {
  @Input() variant: 'primary' | 'default' | 'secondary' | 'outline' | 'outline-white' | 'light' | 'danger' | 'ghost' | 'soft' | 'link' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  /** A loading button is natively disabled and has aria-busy="true"; keep its label and return focus when the operation ends. */
  @Input({transform: booleanAttribute}) loading = false;
  @Input({transform: booleanAttribute}) disabled = false;
  /** A native button is type="button" unless this says otherwise: write type="submit" on the button that submits. */
  @Input() type: string | null = null;
  protected readonly native = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === 'BUTTON';
  // Not a host binding: an aria-busy the application wrote stays while the button is not loading.
  private readonly busy = injectHostAttribute('aria-busy');
  ngDoCheck(): void { this.busy.set(this.loading ? 'true' : null); }
}

@Component({selector: 'hw-card', standalone: true, imports: [NgTemplateOutlet], host: forwardedAriaHost, template: `
  <ng-template #content><header class="hw-card-header"><ng-content select="[hwCardHeader]" /></header><div class="hw-card-body"><ng-content /></div><footer class="hw-card-footer"><ng-content select="[hwCardFooter]" /></footer></ng-template>
  @if (href !== undefined) {
    <a class="hw-card hw-card-action" [attr.href]="disabled ? null : href" [attr.target]="target" [attr.rel]="rel" [attr.data-variant]="variant" [attr.data-disabled]="disabled || null" [attr.aria-disabled]="disabled || null" [attr.role]="disabled ? 'link' : null" [attr.tabindex]="disabled ? -1 : null" [attr.aria-label]="ariaLabel" [attr.aria-labelledby]="ariaLabelledby" [attr.aria-describedby]="ariaDescribedby" (click)="guard($event)"><ng-container [ngTemplateOutlet]="content" /></a>
  } @else {
    <article class="hw-card" [attr.data-variant]="variant" [attr.data-disabled]="disabled || null" [attr.aria-label]="ariaLabel" [attr.aria-labelledby]="ariaLabelledby" [attr.aria-describedby]="ariaDescribedby" (click)="guard($event)"><ng-container [ngTemplateOutlet]="content" /></article>
  }`})
export class HwCardComponent {
  @Input() variant?: 'default' | 'flat' | 'elevated' | 'outlined' | 'ghost';
  /** Written on the host, these reach the article or the anchor; the host keeps none of them. */
  @Input({alias: 'aria-label'}) ariaLabel: string | null = null;
  @Input({alias: 'aria-labelledby'}) ariaLabelledby: string | null = null;
  @Input({alias: 'aria-describedby'}) ariaDescribedby: string | null = null;
  @Input() href: string | undefined;
  @Input() target: string | undefined;
  @Input() rel: string | undefined;
  @Input({transform: booleanAttribute}) disabled = false;
  guard(event: MouseEvent) { if (this.disabled) { event.preventDefault(); event.stopPropagation(); } }
}

/** The host is the badge: class, id and attributes written on it are on the styled element. */
@Component({selector: 'hw-badge', standalone: true, host: {class: 'hw-badge', '[attr.data-tone]': 'tone', '[attr.data-variant]': 'variant'}, template: `<ng-content />`})
export class HwBadgeComponent { @Input() variant?: 'soft' | 'outline' | 'dot'; @Input() tone: 'neutral' | 'success' | 'warning' | 'danger' | 'info' = 'neutral'; }

// The host is the alert. title is an input, not a native tooltip, and is removed from the host. role stays an input, so
// that a static role="status" and [role] both reach the binding; [attr.role] and [attr.data-variant] on hw-alert are not supported.
@Component({selector: 'hw-alert', standalone: true, host: {class: 'hw-alert', '[attr.title]': 'null', '[attr.data-tone]': 'tone', '[attr.data-variant]': 'variant', '[attr.role]': "role ?? (tone === 'danger' ? 'alert' : 'status')"}, template: `<div class="hw-alert-content">@if (title) {<strong>{{ title }}</strong>}<ng-content /></div>@if (hasDismissListener()) {<button type="button" class="hw-button hw-alert-dismiss" data-variant="ghost" data-size="md" [attr.aria-label]="texts.need('closeLabel', closeLabel, 'a dismissed listener is bound')" (click)="dismissed.emit()"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>}`})
export class HwAlertComponent {
  @Input() tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger' = 'info';
  @Input() variant?: 'default' | 'outline' | 'minimal';
  @Input() title = '';
  /** Without it a danger alert is role="alert" and every other tone role="status". */
  @Input() role?: 'alert' | 'status' | 'region' | 'group';
  /** Accessible name of the dismiss button, which is rendered while a (dismissed) listener is bound. */
  @Input() closeLabel = '';
  protected readonly hasDismissListener = signal(false);
  /** The alert does not remove itself: the application removes it and places focus. */
  @Output() readonly dismissed: EventEmitter<void> = new HwObservedEmitter<void>(observed => this.hasDismissListener.set(observed));
  protected readonly texts = new HwTexts('hw-alert');
}

/** `value` keys the item and is what (toggled) reports; `title` is plain text also when a title template displays the item. */
export interface HwAccordionItem { value: string; title: string; content?: string; open?: boolean }
@Directive({selector: 'details[hwAccordionOpen]', standalone: true, host: { '[attr.open]': 'initialOpen ? "" : null' }})
export class HwAccordionMotionDirective implements AfterViewInit, OnChanges, OnDestroy {
  private readonly element = inject<ElementRef<HTMLDetailsElement>>(ElementRef).nativeElement;
  private readonly browser = injectIsBrowser();
  private motion?: AccordionMotion;
  private localOpen = false;
  initialOpen = false;
  @Input() hwAccordionOpen: boolean | undefined;
  @Input() hwAccordionGroup: string | undefined;
  @Output() readonly hwAccordionChange = new EventEmitter<boolean>();
  private get desired() { return this.localOpen; }
  private change = (open: boolean) => {
    this.localOpen = open; this.motion?.setOpen(open);
    this.hwAccordionChange.emit(open);
  };
  ngAfterViewInit() { this.setupMotion(); }
  ngOnChanges(changes: import('@angular/core').SimpleChanges) {
    if (changes['hwAccordionOpen']) this.localOpen = this.hwAccordionOpen ?? false;
    if (!this.motion) this.initialOpen = this.desired;
    else if (this.hwAccordionGroup !== this.group) this.setupMotion();
    else this.motion.setOpen(this.desired);
  }
  private group?: string;
  private setupMotion() {
    this.motion?.destroy(); this.group = this.hwAccordionGroup;
    if (this.group) this.element.setAttribute('name', this.group); else this.element.removeAttribute('name');
    // A server render keeps native details semantics; motion starts with hydration.
    if (!this.browser) return;
    this.motion = createAccordionMotion(this.element, this.element.querySelector<HTMLElement>(':scope > .hw-accordion-content')!, this.change);
    this.motion.setOpen(this.desired, true);
  }
  @HostListener('click', ['$event']) click(event: MouseEvent) {
    const target = event.target as Element;
    if (target.closest('summary')?.parentElement !== this.element) return;
    if (target.closest('a,button,input,select,textarea')) return;
    event.preventDefault(); this.change(!this.desired);
  }
  @HostListener('toggle') toggle() { this.motion?.nativeToggle(); }
  ngOnDestroy() { this.motion?.destroy(); }
}
@Component({selector: 'hw-accordion', standalone: true, imports: [HwAccordionMotionDirective, NgTemplateOutlet], host: forwardedAriaHost, template: `<div class="hw-accordion" [attr.role]="ariaLabel || ariaLabelledby ? 'group' : null" [attr.aria-label]="ariaLabel" [attr.aria-labelledby]="ariaLabelledby" [attr.aria-describedby]="ariaDescribedby">@for (item of items; track item.value; let index = $index) {<details class="hw-accordion-item" [hwAccordionOpen]="item.open" [hwAccordionGroup]="exclusive ? groupName : undefined" (hwAccordionChange)="toggled.emit({value: item.value, open: $event})"><summary class="hw-accordion-trigger">@if (titleTemplate) {<ng-container [ngTemplateOutlet]="titleTemplate" [ngTemplateOutletContext]="{$implicit: item, index: index}" />} @else {<ng-container>{{ item.title }}</ng-container>}</summary><div class="hw-accordion-content">@if (contentTemplate) {<ng-container [ngTemplateOutlet]="contentTemplate" [ngTemplateOutletContext]="{$implicit: item, index: index}" />} @else {<ng-container>{{ item.content }}</ng-container>}</div></details>}<ng-content /></div>`})
export class HwAccordionComponent {
  @Input() items: readonly HwAccordionItem[] = [];
  /** Displays the title of each item in its summary; it must render text, which names the summary. */
  @Input() titleTemplate?: TemplateRef<{$implicit: HwAccordionItem; index: number}>;
  /** Displays the content of each item. */
  @Input() contentTemplate?: TemplateRef<{$implicit: HwAccordionItem; index: number}>;
  /** Written on the host, these name and describe the accordion as a group; the host keeps none of them. */
  @Input({alias: 'aria-label'}) ariaLabel: string | null = null;
  @Input({alias: 'aria-labelledby'}) ariaLabelledby: string | null = null;
  @Input({alias: 'aria-describedby'}) ariaDescribedby: string | null = null;
  @Input({transform: booleanAttribute}) exclusive = false;
  @Input() groupName = injectId('hw-accordion');
  @Output() readonly toggled = new EventEmitter<{value: string; open: boolean}>();
}

export type HwTableRow = Record<string, unknown>;
/** `label` is the plain heading of the column; `cell` displays the cell of each row in place of the row value as text. */
export interface HwTableColumn<Row = HwTableRow> { key: string; label: string; rowHeader?: boolean; cell?: TemplateRef<{$implicit: Row; index: number; column: HwTableColumn<Row>}> }
@Component({selector: 'hw-table', standalone: true, imports: [NgTemplateOutlet], host: forwardedAriaHost, template: `<div class="hw-table-wrap" tabindex="0" [attr.role]="caption ? 'region' : null" [attr.aria-labelledby]="caption ? captionId : null"><table class="hw-table" [attr.data-variant]="variant" [attr.data-size]="size" [attr.aria-label]="ariaLabel" [attr.aria-labelledby]="ariaLabelledby" [attr.aria-describedby]="ariaDescribedby">@if (caption) {<caption [id]="captionId">{{ caption }}</caption>}<thead><tr>@for (column of columns; track column.key) {<th scope="col">{{ column.label }}</th>}</tr></thead><tbody>@for (row of rows; track trackRow($index, row); let index = $index) {<tr>${tableCells}</tr>} @empty {<tr><td [attr.colspan]="columns.length || 1">{{ texts.need('emptyMessage', emptyMessage) }}</td></tr>}</tbody></table></div>${tableCell}`})
export class HwTableComponent<Row extends HwTableRow = HwTableRow> implements DoCheck {
  /** Visible caption and name of the table. Required unless aria-label or aria-labelledby names the table. */
  @Input() caption = '';
  protected readonly captionId = injectId('hw-table-caption');
  protected readonly cellTemplate = cellTemplate;
  /** Written on the host, these reach the table; the host keeps none of them. */
  @Input({alias: 'aria-label'}) ariaLabel: string | null = null;
  @Input({alias: 'aria-labelledby'}) ariaLabelledby: string | null = null;
  @Input({alias: 'aria-describedby'}) ariaDescribedby: string | null = null;
  ngDoCheck(): void { if (!this.ariaLabel && !this.ariaLabelledby) this.texts.need('caption', this.caption); }
  @Input() columns: readonly HwTableColumn<Row>[] = [];
  @Input() rows: readonly Row[] = [];
  /** Identity of a row for rendering; without it rows are tracked by index. */
  @Input() rowKey?: (row: Row, index: number) => string | number;
  trackRow(index: number, row: Row): string | number { return this.rowKey ? this.rowKey(row, index) : index; }
  @Input() variant?: 'default' | 'striped' | 'bordered';
  @Input() size?: 'sm' | 'md' | 'lg';
  /** Text of the single cell rendered when there are no rows. */
  @Input({required: true}) emptyMessage = '';
  protected readonly texts = new HwTexts('hw-table');
}

/** One native progress element named through aria-label: an aria-label or aria-labelledby written on the host, else `label`.
 * No visible label is rendered. Values are written as given; without a value the element is indeterminate. */
@Component({selector: 'hw-progress', standalone: true, template: `<progress class="hw-progress" [attr.value]="value" [attr.max]="max" [attr.data-size]="size" [attr.aria-label]="rootName" [attr.aria-labelledby]="ariaLabelledby" [attr.aria-describedby]="ariaDescribedby"></progress>`})
export class HwProgressComponent extends HwNamedRoot {
  @Input() value: number | null = null;
  @Input() max = 100;
  @Input() size?: 'sm' | 'lg';
  protected readonly texts = new HwTexts('hw-progress');
}

/** The host is the skeleton, which is decorative: size it with style or class on the element. */
@Component({selector: 'hw-skeleton', standalone: true, host: {class: 'hw-skeleton', 'aria-hidden': 'true', '[attr.data-variant]': 'variant'}, template: ''})
export class HwSkeletonComponent {
  @Input() variant?: 'text' | 'circle';
}

/** The host is the spinner, a status that contains its visually hidden name. */
@Component({selector: 'hw-spinner', standalone: true, host: {class: 'hw-spinner', role: 'status', '[attr.data-size]': 'size'}, template: `@if (name; as text) {<span class="hw-sr-only">{{ text }}</span>}`})
export class HwSpinnerComponent {
  /** Accessible name. Required unless the host carries aria-label or aria-labelledby, or aria-hidden="true" for a decorative spinner beside visible text. */
  @Input() label = '';
  @Input() size?: 'sm' | 'lg';
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly texts = new HwTexts('hw-spinner');
  protected get name(): string | null { return this.host.getAttribute('aria-hidden') === 'true' || hostHasName(this.host) ? this.label || null : this.texts.need('label', this.label); }
}

/** The host is the avatar. While no image is shown it is role="img" named by `name`. */
@Component({selector: 'hw-avatar', standalone: true, host: {class: 'hw-avatar', '[attr.data-size]': 'size', '[attr.data-variant]': 'variant'}, template: `@if (src && !imageFailed) {<img [src]="src" [alt]="name" (error)="imageFailed = true">} @else {<span aria-hidden="true">{{ initials }}</span>}`})
export class HwAvatarComponent implements DoCheck {
  @Input({required: true}) name = '';
  @Input() size?: 'sm' | 'md' | 'lg' | 'xl' | '40' | '64' | '80' | '120';
  @Input() variant?: 'circle' | 'square';
  private suppliedInitials: string | undefined;
  @Input() set initials(value: string | undefined) { this.suppliedInitials = value; }
  private imageSrc = '';
  @Input() set src(value: string) { this.imageSrc = value; this.imageFailed = false; }
  get src(): string { return this.imageSrc; }
  imageFailed = false;
  get initials(): string { return this.suppliedInitials ?? this.name.trim().split(/\s+/u).slice(0, 2).map(part => Array.from(part)[0] ?? '').join(''); }
  // Not host bindings: the role and name an application wrote come back while the image is shown.
  private readonly roleAttribute = injectHostAttribute('role');
  private readonly nameAttribute = injectHostAttribute('aria-label');
  ngDoCheck(): void { const image = !!this.src && !this.imageFailed; this.roleAttribute.set(image ? null : 'img'); this.nameAttribute.set(image ? null : this.name); }
}

@Component({selector: 'hw-divider', standalone: true, template: `<hr class="hw-divider" [attr.data-tone]="tone" [attr.aria-orientation]="orientation">`})
export class HwDividerComponent {
  @Input() tone?: 'neutral' | 'primary' | 'gold' | 'tertiary';
  @Input() orientation?: 'horizontal' | 'vertical';
}

/** The host is the empty state. [hwEmptyIcon] projects a decorative icon before the title, [hwEmptyAction] an action after the content.
 * The icon region is always rendered, without whitespace, and the stylesheet hides it while it is empty. */
@Component({selector: 'hw-empty-state', standalone: true, host: {class: 'hw-empty', '[attr.title]': 'null'}, template: `<span class="hw-empty-icon" aria-hidden="true"><ng-content select="[hwEmptyIcon]" /></span><h3>{{ title }}</h3>@if (description) {<p>{{ description }}</p>}<ng-content /><ng-content select="[hwEmptyAction]" />`})
export class HwEmptyStateComponent {
  @Input({required: true}) title = '';
  @Input() description = '';
}
