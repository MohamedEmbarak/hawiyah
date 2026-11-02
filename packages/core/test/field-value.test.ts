import { expect, it } from 'vitest';
import { observeFieldValue } from '../src/field-value.js';

it('tracks nonempty values, reset and shared ownership without changing validation', async () => {
  const form = document.createElement('form'); form.innerHTML = '<input value="0" required>';
  const input = form.querySelector('input')!;
  const first = observeFieldValue(input); const second = observeFieldValue(input);
  expect(input.dataset.nqFilled).toBe('true');
  input.value = ''; input.dispatchEvent(new Event('input')); await Promise.resolve();
  expect(input.dataset.nqFilled).toBe('false'); expect(input.validity.valueMissing).toBe(true);
  first.destroy(); expect(input.dataset.nqFilled).toBe('false');
  form.reset(); await Promise.resolve(); expect(input.dataset.nqFilled).toBe('true');
  input.setCustomValidity('Application error'); second.refresh();
  expect(input.validationMessage).toBe('Application error');
  second.destroy(); second.destroy(); expect(input.hasAttribute('data-nq-filled')).toBe(false);
});

it('reads the final controlled value after native input processing and ignores canceled reset', async () => {
  const form = document.createElement('form'); form.innerHTML = '<input value="initial" data-nq-filled="application">';
  const input = form.querySelector('input')!; const observer = observeFieldValue(input);
  input.value = 'draft'; input.dispatchEvent(new Event('input')); input.value = '';
  await Promise.resolve(); expect(input.dataset.nqFilled).toBe('false');
  form.addEventListener('reset', event => event.preventDefault()); form.reset(); await Promise.resolve();
  expect(input.dataset.nqFilled).toBe('false'); observer.destroy();
  expect(input.dataset.nqFilled).toBe('application');
});
