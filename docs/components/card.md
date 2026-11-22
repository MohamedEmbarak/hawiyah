# Card

Card groups related content in a static article with an optional header and footer, or, with the `href` prop or input, in one native link. The application writes the content and the actions; the card adds behaviour only for `disabled`, which blocks the clicks of the card.

## Example

The header holds the title, the body holds the description, and the footer holds a visible action. The action is a real link inside a static card, so the card itself is not interactive.

```html live example=basic
<article class="hw-card">
  <header class="hw-card-header"><h3 class="hw-card-title">Service request SR-2041</h3></header>
  <div class="hw-card-body">
    <p class="hw-card-description">Your request for a copy of a document is under review.</p>
  </div>
  <footer class="hw-card-footer"><a class="hw-button" href="/requests/sr-2041">View request details</a></footer>
</article>
```

```tsx live example=basic
<Card
  header={<h3 className="hw-card-title">Service request SR-2041</h3>}
  footer={<a className="hw-button" href="/requests/sr-2041">View request details</a>}
>
  <p className="hw-card-description">Your request for a copy of a document is under review.</p>
</Card>
```

```vue live example=basic
<Card>
  <template #header><h3 class="hw-card-title">Service request SR-2041</h3></template>
  <p class="hw-card-description">Your request for a copy of a document is under review.</p>
  <template #footer><a class="hw-button" href="/requests/sr-2041">View request details</a></template>
</Card>
```

```ts live example=basic framework=angular
template: `<hw-card>
  <h3 hwCardHeader class="hw-card-title">Service request SR-2041</h3>
  <p class="hw-card-description">Your request for a copy of a document is under review.</p>
  <a hwCardFooter class="hw-button" href="/requests/sr-2041">View request details</a>
</hw-card>`
```

## Variants and states

### Outlined

The outlined variant draws a border instead of a shadow. The other appearances are `default`, `flat`, `elevated` and `ghost`; the flat appearance has no shadow.

```html live example=outlined
<article class="hw-card" data-variant="outlined">
  <header class="hw-card-header"><h3 class="hw-card-title">Profile</h3></header>
  <div class="hw-card-body">
    <p class="hw-card-description">Your contact details are up to date.</p>
  </div>
</article>
```

```tsx live example=outlined
<Card variant="outlined" header={<h3 className="hw-card-title">Profile</h3>}>
  <p className="hw-card-description">Your contact details are up to date.</p>
</Card>
```

```vue live example=outlined
<Card variant="outlined">
  <template #header><h3 class="hw-card-title">Profile</h3></template>
  <p class="hw-card-description">Your contact details are up to date.</p>
</Card>
```

```ts live example=outlined framework=angular
template: `<hw-card variant="outlined">
  <h3 hwCardHeader class="hw-card-title">Profile</h3>
  <p class="hw-card-description">Your contact details are up to date.</p>
</hw-card>`
```

### Whole-card link

With `href` the whole card is one native link. Its content, here the title and the description, is the name of the link, so write content that makes sense as a link name, and place no link or button inside it.

```html live example=link
<a class="hw-card hw-card-action" href="/requests/sr-2041">
  <div class="hw-card-body">
    <h3 class="hw-card-title">Service request SR-2041</h3>
    <p class="hw-card-description">Your request for a copy of a document is under review.</p>
  </div>
</a>
```

```tsx live example=link
<Card href="/requests/sr-2041">
  <h3 className="hw-card-title">Service request SR-2041</h3>
  <p className="hw-card-description">Your request for a copy of a document is under review.</p>
</Card>
```

```vue live example=link
<Card href="/requests/sr-2041">
  <h3 class="hw-card-title">Service request SR-2041</h3>
  <p class="hw-card-description">Your request for a copy of a document is under review.</p>
</Card>
```

```ts live example=link framework=angular
template: `<hw-card href="/requests/sr-2041">
  <h3 class="hw-card-title">Service request SR-2041</h3>
  <p class="hw-card-description">Your request for a copy of a document is under review.</p>
</hw-card>`
```

## API

### JavaScript

Table: Attributes of the hw-card, hw-card-header, hw-card-body and hw-card-footer elements

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-card' \| 'hw-card-header' \| 'hw-card-body' \| 'hw-card-footer'` | `true` | — |
| `data-variant` | `'elevated' \| 'flat' \| 'ghost' \| 'outlined'` | `false` | — |
| `data-disabled` | `'true'` | `false` | — |
| `aria-disabled` | `'true'` | `false` | — |

Card has no JavaScript controller. The markup is the API: write an `article` with the class `hw-card`, an optional `header` with the class `hw-card-header`, a `div` with the class `hw-card-body` and an optional `footer` with the class `hw-card-footer`. The classes `hw-card-title`, `hw-card-description` and `hw-card-image` style the content. A whole-card link is an `a` element with the classes `hw-card` and `hw-card-action`. The `data-variant` attribute takes `elevated`, `flat`, `ghost` or `outlined`, and without it the card has the default appearance. A disabled whole-card link omits `href` and carries `role="link"`, `aria-disabled="true"`, `data-disabled="true"` and `tabindex` set to -1, which the stylesheet styles as disabled through `data-disabled` and `aria-disabled`; the application's event handlers must also respect the disabled state.

