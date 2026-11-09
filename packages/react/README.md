# @nasaq/react

Native React 19 components for Nasaq — نسق, an independent public 0.2 source
preview. DGA-informed, without government endorsement or certification. React owns
all rendered elements. No vanilla controller is mounted into a React tree.

```tsx
import { useState } from 'react';
import '@nasaq/styles/styles.css';
// Optional, only when the application wants the reset:
import '@nasaq/styles/reset.css';
import { Button, Combobox, Dialog, TextField } from '@nasaq/react';

function Application() {
  const [city, setCity] = useState('');
  return (
    <form>
      <TextField label="الاسم الكامل" name="name" autoComplete="name" required />
      <Combobox
        label="المدينة"
        name="city"
        options={[{ value: 'riyadh', label: 'الرياض' }]}
        value={city}
        onValueChange={setCity}
        required
      />
      <Button type="submit">متابعة</Button>
    </form>
  );
}
```

The `@nasaq/*` packages are not yet published to npm; use this repository's
workspace and build the packages locally. Use `@nasaq/styles` alongside this
package. React and React DOM are peers;
`@nasaq/core` provides the shared, pure keyboard and combobox behavior. Styles
are never imported implicitly. Packages must be built before consuming workspace
exports. Importing and server-rendering this package require no browser globals.
Stable associations use React `useId`, including during hydration.

## Common conventions

Native attributes, events, `className`, ARIA attributes and React 19 `ref` props
are passed to the component's principal native element. `TextField`, `Textarea`,
`Select`, `Checkbox`, `Radio`, `Switch`, `Combobox` and `FileUpload` forward refs
to their actual inputs, not their label wrappers. Use normal React
`value`/`defaultValue` or `checked`/`defaultChecked` and `onChange` for native
controls. `Button` defaults to `type="button"`; explicitly opt into form submit.

Labels, hints and errors are renderable React content. Hints/errors are associated
with the control and errors set `aria-invalid`. Required native controls retain
browser constraint validation. `Field` provides label/description context for one
control; use the same `controlId` and input `id` if choosing your own identifier.
Use native `fieldset` and `legend` for related checkbox/radio groups.

Set `dir` and `lang` independently at the document or subtree. Horizontal Tabs
follow computed direction; vertical arrows stay vertical. Theme, mode and density
are CSS attributes on an ancestor:

```html
<div dir="rtl" lang="ar" data-nq-theme="dga"
     data-nq-mode="dark" data-nq-density="comfortable">…</div>
```

Default auxiliary labels are English; provide Arabic or another language through
label/message props. Business dates and numbers can use `@nasaq/core` formatters
with explicit locale, calendar and time zone. No component infers locale from RTL.

## Catalog

