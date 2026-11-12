import { booleanAttribute, Component, Directive, ElementRef, EventEmitter, forwardRef, inject, Input, Output, ViewChild, type AfterViewInit, type DoCheck, type OnChanges, type SimpleChanges } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR, type AbstractControl, type ValidationErrors, type Validator } from '@angular/forms';
import { clampRange, evaluateFileSelection, filterOptions, formatCalendarDate, getCalendarMonth, getDirection, getSearchSuggestions, hasText, isCalendarDateSupported, isDateInRange, isDisabled, isFileDrag, moveCalendarDate, normalizePinInput, normalizeRatingMax, normalizeRatingValue, prepareRemovalFocus, requestSearchDialogClose, UMALQURA_MAX_DATE, UMALQURA_MIN_DATE, type CalendarSystem, type Direction, type Option } from '@hawiyah/core';
import { HwValueControl } from './forms';
import { observeAngularFieldPresence } from './field-presence';
import { setConstraintValidity, writeFiles } from './platform';
import { HwTexts } from './text';
import { InputValueSync } from './input-value';
import { HwDialogComponent, HwTooltipComponent } from './overlays';

import { controlAria, controlFocus, fieldDescriptionIds, fieldEnd, fieldLabel, fieldLegend, groupFocus } from './field-templates';

/** Null writes from Angular form reset restore each control's empty value. */
@Directive()
export abstract class HwExpandedValueControl<T> extends HwValueControl<T> {
  @Input({transform: booleanAttribute}) readOnly = false;
  protected abstract emptyValue(): T;
  override writeValue(value: T | null): void { super.writeValue(value ?? this.emptyValue()); }
  override update(value: T): void { if (!this.readOnly) super.update(value); }
}

@Component({selector: 'hw-input-group', standalone: true, template: `<div class="hw-input-group" [attr.data-size]="size"><span class="hw-input-addon"><ng-content select="[hwPrefix]" /></span><ng-content /><span class="hw-input-addon"><ng-content select="[hwSuffix]" /></span></div>`})
export class HwInputGroupComponent { constructor() { observeAngularFieldPresence(); } @Input() size: 'sm' | 'md' | 'lg' = 'md'; }

@Component({selector: 'hw-password-field', standalone: true, providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwPasswordFieldComponent), multi: true}], template: `<div class="hw-field hw-password-field">${fieldLabel}<div class="hw-password-control"><input #passwordInput class="hw-input" [id]="controlId" [type]="visible ? 'text' : 'password'" [value]="value" [name]="name" [attr.form]="form" [disabled]="disabled" [readOnly]="readOnly" [required]="required" [attr.autocomplete]="autocomplete" [attr.placeholder]="placeholder || null" ${controlAria} (input)="update($any($event.target).value)" ${controlFocus}><button type="button" class="hw-button hw-password-toggle" data-variant="ghost" [attr.data-toggle-variant]="toggleVariant" [disabled]="disabled" [attr.aria-label]="toggleLabel" [attr.aria-pressed]="visible" [attr.aria-controls]="controlId" (click)="toggle()">@if (toggleVariant === 'text') { {{ toggleLabel }} } @else {<span class="hw-password-icon" aria-hidden="true"></span>}</button></div>${fieldEnd}</div>`})
export class HwPasswordFieldComponent extends HwExpandedValueControl<string> {
  override value = ''; protected emptyValue() { return ''; }
  @Input() autocomplete = 'current-password'; @Input() placeholder = ''; @Input() toggleVariant: 'icon' | 'text' = 'icon';
  /** Name (and, with toggleVariant="text", visible text) of the toggle while the value is hidden, and while it is shown. */
  @Input({required: true}) showLabel = ''; @Input({required: true}) hideLabel = '';
  protected readonly texts = new HwTexts('hw-password-field');
  get toggleLabel(): string | null { return this.visible ? this.texts.need('hideLabel', this.hideLabel) : this.texts.need('showLabel', this.showLabel); }
  @ViewChild('passwordInput') input?: ElementRef<HTMLInputElement>;
  /** Whether the value is shown as text. A value written once is the initial state; the component then updates it, so [(visible)] works. */
  @Input({transform: booleanAttribute}) visible = false;
  /** The toggle changed the visibility, or a native reset hid a visible value. Not emitted when the application changes `visible`. */
  @Output() readonly visibleChange = new EventEmitter<boolean>();
  toggle() { if (this.input && !isDisabled(this.input.nativeElement)) this.setVisible(!this.visible); }
  private setVisible(next: boolean) { if (next === this.visible) return; this.visible = next; this.visibleChange.emit(next); this.changeDetector.markForCheck(); }
  // A native reset always hides the value; a value written by Angular Forms does not change visibility.
  protected override afterReset() { this.setVisible(false); }
  protected override syncDom() { if (this.input) this.input.nativeElement.value = this.value; }
}

