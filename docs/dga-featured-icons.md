# Featured icon composition

Checklist rows 20–24 distinguish ordinary icons from Featured icons. The local
`Home Page Template - Platforms Code (Community).fig` export in the
[source inventory](dga-source-inventory.md) contains local-canvas Featured instances at 32px (`62:45914`)
and 56px (`4:43065`, `4:43082`). Its imported-reference set `4:11316`, version
`641:1395`, defines the following geometry. It is imported library evidence,
not a supplied standalone web component library.

| Size | Container | Artwork | Light/dark square radius | Outline square radius | Light Brand node |
| --- | --- | --- | --- | --- | --- |
| sm | 32px | 16px | 4px | 6px | 4:11413 |
| md | 40px | 20px | 4px | 8px | 4:11415 |
| lg | 48px | 24px | 8px | 10px | 4:11417 |
| xl | 56px | 28px | 8px | 12px | 4:11419 |

The set contains Brand, Gray, Error, Warning, Success and Info roles, Light,
Outline and Dark treatments, and circular/square variants. The outline uses a
1px inside stroke. The composition is now available through the existing
`.nq-icon-background` class with `data-variant="featured"`. Use `data-size`,
`data-shape="square"`, `data-tone="brand|neutral|error|warning|success|info"`
and `data-style="light|outline|dark"`. Omitted values are md, circle, brand and
light. All four adapters own this ordinary markup through their normal slots.

```html
<p>
  <span class="nq-icon-background" data-variant="featured" data-size="lg"
        data-tone="success" aria-hidden="true">
    <span class="nq-icon" data-icon="checkmark-circle-02"></span>
  </span>
  تم حفظ البيانات بنجاح
</p>
```

Keep status text visible beside a decorative icon. For an independently meaningful
image, give the outer element an accessible name and image role instead.
The guide limits standalone artwork samples to 14/20/24px. Its larger artwork
example is the 28px glyph inside the Featured 56px container. The existing larger
artwork sizing APIs remain configurable for application-specific compositions.

The NIC `.icon-bg` helpers are a separate source convention measuring 30/48/48px.
Existing `.nq-icon-background` markup without the featured variant preserves that
contract. A Featured xl container now reserves the correct 56px rather than
enlarging a glyph inside the NIC 48px background.

Colors follow Nasaq's semantic roles. This is explicit normalization of a mixed
source version. The imported Brand Dark fill resolves to #079455, while the
current approved NIC primary is #1B8354. Gray Light in the imported set resolves
to #F9FAFB, while the shared muted surface is #F3F4F6. Brand/neutral are for
general content. Error/warning/success/info examples represent status meanings.
The cached Dark status fills (#D92D20, #DC6803, #079455 and #1570EF) also differ
from the package's stronger semantic foreground roles used as filled surfaces.
These color differences remain intentional and keep the checklist's exact-color
equivalence assessment open.
Dark-mode colors and custom theme overrides follow the same semantic roles.

The examples retain independently licensed shipped artwork and simple textual
warning/information symbols. They do not establish official artwork equivalence.
Native Figma rendering was unavailable. Browser checks compare measured geometry
to decoded values, separately from artwork. This establishes rendered geometry
coverage and does not establish full visual parity with a native Figma render.

Seven Chromium scenarios passed for the Arabic/English gallery, vanilla
JavaScript/TypeScript projects and React, Vue and Angular typed projects. They
measure all four container/artwork sizes, centering, square/outline radii and
the six roles in all three treatments. Existing icon-button behavior, density,
mobile containment, forced colors and gallery accessibility checks also passed.
The rendered RTL example was inspected visually with all 22 Featured samples
visible. The first two attempts exposed test setup errors (readiness timeout
and vanilla's `#app` root); the complete final run passed without source changes.
