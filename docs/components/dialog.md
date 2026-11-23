# Dialog

Dialog is a modal window built on the native `dialog` element. It shows a title, a body and an optional footer above the page, and the application opens and closes it explicitly.

## Example

A dialog asks the reader to review or confirm one thing before continuing. The trigger opens it, the title names the task, and the close button has an accessible name that the application writes. Choose a short title and keep the body to the information the decision needs.

```html live example=basic static differences=dialog-adapter-markup
<button class="hw-button" type="button" data-variant="primary" data-size="md" data-hw-dialog-open="basic-dialog">Review request</button>
<dialog class="hw-dialog" id="basic-dialog" data-hw="dialog" aria-labelledby="basic-dialog-title">
  <header class="hw-dialog-header">
    <h2 id="basic-dialog-title">Review request</h2>
    <button class="hw-button" type="button" data-variant="ghost" data-size="md" aria-label="Close" data-hw-dialog-close><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>
  </header>
  <div class="hw-dialog-body">
    <p>Check the details of your request before you submit it.</p>
  </div>
  <footer class="hw-dialog-footer">
    <button class="hw-button" type="button" data-variant="primary" data-size="md" data-hw-dialog-close>Submit request</button>
  </footer>
</dialog>
```

```tsx live example=basic
<Dialog
  title="Review request"
  closeLabel="Close"
  trigger={<Button variant="primary">Review request</Button>}
  footer={({ close }) => <Button variant="primary" onClick={close}>Submit request</Button>}
>
  <p>Check the details of your request before you submit it.</p>
</Dialog>
```

```vue live example=basic
<Dialog title="Review request" close-label="Close">
  <template #trigger="{ open }"><Button variant="primary" @click="open">Review request</Button></template>
  <p>Check the details of your request before you submit it.</p>
  <template #footer="{ close }"><Button variant="primary" @click="close">Submit request</Button></template>
</Dialog>
```

```ts live example=basic framework=angular
template: `<button hwButton variant="primary" (click)="review.show()">Review request</button>
<hw-dialog #review title="Review request" closeLabel="Close">
  <p>Check the details of your request before you submit it.</p>
  <button hwButton hwDialogFooter variant="primary" (click)="review.close()">Submit request</button>
</hw-dialog>`
```

## Variants and states

### Description

A description adds a sentence under the title that the dialog references as its description. React and Vue take it as `description`. In vanilla and Angular the application writes the paragraph with an `id` and points `aria-describedby` at it.

```html live example=description static differences=dialog-adapter-markup
<button class="hw-button" type="button" data-variant="secondary" data-size="md" data-hw-dialog-open="description-dialog">Withdraw request</button>
<dialog class="hw-dialog" id="description-dialog" data-hw="dialog" aria-labelledby="description-dialog-title" aria-describedby="description-dialog-text">
  <header class="hw-dialog-header">
    <h2 id="description-dialog-title">Withdraw request</h2>
    <button class="hw-button" type="button" data-variant="ghost" data-size="md" aria-label="Close" data-hw-dialog-close><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>
  </header>
  <div class="hw-dialog-body">
    <p id="description-dialog-text">A withdrawn request cannot be reopened. You can submit a new request at any time.</p>
  </div>
</dialog>
```

```tsx live example=description
<Dialog
  title="Withdraw request"
  closeLabel="Close"
  description="A withdrawn request cannot be reopened. You can submit a new request at any time."
  trigger={<Button variant="secondary">Withdraw request</Button>}
/>
```

```vue live example=description
<Dialog
  title="Withdraw request"
  close-label="Close"
  description="A withdrawn request cannot be reopened. You can submit a new request at any time."
>
  <template #trigger="{ open }"><Button variant="secondary" @click="open">Withdraw request</Button></template>
</Dialog>
```

```ts live example=description framework=angular
template: `<button hwButton variant="secondary" (click)="withdraw.show()">Withdraw request</button>
<hw-dialog #withdraw title="Withdraw request" closeLabel="Close" aria-describedby="withdraw-text">
  <p id="withdraw-text">A withdrawn request cannot be reopened. You can submit a new request at any time.</p>
