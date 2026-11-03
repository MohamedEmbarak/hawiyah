# NIC links and breadcrumbs

This comparison uses the hashed `global.css` snapshot recorded in
[the NIC source inventory](nic-web-reference.md). It covers shared presentation,
native adapter behavior and guide recipes; it does not claim certification.

| Source | Observed rule | Implementation / adaptation | Confidence |
| --- | --- | --- | --- |
| CSS 853–858 | Primary green, no resting underline | Semantic `--nq-color-link`; inline default keeps an underline so color is not the only link cue. Neutral/standalone variants remove it | High source evidence; explicit accessibility adaptation |
| CSS 864–887 | Hover Flag 400 `#54c08a`; pressed Flag 300 `#88d8ad`; underline | Light-mode hover/pressed use darker Flag 800/900, while dark mode uses Flag 300/200. These remain readable on supported surfaces | High; source light colors have only 2.26:1 / 1.68:1 contrast on white |
| CSS 889–908 | 2px black focus, 2px radius; icon-link focus removed | Retain a 2px focus outline for every link, including icon links and pressed keyboard focus; theme-aware black/white or system Highlight | High; removing icon-link focus is intentionally not reproduced |
| CSS 910–916 | Visited Flag 800, underline | Separate visited semantic color; hover/focus/pressed remain usable after visiting | High declaration evidence; browser history privacy prevents direct computed-style proof |
| CSS 918–929 | Disabled gray, underline, pointer-events none | Native adapters remove href and suppress primary/auxiliary activation; vanilla recipe has no href. ARIA disabled state and removal from sequential focus supplement the styling | High; disabled anchors are not native disabled controls |
| CSS 945–965 | Neutral 700 default, 500 hover, 400 active class; visited override commented out | `neutral` plus compatible `subtle` alias; named neutral state tokens preserve contrast, and actual `:active` handles pointer presses | High; no live neutral visited declaration is inferred from the comment |
| CSS 2040–2085 | Breadcrumb 14px/24px, 4px gap, 200ms ease color, neutral states, 2px focus offset | Source geometry/motion and neutral interaction roles; reduced motion removes transition | High |
| CSS 2088–2101 | Disabled/read-only gray, disabled noninteractive | `disabled` items render without a destination; ordinary items without href and the current page are text. No unsupported readonly attribute/role is invented | High |
| CSS 2111–2143 | Directional icon-font separator, 16px glyph; current Neutral 400 | Empty CSS chevron geometry follows `dir` independently of language. Current text uses a readable semantic color. Private icon-font glyphs are not bundled | High for direction/current role; geometry is an adaptation, not official-icon parity |

The source primary `#1b8354` passes on white (4.75:1) but falls to 4.32:1 on
the supported muted surface `#f3f4f6`. Link text therefore uses Flag 700
`#166a45` in light mode. Source neutral hover is also below 4.5:1 on that muted
surface; use Neutral 600 `#4d5761`. Source pressed/current Neutral 400 is only
2.51:1 on white and is reserved for disabled/decorative uses. Neutral visited
links remain neutral in Nasaq; the source global visited selector can override
its neutral class, while its neutral-specific visited rule is commented out. These decisions
preserve the existing accessibility requirement; they are not claims that the
substitutions have received official approval.

## APIs and examples

- React/Vue `Link` and Angular `NqLinkComponent` accept `disabled` and
  `variant="default|neutral|subtle|standalone"`. Existing `data-variant` usage in
  React/Vue, including caller-defined strings, remains supported. Angular binds `variant` on its native anchor.
- React/Vue preserve enabled application click handlers. Disabled links omit
  href, expose `role=link` / `aria-disabled=true`, use tabindex -1 and stop
  primary/auxiliary activation before application callbacks. Angular likewise
  stops the native anchor event before it reaches a host click binding.
- Vanilla uses `<a class="nq-link" role="link" aria-disabled="true"
  tabindex="-1">Unavailable</a>`. Do not add a destination or navigation handler
  to this disabled recipe. No controller is required.
- Breadcrumb items accept `disabled?: boolean` in all native adapters. Their
  default landmark label is Arabic (override `label` for English); the
  last item remains the current page; disabled destinations render as text with
  a disabled link role and no href.
- The guide displays all four principal variants and includes project imports
  and actual adapter APIs. Demo destinations remain inside the preview.

`--nq-color-link`, `link-hover`, `link-active`, `link-visited`, `link-neutral`,
`link-neutral-hover`, `link-neutral-active` and `breadcrumb-current` are additive
semantic tokens (all with the `--nq-color-` prefix). Nasaq's original palette and
slash breadcrumb separator remain available. Custom themes can override these
roles; theme boundaries reset the source-specific geometry. Application-specific
surfaces still require contrast checks.

The link typography inherits the surrounding content. No general anchor reset,
router, external site navigation, icon font or site integration is installed.

## Validation

Nine focused adapter/theme tests pass, including disabled primary/auxiliary
activation and restoration in React, Vue and Angular, and disabled/current
breadcrumb semantics. Eight token contrast checks include every link state on
all supported canvas/surface roles. Five Chromium cases pass: vanilla RTL/LTR
state, direction, focus, reduced-motion, forced-color, theme and scoped axe
checks, plus all three native project previews and contained navigation.
Rendered native links and RTL/LTR breadcrumbs were inspected.

Package and guide builds, clean tarball declarations/SSR/APF/CSS exports and
bundle budgets pass. All 29 React recipes pass TypeScript checking, all 29
Angular recipes pass strict template checking, and all seven exported language/
framework projects build. These are scoped checks, not full accessibility or
DGA certification. Visited selectors are inspected as declarations rather than
claimed as verified browser-history colors.

The five existing portal-identity Chromium cases also pass after the shared-style
changes, covering header disclosure, grouped footers and native compositions.
