# Slider

Slider selects one number from a bounded range with a native range input, a visible label and, when the application supplies them, a hint, an error message and the current value as text. The value is a number, and the native range semantics and keyboard behaviour remain.

## Example

A slider has a visible label that names the quantity requested. The hint states the range, and `showValue` renders the current value as text after the input.

```html live example=basic
<div class="hw-field">
  <label class="hw-label" for="basic-copies" id="basic-copies-label">Number of copies</label>
  <input class="hw-slider" id="basic-copies" name="copies" type="range" min="1" max="10" step="1" value="5" aria-describedby="basic-copies-hint">
  <output class="hw-slider-value" for="basic-copies">5</output>
  <p class="hw-hint" id="basic-copies-hint">Choose between 1 and 10 copies.</p>
</div>
```

```tsx live example=basic
<Slider label="Number of copies" name="copies" min={1} max={10} step={1} defaultValue={5} hint="Choose between 1 and 10 copies." showValue />
```

```vue live example=basic
<Slider label="Number of copies" name="copies" :min="1" :max="10" :step="1" :default-value="5" hint="Choose between 1 and 10 copies." show-value />
```

```ts live example=basic framework=angular
template: `<hw-slider label="Number of copies" name="copies" [min]="1" [max]="10" [step]="1" [value]="5" hint="Choose between 1 and 10 copies." [showValue]="true" />`
```

## Variants and states

### Formatted value

`formatValue` returns the text of the value. It is shown in the output and is written to `aria-valuetext`, so assistive technology announces the same text as the screen shows.

```html live example=format
<div class="hw-field">
  <label class="hw-label" for="format-days" id="format-days-label">Processing time</label>
  <input class="hw-slider" id="format-days" name="days" type="range" min="1" max="30" step="1" value="7" aria-valuetext="7 days">
  <output class="hw-slider-value" for="format-days">7 days</output>
</div>
```

```tsx live example=format
<Slider label="Processing time" name="days" min={1} max={30} step={1} defaultValue={7} showValue formatValue={value => `${value} days`} />
```

```vue live example=format
<Slider label="Processing time" name="days" :min="1" :max="30" :step="1" :default-value="7" show-value :format-value="(value: number) => `${value} days`" />
```

```ts live example=format framework=angular
import { Component } from '@angular/core';
import { HwSliderComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-format-example',
  imports: [HwSliderComponent],
  template: `<hw-slider label="Processing time" name="days" [min]="1" [max]="30" [step]="1" [value]="7" [showValue]="true" [formatValue]="formatDays" />`,
})
export class FormatExample {
  formatDays = (value: number) => `${value} days`;
}
```

### Required

A required slider shows one marker after its label. A range input always holds a value, so the attribute `required` is not written on the input. The marker is hidden from assistive technology, so the hint states the requirement in words as well.

```html live example=required
<div class="hw-field">
  <label class="hw-label" for="required-pages" id="required-pages-label">Number of pages<span class="hw-required-marker" aria-hidden="true"> *</span></label>
  <input class="hw-slider" id="required-pages" name="pages" type="range" min="1" max="50" step="1" value="25" aria-describedby="required-pages-hint">
  <p class="hw-hint" id="required-pages-hint">Choose between 1 and 50 pages. This field is required.</p>
</div>
```

```tsx live example=required
<Slider label="Number of pages" name="pages" min={1} max={50} step={1} defaultValue={25} hint="Choose between 1 and 50 pages. This field is required." required />
```

```vue live example=required
<Slider label="Number of pages" name="pages" :min="1" :max="50" :step="1" :default-value="25" hint="Choose between 1 and 50 pages. This field is required." required />
```

```ts live example=required framework=angular
template: `<hw-slider label="Number of pages" name="pages" [min]="1" [max]="50" [step]="1" [value]="25" hint="Choose between 1 and 50 pages. This field is required." [required]="true" />`
```

### Error

An error is shown in a paragraph after the control, and the input is marked with `aria-invalid="true"` and described by the message. The message states what is wrong and how to correct it.

```html live example=error
<div class="hw-field">
  <label class="hw-label" for="error-copies" id="error-copies-label">Number of copies</label>
  <input class="hw-slider" id="error-copies" name="copies" type="range" min="1" max="10" step="1" value="1" aria-invalid="true" aria-describedby="error-copies-error">
  <p class="hw-error" id="error-copies-error">Choose at least 2 copies for a joint application.</p>
</div>
```

```tsx live example=error
<Slider label="Number of copies" name="copies" min={1} max={10} step={1} defaultValue={1} error="Choose at least 2 copies for a joint application." />
```

```vue live example=error
<Slider label="Number of copies" name="copies" :min="1" :max="10" :step="1" :default-value="1" error="Choose at least 2 copies for a joint application." />
```

