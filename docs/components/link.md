# Link

Link is a native anchor element with the Hawiyah link styles. It leads to a destination, keeps every native anchor attribute, and offers variants for neutral and standalone placement, a current-page marker, an external form and a disabled form.

## Example

The text of a link names its destination, so a reader of a list of links can tell the links apart without the surrounding sentence. The default link is underlined, so colour is not the only cue that it is a link.

```html live example=basic
<p>You can <a class="hw-link" href="/requests/status">check the status of your request</a> at any time.</p>
```

```tsx live example=basic
<p>You can <Link href="/requests/status">check the status of your request</Link> at any time.</p>
```

```vue live example=basic
<p>You can <Link href="/requests/status">check the status of your request</Link> at any time.</p>
```

```ts live example=basic framework=angular
template: `<p>You can <a hwLink href="/requests/status">check the status of your request</a> at any time.</p>`
```

## Variants and states

### Neutral and standalone

The `neutral` variant uses the neutral link colours and removes the underline at rest, for a link that stands among other text, such as a list of related pages. The `standalone` variant removes the underline for a link that stands alone on its line, where its position already marks it as a link. The `subtle` variant has the same neutral colours and no underline at rest, but a hovered `subtle` link takes the primary text colour, where a hovered `neutral` link takes the neutral hover colour. `default` is the underlined link of the first example.

```html live example=variants
<div class="hw-stack">
  <a class="hw-link" data-variant="neutral" href="/requests/history">Request history</a>
  <a class="hw-link" data-variant="standalone" href="/requests/new">Start a new request</a>
</div>
```

```tsx live example=variants
<div className="hw-stack">
  <Link variant="neutral" href="/requests/history">Request history</Link>
  <Link variant="standalone" href="/requests/new">Start a new request</Link>
</div>
```

```vue live example=variants
<div class="hw-stack">
  <Link variant="neutral" href="/requests/history">Request history</Link>
  <Link variant="standalone" href="/requests/new">Start a new request</Link>
</div>
```

```ts live example=variants framework=angular
template: `<div class="hw-stack">
  <a hwLink variant="neutral" href="/requests/history">Request history</a>
  <a hwLink variant="standalone" href="/requests/new">Start a new request</a>
</div>`
```

### Current page

A link to the page the reader is on carries `aria-current="page"`, and the stylesheet gives it a heavier weight. In vanilla and React the attribute is the native one; in Vue it is passed as an attribute, and the Angular directive writes it from the `current` input.

```html live example=current
<a class="hw-link" href="/requests" aria-current="page">My requests</a>
```

```tsx live example=current
<Link href="/requests" aria-current="page">My requests</Link>
```

```vue live example=current
<Link href="/requests" aria-current="page">My requests</Link>
```

```ts live example=current framework=angular
template: `<a hwLink href="/requests" [current]="true">My requests</a>`
```

### External

An external link opens in a new tab with the native target attribute set to _blank. React, Vue and the Angular directive write that attribute and add noopener and noreferrer to the rel attribute of the link when `external` is set; in vanilla the author writes both. The stylesheet adds an arrow after such a link, and `data-hw-external-icon="none"` removes it. The text of the link states that it opens a new tab, because the stylesheet arrow is not text.

```html live example=external
<a class="hw-link" href="https://example.com/guidance" target="_blank" rel="noopener noreferrer">Read the guidance (opens in a new tab)</a>
```

```tsx live example=external
<Link href="https://example.com/guidance" external>Read the guidance (opens in a new tab)</Link>
```

```vue live example=external
<Link href="https://example.com/guidance" external>Read the guidance (opens in a new tab)</Link>
```

```ts live example=external framework=angular
template: `<a hwLink href="https://example.com/guidance" [external]="true">Read the guidance (opens in a new tab)</a>`
```

### Disabled

A disabled link stands for a destination that is not available now. It has no `href`, carries `role="link"` and `aria-disabled="true"`, and leaves the tab order with a tabindex of -1. In React, Vue and Angular the `disabled` member writes these and cancels click and auxiliary click before an application handler sees them; in vanilla the author writes them and adds no destination and no handler.

```html live example=disabled
<a class="hw-link" role="link" aria-disabled="true" tabindex="-1">Download the receipt (available after approval)</a>
```

```tsx live example=disabled
<Link href="/requests/receipt" disabled>Download the receipt (available after approval)</Link>
```

```vue live example=disabled
<Link href="/requests/receipt" disabled>Download the receipt (available after approval)</Link>
```

```ts live example=disabled framework=angular
template: `<a hwLink href="/requests/receipt" [disabled]="true">Download the receipt (available after approval)</a>`
```

## API

### JavaScript

Table: Attributes of the hw-link element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-link'` | `true` | — |
| `aria-current` | `boolean` | `false` | — |
| `data-variant` | `'neutral' \| 'standalone' \| 'subtle'` | `false` | — |
| `aria-disabled` | `'true'` | `false` | — |
| `target` | `'_blank'` | `false` | — |
| `data-hw-external-icon` | `'none'` | `false` | — |

> [!NOTE]
> These classes and attributes are read from the published stylesheet and are outside the stable contract of 0.3.0.

