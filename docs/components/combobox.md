# Combobox

Combobox is an editable single-selection control: the reader types to filter a list of options and commits one of them, and the form receives the value of the committed option, not the typed text. The options are supplied by the application and are held locally.

## Example

A combobox has a visible label that names the information requested. The reader types to filter the options, moves through them with the arrow keys and commits one with <kbd>Enter</kbd>; typed text that matches no option is not a value. The component contains no text of its own: the application supplies the results message that it announces, and the React, Vue and Angular adapters also take the message that the list shows when no option matches.

```html live example=basic static differences=combobox-adapter-markup
<div class="hw-field">
  <label class="hw-label" for="basic" id="basic-label">Document type</label>
  <div class="hw-combobox" data-hw="combobox" data-hw-results-message="{count} results">
    <input class="hw-input" id="basic" type="text" data-hw-combobox-input autocomplete="off">
    <input type="hidden" name="document-type" value="" data-hw-combobox-value>
    <ul class="hw-listbox" data-hw-combobox-list aria-labelledby="basic-label" hidden>
      <li class="hw-option" id="basic-option-0" role="option" aria-selected="false" data-hw-value="birth">Birth certificate</li>
      <li class="hw-option" id="basic-option-1" role="option" aria-selected="false" data-hw-value="residence">Residence certificate</li>
      <li class="hw-option" id="basic-option-2" role="option" aria-selected="false" data-hw-value="employment">Employment letter</li>
      <li class="hw-option" id="basic-option-3" role="option" aria-selected="false" aria-disabled="true" data-hw-value="tax">Tax statement</li>
    </ul>
    <span class="hw-sr-only" data-hw-combobox-status role="status"></span>
  </div>
</div>
```

```tsx live example=basic
<Combobox
  label="Document type"
  name="document-type"
  options={[{ value: 'birth', label: 'Birth certificate' }, { value: 'residence', label: 'Residence certificate' }, { value: 'employment', label: 'Employment letter' }, { value: 'tax', label: 'Tax statement', disabled: true }]}
  emptyMessage="No matching document type."
  getResultsMessage={(count) => count + ' results'}
/>
```

```vue live example=basic
<Combobox
  label="Document type"
  name="document-type"
  :options="[{ value: 'birth', label: 'Birth certificate' }, { value: 'residence', label: 'Residence certificate' }, { value: 'employment', label: 'Employment letter' }, { value: 'tax', label: 'Tax statement', disabled: true }]"
  empty-message="No matching document type."
  :get-results-message="(count) => count + ' results'"
/>
```

```ts live example=basic framework=angular
import { Component } from '@angular/core';
import { HwComboboxComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwComboboxComponent],
  template: `
    <hw-combobox
      label="Document type"
      name="document-type"
      controlId="basic"
      [options]="options"
      emptyMessage="No matching document type."
      [getResultsMessage]="resultsMessage"
    />
  `,
})
export class ExampleComponent {
  readonly options = [
    { value: 'birth', label: 'Birth certificate' },
    { value: 'residence', label: 'Residence certificate' },
    { value: 'employment', label: 'Employment letter' },
    { value: 'tax', label: 'Tax statement', disabled: true },
  ];
  readonly resultsMessage = (count: number) => count + ' results';
}
```

## Variants and states

### Selected value and hint

A committed value is shown as the text of the input, and the hint states what the reader chooses. `defaultValue` sets the initial selection of an uncontrolled combobox in React and Vue, and `value` does so in Angular.

```html live example=selected static differences=combobox-adapter-markup
<div class="hw-field">
  <label class="hw-label" for="selected" id="selected-label">Document type</label>
  <div class="hw-combobox" data-hw="combobox" data-hw-results-message="{count} results">
    <input class="hw-input" id="selected" type="text" data-hw-combobox-input autocomplete="off" value="Residence certificate" aria-describedby="selected-hint">
    <input type="hidden" name="document-type" value="residence" data-hw-combobox-value>
    <ul class="hw-listbox" data-hw-combobox-list aria-labelledby="selected-label" hidden>
      <li class="hw-option" id="selected-option-0" role="option" aria-selected="false" data-hw-value="birth">Birth certificate</li>
      <li class="hw-option" id="selected-option-1" role="option" aria-selected="true" data-hw-value="residence">Residence certificate</li>
      <li class="hw-option" id="selected-option-2" role="option" aria-selected="false" data-hw-value="employment">Employment letter</li>
      <li class="hw-option" id="selected-option-3" role="option" aria-selected="false" aria-disabled="true" data-hw-value="tax">Tax statement</li>
    </ul>
    <span class="hw-sr-only" data-hw-combobox-status role="status"></span>
  </div>
  <p class="hw-hint" id="selected-hint">Choose the document that the request concerns.</p>
</div>
```

