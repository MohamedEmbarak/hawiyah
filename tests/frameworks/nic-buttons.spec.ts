import { expect, test } from '@playwright/test';
import { checkNicButtons } from '../helpers/nic-buttons';
for (const locale of ['ar', 'en']) test(`NIC button states, variants and native behavior in ${locale}`, async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/?preview=nic');
  await expect(page.getByTestId('button-showcase')).toBeVisible();
  if (locale === 'en') await page.getByRole('button', { name: 'English', exact: true }).click();
  await checkNicButtons(page);
  expect(errors).toEqual([]);
});
