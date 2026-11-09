# DGA source audit follow-up

This record updates the 2026-10-29 source audit during the implementation work begun on 2026-11-01. The comparison baseline was `761e738025b4f7f104e582dcd03872ea47a834f8`. Implementation status below distinguishes completed edits from verification; actual passing commands and their scope belong in [validation](validation.md).

## What newly accessible sources change

All **23 supplied files** are decoded, including the six previously blocked by remote transfer size. The [inventory](dga-source-inventory.md) records exact filenames, sizes, SHA-256 hashes and export metadata. No standalone web Components Library was supplied. **Hajj is an application-specific design and is excluded from Hawiyah implementation scope and backlog.** Historical inventory counts include that file, without making its features requirements for Hawiyah.

The new evidence strengthens the case for Home and Search compositions, a reusable responsive portal shell, and explicit mobile input sizing. It does **not** require replacing the mapped foundation: all 40 selected Foundations variables match the decoded source values. It also confirms that source mobile control dimensions differ from the existing web density. These differences require an additive mapping rather than a global token replacement.

Every canvas format was checked independently: 17 files use fig-kiwi serialization v101 and six use v106. All have a raw-DEFLATE Kiwi schema and Zstandard message; successful message decoding yielded 1,385,975 node-change records. The inflated schemas share SHA-256 `d2934242ce6b5a3c41bc731d53ac2f3ac2fc1b7e5d4efe631903d3cf93413dde`. Serialization and export timestamps are not official design-library release numbers. Records include instances, caches and deleted definitions, so their count is not a component inventory.

Foundations has 784 resolved active local variables. Mobile has 681 variable records without import markers, but only 38 active local variables after excluding soft-deleted definitions and collections. Its active local Theme has Light mode only. Imported source identity, publication version and mode must be preserved: 104 imported variable-mode values remain ambiguous across the files, including repeated cache material. They are not 104 confirmed source defects. For example, local Foundations `Text/text-primary` (`50:204`) is green, while an imported definition with the same name (`26:276`) is neutral; name-only merging would change the intended role.

## Traceable comparison and implementation plan

Short source names below expand to exact filenames in the inventory. **Decoded** means extracted properties or source text. **Rendered** means direct native Figma canvas observation. High confidence describes the stated evidence, not certification or exhaustive visual parity.

