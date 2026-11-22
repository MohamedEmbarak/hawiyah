# Textarea

Textarea is a multiline text entry that renders a native textarea element with the Hawiyah styles and, when the application supplies them, a visible label, a hint and an error message. The value stays a string, and native textarea semantics and validation remain.

## Example

A field has a visible label that names the information requested. The hint states what to write, and it is associated with the textarea.

```html live example=basic differences=textarea-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="basic-details" id="basic-details-label">Request details</label>
  <textarea class="hw-textarea" id="basic-details" name="details" aria-describedby="basic-details-hint"></textarea>
  <p class="hw-hint" id="basic-details-hint">Describe the request in a few sentences.</p>
</div>
```

```tsx live example=basic
<Textarea label="Request details" name="details" hint="Describe the request in a few sentences." />
```

```vue live example=basic
<Textarea label="Request details" name="details" hint="Describe the request in a few sentences." />
```

```ts live example=basic framework=angular
template: `<hw-textarea label="Request details" name="details" hint="Describe the request in a few sentences." />`
```

## Variants and states

### Required

A required field shows one marker after its label and keeps the native `required` attribute, so the browser applies its own constraint validation on submission.

```html live example=required differences=textarea-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="required-reason" id="required-reason-label">Reason for the request<span class="hw-required-marker" aria-hidden="true"> *</span></label>
  <textarea class="hw-textarea" id="required-reason" name="reason" required></textarea>
</div>
```

```tsx live example=required
<Textarea label="Reason for the request" name="reason" required />
```

```vue live example=required
<Textarea label="Reason for the request" name="reason" required />
```

```ts live example=required framework=angular
template: `<hw-textarea label="Reason for the request" name="reason" [required]="true" />`
```

### Error

An error is shown in a paragraph after the control, and the textarea is marked with `aria-invalid="true"` and described by the message. The message states what is wrong and how to correct it.

```html live example=error differences=textarea-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="error-details" id="error-details-label">Request details</label>
  <textarea class="hw-textarea" id="error-details" name="details" aria-invalid="true" aria-describedby="error-details-error"></textarea>
  <p class="hw-error" id="error-details-error">Enter the details of the request.</p>
</div>
```

```tsx live example=error
<Textarea label="Request details" name="details" error="Enter the details of the request." />
```

```vue live example=error
<Textarea label="Request details" name="details" error="Enter the details of the request." />
```

```ts live example=error framework=angular
template: `<hw-textarea label="Request details" name="details" error="Enter the details of the request." />`
```

### Read only

A read-only field carries the native `readonly` attribute: it keeps its value in the form and stays in the tab order, so a reader can focus and select the text but cannot change it.

```html live example=readonly differences=textarea-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="readonly-note" id="readonly-note-label">Processing note</label>
  <textarea class="hw-textarea" id="readonly-note" name="note" readonly>The request was received and is waiting for review.</textarea>
</div>
```

```tsx live example=readonly
<Textarea label="Processing note" name="note" defaultValue="The request was received and is waiting for review." readOnly />
```

```vue live example=readonly
<Textarea label="Processing note" name="note" default-value="The request was received and is waiting for review." readonly />
```

```ts live example=readonly framework=angular
template: `<hw-textarea label="Processing note" name="note" value="The request was received and is waiting for review." [readOnly]="true" />`
```

## API

### JavaScript

Table: Attributes of the hw-textarea element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-textarea'` | `true` | — |
| `aria-invalid` | `'true'` | `false` | — |
| `readonly` | `boolean` | `false` | — |
| `data-size` | `'lg' \| 'sm'` | `false` | — |
| `data-variant` | `'filled'` | `false` | — |
| `data-hw-filled` | `'true'` | `false` | — |

Textarea has no JavaScript controller. The markup is the API: write a native `textarea` element with the class `hw-textarea` inside an element with the class `hw-field`, a `label` with the class `hw-label` whose `for` names the textarea, and, where needed, a paragraph with the class `hw-hint` or `hw-error` after it. Associate the paragraph with the textarea through `aria-describedby`; no script does it. For an invalid field write `aria-invalid="true"` on the textarea together with the visible `hw-error` message. `data-size` with `sm` or `lg` changes the height, and `data-variant="filled"` selects the filled appearance; without them the field is outline and medium. `readonly` is the native attribute. `data-hw-filled` is a state attribute that `enhance()` of the vanilla package sets to `true` or `false` on a hand-written field according to whether the textarea holds a value; write no value yourself.

### React

Table: Props of Textarea

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `label` | `ReactNode` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |

