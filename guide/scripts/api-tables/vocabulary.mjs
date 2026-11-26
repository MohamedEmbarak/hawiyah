// The vocabulary pass of step 30 (HWC-VOCAB, 5a.5 of milestone 5): every
// code-formatted name in the prose of a page (paragraphs, list items, headings,
// alerts and the cells of tables other than the API tables) and every class,
// data-hw hook and data attribute of its html live blocks must exist in the
// installed packages, or be an entry of vocabulary-exceptions.json.
//
// A code value is read as terms (terms()): a package or export path
// (@hawiyah/..., or a scoped package that guide/package.json installs), a repository file (components.json), a CSS declaration
// (display: contents), and otherwise the names, attributes, bindings, calls and
// literals it holds. Each term is judged by its form:
//   hw-*                a class of the installed stylesheet, or the element
//                       selector of a component of @hawiyah/angular;
//   --hw-*              a custom property that the installed stylesheet defines or
//                       that the @hawiyah/styles README documents by its whole name;
//   hw:*                an event name that a published module dispatches;
//   data-*, aria-*      an attribute the stylesheet selects or a published module
//                       reads or writes (data-hw-value as dataset.hwValue too),
//                       or a name of vocabulary-allow.json; on a component's page
//                       also a data-hw-* attribute that an installed README
//                       documents for that component (documentedAttributes),
//                       written out or given by the rule of the text-inputs table
//                       of the vanilla README (textInputBlocks);
//   Hw*, create*, A*    an export of an installed @hawiyah package;
//   other names         a member of this component in some adapter (the names its
//                       published declarations give: props, options, inputs,
//                       outputs, events, slots, the fields of their types, the
//                       parameters and the returned members of its controllers,
//                       the members its Vue component exposes, the selectors of
//                       its Angular classes), a member of a component page that the
//                       same sentence links to, an export, an attribute selector of
//                       any Angular class (hwButton; Angular scope), a value of a member
//                       type or of an enumerated attribute of the component, or a
//                       name of vocabulary-allow.json (HTML, ARIA, DOM, CSS, Vue
//                       and Angular template syntax, each with its specification);
//   a literal           a value of a member type or of an enumerated attribute of
//                       the component ('primary', aria-busy="true"), or a value that
//                       a published module compares a data-* attribute with
//                       (data-hw-multiple="true"); the value of data-hw is a hook
//                       that enhance() registers, the value of role an ARIA role.
// Framework scope (leadAmendments A9): a paragraph under a heading (h3 or h4, in any
// section) whose text is a framework name (JavaScript, React, Vue, Angular), or whose text names a framework, is scoped to
// those frameworks: a member or export must belong to one of them. A name that
// belongs only to another framework is a case the check cannot decide, so it is a
// finding unless vocabulary-exceptions.json lists it. The expression of a
// binding ([loading]="saving") is application code and is not judged.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { classDeclaration, angularClassMembers } from './declarations-angular.mjs';
import { vueOptions } from './defaults-vue.mjs';
import { FRAMEWORKS, componentClasses } from './members.mjs';
import { isInPackage, resolveExport } from './program.mjs';
import { attributesFor } from './stylesheet-selectors.mjs';
import { contractFor } from './stylesheet-contract.mjs';

export const VOCAB_CODE = 'HWC-VOCAB';
const here = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_ALLOW = join(here, 'vocabulary-allow.json');
export const DEFAULT_VOCABULARY_EXCEPTIONS = join(here, 'vocabulary-exceptions.json');

const FRAMEWORK_WORDS = { JavaScript: 'vanilla', vanilla: 'vanilla', React: 'react', Vue: 'vue', Angular: 'angular' };
const H3_SCOPE = { javascript: 'vanilla', react: 'react', vue: 'vue', angular: 'angular' };
const API_H3 = new Set(Object.keys(H3_SCOPE));
const VUE_PACKAGES = ['vue', '@vue/runtime-core', '@vue/runtime-dom', '@vue/reactivity', '@vue/shared'];
const FILE_RE = /^[\w.-]+\.(json|md|mjs|js|ts|css|html|ya?ml)$/;

// ---------------------------------------------------------------------------
// Reading a code value.

/**
 * The terms of one code value:
 * { kind: 'package' | 'file' | 'css' | 'name' | 'attribute' | 'binding' | 'event' | 'class' | 'literal', ... }.
 */
