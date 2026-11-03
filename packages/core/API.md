# Behavior contracts (0.1)

Frameworks own their rendered trees. Core exports pure utilities and optional DOM
lifecycle helpers; it does not render components. Vanilla enhances existing markup.
This is the public 0.1 source preview. Package publication remains disabled;
build and consume these APIs through the workspace until an npm release is announced.

## Core

- `Direction = 'ltr' | 'rtl'`; `Orientation = 'horizontal' | 'vertical'`.
- `Option = { value: string; label: string; disabled?: boolean }`.
- `normalizeSearch(string)` folds Arabic diacritics/tatweel and alef variants,
  Unicode compatibility forms, case and redundant whitespace. It does not alter
  displayed text or values.
- `filterOptions<T extends Option>(readonly T[], query): T[]` matches normalized
  labels and preserves option objects, order and disabled options.
- `getNextEnabledIndex(current, key, items, direction='ltr',
  orientation='horizontal')` wraps arrows, skips disabled options, supports
  Home/End, and returns -1 if none are enabled. Horizontal arrows follow visual
  direction; vertical arrows do not change with RTL. Unhandled keys keep current.
- `formatNumber(value, { locale='ar-SA', ...Intl.NumberFormatOptions })`.
- `formatDate(Date|number|string, { locale='ar-SA', calendar='gregory',
  timeZone='Asia/Riyadh', ...Intl.DateTimeFormatOptions })`. Use ISO date strings
  with an explicit offset for instants. Calendar, numbering system, locale and
  direction are independent. This general formatter uses the runtime's Intl
  calendar data; use `formatCalendarDate` below for canonical picker-compatible
  Hijri date-only formatting.
- `createCleanup()` returns `{ add(fn), listen(target,type,listener,options?),
  destroy(), destroyed }`; destroy is idempotent, listeners are removed, and
  adding after destruction immediately cleans up.
- `getDirection(element)`, `isDisabled(element)`, `restoreFocus(element)` are
  optional DOM helpers, with no browser globals touched at import.
- `createComboboxState(options, value='')` and
  `transitionCombobox(state, event, options)` share the combobox transitions.
  State is `{value, query, open, activeIndex}`; activeIndex addresses
  `getComboboxOptions(state, options)`. That helper returns all options while a
  committed value is present, and filters by query after editing. Events are `{type:'input', query}`,
  `{type:'open'}`, `{type:'close'}`, `{type:'navigate', key}` (ArrowDown, ArrowUp,
  Home, End), `{type:'select', value}`, `{type:'reset', value?}`. Input clears
  committed value and opens; close resets activeIndex and preserves query;
  only explicit select commits an enabled option. Adapters close on Escape,
  Tab, blur and outside interaction, and reset to their initial value on form reset.

### Expanded pure helpers

- `normalizeRatingMax(max=5)` floors/clamps finite capacities to 1…20; nonfinite
  capacities become 5. `normalizeRatingValue(value,max)` clamps finite scores to
  0…max while preserving fractions; nonfinite scores become 0. Integer rating
  inputs floor the normalized score, while aggregate displays retain fractions.
- `normalizePaginationTotal(total)` floors/clamps finite totals to positive
  safe integers, with fallback 1. `normalizePaginationPage(page,total)` floors
  and clamps a finite page to 1…total, with fallback 1.
- `getPaginationItems(page,total,siblingCount=1): PaginationItem[]` returns
  bounded visible page numbers and inclusive `{start,end}` gaps. The sibling
  radius floors/clamps to 0…5, defaulting to 1 for nonfinite values. Empty or
  single-page gaps become direct page numbers. It never allocates every page.

- `normalizeDigits(value)` converts Arabic-Indic/Eastern Arabic digits to ASCII.
- `clampRange([lower,upper], min, max, changed:'lower'|'upper')` clamps the moved
  thumb to its peer; finite ordered bounds are required.
- `sortRows(rows, key, 'ascending'|'descending', locale='ar-SA')` returns a stable
  immutable sort; numbers compare numerically, strings use Intl.Collator, and
  missing values remain last in either direction.
- `CalendarSystem = 'gregory'|'islamic-umalqura'`.
- `getCalendarDateParts(iso, calendar?)` returns `{year,month,day}`;
  `convertCalendarDate(parts, calendar?)` returns Gregorian `YYYY-MM-DD`.
- `formatCalendarDate(iso, {calendar?,locale?,numberingSystem?,year?,month?,day?,
  weekday?,era?,dateStyle?})` formats those same date-only fields. It uses the
  pinned reference for all numeric Hijri values, including dates where ICU differs.
- `isCalendarDateSupported(iso, calendar?)` checks conversion support;
  `isDateInRange(iso,min?,max?)` validates actual Gregorian dates and bounds.
- `moveCalendarDate(iso, amount, 'day'|'month'|'year', calendar?)` uses calendar
  math and clamps to the destination month's actual last day. Unsupported Hijri
  movement throws RangeError instead of silently using another calendar.
