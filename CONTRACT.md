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
`formatNumber(value, options)`, `formatDate(value, options)` using Intl with a
required `options.locale` and explicit calendar/numberingSystem/timeZone;
`sortRows(rows, key, direction, locale)` with a required locale; never hand-code
Hijri conversion.
`requireText`, `hasText`, `formatTextTemplate` report and format application text;
`getFragmentHref`, `getFragmentId`, `bindFragmentLink` serve in-page links (both below).
DOM utilities may be invoked by adapters but may not render into framework trees.

## Text and localisation

The packages are agnostic to localisation. They offer layout direction and
nothing else in that area: no language registry, no translations and no default
strings.

- Every user-visible string and every accessible-name string is content that the
  application supplies: children, a slot, projected content or authored markup
  for a component's primary content, and a named input for text the component
  places itself (accessible names, labels of internal controls, headings it
  renders, live-region and validation messages, templated text).
- A named input has the same name and shape as a React prop, a Vue prop, an
  Angular input and a vanilla controller option. Strings are `<thing>Label` or
  `<thing>Message`; templated text is a function `get<Thing>Label(...)` or
  `get<Thing>Message(...)` with one signature in every adapter, returning the
  whole string. Adapters never join texts with words or language-specific
  punctuation.
- Vanilla uses authored markup as written; otherwise the controller option of the
  same name; otherwise `data-hw-<name>` on the controller root (for a function
  input, a template such as `data-hw-page-label="… {page}"`, filled by
  `formatTextTemplate`). The option wins over the attribute. An authored name of
  a root or landmark (`aria-label`, `aria-labelledby`) is never replaced. In three
  controllers an option that is passed explicitly replaces the authored name of
  an inner control: SearchField `clearLabel`, PasswordField `showLabel` and
  PortalHeader `brandLabel`; without the option the authored `aria-label` or text
  of that control is its name.
- Text needed in every use is required: a required prop in React types,
  `@Input({ required: true })` in Angular, `required: true` in Vue. Text needed
  only when a prop, slot, handler or attribute switches a feature on is required
  under that condition. Text whose need depends on runtime data (an empty list,
  overflow, a failed validation) is required always. Optional text has no default.
- A root or field name (`label`) is satisfied by an `aria-label`, an
  `aria-labelledby` or a parent Field label where the adapter forwards them.
  React types this as a union; Vue declares such a name without `required: true`
  and checks it at render; Angular hosts do not forward attributes, so `label` is
  the only source there and is a required input; vanilla uses authored markup.
- An optional action (dismiss, mark as read, preferences) is rendered only while
  the application has bound its handler, and its text is required under that
  condition. An optional status whose text is a function (FileDropzone
  `getSelectedMessage`) is rendered only when the function is supplied.
- Adapters call `requireText(component, name, value, when?)` from `@hawiyah/core`
  where a required text would be rendered. It warns once per component and input
  in development and does nothing in production builds; it is safe during server
  rendering. The warning names the component as its adapter exposes it: the
  component name in vanilla, React and Vue (`Hawiyah: FileDropzone requires
  "label"`) and the selector in Angular (`Hawiyah: hw-file-dropzone requires
  "label"`).
- When required text is missing the component renders nothing in its place and
  omits the attribute. It does not invent a name, reuse another input or hide the
  control. A constraint with a missing validation message still blocks submission
  through a single-space custom validity; `aria-invalid` is what it would be with
  the message present and never depends on the text.
- No adapter writes punctuation or words between two texts or between text and
  data. One space may separate two inline runs: the screen-reader-only external
  link text is `<span class="hw-sr-only"> text</span>` with the space inside, and
  a data value follows its label as label, space, `<bdi>value</bdi>`.
- A component that passes a text to an inner component reports a missing one
  under its own name first; the inner component may report it once more.
- Direction is read from `dir` and never from `lang`. No component sets `dir`
  unless the application supplies it. No adapter reads `lang`, the document
  language or a locale to choose a string, a default or a behaviour.
- `locale` is a formatting argument only: a BCP 47 tag (or a priority list of
  tags) handed to Intl. Formatting adds no words of its own.
- There is no default locale. Core `formatNumber`, `formatDate`, `sortRows`,
  `getCalendarMonth` and `formatCalendarDate` take a required locale; none falls
  back to a built-in locale or to the locale of the host. A missing locale is a
  type error and throws a `TypeError` ("Hawiyah: <helper> requires a locale from
  the application.") at run time. The `formatDate` defaults for calendar
  (`gregory`) and time zone (`Asia/Riyadh`) are not locale choices and remain.
- No adapter chooses a locale, and nothing under `packages/*/src` calls `Intl` or
  `toLocaleString` without a locale that came from the application. A component
  that formats a number or a date, or sorts text, takes a `locale` input with the
  same name in every adapter (vanilla: the `locale` option or `data-hw-locale` on
  the controller root), or a formatter function from the application. Calendar
  and DatePicker, which print month names, weekday names and the era from Intl,
  and DataTable, which collates text, require it; the vanilla RangeSlider
  requires it when it has an output element.
- A missing locale is treated like missing text: a type error in React and
  Angular, and in every adapter `requireText(component, 'locale', locale)` warns
  in development before a helper would be called. The component then renders
  nothing that Intl would have produced (no month grid, no formatted value, rows
  in their source order) and does not throw.
- Thrown errors and console warnings are developer diagnostics in English. They
  never reach the document.

## In-page links

Packaged in-page links (the AppShell, PortalHeader and PortalLayout skip links
and ContentNavigation links) are rendered as a bare `#id` on the server and on
the first client render. In the browser the adapter binds each link with
`bindFragmentLink`: from the reader's first interaction the href resolves to the
current document under any `<base href>`, including after client-side route
changes, so modified clicks, "open in new tab" and "copy link" stay on the page.
A plain activation is handled in the page: the target is scrolled into view and
receives focus. The URL fragment is not written unless the application asks for
it (`updateHash` on ContentNavigation), so hash-routed applications keep their
route. A skip link is rendered only when its target id is known. Adapters do not
read the location during server rendering.

## Vanilla markup

`enhance(root?: ParentNode): () => void` initializes data-hw='tabs|dialog|combobox|...'.
Each controller also exported for direct use with cleanup. Native static elements
and details work without JavaScript. The core and vanilla API guides define behavior markup shared by framework adapters.

## Shared component scope

Button, Field/TextField, Textarea, Select, Checkbox, Radio, Switch, Tabs, Dialog,
Combobox, Accordion, Card, Badge, Alert, Table, Pagination, Breadcrumb, Progress,
Skeleton, Spinner, Avatar, Divider, Tooltip, FileUpload, Stepper, EmptyState.
Native semantics first. Framework-specific props idiomatic, except text inputs,
which share one name and shape (see Text and localisation). Blocks and examples
add service discovery, conditional application/review, request management.

## Package build

Root owns workspace/dependency tooling. TS packages compile to dist, CSS packages
copy source CSS to dist; Angular uses Angular Package Format/ng-packagr. Styles
export styles.css and reset.css. Framework peers stay external. Keep manifests
private until npm package names and release requirements have been verified.
