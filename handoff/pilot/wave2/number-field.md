# NumberField

NumberField is a numeric entry that renders a native number input with the Hawiyah styles and, when the application supplies them, a visible label, a hint and an error message. It keeps the native `min`, `max` and `step` constraints, and an empty input stays empty instead of becoming zero.

## Example

A field has a visible label that names the quantity requested. The hint states the permitted range, and the native `min` and `max` constraints bound the stepping and block a submission outside the range.

```html live example=basic
<div class="hw-field">
  <label class="hw-label" for="basic-copies" id="basic-copies-label">Number of copies</label>
  <input class="hw-input hw-number-field" id="basic-copies" name="copies" type="number" min="1" max="10" aria-describedby="basic-copies-hint">
  <p class="hw-hint" id="basic-copies-hint">Enter a number from 1 to 10.</p>
</div>
```

```tsx live example=basic
<NumberField label="Number of copies" name="copies" min={1} max={10} hint="Enter a number from 1 to 10." />
```

```vue live example=basic
<NumberField label="Number of copies" name="copies" :min="1" :max="10" hint="Enter a number from 1 to 10." />
```

```ts live example=basic framework=angular
template: `<hw-number-field label="Number of copies" name="copies" [min]="1" [max]="10" hint="Enter a number from 1 to 10." />`
```

## Variants and states

### Required

A required field shows one marker after its label and keeps the native `required` attribute, so the browser applies its own constraint validation on submission.

```html live example=required
<div class="hw-field">
  <label class="hw-label" for="required-copies" id="required-copies-label">Number of copies<span class="hw-required-marker" aria-hidden="true"> *</span></label>
  <input class="hw-input hw-number-field" id="required-copies" name="copies" type="number" required>
</div>
```

```tsx live example=required
<NumberField label="Number of copies" name="copies" required />
```

```vue live example=required
<NumberField label="Number of copies" name="copies" required />
```

```ts live example=required framework=angular
template: `<hw-number-field label="Number of copies" name="copies" [required]="true" />`
```

### Error

An error is shown in a paragraph after the control, and the input is marked with `aria-invalid="true"` and described by the message. The message states what is wrong and how to correct it.

```html live example=error
<div class="hw-field">
  <label class="hw-label" for="error-copies" id="error-copies-label">Number of copies</label>
  <input class="hw-input hw-number-field" id="error-copies" name="copies" type="number" min="1" max="10" value="12" aria-invalid="true" aria-describedby="error-copies-error">
  <p class="hw-error" id="error-copies-error">Enter a number from 1 to 10.</p>
</div>
```

```tsx live example=error
<NumberField label="Number of copies" name="copies" min={1} max={10} defaultValue={12} error="Enter a number from 1 to 10." />
```

```vue live example=error
<NumberField label="Number of copies" name="copies" :min="1" :max="10" :default-value="12" error="Enter a number from 1 to 10." />
```

```ts live example=error framework=angular
template: `<hw-number-field label="Number of copies" name="copies" [min]="1" [max]="10" [value]="12" error="Enter a number from 1 to 10." />`
```

### Read only

A read-only field carries the native `readonly` attribute: it keeps its value in the form and stays in the tab order, so a reader can focus and select the value but cannot change it.

```html live example=readonly
<div class="hw-field">
  <label class="hw-label" for="readonly-copies" id="readonly-copies-label">Number of copies issued</label>
  <input class="hw-input hw-number-field" id="readonly-copies" name="copies" type="number" value="2" readonly>
</div>
```

```tsx live example=readonly
<NumberField label="Number of copies issued" name="copies" defaultValue={2} readOnly />
```

```vue live example=readonly
<NumberField label="Number of copies issued" name="copies" :default-value="2" readonly />
```

```ts live example=readonly framework=angular
template: `<hw-number-field label="Number of copies issued" name="copies" [value]="2" [readOnly]="true" />`
```

## API

### JavaScript

Table: Attributes of the hw-number-field element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-number-field'` | `true` | — |

> [!NOTE]
> These classes and attributes are read from the published stylesheet and are outside the stable contract of 0.3.0.

NumberField has no JavaScript controller. The markup is the API: write a native input element with `type="number"` and the classes `hw-input` and `hw-number-field` inside an element with the class `hw-field`, a `label` with the class `hw-label` whose `for` names the input, and, where needed, a paragraph with the class `hw-hint` or `hw-error` after it. The class `hw-number-field` gives the digits of the input a tabular figure width. Associate the paragraph with the input through `aria-describedby`; no script does it. Write the native `min`, `max`, `step`, `required` and `readonly` attributes on the input, and `aria-invalid="true"` together with the visible `hw-error` message for an invalid value.

### React

Table: Props of NumberField

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `label` | `ReactNode` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |

