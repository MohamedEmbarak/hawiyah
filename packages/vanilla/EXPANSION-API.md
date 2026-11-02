# Expansion markup contract

All roots below use `data-nq` and the matching `.nq-*` class. `enhance(root)`
discovers them; direct `create{Name}` controllers return idempotent `destroy()`.
Selection/change controllers bubble `nq:change` with their value. Supply visible,
localized labels, hint/error IDs, native input names and disabled/required state.
Static/native recipes at the end require no enhancement.

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
nodes; Enter/Space selects. Carousel hides inactive slides and announces position;
there is no autoplay. DataTable sorts existing tbody rows immutably and restores
their original order on cleanup. `data-nq-locale` controls collation; optional
cell `data-nq-sort-value` overrides displayed text. CookieConsent emits choice and
hides itself; it does not enable scripts or persist consent without application
code. Optional direct-controller storageKey explicitly enables local persistence.

## Native/static recipes

InputGroup groups `.nq-input-addon` with native `.nq-input`. Password/Search/Number
use password/search/number inputs (NumberField delegates step/min/max/empty).
Slider is a labelled range input; Rating is a labelled native radio group.
Collapsible uses details/summary. Link, IconButton, ButtonGroup, Chip,
DescriptionList, Stat, Timeline, Meter, AvatarGroup, ServiceCard, ServiceDetails,
PortalHeader/Footer and NotificationList use semantic HTML and matching CSS.
Layout primitives use the documented core `layoutStyles` API and CSS variables.
None of these static/native recipes needs enhancement or fabricated backend work.
