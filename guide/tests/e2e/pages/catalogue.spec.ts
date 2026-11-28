import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Locator } from '@playwright/test';
import { test, expect, axe, hydrated, presetMode } from '../support/fixtures';
import { navigation, type Lang } from '../support/routes';

// The catalogue and the side navigation grouped by the categories of components.json:
// one catalogue section per category with a card per built page (its name,
// a link to the page, and the Markdown summary), and one group per category in the side navigation and the drawer,
// the group of the current page open; labels from src/app/i18n/categories.json. In
// Arabic and English, in both colour modes, axe clean and without overflow at 320 px.

const labels = JSON.parse(readFileSync(join(process.cwd(), 'src', 'app', 'i18n', 'categories.json'), 'utf8')) as Record<Lang, Record<string, string>>;
const TEXT = {
  en: { sideNav: 'Component pages' },
  ar: { sideNav: 'صفحات المكوّنات' },
} as const;

/** The categories that have a page in a language, each with its pages in index order. */
function grouped(lang: Lang): { id: string; label: string; pages: typeof navigation.pages }[] {
  return navigation.categories
    .map((id) => ({ id, label: labels[lang][id] ?? '', pages: navigation.pages.filter((entry) => entry.category === id && entry.langs.includes(lang)) }))
    .filter((group) => group.pages.length > 0);
}

/** The groups of a navigation list: summary text, open state and link names in order. */
async function groupsOf(list: Locator): Promise<{ label: string; open: boolean; links: string[] }[]> {
  return list.locator('details').evaluateAll((nodes) =>
    nodes.map((details) => ({
      label: details.querySelector(':scope > summary')?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
      open: (details as HTMLDetailsElement).open,
      links: Array.from(details.querySelectorAll('a')).map((link) => link.textContent?.replace(/\s+/g, ' ').trim() ?? ''),
    })),
  );
}

for (const lang of ['ar', 'en'] as const) {
  const groups = grouped(lang);
  const current = groups[groups.length - 1]?.pages[0];

  test.describe(`catalogue and navigation by category (${lang})`, () => {
    test('the catalogue has one section per category, with a card per page: name, link and summary', async ({ page }) => {
      await page.goto(`${lang}/components/`);
      await hydrated(page);
      const sections = page.locator('main section.category');
      await expect(sections).toHaveCount(groups.length);
      for (const [index, group] of groups.entries()) {
        const section = sections.nth(index);
        await expect(section.getByRole('heading', { level: 2 })).toHaveText(group.label);
        await expect(section).toHaveAccessibleName(group.label);
        const cards = section.getByRole('article');
        await expect(cards).toHaveCount(group.pages.length);
        for (const [n, entry] of group.pages.entries()) {
          const card = cards.nth(n);
          await expect(card).toHaveAccessibleName(entry.title[lang]);
          await expect(card.getByRole('heading', { level: 3 })).toHaveText(entry.title[lang]);
          const link = card.getByRole('link');
          await expect(link).toHaveCount(1);
          await expect(link).toHaveAccessibleName(entry.title[lang]);
          await expect(link).toHaveAttribute('href', `${lang}/components/${entry.id}/`);
          await expect(card.locator('p')).toHaveText(entry.summary[lang]);
        }
        await expect(section.getByRole('link')).toHaveCount(group.pages.length);
      }
      // The labels come from the guide's text sources, one per category id.
      expect(groups.every((group) => group.label.trim() !== '')).toBe(true);
    });

    test('the side navigation groups the pages by category; the group of the current page is open', async ({ page }) => {
      expect(current, 'a built page').toBeDefined();
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(`${lang}/components/${current?.id}/`);
      await hydrated(page);
      const side = page.locator('hw-side-navigation');
      await expect(side).toHaveAccessibleName(TEXT[lang].sideNav);
      const expected = groups.map((group) => ({ label: group.label, open: group.pages.some((entry) => entry.id === current?.id), links: group.pages.map((entry) => entry.title[lang]) }));
      expect(await groupsOf(side)).toEqual(expected);
      await expect(side.getByRole('link', { name: current?.title[lang], exact: true })).toHaveAttribute('aria-current', 'page');

      // The drawer below 64rem holds the same groups.
      await page.setViewportSize({ width: 390, height: 844 });
      await page.getByRole('button', { name: TEXT[lang].sideNav }).click();
      const dialog = page.getByRole('dialog', { name: TEXT[lang].sideNav });
      await expect(dialog).toBeVisible();
      expect(await groupsOf(dialog)).toEqual(expected);
      await expect(dialog.getByRole('link', { name: current?.title[lang], exact: true })).toHaveAttribute('aria-current', 'page');
    });

    for (const mode of ['light', 'dark'] as const) {
      test(`axe clean and no overflow at 320 px: the catalogue and the opened drawer, ${mode}`, async ({ page }) => {
        await presetMode(page, mode);
        await page.setViewportSize({ width: 320, height: 800 });
        await page.goto(`${lang}/components/`);
        await hydrated(page);
        await expect(page.locator('html')).toHaveAttribute('data-hw-mode', mode);
        expect(await axe(page)).toEqual([]);
        expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);

        await page.goto(`${lang}/components/${current?.id}/`);
        await hydrated(page);
        await page.getByRole('button', { name: TEXT[lang].sideNav }).click();
        await expect(page.getByRole('dialog', { name: TEXT[lang].sideNav })).toBeVisible();
        expect(await axe(page)).toEqual([]);
        expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
      });
    }
  });
}
