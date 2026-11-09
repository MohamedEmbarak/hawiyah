import { expect, test } from '@playwright/test';

test('native adapter fields share neutral, valid and invalid underline states', async ({ page }) => {
  await page.goto('/?preview=inputs');
  const field = page.locator('input[name="password"]');
  // Native constraints are application-owned; exercise the real adapter input.
  await field.evaluate(node => { (node as HTMLInputElement).required = true; node.setAttribute('pattern', '.{8,}'); });
  const colors = await field.evaluate(node => {
    const probe = document.createElement('span'); node.parentElement!.append(probe);
    const values = ['--hw-color-field-active', '--hw-color-primary-text', '--hw-color-danger'].map(token => { probe.style.color = `var(${token})`; const value = getComputedStyle(probe).color; return `linear-gradient(${value}, ${value})`; });
    probe.remove(); return values;
  });
  await field.focus(); await expect(field).toHaveCSS('background-image', colors[0]!);
  const query = page.locator('input[name="query"]');
  await query.focus(); await expect(query).toHaveCSS('background-image', colors[1]!);
  await page.keyboard.press('Tab'); await expect(query).toHaveCSS('background-size', '0% 2px');
  await page.locator('.hw-search-clear').click(); await expect(query).toHaveValue('');
  await expect(query).toHaveCSS('background-image', colors[0]!);
  await field.fill('short'); await page.keyboard.press('Tab'); await expect(field).toHaveCSS('background-image', colors[2]!);
  await field.fill('long-enough'); await page.keyboard.press('Tab'); await expect(field).toHaveCSS('background-image', colors[1]!);
  await page.getByTestId('input-controls').locator('button[type=reset]').click();
  await field.focus(); await expect(field).toHaveCSS('background-image', colors[0]!);
});
