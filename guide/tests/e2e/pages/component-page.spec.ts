import type { Locator } from '@playwright/test';
import { test, expect, hydrated } from '../support/fixtures';
import { inlineText, navigation, pageModel, type Lang } from '../support/routes';

// Every component page of the build, in both languages, checked from the navigation
// index and the page model (src/generated/content/): the outline, the framework tabs and
// editor links of every live group, and every table, the keyboard table included (also
// under the example of the brief view, 5a.8). What is
// specific to one page stays in its own spec (pages/button.spec.ts, tabs/tabs.spec.ts).

const TEXT = {
  en: { frameworks: 'Framework', fullReference: 'Full reference', onThisPage: 'On this page', result: 'Result' },
  ar: { frameworks: 'إطار العمل', fullReference: 'المرجع الكامل', onThisPage: 'في هذه الصفحة', result: 'النتيجة' },
} as const;

const FRAMEWORKS = ['JavaScript', 'React', 'Vue', 'Angular'];
const PACKAGES = ['vanilla', 'react', 'vue', 'angular'];

const editorHref = (lang: Lang, id: string, example: string, framework: string) => `${lang}/editor/?example=${id}%2F${example}&framework=${framework}`;
const squeeze = (text: string | null) => (text ?? '').replace(/\s+/g, ' ').trim();

/** The framework tabs of an example block: order, Angular selected, and the editor link of each framework. */
async function expectFrameworkTabs(block: Locator, lang: Lang, id: string, example: string): Promise<void> {
  const tablist = block.getByRole('tablist', { name: TEXT[lang].frameworks });
  await expect(tablist.getByRole('tab')).toHaveText(FRAMEWORKS);
  await expect(tablist.getByRole('tab', { name: 'Angular', exact: true })).toHaveAttribute('aria-selected', 'true');
  // Every panel is in the document (hidden but the selected one): one editor link each.
  const links = block.locator('[role="tabpanel"] a[href*="/editor/?"]');
  await expect(links).toHaveCount(4);
  const hrefs = await links.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')));
  expect(hrefs, `${id}/${example} editor links`).toEqual(PACKAGES.map((framework) => editorHref(lang, id, example, framework)));
}

