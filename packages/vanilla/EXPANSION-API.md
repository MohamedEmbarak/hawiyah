# Expansion markup contract

All roots below use `data-hw` and the matching `.hw-*` class. `enhance(root)`
discovers them; direct `create{Name}` controllers return idempotent `destroy()`.
Selection/change controllers bubble `hw:change` with their value. Supply visible
labels, hint/error IDs, native input names and disabled/required state.
Static/native recipes at the end require no enhancement.

## Text is supplied by the application

Controllers contain no built-in words and never read `lang` or a locale to choose
text. A text that a controller places on an element it creates is taken from the
authored markup first, then from `data-hw-<kebab-name>` on the controller root
(a template attribute such as `data-hw-page-label="Page {page}"` for a function
input `getPageLabel(page)`), then from the controller option of the same name,
which wins. A missing required text renders nothing and logs one development
warning through core `requireText`; a validation constraint without its message
still blocks submission. The examples below pass every required text; see the
[package README](README.md) for the full list.

Search fields can opt into an inset clear action:

```html
<div class="hw-field hw-search-field" data-hw="search-field">
  <label class="hw-label" for="query">Search</label>
  <div class="hw-search-control">
    <input class="hw-input" id="query" name="query" type="search" data-hw-search-input>
    <button class="hw-button hw-search-clear" type="button" hidden data-hw-search-clear aria-label="Clear search"></button>
  </div>
</div>
```

`createSearchField(root, { clearLabel, getResultsMessage, onValueChange })` returns `value`,
`clear()`, `setValue(value)`, `setSuggestions(items)` and `destroy()`. Clear emits native input/change
and one `hw:change`; setValue synchronizes silently. Read-only and disabled
fields cannot be cleared. Search submission belongs to the application form.
See [search field behavior](../../docs/search-field.md).

```html
<div data-hw="password-field"><label>Password <input type="password" data-hw-password-input name="password"></label><button type="button" data-hw-password-toggle aria-label="Show password" data-hw-hide-label="Hide password"></button></div>
<div data-hw="range-slider"><label>Minimum <input type="range" data-hw-lower name="minimum" min="0" max="100" value="20"></label><label>Maximum <input type="range" data-hw-upper name="maximum" min="0" max="100" value="80"></label><output data-hw-range-output></output></div>
<div data-hw="pin-input"><label>One-time code <input data-hw-pin-input name="code" maxlength="6"></label></div>
<div data-hw="tag-input" data-hw-name="tags" data-hw-value='["Design"]' data-hw-remove-label="Remove {tag}"><label>Add a tag <input data-hw-tag-input></label><div data-hw-tags></div></div>
<fieldset data-hw="multi-select" data-hw-results-message="{count} options"><legend>Services</legend><label>Search options <input type="search" data-hw-multiselect-search></label><div data-hw-option><label><input type="checkbox" name="services" value="a">Service A</label></div><div data-hw-option><label><input type="checkbox" name="services" value="b">Service B</label></div><span data-hw-status role="status"></span></fieldset>
```

Tag input generates removable chips and repeated hidden form inputs. Enter or
comma commits trimmed unique tags; Backspace on an empty query removes the final
tag. Each chip's remove button is named by `getRemoveLabel(tag)` (or
`data-hw-remove-label="… {tag}"`), and a required tag input takes
`requiredMessage`. `data-hw-readonly="true"` prevents edits. Pin input normalizes Arabic-Indic
and Eastern Arabic digits into ASCII, keeps one focus stop and uses native
maxlength/required. MultiSelect uses actual checkboxes; filtered selections remain
checked and submitted. Native fieldset disabled works normally. PasswordField
names its toggle from `showLabel` (the toggle's own `aria-label` or text, else
`data-hw-show-label`) and `hideLabel` (`data-hw-hide-label`); MultiSelect
announces the filtered count through `getResultsMessage(count)` when
`[data-hw-status]` exists.

