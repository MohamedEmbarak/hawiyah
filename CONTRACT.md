# Implementation contract (0.2 source preview)

Package names: @hawiyah/tokens, @hawiyah/styles, @hawiyah/core, @hawiyah/vanilla,
@hawiyah/react, @hawiyah/vue, @hawiyah/angular. ESM, explicit exports. Published to
npm only from verified tarballs through scripts/publish-packages.mjs; source
manifests stay private.

The initial scope below is extended by [EXPANSION.md](EXPANSION.md) and the
portal/mobile compositions to 85 entries. See [coverage](docs/coverage.md).
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
`copyText`, `createCopyFeedback` (CopyButton); `bindLinkNavigation`,
`isLinkNavigationHandled` (routed links); `getNavigationItemKind`,
`getNavigationGroupEntries`, `isNavigationGroupOpen`, `getNavigationCurrentId`,
`revealNavigationCurrent` (the list NavigationDrawer and SideNavigation share): all below.
`observeFormReset`, `sameValue` (native form reset); `createTypeahead`,
`isTypeaheadKey` (Menu and TreeView); `evaluateFileSelection`, `matchesFileAccept`,
`isFileDrag` (FileDropzone); `prepareRemovalFocus` (focus after a control removes
its own item); `getDateViolation` (DatePicker); `normalizePinInput` (PinInput);
`getPortalBranchSummary` (PortalHeader); the types `FeedbackValue` and
`ConsentChoice`. Their behaviour is specified in `packages/core/API.md`.
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
  `aria-labelledby` or a parent Field label in every adapter (see Accessible
  names). React types this as a union; Vue declares such a name without
  `required: true` and checks it at render; Angular declares `label` as an
  optional input and checks it at render, because the host forwards the two
  attributes (see Angular hosts); vanilla uses authored markup.
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
  and DataTable, which collates text, require it. A component that only shows
  a value prints what the application's function returns (Slider and RangeSlider
  `formatValue`, RangeSlider `getRangeLabel(lower, upper)`) or the value as
  given, and writes no separator between two values.
- A missing locale is treated like missing text: a type error in React and
  Angular, and in every adapter `requireText(component, 'locale', locale)` warns
  in development before a helper would be called. The component then renders
  nothing that Intl would have produced (no month grid, no formatted value, rows
  in their source order) and does not throw.
- Thrown errors and console warnings are developer diagnostics in English. They
  never reach the document.

## Accessible names

Every control, group and landmark takes its accessible name from the first of
these that is present: an `aria-label` from the application, an
`aria-labelledby` from the application, the label of the surrounding Field, the
component's own `label`. The order is the same in the four adapters.

- `label` is required only when none of the others is present. A missing name
  is reported once through `requireText` under the component's own name; the
  component then renders no empty label, legend or attribute.
- The attribute lands on the element that carries the role: the native control,
  the fieldset of a group, the landmark, the panel of a popover, the tab list.
  Where that element is not the root (Popover, Menu, Tabs), React and Vue move
  the two attributes from the root to it; every other attribute stays on the root.
- Rich content never replaces a name. A string field (`label`, `title`) remains
  what type-ahead, accessible names and development warnings read.

## Angular hosts

An Angular component is one of two kinds.

- The host is the root. Where the root needs no particular native element, the
  host element carries the `hw-` class and the state attributes, and `class`,
  `id`, `style`, `aria-*` and `data-*` written on it are on the styled element.
  Where the root must be a native element the application can write (`a`,
  `button`, `nav`), the component is an attribute selector on that element
  (`a[hwLink]`, `button[hwButton]`, `nav[hwSideNavigation]`). Such a host writes
  an attribute the application may also write (`aria-label` from `label`, a
  role) only while it has a value and puts the application's value back
  afterwards; it never removes one.
- The host is a wrapper around a native root the component renders (an input in
  a field, a fieldset, a dialog, a table, a progress element). Exactly four
  attributes are forwarded from the host to that element, as inputs under their
  own names: `aria-label`, `aria-labelledby`, `aria-describedby` and, on form
  controls, `aria-invalid`. They are written statically or bound as
  `[aria-label]="expression"`; the host itself keeps none of them. A binding of
  the form `[attr.aria-label]` on a wrapper host is not supported.
- Nothing else is forwarded from a wrapper. `id` stays on the host and the
  inner control takes `controlId`, so no id is duplicated; `class` and `style`
  stay on the host. Documented `data-variant`, `data-size` and `data-tone`
  values are inputs (`variant`, `size`, `tone`).
