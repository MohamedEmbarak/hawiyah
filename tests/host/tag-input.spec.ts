import { expect, test } from '@playwright/test';
import { ADAPTERS, box, computed, openCase, section } from './support';

// TAGINPUT-03: one border surrounds the chips and the text input, the input has
// no border of its own and the label is outside the box; the box has the same
// height in the four adapters.
for (const adapter of ADAPTERS) {
  test(`TAGINPUT-03 ${adapter}: one border around chips and input, label outside, same box height as the other adapters`, async ({ page }) => {
    for (const lang of ['en', 'ar'] as const) {
      await openCase(page, 'TAGINPUT-03', { lang });
      const root = section(page, adapter);
      const tagBox = root.locator('.hw-tag-input');
      const input = tagBox.locator('input.hw-input');
      const label = root.locator('label.hw-label');
      await expect(tagBox.locator('.hw-chip')).toHaveCount(2);
      const border = await computed(tagBox, ['border-top-width', 'border-top-style', 'border-bottom-width', 'border-inline-start-width', 'border-inline-end-width']);
      expect(border['border-top-style']).toBe('solid');
      for (const side of ['border-top-width', 'border-bottom-width', 'border-inline-start-width', 'border-inline-end-width']) expect(parseFloat(border[side]!), side).toBeGreaterThan(0);
      const own = await computed(input, ['border-top-width', 'border-bottom-width', 'border-inline-start-width', 'border-inline-end-width']);
      for (const [side, width] of Object.entries(own)) expect(parseFloat(width), `input ${side}`).toBe(0);
      expect(await label.evaluate((node, boxNode) => boxNode!.contains(node), await tagBox.elementHandle())).toBe(false);
      const outer = await box(tagBox);
      const name = await box(label);
      expect(name.bottom).toBeLessThanOrEqual(outer.top + 0.5);
      const inner = await box(input);
      expect(inner.top).toBeGreaterThanOrEqual(outer.top);
      expect(inner.bottom).toBeLessThanOrEqual(outer.bottom);
      for (const other of ADAPTERS.filter((name) => name !== adapter)) {
        const height = (await box(section(page, other).locator('.hw-tag-input'))).height;
        expect(Math.abs(outer.height - height), `${adapter} ${outer.height} against ${other} ${height} (${lang})`).toBeLessThanOrEqual(1);
      }
    }
  });
}
