import { expect, test } from '@playwright/test';

for (const locale of ['ar', 'en'] as const) {
  for (const width of [320, 1280]) {
    test(`password eye stays inside the native input in ${locale} at ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript(locale => {
        localStorage.setItem('hawiyah-locale', locale);
        localStorage.setItem('hawiyah-theme', 'dga');
        localStorage.setItem('hawiyah-mode', 'light');
      }, locale);
      await page.goto('/#inputs');
      const form = page.locator('#native-input-lab');
      const field = form.locator('[data-hw="password-field"]');
      const input = field.locator('[data-hw-password-input]');
      const toggle = field.locator('[data-hw-password-toggle]');
      const icon = toggle.locator('.hw-password-icon');
      await expect(toggle).toHaveAttribute('data-toggle-variant', 'icon');
      await expect(toggle).toHaveAccessibleName(locale === 'ar' ? 'إظهار كلمة المرور' : 'Show password');
      await expect(input).toHaveAccessibleName(locale === 'ar' ? 'كلمة المرور' : 'Password');
      await expect(input).toHaveAttribute('name', 'password');
      await expect(input).toHaveAttribute('autocomplete', 'new-password');
      await expect(input).toHaveAttribute('minlength', '8');
      await input.scrollIntoViewIfNeeded();
      const inputBox = (await input.boundingBox())!;
      const toggleBox = (await toggle.boundingBox())!;
      const iconBox = (await icon.boundingBox())!;
      expect(toggleBox.x).toBeGreaterThanOrEqual(inputBox.x);
      expect(toggleBox.x + toggleBox.width).toBeLessThanOrEqual(inputBox.x + inputBox.width + 1);
      expect(toggleBox.y).toBeGreaterThanOrEqual(inputBox.y);
      expect(toggleBox.y + toggleBox.height).toBeLessThanOrEqual(inputBox.y + inputBox.height + 1);
      expect(iconBox.width).toBe(24);
      expect(iconBox.height).toBe(24);
      expect(toggleBox.width).toBeGreaterThanOrEqual(24);
      expect(toggleBox.height).toBeGreaterThanOrEqual(24);
      expect(locale === 'ar' ? toggleBox.x < inputBox.x + inputBox.width / 2 : toggleBox.x > inputBox.x + inputBox.width / 2).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const showMask = await icon.evaluate(node => getComputedStyle(node).maskImage);
      expect(showMask).toMatch(/^url\(/);
      await input.fill('sample-only-password');
      await input.focus();
      await page.keyboard.press('Tab');
      await expect(toggle).toBeFocused();
      await page.keyboard.press('Space');
      await expect(input).toHaveAttribute('type', 'text');
      await expect(toggle).toHaveAttribute('aria-pressed', 'true');
      await expect(toggle).toHaveAccessibleName(locale === 'ar' ? 'إخفاء كلمة المرور' : 'Hide password');
      await expect(toggle).toBeFocused();
      expect(await icon.evaluate(node => getComputedStyle(node).maskImage)).not.toBe(showMask);
      expect(await form.evaluate(node => new FormData(node as HTMLFormElement).get('password'))).toBe('sample-only-password');
      await page.keyboard.press('Enter');
      await expect(input).toHaveAttribute('type', 'password');
      await toggle.click();
      await form.locator('input[type="reset"]').click();
      await expect(input).toHaveAttribute('type', 'password');
      await expect(input).toHaveValue('');
      await expect(toggle).toHaveAttribute('aria-pressed', 'false');
      await field.screenshot({ path: testInfo.outputPath(`password-${locale}-${width}.png`) });

      await page.emulateMedia({ forcedColors: 'active' });
      await input.focus();
      await page.keyboard.press('Tab');
      await expect(toggle).toBeFocused();
      const focus = await toggle.evaluate(node => ({ width: getComputedStyle(node).outlineWidth, style: getComputedStyle(node).outlineStyle }));
      expect(parseFloat(focus.width)).toBeGreaterThan(0);
      expect(focus.style).not.toBe('none');
      expect(await icon.evaluate(node => getComputedStyle(node).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
      await field.screenshot({ path: testInfo.outputPath(`password-forced-colors-${locale}-${width}.png`) });
    });
  }
}
