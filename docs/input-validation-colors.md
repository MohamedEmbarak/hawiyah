# Input validation colors

The shared field underline distinguishes validation from focus:

| State | Underline |
| --- | --- |
| Empty / not yet valid | Dark neutral text color (#161616 in DGA light mode) |
| Nonempty and natively valid, including prefilled values | Theme primary text (green in DGA light/dark) |
| User-invalid | Danger red |
| Explicit application error (`aria-invalid="true"`) | Danger red, even if native constraints pass |

Native `:valid` and adapter-owned value presence determine success, without
requiring an edit. Empty optional fields remain neutral. Native `:user-invalid`
determines when an invalid edit or submission is exposed. An empty untouched
field remains neutral unless the application supplies an explicit error; the
browser controls the native user-invalid threshold. Native form reset restores value presence and clears user
validation states. Supplying an explicit error means the application has already
validated the field; applications should gate their error props on touched or
submitted state if they want to delay displaying those errors.

These styles apply to input, textarea and select, including filled variants,
in vanilla, React, Vue and Angular. Each adapter tracks `data-nq-filled` on its own
native fields using the core `observeFieldValue(element)` lifecycle helper.
Framework renders refresh controlled values; native input/change/reset events
refresh uncontrolled values. Vanilla `enhance(root)` includes plain native fields;
direct date/search controllers also refresh their own programmatic changes.
For manually managed plain vanilla inputs, use `enhance` or `observeFieldValue`
and call `refresh()` after assigning `.value` without input/change events.
The observer is reference-counted and restores its original attribute on destroy.
No vanilla enhancement of framework-owned DOM or separate validation calculation
is introduced. Native/custom validity, application error
messages, calendar ISO values and the Umm al-Qura provider remain authoritative.
When a browser lacks `:user-invalid`, explicit application errors still show red.

Focus expands the line using the existing duration/easing; blur hides it. No
success line remains visible at rest. This does not add
a duplicate outer outline. Read-only, forced-colors and original Nasaq theme
focus treatments remain available. Reduced motion removes the transition.
This is a product-approved adaptation, not a newly verified DGA source rule.
