// Module helpers of an edited project, shared by the compile worker and its tests:
// module names, the rewriting of relative imports to hawiyah-project/<name>.js (the
// names the frame's import map gives the project modules), the frame host markup and
// the bundle-fallback (classic) form of the modules (editor.fallback.projectCode).
// The import and export positions come from es-module-lexer, passed in as `parse`.
import type { ExampleFramework } from '../../examples/payload';
import { EXAMPLE_ENTRY, EXAMPLE_PROJECT_PREFIX } from '../../examples/payload';

/** The part of es-module-lexer's parse() result the helpers read. */
export interface LexedImport {
  readonly n?: string | undefined;
  readonly s: number;
  readonly e: number;
  readonly ss: number;
  readonly se: number;
  readonly d: number;
}

export interface LexedExport {
  readonly n: string;
  readonly ln?: string | undefined;
  readonly ss?: number;
}

export type Lexer = (code: string) => readonly [readonly LexedImport[], readonly LexedExport[], ...unknown[]];

/** Host markup of the frames (the same as the precompiled payloads). */
export const APP_HOST = '<div id="app"></div>';
export const ANGULAR_HOST = '<guide-example></guide-example>';

/** Module name of a project file: Example.tsx -> Example.js, example.component.ts -> example.component.js. */
export function moduleName(file: string): string {
  return `${file.replace(/\.(?:[cm]?[jt]sx?|vue)$/, '')}.js`;
}

/** Whether a project file is compiled to a module (index.html is the host of a JavaScript example). */
export function isModuleFile(file: string): boolean {
  return /\.(?:[jt]sx?|vue)$/.test(file);
}

/** The frame host of a project: the JavaScript example's index.html inside #app, else the fixed host. */
export function projectHost(framework: ExampleFramework, files: Readonly<Record<string, string>>): string {
  if (framework === 'angular') return ANGULAR_HOST;
  if (framework === 'vanilla') return `<div id="app">${(files['index.html'] ?? '').trim()}</div>`;
  return APP_HOST;
}

/** Module specifier of a relative import ('./Example', './Example.vue') in the frame. */
export function projectSpecifier(relative: string): string {
  const base = relative.replace(/^\.\//, '').replace(/\.(?:[cm]?[jt]sx?|vue)$/, '');
  return `${EXAMPLE_PROJECT_PREFIX}${base}.js`;
}

export interface ImportProblem {
  readonly kind: 'unknownModule' | 'unknownFile';
  readonly specifier: string;
  /** Offset of the specifier in the module. */
  readonly at: number;
}

/**
 * Rewrites the static relative imports of a module to hawiyah-project/<name>.js and
 * reports bare specifiers outside `available` and relative imports of files that
 * are not modules of the project.
 */
export function rewriteImports(code: string, parse: Lexer, modules: readonly string[], available: ReadonlySet<string>): { code: string; problems: ImportProblem[] } {
  const [imports] = parse(code);
  const problems: ImportProblem[] = [];
  let out = code;
  for (const entry of [...imports].sort((a, b) => b.s - a.s)) {
    if (entry.d !== -1 || entry.n === undefined) continue;
    const name = entry.n;
    if (name.startsWith('./')) {
      const target = projectSpecifier(name);
      if (!modules.includes(target.slice(EXAMPLE_PROJECT_PREFIX.length))) problems.push({ kind: 'unknownFile', specifier: name, at: entry.s });
      out = out.slice(0, entry.s) + target + out.slice(entry.e);
    } else if (name.startsWith(EXAMPLE_PROJECT_PREFIX)) {
      if (!modules.includes(name.slice(EXAMPLE_PROJECT_PREFIX.length))) problems.push({ kind: 'unknownFile', specifier: name, at: entry.s });
    } else if (!available.has(name) && !/^https?:/.test(name)) {
      problems.push({ kind: 'unknownModule', specifier: name, at: entry.s });
    }
  }
  return { code: out, problems: problems.reverse() };
}

/** Line and column (1-based) of an offset. */
/**
 * A compileScript error at its place in the file. A syntax error of the script
 * (Babel) carries loc.line and a 0-based loc.column relative to the script block;
 * a compiler-sfc error carries loc.start, already in file coordinates.
 */
export function scriptDiagnostic(
  file: string,
  block: { readonly loc?: { readonly start: { readonly line: number; readonly column: number } } } | null,
  error: unknown,
): { file: string; line: number; column: number; message: string } {
  const loc = (error as { loc?: { line?: number; column?: number; start?: { line: number; column: number } } }).loc;
  const message = ((error instanceof Error ? error.message : String(error)).split('\n')[0] ?? '').replace(/\s*\(\d+:\d+\)$/, '');
  if (loc?.start) return { file, line: loc.start.line, column: loc.start.column, message };
  if (typeof loc?.line === 'number') {
    const start = block?.loc?.start ?? { line: 1, column: 1 };
    const column = (loc.column ?? 0) + 1;
    return { file, line: start.line + loc.line - 1, column: loc.line === 1 ? start.column + column - 1 : column, message };
  }
  return { file, line: block?.loc?.start.line ?? 1, column: 1, message };
}

/**
 * Position of an import specifier in the source file the reader wrote: the first
 * occurrence as the source of an import or export (`from 'x'`, `import 'x'`,
 * `import('x')`), so the same text in a template attribute or a string does not
 * count; null when it is not written there literally.
 */
export function specifierPosition(source: string, specifier: string): { line: number; column: number } | null {
  const escaped = specifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`(?:\\bfrom|\\bimport)\\s*\\(?\\s*(['"])${escaped}\\1`).exec(source);
  return match ? position(source, match.index + match[0].length - specifier.length - 1) : null;
}

