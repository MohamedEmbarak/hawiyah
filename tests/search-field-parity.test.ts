import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HwSearchFieldComponent } from '../packages/angular/dist/fesm2022/hawiyah-angular.mjs';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createApp, h, nextTick } from 'vue';
import { afterEach, beforeAll, expect, it } from 'vitest';
import { SearchField as ReactSearch } from '../packages/react/src/expanded-controls.js';
import { TextField } from '../packages/react/src/forms.js';
import { SearchField as VueSearch } from '../packages/vue/src/controls.js';
import { createSearchField } from '../packages/vanilla/src/search-field.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const disposers: (() => void | Promise<void>)[] = [];
beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(async () => { for (const dispose of disposers.splice(0)) await dispose(); TestBed.resetTestingModule(); document.body.replaceChildren(); });

async function mount(adapter: string, readonly = false) {
  const host = document.createElement('div'); document.body.append(host);
  const changes: string[] = []; const searches: string[] = [];
  let run = async (action: () => void) => { action(); await Promise.resolve(); };
  let reset: (() => void) | undefined;
  if (adapter === 'react') {
    const root = createRoot(host); run = async action => { await act(action); };
    await run(() => root.render(createElement('form', {}, createElement('fieldset', {}, createElement(ReactSearch, { label: 'بحث', name: 'query', required: true, readOnly: readonly, clearLabel: 'مسح البحث', defaultValue: 'هوية', onValueChange: value => changes.push(value) })))));
    disposers.push(async () => { await act(() => root.unmount()); });
  } else if (adapter === 'vue') {
    const app = createApp({ render: () => h('form', [h('fieldset', [h(VueSearch, { label: 'بحث', name: 'query', required: true, readonly, clearLabel: 'مسح البحث', defaultValue: 'هوية', 'onUpdate:modelValue': (value: string) => changes.push(value), onSearch: (value: string) => searches.push(value) })])]) });
    app.mount(host); run = async action => { action(); await nextTick(); await nextTick(); }; disposers.push(() => app.unmount());
  } else if (adapter === 'angular') {
    class Host { query = new FormControl('هوية', { nonNullable: true }); readonly = readonly; changed(value: string) { changes.push(value); } search(value: string) { searches.push(value); } }
    Component({ standalone: true, imports: [ReactiveFormsModule, HwSearchFieldComponent], template: '<form><fieldset><hw-search-field label="بحث" name="query" clearLabel="مسح البحث" required [readOnly]="readonly" [formControl]="query" (valueChange)="changed($event)" (searched)="search($event)" /></fieldset></form>' })(Host);
    const fixture = TestBed.createComponent(Host); host.append(fixture.nativeElement); fixture.detectChanges();
    run = async action => { action(); fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges(); };
    reset = () => fixture.componentInstance.query.reset(); disposers.push(() => fixture.destroy());
  } else {
    host.innerHTML = '<form><fieldset><div class="hw-search-control"><label for="query">بحث</label><input id="query" name="query" type="search" value="هوية" required data-hw-search-input><button hidden data-hw-search-clear aria-label="مسح البحث">Clear</button></div></fieldset></form>';
    host.querySelector('input')!.readOnly = readonly;
    const controller = createSearchField(host.querySelector('.hw-search-control')!, { onValueChange: value => changes.push(value) }); disposers.push(() => controller.destroy());
  }
  const form = host.querySelector('form')!; const input = host.querySelector<HTMLInputElement>('input[type=search]')!;
  const button = host.querySelector<HTMLButtonElement>('.hw-search-clear')!;
  return { host, input, button, form, run, searches, changes, reset: () => reset ? reset() : form.reset() };
}

for (const adapter of ['vanilla', 'react', 'vue', 'angular']) {
  it(`${adapter}: clear preserves focus, validation, form value and reset`, async () => {
    const { host, input, button, form, run, reset, changes } = await mount(adapter);
    let submits = 0; form.addEventListener('submit', event => { event.preventDefault(); submits++; });
    expect(button.hidden).toBe(false); expect(button.getAttribute('aria-label')).toBe('مسح البحث');
    expect(input.dataset.hwFilled).toBe('true');
    expect(button.getAttribute('aria-controls')).toBe(input.id);
    host.querySelector('fieldset')!.disabled = true;
    await run(() => button.click()); expect(input.value).toBe('هوية');
    host.querySelector('fieldset')!.disabled = false;
    await run(() => { button.focus(); button.click(); });
    expect(input.value).toBe(''); expect(document.activeElement).toBe(input);
    expect(input.dataset.hwFilled).toBe('false');
    expect(button.hidden).toBe(true); expect(new FormData(form).get('query')).toBe('');
    expect(form.checkValidity()).toBe(false); expect(submits).toBe(0); expect(changes).toEqual(['']);
    await run(reset); expect(input.value).toBe('هوية'); expect(button.hidden).toBe(false); expect(form.checkValidity()).toBe(true);
    expect(input.dataset.hwFilled).toBe('true');
  });
  it(`${adapter}: read-only search cannot be cleared`, async () => {
    const { input, button, form, run, changes } = await mount(adapter, true);
    expect(button.hidden).toBe(true); await run(() => button.click());
    expect(input.value).toBe('هوية'); expect(new FormData(form).get('query')).toBe('هوية'); expect(changes).toEqual([]);
  });
}

for (const adapter of ['vue', 'angular']) it(`${adapter}: search callbacks ignore composition and modified Enter`, async () => {
  const { input, run, searches } = await mount(adapter);
  const key = (options: KeyboardEventInit = {}) => run(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true, ...options })));
  await run(() => input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true })));
  await key(); expect(searches).toEqual([]);
  await run(() => input.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true })));
  await key({ isComposing: true }); await key({ ctrlKey: true }); await key({ metaKey: true }); await key({ altKey: true }); expect(searches).toEqual([]);
  await key(); expect(searches).toEqual(['هوية']);
});

it('vanilla restores owned markup on destroy and does not erase an edited query', () => {
  const root = document.createElement('div'); root.innerHTML = '<input data-hw-search-input type="search" value="before"><button hidden data-hw-search-clear>Clear</button>';
  const originalButton = root.querySelector('button')!.cloneNode(true);
  const controller = createSearchField(root); controller.setValue('after'); controller.destroy(); controller.destroy();
  expect(root.querySelector('button')!.isEqualNode(originalButton)).toBe(true);
  expect(root.querySelector('input')!.id).toBe(''); expect(root.querySelector('input')!.value).toBe('after');
});

it('React preserves callback-ref cleanup and external controlled value changes', async () => {
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
  let cleanups = 0; const ref = () => () => { cleanups++; };
  await act(() => root.render(createElement(TextField, { value: 'ready', readOnly: true, ref })));
  const input = host.querySelector('input')!; expect(input.dataset.hwFilled).toBe('true');
  await act(() => root.render(createElement(TextField, { value: '', readOnly: true, ref })));
  expect(input.dataset.hwFilled).toBe('false');
  await act(() => root.unmount()); expect(cleanups).toBe(1); expect(input.hasAttribute('data-hw-filled')).toBe(false);
});
