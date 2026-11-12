import { observeAngularFieldPresence } from './field-presence';
import { injectIsBrowser, setConstraintValidity, writeFiles } from './platform';
import { injectId } from './ids';
import { HwTexts } from './text';
import { InputValueSync } from './input-value';
import { controlAria, controlFocus, fieldDescriptionIds, fieldEnd, fieldLabel, fieldLegend, groupFocus } from './field-templates';
import { forwardedAriaHost } from './host-attributes';
import { afterNextRender, booleanAttribute, ChangeDetectorRef, Component, DestroyRef, Directive, EventEmitter, forwardRef, HostListener, inject, InjectionToken, Input, Output, ViewChild, ElementRef, type AfterViewInit, type OnChanges, type OnInit, type SimpleChanges } from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { createComboboxState, getComboboxOptions, isDisabled, observeFormReset, sameValue, transitionCombobox, type ComboboxEvent, type FormResetObserver, type Option } from '@hawiyah/core';

/** What an hw-field offers to the Hawiyah value control declared inside it, and to application-written controls. */
export interface HwFieldContext { readonly controlId: string; readonly label: string; readonly labelId: string | null; readonly descriptionIds: string | null; readonly required: boolean; readonly invalid: boolean }
export const HW_FIELD = new InjectionToken<HwFieldContext>('HW_FIELD');

const copy = <T>(value: T): T => (Array.isArray(value) ? [...value] : value) as T;

/** Generated ids are the same on the server and after hydration; pass controlId for an application-owned identifier.
 * aria-label, aria-labelledby, aria-describedby and aria-invalid written on the host are inputs: they reach the
 * native control (the fieldset of a group) and are removed from the wrapper element. */
