// Writes the four API tables of a page from the declared members (members.mjs),
// so the tables a writer starts from are the tables step 30 accepts. Used by
// content:api-tables (rewrite or check a page), content:scaffold (new English
// page), content:scaffold-ar and content:sync-ar (the same bodies in Arabic).
//
// Rows: the rows of the existing table keep their order while their member is
// still declared; declared members the table lacks follow in declaration order;
// rows of members that are no longer declared are removed. A cell that step 30
// compares is written in the printer's form unless the existing cell is equal to
// it in the comparison (the same type with another union order, for example),
// in which case the existing cell stays; a cell step 30 does not compare (the
// required flag of a stylesheet table, the Type, Required and Default of a
// native attribute of exclusions.json) keeps the existing text, and is written
// as an em dash or `false` in a new row.
import { API_COLUMNS, API_HEADERS, CAPTION_PREFIX } from '../content/config.mjs';
import { EM_DASH, canonicalDefault, canonicalType } from './types.mjs';

export const H3_FRAMEWORK = { javascript: 'vanilla', react: 'react', vue: 'vue', angular: 'angular' };
export const H3_TEXT = { javascript: 'JavaScript', react: 'React', vue: 'Vue', angular: 'Angular' };

/** Inline code of a table cell: `|` escaped, a longer fence when the value holds a backtick. */
export function codeCell(value) {
  const text = String(value).replace(/\|/g, '\\|');
  if (!text.includes('`')) return `\`${text}\``;
  return `\`\` ${text} \`\``;
}

function cellOf(value) {
  return value === EM_DASH || value === null || value === undefined ? EM_DASH : codeCell(value);
}

