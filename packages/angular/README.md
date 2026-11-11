# @hawiyah/angular

Angular components for Hawiyah — هوية, a UI library built to comply with the DGA
Platforms Code. Install with `npm install @hawiyah/styles @hawiyah/angular`. This is a
pre-1.0 release, so a minor version may still change its API.

The 77 catalog entries render native HTML with Angular templates. There are no
custom-element wrappers, schemas, runtime HTML injection, or framework renderers
inside core. Angular owns state and DOM; the shared core supplies pure combobox
transitions and keyboard navigation. Shared `hw-` classes provide appearance.

## Use

Build the workspace packages before starting the example. Import the standalone
components you use. The library builds with `ng-packagr` to Angular Package Format
(partial compilation); production Angular applications link it through their
normal Angular AOT build.

```ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HwTextFieldComponent, HwComboboxComponent, HwButtonDirective } from '@hawiyah/angular';

@Component({
  standalone: true,
  imports: [FormsModule, HwTextFieldComponent, HwComboboxComponent, HwButtonDirective],
  template: `
    <form #form="ngForm" (ngSubmit)="save()">
      <hw-text-field controlId="name" label="Name" name="name" [(ngModel)]="name" [required]="true" />
      <hw-combobox controlId="city" label="City" name="city" [(ngModel)]="city" [options]="cities"
        emptyMessage="No matching city" [getResultsMessage]="results" />
      <button hwButton type="submit">Save</button>
      <button hwButton variant="secondary" type="button" (click)="form.resetForm()">Reset</button>
    </form>
  `,
})
export class Example {
  name = ''; city = '';
  cities = [{value: 'riyadh', label: 'الرياض · Riyadh'}];
  results = (count: number) => `${count} cities match`;
  save() { /* application action */ }
}
```

Load `@hawiyah/styles/styles.css` once in the host application. The optional
`@hawiyah/styles/reset.css` is separate. Themes apply to a containing element:

```html
<main data-hw-theme="dga" data-hw-mode="light"
      data-hw-density="comfortable" dir="rtl" lang="ar">
  <!-- application -->
</main>
```

Theme, locale and text direction are independent. Use `dga` for the Platforms Code
palette or `custom` with your own documented CSS token overrides.

## Text is supplied by the application

Hawiyah ships no user-visible or accessible-name strings, in any language. The
components do not read `lang`, the document language or a locale to choose text,
and none of them has a default label. The application passes every string:

- Primary content (button and link text, dialog bodies, option and item labels)
  is projected content or data, as before.
- Text that a component places itself is a named input. Strings are named
  `...Label` (names and visible labels) or `...Message` (status, live-region and
  validation text). Templated text is a function input named `get...Label` or
  `get...Message`; it receives the data and returns the whole string, and the
  component adds no words or punctuation to it.
- Text needed in every use is `@Input({ required: true })`, so a missing one is a
  template type error. Text needed only when a feature is switched on (a
  dismissible alert, a required combobox, a header with `mainId`) is an optional
  input that is required under that condition. The tables below say which.
- When a required text is missing at run time, the component renders nothing in
  its place and omits the attribute; it does not invent a name or hide the
  control. In development it warns once per component and input through
  `console.warn`, with the prefix `Hawiyah:`. Production builds (`ngDevMode` false)
  stay silent.
- A constraint with a missing message (`requiredMessage`, `invalidMessage`,
  `unsupportedMessage`) still blocks submission and sets `aria-invalid`.
- `locale` is a formatting argument only: a BCP 47 tag that the component hands to
  `@hawiyah/core`, which hands it to `Intl`. There is no default locale. Calendar
  and DatePicker require it because month names, weekday names and the era come
  from `Intl`; DataTable requires it because text is sorted with a collator. The
  input is named `locale` in all three and a template without it does not compile
  (NG8008). A locale that is empty at run time is reported once like a missing
  text (`Hawiyah: hw-calendar requires "locale"`), and nothing that `Intl` would
  have produced is rendered: Calendar keeps its root element, hidden input, hint
  and error but renders no toolbar and no grid; DatePicker keeps its field,
  dialog and value, shows the ISO date as typed and announces no formatted date;
  DataTable keeps its sort state, `aria-sort` and `sortChange` and leaves the rows
  in their source order. The package itself calls no `Intl` API and reads no
  locale from the document or the browser. Numbers that are data (page numbers,
  counts, ratings, file sizes) are rendered as given.
- `dir` is rendered only where the application supplies it.

```html
<hw-pagination label="صفحات النتائج" previousLabel="الصفحة السابقة" nextLabel="الصفحة التالية"
  jumpLabel="الانتقال إلى صفحة" goLabel="انتقال" [getPageLabel]="pageLabel" [getGapLabel]="gapLabel"
  [totalPages]="20" [(page)]="page" />
```

```ts
pageLabel = (page: number) => `الصفحة ${page}`;
gapLabel = (start: number, end: number) => `الصفحات من ${start} إلى ${end}`;
```