@Component({selector: 'hw-search-field', standalone: true, providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwSearchFieldComponent), multi: true}], template: `
<div #searchRoot class="hw-field hw-search-field">${fieldLabel}<div class="hw-input-group"><div class="hw-search-control">
<input #input class="hw-input" type="search" [autofocus]="autofocus" [id]="controlId" [value]="value" [name]="name" [attr.form]="form" [disabled]="disabled" [readOnly]="readOnly" [required]="required" [attr.placeholder]="placeholder || null" [attr.autocomplete]="autocomplete" ${controlAria} [attr.role]="suggestions !== undefined ? 'combobox' : null" [attr.aria-autocomplete]="suggestions !== undefined ? 'list' : null" [attr.aria-expanded]="suggestions !== undefined ? expanded : null" [attr.aria-controls]="suggestions !== undefined ? listId : null" [attr.aria-activedescendant]="expanded && active >= 0 && active < matches.length ? listId + '-' + active : null" (input)="inputChanged($event)" (keydown)="searchKey($event)" (focus)="focused(); focusEvents.emit($event)" (compositionstart)="compositionStart()" (compositionend)="compositionEnd()" (blur)="blurred(); blurEvents.emit($event)">
<button type="button" class="hw-button hw-search-clear" data-variant="ghost" [hidden]="!value || readOnly" [disabled]="disabled" [attr.aria-controls]="controlId" [attr.aria-label]="texts.need('clearLabel', clearLabel)" (pointerdown)="keepFocus($event)" (mousedown)="keepFocus($event)" (click)="clear()"><span class="hw-search-clear-icon" aria-hidden="true"></span></button>
@if (suggestions !== undefined) {<div class="hw-search-suggestions" [id]="listId" role="listbox" [attr.aria-label]="ariaLabel" [attr.aria-labelledby]="ariaLabelledby ?? (ariaLabel || !label ? null : decorationId + '-label')" [hidden]="!expanded">@for (match of matches; track match.value; let i = $index) {<div class="hw-search-option" dir="auto" [id]="listId + '-' + i" role="option" [attr.aria-selected]="active === i" (pointerdown)="keepFocus($event)" (mousedown)="keepFocus($event)" (click)="choose(i)">@for (segment of match.segments; track $index) {@if (segment.match) {<strong>{{ segment.text }}</strong>} @else {{{ segment.text }}}}</div>}</div>}
</div>@if (showSearchButton) {<button type="button" class="hw-button hw-search-submit" [disabled]="disabled" [attr.aria-label]="texts.need('searchLabel', searchLabel, 'showSearchButton is on')" (click)="search()"><span class="hw-search-submit-icon" aria-hidden="true"></span></button>}</div>
@if (suggestions !== undefined) {<span class="hw-sr-only" role="status" aria-live="polite" aria-atomic="true">{{ opened && !readOnly && !disabled && !composing && value.trim() ? texts.call('getResultsMessage', getResultsMessage, [matches.length], 'suggestions are given') : '' }}</span>}
${fieldEnd}</div>`})
export class HwSearchFieldComponent extends HwExpandedValueControl<string> implements DoCheck {
  override value = ''; protected emptyValue() {return '';}
  // The field label names the input unless aria-label, aria-labelledby or a surrounding hw-field does.
  ngDoCheck(): void { if (!this.named) this.texts.need('label', this.label); }
  @Input() placeholder = ''; @Input() autocomplete = 'off'; @Input({transform: booleanAttribute}) autofocus = false; /** Accessible name of the clear button. */ @Input({required: true}) clearLabel = ''; /** Accessible name of the search button. Required when showSearchButton is on. */ @Input() searchLabel = '';
  @Input() suggestions?: readonly string[]; @Input() maxSuggestions = 8;
  /** Live-region announcement of the suggestion count. Required when suggestions are given. */
  @Input() getResultsMessage?: (count: number) => string;
  protected readonly texts = new HwTexts('hw-search-field');
  /** The search button is rendered only on request; Enter runs the search without it. */
  @Input({transform: booleanAttribute}) showSearchButton = false;
  @Output() readonly searched = new EventEmitter<string>();
  @ViewChild('input') input?: ElementRef<HTMLInputElement>; @ViewChild('searchRoot') searchRoot?: ElementRef<HTMLElement>;
  composing = false; opened = false; active = -1;
  private expectedValue?: string; private suggestionSignature?: string; private observer?: MutationObserver;
  private outside = (event: Event) => {if (!this.searchRoot?.nativeElement.contains(event.target as Node)) {this.close();this.changeDetector.markForCheck();}};
  get listId(): string {return `${this.controlId}-suggestions`;}
  get matches() {return getSearchSuggestions(this.value || '', this.suggestions ?? [], this.maxSuggestions);}
  get expanded(): boolean {return this.opened && this.suggestions !== undefined && !this.disabled && !this.readOnly && !this.composing && this.matches.length > 0;}
  private editable(): boolean {return !!this.input && !this.readOnly && !this.input.nativeElement.readOnly && !isDisabled(this.input.nativeElement);}
  close(): void {this.opened = false;this.active = -1;}
  focus(): void {if (this.input && !isDisabled(this.input.nativeElement)) this.input.nativeElement.focus();}
  focused(): void {if (this.editable() && !this.composing) this.opened = true;}
  blurred(): void {this.touch();this.close();}
  compositionStart(): void {this.composing = true;this.close();}
  compositionEnd(): void {this.composing = false;if (this.editable()) this.opened = true;}
  keepFocus(event: MouseEvent): void {if (event.button === 0) event.preventDefault();}
  inputChanged(event: Event): void {if (event.defaultPrevented || !this.editable()) return;this.expectedValue = (event.target as HTMLInputElement).value;this.update(this.expectedValue);this.active = -1;this.opened = !this.composing;}
  clear(): void {if (!this.editable()) return;this.expectedValue = '';this.update('');this.focus();this.close();}
  choose(index: number): void {if (!this.editable() || this.composing) return;const match = this.matches[index];if (!match) return;this.expectedValue = match.value;this.update(match.value);this.focus();this.close();}
  search(): void {if (!this.input || isDisabled(this.input.nativeElement) || this.composing) return;const query = this.value.trim();if (query) this.searched.emit(query);this.close();}
  searchKey(event: KeyboardEvent): void {
    if (event.defaultPrevented || this.composing || event.isComposing || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey || !this.input || isDisabled(this.input.nativeElement)) return;
    if (event.key === 'Escape' && this.expanded) {event.preventDefault();event.stopPropagation();this.close();return;}
    if (event.key === 'Escape' && requestSearchDialogClose(this.input.nativeElement)) {event.preventDefault();event.stopPropagation();return;}
    const count = this.matches.length;
    if (this.editable() && count && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {event.preventDefault();this.opened = true;this.active = event.key === 'ArrowDown' ? (this.active + 1) % count : this.active <= 0 ? count - 1 : this.active - 1;return;}
    if (event.key === 'Enter') {if (this.expanded && this.active >= 0) {event.preventDefault();this.choose(this.active);} else this.search();}
  }
  ngOnChanges(changes: SimpleChanges): void {
    const signature = JSON.stringify(this.suggestions);
    if (signature !== this.suggestionSignature || changes['maxSuggestions'] || changes['readOnly'] || changes['disabled']) this.close();
    this.suggestionSignature = signature;
    if (changes['value']) {if (this.value !== this.expectedValue) this.close();this.active = -1;this.expectedValue = undefined;}
  }
  ngAfterViewInit(): void {
    const input = this.input!.nativeElement;input.ownerDocument.addEventListener('pointerdown', this.outside);
    const Observer = input.ownerDocument.defaultView?.MutationObserver;
    this.observer = Observer ? new Observer(() => {if (input.readOnly || isDisabled(input)) {this.close();this.changeDetector.markForCheck();}}) : undefined;
    this.observer?.observe(input, {attributes: true, attributeFilter: ['readonly','disabled','aria-disabled']});
    for (let parent = input.parentElement; parent; parent = parent.parentElement) if (parent.localName === 'fieldset') this.observer?.observe(parent, {attributes: true, attributeFilter: ['disabled']});
  }
  ngAfterViewChecked(): void {
    if (!this.expanded || this.active < 0) return;const list = this.input?.nativeElement.ownerDocument.getElementById(this.listId), option = list?.children[this.active] as HTMLElement | undefined;
    if (!list || !option) return;const outer = list.getBoundingClientRect(), inner = option.getBoundingClientRect();if (inner.top < outer.top) list.scrollTop -= outer.top - inner.top;else if (inner.bottom > outer.bottom) list.scrollTop += inner.bottom - outer.bottom;
  }
  override writeValue(value: string | null): void {super.writeValue(value);this.close();this.composing = false;}
  protected override afterReset(): void {this.close();this.composing = false;}
  protected override syncDom(): void {if (this.input) this.input.nativeElement.value = this.value;}
  override setDisabledState(disabled: boolean): void {super.setDisabledState(disabled);if (disabled) this.close();}
  ngOnDestroy(): void {this.observer?.disconnect();this.input?.nativeElement.ownerDocument.removeEventListener('pointerdown', this.outside);}
}

@Component({selector: 'hw-number-field', standalone: true, providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwNumberFieldComponent), multi: true}], template: `<div class="hw-field hw-number-field">${fieldLabel}<input #input class="hw-input" type="number" [id]="controlId" [name]="name" [attr.form]="form" [attr.value]="value" [disabled]="disabled" [readOnly]="readOnly" [required]="required" [attr.min]="min" [attr.max]="max" [step]="step" ${controlAria} (input)="numberChanged($event)" ${controlFocus}>${fieldEnd}</div>`})
export class HwNumberFieldComponent extends HwExpandedValueControl<number | null> {
  override value: number | null = null; protected emptyValue() { return null; } @Input() min: number | null = null; @Input() max: number | null = null; @Input() step: number | 'any' = 1;
  @ViewChild('input') input?: ElementRef<HTMLInputElement>;
  // Written after each render, never bound: '-' or '1e' is not a number yet, and
  // echoing the resulting null back into the input would erase what was typed.
  private readonly shown = new InputValueSync();
  private text(value: number | null) { return value == null || Number.isNaN(value) ? '' : String(value); }
  numberChanged(event: Event) { const typed = (event.target as HTMLInputElement).valueAsNumber, value = Number.isNaN(typed) ? null : typed; this.shown.typed(this.text(value)); this.update(value); }
  ngAfterViewChecked() { this.shown.apply(this.input?.nativeElement, this.text(this.value)); }
  override writeValue(value: number | null) { super.writeValue(value); this.shown.force(); }
  protected override syncDom() { this.shown.force(); this.shown.apply(this.input?.nativeElement, this.text(this.value)); }
}

