# File transfer state and removal

`FileUploadList` composes with FileUpload and FileDropzone in React and Vue.
Angular exposes `HwFileUploadListComponent` with `hw-file-upload-list`. Vanilla
exposes `createFileUploadList(host, options)` with `update(items)`, `setDisabled(value)` and `destroy()`.

Each `FileUploadItem` has a stable `id`, a filename and a status of `selected`,
`uploading`, `complete` or `error`. Optional `message` supplies server feedback.
Uploading items expose a native progress element. A finite percentage is bounded
to 0–100. Missing/nonfinite progress is indeterminate. Filenames render as text.
The application supplies every text through the required `labels`
(`FileUploadLabels`): `selected`, `uploading`, `complete`, `error` and `remove`,
plus `getProgressLabel(name)` and `getRemoveLabel(name)`, which return the
whole accessible name of one file's progress bar and remove button. The former
core `fileUploadLabels` defaults are removed.

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

This implements the reusable status/removal presentation in checklist row 83.

## Uploaded-row source comparison

The supplied Mobile Components export contains local uploaded-row definitions
`5698:34512` (LTR) and `10705:1294` (RTL), on the File upload canvas.
Both are 328×36px with a 4px radius, a #F3F4F6 fill and #D2D6DB border.
Their content frames use 8px spacing and insets, 20px feedback/close slots,
and a 14px/20px medium filename. The later single-upload definition
`11261:13384` measures 326×120px because it includes a label and helper text.
Its row instance `11261:27400` references `5698:34512` and remains 36px high.
The outer component size therefore does not establish a conflicting row height.

These are local source definitions rather than the older imported-reference
or internal-cache variants in the export. Their colors include external
variable aliases. The literal decoded paint values are used for this comparison;
the aliases do not independently establish a globally resolved mode.
The NIC stylesheet snapshot contains no file-upload selectors.

The earlier Hawiyah row stacked the filename, default status and a full text
remove button. The row now follows the compact source arrangement. Default
selected/completed status text remains available to assistive technology.
Custom status messages, errors and transfer progress remain visible below the
filename. Long filenames wrap and grow the row instead of clipping. The remove
action retains its localized accessible name and a 28px pointer target around
the source-sized 20px icon, expanded to 44px for coarse pointers.

The source RTL filename uses IBM Plex Sans Arabic; the LTR definition uses
Inter. Hawiyah retains the approved IBM Plex Sans Arabic typography policy in
both directions. The existing licensed check and close artwork are reused,
and the source glyph shapes have not been established as equivalent. The
selected/error status ring is independently authored. Those artwork and
expanded-message differences remain explicit adaptations.

The browser comparison renders an independent fixture from the decoded source
geometry and literal colors, then compares the actual four-adapter examples.
It is a reconstruction-based measurement, rather than a native Figma screenshot
or an assertion of complete pixel parity.

Four Chromium cases passed, one per adapter, comparing row height, fill, border,
radius, spacing, typography and close-action geometry. They also verify visible
custom errors/progress, the expanded coarse-pointer action, removal and narrow
long-filename containment. Visual inspection of the captured rows found and
corrected an inherited white close glyph on the light background. The final
close glyph uses the semantic text color.
