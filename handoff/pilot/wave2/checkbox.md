# Checkbox

Checkbox is a native checkbox input wrapped in a clickable label, for one independent yes or no choice. The value is a boolean, and a checked box submits its native value with the form.

## Example

The label states the choice in words that make sense when the box is checked. The control and its text are one click target.

```html live example=basic
<div class="hw-field">
  <label class="hw-choice" for="basic-confirm">
    <input class="hw-checkbox" id="basic-confirm" name="confirm" type="checkbox">I confirm that the details in this request are correct
  </label>
</div>
```

```tsx live example=basic
<Checkbox label="I confirm that the details in this request are correct" name="confirm" />
```

```vue live example=basic
<Checkbox label="I confirm that the details in this request are correct" name="confirm" />
```

```ts live example=basic framework=angular
template: `<hw-checkbox label="I confirm that the details in this request are correct" name="confirm" />`
```

## Variants and states

### Checked

An uncontrolled checkbox starts checked through the initial value of the adapter: the `checked` attribute in vanilla, `defaultChecked` in React, `defaultValue` in Vue and `value` in Angular.

```html live example=checked
<div class="hw-field">
  <label class="hw-choice" for="checked-copy">
    <input class="hw-checkbox" id="checked-copy" name="copy" type="checkbox" checked>Send me a copy of this request by email
  </label>
</div>
```

```tsx live example=checked
<Checkbox label="Send me a copy of this request by email" name="copy" defaultChecked />
```

```vue live example=checked
<Checkbox label="Send me a copy of this request by email" name="copy" :default-value="true" />
```

```ts live example=checked framework=angular
template: `<hw-checkbox label="Send me a copy of this request by email" name="copy" [value]="true" />`
```

### Hint

A hint renders as a paragraph after the control and is associated with it as its description. Use it for information the label does not carry.

```html live example=hint
<div class="hw-field">
  <label class="hw-choice" for="hint-updates">
    <input class="hw-checkbox" id="hint-updates" name="updates" type="checkbox" aria-describedby="hint-updates-hint">Notify me when my request changes status
  </label>
  <p class="hw-hint" id="hint-updates-hint">Notifications are sent to the email address on your profile.</p>
</div>
```

```tsx live example=hint
<Checkbox label="Notify me when my request changes status" name="updates" hint="Notifications are sent to the email address on your profile." />
```

```vue live example=hint
<Checkbox label="Notify me when my request changes status" name="updates" hint="Notifications are sent to the email address on your profile." />
```

```ts live example=hint framework=angular
template: `<hw-checkbox label="Notify me when my request changes status" name="updates" hint="Notifications are sent to the email address on your profile." />`
```

### Error

A non-empty `error` renders as a paragraph after the control, and the input is marked with `aria-invalid="true"` and described by the message. The message states what to do.

```html live example=error
<div class="hw-field">
  <label class="hw-choice" for="error-declaration">
    <input class="hw-checkbox" id="error-declaration" name="declaration" type="checkbox" aria-invalid="true" aria-describedby="error-declaration-error">I have read the conditions of this service
  </label>
  <p class="hw-error" id="error-declaration-error">Select this box to submit the request.</p>
</div>
```

```tsx live example=error
<Checkbox label="I have read the conditions of this service" name="declaration" error="Select this box to submit the request." />
```

```vue live example=error
<Checkbox label="I have read the conditions of this service" name="declaration" error="Select this box to submit the request." />
```

```ts live example=error framework=angular
template: `<hw-checkbox label="I have read the conditions of this service" name="declaration" error="Select this box to submit the request." />`
```

### Disabled

A disabled checkbox uses the native `disabled` attribute: it leaves the tab order and cannot be changed.

```html live example=disabled
<div class="hw-field">
  <label class="hw-choice" for="disabled-terms">
    <input class="hw-checkbox" id="disabled-terms" name="terms" type="checkbox" disabled>Attach the previous decision to this request
  </label>
</div>
```

```tsx live example=disabled
<Checkbox label="Attach the previous decision to this request" name="terms" disabled />
```

```vue live example=disabled
<Checkbox label="Attach the previous decision to this request" name="terms" disabled />
```

```ts live example=disabled framework=angular
template: `<hw-checkbox label="Attach the previous decision to this request" name="terms" [disabled]="true" />`
```

### Read only

A read-only checkbox stays in the tab order and submits its value, while a click or <kbd>Space</kbd> leaves the value unchanged.

```html live example=readonly
<div class="hw-field">
  <label class="hw-choice" for="readonly-record">
    <input class="hw-checkbox" id="readonly-record" name="record" type="checkbox" checked readonly aria-disabled="true">Keep this request in my record
  </label>
</div>
```

```tsx live example=readonly
<Checkbox label="Keep this request in my record" name="record" defaultChecked readOnly />
```

```vue live example=readonly
<Checkbox label="Keep this request in my record" name="record" :default-value="true" readonly />
```

```ts live example=readonly framework=angular
template: `<hw-checkbox label="Keep this request in my record" name="record" [value]="true" [readOnly]="true" />`
```

## API

