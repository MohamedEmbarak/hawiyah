import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HwTagInputComponent } from '../packages/angular/dist/fesm2022/hawiyah-angular.mjs';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createApp, h, nextTick } from 'vue';
import { afterEach, beforeAll, expect, it } from 'vitest';
import { TagInput as ReactTags } from '../packages/react/src/expanded-controls.js';
import { TagInput as VueTags } from '../packages/vue/src/controls.js';
import { createTagInput } from '../packages/vanilla/src/controls.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const disposers: (() => void | Promise<void>)[] = [];
beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(async () => { for (const dispose of disposers.splice(0)) await dispose(); TestBed.resetTestingModule(); document.body.replaceChildren(); });

async function mount(adapter: string) {
  const host = document.createElement('div'); document.body.append(host);
  let run = async (action: () => void) => { action(); await Promise.resolve(); };
  let reset: () => void;
  if (adapter === 'react') {
    const root = createRoot(host); run = async action => { await act(action); };
    await run(() => root.render(createElement('form', {}, createElement('fieldset', {}, createElement(ReactTags, { label: 'الوسوم', name: 'tags', required: true, defaultValue: ['هوية'] })))));
    disposers.push(async () => { await act(() => root.unmount()); });
  } else if (adapter === 'vue') {
    const app = createApp({ render: () => h('form', [h('fieldset', [h(VueTags, { label: 'الوسوم', name: 'tags', required: true, defaultValue: ['هوية'] })])]) });
    app.mount(host); run = async action => { action(); await nextTick(); await nextTick(); }; disposers.push(() => app.unmount());
  } else if (adapter === 'angular') {
    class Host { tags = new FormControl(['هوية'], { nonNullable: true }); }
    Component({ standalone: true, imports: [ReactiveFormsModule, HwTagInputComponent], template: '<form><fieldset><hw-tag-input label="الوسوم" name="tags" required [formControl]="tags" /></fieldset></form>' })(Host);
    const fixture = TestBed.createComponent(Host); host.append(fixture.nativeElement); fixture.detectChanges();
    run = async action => { action(); fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges(); };
    reset = () => fixture.componentInstance.tags.reset(); disposers.push(() => fixture.destroy());
  } else {
    host.innerHTML = '<form><fieldset><div class="hw-tag-input" data-hw-value=\'["هوية"]\' data-hw-name="tags"><label>الوسوم<input type="text" required data-hw-tag-input></label><div data-hw-tags></div></div></fieldset></form>';
    const controller = createTagInput(host.querySelector('.hw-tag-input')!); disposers.push(() => controller.destroy());
  }
  const form = host.querySelector('form')!; const input = host.querySelector<HTMLInputElement>('.hw-tag-input input:not([type=hidden])')!;
  return { host, input, form, run, reset: () => reset ? reset() : form.reset(), values: () => new FormData(form).getAll('tags') };
}

for (const adapter of ['vanilla', 'react', 'vue', 'angular']) it(`${adapter}: tag editing preserves composition, shortcuts, focus and reset`, async () => {
  const { host, input, form, run, reset, values } = await mount(adapter);
  const edit = (value: string) => run(() => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })); });
  const key = async (key: string, extra: KeyboardEventInit = {}) => { const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...extra }); await run(() => input.dispatchEvent(event)); return event; };
  await edit('بحث'); await run(() => input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true })));
  expect((await key('Enter')).defaultPrevented).toBe(false); expect(values()).toEqual(['هوية']);
  await run(() => input.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true })));
  for (const modifier of ['ctrlKey', 'altKey', 'metaKey']) { expect((await key('Enter', { [modifier]: true })).defaultPrevented).toBe(false); expect(values()).toEqual(['هوية']); }
  expect((await key('Enter')).defaultPrevented).toBe(true); expect(values()).toEqual(['هوية', 'بحث']); expect(input.value).toBe('');
  expect((await key('Enter')).defaultPrevented).toBe(false);
  await key('Backspace', { ctrlKey: true }); expect(values()).toHaveLength(2);
  expect((await key('Backspace')).defaultPrevented).toBe(true); expect(values()).toEqual(['هوية']);
  const remove = host.querySelector<HTMLButtonElement>('.hw-chip button')!;
  await run(() => { remove.focus(); remove.click(); }); expect(document.activeElement).toBe(input); expect(form.checkValidity()).toBe(false);
  await edit('uncommitted'); await run(reset); expect(values()).toEqual(['هوية']); expect(input.value).toBe(''); expect(form.checkValidity()).toBe(true);
  await edit('blocked'); host.querySelector('fieldset')!.disabled = true;
  expect((await key('Enter')).defaultPrevented).toBe(false);
  host.querySelector('fieldset')!.disabled = false; expect(values()).toEqual(['هوية']);
});
