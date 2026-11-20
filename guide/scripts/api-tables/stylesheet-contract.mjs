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
 */
export function contractFor(rows, componentClasses) {
  const classes = new Set();
  const values = new Map();
  const families = [];
  for (const row of rows) {
    const rowClasses = row.tokens.filter((token) => /^hw-[a-z0-9-]+$/.test(token));
    if (!rowClasses.some((name) => componentClasses.includes(name))) continue;
    families.push(row.family);
    for (const name of rowClasses) if (componentClasses.includes(name)) classes.add(name);
    for (const token of row.tokens) {
      const match = /^((?:data|aria)-[a-z0-9-]+)(?:=(?:"([^"]*)"|'([^']*)'|(\S+)))?$/.exec(token);
      if (!match) continue;
      if (!values.has(match[1])) values.set(match[1], []);
      const list = values.get(match[1]);
      const raw = match[2] ?? match[3] ?? match[4];
      if (raw !== undefined) for (const value of raw.split('|')) if (!list.includes(value)) list.push(value);
    }
  }
  return { families, classes: [...classes], attributes: [...values.keys()], values };
}

export function readContract(nodeModules) {
  return parseContract(readFileSync(join(nodeModules, '@hawiyah', 'styles', 'README.md'), 'utf8'));
}