Inputs renamed in this release, without aliases: Combobox `validationMessage` →
`requiredMessage` and `resultsMessage` → `getResultsMessage`; SearchField
`resultsMessage` → `getResultsMessage`; Pagination `pageLabel` → `getPageLabel` and
`gapLabel` → `getGapLabel`; Carousel `slideLabel` → `getSlideLabel`; Rating
`ratingLabel` → `getRatingLabel`; RatingDisplay `valueLabel` → `getValueLabel` (and
`label` is removed); TagInput `removeLabel` → `getRemoveLabel(tag)` and
`validationMessage` → `requiredMessage`; MultiSelect `validationMessage` →
`requiredMessage` and `selectedMessage` → `getSelectedMessage`; DatePicker
`dialogTitle` → `calendarLabel` and the former `calendarLabel` →
`calendarSystemLabel`; FileDropzone `instruction` → `dropLabel` and
`selectedMessage(count)` → `getSelectedMessage(files)`; AvatarGroup `overflowLabel` →
`getOverflowLabel`; ToastRegion and NotificationList `dismissLabel` →
`getDismissLabel(item)`; Feedback `positiveLabel`, `negativeLabel`, `thanksMessage` →
`yesLabel`, `noLabel`, `successMessage`; Tooltip `id` → `tooltipId`; Popover and
Menu `id` → `panelId`. SiteVerification `locale` and PortalLayout `lang` are removed.
ServiceCard no longer appends the card title to its action link: `actionLabel` is the
whole accessible name. PortalLayout passes `brandLabel` and projected `[hwFooterBrand]`
artwork to its footer.

Also changed in this release:

- DataTable `locale` is required. It used to default to `ar-SA`; pass
  `locale="ar-SA"` to keep the previous order. Calendar and DatePicker `locale`
  were already required; an empty value now renders no calendar and no formatted
  date, where it used to fall back to the locale of the host.
- FileDropzone `getSelectedMessage(files)` is optional and is the switch for the
  selection status: when it is bound, one visible `<p role="status">` follows the
  input (it is no longer visually hidden); when it is not bound, no status
  element is rendered and nothing is reported. `dropLabel` is rendered as
  `<p class="hw-file-dropzone-instruction" id="{controlId}-instruction">` and is
  the first id in the input's `aria-describedby`; it never names the input.
- PortalFooter writes `brandLabel` as `aria-label` with `role="group"` on
  `.hw-portal-footer-brand-marks` instead of the outer `.hw-portal-footer-brand`,
  and renders the `brand` text inside that group, after the projected artwork.
  The description stays outside the group.

## Inputs and outputs

All value controls implement `ControlValueAccessor` for `ngModel` and
reactive forms. Alternatively, use `[(value)]`. Do not bind both on the same
control. Common inputs: `controlId`, `label`, `name`, `hint`, `error`, `required`,
`disabled`, `value`; output: `valueChange`. Errors and hints connect to the native
control through `aria-describedby`, and errors set `aria-invalid`. Use an
application-owned `controlId` when rendering on the server or depending on an ID.
`error` presents validation feedback; validation decisions belong to the form.
Use Angular's `resetForm()` / `FormGroup.reset()` to reset custom control values.

