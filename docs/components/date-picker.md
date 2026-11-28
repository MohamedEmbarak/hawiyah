# DatePicker

DatePicker is a date-only field: a text input for a Gregorian ISO date and a trigger that opens a labelled calendar in a native modal dialog. The value is always an ISO date in the form YYYY-MM-DD, whichever calendar the dialog displays.

## Example

A date field has a visible label and a hint that states the format. Every control name and message is supplied by the application, and `locale` is required because month and weekday names come from Intl for that locale. The example holds a fixed value so that it does not depend on today's date.

```html live example=basic static differences=date-picker-adapter-markup,date-picker-value-order,date-picker-adapter-height
<div class="hw-date-picker" data-hw="date-picker" data-hw-locale="en" data-hw-previous-label="Previous month" data-hw-next-label="Next month" data-hw-calendar-system-label="Calendar system" data-hw-gregorian-label="Gregorian" data-hw-hijri-label="Hijri (Umm al-Qura)" data-hw-range-label="Supported range" data-hw-invalid-message="Enter a date in the form YYYY-MM-DD." data-hw-unsupported-message="This date is outside the supported Umm al-Qura range.">
  <label class="hw-label" for="basic">Appointment date</label>
  <div class="hw-date-picker-control"><input class="hw-input" id="basic" type="text" placeholder="YYYY-MM-DD" data-hw-date-input name="basic" value="2026-03-12" aria-describedby="basic-hint">
  <button type="button" data-hw-date-trigger aria-label="Open calendar">Calendar</button></div>
  <p class="hw-hint" id="basic-hint">Use the form YYYY-MM-DD.</p>
  <dialog class="hw-dialog" data-hw-date-dialog aria-label="Choose appointment date">
    <header class="hw-dialog-header"><h2>Choose appointment date</h2><button class="hw-button" data-variant="ghost" type="button" data-hw-date-close>Close</button></header>
    <div class="hw-dialog-body"><div class="hw-calendar" data-hw-date-calendar></div></div>
  </dialog>
</div>
```

```tsx live example=basic
<DatePicker locale="en" label="Appointment date" hint="Use the form YYYY-MM-DD." placeholder="YYYY-MM-DD" calendarLabel="Choose appointment date" openLabel="Open calendar" closeLabel="Close" previousLabel="Previous month" nextLabel="Next month" calendarSystemLabel="Calendar system" gregorianLabel="Gregorian" hijriLabel="Hijri (Umm al-Qura)" rangeLabel="Supported range" invalidMessage="Enter a date in the form YYYY-MM-DD." unsupportedMessage="This date is outside the supported Umm al-Qura range." defaultValue="2026-03-12" />
```

```vue live example=basic
<DatePicker locale="en" label="Appointment date" hint="Use the form YYYY-MM-DD." placeholder="YYYY-MM-DD" calendar-label="Choose appointment date" open-label="Open calendar" close-label="Close" previous-label="Previous month" next-label="Next month" calendar-system-label="Calendar system" gregorian-label="Gregorian" hijri-label="Hijri (Umm al-Qura)" range-label="Supported range" invalid-message="Enter a date in the form YYYY-MM-DD." unsupported-message="This date is outside the supported Umm al-Qura range." default-value="2026-03-12" />
```

```ts live example=basic framework=angular
template: `<hw-date-picker locale="en" label="Appointment date" hint="Use the form YYYY-MM-DD." placeholder="YYYY-MM-DD" calendarLabel="Choose appointment date" openLabel="Open calendar" closeLabel="Close" previousLabel="Previous month" nextLabel="Next month" calendarSystemLabel="Calendar system" gregorianLabel="Gregorian" hijriLabel="Hijri (Umm al-Qura)" rangeLabel="Supported range" invalidMessage="Enter a date in the form YYYY-MM-DD." unsupportedMessage="This date is outside the supported Umm al-Qura range." value="2026-03-12" />`
```

## Variants and states

### Umm al-Qura

With `calendar` set to `islamic-umalqura` the dialog shows Umm al-Qura months and days and its switch selects the Hijri option. The submitted value stays the Gregorian ISO date.

