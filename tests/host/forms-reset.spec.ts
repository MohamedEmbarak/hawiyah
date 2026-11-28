import { expect, test, type Page } from '@playwright/test';
import { openCase, section } from './support';

// RESET-12: a real click and Enter on a reset button in Chromium: after the next
// frame data-hw-filled, the shown value and FormData agree with the reset target
// for a static vanilla fixture (text field, range slider, toggle group); a reset
// prevented by a later listener changes nothing.
async function state(page: Page) {
  return page.evaluate(async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const form = document.getElementById('reset-form') as HTMLFormElement;
    const name = form.querySelector<HTMLInputElement>('#reset-name')!;
    return {
      form: [...new FormData(form).entries()].map(([key, value]) => `${key}=${String(value)}`),
      name: name.value,
      filled: name.getAttribute('data-hw-filled'),
      sliders: [...form.querySelectorAll<HTMLInputElement>('.hw-slider')].map((input) => input.value),
      output: form.querySelector('[data-hw-range-output]')!.textContent,
      pressed: [...form.querySelectorAll('.hw-toggle-group button')].map((button) => button.getAttribute('aria-pressed')),
    };
  });
}

async function change(page: Page): Promise<void> {
  const root = section(page, 'vanilla');
  await root.locator('#reset-name').click();
  await page.keyboard.type('Sara');
  await root.locator('[data-hw-lower]').focus();
  for (let step = 0; step < 5; step += 1) await page.keyboard.press('ArrowUp');
  await root.locator('.hw-toggle-group button[data-hw-value="italic"]').click();
}

for (const activation of ['click', 'Enter'] as const) {
  test(`RESET-12 vanilla: a reset by ${activation === 'click' ? 'a real click' : 'Enter'} restores the shown value, data-hw-filled and FormData`, async ({ page }) => {
    await openCase(page, 'RESET-12', { adapters: ['vanilla'] });
    const target = await state(page);
    expect(target.filled).toBe('false');
    expect(target.pressed).toEqual(['true', 'false']);
    expect(target.form).toEqual(expect.arrayContaining(['price=20', 'price=80', 'style=bold']));
    await change(page);
    const changed = await state(page);
    expect(changed.name).toBe('Sara');
    expect(changed.filled).toBe('true');
    expect(changed.sliders).not.toEqual(target.sliders);
    expect(changed.output).not.toBe(target.output);
    expect(changed.form).toEqual(expect.arrayContaining(['applicant=Sara', 'style=italic']));
    const reset = section(page, 'vanilla').locator('button[type="reset"]');
    if (activation === 'click') await reset.click();
    else {
      await reset.focus();
      await page.keyboard.press('Enter');
    }
    expect(await state(page)).toEqual(target);
    await expect(reset).toBeFocused();
  });

  test(`RESET-12 vanilla: a reset by ${activation === 'click' ? 'a real click' : 'Enter'} that a later listener prevents changes nothing`, async ({ page }) => {
    await openCase(page, 'RESET-12', { adapters: ['vanilla'] });
    // Registered after enhance(), so it runs after the controllers' listeners.
    await page.evaluate(() => document.getElementById('reset-form')!.addEventListener('reset', (event) => event.preventDefault()));
    await change(page);
    const changed = await state(page);
    const reset = section(page, 'vanilla').locator('button[type="reset"]');
    if (activation === 'click') await reset.click();
    else {
      await reset.focus();
      await page.keyboard.press('Enter');
    }
    expect(await state(page)).toEqual(changed);
  });
}
