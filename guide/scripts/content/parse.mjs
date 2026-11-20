// Markdown to mdast (mdast-util-from-markdown with the GFM and front matter
// extensions) and the rejection of constructs the content model does not
// carry: raw HTML, images, reference-style links and definitions, footnotes,
// strikethrough and task list items (HWC-MD). The one raw HTML form accepted is
// the key element <kbd>text</kbd> (5a.7): text only, no attribute, no nesting,
// directly in a paragraph (also of a list item or an alert) or a table cell. It
// becomes an mdast node { type: 'kbd', value } and the content model's kbd inline.

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
  const source = normalise(text);
  const tree = fromMarkdown(source, {
    extensions: [gfm(), frontmatter(['yaml'])],
    mdastExtensions: [gfmFromMarkdown(), frontmatterFromMarkdown(['yaml'])],
  });
  const findings = [];
  foldKeys(tree, file, findings);
  let frontMatter = null;
  const visit = (node, parent) => {
    const line = node.position?.start.line ?? 1;
    if (node.type === 'yaml') {
      if (parent === tree && tree.children[0] === node) frontMatter = { value: node.value, line };
      else findings.push(finding('HWC-MD', file, line, 'a front matter block is allowed only at the start of the file'));
      return;
    }
    if (node.type === 'html' && node.reported) return;
    if (REJECTED[node.type]) {
      findings.push(finding('HWC-MD', file, line, REJECTED[node.type]));
      return;
    }
    if (node.type === 'listItem' && typeof node.checked === 'boolean') {
      findings.push(finding('HWC-MD', file, line, 'task list items are not allowed'));
    }
    if (node.type === 'code') findings.push(...codeFindings(node, source, file));
    for (const child of node.children ?? []) visit(child, node);
  };
  visit(tree, null);
  return { tree, frontMatter, findings };
}

const KBD_FORM = 'the one raw HTML form accepted is the key element <kbd>key</kbd>: text only, without attributes, nesting or line breaks, in a paragraph, list item or table cell';
/** Parents in which a key element may stand: a paragraph (also inside a list item or an alert) or a table cell. */
const KBD_PARENTS = new Set(['paragraph', 'tableCell']);

/**
 * Replaces each <kbd>text</kbd> (three nodes: html '<kbd>', text, html '</kbd>')
 * by a node { type: 'kbd', value, position, inner } where inner holds the offsets
 * of the text. Every other raw HTML node stays and is rejected by the visit of
 * parseMarkdown; a malformed key element gets its own message.
 */
function foldKeys(tree, file, findings) {
  const visit = (node) => {
    const children = node.children;
    if (!children) return;
    for (let i = 0; i < children.length; i += 1) {
      const child = children[i];
      if (child.type === 'html' && child.value === '<kbd>' && KBD_PARENTS.has(node.type)) {
        const text = children[i + 1];
        const close = children[i + 2];
        if (text?.type === 'text' && close?.type === 'html' && close.value === '</kbd>' && /^\S(?:[^\n]*\S)?$/.test(text.value)) {
          children.splice(i, 3, {
            type: 'kbd',
            value: text.value,
            position: { start: child.position.start, end: close.position.end },
            inner: { start: text.position.start.offset, end: text.position.end.offset },
          });
          continue;
        }
      }
      if (child.type === 'html' && /^<\/?kbd\b/i.test(child.value)) {
        findings.push(finding('HWC-MD', file, child.position?.start.line ?? 1, `"${child.value.slice(0, 40)}" is not a key element; ${KBD_FORM}`));
        child.reported = true;
      }
      visit(child);
    }
  };
  visit(tree);
}

/**
 * A fenced block whose closing fence is missing runs on to the next bare fence
 * or to the end of the file. It is reported where it opens: it has no closing
 * fence, or its content holds a heading or a fence opener of its own kind.
 * The info string of a block that is not live takes only title="...".
 */
export function codeFindings(node, source, file) {
  const findings = [];
  const start = node.position?.start;
  const end = node.position?.end;
  if (!start || !end) return findings;
  const raw = source.slice(start.offset, end.offset);
  const opener = /^[ \t]{0,3}(`{3,}|~{3,})/.exec(raw);
  if (!opener) return findings; // an indented block
  const fence = opener[1];
  const lines = raw.split('\n');
  const closing = new RegExp(`^[ \t]{0,3}${fence[0] === '`' ? '`' : '~'}{${fence.length},}[ \t]*$`);
  const content = (node.value ?? '').split('\n');
  const inner = content.findIndex((line) => /^#{2,6} \S/.test(line) || new RegExp(`^[ \t]{0,3}${fence[0] === '`' ? '`' : '~'}{3,}[A-Za-z]`).test(line));
  if (lines.length < 2 || !closing.test(lines.at(-1))) {
    findings.push(finding('HWC-MD', file, start.line, `the fenced block that opens at line ${start.line} has no closing fence`));
  } else if (inner !== -1) {
    findings.push(finding('HWC-MD', file, start.line, `the fenced block that opens at line ${start.line} contains "${content[inner].slice(0, 40)}" at line ${start.line + 1 + inner}; its closing fence is probably missing`));
  }
  const meta = node.meta ?? '';
  if (!meta.split(/\s+/).includes('live')) {
    const rest = meta.replace(/(?:^|\s)title="[^"]*"/, ' ').trim();
    if (rest !== '') findings.push(finding('HWC-MD', file, start.line, `the info string "${[node.lang, meta].filter(Boolean).join(' ')}" has "${rest}"; a code block that is not live takes only title="..."`));
  }
  return findings;
}

/** Plain text of an mdast node (text, inline code, key and break content). */
export function plainText(node) {
  if (!node) return '';
  if (node.type === 'text' || node.type === 'inlineCode' || node.type === 'kbd') return node.value;
  if (node.type === 'break') return '\n';
  return (node.children ?? []).map(plainText).join('');
}