```html live example=umalqura static differences=date-picker-adapter-markup,date-picker-value-order,date-picker-adapter-height
<div class="hw-date-picker" data-hw="date-picker" data-hw-locale="en" data-hw-previous-label="Previous month" data-hw-next-label="Next month" data-hw-calendar-system-label="Calendar system" data-hw-gregorian-label="Gregorian" data-hw-hijri-label="Hijri (Umm al-Qura)" data-hw-range-label="Supported range" data-hw-invalid-message="Enter a date in the form YYYY-MM-DD." data-hw-unsupported-message="This date is outside the supported Umm al-Qura range." data-hw-calendar="islamic-umalqura">
  <label class="hw-label" for="umalqura">Collection date</label>
  <div class="hw-date-picker-control"><input class="hw-input" id="umalqura" type="text" placeholder="YYYY-MM-DD" data-hw-date-input name="umalqura" value="2026-03-12" aria-describedby="umalqura-hint">
  <button type="button" data-hw-date-trigger aria-label="Open calendar">Calendar</button></div>
  <p class="hw-hint" id="umalqura-hint">Use the form YYYY-MM-DD.</p>
  <dialog class="hw-dialog" data-hw-date-dialog aria-label="Choose appointment date">
    <header class="hw-dialog-header"><h2>Choose appointment date</h2><button class="hw-button" data-variant="ghost" type="button" data-hw-date-close>Close</button></header>
    <div class="hw-dialog-body"><div class="hw-calendar" data-hw-date-calendar></div></div>
  </dialog>
</div>
```

```tsx live example=umalqura
<DatePicker locale="en" label="Collection date" hint="Use the form YYYY-MM-DD." placeholder="YYYY-MM-DD" calendarLabel="Choose appointment date" openLabel="Open calendar" closeLabel="Close" previousLabel="Previous month" nextLabel="Next month" calendarSystemLabel="Calendar system" gregorianLabel="Gregorian" hijriLabel="Hijri (Umm al-Qura)" rangeLabel="Supported range" invalidMessage="Enter a date in the form YYYY-MM-DD." unsupportedMessage="This date is outside the supported Umm al-Qura range." defaultValue="2026-03-12" calendar="islamic-umalqura" />
```

```vue live example=umalqura
<DatePicker locale="en" label="Collection date" hint="Use the form YYYY-MM-DD." placeholder="YYYY-MM-DD" calendar-label="Choose appointment date" open-label="Open calendar" close-label="Close" previous-label="Previous month" next-label="Next month" calendar-system-label="Calendar system" gregorian-label="Gregorian" hijri-label="Hijri (Umm al-Qura)" range-label="Supported range" invalid-message="Enter a date in the form YYYY-MM-DD." unsupported-message="This date is outside the supported Umm al-Qura range." default-value="2026-03-12" calendar="islamic-umalqura" />
```

```ts live example=umalqura framework=angular
template: `<hw-date-picker locale="en" label="Collection date" hint="Use the form YYYY-MM-DD." placeholder="YYYY-MM-DD" calendarLabel="Choose appointment date" openLabel="Open calendar" closeLabel="Close" previousLabel="Previous month" nextLabel="Next month" calendarSystemLabel="Calendar system" gregorianLabel="Gregorian" hijriLabel="Hijri (Umm al-Qura)" rangeLabel="Supported range" invalidMessage="Enter a date in the form YYYY-MM-DD." unsupportedMessage="This date is outside the supported Umm al-Qura range." value="2026-03-12" calendar="islamic-umalqura" />`
```

### Bounds

`min` and `max` are Gregorian ISO dates. A typed date outside them is reported with the invalid-date message, and the calendar does not allow selecting it. In vanilla, `createDatePicker` reads the bounds from the native input, so the block writes `min` and `max` on the input.

