# Drawer

Drawer is a modal panel built on the native `dialog` element. It opens at the end, the start or the bottom of the page, and the application opens and closes it explicitly.

## Example

A drawer holds supporting content that belongs to the current page, such as the details of one item, without leaving the page. The trigger opens it, the title names the content, and the close button has an accessible name that the application writes. Without a side, the drawer opens at the end of the page: the right edge in a left-to-right page and the left edge in a right-to-left page.

```html live example=basic static differences=drawer-adapter-markup
<button class="hw-button" type="button" data-variant="secondary" data-size="md" data-hw-dialog-open="basic-drawer">Request details</button>
<dialog class="hw-dialog hw-drawer" id="basic-drawer" data-hw="drawer" data-side="end" aria-labelledby="basic-drawer-title">
  <header class="hw-dialog-header">
    <h2 id="basic-drawer-title">Request details</h2>
    <button class="hw-button" type="button" data-variant="ghost" data-size="md" aria-label="Close" data-hw-dialog-close><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>
  </header>
  <div class="hw-dialog-body">
    <p>Your request was received and is waiting for review.</p>
  </div>
  <footer class="hw-dialog-footer">
    <button class="hw-button" type="button" data-variant="primary" data-size="md" data-hw-dialog-close>Done</button>
  </footer>
</dialog>
```

```tsx live example=basic
<Drawer
  title="Request details"
  closeLabel="Close"
  trigger={<Button variant="secondary">Request details</Button>}
  footer={({ close }) => <Button variant="primary" onClick={close}>Done</Button>}
>
  <p>Your request was received and is waiting for review.</p>
</Drawer>
```

```vue live example=basic
<Drawer title="Request details" close-label="Close">
  <template #trigger="{ open }"><Button variant="secondary" @click="open">Request details</Button></template>
  <p>Your request was received and is waiting for review.</p>
  <template #footer="{ close }"><Button variant="primary" @click="close">Done</Button></template>
</Drawer>
```

```ts live example=basic framework=angular
template: `<button hwButton variant="secondary" (click)="details.show()">Request details</button>
<hw-drawer #details title="Request details" closeLabel="Close">
  <p>Your request was received and is waiting for review.</p>
  <button hwButton hwDrawerFooter variant="primary" (click)="details.close()">Done</button>
</hw-drawer>`
```

## Variants and states

### Start side

`side="start"` opens the drawer at the start of the page, which is the left edge in a left-to-right page and the right edge in a right-to-left page. Use it for content that the reader treats as a menu or a filter for the page.

```html live example=start static differences=drawer-adapter-markup
<button class="hw-button" type="button" data-variant="secondary" data-size="md" data-hw-dialog-open="start-drawer">Filter requests</button>
<dialog class="hw-dialog hw-drawer" id="start-drawer" data-hw="drawer" data-side="start" aria-labelledby="start-drawer-title">
  <header class="hw-dialog-header">
    <h2 id="start-drawer-title">Filter requests</h2>
    <button class="hw-button" type="button" data-variant="ghost" data-size="md" aria-label="Close" data-hw-dialog-close><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>
  </header>
  <div class="hw-dialog-body">
    <p>Choose the status of the requests to show.</p>
  </div>
</dialog>
```

```tsx live example=start
<Drawer
  side="start"
  title="Filter requests"
  closeLabel="Close"
  trigger={<Button variant="secondary">Filter requests</Button>}
>
  <p>Choose the status of the requests to show.</p>
</Drawer>
```

```vue live example=start
<Drawer side="start" title="Filter requests" close-label="Close">
  <template #trigger="{ open }"><Button variant="secondary" @click="open">Filter requests</Button></template>
  <p>Choose the status of the requests to show.</p>
</Drawer>
```

```ts live example=start framework=angular
template: `<button hwButton variant="secondary" (click)="filter.show()">Filter requests</button>
<hw-drawer #filter side="start" title="Filter requests" closeLabel="Close">
  <p>Choose the status of the requests to show.</p>
</hw-drawer>`
```

### Bottom side

`side="bottom"` opens the drawer along the bottom edge and across the full width of the page. Use it on a narrow screen, where a panel at the side would leave too little room for the page.

