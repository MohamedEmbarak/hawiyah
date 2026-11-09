import { expect, it } from 'vitest';
import { enhance } from '../src/index.js';

it('enhances async native select options and restores the authored marker after cleanup', async () => {
  const form = document.createElement('form');
  form.innerHTML = '<label>Region <select required class="hw-select" name="region" data-hw-filled="authored"></select></label>';
  document.body.append(form);
  const select = form.querySelector('select')!;
  const release = enhance(form);
  try {
    expect(select.dataset.hwFilled).toBe('false');
    select.append(new Option('Riyadh', 'riyadh', true, true));
    await Promise.resolve();
    expect(select.value).toBe('riyadh');
    expect(select.dataset.hwFilled).toBe('true');
    select.prepend(new Option('Choose', ''));
    select.value = '';
    select.focus();
    expect(select.dataset.hwFilled).toBe('false');
    expect(form.checkValidity()).toBe(false);
    form.reset();
    await Promise.resolve();
    expect(select.dataset.hwFilled).toBe('true');
    expect(new FormData(form).get('region')).toBe('riyadh');
  } finally { release(); form.remove(); }
  select.replaceChildren();
  await Promise.resolve();
  expect(select.dataset.hwFilled).toBe('authored');
});
