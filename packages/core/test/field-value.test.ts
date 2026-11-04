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

it('tracks silent default selection when options arrive or disappear inside an optgroup', async () => {
  const form = document.createElement('form');
  form.innerHTML = '<select name="region" required><optgroup label="Regions"></optgroup></select>';
  const select = form.querySelector('select')!;
  const group = select.querySelector('optgroup')!;
  const observer = observeFieldValue(select);
  try {
    expect(select.dataset.nqFilled).toBe('false');
    const option = new Option('Riyadh', 'riyadh');
    group.append(option);
    await Promise.resolve();
    expect(select.value).toBe('riyadh');
    expect(select.validity.valid).toBe(true);
    expect(new FormData(form).get('region')).toBe('riyadh');
    expect(select.dataset.nqFilled).toBe('true');
    option.remove();
    await Promise.resolve();
    expect(select.validity.valueMissing).toBe(true);
    expect(select.dataset.nqFilled).toBe('false');
  } finally { observer.destroy(); }
});

it('reads live selected option text, explicit values and changes to default selection', async () => {
  const select = document.createElement('select');
  select.innerHTML = '<option selected>Riyadh</option><option value="">Choose</option>';
  const first = select.options[0]!;
  const observer = observeFieldValue(select);
  try {
    expect(select.dataset.nqFilled).toBe('true');
    (first.firstChild as Text).data = '';
    await Promise.resolve();
    expect(select.value).toBe('');
    expect(select.dataset.nqFilled).toBe('false');
    first.textContent = 'Riyadh';
    await Promise.resolve();
    expect(select.dataset.nqFilled).toBe('true');
    first.value = '';
    await Promise.resolve();
    expect(select.dataset.nqFilled).toBe('false');
    first.value = 'riyadh';
    await Promise.resolve();
    expect(select.dataset.nqFilled).toBe('true');
    select.options[1]!.defaultSelected = true;
    await Promise.resolve();
    expect(select.selectedIndex).toBe(1);
    expect(select.dataset.nqFilled).toBe('false');
  } finally { observer.destroy(); }
});

it('uses all selected values in a multiple select and follows native form reset', async () => {
  const form = document.createElement('form');
  form.innerHTML = '<select multiple required name="regions"><option selected value="">Empty</option><option selected value="riyadh">Riyadh</option></select>';
  const select = form.querySelector('select')!;
  const observer = observeFieldValue(select);
  try {
    expect(select.value).toBe('');
    expect(new FormData(form).getAll('regions')).toEqual(['', 'riyadh']);
    expect(select.dataset.nqFilled).toBe('true');
    select.options[1]!.selected = false;
    select.dispatchEvent(new Event('change'));
    await Promise.resolve();
    expect(select.dataset.nqFilled).toBe('false');
    form.reset();
    await Promise.resolve();
    expect(new FormData(form).getAll('regions')).toEqual(['', 'riyadh']);
    expect(select.dataset.nqFilled).toBe('true');
  } finally { observer.destroy(); }
});
