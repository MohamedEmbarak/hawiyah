# ServiceCard

ServiceCard summarises one service in an article: a title with an optional category, a description, a list of facts and one action. The application owns the destination and the action; the card does not start the service itself.

## Example

The title names the service. The category, description and facts help a reader compare services in a list, and the action link carries a name that includes the service.

```html live example=basic
<article class="hw-card hw-service-card">
  <header class="hw-card-header"><div><span class="hw-badge" data-tone="neutral">Documents</span><h3>Copy of a document</h3></div></header>
  <div class="hw-card-body">
    <p>Request a certified copy of a document held on your record.</p>
    <dl class="hw-description-list"><div><dt>Duration</dt><dd>3 days</dd></div><div><dt>Fee</dt><dd>Free</dd></div></dl>
  </div>
  <footer class="hw-card-footer"><a class="hw-link" href="/services/document-copy">Request a copy of a document</a></footer>
</article>
```

```tsx live example=basic
<ServiceCard
  title="Copy of a document"
  category="Documents"
  description="Request a certified copy of a document held on your record."
  metadata={[
    { term: 'Duration', description: '3 days' },
    { term: 'Fee', description: 'Free' },
  ]}
  href="/services/document-copy"
  actionLabel="Request a copy of a document"
/>
```

```vue live example=basic
<ServiceCard
  title="Copy of a document"
  category="Documents"
  description="Request a certified copy of a document held on your record."
  :metadata="[
    { term: 'Duration', description: '3 days' },
    { term: 'Fee', description: 'Free' },
  ]"
  href="/services/document-copy"
  action-label="Request a copy of a document"
/>
```

```ts live example=basic framework=angular
template: `<hw-service-card
  title="Copy of a document"
  category="Documents"
  description="Request a certified copy of a document held on your record."
  [metadata]="[
    { term: 'Duration', description: '3 days' },
    { term: 'Fee', description: 'Free' },
  ]"
  href="/services/document-copy"
  actionLabel="Request a copy of a document"
/>`
```

## Variants and states

### Icon

An icon in the header marks the kind of service. The card hides it from assistive technology, so it carries no meaning of its own: the title and the category name the service.

```html live example=icon
<article class="hw-card hw-service-card">
  <header class="hw-card-header"><div class="hw-service-card-icon" aria-hidden="true"><span class="hw-icon" data-icon="file-01"></span></div><div><span class="hw-badge" data-tone="neutral">Documents</span><h3>Document status</h3></div></header>
  <div class="hw-card-body">
    <p>Check the status of a document request.</p>
  </div>
  <footer class="hw-card-footer"><a class="hw-link" href="/services/document-status">Check the status of a document request</a></footer>
</article>
```

```tsx live example=icon
<ServiceCard
  title="Document status"
  category="Documents"
  description="Check the status of a document request."
  icon={<span className="hw-icon" data-icon="file-01" />}
  href="/services/document-status"
  actionLabel="Check the status of a document request"
/>
```

```vue live example=icon
<ServiceCard
  title="Document status"
  category="Documents"
  description="Check the status of a document request."
  href="/services/document-status"
  action-label="Check the status of a document request"
>
  <template #icon><span class="hw-icon" data-icon="file-01"></span></template>
</ServiceCard>
```

```ts live example=icon framework=angular
template: `<hw-service-card
  title="Document status"
  category="Documents"
  description="Check the status of a document request."
  href="/services/document-status"
  actionLabel="Check the status of a document request"
>
  <span hwServiceIcon class="hw-icon" data-icon="file-01"></span>
</hw-service-card>`
```

### Custom action

The card holds one action. When the action is a command rather than a destination, the application supplies it instead of `href`: a `footer` with the class `hw-card-footer` that holds the element in the vanilla markup, the `action` prop in React, the `action` slot in Vue and content marked `hwServiceAction` in Angular. Use a link for a destination and a button for a command.

```html live example=action
<article class="hw-card hw-service-card">
  <header class="hw-card-header"><div><h3>Profile update</h3></div></header>
  <div class="hw-card-body">
    <p>Update the contact details on your profile.</p>
  </div>
  <footer class="hw-card-footer"><button class="hw-button" type="button" data-variant="secondary" data-size="md">Start update</button></footer>
</article>
```

