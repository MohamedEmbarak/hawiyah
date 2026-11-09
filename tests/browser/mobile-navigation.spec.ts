import { expect, test, type Locator } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

async function isHitTarget(locator: Locator) {
  return locator.evaluate(node => {
    const box = node.getBoundingClientRect();
    const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
    return hit === node || (hit !== null && node.contains(hit));
  });
}

for (const width of [390, 820, 900]) {
  for (const locale of ['ar', 'en'] as const) {
    for (const mode of ['light', 'dark'] as const) {
      test(`mobile navigation fills the viewport and remains usable at ${width}px, ${locale}, ${mode}`, async ({ page }) => {
        const height = 844;
        await page.setViewportSize({ width, height });
        await page.addInitScript(({ locale, mode }) => {
          localStorage.setItem('hawiyah-locale', locale);
          localStorage.setItem('hawiyah-mode', mode);
        }, { locale, mode });
        await page.goto('/#docs/getting-started');
        await expect(page.locator('html')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
        await expect(page.locator('html')).toHaveAttribute('data-hw-mode', mode);

        const sidebar = page.locator('#site-navigation');
        const menu = page.locator('.mobile-menu');
        const close = sidebar.locator('.sidebar-close');
        const shell = page.locator('.main-shell');
        await expect(sidebar).not.toBeVisible();
        const closed = await sidebar.evaluate(node => {
          const box = node.getBoundingClientRect();
          return { left: box.left, right: box.right };
        });
        if (locale === 'ar') expect(closed.left).toBeGreaterThanOrEqual(width);
        else expect(closed.right).toBeLessThanOrEqual(0);

        await page.evaluate(() => window.scrollTo(0, 180));
        const pageScroll = await page.evaluate(() => window.scrollY);
        // The sticky toggle is already in view; click its real hit area without
        // Playwright scrolling the element to satisfy the page's scroll padding.
        const menuBox = await menu.boundingBox();
        expect(menuBox).not.toBeNull();
        expect(await isHitTarget(menu)).toBe(true);
        await page.mouse.click(menuBox!.x + menuBox!.width / 2, menuBox!.y + menuBox!.height / 2);
        await expect(sidebar).toHaveAttribute('role', 'dialog');
        await expect(sidebar).toHaveAttribute('aria-modal', 'true');
        await expect(shell).toHaveAttribute('inert', '');
        await expect(close).toBeFocused();
        const box = await sidebar.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.y).toBeCloseTo(0, 0);
        expect(box!.height).toBeCloseTo(height, 0);
        expect(box!.width).toBeGreaterThan(250);
        expect(box!.width).toBeLessThan(width);
        if (locale === 'ar') expect(box!.x + box!.width).toBeCloseTo(width, 0);
        else expect(box!.x).toBeCloseTo(0, 0);
        const closeBox = await close.boundingBox();
        expect(closeBox!.width).toBeGreaterThanOrEqual(44);
        expect(closeBox!.height).toBeGreaterThanOrEqual(44);
        expect(await isHitTarget(close)).toBe(true);

        // A long menu must scroll internally while the page stays still.
        await sidebar.evaluate(node => { node.scrollTop = node.scrollHeight; });
        await expect.poll(() => sidebar.evaluate(node => node.scrollTop)).toBeGreaterThan(0);
        const lastLink = sidebar.locator('.sidebar-github');
        await expect(lastLink).toBeInViewport();
        expect(await isHitTarget(lastLink)).toBe(true);
        await expect(close).toBeInViewport();
        expect(await isHitTarget(close)).toBe(true);
        expect(await page.evaluate(() => window.scrollY)).toBe(pageScroll);
        await page.keyboard.press('Escape');
        await expect(sidebar).not.toBeVisible();
        await expect(shell).not.toHaveAttribute('inert');
        await expect(menu).toBeFocused();
        expect(await page.evaluate(() => window.scrollY)).toBe(pageScroll);

        // Selecting the current route does not fire hashchange; it must still close.
        await menu.click();
        await sidebar.locator('a[href="#docs/getting-started"]').click();
        await expect(sidebar).not.toBeVisible();
        await expect(shell).not.toHaveAttribute('inert');
        await expect(page.locator('#main')).toBeFocused();
        await expect(page).toHaveURL(/#docs\/getting-started$/);

        await menu.click();
        await sidebar.locator('a[href="#docs/accessibility"]').click();
        await expect(page).toHaveURL(/#docs\/accessibility$/);
        await expect(sidebar).not.toBeVisible();
        await expect(shell).not.toHaveAttribute('inert');
        await expect(page.locator('#main')).toHaveAttribute('data-view', 'docs/accessibility');
        await expect(page.locator('#main')).toBeFocused();
      });
    }
  }
}
