// One TypeScript program over the declaration entry points of the four
// installed adapter packages (@hawiyah/vanilla, react, vue, angular). Every
// declaration reader of step 30 works on this program, so the files of each
// package and of its peer types (@types/react, vue, @angular/core) are parsed
// once per run.
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve, sep } from 'node:path';

const require = createRequire(import.meta.url);

/** The TypeScript compiler of the guide (devDependency typescript). */
export function loadTypeScript(nodeModules) {
  return require(join(nodeModules, 'typescript'));
}

/** Declaration entry ('types' of the '.' export) of an installed package. */
export function declarationEntry(nodeModules, name) {
  const dir = join(nodeModules, ...name.split('/'));
  const manifestFile = join(dir, 'package.json');
  if (!existsSync(manifestFile)) throw new Error(`api-tables: ${name} is not installed in ${nodeModules}`);
  const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
  const root = manifest.exports?.['.'];
  const types = (root && typeof root === 'object' && root.types) || manifest.types || manifest.typings;
  if (typeof types !== 'string') throw new Error(`api-tables: ${name} declares no types entry`);
  return resolve(dir, types);
}

export const ADAPTER_PACKAGES = {
  vanilla: '@hawiyah/vanilla',
  react: '@hawiyah/react',
  vue: '@hawiyah/vue',
  angular: '@hawiyah/angular',
};

/**
 * Creates the program and returns the checker and the module symbol of each adapter.
 * @param {string} nodeModules Absolute path of guide/node_modules (or a fixture copy).
 */
export function createDeclarationProgram(nodeModules) {
  const ts = loadTypeScript(nodeModules);
  const entries = Object.fromEntries(Object.entries(ADAPTER_PACKAGES).map(([framework, name]) => [framework, declarationEntry(nodeModules, name)]));
  const program = ts.createProgram({
    rootNames: Object.values(entries),
    options: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      strict: true,
      skipLibCheck: true,
      noEmit: true,
      types: [],
      jsx: ts.JsxEmit.ReactJSX,
      baseUrl: dirname(nodeModules),
    },
  });
  const checker = program.getTypeChecker();
  const modules = {};
  for (const [framework, file] of Object.entries(entries)) {
    const source = program.getSourceFile(file);
    if (!source) throw new Error(`api-tables: ${file} could not be read`);
    const symbol = checker.getSymbolAtLocation(source);
    if (!symbol) throw new Error(`api-tables: ${file} is not a module`);
    modules[framework] = { file, symbol, exports: new Map(checker.getExportsOfModule(symbol).map((item) => [item.name, item])) };
  }
  return { ts, program, checker, modules, nodeModules };
}

/** Whether a file path lies inside node_modules/<packageName>/. */
export function isInPackage(fileName, packageName) {
  const normal = fileName.split(sep).join('/');
  return normal.includes(`/node_modules/${packageName}/`);
}

/** The symbol behind an export, following aliases (export { X } from './x.js'). */
export function resolveExport(context, framework, name) {
  const { ts, checker, modules } = context;
  const symbol = modules[framework].exports.get(name);
  if (!symbol) return null;
  return symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
}
