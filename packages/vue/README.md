# @hawiyah/vue

Native Vue 3 components for Hawiyah — هوية, a UI library built to comply with the
DGA Platforms Code.
Install with `npm install @hawiyah/styles @hawiyah/vue`. This is a pre-1.0 release,
so a minor version may still change its API. Import the shared CSS once:

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button, Combobox, Dialog, TextField } from "@hawiyah/vue";
import "@hawiyah/styles/styles.css";
// Optional for a new application: import '@hawiyah/styles/reset.css';
const name = ref("");
const city = ref("");
const reviewing = ref(false);
const cities = [{ value: "riyadh", label: "الرياض" }];
</script>

<template>
  <form dir="rtl" lang="ar" @submit.prevent="reviewing = true">
    <TextField v-model="name" label="الاسم" name="name" required />
    <Combobox
      v-model="city"
      :options="cities"
      label="المدينة"
      name="city"
      required
      empty-message="لا توجد نتائج"
      required-message="اختر مدينة من القائمة."
      :get-results-message="(count) => `${count} نتائج متاحة`"
    />
    <Button type="submit">مراجعة</Button>
  </form>
  <Dialog v-model:open="reviewing" title="مراجعة الطلب" close-label="إغلاق">
    <p>{{ name }}</p>
    <template #footer="{ close }"><Button @click="close">تم</Button></template>
  </Dialog>
</template>
```

## Conventions

Components use native elements and Vue rendering. They share core keyboard and
combobox transitions without importing another adapter. Vue `useId()` supplies
server/client stable accessible IDs; importing or server-rendering the package
does not access browser globals. Vue 3.5+ and native `<dialog>` support are required.
A server-rendered open dialog becomes modal after mounting.

Native attributes and event listeners fall through to the primary control. Classes
are merged, and internal event handlers preserve consumer listeners. Field controls
expose `element` and `focus()` through a Vue template ref; `Button` does too.
`Dialog` exposes `element`, `show()` and `close()`. `Combobox` adds `show()` and `close()`.

Text inputs, select, combobox, tabs and pagination use `v-model`; omitting it
uses internal state initialized by `defaultValue`. Checkbox/switch values are
booleans; radio values are strings matched against the radio's `value` prop.
`Dialog` and `Combobox` use `v-model:open` / `defaultOpen`; `PasswordField` uses
`v-model:visible` / `defaultVisible`. A prop left undefined is uncontrolled; a
change made by the application is never echoed as an event.

### Native form reset

A native reset is a value change made by the form. After the browser has reset
the form's controls (in the same microtask for `form.reset()` and scripted
clicks, before the next paint when the reader activates a reset button), every
control holds, shows and submits its reset target: `defaultValue` (or
`defaultOpen` / `defaultVisible`), else the empty value (`''`, `[]`, `false`,
the `Slider` midpoint `(min + max) / 2`, the `RangeSlider` `[min, max]`, no
files). `update:modelValue` (and `update:files`, `update:open`,
`update:visible`) is emitted once, and only when the reset changed the value;
arrays are compared by content. With `modelValue` bound and the update ignored,
the next tick writes the bound value back to the native controls, so the shown,
submitted and application values agree. Read-only and disabled controls are
reset too; a reset whose `reset` event was default-prevented changes nothing.
Secondary state returns at the same moment: popups close, filters and drafts
are cleared, a revealed password is hidden, a submission's `aria-invalid` and a
file rejection are removed. No listener is attached during server rendering.

`Select` without `defaultValue` returns to the option a native select shows when
none is marked selected: the first option that is not disabled, which is the
prompt when `placeholder` is given. Give a default with `default-value`, not
with `selected` on a slotted option.

For radios sharing a form and `name`, set `defaultValue` to the option that
should be checked after a reset. The group emits that value once. A group
without a checked default resets to an empty string.

### Labels, hints, errors and the required marker

Inside a field the order is label (or legend), control, hint, error. Hint and
error render as `p.hw-hint#{id}-hint` and `p.hw-error#{id}-error` and take
phrasing content; the control's `aria-describedby` lists the application's ids,
the `Field` ids, the hint and the error, without duplicates. An application
`error` has no role; a message the component produces itself after the reader
acted (a `FileDropzone` rejection) renders in the same element with
`role="alert"`, and the application's `error` wins when both exist.

A required control with a visible label shows one marker,
`<span class="hw-required-marker" aria-hidden="true"> *</span>`, as the last child
of its `label.hw-label` or `legend.hw-label`; it is present exactly when the
control or its `Field` is required. It is never the only carrier: text-like
controls, selects and each radio keep native `required`, and a required
`MultiSelect` or `TagInput` explains the requirement in its hint. Range inputs
take no `required` attribute (HTML does not allow it), so `required` on
`Slider` and `RangeSlider` shows the marker only. The glyph is not application
text and has no prop.

`aria-invalid="true"` is on the control (the fieldset for a group) exactly when
`error` is given, the application passes `aria-invalid`, a submission failed on
the control (its `invalid` event; until its validity is valid again or the form
resets), or the reader committed a value the component rejects itself
(`PinInput` incomplete after blur, `FileDropzone` rejection). A required empty
control is not marked before a submission, and a missing message text never
marks it.

Locale, direction, theme, mode and density are independent application choices.
Set `lang`, `dir`, `data-hw-theme="hawiyah|dga|custom"`,
`data-hw-mode="light|dark"` and `data-hw-density="comfortable|compact|mobile"` on an
ancestor. Components read direction from `dir` and never read `lang`, the
document language or `navigator.language`.

## Text is supplied by the application

Hawiyah ships no built-in strings. Every text a component places itself
(accessible names, labels of internal controls, headings it renders,
live-region and validation messages, templated text) is a prop, and none has a
default. Props that are always needed are declared `required: true`; props
needed only when a feature is switched on (for example `requiredMessage` when
`required` is set) are optional and checked at render time. Templated text is a
function prop named `get…Label` or `get…Message`; it receives the data and
returns the whole string, and the component adds nothing to it.

When required text is missing the component renders nothing in its place: no
text node, and the attribute is omitted rather than rendered empty. Structure
and behaviour are unchanged, a failed constraint still blocks submission, and
core `requireText` warns once per component and prop in development
(`Hawiyah: <Component> requires "<prop>"…`). Production builds do not warn.
`label` on a component names its root; an `aria-label` or `aria-labelledby`
passed to the root satisfies it. Such root names (`AvatarGroup`, `Breadcrumb`, `ButtonGroup`,
`Calendar`, `Carousel`, `ContentNavigation`, `Feedback`, `Meter`, `NotificationList`, `Pagination`, `Progress`,
`SecondaryNav`, `SideNavigation`, `Spinner`, `Stepper`, `Tabs`, `Timeline`, `ToastRegion`, `ToggleGroup`, `TreeView`,
the menu of `Menu`, the panel of `Popover`,
the legend of `MultiSelect`, and the field label of `DatePicker`, `FileDropzone` and `SearchField`) are declared without
`required: true` and checked at render: `requireText` warns only when `label`,
`aria-label`, `aria-labelledby` and (for fields) a parent `Field` label are all
absent, and no empty `aria-label` is written. A `Spinner` marked
`aria-hidden="true"` needs no name. Every other text marked required below is
`required: true`.

The adapter chooses no locale. `locale` is only a formatting argument, required by
the components that format dates or sort text (`Calendar`, `DatePicker`,
`DataTable`); there is no `ar-SA` or host default. Without it the component
warns through `requireText` and renders nothing that `Intl` would have
produced: `Calendar` keeps its root and hidden input but renders no toolbar,
weekdays or grid; `DatePicker` keeps the ISO text as typed and shows no
formatted date; `DataTable` keeps the rows in their source order. Nothing in
this package calls `Intl`, `toLocaleString` or `localeCompare` itself.

Packaged in-page links (the `AppShell`, `PortalHeader` and `PortalLayout` skip
links and `ContentNavigation` links) render `href="#id"` on the server and on
first render. After mounting they are bound with core `bindFragmentLink`, so
from the first interaction they resolve against the current document under any
`<base href>`; a plain activation scrolls to the target and focuses it without
writing the URL fragment.

