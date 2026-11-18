// Comparison of one API table with the declared members (contentPipeline.apiTables):
// names equal as sets, Kind and Required equal; Type and Default are not
// compared in milestone 4. Each difference is one HWC-APIX finding:
//   '<file>: <framework> table lists <name> (<kind>, required <r>); the declarations have <...>'
// where <...> is the declared member of that name, or 'no <name>'. A declared
// member that the table does not list is reported as
//   '<file>: <framework> table lists no <name>; the declarations have <name> (<kind>, required <r>)'.

export const CODE = 'HWC-APIX';

/** h3 id -> framework, heading text and the column positions of name, kind and required. */
export const TABLES = {
  javascript: { framework: 'vanilla', label: 'JavaScript', name: 0, kind: null, required: 2, defaultKind: 'option' },
  react: { framework: 'react', label: 'React', name: 0, kind: null, required: 2, defaultKind: 'prop' },
  vue: { framework: 'vue', label: 'Vue', name: 0, kind: 1, required: 3 },
  angular: { framework: 'angular', label: 'Angular', name: 0, kind: 1, required: 3 },
};

const describe = (member, checkRequired = true) => (checkRequired
  ? `${member.name} (${member.kind}, required ${member.required})`
  : `${member.name} (${member.kind})`);

export function finding(file, message) {
  return { code: CODE, file, message: `${file}: ${message}` };
}

export function formatFinding(item) {
  return `${item.code} ${item.message}`;
}

/**
 * @param {{ name: string, kind: string, required: boolean | null }[]} rows table rows
 * @param {{ name: string, kind: string, required: boolean }[]} members declared members
 * @param {{ file: string, label: string, checkRequired?: boolean }} options
 */
export function compareTable(rows, members, options) {
  const { file, label } = options;
  const checkRequired = options.checkRequired !== false;
  const findings = [];
  const declared = new Map();
  for (const member of members) if (!declared.has(member.name)) declared.set(member.name, member);
  const listed = new Set();
  for (const row of rows) {
    if (listed.has(row.name)) {
      findings.push(finding(file, `${label} table lists ${row.name} twice; the declarations have ${declared.has(row.name) ? describe(declared.get(row.name), checkRequired) : `no ${row.name}`}`));
      continue;
    }
    listed.add(row.name);
    const member = declared.get(row.name);
    const kindDiffers = member && row.kind !== member.kind;
    const requiredDiffers = member && checkRequired && row.required !== member.required;
    if (!member || kindDiffers || requiredDiffers) {
      findings.push(finding(file, `${label} table lists ${describe(row, checkRequired)}; the declarations have ${member ? describe(member, checkRequired) : `no ${row.name}`}`));
    }
  }
  for (const member of declared.values()) {
    if (!listed.has(member.name)) findings.push(finding(file, `${label} table lists no ${member.name}; the declarations have ${describe(member, checkRequired)}`));
  }
  return findings;
}

function inlineText(inlines = []) {
  return inlines.map((item) => (item.type === 'text' || item.type === 'inlineCode' ? item.value : inlineText(item.children ?? []))).join('');
}

function codeValue(inlines = []) {
  return inlines.length === 1 && inlines[0].type === 'inlineCode' ? inlines[0].value : null;
}

/**
 * The API tables of a page model (src/generated/content/pages/<id>.<lang>.json):
 * { [h3 id]: rows } with rows { name, kind, required }.
 */
export function apiTablesOf(page) {
  const section = page.sections?.find((item) => item.id === 'api');
  const tables = {};
  if (!section) return tables;
  let current = null;
  for (const block of section.blocks) {
    if (block.type === 'heading' && block.level === 3) current = TABLES[block.id] ? block.id : null;
    else if (block.type === 'table' && current && !tables[current]) {
      const spec = TABLES[current];
      tables[current] = block.rows.map((row) => {
        const cell = (index) => row[block.columns[index]?.key];
        const name = codeValue(cell(spec.name)) ?? inlineText(cell(spec.name)).trim();
        const kind = spec.kind === null ? spec.defaultKind : inlineText(cell(spec.kind)).trim();
        const requiredText = codeValue(cell(spec.required));
        return { name, kind, required: requiredText === 'true' ? true : requiredText === 'false' ? false : null };
      });
    }
  }
  return tables;
}