| Source file / node | Requirement or observed value | Implementation at baseline → current work | Mismatch / classification | Recommended action and status | Confidence |
|---|---|---|---|---|---|
| Hawiyah runtime audit; Mobile input state set `3149:54894` supplies related read-only state evidence | A read-only value must not trap keyboard navigation; Figma metadata does not establish Tab behavior | `packages/vanilla/src/controls.ts` cancelled every read-only RangeSlider keydown → now cancels value-changing keys only | **Confirmed defect** in Hawiyah keyboard behavior | Fix implemented; unit and browser RTL/LTR Tab/Shift+Tab regressions added; verification recorded separately | High: implementation and reproduced runtime defect |
| Mobile `3149:54894`; underline `11167:15723` → `11167:15747` | Decoded pressed/focused underline changes from 35% to 100%; read-only is a separate state | Filled focus selectors overrode read-only suppression in `packages/styles/src/dga.css` → editable-only selectors | **Confirmed defect**: filled read-only fields displayed an underline plus inset focus | Fix implemented; light/dark and forced-colors browser regressions added. Preserve single inset read-only focus | High: decoded source and reproduced runtime defect |
| Mobile input `3149:54894`, Dropdown `3534:49934`, Textarea `5462:417368`; Hawiyah shared `data-size`/`data-variant` contract | Source provides multiple visual/state choices; Hawiyah exposes its own documented size and filled variant | Angular native TextField/Textarea/Select lacked forwarding → `size` and `visualVariant` now target native controls | **Confirmed adapter gap**, not a promise to implement every mobile source variant | Fix implemented and Angular binding regression added; eight Angular native component tests passed; see validation | High: source and adapter inspection |
| Home `62:45927`, `62:45930`; Search `39:53390`, `39:53393`, `266:28917` | Decoded guidance preserves header structure/colors/fonts; optional secondary navigation. Rendered Home `176:9378` shows open header search | Existing PortalHeader implementations lacked consistent responsive disclosure behavior | **Missing component composition / behavior** | Responsive PortalHeader, SecondaryNav and PortalLayout implemented across native adapters, with Escape/outside close, focus return, RTL and responsive tests; see validation | High for source structure; exact parity unestablished |
| Home `861:9628`; Search `39:53428` | Decoded footer structure guidance; rendered desktop Home has a multi-column green footer | Simplified footer and shared layout primitives exist | **Missing reusable layout coverage**, with existing simplification an adaptation | Implemented reusable footer, breadcrumbs, content container and page shell. Consumer content and slots remain explicit; no claim of exact official reconstruction | High for structure |
| Home `176:9378`, `72:46744`, hero `72:46782`, services `72:46864` | Rendered desktop has hero, statistics, services, news, partners and footer. Mobile hero/services use 16 px inline / 40 px block padding and 32 px gaps | No Home gallery recipe at baseline → Home composition implemented in `apps/playground/src/discovery-templates.ts` | **Missing page template** | Arabic-default bilingual responsive recipe; content-driven hero height, meaningful actions, reduced-motion support. Do not infer autoplay from pagination dots | High for composition and selected geometry |
| Search page `1:4`, mobile AR `39:45381`, content `39:45386`, summary `39:45387`; instructions `64:12709`, `64:12718`, `76:9786`, `76:11583` | Rendered service-card and plain-link results, query/count, filter/sort and pagination; decoded instructions retain query and reset selected filters | No Search page at baseline → Search composition implemented in `apps/playground/src/discovery-templates.ts` | **Missing page template / workflow** | Retain query, result count, filter reset/removal, sorting, pagination and empty/loading/error states. The microphone glyph alone does not establish voice-search behavior | High for structure and decoded instructions |
| Mobile body `11167:15771`, set `3149:54894`; Buttons `407:510377`, `407:510548`, `407:510617` | Decoded and rendered input body 320×44, radius 4; decoded buttons large/medium/small 44/40/32 | Shared comfortable sizes are default/small/large 40/32/40; compact 32/24/40 | **Missing mobile profile**, not a proven defect in existing web density | Implemented opt-in mobile density: fields minimum 44 px; buttons 32/40/44 px. Existing desktop density and theme choices preserved | High |
| Mobile `3149:55032` → `3149:55105`; underline `11167:15723` → `11167:15747` | Decoded SMART_ANIMATE 150 ms, cubic-bezier(0,0,.58,1), neutral underline | DGA uses corresponding timing/geometry with green valid / red invalid underline | **Intentional approved adaptation** | Preserve colors and no duplicate outer ring. Later extend per-component motion/state fixtures; no universal 150 ms timing claim | High for decoded properties; playback unverified |
| Mobile `8332:24453`, `8335:15376`, `1679:30950` | Decoded Tab Bar, Top Bar and Nav Drawer; example heights include mobile/device composition | Mobile SecondaryNav presentation implemented; Drawer/PortalHeader remain partial building blocks | **Partially implemented mobile patterns** | Navigation-drawer and internal-page top-bar recipes remain. Preserve navigation semantics, safe-area handling, focus return and RTL; do not hardcode OS status-area heights from a frame | High for source structure |
| Foundations `50:3`–`50:5`, `425:95`, `4422:6`/`4422:7`; Service desktop `1:21371` | Decoded container maximum 1280, desktop/mobile padding 32/16, radius-md 8, IBM Plex Sans Arabic; service columns 832+32+416 | Shared tokens and service layout already map selected values | **Confirmed correspondence with limited coverage** | Retain selected mappings. Wider display typography/grid coverage and full component render matrix remain later audit work | High for selected values |

The native portal consumer checks exposed an additional confirmed defect: the
footer color selector used relative selectors inside `:is()`, so React/Vue legal
text retained a dark muted color on the dark green footer. Explicit descendant
and child selectors now apply the intended theme-aware footer colors. The
consumer accessibility checks also protect heading order and brand alternatives.

