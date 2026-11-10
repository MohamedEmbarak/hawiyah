import { booleanAttribute, Component, Directive, ElementRef, EventEmitter, forwardRef, inject, Input, Output, ViewChild, type AfterViewInit, type OnChanges, type SimpleChanges } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR, type AbstractControl, type ValidationErrors, type Validator } from '@angular/forms';
import { getCalendarLabels, clampRange, filterOptions, formatCalendarDate, getCalendarDateParts, getCalendarMonth, getDirection, getSearchSuggestions, isCalendarDateSupported, isDateInRange, isDisabled, moveCalendarDate, normalizeDigits, normalizeRatingMax, normalizeRatingValue, requestSearchDialogClose, UMALQURA_MAX_DATE, UMALQURA_MIN_DATE, type CalendarSystem, type Direction, type Option } from '@hawiyah/core';
import { HwValueControl } from './forms';
import { observeAngularFieldPresence } from './field-presence';
import { setCustomValidity } from './platform';
import { InputValueSync } from './input-value';
import { HwDialogComponent, HwTooltipComponent } from './overlays';

const fieldEnd = `@if (hint) {<p class="hw-hint" [id]="controlId + '-hint'">{{ hint }}</p>}@if (error) {<p class="hw-error" [id]="controlId + '-error'">{{ error }}</p>}`;
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

@Component({selector: 'hw-password-field', standalone: true, providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwPasswordFieldComponent), multi: true}], template: `<div class="hw-field hw-password-field"><label class="hw-label" [for]="controlId">{{ label }}</label><div class="hw-password-control"><input #passwordInput class="hw-input" [id]="controlId" [type]="revealed ? 'text' : 'password'" [value]="value" [name]="name" [disabled]="disabled" [readOnly]="readOnly" [required]="required" [attr.autocomplete]="autocomplete" [placeholder]="placeholder" [attr.aria-describedby]="descriptionIds" [attr.aria-invalid]="error ? true : null" (input)="update($any($event.target).value)" (blur)="touch()"><button type="button" class="hw-button hw-password-toggle" data-variant="ghost" [attr.data-toggle-variant]="toggleVariant" [disabled]="disabled" [attr.aria-label]="revealed ? hideLabel : showLabel" [attr.aria-pressed]="revealed" [attr.aria-controls]="controlId" (click)="toggle()">@if (toggleVariant === 'text') { {{ revealed ? hideLabel : showLabel }} } @else {<span class="hw-password-icon" aria-hidden="true"></span>}</button></div>${fieldEnd}</div>`})
export class HwPasswordFieldComponent extends HwExpandedValueControl<string> implements AfterViewInit {
  override value = ''; protected emptyValue() { return ''; }
  @Input() autocomplete = 'current-password'; @Input() placeholder = ''; @Input() showLabel = 'Show password'; @Input() hideLabel = 'Hide password'; @Input() toggleVariant: 'icon' | 'text' = 'icon';
  @ViewChild('passwordInput') input?: ElementRef<HTMLInputElement>; revealed = false;
  private removeReset?: () => void; private destroyed = false;
  toggle() { if (this.input && !isDisabled(this.input.nativeElement)) this.revealed = !this.revealed; }
  ngAfterViewInit() {
    const form = this.input?.nativeElement.form;
    const reset = (event: Event) => queueMicrotask(() => { if (!this.destroyed && !event.defaultPrevented) { this.revealed = false; this.changeDetector.markForCheck(); } });
    form?.addEventListener('reset', reset); this.removeReset = () => form?.removeEventListener('reset', reset);
  }
  ngOnDestroy() { this.destroyed = true; this.removeReset?.(); }
  override writeValue(value: string | null) { super.writeValue(value); this.revealed = false; }
}

