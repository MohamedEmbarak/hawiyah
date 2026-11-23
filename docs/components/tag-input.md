# TagInput

TagInput is a text field in which the reader enters several short values, each committed as a removable tag. Every committed tag is submitted as its own value of the form field; text that has not been committed is not submitted.

## Example

A tag input has a visible label that names the information requested, and a hint that tells the reader how a tag is committed. The reader types a value and commits it; each committed value appears as a tag with a button that removes it. The application supplies `getRemoveLabel`, which gives each remove button its accessible name, because the component contains no text of its own.

```html live example=basic static differences=tag-input-adapter-markup
<div class="hw-field">
  <label class="hw-label" for="basic" id="basic-label">Request keywords</label>
  <div class="hw-tag-input" data-hw="tag-input" data-hw-remove-label="Remove {tag}">
    <ul data-hw-tags></ul>
    <input class="hw-input" id="basic" type="text" name="keywords" data-hw-tag-input aria-describedby="basic-hint">
  </div>
  <p class="hw-hint" id="basic-hint">Type a keyword and press Enter to add it.</p>
</div>
```

```tsx live example=basic
<TagInput
  label="Request keywords"
  name="keywords"
  getRemoveLabel={(tag) => 'Remove ' + tag}
  hint="Type a keyword and press Enter to add it."
/>
```

```vue live example=basic
<TagInput
  label="Request keywords"
  name="keywords"
  :get-remove-label="(tag) => 'Remove ' + tag"
  hint="Type a keyword and press Enter to add it."
/>
```

```ts live example=basic framework=angular
import { Component } from '@angular/core';
import { HwTagInputComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwTagInputComponent],
  template: `
    <hw-tag-input
      label="Request keywords"
      name="keywords"
      controlId="basic"
      [getRemoveLabel]="removeLabel"
      hint="Type a keyword and press Enter to add it."
    />
  `,
})
export class ExampleComponent {
  readonly removeLabel = (tag: string) => 'Remove ' + tag;
}
```

## Variants and states

### Existing tags

`defaultValue` sets the initial tags of an uncontrolled field in React and Vue, and `value` does so in Angular; vanilla reads them from the `value` option or from the attribute `data-hw-value` as a JSON array of strings.

```html live example=tags static differences=tag-input-adapter-markup
<div class="hw-field">
  <label class="hw-label" for="tags" id="tags-label">Request keywords</label>
  <div class="hw-tag-input" data-hw="tag-input" data-hw-remove-label="Remove {tag}" data-hw-value='["Renewal","Urgent"]'>
    <ul data-hw-tags></ul>
    <input class="hw-input" id="tags" type="text" name="keywords" data-hw-tag-input aria-describedby="tags-hint">
  </div>
  <p class="hw-hint" id="tags-hint">Type a keyword and press Enter to add it.</p>
</div>
```

```tsx live example=tags
<TagInput
  label="Request keywords"
  name="keywords"
  getRemoveLabel={(tag) => 'Remove ' + tag}
  hint="Type a keyword and press Enter to add it."
  defaultValue={['Renewal', 'Urgent']}
/>
```

```vue live example=tags
<TagInput
  label="Request keywords"
  name="keywords"
  :get-remove-label="(tag) => 'Remove ' + tag"
  hint="Type a keyword and press Enter to add it."
  :default-value="['Renewal', 'Urgent']"
/>
```

```ts live example=tags framework=angular
import { Component } from '@angular/core';
import { HwTagInputComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwTagInputComponent],
  template: `
    <hw-tag-input
      label="Request keywords"
      name="keywords"
      controlId="tags"
      [getRemoveLabel]="removeLabel"
      hint="Type a keyword and press Enter to add it."
      [value]="['Renewal', 'Urgent']"
    />
  `,
})
export class ExampleComponent {
  readonly removeLabel = (tag: string) => 'Remove ' + tag;
}
```

### Error

An error is shown in a paragraph after the field, and the text input is marked with `aria-invalid="true"` and described by the message. The message states what is wrong and how to correct it.

```html live example=error static differences=tag-input-adapter-markup
<div class="hw-field">
  <label class="hw-label" for="error" id="error-label">Request keywords</label>
  <div class="hw-tag-input" data-hw="tag-input" data-hw-remove-label="Remove {tag}">
    <ul data-hw-tags></ul>
    <input class="hw-input" id="error" type="text" name="keywords" data-hw-tag-input aria-describedby="error-error" aria-invalid="true">
  </div>
  <p class="hw-error" id="error-error">Add at least one keyword.</p>
</div>
```

```tsx live example=error
<TagInput
  label="Request keywords"
  name="keywords"
  getRemoveLabel={(tag) => 'Remove ' + tag}
  error="Add at least one keyword."
/>
```

```vue live example=error
<TagInput
  label="Request keywords"
  name="keywords"
  :get-remove-label="(tag) => 'Remove ' + tag"
  error="Add at least one keyword."
/>
```

