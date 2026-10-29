# @nasaq/angular

Independently designed Angular components for Nasaq's public 0.1 source preview,
informed by Saudi DGA design principles. This package is not official, endorsed,
or certified. The `@nasaq/*` packages are not yet published to npm; build and use
them through this repository's workspace.

The 77 catalog entries render native HTML with Angular templates. There are no
custom-element wrappers, schemas, runtime HTML injection, or framework renderers
inside core. Angular owns state and DOM; the shared core supplies pure combobox
transitions and keyboard navigation. Shared `nq-` classes provide appearance.

## Use

Build the workspace packages before starting the example. Import the standalone
components you use. The library builds with `ng-packagr` to Angular Package Format
(partial compilation); production Angular applications link it through their
normal Angular AOT build.

```ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NqTextFieldComponent, NqComboboxComponent, NqButtonDirective } from '@nasaq/angular';

@Component({
  standalone: true,
  imports: [FormsModule, NqTextFieldComponent, NqComboboxComponent, NqButtonDirective],
  template: `
    <form #form="ngForm" (ngSubmit)="save()">
      <nq-text-field controlId="name" label="Name" name="name" [(ngModel)]="name" [required]="true" />
      <nq-combobox controlId="city" label="City" name="city" [(ngModel)]="city" [options]="cities" />
      <button nqButton type="submit">Save</button>
      <button nqButton variant="secondary" type="button" (click)="form.resetForm()">Reset</button>
    </form>
  `,
})
export class Example {
  name = ''; city = '';
  cities = [{value: 'riyadh', label: 'الرياض · Riyadh'}];
  save() { /* application action */ }
}
```

Load `@nasaq/styles/styles.css` once in the host application. The optional
`@nasaq/styles/reset.css` is separate. Themes apply to a containing element:

```html
<main data-nq-theme="dga" data-nq-mode="light"
      data-nq-density="comfortable" dir="rtl" lang="ar">
  <!-- application -->
</main>
```

Theme, locale and text direction are independent. Use `dga` for the DGA-informed
palette or `custom` with your own documented CSS token overrides. Supply Arabic
labels, messages, tooltips, navigation labels, and result announcements explicitly.

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
| Button — `NqButtonDirective` | `button[nqButton]`, `a[nqButton]`; `variant: primary/secondary/ghost/danger`, `size: sm/md/lg`. Native attributes/events/form semantics are preserved. Set button `type` explicitly; anchors require `href` and do not support disabled semantics. |
| Field — `NqFieldComponent` | `nq-field`; required `controlId`, `label`; optional `hint`, `error`. Project a native control with that ID and explicitly connect description IDs. |
| TextField — `NqTextFieldComponent` | `nq-text-field`; string value, `type`, `placeholder`, `autocomplete`, `inputmode`, `readOnly`. The native number input still emits a string; parse at your domain boundary. |
| Textarea — `NqTextareaComponent` | `nq-textarea`; string value, `rows`, `maxLength`, `placeholder`, `readOnly`. |
| Select — `NqSelectComponent` | `nq-select`; string value, `options: readonly Option[]`, `placeholder`. Native single select. |
| Checkbox — `NqCheckboxComponent` | `nq-checkbox`; boolean value, `indeterminate`. |
| Radio — `NqRadioComponent` | `nq-radio`; a named native radio group with a fieldset/legend, string value, `options`. |
| Switch — `NqSwitchComponent` | `nq-switch`; boolean value, native checkbox with switch role. |
| Combobox — `NqComboboxComponent` | `nq-combobox`; string value, `options`, `placeholder`, `emptyMessage`, `validationMessage`, `resultsMessage(count)`. Editable single selection; no async or virtualization. |
| Tabs — `NqTabsComponent`, `NqTabComponent` | `nq-tabs` contains `nq-tab`; tabs `label`, `id`, `[(value)]`, `orientation`, optional `direction`, `activationMode: automatic/manual`. Each tab takes `value`, `label`, `disabled` and projects its panel. |
| Dialog — `NqDialogComponent` | `nq-dialog`; `title`, `titleId`, `[(open)]`, `closeLabel`, `closeOnBackdrop`; outputs `cancelled`, `returnValue`; methods `show(trigger?)`, `close(value?)`. Project content and `[nqDialogFooter]`. |
| Accordion — `NqAccordionComponent` | `nq-accordion`; `items: {id,title,content,open?}[]`, `exclusive`, `groupName`; `toggled: {id,open}`. Native details/summary. Project custom native details for richer content. |
| Card — `NqCardComponent` | `nq-card`; project `[nqCardHeader]`, body, `[nqCardFooter]`. |
| Badge — `NqBadgeComponent` | `nq-badge`; `tone: neutral/success/warning/danger/info`, projected content. |
| Alert — `NqAlertComponent` | `nq-alert`; `title`, `tone: info/success/warning/danger`, `role: status/alert/region`, `dismissible`, `closeLabel`; `dismissed` asks the parent to remove it. |
| Table — `NqTableComponent` | `nq-table`; `caption`, `columns: {key,label,rowHeader?}[]`, `rows: Record<string,string\|number\|null\|undefined>[]`, `emptyMessage`. Values render as escaped text. |
| Pagination — `NqPaginationComponent` | `nq-pagination`; `[(page)]`, `totalPages`, `label`, `previousLabel`, `nextLabel`, `pageLabel(page)`. Bounded window; never renders every page in a large result set. Parent fetches/slices data. |
| Breadcrumb — `NqBreadcrumbComponent` | `nq-breadcrumb`; `items: {label,href?}[]`, `label`. Last item is current. |
| Progress — `NqProgressComponent` | `nq-progress`; `label`, `value: number\|null`, `max`; null is indeterminate. |
| Skeleton — `NqSkeletonComponent` | `nq-skeleton`; `width`, `height`; decorative, hidden from assistive technology. Announce surrounding loading state once. |
| Spinner — `NqSpinnerComponent` | `nq-spinner`; localized `label`; status announcement. |
| Avatar — `NqAvatarComponent` | `nq-avatar`; `name`, optional `src`; accessible initials fallback on failure. |
| Divider — `NqDividerComponent` | `nq-divider`; native horizontal rule. |
| Tooltip — `NqTooltipComponent` | `nq-tooltip`; `text`, `id`; project short noninteractive trigger content. Focusable trigger, hover/focus opening, Escape/outside closing. Do not project buttons or links into this focusable wrapper. |
| FileUpload — `NqFileUploadComponent` | `nq-file-upload`; readonly `File[]` value, `accept`, `multiple`. Selects local files only; no upload occurs. Forms can clear, but browsers forbid programmatically populating file pickers. |
| Stepper — `NqStepperComponent` | `nq-stepper`; `steps: {label,description?}[]`, zero-based `current`, `label`. Noninteractive progress list. |
| EmptyState — `NqEmptyStateComponent` | `nq-empty-state`; `title`, `description`, projected actions. |

