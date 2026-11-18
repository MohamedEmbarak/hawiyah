import { test, expect } from '../support/fixtures';

// With JavaScript disabled, the prerendered component pages carry their content, the
// native Angular example and the listings: nothing on these pages is rendered in the
// browser only.

test.use({ javaScriptEnabled: false });

const TEXT = {
  en: { title: 'Button', label: 'Continue', result: 'Result', status: 'Rendered with @hawiyah/angular 0.3.0 from npm', variants: 'Save draft' },
  ar: { title: 'زر', label: 'متابعة', result: 'النتيجة', status: 'معروض باستخدام @hawiyah/angular 0.3.0 من npm', variants: 'حفظ المسودة' },
} as const;

for (const lang of ['ar', 'en'] as const) {
  const t = TEXT[lang];

  test(`brief view without JavaScript (${lang})`, async ({ page }) => {
    const response = await page.goto(`${lang}/components/button/`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(t.title);
    const result = page.getByRole('group', { name: t.result });
    // The generated native Angular example (guide-example-button-primary) is in the HTML.
    const example = result.locator('guide-example-button-primary button.hw-button');
    await expect(example).toHaveText(t.label);
    await expect(example).toHaveAttribute('data-variant', 'primary');
    await expect(example).toHaveAttribute('type', 'button');
    await expect(page.locator('guide-example-block p.status')).toHaveText(t.status);
    await expect(page.locator('guide-example-block pre code', { hasText: 'hwButton' })).toHaveCount(1);
    await expect(page.locator('guide-example-block [role="tabpanel"]:visible pre code')).toContainText('hwButton');
    await expect(page.locator('guide-example-block [role="tab"]')).toHaveCount(4);
  });

  test(`reference view without JavaScript (${lang})`, async ({ page }) => {
    await page.goto(`${lang}/components/button/reference/`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(t.title);
    await expect(page.locator('main article > h2')).toHaveCount(6);
    await expect(page.getByRole('group', { name: t.result })).toHaveCount(5);
    await expect(page.getByRole('group', { name: t.result }).nth(1).getByRole('button', { name: t.variants })).toBeVisible();
    await expect(page.locator('main table')).toHaveCount(5);
    await expect(page.locator('main table caption').first()).not.toBeEmpty();
    await expect(page.locator('hw-content-navigation a').first()).toHaveAttribute('href', /#example$/);
    await expect(page.locator('main pre')).not.toHaveCount(0);
  });
}