- A wrapper host is a box through zero-specificity rules in the stylesheet
  (`layout.css`): a block box by default, `display: contents` for
  `hw-toggle-group` and `hw-content-navigation`, an inline block for
  `hw-popover` and `hw-menu`. The rules leave a host with `hidden` to the browser.
- A named region that Angular must always render (a dialog or card footer, the
  icon of an empty state, the trend of a stat) is hidden by the stylesheet while
  it is empty.

## Native form reset

A native reset is a value change made by the form. After a `reset` event that
no listener prevented, every Hawiyah control holds its reset target, shows it
and submits it in `FormData`, and has reported it once through its ordinary
value notification if and only if its value changed (arrays are compared by
content). The three always agree afterwards, also when the application
controls the value and ignores the notification: the control then shows and
submits the application's value again.

- Reset target. React and Vue: `defaultValue` (or the matching default prop),
  else the component's documented empty value. Angular: Angular Forms owns the
  value when it is attached and the component changes nothing by itself;
  otherwise the target is the value the component held after its first inputs.
  Vanilla: the values authored in the markup when the controller was created.
- Read-only and disabled controls are reset like editable ones.
- Secondary state returns to its initial state at the same moment, with a
  notification only where it changed: popups close, a query or draft is
  cleared, PasswordField returns to hidden, file lists are emptied, custom
  validity is recomputed and an `aria-invalid` set by a failed submission is
  removed.
- Timing. The state is settled one microtask after a reset started from script
  (`form.reset()`), and before the next paint after a reset the reader
  activates, because the browser resets the controls only after that event has
  been dispatched. Core `observeFormReset` is the one listener; it follows the
  `form` attribute.
- React TextField, Textarea, Select, Checkbox, Radio and Switch are native
  pass-through controls: uncontrolled, they return to `defaultValue` without
  `onChange`; controlled, they keep and show the application's value.

## Validation state and messages

`aria-invalid="true"` is on the native control (on the fieldset of a group)
exactly when one of these holds, and the attribute is absent otherwise:

1. the application passes a non-empty `error`;
2. the application passes an explicit `aria-invalid`;
3. a submission failed on this control: its `invalid` event fired, and the
   state lasts until the control is valid again after a value change, or until
   the form resets;
4. the reader committed a non-empty value that violates a constraint the
   component checks itself (DatePicker: malformed, out of range, unsupported or
   unavailable; PinInput: an incomplete code; FileDropzone: a rejected file).

It is never set because a required control is still empty before a submission,
and never because a message text is missing. The `invalid` event is not
prevented, so the browser's own report remains.

- Order inside a field: label or legend, control, hint, error. The hint is
  `<p class="hw-hint" id="{controlId}-hint">` and the error
  `<p class="hw-error" id="{controlId}-error">` in every adapter. The control's
  `aria-describedby` lists the application's ids, the Field's ids, the hint id
  and the error id, in that order and without duplicates.
- There is at most one `.hw-error` per control. The application's `error` is
  static text without a role. A message the component produces after the
  reader acted (from a `...Message` input or `getRejectedMessage`) is rendered
  in the same element with `role="alert"`, only while it applies. The
  application's `error` wins when both exist.
- Status that is not an error is never in `.hw-error`: it is a
  `role="status"` element that exists, empty, from the first render.
- A required control with a visible label shows one marker,
  `<span class="hw-required-marker" aria-hidden="true"> *</span>`, as the last
  child of its `label.hw-label` or `legend.hw-label`. The marker is never the
  only carrier of the requirement.

## Controlled and observable state

Every piece of state other than the value (`open`, `visible`, `expanded`,
`query`, `page`, `sortKey`, `sortDirection`) has one name in the four adapters
and three members derived from it.

- React: `<state>`, `default<State>`, `on<State>Change(value)`; controlled when
  `<state>` is not `undefined`.
- Vue: prop `<state>`, prop `default<State>`, event `update:<state>`, so
  `v-model:<state>` applies.
- Angular: input `<state>` and output `<state>Change`, so `[(<state>)]` applies.
  There is no `default<State>` input: a value written once is the initial value.
- Vanilla: option `on<State>Change(value)`, the event `hw:change` on the
  controller root with `detail.<state>`, and a controller member to read or set it.
