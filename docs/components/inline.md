# Inline

Inline arranges its children in one row with shared spacing and alignment, and wraps them onto further rows when the row is full. It is a layout primitive without behaviour of its own, and its host is the element that takes the class `hw-inline`.

## Example

An inline holds related controls or short items that read as one group, such as the actions of a form. The children follow each other in source order along the row, with the same space between every pair, and they are centred on the cross axis.

```html live example=basic static differences=inline-vue-layout-attributes
<div class="hw-inline">
  <button class="hw-button" type="button" data-variant="primary" data-size="md">Submit the request</button>
  <button class="hw-button" type="button" data-variant="secondary" data-size="md">Save as draft</button>
</div>
```

```tsx live example=basic
<Inline>
  <Button variant="primary">Submit the request</Button>
  <Button variant="secondary">Save as draft</Button>
</Inline>
```

```vue live example=basic
<Inline>
  <Button variant="primary">Submit the request</Button>
  <Button variant="secondary">Save as draft</Button>
</Inline>
```

```ts live example=basic framework=angular
template: `<hw-inline>
  <button hwButton variant="primary">Submit the request</button>
  <button hwButton variant="secondary">Save as draft</button>
</hw-inline>`
```

## Variants and states

### Gap

`gap` sets the space between the children. The number 6 is the spacing token 6, a larger space than the default token 4. The React, Vue and Angular adapters write the value as a custom property on the element of the inline, and the markup of the JavaScript block writes the same custom property in a style attribute.

```html live example=gap static differences=inline-vue-layout-attributes
<div class="hw-inline" style="--hw-layout-gap: var(--hw-space-6, 1.5rem)">
  <button class="hw-button" type="button" data-variant="primary" data-size="md">Submit the request</button>
  <button class="hw-button" type="button" data-variant="secondary" data-size="md">Save as draft</button>
</div>
```

```tsx live example=gap
<Inline gap={6}>
  <Button variant="primary">Submit the request</Button>
  <Button variant="secondary">Save as draft</Button>
</Inline>
```

```vue live example=gap
<Inline :gap="6">
  <Button variant="primary">Submit the request</Button>
  <Button variant="secondary">Save as draft</Button>
</Inline>
```

```ts live example=gap framework=angular
template: `<hw-inline [gap]="6">
  <button hwButton variant="primary">Submit the request</button>
  <button hwButton variant="secondary">Save as draft</button>
</hw-inline>`
```

### Distribution

`justify` distributes the children along the row. With `between`, the first child stands at the start of the row and the last at its end, with the free space between them; without a value the children stand together at the start.

```html live example=justify static differences=inline-vue-layout-attributes
<div class="hw-inline" style="--hw-layout-justify: space-between">
  <span>Request 2041</span>
  <button class="hw-button" type="button" data-variant="secondary" data-size="md">View details</button>
</div>
```

```tsx live example=justify
<Inline justify="between">
  <span>Request 2041</span>
  <Button variant="secondary">View details</Button>
</Inline>
```

```vue live example=justify
<Inline justify="between">
  <span>Request 2041</span>
  <Button variant="secondary">View details</Button>
</Inline>
```

```ts live example=justify framework=angular
template: `<hw-inline justify="between">
  <span>Request 2041</span>
  <button hwButton variant="secondary">View details</button>
</hw-inline>`
```

### Without wrapping

An inline wraps its children onto further rows by default. With `wrap` set to false, the children stay in one row and the row does not break, so use it only for a few short items that fit the narrowest width of the page.

```html live example=nowrap static differences=inline-vue-layout-attributes
<div class="hw-inline" style="--hw-layout-wrap: nowrap">
  <button class="hw-button" type="button" data-variant="primary" data-size="md">Submit</button>
  <button class="hw-button" type="button" data-variant="secondary" data-size="md">Save</button>
</div>
```

```tsx live example=nowrap
<Inline wrap={false}>
  <Button variant="primary">Submit</Button>
  <Button variant="secondary">Save</Button>
</Inline>
```

