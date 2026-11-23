# SearchField

SearchField is a labelled free-text search input with an inset action that clears the query, optional local suggestions and an optional search button. The application runs the search; the field only holds and reports the query.

## Example

The field has a visible label. When the query is not empty, a clear button appears at the end of the input; its name is the `clearLabel` that the application supplies. Clearing empties the query, returns focus to the input and does not submit the form.

```html live example=basic static differences=search-field-adapter-markup
<div class="hw-field hw-search-field" data-hw="search-field">
  <label class="hw-label" for="basic-query">Search services</label>
  <div class="hw-input-group">
    <div class="hw-search-control">
      <input class="hw-input" id="basic-query" name="query" type="search" value="residence permit" data-hw-search-input>
      <button class="hw-button hw-search-clear" type="button" data-variant="ghost" data-size="md" aria-label="Clear search" data-hw-search-clear></button>
    </div>
  </div>
</div>
```

```tsx live example=basic
<SearchField label="Search services" name="query" defaultValue="residence permit" clearLabel="Clear search" />
```

```vue live example=basic
<SearchField label="Search services" name="query" default-value="residence permit" clear-label="Clear search" />
```

```ts live example=basic framework=angular
template: `<hw-search-field label="Search services" name="query" value="residence permit" clearLabel="Clear search" />`
```

## Variants and states

### Suggestions

With a list of suggestions the field offers local autocomplete. The suggestions are strings that the application supplies; no request is made, and the submitted value stays free text. `getResultsMessage` receives the number of matches and returns the whole text of the polite announcement.

```html live example=suggestions static differences=search-field-adapter-markup
<div class="hw-field hw-search-field" data-hw="search-field" data-hw-suggestions='["Residence permit","Residence renewal","Driving licence","Vehicle registration"]' data-hw-results-message="{count} suggestions">
  <label class="hw-label" for="suggest-query">Search services</label>
  <div class="hw-input-group">
    <div class="hw-search-control">
      <input class="hw-input" id="suggest-query" name="query" type="search" data-hw-search-input>
      <button class="hw-button hw-search-clear" type="button" data-variant="ghost" data-size="md" aria-label="Clear search" data-hw-search-clear></button>
    </div>
  </div>
</div>
```

```tsx live example=suggestions
<SearchField
  label="Search services"
  name="query"
  clearLabel="Clear search"
  suggestions={['Residence permit', 'Residence renewal', 'Driving licence', 'Vehicle registration']}
  getResultsMessage={(count) => count + ' suggestions'}
/>
```

```vue live example=suggestions
<SearchField
  label="Search services"
  name="query"
  clear-label="Clear search"
  :suggestions="['Residence permit', 'Residence renewal', 'Driving licence', 'Vehicle registration']"
  :get-results-message="(count) => count + ' suggestions'"
/>
```

```ts live example=suggestions framework=angular
template: `<hw-search-field
  label="Search services"
  name="query"
  clearLabel="Clear search"
  [suggestions]="['Residence permit', 'Residence renewal', 'Driving licence', 'Vehicle registration']"
  [getResultsMessage]="(count) => count + ' suggestions'"
/>`
```

### Search button

`showSearchButton` adds a button that starts the search, and `searchLabel` is its accessible name. In React, Vue and Angular the button calls the search callback. In vanilla the controller does not read the button and calls `onSearch` only from Enter, so the application writes the button and handles its click itself. Without it the field has no button, and Enter in the input submits the form as a native search input does.

```html live example=button static differences=search-field-adapter-markup
<div class="hw-field hw-search-field" data-hw="search-field">
  <label class="hw-label" for="button-query">Search documents</label>
  <div class="hw-input-group">
    <div class="hw-search-control">
      <input class="hw-input" id="button-query" name="query" type="search" data-hw-search-input>
      <button class="hw-button hw-search-clear" type="button" data-variant="ghost" data-size="md" aria-label="Clear search" data-hw-search-clear></button>
    </div>
    <button class="hw-button hw-search-submit" type="button" data-variant="primary" data-size="md" aria-label="Search"><span class="hw-search-submit-icon" aria-hidden="true"></span></button>
  </div>
</div>
```

```tsx live example=button
<SearchField label="Search documents" name="query" clearLabel="Clear search" showSearchButton searchLabel="Search" />
```

```vue live example=button
<SearchField label="Search documents" name="query" clear-label="Clear search" show-search-button search-label="Search" />
```

```ts live example=button framework=angular
template: `<hw-search-field label="Search documents" name="query" clearLabel="Clear search" [showSearchButton]="true" searchLabel="Search" />`
```