@Component({selector: 'hw-search-field', standalone: true, providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwSearchFieldComponent), multi: true}], template: `
<div #searchRoot class="hw-field hw-search-field"><label class="hw-label" [for]="controlId">{{ label }}</label><div class="hw-input-group"><div class="hw-search-control">
<input #input class="hw-input" type="search" [autofocus]="autofocus" [id]="controlId" [value]="value" [name]="name" [disabled]="disabled" [readOnly]="readOnly" [required]="required" [placeholder]="placeholder" [attr.autocomplete]="autocomplete" [attr.aria-describedby]="descriptionIds" [attr.aria-invalid]="error ? true : null" [attr.role]="suggestions !== undefined ? 'combobox' : null" [attr.aria-autocomplete]="suggestions !== undefined ? 'list' : null" [attr.aria-expanded]="suggestions !== undefined ? expanded : null" [attr.aria-controls]="suggestions !== undefined ? listId : null" [attr.aria-activedescendant]="expanded && active >= 0 && active < matches.length ? listId + '-' + active : null" (input)="inputChanged($event)" (keydown)="searchKey($event)" (focus)="focused()" (compositionstart)="compositionStart()" (compositionend)="compositionEnd()" (blur)="blurred()">
<button type="button" class="hw-button hw-search-clear" data-variant="ghost" [hidden]="!value || readOnly" [disabled]="disabled" [attr.aria-controls]="controlId" [attr.aria-label]="clearLabel" (pointerdown)="keepFocus($event)" (mousedown)="keepFocus($event)" (click)="clear()"><span class="hw-search-clear-icon" aria-hidden="true"></span></button>
@if (suggestions !== undefined) {<div class="hw-search-suggestions" [id]="listId" role="listbox" [attr.aria-label]="label || searchLabel" [hidden]="!expanded">@for (match of matches; track match.value; let i = $index) {<div class="hw-search-option" dir="auto" [id]="listId + '-' + i" role="option" [attr.aria-selected]="active === i" (pointerdown)="keepFocus($event)" (mousedown)="keepFocus($event)" (click)="choose(i)">@for (segment of match.segments; track $index) {@if (segment.match) {<strong>{{ segment.text }}</strong>} @else {{{ segment.text }}}}</div>}</div>}
</div>@if (showSearchButton) {<button type="button" class="hw-button hw-search-submit" [disabled]="disabled" [attr.aria-label]="searchLabel" (click)="search()"><span class="hw-search-submit-icon" aria-hidden="true"></span></button>}</div>
@if (suggestions !== undefined) {<span class="hw-sr-only" role="status" aria-live="polite" aria-atomic="true">{{ opened && !readOnly && !disabled && !composing && value.trim() ? resultsMessage(matches.length) : '' }}</span>}
${fieldEnd}</div>`})
export class HwSearchFieldComponent extends HwExpandedValueControl<string> {
  override value = ''; protected emptyValue() {return '';}
  @Input() placeholder = ''; @Input() autocomplete = 'off'; @Input({transform: booleanAttribute}) autofocus = false; @Input() clearLabel = 'مسح البحث'; @Input() searchLabel = 'بحث';
  @Input() suggestions?: readonly string[]; @Input() maxSuggestions = 8;
  @Input() resultsMessage: (count: number) => string = count => `${count} اقتراحات متاحة`;
  @Input({transform: booleanAttribute}) showSearchButton = true;
  @Output() readonly searched = new EventEmitter<string>();
  @ViewChild('input') input?: ElementRef<HTMLInputElement>; @ViewChild('searchRoot') searchRoot?: ElementRef<HTMLElement>;
  composing = false; opened = false; active = -1;
  private expectedValue?: string; private suggestionSignature?: string; private observer?: MutationObserver; private removeReset?: () => void; private destroyed = false;
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
    const form = input.form, reset = (event: Event) => queueMicrotask(() => {if (!this.destroyed && !event.defaultPrevented) {this.close();this.composing = false;this.changeDetector.markForCheck();}});
    form?.addEventListener('reset', reset);this.removeReset = () => form?.removeEventListener('reset', reset);
  }
  ngAfterViewChecked(): void {
    if (!this.expanded || this.active < 0) return;const list = this.input?.nativeElement.ownerDocument.getElementById(this.listId), option = list?.children[this.active] as HTMLElement | undefined;
    if (!list || !option) return;const outer = list.getBoundingClientRect(), inner = option.getBoundingClientRect();if (inner.top < outer.top) list.scrollTop -= outer.top - inner.top;else if (inner.bottom > outer.bottom) list.scrollTop += inner.bottom - outer.bottom;
  }
  override writeValue(value: string | null): void {super.writeValue(value);this.close();this.composing = false;}
  override setDisabledState(disabled: boolean): void {super.setDisabledState(disabled);if (disabled) this.close();}
  ngOnDestroy(): void {this.destroyed = true;this.observer?.disconnect();this.removeReset?.();this.input?.nativeElement.ownerDocument.removeEventListener('pointerdown', this.outside);}
}

@Component({selector: 'hw-number-field', standalone: true, providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwNumberFieldComponent), multi: true}], template: `<div class="hw-field hw-number-field"><label class="hw-label" [for]="controlId">{{ label }}</label><input #input class="hw-input" type="number" [id]="controlId" [name]="name" [attr.value]="value" [disabled]="disabled" [readOnly]="readOnly" [required]="required" [attr.min]="min" [attr.max]="max" [step]="step" [attr.aria-describedby]="descriptionIds" [attr.aria-invalid]="error ? true : null" (input)="numberChanged($event)" (blur)="touch()">${fieldEnd}</div>`})
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
}

