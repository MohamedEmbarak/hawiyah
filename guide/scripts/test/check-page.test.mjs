// check:page and the pages pending translation, without a
// build: the content step of one page, the pending rule, the locks and
// the arguments. The runs against a production build (the
// three failing copies of tabs.md and two concurrent runs) are in
// scripts/test/build/check-page.build.test.mjs (npm run test:check-page).
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';
import { otherRuns, pageContent, parseArgs, takeEquivalenceLock, takeLock } from '../check-page.mjs';
import { listSources, pendingLine, runContent } from '../content/pipeline.mjs';
import { ownSpecs, titleFilter } from '../test-page.mjs';
import { frontMatterBlock } from '../content/hash.mjs';
import { relink } from './scale/generate.mjs';
import { PLACEHOLDER, outsideRepository } from '../content/scaffold-ar.mjs';

const guideDir = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const repoDir = resolve(guideDir, '..');
const docs = join(repoDir, 'docs', 'components');
const componentsFile = join(repoDir, 'components.json');
const toPosix = (path) => path.split('\\').join('/');
// Inside guide/.cache (ignored by Git): the relative links of the pilots are rewritten to lead to the same files.
const scratch = join(guideDir, '.cache', 'test-check-page', String(process.pid));
const locks = mkdtempSync(join(tmpdir(), 'hawiyah-check-page-locks-'));
afterAll(() => {
  rmSync(scratch, { recursive: true, force: true });
  rmSync(locks, { recursive: true, force: true });
});

/** A components directory holding the given pilot files, their relative links leading to the same files. */
function docsWith(name, files) {
  const dir = join(scratch, name, 'components');
  mkdirSync(dir, { recursive: true });
  for (const file of files) writeFileSync(join(dir, file), relink(readFileSync(join(docs, file), 'utf8'), dir));
  // The Arabic hashes follow the English sections, whose links moved.
  for (const file of files.filter((item) => item.endsWith('.ar.md'))) {
    const english = readFileSync(join(dir, file.replace('.ar.md', '.md')), 'utf8');
    writeFileSync(join(dir, file), readFileSync(join(dir, file), 'utf8').replace(/^---\n[\s\S]*?\n---/, frontMatterBlock(english)));
  }
  return dir;
}
const pendingFile = (name, pages) => {
  const file = join(scratch, `${name}-pending.json`);
  mkdirSync(scratch, { recursive: true });
  writeFileSync(file, JSON.stringify({ pages }));
  return file;
};

describe('arguments', () => {
  it('takes an id, --lang en, --draft, --docs and --workers', () => {
    expect(parseArgs(['tabs', '--lang', 'en', '--draft', '--docs', 'x', '--workers', '1'])).toEqual({ id: 'tabs', lang: 'en', draft: true, docs: 'x', workers: '1' });
    expect(() => parseArgs([])).toThrow('usage: npm run check:page');
    expect(() => parseArgs(['tabs', '--lang', 'ar'])).toThrow('--lang takes en');
    expect(() => parseArgs(['tabs', '--fast'])).toThrow('unknown argument --fast');
  });
  it('test:page selects the documents of the page and its own specs', () => {
    expect(titleFilter('tabs')).toBe('(components/tabs/|component page tabs \\()');
    expect(new RegExp(titleFilter('button')).test('guide rules reach package elements only to place them: en/components/button/reference/')).toBe(true);
    expect(new RegExp(titleFilter('button')).test('guide rules reach package elements only to place them: en/components/icon-button/')).toBe(false);
    expect(ownSpecs('tabs')).toEqual(['tests/e2e/tabs']);
    expect(ownSpecs('button')).toEqual(['tests/e2e/pages/button.spec.ts']);
  });
});

