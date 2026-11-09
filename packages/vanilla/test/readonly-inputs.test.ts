import { afterEach, expect, it, vi } from 'vitest';
import { createRangeSlider } from '../src/controls.js';

afterEach(() => document.body.replaceChildren());
it('announces dynamically read-only ranges without removing focus or submitted values and restores owned attributes', async () => {
  const root = document.createElement('form'); root.innerHTML = '<fieldset data-hw-readonly="true"><input type="range" name="lower" value="20" data-hw-lower><input type="range" name="upper" value="80" data-hw-upper></fieldset>'; document.body.append(root);
  const field = root.querySelector('fieldset')!; const changed = vi.fn(); const controller = createRangeSlider(field, { onValueChange: changed });
  const inputs = [...field.querySelectorAll('input')];
  for (const input of inputs) { input.focus(); expect(document.activeElement).toBe(input); expect(input.getAttribute('aria-readonly')).toBe('true'); }
  inputs[0]!.value = '60'; inputs[0]!.dispatchEvent(new Event('input', { bubbles: true })); expect(inputs[0]!.value).toBe('20'); expect(changed).not.toHaveBeenCalled();
  expect([...new FormData(root).entries()]).toEqual([['lower', '20'], ['upper', '80']]);
  field.removeAttribute('data-hw-readonly'); await Promise.resolve(); expect(inputs.every(input => !input.hasAttribute('aria-readonly'))).toBe(true);
  controller.destroy(); expect(inputs.every(input => !input.hasAttribute('aria-readonly'))).toBe(true);
});
