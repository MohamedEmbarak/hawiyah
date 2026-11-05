# NIC icon buttons and background icons

The additive [Featured icon composition](dga-featured-icons.md) covers the
Figma container sizes, square/circle treatments and semantic status roles.
Its 32/40/48/56px geometry is distinct from the NIC background helpers below.

This task uses the hashed NIC `global.css` snapshot in the
[source inventory](nic-web-reference.md), not an imported icon font or external
script. The shipped artwork remains the unchanged licensed SVG set described in
[icon provenance](../packages/styles/src/assets/icons/provenance.json).

| Source | Observed value | Implementation / adaptation | Confidence |
| --- | --- | --- | --- |
| CSS 1388–1396 | Default icon button 40×40px, padding 0, radius 4px, centered flex | Shared IconButton and legacy data-icon-only markers use square density targets and centered artwork | High; default source dimensions reproduced in an isolated Chromium fixture |
| CSS 1402–1404 | Circle radius 9999px | shape="circle" in all native adapters; data-shape="circle" in HTML | High |
| CSS 1406–1409 plus 971–1045 | Small declares 24×24px but inherits minimum width 32px: actual fixture is 32×24px; glyph 16px | Keep Nasaq's established square targets: comfortable 32/40/40, compact 24/32/40, mobile 32/40/44 for sm/md/lg. Source small is not described as square24 | High source/cascade evidence; intentional density and shape adaptation |
| CSS 1010–1020 | Button glyphs 20px; small glyph 16px | DGA defaults are 20px or 16px, including SVGs projected through framework wrappers. Existing --nq-icon-size overrides remain effective | High |
| CSS 1412–1455 | Background circles: xs30px, ordinary48px, xl48px; pale green #ecfdf3 | Noninteractive .nq-icon-background composition with xs/md/xl; existing success roles reproduce light colors and provide readable dark colors | High; normal/xl equality reproduced in source fixture |
| CSS 1458–1487 / 1503–1531 | Font glyph sizes 14/20/24; image sizes 14/20/24/30/48 with padding; font 2xl size commented out | Explicit SVG artwork sizes sm14/md20/lg24/xl30/2xl48. No font padding or commented-out value is presented as an active font rule | High declarations; SVG artwork-box normalization is an adaptation |
| CSS 359–360 / 413–414 | Light green foreground #067647 and background #ecfdf3; dark foreground #069454 but same light background | Reuse tested success/success-subtle tokens; dark background and text follow the active Nasaq theme | High; dark pairing is an accessibility adaptation |
| CSS 1398–1400 | Primary i elements forced white, regardless of disabled parent color | SVGs use inherited currentColor; disabled and loading colors take precedence over selected state | High; avoids a source disabled-state conflict |

The fixture loaded the supplied stylesheet alone, blocked external requests,
and used a simple placeholder glyph to measure boxes. It did not load the site's
Bootstrap/custom stylesheet cascade, official font icons or private artwork.
These measurements and decoded CSS declarations are not visual-parity claims
for all official icons. No new timing is inferred from the icon selectors;
IconButton retains shared Button motion and reduced-motion behavior.

## APIs and composition

React, Vue and Angular IconButton accept `shape="square|circle"`, `size="sm|md|lg"`,
`variant`, `disabled` and `loading`. Loading disables the native button and sets
`aria-busy`; it keeps the accessible operation label. Native defaults are now
consistently `ghost`. React callers relying on its previous implicit primary
appearance should explicitly pass `variant="primary"`. Ordinary Button defaults
are unchanged. Vanilla recipes explicitly set their variant and use native
`disabled` / `aria-busy` attributes.

Use `aria-pressed` in React/Vue/HTML and `pressed` in Angular for an
application-controlled toggle. Its selected appearance stays readable on hover
and focus; disabled styling wins. Applications update the selected value.
A decorative icon alone is never the accessible name: supply `label` on native
components or `aria-label` on a native button, and hide its artwork from assistive
technology.

Angular now forwards `form`, `name`, `value` and `type` onto the actual button.
An explicit empty form value is preserved, so it can detach a submit button
from an ancestor form; omission restores native association.
Its `controls`, `expanded`, `describedBy` and `hasPopup` inputs set the respective
ARIA attributes there; putting attributes only on an Angular host does not
establish the button's relationships. React/Vue/HTML use native ARIA attributes.
Vue and Angular expose `focus()`; React and HTML use the native button ref.
Angular's existing `activated` output remains unchanged.

```html
<button class="nq-button nq-icon-button" type="button" data-variant="ghost"
        data-shape="circle" aria-label="بحث">
  <span class="nq-icon" data-icon="search-01" aria-hidden="true"></span>
</button>
<span class="nq-icon-background" data-size="xs" aria-hidden="true">
  <span class="nq-icon" data-icon="checkmark-circle-02"></span>
</span>
```

Background circles are optional decoration, not a universal green icon treatment
or a new interactive control. For a meaningful standalone icon, put an accessible
name and appropriate image semantics on the outer wrapper; decorative examples
are hidden. `data-size` on `.nq-icon` selects the artwork size independently of
the target or background circle. The public `--nq-icon-size` override wins over
context defaults. Original Nasaq themes retain 24px default artwork, with small
compact artwork constrained to fit its target; custom roles and forced colors
remain supported. Standalone icons continue to inherit text color; the green size recipe sets
its wrapper color to the semantic success role. No global icon recoloring is
introduced. SVG stroke geometry and opt-in directional mirroring are unchanged.

The guide displays all sizes/shapes, selected, disabled and loading states,
background-circle sizes and standalone artwork sizes. Native project examples
include actual imports and one unsized projected SVG to exercise the wrapper
layout. Demonstration actions update local state; catalog icons no longer open
the guide's search or change the guide theme.

## Validation

Twelve focused React/Vue/Angular tests cover external-form submission, native
ARIA relationships, default appearance, public focus, disabled/loading activation
protection, restoration, nullable disclosure state and explicit empty form ownership. Together with existing adapter expansion tests,
44 tests pass. The browser suite checks centered/square geometry across all
three densities, projected SVG sizing, shapes, selected/disabled colors,
custom sizing, native toggle actions, background sizes, RTL/LTR, narrow layouts,
themes, forced colors, reduced motion and scoped axe results. Existing attached
ButtonGroup cases guard against wrapper/corner/seam regressions.

All five final icon Chromium cases pass, and the rendered Angular/mobile RTL
layouts were inspected. Five existing segmented/attached-group browser cases
and six calendar/date-input cases also pass, including filled six-week grids,
stable popup geometry, custom-only popup handling and ISO values. Package,
guide and framework-example builds pass. Clean tarball consumers pass ESM,
SSR, Angular APF, CSS export, declaration and bundle-budget checks.

Final consumer validation includes all 30 React recipes passing TypeScript,
all 30 Angular recipes passing strict template checking, and all seven exported
framework/language projects building. The guide also builds with the `/nasaq/`
deployment base. The final Angular preview was rerun after nullable disclosure
and empty-form association fixes. These are scoped checks, not certification.
