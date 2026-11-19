// Parity of the Arabic page with the English page (contentPipeline.parity):
// HWC-PAR1 to HWC-PAR8 and the section hash check HWC-STALE. Findings are
// reported against the Arabic file. HWC-PAR7: the same sequence of blocks in
// every section (paragraphs, lists and their items, code, tables, alerts,
// headings). HWC-PAR8: Arabic script in every Arabic paragraph, list item,
// heading h2 to h6 (except the framework names of LATIN_HEADINGS), table cell
// outside code and API tables, and in the reader text of the live blocks (a value
// of a reader name such as label or aria-label, of a name that ends in label,
// message, text or title, or any string that holds a phrase of Latin words outside
// the token names of TOKEN_NAMES), unless arabic-exceptions.json lists the text
// with a reason.

import { readFileSync } from 'node:fs';
import { FRAMEWORKS, finding } from './config.mjs';
import { sectionHashes, splitSections } from './hash.mjs';
import { tokens } from './highlight.mjs';

const lineOf = (node) => node?.position?.start.line ?? 1;
const ARABIC = /[؀-ۿ]/;
const BCP47 = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/;
// Hawiyah class names ('hw-button') match the BCP 47 pattern; 'hw' is no
// language subtag, so they are never read as language tags.
const isLanguageTag = (value) => BCP47.test(value) && !value.startsWith('hw-');
const unquote = (text) => text.replace(/^(['"`])(.*)\1$/s, '$2');

/** Whether an English and an Arabic live token may differ (contentPipeline.liveBlocks.forms.text). */
export function tokensMatch(en, ar) {
  if (en.text === ar.text && en.kind === ar.kind) return true;
  const textual = (token) => token.kind === 'string' || token.kind === 'text';
  if (textual(en) && textual(ar) && en.kind === ar.kind && ARABIC.test(ar.text)) return true;
  const a = unquote(en.text);
  const b = unquote(ar.text);
  if (en.kind === ar.kind && isLanguageTag(a) && isLanguageTag(b)) return true;
  if (en.kind === ar.kind && new Set([a, b]).size === 2 && [a, b].every((value) => value === 'rtl' || value === 'ltr')) return true;
  return false;
}

/** Exceptions to HWC-PAR8: [{ file, text, reason }] (an empty list is the goal). */
export const ARABIC_EXCEPTIONS_FILE = new URL('./arabic-exceptions.json', import.meta.url);

export function readArabicExceptions(file = ARABIC_EXCEPTIONS_FILE) {
  const list = JSON.parse(readFileSync(file, 'utf8'));
  if (!Array.isArray(list)) throw new Error('arabic-exceptions.json must hold an array');
  list.forEach((entry, index) => {
    const keys = Object.keys(entry ?? {});
    if (keys.sort().join(',') !== 'file,reason,text' || keys.some((key) => typeof entry[key] !== 'string' || entry[key].trim() === '')) {
      throw new Error(`arabic-exceptions.json entry ${index + 1} must be { file, text, reason } with non-empty values`);
    }
  });
  return list;
}

/** Text of a node without inline code, links' addresses or the content of code blocks. */
function proseText(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value;
  if (node.type === 'inlineCode' || node.type === 'code' || node.type === 'html') return ' ';
  return (node.children ?? []).map(proseText).join(' ');
}

const LETTER = /\p{L}/u;
// Key names stay Latin, as printed on the key (the Arabic glossary of
// docs/components/README.md), so text made only of key names needs no Arabic.
const KEY_NAME = /^(?:Tab|Enter|Space|Escape|Esc|Home|End|Page ?Up|Page ?Down|Shift|Ctrl|Control|Alt|Option|Meta|Cmd|Command|Backspace|Delete|Insert|Arrow(?:Up|Down|Left|Right)|F(?:[1-9]|1[0-2]))$/;
const onlyKeyNames = (text) => text.split(/\s*[,،+/]\s*|\s+(?:و|or|and)\s+/).every((part) => KEY_NAME.test(part.trim()));
/**
 * Reader text without Arabic script: letters, none of them Arabic. Text made only of
 * key names is exempt in table cells (the Key column of a keyboard table) and nowhere
 * else: a heading, paragraph or list item named Tab, Option or Delete is a word to
 * translate.
 */
// An Arabic letter, not only an Arabic comma or digit of the block.
const ARABIC_LETTER = /(?=\p{Script=Arabic})\p{L}/u;
const notArabic = (text, keyCell = false) => LETTER.test(text) && !ARABIC_LETTER.test(text) && !(keyCell && onlyKeyNames(text));

/** Attributes and properties of a live block whose string values are reader text. */
const READER_NAMES = new Set(['label', 'aria-label', 'title', 'placeholder', 'alt', 'description', 'heading', 'caption', 'hint', 'message', 'text']);
/** A name that ends in one of these words (overflowLabel, data-hw-overflow-label, copiedMessage, ...) also holds reader text. */
const READER_SUFFIX = /(?:label|message|text|title)$/;
/**
 * Attributes and properties whose values are tokens, not text: a phrase of Latin
 * words there is not reader text.
 */
const TOKEN_NAMES = new Set(['class', 'classname', 'id', 'role', 'type', 'href', 'src', 'rel', 'style', 'autocomplete', 'for', 'htmlfor', 'form', 'key', 'ref', 'slot', 'lang', 'dir', 'name', 'value', 'aria-controls', 'aria-labelledby', 'aria-describedby', 'aria-owns', 'aria-flowto', 'aria-details', 'aria-errormessage', 'aria-activedescendant']);
/**
 * value, defaultValue and name are tokens where nothing shows them (the value of an
 * option or a check box, the name of a form field), and reader text where they are
 * shown: the value of a text field, a text area or a button input, the defaultValue
 * of a field component, and the name of a data object (a person, a file) that a list
 * renders.
 */
const SHOWN_VALUE_NAMES = new Set(['value', 'defaultvalue', 'default-value', 'modelvalue', 'model-value']);
const HIDDEN_VALUE_TYPES = new Set(['checkbox', 'radio', 'hidden', 'color', 'range', 'file', 'image']);
/** Whether a value-like string token is shown to the reader, from its name and its element. */
function shownValue(list, index, name, bare) {
  if (name.kind === 'property') return bare === 'name' || bare === 'defaultvalue';
  if (!SHOWN_VALUE_NAMES.has(bare)) return false;
  // The element of the attribute: the tag after the nearest opening < before it.
  let at = list.lastIndexOf(name, index);
  while (at > 0 && !(list[at].kind === 'tag' && list[at - 1]?.text === '<')) at -= 1;
  const tag = at > 0 ? list[at].text : '';
  // A component (React or Vue name, custom element) passes the value to a field it shows.
  if (/^[A-Z]/.test(tag) || tag.includes('-')) return true;
  if (tag === 'textarea' || tag === 'output') return true;
  if (tag === 'input') {
    let type = 'text';
    for (let j = at + 1; j < list.length && list[j].text !== '>' && list[j].text !== '/>'; j += 1) {
      if (list[j].kind === 'attribute' && list[j].text.toLowerCase() === 'type' && list[j + 2]?.kind === 'string') type = unquote(list[j + 2].text).toLowerCase();
    }
    return !HIDDEN_VALUE_TYPES.has(type);
  }
  // option, button, data, li, param and the other elements do not show their value.
  return false;
}
/** Two or more words of Latin letters in a row: a phrase a reader reads, wherever it stands. */
const LATIN_PHRASE = /(?:^|\s)[A-Za-z]+(?:[.,;:!?])?\s+[A-Za-z]+(?=[.,;:!?]?(?:\s|$))/;
/**
 * Headings (h2 to h6) of an Arabic page that stay Latin: names of the frameworks,
 * written as their projects write them (the h3 of the four API tables).
 */
const LATIN_HEADINGS = new Set(['JavaScript', 'React', 'Vue', 'Angular']);
/** The bare name of an attribute or property token (:label, @click, [label], (change) -> label). */
const bareName = (text) => text.replace(/^[:@[(]+|[\])]+$/g, '').replace(/^v-bind:/, '').toLowerCase();

/** Block signature of a section, for HWC-PAR7. */
function blockSignature(node) {
  switch (node.type) {
    case 'paragraph': return /^(?:Table: |جدول: )/.test(node.children?.[0]?.value ?? '') ? 'caption' : 'paragraph';
    case 'heading': return `h${node.depth}`;
    case 'list': return `${node.ordered ? 'ordered' : 'bulleted'} list of ${node.children.length} items (${node.children.map((item) => item.children.map(blockSignature).join('+')).join(' | ')})`;
    case 'blockquote': return /^\[!/.test(node.children?.[0]?.children?.[0]?.value ?? '') ? 'alert' : 'quotation';
    case 'code': return 'code';
    case 'table': return 'table';
    case 'thematicBreak': return 'rule';
    default: return node.type;
  }
}

/** First differing token of two live blocks, or null. */
export function liveTokenDifference(lang, englishCode, arabicCode) {
  const en = tokens(lang, englishCode);
  const ar = tokens(lang, arabicCode);
  const length = Math.max(en.length, ar.length);
  for (let i = 0; i < length; i += 1) {
    if (!en[i] || !ar[i] || !tokensMatch(en[i], ar[i])) return { index: i, en: en[i] ?? null, ar: ar[i] ?? null };
  }
  return null;
}

const tableShape = (table) => ({
  section: table.section,
  columns: table.node.children[0]?.children.length ?? 0,
  rows: Math.max(0, table.node.children.length - 1),
});

function rowSource(text, row) {
  return text.slice(row.position.start.offset, row.position.end.offset).replace(/[ \t]+$/gm, '');
}

/**
 * @param {any} en English outline
 * @param {any} ar Arabic outline
 * @param {{ enText: string, arText: string, id: string, exceptions?: { file: string, text: string, reason: string }[] }} sources
 */
export function checkParity(en, ar, sources) {
  const { enText, arText, id } = sources;
  const findings = [];
  const push = (code, line, message) => findings.push(finding(code, ar.file, line, message));

  // HWC-PAR1 heading tree.
  const describe = (heading) => (heading.level === 2 ? `h2 "${heading.section ?? heading.text}"` : `h${heading.level}`);
  const enHeadings = en.headings.map((heading) => ({ ...heading, section: heading.level === 2 ? en.sections.find((s) => s.node === heading.node)?.id : null }));
  const arHeadings = ar.headings.map((heading) => ({ ...heading, section: heading.level === 2 ? ar.sections.find((s) => s.node === heading.node)?.id : null }));
  for (let i = 0; i < Math.max(enHeadings.length, arHeadings.length); i += 1) {
    const e = enHeadings[i];
    const a = arHeadings[i];
    if (!e || !a || e.level !== a.level || (e.level === 2 && e.section !== a.section)) {
      push('HWC-PAR1', lineOf(a?.node ?? ar.h1), `heading ${i + 1} is ${a ? describe(a) : 'missing'} in Arabic and ${e ? describe(e) : 'missing'} in English; both pages have the same heading tree`);
      break;
    }
  }

  // HWC-PAR2 code blocks other than live blocks.
  for (let i = 0; i < Math.max(en.codeBlocks.length, ar.codeBlocks.length); i += 1) {
    const e = en.codeBlocks[i];
    const a = ar.codeBlocks[i];
    if (!e || !a || e.lang !== a.lang || e.value !== a.value) {
      push('HWC-PAR2', lineOf(a ?? ar.h1), `code block ${i + 1} differs from the English page; code blocks other than live blocks are identical in both languages, in the same order and language`);
      break;
    }
  }

  // HWC-PAR3 live groups; HWC-PAR4 live tokens.
  const signature = (group) => `${group.example} (${group.section}${group.h3 ? ', h3' : ''})`;
  const enGroups = en.groups.map(signature);
  const arGroups = ar.groups.map(signature);
  if (enGroups.join('|') !== arGroups.join('|')) {
    push('HWC-PAR3', lineOf(ar.groups[0]?.first ?? ar.h1), `the live groups are ${arGroups.join(', ') || 'none'} in Arabic and ${enGroups.join(', ') || 'none'} in English; both pages have the same groups, names and frameworks in the same order`);
  } else {
    en.groups.forEach((group, index) => {
      const other = ar.groups[index];
      for (const framework of FRAMEWORKS) {
        const e = group.blocks[framework];
        const a = other.blocks[framework];
        const difference = liveTokenDifference(e.lang, e.code, a.code);
        if (difference) {
          const show = (token) => (token ? `"${token.text}"` : 'nothing');
          push('HWC-PAR4', a.line, `live block "${group.example}" (${framework}) differs from the English block at token ${difference.index + 1}: ${show(difference.ar)} in Arabic, ${show(difference.en)} in English; only strings and text in Arabic, language tags and rtl/ltr may differ`);
        }
      }
    });
  }

  // HWC-PAR5 tables.
  if (en.tables.length !== ar.tables.length) {
    push('HWC-PAR5', lineOf(ar.tables[0]?.node ?? ar.h1), `the page has ${ar.tables.length} tables in Arabic and ${en.tables.length} in English`);
  } else {
    en.tables.forEach((table, index) => {
      const other = ar.tables[index];
      const a = tableShape(table);
      const b = tableShape(other);
      if (a.section !== b.section || a.columns !== b.columns || a.rows !== b.rows) {
        push('HWC-PAR5', lineOf(other.node), `table ${index + 1} has ${b.columns} columns and ${b.rows} rows in section ${b.section} in Arabic; English has ${a.columns} columns and ${a.rows} rows in section ${a.section}`);
        return;
      }
      if (table.api && other.api) {
        table.node.children.slice(1).forEach((row, rowIndex) => {
          const otherRow = other.node.children[rowIndex + 1];
          if (rowSource(enText, row) !== rowSource(arText, otherRow)) {
            push('HWC-PAR5', lineOf(otherRow), `row ${rowIndex + 1} of the ${table.api} API table differs from the English row; API table bodies are byte-identical in both languages`);
          }
        });
      }
    });
  }

  // HWC-PAR7 block sequence of every section.
  for (const section of en.sections) {
    const other = ar.sections.find((item) => item.id && item.id === section.id);
    if (!section.id || !other) continue; // reported by HWC-PAR1
    const a = section.children.map(blockSignature);
    const b = other.children.map(blockSignature);
    const index = a.findIndex((value, i) => value !== b[i]);
    const at = index === -1 && a.length !== b.length ? a.length : index;
    if (at !== -1 && (index !== -1 || a.length !== b.length)) {
      push('HWC-PAR7', lineOf(other.children[at] ?? other.node), `section "${section.id}" has ${b[at] ?? 'nothing'} as block ${at + 1} in Arabic and ${a[at] ?? 'nothing'} in English; both pages have the same paragraphs, lists, items and other blocks in the same order`);
    }
  }

  // HWC-PAR8 Arabic script in the reader text of the Arabic page.
  const exceptions = sources.exceptions ?? [];
  const excepted = (text) => exceptions.some((entry) => entry.file === ar.file && text.includes(entry.text));
  const requireArabic = (node, text, where, keyCell = false) => {
    const value = text.replace(/\s+/g, ' ').trim();
    if (notArabic(value, keyCell) && !excepted(value)) push('HWC-PAR8', lineOf(node), `${where} has no Arabic script: "${value.slice(0, 80)}"; translate it, or list it in scripts/content/arabic-exceptions.json with a reason`);
  };
  const apiTables = new Set(ar.tables.filter((table) => table.api).map((table) => table.node));
  const prose = (node) => {
    if (node.type === 'paragraph') requireArabic(node, proseText(node), 'the paragraph');
    else if (node.type === 'list') {
      for (const item of node.children) {
        const own = item.children.filter((child) => child.type !== 'list');
        requireArabic(item, own.map(proseText).join(' '), 'the list item');
        item.children.filter((child) => child.type === 'list').forEach(prose);
      }
    } else if (node.type === 'blockquote') node.children.forEach(prose);
    else if (node.type === 'table' && !apiTables.has(node)) {
      for (const row of node.children) for (const cell of row.children) requireArabic(cell, proseText(cell), 'the table cell', true);
    }
  };
  for (const node of ar.summaryNodes ?? []) prose(node);
  for (const section of ar.sections) section.children.forEach(prose);
  for (const heading of ar.headings) {
    const text = proseText(heading.node).replace(/\s+/g, ' ').trim();
    if (heading.level >= 2 && !LATIN_HEADINGS.has(text)) requireArabic(heading.node, text, `the h${heading.level}`);
  }
  for (const group of ar.groups) {
    for (const framework of FRAMEWORKS) {
      const block = group.blocks[framework];
      const list = tokens(block.lang, block.code);
      list.forEach((token, index) => {
        const text = unquote(token.text);
        if (token.kind === 'text') requireArabic({ position: { start: { line: block.line } } }, text, `live block "${group.example}" (${framework}) text`);
        else if (token.kind === 'string') {
          const name = list.slice(0, index).reverse().find((item) => item.kind === 'attribute' || item.kind === 'property');
          const bare = name ? bareName(name.text) : '';
          const reader = name && (READER_NAMES.has(bare) || READER_SUFFIX.test(bare.replace(/-/g, '')) || shownValue(list, index, name, bare));
          const phrase = !TOKEN_NAMES.has(bare) && LATIN_PHRASE.test(text);
          if (reader || phrase) {
            requireArabic({ position: { start: { line: block.line } } }, text, `live block "${group.example}" (${framework}) ${name?.text ?? 'string'}`);
          }
        }
      });
    }
  }

  // HWC-PAR6 alerts.
  const enAlerts = en.alerts.map((alert) => `${alert.kind}@${alert.section}`);
  const arAlerts = ar.alerts.map((alert) => `${alert.kind}@${alert.section}`);
  if (enAlerts.join('|') !== arAlerts.join('|')) {
    push('HWC-PAR6', lineOf(ar.alerts[0]?.node ?? ar.h1), `the alerts are ${arAlerts.join(', ') || 'none'} in Arabic and ${enAlerts.join(', ') || 'none'} in English; both pages have the same alert kinds at the same positions`);
  }

  // HWC-STALE section hashes (only when the front matter itself is valid).
  if (ar.source) {
    const current = sectionHashes(enText);
    const arSections = splitSections(arText);
    for (const section of arSections) {
      const now = current[section.id];
      if (now === undefined) continue;
      const old = ar.source[section.id];
      if (old !== now) {
        push('HWC-STALE', section.line, `section "${section.id}" was translated from an earlier English text (${old ?? 'no hash'}, now ${now}); update the translation, then run npm run content:hash -- ${id}`);
      }
    }
    for (const key of Object.keys(ar.source)) {
      if (!arSections.some((section) => section.id === key)) push('HWC-FM2', 1, `source lists the section "${key}", which this page does not have`);
    }
  }
  return findings;
}
