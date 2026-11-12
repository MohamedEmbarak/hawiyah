import { booleanAttribute, ChangeDetectorRef, Component, ElementRef, EventEmitter, forwardRef, HostListener, inject, Input, Output, signal, TemplateRef, ViewChild, type SimpleChanges } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { createTypeahead, getDirection, getNextEnabledIndex, isTypeaheadKey, observeReadonlyChoice, prepareToastDismissFocus, type Direction, type Option } from '@hawiyah/core';
import { HwExpandedValueControl } from './advanced-controls';
import { controlAria, fieldEnd, groupFocus } from './field-templates';
import { HwDialogComponent } from './overlays';
import type { HwButtonDirective } from './presentation';
import { dialogTemplate } from './dialog-template';
import { forwardedAriaHost } from './host-attributes';
import { HwObservedEmitter, injectIsBrowser } from './platform';
import { injectId } from './ids';
import { HwTexts } from './text';
import { HwNamedRoot } from './root-name';

@Component({selector: 'hw-toggle-group', standalone: true, providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwToggleGroupComponent), multi: true}], template: `<fieldset #group class="hw-toggle-group" [disabled]="disabled" [attr.data-hw-readonly]="readOnly || null" [attr.data-variant]="variant" ${controlAria} ${groupFocus}>@if (label) {<legend class="hw-label" [class.hw-sr-only]="labelHidden">{{ label }}@if (required && !multiple) {<span class="hw-required-marker" aria-hidden="true"> *</span>}</legend>}@if (multiple) {<input type="hidden" disabled [attr.form]="form">}@for (option of options; track option.value) {@if (multiple) {<button type="button" class="hw-button" data-variant="secondary" data-size="md" [disabled]="disabled || option.disabled" [attr.aria-disabled]="readOnly || null" [attr.aria-pressed]="selected(option.value)" (click)="toggle(option)" (blur)="touch()">{{ option.label }}</button>} @else {<label><input type="radio" [name]="name || controlId" [attr.form]="form" [value]="option.value" [checked]="selected(option.value)" [readOnly]="readOnly" [disabled]="disabled || option.disabled" [attr.aria-disabled]="readOnly || null" [required]="required" (invalid)="failed()" (change)="toggle(option)" (blur)="touch()">{{ option.label }}</label>}}${fieldEnd}@if (multiple) {@for (selected of submittedValues; track selected) {<input type="hidden" [name]="name" [attr.form]="form" [value]="selected" [disabled]="disabled">}}</fieldset>`})
export class HwToggleGroupComponent extends HwExpandedValueControl<string | string[]> {
  /** Name of the group, rendered as its legend. Required unless aria-label or aria-labelledby names the group. */ @Input() override label = ''; protected readonly texts = new HwTexts('hw-toggle-group');
  override ngDoCheck() { super.ngDoCheck(); if (!this.named) this.texts.need('label', this.label); }
  /** Hides the legend visually; it stays the accessible name of the group. For a toolbar whose option texts show the purpose. */ @Input({transform: booleanAttribute}) labelHidden = false;
  override value: string | string[] = ''; @Input({required: true}) options: readonly Option[] = []; @Input({transform: booleanAttribute}) multiple = false; @Input() variant: 'segmented' | 'outline' = 'segmented'; protected emptyValue() { return this.multiple ? [] : ''; }
  get selectedValues() { return Array.isArray(this.value) ? this.value : this.value ? [this.value] : []; }
  @ViewChild('group') group?: ElementRef<HTMLFieldSetElement>;
  private guarded: HTMLInputElement[]=[]; private guards: ReturnType<typeof observeReadonlyChoice>[]=[];
  private readonly browser = injectIsBrowser();
  ngAfterViewChecked() { if (!this.browser) return; const inputs=Array.from(this.group?.nativeElement.querySelectorAll<HTMLInputElement>('input[type="radio"]') ?? []); if(inputs.length!==this.guarded.length || inputs.some((input,index)=>input!==this.guarded[index])) {this.guards.forEach(guard=>guard.destroy());this.guarded=inputs;this.guards=inputs.map(observeReadonlyChoice);} else this.guards.forEach(guard=>guard.refresh()); }
  ngOnDestroy(){this.guards.forEach(guard=>guard.destroy());}
  // The empty value of a multiple group is [] and never '': a reset then reports an array, and an untouched group reports nothing.
  override ngOnInit() { if (this.multiple && !Array.isArray(this.value)) this.value = this.selectedValues; super.ngOnInit(); }
  protected override syncDom() { this.group?.nativeElement.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach(radio => { radio.checked = this.selected(radio.value); }); }
  get submittedValues(){return this.selectedValues.filter(value=>this.options.some(option=>option.value===value && !option.disabled));}
  selected(value: string) { return this.selectedValues.includes(value); }
  toggle(option: Option) { if (option.disabled) return; this.update(this.multiple ? this.selected(option.value) ? this.selectedValues.filter(value => value !== option.value) : [...this.selectedValues, option.value] : option.value); }
}

