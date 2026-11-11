import { createApp, h, nextTick } from 'vue';
import type { App } from 'vue';
import { afterEach, expect, it } from 'vitest';
import { PasswordField } from '../src/controls.js';
const apps: App[] = [];
afterEach(() => { apps.splice(0).forEach(app => app.unmount()); document.body.replaceChildren(); });
it('provides a decorative eye, readonly reveal, effective disabled guard and form-reset hiding', async () => {
  const container = document.createElement('div'); document.body.append(container); const app = createApp({render:()=>h('form', {}, h('fieldset', {}, h(PasswordField, {label:'Password', name:'password', defaultValue:'secret', readonly:true, showLabel:'Show password', hideLabel:'Hide password'})))}); apps.push(app); app.mount(container);
  const input=container.querySelector('input')!; const toggle=container.querySelector('button')!; const fieldset=container.querySelector('fieldset')!;
  expect(toggle.dataset.toggleVariant).toBe('icon'); expect(toggle.textContent).toBe(''); expect(toggle.querySelector('[aria-hidden=true]')).not.toBeNull(); expect(toggle.getAttribute('aria-controls')).toBe(input.id);
  toggle.focus(); toggle.click(); await nextTick(); expect(input.type).toBe('text'); expect(input.value).toBe('secret'); expect(document.activeElement).toBe(toggle); expect(toggle.getAttribute('aria-label')).toBe('Hide password');
  fieldset.disabled=true; toggle.dispatchEvent(new MouseEvent('click',{bubbles:true})); await nextTick(); expect(input.type).toBe('text'); fieldset.disabled=false;
  expect(new FormData(container.querySelector('form')!).get('password')).toBe('secret'); container.querySelector('form')!.reset(); await Promise.resolve(); await nextTick(); expect(input.type).toBe('password'); expect(toggle.getAttribute('aria-pressed')).toBe('false');
});
it('retains localized text as an explicit presentation option', async () => {
  const container=document.createElement('div'); document.body.append(container); const app=createApp(PasswordField,{label:'Password',toggleVariant:'text',showLabel:'إظهار',hideLabel:'إخفاء'});apps.push(app);app.mount(container);
  const toggle=container.querySelector('button')!; expect(toggle.textContent).toBe('إظهار'); expect(toggle.querySelector('.hw-password-icon')).toBeNull(); toggle.click(); await nextTick(); expect(toggle.textContent).toBe('إخفاء');
});
