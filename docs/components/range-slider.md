# RangeSlider

RangeSlider is a group of two labelled native range inputs that select a lower and an upper number. The lower value never exceeds the upper value, and both values are submitted with the form.

## Example

A range slider has a visible group label that names the information requested and a visible label for each thumb.

```html live example=basic static differences=range-slider-adapter-markup
<fieldset class="hw-field hw-range-slider" data-hw="range-slider">
  <legend class="hw-label">Processing time</legend>
  <label class="hw-label">Shortest time<input class="hw-slider" id="basic-lower" type="range" name="processing-days" min="1" max="30" value="5" data-hw-lower></label>
  <label class="hw-label">Longest time<input class="hw-slider" id="basic-upper" type="range" name="processing-days" min="1" max="30" value="20" data-hw-upper></label>
</fieldset>
```

```tsx live example=basic
<RangeSlider
  label="Processing time"
  lowerLabel="Shortest time"
  upperLabel="Longest time"
  name="processing-days"
  min={1}
  max={30}
  defaultValue={[5, 20]}
/>
```

```vue live example=basic
<RangeSlider
  label="Processing time"
  lower-label="Shortest time"
  upper-label="Longest time"
  name="processing-days"
  :min="1"
  :max="30"
  :default-value="[5, 20]"
/>
```

```ts live example=basic framework=angular
import { Component } from '@angular/core';
import { HwRangeSliderComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwRangeSliderComponent],
  template: `
    <hw-range-slider
      label="Processing time"
      lowerLabel="Shortest time"
      upperLabel="Longest time"
      lowerName="processing-days"
      upperName="processing-days"
      [min]="1"
      [max]="30"
      [value]="[5, 20]"
    />
  `,
})
export class ExampleComponent {
}
```

## Variants and states

### Step and hint

`step` sets the increment of both thumbs, and the hint explains what the range is used for. The two values keep to the step, and the lower value stays at or below the upper value.

```html live example=step static differences=range-slider-adapter-markup
<fieldset class="hw-field hw-range-slider" data-hw="range-slider" aria-describedby="step-hint">
  <legend class="hw-label">Processing time</legend>
  <label class="hw-label">Shortest time<input class="hw-slider" id="step-lower" type="range" name="processing-days" min="0" max="30" step="5" value="5" data-hw-lower></label>
  <label class="hw-label">Longest time<input class="hw-slider" id="step-upper" type="range" name="processing-days" min="0" max="30" step="5" value="20" data-hw-upper></label>
  <p class="hw-hint" id="step-hint">Choose the shortest and the longest time that you accept.</p>
</fieldset>
```

```tsx live example=step
<RangeSlider
  label="Processing time"
  lowerLabel="Shortest time"
  upperLabel="Longest time"
  name="processing-days"
  min={0}
  max={30}
  defaultValue={[5, 20]}
  step={5}
  hint="Choose the shortest and the longest time that you accept."
/>
```

```vue live example=step
<RangeSlider
  label="Processing time"
  lower-label="Shortest time"
  upper-label="Longest time"
  name="processing-days"
  :min="0"
  :max="30"
  :default-value="[5, 20]"
  :step="5"
  hint="Choose the shortest and the longest time that you accept."
/>
```

```ts live example=step framework=angular
import { Component } from '@angular/core';
import { HwRangeSliderComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwRangeSliderComponent],
  template: `
    <hw-range-slider
      label="Processing time"
      lowerLabel="Shortest time"
      upperLabel="Longest time"
      lowerName="processing-days"
      upperName="processing-days"
      [min]="0"
      [max]="30"
      [value]="[5, 20]"
      [step]="5"
      hint="Choose the shortest and the longest time that you accept."
    />
  `,
})
export class ExampleComponent {
}
```

### Error

An error is shown in a paragraph at the end of the group, inside the fieldset, and the fieldset is marked with `aria-invalid="true"` and described by the message. The message states what is wrong and how to correct it.