@Component({selector: 'hw-slider', standalone: true, providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwSliderComponent), multi: true}], template: `<div class="hw-field">${fieldLabel}<input #control class="hw-slider" type="range" [id]="controlId" [name]="name" [attr.form]="form" [value]="value" [min]="min" [max]="max" [step]="step" [disabled]="disabled" [attr.aria-readonly]="readOnly || null" [attr.aria-valuetext]="formatValue ? formatValue(value) : null" ${controlAria} (pointerdown)="guardPointer($event)" (keydown)="guardKey($event)" (input)="changed($event)" ${controlFocus}>@if (showValue) {<output class="hw-slider-value" [attr.for]="controlId">{{ formatValue ? formatValue(value) : value }}</output>}${fieldEnd}</div>`})
export class HwSliderComponent extends HwExpandedValueControl<number> {
  override value = 0; protected emptyValue() { return this.min; }
  @Input() min = 0; @Input() max = 100; @Input() step = 1;
  /** Shows the value in an output element after the slider. */
  @Input({transform: booleanAttribute}) showValue = false;
  /** Text of the value for the output and for aria-valuetext, which is written only when this is given. */
  @Input() formatValue?: (value: number) => string;
  @ViewChild('control') control?: ElementRef<HTMLInputElement>;
  protected override syncDom() { if (this.control) this.control.nativeElement.value = String(this.value); }
  guardPointer(event: PointerEvent) { if (this.readOnly) event.preventDefault(); }
  guardKey(event: KeyboardEvent) { if (this.readOnly && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) event.preventDefault(); }
  changed(event: Event) {
    const input = event.target as HTMLInputElement;
    if (this.readOnly || isDisabled(input)) { input.value = String(this.value); return; }
    this.update(input.valueAsNumber);
  }
}

@Component({selector: 'hw-range-slider', standalone: true, providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwRangeSliderComponent), multi: true}], template: `<fieldset class="hw-field hw-range-slider" [disabled]="disabled" ${controlAria} ${groupFocus}>${fieldLegend}<label class="hw-label">{{ texts.need('lowerLabel', lowerLabel) }}<input #lower class="hw-slider" type="range" [id]="controlId + '-lower'" [name]="lowerName || name" [attr.form]="form" [min]="min" [max]="pair[1]" [step]="step" [value]="pair[0]" [disabled]="disabled" [attr.aria-readonly]="readOnly || null" [attr.aria-valuetext]="formatValue ? formatValue(pair[0]) : null" (pointerdown)="guardPointer($event)" (keydown)="guardKey($event)" (input)="changed($event, 'lower')" (blur)="touch()"></label><label class="hw-label">{{ texts.need('upperLabel', upperLabel) }}<input #upper class="hw-slider" type="range" [id]="controlId + '-upper'" [name]="upperName || name" [attr.form]="form" [min]="pair[0]" [max]="max" [step]="step" [value]="pair[1]" [disabled]="disabled" [attr.aria-readonly]="readOnly || null" [attr.aria-valuetext]="formatValue ? formatValue(pair[1]) : null" (pointerdown)="guardPointer($event)" (keydown)="guardKey($event)" (input)="changed($event, 'upper')" (blur)="touch()"></label>@if (getRangeLabel) {<output class="hw-range-slider-value" [attr.for]="controlId + '-lower ' + controlId + '-upper'">{{ getRangeLabel(pair[0], pair[1]) }}</output>}${fieldEnd}</fieldset>`})
export class HwRangeSliderComponent extends HwExpandedValueControl<[number, number]> {
  override value: [number, number] = [0, 100]; protected emptyValue(): [number, number] { return [this.min, this.max]; }
  @Input() min = 0; @Input() max = 100; @Input() step = 1; /** Visible labels of the lower and upper thumbs. */ @Input({required: true}) lowerLabel = ''; @Input({required: true}) upperLabel = ''; @Input() lowerName = ''; @Input() upperName = '';
  /** Text of one thumb's value for its aria-valuetext, which is written only when this is given. */
  @Input() formatValue?: (value: number) => string;
  /** Visible text of the whole range. The output element is rendered only when this is given; no separator is built in. */
  @Input() getRangeLabel?: (lower: number, upper: number) => string;
  @ViewChild('lower') lower?: ElementRef<HTMLInputElement>; @ViewChild('upper') upper?: ElementRef<HTMLInputElement>;
  protected readonly texts = new HwTexts('hw-range-slider');
  // Each thumb is limited by the other one: both limits are widened before the two values are written.
  protected override syncDom() {
    const lower = this.lower?.nativeElement, upper = this.upper?.nativeElement, [low, high] = this.pair;
    if (!lower || !upper) return;
    lower.max = String(this.max); upper.min = String(this.min); lower.value = String(low); upper.value = String(high); lower.max = String(high); upper.min = String(low);
  }
  get pair(): [number, number] { return clampRange(this.value ?? [this.min, this.max], this.min, this.max, 'lower'); }
  guardPointer(event: PointerEvent) { if (this.readOnly) event.preventDefault(); }
  guardKey(event: KeyboardEvent) { if (this.readOnly && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) event.preventDefault(); }
  changed(event: Event, changed: 'lower' | 'upper') {
    const input = event.target as HTMLInputElement; const index = changed === 'lower' ? 0 : 1;
    if (this.readOnly || isDisabled(input)) { input.value = String(this.pair[index]); return; }
    const next = [...this.pair] as [number, number]; next[index] = input.valueAsNumber;
    const pair = clampRange(next, this.min, this.max, changed); this.update(pair); input.value = String(pair[index]);
  }
}

@Component({selector: 'hw-rating', standalone: true, providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwRatingComponent), multi: true}], template: `<fieldset class="hw-field hw-rating" [disabled]="disabled" [attr.data-hw-readonly]="readOnly || null" ${controlAria} ${groupFocus}>${fieldLegend}@for (rating of ratings; track rating) {<label><input type="radio" [name]="name || controlId" [attr.form]="form" [value]="rating" [checked]="currentInput === rating" [required]="required" [attr.aria-disabled]="readOnly || null" (click)="guardClick($event)" (keydown)="guardKey($event)" (change)="changed($event, rating)" (blur)="touch()"><span aria-hidden="true">★</span><span class="hw-sr-only">{{ texts.call('getRatingLabel', getRatingLabel, [rating, total]) }}</span></label>}${fieldEnd}</fieldset>`})
export class HwRatingComponent extends HwExpandedValueControl<number> {
  override value = 0; protected emptyValue() { return 0; }
  @Input() max = 5;
  /** Accessible name of each rating option. */
  @Input({required: true}) getRatingLabel!: (value: number, max: number) => string;
  protected readonly texts = new HwTexts('hw-rating');
  get total() { return normalizeRatingMax(this.max); }
  get currentInput() { return Math.floor(normalizeRatingValue(this.value, this.total)); }
  get ratings() { return Array.from({length: this.total}, (_, i) => i + 1); }
  private show(fieldset: Element | null | undefined) { fieldset?.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach(radio => { radio.checked = Number(radio.value) === this.currentInput; }); }
  private restore(input: HTMLInputElement) { this.show(input.closest('fieldset')); }
  protected override syncDom() { this.show(this.hostElement); }
  guardClick(event: MouseEvent) { if (this.readOnly) { event.preventDefault(); this.restore(event.currentTarget as HTMLInputElement); } }
  guardKey(event: KeyboardEvent) { if (this.readOnly && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(event.key)) event.preventDefault(); }
  changed(event: Event, rating: number) { const input = event.currentTarget as HTMLInputElement; if (this.readOnly || isDisabled(input)) { this.restore(input); return; } this.update(rating); }
}
/** Aggregate score with fractional fill; this component has no form controls. */
@Component({selector: 'hw-rating-display', standalone: true, template: `<div class="hw-rating-display" role="img" [attr.aria-label]="texts.call('getValueLabel', getValueLabel, [score, total])"><span class="hw-rating-stars" aria-hidden="true">@for (star of stars; track star) {<span class="hw-rating-star">★<span class="hw-rating-fill" [style.--hw-rating-fill]="fill(star) + '%'"></span></span>}</span>@if (showValue) {<span class="hw-rating-score" aria-hidden="true">{{ score }}/{{ total }}</span>}</div>`})
export class HwRatingDisplayComponent {
  @Input() value = 0;
  @Input() max = 5;
  @Input({transform: booleanAttribute}) showValue = true;
  /** The whole text alternative of the display, for example the subject and its score. */
  @Input({required: true}) getValueLabel!: (value: number, max: number) => string;
  protected readonly texts = new HwTexts('hw-rating-display');
  get total() { return normalizeRatingMax(this.max); }
  get score() { return normalizeRatingValue(this.value, this.total); }
  get stars() { return Array.from({length: this.total}, (_, index) => index); }
  fill(index: number) { return Math.min(1, Math.max(0, this.score - index)) * 100; }
}

