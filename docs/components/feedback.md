# Feedback

Feedback asks whether a page was useful with two choices, then opens a comment step and a send button, and shows an acknowledgement after the reader sends. It reports the answer to the application as a value with a `helpful` flag and a `comment`; nothing is sent anywhere.

## Example

The group is named by the visible question. The two choices are buttons that carry their pressed state, and once the reader chooses one, a comment field and a send button follow the choices in the tab order. The acknowledgement appears in a status paragraph after the reader sends.

```html live example=basic static differences=feedback-adapter-markup
<div class="hw-feedback" data-hw="feedback" role="group" aria-labelledby="basic-question" data-hw-success-message="Thank you for your feedback.">
  <p id="basic-question">Was this page helpful?</p>
  <div class="hw-feedback-actions">
    <button type="button" class="hw-button" data-variant="secondary" data-size="md" data-hw-value="yes" aria-pressed="false"><span class="hw-icon hw-feedback-icon" data-icon="thumbs-up" aria-hidden="true"></span><span class="hw-feedback-label">Yes</span></button>
    <button type="button" class="hw-button" data-variant="secondary" data-size="md" data-hw-value="no" aria-pressed="false"><span class="hw-icon hw-feedback-icon" data-icon="thumbs-down" aria-hidden="true"></span><span class="hw-feedback-label">No</span></button>
  </div>
  <div data-hw-feedback-comment hidden>
    <div class="hw-field"><label class="hw-label" for="basic-comment">Comment</label><textarea class="hw-textarea" id="basic-comment"></textarea></div>
    <button type="button" class="hw-button" data-variant="primary" data-size="md" data-hw-feedback-submit>Send</button>
  </div>
  <p role="status" data-hw-feedback-status></p>
</div>
```

```tsx live example=basic
<Feedback
  label="Was this page helpful?"
  yesLabel="Yes"
  noLabel="No"
  commentLabel="Comment"
  submitLabel="Send"
  successMessage="Thank you for your feedback."
/>
```

```vue live example=basic
<Feedback
  label="Was this page helpful?"
  yes-label="Yes"
  no-label="No"
  comment-label="Comment"
  submit-label="Send"
  success-message="Thank you for your feedback."
/>
```

```ts live example=basic framework=angular
template: `<hw-feedback
  label="Was this page helpful?"
  yesLabel="Yes"
  noLabel="No"
  commentLabel="Comment"
  submitLabel="Send"
  successMessage="Thank you for your feedback."
/>`
```

## Variants and states

### Icon and text

`choiceVariant` selects how the two choices are shown: `text` shows the words, `icon` shows the icons, and `icon-text` shows both. The labels stay in the markup of every choice, so the choices keep their names in each variant.

```html live example=icon-text static differences=feedback-adapter-markup
<div class="hw-feedback" data-hw="feedback" role="group" aria-labelledby="icon-text-question" data-choice-variant="icon-text" data-hw-success-message="Thank you for your feedback.">
  <p id="icon-text-question">Was this guidance clear?</p>
  <div class="hw-feedback-actions">
    <button type="button" class="hw-button" data-variant="secondary" data-size="md" data-hw-value="yes" aria-pressed="false"><span class="hw-icon hw-feedback-icon" data-icon="thumbs-up" aria-hidden="true"></span><span class="hw-feedback-label">Yes</span></button>
    <button type="button" class="hw-button" data-variant="secondary" data-size="md" data-hw-value="no" aria-pressed="false"><span class="hw-icon hw-feedback-icon" data-icon="thumbs-down" aria-hidden="true"></span><span class="hw-feedback-label">No</span></button>
  </div>
  <div data-hw-feedback-comment hidden>
    <div class="hw-field"><label class="hw-label" for="icon-text-comment">Comment</label><textarea class="hw-textarea" id="icon-text-comment"></textarea></div>
    <button type="button" class="hw-button" data-variant="primary" data-size="md" data-hw-feedback-submit>Send</button>
  </div>
  <p role="status" data-hw-feedback-status></p>
</div>
```

```tsx live example=icon-text
<Feedback
  label="Was this guidance clear?"
  choiceVariant="icon-text"
  yesLabel="Yes"
  noLabel="No"
  commentLabel="Comment"
  submitLabel="Send"
  successMessage="Thank you for your feedback."
/>
```

```vue live example=icon-text
<Feedback
  label="Was this guidance clear?"
  choice-variant="icon-text"
  yes-label="Yes"
  no-label="No"
  comment-label="Comment"
  submit-label="Send"
  success-message="Thank you for your feedback."
/>
```

```ts live example=icon-text framework=angular
template: `<hw-feedback
  label="Was this guidance clear?"
  choiceVariant="icon-text"
  yesLabel="Yes"
  noLabel="No"
  commentLabel="Comment"
  submitLabel="Send"
  successMessage="Thank you for your feedback."
/>`
```

### Disabled

