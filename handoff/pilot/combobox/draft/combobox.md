# Combobox

## Example

```html live example=service check=combobox-keyboard
<div class="hw-field">
  <label class="hw-label" id="service-type-label" for="service-type">Service type</label>
  <div class="hw-combobox" data-hw="combobox" data-hw-results-message="Matching options: {count}">
    <input id="service-type" class="hw-input" type="text" data-hw-combobox-input aria-labelledby="service-type-label" aria-describedby="service-type-hint">
    <input type="hidden" name="service" data-hw-combobox-value>
    <ul class="hw-listbox" id="service-type-listbox" data-hw-combobox-list hidden>
      <li class="hw-option" data-hw-value="building-permit">Building permit</li>
      <li class="hw-option" data-hw-value="business-licence">Business licence</li>
      <li class="hw-option" data-hw-value="commercial-registration">Commercial registration</li>
      <li class="hw-option" data-hw-value="residence-renewal">Residence renewal</li>
    </ul>
    <span class="hw-sr-only" id="service-type-status" data-hw-combobox-status role="status"></span>
  </div>
  <p class="hw-hint" id="service-type-hint">Start typing the name of a service.</p>
</div>
```

```tsx live example=service
<Combobox
  id="service-type"
  label="Service type"
  hint="Start typing the name of a service."
  name="service"
  emptyMessage="No service matches the text."
  getResultsMessage={(count) => `Matching options: ${count}`}
  options={[
    { value: 'building-permit', label: 'Building permit' },
    { value: 'business-licence', label: 'Business licence' },
    { value: 'commercial-registration', label: 'Commercial registration' },
    { value: 'residence-renewal', label: 'Residence renewal' },
  ]}
/>
```

```vue live example=service
<Combobox
  id="service-type"
  label="Service type"
  hint="Start typing the name of a service."
  name="service"
  empty-message="No service matches the text."
  :get-results-message="(count: number) => `Matching options: ${count}`"
  :options="[
    { value: 'building-permit', label: 'Building permit' },
    { value: 'business-licence', label: 'Business licence' },
    { value: 'commercial-registration', label: 'Commercial registration' },
    { value: 'residence-renewal', label: 'Residence renewal' },
  ]"
/>
```

```ts live example=service framework=angular
import { Component } from '@angular/core';
import { HwComboboxComponent } from '@hawiyah/angular';

@Component({
  imports: [HwComboboxComponent],
  template: `<hw-combobox
    controlId="service-type"
    label="Service type"
    hint="Start typing the name of a service."
    name="service"
    emptyMessage="No service matches the text."
    [getResultsMessage]="resultsMessage"
    [options]="options"
  />`,
})
export class ServiceTypeExample {
  readonly resultsMessage = (count: number) => `Matching options: ${count}`;
  readonly options = [
    { value: 'building-permit', label: 'Building permit' },
    { value: 'business-licence', label: 'Business licence' },
    { value: 'commercial-registration', label: 'Commercial registration' },
    { value: 'residence-renewal', label: 'Residence renewal' },
  ];
}
```

## Variants and states

### Filtering by typed text

```html live example=filter check=combobox-filter
<div class="hw-field">
  <label class="hw-label" id="document-type-label" for="document-type">Document type</label>
  <div class="hw-combobox" data-hw="combobox" data-hw-results-message="Matching options: {count}">
    <input id="document-type" class="hw-input" type="text" data-hw-combobox-input aria-labelledby="document-type-label" aria-describedby="document-type-hint">
    <input type="hidden" name="document" data-hw-combobox-value>
    <ul class="hw-listbox" id="document-type-listbox" data-hw-combobox-list hidden>
      <li class="hw-option" data-hw-value="passport">Passport</li>
      <li class="hw-option" data-hw-value="proof-of-address">Proof of address</li>
      <li class="hw-option" data-hw-value="proof-of-income">Proof of income</li>
      <li class="hw-option" data-hw-value="lease-contract">Lease contract</li>
    </ul>
    <span class="hw-sr-only" id="document-type-status" data-hw-combobox-status role="status"></span>
  </div>
  <p class="hw-hint" id="document-type-hint">Type part of the document name to filter the list.</p>
</div>
```

```tsx live example=filter
<Combobox
  id="document-type"
  label="Document type"
  hint="Type part of the document name to filter the list."
  name="document"
  emptyMessage="No document matches the text."
  getResultsMessage={(count) => `Matching options: ${count}`}
  options={[
    { value: 'passport', label: 'Passport' },
    { value: 'proof-of-address', label: 'Proof of address' },
    { value: 'proof-of-income', label: 'Proof of income' },
    { value: 'lease-contract', label: 'Lease contract' },
  ]}
/>
```

```vue live example=filter
<Combobox
  id="document-type"
  label="Document type"
  hint="Type part of the document name to filter the list."
  name="document"
  empty-message="No document matches the text."
  :get-results-message="(count: number) => `Matching options: ${count}`"
  :options="[
    { value: 'passport', label: 'Passport' },
    { value: 'proof-of-address', label: 'Proof of address' },
    { value: 'proof-of-income', label: 'Proof of income' },
    { value: 'lease-contract', label: 'Lease contract' },
  ]"
/>
```

