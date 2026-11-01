import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { FormsModule } from '@angular/forms';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { NqCheckboxComponent, NqComboboxComponent, NqSelectComponent, NqTabComponent, NqTabsComponent, NqTextareaComponent, NqTextFieldComponent } from '@nasaq/angular';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => TestBed.resetTestingModule());

function host<T extends object>(type: new () => T, template: string) {
  Component({standalone: true, imports: [FormsModule, NqCheckboxComponent, NqComboboxComponent, NqSelectComponent, NqTabComponent, NqTabsComponent, NqTextareaComponent, NqTextFieldComponent], template})(type);
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return fixture;
}
function key(element: Element, key: string) { element.dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true, cancelable: true})); }

describe('Angular native component behavior', () => {
  for (const component of [NqTextFieldComponent, NqTextareaComponent, NqSelectComponent]) {
    it(`forwards changing size and visualVariant inputs in ${component.name}`, () => {
      const fixture = TestBed.createComponent<{size:string; visualVariant:string}>(component);
      fixture.componentRef.setInput('label', 'الخدمة');
      fixture.componentRef.setInput('size', 'sm'); fixture.componentRef.setInput('visualVariant', 'filled');
      fixture.detectChanges();
      const control = fixture.nativeElement.querySelector('input, textarea, select') as HTMLElement;
      expect(control.dataset.size).toBe('sm'); expect(control.dataset.variant).toBe('filled');
      expect(fixture.nativeElement.querySelector(`label[for="${control.id}"]`)).not.toBeNull();
      fixture.componentRef.setInput('size', 'lg'); fixture.componentRef.setInput('visualVariant', 'outline');
      fixture.detectChanges();
      expect(control.dataset.size).toBe('lg'); expect(control.dataset.variant).toBe('outline');
    });
  }
  it('propagates model writes, native input changes and disabled state through Angular forms', async () => {
    class Host { name = 'Maha'; disabled = false; }
    const fixture = host(Host, `<nq-text-field label="Name" controlId="name" name="name" [(ngModel)]="name" [disabled]="disabled" />`);
    await fixture.whenStable(); fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('Maha');
    expect(fixture.nativeElement.querySelector('label').htmlFor).toBe(input.id);
    input.value = 'Noura'; input.dispatchEvent(new Event('input', {bubbles: true}));
    expect(fixture.componentInstance.name).toBe('Noura');
    fixture.componentInstance.disabled = true; fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    expect(input.disabled).toBe(true);
  });

  it('uses explicit combobox selection, skips disabled options, and does not select on blur', async () => {
    class Host { city = ''; options = [{value: 'riyadh', label: 'الرياض'}, {value: 'disabled', label: 'Unavailable', disabled: true}, {value:'jeddah', label:'جدة'}]; }
    const fixture = host(Host, `<nq-combobox label="City" controlId="city" [(value)]="city" [options]="options" />`);
    const input = fixture.nativeElement.querySelector('[role="combobox"]') as HTMLInputElement;
    input.focus(); key(input, 'ArrowDown'); fixture.detectChanges();
    expect(input.getAttribute('aria-activedescendant')).toBe('city-option-0');
    key(input, 'ArrowDown'); fixture.detectChanges();
    expect(input.getAttribute('aria-activedescendant')).toBe('city-option-2');
    key(input, 'Enter'); fixture.detectChanges();
    expect(fixture.componentInstance.city).toBe('jeddah');
    expect(input.value).toBe('جدة');
    input.value = 'الرِّياض'; input.dispatchEvent(new Event('input', {bubbles:true})); fixture.detectChanges();
    expect(fixture.componentInstance.city).toBe('');
    expect(fixture.nativeElement.querySelectorAll('[role="option"]').length).toBe(1);
    input.dispatchEvent(new Event('blur')); fixture.detectChanges();
    expect(fixture.componentInstance.city).toBe('');
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('resets the combobox through ngForm without a stale committed value', async () => {
    class Host { city = 'riyadh'; options = [{value:'riyadh', label:'Riyadh'}]; }
    const fixture = host(Host, `<form #form="ngForm"><nq-combobox label="City" name="city" [(ngModel)]="city" [options]="options" /><button type="button" (click)="form.resetForm()">Reset</button></form>`);
    await fixture.whenStable(); fixture.detectChanges();
    expect((fixture.nativeElement.querySelector('[role="combobox"]') as HTMLInputElement).value).toBe('Riyadh');
    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable(); fixture.detectChanges();
    expect((fixture.nativeElement.querySelector('[role="combobox"]') as HTMLInputElement).value).toBe('');
    expect((fixture.nativeElement.querySelector('input[type="hidden"]') as HTMLInputElement).value).toBe('');
  });

  it('preserves editing shortcuts and IME, closes outside, and validates required selection', () => {
    class Host { city = 'riyadh'; options = [{value:'riyadh', label:'Riyadh'}]; }
    const fixture = host(Host, `<nq-combobox label="City" controlId="required-city" [(value)]="city" [options]="options" required />`);
    const input = fixture.nativeElement.querySelector('[role="combobox"]') as HTMLInputElement;
    const home = new KeyboardEvent('keydown', {key:'Home', bubbles:true, cancelable:true});
    input.dispatchEvent(home); expect(home.defaultPrevented).toBe(false);
    input.dispatchEvent(new Event('compositionstart'));
    input.value = '未'; input.dispatchEvent(new InputEvent('input', {bubbles:true, isComposing:true}));
    expect(fixture.componentInstance.city).toBe('riyadh');
    input.dispatchEvent(new Event('compositionend')); fixture.detectChanges();
    expect(fixture.componentInstance.city).toBe(''); expect(input.checkValidity()).toBe(false);
    const shortcut = new KeyboardEvent('keydown', {key:'ArrowDown', ctrlKey:true, bubbles:true, cancelable:true});
    input.dispatchEvent(shortcut); expect(shortcut.defaultPrevented).toBe(false);
    document.body.dispatchEvent(new Event('pointerdown', {bubbles:true})); fixture.detectChanges();
    expect(input.getAttribute('aria-expanded')).toBe('false');
    input.value = 'Riyadh'; input.dispatchEvent(new Event('input', {bubbles:true})); key(input, 'ArrowDown'); key(input, 'Enter'); fixture.detectChanges();
    expect(input.checkValidity()).toBe(true); expect(fixture.componentInstance.city).toBe('riyadh');
  });

  it('navigates RTL tabs with disabled skipping and manual activation', () => {
    class Host { tab = 'one'; }
    const fixture = host(Host, `<nq-tabs label="Sections" direction="rtl" activationMode="manual" [(value)]="tab"><nq-tab value="one" label="One">First</nq-tab><nq-tab value="two" label="Two" [disabled]="true">Second</nq-tab><nq-tab value="three" label="Three">Third</nq-tab></nq-tabs>`);
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]') as NodeListOf<HTMLButtonElement>;
    tabs[0]!.focus(); key(tabs[0]!, 'ArrowLeft'); fixture.detectChanges();
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(tabs[2]);
    expect(fixture.componentInstance.tab).toBe('one');
    tabs[2]!.click(); fixture.detectChanges();
    expect(fixture.componentInstance.tab).toBe('three');
    expect(fixture.nativeElement.querySelectorAll('[role="tabpanel"]')[0].hidden).toBe(true);
  });
});