For required MultiSelect selection, set `data-hw-required="true"` on its root or
pass `{ required: true, requiredMessage: 'Choose at least one service.' }` to
`createMultiSelect`. Explicit `required` overrides the attribute. Validation
counts checked enabled options, uses the focusable search input, and updates
after changes/reset/disabled attributes. Do not put native `required` on the
search text or each checkbox. Readonly selection keeps search usable and selected
values submitted. See [validation contracts](../../docs/multiselect-validation.md).

RangeSlider's `data-hw-readonly="true"` prevents pointer and value-changing
keyboard input while preserving Tab/Shift+Tab navigation and other native keys.
Its two labelled thumbs remain focusable; read-only values still submit normally.

```html
<div class="hw-calendar" data-hw="calendar" data-hw-value="2026-10-28"
  data-hw-month="2026-10-01" data-hw-min="2026-01-01" data-hw-max="2027-12-31"
  data-hw-calendar="gregory" data-hw-locale="en-GB" data-hw-name="date"
  aria-label="Choose an appointment date" data-hw-previous-label="Previous month"
  data-hw-next-label="Next month" data-hw-calendar-system-label="Calendar system"
  data-hw-gregorian-label="Gregorian" data-hw-hijri-label="Hijri"
  data-hw-range-label="Supported Hijri range"
  data-hw-unsupported-message="This date is outside the supported Hijri range."></div>
<div class="hw-date-picker" data-hw="date-picker" data-hw-calendar="islamic-umalqura" data-hw-locale="ar-SA"
  data-hw-calendar-label="اختر موعدًا" data-hw-previous-label="الشهر السابق" data-hw-next-label="الشهر التالي"
  data-hw-calendar-system-label="نظام التقويم" data-hw-gregorian-label="ميلادي" data-hw-hijri-label="هجري"
  data-hw-range-label="النطاق الهجري المدعوم" data-hw-invalid-message="أدخل تاريخًا صحيحًا."
  data-hw-unsupported-message="هذا التاريخ خارج النطاق الهجري المدعوم.">
  <label>Appointment <input type="text" placeholder="YYYY-MM-DD" data-hw-date-input name="appointment" required></label>
  <button type="button" data-hw-date-trigger aria-label="Choose date">Calendar</button>
  <dialog class="hw-dialog" data-hw-date-dialog aria-label="Choose appointment date">
    <header class="hw-dialog-header"><h2>Choose appointment date</h2><button class="hw-button" data-variant="ghost" type="button" data-hw-date-close>Close</button></header>
    <div class="hw-dialog-body"><div class="hw-calendar" data-hw-date-calendar></div></div>
  </dialog>
</div>
<label class="hw-file-dropzone" data-hw="file-dropzone" data-hw-selected-message="{count} files selected"
  data-hw-rejected-message="{count} files do not match the allowed type and size"
  data-hw-unsupported-drop-message="Use the file chooser to attach documents.">Choose or drop documents
  <input type="file" data-hw-file-input name="documents" multiple accept=".pdf,.png">
  <span data-hw-file-status role="status"></span>
</label>
```

Calendar generates its toolbar, labelled grid, localized weekdays/day buttons and
optional named hidden input. Values and bounds are always Gregorian ISO dates;
the display calendar is independent. `data-hw-week-starts-on="0"`,
`data-hw-readonly="true"`, `data-hw-disabled="true"` are supported. Keyboard:
RTL-aware horizontal arrows, vertical weeks, Home/End within the week,
PageUp/PageDown by display month, Shift+PageUp/PageDown by display year. Disabled
dates cannot be selected. DatePicker composes a native input and native modal;
the nested `[data-hw-date-calendar]` must NOT separately have `data-hw="calendar"`.
Dropzone preserves native file input. Optional `data-hw-max-size` is bytes;
accept/multiple/disabled come from input. Only accepted files become its value.
With a `[data-hw-file-status]` region it announces `getSelectedMessage(files)`,
`getRejectedMessage(rejected)` (when `accept` or a maximum size is set) and
`unsupportedDropMessage`; the template attributes receive `{count}`.

