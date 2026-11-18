import { test, expect, hydrated } from '../support/fixtures';
import { languagePages } from '../support/routes';

const targets = [...languagePages.map((p) => p.href), 'en/no-such-page/'];

for (const href of targets) {
  test(`hydration of ${href}`, async ({ page, request, guard }) => {
    const notFound = href.includes('no-such-page');
    if (notFound) guard.allowDocument404(/\/no-such-page\/$/);
    const served = await (await request.get(href)).text();
    expect(served).toMatch(/<app-root\b[^>]*\sngh="/);
    expect(served).toContain('id="hwg-state"');
    expect(served).not.toMatch(/ngSkipHydration/i);
    await page.goto(href);
    await hydrated(page);
    const h1 = await page.locator('h1').count();
    expect(h1).toBe(1);
    expect(await page.locator('main').count()).toBe(1);
  });
}
