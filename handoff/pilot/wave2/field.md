# Field

Field composes a visible label, an optional hint and an optional error message around one form control. It renders the wrapper, the label and the paragraphs, and gives a Hawiyah value control inside it its name and description; the application wires a native control itself.

## Example

A field names the information requested with a visible label and states its purpose in a hint. A Hawiyah value control declared inside the field takes its identifier, its accessible name from the label and its description from the hint, so it needs no `label` of its own. In the vanilla markup the application writes the same `for`, `id` and `aria-describedby` itself.

```html live example=basic
<div class="hw-field">
  <label class="hw-label" for="basic-title" id="basic-title-label">Request title</label>
  <input class="hw-input" id="basic-title" name="title" aria-describedby="basic-title-hint">
  <p class="hw-hint" id="basic-title-hint">Use a short title that identifies the request.</p>
</div>
```

```tsx live example=basic
<Field controlId="basic-title" label="Request title" hint="Use a short title that identifies the request.">
  <TextField name="title" />
</Field>
```

```vue live example=basic
<Field control-id="basic-title" label="Request title" hint="Use a short title that identifies the request.">
  <TextField name="title" />
</Field>
```

```ts live example=basic framework=angular
template: `<hw-field controlId="basic-title" label="Request title" hint="Use a short title that identifies the request."><hw-text-field name="title" /></hw-field>`
```

## Variants and states

### Required

A required field shows one marker after its label. The marker is hidden from assistive technology, so the native control carries the requirement with its own `required` attribute, which the application writes.

```html live example=required
<div class="hw-field">
  <label class="hw-label" for="required-title" id="required-title-label">Request title<span class="hw-required-marker" aria-hidden="true"> *</span></label>
  <input class="hw-input" id="required-title" name="title" required>
</div>
```

```tsx live example=required
<Field controlId="required-title" label="Request title" required>
  <input className="hw-input" id="required-title" name="title" required />
</Field>
```

```vue live example=required
<Field control-id="required-title" label="Request title" required v-slot="field">
  <input class="hw-input" :id="field.id" name="title" :required="field.required" />
</Field>
```

```ts live example=required framework=angular
template: `<hw-field #f controlId="required-title" label="Request title" [required]="true"><input class="hw-input" [id]="f.controlId" name="title" [required]="f.required"></hw-field>`
```

### Error

An error is shown in a paragraph after the control. The native control is marked with `aria-invalid="true"` by the application and described by the message, which states what is wrong and how to correct it.

```html live example=error
<div class="hw-field">
  <label class="hw-label" for="error-title" id="error-title-label">Request title</label>
  <input class="hw-input" id="error-title" name="title" aria-invalid="true" aria-describedby="error-title-error">
  <p class="hw-error" id="error-title-error">Enter a title for the request.</p>
</div>
```

```tsx live example=error
<Field controlId="error-title" label="Request title" error="Enter a title for the request.">
  <input className="hw-input" id="error-title" name="title" aria-invalid="true" aria-describedby="error-title-error" />
</Field>
```

```vue live example=error
<Field control-id="error-title" label="Request title" error="Enter a title for the request." v-slot="field">
  <input class="hw-input" :id="field.id" name="title" :aria-invalid="field.invalid ? 'true' : undefined" :aria-describedby="field.describedby" />
</Field>
```

```ts live example=error framework=angular
template: `<hw-field #f controlId="error-title" label="Request title" error="Enter a title for the request."><input class="hw-input" [id]="f.controlId" name="title" [attr.aria-invalid]="f.invalid ? 'true' : null" [attr.aria-describedby]="f.descriptionIds"></hw-field>`
```

## API

### JavaScript

Table: Attributes of the hw-field, hw-label, hw-hint and hw-error elements

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-field' \| 'hw-label' \| 'hw-hint' \| 'hw-error'` | `true` | — |
| `role` | `'status'` | `false` | — |

Field has no JavaScript controller. The markup is the API: write an element with the class `hw-field` that holds a `label` with the class `hw-label` whose `for` names the control, the control, and, where needed, a paragraph with the class `hw-hint` or `hw-error` after it. Give the hint and error paragraphs an `id` and write `aria-describedby` on the control yourself; no script does it. The `id` on the label in the examples mirrors the one the adapters render, and nothing references it. For an invalid control write `aria-invalid="true"` together with the visible `hw-error` paragraph.

### React

