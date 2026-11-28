import { expect, test, type Locator, type Page } from '@playwright/test';
import { ADAPTERS, openCase, section } from './support';

// PININPUT-03: a real clipboard paste and inserted text (insertText) of the three
// strings give the same results: '123 456' -> 123456, '12-34-56' -> 123456,
// '٤٥٦-١٢٣' -> 456123.
const cases = [
  ['123 456', '123456'],
  ['12-34-56', '123456'],
  ['٤٥٦-١٢٣', '456123'],
] as const;

async function clear(page: Page, input: Locator): Promise<void> {
  await input.focus();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.press('Delete');
  await expect(input).toHaveValue('');
}

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

for (const adapter of ADAPTERS) {
  test(`PININPUT-03 ${adapter}: clipboard paste and inserted text normalise the three codes alike`, async ({ page }) => {
    await openCase(page, 'PININPUT-03', { adapters: [adapter] });
    const input = section(page, adapter).getByRole('textbox');
    await expect(input).not.toHaveAttribute('maxlength');
    for (const [code, expected] of cases) {
      await clear(page, input);
      await page.evaluate((text) => navigator.clipboard.writeText(text), code);
      await page.keyboard.press('ControlOrMeta+V');
      await expect(input, `paste ${code}`).toHaveValue(expected);
      await clear(page, input);
      await page.keyboard.insertText(code);
      await expect(input, `insertText ${code}`).toHaveValue(expected);
    }
  });
}
