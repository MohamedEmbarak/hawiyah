// ESM facades of rxjs (editor.runtimeFiles.bundled). The ESM files of rxjs 7 use
// extensionless relative imports, which a browser cannot resolve, so esbuild
// bundles the two entries the Angular packages import (rxjs, rxjs/operators)
// from the installed package into rxjs.js and operators.js. Code splitting keeps
// one copy of the shared classes (Observable, Subject, ...) in a common chunk, so
// both entries keep the identity of those classes. Export names are the ones
// Node enumerates for each entry, checked after the build.
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { build } from 'esbuild';

export const RXJS_ENTRIES = Object.freeze([
  { file: 'rxjs.js', entry: 'rxjs' },
  { file: 'operators.js', entry: 'rxjs/operators' },
]);

/** Export names of an rxjs entry as Node enumerates them (CommonJS build). */
export function rxjsExportNames(guideDir, entry) {
  const require = createRequire(join(guideDir, 'package.json'));
  return Object.keys(require(entry)).filter((name) => name !== '__esModule' && name !== 'default').sort();
}

/** Builds rxjs.js, operators.js and their shared chunk. Returns { files: [{ file, text }], names }. */
export async function bundleRxjs({ guideDir }) {
  const result = await build({
    entryPoints: Object.fromEntries(RXJS_ENTRIES.map(({ file, entry }) => [file.replace(/\.js$/, ''), entry])),
    absWorkingDir: guideDir,
    nodePaths: [join(guideDir, 'node_modules')],
    bundle: true,
    splitting: true,
    write: false,
    outdir: 'out',
    entryNames: '[name]',
    chunkNames: 'rxjs-shared-[hash]',
    format: 'esm',
    target: 'es2022',
    platform: 'browser',
    conditions: ['es2015'],
    minify: true,
    charset: 'utf8',
    legalComments: 'inline',
    logLevel: 'silent',
    metafile: true,
  });
  const files = result.outputFiles.map((output) => ({ file: output.path.replace(/^.*[\\/]out[\\/]/, ''), text: output.text }));
  const names = {};
  for (const { file, entry } of RXJS_ENTRIES) {
    const expected = rxjsExportNames(guideDir, entry);
    const output = Object.entries(result.metafile.outputs).find(([path]) => path.endsWith(`out/${file}`))?.[1];
    const actual = [...(output?.exports ?? [])].sort();
    const missing = expected.filter((name) => !actual.includes(name));
    if (missing.length) throw new Error(`runtime: ${file} lacks the rxjs exports ${missing.join(', ')}`);
    names[file] = actual;
  }
  return { files, names };
}
