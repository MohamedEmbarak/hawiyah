# Tooltip placement

Checklist criterion 33, Sheet1 row 139, requires tooltip position and alignment
to match its context. All four adapters now expose logical placement
(`top`, `bottom`, `start`, `end`) and alignment
(`start`, `center`, `end`). Defaults preserve top/start presentation.

React and Vue use `placement` and `align` props. Angular exposes the same
inputs on `nq-tooltip`. Vanilla accepts the same controller options or
`data-placement` and `data-align` on the element with `role="tooltip"`.
Destroying a vanilla controller restores its authored attributes.

Start/end placement follows the nearest writing direction. For top/bottom,
alignment follows the inline axis. For side placements, alignment follows the
block axis. The existing hover, focus, Escape dismissal and description
association behavior applies to every placement. The guide projects show six
representative combinations in all four adapters.

These options give authors control of placement. Automatic viewport collision
repositioning is not implemented. Choose a side that fits the surrounding
layout. The source checklist establishes the requirement but does not supply
numeric geometry for every variant.
