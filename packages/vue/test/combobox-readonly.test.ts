import { createApp, h, nextTick, ref, type App } from 'vue';
import { afterEach, expect, it, vi } from 'vitest';
import { Combobox } from '../src/interactive.js';
import { comboboxText } from './texts.js';
const apps: App[]=[];afterEach(()=>{apps.splice(0).forEach(app=>app.unmount());document.body.replaceChildren();});
const options=[{value:'riyadh',label:'Riyadh'},{value:'jeddah',label:'Jeddah'}];
it('closes on readonly changes, suppresses query/value events and keeps submitted selection',async()=>{
  const container=document.createElement('div');document.body.append(container);const readonly=ref(false);const queried=vi.fn(),changed=vi.fn();const app=createApp({render:()=>h('form',{},h('fieldset',{},h(Combobox,{...comboboxText, label:'City',name:'city',options,defaultValue:'riyadh',readonly:readonly.value,'onUpdate:query':queried,'onUpdate:modelValue':changed})))});apps.push(app);app.mount(container);
  const input=container.querySelector<HTMLInputElement>('[role=combobox]')!;const fieldset=container.querySelector('fieldset')!;const form=container.querySelector('form')!;input.focus();await nextTick();expect(input.getAttribute('aria-expanded')).toBe('true');readonly.value=true;await nextTick();expect(input.readOnly).toBe(true);expect(input.getAttribute('aria-readonly')).toBe('true');expect(input.getAttribute('aria-expanded')).toBe('false');
  input.value='invalid';input.dispatchEvent(new Event('input',{bubbles:true}));container.querySelectorAll<HTMLElement>('[role=option]')[1]!.click();await nextTick();expect(input.value).toBe('Riyadh');expect(changed).not.toHaveBeenCalled();expect(queried).not.toHaveBeenCalled();expect(new FormData(form).get('city')).toBe('riyadh');expect(document.activeElement).toBe(input);
  form.reset();await Promise.resolve();await nextTick();expect(input.value).toBe('Riyadh');readonly.value=false;await nextTick();expect(input.getAttribute('aria-expanded')).toBe('false');input.click();await nextTick();fieldset.disabled=true;await Promise.resolve();await nextTick();expect(input.getAttribute('aria-expanded')).toBe('false');expect(new FormData(form).has('city')).toBe(false);
});
it('preserves the first-legend disabled-fieldset exception',async()=>{
  const container=document.createElement('div');document.body.append(container);const app=createApp({render:()=>h('fieldset',{disabled:true},h('legend',{},h(Combobox,{...comboboxText, label:'City',options})))});apps.push(app);app.mount(container);const input=container.querySelector<HTMLInputElement>('[role=combobox]')!;input.focus();await nextTick();expect(input.getAttribute('aria-expanded')).toBe('true');
});