@Directive({host: forwardedAriaHost})
export abstract class HwValueControl<T> implements ControlValueAccessor, OnInit {
  constructor() {
    observeAngularFieldPresence();
    // No listener on the server: the form is observed after the first render in a browser.
    if (!injectIsBrowser()) return;
    let observer: FormResetObserver | undefined;
    afterNextRender(() => { observer = observeFormReset(this.hostElement, () => this.resetFromForm()); });
    inject(DestroyRef).onDestroy(() => observer?.destroy());
  }
  protected readonly hostElement: HTMLElement = inject(ElementRef).nativeElement;
  private readonly generatedId = injectId('hw-control');
  private givenId: string | null = null;
  /** The surrounding hw-field of the same template; a control inside another component's view has none. */
  protected readonly field = inject(HW_FIELD, {optional: true, host: true});
  /** The application's id, else the id of the surrounding hw-field, else a generated one. */
  @Input() set controlId(value: string | null | undefined) { this.givenId = value || null; }
  get controlId(): string { return this.givenId ?? this.field?.controlId ?? this.generatedId; }
  @Input() label = '';
  @Input() name = '';
  @Input() hint = '';
  @Input() error = '';
  @Input({alias: 'aria-label'}) ariaLabel: string | null = null;
  @Input({alias: 'aria-labelledby'}) ariaLabelledby: string | null = null;
  @Input({alias: 'aria-describedby'}) ariaDescribedby: string | null = null;
  @Input({alias: 'aria-invalid', transform: booleanAttribute}) ariaInvalid = false;
  /** Id of the form that owns the control when it is not a descendant of it; written on every native control. */
  @Input() form: string | null = null;
  private ownRequired = false;
  /** Required by itself or through the surrounding hw-field. */
  @Input({transform: booleanAttribute}) set required(value: boolean) { this.ownRequired = value; }
  get required(): boolean { return this.ownRequired || Boolean(this.field?.required); }
  @Input({transform: booleanAttribute}) disabled = false;
  @Input() value!: T;
  @Output() readonly valueChange = new EventEmitter<T>();
  /** Focus entered the control, and left it. The native events do not bubble to the host. */
  @Output('focused') readonly focusEvents = new EventEmitter<FocusEvent>();
  @Output('blurred') readonly blurEvents = new EventEmitter<FocusEvent>();
  protected readonly changeDetector = inject(ChangeDetectorRef);
  protected onChange: (value: T) => void = () => {};
  protected onTouched: () => void = () => {};
  /** A submission failed on this control (its `invalid` event); cleared once it is valid again or the form resets. */
  protected submissionInvalid = false;
  private formsBound = false;
  private initial!: T;
  /** Ids of the control's own label, hint and error: inside an hw-field the field's ids belong to the field's elements. */
  get decorationId(): string { return this.field ? this.generatedId : this.controlId; }
  get labelledBy(): string | null { return this.ariaLabelledby ?? (this.ariaLabel || this.label || !this.field ? null : this.field.labelId); }
  get descriptionIds(): string | null { return fieldDescriptionIds(this.ariaDescribedby, this.field?.descriptionIds, this.hint && `${this.decorationId}-hint`, this.shownError && `${this.decorationId}-error`); }
  /** The text of the one error element. A component that produces a validation message overrides it. */
  get shownError(): string { return this.error; }
  get invalid(): true | null { return this.error || this.ariaInvalid || this.field?.invalid || this.submissionInvalid ? true : null; }
  /** Named without the component's own label: by a forwarded attribute or by the surrounding field. */
  get named(): boolean { return Boolean(this.ariaLabel || this.ariaLabelledby || this.field?.label); }
  /** The value held after the first inputs is what a native reset restores while no Angular Forms directive is attached. */
  ngOnInit(): void { this.initial = copy(this.value); }
  writeValue(value: T): void { this.value = value; this.settle(); this.changeDetector.markForCheck(); }
  registerOnChange(fn: (value: T) => void): void { this.onChange = fn; this.formsBound = true; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { this.disabled = disabled; this.changeDetector.markForCheck(); }
  update(value: T): void { if (this.disabled) return; this.value = value; this.onChange(value); this.valueChange.emit(value); this.settle(); }
  touch(): void { this.onTouched(); }
  failed(): void { this.submissionInvalid = true; this.changeDetector.markForCheck(); }
  /** After a value change: a failed submission stays exposed until the native controls are valid again. */
  protected settle(): void { if (this.submissionInvalid && Array.from(this.hostElement.querySelectorAll<HTMLInputElement>('input, select, textarea')).every(control => control.validity?.valid !== false)) this.submissionInvalid = false; }
  /** Group controls: focus entered the fieldset from outside, or left it. Moving between two options emits nothing. */
  protected entered(event: FocusEvent): void { if (!(event.currentTarget as Node).contains(event.relatedTarget as Node | null)) this.focusEvents.emit(event); }
  protected left(event: FocusEvent): void { if (!(event.currentTarget as Node).contains(event.relatedTarget as Node | null)) this.blurEvents.emit(event); }
  /** After a native reset: secondary state returns to its initial state (popups, drafts, file lists, visibility). */
  protected afterReset(): void {}
  /** After a native reset: writes the held value to the native controls as properties; the browser has reset them. */
  protected syncDom(): void {}
  /** A native reset is a value change made by the form. With Angular Forms attached the form model owns the value and
   * the component only shows what it holds; otherwise the initial value returns and is reported once when it differs.
   * It does not go through update(): read-only and disabled controls are reset too. */
  private resetFromForm(): void {
    if (!this.formsBound && !sameValue(this.value, this.initial)) { this.value = copy(this.initial); this.valueChange.emit(this.value); }
    this.submissionInvalid = false; this.afterReset(); this.syncDom(); this.changeDetector.markForCheck();
  }
}

/** Wraps one control with its label, hint and error. A Hawiyah value control declared inside it takes the field's id
 * and is named, described, required and invalid through it; a native control is bound through a template reference. */
@Component({ selector: 'hw-field', standalone: true, host: forwardedAriaHost, providers: [{ provide: HW_FIELD, useExisting: forwardRef(() => HwFieldComponent) }], template: `<div class="hw-field">${fieldLabel}<ng-content />${fieldEnd}</div>` })
export class HwFieldComponent implements HwFieldContext {
  @Input() controlId = injectId('hw-field');
  @Input() label = '';
  @Input() hint = '';
  @Input() error = '';
  @Input({alias: 'aria-describedby'}) ariaDescribedby: string | null = null;
  @Input({transform: booleanAttribute}) required = false;
  get decorationId(): string { return this.controlId; }
  get shownError(): string { return this.error; }
  get labelId(): string | null { return this.label ? `${this.controlId}-label` : null; }
  get invalid(): boolean { return Boolean(this.error); }
  get descriptionIds(): string | null { return fieldDescriptionIds(this.ariaDescribedby, this.hint && `${this.controlId}-hint`, this.error && `${this.controlId}-error`); }
}

@Component({ selector: 'hw-text-field', standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwTextFieldComponent), multi: true }],
  template: `<div class="hw-field">${fieldLabel}<input #input class="hw-input" [attr.data-size]="size" [attr.data-variant]="visualVariant" [id]="controlId" [type]="type" [name]="name" [attr.form]="form" [disabled]="disabled" [required]="required" [readOnly]="readOnly" [attr.placeholder]="placeholder || null" [attr.autocomplete]="autocomplete" [attr.inputmode]="inputmode || null" [attr.min]="min" [attr.max]="max" [attr.step]="step" [attr.minlength]="minLength" [attr.maxlength]="maxLength" [attr.pattern]="pattern" ${controlAria} (input)="typed($any($event.target).value)" ${controlFocus}>${fieldEnd}</div>` })
