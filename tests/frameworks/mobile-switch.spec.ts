import { expect, test } from '@playwright/test';
import { checkMobileSwitches } from '../helpers/mobile-switch';

for (const direction of ['rtl', 'ltr'] as const) {
  test(`native mobile switch preserves density geometry and interaction in ${direction}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 1000 });
    await page.goto('/?preview=inputs');
    const showcase = page.getByTestId('input-controls');
    if (direction === 'ltr') await showcase.getByRole('button', { name: 'English', exact: true }).click();
    await expect(showcase).toHaveAttribute('dir', direction);
    const scope = page.getByTestId('mobile-switches'); await expect(scope).toBeVisible();
    await checkMobileSwitches(page, scope, direction);
  });
}
