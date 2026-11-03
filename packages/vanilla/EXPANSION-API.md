# Expansion markup contract

All roots below use `data-nq` and the matching `.nq-*` class. `enhance(root)`
discovers them; direct `create{Name}` controllers return idempotent `destroy()`.
Selection/change controllers bubble `nq:change` with their value. Supply visible,
localized labels, hint/error IDs, native input names and disabled/required state.
Static/native recipes at the end require no enhancement.

Search fields can opt into an inset clear action:

```html
<div class="nq-field nq-search-field" data-nq="search-field">
  <label class="nq-label" for="query">Search</label>
  <div class="nq-search-control">
    <input class="nq-input" id="query" name="query" type="search" data-nq-search-input>
    <button class="nq-button nq-search-clear" type="button" hidden data-nq-search-clear aria-label="Clear search"></button>
  </div>
</div>
```

`createSearchField(root, { clearLabel, onValueChange })` returns `value`,
`clear()`, `setValue(value)` and `destroy()`. Clear emits native input/change
and one `nq:change`; setValue synchronizes silently. Read-only and disabled
fields cannot be cleared. Search submission belongs to the application form.
See [search field behavior](../../docs/search-field.md).

```html
<div data-nq="password-field"><label>Password <input type="password" data-nq-password-input name="password"></label><button type="button" data-nq-password-toggle aria-label="Show password">Show</button></div>
<div data-nq="range-slider"><label>Minimum <input type="range" data-nq-lower name="minimum" min="0" max="100" value="20"></label><label>Maximum <input type="range" data-nq-upper name="maximum" min="0" max="100" value="80"></label><output data-nq-range-output></output></div>
<div data-nq="pin-input"><label>One-time code <input data-nq-pin-input name="code" maxlength="6"></label></div>
<div data-nq="tag-input" data-nq-name="tags" data-nq-value='["Design"]'><label>Add a tag <input data-nq-tag-input></label><div data-nq-tags></div></div>
<fieldset data-nq="multi-select"><legend>Services</legend><label>Search options <input type="search" data-nq-multiselect-search></label><div data-nq-option><label><input type="checkbox" name="services" value="a">Service A</label></div><div data-nq-option><label><input type="checkbox" name="services" value="b">Service B</label></div><span data-nq-status role="status"></span></fieldset>
```

Tag input generates removable chips and repeated hidden form inputs. Enter or
comma commits trimmed unique tags; Backspace on an empty query removes the final
tag. `data-nq-readonly="true"` prevents edits. Pin input normalizes Arabic-Indic
and Eastern Arabic digits into ASCII, keeps one focus stop and uses native
maxlength/required. MultiSelect uses actual checkboxes; filtered selections remain
checked and submitted. Native fieldset disabled works normally.

For required MultiSelect selection, set `data-nq-required="true"` on its root or
pass `{ required: true, requiredMessage: 'Choose at least one service.' }` to
`createMultiSelect`. Explicit `required` overrides the attribute. Validation
counts checked enabled options, uses the focusable search input, and updates
after changes/reset/disabled attributes. Do not put native `required` on the
search text or each checkbox. Readonly selection keeps search usable and selected
values submitted. See [validation contracts](../../docs/multiselect-validation.md).

RangeSlider's `data-nq-readonly="true"` prevents pointer and value-changing
keyboard input while preserving Tab/Shift+Tab navigation and other native keys.
Its two labelled thumbs remain focusable; read-only values still submit normally.

```html
<div class="nq-calendar" data-nq="calendar" data-nq-value="2026-10-28"
  data-nq-month="2026-10-01" data-nq-min="2026-01-01" data-nq-max="2027-12-31"
  data-nq-calendar="gregory" data-nq-locale="en-GB" data-nq-name="date"
  aria-label="Choose an appointment date"></div>
<div class="nq-date-picker" data-nq="date-picker" data-nq-calendar="islamic-umalqura" data-nq-locale="ar-SA">
  <label>Appointment <input type="text" placeholder="YYYY-MM-DD" data-nq-date-input name="appointment" required></label>
  <button type="button" data-nq-date-trigger aria-label="Choose date">Calendar</button>
  <dialog class="nq-dialog" data-nq-date-dialog aria-label="Choose appointment date">
    <header class="nq-dialog-header"><h2>Choose appointment date</h2><button class="nq-button" data-variant="ghost" type="button" data-nq-date-close>Close</button></header>
    <div class="nq-dialog-body"><div class="nq-calendar" data-nq-date-calendar></div></div>
  </dialog>
</div>
<label class="nq-file-dropzone" data-nq="file-dropzone">Choose or drop documents
  <input type="file" data-nq-file-input name="documents" multiple accept=".pdf,.png">
  <span data-nq-file-status role="status"></span>
</label>
```