export class HwTextFieldComponent extends HwValueControl<string> {
  override value = '';
  @ViewChild('input') input?: ElementRef<HTMLInputElement>;
  // The value is written after each render instead of bound in the template, so that
  // text being typed into a number or date input is never replaced.
  private readonly shown = new InputValueSync();
  typed(value: string): void { this.shown.typed(value); this.update(value); }
  ngAfterViewChecked(): void { this.shown.apply(this.input?.nativeElement, this.value || ''); }
  override writeValue(value: string): void { super.writeValue(value); this.shown.force(); }
  protected override syncDom(): void { this.shown.force(); this.shown.apply(this.input?.nativeElement, this.value || ''); }
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
  template: `<div class="hw-field">${fieldLabel}<textarea #control class="hw-textarea" [attr.data-size]="size" [attr.data-variant]="visualVariant" [id]="controlId" [name]="name" [attr.form]="form" [value]="value || ''" [disabled]="disabled" [required]="required" [readOnly]="readOnly" [attr.rows]="rows" [attr.placeholder]="placeholder || null" [attr.maxlength]="maxLength" ${controlAria} (input)="update($any($event.target).value)" ${controlFocus}></textarea>${fieldEnd}</div>` })
export class HwTextareaComponent extends HwValueControl<string> {
  override value = '';
  @ViewChild('control') control?: ElementRef<HTMLTextAreaElement>;
  protected override syncDom(): void { if (this.control) this.control.nativeElement.value = this.value || ''; }
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() visualVariant: 'outline' | 'filled' = 'outline';
  /** Optional and without a default: the height comes from the stylesheet. */
  @Input() rows: number | null = null;
  @Input() placeholder = '';
  @Input() maxLength: number | null = null;
  @Input({transform: booleanAttribute}) readOnly = false;
}

/** Options come from `options`, from projected option and optgroup elements, which follow them, or from both. */
@Component({ selector: 'hw-select', standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwSelectComponent), multi: true }],
  template: `<div class="hw-field">${fieldLabel}<select #control class="hw-select" [attr.data-size]="size" [attr.data-variant]="visualVariant" [id]="controlId" [name]="name" [attr.form]="form" [value]="value || ''" [disabled]="disabled" [required]="required" ${controlAria} (change)="update($any($event.target).value)" ${controlFocus}>@if (showPrompt) {<option value="">{{ placeholder }}</option>}@for (option of options; track option.value) {<option [value]="option.value" [disabled]="option.disabled ?? false" [selected]="option.value === value">{{ option.label }}</option>}<ng-content /></select>${fieldEnd}</div>` })
export class HwSelectComponent extends HwValueControl<string> {
  override value = '';
  @ViewChild('control') control?: ElementRef<HTMLSelectElement>;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() visualVariant: 'outline' | 'filled' = 'outline';
  @Input() options: readonly Option[] = [];
  /** Text of the empty prompt option. Without it no prompt is rendered and the first option is selected, as in a native select.
   * Projected content is not visible to the component: with a projected empty option, leave `placeholder` unset. */
  @Input() placeholder = '';
  get showPrompt(): boolean { return Boolean(this.placeholder) && !this.options.some(option => option.value === ''); }
  // A projected option may be rendered after the value was set: the select shows the value as soon as an option carries it.
  ngAfterViewChecked(): void {
    const select = this.control?.nativeElement, value = this.value || '';
    if (select && select.value !== value && Array.from(select.options).some(option => option.value === value)) select.value = value;
  }
  protected override syncDom(): void { if (this.control) this.control.nativeElement.value = this.value || ''; }
}