- `getCalendarMonth({month?,value?,min?,max?,locale?,calendar?,weekStartsOn?})`
  returns `{label,weekdays,days,previous,next}`. Each day is
  `{value,label,disabled,outside,selected,today}`. Week starts Sunday (0) by default;
  complete grids have 28/35/42 cells. Values are always Gregorian ISO dates.
- `UMALQURA_MIN_DATE='1924-08-01'`, `UMALQURA_MAX_DATE='2077-11-16'` bound the
  pinned published HijriDate reference (AH1343–1500). Month display anchors clamp
  into this range, unsupported adjacent cells are blank/disabled, and previous/
  next point to the current month at its corresponding boundary.
- `SaudiUmalquraCalendar` implements @internationalized/date's Calendar interface
  for the same bounded reference; it has no civil-calendar fallback. Its table
  provenance and third-party license are bundled with core.
- `layoutStyles(props)` and its `LayoutProps`/`Responsive` types emit CSS variables
  for the shared layout primitives, without browser or viewport reads.

## Vanilla

`enhance(root?: ParentNode): () => void` initializes descendants (and the root,
if it matches) with supported `data-nq` hooks, including tabs, dialog, combobox,
tooltip and pagination. [The expansion contract](../vanilla/EXPANSION-API.md) lists
the additional control, calendar, disclosure and content hooks. Repeated
enhancement shares existing controllers; each cleanup releases its registration.
Only the last release destroys the controller. Direct controllers must be
destroyed by their owner; all `destroy()` methods are idempotent. Cleanup restores
attributes changed during enhancement and removes generated nodes/listeners.

Direct exports: `createTabs(element, options?)`, `createDialog(dialog, options?)`,
`createCombobox(element, options?)`, `createTooltip(element, options?)`, and
`createPagination(element, options?)`. Every controller has `destroy()`.
Selection and dialog controllers dispatch bubbling `nq:change` CustomEvents with
the detail below.

### Tabs

```html
<div class="nq-tabs" data-nq="tabs">
  <div class="nq-tab-list" role="tablist" aria-label="Request details">
    <button class="nq-tab" role="tab" id="overview-tab" aria-controls="overview"
      aria-selected="true" data-nq-value="overview">Overview</button>
    <button class="nq-tab" role="tab" id="history-tab" aria-controls="history"
      data-nq-value="history">History</button>
  </div>
  <section class="nq-tab-panel" id="overview" role="tabpanel"
    aria-labelledby="overview-tab">…</section>
  <section class="nq-tab-panel" id="history" role="tabpanel"
    aria-labelledby="history-tab" hidden>…</section>
</div>
```

Options `{ value?, activationMode?: 'automatic'|'manual', onValueChange? }`.
Controller `{ value, select(value), destroy }`. Value defaults to `data-nq-value`
then tab ID. `aria-orientation="vertical"` on tablist changes arrow keys.
`data-nq-activation="manual"` on root enables manual activation. Detail `{value}`.

### Native modal dialog

```html
<button data-nq-dialog-open="request-dialog">Open request</button>
<dialog id="request-dialog" class="nq-dialog" data-nq="dialog"
  aria-labelledby="request-title">
  <h2 id="request-title">Request</h2>
  <button data-nq-dialog-close>Close</button>
</dialog>
```

Options `{ closeOnBackdrop?: boolean, onOpenChange? }` (backdrop defaults true).
Controller `{ open: boolean, show(trigger?), close(returnValue?), destroy }`.
Native `showModal()` supplies modality, focus containment and Escape. A browser
with native dialog support is required. `autofocus` chooses initial focus.
Open triggers use document-level delegation, so triggers may be outside root.
Detail `{open}`. Destroy closes a dialog opened by the controller and restores
the connected trigger. It leaves a dialog already open before enhancement open.

### Editable, single-select combobox

```html
<div class="nq-combobox" data-nq="combobox">
  <label for="city">City</label>
  <input id="city" class="nq-input" data-nq-combobox-input autocomplete="off">
  <input type="hidden" name="city" data-nq-combobox-value>
  <ul class="nq-listbox" data-nq-combobox-list hidden>
    <li class="nq-option" data-nq-value="riyadh">الرياض</li>
    <li class="nq-option" data-nq-value="jeddah" aria-disabled="true">جدة</li>
  </ul>
  <span class="nq-sr-only" data-nq-combobox-status role="status"></span>
</div>
```

Options `{ value?, onValueChange?, getResultsMessage?: (count)=>string,
invalidSelectionMessage?: string }`.
Controller `{ value, open: boolean, select(value), show(), close(), destroy }`.
Input must have an accessible name from its surrounding markup. Options have
stable string values and plain text labels; `aria-disabled="true"` skips them.
The optional hidden input receives the selected value and a bubbling `change`.
Query changes clear committed selection; blur retains the query without silently
selecting. Escape closes without selecting; Tab closes and moves focus normally.
Arrow/Home/End navigation uses `aria-activedescendant`, keeping input focus. The
optional status node announces localized result counts (Arabic default); a
missing status is generated and removed on destroy. Detail `{value, label}`;
empty selection emits `{value:'', label:''}`. No multiselect/async/virtualization.
When the input is required, uncommitted query text fails native validation;
`invalidSelectionMessage` localizes the message (Arabic by default). Cleanup
restores the input's original custom validity.