@Component({selector: 'hw-popover', standalone: true, template: `<div class="hw-popover"><button #trigger class="hw-button" type="button" [attr.data-variant]="triggerVariant" [disabled]="disabled" [attr.aria-expanded]="open" [attr.aria-controls]="panelId" (click)="toggle()">{{ texts.need('triggerLabel', triggerLabel) }}</button><div #panel class="hw-popover-panel" role="region" [id]="panelId" [attr.aria-label]="rootName" [attr.aria-labelledby]="ariaLabelledby" [attr.aria-describedby]="ariaDescribedby" [hidden]="!open"><ng-content /></div></div>`})
export class HwPopoverComponent extends HwNamedRoot {
  /** Id of the panel. Named panelId so that no id attribute is left on the wrapper element. */
  @Input() panelId = injectId('hw-popover');
  /** Visible text of the trigger button, which this component always renders. */
  @Input({required: true}) triggerLabel = '';
  /** Look of the trigger button. A disclosure trigger is rarely the primary action of a view. */
  @Input() triggerVariant: HwButtonDirective['variant'] = 'secondary';
  protected readonly texts = new HwTexts('hw-popover');
  @Input({transform: booleanAttribute}) disabled = false; @Input({transform: booleanAttribute}) open = false; @Output() readonly openChange = new EventEmitter<boolean>(); @ViewChild('trigger') trigger?: ElementRef<HTMLButtonElement>; @ViewChild('panel') panel?: ElementRef<HTMLElement>;
  protected readonly host: ElementRef<HTMLElement> = inject(ElementRef); protected readonly changeDetector = inject(ChangeDetectorRef);
  /** The open state the component itself last produced; a different bound value was written by the application. */
  private settled = false;
  /** True during ngOnChanges when the application, not the reader, opened the popup. */
  protected openedByBinding = false;
  ngOnChanges(changes: SimpleChanges) { this.openedByBinding = Boolean(changes['open']) && this.open && !this.settled; this.settled = this.open; if (this.disabled) this.close(); }
  toggle() { if (this.open) this.close(); else this.show(); }
  show() { if (this.disabled) return; this.open = this.settled = true; this.openChange.emit(true); }
  close(restore = false) { if (!this.open) return; this.open = this.settled = false; this.openChange.emit(false); if (restore) this.trigger?.nativeElement.focus(); }
  @HostListener('document:pointerdown', ['$event']) outside(event: Event) { if (!this.host.nativeElement.contains(event.target as Node)) this.close(); }
  /** Focus moved to an element outside trigger and panel: the popup closes and focus stays where it went. Focus that goes nowhere closes nothing. */
  @HostListener('focusout', ['$event']) left(event: FocusEvent) { const next = event.relatedTarget as Node | null; if (next && !this.host.nativeElement.contains(next)) this.close(); }
  @HostListener('document:keydown.escape', ['$event']) escape(event: Event) { if (this.open && this.host.nativeElement.contains(event.target as Node)) { event.preventDefault(); event.stopPropagation(); this.close(true); } }
}

