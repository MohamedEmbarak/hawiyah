import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const [locale, mode] of [['ar', 'light'], ['en', 'dark']]) {
  test(`project controls share the preview card in ${locale}/${mode}`, async ({ page }, testInfo) => {
    test.setTimeout(90000);
    await page.addInitScript(({ locale, mode }) => {
      if (window !== window.top) return;
      localStorage.setItem('hawiyah-locale', locale);
      localStorage.setItem('hawiyah-mode', mode);
    }, { locale, mode });
    await page.goto('/#component/stepper');
    await page.locator('[data-guide-tab="playground"]').click();
    await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state', 'ready', { timeout: 45000 });
    const card = page.locator('.guide-demo');
    const settings = page.locator('.hw-project-subheader');
    const framework = page.locator('[data-project-framework]');
    const language = page.locator('[data-project-language]');
    for (const width of [1543, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 884 });
      const top = (await page.locator('.guide-demo-top').boundingBox())!;
      const bar = (await settings.boundingBox())!;
      const ide = (await page.locator('.hw-ide').boundingBox())!;
      expect(bar.y).toBeCloseTo(top.y + top.height, 1);
      expect(ide.y).toBeCloseTo(bar.y + bar.height, 1);
      expect(bar.x).toBeCloseTo(top.x, 1);
      expect(bar.width).toBeCloseTo(top.width, 1);
      expect(ide.width).toBeCloseTo(bar.width, 1);
      expect(bar.x).toBeGreaterThanOrEqual(0);
      expect(bar.x + bar.width).toBeLessThanOrEqual(width);
      await expect(page.locator('.hw-ide')).toHaveCSS('border-radius', '0px');
      await expect(page.locator('.hw-ide')).toHaveCSS('box-shadow', 'none');
      for (const select of [framework, language]) {
        const box = (await select.boundingBox())!;
        expect(box.height).toBe(40);
        expect(box.x).toBeGreaterThanOrEqual(bar.x);
        expect(box.x + box.width).toBeLessThanOrEqual(bar.x + bar.width);
        const mark = (await select.locator('..').locator('svg').boundingBox())!;
        expect(mark.width).toBe(18);
        expect(mark.height).toBe(18);
        expect(mark.y + mark.height / 2).toBeCloseTo(box.y + box.height / 2, 1);
      }
      const download = (await page.locator('[data-project-download]').boundingBox())!;
      expect(download.x).toBeGreaterThanOrEqual(bar.x);
      expect(download.x + download.width).toBeLessThanOrEqual(bar.x + bar.width);
      if (width === 390 || width === 1543) {
        await card.screenshot({ path: testInfo.outputPath(`editor-${locale}-${width}.png`) });
      }
    }
    expect((await new AxeBuilder({ page }).include('.hw-project-subheader').include('.hw-ide-toolbar').analyze()).violations).toEqual([]);
    await page.locator('[data-ide-run]').hover();
    await page.locator('[data-ide-run]').evaluate(async el => {
      await Promise.all(el.getAnimations().map(animation => animation.finished.catch(() => {})));
    });
    expect((await new AxeBuilder({ page }).include('.hw-ide-toolbar').analyze()).violations).toEqual([]);
    await framework.focus();
    await framework.press('Tab');
    await expect(language).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-project-download]')).toBeFocused();
    await framework.selectOption('angular');
    await expect(language).toBeDisabled();
    await expect(language).toHaveValue('typescript');
    await framework.focus();
    await framework.press('Tab');
    await expect(page.locator('[data-project-download]')).toBeFocused();
    await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
    await framework.focus();
    await expect(framework).toBeFocused();
    expect(await framework.evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe('none');
    await expect(page).toHaveURL(/#component\/stepper$/);
    await page.emulateMedia({ forcedColors: 'none' });
    await framework.selectOption('vanilla');
    await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state', 'ready', { timeout: 45000 });
    await page.setViewportSize({ width: 1543, height: 1100 });
    await card.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.screenshot({ path: testInfo.outputPath(`editor-${locale}-context.png`) });
  });
}
