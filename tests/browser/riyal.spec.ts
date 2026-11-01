import { expect, test } from '@playwright/test';

for (const locale of ['ar', 'en']) {
  test(`amount input shows the Unicode riyal with a self-hosted font (${locale})`, async ({ page }) => {
    await page.addInitScript(value => localStorage.setItem('nasaq-locale', value), locale);
    await page.goto('/#inputs');
    const amount = page.getByRole('spinbutton', { name: locale === 'ar' ? 'المبلغ بالريال السعودي' : 'Amount in Saudi riyals', exact: true });
    const addon = page.locator('label').filter({ has: amount }).locator('.nq-input-addon');
    await expect(addon).toHaveText('⃁');
    await expect(addon).toHaveAttribute('aria-hidden', 'true');
    await expect(addon.locator('.nq-riyal')).toHaveCSS('font-family', /NasaqRiyal/);
    const loaded = await page.evaluate(async () => {
      const faces = await document.fonts.load('24px NasaqRiyal', '\u20C1');
      return faces.map(face => ({ family: face.family.replace(/^['"]|['"]$/g, ''), status: face.status }));
    });
    expect(loaded).toContainEqual({ family: 'NasaqRiyal', status: 'loaded' });
    await expect(amount).toHaveAttribute('min', '0');
    await expect(amount).toHaveAttribute('step', '0.01');
    await amount.fill('123.45');
    expect(await amount.evaluate((input: HTMLInputElement) => ({ value: input.valueAsNumber, valid: input.validity.valid }))).toEqual({ value: 123.45, valid: true });
    await amount.fill('-1');
    expect(await amount.evaluate((input: HTMLInputElement) => input.validity.rangeUnderflow)).toBe(true);
  });
}
