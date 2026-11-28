# Calendar

Calendar is a keyboard date grid for choosing one day of a month. It holds a Gregorian ISO date and displays it in the Gregorian or the table-backed Umm al-Qura calendar.

## Example

A calendar has a name that says which date the reader chooses, and names for its previous and next month buttons. `locale` is required: month and weekday names come from Intl for that locale, and the component supplies no text of its own. The vanilla block also writes the range label, because `createCalendar` requires `rangeLabel` in every calendar, while the React, Vue and Angular components need it only with `calendar="islamic-umalqura"`. The example opens on a fixed month so that it does not depend on today's date.

```html live example=basic static differences=calendar-adapter-markup,calendar-adapter-tree,calendar-vanilla-height
<div class="hw-calendar" data-hw="calendar" data-hw-locale="en" aria-label="Appointment date" data-hw-previous-label="Previous month" data-hw-next-label="Next month" data-hw-range-label="Supported range" data-hw-value="2026-03-12"></div>
```

```tsx live example=basic
<Calendar locale="en" label="Appointment date" previousLabel="Previous month" nextLabel="Next month" defaultValue="2026-03-12" />
```

```vue live example=basic
<Calendar locale="en" label="Appointment date" previous-label="Previous month" next-label="Next month" default-value="2026-03-12" />
```

```ts live example=basic framework=angular
template: `<hw-calendar locale="en" label="Appointment date" previousLabel="Previous month" nextLabel="Next month" value="2026-03-12" />`
```

## Variants and states

### Bounds

`min` and `max` are Gregorian ISO dates. A day outside them cannot be selected or focused, and a month button is disabled only when the whole neighbouring month lies outside the bounds.

```html live example=bounds static differences=calendar-adapter-markup,calendar-adapter-tree,calendar-vanilla-height
<div class="hw-calendar" data-hw="calendar" data-hw-locale="en" aria-label="Collection date" data-hw-previous-label="Previous month" data-hw-next-label="Next month" data-hw-range-label="Supported range" data-hw-value="2026-03-12" data-hw-min="2026-03-05" data-hw-max="2026-03-25"></div>
```

```tsx live example=bounds
<Calendar locale="en" label="Collection date" previousLabel="Previous month" nextLabel="Next month" defaultValue="2026-03-12" min="2026-03-05" max="2026-03-25" />
```

```vue live example=bounds
<Calendar locale="en" label="Collection date" previous-label="Previous month" next-label="Next month" default-value="2026-03-12" min="2026-03-05" max="2026-03-25" />
```

```ts live example=bounds framework=angular
template: `<hw-calendar locale="en" label="Collection date" previousLabel="Previous month" nextLabel="Next month" value="2026-03-12" min="2026-03-05" max="2026-03-25" />`
```

### Week start

`weekStartsOn` is a number from 0 for Sunday; the week below starts on Saturday.

```html live example=week-start static differences=calendar-adapter-markup,calendar-adapter-tree,calendar-vanilla-height
<div class="hw-calendar" data-hw="calendar" data-hw-locale="en" aria-label="Visit date" data-hw-previous-label="Previous month" data-hw-next-label="Next month" data-hw-range-label="Supported range" data-hw-value="2026-03-12" data-hw-week-starts-on="6"></div>
```

```tsx live example=week-start
<Calendar locale="en" label="Visit date" previousLabel="Previous month" nextLabel="Next month" defaultValue="2026-03-12" weekStartsOn={6} />
```

```vue live example=week-start
<Calendar locale="en" label="Visit date" previous-label="Previous month" next-label="Next month" default-value="2026-03-12" :week-starts-on="6" />
```

```ts live example=week-start framework=angular
template: `<hw-calendar locale="en" label="Visit date" previousLabel="Previous month" nextLabel="Next month" value="2026-03-12" [weekStartsOn]="6" />`
```

### Umm al-Qura

With `calendar` set to `islamic-umalqura` the grid shows Umm al-Qura months and days, while the value stays a Gregorian ISO date. `rangeLabel` names the information about the supported range, and `unsupportedMessage` is announced when the value lies outside that range.

```html live example=umalqura static differences=calendar-adapter-markup,calendar-adapter-tree,calendar-vanilla-height
<div class="hw-calendar" data-hw="calendar" data-hw-locale="en" data-hw-calendar="islamic-umalqura" aria-label="Appointment date" data-hw-previous-label="Previous month" data-hw-next-label="Next month" data-hw-range-label="Supported range" data-hw-unsupported-message="This date is outside the supported Umm al-Qura range." data-hw-value="2026-03-12"></div>
```