A disabled feedback group disables both choices, and its comment field and send button when they are shown. Use it while the application cannot accept an answer. The vanilla block below writes `disabled` on each control by hand; the controller also disables every control when the root is `disabled`, has `aria-disabled="true"` or carries `data-hw-disabled`.

```html live example=disabled static differences=feedback-adapter-markup
<div class="hw-feedback" data-hw="feedback" role="group" aria-labelledby="disabled-question" data-hw-success-message="Thank you for your feedback.">
  <p id="disabled-question">Was this page helpful?</p>
  <div class="hw-feedback-actions">
    <button type="button" class="hw-button" data-variant="secondary" data-size="md" data-hw-value="yes" aria-pressed="false" disabled><span class="hw-icon hw-feedback-icon" data-icon="thumbs-up" aria-hidden="true"></span><span class="hw-feedback-label">Yes</span></button>
    <button type="button" class="hw-button" data-variant="secondary" data-size="md" data-hw-value="no" aria-pressed="false" disabled><span class="hw-icon hw-feedback-icon" data-icon="thumbs-down" aria-hidden="true"></span><span class="hw-feedback-label">No</span></button>
  </div>
  <div data-hw-feedback-comment hidden>
    <div class="hw-field"><label class="hw-label" for="disabled-comment">Comment</label><textarea class="hw-textarea" id="disabled-comment" disabled></textarea></div>
    <button type="button" class="hw-button" data-variant="primary" data-size="md" data-hw-feedback-submit disabled>Send</button>
  </div>
  <p role="status" data-hw-feedback-status></p>
</div>
```

```tsx live example=disabled
<Feedback
  label="Was this page helpful?"
  disabled
  yesLabel="Yes"
  noLabel="No"
  commentLabel="Comment"
  submitLabel="Send"
  successMessage="Thank you for your feedback."
/>
```

```vue live example=disabled
<Feedback
  label="Was this page helpful?"
  disabled
  yes-label="Yes"
  no-label="No"
  comment-label="Comment"
  submit-label="Send"
  success-message="Thank you for your feedback."
/>
```

```ts live example=disabled framework=angular
template: `<hw-feedback
  label="Was this page helpful?"
  [disabled]="true"
  yesLabel="Yes"
  noLabel="No"
  commentLabel="Comment"
  submitLabel="Send"
  successMessage="Thank you for your feedback."
/>`
```

## API

### JavaScript

Table: Options of createFeedback

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `value` | `FeedbackValue` | `false` | — |
| `onValueChange` | `(value: FeedbackValue) => void` | `false` | — |
| `onFeedback` | `(value: FeedbackValue) => void` | `false` | — |
| `successMessage` | `string` | `false` | — |

`createFeedback(root, options)` enhances authored markup: a group with two buttons that carry `data-hw-value` set to the answers yes and no, an optional comment step marked `data-hw-feedback-comment` that holds a textarea and a button marked `data-hw-feedback-submit`, an optional hidden input marked `data-hw-feedback-value`, and a status element marked `data-hw-feedback-status`. The question, the choices, the comment label and the send text are authored markup, so only `successMessage` is a text option; it is required and can be written as an attribute on the root. `value` is a `FeedbackValue`, an object with `helpful` (`true`, `false` or `null`) and `comment` (a string); without it the controller reads the authored state. The controller returns `value`, `select(helpful)`, `setComment(comment)`, `submit()` and `destroy()`. `onValueChange` receives the value whenever the answer or the comment changes, and `onFeedback` receives it when the reader sends. The comment step stays hidden until an answer exists, and the status shows `successMessage` after a send. Without a comment step in the markup, a choice reports at once. The controller dispatches `hw:change` on the root with `value` in its detail for a change and the sent value under the key "feedback" in its detail for a send. In markup, the attribute `data-choice-variant` on the root selects the choice variant that the stylesheet knows: `icon` or `icon-text`.

### React

Table: Props of Feedback

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `value` | `FeedbackValue` | `false` | — |
| `defaultValue` | `FeedbackValue` | `false` | — |
| `onValueChange` | `(value: FeedbackValue) => void` | `false` | — |
| `onFeedback` | `(value: FeedbackValue) => void` | `false` | — |
| `yesLabel` | `string` | `true` | — |
| `noLabel` | `string` | `true` | — |
| `commentLabel` | `string` | `true` | — |
| `submitLabel` | `string` | `true` | — |
| `successMessage` | `ReactNode` | `true` | — |
| `disabled` | `boolean` | `false` | — |
| `choiceVariant` | `'text' \| 'icon' \| 'icon-text'` | `false` | `'text'` |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `label` | `ReactNode` | `false` | — |

Use `value` with `onValueChange` for a controlled group, or `defaultValue` for an uncontrolled one; the default is a value with `helpful` set to `null` and an empty comment, which the table cannot show as a literal. `onValueChange` is called when the answer or the comment changes, never for the answer that is already pressed, and `onFeedback` is called with the value when the reader presses the send button. `yesLabel`, `noLabel`, `commentLabel`, `submitLabel` and `successMessage` are required. `label` is the visible question and names the group; when `aria-label` or `aria-labelledby` is given, those names replace the reference to the question. `disabled` disables both choices, the comment field and the send button. The component takes no part in form submission and carries no name.