@Component({selector: 'hw-pin-input', standalone: true, providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwPinInputComponent), multi: true}], template: `<div class="hw-field hw-pin-input">${fieldLabel}<input #input class="hw-input" type="text" inputmode="numeric" autocomplete="one-time-code" [attr.pattern]="'[0-9]{' + normalizedLength + '}'" [id]="controlId" [name]="name" [attr.form]="form" [value]="normalizedValue" [disabled]="disabled" [readOnly]="readOnly" [required]="required" ${controlAria} (invalid)="submissionInvalid = true" (input)="inputChanged($event)" (focus)="focusEvents.emit($event)" (blur)="blurred($event)">${fieldEnd}</div>`})
export class HwPinInputComponent extends HwExpandedValueControl<string> {
  override value = ''; protected emptyValue() { return ''; } @Input() length = 6;
  @ViewChild('input') input?: ElementRef<HTMLInputElement>;
  /** Focus left the input with some, but not all, of the digits. */
  incomplete = false;
  get normalizedLength() { return Math.max(1, Math.floor(this.length) || 6); }
  // The input carries no maxlength: the browser would cut a pasted code before its separators are removed.
  get normalizedValue() { return normalizePinInput(this.value ?? '', this.normalizedLength); }
  override get invalid(): true | null { return super.invalid || this.incomplete ? true : null; }
  inputChanged(event: Event) {
    const input = event.target as HTMLInputElement, previous = this.normalizedValue;
    const next = normalizePinInput(input.value, this.normalizedLength, previous, (event as InputEvent).inputType);
    if (next !== previous) this.update(next);
    input.value = this.normalizedValue;
    if (!next.length || next.length === this.normalizedLength) this.incomplete = false;
    if (input.validity?.valid) this.submissionInvalid = false;
  }
  blurred(event: FocusEvent) { const length = this.normalizedValue.length; this.incomplete = length > 0 && length < this.normalizedLength; this.touch(); this.blurEvents.emit(event); }
  override writeValue(value: string | null) { super.writeValue(value); this.incomplete = false; this.submissionInvalid = false; }
  protected override afterReset() { this.incomplete = false; }
  protected override syncDom() { if (this.input) this.input.nativeElement.value = this.normalizedValue; }
}

/** The bordered box holds only the chip list and the text input; label, hint and error are its siblings in the field.
 * Enter or comma commits the draft: there is no Add button. */
@Component({selector: 'hw-tag-input', standalone: true, providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwTagInputComponent), multi: true}], template: `<div class="hw-field">${fieldLabel}<div #box class="hw-tag-input"><ul role="list">@for (tag of value; track tag) {<li class="hw-chip">{{ tag }}<button type="button" [disabled]="disabled || readOnly" [attr.aria-label]="texts.call('getRemoveLabel', getRemoveLabel, [tag])" (click)="remove(tag, $any($event.currentTarget))"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button><input type="hidden" [name]="name" [attr.form]="form" [value]="tag" [disabled]="disabled"></li>}</ul><input #input type="text" class="hw-input" [id]="controlId" [attr.form]="form" [value]="draft" [disabled]="disabled" [readOnly]="readOnly" [attr.placeholder]="placeholder || null" [attr.aria-required]="required || null" ${controlAria} (invalid)="submissionInvalid = true" (input)="draft = $any($event.target).value" (keydown)="keydown($event)" (compositionstart)="composing = true" (compositionend)="composing = false" ${controlFocus}></div>${fieldEnd}</div>`})
export class HwTagInputComponent extends HwExpandedValueControl<string[]> implements OnChanges { override value: string[] = []; protected emptyValue() { return []; } @Input() placeholder = ''; /** Accessible name of a tag's remove button. */ @Input({required: true}) getRemoveLabel!: (tag: string) => string; /** Custom validity message while a required input has no tag. Required when required is set. */ @Input() requiredMessage = ''; protected readonly texts = new HwTexts('hw-tag-input'); draft = ''; composing = false; private get blocked() { return this.disabled || this.readOnly || !!this.input && isDisabled(this.input.nativeElement); } @ViewChild('input') input?: ElementRef<HTMLInputElement>; @ViewChild('box') box?: ElementRef<HTMLElement>; add() { const tag = this.draft.trim(); if (!tag || this.blocked) return; if (!this.value.includes(tag)) this.update([...this.value, tag]); this.draft = ''; this.validity(); this.input?.nativeElement.focus(); } /** `button` is the activated remove button: when it held focus, focus moves to the next chip's remove button, else the previous one, else the text input. */ remove(tag: string, button?: HTMLElement) { if (this.blocked) return; const restore = button && this.box && this.input ? prepareRemovalFocus(this.box.nativeElement, button, {item: '.hw-chip', control: 'button', fallback: this.input.nativeElement}) : undefined; this.update(this.value.filter(value => value !== tag)); this.validity(); if (restore) { this.changeDetector.detectChanges(); restore(); } else this.input?.nativeElement.focus(); } keydown(event: KeyboardEvent) { if (event.defaultPrevented || this.blocked || this.composing || event.isComposing || event.ctrlKey || event.altKey || event.metaKey) return; if ((event.key === 'Enter' || event.key === ',') && this.draft.trim()) { event.preventDefault(); this.add(); } else if (event.key === 'Backspace' && !this.draft && this.value.length) { event.preventDefault(); this.remove(this.value.at(-1)!); } } ngAfterViewInit() { this.validity(); } ngOnChanges() { this.validity(); } private get constrained() { return this.required && !this.disabled && !this.value.length; } private validity() { if (this.constrained) this.texts.need('requiredMessage', this.requiredMessage, 'required is set'); setConstraintValidity(this.input?.nativeElement, this.constrained, this.requiredMessage); if (this.submissionInvalid && this.input?.nativeElement.validity?.valid) this.submissionInvalid = false; } protected override afterReset() { this.draft = ''; this.validity(); } protected override syncDom() { if (this.input) this.input.nativeElement.value = ''; } override writeValue(value: string[] | null) { super.writeValue(value); this.draft = ''; this.validity(); } override setDisabledState(disabled: boolean) { super.setDisabledState(disabled); this.validity(); } }

