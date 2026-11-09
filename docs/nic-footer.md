# Portal footer composition

The supplied NIC stylesheet defines the presentation of footer titles and
links; its script populates browse, important and social links from site-owned
navigation data. Hawiyah now exposes that richer composition directly through
`PortalFooter`, without loading the reference site's scripts or endpoints.

| Evidence | Requirement | Implementation | Confidence / limit |
| --- | --- | --- | --- |
| `global.css` 3215–3222 | Unstyled vertical list, 8px gap | Grouped `hw-portal-footer-links` | High, decoded CSS |
| CSS 3224–3234 | 16px/24px medium title, 8px bottom padding/margin, white 30% divider | Group title and support heading profile | High, decoded CSS |
| CSS 3236–3248 | White 14px/20px links; hover underline and 80% opacity | Theme-aware inherited footer foreground and matching hover | High; original/custom themes use their current foreground |
| CSS 3250–3255; JS 1318–1341 | Wrapping social/accessibility action row with 8px gap | `hw-portal-footer-actions` and native support slots | High for composition; host supplies actions and labels |
| CSS 3257–3267 | Bottom margin 48px; logo height42px; 40px section spacing alias | 48px main-to-bottom spacing, 42px brand/partner marks | High for named values; columns remain content-driven |
| JS 1346–1388 | Browse/important groups, sorted site data and external-link treatment | Ordered `groups` and `legalLinks`, explicit external flag | High; no remote data, sorting or routes are assumed |
| Figma Form `2:44049`, Service `1:52987`; foundation `72:6` | SA-Flag footer background | Existing `footer` and `on-footer` semantic tokens retained | Existing decoded evidence; not newly asserted pixel parity |

The source's 40px `.FooterLinks` mobile margin is not copied as an additional
margin between already-gapped CSS-grid columns: this avoids doubled spacing.
The semantic footer uses existing 32px column gaps and stacks when constrained.
The source footer CSS does not independently establish its background; the
existing DGA tokens retain the separately documented Figma background evidence.
Light DGA uses `#074D31`, dark uses `#1B8354`, with white foreground. Original and
custom themes remain supported; forced colors use system colors and visible
focus. No global high-contrast filters or cookie-manager scripts are imported.
The source's 80% hover opacity is retained for light DGA. Dark/custom modes keep
full foreground opacity with underline because fading white against the brighter
dark footer would reduce normal-text contrast below the required threshold.

## Adapter APIs

- React adds `groups`, `legalLinks`, `legalLinksLabel`, `support`, `supportLabel`,
  `partners` and `externalLabel`. Existing `brand`, `description`, `links`,
  `linksLabel`, `legal` and children remain available.
- Vue adds `groups`, `legalLinks`, `legalLinksLabel`, `description`, `supportLabel`
  and `externalLabel`, plus `logo`, `support` and `partners` slots. Existing
  `brand`, `copyright`, `links`, `navLabel` and default content remain available.
- Angular adds the same data inputs with projected `[hwFooterBrand]`,
  `[hwFooterSupport]` and `[hwFooterPartners]`. Existing default content remains
  in an extra content region; `navigationLabel` and `copyright` retain their APIs.
- Vanilla uses ordinary footer/nav/list markup with the same public classes;
  no controller or DOM enhancement is required.

A group has `title: string` and ordered `links`. Each footer link accepts `label`,
`href` and optional `external`. External links open a new window with
`noopener noreferrer`, an indicator and a localizable accessible suffix.
Empty groups are omitted. New labels default to Arabic. Applications own all
destinations, support actions, cookie preferences, contact details and analytics.

The example uses Hawiyah's existing outlined Arabic wordmark as an alpha mask that
adopts the footer foreground. Official agency and partner assets must be provided
by their owners; the slot does not establish redistribution rights. NIC artwork
must retain the separately approved light/dark treatment when supplied.

## Verification boundaries

Focused tests cover server-rendered React/Vue groups, preserved old content,
new-window semantics, vanilla Arabic/English recipes and unique heading labels.
The Angular test covers projected brand/support/partner regions after package
rebuild. Five Chromium cases in `tests/browser/portal-identity.spec.ts` pass:
vanilla RTL/LTR at desktop/mobile sizes, light/dark and custom/original themes,
keyboard focus, forced colors, scoped axe scans, and native React/Vue/Angular
footer composition and contained demo actions. Rendered desktop/mobile footer
screenshots were inspected. This document records source mapping and does not
claim full visual parity or official DGA certification.
