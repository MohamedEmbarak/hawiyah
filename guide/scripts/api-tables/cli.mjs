#!/usr/bin/env node
// Step 30: checks the API tables of every built page against the declarations
// of the installed adapter packages (contentPipeline.apiTables).
//
//   node scripts/api-tables/cli.mjs [--content <dir>] [--node-modules <dir>]
//                                   [--components <file>] [--exclusions <file>]
//
// --content is the output of step 20 (default src/generated/content: its
// manifest.json lists the built pages and pages/<id>.<lang>.json holds each
// model). Every finding is printed as 'HWC-APIX <file>: ...'; the exit code is
// 1 when any remains.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CODE, TABLES, apiTablesOf, compareTable, finding, formatFinding } from './compare.mjs';
import { angularMembers } from './declarations-angular.mjs';
import { reactMembers } from './declarations-react.mjs';
import { vanillaMembers } from './declarations-vanilla.mjs';
import { vueMembers } from './declarations-vue.mjs';
import { createDeclarationProgram, resolveExport } from './program.mjs';
import { contractFor, readContract } from './stylesheet-contract.mjs';
import { targetsFor } from './targets.mjs';

export { formatFinding };

const here = dirname(fileURLToPath(import.meta.url));
export const guideDir = resolve(here, '..', '..');
export const DEFAULT_EXCLUSIONS = join(here, 'exclusions.json');

export function readExclusions(file) {
  const data = JSON.parse(readFileSync(file, 'utf8'));
  const components = data.components ?? {};
  for (const [id, entry] of Object.entries(components)) {
    for (const [framework, item] of Object.entries(entry)) {
      if (framework !== 'vanilla') throw new Error(`api-tables: exclusions.json ${id}.${framework}: only vanilla tables of components without a controller can be excluded`);
      if (item.rule !== 'stylesheet-contract') throw new Error(`api-tables: exclusions.json ${id}.vanilla: rule must be "stylesheet-contract"`);
      if (typeof item.reason !== 'string' || !item.reason.trim()) throw new Error(`api-tables: exclusions.json ${id}.vanilla needs a reason`);
      for (const key of ['nativeAttributes', 'notListed']) {
        for (const [name, reason] of Object.entries(item[key] ?? {})) {
          if (typeof reason !== 'string' || !reason.trim()) throw new Error(`api-tables: exclusions.json ${id}.vanilla.${key}.${name} needs a reason`);
        }
      }
    }
  }
  return components;
}

function readComponentsFile(file) {
  const data = JSON.parse(readFileSync(file, 'utf8'));
  const list = Array.isArray(data) ? data : data.components;
  return new Map(list.map((entry) => [entry.id, entry]));
}

/**
 * Members of the vanilla table of a component without a controller, from the
 * stylesheet contract and its exclusions entry.
 */
export function stylesheetMembers(id, entry, contractRows, exclusion) {
  const problems = [];
  if (!exclusion) return { members: [], problems: [`@hawiyah/vanilla exports no controller for ${id} and scripts/api-tables/exclusions.json has no entry for it`] };
  const contract = contractFor(contractRows, entry?.cssClasses ?? []);
  if (contract.classes.length === 0) problems.push(`the styles contract documents none of the classes ${(entry?.cssClasses ?? []).join(', ') || '(none)'} of ${id}`);
  const native = Object.keys(exclusion.nativeAttributes ?? {});
  const notListed = new Set(Object.keys(exclusion.notListed ?? {}));
  for (const name of notListed) if (!contract.attributes.includes(name)) problems.push(`exclusions.json ${id}.vanilla.notListed names ${name}, which the styles contract does not document`);
  for (const name of native) if (contract.attributes.includes(name)) problems.push(`exclusions.json ${id}.vanilla.nativeAttributes names ${name}, which the styles contract documents`);
  const names = ['class', ...contract.attributes.filter((name) => !notListed.has(name)), ...native];
  return { members: [...new Set(names)].map((name) => ({ name, kind: 'option', required: false })), problems };
}

