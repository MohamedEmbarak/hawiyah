# Chip

Chip shows a short piece of labelled content, such as a status or an applied filter, in a compact rounded element. It may carry a remove button, and the application decides what removing a chip does.

## Example

A chip with a remove button shows an applied filter, for example on a list of service requests. The remove button has its own accessible name that says which filter it removes. The chip does not remove itself: the application handles the request and updates its own list. The remove handler in the examples is a placeholder that does nothing; the application writes the handler that removes the chip.

```html live example=basic differences=chip-adapter-tone
<span class="hw-chip">Status: Open<button type="button" aria-label="Remove filter Status: Open"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button></span>
```

```tsx live example=basic
<Chip removeLabel="Remove filter Status: Open" onRemove={() => undefined}>Status: Open</Chip>
```

```vue live example=basic
<Chip label="Status: Open" remove-label="Remove filter Status: Open" @remove="() => undefined" />
```

```ts live example=basic framework=angular
template: `<hw-chip removeLabel="Remove filter Status: Open" (removed)="null">Status: Open</hw-chip>`
```

## Variants and states

### Tone

`tone` selects the colour family of the chip: `neutral`, `success`, `warning`, `danger` or `info`. A tone is not the only carrier of meaning, so the text of the chip states the status as well.

```html live example=tone
<span class="hw-chip" data-tone="warning">Awaiting documents</span>
```

```tsx live example=tone
<Chip tone="warning">Awaiting documents</Chip>
```

```vue live example=tone
<Chip tone="warning" label="Awaiting documents" />
```

```ts live example=tone framework=angular
template: `<hw-chip tone="warning">Awaiting documents</hw-chip>`
```

### Variant and size

`variant="outline"` draws the chip with a border in the colour of its tone and no fill. `size` takes `sm` or `lg`; without it the chip has the default size. React, Vue and Angular also accept `variant="soft"`, which the stylesheet does not select, so a soft chip looks like a chip without a variant.

```html live example=sizes
<span class="hw-chip" data-tone="info" data-variant="outline" data-size="lg">Submitted</span>
```

```tsx live example=sizes
<Chip tone="info" variant="outline" size="lg">Submitted</Chip>
```

```vue live example=sizes
<Chip tone="info" variant="outline" size="lg" label="Submitted" />
```

```ts live example=sizes framework=angular
template: `<hw-chip tone="info" variant="outline" size="lg">Submitted</hw-chip>`
```

### Disabled

`disabled` disables the remove button of a chip that has one. The text of the chip stays readable.

```html live example=disabled differences=chip-adapter-tone
<span class="hw-chip">Category: Documents<button type="button" disabled aria-label="Remove filter Category: Documents"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button></span>
```

```tsx live example=disabled
<Chip disabled removeLabel="Remove filter Category: Documents" onRemove={() => undefined}>Category: Documents</Chip>
```

```vue live example=disabled
<Chip disabled label="Category: Documents" remove-label="Remove filter Category: Documents" @remove="() => undefined" />
```

```ts live example=disabled framework=angular
template: `<hw-chip [disabled]="true" removeLabel="Remove filter Category: Documents" (removed)="null">Category: Documents</hw-chip>`
```

## API

### JavaScript

Table: Attributes of the hw-chip element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-chip'` | `true` | — |
| `data-tone` | `'danger' \| 'info' \| 'success' \| 'warning'` | `false` | — |
| `data-variant` | `'outline'` | `false` | — |
| `data-size` | `'lg' \| 'sm'` | `false` | — |

Chip has no JavaScript controller. The markup is the API: write a `span` with the class `hw-chip` and its text. `data-tone` selects the tone, and the neutral tone is the one written without it: the stylesheet selects `data-tone` only for `success`, `warning`, `danger` and `info`. React, Vue and Angular always write `data-tone` (`neutral` by default), so their result carries an attribute that the markup of this page leaves out. `data-variant="outline"` selects the outline appearance and `data-size` takes `sm` or `lg`. A remove control is a plain `button` with `type="button"` and an `aria-label`, holding a `span` with the class `hw-icon` and `data-icon="cancel-01"`, placed inside the chip; it does not take the class `hw-button`. The application removes the chip itself. Before it removes a chip whose button has focus, it calls `prepareRemovalFocus` of `@hawiyah/core` with four arguments: the container of the chips, the remove button that was activated, and an options object that holds the selector of the chip, the selector of its remove button and, optionally, an element that receives focus when no other chip has an available button, which is how the call itself places focus after the last chip. The application runs the function that the call returns after the removal. Focus then moves to the remove button of the next chip, otherwise of the previous one. Without that element, the application places focus when the last chip is removed.

