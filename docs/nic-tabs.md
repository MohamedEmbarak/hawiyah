# NIC tabs and responsive overflow

Sources are the hashed snapshots linked in [NIC web reference](nic-web-reference.md):
`global.css` 2316–2427 and `master.js` 1854–2079. The stylesheet was rendered in
an isolated Chromium fixture at 1000px and 390px with network requests blocked.
Anchor markup measures 44px height; unreset browser buttons add their own border
and resting background. Hawiyah owns its button reset. The fixture did not load
official font files, Bootstrap or Popper, and does not establish full live-site
visual parity.

| Source | Observed requirement/value | Implementation | Confidence |
| --- | --- | --- | --- |
| CSS 2316–2341 | Horizontal row, 3px gap and 3px Neutral 300 rail | Shared row/rail with semantic border color | High |
| CSS 2343–2360 | 14px/20px text, 12px vertical and 16px horizontal padding, 4px radius | 44px minimum-height buttons | High |
| CSS 2362–2394 | Neutral 100 hover, Neutral 200 pressed; later focus restores transparent surface with 2px black outline | Semantic states and inset focus to avoid clipping; disabled uses shared semantic color | High for declarations and measured focus precedence; dark/disabled adaptations explicit |
| CSS 2397–2420 | Active text-default/bold family; 3px primary underline inset 16px, bottom 1px | Semantic active text, weight 700 and primary underline | High; bold font-family intent mapped to bundled weight |
| CSS 2422–2427 | Content top margin 24px; first overflow toggle 18px | Panel gap 24px and consistent 18px ellipsis | High |
| JS 1854–1978 | At viewport ≤991px reserve 72px; hide excess originals and expose dropdown destinations | Container ≤991px measurements, 72px reserve, accessible native disclosure | High for algorithm; container sizing is an adaptation |
| JS 1985–2059 | Hidden selection activates panel and synchronizes overflow state | Native value APIs update panel/disclosure and restore focus | High |
| JS 2064–2078 | Rebuild after window resize with 120ms debounce | ResizeObserver plus font/text/resize observation; one measurement per animation frame | Lifecycle adaptation |

The source always subtracts 72px before deciding whether overflow exists. Hawiyah
first checks whether all labels fit, avoiding an unnecessary disclosure. It
measures the component container so narrow cards and embedded projects work on
wide monitors. Above 991px the normal row can scroll; `overflow="scroll"` keeps
scrolling at every width. Vertical tabs never collapse. A single tab remains
visible. Omitted labels remain measurable while hidden from the visible row;
their disclosure text wraps within the component width.

The source's global `.disabled` rules apply a disabled background and underline
with `!important`, overriding the tab-specific transparent declaration for
class-disabled anchors. Native disabled buttons avoid that global class leak.
Hawiyah uses native disabled semantics and semantic disabled text, with no link
underline on a tab button. The later focus rule also overrides the pressed
background once a pointer-pressed tab receives focus; this precedence is retained.

## API and semantics

React, Vue and Angular retain controlled/uncontrolled selection and manual/
automatic activation. They add `overflow: 'menu' | 'scroll'` (default `menu`)
and `overflowLabel`, required when overflow uses the menu. Vanilla accepts these options plus
`data-hw-overflow` / `data-hw-overflow-label`; destroy restores authored DOM and
attributes. No vanilla controller owns native framework trees.

In Angular each `hw-tab` renders its own `section.hw-tab-panel`; `hw-tabs`
renders the tab list and supplies the panel identifiers and the selection. The
panels therefore sit inside `hw-tab` elements, which the stylesheet reduces to
`display: contents`, instead of directly inside `.hw-tabs` as in React, Vue
and vanilla markup. Roles, identifiers, `aria-controls` / `aria-labelledby`
and the order of panels are the same. The earlier structure stamped a template
declared in `hw-tab` inside `hw-tabs`, which Angular hydration could only locate
from `document.body` and which failed with NG0509 in a prerendered application.
On the server, and wherever the DOM has no layout, overflow is not measured and
every tab stays in the list.

The ellipsis is a sibling native `details/summary` disclosure, outside the
`tablist`. Its buttons use `aria-pressed` for the selected destination, without
claiming ARIA menu semantics. Original tabs keep panel IDs and names; omitted
originals are hidden from assistive technology and keyboard traversal. If all
labels are too wide, the empty visible tablist is hidden from assistive technology
and every destination remains available in the disclosure.

Arrow/Home/End navigation skips omitted and disabled tabs; manual activation
waits for Enter/Space. Tab reaches the disclosure, Enter/Space opens it and Tab
visits destinations. Escape closes it and restores summary focus; outside
activation closes it. Selection returns focus to the disclosure. Resize recovers
focus when a focused destination moves. Panels remain labelled and keyboard
reachable, and demo actions do not navigate the guide.

## Themes and evidence limits

These source tab rules depend on external Bootstrap dropdown styling. Hawiyah's
popup uses semantic surface, border and shadow, bounded width/height, wrapping
labels and visible focus. No source tab transition duration is declared, so no
animated tab transition is inferred. Dark, original, custom, reduced-motion and
forced-color modes preserve accessible cues. Hajj and site-specific Bootstrap/
event integrations are excluded. This is not official DGA certification.

## Validation

Passing focused checks: 2 core measurement tests, 21 native parity tests, 8
vanilla tests, 7 existing adapter regressions and 2 React/Vue hydration tests.
They cover manual/automatic activation, disabled and controlled state, dynamic
projected Angular tab inputs, changing labels, responsive focus recovery,
cleanup and SSR-safe rendering.

Seven browser scenarios pass: Arabic/English vanilla examples, React JSX/TSX,
Vue JS/TS and Angular TypeScript. The six example cases exercise source geometry,
overflow selection, Escape/outside dismissal, manual and vertical navigation,
scrolling, initial hidden selection, resizing and mobile containment. Vanilla
checks cover light/dark accessibility, original/custom themes and forced colors.
Rendered inspection also caught and fixed ready-example card clipping that
previously prevented clicking lower dropdown destinations.

The full build, final playground typecheck and GitHub Pages-path guide build
pass. Clean tarballs pass ESM, SSR, Angular APF, declarations, CSS exports and
tree-shaking checks. All 33 React recipes pass TypeScript checking, all 33 Angular
recipes pass strict template checking and all 7 exported framework/language
projects build. These are focused checks, not a new full-catalog browser run.