Migration notes for the required locale (breaking): `DataTable` requires
`locale` (it defaulted to `ar-SA`); `Stat` no longer formats numbers and has no
`locale` prop, so pass `formatNumber(value, { locale })` from `@hawiyah/core`;
`Calendar` and `DatePicker` keep their required `locale` and no longer reach
`Intl` without it.

Migration notes for form controls (breaking, 0.3.0):

| Component | Before | Now | Migration |
| --- | --- | --- | --- |
| Every form control | `update:modelValue` emitted for every control on every reset | emitted only for a control whose value the reset changed | none; listeners that counted reset events use the form's `reset` event |
| `Field`, `decorate`d controls, `Checkbox`, `Radio`, `Switch`, `RangeSlider`, `Rating`, `MultiSelect` | `span.hw-hint` / `span.hw-error` | `p.hw-hint` / `p.hw-error` | selectors on `span.hw-hint` -> `.hw-hint` |
| `Checkbox`, `Radio`, `Switch` | `readOnly` | `readonly` | `:read-only="x"` -> `:readonly="x"`; `read-only` -> `readonly` |
| `Slider` | `defaultValue` = 0 | no default: `(min + max) / 2` | add `:default-value="0"` to keep the old start |
| `RangeSlider` | `defaultValue` = `[0, 100]` | no default: `[min, max]` | add `:default-value="[0, 100]"` where min or max differ and the old thumbs are wanted |
| `RangeSlider` | `name` and `form` fell through onto the fieldset and no thumb was submitted under `name` | both thumbs are submitted under `name` | none |
| `RangeSlider`, `Rating`, `MultiSelect` | required legends showed no marker | marker shown | remove asterisks written into `label` by hand |
| `ToggleGroup` | `defaultValue` = `''` in both modes; reset emitted `''` for a multiple group | no default; the empty value is `[]` in multiple mode | none; handlers that accepted `''` for a multiple group can drop that branch |
| `ToggleGroup` | `name` and `form` also on the fieldset; `data-selected` on the option label | neither | `[data-selected='true']` -> `:has(input:checked)`; read the name from the radios |
| `ToggleGroup` | `label` was a required prop | optional when `aria-label` or `aria-labelledby` is passed | none |
| `MultiSelect` | `p[role=status]` with `emptyMessage` after the options; filter named by `aria-label` | `p.hw-hint` inside `div.hw-multi-select-options`; filter named by a visible `label`; new required `getResultsMessage(count)` | pass `getResultsMessage` |
| `MultiSelect` | read-only checkboxes were `disabled` | focusable, `aria-disabled="true"` | none |
| `TagInput` | remove button `.hw-button`; hidden inputs after the text input | bare button inside the chip; hidden input inside its `li` | selectors on `.hw-tag-input .hw-button` -> `.hw-chip button` |
| `PinInput` | `maxlength` on the input | none; the length is applied after normalising | none |
| `FileDropzone`, `FileUpload` | `update:files([])` on every reset | `update:files([])` only when files were selected | none |
| `FileDropzone` | `@reject` received the whole batch | `@reject` receives only the rejected files | read the rejected files from the event |
| `FileDropzone` | `div.hw-field > label, div.hw-file-dropzone > instruction, input, status; hint, error`; `data-dragging="true"` | `div.hw-field.hw-file-dropzone > label, instruction, input, status, slot, hint, error`; `data-state="dragging"` | `[data-dragging='true']` -> `[data-state='dragging']` |
| `FileDropzone` | `aria-readonly="true"` on the file input | `aria-disabled="true"` on the file input and `data-hw-readonly="true"` on the root | none |
| `FileDropzone` | no rejection message | `getRejectedMessage(rejected)` required when `accept` or `maxSize` is set | pass `getRejectedMessage` |

Migration notes for dates, overlays, disclosure, data, navigation and service patterns (breaking, 0.3.0):

| Component | Before | Now | Migration |
| --- | --- | --- | --- |
| `DatePicker` | `p#{id}-validation-error.hw-error[role=alert]` before the hint | `p#{id}-error.hw-error[role=alert]` after the hint (the one error element of the field) | `#<id>-validation-error` -> `#<id>-error` |
| `Accordion` | a slot named after each item's value (`<template #faq-1>`) | one scoped slot `#content="{item, index}"` (and `#title`) | `<template #a>X</template>` -> `<template #content="{item}"><template v-if="item.value === 'a'">X</template></template>` |
| `Table` | column `header` | column `label` | `{header: 'Name'}` -> `{label: 'Name'}` |
| `Table`, `DataTable` | cell slot `cell:<key>` with `{row, index}` | `cell-<key>` with `{row, index, column}` | `<template #cell:name="{row}">` -> `<template #cell-name="{row}">` |
| `PageHeader` | a fractional `level` produced an invalid tag (`h2.5`) | the level is truncated and clamped to 1..6 | none |
| `Carousel`, `Pagination` | the arrow at a bound was `disabled` | `aria-disabled="true"`, focusable, ignores activation | selectors on `.hw-pagination-arrow:disabled` -> `[aria-disabled='true']` |
| `Breadcrumb` | the current item with an `href` was a link | `span[aria-current=page]` text | none |
| `Stepper` | no state text | required `completeLabel` and `upcomingLabel` | pass both texts |
| `Menu` | `@select` | `@action` | `@select="fn"` -> `@action="fn"` |
| `Menu` | `label` also printed on the trigger | `label` names the menu; `triggerLabel` is the trigger text | `<Menu label="Actions">` -> `<Menu label="Actions" trigger-label="Actions">` |
| `Menu` | `ul[role=menu] > li[role=none] > button\|a`; disabled buttons carried `aria-disabled` | `div.hw-menu-content[role=menu] > .hw-menu-item`; disabled buttons carry `disabled` | `.hw-menu > ul li > [role=menuitem]` -> `.hw-menu-content > .hw-menu-item` |
| `Menu`, `Popover` | the menu closed on any blur; the popover stayed open when focus left it | both close when focus moves to an element outside, and only then | none |
| `Popover` | `div.hw-popover-content`; `label` and `triggerLabel` declared required | `div.hw-popover-panel`; `label` optional with `aria-label` / `aria-labelledby`, `triggerLabel` optional with the `trigger` slot | `.hw-popover-content` -> `.hw-popover-panel` |
| `Tabs` | `label` declared required; `aria-label` / `aria-labelledby` stayed on `div.hw-tabs` | both name the tablist | none |
| `TreeView` | the tree item carried `aria-label`; toggle without class | `aria-labelledby` to the label span; `button.hw-tree-toggle` | selectors on the toggle -> `.hw-tree-toggle` |
| `PortalHeader` | `span.hw-portal-brand[role=group]` without a home link | `div.hw-portal-brand[role=img]` | `span.hw-portal-brand` -> `div.hw-portal-brand` |
| `ServiceCard` | `metadata: string[]` rendered as `ul` | `metadata: {term, description}[]` rendered as `dl` | `:metadata="['Duration: 3 days']"` -> `:metadata="[{term: 'Duration', description: '3 days'}]"` |
| `ServiceCard` | `badge` (info badge after the `h3`); icon slot unwrapped | `category` (neutral badge before the `h3`); icon in `div.hw-service-card-icon` | `badge="x"` -> `category="x"` |
| `ServiceDetails` | `items` | `metadata` | `:items="x"` -> `:metadata="x"` |
| `ServiceDetails` | `section.hw-service-details`; `div.hw-service-details-action` | `article.hw-service-details`; `footer` | `.hw-service-details-action` -> `.hw-service-details > footer` |

Migration notes for feedback, content and service patterns (breaking, 0.3.0):

