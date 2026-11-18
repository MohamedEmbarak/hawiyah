import { test, expect, hydrated, markDocument, sameDocument } from '../support/fixtures';

// Button brief and reference views in Arabic and English (contentPipeline.pilots.button,
// editor.pageBlock): content from docs/components/button(.ar).md, the native Angular
// result, the framework tabs with their listings, download and the stored framework.

const TEXT = {
  en: {
    title: 'Button',
    briefTitle: 'Button · Hawiyah',
    referenceTitle: 'Button reference · Hawiyah',
    label: 'Continue',
    result: 'Result',
    frameworks: 'Framework',
    status: 'Rendered with @hawiyah/angular 0.3.0 from npm',
    fullReference: 'Full reference',
    onThisPage: 'On this page',
    sideNav: 'Component pages',
    close: 'Close',
    download: 'Download',
    copy: 'Copy code',
    note: 'Note',
    sections: ['Example', 'Variants and states', 'API', 'Accessibility', 'RTL and localisation', 'Platforms Code reference'],
  },
  ar: {
    title: 'زر',
    briefTitle: 'زر · هوية',
    referenceTitle: 'مرجع زر · هوية',
    label: 'متابعة',
    result: 'النتيجة',
    frameworks: 'إطار العمل',
    status: 'معروض باستخدام @hawiyah/angular 0.3.0 من npm',
    fullReference: 'المرجع الكامل',
    onThisPage: 'في هذه الصفحة',
    sideNav: 'صفحات المكوّنات',
    close: 'إغلاق',
    download: 'تنزيل',
    copy: 'نسخ الشيفرة',
    note: 'ملاحظة',
    sections: ['مثال', 'الأشكال والحالات', 'الواجهة البرمجية', 'إمكانية الوصول', 'الاتجاه والتوطين', 'مرجع كود المنصات'],
  },
} as const;

const FRAMEWORKS = ['JavaScript', 'React', 'Vue', 'Angular'];
const PRIMARY_FILES = ['index.html', 'Example.tsx', 'Example.vue', 'example.component.ts'];

