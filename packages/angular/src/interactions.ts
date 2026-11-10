import { booleanAttribute, ChangeDetectorRef, Component, ElementRef, EventEmitter, forwardRef, HostListener, inject, Input, Output, signal, TemplateRef, ViewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { getDirection, getNextEnabledIndex, observeReadonlyChoice, prepareToastDismissFocus, type Direction, type Option } from '@hawiyah/core';
import { HwExpandedValueControl } from './advanced-controls';
import { HwDialogComponent } from './overlays';
import { injectIsBrowser } from './platform';

let nextId = 0;
@Component({selector: 'hw-toggle-group', standalone: true, providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwToggleGroupComponent), multi: true}], template: `<fieldset #group class="hw-toggle-group" [disabled]="disabled" [attr.data-hw-readonly]="readOnly || null" [attr.data-variant]="variant" [attr.aria-describedby]="descriptionIds" [attr.aria-invalid]="error ? true : null"><legend class="hw-label">{{ label }}</legend>@for (option of options; track option.value) {@if (multiple) {<button type="button" class="hw-button" [disabled]="disabled || option.disabled" [attr.aria-disabled]="readOnly || null" [attr.aria-pressed]="selected(option.value)" (click)="toggle(option)" (blur)="touch()">{{ option.label }}</button>} @else {<label><input type="radio" [name]="name || controlId" [value]="option.value" [checked]="selected(option.value)" [readOnly]="readOnly" [disabled]="disabled || option.disabled" [attr.aria-disabled]="readOnly || null" [required]="required" (change)="toggle(option)" (blur)="touch()"><span>{{ option.label }}</span></label>}}@if (hint) {<p class="hw-hint" [id]="controlId + '-hint'">{{ hint }}</p>}@if (error) {<p class="hw-error" [id]="controlId + '-error'">{{ error }}</p>}</fieldset>@if (multiple) {@for (selected of submittedValues; track selected) {<input type="hidden" [name]="name" [value]="selected" [disabled]="disabled">}}`})
export class HwToggleGroupComponent extends HwExpandedValueControl<string | string[]> {
  override value: string | string[] = ''; @Input() options: readonly Option[] = []; @Input({transform: booleanAttribute}) multiple = false; @Input() variant: 'segmented' | 'outline' = 'segmented'; protected emptyValue() { return this.multiple ? [] : ''; }
  get selectedValues() { return Array.isArray(this.value) ? this.value : this.value ? [this.value] : []; }
  @ViewChild('group') group?: ElementRef<HTMLFieldSetElement>;
  private guarded: HTMLInputElement[]=[]; private guards: ReturnType<typeof observeReadonlyChoice>[]=[];
  private readonly browser = injectIsBrowser();
  ngAfterViewChecked() { if (!this.browser) return; const inputs=Array.from(this.group?.nativeElement.querySelectorAll<HTMLInputElement>('input[type="radio"]') ?? []); if(inputs.length!==this.guarded.length || inputs.some((input,index)=>input!==this.guarded[index])) {this.guards.forEach(guard=>guard.destroy());this.guarded=inputs;this.guards=inputs.map(observeReadonlyChoice);} else this.guards.forEach(guard=>guard.refresh()); }
  ngOnDestroy(){this.guards.forEach(guard=>guard.destroy());}
  get submittedValues(){return this.selectedValues.filter(value=>this.options.some(option=>option.value===value && !option.disabled));}
  selected(value: string) { return this.selectedValues.includes(value); }
  toggle(option: Option) { if (option.disabled) return; this.update(this.multiple ? this.selected(option.value) ? this.selectedValues.filter(value => value !== option.value) : [...this.selectedValues, option.value] : option.value); }
}

