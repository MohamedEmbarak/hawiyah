# Behavior contracts (0.2)

Frameworks own their rendered trees. Core exports pure utilities and optional DOM
lifecycle helpers; it does not render components. Vanilla enhances existing markup.
This is the public 0.2 source preview. Package publication remains disabled;
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
- `formatNumber(value, { locale, ...Intl.NumberFormatOptions })`. `locale` is a
  required BCP 47 tag or priority list of tags (`string | string[]`).
- `formatDate(Date|number|string, { locale, calendar='gregory',
  timeZone='Asia/Riyadh', ...Intl.DateTimeFormatOptions })`. `locale` is
  required. The calendar and time zone defaults are not locale choices. Use ISO
  date strings with an explicit offset for instants. Calendar, numbering system, locale and
  direction are independent. This general formatter uses the runtime's Intl
  calendar data; use `formatCalendarDate` below for canonical picker-compatible
  Hijri date-only formatting.
- No default locale: `formatNumber`, `formatDate`, `sortRows`,
  `getCalendarMonth` and `formatCalendarDate` have no built-in locale and never
  fall back to the locale of the host. The options argument is required, a
  missing `locale` is a type error, and at run time a missing, empty or
  non-string locale throws `TypeError: Hawiyah: <helper> requires a locale from
  the application. There is no default locale.` Adapters test for a missing
  locale with `requireText(component, 'locale', locale)` before they call a
  helper, so a component warns in development and never throws.
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
- `normalizePinInput(raw, length, previous?, inputType?)` returns the digits of a
  one-time code: digits are normalized, every other character is removed, and
  only then is the result limited to `length`, so a pasted `123 456` keeps six
  digits. When a typed character (`inputType === 'insertText'`) would exceed the
  length and `previous` is given, `previous` is returned. Adapters therefore set
  no native `maxlength` on the input.
- `clampRange([lower,upper], min, max, changed:'lower'|'upper')` clamps the moved
  thumb to its peer; finite ordered bounds are required.
- `sortRows(rows, key, 'ascending'|'descending', locale)` returns a stable
  immutable sort; numbers compare numerically, strings use Intl.Collator for the
  required `locale` (`string | string[]`, no default), and missing values remain
  last in either direction.
- `CalendarSystem = 'gregory'|'islamic-umalqura'`.
- `getCalendarDateParts(iso, calendar?)` returns `{year,month,day}`;
  `convertCalendarDate(parts, calendar?)` returns Gregorian `YYYY-MM-DD`.
- `formatCalendarDate(iso, {locale,calendar?,numberingSystem?,year?,month?,day?,
  weekday?,era?,dateStyle?})` formats those same date-only fields. `locale` is
  required and has no default. It uses the
  pinned reference for all numeric Hijri values, including dates where ICU differs.
- `isCalendarDateSupported(iso, calendar?)` checks conversion support;
  `isDateInRange(iso,min?,max?)` validates actual Gregorian dates and bounds.
- `getDateViolation(draft, {calendar, min?, max?, isDateDisabled?}): DateViolation`
  names the first constraint a typed ISO date violates, in one order for every
  adapter: `'invalid'` (not a date), `'unsupported'` (outside the range the
  calendar system can show), `'invalid'` (outside `min` and `max`),
  `'unavailable'` (`isDateDisabled(draft)` returns `true`), else `''`. An empty
  draft returns `''`. It chooses no text and uses neither Intl nor the DOM.
- `moveCalendarDate(iso, amount, 'day'|'month'|'year', calendar?)` uses calendar
  math and clamps to the destination month's actual last day. Unsupported Hijri
  movement throws RangeError instead of silently using another calendar.
- `getCalendarMonth({locale,month?,value?,min?,max?,calendar?,weekStartsOn?})`
  returns `{label,weekdays,days,previous,next}`. `locale` is required and has no
  default; month names, weekday names and the Hijri era in `label` are Intl
  output for it, and core adds no words of its own. Each day is
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
if it matches) with supported `data-hw` hooks, including tabs, dialog, combobox,
tooltip and pagination. [The expansion contract](../vanilla/EXPANSION-API.md) lists
the additional control, calendar, disclosure and content hooks. Repeated
enhancement shares existing controllers; each cleanup releases its registration.
Only the last release destroys the controller. Direct controllers must be
destroyed by their owner; all `destroy()` methods are idempotent. Cleanup restores
attributes changed during enhancement and removes generated nodes/listeners.