</hw-dialog>`
```

## API

### JavaScript

Table: Options of createDialog

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `closeOnBackdrop` | `boolean` | `false` | — |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |

`createDialog(dialog, options)` takes a native `dialog` element and throws for any other element. The markup is the API: a `dialog` with the class `hw-dialog`, a `header` with the class `hw-dialog-header` that holds the heading and a close button, a `div` with the class `hw-dialog-body` and, optionally, a `footer` with the class `hw-dialog-footer`. Write the accessible name yourself, for example with `aria-labelledby` that points at the heading. `enhance()` creates the controller for an element with `data-hw="dialog"`. The controller returns `open`, `show(trigger?)`, `close(returnValue?)` and `destroy()`. `show()` opens the dialog as a modal through the native dialog element and throws where the browser lacks that method; the optional argument names the element that receives focus again when the dialog closes, and without it the focused element at the time of the call is used. A button with `data-hw-dialog-open` whose value is the `id` of the dialog opens it, and an element inside the dialog with `data-hw-dialog-close` closes it; the value of that attribute is passed to `close()` as the return value. The dialog needs an `id` for the opening button to find it. Closing by a click on the backdrop is on unless `closeOnBackdrop` is `false`; a gesture closes the dialog only when it begins and ends on the backdrop. `onOpenChange` receives the new state, and the same state is dispatched as an `hw:change` event with `{ open }` in its detail. `destroy()` closes a dialog that the controller opened and removes the listeners.

### React

Table: Props of Dialog

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | — |
| `defaultOpen` | `boolean` | `false` | `false` |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |
| `title` | `ReactNode` | `true` | — |
| `description` | `ReactNode` | `false` | — |
| `trigger` | `ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>` | `false` | — |
| `children` | `ReactNode \| ((context: { close: () => void }) => ReactNode)` | `false` | — |
| `footer` | `ReactNode \| ((context: { close: () => void }) => ReactNode)` | `false` | — |
| `closeOnBackdrop` | `boolean` | `false` | `true` |
| `closeLabel` | `string` | `true` | — |

`title` renders as the second-level heading that names the dialog, and `closeLabel` is the accessible name of the close button; both are required. `description` renders a paragraph at the start of the body and is referenced by `aria-describedby`. `trigger` is one button-like element; Dialog forwards its `onClick`, runs the original handler first and does not open when that handler prevents the default. It also sets the `aria-haspopup` attribute of the trigger to dialog. Use `open` with `onOpenChange` for a controlled dialog, or `defaultOpen` for an uncontrolled one that starts open. `children` and `footer` take content or a function that receives a context object whose close function closes the dialog. `closeOnBackdrop` is `true` unless set to `false`. Dialog also accepts the props of a native `dialog` element, including `onCancel`; call preventDefault on the event there to keep the dialog open when the reader presses <kbd>Escape</kbd>. In React, `autoFocus` on a child renders no autofocus attribute, so the dialog opens with focus on its close button instead of the marked element.

### Vue

Table: Props, events and slots of Dialog

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `open` | prop | `boolean` | `false` | — |
| `defaultOpen` | prop | `boolean` | `false` | `false` |
| `title` | prop | `string` | `true` | — |
| `description` | prop | `string` | `false` | — |
| `closeLabel` | prop | `string` | `true` | — |
| `closeOnBackdrop` | prop | `boolean` | `false` | `true` |
| `update:open` | event | `(open: boolean) => void` | `false` | — |
| `trigger` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |
| `footer` | slot | — | `false` | — |

Bind the open state with v-model on `open`, and `defaultOpen` starts an uncontrolled dialog open. `title` and `closeLabel` are required strings. `description` renders a paragraph at the start of the body and is referenced by `aria-describedby`. The `trigger` slot receives `{ open }`, a function that opens the dialog; write the button and call it from the click handler. The default and `footer` slots receive `{ close }`, and the footer region is rendered only when the `footer` slot is given. The component exposes `element`, `show()` and `close()` through a template ref. The table lists the slots the published build reads; the declaration types none of them.

