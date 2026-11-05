# File transfer state and removal

`FileUploadList` composes with FileUpload and FileDropzone in React and Vue.
Angular exposes `NqFileUploadListComponent` with `nq-file-upload-list`. Vanilla
exposes `createFileUploadList(host, options)` with `update(items)`, `setDisabled(value)` and `destroy()`.

Each `FileUploadItem` has a stable `id`, a filename and a status of `selected`,
`uploading`, `complete` or `error`. Optional `message` supplies server feedback.
Uploading items expose a native progress element. A finite percentage is bounded
to 0–100. Missing/nonfinite progress is indeterminate. Filenames render as text.
Arabic labels are the default, and every label accepts a translated replacement.

The host performs transfers and supplies their actual state. A removal callback
requests removal by stable ID. React/vanilla show removal when a callback exists.
Vue/Angular opt into actions using `removable`, emitting `remove`. Each item's
`removable: false` suppresses its action. `disabled` disables actions globally.
The host cancels pending requests and updates the list after removal. It must
also update its selected files and native FileList when those files participate
in native form submission. This presentation does not change the native picker.

The upload and dropzone editor projects show every state in both languages,
using explicitly illustrative data. Removal updates the example state locally.
The selected-file list demonstrates removal by updating the native FileList,
dispatching the owning control's change event, and returning focus to the input.
Its submitted FormData therefore matches the remaining displayed files. The
separate transfer examples distinguish real selection from illustrative remote
states. No successful remote transfer is inferred from file selection.

This closes the reusable status/removal presentation gap identified in checklist
row 83. Exact official visual equivalence remains part of the source comparison.