```tsx live example=selected
<Combobox
  label="Document type"
  name="document-type"
  options={[{ value: 'birth', label: 'Birth certificate' }, { value: 'residence', label: 'Residence certificate' }, { value: 'employment', label: 'Employment letter' }, { value: 'tax', label: 'Tax statement', disabled: true }]}
  emptyMessage="No matching document type."
  getResultsMessage={(count) => count + ' results'}
  hint="Choose the document that the request concerns."
  defaultValue="residence"
/>
```

```vue live example=selected
<Combobox
  label="Document type"
  name="document-type"
  :options="[{ value: 'birth', label: 'Birth certificate' }, { value: 'residence', label: 'Residence certificate' }, { value: 'employment', label: 'Employment letter' }, { value: 'tax', label: 'Tax statement', disabled: true }]"
  empty-message="No matching document type."
  :get-results-message="(count) => count + ' results'"
  hint="Choose the document that the request concerns."
  default-value="residence"
/>
```

```ts live example=selected framework=angular
import { Component } from '@angular/core';
import { HwComboboxComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwComboboxComponent],
  template: `
    <hw-combobox
      label="Document type"
      name="document-type"
      controlId="selected"
      [options]="options"
      emptyMessage="No matching document type."
      [getResultsMessage]="resultsMessage"
      hint="Choose the document that the request concerns."
      value="residence"
    />
  `,
})
export class ExampleComponent {
  readonly options = [
    { value: 'birth', label: 'Birth certificate' },
    { value: 'residence', label: 'Residence certificate' },
    { value: 'employment', label: 'Employment letter' },
    { value: 'tax', label: 'Tax statement', disabled: true },
  ];
  readonly resultsMessage = (count: number) => count + ' results';
}
```

### Error

An error is shown in a paragraph after the control, and the input is marked with `aria-invalid="true"` and described by the message. The message states what is wrong and how to correct it.

```html live example=error static differences=combobox-adapter-markup
<div class="hw-field">
  <label class="hw-label" for="error" id="error-label">Document type</label>
  <div class="hw-combobox" data-hw="combobox" data-hw-results-message="{count} results">
    <input class="hw-input" id="error" type="text" data-hw-combobox-input autocomplete="off" aria-describedby="error-error" aria-invalid="true">
    <input type="hidden" name="document-type" value="" data-hw-combobox-value>
    <ul class="hw-listbox" data-hw-combobox-list aria-labelledby="error-label" hidden>
      <li class="hw-option" id="error-option-0" role="option" aria-selected="false" data-hw-value="birth">Birth certificate</li>
      <li class="hw-option" id="error-option-1" role="option" aria-selected="false" data-hw-value="residence">Residence certificate</li>
      <li class="hw-option" id="error-option-2" role="option" aria-selected="false" data-hw-value="employment">Employment letter</li>
      <li class="hw-option" id="error-option-3" role="option" aria-selected="false" aria-disabled="true" data-hw-value="tax">Tax statement</li>
    </ul>
    <span class="hw-sr-only" data-hw-combobox-status role="status"></span>
  </div>
  <p class="hw-error" id="error-error">Select a document type from the list.</p>
</div>
```

```tsx live example=error
<Combobox
  label="Document type"
  name="document-type"
  options={[{ value: 'birth', label: 'Birth certificate' }, { value: 'residence', label: 'Residence certificate' }, { value: 'employment', label: 'Employment letter' }, { value: 'tax', label: 'Tax statement', disabled: true }]}
  emptyMessage="No matching document type."
  getResultsMessage={(count) => count + ' results'}
  error="Select a document type from the list."
/>
```

```vue live example=error
<Combobox
  label="Document type"
  name="document-type"
  :options="[{ value: 'birth', label: 'Birth certificate' }, { value: 'residence', label: 'Residence certificate' }, { value: 'employment', label: 'Employment letter' }, { value: 'tax', label: 'Tax statement', disabled: true }]"
  empty-message="No matching document type."
  :get-results-message="(count) => count + ' results'"
  error="Select a document type from the list."
/>
```

