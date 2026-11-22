# Switch

Switch is a native checkbox input with the switch role, wrapped in a clickable label, for a setting that is either on or off. The value is a boolean.

## Example

The label names the setting and keeps the same wording whether the switch is on or off, so the state is carried by the control and not by the text.

```html live example=basic differences=switch-adapter-attributes
<div class="hw-field">
  <label class="hw-choice" for="basic-notify">
    <input class="hw-switch" id="basic-notify" name="notify" type="checkbox" role="switch">Send an email when the status of my request changes
  </label>
</div>
```

```tsx live example=basic
<Switch label="Send an email when the status of my request changes" name="notify" />
```

```vue live example=basic
<Switch label="Send an email when the status of my request changes" name="notify" />
```

```ts live example=basic framework=angular
template: `<hw-switch label="Send an email when the status of my request changes" name="notify" />`
```

## Variants and states

### Hint

A hint renders as a paragraph after the control and is associated with it as its description. Use it for a consequence the label does not state.

```html live example=hint differences=switch-adapter-attributes
<div class="hw-field">
  <label class="hw-choice" for="hint-reminders">
    <input class="hw-switch" id="hint-reminders" name="reminders" type="checkbox" role="switch" aria-describedby="hint-reminders-hint">Remind me before a document expires
  </label>
  <p class="hw-hint" id="hint-reminders-hint">The reminder is sent thirty days before the expiry date.</p>
</div>
```

```tsx live example=hint
<Switch label="Remind me before a document expires" name="reminders" hint="The reminder is sent thirty days before the expiry date." />
```

```vue live example=hint
<Switch label="Remind me before a document expires" name="reminders" hint="The reminder is sent thirty days before the expiry date." />
```

```ts live example=hint framework=angular
template: `<hw-switch label="Remind me before a document expires" name="reminders" hint="The reminder is sent thirty days before the expiry date." />`
```

### Disabled

A disabled switch uses the native `disabled` attribute: it leaves the tab order and cannot be changed.

```html live example=disabled differences=switch-adapter-attributes
<div class="hw-field">
  <label class="hw-choice" for="disabled-paperless">
    <input class="hw-switch" id="disabled-paperless" name="paperless" type="checkbox" role="switch" checked disabled>Receive correspondence by email only
  </label>
</div>
```

```tsx live example=disabled
<Switch label="Receive correspondence by email only" name="paperless" defaultChecked disabled />
```

```vue live example=disabled
<Switch label="Receive correspondence by email only" name="paperless" :default-value="true" disabled />
```

```ts live example=disabled framework=angular
template: `<hw-switch label="Receive correspondence by email only" name="paperless" [value]="true" [disabled]="true" />`
```

### Read only

A read-only switch stays in the tab order and submits its value, while a click or <kbd>Space</kbd> leaves the value unchanged.

```html live example=readonly differences=switch-adapter-attributes
<div class="hw-field">
  <label class="hw-choice" for="readonly-copy">
    <input class="hw-switch" id="readonly-copy" name="copy" type="checkbox" role="switch" checked readonly aria-disabled="true">Keep a copy of submitted requests
  </label>
</div>
```

```tsx live example=readonly
<Switch label="Keep a copy of submitted requests" name="copy" defaultChecked readOnly />
```

```vue live example=readonly
<Switch label="Keep a copy of submitted requests" name="copy" :default-value="true" readonly />
```

```ts live example=readonly framework=angular
template: `<hw-switch label="Keep a copy of submitted requests" name="copy" [value]="true" [readOnly]="true" />`
```

### Error

A non-empty `error` renders as a paragraph after the control and the input is marked with `aria-invalid="true"`.

```html live example=error differences=switch-adapter-attributes
<div class="hw-field">
  <label class="hw-choice" for="error-terms">
    <input class="hw-switch" id="error-terms" name="terms" type="checkbox" role="switch" aria-invalid="true" aria-describedby="error-terms-error">Allow the use of my contact details for this request
  </label>
  <p class="hw-error" id="error-terms-error">Turn this setting on to submit the request.</p>
</div>
```

```tsx live example=error
<Switch label="Allow the use of my contact details for this request" name="terms" error="Turn this setting on to submit the request." />
```

```vue live example=error
<Switch label="Allow the use of my contact details for this request" name="terms" error="Turn this setting on to submit the request." />
```

```ts live example=error framework=angular
template: `<hw-switch label="Allow the use of my contact details for this request" name="terms" error="Turn this setting on to submit the request." />`
```

## API

### JavaScript

Table: Attributes of the hw-switch element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-switch'` | `true` | — |

Switch has no JavaScript controller. The markup is the API: write an element with the class `hw-field` that holds a `label` with the class `hw-choice`, and inside the label a native input with `type="checkbox"`, `role="switch"` and the class `hw-switch`, followed by the label text. Add a paragraph with the class `hw-hint` or `hw-error` after the label and associate it with the input through `aria-describedby`; no script does it. For an invalid setting write `aria-invalid="true"` on the input together with the visible `hw-error` message. `checked`, `disabled` and `required` are native attributes, and a form submits the native `value` of a checked input, `on` by default; write `value` on the input to set another one. For a read-only switch write `readonly` and `aria-disabled="true"` on the input; the guard that keeps the value unchanged is installed by `enhance()` of the vanilla package, and the stylesheet gives a read-only switch no presentation of its own.

