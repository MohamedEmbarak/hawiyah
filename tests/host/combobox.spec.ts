import { expect, test } from '@playwright/test';
import { ADAPTERS, box, openCase, section } from './support';

// COMBOBOX-02: with a hint and an error, the top of the listbox is 8px below the
// bottom of the input, in LTR and RTL (package stylesheet only).
for (const adapter of ADAPTERS) {
  test(`COMBOBOX-02 ${adapter}: the listbox opens 8px below the input with a hint and an error, LTR and RTL`, async ({ page }) => {
    for (const lang of ['en', 'ar'] as const) {
      await openCase(page, 'COMBOBOX-02', { lang, adapters: [adapter] });
      const root = section(page, adapter);
      await expect(root.locator('.hw-hint')).toBeVisible();
      await expect(root.locator('.hw-error')).toBeVisible();
      const input = root.getByRole('combobox');
      await input.click();
      const list = root.getByRole('listbox');
      await expect(list).toBeVisible();
      const gap = (await box(list)).top - (await box(input)).bottom;
      expect(gap, `${adapter} ${lang}`).toBeCloseTo(8, 0);
    }
  });
}
