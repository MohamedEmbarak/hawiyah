// Bundle-fallback (classic) form of a compiled example (editor.fallback.projectCode):
// the example's modules bundled by esbuild into one classic script, with every bare
// import mapped to globalThis.HawiyahRuntime.modules['<specifier>'], which the
// runtime bundle of the framework (runtime/bundles/<framework>.js) defines.
import { build } from 'esbuild';
import { PROJECT_PREFIX } from './modules.mjs';

const RUNTIME = 'hawiyah-runtime';
const PROJECT = 'hawiyah-project';

/** Source of the shim module that stands for a bare specifier. */
export function runtimeShim(specifier) {
  const name = JSON.stringify(specifier);
  return [
    'var runtime = globalThis.HawiyahRuntime;',
    `if (!runtime || !runtime.modules || !(${name} in runtime.modules)) throw new Error("HawiyahRuntime has no module " + ${name});`,
    `var ns = runtime.modules[${name}];`,
    'var copy = Object.defineProperty({}, "__esModule", { value: true });',
    'for (var key in ns) copy[key] = ns[key];',
    'module.exports = copy;',
    '',
  ].join('\n');
}

/**
 * compiled: { entry, modules }. Returns the classic script text (IIFE, es2022).
 * Project modules are resolved from the payload, never from disk.
 */
export async function classicBundle(compiled) {
  const plugin = {
    name: 'hawiyah-classic',
    setup(context) {
      context.onResolve({ filter: /.*/ }, (args) => {
        if (args.kind === 'entry-point') return { path: compiled.entry, namespace: PROJECT };
        if (args.path.startsWith(PROJECT_PREFIX)) return { path: args.path.slice(PROJECT_PREFIX.length), namespace: PROJECT };
        if (args.path.startsWith('./')) return { path: args.path.slice(2).replace(/(?:\.[jt]sx?)?$/, '.js'), namespace: PROJECT };
        return { path: args.path, namespace: RUNTIME };
      });
      context.onLoad({ filter: /.*/, namespace: PROJECT }, (args) => {
        if (!(args.path in compiled.modules)) return { errors: [{ text: `module ${args.path} is not in the payload` }] };
        return { contents: compiled.modules[args.path], loader: 'js' };
      });
      context.onLoad({ filter: /.*/, namespace: RUNTIME }, (args) => ({ contents: runtimeShim(args.path), loader: 'js' }));
    },
  };
  const result = await build({
    entryPoints: [compiled.entry],
    bundle: true,
    write: false,
    format: 'iife',
    target: 'es2022',
    platform: 'browser',
    charset: 'utf8',
    legalComments: 'none',
    logLevel: 'silent',
    plugins: [plugin],
  });
  return result.outputFiles[0].text;
}