Direct exports: `createTabs(element, options?)`, `createDialog(dialog, options?)`,
`createCombobox(element, options?)`, `createTooltip(element, options?)`, and
`createPagination(element, options?)`. Every controller has `destroy()`.
Selection and dialog controllers dispatch bubbling `hw:change` CustomEvents with
the detail below.

### Tabs

```html
<div class="hw-tabs" data-hw="tabs">
  <div class="hw-tab-list" role="tablist" aria-label="Request details">
    <button class="hw-tab" role="tab" id="overview-tab" aria-controls="overview"
      aria-selected="true" data-hw-value="overview">Overview</button>
    <button class="hw-tab" role="tab" id="history-tab" aria-controls="history"
      data-hw-value="history">History</button>
  </div>
  <section class="hw-tab-panel" id="overview" role="tabpanel"
    aria-labelledby="overview-tab">…</section>
  <section class="hw-tab-panel" id="history" role="tabpanel"
    aria-labelledby="history-tab" hidden>…</section>
</div>
```

Options `{ value?, activationMode?: 'automatic'|'manual', onValueChange? }`.
Controller `{ value, select(value), destroy }`. Value defaults to `data-hw-value`
then tab ID. `aria-orientation="vertical"` on tablist changes arrow keys.
`data-hw-activation="manual"` on root enables manual activation. Detail `{value}`.

### Native modal dialog

