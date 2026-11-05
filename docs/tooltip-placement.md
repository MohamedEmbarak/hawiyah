# Tooltip placement

Checklist criterion 33, Sheet1 row 139, requires tooltip position and alignment
to match its context. All four adapters now expose logical placement
(`top`, `bottom`, `start`, `end`) and alignment
(`start`, `center`, `end`). Defaults preserve top/start presentation.

React and Vue use `placement` and `align` props. Angular exposes the same
inputs on `nq-tooltip`. Vanilla accepts the same controller options or
`data-placement` and `data-align` on the element with `role="tooltip"`.
Destroying a vanilla controller restores its authored attributes.

Start/end placement follows the nearest writing direction. For top/bottom,
alignment follows the inline axis. For side placements, alignment follows the
block axis. The existing hover, focus, Escape dismissal and description
association behavior applies to every placement. The guide projects show six
representative combinations in all four adapters.

These options give authors control of placement. Automatic viewport collision
repositioning is not implemented. Choose a side that fits the surrounding
layout. The source checklist establishes the requirement but does not supply
numeric geometry for every variant.

## Surface comparison

The supplied Mobile Components export contains local tooltip definitions on
the Tooltip page. These are local symbols with imported token references.
The NIC stylesheet declares an 8px tooltip padding token at lines 92, 126
and 160 but contains no general tooltip surface rule.

| Local source node | Decoded property | DGA implementation |
| --- | --- | --- |
| 5666:4261 | Non-inverted, no-beak variant, minimum width 160px and maximum width 240px | 10rem minimum and 15rem maximum, bounded by the viewport |
| 5666:4262 | White content, 4px radius, 8px padding on all sides | Semantic surface, small radius and spacing-2; earlier horizontal padding was 12px |
| 5666:4266 | 12px medium text, 18px leading, #384250 | Semantic muted text, 12px/18px at a 16px root |
| 5666:4261 | Shadows 0/4/6/-2 at 3% and 0/12/16/-4 at 8%, RGB 16/24/40 | Both decoded shadows; earlier generic small shadow differed |
| 5666:4267–4272 | Separate inverted variant, #1F2A37 background, body white at 70% | Dark mode follows semantic surface/text roles. Explicit inverted variant remains unexposed |

The source also defines optional title, icon and beak variants. The current
plain descriptive tooltip corresponds to no-title/no-icon/no-beak usage.
Those additional content variants remain outside this comparison. The source
English text uses Inter; Nasaq retains IBM Plex Sans Arabic as its shared
product typography.

The browser comparison reconstructs the decoded surface in an independent
HTML fixture and measures it beside the rendered component. It checks
padding, radius, width, type size/weight/leading, colors and both shadows
through the actual vanilla, React, Vue and Angular editor examples. Captured
browser images compare these rendered surfaces. They are not native Figma
screenshots or evidence for all tooltip variants.

Hosts can override `--nq-tooltip-padding`, `--nq-tooltip-min-width`,
`--nq-tooltip-max-width`, `--nq-tooltip-background`, `--nq-tooltip-color` and
`--nq-tooltip-shadow`. The original Nasaq profile retains its previous
inverse surface and horizontal spacing.
