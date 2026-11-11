import '@angular/compiler';
import { supplyText } from './fixtures/texts';
import { text } from './fixtures/application-text';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { HwSliderComponent, HwRangeSliderComponent } from '@hawiyah/angular';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); });
it('keeps a readonly slider focusable, named and immutable without swallowing Escape', () => {
  const fixture = TestBed.createComponent(HwSliderComponent);
  fixture.componentRef.setInput('name', 'amount'); fixture.componentRef.setInput('value', 35); fixture.componentRef.setInput('readOnly', true); fixture.detectChanges();
  const form = document.createElement('form'); form.append(fixture.nativeElement); document.body.append(form);
  const input = form.querySelector('input')!; const changed = vi.fn(); fixture.componentInstance.valueChange.subscribe(changed);
  expect(input.classList.contains('hw-slider')).toBe(true); expect(form.querySelector('.hw-field')!.classList.contains('hw-slider')).toBe(false);
  input.focus(); expect(document.activeElement).toBe(input); expect(input.disabled).toBe(false); expect(input.getAttribute('aria-readonly')).toBe('true');
  const pointer = new Event('pointerdown', { bubbles: true, cancelable: true }); input.dispatchEvent(pointer); expect(pointer.defaultPrevented).toBe(true);
  for (const [key, prevented] of [['ArrowRight', true], ['Home', true], ['Tab', false], ['Escape', false], ['a', false]] as const) { const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }); input.dispatchEvent(event); expect(event.defaultPrevented).toBe(prevented); }
  input.value = '70'; input.dispatchEvent(new Event('input', { bubbles: true })); fixture.detectChanges();
  expect(input.value).toBe('35'); expect(changed).not.toHaveBeenCalled(); expect([...new FormData(form).entries()]).toEqual([['amount', '35']]);
  fixture.componentRef.setInput('readOnly', false); fixture.detectChanges(); input.value = '50'; input.dispatchEvent(new Event('input', { bubbles: true })); fixture.detectChanges(); expect(changed).toHaveBeenCalledExactlyOnceWith(50);
  const disabled = document.createElement('fieldset'); disabled.disabled = true; form.append(disabled); disabled.append(fixture.nativeElement);
  input.value = '80'; input.dispatchEvent(new Event('input', { bubbles: true })); expect(input.value).toBe('50'); expect(changed).toHaveBeenCalledOnce(); expect([...new FormData(form).entries()]).toEqual([]);
});
it('keeps both readonly range endpoints focusable and submits each native value once', () => {
  const fixture = TestBed.createComponent(HwRangeSliderComponent); supplyText(fixture, text.rangeSlider);
  fixture.componentRef.setInput('value', [20, 80]); fixture.componentRef.setInput('lowerName', 'lower'); fixture.componentRef.setInput('upperName', 'upper'); fixture.componentRef.setInput('readOnly', true); fixture.detectChanges();
  const form = document.createElement('form'); form.append(fixture.nativeElement); document.body.append(form);
  const changed = vi.fn(); fixture.componentInstance.valueChange.subscribe(changed);
  const inputs = [...form.querySelectorAll<HTMLInputElement>('input[type="range"]')];
  inputs.forEach((input, index) => { input.focus(); expect(document.activeElement).toBe(input); expect(input.disabled).toBe(false); expect(input.getAttribute('aria-readonly')).toBe('true'); input.value = '60'; input.dispatchEvent(new Event('input', { bubbles: true })); expect(input.value).toBe(index === 0 ? '20' : '80'); });
  expect(changed).not.toHaveBeenCalled(); expect([...new FormData(form).entries()]).toEqual([['lower', '20'], ['upper', '80']]); expect(form.querySelector('input[type="hidden"]')).toBeNull();
  fixture.componentRef.setInput('disabled', true); fixture.detectChanges(); expect([...new FormData(form).entries()]).toEqual([]);
});