```html live example=error static differences=range-slider-adapter-markup
<fieldset class="hw-field hw-range-slider" data-hw="range-slider" aria-invalid="true" aria-describedby="error-error">
  <legend class="hw-label">Processing time</legend>
  <label class="hw-label">Shortest time<input class="hw-slider" id="error-lower" type="range" name="processing-days" min="1" max="30" value="5" data-hw-lower></label>
  <label class="hw-label">Longest time<input class="hw-slider" id="error-upper" type="range" name="processing-days" min="1" max="30" value="20" data-hw-upper></label>
  <p class="hw-error" id="error-error">Choose a longest time that is later than the shortest time.</p>
</fieldset>
```

```tsx live example=error
<RangeSlider
  label="Processing time"
  lowerLabel="Shortest time"
  upperLabel="Longest time"
  name="processing-days"
  min={1}
  max={30}
  defaultValue={[5, 20]}
  error="Choose a longest time that is later than the shortest time."
/>
```

```vue live example=error
<RangeSlider
  label="Processing time"
  lower-label="Shortest time"
  upper-label="Longest time"
  name="processing-days"
  :min="1"
  :max="30"
  :default-value="[5, 20]"
  error="Choose a longest time that is later than the shortest time."
/>
```

```ts live example=error framework=angular
import { Component } from '@angular/core';
import { HwRangeSliderComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwRangeSliderComponent],
  template: `
    <hw-range-slider
      label="Processing time"
      lowerLabel="Shortest time"
      upperLabel="Longest time"
      lowerName="processing-days"
      upperName="processing-days"
      [min]="1"
      [max]="30"
      [value]="[5, 20]"
      error="Choose a longest time that is later than the shortest time."
    />
  `,
})
export class ExampleComponent {
}
```

### Read only

In a read-only group the values stay visible and are still submitted, the thumbs stay focusable and carry `aria-readonly="true"`, and the keys and the pointer cannot change them.

```html live example=readonly static differences=range-slider-adapter-markup
<fieldset class="hw-field hw-range-slider" data-hw="range-slider" data-hw-readonly="true">
  <legend class="hw-label">Processing time</legend>
  <label class="hw-label">Shortest time<input class="hw-slider" id="readonly-lower" type="range" name="processing-days" min="1" max="30" value="5" data-hw-lower></label>
  <label class="hw-label">Longest time<input class="hw-slider" id="readonly-upper" type="range" name="processing-days" min="1" max="30" value="20" data-hw-upper></label>
</fieldset>
```

```tsx live example=readonly
<RangeSlider
  label="Processing time"
  lowerLabel="Shortest time"
  upperLabel="Longest time"
  name="processing-days"
  min={1}
  max={30}
  defaultValue={[5, 20]}
  readOnly
/>
```

```vue live example=readonly
<RangeSlider
  label="Processing time"
  lower-label="Shortest time"
  upper-label="Longest time"
  name="processing-days"
  :min="1"
  :max="30"
  :default-value="[5, 20]"
  readonly
/>
```

```ts live example=readonly framework=angular
import { Component } from '@angular/core';
import { HwRangeSliderComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwRangeSliderComponent],
  template: `
    <hw-range-slider
      label="Processing time"
      lowerLabel="Shortest time"
      upperLabel="Longest time"
      lowerName="processing-days"
      upperName="processing-days"
      [min]="1"
      [max]="30"
      [value]="[5, 20]"
      [readOnly]="true"
    />
  `,
})
export class ExampleComponent {
}
```

## API

### JavaScript

Table: Options of createRangeSlider

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `min` | `number` | `false` | — |
| `max` | `number` | `false` | — |
| `onValueChange` | `(value: [number, number]) => void` | `false` | — |
| `locale` | `string` | `false` | — |
| `formatValue` | `(value: number) => string` | `false` | — |
| `getRangeLabel` | `(lower: number, upper: number) => string` | `false` | — |