### React

Table: Props of Card

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `header` | `ReactNode` | `false` | — |
| `footer` | `ReactNode` | `false` | — |
| `variant` | `'default' \| 'flat' \| 'elevated' \| 'outlined' \| 'ghost'` | `false` | — |
| `href` | `string` | `false` | — |
| `target` | `string` | `false` | — |
| `rel` | `string` | `false` | — |
| `disabled` | `boolean` | `false` | — |

Card renders a native `article`. The `header` and `footer` props fill the header and the footer, and the children fill the body. With `href` the card renders one native link instead, and `target` and `rel` are written on it. The `disabled` prop writes `data-disabled="true"`, which the stylesheet styles as disabled, and blocks the click handler of the card, with or without `href`. On a card with `href` it also removes the destination and writes `role="link"`, `aria-disabled="true"` and `tabindex` set to -1. Without `href`, `target` and `rel` are passed on to the `article` like any other attribute.

### Vue

Table: Props, events and slots of Card

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `variant` | prop | `'default' \| 'flat' \| 'elevated' \| 'outlined' \| 'ghost'` | `false` | — |
| `href` | prop | `string` | `false` | — |
| `disabled` | prop | `boolean` | `false` | `false` |
| `header` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |
| `footer` | slot | — | `false` | — |

Card renders a native `article`, and with `href` one native link. The `header` slot fills the header, the default slot fills the body and the `footer` slot fills the footer. The `disabled` prop writes `data-disabled="true"`, which the stylesheet styles as disabled, and blocks the click handlers of the card, with or without `href`. On a card with `href` it also removes the destination and writes `role="link"`, `aria-disabled="true"` and `tabindex` set to -1.

### Angular

Table: Inputs, outputs and content of hw-card

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `variant` | input | `'default' \| 'flat' \| 'elevated' \| 'outlined' \| 'ghost'` | `false` | — |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `href` | input | `string \| undefined` | `false` | — |
| `target` | input | `string \| undefined` | `false` | — |
| `rel` | input | `string \| undefined` | `false` | — |
| `disabled` | input | `boolean` | `false` | `false` |
| `[hwCardHeader]` | content | — | `false` | — |
| `*` | content | — | `false` | — |
| `[hwCardFooter]` | content | — | `false` | — |

`HwCardComponent` applies to `hw-card`, which is a wrapper: the `article` or the link is rendered inside it, and `id`, `class` and `style` stay on the host. The header and the footer are always rendered. Content marked `hwCardHeader` fills the header, other content fills the body and content marked `hwCardFooter` fills the footer. With `href` the card is one native link, with the classes `hw-card` and `hw-card-action`; without it the card is an `article`. The inputs `aria-label`, `aria-labelledby` and `aria-describedby` written on `hw-card` reach the article or the link. The `variant` input writes no `data-variant` attribute until it is given. The `disabled` input has the effect described for React.

## Accessibility

Card is a static `article`, or a native link when it has `href`. It adds no role and no behaviour of its own, except for a disabled card, described below, so keyboard use follows the elements inside it.

- A static card is not focusable. The links and buttons that the application places in it, in the header, the body or the footer, are focusable and follow the order of the source.
- Give an actionable card a visible action in its footer, such as a link styled as a button, so that the action does not depend on a reader finding that the whole card is a link. For a command, place a real `button` inside a static card: a class does not turn an article into a button.
- A whole-card link takes its accessible name from its content. Do not place a link or a button inside it, because a control cannot be nested in a link. With several cards on one page, make the content of each name its target.
- Use a heading for the title and choose its level for the heading order of the page; the examples use a third-level heading below a second-level heading.
- A disabled card with `href` has no destination and leaves the tab order. React, Vue and Angular write `role="link"`, `aria-disabled="true"` and `tabindex` set to -1 on it and block its clicks.

## RTL and localisation

Card has no built-in text. The title, the description and the action labels are written by the application in the language of the page, and the card follows the page direction through logical properties, so the content starts at the reading start in Arabic and in English.

- Write the title, the description and the action in the language of the card; the card does not translate them.
- An image in the card uses the class `hw-card-image`. If it carries text or a direction, such as an arrow, provide a version for each direction of the page.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Card; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The spacing, the radius, the shadow and the title and description typography of the card section of the supplied Platforms Code files are mapped in the [card notes](../nic-cards.md), together with the variants and the adaptations of the dark hover and focus states.
- The [card notes](../nic-cards.md) record that an actionable card needs a visible action, and that a card must not nest links or buttons inside a whole-card link. The whole-card `href` form remains available and is described there as existing behaviour.
- Card is listed among the initial presentation components of the component scope in the [coverage notes](../coverage.md).
