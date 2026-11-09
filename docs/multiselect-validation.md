# MultiSelect selection and validation

MultiSelect requires at least one **known, enabled selected option** when its
required-selection API is enabled. Search text does not satisfy the requirement.
Filtering never removes selected form values. This is a Hawiyah form contract;
decoded DGA styling evidence does not establish native validation behavior.

| Adapter | Required selection | Localized validation message | Readonly selection |
| --- | --- | --- | --- |
| Vanilla | Root `data-hw-required="true"` or controller `required: true` | Controller `requiredMessage`; default follows `data-hw-locale`/nearest `lang`, Arabic by default | Root `data-hw-readonly="true"` |
| React | `required` | `requiredMessage` | `readOnly` |
| Vue | `required` (including provided Field context) | `requiredMessage` | `readonly` |
| Angular | `required` | `validationMessage` | `readOnly` |

Vanilla explicit `required` takes precedence over markup, including `false`.
Pass messages explicitly in framework adapters for the application's locale.
Use a fieldset/legend to name the group and a separate visible or accessible
label for search. Explain the minimum selection in visible help text.

```html
<fieldset data-hw="multi-select" data-hw-required="true" lang="ar">
  <legend>الخدمات المطلوبة — اختر خدمة واحدة على الأقل</legend>
  <label>تصفية الخيارات<input type="search" data-hw-multiselect-search></label>
  <label data-hw-option><input type="checkbox" name="service" value="business">الأعمال</label>
  <label data-hw-option><input type="checkbox" name="service" value="education">التعليم</label>
  <span role="status" data-hw-status></span>
</fieldset>
```

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
- Readonly prevents checkbox changes but allows filtering. Existing selections
  submit normally. Framework checkboxes are disabled for readonly selection and
  their hidden form values remain enabled. Vanilla keeps native checkboxes and
  prevents selection changes so their native values still submit.
- Disabled groups neither block native validation nor submit values. Disabled
  individual options never satisfy required selection or submit. A selected
  option temporarily hidden by search still satisfies the requirement.
- React, Vue and Angular ignore unknown or disabled externally supplied values
  for rendering, native validity and submission without rewriting parent state.
  Restoring an available option restores its externally held selection.
- React/Vue uncontrolled fields and vanilla reset through the native form;
  controlled framework values remain owned by the application. Angular resets
  through Angular Forms/ControlValueAccessor. Reset refreshes validity and
  clears the current filter according to the adapter's default-value contract.
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
Vanilla tests also verify localized defaults, configuration precedence,
cancelled reset and cleanup. Angular tests import the built APF package and must
run after rebuilding it. These tests do not claim visual or screen-reader parity.