```ts live example=error framework=angular
template: `<hw-slider label="Number of copies" name="copies" [min]="1" [max]="10" [step]="1" [value]="1" error="Choose at least 2 copies for a joint application." />`
```

### Disabled

A disabled slider uses the native `disabled` attribute. It is not focusable, and its value is not submitted.

```html live example=disabled
<div class="hw-field">
  <label class="hw-label" for="disabled-copies" id="disabled-copies-label">Number of copies</label>
  <input class="hw-slider" id="disabled-copies" name="copies" type="range" min="1" max="10" step="1" value="5" disabled>
</div>
```

```tsx live example=disabled
<Slider label="Number of copies" name="copies" min={1} max={10} step={1} defaultValue={5} disabled />
```

```vue live example=disabled
<Slider label="Number of copies" name="copies" :min="1" :max="10" :step="1" :default-value="5" disabled />
```

```ts live example=disabled framework=angular
template: `<hw-slider label="Number of copies" name="copies" [min]="1" [max]="10" [step]="1" [value]="5" [disabled]="true" />`
```

### Read only

A read-only slider keeps its value in the form and stays in the tab order, so a reader can focus it. It sets `aria-readonly="true"`. In React, Vue and Angular the component also ignores pointer gestures and the keys that change the value. A native range input has no read-only behaviour, so the vanilla markup only states the state: the application cancels the value change itself, and the vanilla example here can still be changed.

```html live example=readonly
<div class="hw-field">
  <label class="hw-label" for="readonly-copies" id="readonly-copies-label">Number of copies</label>
  <input class="hw-slider" id="readonly-copies" name="copies" type="range" min="1" max="10" step="1" value="5" aria-readonly="true">
</div>
```

```tsx live example=readonly
<Slider label="Number of copies" name="copies" min={1} max={10} step={1} defaultValue={5} readOnly />
```

```vue live example=readonly
<Slider label="Number of copies" name="copies" :min="1" :max="10" :step="1" :default-value="5" readonly />
```

```ts live example=readonly framework=angular
template: `<hw-slider label="Number of copies" name="copies" [min]="1" [max]="10" [step]="1" [value]="5" [readOnly]="true" />`
```

## API

### JavaScript

Table: Attributes of the hw-slider element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-slider'` | `true` | — |

Slider has no JavaScript controller. The markup is the API: write a native `input` with `type="range"` and the class `hw-slider` inside an element with the class `hw-field`, a `label` with the class `hw-label` whose `for` names the input, and, where needed, a paragraph with the class `hw-hint` or `hw-error` and an `output` element with the class `hw-slider-value`. The native attributes `min`, `max`, `step`, `value`, `name`, `disabled` and `aria-valuetext` set the range and the text that assistive technology announces. The application writes the `output` and keeps its text equal to the value, because no script updates it. A range input always holds a value, so HTML does not allow `required` on it; a visible requirement is written as the required marker inside the label. A read-only slider is written with `aria-readonly="true"`, and the application cancels the value change itself.

### React

Table: Props of Slider

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `value` | `number` | `false` | — |
| `defaultValue` | `number` | `false` | — |
| `onValueChange` | `(value: number) => void` | `false` | — |
| `showValue` | `boolean` | `false` | `false` |
| `formatValue` | `(value: number) => string` | `false` | — |
| `label` | `ReactNode` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |

Slider also accepts the props of a native input element, including `name`, `min`, `max`, `step`, `disabled`, `readOnly` and `ref`; they reach the range input. `min` and `max` are native props, not rows of the table, and the component sets their defaults: `min` is 0 and `max` is 100 unless given. Use `value` with `onValueChange` for a controlled slider, or `defaultValue` for an uncontrolled one; when neither is given, the slider starts at the midpoint of `min` and `max`, so there is no default in the table. `onValueChange` receives the value as a number. `showValue` renders an `output` after the input with the value as a string, or with the text that `formatValue` returns; `formatValue` also sets `aria-valuetext`, which is not written without it. `label`, `hint` and `error` are renderable React content; the hint and the error render as paragraphs after the input and are associated with it, and a non-empty `error` sets `aria-invalid`. `required` shows the marker after the label and is not written on the range input. A read-only slider keeps its value, ignores pointer gestures and the arrow, Home, End, Page Up and Page Down keys, and sets `aria-readonly`.

### Vue

