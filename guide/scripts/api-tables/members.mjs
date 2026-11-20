// The declared members of one component in the four adapters, with the written
// type, the required flag and the default of each, read from the installed
// packages only (guide/node_modules/@hawiyah/*). Step 30 compares the tables of a
// page with these members, the scaffold and content:api-tables write tables from
// them, and content:facts writes them into the fact sheets, so a table, its
// check and a sheet cannot disagree.
//
//   vanilla  create<Name> options (types from the declarations; defaults only from
//            defaults.json with checked evidence), or for a component without a
//            controller the stylesheet table: class, the contract attributes of the
//            styles README and the attribute selectors of dist/styles.css on the
//            component's classes, and the exclusions.json entries;
//   react    props declared by @hawiyah/react, defaults from the published JavaScript;
//   vue      props, events and typed slots of the declarations, defaults from the
//            runtime props object, and the slots the published build reads;
//   angular  inputs, outputs and content selectors, defaults from the field
//            initialisers of the FESM.
// A required member has no default (an em dash). A row whose type or default no
// published file declares is not compared in that column: native attributes of
// exclusions.json; it is counted in the success line of step 30.
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { angularMembers } from './declarations-angular.mjs';
import { reactMembers } from './declarations-react.mjs';
import { vanillaMembers } from './declarations-vanilla.mjs';
import { vueMembers } from './declarations-vue.mjs';
import { angularDefaults } from './defaults-angular.mjs';
import { reactDefaults } from './defaults-react.mjs';
import { vueDefaults } from './defaults-vue.mjs';
import { createDeclarationProgram, resolveExport } from './program.mjs';
import { loadPublished } from './published-js.mjs';
import { vueSlots } from './slots-vue.mjs';
import { attributesFor, readSelectorAttributes } from './stylesheet-selectors.mjs';
import { contractFor, readContract } from './stylesheet-contract.mjs';
import { VUE_SLOT_PATTERNS, targetsFor } from './targets.mjs';
import { EM_DASH, quote } from './types.mjs';

export const FRAMEWORKS = ['vanilla', 'react', 'vue', 'angular'];

/** Reads exclusions.json: { [id]: { vanilla: entry } }, checking its shape. */
export function readExclusions(file) {
  const data = JSON.parse(readFileSync(file, 'utf8'));
  const components = data.components ?? {};
  for (const [id, entry] of Object.entries(components)) {
    for (const [framework, item] of Object.entries(entry)) {
      if (framework !== 'vanilla') throw new Error(`api-tables: exclusions.json ${id}.${framework}: only vanilla tables of components without a controller can be excluded`);
      if (item.rule !== 'stylesheet-contract') throw new Error(`api-tables: exclusions.json ${id}.vanilla: rule must be "stylesheet-contract"`);
      if (typeof item.reason !== 'string' || !item.reason.trim()) throw new Error(`api-tables: exclusions.json ${id}.vanilla needs a reason`);
      if (typeof item.approvedBy !== 'string' || !item.approvedBy.trim()) throw new Error(`api-tables: exclusions.json ${id}.vanilla needs approvedBy`);
      for (const key of ['nativeAttributes', 'notListed']) {
        for (const [name, reason] of Object.entries(item[key] ?? {})) {
          if (typeof reason !== 'string' || !reason.trim()) throw new Error(`api-tables: exclusions.json ${id}.vanilla.${key}.${name} needs a reason`);
        }
      }
    }
  }
  return components;
}

/** Reads defaults.json: the list of entries, checking its shape (the evidence is checked per id). */
export function readDefaults(file) {
  const data = JSON.parse(readFileSync(file, 'utf8'));
  const entries = data.entries ?? [];
  entries.forEach((entry, index) => {
    const ok = entry && typeof entry.id === 'string' && entry.framework === 'vanilla' && typeof entry.name === 'string'
      && typeof entry.default === 'string' && entry.default.trim() && typeof entry.evidence?.file === 'string' && typeof entry.evidence?.text === 'string'
      && entry.evidence.text.trim() && typeof entry.approvedBy === 'string' && entry.approvedBy.trim() && typeof entry.reason === 'string' && entry.reason.trim();
    if (!ok) throw new Error(`api-tables: defaults.json entry ${index + 1} must be { id, framework: "vanilla", name, default, evidence: { file, text }, approvedBy, reason } with non-empty values`);
  });
  return entries;
}

