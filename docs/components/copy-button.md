# CopyButton

CopyButton is a button that copies a value the page already shows to the clipboard and reports the outcome in a polite status beside it. It writes the clipboard only when the reader activates it, and never reads it.

## Example

The button sits beside the value it copies, so the reader sees what is copied. Its accessible name is the same in every state; the result is announced through the status element, not through a change of the name.

```html live example=basic static differences=copy-button-adapter-markup
<div class="hw-inline">
  <code class="hw-code">REQ-2041-7783</code>
  <span class="hw-copy" data-hw="copy-button" data-hw-text="REQ-2041-7783" data-hw-copied-message="Reference copied" data-hw-failed-message="Copy failed. Select the reference and copy it manually.">
    <button type="button" class="hw-button hw-icon-button" data-variant="ghost" data-size="md" aria-label="Copy request reference"><span class="hw-icon" data-icon="copy-01" aria-hidden="true"></span></button>
    <span class="hw-copy-message" role="status" aria-live="polite" aria-atomic="true"></span>
  </span>
</div>
```

```tsx live example=basic
<div className="hw-inline">
  <code className="hw-code">REQ-2041-7783</code>
  <CopyButton
    text="REQ-2041-7783"
    label="Copy request reference"
    copiedMessage="Reference copied"
    failedMessage="Copy failed. Select the reference and copy it manually."
  />
</div>
```

```vue live example=basic
<div class="hw-inline">
  <code class="hw-code">REQ-2041-7783</code>
  <CopyButton
    text="REQ-2041-7783"
    label="Copy request reference"
    copied-message="Reference copied"
    failed-message="Copy failed. Select the reference and copy it manually."
  />
</div>
```

```ts live example=basic framework=angular
template: `<div class="hw-inline">
  <code class="hw-code">REQ-2041-7783</code>
  <hw-copy-button
    text="REQ-2041-7783"
    label="Copy request reference"
    copiedMessage="Reference copied"
    failedMessage="Copy failed. Select the reference and copy it manually."
  />
</div>`
```

## Variants and states

### Text display

`display` set to `text` shows the icon followed by the label, and the label is the visible text of the button.

```html live example=text static differences=copy-button-adapter-markup
<div class="hw-inline">
  <code class="hw-code">REQ-2041-7783</code>
  <span class="hw-copy" data-hw="copy-button" data-hw-text="REQ-2041-7783" data-hw-copied-message="Reference copied" data-hw-failed-message="Copy failed. Select the reference and copy it manually.">
    <button type="button" class="hw-button" data-variant="ghost" data-size="md"><span class="hw-icon" data-icon="copy-01" aria-hidden="true"></span>Copy reference</button>
    <span class="hw-copy-message" role="status" aria-live="polite" aria-atomic="true"></span>
  </span>
</div>
```

```tsx live example=text
<div className="hw-inline">
  <code className="hw-code">REQ-2041-7783</code>
  <CopyButton
    text="REQ-2041-7783"
    label="Copy reference"
    copiedMessage="Reference copied"
    failedMessage="Copy failed. Select the reference and copy it manually."
    display="text"
  />
</div>
```

```vue live example=text
<div class="hw-inline">
  <code class="hw-code">REQ-2041-7783</code>
  <CopyButton
    text="REQ-2041-7783"
    label="Copy reference"
    copied-message="Reference copied"
    failed-message="Copy failed. Select the reference and copy it manually."
    display="text"
  />
</div>
```

```ts live example=text framework=angular
template: `<div class="hw-inline">
  <code class="hw-code">REQ-2041-7783</code>
  <hw-copy-button
    text="REQ-2041-7783"
    label="Copy reference"
    copiedMessage="Reference copied"
    failedMessage="Copy failed. Select the reference and copy it manually."
    display="text"
  />
</div>`
```

### Disabled

A disabled button uses the native `disabled` attribute and does not copy.

```html live example=disabled static differences=copy-button-adapter-markup
<div class="hw-inline">
  <code class="hw-code">REQ-2041-7783</code>
  <span class="hw-copy" data-hw="copy-button" data-hw-text="REQ-2041-7783" data-hw-copied-message="Reference copied" data-hw-failed-message="Copy failed. Select the reference and copy it manually.">
    <button type="button" class="hw-button hw-icon-button" data-variant="ghost" data-size="md" aria-label="Copy request reference" disabled><span class="hw-icon" data-icon="copy-01" aria-hidden="true"></span></button>
    <span class="hw-copy-message" role="status" aria-live="polite" aria-atomic="true"></span>
  </span>
</div>
```

