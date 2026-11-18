// Export names of @hawiyah/react and @hawiyah/vue and the selectors of the
// standalone components and directives of @hawiyah/angular, read from the
// installed declarations with the TypeScript compiler API. Nothing is hard-coded:
// a component missing from the installed package is unknown to the guide.
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import ts from 'typescript';

const cache = new Map();

/** Directory of an installed package, resolved from `fromDir` (the guide directory). */
export function packageDir(name, fromDir) {
  // Not every package exports ./package.json, so walk the node_modules directories.
  const require = createRequire(join(fromDir, 'package.json'));
  for (const base of require.resolve.paths(name) ?? []) {
    const dir = join(base, name);
    if (existsSync(join(dir, 'package.json'))) return dir;
  }
  throw new Error(`${name} is not installed (resolved from ${fromDir})`);
}

export function packageVersion(name, fromDir) {
  return JSON.parse(readFileSync(join(packageDir(name, fromDir), 'package.json'), 'utf8')).version;
}

function declarationFile(name, fromDir) {
  const dir = packageDir(name, fromDir);
  const manifest = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
  const root = manifest.exports?.['.'];
  const types = (root && typeof root === 'object' ? root.types : undefined) ?? manifest.types;
  if (!types) throw new Error(`${name} declares no types entry`);
  return join(dir, types);
}

/** Value export names (components, functions, constants) of a package entry declaration. */
export function valueExports(name, fromDir) {
  const key = `values:${name}:${fromDir}`;
  if (cache.has(key)) return cache.get(key);
  const file = declarationFile(name, fromDir);
  const program = ts.createProgram([file], {
    noEmit: true, skipLibCheck: true, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler,
    target: ts.ScriptTarget.ES2022, types: [],
  });
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(file);
  const moduleSymbol = source && checker.getSymbolAtLocation(source);
  if (!moduleSymbol) throw new Error(`${file} is not a module`);
  const names = new Set();
  for (const symbol of checker.getExportsOfModule(moduleSymbol)) {
    const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
    if (target.flags & ts.SymbolFlags.Value) names.add(symbol.getName());
  }
  cache.set(key, names);
  return names;
}

export const reactExports = (fromDir) => valueExports('@hawiyah/react', fromDir);
export const vueExports = (fromDir) => valueExports('@hawiyah/vue', fromDir);

function literalText(node) {
  if (!node) return null;
  if (ts.isLiteralTypeNode(node)) {
    const literal = node.literal;
    if (ts.isStringLiteral(literal)) return literal.text;
    if (literal.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (literal.kind === ts.SyntaxKind.FalseKeyword) return false;
  }
  return null;
}

function requiredInputs(node) {
  const required = [];
  if (!node || !ts.isTypeLiteralNode(node)) return required;
  for (const member of node.members) {
    if (!ts.isPropertySignature(member) || !member.type || !ts.isTypeLiteralNode(member.type)) continue;
    let alias = null;
    let isRequired = false;
    for (const inner of member.type.members) {
      if (!ts.isPropertySignature(inner) || !inner.name) continue;
      const key = inner.name.getText().replace(/^["']|["']$/g, '');
      if (key === 'alias') alias = literalText(inner.type);
      if (key === 'required') isRequired = literalText(inner.type) === true;
    }
    if (isRequired) required.push(alias ?? member.name.getText().replace(/^["']|["']$/g, ''));
  }
  return required;
}

/**
 * Standalone components and directives exported by @hawiyah/angular:
 * [{ className, selector, kind: 'component' | 'directive', requiredInputs }].
 * Selectors come from the ɵcmp and ɵdir declarations; classes without a selector
 * (abstract bases) are left out.
 */
export function angularDeclarations(fromDir) {
  const key = `angular:${fromDir}`;
  if (cache.has(key)) return cache.get(key);
  const file = declarationFile('@hawiyah/angular', fromDir);
  const text = readFileSync(file, 'utf8');
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.ES2022, true);
  const exported = new Set();
  for (const statement of source.statements) {
    if (ts.isClassDeclaration(statement) && statement.name && statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
      exported.add(statement.name.text);
    }
    if (ts.isExportDeclaration(statement) && !statement.isTypeOnly && !statement.moduleSpecifier && statement.exportClause && ts.isNamedExports(statement.exportClause)) {
      for (const element of statement.exportClause.elements) if (!element.isTypeOnly) exported.add(element.name.text);
    }
  }
  const declarations = [];
  for (const statement of source.statements) {
    if (!ts.isClassDeclaration(statement) || !statement.name || !exported.has(statement.name.text)) continue;
    for (const member of statement.members) {
      if (!ts.isPropertyDeclaration(member) || !member.name || !member.type) continue;
      const name = member.name.getText();
      if (name !== 'ɵcmp' && name !== 'ɵdir') continue;
      if (!ts.isTypeReferenceNode(member.type) || !member.type.typeArguments) continue;
      const args = member.type.typeArguments;
      const selector = literalText(args[1]);
      const standalone = literalText(args[7]) === true;
      if (typeof selector !== 'string' || !standalone) continue;
      declarations.push({
        className: statement.name.text,
        selector,
        kind: name === 'ɵcmp' ? 'component' : 'directive',
        requiredInputs: requiredInputs(args[3]),
      });
    }
  }
  cache.set(key, declarations);
  return declarations;
}

/** Controller names that enhance() selects: the [data-hw="<name>"] selectors of the installed @hawiyah/vanilla. */
export function vanillaControllers(fromDir) {
  const key = `vanilla:${fromDir}`;
  if (cache.has(key)) return cache.get(key);
  const text = readFileSync(join(packageDir('@hawiyah/vanilla', fromDir), 'dist', 'index.js'), 'utf8');
  const names = new Set();
  for (const match of text.matchAll(/\[data-hw=["']([a-z][a-z0-9-]*)["']\]/g)) names.add(match[1]);
  // enhance() builds its selector from the keys of the factory table.
  const table = /const factories = \{([\s\S]*?)\n\};/.exec(text);
  if (table) {
    for (const match of table[1].matchAll(/(?:^|[,{\s])(?:'([a-z][a-z0-9-]*)'|([a-z][a-zA-Z0-9]*))\s*:/g)) names.add(match[1] ?? match[2]);
  }
  if (names.size === 0) throw new Error('no data-hw controller selector found in @hawiyah/vanilla/dist/index.js');
  cache.set(key, names);
  return names;
}

/** Class selectors (without the dot) of the installed @hawiyah/styles/dist/styles.css that start with hw-. */
export function styleClasses(fromDir) {
  const key = `styles:${fromDir}`;
  if (cache.has(key)) return cache.get(key);
  const css = readFileSync(join(packageDir('@hawiyah/styles', fromDir), 'dist', 'styles.css'), 'utf8');
  const names = new Set();
  for (const match of css.matchAll(/\.(hw-[A-Za-z0-9_-]+)/g)) names.add(match[1]);
  cache.set(key, names);
  return names;
}
