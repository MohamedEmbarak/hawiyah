# @hawiyah/angular

Angular components for Hawiyah — هوية, a UI library built to comply with the DGA
Platforms Code. Install with `npm install @hawiyah/styles @hawiyah/angular`. This is a
pre-1.0 release, so a minor version may still change its API.

The 85 catalog entries render native HTML with Angular templates. There are no
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
  DataTable keeps its sort state, `aria-sort` and its two sort outputs and leaves the rows
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
control. `error` presents validation feedback; validation decisions belong to the form.
Every value control takes these inputs and outputs:

| Input or output | Type and default | Notes |
| --- | --- | --- |
| `controlId` | `string`; generated | Id of the native control. The application's id wins, then the id of a surrounding `hw-field`, then a generated one that is the same on the server and after hydration. Ids of label, hint and error derive from it. |
| `label` | `string = ''` | Visible label (`label.hw-label`, or the `legend` of a group). Optional: without it no label or legend element is rendered. |
| `name` | `string = ''` | Name under which the value is submitted. |
| `form` | `string \| null = null` | Id of the owning form when the control is not a descendant of it. Written as `form` on every native control the component renders, hidden value inputs included, never on a fieldset. |
| `hint`, `error` | `string = ''` | `<p class="hw-hint" id="{controlId}-hint">` and `<p class="hw-error" id="{controlId}-error">`, after the control, in that order. The application's `error` has no role; a message the component produces itself is rendered in the same element with `role="alert"`. |
| `required`, `disabled` | `boolean = false` | `required` is also inherited from a surrounding `hw-field`. |
| `aria-label`, `aria-labelledby`, `aria-describedby` | `string \| null = null` | Forwarded to the native control, or to the fieldset of a group. See "Attributes on wrapper hosts". |
| `aria-invalid` | `boolean = false` | Forwarded; `aria-invalid="false"` sets nothing. |
| `value`, `(valueChange)` | per control | Also `[(value)]`. |
| `(focused)`, `(blurred)` | `FocusEvent` | A single control emits on the native focus and blur of its control, a group (`hw-radio-group`, `hw-range-slider`, `hw-rating`, `hw-toggle-group`, `hw-multi-select`) when focus enters and leaves its fieldset; moving between two options emits nothing. They fire for read-only controls and never for disabled ones. |

`(focus)` and `(blur)` written on a host never fire, because the native events do
not bubble: use `(focused)` and `(blurred)`. Other native attributes
(`enterkeyhint`, `autocapitalize`, `spellcheck`, `list`, `title`, `tabindex`)
cannot be set on Hawiyah controls in 0.3.0: use a native input with the `hw-`
classes inside `hw-field`.

### Attributes on wrapper hosts

A value control is a wrapper element around the native control it renders. Four
attributes written on the host are inputs of those names and are forwarded to the
native control (the fieldset of a group); they are removed from the host, on the
server too:

```html
<hw-text-field aria-label="الاسم" />
<hw-select [aria-label]="name" aria-describedby="note" [options]="cities" />
<hw-toggle-group aria-labelledby="heading" [options]="views" />
```

Write them as attributes or bind them as `[aria-label]="expr"`;
`[attr.aria-label]` on a wrapper host is not supported. `aria-describedby` on the
control lists the application's ids, the ids of a surrounding field, the hint id
and the error id, in that order and without duplicates. `id`, `class` and `style`
stay on the host, and the inner control keeps `controlId`, so no id is duplicated.
The hosts of form controls are block boxes; `hw-toggle-group` generates no box
(`display: contents`), so its fieldset is the flex or grid item. Both rules leave
`hidden` on a host working.

A control is named, in this order, by `aria-label`, by `aria-labelledby`, by the
label of a surrounding `hw-field`, or by its own `label`. `label` is required text
only where a component cannot be used without a name and none of the other three
is given: `hw-toggle-group`, `hw-search-field` and `hw-file-dropzone` then render
no legend or label and report the missing text once in development.

### Field

`hw-field` renders `div.hw-field > label.hw-label#{id}-label[for={id}]`, the
projected control, `p.hw-hint#{id}-hint` and `p.hw-error#{id}-error`. A Hawiyah
value control declared inside it takes the field's id and is labelled, described,
required and invalid through the field, so it needs no `label`, `controlId` or
`required` of its own:

```html
<hw-field label="الاسم" hint="كما في الهوية" [error]="nameError" required>
  <hw-text-field name="name" [(value)]="name" />
</hw-field>
```

A control that also carries its own `label`, `hint` or `error` gives those
elements ids from its own generated id. The field reaches controls declared in the
same template as the `hw-field`, not controls inside another component's view. A
native control is bound through a template reference:

```html
<hw-field #f label="المدينة" hint="مدينة الإقامة" [error]="cityError" required>
  <select class="hw-select" [id]="f.controlId" [required]="f.required"
    [attr.aria-describedby]="f.descriptionIds" [attr.aria-invalid]="f.invalid ? 'true' : null">…</select>
</hw-field>
```

An application-written control reads the same state from the exported `HW_FIELD`
token (`HwFieldContext`: `controlId`, `label`, `labelId`, `descriptionIds`,
`required`, `invalid`), injected with `{ optional: true, host: true }`.

### Native form reset

A native reset is a value change made by the form. With an Angular Forms directive
on the control (`ngModel`, `formControl`, `formControlName`) the form model owns
the value: the component changes nothing itself and shows what it holds, which is
what `NgForm` and `FormGroupDirective` write on a native reset. Without one, the
value returns to the value the component held after its first inputs, and
`(valueChange)` emits it once, only when it differs from the current value (arrays
are compared by content); Angular has no `defaultValue` input. Read-only and
disabled controls are reset too, and a default-prevented reset does nothing.
Secondary state returns with it: the Combobox list and the SearchField suggestions
close, the PasswordField is hidden, the TagInput draft and the MultiSelect filter
are emptied, a FileDropzone rejection goes away, and `aria-invalid` from a failed
submission is removed. Use `resetForm()` / `FormGroup.reset()` to reset from code.
To keep a value across a reset, handle `(reset)` on the form and call
`preventDefault()`.

### Validation state and the required marker

`aria-invalid="true"` is on the native control (the fieldset of a group) exactly
when the application passes a non-empty `error`; or an explicit `aria-invalid`; or
a submission failed on the control (its `invalid` event fired) and it has not
become valid or been reset since; or the reader committed a value that violates a
constraint the component checks itself (an incomplete PinInput after blur, a
rejected file). It is never set because a required control is still empty before a
submission, and never because a message text is missing: a missing
`requiredMessage` still blocks submission. The `invalid` event is not
default-prevented, so the browser focuses the control and shows its message.

A required control with a visible label shows one marker,
`<span class="hw-required-marker" aria-hidden="true"> *</span>`, as the last child
of its `label.hw-label` or `legend.hw-label`; there is no input for the glyph. The
marker is never the only carrier: text-like controls and the select keep the
native `required`, a radio group has it on each radio, and TagInput and
MultiSelect explain the requirement in their hint. Range inputs take no `required`
attribute, and the single choices (`label.hw-choice` of Checkbox and Switch) show
no marker.

### Changed in 0.3.0 for form controls

Renamed and removed, without aliases:

- `describedBy` (all value controls, `hw-field`) → `aria-describedby`:
  `[describedBy]="id"` → `[aria-describedby]="id"`.
- `hw-radio` / `HwRadioComponent` → `hw-radio-group` / `HwRadioGroupComponent`:
  `<hw-radio …>` → `<hw-radio-group …>`.
- TagInput: the Add button and the input for its text are removed; delete that
  attribute. Enter or comma commits.
- PasswordField: the public field `revealed` → `[(visible)]` / `visible`.

Changed defaults and markup:

- `aria-label`, `aria-labelledby`, `aria-describedby` and `aria-invalid` written on
  a value control are on the native control or fieldset and no longer on the host:
  read them from the inner control, and replace `[attr.aria-label]` on a host by
  `[aria-label]`.
- A native reset without Angular Forms restores the initial value and emits
  `(valueChange)`; it used to empty the DOM and leave the value. Remove handlers
  that copied the model back after a reset.
- A value control inside `hw-field` takes the field's id, label, descriptions,
  required and invalid state: remove the wiring that was repeated on it.
  `hw-field` `controlId` and `label` are optional.
- Labels carry `id="{controlId}-label"` and the required marker; remove asterisks
  written into `label` by hand.
- `hw-textarea` `rows` has no default (was 4): add `[rows]="4"` to keep the height.
- `label.hw-choice` of `hw-checkbox`, `hw-switch` and the options of the radio
  group hold the input and then the text, without a span: `.hw-choice > span` →
  `.hw-choice`.
- `hw-slider` renders its output only with `showValue`; `hw-range-slider` wraps
  each input in its `label.hw-label` and renders its output only with
  `[getRangeLabel]`.
