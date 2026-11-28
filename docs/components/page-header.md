# PageHeader

PageHeader opens a page or a section with its title, an optional description, an optional breadcrumb and an optional group of actions. The title is a heading element whose level the application chooses, and the application owns every text and every action.

## Example

The title names the page and the description states what the reader can do there. The one action stands at the end of the title row and wraps below it when the row is narrow.

```html live example=basic frame
<header class="hw-page-header">
  <div class="hw-page-header-main">
    <div><h1>Service requests</h1><p>Review the requests you have submitted and start a new one.</p></div>
    <div class="hw-page-header-actions"><button class="hw-button" type="button" data-variant="primary" data-size="md">New request</button></div>
  </div>
</header>
```

```tsx live example=basic
<PageHeader
  title="Service requests"
  description="Review the requests you have submitted and start a new one."
  actions={<Button variant="primary">New request</Button>}
/>
```

```vue live example=basic
<PageHeader title="Service requests" description="Review the requests you have submitted and start a new one.">
  <template #actions><Button variant="primary">New request</Button></template>
</PageHeader>
```

```ts live example=basic framework=angular
template: `<hw-page-header title="Service requests" description="Review the requests you have submitted and start a new one.">
  <button hwButton variant="primary">New request</button>
</hw-page-header>`
```

## Variants and states

### Breadcrumb

A breadcrumb stands above the title row and takes the full width. The application supplies it with the Breadcrumb component, which names its landmark and marks the current page.

```html live example=breadcrumb frame
<header class="hw-page-header">
  <nav class="hw-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="/services">Services</a></li><li><a href="/services/requests">Requests</a></li><li><span aria-current="page">Request SR-2041</span></li></ol></nav>
  <div class="hw-page-header-main">
    <div><h1>Request SR-2041</h1><p>Submitted on 4 March. The request is under review.</p></div>
    <div class="hw-page-header-actions"><button class="hw-button" type="button" data-variant="secondary" data-size="md">Download summary</button></div>
  </div>
</header>
```

```tsx live example=breadcrumb
<PageHeader
  title="Request SR-2041"
  description="Submitted on 4 March. The request is under review."
  breadcrumb={
    <Breadcrumb
      label="Breadcrumb"
      items={[
        { label: 'Services', href: '/services' },
        { label: 'Requests', href: '/services/requests' },
        { label: 'Request SR-2041' },
      ]}
    />
  }
  actions={<Button variant="secondary">Download summary</Button>}
/>
```

```vue live example=breadcrumb
<PageHeader title="Request SR-2041" description="Submitted on 4 March. The request is under review.">
  <template #breadcrumb>
    <Breadcrumb
      label="Breadcrumb"
      :items="[
        { label: 'Services', href: '/services' },
        { label: 'Requests', href: '/services/requests' },
        { label: 'Request SR-2041' },
      ]"
    />
  </template>
  <template #actions><Button variant="secondary">Download summary</Button></template>
</PageHeader>
```

```ts live example=breadcrumb framework=angular
template: `<hw-page-header title="Request SR-2041" description="Submitted on 4 March. The request is under review.">
  <hw-breadcrumb
    hwBreadcrumb
    label="Breadcrumb"
    [items]="[
      { label: 'Services', href: '/services' },
      { label: 'Requests', href: '/services/requests' },
      { label: 'Request SR-2041' },
    ]"
  />
  <button hwButton variant="secondary">Download summary</button>
</hw-page-header>`
```

### Heading level

The title is an `h1` by default. A header inside a page that already has its `h1` takes a lower level, so that the page keeps one first-level heading and an unbroken heading order. The level changes the element only; the title keeps its size.

```html live example=level
<header class="hw-page-header">
  <div class="hw-page-header-main">
    <div><h2>Submitted documents</h2><p>Documents attached to this request.</p></div>
    <div class="hw-page-header-actions"><button class="hw-button" type="button" data-variant="secondary" data-size="md">Add document</button></div>
  </div>
</header>
```

```tsx live example=level
<PageHeader
  level={2}
  title="Submitted documents"
  description="Documents attached to this request."
  actions={<Button variant="secondary">Add document</Button>}
/>
```

```vue live example=level
<PageHeader :level="2" title="Submitted documents" description="Documents attached to this request.">
  <template #actions><Button variant="secondary">Add document</Button></template>
</PageHeader>
```

```ts live example=level framework=angular
template: `<hw-page-header [level]="2" title="Submitted documents" description="Documents attached to this request.">
  <button hwButton variant="secondary">Add document</button>
</hw-page-header>`
```

## API

### JavaScript

Table: Attributes of the hw-page-header element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-page-header'` | `true` | — |

> [!NOTE]
> These classes and attributes are read from the published stylesheet and are outside the stable contract of 0.3.0.

PageHeader has no JavaScript controller. The markup is the API: write a `header` with the class `hw-page-header`. A breadcrumb, when there is one, is its first child. The title row is a `div` with the class `hw-page-header-main` that holds a `div` with the heading element and the description paragraph and, for the actions, a `div` with the class `hw-page-header-actions`. The `div` with the heading may carry the class `hw-page-header-content`, which the stylesheet gives the same rule as the first `div` without it. The author chooses the heading element, `h1` to `h6`; the stylesheet gives the title the same size at every level.

### React

