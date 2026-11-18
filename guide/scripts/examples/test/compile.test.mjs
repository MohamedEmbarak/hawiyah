// End-to-end runs of the example compiler over the fixture live groups: one file
// whose groups compile in all four frameworks (fragment and module forms, English
// and Arabic) and one group per failure code.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { runExamples } from '../cli.mjs';
import { validateGroups } from '../compile.mjs';
import { copyExampleFiles } from '../files.mjs';
import { fixturesDir, readFixture, workRoot } from './helpers.mjs';

const FRAMEWORKS = ['vanilla', 'react', 'vue', 'angular'];

describe('compiling the fixture groups', () => {
  const out = join(workRoot, 'groups-ok');
  let result;
  beforeAll(async () => {
    result = await runExamples({ groups: join(fixturesDir, 'live-groups.json'), out, generated: join(out, 'generated') });
  }, 120000);

  it('compiles every group in both languages for all four frameworks', () => {
    expect(result.findings.map((f) => f.text)).toEqual([]);
    expect(result.payloads).toHaveLength(16);
    for (const lang of ['en', 'ar']) {
      for (const example of ['basic', 'module-form']) {
        for (const framework of FRAMEWORKS) {
          expect(existsSync(join(out, 'frames', 'fixture', lang, example, `${framework}.json`))).toBe(true);
        }
      }
    }
  });

  it('writes payloads that follow ExamplePayload', () => {
    const payload = JSON.parse(readFileSync(join(out, 'frames', 'fixture', 'ar', 'basic', 'angular.json'), 'utf8'));
    expect(Object.keys(payload)).toEqual(['id', 'lang', 'dir', 'example', 'framework', 'files', 'primaryFile', 'compiled', 'toolchain']);
    expect(payload).toMatchObject({ id: 'fixture', lang: 'ar', dir: 'rtl', example: 'basic', framework: 'angular', primaryFile: 'example.component.ts' });
    expect(Object.keys(payload.files)).toEqual(['example.component.ts', 'main.ts']);
    expect(payload.files['example.component.ts']).toContain('متابعة');
    expect(payload.compiled.entry).toBe('main.js');
    expect(payload.compiled.host).toBe('<guide-example></guide-example>');
    expect(Object.keys(payload.compiled.modules)).toEqual(['main.js', 'example.component.js']);
    expect(payload.compiled.imports).toEqual(['@angular/core', '@angular/platform-browser', '@hawiyah/angular']);
    expect(payload.compiled.classic).toContain('globalThis.HawiyahRuntime');
    expect(payload.compiled.classic).not.toMatch(/^import /m);
    expect(Object.keys(payload.toolchain)).toEqual(['typescript', 'esbuild', 'vue', 'angular']);

    const vanilla = JSON.parse(readFileSync(join(out, 'frames', 'fixture', 'en', 'basic', 'vanilla.json'), 'utf8'));
    expect(vanilla.dir).toBe('ltr');
    expect(Object.keys(vanilla.files)).toEqual(['index.html', 'main.js']);
    expect(vanilla.compiled.host).toBe(`<div id="app">${vanilla.files['index.html'].trimEnd()}</div>`);
    expect(vanilla.compiled.imports).toEqual(['@hawiyah/vanilla']);

    const react = JSON.parse(readFileSync(join(out, 'frames', 'fixture', 'en', 'module-form', 'react.json'), 'utf8'));
    expect(react.primaryFile).toBe('Example.tsx');
    expect(react.compiled.imports).toEqual(['@hawiyah/react', 'react-dom/client', 'react/jsx-runtime']);
  });

  it('writes native components, their index and the loaders', () => {
    const generated = join(out, 'generated');
    const loaders = readFileSync(join(generated, 'loaders.ts'), 'utf8');
    expect(loaders).toContain("'fixture/ar': () => import('./fixture/ar/index'),");
    expect(loaders).toContain("'fixture/en': () => import('./fixture/en/index'),");
    const index = readFileSync(join(generated, 'fixture', 'en', 'index.ts'), 'utf8');
    expect(index).toContain("import { FixtureBasicEn } from './basic';");
    expect(index).toContain("'module-form': FixtureModuleFormEn,");
    const native = readFileSync(join(generated, 'fixture', 'ar', 'module-form.ts'), 'utf8');
    expect(native).toContain('export class FixtureModuleFormAr {');
    expect(native).toContain("selector: 'guide-example-fixture-module-form'");
  });

  it('copies payloads and download files for the site (step 45)', () => {
    const site = join(out, 'site-examples');
    const counts = copyExampleFiles(join(out, 'frames'), site);
    expect(counts).toEqual({ payloads: 16, files: 32 });
    expect(readFileSync(join(site, 'fixture', 'ar', 'basic', 'vue', 'Example.vue'), 'utf8')).toContain('إلغاء');
    expect(existsSync(join(site, 'fixture', 'en', 'basic', 'vanilla', 'index.html'))).toBe(true);
    expect(existsSync(join(site, 'fixture', 'en', 'basic', 'angular.json'))).toBe(true);
  });
});

describe('compiling the failure fixtures', () => {
  const groups = readFixture('failures.live-groups.json');
  const out = join(workRoot, 'groups-fail');
  let result;
  beforeAll(async () => {
    result = await runExamples({ groups: join(fixturesDir, 'failures.live-groups.json'), out, generated: join(out, 'generated') });
  }, 120000);

  for (const group of groups) {
    it(`${group.example} reports ${group.expected.code}`, () => {
      const own = result.findings.filter((f) => f.message.startsWith(`[failure/en/${group.example} `));
      expect(own.length).toBeGreaterThan(0);
      for (const finding of own) {
        expect(finding.message.startsWith(`[failure/en/${group.example} ${group.expected.framework}]`)).toBe(true);
        expect(finding.text).toMatch(/^HWC-[A-Z0-9]+ docs\/components\/failure\.md:\d+: /);
      }
      expect(own.map((f) => f.code)).toContain(group.expected.code);
      if (group.expected.text) expect(own.map((f) => f.message).join('\n')).toContain(group.expected.text);
      // The other three frameworks of the group still compile.
      const compiled = result.payloads.filter((p) => p.example === group.example).map((p) => p.framework).sort();
      expect(compiled).toEqual(FRAMEWORKS.filter((f) => f !== group.expected.framework).sort());
    });
  }

  it('points each finding at the line of the source block', () => {
    const tab = result.findings.find((f) => f.code === 'HWC-A1');
    const group = groups.find((g) => g.example === 'angular-required-input');
    expect(tab.line).toBe(group.blocks.angular.line + 3);
    const lodash = result.findings.find((f) => f.code === 'HWC-LIVE5');
    expect(lodash.line).toBe(groups.find((g) => g.example === 'lodash-import').blocks.react.line + 2);
  });
});

describe('validateGroups', () => {
  it('rejects input that breaks the live-groups.json contract', () => {
    expect(() => validateGroups({})).toThrow(/array/);
    const group = readFixture('live-groups.json')[0];
    expect(() => validateGroups([{ ...group, lang: 'fr' }])).toThrow(/lang/);
    expect(() => validateGroups([group, group])).toThrow(/twice/);
    const { react: _react, ...blocks } = group.blocks;
    expect(() => validateGroups([{ ...group, blocks }])).toThrow(/blocks\.react/);
  });
});
