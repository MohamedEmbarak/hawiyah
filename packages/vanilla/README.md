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
| `createCalendar` | `label`, `previousLabel`, `nextLabel`, `calendarSystemLabel`, `gregorianLabel`, `hijriLabel`, `rangeLabel`, `unsupportedMessage`; optional `getDayLabel(value)`; `locale` is required |
| `createDatePicker` | `calendarLabel`, `openLabel`, `previousLabel`, `nextLabel`, `calendarSystemLabel`, `gregorianLabel`, `hijriLabel`, `rangeLabel`, `invalidMessage`, `unsupportedMessage`; `unavailableMessage` when `isDateDisabled` is given; `locale` is required |
| `createCarousel` | `label`, `getSlideLabel(position, total)` (one-based), `emptyLabel`; optional `carouselDescription`, `slideDescription` |
| `createCombobox` | `getResultsMessage(count)`; `requiredMessage` when the input is required |
| `createContentNavigation` | `label` |
| `createCopyButton` | `label` (when the button has no `aria-label`, `aria-labelledby` or text), `copiedMessage`, `failedMessage` |
| `createFeedback` | `successMessage`; optional `getStatusMessage(value)` |
| `createFileDropzone` | when `[data-hw-file-status]` exists: `getSelectedMessage(files)`, `unsupportedDropMessage`, and `getRejectedMessage(rejected)` when `accept` or `maxSize` is set |
| `createFileUploadList` | `labels` (core `FileUploadLabels`, including `getProgressLabel(name)` and `getRemoveLabel(name)`) |
| `createMultiSelect` | `getResultsMessage(count)` when `[data-hw-status]` exists; `requiredMessage` when required |
| `createNavigationDrawer` | `navigationLabel` |
| `createPagination` | `label`; with an items container `getPageLabel(page)`, `getGapLabel(start, end)`, `jumpLabel`, `goLabel` |
| `createPasswordField` | `showLabel`, `hideLabel` |
| `createPortalHeader` | `menuLabel`, `navigationLabel`; optional `brandLabel` (see [PORTAL.md](PORTAL.md)) |
| `createSideNavigation` | `label` (when the nav has no `aria-label` or `aria-labelledby`) |
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
