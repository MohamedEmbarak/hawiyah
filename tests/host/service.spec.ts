import { expect, test, type Locator } from '@playwright/test';
import { ADAPTERS, box, openCase, section, type Adapter } from './support';

// SERVICE-03: for the same content at 386px the ServiceCard height and the badge
// and heading positions agree within 2px in the four adapters, in ar and en.
async function geometry(root: Locator) {
  const card = root.locator('article.hw-service-card');
  const outer = await box(card);
  const relative = async (part: Locator) => {
    const inner = await box(part);
    // Inline offsets from the card's inline start, so LTR and RTL compare alike.
    return { top: inner.top - outer.top, start: Math.min(inner.left - outer.left, outer.right - inner.right), width: inner.width, height: inner.height };
  };
  return { height: outer.height, width: outer.width, badge: await relative(card.locator('.hw-badge')), heading: await relative(card.locator('h3')) };
}

for (const adapter of ADAPTERS) {
  for (const lang of ['en', 'ar'] as const) {
    test(`SERVICE-03 ${adapter}: card height, badge and heading positions agree with the other adapters at 386px (${lang})`, async ({ page }) => {
      await openCase(page, 'SERVICE-03', { lang, viewport: { width: 386, height: 2400 } });
      const own = await geometry(section(page, adapter));
      expect(own.height).toBeGreaterThan(0);
      for (const other of ADAPTERS.filter((name): name is Adapter => name !== adapter)) {
        const theirs = await geometry(section(page, other));
        const label = `${adapter} against ${other}`;
        expect(Math.abs(own.height - theirs.height), `${label}: card height ${own.height} / ${theirs.height}`).toBeLessThanOrEqual(2);
        for (const part of ['badge', 'heading'] as const) {
          for (const key of ['top', 'start', 'width', 'height'] as const) {
            expect(Math.abs(own[part][key] - theirs[part][key]), `${label}: ${part} ${key} ${own[part][key]} / ${theirs[part][key]}`).toBeLessThanOrEqual(2);
          }
        }
      }
    });
  }
}