| Catalog entry / standalone export | Selector and specific API |
| --- | --- |
| Button — `HwButtonDirective` | `button[hwButton]`, `a[hwButton]`; `variant: primary/secondary/ghost/danger`, `size: sm/md/lg`. Native attributes/events/form semantics are preserved. Set button `type` explicitly; anchors require `href` and do not support disabled semantics. |
| Field — `HwFieldComponent` | `hw-field`; required `controlId`, `label`; optional `hint`, `error`. Project a native control with that ID and explicitly connect description IDs. |
| TextField — `HwTextFieldComponent` | `hw-text-field`; string value, `type`, `placeholder`, `autocomplete`, `inputmode`, `readOnly`; `size: sm/md/lg` (default md), `visualVariant: outline/filled` (default outline) style the native input. The native number input still emits a string; parse at your domain boundary. Text being typed is never rewritten: while a number or date is incomplete the value is `''`, and the input keeps what the user typed. |
| Textarea — `HwTextareaComponent` | `hw-textarea`; string value, `rows`, `maxLength`, `placeholder`, `readOnly`; `size: sm/md/lg`, `visualVariant: outline/filled` style the native textarea. |
| Select — `HwSelectComponent` | `hw-select`; string value, `options: readonly Option[]`, optional `placeholder` (without it no prompt option is rendered); `size: sm/md/lg`, `visualVariant: outline/filled` style the native select. Native single select. |
| Checkbox — `HwCheckboxComponent` | `hw-checkbox`; boolean value, `indeterminate`. |
| Radio — `HwRadioComponent` | `hw-radio`; a named native radio group with a fieldset/legend, string value, `options`. |
| Switch — `HwSwitchComponent` | `hw-switch`; boolean value, native checkbox with switch role. |
| Combobox — `HwComboboxComponent` | `hw-combobox`; string value, `options`, `placeholder`; required `emptyMessage` and `getResultsMessage(count)`; `requiredMessage` is required with `required`. Editable single selection; no async or virtualization. |
| Tabs — `HwTabsComponent`, `HwTabComponent` | `hw-tabs` contains `hw-tab`; tabs `label`, `id`, `[(value)]`, `orientation`, optional `direction`, `activationMode: automatic/manual`, `overflow: menu/scroll` (default menu); `overflowLabel` is required unless `overflow="scroll"`. Each tab takes `value`, `label`, `disabled` and renders its projected content in its own panel: `<hw-tab>` contains the `<section class="hw-tab-panel" role="tabpanel">`, and the shared stylesheet gives `hw-tab` `display: contents`. Compact horizontal containers disclose excess labels; vertical tabs remain visible. |
| Dialog — `HwDialogComponent` | `hw-dialog`; required `title` and `closeLabel`; `titleId`, `[(open)]`, `closeOnBackdrop`; outputs `cancelled`, `returnValue`; methods `show(trigger?)`, `close(value?)`. Project content and `[hwDialogFooter]`. |
| Accordion — `HwAccordionComponent` | `hw-accordion`; `items: {id,title,content,open?}[]`, `exclusive`, `groupName`; `toggled: {id,open}`. Native details/summary. Project custom native details for richer content. |
| Card — `HwCardComponent` | `hw-card`; project `[hwCardHeader]`, body, `[hwCardFooter]`. |
| Badge — `HwBadgeComponent` | Static label; `tone="neutral\|success\|warning\|danger\|info"`, `variant="soft\|outline\|dot"`; [source and adaptations](../../docs/nic-badges.md). |
| Alert — `HwAlertComponent` | `hw-alert`; `title`, `tone: info/success/warning/danger`, `role: status/alert/region`, `dismissible`; `closeLabel` is required with `dismissible`; `dismissed` asks the parent to remove it. |
| Table — `HwTableComponent` | `hw-table`; `caption`, `columns: {key,label,rowHeader?}[]`, `rows: Record<string,string\|number\|null\|undefined>[]`, required `emptyMessage`. Values render as escaped text. |
| Pagination — `HwPaginationComponent` | `hw-pagination`; `[(page)]`, `totalPages`; required `label`, `previousLabel`, `nextLabel`, `getPageLabel(page)`, `getGapLabel(start,end)`, `jumpLabel` and `goLabel`; `formatPage(page)`, `siblingCount=1`, `disabled`, `hideOnSinglePage=false`. Ellipsis disclosures are named by `getGapLabel`; gaps above 100 pages use bounded integer entry. Parent fetches/slices data; no navigation or scrolling is imposed. |
| Breadcrumb — `HwBreadcrumbComponent` | `hw-breadcrumb`; `items: {label,href?}[]`, required `label`. Last item is current. |
| Progress — `HwProgressComponent` | `hw-progress`; `label`, `value: number\|null`, `max`; null is indeterminate. |
| Skeleton — `HwSkeletonComponent` | `hw-skeleton`; `width`, `height`; decorative, hidden from assistive technology. Announce surrounding loading state once. |
| Spinner — `HwSpinnerComponent` | `hw-spinner`; required `label`; status announcement. A spinner the application marks `aria-hidden="true"` is decorative: it passes `label=""`, which satisfies the required input, and nothing is reported. |
| Avatar — `HwAvatarComponent` | Required `name`; optional `src`, `initials`, `size="40\|64\|80\|120\|sm\|md\|lg\|xl"`, `variant="circle\|square"`. Failed images fall back to initials; changing `src` retries. [Source notes](../../docs/nic-avatars.md). |
| Divider — `HwDividerComponent` | `hw-divider`; native horizontal rule. |
| Tooltip — `HwTooltipComponent` | `hw-tooltip`; `text`, `tooltipId` (the id of the tooltip element; no id is left on the wrapper); project short noninteractive trigger content. Focusable trigger, hover/focus opening, Escape/outside closing. Do not project buttons or links into this focusable wrapper. |
| FileUpload — `HwFileUploadComponent` | `hw-file-upload`; readonly `File[]` value, `accept`, `multiple`. Selects local files only; no upload occurs. Forms can clear, but browsers forbid programmatically populating file pickers. |
| Stepper — `HwStepperComponent` | `hw-stepper`; `steps: {label,description?}[]`, zero-based `current`, required `label`. Noninteractive progress list. |
| EmptyState — `HwEmptyStateComponent` | `hw-empty-state`; `title`, `description`, projected actions. |

## Interaction guarantees

- Combobox options preserve values and display labels. Search normalization is
  shared with core and folds Arabic diacritics/alef variants. Typing clears the
  committed value. Arrow keys/Home/End move the active option, Enter explicitly
  commits, and Escape/Tab/blur close without silently selecting. Unmatched query text fails native required validation; composition input and modified editing shortcuts are preserved. The input keeps
  focus through `aria-activedescendant`. Disabled options cannot be committed.
- Tabs share core's wrapping navigation, skip disabled tabs, and follow RTL for
  horizontal arrows. Manual activation uses native button Enter/Space. Panels
  stay mounted; hidden panels leave the focus order. The tab list is rendered
  by `hw-tabs` and each panel by its `hw-tab`, in tab order after the list.
- Dialog uses native `showModal()`/`close()` after view creation. Native modality,
  focus containment and Escape behavior require a browser with dialog support.
  Close and destruction restore the opening trigger when it remains connected.
  No DOM globals are touched at module evaluation. A server render leaves the
  dialog closed; the browser opens it during view initialization.
- TextField and NumberField write a value into the native input only when the
  model changes from outside (an input binding, `writeValue`, a form reset) and
  the input does not already show it. Typing `-5` commits `-5`, typing `1e2`
  commits `100` in NumberField and the string `1e2` in TextField, and editing
  one segment of a date keeps the other segments.
