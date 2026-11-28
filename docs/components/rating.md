# Rating

Rating is a labelled group of native radio buttons for choosing a whole number of stars, and RatingDisplay shows a score, which may be fractional, without any input. The application supplies the label and the text of every star.

## Example

The group has a visible legend. Each star is a native radio button with an accessible name such as "3 of 5", and the star glyph is decorative. Choosing a star fills every star up to it, and only the chosen radio button is checked and submitted.

```html live example=basic static differences=rating-adapter-markup,rating-angular-radio-names
<fieldset class="hw-field hw-rating" data-hw="rating">
  <legend class="hw-label">Rate this service</legend>
  <label><input type="radio" name="service-rating" value="1" aria-label="1 of 5"><span aria-hidden="true">★</span></label>
  <label><input type="radio" name="service-rating" value="2" aria-label="2 of 5"><span aria-hidden="true">★</span></label>
  <label><input type="radio" name="service-rating" value="3" aria-label="3 of 5" checked><span aria-hidden="true">★</span></label>
  <label><input type="radio" name="service-rating" value="4" aria-label="4 of 5"><span aria-hidden="true">★</span></label>
  <label><input type="radio" name="service-rating" value="5" aria-label="5 of 5"><span aria-hidden="true">★</span></label>
</fieldset>
```

```tsx live example=basic
<Rating label="Rate this service" name="service-rating" defaultValue={3} getRatingLabel={(value, max) => value + ' of ' + max} />
```

```vue live example=basic
<Rating label="Rate this service" name="service-rating" :default-value="3" :get-rating-label="(value, max) => value + ' of ' + max" />
```

```ts live example=basic framework=angular
template: `<hw-rating label="Rate this service" name="service-rating" [value]="3" [getRatingLabel]="(value, max) => value + ' of ' + max" />`
```

## Variants and states

### Display of a score

RatingDisplay shows an aggregate score as a single image with one text alternative, which `getValueLabel` returns. It has no radio buttons, no focus stop and no form value. A fraction fills part of a star, and the optional visible score is hidden from assistive technology to avoid repeating the alternative.

```html live example=display static
<div class="hw-rating-display" role="img" aria-label="Rated 3.5 out of 5">
  <span class="hw-rating-stars" aria-hidden="true">
    <span class="hw-rating-star">★<span class="hw-rating-fill" style="--hw-rating-fill: 100%"></span></span>
    <span class="hw-rating-star">★<span class="hw-rating-fill" style="--hw-rating-fill: 100%"></span></span>
    <span class="hw-rating-star">★<span class="hw-rating-fill" style="--hw-rating-fill: 100%"></span></span>
    <span class="hw-rating-star">★<span class="hw-rating-fill" style="--hw-rating-fill: 50%"></span></span>
    <span class="hw-rating-star">★<span class="hw-rating-fill" style="--hw-rating-fill: 0%"></span></span>
  </span>
  <span class="hw-rating-score" aria-hidden="true">3.5/5</span>
</div>
```

```tsx live example=display
<RatingDisplay value={3.5} getValueLabel={(value, max) => 'Rated ' + value + ' out of ' + max} />
```

```vue live example=display
<RatingDisplay :value="3.5" :get-value-label="(value, max) => 'Rated ' + value + ' out of ' + max" />
```

```ts live example=display framework=angular
template: `<hw-rating-display [value]="3.5" [getValueLabel]="(value, max) => 'Rated ' + value + ' out of ' + max" />`
```

### Required with an error

A required group takes one marker after its legend. An error is shown after the stars and describes what the reader should do.

```html live example=error static differences=rating-adapter-markup,rating-angular-radio-names,rating-react-error-height
<fieldset class="hw-field hw-rating" data-hw="rating" aria-describedby="error-rating-error" aria-invalid="true">
  <legend class="hw-label">Rate this service<span class="hw-required-marker" aria-hidden="true"> *</span></legend>
  <label><input type="radio" name="error-rating" value="1" aria-label="1 of 5" required><span aria-hidden="true">★</span></label>
  <label><input type="radio" name="error-rating" value="2" aria-label="2 of 5" required><span aria-hidden="true">★</span></label>
  <label><input type="radio" name="error-rating" value="3" aria-label="3 of 5" required><span aria-hidden="true">★</span></label>
  <label><input type="radio" name="error-rating" value="4" aria-label="4 of 5" required><span aria-hidden="true">★</span></label>
  <label><input type="radio" name="error-rating" value="5" aria-label="5 of 5" required><span aria-hidden="true">★</span></label>
  <p class="hw-error" id="error-rating-error">Choose a rating before you send the form.</p>
</fieldset>
```

