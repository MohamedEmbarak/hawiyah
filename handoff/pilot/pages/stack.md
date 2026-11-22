# Stack

Stack arranges its children in one column with shared spacing and alignment. It is a layout primitive without behaviour of its own, and its host is the element that takes the class `hw-stack`.

## Example

A stack keeps related blocks of a page in one vertical sequence. Each child follows the previous one in source order, with the same space between every pair.

```html live example=basic static
<div class="hw-stack">
  <p>Request 2041 was submitted on 4 March.</p>
  <p>The request is under review.</p>
  <p>A decision is expected within five working days.</p>
</div>
```

```tsx live example=basic
<Stack>
  <p>Request 2041 was submitted on 4 March.</p>
  <p>The request is under review.</p>
  <p>A decision is expected within five working days.</p>
</Stack>
```

```vue live example=basic
<Stack>
  <p>Request 2041 was submitted on 4 March.</p>
  <p>The request is under review.</p>
  <p>A decision is expected within five working days.</p>
</Stack>
```

```ts live example=basic framework=angular
template: `<hw-stack>
  <p>Request 2041 was submitted on 4 March.</p>
  <p>The request is under review.</p>
  <p>A decision is expected within five working days.</p>
</hw-stack>`
```

## API

### JavaScript

Table: Attributes of the hw-stack element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-stack'` | `true` | — |

Stack has no JavaScript controller. The markup is the API: write an element with the class `hw-stack` and place the children directly inside it. The default space between children is the space token 4 of `@hawiyah/tokens`. The scoped gap custom property of the stylesheet, written as two hyphens, hw, hyphen and gap, sets another gap on one stack; the `@hawiyah/styles` README describes it as a layout customization hook and not as a global design token. The stylesheet contract lists the class `hw-stack` in its Layout row.

### React

Table: Props of Stack

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

Stack always renders a `div`; it has no prop that chooses another element. It accepts the shared layout props of the layout primitives together with the attributes of a `div`. `gap` and `padding` take a spacing token from 0 to 16 or a CSS length, and both accept a responsive object with the steps `base`, `sm`, `md`, `lg` and `xl`. `align` sets the cross-axis alignment and `justify` distributes the children along the column. The stylesheet fixes Stack to a column without wrapping and reads none of `wrap`, `columns`, `minItemWidth`, `side`, `sidebarWidth`, `collapseAt`, `maxWidth` and `ratio`, which belong to other primitives. Without a value, every default comes from the stylesheet: a gap of the space token 4, no padding, `align` `stretch` and `justify` `start`, so the table shows an em dash for each.

### Vue

Table: Props, events and slots of Stack

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

The default slot holds the children. `as` sets the element that Stack renders, a `div` unless another tag is given, so a list of related items can be a `ul` with `li` children. `gap`, `padding`, `align` and `justify` have the meaning they have in React, and the other layout props are accepted for the shared contract but are not read by the Stack styles. Stack always writes `data-side` and `data-collapse-at` on its element, with the defaults of `side` and `collapseAt`, and the stylesheet does not read them. Attributes and listeners that Stack does not declare reach the rendered element. `wrap` has no default and is absent unless it is set.

### Angular

Table: Inputs, outputs and content of hw-stack

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

`HwStackComponent` applies to `hw-stack`. The host element is the box: it carries the class `hw-stack` and the layout custom properties, its template is the projected content alone, and the projected elements are its direct children. Class, id, ARIA and data attributes written on `hw-stack` therefore sit on the element that the stylesheet styles. The attribute selector `[hwStack]` of the same component applies the same box to a native element, which keeps its tag, for example a `ul`. `gap`, `padding`, `align` and `justify` have the meaning they have in React; the other inputs exist for the shared contract and are not read by the Stack styles. `gap` and `padding` accept the responsive object of React.

## Accessibility

Stack is a layout container. The React component renders a `div`; the Vue component renders a `div` or the element that `as` names; the Angular element `hw-stack` renders itself, and the `[hwStack]` form keeps the native element it is written on. In every form Stack adds no role, no name and no focusable element, so the semantics of the page come from its children.

- The visual order is the source order. The stylesheet sets a column without reversing or reordering it, so write the children in the order in which they are read and focused.
- Stack has no keyboard interaction of its own, and <kbd>Tab</kbd> moves between the focusable children as it does outside a stack.
- Stack gives no accessible name. A stack that groups content for assistive technology needs a native element with its own name, such as a `section` with a heading or an `aria-label`.
- A list of items is a native `ul` or `ol`. In Vue, `as` renders the stack as that element, and in Angular the `[hwStack]` form does the same; in React and in the vanilla markup, place the list inside the stack, or give the list element the class `hw-stack`.

> [!NOTE]
> Stack changes the layout, not the meaning. A sequence of blocks that is a list, a form or a set of steps keeps its own native markup, either as the element of the stack where the adapter allows it or inside the stack.

## RTL and localisation

Stack has no built-in text. Every child is written by the application in the language of the page. The stack inherits the language and the direction of the page, and the packaged styles use logical properties.

- The column runs from the top to the bottom in both directions; the direction of the page does not reverse it.
- The `start` and `end` values of `align` follow the direction of the page, so with `align="start"` the children line up with the right edge in a right-to-left page and with the left edge in a left-to-right page.
- The gap and the padding are the same in Arabic and in English; no adapter changes the layout by language.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Stack; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- Stack is a layout primitive of Hawiyah. The [layout notes](../layout.md) list only container and service-template dimensions of the supplied Platforms Code files and name no component that Stack maps, so the page claims no mapping of the component itself.
- The default gap and the spacing tokens come from the semantic tokens that the other components use, as the [layout notes](../layout.md) describe; the layout notes also state that layout is CSS-driven and does not measure the viewport in JavaScript.
