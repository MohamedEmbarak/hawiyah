# Container

Container limits the width of the content of a page and centres it, with a gutter on each side. It is a layout primitive without behaviour of its own, and its host is the element that takes the class `hw-container`.

## Example

A container holds the content of one page region. Its width is the smaller of the maximum width of the theme and the width of its parent less the gutters, and the box stands in the middle of the parent. The paragraph wraps at the width of the container.

```html live example=basic static differences=container-vue-layout-attributes
<div class="hw-container">
  <p>Request 2041 was submitted on 4 March. The request is under review, and a decision is expected within five working days. You receive a message when the status changes.</p>
</div>
```

```tsx live example=basic
<Container>
  <p>Request 2041 was submitted on 4 March. The request is under review, and a decision is expected within five working days. You receive a message when the status changes.</p>
</Container>
```

```vue live example=basic
<Container>
  <p>Request 2041 was submitted on 4 March. The request is under review, and a decision is expected within five working days. You receive a message when the status changes.</p>
</Container>
```

```ts live example=basic framework=angular
template: `<hw-container>
  <p>Request 2041 was submitted on 4 March. The request is under review, and a decision is expected within five working days. You receive a message when the status changes.</p>
</hw-container>`
```

## Variants and states

### Maximum width

`maxWidth` sets the largest width of the container as a CSS length. The container is narrower than that value when its parent, less the gutters, is narrower. The React, Vue and Angular adapters write the value as a custom property on the element of the container, and the markup of the JavaScript block writes the same custom property in a style attribute.

```html live example=max-width static differences=container-vue-layout-attributes
<div class="hw-container" style="--hw-layout-max-width: 24rem">
  <p>Request 2041 was submitted on 4 March. The request is under review, and a decision is expected within five working days. You receive a message when the status changes.</p>
</div>
```

```tsx live example=max-width
<Container maxWidth="24rem">
  <p>Request 2041 was submitted on 4 March. The request is under review, and a decision is expected within five working days. You receive a message when the status changes.</p>
</Container>
```

```vue live example=max-width
<Container max-width="24rem">
  <p>Request 2041 was submitted on 4 March. The request is under review, and a decision is expected within five working days. You receive a message when the status changes.</p>
</Container>
```

```ts live example=max-width framework=angular
template: `<hw-container maxWidth="24rem">
  <p>Request 2041 was submitted on 4 March. The request is under review, and a decision is expected within five working days. You receive a message when the status changes.</p>
</hw-container>`
```

### Fluid

With `data-variant="fluid"` the container takes the full width of its parent, without a maximum width and without gutters. The width of the parent then decides how wide the container is.

```html live example=fluid static differences=container-vue-layout-attributes
<div class="hw-container" data-variant="fluid">
  <p>Request 2041 was submitted on 4 March. The request is under review, and a decision is expected within five working days. You receive a message when the status changes.</p>
</div>
```

```tsx live example=fluid
<Container data-variant="fluid">
  <p>Request 2041 was submitted on 4 March. The request is under review, and a decision is expected within five working days. You receive a message when the status changes.</p>
</Container>
```

```vue live example=fluid
<Container data-variant="fluid">
  <p>Request 2041 was submitted on 4 March. The request is under review, and a decision is expected within five working days. You receive a message when the status changes.</p>
</Container>
```

```ts live example=fluid framework=angular
template: `<hw-container data-variant="fluid">
  <p>Request 2041 was submitted on 4 March. The request is under review, and a decision is expected within five working days. You receive a message when the status changes.</p>
</hw-container>`
```

## API

### JavaScript

Table: Attributes of the hw-container element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-container'` | `true` | — |
| `data-variant` | `'fluid'` | `false` | — |

Container has no JavaScript controller. The markup is the API: write an element with the class `hw-container` and place the content inside it. The stylesheet contract lists the class `hw-container` in its Layout row. `data-variant` is optional: `fluid` makes the container take the full width of its parent, and without it the container is limited by the maximum width and the gutters. A maximum width for one container is the custom property `--hw-layout-max-width`, which the stylesheet reads, written in a style attribute; it is a scoped layout property of the stylesheet and not a global design token. Without it the maximum width comes from the theme.

