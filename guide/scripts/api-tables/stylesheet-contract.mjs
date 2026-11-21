// The documented stylesheet contract of a component without a vanilla
// controller (leadAmendments A6). @hawiyah/styles documents its stable classes
// and attributes in the table under '## Stable class and state API' of its
// README.md; the row (or rows) naming one of the component's classes from
// components.json give the classes and the data-* and aria-* attributes of the
// component. Attributes that HTML or ARIA define (type, disabled, aria-busy on a
// button) have no machine-readable Hawiyah declaration and are listed per
// component in exclusions.json with the reason.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const HEADING = '## Stable class and state API';

function cells(line) {
  const body = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  const out = [];
  let current = '';
  let code = false;
  for (let i = 0; i < body.length; i += 1) {
    const char = body[i];
    if (char === '`') code = !code;
    if (char === '\\' && body[i + 1] === '|') { current += '|'; i += 1; continue; }
    if (char === '|' && !code) { out.push(current.trim()); current = ''; continue; }
    current += char;
  }
  out.push(current.trim());
  return out;
}

/** Rows of the contract table: { family, tokens: string[] } (the code spans of the second cell). */
export function parseContract(text) {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const start = lines.findIndex((line) => line.trim() === HEADING);
  if (start < 0) throw new Error(`api-tables: the styles README has no "${HEADING}" section`);
  const rows = [];
  let inTable = false;
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (line.startsWith('## ')) break;
    if (!line.startsWith('|')) { if (inTable) break; continue; }
    inTable = true;
    const [family, value = ''] = cells(line);
    if (/^-+$/.test(family.replace(/[: ]/g, '')) || family === 'Family') continue;
    const tokens = [...value.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
    rows.push({ family, tokens });
  }
  return rows;
}

/**
 * Classes and attributes that the contract documents for these component classes:
 * { families, classes, attributes (names), values: Map<attribute, string[]> } where
 * values are the enumerated values of `data-size="sm|md|lg"` in contract order
 * (empty for a presence attribute such as `data-icon-only`).
 *
 * A shared row (one that names more than one class of components.json, such as the
 * Feedback row of alerts and badges or the Icons row of hw-icon-button and
 * hw-icon-background) gives an attribute, and each of its values, to
 * the component only where dist/styles.css selects that attribute, with that value,
 * on one of the component's classes (`selectors`, stylesheet-selectors.mjs): the row
 * does not say which of its classes an attribute belongs to (fix round of 5a, G5).
 * Without `selectors` every attribute of a row is given, as before.
 * @param {{ byClass: Map<string, Map<string, Set<string>>> } | null} [selectors]
 * @param {Set<string>} [allClasses] The classes of every component of components.json (without it, every hw- class of the row counts).
 */
export function contractFor(rows, componentClasses, selectors = null, allClasses = null) {
  const classes = new Set();
  const values = new Map();
  const families = [];
  const selected = (attribute) => {
    const found = { any: false, values: new Set() };
    for (const name of componentClasses) {
      for (const map of [selectors.byClass, selectors.within ?? new Map()]) {
        const set = map.get(name)?.get(attribute);
        if (!set) continue;
        found.any = true;
        for (const value of set) found.values.add(value);
      }
    }
    return found;
  };
  for (const row of rows) {
    const rowClasses = row.tokens.filter((token) => /^hw-[a-z0-9-]+$/.test(token));
    if (!rowClasses.some((name) => componentClasses.includes(name))) continue;
    families.push(row.family);
    for (const name of rowClasses) if (componentClasses.includes(name)) classes.add(name);
    const shared = selectors !== null && rowClasses.filter((name) => !allClasses || allClasses.has(name)).length > 1;
    for (const token of row.tokens) {
      const match = /^((?:data|aria)-[a-z0-9-]+)(?:=(?:"([^"]*)"|'([^']*)'|(\S+)))?$/.exec(token);
      if (!match) continue;
      const css = shared ? selected(match[1]) : null;
      if (css && !css.any) continue;
      if (!values.has(match[1])) values.set(match[1], []);
      const list = values.get(match[1]);
      const raw = match[2] ?? match[3] ?? match[4];
      if (raw !== undefined) for (const value of raw.split('|')) if (!list.includes(value) && (!css || css.values.has(value))) list.push(value);
    }
  }
  return { families, classes: [...classes], attributes: [...values.keys()], values };
}

export function readContract(nodeModules) {
  return parseContract(readFileSync(join(nodeModules, '@hawiyah', 'styles', 'README.md'), 'utf8'));
}
