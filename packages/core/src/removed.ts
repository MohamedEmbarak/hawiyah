// Transitional exports. Hawiyah ships no built-in strings, so the label registries
// that lived here are gone. Their names stay exported, without any text, only so
// that an adapter build made before the change still loads; every value is empty.
// They are typed as RemovedExport, which is neither callable nor assignable to a
// label shape, so source that still uses them fails to type-check.
// Delete this module once no adapter imports from it.

/** Marks an export that no longer exists. The application supplies this text; see CONTRACT.md, "Text and localisation". */
export interface RemovedExport { readonly removed: 'Hawiyah ships no built-in strings' }

const empty = (...names: string[]) => Object.freeze(Object.fromEntries(names.map(name => [name, ''])));
const calendar = empty('calendar', 'date', 'choose', 'previous', 'next', 'open', 'close', 'system', 'gregorian', 'hijri', 'range', 'invalid', 'unavailable', 'unsupported');
const verification = empty('label', 'detailsLabel', 'domainLabel', 'domainDescription', 'httpsLabel', 'httpsDescription', 'registrationLabel', 'externalLabel');

/** @deprecated Removed. Calendar and DatePicker text is supplied by the application. */
export const getCalendarLabels = (() => calendar) as unknown as RemovedExport;
/** @deprecated Removed. SiteVerification text is supplied by the application. */
export const getSiteVerificationLabels = (() => verification) as unknown as RemovedExport;
/** @deprecated Removed. FileUploadList text is supplied by the application as `labels`. */
export const fileUploadLabels = Object.freeze({ ...empty('selected', 'uploading', 'complete', 'error', 'remove'), getProgressLabel: () => '', getRemoveLabel: () => '' }) as unknown as RemovedExport;
