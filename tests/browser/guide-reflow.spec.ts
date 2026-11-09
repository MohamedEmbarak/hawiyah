import { expect, test } from '@playwright/test';

for (const locale of ['ar', 'en']) {
  test(`guide prose and the live date picker reflow at 320px (${locale})`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(locale => localStorage.setItem('hawiyah-locale', locale), locale);
    await page.goto('/#component/date-picker');
    await expect(page.locator('.guide-article')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
    const table = page.locator('.guide-table-wrap').first();
    expect(await table.evaluate(node => node.scrollWidth > node.clientWidth)).toBe(true);
    await table.focus();
    await expect(table).toBeFocused();
    const picker = page.locator('[data-hw="date-picker"]');
    const trigger = picker.locator('[data-hw-date-trigger]');
    await trigger.click();
    const dialog = picker.locator('dialog');
    await expect(dialog).toBeVisible();
    const bounds = await dialog.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
    await page.screenshot({ path: testInfo.outputPath(`picker-guide-${locale}.png`) });
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    await page.goto('/#docs/getting-started');
    await expect(page.locator('.guide-article')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
    const pre = page.locator('.guide-article pre').first();
    expect(await pre.evaluate(node => ({ whiteSpace: getComputedStyle(node).whiteSpace, overflow: getComputedStyle(node).overflowX }))).toEqual({ whiteSpace: 'pre', overflow: 'auto' });
  });
}