@Component({selector: 'hw-slider', standalone: true, providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwSliderComponent), multi: true}], template: `<div class="hw-field"><label class="hw-label" [for]="controlId">{{ label }}</label><input class="hw-slider" type="range" [id]="controlId" [name]="name" [value]="value" [min]="min" [max]="max" [step]="step" [disabled]="disabled" [attr.aria-readonly]="readOnly || null" [attr.aria-describedby]="descriptionIds" [attr.aria-invalid]="error ? true : null" (pointerdown)="guardPointer($event)" (keydown)="guardKey($event)" (input)="changed($event)" (blur)="touch()"><output [attr.for]="controlId">{{ value }}</output>${fieldEnd}</div>`})
export class HwSliderComponent extends HwExpandedValueControl<number> {
  override value = 0; protected emptyValue() { return this.min; }
  @Input() min = 0; @Input() max = 100; @Input() step = 1;
  guardPointer(event: PointerEvent) { if (this.readOnly) event.preventDefault(); }
  guardKey(event: KeyboardEvent) { if (this.readOnly && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) event.preventDefault(); }
  changed(event: Event) {
    const input = event.target as HTMLInputElement;
    if (this.readOnly || isDisabled(input)) { input.value = String(this.value); return; }
    this.update(input.valueAsNumber);
  }
}

@Component({selector: 'hw-range-slider', standalone: true, providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwRangeSliderComponent), multi: true}], template: `<fieldset class="hw-field hw-range-slider" [disabled]="disabled" [attr.aria-describedby]="descriptionIds" [attr.aria-invalid]="error ? true : null"><legend class="hw-label">{{ label }}</legend><label [for]="controlId + '-lower'">{{ lowerLabel }}</label><input class="hw-slider" type="range" [id]="controlId + '-lower'" [name]="lowerName || name" [min]="min" [max]="pair[1]" [step]="step" [value]="pair[0]" [disabled]="disabled" [attr.aria-readonly]="readOnly || null" (pointerdown)="guardPointer($event)" (keydown)="guardKey($event)" (input)="changed($event, 'lower')" (blur)="touch()"><label [for]="controlId + '-upper'">{{ upperLabel }}</label><input class="hw-slider" type="range" [id]="controlId + '-upper'" [name]="upperName || name" [min]="pair[0]" [max]="max" [step]="step" [value]="pair[1]" [disabled]="disabled" [attr.aria-readonly]="readOnly || null" (pointerdown)="guardPointer($event)" (keydown)="guardKey($event)" (input)="changed($event, 'upper')" (blur)="touch()"><output [attr.for]="controlId + '-lower ' + controlId + '-upper'">{{ pair[0] }} – {{ pair[1] }}</output>${fieldEnd}</fieldset>`})
export class HwRangeSliderComponent extends HwExpandedValueControl<[number, number]> {
  override value: [number, number] = [0, 100]; protected emptyValue(): [number, number] { return [this.min, this.max]; }
  @Input() min = 0; @Input() max = 100; @Input() step = 1; @Input() lowerLabel = 'Minimum'; @Input() upperLabel = 'Maximum'; @Input() lowerName = ''; @Input() upperName = '';
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

@Component({selector: 'hw-rating', standalone: true, providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwRatingComponent), multi: true}], template: `<fieldset class="hw-field hw-rating" [disabled]="disabled" [attr.data-hw-readonly]="readOnly || null" [attr.aria-describedby]="descriptionIds" [attr.aria-invalid]="error ? true : null"><legend class="hw-label">{{ label }}</legend>@for (rating of ratings; track rating) {<label><input type="radio" [name]="name || controlId" [value]="rating" [checked]="currentInput === rating" [required]="required" [attr.aria-disabled]="readOnly || null" (click)="guardClick($event)" (keydown)="guardKey($event)" (change)="changed($event, rating)" (blur)="touch()"><span aria-hidden="true">★</span><span class="hw-sr-only">{{ ratingLabel(rating, total) }}</span></label>}${fieldEnd}</fieldset>`})
export class HwRatingComponent extends HwExpandedValueControl<number> {
  override value = 0; protected emptyValue() { return 0; }
  @Input() max = 5;
  @Input() ratingLabel = (value: number, max: number) => `${value} من ${max}`;
  get total() { return normalizeRatingMax(this.max); }
  get currentInput() { return Math.floor(normalizeRatingValue(this.value, this.total)); }
  get ratings() { return Array.from({length: this.total}, (_, i) => i + 1); }
  private restore(input: HTMLInputElement) { input.closest('fieldset')?.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach(radio => { radio.checked = Number(radio.value) === this.currentInput; }); }
  guardClick(event: MouseEvent) { if (this.readOnly) { event.preventDefault(); this.restore(event.currentTarget as HTMLInputElement); } }
  guardKey(event: KeyboardEvent) { if (this.readOnly && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(event.key)) event.preventDefault(); }
  changed(event: Event, rating: number) { const input = event.currentTarget as HTMLInputElement; if (this.readOnly || isDisabled(input)) { this.restore(input); return; } this.update(rating); }
}
/** Aggregate score with fractional fill; this component has no form controls. */
@Component({selector: 'hw-rating-display', standalone: true, template: `<div class="hw-rating-display" role="img" [attr.aria-label]="label + ': ' + valueLabel(score, total)"><span class="hw-rating-stars" aria-hidden="true">@for (star of stars; track star) {<span class="hw-rating-star">★<span class="hw-rating-fill" [style.--hw-rating-fill]="fill(star) + '%'"></span></span>}</span>@if (showValue) {<span class="hw-rating-score" aria-hidden="true">{{ score }}/{{ total }}</span>}</div>`})
export class HwRatingDisplayComponent {
  @Input({required: true}) label = '';
  @Input() value = 0;
  @Input() max = 5;
  @Input({transform: booleanAttribute}) showValue = true;
  @Input() valueLabel = (value: number, max: number) => `${value} من ${max}`;
  get total() { return normalizeRatingMax(this.max); }
  get score() { return normalizeRatingValue(this.value, this.total); }
  get stars() { return Array.from({length: this.total}, (_, index) => index); }
  fill(index: number) { return Math.min(1, Math.max(0, this.score - index)) * 100; }
}

