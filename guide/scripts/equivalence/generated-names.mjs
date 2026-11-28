// The forms of a generated id or name that the four adapters can write, read from
// the installed packages (equivalence structure, `name` values). A `name` that
// matches one of these forms is numbered in the structure comparison; any other
// `name` is compared as written.
//
//   @hawiyah/vanilla  ensureId(scope, element, '<prefix>') -> hw-<prefix>-<n>
//                     (also tab-<index>-<n> and the prefixes passed through a wrapper)
//   @hawiyah/angular  injectId('<prefix>') -> <prefix>-[<app id>-]<n>
//   @hawiyah/react    `hw-...${useId()}...` -> React 19 useId: _r_<n>_ on the client,
//                     _R_<n>[H<n>]_ when hydrated
//   @hawiyah/vue      `hw-...${useId()}` -> Vue useId: v-<n>[-<n>...]
// A name an adapter derives from such an id (`${id}-rating`, `${id}-calendar-system`)
// keeps the id as its first part, so a suffix of words is allowed after the id.

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const SUFFIX = '(?:-[a-z]+)*';

function sources(dir, extensions, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) sources(path, extensions, out);
    else if (extensions.some((extension) => entry.name.endsWith(extension)) && !entry.name.endsWith('.d.ts')) out.push(readFileSync(path, 'utf8'));
  }
  return out.join('\n');
}

/** The id forms, each as a regular expression source, read from guide/node_modules. */
export function generatedIdForms(guideDir) {
  const modules = join(guideDir, 'node_modules');
  const vanilla = sources(join(modules, '@hawiyah', 'vanilla', 'dist'), ['.js']);
  const angular = sources(join(modules, '@hawiyah', 'angular', 'dist'), ['.mjs']);
  const react = sources(join(modules, '@hawiyah', 'react', 'dist'), ['.js']);
  const vue = sources(join(modules, '@hawiyah', 'vue', 'dist'), ['.js']);
  const reactDom = readFileSync(join(modules, 'react-dom', 'cjs', 'react-dom-client.production.js'), 'utf8');
  const vueCore = readFileSync(join(modules, '@vue', 'runtime-core', 'dist', 'runtime-core.cjs.prod.js'), 'utf8');

  const forms = [];
  // @hawiyah/vanilla: literal prefixes of ensureId, and tab-<index> of the tabs.
  const vanillaPrefixes = [...vanilla.matchAll(/ensureId\(\s*\w+\s*,\s*\w+\s*,\s*'([a-z-]+)'\s*\)/g)].map((match) => match[1]);
  if (/ensureId\(\s*\w+\s*,\s*\w+\s*,\s*`tab-\$\{index\}`\s*\)/.test(vanilla)) vanillaPrefixes.push('tab-\\d+');
  if (vanillaPrefixes.length === 0) throw new Error('generated names: no ensureId prefix found in @hawiyah/vanilla');
  forms.push(`hw-(?:${[...new Set(vanillaPrefixes)].map((prefix) => (prefix === 'tab-\\d+' ? prefix : escape(prefix))).join('|')})-\\d+`);
  // @hawiyah/angular: injectId prefixes; HwIdSource adds the app id unless it is 'ng'.
  const angularPrefixes = [...new Set([...angular.matchAll(/injectId\("([a-z-]+)"\)/g)].map((match) => match[1]))];
  if (angularPrefixes.length === 0 || !/`\$\{prefix\}-\$\{this\.scope === "ng" \? "" : `\$\{this\.scope\}-`\}\$\{\+\+this\.count\}`/.test(angular)) {
    throw new Error('generated names: the id source of @hawiyah/angular has another form');
  }
  forms.push(`(?:${angularPrefixes.map(escape).join('|')})-(?:[a-z0-9]+-)?\\d+`);
  // React 19 useId, as react-dom writes it.
  if (!reactDom.includes('"r_" +') || !reactDom.includes('"R_" +')) throw new Error('generated names: react-dom writes another useId form');
  const reactId = '_[rR]_[0-9a-z]+(?:H[0-9a-z]+)?_';
  const reactPrefixes = [...new Set([...react.matchAll(/`(hw-(?:[a-z]+-)*)\$\{(?:useId\(\)|generatedId|generated)\}/g)].map((match) => match[1]))];
  forms.push(reactPrefixes.length > 0 ? `(?:${reactPrefixes.map(escape).join('|')})?${reactId}` : reactId);
  // Vue useId: idPrefix ('v') + '-' + numbers joined by '-'.
  if (!/\(i\.appContext\.config\.idPrefix \|\| "v"\) \+ "-" \+ i\.ids\[0\] \+ i\.ids\[1\]\+\+/.test(vueCore) || !/useId\(\)/.test(vue)) {
    throw new Error('generated names: Vue writes another useId form');
  }
  const vueId = 'v-\\d+(?:-\\d+)*';
  const vuePrefixes = [...new Set([...vue.matchAll(/`(hw-(?:[a-z]+-)*)\$\{useId\(\)\}/g)].map((match) => match[1]))];
  forms.push(vuePrefixes.length > 0 ? `(?:${vuePrefixes.map(escape).join('|')})?${vueId}` : vueId);
  return forms;
}

/** One pattern for a whole `name` value: a generated id, optionally followed by words. */
export function generatedNamePattern(guideDir) {
  return `^(?:${generatedIdForms(guideDir).join('|')})${SUFFIX}$`;
}
