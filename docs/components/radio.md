# Radio

Radio is a native radio input wrapped in a clickable label, for one option of a set of mutually exclusive options. Related radios share a name and sit in a fieldset whose legend names the question.

## Example

The legend states the question, and each label states one answer. The radios share one name, so selecting one clears the others, and arrow keys move between them.

```html live example=basic differences=radio-adapter-markup
<fieldset class="hw-field">
  <legend class="hw-label">How would you like to receive the decision?</legend>
  <label class="hw-choice" for="basic-delivery-post"><input class="hw-radio" id="basic-delivery-post" name="delivery" type="radio" value="post" checked>By post</label>
  <label class="hw-choice" for="basic-delivery-email"><input class="hw-radio" id="basic-delivery-email" name="delivery" type="radio" value="email">By email</label>
  <label class="hw-choice" for="basic-delivery-office"><input class="hw-radio" id="basic-delivery-office" name="delivery" type="radio" value="office">Collect in person</label>
</fieldset>
```

```tsx live example=basic
<fieldset className="hw-field">
  <legend className="hw-label">How would you like to receive the decision?</legend>
  <Radio label="By post" name="delivery" value="post" defaultChecked />
  <Radio label="By email" name="delivery" value="email" />
  <Radio label="Collect in person" name="delivery" value="office" />
</fieldset>
```

```vue live example=basic
<fieldset class="hw-field">
  <legend class="hw-label">How would you like to receive the decision?</legend>
  <Radio label="By post" name="delivery" value="post" default-value="post" />
  <Radio label="By email" name="delivery" value="email" default-value="post" />
  <Radio label="Collect in person" name="delivery" value="office" default-value="post" />
</fieldset>
```

```ts live example=basic framework=angular
template: `<hw-radio-group label="How would you like to receive the decision?" name="delivery" value="post" [options]="[
  { value: 'post', label: 'By post' },
  { value: 'email', label: 'By email' },
  { value: 'office', label: 'Collect in person' },
]" />`
```

## Variants and states

### Disabled option

A disabled radio uses the native `disabled` attribute: it leaves the tab order and cannot be selected, while the other options of the group stay available.

```html live example=disabled differences=radio-adapter-markup
<fieldset class="hw-field">
  <legend class="hw-label">Which office will handle the request?</legend>
  <label class="hw-choice" for="disabled-office-north"><input class="hw-radio" id="disabled-office-north" name="office" type="radio" value="north">North office</label>
  <label class="hw-choice" for="disabled-office-south"><input class="hw-radio" id="disabled-office-south" name="office" type="radio" value="south" disabled>South office</label>
</fieldset>
```

```tsx live example=disabled
<fieldset className="hw-field">
  <legend className="hw-label">Which office will handle the request?</legend>
  <Radio label="North office" name="office" value="north" />
  <Radio label="South office" name="office" value="south" disabled />
</fieldset>
```

```vue live example=disabled
<fieldset class="hw-field">
  <legend class="hw-label">Which office will handle the request?</legend>
  <Radio label="North office" name="office" value="north" />
  <Radio label="South office" name="office" value="south" disabled />
</fieldset>
```

```ts live example=disabled framework=angular
template: `<hw-radio-group label="Which office will handle the request?" name="office" [options]="[
  { value: 'north', label: 'North office' },
  { value: 'south', label: 'South office', disabled: true },
]" />`
```

### Read only

A read-only group stays in the tab order and submits its value, while a click or an arrow key leaves the value and its peers unchanged.

```html live example=readonly differences=radio-adapter-markup
<fieldset class="hw-field">
  <legend class="hw-label">Preferred language of correspondence</legend>
  <label class="hw-choice" for="readonly-language-ar"><input class="hw-radio" id="readonly-language-ar" name="language" type="radio" value="ar" checked readonly aria-disabled="true">Arabic</label>
  <label class="hw-choice" for="readonly-language-en"><input class="hw-radio" id="readonly-language-en" name="language" type="radio" value="en" readonly aria-disabled="true">English</label>
</fieldset>
```

```tsx live example=readonly
<fieldset className="hw-field">
  <legend className="hw-label">Preferred language of correspondence</legend>
  <Radio label="Arabic" name="language" value="ar" defaultChecked readOnly />
  <Radio label="English" name="language" value="en" readOnly />
</fieldset>
```

```vue live example=readonly
<fieldset class="hw-field">
  <legend class="hw-label">Preferred language of correspondence</legend>
  <Radio label="Arabic" name="language" value="ar" default-value="ar" readonly />
  <Radio label="English" name="language" value="en" default-value="ar" readonly />
</fieldset>
```

```ts live example=readonly framework=angular
template: `<hw-radio-group label="Preferred language of correspondence" name="language" value="ar" [readOnly]="true" [options]="[
  { value: 'ar', label: 'Arabic' },
  { value: 'en', label: 'English' },
]" />`
```

## API

### JavaScript

Table: Attributes of the hw-radio element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-radio'` | `true` | — |
| `readonly` | `boolean` | `false` | — |
| `aria-disabled` | `'true'` | `false` | — |

Radio has no JavaScript controller. The markup is the API: write a `fieldset` with the class `hw-field` and a `legend` with the class `hw-label`, and for each option a `label` with the class `hw-choice` that holds a native input with `type="radio"` and the class `hw-radio`, followed by the label text. Give the radios of a group the same `name`. Add a paragraph with the class `hw-hint` or `hw-error` and associate it with the inputs through `aria-describedby`; no script does it. `checked`, `disabled` and `required` are native attributes. For a read-only group write `readonly` and `aria-disabled="true"` on each radio; the guard that keeps the value and the peers unchanged is installed by `enhance()` of the vanilla package.

