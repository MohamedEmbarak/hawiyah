# DGA source audit follow-up

This record updates the 2026-10-29 source audit during the implementation work begun on 2026-11-01. The comparison baseline was `761e738025b4f7f104e582dcd03872ea47a834f8`. Implementation status below distinguishes completed edits from verification; actual passing commands and their scope belong in [validation](validation.md).

## What newly accessible sources change

All **23 supplied files** are decoded, including the six previously blocked by remote transfer size. The [inventory](dga-source-inventory.md) records exact filenames, sizes, SHA-256 hashes and export metadata. No standalone web Components Library was supplied. **Hajj is an application-specific design and is excluded from Nasaq implementation scope and backlog.** Historical inventory counts include that file, without making its features requirements for Nasaq.

The new evidence strengthens the case for Home and Search compositions, a reusable responsive portal shell, and explicit mobile input sizing. It does **not** require replacing the mapped foundation: all 40 selected Foundations variables match the decoded source values. It also confirms that source mobile control dimensions differ from the existing web density. These differences require an additive mapping rather than a global token replacement.

Every canvas format was checked independently: 17 files use fig-kiwi serialization v101 and six use v106. All have a raw-DEFLATE Kiwi schema and Zstandard message; successful message decoding yielded 1,385,975 node-change records. The inflated schemas share SHA-256 `d2934242ce6b5a3c41bc731d53ac2f3ac2fc1b7e5d4efe631903d3cf93413dde`. Serialization and export timestamps are not official design-library release numbers. Records include instances, caches and deleted definitions, so their count is not a component inventory.

Foundations has 784 resolved active local variables. Mobile has 681 variable records without import markers, but only 38 active local variables after excluding soft-deleted definitions and collections. Its active local Theme has Light mode only. Imported source identity, publication version and mode must be preserved: 104 imported variable-mode values remain ambiguous across the files, including repeated cache material. They are not 104 confirmed source defects. For example, local Foundations `Text/text-primary` (`50:204`) is green, while an imported definition with the same name (`26:276`) is neutral; name-only merging would change the intended role.

## Traceable comparison and implementation plan

Short source names below expand to exact filenames in the inventory. **Decoded** means extracted properties or source text. **Rendered** means direct native Figma canvas observation. High confidence describes the stated evidence, not certification or exhaustive visual parity.

