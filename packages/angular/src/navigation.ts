import { booleanAttribute, ChangeDetectorRef, Component, ContentChildren, ElementRef, EventEmitter, Input, Output, QueryList, ViewChild, ViewChildren, inject, signal } from '@angular/core';
import { observeAngularFieldPresence } from './field-presence';
import { injectIsBrowser } from './platform';
import { injectId } from './ids';
import { HwTexts } from './text';
import { HwNamedRoot } from './root-name';
import { getDirection, getNextEnabledIndex, getPaginationItems, normalizePaginationPage, normalizePaginationTotal, observeTabOverflow, type Direction, type Orientation } from '@hawiyah/core';

/** Renders its own panel, so projected content stays in the view that declares it and
 * the tabset can be hydrated after server rendering. */
@Component({ selector: 'hw-tab', standalone: true, template: `<section class="hw-tab-panel" role="tabpanel" tabindex="0" [attr.id]="panelId() || null" [attr.aria-labelledby]="tabId() || null" [hidden]="!active()"><ng-content /></section>` })
export class HwTabComponent {
  @Input({required: true}) value = '';
  @Input({required: true}) label = '';
  @Input({transform: booleanAttribute}) disabled = false;
  /** Panel identity and visibility, assigned by the owning tabset once it has ordered its tabs. */
  readonly panelId = signal('');
  readonly tabId = signal('');
  readonly active = signal(false);
  /** Notify the owning tabset when projected input state changes. */
  readonly stateChanges = new EventEmitter<void>();
  ngOnChanges(): void {this.stateChanges.emit();}
}

@Component({ selector: 'hw-tabs', standalone: true,
  template: `<div class="hw-tabs"><div #tabBar class="hw-tab-bar" [attr.data-hw-overflow]="overflow" [attr.data-orientation]="orientation">
  <div class="hw-tab-list" [attr.data-hw-overflow]="overflow" role="tablist" [attr.aria-label]="rootName" [attr.aria-labelledby]="ariaLabelledby" [attr.aria-describedby]="ariaDescribedby" [attr.aria-orientation]="orientation" [attr.aria-hidden]="hiddenTabs.length === tabs?.length || null">@for (tab of tabs; track tab.value; let i = $index) {<button #tabButton class="hw-tab" type="button" role="tab" [id]="tabId(i)" [attr.aria-controls]="panelId(i)" [attr.aria-selected]="activeValue === tab.value" [attr.data-hw-overflow-hidden]="hiddenTabs.includes(i) ? 'true' : null" [attr.aria-hidden]="hiddenTabs.includes(i) || null" [disabled]="tab.disabled" [tabIndex]="!hiddenTabs.includes(i) && focusValue === tab.value ? 0 : -1" (click)="select(tab.value)" (focus)="focusedValue = tab.value" (keydown)="keydown($event, i)">{{ tab.label }}</button>}</div>
  <details #overflowDetails class="hw-tabs-overflow" [hidden]="!hiddenTabs.length" (keydown)="overflowKey($event)"><summary class="hw-tab-overflow-trigger" [attr.aria-label]="overflow === 'menu' ? texts.need('overflowLabel', overflowLabel, 'overflow is menu') : null" [attr.data-active]="overflowActive || null">…</summary><div class="hw-tab-overflow-menu">@for (i of hiddenTabs; track i) {@if (tabs.get(i); as tab) {<button type="button" class="hw-tab-overflow-item" [attr.data-hw-overflow-value]="tab.value" [disabled]="tab.disabled" [attr.aria-pressed]="tab.value === activeValue" (click)="overflowSelect(tab.value)">{{ tab.label }}</button>}}</div></details>
  </div><ng-content /></div>` })