```html live example=bounds static differences=date-picker-adapter-markup,date-picker-value-order,date-picker-adapter-height
<div class="hw-date-picker" data-hw="date-picker" data-hw-locale="en" data-hw-previous-label="Previous month" data-hw-next-label="Next month" data-hw-calendar-system-label="Calendar system" data-hw-gregorian-label="Gregorian" data-hw-hijri-label="Hijri (Umm al-Qura)" data-hw-range-label="Supported range" data-hw-invalid-message="Enter a date in the form YYYY-MM-DD." data-hw-unsupported-message="This date is outside the supported Umm al-Qura range.">
  <label class="hw-label" for="bounds">Visit date</label>
  <div class="hw-date-picker-control"><input class="hw-input" id="bounds" type="text" placeholder="YYYY-MM-DD" data-hw-date-input name="bounds" min="2026-03-05" max="2026-03-25" value="2026-03-12" aria-describedby="bounds-hint">
  <button type="button" data-hw-date-trigger aria-label="Open calendar">Calendar</button></div>
  <p class="hw-hint" id="bounds-hint">Use the form YYYY-MM-DD.</p>
  <dialog class="hw-dialog" data-hw-date-dialog aria-label="Choose appointment date">
    <header class="hw-dialog-header"><h2>Choose appointment date</h2><button class="hw-button" data-variant="ghost" type="button" data-hw-date-close>Close</button></header>
    <div class="hw-dialog-body"><div class="hw-calendar" data-hw-date-calendar></div></div>
  </dialog>
</div>
```

```tsx live example=bounds
<DatePicker locale="en" label="Visit date" hint="Use the form YYYY-MM-DD." placeholder="YYYY-MM-DD" calendarLabel="Choose appointment date" openLabel="Open calendar" closeLabel="Close" previousLabel="Previous month" nextLabel="Next month" calendarSystemLabel="Calendar system" gregorianLabel="Gregorian" hijriLabel="Hijri (Umm al-Qura)" rangeLabel="Supported range" invalidMessage="Enter a date in the form YYYY-MM-DD." unsupportedMessage="This date is outside the supported Umm al-Qura range." defaultValue="2026-03-12" min="2026-03-05" max="2026-03-25" />
```

```vue live example=bounds
<DatePicker locale="en" label="Visit date" hint="Use the form YYYY-MM-DD." placeholder="YYYY-MM-DD" calendar-label="Choose appointment date" open-label="Open calendar" close-label="Close" previous-label="Previous month" next-label="Next month" calendar-system-label="Calendar system" gregorian-label="Gregorian" hijri-label="Hijri (Umm al-Qura)" range-label="Supported range" invalid-message="Enter a date in the form YYYY-MM-DD." unsupported-message="This date is outside the supported Umm al-Qura range." default-value="2026-03-12" min="2026-03-05" max="2026-03-25" />
```

```ts live example=bounds framework=angular
template: `<hw-date-picker locale="en" label="Visit date" hint="Use the form YYYY-MM-DD." placeholder="YYYY-MM-DD" calendarLabel="Choose appointment date" openLabel="Open calendar" closeLabel="Close" previousLabel="Previous month" nextLabel="Next month" calendarSystemLabel="Calendar system" gregorianLabel="Gregorian" hijriLabel="Hijri (Umm al-Qura)" rangeLabel="Supported range" invalidMessage="Enter a date in the form YYYY-MM-DD." unsupportedMessage="This date is outside the supported Umm al-Qura range." value="2026-03-12" min="2026-03-05" max="2026-03-25" />`
```

## API

### JavaScript

Table: Options of createDatePicker

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `calendar` | `'gregory' \| 'islamic-umalqura'` | `false` | — |
| `locale` | `string` | `false` | — |
| `getDayLabel` | `(value: string) => string` | `false` | — |
| `onValueChange` | `(value: string) => void` | `false` | — |
| `onCalendarChange` | `(calendar: 'gregory' \| 'islamic-umalqura') => void` | `false` | — |
| `isDateDisabled` | `(value: string) => boolean` | `false` | — |
| `calendarSystemLabel` | `string` | `false` | — |
| `gregorianLabel` | `string` | `false` | — |
| `hijriLabel` | `string` | `false` | — |
| `calendarLabel` | `string` | `false` | — |
| `openLabel` | `string` | `false` | — |
| `invalidMessage` | `string` | `false` | — |
| `unavailableMessage` | `string` | `false` | — |
| `previousLabel` | `string` | `false` | — |
| `nextLabel` | `string` | `false` | — |
| `unsupportedMessage` | `string` | `false` | — |
| `rangeLabel` | `string` | `false` | — |