## Interaction guarantees

- Combobox options preserve values and display labels. Search normalization is
  shared with core and folds Arabic diacritics/alef variants. Typing clears the
  committed value. Arrow keys/Home/End move the active option, Enter explicitly
  commits, and Escape/Tab/blur close without silently selecting. Unmatched query text fails native required validation; composition input and modified editing shortcuts are preserved. The input keeps
  focus through `aria-activedescendant`. Disabled options cannot be committed.
- Tabs share core's wrapping navigation, skip disabled tabs, and follow RTL for
  horizontal arrows. Manual activation uses native button Enter/Space. Panels
  stay mounted; hidden panels leave the focus order.
- Dialog uses native `showModal()`/`close()` after view creation. Native modality,
  focus containment and Escape behavior require a browser with dialog support.
  Close and destruction restore the opening trigger when it remains connected.
  No DOM globals are touched at module evaluation. A server render leaves the
  dialog closed; the browser opens it during view initialization.
- The library imports no global CSS. HTML text is interpolated, never trusted HTML.
  Theme selectors and CSS logical properties come from the shared style package.

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

Every component below is standalone, exported as `Nq{Name}Component`, and uses
`nq-kebab-case` selectors. Value controls support both `[(ngModel)]`/reactive forms
and `[(value)]` (choose one), with inherited `controlId`, `label`, `name`, `hint`,
`error`, `required`, `disabled`, and `readOnly`. Angular form reset clears string
and array controls, empties NumberField, restores Slider to `min`, and RangeSlider
to `[min,max]`. Native range, radio, and checkbox controls retain browser keyboard
behavior. Readonly controls retain submitted values where HTML permits it.

