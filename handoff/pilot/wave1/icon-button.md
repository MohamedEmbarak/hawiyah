# IconButton

IconButton is a native button that shows an icon and no visible text. It needs an explicit accessible name, because the icon alone does not name the action.

## Example

An icon button stands where the action is familiar and the space is small, such as a download action in a row of a list. The name states the action and, where several rows repeat it, the subject.

```html live example=basic
<button class="hw-button hw-icon-button" type="button" data-variant="ghost" data-size="md" aria-label="Download the receipt"><span class="hw-icon" data-icon="download-01" aria-hidden="true"></span></button>
```

```tsx live example=basic
<IconButton label="Download the receipt"><span className="hw-icon" data-icon="download-01" /></IconButton>
```

```vue live example=basic
<IconButton label="Download the receipt"><span class="hw-icon" data-icon="download-01"></span></IconButton>
```

```ts live example=basic framework=angular
template: `<hw-icon-button label="Download the receipt"><span class="hw-icon" data-icon="download-01"></span></hw-icon-button>`
```

## Variants and states

### Variants and shape

The `variant` sets the visual family of the button, as it does on Button: `primary`, `default`, `secondary`, `outline`, `outline-white`, `light`, `danger`, `ghost`, `soft` and `link`. Without a variant the button is `ghost`, a low-emphasis action. The `shape` is `square` or `circle`. The `size` is `sm`, `md` or `lg`.

```html live example=variants
<div class="hw-inline">
  <button class="hw-button hw-icon-button" type="button" data-variant="secondary" data-size="md" aria-label="Copy the reference number"><span class="hw-icon" data-icon="copy-01" aria-hidden="true"></span></button>
  <button class="hw-button hw-icon-button" type="button" data-variant="outline" data-size="lg" data-shape="circle" aria-label="Open the document"><span class="hw-icon" data-icon="file-01" aria-hidden="true"></span></button>
  <button class="hw-button hw-icon-button" type="button" data-variant="ghost" data-size="sm" aria-label="Reload the list"><span class="hw-icon" data-icon="reload" aria-hidden="true"></span></button>
</div>
```

```tsx live example=variants
<div className="hw-inline">
  <IconButton label="Copy the reference number" variant="secondary"><span className="hw-icon" data-icon="copy-01" /></IconButton>
  <IconButton label="Open the document" variant="outline" size="lg" shape="circle"><span className="hw-icon" data-icon="file-01" /></IconButton>
  <IconButton label="Reload the list" size="sm"><span className="hw-icon" data-icon="reload" /></IconButton>
</div>
```

```vue live example=variants
<div class="hw-inline">
  <IconButton label="Copy the reference number" variant="secondary"><span class="hw-icon" data-icon="copy-01"></span></IconButton>
  <IconButton label="Open the document" variant="outline" size="lg" shape="circle"><span class="hw-icon" data-icon="file-01"></span></IconButton>
  <IconButton label="Reload the list" size="sm"><span class="hw-icon" data-icon="reload"></span></IconButton>
</div>
```

```ts live example=variants framework=angular
template: `<div class="hw-inline">
  <hw-icon-button label="Copy the reference number" variant="secondary"><span class="hw-icon" data-icon="copy-01"></span></hw-icon-button>
  <hw-icon-button label="Open the document" variant="outline" size="lg" shape="circle"><span class="hw-icon" data-icon="file-01"></span></hw-icon-button>
  <hw-icon-button label="Reload the list" size="sm"><span class="hw-icon" data-icon="reload"></span></hw-icon-button>
</div>`
```

### Loading and disabled

A loading button is disabled while its action runs and sets `aria-busy`, so it cannot start the action twice. A disabled button uses the native `disabled` attribute and leaves the tab order. The name of the button does not change in either state; state the progress or the reason in text near the button.

```html live example=states
<div class="hw-inline">
  <button class="hw-button hw-icon-button" type="button" data-variant="secondary" data-size="md" aria-label="Refresh the status" aria-busy="true" disabled><span class="hw-icon" data-icon="reload" aria-hidden="true"></span></button>
  <button class="hw-button hw-icon-button" type="button" data-variant="secondary" data-size="md" aria-label="Download the receipt" disabled><span class="hw-icon" data-icon="download-01" aria-hidden="true"></span></button>
</div>
```

