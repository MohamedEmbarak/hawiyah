# FileUpload

FileUpload presents a native file input within a field, with a visible label and, when the application supplies them, a hint and an error message. It selects local files only; transport, server validation and progress belong to the application, and FileUploadList shows the state of each file that the application reports.

## Example

A field has a visible label that names the document requested. The hint states the accepted types and the size limit, and it is associated with the input. Choosing a file does not send it.

```html live example=basic static
<div class="hw-field hw-upload">
  <label class="hw-label" for="basic-document" id="basic-document-label">Supporting document</label>
  <input class="hw-input" id="basic-document" name="document" type="file" accept=".pdf,.jpg,.png" aria-describedby="basic-document-hint">
  <p class="hw-hint" id="basic-document-hint">Attach a PDF, JPG or PNG file of up to 2 MB.</p>
</div>
```

```tsx live example=basic
<FileUpload label="Supporting document" name="document" accept=".pdf,.jpg,.png" hint="Attach a PDF, JPG or PNG file of up to 2 MB." />
```

```vue live example=basic
<FileUpload label="Supporting document" name="document" accept=".pdf,.jpg,.png" hint="Attach a PDF, JPG or PNG file of up to 2 MB." />
```

```ts live example=basic framework=angular
template: `<hw-file-upload label="Supporting document" name="document" accept=".pdf,.jpg,.png" hint="Attach a PDF, JPG or PNG file of up to 2 MB." />`
```

## Variants and states

### Required

A required field shows one marker after its label and keeps the native `required` attribute, so the browser applies its own constraint validation on submission.

```html live example=required static
<div class="hw-field hw-upload">
  <label class="hw-label" for="required-document" id="required-document-label">Identity document<span class="hw-required-marker" aria-hidden="true"> *</span></label>
  <input class="hw-input" id="required-document" name="identity" type="file" required>
</div>
```

```tsx live example=required
<FileUpload label="Identity document" name="identity" required />
```

```vue live example=required
<FileUpload label="Identity document" name="identity" required />
```

```ts live example=required framework=angular
template: `<hw-file-upload label="Identity document" name="identity" [required]="true" />`
```

### Error

An error is shown in a paragraph after the control, and the input is marked with `aria-invalid="true"` and described by the message. The message states what is wrong and how to correct it.

```html live example=error static
<div class="hw-field hw-upload">
  <label class="hw-label" for="error-document" id="error-document-label">Supporting document</label>
  <input class="hw-input" id="error-document" name="document" type="file" aria-invalid="true" aria-describedby="error-document-error">
  <p class="hw-error" id="error-document-error">Attach the supporting document before you submit the request.</p>
</div>
```

```tsx live example=error
<FileUpload label="Supporting document" name="document" error="Attach the supporting document before you submit the request." />
```

```vue live example=error
<FileUpload label="Supporting document" name="document" error="Attach the supporting document before you submit the request." />
```

```ts live example=error framework=angular
template: `<hw-file-upload label="Supporting document" name="document" error="Attach the supporting document before you submit the request." />`
```

### Disabled

A disabled field uses the native `disabled` attribute.

```html live example=disabled static
<div class="hw-field hw-upload">
  <label class="hw-label" for="disabled-document" id="disabled-document-label">Supporting document</label>
  <input class="hw-input" id="disabled-document" name="document" type="file" disabled>
</div>
```

```tsx live example=disabled
<FileUpload label="Supporting document" name="document" disabled />
```

```vue live example=disabled
<FileUpload label="Supporting document" name="document" disabled />
```

```ts live example=disabled framework=angular
template: `<hw-file-upload label="Supporting document" name="document" [disabled]="true" />`
```

### File list

FileUploadList shows one row for each item that the application passes: the name and the status. The status text of a selected or complete row without a `message` is hidden visually, and a complete row shows a check mark instead; that text stays available to assistive technology. A `message`, the status text of an error row and the progress of an uploading file stay visible below the name. A row whose status is uploading also has a progress bar with its own accessible name. The list is placed after the input, inside the field. It does not upload and does not remove. The application owns the items, updates their status and removes an item when the list asks it to; it also updates its own selected files and the native file list of the input when those files take part in the submission of the form, because removing a row does not remove the file from the input.

The remove buttons follow one of two rules. In React and in the vanilla controller a row has a remove button while the application gives `onRemove`. In Vue and Angular a row has a remove button when `removable` is set, whether or not a handler is bound, and the event `remove` carries the id of the item; the Vue and Angular examples below bind a handler for it. The handlers of the examples do nothing: the application writes the handler that removes the item.

