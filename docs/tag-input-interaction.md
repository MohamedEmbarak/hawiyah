# Tag input interaction

All four adapters commit a nonempty draft with unmodified Enter or comma and
remove the last tag with unmodified Backspace only when the draft is empty.
Control/Alt/Meta shortcuts and IME composition do not commit or delete tags.
Empty Enter remains available to the owning form. A consumer-prevented key event
is not handled again.

Activating a chip's remove button moves focus to the remove button of the next
chip, else of the previous chip, else to the draft editor. There is no Add
button in any adapter. The field is `div.hw-field` with the label, the bordered
`div.hw-tag-input` (holding only the chip list and the draft editor) and the
hint; a required TagInput explains the requirement in its hint. Readonly and effectively
disabled controls cannot change selections, including inherited disabled
fieldsets. Native fieldset first-legend behavior is preserved.

A native form reset returns the tags to their reset target and empties the
draft in all four adapters, notifying once when the tags changed; with Angular
Forms attached the model keeps ownership. Only committed tags satisfy required
validation or appear in the submitted tag values. Existing duplicate matching and
vanilla paste splitting are unchanged.

These fixes extend input-state coverage identified during the DGA alignment
review. They are verified browser/input contracts, not interaction requirements
inferred from Figma metadata.
