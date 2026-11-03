import { booleanAttribute, ChangeDetectorRef, Component, ContentChildren, ElementRef, EventEmitter, Input, Output, QueryList, TemplateRef, ViewChild, ViewChildren, inject } from '@angular/core';
import { observeAngularFieldPresence } from './field-presence';
import { NgTemplateOutlet } from '@angular/common';
import { getDirection, getNextEnabledIndex, getPaginationItems, normalizePaginationPage, normalizePaginationTotal, observeTabOverflow, type Direction, type Orientation } from '@nasaq/core';

let nextId = 0;
@Component({ selector: 'nq-tab', standalone: true, template: `<ng-template #content><ng-content /></ng-template>` })
export class NqTabComponent {
  @Input({required: true}) value = '';
  @Input({required: true}) label = '';
  @Input({transform: booleanAttribute}) disabled = false;
  @ViewChild('content', {static: true}) content!: TemplateRef<unknown>;
  /** Notify the owning tabset when projected input state changes. */
  readonly stateChanges = new EventEmitter<void>();
  ngOnChanges(): void {this.stateChanges.emit();}
}

@Component({ selector: 'nq-tabs', standalone: true, imports: [NgTemplateOutlet],
  template: `<div class="nq-tabs"><div #tabBar class="nq-tab-bar" [attr.data-nq-overflow]="overflow" [attr.data-orientation]="orientation">
  <div class="nq-tab-list" [attr.data-nq-overflow]="overflow" role="tablist" [attr.aria-label]="label" [attr.aria-orientation]="orientation" [attr.aria-hidden]="hiddenTabs.length === tabs?.length || null">@for (tab of tabs; track tab.value; let i = $index) {<button #tabButton class="nq-tab" type="button" role="tab" [id]="tabId(i)" [attr.aria-controls]="panelId(i)" [attr.aria-selected]="activeValue === tab.value" [attr.data-nq-overflow-hidden]="hiddenTabs.includes(i) ? 'true' : null" [attr.aria-hidden]="hiddenTabs.includes(i) || null" [disabled]="tab.disabled" [tabIndex]="!hiddenTabs.includes(i) && focusValue === tab.value ? 0 : -1" (click)="select(tab.value)" (focus)="focusedValue = tab.value" (keydown)="keydown($event, i)">{{ tab.label }}</button>}</div>
  <details #overflowDetails class="nq-tabs-overflow" [hidden]="!hiddenTabs.length" (keydown)="overflowKey($event)"><summary class="nq-tab-overflow-trigger" [attr.aria-label]="overflowLabel" [attr.data-active]="overflowActive || null">…</summary><div class="nq-tab-overflow-menu">@for (i of hiddenTabs; track i) {@if (tabs.get(i); as tab) {<button type="button" class="nq-tab-overflow-item" [attr.data-nq-overflow-value]="tab.value" [disabled]="tab.disabled" [attr.aria-pressed]="tab.value === activeValue" (click)="overflowSelect(tab.value)">{{ tab.label }}</button>}}</div></details>
  </div>@for (tab of tabs; track tab.value; let i = $index) {<section class="nq-tab-panel" role="tabpanel" tabindex="0" [id]="panelId(i)" [attr.aria-labelledby]="tabId(i)" [hidden]="activeValue !== tab.value"><ng-container [ngTemplateOutlet]="tab.content" /></section>}<ng-content /></div>` })