- `hw-toggle-group`: `options` is a required input; `label` is optional with
  `aria-label` or `aria-labelledby`; option text sits directly in the label; the
  hidden value inputs are inside the fieldset
  (`hw-toggle-group fieldset > input[type=hidden]`); the host has
  `display: contents`, so margins and sizes move to a wrapper or the parent.
- `hw-combobox`: `div.hw-field > div.hw-combobox` (was `div.hw-field.hw-combobox`);
  the list id is `{controlId}-listbox` and the input has no `aria-haspopup`;
  `(valueChange)` emits only when the value changed, use `(queryChange)` for the
  typed text; an application write no longer closes the list; `aria-invalid` is
  no longer set while `requiredMessage` is missing (also TagInput, MultiSelect).
- `hw-tag-input`: `div.hw-field > label, div.hw-tag-input > ul, input; hint`
  (was `div.hw-field.hw-tag-input` with `div.hw-input-group`). After a remove
  button is activated, focus goes to the next remove button, else the previous
  one, else the text input.
- `hw-multi-select`: `getResultsMessage` is required; `getSelectedMessage` is
  optional and `p.hw-multi-select-selected` is rendered only with it; the filter
  has a visible `label.hw-label`; read-only checkboxes are enabled with
  `aria-disabled="true"`; rows are `label.hw-choice` with a text node.
- `hw-pin-input` has no `maxlength`.
- `hw-password-field`: a value written by Angular Forms no longer hides the value;
  set `visible` to false after a programmatic `reset()` if needed.
- `hw-search-field`: `showSearchButton` defaults to false; add `showSearchButton`
  (and `searchLabel`) where the button is wanted.
- `hw-file-dropzone`: any rejected file empties the selection; `getRejectedMessage`
  is required with `accept` or `maxSize`; no file list is rendered (project
  `hw-file-upload-list`); `data-state="dragging"` replaces `data-dragging`; the
  root has no `aria-disabled`; `readOnly` keeps the input focusable and submitted;
  only file drags are cancelled.
- `hw-file-upload`: no empty `accept` attribute; projected content follows the
  input.

