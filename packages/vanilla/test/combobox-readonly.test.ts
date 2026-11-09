import { afterEach, expect, it, vi } from 'vitest';
import { createCombobox } from '../src/combobox.js';
afterEach(() => document.body.replaceChildren());
it('closes on readonly changes, retains form value and rejects editing or selection until unlocked', async () => {
  document.body.innerHTML='<form><fieldset><div data-combo><label for="city">City</label><input id="city" data-hw-combobox-input><input type="hidden" name="city" value="riyadh" data-hw-combobox-value><ul data-hw-combobox-list><li data-hw-value="riyadh">Riyadh</li><li data-hw-value="jeddah">Jeddah</li></ul></div></fieldset></form>';
  const root=document.querySelector<HTMLElement>('[data-combo]')!; const input=root.querySelector('input')!; const form=document.querySelector('form')!; const fieldset=document.querySelector('fieldset')!; const changed=vi.fn(); const controller=createCombobox(root,{onValueChange:changed});
  controller.show(); expect(controller.open).toBe(true); input.readOnly=true; await Promise.resolve();
  expect(controller.open).toBe(false); expect(input.getAttribute('aria-readonly')).toBe('true'); input.focus(); expect(document.activeElement).toBe(input);
  input.value='invalid'; input.dispatchEvent(new Event('input',{bubbles:true})); controller.show(); controller.select('jeddah');
  expect(controller.value).toBe('riyadh'); expect(input.value).toBe('Riyadh'); expect(changed).not.toHaveBeenCalled(); expect(new FormData(form).get('city')).toBe('riyadh');
  form.reset(); await Promise.resolve(); expect(controller.value).toBe('riyadh');
  input.readOnly=false; await Promise.resolve(); expect(input.hasAttribute('aria-readonly')).toBe(false); controller.show(); fieldset.disabled=true; await Promise.resolve(); expect(controller.open).toBe(false); expect(new FormData(form).has('city')).toBe(false); controller.select('jeddah'); expect(controller.value).toBe('riyadh');
  fieldset.disabled=false; await Promise.resolve(); controller.select('jeddah'); expect(controller.value).toBe('jeddah'); controller.destroy(); expect(input.hasAttribute('aria-readonly')).toBe(false);
});
it('keeps the native first-legend exemption in disabled fieldsets', () => {
  document.body.innerHTML='<fieldset disabled><legend><div><input data-hw-combobox-input><ul data-hw-combobox-list><li data-hw-value="r">Riyadh</li></ul></div></legend></fieldset>';
  const controller=createCombobox(document.querySelector('legend div')!); controller.select('r'); expect(controller.value).toBe('r'); controller.destroy();
});