### React

Table: Props of Radio

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `label` | `ReactNode` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |

Radio renders one option and accepts the props of a native input element, including `name`, `value`, `checked`, `defaultChecked`, `onChange`, `required`, `disabled`, `readOnly` and `ref`; they reach the input, and the ref reaches the input, not its label. Give the radios of a group the same `name`, and compose the group with a native `fieldset` and `legend`. Use `checked` with `onChange` for a controlled option, or `defaultChecked` for an uncontrolled one. The label, the hint and the error are renderable React content. The hint and the error render as paragraphs after the label and are associated with the input, and a non-empty `error` sets `aria-invalid`. Radio shows no required marker, so word a requirement in the legend or in `label`.

### Vue

Table: Props, events and slots of Radio

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
| `update:modelValue` | event | `(value: string) => void` | `false` | — |
| `default` | slot | — | `false` | — |

Radio renders one option. Radios that share a `name` form a group, and the application writes the `fieldset` and the `legend`. `v-model` binds the string value of the group, and each radio is checked when that value equals its own `value` prop; `defaultValue` on the radios of a group names the option that is checked initially and after a native reset. `label`, `hint` and `error` are strings; the hint and the error render as paragraphs after the label and are associated with the input, and a non-empty `error` sets `aria-invalid`. The other attributes, such as `name` and `disabled`, and the listeners reach the native input; `readonly` leaves the value and the peers unchanged while the radio stays focusable. The table lists `indeterminate` because the published declaration of Radio shares its factory with Checkbox; a radio has no mixed state and the prop has no effect on it, so leave it unset. The `default` slot is read by the published build and the declaration types no slot; it holds the label content when `label` is not given.

### Angular

Table: Inputs, outputs and content of hw-radio-group

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
| `options` | input | `readonly Option[]` | `false` | `[]` |
| `valueChange` | output | `string` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |

`HwRadioGroupComponent` (`hw-radio-group`) renders a native radio group: a fieldset, a legend from `label`, one native radio for each entry of `options`, the hint and the error. A single radio has no Angular component in 0.3.0; write a native input with the class `hw-radio`. Bind `[(value)]` for a two-way string value; the component also works as a form control through its value accessor. Each entry of `options` has a `value`, a `label` and an optional `disabled`. `readOnly` and `disabled` are boolean inputs. A group needs a `label`, or `aria-label` or `aria-labelledby` written on `hw-radio-group`; these attributes are forwarded to the fieldset and removed from the host. `name` is the shared name of the radios. `controlId` is the prefix of the id of each radio (`controlId`, a hyphen and the index of the option), of the `for` of its label and of the ids of the hint and the error, and the fallback of `name`; the application id wins, then the id of a surrounding `hw-field`, then a generated one. The fieldset carries no id.

## Accessibility

Radio is a native input with `type="radio"`, so the browser provides its role, its checked state, its roving focus and form submission. Each label is a native `label` element with the class `hw-choice` that holds the input and the text, so the label text is the accessible name of the option and a click on it selects the option. The legend of the fieldset is the name of the group.

- <kbd>Tab</kbd> moves focus into the group, to the selected radio, or when none is selected to the first one (<kbd>Tab</kbd>) or the last one (<kbd>Shift</kbd> + <kbd>Tab</kbd>), and out of it; <kbd>Space</kbd> selects the focused radio when none is selected.
- <kbd>Down Arrow</kbd>, <kbd>Right Arrow</kbd> and the opposite arrows move focus to the next or the previous radio of the group and select it. This is native radio behaviour, which the browser applies to inputs with the same `name`. In right-to-left text the browser takes <kbd>Left Arrow</kbd> as the next radio and <kbd>Right Arrow</kbd> as the previous one.
- Related radios must share one `name`. In React and Vue the application writes the `fieldset` and the `legend`; Radio is a single option. In Angular `hw-radio-group` renders the fieldset, the legend and the options.
- A radio shows no required marker, and `required` stays native on each radio of a group. The legend of `hw-radio-group` takes the required marker when the group is required.
- The hint and the error are associated with the input through `aria-describedby`, and a non-empty `error` sets `aria-invalid`; on `hw-radio-group` the description and the invalid state are on the fieldset.
- A read-only group stays focusable and submits its value, while pointer and keyboard activation leave the value and the peers unchanged. A disabled radio is a separate native state.
- The stylesheet removes the transition of the hover halo when the reader asks for reduced motion.

## RTL and localisation

Radio has no built-in text: the legend, the labels, the hints and the errors are written by the application in the language of the page. The control and its text follow the reading direction of the page, so in right-to-left text the circle stands at the start of the label, on the right, because the circle comes first in the label and the label follows the reading direction.

- The value of a radio is a string that the application defines; the visible label is translated and the value is not.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Radio; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The 20px control, the hover halo, the centred dot, the disabled and read-only presentations and the focus handling of the supplied Platforms Code style sheet are mapped in the [choice notes](../nic-choices.md), with the confidence of each mapping.
- The source focus square of the radio is adapted to an outline around the native control, and read-only handling is an adaptation that preserves the peers of the group; the [choice notes](../nic-choices.md) describe both.