export function terms(value) {
  const text = value.trim();
  if (/^@[a-z0-9-]+\/[\w./-]+$/.test(text)) return [{ kind: 'package', name: text }];
  if (FILE_RE.test(text)) return [{ kind: 'file', name: text }];
  // A custom property, alone or declared (--hw-gap: 1rem); the value of a declaration is application code.
  const custom = /^(--[\w-]+)(?::\s*[^;]+;?)?$/.exec(text);
  if (custom) return [{ kind: 'custom-property', name: custom[1] }];
  const css = /^([a-z][a-z-]*): ([^;:]+);?$/.exec(text);
  if (css) return [{ kind: 'css', name: css[1], value: css[2].trim() }];
  const out = [];
  // Package names and custom properties inside a longer value (npm install @hawiyah/react react, var(--hw-gap)).
  const packages = [];
  const rest = text.replace(/(?<![\w/-])(@[a-z0-9-]+\/[a-z0-9-]+(?:\/[\w.-]+)*)/g, (whole) => {
    packages.push({ kind: 'package', name: whole });
    return ' ';
  }).replace(/(?<![\w-])--[A-Za-z][\w-]*/g, (whole) => {
    packages.push({ kind: 'custom-property', name: whole });
    return ' ';
  });
  out.push(...packages);
  const pattern = new RegExp([
    String.raw`\[attr\.([\w-]+)\](?:="[^"]*")?`, // 1 Angular attribute binding
    String.raw`\[\(([\w-]+)\)\](?:="[^"]*")?`, // 2 Angular two-way binding
    String.raw`\[([\w-]+)(?:([~|^$*]?=)(?:"([^"]*)"|'([^']*)'|([\w-]+)))?\](="[^"]*")?`, // 3-8 CSS attribute selector or Angular property binding
    String.raw`\(([\w.-]+)\)="[^"]*"`, // 9 Angular event binding
    String.raw`(?:^|(?<=[\s(<{,]))@([\w:-]+)(?:="[^"]*")?`, // 10 Vue event
    String.raw`(?:^|(?<=[\s(<{,])):([\w-]+)="[^"]*"`, // 11 Vue prop binding
    String.raw`([A-Za-z_][\w-]*)=(?:"([^"]*)"|'([^']*)')`, // 12-14 attribute with a literal value
    String.raw`'([^']*)'|"([^"]*)"`, // 15-16 literal
    String.raw`(\.)?([A-Za-z_$][\w$-]*(?::(?:<[\w-]+>|[\w-]+))*)(\()?`, // 17-19 name, after a dot, before a call
  ].join('|'), 'g');
  let match;
  let previous = null;
  while ((match = pattern.exec(rest)) !== null) {
    const m = match;
    if (m[1] !== undefined) out.push({ kind: 'attribute', name: m[1] });
    else if (m[2] !== undefined) out.push({ kind: 'binding', name: m[2] });
    else if (m[3] !== undefined) {
      if (m[4]) out.push({ kind: 'attribute', name: m[3], value: m[5] ?? m[6] ?? m[7] });
      else if (m[8]) out.push({ kind: 'binding', name: m[3] });
      else out.push({ kind: 'name', name: m[3], bracket: true });
    } else if (m[9] !== undefined) out.push({ kind: 'event', name: m[9] });
    else if (m[10] !== undefined) out.push({ kind: 'event', name: m[10] });
    else if (m[11] !== undefined) out.push({ kind: 'binding', name: m[11] });
    else if (m[12] !== undefined) out.push({ kind: 'attribute', name: m[12], value: m[13] ?? m[14] });
    else if (m[15] !== undefined || m[16] !== undefined) out.push({ kind: 'literal', value: m[15] ?? m[16] });
    else if (m[18] !== undefined) {
      const name = m[18];
      if (m[17] && previous && /^[a-z][\w-]*$/.test(previous.name ?? '') && previous.kind === 'name' && /^hw-/.test(name)) {
        out.push({ kind: 'class', name }); // div.hw-tabs
      } else {
        out.push({ kind: 'name', name, call: Boolean(m[19]), member: Boolean(m[17]) });
      }
    }
    previous = out[out.length - 1] ?? null;
  }
  return out;
}

// ---------------------------------------------------------------------------
// What the installed packages offer.

function jsFiles(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...jsFiles(path));
    else if (/\.m?js$/.test(entry.name)) out.push(path);
  }
  return out;
}

