import { test, expect, axe, hydrated, keepRootDocument, presetMode } from '../support/fixtures';
import { languagePages } from '../support/routes';

const targets = [
  ...languagePages.map((p) => ({ name: p.route, href: p.href, notFound: false })),
  { name: '404 (unknown path)', href: 'en/no-such-page/', notFound: true },
];

for (const target of targets) {
  for (const mode of ['light', 'dark'] as const) {
    for (const width of [1280, 390]) {
      test(`axe: ${target.name}, ${mode}, ${width} px`, async ({ page, guard }) => {
        if (target.notFound) guard.allowDocument404(/\/no-such-page\/$/);
        await presetMode(page, mode);
        await page.setViewportSize({ width, height: 900 });
        await page.goto(target.href);
        await hydrated(page);
        await expect(page.locator('html')).toHaveAttribute('data-hw-mode', mode);
        expect(await axe(page)).toEqual([]);
      });
    }
  }
}

for (const mode of ['light', 'dark'] as const) {
  test(`axe: root language choice, ${mode}`, async ({ page }) => {
    await keepRootDocument(page);
    await presetMode(page, mode);
    await page.goto('./');
    await hydrated(page);
    expect(await axe(page)).toEqual([]);
  });
}

for (const target of targets) {
  for (const width of [320, 390, 1024, 1440]) {
    test(`no horizontal overflow: ${target.name} at ${width} px`, async ({ page, guard }) => {
      if (target.notFound) guard.allowDocument404(/\/no-such-page\/$/);
      await page.setViewportSize({ width, height: 900 });
      for (const mode of ['light', 'dark'] as const) {
        await page.goto(target.href);
        await hydrated(page);
        await page.evaluate((value) => document.documentElement.setAttribute('data-hw-mode', value), mode);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `${mode}`).toBeLessThanOrEqual(0);
      }
    });
  }
}
