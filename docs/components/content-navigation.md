# ContentNavigation

ContentNavigation is a navigation landmark of links to the sections of the current page, with nested entries and a marker on the section that the reader has reached. It scrolls to a section and reports the current one; the sections and their identifiers belong to the application.

## Example

Each item names an `id` of a section of the page, and the link points to it. The marker stands on the current section, and the link of that section carries `aria-current="location"`. The groups below set no `scrollRoot`, so the controller tracks the scroll of the window; their results do not scroll, and each shows the first section as current.

```html live example=basic static
<nav class="hw-content-nav" data-hw="content-navigation" aria-label="On this page">
  <h2 class="hw-content-nav-heading">On this page</h2>
  <ul class="hw-content-nav-list"><li><a class="hw-content-nav-link" href="#cn-basic-overview" data-hw-section="cn-basic-overview"><span class="hw-content-nav-marker" aria-hidden="true"></span><span class="hw-content-nav-label">Overview</span></a></li><li><a class="hw-content-nav-link" href="#cn-basic-documents" data-hw-section="cn-basic-documents"><span class="hw-content-nav-marker" aria-hidden="true"></span><span class="hw-content-nav-label">Required documents</span></a></li><li><a class="hw-content-nav-link" href="#cn-basic-fees" data-hw-section="cn-basic-fees"><span class="hw-content-nav-marker" aria-hidden="true"></span><span class="hw-content-nav-label">Fees and payment</span></a></li></ul>
</nav>
<section id="cn-basic-overview"><h3>Overview</h3><p>The request is reviewed after it is submitted.</p></section>
<section id="cn-basic-documents"><h3>Required documents</h3><p>Attach each document in PDF format.</p></section>
<section id="cn-basic-fees"><h3>Fees and payment</h3><p>The fee is shown before the request is submitted.</p></section>
```

```tsx live example=basic
<>
  <ContentNavigation
    label="On this page"
    items={[
    { id: 'cn-basic-overview', label: 'Overview' },
    { id: 'cn-basic-documents', label: 'Required documents' },
    { id: 'cn-basic-fees', label: 'Fees and payment' },
  ]}
  />
  <section id="cn-basic-overview"><h3>Overview</h3><p>The request is reviewed after it is submitted.</p></section>
  <section id="cn-basic-documents"><h3>Required documents</h3><p>Attach each document in PDF format.</p></section>
  <section id="cn-basic-fees"><h3>Fees and payment</h3><p>The fee is shown before the request is submitted.</p></section>
</>
```

```vue live example=basic
<ContentNavigation
  label="On this page"
  :items="[
    { id: 'cn-basic-overview', label: 'Overview' },
    { id: 'cn-basic-documents', label: 'Required documents' },
    { id: 'cn-basic-fees', label: 'Fees and payment' },
  ]"
/>
<section id="cn-basic-overview"><h3>Overview</h3><p>The request is reviewed after it is submitted.</p></section>
<section id="cn-basic-documents"><h3>Required documents</h3><p>Attach each document in PDF format.</p></section>
<section id="cn-basic-fees"><h3>Fees and payment</h3><p>The fee is shown before the request is submitted.</p></section>
```

```ts live example=basic framework=angular
template: `<hw-content-navigation
  label="On this page"
  [items]="[
    { id: 'cn-basic-overview', label: 'Overview' },
    { id: 'cn-basic-documents', label: 'Required documents' },
    { id: 'cn-basic-fees', label: 'Fees and payment' },
  ]"
/>
<section id="cn-basic-overview"><h3>Overview</h3><p>The request is reviewed after it is submitted.</p></section>
<section id="cn-basic-documents"><h3>Required documents</h3><p>Attach each document in PDF format.</p></section>
<section id="cn-basic-fees"><h3>Fees and payment</h3><p>The fee is shown before the request is submitted.</p></section>
`
```

## Variants and states

### Nested and disabled entries

An item may hold `children`, which are rendered as a nested list. An item with `disabled` is a text entry with `aria-disabled="true"` that does not scroll.