`createRangeSlider(root, options)` enhances a `fieldset` with the class `hw-range-slider`; `enhance()` does so for `data-hw="range-slider"`. The markup is the API: write two native range inputs with the class `hw-slider`, the first with `data-hw-lower` and the second with `data-hw-upper`, each inside a `label` with the class `hw-label` that carries its visible text, under a `legend`. `min` and `max` are read from the inputs unless given as options. The controller keeps the lower value at or below the upper value, writes the limit of one thumb into the `max` or `min` of the other, and clamps the values to the range. An element with `data-hw-range-output` receives the range text, which `getRangeLabel` produces or the attribute `data-hw-range-label` supplies, in which the placeholders {lower} and {upper} stand for the two numbers; the text is required when that element is present. `formatValue` gives each thumb its `aria-valuetext` and formats the numbers of the range text, and `locale` formats those numbers when `formatValue` is not given; the attribute `data-hw-locale` also sets it. `data-hw-readonly="true"` on the root, or `aria-readonly="true"`, makes the group read only. `onValueChange` receives the pair of values, and the same change is dispatched as `hw:change` on the root. The returned object has `value` and `destroy`.

### React

Table: Props of RangeSlider

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `value` | `readonly [number, number]` | `false` | — |
| `defaultValue` | `readonly [number, number]` | `false` | — |
| `onValueChange` | `(value: [number, number]) => void` | `false` | — |
| `min` | `number` | `false` | `0` |
| `max` | `number` | `false` | `100` |
| `step` | `number` | `false` | — |
| `lowerLabel` | `string` | `true` | — |
| `upperLabel` | `string` | `true` | — |
| `name` | `string` | `false` | — |
| `lowerName` | `string` | `false` | — |
| `upperName` | `string` | `false` | — |
| `form` | `string` | `false` | — |
| `readOnly` | `boolean` | `false` | — |
| `required` | `boolean` | `false` | — |
| `formatValue` | `(value: number) => string` | `false` | — |
| `getRangeLabel` | `(lower: number, upper: number) => string` | `false` | — |
| `label` | `ReactNode` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |

`lowerLabel` and `upperLabel` are required and are the visible labels of the two thumbs; the optional `label` is the legend of the group. `value` with `onValueChange` makes the group controlled, and `defaultValue` leaves it uncontrolled; both are pairs of numbers, and without either the pair is the lowest and the highest value. `min` and `max` bound both thumbs, and the thumbs cannot cross. `name` submits both values under the same name, in the order lower and upper, while `lowerName` and `upperName` give each value its own name; `form` attaches both inputs to a form elsewhere. `required` shows the marker in the legend only, because HTML does not allow `required` on a range input. `formatValue` gives each thumb its `aria-valuetext`, and without it no thumb has one. `getRangeLabel` renders an output with the whole visible text of the range; no separator is written. `readOnly` keeps the thumbs focusable and submitted.

### Vue

Table: Props, events and slots of RangeSlider

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `modelValue` | prop | `readonly [number, number]` | `false` | — |
| `defaultValue` | prop | `readonly [number, number]` | `false` | — |
| `lowerLabel` | prop | `string` | `true` | — |
| `upperLabel` | prop | `string` | `true` | — |
| `getRangeLabel` | prop | `(lower: number, upper: number) => string` | `false` | — |
| `name` | prop | `string` | `false` | — |
| `lowerName` | prop | `string` | `false` | — |
| `upperName` | prop | `string` | `false` | — |
| `form` | prop | `string` | `false` | — |
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
| `update:modelValue` | event | `(value: readonly [number, number]) => void` | `false` | — |

`v-model` binds the pair of values, and `defaultValue` has no default: without it the pair is the lowest and the highest value. `lowerLabel` and `upperLabel` are required visible labels, and `label` is the legend of the group. `name` submits both values, and `lowerName` and `upperName` override it for one thumb; `form` reaches both inputs. `formatValue` gives each thumb its `aria-valuetext`, and `getRangeLabel` renders an output after the two labels; there is no output without it, and no separator is written. `disabled` and `readonly` are booleans. `required` shows the marker in the legend only. The table lists no slot because the published build reads none.

### Angular

