# Stat

Stat shows one labelled value with optional supporting context: a description and a trend. It suits a figure that a reader scans, such as the number of requests in a period.

## Example

The label names the figure, the value is the figure, the description gives its period and the trend states a change. The component prints the value as given and does not format it.

```html live example=basic
<div class="hw-stat">
  <span class="hw-stat-label">Completed requests</span>
  <strong class="hw-stat-value">128</strong>
  <p class="hw-stat-description">This month</p>
  <span class="hw-stat-trend" data-tone="success">12% more than last month</span>
</div>
```

```tsx live example=basic
<Stat
  label="Completed requests"
  value="128"
  description="This month"
  trend="12% more than last month"
  trendTone="success"
/>
```

```vue live example=basic
<Stat
  label="Completed requests"
  value="128"
  description="This month"
  trend="12% more than last month"
  trend-tone="success"
/>
```

```ts live example=basic framework=angular
template: `<hw-stat
  label="Completed requests"
  value="128"
  description="This month"
  trend="12% more than last month"
  trendTone="success"
/>`
```

## Variants and states

### Tone

The tone sets the colour of the value: `success` or `danger`, while `neutral` leaves the default colour. The colour of the trend is set separately, by the tone of the trend. Use `danger` for a figure that needs attention, and state in the label or the description why it does, because colour alone does not say so.

```html live example=tone
<div class="hw-stat" data-tone="danger">
  <span class="hw-stat-label">Overdue requests</span>
  <strong class="hw-stat-value">7</strong>
  <p class="hw-stat-description">Waiting for a reply for more than 5 days</p>
  <span class="hw-stat-trend" data-tone="danger">2 more than last week</span>
</div>
```

```tsx live example=tone
<Stat
  label="Overdue requests"
  value="7"
  description="Waiting for a reply for more than 5 days"
  trend="2 more than last week"
  tone="danger"
  trendTone="danger"
/>
```

```vue live example=tone
<Stat
  label="Overdue requests"
  value="7"
  description="Waiting for a reply for more than 5 days"
  trend="2 more than last week"
  tone="danger"
  trend-tone="danger"
/>
```

```ts live example=tone framework=angular
template: `<hw-stat
  label="Overdue requests"
  value="7"
  description="Waiting for a reply for more than 5 days"
  trend="2 more than last week"
  tone="danger"
  trendTone="danger"
/>`
```

### Plain

The plain variant removes the border and the padding of the stat, so it can stand inside a card or another container that already frames it. This stat has no trend.

```html live example=plain
<div class="hw-stat" data-variant="plain">
  <span class="hw-stat-label">Open requests</span>
  <strong class="hw-stat-value">24</strong>
  <p class="hw-stat-description">Across all services</p>
</div>
```

```tsx live example=plain
<Stat
  label="Open requests"
  value="24"
  description="Across all services"
  variant="plain"
/>
```

```vue live example=plain
<Stat
  label="Open requests"
  value="24"
  description="Across all services"
  variant="plain"
/>
```

```ts live example=plain framework=angular
template: `<hw-stat
  label="Open requests"
  value="24"
  description="Across all services"
  variant="plain"
/>`
```

## API

### JavaScript

Table: Attributes of the hw-stat element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-stat'` | `true` | — |
| `data-tone` | `'danger' \| 'success'` | `false` | — |
| `data-variant` | `'plain'` | `false` | — |

> [!NOTE]
> These classes and attributes are read from the published stylesheet and are outside the stable contract of 0.3.0.

Stat has no JavaScript controller. The markup is the API: write an element with the class `hw-stat` and, in this order, a `span` with the class `hw-stat-label`, a `strong` with the class `hw-stat-value`, an optional `p` with the class `hw-stat-description` and an optional `span` with the class `hw-stat-trend`. There is no `dl`, which earlier markup of Stat used. The `data-tone` attribute on the root is `success` or `danger`, and the vanilla README adds `neutral` for the root; on the trend it is `success` or `danger`. The `data-variant` attribute takes `plain`.

### React