```tsx live example=states
<div className="hw-inline">
  <IconButton label="Refresh the status" variant="secondary" loading><span className="hw-icon" data-icon="reload" /></IconButton>
  <IconButton label="Download the receipt" variant="secondary" disabled><span className="hw-icon" data-icon="download-01" /></IconButton>
</div>
```

```vue live example=states
<div class="hw-inline">
  <IconButton label="Refresh the status" variant="secondary" loading><span class="hw-icon" data-icon="reload"></span></IconButton>
  <IconButton label="Download the receipt" variant="secondary" disabled><span class="hw-icon" data-icon="download-01"></span></IconButton>
</div>
```

```ts live example=states framework=angular
template: `<div class="hw-inline">
  <hw-icon-button label="Refresh the status" variant="secondary" [loading]="true"><span class="hw-icon" data-icon="reload"></span></hw-icon-button>
  <hw-icon-button label="Download the receipt" variant="secondary" [disabled]="true"><span class="hw-icon" data-icon="download-01"></span></hw-icon-button>
</div>`
```

## API

### JavaScript

Table: Attributes of the hw-icon-button and hw-icon-background elements

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-icon-button' \| 'hw-icon-background'` | `true` | — |
| `data-shape` | `'square' \| 'circle'` | `false` | — |
| `data-size` | `'xs' \| 'xl' \| 'lg' \| 'sm'` | `false` | — |
| `aria-pressed` | `'true'` | `false` | — |
| `data-icon-only` | `boolean` | `false` | — |
| `aria-disabled` | `'true'` | `false` | — |
| `data-variant` | `'featured'` | `false` | — |
| `data-tone` | `'error' \| 'info' \| 'neutral' \| 'success' \| 'warning'` | `false` | — |
| `data-style` | `'dark' \| 'outline'` | `false` | — |

IconButton has no JavaScript controller. The markup is the API: write a native `button` element with the classes `hw-button` and `hw-icon-button`, its `type`, an `aria-label` that names the action, and, inside it, the packaged icon as a `span` with the class `hw-icon` and `aria-hidden="true"`. `data-variant` and `data-size` follow Button for the button itself, and `data-shape` is read by the stylesheet on the two classes. The table lists the attributes that the stylesheet selects on the two classes: `data-shape` takes `square` or `circle`, `aria-pressed="true"` marks a toggle in its pressed state, and `aria-disabled="true"` styles a disabled appearance without disabling the element, so write the native `disabled` attribute for a disabled button. `data-icon-only` marks a button that holds an icon only. `hw-icon-background` is a separate, non-interactive class for an icon on a round or square background; the table lists `data-size`, `data-variant="featured"`, `data-tone` and `data-style` with the values that the stylesheet selects on the two classes.

### React

Table: Props of IconButton

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `label` | `string` | `true` | — |
| `shape` | `'square' \| 'circle'` | `false` | — |
| `data-shape` | `string` | `false` | — |
| `variant` | `'primary' \| 'default' \| 'secondary' \| 'outline' \| 'outline-white' \| 'light' \| 'danger' \| 'ghost' \| 'soft' \| 'link'` | `false` | `'ghost'` |
| `size` | `'sm' \| 'md' \| 'lg'` | `false` | — |
| `loading` | `boolean` | `false` | — |

IconButton accepts the props of Button together with a required `label`, which is the accessible name. An `aria-label` or `aria-labelledby` prop names the button instead of `label`; without any of them the button is unnamed, and a development warning reports it. `shape` writes `data-shape`, and the `data-shape` prop remains accepted. The children are the icon: they render inside an element with `aria-hidden="true"`, so write a decorative icon and no text. The `loading` prop disables the button and sets `aria-busy`.

### Vue

Table: Props, events and slots of IconButton

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `label` | prop | `string` | `false` | — |
| `variant` | prop | `'primary' \| 'default' \| 'secondary' \| 'outline' \| 'outline-white' \| 'light' \| 'danger' \| 'ghost' \| 'soft' \| 'link'` | `false` | `'ghost'` |
| `size` | prop | `'sm' \| 'md' \| 'lg'` | `false` | `'md'` |
| `shape` | prop | `'square' \| 'circle'` | `false` | — |
| `disabled` | prop | `boolean` | `false` | `false` |
| `loading` | prop | `boolean` | `false` | `false` |
| `default` | slot | — | `false` | — |