### Vue

Table: Props, events and slots of Feedback

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `choiceVariant` | prop | `'text' \| 'icon' \| 'icon-text'` | `false` | `'text'` |
| `label` | prop | `string` | `false` | — |
| `modelValue` | prop | `FeedbackValue` | `false` | — |
| `defaultValue` | prop | `FeedbackValue` | `false` | — |
| `yesLabel` | prop | `string` | `true` | — |
| `noLabel` | prop | `string` | `true` | — |
| `commentLabel` | prop | `string` | `true` | — |
| `submitLabel` | prop | `string` | `true` | — |
| `successMessage` | prop | `string` | `true` | — |
| `disabled` | prop | `boolean` | `false` | `false` |
| `update:modelValue` | event | `(value: FeedbackValue) => void` | `false` | — |
| `feedback` | event | `(value: FeedbackValue) => void` | `false` | — |
| `default` | slot | — | `false` | — |

`v-model` binds the `FeedbackValue`, an object with `helpful` and `comment`. `defaultValue` sets the initial value of an uncontrolled group, and its default is a value with `helpful` set to `null` and an empty comment. The `feedback` event carries the value when the reader sends; a later change of the answer or the comment empties the acknowledgement. `label` is the visible question, a paragraph that names the group. `yesLabel`, `noLabel`, `commentLabel`, `submitLabel` and `successMessage` are required. The default slot adds content after the status. `disabled` disables every control.

### Angular

Table: Inputs, outputs and content of hw-feedback

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `label` | input | `string` | `false` | `''` |
| `choiceVariant` | input | `'text' \| 'icon' \| 'icon-text'` | `false` | `'text'` |
| `yesLabel` | input | `string` | `true` | — |
| `noLabel` | input | `string` | `true` | — |
| `commentLabel` | input | `string` | `true` | — |
| `submitLabel` | input | `string` | `true` | — |
| `successMessage` | input | `string` | `true` | — |
| `value` | input | `HwFeedbackValue` | `false` | `{ helpful: null, comment: '' }` |
| `disabled` | input | `boolean` | `false` | `false` |
| `valueChange` | output | `FeedbackValue` | `false` | — |
| `feedback` | output | `FeedbackValue` | `false` | — |
| `*` | content | — | `false` | — |

`HwFeedbackComponent` applies to `hw-feedback`. Bind `[(value)]` for the `HwFeedbackValue`, an object with `helpful` and `comment`; `valueChange` fires once for each change of the answer or the comment and never again for the answer that is already pressed. `feedback` emits the value when the reader sends, and the status shows `successMessage` until the answer or the comment changes. The group needs `label`, or `aria-label` or `aria-labelledby` written on `hw-feedback`, which then replace the reference to the question. `yesLabel`, `noLabel`, `commentLabel`, `submitLabel` and `successMessage` are required. Projected content is placed after the status. `disabled` is a boolean input, so `[disabled]="true"` and a bare `disabled` attribute both set it.

## Accessibility

Feedback renders a `div` with `role="group"` that is named by the visible question, so the question is read when focus enters the group. The application receives the value and decides what to store.

- Each choice is a native button with `aria-pressed`, set to `true` on the chosen answer and `false` on the other. The icon in a choice is hidden from assistive technology and the label gives the name.
- The comment step is added or revealed after the first answer. No focus is moved: the new controls follow the answers in the tab order, so the reader reaches the comment field and the send button with the next <kbd>Tab</kbd>.
- The comment field is a native textarea with a visible label, so its label text is its accessible name.
- The acknowledgement is written to a paragraph with `role="status"`, which assistive technology announces politely. It is empty until the reader sends and is emptied again by a later change.
- The send button is available as soon as an answer exists; a comment is optional.

Table: Keyboard interaction of Feedback

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves focus to the next control in the order of the page: the two choices, then, once an answer exists, the comment field and the send button. |
| <kbd>Enter</kbd>, <kbd>Space</kbd> | Activates the focused choice or the send button. |

Feedback defines no other keys. The choices and the send button are native buttons and the comment field is a native textarea, so the keys follow the browser; inside the comment field <kbd>Enter</kbd> inserts a line break.

## RTL and localisation

Feedback has no built-in text. The question, the labels of the choices, the comment label, the send text and the acknowledgement are written by the application in the language of the page, and the component adds nothing to them.

- The group inherits the direction of the page, and the choices sit in a wrapping flex layout, so they start at the reading start and the comment step follows them in both directions.
- The thumbs icons are packaged icons that carry no direction, so they are not mirrored.
- The comment is free text typed by the reader; the value keeps it as typed, in any script.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Feedback; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- Feedback is listed in the Platform patterns group of the [coverage notes](../coverage.md). It is composed from the buttons, the textarea and the field of the library.
- The component records one contract in every adapter and sends nothing anywhere, so storing an answer remains an integration of the application.
