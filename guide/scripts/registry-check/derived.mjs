// HWREG-R8, derived files: the expectation of the served runtime is derived
// again, never read from the output. Build steps 60 and 62 are run once more
// from the verified guide/node_modules into a scratch directory; every file of
// <distDir>/runtime/ (manifest.json and import-map.json included) must then
// equal the derived file byte for byte, and no file may be missing or extra.
// The labels of runtime/manifest.json are therefore not trusted: a published
// file relabelled as bundled, a linked file with an updated hash, or an import
// map that points elsewhere all differ from the derivation. In addition the
// import map is checked against the closure: every value is runtime/<a file
// listed in the manifest>, without '..', and every @hawiyah specifier points
// into that package's directory at the pinned version.

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { checkMetafile } from './resolved.mjs';

const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');

function filesOf(dir, base = dir, out = new Map()) {
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) filesOf(path, base, out);
    else out.set(relative(base, path).split(sep).join('/'), sha256(readFileSync(path)));
  }
  return out;
}

/** The default derivation: steps 60 and 62 into runtimeDir. Returns the esbuild metafiles. */
export async function deriveRuntime({ guideDir, runtimeDir }) {
  const { buildRuntime } = await import('../runtime/build-runtime.mjs');
  const { buildCompilers } = await import('../editor/build-compilers.mjs');
  const runtime = await buildRuntime({ guideDir, runtimeDir });
  const compilers = await buildCompilers({ guideDir, runtimeDir });
  return [...runtime.metafiles, ...compilers.metafiles];
}

/** Import map values against the closure (manifest paths, package directories at the pin). */
export function checkImportMap(ctx, runtime) {
  let map;
  let manifest;
  try {
    map = JSON.parse(readFileSync(join(runtime, 'import-map.json'), 'utf8'));
    manifest = JSON.parse(readFileSync(join(runtime, 'manifest.json'), 'utf8'));
  } catch (error) {
    ctx.report('r8Invalid', { path: 'import-map.json', error: error.message });
    return 0;
  }
  const listed = new Set((Array.isArray(manifest.entries) ? manifest.entries : []).map((entry) => entry?.path));
  const imports = map && typeof map.imports === 'object' && map.imports ? map.imports : null;
  if (!imports || Object.keys(map).some((key) => key !== 'imports')) {
    ctx.report('r8ImportMap', { specifier: '(map)', value: JSON.stringify(Object.keys(map ?? {})), reason: 'only "imports" is allowed' });
    return 0;
  }
  for (const [specifier, value] of Object.entries(imports)) {
    const text = typeof value === 'string' ? value : '';
    const path = text.startsWith('runtime/') ? text.slice('runtime/'.length) : null;
    let reason = null;
    if (path === null) reason = 'not under runtime/';
    else if (path.split('/').some((segment) => segment === '..' || segment === '.' || segment === '')) reason = 'a "..", "." or empty segment';
    else if (!listed.has(path)) reason = 'not a file listed in runtime/manifest.json';
    else {
      const match = specifier.match(/^@hawiyah\/([^/]+)/);
      if (match && ctx.pin) {
        const allowed = [`npm/@hawiyah/${match[1]}@${ctx.pin}/`, `linked/@hawiyah/${match[1]}@${ctx.pin}/`];
        if (!allowed.some((prefix) => path.startsWith(prefix))) reason = `not a file of @hawiyah/${match[1]}@${ctx.pin}`;
      }
    }
    if (reason) ctx.report('r8ImportMap', { specifier, value: text || JSON.stringify(value), reason });
  }
  return Object.keys(imports).length;
}

/**
 * Derives the runtime into <guideDir>/.cache/registry-dist/runtime with
 * `derive` (default deriveRuntime) and compares it with <distDir>/runtime/.
 */
export async function ruleR8Derived(ctx, derive = deriveRuntime) {
  const runtime = join(ctx.distDir, 'runtime');
  if (!existsSync(runtime) || !existsSync(join(runtime, 'manifest.json'))) return; // reported by R8
  const specifiers = checkImportMap(ctx, runtime);
  const scratch = join(ctx.guideDir, '.cache', 'registry-dist');
  const derivedDir = join(scratch, 'runtime');
  rmSync(scratch, { recursive: true, force: true });
  mkdirSync(derivedDir, { recursive: true });
  let metafiles;
  try {
    metafiles = await derive({ guideDir: ctx.guideDir, runtimeDir: derivedDir });
  } catch (error) {
    ctx.report('r8Derive', { error: error instanceof Error ? error.message : String(error) });
    return;
  }
  for (const item of metafiles ?? []) {
    for (const [key, params] of checkMetafile(item.metafile, { label: item.label, baseDir: item.baseDir ?? ctx.guideDir, guideDir: ctx.guideDir, roots: item.roots })) {
      ctx.report(key, params);
    }
  }
  const served = filesOf(runtime);
  const derived = filesOf(derivedDir);
  for (const [path, hash] of served) {
    if (!derived.has(path)) ctx.report('r8NotDerived', { path });
    else if (derived.get(path) !== hash) ctx.report('r8DerivedDiffers', { path });
  }
  for (const path of derived.keys()) {
    if (!served.has(path)) ctx.report('r8DerivedMissing', { path });
  }
  const manifest = JSON.parse(readFileSync(join(derivedDir, 'manifest.json'), 'utf8'));
  const counts = { published: 0, linked: 0, bundled: 0 };
  for (const entry of manifest.entries ?? []) if (entry.source in counts) counts[entry.source] += 1;
  ctx.derived = { files: served.size, ...counts, specifiers, bundles: (metafiles ?? []).length };
  rmSync(scratch, { recursive: true, force: true });
}
