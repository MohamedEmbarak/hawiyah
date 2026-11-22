# Skeleton

Skeleton is a decorative placeholder that holds the place of content while it loads. It is hidden from assistive technology, so the application announces the loading state itself.

## Example

A status container holds a visually hidden loading text and the skeletons, so a screen reader announces one message instead of empty shapes. The application replaces the whole container with the content when it arrives.

```html live example=basic static
<div class="hw-stack" role="status">
  <span class="hw-sr-only">Loading your requests</span>
  <span class="hw-skeleton" aria-hidden="true" data-variant="text"></span>
  <span class="hw-skeleton" aria-hidden="true" data-variant="text"></span>
  <span class="hw-skeleton" aria-hidden="true"></span>
</div>
```

```tsx live example=basic
<div className="hw-stack" role="status">
  <span className="hw-sr-only">Loading your requests</span>
  <Skeleton variant="text" />
  <Skeleton variant="text" />
  <Skeleton />
</div>
```

```vue live example=basic
<div class="hw-stack" role="status">
  <span class="hw-sr-only">Loading your requests</span>
  <Skeleton variant="text" />
  <Skeleton variant="text" />
  <Skeleton />
</div>
```

```ts live example=basic framework=angular
template: `<div class="hw-stack" role="status">
  <span class="hw-sr-only">Loading your requests</span>
  <hw-skeleton variant="text" />
  <hw-skeleton variant="text" />
  <hw-skeleton />
</div>`
```

## Variants and states

### Circle

The `circle` variant keeps a square aspect ratio with fully rounded corners. It stands in for an avatar or a profile picture while the profile loads. The skeleton has no size of its own, so the application sizes it with a class or a `style` attribute of its own; the example lays it out in an inline container and shows the smallest size the stylesheet gives it. In a block container the circle would take the whole inline size of the container.

```html live example=circle static
<div class="hw-inline" role="status">
  <span class="hw-sr-only">Loading your profile</span>
  <span class="hw-skeleton" aria-hidden="true" data-variant="circle"></span>
</div>
```

```tsx live example=circle
<div className="hw-inline" role="status">
  <span className="hw-sr-only">Loading your profile</span>
  <Skeleton variant="circle" />
</div>
```

```vue live example=circle
<div class="hw-inline" role="status">
  <span class="hw-sr-only">Loading your profile</span>
  <Skeleton variant="circle" />
</div>
```

```ts live example=circle framework=angular
template: `<div class="hw-inline" role="status">
  <span class="hw-sr-only">Loading your profile</span>
  <hw-skeleton variant="circle" />
</div>`
```

## API

### JavaScript

Table: Attributes of the hw-skeleton element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-skeleton'` | `true` | — |
| `data-variant` | `'circle' \| 'text'` | `false` | — |

Skeleton has no JavaScript controller. The markup is the API: write a `span` with the class `hw-skeleton` and `aria-hidden="true"` inside a container with `role="status"` that also holds a `span` with the class `hw-sr-only` and the loading text. `data-variant` is optional: `text` gives a line of text a reduced minimum height and slightly rounded corners, and `circle` gives a square aspect ratio with a round shape. Without it the skeleton is a rounded block. Set the dimensions with a class or a `style` attribute of your own; the stylesheet gives only a minimum height.

### React

Table: Props of Skeleton

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `variant` | `'text' \| 'circle'` | `false` | — |

`variant` selects `text` or `circle`; without it the skeleton is a block. Skeleton renders one `span` with the class `hw-skeleton` and `aria-hidden="true"`, and it accepts the native attributes of a `span`, such as `className`. It carries no loading text of its own: write the status container and the visually hidden text around it, as the example does, and replace the container when the content arrives.

### Vue

Table: Props, events and slots of Skeleton

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `variant` | prop | `'text' \| 'circle'` | `false` | — |

`variant` selects `text` or `circle`; without it the skeleton is a block. Skeleton renders one `span` with the class `hw-skeleton` that is hidden from assistive technology, and attributes such as `class` reach it. It has no slot and no loading text of its own: write the status container and the visually hidden text around it. The published declaration types no slot, and the build reads none.

### Angular

Table: Inputs, outputs and content of hw-skeleton

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `variant` | input | `'text' \| 'circle'` | `false` | — |

`HwSkeletonComponent` applies to `hw-skeleton`, and its host element is the skeleton itself: the class `hw-skeleton` and `aria-hidden="true"` stand on the host. `variant` selects `text` or `circle`; without it the skeleton is a block. The component has no content and no loading text of its own: write the status container and the visually hidden text around it. Set the dimensions with a class of your own on the element.

## Accessibility

A skeleton is a decorative element and is hidden from assistive technology, so it has no role and no name. Loading is announced by the container that surrounds the skeletons.

- The container has `role="status"` and holds a visually hidden text, written by the application, that says what is loading, such as "Loading your requests". The text is the only thing a screen reader announces.
- `aria-busy="true"` may be added to the region that is being filled. Do not combine it with an `aria-label` on an element that has no role.
- Replace the whole container with the content when it arrives, so the placeholder and its status text do not remain in the page.
- The skeleton pulses to show that content is coming. The stylesheet removes the animation when the reader asks for reduced motion, and in forced colours it draws a border.
- A skeleton is not focusable and does not take part in the tab order.

## RTL and localisation

Skeleton has no built-in text. The loading text is written by the application in the language of the page. The skeleton has no direction of its own: a block fills the inline size of its container from the reading start, and the `circle` variant is symmetrical, so the same markup serves left-to-right and right-to-left pages.

- Size a skeleton with inline-size and block-size, as the packages document, so that its dimensions follow the writing mode of the page.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. 

This section names the sources of the mapping of Skeleton; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- Skeleton is listed among the initial presentation components of the component scope in the [coverage notes](../coverage.md). The notes record no mapping of a supplied Platforms Code source for it.
- The one adaptation recorded for skeletons concerns dark mode: the Platforms Code dark palette gives the surface and the muted surface one value, so skeletons use a step lighter than the surface. The README of `@hawiyah/styles` states the adaptation; the dark theme itself is resolved from the supplied semantic modes, as the [DGA reference notes](../dga-reference.md) describe.