| Catalog entry / standalone export | Selector and specific API |
| --- | --- |
| Button — `HwButtonDirective` | `button[hwButton]`, `a[hwButton]`; `variant: primary/secondary/ghost/danger`, `size: sm/md/lg`. Native attributes/events/form semantics are preserved. Set button `type` explicitly; anchors require `href` and do not support disabled semantics. |
| Field — `HwFieldComponent` | `hw-field`; optional `controlId` (generated), `label`, `hint`, `error`, `required`, `aria-describedby`. Wraps a Hawiyah value control, which takes its id and state, or a native control bound through a template reference (`#f`: `f.controlId`, `f.labelId`, `f.descriptionIds`, `f.required`, `f.invalid`). See "Field". |
| TextField — `HwTextFieldComponent` | `hw-text-field`; string value, `type`, `placeholder`, `autocomplete`, `inputmode`, `readOnly`; `size: sm/md/lg` (default md), `visualVariant: outline/filled` (default outline) style the native input. The native number input still emits a string; parse at your domain boundary. Text being typed is never rewritten: while a number or date is incomplete the value is `''`, and the input keeps what the user typed. |
| Textarea — `HwTextareaComponent` | `hw-textarea`; string value, `maxLength`, `placeholder`, `readOnly`; `rows` is optional and has no default (the height comes from the stylesheet); `size: sm/md/lg`, `visualVariant: outline/filled` style the native textarea. |
| Select — `HwSelectComponent` | `hw-select`; string value; options through `options: readonly Option[]`, through projected `<option>` / `<optgroup>` elements, which follow them, or both; optional `placeholder` (without it no prompt option is rendered); `size: sm/md/lg`, `visualVariant: outline/filled` style the native select. A bound value selects a projected option, also when it is rendered later. Projected content is not visible to the component: with a projected empty option, leave `placeholder` unset. Native single select; `multiple` is not supported (use `hw-multi-select` or a native select with the `hw-select` class). |
| Checkbox — `HwCheckboxComponent` | `hw-checkbox`; boolean value, `indeterminate`, `readOnly`; `submitValue` is the native value a checked box submits (default: the browser's `on`). The label is `label`, else the projected content, which may hold a link; it follows the input inside `label.hw-choice` without a wrapping span. |
| Radio group — `HwRadioGroupComponent` | `hw-radio-group`; a named native radio group in a fieldset with a legend, string value, `options`, `readOnly`. `fieldset.hw-field > legend.hw-label, label.hw-choice > input.hw-radio + text, p.hw-hint, p.hw-error`; each radio keeps `required`. A single radio option has no Angular component in 0.3.0: use a native input with the `hw-radio` class. |
| Switch — `HwSwitchComponent` | `hw-switch`; boolean value, native checkbox with switch role, `readOnly`; `submitValue` and projected label content as for Checkbox. |
| Combobox — `HwComboboxComponent` | `hw-combobox`; string value, `options`, `placeholder`, `readOnly`; required `emptyMessage` and `getResultsMessage(count)`; `requiredMessage` is required with `required`. `[(open)]`: `open` (a value written once is the initial state; ignored while the control is disabled or read-only) and `(openChange)`, emitted for the reader's actions and for a reset that closed the list, never when the application changes `open`. `(queryChange)` emits the text of every accepted input event; a selection, a reset and application writes do not emit it. `(valueChange)` emits only when the selected value changed. Structure: `div.hw-field > label, div.hw-combobox, p.hw-hint, p.hw-error`, where `div.hw-combobox` holds the input, the hidden input, `ul.hw-listbox#{controlId}-listbox` and the status; hint and error must not be placed inside `.hw-combobox`, because the list is positioned against it. `aria-label` / `aria-labelledby` name the input and the list. Editable single selection; no async or virtualization. |
| Tabs — `HwTabsComponent`, `HwTabComponent` | `hw-tabs` contains `hw-tab`; tabs `label` (the name of the tab list; required unless `aria-label` or `aria-labelledby` is written on `hw-tabs`, see Names), `id`, `[(value)]`, `orientation`, optional `direction`, `activationMode: automatic/manual`, `overflow: menu/scroll` (default menu); `overflowLabel` is required unless `overflow="scroll"`. Each tab takes `value`, `label`, `disabled` and renders its projected content in its own panel: `<hw-tab>` contains the `<section class="hw-tab-panel" role="tabpanel">`, and the shared stylesheet gives `hw-tab` `display: contents`. Compact horizontal containers disclose excess labels; vertical tabs remain visible. |
| Dialog — `HwDialogComponent` | `hw-dialog`; required `title` (the visible heading) and `closeLabel`; `titleId`, `[(open)]`, `closeOnBackdrop`; outputs `cancelled`, `returnValue`; methods `show(trigger?)`, `close(value?)`. `aria-describedby`, `aria-labelledby` (replaces the title as the name) and `aria-label` written on `hw-dialog` are inputs forwarded to the native dialog and removed from the host, static or bound (`[aria-describedby]="id"`); `[attr.aria-*]` on the host is not supported. Describe a dialog by projecting a paragraph with an id and pointing `aria-describedby` at it. Project content and `[hwDialogFooter]`: the footer region is always rendered and the stylesheet hides it while nothing is projected; for a conditional footer wrap the marked element, `@if (canSave) {<div hwDialogFooter>…</div>}`. |
| Accordion — `HwAccordionComponent` | `hw-accordion`; `items: {value,title,content?,open?}[]` (`value` keys the item), `exclusive`, `groupName`; `toggled: {value,open}`. Optional `titleTemplate` and `contentTemplate` (`TemplateRef<{$implicit: HwAccordionItem; index: number}>`) display the title inside the summary and the content inside `div.hw-accordion-content`; `title` stays plain text, and a title template must render text because it names the summary. A click on a link, button or form control inside a rich title does not toggle the item. `aria-label`, `aria-labelledby` and `aria-describedby` written on `hw-accordion` reach `div.hw-accordion`, which then has `role="group"`. Native details/summary. |
| Card — `HwCardComponent` | `hw-card`; project `[hwCardHeader]`, body, `[hwCardFooter]`. |
| Badge — `HwBadgeComponent` | Static label; `tone="neutral\|success\|warning\|danger\|info"`, `variant="soft\|outline\|dot"`; [source and adaptations](../../docs/nic-badges.md). |
| Alert — `HwAlertComponent` | `hw-alert`; `title`, `tone: info/success/warning/danger`, `role: status/alert/region`, `dismissible`; `closeLabel` is required with `dismissible`; `dismissed` asks the parent to remove it. |
| Table — `HwTableComponent` | `hw-table`; `caption` (required unless `aria-label` or `aria-labelledby` is written on `hw-table`; both reach the table), `columns: {key,label,rowHeader?,cell?}[]`, `rows: Record<string, unknown>[]`, optional `rowKey(row, index)`, required `emptyMessage`. A column without `cell` prints the row value as text (nothing for null and undefined); `cell` is a `TemplateRef<{$implicit: Row; index: number; column}>` rendered inside the `td` or `th[scope=row]`. Rows are tracked by `rowKey`, else by index. With a caption the scroll wrapper is `div.hw-table-wrap[role=region][aria-labelledby={caption id}]`; without one it has neither attribute. A row type must be assignable to `Record<string, unknown>`: declare it as a type alias, not an interface. `hw-table` ignores projected `thead` / `tbody`: a table with authored rows is a native table with the `hw-` classes. |
| Pagination — `HwPaginationComponent` | `hw-pagination`; `[(page)]`, `totalPages`; `label` (required unless `aria-label` or `aria-labelledby` is written on `hw-pagination`, see Names) and required `previousLabel`, `nextLabel`, `getPageLabel(page)`, `getGapLabel(start,end)`, `jumpLabel` and `goLabel`; `formatPage(page)`, `siblingCount=1`, `disabled`, `hideOnSinglePage=false`. Ellipsis disclosures are named by `getGapLabel`; gaps above 100 pages use bounded integer entry. On the first and the last page the previous / next arrow has `aria-disabled="true"`, keeps focus and its name and ignores activation; the native `disabled` attribute is used only while the whole control is disabled. Parent fetches/slices data; no navigation or scrolling is imposed. |
| Breadcrumb — `HwBreadcrumbComponent` | `hw-breadcrumb`; `items: {label,href?,current?,disabled?}[]`; `label` (required unless `aria-label` or `aria-labelledby` is written on `hw-breadcrumb`, see Names). The current item is the first item with `current: true`, else the last item; it is `span[aria-current=page]`, never a link and never a tab stop, also when it has an `href`. A disabled item is `span[role=link][aria-disabled=true]` without an `href`. |
| Progress — `HwProgressComponent` | `hw-progress`; `label`, `value: number\|null`, `max`; null is indeterminate. |
| Skeleton — `HwSkeletonComponent` | `hw-skeleton`; `width`, `height`; decorative, hidden from assistive technology. Announce surrounding loading state once. |
| Spinner — `HwSpinnerComponent` | `hw-spinner`; required `label`; status announcement. A spinner the application marks `aria-hidden="true"` is decorative: it passes `label=""`, which satisfies the required input, and nothing is reported. |
| Avatar — `HwAvatarComponent` | Required `name`; optional `src`, `initials`, `size="40\|64\|80\|120\|sm\|md\|lg\|xl"`, `variant="circle\|square"`. Failed images fall back to initials; changing `src` retries. [Source notes](../../docs/nic-avatars.md). |
| Divider — `HwDividerComponent` | `hw-divider`; native horizontal rule. |
| Tooltip — `HwTooltipComponent`, `HwTooltipTriggerDirective` | `hw-tooltip`; required `text`, `placement`, `align`, `tooltipId` (the id of the tooltip element; no id is left on the wrapper). The host is the positioned wrapper (class `hw-tooltip-anchor`) and renders no focusable element of its own. It wraps exactly one focusable element marked `hwTooltipTrigger`: a button, a link, or text with `tabindex="0"`: `<hw-tooltip text="…"><button hwButton hwTooltipTrigger>…</button></hw-tooltip>`, `<hw-tooltip text="…"><span hwTooltipTrigger tabindex="0">term</span></hw-tooltip>`. The trigger gets the class `hw-tooltip-trigger` and `aria-describedby` with its own ids first, then the tooltip id. Focus or hover shows the tooltip; it hides when focus leaves, 120 ms after the pointer leaves, on Escape (focus stays on the trigger) and on a press outside. Without a marked trigger nothing is described; `hwTooltipTrigger` on a Hawiyah wrapper component such as `hw-text-field` is not supported in 0.3.0: mark a native element. |
| FileUpload — `HwFileUploadComponent` | `hw-file-upload`; readonly `File[]` value, `accept` (no attribute without it), `multiple`, `capture: user/environment`, `form`. Projected content follows the input, for example an `hw-file-upload-list`. Selects local files only; no upload occurs. Forms can clear, but browsers forbid programmatically populating file pickers; a native reset empties it and emits `[]` once when files were held. |
| Stepper — `HwStepperComponent` | `hw-stepper`; `items: {value,label,description?,status?}[]`, `current` (the `value` of the current step), `activeIndex` (an index, overrides `current`; -1 not started, `items.length` complete); `label` (required unless `aria-label` or `aria-labelledby` is written on `hw-stepper`, see Names); required `completeLabel` and `upcomingLabel`, rendered as `span.hw-sr-only[data-hw-step-status]` after the label of each complete and each upcoming step (the current step has `aria-current="step"`). With neither `current` nor `activeIndex` no step is current. `li.hw-step > span {label}, span.hw-sr-only, p.hw-hint {description}`. Noninteractive progress list. |
| EmptyState — `HwEmptyStateComponent` | `hw-empty-state`; `title`, `description`, projected actions. |

### Names

Every landmark, group and region takes its accessible name from, in this order:
an `aria-label` from the application, an `aria-labelledby` from the application,
`label`. `label` is required only when neither attribute is given; a component
with no name writes no `aria-label` and reports the missing text once in
development under its selector. With `aria-labelledby` and `label` together, both
are written.

Wrapper components forward `aria-label`, `aria-labelledby` and `aria-describedby`
as inputs of those names (`HwNamedRoot`) to the element that needs them and keep
none on the host, on the server too. Write them as attributes or bind them as
`[aria-label]="expr"`; `[attr.aria-label]` on a wrapper host is not supported.

| Component | Element that receives the name |
| --- | --- |
| `hw-tabs` | `div.hw-tab-list[role=tablist]` |
| `hw-breadcrumb`, `hw-pagination`, `hw-secondary-nav`, `hw-content-navigation` | the `nav` element |
| `hw-stepper` | `ol.hw-stepper` |
| `hw-popover` | `div.hw-popover-panel[role=region]` |
| `hw-menu` | `div.hw-menu-content[role=menu]` |
| `hw-carousel` | `section.hw-carousel[role=region]` |
| `hw-accordion` | `div.hw-accordion`, which then has `role="group"` (no `label` input) |
| `hw-table`, `hw-data-table` | the `table` (the caption is the visible name) |
| `hw-dialog`, `hw-drawer` | the native `dialog` (`title` is the default name) |
| `hw-tree-view`, `hw-calendar` | `ul[role=tree]`, `table.hw-calendar-grid`; also named by a surrounding `hw-field` |

```html
<h2 id="results-heading">النتائج</h2>
<hw-pagination aria-labelledby="results-heading" [(page)]="page" [totalPages]="12" … />
<hw-popover aria-labelledby="filters-title" triggerLabel="التصفية"><h3 id="filters-title">تصفية النتائج</h3>…</hw-popover>
```

`hw-side-navigation` / `nav[hwSideNavigation]` is the host-root case: the element
itself is the landmark, so `aria-label` and `aria-labelledby` written on it, also
with `[attr.aria-label]`, stay on it and name it. While `label` is given it is
written as the `aria-label` of the element and the application's own value
returns when `label` is removed: give one source of the name.

### Trigger

Popover and Menu render their own trigger button, named by the required
`triggerLabel` and styled by `triggerVariant` (default `secondary`; any Button
variant). The trigger is text only in 0.3.0: the application's own element cannot
be projected as the trigger.

### Changed in 0.3.0 outside form controls

Renamed and removed, without aliases:

- `hw-dialog`, `hw-drawer`: `describedBy` → `aria-describedby`:
  `[describedBy]="id"` → `[aria-describedby]="id"`.
- `hw-date-picker`: `[describedBy]="id"` → `[aria-describedby]="id"`; the element
  `#<id>-date-error` → `#<id>-error`.
- Accordion: `HwAccordionItem.id` → `value` (`{id: 'a', …}` → `{value: 'a', …}`);
  `(toggled)` emits `{value, open}` (`$event.id` → `$event.value`).
- Stepper: `[steps]="x"` → `[items]="x"`; every step needs a `value`
  (`{label: 'Details'}` → `{value: 'details', label: 'Details'}`); `current` is
  the value of the current step (`[current]="1"` → `[activeIndex]="1"`); add
  `completeLabel="…"` and `upcomingLabel="…"`.
- DataTable: `(sortChange)="f($event)"` → `[(sortKey)]="key"
  [(sortDirection)]="direction"`, or `(sortKeyChange)` and `(sortDirectionChange)`.
- Menu: `HwMenuItem.id` → `value` (`{id: 'edit', …}` → `{value: 'edit', …}`);
  `.hw-menu-panel` → `.hw-menu-content`.
- TreeView: `[nodes]="x"` → `[items]="x"`; `[(expandedIds)]="e"` →
  `[(expanded)]="e"`; add `[getExpandLabel]="fn"` and `[getCollapseLabel]="fn"`;
  `span.hw-tree-toggle` → `button.hw-tree-toggle`.
- PortalHeader: the public field `menuOpen` → `open` (`header.menuOpen` →
  `header.open`, or bind `[(open)]`); `a.hw-portal-brand:not([href])` →
  `div.hw-portal-brand`.
- ServiceCard: `duration="3 days" fee="Free"` → `[metadata]="[{term, description}, …]"`.
  ServiceDetails: `[details]` → `[metadata]`.
- Calendar with `calendar="islamic-umalqura"`: add `unsupportedMessage="…"`.

Changed defaults and markup:

- Tooltip: the host is the wrapper and the projected element marked
  `hwTooltipTrigger` is the trigger: `<hw-tooltip text="T">term</hw-tooltip>` →
  `<hw-tooltip text="T"><span hwTooltipTrigger tabindex="0">term</span></hw-tooltip>`;
  for a control `<hw-tooltip text="T"><button hwButton hwTooltipTrigger>…</button></hw-tooltip>`.
- Popover and Menu: the packaged trigger is a secondary button; add
  `triggerVariant="primary"` to keep the old look. Both close when focus moves
  outside them.
- `label` is optional with `aria-label` or `aria-labelledby` on the components
  listed under Names; replace `[attr.aria-label]="x"` on a wrapper host by
  `[aria-label]="x"`.
- DatePicker: the produced message is `p#<id>-error.hw-error[role=alert]` after
  the hint; the label has an id and the required marker.
- Calendar: the tab stop of an empty calendar is today when it is shown and
  available (was the first day of the month).
- Carousel and Pagination: the arrow at a bound is `aria-disabled="true"` and
  focusable, no longer `disabled`: `[data-hw-next]:disabled` →
  `[data-hw-next]:is(:disabled, [aria-disabled='true'])`.
- Table and DataTable: the wrapper is named by `aria-labelledby` = the caption id
  (`.hw-table-wrap[aria-label]` → `.hw-table-wrap[aria-labelledby]`); an empty
  caption is not rendered; cells of a column without `cell` are unchanged.
- Stepper: `.hw-step small.hw-hint` → `.hw-step > p.hw-hint`; without `current`
  and `activeIndex` no step is current (was the first).
- Breadcrumb: `current: true` on an item chooses the current page; the last item
  is the default.
- TreeView: items carry `--hw-tree-depth` and no inline padding; the tree and its
  hint and error use the ids of the other value controls (`{id}-hint`, `{id}-error`).
- ServiceCard: `article > header.hw-card-header, div.hw-card-body,
  footer.hw-card-footer`; the title is no longer a link, `href` is optional and the
  packaged action is `a.hw-link`, rendered only with `href`. Project
  `<a hwButton variant="secondary" hwServiceAction href="…">` to keep a button.
- ServiceDetails: the root is an `article`; requirements are `section > h3 + ul`
  (`.hw-service-details > ul` → `.hw-service-details > section > ul`); the
  description paragraph is rendered only when given; facts are a stacked
  description list; actions go into the footer:
  `<button hwButton>Start</button>` → `<button hwButton hwServiceAction>Start</button>`.
- Dialog and Drawer: an empty footer region is hidden by the stylesheet.

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
  such method. `required`, `aria-invalid` from `error` and messages are in the server markup.
- The forwarded `aria-label`, `aria-labelledby`, `aria-describedby` and
  `aria-invalid` are on the inner control in the server markup and not on the
  host. No reset, focus or invalid handling runs on the server: the form of a
  value control is observed after the first render in the browser. State that
  only an interaction produces starts empty on both sides: no `aria-invalid`
  from a failed submission, no rejection message, empty status elements.
- A Combobox with `open` and a PasswordField with `visible` render open and
  visible on the server as on the client. Projected options of `hw-select` and
  projected content of `hw-file-upload` and `hw-file-dropzone` are in the server
  markup; the selection of a projected option is applied on hydration.
- Dialog, Drawer, NavigationDrawer and the DatePicker dialog are rendered closed.
- CopyButton is rendered idle, with its empty status element. It reads no
  `navigator`, starts no timer and does not call a `text` function until the
  reader activates it.
- SideNavigation and NavigationDrawer render the whole list, with `open` on the
  groups that hold the current page or are expanded and `aria-current="page"`
  on the current link, so a prerendered page shows the right group open before
  hydration. Nothing is measured or scrolled on the server.
- The layout hosts carry their class and custom properties in the server markup.
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

The combobox is local and single-select. Table and DataTable take a `cell`
template per column and Accordion a `titleTemplate` and a `contentTemplate`; no
component accepts an HTML string.

```html
<hw-accordion [items]="questions" [titleTemplate]="title" [contentTemplate]="answer" />
<ng-template #title let-item let-index="index">{{ index + 1 }}. {{ item.title }}</ng-template>
<ng-template #answer let-item><p>{{ item.content }}</p><a [href]="item.href">{{ item.linkText }}</a></ng-template>

<ng-template #reference let-row><a [href]="row.href">{{ row.id }}</a></ng-template>
<hw-table caption="الطلبات" emptyMessage="لا توجد طلبات" [rowKey]="byId" [rows]="rows"
  [columns]="[{key: 'id', label: 'المرجع', rowHeader: true, cell: reference}, {key: 'title', label: 'العنوان'}]" />
```

## Expanded components

Every component below is standalone, exported as `Hw{Name}Component`, and uses
`hw-kebab-case` selectors. Value controls support both `[(ngModel)]`/reactive forms
and `[(value)]` (choose one), with inherited `controlId`, `label`, `name`, `hint`,
`error`, `required`, `disabled`, and `readOnly`. An optional `label` or
`placeholder` that is absent renders nothing: no empty `<label>` or `<legend>` and
no empty `placeholder` attribute. Calendar, DatePicker, FileDropzone, SearchField,
ToggleGroup and TreeView cannot be used without a name: `label` is required unless
`aria-label`, `aria-labelledby` or a surrounding `hw-field` gives one, and a
missing name is reported once in development. Angular form reset clears string
and array controls, empties NumberField, restores Slider to `min`, and RangeSlider
to `[min,max]`. Native range, radio, and checkbox controls retain browser keyboard
behavior. Readonly controls retain submitted values where HTML permits it.

| Component | Inputs, outputs and composition |
| --- | --- |
| InputGroup | Project `[hwPrefix]`, a labeled native/control input, and `[hwSuffix]`; `size: sm/md/lg`. Addons remain ordinary content, so label decorative icons appropriately. |
| PasswordField | String value; `autocomplete`, `placeholder`; required `showLabel` and `hideLabel`. `[(visible)]`: `visible` (false; a value written once is the initial state) and `(visibleChange)`, emitted once per activation of the toggle and when a native reset hides a visible value, never when the application changes `visible`. The toggle keeps the same input and is ignored while the input is disabled. A value written by Angular Forms does not change visibility. |
| SearchField | String value/CVA; `label` (required unless `aria-label` or `aria-labelledby` names the input); `placeholder`, `autocomplete`, `autofocus`; required `clearLabel`; `showSearchButton` (false) renders the search button, and `searchLabel` names it and is required only while it is on; Enter runs the search without the button. Optional `suggestions`, `maxSuggestions` (8), and with suggestions `getResultsMessage(count)`. The suggestion list takes the name of the input; `searched(query)` output and public `focus()`. |
| NumberField | `number \| null` value; `min`, `max`, `step` (number or `any`). Empty/invalid native numeric input maps to null. Text that is not yet a number (`-`, `1e`) emits null and stays in the input, so `-5` and `1e2` commit -5 and 100. Native step/min/max validation remains active. |
| Slider | Number value (the initial value is the `value` input, default 0; a null write restores `min`); `min`, `max`, `step`, `readOnly`. `showValue` (false) renders `output.hw-slider-value` after the input, with `formatValue(value)` when given, else the value as it is. `aria-valuetext` is written only when `formatValue` is given. `required` shows the marker and is not written on the range input. |
| RangeSlider | `[lower,upper]` (a null write restores `[min, max]`); `min`, `max`, `step`, required `lowerLabel` and `upperLabel` (visible), `lowerName`, `upperName`; optional `formatValue(value)`, which gives each thumb its `aria-valuetext`, and `getRangeLabel(lower, upper)`, the visible text of the range: no number format and no separator is built in. `fieldset.hw-field.hw-range-slider > legend.hw-label, label.hw-label { lowerLabel, input.hw-slider#{id}-lower }, label.hw-label { upperLabel, input.hw-slider#{id}-upper }, output.hw-range-slider-value (only with getRangeLabel), p.hw-hint, p.hw-error`. Crossing thumbs stop at the other value; absent distinct names, `name` submits two ordered values. |
| Rating | Numeric value, `max` (1–20), required `getRatingLabel(value,max)`; named native radio choices. |
| `HwRatingDisplayComponent / hw-rating-display` | Numeric `value=0`, `max=5` (1–20), `showValue=true`, required `getValueLabel(value,max)`, which returns the whole text alternative (for example the subject and its score); noninteractive fractional aggregate score with one accessible image name. |
| PinInput | String value, `length`; one numeric input with `one-time-code` autocomplete and `pattern="[0-9]{N}"`. Typed, pasted, dropped and autofilled text is normalised before the length is applied: Arabic-Indic and Persian digits become ASCII, every other character is dropped, then the code is cut to `length`, so separators cost no digit. The input carries no `maxlength`; one more character typed into a full code changes nothing. An incomplete code is `aria-invalid` after blur until it is complete, empty or reset. |
| TagInput | `string[]`; `placeholder`; required `getRemoveLabel(tag)`; `requiredMessage` is required with `required`. `div.hw-field > label.hw-label, div.hw-tag-input, p.hw-hint, p.hw-error`; the box holds only `ul[role=list]` (always rendered) and the text input; a chip is `li.hw-chip` with the tag, a bare remove button and a hidden input. Enter or comma commits a unique trimmed tag; there is no Add button; Backspace in an empty draft removes the last tag and keeps focus in the input. After a remove button is activated, focus goes to the next chip's remove button, else the previous one, else the text input. Read-only and disabled render the remove buttons disabled. A required TagInput explains the requirement in its hint. |
| MultiSelect | `string[]`; `options: Option[]`; required `searchLabel` (the visible label of the filter input, not a placeholder), `emptyMessage` and `getResultsMessage(count)`, which is announced politely after the reader filters (the status exists, empty, from the first render); optional `getSelectedMessage(count)`, with which `p.hw-multi-select-selected[role=status]` is rendered; optional `placeholder`; `requiredMessage` is required with `required`. `fieldset.hw-field.hw-multi-select > legend.hw-label, label.hw-label[for], input.hw-input[type=search], div.hw-multi-select-options > label.hw-choice > input.hw-checkbox + text, span.hw-sr-only[role=status], p.hw-multi-select-selected, input[type=hidden] per selected value, p.hw-hint, p.hw-error`. Selected values remain in FormData when the filter hides their checkboxes. Read-only keeps the checkboxes focusable (`aria-disabled="true"`, not disabled), ignores pointer and Space, and keeps filtering and submission. `aria-invalid` is on the fieldset and the filter input. A required MultiSelect explains the minimum in its hint. |
| Calendar | ISO Gregorian string value; `month`, `min`, `max`, `calendar: gregory/islamic-umalqura`, `weekStartsOn`, `direction`; required `locale`, `previousLabel` and `nextLabel`; `label` names the grid and is required unless `aria-label`, `aria-labelledby` (both forwarded to `table.hw-calendar-grid`; `aria-describedby` joins the hint and error ids there) or a surrounding `hw-field` names it. `rangeLabel` and `unsupportedMessage` are required with `calendar="islamic-umalqura"`: `rangeLabel` names the supported-range information, one focusable `span[role=img]` described by its tooltip (id `rangeTooltipId`); `unsupportedMessage` is announced through the one `p.hw-sr-only[role=status]` after the grid, which is present and empty from the first render, while the value is outside the Umm al-Qura range. Optional `isDateDisabled(isoDate)`: a rejected day is a disabled button, is never the tab stop and is passed over by the arrow keys (the predicate runs while rendering, on the server too, and must be pure). Optional `getDayLabel(isoDate)` replaces the Intl day name; `monthChange`. `locale` has no default: while it is empty the toolbar and the grid are not rendered. The tab stop is the day that last had focus, the selected day, today, the first day of the month, the first available day. Grid supports RTL-aware arrows, Home/End, PageUp/Down and Shift+PageUp/Down (year). Bounds restrict selection/focus. A native reset returns the value and the month. A standalone calendar renders no Gregorian/Hijri switch. |
| DatePicker | ISO Gregorian value, a custom text field and modal calendar. Accepts Calendar range inputs, `isDateDisabled(isoDate)` and `getDayLabel(isoDate)`. `label` is required unless `aria-label`, `aria-labelledby` or a surrounding `hw-field` names the input; `aria-describedby` and `aria-invalid` are forwarded to the input as well. Required: `locale`, `calendarLabel` (dialog title and name of the calendar), `openLabel`, `closeLabel`, `previousLabel`, `nextLabel`, `calendarSystemLabel` (name of the Gregorian/Hijri switch, which belongs to the picker), `gregorianLabel`, `hijriLabel`, `rangeLabel`, `invalidMessage` and `unsupportedMessage`; `unavailableMessage` is required with `isDateDisabled`. `placeholder` is optional and has no default. The message for a typed date that is malformed, outside `min`/`max`, outside the calendar's range or rejected by `isDateDisabled` (checked in that order) is the one `p.hw-error#{id}-error` after the hint, with `role="alert"` and ISO dates in `bdi[dir=ltr]`; the application's `error` replaces it there, without a role. The same text is the input's custom validity; a missing text still blocks submission. Order: label (with id and required marker), control, hint, error. Angular Forms errors: `required`, `calendarUnsupported`, `calendarUnavailable: {actual}`, `calendarDate`. `locale` has no default: while it is empty the typed ISO date is shown as typed, no formatted date is announced and the calendar in the dialog is empty; the value and validation are unaffected. `output.hw-date-picker-value` announces the full date with the weekday. Switching emits `calendarChange` and preserves the selected ISO date. Opening moves focus to the selected day, or today; closing returns it to the opener. A native reset returns the value, the draft and the month, closes the dialog and clears the message. |
| FileDropzone | `File[]`; `accept`, `multiple`, `maxSize` (bytes), `capture`, `form`, `readOnly`; `label` (required unless `aria-label`, `aria-labelledby` or a surrounding field names the input) and required `dropLabel` (the visible instruction, which describes the input and never names it); optional `getSelectedMessage(files)`, which when bound renders one visible `<p role="status">` after the input, empty until files are selected; `getRejectedMessage(rejected)`, required when `accept` or `maxSize` is set. One root: `div.hw-field.hw-file-dropzone[data-state=dragging\|error][data-hw-readonly=true] > label.hw-label, p.hw-file-dropzone-instruction#{id}-instruction, input[type=file], p[role=status], projected content, p.hw-hint, p.hw-error`. The dropzone renders no file list; compose `hw-file-upload-list` as projected content. A batch replaces the selection, and a batch with any rejected file (type, size, or more than one file without `multiple`) leaves the dropzone empty: `(rejected)` emits the rejected files once and `(valueChange)` emits `[]` only if files were held. The rejection is rendered as the one `p.hw-error` with `role="alert"` and marks the input `aria-invalid` until the next accepted selection or a reset; it sets no custom validity and does not block submission, and validation on the server stays the application's task. Only file drags are cancelled; over a disabled or read-only zone the drop effect is `none` and a drop changes nothing. `readOnly` keeps the input enabled, focusable and submitted with `aria-disabled="true"`, and blocks the chooser and drops; use `disabled` to exclude the files. Native picker and local drop handling; no upload/network side effect. Forms can clear files but cannot populate a picker from a stored path. |
| ToggleGroup | `label` (the legend; required unless `aria-label` or `aria-labelledby` names the group: without a name no legend is rendered and one warning is reported), `labelHidden` (false), `hint`, `error`, `required`, `name`, `form`, `readOnly`, required `options`, `variant: segmented/outline`; string value for single (empty value `''`) or `string[]` for `multiple` (empty value `[]`). Single: `label > input[type=radio] + text` per option, without class or span; multiple: `button.hw-button[data-variant=secondary][data-size=md][aria-pressed]` per option after a disabled hidden input that carries `form`, and one hidden input per selected enabled value inside the fieldset after hint and error. `required` applies to single selection: the radios carry `required`, the legend shows the marker, and a failed submission sets `aria-invalid` on the fieldset until an option is chosen or the form resets; on a multiple group it is not enforced (use MultiSelect or the application's `error`). A reset emits the initial selection once when it changed. `labelHidden` adds `hw-sr-only` to the legend, which stays the first child of the fieldset and the accessible name of the group. Hide the label only where the option texts make the purpose visible, as in a toolbar. |
| Popover | Required `triggerLabel`; `label` is the accessible name of the panel and prints nothing (required unless `aria-label` or `aria-labelledby` is written on `hw-popover`, see Names; a visible heading is written in the content and referenced with `aria-labelledby`); `triggerVariant` (default `secondary`), `panelId` (the id of the panel; no id is left on the wrapper), `disabled`, `[(open)]` (a value written once is the initial state); project interactive content into `div.hw-popover-panel[role=region]`. The content closes it through a template reference: `<hw-popover #p …><button (click)="p.close(true)">…`. Ordinary Tab order; closes on Escape pressed inside it (focus returns to the trigger), on an outside press and when focus moves outside (focus stays where it went). See Trigger. |
| Menu | Popover inputs plus `items: {value,label,disabled?,href?}[]` and `(action)`, which emits `item.value` once. `div.hw-menu > button, div.hw-menu-content[role=menu] > button.hw-menu-item[role=menuitem]`, or `a.hw-menu-item[role=menuitem][href]` for an item with `href` (a disabled link item has no `href` and `aria-disabled="true"`); no list wrapper. Trigger: click, Enter or Space toggles and focuses the first enabled item; ArrowDown opens on the first, ArrowUp on the last enabled item. Menu: ArrowDown/ArrowUp/Home/End move over enabled items; a typed letter moves to the next enabled item that starts with it (letters typed within 500 ms form a prefix, a repeated letter cycles, an unmatched key keeps its default action); Escape closes and focuses the trigger; Tab, an outside press and focus moving outside close without moving focus. Activation closes the menu and focuses the trigger; a link item then navigates. When the application sets `open`, the first enabled item becomes the tab stop and takes focus after the render. See Trigger. |
| Drawer | Dialog inputs/outputs/methods (including the required `closeLabel` and the forwarded `aria-describedby`, `aria-labelledby` and `aria-label`) plus `side: start/end/bottom`; project body and `[hwDrawerFooter]`, whose region is hidden while nothing is projected. Native modal dialog with the markup of Dialog and the classes `hw-dialog hw-drawer`. |
| ToastRegion | `messages: {id,title?,message,tone?,urgent?,dismissible?}[]`, required `label`, `(dismissed)="remove($event)"`. Set `variant="banner"` and optionally `position="inline"` or a corner. A dismissal listener enables the button, which is named by `getDismissLabel(message)`, required while messages can be dismissed. |
| Collapsible | `label`, `[(open)]`, `disabled`; native details/summary and projected body. While disabled the summary has `aria-disabled="true"`, stays in the tab order and keeps its name; click, Enter and Space change nothing and notify nothing, and `open` still follows the application. |
| TreeView | String selection; `items: {id,label,disabled?,children?}[]`, `[(expanded)]` (ids of the expanded branches; a value written once is the initial state), `direction`; `label` names the tree and is required unless `aria-label`, `aria-labelledby` or a surrounding `hw-field` names it. Required `getExpandLabel(node)` and `getCollapseLabel(node)` name `button.hw-tree-toggle`, the first child of a branch item: it is for pointer and screen-reader activation, has `tabindex="-1"`, expands or collapses without selecting and leaves focus on the tree item; it also works in a read-only tree. Each item is named by its label element (`aria-labelledby`) and carries `--hw-tree-depth` for its indentation. Roving focus, RTL arrows, Home/End, Enter/Space selection, and type-ahead over the visible nodes (as in Menu). `name`, `form`, `readOnly`, `hint`, `error` and the native reset exist in Angular only in 0.3.0. Caller supplies unique IDs. |
| Carousel | Required slides; `label` names the region (required unless `aria-label` or `aria-labelledby` is written on `hw-carousel`; both and `aria-describedby` reach `section.hw-carousel`); `[(current)]`, `loop=false`, `slides` and optional `slideTemplate` with `{ $implicit: HwSlide, index }`, required one-based `getSlideLabel(position,total)`, `previousLabel`, `nextLabel` and `emptyLabel`. `showIndicators=true` needs `indicatorsLabel`; `carouselDescription` and `slideDescription` (`aria-roledescription`) are optional and rendered only when supplied. On the first and the last slide of a carousel that does not loop the previous / next arrow has `aria-disabled="true"`, keeps focus and ignores activation; both arrows are natively disabled only with fewer than two slides. Inert inactive slides, explicit navigation and no autoplay. [Source and motion notes](../../docs/nic-carousel.md). |
| Link | `href`, `target`, `rel`, `current`, `variant: default/subtle`; projected link text. `_blank` defaults to `noopener noreferrer`. |
| IconButton | Required accessible `label`; `type`, `disabled`, `pressed`, `variant`, `size`; `activated(MouseEvent)`. Project a decorative icon. |
| ButtonGroup | `label`, `orientation: horizontal/vertical`; project native buttons or IconButtons. |
| Chip | `tone`, `variant`, `removable`, `disabled`; `removeLabel` is required with `removable`; `removed` asks the caller to remove it. |
| DescriptionList | `items: {term,description}[]`, `variant: stacked/horizontal`; project richer native dt/dd if needed. |
| Stat | `label`, `value`, `description`, `tone`; projected supplemental content. |
| Timeline | Required `label`, `items: {title,description?,time?,dateTime?,state?}[]`; state is complete/current/pending. |
| Meter | `label`, `value`, `min`, `max`, `low`, `high`, `optimum`; native meter for bounded measurements. |
| AvatarGroup | Required `label` and `getOverflowLabel(count)` (count is the number of hidden avatars); `avatars: {name,src?}[]`, `max`; named image/initials with overflow count. |
| DataTable | Required `caption`, `columns: {key,label,sortable?,rowHeader?,cell?}[]`, `rows: Record<string, unknown>[]`, optional `rowKey(row, index)`, required `locale` (BCP 47 tag for sorting; no default) and `emptyMessage`; `[(sortKey)]` and `[(sortDirection)]` (`ascending` / `descending`; values written once are the initial state), optional `getSortLabel(column,direction)` (the name of a sort button; direction is the order it will apply). Activating a sortable header reports `(sortKeyChange)` when the key changed, then `(sortDirectionChange)` when the direction changed. `cell` is a `TemplateRef<{$implicit: Row; index: number; column}>` rendered inside the `td` or `th[scope=row]`; without it the value is text. `div.hw-table-wrap.hw-data-table[role=region][aria-labelledby={caption id}] > table.hw-table > caption#{id}`; `aria-label`, `aria-labelledby` and `aria-describedby` written on `hw-data-table` reach the table. Stable sorting in the application's locale, native headers and aria-sort. Row types as for Table. |
| ServiceCard | Required `title`; `description`, `category`, `metadata: {term,description}[]` (service facts, one stacked `dl.hw-description-list`), `variant`, `href`. `article.hw-card.hw-service-card > header.hw-card-header { div.hw-service-card-icon, div { span.hw-badge, h3 } }, div.hw-card-body { p, dl, default content }, footer.hw-card-footer`. The title is text, not a link. One action per card: content projected with `[hwServiceAction]`, or, with `href` and no projected action, a packaged `a.hw-link` whose whole text and accessible name is `actionLabel` (required in that case only; the card appends nothing to it, so include the service name where several cards share a page). Without `href` and without an action the footer is empty and hidden. Project `[hwServiceIcon]` and supplemental body. |
| ServiceDetails | Required `title`; `description`, `metadata: {term,description}[]`, `requirements: string[]`, optional `requirementTemplate` (`TemplateRef<{$implicit: string; index: number}>`) for rich entries; `requirementsLabel` is required with requirements. `article.hw-service-details > header { h2, p }, dl.hw-description-list, section { h3, ul }, default content, footer`. The action is projected with `[hwServiceAction]` into the footer, which is hidden while empty and keeps a button at its own width. For horizontal facts compose `hw-description-list variant="horizontal"` in the default content. |
| PortalHeader | Required `menuLabel` and `navigationLabel`; optional `brand` text, `brandLabel`, `homeHref`, `mainId`, `skipLabel`, `navigationId`, `links: {label,href,current?}[]`; `[(open)]` is the disclosure of the navigation below 48rem (`(openChange)` once per change by the reader, none when the application changes it; `close()` closes it and the open branch); project `[hwBrand]` artwork and header actions. The brand may be artwork alone: no brand text is printed unless `brand` is supplied, and `brandLabel` gives artwork its accessible name (`aria-label` on the brand). An empty `homeHref` renders the brand as `div.hw-portal-brand`, with `role="img"` and the name while `brandLabel` is given. The skip link is rendered only when `mainId` is set, and then needs `skipLabel`. Mobile menu is CSS-responsive; provide unique navigationId if repeated. Optional top-level `groups` contain a label and child links; one press on another group heading opens it and closes the open one. See [grouped navigation](../../docs/nic-portal-navigation.md). |
| PortalFooter | Required `externalLabel` (screen-reader text added to links marked external); `brand`, `brandLabel`, `description`, `copyright`, `links`, `groups`, `legalLinks`; `navigationLabel` is required with `links`, `legalLinksLabel` with `legalLinks`, and `supportLabel` with projected `[hwFooterSupport]` content, the only case in which the support section is shown (otherwise it stays in the document with the `hidden` attribute, no heading and no name). `brandLabel` is written, as `aria-label` with `role="group"`, on `.hw-portal-footer-brand-marks`, which holds the `[hwFooterBrand]` artwork followed by the `brand` text, and only while that group has either; the description is outside the group, and without `brandLabel` no role and no name are rendered. Project `[hwFooterBrand]`, `[hwFooterSupport]`, `[hwFooterPartners]` and supplementary content. |
| Feedback | Required `label`, `yesLabel`, `noLabel` and `successMessage`; `disabled`, `[(value)]` (boolean or null initially). Emits local feedback choice; caller handles storage. |
| CookieConsent | Required `title`, `acceptLabel` and `rejectLabel`; `description`, `[(visible)]`; `consent(accepted/rejected)` and `preferences`. The preferences button is rendered while a `(preferences)` listener is bound and then needs `preferencesLabel`; a policy link is rendered with `policyHref` and then needs `policyLabel`. Application decides persistence and script gating; this UI does not imply consent has been stored. |
| NotificationList | Required `label`, `emptyMessage` and `unreadLabel`; `items: {id,title,description?,time?,href?,unread?}[]`; `dismissed(id)`. The dismiss button is rendered while a `(dismissed)` listener is bound and is named by `getDismissLabel(item)`. Caller owns read/dismiss state. |
| FileUploadList | `items: FileUploadItem[]`, `removable`, `disabled`; required `labels: FileUploadLabels` from `@hawiyah/core`: the status words `selected`, `uploading`, `complete`, `error`, the visible `remove` text, and `getProgressLabel(name)` and `getRemoveLabel(name)` for the progress bar and the remove button. `remove(id)` asks the owner to remove an item. |
| SiteVerification | Required `label`, `detailsLabel`, `domainLabel`, `domainDescription`, `httpsLabel` (include the protocol name in it) and `httpsDescription`; `domain`, `[(open)]`; `registrationHref` needs `registrationLabel`, and `externalLabel` while `registrationExternal` is on; `registrationNumber`. There is no `locale` input. |
| MobileTopBar | Required `title`; `subtitle`, `variant`, `headingLevel`; `backHref` needs `backLabel`. Project `[hwTopBarLeading]` and `[hwTopBarActions]`. |
| NavigationDrawer | Required `title`, `navigationLabel` and `closeLabel`; `titleId`, `items`, `side`, `[(open)]`, `closeOnBackdrop`. Items are `HwNavigationDrawerItem[]` (see Side navigation); a group is open when it holds the current page or has `expanded: true`. |
| `HwSideNavigationComponent / hw-side-navigation, nav[hwSideNavigation]` | Required `items`; `label` (required unless the element itself carries `aria-label` or `aria-labelledby`, see Names); `sticky` (false). The page list of NavigationDrawer outside a drawer. No outputs. See Side navigation. |
| `HwCopyButtonComponent / hw-copy-button` | Required `text`, `label`, `copiedMessage` and `failedMessage`; `display: icon/text`, `variant` (ghost), `size` (md), `feedbackDuration` (3000), `disabled`; output `copyResult`. See Copy button. |

The national platform patterns are configurable ordinary application content. They
provide no seals, government endorsement, identity verification or connected
service transactions. Strings are escaped Angular interpolation throughout.

## Responsive composition

Container, Stack, Inline, Grid, Columns, Sidebar, Center, Spacer, AspectRatio,
Section, AppShell and PageHeader are native layout components. Shared props:
`gap`, `padding`, `align`, `justify`, `wrap`; spacing accepts token numbers 0–16
or CSS lengths. `gap`/`padding` and `columns` accept `{base,sm,md,lg,xl}` objects.
Breakpoints live in CSS (40/48/64/80rem), so server/client layout markup matches.
`wrap` is a boolean: the bare attribute (`<hw-inline wrap>`) means true, and an
unset input writes nothing.

The host element is the layout box. `hw-container`, `hw-stack`, `hw-inline`,
`hw-grid`, `hw-columns`, `hw-sidebar`, `hw-center`, `hw-spacer`,
`hw-aspect-ratio`, `hw-section` and `hw-app-shell` carry their `hw-` class and
the layout custom properties themselves, and their template is the projected
content alone: there is no inner `div`. `class`, `id`, `style`, `aria-*` and
`data-*` (`data-variant` on Container, `data-fit` on AspectRatio, `data-tone`
on Section) written on the element therefore sit on the element the stylesheet
styles, and the projected elements are the direct children of the flex or grid
box. PageHeader is the exception: its host wraps `<header class="hw-page-header">`,
because a host cannot be a `header` element.

Each primitive whose attribute name is free also matches a native element, which
then is the box and keeps its tag: `hwContainer`, `hwStack`, `hwInline`,
`hwGrid`, `hwColumns`, `hwCenter`, `hwAspectRatio` and `hwSection`. Sidebar,
Spacer, AppShell and PageHeader have the element selector only.

```html
<ul hwStack [gap]="2"><li>الأول</li><li>الثاني</li></ul>
<section hwSection label="ملخص الطلب" [padding]="4">…</section>
```

- Container: `maxWidth`.
- Grid/Columns: `columns`, `minItemWidth` (adaptive auto-fit).
- Sidebar: `sidebarWidth`, `side: start/end`, `collapseAt: sm/md/lg`; project
  one element marked `[hwSidebar]` and one content element. They are the two
  children of the host grid, the sidebar first whatever the source order; no
  `aside` and no `div` is added, so use the element that fits (`nav`, `aside`).
- AspectRatio: numeric `ratio`, default 16/9. Spacer is decorative.
- Section: optional accessible `label`, written as `aria-label`. `hw-section`
  with a label also gets `role="region"`; `<section hwSection label="…">` is a
  native landmark and gets no role. An `aria-label` or `role` that the
  application writes or binds on the element (`[attr.aria-label]`) is kept;
  `label` takes its place only while it is set.
- AppShell accepts `mainId`, the required `skipLabel`, `sidebarWidth` and `side`. Project
  `[hwShellHeader]`, `[hwShellSidebar]`, default main content and `[hwShellFooter]`.
  The skip link focuses the main landmark, whose default ID is `main-content`.
  The children of the host are the skip link, `div.hw-app-shell-header`,
  `aside.hw-app-shell-sidebar`, `main.hw-app-shell-main` and
  `div.hw-app-shell-footer`, the same region elements React and Vue render. The
  shell renders no `header` and no `footer` element: the banner and contentinfo
  landmarks come from what the application projects (`hw-portal-header`,
  `hw-portal-footer`, or its own `header` and `footer`). The three projected
  regions are always rendered, because Angular cannot tell whether content was
  projected; the stylesheet hides an empty one, so omitted regions leave the
  main area at full width.
- PageHeader: `title`, `description`, `level` (1 to 6, default 1: the heading
  element of the title; values are truncated and clamped, so a page header inside
  a page that already has its `h1` takes `[level]="2"`); `[hwBreadcrumb]` and
  default actions.

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

Migration to 0.3.0. The layout markup changed, so review CSS and tests that
depended on the wrappers:

- `hw-stack > .hw-stack` (and the same for Container, Inline, Grid, Columns,
  Sidebar, Center, AspectRatio, Section and AppShell) no longer exists: select
  `.hw-stack`, which is now the host. A rule that styled the host as a plain
  inline wrapper now styles the box.
- `hw-section` no longer renders a `section` element. With `label` the host is a
  region; use `<section hwSection>` where a `section` element is wanted.
- `hw-sidebar` no longer wraps the two panes in `aside` and `div`.
- `hw-app-shell` renders `div.hw-app-shell-header` and `div.hw-app-shell-footer`
  where it rendered `header` and `footer`, so a projected `header` is the
  banner instead of sitting inside one. Its skip link is a child of the host.
- `@hawiyah/styles` makes `hw-container`, `hw-section`, `hw-aspect-ratio`,
  `hw-page-header` and `hw-alert` blocks and `hw-card` and `hw-service-card`
  grids, with zero specificity, so a card fills its grid row.
- NavigationDrawer groups no longer all start closed: the group that holds the
  current page is open.
- The public method `HwNavigationDrawerComponent.groupEntries(item)` is removed;
  core `getNavigationGroupEntries(item)` returns the same entries.
- `hw-section` no longer owns `aria-label` and `role` through host bindings: a
  value the application writes or binds there is kept, and `label` takes its
  place only while it is set.

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
and direction are supplied by the application. `hw-portal-layout` requires
`skipLabel`, `menuLabel`, `navigationLabel` and `externalLabel` in every use,
`secondaryLabel` with `secondaryNavigation`, `breadcrumbLabel` with `breadcrumbs`
and `footerLabel` with `footerLinks`. `hw-portal-header` and `hw-portal-layout`
project an optional `[hwPortalNotice]` above the brand row; the actions container
is `div.hw-portal-header-actions` (it replaces `hw-portal-actions`).
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

`HwCheckboxComponent`, `HwRadioGroupComponent` and `HwSwitchComponent` accept `readOnly`.
The control remains keyboard-focusable and submits its value, while pointer and
keyboard activation leave its value and radio peers unchanged. Disabled remains
a separate native state. The checkboxes of a read-only `hw-multi-select` and the
file input of a read-only `hw-file-dropzone` behave the same way: enabled,
focusable and submitted, with `aria-disabled="true"`. See [NIC states](../../docs/nic-choices.md).


[Site verification](../../docs/site-verification.md) composes a native disclosure above the header with deployment-owned domain and certificate information. [Grouped portal footers](../../docs/nic-footer.md) add navigation groups, support actions, legal links and identity slots.

[Link and breadcrumb states](../../docs/nic-links.md) document neutral/standalone variants, disabled destinations, source contrast substitutions and native adapter APIs.


### Table presentation and empty results

`Table` and `DataTable` expose `variant="default|striped|bordered"`,
`size="sm|md|lg"` and `emptyMessage`. DGA cells have a 48px default minimum;
40px/56px alternate sizes and striped/bordered variants are Hawiyah extensions.
A caption names the keyboard-focusable horizontal scroll container through
`aria-labelledby`; row-header columns render native `th scope="row"`. Empty data spans the column count and
shows the required `emptyMessage`. Sorting does not mutate caller records.
DataTable sorts with the required `locale` input through core `sortRows`; there is
no default sort locale, and without one the rows keep their source order. Both component hosts shrink inside grid/flex
layouts so overflow stays inside the table wrapper; the shared stylesheet gives
the hosts their block box.
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

### Copy button

`HwCopyButtonComponent` (`hw-copy-button`) copies a value the page already shows.
Place the button beside the visible value, so the reader sees what was copied.

```html
<!-- Add HwCopyButtonComponent to the host component's imports. -->
<code class="hw-code">pnpm add @hawiyah/angular</code>
<hw-copy-button text="pnpm add @hawiyah/angular" label="نسخ الأمر"
  copiedMessage="تم النسخ" failedMessage="تعذّر النسخ. حدّد النص وانسخه يدويًا."
  (copyResult)="onCopy($event)" />
```

| Input | Type and default | Notes |
| --- | --- | --- |
| `text` | `string \| (() => string)`, required | The value to copy, written as given (no trimming). A function is called when the reader activates the button and never before. |
| `label` | `string`, required text | The accessible name (`aria-label`) in the icon display and the visible text in the text display. It is the same in every state. |
| `copiedMessage` | `string`, required text | Status text after a successful copy. |
| `failedMessage` | `string`, required text | Status text after any failure. |
| `display` | `'icon' \| 'text'`, `'icon'` | The text display shows the icon followed by `label`. |
| `variant` | the Button variants, `'ghost'` | Written to `data-variant`. |
| `size` | `'sm' \| 'md' \| 'lg'`, `'md'` | Written to `data-size`. |
| `feedbackDuration` | `number`, `3000` | Milliseconds the copied state lasts. A value that is not a finite number above zero means 3000. |
| `disabled` | `boolean`, `false` | The native `disabled` attribute. |

The application supplies three texts: `label`, `copiedMessage` and
`failedMessage`. All three are checked on every render, so a missing failure
message is reported in development before a copy ever fails. A missing one
renders nothing in its place (no `aria-label`, no label text, an empty status)
and the control keeps working.

The host `hw-copy-button` is the root: it carries `class="hw-copy"` and
`data-state` (`idle`, `copied`, `failed`), and holds a native
`<button type="button">` and a `<span class="hw-copy-message" role="status"
aria-live="polite" aria-atomic="true">`. Activation is the native click (pointer,
Enter or Space) and focus stays on the button. The icon follows the state
(`copy-01`, `tick-02`, `alert-02`). After a success the status holds
`copiedMessage` for `feedbackDuration`, visually hidden; after a failure it holds
`failedMessage` as visible text until the next activation. An activation first
empties the status, so a repeated message is announced again. A result that
settles at once (an empty text, no Clipboard API) empties and fills the status
inside one task; that an identical message is then repeated has not been verified
with a screen reader. `focus()` focuses
the button. No attribute is forwarded to the button; `class` and `style` on
`hw-copy-button` apply to the root.

`(copyResult)` emits `CopyResult`, `{ status, text }`, once per activation whose
result still counts (a later activation overtakes an earlier one; nothing is
emitted after the component is destroyed). `status` is a `CopyStatus`:
`copied`; `denied` (the browser refused permission); `unavailable` (no
asynchronous Clipboard API: an insecure context or an old browser); `failed`
(any other rejection); `empty` (the text was not a string or only white space,
and nothing was written). When the status is not `copied`, the application may
offer manual copying, for example by selecting the visible value. The clipboard
is never read, nothing is written on render or hydration, and there is no
`document.execCommand` fallback.

### Side navigation

`HwSideNavigationComponent` (`hw-side-navigation`, or `nav[hwSideNavigation]`)
renders the page list of NavigationDrawer in the page: native links and native
`details` groups, with no script behaviour of its own.

```html
<!-- Add HwSideNavigationComponent and HwNavigationDrawerComponent to the imports. -->
<hw-side-navigation label="صفحات الدليل" sticky [items]="pages" />
<hw-navigation-drawer title="القائمة" navigationLabel="صفحات الدليل" closeLabel="إغلاق القائمة"
  [items]="pages" [(open)]="menuOpen" />
```

```ts
pages: HwNavigationDrawerItem[] = [
  { id: 'start', label: 'البدء', href: '/start', icon: 'home-01' },
  { id: 'components', label: 'المكوّنات', expanded: true, children: [
    { id: 'button', label: 'الزر', href: '/components/button', current: true },
  ] },
];
```

- `items` (required): `HwNavigationDrawerItem[]`, `{ id, label, href?, icon?,
  current?, disabled?, expanded?, children? }`. `HwSideNavigationItem` is the same
  type, so one array feeds the side navigation on wide screens and
  NavigationDrawer on phones. A disabled entry is text with
  `aria-disabled="true"` and its children are not rendered; an entry with
  children is a group; an entry with `href` is a link; anything else is text. A
  group with its own `href` repeats itself as the first link inside, because a
  `summary` cannot also be a link.
- `label` (required text): the accessible name of the navigation landmark. A
  missing one leaves the landmark without `aria-label`.
- `sticky` (false): writes `data-sticky="true"`. From 64rem the navigation
  stays in view and scrolls inside its own box. Place it with
  `--hw-side-navigation-top` (the distance from the top, for example the height
  of a header above it) and `--hw-side-navigation-bottom-reserve`.

The application marks the current page through `items` (`current: true`) on
each route change; the link then carries `aria-current="page"`. A group is open
when `expanded` is true or when a link inside it is the current page, on the
server as well. The `open` attribute is written again only when that computed
value changes, so a group the reader opened or closed stays as it is. In the
browser, after the first render and whenever the current page changes, the
current link is brought into view inside the navigation's own scroll box; the
page does not scroll and focus does not move.

The host element is the landmark and carries
`class="hw-side-navigation hw-navigation-drawer-nav"`, because a sticky box must
be the child of the application's column. `hw-side-navigation` gets
`role="navigation"`; `<nav hwSideNavigation>` needs no role. There are no
outputs: entries are links. For client-side routing see the next section.

### Client-side routing

Packaged links are plain `<a href>` elements, so pages work without script and
"open in a new tab" keeps working. An application with a router binds one
delegated listener with `bindLinkNavigation` from `@hawiyah/core` in its root
component:

```ts
import { afterNextRender, Component, DestroyRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { bindLinkNavigation } from '@hawiyah/core';

@Component({ /* ... */ })
export class App {
  constructor() {
    const router = inject(Router), destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const links = bindLinkNavigation(document, { navigate: ({ path }) => { void router.navigateByUrl(path); } });
      destroyRef.onDestroy(() => links.destroy());
    });
  }
}
```

With `<base href="/hawiyah/">` the `path` is already relative to it; without a
`base` element pass `base` when the router is mounted below the root. The
helper is called by the application, not by components, and is imported from
`@hawiyah/core`: the Angular package does not re-export it.

Left to the browser: a click with a modifier key or another button, a click
whose default something already prevented, links to another origin or outside
the base path, links with `download`, a `target` other than `_self` or
`rel="external"`, disabled, inert or editable links, in-page fragment links,
and any click for which `navigate` returns `false`. No packaged component
prevents a plain navigation of its own links, and NavigationDrawer closes after
a click the router took. Focus after navigation, route announcements, scroll
restoration and `aria-current` (through `items`, `links` and `current`) remain
the application's.

### Content navigation

`HwContentNavigationComponent` (`hw-content-navigation`) follows application-owned section IDs using nested
`items: {id, label, disabled?, children?}[]`. Options are `label` (the name of
the landmark and the text of its heading; required unless `aria-label` or
`aria-labelledby` is written on the element, and the heading is printed only
while `label` has text), `showHeading` (true),
`sticky` (false), `scrollRoot` (null/window), `offset` (80px) and `updateHash`
(false). `(currentChange)="onCurrentChange($event)"` reports the current section ID. Each
link is rendered as `#id` and keeps resolving to the current document under a
`<base href>`. Ordinary activation scrolls without changing the URL, unless
`updateHash` asks for `history.replaceState`; keyboard activation also focuses
the target. An activation reports one change: the marker does not step through
the sections a smooth scroll passes. Modified anchor clicks retain browser behavior, and a link whose
target is not in the document is left to the browser. Disabled entries
remain noninteractive text links; no section content is created or hidden.

```html
<!-- Add HwContentNavigationComponent to the host component's imports. -->
<hw-content-navigation label="في هذه الصفحة" [items]="[{id: 'requirements', label: 'المتطلبات'}]" />
<section id="requirements"><h2>المتطلبات</h2></section>
```
