# MultiSelect selection and validation

MultiSelect requires at least one **known, enabled selected option** when its
required-selection API is enabled. Search text does not satisfy the requirement.
Filtering never removes selected form values. This is a Hawiyah form contract;
decoded DGA styling evidence does not establish native validation behavior.

| Adapter | Required selection | Validation message | Readonly selection |
| --- | --- | --- | --- |
| Vanilla | Root `data-hw-required="true"` or controller `required: true` | Root `data-hw-required-message` or controller `requiredMessage`; no default | Root `data-hw-readonly="true"` |
| React | `required` | `requiredMessage` | `readOnly` |
| Vue | `required` (including provided Field context) | `requiredMessage` | `readonly` |
| Angular | `required` | `requiredMessage` | `readOnly` |

Vanilla explicit `required` takes precedence over markup, including `false`.
The message is application text in every adapter and is required when the
required-selection API is enabled; without it the constraint still blocks
submission and a development warning names the missing input. `searchLabel`,
`emptyMessage` and `getResultsMessage(count)` are required in every adapter
(vanilla: `data-hw-results-message` or the option); `getSelectedMessage(count)`
is optional and adds the selected-count line.
The fieldset legend names the group and shows the one required marker; the
filter input has its own visible `label.hw-label` from `searchLabel`. The marker
is not the only carrier of the requirement: explain the minimum selection in
visible hint text.

```html
<fieldset class="hw-field hw-multi-select" data-hw="multi-select" data-hw-required="true"
          data-hw-required-message="اختر خيارًا واحدًا على الأقل."
          data-hw-results-message="{count} خيارات">
  <legend class="hw-label">الخدمات المطلوبة<span class="hw-required-marker" aria-hidden="true"> *</span></legend>
  <p class="hw-hint" id="services-hint">اختر خدمة واحدة على الأقل.</p>
  <label class="hw-label" for="services-search">تصفية الخيارات</label>
  <input class="hw-input" id="services-search" type="search" data-hw-multiselect-search aria-describedby="services-hint">
  <div class="hw-multi-select-options">
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="service" value="business">الأعمال</label>
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="service" value="education">التعليم</label>
  </div>
</fieldset>
```

The controller creates the polite results status when none is authored and
writes the count only after the reader filters.

For explicit enhancement, call `createMultiSelect(root, { required: true,
requiredMessage: 'اختر خدمة واحدة على الأقل.' })` and retain its `destroy()`
cleanup. `enhance()` reads the data attribute with no extra configuration.
Required selection needs JavaScript; plain checkboxes remain usable without it.
Do not use native `required` on search or every checkbox: those mean required
search text or individually required checkboxes, respectively.

## Form behavior

- Custom validity belongs to the visible, focusable search input. It exposes
  `aria-required`; readonly selection leaves this input editable and eligible
  for native validity. React and Angular now also attach the group's hint/error
  descriptions and error state to this focus target, as Vue already did.
  `aria-invalid` never depends on the message: it is set from `error`, from an
  explicit `aria-invalid`, or after a failed submission (the input's `invalid`
  event) until the selection is valid again or the form resets.
- Readonly prevents checkbox changes but allows filtering. Existing selections
  submit normally. In every adapter the checkboxes stay enabled and focusable
  with `aria-disabled="true"`, and selection changes are prevented; framework
  hidden form values and vanilla native checkbox values still submit.
- Disabled groups neither block native validation nor submit values. Disabled
  individual options never satisfy required selection or submit. A selected
  option temporarily hidden by search still satisfies the requirement.
- React, Vue and Angular ignore unknown or disabled externally supplied values
  for rendering, native validity and submission without rewriting parent state.
  Restoring an available option restores its externally held selection.
- A native form reset returns the selection to its reset target in all four
  adapters (React and Vue `defaultValue`, the Angular value after the first
  inputs, the authored vanilla checks) and notifies once when the selection
  changed; a controlled React value is shown again when the application ignores
  the notification, and with Angular Forms attached the model keeps ownership.
  Reset refreshes validity, removes a submission `aria-invalid` and empties the
  filter and the results status.
- Vanilla observes disabled attributes and root required/readonly attributes.
  Programmatic checkbox changes should dispatch `change`. Destroy restores
  original custom validity, ARIA attributes, filter state and status text.
  Destroy/recreate the controller before replacing its option nodes.

Angular's native search validity is separate from application Angular Forms
validators. Add an appropriate FormControl validator if application code relies
on `control.valid` rather than native form submission validity.

## Scoped regression coverage

`multiselect-validation` tests in all four adapters cover required/readonly/
disabled states, focusability, selection values, filtering and reset. The
existing `input-contracts` suites cover unknown values and dynamic option lists.
Vanilla tests also verify text sources, configuration precedence,
cancelled reset and cleanup. Angular tests import the built APF package and must
run after rebuilding it. These tests do not claim visual or screen-reader parity.
