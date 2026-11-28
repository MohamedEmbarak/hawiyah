import { expect, test } from '@playwright/test';
import { box, middleRow, openCase, section } from './support';

// METER-03: value 10 of 100 paints the same colour and the same filled width in
// the vanilla markup and in the Angular markup.
for (const adapter of ['vanilla', 'angular'] as const) {
  test(`METER-03 ${adapter}: value 10 of 100 paints the colour and filled width of the other markup`, async ({ page }) => {
    for (const lang of ['en', 'ar'] as const) {
      await openCase(page, 'METER-03', { lang, adapters: ['vanilla', 'angular'] });
      const other = adapter === 'vanilla' ? 'angular' : 'vanilla';
      const own = section(page, adapter).locator('meter.hw-meter');
      const theirs = section(page, other).locator('meter.hw-meter');
      await expect(own).toHaveAttribute('value', '10');
      await expect(own).toHaveAttribute('max', '100');
      expect((await box(own)).width, lang).toBeCloseTo((await box(theirs)).width, 0);
      expect((await box(own)).height, lang).toBeCloseTo((await box(theirs)).height, 0);
      const ownRow = await middleRow(page, await own.screenshot({ animations: 'disabled' }));
      const theirRow = await middleRow(page, await theirs.screenshot({ animations: 'disabled' }));
      // The filled part starts at the inline start: count the pixels in the colour
      // of the first column of the bar after the rounded edge.
      const fill = (row: string[]) => {
        const start = lang === 'ar' ? row.length - 1 - Math.floor(row.length * 0.04) : Math.floor(row.length * 0.04);
        const colour = row[start];
        return { colour, width: row.filter((value) => value === colour).length };
      };
      const ownFill = fill(ownRow);
      const theirFill = fill(theirRow);
      expect(ownFill.colour, lang).toBe(theirFill.colour);
      expect(Math.abs(ownFill.width - theirFill.width), lang).toBeLessThanOrEqual(1);
      expect(ownFill.width / ownRow.length, `${lang} filled share`).toBeGreaterThan(0.05);
      expect(ownFill.width / ownRow.length, `${lang} filled share`).toBeLessThan(0.15);
      expect(ownRow, lang).toEqual(theirRow);
    }
  });
}
