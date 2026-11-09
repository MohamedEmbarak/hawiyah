import { afterEach, expect, it, vi } from 'vitest';
import { createRating, enhance } from '../src/index.js';
afterEach(() => document.body.replaceChildren());
function mount(readonly = false) {
  document.body.innerHTML = `<form><fieldset class="hw-rating" data-hw="rating" data-hw-readonly="${readonly}"><legend>Rating</legend>${[1,2,3,4,5].map(value => `<label><input type="radio" name="rating" value="${value}" ${value === 3 ? 'checked' : ''} required><span aria-hidden="true">★</span></label>`).join('')}</fieldset></form>`;
  return { form: document.querySelector('form')!, fieldset: document.querySelector('fieldset')!, inputs: [...document.querySelectorAll('input')] };
}
it('keeps one native form value, reset state and change callbacks', async () => {
  const { form, fieldset, inputs } = mount(); const changed = vi.fn(); const controller = createRating(fieldset, { onValueChange: changed });
  inputs[4]!.click(); expect(controller.value).toBe(5); expect(changed).toHaveBeenLastCalledWith(5);
  expect(new FormData(form).getAll('rating')).toEqual(['5']);
  form.reset(); await Promise.resolve(); expect(controller.value).toBe(3); expect(new FormData(form).getAll('rating')).toEqual(['3']);
  fieldset.disabled = true; inputs[0]!.click(); expect(controller.value).toBe(3); expect(new FormData(form).getAll('rating')).toEqual([]);
  controller.destroy();
});
it('enhances readonly without removing focus or trapping Tab and restores markup on cleanup', () => {
  const { form, fieldset, inputs } = mount(true); const before = fieldset.outerHTML; const cleanup = enhance(fieldset);
  inputs[2]!.focus(); expect(document.activeElement).toBe(inputs[2]); inputs[4]!.click();
  for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ']) {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }); inputs[2]!.dispatchEvent(event); expect(event.defaultPrevented).toBe(true);
  }
  const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }); inputs[2]!.dispatchEvent(tab); expect(tab.defaultPrevented).toBe(false);
  expect(new FormData(form).getAll('rating')).toEqual(['3']); cleanup(); expect(fieldset.outerHTML).toBe(before);
});
