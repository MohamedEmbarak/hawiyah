# NIC pagination alignment

Sources: the hashed `global.css` and `master.js` snapshots in
[NIC web reference](nic-web-reference.md), CSS 3505–3666 / 4005–4139 and JS
2101–2346. Styles were measured in an isolated Chromium fixture with network
requests blocked; the extracted pure page-window function was evaluated against
first, middle, last and six-page inputs. Bootstrap/Popper and official icon/font
assets were not loaded, so the fixture does not prove live-site visual parity.

| Source | Observed requirement/value | Previous Hawiyah gap | Implemented action / confidence |
| --- | --- | --- | --- |
| CSS 3505–3555 | 40px square controls, 14px text, 8px gap, neutral-100 hover, 300ms color transition | Rounded, tinted current buttons with no source underline | DGA geometry, semantic text/hover and transition tokens; high |
| CSS 3557–3578 | Black 2px focus outline for `.page-link`; current page has a primary 3px underline inset 4px | Filled current state | Current underline and visible keyboard outline; high for values, accessible focus retained on all native controls |
| CSS 3581–3615 | 40px arrow controls; 18px font artwork, direction chosen by language | Text previous/next labels | Direction-aware geometric SVG masks and accessible labels; see the November 5 source-node comparison below |
| CSS 3640–3666 / 4005–4009 | At ≤576px, 6px gaps, 12px numbers and declared 20×30px page controls; later `.pagination-nav` rule restores 40px margins | No specific compact pagination profile | 30×30px numeric targets, 40px arrows/ellipsis width, wrapping and effective 40px margin; narrower source targets intentionally enlarged |
| CSS 4031–4099 | Dropdown minimum width 80px, maximum height 300px, 4px radius, neutral-200 border, source shadow; 40px items and 200ms transition | Passive ellipses | Scrollable disclosures with the measured values; high for CSS, positioned centrally below the pagination to avoid edge clipping |
| JS 2219–2255 | First five / last five page windows; first/last plus current neighbors in the middle | Narrower edge windows | Shared bounded helper follows default source windows; empty and one-page gaps become direct page buttons |
| JS 2258–2293 | Ellipsis reveals every omitted destination | No jump controls | Up to 100 hidden-page buttons; larger gaps use bounded numeric entry covering the full range without huge DOM allocations |
| JS 2173–2184 / 2305–2342 | Single-page pagination hidden; selection renders data, calls a callback and optionally scrolls | Generic controlled/uncontrolled pagination | Optional `hideOnSinglePage`; selection callbacks preserved. Data rendering, filtering and scrolling remain application-owned |

The source has two cascade/data nuances. Its late 40px navigation margin wins
over the earlier 24px mobile rule. Its default six-page window includes an
ellipsis between 5 and 6 with no omitted destinations. Hawiyah preserves the
effective margin and removes that empty disclosure. The isolated stylesheet
fixture measures 38px mobile page height without Bootstrap's border-box reset
(30px declared height plus padding); Hawiyah explicitly uses border-box sizing.
The supplied JS's `maxPagesToShow` condition does not parameterize its hardcoded
five-page edge branches. Hawiyah instead retains its documented `siblingCount` API.

## Native behavior and composition

React keeps `page/defaultPage/onPageChange`, Vue keeps `v-model/defaultValue`,
and Angular keeps `page/pageChange`. The application supplies `label`,
`previousLabel`, `nextLabel`, `getPageLabel(page)`, `getGapLabel(start, end)`,
`jumpLabel` and `goLabel`; `formatPage` optionally formats visible numbers.
Digits remain Latin by default. `disabled` blocks selection. `hideOnSinglePage` defaults to false
for compatibility; true matches the source's single-page hiding behavior.

