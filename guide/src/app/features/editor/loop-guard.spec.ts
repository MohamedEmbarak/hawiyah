import { beforeEach, describe, expect, it } from 'vitest';
import { GUARD_NAME, ITERATOR_NAME, guardLoops, guardPrelude, tokenize } from './loop-guard';

const MESSAGE = 'A loop ran for too long.';

/** Runs guarded code as a function body and returns what it returns. */
function run(code: string): unknown {
  return new Function(code)();
}

describe('tokenize', () => {
  it('skips comments and keeps strings, templates and regular expressions whole', () => {
    const tokens = tokenize("// while (x)\nconst a = 'for (;;)'; /* do */ const r = /while\\(/g; const t = `x${a}y`;");
    expect(tokens.filter((token) => token.kind === 'name' && (token.value === 'while' || token.value === 'for'))).toEqual([]);
    expect(tokens.some((token) => token.kind === 'regex' && token.value === '/while\\(/g')).toBe(true);
    expect(tokens.filter((token) => token.kind === 'template').length).toBe(2);
  });

  it('reports unterminated strings and comments', () => {
    expect(() => tokenize("const a = 'x")).toThrow(SyntaxError);
    expect(() => tokenize('/* open')).toThrow(SyntaxError);
  });
});

describe('guardLoops', () => {
  // The check is shared by the modules of a run through globalThis; each test starts without it.
  beforeEach(() => {
    delete (globalThis as Record<string, unknown>)['__hawiyahLoopGuard'];
  });

  it('leaves code without loops unchanged', () => {
    const source = 'export const a = 1;\nconsole.log(a);';
    expect(guardLoops(source, MESSAGE)).toEqual({ code: source, loops: 0 });
  });

  it('guards while, do-while, for and for-of loops and keeps the line count', () => {
    const source = [
      'let i = 0;',
      'while (i < 3) i++;',
      'do { i--; } while (i > 0);',
      'for (let j = 0; j < 2; j++) {}',
      'for (;;) { break; }',
      'for (const v of [1, 2]) { i += v; }',
      'for (const k in { a: 1 }) {}',
      'return i;',
    ].join('\n');
    const result = guardLoops(source, MESSAGE, 'main.js');
    expect(result.loops).toBe(5);
    expect(result.code.split('\n').length).toBe(source.split('\n').length);
    expect(result.code).toContain(`while (${GUARD_NAME}("main.js:1") && (i < 3))`);
    expect(result.code).toContain(`for (;${GUARD_NAME}("main.js:4");)`);
    expect(result.code).toContain(`${ITERATOR_NAME}("main.js:5", ([1, 2]))`);
    expect(result.code).toContain('for (const k in { a: 1 })');
    expect(run(result.code)).toBe(3);
  });

  it('does not treat property names as loops', () => {
    const source = 'const o = { while: 1, for: 2 }; return o.while + o.for;';
    const result = guardLoops(source, MESSAGE);
    expect(result.loops).toBe(0);
    expect(run(result.code)).toBe(3);
  });

  it('places the prelude after a use strict directive', () => {
    const result = guardLoops('"use strict";\nwhile (false) {}', MESSAGE);
    expect(result.code.startsWith('"use strict";var __hwLoop')).toBe(true);
  });

  it('stops an endless loop after the limit with the given message', () => {
    const result = guardLoops('let n = 0;\nwhile (true) { n++; }\nreturn n;', MESSAGE, 'loop', 30);
    const started = Date.now();
    expect(() => run(result.code)).toThrow(MESSAGE);
    expect(Date.now() - started).toBeLessThan(2000);
  });

  it('stops an endless for-of over a generator', () => {
    const source = 'function* g() { while (true) yield 1; }\nlet n = 0;\nfor (const v of g()) { n += v; }\nreturn n;';
    expect(() => run(guardLoops(source, MESSAGE, 'gen', 30).code)).toThrow(MESSAGE);
  });

  it('escapes the message for a script element', () => {
    const prelude = guardPrelude('</script>  ');
    expect(prelude).not.toContain('</script>');
    expect(prelude).toContain('\\u2028');
    expect(prelude).not.toContain('\n');
  });
});