Table: Props of Field

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `controlId` | `string` | `false` | — |
| `required` | `boolean` | `false` | — |
| `errorRole` | `'alert'` | `false` | — |
| `label` | `ReactNode` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |

`label`, `hint` and `error` are renderable React content; the hint and the error render as paragraphs after the control. `required` shows one marker after the label and is inherited by a Hawiyah value control inside the field. `controlId` sets the identifier that the label and the control share; without it an identifier is generated. A Hawiyah value control takes the identifier, the description and the invalid state from the field; a native control receives only the `for` of the label, so write the same value in its `id` and write its `aria-describedby` and `aria-invalid` yourself. `errorRole` with the value `alert` sets that role on the error paragraph. Field accepts the native attributes of its `div` element, such as `className`, and associates one control.

### Vue

Table: Props, events and slots of Field

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `controlId` | prop | `string` | `false` | — |
| `label` | prop | `string` | `false` | — |
| `hint` | prop | `string` | `false` | — |
| `error` | prop | `string` | `false` | — |
| `required` | prop | `boolean` | `false` | — |
| `default` | slot | — | `false` | — |

`label`, `hint` and `error` are strings; the hint and the error render as paragraphs after the control. `required` shows one marker after the label and is inherited by a Hawiyah value control inside the field. `controlId` sets the identifier that the label and the control share; without it an identifier is generated. The `default` slot holds the control and receives the identifiers of the field as its scope, for a native control. The published declaration types no slot.

### Angular

Table: Inputs, outputs and content of hw-field

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `controlId` | input | `string` | `false` | — |
| `label` | input | `string` | `false` | `''` |
| `hint` | input | `string` | `false` | `''` |
| `error` | input | `string` | `false` | `''` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `required` | input | `boolean` | `false` | `false` |
| `*` | content | — | `false` | — |

`HwFieldComponent` (`hw-field`) renders the wrapper, the label, the projected control, the hint and the error. `label`, `hint` and `error` are strings, and `required` is a boolean input, so `[required]="true"` and a bare `required` attribute both set it. `controlId` sets the identifier that the label and the control share; without it an identifier is generated, so its default is an em dash. `aria-describedby` adds the identifiers of the application to those of the hint and the error. The attributes `aria-label`, `aria-labelledby`, `aria-describedby` and `aria-invalid` written on `hw-field` are removed from the host element. The projected content is the control, such as `hw-text-field`.

## Accessibility

Field provides no role of its own. The label is a native `label` element whose `for` names the control, so its text is the accessible name of the control and a click on it focuses the control. The hint and the error are associated with the control as its description.

- A Hawiyah value control declared inside `Field` in React or Vue, or inside `hw-field` in Angular, takes the identifier, the label and the description of the field and needs no `label` of its own. A native control takes them from the identifiers the field hands over, as the examples show: the scoped slot in Vue and the template reference in Angular, where `descriptionIds`, `invalid` and `required` are read from the field. In React a native control receives only the `for` of the label: it repeats the `controlId` as its `id` and carries its own `aria-describedby` and `aria-invalid`.
- A non-empty `error` marks a Hawiyah value control inside the field with `aria-invalid="true"`. A native control is not marked by the field: write `aria-invalid` on it yourself, reading `invalid` from the scope of the slot in Vue and from the template reference in Angular. The field does not mark a control after a failed submission.
- The required marker is hidden from assistive technology; the native `required` attribute of the control carries the requirement.
- In React, the error paragraph has no role unless `errorRole` is `alert`, which gives it `role="alert"` so that a message that appears after a submission is announced.
- A field names one control. Group related controls with a native `fieldset` and `legend`, not with several fields.

## RTL and localisation

Field has no built-in text: the label, the hint and the error are written by the application in the language of the page. The element inherits the language and the direction of the page, and the packaged styles use logical properties, so the label, the control and the paragraphs follow the reading direction.

- The label, the hint and the error may differ in language from the page; set `lang` and `dir` on the field or on the paragraph that differs.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Field; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The label size and weight are mapped in the [input notes](../nic-inputs.md), with the confidence of the mapping; the same notes describe the validation colours as a deliberate adaptation without a confidence.
- The hint and error typography is mapped in the [select and field notes](../nic-select.md), with the confidence of each mapping.
- The [coverage notes](../coverage.md) list Field among the initial controls and name the combination of Field and a native input for the input types that have no Hawiyah control of their own.
