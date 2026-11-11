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
`Dialog` exposes `element`, `show()` and `close()`. `Combobox` adds `close()`.

Text inputs, select, combobox, tabs and pagination use `v-model`; omitting it
uses internal state initialized by `defaultValue`. Checkbox/switch values are
booleans; radio values are strings matched against the radio's `value` prop.
`Dialog` uses `v-model:open` / `defaultOpen`. Form reset emits model defaults so
both controlled and uncontrolled controls can return to their initial state.
Use `defaultValue` alongside `v-model` if a nonempty reset value is desired.

For radios sharing a form and `name`, set `defaultValue` to the option that
should be checked after a reset. The group emits that value once. A group
without a checked default resets to an empty string.

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
passed to the root satisfies it. Such root names (`AvatarGroup`, `Breadcrumb`,
`Calendar`, `Carousel`, `ContentNavigation`, `NotificationList`, `Pagination`,
`SecondaryNav`, `Spinner`, `Stepper`, `Timeline`, `ToastRegion`, `TreeView`, and
the field label of `DatePicker`, `FileDropzone` and `SearchField`) are declared without
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

## Catalog

| Export                  | Main contract                                                                                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                | `variant`, `size`, `loading`; defaults to `type="button"`                                                                                                             |
| `Field`                 | `label`, `hint`, `error`, `required`, `controlId`; provides association to a child field control; scoped default slot exposes IDs for native controls                 |
| `TextField`, `Textarea` | String `v-model`, `defaultValue`, field decoration; standard input/textarea attributes                                                                                |
| `Select`                | String `v-model`, `options: Option[]`; native option children also accepted                                                                                           |
| `Checkbox`, `Switch`    | Boolean `v-model`, `defaultValue`, label/hint/error; checkbox supports `indeterminate`                                                                                |
| `Radio`                 | String `v-model`, `value`, shared native `name`; group inside a fieldset with a legend                                                                                |
| `Combobox`              | String `v-model`, `options`, `disabled`, `readonly`; required `emptyMessage` and `getResultsMessage(count)`; `requiredMessage` when `required` is set; emits `update:query`, `update:open` |
| `Tabs`                  | `items`, required `label`, string `v-model`, `orientation`, `activationMode`, `overflow: menu/scroll` (default menu), `overflowLabel` (required when `overflow` is `menu`); item content or named value slots, optional `tab:value` label slots. Compact horizontal containers move excess labels into a keyboard-accessible disclosure; vertical tabs remain visible. |
| `Dialog`                | Required `title` and `closeLabel`, `description`, `closeOnBackdrop`; default/footer slots receive `{close}`, trigger slot receives `{open}`                                       |
| `Accordion`             | `items: {value,title,content?,open?}[]`, `exclusive`; native details, named value content slots; emits `toggle(value,open)`                                           |
| `Card`                  | `header`, default and `footer` slots                                                                                                                                  |
| `Badge` | Static label; `tone="neutral\|success\|warning\|danger\|info"`, `variant="soft\|outline\|dot"`; [source and adaptations](../../docs/nic-badges.md). |
| `Alert`                 | `tone: info                                                                                                                                                           | success | warning | danger`, `title`; defaults to status, or alert for danger; native role can override |
| `Table`                 | `columns`, `rows`, `rowKey`, `caption`; `emptyMessage` when `columns` is given; column `{key,header,cell?,rowHeader?}`; named `cell:key` slots receive `{row,index}`; omit columns to compose native children |
| `Pagination` | Numeric `v-model`/`defaultValue`, `totalPages`, required `label`, `previousLabel`, `nextLabel`, `getPageLabel(page)`, `formatPage(page)`, `siblingCount=1`, `disabled`, `hideOnSinglePage=false`. Ellipsis disclosures use required `getGapLabel(start,end)`, `jumpLabel`, `goLabel`; gaps above 100 pages use bounded integer entry. Parent fetches/slices data; no navigation or scrolling is imposed. |
| `Breadcrumb`            | `items: {label,href?,current?}[]`, `label` (or `aria-label` / `aria-labelledby`)                                                                                                                 |
| `Progress`              | Required `label`, optional value for determinate mode, `max=100`                                                                                                      |
| `Skeleton`              | Decorative hidden span, size using native style/class                                                                                                                 |
| `Spinner`               | Status named by `label`, `aria-label` or `aria-labelledby` (not needed when the application marks it `aria-hidden="true"`)                                                                       |
| `Avatar` | Required `name`; optional `src`, `initials`, `size="40\|64\|80\|120\|sm\|md\|lg\|xl"`, `variant="circle\|square"`. Failed images fall back to initials; changing `src` retries. [Source notes](../../docs/nic-avatars.md). |
| `Divider`               | Native `hr`                                                                                                                                                           |
| `Tooltip`               | Plain `content`, one focusable trigger in default slot; description IDs merge with the trigger                                                                        |
| `FileUpload`            | Native input attributes plus field decoration; emits `update:files(File[])`; optional default slot                                                                    |
| `Stepper`               | `items: {value,label,description?,status?}[]`, `current`, required `label`                                                                                            |
| `EmptyState`            | `title`, `description`; `icon`, default, `action` slots                                                                                                               |

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

