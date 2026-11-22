# Select

Select is a native select element with the Hawiyah styles and, when the application supplies them, a visible label, a hint, an error message and an empty first option that prompts the reader. The value stays a string, and the platform keeps the menu, the keyboard selection and the form submission.

## Example

A select has a visible label that names the information requested. The `placeholder` renders as an empty first option, so the reader chooses a value instead of submitting the first one by accident.

```html live example=basic differences=select-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="basic-type" id="basic-type-label">Type of request</label>
  <select class="hw-select" id="basic-type" name="type">
    <option value="">Select a type</option>
    <option value="new">New application</option>
    <option value="renewal">Renewal</option>
    <option value="replacement">Replacement</option>
  </select>
</div>
```

```tsx live example=basic
<Select
  label="Type of request"
  name="type"
  placeholder="Select a type"
  options={[
    { value: 'new', label: 'New application' },
    { value: 'renewal', label: 'Renewal' },
    { value: 'replacement', label: 'Replacement' },
  ]}
/>
```

```vue live example=basic
<Select
  label="Type of request"
  name="type"
  placeholder="Select a type"
  :options="[
    { value: 'new', label: 'New application' },
    { value: 'renewal', label: 'Renewal' },
    { value: 'replacement', label: 'Replacement' },
  ]"
/>
```

```ts live example=basic framework=angular
template: `<hw-select
  label="Type of request"
  name="type"
  placeholder="Select a type"
  [options]="[
    { value: 'new', label: 'New application' },
    { value: 'renewal', label: 'Renewal' },
    { value: 'replacement', label: 'Replacement' },
  ]"
/>`
```

## Variants and states

### Selected value

An uncontrolled select starts on the option whose value is the initial value of the adapter: `defaultValue` in React and Vue, `value` in Angular.

```html live example=selected differences=select-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="selected-channel" id="selected-channel-label">Preferred contact channel</label>
  <select class="hw-select" id="selected-channel" name="channel">
    <option value="email" selected>Email</option>
    <option value="phone">Telephone</option>
    <option value="post">Post</option>
  </select>
</div>
```

```tsx live example=selected
<Select
  label="Preferred contact channel"
  name="channel"
  defaultValue="email"
  options={[
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Telephone' },
    { value: 'post', label: 'Post' },
  ]}
/>
```

```vue live example=selected
<Select
  label="Preferred contact channel"
  name="channel"
  default-value="email"
  :options="[
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Telephone' },
    { value: 'post', label: 'Post' },
  ]"
/>
```

```ts live example=selected framework=angular
template: `<hw-select
  label="Preferred contact channel"
  name="channel"
  value="email"
  [options]="[
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Telephone' },
    { value: 'post', label: 'Post' },
  ]"
/>`
```

### Hint

A hint renders as a paragraph after the control and is associated with it as its description.

```html live example=hint differences=select-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="hint-language" id="hint-language-label">Language of the response</label>
  <select class="hw-select" id="hint-language" name="language" aria-describedby="hint-language-hint">
    <option value="ar">Arabic</option>
    <option value="en">English</option>
  </select>
  <p class="hw-hint" id="hint-language-hint">The response is written in the language you choose.</p>
</div>
```

```tsx live example=hint
<Select
  label="Language of the response"
  name="language"
  hint="The response is written in the language you choose."
  options={[
    { value: 'ar', label: 'Arabic' },
    { value: 'en', label: 'English' },
  ]}
/>
```

```vue live example=hint
<Select
  label="Language of the response"
  name="language"
  hint="The response is written in the language you choose."
  :options="[
    { value: 'ar', label: 'Arabic' },
    { value: 'en', label: 'English' },
  ]"
/>
```

```ts live example=hint framework=angular
template: `<hw-select
  label="Language of the response"
  name="language"
  hint="The response is written in the language you choose."
  [options]="[
    { value: 'ar', label: 'Arabic' },
    { value: 'en', label: 'English' },
  ]"
/>`
```

### Required

A required select shows one marker after its label and keeps the native `required` attribute. With a `placeholder`, the empty first option is the value that the browser rejects on submission.

```html live example=required differences=select-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="required-category" id="required-category-label">Category of document<span class="hw-required-marker" aria-hidden="true"> *</span></label>
  <select class="hw-select" id="required-category" name="category" required>
    <option value="">Select a category</option>
    <option value="identity">Identity document</option>
    <option value="certificate">Certificate</option>
  </select>
</div>
```

```tsx live example=required
<Select
  label="Category of document"
  name="category"
  placeholder="Select a category"
  required
  options={[
    { value: 'identity', label: 'Identity document' },
    { value: 'certificate', label: 'Certificate' },
  ]}
/>
```

