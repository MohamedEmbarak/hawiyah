# Search field composition

SearchField uses a native search input with one named clear icon inset at the
logical end. Shared CSS suppresses the browser cancel decoration only within
`.hw-search-control`. Plain native search inputs keep browser behavior.
This closes an adapter consistency gap; it is not a claim of pixel parity with
an official DGA search template.

The clear action empties the query, returns focus to the input, and never submits
the form. It is hidden for empty/read-only values and respects disabled fields
and ancestor fieldsets. Native labels, required validation, names, descriptions
and error associations remain on the input. Applications own search execution,
debounce, requests and result announcements.

React uses `value/defaultValue/onValueChange`; Vue uses
`modelValue/defaultValue/update:modelValue`; Angular uses its existing
`value/valueChange` or ControlValueAccessor. Vue `search` and Angular `searched`
Enter callbacks ignore composition and Ctrl/Alt/Meta-modified keys. React and
vanilla retain native form submission. Angular also retains its Search button.
Supply `clearLabel` in every adapter, `searchLabel` when the search button is
shown and `getResultsMessage(count)` when suggestions are given.

Vanilla `createSearchField(root, { clearLabel, onValueChange })`, or
`enhance` with `data-hw="search-field"`, connects `data-hw-search-input` and
`data-hw-search-clear`. The controller exposes `value`, `clear()`,
`setValue(value)` and `destroy()`. Clearing emits native input/change and one
`hw:change` with `{ value }`. `setValue` synchronizes without emitting events.
Native reset synchronizes the action; destroy removes listeners/observers and
restores the action markup and generated input ID without erasing edited text.
React/Vue uncontrolled reset restores the initial query; controlled applications
and Angular forms own model reset.

The icon uses the existing MIT-licensed Hugeicons `cancel-01` asset. No official
asset was added. The guide and native consumers demonstrate the composition.
Behavior coverage includes all four adapters, reset/validation, focus, disabled
fieldsets, read-only values, IME callbacks and vanilla cleanup. Browser coverage
checks RTL/LTR geometry, keyboard operation and the native input showcase's axe
checks; the vanilla guide has a mobile geometry/reset check.
