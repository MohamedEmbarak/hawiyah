import '@angular/compiler';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { HwMultiSelectComponent, HwPinInputComponent, HwSwitchComponent, HwTagInputComponent } from '@hawiyah/angular';
beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => TestBed.resetTestingModule());

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
  Component({ standalone: true, imports: [ReactiveFormsModule, HwMultiSelectComponent], template: '<form><hw-multi-select label="الخيارات" name="choices" required [options]="options()" [formControl]="choices" /></form>' })(Host);
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
  Component({ standalone: true, imports: [ReactiveFormsModule, HwPinInputComponent], template: '<form><hw-pin-input label="الرمز" name="pin" [formControl]="pin" /></form>' })(Host);
  const fixture = TestBed.createComponent(Host); fixture.detectChanges(); const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
  expect(new FormData(form).get('pin')).toBe('123456'); expect(form.checkValidity()).toBe(true); expect(fixture.componentInstance.pin.value).toBe('١٢٣٤٥٦٧');
  fixture.componentInstance.pin.setValue('۱۲'); fixture.detectChanges(); expect(new FormData(form).get('pin')).toBe('12'); expect(form.checkValidity()).toBe(false);
  fixture.componentInstance.pin.reset(); fixture.detectChanges(); expect(new FormData(form).get('pin')).toBe('123456');
  fixture.componentInstance.pin.disable(); fixture.detectChanges(); expect(new FormData(form).getAll('pin')).toEqual([]);
});

it('requires committed tags and exposes required semantics with an empty draft', () => {
  class Host { tags = new FormControl(['هوية'], { nonNullable: true }); }
  Component({ standalone: true, imports: [ReactiveFormsModule, HwTagInputComponent], template: '<form><hw-tag-input label="الوسوم" name="tags" required [formControl]="tags" /></form>' })(Host);
  const fixture = TestBed.createComponent(Host); fixture.detectChanges(); const form: HTMLFormElement = fixture.nativeElement.querySelector('form'); const input = form.querySelector<HTMLInputElement>('input:not([type=hidden])')!;
  expect(input.required).toBe(false); expect(input.getAttribute('aria-required')).toBe('true'); expect(form.checkValidity()).toBe(true); expect(new FormData(form).getAll('tags')).toEqual(['هوية']);
  fixture.componentInstance.tags.setValue([]); fixture.detectChanges(); expect(form.checkValidity()).toBe(false);
  input.value = 'draft'; input.dispatchEvent(new Event('input', { bubbles: true })); fixture.detectChanges(); expect(form.checkValidity()).toBe(false);
  fixture.componentInstance.tags.reset(); fixture.detectChanges(); expect(form.checkValidity()).toBe(true); expect(input.value).toBe('');
});