@Component({selector: 'hw-multi-select', standalone: true, providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwMultiSelectComponent), multi: true}], template: `<fieldset class="hw-field hw-multi-select" [disabled]="disabled" [attr.data-hw-readonly]="readOnly ? 'true' : null" ${controlAria} ${groupFocus}>${fieldLegend}@if (texts.need('searchLabel', searchLabel); as filterLabel) {<label class="hw-label" [for]="controlId">{{ filterLabel }}</label>}<input #search class="hw-input" type="search" [id]="controlId" [attr.form]="form" [value]="query" [attr.placeholder]="placeholder || null" [disabled]="disabled" [attr.aria-required]="required || null" [attr.aria-describedby]="descriptionIds" [attr.aria-invalid]="invalid" (invalid)="submissionInvalid = true" (input)="filter($any($event.target).value)" (blur)="touch()"><div class="hw-multi-select-options">@for (option of filtered; track option.value) {<label class="hw-choice"><input class="hw-checkbox" type="checkbox" [value]="option.value" [checked]="selectedValues.includes(option.value)" [disabled]="disabled || option.disabled" [attr.aria-disabled]="readOnly ? 'true' : null" (click)="readOnly && $event.preventDefault()" (change)="toggle(option)" (blur)="touch()">{{ option.label }}</label>} @empty {<p class="hw-hint">{{ texts.need('emptyMessage', emptyMessage) }}</p>}</div><span class="hw-sr-only" role="status" aria-live="polite" aria-atomic="true">{{ announce ? texts.call('getResultsMessage', getResultsMessage, [filtered.length]) : '' }}</span>@if (getSelectedMessage) {<p class="hw-multi-select-selected" role="status">{{ getSelectedMessage(selectedValues.length) }}</p>}@for (selected of selectedValues; track selected) {<input type="hidden" [name]="name" [attr.form]="form" [value]="selected" [disabled]="disabled">}${fieldEnd}</fieldset>`})
export class HwMultiSelectComponent extends HwExpandedValueControl<string[]> implements OnChanges {
  override value: string[] = []; protected emptyValue() { return []; } @Input() options: readonly Option[] = []; @ViewChild('search') search?: ElementRef<HTMLInputElement>; query = '';
  /** Visible label of the filter input; it is not reused as a placeholder. */
  @Input({required: true}) searchLabel = '';
  /** Optional format hint of the filter input. No attribute is rendered without it. */
  @Input() placeholder = '';
  /** Shown when no option matches the filter. */
  @Input({required: true}) emptyMessage = '';
  /** Optional status text with the number of selected options. The status element is rendered only while this is given. */
  @Input() getSelectedMessage?: (count: number) => string;
  /** Live-region announcement of the number of options that match the filter, after the reader filters. */
  @Input({required: true}) getResultsMessage!: (count: number) => string;
  /** The results status is empty until the reader filters, and again after a write or a reset. */
  announce = false;
  filter(query: string) { this.query = query; this.announce = true; }
  /** Custom validity message while a required control has no selection. Required when required is set. */
  @Input() requiredMessage = '';
  protected readonly texts = new HwTexts('hw-multi-select');
  get selectedValues() { return this.value.filter(value => this.options.some(option => option.value === value && !option.disabled)); }
  get filtered() { return filterOptions(this.options, this.query); }
  toggle(option: Option) { if (!option.disabled) { this.update(this.selectedValues.includes(option.value) ? this.selectedValues.filter(value => value !== option.value) : [...this.selectedValues, option.value]); this.validity(); } }
  ngAfterViewInit() { this.validity(); } ngOnChanges() { this.validity(); }
  private get constrained() { return this.required && !this.disabled && !this.selectedValues.length; }
  /** A violated constraint without a message still blocks submission; it is exposed as invalid only after a failed submission. */
  private validity() { if (this.constrained) this.texts.need('requiredMessage', this.requiredMessage, 'required is set'); setConstraintValidity(this.search?.nativeElement, this.constrained, this.requiredMessage); if (this.submissionInvalid && this.search?.nativeElement.validity?.valid) this.submissionInvalid = false; }
  override writeValue(value: string[] | null) { super.writeValue(value); this.query = ''; this.announce = false; this.validity(); }
  protected override afterReset() { this.query = ''; this.announce = false; this.validity(); }
  protected override syncDom() {
    if (this.search) this.search.nativeElement.value = '';
    this.hostElement.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach(box => { box.checked = this.selectedValues.includes(box.value); });
  }
  override setDisabledState(value: boolean) { super.setDisabledState(value); this.validity(); }
}

const emptyMonth: ReturnType<typeof getCalendarMonth> = {label: '', weekdays: [], days: [], previous: '', next: ''};
@Component({selector: 'hw-calendar', standalone: true, imports: [HwTooltipComponent], providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwCalendarComponent), multi: true}], template: `<div class="hw-field hw-calendar" [attr.dir]="direction || null">@if (hasLocale) {<div class="hw-calendar-toolbar"><button class="hw-button hw-calendar-prev" data-variant="ghost" type="button" [disabled]="disabled || !canPrevious" [attr.aria-label]="texts.need('previousLabel', previousLabel)" (click)="navigate(data.previous)"><span class="hw-icon" data-icon="arrow-left-01" data-directional="true" data-size="md" aria-hidden="true"></span></button><div class="hw-calendar-heading"><h3 [id]="controlId + '-month'" aria-live="polite">{{ data.label }}</h3>@if (calendar === 'islamic-umalqura') {<hw-tooltip class="hw-calendar-info" [text]="rangeDescription" [tooltipId]="rangeTooltipId || controlId + '-range'"><span class="hw-calendar-info-icon" aria-hidden="true">i</span><span class="hw-sr-only">{{ texts.need('rangeLabel', rangeLabel, 'calendar is islamic-umalqura') }}</span></hw-tooltip>}</div><button class="hw-button hw-calendar-next" data-variant="ghost" type="button" [disabled]="disabled || !canNext" [attr.aria-label]="texts.need('nextLabel', nextLabel)" (click)="navigate(data.next)"><span class="hw-icon" data-icon="arrow-right-01" data-directional="true" data-size="md" aria-hidden="true"></span></button></div><table class="hw-calendar-grid" role="grid" [attr.aria-label]="texts.need('label', label)" [attr.aria-describedby]="descriptionIds"><thead><tr>@for (weekday of data.weekdays; track $index) {<th scope="col">{{ weekday }}</th>}</tr></thead><tbody>@for (week of weeks; track $index) {<tr>@for (day of week; track day.value) {<td role="gridcell" [attr.aria-selected]="day.selected"><button type="button" class="hw-calendar-day" [attr.data-date]="day.value" [attr.data-outside]="day.outside" [attr.data-selected]="day.selected" [attr.aria-current]="day.today ? 'date' : null" [attr.aria-label]="dateLabel(day.value)" [attr.aria-disabled]="readOnly || null" [tabIndex]="day.value === tabbable ? 0 : -1" [disabled]="disabled || day.disabled" (click)="select(day.value)" (keydown)="keydown($event, day.value)" (blur)="touch()">{{ day.label }}</button></td>}</tr>}</tbody></table>}<input type="hidden" [name]="name" [value]="value" [disabled]="disabled">${fieldEnd}</div>`})
export class HwCalendarComponent extends HwExpandedValueControl<string> implements OnChanges {
  protected readonly texts = new HwTexts('hw-calendar');
  /** Accessible name of the grid. */
  @Input({required: true}) override label = '';
  /** BCP 47 tag handed to Intl for month names, weekday names, the era and day names. There is no default: without it the toolbar and the grid are not rendered. */
  @Input({required: true}) locale = '';
  /** False, with one development warning, while the application has not supplied a locale. No core helper is called then. */
  get hasLocale(): boolean { return this.texts.need('locale', this.locale) !== null; }
  /** Accessible names of the previous-month and next-month buttons. */
  @Input({required: true}) previousLabel = ''; @Input({required: true}) nextLabel = '';
  /** Name of the supported-range information and lead-in of its tooltip. Required when calendar is 'islamic-umalqura'. */
  @Input() rangeLabel = '';
  /** Id of the supported-range tooltip. Derived from controlId when omitted. */
  @Input() rangeTooltipId = '';
  /** Optional accessible name of a day button; value is the ISO date. The default is Intl formatting for locale. */
  @Input() getDayLabel?: (value: string) => string;
  /** The ISO range is data; only the lead-in is text. */
  get rangeDescription() { return [hasText(this.rangeLabel) ? this.rangeLabel : '', `\u2066${UMALQURA_MIN_DATE} – ${UMALQURA_MAX_DATE}\u2069`].filter(Boolean).join(' '); }

