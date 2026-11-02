import { booleanAttribute, ChangeDetectorRef, Component, Directive, EventEmitter, forwardRef, HostListener, inject, Input, Output, ViewChild, ElementRef, type AfterViewInit, type OnChanges, type SimpleChanges } from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { createComboboxState, getComboboxOptions, isDisabled, transitionCombobox, type ComboboxEvent, type Option } from '@nasaq/core';

let nextId = 0;
/** Pass controlId for stable application-owned identifiers, especially with SSR. */
@Directive()
export abstract class NqValueControl<T> implements ControlValueAccessor {
  @Input() controlId = `nq-control-${++nextId}`;
  @Input() label = '';
  @Input() name = '';
  @Input() hint = '';
  @Input() error = '';
  @Input({transform: booleanAttribute}) required = false;
  @Input({transform: booleanAttribute}) disabled = false;
  @Input() value!: T;
  @Output() readonly valueChange = new EventEmitter<T>();
  protected readonly changeDetector = inject(ChangeDetectorRef);
  protected onChange: (value: T) => void = () => {};
  protected onTouched: () => void = () => {};
  get descriptionIds(): string | null { return [this.hint && `${this.controlId}-hint`, this.error && `${this.controlId}-error`].filter(Boolean).join(' ') || null; }
  writeValue(value: T): void { this.value = value; this.changeDetector.markForCheck(); }
  registerOnChange(fn: (value: T) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { this.disabled = disabled; this.changeDetector.markForCheck(); }
  update(value: T): void { if (this.disabled) return; this.value = value; this.onChange(value); this.valueChange.emit(value); }
  touch(): void { this.onTouched(); }
}

const fieldEnd = `@if (hint) { <p class="nq-hint" [id]="controlId + '-hint'">{{ hint }}</p> } @if (error) { <p class="nq-error" [id]="controlId + '-error'">{{ error }}</p> }`;

@Component({ selector: 'nq-field', standalone: true, template: `<div class="nq-field"><label class="nq-label" [for]="controlId">{{ label }}</label><ng-content />@if (hint) {<p class="nq-hint" [id]="controlId + '-hint'">{{ hint }}</p>}@if (error) {<p class="nq-error" [id]="controlId + '-error'">{{ error }}</p>}</div>` })
export class NqFieldComponent {
  @Input({ required: true }) controlId = '';
  @Input({ required: true }) label = '';
  @Input() hint = '';
  @Input() error = '';
}

@Component({ selector: 'nq-text-field', standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NqTextFieldComponent), multi: true }],
  template: `<div class="nq-field"><label class="nq-label" [for]="controlId">{{ label }}</label><input class="nq-input" [attr.data-size]="size" [attr.data-variant]="visualVariant" [id]="controlId" [type]="type" [name]="name" [value]="value || ''" [disabled]="disabled" [required]="required" [readOnly]="readOnly" [placeholder]="placeholder" [attr.autocomplete]="autocomplete" [attr.inputmode]="inputmode || null" [attr.min]="min" [attr.max]="max" [attr.step]="step" [attr.minlength]="minLength" [attr.maxlength]="maxLength" [attr.pattern]="pattern" [attr.aria-describedby]="descriptionIds" [attr.aria-invalid]="error ? true : null" (input)="update($any($event.target).value)" (blur)="touch()">${fieldEnd}</div>` })
export class NqTextFieldComponent extends NqValueControl<string> {
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

@Component({ selector: 'nq-textarea', standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NqTextareaComponent), multi: true }],
  template: `<div class="nq-field"><label class="nq-label" [for]="controlId">{{ label }}</label><textarea class="nq-textarea" [attr.data-size]="size" [attr.data-variant]="visualVariant" [id]="controlId" [name]="name" [value]="value || ''" [disabled]="disabled" [required]="required" [readOnly]="readOnly" [rows]="rows" [placeholder]="placeholder" [attr.maxlength]="maxLength" [attr.aria-describedby]="descriptionIds" [attr.aria-invalid]="error ? true : null" (input)="update($any($event.target).value)" (blur)="touch()"></textarea>${fieldEnd}</div>` })
export class NqTextareaComponent extends NqValueControl<string> {
  override value = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() visualVariant: 'outline' | 'filled' = 'outline';
  @Input() rows = 4;
  @Input() placeholder = '';
  @Input() maxLength: number | null = null;
  @Input({transform: booleanAttribute}) readOnly = false;
}

@Component({ selector: 'nq-select', standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NqSelectComponent), multi: true }],
  template: `<div class="nq-field"><label class="nq-label" [for]="controlId">{{ label }}</label><select class="nq-select" [attr.data-size]="size" [attr.data-variant]="visualVariant" [id]="controlId" [name]="name" [value]="value || ''" [disabled]="disabled" [required]="required" [attr.aria-describedby]="descriptionIds" [attr.aria-invalid]="error ? true : null" (change)="update($any($event.target).value)" (blur)="touch()">@if (placeholder) {<option value="">{{ placeholder }}</option>}@for (option of options; track option.value) {<option [value]="option.value" [disabled]="option.disabled ?? false" [selected]="option.value === value">{{ option.label }}</option>}</select>${fieldEnd}</div>` })