| Component | Composition and important props |
| --- | --- |
| `Button` | Native button; `variant="primary\|secondary\|ghost\|danger"`, `size="sm\|md\|lg"`, `loading` disables and sets busy. |
| `Field` | `label`, `hint`, `error`, `required`, `controlId`; wrap one form control as children. |
| `TextField` | Native input attributes plus `label`, `hint`, `error`; supports text/email/date/number/etc. |
| `Textarea` | Native textarea plus label/hint/error. |
| `Select` | Native select plus label/hint/error; `options: Option[]` or native option/optgroup children. Native `multiple` is supported. |
| `Checkbox` | Native checkbox plus label/hint/error and `indeterminate`. |
| `Radio` | Native radio plus label/hint/error; supply a shared `name` for a native group. |
| `Switch` | Native checkbox with `role="switch"`, label/hint/error. |
| `Tabs` | `items: {value,label,content,disabled?}[]`, required `label`, `value`/`defaultValue`, `onValueChange`, `orientation`, `activationMode`, `overflow: menu/scroll` (default menu), configurable `overflowLabel`. Horizontal compact containers move excess labels into a keyboard-accessible disclosure; vertical tabs remain visible. |
| `Dialog` | Required `title`; `description`, `trigger`, `open`/`defaultOpen`, `onOpenChange`, `closeLabel`, `closeOnBackdrop`; children/footer can render from `{close}`. |
| `Combobox` | Single selection from `Option[]`; label/hint/error, `value`/`defaultValue`, `onValueChange(value, option?)`, `onInputChange(query)`, `open`/`defaultOpen`, `onOpenChange`, native form attributes. |
| `Accordion` | `items: {value,title,content,open?,defaultOpen?,onOpenChange?}[]`; `exclusive` uses a native details name group. |
| `Card` | Native article; header/footer slots and body children. |
| `Badge` | Static label; `tone="neutral\|success\|warning\|danger\|info"`, `variant="soft\|outline\|dot"`; [source and adaptations](../../docs/nic-badges.md). |
| `Alert` | `tone="info\|success\|warning\|danger"`, optional text `title`, children. Default role is status (danger: alert); override role for static content. |
| `Table<Row>` | `caption`, `columns: {key,header,cell(row,index),rowHeader?}[]`, `rows`, `rowKey`, `wrapperProps`; alternatively native table children. |
| `Pagination` | `totalPages`, `page`/`defaultPage`, `onPageChange`; Arabic default `label`, `previousLabel`, `nextLabel`, `getPageLabel`, `formatPage`; `siblingCount` (default 1), `disabled`, `hideOnSinglePage` (default false). Ellipsis disclosures use `getGapLabel(start,end)`, `jumpLabel`, `goLabel`; gaps above 100 pages use bounded integer entry. Parent fetches/slices data; no navigation or scrolling is imposed. |
| `Breadcrumb` | `items: {label,href?,current?}[]`, localized `label`; last item is current. |
| `Progress` | Native progress with required accessible `label`, `value`, `max` (100); omit value for indeterminate. |
| `Skeleton` | Decorative span, hidden from assistive technology; set dimensions via className/style. |
| `Spinner` | Status span; localized `label` (default “Loading”). |
| `Avatar` | Required `name`; optional `src`, `initials`, `size="40\|64\|80\|120\|sm\|md\|lg\|xl"`, `variant="circle\|square"`. Failed images fall back to initials; changing `src` retries. [Source notes](../../docs/nic-avatars.md). |
| `Divider` | Native horizontal rule. |
| `Tooltip` | Plain string `content`; one focusable React element as children. |
| `FileUpload` | Native file input with label/hint/error; `accept`, `multiple`, native `onChange`, `onFilesChange(File[])`, optional supplementary children. |
| `Stepper` | `items: {value,label,description?,status?}[]`, `current`, accessible `label`. Status: complete/current/upcoming. Static progress, not navigation. |
| `EmptyState` | Required `title`; optional `description`, decorative `icon`, `action`, children. |

All prop interfaces, `TabItem`, `AccordionItem`, `TableColumn<Row>`,
`BreadcrumbItem`, `StepItem`, and core `Option`, `Direction`, `Orientation` types
are exported. Option values and item values must be unique stable strings.

## Stateful controls

### Tabs

```tsx
<Tabs
  label="Application sections"
  value={section}
  onValueChange={setSection}
  activationMode="manual"
  items={[
    { value: 'details', label: 'Details', content: <Details /> },
    { value: 'history', label: 'History', content: <History /> },
  ]}
/>
```

Arrows wrap and skip disabled items; Home/End move to the first/last enabled tab.
Automatic activation (default) selects while moving focus. Manual activation
selects through the native button's Enter/Space/click behavior. Inactive panels
stay mounted with `hidden`, preserving their form state. The first enabled tab
is the default and the fallback if the supplied selection is unavailable.

### Dialog

```tsx
<Dialog title="Review request" trigger={<Button>Review</Button>}
  footer={({ close }) => <Button onClick={close}>Done</Button>}>
  {({ close }) => <p>Review your details before continuing.</p>}
</Dialog>
```

The wrapper invokes native `showModal()` and `close()`; it requires native modal
dialog support. Native modality contains focus and makes the background inert.
Escape requests closing; set `onCancel={event => event.preventDefault()}` to
cancel that action. Backdrop closing defaults on and can be disabled.
`autoFocus` on a child selects initial focus. Closing restores the prior focused
element when it remains connected. The optional trigger is one button-like React
element that forwards `onClick`; its original handler runs first and can prevent
opening. You can also use a separate button with controlled `open`.

Server rendering emits a closed dialog; a default-open dialog becomes modal after
hydration. For controlled state, handle `onOpenChange` to apply requests from the
close button, Escape or native dialog forms.

### Combobox

The editable single-select input shares `transitionCombobox` and
`getComboboxOptions` with other adapters. Arabic diacritics/alef variants and
letter case are folded for searching, without changing labels or stored values.
Opening a committed selection displays all options. Typing clears the committed
selection; arrows/Home/End change the active option, and Enter or pointer click
commits an enabled option. Focus stays in the input. Escape/Tab close the list;
blur keeps the query without silently selecting.

