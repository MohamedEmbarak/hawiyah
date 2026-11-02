import { expect, type Locator, type Page } from '@playwright/test';

export async function checkCalendarPresentation(page: Page, picker: Locator) {
  const input = picker.locator('input[type=text]');
  const trigger = picker.locator('.nq-date-picker-trigger');
  const field = await input.boundingBox(); const icon = await trigger.boundingBox();
  expect(icon!.x).toBeGreaterThanOrEqual(field!.x);
  expect(icon!.x + icon!.width).toBeLessThanOrEqual(field!.x + field!.width + 1);
  await trigger.click();
  const dialog = picker.locator('dialog');
  await expect(dialog).toBeVisible();
  await dialog.locator('input[value=gregory]').check();
  const before = await dialog.boundingBox();
  await expect(dialog.locator('tbody tr')).toHaveCount(6);
  await dialog.locator('input[value=islamic-umalqura]').check();
  const after = await dialog.boundingBox();
  expect(Math.abs(before!.height - after!.height)).toBeLessThan(1);
  expect(Math.abs(before!.y - after!.y)).toBeLessThan(1);
  expect(await dialog.locator('.nq-calendar-day').allTextContents()).not.toEqual([]);
  expect((await dialog.innerText()).match(/[٠-٩۰-۹]/u)).toBeNull();
  const colors = await dialog.locator('.nq-calendar-switch').evaluate(node => ({ actual: getComputedStyle(node, '::before').backgroundColor, primary: getComputedStyle(node).getPropertyValue('--nq-color-primary').trim() }));
  expect(colors.actual).toBe(await dialog.locator('[aria-selected=true] .nq-calendar-day').evaluate(node => getComputedStyle(node).backgroundColor));
  const info = dialog.locator('.nq-calendar-info .nq-tooltip-trigger');
  const panel = dialog.locator('.nq-calendar-info [role=tooltip]');
  await expect(info).not.toHaveAttribute('aria-expanded');
  await info.hover(); await expect(panel).toBeVisible();
  await expect(panel).toContainText('1924-08-01');
  expect((await dialog.boundingBox())!.height).toBe(after!.height);
  const box = await panel.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  await info.focus();
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden(); await expect(dialog).toBeVisible();
  await expect(info).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden(); await expect(trigger).toBeFocused();
}