/** The label is `label`, else the projected content. `value` is the boolean model; `submitValue` is what a checked box submits. */
@Component({ selector: 'hw-checkbox', standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwCheckboxComponent), multi: true }],
  template: `<div class="hw-field"><label class="hw-choice" [for]="controlId"><input #control class="hw-checkbox" type="checkbox" [id]="controlId" [name]="name" [attr.form]="form" [attr.value]="submitValue" [checked]="value" [disabled]="disabled" [required]="required" [readOnly]="readOnly" [attr.aria-disabled]="readOnly || null" [indeterminate]="indeterminate" ${controlAria} (change)="!readOnly && update($any($event.target).checked)" ${controlFocus}>@if (label) {{{ label }}} @else {<ng-content />}</label>${fieldEnd}</div>` })
export class HwCheckboxComponent extends HwValueControl<boolean> {
  @Input({transform: booleanAttribute}) readOnly = false;
  override value = false;
  @Input({transform: booleanAttribute}) indeterminate = false;
  /** The native value attribute: what a checked box submits. Without it the browser submits "on". */
  @Input() submitValue: string | null = null;
  @ViewChild('control') control?: ElementRef<HTMLInputElement>;
  protected override syncDom(): void { const input = this.control?.nativeElement; if (input) { input.checked = Boolean(this.value); input.indeterminate = this.indeterminate; } }
}

@Component({ selector: 'hw-switch', standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwSwitchComponent), multi: true }],
  template: `<div class="hw-field"><label class="hw-choice" [for]="controlId"><input #control class="hw-switch" type="checkbox" role="switch" [id]="controlId" [name]="name" [attr.form]="form" [attr.value]="submitValue" [checked]="value" [disabled]="disabled" [required]="required" [readOnly]="readOnly" [attr.aria-disabled]="readOnly || null" ${controlAria} (change)="!readOnly && update($any($event.target).checked)" ${controlFocus}>@if (label) {{{ label }}} @else {<ng-content />}</label>${fieldEnd}</div>` })
export class HwSwitchComponent extends HwValueControl<boolean> {
  @Input({transform: booleanAttribute}) readOnly = false; override value = false;
  /** The native value attribute: what a switch that is on submits. Without it the browser submits "on". */
  @Input() submitValue: string | null = null;
  @ViewChild('control') control?: ElementRef<HTMLInputElement>;
  protected override syncDom(): void { if (this.control) this.control.nativeElement.checked = Boolean(this.value); }
}

/** A whole group of radio options in a fieldset. A single option has no component: use a native input with the hw-radio class. */
@Component({ selector: 'hw-radio-group', standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwRadioGroupComponent), multi: true }],
  template: `<fieldset class="hw-field" [disabled]="disabled" ${controlAria} ${groupFocus}>${fieldLegend}@for (option of options; track option.value; let i = $index) {<label class="hw-choice" [for]="controlId + '-' + i"><input class="hw-radio" type="radio" [id]="controlId + '-' + i" [name]="name || controlId" [attr.form]="form" [value]="option.value" [checked]="value === option.value" [disabled]="disabled || (option.disabled ?? false)" [required]="required" [readOnly]="readOnly" [attr.aria-disabled]="readOnly || null" (change)="!readOnly && update(option.value)" (blur)="touch()">{{ option.label }}</label>}${fieldEnd}</fieldset>` })
export class HwRadioGroupComponent extends HwValueControl<string> {
  @Input({transform: booleanAttribute}) readOnly = false;
  override value = '';
  @Input() options: readonly Option[] = [];
  protected override syncDom(): void { this.hostElement.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach(radio => { radio.checked = radio.value === this.value; }); }
}

/** The field is div.hw-field; div.hw-combobox wraps only the input, the hidden input, the list and the status, because
 * the list is positioned against it. Hint and error follow the box. */
