// The string map of an Arabic page (leadAmendments A10 of milestone 5): the
// Arabic text of each English reader string of the live blocks, once per string,
// applied to the four frameworks of every group.
//
// Only reader text is replaced: markup text, the string value of a reader
// attribute or text prop (READER_NAMES and READER_SUFFIX of parity.mjs, which
// HWC-PAR8 uses, and the text props of the component that the fact sheet lists),
// and any other string of two or more Latin words that HWC-PAR8 reads as reader
// text (rendersText: Stat trend, an item's content) when the map translates it.
// A string under value, defaultValue, modelValue, id, name, slot, key or any
// other token name is never replaced, whatever its text, so an option value or a
// slot name that equals a translated label stays as written.
//
// deriveStringMap reads the map from an existing English and Arabic pair: the
// strings and markup text of each live block of the same group and framework are
// aligned one by one (HWC-PAR4 already requires the blocks to align token by
// token); a block whose strings do not align is reported and contributes nothing.
import { parser as htmlBase } from '@lezer/html';
import { parser as jsBase } from '@lezer/javascript';
import { sectionId } from './hash.mjs';
import { parseMarkdown, plainText } from './parse.mjs';
import { LATIN_PHRASE, READER_NAMES, READER_SUFFIX, TOKEN_NAMES, bareName, unquote } from './parity.mjs';

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
          if (BOUND.test(name)) scanScript(quoted ? raw.slice(1, -1) : raw, offset + valueNode.from + (quoted ? 1 : 0), out, name);
          else out.push({ kind: 'string', key: unquote(raw), from: offset + valueNode.from, to: offset + valueNode.to, name });
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

function scanScript(code, offset, out, fallbackName) {
  const tree = scriptParser.parse(code);
  tree.iterate({
    enter(node) {
      if (node.name === 'TemplateString') {
        const raw = code.slice(node.from, node.to);
        const inner = raw.slice(1, -1);
        if (inner.includes('<') && !inner.includes('${')) scanMarkup(inner, offset + node.from + 1, out, vueMarkup);
        else out.push({ kind: 'string', key: inner, from: offset + node.from, to: offset + node.to, name: nameOf(code, node.node) ?? fallbackName });
        return false;
      }
      if (node.name === 'String') {
        out.push({ kind: 'string', key: unquote(code.slice(node.from, node.to)), from: offset + node.from, to: offset + node.to, name: nameOf(code, node.node) ?? fallbackName });
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
        if (valueNode && /^['"]/.test(code.slice(valueNode.from, valueNode.to))) {
          out.push({ kind: 'string', key: unquote(code.slice(valueNode.from, valueNode.to)), from: offset + valueNode.from, to: offset + valueNode.to, name });
          return false;
        }
        const escape = node.node.getChild('JSXEscape');
        if (escape) scanScript(code.slice(escape.from + 1, escape.to - 1), offset + escape.from + 1, out, name);
        return false;
      }
      return undefined;
    },
  });
}

/** Whether a candidate is reader text the map may replace. */
export function isReader(candidate, names) {
  if (candidate.kind === 'text') return true;
  if (!candidate.name) return false;
  const bare = bareName(candidate.name);
  if (VALUE_NAMES.has(bare) || TOKEN_NAMES.has(bare) || bare.startsWith('#') || bare.startsWith('v-slot')) return false;
  return names.has(bare) || READER_SUFFIX.test(bare.replace(/-/g, ''));
}

/**
 * Whether a candidate renders as reader text although the map does not replace it
 * (G9 of the 5a fix round): a string of two or more Latin words under a name that
 * is neither a reader name nor a token or value name (Stat trend, an accordion
 * item's content), as HWC-PAR8 reads it.
 */
export function rendersText(candidate, names) {
  if (candidate.kind !== 'string' || !candidate.name || isReader(candidate, names)) return false;
  const bare = bareName(candidate.name);
  if (VALUE_NAMES.has(bare) || TOKEN_NAMES.has(bare) || bare.startsWith('#') || bare.startsWith('v-slot')) return false;
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
  for (const block of english) {
    const other = arabic.find((item) => item.example === block.example && item.framework === block.framework);
    if (!other) continue;
    const en = candidates(block.lang, block.code);
    const ar = candidates(other.lang, other.code);
    if (en.length !== ar.length || en.some((item, index) => item.kind !== ar[index].kind || item.name !== ar[index].name)) {
      unaligned.push(`${block.example} (${block.framework}): the strings and text of the Arabic block do not align with the English block`);
      continue;
    }
    en.forEach((item, index) => {
      const peer = ar[index];
      if (item.key === peer.key || !ARABIC.test(peer.key) || !(isReader(item, names) || rendersText(item, names))) return;
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
 * @param {{ text?: boolean }} [options] text: replace every string that renders as reader
 *   text under another name (rendersText) from the map (the placeholder sibling does);
 *   without it such a string is replaced only when the map has its translation
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
  for (const item of candidates(lang, code)) {
    // A string that renders as reader text under another name takes a translation the map
    // has (the writer's own, read from the pair or given to scaffold-ar), never the placeholder
    // unless options.text; without one it is reported as left in English.
    if (!isReader(item, names)) {
      if (!rendersText(item, names)) continue;
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
