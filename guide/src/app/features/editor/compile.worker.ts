// Module worker of the editor (editor.compilers): compiles the edited files of a
// project to ES modules and to the bundle-fallback (classic) form, and inserts the
// loop guard into every module. The compilers are the files step 62 writes to
// runtime/compilers/; each is loaded on the first request that needs it:
//   JavaScript and JSX: Sucrase; TSX: Sucrase with the typescript transform;
//   Vue: @vue/compiler-sfc, then Sucrase; Angular: TypeScript transpileModule (the
//   frame compiles the templates, JIT); imports: es-module-lexer.
// TypeScript is published as a classic script (lib/typescript.js). A module worker
// has no importScripts, so the file is fetched and evaluated with new Function.
import type { CompileConvertRequest, CompileDiagnostic, CompileRequest, CompileResponse, CompileRunRequest, WorkerEnvelope } from './compile-client';
import { guardLoops } from './loop-guard';
import { classicProject, failingScriptBlock, isModuleFile, moduleName, position, projectHost, rewriteImports, scriptDiagnostic, specifierPosition, withJitCompiler, type Lexer } from './project';

interface SucraseModule {
  transform(code: string, options: Record<string, unknown>): { code: string };
}

interface SfcBlock {
  readonly content: string;
  readonly lang?: string;
  readonly scoped?: boolean;
  /** Position of the block content in the file (1-based line and column). */
  readonly loc?: { readonly start: { readonly line: number; readonly column: number } };
}

interface SfcModule {
  parse(source: string, options: { filename: string }): {
    descriptor: { script: SfcBlock | null; scriptSetup: SfcBlock | null; styles: SfcBlock[] };
    errors: { message: string; loc?: { start: { line: number; column: number } } }[];
  };
  compileScript(descriptor: unknown, options: Record<string, unknown>): { content: string };
  babelParse(code: string, options: Record<string, unknown>): unknown;
  compileStyle(options: Record<string, unknown>): { code: string; errors: Error[] };
}

interface TsDiagnostic {
  file?: { getLineAndCharacterOfPosition(position: number): { line: number; character: number } };
  start?: number;
  messageText: string | { messageText: string };
}

interface TypeScriptModule {
  transpileModule(source: string, options: Record<string, unknown>): { outputText: string; diagnostics?: TsDiagnostic[] };
  ScriptTarget: Record<string, number>;
  ModuleKind: Record<string, number>;
}

interface LexerModule {
  init: Promise<void>;
  parse: Lexer;
}

interface WorkerScope {
  postMessage(message: unknown): void;
  addEventListener(type: 'message', listener: (event: MessageEvent<WorkerEnvelope<CompileRequest>>) => void): void;
}

const scope = globalThis as unknown as WorkerScope;

/** A compile error at a position of a file. */
class CompileFailure extends Error {
  constructor(readonly diagnostics: CompileDiagnostic[]) {
    super(diagnostics[0]?.message ?? 'Compile error');
  }
}

/** A compiler file could not be loaded. */
class LoadFailure extends Error {}

const cache = new Map<string, Promise<unknown>>();
let loaded: string[] = [];

function load<T>(base: string, file: string, loader: (url: string) => Promise<T>): Promise<T> {
  const url = new URL(file, base).href;
  let value = cache.get(url) as Promise<T> | undefined;
  if (!value) {
    loaded.push(file);
    value = loader(url).catch((error: unknown) => {
      cache.delete(url);
      throw new LoadFailure(`${file}: ${error instanceof Error ? error.message : String(error)}`);
    });
    cache.set(url, value);
  }
  return value;
}

const importModule = <T>(url: string): Promise<T> => import(/* @vite-ignore */ url) as Promise<T>;

const sucrase = (base: string) => load(base, 'sucrase.js', (url) => importModule<SucraseModule>(url));
const sfc = (base: string) => load(base, 'compiler-sfc.esm-browser.js', (url) => importModule<SfcModule>(url));
const lexer = (base: string) =>
  load(base, 'es-module-lexer.js', async (url) => {
    const module = await importModule<LexerModule>(url);
    await module.init;
    return module;
  });
