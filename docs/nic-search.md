# NIC search composition

Source: hashed `global.css` 2148–2312 and `master.js` 931–1169, listed in
[NIC web reference](nic-web-reference.md). An isolated Chromium fixture rendered
the supplied CSS in Arabic/English at 1280px and 390px. Network and font requests
were blocked. The source JavaScript was inspected statically; its SharePoint,
Bootstrap, remote dictionary and navigation integrations were not executed.

| Source | Requirement or observation | Nasaq implementation | Confidence |
| --- | --- | --- | --- |
| CSS 2152–2221 | 40px search field, logical equivalent of 12px text start and 40px clear space; 18px clear artwork; 200ms opacity change | Existing density and inset clear composition, 12px DGA start padding, 18px artwork, retained larger clear hit area and 48px text reserve | High for declarations; source icon-font metrics are not established by the fixture |
| CSS 2175–2204, JS 958 | Clear wrapper at 0.6 opacity; icon uses error text color, full opacity on hover | Semantic red at 60% alpha in DGA light mode, full readable dark-mode red; color/background transition at 200ms | Intentional dark-mode contrast adaptation; opacity is not applied to the keyboard focus outline |
| CSS 2224–2253 | Suggested terms: 8px gap, 13px/1.4 label, 6px/14px padding, 20px radius, Flag 50/100 surface/border; primary hover/focus | Scoped `.nq-search-terms` and `.nq-search-term`, semantic colors and visible keyboard focus | High; fixture measured approximately 32.2px single-line height |
| CSS 2256–2274 | Centered advanced action, 16px top margin, 10px/28px padding, 6px radius, primary/Flag 700 interaction | `.nq-search-advanced` composition and semantic primary states | High; fixture inherited 16px/28px typography and measured 50px height |
| CSS 2277–2312 | Popup 4px below field, Neutral 200 border, 8px corners, 0/8/24px shadow at 12%, max-height 280px; option padding 10px/14px, text 14px/1.4 | Scoped listbox inside the input wrapper, matching geometry, semantic surfaces and active/hover state | High; no global site ID or Bootstrap z-index dependency |
| JS 1008–1079 | Lowercase, strip Arabic marks, unify alef variants; contains matching, exact duplicate removal, at most eight suggestions | Pure shared `getSearchSuggestions`, default limit 8, original text and correct highlight ranges retained | High; source highlighting indexes are corrected when normalization changes string length |
| JS 1082–1143 | Arrow wrap, Enter selects an active suggestion before searching, Escape dismisses, pointer selection retains focus | Native adapter listbox semantics, input `aria-activedescendant`, free-text value, layered Escape and IME guards | High; semantic keyboard and composition handling extend the source |
| JS 1025–1032, 1146–1169 | Trim nonempty search, clear and refocus, outside dismissal, autofocus on modal open | Search/form events remain application-owned; local suggestions, clear action, and a native Dialog composition | High; no site URLs, dictionary script injection or remote calls |

## API and composition

`SearchField` remains a free-text field. Optional `suggestions` enable autocomplete;
they do not restrict the submitted value to an option. `maxSuggestions` defaults
to 8 and is bounded to 0–100. Supply localized `resultsMessage`, `clearLabel` and
`searchLabel` when needed; new search defaults are Arabic. Numbers remain Latin.

React uses `value`/`onValueChange`, Vue uses `v-model`, and Angular retains its
value-control and forms integration. Vanilla accepts options or a local JSON
string-array in `data-nq-suggestions`; it never evaluates that data or loads a
dictionary. Each native framework owns its input, options and active attributes.
The shared helper only computes matches and text segments, including Arabic
diacritics and original Unicode offsets. Strings are rendered as text.

An active suggestion consumes Enter and updates the field. Enter without an
active suggestion leaves native form submission available and can emit the
adapter's search notification. Use either the form submit handler or that
notification for the same search operation, to avoid handling it twice.
The optional icon search action uses `showSearchButton`; React/Vue default to
false and Angular retains its earlier true default. Cross-adapter compositions
set false explicitly and provide one external submit button.

The popup closes on blur, outside interaction, clear, reset or unavailable state.
Escape dismisses an open suggestion list before an enclosing dialog; a later
Escape can close the dialog and restore trigger focus. Disabled/read-only fields
do not accept suggestion edits. A read-only existing query may still be searched.
Composition events prevent Enter from submitting an unfinished IME sequence.

Native search inputs can consume Escape to clear their value before a modal
receives its close request. With the suggestion list closed, Nasaq explicitly
requests closure of the nearest modal dialog, preserving the query and native
cancel handlers. It respects `closedby="none"` and leaves nonmodal/outside-search
behavior alone. The helper uses the standard
[`requestClose()`](https://html.spec.whatwg.org/multipage/interactive-elements.html#dom-dialog-requestclose)
when available, with a cancellable `cancel` event fallback.

Four ready examples cover plain free text, bilingual suggestions, unavailable/
error states and a search dialog with suggested terms and an advanced action.
Their actions display local results and never navigate the guide. Native editor
projects include actual adapter imports, state, forms and dialog controls.

## Adaptations and limits

The reference uses unnamed suggestion divs and global site listeners. Nasaq adds
combobox/listbox semantics, result announcements, native lifecycle cleanup,
visible input focus, an inset active-option outline and reduced-motion overrides.
Each suggestion uses automatic text direction independently of the UI direction.
Popup scrolling affects
only the list, not the host page. Dark/original/custom themes use semantic colors.
The source's 60% clear-icon opacity is represented by an alpha foreground in
light mode; dark mode uses an opaque foreground for contrast. Background and
foreground transitions replace whole-control opacity so focus remains visible.

Native modal focus containment replaces Bootstrap. No modal width, backdrop or
animation is attributed to the supplied search rules: those rules depend on
external Bootstrap definitions. Nasaq retains its existing Dialog geometry.
The source dictionary, host result routes, advanced-search implementation and
SharePoint form workaround remain application-owned. Hajj is excluded. This
comparison does not grant rights to official assets or claim DGA certification.

## Verification

64 focused tests passed for the matcher, form handling, modal dismissal and adapter behavior. Eight Chromium scenarios exercised the Arabic and English guide, touch selection, and the JSX, TSX, Vue JS/TS and Angular TS projects. Six editor tests passed, including native validation, dialog form submission and the browser blocking an external form action. The Arabic and English 320px dialog captures were inspected with suggestions open.

The workspace build, token contrast suite, clean package consumer, guide typecheck and production build passed. The project checker compiled 35 React and 35 Angular recipes and built the seven supported project exports.
