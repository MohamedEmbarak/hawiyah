import '@angular/compiler';
import './fixtures/texts';
import { text, withText } from './fixtures/application-text';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { HwComboboxComponent, HwFieldComponent, HwFileDropzoneComponent, HwMultiSelectComponent, HwPinInputComponent, HwSwitchComponent, HwTagInputComponent, HwTextFieldComponent } from '@hawiyah/angular';
import { page } from './fixtures/page';
beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => { TestBed.resetTestingModule(); vi.unstubAllGlobals(); });

it('exposes switch errors to assistive technology and clears invalid state when resolved', () => {
  const fixture = TestBed.createComponent(HwSwitchComponent);
  fixture.componentRef.setInput('label', 'الإشعارات'); fixture.componentRef.setInput('hint', 'اختر تفضيلك'); fixture.componentRef.setInput('error', 'راجع الاختيار'); fixture.detectChanges();
  const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
  expect(input.getAttribute('aria-invalid')).toBe('true');
  const described = input.getAttribute('aria-describedby')!.split(' ').map(id => fixture.nativeElement.querySelector(`[id="${id}"]`)?.textContent);
  expect(described).toContain('راجع الاختيار'); expect(described).toContain('اختر تفضيلك');
  fixture.componentRef.setInput('error', ''); fixture.detectChanges();
  expect(input.hasAttribute('aria-invalid')).toBe(false); expect(fixture.nativeElement.querySelector('.hw-error')).toBeNull();
});

it('filters unknown and disabled selections for validation and submission without rewriting the parent control', () => {
  class Host { choices = new FormControl(['missing', 'disabled'], { nonNullable: true }); options = signal([{ value: 'available', label: 'Available' }, { value: 'disabled', label: 'Disabled', disabled: true }]); }
  Component({ standalone: true, imports: [ReactiveFormsModule, HwMultiSelectComponent], template: `<form><hw-multi-select ${withText.multiSelect} label="الخيارات" name="choices" required [options]="options()" [formControl]="choices" /></form>` })(Host); Object.assign(Host.prototype, { text });
  const fixture = TestBed.createComponent(Host); fixture.detectChanges(); const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
  const changed = vi.fn(); const subscription = fixture.componentInstance.choices.valueChanges.subscribe(changed);
  expect(form.checkValidity()).toBe(false); expect(new FormData(form).getAll('choices')).toEqual([]);
  fixture.componentInstance.options.update(options => [...options, { value: 'missing', label: 'Restored' }]); fixture.detectChanges();
  expect(form.checkValidity()).toBe(true); expect(new FormData(form).getAll('choices')).toEqual(['missing']);
  fixture.componentInstance.options.update(options => options.filter(option => option.value !== 'missing')); fixture.detectChanges();
  expect(form.checkValidity()).toBe(false); expect(new FormData(form).getAll('choices')).toEqual([]);
  expect(fixture.componentInstance.choices.value).toEqual(['missing', 'disabled']); expect(changed).not.toHaveBeenCalled(); subscription.unsubscribe();
});

it('normalizes externally supplied PIN digits and reactive reset while validating exact length', () => {
  class Host { pin = new FormControl('١٢٣٤٥٦٧', { nonNullable: true }); }
  Component({ standalone: true, imports: [ReactiveFormsModule, HwPinInputComponent], template: `<form><hw-pin-input label="الرمز" name="pin" [formControl]="pin" /></form>` })(Host); Object.assign(Host.prototype, { text });
  const fixture = TestBed.createComponent(Host); fixture.detectChanges(); const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
  expect(new FormData(form).get('pin')).toBe('123456'); expect(form.checkValidity()).toBe(true); expect(fixture.componentInstance.pin.value).toBe('١٢٣٤٥٦٧');
  fixture.componentInstance.pin.setValue('۱۲'); fixture.detectChanges(); expect(new FormData(form).get('pin')).toBe('12'); expect(form.checkValidity()).toBe(false);
  fixture.componentInstance.pin.reset(); fixture.detectChanges(); expect(new FormData(form).get('pin')).toBe('123456');
  fixture.componentInstance.pin.disable(); fixture.detectChanges(); expect(new FormData(form).getAll('pin')).toEqual([]);
});

