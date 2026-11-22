// The string map of an Arabic page (leadAmendments A10 of milestone 5): the
// Arabic text of each English reader string of the live blocks, once per string,
// applied to the four frameworks of every group.
//
// Only reader text is replaced (isReader), in the four forms of a group: markup
// text; the string value of a reader attribute or text prop (READER_NAMES and
// READER_SUFFIX of parity.mjs, which HWC-PAR8 uses); a value that HWC-PAR8 reads as
// shown (the value of a text input, a text area or an output, the name or
// defaultValue of a data object; never the value of an input or component of type
// email, url, tel or number, which is Latin by nature); the value, defaultValue or
// default-value of a component when the native markup of the same group shows that
// string as a value; any other string under a name that is not a token name when
// the same group reads that string as reader text (a card's category, an item's
// term, which the html block shows as text); and any other string of two or more
// Latin words that HWC-PAR8 reads as reader text (rendersText: Stat trend, an
// item's content) when the map translates it. A string under id, name, slot, key or
// any other token name, the value of an option, a check box or a radio button, the
// value of an object property and a component value that no native element of the
// group shows are never replaced, whatever their text, so an option value or a slot
// name that equals a translated label stays as written.
//
// deriveStringMap reads the map from an existing English and Arabic pair: the
// strings and markup text of each live block of the same group and framework are
// aligned one by one (HWC-PAR4 already requires the blocks to align token by
// token); a block whose strings do not align is reported and contributes nothing.
import { parser as htmlBase } from '@lezer/html';
import { parser as jsBase } from '@lezer/javascript';
import { sectionId } from './hash.mjs';
import { parseMarkdown, plainText } from './parse.mjs';
import { LATIN_PHRASE, READER_NAMES, READER_SUFFIX, SHOWN_VALUE_NAMES, TOKEN_NAMES, bareName, unquote, valueShownBy } from './parity.mjs';

const ARABIC = /[؀-ۿ]/;
const VALUE_NAMES = new Set(['value', 'defaultvalue', 'default-value', 'modelvalue', 'model-value', 'v-model', 'checked', 'selected']);
const LIVE_LANGS = { html: 'vanilla', tsx: 'react', jsx: 'react', vue: 'vue', ts: 'angular' };

/** Names whose string values are reader text: the global rule plus the component's own text props. */
export function readerNames(extra = []) {
  return new Set([...READER_NAMES, ...extra.map((name) => name.toLowerCase())]);
}

/** Text props of a component: string members whose names are reader names (for the fact sheet). */
export function textProps(declared) {
  const names = new Set();
  for (const framework of ['vanilla', 'react', 'vue', 'angular']) {
    for (const member of declared[framework]?.members ?? []) {
      if (!['prop', 'input', 'option'].includes(member.kind)) continue;
      const bare = member.name.replace(/^hw-[a-z-]+ /, '').toLowerCase();
      const textual = /\bstring\b|ReactNode/.test(member.type ?? '') || member.type === null;
      if (textual && (READER_NAMES.has(bare) || READER_SUFFIX.test(bare.replace(/-/g, '')))) names.add(member.name.replace(/^hw-[a-z-]+ /, ''));
    }
  }
  return [...names].sort();
}