Calendar and DatePicker include a labelled Gregorian/Hijri selector. Switching
display systems preserves the ISO selection and keeps an open picker open.
Numeric Hijri fields come from the pinned published HijriDate reference, with
supported Gregorian range 1924-08-01 through 2077-11-16. The UI shows this range
after `rangeLabel`; unsupported selections are preserved, `unsupportedMessage` is
shown, and DatePicker reports native invalidity.
There is no civil arithmetic fallback or claim of current official-service parity.

Direct Calendar options include `value`, `month`, `min`, `max`, `locale`, `calendar`,
`weekStartsOn`, `disabled`, `readOnly`, `name`, `isDateDisabled`, `onValueChange`,
`onSelect`, and `onCalendarChange`, plus the texts `label`, `previousLabel`,
`nextLabel`, `calendarSystemLabel`, `gregorianLabel`, `hijriLabel`, `rangeLabel`,
`unsupportedMessage` and the optional `getDayLabel(value)`. `locale` (or
`data-hw-locale`) is required; month and weekday names come from Intl for it.
DatePicker takes the same texts except `label`, and adds `calendarLabel`,
`openLabel` (unless the trigger has its own text or `aria-label`),
`invalidMessage` and, with `isDateDisabled`, `unavailableMessage`. Its controller has `value`, `calendar`,
`select`, silent `setValue`, `setMonth`, `setCalendar`, and `destroy`. DatePicker
adds `show`/`close` and uses its native input for bounds, names and form validation.
It generates `[data-hw-date-display].hw-date-picker-value`, a polite live output
associated through `aria-describedby`, showing the selected date in the chosen
calendar while the native input retains Gregorian ISO editing. Blank hides it;
unsupported Hijri values show `unsupportedMessage` without clearing the input.
`onSelect` fires even when confirming the current date; value callbacks fire only
when the value changes. The composed picker emits one public value event.

```html
<fieldset data-hw="toggle-group"><legend>View</legend><label><input type="radio" name="view" value="list" checked>List</label><label><input type="radio" name="view" value="grid">Grid</label></fieldset>
<div data-hw="toggle-group" data-hw-multiple="true" role="group" aria-label="Text style"><button type="button" data-hw-value="bold" aria-pressed="false">Bold</button><button type="button" data-hw-value="italic" aria-pressed="false">Italic</button></div>
<div data-hw="popover"><button type="button" data-hw-trigger>Open information</button><div data-hw-panel role="region" aria-label="Information" hidden><p>Useful information</p><button type="button" data-hw-close>Close</button></div></div>
<div data-hw="menu"><button type="button" data-hw-trigger>Actions</button><div data-hw-panel role="menu" aria-label="Actions" hidden><button type="button" role="menuitem" data-hw-value="edit">Edit</button><button type="button" role="menuitem" data-hw-value="archive">Archive</button></div></div>
<button type="button" data-hw-dialog-open="drawer">Open drawer</button><dialog id="drawer" class="hw-drawer" data-hw="drawer" data-side="end" aria-label="Request filters"><button type="button" data-hw-dialog-close>Close</button>…</dialog>
<div data-hw="toast-region" class="hw-toast-region" aria-label="Notifications" data-hw-dismiss-label="Dismiss: {title}"><div data-hw-toast class="hw-toast"><p>Changes saved</p><button type="button" data-hw-dismiss><span aria-hidden="true">×</span></button></div></div>
```

Set `data-hw-readonly="true"` on the group to prevent pointer/keyboard selection
while keeping its controls focusable and its enabled values available to forms.
Changing that attribute restores editing. `disabled` fieldsets and disabled
options do not submit values; multiple mode uses `data-hw-name` for repeated
entries. Use `.hw-toggle-group` with `data-variant="segmented|outline"` for styles.
Use `.hw-button-group` with `data-variant="attached"` and optional
`data-orientation="vertical"` for independent joined actions; it needs no controller.


Popover uses normal Tab and closes on outside press/Escape; Menu adds roving
ArrowUp/Down/Home/End and printable typeahead. Drawer reuses native Dialog.
Toast messages are caller-owned and have no automatic expiration; each dismiss
button hides its closest `[data-hw-toast]`. Urgent messages can have role=alert;
the region defaults to polite status.