```html live example=nested static
<nav class="hw-content-nav" data-hw="content-navigation" aria-label="Sections of the request">
  <h2 class="hw-content-nav-heading">Sections of the request</h2>
  <ul class="hw-content-nav-list"><li><a class="hw-content-nav-link" href="#cn-nested-request" data-hw-section="cn-nested-request"><span class="hw-content-nav-marker" aria-hidden="true"></span><span class="hw-content-nav-label">Request</span></a><ul class="hw-content-nav-sublist"><li><a class="hw-content-nav-link" href="#cn-nested-applicant" data-hw-section="cn-nested-applicant"><span class="hw-content-nav-marker" aria-hidden="true"></span><span class="hw-content-nav-label">Applicant</span></a></li><li><a class="hw-content-nav-link" href="#cn-nested-documents" data-hw-section="cn-nested-documents"><span class="hw-content-nav-marker" aria-hidden="true"></span><span class="hw-content-nav-label">Documents</span></a></li></ul></li><li><span class="hw-content-nav-link" role="link" aria-disabled="true" data-hw-section="cn-nested-payment"><span class="hw-content-nav-marker" aria-hidden="true"></span><span class="hw-content-nav-label">Payment</span></span></li></ul>
</nav>
<section id="cn-nested-request"><h3>Request</h3><p>Describe the request.</p></section>
<section id="cn-nested-applicant"><h3>Applicant</h3><p>Enter the details of the applicant.</p></section>
<section id="cn-nested-documents"><h3>Documents</h3><p>Attach the supporting documents.</p></section>
<section id="cn-nested-payment"><h3>Payment</h3><p>Payment is available after review.</p></section>
```

```tsx live example=nested
<>
  <ContentNavigation
    label="Sections of the request"
    items={[
    {
      id: 'cn-nested-request',
      label: 'Request',
      children: [
        { id: 'cn-nested-applicant', label: 'Applicant' },
        { id: 'cn-nested-documents', label: 'Documents' },
      ],
    },
    { id: 'cn-nested-payment', label: 'Payment', disabled: true },
  ]}
  />
  <section id="cn-nested-request"><h3>Request</h3><p>Describe the request.</p></section>
  <section id="cn-nested-applicant"><h3>Applicant</h3><p>Enter the details of the applicant.</p></section>
  <section id="cn-nested-documents"><h3>Documents</h3><p>Attach the supporting documents.</p></section>
  <section id="cn-nested-payment"><h3>Payment</h3><p>Payment is available after review.</p></section>
</>
```

```vue live example=nested
<ContentNavigation
  label="Sections of the request"
  :items="[
    {
      id: 'cn-nested-request',
      label: 'Request',
      children: [
        { id: 'cn-nested-applicant', label: 'Applicant' },
        { id: 'cn-nested-documents', label: 'Documents' },
      ],
    },
    { id: 'cn-nested-payment', label: 'Payment', disabled: true },
  ]"
/>
<section id="cn-nested-request"><h3>Request</h3><p>Describe the request.</p></section>
<section id="cn-nested-applicant"><h3>Applicant</h3><p>Enter the details of the applicant.</p></section>
<section id="cn-nested-documents"><h3>Documents</h3><p>Attach the supporting documents.</p></section>
<section id="cn-nested-payment"><h3>Payment</h3><p>Payment is available after review.</p></section>
```

```ts live example=nested framework=angular
template: `<hw-content-navigation
  label="Sections of the request"
  [items]="[
    {
      id: 'cn-nested-request',
      label: 'Request',
      children: [
        { id: 'cn-nested-applicant', label: 'Applicant' },
        { id: 'cn-nested-documents', label: 'Documents' },
      ],
    },
    { id: 'cn-nested-payment', label: 'Payment', disabled: true },
  ]"
/>
<section id="cn-nested-request"><h3>Request</h3><p>Describe the request.</p></section>
<section id="cn-nested-applicant"><h3>Applicant</h3><p>Enter the details of the applicant.</p></section>
<section id="cn-nested-documents"><h3>Documents</h3><p>Attach the supporting documents.</p></section>
<section id="cn-nested-payment"><h3>Payment</h3><p>Payment is available after review.</p></section>
`
```

### Without a visible heading

`showHeading` set to false hides the heading, and `label` still names the landmark.