```tsx live example=disabled
<div className="hw-inline">
  <code className="hw-code">REQ-2041-7783</code>
  <CopyButton
    text="REQ-2041-7783"
    label="Copy request reference"
    copiedMessage="Reference copied"
    failedMessage="Copy failed. Select the reference and copy it manually."
    disabled
  />
</div>
```

```vue live example=disabled
<div class="hw-inline">
  <code class="hw-code">REQ-2041-7783</code>
  <CopyButton
    text="REQ-2041-7783"
    label="Copy request reference"
    copied-message="Reference copied"
    failed-message="Copy failed. Select the reference and copy it manually."
    disabled
  />
</div>
```

```ts live example=disabled framework=angular
template: `<div class="hw-inline">
  <code class="hw-code">REQ-2041-7783</code>
  <hw-copy-button
    text="REQ-2041-7783"
    label="Copy request reference"
    copiedMessage="Reference copied"
    failedMessage="Copy failed. Select the reference and copy it manually."
    [disabled]="true"
  />
</div>`
```

## API

### JavaScript

Table: Options of createCopyButton

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `text` | `string \| (() => string)` | `false` | — |
| `label` | `string` | `false` | — |
| `copiedMessage` | `string` | `false` | — |
| `failedMessage` | `string` | `false` | — |
| `feedbackDuration` | `number` | `false` | — |
| `onCopyResult` | `(result: CopyResult) => void` | `false` | — |

CopyButton has no stylesheet-only form: the controller needs the markup of the root. Write a `span` with the class `hw-copy` and `data-hw="copy-button"`, a native `button` with `type="button"` and a `span` with the class `hw-copy-message`, `role="status"` and the attributes `aria-live` and `aria-atomic`, set to polite and true. The icon form is the button with the class `hw-icon-button` and an `aria-label`; the text form is the button with the label as text after the icon. The variant, the size, `disabled` and the display form are authored markup. The value is read when the reader activates the button and never before: `text` as an option, a string or a function, wins over `data-hw-text`, which wins over `data-hw-target`, the id of an element whose text is read. A missing value or one made of white space only is the empty outcome. `copiedMessage` and `failedMessage` are required, and so is `label` for a button that has no `aria-label` and no text; the attribute names on the root follow the option names, with `data-hw-` and hyphens, and the label is written to the button only when it has no `aria-label` and no text. `feedbackDuration` is the time in milliseconds that the copied state lasts, and a value that is not a finite number above zero means 3000, also in the root attribute `data-hw-feedback-duration`. The options publish no default in 0.3.0. `onCopyResult` receives the result once per activation that still counts, and the controller dispatches `hw:change` with a detail of the status and `text`. The controller writes `data-state` on the root, whose value is idle, copied or failed, and follows the state with the icon. The returned controller has `state`, `copy()`, which resolves to the result, or to undefined when a later activation overtakes it or the controller is destroyed, and `destroy()`, which restores the authored attributes and the status text.

### React

Table: Props of CopyButton

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `text` | `string \| (() => string)` | `true` | — |
| `label` | `string` | `true` | — |
| `copiedMessage` | `string` | `true` | — |
| `failedMessage` | `string` | `true` | — |
| `display` | `'icon' \| 'text'` | `false` | `'icon'` |
| `variant` | `'link' \| 'primary' \| 'default' \| 'secondary' \| 'outline' \| 'outline-white' \| 'light' \| 'danger' \| 'ghost' \| 'soft'` | `false` | `'ghost'` |
| `size` | `'sm' \| 'md' \| 'lg'` | `false` | `'md'` |
| `feedbackDuration` | `number` | `false` | `3000` |
| `onCopyResult` | `(result: CopyResult) => void` | `false` | — |

`text`, `label`, `copiedMessage` and `failedMessage` are required. `text` is a string or a function that the component calls at activation and never before; its value is written unchanged, without trimming. `label` is the accessible name of the icon display and the visible text of the text display, and it does not change with the state. `display` is `icon` by default and `variant` is `ghost`, `size` is `md` and `feedbackDuration` is 3000; a value that is not a finite number above zero means 3000. `onCopyResult` receives a `CopyResult`, an object with a status of copied, failed, denied, unavailable or empty and the copied `text`, once per activation that still counts. The `className` and `style` props reach the root, and every other attribute and the ref reach the button, so `disabled` is the native attribute.

### Vue

