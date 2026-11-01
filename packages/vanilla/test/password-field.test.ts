import {afterEach,expect,it} from 'vitest';
import {createPasswordField} from '../src/controls.js';
afterEach(()=>document.body.replaceChildren());
it('defaults to a labelled eye and preserves values, readonly reveal, effective disabled state and cleanup',async()=>{
  document.body.innerHTML='<form><fieldset><div data-nq="password-field"><label for="password">Password</label><div class="nq-password-control"><input id="password" name="password" data-nq-password-input type="password" readonly value="secret"><button data-nq-password-toggle>Original</button></div></div></fieldset></form>';
  const root=document.querySelector<HTMLElement>('[data-nq=password-field]')!;const before=root.outerHTML;const controller=createPasswordField(root,{showLabel:'إظهار',hideLabel:'إخفاء'});const input=root.querySelector('input')!;const toggle=root.querySelector('button')!;
  expect(toggle.dataset.toggleVariant).toBe('icon');expect(toggle.textContent).toBe('');expect(toggle.querySelector('[aria-hidden=true]')).not.toBeNull();expect(toggle.getAttribute('aria-controls')).toBe(input.id);
  toggle.focus();toggle.click();expect(input.type).toBe('text');expect(input.value).toBe('secret');expect(document.activeElement).toBe(toggle);expect(toggle.getAttribute('aria-label')).toBe('إخفاء');
  document.querySelector('fieldset')!.disabled=true;controller.toggle();expect(input.type).toBe('text');document.querySelector('fieldset')!.disabled=false;
  expect(new FormData(document.querySelector('form')!).get('password')).toBe('secret');document.querySelector('form')!.reset();await Promise.resolve();expect(input.type).toBe('password');controller.destroy();expect(root.outerHTML).toBe(before);
});
it('supports the text variant in options and markup',()=>{
  for(const fromMarkup of [false,true]){
    document.body.innerHTML=`<div ${fromMarkup?'data-nq-toggle-variant="text"':''}><input type="password" data-nq-password-input><button data-nq-password-toggle>Show</button></div>`;
    const root=document.body.firstElementChild as HTMLElement;const controller=createPasswordField(root,{showLabel:'إظهار',hideLabel:'إخفاء',...(fromMarkup?{}:{toggleVariant:'text' as const})});const toggle=root.querySelector('button')!;
    expect(toggle.textContent).toBe('إظهار');expect(toggle.querySelector('.nq-password-icon')).toBeNull();toggle.click();expect(toggle.textContent).toBe('إخفاء');controller.destroy();
  }
});
