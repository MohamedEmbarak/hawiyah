# NIC checkbox and radio states

Source: the hashed `global.css` snapshot, lines 2729–3009, listed in
[the NIC reference](nic-web-reference.md). The shared styles apply to native
checkbox/radio inputs owned by vanilla, React, Vue and Angular.

| Source | Implementation | Confidence |
| --- | --- | --- |
| 20px control, 1px Neutral 500 border | 20px native input with semantic strong border | High |
| 40px hover halo, 300ms ease-in-out | Decorative halo behind the control; no layout change | High |
| Square checkbox, 12px checked radio dot | CSS check mark/mixed dash and centered radio dot | High |
| Checked checkbox primary; pressed Flag 900 | Primary background; `choice-active` light `#104631` | High |
| Disabled neutral mark; read-only primary mark | Distinct disabled/read-only checked presentation | High |
| Focus and read-only handling | Visible 2px keyboard focus, guarded pointer/keyboard activation | Adapted |

Read-only choices remain keyboard-focusable and submit their value. Unlike a
native text field, the HTML readonly attribute alone does not stop a checkbox
or radio. The shared `observeReadonlyChoice` helper guards activation without
rendering DOM, preserves radio peers, tracks form reset and provides cleanup.
Vanilla `enhance` installs it; each native adapter installs it in its lifecycle.
Vue and Angular now expose `readOnly` for Checkbox, Radio and Switch. React's
existing read-only API uses the same guard. Disabled controls retain native
disabled behavior. The switch's geometry is unchanged by this task.

The guide shows default, selected, disabled and read-only examples. Keep labels
clickable using `.nq-choice`; the 20px glyph is not the whole interaction target.
The source's radio focus square is adapted to an outline around the native
control, preserving independent controls and visible keyboard focus. The halo
is anchored to the input's center and painted behind it in the label's isolated
stacking context. This works for plain inline labels as well as flex/wrapped
labels, without covering the square border or glyph. Original Nasaq uses platform
widgets; forced colors restores platform painting, and reduced motion disables
the halo. Dark mode uses semantic surfaces and a visible pressed accent.

Eight Chromium cases passed across all four adapters and RTL/LTR. They cover
click/Space selection, disabled and mixed states, read-only pointer/keyboard
protection, radio-peer preservation, reduced motion, forced colors and original
theme fallback. Eight focused core/token tests and the full consumer build
passed. This is scoped coverage, not certification or full visual parity.

Follow-up hover regression: four vanilla cases and six native-framework cases
passed after anchoring the halo directly to the input. Plain inline labels,
flex labels and wrapped labels retain the same halo center in RTL/LTR. The
guide editor's actual rendered inline-label example was also inspected.