export class NqSelectComponent extends NqValueControl<string> {
  override value = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() visualVariant: 'outline' | 'filled' = 'outline';
  @Input() options: readonly Option[] = [];
  @Input() placeholder = 'Select an option';
}

@Component({ selector: 'nq-checkbox', standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NqCheckboxComponent), multi: true }],
  template: `<div class="nq-field"><label class="nq-cluster" [for]="controlId"><input class="nq-checkbox" type="checkbox" [id]="controlId" [name]="name" [checked]="value" [disabled]="disabled" [required]="required" [indeterminate]="indeterminate" [attr.aria-describedby]="descriptionIds" [attr.aria-invalid]="error ? true : null" (change)="update($any($event.target).checked)" (blur)="touch()"><span>{{ label }}</span></label>${fieldEnd}</div>` })
export class NqCheckboxComponent extends NqValueControl<boolean> {
  override value = false;
  @Input({transform: booleanAttribute}) indeterminate = false;
}

@Component({ selector: 'nq-switch', standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NqSwitchComponent), multi: true }],
  template: `<div class="nq-field"><label class="nq-cluster" [for]="controlId"><input class="nq-switch" type="checkbox" role="switch" [id]="controlId" [name]="name" [checked]="value" [disabled]="disabled" [required]="required" [attr.aria-describedby]="descriptionIds" [attr.aria-invalid]="error ? true : null" (change)="update($any($event.target).checked)" (blur)="touch()"><span>{{ label }}</span></label>${fieldEnd}</div>` })
export class NqSwitchComponent extends NqValueControl<boolean> { override value = false; }

@Component({ selector: 'nq-radio', standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NqRadioComponent), multi: true }],
  template: `<fieldset class="nq-field" [disabled]="disabled" [attr.aria-describedby]="descriptionIds" [attr.aria-invalid]="error ? true : null"><legend class="nq-label">{{ label }}</legend>@for (option of options; track option.value; let i = $index) {<label class="nq-cluster" [for]="controlId + '-' + i"><input class="nq-radio" type="radio" [id]="controlId + '-' + i" [name]="name || controlId" [value]="option.value" [checked]="value === option.value" [disabled]="disabled || (option.disabled ?? false)" [required]="required" (change)="update(option.value)" (blur)="touch()"><span>{{ option.label }}</span></label>}${fieldEnd}</fieldset>` })
export class NqRadioComponent extends NqValueControl<string> {
  override value = '';
  @Input() options: readonly Option[] = [];
}

@Component({ selector: 'nq-combobox', standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NqComboboxComponent), multi: true }],
  template: `<div class="nq-field nq-combobox"><label class="nq-label" [for]="controlId">{{ label }}</label><input #input class="nq-input" role="combobox" aria-autocomplete="list" aria-haspopup="listbox" autocomplete="off" [id]="controlId" [value]="state.query" [disabled]="disabled" [readOnly]="readOnly" [attr.aria-readonly]="readOnly || null" [required]="required" [placeholder]="placeholder" [attr.aria-expanded]="state.open" [attr.aria-controls]="controlId + '-list'" [attr.aria-activedescendant]="state.open && state.activeIndex >= 0 ? controlId + '-option-' + state.activeIndex : null" [attr.aria-describedby]="descriptionIds" [attr.aria-invalid]="error ? true : null" (input)="inputChanged($event)" (compositionstart)="composing = true" (compositionend)="compositionEnded($event)" (focus)="dispatch({type: 'open'})" (click)="dispatch({type: 'open'})" (keydown)="keydown($event)" (blur)="blur()"><input type="hidden" [name]="name" [value]="state.value" [disabled]="disabled"><ul class="nq-listbox" role="listbox" [id]="controlId + '-list'" [attr.aria-label]="label" [hidden]="!state.open">@for (option of visibleOptions; track option.value; let i = $index) {<li class="nq-option" role="option" [id]="controlId + '-option-' + i" [attr.aria-selected]="state.value === option.value" [attr.aria-disabled]="option.disabled || null" [attr.data-active]="state.activeIndex === i ? '' : null" (mousedown)="$event.preventDefault()" (click)="select(option)">{{ option.label }}</li>}@if (visibleOptions.length === 0) {<li class="nq-hint" role="presentation">{{ emptyMessage }}</li>}</ul><span class="nq-sr-only" role="status" aria-live="polite">{{ state.open ? resultsMessage(visibleOptions.length) : '' }}</span>${fieldEnd}</div>` })
export class NqComboboxComponent extends NqValueControl<string> implements OnChanges, AfterViewInit {
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

@Component({ selector: 'nq-file-upload', standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NqFileUploadComponent), multi: true }],
  template: `<div class="nq-field nq-upload"><label class="nq-label" [for]="controlId">{{ label }}</label><input #fileInput class="nq-input" type="file" [id]="controlId" [name]="name" [accept]="accept" [multiple]="multiple" [disabled]="disabled" [required]="required" [attr.aria-describedby]="descriptionIds" [attr.aria-invalid]="error ? true : null" (change)="filesChanged($event)" (blur)="touch()">${fieldEnd}</div>` })
export class NqFileUploadComponent extends NqValueControl<readonly File[]> {
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
