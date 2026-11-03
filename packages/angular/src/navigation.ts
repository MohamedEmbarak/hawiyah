import { booleanAttribute, Component, ContentChildren, ElementRef, EventEmitter, Input, Output, QueryList, TemplateRef, ViewChild, ViewChildren, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { getDirection, getNextEnabledIndex, type Direction, type Orientation } from '@nasaq/core';

let nextId = 0;
@Component({ selector: 'nq-tab', standalone: true, template: `<ng-template #content><ng-content /></ng-template>` })
export class NqTabComponent {
  @Input({required: true}) value = '';
  @Input({required: true}) label = '';
  @Input({transform: booleanAttribute}) disabled = false;
  @ViewChild('content', {static: true}) content!: TemplateRef<unknown>;
}

@Component({ selector: 'nq-tabs', standalone: true, imports: [NgTemplateOutlet],
  template: `<div class="nq-tabs"><div class="nq-tab-list" role="tablist" [attr.aria-label]="label" [attr.aria-orientation]="orientation">@for (tab of tabs; track tab.value; let i = $index) {<button #tabButton class="nq-tab" type="button" role="tab" [id]="tabId(i)" [attr.aria-controls]="panelId(i)" [attr.aria-selected]="activeValue === tab.value" [disabled]="tab.disabled" [tabIndex]="focusValue === tab.value ? 0 : -1" (click)="select(tab.value)" (focus)="focusedValue = tab.value" (keydown)="keydown($event, i)">{{ tab.label }}</button>}</div>@for (tab of tabs; track tab.value; let i = $index) {<section class="nq-tab-panel" role="tabpanel" tabindex="0" [id]="panelId(i)" [attr.aria-labelledby]="tabId(i)" [hidden]="activeValue !== tab.value"><ng-container [ngTemplateOutlet]="tab.content" /></section>}<ng-content /></div>` })
export class NqTabsComponent {
  @Input() id = `nq-tabs-${++nextId}`;
  @Input({required: true}) label = '';
  @Input() value = '';
  @Input() orientation: Orientation = 'horizontal';
  @Input() direction?: Direction;
  @Input() activationMode: 'automatic' | 'manual' = 'automatic';
  @Output() readonly valueChange = new EventEmitter<string>();
  @ContentChildren(NqTabComponent) tabs!: QueryList<NqTabComponent>;
  @ViewChildren('tabButton') buttons!: QueryList<ElementRef<HTMLButtonElement>>;
  private readonly host = inject(ElementRef<HTMLElement>);
  focusedValue = '';
  get activeValue(): string { return this.tabs?.find(tab => tab.value === this.value && !tab.disabled)?.value ?? this.tabs?.find(tab => !tab.disabled)?.value ?? ''; }
  get focusValue(): string { return this.tabs?.find(tab => tab.value === this.focusedValue && !tab.disabled)?.value ?? this.activeValue; }
  tabId(index: number): string { return `${this.id}-tab-${index}`; }
  panelId(index: number): string { return `${this.id}-panel-${index}`; }
  select(value: string): void { if (!this.tabs.find(tab => tab.value === value && !tab.disabled)) return; this.value = value; this.focusedValue = value; this.valueChange.emit(value); }
  keydown(event: KeyboardEvent, index: number): void {
    const keys = this.orientation === 'vertical' ? ['ArrowUp', 'ArrowDown', 'Home', 'End'] : ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const next = getNextEnabledIndex(index, event.key, this.tabs.toArray(), this.direction ?? getDirection(this.host.nativeElement), this.orientation);
    const tab = this.tabs.get(next); if (!tab) return;
    this.focusedValue = tab.value; this.buttons.get(next)?.nativeElement.focus();
    if (this.activationMode === 'automatic') this.select(tab.value);
  }
}

export interface NqBreadcrumbItem { label: string; href?: string; disabled?: boolean }
@Component({ selector: 'nq-breadcrumb', standalone: true, template: `<nav class="nq-breadcrumb" [attr.aria-label]="label"><ol>@for (item of items; track $index; let last = $last) {<li>@if (item.href && !item.disabled && !last) {<a [href]="item.href">{{ item.label }}</a>} @else {<span [attr.role]="item.disabled ? 'link' : null" [attr.aria-disabled]="item.disabled || null" [attr.aria-current]="last ? 'page' : null">{{ item.label }}</span>}</li>}</ol></nav>` })
export class NqBreadcrumbComponent {
  @Input() label = 'مسار التنقل';
  @Input() items: readonly NqBreadcrumbItem[] = [];
}

@Component({ selector: 'nq-pagination', standalone: true, template: `<nav class="nq-pagination" [attr.aria-label]="label"><button class="nq-button" data-variant="secondary" type="button" [disabled]="current <= 1" (click)="select(current - 1)">{{ previousLabel }}</button>@for (item of pages; track $index) {@if (item === 0) {<span aria-hidden="true">…</span>} @else {<button class="nq-button" type="button" [attr.data-variant]="item === current ? 'primary' : 'ghost'" [attr.aria-current]="item === current ? 'page' : null" [attr.aria-label]="pageLabel(item)" (click)="select(item)">{{ item }}</button>}}<button class="nq-button" data-variant="secondary" type="button" [disabled]="current >= total" (click)="select(current + 1)">{{ nextLabel }}</button></nav>` })
export class NqPaginationComponent {
  @Input() label = 'Pagination';
  @Input() page = 1;
  @Input() totalPages = 1;
  @Input() previousLabel = 'Previous';
  @Input() nextLabel = 'Next';
  @Input() pageLabel: (page: number) => string = page => `Page ${page}`;
  @Output() readonly pageChange = new EventEmitter<number>();
  get total(): number { return Number.isFinite(this.totalPages) ? Math.max(1, Math.floor(this.totalPages)) : 1; }
  get current(): number { return Number.isFinite(this.page) ? Math.max(1, Math.min(this.total, Math.floor(this.page))) : 1; }
  get pages(): number[] {
    const visible = new Set([1, this.total, this.current - 1, this.current, this.current + 1]);
    const sorted = [...visible].filter(page => page >= 1 && page <= this.total).sort((a, b) => a - b);
    return sorted.flatMap((page, index) => index && page - sorted[index - 1]! > 1 ? [0, page] : [page]);
  }
  select(page: number): void { this.page = Math.max(1, Math.min(this.total, page)); this.pageChange.emit(this.page); }
}

export interface NqStep { label: string; description?: string; status?: 'complete' | 'current' | 'upcoming' }
@Component({ selector: 'nq-stepper', standalone: true, template: `<ol class="nq-stepper" [attr.aria-label]="label">@for (step of steps; track $index; let i = $index) {<li class="nq-step" [attr.aria-current]="state(i) === 'current' ? 'step' : null" [attr.data-state]="state(i)"><span>{{ step.label }}@if (step.description) {<small class="nq-hint">{{ step.description }}</small>}</span></li>}</ol>` })
export class NqStepperComponent {
  @Input() label = 'التقدم';
  @Input() steps: readonly NqStep[] = [];
  /** Zero-based current step. This is a progress indicator, not navigation. */
  @Input() current = 0;
  /** Overrides current. -1 means not started; steps.length means complete. */
  @Input() activeIndex?: number;
  state(index: number): 'complete' | 'current' | 'upcoming' {
    const requested = this.activeIndex ?? this.current;
    const active = Number.isInteger(requested) && requested >= -1 && requested <= this.steps.length ? requested : -1;
    return this.steps[index]?.status ?? (index === active ? 'current' : index < active ? 'complete' : 'upcoming');
  }
}