```vue live example=nowrap
<Inline :wrap="false">
  <Button variant="primary">Submit</Button>
  <Button variant="secondary">Save</Button>
</Inline>
```

```ts live example=nowrap framework=angular
template: `<hw-inline [wrap]="false">
  <button hwButton variant="primary">Submit</button>
  <button hwButton variant="secondary">Save</button>
</hw-inline>`
```

## API

### JavaScript

Table: Attributes of the hw-inline element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-inline'` | `true` | — |

> [!NOTE]
> These classes and attributes are read from the published stylesheet and are outside the stable contract of 0.3.0.

Inline has no JavaScript controller. The markup is the API: write an element with the class `hw-inline` and place the children directly inside it. The default space between children is the space token 4 of `@hawiyah/tokens`. The scoped custom properties of the stylesheet that the adapters write set another gap, another distribution or the wrapping of one inline; they are scoped layout properties and not global design tokens. The class `hw-inline` is outside the stylesheet contract of 0.3.0, so its table is read from the published stylesheet.

### React

Table: Props of Inline

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `gap` | `Responsive<LayoutSpacing>` | `false` | — |
| `padding` | `Responsive<LayoutSpacing>` | `false` | — |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch' \| 'baseline'` | `false` | — |
| `justify` | `'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly'` | `false` | — |
| `wrap` | `boolean` | `false` | — |
| `columns` | `Responsive<number>` | `false` | — |
| `minItemWidth` | `string` | `false` | — |
| `side` | `'start' \| 'end'` | `false` | — |
| `sidebarWidth` | `string` | `false` | — |
| `collapseAt` | `'sm' \| 'md' \| 'lg'` | `false` | — |
| `maxWidth` | `string` | `false` | — |
| `ratio` | `number` | `false` | — |

Inline always renders a `div`; it has no prop that chooses another element. It accepts the shared layout props of the layout primitives together with the attributes of a `div`. `gap` and `padding` take a spacing token from 0 to 16 or a CSS length, and both accept a responsive object with the steps `base`, `sm`, `md`, `lg` and `xl`. `align` sets the cross-axis alignment and `justify` distributes the children along the row. `wrap` set to `false` keeps the children in one row, and the row wraps without it. The stylesheet reads none of `columns`, `minItemWidth`, `side`, `sidebarWidth`, `collapseAt`, `maxWidth` and `ratio`, which belong to other primitives. Without a value, every default comes from the stylesheet: a gap of the space token 4, no padding, `align` `center`, `justify` `start` and wrapping, so the table shows an em dash for each.

### Vue

Table: Props, events and slots of Inline

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `as` | prop | `string` | `false` | `'div'` |
| `gap` | prop | `LayoutProps['gap']` | `false` | — |
| `padding` | prop | `LayoutProps['padding']` | `false` | — |
| `align` | prop | `'start' \| 'center' \| 'end' \| 'stretch' \| 'baseline'` | `false` | — |
| `justify` | prop | `'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly'` | `false` | — |
| `wrap` | prop | `boolean` | `false` | — |
| `columns` | prop | `LayoutProps['columns']` | `false` | — |
| `minItemWidth` | prop | `string` | `false` | — |
| `side` | prop | `'start' \| 'end'` | `false` | `'start'` |
| `sidebarWidth` | prop | `string` | `false` | — |
| `collapseAt` | prop | `'sm' \| 'md' \| 'lg'` | `false` | `'md'` |
| `maxWidth` | prop | `string` | `false` | — |
| `ratio` | prop | `number` | `false` | — |
| `default` | slot | — | `false` | — |

The default slot holds the children. `as` sets the element that Inline renders, a `div` unless another tag is given, so a row of related items can be a `ul` with `li` children. `gap`, `padding`, `align`, `justify` and `wrap` have the meaning they have in React, and the other layout props are accepted for the shared contract but are not read by the Inline styles. Inline always writes `data-side` and `data-collapse-at` on its element, with the defaults of `side` and `collapseAt`, and the stylesheet does not read them. Attributes and listeners that Inline does not declare reach the rendered element. `wrap` has no default and is absent unless it is set, so the row wraps without it.

