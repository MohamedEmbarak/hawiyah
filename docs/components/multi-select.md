# MultiSelect

MultiSelect is a labelled group of native checkboxes with a filter field, for choosing several values from a list. Filtering hides options without removing the values already selected, and every selected value is submitted with the form.

## Example

A group has a visible label that names the information requested and a filter field with its own visible label. The reader filters the list by typing and ticks the options that apply; the component contains no text of its own, so the application supplies the label of the filter field and the results message, and the React, Vue and Angular adapters also take the message that the list shows when no option matches.

```html live example=basic static differences=multi-select-adapter-markup
<fieldset class="hw-field hw-multi-select" data-hw="multi-select" data-hw-results-message="{count} results">
  <legend class="hw-label">Documents to attach</legend>
  <label class="hw-label" for="basic-search">Filter documents</label>
  <input class="hw-input" id="basic-search" type="search" data-hw-multiselect-search>
  <div class="hw-multi-select-options">
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="documents" value="birth">Birth certificate</label>
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="documents" value="residence">Residence certificate</label>
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="documents" value="employment">Employment letter</label>
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="documents" value="tax" disabled>Tax statement</label>
  </div>
  <span class="hw-sr-only" data-hw-status></span>
</fieldset>
```

```tsx live example=basic
<MultiSelect
  label="Documents to attach"
  name="documents"
  searchLabel="Filter documents"
  emptyMessage="No matching document."
  options={[{ value: 'birth', label: 'Birth certificate' }, { value: 'residence', label: 'Residence certificate' }, { value: 'employment', label: 'Employment letter' }, { value: 'tax', label: 'Tax statement', disabled: true }]}
  getResultsMessage={(count) => count + ' results'}
/>
```

```vue live example=basic
<MultiSelect
  label="Documents to attach"
  name="documents"
  search-label="Filter documents"
  empty-message="No matching document."
  :options="[{ value: 'birth', label: 'Birth certificate' }, { value: 'residence', label: 'Residence certificate' }, { value: 'employment', label: 'Employment letter' }, { value: 'tax', label: 'Tax statement', disabled: true }]"
  :get-results-message="(count) => count + ' results'"
/>
```

```ts live example=basic framework=angular
import { Component } from '@angular/core';
import { HwMultiSelectComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwMultiSelectComponent],
  template: `
    <hw-multi-select
      label="Documents to attach"
      name="documents"
      searchLabel="Filter documents"
      emptyMessage="No matching document."
      [options]="options"
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

### Selected values and hint

`defaultValue` sets the initial selection of an uncontrolled group in React and Vue, and `value` does so in Angular. The hint states the choice the reader makes, and the optional `getSelectedMessage` shows the number of selected options in a paragraph after the list.

```html live example=selected static differences=multi-select-adapter-markup
<fieldset class="hw-field hw-multi-select" data-hw="multi-select" data-hw-results-message="{count} results" data-hw-selected-message="{count} selected" aria-describedby="selected-hint">
  <legend class="hw-label">Documents to attach</legend>
  <label class="hw-label" for="selected-search">Filter documents</label>
  <input class="hw-input" id="selected-search" type="search" data-hw-multiselect-search aria-describedby="selected-hint">
  <div class="hw-multi-select-options">
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="documents" value="birth" checked>Birth certificate</label>
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="documents" value="residence">Residence certificate</label>
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="documents" value="employment" checked>Employment letter</label>
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="documents" value="tax" disabled>Tax statement</label>
  </div>
  <span class="hw-sr-only" data-hw-status></span>
  <p role="status" data-hw-selected-status></p>
  <p class="hw-hint" id="selected-hint">Choose every document that you will attach to the request.</p>
</fieldset>
```

```tsx live example=selected
<MultiSelect
  label="Documents to attach"
  name="documents"
  searchLabel="Filter documents"
  emptyMessage="No matching document."
  options={[{ value: 'birth', label: 'Birth certificate' }, { value: 'residence', label: 'Residence certificate' }, { value: 'employment', label: 'Employment letter' }, { value: 'tax', label: 'Tax statement', disabled: true }]}
  getResultsMessage={(count) => count + ' results'}
  hint="Choose every document that you will attach to the request."
  defaultValue={['birth', 'employment']}
  getSelectedMessage={(count) => count + ' selected'}
/>
```

```vue live example=selected
<MultiSelect
  label="Documents to attach"
  name="documents"
  search-label="Filter documents"
  empty-message="No matching document."
  :options="[{ value: 'birth', label: 'Birth certificate' }, { value: 'residence', label: 'Residence certificate' }, { value: 'employment', label: 'Employment letter' }, { value: 'tax', label: 'Tax statement', disabled: true }]"
  :get-results-message="(count) => count + ' results'"
  hint="Choose every document that you will attach to the request."
  :default-value="['birth', 'employment']"
  :get-selected-message="(count) => count + ' selected'"
/>
```