```ts live example=error framework=angular
import { Component } from '@angular/core';
import { HwTagInputComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwTagInputComponent],
  template: `
    <hw-tag-input
      label="Request keywords"
      name="keywords"
      controlId="error"
      [getRemoveLabel]="removeLabel"
      error="Add at least one keyword."
    />
  `,
})
export class ExampleComponent {
  readonly removeLabel = (tag: string) => 'Remove ' + tag;
}
```

### Read only

A read-only field keeps its tags in the form and stays focusable, but the reader cannot add or remove a tag: the remove buttons are disabled.

```html live example=readonly static differences=tag-input-adapter-markup
<div class="hw-field">
  <label class="hw-label" for="readonly" id="readonly-label">Request keywords</label>
  <div class="hw-tag-input" data-hw="tag-input" data-hw-remove-label="Remove {tag}" data-hw-value='["Renewal","Urgent"]'>
    <ul data-hw-tags></ul>
    <input class="hw-input" id="readonly" type="text" name="keywords" data-hw-tag-input readonly>
  </div>
</div>
```

```tsx live example=readonly
<TagInput
  label="Request keywords"
  name="keywords"
  getRemoveLabel={(tag) => 'Remove ' + tag}
  defaultValue={['Renewal', 'Urgent']}
  readOnly
/>
```

```vue live example=readonly
<TagInput
  label="Request keywords"
  name="keywords"
  :get-remove-label="(tag) => 'Remove ' + tag"
  :default-value="['Renewal', 'Urgent']"
  readonly
/>
```

```ts live example=readonly framework=angular
import { Component } from '@angular/core';
import { HwTagInputComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwTagInputComponent],
  template: `
    <hw-tag-input
      label="Request keywords"
      name="keywords"
      controlId="readonly"
      [getRemoveLabel]="removeLabel"
      [value]="['Renewal', 'Urgent']"
      [readOnly]="true"
    />
  `,
})
export class ExampleComponent {
  readonly removeLabel = (tag: string) => 'Remove ' + tag;
}
```

## API

### JavaScript

Table: Options of createTagInput

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `value` | `readonly string[]` | `false` | — |
| `name` | `string` | `false` | — |
| `onValueChange` | `(values: string[]) => void` | `false` | — |
| `getRemoveLabel` | `(tag: string) => string` | `false` | — |
| `requiredMessage` | `string` | `false` | — |

`createTagInput(root, options)` enhances an element with the class `hw-tag-input`; `enhance()` does so for `data-hw="tag-input"`. The markup is the API: inside the root write a `ul` with `data-hw-tags`, which the controller fills with the tags, and a native text input with `data-hw-tag-input`; the label and the hint stay outside the root, in the element with the class `hw-field`. `getRemoveLabel` is required text, given as the option or as the attribute `data-hw-remove-label`, in which the placeholder {tag} stands for the tag. `value` sets the initial tags, otherwise the root reads `data-hw-value` as a JSON array of strings; `name` is the form field name, otherwise the root reads `data-hw-name`, otherwise the `name` of the input, which the controller then removes from the input and writes on one hidden input for each tag. `requiredMessage` is required when the input is `required`: the controller removes the native attribute, sets `aria-required` and applies the constraint as custom validity. `onValueChange` receives the array of tags, and the same change is dispatched as `hw:change` on the root. The returned object holds the current tags in `value`, and offers one function to add a tag, one to remove a tag and one to remove the enhancement.

### React

Table: Props of TagInput

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `value` | `readonly string[]` | `false` | — |
| `defaultValue` | `readonly string[]` | `false` | `[]` |
| `onValueChange` | `(value: string[]) => void` | `false` | — |
| `getRemoveLabel` | `(tag: string) => string` | `true` | — |
| `label` | `ReactNode` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |
| `required` | `boolean` | `false` | — |
| `requiredMessage` | `string` | `false` | — |

`getRemoveLabel` is required, because the component contains no words of its own; it returns the accessible name of the remove button of a tag. `value` with `onValueChange` makes the field controlled, and `defaultValue` leaves it uncontrolled; both are arrays of strings. `label`, `hint` and `error` are renderable content. `name` is written on one hidden input for each committed tag, and `form` attaches them to a form elsewhere. `required` needs `requiredMessage`, the requirement is explained in the hint, and it is met only by committed tags: the native attribute is not written on the text input, which carries `aria-required` instead. The other props of a native input, including `placeholder`, `disabled`, `readOnly` and `ref`, reach the text input, and the ref reaches the input, not the tags.

### Vue