@Component({selector: 'hw-pin-input', standalone: true, providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwPinInputComponent), multi: true}], template: `<div class="hw-field hw-pin-input"><label class="hw-label" [for]="controlId">{{ label }}</label><input class="hw-input" type="text" inputmode="numeric" autocomplete="one-time-code" [attr.pattern]="'[0-9]{' + normalizedLength + '}'" [id]="controlId" [name]="name" [value]="normalizedValue" [attr.maxlength]="normalizedLength" [disabled]="disabled" [readOnly]="readOnly" [required]="required" [attr.aria-describedby]="descriptionIds" [attr.aria-invalid]="error ? true : null" (input)="inputChanged($event)" (blur)="touch()">${fieldEnd}</div>`})
export class HwPinInputComponent extends HwExpandedValueControl<string> { override value = ''; protected emptyValue() { return ''; } @Input() length = 6; get normalizedLength() { return Math.max(1, Math.floor(this.length) || 6); } private normalize(value: string) { return normalizeDigits(value).replace(/[^0-9]/g, '').slice(0, this.normalizedLength); } get normalizedValue() { return this.normalize(this.value); } inputChanged(event: Event) { const input = event.target as HTMLInputElement; this.update(this.normalize(input.value)); input.value = this.normalizedValue; } }

@Component({selector: 'hw-tag-input', standalone: true, providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwTagInputComponent), multi: true}], template: `<div class="hw-field hw-tag-input"><label class="hw-label" [for]="controlId">{{ label }}</label><ul>@for (tag of value; track tag) {<li class="hw-chip"><span>{{ tag }}</span><button type="button" [disabled]="disabled || readOnly" [attr.aria-label]="removeLabel + ': ' + tag" (click)="remove(tag)"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button><input type="hidden" [name]="name" [value]="tag" [disabled]="disabled"></li>}</ul><div class="hw-input-group"><input #input class="hw-input" [id]="controlId" [value]="draft" [disabled]="disabled" [readOnly]="readOnly" [placeholder]="placeholder" [attr.aria-required]="required || null" [attr.aria-describedby]="descriptionIds" [attr.aria-invalid]="error ? true : null" (input)="draft = $any($event.target).value" (keydown)="keydown($event)" (compositionstart)="composing = true" (compositionend)="composing = false" (blur)="touch()"><button class="hw-button" type="button" [disabled]="disabled || readOnly || !draft.trim()" (click)="add()">{{ addLabel }}</button></div>${fieldEnd}</div>`})
export class HwTagInputComponent extends HwExpandedValueControl<string[]> implements OnChanges { override value: string[] = []; protected emptyValue() { return []; } @Input() placeholder = ''; @Input() addLabel = 'Add'; @Input() removeLabel = 'Remove'; @Input() validationMessage = 'Add at least one tag.'; draft = ''; composing = false; private get blocked() { return this.disabled || this.readOnly || !!this.input && isDisabled(this.input.nativeElement); } @ViewChild('input') input?: ElementRef<HTMLInputElement>; add() { const tag = this.draft.trim(); if (!tag || this.blocked) return; if (!this.value.includes(tag)) this.update([...this.value, tag]); this.draft = ''; this.validity(); this.input?.nativeElement.focus(); } remove(tag: string) { if (this.blocked) return; this.update(this.value.filter(value => value !== tag)); this.validity(); this.input?.nativeElement.focus(); } keydown(event: KeyboardEvent) { if (event.defaultPrevented || this.blocked || this.composing || event.isComposing || event.ctrlKey || event.altKey || event.metaKey) return; if ((event.key === 'Enter' || event.key === ',') && this.draft.trim()) { event.preventDefault(); this.add(); } else if (event.key === 'Backspace' && !this.draft && this.value.length) { event.preventDefault(); this.remove(this.value.at(-1)!); } } ngAfterViewInit() { this.validity(); } ngOnChanges() { this.validity(); } private validity() { setCustomValidity(this.input?.nativeElement, this.required && !this.disabled && !this.value.length ? this.validationMessage : ''); } override writeValue(value: string[] | null) { super.writeValue(value); this.draft = ''; this.validity(); } override setDisabledState(disabled: boolean) { super.setDisabledState(disabled); this.validity(); } }

