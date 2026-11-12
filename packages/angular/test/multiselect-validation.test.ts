import '@angular/compiler';
import './fixtures/texts';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { HwMultiSelectComponent } from '@hawiyah/angular';
beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => TestBed.resetTestingModule());
it('[RO-01][RO-02][RO-03][INV-01][INV-03] validates required readonly selection without barring the search or the checkboxes from focus or native validity', () => {
  class Host { choices = new FormControl<string[]>([], { nonNullable: true }); readonly = signal(true); options = [{ value: 'a', label: 'الأعمال' }]; selected = (count: number) => `المحدد: ${count}`; results = (count: number) => `النتائج: ${count}`; }
  Component({ standalone: true, imports: [ReactiveFormsModule, HwMultiSelectComponent], template: '<form><hw-multi-select name="services" label="الخدمات" hint="اختر الخدمات" error="راجع الاختيار" required requiredMessage="اختر خدمة" searchLabel="ابحث في الخدمات" emptyMessage="لا توجد خدمات" [getSelectedMessage]="selected" [getResultsMessage]="results" [options]="options" [readOnly]="readonly()" [formControl]="choices" /></form>' })(Host);
  const fixture = TestBed.createComponent(Host); fixture.detectChanges(); const form: HTMLFormElement = fixture.nativeElement.querySelector('form'); const search = form.querySelector<HTMLInputElement>('[type=search]')!;
  // The application's error marks the control; the unmet requirement alone would not, before a submission.
  expect(search.getAttribute('aria-required')).toBe('true'); expect(search.getAttribute('aria-invalid')).toBe('true'); expect(search.getAttribute('aria-describedby')).toBeTruthy(); expect(search.readOnly).toBe(false); expect(form.checkValidity()).toBe(false); expect(search.validationMessage).toBe('اختر خدمة'); expect(search.hasAttribute('placeholder')).toBe(false);
  const filterLabel = form.querySelector('label.hw-label[for]')!; expect(filterLabel.textContent).toBe('ابحث في الخدمات'); expect(filterLabel.getAttribute('for')).toBe(search.id); expect(form.querySelector('.hw-sr-only[role=status]')!.textContent).toBe(''); expect(form.querySelector('p.hw-multi-select-selected[role=status]')!.textContent).toBe('المحدد: 0');
  // Read-only: the checkbox stays enabled, focusable and named; activating it changes nothing.
  const box = form.querySelector<HTMLInputElement>('[type=checkbox]')!; expect(box.disabled).toBe(false); expect(box.getAttribute('aria-disabled')).toBe('true'); box.focus(); expect(document.activeElement).toBe(box); expect(form.querySelector('fieldset')!.getAttribute('data-hw-readonly')).toBe('true');
  search.focus(); expect(document.activeElement).toBe(search); const changed = vi.fn(); const subscription = fixture.componentInstance.choices.valueChanges.subscribe(changed);
  box.click(); fixture.detectChanges(); expect(changed).not.toHaveBeenCalled(); expect(box.checked).toBe(false);
  fixture.componentInstance.choices.setValue(['a']); fixture.detectChanges(); expect(form.checkValidity()).toBe(true); expect(new FormData(form).getAll('services')).toEqual(['a']);
  search.value = 'no results'; search.dispatchEvent(new Event('input', { bubbles: true })); fixture.detectChanges(); expect(form.querySelector('[type=checkbox]')).toBeNull(); expect(form.querySelector('.hw-multi-select-options p.hw-hint')!.textContent).toBe('لا توجد خدمات'); expect(form.querySelector('.hw-sr-only[role=status]')!.textContent).toBe('النتائج: 0'); expect(new FormData(form).getAll('services')).toEqual(['a']);
  fixture.componentInstance.choices.disable(); fixture.detectChanges(); expect(form.checkValidity()).toBe(true); expect(search.validity.customError).toBe(false); expect(new FormData(form).getAll('services')).toEqual([]);
  fixture.componentInstance.choices.reset(); fixture.componentInstance.choices.enable(); fixture.detectChanges(); expect(form.checkValidity()).toBe(false); expect(search.value).toBe(''); subscription.unsubscribe();
});
