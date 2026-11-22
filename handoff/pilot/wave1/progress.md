# Progress

Progress is a native progress element with the Hawiyah styles. It shows how far a task has advanced, or that a task of unknown length is running, and it exposes its value to assistive technology through the native element.

## Example

The element has no visible label of its own, so the application gives it an accessible name with `aria-labelledby`, which points to the matching text shown next to it. The value and the maximum are written as given, and the browser reports the value as a share of the maximum.

```html live example=basic static
<div class="hw-stack">
  <p id="basic-text">Uploading your documents: 60 of 100 files</p>
  <progress class="hw-progress" aria-labelledby="basic-text" value="60" max="100"></progress>
</div>
```

```tsx live example=basic
<div className="hw-stack">
  <p id="basic-text">Uploading your documents: 60 of 100 files</p>
  <Progress aria-labelledby="basic-text" value={60} max={100} />
</div>
```

```vue live example=basic
<div class="hw-stack">
  <p id="basic-text">Uploading your documents: 60 of 100 files</p>
  <Progress aria-labelledby="basic-text" :value="60" :max="100" />
</div>
```

```ts live example=basic framework=angular
template: `<div class="hw-stack">
  <p id="basic-text">Uploading your documents: 60 of 100 files</p>
  <hw-progress aria-labelledby="basic-text" [value]="60" [max]="100" />
</div>`
```

## Variants and states

### Indeterminate

A progress element without a value is indeterminate: it shows a segment that moves along the inline axis while the length of the task is unknown. Give it a name that says what is running.

```html live example=indeterminate static
<progress class="hw-progress" aria-label="Checking your application"></progress>
```

```tsx live example=indeterminate
<Progress label="Checking your application" />
```

```vue live example=indeterminate
<Progress label="Checking your application" />
```

```ts live example=indeterminate framework=angular
template: `<hw-progress label="Checking your application" />`
```

### Size

`size` takes `sm` or `lg`. Without it the bar has the default height.

```html live example=sizes static
<div class="hw-stack">
  <progress class="hw-progress" aria-label="Profile completeness" value="40" max="100" data-size="sm"></progress>
  <progress class="hw-progress" aria-label="Application progress" value="75" max="100" data-size="lg"></progress>
</div>
```

```tsx live example=sizes
<div className="hw-stack">
  <Progress label="Profile completeness" value={40} size="sm" />
  <Progress label="Application progress" value={75} size="lg" />
</div>
```

```vue live example=sizes
<div class="hw-stack">
  <Progress label="Profile completeness" :value="40" size="sm" />
  <Progress label="Application progress" :value="75" size="lg" />
</div>
```

```ts live example=sizes framework=angular
template: `<div class="hw-stack">
  <hw-progress label="Profile completeness" [value]="40" size="sm" />
  <hw-progress label="Application progress" [value]="75" size="lg" />
</div>`
```

## API

### JavaScript

Table: Attributes of the hw-progress element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-progress'` | `true` | — |
| `data-size` | `'lg' \| 'sm'` | `false` | — |

Progress has no JavaScript controller. The markup is the API: write a native `progress` element with the class `hw-progress`, named by `aria-label` or `aria-labelledby`, because the element has no visible label of its own. `value` and `max` are native attributes: write both for a determinate bar, and omit `value` for an indeterminate one. A value above `max` is left as written and the browser shows a full bar. `data-size` is optional: `sm` and `lg` change the height, and without it the bar has the default height.

### React

Table: Props of Progress

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `size` | `'sm' \| 'lg'` | `false` | — |
| `label` | `string` | `false` | — |

Progress renders one native `progress` element with the class `hw-progress`, and it also accepts the props of a native `progress`, including `value` and `max`, which are written as given. `max` is written as 100 when it is not passed. Omit `value` for an indeterminate bar. `label` is the accessible name and is written to `aria-label`; pass `aria-label` or `aria-labelledby` instead where the application names the bar another way. With none of the three the component issues a warning in development builds. No visible label is rendered. `size` takes `sm` or `lg`.

### Vue

Table: Props, events and slots of Progress

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `label` | prop | `string` | `false` | — |
| `value` | prop | `number` | `false` | — |
| `max` | prop | `number` | `false` | `100` |
| `size` | prop | `'sm' \| 'lg'` | `false` | — |

Progress renders one native `progress` element with the class `hw-progress`. `value` and `max` are written as given, and `max` is 100 when it is not passed. Omit `value` for an indeterminate bar. `label` is the accessible name and is written to `aria-label`; pass `aria-label` or `aria-labelledby` instead where the application names the bar another way. With none of the three the component issues a warning in development builds. No visible label is rendered. `size` takes `sm` or `lg`. The published declaration types no slot, and the build reads none.

### Angular

Table: Inputs, outputs and content of hw-progress

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `label` | input | `string` | `false` | `''` |
| `value` | input | `number \| null` | `false` | `null` |
| `max` | input | `number` | `false` | `100` |
| `size` | input | `'sm' \| 'lg'` | `false` | — |

`HwProgressComponent` applies to `hw-progress` and renders one native `progress` element with the class `hw-progress` inside it. `value` and `max` are written as given, `max` is 100 when it is not set, and a `value` of `null` writes no value, so the bar is indeterminate. The component is named by `aria-label`, by `aria-labelledby` together with the text of the element it names, or by `label`; `aria-describedby` is written to the native element. With no name the component issues a warning in development builds. No visible label is rendered. `size` takes `sm` or `lg`.

## Accessibility

Progress is a native `progress` element, so the browser provides its role and exposes the current value and the maximum to assistive technology. The element has no visible label, so the application supplies its name and, where the reader needs the number, the visible text.

- Name every bar: use `aria-label`, or `aria-labelledby` that points to visible text that says what advances. In React, Vue and Angular `label` writes the accessible name.
- State the value in text next to the bar where the number matters, as the example does. The bar alone shows a proportion, not a quantity.
- The value is written as the application gives it; the component does not clamp or round it.
- An indeterminate bar has no value. The stylesheet moves its segment along the inline axis and shows static stripes when the reader asks for reduced motion.
- In forced colours the value is drawn with the system highlight colour.
- Progress does not announce changes. For a task whose result matters, supply a separate status message that states the outcome.

## RTL and localisation

Progress has no built-in text. The name and the text beside the bar are written by the application in the language of the page. The bar fills from the reading start, and the moving segment of an indeterminate bar travels along the inline axis, so both follow the page direction.

- Write the numbers beside the bar in the numerals of the page; the element writes the value as a number attribute and does not format it.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Progress; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- Progress is listed among the initial presentation components of the component scope in the [coverage notes](../coverage.md). The notes record no mapping of a supplied Platforms Code source for it.
- The one adaptation recorded for progress concerns dark mode: the Platforms Code dark palette gives the surface and the muted surface one value, so progress tracks use a step lighter than the surface. The README of `@hawiyah/styles` states the adaptation; the dark theme itself is resolved from the supplied semantic modes, as the [DGA reference notes](../dga-reference.md) describe.
