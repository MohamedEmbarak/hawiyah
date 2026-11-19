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
  const source = normalise(text);
  const tree = fromMarkdown(source, {
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
    if (node.type === 'code') findings.push(...codeFindings(node, source, file));
    for (const child of node.children ?? []) visit(child, node);
  };
  visit(tree, null);
  return { tree, frontMatter, findings };
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

/** Plain text of an mdast node (text, inline code and break content). */
export function plainText(node) {
  if (!node) return '';
  if (node.type === 'text' || node.type === 'inlineCode') return node.value;
  if (node.type === 'break') return '\n';
  return (node.children ?? []).map(plainText).join('');
}
