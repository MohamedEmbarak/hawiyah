import { test, expect, hydrated } from '../support/fixtures';
import { documentModel, languagePages, navigation, type IndexedDocument, type Lang } from '../support/routes';

// Guides (docs/guides) and templates (docs/templates): their index pages and every page
// of the build, in both languages. The deployed guide may have none yet; the fixture of
// scripts/test/kinds (built with --docs) has one of each. Axe in both colour modes at
// 1280 and 390 px and the overflow checks run on these pages through the suites over
// every prerendered page (shell/a11y.spec.ts); the first test proves they are among them.

const KINDS = [
  { kind: 'guide', route: 'guides', pages: navigation.guides ?? [], title: { en: 'Guides', ar: 'الأدلة' }, empty: { en: 'No guide has been published in this guide yet.', ar: 'لم يُنشر بعد أي دليل في هذا الموقع.' } },
  { kind: 'template', route: 'templates', pages: navigation.templates ?? [], title: { en: 'Templates', ar: 'القوالب' }, empty: { en: 'No template has been published in this guide yet.', ar: 'لم يُنشر بعد أي قالب في هذا الموقع.' } },
] as const;
const LANGS: Lang[] = ['ar', 'en'];
const built = (pages: readonly IndexedDocument[], lang: Lang) => pages.filter((entry) => entry.langs.includes(lang));

test('the index and every page of both kinds are among the prerendered pages of the suites over every page', () => {
  const routes = languagePages.map((doc) => doc.route);
  for (const { route, pages } of KINDS) {
    for (const lang of LANGS) {
      expect(routes).toContain(`${lang}/${route}`);
      for (const entry of built(pages, lang)) expect(routes).toContain(`${lang}/${route}/${entry.slug}`);
    }
  }
});

for (const { kind, route, pages, title, empty } of KINDS) {
  for (const lang of LANGS) {
    test(`${lang}/${route}/: the index names every built ${kind} in the order of its index.json`, async ({ page }) => {
      await page.goto(`${lang}/${route}/`);
      await hydrated(page);
      await expect(page.locator('h1')).toHaveText(title[lang]);
      const entries = built(pages, lang);
      if (entries.length === 0) {
        await expect(page.getByText(empty[lang], { exact: true })).toBeVisible();
        return;
      }
      const links = page.locator('main hw-card h2 a');
      await expect(links).toHaveText(entries.map((entry) => entry.title[lang]));
      for (const [index, entry] of entries.entries()) {
        await expect(links.nth(index)).toHaveAttribute('href', `${lang}/${route}/${entry.slug}/`);
        await expect(page.locator('main hw-card').nth(index)).toContainText(entry.summary[lang]);
      }
    });

    for (const entry of built(pages, lang)) {
      const path = `${lang}/${route}/${entry.slug}/`;
      test(`${path}: prerendered and hydrated with its headings, its content navigation and its live groups`, async ({ page, request }) => {
        const model = documentModel(entry.id, lang);
        const html = await (await request.get(path)).text();
        expect(html.match(/<h1\b/g)?.length, 'h1 elements in the prerendered document').toBe(1);
        expect(html).toContain(model.title);
        await page.goto(path);
        await hydrated(page);
        await expect(page.locator('h1')).toHaveText(model.title);
        await expect(page.locator('main article > h2')).toHaveText(model.headings.filter((heading) => heading.level === 2).map((heading) => heading.text));
        await expect(page.locator('hw-content-navigation a').first()).toHaveAttribute('href', new RegExp(`#${model.headings[0]?.id}$`));
        const blocks = page.locator('guide-example-block');
        await expect(blocks).toHaveCount(entry.examples.length);
        for (const [index, group] of entry.examples.entries()) {
          const block = blocks.nth(index);
          if (kind === 'template') {
            // A template's group is a state of the page: its four results stand in frames.
            await expect(block.locator('iframe')).toHaveCount(1);
            await expect(block.locator('guide-native-result')).toHaveCount(0);
          } else {
            await expect(block.locator(`guide-native-result guide-example-${entry.id.replace(':', '_')}-${group.example}`)).toHaveCount(1);
          }
          await expect(block.locator('p.status')).not.toBeEmpty();
        }
        await expect(page.locator('main')).toHaveCount(1);
        await expect(page.locator('h1')).toHaveCount(1);
      });

      test(`${path}: a deep link to a section and the links to other pages lead to built pages`, async ({ page, request }) => {
        const model = documentModel(entry.id, lang);
        const section = model.headings.find((heading) => heading.level === 2)!;
        await page.goto(`${path}#${section.id}`);
        await hydrated(page);
        await expect(page.locator(`[id="${section.id}"]`)).toBeInViewport();
        const internal = await page.locator('main article a[href^="ar/"], main article a[href^="en/"]').evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
        for (const href of new Set(internal.map((value) => value.split('#')[0]!))) {
          expect((await request.get(href)).status(), href).toBe(200);
        }
      });
    }
  }
}

for (const lang of LANGS) {
  test(`keyboard path through the header to the guides and the templates (${lang})`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const names = lang === 'ar' ? ['الأدلة', 'القوالب'] : ['Guides', 'Templates'];
    for (const [index, name] of names.entries()) {
      // From the start of the document: the skip link, the home link, Components, then the entry.
      await page.goto(`${lang}/components/`);
      await hydrated(page);
      const route = KINDS[index]!.route;
      const link = page.locator('hw-portal-header').getByRole('link', { name, exact: true });
      for (let presses = 0; presses < 3 + index + 1; presses += 1) await page.keyboard.press('Tab');
      await expect(link).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(new RegExp(`/${lang}/${route}/?$`));
      await expect(page.locator('h1')).toBeFocused();
      await expect(link).toHaveAttribute('aria-current', 'page');
    }
  });
}
