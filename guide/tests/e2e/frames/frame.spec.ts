import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { expect, hydrated, test } from '../support/fixtures';
import { pageModel } from '../support/routes';
import {
  FRAME_FRAMEWORKS,
  FRAMEWORK_NAMES,
  briefPath,
  frameElement,
  frameResources,
  originOf,
  outside,
  readyFrame,
  recordRequests,
  routePayload,
  selectFramework,
  statusOf,
  tabsFixture,
  tabsText,
} from './support';

// Each framework result loads from runtime/ on the guide's own origin, with no
// request anywhere else (layout guide/tests/e2e/frames/frame.spec.ts).
for (const lang of ['en', 'ar'] as const) {
  for (const framework of FRAME_FRAMEWORKS) {
    test(`${lang} ${framework}: the Button result renders in a sandboxed frame from runtime/`, async ({ page }) => {
      const requests = await recordRequests(page);
      await selectFramework(page, briefPath(lang), framework);
      const name = FRAMEWORK_NAMES[framework];
      await expect(frameElement(page)).toHaveAttribute('sandbox', 'allow-scripts allow-forms');
      await expect(frameElement(page)).toHaveAttribute('referrerpolicy', 'no-referrer');
      await expect(frameElement(page)).toHaveAttribute('title', lang === 'en' ? `Result in ${name}` : `النتيجة في ${name}`);
      const frame = await readyFrame(page, framework, lang);
      const button = frame.locator('#hawiyah-preview-root button.hw-button');
      await expect(button).toHaveText(lang === 'en' ? 'Continue' : 'متابعة');
      await expect(button).toHaveAttribute('data-variant', 'primary');
      expect(await frame.evaluate(() => [document.documentElement.lang, document.documentElement.dir])).toEqual([lang, lang === 'ar' ? 'rtl' : 'ltr']);
      const origin = originOf(page);
      const loaded = await frameResources(frame);
      expect(outside([...requests, ...loaded], origin)).toEqual([]);
      const runtime = loaded.filter((url) => url.startsWith(`${origin}/hawiyah/runtime/`));
      expect(runtime.some((url) => url.endsWith(`/runtime/npm/@hawiyah/${framework}@0.3.0/dist/index.js`))).toBe(true);
      expect(runtime.some((url) => url.endsWith('/runtime/npm/@hawiyah/styles@0.3.0/dist/styles.css'))).toBe(true);
      expect(await frame.evaluate(() => [...document.fonts].some((face) => face.status === 'loaded'))).toBe(true);
      expect(loaded.some((url) => url.includes('/runtime/bundles/'))).toBe(false);
      // The frame grew to its content and stays within the clamp.
      const height = await frameElement(page).evaluate((element) => element.getBoundingClientRect().height);
      expect(height).toBeGreaterThanOrEqual(80);
      expect(height).toBeLessThan(400);
    });
  }
}

test('the frame follows the colour mode with a new run', async ({ page }) => {
  await selectFramework(page, briefPath('en'), 'react');
  let frame = await readyFrame(page, 'react');
  expect(await frame.evaluate(() => document.documentElement.dataset['hwMode'])).toBe('light');
  await page.getByRole('button', { name: 'Dark mode', exact: true }).click();
  await expect(frameElement(page)).toHaveCount(1);
  await expect.poll(async () => {
    const handle = await frameElement(page).elementHandle();
    frame = (await handle?.contentFrame()) ?? frame;
    return frame.evaluate(() => document.documentElement.dataset['hwMode']).catch(() => null);
  }).toBe('dark');
});

test('the page with a frame result has no axe violations, frame content included', async ({ page }) => {
  await selectFramework(page, briefPath('ar'), 'vue');
  await readyFrame(page, 'vue', 'ar');
  // axe's stylesheet preload would fetch from inside the frame, which connect-src 'none' refuses.
  const axePage = page as unknown as ConstructorParameters<typeof AxeBuilder>[0]['page'];
  const result = await new AxeBuilder({ page: axePage })
    // options() replaces the whole options object, so it precedes withTags().
    .options({ preload: false })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  expect(result.passes.some((rule) => rule.nodes.some((node) => node.target.length > 1))).toBe(true);
});

