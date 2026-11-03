import { test } from '@playwright/test';
import { checkCalendarPresentation } from '../helpers/calendar-presentation';
for (const dir of ['rtl', 'ltr']) test(`calendar remains steady with muted month info tooltip (${dir})`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#component/date-picker');
  const picker = page.locator('[data-nq=date-picker]');
  await picker.evaluate((node, dir) => node.setAttribute('dir', dir), dir);
  await checkCalendarPresentation(page, picker);
  await picker.locator('.nq-date-picker-trigger').click();
  await picker.locator('input[value=islamic-umalqura]').check();
  await page.screenshot({ path: testInfo.outputPath(`calendar-${dir}.png`) });
});

test('input lab picker fills its final week without moving the dialog', async ({page}, testInfo) => {
  await page.setViewportSize({width:1864,height:884});
  await page.goto('/#inputs');
  const picker=page.locator('#native-input-lab .nq-date-picker').first();
  await checkCalendarPresentation(page,picker);
  await picker.locator('.nq-date-picker-trigger').click();
  await picker.locator('input[value=gregory]').check();
  await picker.locator('dialog').screenshot({path:testInfo.outputPath('input-lab-filled-weeks.png')});
});
