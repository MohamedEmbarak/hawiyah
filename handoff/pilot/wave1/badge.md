# Badge

Badge is a compact static label that states a short status or category next to other content. It carries its meaning in its text; the tone adds emphasis and never replaces the words.

## Example

The example shows one badge on its own; in a page a badge sits beside the item it describes. Its text states the status in words, so a reader who cannot distinguish the colour still receives the message.

```html live example=basic static
<span class="hw-badge" data-tone="success">Completed</span>
```

```tsx live example=basic
<Badge tone="success">Completed</Badge>
```

```vue live example=basic
<Badge tone="success">Completed</Badge>
```

```ts live example=basic framework=angular
template: `<hw-badge tone="success">Completed</hw-badge>`
```

## Variants and states

### Tones

`tone` takes `neutral`, `success`, `warning`, `danger` or `info`. Choose the tone for the kind of status, and keep the text specific: "Action required" says more than "Warning". A group of badges stands in an element with the class `hw-badges`, which wraps the badges and spaces them evenly.

```html live example=tones static
<div class="hw-badges">
  <span class="hw-badge" data-tone="neutral">Draft</span>
  <span class="hw-badge" data-tone="info">In review</span>
  <span class="hw-badge" data-tone="success">Completed</span>
  <span class="hw-badge" data-tone="warning">Action required</span>
  <span class="hw-badge" data-tone="danger">Rejected</span>
</div>
```

```tsx live example=tones
<div className="hw-badges">
  <Badge tone="neutral">Draft</Badge>
  <Badge tone="info">In review</Badge>
  <Badge tone="success">Completed</Badge>
  <Badge tone="warning">Action required</Badge>
  <Badge tone="danger">Rejected</Badge>
</div>
```

```vue live example=tones
<div class="hw-badges">
  <Badge tone="neutral">Draft</Badge>
  <Badge tone="info">In review</Badge>
  <Badge tone="success">Completed</Badge>
  <Badge tone="warning">Action required</Badge>
  <Badge tone="danger">Rejected</Badge>
</div>
```

```ts live example=tones framework=angular
template: `<div class="hw-badges">
  <hw-badge tone="neutral">Draft</hw-badge>
  <hw-badge tone="info">In review</hw-badge>
  <hw-badge tone="success">Completed</hw-badge>
  <hw-badge tone="warning">Action required</hw-badge>
  <hw-badge tone="danger">Rejected</hw-badge>
</div>`
```

### Outline and dot

`variant` changes the appearance of the badge. The `soft` variant is the default appearance: React, Vue and Angular accept it by name, and the vanilla markup writes no attribute for it. The `outline` variant has a transparent background and a border in the current colour. The `dot` variant adds a small dot before the text, which is decorative: the text carries the status.

```html live example=variants static
<div class="hw-badges">
  <span class="hw-badge" data-tone="info" data-variant="outline">In review</span>
  <span class="hw-badge" data-tone="success" data-variant="dot">Completed</span>
</div>
```

```tsx live example=variants
<div className="hw-badges">
  <Badge tone="info" variant="outline">In review</Badge>
  <Badge tone="success" variant="dot">Completed</Badge>
</div>
```

```vue live example=variants
<div class="hw-badges">
  <Badge tone="info" variant="outline">In review</Badge>
  <Badge tone="success" variant="dot">Completed</Badge>
</div>
```

```ts live example=variants framework=angular
template: `<div class="hw-badges">
  <hw-badge tone="info" variant="outline">In review</hw-badge>
  <hw-badge tone="success" variant="dot">Completed</hw-badge>
</div>`
```

## API

### JavaScript

Table: Attributes of the hw-badge element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-badge'` | `true` | — |
| `data-tone` | `'success' \| 'warning' \| 'danger' \| 'info'` | `false` | — |
| `data-variant` | `'outline' \| 'dot'` | `false` | — |

Badge has no JavaScript controller. The markup is the API: write a `span` with the class `hw-badge` that holds the text. `data-tone` is optional and takes `success`, `warning`, `danger` or `info`; without it the badge has the neutral appearance, and `data-tone="neutral"` states it explicitly. `data-variant` is optional: `outline` and `dot` change the appearance, and without it the badge is the soft default. Wrap several badges in an element with the class `hw-badges`.

### React

Table: Props of Badge

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `tone` | `'neutral' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `false` | `'neutral'` |
| `variant` | `'soft' \| 'outline' \| 'dot'` | `false` | — |

Badge renders a `span` with the class `hw-badge`, and its children are the text. `tone` defaults to `neutral` and is written to the `data-tone` attribute. `variant` takes `soft`, `outline` or `dot` and is written to the `data-variant` attribute; without it no attribute is written and the badge has the soft appearance. Other attributes, such as `className`, reach the `span`.

### Vue

Table: Props, events and slots of Badge

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `tone` | prop | `'neutral' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `false` | `'neutral'` |
| `variant` | prop | `'soft' \| 'outline' \| 'dot'` | `false` | — |
| `default` | slot | — | `false` | — |

Badge renders a `span` with the class `hw-badge`, and the default slot is the text. `tone` defaults to `neutral`, and `variant` takes `soft`, `outline` or `dot`; without a variant the badge has the soft appearance. Other attributes, such as `class`, reach the `span`. The published declaration types no slot, and the build reads the default slot.

### Angular

Table: Inputs, outputs and content of hw-badge

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `variant` | input | `'soft' \| 'outline' \| 'dot'` | `false` | — |
| `tone` | input | `'neutral' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `false` | `'neutral'` |
| `*` | content | — | `false` | — |

`HwBadgeComponent` applies to `hw-badge`, and its host element is the badge itself: the class `hw-badge`, and any `class`, `id` or ARIA attribute written on it, stand on the styled element. `tone` defaults to `neutral`, and `variant` takes `soft`, `outline` or `dot`. The projected content is the text of the badge.

## Accessibility

Badge is static content. It adds no role, no keyboard stop, no live region and no hover or click effect, so assistive technology presents it as plain text.

- Colour alone does not carry the status: write the status in the text of the badge, and use the tone and the dot as emphasis only.
- The dot of the `dot` variant is decorative and is not read.
- A badge does not announce a change. When the status changes while the reader is on the page, supply a separate live region that states the new status.
- A badge is informational. It is not a button and has no touch target of its own; use a button or a link for an action.
- Long text wraps inside a narrow container, and the badge grows in height.

## RTL and localisation

Badge has no built-in text. The text is written by the application in the language of the page, and the badge follows the page direction, so the dot stands at the reading start in Arabic and in English.

- Write status words in the language of the page; the tone does not translate them.
- A group of badges wraps and keeps the same gap in both directions.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Badge; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The badge geometry, the five tone palettes and the dot status label of the supplied Platforms Code style sheet are mapped in the [badge notes](../nic-badges.md), with the confidence of each mapping.
- The outline variant is an extension of Hawiyah, and the dark mode palette is an adaptation that the [badge notes](../nic-badges.md) describe as contrast-tested.
