# Site verification above the header

`SiteVerification` (React/Vue), `HwSiteVerificationComponent` (Angular), and
`.hw-site-verification` native HTML provide an optional disclosure above a portal
header. Use `.hw-portal-masthead` around the banner and `PortalHeader`; the shared
gutter is 32px on larger screens and 16px below 600px, overridable with
`--hw-portal-gutter`. `data-variant="sticky"` sticks the complete masthead.

The component has no text of its own and does not assert government ownership,
registration or compliance. An authorized deployment supplies its own approved
label (for example **معلومات الموقع**), domain, certificate URL/number and artwork. The guide deliberately uses
`example.test` and a demonstration label/link. No official stamp, flag, agency
logo or registration identifier is distributed in this component.

## Source comparison

The supplied [NIC/SDAIA script](https://sdaia.gov.sa/Assets/js/master.js), pinned
in [the source record](nic-web-reference.md), defines the structure below.

| Source | Observed requirement | Hawiyah implementation | Confidence / limits |
| --- | --- | --- | --- |
| JS1176–1200 | Verification aside at the top; identity mark, claim and disclosure label | Native aside/details/summary, optional mark slot, configurable labels | High for structure; native summary is an accessibility adaptation |
| JS1201–1230 | Domain guidance and HTTPS guidance in two columns | Responsive two-column checks; omit domain section when not configured | High for content structure; exact stamp-specific CSS was not in supplied global.css |
| JS1231–1241 | Platform-registration link with displayed identifier and new-window target | Optional URL/number, `_blank` by default, `noopener noreferrer`, localized new-window suffix; opt out with registrationExternal=false | High; application supplies its own registration data |
| JS1254–1260 | Reserved top slot or body insertion | Explicit masthead composition rendered with the header; no body injection | High; avoids a late-insertion layout shift |
| JS1274–1309 | Disclosure shows/hides details and switches arrow | Native details works without JavaScript; decorative arrow rotates; state callbacks use each framework | High for behavior, not pixel parity |

The [DGA digital-stamp guide](https://dga.gov.sa/sites/default/files/2025-07/%D8%AF%D9%84%D9%8A%D9%84%20%D8%A7%D9%84%D9%85%D8%B3%D8%AA%D8%AE%D8%AF%D9%85%20%D9%84%D9%85%D9%86%D8%AA%D8%AC%20%D8%A7%D9%84%D9%86%D8%B3%D9%8A%D8%AC%20%D8%A7%D9%84%D8%B1%D9%82%D9%85%D9%8A%20v10_3.pdf)
and indexed government pages such as [my.gov.sa](https://my.gov.sa/ar) corroborate
this pattern. Direct live-page/PDF retrieval was blocked during this task, so
these are corroborating references, not live visual-parity evidence. Deployment
requirements should be checked with the [official Platforms Code portal](https://design.dga.gov.sa/).

## API and ownership

The application supplies `label`, `detailsLabel`, `domainLabel`,
`domainDescription`, `httpsLabel` and `httpsDescription` in every use, and
`registrationLabel` and `externalLabel` when `registrationHref` is set. There is
no `locale` input and no default wording; the former core helper
`getSiteVerificationLabels` is removed, and core exports only the
`SiteVerificationLabels` and `SiteVerificationOptions` types. `domain`,
`registrationHref` and `registrationNumber` are host-owned values.

- React: `open` / `onOpenChange`, or `defaultOpen`; `mark` and ordinary children.
- Vue: `v-model:open`, or `defaultOpen`; `mark` and default slots.
- Angular: `[(open)]`; `[hwVerificationMark]` and default projected content.
- Vanilla: ordinary `<details open>` and its native `toggle` event. No controller
  or `enhance()` call is required for this component.

The disclosure uses native keyboard and expanded-state semantics. Its links stay
out of the tab sequence while collapsed; focus is visibly outlined. Domains and
numbers use LTR isolation within Arabic content. Reduced motion removes the
decorative arrow transition; forced colors preserve boundaries and focus.
The 44px summary target and token-based surfaces are intentional Hawiyah choices.

The link and lock icons are unchanged MIT Hugeicons assets from the existing
pinned revision; the supplied script uses those names. Provenance accompanies
the SVGs. Their geometry has not been compared to official artwork. The component
does not verify domains, TLS status, certificate validity or DGA certification.