/** `value` is what (action) reports; an item with `href` is a link that also navigates. */
export interface HwMenuItem { value: string; label: string; disabled?: boolean; href?: string; }
@Component({selector: 'hw-menu', standalone: true, template: `<div class="hw-menu"><button #trigger type="button" class="hw-button" [attr.data-variant]="triggerVariant" aria-haspopup="menu" [disabled]="disabled" [attr.aria-expanded]="open" [attr.aria-controls]="panelId" (click)="toggle()" (keydown)="triggerKey($event)">{{ texts.need('triggerLabel', triggerLabel) }}</button><div #panel class="hw-menu-content" role="menu" [id]="panelId" [attr.aria-label]="rootName" [attr.aria-labelledby]="ariaLabelledby" [attr.aria-describedby]="ariaDescribedby" [hidden]="!open" (keydown)="keydown($event)">@for (item of items; track item.value; let index = $index) {@if (item.href) {<a class="hw-menu-item" role="menuitem" [attr.href]="item.disabled ? null : item.href" [attr.aria-disabled]="item.disabled || null" [tabIndex]="index === active ? 0 : -1" (focus)="active = index" (click)="choose(item, $event)">{{ item.label }}</a>} @else {<button type="button" role="menuitem" class="hw-menu-item" [disabled]="item.disabled" [tabIndex]="index === active ? 0 : -1" (focus)="active = index" (click)="choose(item, $event)">{{ item.label }}</button>}}</div></div>`})
export class HwMenuComponent extends HwPopoverComponent {
  @Input() items: readonly HwMenuItem[] = []; @Output() readonly action = new EventEmitter<string>(); active = -1;
  protected override readonly texts = new HwTexts('hw-menu');
  private readonly typeahead = createTypeahead();
  private readonly browser = injectIsBrowser();
  private pendingFocus = false;
  /** Opened by the application: the first enabled item is the active one, and takes focus after the render unless the menu started open. */
  override ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);
    if (this.openedByBinding && this.open) { this.active = getNextEnabledIndex(-1, 'Home', this.items, 'ltr', 'vertical'); this.pendingFocus = this.browser && !changes['open']!.firstChange; }
  }
  ngAfterViewChecked() { if (!this.pendingFocus) return; this.pendingFocus = false; if (this.open) this.panel?.nativeElement.querySelectorAll<HTMLElement>('[role="menuitem"]')[this.active]?.focus(); }
  ngOnDestroy() { this.typeahead.reset(); }
  override close(restore = false) { this.typeahead.reset(); super.close(restore); }
  override show() { if (this.disabled) return; super.show(); this.active = getNextEnabledIndex(-1, 'Home', this.items, 'ltr', 'vertical'); this.focusActive(); }
  private focusActive() { this.changeDetector.detectChanges(); this.panel?.nativeElement.querySelectorAll<HTMLElement>('[role="menuitem"]')[this.active]?.focus(); }
  triggerKey(event: KeyboardEvent) { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); this.show(); if (event.key === 'ArrowUp') { this.active = getNextEnabledIndex(-1, 'End', this.items, 'ltr', 'vertical'); this.focusActive(); } } }
  keydown(event: KeyboardEvent) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) { event.preventDefault(); this.active = getNextEnabledIndex(this.active, event.key, this.items, 'ltr', 'vertical'); this.focusActive(); }
    else if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); this.close(true); }
    else if (event.key === 'Tab') this.close();
    // A link item is activated by Space as a button item is; Enter activates both natively.
    else if (event.key === ' ' && (event.target as Element).matches('a[role="menuitem"]')) { event.preventDefault(); (event.target as HTMLElement).click(); }
    else if (!event.isComposing && isTypeaheadKey(event)) { const next = this.typeahead.next(event.key, this.items.map(item => item.label), this.active, index => Boolean(this.items[index]?.disabled)); if (next >= 0) { event.preventDefault(); this.active = next; this.focusActive(); } }
  }
  /** A disabled link item does not navigate; an enabled one reports its value, closes the menu and then navigates natively. */
  choose(item: HwMenuItem, event?: Event) { if (this.disabled || item.disabled) { event?.preventDefault(); return; } this.action.emit(item.value); this.close(true); }
}

