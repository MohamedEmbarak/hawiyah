# ToggleGroup

ToggleGroup is a group of choices shown as joined segments. By default it selects one option with native radio inputs, and with `multiple` it shows buttons that are pressed or not and submits each pressed value.

## Example

A group has a visible legend that names the choice. In the default single mode each option is a native radio input inside a label, so at most one option is selected, and the group submits that option's value under its name.

```html live example=basic static differences=toggle-group-adapter-markup
<fieldset class="hw-toggle-group" data-hw="toggle-group" aria-describedby="basic-contact-hint">
  <legend class="hw-label">Preferred contact method</legend>
  <label><input type="radio" name="basic-contact" value="email" checked>Email</label>
  <label><input type="radio" name="basic-contact" value="phone">Phone</label>
  <label><input type="radio" name="basic-contact" value="post">Post</label>
  <p class="hw-hint" id="basic-contact-hint">Choose how the office replies to the request.</p>
</fieldset>
```

```tsx live example=basic
<ToggleGroup label="Preferred contact method" name="basic-contact" defaultValue="email" options={[{ value: 'email', label: 'Email' }, { value: 'phone', label: 'Phone' }, { value: 'post', label: 'Post' }]} hint="Choose how the office replies to the request." />
```

```vue live example=basic
<ToggleGroup label="Preferred contact method" name="basic-contact" default-value="email" :options="[{ value: 'email', label: 'Email' }, { value: 'phone', label: 'Phone' }, { value: 'post', label: 'Post' }]" hint="Choose how the office replies to the request." />
```

```ts live example=basic framework=angular
template: `<hw-toggle-group label="Preferred contact method" name="basic-contact" value="email" [options]="[{ value: 'email', label: 'Email' }, { value: 'phone', label: 'Phone' }, { value: 'post', label: 'Post' }]" hint="Choose how the office replies to the request." />`
```

## Variants and states

### Multiple

With `multiple` each option is a button with `aria-pressed`, and the value is an array of the pressed option values. A form receives one entry for each pressed value under the name of the group.

```html live example=multiple static differences=toggle-group-adapter-markup
<fieldset class="hw-toggle-group" data-hw="toggle-group" data-hw-multiple="true" data-hw-name="notices">
  <legend class="hw-label">Notifications</legend>
  <button class="hw-button" type="button" data-variant="secondary" data-size="md" data-hw-value="status" aria-pressed="true">Status changes</button>
  <button class="hw-button" type="button" data-variant="secondary" data-size="md" data-hw-value="documents" aria-pressed="false">Document requests</button>
  <button class="hw-button" type="button" data-variant="secondary" data-size="md" data-hw-value="reminders" aria-pressed="false">Reminders</button>
</fieldset>
```

```tsx live example=multiple
<ToggleGroup label="Notifications" name="notices" multiple defaultValue={['status']} options={[{ value: 'status', label: 'Status changes' }, { value: 'documents', label: 'Document requests' }, { value: 'reminders', label: 'Reminders' }]} />
```

```vue live example=multiple
<ToggleGroup label="Notifications" name="notices" multiple :default-value="['status']" :options="[{ value: 'status', label: 'Status changes' }, { value: 'documents', label: 'Document requests' }, { value: 'reminders', label: 'Reminders' }]" />
```

```ts live example=multiple framework=angular
template: `<hw-toggle-group label="Notifications" name="notices" [multiple]="true" [value]="['status']" [options]="[{ value: 'status', label: 'Status changes' }, { value: 'documents', label: 'Document requests' }, { value: 'reminders', label: 'Reminders' }]" />`
```

### Outline

Without a variant the group shows its options as joined segments. `variant="outline"` selects the outline appearance, and in markup `data-variant="outline"` on the root does the same.

```html live example=outline static differences=toggle-group-adapter-markup
<fieldset class="hw-toggle-group" data-hw="toggle-group" data-variant="outline">
  <legend class="hw-label">Preferred contact method</legend>
  <label><input type="radio" name="outline-contact" value="email">Email</label>
  <label><input type="radio" name="outline-contact" value="phone" checked>Phone</label>
  <label><input type="radio" name="outline-contact" value="post">Post</label>
</fieldset>
```

```tsx live example=outline
<ToggleGroup label="Preferred contact method" name="outline-contact" defaultValue="phone" options={[{ value: 'email', label: 'Email' }, { value: 'phone', label: 'Phone' }, { value: 'post', label: 'Post' }]} variant="outline" />
```

```vue live example=outline
<ToggleGroup label="Preferred contact method" name="outline-contact" default-value="phone" :options="[{ value: 'email', label: 'Email' }, { value: 'phone', label: 'Phone' }, { value: 'post', label: 'Post' }]" variant="outline" />
```

