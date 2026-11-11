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
application, from these sources in order:

1. Authored markup: the text or `aria-label` already on the element the
   controller would otherwise name is used as written.
2. An attribute on the controller root: `data-hw-<kebab-name>` for a string input
   (`overflowLabel` → `data-hw-overflow-label`) and, for a function input, a
   template attribute named after the input without `get`, whose `{placeholders}`
   are filled with core `formatTextTemplate` (`getPageLabel` →
   `data-hw-page-label="Page {page}"`).
3. The controller option of the same name, which wins over the attribute.

`enhance()` therefore works from markup alone. When a required text is missing
the controller renders nothing in its place (no text node, the attribute is
omitted) and core `requireText` warns once per component and input in
development (`Hawiyah: <Component> requires "<name>" …`). A validation
constraint without its message still blocks submission. Function inputs return
the whole string; the controller adds no words or punctuation to it.

| Controller | Text inputs (required unless noted) |
| --- | --- |
| `createCalendar` | `label`, `previousLabel`, `nextLabel`, `calendarSystemLabel`, `gregorianLabel`, `hijriLabel`, `rangeLabel`, `unsupportedMessage`; optional `getDayLabel(value)`; `locale` is required |
| `createDatePicker` | `calendarLabel`, `openLabel`, `previousLabel`, `nextLabel`, `calendarSystemLabel`, `gregorianLabel`, `hijriLabel`, `rangeLabel`, `invalidMessage`, `unsupportedMessage`; `unavailableMessage` when `isDateDisabled` is given; `locale` is required |
| `createCarousel` | `label`, `getSlideLabel(position, total)` (one-based), `emptyLabel`; optional `carouselDescription`, `slideDescription` |
| `createCombobox` | `getResultsMessage(count)`; `requiredMessage` when the input is required |
| `createContentNavigation` | `label` |
| `createFeedback` | `successMessage`; optional `getStatusMessage(value)` |
| `createFileDropzone` | when `[data-hw-file-status]` exists: `getSelectedMessage(files)`, `unsupportedDropMessage`, and `getRejectedMessage(rejected)` when `accept` or `maxSize` is set |
| `createFileUploadList` | `labels` (core `FileUploadLabels`, including `getProgressLabel(name)` and `getRemoveLabel(name)`) |
| `createMultiSelect` | `getResultsMessage(count)` when `[data-hw-status]` exists; `requiredMessage` when required |
| `createNavigationDrawer` | `navigationLabel` |
| `createPagination` | `label`; with an items container `getPageLabel(page)`, `getGapLabel(start, end)`, `jumpLabel`, `goLabel` |
| `createPasswordField` | `showLabel`, `hideLabel` |
| `createPortalHeader` | `menuLabel`, `navigationLabel`; optional `brandLabel` (see [PORTAL.md](PORTAL.md)) |
| `createSearchField` | `clearLabel`; `getResultsMessage(count)` when suggestions are given |
| `createSkipLink` | the link's own text (`skipLabel`) |
| `createStepper` | `label` |
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
| `createRangeSlider` | when the root contains `[data-hw-range-output]` | the output stays empty; values, clamping and events are unchanged |

Output is unchanged when the application passes the locale that used to be the default (`ar-SA`).

## Skip links and in-page links

Packaged in-page links keep `href="#id"` in markup. `createSkipLink(link)`
(registered as `data-hw="skip-link"`) and `createContentNavigation` bind them with
core `bindFragmentLink`: on interaction the href resolves to the current document
under any `<base href>`, and a plain activation scrolls to the target and moves
focus to it without writing the URL fragment. `createContentNavigation` accepts
`updateHash` (`data-hw-update-hash="true"`) to write the resolved URL with
`history.replaceState`. A skip link inside `[data-hw="portal-header"]` is bound by
the header and shares one binding with `enhance()`.

```html
<a class="hw-skip-link" data-hw="skip-link" href="#main-content">Skip to main content</a>
<nav data-hw="pagination" aria-label="Search results pages" data-hw-page-label="Page {page}"
  data-hw-gap-label="Pages {start} to {end}" data-hw-jump-label="Go to page" data-hw-go-label="Go">…</nav>
```

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

DatePicker provides a visible Gregorian/Hijri switch inside its native dialog.
A BCP 47 `locale` (`options.locale` or `data-hw-locale`) is required and only formats dates: month and weekday names come from Intl. Without it the controller does not throw; it warns in development and renders nothing that Intl would produce (see [Locale is supplied by the application](#locale-is-supplied-by-the-application)). Every word in the picker (trigger, navigation, switch and validation text) is application text; see the table above.
The switch preserves the submitted Gregorian ISO date and keeps the dialog open.
An associated live output below the input shows the selected date in the active
calendar, including when the dialog is closed. The editable native field retains
Gregorian ISO semantics; it is not a custom Hijri text editor. Blank values hide
the output, and unsupported Hijri dates show `unsupportedMessage` instead.
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
