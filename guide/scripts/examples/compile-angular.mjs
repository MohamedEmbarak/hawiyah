// Angular examples. Each group gives two generated sources from one block: the
// native component the guide renders (src/generated/examples/<id>/<lang>/<example>.ts,
// written by write.mjs and compiled again by ng build) and the frame project
// (.cache/examples/angular/src/<id>/<lang>/<example>/{example.component.ts, main.ts}),
// compiled here with the installed ngc in full compilation mode with strict
// templates and every extended diagnostic as an error. Any diagnostic fails (HWC-A1);
// a missing required input is NG8008.
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { packageDir } from './exports.mjs';
import { resetDir, rewriteRelativeImports, writeFile } from './modules.mjs';
import { parseTscOutput, runNode } from './compile-vue.mjs';
import { ANGULAR_MAIN, FRAME_SELECTOR } from './wrap.mjs';

export const ANGULAR_HOST = `<${FRAME_SELECTOR}></${FRAME_SELECTOR}>`;

export const ANGULAR_TSCONFIG = {
  compilerOptions: {
    strict: true,
    noImplicitOverride: true,
    noPropertyAccessFromIndexSignature: true,
    noImplicitReturns: true,
    noFallthroughCasesInSwitch: true,
    skipLibCheck: true,
    isolatedModules: true,
    target: 'ES2022',
    module: 'ES2022',
    moduleResolution: 'bundler',
    lib: ['ES2022', 'dom'],
    types: [],
    rootDir: 'src',
    outDir: 'out',
    declaration: false,
    sourceMap: false,
    pretty: false,
  },
  angularCompilerOptions: {
    compilationMode: 'full',
    strictTemplates: true,
    strictInjectionParameters: true,
    strictInputAccessModifiers: true,
    extendedDiagnostics: { defaultCategory: 'error' },
  },
  include: ['src/**/*.ts'],
};

/**
 * items: [{ key, dir, source }] (source: the frame example.component.ts).
 * Returns Map key -> { diagnostics: [{ file, line, message }], compiled | null }.
 */
export async function compileAngular(items, { workDir, fromDir }) {
  resetDir(workDir);
  writeFile(join(workDir, 'tsconfig.json'), `${JSON.stringify(ANGULAR_TSCONFIG, null, 2)}\n`);
  const results = new Map(items.map((item) => [item.key, { diagnostics: [], compiled: null }]));
  const byPath = new Map();
  for (const item of items) {
    writeFile(join(workDir, 'src', item.dir, 'example.component.ts'), item.source);
    writeFile(join(workDir, 'src', item.dir, 'main.ts'), ANGULAR_MAIN);
    byPath.set(resolve(workDir, 'src', item.dir, 'example.component.ts'), { item, file: 'example.component.ts' });
    byPath.set(resolve(workDir, 'src', item.dir, 'main.ts'), { item, file: 'main.ts' });
  }
  if (!items.length) return results;

  const ngc = join(packageDir('@angular/compiler-cli', fromDir), 'bundles', 'src', 'bin', 'ngc.js');
  const run = await runNode([ngc, '-p', 'tsconfig.json'], workDir);
  const diagnostics = parseTscOutput(run.output);
  for (const diagnostic of diagnostics) {
    const owner = diagnostic.path ? byPath.get(resolve(workDir, diagnostic.path)) : undefined;
    if (owner) results.get(owner.item.key).diagnostics.push({ file: owner.file, line: diagnostic.line, message: diagnostic.message });
    else for (const result of results.values()) result.diagnostics.push({ file: 'example.component.ts', line: 1, message: `ngc: ${diagnostic.path ?? ''} ${diagnostic.message}` });
  }
  if (run.code !== 0 && diagnostics.length === 0) {
    const first = run.output.trim().split('\n').slice(0, 3).join(' ');
    for (const result of results.values()) result.diagnostics.push({ file: 'example.component.ts', line: 1, message: `ngc exited ${run.code}: ${first}` });
  }

  // ngc emits nothing when any file has an error: compile the clean examples again
  // on their own so that one failing group does not hide the output of the others.
  const clean = items.filter((item) => results.get(item.key).diagnostics.length === 0);
  if (run.code !== 0 && clean.length) {
    const config = { ...ANGULAR_TSCONFIG, include: undefined, files: clean.flatMap((item) => [`src/${item.dir}/example.component.ts`, `src/${item.dir}/main.ts`]) };
    writeFile(join(workDir, 'tsconfig.clean.json'), `${JSON.stringify(config, null, 2)}\n`);
    const again = await runNode([ngc, '-p', 'tsconfig.clean.json'], workDir);
    if (again.code !== 0) {
      for (const item of clean) results.get(item.key).diagnostics.push({ file: 'example.component.ts', line: 1, message: `ngc failed on the examples without findings: ${again.output.replace(/\u001b\[[0-9;]*m/g, '').trim().split('\n')[0]}` });
    }
  }

  for (const item of items) {
    const result = results.get(item.key);
    if (result.diagnostics.length) continue;
    const out = join(workDir, 'out', item.dir);
    const component = join(out, 'example.component.js');
    const main = join(out, 'main.js');
    if (!existsSync(component) || !existsSync(main)) {
      result.diagnostics.push({ file: 'example.component.ts', line: 1, message: 'ngc wrote no output for this example' });
      continue;
    }
    result.compiled = {
      host: ANGULAR_HOST,
      entry: 'main.js',
      modules: {
        'main.js': rewriteRelativeImports(readFileSync(main, 'utf8')),
        'example.component.js': readFileSync(component, 'utf8'),
      },
    };
  }
  return results;
}
