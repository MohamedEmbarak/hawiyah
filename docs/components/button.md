# Button

Button starts an action on the current page, such as submitting a form or opening a dialog. It renders a native button element with the Hawiyah visual families, three sizes and a loading state.

## Example

A page has one primary button for its main action. The label names the action as a verb.

```html live example=primary
<button class="hw-button" type="button" data-variant="primary" data-size="md">Continue</button>
```

```tsx live example=primary
<Button variant="primary">Continue</Button>
```

```vue live example=primary
<Button variant="primary">Continue</Button>
```

```ts live example=primary framework=angular
template: `<button hwButton variant="primary">Continue</button>`
```

## Variants and states

### Variants

The variant sets the visual family. Primary marks the main action, secondary and outline mark supporting actions, ghost marks a low-emphasis action, and danger marks an action that removes or discards data.

```html live example=variants
<div class="hw-inline">
  <button class="hw-button" type="button" data-variant="primary" data-size="md">Continue</button>
  <button class="hw-button" type="button" data-variant="secondary" data-size="md">Save draft</button>
  <button class="hw-button" type="button" data-variant="outline" data-size="md">Preview</button>
  <button class="hw-button" type="button" data-variant="ghost" data-size="md">Cancel</button>
  <button class="hw-button" type="button" data-variant="danger" data-size="md">Delete</button>
</div>
```

```tsx live example=variants
<div className="hw-inline">
  <Button variant="primary">Continue</Button>
  <Button variant="secondary">Save draft</Button>
  <Button variant="outline">Preview</Button>
  <Button variant="ghost">Cancel</Button>
  <Button variant="danger">Delete</Button>
</div>
```

```vue live example=variants
<div class="hw-inline">
  <Button variant="primary">Continue</Button>
  <Button variant="secondary">Save draft</Button>
  <Button variant="outline">Preview</Button>
  <Button variant="ghost">Cancel</Button>
  <Button variant="danger">Delete</Button>
</div>
```

```ts live example=variants framework=angular
template: `<div class="hw-inline">
  <button hwButton variant="primary">Continue</button>
  <button hwButton variant="secondary">Save draft</button>
  <button hwButton variant="outline">Preview</button>
  <button hwButton variant="ghost">Cancel</button>
  <button hwButton variant="danger">Delete</button>
</div>`
```

The packages also provide the default, light, outline-white, soft and link families. Light and outline-white are intended for a dark surface.

### Sizes

The size sets the height and the padding. Medium is the default.

```html live example=sizes
<div class="hw-inline">
  <button class="hw-button" type="button" data-variant="primary" data-size="sm">Small</button>
  <button class="hw-button" type="button" data-variant="primary" data-size="md">Medium</button>
  <button class="hw-button" type="button" data-variant="primary" data-size="lg">Large</button>
</div>
```

```tsx live example=sizes
<div className="hw-inline">
  <Button size="sm">Small</Button>
  <Button size="md">Medium</Button>
  <Button size="lg">Large</Button>
</div>
```

```vue live example=sizes
<div class="hw-inline">
  <Button size="sm">Small</Button>
  <Button size="md">Medium</Button>
  <Button size="lg">Large</Button>
</div>
```

```ts live example=sizes framework=angular
template: `<div class="hw-inline">
  <button hwButton size="sm">Small</button>
  <button hwButton size="md">Medium</button>
  <button hwButton size="lg">Large</button>
</div>`
```

### Loading

A loading button is natively disabled and carries `aria-busy="true"`. It keeps its label while the operation runs.

```html live example=loading
<button class="hw-button" type="button" data-variant="primary" data-size="md" disabled aria-busy="true">Submit request</button>
```

```tsx live example=loading
<Button loading>Submit request</Button>
```

```vue live example=loading
<Button loading>Submit request</Button>
```

```ts live example=loading framework=angular
template: `<button hwButton loading>Submit request</button>`
```

### Disabled

A disabled button leaves the tab order and ignores activation. State the reason for an unavailable action in the page text.

```html live example=disabled
<button class="hw-button" type="button" data-variant="primary" data-size="md" disabled>Continue</button>
```

```tsx live example=disabled
<Button disabled>Continue</Button>
```

```vue live example=disabled
<Button disabled>Continue</Button>
```

```ts live example=disabled framework=angular
template: `<button hwButton disabled>Continue</button>`
```

## API

### JavaScript

Table: Attributes of the hw-button element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-button'` | `true` | — |
| `type` | `'button' \| 'submit' \| 'reset'` | `true` | — |
| `data-variant` | `'primary' \| 'default' \| 'secondary' \| 'outline' \| 'outline-white' \| 'light' \| 'danger' \| 'ghost' \| 'soft' \| 'link'` | `false` | `'primary'` |
| `data-size` | `'sm' \| 'md' \| 'lg'` | `false` | `'md'` |
| `data-icon-only` | `boolean` | `false` | `false` |
| `disabled` | `boolean` | `false` | `false` |
| `aria-busy` | `'true'` | `false` | — |

