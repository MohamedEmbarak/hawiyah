// The published JavaScript of an installed adapter package, parsed with the
// TypeScript parser (no evaluation): the default readers of step 30
// (defaults-react.mjs, defaults-vue.mjs, defaults-angular.mjs, slots-vue.mjs)
// find an export's declaration here and follow local and imported names
// across the package's own files.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { typescript } from './types.mjs';

function jsFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...jsFiles(path));
    else if (/\.(?:m?js)$/.test(entry.name)) out.push(path);
  }
  return out;
}

/** The JavaScript entry ('import' or 'default' of the '.' export) of an installed package. */
export function javascriptEntry(nodeModules, name) {
  const dir = join(nodeModules, ...name.split('/'));
  const manifest = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
  const root = manifest.exports?.['.'];
  const entry = (root && typeof root === 'object' && (root.import ?? root.default)) || manifest.module || manifest.main;
  if (typeof entry !== 'string') throw new Error(`api-tables: ${name} declares no JavaScript entry`);
  return resolve(dir, entry);
}

function moduleOf(ts, file) {
  const text = readFileSync(file, 'utf8');
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.ES2022, true, ts.ScriptKind.JS);
  const imports = new Map();
  const exports = new Map();
  const stars = [];
  const declarations = new Map();
  const target = (specifier) => resolve(dirname(file), specifier);
  for (const statement of source.statements) {
    const exported = statement.modifiers?.some((item) => item.kind === ts.SyntaxKind.ExportKeyword);
    if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
      const from = statement.moduleSpecifier.text;
      const bindings = statement.importClause?.namedBindings;
      if (bindings && ts.isNamedImports(bindings)) {
        for (const item of bindings.elements) imports.set(item.name.text, { from, name: (item.propertyName ?? item.name).text });
      }
      if (statement.importClause?.name) imports.set(statement.importClause.name.text, { from, name: 'default' });
    } else if (ts.isExportDeclaration(statement)) {
      const from = statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier) ? statement.moduleSpecifier.text : null;
      if (!statement.exportClause && from) stars.push(from);
      else if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
        for (const item of statement.exportClause.elements) {
          exports.set(item.name.text, { from, name: (item.propertyName ?? item.name).text });
        }
      }
    } else if (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) {
      if (statement.name) {
        declarations.set(statement.name.text, statement);
        if (exported) exports.set(statement.name.text, { from: null, name: statement.name.text });
      }
    } else if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isObjectBindingPattern(declaration.name)) {
          // const { a: _a, ...rest } = object: each bound name is declared by its binding element.
          for (const element of declaration.name.elements) if (ts.isIdentifier(element.name)) declarations.set(element.name.text, element);
          continue;
        }
        if (!ts.isIdentifier(declaration.name)) continue;
        declarations.set(declaration.name.text, declaration);
        if (exported) exports.set(declaration.name.text, { from: null, name: declaration.name.text });
      }
    }
  }
  return { file, source, imports, exports, stars, declarations, target };
}

/**
 * Parses every JavaScript file below the package's entry directory.
 * @returns {{ ts: any, entry: string, modules: Map<string, any>, package: string }}
 */
export function loadPublished(nodeModules, packageName) {
  const ts = typescript();
  const entry = javascriptEntry(nodeModules, packageName);
  const modules = new Map();
  for (const file of jsFiles(dirname(entry))) modules.set(file, moduleOf(ts, file));
  if (!modules.has(entry)) throw new Error(`api-tables: ${entry} was not parsed`);
  return { ts, entry, modules, package: packageName, root: join(nodeModules, ...packageName.split('/')) };
}

/** Where a node stands in the published package: { file, line, text } for the fact sheets. */
export function sourceOf(published, module, node) {
  const { line } = module.source.getLineAndCharacterOfPosition(node.getStart());
  const file = relative(published.root, module.file).split('\\').join('/');
  return { file: `${published.package}/${file}`, line: line + 1, text: node.getText().replace(/\s+/g, ' ').slice(0, 160) };
}

/** The local declaration behind an exported name of a module: { module, node } or null. */
export function resolveExported(published, file, name, seen = new Set()) {
  const key = `${file}#${name}`;
  if (seen.has(key)) return null;
  seen.add(key);
  const module = published.modules.get(file);
  if (!module) return null;
  const entry = module.exports.get(name);
  if (entry) {
    if (entry.from) return resolveExported(published, module.target(entry.from), entry.name, seen);
    return resolveLocal(published, module, entry.name, seen);
  }
  for (const from of module.stars) {
    const found = resolveExported(published, module.target(from), name, seen);
    if (found) return found;
  }
  return null;
}

/** The declaration of a name in a module's scope (local or imported from a file of the package). */
export function resolveLocal(published, module, name, seen = new Set()) {
  const node = module.declarations.get(name);
  if (node) return { module, node };
  const imported = module.imports.get(name);
  if (imported && imported.from.startsWith('.')) {
    const file = module.target(imported.from);
    if (existsSync(file)) return resolveExported(published, file, imported.name, seen);
  }
  return null;
}

/** The declaration behind an export of the package entry. */
export function resolvePackageExport(published, name) {
  return resolveExported(published, published.entry, name);
}

/** Follows an identifier expression to its declaration in a module, else null. */
export function followIdentifier(published, module, node) {
  const { ts } = published;
  if (!node || !ts.isIdentifier(node)) return null;
  return resolveLocal(published, module, node.text);
}

/** The function behind a declaration: a function declaration, or a variable initialised with a function or arrow. */
export function functionOf(ts, node) {
  if (!node) return null;
  if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) return node;
  if (ts.isVariableDeclaration(node) && node.initializer) return functionOf(ts, node.initializer);
  if (ts.isParenthesizedExpression(node)) return functionOf(ts, node.expression);
  return null;
}

/** Return expressions of a function body (an arrow with an expression body returns that expression). */
export function returnedExpressions(ts, fn) {
  if (!fn.body) return [];
  if (!ts.isBlock(fn.body)) return [fn.body];
  const out = [];
  const visit = (node) => {
    if (node !== fn.body && (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node))) return;
    if (ts.isReturnStatement(node) && node.expression) out.push(node.expression);
    ts.forEachChild(node, visit);
  };
  ts.forEachChild(fn.body, visit);
  return out;
}

/** A property of an object literal by name, or null. */
export function propertyOf(ts, object, name) {
  if (!object || !ts.isObjectLiteralExpression(object)) return null;
  for (const property of object.properties) {
    const key = property.name && (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) ? property.name.text : null;
    if (key === name) return property;
  }
  return null;
}