```tsx live example=umalqura
<Calendar locale="en" calendar="islamic-umalqura" label="Appointment date" previousLabel="Previous month" nextLabel="Next month" rangeLabel="Supported range" unsupportedMessage="This date is outside the supported Umm al-Qura range." defaultValue="2026-03-12" />
```

```vue live example=umalqura
<Calendar locale="en" calendar="islamic-umalqura" label="Appointment date" previous-label="Previous month" next-label="Next month" range-label="Supported range" unsupported-message="This date is outside the supported Umm al-Qura range." default-value="2026-03-12" />
```

```ts live example=umalqura framework=angular
template: `<hw-calendar locale="en" calendar="islamic-umalqura" label="Appointment date" previousLabel="Previous month" nextLabel="Next month" rangeLabel="Supported range" unsupportedMessage="This date is outside the supported Umm al-Qura range." value="2026-03-12" />`
```

### Read only

A read-only calendar allows browsing between months but does not change the selected value.

```html live example=readonly static differences=calendar-adapter-markup,calendar-adapter-tree,calendar-vanilla-height
<div class="hw-calendar" data-hw="calendar" data-hw-locale="en" aria-label="Submission date" data-hw-previous-label="Previous month" data-hw-next-label="Next month" data-hw-range-label="Supported range" data-hw-value="2026-03-12" data-hw-readonly="true"></div>
```

```tsx live example=readonly
<Calendar locale="en" label="Submission date" previousLabel="Previous month" nextLabel="Next month" defaultValue="2026-03-12" readOnly />
```

```vue live example=readonly
<Calendar locale="en" label="Submission date" previous-label="Previous month" next-label="Next month" default-value="2026-03-12" readonly />
```

```ts live example=readonly framework=angular
template: `<hw-calendar locale="en" label="Submission date" previousLabel="Previous month" nextLabel="Next month" value="2026-03-12" [readOnly]="true" />`
```

## API

### JavaScript

Table: Options of createCalendar

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `getDayLabel` | `(value: string) => string` | `false` | — |
| `value` | `string` | `false` | — |
| `month` | `string` | `false` | — |
| `min` | `string` | `false` | — |
| `max` | `string` | `false` | — |
| `locale` | `string` | `false` | — |
| `calendar` | `'gregory' \| 'islamic-umalqura'` | `false` | — |
| `weekStartsOn` | `number` | `false` | — |
| `disabled` | `boolean` | `false` | — |
| `readOnly` | `boolean` | `false` | — |
| `name` | `string` | `false` | — |
| `isDateDisabled` | `(value: string) => boolean` | `false` | — |
| `onValueChange` | `(value: string) => void` | `false` | — |
| `onSelect` | `(value: string) => void` | `false` | — |
| `onCalendarChange` | `(calendar: 'gregory' \| 'islamic-umalqura') => void` | `false` | — |
| `label` | `string` | `false` | — |
| `previousLabel` | `string` | `false` | — |
| `nextLabel` | `string` | `false` | — |
| `unsupportedMessage` | `string` | `false` | — |
| `rangeLabel` | `string` | `false` | — |

`createCalendar(root, options)` fills the element `root` with a toolbar, a weekday row and a day grid, and returns a controller with `value`, `calendar`, `select`, `setValue`, `setMonth`, `setCalendar` and `destroy`. The root also reads these options as attributes: `locale`, `value`, `month`, `min`, `max`, `calendar`, `weekStartsOn`, `name`, `disabled` and the five texts `label`, `previousLabel`, `nextLabel`, `rangeLabel` and `unsupportedMessage`, each as `data-hw-<name>` in kebab case, as the examples do; `readOnly` is written `data-hw-readonly="true"`. `getDayLabel`, `isDateDisabled`, `onValueChange`, `onSelect` and `onCalendarChange` are read from the options only. `data-hw="calendar"` lets `enhance()` of the vanilla package create the controller; an option passed to the factory wins over the attribute. The options publish no defaults in 0.3.0: without `calendar` the display is Gregorian, and without `weekStartsOn` the week starts on Sunday. `locale` is required for any output, because the controller renders nothing that Intl would produce while it is empty, and `label`, `previousLabel` and `nextLabel` are application text with no default; `rangeLabel` is required in every calendar, and `unsupportedMessage` is needed while `calendar` is `islamic-umalqura`. `onValueChange` is called when the value changes, `onSelect` when the reader selects a day, and `onCalendarChange` when `setCalendar` changes the display calendar. `isDateDisabled` rejects a day; a rejected day is a disabled button. A standalone calendar has no switch between the two calendars, so call `setCalendar` from your own control. When `name` is set, the selected date is submitted through a hidden input, and a native form reset restores the authored value.