NumberField renders TextField with `type="number"` and the class `hw-number-field`, so it accepts the props of a native input element, including `name`, `value`, `defaultValue`, `onChange`, `min`, `max`, `step`, `required`, `disabled`, `readOnly` and `ref`; they reach the input. The label, the hint and the error are renderable React content. The hint and the error render as paragraphs after the input and are associated with it, and a non-empty `error` sets `aria-invalid`. A required field with a visible label shows one marker; do not write an asterisk into `label`. An empty input remains empty and is not coerced to zero. A native number input still reports its value as a string in `onChange`, so parse it where the application uses it.

### Vue

Table: Props, events and slots of NumberField

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `modelValue` | prop | `number \| ''` | `false` | — |
| `defaultValue` | prop | `number \| ''` | `false` | `''` |
| `disabled` | prop | `boolean` | `false` | `false` |
| `readonly` | prop | `boolean` | `false` | `false` |
| `label` | prop | `string` | `false` | — |
| `hint` | prop | `string` | `false` | — |
| `error` | prop | `string` | `false` | — |
| `required` | prop | `boolean` | `false` | — |
| `update:modelValue` | event | `(value: number \| '') => void` | `false` | — |

`v-model` binds the value, which is a number or the empty string `''`; clearing the input emits `''` and does not invent zero. `defaultValue` sets the initial value of an uncontrolled field. `label`, `hint` and `error` are strings; the hint and the error render as paragraphs after the input and are associated with it, and a non-empty `error` sets `aria-invalid`. `required` shows one marker after the label and sets the native attribute. `disabled` and `readonly` are Boolean props. The other attributes, such as `name`, `min`, `max` and `step`, and the listeners reach the native input. The component exposes `element` and `focus()` through a template ref. The published declaration types no slot, and NumberField reads none.

### Angular

Table: Inputs, outputs and content of hw-number-field

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
| `value` | input | `number \| null` | `false` | `null` |
| `readOnly` | input | `boolean` | `false` | `false` |
| `min` | input | `number \| null` | `false` | `null` |
| `max` | input | `number \| null` | `false` | `null` |
| `step` | input | `number \| 'any'` | `false` | `1` |
| `valueChange` | output | `null \| number` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |

`HwNumberFieldComponent` (`hw-number-field`) renders the field, the label, the native number input, the hint and the error. Bind `[(value)]` for a two-way value of type `number | null`; the component also works as a form control through its value accessor. An empty or invalid native input maps to `null`, and text that is not yet a number emits `null` and stays in the input. `min` and `max` are numbers or `null`, and `step` is a number or `'any'`; the native validation stays active. `required`, `disabled` and `readOnly` are boolean inputs, so `[required]="true"` and a bare `required` attribute both set it. A field needs a `label`, or `aria-label` or `aria-labelledby` written on `hw-number-field`, or the label of a surrounding `hw-field`; these attributes are forwarded to the input and removed from the host. `controlId` sets the id of the input; the application's id wins, then the id of a surrounding `hw-field`, then a generated one.

## Accessibility

NumberField is a native number input, so the browser provides its role, its focus behaviour, its text editing and its keyboard handling, including the native stepping with the arrow keys where the browser offers it. The label is a native `label` element whose `for` names the input, so the label text is the accessible name and a click on it focuses the field. The hint and the error are associated with the input as its description.

- `aria-invalid="true"` is set when the application passes a non-empty `error` or passes `aria-invalid`, or when a surrounding `Field` or `hw-field` has an error. NumberField does not mark itself after a failed submission.
- When the browser blocks a submission because a required field is empty, or a value is outside `min`, `max` or `step`, the browser focuses the field and shows its own message.
- The required marker is hidden from assistive technology; the native `required` attribute carries the requirement.
- A read-only field keeps its submitted value where HTML permits it, and stays in the tab order.
- Use a text input, not NumberField, for identifiers, IBANs and other values whose exact string representation must be preserved.

## RTL and localisation

NumberField has no built-in text: the label, the hint and the error are written by the application in the language of the page. The element inherits the language and the direction of the page, and the packaged styles use logical properties, so the label and the paragraphs after the input follow the reading direction.

- The value of a native number input is a machine value with Latin digits and a full stop as the decimal separator; the display of the digits and the separator in the input follows the browser and its locale. The vanilla markup, the `value` and `defaultValue` that a React application writes, the Vue model and the Angular `value` (a `number | null`) carry the number itself, not a formatted string.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of NumberField; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The label size and weight, the input padding, the hover, pressed and focus states and the underline of the supplied Platforms Code style sheet are mapped for the form controls in the [input notes](../nic-inputs.md), with the confidence of each mapping.
- The validation colours of the field are an adaptation of the source, which is documented in the input notes; the [coverage notes](../coverage.md) list NumberField among the additional controls and its numeric input type.
