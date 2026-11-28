# TextField

TextField is a single-line text entry that renders a native input element with the Hawiyah styles and, when the application supplies them, a visible label, a hint and an error message. The value stays a string, and native input semantics and validation remain.

## Example

A field has a visible label that names the information requested. The hint states the format or the purpose, and it is associated with the input.

```html live example=basic differences=text-field-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="basic-name" id="basic-name-label">Full name</label>
  <input class="hw-input" id="basic-name" name="full-name" autocomplete="name" aria-describedby="basic-name-hint">
  <p class="hw-hint" id="basic-name-hint">Write the name as it appears on your identity document.</p>
</div>
```

```tsx live example=basic
<TextField label="Full name" name="full-name" autoComplete="name" hint="Write the name as it appears on your identity document." />
```

```vue live example=basic
<TextField label="Full name" name="full-name" autocomplete="name" hint="Write the name as it appears on your identity document." />
```

```ts live example=basic framework=angular
template: `<hw-text-field label="Full name" name="full-name" autocomplete="name" hint="Write the name as it appears on your identity document." />`
```

## Variants and states

### Required

A required field shows one marker after its label and keeps the native `required` attribute, so the browser applies its own constraint validation on submission.

```html live example=required differences=text-field-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="required-mobile" id="required-mobile-label">Mobile number<span class="hw-required-marker" aria-hidden="true"> *</span></label>
  <input class="hw-input" id="required-mobile" name="mobile" type="tel" autocomplete="tel" required>
</div>
```

```tsx live example=required
<TextField label="Mobile number" name="mobile" type="tel" autoComplete="tel" required />
```

```vue live example=required
<TextField label="Mobile number" name="mobile" type="tel" autocomplete="tel" required />
```

```ts live example=required framework=angular
template: `<hw-text-field label="Mobile number" name="mobile" type="tel" autocomplete="tel" [required]="true" />`
```

### Error

An error is shown in a paragraph after the control, and the input is marked with `aria-invalid="true"` and described by the message. The message states what is wrong and how to correct it.

```html live example=error differences=text-field-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="error-email" id="error-email-label">Email address</label>
  <input class="hw-input" id="error-email" name="email" type="email" autocomplete="email" value="applicant.example.com" aria-invalid="true" aria-describedby="error-email-error">
  <p class="hw-error" id="error-email-error">Enter an email address in the form name@example.com.</p>
</div>
```

```tsx live example=error
<TextField label="Email address" name="email" type="email" autoComplete="email" defaultValue="applicant.example.com" error="Enter an email address in the form name@example.com." />
```

```vue live example=error
<TextField label="Email address" name="email" type="email" autocomplete="email" default-value="applicant.example.com" error="Enter an email address in the form name@example.com." />
```

```ts live example=error framework=angular
template: `<hw-text-field label="Email address" name="email" type="email" autocomplete="email" value="applicant.example.com" error="Enter an email address in the form name@example.com." />`
```

### Disabled

A disabled field uses the native `disabled` attribute.

```html live example=disabled differences=text-field-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="disabled-email" id="disabled-email-label">Email address</label>
  <input class="hw-input" id="disabled-email" name="email" type="email" autocomplete="email" value="applicant@example.com" disabled>
</div>
```

```tsx live example=disabled
<TextField label="Email address" name="email" type="email" autoComplete="email" defaultValue="applicant@example.com" disabled />
```

```vue live example=disabled
<TextField label="Email address" name="email" type="email" autocomplete="email" default-value="applicant@example.com" disabled />
```

```ts live example=disabled framework=angular
template: `<hw-text-field label="Email address" name="email" type="email" autocomplete="email" value="applicant@example.com" [disabled]="true" />`
```

### Read only

A read-only field keeps its value in the form and stays in the tab order, so a reader can focus and select the text but cannot change it.

```html live example=readonly differences=text-field-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="readonly-organisation" id="readonly-organisation-label">Organisation</label>
  <input class="hw-input" id="readonly-organisation" name="organisation" autocomplete="organization" value="Example Trading Company" readonly>
</div>
```

```tsx live example=readonly
<TextField label="Organisation" name="organisation" autoComplete="organization" defaultValue="Example Trading Company" readOnly />
```

```vue live example=readonly
<TextField label="Organisation" name="organisation" autocomplete="organization" default-value="Example Trading Company" readonly />
```

```ts live example=readonly framework=angular
template: `<hw-text-field label="Organisation" name="organisation" autocomplete="organization" value="Example Trading Company" [readOnly]="true" />`
```

## API

### JavaScript

Table: Attributes of the hw-input element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-input'` | `true` | — |
| `aria-invalid` | `'true'` | `false` | — |
| `readonly` | `boolean` | `false` | — |
| `type` | `'number' \| 'search'` | `false` | — |
| `data-size` | `'lg' \| 'sm'` | `false` | — |
| `data-variant` | `'filled'` | `false` | — |
| `data-hw-filled` | `'true'` | `false` | — |

TextField has no JavaScript controller. The markup is the API: write a native input element with the class `hw-input` inside an element with the class `hw-field`, a `label` with the class `hw-label` whose `for` names the input, and, where needed, a paragraph with the class `hw-hint` or `hw-error` after the input. Associate the paragraph with the input through `aria-describedby`; no script does it. For an invalid field write `aria-invalid="true"` on the input together with the visible `hw-error` message. `data-size` with `sm` or `lg` changes the height, and `data-variant="filled"` selects the filled appearance; without them the field is outline and medium. `readonly` is the native attribute. The stylesheet selects `type="number"` and `type="search"` for their own appearance; other native types need no attribute of the stylesheet. `data-hw-filled` is a state attribute that `enhance()` of the vanilla package sets to `true` or `false` on a hand-written field according to whether the input holds a value; write no value yourself.