An item has `id`, `name` and `status`, which is `selected`, `uploading`, `complete` or `error`, and optionally `message`, which replaces the status text, `progress`, a number from 0 to 100 for an uploading file, and `removable`, which is false to leave out the remove button of one row. The text of every status, the text `remove` and the functions `getProgressLabel` and `getRemoveLabel`, which return the accessible names of the progress bar and of the remove button of one file, come from the required `labels`. The stylesheet draws the remove button as a cancel icon and hides the `remove` text, so the button is named by `getRemoveLabel`. The component has no built-in text.

```html live example=list static
<div class="hw-field hw-upload">
  <label class="hw-label" for="list-documents" id="list-documents-label">Supporting documents</label>
  <input class="hw-input" id="list-documents" name="documents" type="file" multiple>
  <ul class="hw-upload-list">
    <li class="hw-upload-item" data-status="complete"><span class="hw-upload-name">identity-card.pdf</span><span class="hw-upload-status" role="status">Sent</span><button type="button" class="hw-button" data-variant="subtle" aria-label="Remove identity-card.pdf">Remove</button></li>
    <li class="hw-upload-item" data-status="selected"><span class="hw-upload-name">address-proof.pdf</span><span class="hw-upload-status" role="status">Ready to send</span><button type="button" class="hw-button" data-variant="subtle" aria-label="Remove address-proof.pdf">Remove</button></li>
    <li class="hw-upload-item" data-status="error" data-message="true"><span class="hw-upload-name">photo.jpg</span><span class="hw-upload-status" role="status">The file is larger than 2 MB.</span><button type="button" class="hw-button" data-variant="subtle" aria-label="Remove photo.jpg">Remove</button></li>
  </ul>
</div>
```

```tsx live example=list
<FileUpload label="Supporting documents" name="documents" multiple>
  <FileUploadList
    items={[
      { id: 'a', name: 'identity-card.pdf', status: 'complete' },
      { id: 'b', name: 'address-proof.pdf', status: 'selected' },
      { id: 'c', name: 'photo.jpg', status: 'error', message: 'The file is larger than 2 MB.' },
    ]}
    labels={{
      selected: 'Ready to send',
      uploading: 'Sending',
      complete: 'Sent',
      error: 'Not sent',
      remove: 'Remove',
      getProgressLabel: name => `Progress of ${name}`,
      getRemoveLabel: name => `Remove ${name}`,
    }}
    onRemove={() => undefined}
  />
</FileUpload>
```

```vue live example=list
<FileUpload label="Supporting documents" name="documents" multiple>
  <FileUploadList
    :items="[
      { id: 'a', name: 'identity-card.pdf', status: 'complete' },
      { id: 'b', name: 'address-proof.pdf', status: 'selected' },
      { id: 'c', name: 'photo.jpg', status: 'error', message: 'The file is larger than 2 MB.' },
    ]"
    :labels="{
      selected: 'Ready to send',
      uploading: 'Sending',
      complete: 'Sent',
      error: 'Not sent',
      remove: 'Remove',
      getProgressLabel: (name: string) => `Progress of ${name}`,
      getRemoveLabel: (name: string) => `Remove ${name}`,
    }"
    removable
    @remove="() => undefined"
  />
</FileUpload>
```

```ts live example=list framework=angular
import { Component } from '@angular/core';
import { HwFileUploadComponent, HwFileUploadListComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-list-example',
  imports: [HwFileUploadComponent, HwFileUploadListComponent],
  template: `<hw-file-upload label="Supporting documents" name="documents" [multiple]="true">
    <hw-file-upload-list [items]="items" [labels]="labels" [removable]="true" (remove)="null" />
  </hw-file-upload>`,
})
export class ListExample {
  items = [
    { id: 'a', name: 'identity-card.pdf', status: 'complete' as const },
    { id: 'b', name: 'address-proof.pdf', status: 'selected' as const },
    { id: 'c', name: 'photo.jpg', status: 'error' as const, message: 'The file is larger than 2 MB.' },
  ];
  labels = {
    selected: 'Ready to send',
    uploading: 'Sending',
    complete: 'Sent',
    error: 'Not sent',
    remove: 'Remove',
    getProgressLabel: (name: string) => `Progress of ${name}`,
    getRemoveLabel: (name: string) => `Remove ${name}`,
  };
}
```

## API

### JavaScript