```html
<ul data-hw="tree-view" role="tree" aria-label="Documents"><li role="treeitem" data-hw-value="business" aria-expanded="true"><button type="button" data-hw-tree-toggle tabindex="-1" aria-label="Toggle business documents">▾</button><span data-hw-tree-label>Business</span><ul role="group"><li role="treeitem" data-hw-value="license"><span data-hw-tree-label>License</span></li></ul></li></ul>
<section data-hw="carousel" aria-label="Featured services" data-hw-slide-label="{position} of {total}" data-hw-empty-label="No services to show"><div><article data-hw-slide>First service</article><article data-hw-slide>Second service</article></div><button type="button" data-hw-previous>Previous slide</button><span data-hw-carousel-status role="status"></span><button type="button" data-hw-next>Next slide</button></section>
<table data-hw="data-table" class="hw-table"><caption>Requests</caption><thead><tr><th data-hw-key="name"><button type="button" data-hw-sort="name">Name</button></th><th data-hw-key="count" data-hw-type="number"><button type="button" data-hw-sort="count">Count</button></th></tr></thead><tbody><tr><td>Alpha</td><td>2</td></tr><tr><td>Beta</td><td>1</td></tr></tbody></table>
<div data-hw="feedback" role="group" aria-label="Was this page helpful?" data-hw-success-message="Thank you for your feedback."><button type="button" data-hw-value="yes" aria-pressed="false">Yes</button><button type="button" data-hw-value="no" aria-pressed="false">No</button><input type="hidden" data-hw-feedback-value name="helpful"><span data-hw-feedback-status role="status"></span></div>
<section data-hw="cookie-consent" aria-label="Cookie preferences"><p>Choose optional cookie preferences.</p><button type="button" data-hw-consent="accepted">Accept optional cookies</button><button type="button" data-hw-consent="rejected">Reject optional cookies</button></section>
```

Tree items use stable `data-hw-value`, optional `aria-disabled="true"`, nested
role=group, and a label part. Arrows follow RTL expansion direction and visible
nodes; Enter/Space selects. Carousel protects inactive slides with hidden/inert
state and announces position with `getSlideLabel(position, total)` (one-based;
`data-hw-slide-label`), which also names each slide and indicator; `emptyLabel`
is the status without slides. `carouselDescription` and `slideDescription` are
optional `aria-roledescription` texts with no default. Optional `[data-hw-carousel-track]` and
`[data-hw-carousel-dot="0"]` markers enable the shared sliding track and authored
position buttons; see [carousel source/API notes](../../docs/nic-carousel.md);
there is no autoplay. DataTable sorts existing tbody rows immutably and restores
their original order on cleanup. `data-hw-locale` controls collation; optional
cell `data-hw-sort-value` overrides displayed text. CookieConsent emits choice and
hides itself; it does not enable scripts or persist consent without application
code. Optional direct-controller storageKey explicitly enables local persistence.

DataTable header buttons can include `<span class="hw-table-sort-icon" aria-hidden="true"></span>`
for a visible unsorted/ascending/descending indicator. CSS follows the native
header's `aria-sort` state. Use a named, focusable `.hw-table-wrap` for horizontal
scrolling, a caption, `scope="col"` headings and `scope="row"` row headers.
`data-variant="striped|bordered"` and `data-size="sm|lg"` belong on `.hw-table`.

## Pagination windows and hidden pages

Legacy authored `[data-hw-page="previous|next|number"]` controls remain supported.
Real anchors retain their URL and modifier-key behavior; buttons update the
controller and emit `hw:change` with `{page}`. `totalPages` (or `data-hw-total`)
must be a positive safe integer. Invalid, out-of-range and unchanged selections
do not emit. `destroy()` restores authored attributes and child-node identities.

Add a `[data-hw-pagination-items]` container to opt into generated page windows:

```html
<nav class="hw-pagination" data-hw="pagination" data-hw-total="20"
     data-hw-current="10" aria-label="ترقيم الصفحات" data-hw-page-label="الصفحة {page}"
     data-hw-gap-label="الصفحات {start} إلى {end}" data-hw-jump-label="الانتقال إلى صفحة"
     data-hw-go-label="انتقال">
  <button class="hw-button hw-pagination-arrow" data-variant="ghost" type="button"
          data-hw-page="previous" data-hw-previous aria-label="الصفحة السابقة"></button>
  <span class="hw-pagination-items" data-hw-pagination-items></span>
  <button class="hw-button hw-pagination-arrow" data-variant="ghost" type="button"
          data-hw-page="next" data-hw-next aria-label="الصفحة التالية"></button>
</nav>
```

`createPagination(root, options)` adds `siblingCount`, `disabled`,
`hideOnSinglePage`, `label`, `getPageLabel(page)`, `formatPage(page)`,
`getGapLabel(start, end)`, `jumpLabel` and `goLabel` alongside `page`,
`totalPages` and `onPageChange`. With an items container `getPageLabel`,
`getGapLabel`, `jumpLabel` and `goLabel` are required (options or the
`data-hw-page-label`, `data-hw-gap-label`, `data-hw-jump-label` and
`data-hw-go-label` attributes shown above). `data-hw-siblings` supplies the default radius;
`data-hw-hide-single="true"` opts into hiding a single-page navigation. The
existing single-page-visible default is retained. `data-hw-current` is an
initial value, not an external controlled-state binding.

Hidden-page ranges use native `details` disclosures with labeled summary
triggers and ordinary page buttons. Escape closes and returns focus; outside
click closes; selecting a page closes the list and focuses the new current
page button. Gaps exceeding 100 pages use a labeled, bounded integer jump input
instead of allocating every destination. Enter and the Go button validate
against that gap's inclusive range. The jump input is disassociated from ancestor
forms, so an invalid jump draft does not block application submission. No nested
form or extra form value is added.
Every label is application text; numbers default to Latin digits.
`aria-disabled="true"`, an explicit disabled option or a disabled ancestor
fieldset blocks actions. Root disabled-attribute changes refresh the controls.
Applications own data fetching and scrolling; enhancement does not navigate
button-based demos or scroll the document.

## Native/static recipes

InputGroup groups `.hw-input-addon` with native `.hw-input`. Password/Search/Number
use password/search/number inputs (NumberField delegates step/min/max/empty).
Slider is a labelled range input; Rating is a labelled native radio group.

Rating selection uses authored integer radio values. A non-interactive fractional
score uses `.hw-rating-display[role="img"]` with an accessible label including the
score, an `aria-hidden="true"` `.hw-rating-stars` group and `.hw-rating-star` cells.
Each cell contains `★` and a `.hw-rating-fill` span with `--hw-rating-fill: 50%`
(or another percentage); CSS supplies the clipped overlay glyph. An optional
`.hw-rating-score[aria-hidden="true"]` shows the numeric value. No controller or
form input is needed. See [rating evidence and API](../../docs/nic-rating.md).
Collapsible uses details/summary. Link, IconButton, ButtonGroup, Chip,
DescriptionList, Stat, Timeline, Meter, AvatarGroup, ServiceCard, ServiceDetails,
PortalHeader/Footer and NotificationList use semantic HTML and matching CSS.
Layout primitives use the documented core `layoutStyles` API and CSS variables.
None of these static/native recipes needs enhancement or fabricated backend work.


IconButton is a native `<button class="hw-button hw-icon-button">` with an
accessible name; no enhancer is needed. Set `data-variant` explicitly,
`data-size="sm|md|lg"`, and optional `data-shape="circle"`. Loading uses native
`disabled` plus `aria-busy="true"`; application-owned toggles update `aria-pressed`.
Standard form attributes and ARIA relationships belong on the button itself.
The existing `data-icon-only` marker remains supported. Decorative background
circles use `.hw-icon-background` around `.hw-icon`; they are not buttons.

## Responsive tabs

`createTabs(root, { value, activationMode, overflow, overflowLabel,
onValueChange })` preserves authored tab buttons and panels. Horizontal tabs
use `overflow: 'menu'` by default; `data-hw-overflow="scroll"` or the explicit
`overflow: 'scroll'` option retains the scrolling row. Vertical tab lists never
collapse. `overflowLabel` names the ellipsis disclosure and overrides
`data-hw-overflow-label`; it is required while overflow is `menu`, and there is
no default.

