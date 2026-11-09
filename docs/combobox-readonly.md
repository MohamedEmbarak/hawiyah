# Read-only combobox

Use `readOnly` in React and Angular, `readonly` in Vue, or the native `readonly`
attribute/property on vanilla's `[data-hw-combobox-input]`. Angular's input is an
additive boolean API and supports boolean attribute coercion.

The textbox remains focusable and selectable for copying. Native `readonly`
and `aria-readonly="true"` describe the state. Existing shared focus styling stays
active, including forced colors. The selected option identifier remains in the
named hidden input and participates in FormData. Do not replace read-only with
disabled when the value must be submitted.

Read-only blocks opening, option navigation/selection, editing, and query/value
change notifications from blocked interactions. Applying it to an open control
closes the list and removes the active descendant. Removing it does not reopen
an uncontrolled popup. React's externally controlled `open` remains owned by
the caller, while rendering always suppresses it during read-only or disabled
states. Application value updates are still allowed.

Disabled inputs and native disabled fieldsets block the same interactions.
Existing ancestor fieldsets are observed so disabling one closes an open list;
the native first-legend exception remains intact. Disabled controls are omitted
from form submission by native browser semantics. Observers are disconnected
when the framework unmounts or vanilla `destroy()` runs.

Reset retains each adapter's existing ownership rules: vanilla restores the
initial selection, React resets uncontrolled state to `defaultValue`, Vue uses
its model/default-value contract, and Angular forms reset through its value
accessor. Read-only does not prevent application/form resets. Vanilla restores
the prior ARIA attributes on destruction without changing the caller's readonly
attribute.

Focused regression tests cover transitions while open, blocked query events,
preserved submitted values/focus, reset/value-accessor writes, disabled ancestor
changes, and the first-legend exception. This is a behavior/accessibility fix;
it makes no claim of official DGA certification or visual parity.