// leadAmendments A10: the frame document's own <title> carries the frame title, so
// axe run inside the frame document alone (not from the page) passes document-title.
const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js', { paths: [require.resolve('@axe-core/playwright')] }), 'utf8');
for (const lang of ['en', 'ar'] as const) {
  test(`${lang}: axe inside the frame document alone finds no document-title violation`, async ({ page }) => {
    await selectFramework(page, briefPath(lang), 'react');
    const frame = await readyFrame(page, 'react', lang);
    expect(await frame.title()).toBe(lang === 'en' ? 'Result in React' : 'النتيجة في React');
    // Evaluated through the DevTools protocol, which the frame's script-src does not restrict.
    await frame.evaluate(axeSource);
    const result = await frame.evaluate(async () => {
      const axe = (globalThis as unknown as { axe: { run: (context: Document, options: object) => Promise<{ violations: { id: string }[]; passes: { id: string }[] }> } }).axe;
      const run = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, preload: false });
      return { violations: run.violations.map((rule) => rule.id), passes: run.passes.map((rule) => rule.id) };
    });
    expect(result.violations).not.toContain('document-title');
    expect(result.passes).toContain('document-title');
  });
}

// Tabs is the first component with behaviour in a frame; the frames must work for
// a group of any component. The fixture replaces the pilot payload in the browser.
for (const lang of ['en', 'ar'] as const) {
  for (const framework of FRAME_FRAMEWORKS) {
    test(`${lang} ${framework}: a Tabs group runs with keyboard and pointer in the frame`, async ({ page }) => {
      const requests = await recordRequests(page);
      await routePayload(page, lang, framework, await tabsFixture(framework, lang));
      await selectFramework(page, briefPath(lang), framework);
      const frame = await readyFrame(page, framework, lang);
      const t = tabsText[lang];
      const tablist = frame.getByRole('tablist', { name: t.label });
      const first = tablist.getByRole('tab', { name: t.one });
      const second = tablist.getByRole('tab', { name: t.two });
      await expect(first).toHaveAttribute('aria-selected', 'true');
      await expect(frame.getByRole('tabpanel')).toHaveText(t.p1);
      await second.click();
      await expect(second).toHaveAttribute('aria-selected', 'true');
      await expect(frame.getByRole('tabpanel')).toHaveText(t.p2);
      await second.focus();
      // In right-to-left the previous tab is to the right.
      await page.keyboard.press(lang === 'ar' ? 'ArrowRight' : 'ArrowLeft');
      await expect(first).toHaveAttribute('aria-selected', 'true');
      await expect(first).toBeFocused();
      expect(outside([...requests, ...(await frameResources(frame))], originOf(page))).toEqual([]);
    });
  }
}

test('an Angular precompiled example runs in a frame on the linked runtime', async ({ page, request }) => {
  const requests = await recordRequests(page);
  const angular = (await (await request.get('examples/button/en/primary/angular.json')).json()) as Record<string, unknown>;
  await routePayload(page, 'en', 'react', angular);
  await selectFramework(page, briefPath('en'), 'react');
  const frame = await readyFrame(page, 'react');
  await expect(frame.locator('guide-example button.hw-button')).toHaveText('Continue');
  const loaded = await frameResources(frame);
  expect(outside([...requests, ...loaded], originOf(page))).toEqual([]);
  expect(loaded.some((url) => url.endsWith('/runtime/linked/@hawiyah/angular@0.3.0/dist/fesm2022/hawiyah-angular.mjs'))).toBe(true);
  expect(loaded.some((url) => url.includes('/runtime/bundled/rxjs@7.8.2/'))).toBe(true);
});

test('a payload that cannot be loaded reports a failed status', async ({ page, guard }) => {
  await page.route('**/examples/button/en/primary/vue.json', (route) => route.fulfill({ status: 404, body: 'missing' }));
  guard.allowDocument404(/\/examples\/button\/en\/primary\/vue\.json$/);
  await selectFramework(page, briefPath('en'), 'vue');
  await expect(statusOf(page)).toHaveText('The Vue result could not be loaded: The compiled example could not be loaded.');
  await expect(frameElement(page)).toHaveCount(0);
});

test('returning to Angular shows the native result again', async ({ page }) => {
  await selectFramework(page, briefPath('en'), 'vanilla');
  await readyFrame(page, 'vanilla');
  await page.locator('guide-example-block').first().getByRole('tab', { name: 'Angular', exact: true }).click();
  await expect(statusOf(page)).toHaveText('Rendered with @hawiyah/angular 0.3.0 from npm');
  await expect(page.locator('guide-example-block').first().locator('guide-native-result button.hw-button')).toHaveText('Continue');
  await expect(frameElement(page)).toHaveCount(0);
});

test('every frame of the reference view becomes ready, also outside the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 700 });
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem('hawiyah-guide-framework', 'vue');
    } catch {
      // Inside the sandboxed frames storage is unavailable.
    }
  });
  await page.goto('ar/components/button/reference/');
  await hydrated(page);
  const groups = pageModel('button', 'ar').liveGroups.length;
  const statuses = page.locator('guide-example-block p.status');
  await expect(statuses).toHaveCount(groups);
  await expect(statuses).toHaveText(Array(groups).fill('معروض باستخدام @hawiyah/vue 0.3.0 من npm'), { timeout: 30_000 });
});