- The library imports no global CSS. HTML text is interpolated, never trusted HTML.
  Theme selectors and CSS logical properties come from the shared style package.

## Server rendering and hydration

Every exported component and directive renders with `@angular/platform-server`
without throwing and without logging an error, and the result can be hydrated
with `provideClientHydration()`. On the server the components emit markup only:

- Tab overflow measurement, content navigation tracking, accordion motion,
  read-only choice guards and document-level listeners start in the browser.
  The core observers also return inert handles when the DOM has no layout.
- Native constraint validation (`setCustomValidity` in Combobox, TagInput,
  MultiSelect and DatePicker) is applied in the browser; the server DOM has no
  such method. `required`, `aria-invalid` and messages are in the server markup.
- Dialog, Drawer, NavigationDrawer and the DatePicker dialog are rendered closed.
- An accordion item that is open is rendered as `<details open>`, and an
  exclusive group keeps its native `name`; `aria-expanded`, `inert` and motion
  are added when the browser takes over.
- Each `hw-tab` renders its own panel, so projected tab content stays in the
  view that declares it. Angular can therefore hydrate a tabset in place.

Generated identifiers come from one injectable source per application
(`HwIdSource`, provided in the root injector). The server render and the
hydration of a page create their components in the same order and therefore
produce the same identifiers, and two server renders of a page produce identical
markup. Applications that share a document set Angular's `APP_ID`, which becomes
part of every generated identifier. An identifier the application passes always
wins: `controlId`, `id` (Tabs), `titleId` (Dialog, Drawer, NavigationDrawer),
`tooltipId` (Tooltip), `panelId` (Popover, Menu), `rangeTooltipId` (Calendar),
`mainId` and `navigationId` (PortalHeader, PortalLayout), `groupName` (Accordion).
Inputs named like a native attribute (`title`, `role` on Alert, `align` on
Tooltip) are not left as attributes on the wrapper element.

Packaged in-page links (the AppShell, PortalHeader and PortalLayout skip links
and the ContentNavigation links) are rendered as the bare `#id`, on the server
and on the first client render. In the browser each link is bound with core
`bindFragmentLink`: from the reader's first interaction its `href` resolves to
the current document under any `<base href>`, a plain activation scrolls to and
focuses the target without writing the URL, and modified clicks keep browser
behaviour with the corrected address.
`NgModel` delivers its value in a microtask after the first render, so a
calendar bound through `ngModel` rebuilds its day grid once after hydration;
`[(value)]` and reactive forms do not.

Evidence: `packages/angular/test/ssr.test.ts` renders every export with minimal
inputs, and every value control through `[(value)]`, `ngModel` and
`formControl`; it fails on a rejected render, a logged error or an exception
from a timer. `packages/angular/test/hydration.test.ts` renders the same pages
in a separate process and hydrates them in jsdom. Both use the JIT compiler
and a simulated DOM. They do not replace a production Angular CLI build
checked in a browser.

## Example and limits

`examples/angular` demonstrates a bilingual service discovery/application/review
flow, conditional guidance, file selection, and locally simulated request tracking.
It imports the built APF library and loads `@angular/compiler` intentionally for a
small Vite JIT demonstration. This is **not** a production Angular CLI AOT app,
server rendering proof, or hydration certification. Use the normal Angular build
pipeline for a production application. No request or file is submitted externally.

The current table API is textual, the accordion items API is textual, and the
combobox is local and single-select. For custom cells/details, compose the shared
CSS classes with native Angular templates rather than injecting HTML strings.

## Expanded components

Every component below is standalone, exported as `Hw{Name}Component`, and uses
`hw-kebab-case` selectors. Value controls support both `[(ngModel)]`/reactive forms
and `[(value)]` (choose one), with inherited `controlId`, `label`, `name`, `hint`,
`error`, `required`, `disabled`, and `readOnly`. Angular form reset clears string
and array controls, empties NumberField, restores Slider to `min`, and RangeSlider
to `[min,max]`. Native range, radio, and checkbox controls retain browser keyboard
behavior. Readonly controls retain submitted values where HTML permits it.

