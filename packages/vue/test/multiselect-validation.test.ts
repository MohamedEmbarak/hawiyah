import { afterEach, expect, it, vi } from 'vitest';
import { createApp, defineComponent, h, nextTick, ref, type App } from 'vue';
import { MultiSelect } from '../src/controls.js';
let app: App | undefined;
afterEach(() => { app?.unmount(); document.body.replaceChildren(); });
it('keeps readonly search validatable and focusable while disabling selection; handles required and disabled changes', async () => {
  const host = document.createElement('div'); document.body.append(host); const value = ref<string[]>([]); const disabled = ref(false); const changed = vi.fn();
  app = createApp(defineComponent(() => () => h('form', [h(MultiSelect, { label: 'الخدمات', name: 'services', required: true, readonly: true, disabled: disabled.value, modelValue: value.value, options: [{ value: 'a', label: 'الأعمال' }], requiredMessage: 'اختر خدمة', 'onUpdate:modelValue': changed })]))); app.mount(host); await nextTick();
  const form = host.querySelector('form')!; const search = host.querySelector<HTMLInputElement>('[type=search]')!;
  expect(search.readOnly).toBe(false); expect(search.willValidate).toBe(true); expect(search.getAttribute('aria-required')).toBe('true'); expect(form.checkValidity()).toBe(false); expect(search.validationMessage).toBe('اختر خدمة');
  search.focus(); expect(document.activeElement).toBe(search); host.querySelector<HTMLInputElement>('[type=checkbox]')!.click(); await nextTick(); expect(changed).not.toHaveBeenCalled();
  value.value = ['a']; await nextTick(); expect(form.checkValidity()).toBe(true); expect(new FormData(form).getAll('services')).toEqual(['a']);
  search.value = 'no results'; search.dispatchEvent(new Event('input', { bubbles: true })); await nextTick(); expect(host.querySelector('[type=checkbox]')).toBeNull(); expect(new FormData(form).getAll('services')).toEqual(['a']);
  disabled.value = true; value.value = []; await nextTick(); expect(form.checkValidity()).toBe(true); expect(search.validity.customError).toBe(false); expect(new FormData(form).getAll('services')).toEqual([]);
  disabled.value = false; await nextTick(); expect(form.checkValidity()).toBe(false);
});
it('restores selected values and clears the filter on native form reset', async () => {
  const host = document.createElement('div'); document.body.append(host);
  app = createApp(defineComponent(() => () => h('form', [h(MultiSelect, { label: 'الخدمات', name: 'services', required: true, defaultValue: ['a'], options: [{ value: 'a', label: 'الأعمال' }] })]))); app.mount(host); await nextTick();
  const form = host.querySelector('form')!; host.querySelector<HTMLInputElement>('[type=checkbox]')!.click(); await nextTick(); expect(form.checkValidity()).toBe(false);
  const search = host.querySelector<HTMLInputElement>('[type=search]')!; search.value = 'query'; search.dispatchEvent(new Event('input', { bubbles: true })); await nextTick();
  form.reset(); await Promise.resolve(); await nextTick(); expect(form.checkValidity()).toBe(true); expect(search.value).toBe(''); expect(new FormData(form).getAll('services')).toEqual(['a']);
});
