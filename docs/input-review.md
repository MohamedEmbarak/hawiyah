# Input contract review

This bounded review covers the guide's form recipes and native input, select,
textarea, choice, password, PIN, tags, multiselect, file and combobox contracts in
the vanilla, React, Vue and Angular adapters. It is a source and focused DOM
behavior review, not a claim of visual parity or exhaustive assistive-technology
testing. Rating, date and readonly choice fixes have separate coverage.

## Corrected defects

| Control | Observed defect | Corrected contract | Evidence |
| --- | --- | --- | --- |
| React FileDropzone | A `.txt` selected through the native picker reached `onFilesChange` when `accept=".pdf"`; drop validation rejected the same file. | Picker and drop use one acceptance check. A rejected selection clears the selected list/native value, reports the rejection and emits an empty accepted-file list. Native `accept` remains a picker hint; server validation is still the application's responsibility. | `packages/react/src/expanded-controls.tsx`, `react.input-contracts.test.tsx` |
| Vue/Angular MultiSelect | A required control containing only an unknown value passed native validity and submitted that invisible value. Disabled options could also be submitted. | Only known, enabled values count toward required validity, checked state, summary and hidden form values. Option-list changes do not destructively rewrite or emit the parent's model. Restoring an option restores its externally held selection. User changes produce the currently valid selection. | `packages/vue/src/controls.ts`, `packages/angular/src/advanced-controls.ts`, their `input-contracts.test.ts` files |
| Vue/Angular PinInput | Arabic-digit defaults and external values bypassed input-event normalization. Angular also accepted optional partial codes. | Display and native submission normalize Arabic and Eastern Arabic digits to ASCII, remove nondigits and truncate to configured length. A nonempty PIN must have that exact length. External values are rendered canonically without emitting a parent update; input events emit canonical values. Native/Angular form reset restores the canonical default. | Same adapter files and tests; React's existing external-value contract is also tested |
| React/Angular TagInput | React's required group did not expose `aria-required` on its draft editor. Angular's editor used conditional native required instead of a consistent committed-tag contract. | `aria-required` exposes the requirement. Custom validity checks committed tags; an empty editor is valid when tags exist, and an uncommitted draft cannot satisfy an empty required group. Hidden values submit committed tags. Vue and vanilla already followed this model. | React/Angular adapter files and tests; Vue existing behavior is covered |
| Angular Switch | An error was visually decorated and described, but the switch input did not expose `aria-invalid`. | The native switch exposes `aria-invalid="true"` while an error exists and removes it when the error is cleared; linked hint/error descriptions remain intact. | `packages/angular/src/forms.ts`, `packages/angular/test/input-contracts.test.ts` |

## Verified expectations and boundaries

- Labels, hints and error IDs are owned by each adapter; framework trees are not
  enhanced with vanilla controllers. The focused tests keep Arabic labels and
  exercise native `FormData` and constraint validation rather than inspecting
  private component state alone.
- Disabled native controls are excluded from submission. Readonly textual
  controls retain their value and focus; readonly choice behavior is covered by
  the separate readonly-control tests. A native select or file input does not
  acquire readonly semantics merely from an unsupported HTML attribute.
- React/Vue uncontrolled defaults and vanilla markup use native form reset.
  Angular uses its ControlValueAccessor and Angular Forms reset. This is an
  intentional integration difference, not a requirement to mutate the Angular
  model from an unrelated native reset event.
- PIN values use ASCII digits for application/form data while Arabic labels and
  surrounding direction remain supported. This does not change date values or
  calendar conversion.
- Validation/removal/search strings remain caller-configurable. English adapter
  fallback strings do not imply that the guide's Arabic default is changed;
  applications must supply localized copy for their chosen locale.
- File acceptance is not a security boundary and does not replace application
  upload limits or content validation. This change aligns the two client input
  paths without adding upload behavior.

## Remaining bounded findings

- The required-selection and readonly API gaps are now covered in all four
  adapters; see [MultiSelect validation](multiselect-validation.md) and
  [Combobox readonly behavior](combobox-readonly.md).
- Native select popup rendering and mobile keyboards depend on the browser and
  operating system. Source inspection alone does not establish rendered parity.

## Regression checks

Focused suites:

- `packages/react/react.input-contracts.test.tsx`: picker/drop rejection,
  committed-tag required/reset semantics, external PIN normalization.
- `packages/vue/test/input-contracts.test.ts`: changing option lists and stale
  values, external/default/reset PIN normalization, required tag semantics.
- `packages/angular/test/input-contracts.test.ts`: stale selections without
  parent writes, external/reset/disabled PIN values and exact-length validity,
  committed tags versus draft validity, and switch error semantics. This suite imports the Angular package
  and must run after rebuilding its APF output.

The focused React/Vue run passed all seven tests. Final integrated build and
Angular regression results belong in the validation report after the rebuilt
packages are tested.
