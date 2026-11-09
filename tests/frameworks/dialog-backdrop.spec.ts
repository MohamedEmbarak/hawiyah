import { expect, test } from '@playwright/test';

test('native dialog keeps content drags open and dismisses intentional backdrop gestures', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const picker = page.getByTestId('calendar-showcase').locator('.hw-date-picker');
  const trigger = picker.locator('.hw-date-picker-trigger');
  const dialog = picker.locator('dialog');
  await trigger.click();
  await expect(dialog).toBeVisible();
  const title = dialog.locator('h2');
  const bounds = await title.boundingBox();
  const inside = { x: bounds!.x + bounds!.width / 2, y: bounds!.y + bounds!.height / 2 };
  await page.mouse.move(inside.x, inside.y);
  await page.mouse.down();
  await page.mouse.move(2, 2, { steps: 5 });
  await page.mouse.up();
  await expect(dialog).toBeVisible();
  await page.mouse.click(2, 2);
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  // Backdrop-to-content drags must also leave the dialog open.
  await page.mouse.move(2, 2);
  await page.mouse.down();
  await page.mouse.move(inside.x, inside.y, { steps: 5 });
  await page.mouse.up();
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
