# NIC badges and status labels

Source: the hashed `global.css` snapshot in [NIC web reference](nic-web-reference.md),
lines 3018–3153. It supplies design evidence, not a runtime dependency or official
certification. No official artwork or fonts were copied for this change.

| Source | Observed value | Nasaq implementation | Confidence / boundary |
| --- | --- | --- | --- |
| 3018–3026 | Wrapping groups, 8px gap | Optional `nq-badges` grouping class | High |
| 3029–3052 | 12px/18px medium type, 8px horizontal padding, 4px radius, 1px border, 32px minimum width | DGA/custom `nq-badge` soft/default profile | High; border-box minimum width avoids dependence on an application reset |
| 3043–3051 | `height: 24px` is overridden by later `height: max-content` | Single-line soft badges measure 20px; content may wrap and grow | High; source cascade was rendered, not inferred from the first height declaration |
| 3054–3079 | Five semantic background/text/border palettes | `neutral`, `info`, `success`, `warning`, `danger` map to source default/info/success/warning/error | High for the supplied light palette; dark mode is a contrast-tested adaptation |
| 3091–3153 | Pill status, 24px height, 10px dot, 8px gap, no border | `data-variant="dot"`; 24px minimum height allows wrapped labels | High for single-line geometry; minimum instead of fixed height is an accessibility adaptation |
| 3111–3117 | Neutral dot `#4D5761`; other dots match text | Decorative pseudo-element with semantic dot color | High; visible text carries status meaning |

Light-mode values:

| Tone | Text | Background | Border |
| --- | --- | --- | --- |
| Neutral | `#1F2A37` | `#F9FAFB` | `#E5E7EB` |
| Info | `#1849A9` | `#EFF8FF` | `#B2DDFF` |
| Success | `#085D3A` | `#ECFDF3` | `#ABEFC6` |
| Warning | `#93370C` | `#FFFAEB` | `#FEDF89` |
| Danger | `#912018` | `#FECDCA` | `#FECDCA` |

An isolated Chromium fixture loaded the supplied CSS, blocked network requests,
and measured all five badges and status labels in RTL/LTR, with and without a
border-box reset. Both measured 20px badge height, 24px status height, the stated
padding, radius, colors and 10px dots. Official font files and the live site's
complete CSS stack were not loaded; these measurements do not establish full
visual parity. A named medium source font maps to Nasaq's bundled medium weight.

## Usage and intentional adaptations

React/Vue `Badge` and Angular `nq-badge` accept `tone` and
`variant="soft|outline|dot"`. Vanilla uses the corresponding `data-tone` and
`data-variant` attributes on a `span`. React/Vue continue accepting native data
attributes; a typed `variant` takes precedence. Badge is static content: it
does not add a button role, keyboard stop, live region or hover/click effect.
For changing status announcements, applications can supply a separate live
region. Never communicate status by color or a dot alone.

```html
<div class="nq-badges">
  <span class="nq-badge" data-tone="success">تم حفظ الطلب</span>
  <span class="nq-badge" data-tone="info" data-variant="dot">قيد المراجعة</span>
</div>
```

The outline variant remains a Nasaq extension, with a transparent background
and current-color border. Source default-badge margins are represented by the
consistent group gap, rather than giving only neutral badges extra margins.
Status labels can grow when text wraps; the dot never shrinks. Long labels can
wrap inside narrow containers. Badges are informational, so their heights are
not interactive touch-target sizes.

Original Nasaq keeps its pill geometry, transparent borders, 6px dots and
palette. Dark mode uses readable existing status colors; its soft borders use
the tone color. Custom themes inherit DGA geometry and can override
`--nq-color-badge-{tone}-text`, `--nq-color-badge-{tone}-background`,
`--nq-color-badge-{tone}-border` and `--nq-color-badge-neutral-dot`.
The existing `--nq-tone` / `--nq-tone-bg` component overrides remain available.
Forced colors uses system text/borders and preserves the decorative dot.
No animation, calendar calculations or interactive input behavior changes.

All five tones and three variants appear in the guide's ready examples and
native React/Vue/Angular editor projects, with imports and localized labels.
The vanilla main preview shows all five tones; its ready gallery covers all
three variants.

## Validation — 2026-11-03

Seven focused Chromium scenarios pass: vanilla Arabic/English galleries and
React JSX/TSX, Vue JavaScript/TypeScript and Angular TypeScript editor previews.
They cover all 15 tone/variant combinations, source geometry/colors, static hover
presentation, narrow layouts, multiline labels, original/custom theme isolation,
forced colors and scoped light/dark axe checks. The Arabic gallery screenshot
was visually inspected. These are focused badge checks, not full-site parity.

The dark-mode test fixture explicitly paints its semantic surface; changing only
text tokens on a transparent container above a white page is not a dark surface.
Rendering assertions are batched to avoid an Angular test timeout from repeated
browser round trips; the same geometry/color assertions remain in place.

All eight token contrast checks pass, including badge text on its background and
outline text on the supported surfaces. Six token-theme tests and 46 native
adapter regression tests pass. Package, guide and native example builds pass,
including the `/nasaq/` guide base path. Clean tarballs pass ESM/SSR, Angular APF,
CSS imports, declarations and tree-shaking checks. All 31 React recipes pass
TypeScript checking, all 31 Angular recipes pass strict templates, and all seven
exported framework/language project combinations build. Nothing was published
to npm, and the broader alignment assessment remains open.