export function readComponentsFile(file) {
  const data = JSON.parse(readFileSync(file, 'utf8'));
  const list = Array.isArray(data) ? data : data.components;
  return new Map(list.map((entry) => [entry.id, entry]));
}

const here = fileURLToPath(new URL('.', import.meta.url));
export const DEFAULT_EXCLUSIONS = join(here, 'exclusions.json');
export const DEFAULT_DEFAULTS = join(here, 'defaults.json');

/**
 * Everything the readers need, read once per run.
 * @param {{ nodeModules: string, componentsFile: string, exclusionsFile?: string, defaultsFile?: string,
 *           context?: any, exclusions?: any, defaults?: any[], slotPatterns?: any }} options
 */
export function createReaders(options) {
  const { nodeModules } = options;
  const context = options.context ?? createDeclarationProgram(nodeModules);
  return {
    nodeModules,
    context,
    published: {
      react: loadPublished(nodeModules, '@hawiyah/react'),
      vue: loadPublished(nodeModules, '@hawiyah/vue'),
      angular: loadPublished(nodeModules, '@hawiyah/angular'),
    },
    contractRows: readContract(nodeModules),
    selectors: readSelectorAttributes(nodeModules),
    components: options.components ?? readComponentsFile(options.componentsFile),
    exclusions: options.exclusions ?? readExclusions(options.exclusionsFile ?? DEFAULT_EXCLUSIONS),
    defaults: options.defaults ?? readDefaults(options.defaultsFile ?? DEFAULT_DEFAULTS),
    slotPatterns: options.slotPatterns ?? VUE_SLOT_PATTERNS,
    fileCache: new Map(),
  };
}

function installedText(readers, path) {
  if (!readers.fileCache.has(path)) {
    const file = resolve(readers.nodeModules, path);
    const inside = file.startsWith(resolve(readers.nodeModules, '@hawiyah') + '/');
    readers.fileCache.set(path, inside && existsSync(file) ? readFileSync(file, 'utf8') : null);
  }
  return readers.fileCache.get(path);
}

/** Applies defaults.json to vanilla members; an entry whose evidence is not in the installed file is a finding. */
function applyDefaultsFile(readers, id, members) {
  const findings = [];
  for (const entry of readers.defaults.filter((item) => item.id === id)) {
    const text = installedText(readers, entry.evidence.file);
    const member = members.find((item) => item.name === entry.name);
    if (text === null) findings.push(`defaults.json gives ${id} ${entry.name} the default ${entry.default} with evidence in ${entry.evidence.file}, which is not an installed file of @hawiyah`);
    else if (!text.includes(entry.evidence.text)) findings.push(`defaults.json gives ${id} ${entry.name} the default ${entry.default}; its evidence text "${entry.evidence.text}" does not occur in the installed ${entry.evidence.file}`);
    else if (!member) findings.push(`defaults.json gives ${id} ${entry.name} a default, but the JavaScript table of ${id} has no member ${entry.name}`);
    else {
      member.default = entry.default;
      member.defaultSource = { file: entry.evidence.file, text: entry.evidence.text, from: 'defaults.json' };
    }
  }
  return findings;
}

function literalUnion(values) {
  return values.map(quote).join(' | ');
}

