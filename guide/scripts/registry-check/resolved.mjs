// What a build resolved (HWREG-R6, resolution inside the guide). The esbuild
// metafiles of the Angular build (`ng build --stats-json`: browser-stats.json,
// server-stats.json) and of the guide's own esbuild runs (steps 60 and 62)
// record every input file and, for every import, the specifier as written
// (`original`) and the file it resolved to (`path`). An input that contains
// `@hawiyah/` must lie in guide/node_modules/@hawiyah/<one of the seven>/ (or in
// a runtime directory written from it, for the fallback bundles); an import of
// `@hawiyah/<name>` must resolve there; no input may come from a node_modules
// directory other than guide/node_modules or from outside guide/.

import { isAbsolute, relative, resolve, sep } from 'node:path';
import { NAMES } from './messages.mjs';

const toPosix = (value) => value.split(sep).join('/');

/** Strips esbuild and Angular namespace prefixes such as `angular:css-resource:`. */
export function inputPath(value) {
  let path = String(value);
  while (/^[a-z][a-z0-9-]*:(?!\/\/)/i.test(path) && !/^[a-z]:[\\/]/i.test(path)) path = path.replace(/^[a-z][a-z0-9-]*:/i, '');
  return path.replace(/[?#].*$/, '');
}

/** True for esbuild's virtual inputs (stdin, namespaces without a file). */
function isVirtual(raw, path) {
  return raw.startsWith('<') || path === '' || !/[/\\]/.test(path);
}

/**
 * Checks one metafile. Returns findings as [key, params] pairs for ctx.report.
 *   label     a name for messages (browser-stats.json, runtime bundles/react.js, ...)
 *   baseDir   the directory the metafile paths are relative to (esbuild absWorkingDir)
 *   guideDir  the guide directory
 *   roots     further directories that may hold @hawiyah files: [{ dir, name? }]
 *             (runtime/npm/@hawiyah/<name>@<pin>/ of the fallback bundles)
 */
export function checkMetafile(metafile, { label, baseDir, guideDir, roots = [] }) {
  const findings = [];
  const modules = resolve(guideDir, 'node_modules');
  const sevenDir = (name) => resolve(modules, '@hawiyah', name);
  const under = (file, dir) => {
    const rel = relative(dir, file);
    return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel);
  };
  const allowedFor = (file, name) => (name ? [sevenDir(name)] : NAMES.map(sevenDir)).some((dir) => under(file, dir))
    || roots.some((root) => (!name || !root.name || root.name === name) && under(file, root.dir));
  const show = (file) => toPosix(relative(guideDir, file));

  const inputs = metafile && typeof metafile.inputs === 'object' ? metafile.inputs : null;
  if (!inputs) {
    findings.push(['r6Metafile', { file: label, error: 'no inputs' }]);
    return findings;
  }
  for (const [raw, input] of Object.entries(inputs)) {
    const path = inputPath(raw);
    if (isVirtual(raw, path)) continue;
    const file = resolve(baseDir, path);
    const posix = toPosix(file);
    const insideGuide = under(file, guideDir) || roots.some((root) => under(file, root.dir));
    if (!insideGuide) findings.push(['r6ResolvedOutside', { file: label, input: show(file) }]);
    else if (posix.includes('/node_modules/') && !under(file, modules)) {
      findings.push(['r6ResolvedModules', { file: label, input: show(file) }]);
    }
    if (posix.includes('/@hawiyah/') && !allowedFor(file)) {
      findings.push(['r6ResolvedHawiyah', { file: label, input: show(file) }]);
    }
    for (const entry of Array.isArray(input?.imports) ? input.imports : []) {
      const match = typeof entry.original === 'string' ? entry.original.match(/^@hawiyah\/([^/]+)(?:\/|$)/) : null;
      if (!match || entry.external) continue;
      const target = resolve(baseDir, inputPath(entry.path));
      if (!NAMES.includes(match[1]) || !allowedFor(target, match[1])) {
        findings.push(['r6ResolvedImport', { file: label, specifier: entry.original, input: show(file), target: show(target) }]);
      }
    }
  }
  return findings;
}
