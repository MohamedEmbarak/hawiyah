# Sidebar

Sidebar places a secondary column of navigation or context next to the main content of a page. It is a layout primitive without behaviour of its own, and below a breakpoint that the stylesheet defines it stacks the two areas in one column.

## Example

A sidebar holds exactly two children: the secondary area first and the main content second. The secondary area here is a navigation landmark with its own name, and the main content follows it in source order and in reading order.

```html live example=basic static differences=sidebar-adapter-layout-attributes
<div class="hw-sidebar">
  <nav aria-label="Request sections">
    <ul>
      <li><a href="/requests/2041/details">Details</a></li>
      <li><a href="/requests/2041/documents">Documents</a></li>
      <li><a href="/requests/2041/history">History</a></li>
    </ul>
  </nav>
  <div>
    <h2>Request 2041</h2>
    <p>The request is under review. A decision is expected within five working days.</p>
  </div>
</div>
```

```tsx live example=basic
<Sidebar>
  <nav aria-label="Request sections">
    <ul>
      <li><a href="/requests/2041/details">Details</a></li>
      <li><a href="/requests/2041/documents">Documents</a></li>
      <li><a href="/requests/2041/history">History</a></li>
    </ul>
  </nav>
  <div>
    <h2>Request 2041</h2>
    <p>The request is under review. A decision is expected within five working days.</p>
  </div>
</Sidebar>
```

```vue live example=basic
<Sidebar>
  <nav aria-label="Request sections">
    <ul>
      <li><a href="/requests/2041/details">Details</a></li>
      <li><a href="/requests/2041/documents">Documents</a></li>
      <li><a href="/requests/2041/history">History</a></li>
    </ul>
  </nav>
  <div>
    <h2>Request 2041</h2>
    <p>The request is under review. A decision is expected within five working days.</p>
  </div>
</Sidebar>
```

```ts live example=basic framework=angular
template: `<hw-sidebar>
  <nav hwSidebar aria-label="Request sections">
    <ul>
      <li><a href="/requests/2041/details">Details</a></li>
      <li><a href="/requests/2041/documents">Documents</a></li>
      <li><a href="/requests/2041/history">History</a></li>
    </ul>
  </nav>
  <div>
    <h2>Request 2041</h2>
    <p>The request is under review. A decision is expected within five working days.</p>
  </div>
</hw-sidebar>`
```

## Variants and states

### Side

`side` with the value `end` moves the secondary area, from the breakpoint, to the end of the row: the right edge in a left-to-right page and the left edge in a right-to-left page. The source order does not change, so the secondary area is still read and focused first.

```html live example=side static differences=sidebar-adapter-layout-attributes
<div class="hw-sidebar" data-side="end">
  <aside aria-label="Request summary">
    <p>Reference: 2041</p>
    <p>Status: under review</p>
  </aside>
  <div>
    <h2>Supporting documents</h2>
    <p>Two documents are attached to the request.</p>
  </div>
</div>
```

```tsx live example=side
<Sidebar side="end">
  <aside aria-label="Request summary">
    <p>Reference: 2041</p>
    <p>Status: under review</p>
  </aside>
  <div>
    <h2>Supporting documents</h2>
    <p>Two documents are attached to the request.</p>
  </div>
</Sidebar>
```

```vue live example=side
<Sidebar side="end">
  <aside aria-label="Request summary">
    <p>Reference: 2041</p>
    <p>Status: under review</p>
  </aside>
  <div>
    <h2>Supporting documents</h2>
    <p>Two documents are attached to the request.</p>
  </div>
</Sidebar>
```

```ts live example=side framework=angular
template: `<hw-sidebar side="end">
  <aside hwSidebar aria-label="Request summary">
    <p>Reference: 2041</p>
    <p>Status: under review</p>
  </aside>
  <div>
    <h2>Supporting documents</h2>
    <p>Two documents are attached to the request.</p>
  </div>
</hw-sidebar>`
```

### Width and gap

`sidebarWidth` sets the width of the secondary area as a CSS length, and `gap` sets the space between the two areas as a spacing token. From the breakpoint, the area never takes more than 40% of the width of the sidebar. The React, Vue and Angular adapters write both values as custom properties on the element, and the markup of the JavaScript block writes the same custom properties in a style attribute.

