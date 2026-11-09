import { expect, test } from '@playwright/test';

test('guide search clear is inset, keyboard operable and resets with the native form', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/#inputs');
  const input = page.locator('#native-input-lab input[name="search"]');
  const clear = input.locator('..').locator('.hw-search-clear');
  await input.fill('هوية');
  await expect(clear).toHaveAccessibleName('مسح البحث');
  const bounds = (await input.boundingBox())!; const action = (await clear.boundingBox())!;
  expect(action.x).toBeGreaterThanOrEqual(bounds.x);
  expect(action.x + action.width).toBeLessThanOrEqual(bounds.x + bounds.width + 1);
  expect(action.y).toBeGreaterThanOrEqual(bounds.y);
  expect(action.y + action.height).toBeLessThanOrEqual(bounds.y + bounds.height + 1);
  await input.focus(); await page.keyboard.press('Tab'); await expect(clear).toBeFocused();
  await page.keyboard.press('Space'); await expect(input).toHaveValue(''); await expect(input).toBeFocused(); await expect(clear).toBeHidden();
  await input.fill('Hawiyah'); await input.evaluate(node => (node as HTMLInputElement).form!.reset());
  await expect(input).toHaveValue(''); await expect(clear).toBeHidden();
  await input.fill('هوية'); await input.locator('..').screenshot({ path: testInfo.outputPath('search-field.png') });
});
