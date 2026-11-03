# NIC accordion alignment

Source: the hashed `global.css` snapshot in [NIC reference](nic-web-reference.md),
lines 1677–1766. The stylesheet defines nested `.accordion-header` and
`.accordion-button` boxes; Nasaq retains semantic `details`/`summary` owned by
each adapter. No source script or icon font is embedded.

| Source requirement | Implementation | Evidence / confidence |
| --- | --- | --- |
| Item border `#dee2e6`; first top corners 6px (1677–1686) | `--nq-color-accordion-border`; DGA group corners 6px and shared 1px separators | Literal CSS; high. The group owns the outer border rather than duplicating item edges. |
| Header padding 16px plus transparent 2px border (1688–1693) | 18px item inset around the summary | Derived equivalent box geometry; high for the described nested header/button markup. |
| Trigger padding 12px/16px, weight 600, 16px/24px type (1736–1739) | Same summary content metrics; a single-line header totals 84px including the outer inset | Literal CSS plus box arithmetic; wrapping stays intrinsic. |
| Body padding 16px (1708–1710) | Content extends back through the item inset with its own 16px padding | Equivalent body alignment without changing adapter DOM. |
| Hover Neutral 100; focus Neutral 200; 150ms ease-in-out (1695–1734) | Shared semantic hover surface and `--nq-color-accordion-focus`; separate color transition | Literal source light values; high. No independent pressed state is specified. |
| 18px down indicator, 1px optical offset, -180-degree rotation, 200ms ease-in-out (1740–1766) | Existing licensed SVG; `--nq-duration-accordion-indicator: 200ms`; native fallback also gets the chevron | Source geometry/timing; SVG substitution is explicit. |

The 300ms **height** transition remains separately backed by Mobile Components
nodes `1147:62359` / `1147:60867`; the supplied NIC accordion CSS does not define
the disclosure body's animation duration. See [motion contract](accordion-motion.md).
The source's 56px Figma example header is not used as a fixed height for this
later NIC web composition.

## Preserved adaptations

- Keyboard focus retains a visible 2px outline; the source clears outlines.
- Dark mode uses a semantic border and `#384250` focus surface instead of fixed
  light-mode primitives. Text/focus contrast is checked against those surfaces.
- Original Nasaq retains its padding, radius and immediate motion; nested
  original/custom themes reset or inherit the profile explicitly. New semantic
  roles can be overridden through the normal theme API.
- Reduced motion disables both indicator and surface transitions and settles
  height animation immediately. Forced colors retains system focus and icons.
- Native details remain usable without JavaScript. Enhanced disclosure keeps
  logical state, focus return, exclusive groups and adapter-owned DOM.

The source mapping establishes CSS requirements, not official visual parity or
certification. Browser checks and rendered observations are recorded separately
in [validation](validation.md). Hajj remains excluded.

A local browser fixture loaded the actual hashed stylesheet with a minimal
box-sizing and zero-heading-margin baseline. At 1440px and 390px it computed
16px header padding, 2px header borders, 12px/16px button padding, 16px body
padding and an 84px single-line header. This verifies the box arithmetic for
that markup; it is not a screenshot comparison against the complete official
site or a verification of its externally loaded fonts/plugins.