`name` belongs to a hidden native input containing the selected option value.
Arbitrary text does not become a submitted value. `required` uses custom validity
to require a committed choice; localize its message with `requiredMessage`.
`disabled`, `readOnly`, `form`, forwarded input refs, and native form resets are
supported. A reset restores an uncontrolled `defaultValue`; controlled state
continues to belong to the caller. When controlled, apply `onValueChange`, including
its empty string when the user edits the selection.

Use `getResultsMessage(count)` for the live region and `emptyMessage` for the
empty list. There is no multiselect, remote fetching, option virtualization, or
custom option rendering in this version. The caller can supply updated options.

### Tooltip and file upload

Tooltip adds a description to its focusable child, opens on hover/focus, and closes
on Escape or when focus/pointer leave. Custom child components must forward
`aria-describedby`. Keep tooltip text noninteractive; essential instructions belong
in visible labels/hints. FileUpload is a native file picker. It does not upload,
validate file contents, or create network requests.

## Example and checks

`examples/react` is a complete local service application: conditional applicant
fields, Arabic city search, review dialog, request history/filter/pagination,
independent locale/direction/mode toggles and a service guide. Its sample requests
are ephemeral in-memory data. Build the workspace packages, then run Vite using
`examples/react/vite.config.ts` on port 4174.

Focused tests cover import/server rendering without DOM globals, field/ref/form
associations, RTL/manual/controlled tabs, Arabic combobox search and commits,
controlled typing, reset, modal lifecycle calls, tooltip dismissal and bounded
pagination. JSDOM dialog methods are test doubles; native modality and browser
focus containment need the browser integration suite.

## Expanded catalog: 50 additional components

The package now exports 77 components. Added components use the same native
attributes/ref conventions and shared styles. Array values and item identifiers
must be unique. Custom form controls support `value`/`defaultValue` and
`onValueChange`; uncontrolled values return to their defaults on native form reset,
including forms associated through `form`. Canceled reset events are respected.
Controlled values remain owned by the application.

| Added control | API and behavior |
| --- | --- |
| `InputGroup` | `start`/`end` adornments and control children; surrounding `Field` supplies the accessible label. |
| `PasswordField` | TextField props plus `visible`/`defaultVisible`, `onVisibleChange`, `showLabel`, `hideLabel`. Reveal preserves the native input and its value. |
| `SearchField` | String `value/defaultValue`, `onValueChange`, native `onChange`, `clearLabel`; optional `suggestions`, `maxSuggestions` (8), `resultsMessage(count)`, `onSearch(query)`, `showSearchButton` (false), `searchLabel`. Native input props/ref and field decoration are preserved. |
| `NumberField` | Native number input with label/hint/error, min/max/step and normal React input events. Empty remains empty; it is not coerced to zero. |
| `Slider` | Numeric value/defaultValue, `onValueChange`, min/max/step, `showValue`, `formatValue`; one labelled native range. |
| `RangeSlider` | Numeric `[lower,upper]`, `onValueChange`, min/max/step; required `lowerLabel`/`upperLabel`, optional group `label`. `lowerName`/`upperName` or repeated `name` submit both values. Native handles cannot cross. |
| `Rating` | Numeric value/defaultValue, `onValueChange`, max (1–20, default 5), label/name/required, `getRatingLabel`; one native radio group. |
| `RatingDisplay` | Required `label`, numeric `value=0`, `max=5` (1–20), `showValue=true`, `getValueLabel(value,max)`; noninteractive fractional aggregate score with one accessible image name. |
| `PinInput` | String value/defaultValue, `onValueChange`, `length` (default 6), optional decorative `showSlots`; one accessible OTP input normalizes Arabic-Indic and Eastern Arabic digits, including pasted input. |
| `TagInput` | String array value/defaultValue, `onValueChange`, name, required, `getRemoveLabel`, `requiredMessage`; Enter/comma commits a unique tag, empty Backspace removes the last tag. Each committed tag produces a native form value. |
| `MultiSelect` | Required label and options; string array value/defaultValue, `onValueChange`, name, required, `searchLabel`, `emptyMessage`, `requiredMessage`. Searchable native checkboxes; filtered-out selections retain repeated form values. |
| `Calendar` | ISO Gregorian value/defaultValue, `onValueChange`; month/defaultMonth, `onMonthChange`; locale/calendar/weekStartsOn, min/max, `isDateDisabled`, disabled/readOnly, optional form/name and localized toolbar/day labels. |
| `DatePicker` | Typed ISO text input plus Calendar in a native modal. Adds calendar/defaultCalendar, `onCalendarChange`, localized calendar selector labels, calendar button/dialog labels and unsupported-range message. |
| `FileDropzone` | Native file input props plus `onFilesChange(File[])`, `dropLabel`, `getRejectedMessage`; accepted dropped files populate the actual native input. The picker and dropped selection participate in forms. No upload occurs automatically. |

