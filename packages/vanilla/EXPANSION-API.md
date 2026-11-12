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
<fieldset class="hw-field hw-range-slider" data-hw="range-slider" data-hw-range-label="{lower} – {upper}"><legend class="hw-label">Price</legend><label class="hw-label">Minimum <input class="hw-slider" type="range" data-hw-lower name="price" min="0" max="100" value="20"></label><label class="hw-label">Maximum <input class="hw-slider" type="range" data-hw-upper name="price" min="0" max="100" value="80"></label><output class="hw-range-slider-value" data-hw-range-output></output></fieldset>
<div data-hw="pin-input"><label>One-time code <input data-hw-pin-input name="code" maxlength="6"></label></div>
<div class="hw-field">
  <label class="hw-label" for="tags">Tags</label>
  <div class="hw-tag-input" data-hw="tag-input" data-hw-name="tags" data-hw-value='["Design"]' data-hw-remove-label="Remove {tag}"><ul data-hw-tags></ul><input class="hw-input" id="tags" data-hw-tag-input aria-describedby="tags-hint"></div>
  <p class="hw-hint" id="tags-hint">Press Enter or comma to add a tag.</p>
</div>
<fieldset class="hw-field hw-multi-select" data-hw="multi-select" data-hw-results-message="{count} options" data-hw-selected-message="{count} selected">
  <legend class="hw-label">Services</legend>
  <label class="hw-label" for="services-search">Search options</label>
  <input class="hw-input" id="services-search" type="search" data-hw-multiselect-search>
  <div class="hw-multi-select-options">
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="services" value="a">Service A</label>
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="services" value="b">Service B</label>
  </div>
  <span class="hw-sr-only" data-hw-status role="status"></span>
  <p class="hw-multi-select-selected" data-hw-selected-status role="status"></p>
</fieldset>
```

Tag input generates removable chips and repeated hidden form inputs. Each chip is
an `li.hw-chip` when `[data-hw-tags]` is a `ul` or `ol` (the documented markup),
else a `span.hw-chip` with `role="listitem"`. Enter or comma commits trimmed unique
tags; there is no Add button. Backspace on an empty query removes the final tag
and keeps focus in the input. Activating a remove button moves focus to the
remove button of the next chip, else of the previous chip, else to the text
input. Each chip's remove button is named by `getRemoveLabel(tag)` (or
`data-hw-remove-label="… {tag}"`), and a required tag input takes
`requiredMessage` and explains the requirement in its hint.
`data-hw-readonly="true"` prevents edits; read-only and disabled remove buttons
stay rendered and are disabled. Keep hint and error outside `.hw-tag-input`.

Pin input normalizes Arabic-Indic and Eastern Arabic digits into ASCII and drops
every other character before the length applies, so a pasted `123 456`,
`12-34-56` or `٤٥٦-١٢٣` keeps all six digits; a typed character beyond a full
code is ignored. The length is `length`, else an authored `maxlength`, else 6;
the controller removes `maxlength` while it is active (restored by `destroy()`)
and keeps `pattern`, `inputmode` and `required`. An incomplete code is
`aria-invalid="true"` after focus leaves it, until it is empty or complete.

MultiSelect uses actual checkboxes; filtered selections remain checked and
submitted. Native fieldset disabled works normally. The search input is named by
its visible label. `getResultsMessage(count)` (or `data-hw-results-message`) is
required: the controller creates the polite `span.hw-sr-only[data-hw-status]` at
the end of the root when none is authored and writes the count only after the
reader filters (empty at first and after a reset). The optional
`getSelectedMessage(count)` (or `data-hw-selected-message`) fills an authored
`[data-hw-selected-status]` with the number of selected options. Read-only
checkboxes keep focus and their submitted values and get `aria-disabled="true"`.

PasswordField names its toggle from `showLabel` (the toggle's own `aria-label` or
text, else `data-hw-show-label`) and `hideLabel` (`data-hw-hide-label`).
`createPasswordField` returns `visible`, `toggle()` and `destroy()` and takes
`onVisibleChange(visible)`; `hw:change` carries `{ visible }`. A form reset hides
the value and notifies `false` when it was visible.

For required MultiSelect selection, set `data-hw-required="true"` on its root or
pass `{ required: true, requiredMessage: 'Choose at least one service.' }` to
`createMultiSelect`. Explicit `required` overrides the attribute. Validation
counts checked enabled options, uses the focusable search input, and updates
after changes/reset/disabled attributes. Do not put native `required` on the
search text or each checkbox. Readonly selection keeps search usable and selected
values submitted. See [validation contracts](../../docs/multiselect-validation.md).

RangeSlider fills an optional `[data-hw-range-output]` with `getRangeLabel(lower,
upper)`, else with the template `data-hw-range-label="{lower} – {upper}"` on the
root, whose `{lower}` and `{upper}` are written by `formatValue(value)`, else by
core `formatNumber` with the optional `locale` (or `data-hw-locale`), else as
plain numbers. The text is required when the output is present: without it the
output stays empty and one development warning names `getRangeLabel`. The
controller adds no separator of its own. `formatValue(value)` also gives each
thumb its `aria-valuetext`; without it the inputs have none. Both thumbs may
share one `name` (submitted in lower, upper order). `required` is not written on
range inputs; a required range shows the marker in its legend. RangeSlider's `data-hw-readonly="true"` prevents pointer and value-changing
keyboard input while preserving Tab/Shift+Tab navigation and other native keys.
Its two labelled thumbs remain focusable; read-only values still submit normally.

```html
<div class="hw-calendar" data-hw="calendar" data-hw-value="2026-10-28"
  data-hw-month="2026-10-01" data-hw-min="2026-01-01" data-hw-max="2027-12-31"
  data-hw-calendar="gregory" data-hw-locale="en-GB" data-hw-name="date"
  aria-label="Choose an appointment date" data-hw-previous-label="Previous month"
  data-hw-next-label="Next month" data-hw-range-label="Supported Hijri range"
  data-hw-unsupported-message="This date is outside the supported Hijri range."></div>
