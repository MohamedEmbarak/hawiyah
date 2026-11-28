# Menu

Menu is a button that opens a list of actions or links. The list uses menu keyboard behaviour: focus moves between the items with the arrow keys, and activating an item closes the menu and returns focus to the button.

## Example

The trigger names the group of actions, and the menu has its own accessible name. Each item is one action that the reader can start from this page.

```html live example=basic static differences=menu-adapter-markup
<div class="hw-menu" data-hw="menu">
  <button class="hw-button" type="button" data-variant="secondary" data-size="md" data-hw-trigger>Request actions</button>
  <div class="hw-menu-content" role="menu" aria-label="Request actions" data-hw-panel hidden>
    <button class="hw-menu-item" type="button" role="menuitem" data-hw-value="edit">Edit request</button>
    <button class="hw-menu-item" type="button" role="menuitem" data-hw-value="print">Print confirmation</button>
    <button class="hw-menu-item" type="button" role="menuitem" data-hw-value="withdraw">Withdraw request</button>
  </div>
</div>
```

```tsx live example=basic
<Menu
  label="Request actions"
  trigger={<Button variant="secondary">Request actions</Button>}
  items={[
    { value: 'edit', label: 'Edit request' },
    { value: 'print', label: 'Print confirmation' },
    { value: 'withdraw', label: 'Withdraw request' },
  ]}
/>
```

```vue live example=basic
<Menu
  label="Request actions"
  trigger-label="Request actions"
  :items="[
    { value: 'edit', label: 'Edit request' },
    { value: 'print', label: 'Print confirmation' },
    { value: 'withdraw', label: 'Withdraw request' },
  ]"
/>
```

```ts live example=basic framework=angular
template: `<hw-menu
  label="Request actions"
  triggerLabel="Request actions"
  [items]="[
    { value: 'edit', label: 'Edit request' },
    { value: 'print', label: 'Print confirmation' },
    { value: 'withdraw', label: 'Withdraw request' },
  ]"
/>`
```

## Variants and states

### Disabled items and links

An item with `disabled` stays in the menu but cannot be activated, and the arrow keys pass over it. An item with `href` renders as a link, so activating it navigates. The adapters render a disabled link item without `href` and with `aria-disabled="true"`; the example shows a disabled button item and an enabled link item.

```html live example=items static differences=menu-adapter-markup
<div class="hw-menu" data-hw="menu">
  <button class="hw-button" type="button" data-variant="outline" data-size="md" data-hw-trigger>Document actions</button>
  <div class="hw-menu-content" role="menu" aria-label="Document actions" data-hw-panel hidden>
    <button class="hw-menu-item" type="button" role="menuitem" data-hw-value="download">Download document</button>
    <button class="hw-menu-item" type="button" role="menuitem" data-hw-value="replace" disabled>Replace document</button>
    <a class="hw-menu-item" role="menuitem" href="/documents/history" data-hw-value="history">View history</a>
  </div>
</div>
```

```tsx live example=items
<Menu
  label="Document actions"
  trigger={<Button variant="outline">Document actions</Button>}
  items={[
    { value: 'download', label: 'Download document' },
    { value: 'replace', label: 'Replace document', disabled: true },
    { value: 'history', label: 'View history', href: '/documents/history' },
  ]}
/>
```

```vue live example=items
<Menu
  label="Document actions"
  trigger-label="Document actions"
  trigger-variant="outline"
  :items="[
    { value: 'download', label: 'Download document' },
    { value: 'replace', label: 'Replace document', disabled: true },
    { value: 'history', label: 'View history', href: '/documents/history' },
  ]"
/>
```

```ts live example=items framework=angular
template: `<hw-menu
  label="Document actions"
  triggerLabel="Document actions"
  triggerVariant="outline"
  [items]="[
    { value: 'download', label: 'Download document' },
    { value: 'replace', label: 'Replace document', disabled: true },
    { value: 'history', label: 'View history', href: '/documents/history' },
  ]"
/>`
```

## API

### JavaScript

Table: Options of createMenu

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `onAction` | `(value: string) => void` | `false` | — |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |

`createMenu(root, options)` enhances existing markup, and `enhance()` does the same for an element with `data-hw="menu"`. The root contains a trigger marked `data-hw-trigger` and a panel marked `data-hw-panel`, and the items are the elements of the panel with `role="menuitem"`. The controller sets `aria-haspopup` on the trigger and the menu role on the panel, gives each item a `tabindex` of -1 and moves the tab stop to the focused item. Write `data-hw-value` on an item for its value; otherwise the trimmed text of the item is the value. Name the panel with `aria-label` or `aria-labelledby`. Activating an enabled item gives the trigger focus, dispatches `hw:change` with `{ value }` and calls `onAction(value)`, and then closes the menu and calls `onOpenChange` with `false`. A dialog that the action opens therefore returns focus to the trigger when it closes, and an action that moves focus elsewhere keeps it there. An Escape that the application or a control inside the panel has cancelled leaves the menu open. The controller returns `open`, `show()`, `close(restore)` and `destroy()`.

### React

Table: Props of Menu

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `items` | `readonly MenuItem[]` | `true` | — |
| `trigger` | `ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>` | `true` | — |
| `open` | `boolean` | `false` | — |
| `defaultOpen` | `boolean` | `false` | `false` |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |
| `onAction` | `(value: string) => void` | `false` | — |
| `disabled` | `boolean` | `false` | `false` |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `label` | `string` | `false` | — |

