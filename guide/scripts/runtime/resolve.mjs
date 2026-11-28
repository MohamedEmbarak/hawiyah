// Import closure of the example runtime (editor.runtimeFiles.closure).
//
// Starts from an explicit entry table per framework, follows every static and
// dynamic import with es-module-lexer and the package `exports` field
// (conditions import, default), and maps vue, react* and rxjs* to the files the
// runtime serves for them. A bare specifier without a mapping fails the step.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { init, parse } from 'es-module-lexer';

/** Bare specifiers each framework's examples may import. */
export const ENTRY_TABLE = Object.freeze({
  vanilla: ['@hawiyah/vanilla'],
  react: ['@hawiyah/react', 'react', 'react/jsx-runtime', 'react-dom/client'],
  vue: ['@hawiyah/vue', 'vue'],
  angular: ['@angular/core', '@angular/common', '@angular/platform-browser', '@hawiyah/angular'],
});

export const FRAMEWORKS = Object.freeze(Object.keys(ENTRY_TABLE));

/** Packages whose files pass through the Angular linker. */
export const LINKED_PACKAGES = Object.freeze(['@angular/core', '@angular/common', '@angular/platform-browser', '@angular/forms', '@hawiyah/angular']);

/** Packages served unmodified (their import closure, plus the files named in `extra`). */
export const PUBLISHED_PACKAGES = Object.freeze(['@hawiyah/core', '@hawiyah/vanilla', '@hawiyah/react', '@hawiyah/vue', '@internationalized/date']);

/**
 * Specifiers served by derived files: Vue's ESM browser build (published, one
 * self-contained file), and the esbuild facades of React and rxjs (bundled).
 */
export const MAPPED = Object.freeze({
  vue: { source: 'published', package: 'vue', file: 'dist/vue.runtime.esm-browser.prod.js' },
  react: { source: 'bundled', package: 'react', file: 'react.js' },
  'react/jsx-runtime': { source: 'bundled', package: 'react', file: 'jsx-runtime.js' },
  'react-dom/client': { source: 'bundled', package: 'react', file: 'react-dom-client.js' },
  rxjs: { source: 'bundled', package: 'rxjs', file: 'rxjs.js' },
  'rxjs/operators': { source: 'bundled', package: 'rxjs', file: 'operators.js' },
});

/** Splits a bare specifier into package name and subpath ('.' or './x'). */
export function splitSpecifier(specifier) {
  const parts = specifier.split('/');
  const name = specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
  const rest = specifier.slice(name.length);
  return { name, subpath: rest ? `.${rest}` : '.' };
}

function pickCondition(target, conditions) {
  if (typeof target === 'string') return target;
  if (Array.isArray(target)) {
    for (const item of target) {
      const found = pickCondition(item, conditions);
      if (found) return found;
    }
    return null;
  }
  if (target && typeof target === 'object') {
    for (const [key, value] of Object.entries(target)) {
      if (conditions.includes(key)) {
        const found = pickCondition(value, conditions);
        if (found) return found;
      }
    }
  }
  return null;
}

/**
 * Resolves `subpath` through a package.json `exports` value with the given
 * conditions. Returns a package-relative path without './', or null.
 */
