import { expect, test } from '../support/fixtures';
import {
  FRAME_FRAMEWORKS,
  briefPath,
  frameResources,
  mountMarkup,
  originOf,
  outside,
  readyFrame,
  recordRequests,
  routePayload,
  selectFramework,
  tabsFixture,
} from './support';

// editor.fallback: ?runtime=bundle forces the bundled runtime; the result equals
// the import-map result. A modules run that cannot load its runtime falls back once.
for (const framework of FRAME_FRAMEWORKS) {
  test(`${framework}: ?runtime=bundle gives the same result as the import map`, async ({ page }) => {
    await selectFramework(page, briefPath('en'), framework);
    const modules = await mountMarkup(await readyFrame(page, framework));

    const requests = await recordRequests(page);
    await selectFramework(page, `${briefPath('en')}?runtime=bundle`, framework);
    const frame = await readyFrame(page, framework, 'en', true);
    expect(await mountMarkup(frame)).toBe(modules);
    const loaded = await frameResources(frame);
    expect(loaded.some((url) => url.endsWith(`/hawiyah/runtime/bundles/${framework}.js`))).toBe(true);
    expect(loaded.some((url) => url.includes('/runtime/npm/@hawiyah/') && url.endsWith('.js'))).toBe(false);
    expect(await frame.evaluate(() => document.querySelector('script[type="importmap"]') === null)).toBe(true);
    expect(outside([...requests, ...loaded], originOf(page))).toEqual([]);
  });
}

test('a Tabs group behaves the same on the bundled runtime', async ({ page }) => {
  await routePayload(page, 'ar', 'react', await tabsFixture('react', 'ar'));
  await selectFramework(page, `${briefPath('ar')}?runtime=bundle`, 'react');
  const frame = await readyFrame(page, 'react', 'ar', true);
  const second = frame.getByRole('tab', { name: 'المستندات' });
  await second.click();
  await expect(second).toHaveAttribute('aria-selected', 'true');
  await expect(frame.getByRole('tabpanel')).toHaveText('مستندات الطلب.');
});

test('a modules run whose runtime cannot be fetched falls back to the bundle once', async ({ page, guard }) => {
  // The guide reads the import map in the page (reliably routed); one entry points at a missing file.
  await page.route('**/hawiyah/runtime/import-map.json', async (route) => {
    const response = await route.fetch();
    const map = (await response.json()) as { imports: Record<string, string> };
    map.imports['@hawiyah/vanilla'] = 'runtime/npm/@hawiyah/vanilla@0.3.0/dist/missing.js';
    await route.fulfill({ response, json: map });
  });
  guard.allowDocument404(/\/hawiyah\/runtime\/npm\/@hawiyah\/vanilla@0\.3\.0\/dist\/missing\.js$/);
  await selectFramework(page, briefPath('en'), 'vanilla');
  const frame = await readyFrame(page, 'vanilla', 'en', true);
  await expect(frame.locator('#hawiyah-preview-root button.hw-button')).toHaveText('Continue');
  expect((await frameResources(frame)).some((url) => url.endsWith('/hawiyah/runtime/bundles/vanilla.js'))).toBe(true);
  // Only the failed module request is logged, by the browser inside the first frame.
  const unexpected = guard.messages.filter((message) => !/missing\.js|Failed to fetch dynamically imported module/.test(message));
  expect(unexpected).toEqual([]);
  guard.messages.length = 0;
});