### Hint and error

The hint describes what the field searches, and an error is shown after the control with the input marked invalid.

```html live example=error static differences=search-field-adapter-markup
<div class="hw-field hw-search-field" data-hw="search-field">
  <label class="hw-label" for="error-query">Search requests</label>
  <div class="hw-input-group">
    <div class="hw-search-control">
      <input class="hw-input" id="error-query" name="query" type="search" value="12" aria-invalid="true" aria-describedby="error-query-hint error-query-error" data-hw-search-input>
      <button class="hw-button hw-search-clear" type="button" data-variant="ghost" data-size="md" aria-label="Clear search" data-hw-search-clear></button>
    </div>
  </div>
  <p class="hw-hint" id="error-query-hint">Search by request number or by title.</p>
  <p class="hw-error" id="error-query-error">Enter at least three characters.</p>
</div>
```

```tsx live example=error
<SearchField label="Search requests" name="query" defaultValue="12" clearLabel="Clear search" hint="Search by request number or by title." error="Enter at least three characters." />
```

```vue live example=error
<SearchField label="Search requests" name="query" default-value="12" clear-label="Clear search" hint="Search by request number or by title." error="Enter at least three characters." />
```

```ts live example=error framework=angular
template: `<hw-search-field label="Search requests" name="query" value="12" clearLabel="Clear search" hint="Search by request number or by title." error="Enter at least three characters." />`
```

## API

### JavaScript

Table: Options of createSearchField

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `clearLabel` | `string` | `false` | — |
| `suggestions` | `readonly string[]` | `false` | — |
| `maxSuggestions` | `number` | `false` | — |
| `getResultsMessage` | `(count: number) => string` | `false` | — |
| `onValueChange` | `(value: string) => void` | `false` | — |
| `onSearch` | `(query: string) => void` | `false` | — |

`createSearchField` enhances an element with the class `hw-search-field` that holds a native `search` input marked `data-hw-search-input` and a clear button marked `data-hw-search-clear` inside `hw-search-control`; the same enhancement runs for `data-hw="search-field"` through `enhance()`. The clear button takes its name from `clearLabel`, or from its own `aria-label` or text before the icon replaces the text. The controller returns `value`, `clear()`, `setValue(value)`, `setSuggestions(items)` and `destroy()`. `clear()` emits native input and change events and one `hw:change` event with `{ value }`; `setValue` synchronises the field without emitting events. The suggestions come from the option `suggestions` or, in markup, from a JSON array of strings in `data-hw-suggestions` on the root; `data-hw-max-suggestions` sets the limit, which is 8 when neither it nor the option is given, and `data-hw-results-message` gives the announcement, with a placeholder for the number of matches. With suggestions the results message is required. `onSearch` receives the trimmed query when Enter is pressed and no suggestion is active. Search submission belongs to the form of the application: use either the submit handler or `onSearch` for one search, not both.

### React

Table: Props of SearchField

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `value` | `string` | `false` | — |
| `defaultValue` | `string` | `false` | `''` |
| `onValueChange` | `(value: string) => void` | `false` | — |
| `clearLabel` | `string` | `true` | — |
| `maxSuggestions` | `number` | `false` | `8` |
| `onSearch` | `(query: string) => void` | `false` | — |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |
| `label` | `ReactNode` | `false` | — |
| `showSearchButton` | `boolean` | `false` | `false` |
| `searchLabel` | `string` | `false` | — |
| `suggestions` | `readonly string[]` | `false` | — |
| `getResultsMessage` | `(count: number) => string` | `false` | — |

SearchField also accepts the props of a native input element, such as `name`, `required`, `disabled` and `readOnly`. Use `value` with `onValueChange` for a controlled field, or `defaultValue` for an uncontrolled one. `clearLabel` is required; `searchLabel` is needed when `showSearchButton` is set, and `getResultsMessage` when `suggestions` is given. `onSearch` receives the trimmed query when Enter is pressed and no suggestion is active, and the native form submission stays available. A field needs `label`, `aria-label` or `aria-labelledby`.

### Vue

Table: Props, events and slots of SearchField

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `modelValue` | prop | `string` | `false` | — |
| `defaultValue` | prop | `string` | `false` | `''` |
| `disabled` | prop | `boolean` | `false` | `false` |
| `readonly` | prop | `boolean` | `false` | `false` |
| `clearLabel` | prop | `string` | `true` | — |
| `suggestions` | prop | `readonly string[]` | `false` | — |
| `maxSuggestions` | prop | `number` | `false` | `8` |
| `getResultsMessage` | prop | `(count: number) => string` | `false` | — |
| `showSearchButton` | prop | `boolean` | `false` | `false` |
| `searchLabel` | prop | `string` | `false` | — |
| `label` | prop | `string` | `false` | — |
| `hint` | prop | `string` | `false` | — |
| `error` | prop | `string` | `false` | — |
| `required` | prop | `boolean` | `false` | — |
| `update:modelValue` | event | `(value: string) => void` | `false` | — |
| `search` | event | `(value: string) => void` | `false` | — |