| Component | Inputs, outputs and composition |
| --- | --- |
| InputGroup | Project `[hwPrefix]`, a labeled native/control input, and `[hwSuffix]`; `size: sm/md/lg`. Addons remain ordinary content, so label decorative icons appropriately. |
| PasswordField | String value; `autocomplete`, `placeholder`; required `showLabel` and `hideLabel`. Reveal button keeps the same input and resets to hidden with forms. |
| SearchField | String value/CVA; `placeholder`, `autocomplete`, `autofocus`; required `clearLabel`; `searchLabel` names the search button and is required while `showSearchButton` is on (the default); optional `suggestions`, `maxSuggestions` (8), and with suggestions `getResultsMessage(count)`. The input and the suggestion list are named by `label`; `searched(query)` output and public `focus()`. |
| NumberField | `number \| null` value; `min`, `max`, `step` (number or `any`). Empty/invalid native numeric input maps to null. Text that is not yet a number (`-`, `1e`) emits null and stays in the input, so `-5` and `1e2` commit -5 and 100. Native step/min/max validation remains active. |
| Slider | Number value; `min`, `max`, `step`; native range plus value output. |
| RangeSlider | `[lower,upper]`; `min`, `max`, `step`, required `lowerLabel` and `upperLabel`, `lowerName`, `upperName`. Crossing thumbs stop at the other value; absent distinct names, `name` submits two ordered values. |
| Rating | Numeric value, `max` (1–20), required `getRatingLabel(value,max)`; named native radio choices. |
| `HwRatingDisplayComponent / hw-rating-display` | Numeric `value=0`, `max=5` (1–20), `showValue=true`, required `getValueLabel(value,max)`, which returns the whole text alternative (for example the subject and its score); noninteractive fractional aggregate score with one accessible image name. |
| PinInput | String value, `length`; one numeric input with `one-time-code` autocomplete, Arabic-Indic/Eastern Arabic digit normalization, paste support. |
| TagInput | `string[]`; `placeholder`; required `addLabel` and `getRemoveLabel(tag)`; `requiredMessage` is required with `required`. Enter/comma or Add commits unique trimmed tags; repeated hidden form values. |
| MultiSelect | `string[]`; `options: Option[]`; required `searchLabel` (the accessible name of the filter input, not a placeholder), `emptyMessage` and `getSelectedMessage(count)`; optional `placeholder`; `requiredMessage` is required with `required`. Searchable checkbox list; selected values remain in FormData when search hides their checkboxes. |
| Calendar | ISO Gregorian string value; `month`, `min`, `max`, `calendar: gregory/islamic-umalqura`, `weekStartsOn`, `direction`; required `label`, `locale`, `previousLabel` and `nextLabel`; `rangeLabel` is required with `calendar="islamic-umalqura"` and names the supported-range information, whose tooltip id is `rangeTooltipId`; optional `getDayLabel(isoDate)` replaces the Intl day name; `monthChange`. `locale` has no default: while it is empty the toolbar and the grid are not rendered. Grid supports RTL-aware arrows, Home/End, PageUp/Down and Shift+PageUp/Down (year). Bounds restrict selection/focus. |
| DatePicker | ISO Gregorian value, a custom text field and modal calendar. Accepts Calendar range inputs. Required: `label`, `locale`, `calendarLabel` (dialog title and name of the calendar), `openLabel`, `closeLabel`, `previousLabel`, `nextLabel`, `calendarSystemLabel` (name of the Gregorian/Hijri switch), `gregorianLabel`, `hijriLabel`, `rangeLabel`, `invalidMessage` and `unsupportedMessage`. `placeholder` is optional and has no default. `locale` has no default: while it is empty the typed ISO date is shown as typed, no formatted date is announced and the calendar in the dialog is empty; the value and validation are unaffected. Switching emits `calendarChange` and preserves the selected ISO date. Opening returns to its month and day. |
| FileDropzone | `File[]`; `accept`, `multiple`; required `label` (it names the input) and `dropLabel` (the visible instruction: `<p class="hw-file-dropzone-instruction" id="{controlId}-instruction">` before the input, listed first in its `aria-describedby`); optional `getSelectedMessage(files)`, which when bound renders one visible `<p role="status">` after the input, empty until files are selected and then the returned string; without it no status element is rendered. Selected file names are listed as data. `rejected` emits rejected files. Native picker and local drop handling; no upload/network side effect. Browser `DataTransfer` support is needed to mirror dropped files into native FormData. Forms can clear files but cannot populate a picker from a stored path. |
| ToggleGroup | String value for single or `string[]` for `multiple`; `options`, `variant: segmented/outline`. Single uses native radios; multiple uses pressed buttons. |
| Popover | Required `label` and `triggerLabel`; `panelId` (the id of the panel; no id is left on the wrapper), `disabled`, `[(open)]`; project interactive content. Disclosure region with ordinary Tab order, outside press/Escape closing. |
| Menu | Popover inputs plus `items: {id,label,disabled?}[]`, `action(id)`. ArrowUp/Down/Home/End navigation skips disabled items; Escape/activation returns focus. |
| Drawer | Dialog inputs/outputs/methods (including the required `closeLabel`) plus `side: start/end/bottom`; project body and `[hwDrawerFooter]`. Native modal dialog. |
| ToastRegion | `messages: {id,title?,message,tone?,urgent?,dismissible?}[]`, required `label`, `(dismissed)="remove($event)"`. Set `variant="banner"` and optionally `position="inline"` or a corner. A dismissal listener enables the button, which is named by `getDismissLabel(message)`, required while messages can be dismissed. |
| Collapsible | `label`, `[(open)]`; native details/summary and projected body. |
| TreeView | String selection; `nodes: {id,label,disabled?,children?}[]`, `[(expandedIds)]`, `direction`. Roving focus, RTL arrows, Home/End, Enter/Space selection. Caller supplies unique IDs. |
| Carousel | Required label/slides; `[(current)]`, `loop=false`, `slides` and optional `slideTemplate` with `{ $implicit: HwSlide, index }`, required one-based `getSlideLabel(position,total)`, `previousLabel`, `nextLabel` and `emptyLabel`. `showIndicators=true` needs `indicatorsLabel`; `carouselDescription` and `slideDescription` (`aria-roledescription`) are optional and rendered only when supplied. Inert inactive slides, explicit navigation and no autoplay. [Source and motion notes](../../docs/nic-carousel.md). |
| Link | `href`, `target`, `rel`, `current`, `variant: default/subtle`; projected link text. `_blank` defaults to `noopener noreferrer`. |
| IconButton | Required accessible `label`; `type`, `disabled`, `pressed`, `variant`, `size`; `activated(MouseEvent)`. Project a decorative icon. |
| ButtonGroup | `label`, `orientation: horizontal/vertical`; project native buttons or IconButtons. |
| Chip | `tone`, `variant`, `removable`, `disabled`; `removeLabel` is required with `removable`; `removed` asks the caller to remove it. |
| DescriptionList | `items: {term,description}[]`, `variant: stacked/horizontal`; project richer native dt/dd if needed. |
| Stat | `label`, `value`, `description`, `tone`; projected supplemental content. |
| Timeline | Required `label`, `items: {title,description?,time?,dateTime?,state?}[]`; state is complete/current/pending. |
| Meter | `label`, `value`, `min`, `max`, `low`, `high`, `optimum`; native meter for bounded measurements. |
| AvatarGroup | Required `label` and `getOverflowLabel(count)` (count is the number of hidden avatars); `avatars: {name,src?}[]`, `max`; named image/initials with overflow count. |
| DataTable | `caption`, `columns: {key,label,sortable?,rowHeader?}[]`, `rows: Record<string,string\|number\|boolean\|null\|undefined>[]`, required `locale` (BCP 47 tag for sorting; no default) and `emptyMessage`, `sortKey`, `sortDirection`, optional `getSortLabel(column,direction)` (the name of a sort button; direction is the order it will apply); `sortChange({key,direction})`. Stable sorting in the application's locale, native headers and aria-sort; text cells, rendered as given. |
| ServiceCard | `title`, `href`, `description`, `category`, `duration`, `fee`, `variant`; `actionLabel` is the whole text and accessible name of the action link (the card appends nothing to it, so include the service name where several cards share a page) and is required unless `[hwServiceAction]` content replaces the link; project `[hwServiceIcon]` and supplemental body. |
| ServiceDetails | `title`, `description`, `details: {term,description}[]`, `requirements: string[]`; `requirementsLabel` is required with requirements; projected actions/content. |
| PortalHeader | Required `menuLabel` and `navigationLabel`; optional `brand` text, `brandLabel`, `homeHref`, `mainId`, `skipLabel`, `navigationId`, `links: {label,href,current?}[]`; project `[hwBrand]` artwork and header actions. The brand may be artwork alone: no brand text is printed unless `brand` is supplied, and `brandLabel` gives artwork its accessible name (`aria-label` on the brand). An empty `homeHref` renders the brand without an `href`. The skip link is rendered only when `mainId` is set, and then needs `skipLabel`. Mobile menu is CSS-responsive; provide unique navigationId if repeated. Optional top-level `groups` contain a label and child links. See [grouped navigation](../../docs/nic-portal-navigation.md). |
| PortalFooter | Required `externalLabel` (screen-reader text added to links marked external); `brand`, `brandLabel`, `description`, `copyright`, `links`, `groups`, `legalLinks`; `navigationLabel` is required with `links`, `legalLinksLabel` with `legalLinks`, and `supportLabel` with projected `[hwFooterSupport]` content, the only case in which the support section is shown (otherwise it stays in the document with the `hidden` attribute, no heading and no name). `brandLabel` is written, as `aria-label` with `role="group"`, on `.hw-portal-footer-brand-marks`, which holds the `[hwFooterBrand]` artwork followed by the `brand` text, and only while that group has either; the description is outside the group, and without `brandLabel` no role and no name are rendered. Project `[hwFooterBrand]`, `[hwFooterSupport]`, `[hwFooterPartners]` and supplementary content. |
| Feedback | Required `label`, `yesLabel`, `noLabel` and `successMessage`; `disabled`, `[(value)]` (boolean or null initially). Emits local feedback choice; caller handles storage. |
| CookieConsent | Required `title`, `acceptLabel` and `rejectLabel`; `description`, `[(visible)]`; `consent(accepted/rejected)` and `preferences`. The preferences button is rendered while a `(preferences)` listener is bound and then needs `preferencesLabel`; a policy link is rendered with `policyHref` and then needs `policyLabel`. Application decides persistence and script gating; this UI does not imply consent has been stored. |
| NotificationList | Required `label`, `emptyMessage` and `unreadLabel`; `items: {id,title,description?,time?,href?,unread?}[]`; `dismissed(id)`. The dismiss button is rendered while a `(dismissed)` listener is bound and is named by `getDismissLabel(item)`. Caller owns read/dismiss state. |
| FileUploadList | `items: FileUploadItem[]`, `removable`, `disabled`; required `labels: FileUploadLabels` from `@hawiyah/core`: the status words `selected`, `uploading`, `complete`, `error`, the visible `remove` text, and `getProgressLabel(name)` and `getRemoveLabel(name)` for the progress bar and the remove button. `remove(id)` asks the owner to remove an item. |
| SiteVerification | Required `label`, `detailsLabel`, `domainLabel`, `domainDescription`, `httpsLabel` (include the protocol name in it) and `httpsDescription`; `domain`, `[(open)]`; `registrationHref` needs `registrationLabel`, and `externalLabel` while `registrationExternal` is on; `registrationNumber`. There is no `locale` input. |
| MobileTopBar | Required `title`; `subtitle`, `variant`, `headingLevel`; `backHref` needs `backLabel`. Project `[hwTopBarLeading]` and `[hwTopBarActions]`. |
| NavigationDrawer | Required `title`, `navigationLabel` and `closeLabel`; `titleId`, `items`, `side`, `[(open)]`, `closeOnBackdrop`. |

