# Section

Section groups related content in a block with consistent padding and an optional tone. It renders a semantic section element where the adapter allows it, and the application names it with `aria-labelledby` that points to a heading, or with `aria-label`.

## Example

A section holds one topic of a page. Its heading names it, and the `aria-labelledby` attribute connects the two, so assistive technology reaches the section as a named region. The stylesheet gives it the padding of the spacing token 6.

```html live example=basic static differences=section-vue-layout-attributes
<section class="hw-section" aria-labelledby="request-summary-title">
  <h2 id="request-summary-title">Request summary</h2>
  <p>Request 2041 was submitted on 4 March and is under review.</p>
</section>
```

```tsx live example=basic
<Section aria-labelledby="request-summary-title">
  <h2 id="request-summary-title">Request summary</h2>
  <p>Request 2041 was submitted on 4 March and is under review.</p>
</Section>
```

```vue live example=basic
<Section aria-labelledby="request-summary-title">
  <h2 id="request-summary-title">Request summary</h2>
  <p>Request 2041 was submitted on 4 March and is under review.</p>
</Section>
```

```ts live example=basic framework=angular
template: `<section hwSection aria-labelledby="request-summary-title">
  <h2 id="request-summary-title">Request summary</h2>
  <p>Request 2041 was submitted on 4 March and is under review.</p>
</section>`
```

## Variants and states

### Label

When a section has no heading of its own, the application gives it a name that a reader of a list of regions can recognise. The vanilla, React and Vue forms write `aria-label` on the element. The Angular form takes `label`, which the component writes as `aria-label`.

```html live example=label static differences=section-vue-layout-attributes
<section class="hw-section" aria-label="Contact details">
  <p>Telephone: 0000 0000</p>
  <p>Email: services@example.org</p>
</section>
```

```tsx live example=label
<Section aria-label="Contact details">
  <p>Telephone: 0000 0000</p>
  <p>Email: services@example.org</p>
</Section>
```

```vue live example=label
<Section aria-label="Contact details">
  <p>Telephone: 0000 0000</p>
  <p>Email: services@example.org</p>
</Section>
```

```ts live example=label framework=angular
template: `<section hwSection label="Contact details">
  <p>Telephone: 0000 0000</p>
  <p>Email: services@example.org</p>
</section>`
```

### Muted tone

The attribute `data-tone` with the value `muted` gives the section the muted surface colour of the theme, which separates supporting content from the main content of the page. The React, Vue and Angular adapters write the attribute on the element like any other attribute.

```html live example=muted static differences=section-vue-layout-attributes
<section class="hw-section" data-tone="muted" aria-labelledby="muted-title">
  <h2 id="muted-title">Before you start</h2>
  <p>Keep the reference number of the request at hand.</p>
</section>
```

```tsx live example=muted
<Section data-tone="muted" aria-labelledby="muted-title">
  <h2 id="muted-title">Before you start</h2>
  <p>Keep the reference number of the request at hand.</p>
</Section>
```

```vue live example=muted
<Section data-tone="muted" aria-labelledby="muted-title">
  <h2 id="muted-title">Before you start</h2>
  <p>Keep the reference number of the request at hand.</p>
</Section>
```

```ts live example=muted framework=angular
template: `<section hwSection data-tone="muted" aria-labelledby="muted-title">
  <h2 id="muted-title">Before you start</h2>
  <p>Keep the reference number of the request at hand.</p>
</section>`
```

### Brand tone

The value `brand` gives the section the subtle primary colour of the theme and its matching text colour. Use it for one block that the page wants to set apart, not for the whole page.

```html live example=brand static differences=section-vue-layout-attributes
<section class="hw-section" data-tone="brand" aria-labelledby="brand-title">
  <h2 id="brand-title">Track your request</h2>
  <p>Each request has a reference number that identifies it in every message.</p>
</section>
```

```tsx live example=brand
<Section data-tone="brand" aria-labelledby="brand-title">
  <h2 id="brand-title">Track your request</h2>
  <p>Each request has a reference number that identifies it in every message.</p>
</Section>
```

```vue live example=brand
<Section data-tone="brand" aria-labelledby="brand-title">
  <h2 id="brand-title">Track your request</h2>
  <p>Each request has a reference number that identifies it in every message.</p>
</Section>
```

```ts live example=brand framework=angular
template: `<section hwSection data-tone="brand" aria-labelledby="brand-title">
  <h2 id="brand-title">Track your request</h2>
  <p>Each request has a reference number that identifies it in every message.</p>
</section>`
```

### Padding

`padding` sets the padding of the section as a spacing token. The number 2 is the spacing token 2, smaller than the default token 6. The React, Vue and Angular adapters write the value as a custom property on the element, and the markup of the JavaScript block writes the same custom property in a style attribute.

```html live example=padding static differences=section-vue-layout-attributes
<section class="hw-section" data-tone="muted" style="--hw-layout-padding: var(--hw-space-2, 0.5rem)" aria-label="Processing time">
  <p>A decision is expected within five working days.</p>
</section>
```