### Angular

Table: Inputs, outputs and content of hw-inline

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `gap` | input | `Responsive<LayoutSpacing>` | `false` | — |
| `padding` | input | `Responsive<LayoutSpacing>` | `false` | — |
| `align` | input | `'start' \| 'center' \| 'end' \| 'stretch' \| 'baseline'` | `false` | — |
| `justify` | input | `'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly'` | `false` | — |
| `wrap` | input | `boolean` | `false` | — |
| `columns` | input | `Responsive<number>` | `false` | — |
| `minItemWidth` | input | `string` | `false` | — |
| `maxWidth` | input | `string` | `false` | — |
| `sidebarWidth` | input | `string` | `false` | — |
| `ratio` | input | `number` | `false` | — |
| `*` | content | — | `false` | — |

`HwInlineComponent` applies to `hw-inline`. The host element is the box: it carries the class `hw-inline` and the layout custom properties, its template is the projected content alone, and the projected elements are its direct children. Class, id, ARIA and data attributes written on `hw-inline` therefore sit on the element that the stylesheet styles. The attribute selector `[hwInline]` of the same component applies the same box to a native element, which keeps its tag, for example a `ul`. `gap`, `padding`, `align`, `justify` and `wrap` have the meaning they have in React; the other inputs exist for the shared contract and are not read by the Inline styles. `wrap` is a boolean, the bare attribute means true, and an unset input writes nothing.

## Accessibility

Inline is a layout container. The React component renders a `div`; the Vue component renders a `div` or the element that `as` names; the Angular element `hw-inline` renders itself, and the `[hwInline]` form keeps the native element it is written on. In every form Inline adds no role, no name and no focusable element, so the semantics of the page come from its children.

- The visual order is the source order. The stylesheet sets a row without reversing or reordering it, and a child that wraps onto the next row follows the previous one, so write the children in the order in which they are read and focused.
- Inline has no keyboard interaction of its own, and <kbd>Tab</kbd> moves between the focusable children as it does outside an inline.
- Inline gives no accessible name. A group of controls that assistive technology must announce as a group needs a native element with its own name, such as a `fieldset` with a `legend`, or an element with `role="group"` and an `aria-label`.
- A list of items is a native `ul` or `ol`. In Vue, `as` renders the inline as that element, and in Angular the `[hwInline]` form does the same; in React and in the vanilla markup, give the list element the class `hw-inline`. A list placed inside an inline is one child of it, so its items are not arranged in the row.

> [!NOTE]
> Inline changes the layout, not the meaning. A set of actions that is a toolbar, a list or a group of options keeps its own native markup. When the items themselves form the row, the element carries the inline (the `as` prop, the `[hwInline]` form or the class `hw-inline`); a toolbar or group that is one item among others sits inside the inline.

## RTL and localisation

Inline has no built-in text. Every child is written by the application in the language of the page. The inline inherits the language and the direction of the page, and the packaged styles use logical properties.

- The row runs from the reading start, so the first child stands at the right edge in a right-to-left page and at the left edge in a left-to-right page. Write the children in reading order and the row follows the direction.
- The `start` and `end` values of `justify` follow the direction of the page, and so does the `between` distribution, which keeps the first child at the reading start.
- The gap and the padding are the same in Arabic and in English; no adapter changes the layout by language.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Inline; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- Inline is a layout primitive of Hawiyah, listed among the layout primitives of the component scope in the [coverage notes](../coverage.md). The [layout notes](../layout.md) list only container and service-template dimensions of the supplied Platforms Code files and name no component that Inline maps, so the page claims no mapping of the component itself.
- The table of primitives in the [layout notes](../layout.md) describes Inline as the primitive for actions, metadata and wrapping controls, a flex row with centered alignment and wrapping; this is guidance of the library and not a mapping to the Platforms Code. The default gap and the spacing tokens come from the semantic tokens that the other components use, as the [layout notes](../layout.md) describe; the layout notes also state that layout is CSS-driven and does not measure the viewport in JavaScript.