it('requires committed tags and exposes required semantics with an empty draft', () => {
  class Host { tags = new FormControl(['هوية'], { nonNullable: true }); }
  Component({ standalone: true, imports: [ReactiveFormsModule, HwTagInputComponent], template: `<form><hw-tag-input ${withText.tagInput} label="الوسوم" name="tags" required [formControl]="tags" /></form>` })(Host); Object.assign(Host.prototype, { text });
  const fixture = TestBed.createComponent(Host); fixture.detectChanges(); const form: HTMLFormElement = fixture.nativeElement.querySelector('form'); const input = form.querySelector<HTMLInputElement>('input:not([type=hidden])')!;
  expect(input.required).toBe(false); expect(input.getAttribute('aria-required')).toBe('true'); expect(form.checkValidity()).toBe(true); expect(new FormData(form).getAll('tags')).toEqual(['هوية']);
  fixture.componentInstance.tags.setValue([]); fixture.detectChanges(); expect(form.checkValidity()).toBe(false);
  input.value = 'draft'; input.dispatchEvent(new Event('input', { bubbles: true })); fixture.detectChanges(); expect(form.checkValidity()).toBe(false);
  fixture.componentInstance.tags.reset(); fixture.detectChanges(); expect(form.checkValidity()).toBe(true); expect(input.value).toBe('');
});

it('[TEXT-FIELD-02][fields-basic-10] a group reports focused once when focus enters its fieldset and blurred once when it leaves, and nothing between two options', () => {
  const seen = vi.fn();
  const { root } = page(`<button id="before">Before</button><hw-radio-group [options]="cities" (focused)="seen('radio focus')" (blurred)="seen('radio blur')" /><hw-range-slider lowerLabel="Minimum" upperLabel="Maximum" (focused)="seen('range focus')" (blurred)="seen('range blur')" /><hw-rating [getRatingLabel]="text.rating.getRatingLabel" (focused)="seen('rating focus')" (blurred)="seen('rating blur')" /><hw-toggle-group label="View" [options]="cities" (focused)="seen('toggle focus')" (blurred)="seen('toggle blur')" /><hw-toggle-group label="Views" multiple [options]="cities" (focused)="seen('many focus')" (blurred)="seen('many blur')" /><button id="after">After</button>`, { cities: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }], text, seen });
  root.querySelector<HTMLElement>('#before')!.focus();
  for (const fieldset of root.querySelectorAll('fieldset')) { const [first, second] = [...fieldset.querySelectorAll<HTMLElement>('input:not([type=hidden]), button')]; first!.focus(); second!.focus(); first!.focus(); }
  root.querySelector<HTMLElement>('#after')!.focus();
  expect(seen.mock.calls.map(call => call[0])).toEqual(['radio', 'range', 'rating', 'toggle', 'many'].flatMap(name => [`${name} focus`, `${name} blur`]));
  document.body.replaceChildren();
});

it('[FIELD-02] a value control inside another component\'s view does not take the id of an hw-field outside that component', () => {
  class Wrapped {}
  Component({ selector: 'app-wrapped', standalone: true, imports: [HwTextFieldComponent], template: `<hw-text-field label="Inner" />` })(Wrapped);
  class Host {}
  Component({ standalone: true, imports: [HwFieldComponent, HwTextFieldComponent, Wrapped], template: `<hw-field controlId="outer" label="Outer" required error="Error"><app-wrapped /></hw-field><hw-field controlId="direct" label="Direct"><div><hw-text-field /></div></hw-field>` })(Host);
  const fixture = TestBed.createComponent(Host); fixture.detectChanges();
  const wrapped: HTMLInputElement = fixture.nativeElement.querySelector('app-wrapped input'), direct: HTMLInputElement = fixture.nativeElement.querySelector('#direct');
  expect(wrapped.id).not.toBe('outer'); expect(wrapped.id).toMatch(/^hw-control-/); expect(wrapped.required).toBe(false); expect(wrapped.hasAttribute('aria-invalid')).toBe(false); expect(wrapped.hasAttribute('aria-labelledby')).toBe(false);
  // Declared in the template of the field, at any depth of native elements, the control belongs to the field.
  expect(direct.localName).toBe('input'); expect(direct.getAttribute('aria-labelledby')).toBe('direct-label');
});