```html live example=hidden static
<nav class="hw-content-nav" data-hw="content-navigation" aria-label="Sections of the request">
  <ul class="hw-content-nav-list"><li><a class="hw-content-nav-link" href="#cn-hidden-summary" data-hw-section="cn-hidden-summary"><span class="hw-content-nav-marker" aria-hidden="true"></span><span class="hw-content-nav-label">Summary</span></a></li><li><a class="hw-content-nav-link" href="#cn-hidden-history" data-hw-section="cn-hidden-history"><span class="hw-content-nav-marker" aria-hidden="true"></span><span class="hw-content-nav-label">History</span></a></li></ul>
</nav>
<section id="cn-hidden-summary"><h3>Summary</h3><p>A short summary of the request.</p></section>
<section id="cn-hidden-history"><h3>History</h3><p>The earlier steps of the request.</p></section>
```

```tsx live example=hidden
<>
  <ContentNavigation
    label="Sections of the request"
    showHeading={false}
    items={[
    { id: 'cn-hidden-summary', label: 'Summary' },
    { id: 'cn-hidden-history', label: 'History' },
  ]}
  />
  <section id="cn-hidden-summary"><h3>Summary</h3><p>A short summary of the request.</p></section>
  <section id="cn-hidden-history"><h3>History</h3><p>The earlier steps of the request.</p></section>
</>
```

```vue live example=hidden
<ContentNavigation
  label="Sections of the request"
  :show-heading="false"
  :items="[
    { id: 'cn-hidden-summary', label: 'Summary' },
    { id: 'cn-hidden-history', label: 'History' },
  ]"
/>
<section id="cn-hidden-summary"><h3>Summary</h3><p>A short summary of the request.</p></section>
<section id="cn-hidden-history"><h3>History</h3><p>The earlier steps of the request.</p></section>
```

```ts live example=hidden framework=angular
template: `<hw-content-navigation
  label="Sections of the request"
  [showHeading]="false"
  [items]="[
    { id: 'cn-hidden-summary', label: 'Summary' },
    { id: 'cn-hidden-history', label: 'History' },
  ]"
/>
<section id="cn-hidden-summary"><h3>Summary</h3><p>A short summary of the request.</p></section>
<section id="cn-hidden-history"><h3>History</h3><p>The earlier steps of the request.</p></section>
`
```

## API

### JavaScript

Table: Options of createContentNavigation

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `scrollRoot` | `HTMLElement \| null` | `false` | — |
| `offset` | `number` | `false` | — |
| `onCurrentChange` | `(id: string) => void` | `false` | — |
| `label` | `string` | `false` | — |
| `updateHash` | `boolean` | `false` | — |

ContentNavigation has no stylesheet-only form that tracks the current section: write a `nav` element with the class `hw-content-nav` and `data-hw="content-navigation"`, named by `aria-label`, then lists with the classes `hw-content-nav-list` and `hw-content-nav-sublist` and, for each entry, a link with the class `hw-content-nav-link`, a marker with `hw-content-nav-marker` and a label with `hw-content-nav-label`. An optional heading has the class `hw-content-nav-heading`. A link names its section by an href that holds the fragment of its section, or by `data-hw-section`. The controller sets `aria-current="location"` on the link of the current section. The root reads `data-hw-scroll-root`, the id of the element that scrolls, `data-hw-offset` and `data-hw-update-hash`. The options publish no default in 0.3.0; the published build uses 80 as the offset and the window as the scroll root. `scrollRoot` is the element that scrolls, and a configured root that is not found does not fall back to scrolling the page. `offset` is the distance from the top of the scroll root that counts as the start of a section. `updateHash` writes the resolved address with history.replaceState. `onCurrentChange` receives the identifier of the current section. The returned controller has `current`, `refresh()`, `navigate(id, options)` and `destroy()`; `navigate` returns whether it found a section to scroll to, and `focus` in its options moves focus to the section. The controller also dispatches `hw:change` with `detail.current`.

### React

Table: Props of ContentNavigation

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `items` | `readonly ContentNavigationItem[]` | `true` | — |
| `showHeading` | `boolean` | `false` | `true` |
| `sticky` | `boolean` | `false` | `false` |
| `scrollRoot` | `HTMLElement \| null` | `false` | `null` |
| `offset` | `number` | `false` | `80` |
| `updateHash` | `boolean` | `false` | `false` |
| `onCurrentChange` | `(id: string) => void` | `false` | — |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `label` | `string` | `false` | — |

