// Vue examples: @vue/compiler-sfc parse and compileScript (inlineTemplate, scope id
// from the group key), an esbuild transform of the TypeScript output, and vue-tsc
// --noEmit (strict) over every generated Example.vue; any error fails (HWC-U1).
import { compileScript, parse } from '@vue/compiler-sfc';
import { transform } from 'esbuild';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import { packageDir } from './exports.mjs';
import { resetDir, rewriteRelativeImports, writeFile } from './modules.mjs';
import { VUE_MAIN } from './wrap.mjs';

export const VUE_HOST = '<div id="app"></div>';

export const VUE_TSCONFIG = {
  compilerOptions: {
    strict: true,
    module: 'esnext',
    moduleResolution: 'bundler',
    target: 'es2022',
    lib: ['es2022', 'dom', 'dom.iterable'],
    types: [],
    jsx: 'preserve',
    noEmit: true,
    isolatedModules: true,
    forceConsistentCasingInFileNames: true,
  },
  vueCompilerOptions: { strictTemplates: true },
  include: ['**/*.vue', '**/*.ts'],
};

const TRANSFORM = { loader: 'ts', format: 'esm', target: 'es2022' };

export const scopeId = (key) => createHash('sha256').update(key).digest('hex').slice(0, 8);

/** Runs a Node CLI; resolves { code, output }. */
export function runNode(args, cwd) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    child.stdout.on('data', (chunk) => { output += chunk; });
    child.stderr.on('data', (chunk) => { output += chunk; });
    child.on('error', reject);
    child.on('close', (code) => resolvePromise({ code, output }));
  });
}

/**
 * Parses compiler output in either format: 'file(line,col): error TSnnnn: message'
 * (tsc, vue-tsc with --pretty false) or 'file:line:col - error NGnnnn: message'
 * (ngc, which formats its own diagnostics). Indented continuation lines up to the
 * first blank line belong to the message; the code frame after it is skipped.
 * ANSI colour codes are removed first.
 */
export function parseTscOutput(output) {
  const diagnostics = [];
  let open = false;
  // eslint-disable-next-line no-control-regex
  const plain = output.replace(/\u001b\[[0-9;]*m/g, '');
  for (const line of plain.split(/\r?\n/)) {
    const paren = /^(.+?)\((\d+),(\d+)\): error ((?:TS|NG)-?\d+): (.*)$/.exec(line);
    const dash = /^(.+?):(\d+):(\d+) - error ((?:TS|NG)-?\d+): (.*)$/.exec(line);
    const match = paren ?? dash;
    if (match) {
      diagnostics.push({ path: match[1], line: Number(match[2]), message: `${match[4]}: ${match[5]}` });
      open = true;
    } else if (line.trim() === '') {
      open = false;
    } else if (open && /^\s+\S/.test(line)) {
      diagnostics.at(-1).message += ` ${line.trim()}`;
    } else if (/^error (?:TS|NG)-?\d+/.test(line.trim())) {
      diagnostics.push({ path: null, line: 1, message: line.trim() });
      open = true;
    }
  }
  return diagnostics;
}

/**
 * items: [{ key, dir, source }]. Returns Map key -> { diagnostics, compiled | null }.
 */
export async function compileVue(items, { workDir, fromDir }) {
  resetDir(workDir);
  writeFile(join(workDir, 'tsconfig.json'), `${JSON.stringify(VUE_TSCONFIG, null, 2)}\n`);
  const results = new Map(items.map((item) => [item.key, { diagnostics: [], compiled: null }]));
  const byPath = new Map();
  for (const item of items) {
    writeFile(join(workDir, item.dir, 'Example.vue'), item.source);
    writeFile(join(workDir, item.dir, 'main.ts'), VUE_MAIN);
    byPath.set(resolve(workDir, item.dir, 'Example.vue'), { item, file: 'Example.vue' });
    byPath.set(resolve(workDir, item.dir, 'main.ts'), { item, file: 'main.ts' });
  }
  if (!items.length) return results;

  // compiler-sfc first: its errors are reported even when vue-tsc would also fail.
  const scripts = new Map();
  for (const item of items) {
    const result = results.get(item.key);
    const { descriptor, errors } = parse(item.source, { filename: 'Example.vue' });
    if (errors.length) {
      for (const error of errors) result.diagnostics.push({ file: 'Example.vue', line: error.loc?.start?.line ?? 1, message: `compiler-sfc: ${error.message}` });
      continue;
    }
    try {
      const script = compileScript(descriptor, { id: scopeId(item.key), inlineTemplate: true, isProd: true });
      scripts.set(item.key, script.content);
    } catch (error) {
      result.diagnostics.push({ file: 'Example.vue', line: error.loc?.start?.line ?? 1, message: `compiler-sfc: ${error.message.split('\n')[0]}` });
    }
  }

  const vueTsc = join(packageDir('vue-tsc', fromDir), 'bin', 'vue-tsc.js');
  const run = await runNode([vueTsc, '--noEmit', '--pretty', 'false', '-p', 'tsconfig.json'], workDir);
  const diagnostics = parseTscOutput(run.output);
  for (const diagnostic of diagnostics) {
    const owner = diagnostic.path ? byPath.get(resolve(workDir, diagnostic.path)) : undefined;
    if (owner) results.get(owner.item.key).diagnostics.push({ file: owner.file, line: diagnostic.line, message: diagnostic.message });
    else for (const result of results.values()) result.diagnostics.push({ file: 'Example.vue', line: 1, message: `vue-tsc: ${diagnostic.path ?? ''} ${diagnostic.message}` });
  }
  if (run.code !== 0 && diagnostics.length === 0) {
    const first = run.output.trim().split('\n').slice(0, 3).join(' ');
    for (const result of results.values()) result.diagnostics.push({ file: 'Example.vue', line: 1, message: `vue-tsc exited ${run.code}: ${first}` });
  }

  for (const item of items) {
    const result = results.get(item.key);
    if (result.diagnostics.length) continue;
    try {
      const example = await transform(scripts.get(item.key), { ...TRANSFORM, sourcefile: 'Example.vue.ts' });
      const main = await transform(VUE_MAIN, { ...TRANSFORM, sourcefile: 'main.ts' });
      result.compiled = {
        host: VUE_HOST,
        entry: 'main.js',
        modules: { 'main.js': rewriteRelativeImports(main.code), 'Example.js': example.code },
      };
    } catch (error) {
      result.diagnostics.push({ file: 'Example.vue', line: 1, message: `esbuild: ${error.errors?.[0]?.text ?? error.message}` });
    }
  }
  return results;
}