| Component | Before | Now | Migration |
| --- | --- | --- | --- |
| `Progress`, `Meter`, `ButtonGroup` | `label` declared required | optional when `aria-label` or `aria-labelledby` is passed | none |
| `Meter` | `value` required | `value` defaults to 0 | none |
| `Spinner` | an empty `span.hw-sr-only` when there is no label | no span | none |
| `EmptyState` | icon wrapper `span[aria-hidden]` | `span.hw-empty-icon[aria-hidden]` | none |
| `Chip` | `<Chip removable remove-label="Remove" @remove="fn">`; remove button `.hw-button` | the button is rendered while `@remove` is bound; plain `button` | delete `removable`; selectors on `.hw-chip .hw-button` -> `.hw-chip > button` |
| `DescriptionList` | `variant` defaulted to `horizontal` | stacked (no `data-variant`) | `<DescriptionList :items="x" />` -> `<DescriptionList :items="x" variant="horizontal" />` to keep the old layout |
| `Timeline` | item `date` (printed when `dateLabel` was absent) | `dateTime`, shown only with `dateLabel` | `{date: '2026-01-01'}` -> `{dateTime: '2026-01-01', dateLabel: '1 January 2026'}` |
| `NotificationList` | item `date` | `dateTime`, shown only with `dateLabel` | `{date: '2026-01-01'}` -> `{dateTime: '2026-01-01', dateLabel: '1 January'}` |
| `NotificationList` | `aria-label` on the section, `li[data-read]`, `p[role=status]` when empty, plain title link | `h2` + `aria-labelledby`, `li[data-state]`, plain `p`, `a.hw-link` | `[data-read='false']` -> `[data-state='unread']`; `[data-read='true']` -> `[data-state='read']` |
| `NotificationList` | no unread text | required `unreadLabel` (a visible info badge) | add `unread-label="Unread"` (your text) to every NotificationList |
| `Feedback` | `v-model` string `'yes' \| 'no' \| ''`; `@submit({value, comment})`; `readonly` | `v-model` `FeedbackValue`; `@feedback(FeedbackValue)`; `disabled` | `v-model="choice"` -> `v-model="value"` with `value = {helpful: null, comment: ''}`; `@submit="fn"` -> `@feedback="fn"` (`payload.value` -> `payload.helpful`); `readonly` -> `disabled` |
| `Feedback` | `section[aria-label] > h2`, `div.hw-button-group[role=group][aria-label]` | `div[role=group][aria-labelledby] > p`, `div.hw-feedback-actions` | `.hw-feedback > h2` -> `.hw-feedback > p` |
| `CookieConsent` | `@accept`, `@reject` | `@consent` with `'accepted' \| 'rejected'` | `@accept="a" @reject="r"` -> `@consent="choice => choice === 'accepted' ? a() : r()"` |
| `CookieConsent` | `section[role=region][aria-label]` | `section[aria-labelledby]` named by its `h2` | none |
| `Link` | `external` replaced an authored `rel` by `noopener noreferrer` | `external` adds them to the authored `rel` | none |

## Catalog

