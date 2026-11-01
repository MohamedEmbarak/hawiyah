import { expect, test } from '@playwright/test';

test('date picker has a readable responsive popup and isolated Arabic date range', async ({ page }, testInfo) => {
  await page.goto('/#component/date-picker');
  const picker = page.locator('[data-nq="date-picker"]');
  // Exercise the live enhanced recipe independently of documentation paragraph widths.
  await picker.evaluate(node=>{ document.body.replaceChildren(node); document.body.style.padding='16px'; });
  const trigger = picker.locator('[data-nq-date-trigger]');
  const input = picker.locator('[data-nq-date-input]');
  for (const direction of ['rtl', 'ltr']) {
    await picker.evaluate((node, direction) => node.setAttribute('dir', direction), direction);
    for (const width of [320, 390, 1280]) {
      await page.setViewportSize({ width, height: 844 });
      const inputBounds = await input.boundingBox();
      const triggerBounds = await trigger.boundingBox();
      const outputBounds = await picker.locator('.nq-date-picker-value').boundingBox();
      expect(outputBounds!.y).toBeGreaterThanOrEqual(Math.max(inputBounds!.y + inputBounds!.height, triggerBounds!.y + triggerBounds!.height) - 1);
      await trigger.click();
      const dialog = picker.locator('dialog');
      await expect(dialog.locator('.nq-dialog-header h2')).toBeVisible();
      await expect(dialog.locator('.nq-dialog-body')).toBeVisible();
      await dialog.evaluate(node=>Promise.all(node.getAnimations().map(animation=>animation.finished.catch(()=>{}))));
      const bounds = await dialog.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      expect(await dialog.evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await dialog.locator('.nq-calendar-day').first().evaluate(node => node.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
      const previous = dialog.locator('.nq-calendar-prev');
      const arrow = await previous.evaluate(node => { const style = getComputedStyle(node, '::before'); return { size: style.width, mask: style.maskImage, transform: style.transform }; });
      expect(arrow.size).toBe('24px'); expect(arrow.mask).toMatch(/^url\(/);
      const iconWidth = await previous.evaluate(node => new Promise<number>(resolve => {
        const src = getComputedStyle(node, '::before').maskImage.slice(5, -2);
        const icon = new Image(); icon.onload = () => resolve(icon.naturalWidth); icon.onerror = () => resolve(0); icon.src = src;
      }));
      expect(iconWidth).toBe(24);
      expect(arrow.transform).toBe(direction === 'rtl' ? 'matrix(-1, 0, 0, 1, 0, 0)' : 'none');
      expect((await previous.boundingBox())!.width).toBeGreaterThanOrEqual(44);
      await expect(dialog.locator('bdi[dir="ltr"]')).toHaveText(['1924-08-01 – 2077-11-16']);
      await expect(input).toHaveValue('2026-10-28');
      if (direction === 'rtl') await page.screenshot({path:testInfo.outputPath(`calendar-${width}-rtl.png`)});
      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
    }
  }
});