### JavaScript

Table: Attributes of the hw-checkbox element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-checkbox'` | `true` | — |
| `readonly` | `boolean` | `false` | — |
| `aria-disabled` | `'true'` | `false` | — |

Checkbox has no JavaScript controller. The markup is the API: write an element with the class `hw-field` that holds a `label` with the class `hw-choice`, and inside the label a native input with `type="checkbox"` and the class `hw-checkbox`, followed by the label text. Add a paragraph with the class `hw-hint` or `hw-error` after the label and associate it with the input through `aria-describedby`; no script does it. For an invalid choice write `aria-invalid="true"` on the input together with the visible `hw-error` message. `checked`, `disabled` and `required` are native attributes. For a read-only checkbox write `readonly` and `aria-disabled="true"` on the input; the guard that keeps the value unchanged is installed by `enhance()` of the vanilla package.

### React

Table: Props of Checkbox

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `indeterminate` | `boolean` | `false` | — |
| `label` | `ReactNode` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |

Checkbox also accepts the props of a native input element, including `name`, `checked`, `defaultChecked`, `onChange`, `required`, `disabled`, `readOnly` and `ref`; they reach the input, and the ref reaches the input, not its label. Use `checked` with `onChange` for a controlled checkbox, or `defaultChecked` for an uncontrolled one. `indeterminate` sets the mixed state of the native input. The label, the hint and the error are renderable React content. The hint and the error render as paragraphs after the label and are associated with the input, and a non-empty `error` sets `aria-invalid`. Checkbox shows no required marker, so word a requirement in `label`.

### Vue

Table: Props, events and slots of Checkbox

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

`v-model` binds the boolean value, and `defaultValue` sets the initial value of an uncontrolled checkbox. `indeterminate` sets the mixed state of the native input. `label`, `hint` and `error` are strings; the hint and the error render as paragraphs after the label and are associated with the input, and a non-empty `error` sets `aria-invalid`. `value` is the native value a checked box submits. The other attributes, such as `name` and `disabled`, and the listeners reach the native input; `readonly` leaves the value unchanged while the checkbox stays focusable. The `default` slot is read by the published build and the declaration types no slot; it holds the label content when `label` is not given.

### Angular

Table: Inputs, outputs and content of hw-checkbox

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
| `indeterminate` | input | `boolean` | `false` | `false` |
| `submitValue` | input | `string \| null` | `false` | `null` |
| `valueChange` | output | `boolean` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |
| `*` | content | — | `false` | — |

`HwCheckboxComponent` (`hw-checkbox`) renders the field, the label, the native input, the hint and the error. Bind `[(value)]` for a two-way boolean value; the component also works as a form control through its value accessor. `indeterminate`, `readOnly` and `disabled` are boolean inputs, and `submitValue` is the native value a checked box submits; without it the browser submits `on`. The label is `label`, else the projected content, which may hold a link. A checkbox needs a label, or `aria-label` or `aria-labelledby` written on `hw-checkbox`; these attributes are forwarded to the input and removed from the host. `controlId` sets the id of the input; the application id wins, then the id of a surrounding `hw-field`, then a generated one.

## Accessibility

Checkbox is a native input with `type="checkbox"`, so the browser provides its role, its focus behaviour, its checked state and form submission. The label is a native `label` element with the class `hw-choice` that holds the input and the text, so the label text is the accessible name and a click on it toggles the box.

- <kbd>Space</kbd> toggles the checkbox, as for a native checkbox; <kbd>Tab</kbd> moves focus to it and away from it.
- A checkbox is independent. Several related checkboxes are composed by the application inside a native `fieldset` with a `legend` that names the group; Checkbox has no group component.
- A checkbox shows no required marker. Word a requirement in the label, and write `required` on the input where the browser should enforce it.
- The hint and the error are associated with the input through `aria-describedby`, and a non-empty `error` sets `aria-invalid`.
- A read-only checkbox stays focusable and submits its value, while pointer and keyboard activation leave the value unchanged. A disabled checkbox is a separate native state.
- A mixed state is set on the native input through its `indeterminate` property. It is not an attribute, so the adapters expose it as `indeterminate`, and plain HTML has to set the property in script.
- The stylesheet removes the transition of the hover halo when the reader asks for reduced motion.

## RTL and localisation

Checkbox has no built-in text: the label, the hint and the error are written by the application in the language of the page. The control and its text follow the reading direction of the page, so in right-to-left text the box stands at the start of the label, on the right, because the box comes first in the label and the label follows the reading direction.

- The value is a boolean for the application. A form submits the native value of a checked input, `on` by default; the `value` prop of Vue and the `submitValue` input of Angular set another one.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Checkbox; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The 20px control, the hover halo, the checked and mixed marks, the disabled and read-only presentations and the focus handling of the supplied Platforms Code style sheet are mapped in the [choice notes](../nic-choices.md), with the confidence of each mapping.
- Read-only handling is an adaptation: the HTML attribute alone does not stop a native checkbox, so a shared guard keeps the value unchanged while the control stays focusable; the [choice notes](../nic-choices.md) describe it.
