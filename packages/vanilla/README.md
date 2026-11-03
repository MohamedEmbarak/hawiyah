# @nasaq/vanilla

Progressive enhancement for semantic HTML. Import styles separately:

```js
import '@nasaq/styles/styles.css';
import { enhance } from '@nasaq/vanilla';

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
enhance explicit `data-nq` hooks. A native `<dialog>` supplies modality, its top
layer, Escape handling, and focus containment through `showModal()`/`close()`.
Supply accessible names and localized text in markup. The default combobox
results announcement and required-selection message are Arabic; override
`getResultsMessage` and `invalidSelectionMessage` for other locales. A required
combobox must have a committed value before native form validation succeeds.

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
The switch preserves the submitted Gregorian ISO date and keeps the dialog open.
An associated live output below the input shows the selected date in the active
calendar, including when the dialog is closed. The editable native field retains
Gregorian ISO semantics; it is not a custom Hijri text editor. Blank values hide
the output, and unsupported Hijri dates show a range message instead.
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

Use native inputs inside a labelled `.nq-field`; names, autocomplete, required,
min/max/step, readonly, disabled, hints and errors remain application-controlled.

| Input family | Semantics |
| --- | --- |
| text, search, email, tel, url, password | Strings; email/url use native format validity, tel does not impose a phone format. |
| number, range | Native step/min/max; number may be empty. RangeSlider adds ordered lower/upper values. |
| date, month, week, time, datetime-local | Native date/time strings and constraints. datetime-local is not a timezone-qualified instant. |
| checkbox, radio | Native checked values and grouping; Rating and single ToggleGroup compose radios. |
| file | Browser-owned FileList; scripts may clear it, never preload a local file. Dropzone accepts explicit user drops. |
| color, hidden, submit, reset, button | Native browser behavior; hidden inputs do not provide constraint validation. |

Licensed under Apache-2.0. This public 0.1 source preview is available through the
workspace; the package is not yet published on npm.

## Portal shell

The [portal layout recipe](PORTAL.md) provides a complete header, responsive
navigation, secondary links, breadcrumbs, content container and footer.
`createPortalHeader` is also registered as `data-nq="portal-header"` in `enhance`.

## NIC card composition

See [cards](../../docs/nic-cards.md) for source-mapped spacing, variants, whole-card links, disabled semantics and content classes. Native framework consumers include `?preview=nic`; vanilla uses the documented semantic HTML recipe.

See [NIC button variants](../../docs/nic-buttons.md) for all ten appearances,
interaction states, dark-surface use and density adaptations.

[Ready component examples](../../docs/ready-component-examples.md) cover all five
alert/notification tones, header/footer composition and guide-only navigation containment.


[Site verification](../../docs/site-verification.md) composes a native disclosure above the header with deployment-owned domain and certificate information. [Grouped portal footers](../../docs/nic-footer.md) add navigation groups, support actions, legal links and identity slots.

[Link and breadcrumb states](../../docs/nic-links.md) document neutral/standalone variants, disabled destinations, source contrast substitutions and native adapter APIs.