```html live example=bottom static differences=drawer-adapter-markup
<button class="hw-button" type="button" data-variant="secondary" data-size="md" data-hw-dialog-open="bottom-drawer">Request history</button>
<dialog class="hw-dialog hw-drawer" id="bottom-drawer" data-hw="drawer" data-side="bottom" aria-labelledby="bottom-drawer-title">
  <header class="hw-dialog-header">
    <h2 id="bottom-drawer-title">Request history</h2>
    <button class="hw-button" type="button" data-variant="ghost" data-size="md" aria-label="Close" data-hw-dialog-close><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>
  </header>
  <div class="hw-dialog-body">
    <p>The history lists each change to your request in the order it was made.</p>
  </div>
</dialog>
```

```tsx live example=bottom
<Drawer
  side="bottom"
  title="Request history"
  closeLabel="Close"
  trigger={<Button variant="secondary">Request history</Button>}
>
  <p>The history lists each change to your request in the order it was made.</p>
</Drawer>
```

```vue live example=bottom
<Drawer side="bottom" title="Request history" close-label="Close">
  <template #trigger="{ open }"><Button variant="secondary" @click="open">Request history</Button></template>
  <p>The history lists each change to your request in the order it was made.</p>
</Drawer>
```

```ts live example=bottom framework=angular
template: `<button hwButton variant="secondary" (click)="history.show()">Request history</button>
<hw-drawer #history side="bottom" title="Request history" closeLabel="Close">
  <p>The history lists each change to your request in the order it was made.</p>
</hw-drawer>`
```

## API

### JavaScript

Table: Options of createDrawer

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `closeOnBackdrop` | `boolean` | `false` | — |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |

`createDrawer(dialog, options)` takes the same options and returns the same controller as `createDialog` of the [Dialog page](dialog.md): `open`, `show(trigger?)`, `close(returnValue?)` and `destroy()`. It requires a native `dialog` element. The markup is the API: a `dialog` with the classes `hw-dialog` and `hw-drawer`, a `header` with the class `hw-dialog-header` that holds the heading and a close button, a `div` with the class `hw-dialog-body` and, optionally, a `footer` with the class `hw-dialog-footer`. `enhance()` creates the controller for an element with `data-hw="drawer"`. A button with `data-hw-dialog-open` whose value is the `id` of the drawer opens it, and an element inside the drawer with `data-hw-dialog-close` closes it. `data-side` on the drawer is `start`, `end` or `bottom`; the stylesheet gives `start` and `bottom` their own placement, and without them the drawer is at the end. Closing by a click on the backdrop is on unless `closeOnBackdrop` is `false`. `onOpenChange` receives the new state, and the same state is dispatched as an `hw:change` event with `{ open }` in its detail.

### React

Table: Props of Drawer

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `side` | `'start' \| 'end' \| 'bottom'` | `false` | `'end'` |
| `open` | `boolean` | `false` | — |
| `defaultOpen` | `boolean` | `false` | — |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |
| `title` | `ReactNode` | `true` | — |
| `description` | `ReactNode` | `false` | — |
| `trigger` | `ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>` | `false` | — |
| `children` | `ReactNode \| ((context: { close: () => void }) => ReactNode)` | `false` | — |
| `footer` | `ReactNode \| ((context: { close: () => void }) => ReactNode)` | `false` | — |
| `closeOnBackdrop` | `boolean` | `false` | — |
| `closeLabel` | `string` | `true` | — |

`Drawer` takes the props of `Dialog` and adds `side`, which writes the `data-side` attribute of the drawer. `title` and `closeLabel` are required: the title is the heading that names the drawer, and `closeLabel` is the accessible name of the close button. `trigger` is one button-like element that opens the drawer. Use `open` with `onOpenChange` for a controlled drawer. `children` and `footer` take content or a function that receives a context object whose close function closes the drawer. The `closeOnBackdrop` and `defaultOpen` rows have no default in this table because `Drawer` passes them to `Dialog`; the [Dialog page](dialog.md) states their behaviour.

### Vue

Table: Props, events and slots of Drawer

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `open` | prop | `boolean` | `false` | — |
| `defaultOpen` | prop | `boolean` | `false` | `false` |
| `title` | prop | `string` | `true` | — |
| `description` | prop | `string` | `false` | — |
| `closeLabel` | prop | `string` | `true` | — |
| `side` | prop | `'start' \| 'end' \| 'bottom'` | `false` | `'end'` |
| `closeOnBackdrop` | prop | `boolean` | `false` | `true` |
| `update:open` | event | `(value: boolean) => void` | `false` | — |
| `trigger` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |
| `footer` | slot | — | `false` | — |

