import { expect, test } from '@playwright/test';
import { ADAPTERS, computed, keyboardFocus, openCase, section } from './support';

// FOCUS-01 (browser half), real key presses in Chromium: after Space on Next at
// the second-to-last slide, the active element is the Next button, it carries
// aria-disabled="true" and no disabled attribute, and it shows a focus ring;
// forced colours draw the glyph of the arrow at the bound in GrayText.
for (const adapter of ADAPTERS) {
  for (const forced of [false, true]) {
    test(`FOCUS-01 ${adapter}: Next keeps focus and a focus ring at the last slide${forced ? ', glyph in GrayText in forced colours' : ''}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: forced ? 'active' : 'none' });
      await openCase(page, 'FOCUS-01', { adapters: [adapter] });
      const carousel = section(page, adapter).locator('.hw-carousel');
      const next = carousel.locator('button[data-hw-next]');
      const slides = carousel.locator('.hw-carousel-slide');
      await expect(slides).toHaveCount(3);
      await keyboardFocus(page, next);
      await page.keyboard.press('Space');
      await expect(next).not.toHaveAttribute('aria-disabled', 'true');
      // Second-to-last slide: Space moves to the last slide.
      await page.keyboard.press('Space');
      await expect(slides.nth(2)).toBeVisible();
      await expect(next).toBeFocused();
      await expect(next).toHaveAttribute('aria-disabled', 'true');
      await expect(next).not.toHaveAttribute('disabled');
      expect(await next.evaluate((node) => node.matches(':focus-visible'))).toBe(true);
      const ring = await computed(next, ['outline-style', 'outline-width', 'opacity']);
      expect(ring['outline-style']).not.toBe('none');
      expect(parseFloat(ring['outline-width']!)).toBeGreaterThan(0);
      expect(ring.opacity).toBe('1');
      // Activation at the bound changes nothing.
      await page.keyboard.press('Space');
      await expect(slides.nth(2)).toBeVisible();
      await expect(next).toBeFocused();
      if (forced) {
        const grayText = await page.evaluate(() => {
          const probe = document.createElement('span');
          probe.style.backgroundColor = 'GrayText';
          probe.style.forcedColorAdjust = 'none';
          document.body.append(probe);
          const value = getComputedStyle(probe).backgroundColor;
          probe.remove();
          return value;
        });
        expect((await computed(next, ['background-color'], '::before'))['background-color']).toBe(grayText);
      }
    });
  }
}