export class HwTabsComponent extends HwNamedRoot {
  @Input() id = injectId('hw-tabs');
  @Input() value = '';
  @Input() orientation: Orientation = 'horizontal';
  @Input() direction?: Direction;
  @Input() activationMode: 'automatic' | 'manual' = 'automatic';
  @Input() overflow: 'menu' | 'scroll' = 'menu';
  /** Accessible name of the overflow disclosure. Required unless overflow is 'scroll'. */
  @Input() overflowLabel = '';
  @Output() readonly valueChange = new EventEmitter<string>();
  @ContentChildren(HwTabComponent) tabs!: QueryList<HwTabComponent>;
  @ViewChildren('tabButton') buttons!: QueryList<ElementRef<HTMLButtonElement>>;
  @ViewChild('tabBar') tabBar?: ElementRef<HTMLElement>;
  @ViewChild('overflowDetails') overflowDetails?: ElementRef<HTMLDetailsElement>;
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly browser = injectIsBrowser();
  protected readonly texts = new HwTexts('hw-tabs');
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
  ngAfterContentChecked(): void { this.syncPanels(); }
  /** Each hw-tab renders its panel; the tabset supplies the identifiers and the selection. */
  private syncPanels(): void {
    const active = this.activeValue;
    this.tabs?.forEach((tab, index) => { tab.panelId.set(this.panelId(index)); tab.tabId.set(this.tabId(index)); tab.active.set(tab.value === active); });
  }
  ngAfterViewInit(): void {
    // Overflow measurement and outside-click handling need layout and a user; a server render has neither.
    if (!this.browser) return;
    const node = this.tabBar!.nativeElement;
    this.overflowObserver = observeTabOverflow({container: node, tabs: () => this.buttons.toArray().map(button => button.nativeElement), enabled: () => this.overflow === 'menu' && this.orientation === 'horizontal', onChange: next => {
      const focusedElement = node.ownerDocument.activeElement;
      const menuValue = (focusedElement as HTMLElement | null)?.dataset.hwOverflowValue;
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
    else if (destination?.kind === 'menu') [...(this.overflowDetails?.nativeElement.querySelectorAll<HTMLElement>('[data-hw-overflow-value]') ?? [])].find(button => button.dataset.hwOverflowValue === destination.value)?.focus();
    else {const focusedElement = this.host.nativeElement.ownerDocument.activeElement; if (focusedElement?.getAttribute('data-hw-overflow-hidden') === 'true' && this.tabBar?.nativeElement.contains(focusedElement)) this.overflowDetails?.nativeElement.querySelector('summary')?.focus();}
  }
  ngOnDestroy(): void {this.overflowObserver?.destroy();this.tabsSubscription?.unsubscribe();this.tabSubscriptions.forEach(subscription => subscription.unsubscribe()); this.host.nativeElement.ownerDocument.removeEventListener('click', this.outside);}
  closeOverflow(): void {if (this.overflowDetails) this.overflowDetails.nativeElement.open = false;}
  overflowSelect(value: string): void {if (!this.tabs.find(tab => tab.value === value && !tab.disabled)) return; this.select(value); this.closeOverflow(); this.overflowDetails?.nativeElement.querySelector('summary')?.focus();}
  overflowKey(event: KeyboardEvent): void {if (event.key === 'Escape' && this.overflowDetails?.nativeElement.open) {event.preventDefault(); this.closeOverflow(); this.overflowDetails.nativeElement.querySelector('summary')?.focus();}}
  tabId(index: number): string { return `${this.id}-tab-${index}`; }
  panelId(index: number): string { return `${this.id}-panel-${index}`; }
  select(value: string): void { if (!this.tabs.find(tab => tab.value === value && !tab.disabled)) return; this.value = value; this.focusedValue = value; this.syncPanels(); this.valueChange.emit(value); }
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

/** `current` marks the page the reader is on; without it the last item is the current one. */
export interface HwBreadcrumbItem { label: string; href?: string; current?: boolean; disabled?: boolean }
@Component({ selector: 'hw-breadcrumb', standalone: true, template: `<nav class="hw-breadcrumb" [attr.aria-label]="rootName" [attr.aria-labelledby]="ariaLabelledby" [attr.aria-describedby]="ariaDescribedby"><ol>@for (item of items; track $index; let i = $index) {<li>@if (i === currentIndex) {<span aria-current="page">{{ item.label }}</span>} @else if (item.href && !item.disabled) {<a [href]="item.href">{{ item.label }}</a>} @else {<span [attr.role]="item.disabled ? 'link' : null" [attr.aria-disabled]="item.disabled || null">{{ item.label }}</span>}</li>}</ol></nav>` })
export class HwBreadcrumbComponent extends HwNamedRoot {
  @Input() items: readonly HwBreadcrumbItem[] = [];
  protected readonly texts = new HwTexts('hw-breadcrumb');
  /** The first item flagged current, else the last item. It is text: never a link and never a tab stop. */
  get currentIndex(): number { const flagged = this.items.findIndex(item => item.current); return flagged === -1 ? this.items.length - 1 : flagged; }
}

@Component({ selector: 'hw-pagination', standalone: true, template: `<nav #root class="hw-pagination" [attr.aria-label]="rootName" [attr.aria-labelledby]="ariaLabelledby" [attr.aria-describedby]="ariaDescribedby" [attr.data-disabled]="disabled || null" [hidden]="hideOnSinglePage && total === 1" (keydown)="key($event)" (click)="guardClick($event)">
<button class="hw-button hw-pagination-arrow" data-variant="ghost" data-hw-previous type="button" [attr.aria-label]="texts.need('previousLabel', previousLabel)" [disabled]="disabled" [attr.aria-disabled]="!disabled && current === 1 ? 'true' : null" (click)="select(current - 1)"></button>
@for (item of entries; track item.page || -item.start) {
  @if (item.page) {<button class="hw-button hw-pagination-item" data-variant="ghost" [attr.data-hw-page]="item.page" type="button" [disabled]="disabled" [attr.aria-current]="item.page === current ? 'page' : null" [attr.aria-label]="texts.call('getPageLabel', getPageLabel, [item.page])" (click)="select(item.page)">{{ formatPage(item.page) }}</button>}
  @else if (disabled) {<span class="hw-pagination-ellipsis" aria-hidden="true">…</span>}
  @else {<details class="hw-pagination-gap" (toggle)="toggled($event)"><summary class="hw-pagination-gap-trigger" [attr.aria-label]="texts.call('getGapLabel', getGapLabel, [item.start, item.end])">…</summary><div class="hw-pagination-menu">
    @if (item.end - item.start < 100) {@for (number of gapPages(item); track number) {<button class="hw-button hw-pagination-item" data-variant="ghost" [attr.data-hw-page]="number" type="button" [attr.aria-label]="texts.call('getPageLabel', getPageLabel, [number])" (click)="gapSelect($event, number)">{{ formatPage(number) }}</button>}}
    @else {<div #jumpGroup class="hw-pagination-jump" (keydown.enter)="jumpKey($event, jumpGroup, item)"><label class="hw-label">{{ texts.need('jumpLabel', jumpLabel) }}<input class="hw-input" data-hw-jump-input data-hw-filled="true" form="" type="number" inputmode="numeric" required [min]="item.start" [max]="item.end" step="1" [value]="item.start" (input)="jumpInput($event)"></label><button type="button" class="hw-button" data-hw-jump-submit (click)="jump(jumpGroup, item)">{{ texts.need('goLabel', goLabel) }}</button></div>}
  </div></details>}
}
<button class="hw-button hw-pagination-arrow" data-variant="ghost" data-hw-next type="button" [attr.aria-label]="texts.need('nextLabel', nextLabel)" [disabled]="disabled" [attr.aria-disabled]="!disabled && current === total ? 'true' : null" (click)="select(current + 1)"></button>
</nav>` })
export class HwPaginationComponent extends HwNamedRoot {
  constructor() { super(); observeAngularFieldPresence(); }
  @Input() page = 1;
  @Input() totalPages = 1;
  @Input({required: true}) previousLabel = '';
  @Input({required: true}) nextLabel = '';
  /** Accessible name of a page button. */
  @Input({required: true}) getPageLabel!: (page: number) => string;
  @Input() formatPage: (page: number) => string = String;
  @Input() siblingCount = 1;
  @Input({transform: booleanAttribute}) disabled = false;
  @Input({transform: booleanAttribute}) hideOnSinglePage = false;
  /** Accessible name of a gap disclosure; start and end are the first and last hidden page. */
  @Input({required: true}) getGapLabel!: (start: number, end: number) => string;
  /** Label of the page-number input inside a long gap. */
  @Input({required: true}) jumpLabel = '';
  /** Text of the button that submits the page number. */
  @Input({required: true}) goLabel = '';
  protected readonly texts = new HwTexts('hw-pagination');
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
  private close(except?: HTMLDetailsElement) { this.root?.nativeElement.querySelectorAll<HTMLDetailsElement>('.hw-pagination-gap[open]').forEach(details => {if(details !== except) details.open = false;}); }
  private blocked() { return this.disabled || !!this.root?.nativeElement.querySelector<HTMLButtonElement>(':scope > [data-hw-page]')?.matches(':disabled'); }
  private syncInherited() {
    const unavailable=this.blocked();
    this.root?.nativeElement.querySelectorAll<HTMLElement>('.hw-pagination-gap > summary').forEach(summary => {
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
    const details = (event.target as HTMLElement).closest<HTMLDetailsElement>('.hw-pagination-gap[open]');
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
    input.dataset.hwJumpTouched='true';
    if(input.checkValidity() && Number.isInteger(input.valueAsNumber) && input.valueAsNumber >= item.start && input.valueAsNumber <= item.end) {input.removeAttribute('aria-invalid');this.select(input.valueAsNumber, node.closest('details'));}
    else {input.setAttribute('aria-invalid','true');input.reportValidity();}
  }
  jumpInput(event: Event) {const input=event.currentTarget as HTMLInputElement;if(input.dataset.hwJumpTouched==='true'){if(input.checkValidity())input.removeAttribute('aria-invalid');else input.setAttribute('aria-invalid','true');}}
  jumpKey(event: Event, node: HTMLElement, item: {start: number; end: number}) { event.preventDefault(); this.jump(node, item); }
}

/** `value` keys the step; `current` of the stepper names the current step by it. */
export interface HwStep { value: string; label: string; description?: string; status?: 'complete' | 'current' | 'upcoming' }
@Component({ selector: 'hw-stepper', standalone: true, template: `<ol class="hw-stepper" [attr.aria-label]="rootName" [attr.aria-labelledby]="ariaLabelledby" [attr.aria-describedby]="ariaDescribedby">@for (step of items; track step.value; let i = $index) {<li class="hw-step" [attr.aria-current]="state(i) === 'current' ? 'step' : null" [attr.data-state]="state(i)"><span>{{ step.label }}</span>@if (stateText(i); as text) {<span class="hw-sr-only" data-hw-step-status>{{ text }}</span>}@if (step.description) {<p class="hw-hint">{{ step.description }}</p>}</li>}</ol>` })
export class HwStepperComponent extends HwNamedRoot {
  protected readonly texts = new HwTexts('hw-stepper');
  @Input() items: readonly HwStep[] = [];
  /** Value of the current step. This is a progress indicator, not navigation. Without it and without activeIndex no step is current. */
  @Input() current?: string;
  /** Overrides current. -1 means not started; items.length means complete. */
  @Input() activeIndex?: number;
  /** State text of a complete step and of an upcoming step, for readers who do not see the check mark and the colour. */
  @Input({required: true}) completeLabel = ''; @Input({required: true}) upcomingLabel = '';
  state(index: number): 'complete' | 'current' | 'upcoming' {
    const requested = this.activeIndex ?? this.items.findIndex(item => item.value === this.current);
    const active = Number.isInteger(requested) && requested >= -1 && requested <= this.items.length ? requested : -1;
    return this.items[index]?.status ?? (index === active ? 'current' : index < active ? 'complete' : 'upcoming');
  }
  /** The current step is exposed by aria-current; the other two states by their text. */
  stateText(index: number): string | null { const state = this.state(index); return state === 'complete' ? this.texts.need('completeLabel', this.completeLabel) : state === 'upcoming' ? this.texts.need('upcomingLabel', this.upcomingLabel) : null; }
}