Table: Attributes of the hw-upload element and options of createFileUploadList

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-upload'` | `true` | — |
| `data-state` | `'dragging' \| 'error'` | `false` | — |
| `createFileUploadList items` | `readonly FileUploadItem[]` | `true` | — |
| `createFileUploadList labels` | `FileUploadLabels` | `true` | — |
| `createFileUploadList disabled` | `boolean` | `false` | — |
| `createFileUploadList onRemove` | `(id: string) => void` | `false` | — |

The field is markup: write an element with the classes `hw-field` and `hw-upload` that holds a `label` with the class `hw-label` whose `for` names the input, a native `input` with `type="file"` and, where needed, a paragraph with the class `hw-hint` or `hw-error` after the input. Associate the paragraph with the input through `aria-describedby`; no script does it. The native attributes `accept`, `multiple`, `name`, `form`, `required` and `disabled` configure the input. `data-state` takes `dragging` or `error`: `dragging` draws a primary border and a background, and `error` draws a danger border only. For an invalid field write `aria-invalid="true"` on the input together with the visible `hw-error` message.

`createFileUploadList` renders the list. It takes the element that will hold it as `root`, an element of its own that follows the input, not the field itself, because it replaces every child of the root with an `ul` with the class `hw-upload-list`, and returns `update`, `setDisabled` and `destroy`. `update(items)` renders a new array of items, `setDisabled` disables the remove buttons, and `destroy` restores the original children of the root. The html block of the file list shows the rendered list, written by hand inside the field for the comparison; its remove buttons do nothing, because a block holds no script. `labels` is required and holds all of the text of the list, as described under File list in Variants and states. A remove button is rendered for an item only when `onRemove` is given; it calls `onRemove` with the id of the item and does not remove the row, so the application updates the list.

### React

Table: Props of FileUpload and FileUploadList

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `onFilesChange` | `(files: File[]) => void` | `false` | — |
| `children` | `ReactNode` | `false` | — |
| `label` | `ReactNode` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |
| `FileUploadList items` | `readonly FileUploadItem[]` | `true` | — |
| `FileUploadList labels` | `FileUploadLabels` | `true` | — |
| `FileUploadList disabled` | `boolean` | `false` | — |
| `FileUploadList onRemove` | `(id: string) => void` | `false` | — |

FileUpload also accepts the props of a native input element, including `name`, `accept`, `multiple`, `required`, `disabled`, `onChange` and `ref`; they reach the file input. `onFilesChange` receives the selected files as an array each time the selection changes, and a native reset of the form reports an empty array once when files were held. `children` render after the input and before the hint; pass a `FileUploadList` there to list the files. The label, the hint and the error are renderable React content; the hint and the error render as paragraphs after the input and are associated with it, and a non-empty `error` sets `aria-invalid`. A required field with a visible label shows one marker.

FileUploadList takes `items` and `labels`, both required, and `disabled`. It renders a remove button for an item only while `onRemove` is given, and `onRemove` receives the id of the item; the application removes the item itself. The remove button has the class `hw-button`, and an item whose `removable` is false has none.

### Vue

Table: Props, events and slots of FileUpload and FileUploadList

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `label` | prop | `string` | `false` | — |
| `hint` | prop | `string` | `false` | — |
| `error` | prop | `string` | `false` | — |
| `required` | prop | `boolean` | `false` | — |
| `update:files` | event | `(files: File[]) => void` | `false` | — |
| `default` | slot | — | `false` | — |
| `FileUploadList items` | prop | `readonly FileUploadItem[]` | `true` | — |
| `FileUploadList labels` | prop | `FileUploadLabels` | `true` | — |
| `FileUploadList disabled` | prop | `boolean` | `false` | `false` |
| `FileUploadList removable` | prop | `boolean` | `false` | `false` |
| `FileUploadList remove` | event | `(id: string) => void` | `false` | — |

FileUpload emits `update:files` with the selected files each time the selection changes, and a native reset reports an empty array only when files were selected. The other attributes, such as `name`, `accept`, `multiple` and `disabled`, reach the native file input. The `default` slot renders after the input and before the hint; place a `FileUploadList` there. `label`, `hint` and `error` are strings; the hint and the error render as paragraphs after the input and are associated with it, and a non-empty `error` sets `aria-invalid`. The table lists the `default` slot because the published build reads it; the declaration types no slot.

FileUploadList takes `items` and `labels`, both required. The prop `removable` renders a remove button on each item whose `removable` is not false, and the event `remove` carries the id of the item; the application removes the item itself. `disabled` disables the remove buttons.