Page numbers are ordinary buttons with `aria-current="page"` on the current
destination. Ellipses are native `details/summary` disclosures, not ARIA menus.
Enter/Space opens them, Tab visits available destinations, Escape closes and
returns focus to the summary, and outside clicks close them. Opening a second
gap closes the first. Selecting a hidden destination closes the disclosure and
focuses the resulting current-page button after the owning framework updates.
The adapters own their trees; no vanilla enhancement runs on framework DOM.

For a gap larger than 100 pages, a labeled integer input accepts any page within
that gap. Go or Enter validates before changing page. Invalid attempts retain
the current page. The internal input uses `form=""` and no name, so its required
constraint and draft never affect a surrounding application's form validation
or submitted data. Its filled/invalid states use the shared input styling.
This is a navigation disclosure rather than a nested form.

Vanilla preserves fully authored `[data-hw-page="previous|next|number"]` markup
and real link navigation, including modifiers. Adding
`[data-hw-pagination-items]` opts into generated page windows. The root uses
`data-hw-total`, optional `data-hw-current`, `data-hw-siblings` and
`data-hw-hide-single`; typed options offer equivalent configuration and callbacks.
Destroy restores original item-host children, authored attributes and listeners.
`select()` retains its strict integer/range contract and does not emit on no-ops.

The core helpers `normalizePaginationTotal`, `normalizePaginationPage` and
`getPaginationItems` keep native props finite and bounded. Totals normalize to
positive safe integers; pages clamp to the current total. Windows contain
numbers and inclusive `{start,end}` gap ranges; they never allocate the whole
result set. Vanilla retains strict positive-safe-integer validation of its
configured total. Neither adapter fetches results, changes the browser URL nor
automatically scrolls the host application. Demo actions stay within their example.

## Themes and adaptations

Original Hawiyah retains rounded, tinted current-page presentation and instant
transitions. DGA/custom profiles use the source geometry and underline. Dark
mode uses semantic colors; reduced motion removes transitions and forced colors
retain focus/current-page cues. The source's low-opacity disabled treatment is
represented with semantic disabled colors and native disabled controls.
Mobile numeric targets are wider than the source's 20px minimum, and controls
wrap instead of overflowing. Menu positioning is bounded to the pagination's
width, rather than depending on external Bootstrap/Popper positioning code.
The source's site data/filter/scroll integration is not copied. Hajj is excluded.
This work does not constitute official DGA certification.

## Validation

Focused checks cover 3 core page-window tests, 23 native adapter tests, 8 vanilla
controller tests and 4 existing pagination regressions. All pass, alongside the
8 shared token contrast checks. Seven browser scenarios pass: Arabic and English
vanilla examples, React JSX/TSX, Vue JS/TS and Angular TypeScript. These exercise
page windows, disclosure keyboard/outside dismissal, focus return, bounded jump
validation and mobile containment. Vanilla checks additionally cover independent
direction, light/dark accessibility, original/custom themes and forced colors;
native previews cover controlled updates and reduced motion.

The full build and GitHub Pages-path guide build pass. Clean tarballs pass ESM,
SSR, declarations, Angular APF, CSS exports and tree-shaking checks. All 33 React
editor recipes pass TypeScript checking, all 33 Angular recipes pass strict
template checking, and all seven exported framework/language projects build.
The integrated editor card also passes its Arabic/light and English/dark layout
checks at 320, 390, 768 and 1543px. This is focused pagination/editor validation,
not a fresh full catalog browser run or a claim of live NIC-site visual parity.

## November 5 arrow correction

Pagination controls now render geometric SVG masks instead of font-dependent
chevron characters. The right arrow uses a 24px viewBox, points (9,6), (15,12),
(9,18), 1.5px stroke and rounded joins/caps. Source Stroke nodes 8681:21884 and
8681:21968 in the supplied Icons file establish these proportions. The authored
right-arrow mask differs by 0.91% normalized alpha from the decoded source
outline in a 288px Chromium raster comparison. Its foreground inherits the
control color, and its direction follows the nearest HTML direction boundary.
All four adapters use this shared style. Forced colors retain visible arrows.
The raw archive artwork is not shipped.
