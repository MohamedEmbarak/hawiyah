# FileDropzone

FileDropzone is a field for choosing local files with the native file chooser or by dropping them on the field. It reports the selected files and rejects a batch that does not meet the type, size or count constraints, and it does not upload anything.

## Example

A dropzone has a visible label that names the field and a visible instruction that tells the reader what to choose or drop. The label names the file input and the instruction describes it. The hint states the files the application expects.

```html live example=basic static differences=file-dropzone-adapter-markup
<div class="hw-field hw-file-dropzone" data-hw="file-dropzone">
  <label class="hw-label" for="basic-input">Supporting documents</label>
  <p id="basic-instruction">Choose files or drop them here.</p>
  <input class="hw-input" type="file" id="basic-input" data-hw-file-input name="basic" multiple aria-describedby="basic-instruction basic-hint">
  <p class="hw-hint" id="basic-hint">Attach the documents that support the request.</p>
</div>
```

```tsx live example=basic
<FileDropzone label="Supporting documents" dropLabel="Choose files or drop them here." name="basic" multiple hint="Attach the documents that support the request." />
```

```vue live example=basic
<FileDropzone label="Supporting documents" drop-label="Choose files or drop them here." name="basic" multiple hint="Attach the documents that support the request." />
```

```ts live example=basic framework=angular
template: `<hw-file-dropzone label="Supporting documents" dropLabel="Choose files or drop them here." name="basic" [multiple]="true" hint="Attach the documents that support the request." />`
```

## Variants and states

### Error

An application error is shown in the last paragraph inside the field, after the hint, and describes the input, which is marked `aria-invalid`.

```html live example=error static differences=file-dropzone-adapter-markup
<div class="hw-field hw-file-dropzone" data-hw="file-dropzone" data-state="error">
  <label class="hw-label" for="error-input">Supporting documents</label>
  <p id="error-instruction">Choose files or drop them here.</p>
  <input class="hw-input" type="file" id="error-input" data-hw-file-input name="error" multiple aria-invalid="true" aria-describedby="error-instruction error-hint error-error">
  <p class="hw-hint" id="error-hint">Attach the documents that support the request.</p>
  <p class="hw-error" id="error-error">Attach at least one document.</p>
</div>
```

```tsx live example=error
<FileDropzone label="Supporting documents" dropLabel="Choose files or drop them here." name="error" multiple hint="Attach the documents that support the request." error="Attach at least one document." />
```

```vue live example=error
<FileDropzone label="Supporting documents" drop-label="Choose files or drop them here." name="error" multiple hint="Attach the documents that support the request." error="Attach at least one document." />
```

```ts live example=error framework=angular
template: `<hw-file-dropzone label="Supporting documents" dropLabel="Choose files or drop them here." name="error" [multiple]="true" hint="Attach the documents that support the request." error="Attach at least one document." />`
```

### Single file

Without `multiple` the input accepts one file, and a batch of more than one file is rejected as a whole.

```html live example=single static differences=file-dropzone-adapter-markup
<div class="hw-field hw-file-dropzone" data-hw="file-dropzone">
  <label class="hw-label" for="single-input">Identity document</label>
  <p id="single-instruction">Choose one file or drop it here.</p>
  <input class="hw-input" type="file" id="single-input" data-hw-file-input name="single" aria-describedby="single-instruction single-hint">
  <p class="hw-hint" id="single-hint">Attach one document.</p>
</div>
```

```tsx live example=single
<FileDropzone label="Identity document" dropLabel="Choose one file or drop it here." name="single" hint="Attach one document." />
```

```vue live example=single
<FileDropzone label="Identity document" drop-label="Choose one file or drop it here." name="single" hint="Attach one document." />
```

```ts live example=single framework=angular
template: `<hw-file-dropzone label="Identity document" dropLabel="Choose one file or drop it here." name="single" hint="Attach one document." />`
```

## API

### JavaScript