`createDatePicker(root, options)` composes a native text input marked `data-hw-date-input`, a trigger marked `data-hw-date-trigger`, and a native `dialog` marked `data-hw-date-dialog` that holds an empty element marked `data-hw-date-calendar`; the controller fills that element with a calendar and writes the Gregorian and Hijri switch directly before it. A close button marked `data-hw-date-close` closes the dialog. The nested element must not carry `data-hw="calendar"` itself. The root reads `calendar`, `locale` and the text options as `data-hw-<name>` in kebab case, as the example does, and an option passed to the factory wins; `getDayLabel`, `isDateDisabled`, `onValueChange` and `onCalendarChange` are read from the options only, and the bounds come from the `min` and `max` of the native input. An authored name wins over the root attribute: `openLabel` is read only when the trigger has neither `aria-label` nor text, and `calendarLabel` only when the dialog is not named, so the blocks name the trigger and the dialog directly. The close button is the authored `data-hw-date-close` element with its own text, and `createDatePicker` takes no text option for it. The options publish no defaults in 0.3.0: without `calendar` the display is Gregorian. `locale` is required, and every text option (`calendarLabel`, `openLabel`, `previousLabel`, `nextLabel`, `calendarSystemLabel`, `gregorianLabel`, `hijriLabel`, `rangeLabel`, `invalidMessage`, `unsupportedMessage`) is application text with no default; `unavailableMessage` is needed when `isDateDisabled` is given. The controller returns `show`, `close`, `value`, `calendar`, `select`, `setValue`, `setMonth`, `setCalendar` and `destroy`. `onValueChange` and `onCalendarChange` report the new value and the new display calendar.

### React

Table: Props of DatePicker

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `value` | `string` | `false` | — |
| `defaultValue` | `string` | `false` | `''` |
| `onValueChange` | `(value: string) => void` | `false` | — |
| `min` | `string` | `false` | — |
| `max` | `string` | `false` | — |
| `locale` | `string` | `true` | — |
| `calendar` | `'gregory' \| 'islamic-umalqura'` | `false` | — |
| `defaultCalendar` | `'gregory' \| 'islamic-umalqura'` | `false` | `'gregory'` |
| `onCalendarChange` | `(calendar: 'gregory' \| 'islamic-umalqura') => void` | `false` | — |
| `calendarSystemLabel` | `string` | `true` | — |
| `gregorianLabel` | `string` | `true` | — |
| `hijriLabel` | `string` | `true` | — |
| `rangeLabel` | `string` | `true` | — |
| `weekStartsOn` | `number` | `false` | — |
| `calendarLabel` | `string` | `true` | — |
| `openLabel` | `string` | `true` | — |
| `previousLabel` | `string` | `true` | — |
| `nextLabel` | `string` | `true` | — |
| `closeLabel` | `string` | `true` | — |
| `unsupportedMessage` | `string` | `true` | — |
| `invalidMessage` | `string` | `true` | — |
| `getDayLabel` | `(value: string) => string` | `false` | — |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |
| `label` | `ReactNode` | `false` | — |
| `isDateDisabled` | `(value: string) => boolean` | `false` | — |
| `unavailableMessage` | `string` | `false` | — |

DatePicker holds an ISO Gregorian string. Use `value` with `onValueChange` for a controlled picker, or `defaultValue` for an uncontrolled one, which starts at the empty string. `calendar` with `onCalendarChange` controls the display calendar, and `defaultCalendar` (default `'gregory'`) starts an uncontrolled one. `locale`, `calendarSystemLabel`, `gregorianLabel`, `hijriLabel`, `rangeLabel`, `calendarLabel`, `openLabel`, `previousLabel`, `nextLabel`, `closeLabel`, `unsupportedMessage` and `invalidMessage` are required text. `label`, `hint` and `error` are renderable content, and `aria-label` or `aria-labelledby` names the input when no `label` is given. A non-empty `error` replaces the message of a typed date. `isDateDisabled` rejects a date and needs `unavailableMessage`, the validation message for it; `getDayLabel` replaces the day name that Intl produces. `weekStartsOn` is passed unchanged to the nested calendar, which defaults it to `0`, Sunday.

### Vue

