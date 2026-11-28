// The exports whose declarations each page documents. By default a page id
// maps to create<Name> (vanilla), <Name> (React and Vue) and Hw<Name>Component
// or Hw<Name>Directive (Angular). A page that documents a different or a
// further export names it here, as a list per framework whose first name is the
// documented export: the members of every further export are written
// '<qualifier> <name>', where the qualifier is the element of an Angular class
// (its first selector) and the export name in the other frameworks
// ('hw-tab value', 'RatingDisplay value', 'createFileUploadList items'). A
// vanilla list starts with create<Name> like the default target, also when
// @hawiyah/vanilla does not export it: the page then documents the stylesheet
// table of the component, and the options of the further controllers follow
// it (file-upload, app-shell). A further export that is not exported is a
// problem of step 30.
//
// These lists are the lead's: every entry
// carries approvedBy and a reason, writers propose entries in their result
// files and never edit them, and scripts/api-tables/test/lists.test.mjs fails on
// an entry without either and on more than MAX_ENTRIES_PER_PAGE entries of all
// exception lists for one page (lists.mjs). scripts/api-tables/test/ownership.test.mjs
// requires every component, directive and controller factory the four installed
// adapters export to be the target of exactly one page or an entry of
// UNOWNED_EXPORTS.
export const TARGET_OVERRIDES = {
  tabs: {
    angular: ['HwTabsComponent', 'HwTabComponent'],
    approvedBy: 'lead',
    reason: 'The Tabs page documents the tabset hw-tabs and its projected hw-tab children, whose inputs value, label and disabled a reader writes on every tab; @hawiyah/angular 0.3.0 declares them on the separate class HwTabComponent.',
  },
  radio: {
    angular: ['HwRadioGroupComponent'],
    approvedBy: 'lead',
    reason: '@hawiyah/angular 0.3.0 exports no HwRadioComponent or HwRadioDirective; its radio buttons are rendered by HwRadioGroupComponent (hw-radio-group) from its options input.',
  },
  tooltip: {
    angular: ['HwTooltipComponent', 'HwTooltipTriggerDirective'],
    approvedBy: 'lead',
    reason: '@hawiyah/angular 0.3.0 exports the directive HwTooltipTriggerDirective ([hwTooltipTrigger]), which binds the trigger of a tooltip; no other page documents it.',
  },
  accordion: {
    angular: ['HwAccordionComponent', 'HwAccordionMotionDirective'],
    approvedBy: 'lead',
    reason: '@hawiyah/angular 0.3.0 exports the directive HwAccordionMotionDirective, which animates the native details items of an accordion; no other page documents it.',
  },
  rating: {
    react: ['Rating', 'RatingDisplay'],
    vue: ['Rating', 'RatingDisplay'],
    angular: ['HwRatingComponent', 'HwRatingDisplayComponent'],
    approvedBy: 'lead',
    reason: 'The read-only rating display is exported as RatingDisplay by @hawiyah/react and @hawiyah/vue and as HwRatingDisplayComponent by @hawiyah/angular 0.3.0, beside the rating input; components.json has no id of its own for it, so the Rating page documents both.',
  },
  'file-upload': {
    vanilla: ['createFileUpload', 'createFileUploadList'],
    react: ['FileUpload', 'FileUploadList'],
    vue: ['FileUpload', 'FileUploadList'],
    angular: ['HwFileUploadComponent', 'HwFileUploadListComponent'],
    approvedBy: 'lead',
    reason: 'The list of selected files is exported as createFileUploadList by @hawiyah/vanilla, FileUploadList by @hawiyah/react and @hawiyah/vue and HwFileUploadListComponent by @hawiyah/angular 0.3.0; components.json has no id of its own for it, so the FileUpload page documents it after the upload field (vanilla: after the stylesheet table of hw-upload, since there is no createFileUpload).',
  },
  'app-shell': {
    vanilla: ['createAppShell', 'createSkipLink'],
    approvedBy: 'lead',
    reason: '@hawiyah/vanilla 0.3.0 binds the skip link that an app shell renders (a.hw-skip-link with data-hw="skip-link") with createSkipLink; the React, Vue and Angular AppShell render and bind that link themselves, and the portal header binds its own. createSkipLink takes no options, so it adds no row; the page names it in its caption. The page exists because PortalHeader binds its skip link without the hook, and it stays inside the keyboard rule: Tab reaches the link, Enter moves focus to the target.',
  },
};

/**
 * Exports of the four installed adapters that are a component, a directive or a
 * controller factory and that no page documents: { framework, name, approvedBy,
 * reason }. The list is the lead's.
 */
export const UNOWNED_EXPORTS = [];

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
      approvedBy: 'lead',
      reason: 'Tabs renders each panel from the slot named after the value of its item (slots[item.value] in the published build), else from the item content.',
    },
    {
      name: 'tab:<value>',
      expression: '`tab:${item.value}`',
      approvedBy: 'lead',
      reason: 'Tabs renders the text of each tab, in the tab list and in the overflow menu, from the slot tab:<value> (slots[`tab:${item.value}`] in the published build), else from the item label.',
    },
  ],
  table: [
    {
      name: 'cell-<key>',
      expression: '`cell-${column.key}`',
      approvedBy: 'lead',
      reason: 'Table renders each body cell from the slot cell-<column key> (slots[`cell-${column.key}`] in dist/display.js of the published build), else from the column cell function or the row value.',
    },
  ],
  'data-table': [
    {
      name: 'cell-<key>',
      expression: '`cell-${column.key}`',
      approvedBy: 'lead',
      reason: 'DataTable renders each body cell from the slot cell-<column key> (slots[`cell-${column.key}`] in dist/content.js of the published build), else from the row value.',
    },
  ],
  carousel: [
    {
      name: '<id>',
      expression: 'slide.id',
      approvedBy: 'lead',
      reason: 'Carousel renders each slide from the slot named after the slide id (slots[slide.id] in dist/expansion-interactive.js of the published build), else from slide.content.',
    },
  ],
  'description-list': [
    {
      name: 'item:<index>',
      expression: '`item:${index}`',
      approvedBy: 'lead',
      reason: 'DescriptionList renders the description of item <index> from the slot item:<index> (slots[`item:${index}`] in dist/content.js of the published build), else from item.description.',
    },
  ],
  timeline: [
    {
      name: '<id>',
      expression: 'item.id',
      approvedBy: 'lead',
      reason: 'Timeline renders additional content of an item from the slot named after the item id (slots[item.id] in dist/content.js of the published build).',
    },
  ],
  'notification-list': [
    {
      name: '<id>',
      expression: 'item.id',
      approvedBy: 'lead',
      reason: 'NotificationList renders additional content of an item from the slot named after the item id (slots[item.id] in dist/patterns.js of the published build).',
    },
  ],
};

export function pascal(id) {
  return id.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join('');
}

/** Exports documented by page `id`, one list per framework with the documented export first; Angular falls back to the Directive class when no Component exists. */
export function targetsFor(id, exists = () => true) {
  const name = pascal(id);
  const override = TARGET_OVERRIDES[id] ?? {};
  const component = `Hw${name}Component`;
  const directive = `Hw${name}Directive`;
  return {
    vanilla: [...(override.vanilla ?? [`create${name}`])],
    react: [...(override.react ?? [name])],
    vue: [...(override.vue ?? [name])],
    angular: [...(override.angular ?? [exists('angular', component) || !exists('angular', directive) ? component : directive])],
  };
}
