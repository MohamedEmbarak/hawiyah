# Center

Center places its children in one column and centres them on both axes, with centred text. It is a layout primitive without behaviour of its own, and it is the element that takes the class `hw-center`.

## Example

A page that has nothing to list yet shows one centred message with its action. Each child stands in the middle of the available width, and the text is centred.

```html live example=basic differences=center-vue-layout-attributes
<div class="hw-center">
  <p>You have no open requests.</p>
  <button class="hw-button" type="button" data-variant="primary" data-size="md">Start a new request</button>
</div>
```

```tsx live example=basic
<Center>
  <p>You have no open requests.</p>
  <Button variant="primary">Start a new request</Button>
</Center>
```

```vue live example=basic
<Center>
  <p>You have no open requests.</p>
  <Button variant="primary">Start a new request</Button>
</Center>
```

```ts live example=basic framework=angular
template: `<hw-center>
  <p>You have no open requests.</p>
  <button hwButton variant="primary">Start a new request</button>
</hw-center>`
```

## Variants and states

### Padding

`padding` adds space inside the box, around the centred content. The number 6 is the spacing token 6. The React, Vue and Angular adapters write the value as a custom property on the element of the box, and the markup of the JavaScript block writes the same custom property in a style attribute.

```html live example=padding differences=center-vue-layout-attributes
<div class="hw-center" style="--hw-layout-padding: var(--hw-space-6, 1.5rem)">
  <p>No documents have been added to this request.</p>
  <button class="hw-button" type="button" data-variant="secondary" data-size="md">Add a document</button>
</div>
```

```tsx live example=padding
<Center padding={6}>
  <p>No documents have been added to this request.</p>
  <Button variant="secondary">Add a document</Button>
</Center>
```

```vue live example=padding
<Center :padding="6">
  <p>No documents have been added to this request.</p>
  <Button variant="secondary">Add a document</Button>
</Center>
```

```ts live example=padding framework=angular
template: `<hw-center [padding]="6">
  <p>No documents have been added to this request.</p>
  <button hwButton variant="secondary">Add a document</button>
</hw-center>`
```

### Alignment

`align` sets the alignment of the children on the cross axis, and `justify` sets their distribution on the main axis. With `align="start"` the children line up with the reading start instead of the middle; the text stays centred.

```html live example=align differences=center-vue-layout-attributes
<div class="hw-center" style="--hw-layout-align: start">
  <p>No documents have been added to this request.</p>
  <button class="hw-button" type="button" data-variant="secondary" data-size="md">Add a document</button>
</div>
```

```tsx live example=align
<Center align="start">
  <p>No documents have been added to this request.</p>
  <Button variant="secondary">Add a document</Button>
</Center>
```

```vue live example=align
<Center align="start">
  <p>No documents have been added to this request.</p>
  <Button variant="secondary">Add a document</Button>
</Center>
```

```ts live example=align framework=angular
template: `<hw-center align="start">
  <p>No documents have been added to this request.</p>
  <button hwButton variant="secondary">Add a document</button>
</hw-center>`
```

## API

### JavaScript

Table: Attributes of the hw-center element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-center'` | `true` | — |

> [!NOTE]
> These classes and attributes are read from the published stylesheet and are outside the stable contract of 0.3.0.

Center has no JavaScript controller. The markup is the API: write an element with the class `hw-center` and place the children directly inside it. The stylesheet makes it a flex column whose cross-axis alignment and main-axis distribution are both `center`, and it centres the text. The default space between children is the space token 4 of `@hawiyah/tokens`. The custom properties `--hw-layout-gap` and `--hw-layout-padding` set another gap or padding on one element, as the Padding example writes the second. Vertical centring needs a container taller than its content, such as one with a minimum block size that the application sets.

### React

Table: Props of Center

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

Center always renders a `div`; it has no prop that chooses another element. It accepts the shared layout props of the layout primitives together with the attributes of a `div`. `gap` and `padding` take a spacing token from 0 to 16 or a CSS length, and both accept a responsive object with the steps `base`, `sm`, `md`, `lg` and `xl`. `align` and `justify` replace the centring on the cross axis and the main axis. The stylesheet fixes Center to a column without wrapping and reads none of `wrap`, `columns`, `minItemWidth`, `side`, `sidebarWidth`, `collapseAt`, `maxWidth` and `ratio`, which belong to other primitives. Without a value the stylesheet gives a gap of the space token 4, no padding, and `center` for `align` and for `justify`; the table shows an em dash for each prop because the React component declares no default value for any layout prop.

### Vue

Table: Props, events and slots of Center

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

The default slot holds the children. `as` sets the element that Center renders, a `div` unless another tag is given. `gap`, `padding`, `align` and `justify` have the meaning they have in React, and the other layout props are accepted for the shared contract but are not read by the Center styles. Center always writes `data-side` and `data-collapse-at` on its element, with the defaults of `side` and `collapseAt`, and the stylesheet does not read them. Attributes and listeners that Center does not declare reach the rendered element. `wrap` has no default and is absent unless it is set.

### Angular

Table: Inputs, outputs and content of hw-center

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

`HwCenterComponent` applies to `hw-center`. The host element is the box: it carries the class `hw-center` and the layout custom properties, its template is the projected content alone, and the projected elements are its direct children. Class, id, ARIA and data attributes written on `hw-center` therefore sit on the element that the stylesheet styles. The attribute selector `[hwCenter]` of the same component applies the same box to a native element, which keeps its tag. `gap`, `padding`, `align` and `justify` have the meaning they have in React; the other inputs exist for the shared contract and are not read by the Center styles. `gap` and `padding` accept the responsive object of React.

## Accessibility

Center is a layout container. The React component renders a `div`; the Vue component renders a `div` or the element that `as` names; the Angular element `hw-center` renders itself, and the `[hwCenter]` form keeps the native element it is written on. In every form Center adds no role, no name and no focusable element, so the semantics of the page come from its children.

- The visual order is the source order. The stylesheet sets a column without reversing or reordering it, so write the children in the order in which they are read and focused.
- Center has no keyboard interaction of its own, and <kbd>Tab</kbd> moves between the focusable children as it does outside a centred box.
- Center gives no accessible name. A box that groups content for assistive technology needs a native element with its own name, such as a `section` with a heading or an `aria-label`.
- Center centres its text. Use it for a short message or a short group of controls, and write long text in a container that follows the reading start.

> [!NOTE]
> Center changes the position of its children, not their meaning. A message that reports a state, such as an empty list or a failed request, keeps its own native markup or the markup of a status component inside the box.

## RTL and localisation

Center has no built-in text. Every child is written by the application in the language of the page. The box inherits the language and the direction of the page, and the packaged styles use logical properties.

- Centring does not depend on the direction: the children stand in the middle of the box in Arabic and in English.
- The `start` and `end` values of `align` follow the direction of the page, so with `align="start"` the children line up with the right edge in a right-to-left page and with the left edge in a left-to-right page. The stylesheet still centres the text, so write the text alignment of the children where it matters.
- The gap and the padding are the same in Arabic and in English; no adapter changes the layout by language.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Center; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- Center is a layout primitive of Hawiyah. The [layout notes](../layout.md) list only container and service-template dimensions of the supplied Platforms Code files and name no component that Center maps, so the page claims no mapping of the component itself.
- The [layout notes](../layout.md) describe Center as content centred within its available space, and state that layout is CSS-driven and does not measure the viewport in JavaScript.
