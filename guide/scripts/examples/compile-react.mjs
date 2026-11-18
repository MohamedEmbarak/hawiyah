// React examples: one TypeScript program over every generated Example.tsx (and its
// main.tsx) with the installed typescript (strict, jsx react-jsx, moduleResolution
// bundler, types react and react-dom, noEmit); any diagnostic fails (HWC-R1). Then
// an esbuild transform per file (loader tsx, jsx automatic, format esm, es2022).
import { transform } from 'esbuild';
import { join, relative, sep } from 'node:path';
import ts from 'typescript';
import { resetDir, rewriteRelativeImports, writeFile } from './modules.mjs';
import { REACT_MAIN } from './wrap.mjs';

export const REACT_HOST = '<div id="app"></div>';

export const REACT_TSCONFIG = {
  compilerOptions: {
    strict: true,
    jsx: 'react-jsx',
    module: 'esnext',
    moduleResolution: 'bundler',
    target: 'es2022',
    lib: ['es2022', 'dom', 'dom.iterable'],
    types: ['react', 'react-dom'],
    noEmit: true,
    isolatedModules: true,
    forceConsistentCasingInFileNames: true,
  },
  include: ['**/*.tsx'],
};

const TRANSFORM = { loader: 'tsx', jsx: 'automatic', format: 'esm', target: 'es2022' };

/**
 * items: [{ key, dir: '<id>/<lang>/<example>', source }]. Writes them under
 * workDir, type-checks them together and transforms the clean ones.
 * Returns Map key -> { diagnostics: [{ file, line, message }], compiled | null }.
 */
export async function compileReact(items, { workDir }) {
  resetDir(workDir);
  writeFile(join(workDir, 'tsconfig.json'), `${JSON.stringify(REACT_TSCONFIG, null, 2)}\n`);
  const byPath = new Map();
  for (const item of items) {
    const example = join(workDir, item.dir, 'Example.tsx');
    writeFile(example, item.source);
    writeFile(join(workDir, item.dir, 'main.tsx'), REACT_MAIN);
    byPath.set(example, { item, file: 'Example.tsx' });
    byPath.set(join(workDir, item.dir, 'main.tsx'), { item, file: 'main.tsx' });
  }
  const results = new Map(items.map((item) => [item.key, { diagnostics: [], compiled: null }]));
  if (!items.length) return results;

  const configPath = join(workDir, 'tsconfig.json');
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, workDir, undefined, configPath);
  const program = ts.createProgram(parsed.fileNames, parsed.options);
  const global = [];
  for (const diagnostic of ts.getPreEmitDiagnostics(program)) {
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n').replace(/\s*\n\s*/g, ' ');
    const owner = diagnostic.file ? byPath.get(diagnostic.file.fileName.split('/').join(sep)) : undefined;
    if (!owner) {
      global.push(`TS${diagnostic.code} ${diagnostic.file ? relative(workDir, diagnostic.file.fileName) : ''}: ${message}`);
      continue;
    }
    const line = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start ?? 0).line + 1;
    results.get(owner.item.key).diagnostics.push({ file: owner.file, line, message: `TS${diagnostic.code}: ${message}` });
  }
  if (global.length) {
    // A diagnostic outside the examples (configuration, declarations) fails every React example.
    for (const result of results.values()) result.diagnostics.push(...global.map((message) => ({ file: 'Example.tsx', line: 1, message })));
  }

  for (const item of items) {
    const result = results.get(item.key);
    if (result.diagnostics.length) continue;
    try {
      const example = await transform(item.source, { ...TRANSFORM, sourcefile: 'Example.tsx' });
      const main = await transform(REACT_MAIN, { ...TRANSFORM, sourcefile: 'main.tsx' });
      result.compiled = {
        host: REACT_HOST,
        entry: 'main.js',
        modules: { 'main.js': rewriteRelativeImports(main.code), 'Example.js': example.code },
      };
    } catch (error) {
      result.diagnostics.push({ file: 'Example.tsx', line: error.errors?.[0]?.location?.line ?? 1, message: `esbuild: ${error.errors?.[0]?.text ?? error.message}` });
    }
  }
  return results;
}