### React

Table: Props of Container

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

Container always renders a `div`; it has no prop that chooses another element. It accepts the shared layout props of the layout primitives together with the attributes of a `div`, so `data-variant="fluid"` is written as an attribute. `maxWidth` takes a CSS length, and `padding` takes a spacing token from 0 to 16 or a CSS length, in a responsive object where needed. The stylesheet gives Container no flex or grid layout, so only `maxWidth` and `padding` change its appearance; `gap`, `align`, `justify`, `wrap`, `columns`, `minItemWidth`, `side`, `sidebarWidth`, `collapseAt` and `ratio` belong to other primitives. Without a value, every default comes from the stylesheet, so the table shows an em dash for each.

### Vue

Table: Props, events and slots of Container

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

The default slot holds the content. `as` sets the element that Container renders, a `div` unless another tag is given. `maxWidth` and `padding` have the meaning they have in React, and the other layout props are accepted for the shared contract but are not read by the Container styles. Container always writes `data-side` and `data-collapse-at` on its element, with the defaults of `side` and `collapseAt`, and the stylesheet does not read them on a container. Attributes that Container does not declare, such as `data-variant`, reach the rendered element. `wrap` has no default and is absent unless it is set.

### Angular

Table: Inputs, outputs and content of hw-container

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

`HwContainerComponent` applies to `hw-container`. The host element is the box: it carries the class `hw-container` and the layout custom properties, its template is the projected content alone, and the projected elements are its direct children. Class, id, ARIA and data attributes written on `hw-container`, such as `data-variant`, therefore sit on the element that the stylesheet styles. The attribute selector `[hwContainer]` of the same component applies the same box to a native element, which keeps its tag, for example a `main` or a `section`. `maxWidth` and `padding` have the meaning they have in React; the other inputs exist for the shared contract and are not read by the Container styles. `wrap` is a boolean, and the bare attribute means true.

## Accessibility

Container is a layout box. The React component renders a `div`; the Vue component renders a `div` or the element that `as` names; the Angular element `hw-container` renders itself, and the `[hwContainer]` form keeps the native element it is written on. In every form Container adds no role, no name and no focusable element, so the semantics of the page come from its content.

- The visual order is the source order. Container does not reorder its content, so write it in the order in which it is read and focused.
- Container has no keyboard interaction of its own, and <kbd>Tab</kbd> moves between the focusable elements inside it as it does outside a container.
- Container is not a landmark and gives no accessible name. A region that needs a landmark takes a native element such as `main`, `nav` or `section`, which Container can be: the Vue `as` prop and the Angular `[hwContainer]` form render it as that element, and in React and in the vanilla markup the element of the landmark can carry the class `hw-container` or stand inside the container.
- A page has one `main` landmark, so a container that is a `main` is not nested in another one.

> [!NOTE]
> The width limit changes the layout, not the meaning. Content that a reader must scroll or zoom to reach is a matter of its own markup, and Container does not hide or clip it.

## RTL and localisation

Container has no built-in text. Every child is written by the application in the language of the page. The container inherits the language and the direction of the page, and the packaged styles use logical properties.

- The box is centred with equal inline margins, so it stands in the middle of its parent in both directions, and the two gutters are equal.
- The width, the maximum width and the padding are the same in Arabic and in English; no adapter changes the layout by language.
- The gutter narrows on viewports narrower than 37.5rem, in both directions.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Container; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- Container is listed among the layout primitives of the component scope in the [coverage notes](../coverage.md).
- The [layout notes](../layout.md) record a desktop container maximum width and the container padding of desktop and mobile as reference dimensions of the supplied Platforms Code files, and state that Container reads its maximum width and gutters from the selected theme. The notes state that the frame sizes of the files are not breakpoints and that rendered templates must be compared before a match is claimed, so the page claims no match of the component itself.
