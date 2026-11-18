// Editor compilers (editor.compilers): writes <runtimeDir>/compilers/ and adds one
// entry per file to <runtimeDir>/manifest.json, with the field names HWREG-R8 reads.
//
//   compilers/sucrase.js                   esbuild ESM bundle of sucrase (bundled)
//   compilers/compiler-sfc.esm-browser.js  @vue/compiler-sfc dist file (published)
//   compilers/typescript.js                typescript lib/typescript.js (published)
//   compilers/compiler.mjs                 @angular/compiler fesm2022 (published)
//   compilers/es-module-lexer.js           es-module-lexer dist/lexer.js (published)
//   compilers/licenses/<package>/<file>    the licence files of every package above
//                                          and of the packages bundled into sucrase.js
//
// The files are loaded by the editor's compile worker (sucrase, compiler-sfc,
// typescript, es-module-lexer) and by an edited Angular run in the frame
// (compiler.mjs, JIT). Runs after step 60, which writes runtime/manifest.json.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { build } from 'esbuild';
import { lockInfo, manifestEntry, manifestOf, manifestText, readLock } from '../runtime/manifest.mjs';

/** Directory under runtime/ that this step owns. */
export const COMPILERS_DIR = 'compilers';

/** Published files served unmodified (path under compilers/, package, file inside the package). */
export const PUBLISHED_COMPILERS = Object.freeze([
  { path: 'compiler-sfc.esm-browser.js', package: '@vue/compiler-sfc', file: 'dist/compiler-sfc.esm-browser.js' },
  { path: 'typescript.js', package: 'typescript', file: 'lib/typescript.js' },
  { path: 'compiler.mjs', package: '@angular/compiler', file: 'fesm2022/compiler.mjs' },
  { path: 'es-module-lexer.js', package: 'es-module-lexer', file: 'dist/lexer.js' },
]);

/** The bundled compiler. */
export const SUCRASE = Object.freeze({ path: 'sucrase.js', package: 'sucrase' });

/** Names of licence and notice files copied from a package root. */
const LICENCE_FILE = /^(?:LICEN[CS]E|NOTICE|COPYING|ThirdPartyNoticeText)(?:\.(?:md|txt))?$/i;

/** The package that contains a node_modules path (scoped or not). */
export function packageOfInput(input) {
  const parts = input.split(/[\\/]/);
  const index = parts.lastIndexOf('node_modules');
  if (index < 0) return null;
  const first = parts[index + 1];
  if (!first) return null;
  const scoped = first.startsWith('@');
  // A file directly in node_modules (the stdin entry) belongs to no package.
  if (parts.length <= index + (scoped ? 3 : 2)) return null;
  return scoped ? `${first}/${parts[index + 2]}` : first;
}

function packageVersion(nodeModules, name) {
  return JSON.parse(readFileSync(join(nodeModules, name, 'package.json'), 'utf8')).version;
}

function licenceFiles(nodeModules, name) {
  const dir = join(nodeModules, name);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((file) => LICENCE_FILE.test(file)).sort();
}

/** The ESM bundle of sucrase: { code, inputs: [package names besides sucrase] }. */
export async function bundleSucrase(nodeModules) {
  const result = await build({
    stdin: { contents: "export { transform, getVersion } from 'sucrase';\n", resolveDir: nodeModules, sourcefile: 'sucrase-entry.js' },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    minify: true,
    legalComments: 'inline',
    metafile: true,
    logLevel: 'silent',
    define: { 'process.env.NODE_ENV': '"production"' },
  });
  if (result.warnings.length > 0) {
    throw new Error(`editor compilers: esbuild warnings while bundling sucrase: ${result.warnings.map((w) => w.text).join('; ')}`);
  }
  const code = result.outputFiles[0]?.text;
  if (!code) throw new Error('editor compilers: the sucrase bundle is empty');
  const packages = new Set();
  for (const input of Object.keys(result.metafile.inputs)) {
    const name = packageOfInput(input);
    if (name) packages.add(name);
  }
  if (!packages.has('sucrase')) throw new Error('editor compilers: the sucrase bundle has no sucrase input');
  packages.delete('sucrase');
  return { code, inputs: [...packages].sort() };
}

function esbuildTool(nodeModules) {
  return `esbuild ${packageVersion(nodeModules, 'esbuild')}`;
}

/**
 * Writes runtime/compilers/ and merges its entries into runtime/manifest.json
 * (entries of an earlier run under compilers/ are replaced). Returns
 * { entries, bytes }.
 */
export async function buildCompilers({ guideDir, runtimeDir }) {
  const nodeModules = join(guideDir, 'node_modules');
  const manifestFile = join(runtimeDir, 'manifest.json');
  if (!existsSync(manifestFile)) throw new Error(`editor compilers: ${manifestFile} does not exist; build step 60-runtime writes it`);
  const lock = readLock(guideDir);
  const outDir = join(runtimeDir, COMPILERS_DIR);
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  const entries = [];
  const write = (path, data) => {
    const target = join(outDir, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, data);
    return `${COMPILERS_DIR}/${path}`;
  };
  const info = (name) => {
    const entry = lockInfo(lock, name);
    const installed = packageVersion(nodeModules, name);
    if (installed !== entry.version) throw new Error(`editor compilers: ${name} ${installed} differs from the lockfile ${entry.version}`);
    return { pkg: name, version: entry.version, integrity: entry.integrity };
  };
  const licensed = new Set();
  const licences = (name) => {
    if (licensed.has(name)) return;
    licensed.add(name);
    const files = licenceFiles(nodeModules, name);
    if (files.length === 0) throw new Error(`editor compilers: ${name} has no licence file`);
    for (const file of files) {
      const data = readFileSync(join(nodeModules, name, file));
      const path = write(`licenses/${name}/${file}`, data);
      entries.push(manifestEntry({ path, data, source: 'published', ...info(name), file }));
    }
  };

  for (const item of PUBLISHED_COMPILERS) {
    const data = readFileSync(join(nodeModules, item.package, item.file));
    const path = write(item.path, data);
    entries.push(manifestEntry({ path, data, source: 'published', ...info(item.package), file: item.file }));
    licences(item.package);
  }

  const sucrase = await bundleSucrase(nodeModules);
  const inputs = sucrase.inputs.map((name) => {
    const entry = info(name);
    return { package: name, version: entry.version, packageIntegrity: entry.integrity };
  });
  const sucrasePath = write(SUCRASE.path, sucrase.code);
  entries.push(manifestEntry({ path: sucrasePath, data: sucrase.code, source: 'bundled', ...info(SUCRASE.package), tool: esbuildTool(nodeModules), inputs }));
  licences(SUCRASE.package);
  for (const name of sucrase.inputs) licences(name);

  const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
  const kept = (Array.isArray(manifest.entries) ? manifest.entries : []).filter((entry) => !String(entry.path).startsWith(`${COMPILERS_DIR}/`));
  writeFileSync(manifestFile, manifestText(manifestOf([...kept, ...entries])));
  const bytes = entries.reduce((sum, entry) => sum + entry.bytes, 0);
  return { entries, bytes };
}

/** Path of a runtime file relative to runtimeDir with forward slashes. */
export function runtimeRelative(runtimeDir, file) {
  return relative(runtimeDir, file).split(sep).join('/');
}
