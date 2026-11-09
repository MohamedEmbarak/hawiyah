import '@angular/compiler';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { HwMultiSelectComponent } from '@hawiyah/angular';
beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => TestBed.resetTestingModule());
it('validates required readonly selection without barring the search from focus or native validity', () => {
  class Host { choices = new FormControl<string[]>([], { nonNullable: true }); readonly = signal(true); options = [{ value: 'a', label: 'الأعمال' }]; }
  Component({ standalone: true, imports: [ReactiveFormsModule, HwMultiSelectComponent], template: '<form><hw-multi-select name="services" label="الخدمات" hint="اختر الخدمات" error="راجع الاختيار" required validationMessage="اختر خدمة" [options]="options" [readOnly]="readonly()" [formControl]="choices" /></form>' })(Host);
  const fixture = TestBed.createComponent(Host); fixture.detectChanges(); const form: HTMLFormElement = fixture.nativeElement.querySelector('form'); const search = form.querySelector<HTMLInputElement>('[type=search]')!;
  expect(search.getAttribute('aria-required')).toBe('true'); expect(search.getAttribute('aria-invalid')).toBe('true'); expect(search.getAttribute('aria-describedby')).toBeTruthy(); expect(search.readOnly).toBe(false); expect(form.checkValidity()).toBe(false); expect(search.validationMessage).toBe('اختر خدمة');
  search.focus(); expect(document.activeElement).toBe(search); const changed = vi.fn(); const subscription = fixture.componentInstance.choices.valueChanges.subscribe(changed);
  form.querySelector<HTMLInputElement>('[type=checkbox]')!.click(); fixture.detectChanges(); expect(changed).not.toHaveBeenCalled();
  fixture.componentInstance.choices.setValue(['a']); fixture.detectChanges(); expect(form.checkValidity()).toBe(true); expect(new FormData(form).getAll('services')).toEqual(['a']);
  search.value = 'no results'; search.dispatchEvent(new Event('input', { bubbles: true })); fixture.detectChanges(); expect(form.querySelector('[type=checkbox]')).toBeNull(); expect(new FormData(form).getAll('services')).toEqual(['a']);
  fixture.componentInstance.choices.disable(); fixture.detectChanges(); expect(form.checkValidity()).toBe(true); expect(search.validity.customError).toBe(false); expect(new FormData(form).getAll('services')).toEqual([]);
  fixture.componentInstance.choices.reset(); fixture.componentInstance.choices.enable(); fixture.detectChanges(); expect(form.checkValidity()).toBe(false); expect(search.value).toBe(''); subscription.unsubscribe();
});
