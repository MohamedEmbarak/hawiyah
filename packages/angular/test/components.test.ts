import '@angular/compiler';
import './fixtures/texts';
import { text, withText } from './fixtures/application-text';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { FormsModule } from '@angular/forms';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { HwCheckboxComponent, HwComboboxComponent, HwSelectComponent, HwTabComponent, HwTabsComponent, HwTextareaComponent, HwTextFieldComponent } from '@hawiyah/angular';
import * as hawiyah from '@hawiyah/angular';
import { attributesOf, page } from './fixtures/page';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => TestBed.resetTestingModule());

function host<T extends object>(type: new () => T, template: string) {
  Component({standalone: true, imports: [FormsModule, HwCheckboxComponent, HwComboboxComponent, HwSelectComponent, HwTabComponent, HwTabsComponent, HwTextareaComponent, HwTextFieldComponent], template})(type); Object.assign(type.prototype, { text });
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return fixture;
}
function key(element: Element, key: string) { element.dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true, cancelable: true})); }

describe('Angular native component behavior', () => {
  for (const component of [HwTextFieldComponent, HwTextareaComponent, HwSelectComponent]) {
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
    const fixture = host(Host, `<hw-text-field label="Name" controlId="name" name="name" [(ngModel)]="name" [disabled]="disabled" />`);
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
    const fixture = host(Host, `<hw-combobox ${withText.combobox} label="City" controlId="city" [(value)]="city" [options]="options" />`);
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
    const fixture = host(Host, `<form #form="ngForm"><hw-combobox ${withText.combobox} label="City" name="city" [(ngModel)]="city" [options]="options" /><button type="button" (click)="form.resetForm()">Reset</button></form>`);
    await fixture.whenStable(); fixture.detectChanges();
    expect((fixture.nativeElement.querySelector('[role="combobox"]') as HTMLInputElement).value).toBe('Riyadh');
    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable(); fixture.detectChanges();
    expect((fixture.nativeElement.querySelector('[role="combobox"]') as HTMLInputElement).value).toBe('');
    expect((fixture.nativeElement.querySelector('input[type="hidden"]') as HTMLInputElement).value).toBe('');
  });

  it('preserves editing shortcuts and IME, closes outside, and validates required selection', () => {
    class Host { city = 'riyadh'; options = [{value:'riyadh', label:'Riyadh'}]; }
    const fixture = host(Host, `<hw-combobox ${withText.combobox} label="City" controlId="required-city" [(value)]="city" [options]="options" required />`);
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
    const fixture = host(Host, `<hw-tabs ${withText.tabs} label="Sections" direction="rtl" activationMode="manual" [(value)]="tab"><hw-tab value="one" label="One">First</hw-tab><hw-tab value="two" label="Two" [disabled]="true">Second</hw-tab><hw-tab value="three" label="Three">Third</hw-tab></hw-tabs>`);
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]') as NodeListOf<HTMLButtonElement>;
    tabs[0]!.focus(); key(tabs[0]!, 'ArrowLeft'); fixture.detectChanges();
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(tabs[2]);
    expect(fixture.componentInstance.tab).toBe('one');
    tabs[2]!.click(); fixture.detectChanges();
    expect(fixture.componentInstance.tab).toBe('three');
    expect(fixture.nativeElement.querySelectorAll('[role="tabpanel"]')[0].hidden).toBe(true);
  });

  it('[RADIO-GROUP-01][choices-5] hw-radio-group renders the documented fieldset and submits the chosen value; the package exports no HwRadioComponent', () => {
    expect((hawiyah as Record<string, unknown>)['HwRadioComponent']).toBeUndefined(); expect(typeof hawiyah.HwRadioGroupComponent).toBe('function');
    class Host { branch = 'jeddah'; cities = [{ value: 'riyadh', label: 'Riyadh' }, { value: 'jeddah', label: 'Jeddah' }]; }
    Component({standalone: true, imports: [hawiyah.HwRadioGroupComponent], template: `<form><hw-radio-group controlId="branch" label="Branch" name="branch" hint="Hint" error="Error" required [options]="cities" [(value)]="branch" /></form>`})(Host);
    const fixture = TestBed.createComponent(Host); fixture.detectChanges();
    const form: HTMLFormElement = fixture.nativeElement.querySelector('form'), fieldset = form.querySelector('hw-radio-group > fieldset.hw-field')!;
    expect([...fieldset.children].map(child => `${child.localName}.${child.className}`)).toEqual(['legend.hw-label', 'label.hw-choice', 'label.hw-choice', 'p.hw-hint', 'p.hw-error']);
    expect(fieldset.querySelector('legend')!.textContent).toBe('Branch *'); expect(fieldset.getAttribute('aria-describedby')).toBe('branch-hint branch-error'); expect(fieldset.getAttribute('aria-invalid')).toBe('true');
    const radios = [...fieldset.querySelectorAll<HTMLInputElement>('label.hw-choice > input.hw-radio[type=radio]')];
    expect(radios.map(radio => [radio.id, radio.name, radio.required, radio.checked])).toEqual([['branch-0', 'branch', true, false], ['branch-1', 'branch', true, true]]);
    expect(fieldset.querySelector('label.hw-choice span')).toBeNull(); expect(new FormData(form).get('branch')).toBe('jeddah');
    radios[0]!.click(); fixture.detectChanges(); expect(fixture.componentInstance.branch).toBe('riyadh'); expect(new FormData(form).get('branch')).toBe('riyadh');
    expect(form.querySelector('hw-radio')).toBeNull();
  });

  it('[FILEUPLOAD-01][FILEUPLOAD-02][files-10] hw-file-upload projects its content after the input, and capture and form reach the input; no accept attribute without accept', () => {
    class Host {}
    Component({standalone: true, imports: [hawiyah.HwFileUploadComponent], template: `<form id="outer"></form><hw-file-upload label="Documents" name="documents" capture="environment" form="outer" hint="Hint" required aria-describedby="note"><p class="mine">Projected</p></hw-file-upload><hw-file-upload accept=".pdf" /><p id="note">Note</p>`})(Host);
    const fixture = TestBed.createComponent(Host); fixture.detectChanges();
    const [upload, plain] = [...fixture.nativeElement.querySelectorAll('hw-file-upload')] as HTMLElement[];
    expect([...upload!.querySelector('div.hw-field.hw-upload')!.children].map(child => `${child.localName}.${child.className}`)).toEqual(['label.hw-label', 'input.hw-input', 'p.mine', 'p.hw-hint']);
    const input = upload!.querySelector('input')!;
    expect(input.getAttribute('capture')).toBe('environment'); expect(input.getAttribute('form')).toBe('outer'); expect(input.hasAttribute('accept')).toBe(false); expect(input.required).toBe(true);
    expect(input.getAttribute('aria-describedby')).toBe(`note ${input.id}-hint`); expect(upload!.hasAttribute('aria-describedby')).toBe(false); expect(upload!.querySelector('label')!.textContent).toBe('Documents *');
    const bare = plain!.querySelector('input')!; expect(bare.getAttribute('accept')).toBe('.pdf'); expect(bare.hasAttribute('capture')).toBe(false); expect(bare.hasAttribute('form')).toBe(false);
  });
});

