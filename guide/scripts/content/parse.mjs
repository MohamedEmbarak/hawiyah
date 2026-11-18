// Markdown to mdast (mdast-util-from-markdown with the GFM and front matter
// extensions) and the rejection of constructs the content model does not
// carry: raw HTML, images, reference-style links and definitions, footnotes,
// strikethrough and task list items (HWC-MD).

import { fromMarkdown } from 'mdast-util-from-markdown';
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { frontmatter } from 'micromark-extension-frontmatter';
import { gfm } from 'micromark-extension-gfm';
import { finding } from './config.mjs';

const REJECTED = {
  html: 'raw HTML is not allowed; write Markdown',
  image: 'images are not allowed in component pages',
  imageReference: 'images are not allowed in component pages',
  linkReference: 'reference-style links are not allowed; write the address inline',
  definition: 'link definitions are not allowed; write the address inline',
  footnoteReference: 'footnotes are not allowed',
  footnoteDefinition: 'footnotes are not allowed',
  delete: 'strikethrough is not allowed',
};

/** Normalises line endings to \n. */
export function normalise(text) {
  return text.replace(/\r\n?/g, '\n');
}

/**
 * @param {string} text Markdown source.
 * @param {string} file Repository-relative path for messages.
 * @returns {{ tree: any, frontMatter: { value: string, line: number } | null, findings: any[] }}
 */
export function parseMarkdown(text, file) {
  const tree = fromMarkdown(normalise(text), {
    extensions: [gfm(), frontmatter(['yaml'])],
    mdastExtensions: [gfmFromMarkdown(), frontmatterFromMarkdown(['yaml'])],
  });
  const findings = [];
  let frontMatter = null;
  const visit = (node, parent) => {
    const line = node.position?.start.line ?? 1;
    if (node.type === 'yaml') {
      if (parent === tree && tree.children[0] === node) frontMatter = { value: node.value, line };
      else findings.push(finding('HWC-MD', file, line, 'a front matter block is allowed only at the start of the file'));
      return;
    }
    if (REJECTED[node.type]) {
      findings.push(finding('HWC-MD', file, line, REJECTED[node.type]));
      return;
    }
    if (node.type === 'listItem' && typeof node.checked === 'boolean') {
      findings.push(finding('HWC-MD', file, line, 'task list items are not allowed'));
    }
    for (const child of node.children ?? []) visit(child, node);
  };
  visit(tree, null);
  return { tree, frontMatter, findings };
}

/** Plain text of an mdast node (text, inline code and break content). */
export function plainText(node) {
  if (!node) return '';
  if (node.type === 'text' || node.type === 'inlineCode') return node.value;
  if (node.type === 'break') return '\n';
  return (node.children ?? []).map(plainText).join('');
}
