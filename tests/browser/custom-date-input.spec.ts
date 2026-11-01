import { expect, test } from '@playwright/test';

for (const locale of ['ar', 'en']) {
  test(`inputs lab uses only the custom date popup and submits ISO values (${locale})`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(locale => localStorage.setItem('nasaq-locale', locale), locale);
    await page.goto('/#inputs');
    const form = page.locator('#native-input-lab');
    const input = form.locator('[data-nq-date-input]');
    await expect(input).toHaveAttribute('type', 'text');
    await expect(form.locator('input[type=date]')).toHaveCount(0);
    await input.fill('2026-02-30');
    expect(await input.evaluate(node => (node as HTMLInputElement).checkValidity())).toBe(false);
    expect(await form.evaluate(node => new FormData(node as HTMLFormElement).getAll('date'))).toEqual(['2026-10-28']);
    await input.fill('2026-11-03');
    expect(await input.evaluate(node => (node as HTMLInputElement).checkValidity())).toBe(true);
    await form.locator('input[type=submit]').click();
    await expect(page.locator('#native-input-output')).toContainText('"date": "2026-11-03"');
    await input.focus(); await input.press('ArrowDown');
    const dialog = form.locator('[data-nq-date-dialog]'); await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape'); await expect(input).toBeFocused();
    await input.click(); await expect(dialog).toBeHidden();
    await input.fill(''); expect(await form.evaluate(node => new FormData(node as HTMLFormElement).get('date'))).toBe('');
    await form.locator('input[type=reset]').click(); await expect(input).toHaveValue('2026-10-28');
    await input.evaluate(node => { (node as HTMLInputElement).min = '2026-10-20'; (node as HTMLInputElement).max = '2026-10-28'; });
    await input.press('ArrowDown');
    await expect(dialog.locator('[data-nq-date="2026-10-19"]')).toBeDisabled();
    await expect(dialog.locator('[data-nq-date="2026-10-29"]')).toBeDisabled();
    await page.screenshot({ path: testInfo.outputPath(`custom-input-${locale}.png`) });
    await page.keyboard.press('Escape');
    for (const route of ['#component/date-picker', '#']) {
      await page.goto('/' + route);
      await expect(page.locator('[data-nq-date-input]').first()).toHaveAttribute('type', 'text');
      await expect(page.locator('input[type=date]')).toHaveCount(0);
    }
  });
}