### React

Table: Props of Calendar

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `value` | `string` | `false` | — |
| `defaultValue` | `string` | `false` | `''` |
| `onValueChange` | `(value: string) => void` | `false` | — |
| `month` | `string` | `false` | — |
| `defaultMonth` | `string` | `false` | — |
| `onMonthChange` | `(month: string) => void` | `false` | — |
| `min` | `string` | `false` | — |
| `max` | `string` | `false` | — |
| `locale` | `string` | `true` | — |
| `weekStartsOn` | `number` | `false` | `0` |
| `isDateDisabled` | `(value: string) => boolean` | `false` | — |
| `disabled` | `boolean` | `false` | — |
| `readOnly` | `boolean` | `false` | — |
| `previousLabel` | `string` | `true` | — |
| `nextLabel` | `string` | `true` | — |
| `getDayLabel` | `(value: string) => string` | `false` | — |
| `name` | `string` | `false` | — |
| `form` | `string` | `false` | — |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `label` | `string` | `false` | — |
| `calendar` | `'gregory' \| 'islamic-umalqura'` | `false` | `'gregory'` |
| `rangeLabel` | `string` | `false` | — |
| `unsupportedMessage` | `string` | `false` | — |

Calendar holds an ISO Gregorian string. Use `value` with `onValueChange` for a controlled calendar, or `defaultValue` for an uncontrolled one, which starts at the empty string; `month` with `onMonthChange` and `defaultMonth` do the same for the month shown. `locale`, `previousLabel` and `nextLabel` are required, and `label`, `aria-label` or `aria-labelledby` names the root element, a `section` region; the month heading names the grid. `rangeLabel` and `unsupportedMessage` are needed when `calendar` is `islamic-umalqura`; `unsupportedMessage` is announced by a status paragraph after the grid while the value cannot be shown. `weekStartsOn` defaults to `0` and `calendar` to `'gregory'`. `isDateDisabled` and `getDayLabel` receive an ISO date; the first rejects a day and the second replaces the day name that Intl produces. `name` and `form` submit the selected date through a hidden input. `disabled` and `readOnly` have no default and are off when absent.

### Vue

Table: Props, events and slots of Calendar

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `modelValue` | prop | `string` | `false` | — |
| `defaultValue` | prop | `string` | `false` | `''` |
| `month` | prop | `string` | `false` | — |
| `min` | prop | `string` | `false` | — |
| `max` | prop | `string` | `false` | — |
| `locale` | prop | `string` | `true` | — |
| `calendar` | prop | `'gregory' \| 'islamic-umalqura'` | `false` | `'gregory'` |
| `weekStartsOn` | prop | `number` | `false` | `0` |
| `disabled` | prop | `boolean` | `false` | `false` |
| `readonly` | prop | `boolean` | `false` | `false` |
| `label` | prop | `string` | `false` | — |
| `previousLabel` | prop | `string` | `true` | — |
| `nextLabel` | prop | `string` | `true` | — |
| `unsupportedMessage` | prop | `string` | `false` | — |
| `rangeLabel` | prop | `string` | `false` | — |
| `getDayLabel` | prop | `(value: string) => string` | `false` | — |
| `isDateDisabled` | prop | `(value: string) => boolean` | `false` | — |
| `update:modelValue` | event | `(value: string) => void` | `false` | — |
| `update:month` | event | `(value: string) => void` | `false` | — |

`v-model` binds the ISO string and `defaultValue` sets the initial value of an uncontrolled calendar; `update:month` is emitted when the reader browses to another month, and `month` sets the month shown. `locale`, `previousLabel` and `nextLabel` are required; `label` names the grid, or write `aria-label` or `aria-labelledby`. `rangeLabel` and `unsupportedMessage` are needed when `calendar` is `islamic-umalqura`. `calendar` defaults to `'gregory'`, `weekStartsOn` to `0`, and `disabled` and `readonly` to `false`. `isDateDisabled` and `getDayLabel` take an ISO date: a rejected day is a disabled button, and the day name replaces the one from Intl. The table lists no slot because the published build reads none.

### Angular