/** The stylesheet table of a component without a controller. */
export function stylesheetMembers(readers, id) {
  const entry = readers.components.get(id);
  const classes = entry?.cssClasses ?? [];
  const exclusion = readers.exclusions[id]?.vanilla ?? null;
  const problems = [];
  const contract = contractFor(readers.contractRows, classes);
  const selected = attributesFor(readers.selectors, classes);
  const tableClasses = contract.classes.length ? contract.classes : classes.filter((name) => readers.selectors.selected.has(name));
  if (tableClasses.length === 0) problems.push(`neither the styles contract nor dist/styles.css has a rule for the classes ${classes.join(', ') || '(none)'} of ${id}`);
  const names = [...new Set([...contract.attributes, ...selected.keys()])];
  const native = Object.keys(exclusion?.nativeAttributes ?? {});
  const notListed = new Set(Object.keys(exclusion?.notListed ?? {}));
  for (const name of notListed) if (!names.includes(name)) problems.push(`exclusions.json ${id}.vanilla.notListed names ${name}, which neither the styles contract nor dist/styles.css declares on ${classes.join(', ')}`);
  for (const name of native) if (names.includes(name)) problems.push(`exclusions.json ${id}.vanilla.nativeAttributes names ${name}, which ${contract.attributes.includes(name) ? 'the styles contract documents' : 'dist/styles.css selects'}`);
  const members = [{
    name: 'class', kind: 'option', required: true, type: literalUnion(tableClasses), default: EM_DASH,
    compare: { type: true, default: true, required: false }, from: contract.classes.length ? 'contract' : 'stylesheet',
  }];
  for (const name of names) {
    if (notListed.has(name)) continue;
    const values = [...(contract.values.get(name) ?? [])];
    const css = selected.get(name);
    for (const value of css?.values ?? []) if (!values.includes(value)) values.push(value);
    const type = css?.open ? 'string' : values.length ? literalUnion(values) : 'boolean';
    const from = contract.values.has(name) ? (css ? 'contract and stylesheet' : 'contract') : 'stylesheet';
    members.push({ name, kind: 'option', required: false, type, default: EM_DASH, compare: { type: true, default: true, required: false }, from });
  }
  for (const name of native) {
    members.push({ name, kind: 'option', required: false, type: null, default: null, compare: { type: false, default: false, required: false }, from: 'exclusions.json', note: exclusion.nativeAttributes[name] });
  }
  return {
    members, problems, findings: [], source: 'stylesheet', classes: tableClasses,
    contractFamilies: contract.families, generatedNote: contract.classes.length === 0,
  };
}

/** Prefix of the members of a further export: '' for the documented export, else '<export> '. */
const qualified = (index, exportName) => (index === 0 ? '' : `${exportName} `);

/** Members of the further vanilla controllers of a page, qualified with the controller name. */
function furtherVanilla(context, names) {
  const members = [];
  const problems = [];
  for (const name of names) {
    if (resolveExport(context, 'vanilla', name) === null) {
      problems.push(`@hawiyah/vanilla exports no ${name}`);
      continue;
    }
    const read = vanillaMembers(context, name, { optionsRequired: false });
    problems.push(...read.problems);
    for (const member of read.members) members.push({ ...member, name: `${name} ${member.name}`, controller: name, default: EM_DASH, compare: { type: true, default: true, required: true } });
  }
  return { members, problems };
}

