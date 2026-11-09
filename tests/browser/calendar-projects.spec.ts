import { expect, test, type Page } from '@playwright/test';
import { getCalendarLabels } from '../../packages/core/src/calendar-labels';
import { getCalendarDateParts } from '../../packages/core/src/saudi-calendar';

const projects = [
  ['react', 'javascript', 'ar'], ['react', 'typescript', 'en'],
  ['vue', 'javascript', 'en'], ['vue', 'typescript', 'ar'], ['angular', 'typescript', 'ar'],
] as const;

async function openProject(page: Page, id: string, framework: string, language: string) {
  await page.goto(`/#component/${id}`);
  await page.locator('[data-guide-tab="playground"]').click();
  await page.locator('[data-project-framework]').selectOption(framework);
  if (framework !== 'angular') await page.locator('[data-project-language]').selectOption(language);
  await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state', 'ready', {timeout: 45000});
  return page.frameLocator('.hw-ide-frame').locator(`[data-calendar-project="${id}"]`);
}

for (const [framework, language, locale] of projects) {
  test(`${framework} ${language} Calendar and DatePicker projects use local UI labels and ISO form values`, async ({page}) => {
    test.setTimeout(180000);
    await page.addInitScript(language => {
      if (window === window.top) localStorage.setItem('hawiyah-locale', language);
    }, locale);
    await page.setViewportSize({width: 1543, height: 1000});
    const copy = getCalendarLabels(locale);
    const calendars = await openProject(page, 'calendar', framework, language);
    const gregorian = calendars.locator('[data-calendar-case="gregory"]');
    const hijri = calendars.locator('[data-calendar-case="islamic-umalqura"]');
    for (const example of [gregorian, hijri]) {
      await expect(example.locator('.hw-calendar-prev')).toHaveAccessibleName(copy.previous);
      await expect(example.locator('.hw-calendar-next')).toHaveAccessibleName(copy.next);
      await expect(example.getByRole('grid').locator('tbody tr')).toHaveCount(6);
    }
    await gregorian.locator('button.hw-calendar-day:not([data-outside="true"])').filter({hasText: /^30$/}).click();
    await expect(calendars.locator('[data-calendar-model]')).toHaveText('2026-10-30');
    await expect(hijri.locator('td[aria-selected="true"] .hw-calendar-day')).toHaveText(String(getCalendarDateParts('2026-10-30', 'islamic-umalqura').day));

    const picker = await openProject(page, 'date-picker', framework, language);
    const input = picker.locator('.hw-date-picker-control input[type="text"]');
    const opener = picker.locator('.hw-date-picker-trigger');
    await expect(picker.locator('input[type="date"]')).toHaveCount(0);
    await expect(opener).toHaveAccessibleName(copy.open);
    const before = await input.inputValue();
    await opener.click();
    const dialog = picker.locator('dialog[open]');
    await expect(dialog).toBeVisible();
    const switcher = dialog.getByRole('radiogroup', {name: copy.system});
    await switcher.locator('label').filter({hasText: copy.hijri}).click();
    await expect(switcher.locator('input[value="islamic-umalqura"]')).toBeChecked();
    await expect(picker.locator('[data-calendar-model]')).toHaveText('2026-10-28');
    await dialog.getByRole('button', {name: copy.close}).click();
    await expect(opener).toBeFocused();
    await expect(input).not.toHaveValue(before);
    expect(await input.inputValue()).not.toMatch(/[٠-٩۰-۹]/u);
    await input.focus();
    await expect(input).toHaveValue('2026-10-28');
    await input.fill('2026-02-30');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(await input.evaluate((el: HTMLInputElement) => el.validationMessage)).toBe(copy.invalid);
    await expect(picker.locator('[data-calendar-model]')).toHaveText('2026-10-28');
    await input.fill('2026-11-05');
    await expect(picker.locator('[data-calendar-model]')).toHaveText('2026-11-05');
    await picker.getByRole('checkbox').check();
    await expect(opener).toBeDisabled();
    await picker.getByRole('checkbox').uncheck();
    await picker.locator('button[type="submit"]').click();
    await expect(picker.locator('[data-calendar-submitted]')).toHaveText('2026-11-05');
    await page.setViewportSize({width: 390, height: 844});
    expect(await picker.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    await expect(page).toHaveURL(/#component\/date-picker$/);
  });
}