```ts live example=outline framework=angular
template: `<hw-toggle-group label="Preferred contact method" name="outline-contact" value="phone" [options]="[{ value: 'email', label: 'Email' }, { value: 'phone', label: 'Phone' }, { value: 'post', label: 'Post' }]" variant="outline" />`
```

### Read only

A read-only group keeps its options focusable and its selected value in the form, but the reader cannot change the selection.

```html live example=readonly static differences=toggle-group-adapter-markup
<fieldset class="hw-toggle-group" data-hw="toggle-group" data-hw-readonly="true">
  <legend class="hw-label">Preferred contact method</legend>
  <label><input type="radio" name="readonly-contact" value="email">Email</label>
  <label><input type="radio" name="readonly-contact" value="phone">Phone</label>
  <label><input type="radio" name="readonly-contact" value="post" checked>Post</label>
</fieldset>
```

```tsx live example=readonly
<ToggleGroup label="Preferred contact method" name="readonly-contact" defaultValue="post" options={[{ value: 'email', label: 'Email' }, { value: 'phone', label: 'Phone' }, { value: 'post', label: 'Post' }]} readOnly />
```

```vue live example=readonly
<ToggleGroup label="Preferred contact method" name="readonly-contact" default-value="post" :options="[{ value: 'email', label: 'Email' }, { value: 'phone', label: 'Phone' }, { value: 'post', label: 'Post' }]" readonly />
```

```ts live example=readonly framework=angular
template: `<hw-toggle-group label="Preferred contact method" name="readonly-contact" value="post" [options]="[{ value: 'email', label: 'Email' }, { value: 'phone', label: 'Phone' }, { value: 'post', label: 'Post' }]" [readOnly]="true" />`
```

## API

### JavaScript

Table: Options of createToggleGroup

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `multiple` | `boolean` | `false` | — |
| `name` | `string` | `false` | — |
| `value` | `string \| readonly string[]` | `false` | — |
| `onValueChange` | `(value: string \| string[]) => void` | `false` | — |

`createToggleGroup(root, options)` is a controller for a `fieldset` with the class `hw-toggle-group`. In single mode each option is a `label` that holds a native radio input followed by its text, with no class and no span; the empty value is the empty string. With `multiple` each option is a button with the class `hw-button`, `data-variant="secondary"`, `data-size="md"`, `data-hw-value` and `aria-pressed`; the empty value is an empty array, and each pressed value is submitted as a hidden input under the name `name`, or `data-hw-name`. `required` is not enforced in multiple mode. A read-only group is marked `data-hw-readonly="true"`. The controller returns `select`, `value` and `destroy`, and `onValueChange` receives the string, or the array in multiple mode. The options publish no defaults in 0.3.0: `multiple` is off when absent, and the root attribute `data-hw-multiple="true"` turns it on in markup. A native form reset returns the group to its authored selection and calls `onValueChange` once when the selection changed.

### React

Table: Props of ToggleGroup

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `form` | `string` | `false` | — |
| `name` | `string` | `false` | — |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `label` | `ReactNode` | `false` | — |
| `options` | `readonly Option[]` | `true` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |
| `required` | `boolean` | `false` | — |
| `readOnly` | `boolean` | `false` | — |
| `variant` | `'segmented' \| 'outline'` | `false` | `'segmented'` |
| `labelHidden` | `boolean` | `false` | `false` |
| `multiple` | `boolean` | `false` | — |
| `value` | `string \| readonly string[]` | `false` | — |
| `defaultValue` | `string \| readonly string[]` | `false` | — |
| `onValueChange` | `((value: string) => void) \| ((value: string[]) => void)` | `false` | — |

`options` is required and holds objects with `value`, `label` and an optional `disabled`. `label` is the legend and names the group; without it no legend is rendered and a warning is given, unless `aria-label` or `aria-labelledby` names the group. Use `value` with `onValueChange` for a controlled group, or `defaultValue` for an uncontrolled one; the value is a string, or an array of strings with `multiple`, and `onValueChange` receives the same type. `variant` defaults to `'segmented'` and `labelHidden` to `false`; `labelHidden` hides the legend visually and it stays the accessible name, so use it only where the option texts make the purpose visible. `hint` and `error` render as paragraphs after the options and describe the group, and a non-empty `error` marks it `aria-invalid`. `required` applies to single selection: the radios carry `required` and the legend shows the marker. `name` and `form` reach the inputs, and `readOnly` reaches the options.

### Vue

