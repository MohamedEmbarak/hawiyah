// Comparison of one API table with the declared members (members.mjs): names
// equal as sets, and Kind, Required, Type and Default equal per row. Each
// difference is one HWC-APIX finding:
//   '<file>: <framework> table lists <name> (<kind>, required <r>); the declarations have <...>'
//       a name the declarations do not have, or another kind or required flag;
//   '<file>: <framework> table lists no <name>; the declarations have <name> (<kind>, required <r>)';
//   '<file>: <framework> table gives <name> the type <cell>; the declarations have <type>';
//   '<file>: <framework> table gives <name> the default <cell>; the installed packages give <default>'.
// Types are compared in the canonical form of types.mjs (white space, quotes,
// union order and parameter names do not count); defaults as literals. The
// required flag of a stylesheet table, and the Type, Required and Default of a
// native attribute of exclusions.json, are not compared (members.mjs `compare`).
import { EM_DASH, canonicalDefault, canonicalType } from './types.mjs';

export const CODE = 'HWC-APIX';

/** h3 id -> framework, heading text and the column positions of name, kind, type, required and default. */
export const TABLES = {
  javascript: { framework: 'vanilla', label: 'JavaScript', name: 0, kind: null, type: 1, required: 2, default: 3, defaultKind: 'option' },
  react: { framework: 'react', label: 'React', name: 0, kind: null, type: 1, required: 2, default: 3, defaultKind: 'prop' },
  vue: { framework: 'vue', label: 'Vue', name: 0, kind: 1, type: 2, required: 3, default: 4 },
  angular: { framework: 'angular', label: 'Angular', name: 0, kind: 1, type: 2, required: 3, default: 4 },
};

const compares = (member, column) => member.compare?.[column] !== false;
const describe = (member, checkRequired = true) => (checkRequired
  ? `${member.name} (${member.kind}, required ${member.required})`
  : `${member.name} (${member.kind})`);

export function finding(file, message) {
  return { code: CODE, file, message: `${file}: ${message}` };
}

export function formatFinding(item) {
  return `${item.code} ${item.message}`;
}

const shown = (value) => (value === EM_DASH || value === null || value === undefined ? EM_DASH : value);

/**
 * @param {{ name: string, kind: string, required: boolean | null, type?: string, default?: string }[]} rows table rows
 * @param {{ name: string, kind: string, required: boolean, type?: string | null, default?: string | null, compare?: any }[]} members
 * @param {{ file: string, label: string, checkRequired?: boolean }} options
 * @returns {any[]} findings
 */
export function compareTable(rows, members, options) {
  const { file, label } = options;
  const tableRequired = options.checkRequired !== false;
  const findings = [];
  // A Vue prop and a Vue slot can share a name (Stat: value); a row is the member of its name and kind.
  const keyOf = (name, kind) => `${name}\u0000${kind}`;
  const declared = new Map();
  for (const member of members) if (!declared.has(keyOf(member.name, member.kind))) declared.set(keyOf(member.name, member.kind), member);
  const checkRequiredOf = (member) => tableRequired && (!member || compares(member, 'required'));
  const listed = new Set();
  for (const row of rows) {
    const key = keyOf(row.name, row.kind);
    // Another kind of the same name, for the message, when the table has no row of the declared kind.
    const other = members.find((item) => item.name === row.name && !rows.some((peer) => peer.name === item.name && peer.kind === item.kind));
    const member = declared.get(key) ?? other;
    if (listed.has(key)) {
      findings.push(finding(file, `${label} table lists ${row.name} twice; the declarations have ${member ? describe(member, checkRequiredOf(member)) : `no ${row.name}`}`));
      continue;
    }
    listed.add(key);
    const checkRequired = checkRequiredOf(member);
    const kindDiffers = member && row.kind !== member.kind;
    const requiredDiffers = member && checkRequired && row.required !== member.required;
    if (!member || kindDiffers || requiredDiffers) {
      findings.push(finding(file, `${label} table lists ${describe(row, checkRequired)}; the declarations have ${member ? describe(member, checkRequired) : `no ${row.name}`}`));
      if (member) listed.add(keyOf(member.name, member.kind));
      continue;
    }
    if (compares(member, 'type') && row.type !== undefined) {
      const expected = shown(member.type);
      const cell = shown(row.type);
      if (expected === EM_DASH || cell === EM_DASH) {
        if (expected !== cell) findings.push(finding(file, `${label} table gives ${row.name} the type ${cell}; the declarations have ${expected === EM_DASH ? `no type for a ${member.kind} row (an em dash)` : expected}`));
      } else {
        const key = canonicalType(cell);
        if (key === null) findings.push(finding(file, `${label} table gives ${row.name} the type "${cell}", which is not a type; the declarations have ${expected}`));
        else if (key !== canonicalType(expected)) findings.push(finding(file, `${label} table gives ${row.name} the type ${cell}; the declarations have ${expected}`));
      }
    }
    if (compares(member, 'default') && row.default !== undefined) {
      if (canonicalDefault(row.default) !== canonicalDefault(member.default)) {
        findings.push(finding(file, `${label} table gives ${row.name} the default ${shown(row.default)}; the installed packages give ${shown(member.default)}`));
      }
    }
  }
  for (const [key, member] of declared) {
    if (!listed.has(key)) findings.push(finding(file, `${label} table lists no ${member.name}; the declarations have ${describe(member, checkRequiredOf(member))}`));
  }
  return findings;
}

function inlineText(inlines = []) {
  return inlines.map((item) => (item.type === 'text' || item.type === 'inlineCode' ? item.value : inlineText(item.children ?? []))).join('');
}

function codeValue(inlines = []) {
  return inlines.length === 1 && inlines[0].type === 'inlineCode' ? inlines[0].value : null;
}

/** Plain text of a model block (paragraph, alert). */
export function blockText(block) {
  if (!block) return '';
  if (block.type === 'paragraph') return inlineText(block.children).replace(/\s+/g, ' ').trim();
  if (block.type === 'alert') return (block.blocks ?? []).map(blockText).join(' ').trim();
  return '';
}

/**
 * The API tables of a page model (src/generated/content/pages/<id>.<lang>.json):
 * { [h3 id]: rows } with rows { name, kind, required, type, default }, and
 * `after` { [h3 id]: the block that follows the table }.
 */
export function apiTablesOf(page) {
  const section = page.sections?.find((item) => item.id === 'api');
  const tables = {};
  const after = {};
  if (!section) return Object.defineProperty(tables, 'after', { value: after });
  let current = null;
  section.blocks.forEach((block, index) => {
    if (block.type === 'heading' && block.level === 3) current = TABLES[block.id] ? block.id : null;
    else if (block.type === 'table' && current && !tables[current]) {
      const spec = TABLES[current];
      after[current] = section.blocks[index + 1] && section.blocks[index + 1].type !== 'heading' ? section.blocks[index + 1] : null;
      tables[current] = block.rows.map((row) => {
        const cell = (position) => row[block.columns[position]?.key];
        const text = (position) => codeValue(cell(position)) ?? inlineText(cell(position)).trim();
        const name = text(spec.name);
        const kind = spec.kind === null ? spec.defaultKind : inlineText(cell(spec.kind)).trim();
        const requiredText = codeValue(cell(spec.required));
        return {
          name,
          kind,
          required: requiredText === 'true' ? true : requiredText === 'false' ? false : null,
          type: text(spec.type),
          default: text(spec.default),
        };
      });
    }
  });
  return Object.defineProperty(tables, 'after', { value: after });
}