export class NqTabsComponent {
  @Input() id = `nq-tabs-${++nextId}`;
  @Input({required: true}) label = '';
  @Input() value = '';
  @Input() orientation: Orientation = 'horizontal';
  @Input() direction?: Direction;
  @Input() activationMode: 'automatic' | 'manual' = 'automatic';
  @Input() overflow: 'menu' | 'scroll' = 'menu';
  @Input() overflowLabel = 'المزيد من التبويبات';
  @Output() readonly valueChange = new EventEmitter<string>();
  @ContentChildren(NqTabComponent) tabs!: QueryList<NqTabComponent>;
  @ViewChildren('tabButton') buttons!: QueryList<ElementRef<HTMLButtonElement>>;
  @ViewChild('tabBar') tabBar?: ElementRef<HTMLElement>;
  @ViewChild('overflowDetails') overflowDetails?: ElementRef<HTMLDetailsElement>;
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private overflowObserver?: ReturnType<typeof observeTabOverflow>;
  private pendingFocus?: {kind: 'summary' | 'tab' | 'menu'; value?: string};
  private previousActive = '';
  private tabSubscriptions: Array<{unsubscribe(): void}> = [];
  private tabsSubscription?: {unsubscribe(): void};
  private outside = (event: Event) => {if (!this.tabBar?.nativeElement.contains(event.target as Node)) this.closeOverflow();};
  hiddenTabs: number[] = [];
  focusedValue = '';
  get activeValue(): string { return this.tabs?.find(tab => tab.value === this.value && !tab.disabled)?.value ?? this.tabs?.find(tab => !tab.disabled)?.value ?? ''; }
  get focusValue(): string { const visible = this.tabs?.filter((tab, index) => !tab.disabled && !this.hiddenTabs.includes(index)) ?? []; return visible.find(tab => tab.value === this.focusedValue)?.value ?? visible.find(tab => tab.value === this.activeValue)?.value ?? visible[0]?.value ?? ''; }
  get overflowActive(): boolean {return this.hiddenTabs.some(index => this.tabs?.get(index)?.value === this.activeValue);}
  ngAfterContentInit(): void {
    const bind = () => {
      this.tabSubscriptions.forEach(subscription => subscription.unsubscribe());
      this.tabSubscriptions = this.tabs.map(tab => tab.stateChanges.subscribe(() => {this.changeDetector.markForCheck();this.overflowObserver?.refresh();}));
      this.changeDetector.markForCheck(); this.overflowObserver?.refresh();
    };
    bind(); this.tabsSubscription = this.tabs.changes.subscribe(bind);
  }
  ngAfterViewInit(): void {
    const node = this.tabBar!.nativeElement;
    this.overflowObserver = observeTabOverflow({container: node, tabs: () => this.buttons.toArray().map(button => button.nativeElement), enabled: () => this.overflow === 'menu' && this.orientation === 'horizontal', onChange: next => {
      const focusedElement = node.ownerDocument.activeElement;
      const menuValue = (focusedElement as HTMLElement | null)?.dataset.nqOverflowValue;
      const itemIndex = this.tabs.toArray().findIndex(tab => tab.value === menuValue);
      if (menuValue !== undefined && itemIndex >= 0 && next.includes(itemIndex)) this.pendingFocus = {kind:'menu',value:menuValue};
      else {
        if (menuValue !== undefined && itemIndex >= 0) this.pendingFocus = {kind:'tab',value:menuValue};
        else if (next.some(index => this.buttons.get(index)?.nativeElement === focusedElement)) this.pendingFocus = {kind:'summary'};
        else if (this.overflowDetails?.nativeElement.contains(focusedElement)) this.pendingFocus = {kind:next.length ? 'summary' : 'tab'};
        this.closeOverflow();
      }
      this.hiddenTabs = next; this.changeDetector.markForCheck();
    }});
    node.ownerDocument.addEventListener('click', this.outside);
  }
  ngAfterViewChecked(): void {
    this.overflowObserver?.refresh();
    if (this.previousActive !== this.activeValue) {this.previousActive = this.activeValue; this.closeOverflow();}
    const destination = this.pendingFocus; this.pendingFocus = undefined;
    if (destination?.kind === 'summary') this.overflowDetails?.nativeElement.querySelector('summary')?.focus();
    else if (destination?.kind === 'tab') this.buttons?.get(this.tabs.toArray().findIndex(tab => tab.value === (destination.value ?? this.focusValue)))?.nativeElement.focus();
    else if (destination?.kind === 'menu') [...(this.overflowDetails?.nativeElement.querySelectorAll<HTMLElement>('[data-nq-overflow-value]') ?? [])].find(button => button.dataset.nqOverflowValue === destination.value)?.focus();
    else {const focusedElement = this.host.nativeElement.ownerDocument.activeElement; if (focusedElement?.getAttribute('data-nq-overflow-hidden') === 'true' && this.tabBar?.nativeElement.contains(focusedElement)) this.overflowDetails?.nativeElement.querySelector('summary')?.focus();}
  }
  ngOnDestroy(): void {this.overflowObserver?.destroy();this.tabsSubscription?.unsubscribe();this.tabSubscriptions.forEach(subscription => subscription.unsubscribe()); this.host.nativeElement.ownerDocument.removeEventListener('click', this.outside);}
  closeOverflow(): void {if (this.overflowDetails) this.overflowDetails.nativeElement.open = false;}
  overflowSelect(value: string): void {if (!this.tabs.find(tab => tab.value === value && !tab.disabled)) return; this.select(value); this.closeOverflow(); this.overflowDetails?.nativeElement.querySelector('summary')?.focus();}
  overflowKey(event: KeyboardEvent): void {if (event.key === 'Escape' && this.overflowDetails?.nativeElement.open) {event.preventDefault(); this.closeOverflow(); this.overflowDetails.nativeElement.querySelector('summary')?.focus();}}
  tabId(index: number): string { return `${this.id}-tab-${index}`; }
  panelId(index: number): string { return `${this.id}-panel-${index}`; }
  select(value: string): void { if (!this.tabs.find(tab => tab.value === value && !tab.disabled)) return; this.value = value; this.focusedValue = value; this.valueChange.emit(value); }
  keydown(event: KeyboardEvent, index: number): void {
    if (event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
    const keys = this.orientation === 'vertical' ? ['ArrowUp', 'ArrowDown', 'Home', 'End'] : ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const next = getNextEnabledIndex(index, event.key, this.tabs.map((tab, i) => ({disabled: tab.disabled || this.hiddenTabs.includes(i)})), this.direction ?? getDirection(this.host.nativeElement), this.orientation);
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

@Component({ selector: 'nq-pagination', standalone: true, template: `<nav #root class="nq-pagination" [attr.aria-label]="label" [attr.data-disabled]="disabled || null" [hidden]="hideOnSinglePage && total === 1" (keydown)="key($event)" (click)="guardClick($event)">
<button class="nq-button nq-pagination-arrow" data-variant="ghost" data-nq-previous type="button" [attr.aria-label]="previousLabel" [disabled]="disabled || current === 1" (click)="select(current - 1)"></button>
@for (item of entries; track item.page || -item.start) {
  @if (item.page) {<button class="nq-button nq-pagination-item" data-variant="ghost" [attr.data-nq-page]="item.page" type="button" [disabled]="disabled" [attr.aria-current]="item.page === current ? 'page' : null" [attr.aria-label]="pageLabel(item.page)" (click)="select(item.page)">{{ formatPage(item.page) }}</button>}
  @else if (disabled) {<span class="nq-pagination-ellipsis" aria-hidden="true">…</span>}
  @else {<details class="nq-pagination-gap" (toggle)="toggled($event)"><summary class="nq-pagination-gap-trigger" [attr.aria-label]="gapLabel(item.start, item.end)">…</summary><div class="nq-pagination-menu">
    @if (item.end - item.start < 100) {@for (number of gapPages(item); track number) {<button class="nq-button nq-pagination-item" data-variant="ghost" [attr.data-nq-page]="number" type="button" [attr.aria-label]="pageLabel(number)" (click)="gapSelect($event, number)">{{ formatPage(number) }}</button>}}
    @else {<div #jumpGroup class="nq-pagination-jump" (keydown.enter)="jumpKey($event, jumpGroup, item)"><label class="nq-label">{{ jumpLabel }}<input class="nq-input" data-nq-jump-input data-nq-filled="true" form="" type="number" inputmode="numeric" required [min]="item.start" [max]="item.end" step="1" [value]="item.start" (input)="jumpInput($event)"></label><button type="button" class="nq-button" data-nq-jump-submit (click)="jump(jumpGroup, item)">{{ goLabel }}</button></div>}
  </div></details>}
}
<button class="nq-button nq-pagination-arrow" data-variant="ghost" data-nq-next type="button" [attr.aria-label]="nextLabel" [disabled]="disabled || current === total" (click)="select(current + 1)"></button>
</nav>` })
export class NqPaginationComponent {
  constructor() { observeAngularFieldPresence(); }
  @Input() label = 'ترقيم الصفحات';
  @Input() page = 1;
  @Input() totalPages = 1;
  @Input() previousLabel = 'الصفحة السابقة';
  @Input() nextLabel = 'الصفحة التالية';
  @Input() pageLabel: (page: number) => string = page => 'الصفحة ' + page;
  @Input() formatPage: (page: number) => string = String;
  @Input() siblingCount = 1;
  @Input({transform: booleanAttribute}) disabled = false;
  @Input({transform: booleanAttribute}) hideOnSinglePage = false;
  @Input() gapLabel = (start: number, end: number) => 'الصفحات ' + start + ' إلى ' + end;
  @Input() jumpLabel = 'الانتقال إلى صفحة';
  @Input() goLabel = 'انتقال';
  @Output() readonly pageChange = new EventEmitter<number>();
  @ViewChild('root') root?: ElementRef<HTMLElement>;
  private pendingFocus = false;
  private ancestorObserver?: MutationObserver;
  private outside = (event: Event) => {if(this.root && !this.root.nativeElement.contains(event.target as Node)) this.close();};
  get total(): number { return normalizePaginationTotal(this.totalPages); }
  get current(): number { return normalizePaginationPage(this.page, this.total); }
  get entries() { return getPaginationItems(this.current, this.total, this.siblingCount).map(item => typeof item === 'number' ? {page: item, start: 0, end: 0} : {page: 0, ...item}); }
  get pages(): number[] { return this.entries.map(item => item.page); }
  gapPages(item: {start: number; end: number}): number[] { return item.end - item.start < 100 ? Array.from({length: item.end - item.start + 1}, (_, index) => item.start + index) : []; }
  private close(except?: HTMLDetailsElement) { this.root?.nativeElement.querySelectorAll<HTMLDetailsElement>('.nq-pagination-gap[open]').forEach(details => {if(details !== except) details.open = false;}); }
  private blocked() { return this.disabled || !!this.root?.nativeElement.querySelector<HTMLButtonElement>(':scope > [data-nq-page]')?.matches(':disabled'); }
  private syncInherited() {
    const unavailable=this.blocked();
    this.root?.nativeElement.querySelectorAll<HTMLElement>('.nq-pagination-gap > summary').forEach(summary => {
      if(unavailable) {summary.setAttribute('aria-disabled','true');summary.tabIndex=-1;}
      else {summary.removeAttribute('aria-disabled');summary.removeAttribute('tabindex');}
    });
    if(unavailable) this.close();
  }
  ngAfterViewInit() {
    const node=this.root?.nativeElement;if(!node)return;
    node.ownerDocument.addEventListener('click',this.outside);
    const Observer=node.ownerDocument.defaultView?.MutationObserver;
    this.ancestorObserver=Observer?new Observer(()=>this.syncInherited()):undefined;
    for(let ancestor=node.parentElement;ancestor;ancestor=ancestor.parentElement) if(ancestor.tagName==='FIELDSET')this.ancestorObserver?.observe(ancestor,{attributes:true,attributeFilter:['disabled']});
    this.syncInherited();
  }
  ngOnDestroy() { this.root?.nativeElement.ownerDocument.removeEventListener('click', this.outside);this.ancestorObserver?.disconnect(); }
  ngOnChanges() { this.close(); }
  guardClick(event: MouseEvent) { if(this.blocked()) {event.preventDefault();event.stopPropagation();this.syncInherited();} }
  ngAfterViewChecked() { this.syncInherited();if(this.pendingFocus) {this.pendingFocus = false; this.root?.nativeElement.querySelector<HTMLElement>('[aria-current="page"]')?.focus();} }
  toggled(event: Event) { const details = event.currentTarget as HTMLDetailsElement; if(this.blocked()) this.syncInherited();else if(details.open) this.close(details); }
  key(event: KeyboardEvent) {
    if(this.blocked() && ['Enter',' '].includes(event.key)) {event.preventDefault();this.syncInherited();return;}
    if(event.defaultPrevented || event.key !== 'Escape') return;
    const details = (event.target as HTMLElement).closest<HTMLDetailsElement>('.nq-pagination-gap[open]');
    if(details) {event.preventDefault(); details.open = false; details.querySelector<HTMLElement>('summary')?.focus();}
  }
  select(page: number, gap?: HTMLDetailsElement | null): void {
    if(this.blocked() || !Number.isFinite(page)) return;
    const next = normalizePaginationPage(page, this.total), changed = next !== this.current; this.close();
    if(gap) {gap.querySelector<HTMLElement>('summary')?.focus(); this.pendingFocus = changed;}
    if(changed) {this.page = next; this.pageChange.emit(next);}
  }
  gapSelect(event: Event, page: number) { this.select(page, (event.currentTarget as HTMLElement).closest('details')); }
  jump(node: HTMLElement, item: {start: number; end: number}) {
    const input = node.querySelector<HTMLInputElement>('input');
    if(!input || this.blocked())return;
    input.dataset.nqJumpTouched='true';
    if(input.checkValidity() && Number.isInteger(input.valueAsNumber) && input.valueAsNumber >= item.start && input.valueAsNumber <= item.end) {input.removeAttribute('aria-invalid');this.select(input.valueAsNumber, node.closest('details'));}
    else {input.setAttribute('aria-invalid','true');input.reportValidity();}
  }
  jumpInput(event: Event) {const input=event.currentTarget as HTMLInputElement;if(input.dataset.nqJumpTouched==='true'){if(input.checkValidity())input.removeAttribute('aria-invalid');else input.setAttribute('aria-invalid','true');}}
  jumpKey(event: Event, node: HTMLElement, item: {start: number; end: number}) { event.preventDefault(); this.jump(node, item); }
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
