# @hawiyah/react

Native React 19 components for Hawiyah — هوية, a UI library built to comply with
the DGA Platforms Code. React owns
all rendered elements. No vanilla controller is mounted into a React tree.

```tsx
import { useState } from 'react';
import '@hawiyah/styles/styles.css';
// Optional, only when the application wants the reset:
import '@hawiyah/styles/reset.css';
import { Button, Combobox, Dialog, TextField } from '@hawiyah/react';

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
        emptyMessage="لا توجد مدن مطابقة"
        getResultsMessage={count => `عدد النتائج: ${count}`}
        requiredMessage="اختر مدينة من القائمة."
      />
      <Button type="submit">متابعة</Button>
    </form>
  );
}
```

Install with `npm install @hawiyah/styles @hawiyah/react`. This is a pre-1.0
release, so a minor version may still change its API. React and React DOM are
peers; `@hawiyah/core` provides the shared, pure keyboard and combobox behavior.
Styles are never imported implicitly. When consuming this repository's workspace
instead of npm, build the packages before importing their exports. Importing and server-rendering this package require no browser globals.
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
<div dir="rtl" lang="ar" data-hw-theme="dga"
     data-hw-mode="dark" data-hw-density="comfortable">…</div>
```

## Text is supplied by the application

Hawiyah ships no built-in strings and no translations. Every word a component
places on its own elements (accessible names, labels of internal controls,
headings it renders, live-region and validation messages) is a prop, and the
primary content (button text, bodies, item labels) is children or data. Props for
text that is always needed are required in the types; text needed only with a
feature (for example `skipLabel` with `PortalHeader` `mainId`, or
`requiredMessage` with `required`) is required through a union on that prop.
Texts that depend on data are functions named `get…Label` / `get…Message`; they
receive the data and return the complete string, and the component adds no words.

When a required text is missing or empty, the component renders nothing in its
place (no text node, no empty attribute) and warns once per component and prop
through `console.warn` with the `Hawiyah:` prefix in development builds
(`process.env.NODE_ENV !== 'production'`). A constraint whose message is missing
still blocks form submission: the control keeps a single-space custom validity and
`aria-invalid="true"`. No component reads `lang`, the document language or
`navigator.language`; `dir` is read only from the DOM. `locale` is a formatting
argument handed to `Intl` (required for Calendar and DatePicker, which print
month, weekday and date names); business dates and numbers can use the
`@hawiyah/core` formatters with explicit locale, calendar and time zone.

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
| `Tabs` | `items: {value,label,content,disabled?}[]`, required `label`, `value`/`defaultValue`, `onValueChange`, `orientation`, `activationMode`, `overflow: menu/scroll` (default menu); `overflowLabel` names the overflow disclosure and is required unless `overflow="scroll"`. Horizontal compact containers move excess labels into a keyboard-accessible disclosure; vertical tabs remain visible. |
| `Dialog` | Required `title` and `closeLabel` (name of the close button); `description`, `trigger`, `open`/`defaultOpen`, `onOpenChange`, `closeOnBackdrop`; children/footer can render from `{close}`. |
| `Combobox` | Single selection from `Option[]`; label/hint/error, required `emptyMessage` and `getResultsMessage(count)`, `requiredMessage` with `required`, `value`/`defaultValue`, `onValueChange(value, option?)`, `onInputChange(query)`, `open`/`defaultOpen`, `onOpenChange`, native form attributes. |
| `Accordion` | `items: {value,title,content,open?,defaultOpen?,onOpenChange?}[]`; `exclusive` uses a native details name group. |
| `Card` | Native article; header/footer slots and body children. |
| `Badge` | Static label; `tone="neutral\|success\|warning\|danger\|info"`, `variant="soft\|outline\|dot"`; [source and adaptations](../../docs/nic-badges.md). |
| `Alert` | `tone="info\|success\|warning\|danger"`, optional text `title`, children. Default role is status (danger: alert); override role for static content. |
| `Table<Row>` | `caption`, `columns: {key,header,cell(row,index),rowHeader?}[]`, `rows`, `rowKey`, `wrapperProps`, `emptyMessage` (required with `columns`); alternatively native table children. |
| `Pagination` | `totalPages`, `page`/`defaultPage`, `onPageChange`; required `label`, `previousLabel`, `nextLabel`, `getPageLabel(page)`; optional `formatPage`; `siblingCount` (default 1), `disabled`, `hideOnSinglePage` (default false). Ellipsis disclosures use the required `getGapLabel(start,end)`, `jumpLabel`, `goLabel`; gaps above 100 pages use bounded integer entry. Parent fetches/slices data; no navigation or scrolling is imposed. |
| `Breadcrumb` | `items: {label,href?,current?}[]`, required `label`; last item is current. |
| `Progress` | Native progress with required accessible `label`, `value`, `max` (100); omit value for indeterminate. |
| `Skeleton` | Decorative span, hidden from assistive technology; set dimensions via className/style. |
| `Spinner` | Status span; required `label` unless the application marks it `aria-hidden="true"`. |
| `Avatar` | Required `name`; optional `src`, `initials`, `size="40\|64\|80\|120\|sm\|md\|lg\|xl"`, `variant="circle\|square"`. Failed images fall back to initials; changing `src` retries. [Source notes](../../docs/nic-avatars.md). |
| `Divider` | Native horizontal rule. |
| `Tooltip` | Plain string `content`; one focusable React element as children. |
| `FileUpload` | Native file input with label/hint/error; `accept`, `multiple`, native `onChange`, `onFilesChange(File[])`, optional supplementary children. |
| `Stepper` | `items: {value,label,description?,status?}[]`, `current`, required accessible `label`. Status: complete/current/upcoming. Static progress, not navigation. |
| `EmptyState` | Required `title`; optional `description`, decorative `icon`, `action`, children. |

All prop interfaces, `TabItem`, `AccordionItem`, `TableColumn<Row>`,
`BreadcrumbItem`, `StepItem`, and core `Option`, `Direction`, `Orientation` types
are exported. Option values and item values must be unique stable strings.

## Stateful controls

### Tabs

```tsx
<Tabs
  label="Application sections"
  overflowLabel="More sections"
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
<Dialog title="Review request" closeLabel="Close" trigger={<Button>Review</Button>}
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
to require a committed choice; its message is `requiredMessage`.
`disabled`, `readOnly`, `form`, forwarded input refs, and native form resets are
supported. A reset restores an uncontrolled `defaultValue`; controlled state
continues to belong to the caller. When controlled, apply `onValueChange`, including
its empty string when the user edits the selection.