Button has no JavaScript controller. The markup is the API: write a native button element with the class `hw-button`, and always write its `type`, because the browser default of a button in a form is `submit`. For the loading state, write `disabled` and `aria-busy="true"` together and remove both when the operation ends. `data-icon-only` is listed with `hw-button`, `data-variant` and `data-size` in the Actions row of the stable class and state API of `@hawiyah/styles`; it is written without a value.

### React

Table: Props of Button

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `variant` | `'primary' \| 'default' \| 'secondary' \| 'outline' \| 'outline-white' \| 'light' \| 'danger' \| 'ghost' \| 'soft' \| 'link'` | `false` | `'primary'` |
| `size` | `'sm' \| 'md' \| 'lg'` | `false` | `'md'` |
| `loading` | `boolean` | `false` | — |

Button also accepts the props of a native button element, including `type`, `disabled`, `onClick` and `ref`. The type is `button` unless another type is given. Loading disables the button and sets `aria-busy`.

### Vue

Table: Props, events and slots of Button

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `variant` | prop | `ButtonVariant` | `false` | `'primary'` |
| `size` | prop | `'sm' \| 'md' \| 'lg'` | `false` | `'md'` |
| `loading` | prop | `boolean` | `false` | `false` |
| `disabled` | prop | `boolean` | `false` | `false` |
| `type` | prop | `'button' \| 'submit' \| 'reset'` | `false` | `'button'` |

The default slot holds the label. Other attributes and listeners, such as `@click`, reach the native button element. The component exposes `element` and `focus()` through a template ref.

### Angular

Table: Inputs, outputs and content of button[hwButton]

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `variant` | input | `'primary' \| 'default' \| 'secondary' \| 'outline' \| 'outline-white' \| 'light' \| 'danger' \| 'ghost' \| 'soft' \| 'link'` | `false` | `'primary'` |
| `size` | input | `'sm' \| 'md' \| 'lg'` | `false` | `'md'` |
| `loading` | input | `boolean` | `false` | `false` |
| `disabled` | input | `boolean` | `false` | `false` |
| `type` | input | `string \| null` | `false` | `null` |

`HwButtonDirective` applies to `button[hwButton]` and `a[hwButton]`. A native button is `type="button"` unless a type is written. The inputs `type`, `disabled` and `loading` are written statically or bound, for example `[loading]="saving"`; binding `[attr.type]`, `[attr.disabled]` or `[attr.aria-busy]` on the element is not supported. On an anchor the directive writes no type and no disabled attribute.

## Accessibility

Button is a native button element, so the browser provides its role, its focus behaviour and its keyboard activation. Its accessible name is its visible label.

Table: Keyboard interaction of Button

| Key | Action |
| --- | --- |
| Tab | Moves focus to the button, unless it is disabled or loading. |
| Enter | Activates the button. |
| Space | Activates the button. |

- The focus indicator is visible on keyboard focus and remains visible while Space is held.
- A disabled or loading button leaves the tab order. After a loading state ends, return focus to the button or to the result of the operation.
- A button that shows only an icon needs an accessible name; use Icon button for that case.
- Use a link, not a button, to move to another page.

> [!NOTE]
> Light and outline-white reach a readable contrast only on a dark surface. They do not replace primary on a light page.

## RTL and localisation

Button has no built-in text: every label is written by the application in the language of the page. The element inherits the language and the direction of the page, and the packaged styles use logical properties, so the label and any icon follow the reading direction.

- Keep each label short; the button grows with its label and wraps inside a narrow container.
- Labels in Arabic and English use the same variant and size; no adapter changes its appearance by language.

## Platforms Code reference

Hawiyah is built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section lists the evidence recorded for Button and the items that remain open.

### Evidence

- The seven visual families of the supplied Platforms Code style sheet are mapped to the `primary`, `default`, `secondary`, `outline`, `outline-white`, `light` and `danger` variants, as recorded in the [button notes](../nic-buttons.md).
- Button is built in the vanilla, React, Vue and Angular adapters, as listed in [components.json](../../components.json).
- A behaviour test of the React adapter covers the activation of a button and the return of focus to it; it passed on 2026-10-28.

### Open items

- Only the React adapter is recorded as verified in `components.json`; the vanilla, Vue and Angular adapters have no recorded verification entry.
- The rendered heights of the small and large sizes are not claimed to match the source sizes exactly.
- Danger uses white text instead of the red text of the source, for readable contrast; this adaptation is documented in the button notes.
