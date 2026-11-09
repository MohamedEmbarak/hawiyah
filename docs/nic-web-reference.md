# NIC web UI reference — 2026-11-02

The user supplied the following NIC/SDAIA web sources as the DGA-approved UI
standard to implement. They take precedence over earlier inferred web-component
styles when a requirement is directly established. Existing explicit product
decisions, native adapter ownership, keyboard access and reduced motion remain
part of Hawiyah's contract. This records the supplied approval context; it does
not claim that Hawiyah itself has been certified.

## Source inventory

| Source | Retrieved bytes | Lines | SHA-256 | HTTP last-modified |
| --- | ---: | ---: | --- | --- |
| [global.css](https://files.sdaia.gov.sa/assets/css/global.css) | 101151 | 4192 | `939f118d428c5036675324a1d035122b682a027b6a26cb465374cb34c0ac3148` | 2026-08-09 06:21:18 GMT |
| [master.js](https://sdaia.gov.sa/Assets/js/master.js) | 101942 | 2684 | `17fd63104d29d897d88d26cc665811b3395ee6fc99b9bcf21c07279605819993` | 2026-07-26 07:51:18 GMT |

Both returned HTTP 200. Byte counts describe decoded response bodies, not
compressed transfer lengths. The CSS hash also matches the stylesheet exported
from the running browser. Parsing found 542 qualified CSS rules, including rules
inside media queries. The originals, downloaded dependencies and private chat
image stay outside Git. HTTP cookies and request identifiers are not evidence.

The supplied developer message describes composable card classes: base,
bordered and clickable variants, CSS-owned internal gaps, and separate title
and description styling. Icon presentation varies by service; no universal
green icon background is inferred.

## Rendered evidence and boundaries

[files.sdaia.gov.sa](https://files.sdaia.gov.sa/) rendered an invalid-link/code
screen at its bare URL. The observed sample has a navigation header, brand
images, a white rounded card, an information icon and a green return action.
It loads Bootstrap, other plugin styles, `global.css` and a later
`style.custom.css`; that combined page is not a standalone global-CSS fixture.
The main SDAIA site also rendered navigation, service cards, tabs and content.
These observations do not prove every stylesheet variant's visual behavior.

`master.js` is site integration code, not a dependency to embed in Hawiyah. It
references jQuery/Bootstrap, translation data, Accessibility.js,
FeedbackSettings.js, remote navigation/auth APIs and SharePoint markup. Hawiyah
implements reusable UI behavior in its own adapters. It does not call those
services, embed an official verification credential, or adopt their session
and navigation state.

## Coverage map and implementation queue

Line numbers below refer to the hashed snapshots above. Mapped means an
existing Hawiyah component or documented composition can own the requirement;
it does not mean every source state has already passed comparison.

| Source CSS / JS | Hawiyah owner | Hawiyah mapping and evidence |
| --- | --- | --- |
| CSS 1–426: fonts, primitives, responsive aliases, light/dark roles | tokens/styles | [Foundations comparison](nic-foundations.md) maps light/dark roles, widths, spacing, radii, elevation and responsive alias conflicts |
| CSS 427–850: typography, truncation, color, shadow, radius, divider utilities | shared styles, layout, Divider | [Scoped foundations](nic-foundations.md) cover 14 type styles, 1–10 line excerpts, elevation and the four divider tones; named colors use semantic tokens |
| CSS 853–965: link states, neutral links | Link | [Link states](nic-links.md): explicit brand/neutral/standalone/disabled recipes, native activation guards, readable state tokens and documented source contrast substitutions |
| CSS 971–1292: seven button families and sizes | Button, IconButton | [Implemented button task](nic-buttons.md): seven NIC families plus three existing extensions, shared typed variants, pressed/hover/focus colors and disabled states; density adaptations remain explicit |
| CSS 1294–1386: segmented buttons | ToggleGroup, ButtonGroup | Implemented: [source geometry, states, readonly/form parity and attached groups](nic-segmented.md); outline remains an adaptation |
| CSS 1388–1531: icon buttons and icon/background sizes | IconButton, icon recipes | [Icon presentation](nic-icons.md): circle/square buttons, SVG/context sizing, background-circle compositions, native loading/form/disclosure parity; licensed artwork unchanged |
| CSS 1565–1641: cards | Card, ServiceCard | [Implemented card task](nic-cards.md): base/border/action composition, title/description, gap, shadow and semantic links; eight scoped browser cases passed across four adapters |
| CSS 1645–1673, 3183–3212: icon/ordered lists | semantic list recipe | [Card list recipes](nic-lists.md) cover icon, compact and ordered lists with logical spacing and decorative markers |
| CSS 1677–1766: accordion | Accordion | [Implemented web profile](nic-accordion.md): nested header/body spacing, hover/focus surfaces, 150ms color and 200ms chevron timing; native details, visible keyboard focus and separate 300ms height motion retained |
| CSS 1770–1886: tables | Table, DataTable | [Table alignment](nic-tables.md): source cell geometry, header/separator and hover colors, retained striped/bordered extensions, native row headers, empty states and keyboard scrolling |
| CSS 1890–2036; JS 1750–1841: content navigation | ContentNavigation | [In-page navigation](nic-content-navigation.md): nested section links, source geometry/states, scoped scroll tracking, native focus/lifecycle ownership and contained guide examples |
| CSS 2040–2143: breadcrumbs | Breadcrumb | [Breadcrumb states](nic-links.md): neutral states, logical chevrons, 200ms motion with reduced-motion support, disabled destinations and readable current-page text |
| CSS 2148–2312; JS 931–1169: search | SearchField, Dialog composition | [Search composition](nic-search.md): optional free-text suggestions, Unicode-safe highlighting, source states and geometry, native modal examples; dictionary/host routes remain application-owned |
| CSS 2316–2427; JS 1854–2079: tabs and overflow | Tabs | [Responsive tabs](nic-tabs.md): source geometry/states, hidden-destination disclosure, native keyboard/focus ownership and explicit scrolling/vertical modes |
| CSS 2431–2648: field labels, native/text/select inputs | Field, TextField, Textarea, Select, DatePicker | [Input state/motion task](nic-inputs.md): 16px padding/labels, 500ms ease, 50% pressed line and no focus shadow; [select and supporting text](nic-select.md) covers the collapsed indicator, helper/error typography and native selection |
| CSS 2651–2726: addons/input groups | InputGroup and composed fields | [Input group task](nic-inputs.md): single line across direct input/addon composition, validation precedence, read-only/reduced-motion/system-focus handling and Angular projected value tracking |
| CSS 2729–3009: checkbox/radio states | Checkbox, Radio | [Implemented choice task](nic-choices.md): geometry, hover halo, checked/pressed/disabled/read-only presentation and activation protection across all adapters; focus/dark/system-color adaptations documented |
| CSS 3018–3079: badges | Badge | [Aligned](nic-badges.md): measured 20px single-line height, 4px radius, semantic borders and five palettes; typed soft/outline/dot variants across native adapters, all variants in ready examples |
| CSS 3082–3153: dot status labels | Badge composition | [Aligned](nic-badges.md): 24px minimum height, 10px dot, 8px gap; all five tones in native editor projects; wrapping, dark mode and original Hawiyah are documented adaptations |
| CSS 3156–3181: avatars | Avatar, AvatarGroup | [Aligned image geometry](nic-avatars.md): 40/64/80/120px, 3px border and centered cover crop; native image fallback/retry parity and seven guide examples. Group overlap/counts, square/initials and dark borders are Hawiyah adaptations |
| CSS 3215–3275; JS 1318–1578: footer/cookie links | PortalFooter, CookieConsent | [Grouped footer](nic-footer.md): source typography, dividers, link spacing, branding/support/legal slots; host routes and cookie integrations remain application-owned |
| CSS 3279–3423: carousel | Carousel | [Track and controls](nic-carousel.md): 600ms source easing, 45px arrows, 12px visual indicators, native index/indicator APIs and Angular slide templates. Inert slides, larger targets, reduced motion and responsive controls are documented adaptations; no source JS/autoplay claim |
| CSS 3427–3502: rating and half stars | Rating, RatingDisplay; Feedback remains separate | 30px stars, 200ms fractional display, integer native input and explicit accessibility adaptations; see [rating evidence](nic-rating.md) |
| CSS 3505–3666, 4005–4139; JS 2101–2346: pagination | Pagination | Source page windows, responsive underline presentation and accessible hidden-page jumps; see [pagination evidence](nic-pagination.md) |
| CSS 3670–3788: high contrast | forced-colors/custom theme | Preserve system-color support; do not apply global image/body filters to host applications |
| CSS 3846–4000; JS 318–558: notification banner/modal | ToastRegion, Alert, Dialog | [Notification banner](nic-notifications.md) maps source geometry, tone, entry motion, focus and mobile containment across all four adapters. The optional notification Dialog composition follows the measured panel, badge and action geometry |
| JS 627–929: multilevel main navigation | PortalHeader, NavigationDrawer | [Grouped portal navigation](nic-portal-navigation.md) covers parent and child destinations, flat and grouped panels, route activation, mobile layering and keyboard focus |
| JS 1176–1310: government verification disclosure | SiteVerification, PortalHeader composition | [Native disclosure](site-verification.md): configurable domain, HTTPS and registration information; authorized host artwork, safe new-window links and accessible native details. No official identifiers or certification claim |
| JS 1584–1606: copy helper | Button composition | [Copy action](nic-copy-action.md) includes email and visible-text examples, accessible clipboard results and a selectable manual fallback across all four adapters |
| CSS 4141–4192; JS auth/cache/bootstrap/devtools | site-specific integration | Excluded from generic package behavior; no SharePoint/auth/API/debug side effects |

## Confirmed source differences and intentional adaptations

- Primary button pressed background is Flag 800 `#14573a` (CSS 1065),
  replacing Hawiyah's earlier Flag 900 `#104631` token in the button task.
- Base card padding is **16px** through `--spacing-xl`. The card uses
  `--card-lg-gap`: **24px at 768px and above, 16px below**. Declared
  `--card-lg-padding` is not used by the base card selector; it must not be
  mistaken for actual card padding. The 768px min-width block also follows
  the 1025px block, so its overlapping aliases win by source order.
- Card radius is 16px, default shadow is the source medium shadow, and bordered
  cards use a 1px Neutral 300 border without shadow. Action hover uses Neutral
  50; focus restores the card surface with a 2px black outline. No independent
  card-specific pressed rule is defined.
- Card title is 18px/28px at weight 700; description is 16px/24px at weight 400.
- The source's normal field focus underline is neutral, including nonempty
  valid values. Hawiyah retains the explicit user-approved green-on-valid focus
  rule and red user-invalid/application-error rule. Empty fields remain neutral.
  ISO storage, Latin digits and the pinned calendar provider are unchanged.
- Some raw dark-mode rules use fixed light primitives, and some semantic aliases
  reference ASCII decimal dots while definitions contain a different dot
  character. Record actual cascade/fallback behavior instead of silently
  claiming these unresolved values are verified design decisions.
- Existing accessibility adaptations remain explicit. Source approval context
  does not eliminate the need to test the actual Hawiyah contrast, keyboard
  semantics, reduced motion, forced colors and nested themes.

The reports above record the implemented mappings, rendered measurements and
intentional differences for each reusable source pattern. The November 2
[quality report](quality-2026-11-02.md) describes the earlier implementation.
Hajj remains out of scope. Asset redistribution rights are separate from this
source comparison; external styles/scripts/assets are not bundled wholesale.

## Project editor coverage

All 83 catalog entries have bilingual, editable projects with actual package
imports. The guide runs vanilla JavaScript/TypeScript, React JSX/TSX, Vue
JavaScript/TypeScript single-file components, and Angular TypeScript with
templates. Downloaded projects include an application entry point and build
configuration. The guide preserves Angular's supported TypeScript model.

The [editor project report](editor-projects.md) identifies the tested scenarios,
consumer builds, live execution model and limitations of in-browser compilation.