@Component({selector: 'hw-drawer', standalone: true, host: {...forwardedAriaHost, '[attr.title]': 'null'}, template: dialogTemplate('hwDrawerFooter', true)})
export class HwDrawerComponent extends HwDialogComponent { @Input() side: 'start' | 'end' | 'bottom' = 'end'; protected override readonly texts = new HwTexts('hw-drawer'); }

export interface HwToast { id: string; title?: string; message: string; tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger'; urgent?: boolean; dismissible?: boolean; }
@Component({selector: 'hw-toast-region', standalone: true, template: `
  <section #region class="hw-toast-region" tabindex="-1" [attr.data-variant]="variant" [attr.data-position]="position || null" [attr.aria-label]="texts.need('label', label)">
    @for (group of groups; track group) {
      <div [attr.role]="group === 'polite' ? 'status' : 'alert'" [attr.aria-live]="group" [attr.data-hw-live]="group" aria-relevant="additions text">
        @for (toast of group === 'polite' ? polite : urgent; track toast.id) {
          <article class="hw-toast" [attr.data-hw-toast]="toast.id" [attr.data-tone]="toast.tone || 'info'">
            @if (variant === 'banner') {<span class="hw-toast-icon" aria-hidden="true"></span>}
            <div class="hw-toast-content">@if (toast.title) {<strong>{{toast.title}}</strong>}<p>{{toast.message}}</p></div>
            @if (toast.dismissible !== false && hasDismissListener()) {
              <button type="button" class="hw-button hw-toast-dismiss" data-variant="ghost" data-hw-dismiss [attr.aria-label]="texts.call('getDismissLabel', getDismissLabel, [toast], 'a message can be dismissed')" (click)="requestDismiss(toast, $event)"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>
            }
          </article>
        }
      </div>
    }
  </section>`})
export class HwToastRegionComponent {
  @Input() variant: 'default' | 'inline' | 'banner' = 'default';
  @Input() position?: 'inline' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
  @Input({required: true}) label = '';
  @Input() messages: readonly HwToast[] = [];
  /** Accessible name of a toast's dismiss button. Required when (dismissed) is handled and a message is dismissible. */
  @Input() getDismissLabel?: (message: HwToast) => string;
  protected readonly texts = new HwTexts('hw-toast-region');
  protected readonly hasDismissListener = signal(false);
  @Output() readonly dismissed: EventEmitter<string> = new HwObservedEmitter<string>(observed => this.hasDismissListener.set(observed));
  @ViewChild('region') private region?: ElementRef<HTMLElement>;
  readonly groups = ['polite', 'assertive'] as const;
  private pending?: () => void;
  get polite() { return this.messages.filter(message => !message.urgent); }
  get urgent() { return this.messages.filter(message => message.urgent); }
  requestDismiss(toast: HwToast, event: Event) {
    if (toast.dismissible === false || !this.dismissed.observed) return;
    const notice = (event.currentTarget as HTMLElement).closest<HTMLElement>('[data-hw-toast]');
    if (notice && this.region) this.pending = prepareToastDismissFocus(this.region.nativeElement, notice);
    this.dismissed.emit(toast.id);
  }
  ngAfterViewChecked() { this.pending?.(); this.pending = undefined; }
}

@Component({selector: 'hw-collapsible', standalone: true, template: `<details class="hw-collapsible" [open]="open" (toggle)="toggled($event)"><summary class="hw-collapsible-trigger" [attr.aria-disabled]="disabled || null" (click)="guard($event)">{{ label }}</summary><div class="hw-collapsible-content"><ng-content /></div></details>`})
export class HwCollapsibleComponent {
  @Input({required: true}) label = ''; @Input({transform: booleanAttribute}) open = false; @Output() readonly openChange = new EventEmitter<boolean>();
  /** The summary stays in the tab order and keeps its name; the reader cannot open or close it, the application still can. */
  @Input({transform: booleanAttribute}) disabled = false;
  guard(event: Event) { if (this.disabled) event.preventDefault(); }
  toggled(event: Event) { const details = event.target as HTMLDetailsElement; if (this.disabled) { details.open = this.open; return; } const open = details.open; if (this.open !== open) { this.open = open; this.openChange.emit(open); } }
}

export interface HwTreeNode { id: string; label: string; disabled?: boolean; children?: readonly HwTreeNode[]; }
interface HwVisibleTreeNode { node: HwTreeNode; level: number; parent?: string; position: number; total: number; disabled?: boolean; }
@Component({selector: 'hw-tree-view', standalone: true, providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwTreeViewComponent), multi: true}], template: `<ul class="hw-tree-view" role="tree" [attr.aria-label]="ariaLabel || (named ? label || null : texts.need('label', label))" [attr.aria-labelledby]="labelledBy" [attr.aria-disabled]="disabled" [attr.aria-describedby]="descriptionIds" [attr.aria-invalid]="invalid" [attr.dir]="direction || null" ${groupFocus}>@for (entry of visible; track entry.node.id) {<li role="treeitem" class="hw-tree-item" [attr.data-node]="entry.node.id" [attr.aria-level]="entry.level" [attr.aria-posinset]="entry.position" [attr.aria-setsize]="entry.total" [attr.aria-expanded]="entry.node.children?.length ? isExpanded(entry.node.id) : null" [attr.aria-selected]="value === entry.node.id" [attr.aria-disabled]="disabled || entry.node.disabled || null" [attr.aria-labelledby]="labelId(entry.node)" [style.--hw-tree-depth]="entry.level - 1" [tabIndex]="!disabled && !entry.node.disabled && focusId === entry.node.id ? 0 : -1" (focus)="focused = entry.node.id" (click)="select(entry.node)" (keydown)="keydown($event, entry)" (blur)="touch()">@if (entry.node.children?.length) {<button type="button" class="hw-tree-toggle" tabindex="-1" [disabled]="disabled || entry.node.disabled" [attr.aria-label]="isExpanded(entry.node.id) ? texts.call('getCollapseLabel', getCollapseLabel, [entry.node]) : texts.call('getExpandLabel', getExpandLabel, [entry.node])" (click)="$event.stopPropagation(); toggleNode(entry.node)"><span class="hw-icon" data-size="sm" aria-hidden="true" [attr.data-icon]="isExpanded(entry.node.id) ? 'minus-sign' : 'add-01'"></span></button>}<span [id]="labelId(entry.node)">{{ entry.node.label }}</span></li>}</ul><input type="hidden" [name]="name" [attr.form]="form" [value]="value" [disabled]="disabled">${fieldEnd}`})
export class HwTreeViewComponent extends HwExpandedValueControl<string> {
  /** Accessible name of the tree. Required unless aria-label, aria-labelledby or a surrounding hw-field names it. */ @Input() override label = ''; protected readonly texts = new HwTexts('hw-tree-view');
  /** Accessible names of the button that expands, and collapses, a branch. The button is for pointer and screen-reader activation and is not a tab stop. */
  @Input({required: true}) getExpandLabel!: (node: HwTreeNode) => string; @Input({required: true}) getCollapseLabel!: (node: HwTreeNode) => string;
  override value = ''; protected emptyValue() { return ''; } @Input() items: readonly HwTreeNode[] = []; @Input() expanded: readonly string[] = []; @Input() direction?: Direction; @Output() readonly expandedChange = new EventEmitter<readonly string[]>(); private readonly host: ElementRef<HTMLElement> = inject(ElementRef); focused = '';
  private readonly typeahead = createTypeahead();
  ngOnDestroy() { this.typeahead.reset(); }
  /** The label element of a node names its tree item, so the name of the toggle button is not part of it. */
  labelId(node: HwTreeNode): string { return this.controlId + '-' + encodeURIComponent(node.id); }
  /** After a native reset the tab stop returns to the selected node; expanded branches stay as they are. */
  protected override afterReset() { this.focused = ''; }
  get visible(): HwVisibleTreeNode[] { const entries: HwVisibleTreeNode[] = []; const visit = (nodes: readonly HwTreeNode[], level: number, parent?: string) => nodes.forEach((node, index) => { entries.push({node, level, parent, position: index + 1, total: nodes.length, disabled: node.disabled}); if (node.children && this.isExpanded(node.id)) visit(node.children, level + 1, node.id); }); visit(this.items, 1); return entries; }
  get focusId() { const entries = this.visible; return entries.find(entry => entry.node.id === this.focused && !entry.node.disabled)?.node.id ?? entries.find(entry => entry.node.id === this.value && !entry.node.disabled)?.node.id ?? entries.find(entry => !entry.node.disabled)?.node.id ?? ''; }
  isExpanded(id: string) { return this.expanded.includes(id); }
  toggleNode(node: HwTreeNode) { if (this.disabled || node.disabled || !node.children?.length) return; this.expanded = this.isExpanded(node.id) ? this.expanded.filter(id => id !== node.id) : [...this.expanded, node.id]; this.expandedChange.emit(this.expanded); this.focus(node.id); }
  select(node: HwTreeNode) { if (!this.disabled && !node.disabled) { this.focused = node.id; this.update(node.id); } }
  private focus(id: string) { this.focused = id; this.changeDetector.detectChanges(); Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('[role="treeitem"]')).find(element => element.dataset['node'] === id)?.focus(); }
  keydown(event: KeyboardEvent, entry: HwVisibleTreeNode) {
    if (this.disabled || entry.node.disabled || event.altKey || event.ctrlKey || event.metaKey) return;
    const entries = this.visible; const index = entries.findIndex(item => item.node.id === entry.node.id); const rtl = (this.direction ?? getDirection(this.host.nativeElement)) === 'rtl';
    if (['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = getNextEnabledIndex(index, event.key, entries, 'ltr', 'vertical'); if (entries[next]) this.focus(entries[next]!.node.id); }
    else if (event.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) { event.preventDefault(); if (entry.node.children?.length) { if (!this.isExpanded(entry.node.id)) this.toggleNode(entry.node); else { const child = entries.slice(index + 1).find(item => item.parent === entry.node.id && !item.node.disabled); if (child) this.focus(child.node.id); } } }
    else if (event.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) { event.preventDefault(); if (this.isExpanded(entry.node.id)) this.toggleNode(entry.node); else if (entry.parent) { const parent = entries.find(item => item.node.id === entry.parent); if (parent && !parent.node.disabled) this.focus(parent.node.id); } }
    else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); this.select(entry.node); }
    // Type-ahead searches the visible nodes; an unmatched key keeps its default action.
    else if (!event.isComposing && isTypeaheadKey(event)) { const next = this.typeahead.next(event.key, entries.map(item => item.node.label), index, i => Boolean(entries[i]!.node.disabled)); if (next >= 0) { event.preventDefault(); this.focus(entries[next]!.node.id); } }
  }
}