@Component({ selector: 'hw-combobox', standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwComboboxComponent), multi: true }],
  template: `<div class="hw-field">${fieldLabel}<div class="hw-combobox"><input #input type="text" class="hw-input" role="combobox" aria-autocomplete="list" autocomplete="off" [id]="controlId" [attr.form]="form" [value]="state.query" [disabled]="disabled" [readOnly]="readOnly" [attr.aria-readonly]="readOnly || null" [required]="required" [attr.placeholder]="placeholder || null" [attr.aria-expanded]="state.open" [attr.aria-controls]="controlId + '-listbox'" [attr.aria-activedescendant]="state.open && state.activeIndex >= 0 ? controlId + '-option-' + state.activeIndex : null" ${controlAria} (invalid)="submissionInvalid = true" (input)="inputChanged($event)" (compositionstart)="composing = true" (compositionend)="compositionEnded($event)" (focus)="dispatch({type: 'open'}); focusEvents.emit($event)" (click)="dispatch({type: 'open'})" (keydown)="keydown($event)" (blur)="blur($event)"><input type="hidden" [name]="name" [attr.form]="form" [value]="state.value" [disabled]="disabled"><ul class="hw-listbox" role="listbox" [id]="controlId + '-listbox'" [attr.aria-label]="ariaLabel" [attr.aria-labelledby]="ariaLabelledby ?? (ariaLabel || !label ? null : decorationId + '-label')" [hidden]="!state.open">@for (option of visibleOptions; track option.value; let i = $index) {<li class="hw-option" role="option" [id]="controlId + '-option-' + i" [attr.aria-selected]="state.value === option.value" [attr.aria-disabled]="option.disabled || null" [attr.data-active]="state.activeIndex === i ? '' : null" (mousedown)="$event.preventDefault()" (click)="select(option)">{{ option.label }}</li>}@if (visibleOptions.length === 0) {<li class="hw-hint" role="presentation">{{ texts.need('emptyMessage', emptyMessage) }}</li>}</ul><span class="hw-sr-only" role="status" aria-live="polite" aria-atomic="true">{{ state.open ? texts.call('getResultsMessage', getResultsMessage, [visibleOptions.length]) : '' }}</span></div>${fieldEnd}</div>` })
export class HwComboboxComponent extends HwValueControl<string> implements OnChanges, AfterViewInit {
  override value = '';
  @Input({transform: booleanAttribute}) readOnly = false;
  @Input() options: readonly Option[] = [];
  @Input() placeholder = '';
  /** Shown in the list when nothing matches. */
  @Input({required: true}) emptyMessage = '';
  /** Custom validity message while a required combobox has no selected option. Required when required is set. */
  @Input() requiredMessage = '';
  /** Live-region announcement of the number of matches. */
  @Input({required: true}) getResultsMessage!: (count: number) => string;
  /** Whether the list is open. A value written once is the initial state; the component then updates it, so [(open)] works.
   * Always closed while the control is disabled or read-only. */
  @Input({transform: booleanAttribute}) open = false;
  /** The reader opened or closed the list, or a form reset closed it. Not emitted when the application changes `open`. */
  @Output() readonly openChange = new EventEmitter<boolean>();
  /** The text of every accepted input event. Selecting an option, a reset and application writes do not emit it. */
  @Output() readonly queryChange = new EventEmitter<string>();
  protected readonly texts = new HwTexts('hw-combobox');
  @ViewChild('input') input?: ElementRef<HTMLInputElement>;
  state = createComboboxState([]);
  composing = false;
  private readonly host = inject(ElementRef<HTMLElement>);
  private disabledObserver?: MutationObserver;
  private get blocked(): boolean { return this.disabled || this.readOnly || !!(this.input && isDisabled(this.input.nativeElement)); }
  get visibleOptions(): Option[] { return getComboboxOptions(this.state, this.options); }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.value !== this.state.value || !this.state.query || (changes['options'] && this.state.value)) this.state = { ...createComboboxState(this.options, this.value), open: this.state.open };
    else if (changes['options'] && this.state.open) this.dispatch({type: 'open'}, false);
    // The application's request; a blocked control refuses it. Nothing is emitted inside change detection.
    if (changes['open'] && this.open !== this.state.open) { this.dispatch({type: this.open ? 'open' : 'close'}, false); this.open = this.state.open; }
    if (this.blocked) this.dispatch({type: 'close'}, false);
    this.syncValidity();
  }
  ngAfterViewInit(): void {
    this.syncValidity();
    const input = this.input?.nativeElement;
    if (!input) return;
    const Observer = input.ownerDocument.defaultView?.MutationObserver;
    if (Observer) {
      this.disabledObserver = new Observer(() => { if (this.blocked) this.dispatch({type: 'close'}, false); this.syncValidity(); this.changeDetector.markForCheck(); });
      for (let ancestor = input.parentElement; ancestor; ancestor = ancestor.parentElement) {
        if (ancestor.localName === 'fieldset') this.disabledObserver.observe(ancestor, { attributes: true, attributeFilter: ['disabled'] });
      }
    }
  }
  ngOnDestroy(): void { this.disabledObserver?.disconnect(); }
  private get constrained(): boolean { return this.required && !this.disabled && !this.state.value; }
  /** A violated constraint without a message still blocks submission; it is exposed as invalid only after a failed submission. */
  private syncValidity(): void {
    if (this.constrained) this.texts.need('requiredMessage', this.requiredMessage, 'required is set');
    setConstraintValidity(this.input?.nativeElement, this.constrained, this.requiredMessage);
    if (this.submissionInvalid && this.input?.nativeElement.validity?.valid) this.submissionInvalid = false;
  }
  override writeValue(value: string): void { super.writeValue(value ?? ''); this.state = { ...createComboboxState(this.options, value ?? ''), open: this.state.open }; this.syncValidity(); }
  override setDisabledState(disabled: boolean): void { super.setDisabledState(disabled); if (disabled) this.dispatch({type: 'close'}, false); this.syncValidity(); }
  /** `notify` is false for changes the application made: only the reader's actions and a form reset emit openChange. */
  dispatch(event: ComboboxEvent, notify = true): void {
    if (this.blocked && event.type !== 'close' && event.type !== 'reset') return;
    const wasOpen = this.state.open;
    this.state = transitionCombobox(this.state, event, this.options); this.syncValidity();
    if (this.state.open !== wasOpen) { this.open = this.state.open; if (notify) this.openChange.emit(this.open); }
  }
  protected override afterReset(): void {
    const wasOpen = this.state.open;
    this.state = createComboboxState(this.options, this.value); this.composing = false;
    if (wasOpen) { this.open = false; this.openChange.emit(false); }
    this.syncValidity();
  }
  protected override syncDom(): void { if (this.input) this.input.nativeElement.value = this.state.query; }
  inputChanged(event: Event): void { if (!this.composing && !(event as InputEvent).isComposing) this.search((event.target as HTMLInputElement).value); }
  compositionEnded(event: Event): void { this.composing = false; this.search((event.target as HTMLInputElement).value); }
  @HostListener('document:pointerdown', ['$event']) outside(event: Event): void { if (!this.host.nativeElement.contains(event.target as Node)) this.dispatch({type: 'close'}); }
  search(query: string): void { if (this.blocked) { if (this.input) this.input.nativeElement.value = this.state.query; return; } this.dispatch({type: 'input', query}); this.queryChange.emit(query); if (this.state.value !== this.value) this.update(this.state.value); }
  select(option: Option): void { if (this.blocked || option.disabled) return; this.dispatch({type: 'select', value: option.value}); if (this.state.value !== this.value) this.update(this.state.value); this.input?.nativeElement.focus(); }
  blur(event: FocusEvent): void { this.dispatch({type: 'close'}); this.touch(); this.blurEvents.emit(event); }
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

