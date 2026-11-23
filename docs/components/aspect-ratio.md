# AspectRatio

AspectRatio reserves a box with a fixed width-to-height ratio for media such as an image, a video or an embedded frame. It is a layout primitive without behaviour of its own, and the box keeps its proportions as its width changes.

## Example

The box takes the full width of its container and a height from the ratio, 16 to 9 unless a ratio is given. The box reserves its space through its ratio, so the page does not shift when the image appears. The image here is a blue square with a white circle and an orange corner, so that the crop of the box is visible.

```html live example=basic static differences=aspect-ratio-adapter-attributes
<div class="hw-aspect-ratio">
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='steelblue'/%3E%3Ccircle cx='50' cy='50' r='30' fill='white'/%3E%3Crect width='20' height='20' fill='orange'/%3E%3C/svg%3E" alt="Blue square with a white circle at its centre and an orange square in the top-left corner">
</div>
```

```tsx live example=basic
<AspectRatio>
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='steelblue'/%3E%3Ccircle cx='50' cy='50' r='30' fill='white'/%3E%3Crect width='20' height='20' fill='orange'/%3E%3C/svg%3E" alt="Blue square with a white circle at its centre and an orange square in the top-left corner" />
</AspectRatio>
```

```vue live example=basic
<AspectRatio>
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='steelblue'/%3E%3Ccircle cx='50' cy='50' r='30' fill='white'/%3E%3Crect width='20' height='20' fill='orange'/%3E%3C/svg%3E" alt="Blue square with a white circle at its centre and an orange square in the top-left corner" />
</AspectRatio>
```

```ts live example=basic framework=angular
template: `<hw-aspect-ratio>
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='steelblue'/%3E%3Ccircle cx='50' cy='50' r='30' fill='white'/%3E%3Crect width='20' height='20' fill='orange'/%3E%3C/svg%3E" alt="Blue square with a white circle at its centre and an orange square in the top-left corner" />
</hw-aspect-ratio>`
```

## Variants and states

### Ratio

`ratio` is the width divided by the height, so 1.5 reserves a box that is 3 units wide for every 2 units high. The React, Vue and Angular adapters write the number as a custom property on the element, and the markup of the JavaScript block writes the same custom property in a style attribute.

```html live example=ratio static differences=aspect-ratio-adapter-attributes
<div class="hw-aspect-ratio" style="--hw-layout-ratio: 1.5">
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='steelblue'/%3E%3Ccircle cx='50' cy='50' r='30' fill='white'/%3E%3Crect width='20' height='20' fill='orange'/%3E%3C/svg%3E" alt="Blue square with a white circle at its centre and an orange square in the top-left corner">
</div>
```

```tsx live example=ratio
<AspectRatio ratio={1.5}>
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='steelblue'/%3E%3Ccircle cx='50' cy='50' r='30' fill='white'/%3E%3Crect width='20' height='20' fill='orange'/%3E%3C/svg%3E" alt="Blue square with a white circle at its centre and an orange square in the top-left corner" />
</AspectRatio>
```

```vue live example=ratio
<AspectRatio :ratio="1.5">
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='steelblue'/%3E%3Ccircle cx='50' cy='50' r='30' fill='white'/%3E%3Crect width='20' height='20' fill='orange'/%3E%3C/svg%3E" alt="Blue square with a white circle at its centre and an orange square in the top-left corner" />
</AspectRatio>
```

```ts live example=ratio framework=angular
template: `<hw-aspect-ratio [ratio]="1.5">
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='steelblue'/%3E%3Ccircle cx='50' cy='50' r='30' fill='white'/%3E%3Crect width='20' height='20' fill='orange'/%3E%3C/svg%3E" alt="Blue square with a white circle at its centre and an orange square in the top-left corner" />
</hw-aspect-ratio>`
```

### Fit

An image or a video fills the box and is cropped to it, as the stylesheet sets the object fit of these elements to cover. The attribute `data-fit` with the value `contain` shows the whole image or video inside the box instead, with empty space where the proportions differ. The square image of the example is shown whole in the box, with empty space on both sides, where the basic example crops it to the box. The attribute applies to `img` and `video` children, and the React, Vue and Angular adapters write it on the element like any other attribute.

```html live example=fit static differences=aspect-ratio-adapter-attributes
<div class="hw-aspect-ratio" data-fit="contain">
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='steelblue'/%3E%3Ccircle cx='50' cy='50' r='30' fill='white'/%3E%3Crect width='20' height='20' fill='orange'/%3E%3C/svg%3E" alt="Blue square with a white circle at its centre and an orange square in the top-left corner">
</div>
```

```tsx live example=fit
<AspectRatio data-fit="contain">
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='steelblue'/%3E%3Ccircle cx='50' cy='50' r='30' fill='white'/%3E%3Crect width='20' height='20' fill='orange'/%3E%3C/svg%3E" alt="Blue square with a white circle at its centre and an orange square in the top-left corner" />
</AspectRatio>
```

```vue live example=fit
<AspectRatio data-fit="contain">
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='steelblue'/%3E%3Ccircle cx='50' cy='50' r='30' fill='white'/%3E%3Crect width='20' height='20' fill='orange'/%3E%3C/svg%3E" alt="Blue square with a white circle at its centre and an orange square in the top-left corner" />
</AspectRatio>
```

