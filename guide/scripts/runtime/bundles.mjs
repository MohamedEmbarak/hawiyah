// Fallback runtime bundles (editor.fallback.bundles): one classic IIFE per
// framework, built by esbuild from the runtime files already written to
// <browserDir>/runtime/ (the same files the import map serves). Each bundle
// defines globalThis.HawiyahRuntime = { modules: { '<specifier>': namespace },
// define } where define(name, deps, factory) registers a project module.
import { join } from 'node:path';
import { build } from 'esbuild';

/** The @hawiyah package a framework's bundle is recorded under in the manifest. */
export const BUNDLE_PACKAGES = Object.freeze({
  vanilla: '@hawiyah/vanilla',
  react: '@hawiyah/react',
  vue: '@hawiyah/vue',
  angular: '@hawiyah/angular',
});

/** The loader part of every bundle (kept small and readable). */
export const DEFINE_SOURCE = `
function hawiyahRequire(name) {
  if (!(name in modules)) throw new Error('HawiyahRuntime has no module ' + name);
  return modules[name];
}
function define(name, deps, factory) {
  if (typeof name !== 'string' || !Array.isArray(deps) || typeof factory !== 'function') throw new TypeError('define(name, deps, factory)');
  var exports = {};
  var args = deps.map(function (dep) { return dep === 'exports' ? exports : hawiyahRequire(dep); });
  var result = factory.apply(undefined, args);
  modules[name] = deps.indexOf('exports') < 0 && result !== undefined ? result : exports;
  return modules[name];
}
`;

/** Entry source of a framework bundle. */
export function bundleEntrySource(specifiers) {
  const lines = specifiers.map((specifier, index) => `import * as m${index} from ${JSON.stringify(specifier)};`);
  lines.push('var modules = Object.create(null);');
  specifiers.forEach((specifier, index) => lines.push(`modules[${JSON.stringify(specifier)}] = m${index};`));
  lines.push(DEFINE_SOURCE);
  lines.push('globalThis.HawiyahRuntime = { modules: modules, define: define };');
  return `${lines.join('\n')}\n`;
}

/**
 * Builds runtime/bundles/<framework>.js for every framework.
 * importMap: { '<specifier>': '<path relative to runtime/>' }.
 * Returns [{ framework, file, text, inputs: [paths relative to runtime/], metafile }].
 */
export async function buildBundles({ runtimeDir, frameworks, importMap, absWorkingDir = process.cwd() }) {
  const out = [];
  for (const [framework, specifiers] of Object.entries(frameworks)) {
    const plugin = {
      name: 'hawiyah-runtime-files',
      setup(context) {
        context.onResolve({ filter: /^[^./]/ }, (args) => {
          if (args.kind === 'entry-point') return undefined;
          const mapped = importMap[args.path];
          if (!mapped) return { errors: [{ text: `no runtime file for '${args.path}' (imported by ${args.importer || 'the entry'})` }] };
          return { path: join(runtimeDir, mapped) };
        });
      },
    };
    const result = await build({
      stdin: { contents: bundleEntrySource(specifiers), resolveDir: runtimeDir, sourcefile: `${framework}-bundle-entry.js`, loader: 'js' },
      bundle: true,
      write: false,
      format: 'iife',
      target: 'es2022',
      platform: 'browser',
      minify: true,
      charset: 'utf8',
      legalComments: 'eof',
      logLevel: 'silent',
      metafile: true,
      absWorkingDir,
      plugins: [plugin],
    });
    const inputs = Object.keys(result.metafile.inputs)
      .map((path) => path.replace(/\\/g, '/'))
      .filter((path) => !path.startsWith('<stdin>') && !path.includes('bundle-entry'))
      .map((path) => {
        const marker = '/runtime/';
        const at = path.lastIndexOf(marker);
        return at >= 0 ? path.slice(at + marker.length) : path;
      })
      .sort();
    out.push({ framework, file: `bundles/${framework}.js`, text: result.outputFiles[0].text, inputs, metafile: result.metafile });
  }
  return out;
}
