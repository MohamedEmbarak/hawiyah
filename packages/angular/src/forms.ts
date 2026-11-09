import { observeAngularFieldPresence } from './field-presence';
import { booleanAttribute, ChangeDetectorRef, Component, Directive, EventEmitter, forwardRef, HostListener, inject, Input, Output, ViewChild, ElementRef, type AfterViewInit, type OnChanges, type SimpleChanges } from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { createComboboxState, getComboboxOptions, isDisabled, transitionCombobox, type ComboboxEvent, type Option } from '@hawiyah/core';

let nextId = 0;
function fieldDescriptionIds(id: string, hint: string, error: string, external?: string | null): string | null {
  const ids = (external ?? '').trim().split(/\s+/).filter(Boolean);
  if (hint) ids.push(`${id}-hint`);
  if (error) ids.push(`${id}-error`);
  return [...new Set(ids)].join(' ') || null;
}
/** Pass controlId for stable application-owned identifiers, especially with SSR. */
@Directive()
export abstract class HwValueControl<T> implements ControlValueAccessor {
  constructor() { observeAngularFieldPresence(); }
  @Input() controlId = `hw-control-${++nextId}`;
  @Input() label = '';
  @Input() name = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() describedBy?: string | null;
  @Input({transform: booleanAttribute}) required = false;
  @Input({transform: booleanAttribute}) disabled = false;
  @Input() value!: T;
  @Output() readonly valueChange = new EventEmitter<T>();
  protected readonly changeDetector = inject(ChangeDetectorRef);
  protected onChange: (value: T) => void = () => {};
  protected onTouched: () => void = () => {};
  get descriptionIds(): string | null { return fieldDescriptionIds(this.controlId, this.hint, this.error, this.describedBy); }
  writeValue(value: T): void { this.value = value; this.changeDetector.markForCheck(); }
  registerOnChange(fn: (value: T) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { this.disabled = disabled; this.changeDetector.markForCheck(); }
  update(value: T): void { if (this.disabled) return; this.value = value; this.onChange(value); this.valueChange.emit(value); }
  touch(): void { this.onTouched(); }
}

const fieldLabel = `<label class="hw-label" [for]="controlId">{{ label }}@if (required) {<span class="hw-required-marker" aria-hidden="true"> *</span>}</label>`;
const fieldEnd = `@if (hint) { <p class="hw-hint" [id]="controlId + '-hint'">{{ hint }}</p> } @if (error) { <p class="hw-error" [id]="controlId + '-error'">{{ error }}</p> }`;

@Component({ selector: 'hw-field', standalone: true, template: `<div class="hw-field">${fieldLabel}<ng-content />@if (hint) {<p class="hw-hint" [id]="controlId + '-hint'">{{ hint }}</p>}@if (error) {<p class="hw-error" [id]="controlId + '-error'">{{ error }}</p>}</div>` })
export class HwFieldComponent {
  @Input({ required: true }) controlId = '';
  @Input({ required: true }) label = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() describedBy?: string | null;
  @Input({transform: booleanAttribute}) required = false;
  get descriptionIds(): string | null { return fieldDescriptionIds(this.controlId, this.hint, this.error, this.describedBy); }
}

@Component({ selector: 'hw-text-field', standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwTextFieldComponent), multi: true }],
  template: `<div class="hw-field">${fieldLabel}<input class="hw-input" [attr.data-size]="size" [attr.data-variant]="visualVariant" [id]="controlId" [type]="type" [name]="name" [value]="value || ''" [disabled]="disabled" [required]="required" [readOnly]="readOnly" [placeholder]="placeholder" [attr.autocomplete]="autocomplete" [attr.inputmode]="inputmode || null" [attr.min]="min" [attr.max]="max" [attr.step]="step" [attr.minlength]="minLength" [attr.maxlength]="maxLength" [attr.pattern]="pattern" [attr.aria-describedby]="descriptionIds" [attr.aria-invalid]="error ? true : null" (input)="update($any($event.target).value)" (blur)="touch()">${fieldEnd}</div>` })
