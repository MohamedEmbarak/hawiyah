// The two document kinds, guides (docs/guides) and templates (docs/templates): keys,
// index.json, the outline rules, parity and section hashes, links between kinds,
// pending translation, and the content step over the fixture of scripts/test/kinds.

import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { generateKinds } from '../../test/kinds/generate.mjs';
import { DOCUMENT_CODES } from '../config.mjs';
import { frontMatterBlock, sectionHashes, splitSections } from '../hash.mjs';
import { KINDS, isKey, sameDocument, kindDirs, keyOfPath, pageHref, pageKey, parseKey, pathKey, readIndex } from '../kinds.mjs';
import { resolveLink } from '../links.mjs';
import { parseMarkdown } from '../parse.mjs';
import { listDocumentSources, processPair, readPending, readComponents, runContent } from '../pipeline.mjs';
import { analysePage } from '../structure.mjs';
import { guideDir, repoDir } from './helpers.mjs';

const SOURCES = join(guideDir, 'scripts', 'test', 'kinds', 'fixtures');
const source = (kind, name) => readFileSync(join(SOURCES, KINDS[kind].dir, name), 'utf8');
const analyse = (text, kind, lang = 'en', extra = {}) => {
  const parsed = parseMarkdown(text, 'x.md');
  return analysePage({ tree: parsed.tree, frontMatter: parsed.frontMatter, lang, file: 'x.md', id: 'x', entry: null, kind, ...extra });
};
const messages = (outline, code) => outline.findings.filter((item) => item.code === code).map((item) => item.message);
const replace = (text, from, to) => {
  if (!text.includes(from)) throw new Error(`fixture text not found: ${from}`);
  return text.replace(from, to);
};

let docs;
let dirs;
const known = readComponents(join(repoDir, 'components.json'));

beforeAll(() => {
  docs = join(mkdtempSync(join(tmpdir(), 'hawiyah-kinds-')), 'docs');
  generateKinds({ out: docs });
  dirs = kindDirs({ repoDir, docsDir: docs });
});
afterAll(() => rmSync(join(docs, '..'), { recursive: true, force: true }));

/** The content pair of a fixture page of the generated copy, with one side replaced. */
const pair = (kind, id, replaceWith = {}) => processPair({
  id, kind, entry: null,
  enText: replaceWith.en ?? readFileSync(join(dirs[kind], `${id}.md`), 'utf8'),
  arText: replaceWith.ar ?? readFileSync(join(dirs[kind], `${id}.ar.md`), 'utf8'),
  enPath: join(dirs[kind], `${id}.md`), arPath: join(dirs[kind], `${id}.ar.md`),
  repoDir, componentsDir: dirs.component, dirs, known,
  built: new Set(['alert', 'button', 'guide:fixture-guide', 'template:fixture-template']),
  claimExceptions: [], liveExceptions: [], exceptions: [],
});

