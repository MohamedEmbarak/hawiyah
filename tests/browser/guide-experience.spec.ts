import { expect, test } from '@playwright/test';

test('a fresh visit starts with Arabic content and RTL navigation', async ({ page }) => {
  await page.goto('/#docs/getting-started');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('البداية');
  await expect(page.locator('.topbar [data-action="search-components"]'))
    .toHaveAccessibleName('ابحث في الدليل… ⌘ K');
});

test('an explicit English choice survives reload and navigation', async ({ page }) => {
  await page.goto('/#docs/getting-started');
  await page.locator('[data-action="locale"]').click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Getting started');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await page.goto('/#docs/accessibility');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Accessibility');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('dark mode loads the white sidebar wordmark without a light backing', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('nasaq-mode', 'dark'));
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-nq-mode', 'dark');
  const logo = page.locator('.sidebar .brand img');
  await expect(logo).toHaveAttribute('src', /\/nasaq-wordmark-white\.svg$/);
  await expect.poll(() => logo.evaluate(image =>
    image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0,
  )).toBe(true);
  await expect(logo).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
});

test('guide search supports keyboard selection, navigation and focus return', async ({ page }) => {
  await page.goto('/#docs/getting-started');
  const trigger = page.locator('.topbar [data-action="search-components"]');
  await trigger.focus();
  await page.keyboard.press('ControlOrMeta+k');
  const dialog = page.getByRole('dialog', { name: 'ابحث في دليل نسق' });
  const query = dialog.getByRole('combobox');
  const options = dialog.getByRole('option');
  await expect(query).toBeFocused();
  await query.press('ArrowDown');
  await expect(options.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(query).toHaveAttribute('aria-activedescendant', (await options.nth(1).getAttribute('id'))!);
  await query.press('End');
  await expect(options.last()).toHaveAttribute('aria-selected', 'true');
  await query.press('Home');
  await expect(options.first()).toHaveAttribute('aria-selected', 'true');
  await query.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();

  await page.keyboard.press('/');
  await expect(query).toBeFocused();
  await query.fill('Date picker');
  await expect(options.first()).toContainText('اختيار تاريخ');
  await query.press('Enter');
  await expect(dialog).not.toBeVisible();
  await expect(page).toHaveURL(/#component\/date-picker$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('اختيار تاريخ');
});

test('mobile navigation contains focus and restores the page on close', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#docs/getting-started');
  const menu = page.locator('.mobile-menu');
  const sidebar = page.locator('#site-navigation');
  const close = sidebar.locator('.sidebar-close');
  const pageContent = page.locator('.main-shell');
  await expect(sidebar).not.toBeVisible();
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(sidebar).toBeVisible();
  await expect(pageContent).toHaveAttribute('inert', '');
  await expect(close).toBeFocused();

  const firstLink = sidebar.locator('.brand');
  const lastLink = sidebar.locator('.sidebar-github');
  await lastLink.focus();
  await page.keyboard.press('Tab');
  await expect(firstLink).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(lastLink).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(sidebar).not.toBeVisible();
  await expect(pageContent).not.toHaveAttribute('inert');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeFocused();

  await menu.click();
  await close.click();
  await expect(sidebar).not.toBeVisible();
  await expect(pageContent).not.toHaveAttribute('inert');
  await expect(menu).toBeFocused();
});
