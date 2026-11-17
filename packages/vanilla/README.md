# @hawiyah/vanilla

Progressive enhancement for semantic HTML. Import styles separately:

```js
import '@hawiyah/styles/styles.css';
import { enhance } from '@hawiyah/vanilla';

const destroy = enhance(document.querySelector('#application'));
// Before the application subtree is removed:
destroy();
```

See [the behavior contract](../core/API.md) for exact markup and direct typed
controllers. Repeated `enhance` calls are reference counted; the final cleanup
restores attributes and original input values, removes generated nodes and
listeners, and closes dialogs that this controller opened. Call direct controller
`destroy()` yourself. Do not mix direct and automatic enhancement on one element.
DOM structure/options are fixed per controller; destroy before replacing them.
Disabled option attributes may change while a controller is active.

The [expansion markup contract](./EXPANSION-API.md) covers password visibility,
range and PIN inputs, tag editing, checkbox MultiSelect, file dropzone, calendar
and date picker, toggle group, popover, menu, drawer, toast region, tree, carousel,
sortable table, feedback and consent controls. These are real DOM enhancements;
static content and native controls use ordinary semantic HTML recipes.

Native buttons, fields, select, file input, progress, and details/summary accordions
work without this package. Tabs, single-select combobox, tooltip, and pagination
enhance explicit `data-hw` hooks. A native `<dialog>` supplies modality, its top
layer, Escape handling, and focus containment through `showModal()`/`close()`.
Supply accessible names and every other text in markup, root attributes or
controller options (see below). A required combobox must have a committed value
before native form validation succeeds.

## Text is supplied by the application

The package contains no built-in words in any language and never reads `lang`,
the document language or `navigator.language` to choose text. Every text that a
controller places on an element it creates (accessible names, labels of internal
controls, live-region, status and validation messages) comes from the
application. The first source that has text is used:

1. Authored markup: the text or `aria-label` already on the element the
   controller would otherwise name is used as written.
2. The controller option of the same name.
3. An attribute on the controller root: `data-hw-<kebab-name>` for a string input
   (`overflowLabel` → `data-hw-overflow-label`) and, for a function input, a
   template attribute named after the input without `get`, whose `{placeholders}`
   are filled with core `formatTextTemplate` (`getPageLabel` →
   `data-hw-page-label="Page {page}"`).

An authored name of a root or landmark is never replaced. Three options replace
the authored name of an inner control when they are passed explicitly:
`createSearchField` `clearLabel`, `createPasswordField` `showLabel` and
`createPortalHeader` `brandLabel`. The search field's clear button takes its
name from its authored `aria-label` or text before the icon replaces that text.

`enhance()` therefore works from markup alone. When a required text is missing
the controller renders nothing in its place (no text node, the attribute is
omitted) and core `requireText` warns once per component and input in
development (`Hawiyah: <Component> requires "<name>" …`). A validation
constraint without its message still blocks submission. Function inputs return
the whole string; the controller adds no words or punctuation to it.