### React

Table: Props of TextField

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `label` | `ReactNode` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |

TextField also accepts the props of a native input element, including `name`, `type`, `value`, `defaultValue`, `onChange`, `required`, `disabled`, `readOnly`, `autoComplete` and `ref`; they reach the input, and the ref reaches the input, not its label. Use `value` with `onChange` for a controlled field, or `defaultValue` for an uncontrolled one. The label, the hint and the error are renderable React content. The hint and the error render as paragraphs after the input and are associated with it, and a non-empty `error` sets `aria-invalid`. A required field with a visible label shows one marker; do not write an asterisk into `label`. When none of `label`, `hint` and `error` is given, TextField renders the input alone and needs an accessible name from `aria-label` or `aria-labelledby`, or from a surrounding `Field`. The value is a string for every input type; a native number input still reports a string, so parse it where the application uses it, or use `NumberField` for a numeric value. TextField has no size or variant prop: write `data-size` or `data-variant` as a native attribute, and they reach the input.

### Vue

Table: Props, events and slots of TextField

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

`v-model` binds the string value, and `defaultValue` sets the initial value of an uncontrolled field. The value is a string for every input type. `label`, `hint` and `error` are strings; the hint and the error render as paragraphs after the input and are associated with it, and a non-empty `error` sets `aria-invalid`. `required` shows one marker after the label and sets the native attribute. The other attributes, such as `name`, `type`, `disabled`, `readonly` and `autocomplete`, and the listeners reach the native input. The component exposes `element` and `focus()` through a template ref. TextField has no size or variant prop: write `data-size` or `data-variant` as a native attribute, and they reach the input. The table lists the `options` prop because the published declaration of TextField contains it, and the `default` slot because the published build reads it; the declaration types no slot. Both are read only for a select that shares the factory of the component, so a text input uses neither.

### Angular

Table: Inputs, outputs and content of hw-text-field

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
| `type` | input | `'text' \| 'email' \| 'password' \| 'tel' \| 'url' \| 'search' \| 'date' \| 'datetime-local' \| 'month' \| 'week' \| 'time' \| 'number' \| 'color' \| 'range'` | `false` | `'text'` |
| `placeholder` | input | `string` | `false` | `''` |
| `autocomplete` | input | `string` | `false` | `'off'` |
| `inputmode` | input | `string` | `false` | `''` |
| `min` | input | `string \| number \| null` | `false` | `null` |
| `max` | input | `string \| number \| null` | `false` | `null` |
| `step` | input | `string \| number \| null` | `false` | `null` |
| `minLength` | input | `number \| null` | `false` | `null` |
| `maxLength` | input | `number \| null` | `false` | `null` |
| `pattern` | input | `string \| null` | `false` | `null` |
| `readOnly` | input | `boolean` | `false` | `false` |
| `valueChange` | output | `string` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |

`HwTextFieldComponent` (`hw-text-field`) renders the field, the label, the native input, the hint and the error. Bind `[(value)]` for a two-way string value; the component also works as a form control through its value accessor. The component writes a value into the native input only when the model changes from outside and the input does not already show it, so text being typed is never rewritten. `size` and `visualVariant` style the native input. `required`, `disabled` and `readOnly` are boolean inputs, so `[required]="true"` and a bare `required` attribute both set it. `min`, `max`, `step`, `minLength`, `maxLength` and `pattern` forward the native constraints where the input type supports them. A field needs a `label`, or `aria-label` or `aria-labelledby` written on `hw-text-field`, or the label of a surrounding `hw-field`; these attributes are forwarded to the input and removed from the host. `controlId` sets the id of the input; the application's id wins, then the id of a surrounding `hw-field`, then a generated one. Without an `autocomplete` input the field writes `autocomplete="off"`, so write a standard token, such as `name` or `email`, where the field asks for the reader's own information.

## Accessibility

TextField is a native input element, so the browser provides its role, its focus behaviour, its text editing and its keyboard handling. The label is a native `label` element whose `for` names the input, so the label text is the accessible name and a click on it focuses the field. The hint and the error are associated with the input as its description.

- `aria-invalid="true"` is set when the application passes a non-empty `error` or passes `aria-invalid`, or when a surrounding `Field` or `hw-field` has an error. TextField does not mark itself after a failed submission.
- The stylesheet animates the field with a transition and removes it when the reader asks for reduced motion.
- When the browser blocks a submission because a required field is empty, the browser focuses the field and shows its own message.
- The required marker is hidden from assistive technology; the native `required` attribute carries the requirement.
- A read-only field keeps its submitted value where HTML permits it, and the stylesheet gives it a focus indicator.

## RTL and localisation

TextField has no built-in text: the label, the hint, the error and the placeholder are written by the application in the language of the page. The element inherits the language and the direction of the page, and the packaged styles use logical properties, so the label, the text and the paragraphs after the input follow the reading direction.

- The values of the date and time input types are machine values in the formats of HTML, independent of the display of the browser; a date input stores a Gregorian ISO date.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of TextField; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The label size and weight, the input padding, the hover, pressed and focus states and the underline of the supplied Platforms Code style sheet are mapped in the [input notes](../nic-inputs.md), with the confidence of each mapping.
- The source underline is neutral. Hawiyah keeps its own validation colours: a neutral empty optional field, a green non-empty valid field while it has focus, and a red field that is touched and invalid or has an explicit application error; this adaptation is documented in the input notes.