const scriptParser = jsBase.configure({ dialect: 'ts jsx' });
/** Vue and Angular templates close any tag with "/>": the selfClosing dialect keeps </div> after <Stat ... /> a closing tag (G9 of the 5a fix round). */
const vueMarkup = htmlBase.configure({ dialect: 'selfClosing' });
const BOUND = /^(?::|v-bind:|@|v-on:|v-|\[|\(|\*|#)/;

/**
 * The strings and markup text of a live block in document order:
 * [{ kind: 'text' | 'string', key, from, to, name }], where key is the text (white
 * space collapsed) or the unquoted string, from and to its range in the block, and
 * name the attribute or property it is the value of (null when it has none).
 * Angular templates (template literals with markup) and bound Vue and Angular
 * attribute values (:items="...", [label]="...") are read as markup and as script
 * respectively, so their strings carry their own names.
 */
export function candidates(lang, code) {
  const out = [];
  if (lang === 'html' || lang === 'vue') scanMarkup(code, 0, out, lang === 'vue' ? vueMarkup : htmlBase);
  else scanScript(code, 0, out, null);
  return out;
}

function pushText(out, code, from, to, offset) {
  const raw = code.slice(from, to);
  const start = raw.search(/\S/);
  if (start < 0) return;
  const end = raw.length - (raw.length - raw.trimEnd().length);
  out.push({ kind: 'text', key: raw.trim().replace(/\s+/g, ' '), from: offset + from + start, to: offset + from + end, name: null });
}

/** The tag name and the type attribute of the markup element that holds an attribute node. */
function markupElement(code, attribute) {
  const tag = attribute.parent;
  const nameNode = tag?.getChild('TagName');
  let type = null;
  for (const item of tag?.getChildren('Attribute') ?? []) {
    const nameOfItem = item.getChild('AttributeName');
    const valueOfItem = item.getChild('AttributeValue') ?? item.getChild('UnquotedAttributeValue');
    if (nameOfItem && valueOfItem && bareName(code.slice(nameOfItem.from, nameOfItem.to)) === 'type') type = unquote(unquote(code.slice(valueOfItem.from, valueOfItem.to)));
  }
  return { tag: nameNode ? code.slice(nameNode.from, nameNode.to) : '', type };
}

/** The tag name and the type attribute of the JSX element that holds a JSXAttribute node. */
function jsxElement(code, attribute) {
  const tag = attribute.parent;
  const nameNode = tag?.getChild('JSXBuiltin') ?? tag?.getChild('JSXIdentifier') ?? tag?.getChild('JSXMemberExpression');
  let type = null;
  for (const item of tag?.getChildren('JSXAttribute') ?? []) {
    const nameOfItem = item.firstChild;
    const valueOfItem = item.getChild('JSXAttributeValue');
    if (nameOfItem && valueOfItem && code.slice(nameOfItem.from, nameOfItem.to) === 'type') type = unquote(code.slice(valueOfItem.from, valueOfItem.to));
  }
  return { tag: nameNode ? code.slice(nameNode.from, nameNode.to) : '', type };
}

function scanMarkup(code, offset, out, markup = htmlBase) {
  const tree = markup.parse(code);
  tree.iterate({
    enter(node) {
      if (node.name === 'Text') {
        pushText(out, code, node.from, node.to, offset);
        return false;
      }
      if (node.name === 'ScriptText') {
        scanScript(code.slice(node.from, node.to), offset + node.from, out, null);
        return false;
      }
      if (node.name === 'StyleText' || node.name === 'Comment') return false;
      if (node.name === 'Attribute') {
        const nameNode = node.node.getChild('AttributeName');
        const valueNode = node.node.getChild('AttributeValue');
        const name = nameNode ? code.slice(nameNode.from, nameNode.to) : '';
        if (valueNode) {
          const raw = code.slice(valueNode.from, valueNode.to);
          const quoted = /^['"]/.test(raw);
          const element = markupElement(code, node.node);
          if (BOUND.test(name)) scanScript(quoted ? raw.slice(1, -1) : raw, offset + valueNode.from + (quoted ? 1 : 0), out, name, element);
          else out.push({ kind: 'string', key: unquote(raw), from: offset + valueNode.from, to: offset + valueNode.to, name, ...element, property: false });
        }
        return false;
      }
      return undefined;
    },
  });
}

function nameOf(code, node) {
  const parent = node.parent;
  if (parent?.name === 'Property') {
    const key = parent.getChild('PropertyDefinition') ?? parent.firstChild;
    return key ? unquote(code.slice(key.from, key.to)) : null;
  }
  return null;
}

const NO_ELEMENT = { tag: '', type: null };

function scanScript(code, offset, out, fallbackName, element = NO_ELEMENT) {
  const tree = scriptParser.parse(code);
  // A string is the value of an object property (property: true), or of the attribute the expression is bound to.
  const named = (node) => {
    const own = nameOf(code, node);
    return own !== null ? { name: own, property: true, ...element } : { name: fallbackName, property: false, ...element };
  };
  tree.iterate({
    enter(node) {
      if (node.name === 'TemplateString') {
        const raw = code.slice(node.from, node.to);
        const inner = raw.slice(1, -1);
        if (inner.includes('<') && !inner.includes('${')) scanMarkup(inner, offset + node.from + 1, out, vueMarkup);
        else out.push({ kind: 'string', key: inner, from: offset + node.from, to: offset + node.to, ...named(node.node) });
        return false;
      }
      if (node.name === 'String') {
        out.push({ kind: 'string', key: unquote(code.slice(node.from, node.to)), from: offset + node.from, to: offset + node.to, ...named(node.node) });
        return false;
      }
      if (node.name === 'JSXText') {
        pushText(out, code, node.from, node.to, offset);
        return false;
      }
      if (node.name === 'JSXAttribute') {
        const nameNode = node.node.firstChild;
        const valueNode = node.node.getChild('JSXAttributeValue');
        const name = nameNode ? code.slice(nameNode.from, nameNode.to) : null;
        const own = jsxElement(code, node.node);
        if (valueNode && /^['"]/.test(code.slice(valueNode.from, valueNode.to))) {
          out.push({ kind: 'string', key: unquote(code.slice(valueNode.from, valueNode.to)), from: offset + valueNode.from, to: offset + valueNode.to, name, ...own, property: false });
          return false;
        }
        const escape = node.node.getChild('JSXEscape');
        if (escape) scanScript(code.slice(escape.from + 1, escape.to - 1), offset + escape.from + 1, out, name, own);
        return false;
      }
      return undefined;
    },
  });
}

const isComponent = (tag) => /^[A-Z]/.test(tag ?? '') || (tag ?? '').includes('-');
const tokenName = (bare) => VALUE_NAMES.has(bare) || TOKEN_NAMES.has(bare) || bare.startsWith('#') || bare.startsWith('v-slot');

/**
 * Whether a candidate is a value that HWC-PAR8 reads as shown on its own: the value
 * of a native element that shows it (a text input, a text area, an output; not an
 * input of type email, url, tel or number, whose value is Latin by nature), and the
 * name or defaultValue of a data object.
 */
export function nativeShownValue(candidate) {
  if (candidate.kind !== 'string' || !candidate.name) return false;
  const bare = bareName(candidate.name);
  if (candidate.property) return bare === 'name' || bare === 'defaultvalue';
  return SHOWN_VALUE_NAMES.has(bare) && !isComponent(candidate.tag) && valueShownBy(candidate.tag ?? '', candidate.type);
}

/** An empty group context: what applyStringMap knows of a block without its group. */
const NO_GROUP = { readerKeys: new Set(), shownValues: new Set() };

/**
 * Whether a candidate is reader text the map may replace: markup text; the value of a
 * reader name; a shown value (nativeShownValue); and, from the other blocks of its
 * group (groupContext), the value, defaultValue or default-value of a component
 * that the native markup of the group shows as a value (the defaultValue of a text
 * field), and a string under any other name that is not a token name whose text the
 * group reads as reader text (the category of a card or the term of an item, which
 * the html block shows as text).
 */
export function isReader(candidate, names, group = NO_GROUP) {
  if (candidate.kind === 'text') return true;
  if (!candidate.name) return false;
  const bare = bareName(candidate.name);
  if (nativeShownValue(candidate)) return true;
  if (!candidate.property && SHOWN_VALUE_NAMES.has(bare) && isComponent(candidate.tag)) {
    return valueShownBy(candidate.tag, candidate.type) && group.shownValues.has(candidate.key);
  }
  if (tokenName(bare)) return false;
  return names.has(bare) || READER_SUFFIX.test(bare.replace(/-/g, '')) || group.readerKeys.has(candidate.key);
}

/**
 * What the blocks of one group read as reader text, for isReader: readerKeys, the
 * strings that are reader text in some block of the group by their own name or place
 * (markup text, a reader name, a shown value), and shownValues, the values that a
 * native element of the group shows.
 * @param {{ lang: string, code: string }[]} blocks the blocks of one group (English)
 */
export function groupContext(blocks, names = readerNames()) {
  const readerKeys = new Set();
  const shownValues = new Set();
  for (const block of blocks) {
    for (const item of candidates(block.lang, block.code)) {
      if (nativeShownValue(item) && !item.property) shownValues.add(item.key);
      if (isReader(item, names) && /[A-Za-z]/.test(item.key)) readerKeys.add(item.key);
    }
  }
  return { readerKeys, shownValues };
}

/** The group context of each live group of a page, by example name. */
export function groupContexts(blocks, names = readerNames()) {
  const byExample = new Map();
  for (const block of blocks) {
    if (!byExample.has(block.example)) byExample.set(block.example, []);
    byExample.get(block.example).push(block);
  }
  return new Map([...byExample].map(([example, list]) => [example, groupContext(list, names)]));
}

/**
 * Whether a candidate renders as reader text although the map does not replace it
 * (G9 of the 5a fix round): a string of two or more Latin words under a name that
 * is neither a reader name nor a token or value name (Stat trend, an accordion
 * item's content), as HWC-PAR8 reads it.
 */
export function rendersText(candidate, names, group = NO_GROUP) {
  if (candidate.kind !== 'string' || !candidate.name || isReader(candidate, names, group)) return false;
  const bare = bareName(candidate.name);
  if (tokenName(bare)) return false;
  return LATIN_PHRASE.test(candidate.key) && !ARABIC.test(candidate.key);
}

/** Live blocks of a Markdown page: [{ example, framework, lang, code, node }]. */
export function liveBlocks(text) {
  const { tree } = parseMarkdown(text, 'page.md');
  const out = [];
  let section = null;
  const visit = (node) => {
    if (node.type === 'heading' && node.depth === 2) section = sectionId(plainText(node).trim());
    if (node.type === 'code' && (node.meta ?? '').split(/\s+/).includes('live')) {
      const example = /(?:^|\s)example=([^\s]+)/.exec(node.meta ?? '')?.[1] ?? null;
      const framework = node.lang === 'ts' ? 'angular' : LIVE_LANGS[node.lang] ?? null;
      out.push({ example, framework, lang: node.lang, code: node.value ?? '', node, section });
    }
    for (const child of node.children ?? []) visit(child);
  };
  visit(tree);
  return out;
}

/**
 * Reads the string map from an English and an Arabic page.
 * @returns {{ map: Record<string, string>, origins: Record<string, string[]>, conflicts: string[], unaligned: string[] }}
 *   origins: the sections of the blocks each translation was read from
 */
export function deriveStringMap(englishText, arabicText) {
  const english = liveBlocks(englishText);
  const arabic = liveBlocks(arabicText);
  const map = {};
  const origins = {};
  const conflicts = [];
  const unaligned = [];
  const names = readerNames();
  const contexts = groupContexts(english, names);
  for (const block of english) {
    const other = arabic.find((item) => item.example === block.example && item.framework === block.framework);
    if (!other) continue;
    const group = contexts.get(block.example);
    const en = candidates(block.lang, block.code);
    const ar = candidates(other.lang, other.code);
    if (en.length !== ar.length || en.some((item, index) => item.kind !== ar[index].kind || item.name !== ar[index].name)) {
      unaligned.push(`${block.example} (${block.framework}): the strings and text of the Arabic block do not align with the English block`);
      continue;
    }
    en.forEach((item, index) => {
      const peer = ar[index];
      if (item.key === peer.key || !ARABIC.test(peer.key) || !(isReader(item, names, group) || rendersText(item, names, group))) return;
      (origins[item.key] ??= new Set()).add(block.section);
      if (map[item.key] === undefined) map[item.key] = peer.key;
      else if (map[item.key] !== peer.key) conflicts.push(`"${item.key}" is "${map[item.key]}" and "${peer.key}" (${block.example}, ${block.framework})`);
    });
  }
  return { map, origins: Object.fromEntries(Object.entries(origins).map(([key, set]) => [key, [...set]])), conflicts, unaligned };
}

function requote(raw, value) {
  const quote = raw[0];
  if (!['"', "'", '`'].includes(quote)) return value;
  return `${quote}${value.replace(new RegExp(`[\\\\${quote}]`, 'g'), (char) => `\\${char}`)}${quote}`;
}

/**
 * Applies a string map to one live block.
 * @param {{ text?: boolean, group?: { readerKeys: Set<string>, shownValues: Set<string> } }} [options] text: replace
 *   every string that renders as reader text under another name (rendersText) from the map (the
 *   placeholder sibling does); without it such a string is replaced only when the map has its
 *   translation. group: the groupContext of the English group of the block, without which a
 *   component's value and a string under another name are read from the block alone
 * @returns {{ code: string, missing: string[], left: string[], used: string[], replaced: number }} missing:
 *   reader strings with Latin letters that the map does not translate; left: strings that
 *   render as reader text under another name, which the map does not replace
 *   ('<name>: <text>'); used: the map keys it applied
 */
export function applyStringMap(lang, code, map, names = readerNames(), options = {}) {
  const edits = [];
  const missing = [];
  const left = [];
  const used = new Set();
  const group = options.group ?? NO_GROUP;
  for (const item of candidates(lang, code)) {
    // A string that renders as reader text under another name takes a translation the map
    // has (the writer's own, read from the pair or given to scaffold-ar), never the placeholder
    // unless options.text; without one it is reported as left in English.
    if (!isReader(item, names, group)) {
      if (!rendersText(item, names, group)) continue;
      if (!options.text && !Object.hasOwn(map, item.key)) {
        left.push(`${item.name}: ${item.key}`);
        continue;
      }
    }
    const value = Object.hasOwn(map, item.key) ? map[item.key] : undefined;
    if (value === undefined) {
      if (/[A-Za-z]/.test(item.key) && !ARABIC.test(item.key)) missing.push(item.key);
      continue;
    }
    const raw = code.slice(item.from, item.to);
    used.add(item.key);
    edits.push({ from: item.from, to: item.to, text: item.kind === 'string' ? requote(raw, value) : value });
  }
  let out = code;
  for (const edit of edits.sort((a, b) => b.from - a.from)) out = out.slice(0, edit.from) + edit.text + out.slice(edit.to);
  return { code: out, missing: [...new Set(missing)], left: [...new Set(left)], used: [...used], replaced: edits.length };
}