Calendar generates its toolbar, labelled grid, localized weekdays/day buttons and
optional named hidden input. Values and bounds are always Gregorian ISO dates;
the display calendar is independent. `data-nq-week-starts-on="0"`,
`data-nq-readonly="true"`, `data-nq-disabled="true"` are supported. Keyboard:
RTL-aware horizontal arrows, vertical weeks, Home/End within the week,
PageUp/PageDown by display month, Shift+PageUp/PageDown by display year. Disabled
dates cannot be selected. DatePicker composes a native input and native modal;
the nested `[data-nq-date-calendar]` must NOT separately have `data-nq="calendar"`.
Dropzone preserves native file input. Optional `data-nq-max-size` is bytes;
accept/multiple/disabled come from input. Only accepted files become its value.

Calendar and DatePicker include a labelled Gregorian/Hijri selector. Switching
display systems preserves the ISO selection and keeps an open picker open.
Numeric Hijri fields come from the pinned published HijriDate reference, with
supported Gregorian range 1924-08-01 through 2077-11-16. The UI shows this range;
unsupported selections are preserved and DatePicker reports native invalidity.
There is no civil arithmetic fallback or claim of current official-service parity.

Direct Calendar options include `value`, `month`, `min`, `max`, `locale`, `calendar`,
`weekStartsOn`, `disabled`, `readOnly`, `name`, `isDateDisabled`, `onValueChange`,
`onSelect`, and `onCalendarChange`. Its controller has `value`, `calendar`,
`select`, silent `setValue`, `setMonth`, `setCalendar`, and `destroy`. DatePicker
adds `show`/`close` and uses its native input for bounds, names and form validation.
It generates `[data-nq-date-display].nq-date-picker-value`, a polite live output
associated through `aria-describedby`, showing the selected date in the chosen
calendar while the native input retains Gregorian ISO editing. Blank hides it;
unsupported Hijri values show the supported range without clearing the input.
`onSelect` fires even when confirming the current date; value callbacks fire only
when the value changes. The composed picker emits one public value event.

```html
<fieldset data-nq="toggle-group"><legend>View</legend><label><input type="radio" name="view" value="list" checked>List</label><label><input type="radio" name="view" value="grid">Grid</label></fieldset>
<div data-nq="toggle-group" data-nq-multiple="true" role="group" aria-label="Text style"><button type="button" data-nq-value="bold" aria-pressed="false">Bold</button><button type="button" data-nq-value="italic" aria-pressed="false">Italic</button></div>
<div data-nq="popover"><button type="button" data-nq-trigger>Open information</button><div data-nq-panel role="region" aria-label="Information" hidden><p>Useful information</p><button type="button" data-nq-close>Close</button></div></div>
<div data-nq="menu"><button type="button" data-nq-trigger>Actions</button><div data-nq-panel role="menu" aria-label="Actions" hidden><button type="button" role="menuitem" data-nq-value="edit">Edit</button><button type="button" role="menuitem" data-nq-value="archive">Archive</button></div></div>
<button type="button" data-nq-dialog-open="drawer">Open drawer</button><dialog id="drawer" class="nq-drawer" data-nq="drawer" data-side="end" aria-label="Request filters"><button type="button" data-nq-dialog-close>Close</button>…</dialog>
<div data-nq="toast-region" class="nq-toast-region" aria-label="Notifications"><div data-nq-toast class="nq-toast"><p>Changes saved</p><button type="button" data-nq-dismiss aria-label="Dismiss notification">×</button></div></div>
```