The national platform patterns are configurable ordinary application content. They
provide no seals, government endorsement, identity verification or connected
service transactions. Strings are escaped Angular interpolation throughout.

## Responsive composition

Container, Stack, Inline, Grid, Columns, Sidebar, Center, Spacer, AspectRatio,
Section, AppShell and PageHeader are native layout components. Shared props:
`gap`, `padding`, `align`, `justify`, `wrap`; spacing accepts token numbers 0–16
or CSS lengths. `gap`/`padding` and `columns` accept `{base,sm,md,lg,xl}` objects.
Breakpoints live in CSS (40/48/64/80rem), so server/client layout markup matches.

- Container: `maxWidth`.
- Grid/Columns: `columns`, `minItemWidth` (adaptive auto-fit).
- Sidebar: `sidebarWidth`, `side: start/end`, `collapseAt: sm/md/lg`; project
  `[hwSidebar]` and main content. The main pane follows in DOM reading order.
- AspectRatio: numeric `ratio`, default 16/9. Spacer is decorative.
- Section: optional accessible `label`.
- AppShell accepts `mainId`, the required `skipLabel`, `sidebarWidth` and `side`. Project
  `[hwShellHeader]`, `[hwShellSidebar]`, default main content and `[hwShellFooter]`.
  The skip link focuses the main landmark, whose default ID is `main-content`.
  Omitted regions leave the main area at full width.