Table: Props of PageHeader

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `title` | `ReactNode` | `true` | — |
| `description` | `ReactNode` | `false` | — |
| `breadcrumb` | `ReactNode` | `false` | — |
| `actions` | `ReactNode` | `false` | — |
| `level` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `false` | `1` |

The title is required and renders in the heading element that `level` selects. `level` takes 1 to 6 and defaults to `1`; a value outside the range is truncated and clamped. The description renders as a paragraph below the title. `breadcrumb` renders before the title row, and `actions` render in a `div` with the class `hw-page-header-actions` that exists only when `actions` is given. Child content renders inside the title block, after the description. The component renders a `header` element and passes the other props to it.

### Vue

Table: Props, events and slots of PageHeader

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `title` | prop | `string` | `false` | — |
| `description` | prop | `string` | `false` | — |
| `level` | prop | `number` | `false` | `1` |
| `as` | prop | `string` | `false` | `'div'` |
| `gap` | prop | `LayoutProps['gap']` | `false` | — |
| `padding` | prop | `LayoutProps['padding']` | `false` | — |
| `align` | prop | `'center' \| 'start' \| 'end' \| 'stretch' \| 'baseline'` | `false` | — |
| `justify` | prop | `'center' \| 'start' \| 'end' \| 'between' \| 'around' \| 'evenly'` | `false` | — |
| `wrap` | prop | `boolean` | `false` | — |
| `columns` | prop | `LayoutProps['columns']` | `false` | — |
| `minItemWidth` | prop | `string` | `false` | — |
| `side` | prop | `'start' \| 'end'` | `false` | `'start'` |
| `sidebarWidth` | prop | `string` | `false` | — |
| `collapseAt` | prop | `'md' \| 'sm' \| 'lg'` | `false` | `'md'` |
| `maxWidth` | prop | `string` | `false` | — |
| `ratio` | prop | `number` | `false` | — |
| `breadcrumb` | slot | — | `false` | — |
| `title` | slot | — | `false` | — |
| `actions` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |

The `title` prop is required unless the `title` slot supplies the heading content; the slot replaces the prop. `level` renders the title in the matching heading element, from 1 to 6, and a fractional or out-of-range value is truncated and clamped. The `breadcrumb` slot renders before the title row, and the `actions` slot renders in a `div` with the class `hw-page-header-actions` that exists only when the slot is given. The default slot renders after the title row, as a direct child of the header. The layout props are written as layout custom properties on the header, and only `gap`, `align`, `justify` and `wrap` are read by the stylesheet of the header; `padding`, `columns`, `minItemWidth`, `sidebarWidth`, `maxWidth` and `ratio` have no effect on it. `side` and `collapseAt` are not written at all, and `as` is ignored: the outer element is always a `header`.

### Angular

Table: Inputs, outputs and content of hw-page-header

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
| `title` | input | `string` | `true` | — |
| `description` | input | `string` | `false` | `''` |
| `level` | input | `number` | `false` | `1` |
| `[hwBreadcrumb]` | content | — | `false` | — |
| `*` | content | — | `false` | — |

`HwPageHeaderComponent` applies to `hw-page-header`, and its host wraps a `header` element with the class `hw-page-header`, because a host cannot be a `header` element. `title` is required and renders in the heading element chosen by `level`, which takes 1 to 6, defaults to `1` and is truncated and clamped. `description` renders as a paragraph when it is not empty. Content marked `hwBreadcrumb` renders before the title row, and all other projected content renders as the actions, in a `div` with the class `hw-page-header-actions` that is always present: it is empty when no action is projected. The layout inputs are written as layout custom properties on the header, and only `gap`, `align`, `justify` and `wrap` are read by the stylesheet of the header; the other layout inputs have no effect on it.

## Accessibility

PageHeader renders a native `header` element with the title in a heading element, followed by the description paragraph and the actions. Nothing in it is interactive: a breadcrumb, a link or a button that the application places in it keeps its own keyboard behaviour and accessible name.

- Use one `h1` for each page. The first page header of a page keeps `level` at `1`, and a header that introduces a section below it takes `2` or a lower level, so that the heading order has no gap.
- The breadcrumb stands first in the source order and the actions stand last, so the tab order follows the reading order. The layout wraps the actions below the title; it never reorders them.
- Give the breadcrumb a name through the `label` of the Breadcrumb component: the breadcrumb is a `nav` landmark, and its current item is text that carries `aria-current="page"`.
- Give an icon-only action an accessible name of its own. PageHeader adds none.
- The description is a paragraph, not part of the heading. Keep the title short enough to name the page, and put detail in the description.

> [!NOTE]
> A `header` element is a banner landmark only where it is not inside an `article`, `aside`, `main`, `nav` or `section` element. The banner of a portal belongs to the portal header, not to the page header.

## RTL and localisation

PageHeader has no built-in text. The title, the description and the text of the actions are written by the application in the language of the page.

- The title block stands at the reading start and the actions at the reading end, in the page direction, so the row mirrors in right-to-left pages without a setting.
- The description is limited to a readable line length and wraps. Long Arabic action labels wrap the actions below the title instead of overflowing, so do not give an action a fixed width.
- The breadcrumb, when supplied, takes the page direction like the rest of the header; the application writes its item labels in the language of the page.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of PageHeader; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- PageHeader is listed in the Layout group of the component scope in the [coverage notes](../coverage.md), and not among the platform patterns.
- The anatomy of the header, with its main row, content and actions, and the behaviour of the actions at narrow widths are described in the [layout notes](../layout.md).