/**
 * The script block of a Vue file that holds a syntax error: the first block whose
 * content the parser refuses, in the order of the file; the setup block, else the
 * plain block, when each parses on its own.
 */
export function failingScriptBlock<T extends { readonly content: string; readonly lang?: string; readonly loc?: { readonly start: { readonly line: number } } }>(
  blocks: readonly (T | null)[],
  parses: (block: T) => boolean,
): T | null {
  const present = blocks.filter((block): block is T => block !== null).sort((a, b) => (a.loc?.start.line ?? 0) - (b.loc?.start.line ?? 0));
  return present.find((block) => !parses(block)) ?? blocks[0] ?? blocks[1] ?? null;
}

export function position(code: string, offset: number): { line: number; column: number } {
  const before = code.slice(0, Math.max(0, offset));
  const line = before.split('\n').length;
  const column = offset - before.lastIndexOf('\n');
  return { line, column };
}

/** The entry module of an Angular JIT run imports the compiler first (on the first line, so line numbers stay). */
export function withJitCompiler(entry: string, compilerUrl: string): string {
  return `import ${JSON.stringify(compilerUrl)};${entry}`;
}

interface Edit {
  readonly from: number;
  readonly to: number;
  readonly text: string;
}

function applyEdits(code: string, edits: readonly Edit[]): string {
  let out = code;
  for (const edit of [...edits].sort((a, b) => b.from - a.from)) out = out.slice(0, edit.from) + edit.text + out.slice(edit.to);
  return out;
}

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

function property(name: string): string {
  return IDENTIFIER.test(name) ? `.${name}` : `[${JSON.stringify(name)}]`;
}

