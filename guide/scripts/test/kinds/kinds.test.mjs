// The build around the two document kinds and the two pages generated from the
// installed packages: route verification, the old hash addresses, llms.txt, the list
// of pages of step 10, the example files of steps 25 and 45, step 80's source file,
// check:page, content:scaffold-ar and content:sync-ar, the page rules, the API and
// vocabulary pass, and the generator of the brand and foundations pages.

import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { checkPages } from '../../api-tables/cli.mjs';
import { parseArgs as buildArgs } from '../../build.mjs';
import { parseArgs as checkArgs, pageContent } from '../../check-page.mjs';
import { kindDirs } from '../../content/kinds.mjs';
import { complianceFindings, latinFindings } from '../../content/page-rules.mjs';
import { scaffoldArabic } from '../../content/scaffold-ar.mjs';
import { syncArabic } from '../../content/sync-ar.mjs';
import { sourceFile } from '../../equivalence/run.mjs';
import { groupKey, nativeSelector, validateGroups } from '../../examples/compile.mjs';
import { copyExampleFiles } from '../../examples/files.mjs';
import { loadersSource, payloadPath, writeGenerated } from '../../examples/write.mjs';
import { listPages } from '../../features/generate.mjs';
import { availableRoutes } from '../../index-html/generate.mjs';
import { mapLegacyHash } from '../../index-html/legacy-hash.mjs';
import { prepaintScript } from '../../index-html/prepaint.mjs';
import { installData } from '../../install/generate.mjs';
import { llmsText, packagePages } from '../../llms/generate.mjs';
import { BRAND_SECTION, brandPage, foundationsPage, readmeSection, servedBrandFiles, wordmarkFiles, writePackagePages } from '../../package-pages/generate.mjs';
import { expectedDocuments } from '../../postbuild/verify-routes.mjs';
import { titleFilter } from '../../test-page.mjs';
import { generateKinds } from './generate.mjs';

const guideDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const repoDir = join(guideDir, '..');
const nodeModules = join(guideDir, 'node_modules');
const styles = join(nodeModules, '@hawiyah', 'styles');
let docs;
let dirs;
beforeAll(() => {
  docs = join(mkdtempSync(join(tmpdir(), 'hawiyah-kinds-build-')), 'docs');
  generateKinds({ out: docs });
  dirs = kindDirs({ repoDir, docsDir: docs });
});
afterAll(() => rmSync(join(docs, '..'), { recursive: true, force: true }));

const manifest = {
  pages: [
    { id: 'button', langs: ['ar', 'en'], title: { en: 'Button', ar: 'زر' }, summaryText: { en: 'Button starts an action.', ar: 'يبدأ الزر إجراءً.' } },
    { id: 'guide:getting-started', kind: 'guide', slug: 'getting-started', langs: ['ar', 'en'], title: { en: 'Getting started', ar: 'البدء' }, summaryText: { en: 'Install the packages.', ar: 'ثبّت الحزم.' } },
    { id: 'template:service', kind: 'template', slug: 'service', langs: ['en'], title: { en: 'Service page' }, summaryText: { en: 'A service.' } },
  ],
};
const features = [
  { id: 'catalogue', order: 20, paths: ['components'] },
  { id: 'guides', order: 22, paths: ['guides', 'guides/:id'], nav: { path: 'guides/' } },
  { id: 'templates', order: 24, paths: ['templates', 'templates/:id'], nav: { path: 'templates/' } },
  { id: 'component-pages', order: 30, paths: ['components/:id', 'components/:id/reference'] },
  { id: 'foundations', order: 50, paths: ['foundations'], nav: { path: 'foundations/' } },
  { id: 'brand', order: 52, paths: ['brand'], nav: { path: 'brand/' } },
];

