import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect, axe, hydrated } from '../support/fixtures';

// Framed groups: a group with frame on its html block
// renders its Angular result in the sandboxed frame like the other three, never in
// the guide page, so the main landmark, the skip link and the h1 of a page-level
// component stay out of the guide's outline. On every page with a framed group, in
// both languages: the prerendered document and the hydrated page have exactly one
// main and one h1 (the guide's), axe is clean, the result is a frame once the
// script runs, and without script the block shows its Angular listing and one
// sentence, and no status. The real guide has no framed group yet; the frame fixture
// (scripts/test/frame/generate.mjs, built with --docs) has one.

const generated = fileURLToPath(new URL('../../../src/generated/content/', import.meta.url));
const manifest = JSON.parse(readFileSync(join(generated, 'manifest.json'), 'utf8')) as {
  pages: { id: string; kind?: 'guide' | 'template'; langs: ('ar' | 'en')[]; liveGroups: { example: string; frame?: true }[] }[];
};
const FRAMED_COMPONENTS = ['app-shell', 'portal-layout', 'portal-header', 'portal-footer', 'page-header', 'mobile-top-bar'];
// The component pages with a framed group; the groups of a template are framed by its
// outline (kinds/kinds.spec.ts covers them) and a guide has none.
const framedPages = manifest.pages.filter((page) => !page.kind && page.liveGroups.some((group) => group.frame));

test('only templates carry framed groups among the guides and templates', () => {
  expect(manifest.pages.filter((page) => page.kind === 'guide' && page.liveGroups.some((group) => group.frame)).map((page) => page.id)).toEqual([]);
  expect(manifest.pages.filter((page) => page.kind === 'template' && page.liveGroups.some((group) => !group.frame)).map((page) => page.id)).toEqual([]);
});
const NOTE = {
  en: 'This example renders a landmark or a main heading of its own, so its result is shown in a frame, which needs JavaScript. The Angular listing below shows its code.',
  ar: 'يعرض هذا المثال معلَمًا أو عنوانًا رئيسيًا خاصًا به، فتظهر نتيجته في إطار يحتاج إلى JavaScript، وتظهر أدناه شيفرته في Angular.',
} as const;

test('only the page-level components carry framed groups', () => {
  expect(framedPages.map((page) => page.id).filter((id) => !FRAMED_COMPONENTS.includes(id))).toEqual([]);
});

for (const entry of framedPages) {
  for (const lang of entry.langs) {
    for (const view of ['', 'reference/']) {
      const path = `${lang}/components/${entry.id}/${view}`;
      test(`${path}: one main and one h1, the framed result in a frame, axe clean`, async ({ page, request }) => {
        const html = await (await request.get(path)).text();
        expect(html.match(/<main\b/g)?.length, 'main elements in the prerendered document').toBe(1);
        expect(html.match(/<h1\b/g)?.length, 'h1 elements in the prerendered document').toBe(1);
        await page.goto(path);
        await hydrated(page);
        const framed = page.locator('guide-example-block').filter({ has: page.locator('.framed-note') });
        await expect(framed.first()).toBeVisible();
        await expect(framed.locator('guide-native-result')).toHaveCount(0);
        await expect(framed.first().locator('iframe')).toHaveCount(1);
        await expect(framed.first().locator('.framed-note')).toBeHidden();
        await expect(page.locator('main')).toHaveCount(1);
        await expect(page.locator('h1')).toHaveCount(1);
        expect(await axe(page)).toEqual([]);
      });
    }
    test.describe(`${lang}/components/${entry.id}/ without script`, () => {
      test.use({ javaScriptEnabled: false });
      test('the Angular listing and the sentence, no result and no status', async ({ page }) => {
        await page.goto(`${lang}/components/${entry.id}/`);
        const block = page.locator('guide-example-block').first();
        await expect(block.locator('.framed-note')).toHaveText(NOTE[lang]);
        await expect(block.locator('.framed-note')).toBeVisible();
        await expect(block.locator('guide-native-result, iframe')).toHaveCount(0);
        // No status that never resolves: the frame does not load without script.
        await expect(block.locator('.status')).toBeHidden();
        // The Angular tab is selected on the server: its listing is the one shown.
        const shown = block.locator('pre').filter({ visible: true });
        await expect(shown).toHaveCount(1);
        await expect(shown).toContainText(`hw-${entry.id}`);
      });
    });
  }
}