describe('Angular button and link directives', () => {
  afterEach(() => document.body.replaceChildren());

  it('[BUTTON-03][actions-6] disabled written statically or bound disables the button; an authored aria-busy stays while loading is false', () => {
    const { root, update } = page(`<button hwButton id="static" disabled>Static</button><button hwButton id="bound" [disabled]="disabled">Bound</button><button hwButton id="busy" aria-busy="true" [loading]="loading">Busy</button><button hwButton id="own" [attr.aria-busy]="busy" [loading]="loading">Own</button>`, { disabled: true, loading: false, busy: 'true' });
    const button = (id: string) => root.querySelector<HTMLButtonElement>(`#${id}`)!;
    expect(button('static').disabled).toBe(true); expect(button('bound').disabled).toBe(true); expect(button('static').hasAttribute('aria-busy')).toBe(false);
    update({ disabled: false }); expect(button('bound').hasAttribute('disabled')).toBe(false);
    for (const id of ['busy', 'own']) { expect(button(id).getAttribute('aria-busy'), id).toBe('true'); expect(button(id).disabled, id).toBe(false); }
    update({ loading: true }); for (const id of ['busy', 'own']) { expect(button(id).getAttribute('aria-busy'), id).toBe('true'); expect(button(id).disabled, id).toBe(true); }
    update({ loading: false, busy: 'false' }); expect(button('busy').getAttribute('aria-busy')).toBe('true'); expect(button('own').getAttribute('aria-busy')).toBe('false'); expect(button('busy').disabled).toBe(false);
  });

  it('[BUTTON-04] a[hwButton]: no type and no disabled attribute; loading writes aria-busy only', () => {
    const { root, update } = page(`<a hwButton id="link" href="/next" variant="secondary" [loading]="loading" [disabled]="true">Next</a><a hwButton id="typed" href="/file.pdf" type="application/pdf">File</a>`, { loading: false });
    const link = root.querySelector('#link')!;
    expect(attributesOf(link)).toEqual({ class: 'hw-button', 'data-size': 'md', 'data-variant': 'secondary', href: '/next', hwbutton: '', id: 'link', variant: 'secondary' });
    update({ loading: true }); expect(link.getAttribute('aria-busy')).toBe('true'); expect(link.hasAttribute('disabled')).toBe(false); expect(link.hasAttribute('type')).toBe(false);
    update({ loading: false }); expect(link.hasAttribute('aria-busy')).toBe(false);
    expect(root.querySelector('#typed')!.getAttribute('type')).toBe('application/pdf');
  });

  it('[LINK-04][actions-7] an application aria-current, rel, target, role and tabindex survive while current, external and disabled are false', () => {
    const { root, update } = page(`<a hwLink id="step" href="/step" aria-current="step" rel="author" target="help" role="tab" tabindex="0" [current]="current" [external]="external" [disabled]="disabled">Step</a><a hwLink id="bound" href="/step" [attr.aria-current]="own" [current]="current">Bound</a>`, { current: false, external: false, disabled: false, own: 'location' });
    const link = root.querySelector('#step')!, bound = root.querySelector('#bound')!;
    const authored = { 'aria-current': 'step', rel: 'author', target: 'help', role: 'tab', tabindex: '0' };
    const read = () => Object.fromEntries(Object.keys(authored).map(name => [name, link.getAttribute(name)]));
    expect(read()).toEqual(authored); expect(bound.getAttribute('aria-current')).toBe('location');
    update({ current: true, external: true, disabled: true });
    expect(read()).toEqual({ 'aria-current': 'page', rel: 'author noopener noreferrer', target: '_blank', role: 'link', tabindex: '-1' }); expect(bound.getAttribute('aria-current')).toBe('page'); expect(link.hasAttribute('href')).toBe(false);
    update({ current: false, external: false, disabled: false });
    expect(read()).toEqual(authored); expect(bound.getAttribute('aria-current')).toBe('location'); expect(link.getAttribute('href')).toBe('/step'); expect(link.hasAttribute('aria-disabled')).toBe(false);
  });
});