```ts live example=error framework=angular
import { Component } from '@angular/core';
import { HwComboboxComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwComboboxComponent],
  template: `
    <hw-combobox
      label="Document type"
      name="document-type"
      controlId="error"
      [options]="options"
      emptyMessage="No matching document type."
      [getResultsMessage]="resultsMessage"
      error="Select a document type from the list."
    />
  `,
})
export class ExampleComponent {
  readonly options = [
    { value: 'birth', label: 'Birth certificate' },
    { value: 'residence', label: 'Residence certificate' },
    { value: 'employment', label: 'Employment letter' },
    { value: 'tax', label: 'Tax statement', disabled: true },
  ];
  readonly resultsMessage = (count: number) => count + ' results';
}
```

### Read only

A read-only combobox keeps its selection in the form and stays focusable, but it never opens and does not change.

```html live example=readonly static differences=combobox-adapter-markup
<div class="hw-field">
  <label class="hw-label" for="readonly" id="readonly-label">Document type</label>
  <div class="hw-combobox" data-hw="combobox" data-hw-results-message="{count} results">
    <input class="hw-input" id="readonly" type="text" data-hw-combobox-input autocomplete="off" value="Birth certificate" readonly>
    <input type="hidden" name="document-type" value="birth" data-hw-combobox-value>
    <ul class="hw-listbox" data-hw-combobox-list aria-labelledby="readonly-label" hidden>
      <li class="hw-option" id="readonly-option-0" role="option" aria-selected="true" data-hw-value="birth">Birth certificate</li>
      <li class="hw-option" id="readonly-option-1" role="option" aria-selected="false" data-hw-value="residence">Residence certificate</li>
      <li class="hw-option" id="readonly-option-2" role="option" aria-selected="false" data-hw-value="employment">Employment letter</li>
      <li class="hw-option" id="readonly-option-3" role="option" aria-selected="false" aria-disabled="true" data-hw-value="tax">Tax statement</li>
    </ul>
    <span class="hw-sr-only" data-hw-combobox-status role="status"></span>
  </div>
</div>
```

```tsx live example=readonly
<Combobox
  label="Document type"
  name="document-type"
  options={[{ value: 'birth', label: 'Birth certificate' }, { value: 'residence', label: 'Residence certificate' }, { value: 'employment', label: 'Employment letter' }, { value: 'tax', label: 'Tax statement', disabled: true }]}
  emptyMessage="No matching document type."
  getResultsMessage={(count) => count + ' results'}
  defaultValue="birth"
  readOnly
/>
```

```vue live example=readonly
<Combobox
  label="Document type"
  name="document-type"
  :options="[{ value: 'birth', label: 'Birth certificate' }, { value: 'residence', label: 'Residence certificate' }, { value: 'employment', label: 'Employment letter' }, { value: 'tax', label: 'Tax statement', disabled: true }]"
  empty-message="No matching document type."
  :get-results-message="(count) => count + ' results'"
  default-value="birth"
  readonly
/>
```

```ts live example=readonly framework=angular
import { Component } from '@angular/core';
import { HwComboboxComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwComboboxComponent],
  template: `
    <hw-combobox
      label="Document type"
      name="document-type"
      controlId="readonly"
      [options]="options"
      emptyMessage="No matching document type."
      [getResultsMessage]="resultsMessage"
      value="birth"
      [readOnly]="true"
    />
  `,
})
export class ExampleComponent {
  readonly options = [
    { value: 'birth', label: 'Birth certificate' },
    { value: 'residence', label: 'Residence certificate' },
    { value: 'employment', label: 'Employment letter' },
    { value: 'tax', label: 'Tax statement', disabled: true },
  ];
  readonly resultsMessage = (count: number) => count + ' results';
}
```

## API

### JavaScript

Table: Options of createCombobox

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `value` | `string` | `false` | — |
| `onValueChange` | `(value: string) => void` | `false` | — |
| `getResultsMessage` | `(count: number) => string` | `false` | — |
| `requiredMessage` | `string` | `false` | — |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |
| `onQueryChange` | `(query: string) => void` | `false` | — |