| Source file / node | Requirement or observed value | Implementation at baseline → current work | Mismatch / classification | Recommended action and status | Confidence |
|---|---|---|---|---|---|
| Nasaq runtime audit; Mobile input state set `3149:54894` supplies related read-only state evidence | A read-only value must not trap keyboard navigation; Figma metadata does not establish Tab behavior | `packages/vanilla/src/controls.ts` cancelled every read-only RangeSlider keydown → now cancels value-changing keys only | **Confirmed defect** in Nasaq keyboard behavior | Fix implemented; unit and browser RTL/LTR Tab/Shift+Tab regressions added; verification recorded separately | High: implementation and reproduced runtime defect |
| Mobile `3149:54894`; underline `11167:15723` → `11167:15747` | Decoded pressed/focused underline changes from 35% to 100%; read-only is a separate state | Filled focus selectors overrode read-only suppression in `packages/styles/src/dga.css` → editable-only selectors | **Confirmed defect**: filled read-only fields displayed an underline plus inset focus | Fix implemented; light/dark and forced-colors browser regressions added. Preserve single inset read-only focus | High: decoded source and reproduced runtime defect |
| Mobile input `3149:54894`, Dropdown `3534:49934`, Textarea `5462:417368`; Nasaq shared `data-size`/`data-variant` contract | Source provides multiple visual/state choices; Nasaq exposes its own documented size and filled variant | Angular native TextField/Textarea/Select lacked forwarding → `size` and `visualVariant` now target native controls | **Confirmed adapter gap**, not a promise to implement every mobile source variant | Fix implemented and Angular binding regression added; eight Angular native component tests passed; see validation | High: source and adapter inspection |
| Home `62:45927`, `62:45930`; Search `39:53390`, `39:53393`, `266:28917` | Decoded guidance preserves header structure/colors/fonts; optional secondary navigation. Rendered Home `176:9378` shows open header search | Existing PortalHeader implementations lacked consistent responsive disclosure behavior | **Missing component composition / behavior** | Responsive PortalHeader, SecondaryNav and PortalLayout implemented across native adapters, with Escape/outside close, focus return, RTL and responsive tests; see validation | High for source structure; exact parity unestablished |
| Home `861:9628`; Search `39:53428` | Decoded footer structure guidance; rendered desktop Home has a multi-column green footer | Simplified footer and shared layout primitives exist | **Missing reusable layout coverage**, with existing simplification an adaptation | Implemented reusable footer, breadcrumbs, content container and page shell. Consumer content and slots remain explicit; no claim of exact official reconstruction | High for structure |
| Home `176:9378`, `72:46744`, hero `72:46782`, services `72:46864` | Rendered desktop has hero, statistics, services, news, partners and footer. Mobile hero/services use 16 px inline / 40 px block padding and 32 px gaps | No Home gallery recipe at baseline → Home composition in progress in `apps/playground/src/dga-templates.ts` | **Missing page template** | Arabic-default bilingual responsive recipe; content-driven hero height, meaningful actions, reduced-motion support. Do not infer autoplay from pagination dots | High for composition and selected geometry |
| Search page `1:4`, mobile AR `39:45381`, content `39:45386`, summary `39:45387`; instructions `64:12709`, `64:12718`, `76:9786`, `76:11583` | Rendered service-card and plain-link results, query/count, filter/sort and pagination; decoded instructions retain query and reset selected filters | No Search page at baseline → Search composition in progress in `apps/playground/src/dga-templates.ts` | **Missing page template / workflow** | Retain query, result count, filter reset/removal, sorting, pagination and empty/loading/error states. The microphone glyph alone does not establish voice-search behavior | High for structure and decoded instructions |
| Mobile body `11167:15771`, set `3149:54894`; Buttons `407:510377`, `407:510548`, `407:510617` | Decoded and rendered input body 320×44, radius 4; decoded buttons large/medium/small 44/40/32 | Shared comfortable sizes are default/small/large 40/32/40; compact 32/24/40 | **Missing mobile profile**, not a proven defect in existing web density | Later additive mobile/touch mapping. Preserve public tokens, original/custom themes and existing desktop density | High |
| Mobile `3149:55032` → `3149:55105`; underline `11167:15723` → `11167:15747` | Decoded SMART_ANIMATE 150 ms, cubic-bezier(0,0,.58,1), neutral underline | DGA uses corresponding timing/geometry with green valid / red invalid underline | **Intentional approved adaptation** | Preserve colors and no duplicate outer ring. Later extend per-component motion/state fixtures; no universal 150 ms timing claim | High for decoded properties; playback unverified |
| Mobile `8332:24453`, `8335:15376`, `1679:30950` | Decoded Tab Bar, Top Bar and Nav Drawer; example heights include mobile/device composition | Existing Tabs/Drawer/PortalHeader primitives provide partial building blocks | **Missing mobile patterns** | Later compose navigation semantics, safe-area handling, focus return and RTL; do not hardcode status-area heights from a frame | High for source structure |
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

Arabic remains the default; locale and direction are independent. The Nasaq mark remains the Arabic-only outlined wordmark. NIC artwork keeps original colors in light mode and becomes entirely white in dark mode. DGA editable focus uses an animated green underline, red when invalid, without a duplicate outer ring; read-only and forced-colors states retain visible keyboard focus. These approved adaptations must not be overwritten by a neutral source underline.

Original Nasaq and custom themes remain supported. Public `nq-` classes and `--nq-` variables remain stable, and each framework owns its DOM. Calendar values remain ISO dates with the pinned Umm al-Qura provider; a visual audit does not change calendar calculations. Seasonal Founding/National Day presentations are optional product decisions. Hajj is not a Nasaq backlog item.

## Remaining evidence limits

Representative Mobile, Home and Search frames were observed in the native Figma application. Project names and selected node IDs correspond to the decoded exports; the project copies were not byte-verified against those archives. Mobile input `3149:55023` / body `11167:15771` / underline `11167:15772` visually corroborates the pale filled body, radius 4 and short dark pressed underline. Home and Search observations establish composition and selected dimensions, not every typographic or spacing detail.

No exhaustive Nasaq–Figma pixel comparison, prototype playback audit, manual screen-reader assessment, full four-adapter state matrix, or mobile dark-mode parity is established by those views. Hover references into older internal symbols and ambiguous imported alias modes need explicit source/version resolution. No standalone web Components Library means exhaustive official web-component coverage remains unresolved. Source correspondence and passing automated tests do not establish DGA certification.
