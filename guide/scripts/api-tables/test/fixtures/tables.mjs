// Fixture API tables of the two pilots, written as the rows of each table
// [name, kind, type, required, default], as docs/components/button.md and tabs.md
// state them on 0.3.0 (the kind of a JavaScript or React row is not a column).
// pageModel() turns them into the content model that step 20 writes
// (src/generated/content/pages/<id>.<lang>.json).

const VARIANT = "'primary' | 'default' | 'secondary' | 'outline' | 'outline-white' | 'light' | 'danger' | 'ghost' | 'soft' | 'link'";
const SIZE = "'sm' | 'md' | 'lg'";
const D = '—';

export const BUTTON = {
  javascript: [
    ['class', 'option', "'hw-button'", true, D], ['type', 'option', "'button' | 'submit' | 'reset'", true, D],
    ['data-variant', 'option', VARIANT, false, D], ['data-size', 'option', SIZE, false, D], ['data-icon-only', 'option', 'boolean', false, D],
    ['disabled', 'option', 'boolean', false, D], ['aria-busy', 'option', "'true'", false, D], ['aria-disabled', 'option', "'true'", false, D],
    ['aria-pressed', 'option', "'true'", false, D], ['data-shape', 'option', "'circle'", false, D],
  ],
  react: [['variant', 'prop', VARIANT, false, "'primary'"], ['size', 'prop', SIZE, false, "'md'"], ['loading', 'prop', 'boolean', false, D]],
  vue: [
    ['variant', 'prop', VARIANT, false, "'primary'"], ['size', 'prop', SIZE, false, "'md'"], ['loading', 'prop', 'boolean', false, 'false'],
    ['disabled', 'prop', 'boolean', false, 'false'], ['type', 'prop', "'button' | 'submit' | 'reset'", false, "'button'"], ['default', 'slot', D, false, D],
  ],
  angular: [
    ['variant', 'input', VARIANT, false, "'primary'"], ['size', 'input', SIZE, false, "'md'"], ['loading', 'input', 'boolean', false, 'false'],
    ['disabled', 'input', 'boolean', false, 'false'], ['type', 'input', 'string | null', false, 'null'],
  ],
};

export const TABS = {
  javascript: [
    ['value', 'option', 'string', false, D], ['activationMode', 'option', "'automatic' | 'manual'", false, D], ['overflow', 'option', "'menu' | 'scroll'", false, D],
    ['overflowLabel', 'option', 'string', false, D], ['onValueChange', 'option', '(value: string) => void', false, D],
  ],
  react: [
    ['items', 'prop', 'readonly TabItem[]', true, D], ['value', 'prop', 'string', false, D], ['defaultValue', 'prop', 'string', false, D],
    ['onValueChange', 'prop', '(value: string) => void', false, D], ['label', 'prop', 'string', false, D], ['aria-label', 'prop', 'string', false, D],
    ['aria-labelledby', 'prop', 'string', false, D], ['orientation', 'prop', "'horizontal' | 'vertical'", false, "'horizontal'"],
    ['activationMode', 'prop', "'automatic' | 'manual'", false, "'automatic'"], ['overflow', 'prop', "'menu' | 'scroll'", false, "'menu'"],
    ['overflowLabel', 'prop', 'string', false, D],
  ],
  vue: [
    ['items', 'prop', 'readonly TabItem[]', true, D], ['modelValue', 'prop', 'string', false, D], ['defaultValue', 'prop', 'string', false, D],
    ['label', 'prop', 'string', false, D], ['orientation', 'prop', "'horizontal' | 'vertical'", false, "'horizontal'"],
    ['activationMode', 'prop', "'automatic' | 'manual'", false, "'automatic'"], ['overflow', 'prop', "'menu' | 'scroll'", false, "'menu'"],
    ['overflowLabel', 'prop', 'string', false, D], ['update:modelValue', 'event', '(value: string) => void', false, D],
    ['tab:<value>', 'slot', D, false, D], ['<value>', 'slot', D, false, D],
  ],
  angular: [
    ['id', 'input', 'string', false, D], ['value', 'input', 'string', false, "''"], ['label', 'input', 'string', false, "''"],
    ['aria-label', 'input', 'string | null', false, 'null'], ['aria-labelledby', 'input', 'string | null', false, 'null'],
    ['aria-describedby', 'input', 'string | null', false, 'null'], ['orientation', 'input', "'horizontal' | 'vertical'", false, "'horizontal'"],
    ['direction', 'input', "'ltr' | 'rtl'", false, D], ['activationMode', 'input', "'automatic' | 'manual'", false, "'automatic'"],
    ['overflow', 'input', "'menu' | 'scroll'", false, "'menu'"], ['overflowLabel', 'input', 'string', false, "''"],
    ['valueChange', 'output', 'string', false, D], ['*', 'content', D, false, D],
    ['hw-tab value', 'input', 'string', true, D], ['hw-tab label', 'input', 'string', true, D], ['hw-tab disabled', 'input', 'boolean', false, 'false'],
    ['hw-tab *', 'content', D, false, D],
  ],
};

const HEADERS = {
  javascript: ['Option', 'Type', 'Required', 'Default'],
  react: ['Prop', 'Type', 'Required', 'Default'],
  vue: ['Name', 'Kind', 'Type', 'Required', 'Default'],
  angular: ['Name', 'Kind', 'Type', 'Required', 'Default'],
};
const TEXT = { javascript: 'JavaScript', react: 'React', vue: 'Vue', angular: 'Angular' };
const code = (value) => [{ type: 'inlineCode', value }];
const text = (value) => [{ type: 'text', value }];
const cell = (value) => (value === D ? text(D) : code(value));

function tableBlock(h3, rows) {
  const columns = HEADERS[h3].map((label, index) => ({ key: `c${index}`, label: text(label), align: null }));
  const withKind = columns.length === 5;
  return {
    type: 'table',
    caption: `Fixture ${TEXT[h3]} table`,
    columns,
    rows: rows.map(([name, kind, type, required, fallback]) => {
      const cells = withKind
        ? [code(name), text(kind), cell(type), code(String(required)), cell(fallback)]
        : [code(name), cell(type), code(String(required)), cell(fallback)];
      return Object.fromEntries(cells.map((item, index) => [`c${index}`, item]));
    }),
  };
}

/** A page model with the given API tables; `omit` leaves out the table of one h3; `after` adds a block after a table. */
export function pageModel(id, tables, { lang = 'en', omit = null, after = {} } = {}) {
  const blocks = [];
  for (const h3 of ['javascript', 'react', 'vue', 'angular']) {
    blocks.push({ type: 'heading', level: 3, id: h3, children: text(TEXT[h3]) });
    if (h3 !== omit) blocks.push(tableBlock(h3, tables[h3]));
    if (after[h3]) blocks.push(after[h3]);
    blocks.push({ type: 'paragraph', children: text('Description.') });
  }
  return {
    id,
    lang,
    sourcePath: `docs/components/${id}${lang === 'ar' ? '.ar' : ''}.md`,
    sections: [{ id: 'api', level: 2, title: text('API'), blocks }],
  };
}

/** A deep copy of a fixture with one table changed by `edit(rows)`. */
export function variant(tables, h3, edit) {
  const copy = Object.fromEntries(Object.entries(tables).map(([key, rows]) => [key, rows.map((row) => [...row])]));
  copy[h3] = edit(copy[h3]);
  return copy;
}

/** A row of a fixture by name, for edits. */
export const replaceRow = (rows, name, change) => rows.map((row) => (row[0] === name ? change([...row]) : row));
