# NIC rating alignment

Source: the hashed `global.css` snapshot in [NIC web reference](nic-web-reference.md),
CSS 3427–3502. The supplied `master.js` contains no rating/star implementation.
The CSS establishes star presentation and fractional overlays; it does not
establish selection steps, server aggregation, submission or form disclosure.

| Source | Observed value | Nasaq implementation | Confidence / boundary |
| --- | --- | --- | --- |
| 3427–3434 | Primary stars at 30px; bold numeric score | 30px DGA stars, semantic fill and bold score | High for CSS; an ordinary star glyph is used, with no claim of official font artwork parity |
| 3452–3464 | 30×30px wrapper, 4px physical margin | 30px display cells with 4px logical gap | High; no trailing gap, direction follows `dir` |
| 3470–3480 | Base layer gray-300 (`#d0d5dd`), 200ms color transition | Semantic empty-star token and 200ms input color transition | High; thin contrasting boundary makes the pale stars discernible |
| 3482–3493 | Primary overlay clipped from the physical right; 200ms width transition | Fractional overlay fills from inline start, with 200ms inline-size transition | High for dimensions/timing; LTR fill direction is an intentional adaptation |
| 3436–3450 | Hidden form section and a floating close control | Not imposed on Rating or RatingDisplay | Site-specific form orchestration is not established by the supplied JS |

An isolated Chromium fixture loaded the source stylesheet with network requests
blocked. It confirmed 30px cells, a 15px half-fill, source colors and 200ms
transitions in both directions. It also confirmed that the source overlay stays
physically right-aligned in LTR. This is measured CSS evidence, not live-site
visual parity; official fonts/assets were not redistributed.

## Selection versus aggregate display

`Rating` remains a native radio group. Selection fills the entire preceding
range, hover previews the range without committing, and native arrow keys and
Space select an integer. Read-only blocks changes while retaining focus; disabled
controls do not participate in form submission. React and Vue support their
existing controlled/uncontrolled APIs and resets; Angular retains its CVA API.
Vanilla radios own values, required validation and reset, with `createRating`
adding read-only guards and change callbacks. Authors supply integer radio values.

`RatingDisplay` is a separate non-interactive aggregate visualization, exported
by React/Vue and as `NqRatingDisplayComponent` by Angular. It has `role="img"` and
one accessible name containing the label and score; decorative stars and the
optional visible number are hidden from assistive technology to avoid repetition.
It does not add radios, focus stops or form values. A score of 3.5 renders three
full stars and one half star. Arbitrary finite fractions are supported, not just
half steps. Vanilla uses the same static `.nq-rating-display`, `.nq-rating-stars`,
`.nq-rating-star`, `.nq-rating-fill` and `.nq-rating-score` composition, without a
controller. Each overlay takes `--nq-rating-fill` as a percentage.

Native components share a finite maximum from 1 to 20 (default/fallback 5).
Values clamp to 0…max, with nonfinite data becoming 0. Display preserves fractions;
inputs floor them to a selectable integer. React's former 10-star cap is expanded
to the common 20-star cap. Core exports `normalizeRatingMax` and
`normalizeRatingValue` for applications composing equivalent vanilla markup.
Normalization does not emit change events merely because props are supplied.

Arabic names and Latin digits are default. React uses `getValueLabel` for the
display name, Vue/Angular use `valueLabel`; each receives the normalized value and
maximum. `showValue=false` hides the visible score without removing the accessible
name. Input label formatters remain separately configurable. Stars fill from
inline start independently of language, wrap for larger maxima, and never turn
an aggregate display into a clickable input.

## Themes and accessibility adaptations

The DGA profile follows the measured source dimensions/fill/timing. Original
Nasaq retains its 28px star size and instant state changes. Custom themes can
override `--nq-color-rating-empty`, `--nq-color-rating-fill`,
`--nq-color-rating-outline`, and `--nq-duration-rating`.
Input targets and cumulative selection backgrounds remain larger than the source
display cells. Dark mode uses semantic colors; a thin boundary improves pale-star
visibility. Forced colors preserve the display silhouette and fractional fill,
while existing input focus/selection outlines remain visible. Reduced motion
removes color/fill transitions. No official DGA certification is claimed.

## Validation

Twenty-six focused helper, adapter, form, reset and SSR checks pass, including
the existing rating suites in all four adapters. Eight token contrast checks
pass with the new fill and boundary colors. Nine Chromium scenarios pass:
Arabic/English galleries, five React JSX/TSX, Vue JS/TS and Angular TypeScript
editor combinations, and two existing RTL/LTR cumulative-selection regressions.
The browser checks cover 30px/15px geometry, 4px gap, source timing, direction,
controlled updates, required/read-only/disabled behavior, scoped accessibility,
themes, forced-colors focus, reduced motion and narrow viewports. Arabic gallery
and fractional-score screenshots were visually inspected.

Workspace and guide builds pass, including the GitHub Pages base path. Final
clean tarball checks pass ESM/SSR, Angular APF, CSS exports, declarations and
tree shaking. All 33 React editor recipes pass TypeScript checking, all 33
Angular recipes pass strict template checking, and all seven exported
framework/language projects build. This is focused rating validation, not a
fresh exhaustive catalog run or a certification claim.