describe('keys of the three kinds', () => {
  it('prefixes guides and templates so that their keys are never component ids', () => {
    expect(pageKey('component', 'button')).toBe('button');
    expect(pageKey('guide', 'getting-started')).toBe('guide:getting-started');
    expect(pageKey('template', 'service')).toBe('template:service');
    expect(parseKey('template:service')).toEqual({ kind: 'template', id: 'service' });
    expect(parseKey('button')).toEqual({ kind: 'component', id: 'button' });
    expect(parseKey('recipe:x')).toBeNull();
    expect(isKey('guide:Getting')).toBe(false);
    expect(pathKey('guide:getting-started')).toBe('guide.getting-started');
    expect(keyOfPath('template.service')).toBe('template:service');
    expect(pageHref('guide', 'ar', 'x')).toBe('ar/guides/x/');
    expect(pageHref('component', 'en', 'tabs')).toBe('en/components/tabs/reference/');
  });

  it('reads the ids of an index.json in order and refuses another shape', () => {
    const dir = mkdtempSync(join(tmpdir(), 'hawiyah-index-'));
    expect(readIndex(dir)).toEqual({ ids: [], error: null, exists: false });
    writeFileSync(join(dir, 'index.json'), '{ "pages": ["b", "a"] }');
    expect(readIndex(dir).ids).toEqual(['b', 'a']);
    writeFileSync(join(dir, 'index.json'), '{ "pages": ["a", "a"] }');
    expect(readIndex(dir).error).toBe('index.json lists a more than once');
    writeFileSync(join(dir, 'index.json'), '["a"]');
    expect(readIndex(dir).error).toBe('index.json must be { "pages": ["<id>", ...] }');
    rmSync(dir, { recursive: true, force: true });
  });

  it('reads guides and templates below --docs when it holds components/, else a fixture of component pages has none', () => {
    expect(kindDirs({ repoDir })).toEqual({ component: join(repoDir, 'docs', 'components'), guide: join(repoDir, 'docs', 'guides'), template: join(repoDir, 'docs', 'templates') });
    expect(kindDirs({ repoDir, docsDir: docs }).guide).toBe(join(docs, 'guides'));
    expect(kindDirs({ repoDir, docsDir: join(docs, 'components') }).guide).toBe(join(docs, 'components', 'guides'));
  });

  it('accepts guide:<id> and template:<id> in pending-translation.json', () => {
    const dir = mkdtempSync(join(tmpdir(), 'hawiyah-pending-'));
    const file = join(dir, 'pending.json');
    writeFileSync(file, '{ "pages": ["button", "guide:getting-started", "template:service"] }');
    expect([...readPending(file)]).toEqual(['button', 'guide:getting-started', 'template:service']);
    writeFileSync(file, '{ "pages": ["recipe:x"] }');
    expect(() => readPending(file)).toThrow(/pending-translation\.json must be/);
    rmSync(dir, { recursive: true, force: true });
  });

  it('keeps the document codes apart from the codes of a component page', () => {
    expect(DOCUMENT_CODES).toEqual(['HWC-COMP']);
  });
});

describe('the files of a kind (HWC-FILE)', () => {
  const index = (ids) => ({ ids, error: null, exists: true });
  it('lists the pages of index.json in its order, with both languages', () => {
    const names = ['index.json', 'b.md', 'b.ar.md', 'a.md', 'a.ar.md', 'glossary.md', 'README.md'];
    expect(listDocumentSources({ names, index: index(['b', 'a']), dirLabel: 'docs/guides', kind: 'guide' })).toEqual({ ids: ['b', 'a'], pending: [], findings: [] });
  });

  it('reports a page that index.json does not list, a listed id without its page, and a missing sibling', () => {
    const { findings } = listDocumentSources({ names: ['a.md', 'a.ar.md', 'c.md', 'd.ar.md'], index: index(['a', 'b']), dirLabel: 'docs/templates', kind: 'template' });
    expect(findings.map((item) => `${item.code} ${item.file}: ${item.message}`)).toEqual([
      'HWC-FILE docs/templates/c.md: c is not listed in docs/templates/index.json; add it to "pages" in the order of the guide',
      'HWC-FILE docs/templates/index.json: docs/templates/index.json lists b, but docs/templates/b.md does not exist',
      'HWC-FILE docs/templates/c.md: the English page has no Arabic sibling c.ar.md',
      'HWC-FILE docs/templates/d.ar.md: the Arabic page has no English sibling d.md',
    ]);
  });

  it('lets an English page wait for its Arabic page while pending-translation.json lists guide:<id>', () => {
    const result = listDocumentSources({ names: ['a.md'], index: index(['a']), dirLabel: 'docs/guides', kind: 'guide', pending: new Set(['a']) });
    expect(result).toEqual({ ids: [], pending: ['guide:a'], findings: [] });
    const stale = listDocumentSources({ names: ['a.md', 'a.ar.md'], index: index(['a']), dirLabel: 'docs/guides', kind: 'guide', pending: new Set(['a']) });
    expect(stale.findings.map((item) => item.message)).toEqual(['guide:a is listed as pending translation, but docs/guides/a.ar.md exists; remove the entry']);
  });

  it('keeps the glossary a contract file of docs/guides, not a page', () => {
    expect(KINDS.guide.contractFiles).toContain('glossary.md');
    expect(listDocumentSources({ names: ['glossary.md'], index: index([]), dirLabel: 'docs/guides', kind: 'guide' }).findings).toEqual([]);
  });
});

