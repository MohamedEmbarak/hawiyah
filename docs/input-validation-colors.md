# Input validation colors

The shared field underline distinguishes validation from focus:

| State | Underline |
| --- | --- |
| Unedited / not yet user-validated | Neutral control-border gray |
| User-valid | Theme primary text (green in DGA light/dark) |
| User-invalid | Danger red |
| Explicit application error (`aria-invalid="true"`) | Danger red, even if native constraints pass |

Native `:user-valid` / `:user-invalid` determine when the user has edited and
committed a value or attempted form submission. Merely focusing an optional field
does not imply success. A focus/blur without editing is still unvalidated; the
browser controls this interaction threshold. Native form reset clears these user
validation states. Supplying an explicit error means the application has already
validated the field; applications should gate their error props on touched or
submitted state if they want to delay displaying those errors.

These styles apply to input, textarea and select, including filled variants,
in vanilla, React, Vue and Angular. No framework DOM enhancement or separate
validation calculation is introduced. Native/custom validity, application error
messages, calendar ISO values and the Umm al-Qura provider remain authoritative.
When a browser lacks user-validation pseudo-classes, native fields stay neutral
until explicitly marked invalid rather than showing premature success.

Focus still expands the line using the existing duration/easing and does not add
a duplicate outer outline. Read-only, forced-colors and original Nasaq theme
focus treatments remain available. Reduced motion removes the transition.
This is a product-approved adaptation, not a newly verified DGA source rule.