```tsx live example=action
<ServiceCard
  title="Profile update"
  description="Update the contact details on your profile."
  action={<Button variant="secondary">Start update</Button>}
/>
```

```vue live example=action
<ServiceCard title="Profile update" description="Update the contact details on your profile.">
  <template #action><Button variant="secondary">Start update</Button></template>
</ServiceCard>
```

```ts live example=action framework=angular
template: `<hw-service-card title="Profile update" description="Update the contact details on your profile.">
  <button hwButton hwServiceAction variant="secondary">Start update</button>
</hw-service-card>`
```

### Without an action

A card without `href` and without an action has no footer content. The vanilla, React and Vue forms render no footer, and the Angular form renders an empty footer that the stylesheet hides. Use this form when the card only informs.

```html live example=informational
<article class="hw-card hw-service-card">
  <header class="hw-card-header"><div><span class="hw-badge" data-tone="neutral">Requests</span><h3>Request tracking</h3></div></header>
  <div class="hw-card-body">
    <p>Each request has a reference number that identifies it in every message.</p>
  </div>
</article>
```

```tsx live example=informational
<ServiceCard
  title="Request tracking"
  category="Requests"
  description="Each request has a reference number that identifies it in every message."
/>
```

```vue live example=informational
<ServiceCard
  title="Request tracking"
  category="Requests"
  description="Each request has a reference number that identifies it in every message."
/>
```

```ts live example=informational framework=angular
template: `<hw-service-card
  title="Request tracking"
  category="Requests"
  description="Each request has a reference number that identifies it in every message."
/>`
```

## API

### JavaScript

Table: Attributes of the hw-service-card element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-service-card'` | `true` | — |
| `data-variant` | `'compact' \| 'featured'` | `false` | — |

> [!NOTE]
> These classes and attributes are read from the published stylesheet and are outside the stable contract of 0.3.0.

ServiceCard has no JavaScript controller. The markup is the API: write an `article` with the classes `hw-card` and `hw-service-card`, a `header` with the class `hw-card-header`, a `div` with the class `hw-card-body` and, for an action, a `footer` with the class `hw-card-footer`. The category is a `span` with the class `hw-badge` that precedes the third-level heading inside the header; the title is not a link. The facts are a description list element with the class `hw-description-list`, and the icon is a `div` with the class `hw-service-card-icon` that holds a packaged icon; the author writes `aria-hidden="true"` on it. `data-variant` is optional: `compact` reduces the spacing, and `featured` marks the card with the primary colour. Without it the card has the default appearance.

### React

Table: Props of ServiceCard

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `title` | `ReactNode` | `true` | — |
| `description` | `ReactNode` | `false` | — |
| `category` | `ReactNode` | `false` | — |
| `metadata` | `readonly DescriptionItem[]` | `false` | — |
| `icon` | `ReactNode` | `false` | — |
| `variant` | `'default' \| 'flat' \| 'elevated' \| 'outlined' \| 'ghost'` | `false` | — |
| `href` | `string` | `false` | — |
| `target` | `string` | `false` | — |
| `rel` | `string` | `false` | — |
| `disabled` | `boolean` | `false` | — |
| `action` | `ReactNode` | `false` | — |
| `actionLabel` | `string` | `false` | — |

The title is required and renders as a third-level heading. Each item of `metadata` has a `term` and a `description`, and the card renders a description list only when the array has entries. With `href` the card renders a link in the footer whose whole text and accessible name is `actionLabel`, which is required in that case; the card appends nothing to it, so include the service name where several cards stand on one page. The `action` prop replaces that link and takes precedence over it. Children are rendered in the body after the description and the facts. The `variant` prop takes the appearances `'default'`, `'flat'`, `'elevated'`, `'outlined'` and `'ghost'`, and the card also accepts the other props of the Card component, such as `className`, `target`, `rel` and `disabled`. Because the card consumes `href`, it renders an `article`: `target` and `rel` are written on the `article` and do not reach the action link, and `disabled` writes `data-disabled="true"` on the `article`.