```ts live example=filter framework=angular
import { Component } from '@angular/core';
import { HwComboboxComponent } from '@hawiyah/angular';

@Component({
  imports: [HwComboboxComponent],
  template: `<hw-combobox
    controlId="document-type"
    label="Document type"
    hint="Type part of the document name to filter the list."
    name="document"
    emptyMessage="No document matches the text."
    [getResultsMessage]="resultsMessage"
    [options]="options"
  />`,
})
export class DocumentTypeExample {
  readonly resultsMessage = (count: number) => `Matching options: ${count}`;
  readonly options = [
    { value: 'passport', label: 'Passport' },
    { value: 'proof-of-address', label: 'Proof of address' },
    { value: 'proof-of-income', label: 'Proof of income' },
    { value: 'lease-contract', label: 'Lease contract' },
  ];
}
```

### Unavailable option

```html live example=unavailable check=combobox-unavailable
<div class="hw-field">
  <label class="hw-label" id="delivery-method-label" for="delivery-method">Delivery method</label>
  <div class="hw-combobox" data-hw="combobox" data-hw-results-message="Matching options: {count}">
    <input id="delivery-method" class="hw-input" type="text" data-hw-combobox-input aria-labelledby="delivery-method-label" aria-describedby="delivery-method-hint">
    <input type="hidden" name="delivery" data-hw-combobox-value>
    <ul class="hw-listbox" id="delivery-method-listbox" data-hw-combobox-list hidden>
      <li class="hw-option" data-hw-value="branch">Collection from a branch</li>
      <li class="hw-option" data-hw-value="post" aria-disabled="true">Delivery by post</li>
      <li class="hw-option" data-hw-value="courier">Courier delivery</li>
      <li class="hw-option" data-hw-value="email">Email</li>
    </ul>
    <span class="hw-sr-only" id="delivery-method-status" data-hw-combobox-status role="status"></span>
  </div>
  <p class="hw-hint" id="delivery-method-hint">Delivery by post is not available for this document.</p>
</div>
```

```tsx live example=unavailable
<Combobox
  id="delivery-method"
  label="Delivery method"
  hint="Delivery by post is not available for this document."
  name="delivery"
  emptyMessage="No delivery method matches the text."
  getResultsMessage={(count) => `Matching options: ${count}`}
  options={[
    { value: 'branch', label: 'Collection from a branch' },
    { value: 'post', label: 'Delivery by post', disabled: true },
    { value: 'courier', label: 'Courier delivery' },
    { value: 'email', label: 'Email' },
  ]}
/>
```

```vue live example=unavailable
<Combobox
  id="delivery-method"
  label="Delivery method"
  hint="Delivery by post is not available for this document."
  name="delivery"
  empty-message="No delivery method matches the text."
  :get-results-message="(count: number) => `Matching options: ${count}`"
  :options="[
    { value: 'branch', label: 'Collection from a branch' },
    { value: 'post', label: 'Delivery by post', disabled: true },
    { value: 'courier', label: 'Courier delivery' },
    { value: 'email', label: 'Email' },
  ]"
/>
```

```ts live example=unavailable framework=angular
import { Component } from '@angular/core';
import { HwComboboxComponent } from '@hawiyah/angular';

@Component({
  imports: [HwComboboxComponent],
  template: `<hw-combobox
    controlId="delivery-method"
    label="Delivery method"
    hint="Delivery by post is not available for this document."
    name="delivery"
    emptyMessage="No delivery method matches the text."
    [getResultsMessage]="resultsMessage"
    [options]="options"
  />`,
})
export class DeliveryMethodExample {
  readonly resultsMessage = (count: number) => `Matching options: ${count}`;
  readonly options = [
    { value: 'branch', label: 'Collection from a branch' },
    { value: 'post', label: 'Delivery by post', disabled: true },
    { value: 'courier', label: 'Courier delivery' },
    { value: 'email', label: 'Email' },
  ];
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

## Accessibility

Table: Keyboard interaction of Combobox

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves focus into the field and opens the list; from the field, moves focus to the next element, closes the list and commits nothing. |
| <kbd>Down Arrow</kbd>, <kbd>Up Arrow</kbd> | Opens the list and makes the next or the previous enabled option active, wrapping at the ends, while focus stays in the field. |
| <kbd>Home</kbd>, <kbd>End</kbd> | Makes the first or the last enabled option active. |
| <kbd>Enter</kbd> | Commits the active option, shows its label in the field and closes the list. |
| <kbd>Escape</kbd> | Closes the list without committing an option and keeps the text in the field. |
| <kbd>Backspace</kbd> | Deletes the character before the caret, clears the committed option and filters the list by the remaining text. |

## RTL and localisation

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification.