Table: Props of Stat

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `label` | `ReactNode` | `true` | — |
| `value` | `ReactNode` | `true` | — |
| `description` | `ReactNode` | `false` | — |
| `trend` | `ReactNode` | `false` | — |
| `tone` | `'neutral' \| 'success' \| 'danger'` | `false` | — |
| `variant` | `'plain'` | `false` | — |
| `trendTone` | `'success' \| 'danger'` | `false` | — |

The `label` and `value` props are required. All four content props take nodes, so the value and the trend can hold rich content, such as an amount with its hidden currency name. The values are formatted by the caller: the component prints them as given. The `trendTone` prop sets the tone of the trend, and `tone` sets the colour of the value.

### Vue

Table: Props, events and slots of Stat

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `label` | prop | `string` | `true` | — |
| `value` | prop | `string \| number` | `false` | — |
| `description` | prop | `string` | `false` | — |
| `trend` | prop | `string` | `false` | — |
| `tone` | prop | `'neutral' \| 'success' \| 'danger'` | `false` | — |
| `variant` | prop | `'plain'` | `false` | — |
| `trendTone` | prop | `'success' \| 'danger'` | `false` | — |
| `value` | slot | — | `false` | — |
| `trend` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |

The `label` prop is required, and the `value` prop prints a string or a number as given; the component does not format numbers and has no locale option, so format the number in the application. The `value` and `trend` slots take rich content and win over the props of the same names. The `trendTone` prop is written on the trend, and `tone` on the stat.

### Angular

Table: Inputs, outputs and content of hw-stat

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `label` | input | `string` | `true` | — |
| `value` | input | `string \| number` | `false` | `''` |
| `description` | input | `string` | `false` | `''` |
| `trend` | input | `string` | `false` | `''` |
| `trendTone` | input | `'success' \| 'danger'` | `false` | — |
| `tone` | input | `'neutral' \| 'success' \| 'danger'` | `false` | — |
| `variant` | input | `'plain'` | `false` | — |
| `[hwStatValue]` | content | — | `false` | — |
| `[hwStatTrend]` | content | — | `false` | — |
| `*` | content | — | `false` | — |

`HwStatComponent` applies to `hw-stat`, and the host element is the stat itself. The `label` input is required. Rich content is projected with `[hwStatValue]` into the value and `[hwStatTrend]` into the trend; it is rendered after the string input, so pass one of the two for each region. The value and trend regions are always rendered, and the stylesheet hides an empty trend. Other content is added after the trend.

## Accessibility

Stat renders a label, a value, a description and a trend as plain elements: a `span`, a `strong`, a `p` and a `span`. It adds no role and no live region, and it is not interactive.

- The label comes first in the source, so a reader of assistive technology hears the label before the value. Write a label that names the figure on its own, such as "Completed requests".
- A tone and a trend tone are colour. State the meaning in words, in the label, the description or the trend, as in "2 more than last week", and do not rely on the colour.
- When a value changes after the page loads, the stat does not announce the change. Announce it with a status message of the application where a reader needs to know.
- A value with a currency symbol needs a text name for the symbol. Put the symbol in an element with `aria-hidden="true"` and a visually hidden currency name beside it, as the package READMEs show: in the `value` prop of React, in the `value` slot of Vue, in content projected with `[hwStatValue]` in Angular, and directly in the markup in JavaScript.

## RTL and localisation

Stat has no built-in text and does not format numbers. The label, the value, the description and the trend are written by the application in the language of the page, and the stat follows the page direction through logical properties.

- Format the value in the application for its locale, including digits, grouping and units, because Stat prints the value as given. The core package offers `formatNumber` for this.
- Keep a value that must stay in one script, such as an amount, inside a `bdi` element, as the package READMEs do for an amount.
- Write the trend as a complete phrase in the language of the page.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Stat; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- Stat is listed among the additional content components of the component scope in the [coverage notes](../coverage.md). The notes record no separate note for it.
- The display of an amount with the riyal symbol, which Stat accepts as rich content, is described in the [Saudi riyal notes](../saudi-riyal.md).