@Component({selector: 'hw-multi-select', standalone: true, providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwMultiSelectComponent), multi: true}], template: `<fieldset class="hw-field hw-multi-select" [disabled]="disabled" [attr.aria-describedby]="descriptionIds" [attr.aria-invalid]="error ? true : null"><legend class="hw-label">{{ label }}</legend><label class="hw-sr-only" [for]="controlId">{{ searchLabel }}</label><input #search class="hw-input" type="search" [id]="controlId" [value]="query" [placeholder]="searchLabel" [disabled]="disabled" [attr.aria-required]="required || null" [attr.aria-describedby]="descriptionIds" [attr.aria-invalid]="error ? true : null" (input)="query = $any($event.target).value" (blur)="touch()"><div class="hw-multi-select-options">@for (option of filtered; track option.value) {<label><input class="hw-checkbox" type="checkbox" [value]="option.value" [checked]="selectedValues.includes(option.value)" [disabled]="disabled || readOnly || option.disabled" (change)="toggle(option)" (blur)="touch()"><span>{{ option.label }}</span></label>} @empty {<p>{{ emptyMessage }}</p>}</div>@for (selected of selectedValues; track selected) {<input type="hidden" [name]="name" [value]="selected" [disabled]="disabled">}<p class="hw-hint" role="status">{{ selectedMessage(selectedValues.length) }}</p>${fieldEnd}</fieldset>`})
export class HwMultiSelectComponent extends HwExpandedValueControl<string[]> implements OnChanges {
  override value: string[] = []; protected emptyValue() { return []; } @Input() options: readonly Option[] = []; @Input() searchLabel = 'Search options'; @Input() emptyMessage = 'No options'; @Input() validationMessage = 'Select at least one option.'; @Input() selectedMessage = (count: number) => `${count} selected`; @ViewChild('search') search?: ElementRef<HTMLInputElement>; query = '';
  get selectedValues() { return this.value.filter(value => this.options.some(option => option.value === value && !option.disabled)); }
  get filtered() { return filterOptions(this.options, this.query); }
  toggle(option: Option) { if (!option.disabled) { this.update(this.selectedValues.includes(option.value) ? this.selectedValues.filter(value => value !== option.value) : [...this.selectedValues, option.value]); this.validity(); } }
  ngAfterViewInit() { this.validity(); } ngOnChanges() { this.validity(); }
  private validity() { setCustomValidity(this.search?.nativeElement, this.required && !this.disabled && !this.selectedValues.length ? this.validationMessage : ''); }
  override writeValue(value: string[] | null) { super.writeValue(value); this.query = ''; this.validity(); }
  override setDisabledState(value: boolean) { super.setDisabledState(value); this.validity(); }
}

@Component({selector: 'hw-calendar', standalone: true, imports: [HwTooltipComponent], providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwCalendarComponent), multi: true}], template: `<div class="hw-field hw-calendar" [attr.dir]="direction || null"><div class="hw-calendar-toolbar"><button class="hw-button hw-calendar-prev" data-variant="ghost" type="button" [disabled]="disabled || !canPrevious" [attr.aria-label]="previousLabel ?? copy.previous" (click)="navigate(data.previous)"><span class="hw-icon" data-icon="arrow-left-01" data-directional="true" data-size="md" aria-hidden="true"></span></button><div class="hw-calendar-heading"><h3 [id]="controlId + '-month'" aria-live="polite">{{ data.label }}</h3>@if (calendar === 'islamic-umalqura') {<hw-tooltip class="hw-calendar-info" [text]="rangeDescription"><span class="hw-calendar-info-icon" aria-hidden="true">i</span><span class="hw-sr-only">{{ rangeLabel }}</span></hw-tooltip>}</div><button class="hw-button hw-calendar-next" data-variant="ghost" type="button" [disabled]="disabled || !canNext" [attr.aria-label]="nextLabel ?? copy.next" (click)="navigate(data.next)"><span class="hw-icon" data-icon="arrow-right-01" data-directional="true" data-size="md" aria-hidden="true"></span></button></div><table class="hw-calendar-grid" role="grid" [attr.aria-label]="label || copy.calendar" [attr.aria-describedby]="descriptionIds"><thead><tr>@for (weekday of data.weekdays; track $index) {<th scope="col">{{ weekday }}</th>}</tr></thead><tbody>@for (week of weeks; track $index) {<tr>@for (day of week; track day.value) {<td role="gridcell" [attr.aria-selected]="day.selected"><button type="button" class="hw-calendar-day" [attr.data-date]="day.value" [attr.data-outside]="day.outside" [attr.data-selected]="day.selected" [attr.aria-current]="day.today ? 'date' : null" [attr.aria-label]="dateLabel(day.value)" [attr.aria-disabled]="readOnly || null" [tabIndex]="day.value === tabbable ? 0 : -1" [disabled]="disabled || day.disabled" (click)="select(day.value)" (keydown)="keydown($event, day.value)" (blur)="touch()">{{ day.label }}</button></td>}</tr>}</tbody></table><input type="hidden" [name]="name" [value]="value" [disabled]="disabled">${fieldEnd}</div>`})
export class HwCalendarComponent extends HwExpandedValueControl<string> implements OnChanges {
  get copy() { return getCalendarLabels(this.locale); }
  get rangeLabel() { return this.copy.range; }
  get rangeDescription() { return `${this.rangeLabel}: \u2066${UMALQURA_MIN_DATE} – ${UMALQURA_MAX_DATE}\u2069`; }

