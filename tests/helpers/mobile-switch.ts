import { expect, type Locator, type Page } from '@playwright/test';

async function geometry(control: Locator) {
  return control.evaluate(node => {
    const box = node.getBoundingClientRect(); const track = getComputedStyle(node); const thumb = getComputedStyle(node, '::before');
    return { width: box.width, height: box.height, thumbWidth: parseFloat(thumb.width), thumbHeight: parseFloat(thumb.height), x: parseFloat(track.borderLeftWidth) + parseFloat(thumb.left), y: parseFloat(track.borderTopWidth) + parseFloat(thumb.top) };
  });
}

export async function checkMobileSwitches(page: Page, scope: Locator, direction: 'ltr' | 'rtl', themes = ['dga']) {
  const mobile = scope.locator('input[name="mobile-switch"]');
  const disabled = scope.locator('input[name="mobile-switch-disabled"]');
  for (const theme of themes) {
    await scope.evaluate((node, value) => node.setAttribute('data-hw-theme', value), theme);
    for (const mode of ['light', 'dark']) {
      await scope.evaluate((node, value) => node.setAttribute('data-hw-mode', value), mode);
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      for (const [name, small] of [['mobile-switch', false], ['desktop-switch', true], ['compact-switch', true]] as const) {
        const control = scope.locator(`input[name="${name}"]`);
        const width = small ? 44 : 52, height = small ? 26 : 32, thumb = small ? 18 : 28, edge = small ? 4 : 2;
        const expected = (checked: boolean) => ({ width, height, thumbWidth: thumb, thumbHeight: thumb, x: checked !== (direction === 'rtl') ? 22 : edge, y: edge });
        await expect(control).not.toBeChecked();
        await expect.poll(() => geometry(control)).toEqual(expected(false));
        await control.focus(); await page.keyboard.press('Space'); await expect(control).toBeChecked();
        await expect.poll(() => geometry(control)).toEqual(expected(true));
        await page.keyboard.press('Space'); await expect(control).not.toBeChecked();
        await expect.poll(() => geometry(control)).toEqual(expected(false));
      }
      await expect(disabled).toBeDisabled(); await disabled.evaluate(node => (node as HTMLInputElement).click()); await expect(disabled).not.toBeChecked();
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect(mobile).toHaveCSS('transition-duration', '0s');
      expect(await mobile.evaluate(node => getComputedStyle(node, '::before').transitionDuration)).toBe('0s');
      await mobile.focus(); await page.keyboard.press('Space'); await expect(mobile).toBeChecked();
      await expect.poll(() => geometry(mobile)).toEqual({ width: 52, height: 32, thumbWidth: 28, thumbHeight: 28, x: direction === 'rtl' ? 2 : 22, y: 2 });
      await page.keyboard.press('Space'); await expect(mobile).not.toBeChecked();
    }
  }
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await expect(mobile).toHaveCSS('appearance', 'auto');
  expect(await mobile.evaluate(node => getComputedStyle(node, '::before').display)).toBe('none');
  await mobile.focus(); await page.keyboard.press('Space'); await expect(mobile).toBeChecked();
  await expect(mobile).toBeFocused(); await expect(mobile).toHaveCSS('outline-style', 'solid');
}