```vue live example=required
<Select
  label="Category of document"
  name="category"
  placeholder="Select a category"
  required
  :options="[
    { value: 'identity', label: 'Identity document' },
    { value: 'certificate', label: 'Certificate' },
  ]"
/>
```

```ts live example=required framework=angular
template: `<hw-select
  label="Category of document"
  name="category"
  placeholder="Select a category"
  [required]="true"
  [options]="[
    { value: 'identity', label: 'Identity document' },
    { value: 'certificate', label: 'Certificate' },
  ]"
/>`
```

### Error

An error is shown in a paragraph after the control, and the select is marked with `aria-invalid="true"` and described by the message. The message states what is wrong and how to correct it.

```html live example=error differences=select-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="error-type" id="error-type-label">Type of request</label>
  <select class="hw-select" id="error-type" name="type" aria-invalid="true" aria-describedby="error-type-error">
    <option value="">Select a type</option>
    <option value="new">New application</option>
    <option value="renewal">Renewal</option>
  </select>
  <p class="hw-error" id="error-type-error">Select the type of request.</p>
</div>
```

```tsx live example=error
<Select
  label="Type of request"
  name="type"
  placeholder="Select a type"
  error="Select the type of request."
  options={[
    { value: 'new', label: 'New application' },
    { value: 'renewal', label: 'Renewal' },
  ]}
/>
```

```vue live example=error
<Select
  label="Type of request"
  name="type"
  placeholder="Select a type"
  error="Select the type of request."
  :options="[
    { value: 'new', label: 'New application' },
    { value: 'renewal', label: 'Renewal' },
  ]"
/>
```

```ts live example=error framework=angular
template: `<hw-select
  label="Type of request"
  name="type"
  placeholder="Select a type"
  error="Select the type of request."
  [options]="[
    { value: 'new', label: 'New application' },
    { value: 'renewal', label: 'Renewal' },
  ]"
/>`
```

### Disabled

A disabled select uses the native `disabled` attribute.

```html live example=disabled differences=select-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="disabled-type" id="disabled-type-label">Type of request</label>
  <select class="hw-select" id="disabled-type" name="type" disabled>
    <option value="renewal" selected>Renewal</option>
    <option value="new">New application</option>
  </select>
</div>
```

```tsx live example=disabled
<Select
  label="Type of request"
  name="type"
  defaultValue="renewal"
  disabled
  options={[
    { value: 'renewal', label: 'Renewal' },
    { value: 'new', label: 'New application' },
  ]}
/>
```

```vue live example=disabled
<Select
  label="Type of request"
  name="type"
  default-value="renewal"
  disabled
  :options="[
    { value: 'renewal', label: 'Renewal' },
    { value: 'new', label: 'New application' },
  ]"
/>
```

```ts live example=disabled framework=angular
template: `<hw-select
  label="Type of request"
  name="type"
  value="renewal"
  [disabled]="true"
  [options]="[
    { value: 'renewal', label: 'Renewal' },
    { value: 'new', label: 'New application' },
  ]"
/>`
```

## API

### JavaScript

Table: Attributes of the hw-select element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-select'` | `true` | — |
| `aria-invalid` | `'true'` | `false` | — |
| `readonly` | `boolean` | `false` | — |
| `data-size` | `'lg' \| 'sm'` | `false` | — |
| `data-variant` | `'filled'` | `false` | — |
| `data-hw-filled` | `'true'` | `false` | — |
| `multiple` | `boolean` | `false` | — |
| `size` | `'0' \| '1'` | `false` | — |

Select has no JavaScript controller. The markup is the API: write a native `select` element with the class `hw-select` inside an element with the class `hw-field`, a `label` with the class `hw-label` whose `for` names the select, and, where needed, a paragraph with the class `hw-hint` or `hw-error` after the select. Associate the paragraph with the select through `aria-describedby`; no script does it. For an invalid field write `aria-invalid="true"` on the select together with the visible `hw-error` message. `data-size` with `sm` or `lg` changes the height, and `data-variant="filled"` selects the filled appearance; without them the field is outline and medium. `multiple` or a `size` larger than `1` selects the native list box; without `multiple`, a `size` that is absent, `0` or `1` keeps the drop-down chevron. `readonly` is a stylesheet state only: it removes the hover, focus and pressed line, and HTML gives a select no read-only state, so the value can still be changed. `data-hw-filled` is a state attribute that `enhance()` of the vanilla package sets to `true` or `false` on a hand-written field according to whether the select holds a value; write no value yourself.

### React

Table: Props of Select

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `options` | `readonly Option[]` | `false` | — |
| `placeholder` | `string` | `false` | — |
| `label` | `ReactNode` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |

