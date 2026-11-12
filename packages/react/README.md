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

Labels, hints and errors are renderable React content. Hints and errors render as
`p.hw-hint` and `p.hw-error` after the control, so they take phrasing content; they
are associated with the control in the order application ids, Field ids, hint id,
error id, and errors set `aria-invalid`. Required native controls retain browser
constraint validation. `Field` provides label/description context for one
control; use the same `controlId` and input `id` if choosing your own identifier.
`Radio` is a single option: compose a group with a native `fieldset` and `legend`,
as for related checkboxes.

### Forms: reset, required marker and validation

**Native form reset.** A reset of the control's form (also one associated through
`form`) is a value change made by the form. Once the browser has applied it, every
composite control (everything with `onValueChange`, `onVisibleChange` or
`onFilesChange`) holds, shows and submits its reset target: `defaultValue`, else the
empty value (`''`, `[]`, the Slider midpoint `(min + max) / 2`, the RangeSlider
`[min, max]`; `[]` for FileDropzone and FileUpload). It calls `onValueChange(target)`
once, and only when the value changed (arrays compared by content), also when the
value is controlled; a controlled control whose application ignores the call shows
and submits the application's value again. Popups close, drafts and filter text
are cleared, PasswordField hides the value (`onVisibleChange(false)` when it was
visible), and a failed-submission or rejection state is removed. Read-only and
disabled controls are reset too; a reset whose event is default-prevented changes
nothing. `TextField`, `Textarea`, `Select`, `Checkbox`, `Radio` and `Switch` are
native pass-through controls: an uncontrolled one returns to `defaultValue` /
`defaultChecked` without `onChange`, and a controlled one keeps and shows the
application's `value` / `checked`.

**Required marker.** A required control with a visible label shows one marker,
`<span class="hw-required-marker" aria-hidden="true"> *</span>`, as the last child
of its `label.hw-label` or `legend.hw-label` (its own `required` or the one
inherited from `Field`). The marker is never the only carrier: native controls keep
`required`, every radio of a required single ToggleGroup is required, and a
required MultiSelect or TagInput explains its constraint in its hint. Range inputs
take no `required` attribute (Slider and RangeSlider show the marker only), and
Checkbox, Radio and Switch get no marker: word the requirement in their label. Do
not write an asterisk into `label`.

**Validation state.** `aria-invalid="true"` is set exactly when the application
passes a non-empty `error`, passes `aria-invalid`, a submission failed on the
control (its `invalid` event fired; cleared when the value becomes valid or the
form resets: Combobox, TagInput, MultiSelect on the fieldset and the filter input,
PinInput, required single ToggleGroup), or the component rejected a committed
value itself (an incomplete PinInput code left on blur, a FileDropzone rejection).
A required control that is still empty before any submission is not marked, and a
missing message text never changes the state. The `invalid` event is not
default-prevented, so the browser still focuses the control and shows its message.

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
still blocks form submission: the control keeps a single-space custom validity.
A missing message never changes `aria-invalid`; it stays what it would be with the
message present. No component reads `lang`, the document language or
`navigator.language`; `dir` is read only from the DOM.

The adapter chooses no locale and calls no `Intl` API itself. `locale` (one BCP 47
tag) is a required prop of every component that formats a date or sorts text:
`Calendar` and `DatePicker` (month, weekday and date names) and `DataTable`
(collation of sorted columns). Omitting it is a type error; at run time a missing
`locale` warns once like a missing text and the feature renders unformatted or
unsorted (Calendar renders its named root without toolbar, weekdays or grid;
DatePicker shows the ISO value; DataTable keeps the source order). Numbers in
other components are data or pass through the formatter function the
application supplies (`formatValue`, `formatPage`). Business dates and numbers
can use the `@hawiyah/core` formatters, which also require a locale.

Migration from 0.2: pass `locale` to `DataTable` (`locale="ar-SA"` gives the
previous order); `CookieConsent` takes an optional `onPreferences` with the then
required `preferencesLabel`; `FileDropzone` takes an optional
`getSelectedMessage(files)` that renders a visible selection status; the
`PortalFooter` brand marks are a named group instead of an image.

Migration from 0.2, forms:

| Component | Change | Migration |
| --- | --- | --- |
| Field and decorated controls | `div.hw-hint` / `div.hw-error`, and `span.hw-hint` / `span.hw-error` of Checkbox, Radio, Switch, became `p.hw-hint` / `p.hw-error` | selectors on `div.hw-hint`, `span.hw-error` -> `.hw-hint`, `.hw-error`; pass phrasing content as `hint` and `error` |
| Every form control | controlled Slider and RangeSlider ignored a native reset; controlled Select, Checkbox, Radio and Switch showed the browser default | none: composite controls call `onValueChange(target)`, controlled controls show their prop again |
| Combobox, PinInput, TagInput, MultiSelect, SearchField, FileDropzone, FileUpload | a reset of a controlled value notified nothing | none: `onValueChange(target)` / `onFilesChange([])` fires once when the target differs |
| PasswordField | a reset returned `visible` to `defaultVisible` (uncontrolled only) | none: a reset always hides the value and calls `onVisibleChange(false)` when it was visible |
| RangeSlider | `defaultValue` was `[0, 100]` | pass `defaultValue={[0, 100]}` where `min` or `max` differ and the old thumbs are wanted |
| RangeSlider | `fieldset.hw-range-slider > div.hw-field` per thumb with its own output; `formatValue` defaulted to `String` | `.hw-range-slider > .hw-field` -> `.hw-range-slider > label`; pass `getRangeLabel={(lower, upper) => ...}` to show the range |
| Slider | `showValue` defaulted to `true`; `aria-valuetext` always set | add `showValue` to keep the output |
| ToggleGroup | option `label.hw-choice > input.hw-radio`; an empty legend without `label`; a hidden probe input in both modes; a reset did not call `onValueChange` | `.hw-toggle-group .hw-choice` -> `.hw-toggle-group > label`; `.hw-toggle-group .hw-radio` -> `.hw-toggle-group input[type='radio']` |
| MultiSelect | `fieldset.hw-multi-select > div.hw-stack`; unclassed marker span; `searchLabel` was an aria-label | `.hw-multi-select .hw-stack` -> `.hw-multi-select-options`; `searchLabel` is now visible text; pass the new required `getResultsMessage(count)` |
| TagInput | `div.hw-field.hw-tag-input > div.hw-inline > span.hw-chip` with `button.hw-button`; no remove button while read-only | `.hw-field.hw-tag-input` -> `.hw-tag-input` (the box inside the field); `.hw-inline > .hw-chip` -> `.hw-tag-input li.hw-chip` |
| Combobox | `onInputChange` | `onInputChange={fn}` -> `onQueryChange={fn}` |
| FileDropzone | `div.hw-file-dropzone > div.hw-field`, a built-in `ul` of file names; the rejection replaced the application error | `.hw-file-dropzone > .hw-field` -> `.hw-file-dropzone` (now `div.hw-field.hw-file-dropzone`); pass `<FileUploadList>` as children to list files |
| FileDropzone | `maxSize` was passed to the input and ignored | none: `maxSize` (bytes) limits the file size and requires `getRejectedMessage` |

Migration from 0.2, dates, disclosure, navigation and shell:

| Component | Change | Migration |
| --- | --- | --- |
| Calendar | no `unsupportedMessage` | `<Calendar calendar="islamic-umalqura" rangeLabel=...>` -> add `unsupportedMessage=...` |
| DatePicker | a typed date outside min/max and outside the Umm al-Qura range showed `invalidMessage`; a produced message had no role | none: it shows `unsupportedMessage`; the produced `p.hw-error` has `role="alert"` |
| Table | `TableColumn.header`; `cell` required | `{header: 'Name'}` -> `{label: 'Name'}`; `cell` is optional (the row value is printed as text) |
| DataTable | `sort` / `defaultSort` / `onSortChange({key, direction})` | `sort={{key: 'name', direction: 'ascending'}}` -> `sortKey="name" sortDirection="ascending"`; `onSortChange={s => ...}` -> `onSortKeyChange={key => ...} onSortDirectionChange={direction => ...}` |
| DataTable | `DataTableColumn.render(value, row)` | `render: (v, row) => x` -> `cell: row => x` |
| DataTable | `table.hw-table.hw-data-table` | `table.hw-data-table` -> `.hw-data-table > table` (the class is on the wrapper) |
| Stepper | no state text | pass the new required `completeLabel` and `upcomingLabel` |
| Carousel, Pagination | the arrow at a bound had `disabled` | none: it has `aria-disabled="true"` and keeps focus |
| Breadcrumb | a current item with `href` was a link | none: the current item is `span[aria-current=page]` |
| Menu | `ul.hw-menu-list > li[role=none] > button\|a` | `.hw-menu-list` -> `.hw-menu-content` (items are its direct `.hw-menu-item` children) |
| Popover | `title` (rendered as an h3); `section.hw-popover-panel[aria-labelledby] > h3` | `<Popover title="T">` -> `<Popover label="T">`; for a visible heading put it in the content and pass `aria-labelledby`; selectors on `.hw-popover-panel > h3` -> a heading of your own |
| Collapsible | `title` | `<Collapsible title=...>` -> `<Collapsible label=...>` |
| PortalHeader | `navigation`, `brandHref`; no home link unless `brandHref` was given | `navigation={x}` -> `links={x}`; `brandHref="/"` -> `homeHref="/"`; add `homeHref=""` to keep a brand that is not a link (the default is `'/'`) |
| PortalHeader | `header > div.hw-portal-header-main > brand, toggle, nav, actions` | `.hw-portal-header-main > x` -> `.hw-portal-header > x` |
| AppShell | `div.hw-app-shell-body` around sidebar and main | `.hw-app-shell-body > x` -> `.hw-app-shell > x` |
| PortalLayout, SiteVerification | `footerLabel` and `externalLabel` were optional in the types | add `footerLabel="..."` with `footerProps.links`; add `externalLabel="..."` with `registrationHref`, or pass `registrationExternal={false}` |

Migration from 0.2, feedback, content and service patterns:

| Component | Change | Migration |
| --- | --- | --- |
| Meter | no `min` / `max` (native 0..1) | `<Meter value={0.4}>` -> `<Meter value={0.4} max={1}>` (or `value={40}`) |
| Chip | `button.hw-button[data-variant=ghost][data-size=sm]` inside the chip | `.hw-chip .hw-button` -> `.hw-chip button` |
| EmptyState | `span[aria-hidden=true]` around the icon | none: it is `span.hw-empty-icon[aria-hidden=true]` |
| Stat | `div.hw-stat > dl > dt + dd.hw-stat-value`, `p`, `div.hw-stat-trend` | `.hw-stat dt` -> `.hw-stat-label`; `.hw-stat dd` -> `.hw-stat-value`; `.hw-stat > p` -> `.hw-stat-description`; `div.hw-stat-trend` -> `span.hw-stat-trend` |
| Timeline | `TimelineItem.status: 'active'`; `li` without class, description in a `div` after the date | `'active'` -> `'current'`; the item is `li.hw-timeline-item > h3, time, p`, so `description` must be phrasing content |
| NotificationList | `onMarkRead` | `onMarkRead={fn}` -> `onRead={fn}` (`getMarkReadLabel` keeps its name) |
| ToastRegion | `ToastMessage.description`; `.hw-toast-content > div` | `{description: node}` -> `{message: node}` (phrasing content, rendered in a `p`) |
| Feedback | `FeedbackValue.helpful: 'yes' \| 'no' \| ''` | `'yes'` -> `true`; `'no'` -> `false`; `''` -> `null` |
| Feedback | `form > fieldset > legend`, radios, `textarea[name=comment]`, submit button; props of a form | `onSubmit` / `onReset` on Feedback -> `onFeedback`; a surrounding form no longer receives `helpful` and `comment` fields |
| CookieConsent | `value` / `defaultValue: CookieChoice`, `onValueChange(choice)`; the type `CookieChoice` | `onValueChange={fn}` -> `onConsent={fn}`; `value={choice}` -> `open={choice === null}`; `defaultValue={null}` -> delete; `CookieChoice` -> `ConsentChoice` (no `null`) |
| CookieConsent | `div.hw-inline` with Reject then Accept | `.hw-cookie-consent > .hw-inline` -> `.hw-cookie-consent > .hw-button-group` (Accept, Reject, Preferences) |

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
| `Tabs` | `items: {value,label,content,disabled?}[]`; the tab list is named by `label`, or by an `aria-label` / `aria-labelledby` prop, which is written on the tab list and not on `div.hw-tabs` (one of them is required; a missing name warns in development), `value`/`defaultValue`, `onValueChange`, `orientation`, `activationMode`, `overflow: menu/scroll` (default menu); `overflowLabel` names the overflow disclosure and is required unless `overflow="scroll"`. Horizontal compact containers move excess labels into a keyboard-accessible disclosure; vertical tabs remain visible. |
| `Dialog` | Required `title` and `closeLabel` (name of the close button); `description`, `trigger`, `open`/`defaultOpen`, `onOpenChange`, `closeOnBackdrop`; children/footer can render from `{close}`. |
| `Combobox` | Single selection from `Option[]`; label/hint/error, required `emptyMessage` and `getResultsMessage(count)`, `requiredMessage` with `required`, `value`/`defaultValue`, `onValueChange(value, option?)`, `onQueryChange(query)` (typed text only), `open`/`defaultOpen`, `onOpenChange`, native form attributes. |
| `Accordion` | `items: {value,title,content,open?,defaultOpen?,onOpenChange?}[]`; `exclusive` uses a native details name group. |
| `Card` | Native article; header/footer slots and body children. |
| `Badge` | Static label; `tone="neutral\|success\|warning\|danger\|info"`, `variant="soft\|outline\|dot"`; [source and adaptations](../../docs/nic-badges.md). |
| `Alert` | `tone="info\|success\|warning\|danger"`, `variant="outline\|minimal"`, optional text `title`, children. Default role is status (danger: alert); set `role="status"` for a danger message rendered with the page. `onDismiss` renders a ghost close button (`button.hw-alert-dismiss`) named by the then-required `closeLabel`. The alert never hides itself: the application removes it and moves focus to the element the message was about or to the heading of the surrounding region, never leaving it on the body. |
| `Table<Row>` | `caption`, `columns: {key,label,cell?(row,index),rowHeader?}[]` (without `cell` the row value under `key` is printed as text), `rows`, `rowKey(row,index)` (default: the index), `wrapperProps`, `emptyMessage` (required with `columns`); alternatively native table children. |
| `Pagination` | `totalPages`, `page`/`defaultPage`, `onPageChange`; at the first or last page the previous / next arrow is `aria-disabled="true"`, keeps focus and ignores activation (`disabled` only with `disabled`); required `label`, `previousLabel`, `nextLabel`, `getPageLabel(page)`; optional `formatPage`; `siblingCount` (default 1), `disabled`, `hideOnSinglePage` (default false). Ellipsis disclosures use the required `getGapLabel(start,end)`, `jumpLabel`, `goLabel`; gaps above 100 pages use bounded integer entry. Parent fetches/slices data; no navigation or scrolling is imposed. |
| `Breadcrumb` | `items: {label,href?,current?,disabled?}[]`, required `label`. The current item is text (`span[aria-current=page]`, never a link): the first item with `current`, else the last item. |
| `Progress` | One native `progress.hw-progress`; `label` is its accessible name (or pass `aria-label` / `aria-labelledby`), no visible label is rendered. `value` and `max` (100) are written as given; omit `value` for indeterminate. `size="sm\|lg"`. |
| `Skeleton` | Decorative span, hidden from assistive technology; `variant="text\|circle"`; set dimensions via className/style. Announce loading with the pattern below. |
| `Spinner` | Status span with `size="sm\|lg"`; `label` (visually hidden text), or `aria-label` / `aria-labelledby`, or `aria-hidden="true"` for a decorative spinner beside visible text. |
| `Avatar` | Required `name`; optional `src`, `initials`, `size="40\|64\|80\|120\|sm\|md\|lg\|xl"`, `variant="circle\|square"`. Failed images fall back to initials; changing `src` retries. [Source notes](../../docs/nic-avatars.md). |
| `Divider` | Native horizontal rule. |
| `Tooltip` | Plain string `content`; one focusable React element as children. |
| `FileUpload` | Native file input with label/hint/error; `accept`, `multiple`, native `onChange`, `onFilesChange(File[])`, optional children rendered after the input and before the hint (for example `FileUploadList`). A reset reports `[]` once when files were held. |
| `Stepper` | `items: {value,label,description?,status?}[]`, `current`, required accessible `label`; required `completeLabel` and `upcomingLabel`, rendered visually hidden after the label of each complete and upcoming step (the current step has `aria-current="step"`). Status: complete/current/upcoming. Static progress, not navigation. |
| `EmptyState` | Required `title`; optional `description`, decorative `icon` (in `span.hw-empty-icon`), `action` (last child), children. |

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
supported. A reset returns to `defaultValue` (else `''`), calls `onValueChange` once
when that changed the selection and `onOpenChange(false)` when the list was open;
a controlled combobox then shows the application's value. When controlled, apply
`onValueChange`, including its empty string when the user edits the selection.
`open`/`defaultOpen`/`onOpenChange` notify reader actions only, never a change of
the `open` prop, and the list stays closed while disabled or read-only.
`onQueryChange(query)` is called for every accepted input event with the typed
text; selections, resets and application writes do not call it.