Table: Props, events and slots of Slider

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `showValue` | prop | `boolean` | `false` | `false` |
| `modelValue` | prop | `number` | `false` | — |
| `defaultValue` | prop | `number` | `false` | — |
| `min` | prop | `number` | `false` | `0` |
| `max` | prop | `number` | `false` | `100` |
| `step` | prop | `number` | `false` | `1` |
| `disabled` | prop | `boolean` | `false` | `false` |
| `readonly` | prop | `boolean` | `false` | `false` |
| `formatValue` | prop | `(value: number) => string` | `false` | — |
| `label` | prop | `string` | `false` | — |
| `hint` | prop | `string` | `false` | — |
| `error` | prop | `string` | `false` | — |
| `required` | prop | `boolean` | `false` | — |
| `update:modelValue` | event | `(value: number) => void` | `false` | — |

`v-model` binds the number, and `defaultValue` sets the initial value of an uncontrolled slider; without either, the slider starts at the midpoint of `min` and `max`, so `defaultValue` has no default in the table. `showValue` renders an `output` after the input with the value as a string, or with the text that `formatValue` returns; `formatValue` also sets `aria-valuetext`, which is not written without it. `label`, `hint` and `error` are strings; the hint and the error render as paragraphs after the input, and a non-empty `error` sets `aria-invalid`. `required` shows the marker and is not written on the range input. A read-only slider keeps its value and sets `aria-readonly`. The other attributes, such as `name` and `form`, reach the native input. The declaration of the package types no slot, and the published build reads none.

### Angular

Table: Inputs, outputs and content of hw-slider

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
| `value` | input | `number` | `false` | `0` |
| `readOnly` | input | `boolean` | `false` | `false` |
| `min` | input | `number` | `false` | `0` |
| `max` | input | `number` | `false` | `100` |
| `step` | input | `number` | `false` | `1` |
| `showValue` | input | `boolean` | `false` | `false` |
| `formatValue` | input | `(value: number) => string` | `false` | — |
| `valueChange` | output | `number` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |

`HwSliderComponent` (`hw-slider`) renders the field, the label, the native range input, the output, the hint and the error. Bind `[(value)]` for a two-way number; the component also works as a form control through its value accessor, and a null written through a form control restores `min`. `value` is the initial value and is 0 unless given, so write a `value` between `min` and `max` where 0 is not a valid start. `showValue` renders an `output` with the class `hw-slider-value` after the input with the value as it is, or with the text that `formatValue` returns; `formatValue` also sets `aria-valuetext`, which is not written without it. `required` shows the marker and is not written on the range input. `readOnly` keeps the value and sets `aria-readonly`. A slider needs a `label`, or `aria-label` or `aria-labelledby` written on `hw-slider`, or the label of a surrounding `hw-field`; `controlId` sets the id of the input. `valueChange` emits the number, and `focused` and `blurred` emit the native focus events of the input.

## Accessibility

Slider is a native range input, so the browser provides its role, its focus behaviour and its keyboard handling: the <kbd>Left Arrow</kbd>, <kbd>Right Arrow</kbd>, <kbd>Up Arrow</kbd> and <kbd>Down Arrow</kbd> keys change the value by `step`, <kbd>Home</kbd> and <kbd>End</kbd> move to `min` and `max`, and <kbd>Page Up</kbd> and <kbd>Page Down</kbd> change it by a larger step. The label is a native `label` element whose `for` names the input, so the label text is the accessible name. The hint and the error are associated with the input as its description.

- `aria-valuetext` is written only when `formatValue` is given. Without it, assistive technology announces the number. Write a formatted value where the number alone does not carry its unit.
- The `output` of `showValue` repeats the value as text for a reader who does not rely on the position of the thumb; it is not the accessible name.
- `aria-invalid="true"` is set when the application passes a non-empty `error`.
- A read-only slider sets `aria-readonly="true"` and stays in the tab order. In React, Vue and Angular it also ignores pointer gestures and the arrow, Home, End, Page Up and Page Down keys; the vanilla markup has no such guard, and the application cancels the change. A disabled slider is neither focusable nor changeable.
- The required marker is hidden from assistive technology. A range input always has a value, so the requirement is also written in the hint where it matters.
- The stylesheet gives the range input a focus indicator, and it keeps the native control in forced-colours mode.

## RTL and localisation

Slider has no built-in text: the label, the hint, the error and the text returned by `formatValue` are written by the application in the language of the page. The element inherits the language and the direction of the page, and the packaged styles use logical properties, so the range input fills the inline size of its field and the label and the paragraphs follow the reading direction.

- `formatValue` is where the application formats the number for its locale: digits, a unit and the order of the words. Without it, the output shows the number as a string.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Slider; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The [coverage notes](../coverage.md) list Slider in the catalog group Additional controls, under the native implementation type, and the input type range as a bounded numeric selection.
- The label follows the mapping of the [input notes](../nic-inputs.md), which refer for the typography of the hint and the error to the [select and field descriptions comparison](../nic-select.md); the read-only behaviour is described in the [read-only notes](../readonly-inputs.md).