| Export                  | Main contract                                                                                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                | `variant`, `size`, `loading`; defaults to `type="button"`                                                                                                             |
| `Field`                 | `label`, `hint`, `error`, `required`, `controlId`; provides association to a child field control; scoped default slot exposes IDs for native controls                 |
| `TextField`, `Textarea` | String `v-model`, `defaultValue`, field decoration; standard input/textarea attributes                                                                                |
| `Select`                | String `v-model`, `options: Option[]`; native option children also accepted; reset target `defaultValue`, else the first enabled option (the prompt with `placeholder`) |
| `Checkbox`, `Switch`    | Boolean `v-model`, `defaultValue`, `value` (submitted, default `on`), `readonly`, label/hint/error; label content from `label` or the default slot; checkbox supports `indeterminate` |
| `Radio`                 | A single option: string `v-model`, `value`, `readonly`, shared native `name`; compose a group inside a fieldset with a legend                                          |
| `Combobox`              | String `v-model`, `options`, `disabled`, `readonly`; `v-model:open` (`open` controlled when not undefined, `defaultOpen=false`; ignored while disabled or read-only); required `emptyMessage` and `getResultsMessage(count)`; `requiredMessage` when `required` is set; `update:query` is emitted only for typed text; exposes `show()` and `close()`. Structure: `div.hw-field > label, div.hw-combobox, p.hw-hint, p.hw-error`; `div.hw-combobox` wraps only the input, hidden input, listbox and status |
| `Tabs` | `items`, `label` (or `aria-label` / `aria-labelledby`, written on the tablist and never on `div.hw-tabs`), string `v-model`, `orientation`, `activationMode`, `overflow: menu/scroll` (default menu), `overflowLabel` (required when `overflow` is `menu`); item content or named value slots, optional `tab:value` label slots. Compact horizontal containers move excess labels into a keyboard-accessible disclosure; vertical tabs remain visible. |
| `Dialog` | Required `title` and `closeLabel`, `description` (the native dialog's `aria-describedby`), `closeOnBackdrop`; default/footer slots receive `{close}`, trigger slot receives `{open}`; `footer.hw-dialog-footer` is rendered only when the footer slot is given |
| `Accordion` | `items: {value,title,content?,open?}[]`, `exclusive`; native details; scoped slots `#title="{item, index}"` (rich content of the summary, which must contain text) and `#content="{item, index}"`; a click on a link, button or form control inside a rich title does not toggle; emits `toggle(value,open)` |
| `Card`                  | `header`, default and `footer` slots                                                                                                                                  |
| `Badge` | Static label; `tone="neutral\|success\|warning\|danger\|info"`, `variant="soft\|outline\|dot"`; [source and adaptations](../../docs/nic-badges.md). |
| `Alert` | `tone="info\|success\|warning\|danger"`, `variant="default\|outline\|minimal"`, `title`, default slot. Default role is status (danger: alert); set `role="status"` for a danger message rendered with the page. `@dismiss` renders a ghost close button (`button.hw-alert-dismiss`) named by the then-required `close-label`. The alert never hides itself: the application removes it and moves focus to the element the message was about or to the heading of the surrounding region, never leaving it on the body |
| `Table` | `columns`, `rows`, `rowKey`, `caption` (the wrapper is `role=region` named by the caption only while a caption is given); `emptyMessage` when `columns` is given; column `{key,label,cell?,rowHeader?}`; scoped `cell-<key>` slots receive `{row,index,column}` and win over `cell(row,index)`; a column without either prints the value as text (nothing for null or undefined); omit columns to compose native children |
| `Pagination` | Numeric `v-model`/`defaultValue`, `totalPages`, required `label`, `previousLabel`, `nextLabel`, `getPageLabel(page)`, `formatPage(page)`, `siblingCount=1`, `disabled`, `hideOnSinglePage=false`. At the first or last page the arrow is `aria-disabled="true"`, keeps focus and ignores activation; `disabled` is set only on a disabled pagination. Ellipsis disclosures use required `getGapLabel(start,end)`, `jumpLabel`, `goLabel`; gaps above 100 pages use bounded integer entry. Parent fetches/slices data; no navigation or scrolling is imposed. |
| `Breadcrumb` | `items: {label,href?,current?,disabled?}[]`, `label` (or `aria-label` / `aria-labelledby`). The current item is the first with `current: true`, else the last; it is `span[aria-current=page]` text, never a link. A disabled item is `span[role=link][aria-disabled=true]` |
| `Progress` | One native `progress.hw-progress` named by `label` (or `aria-label` / `aria-labelledby`); no visible label is rendered. `value` omitted = indeterminate; `value` and `max` (default 100) are written as given; `size="sm\|lg"` |
| `Skeleton` | Decorative span, hidden from assistive technology; `variant="text\|circle"`; size with `style` or `class`. Announce loading with the pattern below the expanded-content table |
| `Spinner` | `span.hw-spinner[role=status]` holding `span.hw-sr-only` with `label` (no inner span without it); or name it with `aria-label` / `aria-labelledby`, or mark it `aria-hidden="true"` beside visible text (then no name is needed); `size="sm\|lg"` |
| `Avatar` | Required `name`; optional `src`, `initials`, `size="40\|64\|80\|120\|sm\|md\|lg\|xl"`, `variant="circle\|square"`. Failed images fall back to initials; changing `src` retries. [Source notes](../../docs/nic-avatars.md). |
| `Divider`               | Native `hr`                                                                                                                                                           |
| `Tooltip`               | Plain `content`, one focusable trigger in default slot; description IDs merge with the trigger                                                                        |
| `FileUpload`            | Native input attributes plus field decoration; emits `update:files(File[])` (on reset `[]` only when files were held); optional default slot rendered after the input, before the hint |
| `Stepper` | `items: {value,label,description?,status?}[]`, `current` (a value) or `activeIndex`, required `label`, `completeLabel` and `upcomingLabel`: each complete or upcoming step carries `span.hw-sr-only[data-hw-step-status]` with that text after its label (none on the current step, which has `aria-current=step`); the description is a sibling `p.hw-hint` |
| `EmptyState` | `title`, `description`; `#icon` (decorative, in `span.hw-empty-icon[aria-hidden]` before the `h3`), default and `#action` slots |

`Field` associates one control; use a native fieldset and legend for groups.
Combobox is local, editable, single selection: editing clears the submitted value,
arrow keys skip disabled options, Enter commits explicitly, Escape/Tab/blur/outside
close without committing. `name` is attached to a hidden input containing the
selected option value. Required validation checks selection, not merely typed text.
Readonly comboboxes never open or change selection. Tabs use roving focus and
RTL-aware horizontal arrows; manual mode selects through native Enter/Space.
Dialog uses `showModal()` / `close()` for browser modality and focus containment,
then returns focus to its connected opener. Tooltips must not contain interactive
content; use a dialog for interactive help.

The example in `examples/vue` includes independent locale/direction/theme controls,
a conditional service form, validation, native modal review, local request filtering
and pagination, and the remaining presentation components. Unit tests exercise
behavior and server rendering; browser checks validate the application workflow.

## Expanded controls

The package covers all **85 catalogue entries**; this section describes the 50
added to the original 27 in the first expansion.
All use native Vue rendering, shared CSS, and the same attrs/slots conventions.

| Component       | Props, models and events                                                                                                                                                                                                                                                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `InputGroup`    | `prefix`, default and `suffix` slots; the consuming field supplies its label                                                                                                                                                                                                                                                                   |
| `PasswordField` | String `v-model`, `defaultValue`, field decoration, `disabled`, `readonly`; `v-model:visible` (`visible` controlled when not undefined, `defaultVisible=false`, emits `update:visible`; a reset hides the value); required `showLabel`, `hideLabel` name the reveal button (and are its text with `toggleVariant="text"`); input and button form one input group                                                                                                                                                                         |
| `SearchField`   | String `v-model`, `defaultValue`, field decoration, required `clearLabel`; optional `suggestions`, `maxSuggestions` (8), `getResultsMessage(count)` (required when `suggestions` are given), `showSearchButton` (false), `searchLabel` (required when `showSearchButton` is on; it names the button only, the input is named by `label`); emits `search(query)`. Input attributes and exposed `element`/`focus()` remain supported. |
| `NumberField`   | `v-model: number \| ''`; native `min`, `max`, `step` and `required`; clearing preserves an empty value instead of inventing zero                                                                                                                                                                                                               |
| `Slider`        | Numeric `v-model`, `defaultValue` (no default: the empty value is `(min + max) / 2`), `min=0`, `max=100`, `step=1`, field decoration, `disabled`, `readonly`; `showValue=false` renders `output.hw-slider-value` after the input; `formatValue(value)` gives that text and `aria-valuetext` (without it the output shows `String(value)` and no `aria-valuetext` is written); native range keyboard behavior                                                                                                                                                                                                      |
| `RangeSlider`   | Tuple `v-model: readonly [number,number]`, `defaultValue` (no default: `[min, max]`), `min`, `max`, `step`; `label`, required `lowerLabel` and `upperLabel`; `name` submits both thumbs (lower, upper), `lowerName` / `upperName` override it, `form` reaches both inputs; optional `formatValue(value)` (each thumb's `aria-valuetext`) and `getRangeLabel(lower, upper)` (an `output.hw-range-slider-value` after the two labels; none without it, and no separator is written). Structure: `fieldset.hw-field.hw-range-slider > legend, label > input#{id}-lower, label > input#{id}-upper, output, p.hw-hint, p.hw-error`; two native ranges enforce lower ≤ upper                                                                                                                                                        |
| `Rating`        | Numeric `v-model`, `defaultValue`, `max=5` (1–20), native `name`, `required`, `label`, `hint`, `error`, `disabled`, `readonly`; required `getRatingLabel(value,max)` names each native radio                                                                                                                                                           |
| `RatingDisplay` | Numeric `value=0`, `max=5` (1–20), `showValue=true`, `getValueLabel(value,max)`, which returns the whole text alternative, required unless the application passes `aria-label` (which wins) or `aria-labelledby` (then no `aria-label` is written); noninteractive fractional aggregate score with one accessible image name. |
| `PinInput`      | String `v-model`, `length=6`, field decoration; one input with `one-time-code`, numeric keyboard and `pattern`, no `maxlength`: typed, pasted, dropped and autofilled text is normalised (Arabic-Indic and Persian digits become Latin, other characters are dropped) before the length applies, and one more typed character into a full code changes nothing; an incomplete code is `aria-invalid` after blur; emits `complete(value)`                                                                                                                                                       |
| `TagInput`      | String-array `v-model`, `defaultValue`, `name`, `required`, field decoration; Enter or comma commits a unique trimmed tag (there is no Add button); Backspace on an empty draft removes the last tag and keeps focus in the input; removing a focused chip moves focus to the remove button now at its place, else the previous one, else the input; required `getRemoveLabel(tag)`; `requiredMessage` when `required` is set (explain the requirement in `hint`). Structure: `div.hw-field > label, div.hw-tag-input > (ul[role=list] > li.hw-chip > text, button, input[type=hidden]), input.hw-input; p.hw-hint, p.hw-error`; remove buttons are disabled while disabled or read-only                                                                                                                                  |
| `MultiSelect`   | String-array `v-model`, `defaultValue`, `options`, `label` (or `aria-label` / `aria-labelledby` on the fieldset), required `searchLabel` (the visible label of the filter input), `emptyMessage` (shown as `p.hw-hint` among the options) and `getResultsMessage(count)` (a polite status, empty until the reader filters); optional `getSelectedMessage(count)` renders `p.hw-multi-select-selected[role=status]`; `requiredMessage` when `required` is set (explain the minimum in `hint`); read-only checkboxes stay focusable with `aria-disabled="true"`; normalized search and native checkboxes in `div.hw-multi-select-options > label.hw-choice`, repeated hidden values for `name`; no combobox role                                                                                                                                     |
| `Calendar` | ISO-string `v-model`, `defaultValue`, `month`, `min`, `max`, `locale`, `calendar`, `weekStartsOn`, `isDateDisabled(value)` (a rejected day is a disabled button, never the tab stop; arrows skip it in the direction of travel); required `locale` (month and weekday names come from Intl; without it only the root and hidden input render), `label` (or `aria-label` / `aria-labelledby`), `previousLabel`, `nextLabel`; `unsupportedMessage` and `rangeLabel` when `calendar` is `islamic-umalqura`; `p.hw-sr-only[role=status]` follows `table.hw-calendar-grid` from the first render and holds `unsupportedMessage` while the value cannot be shown; the tab stop of an empty calendar is today when available; optional `getDayLabel(value)` overrides the Intl day name; emits `update:month` when browsing; a form reset returns to `defaultValue` and the `month` prop |
| `DatePicker` | Calendar props plus field decoration and string `v-model`; custom ISO text input and modal Calendar (opening moves focus to the selected day, or today); `v-model:calendar` switches `gregory` / `islamic-umalqura` while preserving ISO value (the switch is part of DatePicker only, directly before the calendar); `calendarSwitchable=true`; required `locale`, `label` (or `aria-label` / `aria-labelledby`), `calendarLabel`, `openLabel`, `closeLabel`, `previousLabel`, `nextLabel`, `calendarSystemLabel`, `gregorianLabel`, `hijriLabel`, `rangeLabel`, `invalidMessage`, `unsupportedMessage`; `unavailableMessage` when `isDateDisabled` is given; optional `placeholder` (no default) and `getDayLabel(value)`. Order: label (with the required marker), control, hint, one `p.hw-error#{id}-error`: the application's `error` without a role, else the violated constraint's message with `role=alert` (ISO dates in `bdi[dir=ltr]`). Violation order in the four adapters: not a date, outside the calendar's range, outside min/max, `isDateDisabled`. `aria-invalid` with `error`, a violation or a failed submission (until valid or reset). A form reset returns to `defaultValue`, closes the dialog and clears the draft and message |
| `FileDropzone`  | Field decoration, native `name`/`form`, `accept`, `multiple`, `maxSize` in bytes, `disabled`, `readonly`, required `dropLabel` (the visible instruction, which describes the input; without it no instruction paragraph is rendered and the input's `aria-describedby` does not reference it); `getRejectedMessage(rejected)` is required when `accept` or `maxSize` is set (and asked for when a batch is rejected without them); optional `getSelectedMessage(files)` renders a selection status; emits `update:files(File[])` (only when the list changed) and `reject(rejected: File[])`. A batch replaces the selection; a batch with any rejected file (type, size, or more than one file without `multiple`) leaves the dropzone empty, reports every rejected file and shows `getRejectedMessage(rejected)` as the field's `p.hw-error[role=alert]` with `aria-invalid` on the input until an accepted batch or a reset; it sets no custom validity, so server-side validation stays the application's task. Structure: `div.hw-field.hw-file-dropzone[data-state=dragging\|error][data-hw-readonly] > label, p.hw-file-dropzone-instruction, input, p[role=status], default slot, p.hw-hint, p.hw-error`; no built-in file list (compose `FileUploadList` in the slot). A file dragover is always cancelled, with `dropEffect` `none` while disabled or read-only; other drags are left alone. Read-only keeps the input enabled, focusable and submitted with `aria-disabled="true"` and blocks the chooser and drops. The input is named by `label`, a parent `Field` label, `aria-label` or `aria-labelledby`; `dropLabel` no longer doubles as the field label                                                                                                 |

Value controls support form reset (see "Native form reset"). Arrays reset to
`defaultValue`; native file controls reset to no files. `TagInput` and `MultiSelect` validate committed
selection rather than draft/search text. A missing validity message still blocks submission.
Native attributes such as `name`, `form`, `autocomplete` and `inputmode` pass to
the control, except that compound controls explicitly manage successful values.

`TextField` remains available for standard HTML input types: `text`, `email`,
`url`, `tel`, `password`, `search`, `date`, `time`, `month`, `week`,
`datetime-local`, `color`, and others supported by the browser. It uses a string
model and preserves native input semantics. Use `NumberField` for numeric/empty
values, `FileUpload`/`FileDropzone` for File objects, and the native choice/range
components for their specialized models. Native date/time values are machine
values, independent of localized browser display; `datetime-local` contains no
time-zone information.

### Switching date systems

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DatePicker } from "@hawiyah/vue";
import type { CalendarSystem } from "@hawiyah/core";
const date = ref("2024-03-11");
const system = ref<CalendarSystem>("islamic-umalqura");
</script>

<template>
  <DatePicker
    v-model="date"
    v-model:calendar="system"
    name="appointment"
    label="تاريخ الموعد"
    locale="ar-SA"
    dir="rtl"
    required
    calendar-label="اختر تاريخ الموعد"
    calendar-system-label="نوع التقويم"
    range-label="نطاق تقويم أم القرى المدعوم"
    gregorian-label="ميلادي"
    hijri-label="أم القرى"
    open-label="فتح التقويم"
    close-label="إغلاق"
    previous-label="الشهر السابق"
    next-label="الشهر التالي"
    invalid-message="اختر تاريخاً متاحاً."
    unsupported-message="التاريخ خارج نطاق بيانات تقويم أم القرى المدعومة."
  />
</template>
```

Every control label and message is application text. `locale` is required and only selects Intl formatting for month names, weekday names, the era and day names; it chooses no text.

The stored/submitted value stays Gregorian `YYYY-MM-DD` when switching display
calendars. Reopening shows the selected date's month. Calendar supports arrows
(horizontal direction follows RTL/LTR), Home/End, PageUp/PageDown, and
Shift+PageUp/PageDown for years. Selection uses native Enter/Space button behavior.
Disabled dates are skipped, min/max are enforced, and readonly calendars allow
browsing without changing the selected value.
Opening the DatePicker (trigger, ArrowDown in the input) moves focus to the
selected day, or today; Escape returns focus to the opener.

Saudi Umm al-Qura conversion and arithmetic come from the core's pinned Saudi
reference table, using `@internationalized/date` arithmetic. The supported range
is **AH 1343–1500, Gregorian 1924-08-01 through 2077-11-16**. Numeric day/year
values and accessible date names use the same provider through
`formatCalendarDate`; browser ICU supplies localized names and formatting, not
an alternative numeric conversion. Navigation stops at supported boundaries.
Switching an existing out-of-range Gregorian value does not rewrite it: the
picker displays the caller-localized unsupported message and native validation
rejects it until the user chooses a supported date or switches back. See the
core calendar documentation for provenance and coverage; this is not an official
endorsement or a claim about religious moon-sighting determinations.

## Expanded interactions

| Component     | Contract                                                                                                                                                                                                                                                                               |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ToggleGroup` | `options`, `label` (optional when `aria-label` or `aria-labelledby` names the fieldset; otherwise required text), `hint`, `error`, `required` (single selection: each radio is required and a failed submission marks the fieldset `aria-invalid` until a choice or a reset; not enforced in multiple mode, use `MultiSelect` or `error`), `name` and `form` (on the radios and hidden inputs, never on the fieldset), `variant: segmented\|outline`; string `v-model` uses native radio selection (`label > input[type=radio] + text`); `multiple` uses string-array `v-model` and `button.hw-button[data-variant=secondary][data-size=md][aria-pressed]`; `defaultValue` has no default (the empty value is `''`, or `[]` in multiple mode); `disabled`, `readonly` (`aria-disabled` on the options, `data-hw-readonly` on the fieldset); hint and error follow the options; `labelHidden` hides the legend visually (`hw-label hw-sr-only`) while it stays the group's accessible name: use it only where the option texts make the purpose visible, as in a toolbar                                                              |
| `Popover` | `label` (the panel's accessible name; or `aria-label` / `aria-labelledby`, moved from the root to the panel; prints nothing: a visible heading is content referenced with `aria-labelledby`), `triggerLabel` (required unless the `trigger` slot is given), `triggerVariant` (Button variant, default `secondary`), `v-model:open` / `defaultOpen`, `disabled` (an open popover closes); default slot `{close}`; `div.hw-popover-panel[role=region]`; ordinary Tab navigation; closes on Escape from inside (focus returns to the trigger), on an outside press and when focus moves outside (focus stays where it went) |
| `Menu` | `label` (names the menu; or `aria-label` / `aria-labelledby`; not printed on the trigger), `triggerLabel` (required unless the `trigger` slot is given), `triggerVariant` (default `secondary`), `items: {value,label,disabled?,href?}[]`, `v-model:open` / `defaultOpen`, `disabled`; emits `action(value)` once per activation, then closes and focuses the trigger (a link item then navigates). Structure `div.hw-menu > button, div.hw-menu-content[role=menu] > .hw-menu-item` (a disabled button item is `disabled`, a disabled link item `aria-disabled=true` without `href`). Click, Enter or Space on the trigger opens on the first enabled item, ArrowDown / ArrowUp on the first / last; Home/End/ArrowUp/ArrowDown skip disabled items; type-ahead (500 ms, a repeated letter cycles; an unmatched key keeps its default); Escape returns focus; Tab, an outside press or focus moving outside close without moving focus |
| `Drawer`      | Dialog API (required `title` and `closeLabel`) with `side: start\|end\|bottom`; modal native dialog and preserved trigger focus; default/footer/trigger scoped slots inherited                                                                                                                                             |
| `ToastRegion` | `messages: {id,title?,message,tone?,urgent?,dismissible?}[]`, required `label`, `getDismissLabel(message)` (required when a message can be dismissed), `@dismiss="remove"`. Set `variant="banner"` and optionally `position="inline"` or a corner. A dismissal listener enables the close action. |
| `Collapsible` | `label`, boolean `v-model`, `defaultValue`, `disabled` (`summary[aria-disabled=true]` stays focusable; click, Enter and Space change nothing; the application can still set the value); native details/summary with default content slot |
| `TreeView` | `items: {id,label,disabled?,children?}[]`, `label` (or `aria-label` / `aria-labelledby`), selected-id `v-model`, `defaultValue`, `v-model:expanded`, `defaultExpanded`, `disabled`; required `getExpandLabel(node)` / `getCollapseLabel(node)` name `button.hw-tree-toggle` (outside the tab order, for pointer and screen-reader activation: it expands without selecting and focuses the item); each item is named by its label span (`aria-labelledby`); flattened visible tree with level/position, `--hw-tree-depth`, roving focus, RTL expansion arrows and type-ahead over visible nodes. The tree does not submit a value with a native form |
| `Carousel` | Required `label`, `slides: {id,content?}[]`, `previousLabel`, `nextLabel`, `emptyLabel` and one-based `getSlideLabel(position,total)`, which names each slide and indicator and is the live status; `v-model/defaultValue`, `wrap=true`, named slide-ID slots. Without `wrap`, the arrow at the first or last slide is `aria-disabled="true"`, keeps focus and ignores activation; both arrows are `disabled` with fewer than two slides. `showIndicators=true` with `indicatorsLabel` required while indicators are shown; optional `carouselDescription` / `slideDescription` (`aria-roledescription`, omitted when absent); inert inactive slides, explicit navigation and no autoplay. [Source and motion notes](../../docs/nic-carousel.md). |

Popover is a disclosure, not a focus trap. Menu is for commands/navigation;
TreeView does not claim drag-and-drop. Toast and notification dismissal is
caller-owned: update the supplied message array in response to the emitted ID.

## Expanded content and platform patterns

| Component          | Contract                                                                                                                                                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Link` | Native anchor attrs, `href`, `variant`, `disabled` (no `href`, `role=link`, `aria-disabled`, `tabindex=-1`, activation cancelled), `external` (`target="_blank"`; `noopener noreferrer` are added to an authored `rel`) |
| `IconButton`       | Required accessible `label`, `variant`, `size`, `disabled`, `loading`; default decorative icon slot                                                                                                                                                                                        |
| `ButtonGroup` | `role=group` named by `label` (or `aria-label` / `aria-labelledby`, which win); default buttons slot; `variant="default\|attached"`, `orientation` |
| `Chip` | `label` or default slot, `tone`, `variant="soft\|outline"`, `size="sm\|lg"`, `disabled`. `@remove` renders a plain remove button (no `hw-button` class) named by the then-required `remove-label`; the chip does not remove itself. When the application removes a chip whose button had focus, focus moves to the next chip's remove button, else the previous one; when the last chip goes, the application places focus |
| `DescriptionList` | `items: {term,description}[]`, `variant: stacked\|horizontal\|compact` (stacked by default, no `data-variant`); `item:index` slots receive `{item}` |
| `Stat` | `label`, string/number `value` printed as given, `description`, `trend`; `#value` and `#trend` slots take rich content and win over the props (for example the riyal pattern of [docs/saudi-riyal.md](../../docs/saudi-riyal.md)); `tone`, `variant="plain"`, `trendTone` (on the trend); no `locale`: format the number in the application (`formatNumber(value, { locale })` from `@hawiyah/core`) |
| `Timeline` | `label` (or `aria-label` / `aria-labelledby`), `items: {id,title,description?,dateTime?,dateLabel?,status?: complete\|current\|upcoming}[]`; `li.hw-timeline-item` with `h3`, `time`, `p`; `dateLabel` is the visible date and `dateTime` the ISO value (no `time` without `dateLabel`); named item-ID slots; `aria-current="step"` on the current item |
| `Meter` | One native `meter.hw-meter` named by `label` (or `aria-label` / `aria-labelledby`); defaults `min` 0, `max` 100, `value` 0; `low`, `high`, `optimum` only when given; no visible label and no size option |
| `AvatarGroup` | Required `label` and `getOverflowLabel(count)`, `items: AvatarItem[]` (`{name,src?,initials?,size?,variant?}`), `max` |
| `DataTable` | `caption`, `rows: Record<string,unknown>[]`, `columns: {key,label,cell?,sortable?,rowHeader?}[]`, `rowKey`, required `locale` (sorts text with `sortRows`; without it the rows keep their source order) and `emptyMessage`; `v-model:sort-key`, `v-model:sort-direction` (each notified only when it changed), initial `defaultSortKey` / `defaultSortDirection`; optional `getSortLabel(column,nextDirection)` (without it a sort button is named by the column label and `aria-sort` carries the state); scoped `cell-<key>` slots receive `{row,index,column}` and win over `cell(row,index)`; `div.hw-table-wrap.hw-data-table[role=region]` named by the caption |
| `ServiceCard` | `title`, `description`, `category` (a neutral badge before the `h3`), `metadata: {term,description}[]` (a stacked `dl.hw-description-list` in the body, only with entries), `href`, `actionLabel` (required when `href` is set and no `action` slot is given); `icon` (in `div.hw-service-card-icon[aria-hidden]`), default and `action` slots. Card anatomy: header, body, footer with the action (`a.hw-link` from `href`, or the slot); no footer without either |
| `ServiceDetails` | `title`, `description`, `metadata: {term,description}[]` (a stacked `dl.hw-description-list`), `requirements: string[]` with `requirementsLabel` (required when requirements are given; `section > h3, ul`), scoped `#requirement="{item, index}"` slot for rich entries; default slot; the `action` slot renders in a `footer`, last child of `article.hw-service-details` |
| `PortalHeader` | `brand` and/or `brand` slot artwork, `brandLabel`, `homeHref` (default `/`; empty renders the brand as a `div`, with `role=img` and `aria-label` when `brandLabel` is given), `links: {label,href,current?}[]`, required `navigationLabel` and `menuLabel`, `mainId` with `skipLabel`; `v-model:open` / `defaultOpen` (the navigation disclosure below 48rem: toggle, Escape, outside press, focus leaving and link activation each notify once); `brand`, `notice` and `actions` slots (the notice renders in `div.hw-portal-notice` between the skip link and the brand; actions in `div.hw-portal-header-actions` after the navigation, which replaces `hw-portal-actions`; each container only when its slot is given). Optional top-level `groups` contain a label and child links; one press on another group heading opens it and closes the open one. See [portal layout](PORTAL.md). See [grouped navigation](../../docs/nic-portal-navigation.md). |
| `PortalFooter`     | `brand` and/or `brand` slot, `brandLabel`, `copyright`, `links`, `groups`, `legalLinks`, `description`; required `externalLabel`; `navigationLabel` when `links` are given, `legalLinksLabel` when `legalLinks` are given, `supportLabel` with the `support` slot; default content slot                                                                                                                                                                                                                            |
| `Feedback` | A `div.hw-feedback[role=group]` named by the visible question `label` (a `p`; or `aria-label` / `aria-labelledby`); required `yesLabel`, `noLabel`, `commentLabel`, `submitLabel`, `successMessage`. `v-model` is a core `FeedbackValue` `{helpful: boolean \| null, comment}` (`defaultValue` `{helpful: null, comment: ''}`); the two choices are pressed-state buttons in `div.hw-feedback-actions`; after the first choice `div.hw-feedback-comment` holds the comment `Textarea` and the submit button, which emits `feedback(value)` and fills the `p[role=status]`; a later change empties it. `disabled` disables every control. Nothing is sent anywhere and the component takes no part in form submission |
| `CookieConsent` | A `section` named by its `title` heading (`aria-labelledby`; an application `aria-label` / `aria-labelledby` wins); required `description`, `acceptLabel`, `rejectLabel`; `v-model:open`, `defaultOpen=true`; Accept (primary) and Reject (secondary) emit `consent('accepted' \| 'rejected')` (core `ConsentChoice`) and close; `@preferences` renders the last, ghost button with the then-required `preferencesLabel`; `policyHref` renders a policy link after the description, with the then-required `policyLabel`. `variant="banner"` is fixed at the block end: it must not cover focused controls (WCAG 2.4.11), so give the page matching end padding while it is open. No hidden storage or third-party initialization; persistence and focus after closing belong to the application |
| `NotificationList` | A `section` named by the visible `label` heading (`h2`; or `aria-label` / `aria-labelledby` without one); items `{id,title,description?,href?,dateTime?,dateLabel?,read?}` render `li[data-state=unread\|read]` with an `h3` title (an `a.hw-link` with `href`) and an info badge showing the required `unreadLabel` on unread items; required `emptyMessage` (a plain `p` when there are no items). `@read(id)` with the then-required `getMarkReadLabel(item)` (text button on unread items); `@dismiss(id)` with the then-required `getDismissLabel(item)` (icon button). The list is application state: after an action focus moves to the same control of the next item, else the previous one, else the list (`tabindex="-1"` while an action is bound); named ID slots |

DataTable sorting is immutable, stable and uses the application's `locale`. It remains a native table;
use the existing Table component for unrestricted table composition. Platform
patterns render content supplied by the application: no government seals, trust
verification, identity verification, analytics or backend service are implied.
Feedback emits data for the consuming application to persist; CookieConsent
emits decisions for the application to enforce and persist.

Loading: wrap skeletons in a status container with a visually hidden text of
your own, and replace the whole container when the content arrives.

```vue
<div role="status"><span class="hw-sr-only">{{ loadingText }}</span>
  <Skeleton variant="text" style="inline-size: 70%" /><Skeleton style="block-size: 4rem" /></div>
```

## Layout primitives

All layout primitives forward native HTML attributes and accept `as` (default
`div`, or `section` for Section). Shared `LayoutProps` includes:

- `gap` and `padding`: token numbers 0–16 or CSS length strings, optionally
  responsive `{base,sm,md,lg,xl}` objects.
- `align: start|center|end|stretch|baseline`,
  `justify: start|center|end|between|around|evenly`, and `wrap`.
- `columns`: a positive number or responsive object; `minItemWidth` opts into
  adaptive auto-fit columns instead.
- `side: start|end`, `sidebarWidth`, `collapseAt: sm|md|lg`, `maxWidth`, `ratio`.

| Component     | Composition                                                                                                           |
| ------------- | --------------------------------------------------------------------------------------------------------------------- |
| `Container`   | Constrained centered content, optional `maxWidth`                                                                     |
| `Stack`       | Vertical flex layout                                                                                                  |
| `Inline`      | Horizontal flex layout with optional wrapping                                                                         |
| `Grid`        | Responsive explicit or adaptive grid                                                                                  |
| `Columns`     | Same grid contract with a column-composition semantic name                                                            |
| `Sidebar`     | First child is sidebar, second child is main content; `side` changes visual placement, `collapseAt` controls stacking |
| `Center`      | Centered flex content                                                                                                 |
| `Spacer`      | Flexible empty space; keep decorative                                                                                 |
| `AspectRatio` | Media frame with positive `ratio`, e.g. `16 / 9`                                                                      |
| `Section`     | Semantic section; name it with native `aria-label` or a heading                                                       |
| `AppShell`    | Use `header`, `sidebar`, default main content and `footer` slots. The skip link (required `skipLabel`) focuses main; set `mainId` to choose its target ID. |
| `PageHeader` | `title` (required unless the `#title` slot gives rich heading content), `description`, heading `level=1` (truncated and clamped to 1..6); `title`, `breadcrumb`, `actions`, default slots; outer element is always header |

```vue
<Container max-width="72rem">
  <Stack :gap="{ base: 4, lg: 8 }">
    <PageHeader title="خدماتك" description="اختر الخدمة المناسبة">
      <template #actions><Button>طلب جديد</Button></template>
    </PageHeader>
    <Grid :columns="{ base: 1, md: 2, lg: 3 }" :gap="4">
      <ServiceCard title="تجديد طلب" description="راجع التفاصيل ثم قدّم الطلب."
        href="/services/renew" action-label="بدء الخدمة" />
      <ServiceCard title="متابعة طلب" href="/requests" action-label="عرض الطلبات" />
    </Grid>
  </Stack>
</Container>
```

Breakpoints are CSS-only: sm 40rem, md 48rem, lg 64rem, xl 80rem. Server and
client emit identical custom properties through shared `layoutStyles`; no
viewport measurements or hydration-dependent layout branches are used.

Maps, rich text, charting, code editors, PDF viewers, CAPTCHA and payments are
integration boundaries. Mount the chosen provider in a named Section/Card or
AspectRatio with its own accessible fallback and documented data contract. Hawiyah
does not simulate these engines or handle provider credentials or transactions.

## Navigation, verification and upload patterns

| Component          | API |
| ------------------ | --- |
| `MobileTopBar`     | Required `title`; `subtitle`, `variant="main|internal"`, `headingLevel` (1); `backHref` with `backLabel` (required when `backHref` is set); `leading`, `title`, `subtitle`, `actions` slots |
| `NavigationDrawer` | Drawer API: `v-model:open`, `defaultOpen`, `closeOnBackdrop`, `side="start|end"`, `description`; required `title`, `items`, `navigationLabel` and `closeLabel`; `trigger`, `user` and `footer` slots. Items `{id, label, href?, icon?, current?, disabled?, expanded?, children?}`: the group that holds the current page, or has `expanded: true`, is rendered open (the reader's own toggles stand until that value changes). A link click closes the drawer unless it was prevented, or when core `bindLinkNavigation` handed it to the router |
| `SideNavigation`   | Required `items` (the `NavigationDrawer` item model; `SideNavigationItem` is the same type) and `label` (or `aria-label` / `aria-labelledby`); `sticky` (false). See [side navigation](#side-navigation) |
| `CopyButton`       | Required `text` (string or function read at activation), `label`, `copiedMessage` and `failedMessage`; `display="icon\|text"` (icon), `variant` (ghost), `size` (md), `feedbackDuration` (3000), `disabled`; emits `copyResult({status, text})`. See [copy button](#copy-button) |
| `SiteVerification` | `v-model:open`, `defaultOpen`; required `label`, `detailsLabel`, `domainLabel`, `domainDescription`, `httpsLabel`, `httpsDescription`; `domain`; `registrationHref` with `registrationNumber` and `registrationLabel` (required when `registrationHref` is set) and `externalLabel` (required when `registrationExternal`, default on, applies); `mark` and default slots |
| `FileUploadList`   | `items`, `disabled`, `removable`; required `labels` (core `FileUploadLabels`: `selected`, `uploading`, `complete`, `error`, `remove`, `getProgressLabel(name)`, `getRemoveLabel(name)`); emits `remove(id)` |

## Portal shell

[`PortalLayout`, `PortalHeader` and `SecondaryNav`](PORTAL.md) provide a complete
portal shell with responsive navigation, breadcrumbs and footer; the application supplies every label.
`PortalLayout` requires `skipLabel`, `menuLabel` and `navigationLabel` in every use,
`secondaryLabel` with `secondaryNavigation`, `breadcrumbLabel` with `breadcrumbs` and
`footerLabel` with `footerLinks`.
Run the Vue example with `?preview=portal` to use the native composed shell.

## NIC card composition

See [cards](../../docs/nic-cards.md) for source-mapped spacing, variants, whole-card links, disabled semantics and content classes. Native framework consumers include `?preview=nic`; vanilla uses the documented semantic HTML recipe.

See [NIC button variants](../../docs/nic-buttons.md) for all ten appearances,
interaction states, dark-surface use and density adaptations.

[Ready component examples](../../docs/ready-component-examples.md) cover all five
alert/notification tones, header/footer composition and guide-only navigation containment.
# Native choice read-only state

`Checkbox`, `Radio` and `Switch` accept `readonly`, the spelling of every other
Vue control.
The control remains keyboard-focusable and submits its value, while pointer and
keyboard activation leave its value and radio peers unchanged. Disabled remains
a separate native state. See [NIC states](../../docs/nic-choices.md).


[Site verification](../../docs/site-verification.md) composes a native disclosure above the header with deployment-owned domain and certificate information. [Grouped portal footers](../../docs/nic-footer.md) add navigation groups, support actions, legal links and identity slots.

[Link and breadcrumb states](../../docs/nic-links.md) document neutral/standalone variants, disabled destinations, source contrast substitutions and native adapter APIs.


### Table presentation and empty results

`Table` and `DataTable` expose `variant="default|striped|bordered"`,
`size="sm|md|lg"`; `emptyMessage` is required for `DataTable` and for `Table` when `columns` is given. DGA cells have a 48px default minimum;
40px/56px alternate sizes and striped/bordered variants are Hawiyah extensions.
Captions name keyboard-focusable horizontal scroll containers; row-header
columns render native `th scope="row"`. Empty data spans the column count and
shows the application's `emptyMessage`. Sorting does not mutate caller records.
React/Vue native `data-variant` and `data-size` attributes remain supported;
typed props take precedence. `wrapperProps` customizes the scroll container.
Pass `getSortLabel` to name sort buttons; without it they are named by the column label.
See [table evidence and adaptations](../../docs/nic-tables.md).

Rating inputs select whole numbers; finite prefilled values are clamped to the normalized maximum and floored. Fractional averages belong in `RatingDisplay`. Nonfinite maxima fall back to 5 and nonfinite values to 0. Labels come from `getRatingLabel` / `getValueLabel`.


### Search suggestions

SearchField accepts local string suggestions and remains a free-text input.
With suggestions supplied it exposes an editable combobox/listbox, highlighted
matches and a polite result count. Arrow keys wrap through matches; Enter on an
active suggestion selects it and prevents form submission. Ordinary Enter with
no active suggestion emits `search` with a trimmed, nonempty query and keeps
native form submission available. Choose either the search callback or the
form's submit handler for the application request; wiring both duplicates it.
The optional icon search action is a non-submit button and uses the callback.
`clearLabel` and, with the search button, `searchLabel` are application text.

Escape dismisses an open list before reaching an enclosing dialog; another
Escape can dismiss the dialog. Composition/modifier keys do not commit matches.
Readonly inputs remain searchable but cannot edit/clear/select suggestions;
disabled inputs cannot search. Blur, outside press, reset and changed suggestion
configuration clear active-option state. No remote search service is called.

### Content navigation

`ContentNavigation` follows application-owned section IDs using nested
`items: {id, label, disabled?, children?}[]`. Options are a required `label` (the
landmark name and heading text), `showHeading` (true), `sticky` (false),
`scrollRoot` (null/window), `offset` (80px) and `updateHash` (false; when true the
resolved URL is written with `history.replaceState`). `@current-change="onCurrentChange"` reports the current section ID. Links render `href="#id"` and are bound with core `bindFragmentLink`. Ordinary
activation scrolls without changing the URL by default; keyboard activation also focuses
the target. Modified anchor clicks retain browser behavior. Disabled entries
remain noninteractive text links; no section content is created or hidden.

```vue
<script setup>
import {ContentNavigation} from '@hawiyah/vue';
const sections = [{id: 'requirements', label: 'المتطلبات'}];
</script>
<template>
  <ContentNavigation label="في هذه الصفحة" :items="sections" />
  <section id="requirements"><h2>المتطلبات</h2></section>
</template>
```
Each activation reports one change: the marker does not step through the
sections a smooth scroll passes, and stays on the target the reader chose.

### Copy button

`CopyButton` copies a value with the asynchronous Clipboard API (core
`createCopyFeedback`); it never reads the clipboard and has no `execCommand`
fallback. Place it beside the visible value it copies.

```vue
<script setup>
import {CopyButton} from '@hawiyah/vue';
const command = 'pnpm add @hawiyah/vue';
function onCopyResult({status}) { if (status !== 'copied') showManualCopy(); }
</script>
<template>
  <code>{{ command }}</code>
  <CopyButton :text="command" label="نسخ الأمر" copied-message="تم النسخ"
    failed-message="تعذر النسخ، حدد النص وانسخه يدويا" @copy-result="onCopyResult" />
</template>
```

| Prop | Contract |
| ---- | -------- |
| `text` | Required. A string, or a function called at activation and never before. Written unchanged (no trimming); an empty or white-space value is the `empty` outcome |
| `label` | Required text. The constant accessible name (`aria-label` in the icon display) and the visible text in the text display; it never changes with the state |
| `copiedMessage` | Required text. Status text after a successful copy |
| `failedMessage` | Required text. Status text after any failure (`denied`, `unavailable`, `failed`, `empty`), shown visibly until the next activation |
| `display` | `'icon'` (default) or `'text'` |
| `variant`, `size` | Button variants (default `ghost`) and `sm\|md\|lg` (default `md`) |
| `feedbackDuration` | Milliseconds the copied state lasts (3000; a value that is not a finite number above zero means 3000) |
| `disabled` | Native `disabled` on the button |

The three texts are checked on every render, so a missing message warns before a
copy ever fails; a missing one renders nothing in its place. The root
`span.hw-copy` carries `data-state="idle|copied|failed"`, the icon follows the
state (`copy-01`, `tick-02`, `alert-02`) and `span.hw-copy-message`
(`role="status"`) holds the message. Each activation first returns to idle, so a
repeated message is announced again. A result that settles at once (an empty text,
no Clipboard API) empties and fills the status inside one task; that an identical
message is then repeated has not been verified with a screen reader. `copyResult` fires once per activation that
still counts, with core `CopyResult` `{status, text}` (`CopyStatus` and
`CopyResult` are exported as types); a later activation overtakes an earlier one,
and a result after unmount is ignored. When the status is not `copied` the
application may offer manual copying, for example by selecting the value. `class`
and `style` go to the root; other attributes and listeners go to the button, and
the exposed `focus()` focuses it. Focus never moves.

### Side navigation

`SideNavigation` renders the `NavigationDrawer` list in a page column: a
`nav.hw-side-navigation.hw-navigation-drawer-nav` with native links and native
`details` groups, and no script beyond revealing the current link. Feed the same
array to `NavigationDrawer` for phones, and mark the current page through
`current` on each route change.

```vue
<script setup>
import {NavigationDrawer, SideNavigation} from '@hawiyah/vue';
const items = [
  {id: 'start', label: 'البدء', href: '/start'},
  {id: 'components', label: 'المكونات', children: [{id: 'button', label: 'الزر', href: '/components/button', current: true}]},
];
</script>
<template>
  <SideNavigation label="أقسام الدليل" :items="items" sticky />
</template>
```

Items are `{id, label, href?, icon?, current?, disabled?, expanded?, children?}`.
A disabled entry is text with `aria-disabled="true"` and its children are not
rendered; an entry with children is a group; a group with its own `href` repeats
itself as the first link inside. A group is open when it holds the current page or
has `expanded: true`; the reader's toggles stand until that value changes. `label`
(required text, or `aria-label` / `aria-labelledby`) names the landmark. `sticky`
writes `data-sticky="true"`, which makes the nav sticky from 64rem with its own
scroll box; `--hw-side-navigation-top` and `--hw-side-navigation-bottom-reserve`
set its offset and the space kept below it. After mounting and whenever the
current page changes, the current link is centred inside the nav's own scroll
box, without animation, without scrolling the page and without moving focus.

## Client-side routing

Packaged links keep their `href`. To route them through Vue Router, bind core
`bindLinkNavigation` once in the root component:

```js
import {onBeforeUnmount, onMounted} from 'vue';
import {useRouter} from 'vue-router';
import {bindLinkNavigation} from '@hawiyah/core';
const router = useRouter(); let links;
onMounted(() => { links = bindLinkNavigation(document, {navigate: ({path}) => { void router.push(path); }}); });
onBeforeUnmount(() => links?.destroy());
```

One delegated click listener hands same-origin links inside the base path (the
`base` option, else a same-origin `<base href>`, else `/`) to `navigate`. Left to
the browser: modified or non-primary clicks, clicks already prevented, links with
`target`, `download` or `rel="external"`, disabled, inert or editable links, links
outside the base path and fragment links to the current document; `navigate`
returning `false` also leaves the click alone. `NavigationDrawer` closes after a
routed click. Focus, route announcements, scroll restoration and `aria-current`
after navigation remain the application's.