describe('routes of the kinds', () => {
  it('expects a prerendered page for every guide and template of the manifest in its languages', () => {
    const files = expectedDocuments({ features, manifest }).map((doc) => doc.file);
    expect(files).toEqual(expect.arrayContaining([
      'ar/guides/index.html', 'en/guides/getting-started/index.html', 'ar/guides/getting-started/index.html',
      'en/templates/index.html', 'en/templates/service/index.html', 'en/brand/index.html', 'ar/foundations/index.html',
      'en/components/button/index.html',
    ]));
    expect(files).not.toContain('ar/templates/service/index.html');
    expect(files.filter((file) => file.includes('guide:') || file.includes('/components/getting-started/'))).toEqual([]);
  });

  it('maps the old #docs and #templates addresses to the built pages, and #brand and #foundations to theirs', () => {
    const available = availableRoutes({ features: [...features, { id: 'landing', paths: [''] }], pages: { components: [{ id: 'button' }], guides: [{ id: 'getting-started' }], templates: [{ id: 'service' }] } });
    expect(available).toMatchObject({ guides: ['getting-started'], templates: ['service'], guideIndex: true, templateIndex: true, brand: true, foundations: true });
    expect(mapLegacyHash('#docs/getting-started', 'en', available)).toBe('en/guides/getting-started/');
    expect(mapLegacyHash('#docs/react', 'ar', available)).toBe('ar/guides/');
    expect(mapLegacyHash('#docs', 'en', available)).toBe('en/guides/');
    expect(mapLegacyHash('#templates/service?preview=template', 'ar', available)).toBe('ar/templates/service/');
    expect(mapLegacyHash('#templates/home', 'en', available)).toBe('en/templates/');
    expect(mapLegacyHash('#foundations', 'en', available)).toBe('en/foundations/');
    expect(mapLegacyHash('#brand', 'ar', available)).toBe('ar/brand/');
    expect(mapLegacyHash('#layouts', 'ar', available)).toBe('ar/');
    expect(mapLegacyHash('#docs/getting-started', 'en', { components: [], landing: true })).toBe('en/');
    expect(prepaintScript(available)).toContain('"guides":["getting-started"],"templates":["service"],"guideIndex":true,"templateIndex":true,"brand":true,"foundations":true');
  });

  it('lists the guides and templates of index.json whose two languages exist (step 10)', () => {
    const pages = listPages({ docsDir: dirs.component, components: JSON.parse(readFileSync(join(repoDir, 'components.json'), 'utf8')).components, kindDirs: dirs });
    expect(pages.guides).toEqual([{ id: 'fixture-guide' }]);
    expect(pages.templates).toEqual([{ id: 'fixture-template' }]);
    expect(listPages({ docsDir: dirs.component, components: [] }).guides).toEqual([]);
  });

  it('accepts page keys in --pages and in check:page', () => {
    expect(buildArgs(['--pages', 'button,guide:getting-started,template:service']).pages).toEqual(['button', 'guide:getting-started', 'template:service']);
    expect(() => buildArgs(['--pages', 'recipe:x'])).toThrow(/--pages needs page keys/);
    expect(checkArgs(['template:service', '--draft'])).toMatchObject({ id: 'template:service', draft: true });
    expect(titleFilter('guide:fixture-guide')).toBe('(guides/fixture-guide/)');
    expect(titleFilter('button')).toBe('(components/button/|component page button \\()');
    expect(() => checkArgs(['guides/x'])).toThrow(/usage: npm run check:page -- <id> \| guide:<id> \| template:<id>/);
  });
});