export class HwTextFieldComponent extends HwValueControl<string> {
  override value = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() visualVariant: 'outline' | 'filled' = 'outline';
  @Input() type: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'date' | 'datetime-local' | 'month' | 'week' | 'time' | 'number' | 'color' | 'range' = 'text';
  @Input() placeholder = '';
  @Input() autocomplete = 'off';
  @Input() inputmode = '';
  @Input() min: string | number | null = null;
  @Input() max: string | number | null = null;
  @Input() step: string | number | null = null;
  @Input() minLength: number | null = null;
  @Input() maxLength: number | null = null;
  @Input() pattern: string | null = null;
  @Input({transform: booleanAttribute}) readOnly = false;
}

@Component({ selector: 'hw-textarea', standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwTextareaComponent), multi: true }],
  template: `<div class="hw-field">${fieldLabel}<textarea class="hw-textarea" [attr.data-size]="size" [attr.data-variant]="visualVariant" [id]="controlId" [name]="name" [value]="value || ''" [disabled]="disabled" [required]="required" [readOnly]="readOnly" [rows]="rows" [placeholder]="placeholder" [attr.maxlength]="maxLength" [attr.aria-describedby]="descriptionIds" [attr.aria-invalid]="error ? true : null" (input)="update($any($event.target).value)" (blur)="touch()"></textarea>${fieldEnd}</div>` })
export class HwTextareaComponent extends HwValueControl<string> {
  override value = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() visualVariant: 'outline' | 'filled' = 'outline';
  @Input() rows = 4;
  @Input() placeholder = '';
  @Input() maxLength: number | null = null;
  @Input({transform: booleanAttribute}) readOnly = false;
}

@Component({ selector: 'hw-select', standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwSelectComponent), multi: true }],
  template: `<div class="hw-field">${fieldLabel}<select class="hw-select" [attr.data-size]="size" [attr.data-variant]="visualVariant" [id]="controlId" [name]="name" [value]="value || ''" [disabled]="disabled" [required]="required" [attr.aria-describedby]="descriptionIds" [attr.aria-invalid]="error ? true : null" (change)="update($any($event.target).value)" (blur)="touch()">@if (showPrompt) {<option value="">{{ placeholder }}</option>}@for (option of options; track option.value) {<option [value]="option.value" [disabled]="option.disabled ?? false" [selected]="option.value === value">{{ option.label }}</option>}</select>${fieldEnd}</div>` })
export class HwSelectComponent extends HwValueControl<string> {
  override value = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() visualVariant: 'outline' | 'filled' = 'outline';
  @Input() options: readonly Option[] = [];
  @Input() placeholder = 'اختر خيارًا';
  get showPrompt(): boolean { return Boolean(this.placeholder) && !this.options.some(option => option.value === ''); }
}

@Component({ selector: 'hw-checkbox', standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwCheckboxComponent), multi: true }],
  template: `<div class="hw-field"><label class="hw-choice" [for]="controlId"><input class="hw-checkbox" type="checkbox" [id]="controlId" [name]="name" [checked]="value" [disabled]="disabled" [required]="required" [readOnly]="readOnly" [attr.aria-disabled]="readOnly || null" [indeterminate]="indeterminate" [attr.aria-describedby]="descriptionIds" [attr.aria-invalid]="error ? true : null" (change)="!readOnly && update($any($event.target).checked)" (blur)="touch()"><span>{{ label }}</span></label>${fieldEnd}</div>` })
export class HwCheckboxComponent extends HwValueControl<boolean> {
  @Input({transform: booleanAttribute}) readOnly = false;
  override value = false;
  @Input({transform: booleanAttribute}) indeterminate = false;
}

@Component({ selector: 'hw-switch', standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwSwitchComponent), multi: true }],
  template: `<div class="hw-field"><label class="hw-choice" [for]="controlId"><input class="hw-switch" type="checkbox" role="switch" [id]="controlId" [name]="name" [checked]="value" [disabled]="disabled" [required]="required" [readOnly]="readOnly" [attr.aria-disabled]="readOnly || null" [attr.aria-describedby]="descriptionIds" [attr.aria-invalid]="error ? true : null" (change)="!readOnly && update($any($event.target).checked)" (blur)="touch()"><span>{{ label }}</span></label>${fieldEnd}</div>` })
export class HwSwitchComponent extends HwValueControl<boolean> { @Input({transform: booleanAttribute}) readOnly = false; override value = false; }

