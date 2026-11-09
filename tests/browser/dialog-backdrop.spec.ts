import { expect, test } from '@playwright/test';

for (const component of ['dialog', 'drawer']) {
  test(`vanilla ${component} preserves drags and returns focus after dismissal`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/#component/${component}`);
    const trigger = page.locator('.guide-preview [data-hw-dialog-open]');
    const dialog = page.locator(`.guide-preview dialog[data-hw="${component}"]`);
    await trigger.click();
    await expect(dialog).toBeVisible();
    const bounds = await dialog.boundingBox();
    const title = await dialog.locator('h2').boundingBox();
    const outside = { x: bounds!.x > 5 ? 2 : 388, y: 2 };
    await page.mouse.move(title!.x + title!.width / 2, title!.y + title!.height / 2);
    await page.mouse.down();
    await page.mouse.move(outside.x, outside.y, { steps: 5 });
    await page.mouse.up();
    await expect(dialog).toBeVisible();
    await page.mouse.click(outside.x, outside.y);
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });
}
