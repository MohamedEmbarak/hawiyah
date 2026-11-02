import { afterEach, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MultiSelect } from './src/expanded-controls.js';
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const roots: ReturnType<typeof createRoot>[] = [];
afterEach(async () => { for (const root of roots.splice(0)) await act(async () => root.unmount()); document.body.replaceChildren(); });
it('validates and focuses readonly required search, submits only enabled options and clears disabled validity', async () => {
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host); roots.push(root); const changed = vi.fn();
  const options = [{ value: 'a', label: 'الأعمال' }, { value: 'b', label: 'التعليم', disabled: true }];
  const render = async (value: string[], disabled = false) => act(async () => root.render(<form><MultiSelect label="الخدمات" name="services" options={options} value={value} required readOnly disabled={disabled} requiredMessage="اختر خدمة" error="راجع الخدمات" onValueChange={changed} /></form>));
  await render(['missing', 'b']); const form = host.querySelector('form')!; const search = host.querySelector<HTMLInputElement>('[type=search]')!;
  expect(form.checkValidity()).toBe(false); expect(search.validationMessage).toBe('اختر خدمة'); expect(search.getAttribute('aria-required')).toBe('true'); expect(search.getAttribute('aria-invalid')).toBe('true'); expect(search.getAttribute('aria-describedby')).toBeTruthy();
  search.focus(); expect(document.activeElement).toBe(search); expect(search.readOnly).toBe(false); expect(new FormData(form).getAll('services')).toEqual([]);
  await act(async () => host.querySelector<HTMLInputElement>('[type=checkbox]')!.click()); expect(changed).not.toHaveBeenCalled();
  await render(['a']); expect(form.checkValidity()).toBe(true); expect(new FormData(form).getAll('services')).toEqual(['a']);
  await render([], true); expect(form.checkValidity()).toBe(true); expect(search.validity.customError).toBe(false); expect(new FormData(form).getAll('services')).toEqual([]);
  await render([]); expect(form.checkValidity()).toBe(false);
});
it('restores required selection validity on native reset', async () => {
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host); roots.push(root);
  await act(async () => root.render(<form><MultiSelect label="الخدمات" name="services" options={[{ value: 'a', label: 'الأعمال' }]} defaultValue={['a']} required /></form>));
  const form = host.querySelector('form')!; await act(async () => host.querySelector<HTMLInputElement>('[type=checkbox]')!.click()); expect(form.checkValidity()).toBe(false);
  await act(async () => form.reset()); expect(form.checkValidity()).toBe(true); expect(new FormData(form).getAll('services')).toEqual(['a']);
});
