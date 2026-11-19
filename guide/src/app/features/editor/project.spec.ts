import { init, parse } from 'es-module-lexer';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  classicModule,
  classicProject,
  moduleName,
  moduleOrder,
  position,
  projectHost,
  rewriteImports,
  scriptDiagnostic,
  specifierPosition,
  failingScriptBlock,
  withJitCompiler,
  type Lexer,
} from './project';

const lex = parse as unknown as Lexer;

beforeAll(async () => {
  await init;
});

/** Runs a classic project against a stand-in HawiyahRuntime and returns the registered modules. */
function runClassic(code: string, runtime: Record<string, unknown>): Record<string, Record<string, unknown>> {
  const modules: Record<string, Record<string, unknown>> = { ...(runtime as Record<string, Record<string, unknown>>) };
  const define = (name: string, _deps: string[], factory: (exports: Record<string, unknown>) => void) => {
    const exports: Record<string, unknown> = {};
    factory(exports);
    modules[name] = exports;
  };
  new Function('globalThis', code)({ HawiyahRuntime: { modules, define } });
  return modules;
}

describe('names and host', () => {
  it('names modules after their files', () => {
    expect(moduleName('Example.tsx')).toBe('Example.js');
    expect(moduleName('example.component.ts')).toBe('example.component.js');
    expect(moduleName('Example.vue')).toBe('Example.js');
    expect(moduleName('main.js')).toBe('main.js');
  });

  it('places index.html of a JavaScript example in #app', () => {
    expect(projectHost('vanilla', { 'index.html': '\n<button>x</button>\n' })).toBe('<div id="app"><button>x</button></div>');
    expect(projectHost('react', {})).toBe('<div id="app"></div>');
    expect(projectHost('angular', {})).toBe('<guide-example></guide-example>');
  });

  it('gives 1-based positions', () => {
    expect(position('ab\ncd', 4)).toEqual({ line: 2, column: 2 });
  });
});

describe('rewriteImports', () => {
  it('rewrites relative imports and reports unknown modules and files', () => {
    const code = "import Example from './Example';\nimport { x } from 'left-pad';\nimport './Missing';\nimport { Button } from '@hawiyah/react';";
    const result = rewriteImports(code, lex, ['main.js', 'Example.js'], new Set(['@hawiyah/react']));
    expect(result.code).toContain("from 'hawiyah-project/Example.js'");
    expect(result.problems.map((problem) => [problem.kind, problem.specifier])).toEqual([
      ['unknownModule', 'left-pad'],
      ['unknownFile', './Missing'],
    ]);
  });
});

describe('classic form', () => {
  it('turns imports and exports into define() calls in dependency order', () => {
    const modules = {
      'main.js': "import Example, { label as name } from 'hawiyah-project/Example.js';\nimport * as lib from 'lib';\nexport const out = Example() + name + lib.suffix;",
      'Example.js': "export default function Example() { return 'E'; }\nexport const label = 'L';\nconst hidden = 1;\nexport { hidden as shown };",
    };
    expect(moduleOrder(modules, lex)).toEqual(['Example.js', 'main.js']);
    const registered = runClassic(classicProject(modules, lex), { lib: { suffix: '!' } });
    expect(registered['hawiyah-project/Example.js']).toMatchObject({ label: 'L', shown: 1 });
    expect(registered['hawiyah-project/main.js']).toMatchObject({ out: 'EL!' });
  });

  it('handles anonymous default exports and re-exports', () => {
    const code = "export default 40 + 2;\nexport * from 'lib';\nexport { suffix as end } from 'lib';";
    const registered = runClassic(`var __hwRequire = function (n) { return globalThis.HawiyahRuntime.modules[n]; };\n${classicModule('main.js', code, lex)}`, {
      lib: { suffix: '!', other: 1 },
    });
    expect(registered['hawiyah-project/main.js']).toEqual({ default: 42, suffix: '!', other: 1, end: '!' });
  });

  it('reports a missing runtime module by name', () => {
    expect(() => runClassic(classicProject({ 'main.js': "import { a } from 'missing';" }, lex), {})).toThrow('HawiyahRuntime has no module missing');
  });

  it('imports the compiler first for an Angular JIT run', () => {
    expect(withJitCompiler('import x from "y";', 'https://example.org/c.mjs')).toBe('import "https://example.org/c.mjs";import x from "y";');
    expect(classicProject({ 'main.js': 'export const a = 1;' }, lex, { jitCompilerUrl: 'https://example.org/c.mjs' })).toMatch(/^import\("https:\/\/example\.org\/c\.mjs"\)\.then\(/);
  });
});

describe('positions of errors in the file the reader wrote', () => {
  it('places a script syntax error of a Vue file at its line in the file, not in the script block', () => {
    // <script setup> on line 9; Babel reports (3:6) relative to the block content.
    const error = Object.assign(new SyntaxError('[vue/compiler-sfc] Unexpected token (3:6)'), { loc: { line: 3, column: 6 } });
    expect(scriptDiagnostic('Example.vue', { loc: { start: { line: 9, column: 15 } } }, error)).toEqual({
      file: 'Example.vue',
      line: 11,
      column: 7,
      message: '[vue/compiler-sfc] Unexpected token',
    });
  });

  it('finds the specifier of an import in the source, not in the compiled code', () => {
    const source = '<template>\n  <p>x</p>\n</template>\n\n<script setup>\nimport lodash from \'lodash\';\n</script>\n';
    expect(specifierPosition(source, 'lodash')).toEqual({ line: 6, column: 21 });
    expect(specifierPosition(source, 'left-pad')).toBeNull();
  });

  it('takes the import, not an earlier quoted occurrence of the same text in the template', () => {
    const source = '<template>\n  <p data-note="lodash">x</p>\n</template>\n\n<script setup>\nimport { a } from "./a";\n\n\nimport lodash from \'lodash\';\nimport(\'left-pad\');\n</script>\n';
    expect(specifierPosition(source, 'lodash')).toEqual({ line: 9, column: 21 });
    expect(specifierPosition(source, 'left-pad')).toEqual({ line: 10, column: 9 });
  });

  it('places a syntax error in the script block that does not parse, with a setup block first', () => {
    const setup = { content: 'const a = 1;\n', loc: { start: { line: 1, column: 15 } } };
    const plain = { content: '\n\nexport default {\n', loc: { start: { line: 4, column: 9 } } };
    const parses = (block: { content: string }) => !block.content.includes('export default {\n') || block.content.trim().endsWith('}');
    expect(failingScriptBlock([setup, plain], parses)).toBe(plain);
    expect(failingScriptBlock([setup, null], () => true)).toBe(setup);
    expect(failingScriptBlock([null, plain], () => true)).toBe(plain);
    const error = Object.assign(new SyntaxError('[vue/compiler-sfc] Unexpected token (3:6)'), { loc: { line: 3, column: 6 } });
    expect(scriptDiagnostic('Example.vue', failingScriptBlock([setup, plain], parses), error)).toMatchObject({ line: 6, column: 7 });
  });
});
