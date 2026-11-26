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

  // The Arabic page of Notification list: the highlighter breaks a string at each line end, so
  // a bound value and an Angular template over several lines were read one string per line.
  it('keeps a string written over several lines as one token, and an Angular template over several lines as HTML', () => {
    const bound = tokens('vue', '<NotificationList\n  :items="[\n    { read: true },\n  ]"\n/>');
    expect(bound.filter((token) => token.kind === 'string').map((token) => token.text)).toEqual(['"[\n    { read: true },\n  ]"']);
    const template = tokens('ts', 'template: `<hw-notification-list\n  label="Notifications"\n/>`');
    expect(template.map((token) => [token.kind, token.text])).toEqual([
      ['code', 'template'], ['punctuation', ':'], ['punctuation', '`'], ['punctuation', '<'], ['tag', 'hw-notification-list'],
      ['attribute', 'label'], ['punctuation', '='], ['string', '"Notifications"'], ['punctuation', '/>'], ['punctuation', '`'],
    ]);
  });

  it('reads an Angular template that closes a tag with /> as a Vue template does', () => {
    const list = tokens('ts', 'template: `<div class="hw-stack">\n  <hw-divider tone="primary" />\n  <hw-divider tone="gold" />\n</div>`');
    expect(list.filter((token) => token.kind === 'text')).toEqual([]);
    expect(list.filter((token) => token.kind === 'tag').map((token) => token.text)).toEqual(['div', 'hw-divider', 'hw-divider', 'div']);
  });

  it('marks JSX text as text', () => {
    expect(tokens('tsx', '<Button>Continue now</Button>').filter((token) => token.kind === 'text')).toEqual([{ kind: 'text', text: 'Continue now' }]);
  });

  // The intake of the first Arabic component pages: the text of a textarea is shown to the
  // reader as the value of the field, and was split into code tokens.
  it('marks the text content of a textarea as text', () => {
    expect(tokens('html', '<textarea class="hw-textarea" readonly>The request was received.</textarea>').filter((token) => token.kind === 'text')).toEqual([{ kind: 'text', text: 'The request was received.' }]);
    expect(tokens('ts', 'template: `<textarea>The request was received.</textarea>`').filter((token) => token.kind === 'text')).toEqual([{ kind: 'text', text: 'The request was received.' }]);
  });

  it('reads the control flow of an Angular template as code, and its text and interpolations as text', () => {
    const list = tokens('ts', 'template: `@if (open()) {<p>Your draft was saved.</p>} @else {<p>{{ count }} drafts</p>} @for (item of items(); track item.id) {<b>{{ item.name }}</b>}`');
    expect(list.filter((token) => token.kind === 'text').map((token) => token.text)).toEqual(['Your draft was saved.', '{{ count }} drafts', '{{ item.name }}']);
    expect(list.filter((token) => token.kind === 'code').map((token) => token.text)).toEqual(['template', '@if', '(open())', '{', '}', '@else', '{', '}', '@for', '(item', 'of', 'items();', 'track', 'item.id)', '{', '}']);
    // Outside an Angular template, an @ and a brace are text.
    expect(tokens('html', '<p>@if (open()) {</p>').filter((token) => token.kind === 'text')).toEqual([{ kind: 'text', text: '@if (open()) {' }]);
  });
});
