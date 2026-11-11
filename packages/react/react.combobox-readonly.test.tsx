import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { Combobox } from './src/interactive.js';
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const roots: ReturnType<typeof createRoot>[]=[];
afterEach(async()=>{for(const root of roots.splice(0)) await act(()=>root.unmount());document.body.replaceChildren();});
const options=[{value:'riyadh',label:'Riyadh'},{value:'jeddah',label:'Jeddah'}];
it('closes when locked without reopening on unlock, rejects query callbacks, preserves value and reset',async()=>{
  const container=document.createElement('div');document.body.append(container);const root=createRoot(container);roots.push(root);const changed=vi.fn(), queried=vi.fn();
  const render=(readOnly=false)=>root.render(<form><fieldset><Combobox label="City" emptyMessage="No options found" getResultsMessage={count => `${count} results available`} name="city" options={options} defaultValue="riyadh" readOnly={readOnly} onValueChange={changed} onInputChange={queried}/></fieldset></form>);
  await act(()=>render());const input=container.querySelector<HTMLInputElement>('[role=combobox]')!;const form=container.querySelector('form')!;const fieldset=container.querySelector('fieldset')!;
  await act(()=>input.focus());expect(input.getAttribute('aria-expanded')).toBe('true');await act(()=>render(true));expect(input.readOnly).toBe(true);expect(input.getAttribute('aria-readonly')).toBe('true');expect(input.getAttribute('aria-expanded')).toBe('false');
  await act(()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input,'invalid');input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}));});
  expect(input.value).toBe('Riyadh');expect(changed).not.toHaveBeenCalled();expect(queried).not.toHaveBeenCalled();expect(new FormData(form).get('city')).toBe('riyadh');expect(document.activeElement).toBe(input);
  await act(()=>form.reset());expect(input.value).toBe('Riyadh');await act(()=>render());expect(input.getAttribute('aria-expanded')).toBe('false');
  await act(()=>input.click());expect(input.getAttribute('aria-expanded')).toBe('true');await act(async()=>{fieldset.disabled=true;await Promise.resolve();});expect(input.getAttribute('aria-expanded')).toBe('false');expect(new FormData(form).has('city')).toBe(false);
  await act(()=>container.querySelectorAll<HTMLElement>('[role=option]')[1]!.click());expect(changed).not.toHaveBeenCalled();
});
it('preserves the first-legend disabled-fieldset exception',async()=>{
  const container=document.createElement('div');document.body.append(container);const root=createRoot(container);roots.push(root);
  await act(()=>root.render(<fieldset disabled><legend><Combobox label="City" emptyMessage="No options found" getResultsMessage={count => `${count} results available`} options={options}/></legend></fieldset>));const input=container.querySelector<HTMLInputElement>('[role=combobox]')!;await act(()=>input.focus());expect(input.getAttribute('aria-expanded')).toBe('true');
});