```html live example=width static differences=sidebar-adapter-layout-attributes
<div class="hw-sidebar" style="--hw-layout-sidebar-width: 14rem; --hw-layout-gap: var(--hw-space-8, 2rem)">
  <nav aria-label="Service categories">
    <ul>
      <li><a href="/services/documents">Documents</a></li>
      <li><a href="/services/payments">Payments</a></li>
      <li><a href="/services/profile">Profile</a></li>
    </ul>
  </nav>
  <div>
    <h2>Documents</h2>
    <p>Request, renew or replace a document.</p>
  </div>
</div>
```

```tsx live example=width
<Sidebar sidebarWidth="14rem" gap={8}>
  <nav aria-label="Service categories">
    <ul>
      <li><a href="/services/documents">Documents</a></li>
      <li><a href="/services/payments">Payments</a></li>
      <li><a href="/services/profile">Profile</a></li>
    </ul>
  </nav>
  <div>
    <h2>Documents</h2>
    <p>Request, renew or replace a document.</p>
  </div>
</Sidebar>
```

```vue live example=width
<Sidebar sidebar-width="14rem" :gap="8">
  <nav aria-label="Service categories">
    <ul>
      <li><a href="/services/documents">Documents</a></li>
      <li><a href="/services/payments">Payments</a></li>
      <li><a href="/services/profile">Profile</a></li>
    </ul>
  </nav>
  <div>
    <h2>Documents</h2>
    <p>Request, renew or replace a document.</p>
  </div>
</Sidebar>
```

```ts live example=width framework=angular
template: `<hw-sidebar sidebarWidth="14rem" [gap]="8">
  <nav hwSidebar aria-label="Service categories">
    <ul>
      <li><a href="/services/documents">Documents</a></li>
      <li><a href="/services/payments">Payments</a></li>
      <li><a href="/services/profile">Profile</a></li>
    </ul>
  </nav>
  <div>
    <h2>Documents</h2>
    <p>Request, renew or replace a document.</p>
  </div>
</hw-sidebar>`
```

## API

### JavaScript

Table: Attributes of the hw-sidebar element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-sidebar'` | `true` | — |
| `data-collapse-at` | `'lg' \| 'md' \| 'sm'` | `false` | — |
| `data-side` | `'end'` | `false` | — |

> [!NOTE]
> These classes and attributes are read from the published stylesheet and are outside the stable contract of 0.3.0.

Sidebar has no JavaScript controller. The markup is the API: write an element with the class `hw-sidebar` and exactly two children, the secondary area first and the main content second. `data-side` takes the value `end` to move the secondary area to the end of the row; without it the area stands at the start. `data-collapse-at` takes `sm`, `md` or `lg` and names the viewport width from which the two areas stand side by side: 40rem, 48rem and 64rem. Below that width the stylesheet stacks them in one column, and without the attribute the breakpoint is `md`. The width of the secondary area is the smaller of 40% of the sidebar and its width custom property, `--hw-layout-sidebar-width`, which is 18rem unless it is set on the element; `--hw-layout-gap` and `--hw-layout-padding` set the space between the areas and the padding. Vanilla options publish no default in 0.3.0, so each Default in the table is an em dash, although the stylesheet applies `md` when `data-collapse-at` is absent and the start side when `data-side` is absent.

### React

Table: Props of Sidebar

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

Sidebar always renders a `div`; it has no prop that chooses another element. It accepts the shared layout props of the layout primitives together with the attributes of a `div`, and the first child is the secondary area and the second child the main content. `side` and `collapseAt` are written as `data-side` and `data-collapse-at` only when they are given, so without them the area stands at the start and the breakpoint is `md`, which the stylesheet applies. `sidebarWidth` takes a CSS length. `gap` and `padding` take a spacing token from 0 to 16 or a CSS length, and both accept a responsive object with the steps `base`, `sm`, `md`, `lg` and `xl`. `align` sets the alignment of the two areas across the row. The Sidebar styles read none of `justify`, `wrap`, `columns`, `minItemWidth`, `maxWidth` and `ratio`, which belong to other primitives.