Set `data-nq-readonly="true"` on the group to prevent pointer/keyboard selection
while keeping its controls focusable and its enabled values available to forms.
Changing that attribute restores editing. `disabled` fieldsets and disabled
options do not submit values; multiple mode uses `data-nq-name` for repeated
entries. Use `.nq-toggle-group` with `data-variant="segmented|outline"` for styles.
Use `.nq-button-group` with `data-variant="attached"` and optional
`data-orientation="vertical"` for independent joined actions; it needs no controller.


Popover uses normal Tab and closes on outside press/Escape; Menu adds roving
ArrowUp/Down/Home/End and printable typeahead. Drawer reuses native Dialog.
Toast messages are caller-owned and have no automatic expiration; each dismiss
button hides its closest `[data-nq-toast]`. Urgent messages can have role=alert;
the region defaults to polite status.

```html
<ul data-nq="tree-view" role="tree" aria-label="Documents"><li role="treeitem" data-nq-value="business" aria-expanded="true"><button type="button" data-nq-tree-toggle tabindex="-1" aria-label="Toggle business documents">▾</button><span data-nq-tree-label>Business</span><ul role="group"><li role="treeitem" data-nq-value="license"><span data-nq-tree-label>License</span></li></ul></li></ul>
<section data-nq="carousel" aria-label="Featured services"><div><article data-nq-slide>First service</article><article data-nq-slide>Second service</article></div><button type="button" data-nq-previous>Previous slide</button><span data-nq-carousel-status role="status"></span><button type="button" data-nq-next>Next slide</button></section>
<table data-nq="data-table" class="nq-table"><caption>Requests</caption><thead><tr><th data-nq-key="name"><button type="button" data-nq-sort="name">Name</button></th><th data-nq-key="count" data-nq-type="number"><button type="button" data-nq-sort="count">Count</button></th></tr></thead><tbody><tr><td>Alpha</td><td>2</td></tr><tr><td>Beta</td><td>1</td></tr></tbody></table>
<div data-nq="feedback" role="group" aria-label="Was this page helpful?"><button type="button" data-nq-value="yes" aria-pressed="false">Yes</button><button type="button" data-nq-value="no" aria-pressed="false">No</button><input type="hidden" data-nq-feedback-value name="helpful"><span data-nq-feedback-status role="status"></span></div>
<section data-nq="cookie-consent" aria-label="Cookie preferences"><p>Choose optional cookie preferences.</p><button type="button" data-nq-consent="accepted">Accept optional cookies</button><button type="button" data-nq-consent="rejected">Reject optional cookies</button></section>
```

Tree items use stable `data-nq-value`, optional `aria-disabled="true"`, nested
role=group, and a label part. Arrows follow RTL expansion direction and visible
nodes; Enter/Space selects. Carousel protects inactive slides with hidden/inert
state and announces position. Optional `[data-nq-carousel-track]` and
`[data-nq-carousel-dot="0"]` markers enable the shared sliding track and authored
position buttons; see [carousel source/API notes](../../docs/nic-carousel.md);
there is no autoplay. DataTable sorts existing tbody rows immutably and restores
their original order on cleanup. `data-nq-locale` controls collation; optional
cell `data-nq-sort-value` overrides displayed text. CookieConsent emits choice and
hides itself; it does not enable scripts or persist consent without application
code. Optional direct-controller storageKey explicitly enables local persistence.

DataTable header buttons can include `<span class="nq-table-sort-icon" aria-hidden="true"></span>`
for a visible unsorted/ascending/descending indicator. CSS follows the native
header's `aria-sort` state. Use a named, focusable `.nq-table-wrap` for horizontal
scrolling, a caption, `scope="col"` headings and `scope="row"` row headers.
`data-variant="striped|bordered"` and `data-size="sm|lg"` belong on `.nq-table`.

## Pagination windows and hidden pages

Legacy authored `[data-nq-page="previous|next|number"]` controls remain supported.
Real anchors retain their URL and modifier-key behavior; buttons update the
controller and emit `nq:change` with `{page}`. `totalPages` (or `data-nq-total`)
must be a positive safe integer. Invalid, out-of-range and unchanged selections
do not emit. `destroy()` restores authored attributes and child-node identities.

Add a `[data-nq-pagination-items]` container to opt into generated page windows:

