import { expect, test } from '@playwright/test';
import { box, computed, openCase, section } from './support';

// ATTR-06 (sticky content navigation and popover host, Angular): a sticky
// hw-content-navigation still sticks inside its column, and hw-popover flows
// inline like the React root.
test('ATTR-06 angular: a sticky hw-content-navigation sticks inside its column', async ({ page }) => {
  await openCase(page, 'ATTR-06', { adapters: ['angular'], viewport: { width: 1280, height: 800 } });
  const root = section(page, 'angular');
  const host = root.locator('hw-content-navigation');
  expect((await computed(host, ['display'])).display).toBe('contents');
  const nav = root.locator('nav.hw-content-nav');
  await expect(nav).toHaveAttribute('data-sticky', 'true');
  expect((await computed(nav, ['position'])).position).toBe('sticky');
  const column = root.locator('[data-fixture="column"]');
  const stickTop = parseFloat((await computed(nav, ['top'])).top!);
  const start = await box(nav);
  // Scroll the page so that the column passes the sticky offset.
  await page.evaluate((top) => window.scrollTo(0, top), start.top + 600);
  await page.waitForFunction(() => window.scrollY > 0);
  const stuck = await box(nav);
  const area = await box(column);
  expect(stuck.top, 'the navigation stays at its sticky offset').toBeCloseTo(stickTop, 0);
  expect(area.top, 'the column has scrolled past the offset').toBeLessThan(stickTop);
  expect(stuck.left).toBeGreaterThanOrEqual(area.left - 0.5);
  expect(stuck.right).toBeLessThanOrEqual(area.right + 0.5);
  expect(stuck.bottom).toBeLessThanOrEqual(area.bottom + 0.5);
  // At the end of the column the navigation leaves with it instead of overflowing.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const end = await box(nav);
  const endArea = await box(column);
  expect(end.bottom).toBeLessThanOrEqual(endArea.bottom + 0.5);
});

test('ATTR-06 angular: hw-popover flows inline in a sentence like the React Popover root', async ({ page }) => {
  for (const lang of ['en', 'ar'] as const) {
    await openCase(page, 'ATTR-06', { lang, adapters: ['react', 'angular'], viewport: { width: 1280, height: 800 } });
    const measure = async (adapter: 'react' | 'angular') => {
      const sentence = section(page, adapter).locator('p[data-fixture="sentence"]');
      const element = adapter === 'angular' ? sentence.locator('hw-popover') : sentence.locator('.hw-popover');
      const outer = await box(sentence);
      const inner = await box(element);
      return {
        display: (await computed(element, ['display'])).display,
        top: inner.top - outer.top,
        height: inner.height,
        width: inner.width,
        lines: Math.round(outer.height / inner.height),
      };
    };
    const angular = await measure('angular');
    const react = await measure('react');
    expect(angular.display, lang).toBe('inline-block');
    expect(Math.abs(angular.top - react.top), `${lang}: offset in the line`).toBeLessThanOrEqual(1);
    expect(Math.abs(angular.height - react.height), `${lang}: height`).toBeLessThanOrEqual(1);
    expect(Math.abs(angular.width - react.width), `${lang}: width`).toBeLessThanOrEqual(1);
    expect(angular.lines, `${lang}: one line`).toBe(react.lines);
    // The text after the popover continues on the same line.
    const sameLine = await section(page, 'angular').locator('p[data-fixture="sentence"]').evaluate((node) => {
      const host = node.querySelector('hw-popover')!.getBoundingClientRect();
      const text = node.lastChild!;
      const range = document.createRange();
      range.selectNodeContents(text);
      const rect = range.getClientRects()[0]!;
      return rect.top < host.bottom && rect.bottom > host.top;
    });
    expect(sameLine, lang).toBe(true);
  }
});
