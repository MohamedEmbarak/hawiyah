import { test, expect, hydrated, markDocument, sameDocument } from '../support/fixtures';

const unknown = ['en/no-such-page/', 'ar/components/no-such-component/', 'fr/components/', 'deeply/nested/missing/path'];

for (const path of unknown) {
  test(`unknown path ${path} answers 404 and hydrates the bilingual page`, async ({ page, guard }) => {
    guard.allowDocument404(new RegExp(`/hawiyah/${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await hydrated(page);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1 [lang="ar"]')).toHaveText('الصفحة غير موجودة');
    await expect(page.locator('h1 [lang="en"]')).toHaveText('Page not found');
    await expect(page.locator('header')).toHaveCount(0);
    await expect(page.locator('img.nic-logo')).toHaveCount(1);
    expect(await page.evaluate(() => getComputedStyle(document.body).fontFamily)).not.toMatch(/^"?Times/);
    await expect(page).toHaveTitle('الصفحة غير موجودة · Page not found');
  });
}

test('the English link of the 404 page navigates within the application', async ({ page, guard }) => {
  guard.allowDocument404(/\/en\/no-such-page\/$/);
  await page.goto('en/no-such-page/');
  await hydrated(page);
  await markDocument(page);
  await page.getByRole('link', { name: 'English' }).click();
  await expect(page).toHaveURL(/\/hawiyah\/en\/components\/?$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('header .hw-portal-notice')).toHaveCount(1);
  expect(await sameDocument(page)).toBe(true);
});

test.describe('without script', () => {
  test.use({ javaScriptEnabled: false });

  test('the 404 document is readable in both languages', async ({ page, guard }) => {
    guard.allowDocument404(/\/en\/no-such-page\/$/);
    const response = await page.goto('en/no-such-page/');
    expect(response?.status()).toBe(404);
    await expect(page.locator('h1')).toContainText('الصفحة غير موجودة');
    await expect(page.locator('h1')).toContainText('Page not found');
    await expect(page.locator('p[lang="ar"]', { hasText: 'لا يطابق العنوان' })).toHaveCount(1);
    await expect(page.locator('p[lang="en"]', { hasText: 'The address does not match' })).toHaveCount(1);
    await expect(page.getByRole('link', { name: 'العربية' })).toHaveAttribute('href', 'ar/');
    await expect(page.getByRole('link', { name: 'English' })).toHaveAttribute('href', 'en/');
    const stylesheet = await page.evaluate(() => Array.from(document.styleSheets).some((sheet) => sheet.cssRules.length > 0));
    expect(stylesheet).toBe(true);
  });
});