Table: Props, events and slots of CopyButton

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `text` | prop | `string \| (() => string)` | `true` | — |
| `label` | prop | `string` | `true` | — |
| `copiedMessage` | prop | `string` | `true` | — |
| `failedMessage` | prop | `string` | `true` | — |
| `display` | prop | `'icon' \| 'text'` | `false` | `'icon'` |
| `variant` | prop | `'primary' \| 'default' \| 'secondary' \| 'outline' \| 'outline-white' \| 'light' \| 'danger' \| 'ghost' \| 'soft' \| 'link'` | `false` | `'ghost'` |
| `size` | prop | `'sm' \| 'md' \| 'lg'` | `false` | `'md'` |
| `feedbackDuration` | prop | `number` | `false` | `3000` |
| `disabled` | prop | `boolean` | `false` | `false` |
| `copyResult` | event | `(result: CopyResult) => void` | `false` | — |

`text`, `label`, `copiedMessage` and `failedMessage` are required, and `display`, `variant`, `size` and `feedbackDuration` have the defaults of React. `disabled` is a boolean prop with the default false. The event `copyResult` carries a `CopyResult`; in a template the listener uses the hyphenated form of that name. The table lists no slot because the build reads none.

### Angular

Table: Inputs, outputs and content of hw-copy-button

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `text` | input | `string \| (() => string)` | `true` | — |
| `label` | input | `string` | `true` | — |
| `copiedMessage` | input | `string` | `true` | — |
| `failedMessage` | input | `string` | `true` | — |
| `display` | input | `'icon' \| 'text'` | `false` | `'icon'` |
| `variant` | input | `'primary' \| 'default' \| 'secondary' \| 'outline' \| 'outline-white' \| 'light' \| 'danger' \| 'ghost' \| 'soft' \| 'link'` | `false` | `'ghost'` |
| `size` | input | `'sm' \| 'md' \| 'lg'` | `false` | `'md'` |
| `feedbackDuration` | input | `number` | `false` | `3000` |
| `disabled` | input | `boolean` | `false` | `false` |
| `copyResult` | output | `CopyResult` | `false` | — |

`HwCopyButtonComponent` (`hw-copy-button`) is the root: it carries the class `hw-copy` and `data-state`, and holds the native button and the status element. `text`, `label`, `copiedMessage` and `failedMessage` are required, and `display`, `variant`, `size`, `feedbackDuration` and `disabled` have the defaults of the table. The output `copyResult` emits a `CopyResult` once per activation that still counts, and nothing is emitted after the component is destroyed. No attribute is forwarded to the button.

## Accessibility

CopyButton is a native `button` with `type="button"`, so the browser provides its role, its focus and its activation. The accessible name is the `label`, written as `aria-label` in the icon display and as the visible text in the text display, and it is the same in the idle, copied and failed states. Focus stays on the button after an activation.

Table: Keyboard interaction of CopyButton

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves focus to the button, then to the next control of the page. |
| <kbd>Shift</kbd> + <kbd>Tab</kbd> | Moves focus to the previous control of the page. |
| <kbd>Enter</kbd>, <kbd>Space</kbd> | Activates the focused button and copies the value. |

- The outcome is reported in an element with `role="status"`, whose `aria-live` is polite and whose `aria-atomic` is true. It is empty when the button is idle. After a successful copy it holds `copiedMessage`, visually hidden, for the duration of `feedbackDuration`; after a failure it holds `failedMessage` as visible text until the next activation.
- Each activation first empties the status, so that a repeated message is announced again. When a result settles at once, as with an empty value or without the Clipboard API, the status is emptied and filled within one task; the repetition of an identical message in that case has not been verified with a screen reader.
- The clipboard is written through the asynchronous Clipboard API only, with no fallback, and it is never read. The result is one of the statuses copied, denied, unavailable, failed and empty; for any status other than copied the application may offer manual copying, for example by selecting the value.
- Only the latest activation counts, so a later activation overtakes an earlier one that has not settled.
- A disabled button is not focusable and does not copy.

## RTL and localisation

CopyButton has no built-in text: the label, the copied message and the failed message are written by the application in the language of the page. The element inherits the language and the direction of the page, and the packaged styles use logical properties, so the button and its status follow the reading direction. The value that is copied is data and keeps its own script; the component does not change it.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of CopyButton; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The [copy action notes](../nic-copy-action.md) describe the behaviour of the supplied Platforms Code script that binds a copy icon to a visible value, and the recipe of the Button guide that uses an explicitly labelled native button in its place. That recipe trims the visible text, prefers a mail address and shows the text in a read-only input after a failure; CopyButton writes its text unchanged and has none of these, and it keeps the native button with a name written by the application and the status messages for the outcomes.
- The [copy action notes](../nic-copy-action.md) state that the source's global selector, icon font, site translations and timed notification are application-specific; they are not copied.