`getResultsMessage(count)` supplies the live region and `emptyMessage` the
empty list; both are required. There is no multiselect, remote fetching, option virtualization, or
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
| `PasswordField` | TextField props plus `visible`/`defaultVisible`, `onVisibleChange`, required `showLabel` and `hideLabel` (toggle name, and its text with `toggleVariant="text"`). Reveal preserves the native input and its value. |
| `SearchField` | String `value/defaultValue`, `onValueChange`, native `onChange`, required `clearLabel`; optional `suggestions` (then `getResultsMessage(count)` is required), `maxSuggestions` (8), `onSearch(query)`, `showSearchButton` (false; then `searchLabel`, the button name, is required). The input and its suggestion list are named by `label` or aria-label/aria-labelledby. Native input props/ref and field decoration are preserved. |
| `NumberField` | Native number input with label/hint/error, min/max/step and normal React input events. Empty remains empty; it is not coerced to zero. |
| `Slider` | Numeric value/defaultValue, `onValueChange`, min/max/step, `showValue`, `formatValue`; one labelled native range. |
| `RangeSlider` | Numeric `[lower,upper]`, `onValueChange`, min/max/step; required `lowerLabel`/`upperLabel`, optional group `label`. `lowerName`/`upperName` or repeated `name` submit both values. Native handles cannot cross. |
| `Rating` | Numeric value/defaultValue, `onValueChange`, max (1–20, default 5), label/name/required, required `getRatingLabel(value,max)`; one native radio group. |
| `RatingDisplay` | Numeric `value=0`, `max=5` (1–20), `showValue=true`, required `getValueLabel(value,max)`, which returns the complete accessible image name (for example the subject and the score); noninteractive fractional aggregate score. |
| `PinInput` | String value/defaultValue, `onValueChange`, `length` (default 6), optional decorative `showSlots`; one accessible OTP input normalizes Arabic-Indic and Eastern Arabic digits, including pasted input. |
| `TagInput` | String array value/defaultValue, `onValueChange`, name, required, required `getRemoveLabel(tag)`, `requiredMessage` with `required`; Enter/comma commits a unique tag, empty Backspace removes the last tag. Each committed tag produces a native form value. |
| `MultiSelect` | Required label and options; string array value/defaultValue, `onValueChange`, name, required, required `searchLabel` (name of the filter input) and `emptyMessage`, optional `placeholder`, `requiredMessage` with `required`. Searchable native checkboxes; filtered-out selections retain repeated form values. |
| `Calendar` | ISO Gregorian value/defaultValue, `onValueChange`; month/defaultMonth, `onMonthChange`; required `locale`, `label`, `previousLabel`, `nextLabel` (and `rangeLabel` with `calendar="islamic-umalqura"`); calendar/weekStartsOn, min/max, `isDateDisabled`, disabled/readOnly, optional form/name and `getDayLabel(value)`. |
| `DatePicker` | Typed ISO text input plus Calendar in a native modal. Adds calendar/defaultCalendar, `onCalendarChange` and the required texts `locale`, `calendarLabel`, `openLabel`, `closeLabel`, `previousLabel`, `nextLabel`, `calendarSystemLabel`, `gregorianLabel`, `hijriLabel`, `rangeLabel`, `invalidMessage`, `unsupportedMessage` (and `unavailableMessage` with `isDateDisabled`); optional `placeholder`. |
| `FileDropzone` | Native file input props plus `onFilesChange(File[])`, field `label`, required visible instruction `dropLabel`, `getRejectedMessage(rejected)` with `accept`; accepted dropped files populate the actual native input. The picker and dropped selection participate in forms. No upload occurs automatically. |

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
  rangeLabel="التواريخ الهجرية المدعومة"
  calendarLabel="اختر تاريخ الموعد"
  openLabel="فتح التقويم"
  previousLabel="الشهر السابق"
  nextLabel="الشهر التالي"
  closeLabel="إغلاق"
  invalidMessage="أدخل تاريخًا صحيحًا بصيغة YYYY-MM-DD."
  unsupportedMessage={`التقويم الهجري متاح من ${UMALQURA_MIN_DATE} إلى ${UMALQURA_MAX_DATE}.`}
  required
