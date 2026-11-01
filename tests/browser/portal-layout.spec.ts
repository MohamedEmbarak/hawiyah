import { expect, test } from '@playwright/test';

// Exercise the shared stylesheet loaded by the real guide. Native controller
// lifecycle and event behavior have separate four-adapter regression tests.
for (const direction of ['rtl', 'ltr']) {
  test(`portal navigation hides only on mobile and keeps current links and focus visible (${direction})`, async ({ page }) => {
    await page.goto('/');
    await page.evaluate(dir => {
      document.body.innerHTML = `<div class="nq-portal-layout" lang="ar" dir="${dir}">
        <header class="nq-portal-header"><div class="nq-portal-header-main">
          <a class="nq-portal-brand" href="#main">نسق</a>
          <button class="nq-button nq-portal-menu-toggle" type="button" aria-expanded="false" aria-controls="test-navigation">القائمة</button>
          <nav id="test-navigation" aria-label="التنقل الرئيسي" data-open="false"><ul><li><a href="#main">الخدمات</a></li></ul></nav>
        </div></header>
        <nav class="nq-secondary-nav" aria-label="التنقل الثانوي"><ul><li><a href="#main" aria-current="page">دليل الخدمات</a></li></ul></nav>
        <main id="main" class="nq-portal-layout-main nq-container" tabindex="-1"><h1>الخدمات</h1></main>
        <footer class="nq-portal-footer">نسق</footer></div>`;
    }, direction);
    await page.setViewportSize({ width: 430, height: 900 });
    await expect(page.locator('.nq-portal-menu-toggle')).toBeVisible();
    await expect(page.locator('#test-navigation')).toBeHidden();
    await page.locator('#test-navigation').evaluate(nav => { (nav as HTMLElement).dataset.open = 'true'; });
    await expect(page.locator('#test-navigation a')).toBeVisible();
    await page.locator('#test-navigation').evaluate(nav => { (nav as HTMLElement).dataset.open = 'false'; });
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('.nq-portal-menu-toggle')).toBeHidden();
    await expect(page.locator('#test-navigation a')).toBeVisible();
    await page.setViewportSize({ width: 430, height: 900 });
    for (const theme of ['dga', 'nasaq']) for (const mode of ['light', 'dark']) {
      await page.locator('.nq-portal-layout').evaluate((element, values) => { (element as HTMLElement).dataset.nqTheme = values[0]; (element as HTMLElement).dataset.nqMode = values[1]; }, [theme, mode]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const link = page.locator('.nq-secondary-nav a'); await link.focus();
      const focus = await link.evaluate(element => { const css = getComputedStyle(element); return { style: css.outlineStyle, width: css.outlineWidth, border: css.borderBlockEndStyle }; });
      expect(focus).toEqual({ style: 'solid', width: '2px', border: 'solid' });
    }
    await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
    await page.locator('.nq-secondary-nav a').focus();
    expect(await page.locator('.nq-secondary-nav a').evaluate(element => getComputedStyle(element).outlineStyle)).toBe('solid');
  });
}