### Angular

Table: Inputs, outputs and content of hw-file-upload and hw-file-upload-list

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
| `value` | input | `readonly File[]` | `false` | `[]` |
| `accept` | input | `string` | `false` | `''` |
| `multiple` | input | `boolean` | `false` | `false` |
| `capture` | input | `'user' \| 'environment' \| ''` | `false` | `''` |
| `valueChange` | output | `readonly File[]` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |
| `*` | content | — | `false` | — |
| `hw-file-upload-list items` | input | `readonly FileUploadItem[]` | `false` | `[]` |
| `hw-file-upload-list labels` | input | `FileUploadLabels` | `true` | — |
| `hw-file-upload-list disabled` | input | `boolean` | `false` | `false` |
| `hw-file-upload-list removable` | input | `boolean` | `false` | `false` |
| `hw-file-upload-list remove` | output | `string` | `false` | — |

`HwFileUploadComponent` (`hw-file-upload`) renders the field, the label, the native file input, the projected content, the hint and the error. `valueChange` emits the selected files as a read-only array, and the component also works as a form control through its value accessor. Browsers do not allow a script to fill a file input, so a form can clear the selection but not populate it, and a native reset empties it and emits an empty array once when files were held. The attribute `accept` is not written to the input without a value. The content of the element is projected after the input; place an `hw-file-upload-list` there. A field needs a `label`, or `aria-label` or `aria-labelledby` written on `hw-file-upload`, or the label of a surrounding `hw-field`; these attributes are forwarded to the input and removed from the host. `controlId` sets the id of the input.

`HwFileUploadListComponent` (`hw-file-upload-list`) takes `items` and the required `labels`, and `disabled`. With `removable`, each item whose `removable` is not false has a remove button, and the output `remove` emits the id of the item to ask the application to remove it; the output does not remove anything itself.

## Accessibility

The file input is a native element, so the browser provides its role, its focus behaviour, its file chooser and the name of the chosen file. The label is a native `label` element whose `for` names the input, so the label text is the accessible name and a click on it opens the chooser. The hint and the error are associated with the input as its description.

Table: Keyboard interaction of FileUpload

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves focus to the file input, then to the next remove button of the list or the next control of the page. |
| <kbd>Shift</kbd> + <kbd>Tab</kbd> | Moves focus to the previous remove button or control of the page. |
| <kbd>Enter</kbd>, <kbd>Space</kbd> | Opens the file chooser of the browser on the focused file input; on a focused remove button, activates the button. |

- Choosing a file only selects it. The text of the status of each file in the list is supplied by the application, and each status text sits in an element with `role="status"`. The vanilla controller rebuilds every row when `update` is called, so a changed status there arrives as a new element; React, Vue and Angular keep the rows by id.
- The progress bar of an uploading file is a native `progress` element named by `getProgressLabel`, and the remove button is named by `getRemoveLabel`, so each names its file.
- The remove button of a row is a native `button` with `type="button"`. The application updates the list after a removal and places focus itself.
- `aria-invalid="true"` is set when the application passes a non-empty `error`. FileUpload does not check the type or the size of a file; `accept` is a hint to the file chooser of the browser, and the application validates the file.
- The required marker is hidden from assistive technology; the native `required` attribute carries the requirement.
- A disabled input is not focusable and does not open the chooser. The `disabled` of FileUpload does not reach the list: the remove buttons follow the `disabled` of the FileUploadList, or `setDisabled` in the vanilla controller.

## RTL and localisation

FileUpload has no built-in text: the label, the hint, the error, the status words, the remove text and the names of the progress bar and the remove button are written by the application in the language of the page. The text of the chooser button and the text that the browser shows when no file or several files are chosen are the browser's own and follow the language of the browser; the name of a chosen file is the name of the user's file. The element inherits the language and the direction of the page, and the packaged styles use logical properties, so the label, the paragraphs and each row of the list follow the reading direction.

- A file name is data and keeps its own script. The status stands on its own line below the name. No adapter isolates the direction of the name, so a name in the other script stands in the direction of the page, and the bidirectional algorithm may reorder its punctuation.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of FileUpload; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The [coverage notes](../coverage.md) list FileUpload in the catalog group Initial controls and the input type file as local file selection, by FileUpload or FileDropzone.
- The status of each file in the list, its progress and its removal are described in the [file upload notes](../file-upload-states.md), which state that this presentation does not change the native picker.
