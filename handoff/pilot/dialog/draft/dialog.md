# Dialog

## Example

```html live example=basic check=dialog-keyboard,dialog-close-button
<button class="hw-button" type="button" data-variant="primary" data-size="md" aria-haspopup="dialog" data-hw-dialog-open="review-dialog">Review request</button>
<dialog class="hw-dialog" id="review-dialog" data-hw="dialog" aria-labelledby="review-title" aria-describedby="review-description">
  <header class="hw-dialog-header">
    <h2 id="review-title">Review service request</h2>
    <button class="hw-button" type="button" data-variant="ghost" data-size="md" aria-label="Close" data-hw-dialog-close><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>
  </header>
  <div class="hw-dialog-body">
    <p id="review-description">Check the details of the request before you submit it.</p>
  </div>
  <footer class="hw-dialog-footer">
    <button class="hw-button" type="button" data-variant="secondary" data-size="md" data-hw-dialog-close>Cancel</button>
    <button class="hw-button" type="button" data-variant="primary" data-size="md" data-hw-dialog-close>Submit request</button>
  </footer>
</dialog>
```

```tsx live example=basic
<Dialog
  title="Review service request"
  description="Check the details of the request before you submit it."
  closeLabel="Close"
  trigger={<Button>Review request</Button>}
  footer={({ close }) => (
    <>
      <Button variant="secondary" onClick={close}>Cancel</Button>
      <Button onClick={close}>Submit request</Button>
    </>
  )}
/>
```

```vue live example=basic
<Dialog
  title="Review service request"
  description="Check the details of the request before you submit it."
  close-label="Close"
>
  <template #trigger="{ open }">
    <Button aria-haspopup="dialog" @click="open">Review request</Button>
  </template>
  <template #footer="{ close }">
    <Button variant="secondary" @click="close">Cancel</Button>
    <Button @click="close">Submit request</Button>
  </template>
</Dialog>
```

```ts live example=basic framework=angular
template: `<button hwButton aria-haspopup="dialog" (click)="review.show()">Review request</button>
<hw-dialog #review title="Review service request" closeLabel="Close" aria-describedby="review-description">
  <p id="review-description">Check the details of the request before you submit it.</p>
  <button hwButton hwDialogFooter variant="secondary" (click)="review.close()">Cancel</button>
  <button hwButton hwDialogFooter (click)="review.close()">Submit request</button>
</hw-dialog>`
```

## Variants and states

### Initial focus

```html live example=initial-focus check=dialog-initial-focus
<button class="hw-button" type="button" data-variant="secondary" data-size="md" aria-haspopup="dialog" data-hw-dialog-open="withdraw-dialog">Withdraw request</button>
<dialog class="hw-dialog" id="withdraw-dialog" data-hw="dialog" aria-labelledby="withdraw-title" aria-describedby="withdraw-description">
  <header class="hw-dialog-header">
    <h2 id="withdraw-title">Withdraw the service request</h2>
    <button class="hw-button" type="button" data-variant="ghost" data-size="md" aria-label="Close" data-hw-dialog-close><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>
  </header>
  <div class="hw-dialog-body">
    <p id="withdraw-description">A withdrawn request cannot be submitted again.</p>
  </div>
  <footer class="hw-dialog-footer">
    <button class="hw-button" type="button" data-variant="secondary" data-size="md" data-hw-dialog-close autofocus>Keep request</button>
    <button class="hw-button" type="button" data-variant="danger" data-size="md" data-hw-dialog-close>Withdraw</button>
  </footer>
</dialog>
```

```tsx live example=initial-focus
<Dialog
  title="Withdraw the service request"
  description="A withdrawn request cannot be submitted again."
  closeLabel="Close"
  trigger={<Button variant="secondary">Withdraw request</Button>}
  footer={({ close }) => (
    <>
      <Button variant="secondary" autoFocus onClick={close}>Keep request</Button>
      <Button variant="danger" onClick={close}>Withdraw</Button>
    </>
  )}
/>
```

```vue live example=initial-focus
<Dialog
  title="Withdraw the service request"
  description="A withdrawn request cannot be submitted again."
  close-label="Close"
>
  <template #trigger="{ open }">
    <Button variant="secondary" aria-haspopup="dialog" @click="open">Withdraw request</Button>
  </template>
  <template #footer="{ close }">
    <Button variant="secondary" autofocus @click="close">Keep request</Button>
    <Button variant="danger" @click="close">Withdraw</Button>
  </template>
</Dialog>
```

```ts live example=initial-focus framework=angular
template: `<button hwButton variant="secondary" aria-haspopup="dialog" (click)="withdraw.show()">Withdraw request</button>
<hw-dialog #withdraw title="Withdraw the service request" closeLabel="Close" aria-describedby="withdraw-description">
  <p id="withdraw-description">A withdrawn request cannot be submitted again.</p>
  <button hwButton hwDialogFooter variant="secondary" autofocus (click)="withdraw.close()">Keep request</button>
  <button hwButton hwDialogFooter variant="danger" (click)="withdraw.close()">Withdraw</button>
</hw-dialog>`
```

## API

### JavaScript

Table: Options of createDialog

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `closeOnBackdrop` | `boolean` | `false` | — |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |

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

## Accessibility

Table: Keyboard interaction of Dialog

| Key | Action |
| --- | --- |
| <kbd>Enter</kbd>, <kbd>Space</kbd> | On the trigger, opens the dialog and moves focus inside it; on the close button, closes the dialog and returns focus to the trigger. |
| <kbd>Tab</kbd> | Moves focus to the next element of the dialog, and focus never reaches the page behind it. |
| <kbd>Shift</kbd> + <kbd>Tab</kbd> | Moves focus to the previous element of the dialog, and focus never reaches the page behind it. |
| <kbd>Escape</kbd> | Closes the dialog and returns focus to the trigger that opened it. |

## RTL and localisation

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification.