describe('the content step of one page', () => {
  it('checks both languages of a page and nothing of another page', () => {
    const dir = docsWith('both', ['tabs.md', 'tabs.ar.md', 'button.md']);
    const result = pageContent({ id: 'tabs', lang: null, componentsDir: dir, componentsFile, pendingFile: pendingFile('none', []) });
    expect(result.findings).toEqual([]);
    expect(result.langs).toEqual(['ar', 'en']);
    expect(result.groups.map((group) => `${group.lang}/${group.example}`)).toEqual(['ar/basic', 'ar/vertical', 'ar/manual', 'ar/disabled-tab', 'en/basic', 'en/vertical', 'en/manual', 'en/disabled-tab']);
    expect(result.manifest.pages[0].langs).toEqual(['ar', 'en']);
  });
  it('--lang en checks the English page alone', () => {
    const dir = docsWith('english', ['tabs.md', 'tabs.ar.md']);
    const result = pageContent({ id: 'tabs', lang: 'en', componentsDir: dir, componentsFile, pendingFile: pendingFile('none', []) });
    expect(result.findings).toEqual([]);
    expect(result.langs).toEqual(['en']);
    expect(result.groups).toHaveLength(4);
  });
});

describe('pages pending translation', () => {
  it('an English page without its Arabic sibling fails with HWC-FILE unless pending-translation.json lists it', () => {
    const dir = docsWith('pending', ['tabs.md']);
    const lonely = pageContent({ id: 'tabs', lang: null, componentsDir: dir, componentsFile, pendingFile: pendingFile('none', []) });
    expect(lonely.findings.map((item) => `${item.code} ${item.message}`)).toEqual([
      'HWC-FILE the English page has no Arabic sibling tabs.ar.md',
    ]);
    const listed = pageContent({ id: 'tabs', lang: null, componentsDir: dir, componentsFile, pendingFile: pendingFile('tabs', ['tabs']) });
    expect(listed.findings).toEqual([]);
    expect(listed.langs).toEqual(['en']);
    expect(listed.pending).toBe(true);
  });
  // The contract (Who does what): the writer of the English page lists its id, the writer of the Arabic page removes it.
  it('check:page --lang en passes for a listed id, and names the list to add the id to otherwise', () => {
    const dir = docsWith('english-alone', ['tabs.md']);
    const listed = pageContent({ id: 'tabs', lang: 'en', componentsDir: dir, componentsFile, pendingFile: pendingFile('english-alone', ['tabs']) });
    expect(listed.findings).toEqual([]);
    expect(listed.langs).toEqual(['en']);
    expect(listed.pending).toBe(true);
    const unlisted = pageContent({ id: 'tabs', lang: 'en', componentsDir: dir, componentsFile, pendingFile: pendingFile('none', []) });
    expect(unlisted.findings.map((item) => `${item.code} ${item.file}: ${item.message}`)).toEqual([
      `HWC-FILE ${toPosix(relative(repoDir, dir))}/tabs.md: the English page has no Arabic sibling tabs.ar.md; while it is written, add tabs to guide/scripts/content/pending-translation.json (the writer of the Arabic page removes it)`,
    ]);
    // Once the Arabic page exists, the entry fails until its writer removes it, with --lang en as well.
    const translated = docsWith('translated', ['tabs.md', 'tabs.ar.md']);
    for (const lang of [null, 'en']) {
      expect(pageContent({ id: 'tabs', lang, componentsDir: translated, componentsFile, pendingFile: pendingFile('english-alone', ['tabs']) }).findings.map((item) => item.message)).toEqual([
        `tabs is listed as pending translation, but ${toPosix(relative(repoDir, translated))}/tabs.ar.md exists; remove the entry`,
      ]);
    }
  });
  it('a build with a non-empty list prints the count of the pending pages', () => {
    expect(pendingLine([])).toBe('content: 0 pages pending translation');
    expect(pendingLine(['service-card', 'tabs'])).toBe('content: 2 pages pending translation (service-card, tabs: English only, no route until the Arabic page exists)');
    const dir = docsWith('count', ['tabs.md', 'button.md', 'button.ar.md']);
    const out = join(scratch, 'count', 'out');
    const result = runContent({ guideDir, repoDir, componentsDir: dir, componentsFile, outDir: out, liveGroupsFile: join(out, 'live-groups.json'), pending: new Set(['tabs']) });
    expect(result.findings).toEqual([]);
    expect(pendingLine(result.pending)).toBe('content: 1 pages pending translation (tabs: English only, no route until the Arabic page exists)');
    expect(readFileSync(join(guideDir, 'scripts', 'build-steps', '20-content.mjs'), 'utf8')).toContain('ctx.log(pendingLine(result.pending));');
  });
  it('in the build: the pending page has no route, the build counts it, and a stale entry fails', () => {
    const dir = docsWith('build', ['tabs.md', 'button.md', 'button.ar.md']);
    const out = join(scratch, 'build', 'out');
    const run = (pending) => runContent({ guideDir, repoDir, componentsDir: dir, componentsFile, outDir: out, liveGroupsFile: join(out, 'live-groups.json'), pending: new Set(pending) });
    expect(run([]).findings.map((item) => item.code)).toEqual(['HWC-FILE']);
    const result = run(['tabs']);
    expect(result.findings).toEqual([]);
    expect(result.pending).toEqual(['tabs']);
    expect(result.manifest.pages.map((page) => page.id)).toEqual(['button']);
    expect(JSON.parse(readFileSync(join(out, 'routes.json'), 'utf8'))).not.toContainEqual(expect.objectContaining({ id: 'tabs' }));
    const stale = listSources(['tabs.md', 'tabs.ar.md'], new Set(['tabs', 'button']), 'docs/components', new Set(['tabs', 'button']));
    expect(stale.findings.map((item) => item.message)).toEqual([
      'button is listed as pending translation, but docs/components/button.md does not exist',
      'tabs is listed as pending translation, but docs/components/tabs.ar.md exists; remove the entry',
    ]);
  });
  it('a placeholder sibling is written only outside the repository, and is Arabic', () => {
    expect(outsideRepository(tmpdir())).toBe(true);
    expect(outsideRepository(join(guideDir, '.cache', 'x'))).toBe(false);
    expect(outsideRepository(docs)).toBe(false);
    expect(PLACEHOLDER).toMatch(/^[\u0600-\u06ff ]+\.$/);
  });
  it('the list of the repository is a well formed list of pages', () => {
    const data = JSON.parse(readFileSync(join(guideDir, 'scripts', 'content', 'pending-translation.json'), 'utf8'));
    expect(Array.isArray(data.pages)).toBe(true);
  });
});

