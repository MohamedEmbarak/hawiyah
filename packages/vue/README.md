# @nasaq/vue

Native Vue 3 components for Nasaq — نسق, an independent public 0.1 source preview.
The `@nasaq/*` packages are not yet published to npm; build and use them through
this repository's workspace. Import the shared CSS once:

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button, Combobox, Dialog, TextField } from "@nasaq/vue";
import "@nasaq/styles/styles.css";
// Optional for a new application: import '@nasaq/styles/reset.css';
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
      :results-message="(count) => `${count} نتائج متاحة`"
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

Locale, direction, theme, mode and density are independent application choices.
Set `lang`, `dir`, `data-nq-theme="nasaq|dga|custom"`,
`data-nq-mode="light|dark"` and `data-nq-density="comfortable|compact|mobile"` on an
ancestor. Provide translated labels, status messages, pagination labels and
close labels; the library never infers text language from layout direction.

## Catalog

| Export                  | Main contract                                                                                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                | `variant`, `size`, `loading`; defaults to `type="button"`                                                                                                             |
| `Field`                 | `label`, `hint`, `error`, `required`, `controlId`; provides association to a child field control; scoped default slot exposes IDs for native controls                 |
| `TextField`, `Textarea` | String `v-model`, `defaultValue`, field decoration; standard input/textarea attributes                                                                                |
| `Select`                | String `v-model`, `options: Option[]`; native option children also accepted                                                                                           |
| `Checkbox`, `Switch`    | Boolean `v-model`, `defaultValue`, label/hint/error; checkbox supports `indeterminate`                                                                                |
| `Radio`                 | String `v-model`, `value`, shared native `name`; group inside a fieldset with a legend                                                                                |
| `Combobox`              | String `v-model`, `options`, `disabled`, `readonly`, `emptyMessage`, `resultsMessage(count)`, `requiredMessage`; emits `update:query`, `update:open`                  |
| `Tabs`                  | `items`, required `label`, string `v-model`, `orientation`, `activationMode`, `overflow: menu/scroll` (default menu), configurable `overflowLabel`; item content or named value slots, optional `tab:value` label slots. Compact horizontal containers move excess labels into a keyboard-accessible disclosure; vertical tabs remain visible. |
| `Dialog`                | `title`, `description`, `closeLabel`, `closeOnBackdrop`; default/footer slots receive `{close}`, trigger slot receives `{open}`                                       |
| `Accordion`             | `items: {value,title,content?,open?}[]`, `exclusive`; native details, named value content slots; emits `toggle(value,open)`                                           |
| `Card`                  | `header`, default and `footer` slots                                                                                                                                  |
| `Badge` | Static label; `tone="neutral\|success\|warning\|danger\|info"`, `variant="soft\|outline\|dot"`; [source and adaptations](../../docs/nic-badges.md). |
| `Alert`                 | `tone: info                                                                                                                                                           | success | warning | danger`, `title`; defaults to status, or alert for danger; native role can override |
| `Table`                 | `columns`, `rows`, `rowKey`, `caption`; column `{key,header,cell?,rowHeader?}`; named `cell:key` slots receive `{row,index}`; omit columns to compose native children |
| `Pagination` | Numeric `v-model`/`defaultValue`, `totalPages`, Arabic default `label`, `previousLabel`, `nextLabel`, `pageLabel(page)`, `formatPage(page)`, `siblingCount=1`, `disabled`, `hideOnSinglePage=false`. Ellipsis disclosures use `gapLabel(start,end)`, `jumpLabel`, `goLabel`; gaps above 100 pages use bounded integer entry. Parent fetches/slices data; no navigation or scrolling is imposed. |
| `Breadcrumb`            | `items: {label,href?,current?}[]`, `label`                                                                                                                            |
| `Progress`              | Required `label`, optional value for determinate mode, `max=100`                                                                                                      |
| `Skeleton`              | Decorative hidden span, size using native style/class                                                                                                                 |
| `Spinner`               | Status with localized `label`                                                                                                                                         |
| `Avatar` | Required `name`; optional `src`, `initials`, `size="40\|64\|80\|120\|sm\|md\|lg\|xl"`, `variant="circle\|square"`. Failed images fall back to initials; changing `src` retries. [Source notes](../../docs/nic-avatars.md). |
| `Divider`               | Native `hr`                                                                                                                                                           |
| `Tooltip`               | Plain `content`, one focusable trigger in default slot; description IDs merge with the trigger                                                                        |
| `FileUpload`            | Native input attributes plus field decoration; emits `update:files(File[])`; optional default slot                                                                    |
| `Stepper`               | `items: {value,label,description?,status?}[]`, `current`, `label`                                                                                                     |
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
| `PasswordField` | String `v-model`, `defaultValue`, field decoration, `disabled`, `readonly`; `showLabel`, `hideLabel` localize the reveal button; input and button form one input group                                                                                                                                                                         |
| `SearchField`   | String `v-model`, `defaultValue`, field decoration, `clearLabel`; optional `suggestions`, `maxSuggestions` (8), `resultsMessage(count)`, `showSearchButton` (false), `searchLabel`; emits `search(query)`. Input attributes and exposed `element`/`focus()` remain supported. |
| `NumberField`   | `v-model: number \| ''`; native `min`, `max`, `step` and `required`; clearing preserves an empty value instead of inventing zero                                                                                                                                                                                                               |
| `Slider`        | Numeric `v-model`, `defaultValue`, `min=0`, `max=100`, `step=1`, field decoration, `disabled`, `readonly`; native range keyboard behavior                                                                                                                                                                                                      |
| `RangeSlider`   | Tuple `v-model: readonly [number,number]`, `defaultValue`, `min`, `max`, `step`; `label`, `lowerLabel`, `upperLabel`, `lowerName`, `upperName`; two native ranges enforce lower ≤ upper                                                                                                                                                        |
| `Rating`        | Numeric `v-model`, `defaultValue`, `max=5` (1–20), native `name`, `required`, `label`, `hint`, `error`, `disabled`, `readonly`; `optionLabel(value,max)` localizes each native radio                                                                                                                                                           |
| `RatingDisplay` | Required `label`, numeric `value=0`, `max=5` (1–20), `showValue=true`, `valueLabel(value,max)`; noninteractive fractional aggregate score with one accessible image name. |
| `PinInput`      | String `v-model`, `length=6`, field decoration; one input with `one-time-code`, numeric keyboard, native length/pattern; normalizes Arabic-Indic/Eastern digits; emits `complete(value)`                                                                                                                                                       |
| `TagInput`      | String-array `v-model`, `defaultValue`, `name`, `required`, field decoration; Enter/comma adds unique trimmed tags; Backspace on an empty draft removes the last tag; `removeLabel(value)`, `requiredMessage`                                                                                                                                  |
| `MultiSelect`   | String-array `v-model`, `defaultValue`, `options`, `label`, `searchLabel`, `emptyMessage`, `requiredMessage`; normalized search and native checkboxes, repeated hidden values for `name`; no combobox role                                                                                                                                     |
| `Calendar`      | ISO-string `v-model`, `defaultValue`, `month`, `min`, `max`, `locale`, `calendar`, `weekStartsOn`, `isDateDisabled(value)`; `label`, `previousLabel`, `nextLabel`, `unsupportedMessage`; emits `update:month` when browsing                                                                                                                    |
| `DatePicker`    | Calendar props plus field decoration and string `v-model`; native Gregorian date input and modal Calendar; `v-model:calendar` switches `gregory` / `islamic-umalqura` while preserving ISO value; `calendarSwitchable=true`, `calendarSystemLabel`, `gregoryLabel`, `hijriLabel`, `calendarLabel`, `openLabel`, `closeLabel`, `invalidMessage` |
| `FileDropzone`  | Field decoration, native `name`/`form`, `accept`, `multiple`, `maxSize` in bytes, `disabled`, `readonly`, `dropLabel`; emits `update:files(File[])` and `reject(File[])`; valid drops populate the native file input, invalid batches clear it                                                                                                 |

