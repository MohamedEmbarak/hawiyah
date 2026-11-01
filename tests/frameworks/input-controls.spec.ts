import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const direction of ['rtl', 'ltr'] as const) {
  test(`native input showcase preserves composition and keyboard behavior in ${direction}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 1000 });
    await page.goto('/?preview=inputs');
    const scope = page.getByTestId('input-controls');
    if (direction === 'ltr') await scope.getByRole('button', { name: 'English', exact: true }).click();
    await expect(scope).toHaveAttribute('dir', direction);
    const input = scope.locator('input[name="password"]');
    const control = input.locator('..');
    const eye = control.locator('.nq-password-toggle');
    await expect(eye).toHaveAttribute('data-toggle-variant', 'icon');
    await expect(eye).toHaveAccessibleName(direction === 'rtl' ? 'إظهار كلمة المرور' : 'Show password');
    await expect(eye.locator('.nq-password-icon')).toBeVisible();
    await input.fill('sample-only-password');
    await input.focus(); await page.keyboard.press('Tab'); await expect(eye).toBeFocused();
    await page.keyboard.press('Space');
    await expect(input).toHaveAttribute('type', 'text');
    await expect(eye).toHaveAttribute('aria-pressed', 'true');
    const bounds = (await input.boundingBox())!;
    const toggleBounds = (await eye.boundingBox())!;
    expect(toggleBounds.x).toBeGreaterThanOrEqual(bounds.x);
    expect(toggleBounds.x + toggleBounds.width).toBeLessThanOrEqual(bounds.x + bounds.width + 1);
    expect(toggleBounds.y).toBeGreaterThanOrEqual(bounds.y);
    expect(toggleBounds.y + toggleBounds.height).toBeLessThanOrEqual(bounds.y + bounds.height + 1);
    const textToggle = scope.locator('.nq-password-toggle[data-toggle-variant="text"]');
    await expect(textToggle).toHaveText(direction === 'rtl' ? 'إظهار' : 'Show');
    await textToggle.click(); await expect(textToggle).toHaveText(direction === 'rtl' ? 'إخفاء' : 'Hide');
    const rating = scope.locator('.nq-rating');
    await expect(rating.locator('input:checked')).toHaveValue('3');
    await rating.locator('input:checked').focus(); await page.keyboard.press('ArrowDown');
    await expect(rating.locator('input:checked')).toHaveValue('4');
    const slider = scope.locator('input[name="readonly-slider"]');
    await slider.focus(); await page.keyboard.press('ArrowRight'); await page.keyboard.press('Home');
    await expect(slider).toHaveValue('30');
    await page.keyboard.press('Tab');
    const checkbox = scope.locator('input[name="consent"]');
    await expect(checkbox).toBeFocused();
    await page.keyboard.press('Space'); await expect(checkbox).toBeChecked();
    const steps = scope.locator('.nq-stepper .nq-step');
    await expect(steps.nth(0)).toHaveAttribute('data-state', 'complete');
    await expect(steps.nth(1)).toHaveAttribute('aria-current', 'step');
    await expect(steps.nth(2)).toHaveAttribute('data-state', 'upcoming');
    expect(await steps.nth(1).evaluate(node => getComputedStyle(node, '::before').backgroundColor)).toBe('rgb(79, 55, 139)');
    // Exercise the text action's hover contrast explicitly in both directions.
    await textToggle.hover();
    expect((await new AxeBuilder({ page }).include('[data-testid="input-controls"]').analyze()).violations).toEqual([]);
    expect(await scope.evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
    await scope.screenshot({ path: testInfo.outputPath(`input-controls-${direction}.png`) });
    await scope.locator('button[type="reset"]').click();
    await expect(input).toHaveAttribute('type', 'password');
    await expect(eye).toHaveAttribute('aria-pressed', 'false');
    await expect(textToggle).toHaveAttribute('aria-pressed', 'false');
  });
}