| Controller | Text inputs (required unless noted) |
| --- | --- |
| `createCalendar` | `label`, `previousLabel`, `nextLabel`, `rangeLabel`; `unsupportedMessage` while the calendar is `islamic-umalqura`; optional `getDayLabel(value)`; `locale` is required |
| `createDatePicker` | `calendarLabel`, `openLabel`, `previousLabel`, `nextLabel`, `calendarSystemLabel`, `gregorianLabel`, `hijriLabel`, `rangeLabel`, `invalidMessage`, `unsupportedMessage`; `unavailableMessage` when `isDateDisabled` is given; `locale` is required |
| `createCarousel` | `label`, `getSlideLabel(position, total)` (one-based), `emptyLabel`; optional `carouselDescription`, `slideDescription` |
| `createCombobox` | `getResultsMessage(count)`; `requiredMessage` when the input is required |
| `createContentNavigation` | `label` |
| `createCopyButton` | `label` (when the button has no `aria-label`, `aria-labelledby` or text), `copiedMessage`, `failedMessage` |
| `createFeedback` | `successMessage` (the question, choices, comment label and submit text are authored markup) |
| `createFileDropzone` | `getRejectedMessage(rejected)` when `accept` or `maxSize` is set (asked for at the moment of a rejection otherwise); when `[data-hw-file-status]` exists: `getSelectedMessage(files)`, `unsupportedDropMessage` |
| `createFileUploadList` | `labels` (core `FileUploadLabels`, including `getProgressLabel(name)` and `getRemoveLabel(name)`) |
| `createMultiSelect` | `getResultsMessage(count)`; `requiredMessage` when required; optional `getSelectedMessage(count)` |
| `createNavigationDrawer` | `navigationLabel` |
| `createPagination` | `label`; with an items container `getPageLabel(page)`, `getGapLabel(start, end)`, `jumpLabel`, `goLabel` |
| `createPasswordField` | `showLabel`, `hideLabel` |
| `createRangeSlider` | `getRangeLabel(lower, upper)` (`data-hw-range-label="{lower} – {upper}"`) when the root contains `[data-hw-range-output]` |
| `createPortalHeader` | `menuLabel`, `navigationLabel`; optional `brandLabel` (see [PORTAL.md](PORTAL.md)) |
| `createSideNavigation` | `label` (when the nav has no `aria-label` or `aria-labelledby`) |
| `createSearchField` | `clearLabel`; `getResultsMessage(count)` when suggestions are given |
| `createSkipLink` | the link's own text (`skipLabel`) |
| `createTreeView` | `getExpandLabel(node)`, `getCollapseLabel(node)` (or `data-hw-expand-label` / `data-hw-collapse-label` with `{label}`), unless the toggle has an authored `aria-label` |
| `createStepper` | `label`, `completeLabel`, `upcomingLabel` (each step's visually hidden state text: a `span.hw-sr-only[data-hw-step-status]` created after the label, or an authored `[data-hw-step-status]` child; none on the current step) |
| `createTabs` | `overflowLabel` when overflow is `menu` |
| `createTagInput` | `getRemoveLabel(tag)`; `requiredMessage` when required |
| `createToastRegion` | `label`; `getDismissLabel(toast)` (the toast element; template attribute `{title}`) for dismissible toasts |

Renamed in this release (no aliases): combobox `invalidSelectionMessage` →
`requiredMessage`; search field `resultsMessage` → `getResultsMessage`;
dropzone `getStatusMessage(files, rejected)` → `getSelectedMessage(files)` and
`getRejectedMessage(rejected)`. The core registries `getCalendarLabels`,
`fileUploadLabels` and `getSiteVerificationLabels` have been removed from core.

## Locale is supplied by the application

No controller chooses a locale, reads `lang` or falls back to the host locale. A controller that formats a number or a date, or sorts text, takes `locale` (a BCP 47 tag, as `options.locale` or `data-hw-locale` on the controller root) whenever that feature is used. Without it core `requireText` warns once in development (`Hawiyah: <Component> requires "locale"`), the controller does not throw, and the feature renders unformatted or unsorted.

| Controller | `locale` is required | Without it |
| --- | --- | --- |
| `createCalendar` | always | no switch, toolbar, weekday row, grid or status; the authored root is left untouched; `value`, `setValue`, `select` and `destroy()` still work |
| `createDatePicker` | always | the input keeps the typed ISO value and its validation, the trigger and dialog work, no formatted date is shown and the dialog calendar is empty |
| `createDataTable` | when a column has a `[data-hw-sort]` button | `aria-sort`, `sortKey`, `sortDirection` and the change event update as usual; the rows stay in source order |

Output is unchanged when the application passes the locale that used to be the default (`ar-SA`).

`createRangeSlider` takes an optional `locale` for the numbers of its range label
(see [Forms](#forms)).

## Forms

Native fields stay authored markup: `div.hw-field > label.hw-label[for] > control >
p.hw-hint > p.hw-error`, with the hint and error ids in the control's
`aria-describedby`. An application error is a `p.hw-error` without a role; the
control then carries `aria-invalid="true"`. A required control with a visible
label shows one marker as the last child of its `label.hw-label` or
`legend.hw-label`: `<span class="hw-required-marker" aria-hidden="true"> *</span>`.
The marker is never the only carrier: text-like controls keep `required`, radio
groups keep it on each radio, and MultiSelect and TagInput explain the
requirement in their hint. No controller adds or removes the marker. A Slider is a
labelled range input; the application writes its own output next to it.

**Native form reset.** A reset of the owning form (also through the `form`
attribute) is a value change made by the form. Each controller returns to the
values authored when it was created, after the browser has reset the native
controls; read-only and disabled controls are reset too, and a reset that a
listener prevented changes nothing. `hw:change` and the `on…Change` option fire
once, and only when the reset changed the value. Secondary state is cleared:
the combobox popup closes (and notifies `open`), the password is hidden (and
notifies `visible: false`), MultiSelect's filter and results status and TagInput's
draft are emptied, the dropzone's status and rejection are removed, and an
`aria-invalid` set by a failed submission is removed.

**Validation state.** Combobox (its input), TagInput (its input), MultiSelect (its
search input and root), PinInput and a single-mode ToggleGroup (its root) set
`aria-invalid="true"` when a submission failed on them (the `invalid` event),
until a valid value is chosen or the form resets. An authored `aria-invalid` is
kept and restored. A required control that was never submitted, or whose message
text is missing, is not marked.

**Combobox.** The documented structure keeps hint and error outside the
positioned `.hw-combobox`, so the list opens under the input:

```html
<div class="hw-field">
  <label class="hw-label" for="city">City</label>
  <div class="hw-combobox" data-hw="combobox" data-hw-results-message="{count} results">
    <input id="city" class="hw-input" data-hw-combobox-input autocomplete="off" aria-describedby="city-hint">
    <input type="hidden" name="city" data-hw-combobox-value>
    <ul class="hw-listbox" data-hw-combobox-list hidden>…</ul>
    <span class="hw-sr-only" data-hw-combobox-status role="status"></span>
  </div>
  <p class="hw-hint" id="city-hint">Start typing a city.</p>
</div>
```

`createCombobox` takes `onOpenChange(open)` and `onQueryChange(query)` besides
`onValueChange(value)`. `hw:change` on the root carries one of three details:
`{ value, label }` when the selection changed, `{ open }` when the popup opened or
closed, and `{ query }` for every accepted input event (typed text only; a
selection, a reset or a script write notifies no query). Read the value with
`'value' in event.detail`. Focus on the input opens the popup, as do a click,
typing and the arrow keys, in the four adapters; the focus the controller gives
the input after a pointer selection does not reopen it. The popup stays closed
while the input is disabled or read-only.

`createMenu` gives the trigger focus before the action, then reports the
activation in this order: `hw:change` with `{ value }` and `onAction(value)`,
then the closing (`{ open: false }`, `onOpenChange`). A dialog that the action
opens therefore returns focus to the trigger when it closes; an action that
moves focus elsewhere keeps it there. An Escape that a control inside a popover
or menu panel, or the application, has cancelled (`preventDefault`) leaves the
panel open.

`createTreeView` sets the indentation of each row (`--hw-tree-depth`, from the
authored `aria-level`), so authored markup shows every level at one indent until
the controller runs. The controller owns the `hidden` attribute of the rows: it
hides the rows of a collapsed branch, and `destroy()` restores the authored
attributes. An item with a toggle or `aria-expanded` and no child item after it
gives one development warning, since its child has usually lost its `aria-level`.

`createTabs` looks for each panel inside its root, so a root may be enhanced
before it is inserted into the document; a panel outside the root is rejected.

**ToggleGroup.** Single mode: `label > input[type=radio] + text` per option
(no class, span or `data-selected`), empty value `''`, `required` on the radios.
Multiple mode: `button.hw-button[type=button][data-variant=secondary][data-size=md][data-hw-value][aria-pressed]`,
empty value `[]`, values submitted as hidden inputs under `data-hw-name`;
`required` is not enforced there. Read-only is `data-hw-readonly="true"`. See
[EXPANSION-API.md](EXPANSION-API.md) for RangeSlider, TagInput, PinInput,
MultiSelect, PasswordField and FileDropzone.

Changed in this release:

| Controller | Before | Now | Migration |
| --- | --- | --- | --- |
| RangeSlider, ToggleGroup, Rating | reset silently | `hw:change` and `onValueChange` fire when the reset changed the value | none |
| Combobox, PinInput, TagInput, MultiSelect, FileDropzone, PasswordField, SearchField | no `hw:change` after a reset | `hw:change` and the `on…Change` option fire once when the reset changed the state | none |
| RangeSlider | `[data-hw-range-output]` filled with `lower – upper`; `locale` required | filled from `data-hw-range-label="{lower} … {upper}"` or `getRangeLabel`; `locale` optional | add `data-hw-range-label="{lower} – {upper}"` to the root |
| Combobox | `hw:change` always carried `detail.value`; documented hint inside `[data-hw=combobox]` | also `{ open }` and `{ query }`; `div.hw-field > label, div.hw-combobox, p.hw-hint` | test `'value' in event.detail`; move hint and error after the `.hw-combobox` element |
| MultiSelect | results status written at creation, only with an authored `[data-hw-status]` | status created when missing and written only after the reader filters; `getResultsMessage` required | supply `data-hw-results-message` |
| TagInput | documented `label.hw-field` around the input inside `.hw-tag-input`, `div[data-hw-tags]` after it | `div.hw-field > label.hw-label, div.hw-tag-input > ul[data-hw-tags], input[data-hw-tag-input]` | move the label out and use a `ul` |
| PinInput | `maxlength` written on the input | the authored `maxlength` (or `options.length`, else 6) is still the length; the attribute is removed while enhanced and restored on `destroy()`, and `pattern` is overwritten; paste normalised before the length applies | none: keep `maxlength="N"` in the markup |
| Calendar | standalone calendar rendered the Gregorian / Hijri switch and read `calendarSystemLabel`, `gregorianLabel`, `hijriLabel`; `unsupportedMessage` always required | no switch; the three texts belong to DatePicker; `unsupportedMessage` required while the calendar is `islamic-umalqura`; reset notifies | delete `data-hw-calendar-system-label`, `data-hw-gregorian-label` and `data-hw-hijri-label` from a standalone calendar root and call `controller.setCalendar(system)` from your own control |
| DatePicker | `div.hw-calendar-options` inside the `.hw-calendar` root; no visible message; output showed the long date or a message | switch directly before the calendar root in the dialog body; message in `[data-hw-error]` or a created `p.hw-error[role=alert]`; output shows the full date only | `.hw-calendar > .hw-calendar-options` -> `.hw-dialog-body > .hw-calendar-options`; optionally add `<p class="hw-error" data-hw-error></p>` where the message must appear |
| DataTable | `onSortChange({ key, direction })`; `hw:change` detail `{ value, key, direction }` | `onSortKeyChange(key)`, `onSortDirectionChange(direction)`; detail `{ sortKey, sortDirection }` | `event.detail.key` -> `event.detail.sortKey`; `event.detail.direction` -> `event.detail.sortDirection` |
| Carousel, Pagination | previous / next got `disabled` at the first / last slide or page | `aria-disabled="true"` at a bound; the arrow keeps focus | style `[aria-disabled='true']` as well as `:disabled` |
| Stepper | complete and upcoming steps had no text equivalent | `completeLabel` and `upcomingLabel` (`data-hw-complete-label`, `data-hw-upcoming-label`) are required and rendered as hidden state text | add both attributes to the list; remove hand-written state suffixes |
| Menu | `createMenu(root, { onSelect })`; type-ahead did not cycle on a repeated letter | `onAction(value)` and `onOpenChange(open)`; type-ahead from core `createTypeahead` | `onSelect: fn` -> `onAction: fn` |
| TreeView | option `expandedValues`, `controller.expandedValues`, `hw:change` `detail.expandedValues`; `button[data-hw-tree-toggle]` with a fixed authored `aria-label`; an unmatched letter was cancelled | `expanded` in the three places; `button.hw-tree-toggle` named by `getExpandLabel` / `getCollapseLabel`; unmatched keys keep their default | `expandedValues` -> `expanded`; add `class="hw-tree-toggle"` and `data-hw-expand-label="… {label}" data-hw-collapse-label="… {label}"` |
| TreeView | child items nested in `ul[role="group"]` inside their parent `li[role="treeitem"]` | one flat list, parent first: every item is a child of the root and carries `aria-level` below the first level; the controller hides the rows of a collapsed branch and throws for a nested tree item | move each child `li` out of its group to follow its parent, add `aria-level="2"` (3, …), remove the `ul[role="group"]` |
| Feedback | `value: string`; `onValueChange(string)`; `getStatusMessage`; status on the choice | `value: FeedbackValue` (`{ helpful, comment }`); `onValueChange(FeedbackValue)`; `onFeedback`; authored comment step; status after submit | `detail.value === 'yes'` -> `detail.value.helpful === true`; `getStatusMessage` -> `successMessage`; add the `[data-hw-feedback-comment]` block, or leave it out to report on the choice |
| CookieConsent | `onValueChange(choice)`; `controller.value`; `hw:change` `{ value }` | `onConsent(choice)`, `onOpenChange(open)`; `controller.open`, `setOpen`; `hw:change` `{ consent }` and `{ open }` | `onValueChange` -> `onConsent`; `event.detail.value` -> `event.detail.consent`; give Reject `data-variant="secondary"` |
| NotificationList | `data-unread="true"` or `data-read="false"` styled as unread | `data-state="unread"` only | `data-unread="true"` -> `data-state="unread"` |
| FileDropzone | rejection text in `[data-hw-file-status]`; first of several dropped files kept on a single input; `data-dragover` | `[data-hw-error]` or a created `p.hw-error[role=alert]`; the batch is rejected; `data-state="dragging"` | style `[data-state='dragging']` instead of `[data-dragover]`; root `div.hw-field.hw-file-dropzone` with `label[for]` |

## Skip links and in-page links

Packaged in-page links keep `href="#id"` in markup. `createSkipLink(link)`
(registered as `data-hw="skip-link"`) and `createContentNavigation` bind them with
core `bindFragmentLink`: on interaction the href resolves to the current document
under any `<base href>`, and a plain activation scrolls to the target and moves
focus to it without writing the URL fragment. `createContentNavigation` accepts
`updateHash` (`data-hw-update-hash="true"`) to write the resolved URL with
`history.replaceState`. A skip link inside `[data-hw="portal-header"]` is bound by
the header and shares one binding with `enhance()`.
In `createContentNavigation` an activation reports one change; the marker does
not step through the sections a smooth scroll passes.

```html
<a class="hw-skip-link" data-hw="skip-link" href="#main-content">Skip to main content</a>
<nav data-hw="pagination" aria-label="Search results pages" data-hw-page-label="Page {page}"
  data-hw-gap-label="Pages {start} to {end}" data-hw-jump-label="Go to page" data-hw-go-label="Go">…</nav>
```

## CopyButton

`createCopyButton(root, options?)` (registered as `data-hw="copy-button"`) copies
a value with the asynchronous Clipboard API and reports the outcome. Place the
button beside the visible value it copies. Author the icon form or the text form:

```html
<pre id="install-command"><code>pnpm add @hawiyah/vanilla</code></pre>
<span class="hw-copy" data-hw="copy-button" data-hw-target="install-command"
  data-hw-copied-message="تم نسخ الأمر" data-hw-failed-message="تعذّر النسخ، انسخ الأمر يدويًا">
  <button type="button" class="hw-button hw-icon-button" data-variant="ghost" data-size="md" aria-label="نسخ أمر التثبيت"><span class="hw-icon" data-icon="copy-01" aria-hidden="true"></span></button>
  <span class="hw-copy-message" role="status" aria-live="polite" aria-atomic="true"></span>
</span>
<!-- Text form: the label is a text node after the icon, and the button has no aria-label. -->
<button type="button" class="hw-button" data-variant="ghost" data-size="md"><span class="hw-icon" data-icon="copy-01" aria-hidden="true"></span>Copy</button>
```

| Option | Attribute on the root | Notes |
| --- | --- | --- |
| `text` (`string \| () => string`) | `data-hw-text`, else `data-hw-target` | The value, read at activation and never before. `data-hw-target` names an element whose `textContent` is read at activation. The option wins over `data-hw-text`, which wins over `data-hw-target`. Missing or white space only is the `empty` failure. |
| `label` | `data-hw-label` | Required. The constant name: the authored `aria-label` or text is kept; only a button with neither gets `aria-label` from this text. |
| `copiedMessage` | `data-hw-copied-message` | Required. Status text after a successful copy. |
| `failedMessage` | `data-hw-failed-message` | Required. Status text after any failure. |
| `feedbackDuration` | `data-hw-feedback-duration` | Milliseconds the copied state lasts; not a finite number above zero means 3000. |
| `onCopyResult(result)` | | Called once per activation that still counts, before the bubbling `hw:change` with detail `{ status, text }`. |

Variant, size, `disabled` and the display form are authored markup. The controller
writes `data-state` (`idle`, `copied`, `failed`) on the root, follows the state with
the icon (`copy-01`, `tick-02`, `alert-02`) and fills the polite status: empty when
idle, `copiedMessage`, or `failedMessage`, which the stylesheet shows as visible text.
The copied state returns to idle after the duration; the failed state stays until
the next activation. Each activation first empties the status, so a repeated message
is announced again, and only the latest activation counts. A result that settles at
once (an empty text, no Clipboard API) empties and fills the status inside one task;
that an identical message is then repeated has not been verified with a screen reader. The three texts are
checked when the controller is created. `status` is one of `copied`, `denied`,
`unavailable` (no Clipboard API, for example an insecure context), `failed` or
`empty`; when it is not `copied` the application may offer manual copying, for
example by selecting the value. Focus stays on the button. The controller returns
`{ state, copy(), destroy() }`; `destroy()` restores every authored attribute and
the status text. `CopyStatus` and `CopyResult` are re-exported as types.

## SideNavigation

`createSideNavigation(nav, options?)` (registered as `data-hw="side-navigation"`)
enhances the NavigationDrawer list outside a drawer, for a documentation or
service sidebar. Author the same list as the drawer; one item model (core
`NavigationItem`: `id`, `label`, `href`, `icon`, `current`, `disabled`,
`expanded`, `children`) produces both, so the phone drawer and the sidebar share
one array in a server template.

```html
<nav class="hw-side-navigation hw-navigation-drawer-nav" data-hw="side-navigation" aria-label="أقسام الدليل" data-sticky="true">
  <ul>
    <li data-hw-value="start"><a class="hw-navigation-drawer-row" href="/start"><span class="hw-icon" data-icon="home-01" aria-hidden="true"></span><span class="hw-navigation-drawer-label">البداية</span></a></li>
    <li data-hw-value="components"><details class="hw-navigation-drawer-group"><summary class="hw-navigation-drawer-row"><span class="hw-navigation-drawer-label">المكونات</span></summary><ul>
      <li data-hw-value="copy-button"><a class="hw-navigation-drawer-row" href="/components/copy-button" aria-current="page"><span class="hw-navigation-drawer-label">زر النسخ</span></a></li>
    </ul></details></li>
    <li data-hw-value="soon"><span class="hw-navigation-drawer-row" aria-disabled="true"><span class="hw-navigation-drawer-label">قريبًا</span></span></li>
  </ul>
</nav>
```

Rows: a link is `a.hw-navigation-drawer-row` (with `aria-current="page"` on the
current page), a group is `details.hw-navigation-drawer-group` with a summary row,
a disabled entry is a span with `aria-disabled="true"` and no children, and other
text is a plain span. A group that has its own page repeats it as the first link
inside, in `li[data-hw-value="{id}-page"]`. The `label` text names the landmark:
an authored `aria-label` or `aria-labelledby` is kept, else the `label` option, else
`data-hw-label`; without any, no name is written and a development warning asks for
`label`. `data-sticky="true"` makes it sticky from 64rem; place it with
`--hw-side-navigation-top` and `--hw-side-navigation-bottom-reserve`.

An authored `open` attribute is the group's `expanded` flag. The controller also
opens every group that holds `a[aria-current="page"]`, adds the two classes when
they are missing, removes `href` and tab stops from disabled rows, and scrolls the
current link to the middle of the nav's own scroll box (never the page, without
animation, without moving focus). It adds no listener and dispatches no event.
The application marks the current page on each route change; after moving
`aria-current`, call `refresh()`: a group that now holds the current page opens,
one that no longer does returns to its authored state, and any other group stays
as the reader left it. `destroy()` restores the authored attributes.
`createNavigationDrawer` applies the same group rule to its authored
`details.hw-navigation-drawer-group` elements: it recomputes the groups each time
the drawer is shown, so the group of the current page is open when the drawer
opens, and its controller has the same `refresh()` for a current page that moves
while the drawer is open.

## Client-side routing

Packaged links keep their `href`. A client-side router takes them over with one
delegated listener from core; components never call it:

```ts
import { bindLinkNavigation } from '@hawiyah/core';
const links = bindLinkNavigation(document, { navigate: ({ url }) => { history.pushState(null, '', url); render(); } });
// links.destroy() when the application is torn down.
```

It hands over a plain primary click (button 0, no modifier key, not prevented) on a
same-origin `a[href]` inside the base path (the `base` option, else the directory of
a same-origin `<base href>`, else `/`). The browser keeps links with `download`, a
target other than `_self`, `rel="external"`, aria-disabled, inert or editable links,
fragment links within the current document, and every click for which `navigate`
returns false. `createNavigationDrawer` still closes after a routed click. Focus
after navigation, route announcements, scroll restoration and `aria-current` are
the application's.

## Behavior choice

Zag was evaluated against this scope on 2026-10-28. Its official
[adapter guide](https://zagjs.com/guides/framework-adapters) documents a vanilla
adapter and the lifecycle, event/property normalization, state synchronization,
and cleanup required by framework bindings. It is a suitable internal engine
when interactions expand. This slice uses native platform primitives plus a
small shared combobox transition function, avoiding an additional adapter runtime
for behavior already supplied by the browser. Accessibility still requires the
documented markup, correct application labels, and browser testing.

The [HTML dialog specification](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element)
is the modal authority: no manual removal of `open`, no custom focus trap, no
`tabindex` on the dialog itself. Initial focus belongs on a suitable descendant
(use `autofocus`). Dropdowns/tooltips inside dialogs must remain descendants of
the native dialog to participate in its top layer. Child combobox Escape consumes
that key before the surrounding dialog is dismissed.

The [APG tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) and
[combobox patterns](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) inform
roving tab stops, RTL arrows, manual selection, and active-descendant focus.
Tooltip guidance follows the [APG work-in-progress pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/):
focus/hover, persistent hover over content, Escape, and descriptive text only.

DatePicker provides a visible Gregorian/Hijri switch inside its native dialog,
directly before the calendar root in the dialog body; a standalone Calendar has
no switch (call `controller.setCalendar(system)` from your own control).
A BCP 47 `locale` (`options.locale` or `data-hw-locale`) is required and only formats dates: month and weekday names come from Intl. Without it the controller does not throw; it warns in development and renders nothing that Intl would produce (see [Locale is supplied by the application](#locale-is-supplied-by-the-application)). Every word in the picker (trigger, navigation, switch and validation text) is application text; see the table above.
The switch preserves the submitted Gregorian ISO date and keeps the dialog open.
An associated live output (`aria-atomic="true"`) below the input shows the
selected date with the weekday (`dateStyle: 'full'`) in the active calendar,
including when the dialog is closed; it never carries a message. The editable
native field retains Gregorian ISO semantics; it is not a custom Hijri text
editor. Blank values and dates the active calendar cannot show hide the output.
A malformed, out-of-range, unsupported or unavailable typed date gets one
message (`invalidMessage`, `unsupportedMessage`, `unavailableMessage`), which is
also the input's custom validity: it is written with `role="alert"` into an
authored `[data-hw-error]` inside the root (its text and role are restored
afterwards), else into a created `p.hw-error` after the root's `.hw-hint`, and its
id joins the input's `aria-describedby` after the formatted date and the hint. An
authored `.hw-error` with text is the application's error and wins. A failed
submission (`invalid` event) sets `aria-invalid="true"` until the date is valid
again or the form resets. Opening the dialog moves focus to the selected day,
or today. Each opening starts again from the selected day: the focus memory of
the last opening is dropped, a typed date is the focused day, and the month
shown comes only from a value inside `min` and `max`, else from today held
inside `min` and `max` (the month of `max` when today is later, of `min` when
it is earlier). A `controller.setMonth()` call before `show()` therefore does
not choose the month an opening shows; call it while the dialog is open. The
previous and next month buttons are disabled only when the whole neighbouring
month is outside `min` and `max`.
A standalone Calendar has one `p.hw-sr-only[role=status]` after its
grid that holds `unsupportedMessage` while the Hijri calendar cannot show the
value. A native reset restores the authored value (DatePicker: the input's
`defaultValue`; Calendar: `value` or `data-hw-value`) and fires `hw:change` and
`onValueChange` once when it changed the value.
Umm al-Qura uses the pinned published reference shared by core, not runtime ICU
conversion. Its explicit range is 1924-08-01 through 2077-11-16; an unsupported
selection is preserved and marked invalid when Hijri is chosen. No arithmetic
fallback silently changes the meaning of a date. Native text/date edits, calendar
selection, required validation, form reset and focus return remain connected.

Scope limits: no asynchronous or virtualized selection, multilevel menus,
tree drag-and-drop, remote file uploads, data-grid editing, autoplay carousel,
tracking implementation, or legacy dialog polyfill. Dropzone selects native local
files; CookieConsent only reports a choice, with persistence explicitly opt-in.
Pagination preserves native href navigation. Live assistive-technology testing
is still needed before production claims.

## Feedback and content markup

These components have no controller of their own; the application owns their
state and removes what it dismisses.

### Alert

A dismissible alert carries the authored icon button after its content; the
alert never hides itself.

```html
<div class="hw-alert" data-tone="success" role="status" id="saved-alert">
  <div class="hw-alert-content"><p>Your draft was saved.</p></div>
  <button type="button" class="hw-button hw-alert-dismiss" data-variant="ghost" data-size="md" aria-label="Dismiss message"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>
</div>
```

```ts
const alert = document.getElementById('saved-alert')!;
alert.querySelector('.hw-alert-dismiss')!.addEventListener('click', () => {
  alert.remove();
  // Never leave focus on the body: send it to what the message was about.
  document.querySelector<HTMLElement>('main h1')?.focus();
});
```

A danger alert has `role="alert"`, every other tone `role="status"`.

### Chip

The remove control is a plain `<button type="button" aria-label="…">` with the
`cancel-01` icon inside `span.hw-chip` (no `hw-button` class). Before removing a
focused chip, call core `prepareRemovalFocus(container, button, { item:
'.hw-chip', control: 'button' })` and run the returned function after the
removal: focus moves to the next chip's remove button, else the previous one;
when the last chip goes, the application places focus.

### Skeleton

Announce loading with a status container that holds a visually hidden text and
the hidden skeletons; replace the whole container when the content arrives.

```html
<div role="status">
  <span class="hw-sr-only">Loading requests</span>
  <span class="hw-skeleton" aria-hidden="true" data-variant="text" style="inline-size: 70%"></span>
  <span class="hw-skeleton" aria-hidden="true" style="block-size: 4rem"></span>
</div>
```

`aria-busy="true"` may be added to the region being filled, never together with
an `aria-label` on an element without a role.

### NotificationList

Items are `li` elements without a class and with `data-state="unread|read"`; the
section is labelled by its visible h2. Read and dismiss actions are authored
buttons that the application handles:

```html
<section class="hw-notification-list" aria-labelledby="notifications-title" tabindex="-1">
  <h2 id="notifications-title">Notifications</h2>
  <ul>
    <li data-state="unread">
      <h3><a class="hw-link" href="/requests/42">Request approved</a></h3>
      <span class="hw-badge" data-tone="info">New</span>
      <p>Your licence is ready.</p>
      <time datetime="2026-10-28T09:00:00+03:00">28 October</time>
      <button type="button" class="hw-button" data-variant="ghost" data-size="md" data-hw-mark-read>Mark as read</button>
      <button type="button" class="hw-button" data-variant="ghost" data-size="md" data-hw-dismiss aria-label="Dismiss: Request approved"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>
    </li>
    <li data-state="read">
      <h3>Request received</h3>
      <button type="button" class="hw-button" data-variant="ghost" data-size="md" data-hw-dismiss aria-label="Dismiss: Request received"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>
    </li>
  </ul>
</section>
```

Before removing or re-rendering
an item after an action, call `prepareRemovalFocus(section, button, { item:
':scope > ul > li', control: '[data-hw-dismiss]', fallback: section })` (or
`'[data-hw-mark-read]'`) and run the result afterwards: focus moves to the same
control of the next item, then the previous one, then the list.

#### NotificationList without items

An empty list is one `<p>` in place of the `ul`, without a role:

```html
<section class="hw-notification-list" aria-labelledby="empty-notifications-title">
  <h2 id="empty-notifications-title">Notifications</h2>
  <p>No notifications.</p>
</section>
```

### Markup of the static components

The components below are markup and classes only. Each example is the documented
structure, the one the framework adapters render; the package tests mount these
examples and check them against the stylesheet. Text, dates and numbers are
application content.

#### Alert tones

```html
<div class="hw-alert" data-tone="danger" role="alert"><div class="hw-alert-content"><p>The file was not uploaded.</p></div></div>
<div class="hw-alert" data-tone="info" role="status"><div class="hw-alert-content"><p>Uploads close on Thursday.</p></div></div>
```

#### Progress, Meter and Spinner

A value above `max` is left as authored and the browser shows a full bar; a
`progress` without `value` is indeterminate. `low`, `high` and `optimum` are
written on a meter only when the application has them.

```html
<progress class="hw-progress" aria-label="Upload" value="150" max="100" data-size="sm"></progress>
<progress class="hw-progress" aria-label="Loading"></progress>
<meter class="hw-meter" aria-label="Storage" min="0" max="100" value="10"></meter>
<meter class="hw-meter" aria-label="Score" min="0" max="100" value="80" low="30" high="70" optimum="90"></meter>
<span class="hw-skeleton" data-variant="circle" aria-hidden="true"></span>
<span class="hw-spinner" role="status" data-size="lg"><span class="hw-sr-only">Loading</span></span>
```

#### EmptyState

The optional icon sits in `span.hw-empty-icon` before the heading; the action is
the last child.

```html
<div class="hw-empty">
  <span class="hw-empty-icon" aria-hidden="true"><span class="hw-icon" data-icon="search-01"></span></span>
  <h3>No results</h3>
  <p>Change the filters.</p>
  <button type="button" class="hw-button">Clear filters</button>
</div>
```

#### AvatarGroup

```html
<div class="hw-avatar-group" role="group" aria-label="Team">
  <span class="hw-avatar" data-size="64" data-variant="square" role="img" aria-label="Rana Cole">RC</span>
  <span class="hw-avatar" role="img" aria-label="Sami">S</span>
</div>
```

#### DescriptionList

`data-variant="horizontal"` is written only for that layout.

```html
<dl class="hw-description-list"><div><dt>Fee</dt><dd>100</dd></div></dl>
<dl class="hw-description-list" data-variant="horizontal"><div><dt>Fee</dt><dd>100</dd></div></dl>
```

#### Stat

Label, value, description and trend, in that order; `data-tone` on the root and
on the trend is `success` or `danger` (the root also takes `neutral`). There is
no `dl`.

```html
<div class="hw-stat" data-tone="danger">
  <span class="hw-stat-label">Requests</span>
  <strong class="hw-stat-value"><bdi><span class="hw-riyal" aria-hidden="true"></span>120 <span class="hw-sr-only">riyals</span></bdi></strong>
  <p class="hw-stat-description">This month</p>
  <span class="hw-stat-trend" data-tone="success"><span class="hw-icon" data-icon="arrow-up-01" aria-hidden="true"></span>12%</span>
</div>
```

#### Timeline

Every item is `li.hw-timeline-item` with `data-state="complete|current|upcoming"`;
the current step also carries `aria-current="step"`. The date is a `time` with
`datetime` and application text.

```html
<ol class="hw-timeline">
  <li class="hw-timeline-item" data-state="complete"><h3>Submitted</h3><time datetime="2026-10-27">27 October 2026</time><p>Received.</p></li>
  <li class="hw-timeline-item" data-state="current" aria-current="step"><h3>Review</h3></li>
  <li class="hw-timeline-item" data-state="upcoming"><h3>Decision</h3></li>
</ol>
```

#### Button and Link

A button inside a form states its `type`. Attributes written on the anchor stay
on `a.hw-link`, an application class included.

```html
<form><button type="button" class="hw-button">Save draft</button><button type="submit" class="hw-button">Send</button></form>
<a class="hw-link" data-variant="neutral" href="/guide" hreflang="ar" aria-current="page" target="_blank" rel="noopener noreferrer">Guide</a>
<a class="hw-link app-download" href="/files/guide.pdf" download aria-label="Download the guide (PDF)">Download the guide</a>
```

#### ServiceCard

The badge precedes the `h3` in the header; the title is not a link, and the
footer holds the one action.

```html
<article class="hw-card hw-service-card">
  <header class="hw-card-header"><div><span class="hw-badge" data-tone="neutral">Licences</span><h3>Commercial licence</h3></div></header>
  <div class="hw-card-body"><p>Issue a licence.</p><dl class="hw-description-list"><div><dt>Duration</dt><dd>3 days</dd></div><div><dt>Fee</dt><dd>100</dd></div></dl></div>
  <footer class="hw-card-footer"><a class="hw-link" href="/apply">Apply</a></footer>
</article>
```

#### ServiceDetails

```html
<article class="hw-service-details">
  <header><h2>Commercial licence</h2><p>Issue a licence.</p></header>
  <dl class="hw-description-list"><div><dt>Duration</dt><dd>3 days</dd></div><div><dt>Fee</dt><dd>100</dd></div></dl>
  <section><h3>Requirements</h3><ul><li>Identity</li></ul></section>
  <footer><button type="button" class="hw-button">Apply</button></footer>
</article>
```

## Native input types

Use native inputs inside a labelled `.hw-field`; names, autocomplete, required,
min/max/step, readonly, disabled, hints and errors remain application-controlled.

| Input family | Semantics |
| --- | --- |
| text, search, email, tel, url, password | Strings; email/url use native format validity, tel does not impose a phone format. |
| number, range | Native step/min/max; number may be empty. RangeSlider adds ordered lower/upper values. |
| date, month, week, time, datetime-local | Native date/time strings and constraints. datetime-local is not a timezone-qualified instant. |
| checkbox, radio | Native checked values and grouping; Rating and single ToggleGroup compose radios. |
| file | Browser-owned FileList; scripts may clear it, never preload a local file. Dropzone accepts explicit user drops. |
| color, hidden, submit, reset, button | Native browser behavior; hidden inputs do not provide constraint validation. |

Licensed under Apache-2.0. Install with `npm install @hawiyah/styles @hawiyah/vanilla`.
This is a pre-1.0 release, so a minor version may still change its API.

## Portal shell

The [portal layout recipe](PORTAL.md) provides a complete header, responsive
navigation, secondary links, breadcrumbs, content container and footer.
`createPortalHeader` is also registered as `data-hw="portal-header"` in `enhance`.

## NIC card composition

See [cards](../../docs/nic-cards.md) for source-mapped spacing, variants, whole-card links, disabled semantics and content classes. Native framework consumers include `?preview=nic`; vanilla uses the documented semantic HTML recipe.

See [NIC button variants](../../docs/nic-buttons.md) for all ten appearances,
interaction states, dark-surface use and density adaptations.

[Ready component examples](../../docs/ready-component-examples.md) cover all five
alert/notification tones, header/footer composition and guide-only navigation containment.


[Site verification](../../docs/site-verification.md) composes a native disclosure above the header with deployment-owned domain and certificate information. [Grouped portal footers](../../docs/nic-footer.md) add navigation groups, support actions, legal links and identity slots.

[Link and breadcrumb states](../../docs/nic-links.md) document neutral/standalone variants, disabled destinations, source contrast substitutions and native adapter APIs.