`items` lists the entries. A `MenuItem` has a `value`, a renderable `label`, and optionally `disabled`, `href` and `onSelect`; an item with `href` renders as a link. `trigger` is the application's own button element, to which Menu adds `aria-haspopup`, `aria-expanded`, `aria-controls` and, while `disabled`, the `disabled` attribute, so a custom component used as the trigger must forward native button props and events. `label`, or `aria-label` or `aria-labelledby`, names the menu and is not printed on the trigger. `onAction` receives the value of the activated item. Use `open` with `onOpenChange` for a controlled menu, or `defaultOpen` for an uncontrolled one.

### Vue

Table: Props, events and slots of Menu

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `label` | prop | `string` | `false` | — |
| `triggerLabel` | prop | `string` | `false` | — |
| `triggerVariant` | prop | `'primary' \| 'default' \| 'secondary' \| 'outline' \| 'outline-white' \| 'light' \| 'danger' \| 'ghost' \| 'soft' \| 'link'` | `false` | `'secondary'` |
| `items` | prop | `readonly MenuItem[]` | `true` | — |
| `open` | prop | `boolean` | `false` | — |
| `defaultOpen` | prop | `boolean` | `false` | `false` |
| `disabled` | prop | `boolean` | `false` | `false` |
| `update:open` | event | `(value: boolean) => void` | `false` | — |
| `action` | event | `(value: string) => void` | `false` | — |
| `trigger` | slot | — | `false` | — |

`label` names the menu and is not printed on the trigger; `aria-label` and `aria-labelledby` can name it instead. `triggerLabel` is the text of the trigger button, which is a native `button` with the class `hw-button` and the variant `triggerVariant`, not the Button component; it is required unless the `trigger` slot gives the content of that button. The slot supplies the content of the trigger and not the trigger itself, so a button written in it ends up nested inside the packaged button. `items` lists the entries; a `MenuItem` has a `value`, a string `label`, and optionally `disabled` and `href`. `action` is emitted once for each activation with the value of the item, and then the menu closes and focuses the trigger; a link item then navigates. Use `open` with `update:open` for a controlled menu, or `defaultOpen` for an uncontrolled one. The table lists the `trigger` slot because the published build reads it; the declaration types no slot.

### Angular

Table: Inputs, outputs and content of hw-menu

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
| `items` | input | `readonly HwMenuItem[]` | `false` | `[]` |
| `openChange` | output | `boolean` | `false` | — |
| `action` | output | `string` | `false` | — |

`HwMenuComponent` (`hw-menu`) renders its own trigger button, named by the required `triggerLabel` and styled by `triggerVariant`; the trigger is text only in 0.3.0. `items` lists the entries; an `HwMenuItem` has a `value`, a string `label`, and optionally `disabled` and `href`. `label` names the menu and is not printed on the trigger; it can be replaced by `aria-label` or `aria-labelledby` written on `hw-menu`. `action` emits the value of the activated item once. `panelId` sets the id of the panel; without it an id is generated. Bind `open` and `openChange` for the state. When the application sets `open`, the first enabled item becomes the tab stop and takes focus after the render.

## Accessibility

The panel has the menu role and an accessible name, the trigger carries `aria-haspopup`, `aria-expanded` and `aria-controls`, and each item has the menuitem role. Use Menu for commands and navigation; for panels of ordinary content with interactive children, use [Popover](popover.md). Menu is a single level: it has no nested menus.

Table: Keyboard interaction of Menu

| Key | Action |
| --- | --- |
| <kbd>Enter</kbd>, <kbd>Space</kbd> | On the trigger, opens the menu and focuses the first enabled item; on an item, activates it, closes the menu and returns focus to the trigger; on a link item, <kbd>Space</kbd> activates it in vanilla and Angular only, because the React and Vue items leave the key to the native link, which ignores it. |
| <kbd>Down Arrow</kbd>, <kbd>Up Arrow</kbd> | On the trigger, opens the menu on the first or the last enabled item; in the menu, moves focus to the next or the previous enabled item. |
| <kbd>Home</kbd>, <kbd>End</kbd> | Moves focus to the first or the last enabled item. |
| <kbd>Escape</kbd> | Closes the menu and returns focus to the trigger. |
| <kbd>Tab</kbd> | Closes the menu without returning focus to the trigger, and focus moves on in the normal tab order. |

- Typing a letter moves focus to the next enabled item whose text starts with it. Letters typed within 500 ms form a prefix, and a repeated letter cycles through the items that start with it. A key that matches no item keeps its default action.
- A press outside the menu, and focus moving to an element outside it, close it without moving focus.
- A disabled item is skipped by the arrow keys, by Home and End, and by the typed letters.
- In vanilla and Angular the trigger has focus when the action runs, so a dialog that the action opens returns focus to the trigger. In React and Vue the activated item still has focus when the action runs, and the menu returns focus to the trigger after it.

## RTL and localisation

Menu prints no text of its own: the trigger text, the menu name and the item labels are written by the application in the language of the page. The panel is placed with logical properties and its items follow the reading direction. The arrow keys of the menu move along the block axis, so Down Arrow and Up Arrow keep their meaning in a left-to-right and in a right-to-left page.

- Type-ahead compares the typed letters with the text of the items, so it follows the language of the labels.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Menu; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The [coverage notes](../coverage.md) list Menu in the additional interaction group of the catalog and classify it as an interactive component, for which Hawiyah implements additional state, keyboard behaviour or lifecycle, where a native component leaves the main interaction to the browser.
