// Unit tests of the source rules L-SRC-1 to L-SRC-9 with exact rule ids and lines.

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { lintSources, lintSourceText } from '../sources.mjs';

const lint = (text, file = 'src/app/page.ts', root = '/guide-root/guide') => lintSourceText(file, text, { root }).map((item) => [item.rule, item.line]);
const repoPath = (...segments) => segments.join('/');

describe('L-SRC-1 server DOM shims', () => {
  it('rejects shim imports in src/', () => {
    expect(lint("import 'domino';\n", 'src/main.server.ts')).toEqual([['L-SRC-1', 1]]);
    expect(lint("import '@angular/platform-server/init';\n", 'src/main.server.ts')).toEqual([['L-SRC-1', 1]]);
    expect(lint("import { JSDOM } from 'jsdom';\n", 'src/app/page.ts')).toEqual([['L-SRC-1', 1]]);
  });

  it('allows jsdom in scripts/', () => {
    expect(lint("import { JSDOM } from 'jsdom';\n", 'scripts/content/check.mjs')).toEqual([]);
  });
});

describe('L-SRC-2 DOM globals', () => {
  it('rejects assignments of DOM globals on the global object anywhere', () => {
    expect(lint('globalThis.window = undefined as never;\n', 'src/main.server.ts')).toEqual([['L-SRC-2', 1]]);
    expect(lint("const ok = 1;\n(global as any)['document'] = {};\n", 'scripts/setup.mjs')).toEqual([['L-SRC-2', 2]]);
    expect(lint("Object.defineProperty(globalThis, 'HTMLElement', { value: class {} });\n", 'scripts/setup.mjs')).toEqual([['L-SRC-2', 1]]);
  });

  it('accepts reading globals and assigning other names', () => {
    expect(lint('globalThis.guideReady = true;\nexport const w = globalThis.window;\n', 'scripts/setup.mjs')).toEqual([]);
  });
});

describe('L-SRC-3 platform checks', () => {
  it('rejects typeof window and platform tokens in src/app/', () => {
    expect(lint("export const b = typeof window !== 'undefined';\n")).toEqual([['L-SRC-3', 1]]);
    expect(lint("import { isPlatformBrowser } from '@angular/common';\nexport const b = isPlatformBrowser;\n")).toEqual([['L-SRC-3', 1], ['L-SRC-3', 2]]);
  });

  it('exempts spec files and files outside src/app/', () => {
    expect(lint("export const b = typeof document;\n", 'src/app/page.spec.ts')).toEqual([]);
    expect(lint("export const b = typeof document;\n", 'src/main.ts')).toEqual([]);
  });
});

describe('L-SRC-4 hydration', () => {
  const config = (providers) => `import { provideClientHydration, withEventReplay } from '@angular/platform-browser';\n\nexport const appConfig = {\n  providers: [${providers}],\n};\n`;

  it('requires provideClientHydration(withEventReplay()) exactly once in app.config.ts', () => {
    expect(lint(config('provideClientHydration(withEventReplay())'), 'src/app/app.config.ts')).toEqual([]);
    expect(lint(config('provideClientHydration()'), 'src/app/app.config.ts')).toEqual([['L-SRC-4', 4]]);
    expect(lint(config('provideClientHydration(withEventReplay(), withI18nSupport())'), 'src/app/app.config.ts')).toEqual([['L-SRC-4', 4]]);
    expect(lint(config(''), 'src/app/app.config.ts')).toEqual([['L-SRC-4', 1]]);
  });

  it('rejects the banned hydration options anywhere', () => {
    expect(lint("import { withIncrementalHydration } from '@angular/platform-browser';\n")).toEqual([['L-SRC-4', 1]]);
    expect(lint('export const host = { ngSkipHydration: "true" };\n', 'src/app/page.ts')).toEqual([['L-SRC-4', 1]]);
  });
});

describe('L-SRC-5 unsafe HTML', () => {
  it('rejects the sanitizer bypass and HTML sinks in src/app/', () => {
    expect(lint("import { DomSanitizer } from '@angular/platform-browser';\n")).toEqual([['L-SRC-5', 1]]);
    expect(lint('export const f = (s: any) => s.bypassSecurityTrustHtml("x");\n')).toEqual([['L-SRC-5', 1]]);
    expect(lint('export const f = (e: Element) => {\n  e.innerHTML = "x";\n};\n')).toEqual([['L-SRC-5', 2]]);
    expect(lint('export const f = (e: Element) => e.insertAdjacentHTML("beforeend", "x");\n')).toEqual([['L-SRC-5', 1]]);
  });

  it('allows the srcdoc assignment in preview-frame.ts only', () => {
    const text = 'export const f = (frame: HTMLIFrameElement, html: string) => {\n  frame.srcdoc = html;\n};\n';
    expect(lint(text, 'src/app/examples/frame/preview-frame.ts')).toEqual([]);
    expect(lint(text, 'src/app/page.ts')).toEqual([['L-SRC-5', 2]]);
  });
});

