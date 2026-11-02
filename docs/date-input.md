# Custom date input

DatePicker uses an editable text input and Nasaq's calendar dialog in every
adapter. It never renders `type="date"`, so the browser's date-picker popup is
not offered. Type a Gregorian ISO date (`YYYY-MM-DD`), or activate the calendar
button / ArrowDown (including Alt+ArrowDown). Clicking the text input edits it;
Enter retains normal form submission. The display calendar may be Gregorian or
Umm al-Qura; typed and submitted values remain Gregorian ISO dates.

The field maintains a visible draft and a canonical value. A valid ISO date or
empty string updates the public value; malformed drafts remain visible, report
an error and block native form submission without emitting malformed values.
The previous canonical value is retained until the user repairs or clears the
draft. A valid date outside min/max, the provider's range or `isDateDisabled`
still has a canonical ISO representation but is invalid for submission.

The visible text input is the focusable validation control. A hidden input owns
the original `name`, optional `form` association and canonical submission value;
it has no validation responsibility. A ref to the visible input reads localized
display text while idle and the ISO draft while editing; it has no submitted name. Use the component value/controller for canonical
data. Calling `new FormData(form)` directly does not run validation: applications
must use native form submission or `reportValidity()`/framework validation first.
Required, readonly, disabled, reset and focus return remain supported. A malformed
external value is shown as invalid text and never used as a calendar anchor.

React, Vue and Angular expose `invalidMessage` for localized ISO/bounds errors.
Vanilla accepts it in `DatePickerOptions`, alongside `isDateDisabled`. Other
existing unavailable/provider labels remain adapter-specific. The guide explains
the ISO format in Arabic and English. The pinned Umm al-Qura provider, range and
calendar arithmetic are unchanged.

Vanilla markup should use `type="text" data-nq-date-input` with a format hint.
Enhancement also converts existing `type="date"` markup to text. It restores the
original type/name/value on destruction. Runtime min/max changes refresh both
validation and the calendar grid; name changes transfer to the canonical input.
Framework adapters continue to own their DOM and do not use vanilla enhancement.


## Compact field and calendar display

A calendar icon sits inside the field at its logical end. The closed field shows
a medium date in the active Gregorian/Hijri calendar, with Latin digits. Focusing
an editable field switches synchronously to its Gregorian ISO draft; blur restores
the localized display for a valid date. Invalid drafts remain visible. Readonly
fields keep their formatted display.

The calendar selector is a green rectangular radio switch with native arrow-key
behavior and a sliding indicator. Reduced motion disables that transition.
The popup reserves six week rows, including empty presentation rows where needed,
so switching calendar or month does not move the dialog. The core month model and
calendar math are unchanged.

A small muted information icon beside the Hijri month heading reveals the supported
range on hover or keyboard focus. It is not a clickable disclosure. Escape dismisses
the tooltip while keeping the calendar open. Unsupported dates still produce a
visible input validation error; the tooltip does not replace that error.

The guide's month, ISO-week and local-datetime examples also use Nasaq's custom
calendar. They project the selected ISO day to YYYY-MM, YYYY-Www, or a local ISO
datetime; the latter composes a separate native time input. Browser date/month/week/
datetime-local pickers are not offered. Their ISO submission examples remain explicit.
