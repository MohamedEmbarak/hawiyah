import { expect, test } from '@playwright/test';

test('custom date field keeps typed drafts separate from canonical submission', async ({ page }) => {
  await page.goto('/');
  const picker = page.getByTestId('calendar-showcase').locator('.nq-date-picker');
  const input = picker.locator('input[type=text]');
  const canonical = picker.locator('input[type=hidden][name]:not([name=""])');
  await expect(picker.locator('input[type=date]')).toHaveCount(0);
  await expect(canonical).toHaveValue('2024-03-11');
  await input.fill('2024-02-30'); await expect(input).toHaveValue('2024-02-30');
  expect(await input.evaluate(node => (node as HTMLInputElement).checkValidity())).toBe(false);
  await expect(canonical).toHaveValue('2024-03-11');
  await input.fill('2024-03-12'); await expect(canonical).toHaveValue('2024-03-12');
  expect(await input.evaluate(node => (node as HTMLInputElement).checkValidity())).toBe(true);
  await input.click(); await expect(picker.locator('dialog')).toBeHidden();
  await input.press('Alt+ArrowDown'); await expect(picker.locator('dialog')).toBeVisible();
  await page.keyboard.press('Escape'); await expect(input).toBeFocused();
  await input.fill(''); await expect(canonical).toHaveValue('');
  expect(await input.evaluate(node => (node as HTMLInputElement).validity.valueMissing)).toBe(true);
});
