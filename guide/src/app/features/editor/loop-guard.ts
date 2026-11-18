// Loop guard of the editor (editor.fullEditor.loopGuard): a source transform of the
// reader's own compiled modules that stops a loop which keeps the frame busy for
// more than LOOP_LIMIT_MS of one task. It runs on JavaScript (the output of the
// editor's compilers), so it only needs a tokenizer, not a parser.
//
// Every for, while and do-while loop gets a check that runs once per iteration,
// before the body: `while (c)` becomes `while (__hwLoop(n) && (c))`, the test of
// `for (a; b; c)` becomes `__hwLoop(n) && (b)` (or `__hwLoop(n)` when empty), the
// condition of `do ... while (c)` is guarded the same way, and the iterable of
// `for (x of y)` is wrapped in an iterator that checks on every step. `for (k in o)`
// iterates over a finite key list and `for await` over an asynchronous source,
// so neither is changed. Recursion and library code are not covered.
//
// The check measures the time from the first iteration of a loop within one task;
// the time is reset by a timer, so a loop that runs again in a later task starts
// from zero. After the limit it throws an Error with the given message.

/** Time a loop may keep one task busy. */
export const LOOP_LIMIT_MS = 2000;

/** Name of the per-module check function and of the iterator wrapper. */
export const GUARD_NAME = '__hwLoop';
export const ITERATOR_NAME = '__hwLoopIter';

type TokenKind = 'name' | 'number' | 'string' | 'template' | 'regex' | 'punct';

interface Token {
  readonly kind: TokenKind;
  readonly value: string;
  readonly start: number;
  readonly end: number;
}

const KEYWORDS_BEFORE_EXPRESSION = new Set([
  'return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void', 'throw', 'case', 'do', 'else', 'yield', 'await',
]);

const isIdentifierStart = (c: string) => /[A-Za-z_$\u0080-\uffff]/.test(c);
const isIdentifierPart = (c: string) => /[A-Za-z0-9_$\u0080-\uffff]/.test(c);

/** Whether a '/' after this token starts a regular expression literal. */
function regexAllowed(previous: Token | undefined): boolean {
  if (!previous) return true;
  if (previous.kind === 'number' || previous.kind === 'string' || previous.kind === 'template' || previous.kind === 'regex') return false;
  if (previous.kind === 'name') return KEYWORDS_BEFORE_EXPRESSION.has(previous.value);
  return ![')', ']', '}'].includes(previous.value);
}

