// The Arabic glossary (docs/guides/glossary.md): its tables and
// the forms it excludes, each a JavaScript regular expression in code. Read by
// scripts/content/test/glossary.test.mjs and by check:page.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { gfm } from 'micromark-extension-gfm';

export const GLOSSARY_FILE = fileURLToPath(new URL('../../../docs/guides/glossary.md', import.meta.url));

const cellText = (cell) => (cell.children ?? []).map((node) => (node.type === 'text' || node.type === 'inlineCode' ? node.value : cellText(node))).join('').trim();

/** The tables of the glossary by caption: { caption: rows of cell texts (the header row first) }. */
export function glossaryTables(text) {
  const tree = fromMarkdown(text, { extensions: [gfm()], mdastExtensions: [gfmFromMarkdown()] });
  const tables = {};
  tree.children.forEach((node, index) => {
    const caption = tree.children[index - 1];
    if (node.type !== 'table' || caption?.type !== 'paragraph') return;
    const name = cellText(caption).replace(/^Table: /, '');
    tables[name] = node.children.map((row) => row.children.map(cellText));
  });
  return tables;
}

/** The excluded forms: [{ form: RegExp, use }] from the table of the glossary. */
export function readExcluded(text) {
  const rows = glossaryTables(text)['Forms the glossary excludes'] ?? [];
  return rows.slice(1).map(([literal, use]) => {
    const match = /^\/(.+)\/([a-z]*)$/s.exec(literal);
    if (!match) throw new Error(`glossary: the excluded form ${literal} is not a regular expression literal`);
    return { form: new RegExp(match[1], match[2]), use };
  });
}

/** Lines of `text` that contain a form of `excluded` (readExcluded of the glossary): '<line>: <text> (use <term>)'. */
export function excludedLines(text, excluded = readExcluded(readFileSync(GLOSSARY_FILE, 'utf8'))) {
  const found = [];
  text.split('\n').forEach((line, index) => {
    for (const { form, use } of excluded) if (form.test(line)) found.push({ line: index + 1, text: line.trim().slice(0, 60), use });
  });
  return found;
}