  override value = ''; protected emptyValue() { return ''; }
  @Input() month = ''; @Input() min = ''; @Input() max = ''; @Input() calendar: CalendarSystem = 'gregory'; @Input() weekStartsOn = 0; @Input() direction?: Direction; @Output() readonly monthChange = new EventEmitter<string>();
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef); focused = '';
  private cachedMonth?: ReturnType<typeof getCalendarMonth>; private cachedMonthKey = '';
  get data(): ReturnType<typeof getCalendarMonth> { if (!this.hasLocale) return emptyMonth; const options = {month: isDateInRange(this.month) ? this.month : isDateInRange(this.value) ? this.value : undefined, value: isDateInRange(this.value) ? this.value : '', min: this.min || undefined, max: this.max || undefined, locale: this.locale, calendar: this.calendar, weekStartsOn: this.weekStartsOn, fixedWeeks: true}; const key = JSON.stringify(options); if (!this.cachedMonth || key !== this.cachedMonthKey) { this.cachedMonth = getCalendarMonth(options); this.cachedMonthKey = key; } return this.cachedMonth; }
  get weeks() { const days = this.data.days; return Array.from({length: 6}, (_, index) => days.slice(index * 7, index * 7 + 7)); }
  get tabbable() { const days = this.data.days; return days.find(day => day.value === this.focused && !day.disabled)?.value ?? days.find(day => day.selected && !day.disabled)?.value ?? days.find(day => !day.outside && !day.disabled)?.value ?? days.find(day => !day.disabled)?.value ?? ''; }
  ngOnChanges(changes: SimpleChanges) { if (this.value && isDateInRange(this.value)) { this.focused = this.value; if (changes['value'] && !changes['month']) this.month = this.value; } }
  override writeValue(value: string | null) { super.writeValue(value); this.focused = this.value; this.month = this.value; }
  focusSelected() { this.month = this.value || ''; this.focused = this.value; this.changeDetector.detectChanges(); this.host.nativeElement.querySelector<HTMLButtonElement>('.hw-calendar-day[tabindex="0"]')?.focus(); }
  get canPrevious() {
    const first = this.data.days.find(day => !day.outside)?.value;
    return !!first && this.data.previous !== first && (!this.min || moveCalendarDate(first, -1, 'day', 'gregory') >= this.min);
  }
  get canNext() {
    return this.data.next !== this.data.days.find(day => !day.outside)?.value && (!this.max || this.data.next <= this.max);
  }
  private readonly dateLabels = new Map<string, string>();
  /** The application's name for the day, otherwise Intl's full date for locale; no words are added. */
  dateLabel(value: string): string | null {
    if (this.getDayLabel) return this.getDayLabel(value) || null;
    if (!isCalendarDateSupported(value, this.calendar)) return value;
    if (!this.hasLocale) return null;
    const key = `${this.locale}/${this.calendar}/${value}`; const cached = this.dateLabels.get(key); if (cached) return cached;
    const label = formatCalendarDate(value, {locale: this.locale, calendar: this.calendar, dateStyle: 'full'});
    if (this.dateLabels.size > 100) this.dateLabels.clear(); this.dateLabels.set(key, label); return label;
  }
  navigate(month: string) { if (this.disabled) return; this.month = month; this.focused = ''; this.monthChange.emit(month); }
  select(value: string) { if (this.disabled || this.readOnly || !isDateInRange(value, this.min || undefined, this.max || undefined)) return; this.focused = value; this.month = value; this.update(value); this.touch(); }
  keydown(event: KeyboardEvent, value: string) {
    if (this.disabled || event.altKey || event.ctrlKey || event.metaKey) return;
    const rtl = (this.direction ?? getDirection(this.host.nativeElement)) === 'rtl';
    let next = value;
    try {
    if (event.key === 'ArrowRight') next = moveCalendarDate(value, rtl ? -1 : 1, 'day', this.calendar);
    else if (event.key === 'ArrowLeft') next = moveCalendarDate(value, rtl ? 1 : -1, 'day', this.calendar);
    else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') next = moveCalendarDate(value, event.key === 'ArrowDown' ? 7 : -7, 'day', this.calendar);
    else if (event.key === 'PageDown' || event.key === 'PageUp') next = moveCalendarDate(value, event.key === 'PageDown' ? 1 : -1, event.shiftKey ? 'year' : 'month', this.calendar);
    else if (event.key === 'Home' || event.key === 'End') { const weekday = (new Date(`${value}T12:00:00Z`).getUTCDay() - this.weekStartsOn + 7) % 7; next = moveCalendarDate(value, event.key === 'Home' ? -weekday : 6 - weekday, 'day', this.calendar); }
    else return;
    } catch (error) { if (error instanceof RangeError) { event.preventDefault(); return; } throw error; }
    event.preventDefault();
    if (this.min && next < this.min) next = this.min;
    if (this.max && next > this.max) next = this.max;
    if (!isDateInRange(next, this.min || undefined, this.max || undefined) || !isCalendarDateSupported(next, this.calendar)) return;
    this.focused = next; this.month = next; this.monthChange.emit(next); this.changeDetector.detectChanges();
    this.host.nativeElement.querySelector<HTMLButtonElement>(`[data-date="${next}"]`)?.focus();
  }
}