Link has no JavaScript controller. The markup is the API: write a native `a` element with the class `hw-link` and its `href`; every other native attribute stays on the anchor. `data-variant` is optional, and without it the link is the default underlined link. `aria-current` marks the link to the current page. `aria-disabled="true"` styles the link as disabled and does not make it inert, so write the disabled form as described above, without `href`. `target` set to `_blank` shows the stylesheet arrow, and `data-hw-external-icon="none"` removes it; write the rel attribute with noopener and noreferrer yourself. A link that holds a packaged icon is laid out by the stylesheet as an inline row.

### React

Table: Props of Link

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `external` | `boolean` | `false` | — |
| `disabled` | `boolean` | `false` | `false` |
| `variant` | `'default' \| 'subtle' \| 'neutral' \| 'standalone'` | `false` | — |
| `data-variant` | `string` | `false` | — |

Link renders a native `a` element and accepts its native props, including `href`, `target`, `rel`, `onClick` and `className`. `external` writes the target attribute as _blank and adds noopener and noreferrer to the rel that the application passes. `disabled`, or an `aria-disabled` of `true`, removes `href`, writes `role="link"` and a tab index of -1, and cancels the click and auxiliary click before `onClick` and `onAuxClick` run; an enabled link keeps its handlers. `variant` writes `data-variant`; `data-variant` is still accepted for a value that the application defines, and `variant` wins when both are given. The link has no prop for the current page: write `aria-current="page"`.

### Vue

Table: Props, events and slots of Link

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `href` | prop | `string` | `false` | — |
| `disabled` | prop | `boolean` | `false` | `false` |
| `external` | prop | `boolean` | `false` | `false` |
| `variant` | prop | `'default' \| 'subtle' \| 'neutral' \| 'standalone'` | `false` | — |
| `default` | slot | — | `false` | — |

Link renders a native `a` element, and the attributes and listeners that are not props reach it. The default slot holds the link text. `external` writes the target attribute as _blank and adds noopener and noreferrer to the rel attribute that the application writes. `disabled`, or an `aria-disabled` attribute of `true`, removes `href`, writes `role="link"` and a tabindex of -1, and cancels activation before the listeners of the application. The table lists the default slot because the published build reads it; the declaration types no slot. Write `aria-current="page"` for the current page.

### Angular

Table: Inputs, outputs and content of a[hwLink]

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `variant` | input | `'default' \| 'subtle' \| 'neutral' \| 'standalone'` | `false` | — |
| `current` | input | `boolean` | `false` | `false` |
| `disabled` | input | `boolean` | `false` | `false` |
| `external` | input | `boolean` | `false` | `false` |

`HwLinkDirective` applies to `a[hwLink]`: it is a directive on the application's own anchor, so `href`, the router directive and every native attribute and event stay on the real element, which receives the class `hw-link`. `current` writes `aria-current="page"`. `external` writes the target attribute as _blank and adds noopener and noreferrer to the rel that the anchor was written with. `disabled` removes `href`, writes `role="link"` and `aria-disabled="true"` and a tabindex of -1, cancels click and auxiliary click before the browser, a router directive or an application listener sees them, and puts the last written `href` back when `disabled` ends. Without these inputs the directive writes none of these attributes, so an aria-current, target or rel written by the application stays. The `variant` input writes `data-variant`, and without it no attribute is written.

## Accessibility

A link is a native anchor, so the browser provides its role, its place in the tab order, activation with <kbd>Enter</kbd> and the context menu of links. The text of the link is its accessible name; write text that names the destination, and avoid "click here" and repeated "Read more" in one list.

- The default link is underlined, and colour is not the only cue. The neutral and standalone variants remove the underline in their resting state, so use them where position or surroundings mark the link.
- Every link has a visible focus outline of 2px, including a link that holds an icon.
- A disabled link is not a native disabled control. The disabled form has no `href`, so it is not a tab stop, and it keeps `role="link"` and `aria-disabled="true"` so that assistive technology reports it as unavailable. State in the text why it is unavailable, where that helps.
- `aria-current="page"` marks the link to the current page. Do not set it on more than one link of a set of links.
- The stylesheet gives a visited default link its own colour. A visited `neutral` or `subtle` link keeps its resting colour, so do not rely on the visited colour to tell the reader which of those links they have followed. In forced-colours mode the stylesheet uses the system link colours.

## RTL and localisation

Link has no built-in text: the link text, and any text that tells the reader that the link opens a new tab, is written by the application in the language of the page. The anchor inherits the language and the direction of the page, and the stylesheet lays a link that holds an icon out as an inline row in source order, so an icon written after the text stands at the reading end in both directions. The arrow that the stylesheet adds to an external link is also at the reading end.

- Set the hreflang attribute on the anchor for a destination in another language than the page; it is a native attribute and stays on the element.
- A link inside a sentence follows the direction of that sentence. Where a link text mixes Arabic and Latin script, the browser orders the runs by its own bidirectional rules, so check the rendering of such a link in both directions.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Link; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The link colours, hover, pressed, visited and disabled states, the focus outline and the neutral and standalone variants of the supplied Platforms Code style sheet are mapped in the [link notes](../nic-links.md), with the confidence of each mapping.
- Hawiyah substitutes link colours where the source colours have too little contrast on white or on the muted surface, and keeps an underline on the default inline link; these adaptations are documented in the link notes.
