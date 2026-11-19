// Markdown parsing and the rejection of unsupported constructs (HWC-MD).

import { describe, expect, it } from 'vitest';
import { normalise, parseMarkdown, plainText } from '../parse.mjs';

const codes = (text) => parseMarkdown(text, 'x.md').findings.map((item) => [item.code, item.line, item.message]);

describe('parseMarkdown', () => {
  it('reads front matter, GFM tables and fenced code with meta', () => {
    const { tree, frontMatter, findings } = parseMarkdown('---\nsource:\n  a: b\n---\n# T\n\n| a |\n| - |\n| b |\n\n```html live example=x\n<p></p>\n```\n', 'x.md');
    expect(findings).toEqual([]);
    expect(frontMatter).toEqual({ value: 'source:\n  a: b', line: 1 });
    expect(tree.children.map((node) => node.type)).toEqual(['yaml', 'heading', 'table', 'code']);
    expect(tree.children[3]).toMatchObject({ lang: 'html', meta: 'live example=x' });
  });

  it('rejects raw HTML, images, reference links, definitions, footnotes, strikethrough and task items', () => {
    expect(codes('<div>x</div>\n')).toEqual([['HWC-MD', 1, 'raw HTML is not allowed; write Markdown']]);
    expect(codes('a <kbd>b</kbd>\n').length).toBe(2);
    expect(codes('![alt](x.png)\n')).toEqual([['HWC-MD', 1, 'images are not allowed in component pages']]);
    expect(codes('[a][r]\n\n[r]: https://example.com\n').map((item) => item[2])).toEqual([
      'reference-style links are not allowed; write the address inline',
      'link definitions are not allowed; write the address inline',
    ]);
    expect(codes('a[^1]\n\n[^1]: note\n').map((item) => item[2])).toEqual(['footnotes are not allowed', 'footnotes are not allowed']);
    expect(codes('~~gone~~\n')).toEqual([['HWC-MD', 1, 'strikethrough is not allowed']]);
    expect(codes('- [ ] task\n')).toEqual([['HWC-MD', 1, 'task list items are not allowed']]);
  });

  it('reports an unclosed fence where it opens and unknown keys of a block that is not live', () => {
    const missing = parseMarkdown('# A\n\n```html\n<p>a</p>\n\nText.\n', 'x.md').findings;
    expect(missing).toEqual([{ code: 'HWC-MD', file: 'x.md', line: 3, message: 'the fenced block that opens at line 3 has no closing fence' }]);
    const swallowed = parseMarkdown('```ts live example=a framework=angular\nx\n\n## Variants\n\n```html live example=b\n<p></p>\n```\n', 'x.md').findings;
    expect(swallowed.map((item) => [item.line, item.message])).toEqual([[1, 'the fenced block that opens at line 1 contains "## Variants" at line 4; its closing fence is probably missing']]);
    const keys = parseMarkdown('```html titel="Wrong" highlight=2\n<p></p>\n```\n\n```ts title="setup.ts"\nx\n```\n\n~~~text\n```html live example=a\n~~~\n', 'x.md').findings;
    expect(keys.map((item) => [item.line, item.message])).toEqual([[1, 'the info string "html titel="Wrong" highlight=2" has "titel="Wrong" highlight=2"; a code block that is not live takes only title="..."']]);
  });

  it('accepts inline links, autolinks, emphasis and hard breaks', () => {
    expect(codes('[a](https://example.com) *b* **c** `d`  \ne https://example.org\n')).toEqual([]);
  });

  it('normalises line endings and reads plain text', () => {
    expect(normalise('a\r\nb\rc')).toBe('a\nb\nc');
    const { tree } = parseMarkdown('# A *b* `c`\n', 'x.md');
    expect(plainText(tree.children[0])).toBe('A b c');
  });
});