export function resolveExports(exportsField, subpath, conditions = ['import', 'default']) {
  if (exportsField === undefined || exportsField === null) return null;
  let map = exportsField;
  if (typeof map === 'string' || Array.isArray(map) || !Object.keys(map).some((key) => key.startsWith('.'))) map = { '.': map };
  let target = null;
  if (subpath in map) target = pickCondition(map[subpath], conditions);
  else {
    const patterns = Object.keys(map).filter((key) => key.includes('*')).sort((a, b) => b.length - a.length);
    for (const key of patterns) {
      const [prefix, suffix] = key.split('*');
      if (subpath.startsWith(prefix) && subpath.endsWith(suffix) && subpath.length >= prefix.length + suffix.length) {
        const star = subpath.slice(prefix.length, subpath.length - suffix.length);
        const picked = pickCondition(map[key], conditions);
        if (picked) target = picked.split('*').join(star);
        break;
      }
    }
  }
  return target ? target.replace(/^\.\//, '') : null;
}

function readPackage(nodeModules, name) {
  const file = join(nodeModules, name, 'package.json');
  if (!existsSync(file)) throw new Error(`runtime: package ${name} is not installed (${file})`);
  return JSON.parse(readFileSync(file, 'utf8'));
}

/** Kind of a package's files in the runtime. */
export function sourceOf(name) {
  if (LINKED_PACKAGES.includes(name)) return 'linked';
  if (PUBLISHED_PACKAGES.includes(name)) return 'published';
  return null;
}

/** Served path (relative to runtime/) of a file of a package. */
export function servedPath(source, name, version, file) {
  const root = source === 'linked' ? 'linked' : source === 'bundled' ? 'bundled' : 'npm';
  return `${root}/${name}@${version}/${file}`;
}

/**
 * Computes the closure. Returns
 *   { frameworks: { <fw>: string[] (bare specifiers reachable) },
 *     specifiers: Map<specifier, { source, package, version, file, path }>,
 *     files: Map<path, { source, package, version, file }> }
 * where `files` lists every published or linked module file of the closure
 * (bundled files are produced by bundle-react.mjs and bundle-rxjs.mjs).
 */
export async function resolveClosure({ nodeModules }) {
  await init;
  const versions = new Map();
  const version = (name) => {
    if (!versions.has(name)) versions.set(name, readPackage(nodeModules, name).version);
    return versions.get(name);
  };
  const specifiers = new Map();
  const files = new Map();
  const frameworks = {};

  const resolveBare = (specifier, from) => {
    if (specifiers.has(specifier)) return specifiers.get(specifier);
    let entry;
    if (specifier in MAPPED) {
      const mapped = MAPPED[specifier];
      entry = { ...mapped, version: version(mapped.package) };
    } else {
      const { name, subpath } = splitSpecifier(specifier);
      const source = sourceOf(name);
      if (!source) throw new Error(`runtime: bare specifier '${specifier}' (imported by ${from}) has no mapping`);
      const pkg = readPackage(nodeModules, name);
      const file = resolveExports(pkg.exports, subpath);
      if (!file) throw new Error(`runtime: '${specifier}' (imported by ${from}) is not exported by ${name} for the conditions import, default`);
      entry = { source, package: name, version: pkg.version, file };
    }
    entry.path = servedPath(entry.source, entry.package, entry.version, entry.file);
    specifiers.set(specifier, entry);
    return entry;
  };

  const visitFile = (name, ver, source, file, reachable) => {
    const path = servedPath(source, name, ver, file);
    if (files.has(path)) return;
    files.set(path, { source, package: name, version: ver, file });
    const absolute = join(nodeModules, name, file);
    if (!existsSync(absolute)) throw new Error(`runtime: ${name}/${file} does not exist`);
    const [imports] = parse(readFileSync(absolute, 'utf8'), absolute);
    for (const item of imports) {
      const target = item.n;
      if (target === undefined || target === null) {
        if (item.d > -1) throw new Error(`runtime: ${name}/${file} has a dynamic import with a computed specifier`);
        continue;
      }
      if (target === 'import.meta' || item.d === -2) continue;
      if (target.startsWith('./') || target.startsWith('../')) {
        const next = posix.normalize(posix.join(posix.dirname(file), target));
        if (next.startsWith('..')) throw new Error(`runtime: ${name}/${file} imports ${target} outside its package`);
        visitFile(name, ver, source, next, reachable);
      } else if (/^[a-z]+:/.test(target) || target.startsWith('/')) {
        throw new Error(`runtime: ${name}/${file} imports the URL ${target}`);
      } else {
        visitSpecifier(target, `${name}/${file}`, reachable);
      }
    }
  };

  const visitSpecifier = (specifier, from, reachable) => {
    const entry = resolveBare(specifier, from);
    const first = !reachable.has(specifier);
    reachable.add(specifier);
    if (!first) return;
    if (entry.source === 'bundled') {
      // The facade's own imports are fixed (react-runtime.js, rxjs chunks); the
      // packages it re-exports have their own dependencies, which bundling covers.
      return;
    }
    if (entry.package === 'vue') {
      // The ESM browser build is self-contained: it has no imports.
      const absolute = join(nodeModules, 'vue', entry.file);
      const [imports] = parse(readFileSync(absolute, 'utf8'), absolute);
      if (imports.some((item) => item.n && item.d !== -2)) throw new Error('runtime: vue ESM browser build imports other modules');
      files.set(entry.path, { source: entry.source, package: 'vue', version: entry.version, file: entry.file });
      return;
    }
    visitFile(entry.package, entry.version, entry.source, entry.file, reachable);
  };

  for (const [framework, entries] of Object.entries(ENTRY_TABLE)) {
    const reachable = new Set();
    for (const specifier of entries) visitSpecifier(specifier, `entry table (${framework})`, reachable);
    frameworks[framework] = [...reachable].sort();
  }
  return { frameworks, specifiers, files, versions };
}

/** Absolute path of an installed package file. */
export function installedFile(nodeModules, name, file) {
  return join(nodeModules, name, file);
}

export function packageDir(nodeModules, name) {
  return dirname(join(nodeModules, name, 'package.json'));
}
