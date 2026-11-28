import { test, expect, hydrated, markDocument, sameDocument } from '../support/fixtures';
import { pageModel } from '../support/routes';

// Button brief and reference views in Arabic and English (contentPipeline.pilots.button,
// editor.pageBlock): content from docs/components/button(.ar).md, the native Angular
// result, the framework tabs with their listings, download and the stored framework.
// What every component page shares (outline, content navigation, framework tabs and
// editor links of every group, tables) is checked from the page model by
// pages/component-page.spec.ts; counts and positions here are read from the model too.

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
    referenceTitle: 'مرجع المكوّن: زر · هوية',
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
const PACKAGES = ['vanilla', 'react', 'vue', 'angular'];

for (const lang of ['ar', 'en'] as const) {
  const t = TEXT[lang];
  const model = pageModel('button', lang);
  /** Position of a live group on the reference view. */
  const at = (example: string) => {
    const index = model.liveGroups.indexOf(example);
    if (index < 0) throw new Error(`button (${lang}) has no live group ${example}`);
    return index;
  };

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

    test('framework tabs: order, Angular selected, listings, download and the editor link', async ({ page, request }) => {
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
      const editor = panel.getByRole('link', { name: lang === 'ar' ? 'فتح في المحرر' : 'Open in the editor' });
      await expect(editor).toHaveCount(1);
      await expect(editor).toHaveAttribute('href', `${lang}/editor/?example=button%2Fprimary&framework=angular`);

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
        await expect(shown.getByRole('link', { name: lang === 'ar' ? 'فتح في المحرر' : 'Open in the editor' })).toHaveAttribute(
          'href',
          `${lang}/editor/?example=button%2Fprimary&framework=${PACKAGES[index]}`,
        );
        if (name === 'JavaScript') await expect(shown.locator('figcaption')).toHaveText([/index\.html/, /main\.js/]);
        const result = block.getByRole('group', { name: t.result });
        if (name === 'Angular') {
          await expect(result.getByRole('button', { name: t.label })).toBeVisible();
          await expect(block.locator('p.status')).toHaveText(t.status);
        } else {
          // The frame provider shows the other frameworks in a sandboxed frame.
          await expect(result.locator('guide-frame-result iframe')).toBeVisible();
          await expect(block.locator('p.status')).toHaveText(t.status.replace('@hawiyah/angular', `@hawiyah/${PACKAGES[index]}`), { timeout: 30_000 });
          await expect(result.frameLocator('guide-frame-result iframe').getByRole('button', { name: t.label })).toBeVisible();
        }
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

    test('reference view: sections, the results of the variants and states, tables and note', async ({ page }) => {
      await page.goto(`${lang}/components/button/reference/`);
      await hydrated(page);
      await expect(page).toHaveTitle(t.referenceTitle);
      const article = page.locator('main article.hw-prose');
      await expect(article.getByRole('heading', { level: 1 })).toHaveText(t.title);
      await expect(article.locator(':scope > h2')).toHaveText([...t.sections]);
      const navigation = page.getByRole('navigation', { name: t.onThisPage });
      await expect(navigation.getByRole('link', { name: t.sections[2], exact: true })).toHaveAttribute('href', /#api$/);

      const results = page.getByRole('group', { name: t.result });
      await expect(results).toHaveCount(model.liveGroups.length);
      await expect(results.nth(at('loading')).getByRole('button')).toBeDisabled();
      await expect(results.nth(at('loading')).getByRole('button')).toHaveAttribute('aria-busy', 'true');
      await expect(results.nth(at('disabled')).getByRole('button')).toBeDisabled();
      await expect(results.nth(at('variants')).getByRole('button')).toHaveCount(5);
      await expect(results.nth(at('sizes')).getByRole('button')).toHaveCount(3);

      const tables = article.getByRole('table');
      await expect(tables).toHaveCount(model.tables.length);
      for (const name of ['React', 'Vue', 'Angular']) {
        await expect(page.locator('h3', { hasText: name }).first()).toBeVisible();
      }
      await expect(article.getByRole('region').filter({ has: page.getByRole('table') })).toHaveCount(model.tables.length);
      await expect(article.locator('hw-alert[role="note"]')).toHaveCount(1);
      await expect(article.locator('hw-alert[role="note"]')).toContainText(t.note);
      await expect(article.locator('code.hw-code').first()).toBeVisible();
      const external = article.locator('a[target="_blank"]');
      for (const link of await external.all()) await expect(link).toHaveAttribute('rel', /noopener/);
    });

    test('API tables at 390 and 320 px: inline code is the published chip and the page does not overflow', async ({ page }) => {
      // The guide shows hw-code exactly as published (plan D-A): a value in a table cell
      // may break into fragments (package defect, CHANGELOG.md, Known defects in 0.3.0).
      await page.goto(`${lang}/components/button/reference/`);
      await hydrated(page);
      for (const width of [390, 320]) {
        await page.setViewportSize({ width, height: 800 });
        const result = await page.evaluate(() => {
          const codes = Array.from(document.querySelectorAll<HTMLElement>('guide-table td code'));
          return {
            codes: codes.length,
            classes: [...new Set(codes.map((code) => code.className))],
            overflow: document.scrollingElement!.scrollWidth - innerWidth,
          };
        });
        expect(result.codes).toBeGreaterThan(0);
        expect(result.classes).toEqual(['hw-code']);
        expect(result.overflow, `page overflow at ${width} px`).toBe(0);
      }
    });

    test('the list of this page and the API tables are spaced as blocks of the prose flow', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(`${lang}/components/button/reference/`);
      await hydrated(page);
      const gaps = await page.evaluate(() => {
        const box = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
        const summary = box('main article > p');
        const toc = box('main article > .toc');
        const api = box('main article > h2#api');
        const javascript = box('main article h3#javascript');
        const table = document.querySelector('main article h3#javascript ~ guide-table')!.getBoundingClientRect();
        return { summaryToList: toc.top - summary.bottom, apiToJavascript: javascript.top - api.bottom, headingToTable: table.top - javascript.bottom };
      });
      // var(--hw-space-4) = 16 px between blocks, var(--hw-space-3) = 12 px after a heading.
      expect(gaps.summaryToList).toBeGreaterThanOrEqual(15);
      expect(gaps.apiToJavascript).toBeGreaterThanOrEqual(11);
      expect(gaps.headingToTable).toBeGreaterThanOrEqual(11);
    });

    test('side navigation from 64rem and the navigation drawer below it', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(`${lang}/components/button/reference/`);
      await hydrated(page);
      const side = page.locator('hw-side-navigation');
      await expect(side).toBeVisible();
      await expect(side).toHaveAttribute('aria-label', t.sideNav);
      await expect(side.getByRole('link', { name: t.title, exact: true })).toHaveAttribute('aria-current', 'page');
      const opener = page.getByRole('button', { name: t.sideNav });
      await expect(opener).toBeHidden();

      await page.setViewportSize({ width: 390, height: 800 });
      await expect(side).toBeHidden();
      await expect(opener).toBeVisible();
      await expect(opener).toHaveAttribute('aria-haspopup', 'dialog');
      await opener.click();
      const dialog = page.getByRole('dialog', { name: t.sideNav });
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole('link', { name: t.title, exact: true })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      await expect(opener).toBeFocused();
    });

    test('client navigation from the catalogue to the brief and to the reference', async ({ page }) => {
      await page.goto(`${lang}/components/`);
      await hydrated(page);
      await markDocument(page);
      await page.locator('main').getByRole('link', { name: t.title, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`/${lang}/components/button/?$`));
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(t.title);
      await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
      await expect(page.getByRole('group', { name: t.result }).getByRole('button', { name: t.label })).toBeVisible();
      await expect(page.locator('guide-example-block').getByRole('tabpanel').locator('pre code')).toContainText('hwButton');
      await page.getByRole('link', { name: t.fullReference }).click();
      await expect(page).toHaveURL(new RegExp(`/${lang}/components/button/reference/?$`));
      await expect(page.locator('guide-example-block')).toHaveCount(model.liveGroups.length);
      // Highlighted in the browser after a client navigation: the token spans are there.
      await expect(page.locator('guide-example-block .hw-code-token-tag').first()).toBeAttached();
      await expect(page.locator('guide-example-block').first().getByRole('tabpanel').locator('.hw-code-token-keyword').first()).toBeVisible();
      expect(await sameDocument(page)).toBe(true);
      await expect(page).toHaveTitle(t.referenceTitle);
    });
  });
}