Textarea also accepts the props of a native textarea element, including `name`, `value`, `defaultValue`, `onChange`, `required`, `disabled`, `readOnly`, `rows` and `ref`; they reach the textarea, and the ref reaches the textarea, not its label. Use `value` with `onChange` for a controlled field, or `defaultValue` for an uncontrolled one. The label, the hint and the error are renderable React content. The hint and the error render as paragraphs after the textarea and are associated with it, and a non-empty `error` sets `aria-invalid`. A required field with a visible label shows one marker; do not write an asterisk into `label`. When none of `label`, `hint` and `error` is given, Textarea renders the textarea alone and needs an accessible name from `aria-label` or `aria-labelledby`, or from a surrounding `Field`. Textarea has no size or variant prop: write `data-size` or `data-variant` as a native attribute, and they reach the textarea.

### Vue

Table: Props, events and slots of Textarea

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `options` | prop | `readonly Option[]` | `false` | — |
| `modelValue` | prop | `string` | `false` | — |
| `defaultValue` | prop | `string` | `false` | — |
| `placeholder` | prop | `string` | `false` | — |
| `label` | prop | `string` | `false` | — |
| `hint` | prop | `string` | `false` | — |
| `error` | prop | `string` | `false` | — |
| `required` | prop | `boolean` | `false` | — |
| `update:modelValue` | event | `(value: string) => void` | `false` | — |
| `default` | slot | — | `false` | — |

`v-model` binds the string value, and `defaultValue` sets the initial value of an uncontrolled field. `label`, `hint` and `error` are strings; the hint and the error render as paragraphs after the textarea and are associated with it, and a non-empty `error` sets `aria-invalid`. `required` shows one marker after the label and sets the native attribute. The other attributes, such as `name`, `disabled` and `readonly`, and the listeners reach the native textarea. The component exposes `element` and `focus()` through a template ref. Textarea has no size or variant prop: write `data-size` or `data-variant` as a native attribute, and they reach the textarea. The table lists the `options` prop because the published declaration of Textarea contains it, and the `default` slot because the published build reads it; the declaration types no slot. Both are read only for a select that shares the factory of the component, so a textarea uses neither.

### Angular

Table: Inputs, outputs and content of hw-textarea

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
| `size` | input | `'sm' \| 'md' \| 'lg'` | `false` | `'md'` |
| `visualVariant` | input | `'outline' \| 'filled'` | `false` | `'outline'` |
| `rows` | input | `number \| null` | `false` | `null` |
| `placeholder` | input | `string` | `false` | `''` |
| `maxLength` | input | `number \| null` | `false` | `null` |
| `readOnly` | input | `boolean` | `false` | `false` |
| `valueChange` | output | `string` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |

`HwTextareaComponent` (`hw-textarea`) renders the field, the label, the native textarea, the hint and the error. Bind `[(value)]` for a two-way string value; the component also works as a form control through its value accessor. `size` and `visualVariant` style the native textarea. `required`, `disabled` and `readOnly` are boolean inputs, so `[required]="true"` and a bare `required` attribute both set it. `rows` is optional and its default is `null`, which writes no attribute, so the height comes from the stylesheet; write `[rows]="4"` for a fixed number of lines. `maxLength` forwards the native constraint. A field needs a `label`, or `aria-label` or `aria-labelledby` written on `hw-textarea`, or the label of a surrounding `hw-field`; these attributes are forwarded to the textarea and removed from the host. `controlId` sets the id of the textarea; the application's id wins, then the id of a surrounding `hw-field`, then a generated one.

## Accessibility

Textarea is a native textarea element, so the browser provides its role, its focus behaviour, its text editing and its keyboard handling. The label is a native `label` element whose `for` names the textarea, so the label text is the accessible name and a click on it focuses the field. The hint and the error are associated with the textarea as its description.

- `aria-invalid="true"` is set when the application passes a non-empty `error` or passes `aria-invalid`, or when a surrounding `Field` or `hw-field` has an error. Textarea does not mark itself after a failed submission.
- When the browser blocks a submission because a required field is empty, the browser focuses the field and shows its own message.
- The required marker is hidden from assistive technology; the native `required` attribute carries the requirement.
- A read-only field keeps its submitted value where HTML permits it, and stays in the tab order.
- The stylesheet gives the textarea a minimum height of 7.5 rem and a vertical resize handle, so a reader can enlarge the field; it stays multiline.

## RTL and localisation

Textarea has no built-in text: the label, the hint, the error and the placeholder are written by the application in the language of the page. The element inherits the language and the direction of the page, and the packaged styles use logical properties, so the label, the text and the paragraphs after the textarea follow the reading direction.

- Text typed into the textarea takes the direction of the page; set `dir` on the element where the content of a field is in a different direction.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Textarea; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The label size and weight, the input padding, the hover, pressed and focus states and the underline of the supplied Platforms Code style sheet are mapped for the form controls in the [input notes](../nic-inputs.md), with the confidence of each mapping.
- The validation colours of the field are an adaptation of the source, which is documented in the input notes; the [coverage notes](../coverage.md) list the control among the initial controls.
