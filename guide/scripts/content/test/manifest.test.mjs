// Outputs of the content step: page models, manifest, loaders and live groups.
// Runs the pipeline on the fixtures into a temporary directory.

import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import ts from 'typescript';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { resolvePaths } from '../cli.mjs';
import { loadersModule } from '../manifest.mjs';
import { runContent } from '../pipeline.mjs';
import { componentsDir, docsDir, guideDir, repoDir } from './helpers.mjs';

let out;
let result;
const read = (name) => JSON.parse(readFileSync(join(out, name), 'utf8'));

beforeAll(() => {
  out = mkdtempSync(join(tmpdir(), 'hawiyah-content-'));
  result = runContent({
    guideDir, repoDir, componentsDir, componentsFile: join(docsDir, 'components.json'),
    outDir: out, liveGroupsFile: join(out, 'live-groups.json'),
  });
});

afterAll(() => rmSync(out, { recursive: true, force: true }));

describe('runContent on the fixtures', () => {
  it('writes two page models, the manifest, the loaders and the live groups', () => {
    expect(result.findings).toEqual([]);
    expect(result.pages).toBe(2);
    expect(result.groups).toBe(4);
    for (const name of ['pages/fixture-a.en.json', 'pages/fixture-a.ar.json', 'manifest.json', 'loaders.ts', 'live-groups.json']) {
      expect(existsSync(join(out, name)), name).toBe(true);
    }
  });

  it('writes the manifest of contentPipeline.model', () => {
    const manifest = read('manifest.json');
    expect(Object.keys(manifest)).toEqual(['pages', 'liveGroupsFile']);
    const [page] = manifest.pages;
    expect(page).toMatchObject({
      id: 'fixture-a',
      langs: ['ar', 'en'],
      title: { en: 'Fixture A', ar: 'النموذج أ' },
      liveGroups: [
        { example: 'primary', section: 'example', frameworks: 4 },
        { example: 'direction', section: 'language-and-direction', frameworks: 4, check: 'tabs-click' },
      ],
    });
    expect(page.summaryText.en).toMatch(/^Fixture A is a test page/);
    expect(page.headings.ar.map((heading) => heading.id)).toEqual(page.headings.en.map((heading) => heading.id));
  });

  it('writes page models with ids, direction, sections, blocks and inlines', () => {
    const en = read('pages/fixture-a.en.json');
    const ar = read('pages/fixture-a.ar.json');
    expect(Object.keys(en)).toEqual(['id', 'lang', 'dir', 'title', 'summary', 'headings', 'sections', 'liveGroups', 'sourcePath', 'githubUrl']);
    expect([en.dir, ar.dir]).toEqual(['ltr', 'rtl']);
    expect(en.githubUrl).toBe(`https://github.com/MohamedEmbarak/hawiyah/blob/main/${en.sourcePath}`);
    expect(en.sourcePath).toMatch(/fixtures\/docs\/components\/fixture-a\.md$/);
    const types = new Set();
    const walk = (value) => {
      if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value === 'object') {
        if (typeof value.type === 'string') types.add(value.type);
        Object.values(value).forEach(walk);
      }
    };
    walk(en.sections);
    expect([...types].sort()).toEqual(['alert', 'code', 'emphasis', 'heading', 'inlineCode', 'link', 'list', 'live', 'paragraph', 'strong', 'table', 'text', 'thematicBreak'].sort());
    const accessibility = en.sections.find((section) => section.id === 'accessibility');
    const table = accessibility.blocks.find((block) => block.type === 'table');
    expect(table.caption).toBe('Keyboard');
    expect(table.columns.map((column) => [column.key, column.align])).toEqual([['c0', 'start'], ['c1', 'end']]);
    expect(table.rows[0].c0).toEqual([{ type: 'text', value: 'Enter' }]);
    const alert = accessibility.blocks.find((block) => block.type === 'alert');
    expect(alert.kind).toBe('note');
    expect(alert.blocks[0].children[0]).toEqual({ type: 'text', value: 'The control keeps the native ' });
    const heading = accessibility.blocks.find((block) => block.type === 'heading' && block.level === 4);
    expect(heading.id).toBe('announcements');
    const code = en.sections.at(-1).blocks.find((block) => block.type === 'code' && block.title === 'setup.ts');
    expect(code.lines[0][0]).toEqual({ t: 'import', r: 'keyword' });
    expect(en.liveGroups).toEqual(['primary', 'direction']);
  });

  it('writes the live groups contract for step 25', () => {
    const groups = read('live-groups.json');
    expect(groups.map((group) => `${group.id}/${group.lang}/${group.example}`)).toEqual([
      'fixture-a/ar/primary', 'fixture-a/ar/direction', 'fixture-a/en/primary', 'fixture-a/en/direction',
    ]);
    expect(groups[3]).toEqual({
      id: 'fixture-a',
      lang: 'en',
      example: 'direction',
      check: 'tabs-click',
      blocks: {
        vanilla: { lang: 'html', form: 'fragment', code: '<p class="hw-type" lang="en" dir="ltr">Read the <strong>terms</strong> first.</p>' , line: 31 },
        react: { lang: 'jsx', form: 'fragment', code: '<p className="hw-type" lang="en" dir="ltr">Read the <strong>terms</strong> first.</p>' , line: 35 },
        vue: { lang: 'vue', form: 'fragment', code: '<p class="hw-type" lang="en" dir="ltr">Read the <strong>terms</strong> first.</p>' , line: 39 },
        angular: { lang: 'ts', form: 'fragment', code: 'template: `<p class="hw-type" lang="en" dir="ltr">Read the <strong>terms</strong> first.</p>`' , line: 43 },
      },
    });
  });

  it('writes nothing when there is a finding', () => {
    const dir = mkdtempSync(join(tmpdir(), 'hawiyah-content-'));
    try {
      const docs = join(dir, 'components');
      mkdirSync(docs);
      copyFileSync(join(componentsDir, 'fixture-a.md'), join(docs, 'fixture-a.md'));
      const failing = runContent({
        guideDir, repoDir, componentsDir: docs, componentsFile: join(docsDir, 'components.json'),
        outDir: join(dir, 'out'), liveGroupsFile: join(dir, 'out', 'live-groups.json'),
      });
      expect(failing.findings.map((item) => [item.code, item.message])).toEqual([
        ['HWC-FILE', 'the English page has no Arabic sibling fixture-a.ar.md'],
      ]);
      expect(existsSync(join(dir, 'out'))).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('writes an empty manifest when the docs directory does not exist', () => {
    const dir = mkdtempSync(join(tmpdir(), 'hawiyah-content-'));
    try {
      const empty = runContent({
        guideDir, repoDir, componentsDir: join(dir, 'none'), componentsFile: join(docsDir, 'components.json'),
        outDir: join(dir, 'out'), liveGroupsFile: join(dir, 'cache', 'live-groups.json'),
      });
      expect(empty.findings).toEqual([]);
      expect(JSON.parse(readFileSync(join(dir, 'out', 'manifest.json'), 'utf8')).pages).toEqual([]);
      expect(JSON.parse(readFileSync(join(dir, 'cache', 'live-groups.json'), 'utf8'))).toEqual([]);
      expect(readFileSync(join(dir, 'out', 'loaders.ts'), 'utf8')).toContain('export const contentLoaders: ContentLoaders = {\n};');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('builds the loaders module', () => {
    const text = loadersModule([{ id: 'button', lang: 'en' }], '../../app/content/model');
    expect(text).toContain("import type { ContentLoaders, ContentPage } from '../../app/content/model';");
    expect(text).toContain("'button/en': () => import('./pages/button.en.json') as Promise<unknown> as Loaded,");
    expect(read('manifest.json').liveGroupsFile).toMatch(/live-groups\.json$/);
  });
});

describe('src/app/content/model.ts', () => {
  it('types the generated page models, manifest, loaders and live groups', () => {
    const model = join(guideDir, 'src', 'app', 'content', 'model.ts').split('\\').join('/');
    const literal = (name) => readFileSync(join(out, name), 'utf8');
    const check = join(out, 'check.ts');
    const source = [
      `import type { ContentManifest, ContentPage, LiveGroupEntry } from '${model.replace(/\.ts$/, '')}';`,
      `export const en: ContentPage = ${literal('pages/fixture-a.en.json')};`,
      `export const ar: ContentPage = ${literal('pages/fixture-a.ar.json')};`,
      `export const manifest: ContentManifest = ${literal('manifest.json')};`,
      `export const groups: readonly LiveGroupEntry[] = ${literal('live-groups.json')};`,
      `export { contentLoaders } from './loaders';`,
      '',
    ].join('\n');
    writeFileSync(check, source);
    const program = ts.createProgram([check], {
      strict: true, noEmit: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.Preserve,
      moduleResolution: ts.ModuleResolutionKind.Bundler, resolveJsonModule: true, skipLibCheck: true, types: [],
    });
    const diagnostics = ts.getPreEmitDiagnostics(program).map((item) => ts.flattenDiagnosticMessageText(item.messageText, '\n'));
    expect(diagnostics).toEqual([]);
  });
});

describe('cli paths', () => {
  it('uses <docs>/components and <docs>/components.json for a fixtures directory', () => {
    const paths = resolvePaths({ docs: docsDir, out: null, components: null });
    expect(paths.componentsDir).toBe(componentsDir);
    expect(paths.componentsFile).toBe(join(docsDir, 'components.json'));
    expect(paths.liveGroupsFile).toBe(join(guideDir, '.cache', 'content', 'live-groups.json'));
  });

  it('defaults to the repository docs and writes live groups next to --out', () => {
    const defaults = resolvePaths({ docs: null, out: null, components: null });
    expect(defaults.componentsDir).toBe(join(repoDir, 'docs', 'components'));
    expect(defaults.componentsFile).toBe(join(repoDir, 'components.json'));
    expect(defaults.outDir).toBe(join(guideDir, 'src', 'generated', 'content'));
    const custom = resolvePaths({ docs: null, out: 'x', components: null }, guideDir);
    expect(custom.liveGroupsFile).toBe(join(guideDir, 'x', 'live-groups.json'));
  });
});

describe('runContent: links to another component page', () => {
  it('reports a fragment that names no heading of the linked page, in both languages', () => {
    const dir = mkdtempSync(join(tmpdir(), 'hawiyah-content-'));
    try {
      // Laid out as the repository: docs/components/ and docs/components.json (the fixture links ../components.json).
      const docs = join(dir, 'docs', 'components');
      mkdirSync(docs, { recursive: true });
      // fixture-a links to the built page fixture-b (a copy under its own name whose
      // first h3 is another heading) with a fragment that no page has, with a heading
      // that only fixture-a has, with one that only fixture-b has, and with one that
      // both have. A check against the linking page, or against any built page, would
      // decide the second and the third link the other way.
      const pages = [
        ['md', 'Fixture A', 'Fixture B', '### Language and direction', '### Writing direction'],
        ['ar.md', 'النموذج أ', 'النموذج ب', '### اللغة والاتجاه', '### اتجاه الكتابة'],
      ];
      for (const [suffix, from, to, heading, other] of pages) {
        const text = readFileSync(join(componentsDir, `fixture-a.${suffix}`), 'utf8');
        if (!text.includes(`\n${heading}\n`)) throw new Error(`fixture heading not found: ${heading}`);
        writeFileSync(join(docs, `fixture-b.${suffix}`), text.replace(`# ${from}\n`, `# ${to}\n`).replace(`\n${heading}\n`, `\n${other}\n`));
        writeFileSync(
          join(docs, `fixture-a.${suffix}`),
          text.replace(
            `(fixture-a.${suffix}#javascript)`,
            `(fixture-b.${suffix}#no-such-heading) [x](fixture-b.${suffix}#language-and-direction) [y](fixture-b.${suffix}#writing-direction) [z](fixture-b.${suffix}#javascript)`,
          ),
        );
      }
      const components = join(dir, 'docs', 'components.json');
      writeFileSync(components, JSON.stringify({ components: [{ id: 'fixture-a', name: 'Fixture A', labelAr: 'النموذج أ' }, { id: 'fixture-b', name: 'Fixture B', labelAr: 'النموذج ب' }] }));
      const outcome = runContent({ guideDir, repoDir: dir, componentsDir: docs, componentsFile: components, outDir: join(dir, 'out'), liveGroupsFile: join(dir, 'out', 'live-groups.json') });
      const links = outcome.findings.filter((item) => item.code === 'HWC-LINK').map((item) => [item.file.split('/').pop(), item.message]);
      expect(links).toEqual([
        ['fixture-a.md', 'the link "fixture-b.md#no-such-heading" names no heading of the page fixture-b'],
        ['fixture-a.md', 'the link "fixture-b.md#language-and-direction" names no heading of the page fixture-b'],
        ['fixture-a.ar.md', 'the link "fixture-b.ar.md#no-such-heading" names no heading of the page fixture-b'],
        ['fixture-a.ar.md', 'the link "fixture-b.ar.md#language-and-direction" names no heading of the page fixture-b'],
      ]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