```html
<button data-hw-dialog-open="request-dialog">Open request</button>
<dialog id="request-dialog" class="hw-dialog" data-hw="dialog"
  aria-labelledby="request-title">
  <h2 id="request-title">Request</h2>
  <button data-hw-dialog-close>Close</button>
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
<div class="hw-combobox" data-hw="combobox">
  <label for="city">City</label>
  <input id="city" class="hw-input" data-hw-combobox-input autocomplete="off">
  <input type="hidden" name="city" data-hw-combobox-value>
  <ul class="hw-listbox" data-hw-combobox-list hidden>
    <li class="hw-option" data-hw-value="riyadh">الرياض</li>
    <li class="hw-option" data-hw-value="jeddah" aria-disabled="true">جدة</li>
  </ul>
  <span class="hw-sr-only" data-hw-combobox-status role="status"></span>
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

Tooltip root: `data-hw="tooltip"`, one `[data-hw-tooltip-trigger]`, and one
`[role="tooltip"]` with plain descriptive text and `hidden`. Controller
`{show(), hide(), destroy()}`. Opens on hover/focus, closes on Escape/blur/outside,
and remains open while pointer is over the tooltip. No interactive tooltip content.

Pagination root: `data-hw="pagination"`, native buttons with `data-hw-page="1"`
etc., optional `data-hw-page="previous|next"`, and `data-hw-total="N"`.
Options `{page?, totalPages?, onPageChange?}`; controller `{page, select(page),
destroy()}`. Current page uses `aria-current="page"`; boundaries disable previous
and next. Detail `{page}`. The application supplies the nav label and every other
text (see "Application text"). It does not fetch data.

Buttons, fields, selects, tables and file inputs use native HTML and CSS.
Accordions work natively without enhancement; opt-in vanilla motion uses
`createAccordion` or `data-hw="accordion"` with `enhance`. See
[accordion motion](../../docs/accordion-motion.md) for adapter lifecycle and state contracts.

`createAccordionMotion(details, content, onOpenChange?)` is a browser helper
invoked by native adapter lifecycles; imports remain SSR-safe. Called against a
server DOM (no `getRootNode`, child collections that are not iterable) it does
not throw; adapters still create it only in the browser. It coordinates
transient height/visibility, logical state, reduced motion and cleanup. It does
not render or reparent framework content. See [the contract](../../docs/accordion-motion.md).


## Numeric display policy

Hawiyah-generated numeric and calendar text always uses Latin digits (0–9), including
Arabic locales. formatNumber, formatDate, and formatCalendarDate enforce latn after
caller options; locale extensions or a conflicting numberingSystem option do not
change this policy. Locale still controls language, month/day names and formatting
order. No language is the default: the application passes the locale. Caller-provided
prose is not rewritten. normalizeDigits continues to accept Arabic and Persian
digits for input normalization.
# Read-only native choices

`observeReadonlyChoice(input: HTMLInputElement)` returns `{ refresh(), destroy() }`.
Call after mounting a checkbox/radio, refresh after application-controlled value
updates, and destroy before removal. It prevents activation when `readOnly` or
`aria-disabled="true"` is set and preserves radio peers without rendering DOM.
Adapters install it automatically; it does not make a disabled field focusable.
Where the input has no `getRootNode` (a server DOM) the owner document is used.
After a native form reset it reads the reset state through `observeFormReset`.

## Native form reset

`observeFormReset(control: Element, onReset: () => void)` returns `{ destroy() }`.
It calls `onReset` after a native reset of the form that owns `control`, once
the browser has reset the controls, and never for a reset that a listener
prevented or after `destroy()`.

- The owning form is resolved when the event arrives: `control.form` for an
  `input`, `select`, `textarea`, `button` or `output`; otherwise the form of the
  first `input`, `select` or `textarea` inside `control`; otherwise the closest
  `form` ancestor. The `form` attribute, a later association and a moved
  control are followed without a new observer. Resets of other forms are ignored.
- Timing: a reset started from script (`form.reset()`, a scripted click) is
  reported in the next microtask. A reset the reader activates is still being
  dispatched in that microtask, before the browser has reset the controls; it is
  reported before the next paint (the first of `requestAnimationFrame` and a
  zero timeout).
- One capture listener is added at the control's root: the document, the shadow
  root of a shadow tree, or the root of a tree that is not connected yet
  together with the document. A DOM that cannot listen yields an observer that
  does nothing.

`sameValue(a, b)` is `Object.is(a, b)`, or two arrays of equal length whose
entries are pairwise `Object.is`. Adapters use it to notify the application
only when a reset changed the value. `observeFieldValue` and
`observeReadonlyChoice` use `observeFormReset` themselves.

## Type-ahead

`createTypeahead({timeout = 500}?)` returns `{ next(key, labels, current,
isDisabled?), reset() }` for a list with roving focus (Menu, TreeView).

- `next` folds `key` with `normalizeSearch`, appends it to the typed text and
  restarts the timer that clears the text `timeout` milliseconds after the last
  key. A key that folds to nothing returns `-1` and changes nothing.
- When every typed character is the same, the search uses that one character,
  so repeating a letter cycles through the entries that start with it.
- The search starts at the entry after `current` (`-1` starts at the first),
  wraps, skips entries for which `isDisabled(index)` is true, and returns the
  first index whose folded label starts with the typed text, or `-1`.
- `labels` are the visible texts in visual order; in a tree, the visible nodes.
  The caller moves focus and calls `preventDefault()` only for a result of 0 or
  more, and calls `reset()` when the list closes or is destroyed.
- `isTypeaheadKey({key, ctrlKey?, metaKey?, altKey?})` is true for one
  character other than a space without Ctrl, Meta or Alt. Callers return first
  while `event.isComposing`.

An instance holds no DOM reference and starts its timer only inside `next`, so
it may be created during server rendering. `normalizeSearch` is unchanged.

## File selection

- `evaluateFileSelection(files, {accept?, multiple?, maxSize?}?)` returns
  `{accepted, rejected, reasons}` for one batch of chosen or dropped files, where
  `reasons[i]` (`'count' | 'type' | 'size'`) belongs to `rejected[i]` and
  `rejected` keeps the order given. More than one file without `multiple`
  rejects every file with `'count'`. Otherwise a file is rejected with `'type'`
  when it does not match `accept`, else with `'size'` when `maxSize` is a finite
  number above 0 and the file is larger. `accepted` is a copy of the batch when
  nothing was rejected and empty otherwise: a batch is accepted whole or not at
  all. Files are any objects with `name`, `type` and `size`.
- `matchesFileAccept(file, accept)` compares without regard to case: `.ext`
  with the end of the file name, `type/*` with the start of the MIME type, any
  other token with the whole MIME type. Tokens are separated by commas and
  trimmed; an empty list matches every file.
- `isFileDrag(transfer)` is true when `transfer.types` contains `'Files'`.
  A dropzone cancels `dragover` for such drags only.

## Focus after a removal

`prepareRemovalFocus(container, control, {item, control, fallback?})` keeps
keyboard focus when a control removes its own item (a chip, a tag, a
notification). Call it at activation, before the item is removed, and call the
returned function once after the render that removed it.

- `item` is a selector evaluated on `container` for the items; the innermost
  one that contains the control is the item being removed. `control` is a
  selector evaluated on an item for the control that receives focus.
- The returned function does nothing unless focus was on the control at
  activation, the control is now gone, disabled or `aria-disabled`, and focus
  is on the document body or inside the removed item. Focus placed elsewhere in
  the meantime is left alone.
- Focus then goes to the control of the next item, else of the previous ones,
  nearest first, skipping controls that are disconnected, disabled,
  `aria-disabled` or inside `[hidden]` or `[inert]`; else to `fallback` when it
  is connected (it must be focusable, for example with `tabindex="-1"`).
- It never throws and never scrolls. `prepareToastDismissFocus` remains the
  helper of ToastRegion.

## Portal branch headings

`getPortalBranchSummary(target, scope)` returns the `summary` that is, or
contains, `target` when its parent is `details[data-hw-portal-branch]` inside
`scope`, and `null` otherwise. PortalHeader uses it so that a press on a branch
heading does not close the open branch before the click arrives.

## Shared value types

- `FeedbackValue` is `{ helpful: boolean | null; comment: string }`; `helpful`
  is `null` until the reader has chosen.
- `ConsentChoice` is `'accepted' | 'rejected'`, the payload of the consent
  action of CookieConsent.

## Responsive tab measurement

`getTabOverflowIndices(widths, width, gap = 3)` returns omitted tab indices using
the NIC compact threshold (991px) and disclosure reserve (72px). It returns no
overflow when the full row fits, for a single tab, or for an unmeasured container.
`observeTabOverflow({container, tabs, enabled, onChange})` returns
`{refresh(), destroy()}`. It reads layout after mounting and reports changed
index arrays on resize, text/child changes and font loading; it does not render,
reparent, hide or focus DOM. Adapters own those operations. Imports are SSR-safe.
When the container has no `getBoundingClientRect` or its window has no
`getComputedStyle` (a server DOM), the returned handle does nothing: no timer
is started and `onChange` is never called.

## Content navigation observation

`ContentNavigationItem` is `{id, label, disabled?, children?}`. IDs refer to
existing sections in the same document; nested items are supported and duplicate
IDs are considered once. Disabled, missing, hidden, inert and CSS-concealed
sections are excluded. Content inside closed details is excluded except the
first direct summary subtree; every closed ancestor is checked. Changes to
`open` refresh tracking.

`observeContentNavigation({navigation, getItems, getScrollRoot, offset,
onCurrentChange})` returns `{refresh(), navigate(id, {focus?}), destroy()}`.
Call it after mounting; imports are SSR-safe. Without a window or
`getBoundingClientRect` (a server DOM) the returned handle does nothing and
`navigate` returns `false`. It measures existing elements and
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
link, identified by `data-hw-section`.

`navigate()` returns false for unavailable IDs or a destroyed observer. Valid
navigation scrolls only the configured viewport, uses the supplied offset (80px
fallback for nonfinite values), and respects reduced motion by explicitly using
instant scrolling even when the consumer declares smooth-scroll CSS. It does not modify
the URL or history. `{focus: true}` focuses the destination without additional
scrolling and temporarily supplies `tabindex="-1"` when needed; blur or destroy
restores that temporary attribute. Use this for keyboard/assistive-technology
activation, rather than for passive scrolling or ordinary pointer activation.

One activation reports one change. While a scroll that `navigate()` started is in
progress, the target stays current and measured updates wait, so a smooth scroll
past several sections does not step the marker through them. The hold ends when
the scroll position reaches the target (or the end of the scroll range, when the
target cannot reach the top), on `scrollend` from the scroll root or the window,
or after a pause in scroll events: 150 ms where `scrollend` is missing, and
1000 ms as a safety net where it exists. A `scrollend` that arrives short of the
target is confirmed by 150 ms without movement, because it can belong to a scroll
that a second activation replaced. The reader takes over at once with a wheel, a
touch move or a scrolling key (arrows, Page Up/Down, Home, End, Space), and when
the position moves away from the target, as a dragged scrollbar does; measurement
then resumes immediately. A second `navigate()` replaces the first. After a
scroll that arrived, the target stays current until the scroll position changes,
including when the page ends before the section reaches the top; a scroll that
stopped short of its end is measured where it stopped. A changed scroll root, a
target that disappears and `destroy()` end the hold. An instant scroll (reduced
motion) needs no hold.

## Local search suggestions

`getSearchSuggestions(query, suggestions, limit = 8)` returns
`SearchSuggestionMatch[]`, where each result is
`{value: string, segments: Array<{text: string, match: boolean}>}`. It finds the
first case-insensitive substring after trimming the query, removing Arabic vowel
and annotation marks, and unifying alef variants. Original display values are
never rewritten. UTF-16 ranges map back to the source string, retaining Arabic
marks and whole surrogate pairs/lowercase-expanding characters in highlights.
The helper returns text segments, never HTML; render them as text and optional
`strong` elements. General `normalizeSearch` is unchanged by this helper.

Exact duplicate values are removed, with source ordering preserved. Empty or
marks-only queries yield no results. Limits are floored and bounded to 0–100;
NaN uses the default 8. This is a local suggestion filter with no network,
ranking service, application routing or remote dictionary loading.

`requestSearchDialogClose(input)` requests closing the nearest open native dialog
only when it is actually modal (`:modal`) and does not specify `closedby="none"`.
It returns true when a request was attempted, including a canceled request, so
the adapter can prevent the search input's native Escape-to-clear behavior.
Use it after dismissing an open suggestion list. Native `requestClose()` is used
when available; the fallback dispatches a cancelable event from the document's
realm and closes only if permitted and still open. Existing `returnValue` is
preserved. Closed/nonmodal dialogs, unsupported `:modal` selectors, and
`closedby="none"` return false without requesting a close.


## Toast dismissal

`prepareToastDismissFocus(region, toast)` snapshots focus and the neighboring
notices before a dismissal request. Call its returned function once after that
request commits. If the focused notice was removed or hidden and focus was
lost, it tries the following enabled dismiss buttons, then the nearest previous
button, then the labelled region. The region must be programmatically focusable.
A rejected request, a visible replacement with the same ID, disconnection or
focus deliberately placed elsewhere leaves focus with its owner.

## Application text

Core holds no user-visible or accessible-name strings and no language registry.
The registries `getCalendarLabels`, `fileUploadLabels` and
`getSiteVerificationLabels` are removed, together with the transitional
`RemovedExport` placeholders that kept their names for one step: importing any
of them is now a build error. The types
`FileUploadLabels` and `SiteVerificationLabels` remain as the shapes the
application fills. `FileUploadLabels` is `{selected, uploading,
complete, error, remove, getProgressLabel(name), getRemoveLabel(name)}`.
`SiteVerificationOptions` requires every label and has no `locale`.

- `hasText(value)` is true for a string with a non-space character, a finite
  number, a function, a non-empty array containing text and any other rendered
  value; false for `null`, `undefined`, booleans, blank strings, `NaN` and
  empty arrays.
- `requireText(component, name, value, when?)` returns `hasText(value)`. When the
  text is missing it warns once per component and input with `console.warn` in
  development and returns `false`. It never substitutes a string: the caller
  renders nothing in its place. Development means `process.env.NODE_ENV` is not
  `'production'`. A bundler replaces that expression, so a production bundle is
  silent in the browser; where nothing replaced it and `process` does not exist
  (a page without a bundler) the build counts as development, and such a page
  can set `globalThis.__HAWIYAH_DEV__` to `true` or `false`. Nothing runs
  at module evaluation and no browser global is read, so it is safe during server
  rendering. `resetTextWarnings()` clears the once-only memory for tests.
- `formatTextTemplate(template, values)` replaces `{name}` placeholders in an
  application-supplied template and leaves unknown placeholders as written. The
  vanilla adapter uses it for template attributes such as
  `data-hw-page-label="… {page}"`.

## In-page links

- `getFragmentHref(id, documentUrl?, baseUrl?)` is pure. It returns `#id`
  (percent-encoded) when no document URL is known or the base equals the document
  URL without its fragment; the document path, query and fragment when a base on
  the same origin differs; and the absolute document URL with the fragment when
  the base is on another origin.
- `getFragmentId(href)` returns the decoded fragment of `#id` or `path#id`.
- `bindFragmentLink(link, {id?, navigate?, updateHash?})` returns `{refresh(),
  activate(), destroy()}`. It leaves the rendered `#id` untouched when called, so
  hydration sees the server markup. On focus, pointer contact, the context menu,
  auxiliary clicks and clicks it rewrites the href with `getFragmentHref` for the
  current `location` and `document.baseURI`. A plain primary click is handled in
  the page: the target is found by id, then either `navigate(id, target)` runs or
  the target is scrolled into view without animation and focused, with a
  temporary `tabindex="-1"` when needed. The URL is not changed unless
  `updateHash` is true (`history.replaceState`). Modified clicks, other `target`
  values, a missing target and `navigate` returning `false` are left to the
  browser. `destroy()` removes the listeners and restores `#id` only if the href
  is still the value it wrote. On a server DOM without a window it is inert.

## Copying text

- `copyText(text): Promise<CopyStatus>` with `CopyStatus = 'copied' | 'denied' |
  'unavailable' | 'failed' | 'empty'`. `empty`: the text is not a string or holds
  only white space; nothing is written. `unavailable`: there is no
  `navigator.clipboard.writeText` (a server, an insecure context). `denied`: the
  write was rejected with `NotAllowedError` or `SecurityError`. `failed`: any
  other rejection. The text is written as given, without trimming. The function
  reads `navigator` only when called, never reads the clipboard, has no
  `document.execCommand` fallback and never throws.
- `createCopyFeedback({getText, getDuration?, onStateChange, onResult?, write?})`
  returns `{state, status, copy(), reset(), destroy()}`. Creating it touches
  nothing. `state` is `'idle' | 'copied' | 'failed'`; `status` is the outcome
  behind it. `copy()` is one activation: it clears the timer, returns to `idle`
  (which empties the status element, so a repeated message is announced again),
  reads `getText()`, awaits `write` (`copyText` by default) and then reports
  `copied` or `failed` through `onStateChange(state, status)`, followed by
  `onResult({status, text})`. `copied` returns to `idle` after `getDuration()`
  milliseconds (`COPY_FEEDBACK_DURATION`, 3000, for a value that is not a finite
  number above zero); `failed` stays until the next activation, with no timer.
  Only the latest activation counts: an earlier one resolves to `undefined`,
  changes no state and reports no result. The same holds after `reset()` and
  `destroy()`, which also clear the timer. A `getText` or `write` that throws is
  `failed`.
- `copyFeedbackIcons` is `{idle: 'copy-01', copied: 'tick-02', failed: 'alert-02'}`.

## Routed links

- `bindLinkNavigation(root, {navigate, base?})` returns `{destroy()}`. `root` is a
  document or an element. One click listener is added to it in the bubble phase,
  so component handlers and application guards run first. Nothing is rendered and
  no node is changed. Without a root, or without a browser window, the handle is
  inert, so the call is safe during server rendering.
- It acts on a click with button 0, no modifier key and the default not prevented
  (Enter on a link arrives as such a click), on an HTML `a[href]` inside `root`
  that is same-origin, inside the base path, has no `download`, no `target` other
  than `_self` (its own, or the one on `<base target>`), no `rel="external"`, is
  not inside `[aria-disabled="true"]` or `[inert]`, is not editable content, and
  is not a link to the current document whose href holds a fragment. SVG anchors
  are left alone.
- `navigate({url, path, link, event})`: `url` is the resolved `URL`; `path` is
  pathname, search and hash relative to the base path, starting with `/`. The
  base path is `base` when given, else the directory of a same-origin
  `<base href>`, else `/`. Returning `false` leaves the click to the browser. Any
  other return prevents the default and records the event. If `navigate` throws,
  the default is not prevented and the browser follows the link.
- `isLinkNavigationHandled(event)` is true for a recorded event. A component that
  reacts to a link activation "unless it was prevented" checks
  `!event.defaultPrevented || isLinkNavigationHandled(event)`.

## Navigation lists

`NavigationItem` is `{id, label, href?, icon?, current?, disabled?, expanded?,
children?}`. NavigationDrawer and SideNavigation render it with the same markup.

- `getNavigationItemKind(item)`: `disabled` (text with `aria-disabled="true"`;
  children are not rendered), else `group` (it has children; native `details`),
  else `link` (it has an `href`), else `text`.
- `getNavigationGroupEntries(item)`: the children, preceded by the group itself
  as a link when the group has an `href`, under the id `<id>-page` (suffixed again
  until no child uses it).
- `isNavigationGroupOpen(item)`: `expanded === true`, or a link rendered inside
  the group is the current page. A disabled entry, an entry without `href` and
  everything under a disabled group never count as current.
- `getNavigationCurrentId(items)`: the `data-hw-value` of the first link rendered
  with `aria-current="page"`, or `''`.
- `revealNavigationCurrent(navigation)`: when the navigation overflows its own
  box and `a[aria-current="page"]` is not fully visible in it, centres the link
  by scrolling the navigation only, without animation, and returns `true`. It
  never scrolls the page and never moves focus. A link in a closed group has no
  box and is skipped. Without layout (a server DOM) it returns `false`.