describe('L-SRC-6 component metadata', () => {
  const metadata = (extra) => `import { Component, ViewEncapsulation } from '@angular/core';\n\n@Component({\n  selector: 'guide-page',\n  templateUrl: './page.html',\n${extra}})\nexport class Page {}\n`;

  it('rejects styles and non-emulated encapsulation', () => {
    expect(lint(metadata("  styles: [':host { display: block; }'],\n"))).toEqual([['L-SRC-6', 6]]);
    expect(lint(metadata('  encapsulation: ViewEncapsulation.None,\n'))).toEqual([['L-SRC-6', 6]]);
    expect(lint(metadata('  encapsulation: ViewEncapsulation.ShadowDom,\n'))).toEqual([['L-SRC-6', 6]]);
  });

  it('accepts styleUrl and emulated encapsulation', () => {
    expect(lint(metadata("  styleUrl: './page.css',\n  encapsulation: ViewEncapsulation.Emulated,\n"))).toEqual([]);
  });
});

describe('L-SRC-7 repository imports', () => {
  it('rejects imports that resolve into the repository packages, apps or examples', () => {
    const specifier = repoPath('..', '..', '..', 'packages', 'core', 'src', 'index');
    expect(lint(`import { x } from '${specifier}';\n`)).toEqual([['L-SRC-7', 1]]);
    const app = repoPath('..', '..', '..', 'apps', 'playground', 'src', 'main');
    expect(lint(`export const m = await import('${app}');\n`)).toEqual([['L-SRC-7', 1]]);
  });

  it('accepts the guide\'s own examples directory and installed packages', () => {
    expect(lint("import { payload } from './examples/payload';\nimport { Button } from '@hawiyah/angular';\n")).toEqual([]);
  });
});

describe('L-SRC-8 colours in the editor theme and frame document', () => {
  it('rejects raw colours in string literals of the two files', () => {
    expect(lint("export const theme = {\n  background: '#ffffff',\n  text: `rgb(0 0 0)`,\n};\n", 'src/app/features/editor/code-theme.ts')).toEqual([['L-SRC-8', 2], ['L-SRC-8', 3]]);
    expect(lint("export const css = 'body { color: black; }';\n", 'src/app/examples/frame/document.ts')).toEqual([['L-SRC-8', 1]]);
  });

  it('accepts tokens there and ignores other files', () => {
    expect(lint("export const theme = { text: 'var(--hw-color-text)' };\n", 'src/app/features/editor/code-theme.ts')).toEqual([]);
    expect(lint("export const label = 'red';\n", 'src/app/page.ts')).toEqual([]);
  });
});

describe('L-SRC-9 console', () => {
  it('rejects console.log in src/app/ and allows warn and error in link-navigation.ts', () => {
    expect(lint('export function f() {\n  console.log("x");\n}\n')).toEqual([['L-SRC-9', 2]]);
    expect(lint('export function f() {\n  console.warn("x");\n}\n')).toEqual([['L-SRC-9', 2]]);
    expect(lint('export function f(e: unknown) {\n  console.error(e);\n}\n', 'src/app/core/link-navigation.ts')).toEqual([]);
    expect(lint('console.log("build");\n', 'scripts/build.mjs')).toEqual([]);
  });
});

describe('lintSources over a tree', () => {
  it('lints the good source fixture without findings', () => {
    const root = new URL('./fixtures/good/sources/', import.meta.url).pathname;
    const result = lintSources(root);
    expect(result.files).toBe(6);
    expect(result.findings).toEqual([]);
  });

  it('skips test fixtures and src/generated/', () => {
    const root = mkdtempSync(join(tmpdir(), 'hw-lint-'));
    try {
      for (const dir of ['scripts/x/test/fixtures', 'src/generated', 'src/app']) mkdirSync(join(root, dir), { recursive: true });
      writeFileSync(join(root, 'scripts/x/test/fixtures/bad.mjs'), 'globalThis.window = {};\n');
      writeFileSync(join(root, 'src/generated/features.ts'), 'console.log(1);\n');
      writeFileSync(join(root, 'src/app/ok.ts'), 'export const ok = true;\n');
      expect(lintSources(root)).toEqual({ files: 1, findings: [] });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