it('[RESET-10][rich-inputs-5][files-5] with Angular Forms attached the rich inputs write nothing themselves after a native reset: the form model decides', async () => {
  class Host {
    changed = vi.fn(); text = text; cities = [{ value: 'riyadh', label: 'Riyadh' }, { value: 'jeddah', label: 'Jeddah' }];
    group = new FormGroup({ city: new FormControl('riyadh', { nonNullable: true }), tags: new FormControl<string[]>(['a']), cities: new FormControl<string[]>(['jeddah'], { nonNullable: true }), pin: new FormControl('123456') });
  }
  Component({ standalone: true, imports: [ReactiveFormsModule, HwComboboxComponent, HwTagInputComponent, HwMultiSelectComponent, HwPinInputComponent], template: `<form [formGroup]="group"><hw-combobox ${withText.combobox} label="City" name="city" [options]="cities" formControlName="city" (valueChange)="changed('city')" /><hw-tag-input ${withText.tagInput} label="Tags" name="tags" formControlName="tags" (valueChange)="changed('tags')" /><hw-multi-select ${withText.multiSelect} label="Cities" name="cities" [options]="cities" formControlName="cities" (valueChange)="changed('cities')" /><hw-pin-input label="Code" name="pin" formControlName="pin" (valueChange)="changed('pin')" /></form>` })(Host);
  const fixture = TestBed.createComponent(Host); fixture.detectChanges(); const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
  const submitted = () => [...new FormData(form).entries()].map(([name, value]) => `${name}=${String(value)}`);
  expect(submitted()).toEqual(['city=riyadh', 'tags=a', 'cities=jeddah', 'pin=123456']);
  form.querySelectorAll<HTMLInputElement>('hw-multi-select input[type=checkbox]')[0]!.click(); fixture.detectChanges(); fixture.componentInstance.changed.mockClear();
  form.reset(); await Promise.resolve(); await Promise.resolve(); fixture.detectChanges();
  // Nullable controls are emptied by Angular Forms; nonNullable ones return to their initial value. The components report nothing themselves.
  expect(fixture.componentInstance.group.getRawValue()).toEqual({ city: 'riyadh', tags: null, cities: ['jeddah'], pin: null });
  expect(submitted()).toEqual(['city=riyadh', 'cities=jeddah', 'pin=']); expect(form.querySelector<HTMLInputElement>('hw-combobox input[role=combobox]')!.value).toBe('Riyadh');
  expect([...form.querySelectorAll<HTMLInputElement>('hw-multi-select input[type=checkbox]')].map(box => box.checked)).toEqual([false, true]); expect(fixture.componentInstance.changed).not.toHaveBeenCalled();
});

it('[RESET-10][files-5] a file dropzone with a standalone form control keeps showing and submitting the files the control holds after a native reset', async () => {
  class Host { files = new FormControl<File[]>([], { nonNullable: true }); text = text; changed = vi.fn(); }
  Component({ standalone: true, imports: [ReactiveFormsModule, HwFileDropzoneComponent], template: `<form><hw-file-dropzone label="Documents" name="documents" dropLabel="Drop files here" multiple [formControl]="files" (valueChange)="changed($event)" /></form>` })(Host);
  const fixture = TestBed.createComponent(Host); fixture.detectChanges(); const form: HTMLFormElement = fixture.nativeElement.querySelector('form'), input = form.querySelector<HTMLInputElement>('input[type=file]')!;
  // jsdom has no DataTransfer: the test owns the file list of the input and supplies the constructor a browser has.
  let held: File[] = []; Object.defineProperty(input, 'files', { configurable: true, get: () => held, set: (value: ArrayLike<File>) => { held = Array.from(value); } });
  vi.stubGlobal('DataTransfer', class { files: File[] = []; items = { add: (file: File) => { this.files.push(file); } }; });
  const chosen = [new File(['a'], 'a.pdf'), new File(['b'], 'b.pdf')]; held = chosen; input.dispatchEvent(new Event('change', { bubbles: true })); fixture.detectChanges();
  expect(fixture.componentInstance.files.value).toEqual(chosen); fixture.componentInstance.changed.mockClear();
  held = []; form.reset(); await Promise.resolve(); await Promise.resolve(); fixture.detectChanges();
  expect(held).toEqual(chosen); expect(fixture.componentInstance.files.value).toEqual(chosen); expect(fixture.componentInstance.changed).not.toHaveBeenCalled();
  // Where a file list cannot be assigned, the control reports the empty selection instead, so that held, shown and submitted value agree.
  vi.unstubAllGlobals(); held = []; form.reset(); await Promise.resolve(); await Promise.resolve(); fixture.detectChanges();
  expect(held).toEqual([]); expect(fixture.componentInstance.files.value).toEqual([]); expect(fixture.componentInstance.changed.mock.calls).toEqual([[[]]]);
});