### React

Table: Props of Switch

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `label` | `ReactNode` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |

Switch also accepts the props of a native input element, including `name`, `checked`, `defaultChecked`, `onChange`, `required`, `disabled`, `readOnly` and `ref`; they reach the input, and the ref reaches the input, not its label. Use `checked` with `onChange` for a controlled switch, or `defaultChecked` for an uncontrolled one. The label, the hint and the error are renderable React content. The hint and the error render as paragraphs after the label and are associated with the input, and a non-empty `error` sets `aria-invalid`. Switch shows no required marker, so word a requirement in `label`.

### Vue

Table: Props, events and slots of Switch

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `modelValue` | prop | `boolean \| string` | `false` | — |
| `defaultValue` | prop | `boolean \| string` | `false` | `false` |
| `value` | prop | `string` | `false` | `'on'` |
| `readonly` | prop | `boolean` | `false` | `false` |
| `indeterminate` | prop | `boolean` | `false` | `false` |
| `label` | prop | `string` | `false` | — |
| `hint` | prop | `string` | `false` | — |
| `error` | prop | `string` | `false` | — |
| `required` | prop | `boolean` | `false` | — |
| `update:modelValue` | event | `(value: boolean) => void` | `false` | — |
| `default` | slot | — | `false` | — |

`v-model` binds the boolean value, and `defaultValue` sets the initial value of an uncontrolled switch. `label`, `hint` and `error` are strings; the hint and the error render as paragraphs after the label and are associated with the input, and a non-empty `error` sets `aria-invalid`. `value` is the native value a checked switch submits. The other attributes, such as `name` and `disabled`, and the listeners reach the native input; `readonly` leaves the value unchanged while the switch stays focusable. The table lists `indeterminate` because the published declaration of Switch shares its factory with Checkbox; a switch has no mixed state and the prop has no effect on it, so leave it unset. The `default` slot is read by the published build and the declaration types no slot; it holds the label content when `label` is not given.

### Angular

Table: Inputs, outputs and content of hw-switch

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
| `value` | input | `boolean` | `false` | `false` |
| `readOnly` | input | `boolean` | `false` | `false` |
| `submitValue` | input | `string \| null` | `false` | `null` |
| `valueChange` | output | `boolean` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |
| `*` | content | — | `false` | — |

`HwSwitchComponent` (`hw-switch`) renders the field, the label, the native input, the hint and the error. Bind `[(value)]` for a two-way boolean value; the component also works as a form control through its value accessor. `readOnly` and `disabled` are boolean inputs, and `submitValue` is the native value a checked switch submits; without it the browser submits `on`. A switch needs a `label`, or projected label content, or `aria-label` or `aria-labelledby` written on `hw-switch`; these attributes are forwarded to the input and removed from the host. `controlId` sets the id of the input; the application id wins, then the id of a surrounding `hw-field`, then a generated one.

## Accessibility

Switch is a native checkbox input with `role="switch"`, so the browser provides focus, the checked state and form submission, and assistive technology announces it as a switch that is on or off. The label is a native `label` element with the class `hw-choice` that holds the input and the text, so the label text is the accessible name and a click on it toggles the switch.

- <kbd>Space</kbd> toggles the switch, as for a native checkbox; <kbd>Tab</kbd> moves focus to it and away from it.
- Keep the label the same when the state changes. A label such as "Notifications on" that turns into "Notifications off" contradicts the announced state.
- A switch shows no required marker. Word a requirement in the label, and write `required` on the input where the browser should enforce it.
- The hint and the error are associated with the input through `aria-describedby`, and a non-empty `error` sets `aria-invalid`.
- A read-only switch stays focusable and submits its value, while pointer and keyboard activation leave the value unchanged. A disabled switch is a separate native state.
- The stylesheet removes the transition of the control when the reader asks for reduced motion.

## RTL and localisation

Switch has no built-in text: the label, the hint and the error are written by the application in the language of the page. The control and its text follow the reading direction of the page, so in right-to-left text the control stands at the start of the label, on the right, and the thumb moves in the logical inline direction because the packaged styles use logical properties.

- The value is a boolean for the application.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Switch; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The [choice notes](../nic-choices.md) map the states of the supplied Platforms Code style sheet for native checkboxes and radios. They concern Switch only in two statements: the geometry of the switch is unchanged by that work, and the shared read-only guard is exposed for Switch as for Checkbox and Radio.
- Read-only handling is an adaptation: the HTML attribute alone does not stop a native checkbox, so a shared guard keeps the value unchanged while the control stays focusable; the [choice notes](../nic-choices.md) describe it.
