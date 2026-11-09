import { booleanAttribute, Component, Directive, ElementRef, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';
import type { AfterViewInit, OnChanges, OnDestroy } from '@angular/core';
import { createAccordionMotion } from '@hawiyah/core';
import type { AccordionMotion } from '@hawiyah/core';
import { NgTemplateOutlet } from '@angular/common';

/** Native button keeps native form, keyboard, disabled and event semantics. */
@Directive({selector: 'button[hwButton],a[hwButton]', standalone: true, host: {'class': 'hw-button', '[attr.data-variant]': 'variant', '[attr.data-size]': 'size'}})
export class HwButtonDirective {
  @Input() variant: 'primary' | 'default' | 'secondary' | 'outline' | 'outline-white' | 'light' | 'danger' | 'ghost' | 'soft' | 'link' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
}

@Component({selector: 'hw-card', standalone: true, imports: [NgTemplateOutlet], template: `
  <ng-template #content><header class="hw-card-header"><ng-content select="[hwCardHeader]" /></header><div class="hw-card-body"><ng-content /></div><footer class="hw-card-footer"><ng-content select="[hwCardFooter]" /></footer></ng-template>
  @if (href !== undefined) {
    <a class="hw-card hw-card-action" [attr.href]="disabled ? null : href" [attr.target]="target" [attr.rel]="rel" [attr.data-variant]="variant" [attr.data-disabled]="disabled || null" [attr.aria-disabled]="disabled || null" [attr.role]="disabled ? 'link' : null" [attr.tabindex]="disabled ? -1 : null" (click)="guard($event)"><ng-container [ngTemplateOutlet]="content" /></a>
  } @else {
    <article class="hw-card" [attr.data-variant]="variant" [attr.data-disabled]="disabled || null" (click)="guard($event)"><ng-container [ngTemplateOutlet]="content" /></article>
  }`})
export class HwCardComponent {
  @Input() variant: 'default' | 'flat' | 'elevated' | 'outlined' | 'ghost' = 'default';
  @Input() href: string | undefined;
  @Input() target: string | undefined;
  @Input() rel: string | undefined;
  @Input({transform: booleanAttribute}) disabled = false;
  guard(event: MouseEvent) { if (this.disabled) { event.preventDefault(); event.stopPropagation(); } }
}

@Component({selector: 'hw-badge', standalone: true, template: `<span class="hw-badge" [attr.data-tone]="tone" [attr.data-variant]="variant"><ng-content /></span>`})
export class HwBadgeComponent { @Input() variant: 'soft' | 'outline' | 'dot' = 'soft'; @Input() tone: 'neutral' | 'success' | 'warning' | 'danger' | 'info' = 'neutral'; }

@Component({selector: 'hw-alert', standalone: true, template: `<div class="hw-alert" [attr.data-tone]="tone" [attr.data-variant]="variant" [attr.role]="role"><div class="hw-alert-content">@if (title) {<strong>{{ title }}</strong>}<ng-content /></div>@if (dismissible) {<button class="hw-button" data-variant="ghost" type="button" [attr.aria-label]="closeLabel" (click)="dismissed.emit()">×</button>}</div>`})
export class HwAlertComponent {
  @Input() tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger' = 'info';
  @Input() variant: 'default' | 'outline' | 'minimal' = 'default';
  @Input() title = '';
  @Input() role: 'alert' | 'status' | 'region' | 'group' = 'status';
  @Input({transform: booleanAttribute}) dismissible = false;
  @Input() closeLabel = 'Dismiss';
  @Output() readonly dismissed = new EventEmitter<void>();
}

let nextAccordionId = 0;
export interface HwAccordionItem { id: string; title: string; content: string; open?: boolean }
@Directive({selector: 'details[hwAccordionOpen]', standalone: true, host: { '[attr.open]': 'initialOpen ? "" : null' }})
export class HwAccordionMotionDirective implements AfterViewInit, OnChanges, OnDestroy {
  private readonly element = inject<ElementRef<HTMLDetailsElement>>(ElementRef).nativeElement;
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
@Component({selector: 'hw-accordion', standalone: true, imports: [HwAccordionMotionDirective], template: `<div class="hw-accordion">@for (item of items; track item.id) {<details class="hw-accordion-item" [hwAccordionOpen]="item.open" [hwAccordionGroup]="exclusive ? groupName : undefined" (hwAccordionChange)="toggled.emit({id: item.id, open: $event})"><summary class="hw-accordion-trigger">{{ item.title }}</summary><div class="hw-accordion-content">{{ item.content }}</div></details>}<ng-content /></div>`})
export class HwAccordionComponent {
  @Input() items: readonly HwAccordionItem[] = [];
  @Input({transform: booleanAttribute}) exclusive = false;
  @Input() groupName = `hw-accordion-${++nextAccordionId}`;
  @Output() readonly toggled = new EventEmitter<{id: string; open: boolean}>();
}

export interface HwTableColumn { key: string; label: string; rowHeader?: boolean }
export type HwTableRow = Record<string, string | number | null | undefined>;
@Component({selector: 'hw-table', standalone: true, styles: [':host { display: block; min-inline-size: 0; max-inline-size: 100%; }'], template: `<div class="hw-table-wrap" tabindex="0" role="region" [attr.aria-label]="caption"><table class="hw-table" [attr.data-variant]="variant" [attr.data-size]="size"><caption>{{ caption }}</caption><thead><tr>@for (column of columns; track column.key) {<th scope="col">{{ column.label }}</th>}</tr></thead><tbody>@for (row of rows; track $index) {<tr>@for (column of columns; track column.key) {@if (column.rowHeader) {<th scope="row">{{ row[column.key] }}</th>} @else {<td>{{ row[column.key] }}</td>}}</tr>}@empty {<tr><td [attr.colspan]="columns.length || 1">{{ emptyMessage }}</td></tr>}</tbody></table></div>`})
export class HwTableComponent {
  @Input({required: true}) caption = '';
  @Input() columns: readonly HwTableColumn[] = [];
  @Input() rows: readonly HwTableRow[] = [];
  @Input() variant?: 'default' | 'striped' | 'bordered';
  @Input() size?: 'sm' | 'md' | 'lg';
  @Input() emptyMessage = 'لا توجد سجلات';
}

@Component({selector: 'hw-progress', standalone: true, template: `<label class="hw-stack"><span>{{ label }}</span><progress class="hw-progress" [attr.value]="value === null ? null : boundedValue" [max]="safeMax" [attr.aria-label]="label"></progress></label>`})
export class HwProgressComponent {
  @Input({required: true}) label = '';
  @Input() value: number | null = null;
  @Input() max = 100;
  get safeMax(): number { return this.max > 0 && Number.isFinite(this.max) ? this.max : 100; }
  get boundedValue(): number { return Math.max(0, Math.min(this.safeMax, this.value ?? 0)); }
}

@Component({selector: 'hw-skeleton', standalone: true, template: `<span class="hw-skeleton" aria-hidden="true" [style.inline-size]="width" [style.block-size]="height"></span>`})
export class HwSkeletonComponent {
  @Input() width = '100%';
  @Input() height = '1rem';
}

@Component({selector: 'hw-spinner', standalone: true, template: `<span role="status"><span class="hw-spinner" aria-hidden="true"></span><span class="hw-sr-only">{{ label }}</span></span>`})
export class HwSpinnerComponent { @Input() label = 'Loading'; }

@Component({selector: 'hw-avatar', standalone: true, template: `<span class="hw-avatar" [attr.data-size]="size" [attr.data-variant]="variant" [attr.role]="src && !imageFailed ? null : 'img'" [attr.aria-label]="src && !imageFailed ? null : name">@if (src && !imageFailed) {<img [src]="src" [alt]="name" (error)="imageFailed = true">} @else {<span aria-hidden="true">{{ initials }}</span>}</span>`})
export class HwAvatarComponent {
  @Input({required: true}) name = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | '40' | '64' | '80' | '120' = 'md';
  @Input() variant: 'circle' | 'square' = 'circle';
  private suppliedInitials: string | undefined;
  @Input() set initials(value: string | undefined) { this.suppliedInitials = value; }
  private imageSrc = '';
  @Input() set src(value: string) { this.imageSrc = value; this.imageFailed = false; }
  get src(): string { return this.imageSrc; }
  imageFailed = false;
  get initials(): string { return this.suppliedInitials ?? this.name.trim().split(/\s+/u).slice(0, 2).map(part => Array.from(part)[0] ?? '').join(''); }
}

@Component({selector: 'hw-divider', standalone: true, template: `<hr class="hw-divider" [attr.data-tone]="tone" [attr.aria-orientation]="orientation">`})
export class HwDividerComponent {
  @Input() tone?: 'neutral' | 'primary' | 'gold' | 'tertiary';
  @Input() orientation?: 'horizontal' | 'vertical';
}

@Component({selector: 'hw-empty-state', standalone: true, template: `<section class="hw-empty"><h3>{{ title }}</h3>@if (description) {<p>{{ description }}</p>}<ng-content /></section>`})
export class HwEmptyStateComponent {
  @Input({required: true}) title = '';
  @Input() description = '';
}
