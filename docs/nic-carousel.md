# NIC carousel alignment

Source: the hashed `global.css` snapshot in [NIC web reference](nic-web-reference.md),
CSS 3279–3423. The supplied `master.js` contains no carousel implementation.
The stylesheet establishes presentation and a transform transition; it does not
establish autoplay, swipe, looping, breakpoint counts or keyboard behavior.

| Source | Observed value | Nasaq implementation | Confidence / boundary |
| --- | --- | --- | --- |
| 3279–3292 | Wrapper reserves 4rem below content; viewport has 8px block padding and clips overflow | Desktop track/controls composition uses those dimensions | High; small screens and many indicators put controls in flow to avoid overlap |
| 3294–3305 | Flex track, 16px gap, slides 100% wide; transform 600ms `cubic-bezier(.25,1,.5,1)` | Responsive single-slide track with matching gap, duration and easing | High for CSS; index calculation and navigation are Nasaq behavior |
| 3313–3331 | Controls 16px inline padding; arrow group gap 12px | Logical, direction-aware control groups | High for dimensions; indicators precede arrows in DOM, placing arrows at the inline end |
| 3333–3365 | 45px circular primary arrows, Flag 700 hover, 300ms transition, disabled opacity .3 | Native labeled buttons with matching geometry/colors | High; visible keyboard focus is retained, and only relevant color properties transition |
| 3368–3392 | 20px font-based direction icons selected from page language | Direction-aware plain arrow glyphs, 20px, selected by actual `dir` | Intentional adaptation; no official icon font is redistributed and glyph parity is not claimed |
| 3395–3423 | 12px Neutral 200 dots, Neutral 300 hover, primary active fill, active scale 1.3 | 12px visual dots inside 24px buttons, matching fill/hover/scale | High for visual values; added contrast boundary and target spacing are accessibility adaptations |

An isolated Chromium fixture loaded only the source CSS with network requests
blocked. Arabic/English measurements confirmed 64px reserved control space,
8px viewport padding, 16px track gap, 45px arrows, 12px dots, 15.6px scaled active
dots and the declared transition timings. The source font was unavailable in
that fixture; these measurements do not prove live-site visual parity. The
source's permanent `will-change` promotion is not copied to every idle carousel.

## Native composition and behavior

The native adapters render `.nq-carousel-viewport > .nq-carousel-track >
.nq-carousel-slide`, then indicator and arrow groups. Slides remain mounted so
application state and content are retained. CSS translates by the viewport
width plus the gap, with direction taken from `dir`, independently of language.
Track height accommodates its content, including the tallest mounted slide.

Inactive slides retain `hidden` as a no-CSS fallback. Within an enhanced track,
a narrow CSS override keeps their layout boxes for translation. `inert` and
`aria-hidden` remove them from interaction and the accessibility tree
immediately; delayed visibility allows the outgoing slide to finish its motion.
This intentional override must not be generalized to arbitrary hidden content.
Reduced motion removes both track motion and visibility delay. No timers or
autoplay engine are introduced. Original Nasaq keeps instant slide changes;
custom themes can override `--nq-duration-carousel`, `--nq-ease-carousel`,
`--nq-duration-carousel-control`, `--nq-carousel-gap` and the three dot-color tokens
(`--nq-color-carousel-dot`, `--nq-color-carousel-dot-hover`,
`--nq-color-carousel-dot-border`).

Vanilla uses authored `[data-nq-carousel-track]`, `[data-nq-slide]`,
`[data-nq-previous]`, `[data-nq-next]`, `[data-nq-carousel-status]` and optional
`[data-nq-carousel-dot="0"]` buttons. `createCarousel` sets current state and
restores authored attributes, styles, status text and listeners on destroy.
Legacy markup without a track continues to hide/show its authored slides.
Authored roles and implicit article semantics are preserved. Destroy and
recreate the vanilla controller when replacing its slide collection.

React keeps `index/defaultIndex/onIndexChange`; Vue keeps numeric
`v-model/defaultValue`; Angular keeps `current/currentChange`. Finite indexes
are floored and clamped. Empty and single-slide collections cannot advance or
emit invalid numbers. Selecting the current position does not emit a duplicate
change. Looping is opt-in in React/Angular/vanilla. Vue's existing `wrap=true`
default is preserved for compatibility; examples set it explicitly.

`showIndicators` is configurable in native adapters; vanilla omits the authored
indicator group. All controls have accessible names and native Enter/Space
activation. Indicators use `aria-current`, not tab semantics. Previous/next
disable at bounds unless looping is enabled. A polite position announcement is
separate from the visible indicators; empty collections show a localized message.
Many indicators wrap and controls move into normal flow on narrow viewports.
The root does not clip keyboard focus rings, unlike the source wrapper.

Arabic labels and Latin digits are the default. Label/description props remain
localizable. React `getSlideLabel` receives a zero-based index; vanilla
`getSlideLabel`, Vue `slideMessage` and Angular `slideLabel` receive a one-based
position. React accepts renderable slide content; Vue supports named slide-ID
slots; Angular adds optional `slideTemplate: TemplateRef<{$implicit: NqSlide;
index: number}>`, retaining the existing image/title/content renderer as fallback.
This API types the supplied context; it does not promise automatic type inference
for every external Angular template local. Each adapter owns its DOM.

Five ready examples and native editor projects cover bounded navigation,
looping, hidden indicators, empty data and one slide. The first native example
is controlled and displays its zero-based value. Demo content performs no
navigation, networking, identity lookup or external asset loading. None of this
constitutes official DGA certification.

## Validation

Fourteen focused cross-adapter and SSR checks pass, alongside 58 existing
adapter/vanilla/SSR regression checks. Eight token contrast checks pass,
including dot boundaries against their fills and surrounding surfaces.
Eight distinct Chromium scenarios pass across Arabic/English vanilla galleries,
React JSX/TSX, Vue JS/TS, Angular TypeScript and the catalog interaction flow.
They cover bounded/looping navigation, indicators, empty/single data, mounted
inactive content, direction, motion preferences, themes, keyboard focus,
mobile sizing and scoped accessibility checks. Browser assertions wait for
outgoing-slide visibility to settle after motion; all five catalog toast
statuses are dismissed independently.

Workspace and guide builds pass, including the GitHub Pages base path. Fresh
tarball consumers pass ESM/SSR, Angular APF, CSS exports, declarations and
tree-shaking gates. All 32 React editor recipes pass TypeScript checks, all 32
Angular recipes pass strict template checks, and all seven exported
framework/language projects build. This is focused carousel validation, not a
fresh exhaustive catalog run or a claim of source-site visual parity.
