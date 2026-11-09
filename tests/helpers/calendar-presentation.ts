import { expect, type Locator, type Page } from '@playwright/test';

export async function checkCalendarPresentation(page: Page, picker: Locator) {
  const input = picker.locator('input[type=text]');
  const trigger = picker.locator('.hw-date-picker-trigger');
  const field = await input.boundingBox(); const icon = await trigger.boundingBox();
  expect(icon!.x).toBeGreaterThanOrEqual(field!.x);
  expect(icon!.x + icon!.width).toBeLessThanOrEqual(field!.x + field!.width + 1);
  await trigger.click();
  const dialog = picker.locator('dialog');
  await expect(dialog).toBeVisible();
  await dialog.locator('input[value=gregory]').check();
  // Cross into a week shared by adjacent month views without losing DOM focus.
  await dialog.locator('[aria-selected=true] .hw-calendar-day').focus();
  await page.keyboard.press('End');
  await page.keyboard.press('ArrowDown');
  await expect(dialog.locator('.hw-calendar-day:focus')).toHaveCount(1);
  const before = await dialog.boundingBox();
  await expect(dialog.locator('tbody tr')).toHaveCount(6);
  await expect(dialog.locator('tbody tr').last().locator('.hw-calendar-day')).toHaveCount(7);
  await expect(dialog.locator('.hw-calendar-empty-week')).toHaveCount(0);
  await dialog.locator('input[value=islamic-umalqura]').check();
  const after = await dialog.boundingBox();
  expect(Math.abs(before!.height - after!.height)).toBeLessThan(1);
  expect(Math.abs(before!.y - after!.y)).toBeLessThan(1);
  await expect(dialog.locator('tbody tr').last().locator('.hw-calendar-day')).toHaveCount(7);
  expect(await dialog.locator('.hw-calendar-day').allTextContents()).not.toEqual([]);
  expect((await dialog.innerText()).match(/[٠-٩۰-۹]/u)).toBeNull();
  const colors = await dialog.locator('.hw-calendar-switch').evaluate(node => ({ actual: getComputedStyle(node, '::before').backgroundColor, primary: getComputedStyle(node).getPropertyValue('--hw-color-primary').trim() }));
  expect(colors.actual).toBe(await dialog.locator('[aria-selected=true] .hw-calendar-day').evaluate(node => getComputedStyle(node).backgroundColor));
  const info = dialog.locator('.hw-calendar-info .hw-tooltip-trigger');
  const panel = dialog.locator('.hw-calendar-info [role=tooltip]');
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
  for (const calendar of ['gregory', 'islamic-umalqura']) {
    await dialog.locator(`input[value="${calendar}"]`).check();
    for (const action of ['next', 'next', 'prev', 'prev']) {
      await dialog.locator(`.hw-calendar-${action}`).click();
      await expect(dialog.locator('tbody tr')).toHaveCount(6);
      await expect(dialog.locator('tbody tr').last().locator('.hw-calendar-day')).toHaveCount(7);
      const box = (await dialog.boundingBox())!;
      expect(Math.abs(box.height - before!.height)).toBeLessThan(1);
      expect(Math.abs(box.y - before!.y)).toBeLessThan(1);
    }
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden(); await expect(trigger).toBeFocused();
}