The controller wraps the tab list in `.hw-tab-bar` and adds a native disclosure
containing ordinary selection buttons. Excess tabs are measured in their
container, removed from the accessible tab row, and represented by those buttons.
The active panel remains labeled by its original tab. If every tab overflows,
the empty accessible tab list is hidden and the disclosure exposes all choices.
Selecting a hidden tab closes the disclosure and returns focus to its summary;
Escape and outside clicks also close it. Resizing preserves focus when tabs move:
a focused disclosure destination that becomes visible receives focus on its
original tab; a newly hidden focused tab transfers focus to the summary.
Visible tabs retain automatic/manual activation and direction-aware arrow keys.
Disabled tabs remain unavailable, including inherited fieldset disabled state
and its first-legend exception. All-disabled groups have no active panel.

Labels are copied as text or from `aria-label`, without duplicating HTML IDs or
projected controls. Provide a text alternative on icon-only authored tabs.
`destroy()` restores the original structure, nodes and attributes and removes
observers/listeners. The authored tab/panel set is captured at initialization;
destroy and initialize again after adding or removing authored tabs. Runtime
orientation, overflow mode, labels and disabled changes are observed.

## Content navigation

Use a labeled semantic navigation region and ordinary nested lists/anchors:

```html
<nav class="hw-content-nav" data-hw="content-navigation" aria-label="On this page"
     data-hw-scroll-root="article-scroll" data-hw-offset="0">
  <ol class="hw-content-nav-list">
    <li><a class="hw-content-nav-link" href="#overview" data-hw-section="overview"><span class="hw-content-nav-marker" aria-hidden="true"></span><span class="hw-content-nav-label">Overview</span></a>
      <ol class="hw-content-nav-sublist">
        <li><a class="hw-content-nav-link" href="#requirements" data-hw-section="requirements"><span class="hw-content-nav-marker" aria-hidden="true"></span><span class="hw-content-nav-label">Requirements</span></a></li>
      </ol>
    </li>
  </ol>
</nav>
<div id="article-scroll">
  <section id="overview"><h2>Overview</h2></section>
  <section id="requirements"><h2>Requirements</h2></section>
</div>
```

`createContentNavigation(root, {label?, scrollRoot?, offset?, updateHash?, onCurrentChange?})` returns
`{current, refresh(), navigate(id, {focus?}), destroy()}`. `current` is a read-only
ID. Changes emit `hw:change` with `{current: id}` and call `onCurrentChange`; an
empty ID means no eligible section. `enhance()` also initializes these roots.
The optional scroll-root attribute is an element ID, not a CSS selector. Omit it
for window scrolling; an explicit `scrollRoot` option, including `null`, overrides
it. The default offset is 80px; an explicit option overrides `data-hw-offset`.
A configured root that has not mounted does not fall back to scrolling the page.
The navigation is named by its own `aria-label`/`aria-labelledby`, else `label`
(`data-hw-label`). Its links keep `href="#id"` in markup and are bound with core
`bindFragmentLink`: on interaction the href resolves to the current document
under any `<base href>`. The URL fragment is not written unless `updateHash`
(`data-hw-update-hash="true"`) is set, which writes it with `history.replaceState`.

The controller preserves authored list/anchor structure, derives destinations
from `data-hw-section` or decoded fragment-only hrefs, and marks the current link
with `aria-current="location"`. Native adapters own their corresponding trees;
do not enhance framework-owned navigation. Normal primary activation stays on
the current URL and scrolls the configured viewport. Keyboard/assistive
activation also focuses the section. Missing targets are a no-op; modifier,
new-window and download links retain browser behavior. Disabled links use
`aria-disabled="true"` and cannot activate. External links without a section ID
remain ordinary navigation links. Nested content-navigation roots are isolated.

