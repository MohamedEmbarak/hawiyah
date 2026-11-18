// Tests of the runtime step (editor.runtimeFiles): closure, facade export lists,
// linker output, import map, manifest hashes and the fallback bundles. The
// runtime is built once into .cache/runtime-test/ (ignored by Git).
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { init, parse } from 'es-module-lexer';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildRuntime, stylesheetPaths } from '../build-runtime.mjs';
import { bundleEntrySource } from '../bundles.mjs';
import { facadeSource } from '../bundle-react.mjs';
import { hasPartialDeclarationCall, linkModule } from '../link-angular.mjs';
import { ENTRY_TABLE, resolveClosure, resolveExports, splitSpecifier } from '../resolve.mjs';

const guideDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const nodeModules = join(guideDir, 'node_modules');
const runtimeDir = join(guideDir, '.cache', 'runtime-test', 'runtime');
const sha = (data) => createHash('sha256').update(data).digest('hex');
const walk = (dir, base = dir, out = []) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, base, out);
    else out.push(relative(base, path).split('\\').join('/'));
  }
  return out;
};

let result;
let manifest;
let importMap;

beforeAll(async () => {
  await init;
  result = await buildRuntime({ guideDir, runtimeDir });
  manifest = JSON.parse(readFileSync(join(runtimeDir, 'manifest.json'), 'utf8'));
  importMap = JSON.parse(readFileSync(join(runtimeDir, 'import-map.json'), 'utf8'));
}, 300000);

afterAll(() => {
  rmSync(join(guideDir, '.cache', 'runtime-test'), { recursive: true, force: true });
});

describe('package exports resolution', () => {
  it('splits scoped and plain specifiers', () => {
    expect(splitSpecifier('@angular/core/primitives/di')).toEqual({ name: '@angular/core', subpath: './primitives/di' });
    expect(splitSpecifier('rxjs')).toEqual({ name: 'rxjs', subpath: '.' });
  });

  it('uses the import and default conditions and patterns', () => {
    const exportsField = { '.': { types: './a.d.ts', import: './dist/a.js', require: './a.cjs' }, './x/*': { default: './dist/x/*.mjs' } };
    expect(resolveExports(exportsField, '.')).toBe('dist/a.js');
    expect(resolveExports(exportsField, './x/y')).toBe('dist/x/y.mjs');
    expect(resolveExports(exportsField, './missing')).toBeNull();
    expect(resolveExports('./main.js', '.')).toBe('main.js');
  });
});

