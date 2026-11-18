// Headings contract and per-file rules on variations of the valid fixture.

import { describe, expect, it } from 'vitest';
import { parseMarkdown } from '../parse.mjs';
import { alertKind, analysePage } from '../structure.mjs';
import { components, validAr, validEn } from './helpers.mjs';

const analyse = (text, lang = 'en') => {
  const parsed = parseMarkdown(text, 'x.md');
  return analysePage({ tree: parsed.tree, frontMatter: parsed.frontMatter, lang, file: 'x.md', id: 'fixture-a', entry: components.get('fixture-a') });
};
const codes = (text, lang) => analyse(text, lang).findings.map((item) => item.code);
const replace = (text, from, to) => {
  if (!text.includes(from)) throw new Error(`fixture text not found: ${from}`);
  return text.replace(from, to);
};

describe('analysePage', () => {
  it('accepts both valid fixture pages and returns their outline', () => {
    const en = analyse(validEn());
    expect(en.findings).toEqual([]);
    expect(en.sections.map((section) => section.id)).toEqual(['example', 'variants-and-states', 'api', 'accessibility', 'rtl-and-localisation', 'platforms-code-reference']);
    expect(en.groups.map((group) => [group.example, group.section])).toEqual([['primary', 'example'], ['direction', 'variants-and-states']]);
    expect(en.tables.map((table) => table.api)).toEqual(['javascript', 'react', 'vue', 'angular', null]);
    expect(en.alerts.map((alert) => [alert.kind, alert.section])).toEqual([['note', 'accessibility']]);
    expect(analyse(validAr(), 'ar').findings).toEqual([]);
  });

  it('requires the h1 on the first line and the summary as one paragraph of one or two sentences', () => {
    expect(codes(`\n${validEn()}`)).toContain('HWC-H1');
    expect(codes(replace(validEn(), 'contract allows.\n', 'contract allows.\n\nA second paragraph.\n'))).toContain('HWC-SUM');
    expect(codes(replace(validEn(), 'contract allows.', 'contract allows'))).toEqual([]);
    expect(codes(replace(validEn(), 'Fixture A is a test page of the content pipeline. It uses every construct the authoring contract allows.', 'No sentence end'))).toContain('HWC-SUM');
  });

  it('enforces the h2 set, order and the required sections', () => {
    expect(codes(replace(validEn(), '## Accessibility', '## Accessibility notes'))).toContain('HWC-H2');
    const swapped = replace(replace(validEn(), '## Example\n', '## TEMP\n'), '## Variants and states\n', '## Example\n');
    expect(codes(swapped)).toContain('HWC-H2');
    expect(analyse(replace(validEn(), '## Example\n', '## مثال\n')).findings[0].message).toBe('the h2 "مثال" is in the other language; write "Example"');
    expect(codes(replace(validAr(), '## مثال', '## Example'), 'ar')).toContain('HWC-H2');
  });

  it('checks the API section headings, header rows and cells', () => {
    expect(codes(replace(validEn(), '### Vue\n', '### Svelte\n'))).toContain('HWC-API');
    expect(codes(replace(validEn(), '| `change` | event |', '| `change` | emit |'))).toContain('HWC-API');
    expect(codes(replace(validEn(), '| `label` | `string` | `true` | — |\n| `size`', '| label | `string` | yes | — |\n| `size`'))).toEqual(['HWC-API', 'HWC-API']);
  });

  it('requires h4 under h3 and rejects h5 and h6', () => {
    expect(codes(replace(validEn(), '### Screen readers\n\n', ''))).toContain('HWC-H5');
    expect(codes(replace(validEn(), '#### Announcements', '###### Announcements'))).toContain('HWC-H5');
  });

  it('requires a caption in the language of the page directly above each table', () => {
    expect(codes(replace(validEn(), 'Table: Keyboard', 'جدول: Keyboard'))).toContain('HWC-TAB1');
    expect(codes(replace(validEn(), 'The state is announced *once*.', 'Table: Orphan caption'))).toContain('HWC-TAB1');
  });

  it('places live groups in Example and under h3 of Variants and states only', () => {
    const moved = replace(validEn(), '## Platforms Code reference\n', `## Platforms Code reference\n\n${'```html live example=late\n<p class="hw-type">A</p>\n```\n\n```tsx live example=late\n<p className="hw-type">A</p>\n```\n\n```vue live example=late\n<p class="hw-type">A</p>\n```\n\n```ts live example=late framework=angular\ntemplate: `<p class="hw-type">A</p>`\n```\n'}`);
    expect(codes(moved)).toEqual(['HWC-LIVE2']);
    expect(codes(replace(validEn(), 'The example shows one primary action.', '- A list is not allowed here.'))).toEqual(['HWC-H2']);
  });

  it('reads GitHub alert kinds', () => {
    const kind = (text) => alertKind(parseMarkdown(text, 'x.md').tree.children[0]);
    expect(kind('> [!WARNING]\n> Body.\n')).toBe('warning');
    expect(kind('> [!caution]\n> Body.\n')).toBe('caution');
    expect(kind('> [!OTHER]\n> Body.\n')).toBe(null);
    expect(kind('> A quotation.\n')).toBe(null);
  });

  it('requires valid Arabic front matter and rejects English front matter', () => {
    expect(codes(validAr().replace(/^---[\s\S]*?---\n/, ''), 'ar')).toEqual(['HWC-FM2']);
    expect(codes(replace(validAr(), '  api: 76babfc30d7b', '  api: [1, 2]'), 'ar')).toContain('HWC-FM2');
  });
});
