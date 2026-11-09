import { expect, test } from '@playwright/test';

for (const locale of ['ar', 'en']) for (const mode of ['light', 'dark']) {
  test(`identity loader appears in the recipe and editor (${locale}, ${mode})`, async ({ page }) => {
    await page.addInitScript(({ locale, mode }) => {
      if (window !== window.top) return;
      localStorage.setItem('hawiyah-locale', locale); localStorage.setItem('hawiyah-mode', mode);
    }, { locale, mode });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#component/spinner');
    const live = page.locator('[data-guide-canvas] .hw-brand-loader');
    await expect(live).toHaveCount(1);
    await expect(live.locator('img:visible')).toHaveAttribute('src', new RegExp(`hawiyah-loader${mode === 'dark' ? '-white' : ''}\\.gif$`));
    expect(await live.locator('img:visible').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth === 128)).toBe(true);
    expect(await page.locator('[data-guide-demo]').getAttribute('data-guide-usage')).toContain('hawiyah-loader.gif');
    await page.locator('[data-guide-tab="playground"]').click();
    await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state', 'ready', { timeout: 15000 });
    const frame = page.frameLocator('.hw-ide-frame');
    const logo = frame.locator('.hw-brand-loader');
    await expect(logo.locator('img:visible')).toHaveAttribute('src', /^data:image\/gif;base64,/);
    await expect.poll(() => logo.locator('img:visible').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(128);
    await expect(logo).toContainText(locale === 'ar' ? 'جارٍ تحميل تفاصيل الطلب' : 'Loading request details');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect.poll(() => logo.locator('img:visible').evaluate((img: HTMLImageElement) => img.currentSrc.slice(0, 40))).toMatch(/^data:image\/svg\+xml;base64,/);
    await expect(frame.locator('.hw-spinner')).toHaveCSS('animation-name', 'none');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect.poll(() => logo.locator('img:visible').evaluate((img: HTMLImageElement) => img.currentSrc.slice(0, 40))).toMatch(/^data:image\/gif;base64,/);
    await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state', 'ready');
  });
}