const typescript = (base: string) =>
  load(base, 'typescript.js', async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url} answered ${response.status}`);
    const text = await response.text();
    // typescript.js declares `var ts` at its top level and assigns the namespace to it.
    return new Function(`${text}\n;return ts;`)() as TypeScriptModule;
  });

/** Splits a Sucrase error ('Error transforming <file>: <message> (<line>:<column>)'). */
function sucraseDiagnostic(file: string, error: unknown): CompileDiagnostic {
  const raw = error instanceof Error ? error.message : String(error);
  const loc = (error as { loc?: { line: number; column: number } }).loc;
  const message = raw.replace(/^Error transforming [^:]*: /, '').replace(/\s*\(\d+:\d+\)$/, '');
  return { file, line: loc?.line ?? 1, column: (loc?.column ?? 0) + 1, message };
}

function transformWithSucrase(module: SucraseModule, file: string, code: string, transforms: string[], jsxRuntime: 'automatic' | 'preserve'): string {
  try {
    // A conversion for reading keeps every import: a Vue script's imports are used only by its template.
    const keepUnusedImports = jsxRuntime === 'preserve';
    return module.transform(code, { transforms, jsxRuntime, production: true, filePath: file, disableESTransforms: true, keepUnusedImports }).code;
  } catch (error) {
    throw new CompileFailure([sucraseDiagnostic(file, error)]);
  }
}

/** Sucrase transforms of a script file. */
function scriptTransforms(file: string): string[] {
  if (file.endsWith('.tsx')) return ['typescript', 'jsx'];
  if (file.endsWith('.ts')) return ['typescript'];
  if (file.endsWith('.jsx')) return ['jsx'];
  return [];
}

function styleInjection(css: string): string {
  return `;(function(){var s=document.createElement('style');s.textContent=${JSON.stringify(css)};document.head.appendChild(s);})();`;
}

/** Example.vue to a module: compiler-sfc (script and inlined template), Sucrase for TypeScript, styles injected. */
async function compileVue(base: string, file: string, source: string, scopeId: string): Promise<string> {
  const compiler = await sfc(base);
  const { descriptor, errors } = compiler.parse(source, { filename: file });
  if (errors.length > 0) {
    throw new CompileFailure(
      errors.map((error) => ({ file, line: error.loc?.start.line ?? 1, column: error.loc?.start.column ?? 1, message: error.message.split('\n')[0] ?? '' })),
    );
  }
  let target = descriptor;
  if (!descriptor.script && !descriptor.scriptSetup) target = compiler.parse(`<script setup></script>\n${source}`, { filename: file }).descriptor;
  let script: string;
  try {
    script = compiler.compileScript(target, { id: scopeId, inlineTemplate: true, isProd: true }).content;
  } catch (error) {
    // With a setup block and a plain block, the error belongs to the block that does not parse.
    const parses = (block: SfcBlock) => {
      try {
        compiler.babelParse(block.content, { sourceType: 'module', plugins: block.lang === 'ts' ? ['typescript'] : [] });
        return true;
      } catch {
        return false;
      }
    };
    throw new CompileFailure([scriptDiagnostic(file, failingScriptBlock([target.scriptSetup, target.script], parses), error)]);
  }
  const lang = (target.scriptSetup ?? target.script)?.lang;
  const code = transformWithSucrase(await sucrase(base), file, script, lang === 'ts' ? ['typescript'] : [], 'automatic');
  let styles = '';
  for (const style of target.styles) {
    let css = style.content;
    if (style.scoped) {
      const result = compiler.compileStyle({ source: style.content, filename: file, id: `data-v-${scopeId}`, scoped: true });
      if (result.errors.length > 0) throw new CompileFailure([{ file, line: 1, column: 1, message: result.errors[0]?.message ?? 'Style error' }]);
      css = result.code;
    }
    styles += styleInjection(css);
  }
  return code + styles;
}

function tsMessage(text: TsDiagnostic['messageText']): string {
  return typeof text === 'string' ? text : text.messageText;
}

/** An Angular file: TypeScript transpileModule with standard decorators; syntax errors are reported. */
async function compileAngular(base: string, file: string, source: string): Promise<string> {
  const ts = await typescript(base);
  const result = ts.transpileModule(source, {
    fileName: file,
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget['ES2022'],
      module: ts.ModuleKind['ESNext'],
      experimentalDecorators: false,
      emitDecoratorMetadata: false,
      useDefineForClassFields: false,
      importHelpers: false,
      sourceMap: false,
    },
  });
  const diagnostics = result.diagnostics ?? [];
  if (diagnostics.length > 0) {
    throw new CompileFailure(
      diagnostics.map((diagnostic) => {
        const at = diagnostic.file && diagnostic.start !== undefined ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start) : { line: 0, character: 0 };
        return { file, line: at.line + 1, column: at.character + 1, message: tsMessage(diagnostic.messageText) };
      }),
    );
  }
  return result.outputText.replace(/\n\/\/# sourceMappingURL=.*$/, '');
}

async function compileFile(request: CompileRunRequest, file: string, source: string): Promise<string> {
  const base = request.compilersBase;
  switch (request.framework) {
    case 'angular':
      return compileAngular(base, file, source);
    case 'vue':
      if (file.endsWith('.vue')) return compileVue(base, file, source, request.scope);
      return transformWithSucrase(await sucrase(base), file, source, scriptTransforms(file), 'automatic');
    default:
      return transformWithSucrase(await sucrase(base), file, source, scriptTransforms(file), 'automatic');
  }
}

async function compile(request: CompileRunRequest): Promise<CompileResponse> {
  const base = request.compilersBase;
  const sources = Object.entries(request.files).filter(([file]) => isModuleFile(file));
  const names = sources.map(([file]) => moduleName(file));
  if (!names.includes('main.js')) throw new CompileFailure([{ file: Object.keys(request.files)[0] ?? 'main.js', line: 1, column: 1, message: 'The project has no main file.' }]);
  const { parse } = await lexer(base);
  const available = new Set(request.available);
  const modules: Record<string, string> = {};
  const diagnostics: CompileDiagnostic[] = [];
  for (const [file, source] of sources) {
    let code: string;
    try {
      code = await compileFile(request, file, source);
    } catch (error) {
      if (error instanceof CompileFailure) {
        diagnostics.push(...error.diagnostics);
        continue;
      }
      throw error;
    }
    let rewritten: ReturnType<typeof rewriteImports>;
    try {
      rewritten = rewriteImports(code, parse, names, available);
    } catch (error) {
      diagnostics.push({ file, line: 1, column: 1, message: error instanceof Error ? error.message : String(error) });
      continue;
    }
    for (const problem of rewritten.problems) {
      // The place of the specifier in the file the reader wrote; the compiled code when it is not written there.
      const at = specifierPosition(source, problem.specifier) ?? position(code, problem.at);
      diagnostics.push({ file, line: at.line, column: at.column, message: problem.specifier, code: problem.kind, specifier: problem.specifier });
    }
    const name = moduleName(file);
    modules[name] = guardLoops(rewritten.code, request.loopMessage, name).code;
  }
  if (diagnostics.length > 0) throw new CompileFailure(diagnostics);
  const jit = request.framework === 'angular';
  const compilerUrl = new URL('compiler.mjs', base).href;
  if (jit) modules['main.js'] = withJitCompiler(modules['main.js'] as string, compilerUrl);
  // The classic form starts from the modules without the compiler import; it imports the compiler itself.
  const classicModules = jit ? { ...modules, 'main.js': (modules['main.js'] as string).slice(withJitCompiler('', compilerUrl).length) } : modules;
  const classic = classicProject(classicModules, parse, jit ? { jitCompilerUrl: compilerUrl } : {});
  return {
    ok: true,
    kind: 'compile',
    compiled: { host: projectHost(request.framework, request.files), entry: 'main.js', modules, classic },
    jit,
    loaded,
  };
}

/** TypeScript files of a React or Vue example to JavaScript, keeping JSX and the file order. */
async function convert(request: CompileConvertRequest): Promise<CompileResponse> {
  const module = await sucrase(request.compilersBase);
  const files: Record<string, string> = {};
  for (const [file, source] of Object.entries(request.files)) {
    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const code = transformWithSucrase(module, file, source, file.endsWith('.tsx') ? ['typescript', 'jsx'] : ['typescript'], 'preserve');
      files[file.replace(/\.tsx$/, '.jsx').replace(/\.ts$/, '.js')] = code;
    } else if (file.endsWith('.vue')) {
      files[file] = source.replace(/<script(\s[^>]*)?\slang=["']ts["']([^>]*)>([\s\S]*?)<\/script>/g, (_match, before: string | undefined, after: string, body: string) => {
        const code = transformWithSucrase(module, file, body, ['typescript'], 'preserve');
        return `<script${before ?? ''}${after}>${code}</script>`;
      });
    } else {
      files[file] = source;
    }
  }
  return { ok: true, kind: 'convert', files, loaded };
}

async function handle(request: CompileRequest): Promise<CompileResponse> {
  loaded = [];
  try {
    return request.kind === 'compile' ? await compile(request) : await convert(request);
  } catch (error) {
    if (error instanceof CompileFailure) return { ok: false, diagnostics: error.diagnostics, loaded };
    if (error instanceof LoadFailure) return { ok: false, loadError: error.message, loaded };
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, diagnostics: [{ file: '', line: 1, column: 1, message }], loaded };
  }
}

scope.addEventListener('message', (event) => {
  const { id, body } = event.data;
  void handle(body).then((response) => scope.postMessage({ id, body: response } satisfies WorkerEnvelope<CompileResponse>));
});