/** Splits JavaScript into tokens (comments and white space are skipped). */
export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  // Brace depth stack of open template literal substitutions.
  const templates: number[] = [];
  let braces = 0;
  let i = 0;
  const n = source.length;

  const readTemplate = (start: number): void => {
    // Reads from just after '`' or '}' to the closing '`' or the next '${'.
    let j = start;
    while (j < n) {
      const c = source[j];
      if (c === '\\') {
        j += 2;
        continue;
      }
      if (c === '`') {
        tokens.push({ kind: 'template', value: source.slice(start - 1, j + 1), start: start - 1, end: j + 1 });
        i = j + 1;
        return;
      }
      if (c === '$' && source[j + 1] === '{') {
        tokens.push({ kind: 'template', value: source.slice(start - 1, j + 2), start: start - 1, end: j + 2 });
        templates.push(braces);
        braces += 1;
        i = j + 2;
        return;
      }
      j += 1;
    }
    throw new SyntaxError('Unterminated template literal');
  };

  while (i < n) {
    const c = source[i] as string;
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '\f' || c === '\v' || c === '\u00a0' || c === '\ufeff' || c === '\u2028' || c === '\u2029') {
      i += 1;
      continue;
    }
    if (c === '/' && source[i + 1] === '/') {
      const end = source.indexOf('\n', i);
      i = end < 0 ? n : end;
      continue;
    }
    if (c === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2);
      if (end < 0) throw new SyntaxError('Unterminated comment');
      i = end + 2;
      continue;
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n && source[j] !== c) {
        if (source[j] === '\\') j += 1;
        else if (source[j] === '\n') throw new SyntaxError('Unterminated string');
        j += 1;
      }
      if (j >= n) throw new SyntaxError('Unterminated string');
      tokens.push({ kind: 'string', value: source.slice(i, j + 1), start: i, end: j + 1 });
      i = j + 1;
      continue;
    }
    if (c === '`') {
      readTemplate(i + 1);
      continue;
    }
    if (c === '}' && templates.length > 0 && templates[templates.length - 1] === braces - 1) {
      templates.pop();
      braces -= 1;
      readTemplate(i + 1);
      continue;
    }
    if (c === '/' && regexAllowed(tokens[tokens.length - 1])) {
      let j = i + 1;
      let inClass = false;
      while (j < n) {
        const d = source[j];
        if (d === '\\') j += 1;
        else if (d === '[') inClass = true;
        else if (d === ']') inClass = false;
        else if (d === '/' && !inClass) break;
        else if (d === '\n') throw new SyntaxError('Unterminated regular expression');
        j += 1;
      }
      j += 1;
      while (j < n && isIdentifierPart(source[j] as string)) j += 1;
      tokens.push({ kind: 'regex', value: source.slice(i, j), start: i, end: j });
      i = j;
      continue;
    }
    if (isIdentifierStart(c) || c === '\\' || c === '#') {
      let j = i + 1;
      while (j < n && (isIdentifierPart(source[j] as string) || source[j] === '\\')) j += 1;
      tokens.push({ kind: 'name', value: source.slice(i, j), start: i, end: j });
      i = j;
      continue;
    }
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(source[i + 1] ?? ''))) {
      let j = i + 1;
      while (j < n && /[0-9A-Za-z_.]/.test(source[j] as string)) {
        if ((source[j] === 'e' || source[j] === 'E') && (source[j + 1] === '+' || source[j + 1] === '-')) j += 1;
        j += 1;
      }
      tokens.push({ kind: 'number', value: source.slice(i, j), start: i, end: j });
      i = j;
      continue;
    }
    if (c === '{') braces += 1;
    if (c === '}') braces -= 1;
    // Multi-character punctuators matter only for '.', '?.' and '=>'; other characters stand alone.
    if (c === '?' && source[i + 1] === '.' && !/[0-9]/.test(source[i + 2] ?? '')) {
      tokens.push({ kind: 'punct', value: '?.', start: i, end: i + 2 });
      i += 2;
      continue;
    }
    if (c === '=' && source[i + 1] === '>') {
      tokens.push({ kind: 'punct', value: '=>', start: i, end: i + 2 });
      i += 2;
      continue;
    }
    if (c === '.' && source[i + 1] === '.' && source[i + 2] === '.') {
      tokens.push({ kind: 'punct', value: '...', start: i, end: i + 3 });
      i += 3;
      continue;
    }
    tokens.push({ kind: 'punct', value: c, start: i, end: i + 1 });
    i += 1;
  }
  if (templates.length > 0) throw new SyntaxError('Unterminated template literal');
  return tokens;
}

/** Index of the token that closes the bracket at `open`. */
function matching(tokens: readonly Token[], open: number): number {
  const pairs: Record<string, string> = { '(': ')', '[': ']', '{': '}' };
  const stack: string[] = [];
  for (let i = open; i < tokens.length; i += 1) {
    const token = tokens[i] as Token;
    if (token.kind !== 'punct') continue;
    const close = pairs[token.value];
    if (close) stack.push(close);
    else if (token.value === ')' || token.value === ']' || token.value === '}') {
      if (stack.pop() !== token.value) return -1;
      if (stack.length === 0) return i;
    }
  }
  return -1;
}

interface Insertion {
  readonly at: number;
  readonly text: string;
}

/**
 * The prelude that defines the check in a module: one line without a line break, so
 * the line numbers of the module stay the same. All modules of a run share the state
 * on globalThis.
 */
export function guardPrelude(message: string, limitMs = LOOP_LIMIT_MS): string {
  const text = JSON.stringify(message).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return (
    `var ${GUARD_NAME}=(function(g){var k='__hawiyahLoopGuard';if(!g[k]){var s=Object.create(null);` +
    `g[k]=function(id){var n=Date.now(),t=s[id];if(t===undefined){s[id]=n;setTimeout(function(){delete s[id];},0);}` +
    `else if(n-t>${limitMs}){delete s[id];throw new Error(${text});}return true;};}return g[k];})(globalThis);` +
    `var ${ITERATOR_NAME}=function(id,v){var it=v[Symbol.iterator]();var r={next:function(a){${GUARD_NAME}(id);return it.next(a);}};` +
    `if(it.return)r.return=function(a){return it.return(a);};if(it.throw)r.throw=function(a){return it.throw(a);};` +
    `r[Symbol.iterator]=function(){return r;};return r;};`
  );
}

