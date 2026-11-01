import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const locale of ['ar', 'en']) {
  test(`navigation drawer preserves native disclosure and modal behavior (${locale})`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(locale => localStorage.setItem('nasaq-locale', locale), locale);
    await page.goto('/#component/navigation-drawer');
    const trigger = page.locator('.guide-preview [data-nq-dialog-open]');
    const dialog = page.locator('.guide-preview dialog');
    for (const theme of ['dga', 'nasaq', 'custom']) for (const mode of ['light', 'dark']) {
      await dialog.evaluate((node, [theme, mode]) => { (node as HTMLElement).dataset.nqTheme = theme; (node as HTMLElement).dataset.nqMode = mode; }, [theme, mode]);
      await trigger.click();
      expect(await dialog.evaluate(node => node.matches(':modal'))).toBe(true);
      const bounds = await dialog.boundingBox(); expect(bounds!.width).toBeLessThanOrEqual(304); expect(bounds!.x).toBeGreaterThanOrEqual(0); expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
      expect(await dialog.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
      const current = dialog.locator('[aria-current="page"]');
      expect((await current.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      expect(await current.evaluate(node => getComputedStyle(node, '::before').width)).toBe('6px');
      await page.keyboard.press('Escape'); await expect(trigger).toBeFocused();
    }
    await trigger.click();
    const summary = dialog.locator('summary'); await summary.focus(); await summary.press('Enter');
    await expect(dialog.locator('details')).toHaveAttribute('open');
    await page.keyboard.press('Tab'); await expect(dialog.locator('details a').first()).toBeFocused();
    await expect(dialog.locator('[aria-disabled="true"]')).not.toHaveAttribute('href');
    expect((await new AxeBuilder({ page }).include('.guide-preview dialog').analyze()).violations).toEqual([]);
    await page.emulateMedia({ forcedColors: 'active' }); await summary.focus(); await expect(summary).toHaveCSS('outline-style', 'solid');
    await page.emulateMedia({ forcedColors: 'none' });
    await page.screenshot({ path: testInfo.outputPath(`navigation-drawer-${locale}.png`) });
    await dialog.locator('a[aria-current="page"]').click(); await expect(page).toHaveURL(/#components$/);
  });
}