`v-model` binds the string value, and `defaultValue` sets the initial query of an uncontrolled field. The `search` event reports the query when Enter is pressed and no suggestion is active; it ignores a key press during composition and a press with Ctrl, Alt, Meta or Shift. `clearLabel` is required, and the other attributes, such as `name`, reach the native input. The published declaration types no slot and the published build reads none.

### Angular

Table: Inputs, outputs and content of hw-search-field

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
| `placeholder` | input | `string` | `false` | `''` |
| `autocomplete` | input | `string` | `false` | `'off'` |
| `autofocus` | input | `boolean` | `false` | `false` |
| `clearLabel` | input | `string` | `true` | — |
| `searchLabel` | input | `string` | `false` | `''` |
| `suggestions` | input | `readonly string[]` | `false` | — |
| `maxSuggestions` | input | `number` | `false` | `8` |
| `getResultsMessage` | input | `(count: number) => string` | `false` | — |
| `showSearchButton` | input | `boolean` | `false` | `false` |
| `valueChange` | output | `string` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |
| `searched` | output | `string` | `false` | — |

`HwSearchFieldComponent` (`hw-search-field`) renders the field, the label, the search input, the clear button, the hint and the error. Bind `[(value)]` for the string value; the component also works as a form control. The `searched` output reports the query when Enter is pressed and no suggestion is active, and it ignores a key press during composition and a press with Ctrl, Alt, Meta or Shift. `clearLabel` is required; `searchLabel` is needed when `showSearchButton` is set, and `getResultsMessage` when `suggestions` is given. A field needs a `label`, or `aria-label` or `aria-labelledby` written on `hw-search-field`; these attributes are forwarded to the input. `controlId` sets the id of the input. Without an `autocomplete` input the field writes `autocomplete="off"`.

## Accessibility

The input is a native input element of type `search`, named by its label, so the browser provides its role, text editing and keyboard handling. The clear button is a native button named by `clearLabel`; it is hidden while the query is empty or the field is read-only, and it does nothing in a disabled field.

With suggestions, only that field receives the combobox roles and the expanded and active-descendant state. Vanilla, React and Vue then also disable the native autocomplete of the browser, and only then; Angular disables it on every field, as its note above says. The list is a listbox named by the label of the field, focus stays on the input, and a separate polite status announces the number of matches through `getResultsMessage`. An empty query or a query without matches never opens an empty list.

Table: Keyboard interaction of SearchField

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves focus from the input to the clear button when it is shown, then to the next control. |
| <kbd>Down Arrow</kbd>, <kbd>Up Arrow</kbd> | Moves the active suggestion to the next or the previous one, wrapping at the ends, while focus stays on the input. |
| <kbd>Enter</kbd> | Selects the active suggestion into the input without submitting the form; with no active suggestion, leaves the native form submission and reports the search. |
| <kbd>Escape</kbd> | Closes the open list of suggestions; with the list closed, requests the close of the nearest modal dialog and keeps the query. |

- Selecting a suggestion emits the ordinary input and change notifications, and the field keeps free text.
- Pointer and touch selection keep focus on the input and commit on click.
- The list closes on blur, on outside interaction, on clear, on a silent `setValue` and on a form reset.
- A read-only field can report a search for its existing value but cannot clear, select suggestions or accept edits.

## RTL and localisation

SearchField has no built-in text: the label, the hint, the error, the clear name, the search name and the results message are written by the application in the language of the page. The clear and search actions stand at the logical end of the input, and the packaged styles use logical properties, so the field follows the reading direction.

- Suggestions are matched with their Arabic marks ignored and alef variants unified, and a match is highlighted at the original positions of the text.
- A query of digits stays as the reader types it, and the application chooses the numerals of the results message.
- Submission, request, ranking and the display of results belong to the application.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of SearchField; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The size of the field, the inset clear action, the suggestion list, the matching rules and the keyboard handling of the supplied Platforms Code files are mapped in the [search notes](../nic-search.md), with the confidence of each mapping.
- The [search field notes](../search-field.md) describe the clear action, its names and the reset behaviour; they state that the composition is not a claim of pixel parity with an official search template.