### Angular

Table: Inputs, outputs and content of hw-dialog

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
| `openChange` | output | `boolean` | `false` | — |
| `cancelled` | output | `void` | `false` | — |
| `returnValue` | output | `string` | `false` | — |
| `*` | content | — | `false` | — |
| `[hwDialogFooter]` | content | — | `false` | — |

`HwDialogComponent` applies to `hw-dialog`. `title` is the visible heading and the default accessible name, and `closeLabel` names the close button; both are required. Bind `[(open)]` for the open state, or call the show and close methods of the component through a template reference variable, as the example does. `aria-label`, `aria-labelledby` and `aria-describedby` written on `hw-dialog` are inputs that the component forwards to the native `dialog` and removes from the host; `aria-labelledby` replaces the title as the name. To describe a dialog, project a paragraph with an `id` and point `aria-describedby` at it. `titleId` sets the id of the heading; the application's value wins over a generated one. `cancelled` is emitted when the dialog is dismissed with <kbd>Escape</kbd>, and `returnValue` emits the return value of the native dialog when it closes. Content marked `hwDialogFooter` goes into the footer, and other content into the body. The footer region is always rendered and the stylesheet hides it while nothing is projected; for a conditional footer, wrap the marked element in the condition.

## Accessibility

Dialog renders a native `dialog` element and opens it as a modal, so the browser supplies its modal behaviour: focus stays inside the dialog while it is open, the page behind it is inert, and the top layer shows it above other content. The dialog takes its accessible name from its heading. In React, Vue and Angular the dialog always carries `aria-labelledby`, which takes precedence over `aria-label`, so only an `aria-labelledby` written by the application replaces the heading as the name. Hawiyah adds no focus trap of its own.

- Closing the dialog returns focus to the element that opened it, when that element is still connected to the page.
- The close button has an icon and no text, so its accessible name comes from the application: `closeLabel` in React, Vue and Angular, and an `aria-label` in the vanilla markup.
- Initial focus belongs on a suitable element inside the dialog; write the native autofocus attribute on it. The vanilla, Vue and Angular dialogs focus the marked element; in React, `autoFocus` on a child renders no autofocus attribute, so focus lands on the close button.
- A popup that opens inside the dialog, such as a list or a tooltip, must stay a descendant of the dialog to appear above it. <kbd>Escape</kbd> closes an open list before it reaches the dialog.
- The stylesheet removes the opening animation of the dialog when the reader asks for reduced motion.
- A dialog interrupts the task. Use it for a confirmation, a short review or an important message, and use a page for detailed data entry.

Table: Keyboard interaction of Dialog

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd> + <kbd>Tab</kbd> | Moves focus to the next or the previous focusable element inside the open dialog, and keeps it inside the dialog. |
| <kbd>Escape</kbd> | Requests closing the dialog, and focus returns to the element that opened it. |
| <kbd>Enter</kbd>, <kbd>Space</kbd> | Activates the focused native button, such as the trigger or the close button. |

## RTL and localisation

Dialog has no built-in text. The title, the description, the footer actions and the accessible name of the close button are written by the application in the language of the page. The dialog follows the direction of the page, and the packaged styles use logical properties, so the heading starts at the reading start and the close button stands at the reading end in Arabic and in English.

- Write `closeLabel` in the language of the dialog; it is the only name the reader of an assistive technology hears for the close button.
- Keep the title, the description and the actions in one language, so that the reading order of the dialog is the reading order of its text.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Dialog; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- Dialog is listed in the Initial interaction/navigation group of the component scope in the [coverage notes](../coverage.md). It is built on the native `dialog` element.
- The [notification notes](../nic-notifications.md) map the centered notification dialog (500px wide, 12px corners, a tone rail) that the native Dialog opts into with `data-variant="notification"` and `data-tone`. The [modal interaction follow-up](../dga-audit-followup.md) records the rule that a backdrop gesture must begin and end outside the panel.