/** Content projected into hw-file-upload follows the input, for example an hw-file-upload-list. */
@Component({ selector: 'hw-file-upload', standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HwFileUploadComponent), multi: true }],
  template: `<div class="hw-field hw-upload">${fieldLabel}<input #fileInput class="hw-input" type="file" [id]="controlId" [name]="name" [attr.accept]="accept || null" [multiple]="multiple" [disabled]="disabled" [required]="required" [attr.capture]="capture || null" [attr.form]="form || null" ${controlAria} (change)="filesChanged($event)" ${controlFocus}><ng-content />${fieldEnd}</div>` })
export class HwFileUploadComponent extends HwValueControl<readonly File[]> {
  override value: readonly File[] = [];
  @Input() accept = '';
  @Input({transform: booleanAttribute}) multiple = false;
  /** The native capture attribute: which camera a mobile browser offers. No attribute without it. */
  @Input() capture: 'user' | 'environment' | '' = '';
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  filesChanged(event: Event): void { this.update(Array.from((event.target as HTMLInputElement).files ?? [])); }
  override writeValue(value: readonly File[] | null): void {
    super.writeValue(value ?? []);
    // Browsers only allow programmatic clearing, never assigning a local file.
    if (!value?.length && this.fileInput) this.fileInput.nativeElement.value = '';
  }
  // The browser emptied the input. The files the control still holds are assigned back; where that is not
  // possible the control reports the empty selection, so that held, shown and submitted value agree.
  protected override syncDom(): void { if (!writeFiles(this.fileInput?.nativeElement, this.value)) { this.value = []; this.onChange(this.value); this.valueChange.emit(this.value); } }
}