| Component | Inputs, outputs and composition |
| --- | --- |
| InputGroup | Project `[nqPrefix]`, a labeled native/control input, and `[nqSuffix]`; `size: sm/md/lg`. Addons remain ordinary content, so label decorative icons appropriately. |
| PasswordField | String value; `autocomplete`, `placeholder`, `showLabel`, `hideLabel`. Reveal button keeps the same input and resets to hidden with forms. |
| SearchField | String value; `placeholder`, `searchLabel`, `clearLabel`; `searched` output on Enter/search button. Clearing restores input focus. |
| NumberField | `number \| null` value; `min`, `max`, `step` (number or `any`). Empty/invalid native numeric input maps to null. Native step/min/max validation remains active. |
| Slider | Number value; `min`, `max`, `step`; native range plus value output. |
| RangeSlider | `[lower,upper]`; `min`, `max`, `step`, `lowerLabel`, `upperLabel`, `lowerName`, `upperName`. Crossing thumbs stop at the other value; absent distinct names, `name` submits two ordered values. |
| Rating | Numeric value, `max` (1–20), `ratingLabel(value,max)`; named native radio choices. |
| PinInput | String value, `length`; one numeric input with `one-time-code` autocomplete, Arabic-Indic/Eastern Arabic digit normalization, paste support. |
| TagInput | `string[]`; `placeholder`, `addLabel`, `removeLabel`. Enter/comma or Add commits unique trimmed tags; repeated hidden form values. |
| MultiSelect | `string[]`; `options: Option[]`, `searchLabel`, `emptyMessage`, `selectedMessage(count)`, `validationMessage`. Searchable checkbox list; selected values remain in FormData when search hides their checkboxes. |
| Calendar | ISO Gregorian string value; `month`, `min`, `max`, `locale`, `calendar: gregory/islamic-umalqura`, `weekStartsOn`, `direction`, `previousLabel`, `nextLabel`; `monthChange`. Grid supports RTL-aware arrows, Home/End, PageUp/Down and Shift+PageUp/Down (year). Bounds restrict selection/focus. |
| DatePicker | ISO Gregorian string value; Calendar localization/range inputs, `dialogTitle`, `openLabel`, `closeLabel`; `calendarLabel`, `gregorianLabel`, `hijriLabel`, `unsupportedMessage`; `calendarChange`. Native date field plus modal calendar. Display calendar switching preserves the selected ISO date; opening returns to its month and day. |
| FileDropzone | `File[]`; `accept`, `multiple`, `instruction`, `selectedMessage(count)`; `rejected` emits rejected files. Native picker and local drop handling; no upload/network side effect. Browser `DataTransfer` support is needed to mirror dropped files into native FormData. Forms can clear files but cannot populate a picker from a stored path. |
| ToggleGroup | String value for single or `string[]` for `multiple`; `options`, `variant: segmented/outline`. Single uses native radios; multiple uses pressed buttons. |
| Popover | `label`, `triggerLabel`, `id`, `disabled`, `[(open)]`; project interactive content. Disclosure region with ordinary Tab order, outside press/Escape closing. |
| Menu | Popover inputs plus `items: {id,label,disabled?}[]`, `action(id)`. ArrowUp/Down/Home/End navigation skips disabled items; Escape/activation returns focus. |
| Drawer | Dialog inputs/outputs/methods plus `side: start/end/bottom`; project body and `[nqDrawerFooter]`. Native modal dialog. |
| ToastRegion | `label`, `messages: {id,title?,message,tone?,urgent?,dismissible?}[]`, `dismissLabel`; `dismissed(id)`. Caller removes messages; stable polite/urgent live regions; no expiry timers. |
| Collapsible | `label`, `[(open)]`; native details/summary and projected body. |
| TreeView | String selection; `nodes: {id,label,disabled?,children?}[]`, `[(expandedIds)]`, `direction`. Roving focus, RTL arrows, Home/End, Enter/Space selection. Caller supplies unique IDs. |
| Carousel | `label`, `slides: {id?,title?,content?,src?,alt?}[]`, `[(current)]` (zero-based), `loop`; `previousLabel`, `nextLabel`, `emptyLabel`, `carouselDescription`, `slideDescription`, `slideLabel(index,total)`. Hidden inactive slides, current status, no autoplay. |
| Link | `href`, `target`, `rel`, `current`, `variant: default/subtle`; projected link text. `_blank` defaults to `noopener noreferrer`. |
| IconButton | Required accessible `label`; `type`, `disabled`, `pressed`, `variant`, `size`; `activated(MouseEvent)`. Project a decorative icon. |
| ButtonGroup | `label`, `orientation: horizontal/vertical`; project native buttons or IconButtons. |
| Chip | `tone`, `variant`, `removable`, `disabled`, `removeLabel`; `removed` asks the caller to remove it. |
| DescriptionList | `items: {term,description}[]`, `variant: stacked/horizontal`; project richer native dt/dd if needed. |
| Stat | `label`, `value`, `description`, `tone`; projected supplemental content. |
| Timeline | `label`, `items: {title,description?,time?,dateTime?,state?}[]`; state is complete/current/pending. |
| Meter | `label`, `value`, `min`, `max`, `low`, `high`, `optimum`; native meter for bounded measurements. |
| AvatarGroup | `label`, `avatars: {name,src?}[]`, `max`, `overflowLabel(count)`; named image/initials with overflow count. |
| DataTable | `caption`, `columns: {key,label,sortable?}[]`, `rows: Record<string,string\|number\|boolean\|null\|undefined>[]`, `locale`, `emptyMessage`, `sortKey`, `sortDirection`; `sortChange({key,direction})`. Stable localized sorting, native headers and aria-sort; text cells. |
| ServiceCard | `title`, `href`, `description`, `category`, `duration`, `fee`, `actionLabel`, `variant`; project `[nqServiceIcon]` and supplemental body. |
| ServiceDetails | `title`, `description`, `details: {term,description}[]`, `requirements: string[]`, `requirementsLabel`; projected actions/content. |
| PortalHeader | `brand`, `homeHref`, `mainId`, `skipLabel`, `menuLabel`, `navigationLabel`, `navigationId`, `links: {label,href,current?}[]`; project `[nqBrand]` and header actions. Mobile menu is CSS-responsive; provide unique navigationId if repeated. |
| PortalFooter | `brand`, `copyright`, `navigationLabel`, `links`; projected supporting content. |
| Feedback | `label`, `positiveLabel`, `negativeLabel`, `thanksMessage`, `disabled`, `[(value)]` (boolean or null initially). Emits local feedback choice; caller handles storage. |
| CookieConsent | `title`, `description`, `acceptLabel`, `rejectLabel`, `preferencesLabel`, `[(visible)]`; `consent(accepted/rejected)` and `preferences`. Application decides persistence and script gating; this UI does not imply consent has been stored. |
| NotificationList | `label`, `items: {id,title,description?,time?,href?,unread?}[]`, `emptyMessage`, `unreadLabel`, `dismissLabel`; `dismissed(id)`. Caller owns read/dismiss state. |

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
  `[nqSidebar]` and main content. The main pane follows in DOM reading order.