@Component({selector: 'hw-date-picker', standalone: true, imports: [HwDialogComponent, HwCalendarComponent], providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwDatePickerComponent), multi: true}, {provide: NG_VALIDATORS, useExisting: forwardRef(() => HwDatePickerComponent), multi: true}], template: `<div class="hw-field hw-date-picker">@if (texts.need('label', label); as fieldLabel) {<label class="hw-label" [for]="controlId">{{ fieldLabel }}</label>}<div class="hw-date-picker-control"><input #dateInput class="hw-input" type="text" [attr.placeholder]="placeholder || null" [id]="controlId" [value]="displayedDate" aria-haspopup="dialog" [attr.aria-controls]="controlId + '-dialog'" [min]="min" [max]="max" [disabled]="disabled" [readOnly]="readOnly" [required]="required" [attr.aria-describedby]="dateDescriptionIds" [attr.aria-invalid]="error || violation ? true : null" (input)="edit($any($event.target).value)" (keydown)="inputKeydown($event)" (focus)="beginEditing()" (blur)="endEditing()"><button #trigger class="hw-button hw-date-picker-trigger" type="button" [disabled]="disabled || readOnly" aria-haspopup="dialog" [attr.aria-expanded]="pickerOpen" [attr.aria-controls]="controlId + '-dialog'" [attr.aria-label]="texts.need('openLabel', openLabel)" (click)="openCalendar(trigger)"><span class="hw-date-picker-icon" aria-hidden="true"></span></button></div><input type="hidden" [name]="name" [value]="canonicalValue" [disabled]="disabled"><output class="hw-sr-only hw-date-picker-value" [id]="controlId + '-formatted'" [attr.for]="controlId" [hidden]="!formattedDate" aria-live="polite" aria-atomic="true">{{ formattedDate }}</output><hw-dialog #dialog (openChange)="pickerOpen = $event" [title]="texts.need('calendarLabel', calendarLabel) ?? ''" [titleId]="controlId + '-dialog-title'" [closeLabel]="texts.need('closeLabel', closeLabel) ?? ''"><div class="hw-calendar-options"><div class="hw-calendar-system hw-calendar-switch" role="radiogroup" [attr.aria-label]="texts.need('calendarSystemLabel', calendarSystemLabel)" [attr.data-calendar]="calendar"><label><input type="radio" [name]="controlId + '-calendar-system'" form="" value="gregory" [checked]="calendar === 'gregory'" [disabled]="disabled || readOnly" (change)="switchCalendar('gregory')"><span>{{ texts.need('gregorianLabel', gregorianLabel) }}</span></label><label><input type="radio" [name]="controlId + '-calendar-system'" form="" value="islamic-umalqura" [checked]="calendar === 'islamic-umalqura'" [disabled]="disabled || readOnly" (change)="switchCalendar('islamic-umalqura')"><span>{{ texts.need('hijriLabel', hijriLabel) }}</span></label></div></div>@if (unsupportedDate && unsupportedMessageParts.length) {<p class="hw-sr-only" role="status">@for (part of unsupportedMessageParts; track $index) {@if (part.date) {<bdi dir="ltr">{{ part.text }}</bdi>} @else { {{ part.text }} }}</p>}<hw-calendar #pickerCalendar [controlId]="controlId + '-calendar'" [label]="calendarLabel" [value]="canonicalValue" [min]="min" [max]="max" [locale]="locale" [calendar]="calendar" [weekStartsOn]="weekStartsOn" [direction]="direction" [disabled]="disabled || readOnly" [previousLabel]="previousLabel" [nextLabel]="nextLabel" [rangeLabel]="rangeLabel" (valueChange)="selected($event)" /></hw-dialog>@if (validationMessage && !error) {<p class="hw-error" [id]="controlId + '-date-error'">@for (part of validationMessageParts; track $index) {@if (part.date) {<bdi dir="ltr">{{ part.text }}</bdi>} @else { {{ part.text }} }}</p>}${fieldEnd}</div>`})
export class HwDatePickerComponent extends HwExpandedValueControl<string> implements OnChanges, AfterViewInit, Validator {
  override value = ''; protected emptyValue() { return ''; } @Input() min = ''; @Input() max = ''; @Input() calendar: CalendarSystem = 'gregory'; @Input() weekStartsOn = 0; @Input() direction?: Direction; @ViewChild('dialog') dialog?: HwDialogComponent; @ViewChild('pickerCalendar') pickerCalendar?: HwCalendarComponent; @Output() readonly calendarChange = new EventEmitter<CalendarSystem>();
  @ViewChild('dateInput') dateInput?: ElementRef<HTMLInputElement>;
  protected readonly texts = new HwTexts('hw-date-picker');
  /** Field label. */
  @Input({required: true}) override label = '';
  /** BCP 47 tag handed to Intl for the formatted date and the calendar. There is no default: without it the typed ISO date is shown as typed, no formatted date is announced and the calendar is empty. */
  @Input({required: true}) locale = '';
  /** False, with one development warning, while the application has not supplied a locale. No core helper is called then. */
  get hasLocale(): boolean { return this.texts.need('locale', this.locale) !== null; }
  /** Dialog title and accessible name of the calendar inside it. */
  @Input({required: true}) calendarLabel = '';
  /** Accessible names of the trigger, the dialog close button and the month buttons. */
  @Input({required: true}) openLabel = ''; @Input({required: true}) closeLabel = ''; @Input({required: true}) previousLabel = ''; @Input({required: true}) nextLabel = '';
  /** Accessible name of the Gregorian/Hijri switch, and the text of its two options. */
  @Input({required: true}) calendarSystemLabel = ''; @Input({required: true}) gregorianLabel = ''; @Input({required: true}) hijriLabel = '';
  /** Name of the supported-range information shown with the Umm al-Qura calendar and lead-in of its tooltip. */
  @Input({required: true}) rangeLabel = '';
  /** Validation message for malformed or out-of-range typed input. */
  @Input({required: true}) invalidMessage = '';
  /** Message when the date cannot be shown in the Umm al-Qura calendar. The application may build it from UMALQURA_MIN_DATE and UMALQURA_MAX_DATE. */
  @Input({required: true}) unsupportedMessage = '';
  /** Optional format hint. No placeholder attribute is rendered without it. */
  @Input() placeholder = '';
  draft = ''; pickerOpen = false; editing = false;
  private validatorChanged: () => void = () => {};
  get canonicalValue() { return isDateInRange(this.value) ? this.value : ''; }
  get formattedDate(): string { return this.hasLocale && this.canonicalValue && isCalendarDateSupported(this.canonicalValue, this.calendar) ? formatCalendarDate(this.canonicalValue, {locale: this.locale, calendar: this.calendar, dateStyle: 'full'}) : ''; }
  get displayedDate(): string { return !this.editing && this.draft && !this.violation && isCalendarDateSupported(this.draft, this.calendar) && this.hasLocale ? formatCalendarDate(this.draft, {locale: this.locale, calendar: this.calendar, dateStyle: 'medium'}) : this.draft; }
  beginEditing(): void { if (!this.blocked) { this.dateInput!.nativeElement.value = this.draft; this.dateInput!.nativeElement.select(); this.editing = true; } }
  endEditing(): void { this.editing = false; this.touch(); }
  get dateDescriptionIds(): string | null { return [this.descriptionIds, this.formattedDate && `${this.controlId}-formatted`, this.validationMessage && !this.error && `${this.controlId}-date-error`].filter(Boolean).join(' ') || null; }
  private messageParts(message: string) { return !message ? [] : message.split(/([0-9٠-٩]{4}-[0-9٠-٩]{2}-[0-9٠-٩]{2})/u).map(text => ({text, date: /^[0-9٠-٩]{4}-[0-9٠-٩]{2}-[0-9٠-٩]{2}$/u.test(text)})); }
  get unsupportedMessageParts() { return this.messageParts(this.texts.need('unsupportedMessage', this.unsupportedMessage) ?? ''); }
  get validationMessageParts() { return this.messageParts(this.validationMessage); }
  get unsupportedDate() { return !!this.draft && isDateInRange(this.draft) && this.calendar === 'islamic-umalqura' && !isCalendarDateSupported(this.draft, this.calendar); }
  /** Which constraint the typed date violates. Validation never depends on the message text. */
  get violation(): '' | 'invalid' | 'unsupported' {
    if (!this.draft) return '';
    if (!isDateInRange(this.draft)) return 'invalid';
    if (this.unsupportedDate) return 'unsupported';
    return isDateInRange(this.draft, this.min || undefined, this.max || undefined) ? '' : 'invalid';
  }
  /** The application's message for the violated constraint, or '' when it supplied none. */
  get validationMessage(): string {
    const violation = this.violation;
    return (violation === 'invalid' ? this.texts.need('invalidMessage', this.invalidMessage) : violation === 'unsupported' ? this.texts.need('unsupportedMessage', this.unsupportedMessage) : null) ?? '';
  }
  validate(control: AbstractControl): ValidationErrors | null {
    if (this.disabled || control.disabled || this.readOnly) return null;
    if (this.required && !this.draft) return {required: true};
    if (this.unsupportedDate) return {calendarUnsupported: {calendar: this.calendar, min: UMALQURA_MIN_DATE, max: UMALQURA_MAX_DATE, actual: this.draft}};
    return this.violation ? {calendarDate: {actual: this.draft, min: this.min, max: this.max}} : null;
  }
  registerOnValidatorChange(fn: () => void): void { this.validatorChanged = fn; }
  private syncValidity(): void {
    setConstraintValidity(this.dateInput?.nativeElement, !this.disabled && !!this.violation, this.validationMessage);
    this.dialog?.dialog?.nativeElement.setAttribute('id', `${this.controlId}-dialog`);
    this.validatorChanged();
  }
  private get blocked() { return this.disabled || this.readOnly || !this.dateInput || isDisabled(this.dateInput.nativeElement); }
  ngAfterViewInit(): void { this.syncValidity(); }
  edit(value: string): void { if (this.blocked) return; this.draft = value; if (!value || isDateInRange(value)) super.update(value); this.syncValidity(); }
  override update(value: string): void { if (this.disabled || this.readOnly || value && !isDateInRange(value)) return; this.draft = value; super.update(value); this.syncValidity(); }
  inputKeydown(event: KeyboardEvent) { if (!event.defaultPrevented && !event.isComposing && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key === 'ArrowDown' && !this.blocked) { event.preventDefault(); this.openCalendar(this.dateInput!.nativeElement); } }
  openCalendar(trigger: HTMLElement) { if (this.blocked) return; this.dialog?.show(trigger); this.pickerCalendar?.focusSelected(); }
  switchCalendar(calendar: CalendarSystem) { if (this.blocked) return; this.calendar = calendar; this.syncValidity(); this.calendarChange.emit(calendar); this.changeDetector.markForCheck(); }
  selected(value: string) { if (this.blocked) return; this.update(value); this.touch(); this.dialog?.close(); }
  ngOnChanges(changes: SimpleChanges) { if (changes['value']) this.draft = this.value; if (this.disabled || this.readOnly) this.dialog?.close(); this.syncValidity(); }
  override setDisabledState(disabled: boolean) { super.setDisabledState(disabled); if (disabled) this.dialog?.close(); this.syncValidity(); }
  override writeValue(value: string | null) { super.writeValue(value); this.draft = this.value; if (!value) this.dialog?.close(); this.syncValidity(); }
}

