import { writeFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { ADAPTERS, box, computed, openCase, section } from './support';

// FILEDROPZONE-08: the label and the hint are inside the dashed border and the
// file input has the same width in the four adapters, LTR and RTL.
for (const adapter of ADAPTERS) {
  test(`FILEDROPZONE-08 ${adapter}: label and hint inside the dashed border, input as wide as in the other adapters, LTR and RTL`, async ({ page }) => {
    for (const lang of ['en', 'ar'] as const) {
      await openCase(page, 'FILEDROPZONE-08', { lang });
      const root = section(page, adapter);
      const zone = root.locator('.hw-file-dropzone');
      expect((await computed(zone, ['border-top-style']))['border-top-style']).toBe('dashed');
      const outer = await box(zone);
      for (const part of ['label.hw-label', '.hw-hint']) {
        const inner = await box(zone.locator(part));
        expect(inner.top, `${part} top (${lang})`).toBeGreaterThanOrEqual(outer.top);
        expect(inner.bottom, `${part} bottom (${lang})`).toBeLessThanOrEqual(outer.bottom);
        expect(inner.left, `${part} left (${lang})`).toBeGreaterThanOrEqual(outer.left);
        expect(inner.right, `${part} right (${lang})`).toBeLessThanOrEqual(outer.right);
      }
      const width = (await box(zone.locator('input[type="file"]'))).width;
      for (const other of ADAPTERS.filter((name) => name !== adapter)) {
        const otherWidth = (await box(section(page, other).locator('.hw-file-dropzone input[type="file"]'))).width;
        expect(Math.abs(width - otherWidth), `${adapter} ${width} against ${other} ${otherWidth} (${lang})`).toBeLessThanOrEqual(1);
      }
    }
  });
}

// FILEDROPZONE-12: a real file drag (Chromium's drag pipeline through the DevTools
// protocol, with a file on disk) over a disabled vanilla zone delivers dragover
// and drop to the zone, and the page does not navigate to the file.
test('FILEDROPZONE-12 vanilla: a real file drag over a disabled zone reaches the zone and does not navigate', async ({ page }, testInfo) => {
  await openCase(page, 'FILEDROPZONE-12', { adapters: ['vanilla'] });
  const zone = section(page, 'vanilla').locator('.hw-file-dropzone');
  await expect(zone.locator('input[type="file"]')).toBeDisabled();
  await zone.evaluate((node) => {
    const seen: string[] = [];
    (window as unknown as { __dropEvents: string[] }).__dropEvents = seen;
    for (const type of ['dragenter', 'dragover', 'drop']) node.addEventListener(type, (event) => seen.push(`${type}:${(event as DragEvent).dataTransfer?.types.includes('Files')}`));
  });
  const file = testInfo.outputPath('drop.pdf');
  writeFileSync(file, '%PDF-1.4\n%%EOF\n');
  const url = page.url();
  const area = await box(zone);
  const x = area.left + area.width / 2;
  const y = area.top + area.height / 2;
  const client = await page.context().newCDPSession(page);
  const data = { items: [], files: [file], dragOperationsMask: 1 };
  for (const type of ['dragEnter', 'dragOver', 'drop'] as const) await client.send('Input.dispatchDragEvent', { type, x, y, data });
  await page.waitForTimeout(300);
  const events = await page.evaluate(() => (window as unknown as { __dropEvents: string[] }).__dropEvents);
  expect(events).toContain('dragover:true');
  expect(events).toContain('drop:true');
  expect(page.url()).toBe(url);
  await expect(zone).not.toHaveAttribute('data-state', 'dragging');
  expect(await page.evaluate(() => document.body.dataset.fixtureReady)).toBe('true');
});