`items` is the list of entries; each `ContentNavigationItem` has an `id`, a `label`, an optional `disabled` and optional `children` of the same shape. `label` names the landmark and is printed as its heading, unless `showHeading` is false; an `aria-label` or `aria-labelledby` names the landmark instead, and no heading is printed without `label`. `showHeading` is true by default, `sticky` is false, `scrollRoot` is null, which means the window, `offset` is 80 and `updateHash` is false. `sticky` pins the landmark on wide screens, and `onCurrentChange` receives the identifier of the current section. The ref reaches the `nav` element.

### Vue

Table: Props, events and slots of ContentNavigation

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `items` | prop | `readonly ContentNavigationItem[]` | `true` | — |
| `label` | prop | `string` | `false` | — |
| `showHeading` | prop | `boolean` | `false` | `true` |
| `sticky` | prop | `boolean` | `false` | `false` |
| `updateHash` | prop | `boolean` | `false` | `false` |
| `scrollRoot` | prop | `HTMLElement \| null` | `false` | `null` |
| `offset` | prop | `number` | `false` | `80` |
| `currentChange` | event | `(id: string) => void` | `false` | — |

`items`, `label`, `showHeading`, `sticky`, `scrollRoot`, `offset` and `updateHash` behave as in React, with the same defaults. `currentChange` is the event that carries the identifier of the current section. The table lists no slot because the build reads none.

### Angular

Table: Inputs, outputs and content of hw-content-navigation

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `label` | input | `string` | `false` | `''` |
| `items` | input | `readonly ContentNavigationItem[]` | `true` | — |
| `updateHash` | input | `boolean` | `false` | `false` |
| `showHeading` | input | `boolean` | `false` | `true` |
| `sticky` | input | `boolean` | `false` | `false` |
| `scrollRoot` | input | `HTMLElement \| null` | `false` | `null` |
| `offset` | input | `number` | `false` | `80` |
| `currentChange` | output | `string` | `false` | — |

`HwContentNavigationComponent` (`hw-content-navigation`) renders the `nav` element. `items`, `showHeading`, `sticky`, `scrollRoot`, `offset` and `updateHash` behave as in React, with the same defaults. `currentChange` emits the identifier of the current section. The landmark needs a `label`, or `aria-label` or `aria-labelledby` written on `hw-content-navigation`.

## Accessibility

ContentNavigation is a `nav` element named by `label`, `aria-label` or `aria-labelledby`, with nested lists of links. The link of the current section carries `aria-current="location"`, so the state does not depend on the marker alone. A disabled entry stays in the text as an element with `role="link"` and `aria-disabled="true"`; it is not activated.

Table: Keyboard interaction of ContentNavigation

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves focus to the next enabled link of the navigation, then to the next control of the page. |
| <kbd>Shift</kbd> + <kbd>Tab</kbd> | Moves focus to the previous enabled link of the navigation, then to the previous control of the page. |
| <kbd>Enter</kbd> | Activates the focused link, scrolls to its section and moves focus to the section. |

- Ordinary activation, with a pointer, scrolls to the section without changing the address of the page; with `updateHash` the resolved address is written with history.replaceState.
- Keyboard activation also focuses the section. A section that is not focusable receives a tabindex of -1 for the time of the focus, and the attribute is restored when focus leaves.
- Passive tracking of the current section never focuses a section and never scrolls the content.
- Missing, disabled, hidden, inert and concealed sections are ignored, and so are the sections inside a closed `details` element, except its first summary.
- When the reader asks for reduced motion, scrolling to a section is immediate.
- An activation reports one change of the current section; the marker goes to the chosen section and does not step through the sections that a smooth scroll passes.

## RTL and localisation

ContentNavigation has no built-in text: the name of the landmark, the heading and the labels of the entries are written by the application in the language of the page. The element inherits the language and the direction of the page, and the packaged styles use logical properties, so the marker and the indentation of nested entries stand at the start side in both directions.

- The identifiers of the sections are values of the application and are not shown.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of ContentNavigation; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The sticky layout, the nested rail and indicator, the hover and focus states and the scrolling of sections of the supplied Platforms Code style sheet and script are mapped in the [content navigation notes](../nic-content-navigation.md).
- The [content navigation notes](../nic-content-navigation.md) record the intentional adaptations, among them the tracking of the current section by geometry instead of an intersection observer, the visible focus outline that the source removes, the omitted global section rule and logical instead of physical padding.
- Section elements, their identifiers and routing are not part of the source mapping, as the [content navigation notes](../nic-content-navigation.md) state; they remain with the application.