Native `TextField` input types retain their platform semantics: text/search/tel/url
are strings; email uses native validation; number uses native numeric constraints
and permits empty input; date/month/week/time/datetime-local use HTML's date/time
value formats; color uses the native picker. Use `FileUpload`/`FileDropzone` for
file values, Checkbox/Radio/Switch for checked state, and Slider/RangeSlider for
range controls. A native date input stores Gregorian ISO dates regardless of the
calendar used to select or describe a date.

### Saudi date selection

```tsx
const [date, setDate] = useState('2026-10-28');
const [calendar, setCalendar] = useState<'gregory' | 'islamic-umalqura'>('islamic-umalqura');

<DatePicker
  label="تاريخ الموعد"
  name="appointment"
  value={date}
  onValueChange={setDate}
  calendar={calendar}
  onCalendarChange={setCalendar}
  locale="ar-SA"
  calendarSystemLabel="التقويم"
  gregorianLabel="ميلادي"
  hijriLabel="هجري — أم القرى"
  calendarLabel="اختر تاريخ الموعد"
  buttonLabel="فتح التقويم"
  previousLabel="الشهر السابق"
  nextLabel="الشهر التالي"
  closeLabel="إغلاق"
  required
/>
```

The picker includes a Gregorian/Umm al-Qura selector. Switching display systems
preserves the exact ISO day, and reopening returns to the selected date's month.
Calendar names, navigation, picker controls and validation messages default to Arabic. Set `locale="en"` for English copy or pass a label prop to override a particular control.

Direction and locale remain independent of calendar. Calendar's arrows follow
visual RTL/LTR direction; Up/Down move a week, Home/End move within the week,
PageUp/PageDown move a month, and Shift+PageUp/PageDown move a year. Disabled days
are skipped and focus remains on one roving date button.

Umm al-Qura arithmetic and numeric date labels use the shared Saudi reference
table through `@nasaq/core`, including `formatCalendarDate`; they do not rely on
ICU's differing historical/future numeric Hijri fields. The supported table spans
**1924-08-01 through 2077-11-16 (AH 1343–1500)**. Navigation stops at these
boundaries. When a Gregorian selected date lies outside this range, switching to
Hijri preserves the ISO input, shows a localized unsupported-range message, and
renders no fabricated Hijri selection, and blocks native form submission with custom validity and `aria-invalid`. Switching back to Gregorian clears the calendar-range error while keeping application min/max constraints. Use `unsupportedCalendarMessage` to
translate that explanation. Read the workspace calendar evidence for provenance
and verification; this interface is not an official service or certification.

`getDayLabel` customizes Calendar date announcements. Supply stable initial
`month`/`defaultMonth` or `value` when a server-rendered view must be independent of
the current date. Standalone Calendar submits its selected supported date through
an optional hidden `name`; use DatePicker when native required/date validation is
needed. `isDateDisabled` applies to both the calendar and the DatePicker's native
input validation. `unavailableMessage` localizes custom date validation.

| Added interaction | API and behavior |
| --- | --- |
| `ToggleGroup` | Required label/options, `variant="segmented\|outline"`. Default single selection uses native radios with string value; `multiple` uses pressed buttons with string-array value and repeated hidden form values. Both support defaultValue/onValueChange/name/form/disabled/readOnly. |
| `Popover` | Required title/trigger, open/defaultOpen/onOpenChange and region children. Trigger toggles a labelled disclosure; outside press and Escape close. Interactive content uses ordinary Tab. |
| `Menu` | Required trigger/label and `items: {value,label,disabled?,href?,onSelect?}[]`; open/defaultOpen/onOpenChange and `onAction(value)`. Up/Down/Home/End skip disabled entries; Escape/action return focus. |
| `Drawer` | Dialog props plus `side="start\|end\|bottom"`; same native modal and focus behavior as Dialog. |
| `ToastRegion` | `messages: {id,title?,description,tone?,urgent?,dismissible?}[]`, `onDismiss(id)`, `label`, `getDismissLabel(message)`. Choose `variant="banner"` and optionally `position="inline"` or a corner. Buttons require an `onDismiss` handler. Arabic labels default to الإشعارات and إغلاق الإشعار with available message text. |
| `Collapsible` | Native details with title, open/defaultOpen/onOpenChange, disabled and children. |
| `TreeView` | Required label and `items: {id,label,disabled?,children?}[]`; value/defaultValue/onValueChange and expanded/defaultExpanded/onExpandedChange. Visible nodes have tree levels, positions and roving focus; horizontal expansion follows RTL. |
| `Carousel` | Required label/slides; `index/defaultIndex/onIndexChange`, `loop=false`, renderable `slides`, zero-based `getSlideLabel(index,total)`. `showIndicators=true`, localized control/indicator/description/empty labels, inert inactive slides, explicit navigation and no autoplay. [Source and motion notes](../../docs/nic-carousel.md). |

