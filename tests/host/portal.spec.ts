import { expect, test, type Locator, type Page } from '@playwright/test';
import { ADAPTERS, box, openCase, section, type Adapter } from './support';

// PORTAL-04: at 390px with the menu open, a mouse click with a 120 ms hold and
// a touchscreen tap: one press on the second branch heading opens it and closes
// the first, in ar and en.
async function openFirstBranch(page: Page, adapter: Adapter, lang: 'ar' | 'en'): Promise<{ first: Locator; second: Locator }> {
  await openCase(page, 'PORTAL-04', { lang, adapters: [adapter], viewport: { width: 390, height: 900 } });
  const header = section(page, adapter).locator('header.hw-portal-header');
  const toggle = header.locator('.hw-portal-menu-toggle');
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  const branches = header.locator('details[data-hw-portal-branch]');
  await expect(branches).toHaveCount(2);
  const first = branches.first();
  await first.locator(':scope > summary').click();
  await expect(first).toHaveAttribute('open', '');
  return { first, second: branches.nth(1) };
}

for (const adapter of ADAPTERS) {
  for (const lang of ['en', 'ar'] as const) {
    test(`PORTAL-04 ${adapter}: one mouse press held 120 ms on the second branch heading opens it and closes the first (${lang})`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const { first, second } = await openFirstBranch(page, adapter, lang);
      const heading = await box(second.locator(':scope > summary'));
      await page.mouse.move(heading.left + heading.width / 2, heading.top + heading.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(120);
      await page.mouse.up();
      await expect(second).toHaveAttribute('open', '');
      await expect(first).not.toHaveAttribute('open');
      await expect(second.locator('.hw-portal-branch-panel')).toBeVisible();
    });
  }
}

test.describe('touchscreen', () => {
  test.use({ hasTouch: true });
  for (const adapter of ADAPTERS) {
    for (const lang of ['en', 'ar'] as const) {
      test(`PORTAL-04 ${adapter}: one tap on the second branch heading opens it and closes the first (${lang})`, async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        const { first, second } = await openFirstBranch(page, adapter, lang);
        await second.locator(':scope > summary').tap();
        await expect(second).toHaveAttribute('open', '');
        await expect(first).not.toHaveAttribute('open');
        await expect(second.locator('.hw-portal-branch-panel')).toBeVisible();
      });
    }
  }
});

// PORTAL-07: the React header at 390px hides nav[data-open=false] and puts the
// open navigation on its own row; at 1280px it shows the links in one row. The
// authored fixture with .hw-portal-header-main (vanilla) still passes the same checks.
for (const adapter of ['react', 'vanilla'] as const) {
  for (const lang of ['en', 'ar'] as const) {
    test(`PORTAL-07 ${adapter}: the navigation is hidden or on its own row at 390px and one row at 1280px (${lang})`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await openCase(page, 'PORTAL-07', { lang, adapters: [adapter], viewport: { width: 390, height: 900 } });
      const header = section(page, adapter).locator('header.hw-portal-header');
      if (adapter === 'react') await expect(header.locator('.hw-portal-header-main')).toHaveCount(0);
      const toggle = header.locator('.hw-portal-menu-toggle');
      const nav = header.locator('nav');
      const brand = header.locator('.hw-portal-brand');
      await expect(nav).toHaveAttribute('data-open', 'false');
      await expect(nav).toBeHidden();
      await toggle.click();
      await expect(nav).toHaveAttribute('data-open', 'true');
      await expect(nav).toBeVisible();
      const navBox = await box(nav);
      for (const other of [brand, toggle]) expect(navBox.top, 'the open navigation starts below the brand row').toBeGreaterThanOrEqual((await box(other)).bottom - 0.5);
      const content = await header.evaluate((node) => {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return rect.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - parseFloat(style.borderLeftWidth) - parseFloat(style.borderRightWidth);
      });
      expect(navBox.width, 'the open navigation takes the row').toBeGreaterThanOrEqual(content * 0.9);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.setViewportSize({ width: 1280, height: 900 });
      await expect(toggle).toBeHidden();
      const links = nav.locator('a');
      await expect(links).toHaveCount(3);
      for (const link of await links.all()) await expect(link).toBeVisible();
      const tops = await links.evaluateAll((nodes) => nodes.map((node) => Math.round(node.getBoundingClientRect().top)));
      expect(new Set(tops).size, `link tops ${tops.join(', ')}`).toBe(1);
    });
  }
}
