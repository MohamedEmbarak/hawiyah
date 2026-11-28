// Build-time listings of the page block: step 25 writes
// src/generated/examples/<id>/<lang>/listings.json and loaders.ts exposes it.
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';
import { listedFiles, listingLanguage, listingsOf, loadersSource, writeGenerated } from '../write.mjs';

const guideDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const work = mkdtempSync(join(guideDir, '.cache', 'listings-test-'));
afterAll(() => rmSync(work, { recursive: true, force: true }));

const payload = (framework, primaryFile, files) => ({ id: 'tabs', lang: 'ar', dir: 'rtl', example: 'basic', framework, primaryFile, files });

describe('listings', () => {
  it('lists the primary file, and main.js for vanilla', () => {
    expect(listedFiles(payload('vanilla', 'index.html', { 'index.html': '', 'main.js': '' }))).toEqual(['index.html', 'main.js']);
    expect(listedFiles(payload('react', 'Example.tsx', { 'Example.tsx': '', 'main.tsx': '' }))).toEqual(['Example.tsx']);
    expect(listingLanguage('example.component.ts')).toBe('ts');
    expect(listingLanguage('Example.vue')).toBe('vue');
    expect(listingLanguage('README')).toBeNull();
  });

  it('highlights every listed file at build time, by page, example and framework', () => {
    const pages = listingsOf([
      payload('vanilla', 'index.html', { 'index.html': '<div class="hw-tabs"></div>\n', 'main.js': "import { enhance } from '@hawiyah/vanilla';\n" }),
      payload('vue', 'Example.vue', { 'Example.vue': '<template><p>x</p></template>\n', 'main.ts': '' }),
    ]);
    const page = pages.get('tabs/ar');
    expect(Object.keys(page.basic).sort()).toEqual(['vanilla', 'vue']);
    expect(page.basic.vanilla.map((listing) => listing.fileName)).toEqual(['index.html', 'main.js']);
    const [html] = page.basic.vanilla;
    expect(html.text).toBe('<div class="hw-tabs"></div>\n');
    expect(html.lines[0].some((run) => run.r === 'tag')).toBe(true);
    expect(html.lines[0].map((run) => run.t).join('')).toBe('<div class="hw-tabs"></div>');
    expect(page.basic.vanilla[1].lines[0].some((run) => run.r === 'keyword')).toBe(true);
  });

  it('writes listings.json and exposes it through loaders.ts', () => {
    const generated = join(work, 'generated');
    const written = writeGenerated([], generated, [payload('react', 'Example.tsx', { 'Example.tsx': 'export default function Example() { return null; }\n' })]);
    expect(written.listings).toBe(1);
    const json = JSON.parse(readFileSync(join(generated, 'tabs', 'ar', 'listings.json'), 'utf8'));
    expect(json.basic.react[0].fileName).toBe('Example.tsx');
    const loaders = readFileSync(join(generated, 'loaders.ts'), 'utf8');
    expect(loaders).toContain("'tabs/ar': () => import('./tabs/ar/listings.json'),");
    expect(loadersSource([], ['a/en'])).toContain('exampleListingLoaders');
  });
});