```ts live example=selected framework=angular
import { Component } from '@angular/core';
import { HwMultiSelectComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwMultiSelectComponent],
  template: `
    <hw-multi-select
      label="Documents to attach"
      name="documents"
      searchLabel="Filter documents"
      emptyMessage="No matching document."
      [options]="options"
      [getResultsMessage]="resultsMessage"
      hint="Choose every document that you will attach to the request."
      [value]="['birth', 'employment']"
      [getSelectedMessage]="selectedMessage"
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
  readonly selectedMessage = (count: number) => count + ' selected';
}
```

### Error

An error is shown in a paragraph at the end of the group, inside the fieldset, and the fieldset and the filter input are marked with `aria-invalid="true"`. The message states what is wrong and how to correct it.

```html live example=error static differences=multi-select-adapter-markup
<fieldset class="hw-field hw-multi-select" data-hw="multi-select" data-hw-results-message="{count} results" aria-invalid="true" aria-describedby="error-error">
  <legend class="hw-label">Documents to attach</legend>
  <label class="hw-label" for="error-search">Filter documents</label>
  <input class="hw-input" id="error-search" type="search" data-hw-multiselect-search aria-describedby="error-error" aria-invalid="true">
  <div class="hw-multi-select-options">
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="documents" value="birth">Birth certificate</label>
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="documents" value="residence">Residence certificate</label>
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="documents" value="employment">Employment letter</label>
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="documents" value="tax" disabled>Tax statement</label>
  </div>
  <span class="hw-sr-only" data-hw-status></span>
  <p class="hw-error" id="error-error">Choose at least one document.</p>
</fieldset>
```

```tsx live example=error
<MultiSelect
  label="Documents to attach"
  name="documents"
  searchLabel="Filter documents"
  emptyMessage="No matching document."
  options={[{ value: 'birth', label: 'Birth certificate' }, { value: 'residence', label: 'Residence certificate' }, { value: 'employment', label: 'Employment letter' }, { value: 'tax', label: 'Tax statement', disabled: true }]}
  getResultsMessage={(count) => count + ' results'}
  error="Choose at least one document."
/>
```

```vue live example=error
<MultiSelect
  label="Documents to attach"
  name="documents"
  search-label="Filter documents"
  empty-message="No matching document."
  :options="[{ value: 'birth', label: 'Birth certificate' }, { value: 'residence', label: 'Residence certificate' }, { value: 'employment', label: 'Employment letter' }, { value: 'tax', label: 'Tax statement', disabled: true }]"
  :get-results-message="(count) => count + ' results'"
  error="Choose at least one document."
/>
```

```ts live example=error framework=angular
import { Component } from '@angular/core';
import { HwMultiSelectComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwMultiSelectComponent],
  template: `
    <hw-multi-select
      label="Documents to attach"
      name="documents"
      searchLabel="Filter documents"
      emptyMessage="No matching document."
      [options]="options"
      [getResultsMessage]="resultsMessage"
      error="Choose at least one document."
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

In a read-only group the checkboxes stay enabled and focusable, carry `aria-disabled="true"`, and ignore pointer and keyboard activation. The existing selection is still submitted, and the filter still works.

```html live example=readonly static differences=multi-select-adapter-markup
<fieldset class="hw-field hw-multi-select" data-hw="multi-select" data-hw-results-message="{count} results" data-hw-readonly="true">
  <legend class="hw-label">Documents to attach</legend>
  <label class="hw-label" for="readonly-search">Filter documents</label>
  <input class="hw-input" id="readonly-search" type="search" data-hw-multiselect-search>
  <div class="hw-multi-select-options">
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="documents" value="birth" aria-disabled="true">Birth certificate</label>
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="documents" value="residence" checked aria-disabled="true">Residence certificate</label>
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="documents" value="employment" aria-disabled="true">Employment letter</label>
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="documents" value="tax" disabled aria-disabled="true">Tax statement</label>
  </div>
  <span class="hw-sr-only" data-hw-status></span>
</fieldset>
```

```tsx live example=readonly
<MultiSelect
  label="Documents to attach"
  name="documents"
  searchLabel="Filter documents"
  emptyMessage="No matching document."
  options={[{ value: 'birth', label: 'Birth certificate' }, { value: 'residence', label: 'Residence certificate' }, { value: 'employment', label: 'Employment letter' }, { value: 'tax', label: 'Tax statement', disabled: true }]}
  getResultsMessage={(count) => count + ' results'}
  defaultValue={['residence']}
  readOnly