/** The hooks enhance() registers: the keys of `const factories = { ... }` in @hawiyah/vanilla. */
export function vanillaHooks(nodeModules) {
  const text = readFileSync(join(nodeModules, '@hawiyah', 'vanilla', 'dist', 'index.js'), 'utf8');
  const body = /const factories = \{([\s\S]*?)\n\};/.exec(text)?.[1] ?? '';
  const hooks = new Set();
  for (const match of body.matchAll(/(?:^|[\s,{])(?:'([a-z-]+)'|([a-z]+)):/g)) hooks.add(match[1] ?? match[2]);
  return hooks;
}

/** Package names and export paths of the installed @hawiyah packages. */
function packagePaths(nodeModules) {
  const out = new Set();
  const root = join(nodeModules, '@hawiyah');
  for (const name of readdirSync(root)) {
    const manifestFile = join(root, name, 'package.json');
    if (!existsSync(manifestFile)) continue;
    const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
    out.add(manifest.name);
    for (const key of Object.keys(manifest.exports ?? {})) out.add(key === '.' ? manifest.name : `${manifest.name}/${key.replace(/^\.\//, '')}`);
  }
  return out;
}

/** The packages guide/package.json installs (examples import react, vue and @angular/* besides the adapters). */
function guideDependencies(nodeModules) {
  const manifest = JSON.parse(readFileSync(join(nodeModules, '..', 'package.json'), 'utf8'));
  return new Set([...Object.keys(manifest.dependencies ?? {}), ...Object.keys(manifest.devDependencies ?? {})]);
}

const ALLOW_FIELDS = ['kind', 'specification', 'names', 'values'];

/**
 * Problems of the data of vocabulary-allow.json (lead decision L15 of 5a): a list of
 * the guide, not a lead list, in which every entry (a group of names of one kind)
 * names its specification as an https address. Each group has a kind, a
 * specification, a non-empty list of names and optionally the values of some of
 * them; no other field, no name twice in one kind, no values of a name it does not list.
 */
export function allowErrors(data) {
  if (!data || typeof data !== 'object' || !Array.isArray(data.groups)) return ['vocabulary-allow.json must hold { groups: [...] }'];
  const errors = [];
  const seen = new Set();
  data.groups.forEach((group, index) => {
    const at = `vocabulary-allow.json group ${index + 1}${typeof group?.kind === 'string' ? ` (${group.kind})` : ''}`;
    if (!group || typeof group !== 'object' || Array.isArray(group)) {
      errors.push(`${at} is not an object`);
      return;
    }
    const extra = Object.keys(group).filter((field) => !ALLOW_FIELDS.includes(field));
    if (extra.length > 0) errors.push(`${at} has unknown fields ${extra.join(', ')} (the file is a list of the guide: kind, specification, names, values)`);
    if (typeof group.kind !== 'string' || group.kind.trim() === '') errors.push(`${at} needs a kind`);
    if (typeof group.specification !== 'string' || !/^https:\/\/[^\s/]+\/\S*$/.test(group.specification)) errors.push(`${at} needs its specification as an https address`);
    if (!Array.isArray(group.names) || group.names.length === 0 || !group.names.every((name) => typeof name === 'string' && name.trim() !== '')) {
      errors.push(`${at} needs a non-empty list of names`);
      return;
    }
    for (const name of group.names) {
      const key = `${group.kind}\u0000${name}`;
      if (seen.has(key)) errors.push(`${at}: ${name} is listed twice as ${group.kind}`);
      seen.add(key);
    }
    if ('values' in group) {
      if (!group.values || typeof group.values !== 'object' || Array.isArray(group.values)) errors.push(`${at}: values must be an object`);
      else {
        for (const [name, list] of Object.entries(group.values)) {
          if (!group.names.includes(name)) errors.push(`${at}: values of ${name}, which the group does not list`);
          if (!Array.isArray(list) || list.length === 0 || !list.every((value) => typeof value === 'string' && value !== '')) errors.push(`${at}: the values of ${name} must be a non-empty list of strings`);
        }
      }
    }
  });
  return errors;
}

/** Reads vocabulary-allow.json: Map name -> { kind, specification, values? }; throws on a problem of allowErrors. */
export function readAllow(file = DEFAULT_ALLOW) {
  const data = JSON.parse(readFileSync(file, 'utf8'));
  const errors = allowErrors(data);
  if (errors.length > 0) throw new Error(errors.map((error) => `api-tables: ${error}`).join('\n'));
  const names = new Map();
  for (const group of data.groups) {
    for (const name of group.names) names.set(`${group.kind}\u0000${name}`, { kind: group.kind, name, specification: group.specification, values: group.values?.[name] ?? null });
  }
  const has = (kinds, name) => kinds.find((kind) => names.has(`${kind}\u0000${name}`)) ?? null;
  const values = (kinds, name) => {
    for (const kind of kinds) {
      const entry = names.get(`${kind}\u0000${name}`);
      if (entry?.values) return entry.values;
    }
    return null;
  };
  return { names, has, values };
}

/** Reads vocabulary-exceptions.json: [{ file, text, reason, approvedBy }]. */
export function readVocabularyExceptions(file = DEFAULT_VOCABULARY_EXCEPTIONS) {
  const data = JSON.parse(readFileSync(file, 'utf8'));
  const entries = data.entries ?? [];
  entries.forEach((entry, index) => {
    for (const key of ['file', 'text', 'reason', 'approvedBy']) {
      if (typeof entry?.[key] !== 'string' || !entry[key].trim()) throw new Error(`api-tables: vocabulary-exceptions.json entry ${index + 1} needs ${key}`);
    }
    if (/[*?]/.test(entry.text) && entry.text.trim() === '*') throw new Error(`api-tables: vocabulary-exceptions.json entry ${index + 1} is a wildcard`);
  });
  return entries;
}

/** Everything the vocabulary pass reads from the installed packages once per run. */
export function createVocabularyContext(readers, options = {}) {
  const { context, nodeModules } = readers;
  const css = readFileSync(join(nodeModules, '@hawiyah', 'styles', 'dist', 'styles.css'), 'utf8');
  const stylesheetAttributes = new Map();
  for (const match of css.matchAll(/\[([a-z][\w-]*)(?:[~|^$*]?=\s*["']?([^"'\]]*)["']?)?\s*\]/g)) {
    const name = match[1].toLowerCase();
    if (!stylesheetAttributes.has(name)) stylesheetAttributes.set(name, new Set());
    if (match[2] !== undefined) stylesheetAttributes.get(name).add(match[2]);
  }
  const moduleText = ['vanilla', 'react', 'vue', 'angular', 'core'].flatMap((name) => jsFiles(join(nodeModules, '@hawiyah', name, 'dist')))
    .map((file) => readFileSync(file, 'utf8')).join('\n');
  const exportsOf = {};
  for (const name of [...FRAMEWORKS, 'core']) exportsOf[name] = new Set(context.modules[name]?.exports.keys() ?? []);
  const angularElements = new Map();
  const angularSelectors = new Map();
  for (const name of exportsOf.angular) {
    const cls = classDeclaration(context, resolveExport(context, 'angular', name));
    const read = cls ? angularClassMembers(context, cls) : null;
    for (const part of selectorParts(read?.selector)) {
      if (part.element) angularElements.set(part.element, name);
      // The attribute selectors of every Angular class (hwButton, hwServiceAction), whichever component owns it.
      for (const attribute of part.attributes) if (!angularSelectors.has(attribute)) angularSelectors.set(attribute, name);
    }
  }
  return {
    readers,
    classes: readers.selectors.selected,
    customProperties: customProperties(css, readFileSync(join(nodeModules, '@hawiyah', 'styles', 'README.md'), 'utf8')),
    angularSelectors,
    stylesheetAttributes,
    moduleText,
    exportsOf,
    angularElements,
    hooks: vanillaHooks(nodeModules),
    readmeBlocks: installedReadmes(nodeModules).flatMap((text) => [...readmeBlocks(text), ...textInputBlocks(text)]),
    packages: packagePaths(nodeModules),
    dependencies: guideDependencies(nodeModules),
    allow: options.allow ?? readAllow(options.allowFile),
    repoDir: options.repoDir ?? resolve(nodeModules, '..', '..'),
    vocabularies: new Map(),
  };
}

/** The README.md of every installed @hawiyah package. */
function installedReadmes(nodeModules) {
  const scope = join(nodeModules, '@hawiyah');
  if (!existsSync(scope)) return [];
  return readdirSync(scope).map((name) => join(scope, name, 'README.md')).filter((file) => existsSync(file)).map((file) => readFileSync(file, 'utf8'));
}

/**
 * The blocks of a README in which a name is documented together with the component it
 * belongs to: each table row, each list item, and each paragraph or run of code lines
 * between blank lines and fences.
 */
export function readmeBlocks(text) {
  const blocks = [];
  let current = [];
  const flush = () => {
    if (current.length) blocks.push(current.join('\n'));
    current = [];
  };
  for (const line of String(text).split('\n')) {
    if (/^\s*$/.test(line) || /^\s*(?:```|~~~)/.test(line)) {
      flush();
      continue;
    }
    if (/^\s*\|/.test(line)) {
      flush();
      blocks.push(line);
      continue;
    }
    if (/^\s*(?:[-*+]|\d+\.)\s/.test(line)) flush();
    current.push(line);
  }
  flush();
  return blocks;
}

const kebab = (name) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

/**
 * The attributes on the controller root that the rule of the @hawiyah/vanilla README
 * ("Text is supplied by the application", item 3) gives each row of its table
 * `| Controller | Text inputs ... |`: `data-hw-<kebab-name>` for a string input
 * (previousLabel -> data-hw-previous-label) and, for a function input, the template
 * attribute named after the input without `get` (getSlideLabel(position, total) ->
 * data-hw-slide-label). Only the inputs written in code at the top level of the row's
 * second cell count, and only names of texts: `label` and names that end in Label,
 * Message or Description; a field inside parentheses (the labels of
 * createFileUploadList) and an option that is not text (isDateDisabled, maxSize) give
 * none. Each row gives one block, its controller cell followed by those attributes, for
 * documentedAttributes.
 */
export function textInputBlocks(text) {
  const blocks = [];
  let inTable = false;
  for (const line of String(text).split('\n')) {
    if (!/^\s*\|/.test(line)) {
      inTable = false;
      continue;
    }
    const cells = line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
    if (cells[0] === 'Controller' && /^Text inputs\b/.test(cells[1] ?? '')) {
      inTable = true;
      continue;
    }
    if (!inTable || cells.length < 2 || /^:?-+:?$/.test(cells[0])) continue;
    const attributes = [];
    let depth = 0;
    for (const part of cells[1].split(/(`[^`]*`)/)) {
      if (!part.startsWith('`')) {
        for (const char of part) depth = Math.max(0, depth + (char === '(' ? 1 : char === ')' ? -1 : 0));
        continue;
      }
      if (depth > 0) continue;
      const code = part.slice(1, -1);
      const fn = /^get([A-Z][A-Za-z0-9]*(?:Label|Message))\(/.exec(code);
      const string = /^(label|[a-z][A-Za-z0-9]*(?:Label|Message|Description))$/.exec(code);
      if (fn) attributes.push(`data-hw-${kebab(fn[1]).slice(1)}`);
      else if (string) attributes.push(`data-hw-${kebab(string[1])}`);
    }
    if (attributes.length) blocks.push(`${cells[0]} ${attributes.join(' ')}`);
  }
  return blocks;
}

const nameIn = (name, text) => new RegExp(`(?<![\\w-])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`).test(text);

/**
 * The data-hw-* attributes that an installed README documents for a component: those
 * written in a block (readmeBlocks) that also names the component by one of its
 * identifiers (its name in components.json, its controller factory create<Name>, its
 * classes, its hook data-hw="<id>" or an export of its API in some adapter). A vanilla controller may build such a name at run time from an
 * option (data-hw-range-label from getRangeLabel), so the module text does not hold it.
 */
export function documentedAttributes(blocks, identifiers) {
  const names = [...new Set(identifiers.filter(Boolean))];
  const found = new Set();
  for (const block of blocks) {
    if (!names.some((name) => nameIn(name, block))) continue;
    for (const match of block.matchAll(/(?<![\w-])data-hw-[a-z0-9]+(?:-[a-z0-9]+)*(?![\w-])/g)) found.add(match[0]);
  }
  return found;
}

/**
 * The --hw- custom properties a page may name: those the installed stylesheet defines
 * (--hw-space-4: ...) and those the @hawiyah/styles README documents by their whole
 * name (--hw-gap); a prefix such as --hw-* or --hw-color-* names none.
 */
export function customProperties(css, readme) {
  const names = new Set();
  for (const match of css.matchAll(/(--hw-[\w-]+)\s*:/g)) names.add(match[1]);
  for (const match of readme.matchAll(/--hw-[a-z0-9]+(?:-[a-z0-9]+)*(?![\w*-])/g)) names.add(match[0]);
  return names;
}

/** Element and attribute names of an Angular selector ('button[hwButton],a[hwButton]', 'hw-tabs'). */
function selectorParts(selector) {
  const parts = [];
  for (const item of String(selector ?? '').split(',')) {
    const match = /^\s*([a-z][\w-]*)?((?:\[[^\]]+\])*)\s*$/.exec(item);
    if (!match) continue;
    const attributes = [...match[2].matchAll(/\[([\w-]+)/g)].map((m) => m[1]);
    parts.push({ element: match[1] ?? null, attributes });
  }
  return parts;
}

// ---------------------------------------------------------------------------
// The vocabulary of one component, per framework, from its published declarations.

const literalValues = (type) => [...String(type ?? '').matchAll(/'([^']*)'/g)].map((match) => match[1]);

function ownDeclaration(declarations, packages) {
  return (declarations ?? []).some((item) => !packages.some((name) => isInPackage(item.getSourceFile().fileName, name)));
}

/** Property names of a type, of the element type of an array, of each member of a union, declared in @hawiyah (one level). */
function fieldNames(context, type, names, depth = 0) {
  const { checker } = context;
  if (!type || depth > 1) return;
  const target = checker.getNonNullableType(type);
  if (target.isUnion?.()) {
    for (const member of target.types) fieldNames(context, member, names, depth);
    return;
  }
  const element = checker.getIndexTypeOfType?.(target, context.ts.IndexKind.Number);
  if (element && checker.isArrayLikeType?.(target)) {
    fieldNames(context, element, names, depth);
    return;
  }
  if (!(target.flags & context.ts.TypeFlags.Object)) return;
  const declarations = target.getSymbol()?.declarations ?? target.aliasSymbol?.declarations ?? [];
  if (!declarations.some((item) => isInPackage(item.getSourceFile().fileName, '@hawiyah'))) return;
  for (const property of checker.getPropertiesOfType(target)) {
    names.add(property.name);
    for (const signature of checker.getSignaturesOfType(checker.getTypeOfSymbol(property), context.ts.SignatureKind.Call)) {
      for (const parameter of signature.getParameters()) names.add(parameter.name);
    }
  }
}

function typeOfExport(context, framework, name) {
  const symbol = resolveExport(context, framework, name);
  if (!symbol) return null;
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
  return declaration ? { symbol, type: context.checker.getTypeOfSymbolAtLocation(symbol, declaration) } : null;
}

function declarationNames(context, framework, exportName, names) {
  const { ts, checker } = context;
  if (framework === 'angular') {
    const symbol = resolveExport(context, 'angular', exportName);
    const cls = classDeclaration(context, symbol);
    if (!cls) return;
    const read = angularClassMembers(context, cls);
    for (const part of selectorParts(read.selector)) {
      if (part.element) names.add(part.element);
      part.attributes.forEach((name) => names.add(name));
    }
    const instance = checker.getDeclaredTypeOfSymbol(symbol);
    for (const input of read.inputs.values()) {
      names.add(input.name);
      const property = checker.getPropertyOfType(instance, input.property);
      if (property) fieldNames(context, checker.getTypeOfSymbol(property), names);
    }
    for (const output of read.outputs.values()) names.add(output.name);
    const hidden = (declaration) => (ts.getCombinedModifierFlags(declaration) & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected)) !== 0;
    for (const property of checker.getPropertiesOfType(instance)) {
      const declarations = property.declarations ?? [];
      if (ownDeclaration(declarations, ['@angular']) && !declarations.some(hidden) && !property.name.startsWith('ɵ')) names.add(property.name);
    }
    return;
  }
  const found = typeOfExport(context, framework, exportName);
  if (!found) return;
  if (framework === 'vue') {
    const construct = checker.getSignaturesOfType(found.type, ts.SignatureKind.Construct)[0];
    const instance = construct ? checker.getReturnTypeOfSignature(construct) : null;
    if (!instance) return;
    for (const property of checker.getPropertiesOfType(instance)) {
      if (property.name.startsWith('$')) continue;
      if (!ownDeclaration(property.declarations, VUE_PACKAGES)) continue;
      names.add(property.name);
      fieldNames(context, checker.getTypeOfSymbol(property), names);
    }
    return;
  }
  const signature = checker.getSignaturesOfType(found.type, ts.SignatureKind.Call)[0];
  if (!signature) return;
  if (framework === 'react') {
    const parameter = signature.getParameters()[0];
    if (!parameter) return;
    const props = checker.getTypeOfSymbol(parameter);
    for (const property of checker.getPropertiesOfType(props)) {
      names.add(property.name);
      fieldNames(context, checker.getTypeOfSymbol(property), names);
    }
    return;
  }
  // vanilla: the parameters, the fields of the options and the members of the controller it returns.
  for (const parameter of signature.getParameters()) {
    names.add(parameter.name);
    fieldNames(context, checker.getTypeOfSymbol(parameter), names);
  }
  fieldNames(context, checker.getReturnTypeOfSignature(signature), names);
}

/**
 * Members a Vue component exposes through expose({ ... }) in the published build
 * (0.3.0 declares no exposed member: the DefineComponent bindings argument is empty).
 */
export function vueExposed(published, exportName) {
  const options = vueOptions(published, exportName);
  const names = new Set();
  if (!options) return names;
  const { ts } = published;
  const visit = (node) => {
    if (ts.isCallExpression(node)) {
      const callee = node.expression;
      const isExpose = (ts.isIdentifier(callee) && callee.text === 'expose') || (ts.isPropertyAccessExpression(callee) && callee.name.text === 'expose');
      const argument = node.arguments[0];
      if (isExpose && argument && ts.isObjectLiteralExpression(argument)) {
        for (const property of argument.properties) if (property.name && (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name))) names.add(property.name.text);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(options.object);
  return names;
}

/** names[framework], values (every framework) and attribute values of a component. */
export function componentVocabulary(vocab, id, declared) {
  if (vocab.vocabularies.has(id)) return vocab.vocabularies.get(id);
  const { readers } = vocab;
  const names = Object.fromEntries(FRAMEWORKS.map((framework) => [framework, new Set()]));
  const values = new Set();
  const attributeValues = new Map();
  const addValue = (attribute, value) => {
    values.add(value);
    if (!attribute) return;
    if (!attributeValues.has(attribute)) attributeValues.set(attribute, new Set());
    attributeValues.get(attribute).add(value);
  };
  for (const framework of FRAMEWORKS) {
    const decl = declared[framework];
    for (const member of decl.members) {
      names[framework].add(member.name);
      const last = member.name.split(' ').at(-1);
      names[framework].add(last);
      for (const value of literalValues(member.type)) addValue(last, value);
      for (const value of literalValues(member.default)) addValue(last, value);
    }
    for (const exportName of decl.exports ?? []) {
      declarationNames(readers.context, framework, exportName, names[framework]);
      if (framework === 'vue') vueExposed(readers.published.vue, exportName).forEach((name) => names.vue.add(name));
    }
  }
  const entry = readers.components.get(id);
  const classes = entry?.cssClasses ?? [];
  for (const name of classes) names.vanilla.add(name);
  for (const [attribute, data] of attributesFor(readers.selectors, classes)) {
    names.vanilla.add(attribute);
    for (const value of data.values) addValue(attribute, value);
  }
  const contract = contractFor(readers.contractRows, classes, readers.selectors, componentClasses(readers));
  for (const [attribute, list] of contract.values) for (const value of list) addValue(attribute, value);
  // The data-hw-* attributes an installed README documents for this component (RangeSlider: data-hw-range-label).
  const exportNames = FRAMEWORKS.flatMap((framework) => declared[framework].exports ?? []);
  const documented = documentedAttributes(vocab.readmeBlocks ?? [], [entry?.name, entry?.name && `create${entry.name}`, ...classes, `data-hw="${id}"`, ...exportNames]);
  const result = { names, values, attributeValues, documented };
  vocab.vocabularies.set(id, result);
  return result;
}

// ---------------------------------------------------------------------------
// Judging the terms of a page.

function inlineText(nodes = []) {
  return nodes.map((node) => (node.type === 'text' ? node.value : node.type === 'inlineCode' ? '' : inlineText(node.children ?? []))).join('');
}

/** The component id a link of the page model leads to, or null. */
function linkedId(href) {
  const match = /components\/([a-z0-9-]+)(?:\.ar)?(?:\.md|\/|$)/.exec(String(href ?? ''));
  return match ? match[1] : null;
}

/**
 * The code values of a page model outside the API tables, each with the
 * frameworks of its paragraph and the components its sentence links to:
 * [{ text, section, scope: string[], linked: string[] }].
 */
export function codeValues(page) {
  const out = [];
  out.rows = [];
  const visitInlines = (nodes, where) => {
    // Sentences: a text node with a sentence end closes the sentence of the codes before it.
    const sentences = [[]];
    const links = [[]];
    const walk = (list) => {
      (list ?? []).forEach((node, index) => {
        if (node.type === 'inlineCode') {
          // A name split across formatting (`orientation`*Mode*): the code is directly followed by a letter.
          const next = list[index + 1];
          const after = next?.type === 'text' ? next.value : next && next.type !== 'inlineCode' ? inlineText([next]) : '';
          sentences[sentences.length - 1].push(/^[\p{L}\p{N}_]/u.test(after) && /^[\w$-]+$/.test(node.value) ? { split: `${node.value}${after.split(/[^\p{L}\p{N}_]/u)[0]}`, value: node.value } : node.value);
        }
        else if (node.type === 'link') {
          const id = linkedId(node.href);
          if (id) links[links.length - 1].push(id);
          walk(node.children);
        } else if (node.type === 'text') {
          const ends = (node.value.match(/[.!?؟](\s|$)/g) ?? []).length;
          for (let i = 0; i < ends; i += 1) {
            sentences.push([]);
            links.push([]);
          }
        } else walk(node.children);
      });
    };
    walk(nodes);
    const named = new Set();
    for (const match of inlineText(nodes).matchAll(/(?<![\w-])(JavaScript|vanilla|React|Vue|Angular)(?![\w-])/g)) named.add(FRAMEWORK_WORDS[match[1]]);
    const scope = [...new Set([...(where.framework ? [where.framework] : []), ...named])];
    sentences.forEach((codes, index) => {
      for (const code of codes) {
        if (typeof code === 'string') out.push({ text: code, section: where.label, scope, linked: links[index] });
        else out.push({ text: code.value, split: code.split, section: where.label, scope, linked: links[index] });
      }
    });
  };
  // A heading whose text is a framework name scopes the paragraphs under it, in every
  // section (an h4 under an h3 of another framework scopes to its own).
  const visitBlocks = (blocks, where) => {
    for (const block of blocks ?? []) {
      if (block.type === 'heading') {
        const named = FRAMEWORK_WORDS[inlineText(block.children).trim()] ?? null;
        if (block.level === 3) {
          where.h3 = block.id;
          where.h3Framework = named;
          where.h4Framework = null;
        } else if (block.level === 4) where.h4Framework = named;
        where.label = `${where.section}${where.h3 ? `/${where.h3}` : ''}`;
        where.framework = where.h4Framework ?? where.h3Framework ?? null;
        visitInlines(block.children, where);
      } else if (block.type === 'paragraph') visitInlines(block.children, where);
      else if (block.type === 'list') for (const item of block.items) visitBlocks(item, where);
      else if (block.type === 'alert' || block.type === 'blockquote') visitBlocks(block.blocks, where);
      else if (block.type === 'table') {
        if (where.section === 'api' && API_H3.has(where.h3)) {
          // The row names of the page's own API tables (content selectors among them) are accepted in its prose.
          for (const row of block.rows) for (const node of row.c0 ?? []) if (node.type === 'inlineCode') out.rows.push({ name: node.value, framework: H3_SCOPE[where.h3] });
          continue;
        }
        for (const code of block.captionCodes ?? []) out.push({ text: code, section: where.label, scope: where.framework ? [where.framework] : [], linked: [] });
        for (const column of block.columns) visitInlines(column.label, where);
        for (const row of block.rows) for (const column of block.columns) visitInlines(row[column.key], where);
      }
    }
  };
  visitInlines(page.summary ?? [], { label: 'summary', framework: null });
  for (const section of page.sections ?? []) {
    visitInlines(section.title ?? [], { label: section.id, framework: null });
    visitBlocks(section.blocks, { section: section.id, h3: null, label: section.id, framework: null });
  }
  return out;
}

/** Classes, data-hw hooks and data attributes of an html live block. */
export function markupTerms(code) {
  const out = [];
  for (const tag of code.matchAll(/<([a-zA-Z][\w-]*)((?:\s+[^\s=>/]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*\/?>/g)) {
    for (const attribute of tag[2].matchAll(/([^\s=>/]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
      const name = attribute[1].toLowerCase();
      const value = attribute[2] ?? attribute[3] ?? attribute[4] ?? '';
      if (name === 'class') for (const token of value.split(/\s+/).filter(Boolean)) out.push({ kind: 'class', name: token, text: `class="${value}"` });
      else if (name === 'data-hw') out.push({ kind: 'hook', name: value, text: `data-hw="${value}"` });
      else if (name.startsWith('data-')) {
        out.push({ kind: 'attribute', name, text: name });
        if (value !== '') out.push({ kind: 'data-value', name, value, text: `${name}="${value}"` });
      } else if (name.startsWith('aria-')) out.push({ kind: 'attribute', name, text: name });
    }
  }
  return out;
}

const camel = (name) => name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

/**
 * The values that a published module compares a data-* attribute with, as
 * dataset.<camelName> or getAttribute('<name>') followed by === or !== and a string
 * literal (root.dataset.hwMultiple === 'true' gives "true" for data-hw-multiple).
 */
export function comparedValues(vocab, attribute) {
  vocab.compared ??= new Map();
  if (vocab.compared.has(attribute)) return vocab.compared.get(attribute);
  const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const read = String.raw`(?:dataset\.${escape(camel(attribute.slice(5)))}(?![\w$])|getAttribute\(['"]${escape(attribute)}['"]\))`;
  const values = new Set();
  for (const match of vocab.moduleText.matchAll(new RegExp(String.raw`${read}\s*[!=]==?\s*(?:'([^']*)'|"([^"]*)")`, 'g'))) values.add(match[1] ?? match[2]);
  vocab.compared.set(attribute, values);
  return values;
}

/** Whether a data-* or aria-* attribute is selected by the stylesheet or occurs in a published module. */
function knownAttribute(vocab, name) {
  if (vocab.stylesheetAttributes.has(name)) return 'the stylesheet';
  if (new RegExp(`(?<![\\w-])${name}(?![\\w-])`).test(vocab.moduleText)) return 'a published module';
  if (name.startsWith('data-') && new RegExp(`dataset\\.${camel(name.slice(5))}(?![\\w$])`).test(vocab.moduleText)) return 'a published module (dataset)';
  return null;
}

/**
 * Judges one term; returns null when it is known, else the reason.
 * @param {*} vocab createVocabularyContext() result
 * @param {*} term from terms()
 * @param {{ scope: string[], vocabulary: any, linked: any[] }} where
 */
export function judge(vocab, term, where) {
  const { allow } = vocab;
  const frameworks = where.scope.length ? where.scope : FRAMEWORKS;
  const memberOf = (vocabulary, name) => FRAMEWORKS.filter((framework) => vocabulary.names[framework].has(name));
  const exportOf = (name) => [...FRAMEWORKS, 'core'].filter((framework) => vocab.exportsOf[framework].has(name));
  const valueKnown = (value, attribute) => {
    if (attribute === 'data-hw') return vocab.hooks.has(value) ? null : `"${value}" is not a hook that enhance() of @hawiyah/vanilla registers`;
    const listed = allow.values(['aria-attribute', 'aria-role', 'html-attribute'], attribute);
    if (listed?.includes(value)) return null;
    // name="value": only the values of that attribute or member count (G4 of the 5a fix round).
    if (attribute && enumeratedSets(vocab, where.vocabulary, attribute).some((set) => set.has(value))) return null;
    // A value that a published module compares the data-* attribute with (dataset.hwMultiple === 'true').
    if (attribute?.startsWith('data-') && comparedValues(vocab, attribute).has(value)) return null;
    if (!attribute && where.vocabulary.values.has(value)) return null;
    return `"${value}" is not a value of a member type or of an enumerated attribute of this component${attribute ? ` (attribute ${attribute})` : ''}`;
  };
  const scoped = (name, owners, what) => {
    const inScope = owners.filter((framework) => frameworks.includes(framework) || framework === 'core');
    if (inScope.length) return null;
    if (owners.length) return `${name} is ${what} of ${owners.join(', ')} only, and the paragraph is scoped to ${frameworks.join(', ')} (leadAmendments A9: the check cannot decide)`;
    return undefined;
  };
  switch (term.kind) {
    case 'package':
      if (vocab.packages.has(term.name)) return null;
      if (!term.name.startsWith('@hawiyah/') && vocab.dependencies.has(term.name)) return null;
      return term.name.startsWith('@hawiyah/')
        ? `${term.name} is not an installed @hawiyah package or export path`
        : `${term.name} is not a package the guide installs (guide/package.json)`;
    case 'file':
      return existsSync(join(vocab.repoDir, term.name)) ? null : `${term.name} is not a file of the repository root`;
    case 'css': {
      if (!allow.has(['css-property'], term.name)) return `${term.name} is not a CSS property of vocabulary-allow.json`;
      const listed = allow.values(['css-property'], term.name);
      return !listed || listed.includes(term.value) ? null : `${term.value} is not a value of ${term.name} in vocabulary-allow.json`;
    }
    case 'custom-property':
      if (vocab.customProperties.has(term.name)) return null;
      return `${term.name} is neither a custom property that the installed stylesheet defines nor one that the @hawiyah/styles README documents`;
    case 'class':
      if (vocab.classes.has(term.name)) return null;
      return `${term.name} is not a class of the installed stylesheet`;
    case 'hook':
      return valueKnown(term.name, 'data-hw');
    case 'literal':
      return valueKnown(term.value, null);
    case 'event': {
      const name = term.name;
      if (allow.has(['dom-event'], name)) return null;
      const owners = [...new Set([...memberOf(where.vocabulary, name), ...where.linked.flatMap((vocabulary) => memberOf(vocabulary, name))])];
      const result = scoped(name, owners, 'an event');
      if (result !== undefined) return result;
      if (/^hw:/.test(name) && (vocab.moduleText.includes(`'${name}'`) || vocab.moduleText.includes(`"${name}"`))) return null;
      return `${name} is not an event of this component, of a linked component or of vocabulary-allow.json`;
    }
    case 'attribute':
    case 'binding':
    case 'name': {
      const name = term.name;
      const valueProblem = term.kind === 'attribute' && term.value !== undefined ? valueKnown(term.value, name) : null;
      const nameProblem = judgeName(vocab, term, where, { frameworks, memberOf, exportOf, scoped });
      return nameProblem ?? valueProblem;
    }
    default:
      return `the check cannot read ${JSON.stringify(term)}`;
  }
}

/** Type words a page names in code formatting: the TypeScript primitives and literals. */
export const TYPE_WORDS = new Set(['boolean', 'string', 'number', 'true', 'false', 'null', 'undefined']);

function judgeName(vocab, term, where, helpers) {
  const { allow } = vocab;
  const { memberOf, exportOf, scoped } = helpers;
  const name = term.name;
  if (term.kind === 'name' && TYPE_WORDS.has(name)) return null;
  if (/^hw-/.test(name)) {
    if (vocab.classes.has(name) || vocab.angularElements.has(name)) return null;
    return `${name} is not a class of the installed stylesheet or an element of @hawiyah/angular`;
  }
  if (/^hw:/.test(name)) {
    return vocab.moduleText.includes(`'${name}'`) || vocab.moduleText.includes(`"${name}"`) ? null : `${name} is not an event name a published module dispatches`;
  }
  if (/^(data|aria)-/.test(name)) {
    if (knownAttribute(vocab, name) || allow.has(['aria-attribute', 'html-attribute'], name)) return null;
    if (where.vocabulary.names.vanilla.has(name)) return null;
    if (/^data-hw-/.test(name) && where.vocabulary.documented?.has(name)) return null;
    const readme = /^data-hw-/.test(name) ? ' documented for this component by an installed README,' : '';
    return `${name} is neither selected by the installed stylesheet, read by a published module,${readme} nor an attribute of vocabulary-allow.json`;
  }
  const members = [...new Set([...memberOf(where.vocabulary, name), ...where.linked.flatMap((vocabulary) => memberOf(vocabulary, name))])];
  if (/^(Hw|create)[A-Z]/.test(name) || /^[A-Z]/.test(name)) {
    const owners = exportOf(name);
    const result = scoped(name, owners, 'an export');
    if (result !== undefined) return result;
    if (allow.has(['key', 'html-element'], name)) return null;
    return `${name} is not an export of an installed @hawiyah package`;
  }
  const memberResult = scoped(name, members, 'a member');
  if (memberResult === null) return null;
  const owners = exportOf(name);
  if (owners.length && scoped(name, owners, 'an export') === null) return null;
  // The attribute selector of an Angular class of any component (hwButton on the Service card page), in the scope of Angular.
  const selectorResult = vocab.angularSelectors?.has(name) ? scoped(name, ['angular'], 'a selector') : undefined;
  if (selectorResult === null) return null;
  const kinds = term.kind === 'attribute' || term.bracket || term.kind === 'binding'
    ? ['html-attribute', 'aria-attribute', 'dom-member']
    : ['html-element', 'html-attribute', 'aria-attribute', 'aria-role', 'dom-member', 'dom-event', 'vue-template', 'angular-template', 'css-function'];
  if (allow.has(kinds, name)) return null;
  if (!/[A-Z]/.test(name) && where.vocabulary.values.has(name)) return null;
  if (memberResult) return memberResult;
  if (selectorResult) return selectorResult;
  return `${name} is not a member of this component in any adapter, of a component the sentence links to, an export, a value of this component or a name of vocabulary-allow.json`;
}

/**
 * The enumerated values of an attribute or member: the values the stylesheet selects
 * it with, the values of the contract row or of the member of that name, and for a
 * vanilla hook data-hw-<name> the values of the member <name> or, when no adapter has a
 * member <name>, of a member that starts with it (data-hw-activation and activationMode;
 * data-hw-sort names the key of a column, not the member sortDirection, since the
 * controller has its own member sort). Empty values do not count.
 */
function enumeratedSets(vocab, vocabulary, attribute) {
  const nonEmpty = (set) => new Set([...(set ?? [])].filter((value) => value !== ''));
  const sets = [nonEmpty(vocab.stylesheetAttributes.get(attribute)), nonEmpty(vocabulary.attributeValues.get(attribute))];
  const hook = /^data-hw-([a-z-]+)$/.exec(attribute)?.[1];
  if (hook) {
    const member = camel(hook);
    const exact = FRAMEWORKS.some((framework) => vocabulary.names[framework].has(member));
    for (const [name, values] of vocabulary.attributeValues) if (name === member || (!exact && name.startsWith(member))) sets.push(nonEmpty(values));
  }
  return sets.filter((set) => set.size > 0);
}

/**
 * The value of a data-* attribute of an html block: when the attribute has an
 * enumerated set (the values the stylesheet selects it with, the values of the
 * contract row, or for a vanilla hook data-hw-<name> the literal values of the member
 * <name>, or, when no adapter has that member, of a member that starts with it, as
 * data-hw-activation and activationMode),
 * the value is one of them; an attribute without such a set takes any value (a tab's
 * data-hw-value, an overflow label, the column key of data-hw-sort).
 */
function dataValueProblem(vocab, vocabulary, term) {
  const sets = enumeratedSets(vocab, vocabulary, term.name);
  if (sets.length === 0 || sets.some((set) => set.has(term.value))) return null;
  return `"${term.value}" is not a value of ${term.name} (${[...new Set(sets.flatMap((set) => [...set]))].map((value) => `"${value}"`).join(', ')})`;
}

/**
 * The vocabulary pass over page models.
 * @param {{ pages: { id: string, lang: string, page: any }[], vocab: any, declared: (id: string) => any,
 *           liveGroups?: any[], exceptions?: any[] }} input
 * @returns {{ findings: any[], stats: { codes: number, terms: number, markup: number, excepted: number } }}
 */
export function checkVocabulary(input) {
  const { pages, vocab, declared } = input;
  const exceptions = input.exceptions ?? [];
  const used = new Set();
  const findings = [];
  const stats = { codes: 0, terms: 0, markup: 0, excepted: 0 };
  const files = new Set();
  const report = (file, text, where, reason) => {
    const entry = exceptions.find((item) => item.file === file && item.text === text);
    if (entry) {
      used.add(entry);
      stats.excepted += 1;
      return;
    }
    findings.push({ code: VOCAB_CODE, file, message: `${file}: ${where}: \`${text}\`: ${reason}` });
  };
  for (const { id, lang, page } of pages) {
    const file = page.sourcePath ?? `docs/components/${id}${lang === 'ar' ? '.ar' : ''}.md`;
    files.add(file);
    const vocabulary = componentVocabulary(vocab, id, declared(id));
    const values = codeValues(page);
    const rowNames = values.rows;
    for (const item of values) {
      stats.codes += 1;
      if (item.split) {
        report(file, item.text, item.section, `the name continues outside the code formatting ("${item.split}"); write the whole name as code`);
        continue;
      }
      // A row name of the page's own API tables (a content selector such as [hwStatValue]), and its bare name, in the scope of its table.
      const ownRow = rowNames.some((row) => (!item.scope.length || item.scope.includes(row.framework))
        && (row.name === item.text || terms(row.name).some((term) => term.name === item.text.trim())));
      if (ownRow) continue;
      const linked = item.linked.filter((other) => other !== id && vocab.readers.components.has(other)).map((other) => componentVocabulary(vocab, other, declared(other)));
      const reasons = [];
      for (const term of terms(item.text)) {
        stats.terms += 1;
        const reason = judge(vocab, term, { scope: item.scope, vocabulary, linked });
        if (reason) reasons.push(reason);
      }
      if (reasons.length) report(file, item.text, item.section, [...new Set(reasons)].join('; '));
    }
    for (const group of (input.liveGroups ?? []).filter((item) => item.id === id && item.lang === lang)) {
      const code = group.blocks?.vanilla?.code;
      if (!code) continue;
      for (const term of markupTerms(code)) {
        stats.markup += 1;
        const reason = term.kind === 'attribute'
          ? judgeName(vocab, term, { scope: ['vanilla'], vocabulary, linked: [] }, { memberOf: () => [], exportOf: () => [], scoped: () => undefined })
          : term.kind === 'data-value' ? dataValueProblem(vocab, vocabulary, term)
            : judge(vocab, term, { scope: ['vanilla'], vocabulary, linked: [] });
        if (reason) report(file, term.text, `live example ${group.example} (html)`, reason);
      }
    }
  }
  for (const entry of exceptions) {
    if (files.has(entry.file) && !used.has(entry)) {
      findings.push({ code: VOCAB_CODE, file: 'scripts/api-tables/vocabulary-exceptions.json', message: `scripts/api-tables/vocabulary-exceptions.json: the entry for \`${entry.text}\` in ${entry.file} matches no finding; remove it` });
    }
  }
  return { findings, stats };
}
