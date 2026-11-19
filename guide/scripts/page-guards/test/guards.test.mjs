// Tests of the icon and text guards of build step 72 (scripts/page-guards).
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { checkPage, checkSources, iconRules, readAllowlist } from '../guards.mjs';

const icons = iconRules(`
.hw-icon[data-icon="copy-01"] { --hw-icon-image: url(a.svg); }
[data-icon='menu-01'] { --hw-icon-image: url(b.svg); }
[data-icon-only] { gap: 0; }
`);
const page = (lang, body) => `<!doctype html><html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}"><head><title>t</title></head><body>${body}</body></html>`;
const codes = (findings) => findings.map((item) => `${item.code}:${item.line}`);
const dirs = [];
afterAll(() => { for (const dir of dirs) rmSync(dir, { recursive: true, force: true }); });

describe('icon rules', () => {
  it('reads data-icon values written with either quote', () => {
    expect([...icons].sort()).toEqual(['copy-01', 'menu-01']);
  });

  it('rejects a data-icon value without a packaged rule, an svg and an icon-font class', () => {
    const html = page('en', '<span class="hw-icon" data-icon="copy-01"></span>\n<span data-icon="star-99"></span>\n<svg viewBox="0 0 1 1"></svg>\n<i class="fa fa-star"></i>');
    expect(codes(checkPage('en/index.html', html, { icons }))).toEqual(['HWP-ICON:2', 'HWP-SVG:3', 'HWP-FONT:4', 'HWP-FONT:4']);
  });

  it('rejects an emoji in text and in a reader attribute', () => {
    const html = page('en', '<p>Done ✅</p><button aria-label="Copy \u{1F4CB}"></button><p>© 2026</p>');
    expect(codes(checkPage('en/index.html', html, { icons }))).toEqual(['HWP-EMOJI:1', 'HWP-EMOJI:1']);
  });
});

describe('Latin-script runs on Arabic pages', () => {
  it('rejects four Latin words in Arabic text and attributes, not on English pages', () => {
    const body = '<p>نص عربي ثم This sentence stays in English here.</p><button aria-label="Copy the code now"></button><p>React و Vue و Angular</p>';
    expect(codes(checkPage('ar/index.html', page('ar', body), { icons }))).toEqual(['HWP-LATIN:1', 'HWP-LATIN:1']);
    expect(checkPage('en/index.html', page('en', body), { icons })).toEqual([]);
  });

  it('skips code, kbd, pre and elements with a non-Arabic lang', () => {
    const body = '<p>اضغط <kbd>Shift Tab then Enter</kbd> ثم <code>npm install the package now</code></p>'
      + '<pre>one two three four</pre><p lang="en">Packages on npm are listed here</p><p dir="ltr"><span lang="en">Four English words here</span></p>';
    expect(checkPage('ar/index.html', page('ar', body), { icons })).toEqual([]);
  });

  it('accepts a run listed in the allow-list and records it as used', () => {
    const used = new Set();
    const body = '<p>الاسم Digital Government Authority Platforms Code كما هو</p>';
    const allowlist = [{ text: 'Digital Government Authority Platforms Code', reason: 'proper name', pages: ['ar/index.html'] }];
    expect(checkPage('ar/index.html', page('ar', body), { icons, allowlist, used })).toEqual([]);
    expect([...used]).toEqual(['Digital Government Authority Platforms Code']);
    expect(codes(checkPage('ar/other.html', page('ar', body), { icons, allowlist }))).toEqual(['HWP-LATIN:1']);
  });

  it('validates the allow-list: text and reason are required', () => {
    const dir = mkdtempSync(join(tmpdir(), 'hw-page-guards-'));
    dirs.push(dir);
    const file = join(dir, 'list.json');
    writeFileSync(file, JSON.stringify([{ text: 'Four Latin words here' }]));
    expect(() => readAllowlist(file)).toThrow('entry 0 must be { text, reason, pages? }');
    writeFileSync(file, JSON.stringify([{ text: 'Four Latin words here', reason: 'a proper name' }]));
    expect(readAllowlist(file)).toHaveLength(1);
  });
});

describe('template and text sources', () => {
  it('rejects svg, an icon-font class and an emoji in src/, not in spec files', () => {
    const dir = mkdtempSync(join(tmpdir(), 'hw-page-guards-'));
    dirs.push(dir);
    mkdirSync(join(dir, 'src', 'app'), { recursive: true });
    writeFileSync(join(dir, 'src', 'app', 'a.ts'), "export const t = { done: 'Done \u{1F389}' };\nconst template = `<svg></svg><i class=\"material-icons\">x</i>`;\n");
    writeFileSync(join(dir, 'src', 'app', 'a.spec.ts'), "const fixture = '<svg></svg> \u{1F389}';\n");
    expect(checkSources(dir).map((item) => `${item.code} ${item.file}:${item.line}`)).toEqual([
      'HWP-EMOJI src/app/a.ts:1',
      'HWP-SVG src/app/a.ts:2',
      'HWP-FONT src/app/a.ts:2',
    ]);
  });
});