/>
```

```vue live example=readonly
<MultiSelect
  label="Documents to attach"
  name="documents"
  search-label="Filter documents"
  empty-message="No matching document."
  :options="[{ value: 'birth', label: 'Birth certificate' }, { value: 'residence', label: 'Residence certificate' }, { value: 'employment', label: 'Employment letter' }, { value: 'tax', label: 'Tax statement', disabled: true }]"
  :get-results-message="(count) => count + ' results'"
  :default-value="['residence']"
  readonly
/>
```

```ts live example=readonly framework=angular
import { Component } from '@angular/core';
import { HwMultiSelectComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwMultiSelectComponent],
  template: `
    <hw-multi-select
      label="Documents to attach"
      name="documents"
      searchLabel="Filter documents"
      emptyMessage="No matching document."
      [options]="options"
      [getResultsMessage]="resultsMessage"
      [value]="['residence']"
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

Table: Options of createMultiSelect

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `required` | `boolean` | `false` | — |
| `onValueChange` | `(values: string[]) => void` | `false` | — |
| `requiredMessage` | `string` | `false` | — |
| `getResultsMessage` | `(count: number) => string` | `false` | — |
| `getSelectedMessage` | `(count: number) => string` | `false` | — |

`createMultiSelect(root, options)` enhances a `fieldset` with the class `hw-multi-select`; `enhance()` does so for `data-hw="multi-select"`. The markup is the API: write a search input with `data-hw-multiselect-search` and, inside a `div` with the class `hw-multi-select-options`, one `label` with the class `hw-choice` and `data-hw-option` for each option, holding a native checkbox with the class `hw-checkbox`, its `name` and its `value`. The `legend` names the group and the filter input has its own visible `label`. `getResultsMessage` is required text, given as the option or as the attribute `data-hw-results-message`, in which the placeholder {count} stands for the number of options shown; the controller creates the polite status when none is written, and writes the count only after the reader filters. `getSelectedMessage` is optional and fills the element with `data-hw-selected-status`, from the attribute `data-hw-selected-message`. `required` and `requiredMessage` can be given as options; the root also reads `data-hw-required` and `data-hw-readonly`. `onValueChange` receives the array of selected values, and the same change is dispatched as `hw:change` on the root. The returned object has `value` and `destroy`. Vanilla markup has no empty-list message in 0.3.0, and the checkboxes themselves carry the form `name`.

### React

Table: Props of MultiSelect

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `options` | `readonly Option[]` | `true` | — |
| `value` | `readonly string[]` | `false` | — |
| `defaultValue` | `readonly string[]` | `false` | `[]` |
| `onValueChange` | `(value: string[]) => void` | `false` | — |
| `name` | `string` | `false` | — |
| `form` | `string` | `false` | — |
| `readOnly` | `boolean` | `false` | — |
| `searchLabel` | `string` | `true` | — |
| `placeholder` | `string` | `false` | — |
| `emptyMessage` | `string` | `true` | — |
| `getResultsMessage` | `(count: number) => string` | `true` | — |
| `getSelectedMessage` | `(count: number) => string` | `false` | — |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |
| `label` | `ReactNode` | `false` | — |
| `required` | `boolean` | `false` | — |
| `requiredMessage` | `string` | `false` | — |

`options`, `searchLabel`, `emptyMessage` and `getResultsMessage` are required, because the component contains no words of its own. `searchLabel` is the visible label of the filter input, not a placeholder, and `getResultsMessage` fills a polite status that stays empty until the reader filters. `value` with `onValueChange` makes the group controlled, and `defaultValue` leaves it uncontrolled; both are arrays of strings, and a value that is unknown or disabled is ignored for rendering and submission without rewriting the state of the application. `label` is rendered as the legend; without it, name the group with `aria-label` or `aria-labelledby`. `name` is written on one hidden input for each selected value, so the filtered-out selections are still submitted; `form` attaches them to a form elsewhere. `readOnly` keeps the checkboxes focusable and submitted. `required` needs `requiredMessage` and, as the constraint is not obvious, a hint that explains the minimum selection. `getSelectedMessage` renders a visible status paragraph.

### Vue

Table: Props, events and slots of MultiSelect

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `options` | prop | `readonly Option[]` | `true` | — |
| `searchLabel` | prop | `string` | `true` | — |
| `emptyMessage` | prop | `string` | `true` | — |
| `getResultsMessage` | prop | `(count: number) => string` | `true` | — |
| `getSelectedMessage` | prop | `(count: number) => string` | `false` | — |
| `requiredMessage` | prop | `string` | `false` | — |
| `modelValue` | prop | `readonly string[]` | `false` | — |
| `defaultValue` | prop | `readonly string[]` | `false` | — |
| `disabled` | prop | `boolean` | `false` | `false` |
| `readonly` | prop | `boolean` | `false` | `false` |
| `label` | prop | `string` | `false` | — |
| `hint` | prop | `string` | `false` | — |
| `error` | prop | `string` | `false` | — |
| `required` | prop | `boolean` | `false` | — |
| `update:modelValue` | event | `(value: readonly string[]) => void` | `false` | — |

`v-model` binds the array of selected values, and `defaultValue` sets the initial selection of an uncontrolled group. `options`, `searchLabel`, `emptyMessage` and `getResultsMessage` are required. `emptyMessage` is shown as a hint among the options when no option matches, and `getResultsMessage` fills a polite status that is empty until the reader filters. `getSelectedMessage` renders the visible status paragraph. `disabled` and `readonly` are booleans: read-only checkboxes stay focusable with `aria-disabled="true"`. `required` needs `requiredMessage`; explain the minimum selection in `hint`. The other attributes, such as `name`, reach the component, and `name` is written on repeated hidden inputs for the selected values. The table lists no slot because the published build reads none.

### Angular

Table: Inputs, outputs and content of hw-multi-select

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
| `options` | input | `readonly Option[]` | `false` | `[]` |
| `searchLabel` | input | `string` | `true` | — |
| `placeholder` | input | `string` | `false` | `''` |
| `emptyMessage` | input | `string` | `true` | — |
| `getSelectedMessage` | input | `(count: number) => string` | `false` | — |
| `getResultsMessage` | input | `(count: number) => string` | `true` | — |
| `requiredMessage` | input | `string` | `false` | `''` |
| `valueChange` | output | `string[]` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |

`HwMultiSelectComponent` (`hw-multi-select`) renders the fieldset, the legend, the filter, the checkboxes, the status, the hidden inputs, the hint and the error, and it works as a form control through its value accessor with a `string[]` value. `searchLabel`, `emptyMessage` and `getResultsMessage` are required; the status exists, empty, from the first render. `getSelectedMessage` is optional, and the paragraph with the selected count is rendered only with it. `requiredMessage` is required with `required`. A function input is bound to a field of the component class. `valueChange` emits the new array. `focused` and `blurred` fire when focus enters and leaves the fieldset; moving between two options emits nothing. `aria-label` and `aria-labelledby` name the group when `label` is not given. Selected values remain in the form data while the filter hides their checkboxes.

## Accessibility

MultiSelect is a native `fieldset` whose `legend` names the group, with native checkboxes inside it, so the browser provides the roles, the focus behaviour and the keyboard handling of its controls. It is not a combobox and has no popup. The filter input has its own visible `label`, and the status regions are polite live regions.

Table: Keyboard interaction of MultiSelect

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd> + <kbd>Tab</kbd> | Moves focus to the next or the previous control in the group: the filter input, then each visible enabled checkbox. |
| <kbd>Space</kbd> | Toggles the focused checkbox, unless the group is read only. |

- Filtering hides the options that do not match and announces the number of options shown with `getResultsMessage`; the announcement is empty until the reader filters. Search folds letter case and Arabic diacritics and alef variants.
- A selected option that the filter hides stays selected and is still submitted.
- Required selection needs at least one known, enabled selected option, and search text does not satisfy it. The custom validity belongs to the filter input, which exposes `aria-required`; the checkboxes carry no native `required`. The legend shows one marker for a required group, and the marker is hidden from assistive technology, so explain the minimum in the visible hint.
- After a failed submission, the filter input and the group are marked `aria-invalid="true"` until a valid selection is made or the form is reset.
- Disabled options are not selected by the reader, never satisfy a required selection and are not submitted.
- A read-only group keeps its checkboxes enabled and focusable with `aria-disabled="true"`; pointer and <kbd>Space</kbd> activation change nothing, filtering still works, and the existing selection is submitted.
- A form reset restores the initial selection, empties the filter and the status, and notifies once when the selection changed.

## RTL and localisation

MultiSelect has no built-in text: the legend, the filter label, the placeholder, `emptyMessage`, `getResultsMessage`, `getSelectedMessage` and `requiredMessage` are written by the application in the language of the page. The group follows the direction of the page, and the packaged styles use logical properties.

- Search folds letter case, Arabic diacritics and the variants of alef, so a query typed without them still matches; the labels and the submitted values are not changed.
- The option `value` is a machine value and is not translated, while the `label` is the text the reader sees and searches.
- Write the count messages in the language of the page, with the count placed where the grammar requires it, for example with the placeholder {count} in the vanilla attributes.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of MultiSelect; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- MultiSelect is listed among the additional controls of the component scope in the [coverage notes](../coverage.md).
- The selection and validation rules, the required selection that search text does not satisfy, the retained values while filtering and the read-only behaviour are the Hawiyah form contract of the [selection note](../multiselect-validation.md). That note states that the supplied Platforms Code styling evidence does not establish native validation behaviour.
- The checkbox rows use the `hw-choice` label that the [choice notes](../nic-choices.md) describe, together with the read-only checkbox behaviour recorded there: a read-only choice stays focusable and submits its value, and a guard stops activation.