/** Splits a GFM table row into its cell sources (escaped pipes stay in the cell). */
export function splitRow(line) {
  const body = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  const cells = [];
  let current = '';
  let ticks = 0;
  for (let i = 0; i < body.length; i += 1) {
    const char = body[i];
    if (char === '\\' && body[i + 1] === '|') {
      current += '\\|';
      i += 1;
      continue;
    }
    if (char === '`') ticks = ticks ? 0 : 1;
    if (char === '|' && !ticks) {
      cells.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
}

/** The value of a cell source: the code inside backticks, or the text. */
export function cellValue(source) {
  const match = /^(`+)\s?([\s\S]*?)\s?\1$/.exec(source.trim());
  return (match ? match[2] : source.trim()).replace(/\\\|/g, '|');
}

/** The key of a row: its name, and its kind when the table has a Kind column (a Vue prop and slot can share a name). */
export const rowKey = (name, kind) => `${name}\u0000${kind ?? ''}`;

/** Existing rows of a table source by key: Map<key, cells>. */
export function existingRows(tableSource) {
  const lines = tableSource.split('\n').filter((line) => line.trim().startsWith('|'));
  const withKind = splitRow(lines[0] ?? '').length === 5;
  const rows = new Map();
  for (const line of lines.slice(2)) {
    const cells = splitRow(line);
    const key = rowKey(cellValue(cells[0] ?? ''), withKind ? cells[1] : null);
    if (!rows.has(key)) rows.set(key, cells);
  }
  return rows;
}

/** One body row of the table of an h3 for a member, reusing equal or uncompared cells of `old`. */
export function rowFor(h3, member, old) {
  const roles = API_COLUMNS[h3];
  const at = (role) => (old ? old[roles.indexOf(role)] : undefined);
  const compare = member.compare ?? {};
  const cells = roles.map((role) => {
    const previous = at(role);
    switch (role) {
      case 'name': return codeCell(member.name);
      case 'kind': return member.kind;
      case 'type': {
        if (compare.type === false) return previous ?? EM_DASH;
        const printed = cellOf(member.type);
        if (previous !== undefined && member.type !== EM_DASH && cellValue(previous) !== EM_DASH && canonicalType(cellValue(previous)) === canonicalType(member.type)) return previous;
        return printed;
      }
      case 'required': {
        if (compare.required === false || compare.type === false) return previous ?? codeCell(String(member.required));
        return codeCell(String(member.required));
      }
      case 'default': {
        if (compare.default === false) return previous ?? EM_DASH;
        if (previous !== undefined && canonicalDefault(cellValue(previous)) === canonicalDefault(member.default)) return previous;
        return cellOf(member.default);
      }
      default: return '';
    }
  });
  return `| ${cells.join(' | ')} |`;
}

/** The body rows of a table from declared members, in the order described above. */
export function tableRows(h3, members, oldRows = new Map()) {
  const withKind = API_COLUMNS[h3].includes('kind');
  const keyOf = (member) => rowKey(member.name, withKind ? member.kind : null);
  const byKey = new Map(members.map((member) => [keyOf(member), member]));
  const order = [...oldRows.keys()].filter((key) => byKey.has(key));
  for (const member of members) if (!order.includes(keyOf(member))) order.push(keyOf(member));
  return order.map((key) => rowFor(h3, byKey.get(key), oldRows.get(key)));
}

/** The whole table (header, delimiter and rows) in a language. */
export function tableSource(h3, lang, members, oldRows = new Map()) {
  const header = API_HEADERS[lang][h3];
  return [`| ${header.join(' | ')} |`, `| ${header.map(() => '---').join(' | ')} |`, ...tableRows(h3, members, oldRows)].join('\n');
}

function joinEnglish(list) {
  if (list.length <= 1) return list.join('');
  return `${list.slice(0, -1).join(', ')} and ${list.at(-1)}`;
}

function joinArabic(list) {
  return list.map((item, index) => (index === 0 ? item : `و${item}`)).join(' ');
}

/** The element names of the Angular classes of a page (the first selector of each). */
export function angularElements(declared) {
  const elements = [];
  for (const member of declared.angular.members) if (member.element && !elements.includes(member.element)) elements.push(member.element);
  return elements.length ? elements : declared.angular.exports;
}

/** The fixed caption of an API table, without the 'Table: ' prefix. */
export function captionText(h3, lang, declared, entry) {
  const name = entry?.name ?? declared.id;
  const join = lang === 'ar' ? joinArabic : joinEnglish;
  if (h3 === 'javascript') {
    const controllers = declared.vanilla.exports ?? [];
    if (declared.vanilla.source === 'controller') return lang === 'ar' ? `خيارات ${join(controllers)}` : `Options of ${join(controllers)}`;
    const classes = declared.vanilla.classes ?? [];
    const attributes = lang === 'ar'
      ? (classes.length > 1 ? `خصائص العناصر ${joinArabic(classes)}` : `خصائص العنصر ${classes[0]}`)
      : `Attributes of the ${joinEnglish(classes)} element${classes.length > 1 ? 's' : ''}`;
    if (!controllers.length) return attributes;
    return lang === 'ar' ? `${attributes} وخيارات ${join(controllers)}` : `${attributes} and options of ${join(controllers)}`;
  }
  const exports = declared[H3_FRAMEWORK[h3]].exports ?? [];
  const names = exports.length ? exports : [name];
  if (h3 === 'react') return lang === 'ar' ? `خصائص ${join(names)}` : `Props of ${join(names)}`;
  if (h3 === 'vue') {
    if (lang !== 'ar') return `Props, events and slots of ${join(names)}`;
    return names.length === 1 ? `خصائص ${names[0]} وأحداثه ومنافذه` : names.length === 2 ? `خصائص ${join(names)} وأحداثهما ومنافذهما` : `خصائص ${join(names)} وأحداثها ومنافذها`;
  }
  const elements = angularElements(declared);
  if (lang === 'ar') {
    const suffix = elements.length === 1 ? 'ومخرجاته ومحتواه' : elements.length === 2 ? 'ومخرجاتهما ومحتواهما' : 'ومخرجاتها ومحتواها';
    return `مُدخلات ${joinArabic(elements)} ${suffix}`;
  }
  return `Inputs, outputs and content of ${joinEnglish(elements)}`;
}

export function captionLine(h3, lang, declared, entry) {
  return `${CAPTION_PREFIX[lang]}${captionText(h3, lang, declared, entry)}`;
}
