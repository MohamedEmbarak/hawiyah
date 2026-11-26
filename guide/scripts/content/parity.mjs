import { sameDocument } from './kinds.mjs';
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
// with a reason. A value that is Latin by nature is not reader text: the value of an
// input or component of type email, url, tel or number (LATIN_VALUE_TYPES), a
// value without any letter, and markup text that is one host name (HOST_NAME). Only
// reader text is judged: the value of a bound attribute
// (EXPRESSION_ATTRIBUTE) is an expression, of which only the string literals count; the
// value of a component that its group writes as an option value or as the data-hw-value
// of a vanilla item, and the value of a
// data-* attribute that the stylesheet selects (styleHooks), are tokens; the name of a
// component is reader text only where its group reads it so (groupReading); the text of
// a textarea is markup text, and the control flow of an Angular template and the
// interpolations of a template (INTERPOLATION) are code (highlight.mjs).

import { readFileSync } from 'node:fs';
import { FRAMEWORKS, finding } from './config.mjs';
import { sectionHashes, splitSections } from './hash.mjs';
import { tokens } from './highlight.mjs';
import { keyParityFindings } from './keys.mjs';

const lineOf = (node) => node?.position?.start.line ?? 1;
const ARABIC = /[؀-ۿ]/;
const BCP47 = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/;
// Hawiyah class names ('hw-button') match the BCP 47 pattern; 'hw' is no
// language subtag, so they are never read as language tags.
const isLanguageTag = (value) => BCP47.test(value) && !value.startsWith('hw-');
export const unquote = (text) => text.replace(/^(['"`])(.*)\1$/s, '$2');

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

/**
 * Exceptions to HWC-PAR8: [{ file, text, reason, approvedBy }] (an empty list is the goal). The list is the
 * lead's (leadAmendments A4 of milestone 5; scripts/api-tables/lists.mjs caps the entries per page).
 */
export const ARABIC_EXCEPTIONS_FILE = new URL('./arabic-exceptions.json', import.meta.url);
/** The shortest text an entry of arabic-exceptions.json or latin-allowlist.json may name (G13 of the 5a fix round). */
export const MIN_EXCEPTION_TEXT = 12;

export function readArabicExceptions(file = ARABIC_EXCEPTIONS_FILE) {
  const list = JSON.parse(readFileSync(file, 'utf8'));
  if (!Array.isArray(list)) throw new Error('arabic-exceptions.json must hold an array');
  list.forEach((entry, index) => {
    const keys = Object.keys(entry ?? {});
    if (keys.sort().join(',') !== 'approvedBy,file,reason,text' || keys.some((key) => typeof entry[key] !== 'string' || entry[key].trim() === '')) {
      throw new Error(`arabic-exceptions.json entry ${index + 1} must be { file, text, reason, approvedBy } with non-empty values`);
    }
    if (entry.text.trim().length < MIN_EXCEPTION_TEXT) throw new Error(`arabic-exceptions.json entry ${index + 1}: the text "${entry.text}" is shorter than ${MIN_EXCEPTION_TEXT} characters; an entry names the whole text it excepts`);
  });
  return list;
}

/** Text of a node without inline code, links' addresses or the content of code blocks. */
function proseText(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value;
  if (node.type === 'inlineCode' || node.type === 'code' || node.type === 'html' || node.type === 'kbd') return ' ';
  return (node.children ?? []).map(proseText).join(' ');
}

const LETTER = /\p{L}/u;
// Key names stay Latin, as printed on the key (the Arabic glossary,
// docs/guides/glossary.md), so text made only of key names needs no Arabic.
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

/** An interpolation of a Vue or Angular template in markup text ({{ item }}): code, whose value the application supplies. */
export const INTERPOLATION = /\{\{[\s\S]*?\}\}/g;
/**
 * Markup text that is one host name (portal.example.test): Latin by nature, as the
 * value of an input of type url is, so it needs no Arabic letter.
 */
export const HOST_NAME = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/;

/** Attributes and properties of a live block whose string values are reader text. */
export const READER_NAMES = new Set(['label', 'aria-label', 'title', 'placeholder', 'alt', 'description', 'heading', 'caption', 'hint', 'message', 'text']);
/** A name that ends in one of these words (overflowLabel, data-hw-overflow-label, copiedMessage, ...) also holds reader text. */
export const READER_SUFFIX = /(?:label|message|text|title)$/;
/**
 * Attributes and properties whose values are tokens, not text: a phrase of Latin
 * words there is not reader text.
 */
export const TOKEN_NAMES = new Set(['class', 'classname', 'id', 'role', 'type', 'href', 'src', 'rel', 'style', 'autocomplete', 'for', 'htmlfor', 'form', 'key', 'ref', 'slot', 'lang', 'dir', 'name', 'value', 'aria-controls', 'aria-labelledby', 'aria-describedby', 'aria-owns', 'aria-flowto', 'aria-details', 'aria-errormessage', 'aria-activedescendant']);
/**
 * value, defaultValue and name are tokens where nothing shows them (the value of an
 * option or a check box, the name of a form field), and reader text where they are
 * shown: the value of a text field, a text area or a button input, the defaultValue
 * of a field component, and the name of a data object (a person, a file) that a list
 * renders.
 */
export const SHOWN_VALUE_NAMES = new Set(['value', 'defaultvalue', 'default-value', 'modelvalue', 'model-value']);
const HIDDEN_VALUE_TYPES = new Set(['checkbox', 'radio', 'hidden', 'color', 'range', 'file', 'image']);
/**
 * Input types whose value is Latin by nature (an email address, a URL, a telephone
 * number, a number): the value of an input, or of a component, with one of these
 * types is not reader text, in every framework form (value, defaultValue,
 * default-value, the Angular value).
 */
export const LATIN_VALUE_TYPES = new Set(['email', 'url', 'tel', 'number']);
/**
 * Whether the value of an element is shown to the reader as text, from its tag and
 * its type attribute: a component (React or Vue name, custom element) passes the value
 * to a field it shows, as do textarea, output and an input of a text type; a value of
 * an email, url, tel or number type is Latin by nature, and option, button, data, li,
 * param and the other elements do not show their value.
 */
export function valueShownBy(tag, type) {
  const kind = String(type ?? 'text').toLowerCase();
  if (LATIN_VALUE_TYPES.has(kind)) return false;
  if (/^[A-Z]/.test(tag) || tag.includes('-')) return true;
  if (tag === 'textarea' || tag === 'output') return true;
  if (tag === 'input') return !HIDDEN_VALUE_TYPES.has(kind);
  return false;
}
/** Whether a tag names a component (a React or Vue name, a custom element) rather than a native element. */
export const isComponentTag = (tag) => /^[A-Z]/.test(tag ?? '') || (tag ?? '').includes('-');
/** The element of the attribute token at index: its tag (after the nearest opening < before it) and its type attribute. */
function elementOf(list, index) {
  let at = index;
  while (at > 0 && !(list[at].kind === 'tag' && list[at - 1]?.text === '<')) at -= 1;
  const tag = at > 0 ? list[at].text : '';
  // The type of the element (type="email", [type]="'email'"), wherever it stands among its attributes.
  let type = null;
  for (let j = at + 1; at > 0 && j < list.length && list[j].text !== '>' && list[j].text !== '/>'; j += 1) {
    if (list[j].kind === 'attribute' && bareName(list[j].text) === 'type' && list[j + 2]?.kind === 'string') type = unquote(unquote(list[j + 2].text));
  }
  return { tag, type };
}
/** Whether a value-like string token is shown to the reader, from its name and its element. */
function shownValue(list, index, name, bare) {
  if (name.kind === 'property') return bare === 'name' || bare === 'defaultvalue';
  if (!SHOWN_VALUE_NAMES.has(bare)) return false;
  const { tag, type } = elementOf(list, list.lastIndexOf(name, index));
  return valueShownBy(tag, type);
}
/** The attribute or property token that names the string token at index: the nearest one before it. */
const nameTokenOf = (list, index) => list.slice(0, index).reverse().find((item) => item.kind === 'attribute' || item.kind === 'property');
/**
 * Attributes whose value is an expression, not text: a Vue bound prop, directive or
 * slot (:name, v-bind:name, @event, v-on:event, v-if, #name) and an Angular property, event or
 * structural binding ([name], (event), *ngIf). Only the string literals inside the
 * expression can be reader text.
 */
export const EXPRESSION_ATTRIBUTE = /^(?::|v-bind:|@|v-on:|v-|#|\[|\(|\*)/;
/** The types of an input whose value is an option value, which the reader does not see. */
const CHOICE_TYPES = new Set(['checkbox', 'radio']);

const STYLESHEET = new URL('../../node_modules/@hawiyah/styles/dist/styles.css', import.meta.url);
let styleHookCache = null;
/**
 * The data-* attributes that the installed @hawiyah/styles/dist/styles.css selects
 * ([data-message], [data-status='error']): styling hooks, whose values are tokens.
 * The stylesheet never renders the value of an attribute as text.
 * @param {URL | string} [file]
 */
export function styleHooks(file = STYLESHEET) {
  const key = String(file);
  if (styleHookCache?.key === key) return styleHookCache.names;
  const css = readFileSync(file, 'utf8');
  const names = new Set([...css.matchAll(/\[\s*(data-[A-Za-z0-9_-]+)\s*(?:[~|^$*]?=|\])/g)].map((match) => match[1].toLowerCase()));
  styleHookCache = { key, names };
  return names;
}

/**
 * What the blocks of one live group read as reader text and as option values, for
 * HWC-PAR8: reader, the markup text, the values of reader names and the values that a
 * native element shows (a text input, a text area, an output); options, the values of
 * an option, a check box or a radio button, and the data-hw-value of an item of a
 * vanilla controller (a tab).
 * @param {{ blocks: Record<string, { lang: string, code: string }> }} group
 */
export function groupReading(group) {
  const reader = new Set();
  const options = new Set();
  for (const block of Object.values(group?.blocks ?? {})) {
    const list = tokens(block.lang, block.code);
    list.forEach((token, index) => {
      if (token.kind === 'text') reader.add(token.text);
      if (token.kind !== 'string') return;
      const name = nameTokenOf(list, index);
      if (!name || name.kind !== 'attribute') return;
      const bare = bareName(name.text);
      const value = unquote(unquote(token.text));
      const { tag, type } = elementOf(list, list.lastIndexOf(name, index));
      if (READER_NAMES.has(bare) || READER_SUFFIX.test(bare.replace(/-/g, ''))) reader.add(value);
      if (isComponentTag(tag)) return;
      if (shownValue(list, index, name, bare)) reader.add(value);
      if (bare === 'value' && (tag === 'option' || (tag === 'input' && CHOICE_TYPES.has(String(type ?? '').toLowerCase())))) options.add(value);
      // The value of an item of a vanilla controller (a tab, a toggle, a tree item): the value of the item, which no element shows.
      if (bare === 'data-hw-value') options.add(value);
    });
  }
  return { reader, options };
}
/** Two or more words of Latin letters in a row: a phrase a reader reads, wherever it stands. */
export const LATIN_PHRASE = /(?:^|\s)[A-Za-z]+(?:[.,;:!?])?\s+[A-Za-z]+(?=[.,;:!?]?(?:\s|$))/;
/**
 * Headings (h2 to h6) of an Arabic page that stay Latin: names of the frameworks,
 * written as their projects write them (the h3 of the four API tables).
 */
const LATIN_HEADINGS = new Set(['JavaScript', 'React', 'Vue', 'Angular']);
/** The bare name of an attribute or property token (:label, @click, [label], (change) -> label). */
export const bareName = (text) => text.replace(/^[:@[(]+|[\])]+$/g, '').replace(/^v-bind:/, '').toLowerCase();

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
  // An entry names the whole text of a paragraph, item, cell or string (G13 of the 5a fix round), never a part of it.
  const excepted = (text) => exceptions.some((entry) => sameDocument(entry.file, ar.file) && text === entry.text.replace(/\s+/g, ' ').trim());
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
  const hooks = sources.styleHooks ?? styleHooks();
  const sameTokens = (a, b) => a.length === b.length && a.every((token, index) => tokensMatch(token, b[index]));
  for (const group of ar.groups) {
    // What the group reads as reader text and as option values decides the component
    // props below: from the English group where the Arabic block has its tokens, so a
    // string left in English is judged where its English form is reader text.
    const english = en.groups.find((item) => item.example === group.example);
    const readings = { ar: groupReading(group), en: english ? groupReading(english) : null };
    for (const framework of FRAMEWORKS) {
      const block = group.blocks[framework];
      const at = { position: { start: { line: block.line } } };
      const where = `live block "${group.example}" (${framework})`;
      const list = tokens(block.lang, block.code);
      const englishBlock = english?.blocks[framework];
      const englishList = englishBlock ? tokens(englishBlock.lang, englishBlock.code) : null;
      const aligned = Boolean(englishList && readings.en && sameTokens(englishList, list));
      const reading = aligned ? readings.en : readings.ar;
      // owner: the bound attribute whose expression the list is, with its own list and index.
      const judge = (items, references, owner = null) => items.forEach((token, index) => {
        const text = unquote(token.text);
        if (token.kind === 'text') {
          // The reader reads the text around an interpolation ({{ item }}), whose value the application supplies.
          const shown = text.replace(INTERPOLATION, ' ').replace(/\s+/g, ' ').trim();
          if (notArabic(shown) && !HOST_NAME.test(shown)) requireArabic(at, text, `${where} text`);
          return;
        }
        if (token.kind !== 'string') return;
        const reference = references ? unquote(references[index].text) : text;
        const own = nameTokenOf(items, index);
        const name = own ?? owner?.name;
        const context = own ? { list: items, index } : owner;
        const bare = name ? bareName(name.text) : '';
        // An expression is not reader text; the string literals inside it can be.
        if (own?.kind === 'attribute' && EXPRESSION_ATTRIBUTE.test(own.text) && items[index - 1]?.text === '=' && items[index - 2] === own) {
          const inner = tokens('ts', text);
          const innerReferences = references ? tokens('ts', reference) : null;
          judge(inner, innerReferences && sameTokens(innerReferences, inner) ? innerReferences : null, { name: own, list: items, index });
          return;
        }
        // A data-* attribute that the stylesheet selects is a styling hook: its value is a token.
        if (name?.kind === 'attribute' && bare.startsWith('data-') && hooks.has(bare)) return;
        const component = name?.kind === 'attribute' && isComponentTag(elementOf(context.list, context.list.lastIndexOf(name, context.index)).tag);
        // The value of a component that the group writes as the value of an option, a check box or a radio button is an option value.
        if (component && SHOWN_VALUE_NAMES.has(bare) && reading.options.has(reference)) return;
        const reader = name && (READER_NAMES.has(bare) || READER_SUFFIX.test(bare.replace(/-/g, '')) || shownValue(context.list, context.index, name, bare)
          // The name of a component is a field name unless the group reads it as reader text (the name of an Avatar).
          || (component && bare === 'name' && reading.reader.has(reference)));
        const phrase = !TOKEN_NAMES.has(bare) && LATIN_PHRASE.test(text);
        if (reader || phrase) requireArabic(at, text, `${where} ${name?.text ?? 'string'}`);
      });
      judge(list, aligned ? englishList : null);
    }
  }

  // HWC-KEYS the same keys in the same order (5a.7).
  findings.push(...keyParityFindings(en, ar));

  // HWC-PAR6 alerts.
  const enAlerts = en.alerts.map((alert) => `${alert.kind}@${alert.section}`);
  const arAlerts = ar.alerts.map((alert) => `${alert.kind}@${alert.section}`);
  if (enAlerts.join('|') !== arAlerts.join('|')) {
    push('HWC-PAR6', lineOf(ar.alerts[0]?.node ?? ar.h1), `the alerts are ${arAlerts.join(', ') || 'none'} in Arabic and ${enAlerts.join(', ') || 'none'} in English; both pages have the same alert kinds at the same positions`);
  }

  // HWC-STALE section hashes (only when the front matter itself is valid).
  if (ar.source) {
    // A guide's h2 are free text: its Arabic sections take the ids of the English sections by position.
    const current = sectionHashes(enText, { kind: en.kind });
    const arSections = splitSections(arText, en.kind === 'guide' ? { ids: splitSections(enText, { kind: 'guide' }).map((section) => section.id) } : {});
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