/**
 * Checks the API tables of the given page models.
 * @param {{ pages: { id: string, lang: string, page: any }[], context: any, components: Map<string, any>,
 *           contractRows: any[], exclusions: Record<string, any> }} input
 */
export function checkPages(input) {
  const { pages, context, components, contractRows, exclusions } = input;
  const exists = (framework, name) => resolveExport(context, framework, name) !== null;
  const cache = new Map();
  const declared = (id) => {
    if (cache.has(id)) return cache.get(id);
    const targets = targetsFor(id, exists);
    const out = {};
    if (exists('vanilla', targets.vanilla)) out.vanilla = { ...vanillaMembers(context, targets.vanilla), checkRequired: true };
    else out.vanilla = { ...stylesheetMembers(id, components.get(id), contractRows, exclusions[id]?.vanilla), checkRequired: false };
    out.react = { ...reactMembers(context, targets.react), checkRequired: true };
    out.vue = { ...vueMembers(context, targets.vue), checkRequired: true };
    out.angular = { ...angularMembers(context, targets.angular), checkRequired: true };
    cache.set(id, out);
    return out;
  };
  const findings = [];
  let tables = 0;
  for (const { id, page } of pages) {
    const file = page.sourcePath ?? `docs/components/${id}.md`;
    const pageTables = apiTablesOf(page);
    const members = declared(id);
    for (const [h3, spec] of Object.entries(TABLES)) {
      const rows = pageTables[h3];
      const decl = members[spec.framework];
      for (const problem of decl.problems) findings.push(finding(file, `${spec.label} table cannot be checked: ${problem}`));
      if (!rows) {
        findings.push(finding(file, `the API section has no ${spec.label} table`));
        continue;
      }
      if (decl.problems.length) continue;
      tables += 1;
      findings.push(...compareTable(rows, decl.members, { file, label: spec.label, checkRequired: decl.checkRequired }));
    }
  }
  return { findings, tables };
}

/** Reads the built pages from the content output of step 20 and checks them. */
export function runApiTables(options = {}) {
  const contentDir = options.contentDir ?? join(guideDir, 'src', 'generated', 'content');
  const nodeModules = options.nodeModules ?? join(guideDir, 'node_modules');
  const componentsFile = options.componentsFile ?? join(guideDir, '..', 'components.json');
  const exclusionsFile = options.exclusionsFile ?? DEFAULT_EXCLUSIONS;
  const manifestFile = join(contentDir, 'manifest.json');
  if (!existsSync(manifestFile)) throw new Error(`api-tables: ${manifestFile} is missing; run step 20 first`);
  const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
  const pages = [];
  for (const entry of manifest.pages ?? []) {
    for (const lang of entry.langs ?? []) {
      pages.push({ id: entry.id, lang, page: JSON.parse(readFileSync(join(contentDir, 'pages', `${entry.id}.${lang}.json`), 'utf8')) });
    }
  }
  const context = options.context ?? createDeclarationProgram(nodeModules);
  const result = checkPages({
    pages,
    context,
    components: readComponentsFile(componentsFile),
    contractRows: readContract(nodeModules),
    exclusions: readExclusions(exclusionsFile),
  });
  return { ...result, pages: pages.length };
}

function parseArgs(argv) {
  const options = {};
  const keys = { '--content': 'contentDir', '--node-modules': 'nodeModules', '--components': 'componentsFile', '--exclusions': 'exclusionsFile' };
  for (let i = 0; i < argv.length; i += 1) {
    const key = keys[argv[i]];
    if (!key || argv[i + 1] === undefined) throw new Error(`api-tables: unknown or incomplete option ${argv[i]}`);
    options[key] = resolve(argv[i + 1]);
    i += 1;
  }
  return options;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = runApiTables(parseArgs(process.argv.slice(2)));
    for (const item of result.findings) console.log(formatFinding(item));
    if (result.findings.length) {
      console.log(`api-tables: ${result.findings.length} ${CODE} finding(s) in ${result.pages} page model(s)`);
      process.exit(1);
    }
    console.log(`api-tables: ${result.tables} table(s) of ${result.pages} page model(s) match the declarations`);
  } catch (error) {
    console.log(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
