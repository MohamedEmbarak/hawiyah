import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { catalog } from '../../apps/playground/src/data';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('nasaq-locale', 'en');
    localStorage.setItem('nasaq-mode', 'light');
  });
});

test('getting started links to real framework setup and every catalog entry has a complete live reference', async ({ page }) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/#docs/getting-started');
  await expect(page.getByRole('heading', { name: 'Getting started', exact: true })).toBeVisible();
  await expect(page.locator('.guide-article')).toContainText('npm install @nasaq/styles @nasaq/react');
  await page.locator('.guide-choice[href="#docs/react"]').click();
  await expect(page.getByRole('heading', { name: 'A controlled field' })).toBeVisible();
  for (const [id, name] of catalog) {
    await page.evaluate(id => { location.hash = `component/${id}`; }, id);
    await expect(page.locator('.component-guide-header h1')).toHaveText(name);
    expect(await page.locator('[data-guide-canvas] > *').count(), id).toBeGreaterThan(0);
    await expect(page.locator('#component-usage pre code')).not.toBeEmpty();
    expect(await page.locator('#component-api tbody tr').count(), id).toBeGreaterThan(0);
    expect(await page.locator('#component-lifecycle li').count(), id).toBeGreaterThan(0);
    expect(await page.locator('#component-accessibility li').count(), id).toBeGreaterThan(0);
  }
  expect(errors).toEqual([]);
});

test('a component reference can mount, interact, reset and remount its controller', async ({ page }) => {
  await page.goto('/#component/password-field');
  const field = page.locator('[data-guide-canvas] input');
  await field.fill('example-password');
  await page.locator('[data-guide-canvas] [data-nq-password-toggle]').click();
  await expect(field).toHaveAttribute('type', 'text');
  await page.locator('[data-action=reset-component-demo]').click();
  await expect(field).toHaveAttribute('type', 'password');
  await page.evaluate(() => { location.hash = 'docs/lifecycle'; });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('State & component lifecycle');
  await page.evaluate(() => { location.hash = 'component/password-field'; });
  await page.locator('[data-guide-canvas] [data-nq-password-toggle]').click();
  await expect(field).toHaveAttribute('type', 'text');
});

test('component documentation is accessible and fits a narrow RTL viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#component/date-picker');
  await page.locator('[data-action="locale"]').click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.locator('[data-guide-tab=code]').click();
  await expect(page.locator('#component-usage')).toBeVisible();
  const scan = await new AxeBuilder({ page }).include('.component-guide-layout')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(scan.violations).toEqual([]);
});