### Vue

Table: Props, events and slots of ServiceCard

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `title` | prop | `string` | `true` | — |
| `description` | prop | `string` | `false` | — |
| `href` | prop | `string` | `false` | — |
| `actionLabel` | prop | `string` | `false` | — |
| `category` | prop | `string` | `false` | — |
| `metadata` | prop | `readonly DescriptionItem[]` | `false` | — |
| `icon` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |
| `action` | slot | — | `false` | — |

The `category` prop renders a neutral badge before the heading, and `metadata` renders a stacked description list in the body only when it has entries; each entry has a `term` and a `description`. With `href` and no `action` slot the card renders a link in the footer, and `actionLabel` is required in that case. The `icon` slot fills the icon region of the header, the default slot adds content to the body, and the `action` slot replaces the link. The card renders no footer without `href` or an `action` slot.

### Angular

Table: Inputs, outputs and content of hw-service-card

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `title` | input | `string` | `true` | — |
| `href` | input | `string` | `false` | `''` |
| `description` | input | `string` | `false` | `''` |
| `category` | input | `string` | `false` | `''` |
| `metadata` | input | `readonly HwDescription[]` | `false` | `[]` |
| `actionLabel` | input | `string` | `false` | `''` |
| `variant` | input | `string` | `false` | `'default'` |
| `[hwServiceIcon]` | content | — | `false` | — |
| `*` | content | — | `false` | — |
| `[hwServiceAction]` | content | — | `false` | — |

`HwServiceCardComponent` applies to `hw-service-card`. The title renders as a third-level heading and is text, not a link. With a non-empty `href` and no projected `[hwServiceAction]` content, the card renders a link whose whole text and accessible name is `actionLabel`, which is required in that case only; include the service name in it where several cards share a page. Content marked `hwServiceIcon` fills the icon region, other content is added to the body, and content marked `hwServiceAction` replaces the link; to keep the look of a button for a destination, project a link element marked `hwServiceAction` that takes the button appearance of the library, with its `href`, and project a `button` element marked `hwServiceAction` for a command. Without `href` and without projected action content, the footer is empty and the stylesheet hides it. The `variant` input is written to the `data-variant` attribute of the article.

## Accessibility

ServiceCard renders an `article` whose header holds the title as a third-level heading. The card is not interactive as a whole: the one action in the footer is a native link or the element the application supplies, so keyboard use and activation follow that element.

- The title is not a link. Only the action is focusable by default. `actionLabel` is the accessible name of the packaged link; an action that the application supplies has its own name, and content that the application places in the body can add focusable elements of its own.
- Write a link name that includes the service, such as "Request a copy of a document", because the card appends nothing to it. Several cards that all read "Apply" give a reader of a link list no way to tell them apart.
- The icon region is hidden from assistive technology. Do not rely on an icon to convey the category or the status of a service.
- The facts are a description list element: each term and its description stand in one group of the list.
- A card has one action. Place further actions in the page, or open the service details page from the action.
- The title is a third-level heading, so place cards below a second-level heading of the page to keep the heading order.

> [!NOTE]
> The category badge is neutral. State the status of a service, such as unavailable or suspended, in the description or the facts, in words.

## RTL and localisation

ServiceCard has no built-in text. The title, category, description, facts and the action label are all written by the application in the language of the page, and the card follows the page direction through logical properties, so the header, the icon and the footer action start at the reading start in Arabic and in English.

- Write the terms and the descriptions of the facts in the language of the card; the card does not translate or reorder them.
- A value such as a fee or a duration stays in the text of its `description`, so the application controls its numerals and units.
- In a grid of cards, keep the facts in the same order on every card so that a reader can compare them.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of ServiceCard; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- ServiceCard is listed among the platform patterns of the component scope in the [coverage notes](../coverage.md). It is composed from the card, the badge, the description list and the link of the library.
- The card structure of the [card notes](../nic-cards.md), a header, a body and a footer with a visible action on an actionable card, is the basis of the anatomy. The notes describe Card, and ServiceCard records no verification evidence of its own.