/>
```

The picker includes a Gregorian/Umm al-Qura selector. Switching display systems
preserves the exact ISO day, and reopening returns to the selected date's month.
Month, weekday and date names come from `Intl` for the required `locale`; every control name and validation message is a prop. `UMALQURA_MIN_DATE` and `UMALQURA_MAX_DATE` are exported by `@hawiyah/core`.

Direction and locale remain independent of calendar. Calendar's arrows follow
visual RTL/LTR direction; Up/Down move a week, Home/End move within the week,
PageUp/PageDown move a month, and Shift+PageUp/PageDown move a year. Disabled days
are skipped and focus remains on one roving date button.

Umm al-Qura arithmetic and numeric date labels use the shared Saudi reference
table through `@hawiyah/core`, including `formatCalendarDate`; they do not rely on
ICU's differing historical/future numeric Hijri fields. The supported table spans
**1924-08-01 through 2077-11-16 (AH 1343–1500)**. Navigation stops at these
boundaries. When a Gregorian selected date lies outside this range, switching to
Hijri preserves the ISO input, shows the `unsupportedMessage` text, and
renders no fabricated Hijri selection, and blocks native form submission with custom validity and `aria-invalid`. Switching back to Gregorian clears the calendar-range error while keeping application min/max constraints. `unsupportedMessage` supplies that explanation. Read the workspace calendar evidence for provenance
and verification; this interface is not an official service or certification.

`getDayLabel` customizes Calendar date announcements. Supply stable initial
`month`/`defaultMonth` or `value` when a server-rendered view must be independent of
the current date. Standalone Calendar submits its selected supported date through
an optional hidden `name`; use DatePicker when native required/date validation is
needed. `isDateDisabled` applies to both the calendar and the DatePicker's native
input validation; `unavailableMessage`, required with it, is the custom date validation message.

| Added interaction | API and behavior |
| --- | --- |
| `ToggleGroup` | Required label/options, `variant="segmented\|outline"`. Default single selection uses native radios with string value; `multiple` uses pressed buttons with string-array value and repeated hidden form values. Both support defaultValue/onValueChange/name/form/disabled/readOnly. |
| `Popover` | Required title/trigger, open/defaultOpen/onOpenChange and region children. Trigger toggles a labelled disclosure; outside press and Escape close. Interactive content uses ordinary Tab. |
| `Menu` | Required trigger/label and `items: {value,label,disabled?,href?,onSelect?}[]`; open/defaultOpen/onOpenChange and `onAction(value)`. Up/Down/Home/End skip disabled entries; Escape/action return focus. |
| `Drawer` | Dialog props plus `side="start\|end\|bottom"`; same native modal and focus behavior as Dialog. |
| `ToastRegion` | `messages: {id,title?,description,tone?,urgent?,dismissible?}[]`, required `label`, `onDismiss(id)` with the then-required `getDismissLabel(message)`. Choose `variant="banner"` and optionally `position="inline"` or a corner. Dismiss buttons require an `onDismiss` handler. |
| `Collapsible` | Native details with title, open/defaultOpen/onOpenChange, disabled and children. |
| `TreeView` | Required label, `getExpandLabel(node)`, `getCollapseLabel(node)` and `items: {id,label,disabled?,children?}[]`; value/defaultValue/onValueChange and expanded/defaultExpanded/onExpandedChange. Visible nodes have tree levels, positions and roving focus; horizontal expansion follows RTL. |
| `Carousel` | Required label/slides, `previousLabel`, `nextLabel`, `emptyLabel` and one-based `getSlideLabel(position,total)`; `index/defaultIndex/onIndexChange`, `loop=false`, renderable `slides`. `showIndicators=true` requires `indicatorsLabel`; optional `carouselDescription`/`slideDescription` set aria-roledescription only when given. Inert inactive slides, explicit navigation and no autoplay. [Source and motion notes](../../docs/nic-carousel.md). |

```tsx
// Toast state is ordinary application state. There is no global singleton.
const [messages, setMessages] = useState([
  { id: 'saved', description: 'تم حفظ المسودة', tone: 'success' as const },
]);
<ToastRegion label="الإشعارات" messages={messages}
  getDismissLabel={message => `إغلاق الإشعار ${message.id}`}
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
| `Chip` | Text children, optional tone/disabled, `onRemove` with the then-required `removeLabel`. |
| `DescriptionList` | `items: {term,description,key?}[]`; native dl/dt/dd. |
| `Stat` | Required label/value; optional description/trend content. Values are formatted by the caller. |
| `Timeline` | `items: {id,title,description?,dateTime?,dateLabel?,status?}[]`; status complete/active/upcoming and required `label`. |
| `Meter` | Native meter attributes with required accessible label. |
| `AvatarGroup` | Required items/label and `getOverflowLabel(count)`, max (default 5). Items use AvatarProps. |
| `DataTable<Row>` | Required caption/rows/columns; columns have key/label/sortable/render/rowHeader. Required `emptyMessage`; optional rowKey, sort/defaultSort/onSortChange, locale, `getSortLabel(column,direction)` (without it the button is named by the column label). Stable immutable localized sorting and native aria-sort headers. |
| `ServiceCard` | Required title; description/category/icon/metadata, `href` with `actionLabel` or an `action` slot, body children. |
| `ServiceDetails` | Required title; description/metadata/action and children; `requirements` with the then-required `requirementsLabel`. |
| `PortalHeader` | Required `brand` (text, artwork or both), `navigationLabel` and `menuLabel`; optional `brandLabel` (accessible name of an artwork-only brand), brandHref/navigation/actions/notice and children; `mainId` adds a skip link and requires `skipLabel`. Navigation items are label/href/current. Optional top-level `groups` contain a label and child links. See [grouped navigation](../../docs/nic-portal-navigation.md). |
| `PortalFooter` | Required `externalLabel` (screen-reader text of external links); optional brand/brandLabel/description/legal and children; `links` require `navigationLabel` (formerly `linksLabel`), `legalLinks` require `legalLinksLabel`, `support` requires `supportLabel`. |
| `Feedback` | Required question label; value/defaultValue/onValueChange for `{helpful:'yes'\|'no'\|'',comment}` and `onFeedback` on native submit; required `yesLabel`, `noLabel`, `commentLabel`, `submitLabel`, `successMessage`. |
| `CookieConsent` | Required title/description; value/defaultValue/onValueChange (`accepted`/`rejected`/null), required `acceptLabel`/`rejectLabel`, optional `policyHref` with the then-required `policyLabel`. Null displays the notice. Persistence and cookie activation belong to the application. |
| `NotificationList` | Required label/items; items id/title/description/href/dateTime/dateLabel/read. Required `emptyMessage` and `unreadLabel`; `onMarkRead` with the then-required `getMarkReadLabel(item)`. |

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
| `AppShell` | Supply `header`, `sidebar` and `footer` content around the main landmark. The skip link, whose text is the required `skipLabel`, focuses main. Set `mainId` to choose its target ID. |
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
portal shell with responsive navigation, breadcrumbs and footer; all of its texts are props.
Run the React example with `?preview=portal` to use the native composed shell.