Value controls support form reset. Arrays reset to `defaultValue`; native file
controls reset to no files. `TagInput` and `MultiSelect` validate committed
selection rather than draft/search text. Supply localized validity messages.
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
import { DatePicker } from "@nasaq/vue";
import type { CalendarSystem } from "@nasaq/core";
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
    gregory-label="ميلادي"
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
| `Drawer`      | Dialog API with `side: start\|end\|bottom`; modal native dialog and preserved trigger focus; default/footer/trigger scoped slots inherited                                                                                                                                             |
| `ToastRegion` | `messages: {id,title?,message,tone?,urgent?,dismissible?}[]`, `label`, `dismissLabel(message)`, `@dismiss="remove"`. Set `variant="banner"` and optionally `position="inline"` or a corner. A dismissal listener enables the close action. Defaults are Arabic. |
| `Collapsible` | `label`, boolean `v-model`, `defaultValue`, `disabled`; native details/summary with default content slot                                                                                                                                                                               |
| `TreeView`    | `items: {id,label,disabled?,children?}[]`, `label`, selected-id `v-model`, `defaultValue`, `v-model:expanded`, `defaultExpanded`, `disabled`; localized `expandLabel(node)` / `collapseLabel(node)`; flattened visible tree with level/position, roving focus and RTL expansion arrows |
| `Carousel` | Required label/slides; `v-model/defaultValue`, `wrap=true`, `slides` and named slide-ID slots, one-based `slideMessage(index,total)`. `showIndicators=true`, localized control/indicator/description/empty labels, inert inactive slides, explicit navigation and no autoplay. [Source and motion notes](../../docs/nic-carousel.md). |