```tsx
// Toast state is ordinary application state. There is no global singleton.
const [messages, setMessages] = useState([
  { id: 'saved', description: 'تم حفظ المسودة', tone: 'success' as const },
]);
<ToastRegion label="الإشعارات" messages={messages}
  getDismissLabel={() => 'إغلاق الإشعار'}
  onDismiss={id => setMessages(current => current.filter(item => item.id !== id))} />
```

Popover/Menu trigger elements must forward native button event and ARIA props.
TreeView is a single-selection navigation structure, without drag/drop or virtual
rows. Caller-owned items and toast messages remain unchanged until the caller
applies a callback.

| Added content/pattern | API and behavior |
| --- | --- |
| `Link` | Native anchor with optional `external` (new tab and noopener/noreferrer). |
| `IconButton` | Button props plus required accessible `label`; icon children are decorative. |
| `ButtonGroup` | Native group with required accessible `label` and button children. |
| `Chip` | Text children, optional tone/onRemove/removeLabel/disabled. |
| `DescriptionList` | `items: {term,description,key?}[]`; native dl/dt/dd. |
| `Stat` | Required label/value; optional description/trend content. Values are formatted by the caller. |
| `Timeline` | `items: {id,title,description?,dateTime?,dateLabel?,status?}[]`; status complete/active/upcoming and optional label. |
| `Meter` | Native meter attributes with required accessible label. |
| `AvatarGroup` | Required items/label, max (default 5), getOverflowLabel. Items use AvatarProps. |
| `DataTable<Row>` | Required caption/rows/columns; columns have key/label/sortable/render/rowHeader. Optional rowKey, sort/defaultSort/onSortChange, locale, emptyMessage, getSortLabel. Stable immutable localized sorting and native aria-sort headers. |
| `ServiceCard` | Required title; description/category/icon/metadata, href/actionLabel or action slot, body children. |
| `ServiceDetails` | Required title; description/metadata/requirements/requirementsLabel/action and children. |
| `PortalHeader` | Required brand slot, optional brandHref/navigation/navigationLabel/actions/notice and children. Navigation items are label/href/current. Optional top-level `groups` contain a label and child links. See [grouped navigation](../../docs/nic-portal-navigation.md). |
| `PortalFooter` | Optional brand/description/links/linksLabel/legal and children. |
| `Feedback` | Required question label; value/defaultValue/onValueChange for `{helpful:'yes'\|'no'\|'',comment}` and `onFeedback` on native submit; translated yes/no/comment/submit/success labels. |
| `CookieConsent` | Required title/description; value/defaultValue/onValueChange (`accepted`/`rejected`/null), translated buttons and optional policy link. Null displays the notice. Persistence and cookie activation belong to the application. |
| `NotificationList` | Required label/items; items id/title/description/href/dateTime/dateLabel/read. Optional emptyMessage, onMarkRead, getMarkReadLabel, unreadLabel. |

Platform patterns are configurable ordinary content. Supply your own brand,
service facts, legal text and links. They do not provide government seals, verified
trust status, identity verification, authentication, submissions or storage.
Feedback callbacks report local user choices; applications own asynchronous
submission outcomes. DataTable provides native sorting, without editing,
virtualization, selection or a remote data engine; existing Table remains fully
composable for those integrations.

### Layout primitives

| Primitive | Native composition |
| --- | --- |
| `Container` | Div with optional maxWidth. |
| `Stack` | Vertical flex div. |
| `Inline` | Horizontal flex div with optional wrap. |
| `Grid` | Div with responsive columns or minItemWidth. |
| `Columns` | Div with responsive explicit columns. |
| `Sidebar` | Two child areas; side/sidebarWidth/collapseAt control responsive placement. |
| `Center` | Centered content div. |
| `Spacer` | Flexible space div. |
| `AspectRatio` | Div with positive numeric ratio. |
| `Section` | Semantic section with common layout props. |
| `AppShell` | Supply `header`, `sidebar` and `footer` content around the main landmark. The Arabic skip link focuses main. Set `mainId` to choose its target ID and `skipLabel` to localize the link. |
| `PageHeader` | Native header with title h1, description/breadcrumb/actions and children. |