### Vue

Table: Props, events and slots of Sidebar

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

The default slot holds the two areas: the first child is the secondary area and the second child the main content. `as` sets the element that Sidebar renders, a `div` unless another tag is given. `side`, `collapseAt`, `sidebarWidth`, `gap`, `padding` and `align` have the meaning they have in React. Sidebar always writes `data-side` and `data-collapse-at` on its element, with the defaults of `side` and `collapseAt`. Attributes and listeners that Sidebar does not declare reach the rendered element. `wrap` has no default and is absent unless it is set.

### Angular

Table: Inputs, outputs and content of hw-sidebar

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
| `side` | input | `'start' \| 'end'` | `false` | `'start'` |
| `collapseAt` | input | `'sm' \| 'md' \| 'lg'` | `false` | `'md'` |
| `[hwSidebar]` | content | — | `false` | — |
| `*` | content | — | `false` | — |

`HwSidebarComponent` applies to `hw-sidebar`, with the element selector only. The host element is the box: it carries the class `hw-sidebar` and the layout custom properties, its template is the projected content alone, and no `aside` or `div` is added. Project one element marked `[hwSidebar]` as the secondary area and one other element as the main content. The secondary area is placed first whatever the source order. No `aside` and no `div` is added around it, so choose the element that fits it, such as `nav` or `aside`. `side`, `collapseAt`, `sidebarWidth`, `gap`, `padding` and `align` have the meaning they have in React, and the host always writes `data-side` and `data-collapse-at` with the defaults of `side` and `collapseAt`. The inputs that the Sidebar styles do not read are listed with the shared props of the layout primitives.

## Accessibility

Sidebar is a layout container. The React component renders a `div`; the Vue component renders a `div` or the element that `as` names; the Angular element `hw-sidebar` renders itself. In every form Sidebar adds no role, no name and no focusable element, so the semantics of the page come from the two areas that the application writes.

- The source order is the reading and focus order. The secondary area comes first in every adapter, and `side` with the value `end` changes only where it is drawn, so a keyboard user reaches the secondary area before the main content even when it stands at the end of the row.
- Sidebar gives no accessible name. A secondary area that is navigation is a native `nav` with an `aria-label`, and a complementary area is an `aside` with an `aria-label` or an `aria-labelledby` that points to a heading, so that assistive technology can tell the landmarks apart.
- Sidebar has no keyboard interaction of its own, and <kbd>Tab</kbd> moves between the focusable elements of the two areas as it does outside a sidebar.
- Below the breakpoint the two areas stack in one column with the secondary area first, with no change to the source order. Choose `collapseAt` from the amount of content in the secondary area: a long navigation list stacked above the main content pushes it down on a narrow screen.

> [!NOTE]
> Sidebar changes the layout, not the meaning. A main landmark of the page stays outside it or around it; the sidebar does not render one.

## RTL and localisation

Sidebar has no built-in text. The names of the landmarks and every other string are written by the application in the language of the page.

- `start` and `end` follow the direction of the page. With the default `start`, the secondary area stands at the right edge in a right-to-left page and at the left edge in a left-to-right page, and `end` reverses that.
- The stylesheet places the two areas in the columns of a grid, so the placement follows the direction of the page without a second rule for Arabic.
- The width and the gap are the same in Arabic and in English. The labels of the two languages differ in length, so set `sidebarWidth` from the longest label of the page in either language.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Sidebar; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- Sidebar is a layout primitive of Hawiyah. The [layout notes](../layout.md) list the default sidebar width and the breakpoint of the primitive. They also record the main and service-information columns of the Service template in the supplied snapshot (832px and 416px, with a 32px gap) and state that these reference dimensions do not mean every Sidebar composition should use them. They name no component of the supplied Platforms Code files that Sidebar maps, so the page claims no mapping of the component itself.
- Sidebar is listed with the layout primitives of the component scope in the [coverage notes](../coverage.md). The [layout notes](../layout.md) state that layout is CSS-driven and does not measure the viewport in JavaScript, which is the basis of the stacking behaviour that this page describes.
