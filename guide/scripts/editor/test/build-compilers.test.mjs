// Tests of the editor compilers step (editor.compilers): files present, manifest
// entries with hashes, sizes and sources, licence files, and that the sucrase
// bundle and the published files work as the worker uses them. The output is
// written to .cache/editor-compilers-test/ (ignored by Git).
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { COMPILERS_DIR, PUBLISHED_COMPILERS, SUCRASE, buildCompilers, packageOfInput } from '../build-compilers.mjs';

const guideDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const nodeModules = join(guideDir, 'node_modules');
const testDir = join(guideDir, '.cache', 'editor-compilers-test');
const runtimeDir = join(testDir, 'runtime');
const sha = (data) => createHash('sha256').update(data).digest('hex');
const lock = JSON.parse(readFileSync(join(guideDir, 'package-lock.json'), 'utf8'));

/** An entry of step 60 that must survive the merge. */
const KEPT = { path: 'npm/x@1.0.0/a.js', sha256: '0', bytes: 1, source: 'published', package: 'x', version: '1.0.0', packageIntegrity: 'sha512-x' };

let result;
let manifest;

beforeAll(async () => {
  rmSync(testDir, { recursive: true, force: true });
  mkdirSync(runtimeDir, { recursive: true });
  // A stale compilers entry of an earlier run is replaced, not duplicated.
  const stale = { ...KEPT, path: `${COMPILERS_DIR}/old.js` };
  writeFileSync(join(runtimeDir, 'manifest.json'), JSON.stringify({ entries: [KEPT, stale] }));
  result = await buildCompilers({ guideDir, runtimeDir });
  manifest = JSON.parse(readFileSync(join(runtimeDir, 'manifest.json'), 'utf8'));
}, 300000);

afterAll(() => {
  rmSync(testDir, { recursive: true, force: true });
});

describe('runtime/compilers/', () => {
  it('writes the five compiler files named by the specification', () => {
    for (const name of ['sucrase.js', 'compiler-sfc.esm-browser.js', 'typescript.js', 'compiler.mjs', 'es-module-lexer.js']) {
      expect(existsSync(join(runtimeDir, COMPILERS_DIR, name)), name).toBe(true);
    }
  });

  it('records every written file once in the manifest, with its hash and size', () => {
    const paths = manifest.entries.map((entry) => entry.path);
    expect(new Set(paths).size).toBe(paths.length);
    for (const entry of result.entries) {
      const data = readFileSync(join(runtimeDir, entry.path));
      const listed = manifest.entries.find((item) => item.path === entry.path);
      expect(listed, entry.path).toBeDefined();
      expect(listed.sha256).toBe(sha(data));
      expect(listed.bytes).toBe(data.length);
      expect(listed.bytes).toBeGreaterThan(0);
    }
    expect(result.bytes).toBe(result.entries.reduce((sum, entry) => sum + entry.bytes, 0));
  });

  it('keeps the entries of step 60 and replaces earlier compiler entries', () => {
    expect(manifest.entries.find((entry) => entry.path === KEPT.path)).toEqual(KEPT);
    expect(manifest.entries.find((entry) => entry.path === `${COMPILERS_DIR}/old.js`)).toBeUndefined();
    const sorted = [...manifest.entries.map((entry) => entry.path)].sort();
    expect(manifest.entries.map((entry) => entry.path)).toEqual(sorted);
  });

  it('serves the published files byte for byte, with the lockfile version and integrity', () => {
    for (const item of PUBLISHED_COMPILERS) {
      const entry = manifest.entries.find((e) => e.path === `${COMPILERS_DIR}/${item.path}`);
      const installed = readFileSync(join(nodeModules, item.package, item.file));
      expect(entry.source).toBe('published');
      expect(entry.file).toBe(item.file);
      expect(entry.sha256).toBe(sha(installed));
      expect(entry.package).toBe(item.package);
      expect(entry.version).toBe(lock.packages[`node_modules/${item.package}`].version);
      expect(entry.packageIntegrity).toBe(lock.packages[`node_modules/${item.package}`].integrity);
    }
  });

  it('records the sucrase bundle with its tool and the packages bundled into it', () => {
    const entry = manifest.entries.find((e) => e.path === `${COMPILERS_DIR}/${SUCRASE.path}`);
    expect(entry.source).toBe('bundled');
    expect(entry.package).toBe('sucrase');
    expect(entry.version).toBe('3.35.1');
    expect(entry.tool).toMatch(/^esbuild \d+\.\d+\.\d+$/);
    expect(entry.inputs.map((input) => input.package)).toContain('lines-and-columns');
    for (const input of entry.inputs) {
      expect(input.packageIntegrity).toBe(lock.packages[`node_modules/${input.package}`].integrity);
    }
  });

  it('copies the licence files of every package it serves or bundles', () => {
    const sucrase = manifest.entries.find((e) => e.path === `${COMPILERS_DIR}/${SUCRASE.path}`);
    const packages = [...PUBLISHED_COMPILERS.map((item) => item.package), 'sucrase', ...sucrase.inputs.map((input) => input.package)];
    for (const name of packages) {
      const licences = manifest.entries.filter((e) => e.path.startsWith(`${COMPILERS_DIR}/licenses/${name}/`));
      expect(licences.length, name).toBeGreaterThan(0);
      for (const entry of licences) expect(entry.source).toBe('published');
    }
  });

  it('the sucrase bundle transforms TSX with the automatic runtime and keeps line numbers', async () => {
    const { transform } = await import(pathToFileURL(join(runtimeDir, COMPILERS_DIR, 'sucrase.js')).href);
    const code = transform('const a: number = 1;\nexport const b = <p>{a}</p>;\n', {
      transforms: ['typescript', 'jsx'],
      jsxRuntime: 'automatic',
      production: true,
    }).code;
    expect(code).toContain('react/jsx-runtime');
    expect(code).not.toContain(': number');
    expect(code.split('\n').length).toBeGreaterThanOrEqual(2);
  });

  it('typescript.js defines ts when evaluated as a classic script, as the worker does', () => {
    const text = readFileSync(join(runtimeDir, COMPILERS_DIR, 'typescript.js'), 'utf8');
    const ts = vm.runInNewContext(`${text}\n;ts`, {}, { timeout: 60000 });
    expect(typeof ts.transpileModule).toBe('function');
    expect(ts.version).toBe('6.0.3');
  });

  it('fails when step 60 has not written the manifest', async () => {
    await expect(buildCompilers({ guideDir, runtimeDir: join(testDir, 'missing') })).rejects.toThrow(/manifest\.json does not exist/);
  });
});

describe('packageOfInput', () => {
  it('names plain and scoped packages and ignores files directly in node_modules', () => {
    expect(packageOfInput('node_modules/sucrase/dist/esm/index.js')).toBe('sucrase');
    expect(packageOfInput('node_modules/@jridgewell/gen-mapping/dist/x.mjs')).toBe('@jridgewell/gen-mapping');
    expect(packageOfInput('node_modules/sucrase-entry.js')).toBeNull();
    expect(packageOfInput('src/x.js')).toBeNull();
  });
});
