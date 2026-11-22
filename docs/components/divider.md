# Divider

Divider is a thin line that separates two groups of content. It renders a native horizontal rule, with tones for emphasis and a vertical orientation for items that stand in a row.

## Example

A divider separates two parts of a page that differ in subject, such as the details of a request and its history. It takes the full width of its container and has no text of its own.

```html live example=basic
<div class="hw-stack">
  <p>Request 2041 was submitted on 4 March 2026.</p>
  <hr class="hw-divider">
  <p>The request is waiting for a document from the applicant.</p>
</div>
```

```tsx live example=basic
<div className="hw-stack">
  <p>Request 2041 was submitted on 4 March 2026.</p>
  <Divider />
  <p>The request is waiting for a document from the applicant.</p>
</div>
```

```vue live example=basic
<div class="hw-stack">
  <p>Request 2041 was submitted on 4 March 2026.</p>
  <Divider />
  <p>The request is waiting for a document from the applicant.</p>
</div>
```

```ts live example=basic framework=angular
template: `<div class="hw-stack">
  <p>Request 2041 was submitted on 4 March 2026.</p>
  <hw-divider />
  <p>The request is waiting for a document from the applicant.</p>
</div>`
```

## Variants and states

### Tones

The `tone` sets the colour of the line. Without a tone the line has the border colour of the theme. `primary`, `gold` and `tertiary` use the colours of the same names, and `neutral` sets no colour of its own: the line keeps the border colour, so it looks like a line without a tone. In forced-colours mode a line with any tone, `neutral` included, takes the system text colour.

```html live example=tones
<div class="hw-stack">
  <hr class="hw-divider" data-tone="primary">
  <hr class="hw-divider" data-tone="gold">
  <hr class="hw-divider" data-tone="tertiary">
</div>
```

```tsx live example=tones
<div className="hw-stack">
  <Divider tone="primary" />
  <Divider tone="gold" />
  <Divider tone="tertiary" />
</div>
```

```vue live example=tones
<div class="hw-stack">
  <Divider tone="primary" />
  <Divider tone="gold" />
  <Divider tone="tertiary" />
</div>
```

```ts live example=tones framework=angular
template: `<div class="hw-stack">
  <hw-divider tone="primary" />
  <hw-divider tone="gold" />
  <hw-divider tone="tertiary" />
</div>`
```

### Vertical

The `horizontal` orientation is the line of the first example, and `vertical` separates items in a row. The vertical line stretches to the height of the row when its container is a flex container, such as an `hw-inline` element, and it has an inline margin at both sides. In vanilla the orientation is the attribute `aria-orientation="vertical"`, and the stylesheet selects it.

```html live example=vertical
<div class="hw-inline">
  <span>Request 2041</span>
  <hr class="hw-divider" aria-orientation="vertical">
  <span>Waiting for a document</span>
</div>
```

```tsx live example=vertical
<div className="hw-inline">
  <span>Request 2041</span>
  <Divider orientation="vertical" />
  <span>Waiting for a document</span>
</div>
```

```vue live example=vertical
<div class="hw-inline">
  <span>Request 2041</span>
  <Divider orientation="vertical" />
  <span>Waiting for a document</span>
</div>
```

```ts live example=vertical framework=angular
template: `<div class="hw-inline">
  <span>Request 2041</span>
  <hw-divider orientation="vertical" />
  <span>Waiting for a document</span>
</div>`
```

## API

### JavaScript

Table: Attributes of the hw-divider element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-divider'` | `true` | — |
| `aria-orientation` | `'vertical'` | `false` | — |
| `data-tone` | `'gold' \| 'primary' \| 'tertiary'` | `false` | — |

Divider has no JavaScript controller. The markup is the API: write a native `hr` element with the class `hw-divider`. Without further attributes the line is horizontal, takes the full inline size of its container and has a block margin above and below. `aria-orientation="vertical"` selects the vertical line, which has no block margin. `data-tone` takes `primary`, `gold` or `tertiary`; without it the line has the border colour.

### React

Table: Props of Divider

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `tone` | `'neutral' \| 'primary' \| 'gold' \| 'tertiary'` | `false` | — |
| `orientation` | `'horizontal' \| 'vertical'` | `false` | — |

Divider renders a native `hr` element and passes its other props to it. `tone` is written as `data-tone` and `orientation` as `aria-orientation`; with no value neither attribute is written, so the line is horizontal. The `horizontal` orientation writes an attribute that the stylesheet does not select, so it looks like the default. The `neutral` tone writes `data-tone`, which the stylesheet selects, and the line keeps the border colour.

### Vue

Table: Props, events and slots of Divider

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `tone` | prop | `'neutral' \| 'primary' \| 'gold' \| 'tertiary'` | `false` | — |
| `orientation` | prop | `'horizontal' \| 'vertical'` | `false` | — |

Divider renders a native `hr` element, and the attributes that are not props reach it. `tone` is written as `data-tone` and `orientation` as `aria-orientation`. The component has no slot and no event.

### Angular

Table: Inputs, outputs and content of hw-divider

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `tone` | input | `'neutral' \| 'primary' \| 'gold' \| 'tertiary'` | `false` | — |
| `orientation` | input | `'horizontal' \| 'vertical'` | `false` | — |

`HwDividerComponent` applies to `hw-divider` and renders the `hr` element with the class `hw-divider` inside its host. `tone` is written as `data-tone` and `orientation` as `aria-orientation`. The host takes no box of its own while it holds a vertical line, so the line is laid out as a child of the container.

## Accessibility

Divider renders a native `hr` element, which a browser exposes as a separator. The line has no text and takes no focus, and it has no keyboard interaction.

- Use a divider where the content on its two sides differs in subject. A divider does not replace a heading: a reader of assistive technology navigates a page by its headings, so name each part with one.
- `aria-orientation` states the orientation of the separator to assistive technology as well as selecting the vertical line in the stylesheet.
- A toned line is only a visual accent. State a difference in meaning in text, and do not rely on the colour of the line.

## RTL and localisation

Divider has no text. The vertical line has an inline margin at both sides, written with logical properties, so the spacing is the same in both reading directions. A horizontal line takes the full inline size of its container in both directions.

- A divider in a row separates the items in reading order: the item that comes first in the source appears at the reading start in Arabic and in English.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Divider; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- Divider is listed among the initial presentation components of the component scope in the [coverage notes](../coverage.md).
- The [foundations notes](../nic-foundations.md) record the divider of the supplied Platforms Code style sheet as a line of 1px with neutral, primary, gold or lavender colouring, and the four tones of Divider as following its light values.
