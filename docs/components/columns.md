# Columns

Columns arranges its children in explicit equal-width columns with shared spacing, and the number of columns can change with the width of the viewport. It is a layout primitive without behaviour of its own, and its host is the element that takes the class `hw-columns`.

## Example

Columns holds a few blocks of different content that stand side by side, such as the details of an applicant and the details of a request. `columns` sets the number of columns, and each child stands in one column, in source order.

```html live example=basic static differences=columns-vue-layout-attributes
<div class="hw-columns" style="--hw-layout-columns: 2">
  <p>Applicant: the name and the contact details written on the request.</p>
  <p>Request: a copy of a document, submitted on 4 March.</p>
</div>
```

```tsx live example=basic
<Columns columns={2}>
  <p>Applicant: the name and the contact details written on the request.</p>
  <p>Request: a copy of a document, submitted on 4 March.</p>
</Columns>
```

```vue live example=basic
<Columns :columns="2">
  <p>Applicant: the name and the contact details written on the request.</p>
  <p>Request: a copy of a document, submitted on 4 March.</p>
</Columns>
```

```ts live example=basic framework=angular
template: `<hw-columns [columns]="2">
  <p>Applicant: the name and the contact details written on the request.</p>
  <p>Request: a copy of a document, submitted on 4 March.</p>
</hw-columns>`
```

## Variants and states

### Responsive columns

`columns` takes an object with the steps `base`, `sm`, `md`, `lg` and `xl`. A step applies from the minimum viewport width of its name, and a missing step keeps the nearest smaller one. Here the columns stand in one column, in two from the `sm` step and in four from the `lg` step. The steps are viewport media queries of the stylesheet, so no script measures the page.

```html live example=responsive static differences=columns-vue-layout-attributes
<div class="hw-columns" style="--hw-layout-columns: 1; --hw-layout-columns-sm: 2; --hw-layout-columns-lg: 4">
  <p>Submitted on 4 March.</p>
  <p>Documents received on 6 March.</p>
  <p>Under review since 8 March.</p>
  <p>A decision is expected within five working days.</p>
</div>
```

```tsx live example=responsive
<Columns columns={{ base: 1, sm: 2, lg: 4 }}>
  <p>Submitted on 4 March.</p>
  <p>Documents received on 6 March.</p>
  <p>Under review since 8 March.</p>
  <p>A decision is expected within five working days.</p>
</Columns>
```

```vue live example=responsive
<Columns :columns="{ base: 1, sm: 2, lg: 4 }">
  <p>Submitted on 4 March.</p>
  <p>Documents received on 6 March.</p>
  <p>Under review since 8 March.</p>
  <p>A decision is expected within five working days.</p>
</Columns>
```

```ts live example=responsive framework=angular
template: `<hw-columns [columns]="{ base: 1, sm: 2, lg: 4 }">
  <p>Submitted on 4 March.</p>
  <p>Documents received on 6 March.</p>
  <p>Under review since 8 March.</p>
  <p>A decision is expected within five working days.</p>
</hw-columns>`
```

### Gap

`gap` sets the space between the columns and between the rows when they wrap. The number 8 is the spacing token 8, a larger space than the default token 4. The React, Vue and Angular adapters write the value as a custom property on the element of the columns, and the markup of the JavaScript block writes the same custom property in a style attribute.

```html live example=gap static differences=columns-vue-layout-attributes
<div class="hw-columns" style="--hw-layout-columns: 2; --hw-layout-gap: var(--hw-space-8, 2rem)">
  <p>Applicant: the name and the contact details written on the request.</p>
  <p>Request: a copy of a document, submitted on 4 March.</p>
</div>
```

```tsx live example=gap
<Columns columns={2} gap={8}>
  <p>Applicant: the name and the contact details written on the request.</p>
  <p>Request: a copy of a document, submitted on 4 March.</p>
</Columns>
```

```vue live example=gap
<Columns :columns="2" :gap="8">
  <p>Applicant: the name and the contact details written on the request.</p>
  <p>Request: a copy of a document, submitted on 4 March.</p>
</Columns>
```

```ts live example=gap framework=angular
template: `<hw-columns [columns]="2" [gap]="8">
  <p>Applicant: the name and the contact details written on the request.</p>
  <p>Request: a copy of a document, submitted on 4 March.</p>
</hw-columns>`
```

## API

### JavaScript

Table: Attributes of the hw-columns element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-columns'` | `true` | — |

> [!NOTE]
> These classes and attributes are read from the published stylesheet and are outside the stable contract of 0.3.0.

Columns has no JavaScript controller. The markup is the API: write an element with the class `hw-columns` and place the children directly inside it. Without a column count the columns stand in one column. The default space between children is the space token 4 of `@hawiyah/tokens`. The scoped custom properties of the stylesheet that the adapters write set the number of columns, the minimum item width and another gap on one columns box; they are scoped layout properties and not global design tokens. The class `hw-columns` is outside the stylesheet contract of 0.3.0, so its table is read from the published stylesheet. It shares its rule with the class `hw-grid` of [Grid](grid.md), so the same custom properties apply to both; choose the name that fits the content.