  override value = ''; protected emptyValue() { return ''; }
  @Input() month = ''; @Input() min = ''; @Input() max = ''; @Input() locale = 'ar-SA'; @Input() calendar: CalendarSystem = 'gregory'; @Input() weekStartsOn = 0; @Input() direction?: Direction; @Input() previousLabel?: string; @Input() nextLabel?: string; @Output() readonly monthChange = new EventEmitter<string>();
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef); focused = '';
  private cachedMonth?: ReturnType<typeof getCalendarMonth>; private cachedMonthKey = '';
  get data() { const options = {month: isDateInRange(this.month) ? this.month : isDateInRange(this.value) ? this.value : undefined, value: isDateInRange(this.value) ? this.value : '', min: this.min || undefined, max: this.max || undefined, locale: this.locale, calendar: this.calendar, weekStartsOn: this.weekStartsOn, fixedWeeks: true}; const key = JSON.stringify(options); if (!this.cachedMonth || key !== this.cachedMonthKey) { this.cachedMonth = getCalendarMonth(options); this.cachedMonthKey = key; } return this.cachedMonth; }
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
  private readonly dateLabels = new Map<string, string>(); private readonly monthLabels = new Map<string, string>();
  dateLabel(value: string) {
    if (!isCalendarDateSupported(value, this.calendar)) return value;
    const key = `${this.locale}/${this.calendar}/${value}`; const cached = this.dateLabels.get(key); if (cached) return cached;
    const parts = getCalendarDateParts(value, this.calendar);
    const weekday = new Intl.DateTimeFormat(this.locale, {weekday: 'long', timeZone: 'UTC'}).format(new Date(`${value}T12:00:00Z`));
    const monthKey = `${this.locale}/${this.calendar}/${parts.year}/${parts.month}`; let month = this.monthLabels.get(monthKey);
    if (!month) { month = getCalendarMonth({month: value, locale: this.locale, calendar: this.calendar}).label; if (this.monthLabels.size > 48) this.monthLabels.clear(); this.monthLabels.set(monthKey, month); }
    const label = `${weekday}, ${new Intl.NumberFormat(this.locale, {numberingSystem: 'latn'}).format(parts.day)} ${month}`;
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

@Component({selector: 'hw-date-picker', standalone: true, imports: [HwDialogComponent, HwCalendarComponent], providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwDatePickerComponent), multi: true}, {provide: NG_VALIDATORS, useExisting: forwardRef(() => HwDatePickerComponent), multi: true}], template: `<div class="hw-field hw-date-picker"><label class="hw-label" [for]="controlId">{{ label || copy.date }}</label><div class="hw-date-picker-control"><input #dateInput class="hw-input" type="text" placeholder="YYYY-MM-DD" [id]="controlId" [value]="displayedDate" aria-haspopup="dialog" [attr.aria-controls]="controlId + '-dialog'" [min]="min" [max]="max" [disabled]="disabled" [readOnly]="readOnly" [required]="required" [attr.aria-describedby]="dateDescriptionIds" [attr.aria-invalid]="error || validationMessage ? true : null" (input)="edit($any($event.target).value)" (keydown)="inputKeydown($event)" (focus)="beginEditing()" (blur)="endEditing()"><button #trigger class="hw-button hw-date-picker-trigger" type="button" [disabled]="disabled || readOnly" aria-haspopup="dialog" [attr.aria-expanded]="pickerOpen" [attr.aria-controls]="controlId + '-dialog'" [attr.aria-label]="openLabel ?? copy.open" (click)="openCalendar(trigger)"><span class="hw-date-picker-icon" aria-hidden="true"></span></button></div><input type="hidden" [name]="name" [value]="canonicalValue" [disabled]="disabled"><output class="hw-sr-only hw-date-picker-value" [id]="controlId + '-formatted'" [attr.for]="controlId" [hidden]="!formattedDate" aria-live="polite" aria-atomic="true">{{ formattedDate }}</output><hw-dialog #dialog (openChange)="pickerOpen = $event" [title]="dialogTitle || label || copy.choose" [titleId]="controlId + '-dialog-title'" [closeLabel]="closeLabel ?? copy.close"><div class="hw-calendar-options"><div class="hw-calendar-system hw-calendar-switch" role="radiogroup" [attr.aria-label]="calendarLabel ?? copy.system" [attr.data-calendar]="calendar"><label><input type="radio" [name]="controlId + '-calendar-system'" form="" value="gregory" [checked]="calendar === 'gregory'" [disabled]="disabled || readOnly" (change)="switchCalendar('gregory')"><span>{{ gregorianLabel ?? copy.gregorian }}</span></label><label><input type="radio" [name]="controlId + '-calendar-system'" form="" value="islamic-umalqura" [checked]="calendar === 'islamic-umalqura'" [disabled]="disabled || readOnly" (change)="switchCalendar('islamic-umalqura')"><span>{{ hijriLabel ?? copy.hijri }}</span></label></div></div>@if (unsupportedDate) {<p class="hw-sr-only" role="status">@for (part of unsupportedMessageParts; track $index) {@if (part.date) {<bdi dir="ltr">{{ part.text }}</bdi>} @else { {{ part.text }} }}</p>}<hw-calendar #pickerCalendar [controlId]="controlId + '-calendar'" [label]="label" [value]="canonicalValue" [min]="min" [max]="max" [locale]="locale" [calendar]="calendar" [weekStartsOn]="weekStartsOn" [direction]="direction" [disabled]="disabled || readOnly" [previousLabel]="previousLabel" [nextLabel]="nextLabel" (valueChange)="selected($event)" /></hw-dialog>@if (validationMessage && !error) {<p class="hw-error" [id]="controlId + '-date-error'">@for (part of validationMessageParts; track $index) {@if (part.date) {<bdi dir="ltr">{{ part.text }}</bdi>} @else { {{ part.text }} }}</p>}${fieldEnd}</div>`})
export class HwDatePickerComponent extends HwExpandedValueControl<string> implements OnChanges, AfterViewInit, Validator {
  override value = ''; protected emptyValue() { return ''; } @Input() min = ''; @Input() max = ''; @Input() locale = 'ar-SA'; @Input() calendar: CalendarSystem = 'gregory'; @Input() weekStartsOn = 0; @Input() direction?: Direction; @Input() dialogTitle = ''; @Input() openLabel?: string; @Input() closeLabel?: string; @Input() previousLabel?: string; @Input() nextLabel?: string; @ViewChild('dialog') dialog?: HwDialogComponent; @ViewChild('pickerCalendar') pickerCalendar?: HwCalendarComponent; @Input() calendarLabel?: string; @Input() gregorianLabel?: string; @Input() hijriLabel?: string; @Input() unsupportedMessage?: string; @Input() invalidMessage?: string; @Output() readonly calendarChange = new EventEmitter<CalendarSystem>();
  @ViewChild('dateInput') dateInput?: ElementRef<HTMLInputElement>;
  get copy() { return getCalendarLabels(this.locale); }
  draft = ''; pickerOpen = false; editing = false;
  private validatorChanged: () => void = () => {};
  get canonicalValue() { return isDateInRange(this.value) ? this.value : ''; }
  get formattedDate(): string { return this.canonicalValue && isCalendarDateSupported(this.canonicalValue, this.calendar) ? formatCalendarDate(this.canonicalValue, {locale: this.locale, calendar: this.calendar, dateStyle: 'full'}) : ''; }
  get displayedDate(): string { return !this.editing && this.draft && !this.validationMessage && isCalendarDateSupported(this.draft, this.calendar) ? formatCalendarDate(this.draft, {locale: this.locale, calendar: this.calendar, dateStyle: 'medium'}) : this.draft; }
  beginEditing(): void { if (!this.blocked) { this.dateInput!.nativeElement.value = this.draft; this.dateInput!.nativeElement.select(); this.editing = true; } }
  endEditing(): void { this.editing = false; this.touch(); }
  get dateDescriptionIds(): string | null { return [this.descriptionIds, this.formattedDate && `${this.controlId}-formatted`, this.validationMessage && !this.error && `${this.controlId}-date-error`].filter(Boolean).join(' ') || null; }
  private messageParts(message: string) { return message.split(/([0-9٠-٩]{4}-[0-9٠-٩]{2}-[0-9٠-٩]{2})/u).map(text => ({text, date: /^[0-9٠-٩]{4}-[0-9٠-٩]{2}-[0-9٠-٩]{2}$/u.test(text)})); }
  get unsupportedMessageParts() { return this.messageParts(this.unsupportedMessage ?? this.copy.unsupported); }
  get validationMessageParts() { return this.messageParts(this.validationMessage); }
  get unsupportedDate() { return !!this.draft && isDateInRange(this.draft) && this.calendar === 'islamic-umalqura' && !isCalendarDateSupported(this.draft, this.calendar); }
  get validationMessage() {
    if (!this.draft) return '';
    if (!isDateInRange(this.draft)) return this.invalidMessage ?? this.copy.invalid;
    if (this.unsupportedDate) return this.unsupportedMessage ?? this.copy.unsupported;
    return isDateInRange(this.draft, this.min || undefined, this.max || undefined) ? '' : (this.invalidMessage ?? this.copy.invalid);
  }
  validate(control: AbstractControl): ValidationErrors | null {
    if (this.disabled || control.disabled || this.readOnly) return null;
    if (this.required && !this.draft) return {required: true};
    if (this.unsupportedDate) return {calendarUnsupported: {calendar: this.calendar, min: UMALQURA_MIN_DATE, max: UMALQURA_MAX_DATE, actual: this.draft}};
    return this.validationMessage ? {calendarDate: {actual: this.draft, min: this.min, max: this.max}} : null;
  }
  registerOnValidatorChange(fn: () => void): void { this.validatorChanged = fn; }
  private syncValidity(): void {
    setCustomValidity(this.dateInput?.nativeElement, this.disabled ? '' : this.validationMessage);
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

@Component({selector: 'hw-file-dropzone', standalone: true, providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwFileDropzoneComponent), multi: true}], template: `<div class="hw-field hw-file-dropzone" [attr.data-dragging]="dragging" [attr.aria-disabled]="disabled" (dragover)="dragover($event)" (dragleave)="dragging = false" (drop)="drop($event)"><label class="hw-label" [for]="controlId">{{ label || instruction }}</label>@if (label) {<p>{{ instruction }}</p>}<input #input class="hw-input" type="file" [id]="controlId" [name]="name" [accept]="accept" [multiple]="multiple" [disabled]="disabled || readOnly" [required]="required" [attr.aria-describedby]="descriptionIds" [attr.aria-invalid]="error ? true : null" (change)="selected($event)" (blur)="touch()"><ul>@for (file of value; track $index) {<li>{{ file.name }} ({{ file.size }})</li>}</ul><p class="hw-sr-only" role="status">{{ value.length ? selectedMessage(value.length) : '' }}</p>${fieldEnd}</div>`})
export class HwFileDropzoneComponent extends HwExpandedValueControl<File[]> {
  override value: File[] = []; protected emptyValue() { return []; } @Input() accept = ''; @Input({transform: booleanAttribute}) multiple = false; @Input() instruction = 'Drop files here or choose files'; @Input() selectedMessage = (count: number) => `${count} files selected`; @Output() readonly rejected = new EventEmitter<readonly File[]>(); @ViewChild('input') input?: ElementRef<HTMLInputElement>; dragging = false;
  private accepts(file: File) { return !this.accept || this.accept.split(',').some(rule => { const part = rule.trim().toLowerCase(); return part.startsWith('.') ? file.name.toLowerCase().endsWith(part) : part.endsWith('/*') ? file.type.startsWith(part.slice(0, -1)) : file.type === part; }); }
  private get unavailable() { return this.disabled || this.readOnly || !this.input || isDisabled(this.input.nativeElement); }
  private commit(files: File[]) {
    if (this.unavailable) return;
    const accepted = files.filter(file => this.accepts(file)); const selected = this.multiple ? accepted : accepted.slice(0, 1); const rejected = files.filter(file => !selected.includes(file)); if (rejected.length) this.rejected.emit(rejected);
    if (this.input && typeof DataTransfer !== 'undefined') { const transfer = new DataTransfer(); selected.forEach(file => transfer.items.add(file)); this.input.nativeElement.files = transfer.files; }
    else if (this.input && rejected.length) { this.input.nativeElement.value = ''; this.update([]); return; }
    this.update(selected); this.touch();
  }
  selected(event: Event) { this.commit(Array.from((event.target as HTMLInputElement).files ?? [])); }
  dragover(event: DragEvent) { event.preventDefault(); if (!this.unavailable) this.dragging = true; }
  drop(event: DragEvent) { event.preventDefault(); this.dragging = false; if (event.dataTransfer) this.commit(Array.from(event.dataTransfer.files)); }
  override writeValue(value: File[] | null) { super.writeValue(value); if (!this.value.length && this.input) this.input.nativeElement.value = ''; }
}
