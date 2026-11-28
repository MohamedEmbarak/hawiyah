// Template fragments shared by the value controls. Internal: not exported from public-api.ts.
// Optional field text renders nothing when it is absent: no empty label or legend, no empty paragraph.
// The required marker is the last child of the label or legend and never the only carrier of the requirement.
export const fieldLabel = `@if (label) {<label class="hw-label" [id]="decorationId + '-label'" [for]="controlId">{{ label }}@if (required) {<span class="hw-required-marker" aria-hidden="true"> *</span>}</label>}`;
export const fieldLegend = `@if (label) {<legend class="hw-label">{{ label }}@if (required) {<span class="hw-required-marker" aria-hidden="true"> *</span>}</legend>}`;
// The application's error is static text read with the control; a message the component produced is an alert.
export const fieldEnd = `@if (hint) {<p class="hw-hint" [id]="decorationId + '-hint'">{{ hint }}</p>}@if (shownError) {<p class="hw-error" [id]="decorationId + '-error'" [attr.role]="error ? null : 'alert'">{{ shownError }}</p>}`;
/** The four forwarded attributes on the native control, or on the fieldset of a group. */
export const controlAria = `[attr.aria-label]="ariaLabel" [attr.aria-labelledby]="labelledBy" [attr.aria-describedby]="descriptionIds" [attr.aria-invalid]="invalid"`;
/** A single native control reports focus and blur itself: the native events do not bubble to the host. */
export const controlFocus = `(focus)="focusEvents.emit($event)" (blur)="touch(); blurEvents.emit($event)"`;
/** A group reports focus entering and leaving its fieldset; moving between two options reports nothing. */
export const groupFocus = `(focusin)="entered($event)" (focusout)="left($event)"`;

/** Ids in the order given (the application's, the field's, the hint, the error), without duplicates. */
export function fieldDescriptionIds(...ids: (string | null | undefined)[]): string | null {
  return [...new Set(ids.flatMap(id => id ? id.trim().split(/\s+/).filter(Boolean) : []))].join(' ') || null;
}