### React

Table: Props of Columns

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

Columns always renders a `div`; it has no prop that chooses another element. It accepts the shared layout props of the layout primitives together with the attributes of a `div`. `columns` is a positive integer or a responsive object with the steps `base`, `sm`, `md`, `lg` and `xl`, and `minItemWidth` is a CSS length that makes the columns fit as many columns as its width allows and takes precedence over `columns`. `gap` and `padding` take a spacing token from 0 to 16 or a CSS length, and both accept a responsive object. `align` sets the alignment of the items inside their cells, and `justify` is written as the CSS property justify-content, which has no visible effect on Columns in 0.3.0, because every column takes an equal share of the free width. The stylesheet reads none of `wrap`, `side`, `sidebarWidth`, `collapseAt`, `maxWidth` and `ratio`, which belong to other primitives. Without a value, every default comes from the stylesheet: one column, a gap of the space token 4, no padding, `align` `stretch` and `justify` `start`, so the table shows an em dash for each.

### Vue

Table: Props, events and slots of Columns

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

The default slot holds the children. `as` sets the element that Columns renders, a `div` unless another tag is given, so a set of related blocks can be a `ul` with `li` children. `columns`, `minItemWidth`, `gap`, `padding`, `align` and `justify` have the meaning they have in React, and the other layout props are accepted for the shared contract but are not read by the Columns styles. Columns always writes `data-side` and `data-collapse-at` on its element, with the defaults of `side` and `collapseAt`, and the stylesheet does not read them. Attributes and listeners that Columns does not declare reach the rendered element. `wrap` has no default and is absent unless it is set.

### Angular

Table: Inputs, outputs and content of hw-columns

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

`HwColumnsComponent` applies to `hw-columns`. The host element is the box: it carries the class `hw-columns` and the layout custom properties, its template is the projected content alone, and the projected elements are its direct children. Class, id, ARIA and data attributes written on `hw-columns` therefore sit on the element that the stylesheet styles. The attribute selector `[hwColumns]` of the same component applies the same box to a native element, which keeps its tag, for example a `ul`. `columns`, `minItemWidth`, `gap`, `padding`, `align` and `justify` have the meaning they have in React; the other inputs exist for the shared contract and are not read by the Columns styles. `columns` and `gap` accept the responsive object of React.

## Accessibility

Columns is a layout container. The React component renders a `div`; the Vue component renders a `div` or the element that `as` names; the Angular element `hw-columns` renders itself, and the `[hwColumns]` form keeps the native element it is written on. In every form Columns adds no role, no name and no focusable element, so the semantics of the page come from its children.

- The visual order is the source order. The stylesheet places the children row by row without reordering them, so write the children in the order in which they are read and focused, and expect the focus to move along a row and then to the next one.
- Columns has no keyboard interaction of its own, and <kbd>Tab</kbd> moves between the focusable children as it does outside a columns box.
- Columns gives no accessible name and does not announce rows or columns. Data that a reader compares by row and column is a native `table`, not a set of columns.
- A set of blocks that is a list is a native `ul` or `ol`. In Vue, `as` renders the columns as that element, and in Angular the `[hwColumns]` form does the same; in React and in the vanilla markup, give the list element the class `hw-columns`. A list placed inside a columns box is one child of it, so its list items are not arranged in columns.

> [!NOTE]
> Columns changes the layout, not the meaning. The number of columns depends on the width of the page, so write each child so that it reads on its own and does not depend on its position in a row.

## RTL and localisation

Columns has no built-in text. Every child is written by the application in the language of the page. The columns element inherits the language and the direction of the page, and the packaged styles use logical properties.

- The children fill each row from the reading start, so the first child stands at the right edge in a right-to-left page and at the left edge in a left-to-right page. Write the children in reading order and the columns follow the direction.
- The steps of a responsive `columns` object are viewport widths, and the gap and the padding are the same in Arabic and in English; no adapter changes the layout by language.
- A child whose text is longer in one language wraps inside its column, and the columns stay equal in width.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Columns; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- Columns is a layout primitive of Hawiyah, listed among the layout primitives of the component scope in the [coverage notes](../coverage.md). The [layout notes](../layout.md) list only container and service-template dimensions of the supplied Platforms Code files and name no component that Columns maps, so the page claims no mapping of the component itself.
- The default gap, the spacing tokens and the steps of the responsive objects come from the layout contract of Hawiyah, as the [layout notes](../layout.md) describe; the layout notes also state that layout is CSS-driven and does not measure the viewport in JavaScript, and that the steps are viewport media queries and not container queries.