@Component({selector: 'hw-popover', standalone: true, template: `<div class="hw-popover"><button #trigger class="hw-button" type="button" [disabled]="disabled" [attr.aria-expanded]="open" [attr.aria-controls]="id" (click)="toggle()">{{ triggerLabel }}</button><div #panel class="hw-popover-panel" role="region" [id]="id" [attr.aria-label]="label" [hidden]="!open"><ng-content /></div></div>`})
export class HwPopoverComponent {
  @Input() id = `hw-popover-${++nextId}`; @Input({required: true}) label = ''; @Input() triggerLabel = 'Open'; @Input({transform: booleanAttribute}) disabled = false; @Input({transform: booleanAttribute}) open = false; @Output() readonly openChange = new EventEmitter<boolean>(); @ViewChild('trigger') trigger?: ElementRef<HTMLButtonElement>; @ViewChild('panel') panel?: ElementRef<HTMLElement>;
  protected readonly host: ElementRef<HTMLElement> = inject(ElementRef); protected readonly changeDetector = inject(ChangeDetectorRef);
  ngOnChanges() { if (this.disabled) this.close(); }
  toggle() { if (this.open) this.close(); else this.show(); }
  show() { if (this.disabled) return; this.open = true; this.openChange.emit(true); }
  close(restore = false) { if (!this.open) return; this.open = false; this.openChange.emit(false); if (restore) this.trigger?.nativeElement.focus(); }
  @HostListener('document:pointerdown', ['$event']) outside(event: Event) { if (!this.host.nativeElement.contains(event.target as Node)) this.close(); }
  @HostListener('document:keydown.escape', ['$event']) escape(event: Event) { if (this.open && this.host.nativeElement.contains(event.target as Node)) { event.preventDefault(); event.stopPropagation(); this.close(true); } }
}

export interface HwMenuItem { id: string; label: string; disabled?: boolean; }
@Component({selector: 'hw-menu', standalone: true, template: `<div class="hw-menu"><button #trigger type="button" class="hw-button" aria-haspopup="menu" [disabled]="disabled" [attr.aria-expanded]="open" [attr.aria-controls]="id" (click)="toggle()" (keydown)="triggerKey($event)">{{ triggerLabel }}</button><div #panel class="hw-menu-panel" role="menu" [id]="id" [attr.aria-label]="label" [hidden]="!open" (keydown)="keydown($event)">@for (item of items; track item.id; let index = $index) {<button type="button" role="menuitem" class="hw-menu-item" [disabled]="item.disabled" [tabIndex]="index === active ? 0 : -1" (focus)="active = index" (click)="choose(item)">{{ item.label }}</button>}</div></div>`})
export class HwMenuComponent extends HwPopoverComponent {
  @Input() items: readonly HwMenuItem[] = []; @Output() readonly action = new EventEmitter<string>(); active = -1;
  override show() { if (this.disabled) return; super.show(); this.active = getNextEnabledIndex(-1, 'Home', this.items, 'ltr', 'vertical'); this.focusActive(); }
  private focusActive() { this.changeDetector.detectChanges(); this.panel?.nativeElement.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')[this.active]?.focus(); }
  triggerKey(event: KeyboardEvent) { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); this.show(); if (event.key === 'ArrowUp') { this.active = getNextEnabledIndex(-1, 'End', this.items, 'ltr', 'vertical'); this.focusActive(); } } }
  keydown(event: KeyboardEvent) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) { event.preventDefault(); this.active = getNextEnabledIndex(this.active, event.key, this.items, 'ltr', 'vertical'); this.focusActive(); }
    else if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); this.close(true); }
    else if (event.key === 'Tab') this.close();
  }
  choose(item: HwMenuItem) { if (this.disabled || item.disabled) return; this.action.emit(item.id); this.close(true); }
}

@Component({selector: 'hw-drawer', standalone: true, template: `<dialog #dialog class="hw-dialog hw-drawer" [attr.data-side]="side" [attr.aria-labelledby]="titleId" (close)="closed()" (cancel)="cancelledBackdrop()" (pointerdown)="backdropStart($event)" (pointercancel)="resetBackdrop()" (click)="backdrop($event)"><header class="hw-dialog-header"><h2 [id]="titleId">{{ title }}</h2><button type="button" class="hw-button" data-variant="ghost" [attr.aria-label]="closeLabel" (click)="close()"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button></header><div class="hw-dialog-body"><ng-content /></div><footer class="hw-dialog-footer"><ng-content select="[hwDrawerFooter]" /></footer></dialog>`})
export class HwDrawerComponent extends HwDialogComponent { @Input() side: 'start' | 'end' | 'bottom' = 'end'; }

