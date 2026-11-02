import { afterEach, expect, it, vi } from 'vitest';
import { createMultiSelect } from '../src/controls.js';
const cleanup: (() => void)[] = [];
afterEach(() => { cleanup.splice(0).forEach(destroy => destroy()); document.body.replaceChildren(); });
function mount(attributes = '', selected = '') {
  document.body.innerHTML = `<form><fieldset ${attributes}><legend>الخدمات</legend><label>تصفية<input type="search" data-nq-multiselect-search></label><label data-nq-option><input type="checkbox" name="services" value="a" ${selected}>الأعمال</label><label data-nq-option><input type="checkbox" name="services" value="b" disabled checked>التعليم</label><span data-nq-status></span></fieldset></form>`;
  const form = document.querySelector('form')!; const root = form.querySelector('fieldset')!; const search = root.querySelector<HTMLInputElement>('[type=search]')!; const choice = root.querySelector<HTMLInputElement>('[value=a]')!;
  return { form, root, search, choice };
}
it('requires one enabled selection, preserves filtered values, resets and restores enhancement state', async () => {
  const { form, root, search, choice } = mount('data-nq-required="true" lang="ar"'); const before = root.outerHTML;
  const controller = createMultiSelect(root); cleanup.push(controller.destroy);
  expect(search.required).toBe(false); expect(search.getAttribute('aria-required')).toBe('true'); expect(form.checkValidity()).toBe(false); expect(search.validationMessage).toBe('اختر خيارًا واحدًا على الأقل.'); expect(controller.value).toEqual([]);
  search.focus(); expect(document.activeElement).toBe(search);
  choice.click(); expect(form.checkValidity()).toBe(true); expect(new FormData(form).getAll('services')).toEqual(['a']);
  search.value = 'التعليم'; search.dispatchEvent(new Event('input', { bubbles: true })); expect(choice.closest<HTMLElement>('[data-nq-option]')!.hidden).toBe(true); expect(form.checkValidity()).toBe(true); expect(controller.value).toEqual(['a']);
  form.reset(); await Promise.resolve(); expect(form.checkValidity()).toBe(false); expect(controller.value).toEqual([]);
  controller.destroy(); expect(root.outerHTML).toBe(before); expect(search.validity.customError).toBe(false);
});
it('supports explicit messages, dynamic required/disabled state and readonly selection without barring search validation', async () => {
  const { form, root, search, choice } = mount('data-nq-required="true" data-nq-readonly="true"'); const changed = vi.fn();
  const controller = createMultiSelect(root, { requiredMessage: 'Choose a service', onValueChange: changed }); cleanup.push(controller.destroy);
  expect(search.readOnly).toBe(false); expect(search.willValidate).toBe(true); expect(search.validationMessage).toBe('Choose a service');
  choice.click(); expect(choice.checked).toBe(false); expect(changed).not.toHaveBeenCalled();
  root.disabled = true; await Promise.resolve(); expect(form.checkValidity()).toBe(true); expect(search.validity.customError).toBe(false); expect(new FormData(form).getAll('services')).toEqual([]);
  root.disabled = false; await Promise.resolve(); expect(form.checkValidity()).toBe(false);
  root.dataset.nqReadonly = 'false'; await Promise.resolve(); choice.click(); expect(controller.value).toEqual(['a']);
  choice.disabled = true; await Promise.resolve(); expect(form.checkValidity()).toBe(false); expect(controller.value).toEqual([]);
  root.dataset.nqRequired = 'false'; await Promise.resolve(); expect(form.checkValidity()).toBe(true); expect(search.hasAttribute('aria-required')).toBe(false);
});
it('retains readonly selections and honors an explicit required override and cancelled reset', async () => {
  const { form, root, search, choice } = mount('data-nq-required="false" data-nq-readonly="true"', 'checked');
  const controller = createMultiSelect(root, { required: true }); cleanup.push(controller.destroy);
  expect(form.checkValidity()).toBe(true); expect(controller.value).toEqual(['a']); expect(new FormData(form).getAll('services')).toEqual(['a']); choice.click(); expect(choice.checked).toBe(true);
  search.value = 'query'; form.addEventListener('reset', event => event.preventDefault()); form.reset(); await Promise.resolve(); expect(search.value).toBe('query'); expect(controller.value).toEqual(['a']);
});
