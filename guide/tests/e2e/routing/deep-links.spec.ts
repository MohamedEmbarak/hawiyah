import { test, expect, hydrated } from '../support/fixtures';
import { available, languagePages } from '../support/routes';

// The language root shows the landing page when the landing feature is built (stage 4b),
// and leads to the component catalogue otherwise.
const languageRoot = (lang: 'ar' | 'en'): RegExp =>
  new RegExp(available.landing ? `/hawiyah/${lang}/?$` : `/hawiyah/${lang}/components/?$`);

for (const target of languagePages) {
  test(`deep link ${target.href}`, async ({ page }) => {
    const response = await page.goto(target.href);
    expect(response?.status()).toBe(200);
    await hydrated(page);
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', target.lang);
    await expect(html).toHaveAttribute('dir', target.lang === 'ar' ? 'rtl' : 'ltr');
    await expect(page.locator('base')).toHaveAttribute('href', '/hawiyah/');
    await expect(page.locator('h1')).toHaveCount(1);
    const reload = await page.reload();
    expect(reload?.status()).toBe(200);
    await hydrated(page);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(html).toHaveAttribute('lang', target.lang);
  });

  test(`deep link without trailing slash ${target.route}`, async ({ page }) => {
    const response = await page.goto(target.route);
    expect(response?.status()).toBe(200);
    expect(response?.request().redirectedFrom()?.url()).toMatch(new RegExp(`/${target.route}$`));
    await expect(page).toHaveURL(new RegExp(`/${target.route}/?$`));
    await hydrated(page);
  });
}

for (const lang of ['ar', 'en'] as const) {
  test(`language root ${lang}/ shows the landing page or leads to the components page`, async ({ page }) => {
    await page.goto(`${lang}/`);
    await expect(page).toHaveURL(languageRoot(lang));
    await hydrated(page);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
  });

  test(`catalogue head and content (${lang})`, async ({ page }) => {
    await page.goto(`${lang}/components/`);
    await hydrated(page);
    await expect(page).toHaveTitle(lang === 'ar' ? 'المكوّنات · هوية' : 'Components · Hawiyah');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://mohamedembarak.github.io/hawiyah/${lang}/components/`);
    for (const alt of ['ar', 'en']) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${alt}"]`)).toHaveAttribute(
        'href',
        `https://mohamedembarak.github.io/hawiyah/${alt}/components/`,
      );
    }
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute('href', 'https://mohamedembarak.github.io/hawiyah/');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('h1')).toHaveText(lang === 'ar' ? 'المكوّنات' : 'Components');
  });
}
