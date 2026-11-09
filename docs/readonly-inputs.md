# Read-only choice and range controls

Read-only controls remain focusable and keep their named form values. Disabled
controls retain native disabled behavior, including when inherited from a
disabled fieldset. A read-only state prevents editing; it does not replace the
control with a disabled surrogate.

React `Checkbox`, `Radio` and `Switch` now guard native clicks and value-changing
keys when `readOnly` is true. Their values and change callbacks stay unchanged;
`aria-disabled="true"` communicates that the choice cannot be edited while
allowing keyboard focus. Consumer click/key handlers still run. For uncontrolled
radio groups, the last committed selection is restored when a canceled activation
would clear a checked peer. Switching between editable and read-only states keeps
the current selection. Normal form resets and editable radio changes remain
native.

React and Angular `Slider`/`RangeSlider`, and Vue's existing read-only ranges, use
`aria-readonly="true"`. Read-only pointer gestures and Arrow/Home/End/Page keys
cannot change their values. Tab, Escape and unrelated keys retain their normal
behavior. The range input keeps its name and form value; Angular no longer needs
duplicate hidden inputs to submit read-only values. Guards also check effective
disabled state before accepting input events.

The vanilla `createRangeSlider` retains its existing gesture guards and now
synchronizes `aria-readonly` on both handles with `data-hw-readonly="true"` or
`aria-readonly="true"` on the root. Changing either root attribute updates the
handles; destruction restores the original handle attributes. A plain unenhanced
`input[type="range"]` has no native read-only behavior: applications should use
the supported adapter/controller when they need it.

React and Angular now place the existing `hw-slider` class on the native range
control, matching Vue and vanilla. The surrounding field retains intrinsic
height, and the input receives the shared track, thumb and focus styles rather
than text-field styling. Motion timing remains unchanged. Read-only choices must
remain visibly distinguishable and keyboard focus must remain visible, including
in forced-colors mode.
