import { booleanAttribute, Component, Directive, ElementRef, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';
import type { AfterViewInit, OnChanges, OnDestroy } from '@angular/core';
import { createAccordionMotion } from '@nasaq/core';
import type { AccordionMotion } from '@nasaq/core';

/** Native button keeps native form, keyboard, disabled and event semantics. */
@Directive({selector: 'button[nqButton],a[nqButton]', standalone: true, host: {'class': 'nq-button', '[attr.data-variant]': 'variant', '[attr.data-size]': 'size'}})
export class NqButtonDirective {
  @Input() variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
}

@Component({selector: 'nq-card', standalone: true, template: `<article class="nq-card"><header class="nq-card-header"><ng-content select="[nqCardHeader]" /></header><div class="nq-card-body"><ng-content /></div><footer class="nq-card-footer"><ng-content select="[nqCardFooter]" /></footer></article>`})
export class NqCardComponent {}

@Component({selector: 'nq-badge', standalone: true, template: `<span class="nq-badge" [attr.data-tone]="tone"><ng-content /></span>`})
export class NqBadgeComponent { @Input() tone: 'neutral' | 'success' | 'warning' | 'danger' | 'info' = 'neutral'; }

@Component({selector: 'nq-alert', standalone: true, template: `<div class="nq-alert" [attr.data-tone]="tone" [attr.role]="role"><div>@if (title) {<strong>{{ title }}</strong>}<ng-content /></div>@if (dismissible) {<button class="nq-button" data-variant="ghost" type="button" [attr.aria-label]="closeLabel" (click)="dismissed.emit()">×</button>}</div>`})
export class NqAlertComponent {
  @Input() tone: 'info' | 'success' | 'warning' | 'danger' = 'info';
  @Input() title = '';
  @Input() role: 'alert' | 'status' | 'region' = 'status';
  @Input({transform: booleanAttribute}) dismissible = false;
  @Input() closeLabel = 'Dismiss';
  @Output() readonly dismissed = new EventEmitter<void>();
}

let nextAccordionId = 0;
export interface NqAccordionItem { id: string; title: string; content: string; open?: boolean }
@Directive({selector: 'details[nqAccordionOpen]', standalone: true, host: { '[attr.open]': 'initialOpen ? "" : null' }})
export class NqAccordionMotionDirective implements AfterViewInit, OnChanges, OnDestroy {
  private readonly element = inject<ElementRef<HTMLDetailsElement>>(ElementRef).nativeElement;
  private motion?: AccordionMotion;
  private localOpen = false;
  initialOpen = false;
  @Input() nqAccordionOpen: boolean | undefined;
  @Input() nqAccordionGroup: string | undefined;
  @Output() readonly nqAccordionChange = new EventEmitter<boolean>();
  private get desired() { return this.localOpen; }
  private change = (open: boolean) => {
    this.localOpen = open; this.motion?.setOpen(open);
    this.nqAccordionChange.emit(open);
  };
  ngAfterViewInit() { this.setupMotion(); }
  ngOnChanges(changes: import('@angular/core').SimpleChanges) {
    if (changes['nqAccordionOpen']) this.localOpen = this.nqAccordionOpen ?? false;
    if (!this.motion) this.initialOpen = this.desired;
    else if (this.nqAccordionGroup !== this.group) this.setupMotion();
    else this.motion.setOpen(this.desired);
  }
  private group?: string;
  private setupMotion() {
    this.motion?.destroy(); this.group = this.nqAccordionGroup;
    if (this.group) this.element.setAttribute('name', this.group); else this.element.removeAttribute('name');
    this.motion = createAccordionMotion(this.element, this.element.querySelector<HTMLElement>(':scope > .nq-accordion-content')!, this.change);
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
@Component({selector: 'nq-accordion', standalone: true, imports: [NqAccordionMotionDirective], template: `<div class="nq-accordion">@for (item of items; track item.id) {<details class="nq-accordion-item" [nqAccordionOpen]="item.open" [nqAccordionGroup]="exclusive ? groupName : undefined" (nqAccordionChange)="toggled.emit({id: item.id, open: $event})"><summary class="nq-accordion-trigger">{{ item.title }}</summary><div class="nq-accordion-content">{{ item.content }}</div></details>}<ng-content /></div>`})
export class NqAccordionComponent {
  @Input() items: readonly NqAccordionItem[] = [];
  @Input({transform: booleanAttribute}) exclusive = false;
  @Input() groupName = `nq-accordion-${++nextAccordionId}`;
  @Output() readonly toggled = new EventEmitter<{id: string; open: boolean}>();
}

export interface NqTableColumn { key: string; label: string; rowHeader?: boolean }
export type NqTableRow = Record<string, string | number | null | undefined>;
@Component({selector: 'nq-table', standalone: true, template: `<div class="nq-table-wrap" tabindex="0" role="region" [attr.aria-label]="caption"><table class="nq-table"><caption>{{ caption }}</caption><thead><tr>@for (column of columns; track column.key) {<th scope="col">{{ column.label }}</th>}</tr></thead><tbody>@for (row of rows; track $index) {<tr>@for (column of columns; track column.key) {@if (column.rowHeader) {<th scope="row">{{ row[column.key] }}</th>} @else {<td>{{ row[column.key] }}</td>}}</tr>}@empty {<tr><td [attr.colspan]="columns.length || 1">{{ emptyMessage }}</td></tr>}</tbody></table></div>`})
export class NqTableComponent {
  @Input({required: true}) caption = '';
  @Input() columns: readonly NqTableColumn[] = [];
  @Input() rows: readonly NqTableRow[] = [];
  @Input() emptyMessage = 'No records';
}

@Component({selector: 'nq-progress', standalone: true, template: `<label class="nq-stack"><span>{{ label }}</span><progress class="nq-progress" [attr.value]="value === null ? null : boundedValue" [max]="safeMax" [attr.aria-label]="label"></progress></label>`})
export class NqProgressComponent {
  @Input({required: true}) label = '';
  @Input() value: number | null = null;
  @Input() max = 100;
  get safeMax(): number { return this.max > 0 && Number.isFinite(this.max) ? this.max : 100; }
  get boundedValue(): number { return Math.max(0, Math.min(this.safeMax, this.value ?? 0)); }
}

@Component({selector: 'nq-skeleton', standalone: true, template: `<span class="nq-skeleton" aria-hidden="true" [style.inline-size]="width" [style.block-size]="height"></span>`})
export class NqSkeletonComponent {
  @Input() width = '100%';
  @Input() height = '1rem';
}

@Component({selector: 'nq-spinner', standalone: true, template: `<span role="status"><span class="nq-spinner" aria-hidden="true"></span><span class="nq-sr-only">{{ label }}</span></span>`})
export class NqSpinnerComponent { @Input() label = 'Loading'; }

@Component({selector: 'nq-avatar', standalone: true, template: `<span class="nq-avatar" [attr.role]="src && !imageFailed ? null : 'img'" [attr.aria-label]="src && !imageFailed ? null : name">@if (src && !imageFailed) {<img [src]="src" [alt]="name" (error)="imageFailed = true">} @else {<span aria-hidden="true">{{ initials }}</span>}</span>`})
export class NqAvatarComponent {
  @Input({required: true}) name = '';
  private imageSrc = '';
  @Input() set src(value: string) { this.imageSrc = value; this.imageFailed = false; }
  get src(): string { return this.imageSrc; }
  imageFailed = false;
  get initials(): string { return this.name.trim().split(/\s+/u).slice(0, 2).map(part => Array.from(part)[0] ?? '').join(''); }
}

@Component({selector: 'nq-divider', standalone: true, template: `<hr class="nq-divider">`})
export class NqDividerComponent {}

@Component({selector: 'nq-empty-state', standalone: true, template: `<section class="nq-empty"><h3>{{ title }}</h3>@if (description) {<p>{{ description }}</p>}<ng-content /></section>`})
export class NqEmptyStateComponent {
  @Input({required: true}) title = '';
  @Input() description = '';
}