### React

Table: Props of Chip

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `disabled` | `boolean` | `false` | — |
| `tone` | `'neutral' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `false` | `'neutral'` |
| `variant` | `'soft' \| 'outline'` | `false` | — |
| `size` | `'sm' \| 'lg'` | `false` | — |
| `onRemove` | `() => void` | `false` | — |
| `removeLabel` | `string` | `false` | — |

The children of Chip are its content, and the other props reach the `span`. `onRemove` renders the remove button; without it the chip has none. While `onRemove` is given, `removeLabel` is required, and it names the remove button. The chip does not remove itself: `onRemove` asks the application to remove it. `disabled` disables the remove button. When a chip is removed while its button has focus, Chip moves focus to the remove button of the next chip, otherwise of the previous one, so the chips must be siblings in one parent. When the last chip goes, the application places focus. `tone` is `neutral` unless given, and `variant` and `size` write nothing unless given.

### Vue

Table: Props, events and slots of Chip

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `label` | prop | `string` | `false` | — |
| `disabled` | prop | `boolean` | `false` | `false` |
| `removeLabel` | prop | `string` | `false` | — |
| `tone` | prop | `'neutral' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `false` | `'neutral'` |
| `variant` | prop | `'soft' \| 'outline'` | `false` | — |
| `size` | prop | `'sm' \| 'lg'` | `false` | — |
| `onRemove` | prop | `(() => void) \| (() => void)[]` | `false` | — |
| `default` | slot | — | `false` | — |

The text of the chip is `label` or the `default` slot. A listener bound to `onRemove` (written @remove in a template) renders the remove button, which has no `hw-button` class and which `removeLabel` (written remove-label in a template) names; the label is required while a handler is bound. The chip does not remove itself: the handler asks the application to remove it. `disabled` disables the remove button. When the application removes a chip whose button had focus, focus moves to the remove button of the next chip, otherwise of the previous one; when the last chip goes, the application places focus. The declaration of the package types `onRemove` as a prop. The table lists the `default` slot because the published build reads it; the declaration types no slot.

### Angular

Table: Inputs, outputs and content of hw-chip

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `tone` | input | `'neutral' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `false` | `'neutral'` |
| `variant` | input | `'soft' \| 'outline'` | `false` | — |
| `size` | input | `'sm' \| 'lg'` | `false` | — |
| `disabled` | input | `boolean` | `false` | `false` |
| `removeLabel` | input | `string` | `false` | `''` |
| `removed` | output | `void` | `false` | — |
| `*` | content | — | `false` | — |

`HwChipComponent` (`hw-chip`) is the chip itself: its host element carries the class `hw-chip`, and the content of the element is the text of the chip. While a `(removed)` listener is bound, the chip ends with a plain remove button that holds the packaged cancel icon and is named by `removeLabel`, which is required then and not otherwise. `disabled` disables the remove button. `(removed)` has no payload and asks the application to remove the chip. A chip removed while its button had focus hands focus to the remove button of the next chip beside it, otherwise of the previous one; when the last chip goes, the application places focus, for example on the control that adds chips.

## Accessibility

A chip is text in a `span` (in Angular, the `hw-chip` element): it has no role of its own and is not focusable. The remove button is a native `button` with `type="button"`, so it is reached with <kbd>Tab</kbd> and activated with <kbd>Enter</kbd> or <kbd>Space</kbd>, and its accessible name is the `aria-label` that `removeLabel` writes.

- Write a name that says what is removed, such as "Remove filter Status: Open". A bare "Remove" does not tell a reader of assistive technology which chip the button belongs to.
- The icon inside the remove button is hidden from assistive technology, and the button is named by its label alone.
- The tone changes colour only. Write the meaning in the text, so that a reader who does not perceive the colour receives it as well.
- Removing a focused chip moves focus to the remove button of the neighbouring chip, so a keyboard user does not lose their place. React, Vue and Angular do this for chips that are siblings in one parent; with the vanilla markup the application calls `prepareRemovalFocus`. When no chip is left, the application places focus on a control of its own choice.
- A disabled remove button is not focusable and is not activated.

## RTL and localisation

Chip has no built-in text. The content of the chip and the remove label are written by the application in the language of the page, and a chip with a remove button needs a translated `removeLabel` as well. The chip inherits the language and the direction of the page, and the remove button follows the text in the order of the markup, so it stands at the end of the text, on the left in a right-to-left page.

- A chip placed in a line of chips wraps with the other inline content and follows the reading direction.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Chip; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The [coverage notes](../coverage.md) list Chip in the catalog group Additional content.
