import { expect, test, type Locator } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, reducedMotion: 'reduce' });

async function thumbGeometry(control: Locator) {
  return control.evaluate(element => {
    const track = getComputedStyle(element);
    const thumb = getComputedStyle(element, '::before');
    return {
      left: parseFloat(thumb.left), top: parseFloat(thumb.top),
      width: parseFloat(thumb.width), height: parseFloat(thumb.height),
      trackWidth: element.clientWidth, trackHeight: element.clientHeight,
      direction: track.direction,
    };
  });
}

for (const locale of ['ar', 'en'] as const) {
  test(`hero switches stay inside their tracks and update the preview in ${locale}`, async ({ page }) => {
    await page.addInitScript(locale => localStorage.setItem('hawiyah-locale', locale), locale);
    await page.goto('/#overview');
    const corners = page.locator('[data-home-round]');
    const density = page.locator('[data-home-compact]');
    const card = page.locator('.home-request');
    const stage = page.locator('[data-home-stage]');
    for (const mode of ['light', 'dark']) {
      await page.locator('html').evaluate((root, mode) => root.setAttribute('data-hw-mode', mode), mode);
      for (const control of [corners, density]) {
        const positions: number[] = [];
        for (const checked of [false, true]) {
          if (await control.isChecked() !== checked) await control.tap();
          await expect(control).toBeChecked({ checked });
          const geometry = await thumbGeometry(control);
          expect(geometry.left).toBeGreaterThanOrEqual(0);
          expect(geometry.top).toBeGreaterThanOrEqual(0);
          expect(geometry.left + geometry.width).toBeLessThanOrEqual(geometry.trackWidth);
          expect(geometry.top + geometry.height).toBeLessThanOrEqual(geometry.trackHeight);
          positions.push(geometry.left);
        }
        expect(Math.sign(positions[1]! - positions[0]!)).toBe(locale === 'ar' ? -1 : 1);
      }
      const roundedRadius = await card.evaluate(el => parseFloat(getComputedStyle(el).borderTopLeftRadius));
      await corners.focus();
      await page.keyboard.press('Space');
      await expect(corners).not.toBeChecked();
      expect(await card.evaluate(el => parseFloat(getComputedStyle(el).borderTopLeftRadius))).toBeLessThan(roundedRadius);
      await expect(stage).toHaveAttribute('data-hw-density', 'compact');
      const compactPadding = await card.evaluate(el => parseFloat(getComputedStyle(el).paddingTop));
      await density.tap();
      await expect(stage).toHaveAttribute('data-hw-density', 'comfortable');
      expect(await card.evaluate(el => parseFloat(getComputedStyle(el).paddingTop))).toBeGreaterThan(compactPadding);
    }
    const project = page.locator('[name="preview-project"]');
    await project.fill(locale === 'ar' ? 'مشروعي' : 'My project');
    await page.locator('.mobile-menu').tap();
    await page.locator('.sidebar-close').tap();
    await expect(project).toHaveValue(locale === 'ar' ? 'مشروعي' : 'My project');
    await expect(corners).not.toBeChecked();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
