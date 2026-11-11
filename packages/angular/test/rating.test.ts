import '@angular/compiler';
import './fixtures/texts';
import { text, withText } from './fixtures/application-text';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { afterEach, beforeAll, expect, it } from 'vitest';
import { HwRatingComponent } from '@hawiyah/angular';
beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => TestBed.resetTestingModule());
function mount(readOnly = false) {
  class Host { rating = new FormControl(3, { nonNullable: true }); readOnly = readOnly; }
  Component({ standalone: true, imports: [ReactiveFormsModule, HwRatingComponent], template: `<form><hw-rating ${withText.rating} label="التقييم" name="rating" [formControl]="rating" [readOnly]="readOnly" /></form>` })(Host); Object.assign(Host.prototype, { text });
  const fixture = TestBed.createComponent(Host); fixture.detectChanges(); return fixture;
}
it('uses one native radio value and reflects reactive form reset and disabling', async () => {
  const fixture = mount(); const inputs = [...fixture.nativeElement.querySelectorAll('input')] as HTMLInputElement[];
  inputs[4]!.click(); fixture.detectChanges(); expect(fixture.componentInstance.rating.value).toBe(5);
  expect(new FormData(fixture.nativeElement.querySelector('form')).getAll('rating')).toEqual(['5']);
  fixture.componentInstance.rating.reset(); fixture.detectChanges();
  expect(new FormData(fixture.nativeElement.querySelector('form')).getAll('rating')).toEqual(['3']);
  fixture.componentInstance.rating.disable(); fixture.detectChanges();
  expect(new FormData(fixture.nativeElement.querySelector('form')).getAll('rating')).toEqual([]);
});
it('preserves readonly focus and submitted value while rejecting selection keys', () => {
  const fixture = mount(true); const inputs = [...fixture.nativeElement.querySelectorAll('input[type=radio]')] as HTMLInputElement[];
  inputs[2]!.focus(); expect(document.activeElement).toBe(inputs[2]);
  inputs[4]!.click(); fixture.detectChanges();
  for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ']) {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }); inputs[2]!.dispatchEvent(event); expect(event.defaultPrevented).toBe(true);
  }
  const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }); inputs[2]!.dispatchEvent(tab); expect(tab.defaultPrevented).toBe(false);
  expect(new FormData(fixture.nativeElement.querySelector('form')).getAll('rating')).toEqual(['3']);
  expect(fixture.componentInstance.rating.value).toBe(3);
});