The first ten primitives accept shared `LayoutProps` and native attributes/refs.
`gap` and `padding` accept token numbers 0–16 or CSS lengths, including responsive
objects `{base,sm,md,lg,xl}`. `columns` accepts positive integer values or the same
responsive object. Common props also include align, justify and wrap. Styles come
from `layoutStyles` CSS variables; there are no JS viewport measurements. Consumer
`style` overrides can explicitly replace generated properties.

```tsx
<Container maxWidth="76rem" padding={{ base: 4, lg: 8 }}>
  <Stack gap={6}>
    <PageHeader title="الخدمات" description="اختر الخدمة المناسبة" />
    <Sidebar side="start" sidebarWidth="18rem" collapseAt="md" gap={6}>
      <aside>مرشحات الخدمات</aside>
      <Grid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
        <ServiceCard title="تصريح نشاط" href="/services/permit" actionLabel="تفاصيل الخدمة" />
      </Grid>
    </Sidebar>
  </Stack>
</Container>
```

### Integration boundaries and evidence

Maps, rich-text editors, charts, code editors, PDF viewers, CAPTCHA and payment
engines belong to their specialist libraries/services. Mount the real engine in
an ordinary React-owned region or Card/AspectRatio with its own accessible name,
loading/error UI and lifecycle cleanup. Use Field hint/error associations around
real input engines and Dialog only when an engine's focus model supports native
modality. Pass theme tokens/direction through the engine's documented API, use
its documented ref/event integration, and adapt actual resulting values into your
form state. These components do not simulate an engine, credential exchange or
payment outcome, and do not inject unsafe HTML.

Expansion regressions cover all 50 additions under DOM-free server rendering,
responsive CSS-variable output, PIN digit normalization, repeated values and
external/canceled resets, ordered range handles, Saudi calendar navigation and
range boundaries, picker system switching/reopening/unsupported dates, menu and
tree focus, popover dismissal, table sorting, caller-owned toasts and explicit
feedback/consent callbacks. Native dialog modality and browser accessibility
remain covered by the existing browser suite; server/unit tests are not a claim
of complete assistive-technology testing for every new pattern.

## Portal shell

[`PortalLayout`, `PortalHeader` and `SecondaryNav`](PORTAL.md) provide a complete
Arabic-default portal shell with responsive navigation, breadcrumbs and footer.
Run the React example with `?preview=portal` to use the native composed shell.

## NIC card composition

See [cards](../../docs/nic-cards.md) for source-mapped spacing, variants, whole-card links, disabled semantics and content classes. Native framework consumers include `?preview=nic`; vanilla uses the documented semantic HTML recipe.

See [NIC button variants](../../docs/nic-buttons.md) for all ten appearances,
interaction states, dark-surface use and density adaptations.

[Ready component examples](../../docs/ready-component-examples.md) cover all five
alert/notification tones, header/footer composition and guide-only navigation containment.


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
See [table evidence and adaptations](../../docs/nic-tables.md).

Rating inputs select whole numbers; finite prefilled values are clamped to the normalized maximum and floored. Fractional averages belong in `RatingDisplay`. Nonfinite maxima fall back to 5 and nonfinite values to 0. Arabic labels and Latin digits are the defaults.


### Search suggestions

SearchField accepts local string suggestions and remains a free-text input.
With suggestions supplied it exposes an editable combobox/listbox, highlighted
matches and a polite result count. Arrow keys wrap through matches; Enter on an
active suggestion selects it and prevents form submission. Ordinary Enter with
no active suggestion emits `onSearch` with a trimmed, nonempty query and keeps
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
(80px). `onCurrentChange(id)` reports the current section ID. Ordinary
activation scrolls without changing the URL; keyboard activation also focuses
the target. Modified anchor clicks retain browser behavior. Disabled entries
remain noninteractive text links; no section content is created or hidden.

```tsx
import {ContentNavigation} from '@nasaq/react';

<ContentNavigation items={[{id: 'requirements', label: 'المتطلبات'}]} />
<section id="requirements"><h2>المتطلبات</h2></section>
```
