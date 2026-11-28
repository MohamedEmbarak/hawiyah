// Shared helpers for compiled example modules: relative imports are rewritten to
// hawiyah-project/<name>.js (the import map of the preview frame adds those
// entries), and the bare specifiers a payload uses are listed.
import { init, parse } from 'es-module-lexer';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, posix } from 'node:path';

export const PROJECT_PREFIX = 'hawiyah-project/';

await init;

function specifiers(code) {
  const [imports] = parse(code);
  return imports.filter((entry) => entry.n !== undefined && entry.s >= 0).map((entry) => ({ name: entry.n, start: entry.s, end: entry.e }));
}

/** Rewrites './Example', './Example.vue', './example.component' to 'hawiyah-project/<name>.js'. */
export function rewriteRelativeImports(code) {
  let out = code;
  for (const entry of specifiers(code).sort((a, b) => b.start - a.start)) {
    if (!entry.name.startsWith('./')) continue;
    const base = posix.basename(entry.name).replace(/\.(?:[cm]?[jt]sx?|vue)$/, '');
    out = out.slice(0, entry.start) + `${PROJECT_PREFIX}${base}.js` + out.slice(entry.end);
  }
  return out;
}

/** Bare specifiers of a set of modules (sorted, without hawiyah-project/ entries). */
export function bareImports(modules) {
  const names = new Set();
  for (const code of Object.values(modules)) {
    for (const entry of specifiers(code)) {
      if (!entry.name.startsWith('.') && !entry.name.startsWith('/') && !entry.name.startsWith(PROJECT_PREFIX)) names.add(entry.name);
    }
  }
  return [...names].sort();
}

export function writeFile(path, text) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
}

export function resetDir(path) {
  rmSync(path, { recursive: true, force: true });
  mkdirSync(path, { recursive: true });
}