The mobile and verification parts of the shell take their texts as props too:

| Component | Required texts |
| --- | --- |
| `MobileTopBar` | `title`; `backLabel` with `backHref` (unless `leading` replaces the back link). |
| `NavigationDrawer` | `navigationLabel` names the navigation landmark; `closeLabel` names the close button. |
| `SiteVerification` | `label`, `detailsLabel`, `domainLabel`, `domainDescription`, `httpsLabel`, `httpsDescription`; `registrationLabel` with `registrationHref`; `externalLabel` when that link opens in a new window (`registrationExternal`, on by default). No `locale` prop: the application supplies every text. |
| `FileUploadList` | `labels`: `selected`, `uploading`, `complete`, `error`, `remove`, `getProgressLabel(name)` and `getRemoveLabel(name)`. |

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
40px/56px alternate sizes and striped/bordered variants are Hawiyah extensions.
Captions name keyboard-focusable horizontal scroll containers; row-header
columns render native `th scope="row"`. Empty data spans the column count and
shows the required `emptyMessage`. Sorting does not mutate caller records.
React/Vue native `data-variant` and `data-size` attributes remain supported;
typed props take precedence. `wrapperProps` customizes the scroll container.
See [table evidence and adaptations](../../docs/nic-tables.md).

Rating inputs select whole numbers; finite prefilled values are clamped to the normalized maximum and floored. Fractional averages belong in `RatingDisplay`. Nonfinite maxima fall back to 5 and nonfinite values to 0. Option and display names come from `getRatingLabel` and `getValueLabel`.