export interface HwSlide { id?: string; title?: string; content?: string; src?: string; alt?: string; }
@Component({selector: 'hw-carousel', standalone: true, imports: [NgTemplateOutlet], template: `
  <section class="hw-carousel" data-hw-carousel-ready [style.--hw-carousel-index]="indexValue" role="region" [attr.aria-label]="rootName" [attr.aria-labelledby]="ariaLabelledby" [attr.aria-describedby]="ariaDescribedby" [attr.aria-roledescription]="carouselDescription || null">
    <div class="hw-carousel-viewport hw-carousel-slides"><div class="hw-carousel-track">
      @for (slide of slides; track slide.id || $index; let index = $index) {
        <div class="hw-carousel-slide" role="group" [attr.aria-roledescription]="slideDescription || null" [attr.aria-label]="texts.call('getSlideLabel', getSlideLabel, [index + 1, slides.length])" [hidden]="index !== indexValue" [inert]="index !== indexValue" [attr.aria-hidden]="index !== indexValue ? 'true' : null">
          @if (slideTemplate) {<ng-container [ngTemplateOutlet]="slideTemplate" [ngTemplateOutletContext]="{$implicit: slide, index: index}" />} @else {
            @if (slide.src) {<img [src]="slide.src" [alt]="slide.alt || ''">}@if (slide.title) {<h3>{{ slide.title }}</h3>}@if (slide.content) {<p>{{ slide.content }}</p>}
          }
        </div>
      }
    </div>@if (!slides.length) {<p class="hw-carousel-empty">{{ texts.need('emptyLabel', emptyLabel) }}</p>}</div>
    <div class="hw-carousel-controls">
      @if (showIndicators && slides.length) {<div class="hw-carousel-pagination" role="group" [attr.aria-label]="texts.need('indicatorsLabel', indicatorsLabel, 'showIndicators is on')">@for (slide of slides; track slide.id || $index; let index = $index) {<button class="hw-carousel-dot" type="button" [attr.aria-label]="texts.call('getSlideLabel', getSlideLabel, [index + 1, slides.length])" [attr.aria-current]="index === indexValue ? 'true' : null" (click)="select(index)"></button>}</div>}
      <div class="hw-carousel-arrows"><button class="hw-button hw-carousel-arrow" type="button" data-hw-previous [attr.aria-label]="texts.need('previousLabel', previousLabel)" [disabled]="slides.length < 2" [attr.aria-disabled]="slides.length > 1 && !loop && indexValue === 0 ? 'true' : null" (click)="move(-1)"></button><button class="hw-button hw-carousel-arrow" type="button" data-hw-next [attr.aria-label]="texts.need('nextLabel', nextLabel)" [disabled]="slides.length < 2" [attr.aria-disabled]="slides.length > 1 && !loop && indexValue === slides.length - 1 ? 'true' : null" (click)="move(1)"></button></div>
      <span class="hw-carousel-status hw-sr-only" role="status" aria-live="polite">{{ slides.length ? texts.call('getSlideLabel', getSlideLabel, [indexValue + 1, slides.length]) : texts.need('emptyLabel', emptyLabel) }}</span>
    </div>
  </section>`})