Table: Inputs, outputs and content of hw-range-slider

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
| `value` | input | `[number, number]` | `false` | `[0, 100]` |
| `readOnly` | input | `boolean` | `false` | `false` |
| `min` | input | `number` | `false` | `0` |
| `max` | input | `number` | `false` | `100` |
| `step` | input | `number` | `false` | `1` |
| `lowerLabel` | input | `string` | `true` | — |
| `upperLabel` | input | `string` | `true` | — |
| `lowerName` | input | `string` | `false` | `''` |
| `upperName` | input | `string` | `false` | `''` |
| `formatValue` | input | `(value: number) => string` | `false` | — |
| `getRangeLabel` | input | `(lower: number, upper: number) => string` | `false` | — |
| `valueChange` | output | `[number, number]` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |

`HwRangeSliderComponent` (`hw-range-slider`) renders the fieldset, the legend, the two labelled range inputs, the optional output, the hint and the error, and it works as a form control through its value accessor with a pair of numbers as its value; a null write restores the lowest and the highest value. `lowerLabel` and `upperLabel` are required visible labels. `lowerName` and `upperName` give each thumb its own name; without them `name` submits the two values in the order lower and upper. `formatValue` and `getRangeLabel` are function inputs and are bound to fields of the component class; `getRangeLabel` renders the output with the whole range text, and without it no output is rendered. `valueChange` emits the new pair. `focused` and `blurred` fire when focus enters and leaves the fieldset; moving between the two thumbs emits nothing. Crossing thumbs stop at the other value.

## Accessibility

RangeSlider is a native `fieldset` whose `legend` names the group, with two native range inputs inside it, so the browser provides the role, the focus behaviour and the keyboard handling of each thumb. Each thumb is named by its own visible label, and `formatValue` gives it a spoken value in `aria-valuetext`; without `formatValue` there is none.

Table: Keyboard interaction of RangeSlider

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd> + <kbd>Tab</kbd> | Moves focus to the next or the previous thumb, and out of the group. |
| <kbd>Right Arrow</kbd>, <kbd>Left Arrow</kbd>, <kbd>Down Arrow</kbd>, <kbd>Up Arrow</kbd> | Changes the value of the focused thumb by one step, as a native range input does, unless the group is read only. |
| <kbd>Page Up</kbd>, <kbd>Page Down</kbd> | Changes the value of the focused thumb by a larger step, as a native range input does, unless the group is read only. |
| <kbd>Home</kbd>, <kbd>End</kbd> | Moves the focused thumb to the lowest or the highest value it may take, unless the group is read only. |

- The thumbs cannot cross: the lower thumb stops at the upper value and the upper thumb stops at the lower value.
- A read-only group sets `aria-readonly="true"` on both thumbs. The pointer, the arrow keys, <kbd>Home</kbd>, <kbd>End</kbd>, <kbd>Page Up</kbd> and <kbd>Page Down</kbd> cannot change the values, while <kbd>Tab</kbd>, <kbd>Escape</kbd> and the other keys keep their normal behaviour, so the group does not trap keyboard navigation. The values stay in the form.
- A disabled group neither changes nor submits its values.
- The output with the range text is a visible reading of the two values; `getRangeLabel` supplies the whole text.
- A form reset restores the initial pair and notifies once when the values changed.
- A plain range input has no native read-only behaviour, so use the controller or an adapter when a read-only range is needed.

## RTL and localisation

RangeSlider has no built-in text: the legend, the labels of the thumbs, `getRangeLabel` and the hint are written by the application in the language of the page. The group follows the direction of the page, and the packaged styles use logical properties.

- No number format and no separator is built in: `formatValue` and `getRangeLabel` decide how a number and a range are written, in the digits and the order of the language of the page. The vanilla controller can format the numbers of the range text for a `locale` when no `formatValue` is given.
- The submitted values are plain numbers, independent of the display.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of RangeSlider; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- RangeSlider is listed among the additional controls of the component scope in the [coverage notes](../coverage.md), which also list the native range input type as the bounded numeric selection that RangeSlider extends to two bounds.
- The read-only behaviour, with `aria-readonly`, the blocked gestures and keys, and the values that stay submitted, is recorded in the [read-only note](../readonly-inputs.md).
- The [audit follow-up note](../dga-audit-followup.md) records the correction that a read-only RangeSlider no longer traps keyboard navigation; it records the defect and its fix, not a requirement of the supplied design source.
