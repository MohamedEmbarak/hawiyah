# Layout that follows your content

Nasaq layouts use native HTML, ordinary CSS, and the same semantic tokens as the
components. They do not measure the viewport in JavaScript. Server rendering and
client rendering produce the same styles; CSS handles breakpoints and direction.

The default appearance uses the mapped `dga` foundation. The `nasaq` theme remains
an explicit option; choosing a visual theme does not change DOM order, layout
semantics, or the shared responsive-prop contract.

Import `@nasaq/styles/styles.css` once. This entry includes component, extended
component, and layout styles. The reset remains separately opt-in.

## Choose a primitive

| Primitive / CSS class | Use it for | Default |
| --- | --- | --- |
| `Container` / `nq-container` | Centered content with a readable maximum width | Theme container maximum and responsive gutters; override `maxWidth` when needed |
| `Stack` / `nq-stack` | A vertical sequence of fields, cards, or sections | Flex column, spacing token `4` |
| `Inline` / `nq-inline` | Actions, metadata, and wrapping controls | Flex row, centered alignment, wrapping |
| `Grid` / `nq-grid` | Responsive, equal-width cards | One column |
| `Columns` / `nq-columns` | Explicit responsive columns | Same grid behavior; use the name that fits the content |
| `Sidebar` / `nq-sidebar` | Navigation or context next to primary content | `18rem` sidebar, collapses below `48rem` |
| `Center` / `nq-center` | Center content within its available space | Flex, centered on both axes |
| `Spacer` / `nq-spacer` | Flexible space inside a flex container | Grows into remaining space; `gap` can provide a minimum |
| `AspectRatio` / `nq-aspect-ratio` | Reserve space for media | `16 / 9`, cover images/video |
| `Section` / `nq-section` | A semantic section with consistent padding | Padding token `6` |
| `AppShell` / `nq-app-shell` | Header, navigation, main area and footer | Full viewport minimum height; sidebar columns from `64rem` |
| `PageHeader` / `nq-page-header` | Heading, description, breadcrumb and actions | Wrapping content and action groups |

Choose the appropriate semantic tag when an adapter offers `as`. A visual
`Section` does not create a meaningful document outline on its own: give it a
heading. Do not nest `main` landmarks. Use `Spacer` for presentation only and keep
it hidden from assistive technology when it has no content.

## Shared props

```ts
import { layoutStyles } from '@nasaq/core';
import type {
  LayoutProps, LayoutSpacing, LayoutSpaceToken, Responsive,
  LayoutAlign, LayoutJustify, LayoutSide, LayoutBreakpoint,
} from '@nasaq/core';

const props: LayoutProps = {
  gap: { base: 3, md: 5 },
  padding: { base: 4, lg: 8 },
  columns: { base: 1, sm: 2, lg: 3 },
  align: 'stretch',
};
const styles = layoutStyles(props);
```

| Prop | Type | Meaning |
| --- | --- | --- |
| `gap`, `padding` | `Responsive<LayoutSpacing>` | Numeric spacing token `0..16`, or a non-empty CSS length string |
| `columns` | `Responsive<number>` | Positive integer grid column count |
| `minItemWidth` | `string` | Adaptive `auto-fit` grid minimum; takes precedence over `columns` |
| `align` | `start \| center \| end \| stretch \| baseline` | Cross-axis alignment |
| `justify` | `start \| center \| end \| between \| around \| evenly` | Main-axis distribution |
| `wrap` | `boolean` | Flex wrapping, applicable to Inline and wrapping compositions |
| `side` | `start \| end` | Logical sidebar placement; adapter emits `data-side` |
| `sidebarWidth` | `string` | Sidebar width, capped at 40% in Sidebar to protect the main area |
| `collapseAt` | `sm \| md \| lg` | Sidebar breakpoint; adapter emits `data-collapse-at` |
| `maxWidth` | `string` | Container maximum width |
| `ratio` | `number` | Positive finite aspect ratio, for example `4 / 3` |

```ts
type Responsive<T> = T | {
  base?: T; sm?: T; md?: T; lg?: T; xl?: T;
};
```

A missing responsive step inherits the nearest smaller specified step. If `base`
is omitted, the primitive's default applies before the first specified breakpoint.
Each nested layout resets its own layout variables; its parent does not silently
change its padding or column count.

| Step | Minimum viewport width |
| --- | --- |
| `base` | All widths |
| `sm` | `40rem` |
| `md` | `48rem` |
| `lg` | `64rem` |
| `xl` | `80rem` |

These are viewport media queries, not container queries. A narrow embedded layout
may need `minItemWidth` even on a wide viewport. CSS Grid uses `minmax(0, 1fr)` for
counted columns and bounds adaptive item minima by the available width.

Numeric spacing `4` becomes `var(--nq-space-4, 1rem)`. Values such as `7`, which
are absent from the original public token scale, receive the equivalent quarter-rem
fallback. Zero remains zero. CSS strings support `clamp()`, `calc()`, `var()`, and
ordinary units; Nasaq does not evaluate them in JavaScript. Invalid numeric spacing,
column counts, or ratios throw a `RangeError`; empty CSS strings throw a
`TypeError`. Values beyond the numeric token scale should be explicit CSS strings.

`layoutStyles({})` returns `{}`. It emits only specified presentation variables;
it does not mutate input, touch the DOM, set roles, or emit `side` / `collapseAt`
as CSS. Those two props become data attributes in adapters.

## Supplied layout reference

The supplied Platforms Code snapshot exported on **2026-10-29** contains these
verified reference dimensions:

| Source | Dimension | Evidence |
| --- | --- | --- |
| Foundations | Desktop container maximum: `1280px` | Local variable `50:3` |
| Foundations | Desktop container padding: `32px` | Local variable `50:4` |
| Foundations | Mobile container padding: `16px` | Local variable `50:5` |
| Service template | Main/service-information columns: `832px` / `416px`, with a `32px` gap | Desktop reference frames `1:21371` and `1:22148` |