- PageHeader: `title` (h1), `description`; `[hwBreadcrumb]` and default actions.

```html
<hw-app-shell mainId="services" skipLabel="انتقل إلى المحتوى" sidebarWidth="18rem">
  <hw-portal-header hwShellHeader brand="بوابة الخدمات"
    menuLabel="القائمة" navigationLabel="التنقل الرئيسي" [links]="navigation" />
  <nav hwShellSidebar aria-label="خدماتي"><!-- native links --></nav>
  <hw-container maxWidth="80rem" [padding]="{base: 4, lg: 8}">
    <hw-stack [gap]="6">
      <hw-page-header title="الخدمات" description="ابحث وابدأ طلبك" />
      <hw-grid [columns]="{base: 1, md: 2, xl: 3}" [gap]="4">
        @for (service of services; track service.href) {
          <hw-service-card [title]="service.title" [href]="service.href"
            [description]="service.description" [actionLabel]="service.actionLabel" />
        }
      </hw-grid>
      <hw-date-picker name="date" label="التاريخ" [(ngModel)]="date"
        [(calendar)]="calendar" locale="ar-SA" direction="rtl"
        calendarLabel="اختر التاريخ" calendarSystemLabel="التقويم" gregorianLabel="ميلادي" hijriLabel="هجري (أم القرى)"
        rangeLabel="النطاق المدعوم" openLabel="فتح التقويم" closeLabel="إغلاق التقويم"
        previousLabel="الشهر السابق" nextLabel="الشهر التالي"
        invalidMessage="أدخل تاريخًا صحيحًا" [unsupportedMessage]="unsupportedDate" />
    </hw-stack>
  </hw-container>
  <hw-portal-footer hwShellFooter brand="بوابة الخدمات" externalLabel="يفتح في نافذة جديدة" />
</hw-app-shell>
```

TextField additionally supports text/email/password/tel/url/search, native
number/range/color, and date/datetime-local/month/week/time. Its value remains a
string; date-related inputs return browser-defined ISO-like values, color returns
an HTML color, and number/range use numeric strings. `min`, `max`, `step`,
`minLength`, `maxLength`, and `pattern` forward native constraints where that input
type supports them. File, checkbox/radio, and form-action inputs have their own
purpose-built controls/native buttons. Use NumberField for `number | null` forms,
and DatePicker for switchable Gregorian/Umm al-Qura display with ISO storage.

Calendar navigation names, picker control labels and validation messages are inputs; there are no defaults in any language. `locale` selects how `Intl` writes month names, weekday names, the era and day names, and nothing else. `unsupportedDate` above is an application string, which may be built from `UMALQURA_MIN_DATE` and `UMALQURA_MAX_DATE` exported by `@hawiyah/core`; ISO dates inside a message are isolated left-to-right.

Calendar arithmetic comes from the shared core, `@internationalized/date`, and
the table-backed Saudi Umm al-Qura provider. Numeric Hijri dates, including
accessible day labels, come from that table rather than browser ICU conversion;
a day is named by `Intl`'s full date for `locale` through core `formatCalendarDate`.
Umm al-Qura supports AH 1343–1500 (1924-08-01 through 2077-11-16); outside this
interval DatePicker retains the ISO value and presents `unsupportedMessage`,
while Gregorian entry remains available. Calendar edge navigation stays bounded. Locale and calendar do not determine
text direction. Calendar bounds and the verified Umm al-Qura supported interval
follow the shared core's documented contract.

