import { expect, test } from '@playwright/test';

test('embedded skip link does not cover the catalog title and reveals on keyboard focus', async ({ page }) => {
  await page.goto('/#components');
  const title = page.locator('.component-card-title h2 a[href$="#component/portal-layout"]');
  const card = page.locator('.component-card').filter({ has: title });
  const skip = card.locator('.hw-skip-link');
  await title.scrollIntoViewIfNeeded();
  await expect(skip).toHaveCSS('clip-path', 'inset(50%)');
  expect(await title.evaluate(node => { const r = node.getBoundingClientRect(); return node.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)); })).toBe(true);
  await title.focus(); await page.keyboard.press('Tab'); await expect(skip).toBeFocused();
  await expect(skip).toHaveCSS('clip-path', 'none');
  expect((await skip.boundingBox())!.height).toBeGreaterThanOrEqual(24);
  await page.keyboard.press('Enter');
  await expect(card.locator('.hw-portal-layout-main')).toBeFocused();
});

// Exercise the shared stylesheet loaded by the real guide. Native controller
// lifecycle and event behavior have separate four-adapter regression tests.
for (const direction of ['rtl', 'ltr']) {
  test(`portal navigation hides only on mobile and keeps current links and focus visible (${direction})`, async ({ page }) => {
    await page.goto('/');
    await page.evaluate(dir => {
      document.body.innerHTML = `<div class="hw-portal-layout" lang="ar" dir="${dir}">
        <header class="hw-portal-header"><div class="hw-portal-header-main">
          <a class="hw-portal-brand" href="#main">هوية</a>
          <button class="hw-button hw-portal-menu-toggle" type="button" aria-expanded="false" aria-controls="test-navigation">القائمة</button>
          <nav id="test-navigation" aria-label="التنقل الرئيسي" data-open="false"><ul><li><a href="#main">الخدمات</a></li></ul></nav>
        </div></header>
        <nav class="hw-secondary-nav" aria-label="التنقل الثانوي"><ul><li><a href="#main" aria-current="page">دليل الخدمات</a></li></ul></nav>
        <main id="main" class="hw-portal-layout-main hw-container" tabindex="-1"><h1>الخدمات</h1></main>
        <footer class="hw-portal-footer">هوية</footer></div>`;
    }, direction);
    await page.setViewportSize({ width: 430, height: 900 });
    await expect(page.locator('.hw-portal-menu-toggle')).toBeVisible();
    await expect(page.locator('#test-navigation')).toBeHidden();
    await page.locator('#test-navigation').evaluate(nav => { (nav as HTMLElement).dataset.open = 'true'; });
    await expect(page.locator('#test-navigation a')).toBeVisible();
    await page.locator('#test-navigation').evaluate(nav => { (nav as HTMLElement).dataset.open = 'false'; });
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('.hw-portal-menu-toggle')).toBeHidden();
    await expect(page.locator('#test-navigation a')).toBeVisible();
    await page.setViewportSize({ width: 430, height: 900 });
    for (const theme of ['dga', 'hawiyah']) for (const mode of ['light', 'dark']) {
      await page.locator('.hw-portal-layout').evaluate((element, values) => { (element as HTMLElement).dataset.hwTheme = values[0]; (element as HTMLElement).dataset.hwMode = values[1]; }, [theme, mode]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const link = page.locator('.hw-secondary-nav a'); await link.focus();
      const focus = await link.evaluate(element => { const css = getComputedStyle(element); return { style: css.outlineStyle, width: css.outlineWidth, border: css.borderBlockEndStyle }; });
      expect(focus).toEqual({ style: 'solid', width: '2px', border: 'solid' });
    }
    await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
    await page.locator('.hw-secondary-nav a').focus();
    expect(await page.locator('.hw-secondary-nav a').evaluate(element => getComputedStyle(element).outlineStyle)).toBe('solid');
  });
}