export class HwCarouselComponent extends HwNamedRoot {
  @Input() slides: readonly HwSlide[] = [];
  @Input() slideTemplate?: TemplateRef<{$implicit: HwSlide; index: number}>;
  @Input() current = 0;
  @Input({transform: booleanAttribute}) loop = false;
  @Input({transform: booleanAttribute}) showIndicators = true;
  /** Accessible name of the indicator group. Required unless showIndicators is off. */
  @Input() indicatorsLabel = '';
  @Input({required: true}) previousLabel = '';
  @Input({required: true}) nextLabel = '';
  /** Status text when there are no slides. */
  @Input({required: true}) emptyLabel = '';
  /** Optional aria-roledescription of the root; the attribute is omitted without it. */
  @Input() carouselDescription = '';
  /** Optional aria-roledescription of each slide; the attribute is omitted without it. */
  @Input() slideDescription = '';
  /** Accessible name of a slide and of its indicator, and the live status text; position is one-based. */
  @Input({required: true}) getSlideLabel!: (position: number, total: number) => string;
  protected readonly texts = new HwTexts('hw-carousel');
  @Output() readonly currentChange = new EventEmitter<number>();
  get indexValue() { return Math.max(0, Math.min(this.slides.length - 1, Number.isFinite(this.current) ? Math.floor(this.current) : 0)); }
  select(requested: number) {
    const total = this.slides.length;
    if (!total || !Number.isFinite(requested)) return;
    const rounded = Math.floor(requested);
    const next = this.loop ? ((rounded % total) + total) % total : Math.max(0, Math.min(total - 1, rounded));
    if (next === this.indexValue) return;
    this.current = next; this.currentChange.emit(next);
  }
  move(amount: number) { this.select(this.indexValue + amount); }
}
