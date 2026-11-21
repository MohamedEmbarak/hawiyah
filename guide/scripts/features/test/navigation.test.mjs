// The navigation index and the categories (5a.2): every category id of components.json
// has a label in Arabic and English in the guide's text sources; the index orders the
// built pages by category and components.json; no browser output of the build has the
// content manifest among its inputs.
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { navigationIndex } from '../../content/manifest.mjs';
import { runContent } from '../../content/pipeline.mjs';
import { BUILD_TIME_ONLY, buildTimeInputs, checkBrowserStats } from '../bundle.mjs';

const guideDir = fileURLToPath(new URL('../../../', import.meta.url));
const components = JSON.parse(readFileSync(join(guideDir, '..', 'components.json'), 'utf8')).components;
const labels = JSON.parse(readFileSync(join(guideDir, 'src', 'app', 'i18n', 'categories.json'), 'utf8'));
const categories = [...new Set(components.map((entry) => entry.category))];

describe('category labels', () => {
  it('components.json has ten categories', () => {
    expect(categories).toHaveLength(10);
  });

  it('every category id of components.json has a label in ar and en, and no other id has one', () => {
    expect(Object.keys(labels).sort()).toEqual(['ar', 'en']);
    for (const lang of ['ar', 'en']) {
      expect(Object.keys(labels[lang]).sort(), lang).toEqual([...categories].sort());
      for (const id of categories) expect(labels[lang][id]?.trim(), `${lang}.${id}`).toBeTruthy();
      expect(new Set(Object.values(labels[lang])).size, `${lang}: labels are distinct`).toBe(categories.length);
    }
  });

  it('writes the Arabic labels in Arabic script and the English labels without it', () => {
    for (const id of categories) {
      expect(labels.ar[id], id).toMatch(/^[؀-ۿ\s]+$/);
      expect(labels.en[id], id).toMatch(/^[A-Za-z][A-Za-z ]+$/);
    }
  });
});

describe('navigation index', () => {
  const page = (id, extra = {}) => ({
    id,
    langs: ['ar', 'en'],
    title: { en: id, ar: id },
    summaryText: { en: `${id} summary`, ar: `${id} ملخص` },
    headings: {
      en: [{ id: 'example', level: 2, text: 'Example' }, { id: 'sizes', level: 3, text: 'Sizes' }],
      ar: [{ id: 'example', level: 2, text: 'مثال' }, { id: 'sizes', level: 3, text: 'الأحجام' }],
    },
    liveGroups: [{ example: 'primary', section: 'example', frameworks: 4 }, { example: 'sizes', section: 'sizes', frameworks: 4 }],
    ...extra,
  });

  it('orders the pages by category, then by components.json, and lists only categories with a page', () => {
    const index = navigationIndex([page('tabs'), page('link'), page('button'), page('card')], components);
    expect(index.pages.map((entry) => entry.id)).toEqual(['button', 'link', 'tabs', 'card']);
    expect(index.categories).toEqual(['actions', 'navigation', 'layout']);
    expect(index.pages.map((entry) => entry.category)).toEqual(['actions', 'actions', 'navigation', 'layout']);
  });

  it('carries names, summaries and the live groups, with the text of a group\'s own heading', () => {
    const [entry] = navigationIndex([page('button')], components).pages;
    expect(entry).toEqual({
      id: 'button',
      langs: ['ar', 'en'],
      category: 'actions',
      title: { en: 'button', ar: 'button' },
      summary: { en: 'button summary', ar: 'button ملخص' },
      examples: [{ example: 'primary', section: 'example' }, { example: 'sizes', section: 'sizes', title: { en: 'Sizes', ar: 'الأحجام' } }],
    });
    // No headings, no page models: the index is the slim part of the manifest.
    expect(Object.keys(entry)).not.toContain('headings');
  });

  it('is written by step 20 beside the manifest, and the route list holds ids and languages only', () => {
    const dir = mkdtempSync(join(tmpdir(), 'hawiyah-navigation-'));
    const result = runContent({
      guideDir,
      repoDir: join(guideDir, '..'),
      componentsDir: join(guideDir, '..', 'docs', 'components'),
      componentsFile: join(guideDir, '..', 'components.json'),
      outDir: dir,
      liveGroupsFile: join(dir, 'live-groups.json'),
    });
    expect(result.findings).toEqual([]);
    const manifest = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8'));
    const written = JSON.parse(readFileSync(join(dir, 'navigation.json'), 'utf8'));
    expect(written).toEqual(navigationIndex(manifest.pages, components));
    expect(JSON.parse(readFileSync(join(dir, 'routes.json'), 'utf8'))).toEqual(written.pages.map(({ id, langs }) => ({ id, langs })));
    // Independent of the real page set: the index holds exactly the pages of the manifest.
    expect(written.pages.length).toBeGreaterThan(0);
    expect(written.pages.map((entry) => entry.id).sort()).toEqual(manifest.pages.map((entry) => entry.id).sort());
    rmSync(dir, { recursive: true, force: true });
  });
});

describe('the content manifest stays out of the browser', () => {
  const stats = (inputs) => ({ outputs: { 'main-X.js': { entryPoint: 'src/main.ts', inputs }, 'chunk-Y.js': { inputs: { 'src/app/x.ts': { bytesInOutput: 10 } } } } });

  it('finds a browser output that has the manifest among its inputs', () => {
    expect(BUILD_TIME_ONLY).toEqual(['src/generated/content/manifest.json']);
    expect(buildTimeInputs(stats({ 'src/generated/content/manifest.json': { bytesInOutput: 6963 } }))).toEqual([
      { output: 'main-X.js', entryPoint: 'src/main.ts', input: 'src/generated/content/manifest.json', bytes: 6963 },
    ]);
    expect(buildTimeInputs(stats({ 'src/generated/content/navigation.json': { bytesInOutput: 900 } }))).toEqual([]);
  });

  // The build fails at step 40 on such an input (checkBrowserStats); this reads the
  // metafile of the last production build in dist/ when there is one (the acceptance
  // runs it after HAWIYAH_BASE_PATH=/hawiyah/ npm run build).
  it('the browser-stats.json of the last production build has no browser output with the manifest', () => {
    const file = join(guideDir, 'dist', 'browser-stats.json');
    if (!existsSync(file)) {
      expect(() => checkBrowserStats(file)).toThrow('does not exist');
      return;
    }
    const metafile = JSON.parse(readFileSync(file, 'utf8'));
    expect(Object.keys(metafile.outputs).length).toBeGreaterThan(10);
    expect(buildTimeInputs(metafile)).toEqual([]);
    expect(Object.values(metafile.outputs).some((output) => Object.keys(output.inputs ?? {}).includes('src/generated/content/navigation.json'))).toBe(true);
  });
});
