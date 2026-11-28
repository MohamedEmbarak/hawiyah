# Spinner

Spinner is a compact indeterminate loading indicator for an action or a region whose duration is not known. It is one element with `role="status"` that holds its visually hidden name.

## Example

The `label` is a visually hidden text inside the status element, so a screen reader announces what is loading. Write it for the context, such as the request that is being loaded.

```html live example=basic static
<span class="hw-spinner" role="status"><span class="hw-sr-only">Loading your request</span></span>
```

```tsx live example=basic
<Spinner label="Loading your request" />
```

```vue live example=basic
<Spinner label="Loading your request" />
```

```ts live example=basic framework=angular
template: `<hw-spinner label="Loading your request" />`
```

## Variants and states

### Size

`size` takes `sm` or `lg`. Without it the spinner has the default size of 1.25rem.

```html live example=sizes static
<div class="hw-inline">
  <span class="hw-spinner" role="status" data-size="sm"><span class="hw-sr-only">Loading the list of documents</span></span>
  <span class="hw-spinner" role="status" data-size="lg"><span class="hw-sr-only">Loading the details of the request</span></span>
</div>
```

```tsx live example=sizes
<div className="hw-inline">
  <Spinner size="sm" label="Loading the list of documents" />
  <Spinner size="lg" label="Loading the details of the request" />
</div>
```

```vue live example=sizes
<div class="hw-inline">
  <Spinner size="sm" label="Loading the list of documents" />
  <Spinner size="lg" label="Loading the details of the request" />
</div>
```

```ts live example=sizes framework=angular
template: `<div class="hw-inline">
  <hw-spinner size="sm" label="Loading the list of documents" />
  <hw-spinner size="lg" label="Loading the details of the request" />
</div>`
```

### Beside visible text

When the text next to the spinner already says what is happening, mark the spinner `aria-hidden="true"`. It then needs no name, and the visible text is the only message.

```html live example=decorative static
<div class="hw-inline">
  <span class="hw-spinner" role="status" aria-hidden="true"></span>
  <span>Saving your changes</span>
</div>
```

```tsx live example=decorative
<div className="hw-inline">
  <Spinner aria-hidden="true" />
  <span>Saving your changes</span>
</div>
```

```vue live example=decorative
<div class="hw-inline">
  <Spinner aria-hidden="true" />
  <span>Saving your changes</span>
</div>
```

```ts live example=decorative framework=angular
template: `<div class="hw-inline">
  <hw-spinner aria-hidden="true" />
  <span>Saving your changes</span>
</div>`
```

## API

### JavaScript

Table: Attributes of the hw-spinner element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-spinner'` | `true` | — |
| `data-size` | `'lg' \| 'sm'` | `false` | — |

Spinner has no JavaScript controller. The markup is the API: write a `span` with the class `hw-spinner` and `role="status"` that holds a `span` with the class `hw-sr-only` and the loading text. `data-size` is optional: `sm` and `lg` change the size, and without it the spinner has the default size. For a decorative spinner beside visible text, write `aria-hidden="true"` on the element and omit the hidden text.

### React

Table: Props of Spinner

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `aria-hidden` | `true \| 'true'` | `false` | — |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `size` | `'sm' \| 'lg'` | `false` | — |
| `label` | `string` | `false` | — |

Spinner renders one `span` with the class `hw-spinner` and `role="status"`. `label` is the visually hidden text inside it and is the accessible name. A spinner needs a name: pass `label`, `aria-label` or `aria-labelledby`, or pass `aria-hidden` with the value `true` for a decorative spinner, which needs none; with none of these the component issues a warning in development builds. `size` takes `sm` or `lg`. Other attributes, such as `className`, reach the `span`.

### Vue

Table: Props, events and slots of Spinner

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `label` | prop | `string` | `false` | — |
| `size` | prop | `'sm' \| 'lg'` | `false` | — |

Spinner renders one `span` with the class `hw-spinner` and `role="status"`. `label` is the visually hidden text inside it and is the accessible name; without a label the component renders no hidden text. A spinner needs a name: pass `label`, `aria-label` or `aria-labelledby`, or write `aria-hidden="true"` for a decorative spinner, which needs none; with none of these the component issues a warning in development builds. `size` takes `sm` or `lg`. Other attributes, such as `class`, reach the `span`. The published declaration types no slot, and the build reads none.

### Angular

Table: Inputs, outputs and content of hw-spinner

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `label` | input | `string` | `false` | `''` |
| `size` | input | `'sm' \| 'lg'` | `false` | — |

`HwSpinnerComponent` applies to `hw-spinner`, and its host element is the spinner itself: the class `hw-spinner` and `role="status"` stand on the host. `label` is the visually hidden text inside the host and is the accessible name. Write `aria-label` or `aria-labelledby` on the element instead, or `aria-hidden="true"` for a decorative spinner; with none of these and no `label` the component issues a warning in development builds. `size` takes `sm` or `lg`.

## Accessibility

The spinner is one element with `role="status"` that holds its visually hidden name. The name is the text the application supplies; the spinner has no text of its own.

- Name the spinner with the hidden text of `label`, or with `aria-label` or `aria-labelledby`, in a form that tells the reader what is loading.
- A decorative spinner beside visible text carries `aria-hidden="true"`, so the text is not announced twice.
- The stylesheet turns the rotation off when the reader asks for reduced motion, and in forced colours the spinner is drawn with system colours.
- A spinner is not focusable and does not take part in the tab order.

## RTL and localisation

Spinner has no built-in text. The name is written by the application in the language of the page. The ring is open on its end side, a gap that the stylesheet sets with a logical property, so the gap follows the reading direction.

- Next to visible text, put the spinner and the text in an inline layout so that the spinner stands at the reading start in both directions.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Spinner; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- Spinner is listed among the initial presentation components of the component scope in the [coverage notes](../coverage.md). The notes record no mapping of a supplied Platforms Code source for it.
- The supplied Platforms Code spinner is mapped as four linear quarter-turns. The default Platforms Code foundation of `@hawiyah/styles` rotates the spinner in 1000 ms, Hawiyah keeps a 700 ms default, and the mapping does not establish visual parity; the [DGA reference notes](../dga-reference.md) record it.
