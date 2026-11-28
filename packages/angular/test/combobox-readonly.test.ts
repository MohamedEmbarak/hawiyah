import '@angular/compiler';
import { supplyText } from './fixtures/texts';
import { text } from './fixtures/application-text';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { HwComboboxComponent } from '@hawiyah/angular';
beforeAll(()=>TestBed.initTestEnvironment(BrowserTestingModule,platformBrowserTesting()));
afterEach(()=>{TestBed.resetTestingModule();document.body.replaceChildren();});
const options=[{value:'riyadh',label:'Riyadh'},{value:'jeddah',label:'Jeddah'}];
it('keeps readonly selection focusable/submittable, closes popup and guards all edit paths',async()=>{
  const fixture=TestBed.createComponent(HwComboboxComponent); supplyText(fixture, text.combobox);const form=document.createElement('form');const fieldset=document.createElement('fieldset');document.body.append(form);form.append(fieldset);fieldset.append(fixture.nativeElement);
  fixture.componentRef.setInput('label','City');fixture.componentRef.setInput('name','city');fixture.componentRef.setInput('options',options);fixture.componentRef.setInput('value','riyadh');fixture.detectChanges();const component=fixture.componentInstance;const changed=vi.fn();component.registerOnChange(changed);const input=fieldset.querySelector<HTMLInputElement>('[role=combobox]')!;
  input.focus();fixture.detectChanges();expect(component.state.open).toBe(true);fixture.componentRef.setInput('readOnly',true);fixture.detectChanges();expect(input.readOnly).toBe(true);expect(input.getAttribute('aria-readonly')).toBe('true');expect(component.state.open).toBe(false);
  input.value='invalid';input.dispatchEvent(new Event('input',{bubbles:true}));component.select(options[1]!);component.keydown(new KeyboardEvent('keydown',{key:'ArrowDown'}));fixture.detectChanges();expect(input.value).toBe('Riyadh');expect(component.state.value).toBe('riyadh');expect(changed).not.toHaveBeenCalled();expect(new FormData(form).get('city')).toBe('riyadh');expect(document.activeElement).toBe(input);
  component.writeValue('');fixture.detectChanges();expect(component.state.value).toBe('');component.writeValue('riyadh');fixture.componentRef.setInput('readOnly',false);fixture.detectChanges();expect(component.state.open).toBe(false);input.click();fixture.detectChanges();fieldset.disabled=true;await Promise.resolve();fixture.detectChanges();expect(component.state.open).toBe(false);component.select(options[1]!);expect(component.state.value).toBe('riyadh');expect(new FormData(form).has('city')).toBe(false);
});
it('preserves the first-legend disabled-fieldset exception',()=>{
  const fixture=TestBed.createComponent(HwComboboxComponent); supplyText(fixture, text.combobox);const fieldset=document.createElement('fieldset');fieldset.disabled=true;const legend=document.createElement('legend');fieldset.append(legend);legend.append(fixture.nativeElement);document.body.append(fieldset);fixture.componentRef.setInput('options',options);fixture.detectChanges();fixture.componentInstance.select(options[0]!);fixture.detectChanges();expect(fixture.componentInstance.state.value).toBe('riyadh');
});