- AspectRatio: numeric `ratio`, default 16/9. Spacer is decorative.
- Section: optional accessible `label`.
- AppShell: `mainId`, `sidebarWidth`, `side`; project `[nqShellHeader]`,
  `[nqShellSidebar]`, default main content, and `[nqShellFooter]`. Contains one main
  landmark; do not nest it inside another main.
- PageHeader: `title` (h1), `description`; `[nqBreadcrumb]` and default actions.

```html
<nq-app-shell mainId="services" sidebarWidth="18rem">
  <nq-portal-header nqShellHeader brand="بوابة الخدمات" mainId="services"
    skipLabel="انتقل إلى المحتوى" menuLabel="القائمة" [links]="navigation" />
  <nav nqShellSidebar aria-label="خدماتي"><!-- native links --></nav>
  <nq-container maxWidth="80rem" [padding]="{base: 4, lg: 8}">
    <nq-stack [gap]="6">
      <nq-page-header title="الخدمات" description="ابحث وابدأ طلبك" />
      <nq-grid [columns]="{base: 1, md: 2, xl: 3}" [gap]="4">
        @for (service of services; track service.href) {
          <nq-service-card [title]="service.title" [href]="service.href"
            [description]="service.description" actionLabel="عرض الخدمة" />
        }
      </nq-grid>
      <nq-date-picker name="date" label="التاريخ" [(ngModel)]="date"
        [(calendar)]="calendar" locale="ar-SA" direction="rtl"
        calendarLabel="التقويم" gregorianLabel="ميلادي" hijriLabel="هجري (أم القرى)"
        openLabel="فتح التقويم" closeLabel="إغلاق التقويم"
        previousLabel="الشهر السابق" nextLabel="الشهر التالي" />
    </nq-stack>
  </nq-container>
  <nq-portal-footer nqShellFooter brand="بوابة الخدمات" />
</nq-app-shell>
```

TextField additionally supports text/email/password/tel/url/search, native
number/range/color, and date/datetime-local/month/week/time. Its value remains a
string; date-related inputs return browser-defined ISO-like values, color returns
an HTML color, and number/range use numeric strings. `min`, `max`, `step`,
`minLength`, `maxLength`, and `pattern` forward native constraints where that input
type supports them. File, checkbox/radio, and form-action inputs have their own
purpose-built controls/native buttons. Use NumberField for `number | null` forms,
and DatePicker for switchable Gregorian/Umm al-Qura display with ISO storage.

Calendar arithmetic comes from the shared core, `@internationalized/date`, and
the table-backed Saudi Umm al-Qura provider. Numeric Hijri dates, including
accessible day labels, come from that table rather than browser ICU conversion.
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
