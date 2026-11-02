# Implementation contract (0.1 source preview)

Package names: @nasaq/tokens, @nasaq/styles, @nasaq/core, @nasaq/vanilla,
@nasaq/react, @nasaq/vue, @nasaq/angular. ESM, explicit exports. npm publication is disabled pending release preparation.

The initial scope below is extended by [EXPANSION.md](EXPANSION.md) and the
portal/mobile compositions to 81 entries. See [coverage](docs/coverage.md).
Calendar conversion uses the pinned published reference described in
[docs/date-calendars.md](docs/date-calendars.md); do not substitute host Intl
conversion or an arithmetic Hijri fallback for the reference provider.

## Shared CSS

- `.nq-button` data-variant=primary|default|secondary|outline|outline-white|light|danger|ghost|soft|link data-size=sm|md|lg
- `.nq-field`, `.nq-label`, `.nq-input`, `.nq-textarea`, `.nq-select`,
  `.nq-hint`, `.nq-error`, `.nq-checkbox`, `.nq-radio`, `.nq-switch`
- `.nq-tabs`, `.nq-tab-list`, `.nq-tab`, `.nq-tab-panel`
- `.nq-dialog` (native dialog), `.nq-dialog-header`, `.nq-dialog-body`,
  `.nq-dialog-footer`, `.nq-combobox`, `.nq-listbox`, `.nq-option`
- `.nq-card`, `.nq-card-header`, `.nq-card-body`, `.nq-card-footer`
- `.nq-badge` data-tone=neutral|success|warning|danger|info
- `.nq-alert` data-tone=neutral|info|success|warning|danger
- `.nq-table-wrap`, `.nq-table`, `.nq-pagination`, `.nq-breadcrumb`
- `.nq-accordion`, `.nq-accordion-item` (details), `.nq-accordion-trigger` (summary)
- `.nq-progress`, `.nq-skeleton`, `.nq-spinner`, `.nq-avatar`, `.nq-divider`
- `.nq-toolbar`, `.nq-chip`, `.nq-empty`, `.nq-stepper`, `.nq-step`, `.nq-timeline`
- `.nq-upload`, `.nq-tooltip`, `.nq-sr-only`, `.nq-stack`, `.nq-cluster`, `.nq-container`

CSS handles native disabled/invalid, aria-selected/expanded, data-state. Reset
must be separately importable; base components do not globally reset applications.

## Core intended exports (coordinate additions)

`Direction = 'ltr' | 'rtl'`, `Option = {value: string; label: string; disabled?: boolean}`.
`normalizeSearch(value: string): string`, `filterOptions(options, query): Option[]`.
`getNextEnabledIndex(current, key, items, direction?, orientation?): number` where
items have optional disabled, key is KeyboardEvent.key, orientation horizontal|vertical.
`formatNumber(value, options?)`, `formatDate(value, options?)` using Intl, explicit
locale/calendar/numberingSystem/timeZone; never hand-code Hijri conversion.
DOM utilities may be invoked by adapters but may not render into framework trees.

## Vanilla markup

`enhance(root?: ParentNode): () => void` initializes data-nq='tabs|dialog|combobox|...'.
Each controller also exported for direct use with cleanup. Native static elements
and details work without JavaScript. The core and vanilla API guides define behavior markup shared by framework adapters.

## Shared component scope

Button, Field/TextField, Textarea, Select, Checkbox, Radio, Switch, Tabs, Dialog,
Combobox, Accordion, Card, Badge, Alert, Table, Pagination, Breadcrumb, Progress,
Skeleton, Spinner, Avatar, Divider, Tooltip, FileUpload, Stepper, EmptyState.
Native semantics first. Framework-specific props idiomatic. Blocks and examples
add service discovery, conditional application/review, request management.

## Package build

Root owns workspace/dependency tooling. TS packages compile to dist, CSS packages
copy source CSS to dist; Angular uses Angular Package Format/ng-packagr. Styles
export styles.css and reset.css. Framework peers stay external. Keep manifests
private until npm package names and release requirements have been verified.