export interface HwToast { id: string; title?: string; message: string; tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger'; urgent?: boolean; dismissible?: boolean; }
// Angular output subscriptions are independent of component inputs. Notify the
// template when their presence changes, including an imperative unsubscription.
class ToastDismissEmitter extends EventEmitter<string> {
  constructor(private readonly changed: (observed: boolean) => void) { super(); }
  override subscribe(...args: Parameters<EventEmitter<string>['subscribe']>) {
    const subscription = super.subscribe(...args);
    this.changed(this.observed);
    subscription.add(() => this.changed(this.observed));
    return subscription;
  }
}
@Component({selector: 'hw-toast-region', standalone: true, template: `
  <section #region class="hw-toast-region" tabindex="-1" [attr.data-variant]="variant" [attr.data-position]="position || null" [attr.aria-label]="label">
    @for (group of groups; track group) {
      <div [attr.role]="group === 'polite' ? 'status' : 'alert'" [attr.aria-live]="group" [attr.data-hw-live]="group" aria-relevant="additions text">
        @for (toast of group === 'polite' ? polite : urgent; track toast.id) {
          <article class="hw-toast" [attr.data-hw-toast]="toast.id" [attr.data-tone]="toast.tone || 'info'">
            @if (variant === 'banner') {<span class="hw-toast-icon" aria-hidden="true"></span>}
            <div class="hw-toast-content">@if (toast.title) {<strong>{{toast.title}}</strong>}<p>{{toast.message}}</p></div>
            @if (toast.dismissible !== false && hasDismissListener()) {
              <button type="button" class="hw-button hw-toast-dismiss" data-variant="ghost" data-hw-dismiss [attr.aria-label]="dismissLabel + ': ' + (toast.title || toast.message)" (click)="requestDismiss(toast, $event)"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>
            }
          </article>
        }
      </div>
    }
  </section>`})
export class HwToastRegionComponent {
  @Input() variant: 'default' | 'inline' | 'banner' = 'default';
  @Input() position?: 'inline' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
  @Input() label = 'الإشعارات';
  @Input() messages: readonly HwToast[] = [];
  @Input() dismissLabel = 'إغلاق الإشعار';
  protected readonly hasDismissListener = signal(false);
  @Output() readonly dismissed: EventEmitter<string> = new ToastDismissEmitter(observed => this.hasDismissListener.set(observed));
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

@Component({selector: 'hw-collapsible', standalone: true, template: `<details class="hw-collapsible" [open]="open" (toggle)="toggled($event)"><summary class="hw-collapsible-trigger">{{ label }}</summary><div class="hw-collapsible-content"><ng-content /></div></details>`})
export class HwCollapsibleComponent { @Input({required: true}) label = ''; @Input({transform: booleanAttribute}) open = false; @Output() readonly openChange = new EventEmitter<boolean>(); toggled(event: Event) { const open = (event.target as HTMLDetailsElement).open; if (this.open !== open) { this.open = open; this.openChange.emit(open); } } }

export interface HwTreeNode { id: string; label: string; disabled?: boolean; children?: readonly HwTreeNode[]; }
interface HwVisibleTreeNode { node: HwTreeNode; level: number; parent?: string; position: number; total: number; disabled?: boolean; }
@Component({selector: 'hw-tree-view', standalone: true, providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwTreeViewComponent), multi: true}], template: `<ul class="hw-tree-view" role="tree" [attr.aria-label]="label" [attr.aria-disabled]="disabled" [attr.aria-describedby]="descriptionIds" [attr.dir]="direction || null">@for (entry of visible; track entry.node.id) {<li role="treeitem" class="hw-tree-item" [attr.data-node]="entry.node.id" [attr.aria-level]="entry.level" [attr.aria-posinset]="entry.position" [attr.aria-setsize]="entry.total" [attr.aria-expanded]="entry.node.children?.length ? isExpanded(entry.node.id) : null" [attr.aria-selected]="value === entry.node.id" [attr.aria-disabled]="disabled || entry.node.disabled || null" [style.padding-inline-start]="(entry.level - 1) + 'rem'" [tabIndex]="!disabled && !entry.node.disabled && focusId === entry.node.id ? 0 : -1" (focus)="focused = entry.node.id" (click)="select(entry.node)" (keydown)="keydown($event, entry)" (blur)="touch()">@if (entry.node.children?.length) {<span class="hw-tree-toggle" aria-hidden="true" (click)="$event.stopPropagation(); toggleNode(entry.node)"><span class="hw-icon" data-size="sm" aria-hidden="true" [attr.data-icon]="isExpanded(entry.node.id) ? 'minus-sign' : 'add-01'"></span></span>}<span>{{ entry.node.label }}</span></li>}</ul><input type="hidden" [name]="name" [value]="value" [disabled]="disabled">@if (hint) {<p class="hw-hint" [id]="controlId + '-hint'">{{ hint }}</p>}@if (error) {<p class="hw-error" [id]="controlId + '-error'">{{ error }}</p>}`})
export class HwTreeViewComponent extends HwExpandedValueControl<string> {
  override value = ''; protected emptyValue() { return ''; } @Input() nodes: readonly HwTreeNode[] = []; @Input() expandedIds: readonly string[] = []; @Input() direction?: Direction; @Output() readonly expandedIdsChange = new EventEmitter<readonly string[]>(); private readonly host: ElementRef<HTMLElement> = inject(ElementRef); focused = '';
  get visible(): HwVisibleTreeNode[] { const entries: HwVisibleTreeNode[] = []; const visit = (nodes: readonly HwTreeNode[], level: number, parent?: string) => nodes.forEach((node, index) => { entries.push({node, level, parent, position: index + 1, total: nodes.length, disabled: node.disabled}); if (node.children && this.isExpanded(node.id)) visit(node.children, level + 1, node.id); }); visit(this.nodes, 1); return entries; }
  get focusId() { const entries = this.visible; return entries.find(entry => entry.node.id === this.focused && !entry.node.disabled)?.node.id ?? entries.find(entry => entry.node.id === this.value && !entry.node.disabled)?.node.id ?? entries.find(entry => !entry.node.disabled)?.node.id ?? ''; }
  isExpanded(id: string) { return this.expandedIds.includes(id); }
  toggleNode(node: HwTreeNode) { if (this.disabled || node.disabled || !node.children?.length) return; this.expandedIds = this.isExpanded(node.id) ? this.expandedIds.filter(id => id !== node.id) : [...this.expandedIds, node.id]; this.expandedIdsChange.emit(this.expandedIds); this.focus(node.id); }
  select(node: HwTreeNode) { if (!this.disabled && !node.disabled) { this.focused = node.id; this.update(node.id); } }
  private focus(id: string) { this.focused = id; this.changeDetector.detectChanges(); Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('[role="treeitem"]')).find(element => element.dataset['node'] === id)?.focus(); }
  keydown(event: KeyboardEvent, entry: HwVisibleTreeNode) {
    if (this.disabled || entry.node.disabled || event.altKey || event.ctrlKey || event.metaKey) return;
    const entries = this.visible; const index = entries.findIndex(item => item.node.id === entry.node.id); const rtl = (this.direction ?? getDirection(this.host.nativeElement)) === 'rtl';
    if (['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = getNextEnabledIndex(index, event.key, entries, 'ltr', 'vertical'); if (entries[next]) this.focus(entries[next]!.node.id); }
    else if (event.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) { event.preventDefault(); if (entry.node.children?.length) { if (!this.isExpanded(entry.node.id)) this.toggleNode(entry.node); else { const child = entries.slice(index + 1).find(item => item.parent === entry.node.id && !item.node.disabled); if (child) this.focus(child.node.id); } } }
    else if (event.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) { event.preventDefault(); if (this.isExpanded(entry.node.id)) this.toggleNode(entry.node); else if (entry.parent) { const parent = entries.find(item => item.node.id === entry.parent); if (parent && !parent.node.disabled) this.focus(parent.node.id); } }
    else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); this.select(entry.node); }
  }
}