`label` is the accessible name. It is optional in the type because an `aria-label` or `aria-labelledby` attribute names the button instead; without any of them the button is unnamed, and a development warning reports it. The default slot holds the icon and renders inside an element with `aria-hidden="true"`, so write a decorative icon and no text. `loading` disables the button and sets `aria-busy`. The component exposes `focus()` through a template ref. The table lists the default slot because the published build reads it; the declaration types no slot.

### Angular

Table: Inputs, outputs and content of hw-icon-button

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `label` | input | `string` | `false` | `''` |
| `type` | input | `'button' \| 'submit' \| 'reset'` | `false` | `'button'` |
| `disabled` | input | `boolean` | `false` | `false` |
| `loading` | input | `boolean` | `false` | `false` |
| `pressed` | input | `boolean \| null` | `false` | `null` |
| `variant` | input | `string` | `false` | `'ghost'` |
| `size` | input | `string` | `false` | `'md'` |
| `shape` | input | `'square' \| 'circle'` | `false` | `'square'` |
| `form` | input | `string \| null` | `false` | — |
| `name` | input | `string` | `false` | `''` |
| `value` | input | `string` | `false` | `''` |
| `controls` | input | `string` | `false` | `''` |
| `expanded` | input | `boolean \| null` | `false` | `null` |
| `hasPopup` | input | `'true' \| 'false' \| 'menu' \| 'listbox' \| 'tree' \| 'grid' \| 'dialog' \| null` | `false` | `null` |
| `activated` | output | `MouseEvent` | `false` | — |
| `*` | content | — | `false` | — |

`HwIconButtonComponent` applies to `hw-icon-button` and renders the native `button` with the classes `hw-button` and `hw-icon-button` inside its host. `label` is the accessible name; it is required unless `aria-label` or `aria-labelledby` is written on the host, and the host keeps none of `aria-label`, `aria-labelledby` and `aria-describedby`, because they are forwarded to the button. `pressed`, `expanded`, `controls` and `hasPopup` write `aria-pressed`, `aria-expanded`, `aria-controls` and `aria-haspopup`, and `loading` disables the button and sets `aria-busy`. `activated` emits the click event. The projected content is the icon, which renders inside an element with `aria-hidden="true"`; the component also has a public `focus()` method. The `form` input has no default: the button writes no `form` attribute until a value is given, and `name` and `controls` are written only when they are not empty.

## Accessibility

IconButton is a native button, so the browser provides its role, its place in the tab order and its activation with <kbd>Enter</kbd> and <kbd>Space</kbd>.

- The accessible name comes from `label`, `aria-label` or `aria-labelledby`, never from the icon. Name the action, such as "Download the receipt", and not the picture, such as "Arrow".
- The icon is hidden from assistive technology. In the vanilla markup write `aria-hidden="true"` on the icon `span`; React, Vue and Angular render the icon inside an element with that attribute.
- Where several icon buttons repeat in a list, include the subject in the name, so that a reader of a list of controls can tell them apart.
- A toggle uses `aria-pressed`: the `pressed` input in Angular, and the native attribute in the other adapters. The name stays the same in both states.
- A loading button is disabled and has `aria-busy`, so activation is not repeated while the action runs.
- The glyph is 20 px, and 16 px in the small size. The button targets of the sizes are 32, 40 and 40 px in the comfortable density; the compact density uses 24, 32 and 40 px, and the mobile density 32, 40 and 44 px.

## RTL and localisation

IconButton has no built-in text: the name of the action is written by the application in the language of the page, and so is any text near the button that states a state or a reason. The icons are not mirrored by default. Mirroring is opt-in through `data-directional="true"` on the icon, and the icons of the package that allow it are the horizontal arrows and the diagonal arrow arrow-up-right-01.

- Choose an icon whose meaning does not depend on the reading direction, or mirror a directional one, such as an arrow that points forward.
- The icon of a download, a copy or a reload action keeps its orientation in Arabic and in English.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of IconButton; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The size, shape and glyph geometry of the supplied Platforms Code style sheet are mapped in the [icon notes](../nic-icons.md), with the confidence of each mapping and the intentional density and shape adaptations.
- Hawiyah keeps square targets for the small size where the source small button is not square, inherits the glyph colour from the button and gives disabled and loading states precedence over the selected state; these adaptations are documented in the icon notes.