<div class="hw-date-picker" data-hw="date-picker" data-hw-calendar="islamic-umalqura" data-hw-locale="ar-SA"
  data-hw-calendar-label="اختر موعدًا" data-hw-previous-label="الشهر السابق" data-hw-next-label="الشهر التالي"
  data-hw-calendar-system-label="نظام التقويم" data-hw-gregorian-label="ميلادي" data-hw-hijri-label="هجري"
  data-hw-range-label="النطاق الهجري المدعوم" data-hw-invalid-message="أدخل تاريخًا صحيحًا."
  data-hw-unsupported-message="هذا التاريخ خارج النطاق الهجري المدعوم.">
  <label class="hw-label" for="appointment">Appointment</label>
  <div class="hw-date-picker-control"><input class="hw-input" id="appointment" type="text" placeholder="YYYY-MM-DD" data-hw-date-input name="appointment" required aria-describedby="appointment-hint">
  <button type="button" data-hw-date-trigger aria-label="Choose date">Calendar</button></div>
  <p class="hw-hint" id="appointment-hint">YYYY-MM-DD</p>
  <p class="hw-error" data-hw-error></p>
  <dialog class="hw-dialog" data-hw-date-dialog aria-label="Choose appointment date">
    <header class="hw-dialog-header"><h2>Choose appointment date</h2><button class="hw-button" data-variant="ghost" type="button" data-hw-date-close>Close</button></header>
    <div class="hw-dialog-body"><div class="hw-calendar" data-hw-date-calendar></div></div>
  </dialog>
</div>
<div class="hw-field hw-file-dropzone" data-hw="file-dropzone" data-hw-max-size="5242880"
  data-hw-selected-message="{count} files selected"
  data-hw-rejected-message="{count} files do not match the allowed type and size"
  data-hw-unsupported-drop-message="Use the file chooser to attach documents.">
  <label class="hw-label" for="documents">Documents</label>
  <p class="hw-file-dropzone-instruction" id="documents-instruction">Choose or drop documents</p>
  <input class="hw-input" type="file" id="documents" data-hw-file-input name="documents" accept=".pdf,.png" multiple aria-describedby="documents-instruction documents-hint">
  <p data-hw-file-status role="status"></p>
  <p class="hw-hint" id="documents-hint">PDF or PNG, up to 5 MiB each</p>