- State that is only observable has the notification member alone, under the
  same name (`onQueryChange`, `update:query`, `(queryChange)`).
- The value keeps its own names: `value`, `defaultValue`, `onValueChange`
  (React); `modelValue`, `defaultValue`, `update:modelValue` (Vue); `value`,
  `valueChange` and ControlValueAccessor (Angular).
- A notification fires once per change with the new value, after the state
  changed, and not when the application changes a controlled prop. Controlled
  and uncontrolled state render the same DOM on the server.
- An action is not state and is named by its verb with the same payload in
  every adapter (Menu `action`, CookieConsent `consent`, Feedback `feedback`).

## Unavailable controls and focus

A control's own activation never drops keyboard focus to the document body.

- A control that stays in the DOM but becomes unavailable through its own
  activation (the previous or next arrow of Carousel and Pagination at a bound)
  carries `aria-disabled="true"`, stays focusable with a visible focus
  indicator, keeps its name and ignores activation. The `disabled` attribute
  remains for unavailability the reader did not cause on that control.
- A control that its own activation removes (the remove button of a chip or a
  tag, the dismiss button of a notification) hands focus to the same control of
  the next item, else of the previous item, else to the component's primary
  control or its focusable container (core `prepareRemovalFocus`). A component
  that is itself removed by the application (Alert, CookieConsent) moves no
  focus; the application places it.
- A popup that closes returns focus to its trigger only when focus was inside
  it. When focus moves to an element outside a non-modal popup, the popup
  closes without moving focus.
- Read-only is not disabled: a read-only control keeps its place in the tab
  order, its name and its value in `FormData`, and cannot be changed by
  pointer, keyboard, paste or drop.

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

## Routed links

Packaged links (Breadcrumb, NavigationDrawer, SideNavigation, SecondaryNav,
PortalHeader, PortalFooter, Card, ServiceCard, Link) are plain `a[href]` anchors
in every adapter and stay so: pages work without script, and "open in new tab"
and "copy link" keep working. No adapter depends on a router. An application with
a client-side router calls core `bindLinkNavigation(root, {navigate, base?})`
once, in the browser. It adds one delegated click listener to the root the
application names, renders nothing and changes no node, which is why a core DOM
utility may run over framework-owned trees here. It hands over a plain primary
activation of a same-origin link inside the base path and leaves everything else
to the browser: a prevented click, a modifier key or another button, `download`,
a `target` other than `_self`, `rel="external"`, aria-disabled or inert links,
and links to the current document that only add a fragment, which stay with
`bindFragmentLink`. `navigate` receives `{url, path, link, event}`; `path` is
relative to the base path and starts with `/`. Returning `false` leaves the click
to the browser. A handled click has its default prevented, so a component that
closes on a link activation "unless it was prevented" (NavigationDrawer) uses
`!event.defaultPrevented || isLinkNavigationHandled(event)`. No handler on a
packaged link may return `false`, which Angular treats as `preventDefault()`.
Focus after navigation, route announcements, scroll restoration and
`aria-current` remain the application's.

## Copying

`copyText(text)` resolves to `copied | denied | unavailable | failed | empty` and
never throws. The clipboard is written only inside that call, which an activation
makes; nothing is written on mount, nothing is ever read from the clipboard, and
there is no `document.execCommand` fallback. CopyButton keeps its state in
`createCopyFeedback`: only the latest activation counts, `copied` returns to
`idle` after `feedbackDuration` (3000 ms), a failure stays until the next
activation, and a result that arrives after the component is destroyed is
ignored. The button's accessible name never changes; the outcome is announced by
a polite status element that exists, empty, from the first render. `label`,
`copiedMessage` and `failedMessage` are required text with no default.

## Navigation lists

NavigationDrawer and SideNavigation render one list from one item model,
`{id, label, href?, icon?, current?, disabled?, expanded?, children?}`, with the
same markup and classes (`hw-navigation-drawer-row`, `-group`, `-label`), so one
array feeds the page sidebar and the phone drawer. Core decides what must not
differ: how an entry renders (`getNavigationItemKind`), the entries of a group
(`getNavigationGroupEntries`) and whether a group is open
(`isNavigationGroupOpen`: `expanded` is true, or a link inside it is the
current page). The `open` attribute is rendered on the server and written again
only when that value changes, so the reader's own toggles stand in between.
Groups are native `details`; there is no tree role and no roving focus.

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
