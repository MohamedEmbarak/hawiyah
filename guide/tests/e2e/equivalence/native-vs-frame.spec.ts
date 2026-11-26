import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
// @ts-expect-error: plain ES module of the build scripts, without type declarations.
import { HARNESS_PATH, bundleHarness, mountSelector, startHarnessServer } from '../../../scripts/equivalence/run.mjs';
import { test, expect, hydrated } from '../support/fixtures';

// contentPipeline.equivalence.nativeVsFrame: on each pilot brief page, the native
// Angular result (prerendered and hydrated in the page) and the Angular frame of the
// same group (the compiled payload run on the linked runtime by the equivalence
// harness page) have equal aria snapshots, in Arabic and in English.
//
// The harness page is never part of dist: as in build step 80, it is served by the
// harness server of scripts/equivalence/run.mjs over the same dist/browser, here on
// 127.0.0.1 with a free port (HAWIYAH_EQUIVALENCE_PORT plus the worker index when
// set). A document fulfilled by page routing would not do: Chromium treats it as
// outside the loopback address space and blocks the frame's runtime requests.

const PILOTS = [
  { id: 'button', example: 'primary' },
  { id: 'tabs', example: 'basic' },
] as const;
const LANGUAGES = ['ar', 'en'] as const;
const PIN = '0.3.0';
const BASE = '/hawiyah/';

interface Served {
  origin: string;
  close(): Promise<void>;
}

let served: Served | null = null;
let scratch = '';

test.beforeAll(async ({}, info) => {
  scratch = mkdtempSync(join(tmpdir(), 'hawiyah-equivalence-e2e-'));
  const harnessFile = join(scratch, 'harness.js');
  await bundleHarness(harnessFile);
  const port = process.env['HAWIYAH_EQUIVALENCE_PORT'] ? Number(process.env['HAWIYAH_EQUIVALENCE_PORT']) + info.workerIndex : 0;
  const dir = fileURLToPath(new URL('../../../dist/browser', import.meta.url));
  served = (await startHarnessServer({ dir, base: BASE, harnessFile, port })) as Served;
});

test.afterAll(async () => {
  await served?.close();
  if (scratch) rmSync(scratch, { recursive: true, force: true });
});

for (const pilot of PILOTS) {
  for (const lang of LANGUAGES) {
    test(`${pilot.id} ${lang}: the native Angular result and the Angular frame of '${pilot.example}' have equal aria snapshots`, async ({ page }) => {
      await page.goto(`${lang}/components/${pilot.id}/`);
      await hydrated(page);
      const native = page.locator('guide-example-block').first().locator(`guide-native-result guide-example-${pilot.id}-${pilot.example}`);
      await expect(native).toBeVisible();
      const nativeSnapshot = await native.ariaSnapshot();
      expect(nativeSnapshot).toContain(pilot.id === 'tabs' ? '- tablist' : '- button');

      const query = new URLSearchParams({ id: pilot.id, lang, example: pilot.example, pin: PIN, frameworks: 'angular' });
      await page.goto(`${served?.origin}${BASE}${HARNESS_PATH}?${query}`);
      await page.waitForFunction(() => (window as unknown as { __harness?: { done: boolean } }).__harness?.done === true, null, { timeout: 30_000 });
      const state = await page.evaluate(() => (window as unknown as { __harness: { error?: string; frames: Record<string, { state: string; message?: string; log: string[] }> } }).__harness);
      expect(state.error).toBeUndefined();
      expect(state.frames['angular']).toMatchObject({ state: 'ready', log: [] });

      const frame = page.frameLocator('iframe[data-framework="angular"]');
      await expect(frame.locator('html')).toHaveAttribute('lang', lang);
      await expect(frame.locator('html')).toHaveAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      const frameSnapshot = await frame.locator(mountSelector('angular')).ariaSnapshot();
      expect(frameSnapshot).toBe(nativeSnapshot);
    });
  }
}

test('the harness page is not part of the deployed guide', async ({ page }) => {
  const response = await page.request.get(`${HARNESS_PATH}`);
  expect(response.status()).toBe(404);
  const script = await page.request.get(`${HARNESS_PATH}harness.js`);
  expect(script.status()).toBe(404);
});

// 5a.9: on every reference page of the build, a group without frame renders its Angular
// result natively in the page (prerendered and hydrated), and a group with frame never
// does (pages/framed.spec.ts covers its frame).
const builtManifest = JSON.parse(readFileSync(fileURLToPath(new URL('../../../src/generated/content/manifest.json', import.meta.url)), 'utf8')) as {
  pages: { id: string; kind?: 'guide' | 'template'; slug?: string; langs: ('ar' | 'en')[]; liveGroups: { example: string; frame?: true }[] }[];
};
// A guide or a template is one page at <lang>/guides/<id>/ or <lang>/templates/<id>/; its key
// (guide:<id>) names its native examples with an underscore in place of the colon.
const pathOf = (entry: (typeof builtManifest.pages)[number]): string => (entry.kind ? `${entry.kind}s/${entry.slug}/` : `components/${entry.id}/reference/`);
for (const entry of builtManifest.pages) {
  for (const lang of entry.langs) {
    test(`${entry.id} ${lang}: every unframed group renders Angular natively, a framed group does not`, async ({ page }) => {
      await page.goto(`${lang}/${pathOf(entry)}`);
      await hydrated(page);
      const blocks = page.locator('guide-example-block');
      await expect(blocks).toHaveCount(entry.liveGroups.length);
      for (const [index, group] of entry.liveGroups.entries()) {
        const native = blocks.nth(index).locator(`guide-native-result guide-example-${entry.id.replace(':', '_')}-${group.example}`);
        await expect(native, `${entry.id}/${group.example}`).toHaveCount(group.frame ? 0 : 1);
      }
    });
  }
}