```ts live example=fit framework=angular
template: `<hw-aspect-ratio data-fit="contain">
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='steelblue'/%3E%3Ccircle cx='50' cy='50' r='30' fill='white'/%3E%3Crect width='20' height='20' fill='orange'/%3E%3C/svg%3E" alt="Blue square with a white circle at its centre and an orange square in the top-left corner" />
</hw-aspect-ratio>`
```

## API

### JavaScript

Table: Attributes of the hw-aspect-ratio element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-aspect-ratio'` | `true` | — |
| `data-fit` | `'contain'` | `false` | — |

> [!NOTE]
> These classes and attributes are read from the published stylesheet and are outside the stable contract of 0.3.0.

AspectRatio has no JavaScript controller. The markup is the API: write an element with the class `hw-aspect-ratio` and place the media directly inside it. The box takes the full inline size of its container, its height follows from the custom property `--hw-layout-ratio`, which is 16 to 9 unless it is set on the element, and the stylesheet clips whatever extends beyond the box. A direct child that is an `img`, a `video`, an `iframe` or a `canvas` fills the box. `data-fit` takes the value `contain` and applies to `img` and `video` children; without it they are cropped to the box. The stylesheet writes no default for either attribute, so each Default is an em dash.

### React

Table: Props of AspectRatio

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

AspectRatio always renders a `div`; it has no prop that chooses another element. It accepts the shared layout props of the layout primitives together with the attributes of a `div`, and `data-fit` is one of those attributes. `ratio` is the width divided by the height. It must be a positive finite number, and the component throws an error for any other value, so `ratio={16 / 9}` is valid and `ratio={0}` is not. Without `ratio` the stylesheet applies 16 to 9, and the table shows an em dash. `padding` takes a spacing token from 0 to 16 or a CSS length and accepts a responsive object with the steps `base`, `sm`, `md`, `lg` and `xl`. `gap` takes the same forms, but the box is a block and not a flex or grid container, so `gap` has no effect on it. The AspectRatio styles read none of the other layout props, which belong to other primitives.

### Vue

Table: Props, events and slots of AspectRatio

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

The default slot holds the media. `as` sets the element that AspectRatio renders, a `div` unless another tag is given. `ratio` has the meaning and the restriction it has in React, and without it the stylesheet applies 16 to 9. AspectRatio always writes `data-side` and `data-collapse-at` on its element, with the defaults of `side` and `collapseAt`, and the stylesheet does not read them for this component. Attributes such as `data-fit` that AspectRatio does not declare reach the rendered element. `wrap` has no default and is absent unless it is set.

### Angular

Table: Inputs, outputs and content of hw-aspect-ratio

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

`HwAspectRatioComponent` applies to `hw-aspect-ratio`. The host element is the box: it carries the class `hw-aspect-ratio` and the layout custom properties, its template is the projected content alone, and the projected media are its direct children. Class, id and data attributes written on `hw-aspect-ratio`, such as `data-fit`, therefore sit on the element that the stylesheet styles. The attribute selector `[hwAspectRatio]` of the same component applies the same box to a native element, which keeps its tag. `ratio` has the meaning it has in React, and its default is the expression 16 divided by 9, which the component computes in its class body, so the table shows an em dash. `padding` changes the box, as it does in React, and `gap` has no effect on it, because the box is a block. The AspectRatio styles read none of the other inputs.

## Accessibility

AspectRatio is a layout container. The React component renders a `div`; the Vue component renders a `div` or the element that `as` names; the Angular element `hw-aspect-ratio` renders itself, and the `[hwAspectRatio]` form keeps the native element it is written on. In every form AspectRatio adds no role, no name and no focusable element, so the accessibility of the box is the accessibility of the media inside it.

- Give each image a text alternative that describes its content, or an empty one when the image is decorative. A frame needs a `title`, and a video needs the controls and the captions that its content requires. The box names none of them.
- The stylesheet clips anything that extends beyond the box. Do not place text or controls in an AspectRatio that need to grow with the text size or the zoom of the reader, because the box keeps its proportions and hides the overflow.
- AspectRatio has no keyboard interaction of its own, and <kbd>Tab</kbd> reaches the focusable elements inside the box as it does outside it.
- An embedded engine such as a map or a document viewer can stand in an AspectRatio with its own accessible name and its own loading and error states, as the `@hawiyah/react` README describes.

> [!NOTE]
> AspectRatio reserves space, it does not load or describe media. Write the dimensions of the media as a ratio, and write its text alternative in the media element.

## RTL and localisation

AspectRatio has no built-in text. The alternative text of an image and the title of a frame are written by the application in the language of the page.

- The ratio and the fit do not depend on the direction of the page: the box has the same width and height in Arabic and in English, and the cover and contain fits do not mirror the media.
- Media that contains text, such as a scanned document, is not translated or mirrored by the box. Provide the version in the language of the page, with a text alternative in that language.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of AspectRatio; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- AspectRatio is a layout primitive of Hawiyah. The [layout notes](../layout.md) give its default ratio of 16 to 9 and its cover behaviour for images and video, and name no component of the supplied Platforms Code files that AspectRatio maps, so the page claims no mapping of the component itself.
- AspectRatio is listed with the layout primitives of the component scope in the [coverage notes](../coverage.md). The [layout notes](../layout.md) state that layout is CSS-driven and does not measure the viewport in JavaScript.
