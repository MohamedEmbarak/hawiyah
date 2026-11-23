# Popover

Popover shows a panel of supplementary content next to the button that opens it. The panel is a labelled region that the reader opens and closes; it is not a modal dialog and it does not trap focus.

## Example

The trigger is a button whose text names what it reveals. The panel has an accessible name that the application supplies, and its content is ordinary page content that is reached in the normal tab order.

```html live example=basic static differences=popover-adapter-markup
<div class="hw-popover" data-hw="popover">
  <button class="hw-button" type="button" data-variant="secondary" data-size="md" data-hw-trigger>Request details</button>
  <div class="hw-popover-panel" role="region" aria-label="Request details" data-hw-panel hidden>
    <p>The request was submitted and is waiting for review.</p>
  </div>
</div>
```

```tsx live example=basic
<Popover label="Request details" trigger={<Button variant="secondary">Request details</Button>}>
  <p>The request was submitted and is waiting for review.</p>
</Popover>
```

```vue live example=basic
<Popover label="Request details" trigger-label="Request details">
  <p>The request was submitted and is waiting for review.</p>
</Popover>
```

```ts live example=basic framework=angular
template: `<hw-popover label="Request details" triggerLabel="Request details">
  <p>The request was submitted and is waiting for review.</p>
</hw-popover>`
```

## Variants and states

### Open on first render

A popover starts open when the application asks for it. React and Vue take `defaultOpen` for an uncontrolled panel, and Angular takes `open`, where a value written once is the initial state. The reader can close it with the trigger, or with <kbd>Escape</kbd> when focus is inside the popover; a popover that is open on first render does not hold focus. In vanilla markup the panel has no `hidden` attribute, which is the open state, and the controller writes `aria-expanded` on the trigger itself; the example also writes `aria-expanded="true"`, so the markup is correct before the controller runs.

```html live example=open static differences=popover-adapter-markup
<div class="hw-popover" data-hw="popover">
  <button class="hw-button" type="button" data-variant="outline" data-size="md" data-hw-trigger aria-expanded="true">Processing time</button>
  <div class="hw-popover-panel" role="region" aria-label="Processing time" data-hw-panel>
    <p>A review usually takes five working days.</p>
  </div>
</div>
```

```tsx live example=open
<Popover label="Processing time" defaultOpen trigger={<Button variant="outline">Processing time</Button>}>
  <p>A review usually takes five working days.</p>
</Popover>
```

```vue live example=open
<Popover label="Processing time" trigger-label="Processing time" trigger-variant="outline" default-open>
  <p>A review usually takes five working days.</p>
</Popover>
```

```ts live example=open framework=angular
template: `<hw-popover label="Processing time" triggerLabel="Processing time" triggerVariant="outline" [open]="true">
  <p>A review usually takes five working days.</p>
</hw-popover>`
```

## API

### JavaScript

Table: Options of createPopover

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |
| `focusOnOpen` | `boolean` | `false` | — |

`createPopover(root, options)` enhances existing markup, and `enhance()` does the same for an element with `data-hw="popover"`. The root contains a trigger marked `data-hw-trigger` and a panel marked `data-hw-panel`; the controller throws when either is missing. The controller sets `aria-controls` and `aria-expanded` on the trigger, gives the panel `role="region"` when it has none, and shows or hides the panel with the `hidden` attribute, which is its initial state. Write an `aria-label` or an `aria-labelledby` on the panel to name it. An element inside the root with `data-hw-close` closes the popover and returns focus to the trigger. `focusOnOpen` moves focus into the panel when it opens, to the first focusable element or to the panel itself; the published code does not do it without the option. `onOpenChange` receives the new state, and the same change is dispatched as the `hw:change` event on the root with `{ open }`. The controller returns `open`, `show()`, `close(restore)` and `destroy()`. `close(true)` returns focus to the trigger, and `destroy()` returns focus to it when focus is inside the panel.

### React

Table: Props of Popover

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `trigger` | `ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>` | `true` | — |
| `open` | `boolean` | `false` | — |
| `defaultOpen` | `boolean` | `false` | `false` |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |
| `disabled` | `boolean` | `false` | `false` |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `label` | `string` | `false` | — |

`trigger` is the application's own button element; Popover adds `aria-expanded`, `aria-controls` and, while `disabled`, the `disabled` attribute, so a custom component used as the trigger must forward native button props and events. `label`, or `aria-label` or `aria-labelledby`, names the panel; `label` prints nothing, and a visible heading is written in the content and referenced with `aria-labelledby`. Use `open` with `onOpenChange` for a controlled popover, or `defaultOpen` for an uncontrolled one; content inside the panel closes the popover through the controlled `open`. `disabled` disables the trigger and closes the panel.