describe('llms.txt', () => {
  it('lists the guides, the templates and the pages generated from the packages', () => {
    const text = llmsText({
      manifest, buildInfo: { pin: '0.3.0', siteOrigin: 'https://example.test', basePath: '/hawiyah/' }, install: installData({ pin: '0.3.0', componentCount: 85 }), summary: 'S.',
      generatedPages: packagePages(guideDir, features),
    });
    expect(text).toContain('## Guides\n\n- [Getting started](https://example.test/hawiyah/en/guides/getting-started/): Install the packages. Markdown source: https://github.com/MohamedEmbarak/hawiyah/blob/main/docs/guides/getting-started.md\n');
    expect(text).toContain('## Templates\n\n- [Service page](https://example.test/hawiyah/en/templates/service/): A service. Markdown source: https://github.com/MohamedEmbarak/hawiyah/blob/main/docs/templates/service.md\n');
    expect(text).toContain('## Arabic guides\n\n- [البدء](https://example.test/hawiyah/ar/guides/getting-started/): ثبّت الحزم. Markdown source: https://github.com/MohamedEmbarak/hawiyah/blob/main/docs/guides/getting-started.ar.md\n');
    expect(text).not.toContain('## Arabic templates');
    expect(text).toMatch(/## Generated from the packages\n\n- \[Foundations\]\(https:\/\/example\.test\/hawiyah\/en\/foundations\/\): This page lists the design tokens/);
    expect(text).toMatch(/- \[Brand\]\(https:\/\/example\.test\/hawiyah\/en\/brand\/\): .* Arabic: https:\/\/example\.test\/hawiyah\/ar\/brand\//);
    expect(text.split('## Components')[1].split('##')[0]).not.toContain('guides/');
  });
});

describe('example files of a guide or template key', () => {
  const group = (id) => ({ id, lang: 'en', example: 'continue', blocks: Object.fromEntries(['vanilla', 'react', 'vue', 'angular'].map((framework) => [framework, { code: 'x' }])) });

  it('accepts a key in live-groups.json and writes its colon as a full stop in file names', () => {
    expect(() => validateGroups([group('guide:fixture-guide'), group('template:service'), group('button')])).not.toThrow();
    expect(() => validateGroups([group('recipe:x')])).toThrow(/\.id must match/);
    expect(groupKey(group('guide:fixture-guide'))).toBe('guide:fixture-guide/en/continue');
    expect(nativeSelector(group('guide:fixture-guide'))).toBe('guide-example-guide_fixture-guide-continue');
    expect(payloadPath('/frames', { id: 'template:service', lang: 'ar', example: 'a', framework: 'vue' })).toBe('/frames/template.service/ar/a/vue.json');
    expect(loadersSource(['guide:fixture-guide/en'], ['guide:fixture-guide/en'])).toContain("'guide:fixture-guide/en': () => import('./guide.fixture-guide/en/index'),");
  });

  it('copies the payloads of a key to examples/<path key>/ and writes the native examples there', () => {
    const work = mkdtempSync(join(tmpdir(), 'hawiyah-kind-files-'));
    const payload = { id: 'guide:fixture-guide', lang: 'en', example: 'continue', framework: 'vanilla', files: { 'index.html': '<p></p>' } };
    mkdirSync(join(work, 'frames', 'guide.fixture-guide', 'en', 'continue'), { recursive: true });
    writeFileSync(join(work, 'frames', 'guide.fixture-guide', 'en', 'continue', 'vanilla.json'), JSON.stringify(payload));
    expect(copyExampleFiles(join(work, 'frames'), join(work, 'examples'))).toEqual({ payloads: 1, files: 1 });
    expect(existsSync(join(work, 'examples', 'guide.fixture-guide', 'en', 'continue', 'vanilla', 'index.html'))).toBe(true);
    writeGenerated([{ id: 'guide:fixture-guide', lang: 'en', example: 'continue', className: 'GuideFixtureGuideContinueEn', source: 'export class GuideFixtureGuideContinueEn {}\n' }], join(work, 'generated'));
    expect(existsSync(join(work, 'generated', 'guide.fixture-guide', 'en', 'index.ts'))).toBe(true);
    rmSync(work, { recursive: true, force: true });
  });

  it('reports a finding of step 80 in the Markdown file of the guide or template', () => {
    expect(sourceFile({ id: 'guide:x', lang: 'ar', sourcePath: 'docs/guides/x.ar.md' })).toBe('docs/guides/x.ar.md');
    expect(sourceFile({ id: 'button', lang: 'ar' })).toBe('docs/components/button.ar.md');
  });
});

describe('the writer tools for guides and templates', () => {
  it('runs the content step of check:page for guide:<id> and template:<id>', () => {
    for (const id of ['guide:fixture-guide', 'template:fixture-template']) {
      const content = pageContent({ id, lang: null, componentsDir: dirs.component, dirs, componentsFile: join(repoDir, 'components.json'), pendingFile: join(docs, 'none.json') });
      expect(content.findings).toEqual([]);
      expect(content.langs).toEqual(['ar', 'en']);
      expect(content.manifest.pages[0]).toMatchObject({ id, kind: id.split(':')[0] });
      expect(content.groups.every((group) => group.id === id && group.sourcePath)).toBe(true);
    }
    const english = pageContent({ id: 'guide:fixture-guide', lang: 'en', componentsDir: dirs.component, dirs, componentsFile: join(repoDir, 'components.json'), pendingFile: join(docs, 'none.json') });
    expect(english.langs).toEqual(['en']);
    expect(english.findings).toEqual([]);
  });

  it('names pending-translation.json with the key when an English guide has no Arabic page', () => {
    const copy = join(docs, '..', 'pending');
    cpSync(docs, copy, { recursive: true });
    rmSync(join(copy, 'guides', 'fixture-guide.ar.md'));
    const own = kindDirs({ repoDir, docsDir: copy });
    const content = pageContent({ id: 'guide:fixture-guide', lang: 'en', componentsDir: own.component, dirs: own, componentsFile: join(repoDir, 'components.json'), pendingFile: join(copy, 'none.json') });
    expect(content.findings.map((item) => item.message)).toEqual(['the English page has no Arabic sibling fixture-guide.ar.md; while it is written, add guide:fixture-guide to guide/scripts/content/pending-translation.json (the writer of the Arabic page removes it)']);
    writeFileSync(join(copy, 'pending.json'), '{ "pages": ["guide:fixture-guide"] }');
    expect(pageContent({ id: 'guide:fixture-guide', lang: 'en', componentsDir: own.component, dirs: own, componentsFile: join(repoDir, 'components.json'), pendingFile: join(copy, 'pending.json') }).findings).toEqual([]);
  });

  it('writes the Arabic skeleton of a template with its fixed h2 and the compliance sentence, and keeps a guide h1 for the writer', () => {
    const template = readFileSync(join(dirs.template, 'fixture-template.md'), 'utf8');
    const map = { 'Request received': 'استُلم الطلب', 'Your request was submitted.': 'تم تقديم طلبك.' };
    const result = scaffoldArabic(template, { entry: null, declared: null, map, version: '0.3.0', kind: 'template' });
    expect(result.text).toMatch(/^---\nsource:\n {2}summary: [0-9a-f]{12}\n {2}example: [0-9a-f]{12}\n {2}composition: [0-9a-f]{12}\n {2}platforms-code-reference: [0-9a-f]{12}\n---\n# Template fixture\n/);
    expect(result.text).toContain('\n## المكوّنات المستخدمة\n');
    expect(result.text).toContain('\n## مرجع كود المنصات\n\nهوية مكتبة مكوّنات واجهات');
    expect(result.text).toContain('<h1>استُلم الطلب</h1>');
    const guide = scaffoldArabic(readFileSync(join(dirs.guide, 'fixture-guide.md'), 'utf8'), { entry: null, declared: null, map: { Continue: 'متابعة' }, version: '0.3.0', kind: 'guide' });
    expect(guide.text).toContain('\n# Guide fixture\n');
    expect(guide.text).toContain('\n## Sections of a guide\n');
    expect(guide.text).toContain('<Button variant="primary">متابعة</Button>');
  });

  it('brings the live blocks of an Arabic guide into step with its English page', () => {
    const en = readFileSync(join(dirs.guide, 'fixture-guide.md'), 'utf8').replace('<button class="hw-button" type="button" data-variant="primary" data-size="md">Continue</button>', '<button class="hw-button" type="button" data-variant="secondary" data-size="md">Continue</button>');
    const ar = readFileSync(join(dirs.guide, 'fixture-guide.ar.md'), 'utf8');
    const result = syncArabic(en, ar, { entry: null, declared: null, version: '0.3.0', kind: 'guide' });
    expect(result.text).toContain('data-variant="secondary" data-size="md">متابعة</button>');
    expect(result.stale).toEqual(['a-live-group']);
  });

  it('applies the compliance rule of a template and only the marker words to a guide', () => {
    const guide = readFileSync(join(dirs.guide, 'fixture-guide.md'), 'utf8');
    expect(complianceFindings(guide, 'en', 'g.md', 'guide')).toEqual([]);
    expect(complianceFindings(`${guide}\nIt holds no certification.\n`, 'en', 'g.md', 'guide').map((item) => item.code)).toEqual(['HWT-COMPLIANCE']);
    expect(complianceFindings(readFileSync(join(dirs.template, 'fixture-template.md'), 'utf8'), 'en', 't.md', 'template')).toEqual([]);
    expect(complianceFindings(guide, 'en', 'g.md', 'template').map((item) => item.code)).toEqual(['HWT-COMPLIANCE']);
    const allowlist = [{ text: 'one two three four five', pages: ['guides/fixture-guide/'] }];
    expect(latinFindings('# ت\n\nنص one two three four five.\n', 'g.ar.md', 'guide:fixture-guide', allowlist)).toEqual([]);
    expect(latinFindings('# ت\n\nنص one two three four five.\n', 'g.ar.md', 'fixture-guide', allowlist).map((item) => item.code)).toEqual(['HWP-LATIN']);
  });

  it('compares no API table of a guide or a template', () => {
    expect(checkPages({ pages: [{ id: 'guide:x', lang: 'en', page: { kind: 'guide', sections: [] } }], readers: { nodeModules }, members: () => { throw new Error('read'); } })).toMatchObject({ findings: [], tables: 0 });
  });
});

describe('the pages generated from the installed packages', () => {
  const texts = JSON.parse(readFileSync(join(guideDir, 'src', 'app', 'i18n', 'package-pages.json'), 'utf8'));
  const assetsDir = join(styles, 'dist', 'assets');
  const readme = readFileSync(join(styles, 'README.md'), 'utf8');
  const served = servedBrandFiles(JSON.parse(readFileSync(join(guideDir, 'angular.json'), 'utf8')));

  it('shows the wordmark files and the loader of @hawiyah/styles with the README section as usage notes', () => {
    expect(wordmarkFiles(assetsDir)).toEqual({ light: ['hawiyah-wordmark.svg', 'hawiyah-wordmark-mono.svg'], dark: ['hawiyah-wordmark-reverse.svg', 'hawiyah-wordmark-white.svg'] });
    const page = brandPage('ar', texts, { assetsDir, readme, version: '0.3.0', served });
    expect(page).toMatchObject({ id: 'brand', lang: 'ar', dir: 'rtl', title: texts.brand.title.ar });
    expect(page.headings.map((heading) => heading.id)).toEqual(['wordmark', 'loader', 'usage']);
    expect(page.summary).toContainEqual({ type: 'inlineCode', value: '@hawiyah/styles' });
    expect(page.brand.loader).toEqual({ light: { motion: 'brand/hawiyah-loader.gif', still: 'brand/hawiyah-wordmark.svg' }, dark: { motion: 'brand/hawiyah-loader-white.gif', still: 'brand/hawiyah-wordmark-white.svg' } });
    const notes = readmeSection(readme, BRAND_SECTION);
    expect(notes).toMatch(/^The package also exports the Arabic-only outlined logo/);
    expect(page.brand.notes[0]).toEqual({ type: 'paragraph', children: [{ type: 'text', value: 'The package also exports the Arabic-only outlined logo and transparent loaders:' }] });
    expect(page.brand.notes.some((block) => block.type === 'code' && block.text.includes("import wordmark from '@hawiyah/styles/assets/hawiyah-wordmark.svg';"))).toBe(true);
  });

  it('fails when angular.json does not serve a file the brand page shows, or the README has no such section', () => {
    expect(() => brandPage('en', texts, { assetsDir, readme, version: '0.3.0', served: new Set(['hawiyah-wordmark.svg']) })).toThrow(/angular\.json does not copy hawiyah-wordmark-mono\.svg to brand\//);
    expect(() => brandPage('en', texts, { assetsDir, readme: '# x\n', version: '0.3.0', served })).toThrow(/has no section "Self-contained branding assets"/);
  });

  it('lists every colour of the default theme in both modes, the other token groups and every icon', async () => {
    const tokens = await import('@hawiyah/tokens');
    const provenance = JSON.parse(readFileSync(join(assetsDir, 'icons', 'provenance.json'), 'utf8'));
    const page = foundationsPage('en', texts, { tokens, provenance });
    expect(page.headings.map((heading) => heading.id)).toEqual(['colour', 'spacing', 'type', 'radius', 'motion', 'icons']);
    const colour = page.sections[0].blocks[0];
    expect(colour.columns.map((column) => column.label[0].value)).toEqual(['Token', 'Light mode', 'Dark mode']);
    expect(colour.rows).toHaveLength(Object.keys(tokens.themes.dga.light.color).length);
    expect(colour.rows[0]).toEqual({ c0: [{ type: 'inlineCode', value: '--hw-color-canvas' }], c1: [{ type: 'inlineCode', value: tokens.themes.dga.light.color.canvas }], c2: [{ type: 'inlineCode', value: tokens.themes.dga.dark.color.canvas }] });
    const spacing = page.sections[1].blocks[1];
    expect(spacing.rows.find((row) => row.c0[0].value === '--hw-space-4').c1[0].value).toBe(tokens.tokens.space['4']);
    expect(page.sections[4].blocks[1].rows.map((row) => row.c0[0].value)).toEqual([...Object.keys(tokens.tokens.duration).map((key) => tokens.tokenNames.duration[key]), ...Object.keys(tokens.tokens.ease).map((key) => tokens.tokenNames.ease[key])]);
    expect(page.icons.names).toEqual(provenance.icons.map((icon) => icon.name).sort());
    expect(page.counts.icons).toBe(62);
  });

  it('writes both pages in both languages', async () => {
    const out = mkdtempSync(join(tmpdir(), 'hawiyah-package-pages-'));
    await writePackagePages({ guideDir, generatedDir: out });
    for (const name of ['brand.ar.json', 'brand.en.json', 'foundations.ar.json', 'foundations.en.json']) expect(existsSync(join(out, 'package-pages', name)), name).toBe(true);
    expect(JSON.parse(readFileSync(join(out, 'package-pages', 'foundations.ar.json'), 'utf8')).title).toBe('الأسس');
    rmSync(out, { recursive: true, force: true });
  });
});