Scroll-following selection handles nested sections, tall content and gaps. It
never moves focus or scrolls the host page; only an already overflowing navigation
region may scroll itself to keep the active link visible. Programmatic navigation
respects reduced motion. Runtime links, destination IDs, disabled states, offsets
and scroll-root attributes are observed; call `refresh()` after application state
changes when necessary. Destroy restores authored attributes and temporary focus
attributes and removes all observers and listeners. See the core API for section
eligibility and selection thresholds.

## SearchField local autocomplete

The optional `suggestions: readonly string[]` option enables local autocomplete.
`maxSuggestions` defaults to 8 (bounded to 0–100), `getResultsMessage(count)` (or
`data-hw-results-message="{count} suggestions"`) is the required polite count
announcement, and `onSearch(query)` reports a trimmed nonempty
query on plain Enter. Existing fields without suggestions retain their original
search-input semantics. A readonly field can report a search for its existing
value but cannot clear, select suggestions or edit through user input.

For automatic enhancement, provide a JSON string array in `data-hw-suggestions`
on the search-field root and optionally `data-hw-max-suggestions`. Escape JSON as
an HTML attribute in templates; malformed/non-array JSON safely yields no options.
Explicit options override attributes, and `setSuggestions(items)` supplies a new
explicit dictionary. Attribute changes are observed; no remote dictionary is
fetched or executed.

The generated popup sits inside `.hw-search-control`, with `.hw-search-suggestions`
listbox and `.hw-search-option` rows. Only opt-in fields receive combobox roles,
expanded/active-descendant state and disabled native browser autocomplete. Match
segments are created with text nodes and `strong`, including strings that resemble
HTML. The listbox is named by the field label. A separate polite status reports available results. Empty queries and zero
matches never display an empty popup.

Arrow keys wrap through options while focus stays on the input. Enter on an
active option selects it, emits the ordinary input/change value notifications,
and prevents form submission. Plain Enter leaves native form submission intact;
coordinate `onSearch` with your form handler instead of submitting twice. The
first Escape closes an open list and is consumed so a containing dialog stays
open. A second Escape requests closing an open native modal dialog, honoring
cancellation and `closedby="none"`, without clearing the selected search text
when that close request is handled. Modified keys and IME
composition retain normal input behavior. Pointer/touch activation preserves
input focus and commits on click, rather than during a scrolling gesture.

Blur, outside interaction, clear, silent `setValue`, and completed form reset
close the list. Disabled/readonly states close it too; inherited fieldset disabled
state remains native. Destroy removes generated nodes/listeners, restores authored
ARIA/autocomplete/button attributes, and retains the current input value. Search
submission, results rendering, modal composition and navigation belong to the
application.


### Notification banners

Set `data-variant="banner"` on `.hw-toast-region`. Use `data-position="inline"`
for an embedded example or `top-start`, `top-end`, `bottom-start`, `bottom-end`
for a corner. The controller also accepts `variant`, `position`, `label`,
`getDismissLabel(toastElement)` and `onDismiss(id)`. Authored accessible names
are preserved. Otherwise the region is named by `label` (`data-hw-label`) and an
icon-only dismiss button by `getDismissLabel(toastElement)` or
`data-hw-dismiss-label="… {title}"`, where `{title}` is the notice's text. Both
are required; nothing is written when they are missing.

Keep stable direct child containers marked `data-hw-live="polite"` and
`data-hw-live="assertive"` for mixed urgency. The controller gives them status
and alert semantics and keeps their parent outside the live announcement.
Single-region markup retains its authored role/live attributes or receives
polite status semantics. Tone and urgency are independent.

Each banner contains `.hw-toast-icon[aria-hidden="true"]`, `.hw-toast-content`
and an optional `button.hw-toast-dismiss[data-hw-dismiss]`. Identify the notice
with `data-hw-toast="id"` or `id="id" data-hw-toast`. A notice marked
`data-hw-dismissible="false"` stays visible and its authored close action is
hidden. Dismissal hides the owned notice, emits `hw:change` with `{dismissed}`
and reports `onDismiss`. If the dismissed notice held focus, the next available
close button receives focus, followed by the nearest preceding button or the
region. The controller restores authored attributes on teardown. The host owns
message creation, expiry policy and removal.
