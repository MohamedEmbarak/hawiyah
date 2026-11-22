# Spacer

Spacer is a layout primitive that takes the free space of a flex container and can reserve a minimum space of its own. It has no content and no behaviour, and it is decorative.

## Example

A request header holds a title and an action. The spacer takes the free space of the row between them, so the action stands at the end of the row.

```html live example=basic
<div class="hw-inline">
  <strong>Request 2041</strong>
  <div class="hw-spacer" aria-hidden="true"></div>
  <button class="hw-button" type="button" data-variant="secondary" data-size="md">Withdraw</button>
</div>
```

```tsx live example=basic
<Inline>
  <strong>Request 2041</strong>
  <Spacer aria-hidden="true" />
  <Button variant="secondary">Withdraw</Button>
</Inline>
```

```vue live example=basic
<Inline>
  <strong>Request 2041</strong>
  <Spacer aria-hidden="true" />
  <Button variant="secondary">Withdraw</Button>
</Inline>
```

```ts live example=basic framework=angular
template: `<hw-inline>
  <strong>Request 2041</strong>
  <hw-spacer />
  <button hwButton variant="secondary">Withdraw</button>
</hw-inline>`
```

## Variants and states

### Minimum space

`gap` sets the smallest space that the spacer keeps in both directions. Without it the minimum is zero. In a column the spacer has no free space to take, so the minimum becomes a vertical space between two blocks. The gap of the column stands on both sides of the spacer, so the space between the two blocks is the minimum plus two gaps. The number 8 is the spacing token 8. The React, Vue and Angular adapters write the value as a custom property on the element of the spacer, and the markup of the JavaScript block writes the same custom property in a style attribute.

```html live example=minimum
<div class="hw-stack">
  <p>Your request has been received.</p>
  <div class="hw-spacer" aria-hidden="true" style="--hw-layout-gap: var(--hw-space-8, 2rem)"></div>
  <p>Documents that you add later join the same request.</p>
</div>
```

```tsx live example=minimum
<Stack>
  <p>Your request has been received.</p>
  <Spacer aria-hidden="true" gap={8} />
  <p>Documents that you add later join the same request.</p>
</Stack>
```

```vue live example=minimum
<Stack>
  <p>Your request has been received.</p>
  <Spacer aria-hidden="true" :gap="8" />
  <p>Documents that you add later join the same request.</p>
</Stack>
```

```ts live example=minimum framework=angular
template: `<hw-stack>
  <p>Your request has been received.</p>
  <hw-spacer [gap]="8" />
  <p>Documents that you add later join the same request.</p>
</hw-stack>`
```

## API

### JavaScript

Table: Attributes of the hw-spacer element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-spacer'` | `true` | — |

> [!NOTE]
> These classes and attributes are read from the published stylesheet and are outside the stable contract of 0.3.0.

Spacer has no JavaScript controller. The markup is the API: write an empty `div` with the class `hw-spacer` as a child of an element with the class `hw-inline` or another flex container, and write `aria-hidden="true"` on it. The stylesheet makes it grow into the free space of the container, sets its minimum size to zero and turns off its pointer events. To keep a minimum space, write the custom property `--hw-layout-gap` in a `style` attribute of the spacer, as the Minimum space example does. The stylesheet reads it on the spacer; the property `--hw-gap` that the `@hawiyah/styles` README describes for `hw-stack` and `hw-cluster` has no effect on a spacer.

### React

Table: Props of Spacer

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

Spacer always renders a `div`, and it accepts the shared layout props together with the attributes of a `div`. `gap` takes a spacing token from 0 to 16 or a CSS length and sets the minimum space of the spacer; it accepts a responsive object with the steps `base`, `sm`, `md`, `lg` and `xl`. The stylesheet reads `gap` and `padding` for a spacer and none of the other props, which belong to other primitives. Without a value the minimum space is zero, the value of the stylesheet; the table shows an em dash for each default because the React component declares no default value for any layout prop. React adds no `aria-hidden`, so write `aria-hidden="true"` on the spacer.

### Vue

Table: Props, events and slots of Spacer

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

`as` sets the element that Spacer renders, a `div` unless another tag is given. `gap` and `padding` have the meaning they have in React, and the other layout props are accepted for the shared contract but are not read by the Spacer styles. Spacer always writes `data-side` and `data-collapse-at` on its element, with the defaults of `side` and `collapseAt`, and the stylesheet does not read them. Vue adds no `aria-hidden`, so write `aria-hidden="true"` on the spacer. Spacer is meant to be empty; the `default` slot is accepted and renders its content inside the spacer. `wrap` has no default and is absent unless it is set.

### Angular

Table: Inputs, outputs and content of hw-spacer

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

`HwSpacerComponent` applies to `hw-spacer` only; it has no attribute selector for a native element. The host element is the box: it carries the class `hw-spacer`, the layout custom properties and `aria-hidden="true"`, and its template is empty, so the element is a direct child of the flex container. `gap` and `padding` have the meaning they have in React and accept the same responsive object; the other inputs exist for the shared contract and are not read by the Spacer styles.

## Accessibility

Spacer is an empty layout element with no role, no name and no focusable element, and the stylesheet turns off its pointer events. It adds nothing to the page for assistive technology; its effect is only visual.

- The Angular element `hw-spacer` writes `aria-hidden="true"` itself. The React and Vue components and the vanilla markup do not, so write `aria-hidden="true"` on the spacer there.
- Spacer has no keyboard interaction of its own, and it is not in the tab order.
- Do not use a spacer to carry text or a control. Content placed in it is not part of the layout contract, and a control inside an element with `aria-hidden="true"` is hidden from assistive technology while it stays focusable.

> [!NOTE]
> Spacer changes the position of its siblings, not their order. Write the siblings in the order in which they are read and focused.

## RTL and localisation

Spacer has no built-in text and no language. It takes the free space along the main axis of its container, and a row follows the direction of the page, so the action of the example stands at the left end in a right-to-left page and at the right end in a left-to-right page.

- The minimum space of `gap` applies to the width and to the height, so it is the same in Arabic and in English.
- No adapter changes the layout by language; the order of the siblings in the source decides the order on the screen in both directions.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Spacer; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- Spacer is a layout primitive of Hawiyah. The [layout notes](../layout.md) list only container and service-template dimensions of the supplied Platforms Code files and name no component that Spacer maps, so the page claims no mapping of the component itself.
- The [layout notes](../layout.md) describe Spacer as flexible space inside a flex container for presentation only, state that layout is CSS-driven and does not measure the viewport in JavaScript, and advise keeping Spacer hidden from assistive technology when it has no content, which is why the page asks for `aria-hidden="true"` where the adapter does not write it.
