# NIC segmented controls and grouped actions

This comparison uses the hashed `global.css` snapshot in the
[NIC source inventory](nic-web-reference.md). It covers reusable presentation
and adapter behavior, not certification. Calendar switches are separate.

| Source | Observed requirement/value | Hawiyah implementation or adaptation | Confidence |
| --- | --- | --- | --- |
| CSS 1294–1305 | Inline flex, wrap, gap 0, padding 0 8px, fit-content | Segmented ToggleGroup uses this layout; outline remains a supported alternative | High |
| CSS 1307–1327 and inherited base button | Minimum 32px; inherited 6px vertical padding and 24px line-height produce an actual 36px plain segment; minimum width 76px; font 16px/24px, weight 500 | Match actual cascade, not only the declared minimum | High |
| CSS 1329–1357 | Outer radius 8px; 1px Neutral 300 separators; selected and pressed dark Neutral 950 with white text | Logical outer corners and separators; selected radio and aria-pressed buttons share states. Hide adjacent separators consistently | High |
| CSS 1330–1386 | Hover Neutral 50; selected/pressed/focused Neutral 950; source focus inset white 1px | Named semantic hover/selected roles; 2px visible inset focus for keyboard users, including readonly choices. Focus alone never paints the selected colours: a focused unpressed button in multiple mode, which the source does not have, keeps its own background with a ring, so its state stays visible | High source evidence; focus width is an accessibility adaptation |
| CSS 1367–1386 | Mobile at 576px or below: group width 100%, flexible segments, minimum height 48px, horizontal padding 20px | Match breakpoint and target sizing. Segments start from the width of their label and share the room that is left, so a label that fits stays on one line and the 48px height holds; the 76px desktop minimum is dropped, and four or more segments use 14px text and 4px inline padding so four common labels stay on one row at 320px. Segments that still do not fit continue on a second row. A label wraps inside its segment only as a last resort, when it is wider than the row, without losing its accessible text | High |
| Source disabled/focus cascade | Selected rules can override disabled rules; inherited focus declarations can erase the ring | Disabled styling wins while selected-disabled retains a border cue. Readonly stays focusable. Outline readonly multiple buttons retain their focus ring | High; explicit correction |
| Source dark palette | Fixed near-white hover can conflict with dark-mode white text | Contrast-tested dark hover and selected tokens; original/custom themes remain supported | High declaration evidence; dark treatment is an adaptation |
| Source motion | No segment-specific transition declared | No inferred animation timing in DGA segmented controls; reduced-motion disables legacy transitions | High |
| Hawiyah attached ButtonGroup composition | Independent actions, not radio selection | All native adapters expose variant/orientation; vertical joins use block-axis overlap and corners. Mixed Angular icon-button hosts/native buttons share one seam | Hawiyah composition fix; not a source-specific selection requirement |

## Behavior and public APIs

ToggleGroup uses native radios for single selection and `aria-pressed` buttons
for multiple selection. React/Angular use `readOnly`, Vue uses `readonly`, and
vanilla uses `data-hw-readonly="true"`. Readonly does not disable the fieldset:
users can focus the selected control, inspect it, and submit its enabled value,
but cannot change it with clicks or selection keys. Removing readonly restores
editing. Disabled groups submit nothing. Multiple values exclude missing or
disabled options. React/Vue external-form reset restores defaults; Angular
retains its existing value/CVA model.

ButtonGroup accepts `variant="default|attached"` and
`orientation="horizontal|vertical"` in React, Vue and Angular. Vanilla uses
`data-variant` and `data-orientation` on `.hw-button-group`. Each action retains
ordinary button behavior and its own Tab stop. No toolbar role or implicit
roving focus is introduced. Existing React/Vue data attributes remain supported.

The guide shows segmented, outline, multiple, readonly, disabled and combined
readonly-multiple-outline examples. Native project recipes import the actual
adapters; ButtonGroup adds the thirtieth native recipe with horizontal/vertical
mixed icon and text actions. Demo handlers update local state without navigating.

`--hw-color-segment-selected`, `--hw-color-on-segment-selected` and
`--hw-color-segment-hover` are additive semantic roles. Original Hawiyah themes
retain their prior grouping geometry; custom themes may override these colors.
Nested theme boundaries reset DGA-only geometry. Forced colors retain selected,
disabled and keyboard focus cues. No calendar calculation or value format changes.

## Validation

The focused behavior suite passes 52 tests, including ten cross-adapter cases
for readonly focus, protected selection, form submission, disabled values and
external reset. Eight token checks cover the supported contrast pairs.
`tests/browser/nic-segmented.spec.ts` checks vanilla RTL/LTR and real React, Vue
and Angular project previews, desktop/mobile geometry, selection, readonly,
disabled, outline focus and attached joins. It also checks theme overrides,
forced colors, reduced motion and scoped axe results. These checks do not replace
a full assistive-technology audit.

Package/guide builds and clean-consumer ESM, SSR, Angular APF, CSS exports,
declarations and bundle budgets pass. All 30 React recipes pass TypeScript
checking, all 30 Angular recipes pass strict template checking, and all seven
exported framework/language projects build. The final styles tarball was
repacked and its segmented stylesheet checked byte-for-byte against source
after the outline-focus and mixed-child seam corrections.

The final combined Chromium run passes all 18 cases: five focused segmented/
attached-group cases plus thirteen editor cases, including all 150 native
recipe previews across the five native framework/language combinations.
Rendered mobile React, Angular and RTL/LTR segmented groups were inspected.