for (const entry of navigation.pages) {
  for (const lang of entry.langs) {
    const t = TEXT[lang];
    const model = pageModel(entry.id, lang);
    const h2 = model.headings.filter((heading) => heading.level === 2);

    test.describe(`component page ${entry.id} (${lang})`, () => {
      test('brief view: outline, the first live group, its framework tabs and editor links', async ({ page }) => {
        await page.goto(`${lang}/components/${entry.id}/`);
        await hydrated(page);
        await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', entry.summary[lang]);
        const article = page.locator('main article.hw-prose');
        await expect(article).toHaveAttribute('lang', lang);
        await expect(article.getByRole('heading', { level: 1 })).toHaveText(entry.title[lang]);
        await expect(article.getByRole('heading', { level: 1 })).toHaveAttribute('tabindex', '-1');
        await expect(article.getByRole('heading', { level: 2 })).toHaveText([h2[0]?.text ?? '']);
        const blocks = page.locator('guide-example-block');
        await expect(blocks).toHaveCount(1);
        const [first] = entry.examples;
        expect(first, 'a component page has a live group').toBeDefined();
        await expect(blocks.locator('section.example')).toHaveAttribute('aria-labelledby', first?.section ?? '');
        await expect(blocks.getByRole('group', { name: t.result })).toHaveCount(1);
        await expectFrameworkTabs(blocks, lang, entry.id, first?.example ?? '');
        // The keyboard table of the Accessibility section, under the example, from the same model (5a.8).
        const keyboard = model.tables.find((table) => table.keyboard);
        const marker = lang === 'en' ? /^Keyboard interaction of / : /^التفاعل من لوحة المفاتيح مع المكوّن: /;
        await expect(article.locator(':scope > guide-blocks table caption').filter({ hasText: marker })).toHaveCount(keyboard ? 1 : 0);
        if (keyboard) {
          const tables = article.getByRole('table', { name: keyboard.caption, exact: true });
          await expect(tables).toHaveCount(1);
          await expect(tables.locator('caption')).toHaveText(keyboard.caption);
          const keys = await tables.locator('kbd').evaluateAll((nodes) => nodes.map((node) => [node.textContent, node.className]));
          const expected = keyboard.rows.flatMap((row) => (row['c0'] ?? []).filter((node) => node.type === 'kbd').map((node) => [node.value, 'hw-kbd']));
          expect(keys, 'the keys of the keyboard table, each kbd.hw-kbd').toEqual(expected);
          expect(keys.length).toBeGreaterThan(0);
        }
        await expect(article.getByRole('link', { name: t.fullReference, exact: true })).toHaveAttribute('href', `${lang}/components/${entry.id}/reference/`);
      });

      test('reference view: outline, content navigation, every live group with its framework tabs and editor links', async ({ page }) => {
        await page.goto(`${lang}/components/${entry.id}/reference/`);
        await hydrated(page);
        const article = page.locator('main article.hw-prose');
        await expect(article.getByRole('heading', { level: 1 })).toHaveText(entry.title[lang]);
        await expect(article.locator(':scope > h2')).toHaveText(h2.map((heading) => heading.text));
        // The headings of the page itself: a heading that a rendered example holds (the title of a
        // card) belongs to the example, has no id and is not in the outline.
        const outline = await article.locator(':scope > h2, guide-blocks h3:not(guide-example-block h3), guide-blocks h4:not(guide-example-block h4), guide-evidence-panel h3').evaluateAll((nodes) => nodes.map((node) => [node.localName, node.id, node.getAttribute('tabindex'), node.textContent?.replace(/\s+/g, ' ').trim()]));
        expect(outline).toEqual(model.headings.map((heading) => [`h${heading.level}`, heading.id, '-1', heading.text]));

        // Each h2 with the h3 headings under it.
        const navigationLinks = page.getByRole('navigation', { name: t.onThisPage }).getByRole('link');
        const listed = model.headings.filter((heading) => heading.level <= 3);
        await expect(navigationLinks).toHaveCount(listed.length);
        const hrefs = await navigationLinks.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')?.replace(/^.*#/, '')));
        expect(hrefs).toEqual(listed.map((heading) => heading.id));

        const blocks = page.locator('guide-example-block');
        await expect(blocks).toHaveCount(entry.examples.length);
        expect(model.liveGroups).toEqual(entry.examples.map((group) => group.example));
        await expect(page.getByRole('group', { name: t.result })).toHaveCount(entry.examples.length);
        for (const [index, group] of entry.examples.entries()) {
          const block = blocks.nth(index);
          await expect(block.locator('section.example')).toHaveAttribute('aria-labelledby', group.section);
          await expectFrameworkTabs(block, lang, entry.id, group.example);
        }
      });

      test('reference view: every table with its caption, header and first column, the keyboard table included', async ({ page }) => {
        await page.goto(`${lang}/components/${entry.id}/reference/`);
        await hydrated(page);
        const tables = page.locator('main article').getByRole('table');
        await expect(tables).toHaveCount(model.tables.length);
        for (const [index, table] of model.tables.entries()) {
          const shown = tables.nth(index);
          await expect(shown.locator('caption')).toHaveText(table.caption);
          const header = await shown.locator('thead th').evaluateAll((nodes) => nodes.map((node) => node.textContent));
          expect(header.map(squeeze), `${table.caption}: header`).toEqual(table.columns.map((column) => squeeze(inlineText(column.label))));
          const firstColumn = await shown.locator('tbody tr').evaluateAll((rows) => rows.map((row) => row.querySelector('th, td')?.textContent ?? null));
          const key = table.columns[0]?.key ?? 'c0';
          expect(firstColumn.map(squeeze), `${table.caption}: first column`).toEqual(table.rows.map((row) => squeeze(inlineText(row[key]))));
        }
      });
    });
  }
}
