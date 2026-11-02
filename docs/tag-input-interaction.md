# Tag input interaction

All four adapters commit a nonempty draft with unmodified Enter or comma and
remove the last tag with unmodified Backspace only when the draft is empty.
Control/Alt/Meta shortcuts and IME composition do not commit or delete tags.
Empty Enter remains available to the owning form. A consumer-prevented key event
is not handled again.

Removing a chip returns focus to the draft editor. Readonly and effectively
disabled controls cannot change selections, including inherited disabled
fieldsets. Native fieldset first-legend behavior is preserved.

Native form reset restores uncontrolled React/Vue and vanilla values and drafts;
Angular resets through its FormControl/CVA. Only committed tags satisfy required
validation or appear in the submitted tag values. Existing duplicate matching and
vanilla paste splitting are unchanged.

These fixes extend input-state coverage identified during the DGA alignment
review. They are verified browser/input contracts, not interaction requirements
inferred from Figma metadata. Public classes, labels and value APIs are unchanged.
