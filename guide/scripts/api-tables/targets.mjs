// The exports whose declarations each page documents. By default a page id
// maps to create<Name> (vanilla), <Name> (React and Vue) and Hw<Name>Component
// or Hw<Name>Directive (Angular). A page that documents a different or a
// further export names it here; the first Angular class is the documented
// class and the members of every further class are written '<element> <name>'.
//
// These lists are the lead's (leadAmendments A4 of milestone 5): every entry
// carries approvedBy and a reason, writers propose entries in their result
// files and never edit them, and scripts/api-tables/test/lists.test.mjs fails on
// an entry without either and on more than MAX_ENTRIES_PER_PAGE entries of all
// exception lists for one page (lists.mjs).
export const TARGET_OVERRIDES = {
  tabs: {
    angular: ['HwTabsComponent', 'HwTabComponent'],
    approvedBy: 'lead, 5a',
    reason: 'The Tabs page documents the tabset hw-tabs and its projected hw-tab children, whose inputs value, label and disabled a reader writes on every tab; @hawiyah/angular 0.3.0 declares them on the separate class HwTabComponent.',
  },
  radio: {
    angular: ['HwRadioGroupComponent'],
    approvedBy: 'lead, 5a (spec 5a.3)',
    reason: '@hawiyah/angular 0.3.0 exports no HwRadioComponent or HwRadioDirective; its radio buttons are rendered by HwRadioGroupComponent (hw-radio-group) from its options input. Named in spec item 5a.3.',
  },
};

/**
 * Dynamic slot names that the published @hawiyah/vue build reads with a computed
 * key (slots-vue.mjs). Each entry names the expression of the read, exactly as
 * the reader prints it, and the name the Vue table writes for it.
 */
export const VUE_SLOT_PATTERNS = {
  tabs: [
    {
      name: '<value>',
      expression: 'item.value',
      approvedBy: 'lead, 5a',
      reason: 'Tabs renders each panel from the slot named after the value of its item (slots[item.value] in the published build), else from the item content.',
    },
    {
      name: 'tab:<value>',
      expression: '`tab:${item.value}`',
      approvedBy: 'lead, 5a',
      reason: 'Tabs renders the text of each tab, in the tab list and in the overflow menu, from the slot tab:<value> (slots[`tab:${item.value}`] in the published build), else from the item label.',
    },
  ],
};

export function pascal(id) {
  return id.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join('');
}

/** Exports documented by page `id`; Angular falls back to the Directive class when no Component exists. */
export function targetsFor(id, exists = () => true) {
  const name = pascal(id);
  const override = TARGET_OVERRIDES[id] ?? {};
  const component = `Hw${name}Component`;
  const directive = `Hw${name}Directive`;
  return {
    vanilla: override.vanilla ?? `create${name}`,
    react: override.react ?? name,
    vue: override.vue ?? name,
    angular: override.angular ?? [exists('angular', component) || !exists('angular', directive) ? component : directive],
  };
}
