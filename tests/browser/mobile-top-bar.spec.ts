import { expect, test } from '@playwright/test';

for (const locale of ['ar', 'en']) {
  test(`mobile top bar wraps and preserves direction, targets and focus (${locale})`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.addInitScript(locale => localStorage.setItem('hawiyah-locale', locale), locale);
    await page.goto('/#component/mobile-top-bar');
    const bar = page.locator('.guide-preview .hw-mobile-top-bar');
    await expect(bar).toBeVisible();
    const back = bar.locator('.hw-mobile-top-bar-back');
    const icon = back.locator('.hw-icon');
    expect(await icon.evaluate(node => getComputedStyle(node).transform)).toBe(locale === 'ar' ? 'matrix(-1, 0, 0, 1, 0, 0)' : 'none');
    for (const theme of ['dga', 'hawiyah', 'custom']) for (const mode of ['light', 'dark']) {
      await bar.evaluate((node, [theme, mode]) => { (node as HTMLElement).dataset.hwTheme = theme; (node as HTMLElement).dataset.hwMode = mode; }, [theme, mode]);
      expect(await bar.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
      for (const link of await bar.locator('a').all()) {
        const bounds = await link.boundingBox(); expect(bounds!.width).toBeGreaterThanOrEqual(44); expect(bounds!.height).toBeGreaterThanOrEqual(44);
      }
    }
    await bar.locator('h2').evaluate(node => { node.textContent = 'طلبات الخدمات الحكومية والمتابعة Government service requests and follow-up'; });
    await bar.evaluate(node => node.setAttribute('data-variant', 'main'));
    await expect(bar.locator('h2')).toHaveCSS('font-size', '26px');
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    expect(await bar.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
    await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
    await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
    await back.focus(); await expect(back).toBeFocused();
    await expect(back).toHaveCSS('outline-style', 'solid');
    await page.emulateMedia({ forcedColors: 'none' });
    await page.screenshot({ path: testInfo.outputPath(`top-bar-${locale}.png`) });
    await expect(back).toHaveAttribute('href', '#components');
    await back.press('Enter');
    await expect(page).toHaveURL(/#component\/mobile-top-bar$/);
    await expect(page.locator('[data-demo-result]')).toHaveText(locale === 'ar' ? 'معاينة الإجراء: رجوع' : 'Preview action: Back');
  });
}