describe('concurrency', () => {
  it('step 80 of check:page takes an exclusive lock; a second taker waits until it is released', async () => {
    const dir = join(locks, 'equivalence');
    const first = await takeEquivalenceLock({ dir });
    let second = null;
    const waiting = takeEquivalenceLock({ dir }).then((release) => { second = release; });
    await new Promise((done) => setTimeout(done, 1200));
    expect(second).toBe(null);
    first();
    await waiting;
    expect(typeof second).toBe('function');
    second();
  });
  it('a lock whose process has ended is taken over', async () => {
    const dir = join(locks, 'stale');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'equivalence.lock'), '999999999');
    const release = await takeEquivalenceLock({ dir, timeoutMs: 2000 });
    expect(readFileSync(join(dir, 'equivalence.lock'), 'utf8')).toBe(String(process.pid));
    release();
  });
  it('the run lock records this run and ignores runs whose process has ended', async () => {
    const dir = join(locks, 'runs');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, '999999999.json'), JSON.stringify({ pid: 999999999, id: 'tabs' }));
    const release = await takeLock('tabs', { dir, timeoutMs: 2000 });
    expect(otherRuns(dir)).toEqual([]);
    expect(JSON.parse(readFileSync(join(dir, `${process.pid}.json`), 'utf8')).id).toBe('tabs');
    release();
  });
});