Popover is a disclosure, not a focus trap. Menu is for commands/navigation;
TreeView does not claim drag-and-drop. Toast and notification dismissal is
caller-owned: update the supplied message array in response to the emitted ID.

## Expanded content and platform patterns

| Component          | Contract                                                                                                                                                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Link`             | Native anchor attrs, `href`, `disabled`, `external`; external links use `noopener noreferrer`                                                                                                                                                                                              |
| `IconButton`       | Required accessible `label`, `variant`, `size`, `disabled`, `loading`; default decorative icon slot                                                                                                                                                                                        |
| `ButtonGroup`      | Required `label`; default buttons slot; native `data-variant` / `data-orientation` for shared CSS variants                                                                                                                                                                                 |
| `Chip`             | `label` or default slot, `tone`, `removable`, `removeLabel`, `disabled`; emits `remove`                                                                                                                                                                                                    |
| `DescriptionList`  | `items: {term,description}[]`, `variant: stacked\|horizontal\|compact`; `item:index` slots receive `{item}`                                                                                                                                                                                |
| `Stat`             | `label`, string/number `value`, `locale`, `description`, `trend`; numeric values format with Intl                                                                                                                                                                                          |
| `Timeline`         | `label`, `items: {id,title,description?,date?,dateLabel?,status?}[]`; named item-ID slots; machine-readable native time, optional current step                                                                                                                                             |
| `Meter`            | Required `label`, `value`; native `min`, `max`, `low`, `high`, `optimum` semantics                                                                                                                                                                                                         |
| `AvatarGroup`      | `label`, `items: {name,src?,initials?}[]`, `max`, `remainingLabel(count)`                                                                                                                                                                                                                  |
| `DataTable`        | `caption`, `rows: Record<string,unknown>[]`, `columns: {key,label,sortable?,rowHeader?}[]`, `rowKey`, `locale`; `v-model:sort-key`, `v-model:sort-direction`, initial `defaultSortKey` / `defaultSortDirection`; `sortLabel(column,nextDirection)`; `cell:key` slots receive `{row,index}` |
| `ServiceCard`      | `title`, `description`, `href`, `actionLabel`, `badge`, `metadata`; `icon`, default and `action` slots                                                                                                                                                                                     |
| `ServiceDetails`   | `title`, `description`, DescriptionList `items`; default and `action` slots                                                                                                                                                                                                                |
| `PortalHeader`     | `brand`, `homeHref`, `links: {label,href,current?}[]`, `navLabel`; `logo`, `actions`, default slots                                                                                                                                                                                        |
| `PortalFooter`     | `brand`, `copyright`, `links`, `navLabel`; default content slot                                                                                                                                                                                                                            |
| `Feedback`         | `label`, selected answer string `v-model` (`yes`/`no`), `defaultValue`, `yesLabel`, `noLabel`, `commentLabel`, `submitLabel`, `thanks`, `disabled`, `readonly`; emits `submit({value,comment})`                                                                                            |
| `CookieConsent`    | `v-model:open`, `defaultOpen=true`, `label`, required `description`, `acceptLabel`, `rejectLabel`, `preferencesLabel`; emits `accept`, `reject`, `preferences`; no hidden storage or third-party initialization                                                                            |
| `NotificationList` | `label`, `items: {id,title,description?,date?,dateLabel?,read?,href?}[]`, `emptyMessage`, `readLabel(item)`, `dismissLabel(item)`; emits `read(id)`, `dismiss(id)`; named ID slots                                                                                                         |

DataTable sorting is immutable, stable and localized. It remains a native table;
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
| `AppShell`    | Use `header`, `sidebar`, default main content and `footer` slots. The Arabic skip link focuses main. Set `mainId` to choose its target ID and `skipLabel` to localize the link. |
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
AspectRatio with its own accessible fallback and documented data contract. Nasaq
does not simulate these engines or handle provider credentials or transactions.

## Portal shell

[`PortalLayout`, `PortalHeader` and `SecondaryNav`](PORTAL.md) provide a complete
Arabic-default portal shell with responsive navigation, breadcrumbs and footer.
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
`size="sm|md|lg"` and `emptyMessage`. DGA cells have a 48px default minimum;
40px/56px alternate sizes and striped/bordered variants are Nasaq extensions.
Captions name keyboard-focusable horizontal scroll containers; row-header
columns render native `th scope="row"`. Empty data spans the column count and
uses an Arabic message by default. Sorting does not mutate caller records.
React/Vue native `data-variant` and `data-size` attributes remain supported;
typed props take precedence. `wrapperProps` customizes the scroll container.
The default sort-action label is Arabic; pass `sortLabel` for another language.
See [table evidence and adaptations](../../docs/nic-tables.md).

Rating inputs select whole numbers; finite prefilled values are clamped to the normalized maximum and floored. Fractional averages belong in `RatingDisplay`. Nonfinite maxima fall back to 5 and nonfinite values to 0. Arabic labels and Latin digits are the defaults.


### Search suggestions

SearchField accepts local string suggestions and remains a free-text input.
With suggestions supplied it exposes an editable combobox/listbox, highlighted
matches and a polite result count. Arrow keys wrap through matches; Enter on an
active suggestion selects it and prevents form submission. Ordinary Enter with
no active suggestion emits `search` with a trimmed, nonempty query and keeps
native form submission available. Choose either the search callback or the
form's submit handler for the application request; wiring both duplicates it.
The optional icon search action is a non-submit button and uses the callback.
Arabic clear/search labels are defaults and can be localized.

Escape dismisses an open list before reaching an enclosing dialog; another
Escape can dismiss the dialog. Composition/modifier keys do not commit matches.
Readonly inputs remain searchable but cannot edit/clear/select suggestions;
disabled inputs cannot search. Blur, outside press, reset and changed suggestion
configuration clear active-option state. No remote search service is called.

### Content navigation

`ContentNavigation` follows application-owned section IDs using nested
`items: {id, label, disabled?, children?}[]`. Options are `label` (Arabic default),
`showHeading` (true), `sticky` (false), `scrollRoot` (null/window) and `offset`
(80px). `@current-change="onCurrentChange"` reports the current section ID. Ordinary
activation scrolls without changing the URL; keyboard activation also focuses
the target. Modified anchor clicks retain browser behavior. Disabled entries
remain noninteractive text links; no section content is created or hidden.

```vue
<script setup>
import {ContentNavigation} from '@nasaq/vue';
const sections = [{id: 'requirements', label: 'المتطلبات'}];
</script>
<template>
  <ContentNavigation :items="sections" />
  <section id="requirements"><h2>المتطلبات</h2></section>
</template>
```