### Search suggestions

SearchField accepts local string suggestions and remains a free-text input.
With suggestions supplied it exposes an editable combobox/listbox, highlighted
matches and a polite result count. Arrow keys wrap through matches; Enter on an
active suggestion selects it and prevents form submission. Ordinary Enter with
no active suggestion emits `onSearch` with a trimmed, nonempty query and keeps
native form submission available. Choose either the search callback or the
form's submit handler for the application request; wiring both duplicates it.
The optional icon search action is a non-submit button and uses the callback.
`clearLabel`, `searchLabel` and `getResultsMessage` are application text.

Escape dismisses an open list before reaching an enclosing dialog; another
Escape can dismiss the dialog. Composition/modifier keys do not commit matches.
Readonly inputs remain searchable but cannot edit/clear/select suggestions;
disabled inputs cannot search. Blur, outside press, reset and changed suggestion
configuration clear active-option state. No remote search service is called.

### Content navigation

`ContentNavigation` follows application-owned section IDs using nested
`items: {id, label, disabled?, children?}[]`. The required `label` names the
landmark and is the heading text; options are `showHeading` (true), `sticky`
(false), `scrollRoot` (null/window), `offset` (80px) and `updateHash` (false).
`onCurrentChange(id)` reports the current section ID. Ordinary activation
scrolls without changing the URL (with `updateHash` the resolved URL is written
with `history.replaceState`); keyboard activation also focuses the target.
Links render as `#id` on the server and on the first client render; once mounted,
`bindFragmentLink` from `@hawiyah/core` keeps them pointing at the current
document under a `<base href>`. Skip links in `AppShell`, `PortalHeader` and
`PortalLayout` are bound the same way. Modified anchor clicks retain browser behavior. Disabled entries
remain noninteractive text links; no section content is created or hidden.

```tsx
import {ContentNavigation} from '@hawiyah/react';

<ContentNavigation label="في هذه الصفحة" items={[{id: 'requirements', label: 'المتطلبات'}]} />
<section id="requirements"><h2>المتطلبات</h2></section>
```
