// Fixture API tables of the two pilots, written as the rows of each table
// (name, kind for Vue and Angular, required). pageModel() turns them into the
// content model that step 20 writes (src/generated/content/pages/<id>.<lang>.json).

export const BUTTON = {
  javascript: [['class', true], ['type', true], ['data-variant', false], ['data-size', false], ['disabled', false], ['aria-busy', false]],
  react: [['variant', false], ['size', false], ['loading', false]],
  vue: [['variant', 'prop', false], ['size', 'prop', false], ['loading', 'prop', false], ['disabled', 'prop', false], ['type', 'prop', false]],
  angular: [['variant', 'input', false], ['size', 'input', false], ['loading', 'input', false], ['disabled', 'input', false], ['type', 'input', false]],
};

export const TABS = {
  javascript: [['value', false], ['activationMode', false], ['overflow', false], ['overflowLabel', false], ['onValueChange', false]],
  react: [
    ['items', true], ['value', false], ['defaultValue', false], ['onValueChange', false], ['label', false], ['aria-label', false],
    ['aria-labelledby', false], ['orientation', false], ['activationMode', false], ['overflow', false], ['overflowLabel', false],
  ],
  vue: [
    ['items', 'prop', true], ['modelValue', 'prop', false], ['defaultValue', 'prop', false], ['label', 'prop', false],
    ['orientation', 'prop', false], ['activationMode', 'prop', false], ['overflow', 'prop', false], ['overflowLabel', 'prop', false],
    ['update:modelValue', 'event', false],
  ],
  angular: [
    ['id', 'input', false], ['value', 'input', false], ['label', 'input', false], ['aria-label', 'input', false],
    ['aria-labelledby', 'input', false], ['aria-describedby', 'input', false], ['orientation', 'input', false],
    ['direction', 'input', false], ['activationMode', 'input', false], ['overflow', 'input', false], ['overflowLabel', 'input', false],
    ['valueChange', 'output', false], ['*', 'content', false],
    ['hw-tab value', 'input', true], ['hw-tab label', 'input', true], ['hw-tab disabled', 'input', false], ['hw-tab *', 'content', false],
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

function tableBlock(h3, rows) {
  const columns = HEADERS[h3].map((label, index) => ({ key: `c${index}`, label: text(label), align: null }));
  const withKind = columns.length === 5;
  return {
    type: 'table',
    caption: `Fixture ${TEXT[h3]} table`,
    columns,
    rows: rows.map((row) => {
      const [name, kind, required] = withKind ? row : [row[0], null, row[1]];
      const cells = withKind
        ? [code(name), text(kind), code('string'), code(String(required)), text('—')]
        : [code(name), code('string'), code(String(required)), text('—')];
      return Object.fromEntries(cells.map((cell, index) => [`c${index}`, cell]));
    }),
  };
}

/** A page model with the given API tables; `omit` leaves out the table of one h3. */
export function pageModel(id, tables, { lang = 'en', omit = null } = {}) {
  const blocks = [];
  for (const h3 of ['javascript', 'react', 'vue', 'angular']) {
    blocks.push({ type: 'heading', level: 3, id: h3, children: text(TEXT[h3]) });
    if (h3 !== omit) blocks.push(tableBlock(h3, tables[h3]));
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
