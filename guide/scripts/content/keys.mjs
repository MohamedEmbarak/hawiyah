// Key elements and the keyboard table of a page (5a.7, 5a.8; HWC-KEYS).
//
// A key element <kbd>...</kbd> names one key of KEY_NAMES (config.mjs) in the
// language of its page: a key name as printed on the key, an arrow key by its
// name in that language. The keyboard table stands in the Accessibility section
// with a fixed caption and the headers Key | Action; each Key cell holds key
// elements only: a chord joins keys with '+', alternatives are separated by a
// comma (an Arabic comma in Arabic) or by 'or' ('أو'). Parity: the same keys in
// the same order in both languages, paragraph by paragraph and cell by cell; a
// cell made only of arrow keys may order them per language (leadAmendments A3).

import { ARROW_KEYS, KEYBOARD_TABLE, KEY_NAMES, finding, keyId } from './config.mjs';
import { plainText } from './parse.mjs';

const lineOf = (node) => node?.position?.start.line ?? 1;
const OTHER = { en: 'ar', ar: 'en' };
const SEPARATORS = new Set([',', '،', 'or', 'أو']);

/** Every key element of a tree, in document order. */
function keyNodes(node, out = []) {
  if (node.type === 'kbd') out.push(node);
  for (const child of node.children ?? []) keyNodes(child, out);
  return out;
}

/** HWC-KEYS for a key element whose text is not a key name of its language. */
export function keyNameFindings(body, lang, file) {
  const findings = [];
  for (const node of keyNodes({ children: body })) {
    if (keyId(node.value, lang)) continue;
    const other = keyId(node.value, OTHER[lang]);
    const hint = other
      ? `; in ${lang === 'ar' ? 'Arabic' : 'English'} this key is written ${KEY_NAMES[other][lang]}`
      : `; the key names are ${[...new Set(Object.values(KEY_NAMES).map((names) => names[lang]))].join(', ')} (KEY_NAMES of scripts/content/config.mjs)`;
    findings.push(finding('HWC-KEYS', file, lineOf(node), `the key element "${node.value}" names no key${hint}`));
  }
  return findings;
}

/**
 * The keys of a Key cell as chords ('Shift+Tab'), or an error message.
 * @param {any} cell an mdast tableCell
 */
export function cellKeys(cell, lang) {
  const chords = [];
  let chord = [];
  let expectKey = true;
  let joiner = null;
  for (const node of cell.children ?? []) {
    if (node.type === 'kbd') {
      if (!expectKey) return { error: 'two key elements stand next to each other; join a chord with + and separate alternatives with a comma' };
      chord.push(keyId(node.value, lang) ?? node.value);
      expectKey = false;
      continue;
    }
    const text = node.type === 'text' ? node.value.trim() : null;
    if (text === '') continue;
    if (expectKey || text === null || (text !== '+' && !SEPARATORS.has(text))) {
      return { error: `the Key cell holds "${plainText(node).trim() || node.type}"; it holds key elements only, joined by + in a chord and separated by a comma` };
    }
    if (text === '+') joiner = '+';
    else {
      chords.push(chord.join('+'));
      chord = [];
      joiner = null;
    }
    expectKey = true;
  }
  if (expectKey) return { error: joiner || chords.length ? 'the Key cell ends with a separator' : 'the Key cell has no key element' };
  chords.push(chord.join('+'));
  return { keys: chords };
}

/**
 * The keyboard table of a page: its caption, headers and rows, checked. Returns
 * { table: { caption, rows: [{ keys, action }] } | null, findings }.
 * @param {{ node: any, captionNode: any, section: string | null }[]} tables the tables of analysePage()
 */
export function keyboardTable(tables, lang, entry, file) {
  const findings = [];
  const push = (node, message) => findings.push(finding('HWC-KEYS', file, lineOf(node), message));
  const form = KEYBOARD_TABLE[lang];
  const caption = (table) => plainText(table.captionNode ?? {}).replace(/^(?:Table: |جدول: )/, '').trim();
  const found = tables.filter((table) => caption(table).startsWith(form.marker));
  if (found.length === 0) return { table: null, findings };
  for (const extra of found.slice(1)) push(extra.node, 'a page has one keyboard table');
  const [table] = found;
  const expected = form.caption(entry);
  if (caption(table) !== expected) push(table.captionNode, `the keyboard table caption is "${caption(table)}"; write "${expected}"`);
  if (table.section !== 'accessibility') push(table.node, 'the keyboard table stands in the Accessibility section');
  const [head, ...rows] = table.node.children;
  const headers = head.children.map((cell) => plainText(cell).trim());
  if (headers.join('|') !== form.headers.join('|')) {
    push(table.node, `the keyboard table header is "| ${headers.join(' | ')} |"; write "| ${form.headers.join(' | ')} |"`);
    return { table: null, findings };
  }
  const out = [];
  for (const row of rows) {
    const keys = cellKeys(row.children[0], lang);
    const action = plainText(row.children[1] ?? {}).replace(/\s+/g, ' ').trim();
    if (keys.error) push(row, keys.error);
    else if (keys.keys.some((chord) => chord.split('+').some((key) => !KEY_NAMES[key]))) continue; // named by keyNameFindings
    if (!action) push(row, 'the Action cell of the keyboard table is empty');
    if (!keys.error) out.push({ keys: keys.keys, action });
  }
  return { table: { caption: caption(table), node: table.node, rows: out }, findings };
}

/** The keys of each paragraph and table cell of a section, in document order. */
function keyUnits(nodes) {
  const units = [];
  const visit = (node) => {
    if (node.type === 'paragraph' || node.type === 'tableCell' || node.type === 'heading') {
      units.push({ node, keys: keyNodes(node).map((key) => key.value) });
      return;
    }
    for (const child of node.children ?? []) visit(child);
  };
  nodes.forEach(visit);
  return units;
}

/**
 * HWC-KEYS parity of the key elements of an Arabic page with its English page.
 * Units that cannot be aligned are left to HWC-PAR1, HWC-PAR5 and HWC-PAR7.
 */
export function keyParityFindings(en, ar) {
  const findings = [];
  for (const section of en.sections) {
    const other = ar.sections.find((item) => item.id && item.id === section.id);
    if (!section.id || !other) continue;
    const a = keyUnits(section.children);
    const b = keyUnits(other.children);
    if (a.length !== b.length) continue;
    a.forEach((unit, index) => {
      const enKeys = unit.keys.map((text) => keyId(text, 'en') ?? text);
      const arKeys = b[index].keys.map((text) => keyId(text, 'ar') ?? text);
      if (enKeys.join(' ') === arKeys.join(' ')) return;
      const sameSet = [...enKeys].sort().join(' ') === [...arKeys].sort().join(' ');
      if (sameSet && enKeys.every((key) => ARROW_KEYS.has(key))) return;
      findings.push(finding('HWC-KEYS', ar.file, lineOf(b[index].node), `the keys ${arKeys.join(', ') || 'none'} in Arabic differ from ${enKeys.join(', ') || 'none'} in English; both pages name the same keys in the same order (only a cell of arrow keys may order them per language)`));
    });
  }
  return findings;
}