Select also accepts the props of a native select element, including `name`, `value`, `defaultValue`, `onChange`, `required`, `disabled`, `multiple` and `ref`; they reach the select, and the ref reaches the select, not its label. Use `value` with `onChange` for a controlled select, or `defaultValue` for an uncontrolled one. `options` is a list of entries with a `value`, a `label` and an optional `disabled`; the native `option` and `optgroup` elements may be written as children as well, and they follow the entries. `placeholder` renders an empty first option; none is rendered without `placeholder`, or when a child or an entry of `options` is already an empty option, or with `multiple`. The label, the hint and the error are renderable React content. The hint and the error render as paragraphs after the select and are associated with it, and a non-empty `error` sets `aria-invalid`. A required select with a visible label shows one marker; do not write an asterisk into `label`. Select has no size or variant prop: write `data-size` or `data-variant` as a native attribute, and they reach the select.

### Vue

Table: Props, events and slots of Select

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

`v-model` binds the string value, and `defaultValue` sets the initial value of an uncontrolled select; give the initial value with `defaultValue`, not with a selected attribute on a slotted option. `options` is a list of entries with a `value`, a `label` and an optional `disabled`; native `option` and `optgroup` elements in the `default` slot follow them. `placeholder` renders an empty first option; none is rendered when an entry or a slotted option is already empty, or with `multiple`. `label`, `hint` and `error` are strings; the hint and the error render as paragraphs after the select and are associated with it, and a non-empty `error` sets `aria-invalid`. `required` shows one marker after the label and sets the native attribute. The other attributes, such as `name` and `disabled`, and the listeners reach the native select. The `default` slot is read by the published build, and the declaration types no slot. Select has no size or variant prop: write `data-size` or `data-variant` as a native attribute, and they reach the select.

### Angular

Table: Inputs, outputs and content of hw-select

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
| `options` | input | `readonly Option[]` | `false` | `[]` |
| `placeholder` | input | `string` | `false` | `''` |
| `valueChange` | output | `string` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |
| `*` | content | — | `false` | — |

`HwSelectComponent` (`hw-select`) renders the field, the label, the native select, the hint and the error. Bind `[(value)]` for a two-way string value; the component also works as a form control through its value accessor. `options` is a list of entries with a `value`, a `label` and an optional `disabled`; projected `option` and `optgroup` elements follow them, and a bound value selects a projected option also when it is rendered later. `placeholder` renders an empty first option; without it none is rendered, so with a projected empty option leave `placeholder` unset. `size` and `visualVariant` style the native select. `required` and `disabled` are boolean inputs, so `[required]="true"` and a bare `required` attribute both set it. A select needs a `label`, or `aria-label` or `aria-labelledby` written on `hw-select`, or the label of a surrounding `hw-field`; these attributes are forwarded to the select and removed from the host. `multiple` is not supported; use `hw-multi-select`, or a native select with the class `hw-select`. `controlId` sets the id of the select; the application id wins, then the id of a surrounding `hw-field`, then a generated one.

## Accessibility

Select is a native `select` element, so the browser provides its role, its focus behaviour, its menu, its keyboard selection and form submission. The label is a native `label` element whose `for` names the select, so the label text is the accessible name and a click on it focuses the control. The hint and the error are associated with the select as its description.

- <kbd>Space</kbd> or <kbd>Enter</kbd> opens the native menu on most platforms, and the arrow keys change the choice. The platform defines these keys, not Hawiyah.
- `aria-invalid="true"` is set when the application passes a non-empty `error` or passes `aria-invalid`, or when a surrounding `Field` or `hw-field` has an error.
- The `placeholder` renders as an empty first option and no more. A required select with a `placeholder` is invalid until the reader chooses another option, because the browser treats the empty value as missing.
- The required marker is hidden from assistive technology; the native `required` attribute carries the requirement.
- The stylesheet draws a chevron that turns when the control has focus, and it uses the platform appearance for a list box, for `multiple` and in forced colours.
- Use Combobox when the reader needs to type to search; Select offers a native list only.

## RTL and localisation

Select has no built-in text: the label, the hint, the error, the placeholder and the text of each option are written by the application in the language of the page. The element inherits the language and the direction of the page, and the packaged styles switch the position of the chevron and the end padding by direction, so both stand at the end of the line in both directions.

- The value of an option is a string that the application defines; the visible label is translated and the value is not.
- The popup menu is drawn by the browser and the operating system, and follows their own direction rules.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Select; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The closed select geometry, the chevron that reverses on focus, the end padding that follows the writing direction and the sizes of the hint and error text are mapped in the [select notes](../nic-select.md), with the confidence of each mapping.
- The hint size is an adaptation: Hawiyah uses 12px, the smallest step of its type scale, instead of the source 10px; the [select notes](../nic-select.md) describe it, together with the chevron drawing that replaced the first one.
