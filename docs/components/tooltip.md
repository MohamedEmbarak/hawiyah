# Tooltip

Tooltip shows a short description of a control when the reader hovers over it or moves focus to it. The text is descriptive only and must not hold a control or the only copy of an instruction.

## Example

A tooltip supplements the name of a control; it does not replace it. The trigger is a focusable element with its own accessible name, and the tooltip text adds a short explanation of it. This example places the tooltip below the trigger and centres it; without `placement` and `align`, the React, Vue and Angular components place it above the trigger, aligned to its start.

```html live example=basic static differences=tooltip-adapter-markup
<span data-hw="tooltip">
  <button class="hw-button" type="button" data-variant="secondary" data-size="md" data-hw-tooltip-trigger>Reference number</button>
  <span class="hw-tooltip" role="tooltip" id="basic-tooltip" data-placement="bottom" data-align="center" hidden>The number printed on the confirmation of your request.</span>
</span>
```

```tsx live example=basic
<Tooltip content="The number printed on the confirmation of your request." placement="bottom" align="center">
  <Button variant="secondary">Reference number</Button>
</Tooltip>
```

```vue live example=basic
<Tooltip content="The number printed on the confirmation of your request." placement="bottom" align="center">
  <Button variant="secondary">Reference number</Button>
</Tooltip>
```

```ts live example=basic framework=angular
template: `<hw-tooltip text="The number printed on the confirmation of your request." placement="bottom" align="center">
  <button hwButton hwTooltipTrigger variant="secondary">Reference number</button>
</hw-tooltip>`
```

## Variants and states

### Placement and alignment

`placement` sets the side of the trigger on which the tooltip appears, and `align` sets its alignment along that side. Both use logical values, so `start` and `end` follow the reading direction. The tooltip is not repositioned when it does not fit, so choose a side that has room.

```html live example=placement static differences=tooltip-adapter-markup
<span data-hw="tooltip">
  <button class="hw-button" type="button" data-variant="outline" data-size="md" data-hw-tooltip-trigger>Submission date</button>
  <span class="hw-tooltip" role="tooltip" id="placement-tooltip" data-placement="end" data-align="center" hidden>The date on which the request was received.</span>
</span>
```

```tsx live example=placement
<Tooltip content="The date on which the request was received." placement="end" align="center">
  <Button variant="outline">Submission date</Button>
</Tooltip>
```

```vue live example=placement
<Tooltip content="The date on which the request was received." placement="end" align="center">
  <Button variant="outline">Submission date</Button>
</Tooltip>
```

```ts live example=placement framework=angular
template: `<hw-tooltip text="The date on which the request was received." placement="end" align="center">
  <button hwButton hwTooltipTrigger variant="outline">Submission date</button>
</hw-tooltip>`
```

## API

### JavaScript

Table: Options of createTooltip

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `hideDelay` | `number` | `false` | — |
| `placement` | `'top' \| 'bottom' \| 'start' \| 'end'` | `false` | — |
| `align` | `'start' \| 'center' \| 'end'` | `false` | — |

`createTooltip(root, options)` enhances existing markup, and `enhance()` does the same for an element with `data-hw="tooltip"`. The root contains an element with the attribute `data-hw-tooltip-trigger`, which should be focusable, and an element whose role is tooltip; the controller throws when either is missing. Write the class `hw-tooltip` on the tooltip element, because the styles select it. The controller adds the id of the tooltip to the `aria-describedby` of the trigger, keeps ids already there, and hides the tooltip. `placement` and `align` are written to `data-placement` and `data-align` of the tooltip element, which can also carry them in markup. `hideDelay` is the time in milliseconds between the pointer leaving the trigger or the tooltip and the hiding; the published code waits 80 ms without it. The controller returns `show()`, `hide()` and `destroy()`, which restores the attributes it changed. `show()` does nothing while the trigger is disabled.

### React