Table: Props, events and slots of ToggleGroup

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `options` | prop | `readonly Option[]` | `true` | — |
| `label` | prop | `string` | `false` | — |
| `hint` | prop | `string` | `false` | — |
| `error` | prop | `string` | `false` | — |
| `required` | prop | `boolean` | `false` | `false` |
| `name` | prop | `string` | `false` | — |
| `form` | prop | `string` | `false` | — |
| `modelValue` | prop | `string \| readonly string[]` | `false` | — |
| `defaultValue` | prop | `string \| readonly string[]` | `false` | — |
| `multiple` | prop | `boolean` | `false` | `false` |
| `disabled` | prop | `boolean` | `false` | `false` |
| `readonly` | prop | `boolean` | `false` | `false` |
| `labelHidden` | prop | `boolean` | `false` | `false` |
| `variant` | prop | `'segmented' \| 'outline'` | `false` | `'segmented'` |
| `update:modelValue` | event | `(value: string \| readonly string[]) => void` | `false` | — |

`options` is required and holds objects with `value`, `label` and an optional `disabled`. `v-model` binds the value, a string or, with `multiple`, an array of strings, and `update:modelValue` is emitted with the new value. `defaultValue` has no default: the empty value is the empty string, or an empty array in multiple mode. `label` is the legend and names the group unless `aria-label` or `aria-labelledby` does; `labelHidden` hides it visually and it stays the accessible name. `variant` defaults to `'segmented'`. `required` applies to single selection, and `multiple`, `disabled` and `readonly` default to `false`; read-only options carry `aria-disabled` and the fieldset `data-hw-readonly`. `name` and `form` reach the radios and the hidden inputs, never the fieldset. `hint` and `error` follow the options. A form reset returns to `defaultValue` and emits `update:modelValue` once, and only when the reset changed the value.

### Angular

Table: Inputs, outputs and content of hw-toggle-group

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
| `value` | input | `string \| string[]` | `false` | `''` |
| `readOnly` | input | `boolean` | `false` | `false` |
| `labelHidden` | input | `boolean` | `false` | `false` |
| `options` | input | `readonly Option[]` | `true` | — |
| `multiple` | input | `boolean` | `false` | `false` |
| `variant` | input | `'segmented' \| 'outline'` | `false` | `'segmented'` |
| `valueChange` | output | `string \| string[]` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |

`HwToggleGroupComponent` (`hw-toggle-group`) renders a fieldset with a legend. `[(value)]` binds a string, or a string array with `multiple`, and `valueChange` emits it; the component also works as a form control. `label` is required unless `aria-label` or `aria-labelledby` names the group; without a name no legend is rendered and a warning is reported. `labelHidden` defaults to `false`, `variant` to `'segmented'`, `multiple`, `disabled` and `readOnly` to `false`. `required` applies to single selection: the radios carry `required`, the legend shows the marker, and a failed submission marks the fieldset `aria-invalid` until an option is chosen or the form resets. In multiple mode `required` is not enforced, so use `error` or a hint to state a minimum. The host element generates no box, so the fieldset is the layout item. A reset emits the initial selection once when it changed.

## Accessibility

The group is a native `fieldset` and its legend is the accessible name of the group. In single mode the options are native radio inputs, so the browser provides their roles, selection and keyboard handling. In multiple mode each option is a native button with `aria-pressed`, and each button keeps its own Tab stop. A read-only group stays focusable and its selected value is submitted, but selection by click or key is blocked; a disabled group submits nothing.

A visible focus ring is drawn inside the segment, including on a read-only option, and the stylesheet keeps selected, disabled and focus states distinguishable in forced colours and removes the transitions of the options when the reader asks for reduced motion. `hint` and `error` describe the group, and the legend is the only name of the group, so write it as the question the options answer.

Table: Keyboard interaction of ToggleGroup

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | In single mode, moves focus into the group on the selected option, or on the first option when none is selected, and then to the next control. |
| <kbd>Right Arrow</kbd>, <kbd>Left Arrow</kbd>, <kbd>Down Arrow</kbd>, <kbd>Up Arrow</kbd> | In single mode, moves focus to another option and selects it, as native radio inputs do. |
| <kbd>Space</kbd> | Selects the focused radio in single mode, and presses or releases the focused button in multiple mode. |
| <kbd>Enter</kbd> | Presses or releases the focused button in multiple mode. |

## RTL and localisation

The component has no built-in text: the legend, the option labels, the hint and the error are written in the language of the page. The segments, their separators and their outer corners use logical properties, so the group follows the reading direction of the page, and the first option is at the start of the line. The values of the options stay as written, independent of language and direction.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of ToggleGroup. The evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The segment geometry, the selected, hover and focus states, the mobile sizing and the corrections made for disabled and focus states are mapped in the [segmented controls notes](../nic-segmented.md), with the confidence of each mapping.
- The native radio input that single selection uses is listed among the native input types in the [coverage notes](../coverage.md).
