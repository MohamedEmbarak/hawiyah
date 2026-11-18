// runtime/manifest.json (editor.runtimeFiles): one entry per served file
//   { path, sha256, bytes, source: 'published' | 'linked' | 'bundled', package,
//     version, packageIntegrity, file?, tool?, inputs? }
// with the field names HWREG-R8 reads (scripts/registry-check/rules.mjs).
// `file` is the path inside the package for published and linked files; `tool`
// names the linker or esbuild for derived files; `inputs` lists the further
// packages (bundled facades) or runtime files (fallback bundles) a derived file
// was built from.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const sha256 = (data) => createHash('sha256').update(data).digest('hex');

/** Lock entry (version, integrity) of an installed top-level package. */
export function lockInfo(lock, name) {
  const entry = lock?.packages?.[`node_modules/${name}`];
  if (!entry || typeof entry.version !== 'string' || typeof entry.integrity !== 'string') {
    throw new Error(`runtime: package-lock.json has no integrity for node_modules/${name}`);
  }
  return { version: entry.version, integrity: entry.integrity };
}

export function readLock(guideDir) {
  return JSON.parse(readFileSync(join(guideDir, 'package-lock.json'), 'utf8'));
}

/** Builds one manifest entry for `data` served at runtime/<path>. */
export function manifestEntry({ path, data, source, pkg, version, integrity, file, tool, inputs }) {
  const entry = {
    path,
    sha256: sha256(data),
    bytes: Buffer.byteLength(data),
    source,
    package: pkg,
    version,
    packageIntegrity: integrity,
  };
  if (file !== undefined) entry.file = file;
  if (tool !== undefined) entry.tool = tool;
  if (inputs !== undefined) entry.inputs = inputs;
  return entry;
}

export function manifestOf(entries) {
  const sorted = [...entries].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  const paths = new Set();
  for (const entry of sorted) {
    if (paths.has(entry.path)) throw new Error(`runtime: ${entry.path} is listed twice`);
    paths.add(entry.path);
  }
  return { entries: sorted };
}

export function manifestText(manifest) {
  return `${JSON.stringify(manifest, null, 2)}\n`;
}