The inspected desktop and mobile example frames are `1440px` and `430px` wide.
Those frame sizes are **not CSS breakpoint definitions**. Keep the runtime
breakpoint contract above, preserve readable reflow at intermediate widths and
320 CSS pixels, and compare actual rendered templates before claiming a match.
The reference dimensions do not mean every Sidebar composition should use the
service template's column widths. See [the reference record](dga-reference.md)
for snapshot scope and unmapped source areas.

Container reads `--nq-content-max`, `--nq-content-gutter`, and
`--nq-content-gutter-mobile` from the selected theme. Inspect the
[token source](../packages/tokens/tokens.json) and
[layout styles](../packages/styles/src/layout.css) for current runtime values
and gutter thresholds. Container and service/form reflow thresholds are
implementation choices, separate from the shared `sm`/`md`/`lg`/`xl` steps;
they must not be inferred from the reference frame widths.

## A responsive service grid

React:

```tsx
import { Container, Grid, ServiceCard } from '@nasaq/react';

<Container maxWidth="72rem">
  <Grid columns={{ base: 1, sm: 2, lg: 3 }} gap={{ base: 4, lg: 6 }}>
    {services.map(service => <ServiceCard key={service.id} {...service} />)}
  </Grid>
</Container>
```

Vue:

```vue
<Container max-width="72rem">
  <Grid :columns="{ base: 1, sm: 2, lg: 3 }" :gap="{ base: 4, lg: 6 }">
    <ServiceCard v-for="service in services" :key="service.id" v-bind="service" />
  </Grid>
</Container>
```

Angular:

```html
<nq-container maxWidth="72rem">
  <nq-grid [columns]="{ base: 1, sm: 2, lg: 3 }" [gap]="{ base: 4, lg: 6 }">
    <!-- Native Angular component content -->
  </nq-grid>
</nq-container>
```

For width-driven wrapping, use `minItemWidth="16rem"`. This selects `auto-fit`
and ignores explicit `columns`; avoid specifying both to keep intent clear.

Vanilla:

```html
<div class="nq-grid" id="service-grid">
  <!-- Native service cards -->
</div>
```

```ts
import { layoutStyles } from '@nasaq/core';

const grid = document.querySelector<HTMLElement>('#service-grid')!;
for (const [name, value] of Object.entries(layoutStyles({
  columns: { base: 1, sm: 2, lg: 3 }, gap: { base: 4, lg: 6 },
}))) grid.style.setProperty(name, String(value));
```

For dynamic vanilla updates, remove previously applied layout variables before
applying the new object; omitted properties deliberately are not emitted. No
`enhance()` call is needed for layouts.

## Sidebar and document order

Use exactly two direct children: sidebar first, primary content second. At wide
viewports `side="end"` places the first child at the logical end. At small
viewports both children stack in their original DOM order. RTL changes logical
placement without changing content or locale.

```html
<div class="nq-sidebar" data-side="end" data-collapse-at="lg"
     style="--nq-layout-sidebar-width: 20rem; --nq-layout-gap: var(--nq-space-6)">
  <aside aria-label="Application guidance">…</aside>
  <section aria-labelledby="application-heading">…</section>
</div>
```

Visual placement never changes keyboard order. Put content in a sensible source
order. The sidebar is not hidden at narrow widths; use an explicit disclosure or
drawer when collapsed navigation is required.

## Shell and page-header anatomy

AppShell accepts direct `header`, `aside` / `nav`, `main`, and `footer` landmarks,
or the equivalent `.nq-app-shell-header`, `-sidebar`, `-main`, and `-footer`
classes. A `.nq-app-shell-body` wrapper is supported. Without a sidebar, the main
area spans the available width. The default sidebar becomes a second column at
`64rem`; use Sidebar for a separately configurable collapse breakpoint.

PageHeader groups content and actions using `.nq-page-header-main` (optional),
`.nq-page-header-content`, and `.nq-page-header-actions`. A breadcrumb can occupy
its own full row. Actions wrap naturally; avoid fixed-width controls when long
Arabic labels need additional space.

## CSS variable contract

The public variables emitted by the helper are:

- `--nq-layout-gap` and `--nq-layout-padding`, with optional `-sm`, `-md`, `-lg`, `-xl` suffixes.
- `--nq-layout-columns`, with the same breakpoint suffixes.
- `--nq-layout-align`, `--nq-layout-justify`, `--nq-layout-wrap`.
- `--nq-layout-min-item`, `--nq-layout-sidebar-width`, `--nq-layout-max-width`, `--nq-layout-ratio`.

`--nq-layout-current-*` properties are internal CSS calculations. Do not override
them. The established `--nq-gap` hook remains a fallback for Stack/Inline and other
layout defaults, but explicit `--nq-layout-gap` takes precedence.

Use `data-variant="fluid"` for a Container without the default outer gutters.
AspectRatio supports `data-fit="contain"` for uncropped images or video. Section
supports `data-tone="muted|brand"`. Layout primitives introduce no animation,
retain logical inline/block properties, and work in light, dark, compact and
forced-colors modes. The surrounding content still needs accessible names,
contrast and keyboard behavior.

## Validation approach

Check actual rendered widths, nested layouts, and keyboard order in both
English/LTR and Arabic/RTL. Test breakpoint fallback with a partially specified
object, adaptive grids inside narrow containers, and Sidebar before and after its
collapse breakpoint. For SSR, compare the emitted style object without supplying
browser globals. Layout CSS cannot make an arbitrary long unbroken child string
wrap; use an appropriate content rule where the information permits wrapping.
