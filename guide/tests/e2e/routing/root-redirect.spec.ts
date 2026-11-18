import { test, expect, hydrated, keepRootDocument, presetStorage } from '../support/fixtures';
import { available } from '../support/routes';
// @ts-expect-error: plain ES module of the build scripts, without type declarations.
import { mapLegacyHash } from '../../../scripts/index-html/legacy-hash.mjs';

const target = (hash: string, lang: 'ar' | 'en'): RegExp => {
  const path = mapLegacyHash(hash, lang, available) as string;
  return new RegExp(`/hawiyah/${path.replace(/\/$/, '')}/?$`);
};

const addresses = [
  { url: './', hash: '' },
  { url: './#component/button', hash: '#component/button' },
  { url: './#component/accordion', hash: '#component/accordion' },
  { url: './#docs/react', hash: '#docs/react' },
  { url: './?preview=template#templates/service', hash: '#templates/service' },
  { url: 'index.html#components', hash: '#components' },
];

const sources: { name: string; lang: 'ar' | 'en'; storage?: Record<string, string>; locale: string }[] = [
  { name: 'guide language key', lang: 'en', storage: { 'hawiyah-guide-lang': 'en', 'hawiyah-locale': 'ar' }, locale: 'ar-SA' },
  { name: 'old guide language key', lang: 'en', storage: { 'hawiyah-locale': 'en' }, locale: 'ar-SA' },
  { name: 'browser language', lang: 'en', locale: 'en-GB' },
  { name: 'Arabic browser language', lang: 'ar', locale: 'ar-SA' },
  { name: 'default', lang: 'ar', locale: 'fr-FR' },
];

for (const source of sources) {
  test.describe(`root redirect by ${source.name}`, () => {
    test.use({ locale: source.locale });

    for (const address of addresses) {
      test(`${address.url}`, async ({ page }) => {
        if (source.storage) await presetStorage(page, source.storage);
        await page.goto(address.url);
        await expect(page).toHaveURL(target(address.hash, source.lang));
        await expect(page.locator('html')).toHaveAttribute('lang', source.lang);
        expect(page.url()).not.toContain('preview=template');
      });
    }
  });
}

test.describe('root document', () => {
  test('the prerendered document offers both languages and the attribution in both languages', async ({ request }) => {
    const response = await request.get('./');
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toMatch(/<html lang="ar" dir="rtl"/);
    expect(html).toContain('<noscript><meta http-equiv="refresh" content="0; url=ar/"></noscript>');
    expect(html.indexOf('<noscript>')).toBeLessThan(html.indexOf('<link'));
    expect(html).not.toContain('rel="canonical"');
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toMatch(/href="ar\/"[^>]*lang="ar"/);
    expect(html).toMatch(/href="en\/"[^>]*lang="en"/);
    expect(html).toContain('تم التطوير بواسطة فريق التطوير في قطاع المنصات الوطنية - مركز المعلومات الوطني');
    expect(html).toContain('Developed by the Development Team in the National Platforms Sector — National Information Center');
    expect(html.match(/class="nic-logo"/g)).toHaveLength(1);
  });

  test('hydrates the language choice when the redirect is held back', async ({ page }) => {
    await keepRootDocument(page);
    await page.goto('./');
    await hydrated(page);
    await expect(page).toHaveURL(/\/hawiyah\/$/);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1 img[alt="هوية"]').first()).toHaveAttribute('lang', 'ar');
    await expect(page.locator('h1 [lang="en"]')).toHaveText('Hawiyah');
    await expect(page.getByRole('link', { name: 'العربية' })).toHaveAttribute('lang', 'ar');
    await expect(page.getByRole('link', { name: 'English' })).toHaveAttribute('lang', 'en');
    await expect(page).toHaveTitle('هوية · Hawiyah');
    await page.getByRole('link', { name: 'English' }).click();
    await expect(page).toHaveURL(target('', 'en'));
  });
});

test.describe('without script', () => {
  test.use({ javaScriptEnabled: false });

  test('the root leads to the Arabic guide', async ({ page }) => {
    await page.goto('./');
    await expect(page).toHaveURL(target('', 'ar'));
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    if (available.landing) await expect(page.locator('h1')).toHaveCount(1);
  });
});