`createCombobox(root, options)` enhances an element with the class `hw-combobox`; `enhance()` does so for `data-hw="combobox"`. The markup is the API: inside the root write a native input with `data-hw-combobox-input`, a hidden input with `data-hw-combobox-value` that carries the `name` of the form field, a `ul` with `data-hw-combobox-list` whose items carry a unique non-empty `data-hw-value` (an item with `aria-disabled="true"` cannot be committed), and, optionally, a status element with `data-hw-combobox-status`. Write the `hw-field` label, hint and error around the root, not inside it, so that the list opens directly under the input. `getResultsMessage` is required text, given as the option or as the attribute `data-hw-results-message`, in which the placeholder {count} stands for the number of results; `requiredMessage` is required when the input is `required`. `value` sets the initial selection. `onValueChange`, `onOpenChange` and `onQueryChange` are called for the reader's actions, and the same changes are dispatched as `hw:change` on the root with a detail of the new value with its label, the open state or the query text; test whether the detail holds a value before reading it. The controller has no option for an empty-list message in 0.3.0. The returned object has `value`, `open`, `select`, `show`, `close` and `destroy`.

### React

Table: Props of Combobox

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `options` | `readonly Option[]` | `true` | — |
| `value` | `string` | `false` | — |
| `defaultValue` | `string` | `false` | — |
| `onValueChange` | `(value: string, option?: Option) => void` | `false` | — |
| `onQueryChange` | `(query: string) => void` | `false` | — |
| `open` | `boolean` | `false` | — |
| `defaultOpen` | `boolean` | `false` | — |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |
| `emptyMessage` | `string` | `true` | — |
| `getResultsMessage` | `(count: number) => string` | `true` | — |
| `label` | `ReactNode` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |
| `required` | `boolean` | `false` | — |
| `requiredMessage` | `string` | `false` | — |

`options` and the two texts `emptyMessage` and `getResultsMessage` are required, because the component contains no words of its own. Each option has a `value`, a `label` and, optionally, `disabled`. `value` with `onValueChange` makes the combobox controlled: apply `onValueChange`, including its empty string when the reader edits the selection; `defaultValue` leaves it uncontrolled. `onQueryChange` receives the typed text only, never a selection, a reset or an application write. `open`, `defaultOpen` and `onOpenChange` control the list, and `onOpenChange` reports the reader's actions only. `label`, `hint` and `error` are renderable content and are placed in a surrounding field; `required` needs `requiredMessage`. `name` belongs to a hidden input that holds the selected value. The other props of a native input, including `form`, `disabled`, `readOnly` and `ref`, reach the text input. Without `label`, give the input an accessible name with `aria-label` or `aria-labelledby`.

### Vue

Table: Props, events and slots of Combobox

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `options` | prop | `readonly Option[]` | `true` | — |
| `modelValue` | prop | `string` | `false` | — |
| `defaultValue` | prop | `string` | `false` | `''` |
| `disabled` | prop | `boolean` | `false` | `false` |
| `readonly` | prop | `boolean` | `false` | `false` |
| `open` | prop | `boolean` | `false` | — |
| `defaultOpen` | prop | `boolean` | `false` | `false` |
| `emptyMessage` | prop | `string` | `true` | — |
| `getResultsMessage` | prop | `(count: number) => string` | `true` | — |
| `requiredMessage` | prop | `string` | `false` | — |
| `label` | prop | `string` | `false` | — |
| `hint` | prop | `string` | `false` | — |
| `error` | prop | `string` | `false` | — |
| `required` | prop | `boolean` | `false` | — |
| `update:modelValue` | event | `(value: string) => void` | `false` | — |
| `update:open` | event | `(open: boolean) => void` | `false` | — |
| `update:query` | event | `(query: string) => void` | `false` | — |

`v-model` binds the selected value as a string, and `defaultValue` sets the initial value of an uncontrolled combobox. `options`, `emptyMessage` and `getResultsMessage` are required, and `requiredMessage` is needed when `required` is set. `disabled` and `readonly` are booleans, and a read-only or disabled combobox never opens. `v-model` with the argument `open` binds the state of the list (`update:open`), and `open` is controlled whenever it is not `undefined`; `defaultOpen` sets the initial state. `update:query` is emitted for typed text only. `show()` and `close()` are exposed through a template ref. The table lists no slot because the published build reads none. `name` is attached to a hidden input that holds the selected value, and the other attributes, such as `placeholder`, reach the native input.

### Angular

Table: Inputs, outputs and content of hw-combobox

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
| `value` | input | `string` | `false` | `''` |
| `readOnly` | input | `boolean` | `false` | `false` |
| `options` | input | `readonly Option[]` | `false` | `[]` |
| `placeholder` | input | `string` | `false` | `''` |
| `emptyMessage` | input | `string` | `true` | — |
| `requiredMessage` | input | `string` | `false` | `''` |
| `getResultsMessage` | input | `(count: number) => string` | `true` | — |
| `open` | input | `boolean` | `false` | `false` |
| `valueChange` | output | `string` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |
| `openChange` | output | `boolean` | `false` | — |
| `queryChange` | output | `string` | `false` | — |

