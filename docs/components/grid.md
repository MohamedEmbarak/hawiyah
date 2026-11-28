# Grid

Grid arranges its children in equal-width columns with shared spacing, either in a fixed number of columns or in as many columns as fit a minimum item width. It is a layout primitive without behaviour of its own, and its host is the element that takes the class `hw-grid`.

## Example

A grid holds items of the same kind that a reader goes through one by one, such as the stages of a request. `columns` sets the number of columns, and the children fill the cells row by row in source order, with the same space between every pair of cells.

```html live example=basic static differences=grid-vue-layout-attributes
<div class="hw-grid" style="--hw-layout-columns: 3">
  <p>Submitted on 4 March.</p>
  <p>Under review since 6 March.</p>
  <p>A decision is expected within five working days.</p>
</div>
```

```tsx live example=basic
<Grid columns={3}>
  <p>Submitted on 4 March.</p>
  <p>Under review since 6 March.</p>
  <p>A decision is expected within five working days.</p>
</Grid>
```

```vue live example=basic
<Grid :columns="3">
  <p>Submitted on 4 March.</p>
  <p>Under review since 6 March.</p>
  <p>A decision is expected within five working days.</p>
</Grid>
```

```ts live example=basic framework=angular
template: `<hw-grid [columns]="3">
  <p>Submitted on 4 March.</p>
  <p>Under review since 6 March.</p>
  <p>A decision is expected within five working days.</p>
</hw-grid>`
```

## Variants and states

### Responsive columns

`columns` takes an object with the steps `base`, `sm`, `md`, `lg` and `xl`. A step applies from the minimum viewport width of its name, and a missing step keeps the nearest smaller one. Here the grid has one column and takes three columns from the `md` step. The steps are viewport media queries of the stylesheet, so no script measures the page.

```html live example=responsive static differences=grid-vue-layout-attributes
<div class="hw-grid" style="--hw-layout-columns: 1; --hw-layout-columns-md: 3">
  <p>Submitted on 4 March.</p>
  <p>Under review since 6 March.</p>
  <p>A decision is expected within five working days.</p>
</div>
```

```tsx live example=responsive
<Grid columns={{ base: 1, md: 3 }}>
  <p>Submitted on 4 March.</p>
  <p>Under review since 6 March.</p>
  <p>A decision is expected within five working days.</p>
</Grid>
```

```vue live example=responsive
<Grid :columns="{ base: 1, md: 3 }">
  <p>Submitted on 4 March.</p>
  <p>Under review since 6 March.</p>
  <p>A decision is expected within five working days.</p>
</Grid>
```

```ts live example=responsive framework=angular
template: `<hw-grid [columns]="{ base: 1, md: 3 }">
  <p>Submitted on 4 March.</p>
  <p>Under review since 6 March.</p>
  <p>A decision is expected within five working days.</p>
</hw-grid>`
```

### Minimum item width

`minItemWidth` sets the smallest width of an item as a CSS length, and the grid fits as many columns as the width of its parent allows; in a parent narrower than that length, an item is narrower than the length. It takes precedence over `columns`. Use it where the width of the parent is not known, such as a grid inside a narrow column.

```html live example=min-item static differences=grid-vue-layout-attributes
<div class="hw-grid" style="--hw-layout-min-item: 12rem; --hw-layout-columns: auto-fit">
  <p>Documents: 3 requests.</p>
  <p>Payments: 1 request.</p>
  <p>Profile: no requests.</p>
  <p>Messages: 2 unread.</p>
</div>
```

```tsx live example=min-item
<Grid minItemWidth="12rem">
  <p>Documents: 3 requests.</p>
  <p>Payments: 1 request.</p>
  <p>Profile: no requests.</p>
  <p>Messages: 2 unread.</p>
</Grid>
```

```vue live example=min-item
<Grid min-item-width="12rem">
  <p>Documents: 3 requests.</p>
  <p>Payments: 1 request.</p>
  <p>Profile: no requests.</p>
  <p>Messages: 2 unread.</p>
</Grid>
```

```ts live example=min-item framework=angular
template: `<hw-grid minItemWidth="12rem">
  <p>Documents: 3 requests.</p>
  <p>Payments: 1 request.</p>
  <p>Profile: no requests.</p>
  <p>Messages: 2 unread.</p>
</hw-grid>`
```

## API

### JavaScript

Table: Attributes of the hw-grid element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-grid'` | `true` | — |

> [!NOTE]
> These classes and attributes are read from the published stylesheet and are outside the stable contract of 0.3.0.

Grid has no JavaScript controller. The markup is the API: write an element with the class `hw-grid` and place the items directly inside it. Without a column count the grid has one column. The default space between items is the space token 4 of `@hawiyah/tokens`. The scoped custom properties of the stylesheet that the adapters write set the number of columns, the minimum item width and another gap on one grid; they are scoped layout properties and not global design tokens. The class `hw-grid` is outside the stylesheet contract of 0.3.0, so its table is read from the published stylesheet. The class `hw-columns` has the same grid rule.