### Vue

Table: Props, events and slots of Popover

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `label` | prop | `string` | `false` | — |
| `triggerLabel` | prop | `string` | `false` | — |
| `triggerVariant` | prop | `'primary' \| 'default' \| 'secondary' \| 'outline' \| 'outline-white' \| 'light' \| 'danger' \| 'ghost' \| 'soft' \| 'link'` | `false` | `'secondary'` |
| `open` | prop | `boolean` | `false` | — |
| `defaultOpen` | prop | `boolean` | `false` | `false` |
| `disabled` | prop | `boolean` | `false` | `false` |
| `update:open` | event | `(value: boolean) => void` | `false` | — |
| `trigger` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |

`label` names the panel and prints nothing; `aria-label` and `aria-labelledby` written on the component are moved to the panel. `triggerLabel` is the text of the trigger button, which is a native `button` with the class `hw-button` and the variant `triggerVariant`, not the Button component; it is required unless the `trigger` slot gives the content of that button. The slot supplies the content of the trigger and not the trigger itself, so a button written in it ends up nested inside the packaged button. Use `open` with `update:open` for a controlled popover, or `defaultOpen` for an uncontrolled one; `update:open` fires when the state changes. `disabled` disables the trigger and closes an open panel. The default slot holds the content of the panel and receives `close`. The table lists the two slots because the published build reads them; the declaration types none.

### Angular

Table: Inputs, outputs and content of hw-popover

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `label` | input | `string` | `false` | `''` |
| `panelId` | input | `string` | `false` | — |
| `triggerLabel` | input | `string` | `true` | — |
| `triggerVariant` | input | `'link' \| 'primary' \| 'default' \| 'secondary' \| 'outline' \| 'outline-white' \| 'light' \| 'danger' \| 'ghost' \| 'soft'` | `false` | `'secondary'` |
| `disabled` | input | `boolean` | `false` | `false` |
| `open` | input | `boolean` | `false` | `false` |
| `openChange` | output | `boolean` | `false` | — |
| `*` | content | — | `false` | — |

`HwPopoverComponent` (`hw-popover`) renders its own trigger button, named by the required `triggerLabel` and styled by `triggerVariant`. The trigger is text only in 0.3.0: the application's own element cannot be projected as the trigger. `label` names the panel and prints nothing; it is required unless `aria-label` or `aria-labelledby` is written on `hw-popover`. A visible heading is written in the content and referenced with `aria-labelledby`. `panelId` sets the id of the panel; without it an id is generated, and no id is left on the wrapper. Bind `[(open)]` for a two-way state; a value written once is the initial state. The projected content is placed in the panel, and a control in it closes the popover through a template reference: with `#p` on `hw-popover`, the control calls `p.close(true)`, which returns focus to the trigger.

## Accessibility

The panel is an element with the region role whose accessible name comes from `label`, `aria-label` or `aria-labelledby`, and the trigger carries `aria-expanded` and `aria-controls`. A popover is a disclosure, not a focus trap: its content is reached with the ordinary tab order, and the page behind it stays available. Use Menu for a list of actions with menu keyboard behaviour, and a native dialog for content that must hold focus.

Table: Keyboard interaction of Popover

| Key | Action |
| --- | --- |
| <kbd>Enter</kbd>, <kbd>Space</kbd> | Opens or closes the panel from the trigger, which is a native button. |
| <kbd>Tab</kbd> | Moves focus through the controls of the open panel in the normal order, and closes the panel when focus moves to an element outside it. |
| <kbd>Escape</kbd> | Closes the panel and returns focus to the trigger. |

- An Escape that a control inside the panel has used for itself, and has cancelled, does not close the popover.
- A press outside the popover closes it and leaves focus where the reader put it. Focus moving to an element outside the popover closes it, and focus stays on that element.
- The panel is hidden with the `hidden` attribute while it is closed, so its content is not reachable.

## RTL and localisation

Popover prints no text of its own: the trigger text, the panel name and the content are written by the application in the language of the page. The packaged styles place the panel below the trigger and align its edge with the inline start of the trigger, so it follows the reading direction of a left-to-right page and of a right-to-left page.

- The panel name is not printed. A page that shows a visible heading in the panel writes the heading in the content and references it with `aria-labelledby`.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Popover; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The [coverage notes](../coverage.md) list Popover in the additional interaction group of the catalog, and state that no standalone web component library was supplied and that embedded template components do not establish complete coverage.
