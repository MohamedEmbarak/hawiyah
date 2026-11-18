import { expect, test, type Page } from '@playwright/test';
import { ADAPTERS, computed, keyboardFocus, openCase, section, type Adapter } from './support';

// TOGGLE-GROUP-02: rest, hover and focus-visible colours of an unpressed and a
// pressed button of a multiple-mode ToggleGroup are equal for the four markups
// (vanilla, React, Vue, Angular), segmented and outline, light and dark, and in
// forced colours.
const properties = ['color', 'background-color', 'border-top-color', 'border-inline-start-color', 'outline-color', 'outline-style', 'outline-width', 'box-shadow'] as const;
const variants = ['segmented', 'outline'] as const;
const states = ['rest', 'hover', 'focus-visible'] as const;

async function colours(page: Page, adapter: Adapter): Promise<Record<string, Record<string, string>>> {
  const result: Record<string, Record<string, string>> = {};
  for (const variant of variants) {
    for (const [pressed, button] of [
      ['pressed', section(page, adapter).locator(`[data-fixture-variant="${variant}"] button[aria-pressed="true"]`)],
      ['unpressed', section(page, adapter).locator(`[data-fixture-variant="${variant}"] button[aria-pressed="false"]`)],
    ] as const) {
      await expect(button).toHaveCount(1);
      for (const state of states) {
        await page.mouse.move(0, 0);
        await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
        if (state === 'hover') await button.hover();
        if (state === 'focus-visible') await keyboardFocus(page, button);
        // Let transitions settle before reading the colours.
        await page.waitForTimeout(60);
        result[`${variant} ${pressed} ${state}`] = await computed(button, properties);
      }
    }
  }
  return result;
}

for (const adapter of ADAPTERS) {
  for (const mode of ['light', 'dark', 'forced'] as const) {
    test(`TOGGLE-GROUP-02 ${adapter}: multiple-mode button colours equal the other adapters (${mode})`, async ({ page }) => {
      if (mode === 'forced') await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
      else await page.emulateMedia({ reducedMotion: 'reduce' });
      await openCase(page, 'TOGGLE-GROUP-02', { mode: mode === 'dark' ? 'dark' : 'light' });
      const own = await colours(page, adapter);
      // Pressed and unpressed must be told apart, so equality is not trivially met.
      expect(own['segmented pressed rest']).not.toEqual(own['segmented unpressed rest']);
      for (const other of ADAPTERS.filter((name) => name !== adapter)) {
        expect(own, `${adapter} against ${other}`).toEqual(await colours(page, other));
      }
    });
  }
}