```tsx live example=error
<Rating label="Rate this service" name="error-rating" required getRatingLabel={(value, max) => value + ' of ' + max} error="Choose a rating before you send the form." />
```

```vue live example=error
<Rating label="Rate this service" name="error-rating" required :get-rating-label="(value, max) => value + ' of ' + max" error="Choose a rating before you send the form." />
```

```ts live example=error framework=angular
template: `<hw-rating label="Rate this service" name="error-rating" [required]="true" [getRatingLabel]="(value, max) => value + ' of ' + max" error="Choose a rating before you send the form." />`
```

## API

### JavaScript

Table: Options of createRating

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `onValueChange` | `(value: number) => void` | `false` | — |

`createRating` enhances a `fieldset` with the class `hw-rating` that holds native radio buttons with integer values in ascending order, each in a `label` with a decorative star; the same enhancement runs for `data-hw="rating"` through `enhance()`. An editable rating works without script, because the radio buttons own the value, the `required` validation and the reset. The controller adds read-only behaviour, which HTML radio buttons do not have: with `data-hw-readonly="true"` it blocks changes and keeps the focus and the submission of the checked value. It returns `value`, the checked number, and `destroy()`, and `onValueChange` receives the new value. A reset reports the value once when it changed it. The vanilla option has no published default. Write the name of each radio button as `aria-label`, and keep the labels as siblings without reversing the order for right-to-left text. A score that is not an input is the markup `hw-rating-display` of the second example, with `hw-rating-stars`, `hw-rating-star`, `hw-rating-fill` and `hw-rating-score`, and needs no controller.

### React

Table: Props of Rating and RatingDisplay

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `value` | `number` | `false` | — |
| `defaultValue` | `number` | `false` | `0` |
| `onValueChange` | `(value: number) => void` | `false` | — |
| `max` | `number` | `false` | `5` |
| `name` | `string` | `false` | — |
| `form` | `string` | `false` | — |
| `required` | `boolean` | `false` | — |
| `readOnly` | `boolean` | `false` | — |
| `getRatingLabel` | `(value: number, max: number) => string` | `true` | — |
| `label` | `ReactNode` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |
| `RatingDisplay value` | `number` | `false` | `0` |
| `RatingDisplay max` | `number` | `false` | `5` |
| `RatingDisplay showValue` | `boolean` | `false` | `true` |
| `RatingDisplay getValueLabel` | `(value: number, max: number) => string` | `true` | — |

Rating accepts the props of a native `fieldset` element besides those in the table. Use `value` with `onValueChange` for a controlled rating, or `defaultValue` for an uncontrolled one; the value is a whole number, and a fraction is rounded down. `getRatingLabel` is required and returns the whole accessible name of each radio button from its value and `max`. `readOnly` keeps the radio buttons focusable, sets `aria-disabled` on them and blocks the pointer and the selection keys. `RatingDisplay` is a separate component: `getValueLabel` is required and returns the whole text alternative, `showValue` set to `false` hides only the visible score, and it has no `label`.

### Vue

Table: Props, events and slots of Rating and RatingDisplay

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `defaultValue` | prop | `number` | `false` | `0` |
| `max` | prop | `number` | `false` | `5` |
| `getRatingLabel` | prop | `(value: number, max: number) => string` | `true` | — |
| `modelValue` | prop | `number` | `false` | — |
| `min` | prop | `number` | `false` | `0` |
| `step` | prop | `number` | `false` | `1` |
| `disabled` | prop | `boolean` | `false` | `false` |
| `readonly` | prop | `boolean` | `false` | `false` |
| `label` | prop | `string` | `false` | — |
| `hint` | prop | `string` | `false` | — |
| `error` | prop | `string` | `false` | — |
| `required` | prop | `boolean` | `false` | — |
| `update:modelValue` | event | `(value: number) => void` | `false` | — |
| `RatingDisplay value` | prop | `number` | `false` | `0` |
| `RatingDisplay max` | prop | `number` | `false` | `5` |
| `RatingDisplay showValue` | prop | `boolean` | `false` | `true` |
| `RatingDisplay getValueLabel` | prop | `(value: number, max: number) => string` | `false` | — |