```html
<nav class="nq-pagination" data-nq="pagination" data-nq-total="20"
     data-nq-current="10" aria-label="ترقيم الصفحات">
  <button class="nq-button nq-pagination-arrow" data-variant="ghost" type="button"
          data-nq-page="previous" data-nq-previous aria-label="الصفحة السابقة"></button>
  <span class="nq-pagination-items" data-nq-pagination-items></span>
  <button class="nq-button nq-pagination-arrow" data-variant="ghost" type="button"
          data-nq-page="next" data-nq-next aria-label="الصفحة التالية"></button>
</nav>
```

`createPagination(root, options)` adds `siblingCount`, `disabled`,
`hideOnSinglePage`, `getPageLabel(page)`, `formatPage(page)`,
`getGapLabel(start, end)`, `jumpLabel` and `goLabel` alongside `page`,
`totalPages` and `onPageChange`. `data-nq-siblings` supplies the default radius;
`data-nq-hide-single="true"` opts into hiding a single-page navigation. The
existing single-page-visible default is retained. `data-nq-current` is an
initial value, not an external controlled-state binding.

Hidden-page ranges use native `details` disclosures with labeled summary
triggers and ordinary page buttons. Escape closes and returns focus; outside
click closes; selecting a page closes the list and focuses the new current
page button. Gaps exceeding 100 pages use a labeled, bounded integer jump input
instead of allocating every destination. Enter and the Go button validate
against that gap's inclusive range. The jump input is disassociated from ancestor
forms, so an invalid jump draft does not block application submission. No nested
form or extra form value is added.
Arabic/English labels follow the root locale; numbers default to Latin digits.
`aria-disabled="true"`, an explicit disabled option or a disabled ancestor
fieldset blocks actions. Root disabled-attribute changes refresh the controls.
Applications own data fetching and scrolling; enhancement does not navigate
button-based demos or scroll the document.

## Native/static recipes

InputGroup groups `.nq-input-addon` with native `.nq-input`. Password/Search/Number
use password/search/number inputs (NumberField delegates step/min/max/empty).
Slider is a labelled range input; Rating is a labelled native radio group.

Rating selection uses authored integer radio values. A non-interactive fractional
score uses `.nq-rating-display[role="img"]` with an accessible label including the
score, an `aria-hidden="true"` `.nq-rating-stars` group and `.nq-rating-star` cells.
Each cell contains `★` and a `.nq-rating-fill` span with `--nq-rating-fill: 50%`
(or another percentage); CSS supplies the clipped overlay glyph. An optional
`.nq-rating-score[aria-hidden="true"]` shows the numeric value. No controller or
form input is needed. See [rating evidence and API](../../docs/nic-rating.md).
Collapsible uses details/summary. Link, IconButton, ButtonGroup, Chip,
DescriptionList, Stat, Timeline, Meter, AvatarGroup, ServiceCard, ServiceDetails,
PortalHeader/Footer and NotificationList use semantic HTML and matching CSS.
Layout primitives use the documented core `layoutStyles` API and CSS variables.
None of these static/native recipes needs enhancement or fabricated backend work.


IconButton is a native `<button class="nq-button nq-icon-button">` with an
accessible name; no enhancer is needed. Set `data-variant` explicitly,
`data-size="sm|md|lg"`, and optional `data-shape="circle"`. Loading uses native
`disabled` plus `aria-busy="true"`; application-owned toggles update `aria-pressed`.
Standard form attributes and ARIA relationships belong on the button itself.
The existing `data-icon-only` marker remains supported. Decorative background
circles use `.nq-icon-background` around `.nq-icon`; they are not buttons.

## Responsive tabs

`createTabs(root, { value, activationMode, overflow, overflowLabel,
onValueChange })` preserves authored tab buttons and panels. Horizontal tabs
use `overflow: 'menu'` by default; `data-nq-overflow="scroll"` or the explicit
`overflow: 'scroll'` option retains the scrolling row. Vertical tab lists never
collapse. `overflowLabel` names the ellipsis disclosure and overrides
`data-nq-overflow-label`; the default is Arabic or English according to the root's
locale.

The controller wraps the tab list in `.nq-tab-bar` and adds a native disclosure
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
