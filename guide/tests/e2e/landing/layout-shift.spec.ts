import { test, expect } from '../support/fixtures';
import { available } from '../support/routes';

// Layout shift of the landing page while it loads: from navigation until 5 s after the
// load event, with the browser cache disabled (the web fonts arrive after the first
// render and replace the fallback font, font-display: swap), at 320 and 390 px in
// both languages. The sum of the layout-shift entries without recent input stays
// below 0.1 (the "good" limit of Cumulative Layout Shift).

declare global {
  interface Window {
    __guideShift?: { value: number; entries: string[] };
  }
}

for (const lang of ['ar', 'en'] as const) {
  for (const width of [320, 390]) {
    test(`the landing loads without a layout shift of 0.1 or more at ${width} px (${lang})`, async ({ page }) => {
      test.skip(!available.landing, 'the landing feature is not built');
      await page.setViewportSize({ width, height: 844 });
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
      await page.addInitScript(() => {
        const record = { value: 0, entries: [] as string[] };
        window.__guideShift = record;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean; sources?: { node?: Node | null; previousRect: DOMRectReadOnly; currentRect: DOMRectReadOnly }[] })[]) {
            if (entry.hadRecentInput) continue;
            record.value += entry.value;
            const moved = (entry.sources ?? []).map((source) => {
              const element = source.node instanceof Element ? source.node : source.node?.parentElement;
              return `${element?.localName ?? '?'}.${element?.className ?? ''} y ${Math.round(source.previousRect.y)} -> ${Math.round(source.currentRect.y)}`;
            });
            record.entries.push(`${entry.value.toFixed(4)} at ${Math.round(entry.startTime)} ms: ${moved.join('; ')}`);
          }
        }).observe({ type: 'layout-shift', buffered: true });
      });
      await page.goto(`${lang}/`, { waitUntil: 'load' });
      await page.waitForTimeout(5_000);
      const shift = await page.evaluate(() => window.__guideShift ?? { value: -1, entries: [] });
      expect(shift.value, `layout shift entries:\n${shift.entries.join('\n')}`).toBeGreaterThanOrEqual(0);
      expect(shift.value, `layout shift entries:\n${shift.entries.join('\n')}`).toBeLessThan(0.1);
      test.info().annotations.push({ type: 'layout shift', description: `${lang} ${width} px: ${shift.value.toFixed(4)}` });
    });
  }
}