Table: Inputs, outputs and content of hw-calendar

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `controlId` | input | `string \| null \| undefined` | `false` | — |
| `label` | input | `string` | `false` | `''` |
| `name` | input | `string` | `false` | `''` |
| `hint` | input | `string` | `false` | `''` |
| `error` | input | `string` | `false` | `''` |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `aria-invalid` | input | `boolean` | `false` | `false` |
| `form` | input | `string \| null` | `false` | `null` |
| `required` | input | `boolean` | `false` | — |
| `disabled` | input | `boolean` | `false` | `false` |
| `value` | input | `string` | `false` | `''` |
| `readOnly` | input | `boolean` | `false` | `false` |
| `locale` | input | `string` | `true` | — |
| `previousLabel` | input | `string` | `true` | — |
| `nextLabel` | input | `string` | `true` | — |
| `rangeLabel` | input | `string` | `false` | `''` |
| `rangeTooltipId` | input | `string` | `false` | `''` |
| `getDayLabel` | input | `(value: string) => string` | `false` | — |
| `isDateDisabled` | input | `(value: string) => boolean` | `false` | — |
| `unsupportedMessage` | input | `string` | `false` | `''` |
| `month` | input | `string` | `false` | `''` |
| `min` | input | `string` | `false` | `''` |
| `max` | input | `string` | `false` | `''` |
| `calendar` | input | `'gregory' \| 'islamic-umalqura'` | `false` | `'gregory'` |
| `weekStartsOn` | input | `number` | `false` | `0` |
| `direction` | input | `'ltr' \| 'rtl'` | `false` | — |
| `valueChange` | output | `string` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |
| `monthChange` | output | `string` | `false` | — |

`HwCalendarComponent` (`hw-calendar`) binds `[(value)]` for the ISO string and emits `monthChange` when the reader browses. It also works as a form control through its value accessor. `locale`, `previousLabel` and `nextLabel` are required, and `label` names the grid unless `aria-label`, `aria-labelledby` or a surrounding `hw-field` does; these attributes are forwarded to the grid. While `locale` is empty the toolbar and the grid are not rendered. `rangeLabel` and `unsupportedMessage` are required with `calendar="islamic-umalqura"`; `rangeTooltipId` sets the id of the tooltip that describes the range information. `direction` sets the direction of the whole calendar, which it writes as `dir` on the root, and takes precedence over the direction of the page, including for the arrow keys. `isDateDisabled` runs while rendering, so it must be pure. `calendar` defaults to `'gregory'` and `weekStartsOn` to `0`.

## Accessibility

The grid is a native `table` with the grid role, and each day is a native button, so Enter and Space select it. Focus rests on one day of the grid at a time (a roving tab stop), and `isDateDisabled` days, and days outside `min` and `max`, are disabled buttons that arrow keys pass over. The tab stop of an empty calendar is today when it is shown and available. A read-only calendar allows browsing but does not change the value. Vue and Angular name the grid by `label`; vanilla and React name it by the month heading, and put `label` on the calendar root.

Table: Keyboard interaction of Calendar

| Key | Action |
| --- | --- |
| <kbd>Right Arrow</kbd>, <kbd>Left Arrow</kbd> | Moves focus to the day on that side; in a right-to-left page Right Arrow moves to the previous day. |
| <kbd>Down Arrow</kbd>, <kbd>Up Arrow</kbd> | Moves focus to the same weekday of the next or the previous week. |
| <kbd>Home</kbd>, <kbd>End</kbd> | Moves focus to the first or the last day of the week. |
| <kbd>Page Down</kbd>, <kbd>Page Up</kbd> | Moves focus to the next or the previous month. |
| <kbd>Shift</kbd> + <kbd>Page Down</kbd>, <kbd>Shift</kbd> + <kbd>Page Up</kbd> | Moves focus to the next or the previous year. |
| <kbd>Enter</kbd>, <kbd>Space</kbd> | Selects the focused day. |

When the Umm al-Qura calendar cannot show the value, the status paragraph after the grid holds `unsupportedMessage`. The supported range information is one focusable element named by `rangeLabel`. Navigation stops at the bounds of `min`, `max` and the Umm al-Qura table.

## RTL and localisation

The values and the bounds are Gregorian ISO dates in every language and calendar. The display calendar, the locale and the direction are independent: `locale` selects only how Intl writes month, weekday and day names, and it does not choose the direction, which the calendar takes from the page or, in Angular, from `direction`. In a right-to-left page the horizontal arrow keys and the month buttons follow the visual direction. The component has no built-in text, so the label, the month button names, the range label and the unsupported message are written in the language of the page.

Umm al-Qura arithmetic and numeric day labels come from a pinned reference table, not from the browser's conversion, and cover 1924-08-01 through 2077-11-16 (AH 1343 to 1500). A Gregorian date outside that range is kept as the value and the calendar announces `unsupportedMessage`; no fallback changes the meaning of a date.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Calendar. The evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The date value, the supported range of the Umm al-Qura table and the limits of the reference data are described in the [calendar reliability note](../date-calendars.md).
- The calendars and date values that Hawiyah supports are described in the section Calendars and date values of the [coverage notes](../coverage.md).
