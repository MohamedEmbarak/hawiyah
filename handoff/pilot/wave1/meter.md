# Meter

Meter shows a scalar measurement within a known range, such as the share of a quota that is used. It renders a native `meter` element with the Hawiyah styles and has no visible label of its own.

## Example

The meter is named by an accessible name, because it renders no visible label. In React, Vue and Angular the range defaults to 0 to 100, so a value of 40 shows a bar that is 40 per cent full; the vanilla markup writes the bounds itself, because a native `meter` defaults to a range of 0 to 1.

```html live example=basic
<meter class="hw-meter" aria-label="Storage used for documents" min="0" max="100" value="40"></meter>
```

```tsx live example=basic
<Meter label="Storage used for documents" value={40} />
```

```vue live example=basic
<Meter label="Storage used for documents" :value="40" />
```

```ts live example=basic framework=angular
template: `<hw-meter label="Storage used for documents" [value]="40" />`
```

## Variants and states

### Range

`min` and `max` set the bounds of the scale, and the bar shows the position of `value` within them. Use bounds that match the quantity, such as the number of pages of an application that are complete.

```html live example=range
<meter class="hw-meter" aria-label="Pages of the application completed" min="0" max="5" value="3"></meter>
```

```tsx live example=range
<Meter label="Pages of the application completed" min={0} max={5} value={3} />
```

```vue live example=range
<Meter label="Pages of the application completed" :min="0" :max="5" :value="3" />
```

```ts live example=range framework=angular
template: `<hw-meter label="Pages of the application completed" [min]="0" [max]="5" [value]="3" />`
```

### Regions

`low`, `high` and `optimum` divide the scale into regions. The packaged styles colour the bar by the region that holds the value and by the region of `optimum` in browsers that draw the native meter through the WebKit and Blink pseudo-elements: success in the optimum region, warning in the suboptimum region and danger in the region furthest from it. For Firefox the styles set the bar to the primary colour, so there the bar does not change colour with the region. Here a high value is the unfavourable one, so `optimum` lies in the low region.

```html live example=regions
<meter class="hw-meter" aria-label="Attachment space used" min="0" max="100" value="85" low="30" high="70" optimum="10"></meter>
```

```tsx live example=regions
<Meter label="Attachment space used" min={0} max={100} value={85} low={30} high={70} optimum={10} />
```

```vue live example=regions
<Meter label="Attachment space used" :min="0" :max="100" :value="85" :low="30" :high="70" :optimum="10" />
```

```ts live example=regions framework=angular
template: `<hw-meter label="Attachment space used" [min]="0" [max]="100" [value]="85" [low]="30" [high]="70" [optimum]="10" />`
```

## API

### JavaScript

Table: Attributes of the hw-meter element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-meter'` | `true` | — |

> [!NOTE]
> These classes and attributes are read from the published stylesheet and are outside the stable contract of 0.3.0.

Meter has no JavaScript controller. The markup is the API: write a native `meter` element with the class `hw-meter`, an accessible name in `aria-label` or `aria-labelledby`, and the native attributes `min`, `max` and `value`. Write the threshold attributes of the native element, described under Regions, only when the application has them. Without them the bar keeps the colour of the optimum region at every value. The stylesheet defines no size or variant attribute for the meter, and the vanilla package leaves a value above `max` as authored.

### React

Table: Props of Meter

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `label` | `string` | `false` | — |

Meter also accepts the props of a native meter element, including `value`, `min`, `max`, `low`, `high`, `optimum` and `ref`; they reach the element. `min` defaults to 0, `max` to 100 and `value` to 0, and `low`, `high` and `optimum` are written only when given. The meter has no visible label: `label` is its accessible name, and it is required unless `aria-label` or `aria-labelledby` is passed. There is no size prop.

### Vue

Table: Props, events and slots of Meter

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `label` | prop | `string` | `false` | — |
| `value` | prop | `number` | `false` | `0` |
| `min` | prop | `number` | `false` | `0` |
| `max` | prop | `number` | `false` | `100` |
| `low` | prop | `number` | `false` | — |
| `high` | prop | `number` | `false` | — |
| `optimum` | prop | `number` | `false` | — |

`value` defaults to 0, `min` to 0 and `max` to 100. `low`, `high` and `optimum` have no default and are written on the native element only when given. `label` is the accessible name and is required unless `aria-label` or `aria-labelledby` is passed as an attribute; there is no visible label and no size prop. Meter reads no slot and emits no event.

### Angular

Table: Inputs, outputs and content of hw-meter

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `label` | input | `string` | `false` | `''` |
| `value` | input | `number` | `false` | `0` |
| `min` | input | `number` | `false` | `0` |
| `max` | input | `number` | `false` | `100` |
| `low` | input | `number` | `false` | — |
| `high` | input | `number` | `false` | — |
| `optimum` | input | `number` | `false` | — |

`HwMeterComponent` applies to `hw-meter` and renders one native `meter` element inside the host, without fallback text and without a visible label. `label` is the accessible name and is required unless `aria-label` or `aria-labelledby` is written on `hw-meter`. `low`, `high` and `optimum` have no default, so without them the bar has the optimum colour at every value; add them to keep the coloured regions. There is no size input.

## Accessibility

Meter is a native `meter` element, so the browser provides its role and exposes the value and the bounds to assistive technology. The element renders no visible label, so every meter needs an accessible name from `aria-label`, from `aria-labelledby` or, in React, Vue and Angular, from `label`.

- Name the quantity, not the number: "Storage used for documents" rather than "40".
- The meter is not interactive and takes no focus.
- To show a visible label or the value as text, write them in the page next to the meter and point `aria-labelledby` at the label. The meter does not show its own value as text.
- The regions that `low`, `high` and `optimum` set change the colour of the bar only. Do not rely on the colour alone: state a result such as "almost full" in the text of the page.
- Use Progress, not Meter, for the advance of a task; a meter shows a measurement against a known scale.

## RTL and localisation

Meter has no built-in text. Its name is written by the application in the language of the page, and the element inherits the language and the direction of the page. The bar fills in the direction that the browser draws the native `meter` element for the inherited direction; the stylesheet sets no fill direction of its own.

- Write numerals and units in the text next to the meter in the form that the application uses for the language of the page. The attributes `value`, `min`, `max`, `low`, `high` and `optimum` are numbers, independent of the display.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Meter; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- Meter is listed among the additional content and the native components of the component scope in the [coverage notes](../coverage.md). The notes list it as an example of the Native implementation type, where browser semantics provide the main interaction, and Meter relies on the native `meter` element.