`v-model` binds the whole number, and `defaultValue` sets the initial value of an uncontrolled rating. The published build of Rating applies `0` for `defaultValue` and `5` for `max`; `min` and `step` are declared but the build does not read them. `getRatingLabel` is required and returns the whole accessible name of each radio button. `readonly` keeps the radio buttons focusable, sets `aria-disabled` on them and blocks the pointer and the selection keys; `disabled` disables the group. The other attributes, such as `name` and `form`, are written on the `fieldset`. `RatingDisplay` is a separate component: its `getValueLabel` is read when the element has no `aria-label` or `aria-labelledby`, and `showValue` set to `false` hides only the visible score. The published declaration types no slot and the published build reads none.

### Angular

Table: Inputs, outputs and content of hw-rating and hw-rating-display

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
| `max` | input | `number` | `false` | `5` |
| `getRatingLabel` | input | `(value: number, max: number) => string` | `true` | — |
| `valueChange` | output | `number` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |
| `hw-rating-display value` | input | `number` | `false` | `0` |
| `hw-rating-display max` | input | `number` | `false` | `5` |
| `hw-rating-display showValue` | input | `boolean` | `false` | `true` |
| `hw-rating-display getValueLabel` | input | `(value: number, max: number) => string` | `true` | — |

`HwRatingComponent` (`hw-rating`) renders the group of radio buttons, the legend, the hint and the error. Bind `[(value)]` for the whole number; the component also works as a form control through its value accessor. `getRatingLabel` is required and returns the whole accessible name of each radio button. `readOnly` keeps the radio buttons focusable and blocks changes, without disabling the group. `HwRatingDisplayComponent` (`hw-rating-display`) is a separate component: `getValueLabel` is required and returns the whole text alternative, and `showValue` set to `false` hides only the visible score.

## Accessibility

Rating is a native radio group in a `fieldset`: the legend names the group, each radio button has its own name from `getRatingLabel`, and the browser provides the focus order, the selection and the form value. The star glyphs are hidden from assistive technology, so the names of the radio buttons are the only text a reader of a screen reader hears for the stars; Angular writes each name as visually hidden text inside the label instead of `aria-label`.

Table: Keyboard interaction of Rating

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves focus into the group on the checked star, or the first star when none is checked, and out of the group. |
| <kbd>Right Arrow</kbd>, <kbd>Left Arrow</kbd>, <kbd>Down Arrow</kbd>, <kbd>Up Arrow</kbd> | Moves the focus and the selection to the next or the previous star in reading order, wrapping at the ends, as in a native radio group. |
| <kbd>Space</kbd> | Selects the focused star when it is not selected. |

- A read-only rating keeps its radio buttons focusable and blocks the arrow keys and Space; Tab and Shift with Tab stay native.
- Pointing at a star on a device with hover previews the range up to it; the preview changes no form data and emits no change.
- RatingDisplay is one image with a single text alternative. Its stars and its visible score are hidden from assistive technology, and it adds no focus stop.
- A form reset restores the default value.

## RTL and localisation

Rating and RatingDisplay have no built-in text: the legend, the hint, the error and the text of every star are written by the application in the language of the page. The stars fill from the inline start, whatever the language, so the order of the radio buttons stays the same in the markup in both directions.

- Do not reverse the order of the elements for right-to-left text; the inherited direction places them.
- The values of the radio buttons are Latin digits; write the digits of the accessible names in the numerals of the page.
- `getRatingLabel` and `getValueLabel` return the whole text, so the application controls the order of the value and the maximum in each language.
- Rating takes a maximum from 1 to 20, and the value is clamped between 0 and the maximum; a value that is not finite becomes 0.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Rating; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The star size, the gap, the empty and filled colours and the transitions of the supplied Platforms Code style sheet are mapped in the [rating notes](../nic-rating.md), with the confidence of each mapping; the notes record that the supplied script has no rating implementation.
- The rating notes also state that selection steps, server aggregation and submission are not established by the supplied files, so Rating keeps a native radio group and RatingDisplay stays non-interactive.
