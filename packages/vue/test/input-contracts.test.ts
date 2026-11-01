import { afterEach, expect, it, vi } from 'vitest';
import { createApp, defineComponent, h, nextTick, ref, type App } from 'vue';
import { MultiSelect, PinInput, TagInput } from '../src/controls.js';
let app: App | undefined;
afterEach(() => { app?.unmount(); document.body.replaceChildren(); });
function mount(render: () => ReturnType<typeof h>) { const host = document.createElement('div'); document.body.append(host); app = createApp(defineComponent(() => render)); app.mount(host); return host; }

it('ignores unknown and disabled multiselect values for required validity and submission without changing the model', async () => {
  const value = ref(['missing', 'disabled']); const options = ref([{ value: 'available', label: 'Available' }, { value: 'disabled', label: 'Disabled', disabled: true }]); const changed = vi.fn();
  const host = mount(() => h('form', [h(MultiSelect, { name: 'choices', label: 'الخيارات', required: true, options: options.value, modelValue: value.value, 'onUpdate:modelValue': changed })]));
  await nextTick();
  const form = host.querySelector('form')!; expect(form.checkValidity()).toBe(false); expect(new FormData(form).getAll('choices')).toEqual([]);
  options.value = [...options.value, { value: 'missing', label: 'Restored' }]; await nextTick();
  expect(form.checkValidity()).toBe(true); expect(new FormData(form).getAll('choices')).toEqual(['missing']);
  options.value = options.value.filter(option => option.value !== 'missing'); await nextTick();
  expect(form.checkValidity()).toBe(false); expect(new FormData(form).getAll('choices')).toEqual([]); expect(value.value).toEqual(['missing', 'disabled']); expect(changed).not.toHaveBeenCalled();
});

it('normalizes external PINs, rejects partial codes, and preserves the parent value', async () => {
  const value = ref('١٢٣٤٥٦٧'); const changed = vi.fn();
  const host = mount(() => h('form', [h(PinInput, { name: 'pin', label: 'الرمز', modelValue: value.value, 'onUpdate:modelValue': changed })]));
  const form = host.querySelector('form')!; expect(new FormData(form).get('pin')).toBe('123456'); expect(form.checkValidity()).toBe(true);
  value.value = '۱۲'; await nextTick(); expect(new FormData(form).get('pin')).toBe('12'); expect(form.checkValidity()).toBe(false); expect(changed).not.toHaveBeenCalled();
});

it('restores a normalized default PIN on native form reset', async () => {
  const host = mount(() => h('form', [h(PinInput, { name: 'pin', label: 'الرمز', defaultValue: '١٢٣٤٥٦' })])); const form = host.querySelector('form')!; const input = host.querySelector('input')!;
  input.value = '۷۶۵۴۳۲'; input.dispatchEvent(new Event('input', { bubbles: true })); await nextTick(); expect(new FormData(form).get('pin')).toBe('765432');
  form.reset(); await Promise.resolve(); await nextTick(); expect(new FormData(form).get('pin')).toBe('123456');
});

it('announces required tags without requiring a nonempty draft', () => {
  const host = mount(() => h('form', [h(TagInput, { name: 'tags', label: 'الوسوم', required: true, defaultValue: ['نسق'] })]));
  const form = host.querySelector('form')!; const input = host.querySelector<HTMLInputElement>('input:not([type=hidden])')!;
  expect(input.required).toBe(false); expect(input.getAttribute('aria-required')).toBe('true'); expect(form.checkValidity()).toBe(true); expect(new FormData(form).getAll('tags')).toEqual(['نسق']);
});
