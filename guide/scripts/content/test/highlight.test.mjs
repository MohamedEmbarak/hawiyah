// Lezer highlighting into hw-code-token roles, and parity tokens.

import { describe, expect, it } from 'vitest';
import { ROLES, highlight, tokens } from '../highlight.mjs';

const roles = (lines) => lines.flat().filter((run) => run.r).map((run) => [run.t, run.r]);

describe('highlight', () => {
  it('maps TypeScript tags to roles', () => {
    const lines = highlight('ts', "import { a } from 'x'; // note\nconst n: number = 1;\nf(true);");
    expect(lines).toHaveLength(3);
    expect(roles(lines)).toEqual(expect.arrayContaining([
      ['import', 'keyword'], ['{', 'punctuation'], ["'x'", 'string'], ['// note', 'comment'],
      ['number', 'type'], ['1', 'constant'], ['f', 'function'], ['true', 'constant'],
    ]));
  });

  it('highlights HTML with nested script and Vue templates', () => {
    const lines = highlight('vue', '<template>\n  <HwButton variant="primary">Go</HwButton>\n</template>\n<script setup lang="ts">\nconst a = 1;\n</script>');
    expect(roles(lines)).toEqual(expect.arrayContaining([
      ['template', 'tag'], ['HwButton', 'tag'], ['variant', 'attribute'], ['"primary"', 'string'], ['const', 'keyword'], ['1', 'constant'],
    ]));
  });

  it('highlights CSS class selectors as tags and properties', () => {
    expect(roles(highlight('css', '.hw-x { color: inherit; }'))).toEqual(expect.arrayContaining([['hw-x', 'tag'], ['color', 'property']]));
  });

  it('keeps unknown languages and shell as plain lines, including empty lines', () => {
    expect(highlight('shell', 'npm ci\n\nnpm test')).toEqual([[{ t: 'npm ci' }], [], [{ t: 'npm test' }]]);
    expect(highlight(null, 'x')).toEqual([[{ t: 'x' }]]);
  });

  it('reproduces the source text and uses only packaged roles', () => {
    const code = '<p class="hw-type" lang="en">Read <strong>this</strong>.</p>';
    const lines = highlight('html', code);
    expect(lines.map((line) => line.map((run) => run.t).join('')).join('\n')).toBe(code);
    for (const run of lines.flat()) if (run.r) expect(ROLES).toContain(run.r);
  });
});

describe('tokens', () => {
  it('keeps each markup text run as one token and splits other code at white space', () => {
    expect(tokens('html', '<p>Save the changes</p>').map((token) => [token.kind, token.text])).toEqual([
      ['punctuation', '<'], ['tag', 'p'], ['punctuation', '>'], ['text', 'Save the changes'], ['punctuation', '</'], ['tag', 'p'], ['punctuation', '>'],
    ]);
  });

  it('tokenises Angular template literals as HTML', () => {
    const list = tokens('ts', 'template: `<b>Go</b>`');
    expect(list.map((token) => token.text)).toEqual(['template', ':', '`', '<', 'b', '>', 'Go', '</', 'b', '>', '`']);
    expect(list.find((token) => token.text === 'Go').kind).toBe('text');
  });

  it('marks JSX text as text', () => {
    expect(tokens('tsx', '<Button>Continue now</Button>').filter((token) => token.kind === 'text')).toEqual([{ kind: 'text', text: 'Continue now' }]);
  });
});
