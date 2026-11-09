import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('native top bar renders heading, back destination and action slot in both directions', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/?preview=portal');
  const bar = page.getByTestId('mobile-top-bar-showcase').locator('.hw-mobile-top-bar');
  await expect(bar.getByRole('heading', { level: 2 })).toHaveText('طلباتي');
  await expect(bar.locator('.hw-mobile-top-bar-subtitle')).toHaveText('تابع طلباتك');
  await expect(bar.getByRole('link', { name: 'رجوع' })).toHaveAttribute('href', '#services');
  await expect(bar.getByRole('link', { name: 'بحث' })).toBeVisible();
  expect(await bar.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
  await bar.getByRole('link', { name: 'رجوع' }).focus();
  await page.keyboard.press('Tab'); await expect(bar.getByRole('link', { name: 'بحث' })).toBeFocused();
  expect((await new AxeBuilder({ page }).include('[data-testid="mobile-top-bar-showcase"]').analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(bar.getByRole('heading', { level: 2 })).toHaveText('My requests');
  expect(await bar.locator('.hw-mobile-top-bar-back .hw-icon').evaluate(node => getComputedStyle(node).transform)).toBe('none');
  await bar.getByRole('link', { name: 'Back' }).click(); await expect(page).toHaveURL(/#services$/);
});