Table: Options of createFileDropzone

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `maxSize` | `number` | `false` | — |
| `onValueChange` | `(files: File[]) => void` | `false` | — |
| `onReject` | `(files: File[]) => void` | `false` | — |
| `getSelectedMessage` | `(files: readonly File[]) => string` | `false` | — |
| `getRejectedMessage` | `(rejected: readonly File[]) => string` | `false` | — |
| `unsupportedDropMessage` | `string` | `false` | — |

`createFileDropzone(root, options)` is a controller for a root of the class `hw-field` and `hw-file-dropzone` that holds a native file input marked `data-hw-file-input`. The markup is a `label` whose `for` names the input, an instruction paragraph that describes it, the input, an optional status paragraph marked `data-hw-file-status`, and the hint and the error after them. `accept`, `multiple` and `disabled` stay native attributes of the input, and the controller returns `value`, the selected File objects, and `destroy`. The options publish no defaults in 0.3.0. `maxSize`, in bytes, can also be written as `data-hw-max-size` on the root. A batch with any file of another type, over the size limit, or with more than one file on an input without `multiple` is rejected as a whole: the input is emptied, `onReject` is called once with the files and the rejection is written as an error paragraph with `role="alert"`. `getRejectedMessage` supplies that text and is needed when `accept` or `maxSize` is set; the template attribute `data-hw-rejected-message` carries it. `getSelectedMessage` and `unsupportedDropMessage` are written into the element marked `data-hw-file-status` when it exists. `onValueChange` fires only when the files held changed.

### React

Table: Props of FileDropzone

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `onFilesChange` | `(files: File[]) => void` | `false` | — |
| `onReject` | `(files: File[]) => void` | `false` | — |
| `dropLabel` | `ReactNode` | `true` | — |
| `getSelectedMessage` | `(files: readonly File[]) => string` | `false` | — |
| `children` | `ReactNode` | `false` | — |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |
| `label` | `ReactNode` | `false` | — |
| `accept` | `string` | `false` | — |
| `maxSize` | `number` | `false` | — |
| `getRejectedMessage` | `(rejected: readonly File[]) => string` | `false` | — |

`onFilesChange` is called only when the list of files changed, and `onReject` once for a rejected batch. `label` names the input, and the required `dropLabel` is the visible instruction that describes it and never names it. FileDropzone accepts the props of a native input, and `name`, `multiple` and `disabled` reach the input; `readOnly` does not reach it as an attribute, but keeps the input enabled and focusable, marks it `aria-disabled="true"` and blocks the chooser and drops; `accept` and `maxSize` (bytes) set the constraints, and `getRejectedMessage` is required when either is set. `getSelectedMessage`, when given, renders a visible status paragraph after the input. `children` render after the status, for example a `FileUploadList`, because the dropzone renders no file list. `error` replaces the rejection message and has no role. A batch replaces the selection, and the component has no defaults for its own props.

### Vue

Table: Props, events and slots of FileDropzone

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `disabled` | prop | `boolean` | `false` | `false` |
| `readonly` | prop | `boolean` | `false` | `false` |
| `accept` | prop | `string` | `false` | — |
| `multiple` | prop | `boolean` | `false` | `false` |
| `maxSize` | prop | `number` | `false` | — |
| `dropLabel` | prop | `string` | `true` | — |
| `getSelectedMessage` | prop | `(files: readonly File[]) => string` | `false` | — |
| `getRejectedMessage` | prop | `(rejected: readonly File[]) => string` | `false` | — |
| `label` | prop | `string` | `false` | — |
| `hint` | prop | `string` | `false` | — |
| `error` | prop | `string` | `false` | — |
| `required` | prop | `boolean` | `false` | — |
| `update:files` | event | `(files: File[]) => void` | `false` | — |
| `reject` | event | `(files: File[]) => void` | `false` | — |
| `default` | slot | — | `false` | — |