/** Bindings of an import clause such as `D, { a as b, c }` or `* as ns`. */
function importBindings(clause: string, source: string): string[] {
  const out: string[] = [];
  let rest = clause.trim();
  const star = /^\*\s*as\s+([\w$]+)$/.exec(rest);
  if (star) return [`${star[1]} = ${source}`];
  const defaultMatch = /^([\w$]+)\s*(?:,\s*)?/.exec(rest);
  if (defaultMatch && !rest.startsWith('{')) {
    out.push(`${defaultMatch[1]} = ${source}.default`);
    rest = rest.slice(defaultMatch[0].length).trim();
  }
  const namespace = /^\*\s*as\s+([\w$]+)$/.exec(rest);
  if (namespace) return [...out, `${namespace[1]} = ${source}`];
  const braces = /^\{([\s\S]*)\}$/.exec(rest);
  if (braces) {
    for (const part of (braces[1] as string).split(',')) {
      const item = part.trim().replace(/^type\s+/, '');
      if (!item) continue;
      const [imported, local] = item.split(/\s+as\s+/).map((value) => value.trim().replace(/^['"]|['"]$/g, ''));
      out.push(`${local ?? imported} = ${source}${property(imported as string)}`);
    }
  }
  return out;
}

/** One module in the classic form: a define() call whose factory receives `exports`. */
export function classicModule(name: string, code: string, parse: Lexer): string {
  const [imports, exports] = parse(code);
  const edits: Edit[] = [];
  const tail: string[] = [];
  const reexportStarts = new Set<number>();
  let counter = 0;

  for (const entry of imports) {
    if (entry.d !== -1 || entry.n === undefined) continue;
    const statement = code.slice(entry.ss, entry.se);
    const source = `__hwm${counter++}`;
    const required = `var ${source} = __hwRequire(${JSON.stringify(entry.n)});`;
    if (statement.startsWith('export')) {
      reexportStarts.add(entry.ss);
      const star = /^export\s*\*\s*(?:as\s+([\w$]+)\s*)?from/.exec(statement);
      if (star) {
        tail.push(star[1] ? `exports${property(star[1])} = ${source};` : `Object.keys(${source}).forEach(function (k) { if (k !== 'default') exports[k] = ${source}[k]; });`);
      } else {
        const braces = /^export\s*\{([\s\S]*?)\}/.exec(statement);
        for (const part of (braces?.[1] ?? '').split(',')) {
          const item = part.trim();
          if (!item) continue;
          const [imported, exported] = item.split(/\s+as\s+/).map((value) => value.trim());
          tail.push(`exports${property((exported ?? imported) as string)} = ${source}${property(imported as string)};`);
        }
      }
      edits.push({ from: entry.ss, to: entry.se, text: required });
      continue;
    }
    const from = /^import\s*([\s\S]*?)\s*from\s*['"]/.exec(statement);
    const bindings = from ? importBindings(from[1] as string, source) : [];
    edits.push({ from: entry.ss, to: entry.se, text: bindings.length ? `${required} var ${bindings.join(', ')};` : required });
  }

  const handled = new Set<number>();
  for (const entry of exports) {
    const start = entry.ss;
    if (start === undefined || reexportStarts.has(start)) continue;
    if (entry.ln) tail.push(`exports${property(entry.n)} = ${entry.ln};`);
    if (handled.has(start)) continue;
    handled.add(start);
    const statement = code.slice(start);
    const defaultMatch = /^export\s+default\s+/.exec(statement);
    if (defaultMatch) {
      edits.push({ from: start, to: start + defaultMatch[0].length, text: entry.ln ? '' : 'exports.default = ' });
      continue;
    }
    const list = /^export\s*\{[^}]*\}\s*;?/.exec(statement);
    if (list) {
      edits.push({ from: start, to: start + list[0].length, text: '' });
      continue;
    }
    const keyword = /^export\s+/.exec(statement);
    if (keyword) edits.push({ from: start, to: start + keyword[0].length, text: '' });
  }

  const body = applyEdits(code, edits);
  return `globalThis.HawiyahRuntime.define(${JSON.stringify(`${EXAMPLE_PROJECT_PREFIX}${name}`)}, ['exports'], function (exports) {\n'use strict';\n${body}\n${tail.join('\n')}\n});`;
}

/** Project modules in dependency order (dependencies first), starting from the entry. */
export function moduleOrder(modules: Readonly<Record<string, string>>, parse: Lexer, entry = EXAMPLE_ENTRY): string[] {
  const order: string[] = [];
  const seen = new Set<string>();
  const visit = (name: string) => {
    if (seen.has(name) || !(name in modules)) return;
    seen.add(name);
    const [imports] = parse(modules[name] as string);
    for (const item of imports) {
      if (item.d === -1 && item.n?.startsWith(EXAMPLE_PROJECT_PREFIX)) visit(item.n.slice(EXAMPLE_PROJECT_PREFIX.length));
    }
    order.push(name);
  };
  visit(entry);
  return order;
}

const REQUIRE_SOURCE =
  "var __hwRequire = function (name) { var runtime = globalThis.HawiyahRuntime; if (!runtime || !runtime.modules || !(name in runtime.modules)) throw new Error('HawiyahRuntime has no module ' + name); return runtime.modules[name]; };";

/**
 * The classic script of a project: every module as a define() call in dependency
 * order. For an Angular JIT run the compiler module is imported first.
 */
export function classicProject(modules: Readonly<Record<string, string>>, parse: Lexer, options: { jitCompilerUrl?: string } = {}): string {
  const body = moduleOrder(modules, parse)
    .map((name) => classicModule(name, modules[name] as string, parse))
    .join('\n');
  const inner = `${REQUIRE_SOURCE}\n${body}`;
  if (options.jitCompilerUrl) return `import(${JSON.stringify(options.jitCompilerUrl)}).then(function () {\n${inner}\n});\n`;
  return `(function () {\n${inner}\n})();\n`;
}