### Tooltip and pagination

Tooltip root: `data-nq="tooltip"`, one `[data-nq-tooltip-trigger]`, and one
`[role="tooltip"]` with plain descriptive text and `hidden`. Controller
`{show(), hide(), destroy()}`. Opens on hover/focus, closes on Escape/blur/outside,
and remains open while pointer is over the tooltip. No interactive tooltip content.

Pagination root: `data-nq="pagination"`, native buttons with `data-nq-page="1"`
etc., optional `data-nq-page="previous|next"`, and `data-nq-total="N"`.
Options `{page?, totalPages?, onPageChange?}`; controller `{page, select(page),
destroy()}`. Current page uses `aria-current="page"`; boundaries disable previous
and next. Detail `{page}`. Supply a localized nav label. It does not fetch data.

Buttons, fields, selects, tables and file inputs use native HTML and CSS.
Accordions work natively without enhancement; opt-in vanilla motion uses
`createAccordion` or `data-nq="accordion"` with `enhance`. See
[accordion motion](../../docs/accordion-motion.md) for adapter lifecycle and state contracts.

`createAccordionMotion(details, content, onOpenChange?)` is a browser helper
invoked by native adapter lifecycles; imports remain SSR-safe. It coordinates
transient height/visibility, logical state, reduced motion and cleanup. It does
not render or reparent framework content. See [the contract](../../docs/accordion-motion.md).


## Numeric display policy

Nasaq-generated numeric and calendar text always uses Latin digits (0–9), including
Arabic locales. formatNumber, formatDate, and formatCalendarDate enforce latn after
caller options; locale extensions or a conflicting numberingSystem option do not
change this policy. Locale still controls language, month/day names and formatting
order. Arabic remains the default language and RTL remains supported. Caller-provided
prose is not rewritten. normalizeDigits continues to accept Arabic and Persian
digits for input normalization.
# Read-only native choices

`observeReadonlyChoice(input: HTMLInputElement)` returns `{ refresh(), destroy() }`.
Call after mounting a checkbox/radio, refresh after application-controlled value
updates, and destroy before removal. It prevents activation when `readOnly` or
`aria-disabled="true"` is set and preserves radio peers without rendering DOM.
Adapters install it automatically; it does not make a disabled field focusable.

## Responsive tab measurement

`getTabOverflowIndices(widths, width, gap = 3)` returns omitted tab indices using
the NIC compact threshold (991px) and disclosure reserve (72px). It returns no
overflow when the full row fits, for a single tab, or for an unmeasured container.
`observeTabOverflow({container, tabs, enabled, onChange})` returns
`{refresh(), destroy()}`. It reads layout after mounting and reports changed
index arrays on resize, text/child changes and font loading; it does not render,
reparent, hide or focus DOM. Adapters own those operations. Imports are SSR-safe.

## Content navigation observation

`ContentNavigationItem` is `{id, label, disabled?, children?}`. IDs refer to
existing sections in the same document; nested items are supported and duplicate
IDs are considered once. Disabled, missing, hidden, inert and CSS-concealed
sections are excluded. Content inside closed details is excluded except the
first direct summary subtree; every closed ancestor is checked. Changes to
`open` refresh tracking.

`observeContentNavigation({navigation, getItems, getScrollRoot, offset,
onCurrentChange})` returns `{refresh(), navigate(id, {focus?}), destroy()}`.
Call it after mounting; imports are SSR-safe. It measures existing elements and
owns scroll/focus listeners only. Adapters retain DOM rendering, link attributes
and application state. `getScrollRoot()` returns a scrollable element or `null`
for the window; targets outside a supplied element are excluded. Refresh after
changing items, offset or root. Observers also react to scroll, resize, content,
ID/visibility changes and font loading, without recreating resize observation on
every frame.

Current selection is deterministic: the latest target whose top has passed the
viewport start plus offset plus 20px; otherwise the first upcoming target. At an
actual scrollable page/container bottom, the final target is selected. This keeps
a current section through tall content and gaps. `onCurrentChange(id)` fires only
when the ID changes (including initialization); an empty ID clears selection if
no eligible target remains. Passive updates never focus content or scroll the
host. An overflowing navigation region may scroll itself to reveal its current
link, identified by `data-nq-section`.

`navigate()` returns false for unavailable IDs or a destroyed observer. Valid
navigation scrolls only the configured viewport, uses the supplied offset (80px
fallback for nonfinite values), and respects reduced motion by explicitly using
instant scrolling even when the consumer declares smooth-scroll CSS. It does not modify
the URL or history. `{focus: true}` focuses the destination without additional
scrolling and temporarily supplies `tabindex="-1"` when needed; blur or destroy
restores that temporary attribute. Use this for keyboard/assistive-technology
activation, rather than for passive scrolling or ordinary pointer activation.