`update:files` is emitted only when the list of files changed, and `reject` receives the rejected files. `label` names the input, and the required `dropLabel` is the visible instruction that describes it and never names it; the instruction paragraph is not rendered without it. The attributes `name` and `form` fall through to the native input, and `accept`, `multiple`, `disabled` and `required` set the matching attributes of the input; `multiple` defaults to `false`. `readonly` does not reach the input as `readonly`: it marks the input `aria-disabled="true"` and the root `data-hw-readonly`, and guards the click and the Enter and Space keys. `maxSize` is in bytes and `getRejectedMessage` is required when `accept` or `maxSize` is set. `getSelectedMessage` renders a status paragraph after the input. The default slot is rendered after the status; compose a `FileUploadList` there. `error` replaces the rejection message and has no role. A reset emits `update:files` with an empty list only when files were selected.

### Angular

Table: Inputs, outputs and content of hw-file-dropzone

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
| `value` | input | `File[]` | `false` | `[]` |
| `readOnly` | input | `boolean` | `false` | `false` |
| `accept` | input | `string` | `false` | `''` |
| `multiple` | input | `boolean` | `false` | `false` |
| `dropLabel` | input | `string` | `true` | — |
| `getSelectedMessage` | input | `(files: readonly File[]) => string` | `false` | — |
| `maxSize` | input | `number` | `false` | — |
| `capture` | input | `'user' \| 'environment' \| ''` | `false` | `''` |
| `getRejectedMessage` | input | `(rejected: readonly File[]) => string` | `false` | — |
| `valueChange` | output | `File[]` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |
| `rejected` | output | `readonly File[]` | `false` | — |
| `*` | content | — | `false` | — |

`HwFileDropzoneComponent` (`hw-file-dropzone`) renders one root with the label, the instruction, the native input, the status, the projected content, the hint and the error. `[(value)]` binds an array of File objects and `valueChange` emits it; `rejected` emits the rejected files once. `label` is required unless `aria-label`, `aria-labelledby` or a surrounding `hw-field` names the input, and `dropLabel` is required. `accept` defaults to the empty string, `multiple` to `false`, `capture` to the empty string, and `readOnly` and `disabled` to `false`. `maxSize` is in bytes, and `getRejectedMessage` is required when `accept` or `maxSize` is set. `getSelectedMessage`, when bound, renders one visible status paragraph after the input; without it no status element is rendered. The content projected into `*` renders after the status, for example `hw-file-upload-list`. A native reset empties the selection and removes a rejection.

## Accessibility

The input is a native file input, so the browser provides its role, its focus behaviour and its chooser; Enter or Space on the focused input opens the chooser. The label names the input and the instruction describes it through `aria-describedby`, together with the hint and the error. A rejection is written into one error paragraph with `role="alert"`, and the input is marked `aria-invalid` until the next accepted batch or a reset. A rejection sets no custom validity and does not block submission, so the server remains responsible for validation.

Only drags that carry files are cancelled; over a disabled or read-only dropzone the drop effect is none and a drop changes nothing. A dropzone being dragged over is marked `data-state="dragging"`. A read-only dropzone keeps the input enabled and focusable, marks it `aria-disabled="true"`, blocks the chooser and drops, and keeps the chosen files in the form; use `disabled` to exclude the files.

Table: Keyboard interaction of FileDropzone

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves focus to the file input and then to the next control. |
| <kbd>Enter</kbd>, <kbd>Space</kbd> | Opens the native file chooser from the focused input. |

## RTL and localisation

The component has no built-in text: the label, the instruction, the hint, the error and the selection and rejection messages are written in the language of the page. The packaged styles use logical properties, so the field follows the reading direction. The names of the chosen files are shown by the browser in its own language and format.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of FileDropzone. The evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The file upload list that composes with the dropzone, its item states and the fact that the application performs the transfers are described in the [file upload states note](../file-upload-states.md).
- The file input type is listed among the native input types in the [coverage notes](../coverage.md).
