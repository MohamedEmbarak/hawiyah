# Implementation contract (0.2 source preview)

Package names: @hawiyah/tokens, @hawiyah/styles, @hawiyah/core, @hawiyah/vanilla,
@hawiyah/react, @hawiyah/vue, @hawiyah/angular. ESM, explicit exports. Published to
npm only from verified tarballs through scripts/publish-packages.mjs; source
manifests stay private.

The initial scope below is extended by [EXPANSION.md](EXPANSION.md) and the
portal/mobile compositions to 83 entries. See [coverage](docs/coverage.md).
Calendar conversion uses the pinned published reference described in
[docs/date-calendars.md](docs/date-calendars.md); do not substitute host Intl
conversion or an arithmetic Hijri fallback for the reference provider.

## Shared CSS

- `.hw-button` data-variant=primary|default|secondary|outline|outline-white|light|danger|ghost|soft|link data-size=sm|md|lg
- `.hw-field`, `.hw-label`, `.hw-input`, `.hw-textarea`, `.hw-select`,
  `.hw-hint`, `.hw-error`, `.hw-checkbox`, `.hw-radio`, `.hw-switch`
- `.hw-tabs`, `.hw-tab-list`, `.hw-tab`, `.hw-tab-panel`
- `.hw-dialog` (native dialog), `.hw-dialog-header`, `.hw-dialog-body`,
  `.hw-dialog-footer`, `.hw-combobox`, `.hw-listbox`, `.hw-option`
- `.hw-card`, `.hw-card-header`, `.hw-card-body`, `.hw-card-footer`
- `.hw-badge` data-tone=neutral|success|warning|danger|info data-variant=soft|outline|dot; optional `.hw-badges` wrapping group
- `.hw-alert` data-tone=neutral|info|success|warning|danger
- `.hw-table-wrap`, `.hw-table`, `.hw-pagination`, `.hw-breadcrumb`
- `.hw-accordion`, `.hw-accordion-item` (details), `.hw-accordion-trigger` (summary)
- `.hw-progress`, `.hw-skeleton`, `.hw-spinner`, `.hw-avatar`, `.hw-divider`
- `.hw-toolbar`, `.hw-chip`, `.hw-empty`, `.hw-stepper`, `.hw-step`, `.hw-timeline`
- `.hw-upload`, `.hw-tooltip`, `.hw-sr-only`, `.hw-stack`, `.hw-cluster`, `.hw-container`

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

`enhance(root?: ParentNode): () => void` initializes data-hw='tabs|dialog|combobox|...'.
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