The package now exports **77 components**: the original 27 and these 50 additions.
All use native Vue rendering, shared CSS, and the same attrs/slots conventions.

| Component       | Props, models and events                                                                                                                                                                                                                                                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `InputGroup`    | `prefix`, default and `suffix` slots; the consuming field supplies its label                                                                                                                                                                                                                                                                   |
| `PasswordField` | String `v-model`, `defaultValue`, field decoration, `disabled`, `readonly`; required `showLabel`, `hideLabel` name the reveal button (and are its text with `toggleVariant="text"`); input and button form one input group                                                                                                                                                                         |
| `SearchField`   | String `v-model`, `defaultValue`, field decoration, required `clearLabel`; optional `suggestions`, `maxSuggestions` (8), `getResultsMessage(count)` (required when `suggestions` are given), `showSearchButton` (false), `searchLabel` (required when `showSearchButton` is on; it names the button only, the input is named by `label`); emits `search(query)`. Input attributes and exposed `element`/`focus()` remain supported. |
| `NumberField`   | `v-model: number \| ''`; native `min`, `max`, `step` and `required`; clearing preserves an empty value instead of inventing zero                                                                                                                                                                                                               |
| `Slider`        | Numeric `v-model`, `defaultValue`, `min=0`, `max=100`, `step=1`, field decoration, `disabled`, `readonly`; native range keyboard behavior                                                                                                                                                                                                      |
| `RangeSlider`   | Tuple `v-model: readonly [number,number]`, `defaultValue`, `min`, `max`, `step`; `label`, required `lowerLabel` and `upperLabel`, `lowerName`, `upperName`; two native ranges enforce lower ≤ upper                                                                                                                                                        |
| `Rating`        | Numeric `v-model`, `defaultValue`, `max=5` (1–20), native `name`, `required`, `label`, `hint`, `error`, `disabled`, `readonly`; required `getRatingLabel(value,max)` names each native radio                                                                                                                                                           |
| `RatingDisplay` | Numeric `value=0`, `max=5` (1–20), `showValue=true`, `getValueLabel(value,max)`, which returns the whole text alternative, required unless the application passes `aria-label` (which wins) or `aria-labelledby` (then no `aria-label` is written); noninteractive fractional aggregate score with one accessible image name. |
| `PinInput`      | String `v-model`, `length=6`, field decoration; one input with `one-time-code`, numeric keyboard, native length/pattern; normalizes Arabic-Indic/Eastern digits; emits `complete(value)`                                                                                                                                                       |
| `TagInput`      | String-array `v-model`, `defaultValue`, `name`, `required`, field decoration; Enter/comma adds unique trimmed tags; Backspace on an empty draft removes the last tag; required `getRemoveLabel(tag)`; `requiredMessage` when `required` is set                                                                                                                                  |
| `MultiSelect`   | String-array `v-model`, `defaultValue`, `options`, `label`, required `searchLabel` (names the filter input) and `emptyMessage`; `requiredMessage` when `required` is set; normalized search and native checkboxes, repeated hidden values for `name`; no combobox role                                                                                                                                     |
| `Calendar`      | ISO-string `v-model`, `defaultValue`, `month`, `min`, `max`, `locale`, `calendar`, `weekStartsOn`, `isDateDisabled(value)`; required `locale` (month and weekday names come from Intl; without it only the root and hidden input render), `label` (or `aria-label` / `aria-labelledby`), `previousLabel`, `nextLabel`; `unsupportedMessage` and `rangeLabel` when `calendar` is `islamic-umalqura`; optional `getDayLabel(value)` overrides the Intl day name; emits `update:month` when browsing                                                                                                                    |
| `DatePicker`    | Calendar props plus field decoration and string `v-model`; custom ISO text input and modal Calendar; `v-model:calendar` switches `gregory` / `islamic-umalqura` while preserving ISO value; `calendarSwitchable=true`; required `locale`, `label` (or `aria-label` / `aria-labelledby`), `calendarLabel`, `openLabel`, `closeLabel`, `previousLabel`, `nextLabel`, `calendarSystemLabel`, `gregorianLabel`, `hijriLabel`, `rangeLabel`, `invalidMessage`, `unsupportedMessage`; `unavailableMessage` when `isDateDisabled` is given; optional `placeholder` (no default) |
| `FileDropzone`  | Field decoration, native `name`/`form`, `accept`, `multiple`, `maxSize` in bytes, `disabled`, `readonly`, required `dropLabel` (the visible instruction, which describes the input; without it no instruction paragraph is rendered and the input's `aria-describedby` does not reference it); optional `getSelectedMessage(files)` renders a selection status; emits `update:files(File[])` and `reject(File[])`; valid drops populate the native file input, invalid batches clear it. The input is named by `label`, a parent `Field` label, `aria-label` or `aria-labelledby`; `dropLabel` no longer doubles as the field label                                                                                                 |

Value controls support form reset. Arrays reset to `defaultValue`; native file
controls reset to no files. `TagInput` and `MultiSelect` validate committed
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
| `ToggleGroup` | `options`, `label`, `variant: segmented\|outline`; string `v-model` uses native radio selection; `multiple` uses string-array `v-model` and pressed buttons; `defaultValue`, native `name`/`form`, `disabled`, `readonly`                                                              |
| `Popover`     | `label`, `triggerLabel`, `v-model:open` / `defaultOpen`, `disabled`; optional trigger content slot; default slot `{close}`; labelled region, ordinary Tab navigation, outside press and Escape dismissal                                                                               |
| `Menu`        | `label`, `items: {value,label,disabled?,href?}[]`; optional trigger content slot; emits `select(value)`; Home/End/ArrowUp/ArrowDown skip disabled items, Escape returns focus, Tab exits normally                                                                                      |
| `Drawer`      | Dialog API (required `title` and `closeLabel`) with `side: start\|end\|bottom`; modal native dialog and preserved trigger focus; default/footer/trigger scoped slots inherited                                                                                                                                             |
| `ToastRegion` | `messages: {id,title?,message,tone?,urgent?,dismissible?}[]`, required `label`, `getDismissLabel(message)` (required when a message can be dismissed), `@dismiss="remove"`. Set `variant="banner"` and optionally `position="inline"` or a corner. A dismissal listener enables the close action. |
| `Collapsible` | `label`, boolean `v-model`, `defaultValue`, `disabled`; native details/summary with default content slot                                                                                                                                                                               |
| `TreeView`    | `items: {id,label,disabled?,children?}[]`, `label`, selected-id `v-model`, `defaultValue`, `v-model:expanded`, `defaultExpanded`, `disabled`; required `getExpandLabel(node)` / `getCollapseLabel(node)`; flattened visible tree with level/position, roving focus and RTL expansion arrows |
| `Carousel` | Required `label`, `slides: {id,content?}[]`, `previousLabel`, `nextLabel`, `emptyLabel` and one-based `getSlideLabel(position,total)`, which names each slide and indicator and is the live status; `v-model/defaultValue`, `wrap=true`, named slide-ID slots. `showIndicators=true` with `indicatorsLabel` required while indicators are shown; optional `carouselDescription` / `slideDescription` (`aria-roledescription`, omitted when absent); inert inactive slides, explicit navigation and no autoplay. [Source and motion notes](../../docs/nic-carousel.md). |

Popover is a disclosure, not a focus trap. Menu is for commands/navigation;
TreeView does not claim drag-and-drop. Toast and notification dismissal is
caller-owned: update the supplied message array in response to the emitted ID.

## Expanded content and platform patterns

| Component          | Contract                                                                                                                                                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Link`             | Native anchor attrs, `href`, `disabled`, `external`; external links use `noopener noreferrer`                                                                                                                                                                                              |
| `IconButton`       | Required accessible `label`, `variant`, `size`, `disabled`, `loading`; default decorative icon slot                                                                                                                                                                                        |
| `ButtonGroup`      | Required `label`; default buttons slot; native `data-variant` / `data-orientation` for shared CSS variants                                                                                                                                                                                 |
| `Chip`             | `label` or default slot, `tone`, `removable`, `removeLabel` (required when removable), `disabled`; emits `remove`                                                                                                                                                                                                    |
| `DescriptionList`  | `items: {term,description}[]`, `variant: stacked\|horizontal\|compact`; `item:index` slots receive `{item}`                                                                                                                                                                                |
| `Stat`             | `label`, string/number `value` rendered as given, `description`, `trend`; no `locale`: format the number in the application (`formatNumber(value, { locale })` from `@hawiyah/core`)                                                                                                                                                                                          |
| `Timeline`         | Required `label`, `items: {id,title,description?,date?,dateLabel?,status?}[]`; named item-ID slots; machine-readable native time, optional current step                                                                                                                                             |
| `Meter`            | Required `label`, `value`; native `min`, `max`, `low`, `high`, `optimum` semantics                                                                                                                                                                                                         |
| `AvatarGroup`      | Required `label` and `getOverflowLabel(count)`, `items: {name,src?,initials?}[]`, `max`                                                                                                                                                                                                                  |
| `DataTable`        | `caption`, `rows: Record<string,unknown>[]`, `columns: {key,label,sortable?,rowHeader?}[]`, `rowKey`, required `locale` (sorts text with `sortRows`; without it the rows keep their source order) and `emptyMessage`; `v-model:sort-key`, `v-model:sort-direction`, initial `defaultSortKey` / `defaultSortDirection`; optional `getSortLabel(column,nextDirection)` (without it a sort button is named by the column label and `aria-sort` carries the state); `cell:key` slots receive `{row,index}` |
| `ServiceCard`      | `title`, `description`, `href`, `actionLabel` (required when `href` is set and no `action` slot is given), `badge`, `metadata`; `icon`, default and `action` slots                                                                                                                                                                                     |
| `ServiceDetails`   | `title`, `description`, DescriptionList `items`; default and `action` slots                                                                                                                                                                                                                |
| `PortalHeader`     | `brand` and/or `brand` slot artwork, `brandLabel`, `homeHref`, `links: {label,href,current?}[]`, required `navigationLabel` and `menuLabel`, `mainId` with `skipLabel`; `brand`, `actions` slots. Optional top-level `groups` contain a label and child links. See [portal layout](PORTAL.md). See [grouped navigation](../../docs/nic-portal-navigation.md). |
| `PortalFooter`     | `brand` and/or `brand` slot, `brandLabel`, `copyright`, `links`, `groups`, `legalLinks`, `description`; required `externalLabel`; `navigationLabel` when `links` are given, `legalLinksLabel` when `legalLinks` are given, `supportLabel` with the `support` slot; default content slot                                                                                                                                                                                                                            |
| `Feedback`         | Required `label`, `yesLabel`, `noLabel`, `successMessage`; required `commentLabel` and `submitLabel` (the comment field appears once the reader answers); selected answer string `v-model` (`yes`/`no`), `defaultValue`, `disabled`, `readonly`; emits `submit({value,comment})`                                                                                            |
| `CookieConsent`    | `v-model:open`, `defaultOpen=true`, required `title`, `description`, `acceptLabel`, `rejectLabel`; `preferencesLabel` when `@preferences` is bound (the preferences action is rendered only then); `policyHref` renders a policy link after the description, and `policyLabel` is required then; emits `accept`, `reject`, `preferences`; no hidden storage or third-party initialization                                                                            |
| `NotificationList` | `label`, `items: {id,title,description?,date?,dateLabel?,read?,href?}[]`, required `label` and `emptyMessage`, `getMarkReadLabel(item)` when `@read` is bound and `getDismissLabel(item)` when `@dismiss` is bound (each action is rendered only while its listener is bound); emits `read(id)`, `dismiss(id)`; named ID slots                                                                                                         |

DataTable sorting is immutable, stable and uses the application's `locale`. It remains a native table;
use the existing Table component for unrestricted table composition. Platform
patterns render content supplied by the application: no government seals, trust
verification, identity verification, analytics or backend service are implied.
Feedback emits data for the consuming application to persist; CookieConsent
emits decisions for the application to enforce and persist.

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
| `PageHeader`  | `title`, `description`, heading `level=1`; `breadcrumb`, `actions`, default slots; outer element is always header     |

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
| `NavigationDrawer` | Drawer API: `v-model:open`, `defaultOpen`, `closeOnBackdrop`, `side="start|end"`, `description`; required `title`, `items`, `navigationLabel` and `closeLabel`; `trigger`, `user` and `footer` slots |
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

`Checkbox`, `Radio` and `Switch` accept `readOnly` (`read-only` in templates).
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