@Component({ selector: 'hw-radio', standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwRadioComponent), multi: true }],
  template: `<fieldset class="hw-field" [disabled]="disabled" [attr.aria-describedby]="descriptionIds" [attr.aria-invalid]="error ? true : null"><legend class="hw-label">{{ label }}</legend>@for (option of options; track option.value; let i = $index) {<label class="hw-choice" [for]="controlId + '-' + i"><input class="hw-radio" type="radio" [id]="controlId + '-' + i" [name]="name || controlId" [value]="option.value" [checked]="value === option.value" [disabled]="disabled || (option.disabled ?? false)" [required]="required" [readOnly]="readOnly" [attr.aria-disabled]="readOnly || null" (change)="!readOnly && update(option.value)" (blur)="touch()"><span>{{ option.label }}</span></label>}${fieldEnd}</fieldset>` })
export class HwRadioComponent extends HwValueControl<string> {
  @Input({transform: booleanAttribute}) readOnly = false;
  override value = '';
  @Input() options: readonly Option[] = [];
}

@Component({ selector: 'hw-combobox', standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwComboboxComponent), multi: true }],
  template: `<div class="hw-field hw-combobox"><label class="hw-label" [for]="controlId">{{ label }}</label><input #input class="hw-input" role="combobox" aria-autocomplete="list" aria-haspopup="listbox" autocomplete="off" [id]="controlId" [value]="state.query" [disabled]="disabled" [readOnly]="readOnly" [attr.aria-readonly]="readOnly || null" [required]="required" [placeholder]="placeholder" [attr.aria-expanded]="state.open" [attr.aria-controls]="controlId + '-list'" [attr.aria-activedescendant]="state.open && state.activeIndex >= 0 ? controlId + '-option-' + state.activeIndex : null" [attr.aria-describedby]="descriptionIds" [attr.aria-invalid]="error ? true : null" (input)="inputChanged($event)" (compositionstart)="composing = true" (compositionend)="compositionEnded($event)" (focus)="dispatch({type: 'open'})" (click)="dispatch({type: 'open'})" (keydown)="keydown($event)" (blur)="blur()"><input type="hidden" [name]="name" [value]="state.value" [disabled]="disabled"><ul class="hw-listbox" role="listbox" [id]="controlId + '-list'" [attr.aria-label]="label" [hidden]="!state.open">@for (option of visibleOptions; track option.value; let i = $index) {<li class="hw-option" role="option" [id]="controlId + '-option-' + i" [attr.aria-selected]="state.value === option.value" [attr.aria-disabled]="option.disabled || null" [attr.data-active]="state.activeIndex === i ? '' : null" (mousedown)="$event.preventDefault()" (click)="select(option)">{{ option.label }}</li>}@if (visibleOptions.length === 0) {<li class="hw-hint" role="presentation">{{ emptyMessage }}</li>}</ul><span class="hw-sr-only" role="status" aria-live="polite">{{ state.open ? resultsMessage(visibleOptions.length) : '' }}</span>${fieldEnd}</div>` })
