# EmptyState

EmptyState explains that a region has no content and offers a next action. It renders a third-level heading, an optional description, an optional decorative icon and an optional action.

## Example

The title states what is absent, the description says why or what to do, and the action gives the reader a way forward. The icon is decorative and is hidden from assistive technology.

```html live example=basic
<div class="hw-empty">
  <span class="hw-empty-icon" aria-hidden="true"><span class="hw-icon" data-icon="search-01"></span></span>
  <h3>No requests found</h3>
  <p>No service request matches the filters you selected. Change the filters to see more requests.</p>
  <button class="hw-button" type="button" data-variant="secondary" data-size="md">Clear filters</button>
</div>
```

```tsx live example=basic
<EmptyState
  title="No requests found"
  description="No service request matches the filters you selected. Change the filters to see more requests."
  icon={<span className="hw-icon" data-icon="search-01" />}
  action={<Button variant="secondary">Clear filters</Button>}
/>
```

```vue live example=basic
<EmptyState
  title="No requests found"
  description="No service request matches the filters you selected. Change the filters to see more requests."
>
  <template #icon><span class="hw-icon" data-icon="search-01"></span></template>
  <template #action><Button variant="secondary">Clear filters</Button></template>
</EmptyState>
```

```ts live example=basic framework=angular
template: `<hw-empty-state
  title="No requests found"
  description="No service request matches the filters you selected. Change the filters to see more requests."
>
  <span hwEmptyIcon class="hw-icon" data-icon="search-01"></span>
  <button hwButton hwEmptyAction variant="secondary">Clear filters</button>
</hw-empty-state>`
```

## Variants and states

### Without an action

When the reader has nothing to do, the empty state holds only the title and the description. Use this form when the content appears later without any step from the reader.

```html live example=informational
<div class="hw-empty">
  <h3>No documents yet</h3>
  <p>Documents appear here after a service request is completed.</p>
</div>
```

```tsx live example=informational
<EmptyState
  title="No documents yet"
  description="Documents appear here after a service request is completed."
/>
```

```vue live example=informational
<EmptyState
  title="No documents yet"
  description="Documents appear here after a service request is completed."
/>
```

```ts live example=informational framework=angular
template: `<hw-empty-state
  title="No documents yet"
  description="Documents appear here after a service request is completed."
/>`
```

## API

### JavaScript

Table: Attributes of the hw-empty element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-empty'` | `true` | — |

EmptyState has no JavaScript controller. The markup is the API: write an element with the class `hw-empty`, an optional `span` with the class `hw-empty-icon` that holds a packaged icon, a third-level heading for the title, a paragraph for the description and, last, the action. The author writes `aria-hidden="true"` on the icon region.

### React

Table: Props of EmptyState

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `title` | `ReactNode` | `true` | — |
| `description` | `ReactNode` | `false` | — |
| `icon` | `ReactNode` | `false` | — |
| `action` | `ReactNode` | `false` | — |

The `title` prop is required and renders as a third-level heading. The `description` prop renders a paragraph, the `icon` prop renders inside a `span` with the class `hw-empty-icon` before the heading, and the `action` prop renders last. Children are rendered between the description and the action. The `title`, `description`, `icon` and `action` props take any React node.

### Vue

Table: Props, events and slots of EmptyState

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `title` | prop | `string` | `true` | — |
| `description` | prop | `string` | `false` | — |
| `icon` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |
| `action` | slot | — | `false` | — |

The `title` prop is required and renders as a third-level heading, and `description` renders a paragraph. The `icon` slot fills the decorative icon region before the heading, the default slot adds content after the description, and the `action` slot renders last.

### Angular

Table: Inputs, outputs and content of hw-empty-state

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `title` | input | `string` | `true` | — |
| `description` | input | `string` | `false` | `''` |
| `[hwEmptyIcon]` | content | — | `false` | — |
| `*` | content | — | `false` | — |
| `[hwEmptyAction]` | content | — | `false` | — |

`HwEmptyStateComponent` applies to `hw-empty-state`, and the host element is the empty state itself. The `title` input is required and renders as a third-level heading; `description` renders a paragraph. Content marked `hwEmptyIcon` renders before the title in the decorative icon region, which is always rendered and hidden by the stylesheet while it is empty. Other content is added after the description, and content marked `hwEmptyAction` renders last without a wrapper.

## Accessibility

EmptyState is a block of static content, not an interactive component. It renders no role of its own, and the action keeps the keyboard behaviour of the element the application supplies.

- The title is a third-level heading, so place the empty state below a second-level heading of the page or of the region it replaces to keep the heading order.
- The icon region is hidden from assistive technology. The title and the description carry the whole message, so do not rely on the icon to say why the content is absent.
- The action is supplied by the application, as a component such as Button or as a native element. Give it a name that states the step, such as "Clear filters", and make it a link for a destination and a button for a command.
- The empty state does not announce itself. When it replaces content after a reader action, such as a search, tell the reader about the change in the page, for example through a status message.

## RTL and localisation

EmptyState has no built-in text. The title, the description and the action label are written by the application in the language of the page, and the component centres its icon, text and action in both directions, so the layout is the same in Arabic and in English.

- Write the title and the description in the language of the page; the component does not translate them.
- Keep the description short and name the reason or the next step.
- Do not rely on the direction of the icon to carry meaning: choose an icon that reads the same in either direction.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of EmptyState; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- EmptyState is listed among the initial presentation components of the component scope in the [coverage notes](../coverage.md). The notes record no separate note for it.
