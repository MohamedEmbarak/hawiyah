# NIC content navigation

Source: hashed `global.css` 1890–2036 and `master.js` 1750–1841, linked in
[NIC web reference](nic-web-reference.md). An isolated Chromium fixture rendered
the stylesheet at 1280px and 390px in RTL and LTR. Network/font requests were
blocked. CSS measurements and the static JavaScript inspection are separate
evidence; neither establishes full visual parity with the live SDAIA website.

| Source | Requirement or observed value | Hawiyah implementation | Confidence |
| --- | --- | --- | --- |
| CSS 1890–1928 | Sticky top 145px; at ≥1200px max-height viewport−165px, internal scrolling | Optional `sticky`; configurable `--hw-content-nav-top` and `--hw-content-nav-bottom-reserve`; desktop-only sticky layout | High; external Bootstrap positioning is replaced by explicit local CSS |
| CSS 1930–1948 | Global section scroll-margin 90px, unstyled lists, column gap 8px | Scoped semantic lists and gap 8px; offset is an instance option, with no global section-ID rule | High; global selector intentionally omitted |
| CSS 1950–1989 | 2px nested rail, 3px indicator, 2px radius, 140px minimum width; label 14px, padding 6px block | 40px measured link height, 28px line-height, wrapping labels and logical 8px/16px inline padding | High in RTL; LTR uses logical padding rather than preserving physical left/right asymmetry |
| CSS 1992–2025 | Neutral100 hover and Gray400 marker; Neutral300 focus; reference removes focus outline | Matching semantic surfaces and measured Gray400 hover token; visible keyboard outline retained | High; focus outline is an accessibility adaptation |
| CSS 2027–2036 | Active primary marker; label retains explicit text-default | `aria-current="location"`, green marker and ordinary text label | High; active state is also exposed to assistive technology |
| JS 1801–1817 | Smooth local section scrolling, navbar-height offset (80px fallback) | Configurable offset 80px by default; window or caller-owned scroll root; reduced motion forces immediate scrolling, even with consumer smooth-scroll CSS | High; no site-specific navbar lookup |
| JS 1759–1775 | Reveal current link only within an actually scrollable navigation; avoid moving the whole page | Scroll navigation itself when needed; passive tracking never focuses sections or scrolls the content viewport | High |
| JS 1820–1841 | IntersectionObserver threshold 0.3, root margin −100px/−50%; first item initially active | Deterministic geometry tracking, initial measured section, active threshold offset+20px and last section at scroll end | Intentional reliability adaptation for tall sections, gaps and independent scroll roots |

`ContentNavigation` is a new reusable component across React, Vue and Angular;
vanilla exports `createContentNavigation` and registers `data-hw="content-navigation"`.
It adds a distinct entry to the catalog (83 total), rather than treating local
section navigation as a tab panel switch or another horizontal site navigation.

## Composition and interaction

Items are `{id, label, disabled?, children?}`. IDs identify unique, existing
sections supplied by the application. The component renders nested semantic
lists, links and the navigation landmark named by the required `label`. Disabled destinations are
noninteractive. Heading display and desktop sticky layout are optional.

Links render `href="#id"` on the server and on the first client render. In the
browser core `bindFragmentLink` keeps each address on the current document under
any `<base href>`; see CONTRACT.md "In-page links". Normal activation scrolls to
the section without changing the URL or history; the optional `updateHash` writes
the fragment with `history.replaceState`.
Keyboard/assistive activation also focuses the target. Non-focusable sections
temporarily receive `tabindex="-1"`, restored on blur or cleanup. Modified links
retain browser behavior in applications; guide demos additionally block all
route navigation. Missing, disabled, hidden, inert, CSS-concealed and closed-details sections
are ignored (the first summary of closed details remains eligible). A missing configured vanilla scroll root does not fall back to
scrolling the host page.

The source observer can fail to activate a section taller than its observation
band, and multiple intersecting callbacks depend on delivery order. Hawiyah tracks
the latest section whose top passes the configured offset plus 20px, preserves
the preceding section through gaps, and activates the final section at scroll
end. This supports nested IDs and long content without copying the source's
global selectors or one-container assumptions. Observe current changes through
`onCurrentChange` (React/vanilla), `currentChange` (Vue/Angular) or vanilla's
`hw:change` event with `detail.current`.

The core observer measures and scrolls existing nodes. Each adapter owns its
rendered tree and active attributes. Refresh/rebinding handles changed roots,
items, section IDs, layout and visibility. Teardown removes listeners/observers
and restores temporary focus attributes; vanilla also restores authored link
attributes. There are no network calls, route registrations or site API hooks.

## Adaptations and examples

Two ready examples and native editor projects use separate bounded scroll areas:
nested sections with a disabled destination, and a hidden heading with a custom
accessible label. Their links scroll only the example's content. Public source
examples include actual imports, DOM refs, callbacks and framework setup.

Nested lists gain configurable 16px indentation to make hierarchy explicit;
the source's nested rule supplies a rail but no indentation. Long labels wrap,
and the source 140px minimum is capped to the available width. New geometry uses
the same semantic colors in original/custom themes. Dark and forced-color
states preserve current and keyboard focus cues. No source animation duration
is inferred for browser-managed smooth scrolling. Hajj, source navbar markup,
global ID-prefix behavior and official certification claims remain excluded.

## Validation

Thirty-six focused behavior tests pass: 13 core, 7 vanilla and 16 native parity/
SSR cases. They cover nested and disabled destinations, ordinary/modified and
keyboard activation, tall sections, visibility changes, closed details and its
first-summary exception, scroll-root rebinding, offset updates, reduced motion,
observer cleanup and temporary focus attributes.

Nine Chromium browser scenarios pass: Arabic/English ready examples, React
JSX/TSX, Vue JS/TS, Angular TypeScript, a window-scrolling fixture and guide/editor
navigation containment. Checks cover source geometry and hover/focus precedence,
light/dark accessibility scans, RTL/LTR marker placement, original/custom themes,
320px/390px layouts, forced colors, local scrolling, passive focus preservation,
and immediate reduced-motion navigation even with smooth-scroll CSS. Both demo
scroll regions have distinct accessible names. Mobile renders were inspected;
this remains scoped evidence, not full-site visual parity or certification.

The preview-card integration was separately rechecked in Arabic/light and
English/dark at 1543, 768, 390 and 320px, including keyboard order, framework icons,
disabled language selection, forced colors and scoped accessibility scans.
The full build passes for packages, the GitHub Pages-path guide and framework
example apps. Eight token contrast checks pass. Packaging and exported project
validation are recorded in the editor coverage document. No fresh full-catalog
browser run or manual screen-reader session is claimed.
