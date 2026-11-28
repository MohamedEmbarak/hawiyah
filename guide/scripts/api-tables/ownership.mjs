// Which page documents each component of the four installed adapters. An export counts when it is
//   vanilla  a function create<Name> (a controller factory; enhance() is not one);
//   react    a value whose type is callable and whose name starts with an
//            upper-case letter (a function or exotic component);
//   vue      a value whose type is constructable and whose name starts with an
//            upper-case letter (a DefineComponent);
//   angular  a class with a static ɵcmp or ɵdir declaration and a selector (an
//            abstract base class without a selector is not used in a template).
// Every such export must be a target of exactly one page id of components.json
// (targets.mjs: the documented export or a further one) or an entry of
// UNOWNED_EXPORTS, which is the lead's list (approvedBy and a reason).
import { angularClassMembers, classDeclaration } from './declarations-angular.mjs';
import { FRAMEWORKS } from './members.mjs';
import { resolveExport } from './program.mjs';
import { targetsFor } from './targets.mjs';

/** The component, directive and controller factory exports of each adapter, sorted. */
export function componentExports(context) {
  const { ts, checker, modules } = context;
  const out = {};
  for (const framework of FRAMEWORKS) {
    const names = [];
    for (const name of modules[framework].exports.keys()) {
      const symbol = resolveExport(context, framework, name);
      if (!symbol || !(symbol.flags & ts.SymbolFlags.Value)) continue;
      const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
      if (framework === 'vanilla') {
        if (/^create[A-Z]/.test(name) && symbol.flags & ts.SymbolFlags.Function) names.push(name);
      } else if (framework === 'angular') {
        const cls = classDeclaration(context, symbol);
        const read = cls ? angularClassMembers(context, cls) : null;
        if (read?.declared && read.selector) names.push(name);
      } else if (/^[A-Z]/.test(name) && declaration) {
        const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
        const signatures = checker.getSignaturesOfType(type, framework === 'react' ? ts.SignatureKind.Call : ts.SignatureKind.Construct);
        if (signatures.length) names.push(name);
      }
    }
    out[framework] = names.sort();
  }
  return out;
}

/**
 * @param {any} context createDeclarationProgram() result
 * @param {string[]} ids the page ids of components.json
 * @param {{ framework: string, name: string, approvedBy?: string, reason?: string }[]} unowned UNOWNED_EXPORTS
 * @returns {{ exports: Record<string, string[]>, owners: Map<string, string[]>, problems: string[] }}
 */
export function checkOwnership(context, ids, unowned = []) {
  const exists = (framework, name) => resolveExport(context, framework, name) !== null;
  const owners = new Map();
  for (const id of ids) {
    const targets = targetsFor(id, exists);
    for (const framework of FRAMEWORKS) {
      for (const name of new Set(targets[framework])) {
        const key = `${framework} ${name}`;
        if (!owners.has(key)) owners.set(key, []);
        owners.get(key).push(id);
      }
    }
  }
  const exports = componentExports(context);
  const listed = new Map(unowned.map((entry) => [`${entry.framework} ${entry.name}`, entry]));
  const problems = [];
  for (const framework of FRAMEWORKS) {
    for (const name of exports[framework]) {
      const key = `${framework} ${name}`;
      const pages = owners.get(key) ?? [];
      if (pages.length > 1) problems.push(`@hawiyah/${framework} ${name} is a target of ${pages.length} pages (${pages.join(', ')}); one page documents it`);
      if (pages.length === 1 && listed.has(key)) problems.push(`UNOWNED_EXPORTS lists @hawiyah/${framework} ${name}, which the page ${pages[0]} documents`);
      if (pages.length === 0 && !listed.has(key)) problems.push(`@hawiyah/${framework} ${name} is documented by no page: name it in targets.mjs (TARGET_OVERRIDES) or propose an UNOWNED_EXPORTS entry to the lead`);
    }
  }
  for (const [key, entry] of listed) {
    const [framework, name] = key.split(' ');
    if (!exports[framework]?.includes(name)) problems.push(`UNOWNED_EXPORTS lists @hawiyah/${framework} ${name}, which is not a component, directive or controller factory of the installed package`);
    if (!entry.approvedBy?.trim?.() || !entry.reason?.trim?.()) problems.push(`UNOWNED_EXPORTS entry ${key} needs approvedBy and a reason`);
  }
  return { exports, owners, problems };
}