`HwComboboxComponent` (`hw-combobox`) renders the field, the label, the native input, the hidden input, the list, the status, the hint and the error, and it works as a form control through its value accessor. `emptyMessage` and `getResultsMessage` are required, and `requiredMessage` is required with `required`. A function input, such as `getResultsMessage`, is bound to a field of the component class. `[(open)]` binds the state of the list: a value written once is the initial state, and `openChange` is emitted for the reader's actions and for a reset that closed the list, never when the application changes `open`. `queryChange` emits the text of every accepted input event; a selection, a reset and an application write do not emit it, and `valueChange` is emitted only when the selected value changed. `aria-label` and `aria-labelledby` name the input and the list. `controlId` sets the id of the input, and the list takes that id followed by -listbox. Hint and error stay outside the element with the class `hw-combobox`, because the list is positioned against it.

## Accessibility

The input has the role combobox, declares a list of suggestions with `aria-autocomplete`, refers to the list with `aria-controls` and to the active option with `aria-activedescendant`, so focus stays in the input while the options are traversed. `aria-expanded` reports whether the list is open. The label is a native `label` whose `for` names the input, and the list takes its name from the label, or from `aria-label` or `aria-labelledby`. The hint and the error describe the input.

Table: Keyboard interaction of Combobox

| Key | Action |
| --- | --- |
| <kbd>Down Arrow</kbd>, <kbd>Up Arrow</kbd> | Opens a closed list, then moves the active option to the next or the previous enabled option; the keys act the same in both reading directions. |
| <kbd>Home</kbd>, <kbd>End</kbd> | In an open list, moves the active option to the first or the last enabled option. |
| <kbd>Enter</kbd> | Commits the active enabled option and closes the list. |
| <kbd>Escape</kbd> | Closes the open list without committing and without leaving the input. |
| <kbd>Tab</kbd> | Closes the list without selecting and moves focus on. |

- Typing opens the list, filters the options and clears the committed selection; the form receives no value until an option is committed again. Arbitrary text never becomes a submitted value.
- A pointer click on an option commits it and returns focus to the input. Focus on the input and a click on it open the list.
- Disabled options are skipped by the arrow keys and cannot be committed.
- A live region announces the number of results with `getResultsMessage` while the list is open. In React, Vue and Angular the list shows `emptyMessage` when no option matches; the vanilla controller has no such text and leaves the list empty.
- Blur keeps the typed text and does not select an option silently. A required combobox with unmatched text fails native validation, with `requiredMessage` as its message.
- After a failed submission the input is marked `aria-invalid="true"` until a valid option is committed or the form is reset.
- Composition input (an input method editor) is preserved in every adapter, and modified editing shortcuts are preserved in the vanilla controller and in Angular. A combobox inside a native dialog consumes <kbd>Escape</kbd> before the dialog is dismissed.
- A read-only combobox sets `aria-readonly="true"`, never opens, and keeps its submitted value; a disabled one is removed from the form.

## RTL and localisation

The combobox has no built-in text: the label, the hint, the error, the placeholder, `emptyMessage`, `getResultsMessage` and `requiredMessage` are written by the application in the language of the page. The element follows the direction of the page, and the packaged styles use logical properties.

- Searching folds letter case, Arabic diacritics and the variants of alef, so that a query typed without them still matches; the labels and the stored values are not changed.
- The option `value` is a machine value and is not translated, while the `label` is the text the reader sees and searches.
- The arrow keys are vertical and act the same in a right-to-left page.
- Write the results message in the language of the page, using the count, for example with the placeholder {count} in the vanilla attribute.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Combobox; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- Combobox is listed among the initial controls of the component scope in the [coverage notes](../coverage.md), as an interactive component whose keyboard behaviour and lifecycle Hawiyah implements itself.
- The active-descendant focus and the manual selection of the combobox are informed by the combobox pattern of WAI-ARIA Authoring Practices, as the README of the vanilla package states.
- The input appearance of the supplied Platforms Code style sheet is mapped in the [input notes](../nic-inputs.md); the list and the options are Hawiyah's own composition and have no counterpart in those notes.
- The read-only and disabled behaviour is recorded in the [read-only note](../combobox-readonly.md).