/** The dropzone renders no file list: the native input shows the names, and an hw-file-upload-list can be projected after the status. */
@Component({selector: 'hw-file-dropzone', standalone: true, providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwFileDropzoneComponent), multi: true}], template: `<div #root class="hw-field hw-file-dropzone" [attr.data-state]="dragging ? 'dragging' : rejectedFiles.length || error ? 'error' : null" [attr.data-hw-readonly]="readOnly ? 'true' : null" (dragover)="dragover($event)" (dragleave)="dragleave($event)" (drop)="drop($event)">${fieldLabel}@if (texts.need('dropLabel', dropLabel); as instruction) {<p class="hw-file-dropzone-instruction" [id]="decorationId + '-instruction'">{{ instruction }}</p>}<input #input class="hw-input" type="file" [id]="controlId" [name]="name" [attr.accept]="accept || null" [multiple]="multiple" [disabled]="disabled" [required]="required" [attr.capture]="capture || null" [attr.form]="form || null" [attr.aria-disabled]="readOnly ? 'true' : null" ${controlAria} (click)="readOnly && $event.preventDefault()" (change)="selected($event)" ${controlFocus}>@if (getSelectedMessage) {<p role="status">{{ value.length ? getSelectedMessage(value) : '' }}</p>}<ng-content />${fieldEnd}</div>`})
export class HwFileDropzoneComponent extends HwExpandedValueControl<File[]> implements DoCheck {
  override value: File[] = []; protected emptyValue() { return []; } @Input() accept = ''; @Input({transform: booleanAttribute}) multiple = false; /** Visible instruction inside the drop area. */ @Input({required: true}) dropLabel = ''; /** Optional status text after a selection; it receives the selected files. The status element is rendered only while this is bound. */ @Input() getSelectedMessage?: (files: readonly File[]) => string; protected readonly texts = new HwTexts('hw-file-dropzone');
  /** Largest size of one file in bytes. A larger file is rejected. */
  @Input() maxSize?: number;
  /** The native capture attribute: which camera a mobile browser offers. No attribute without it. */
  @Input() capture: 'user' | 'environment' | '' = '';
  /** Text of the error shown after a rejected selection; it receives the rejected files. Required when accept or maxSize is set. */
  @Input() getRejectedMessage?: (rejected: readonly File[]) => string;
  /** The files of the last rejected selection, until the next accepted one or a reset. */
  rejectedFiles: readonly File[] = [];
  // The field label names the input unless aria-label, aria-labelledby or a surrounding hw-field does.
  ngDoCheck(): void {
    if (!this.named) this.texts.need('label', this.label);
    if (this.accept || this.maxSize) this.texts.has('getRejectedMessage', this.getRejectedMessage, 'accept or maxSize is set');
  }
  get rejection(): string | null { return this.rejectedFiles.length ? this.texts.call('getRejectedMessage', this.getRejectedMessage, [this.rejectedFiles], this.accept || this.maxSize ? 'accept or maxSize is set' : 'a selection was rejected') : null; }
  /** The application's error wins; a rejection is the message the component produces, rendered as an alert. It sets no custom validity. */
  override get shownError(): string { return this.error || this.rejection || ''; }
  override get invalid(): true | null { return super.invalid || this.rejectedFiles.length ? true : null; }
  /** The instruction describes the input, after the application's and the field's ids and ahead of the hint and the error. */
  override get descriptionIds(): string | null { return fieldDescriptionIds(this.ariaDescribedby, this.field?.descriptionIds, hasText(this.dropLabel) ? `${this.decorationId}-instruction` : '', this.hint && `${this.decorationId}-hint`, this.shownError && `${this.decorationId}-error`); }
  @Output() readonly rejected = new EventEmitter<readonly File[]>(); @ViewChild('input') input?: ElementRef<HTMLInputElement>; @ViewChild('root') root?: ElementRef<HTMLElement>; dragging = false;
  private get unavailable() { return this.disabled || this.readOnly || !this.input || isDisabled(this.input.nativeElement); }
  // A batch replaces the selection, and a batch with any rejected file leaves the dropzone empty.
  private commit(files: File[], list?: FileList) {
    if (this.unavailable) return;
    const input = this.input!.nativeElement, result = evaluateFileSelection(files, {accept: this.accept, multiple: this.multiple, maxSize: this.maxSize});
    if (result.rejected.length) {
      input.value = ''; this.rejectedFiles = result.rejected; this.rejected.emit(result.rejected);
      if (this.value.length) this.update([]);
    } else {
      // A drop assigns its own file list; a browser that refuses it leaves the selection as it was.
      if (list) { try { input.files = list; } catch { return; } }
      this.rejectedFiles = [];
      if (files.length || this.value.length) this.update(files);
    }
    this.touch();
  }
  selected(event: Event) { this.commit(Array.from((event.target as HTMLInputElement).files ?? [])); }
  // Only file drags are cancelled; over an unavailable zone the drop effect says that nothing will be taken.
  dragover(event: DragEvent) { if (!isFileDrag(event.dataTransfer)) return; event.preventDefault(); const blocked = this.unavailable; if (event.dataTransfer) event.dataTransfer.dropEffect = blocked ? 'none' : 'copy'; this.dragging = !blocked; }
  dragleave(event: DragEvent) { if (!this.root?.nativeElement.contains(event.relatedTarget as Node | null)) this.dragging = false; }
  drop(event: DragEvent) { event.preventDefault(); this.dragging = false; if (event.dataTransfer) this.commit(Array.from(event.dataTransfer.files), event.dataTransfer.files); }
  override writeValue(value: File[] | null) { super.writeValue(value); this.rejectedFiles = []; if (!this.value.length && this.input) this.input.nativeElement.value = ''; }
  protected override afterReset() { this.rejectedFiles = []; this.dragging = false; }
  // The browser emptied the input. The files the control still holds are assigned back; where that is not
  // possible the control reports the empty selection, so that held, shown and submitted value agree.
  protected override syncDom() { if (!writeFiles(this.input?.nativeElement, this.value)) { this.value = []; this.onChange(this.value); this.valueChange.emit(this.value); } }
}