The field is `div.hw-field` with the label, `div.hw-combobox` and then the hint
and error; `div.hw-combobox` wraps only the text input, the hidden input, the
listbox (named by the label) and the status, because the list is positioned
against it.

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

The package covers all 85 catalogue entries; this section describes the 50
added in the first expansion. Added components use the same native
attributes/ref conventions and shared styles. Array values and item identifiers
must be unique. Custom form controls support `value`/`defaultValue` and
`onValueChange`; a native form reset follows the rule under
[Forms: reset, required marker and validation](#forms-reset-required-marker-and-validation),
including forms associated through `form`.

| Added control | API and behavior |
| --- | --- |
| `InputGroup` | `start`/`end` adornments and control children; surrounding `Field` supplies the accessible label. |
| `PasswordField` | TextField props plus `visible`/`defaultVisible`, `onVisibleChange`, required `showLabel` and `hideLabel` (toggle name, and its text with `toggleVariant="text"`). Reveal preserves the native input and its value. The toggle notifies once per activation; a controlled `visible` keeps the application's state; a form reset hides the value. |
| `SearchField` | String `value/defaultValue`, `onValueChange`, native `onChange`, required `clearLabel`; optional `suggestions` (then `getResultsMessage(count)` is required), `maxSuggestions` (8), `onSearch(query)`, `showSearchButton` (false; then `searchLabel`, the button name, is required). The input and its suggestion list are named by `label` or aria-label/aria-labelledby. Native input props/ref and field decoration are preserved. |
| `NumberField` | Native number input with label/hint/error, min/max/step and normal React input events. Empty remains empty; it is not coerced to zero. |
| `Slider` | Numeric value/defaultValue (empty value `(min + max) / 2`), `onValueChange`, min/max/step, `required` (marker only). `showValue` (default false) renders `output.hw-slider-value` after the input with `formatValue(value)`, else `String(value)`; `aria-valuetext` is set only when `formatValue` is given. One labelled native range. |
| `RangeSlider` | Numeric `[lower,upper]` value/defaultValue (empty value `[min, max]`), `onValueChange`, min/max/step, `required` (marker in the legend only); required `lowerLabel`/`upperLabel`, optional group `label`. Markup: `fieldset.hw-field.hw-range-slider` > legend > two `label.hw-label` each wrapping its `input.hw-slider` > `output.hw-range-slider-value` only with `getRangeLabel(lower, upper)` (the whole visible text; no separator is written) > hint > error. `formatValue` gives each thumb its `aria-valuetext`; without it there is none. `lowerName`/`upperName` or repeated `name` submit both values. Native handles cannot cross. |
| `Rating` | Numeric value/defaultValue, `onValueChange`, max (1–20, default 5), label/name/required, required `getRatingLabel(value,max)`; one native radio group. |
| `RatingDisplay` | Numeric `value=0`, `max=5` (1–20), `showValue=true`, required `getValueLabel(value,max)`, which returns the complete accessible image name (for example the subject and the score); noninteractive fractional aggregate score. |
| `PinInput` | String value/defaultValue, `onValueChange`, `length` (default 6), optional decorative `showSlots`; one accessible OTP input. Typed, pasted, dropped and autofilled text is normalised first (Arabic-Indic and Eastern Arabic digits to ASCII, separators removed) and then cut to `length`, so the input carries no `maxlength`; one more typed digit in a full code changes nothing. An incomplete code left on blur, or a failed submission, sets `aria-invalid` until the code is empty or complete or the form resets. |
| `TagInput` | String array value/defaultValue, `onValueChange`, name, required, required `getRemoveLabel(tag)`, `requiredMessage` with `required` (explain the requirement in the hint). Markup: `div.hw-field` > label > `div.hw-tag-input` (`ul[role=list]` of `li.hw-chip` with the tag, a bare remove `button` and a hidden input; then the text input) > hint > error. Enter or comma commits a unique tag; there is no Add button. Empty Backspace removes the last tag and keeps focus in the input; a remove button moves focus to the next remove button, else the previous one, else the input. Read-only and disabled render the remove buttons disabled. |
| `MultiSelect` | `label` (or aria-label / aria-labelledby; a missing name warns), options; string array value/defaultValue, `onValueChange`, name, required, required `searchLabel` (the visible label of the filter input), `emptyMessage` and `getResultsMessage(count)` (polite count of the options shown, after the reader filters), optional `getSelectedMessage(count)` (visible `p.hw-multi-select-selected[role=status]`), `placeholder`, `requiredMessage` with `required` (explain the minimum in the hint). Markup: `fieldset.hw-field.hw-multi-select` > legend (marker when required) > filter label and input > `div.hw-multi-select-options` of `label.hw-choice` rows > results status > selected status > hidden inputs > hint > error. Read-only checkboxes stay focusable with `aria-disabled="true"` and change nothing; filtered-out selections retain repeated form values. |
| `Calendar` | ISO Gregorian value/defaultValue, `onValueChange`; month/defaultMonth, `onMonthChange`; required `locale`, `label`, `previousLabel`, `nextLabel` (and `rangeLabel` and `unsupportedMessage` with `calendar="islamic-umalqura"`; `unsupportedMessage` is announced by the status after the grid while the value cannot be shown); calendar/weekStartsOn, min/max, `isDateDisabled`, disabled/readOnly, optional form/name and `getDayLabel(value)`. |
| `DatePicker` | Typed ISO text input plus Calendar in a native modal. Adds calendar/defaultCalendar, `onCalendarChange` and the required texts `locale`, `calendarLabel`, `openLabel`, `closeLabel`, `previousLabel`, `nextLabel`, `calendarSystemLabel`, `gregorianLabel`, `hijriLabel`, `rangeLabel`, `invalidMessage`, `unsupportedMessage` (and `unavailableMessage` with `isDateDisabled(isoDate)`); optional `placeholder` and `getDayLabel(isoDate)`. The message for a typed date is one `p.hw-error` after the hint with `role="alert"` (the application's `error` wins and has no role); opening moves focus to the selected day, or today. |
| `FileDropzone` | Native file input props plus `onFilesChange(File[])` (called only when the list changed), `onReject(files)`, field `label`, required visible instruction `dropLabel`, `maxSize` (bytes), `readOnly`, `children` (rendered after the status, for example `FileUploadList`; the dropzone renders no file list itself), `getRejectedMessage(rejected)` required with `accept` or `maxSize`; optional `getSelectedMessage(files)`, which renders a visible `role="status"` paragraph after the input (empty until files are selected). Markup: `div.hw-field.hw-file-dropzone[data-state=dragging\|error]` > label > instruction > input > status > children > hint > error. A batch replaces the selection; a batch with any rejected file (type, size, or more than one file without `multiple`) leaves the dropzone empty, calls `onReject` once and shows `getRejectedMessage(rejected)` in `p.hw-error[role=alert]` with `aria-invalid` on the input until the next accepted batch or a reset; the application's `error` wins and has no role. A rejection sets no custom validity; server-side validation stays the application's task. File drags are always cancelled (`dropEffect` `none` while disabled or read-only). Read-only keeps the input enabled and focusable with `aria-disabled="true"`, blocks the chooser and drops, and keeps the chosen files in the form. No upload occurs automatically. |

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
| `ToggleGroup` | `label` (or aria-label / aria-labelledby; without a name no legend is rendered and one warning is issued), required `options`, `variant="segmented\|outline"`, `hint`, `error`, `required`. Default single selection uses native radios (`label > input[type=radio]` + text) with string value; `required` applies to it (marker, `required` on every radio, `aria-invalid` on the fieldset after a failed submission until chosen or reset). `multiple` uses pressed `button.hw-button[data-variant=secondary][data-size=md]` with a string-array value (empty value `[]`) and repeated hidden form values inside the fieldset; `required` is not enforced there (use MultiSelect or the application's `error`). Both support defaultValue/onValueChange/name/form/disabled/readOnly; a reset calls `onValueChange(target)` once when it changed the selection. `labelHidden` adds `hw-sr-only` to the legend (`class="hw-label hw-sr-only"`): the legend stays first, keeps its text and remains the accessible name. Hide it only where the option texts make the purpose visible, such as a toolbar. |
| `Popover` | Required trigger; `label` (or an `aria-label` / `aria-labelledby` prop) is the accessible name of `div.hw-popover-panel[role=region]` and prints nothing (a visible heading is your content, referenced with `aria-labelledby`); open/defaultOpen/onOpenChange, `disabled` (disables the trigger and closes). Closes on Escape from inside it (focus returns to the trigger), on an outside press and when focus moves outside (focus stays where it went); content closes it through the controlled `open`. |
| `Menu` | Required trigger (your own element: the menu adds aria-haspopup, aria-expanded, aria-controls and, while `disabled`, disabled); the menu is named by `label` or an `aria-label` / `aria-labelledby` prop. `items: {value,label,disabled?,href?,onSelect?}[]` render as `.hw-menu-item` children of `div.hw-menu-content[role=menu]`; open/defaultOpen/onOpenChange, `disabled`, `onAction(value)`. Up/Down/Home/End skip disabled entries; type-ahead moves to the next item starting with the typed letters (500 ms buffer, a repeated letter cycles); Escape/action return focus; Tab, an outside press or focus leaving close without moving focus. |
| `Drawer` | Dialog props plus `side="start\|end\|bottom"`; same native modal and focus behavior as Dialog. |
| `ToastRegion` | `messages: {id,title?,message,tone?,urgent?,dismissible?}[]` (`message` is phrasing content in a `p`), required `label`, `onDismiss(id)` with the then-required `getDismissLabel(message)`. Choose `variant="banner"` and optionally `position="inline"` or a corner. Dismiss buttons require an `onDismiss` handler. |
| `Collapsible` | Native details with `label` (the summary content), open/defaultOpen/onOpenChange, disabled (summary `aria-disabled`, stays focusable) and children. |
| `TreeView` | Named by `label`, or an `aria-label` / `aria-labelledby` prop; required `getExpandLabel(node)`, `getCollapseLabel(node)` and `items: {id,label,disabled?,children?}[]`; value/defaultValue/onValueChange and expanded/defaultExpanded/onExpandedChange. Visible nodes have tree levels, positions and roving focus; horizontal expansion follows RTL; type-ahead searches the visible nodes. A branch has `button.hw-tree-toggle` (not a tab stop) for pointer and screen-reader activation; items carry `--hw-tree-depth`. The tree does not submit a value with a native form. |
| `Carousel` | At the first or last slide (without `loop`) the arrow is `aria-disabled="true"`, keeps focus and ignores activation; `disabled` only with fewer than two slides. Required label/slides, `previousLabel`, `nextLabel`, `emptyLabel` and one-based `getSlideLabel(position,total)`; `index/defaultIndex/onIndexChange`, `loop=false`, renderable `slides`. `showIndicators=true` requires `indicatorsLabel`; optional `carouselDescription`/`slideDescription` set aria-roledescription only when given. Inert inactive slides, explicit navigation and no autoplay. [Source and motion notes](../../docs/nic-carousel.md). |

```tsx
// Toast state is ordinary application state. There is no global singleton.
const [messages, setMessages] = useState([
  { id: 'saved', message: 'تم حفظ المسودة', tone: 'success' as const },
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
| `ButtonGroup` | Native group named by `label` (or `aria-label` / `aria-labelledby`, which win) with button children; `variant="attached"`, `orientation="vertical"`. |
| `Chip` | Text children, optional tone, `variant="soft\|outline"`, `size="sm\|lg"`, disabled; `onRemove` renders a plain remove button named by the then-required `removeLabel`. When a chip is removed while its button has focus, focus moves to the next chip's button, else the previous one; when the last chip goes the application places focus. |
| `DescriptionList` | `items: {term,description,key?}[]`; native dl/dt/dd; `variant="stacked\|horizontal\|compact"` (stacked when not given). |
| `Stat` | Required label/value; optional description/trend. `value` and `trend` accept nodes, for example the [riyal pattern](../../docs/saudi-riyal.md): `value={<bdi><span className="hw-riyal" aria-hidden="true" />120 <span className="hw-sr-only">ريال</span></bdi>}`. `tone="neutral\|success\|danger"`, `variant="plain"`, `trendTone="success\|danger"`. Values are formatted by the caller. |
| `Timeline` | `items: {id,title,description?,dateTime?,dateLabel?,status?}[]`; status complete/current/upcoming; `dateLabel` is the visible date and `dateTime` its ISO value (no time element without `dateLabel`); named by `label` (or `aria-label` / `aria-labelledby`). |
| `Meter` | Native meter named by `label` (or `aria-label` / `aria-labelledby`); defaults `min` 0, `max` 100, `value` 0; `low` / `high` / `optimum` only when given. No visible label and no size option. |
| `AvatarGroup` | Required items/label and `getOverflowLabel(count)`, max (default 5). Items use AvatarProps. |
| `DataTable<Row>` | Required caption/rows/columns; columns have key/label/sortable/`cell(row,index)`/rowHeader (without `cell` the value is printed as text). Required `emptyMessage`; required `locale` (collation; no default, `"ar-SA"` gives the order of 0.2; without it rows stay in source order and a warning is logged); optional rowKey; the sort is two states, `sortKey`/`defaultSortKey`/`onSortKeyChange` (`''` = unsorted) and `sortDirection`/`defaultSortDirection` (`'ascending'`)/`onSortDirectionChange`, each notified only when it changes; `getSortLabel(column,direction)` (without it the button is named by the column label). Stable immutable localized sorting and native aria-sort headers; `div.hw-table-wrap.hw-data-table[role=region]` wraps `table.hw-table`. |
| `ServiceCard` | Required title; description/category/icon/`metadata: {term,description}[]` (a `dl` only when it has entries), `href` with `actionLabel` or an `action` slot, body children. Card anatomy: header with `div.hw-service-card-icon`, category badge and h3; body; footer with the action. |
| `ServiceDetails` | Required title; description/metadata/action and children; `requirements` (nodes) with the then-required `requirementsLabel`, rendered as a section only when it has entries; the action is in a footer. |
| `PortalHeader` | Required `brand` (text, artwork or both), `navigationLabel` and `menuLabel`; optional `brandLabel` (accessible name of an artwork-only brand), `homeHref` (default `'/'`; an empty string renders the brand as a div, with `role="img"` when `brandLabel` is given), `links`, actions/notice and children; `open`/`defaultOpen`/`onOpenChange` for the menu below 48rem (close it after a client-side route change with `open`) (`notice` renders in `div.hw-portal-notice`, the first region after the skip link and before the brand, with no role or text requirement of its own; `actions` render in `div.hw-portal-header-actions`, which replaces `hw-portal-actions`; each container exists only when given); `mainId` adds a skip link and requires `skipLabel`. Navigation items are label/href/current. Optional top-level `groups` contain a label and child links. See [grouped navigation](../../docs/nic-portal-navigation.md). |
| `PortalFooter` | Required `externalLabel` (screen-reader text of external links); optional brand/brandLabel/description/legal and children (`brandLabel` is written with `role="group"` on the brand marks, not on the description); `links` require `navigationLabel` (formerly `linksLabel`), `legalLinks` require `legalLinksLabel`, `support` requires `supportLabel`. |
| `Feedback` | A `div[role=group]` named by the visible question `label` (or `aria-label` / `aria-labelledby`); two pressed-state choice buttons, then, after a choice, a comment textarea and a submit button. `value`/`defaultValue`/`onValueChange` for `FeedbackValue` `{helpful: boolean \| null, comment}`, `onFeedback(value)` on submit, `disabled`, `choiceVariant`; required `yesLabel`, `noLabel`, `commentLabel`, `submitLabel`, `successMessage`. Nothing is sent anywhere and the component takes no part in form submission. |
| `CookieConsent` | A region named by its `title` heading; required `description`, `acceptLabel`, `rejectLabel`; `open`/`defaultOpen` (true)/`onOpenChange`, `onConsent(choice: ConsentChoice)`; Accept (primary) and Reject (secondary) report the choice and close; optional `policyHref` with the then-required `policyLabel`; optional `onPreferences` with the then-required `preferencesLabel`, the last, ghost button, which only calls the handler; children render after the policy link. `variant="banner"` is fixed at the block end: it must not cover focused controls (WCAG 2.4.11), so give the page matching end padding while it is open. Persistence, cookie activation and focus after closing belong to the application. |
| `NotificationList` | A section named by the visible `label` heading (or `aria-label` / `aria-labelledby` without one); items `{id,title,description?,href?,dateTime?,dateLabel?,read?}` render `li[data-state=unread\|read]` with an info badge showing the required `unreadLabel` on unread items. Required `emptyMessage`; `onRead(id)` with the then-required `getMarkReadLabel(item)` (text button on unread items); `onDismiss(id)` with the then-required `getDismissLabel(item)` (icon button). The list is application state: after an action focus moves to the same control of the next item, else the previous one, else the list. |

Platform patterns are configurable ordinary content. Supply your own brand,
service facts, legal text and links. They do not provide government seals, verified
trust status, identity verification, authentication, submissions or storage.
Loading: wrap skeletons in a status container with a visually hidden text of
your own, and replace the whole container when the content arrives.

```tsx
<div role="status"><span className="hw-sr-only">{loadingText}</span>
  <Skeleton variant="text" style={{ inlineSize: '70%' }} /><Skeleton style={{ blockSize: '4rem' }} /></div>
```

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
| `AppShell` | Supply `header`, `sidebar` and `footer` content around the main landmark; sidebar and main are direct children of `.hw-app-shell`. The skip link, whose text is the required `skipLabel`, focuses main. Set `mainId` to choose its target ID. |
| `PageHeader` | Native header with the title in `h{level}` (`level` 1 to 6, default 1), description/breadcrumb/actions and children. |

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
`PortalLayout` requires `skipLabel`, `menuLabel` and `navigationLabel` in every use,
`secondaryLabel` with `secondaryNavigation`, `breadcrumbLabel` with `breadcrumbs` and
`footerLabel` with `footerProps.links`.
Run the React example with `?preview=portal` to use the native composed shell.

The mobile and verification parts of the shell take their texts as props too:

| Component | Required texts |
| --- | --- |
| `MobileTopBar` | `title`; `backLabel` with `backHref` (unless `leading` replaces the back link). |
| `NavigationDrawer` | `navigationLabel` names the navigation landmark; `closeLabel` names the close button. Items are `NavigationDrawerItem` (`id`, `label`, `href?`, `icon?`, `current?`, `disabled?`, `expanded?`, `children?`); the group holding the current page and groups with `expanded: true` render open. The list is the one `SideNavigation` renders. |
| `SiteVerification` | `label`, `detailsLabel`, `domainLabel`, `domainDescription`, `httpsLabel`, `httpsDescription`; `registrationLabel` with `registrationHref`; `externalLabel` when that link opens in a new window (`registrationExternal`, on by default); both requirements are in the types. No `locale` prop: the application supplies every text. |
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
landmark and is the heading text; an `aria-label` or `aria-labelledby` passed to
the component names the landmark instead, and no heading is printed without
`label`. Options are `showHeading` (true), `sticky`
(false), `scrollRoot` (null/window), `offset` (80px) and `updateHash` (false).
`onCurrentChange(id)` reports the current section ID. Ordinary activation
scrolls without changing the URL (with `updateHash` the resolved URL is written
with `history.replaceState`); keyboard activation also focuses the target.
Links render as `#id` on the server and on the first client render; once mounted,
`bindFragmentLink` from `@hawiyah/core` keeps them pointing at the current
document under a `<base href>`. Skip links in `AppShell`, `PortalHeader` and
`PortalLayout` are bound the same way. Modified anchor clicks retain browser behavior. Disabled entries
remain noninteractive text links; no section content is created or hidden.
An activation reports one change: the marker goes to the chosen section and does
not step through the sections a smooth scroll passes.

```tsx
import {ContentNavigation} from '@hawiyah/react';

<ContentNavigation label="في هذه الصفحة" items={[{id: 'requirements', label: 'المتطلبات'}]} />
<section id="requirements"><h2>المتطلبات</h2></section>
```

### Copy button

`CopyButton` copies a value on activation and reports the outcome in a polite
status beside the button. Place it beside the visible value it copies.

```tsx
import {CopyButton} from '@hawiyah/react';

<code id="install">pnpm add @hawiyah/react</code>
<CopyButton text="pnpm add @hawiyah/react" label="نسخ أمر التثبيت" copiedMessage="تم النسخ" failedMessage="تعذّر النسخ. حدّد النص وانسخه يدويًا." onCopyResult={({status}) => { if (status !== 'copied') selectInstallCommand(); }} />
```

| Input | Notes |
| --- | --- |
| `text` | Required. `string`, or `() => string` called at activation and never before. An empty or white-space value ends in the failed state (`empty`). |
| `label` | Required text. The constant accessible name (`aria-label` on the icon button), or the visible text after the icon with `display="text"`. It does not change with the state. |
| `copiedMessage` | Required text. Status text after a successful copy. |
| `failedMessage` | Required text. Status text after any failure; shown as visible text until the next activation. |
| `display` | `'icon'` (default) or `'text'`. |
| `variant`, `size` | The `Button` variants (default `'ghost'`) and sizes (default `'md'`), written to `data-variant` and `data-size`. |
| `feedbackDuration` | Milliseconds the copied state lasts (3000; any value that is not a finite number above zero means 3000). |
| `disabled` | The native `disabled` attribute. |
| `onCopyResult` | `(result: CopyResult) => void`, once per activation that still counts, with `{status, text}`; `status` is `copied`, `denied`, `unavailable`, `failed` or `empty`. |

`className` and `style` go to the root `span.hw-copy` (with `data-state` `idle`,
`copied` or `failed`); the ref and every other native attribute go to the button.
An `onClick` is called first and cannot cancel the copy. The icon follows the
state (`copy-01`, `tick-02`, `alert-02`) and the status (`role="status"`) is
emptied before each activation, so a repeated result is announced again.
A result that settles at once (an empty text, no Clipboard API) empties and fills
the status inside one task; that an identical message is then repeated has not been
verified with a screen reader. Focus
stays on the button. Only the latest activation reports; a result that arrives
after unmount is ignored. Nothing reads the clipboard, and nothing touches it
during render, mount or hydration. The application may offer manual copying
(for example, select the value) when the status is not `copied`. Missing texts
render nothing in their place and warn once in development under `CopyButton`.

### Side navigation

`SideNavigation` renders the `NavigationDrawer` list outside a drawer: page
links and native group disclosures in a `nav.hw-side-navigation`. Feed the same
array to `NavigationDrawer` for phones.

```tsx
import {NavigationDrawer, SideNavigation} from '@hawiyah/react';
import type {SideNavigationItem} from '@hawiyah/react';

const items: SideNavigationItem[] = [
  {id: 'start', label: 'البدء', href: '/start'},
  {id: 'components', label: 'المكونات', expanded: true, children: [{id: 'button', label: 'الزر', href: '/components/button', current: true}]},
];
<SideNavigation label="أقسام الدليل" items={items} sticky />
<NavigationDrawer title="القائمة" navigationLabel="أقسام الدليل" closeLabel="إغلاق القائمة" items={items} trigger={<button type="button">القائمة</button>} />
```

`items` (`SideNavigationItem`, the same type as `NavigationDrawerItem`) are
required: `id`, `label`, `href?`, `icon?`, `current?`, `disabled?`, `expanded?`,
`children?`. The required `label` names the landmark; an `aria-label` or
`aria-labelledby` passed to the component names it instead. `sticky` writes
`data-sticky="true"`: from 64rem the navigation sticks and scrolls in its own box,
placed with `--hw-side-navigation-top` and `--hw-side-navigation-bottom-reserve`.
The application marks the current page through `current` on each route change.
A group renders open when `expanded` is true or when it holds the current link;
`open` is written again only when that value changes, so the reader's own toggles
stand. After mount and whenever the current item changes, the current link is
scrolled into the centre of the navigation's own box (never the page, never focus).
There is no click handler, no roving focus and no arrow-key handling: Tab moves
through summaries and links, and disabled entries are text without a tab stop.

### Client-side routing

Packaged links keep real `href`s. To route them in the application, bind
`bindLinkNavigation` from `@hawiyah/core` once in the browser:

```tsx
import {useEffect} from 'react';
import {bindLinkNavigation} from '@hawiyah/core';

useEffect(() => {
  const links = bindLinkNavigation(document, {navigate: ({path}) => { navigate(path); }});
  return () => links.destroy();
}, [navigate]);
```

With a router basename and no `<base href>`, pass `base`. The browser keeps
modified and middle clicks, prevented clicks, `download`, a `target` other than
`_self`, `rel="external"`, other origins, links outside the base path, and
fragment links to the current document; `navigate` returning `false` also leaves
the click to the browser. `NavigationDrawer` closes after a click handed to the
router. Focus after navigation, route announcements, scroll restoration and
`current` remain the application's.
