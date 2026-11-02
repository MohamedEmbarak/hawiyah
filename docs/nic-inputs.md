# NIC input states and motion

The supplied `global.css` 2431–2648 now takes precedence over earlier inferred
Figma web-input properties. The hashed source is listed in
[NIC web reference](nic-web-reference.md).

| Source requirement | Nasaq implementation | Confidence |
| --- | --- | --- |
| Label font 16px, weight 600 (2431) | DGA `.nq-label` uses 16px; weight remains 600 | High |
| Input horizontal padding 16px (2457) | Logical start/end padding 16px; integrated password/calendar actions keep space for their controls | High |
| 40px normal input/select (2490) | Existing comfortable 40px density retained; compact/mobile options remain | High |
| Neutral 700 hover, Neutral 950 focus border | Semantic hover/focused-field roles; focused light neutral `#0c111b` | High |
| No focused box shadow (2535, 2588) | DGA focus shadow removed; no duplicate outer outline | High |
| Centered underline, 500ms ease (2554, 2610) | `--nq-duration-input:500ms`, `--nq-ease-input:ease`; only underline size animates | High |
| 50% pressed → 100% focused underline (2621) | DGA pressed/focus sizes updated | High |
| A single line across input/addon group (2554–2581) | Group pseudo-element owns the underline; the input's duplicate line is suppressed | High |

The public validation decision remains: default/empty optional is neutral,
nonempty valid is green while focused, and touched invalid or explicit
application errors are red. An explicit error wins over native validity.
Blurring hides the line. Read-only and forced-colors fields retain visible
keyboard focus. Reduced motion disables the underline transition.

## Composition

Place the label and hint outside the joined group; keep native text/select
controls as direct children of `.nq-input-group`. Addons use `.nq-input-addon`.
React InputGroup uses start/end props; Vue uses prefix/suffix slots; Angular
projects nqPrefix/nqSuffix and a labeled native input. Empty Angular addon slots
are hidden, and exposed input corners retain their radius.

Angular InputGroup now shares its adapter's value-presence observer with native
projected controls, so prefilled and controlled values work without running the
vanilla enhancer. Tracking refreshes after render and cleans up on removal and
destruction. Frameworks continue to own their DOM.

## Deliberate adaptations and limits

- The source's focused underline is neutral and its invalid line depends on a
  Bootstrap danger gradient. Nasaq retains the explicitly approved green/red
  validation behavior and its own semantic tokens.
- The resting border remains the stronger accessible control border. Dark mode
  uses the corresponding visible focused-field neutral.
- The joined underline is anchored to the group's bottom, rather than a fixed
  top:40px, so compact/mobile density does not detach it from the control.
- Reduced motion, keyboard focus, original Nasaq timing and custom overrides
  remain supported. Native selects retain their platform option-list semantics.
- Custom date fields, Latin digits, ISO storage and pinned Umm al-Qura conversion
  are unchanged. No global input/select resets or native date popups are added.

The source's helper/error typography, select-arrow artwork and other selectable
control families still need their separate comparisons. This is a scoped input
state/motion task, not a claim that every source form rule is already matched.

## Validation

Twenty-one focused Chromium cases passed across vanilla, React, Vue and Angular:
twelve guide/theme cases and nine native-consumer cases. They cover RTL/LTR,
normal and grouped inputs, explicit-error precedence, neutral empty fields,
read-only focus, reduced motion, forced colors and original/custom themes.
The full build, 301 unit tests and eight semantic contrast checks passed.
Clean tarball consumers passed ESM/SSR, Angular APF, CSS exports, TypeScript
declarations and tree-shaking checks. No package was published.
This does not establish Firefox/WebKit or manual screen-reader parity.
