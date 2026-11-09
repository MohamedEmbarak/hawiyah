# Ready component examples

The guide now shows complete status groups rather than one success message:

- Alert: neutral, info, success, warning and danger; default, outline and minimal.
- Badge: all five tones in soft, outline and dot presentations.
- Chip: all five tones in soft and outline presentations.
- ToastRegion: all five tones together with dismissal controls.
- Button: seven NIC families and ghost/soft/link extensions, sizes, disabled and busy.
- PortalHeader: identity, skip link, responsive navigation and account action.
- PortalFooter: identity, description, privacy/accessibility/contact links and legal text.
- PortalLayout: header, page content and footer composition.

Open `#component/alert`, `#component/portal-header` or `#component/portal-footer`.
The “Ready-to-use examples” section includes vanilla markup and native React,
Vue and Angular usage for the components above (PortalLayout uses its shared
composition recipe). Brand asset paths and application routes are caller-owned.
Do not run vanilla enhancement on framework-owned DOM.

## Library changes

The neutral type in the supplied `master.js` notification configuration
(318–360) is now supported by Alert and ToastMessage types in all native
adapters. Existing `danger` corresponds to the source's `error`; the public
name remains stable. Neutral Alert uses Hawiyah semantic text/surface tokens.
This does not claim that all source notification placement or timing is matched.

React and Vue Alert now group their title and body vertically, matching Angular
and the vanilla composition. All three native Alert adapters expose
`variant="default|outline|minimal"`. Angular Badge exposes
`variant="soft|outline|dot"`; Angular ToastRegion exposes `variant="inline"`
for embedded notices. Public classes, existing variants and default behavior remain.

Static guide examples do not announce every message through live regions.
Application status/alert semantics and explicit notification dismissal remain.

## Guide behavior

Only demo links and forms are contained: ordinary clicks, keyboard activation,
modified clicks and middle clicks do not change the guide URL or open another
site. The preview reports the action. A skip link can focus a target inside its
own preview without changing the URL. Documentation links outside previews
continue to navigate normally. Production library links keep native semantics.

The component catalog uses responsive CSS masonry columns. Cards retain their
own height and are not split between columns; expanding source code and changing
filters work without a layout observer. Reading/focus order follows the DOM,
down each column in the active writing direction. Mobile uses one column.

## Scoped verification

- Four guide browser cases passed: Arabic/English status coverage, keyboard,
  modified/middle-click containment, skip-link focus, responsive menu closing,
  genuine documentation navigation masonry expansion/reflow and white-button preview backdrops. Three existing guide regression cases also passed across all 81 component references.
- Six native browser cases passed: Arabic/English in React, Vue and Angular;
  five tones, vertical alert content, badge variants, inline notifications,
  light/dark axe checks and responsive header/footer interaction at 390/320px.
- Twelve focused SSR/component tests passed; full package/guide/native build passed.
- Rendered gallery and five-alert screenshots were inspected locally. These are
  Hawiyah render checks, not an assertion of visual parity with every NIC source.

Hajj remains excluded. No private chat image or external CSS/JS/asset archive
is included. These checks do not constitute official DGA certification.
