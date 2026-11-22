# DescriptionList

DescriptionList shows terms and their descriptions as structured metadata in a native description list. It suits the facts of a record, such as the details of a service request.

## Example

Each item holds a term and a description.

```html live example=basic
<dl class="hw-description-list">
  <div><dt>Reference number</dt><dd>SR-2041</dd></div>
  <div><dt>Service</dt><dd>Copy of a document</dd></div>
  <div><dt>Status</dt><dd>Under review</dd></div>
</dl>
```

```tsx live example=basic
<DescriptionList
  items={[
    { term: 'Reference number', description: 'SR-2041' },
    { term: 'Service', description: 'Copy of a document' },
    { term: 'Status', description: 'Under review' },
  ]}
/>
```

```vue live example=basic
<DescriptionList
  :items="[
    { term: 'Reference number', description: 'SR-2041' },
    { term: 'Service', description: 'Copy of a document' },
    { term: 'Status', description: 'Under review' },
  ]"
/>
```

```ts live example=basic framework=angular
template: `<hw-description-list
  [items]="[
    { term: 'Reference number', description: 'SR-2041' },
    { term: 'Service', description: 'Copy of a document' },
    { term: 'Status', description: 'Under review' },
  ]"
/>`
```

## Variants and states

### Horizontal

The horizontal variant places each term and its description side by side. Use it for short terms in a wide container; below a viewport width of 40rem the stylesheet stacks the term and the description again.

```html live example=horizontal
<dl class="hw-description-list" data-variant="horizontal">
  <div><dt>Reference number</dt><dd>SR-2041</dd></div>
  <div><dt>Service</dt><dd>Copy of a document</dd></div>
  <div><dt>Status</dt><dd>Under review</dd></div>
</dl>
```

```tsx live example=horizontal
<DescriptionList
  variant="horizontal"
  items={[
    { term: 'Reference number', description: 'SR-2041' },
    { term: 'Service', description: 'Copy of a document' },
    { term: 'Status', description: 'Under review' },
  ]}
/>
```

```vue live example=horizontal
<DescriptionList
  variant="horizontal"
  :items="[
    { term: 'Reference number', description: 'SR-2041' },
    { term: 'Service', description: 'Copy of a document' },
    { term: 'Status', description: 'Under review' },
  ]"
/>
```

```ts live example=horizontal framework=angular
template: `<hw-description-list
  variant="horizontal"
  [items]="[
    { term: 'Reference number', description: 'SR-2041' },
    { term: 'Service', description: 'Copy of a document' },
    { term: 'Status', description: 'Under review' },
  ]"
/>`
```

### Compact

The compact variant reduces the vertical spacing of each group. Use it where the list sits inside a card or a side panel.

```html live example=compact
<dl class="hw-description-list" data-variant="compact">
  <div><dt>Reference number</dt><dd>SR-2041</dd></div>
  <div><dt>Service</dt><dd>Copy of a document</dd></div>
  <div><dt>Status</dt><dd>Under review</dd></div>
</dl>
```

```tsx live example=compact
<DescriptionList
  variant="compact"
  items={[
    { term: 'Reference number', description: 'SR-2041' },
    { term: 'Service', description: 'Copy of a document' },
    { term: 'Status', description: 'Under review' },
  ]}
/>
```

```vue live example=compact
<DescriptionList
  variant="compact"
  :items="[
    { term: 'Reference number', description: 'SR-2041' },
    { term: 'Service', description: 'Copy of a document' },
    { term: 'Status', description: 'Under review' },
  ]"
/>
```

```ts live example=compact framework=angular
template: `<hw-description-list
  variant="compact"
  [items]="[
    { term: 'Reference number', description: 'SR-2041' },
    { term: 'Service', description: 'Copy of a document' },
    { term: 'Status', description: 'Under review' },
  ]"
/>`
```

## API

### JavaScript

Table: Attributes of the hw-description-list element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-description-list'` | `true` | — |
| `data-variant` | `'compact' \| 'horizontal'` | `false` | — |

> [!NOTE]
> These classes and attributes are read from the published stylesheet and are outside the stable contract of 0.3.0.

DescriptionList has no JavaScript controller. The markup is the API: write a `dl` element with the class `hw-description-list` and, for each pair, a `div` that holds one `dt` and one `dd`. The `data-variant` attribute is optional: `horizontal` places the term and the description side by side and `compact` reduces the spacing. The vanilla README writes `data-variant="horizontal"` only for that layout; without the attribute the list is stacked.

### React

Table: Props of DescriptionList

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `items` | `readonly DescriptionItem[]` | `true` | — |
| `variant` | `'stacked' \| 'horizontal' \| 'compact'` | `false` | — |

The `items` prop is required. Each item of type `DescriptionItem` has a `term` and a `description`, both React nodes, and an optional `key`. The `variant` prop writes `data-variant` when it is given, and the stylesheet styles only `horizontal` and `compact`, so `stacked` is the layout of a list without the attribute.

### Vue

Table: Props, events and slots of DescriptionList

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `items` | prop | `readonly DescriptionItem[]` | `true` | — |
| `variant` | prop | `'stacked' \| 'horizontal' \| 'compact'` | `false` | — |
| `item:<index>` | slot | — | `false` | — |

The `items` prop is required. Each item has a `term` as a string and a `description` that can be any renderable content. The `variant` prop writes `data-variant` when it is given, and the stylesheet styles only `horizontal` and `compact`, so `stacked` is the layout of a list without the attribute. The slot `item:<index>` replaces the description of the item at that position and receives that item.

### Angular

Table: Inputs, outputs and content of hw-description-list

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `items` | input | `readonly HwDescription[]` | `false` | `[]` |
| `variant` | input | `'stacked' \| 'horizontal' \| 'compact'` | `false` | — |
| `*` | content | — | `false` | — |

`HwDescriptionListComponent` applies to `hw-description-list`, which wraps the `dl` and is a block box. Each item of type `HwDescription` has a `term` and a `description`, both strings. The `variant` input writes `data-variant` when it is given, and the stylesheet styles only `horizontal` and `compact`, so `stacked` is the layout of a list without the attribute. Content that the application projects is placed after the items, and the Angular README suggests it for richer native `dt` and `dd` elements.

## Accessibility

DescriptionList renders a native `dl` element, whose `dt` and `dd` elements assistive technology exposes as a list of terms and descriptions, so no role or label is added.

- Each pair stands in one `div` inside the `dl`.
- Write the term as a short noun phrase and put the value in the description. A reader who moves through the list hears each term before its value.
- The list is not interactive and has no focusable element. Content that the application places in a description, such as a link, keeps its own keyboard behaviour.
- Do not use a description list for layout or for a table of rows and columns; use a table for data that has several values per row.

## RTL and localisation

DescriptionList has no built-in text. The terms and the descriptions are written by the application in the language of the page, and the list follows the page direction, so a term starts at the reading start in Arabic and in English.

- In the horizontal variant the term column is at the reading start and the description column follows it, in both directions.
- Write numbers, dates and amounts in the description in the form the application uses for its locale; the list does not format or reorder them.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of DescriptionList; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- DescriptionList is listed among the additional content components of the component scope in the [coverage notes](../coverage.md). The notes record no separate note for it.