Table: Props, events and slots of TagInput

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `requiredMessage` | prop | `string` | `false` | — |
| `getRemoveLabel` | prop | `(tag: string) => string` | `true` | — |
| `modelValue` | prop | `readonly string[]` | `false` | — |
| `defaultValue` | prop | `readonly string[]` | `false` | — |
| `disabled` | prop | `boolean` | `false` | `false` |
| `readonly` | prop | `boolean` | `false` | `false` |
| `label` | prop | `string` | `false` | — |
| `hint` | prop | `string` | `false` | — |
| `error` | prop | `string` | `false` | — |
| `required` | prop | `boolean` | `false` | — |
| `update:modelValue` | event | `(value: readonly string[]) => void` | `false` | — |

`v-model` binds the array of tags, and `defaultValue` sets the initial tags of an uncontrolled field. `getRemoveLabel` is required and returns the accessible name of the remove button of a tag. `required` needs `requiredMessage`; the constraint is met only by committed tags, so explain it in `hint`. `disabled` and `readonly` are booleans, and the remove buttons are disabled while either is set. The other attributes, such as `name` and `placeholder`, reach the component; `name` is written on one hidden input for each tag. The table lists no slot because the published build reads none.

### Angular

Table: Inputs, outputs and content of hw-tag-input

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `controlId` | input | `string \| null \| undefined` | `false` | — |
| `label` | input | `string` | `false` | `''` |
| `name` | input | `string` | `false` | `''` |
| `hint` | input | `string` | `false` | `''` |
| `error` | input | `string` | `false` | `''` |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `aria-invalid` | input | `boolean` | `false` | `false` |
| `form` | input | `string \| null` | `false` | `null` |
| `required` | input | `boolean` | `false` | — |
| `disabled` | input | `boolean` | `false` | `false` |
| `value` | input | `string[]` | `false` | `[]` |
| `readOnly` | input | `boolean` | `false` | `false` |
| `placeholder` | input | `string` | `false` | `''` |
| `getRemoveLabel` | input | `(tag: string) => string` | `true` | — |
| `requiredMessage` | input | `string` | `false` | `''` |
| `valueChange` | output | `string[]` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |

`HwTagInputComponent` (`hw-tag-input`) renders the field, the label, the list of tags, the text input, the hint and the error, and it works as a form control through its value accessor with a `string[]` value. `getRemoveLabel` is required and is bound to a field of the component class. `requiredMessage` is required with `required`. `valueChange` emits the new array of tags. `focused` and `blurred` fire on the native focus and blur of the text input. `aria-label` and `aria-labelledby` name the input when `label` is not given. `name` is written on one hidden input for each tag, which sits in the list item of the tag.

## Accessibility

The text input is a native input element, so the browser provides its role and its text editing. The tags are the items of a list, and each remove button is a native `button` named by `getRemoveLabel`. The label is a native `label` whose `for` names the input, and the hint and the error describe it.

Table: Keyboard interaction of TagInput

| Key | Action |
| --- | --- |
| <kbd>Enter</kbd> | Commits the trimmed text of the input as a tag when it is not empty and not already a tag; on a focused remove button, removes that tag. |
| <kbd>Backspace</kbd> | When the text input is empty, removes the last tag and keeps focus in the input. |
| <kbd>Space</kbd> | On a focused remove button, removes that tag. |
| <kbd>Tab</kbd>, <kbd>Shift</kbd> + <kbd>Tab</kbd> | Moves focus between the remove buttons and the text input in reading order. |

- A comma also commits the text of the input. The component has no Add button.
- The commit and <kbd>Backspace</kbd> do nothing while the Control, Alt or Meta key is held, while text is being composed with an input method editor, or when the application has prevented the key event. An empty <kbd>Enter</kbd> is left to the form that owns the field.
- Activating a remove button moves focus to the remove button of the next tag, else of the previous tag, else to the text input.
- Only committed tags satisfy a required field and are submitted; an uncommitted draft does not. The custom validity belongs to the text input, which exposes `aria-required`.
- After a failed submission the text input is marked `aria-invalid="true"` until a valid state is reached or the form is reset.
- Read-only and disabled fields render the remove buttons disabled, and neither adds nor removes a tag, including a field inside a disabled fieldset.
- A form reset restores the initial tags, empties the draft and notifies once when the tags changed.

## RTL and localisation

TagInput has no built-in text: the label, the hint, the error, the placeholder, `getRemoveLabel` and `requiredMessage` are written by the application in the language of the page. The field follows the direction of the page, and the packaged styles use logical properties.

- A tag is the text the reader typed; the component does not translate, change the case of or reorder it, and the submitted value is the trimmed text.
- Write `getRemoveLabel` so that the accessible name states the action and the tag in the language of the page, with the tag where the grammar requires it, for example with the placeholder {tag} in the vanilla attribute.
- The keys that commit a tag and remove the last one do not depend on the reading direction.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of TagInput; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- TagInput is listed among the additional controls of the component scope in the [coverage notes](../coverage.md).
- The commit keys, the removal of the last tag, the focus that follows a removal, the required rule for committed tags and the reset behaviour are the Hawiyah behaviour recorded in the [interaction note](../tag-input-interaction.md). That note states that these are verified browser and input contracts, not requirements inferred from the design source.