```tsx live example=padding
<Section data-tone="muted" padding={2} aria-label="Processing time">
  <p>A decision is expected within five working days.</p>
</Section>
```

```vue live example=padding
<Section data-tone="muted" :padding="2" aria-label="Processing time">
  <p>A decision is expected within five working days.</p>
</Section>
```

```ts live example=padding framework=angular
template: `<section hwSection data-tone="muted" [padding]="2" label="Processing time">
  <p>A decision is expected within five working days.</p>
</section>`
```

## API

### JavaScript

Table: Attributes of the hw-section element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-section'` | `true` | — |
| `data-tone` | `'brand' \| 'muted'` | `false` | — |

> [!NOTE]
> These classes and attributes are read from the published stylesheet and are outside the stable contract of 0.3.0.

Section has no JavaScript controller. The markup is the API: write a `section` element with the class `hw-section` and place the content directly inside it. The stylesheet makes it a block with the padding of the spacing token 6, which the custom property `--hw-layout-padding` changes on one section. `data-tone` takes `muted` or `brand`; without it the section has no background of its own. The stylesheet writes no default for either attribute, so each Default is an em dash.

### React

Table: Props of Section

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

Section always renders a `section` element; it has no prop that chooses another element. It accepts the shared layout props of the layout primitives together with the attributes of a `section`, so the name is written with a native attribute such as `aria-label` or `aria-labelledby`, and `data-tone` is one of those attributes. `padding` takes a spacing token from 0 to 16 or a CSS length, and accepts a responsive object with the steps `base`, `sm`, `md`, `lg` and `xl`; without it the stylesheet applies the spacing token 6, and the table shows an em dash. `gap` takes the same forms, but a section is a block and not a flex or grid container, so `gap` has no effect on it and only `padding` changes the box. The Section styles read none of the other layout props, which belong to other primitives.

### Vue

Table: Props, events and slots of Section

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `as` | prop | `string` | `false` | `'section'` |
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

The default slot holds the content. `as` sets the element that Section renders; without it Section renders a `section` element. `padding` has the meaning it has in React, and the name is written with a native attribute such as `aria-label` or `aria-labelledby`. Section always writes `data-side` and `data-collapse-at` on its element, with the defaults of `side` and `collapseAt`, and the stylesheet does not read them for this component. Attributes such as `data-tone` that Section does not declare reach the rendered element. `wrap` has no default and is absent unless it is set.

### Angular

Table: Inputs, outputs and content of hw-section

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
| `label` | input | `string` | `false` | `''` |
| `*` | content | — | `false` | — |

`HwSectionComponent` applies to `hw-section` and to the attribute selector `[hwSection]`. The host element is the box: it carries the class `hw-section` and the layout custom properties, and its template is the projected content alone. `hw-section` is therefore not a `section` element; write `<section hwSection>` where a `section` element is wanted. `label` is written as `aria-label` while it is set. On `hw-section` or another non-native host, a set `label` also writes the region role, and on a native `section` it writes no role. An `aria-label` or a role that the application writes or binds on the element is kept, and `label` takes its place only while it is set. `padding` has the meaning it has in React, and `gap` has no effect on the box, because a section is a block. The Section styles read none of the other inputs.

## Accessibility

Section is a layout container with a semantic element. The React component renders a `section`; the Vue component renders a `section` or the element that `as` names; the Angular `[hwSection]` form keeps the native element it is written on, and the `hw-section` element is a generic host. Section adds no focusable element and no keyboard interaction, and <kbd>Tab</kbd> moves between the focusable children as it does outside a section.

- A native `section` element without a name maps to the generic role, so a visual section does not create an entry in the list of landmarks. Give it a heading and connect the two with `aria-labelledby`, or give it `aria-label`, so that it is reached as a named region.
- Name only the sections that a reader needs to find as landmarks. Several regions with the same name on a page do not help a reader who navigates by landmark.
- In Angular, `label` on `hw-section` writes the label and the region role, and on a native `section` it writes the label alone, because the element is already the landmark.
- The tone changes the colour of the surface and the text only. Do not use the tone alone to convey a status or an importance; say it in the text.

> [!NOTE]
> Section changes the layout and adds no heading. Choose the heading level of its title from the place of the section in the page, not from its appearance.

## RTL and localisation

Section has no built-in text. The heading, the label and the content are written by the application in the language of the page.

- The padding is the same on every side, so the section looks the same in a right-to-left page and in a left-to-right page.
- The text inside the section follows the direction of the page, and `label` or `aria-label` is written in the language of the page.
- The tone colours are semantic tokens of the theme and do not depend on the language.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Section; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- Section is a layout primitive of Hawiyah. The [layout notes](../layout.md) give its default padding of the spacing token 6 and advise a heading for a visual section, and name no component of the supplied Platforms Code files that Section maps, so the page claims no mapping of the component itself.
- Section is listed with the layout primitives of the component scope in the [coverage notes](../coverage.md). The two tones are set in the stylesheet from the semantic colour tokens `--hw-color-surface-muted` and `--hw-color-primary-subtle`.