describe('the outline of a guide', () => {
  const guide = () => source('guide', 'fixture-guide.md');

  it('accepts free h2 and h3 headings and a live group under any heading', () => {
    const outline = analyse(guide(), 'guide');
    expect(outline.findings).toEqual([]);
    expect(outline.sections.map((section) => section.id)).toEqual(['sections-of-a-guide', 'a-live-group', 'links-between-pages']);
    expect(outline.groups.map((group) => [group.example, group.section])).toEqual([['continue', 'a-live-group']]);
  });

  it('gives the Arabic sections the ids of the English sections by position', () => {
    const outline = analyse(source('guide', 'fixture-guide.ar.md'), 'guide', 'ar', { sectionIds: ['one', 'two', 'three'] });
    expect(outline.sections.map((section) => section.id)).toEqual(['one', 'two', 'three']);
    expect(outline.groups.map((group) => group.section)).toEqual(['two']);
  });

  it('keeps the summary, the h1, the h4 placement and the group limit of a component page', () => {
    expect(messages(analyse(replace(guide(), 'and is never deployed.', 'and is never deployed. It has three. Sentences.'), 'guide'), 'HWC-SUM')).toEqual(['the summary has 4 sentences; write one or two']);
    expect(messages(analyse(replace(guide(), '## Links between pages', '#### Links between pages'), 'guide'), 'HWC-H5')).toEqual(['an h4 stands under an h3']);
    expect(messages(analyse(guide().replace(/^# Guide fixture\n\nThis page[^\n]*\n\n/, '# Guide fixture\n\nOne sentence.\n\n```html live example=early\n<p class="hw-type">x</p>\n```\n\n'), 'guide'), 'HWC-SUM')[0]).toMatch(/^the summary/);
    expect(messages(analyse('# Title\n\nOne sentence.\n', 'guide'), 'HWC-H2')).toEqual(['a guide has at least one h2 section after its summary']);
  });
});

describe('the outline of a template', () => {
  const template = () => source('template', 'fixture-template.md');

  it('accepts the fixed outline with framed groups, one per h3 state', () => {
    const outline = analyse(template(), 'template');
    expect(outline.findings).toEqual([]);
    expect(outline.sections.map((section) => section.id)).toEqual(['example', 'composition', 'platforms-code-reference']);
    expect(outline.groups.map((group) => [group.example, group.frame])).toEqual([['received', true], ['not-uploaded', true]]);
    expect(outline.composition.map((item) => item.id)).toEqual(['alert', 'button']);
  });

  it('refuses another h2, a missing section and the order of a component page', () => {
    expect(messages(analyse(replace(template(), '## Composition', '## API'), 'template'), 'HWC-H2')).toEqual([
      'the h2 "API" is not one of "Example", "Composition", "Platforms Code reference" (the outline of a template)',
      'the required h2 "Composition" is missing',
    ]);
  });

  it('requires frame on every group and an h3 of its own for each state', () => {
    expect(messages(analyse(replace(template(), 'example=not-uploaded frame', 'example=not-uploaded'), 'template'), 'HWC-LIVE2')).toEqual([
      'the live group "not-uploaded" of a template is a state of the page and carries frame on its html block',
    ]);
    expect(messages(analyse(replace(template(), '### Request not uploaded\n', ''), 'template'), 'HWC-LIVE2')).toEqual([
      'the h3 "Request received" of the Example section contains exactly one live group (found 2)',
    ]);
    const moved = replace(template(), '## Composition\n', '## Composition\n\n```html live example=extra frame\n<p class="hw-type">x</p>\n```\n\n```tsx live example=extra\n<p className="hw-type">x</p>\n```\n\n```vue live example=extra\n<p class="hw-type">x</p>\n```\n\n```ts live example=extra framework=angular\ntemplate: `<p class="hw-type">x</p>`\n```\n');
    expect(messages(analyse(moved, 'template'), 'HWC-LIVE2')).toEqual(['the live group "extra" stands in the Example section of the template']);
  });

  it('lists the components of the Composition section by links to their pages (HWC-COMP)', () => {
    expect(messages(analyse(replace(template(), '- [Alert](../components/alert.md) states', '- Alert states'), 'template'), 'HWC-COMP')).toEqual([
      'each item of the Composition section names a component by a link to its page (../components/<id>.md), the first link of the item',
    ]);
    expect(messages(analyse(replace(template(), 'The page uses these components:\n\n- [Alert](../components/alert.md) states the outcome of the request.\n- [Button](../components/button.md) starts the next action.', 'The page uses Alert and Button.'), 'template'), 'HWC-COMP')).toEqual([
      'the Composition section lists the components the template uses, one list item per component, each with a link to its component page',
    ]);
  });

  it('requires every listed component in a group and a listed component in every group (HWC-COMP)', () => {
    const extra = pair('template', 'fixture-template', { en: replace(readFileSync(join(dirs.template, 'fixture-template.md'), 'utf8'), '- [Button](../components/button.md) starts the next action.', '- [Button](../components/button.md) starts the next action.\n- [Tabs](../components/tabs.md) is not used.') });
    expect(extra.findings.filter((item) => item.code === 'HWC-COMP').map((item) => item.message)).toEqual(['no live group of the Example section shows tabs in all four frameworks; list only the components the template uses']);
    const only = pair('template', 'fixture-template', { en: replace(readFileSync(join(dirs.template, 'fixture-template.md'), 'utf8'), '- [Alert](../components/alert.md) states the outcome of the request.\n', '') });
    expect(only.findings.filter((item) => item.code === 'HWC-COMP').map((item) => item.message)).toEqual([]);
    const unknown = pair('template', 'fixture-template', { en: replace(readFileSync(join(dirs.template, 'fixture-template.md'), 'utf8'), '- [Alert](../components/alert.md) states', '- [Notice](../components/notice.md) states') });
    expect(unknown.findings.filter((item) => item.code === 'HWC-COMP').map((item) => item.message)).toContain('notice is not a component id in components.json; the Composition section lists the components the template uses');
  });
});

describe('a pair of a guide or a template', () => {
  it('passes every rule of step 20 for the fixture pages', () => {
    expect(pair('guide', 'fixture-guide').findings).toEqual([]);
    expect(pair('template', 'fixture-template').findings).toEqual([]);
  });

  it('keys the page, its models and its groups by kind', () => {
    const result = pair('guide', 'fixture-guide');
    expect(result.manifestPage).toMatchObject({ id: 'guide:fixture-guide', kind: 'guide', slug: 'fixture-guide', langs: ['ar', 'en'] });
    expect(result.models.ar).toMatchObject({ id: 'guide:fixture-guide', kind: 'guide', slug: 'fixture-guide', title: 'دليل الاختبار' });
    expect(result.models.ar.headings.map((heading) => heading.id)).toEqual(result.models.en.headings.map((heading) => heading.id));
    expect(result.groupEntries.en.map((group) => [group.id, group.kind, group.example])).toEqual([['guide:fixture-guide', 'guide', 'continue']]);
    expect(result.groupEntries.ar[0].sourcePath).toMatch(/guides\/fixture-guide\.ar\.md$/);
  });

  it('holds parity, the claim and tone gates, and the live tokens as on a component page', () => {
    const en = readFileSync(join(dirs.guide, 'fixture-guide.md'), 'utf8');
    const ar = readFileSync(join(dirs.guide, 'fixture-guide.ar.md'), 'utf8');
    const codes = (result) => result.findings.map((item) => item.code);
    expect(codes(pair('guide', 'fixture-guide', { ar: replace(ar, '### العناوين تحت القسم\n', '') }))).toContain('HWC-PAR1');
    expect(codes(pair('guide', 'fixture-guide', { en: replace(en, 'The writer chooses', 'Hawiyah is certified. The writer chooses') }))).toContain('HWC-CLAIM');
    expect(codes(pair('guide', 'fixture-guide', { en: replace(en, 'The writer chooses', 'A seamless outline. The writer chooses') }))).toContain('HWC-TONE');
    expect(codes(pair('guide', 'fixture-guide', { ar: replace(ar, '<Button variant="primary">متابعة</Button>\n```\n\n```vue', '<Button variant="secondary">متابعة</Button>\n```\n\n```vue') }))).toContain('HWC-PAR4');
    expect(codes(pair('guide', 'fixture-guide', { ar: replace(ar, 'للدليل عنوان رئيسي واحد وملخص من جملة أو جملتين، ثم أقسامه الخاصة به. ويختار الكاتب العناوين وترتيبها.', 'The writer chooses the headings.') }))).toContain('HWC-PAR8');
  });

  it('reports an Arabic section translated from an earlier English text by the English section id (HWC-STALE)', () => {
    const en = replace(readFileSync(join(dirs.guide, 'fixture-guide.md'), 'utf8'), 'The writer chooses the headings and their order.', 'The writer chooses the headings, their order and their level.');
    const stale = pair('guide', 'fixture-guide', { en }).findings.filter((item) => item.code === 'HWC-STALE');
    expect(stale.map((item) => item.message)).toEqual([expect.stringMatching(/^section "sections-of-a-guide" was translated from an earlier English text \([0-9a-f]{12}, now [0-9a-f]{12}\); update the translation, then run npm run content:hash -- guide:fixture-guide$/)]);
  });

  it('hashes the sections of a guide by the ids of the page model and the Arabic page by position', () => {
    const en = source('guide', 'fixture-guide.md');
    expect(Object.keys(sectionHashes(en, { kind: 'guide' }))).toEqual(['summary', 'sections-of-a-guide', 'a-live-group', 'links-between-pages']);
    expect(frontMatterBlock(en, 'guide').split('\n')[2]).toMatch(/^ {2}summary: [0-9a-f]{12}$/);
    const ar = source('guide', 'fixture-guide.ar.md');
    expect(splitSections(ar, { ids: ['summary', 'a', 'b', 'c'] }).map((section) => section.id)).toEqual(['summary', 'a', 'b', 'c']);
    expect(Object.keys(sectionHashes(source('template', 'fixture-template.ar.md')))).toEqual(['summary', 'example', 'composition', 'platforms-code-reference']);
  });
});

describe('links between kinds', () => {
  const ctx = (overrides) => ({
    lang: 'en', id: 'fixture-guide', kind: 'guide', filePath: join(repoDir, 'docs', 'guides', 'fixture-guide.md'), repoDir,
    built: new Set(['button', 'guide:fixture-guide', 'template:fixture-template']), headingIds: new Set(['a-live-group']), ...overrides,
  });

  it('leads from a guide to a component page, a template and its own sections', () => {
    expect(resolveLink('../components/button.md#variants', ctx())).toEqual({ href: 'en/components/button/reference/#variants', internal: true, external: false, crossPage: { id: 'button', fragment: 'variants' } });
    expect(resolveLink('#a-live-group', ctx({ lang: 'ar' }))).toEqual({ href: 'ar/guides/fixture-guide/#a-live-group', internal: true, external: false });
  });

  it('leads to the pages of a copy read with --docs as the repository would', () => {
    const copy = ctx({ filePath: join(dirs.guide, 'fixture-guide.md'), dirs });
    expect(resolveLink('../templates/fixture-template.md#composition', copy)).toEqual({ href: 'en/templates/fixture-template/#composition', internal: true, external: false, crossPage: { id: 'template:fixture-template', fragment: 'composition' } });
    expect(resolveLink('../components/button.md', copy)).toEqual({ href: 'en/components/button/reference/', internal: true, external: false });
  });

  it('links a component page that the build does not have to GitHub', () => {
    expect(resolveLink('../components/button.md', ctx({ built: new Set() }))).toEqual({ href: 'https://github.com/MohamedEmbarak/hawiyah/blob/main/docs/components/button.md', internal: false, external: true });
  });
});

describe('the content step over the fixture', () => {
  it('builds the guides and templates in the order of their index.json, with routes and the navigation index', () => {
    const out = join(docs, '..', 'out');
    const result = runContent({
      guideDir, repoDir, componentsDir: dirs.component, dirs, componentsFile: join(repoDir, 'components.json'), outDir: out, liveGroupsFile: join(out, 'live-groups.json'),
      claimExceptions: [],
    });
    expect(result.findings).toEqual([]);
    const navigation = JSON.parse(readFileSync(join(out, 'navigation.json'), 'utf8'));
    expect(navigation.guides.map((page) => [page.id, page.slug])).toEqual([['guide:fixture-guide', 'fixture-guide']]);
    expect(navigation.templates.map((page) => page.examples.map((group) => group.example))).toEqual([['received', 'not-uploaded']]);
    expect(navigation.pages.some((page) => page.id.includes(':'))).toBe(false);
    expect(JSON.parse(readFileSync(join(out, 'document-routes.json'), 'utf8'))).toEqual({ guides: [{ id: 'fixture-guide', langs: ['ar', 'en'] }], templates: [{ id: 'fixture-template', langs: ['ar', 'en'] }] });
    expect(readFileSync(join(out, 'loaders.ts'), 'utf8')).toContain("'template:fixture-template/ar': () => import('./pages/template.fixture-template.ar.json')");
    const groups = JSON.parse(readFileSync(join(out, 'live-groups.json'), 'utf8')).filter((group) => group.kind);
    expect(groups.map((group) => `${group.id}/${group.lang}/${group.example}`)).toEqual([
      'guide:fixture-guide/ar/continue', 'guide:fixture-guide/en/continue',
      'template:fixture-template/ar/received', 'template:fixture-template/ar/not-uploaded', 'template:fixture-template/en/received', 'template:fixture-template/en/not-uploaded',
    ]);
  });

  it('applies an entry of a lead list to the same page read from a copy of docs/', () => {
    expect(sameDocument('docs/components/rating.ar.md', 'docs/components/rating.ar.md')).toBe(true);
    expect(sameDocument('docs/components/rating.ar.md', '../../tmp/copy/docs/components/rating.ar.md')).toBe(true);
    expect(sameDocument('docs/components/rating.ar.md', '../../tmp/copy/docs/components/rating.md')).toBe(false);
    expect(sameDocument('docs/components/rating.ar.md', 'docs/guides/rating.ar.md')).toBe(false);
    expect(sameDocument('docs/components/rating.ar.md', 'rating.ar.md')).toBe(false);
  });

  it('reports a page of docs/guides that index.json does not list', () => {
    const copy = join(docs, '..', 'unlisted');
    mkdirSync(join(copy, 'guides'), { recursive: true });
    mkdirSync(join(copy, 'components'), { recursive: true });
    writeFileSync(join(copy, 'guides', 'index.json'), '{ "pages": [] }');
    writeFileSync(join(copy, 'guides', 'loose.md'), '# Loose\n');
    const result = runContent({
      guideDir, repoDir, componentsDir: join(copy, 'components'), dirs: kindDirs({ repoDir, docsDir: copy }), componentsFile: join(repoDir, 'components.json'),
      outDir: join(copy, 'out'), liveGroupsFile: join(copy, 'out', 'live-groups.json'), write: false, claimExceptions: [], liveExceptions: [],
    });
    const label = relative(repoDir, join(copy, 'guides')).split('\\').join('/');
    expect(result.findings.filter((item) => item.file === `${label}/loose.md`).map((item) => `${item.code} ${item.message}`)).toEqual([
      `HWC-FILE loose is not listed in ${label}/index.json; add it to "pages" in the order of the guide`,
      'HWC-FILE the English page has no Arabic sibling loose.ar.md',
    ]);
  });
});