Table: Props, events and slots of DatePicker

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `calendar` | prop | `'gregory' \| 'islamic-umalqura'` | `false` | — |
| `calendarSwitchable` | prop | `boolean` | `false` | `true` |
| `label` | prop | `string` | `false` | — |
| `unsupportedMessage` | prop | `string` | `true` | — |
| `rangeLabel` | prop | `string` | `true` | — |
| `calendarSystemLabel` | prop | `string` | `true` | — |
| `gregorianLabel` | prop | `string` | `true` | — |
| `hijriLabel` | prop | `string` | `true` | — |
| `calendarLabel` | prop | `string` | `true` | — |
| `openLabel` | prop | `string` | `true` | — |
| `closeLabel` | prop | `string` | `true` | — |
| `invalidMessage` | prop | `string` | `true` | — |
| `unavailableMessage` | prop | `string` | `false` | — |
| `placeholder` | prop | `string` | `false` | — |
| `hint` | prop | `string` | `false` | — |
| `error` | prop | `string` | `false` | — |
| `required` | prop | `boolean` | `false` | — |
| `modelValue` | prop | `string` | `false` | — |
| `defaultValue` | prop | `string` | `false` | `''` |
| `month` | prop | `string` | `false` | — |
| `min` | prop | `string` | `false` | — |
| `max` | prop | `string` | `false` | — |
| `locale` | prop | `string` | `true` | — |
| `weekStartsOn` | prop | `number` | `false` | `0` |
| `disabled` | prop | `boolean` | `false` | `false` |
| `readonly` | prop | `boolean` | `false` | `false` |
| `previousLabel` | prop | `string` | `true` | — |
| `nextLabel` | prop | `string` | `true` | — |
| `getDayLabel` | prop | `(value: string) => string` | `false` | — |
| `isDateDisabled` | prop | `(value: string) => boolean` | `false` | — |
| `update:modelValue` | event | `(value: string) => void` | `false` | — |
| `update:calendar` | event | `(value: 'gregory' \| 'islamic-umalqura') => void` | `false` | — |

`v-model` binds the ISO string and `defaultValue` sets the initial value of an uncontrolled picker. `calendar` is bound with the `update:calendar` event and has no declared default: without it the dialog starts in the Gregorian calendar. `calendarSwitchable` (default `true`) controls whether the dialog shows the switch. `locale`, `calendarSystemLabel`, `gregorianLabel`, `hijriLabel`, `rangeLabel`, `calendarLabel`, `openLabel`, `closeLabel`, `previousLabel`, `nextLabel`, `unsupportedMessage` and `invalidMessage` are required text; `unavailableMessage` is required when `isDateDisabled` is given. `label`, `hint`, `error` and `placeholder` are strings, and `placeholder` has no default. `required` sets the native attribute and shows the marker after the label. `disabled` and `readonly` default to `false`. A form reset returns to `defaultValue`, closes the dialog and clears the draft and the message. The table lists no slot because the published build reads none.

### Angular

Table: Inputs, outputs and content of hw-date-picker

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
| `min` | input | `string` | `false` | `''` |
| `max` | input | `string` | `false` | `''` |
| `calendar` | input | `'gregory' \| 'islamic-umalqura'` | `false` | `'gregory'` |
| `weekStartsOn` | input | `number` | `false` | `0` |
| `direction` | input | `'ltr' \| 'rtl'` | `false` | — |
| `locale` | input | `string` | `true` | — |
| `calendarLabel` | input | `string` | `true` | — |
| `openLabel` | input | `string` | `true` | — |
| `closeLabel` | input | `string` | `true` | — |
| `previousLabel` | input | `string` | `true` | — |
| `nextLabel` | input | `string` | `true` | — |
| `calendarSystemLabel` | input | `string` | `true` | — |
| `gregorianLabel` | input | `string` | `true` | — |
| `hijriLabel` | input | `string` | `true` | — |
| `rangeLabel` | input | `string` | `true` | — |
| `invalidMessage` | input | `string` | `true` | — |
| `unsupportedMessage` | input | `string` | `true` | — |
| `isDateDisabled` | input | `(value: string) => boolean` | `false` | — |
| `unavailableMessage` | input | `string` | `false` | `''` |
| `getDayLabel` | input | `(value: string) => string` | `false` | — |
| `placeholder` | input | `string` | `false` | `''` |
| `valueChange` | output | `string` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |
| `calendarChange` | output | `'gregory' \| 'islamic-umalqura'` | `false` | — |