describe('closure', () => {
  it('starts from the entry table of every framework', async () => {
    const closure = await resolveClosure({ nodeModules });
    for (const [framework, entries] of Object.entries(ENTRY_TABLE)) {
      for (const specifier of entries) expect(closure.frameworks[framework]).toContain(specifier);
    }
    expect(closure.frameworks.angular).toContain('rxjs');
    expect(closure.frameworks.angular).toContain('@angular/forms');
    expect(closure.frameworks.vanilla).toEqual(['@hawiyah/core', '@hawiyah/vanilla', '@internationalized/date']);
  });

  it('maps every bare import of a served module through the import map', () => {
    const served = manifest.entries.filter((entry) => /\.(?:m?js)$/.test(entry.path) && !entry.path.startsWith('bundles/'));
    expect(served.length).toBeGreaterThan(50);
    for (const entry of served) {
      const [imports] = parse(readFileSync(join(runtimeDir, entry.path), 'utf8'));
      for (const item of imports) {
        if (!item.n || item.d === -2) continue;
        if (item.n.startsWith('./') || item.n.startsWith('../')) {
          const target = join(dirname(join(runtimeDir, entry.path)), item.n);
          expect(existsSync(target), `${entry.path} imports ${item.n}`).toBe(true);
        } else {
          expect(importMap.imports[item.n], `${entry.path} imports ${item.n}`).toBeDefined();
        }
      }
    }
  });

  it('writes an import map of base-relative runtime paths, sorted by specifier', () => {
    const keys = Object.keys(importMap.imports);
    expect(keys).toEqual([...keys].sort());
    for (const path of Object.values(importMap.imports)) {
      expect(path).toMatch(/^runtime\/(?:npm|linked|bundled)\/(?:@[a-z-]+\/)?[a-z-]+@\d+\.\d+\.\d+\//);
      expect(existsSync(join(runtimeDir, path.slice('runtime/'.length)))).toBe(true);
    }
    expect(importMap.imports.vue).toBe('runtime/npm/vue@3.5.44/dist/vue.runtime.esm-browser.prod.js');
    expect(importMap.imports['@hawiyah/angular']).toBe('runtime/linked/@hawiyah/angular@0.3.0/dist/fesm2022/hawiyah-angular.mjs');
    expect(importMap.imports.react).toBe('runtime/bundled/react@19.3.1/react.js');
  });
});

describe('facades', () => {
  const require = createRequire(join(guideDir, 'package.json'));

  it('re-export every name Node enumerates for react, react/jsx-runtime and react-dom/client', () => {
    for (const [file, entry] of [['react.js', 'react'], ['jsx-runtime.js', 'react/jsx-runtime'], ['react-dom-client.js', 'react-dom/client']]) {
      const expected = Object.keys(require(entry)).filter((name) => name !== 'default').sort();
      const [, exports] = parse(readFileSync(join(runtimeDir, 'bundled', 'react@19.3.1', file), 'utf8'));
      const names = exports.map((item) => item.n).sort();
      expect(names).toEqual(['default', ...expected].sort());
    }
  });

  it('builds facade source from a namespace', () => {
    expect(facadeSource('React', ['a', 'b'])).toContain('export const { a, b } = ns;');
  });

  it('keeps the rxjs exports of both entries and one shared chunk', () => {
    for (const [file, entry] of [['rxjs.js', 'rxjs'], ['operators.js', 'rxjs/operators']]) {
      const expected = Object.keys(require(entry)).filter((name) => name !== '__esModule').sort();
      const [, exports] = parse(readFileSync(join(runtimeDir, 'bundled', 'rxjs@7.8.2', file), 'utf8'));
      expect(exports.map((item) => item.n).sort()).toEqual(expected);
    }
    const files = readdirSync(join(runtimeDir, 'bundled', 'rxjs@7.8.2'));
    expect(files.filter((name) => name.startsWith('rxjs-shared-'))).toHaveLength(1);
  });
});

describe('linker', () => {
  it('leaves no partial declaration call in a linked file', () => {
    const linked = manifest.entries.filter((entry) => entry.path.startsWith('linked/'));
    expect(linked.length).toBeGreaterThan(10);
    for (const entry of linked) {
      const code = readFileSync(join(runtimeDir, entry.path), 'utf8');
      expect(hasPartialDeclarationCall(code), entry.path).toBe(false);
      expect(/ɵɵngDeclare\w*\s*\(\s*\{/.test(code.replace(/function ɵɵngDeclare\w*\(decl\) \{/g, '')), entry.path).toBe(false);
    }
  });

  it('records changed files as linked with the tool and unchanged files as published', () => {
    const linked = manifest.entries.filter((entry) => entry.path.startsWith('linked/'));
    for (const entry of linked) {
      const original = readFileSync(join(nodeModules, entry.package, entry.file));
      const served = readFileSync(join(runtimeDir, entry.path));
      if (entry.source === 'published') expect(served.equals(original), entry.path).toBe(true);
      else {
        expect(entry.source).toBe('linked');
        expect(served.equals(original)).toBe(false);
        expect(entry.tool).toBe('@angular/compiler-cli 22.2.3 linker with @babel/core 8.0.5');
      }
    }
    expect(linked.find((entry) => entry.path.endsWith('hawiyah-angular.mjs'))?.source).toBe('linked');
  });

  it('turns a partial component declaration into a definition', async () => {
    const source = [
      "import * as i0 from '@angular/core';",
      'export class Box {',
      "  static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: '12.0.0', version: '22.2.3', ngImport: i0, type: Box, deps: [], target: i0.ɵɵFactoryTarget.Component });",
      "  static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: '14.0.0', version: '22.2.3', type: Box, isStandalone: true, selector: 'x-box', ngImport: i0, template: '<p>box</p>' });",
      '}',
    ].join('\n');
    const linked = await linkModule(source, '/virtual/box.mjs');
    expect(linked.changed).toBe(true);
    expect(hasPartialDeclarationCall(linked.code)).toBe(false);
    expect(linked.code).toContain('ɵɵdefineComponent');
  });
});

describe('manifest', () => {
  it('lists every served file with its sha256, size and source package', () => {
    const files = walk(runtimeDir).filter((path) => path !== 'manifest.json' && path !== 'import-map.json').sort();
    expect(manifest.entries.map((entry) => entry.path)).toEqual(files);
    const lock = JSON.parse(readFileSync(join(guideDir, 'package-lock.json'), 'utf8'));
    for (const entry of manifest.entries) {
      const data = readFileSync(join(runtimeDir, entry.path));
      expect(entry.sha256).toBe(sha(data));
      expect(entry.bytes).toBe(data.length);
      expect(['published', 'linked', 'bundled']).toContain(entry.source);
      const lockEntry = lock.packages[`node_modules/${entry.package}`];
      expect(lockEntry.version).toBe(entry.version);
      expect(lockEntry.integrity).toBe(entry.packageIntegrity);
      if (entry.source !== 'bundled') expect(typeof entry.file).toBe('string');
      if (entry.source !== 'published') expect(entry.tool).toMatch(/^(?:@angular\/compiler-cli 22\.2\.3 linker with @babel\/core 8\.0\.5|esbuild 0\.28\.2)$/);
    }
  });

  it('serves published files unmodified', () => {
    for (const entry of manifest.entries.filter((item) => item.source === 'published')) {
      expect(sha(readFileSync(join(nodeModules, entry.package, entry.file))), entry.path).toBe(entry.sha256);
    }
  });

  it('serves the three stylesheets and their assets', () => {
    for (const path of stylesheetPaths('0.3.0')) expect(existsSync(join(runtimeDir, path))).toBe(true);
    expect(existsSync(join(runtimeDir, 'npm/@hawiyah/styles@0.3.0/dist/assets/select-down.svg'))).toBe(true);
    expect(walk(join(runtimeDir, 'npm/@hawiyah/styles@0.3.0/dist/assets/fonts')).some((name) => name.endsWith('.woff2'))).toBe(true);
  });
});

describe('fallback bundles', () => {
  it('builds one classic bundle per framework that defines HawiyahRuntime', () => {
    for (const framework of Object.keys(ENTRY_TABLE)) {
      const code = readFileSync(join(runtimeDir, 'bundles', `${framework}.js`), 'utf8');
      const [imports, exports] = parse(code);
      expect(imports.filter((item) => item.d !== -2)).toHaveLength(0);
      expect(exports).toHaveLength(0);
      expect(code).toContain('HawiyahRuntime');
    }
  });

  it('runs the vanilla bundle and exposes the closure and define()', () => {
    const code = readFileSync(join(runtimeDir, 'bundles', 'vanilla.js'), 'utf8');
    const context = vm.createContext({ console });
    context.globalThis = context;
    vm.runInContext(code, context);
    const runtime = context.HawiyahRuntime;
    expect(Object.keys(runtime.modules).sort()).toEqual(result.frameworks.vanilla);
    expect(typeof runtime.modules['@hawiyah/vanilla'].enhance).toBe('function');
    const defined = runtime.define('hawiyah-project/x.js', ['exports', '@hawiyah/vanilla'], (exports, vanilla) => {
      exports.ok = typeof vanilla.enhance;
    });
    expect(defined.ok).toBe('function');
    expect(runtime.modules['hawiyah-project/x.js'].ok).toBe('function');
    expect(() => runtime.define('y', ['missing'], () => 1)).toThrow(/no module missing/);
  });

  it('lists one module per specifier in the entry source', () => {
    const source = bundleEntrySource(['a', 'b/c']);
    expect(source).toContain('import * as m1 from "b/c";');
    expect(source).toContain('modules["b/c"] = m1;');
  });
});