export interface HwSlide { id?: string; title?: string; content?: string; src?: string; alt?: string; }
@Component({selector: 'hw-carousel', standalone: true, imports: [NgTemplateOutlet], styles: [':host { display: block; min-inline-size: 0; max-inline-size: 100%; }'], template: `
  <section class="hw-carousel" data-hw-carousel-ready [style.--hw-carousel-index]="indexValue" role="region" [attr.aria-label]="label" [attr.aria-roledescription]="carouselDescription">
    <div class="hw-carousel-viewport hw-carousel-slides"><div class="hw-carousel-track">
      @for (slide of slides; track slide.id || $index; let index = $index) {
        <div class="hw-carousel-slide" role="group" [attr.aria-roledescription]="slideDescription" [attr.aria-label]="slideLabel(index + 1, slides.length)" [hidden]="index !== indexValue" [inert]="index !== indexValue" [attr.aria-hidden]="index !== indexValue ? 'true' : null">
          @if (slideTemplate) {<ng-container [ngTemplateOutlet]="slideTemplate" [ngTemplateOutletContext]="{$implicit: slide, index: index}" />} @else {
            @if (slide.src) {<img [src]="slide.src" [alt]="slide.alt || ''">}@if (slide.title) {<h3>{{ slide.title }}</h3>}@if (slide.content) {<p>{{ slide.content }}</p>}
          }
        </div>
      }
    </div>@if (!slides.length) {<p class="hw-carousel-empty">{{ emptyLabel }}</p>}</div>
    <div class="hw-carousel-controls">
      @if (showIndicators && slides.length) {<div class="hw-carousel-pagination" role="group" [attr.aria-label]="indicatorsLabel">@for (slide of slides; track slide.id || $index; let index = $index) {<button class="hw-carousel-dot" type="button" [attr.aria-label]="slideLabel(index + 1, slides.length)" [attr.aria-current]="index === indexValue ? 'true' : null" (click)="select(index)"></button>}</div>}
      <div class="hw-carousel-arrows"><button class="hw-button hw-carousel-arrow" type="button" data-hw-previous [attr.aria-label]="previousLabel" [disabled]="slides.length < 2 || (!loop && indexValue === 0)" (click)="move(-1)"></button><button class="hw-button hw-carousel-arrow" type="button" data-hw-next [attr.aria-label]="nextLabel" [disabled]="slides.length < 2 || (!loop && indexValue === slides.length - 1)" (click)="move(1)"></button></div>
      <span class="hw-carousel-status hw-sr-only" role="status" aria-live="polite">{{ slides.length ? slideLabel(indexValue + 1, slides.length) : emptyLabel }}</span>
    </div>
  </section>`})
export class HwCarouselComponent {
  @Input({required: true}) label = '';
  @Input() slides: readonly HwSlide[] = [];
  @Input() slideTemplate?: TemplateRef<{$implicit: HwSlide; index: number}>;
  @Input() current = 0;
  @Input({transform: booleanAttribute}) loop = false;
  @Input({transform: booleanAttribute}) showIndicators = true;
  @Input() indicatorsLabel = 'اختيار الشريحة';
  @Input() previousLabel = 'الشريحة السابقة';
  @Input() nextLabel = 'الشريحة التالية';
  @Input() emptyLabel = 'لا توجد شرائح';
  @Input() carouselDescription = 'عرض شرائح';
  @Input() slideDescription = 'شريحة';
  @Input() slideLabel = (current: number, total: number) => `${current} من ${total}`;
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