Icons: the local core page yielded 8,812 converted SVGs, with two variants held
back for unresolved region styles. Public implementation uses ten unchanged
MIT-licensed Hugeicons Stroke Rounded assets from a pinned upstream commit,
mapped to DGA component names/IDs in the packaged provenance manifest. Native
DGA search node `8681:20094` has strong glyph correspondence with the upstream
search icon; other mappings are name correspondence, not proven geometry parity.
These public files are not direct Figma exports. Solid, custom and branded
exports remain local pending specific redistribution evidence. See the
[icon contract and provenance](../packages/styles/README.md#curated-interface-icons).

## Preserved product decisions

Arabic remains the default; locale and direction are independent. The Hawiyah mark remains the Arabic-only outlined wordmark. NIC artwork keeps original colors in light mode and becomes entirely white in dark mode. DGA editable focus uses an animated green underline, red when invalid, without a duplicate outer ring; read-only and forced-colors states retain visible keyboard focus. These approved adaptations must not be overwritten by a neutral source underline.

Original Hawiyah and custom themes remain supported. Public `hw-` classes and `--hw-` variables remain stable, and each framework owns its DOM. Calendar values remain ISO dates with the pinned Umm al-Qura provider; a visual audit does not change calendar calculations. Seasonal Founding/National Day presentations are optional product decisions. Hajj is not a Hawiyah backlog item.

## Remaining evidence limits

Representative Mobile, Home and Search frames were observed in the native Figma application. Project names and selected node IDs correspond to the decoded exports; the project copies were not byte-verified against those archives. Mobile input `3149:55023` / body `11167:15771` / underline `11167:15772` visually corroborates the pale filled body, radius 4 and short dark pressed underline. Home and Search observations establish composition and selected dimensions, not every typographic or spacing detail.

No exhaustive Hawiyah–Figma pixel comparison, prototype playback audit, manual screen-reader assessment, full four-adapter state matrix, or mobile dark-mode parity is established by those views. Hover references into older internal symbols and ambiguous imported alias modes need explicit source/version resolution. No standalone web Components Library means exhaustive official web-component coverage remains unresolved. Source correspondence and passing automated tests do not establish DGA certification.

## Implemented mobile sizing follow-up — 2026-11-01

Mobile input/body `3149:54894` / `11167:15771` and button nodes `407:510377`, `407:510548`, `407:510617` now inform the opt-in `mobile` density: 44 px single-line field minimum and 32/40/44 px buttons at a 16 px root size. Comfortable/compact defaults remain intact. Textareas retain multiline sizing; all adapters consume the same CSS. Confidence is high for decoded dimensions and rendered Hawiyah geometry, not exhaustive visual parity. The profile is available in the bilingual Foundations guide. Hajj remains out of scope.

## Component motion follow-up — 2026-11-01

The supplied Mobile Components export provides decoded motion properties, not
verified prototype playback. Motion roles are additive; generic duration tokens
and dialog/drawer behavior remain unchanged.

| Source node → destination | Evidence | Implementation / status | Confidence |
| --- | --- | --- | --- |
| Switch `5403:403606` → `5403:403570` | SMART_ANIMATE 200 ms, cubic-bezier(.42,0,.58,1); thumb x2→22 in a 52×32 track | DGA/custom switch track and thumb now use component-specific 200 ms ease-in-out. Existing web switch geometry is retained; timing correspondence does not establish shape parity | High, decoded timing |
| Spinner `5698:11137` → `11143` → `11149` → `11155` → `11137` | Four 250 ms linear quarter-turns; each follows a 1 ms timeout | DGA/custom CSS cycle is 1000 ms, omitting four prototype scheduling waits (1004 ms with waits). This is a documented web mapping, not a 250 ms full rotation | High for segments, explicit cycle mapping |
| Input `3149:55032` → `3149:55105`; underline `11167:15723` → `11167:15747` | 150 ms ease-out, centered 35%→100% expansion | Existing animated green/red underline retained as approved color adaptation | High, decoded properties |
| Hawiyah reduced-motion stylesheet | Zero-specificity rule lost to button/switch defaults; pseudo-element was inside the functional selector | Corrected explicit selectors stop button, switch track and switch thumb transitions. Existing loading/field suppression retained; state changes remain immediate | High, runtime regression |
| Tab Bar `8332:24202` → `8332:24242` → `8332:24282` | 300 ms ease-out; Normal hover goes to a variant named Pressed, then click to Selected | Not applied to generic tab panels; source naming/trigger mismatch retained as evidence caveat | High, narrow scope |
| Accordion `1147:62359` → `1147:60867` | 300 ms ease-in-out, 56→256 px example | Enhanced disclosure now animates intrinsic height with native adapter lifecycles, reduced-motion settlement and inert closing content; native unenhanced fallback remains immediate | High for this source edge only |
| Button-Close `2763:420142` → `2763:420174`; toast child `1730:37107` → `2763:420400` | 200 ms linear hover, destination variants in imported caches | Not applied to toast entry/exit or generic buttons. Most local button hover actions have no explicit timing | High for decoded actions; mixed-library caveat |

`--hw-duration-switch`, `--hw-ease-switch` (thumb),
`--hw-ease-switch-track`, and `--hw-duration-spinner` allow scoped overrides.
The original Hawiyah theme explicitly retains 180 ms switch timing (standard thumb
easing, CSS ease for the track) and a 700 ms spinner cycle. Custom starts from
DGA. Reduced motion removes transitions/animations rather than delaying state
changes; it is an accessibility adaptation, not a property proven by Figma.
All four adapters use shared CSS and continue to own their DOM. Hajj is excluded.

## Implemented mobile tab-bar presentation — 2026-11-01

SecondaryNav now offers an opt-in mobile variant in all four adapters: equal-width icon-over-label page links, 24 px icons, a 70 px minimum height, safe-area padding and a top selection indicator. Source `8332:24202` → `8332:24242` → `8332:24282` informs 300 ms ease-out color transitions; no positional or panel motion is inferred. Semantic theme colors and currentColor icons are documented adaptations. Reduced motion and the original Hawiyah theme remain immediate. See [the composition contract](mobile-navigation.md).

## Implemented accordion motion — 2026-11-01

Mobile `1147:62359` → `1147:60867` supplies 300 ms ease-in-out expansion timing. Hawiyah now animates intrinsic height through native adapter lifecycles, with reversible motion, dynamic-content retargeting, immediate reduced-motion settlement and inert closing content. Native unenhanced markup and the original Hawiyah theme remain immediate. The chevron rotation is an adaptation of down/up source symbols, not a decoded rotation. Conflicting title metrics are not animated. See [the lifecycle contract](accordion-motion.md).

## Modal interaction follow-up — 2026-11-01

Review of the remaining Nav Drawer composition (`1679:30950`) exposed an adapter
behavior defect rather than a source-value mismatch. React, Vue and Angular
dialogs dismissed a drag begun inside the panel when it ended on the backdrop;
this was reproduced in all three real consumers using their date pickers.
Dialog and Drawer now require a gesture to begin and end outside, matching the
existing vanilla intent. All four clear cancelled/prevented gestures and stale
state on close/reopen. Native modal focus, Escape and deliberate backdrop
dismissal remain. Confidence is high for the reproduced runtime defect; Figma
does not establish this browser interaction contract or a drawer entrance timing.
Verification scope is recorded in [validation](validation.md).

## Disabled-state follow-up — 2026-11-01

| Source / implementation evidence | Requirement / observed behavior | Current implementation | Mismatch | Action | Confidence |
| --- | --- | --- | --- | --- | --- |
| Hawiyah FileDropzone state review; React `expanded-controls.tsx`, Vue `controls.ts`, Angular `advanced-controls.ts` | A native file input can inherit disabled state from a fieldset while its component prop remains false | Drop handlers now consult the input's effective disabled state; vanilla already did | Confirmed adapter defect: drops could change a disabled control's files and emit selection callbacks | Fixed all three native adapters; preserve prior files, cancel blocked drops, retain the native first-legend exception and check changes during a drag | High for code and focused regressions; not a Figma-derived browser rule |

This is an accessibility/state-consistency correction found during alignment
work. It adds no official source requirement or visual-parity claim. Remaining
mobile navigation-drawer/top-bar compositions, broader state coverage and
imported-library/licensing questions remain separate backlog items. Hajj remains
excluded.

## Implemented mobile top bar — 2026-11-01

Mobile `8335:15376` now maps to native MobileTopBar components and a vanilla
HTML/CSS recipe. Main title `8335:15565` is 26px bold; internal title/subtitle
`8335:15402`/`8335:15403` are 14px semibold/12px. Application rows are separate
from the 44px OS status area, which is excluded. Hawiyah uses intrinsic height,
44px actions, logical back navigation, safe-area spacing and semantic theme
colors. These are documented web adaptations. See [the API and mapping](mobile-top-bar.md)
and [scoped verification](validation.md). The navigation-drawer composition
remains a separate task.

## Implemented navigation drawer — 2026-11-01

Mobile Nav Drawer `1679:30950` now maps to NavigationDrawer in all four adapters.
Source `1679:30949` informs the 327px preferred width, `2005:82723` the 16px
insets, `1679:30531` the 44px rows and 4px radius, and `538:296411` the 6×32px
current-page indicator. Semantic colors, safe areas and intrinsic scrolling are
documented adaptations. Native links and disclosures compose the existing modal
Drawer; disabled descendants are nonactivating and route closing respects
preventDefault/modifier clicks. Device/status geometry and an unverified entrance
timing are not copied. See [source mapping and API](navigation-drawer.md).

## Implemented mobile switch geometry — 2026-11-02

The opt-in mobile density now maps local Mobile Switch set `5403:403565` to a
52×32 px track and 28×28 px thumb at a 16 px root size. LTR default off/on
`5403:403566` / `5403:403570` place the thumb at x2/x22; RTL counterparts
`5403:403580` / `5403:403575` mirror those positions. Comfortable/compact retain
the existing 44×26 / 18×18 geometry and exact prior placement. Density tokens
scope the change across all four adapters; timing, semantic colors, native DOM,
reduced-motion and forced-colors behavior are retained. The 48×24 internal hover
cache `5403:403584` belongs to a different symbol version and is excluded.
Confidence is high for decoded geometry, without a new visual-parity claim.
See [the mapping and token contract](mobile-switch.md); verification is recorded
separately after the relevant checks run. Hajj remains excluded.