Maps, rich-text editors, charts, code editors, PDF viewers, CAPTCHA and payments
remain integration boundaries. Compose their provider SDKs in Card/Section/Grid,
provide accessible fallbacks, and keep credentials and payment/identity actions
in the application. DataTable has no editing or virtualization; TreeView has no
drag/drop; these APIs make no claim to supply those larger engines.

## Portal shell

[`HwPortalLayoutComponent` and `HwSecondaryNavComponent`](PORTAL.md) provide a
complete portal shell with responsive navigation and footer. Its text, language
and direction are supplied by the application.
Run the Angular example with `?preview=portal` to use the native composed shell.

## NIC card composition

See [cards](../../docs/nic-cards.md) for source-mapped spacing, variants, whole-card links, disabled semantics and content classes. Native framework consumers include `?preview=nic`; vanilla uses the documented semantic HTML recipe.

See [NIC button variants](../../docs/nic-buttons.md) for all ten appearances,
interaction states, dark-surface use and density adaptations.

[Ready component examples](../../docs/ready-component-examples.md) cover all five
alert/notification tones, header/footer composition and guide-only navigation containment.

InputGroup tracks value presence for projected native `.hw-input` / `.hw-select`
controls after Angular renders; no vanilla enhancer is required. Keep labels
and hints outside the joined row. See [NIC input composition](../../docs/nic-inputs.md).
# Native choice read-only state

`HwCheckboxComponent`, `HwRadioComponent` and `HwSwitchComponent` accept `readOnly`.
The control remains keyboard-focusable and submits its value, while pointer and
keyboard activation leave its value and radio peers unchanged. Disabled remains
a separate native state. See [NIC states](../../docs/nic-choices.md).


[Site verification](../../docs/site-verification.md) composes a native disclosure above the header with deployment-owned domain and certificate information. [Grouped portal footers](../../docs/nic-footer.md) add navigation groups, support actions, legal links and identity slots.

[Link and breadcrumb states](../../docs/nic-links.md) document neutral/standalone variants, disabled destinations, source contrast substitutions and native adapter APIs.


### Table presentation and empty results

`Table` and `DataTable` expose `variant="default|striped|bordered"`,
`size="sm|md|lg"` and `emptyMessage`. DGA cells have a 48px default minimum;
40px/56px alternate sizes and striped/bordered variants are Hawiyah extensions.
Captions name keyboard-focusable horizontal scroll containers; row-header
columns render native `th scope="row"`. Empty data spans the column count and
shows the required `emptyMessage`. Sorting does not mutate caller records.
DataTable sorts with the required `locale` input through core `sortRows`; there is
no default sort locale, and without one the rows keep their source order. Both component hosts shrink inside grid/flex
layouts so overflow stays inside the table wrapper.
See [table evidence and adaptations](../../docs/nic-tables.md).

Rating inputs select whole numbers; finite prefilled values are clamped to the normalized maximum and floored. Fractional averages belong in `RatingDisplay`. Nonfinite maxima fall back to 5 and nonfinite values to 0. The option names come from `getRatingLabel(value,max)`.


### Search suggestions

SearchField accepts local string suggestions and remains a free-text input.
With suggestions supplied it exposes an editable combobox/listbox, highlighted
matches and a polite result count. Arrow keys wrap through matches; Enter on an
active suggestion selects it and prevents form submission. Ordinary Enter with
no active suggestion emits `searched` with a trimmed, nonempty query and keeps
native form submission available. Choose either the search callback or the
form's submit handler for the application request; wiring both duplicates it.
The optional icon search action is a non-submit button and uses the callback.
The clear and search buttons are named by `clearLabel` and `searchLabel`, and
the result count is announced with `getResultsMessage(count)`.

Escape dismisses an open list before reaching an enclosing dialog; another
Escape can dismiss the dialog. Composition/modifier keys do not commit matches.
Readonly inputs remain searchable but cannot edit/clear/select suggestions;
disabled inputs cannot search. Blur, outside press, reset and changed suggestion
configuration clear active-option state. No remote search service is called.

### Content navigation

`HwContentNavigationComponent` (`hw-content-navigation`) follows application-owned section IDs using nested
`items: {id, label, disabled?, children?}[]`. Options are the required `label`
(the name of the landmark and the text of its heading), `showHeading` (true),
`sticky` (false), `scrollRoot` (null/window), `offset` (80px) and `updateHash`
(false). `(currentChange)="onCurrentChange($event)"` reports the current section ID. Each
link is rendered as `#id` and keeps resolving to the current document under a
`<base href>`. Ordinary activation scrolls without changing the URL, unless
`updateHash` asks for `history.replaceState`; keyboard activation also focuses
the target. Modified anchor clicks retain browser behavior, and a link whose
target is not in the document is left to the browser. Disabled entries
remain noninteractive text links; no section content is created or hidden.

```html
<!-- Add HwContentNavigationComponent to the host component's imports. -->
<hw-content-navigation label="في هذه الصفحة" [items]="[{id: 'requirements', label: 'المتطلبات'}]" />
<section id="requirements"><h2>المتطلبات</h2></section>
```