Table: Props of Tooltip

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `children` | `ReactElement<HTMLAttributes<HTMLElement>>` | `true` | — |
| `content` | `string` | `true` | — |
| `placement` | `'top' \| 'bottom' \| 'start' \| 'end'` | `false` | `'top'` |
| `align` | `'start' \| 'center' \| 'end'` | `false` | `'start'` |

`children` is one focusable React element, the trigger; Tooltip merges the id of the tooltip into its `aria-describedby`, so a custom component used as the trigger must forward `aria-describedby`. `content` is plain text. Tooltip renders a wrapper element around the trigger and the tooltip, and other props reach the wrapper.

### Vue

Table: Props, events and slots of Tooltip

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `content` | prop | `string` | `true` | — |
| `placement` | prop | `'top' \| 'bottom' \| 'start' \| 'end'` | `false` | `'top'` |
| `align` | prop | `'start' \| 'center' \| 'end'` | `false` | `'start'` |
| `default` | slot | — | `false` | — |

`content` is plain text. The default slot holds one focusable trigger, and the id of the tooltip is merged with the description ids of the trigger. The table lists the `default` slot because the published build reads it; the declaration types no slot.

### Angular

Table: Inputs, outputs and content of hw-tooltip and [hwTooltipTrigger]

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `placement` | input | `'top' \| 'bottom' \| 'start' \| 'end'` | `false` | `'top'` |
| `align` | input | `'start' \| 'center' \| 'end'` | `false` | `'start'` |
| `text` | input | `string` | `true` | — |
| `tooltipId` | input | `string` | `false` | — |
| `*` | content | — | `false` | — |
| `[hwTooltipTrigger] aria-describedby` | input | `string \| null` | `false` | `null` |

`HwTooltipComponent` (`hw-tooltip`) takes the required `text`. Its host is the positioned wrapper and renders no focusable element of its own. It wraps exactly one focusable element marked `hwTooltipTrigger`: a button, a link, or text that takes focus through a `tabindex` attribute. Without a marked trigger nothing is described, and `hwTooltipTrigger` on a Hawiyah wrapper component such as `hw-text-field` is not supported in 0.3.0; mark a native element. The trigger gets the class `hw-tooltip-trigger` and an `aria-describedby` that lists its own ids first and then the tooltip id. `tooltipId` sets the id of the tooltip element; without it an id is generated, and no id is left on the wrapper. The directive `HwTooltipTriggerDirective` (`[hwTooltipTrigger]`) takes `aria-describedby` for the ids the trigger already references.

## Accessibility

The trigger keeps its own role and accessible name, and the tooltip is an element with the tooltip role that the trigger references through `aria-describedby`, so assistive technology reads the text as a description. Keep the text short and descriptive. A tooltip must not contain a link, a button or any other control, and it must not hold information that a reader needs to complete a task: essential instructions belong in a visible label or hint.

Table: Keyboard interaction of Tooltip

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves focus to the trigger and shows the tooltip, and hides it when focus leaves the trigger. |
| <kbd>Escape</kbd> | Hides the tooltip and leaves focus on the trigger. |

- The tooltip opens on focus as well as on hover, so a keyboard reader receives the same description as a pointer reader.
- The tooltip stays open while the pointer moves from the trigger onto the tooltip, and it hides after the pointer leaves both.
- Place the tooltip inside a native dialog when its trigger is inside one, so it stays in the top layer of the dialog.

## RTL and localisation

Tooltip has no built-in text: the tooltip text is written by the application in the language of the page. `placement` and `align` take logical values, so `start` and `end` follow the reading direction of the nearest element with a direction, and the logical side stays the same in a left-to-right and in a right-to-left page, while the physical side changes with the direction.

- For `top` and `bottom`, `align` follows the inline axis; for `start` and `end`, it follows the block axis.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Tooltip; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The placement and alignment options, the surface properties decoded from the supplied mobile components and the limits of the comparison are in the [tooltip notes](../tooltip-placement.md); the notes state that automatic repositioning is not implemented and that the comparison does not cover every tooltip variant.
