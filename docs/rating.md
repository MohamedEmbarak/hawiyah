# Rating

Rating uses a labelled native radio group in ascending value order. Selecting
three highlights stars one through three while only the third radio is checked
and submitted. This shared CSS behavior applies to vanilla, React, Vue and
Angular, including Arabic/RTL and English/LTR layouts.

On devices with hover, pointing at a star previews the full range up to it.
Moving away restores the checked value. Preview does not change form data or
emit a value-change event. Disabled and read-only controls do not preview.
The native radio keyboard behavior remains: Tab enters/leaves the group and
arrow keys move selection. Focus remains visible on the focused star.

```html
<fieldset class="nq-rating" data-nq="rating">
  <legend>قيّم الخدمة</legend>
  <label><input type="radio" name="rating" value="1" required aria-label="١ من ٣"><span aria-hidden="true">★</span></label>
  <label><input type="radio" name="rating" value="2" checked aria-label="٢ من ٣"><span aria-hidden="true">★</span></label>
  <label><input type="radio" name="rating" value="3" aria-label="٣ من ٣"><span aria-hidden="true">★</span></label>
</fieldset>
```

Keep labels as siblings, either directly in the fieldset or in one wrapper.
Do not reverse DOM order for RTL; inherited direction handles placement.
The star span is decorative; the radio needs its numeric accessible name.
Native `name`, `required`, disabled fieldsets and form reset retain their semantics.
An editable vanilla rating works without JavaScript. Call `enhance()` or
`createRating(fieldset)` when using `data-nq-readonly="true"`; HTML radios do not
have a native readonly mode. The controller blocks changes while retaining
keyboard focus and submission of the checked value. Call `destroy()`/cleanup
when removing an enhanced vanilla tree.

React uses `readOnly`, Vue uses `readonly`, and Angular uses `readOnly`.
These modes keep radios focusable and expose `aria-disabled="true"` while
blocking pointer/selection keys; Tab and Shift+Tab remain native. Angular no
longer disables the entire group for read-only presentation or adds a duplicate
hidden form value. Actual disabled controls remain excluded from form submission.
React/Vue restore their uncontrolled default on native form reset; Angular
continues to reset through its forms value accessor.

This is an interaction correction and approved accessibility adaptation, not a
claim of official DGA certification or pixel parity with every supplied variant.
