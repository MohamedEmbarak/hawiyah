# Date picker presentation

The date picker uses an editable ISO text input and Nasaq’s calendar in a native modal dialog. Its submitted
value remains a Gregorian ISO date; switching the displayed calendar does not
rewrite that value. This presentation update does not change the pinned
Umm al-Qura provider, date calculations, supported range, or calendar keyboard
navigation.

The supplied guide screenshot exposed an oversized generic dialog with no
visible title, small calendar labels and an Arabic range whose ISO endpoints
were visually reordered. Date-picker dialogs now have a 26rem maximum width,
responsive viewport margins, a visible header and a padded body in the vanilla
recipes. Framework dialogs retain their native adapter-owned header/body.
The calendar fills the body without a second bordered card. Day buttons have
a 44px minimum height at a 16px root, and larger day/weekday/navigation text.
Month navigation uses the existing curated 24px arrow masks in 44px buttons,
mirrored in RTL, with localized accessible names. Narrow picker dialogs reduce
side padding and keep weekday words intact. The vanilla supported-date range
appears on its own isolated line below a short localized label.
Seven columns remain fluid on narrow screens; this is not a claim that every
day has a 44px-wide target.

Formatted dates and validation messages occupy a row below the input controls.
Popup text wraps even when the React dialog is nested in an input addon. Visible
ISO endpoints in range messages use `bdi dir="ltr"`; native validation strings
and submitted dates remain unchanged. Caller-provided messages remain text,
with no HTML interpretation.

For vanilla markup, provide `.nq-dialog-header` with a visible heading and
`[data-nq-date-close]` button, followed by `.nq-dialog-body` containing
`[data-nq-date-calendar]`. Keep an accessible dialog name via `aria-labelledby`
or `aria-label`. See the bilingual component guide and the vanilla expansion
API for complete recipes. Existing public classes and enhancement hooks remain
supported; adapters continue to own their DOM.

Regression coverage includes endpoint isolation in each adapter and open-popup
geometry, output placement, day height and Escape focus return at 320px and
390px. Unit checks cannot establish visual parity. The screenshot-driven fixes
are Nasaq usability improvements, not evidence of DGA certification or a claim
that these dimensions were extracted from a DGA calendar component. Hajj is
outside this work.

The custom-only input and draft/submission contract is documented in [date-input.md](date-input.md).