`HwDatePickerComponent` (`hw-date-picker`) renders the label, the text input, the trigger, the hint, the error and the dialog. Bind `[(value)]` for the ISO string and `[(calendar)]` for the display calendar through `calendarChange`; the component also works as a form control. `label` is required unless `aria-label`, `aria-labelledby` or a surrounding `hw-field` names the input. `locale`, `calendarLabel` (the title of the dialog and the name of the calendar), `openLabel`, `closeLabel`, `previousLabel`, `nextLabel`, `calendarSystemLabel`, `gregorianLabel`, `hijriLabel`, `rangeLabel`, `invalidMessage` and `unsupportedMessage` are required, and `unavailableMessage` is required with `isDateDisabled`. `direction` is passed to the nested calendar only: the calendar writes it as `dir` on its own root and uses it for the arrow keys, and the dialog, its header and the switch do not receive it. The same text of a typed date's message is the input's custom validity, and a message that is missing still blocks submission. While `locale` is empty the typed ISO date is shown as typed, no formatted date is announced and the calendar in the dialog is empty. `calendar` defaults to `'gregory'` and `weekStartsOn` to `0`.

## Accessibility

The input is a text input named by the visible label, and the hint is associated with it through `aria-describedby`. The trigger has the name `openLabel`. The dialog is a native modal dialog named by `calendarLabel`; opening it moves focus to the selected day, or to today, and Escape closes it. Closing returns focus to the control that opened the dialog: the trigger, or the input when Down Arrow opened it. A selected date is also announced in full, with the weekday, in an output after the input, including while the dialog is closed.

The message for a typed date that is malformed, outside the calendar's range, outside `min` and `max`, or rejected by `isDateDisabled` is one paragraph after the hint with `role="alert"`, and the input is marked `aria-invalid` with the message in its description until the date is valid again or the form resets. The application's own `error` replaces that message and has no role.

Table: Keyboard interaction of DatePicker

| Key | Action |
| --- | --- |
| <kbd>Down Arrow</kbd> | In the text input, opens the calendar and moves focus to the selected day, or to today. |
| <kbd>Right Arrow</kbd>, <kbd>Left Arrow</kbd> | In the calendar, moves focus to the next or the previous day in the direction of the page. |
| <kbd>Down Arrow</kbd>, <kbd>Up Arrow</kbd> | In the calendar, moves focus to the same weekday of the next or the previous week. |
| <kbd>Home</kbd>, <kbd>End</kbd> | In the calendar, moves focus to the first or the last day of the week. |
| <kbd>Page Down</kbd>, <kbd>Page Up</kbd> | In the calendar, moves focus to the next or the previous month. |
| <kbd>Shift</kbd> + <kbd>Page Down</kbd>, <kbd>Shift</kbd> + <kbd>Page Up</kbd> | In the calendar, moves focus to the next or the previous year. |
| <kbd>Enter</kbd>, <kbd>Space</kbd> | Selects the focused day, writes its date into the input, closes the dialog and returns focus to the control that opened it. |
| <kbd>Escape</kbd> | Closes the dialog and returns focus to the control that opened it. |

Calendar navigation stops at the bounds of `min`, `max` and the Umm al-Qura table, and the supported range information is one focusable element named by `rangeLabel`.

## RTL and localisation

The typed value, `min` and `max` are Gregorian ISO dates in every language and calendar, so a reader types the same text whichever calendar the dialog displays. The display calendar, the locale and the direction are independent: `locale` selects only how Intl writes names, and the calendar takes its direction from its nearest `dir`, or in Angular from `direction`. ISO dates inside a message are isolated left-to-right so that they stay readable in right-to-left text. The component has no built-in text, so every label and message is written in the language of the page.

Switching the display calendar keeps the selected ISO date and keeps the dialog open. The Umm al-Qura table covers 1924-08-01 through 2077-11-16 (AH 1343 to 1500); a Gregorian date outside it stays in the input, is marked invalid while the Hijri calendar is chosen, and is explained by `unsupportedMessage`. The idle field shows the formatted date in the active calendar and focus shows the ISO text for editing.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of DatePicker. The evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The compact field, the modal, the switch and the range information are Hawiyah decisions described in the [date picker presentation note](../date-picker-ui.md), which states that they are not extracted Platforms Code dimensions.
- The pinned Umm al-Qura reference, its supported range and the limits of its sources are described in the [calendar reliability note](../date-calendars.md).
