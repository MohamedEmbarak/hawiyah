import { createApp, h, nextTick } from 'vue';
import type { App } from 'vue';
import { afterEach, expect, it } from 'vitest';
import { DatePicker } from '../src/calendar.js';

const apps: App[] = [];
afterEach(() => { apps.splice(0).forEach(app => app.unmount()); document.body.replaceChildren(); });
it('retains malformed drafts without publishing them and validates ranges on a focusable text input', async () => {
  const container = document.createElement('div'); document.body.append(container); const values: string[] = [];
  const app = createApp({ render: () => h('form', {}, h(DatePicker, { label: 'Date', name: 'date', required: true, calendar: 'islamic-umalqura', defaultValue: '2026-10-15', min: '2026-10-01', max: '2026-10-31', isDateDisabled: date => date === '2026-10-20', 'onUpdate:modelValue': value => values.push(value) })) }); apps.push(app); app.mount(container); await nextTick();
  const input = container.querySelector<HTMLInputElement>('input[type=text]')!; const form = container.querySelector('form')!;
  const edit = async (value: string) => { input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); await nextTick(); };
  expect(container.querySelector('input[type=date]')).toBeNull(); expect(input.name).toBe(''); expect(input.willValidate).toBe(true);
  input.focus(); await edit('2026-02-30'); expect(input.value).toBe('2026-02-30'); expect(input.checkValidity()).toBe(false); expect(values).toEqual([]); expect(new FormData(form).get('date')).toBe('2026-10-15'); expect(document.activeElement).toBe(input);
  await edit('2026-11-01'); expect(values.at(-1)).toBe('2026-11-01'); expect(input.checkValidity()).toBe(false);
  await edit('2026-10-20'); expect(input.checkValidity()).toBe(false);
  await edit('2026-10-21'); expect(input.checkValidity()).toBe(true); expect(new FormData(form).getAll('date')).toEqual(['2026-10-21']);
  await edit(''); expect(values.at(-1)).toBe(''); expect(input.validity.valueMissing).toBe(true);
  form.reset(); await Promise.resolve(); await nextTick(); expect(input.value).toBe('2026-10-15'); expect(new FormData(form).get('date')).toBe('2026-10-15'); expect(container.querySelector('select')!.value).toBe('islamic-umalqura');
});