/** Where the prelude goes: after a leading "use strict" directive, else at the start. */
function preludePosition(source: string, tokens: readonly Token[]): number {
  const first = tokens[0];
  const second = tokens[1];
  if (first?.kind === 'string' && /^['"]use strict['"]$/.test(first.value)) {
    return second?.value === ';' ? second.end : first.end;
  }
  return 0;
}

export interface GuardResult {
  readonly code: string;
  /** Number of loops that received a check. */
  readonly loops: number;
}

/**
 * Inserts the loop checks into one module. `prefix` makes the loop ids unique across
 * the modules of a run. Throws a SyntaxError when the code cannot be tokenized.
 */
export function guardLoops(source: string, message: string, prefix = 'm', limitMs = LOOP_LIMIT_MS): GuardResult {
  const tokens = tokenize(source);
  const insertions: Insertion[] = [];
  let loops = 0;
  const id = () => JSON.stringify(`${prefix}:${loops}`);

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i] as Token;
    if (token.kind !== 'name') continue;
    const previous = tokens[i - 1];
    // A property name (a.while, a?.for) or an object key ({ for: 1 }) is not a loop.
    if (previous && previous.kind === 'punct' && (previous.value === '.' || previous.value === '?.')) continue;
    if (token.value !== 'while' && token.value !== 'for') continue;
    const open = i + 1;
    if (token.value === 'for' && tokens[open]?.value === 'await') continue;
    if (tokens[open]?.value !== '(' || tokens[open + 1]?.value === ')') continue;
    const close = matching(tokens, open);
    if (close < 0) continue;

    if (token.value === 'while') {
      const first = tokens[open + 1] as Token;
      loops += 1;
      insertions.push({ at: first.start, text: `${GUARD_NAME}(${id()}) && (` });
      insertions.push({ at: (tokens[close] as Token).start, text: ')' });
      i = open;
      continue;
    }

    // for: find the two top-level semicolons, or the top-level 'of' / 'in'.
    const semicolons: number[] = [];
    let ofIndex = -1;
    let inIndex = -1;
    let depth = 0;
    for (let j = open + 1; j < close; j += 1) {
      const t = tokens[j] as Token;
      if (t.kind === 'punct' && (t.value === '(' || t.value === '[' || t.value === '{')) depth += 1;
      else if (t.kind === 'punct' && (t.value === ')' || t.value === ']' || t.value === '}')) depth -= 1;
      else if (depth === 0 && t.kind === 'punct' && t.value === ';') semicolons.push(j);
      else if (depth === 0 && t.kind === 'name' && t.value === 'of' && ofIndex < 0 && semicolons.length === 0) ofIndex = j;
      else if (depth === 0 && t.kind === 'name' && t.value === 'in' && inIndex < 0 && semicolons.length === 0) inIndex = j;
    }
    if (semicolons.length === 2) {
      const [a, b] = semicolons as [number, number];
      loops += 1;
      if (b === a + 1) {
        insertions.push({ at: (tokens[b] as Token).start, text: `${GUARD_NAME}(${id()})` });
      } else {
        insertions.push({ at: (tokens[a + 1] as Token).start, text: `${GUARD_NAME}(${id()}) && (` });
        insertions.push({ at: (tokens[b] as Token).start, text: ')' });
      }
    } else if (ofIndex >= 0 && ofIndex + 1 < close) {
      loops += 1;
      insertions.push({ at: (tokens[ofIndex + 1] as Token).start, text: `${ITERATOR_NAME}(${id()}, (` });
      insertions.push({ at: (tokens[close] as Token).start, text: '))' });
    }
    // for (k in o) is left unchanged.
    void inIndex;
    i = open;
  }

  if (loops === 0) return { code: source, loops };
  insertions.push({ at: preludePosition(source, tokens), text: guardPrelude(message, limitMs) });
  // Apply from the end so earlier positions stay valid; at one position, keep the given order.
  const ordered = insertions.map((insertion, index) => ({ ...insertion, index })).sort((x, y) => y.at - x.at || y.index - x.index);
  let code = source;
  for (const insertion of ordered) code = code.slice(0, insertion.at) + insertion.text + code.slice(insertion.at);
  return { code, loops };
}