### React

Table: Props of Grid

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

Grid always renders a `div`; it has no prop that chooses another element. It accepts the shared layout props of the layout primitives together with the attributes of a `div`. `columns` is a positive integer or a responsive object with the steps `base`, `sm`, `md`, `lg` and `xl`, and `minItemWidth` is a CSS length that makes the grid fit as many columns as its width allows and takes precedence over `columns`. `gap` and `padding` take a spacing token from 0 to 16 or a CSS length, and both accept a responsive object. `align` sets the alignment of the items inside their cells, and `justify` is written as the CSS property justify-content, which has no visible effect on Grid in 0.3.0, because every column takes an equal share of the free width. The stylesheet reads none of `wrap`, `side`, `sidebarWidth`, `collapseAt`, `maxWidth` and `ratio`, which belong to other primitives. Without a value, every default comes from the stylesheet: one column, a gap of the space token 4, no padding, `align` `stretch` and `justify` `start`, so the table shows an em dash for each.

### Vue

Table: Props, events and slots of Grid

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

The default slot holds the items. `as` sets the element that Grid renders, a `div` unless another tag is given, so a set of related items can be a `ul` with `li` children. `columns`, `minItemWidth`, `gap`, `padding`, `align` and `justify` have the meaning they have in React, and the other layout props are accepted for the shared contract but are not read by the Grid styles. Grid always writes `data-side` and `data-collapse-at` on its element, with the defaults of `side` and `collapseAt`, and the stylesheet does not read them. Attributes and listeners that Grid does not declare reach the rendered element. `wrap` has no default and is absent unless it is set.

### Angular

Table: Inputs, outputs and content of hw-grid

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

`HwGridComponent` applies to `hw-grid`. The host element is the box: it carries the class `hw-grid` and the layout custom properties, its template is the projected content alone, and the projected elements are its direct children. Class, id, ARIA and data attributes written on `hw-grid` therefore sit on the element that the stylesheet styles. The attribute selector `[hwGrid]` of the same component applies the same box to a native element, which keeps its tag, for example a `ul`. `columns`, `minItemWidth`, `gap`, `padding`, `align` and `justify` have the meaning they have in React; the other inputs exist for the shared contract and are not read by the Grid styles. `columns` and `gap` accept the responsive object of React.

## Accessibility

Grid is a layout container. The React component renders a `div`; the Vue component renders a `div` or the element that `as` names; the Angular element `hw-grid` renders itself, and the `[hwGrid]` form keeps the native element it is written on. In every form Grid adds no role, no name and no focusable element, so the semantics of the page come from its children.

- The visual order is the source order. The stylesheet places the items row by row without reordering them, so write the items in the order in which they are read and focused, and expect the focus to move along a row and then to the next one.
- Grid has no keyboard interaction of its own, and <kbd>Tab</kbd> moves between the focusable children as it does outside a grid.
- Grid gives no accessible name and does not announce rows or columns. Data that a reader compares by row and column is a native `table`, not a grid of items.
- A set of items that is a list is a native `ul` or `ol`. In Vue, `as` renders the grid as that element, and in Angular the `[hwGrid]` form does the same; in React and in the vanilla markup, give the list element the class `hw-grid`. A list placed inside a grid is one item of it, so its list items are not arranged in columns.

> [!NOTE]
> Grid changes the layout, not the meaning. The number of columns that fit depends on the width of the page, so write each item so that it reads on its own and does not depend on its position in a row.

## RTL and localisation

Grid has no built-in text. Every item is written by the application in the language of the page. The grid inherits the language and the direction of the page, and the packaged styles use logical properties.

- The items fill each row from the reading start, so the first item stands at the right edge in a right-to-left page and at the left edge in a left-to-right page. Write the items in reading order and the grid follows the direction.
- The steps of a responsive `columns` object are viewport widths, and the gap and the padding are the same in Arabic and in English; no adapter changes the layout by language.
- An item whose text is longer in one language wraps inside its cell, and the cells stay equal in width.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Grid; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- Grid is a layout primitive of Hawiyah, listed among the layout primitives of the component scope in the [coverage notes](../coverage.md). The [layout notes](../layout.md) list only container and service-template dimensions of the supplied Platforms Code files and name no component that Grid maps, so the page claims no mapping of the component itself.
- The default gap, the spacing tokens and the steps of the responsive objects come from the layout contract of Hawiyah, as the [layout notes](../layout.md) describe; the layout notes also state that layout is CSS-driven and does not measure the viewport in JavaScript, and that the steps are viewport media queries and not container queries.