export class HwComboboxComponent extends HwValueControl<string> implements OnChanges, AfterViewInit {
  override value = '';
  @Input({transform: booleanAttribute}) readOnly = false;
  @Input() options: readonly Option[] = [];
  @Input() placeholder = '';
  @Input() emptyMessage = 'No results';
  @Input() validationMessage = 'Select an option from the list.';
  @Input() resultsMessage: (count: number) => string = count => `${count} results available`;
  @ViewChild('input') input?: ElementRef<HTMLInputElement>;
  state = createComboboxState([]);
  composing = false;
  private readonly host = inject(ElementRef<HTMLElement>);
  private disabledObserver?: MutationObserver;
  private get blocked(): boolean { return this.disabled || this.readOnly || !!(this.input && isDisabled(this.input.nativeElement)); }
  get visibleOptions(): Option[] { return getComboboxOptions(this.state, this.options); }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.value !== this.state.value || !this.state.query || (changes['options'] && this.state.value)) this.state = createComboboxState(this.options, this.value);
    else if (changes['options'] && this.state.open) this.dispatch({type: 'open'});
    if (this.blocked) this.dispatch({type: 'close'});
    this.syncValidity();
  }
  ngAfterViewInit(): void {
    this.syncValidity();
    const input = this.input?.nativeElement;
    if (!input) return;
    const Observer = input.ownerDocument.defaultView?.MutationObserver;
    if (Observer) {
      this.disabledObserver = new Observer(() => { if (this.blocked) this.dispatch({type: 'close'}); this.syncValidity(); this.changeDetector.markForCheck(); });
      for (let ancestor = input.parentElement; ancestor; ancestor = ancestor.parentElement) {
        if (ancestor.localName === 'fieldset') this.disabledObserver.observe(ancestor, { attributes: true, attributeFilter: ['disabled'] });
      }
    }
  }
  ngOnDestroy(): void { this.disabledObserver?.disconnect(); }
  private syncValidity(): void { this.input?.nativeElement.setCustomValidity(this.required && !this.disabled && !this.state.value ? this.validationMessage : ''); }
  override writeValue(value: string): void { super.writeValue(value ?? ''); this.state = createComboboxState(this.options, value ?? ''); this.syncValidity(); }
  override setDisabledState(disabled: boolean): void { super.setDisabledState(disabled); if (disabled) this.dispatch({type: 'close'}); this.syncValidity(); }
  dispatch(event: ComboboxEvent): void { if (this.blocked && event.type !== 'close' && event.type !== 'reset') return; this.state = transitionCombobox(this.state, event, this.options); this.syncValidity(); }
  inputChanged(event: Event): void { if (!this.composing && !(event as InputEvent).isComposing) this.search((event.target as HTMLInputElement).value); }
  compositionEnded(event: Event): void { this.composing = false; this.search((event.target as HTMLInputElement).value); }
  @HostListener('document:pointerdown', ['$event']) outside(event: Event): void { if (!this.host.nativeElement.contains(event.target as Node)) this.dispatch({type: 'close'}); }
  search(query: string): void { if (this.blocked) { if (this.input) this.input.nativeElement.value = this.state.query; return; } this.dispatch({type: 'input', query}); this.update(this.state.value); }
  select(option: Option): void { if (this.blocked || option.disabled) return; this.dispatch({type: 'select', value: option.value}); this.update(this.state.value); this.input?.nativeElement.focus(); }
  blur(): void { this.dispatch({type: 'close'}); this.touch(); }
  keydown(event: KeyboardEvent): void {
    if (event.isComposing || this.composing || event.altKey || event.ctrlKey || event.metaKey || this.blocked) return;
    if (['ArrowDown', 'ArrowUp'].includes(event.key) || (this.state.open && ['Home', 'End'].includes(event.key))) {
      event.preventDefault(); this.dispatch({type: 'navigate', key: event.key as 'ArrowDown' | 'ArrowUp' | 'Home' | 'End'});
      this.changeDetector.detectChanges();
      this.input?.nativeElement.ownerDocument.getElementById(`${this.controlId}-option-${this.state.activeIndex}`)?.scrollIntoView?.({block: 'nearest'});
    } else if (event.key === 'Enter' && this.state.open) {
      const option = this.visibleOptions[this.state.activeIndex]; if (option && !option.disabled) { event.preventDefault(); this.select(option); }
    } else if (event.key === 'Escape' && this.state.open) { event.preventDefault(); event.stopPropagation(); this.dispatch({type: 'close'}); }
    else if (event.key === 'Tab') this.dispatch({type: 'close'});
  }
}

@Component({ selector: 'hw-file-upload', standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwFileUploadComponent), multi: true }],
  template: `<div class="hw-field hw-upload"><label class="hw-label" [for]="controlId">{{ label }}</label><input #fileInput class="hw-input" type="file" [id]="controlId" [name]="name" [accept]="accept" [multiple]="multiple" [disabled]="disabled" [required]="required" [attr.aria-describedby]="descriptionIds" [attr.aria-invalid]="error ? true : null" (change)="filesChanged($event)" (blur)="touch()">${fieldEnd}</div>` })
export class HwFileUploadComponent extends HwValueControl<readonly File[]> {
  override value: readonly File[] = [];
  @Input() accept = '';
  @Input({transform: booleanAttribute}) multiple = false;
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  filesChanged(event: Event): void { this.update(Array.from((event.target as HTMLInputElement).files ?? [])); }
  override writeValue(value: readonly File[] | null): void {
    super.writeValue(value ?? []);
    // Browsers only allow programmatic clearing, never assigning a local file.
    if (!value?.length && this.fileInput) this.fileInput.nativeElement.value = '';
  }
}