/** Declared members of a component id in the four adapters. */
export function declaredMembers(readers, id) {
  const { context } = readers;
  const exists = (framework, name) => resolveExport(context, framework, name) !== null;
  const targets = targetsFor(id, exists);
  const out = { id, targets };

  // Vanilla: the documented controller, or the stylesheet table when it is not exported; then the further controllers.
  {
    const [own, ...further] = targets.vanilla;
    const more = furtherVanilla(context, further);
    const furtherExports = further.filter((name) => exists('vanilla', name));
    if (exists('vanilla', own)) {
      const read = vanillaMembers(context, own);
      const members = read.members.map((member) => ({ ...member, default: EM_DASH, compare: { type: true, default: true, required: true } }));
      members.push(...more.members);
      const findings = applyDefaultsFile(readers, id, members);
      out.vanilla = { members, problems: [...read.problems, ...more.problems], findings, source: 'controller', exports: [own, ...furtherExports] };
    } else {
      const read = stylesheetMembers(readers, id);
      read.members.push(...more.members);
      read.problems.push(...more.problems);
      read.findings.push(...applyDefaultsFile(readers, id, read.members));
      out.vanilla = { ...read, exports: furtherExports };
    }
  }

  // React.
  {
    const members = [];
    const problems = [];
    targets.react.forEach((exportName, index) => {
      const read = reactMembers(context, exportName);
      const defaults = read.problems.length ? { defaults: new Map(), problems: [] } : reactDefaults(readers.published.react, exportName);
      problems.push(...read.problems, ...defaults.problems);
      for (const member of read.members) {
        const found = defaults.defaults.get(member.name);
        members.push({
          ...member, name: qualified(index, exportName) + member.name, ...(index ? { component: exportName } : {}),
          default: member.required ? EM_DASH : found?.text ?? EM_DASH, defaultSource: member.required ? null : found?.source ?? null, compare: { type: true, default: true, required: true },
        });
      }
    });
    out.react = { members, problems, findings: [], source: 'declarations', exports: [...targets.react] };
  }

  // Vue.
  {
    const members = [];
    const problems = [];
    const gaps = [];
    const patterns = readers.slotPatterns[id] ?? [];
    const usedPatterns = new Set();
    targets.vue.forEach((exportName, index) => {
      const prefix = qualified(index, exportName);
      const read = vueMembers(context, exportName);
      problems.push(...read.problems);
      if (read.problems.length) return;
      const defaults = vueDefaults(readers.published.vue, exportName);
      problems.push(...defaults.problems);
      const own = read.members.map((member) => {
        const extra = { name: prefix + member.name, ...(index ? { component: exportName } : {}) };
        if (member.kind !== 'prop') return { ...member, ...extra, default: EM_DASH, compare: { type: true, default: true, required: true } };
        const found = defaults.defaults.get(member.name);
        return { ...member, ...extra, default: member.required ? EM_DASH : found?.text ?? EM_DASH, defaultSource: member.required ? null : found?.source ?? null, compare: { type: true, default: true, required: true } };
      });
      const slots = vueSlots(readers.published.vue, exportName);
      problems.push(...slots.problems);
      const listed = new Set(own.filter((member) => member.kind === 'slot').map((member) => member.name));
      const slot = (name, from) => ({ name: prefix + name, kind: 'slot', required: false, type: EM_DASH, default: EM_DASH, compare: { type: true, default: true, required: true }, from, ...(index ? { component: exportName } : {}) });
      for (const name of slots.named) {
        if (!listed.has(prefix + name)) own.push(slot(name, 'run time'));
        listed.add(prefix + name);
      }
      for (const expression of slots.dynamic) {
        const pattern = patterns.find((item) => item.expression === expression);
        if (!pattern) gaps.push(`${exportName} of @hawiyah/vue reads a slot named by the expression ${expression}, and targets.mjs VUE_SLOT_PATTERNS.${id} has no entry for it`);
        else {
          usedPatterns.add(pattern);
          if (!listed.has(prefix + pattern.name)) own.push(slot(pattern.name, 'run time (pattern)'));
          listed.add(prefix + pattern.name);
        }
      }
      members.push(...own);
    });
    if (!problems.length) {
      for (const pattern of patterns) if (!usedPatterns.has(pattern)) problems.push(`targets.mjs VUE_SLOT_PATTERNS.${id} names the expression ${pattern.expression}, which ${targets.vue.join(', ')} of @hawiyah/vue does not read`);
    }
    out.vue = { members, problems, gaps, findings: [], source: 'declarations', exports: [...targets.vue] };
  }

  // Angular.
  {
    const read = angularMembers(context, targets.angular);
    const problems = [...read.problems];
    const fieldsOf = new Map();
    if (!read.problems.length) {
      for (const className of targets.angular) {
        const result = angularDefaults(readers.published.angular, className);
        problems.push(...result.problems);
        fieldsOf.set(className, result.fields);
      }
    }
    const members = read.members.map((member) => {
      let value = EM_DASH;
      let source = null;
      if (member.kind === 'input' && !member.required) {
        const found = fieldsOf.get(member.className)?.get(member.property);
        value = found?.text ?? EM_DASH;
        source = found?.source ?? null;
      }
      return { ...member, default: value, defaultSource: source, compare: { type: true, default: true, required: true } };
    });
    out.angular = { members, problems, findings: [], source: 'declarations', exports: [...targets.angular] };
  }
  for (const framework of FRAMEWORKS) {
    out[framework].gaps ??= [];
    out[framework].missingTarget = out[framework].problems.some((problem) => /^@hawiyah\/[a-z]+ exports no /.test(problem));
  }
  return out;
}
