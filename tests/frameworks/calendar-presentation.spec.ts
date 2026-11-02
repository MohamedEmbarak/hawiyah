import { test } from '@playwright/test';
import { checkCalendarPresentation } from '../helpers/calendar-presentation';
for (const dir of ['rtl', 'ltr']) test(`calendar remains steady with muted month info tooltip (${dir})`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const picker = page.getByTestId('calendar-showcase').locator('.nq-date-picker');
  await picker.evaluate((node, dir) => node.setAttribute('dir', dir), dir);
  await checkCalendarPresentation(page, picker);
});