</div>
```

Calendar generates its toolbar, labelled grid, localized weekdays/day buttons and
optional named hidden input. Values and bounds are always Gregorian ISO dates;
the display calendar is independent. `data-hw-week-starts-on="0"`,
`data-hw-readonly="true"`, `data-hw-disabled="true"` are supported. Keyboard:
RTL-aware horizontal arrows, vertical weeks, Home/End within the week,
PageUp/PageDown by display month, Shift+PageUp/PageDown by display year. Disabled
dates cannot be selected. DatePicker composes a native input and native modal;
the nested `[data-hw-date-calendar]` must NOT separately have `data-hw="calendar"`.
Dropzone preserves the native file input, which is named by its label and
described by the instruction. Optional `maxSize` (or `data-hw-max-size`) is bytes;
accept/multiple/disabled come from the input. Each chosen or dropped batch is
checked with core `evaluateFileSelection`: a batch with any file of another type,
above the size limit, or with more than one file on an input without `multiple`
is rejected as a whole. The input is then emptied, `onReject(files)` is called
once and `hw:change` carries `{ value, rejected: true, rejectedFiles }`;
`onValueChange` fires only when the held files changed. An accepted drop assigns
the drop's own file list to the input. Server-side validation stays the
application's task. `[data-hw-file-status]` carries only `getSelectedMessage(files)`
and `unsupportedDropMessage`. A rejection is written with
`getRejectedMessage(rejected)` (required when `accept` or a maximum size is set)
into an empty authored `[data-hw-error]`, else into a created `p.hw-error` after
the hint, with `role="alert"`; its id joins the input's `aria-describedby`, the
input gets `aria-invalid="true"` and the root `data-state="error"` until the next
accepted batch or a reset. An authored `[data-hw-error]` that already holds text
is the application's error: it is shown as written, without a role. Rejection
sets no custom validity. A file drag over an available zone sets
`data-state="dragging"`; drags without files are left to the browser. Over a
disabled or read-only zone a file drag is cancelled with `dropEffect="none"` and
a drop changes nothing. `data-hw-readonly="true"` keeps the input focusable,
writes `aria-disabled="true"` on it and blocks the chooser; the chosen files
still submit. The dropzone renders no file list; compose FileUploadList inside
it. The template attributes receive `{count}`.

DatePicker includes a labelled Gregorian/Hijri selector, rendered directly before
the calendar root in the dialog body; a standalone Calendar has none (call
`controller.setCalendar(system)` from your own control). Switching display
systems preserves the ISO selection and keeps an open picker open.
Numeric Hijri fields come from the pinned published HijriDate reference, with
supported Gregorian range 1924-08-01 through 2077-11-16. The UI shows this range
after `rangeLabel`; unsupported selections are preserved. A Calendar has one
`p.hw-sr-only[role=status]` after its grid, empty from the first render, that holds
`unsupportedMessage` (required while the calendar is `islamic-umalqura`) while the
value cannot be shown. DatePicker writes the message for a malformed,
out-of-range, unsupported or unavailable typed date into the optional authored
`[data-hw-error]` slot (role `alert` while it applies; its authored text and role
are restored after), else into a created `p.hw-error[role=alert]` after the
root's `.hw-hint`; the same text is the input's custom validity and the field gets
`aria-invalid="true"`. An authored `.hw-error` with text is the application's
error and wins. A failed submission keeps `aria-invalid="true"` until the date is
valid or the form resets.
There is no civil arithmetic fallback or claim of current official-service parity.

Direct Calendar options include `value`, `month`, `min`, `max`, `locale`, `calendar`,
`weekStartsOn`, `disabled`, `readOnly`, `name`, `isDateDisabled`, `onValueChange`,
`onSelect`, and `onCalendarChange`, plus the texts `label`, `previousLabel`,
`nextLabel`, `rangeLabel`, `unsupportedMessage` and the optional `getDayLabel(value)`. `locale` (or
`data-hw-locale`) is required; month and weekday names come from Intl for it.
Without it the controller does not throw: it warns in development and renders
no switch, toolbar or grid (DatePicker keeps its input, validation and trigger
and shows no formatted date).
DatePicker takes the same texts except `label`, and adds `calendarSystemLabel`,
`gregorianLabel`, `hijriLabel` (its switch), `calendarLabel`,
`openLabel` (unless the trigger has its own text or `aria-label`),
`invalidMessage` and, with `isDateDisabled`, `unavailableMessage`. Its controller has `value`, `calendar`,
`select`, silent `setValue`, `setMonth`, `setCalendar`, and `destroy`. DatePicker
adds `show`/`close` and uses its native input for bounds, names and form validation.
It generates `[data-hw-date-display].hw-date-picker-value`, a polite atomic live
output associated through `aria-describedby` (after the application's ids, before
the hint and error), announcing the full date with the weekday in the chosen
calendar while the native input retains Gregorian ISO editing. Blank values and
values the calendar cannot show hide it; it never carries a message. Opening the
dialog moves focus to the selected day, or today. A native reset restores the
input's `defaultValue`, closes the dialog, clears the message and notifies once
when the value changed.
`onSelect` fires even when confirming the current date; value callbacks fire only
when the value changes. The composed picker emits one public value event.

```html
<fieldset class="hw-toggle-group" data-hw="toggle-group" aria-describedby="view-hint"><legend class="hw-label">View<span class="hw-required-marker" aria-hidden="true"> *</span></legend><label><input type="radio" name="view" value="list" required>List</label><label><input type="radio" name="view" value="grid" required>Grid</label><p class="hw-hint" id="view-hint">Choose how results are shown.</p></fieldset>
<div class="hw-toggle-group" data-hw="toggle-group" data-hw-multiple="true" role="group" aria-label="Text style"><button type="button" class="hw-button" data-variant="secondary" data-size="md" data-hw-value="bold" aria-pressed="false">Bold</button><button type="button" class="hw-button" data-variant="secondary" data-size="md" data-hw-value="italic" aria-pressed="false">Italic</button></div>
<div class="hw-popover" data-hw="popover"><button class="hw-button" type="button" data-hw-trigger>Open information</button><div class="hw-popover-panel" data-hw-panel role="region" aria-label="Information" hidden><p>Useful information</p><button type="button" data-hw-close>Close</button></div></div>
<div class="hw-menu" data-hw="menu"><button class="hw-button" type="button" data-hw-trigger>Actions</button><div class="hw-menu-content" data-hw-panel role="menu" aria-label="Actions" hidden><button class="hw-menu-item" type="button" role="menuitem" data-hw-value="edit">Edit</button><button class="hw-menu-item" type="button" role="menuitem" data-hw-value="archive" disabled>Archive</button><a class="hw-menu-item" role="menuitem" data-hw-value="help" href="#help">Help</a></div></div>
<button type="button" data-hw-dialog-open="drawer">Open drawer</button><dialog id="drawer" class="hw-drawer" data-hw="drawer" data-side="end" aria-label="Request filters"><button type="button" data-hw-dialog-close>Close</button>…</dialog>
<div data-hw="toast-region" class="hw-toast-region" aria-label="Notifications" data-hw-dismiss-label="Dismiss: {title}"><div data-hw-toast class="hw-toast"><p>Changes saved</p><button type="button" data-hw-dismiss><span aria-hidden="true">×</span></button></div></div>
```

A single group's empty value is `''`, a multiple group's `[]`. In single mode
`required` on the radios applies; a failed submission sets `aria-invalid="true"`
on the root until an option is chosen or the form resets. `required` is not
enforced in multiple mode; use MultiSelect or the application's own error.
Hint and error are `p` elements after the options, referenced by the root's
`aria-describedby`.
Set `data-hw-readonly="true"` on the group to prevent pointer/keyboard selection
while keeping its controls focusable and its enabled values available to forms.
Changing that attribute restores editing. `disabled` fieldsets and disabled
options do not submit values; multiple mode uses `data-hw-name` for repeated
entries. Use `.hw-toggle-group` with `data-variant="segmented|outline"` for styles.
`labelHidden` in the framework adapters is authored markup here: write
`<legend class="hw-label hw-sr-only">` to hide the legend visually. The legend
stays the first child and the accessible name of the group, and the controller
leaves it as written. Hide it only where the option texts make the purpose
visible, as in a toolbar.
Use `.hw-button-group` with `data-variant="attached"` and optional
`data-orientation="vertical"` for independent joined actions; it needs no controller.


Popover uses normal Tab and closes on outside press, on Escape with focus inside
it (focus returns to the trigger) and when focus leaves it (focus is not moved).
Menu adds roving ArrowUp/Down/Home/End over enabled items and type-ahead (core
`createTypeahead`): one printable character without Ctrl, Meta or Alt moves to
the next enabled item whose label starts with the typed text, which is forgotten
500 ms after the last key or when the menu closes; a repeated letter cycles, and a
key without a match keeps its default action. `createMenu(root, { onAction,
onOpenChange })`: `onAction(value)` reports an activated item's `data-hw-value`
once (a link item then navigates natively; a disabled item reports nothing) and
`hw:change` carries `{ value }`; `onOpenChange(open)` and `hw:change` `{ open }`
report the state. Drawer reuses native Dialog.
Toast messages are caller-owned and have no automatic expiration; each dismiss
button hides its closest `[data-hw-toast]`. Urgent messages can have role=alert;
the region defaults to polite status.

```html
<ul class="hw-tree-view" data-hw="tree-view" role="tree" aria-label="Documents" data-hw-expand-label="Expand {label}" data-hw-collapse-label="Collapse {label}"><li class="hw-tree-item" role="treeitem" data-hw-value="business" aria-expanded="true"><button class="hw-tree-toggle" type="button" data-hw-tree-toggle tabindex="-1"><span class="hw-icon" data-icon="add-01" data-size="sm" aria-hidden="true"></span></button><span data-hw-tree-label>Business</span><ul role="group"><li role="treeitem" data-hw-value="license"><span data-hw-tree-label>License</span></li></ul></li></ul>
<section data-hw="carousel" aria-label="Featured services" data-hw-slide-label="{position} of {total}" data-hw-empty-label="No services to show"><div><article data-hw-slide>First service</article><article data-hw-slide>Second service</article></div><button type="button" data-hw-previous>Previous slide</button><span data-hw-carousel-status role="status"></span><button type="button" data-hw-next>Next slide</button></section>
<table data-hw="data-table" class="hw-table" data-hw-locale="en"><caption>Requests</caption><thead><tr><th data-hw-key="name"><button type="button" data-hw-sort="name">Name</button></th><th data-hw-key="count" data-hw-type="number"><button type="button" data-hw-sort="count">Count</button></th></tr></thead><tbody><tr><td>Alpha</td><td>2</td></tr><tr><td>Beta</td><td>1</td></tr></tbody></table>
<div class="hw-feedback" data-hw="feedback" role="group" aria-labelledby="feedback-label" data-choice-variant="icon-text" data-hw-success-message="Thank you for your feedback."><p id="feedback-label">Was this page helpful?</p><div class="hw-feedback-actions"><button type="button" class="hw-button" data-variant="secondary" data-hw-value="yes" aria-pressed="false"><span class="hw-icon hw-feedback-icon" data-icon="thumbs-up" aria-hidden="true"></span><span class="hw-feedback-label">Yes</span></button><button type="button" class="hw-button" data-variant="secondary" data-hw-value="no" aria-pressed="false"><span class="hw-icon hw-feedback-icon" data-icon="thumbs-down" aria-hidden="true"></span><span class="hw-feedback-label">No</span></button></div><div class="hw-feedback-comment" data-hw-feedback-comment hidden><div class="hw-field"><label class="hw-label" for="feedback-comment">Comment</label><textarea class="hw-textarea" id="feedback-comment"></textarea></div><button type="button" class="hw-button" data-hw-feedback-submit>Send</button></div><p role="status" data-hw-feedback-status></p><input type="hidden" data-hw-feedback-value name="helpful"></div>
<section class="hw-cookie-consent" data-hw="cookie-consent" aria-labelledby="cookies-title"><h2 id="cookies-title">Cookie preferences</h2><p>Choose optional cookie preferences.</p><div class="hw-button-group"><button type="button" class="hw-button" data-variant="primary" data-hw-consent="accepted">Accept optional cookies</button><button type="button" class="hw-button" data-variant="secondary" data-hw-consent="rejected">Reject optional cookies</button></div></section>
```

Tree items use stable `data-hw-value`, optional `aria-disabled="true"`, nested
role=group, and a label part (`[data-hw-tree-label]`); the controller names an
unnamed item with `aria-labelledby` to its label. The branch toggle
`button.hw-tree-toggle[data-hw-tree-toggle]` is not a tab stop and is named by
`getExpandLabel(node)` while collapsed and `getCollapseLabel(node)` while expanded
(`node` is `{ id, label }`; or the templates `data-hw-expand-label` and
`data-hw-collapse-label` with `{label}` and `{id}`); they are required unless the
toggle has an authored `aria-label`, which stays when neither is given. Its
`.hw-icon` shows `add-01` collapsed and `minus-sign` expanded. Pressing it expands
or collapses without selecting, also in a read-only tree, and focuses the item.
The `expanded` option (`readonly string[]`) sets the initial expansion; the
controller exposes `expanded`, `onExpandedChange(expanded)` reports changes and
`hw:change` carries `{ value, expanded }`. Arrows follow RTL expansion direction and visible
nodes; Enter/Space selects. Type-ahead follows the Menu rules over the visible
nodes. Carousel protects inactive slides with hidden/inert
state and announces position with `getSlideLabel(position, total)` (one-based;
`data-hw-slide-label`), which also names each slide and indicator; `emptyLabel`
is the status without slides. `carouselDescription` and `slideDescription` are
optional `aria-roledescription` texts with no default. On the first or last slide
of a carousel that does not loop, the arrow gets `aria-disabled="true"` instead of
`disabled`: it keeps focus and its name and ignores activation; `disabled` stays
for fewer than two slides, an authored `disabled` or a disabled root. Optional `[data-hw-carousel-track]` and
`[data-hw-carousel-dot="0"]` markers enable the shared sliding track and authored
position buttons; see [carousel source/API notes](../../docs/nic-carousel.md);
there is no autoplay. DataTable sorts existing tbody rows immutably and restores
their original order on cleanup. `locale` (or `data-hw-locale`) controls collation and is required when a
column is sortable; without it the controller warns in development, updates
`aria-sort` and emits as usual, and keeps the source order. A header activation
sorts ascending, or descending when that column is already ascending;
`onSortKeyChange(key)` fires when the column changed, then
`onSortDirectionChange(direction)` when the direction changed, and `hw:change`
carries `{ sortKey, sortDirection }`. Optional
cell `data-hw-sort-value` overrides displayed text.

Feedback is a named group (`role="group"` labelled by its question) with two
choices, `button[data-hw-value="yes|no"]` with `aria-pressed`; other values are
ignored. Its value is `{ helpful, comment }` (`helpful` is true, false or null
before a choice). Choosing notifies `onValueChange(value)` and `hw:change`
`{ value }` once; the pressed choice again changes nothing. The authored
`[data-hw-feedback-comment]` region (written `hidden`, shown after the first
choice) holds a labelled textarea and `button[data-hw-feedback-submit]`; typing
notifies the value with the comment. Submit reports `onFeedback(value)` and
`hw:change` `{ feedback: value }` once and fills `[data-hw-feedback-status]` with
`successMessage` (required); any later change empties the status. Without a
submit button the choice itself reports feedback. No focus is moved. The
optional `input[type=hidden][data-hw-feedback-value]` receives `yes`, `no` or
`''`; a reset of its form restores the authored choice, comment and empty status.
The controller exposes `value`, `select(helpful)`, `setComment(comment)`,
`submit()` and `destroy()`; `options.value` is the initial value. Nothing is sent
anywhere by the package.

CookieConsent is a section labelled by its h2 with Accept (primary), Reject
(secondary) and an optional Preferences button (ghost, handled by the
application) inside `div.hw-button-group`. Accept or Reject reports
`onConsent(choice)` and `hw:change` `{ consent }`, then closes: the root gets
`hidden`, `onOpenChange(false)` and `hw:change` `{ open: false }`. The controller
has `open`, `setOpen(open)`, `choose(choice)` and `destroy()`; `options.open`
(default true) is the initial state. It does not enable scripts or persist
consent without application code; the optional `storageKey` enables local
persistence and a stored choice starts it closed. After it closes, send focus to
the element the page continues with, such as the main heading.

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
On the first or last page the previous / next arrow gets `aria-disabled="true"`
and keeps focus and its name; `disabled` is written only when the pagination is
disabled or the arrow was authored disabled.

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
An activation reports one change: while the scroll it started is in progress the
target stays current, so the marker does not step through the sections a smooth
scroll passes. Wheel, touch or a scrolling key hands the marker back to measurement.

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