The props of `Dialog` apply, with `side` added. Bind the open state with v-model on `open`, and `defaultOpen` starts an uncontrolled drawer open. `title` and `closeLabel` are required strings. The `trigger` slot receives `{ open }`, a function that opens the drawer; write the button and call it from the click handler. The default and `footer` slots receive `{ close }`, and the footer region is rendered only when the `footer` slot is given. The table lists the slots the published build reads; the declaration types none of them.

### Angular

Table: Inputs, outputs and content of hw-drawer

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `title` | input | `string` | `true` | — |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `titleId` | input | `string` | `false` | — |
| `open` | input | `boolean` | `false` | `false` |
| `closeLabel` | input | `string` | `true` | — |
| `closeOnBackdrop` | input | `boolean` | `false` | `true` |
| `side` | input | `'start' \| 'end' \| 'bottom'` | `false` | `'end'` |
| `openChange` | output | `boolean` | `false` | — |
| `cancelled` | output | `void` | `false` | — |
| `returnValue` | output | `string` | `false` | — |
| `*` | content | — | `false` | — |
| `[hwDrawerFooter]` | content | — | `false` | — |

`HwDrawerComponent` applies to `hw-drawer` and takes the inputs, outputs and methods of `hw-dialog` with `side` added. `title` and `closeLabel` are required. Bind `[(open)]` for the open state, or call the show and close methods of the component through a template reference variable, as the example does. `aria-label`, `aria-labelledby` and `aria-describedby` written on `hw-drawer` are inputs that the component forwards to the native `dialog`; `aria-labelledby` replaces the title as the name. Content marked `hwDrawerFooter` goes into the footer, and other content into the body. The footer region is always rendered and the stylesheet hides it while nothing is projected.

## Accessibility

Drawer renders a native `dialog` element and opens it as a modal, with the same native modal and focus behaviour as Dialog: focus stays inside the drawer while it is open, and the page behind it is inert. The drawer takes its accessible name from its heading. In React, Vue and Angular the drawer always carries `aria-labelledby`, which takes precedence over `aria-label`, so only an `aria-labelledby` written by the application replaces the heading as the name.

- Closing the drawer returns focus to the element that opened it, when that element is still connected to the page.
- The close button has an icon and no text, so its accessible name comes from the application: `closeLabel` in React, Vue and Angular, and an `aria-label` in the vanilla markup.
- Initial focus belongs on a suitable element inside the drawer; write the native autofocus attribute on it. The vanilla, Vue and Angular drawers focus the marked element; in React, `autoFocus` on a child renders no autofocus attribute, so focus lands on the close button.
- The stylesheet removes the opening animation of the drawer when the reader asks for reduced motion.
- A drawer is modal. Use it for content that the reader needs while the page waits, and do not use it for a navigation list that stays open next to the page; the sidebar of the library is a separate component.

Table: Keyboard interaction of Drawer

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd> + <kbd>Tab</kbd> | Moves focus to the next or the previous focusable element inside the open drawer, and keeps it inside the drawer. |
| <kbd>Escape</kbd> | Requests closing the drawer, and focus returns to the element that opened it. |
| <kbd>Enter</kbd>, <kbd>Space</kbd> | Activates the focused native button, such as the trigger or the close button. |

## RTL and localisation

Drawer has no built-in text. The title, the description, the footer actions and the accessible name of the close button are written by the application in the language of the page. The sides are logical: `start` and `end` follow the direction of the page, so a drawer with `side="end"` opens at the right edge of a left-to-right page and at the left edge of a right-to-left page, and `bottom` does not change with the direction.

- Write `closeLabel` in the language of the drawer; it is the only name that a reader of an assistive technology hears for the close button.
- Choose the side by its meaning, not by the physical edge, so that the drawer stands at the same side of the reading order in both languages.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Drawer; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- Drawer is listed among the additional interaction components of the component scope in the [coverage notes](../coverage.md). It is built on the native `dialog` element.
- The [modal interaction follow-up](../dga-audit-followup.md) records the rule that a backdrop gesture on a drawer or a dialog must begin and end outside the panel.
