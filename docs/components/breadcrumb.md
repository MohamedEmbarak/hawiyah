# Breadcrumb

Breadcrumb is a navigation landmark that lists the pages between the start of a service portal and the page the reader is on. The page the reader is on is text that carries `aria-current="page"`; the items above it are links.

## Example

The landmark has a name, and the last item is the current page. Earlier items link to the pages above it.

```html live example=basic
<nav class="hw-breadcrumb" aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/requests">Requests</a></li>
    <li><span aria-current="page">Request 2041</span></li>
  </ol>
</nav>
```

```tsx live example=basic
<Breadcrumb
  label="Breadcrumb"
  items={[
    { label: 'Home', href: '/' },
    { label: 'Requests', href: '/requests' },
    { label: 'Request 2041' },
  ]}
/>
```

```vue live example=basic
<Breadcrumb
  label="Breadcrumb"
  :items="[
    { label: 'Home', href: '/' },
    { label: 'Requests', href: '/requests' },
    { label: 'Request 2041' },
  ]"
/>
```

```ts live example=basic framework=angular
template: `<hw-breadcrumb
  label="Breadcrumb"
  [items]="[
    { label: 'Home', href: '/' },
    { label: 'Requests', href: '/requests' },
    { label: 'Request 2041' },
  ]"
/>`
```

## Variants and states

### Chosen current item

`current` set to true on an item chooses the current page. Without it the last item is current. An item after the current one is text, not a link, because it has no `href`.

```html live example=current
<nav class="hw-breadcrumb" aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><span aria-current="page">Requests</span></li>
    <li><span>Request 2041</span></li>
  </ol>
</nav>
```

```tsx live example=current
<Breadcrumb
  label="Breadcrumb"
  items={[
    { label: 'Home', href: '/' },
    { label: 'Requests', href: '/requests', current: true },
    { label: 'Request 2041' },
  ]}
/>
```

```vue live example=current
<Breadcrumb
  label="Breadcrumb"
  :items="[
    { label: 'Home', href: '/' },
    { label: 'Requests', href: '/requests', current: true },
    { label: 'Request 2041' },
  ]"
/>
```

```ts live example=current framework=angular
template: `<hw-breadcrumb
  label="Breadcrumb"
  [items]="[
    { label: 'Home', href: '/' },
    { label: 'Requests', href: '/requests', current: true },
    { label: 'Request 2041' },
  ]"
/>`
```

### Disabled item

A disabled item has no destination. It renders as text with the role `link` and `aria-disabled="true"`, and it is not a tab stop.

```html live example=disabled
<nav class="hw-breadcrumb" aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><span role="link" aria-disabled="true">Archive</span></li>
    <li><span aria-current="page">Request 2041</span></li>
  </ol>
</nav>
```

```tsx live example=disabled
<Breadcrumb
  label="Breadcrumb"
  items={[
    { label: 'Home', href: '/' },
    { label: 'Archive', href: '/archive', disabled: true },
    { label: 'Request 2041' },
  ]}
/>
```

```vue live example=disabled
<Breadcrumb
  label="Breadcrumb"
  :items="[
    { label: 'Home', href: '/' },
    { label: 'Archive', href: '/archive', disabled: true },
    { label: 'Request 2041' },
  ]"
/>
```

```ts live example=disabled framework=angular
template: `<hw-breadcrumb
  label="Breadcrumb"
  [items]="[
    { label: 'Home', href: '/' },
    { label: 'Archive', href: '/archive', disabled: true },
    { label: 'Request 2041' },
  ]"
/>`
```

## API

### JavaScript

Table: Attributes of the hw-breadcrumb element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-breadcrumb'` | `true` | — |
| `aria-current` | `'page'` | `false` | — |

Breadcrumb has no JavaScript controller. The markup is the API: write a `nav` element with the class `hw-breadcrumb` and a name from `aria-label` or `aria-labelledby`, an `ol` inside it and one `li` for each item. An earlier item is an `a` with an `href`; the current item is a `span` with `aria-current="page"` and is not a link. The stylesheet draws the separator between items, so write none.

### React

Table: Props of Breadcrumb

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `items` | `readonly BreadcrumbItem[]` | `true` | — |
| `label` | `string` | `false` | — |

Each item of `items` has a `label`, and optionally `href`, `current` and `disabled`. The current item is the first item with `current`, otherwise the last item; it renders as a `span` with `aria-current="page"` and never as a link, also when it has an `href`. An item with an `href` that is neither current nor disabled renders as a link, and any other item renders as text. A disabled item renders as a `span` with the role `link` and `aria-disabled`, without an `href`. The landmark is named by `label`, or by the `aria-label` or `aria-labelledby` prop.

### Vue

Table: Props, events and slots of Breadcrumb

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `items` | prop | `readonly BreadcrumbItem[]` | `true` | — |
| `label` | prop | `string` | `false` | — |

`items` has the same fields as in React, with a string `label`. The current item is the first item with `current` set to true, otherwise the last item, and it renders as text with `aria-current="page"`. A disabled item renders as a `span` with the role `link` and `aria-disabled`. The landmark is named by `label`, or by `aria-label` or `aria-labelledby` written on the component. The component declares no slot.

### Angular

Table: Inputs, outputs and content of hw-breadcrumb

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `label` | input | `string` | `false` | `''` |
| `items` | input | `readonly HwBreadcrumbItem[]` | `false` | `[]` |

`HwBreadcrumbComponent` applies to `hw-breadcrumb`. `items` takes objects with `label`, and optionally `href`, `current` and `disabled`. The current item is the first item with `current` set to true, otherwise the last item, and it renders as a `span` with `aria-current="page"`. `label` is required unless `aria-label` or `aria-labelledby` is written on `hw-breadcrumb`; the attributes are forwarded to the `nav` element and are not kept on the host. `aria-describedby` is forwarded to the `nav` element in the same way.

## Accessibility

Breadcrumb renders a `nav` element, so the browser exposes a navigation landmark, and the list inside it is an ordered list in reading order. The landmark needs a name that tells it apart from the other navigation landmarks of the page.

- The current item is text with `aria-current="page"` in every adapter. It is not a link and not a tab stop, so keyboard focus passes through the other items that have an `href` and are neither current nor disabled.
- A disabled item has no `href` and is not focusable. It keeps the role `link` with `aria-disabled="true"` so that assistive technology reports an unavailable destination.
- The separator is drawn by the stylesheet as generated content. In the default theme and the Platforms Code theme it is an empty chevron shape without text; under `data-hw-theme="hawiyah"` it is the character `/`, which the stylesheet generates and which assistive technology may read.
- The stylesheet removes the colour transition of the links when the reader asks for reduced motion.
- Write link text that names the page, such as "Requests", because a reader of a link list meets the items without the path around them.

## RTL and localisation

Breadcrumb has no built-in text. The label of the landmark and the label of every item are written by the application in the language of the page, and the order of `items` is the order of reading, from the start of the portal to the current page.

- The list follows the direction of the page: the first item stands at the reading start, so in Arabic the path runs from right to left.
- The separator between items is a chevron that turns with the direction of the page. Only under `data-hw-theme="hawiyah"`, the original palette, does the stylesheet draw a slash instead.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Breadcrumb; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The breadcrumb size, gap, colour transition, neutral states and separator of the supplied Platforms Code style sheet are mapped in the [link and breadcrumb notes](../nic-links.md), with the confidence of each mapping.
- The separator is a CSS shape and not an icon-font glyph, because the private glyphs of the source are not bundled; this adaptation and the contrast substitutions are documented in the [link and breadcrumb notes](../nic-links.md).