for (const lang of ['ar', 'en'] as const) {
  const t = TEXT[lang];

  test.describe(`button (${lang})`, () => {
    test('brief view: heading, summary, example block and link to the reference', async ({ page }) => {
      await page.goto(`${lang}/components/button/`);
      await hydrated(page);
      await expect(page).toHaveTitle(t.briefTitle);
      await expect(page.locator('html')).toHaveAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      const article = page.locator('main article.hw-prose');
      await expect(article).toHaveAttribute('lang', lang);
      await expect(article.getByRole('heading', { level: 1 })).toHaveText(t.title);
      await expect(article.getByRole('heading', { level: 1 })).toHaveAttribute('tabindex', '-1');
      await expect(article.getByRole('heading', { level: 2 })).toHaveText([t.sections[0]]);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S/);

      const blocks = page.locator('guide-example-block');
      await expect(blocks).toHaveCount(1);
      const section = blocks.locator('section.example');
      await expect(section).toHaveAttribute('aria-labelledby', 'example');
      const result = section.getByRole('group', { name: t.result });
      await expect(result.getByRole('button', { name: t.label })).toBeVisible();
      await expect(section.locator('p.status')).toHaveText(t.status);
      await expect(section.locator('p.status')).toHaveAttribute('role', 'status');
      await expect(section.locator('.status bdi')).toHaveAttribute('dir', 'ltr');

      const link = article.getByRole('link', { name: t.fullReference });
      await expect(link).toHaveAttribute('href', `${lang}/components/button/reference/`);
    });

    test('framework tabs: order, Angular selected, listings, download and no editor link', async ({ page, request }) => {
      await page.goto(`${lang}/components/button/`);
      await hydrated(page);
      const block = page.locator('guide-example-block').first();
      const tablist = block.getByRole('tablist', { name: t.frameworks });
      await expect(tablist.getByRole('tab')).toHaveText(FRAMEWORKS);
      await expect(tablist.getByRole('tab', { name: 'Angular' })).toHaveAttribute('aria-selected', 'true');
      const panel = block.getByRole('tabpanel');
      await expect(panel).toHaveCount(1);
      await expect(panel.locator('figcaption')).toHaveText([/example\.component\.ts/]);
      await expect(panel.locator('pre code')).toContainText(`<button hwButton variant="primary">${t.label}</button>`);
      await expect(panel.locator('pre code .hw-code-token-keyword').first()).toBeVisible();
      await expect(panel.getByRole('link', { name: /editor|المحرر/ })).toHaveCount(0);

      const download = panel.getByRole('link', { name: t.download });
      await expect(download).toHaveAttribute('href', `examples/button/${lang}/primary/angular/example.component.ts`);
      await expect(download).toHaveAttribute('download', 'example.component.ts');
      const file = await request.get(`examples/button/${lang}/primary/angular/example.component.ts`);
      expect(file.status()).toBe(200);
      expect(await file.text()).toContain('@hawiyah/angular');

      for (const [index, name] of FRAMEWORKS.entries()) {
        await tablist.getByRole('tab', { name }).click();
        const shown = block.getByRole('tabpanel');
        await expect(shown.locator('figcaption').first()).toContainText(PRIMARY_FILES[index] ?? '');
        if (name === 'JavaScript') await expect(shown.locator('figcaption')).toHaveText([/index\.html/, /main\.js/]);
        // Without the frame provider of stage 4b the Angular result stays shown.
        await expect(block.getByRole('group', { name: t.result }).getByRole('button', { name: t.label })).toBeVisible();
        await expect(block.locator('p.status')).toHaveText(t.status);
      }
    });

    test('remembers the selected framework and applies it after hydration', async ({ page }) => {
      await page.goto(`${lang}/components/button/`);
      await hydrated(page);
      const tab = (name: string) => page.locator('guide-example-block').first().getByRole('tab', { name });
      await tab('Vue').click();
      expect(await page.evaluate(() => window.localStorage.getItem('hawiyah-guide-framework'))).toBe('vue');
      await page.reload();
      await hydrated(page);
      await expect(tab('Vue')).toHaveAttribute('aria-selected', 'true');
      await tab('Angular').click();
      expect(await page.evaluate(() => window.localStorage.getItem('hawiyah-guide-framework'))).toBe('angular');
    });

    test('reference view: sections, content navigation, every live group, tables and note', async ({ page }) => {
      await page.goto(`${lang}/components/button/reference/`);
      await hydrated(page);
      await expect(page).toHaveTitle(t.referenceTitle);
      const article = page.locator('main article.hw-prose');
      await expect(article.getByRole('heading', { level: 1 })).toHaveText(t.title);
      await expect(article.locator(':scope > h2')).toHaveText([...t.sections]);
      for (const heading of await article.locator(':scope > h2, guide-blocks h3, guide-blocks h4').all()) {
        await expect(heading).toHaveAttribute('id', /^[a-z0-9-]+$/);
        await expect(heading).toHaveAttribute('tabindex', '-1');
      }
      const navigation = page.getByRole('navigation', { name: t.onThisPage });
      await expect(navigation.getByRole('link')).toHaveCount(6 + 4 + 4 + 2);
      await expect(navigation.getByRole('link', { name: t.sections[2] })).toHaveAttribute('href', /#api$/);

      const blocks = page.locator('guide-example-block');
      await expect(blocks).toHaveCount(5);
      for (const [index, heading] of ['example', 'variants', 'sizes', 'loading', 'disabled'].entries()) {
        await expect(blocks.nth(index).locator('section.example')).toHaveAttribute('aria-labelledby', heading);
      }
      const results = page.getByRole('group', { name: t.result });
      await expect(results).toHaveCount(5);
      await expect(results.nth(3).getByRole('button')).toBeDisabled();
      await expect(results.nth(3).getByRole('button')).toHaveAttribute('aria-busy', 'true');
      await expect(results.nth(4).getByRole('button')).toBeDisabled();
      await expect(results.nth(1).getByRole('button')).toHaveCount(5);
      await expect(results.nth(2).getByRole('button')).toHaveCount(3);

      const tables = article.getByRole('table');
      await expect(tables).toHaveCount(5);
      for (const name of ['React', 'Vue', 'Angular']) {
        await expect(page.locator('h3', { hasText: name }).first()).toBeVisible();
      }
      await expect(article.getByRole('region').filter({ has: page.getByRole('table') })).toHaveCount(5);
      await expect(article.locator('hw-alert[role="note"]')).toHaveCount(1);
      await expect(article.locator('hw-alert[role="note"]')).toContainText(t.note);
      await expect(article.locator('code.hw-code').first()).toBeVisible();
      const external = article.locator('a[target="_blank"]');
      for (const link of await external.all()) await expect(link).toHaveAttribute('rel', /noopener/);
    });

    test('side navigation from 64rem and the navigation drawer below it', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(`${lang}/components/button/reference/`);
      await hydrated(page);
      const side = page.locator('hw-side-navigation');
      await expect(side).toBeVisible();
      await expect(side).toHaveAttribute('aria-label', t.sideNav);
      await expect(side.getByRole('link', { name: t.title })).toHaveAttribute('aria-current', 'page');
      const opener = page.getByRole('button', { name: t.sideNav });
      await expect(opener).toBeHidden();

      await page.setViewportSize({ width: 390, height: 800 });
      await expect(side).toBeHidden();
      await expect(opener).toBeVisible();
      await expect(opener).toHaveAttribute('aria-haspopup', 'dialog');
      await opener.click();
      const dialog = page.getByRole('dialog', { name: t.sideNav });
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole('link', { name: t.title })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      await expect(opener).toBeFocused();
    });

    test('client navigation from the catalogue to the brief and to the reference', async ({ page }) => {
      await page.goto(`${lang}/components/`);
      await hydrated(page);
      await markDocument(page);
      await page.locator('main').getByRole('link', { name: t.title }).click();
      await expect(page).toHaveURL(new RegExp(`/${lang}/components/button/?$`));
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(t.title);
      await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
      await expect(page.getByRole('group', { name: t.result }).getByRole('button', { name: t.label })).toBeVisible();
      await expect(page.locator('guide-example-block').getByRole('tabpanel').locator('pre code')).toContainText('hwButton');
      await page.getByRole('link', { name: t.fullReference }).click();
      await expect(page).toHaveURL(new RegExp(`/${lang}/components/button/reference/?$`));
      await expect(page.locator('guide-example-block')).toHaveCount(5);
      // Highlighted in the browser after a client navigation: the token spans are there.
      await expect(page.locator('guide-example-block .hw-code-token-tag').first()).toBeAttached();
      await expect(page.locator('guide-example-block').first().getByRole('tabpanel').locator('.hw-code-token-keyword').first()).toBeVisible();
      expect(await sameDocument(page)).toBe(true);
      await expect(page).toHaveTitle(t.referenceTitle);
    });
  });
}
