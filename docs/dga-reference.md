# DGA foundation reference and migration

The [NIC web UI reference](nic-web-reference.md), supplied on 2026-11-02,
adds the user's approved CSS and behavior source as the primary reference for
directly mapped web-component requirements. Its inventory and coverage queue
track implementation separately. The Figma evidence below remains the
foundation and mobile/template reference; it is not silently reclassified as
evidence for the newer web-source mappings.

Nasaq uses a DGA-based foundation by default, with `data-nq-theme="dga"` as the explicit selector. The original teal and ivory Woven Rhythm theme remains available through `data-nq-theme="nasaq"`. Both use the same `nq-` component classes, `--nq-` variables, native framework adapters, and interaction contracts.

The reference is a set of supplied **Platforms Code Community Figma exports dated 2026-10-29**. That is a snapshot/export date, **not an official DGA release number**, and it does not establish that these files are the latest official guidance. Nasaq is an independent implementation; source correspondence does not mean official endorsement, certification, or complete DGA compliance. See [the alignment record](alignment.md) for the distinction between requirements, recommendations, and Nasaq choices.

## What was inspected

All **23 supplied local files** have now been decoded, including the six that exceeded the earlier remote environment's 32 MiB transfer limit. The [source inventory](dga-source-inventory.md) records filenames, byte sizes, hashes, export timestamps and serialization versions. The [audit follow-up](dga-audit-followup.md) separates decoded evidence, limited native Figma observations, implementation work and remaining gaps. This is not an exhaustive visual comparison or prototype playback audit.

- Foundations; Service Page; Form; Life Journeys; Contact Us; Feedback Section; Help & Support; FAQ; Site Map; Page Not Found; Rating Section; Chatbot; Content Page; Cookies Banner; e-Participation; About The Entity; Saudi National Day.
- The six previously transfer-blocked files were decoded locally: Icons, Saudi Founding Day, Home Page Template, Hajj Template, Mobile Components and Search Page Template. **Hajj is application-specific and excluded from Nasaq implementation scope and backlog**; its inclusion in the inventory records supplied material only.
- No standalone web Components Library was supplied. Components embedded in templates do not establish exhaustive official component coverage. Nasaq's 81-entry catalog is its own implementation inventory.

The decoded Foundations file contains **784 resolved active local variables** across Containers, Primitives, Radius, Themes, Widths, Spacing, and Typography. All **40 selected variables** in the public reference match the decoded node/mode/value evidence. Imported component/library caches contain multiple versions. The local collections form the foundation reference; imported components require exact source identity and mode mapping before their styles can be treated as part of the same baseline.

Each archive's format was verified independently: 17 canvases use fig-kiwi serialization v101 and six use v106, with a raw-DEFLATE Kiwi schema and Zstandard message. These are serialization versions, not DGA library releases. All 23 schemas match; the decoded data includes 1,385,975 node-change records, including deleted records and caches, not that many public components. Across the files, 104 imported variable-mode values remain ambiguous; repeated cache references must not be counted as 104 independent component defects.

Mobile has 681 variable records without import markers, but only 38 active local variables after excluding soft-deleted definitions and collections. Its active local Theme supplies Light mode only; Foundations' Light/Dark modes do not establish mobile component dark-mode parity. Representative Mobile, Home and Search project copies were inspected in the native Figma renderer. Their names and node IDs correspond to the exports, but the project copies were not verified byte-for-byte against the hashed archives. These observations corroborate selected geometry and composition, not full visual parity or interaction playback.

## Identifying the supplied snapshots

Node IDs below are local to the named source file; they are not public Figma URLs. These hashes identify the reviewed exports without publishing the binary files or their embedded assets.

| Source file | Export timestamp, UTC | SHA-256 |
|---|---|---|
| Foundations - Platforms Code (Community) | 2026-10-29 08:02:57.448 | `bedf813b539f27a6c8f539fa02dfbd5dce05dca79ffa3d1fd6e06faea4c68917` |
| Service Page Template - Platforms Code (Community) | 2026-10-29 07:49:25.292 | `17daf93893e629524437107649f9283022b822c6b0cee4096f4a796f48d8eb12` |
| Form Template - Platforms Code (Community) | 2026-10-29 07:46:12.330 | `96159a5e074893dad21516f800b9becc903eaa190fb559e3fd08c6e12e2bb700` |

## Semantic values, including dark mode

Use a value according to its role. A primary text token, a link token, and a filled button token are separate source concepts; using one green for all three loses information. The dark theme is resolved from the supplied semantic modes rather than made by inverting the light palette.

| Foundations node | Source token | Light | Dark |
|---|---|---|---|
| `50:65` | `Colors/Primary-SA-Flag/600-primary` | `#1B8354` | Primitive; no separate mode |
| `122:19` | `Background/background-body` | `#F9FAFB` | `#111927` |
| `50:198` | `Background/background-white` | `#FFFFFF` | `#0D121C` |
| `53:392` | `Text/text-default` | `#161616` | `#FFFFFF` |
| `50:204` | `Text/text-primary` | `#1B8354` | `#54C08A` |
| `50:242` | `Link/link-primary` | `#1B8354` | `#1B8354` |
| `113:7` | `Form/field-background-default` | `#FFFFFF` | `#1F2A37` |
| `114:11` | `Form/field-border-default` | `#9DA4AE` | `#6C737F` |

These are source values, not a claim that every possible foreground/background pairing meets the accessibility target. An implementation may need an explicitly documented adaptation for its actual surface and state. Keep source correspondence and contrast results separate; do not silently relabel an adjusted value as the original.

The public [foundation reference](../packages/tokens/reference/dga-foundations.json) contains the selected variables and adaptations. Color entries in [tokens.json](../packages/tokens/tokens.json) carry source nodes/names in `$extensions.org.nasaq.dga`; [DGA component styles](../packages/styles/src/dga.css) record relevant template nodes. One deliberate adaptation uses Neutral 600 for shared subtle text in light mode because that role is also used on muted surfaces. The field-placeholder role retains its original semantic value. The source resting field-border token remains `#9DA4AE` in light mode; rendered input borders use the stronger control-border value `#6C737F` for contrast. DGA fields use an animated bottom line that uses a dark neutral while empty or not yet valid, turns green for nonempty valid values including prefilled values, and turns red after user-invalid editing or an explicit application error. There is no additional outer outline. This underline color is an intentional adaptation from the source’s neutral pressed-field color. Read-only fields, legacy-theme fields and forced-colors mode retain a single inset keyboard indicator. These are documented implementation adaptations, not unchanged source values.

Other source references:

- Containers `50:3`, `50:4`, and `50:5`: 1280 px desktop content maximum, 32 px desktop padding, and 16 px mobile padding.
- Radius `425:95`: `radius-md` is 8 px in Desktop, Tablet, and Mobile modes.
- Typography `4422:6` and `4422:7`: display and text families are IBM Plex Sans Arabic in all three modes. Nasaq's Latin fallback and font-loading policy remain explicit application choices; the Arabic wordmark remains outlined SVG.
- Service frames: English desktop `1:21371`, Arabic desktop `1:22148`, Arabic mobile `27:4851`.
- Form frames: English desktop `2:17277`, Arabic mobile `7:3658`.

The inspected service composition uses 832 px and 416 px columns with a 32 px gap inside a 1280 px content area. Reference frames are 1440 px and 430 px wide. Frame widths are examples, **not official CSS breakpoints**; the runtime must also reflow at narrow and intermediate widths.

## Applying the template guidance

The Service and Form instruction pages support the following implementation decisions. Preserve the distinction between a source instruction and the application's own behavior.

| Source guidance | Implementation implication |
|---|---|
| Detaching the navigation header or footer must preserve its original structure, colors, and fonts | Do not interpret general customization guidance as permission to restyle these areas while claiming exact reference fidelity |
| A second navigation header is optional and uses library foundations/design tokens | Include it when the information architecture needs it; avoid empty or duplicated navigation |
| Service descriptions are concise, steps are numbered, and the service card includes audience, duration, channels, cost, contact, and FAQ access | Supply real service content and clear actions; components do not invent business facts |
| Form instructions describe required-field information and numbered progress with step titles and descriptions | Keep required state, instructions, validation, and the current step understandable in both languages |
| The Form template describes a radial stepper for mobile/small screens | Present current progress, previous/next context, and a text equivalent; this does not establish a fixed breakpoint or animation duration |
| Feedback asks whether the page was useful, with Yes/No and optional specific reasons | Wire real feedback handling in the application; a visual confirmation is not a submitted backend record |
| Search suggestions update during typing; the clear action appears for nonempty input and is keyboard accessible | Implement actual search/application state and preserve keyboard operation |
| Page/platform modification dates communicate freshness | Display meaningful content-maintenance dates, not the current date on every render |
| A digital stamp depends on the platform domain/category; placing it at the top replaces the footer placement | Use only authorized identity and stamp data. A sample must not imply that the demo is an officially registered platform |

Some prototype actions have missing/sentinel destinations or no explicit timing. Such records do not justify inventing an “official” animation. Where Nasaq supplies interaction or motion, document it as implementation behavior and preserve keyboard and reduced-motion equivalents.

## Migrating an existing Nasaq application

1. Import the shared stylesheet as before. Choose `data-nq-theme="dga"` explicitly on the application root when that is the intended baseline; a fresh unthemed root now uses DGA defaults.
2. To retain the original palette and font/radius/spacing/content metrics, set `data-nq-theme="nasaq"` explicitly. Control density is shared across themes, so this does not preserve every legacy visual detail. Keep mode, density, language, and direction independent. Review an existing saved theme preference in the guide if its appearance differs from a fresh visit.
3. Audit application overrides of `--nq-*`, hard-coded colors, borders, radius, spacing, and container widths. `data-nq-theme="custom"` inherits the DGA foundation before application overrides. Custom styles are still application-owned; adopting the DGA default does not rewrite them.
4. Compare real screens in both modes and directions, including long labels, field validation, disabled/read-only states, focus, service metadata, and narrow/intermediate layouts. Preserve the existing component value/event contracts.
5. Record intended deviations with their source nodes, reason, affected scope, and evaluation. Component behavior, calendar ISO values, and the pinned Umm al-Qura provider remain independent of the visual theme.

Shared control height tokens now apply to both DGA and Nasaq themes. At the default 16 px root size:

| Density | Default size | Small (`sm`) | Large (`lg`) |
|---|---|---|---|
| `comfortable` | 40 px | 32 px | 40 px |
| `compact` | 32 px | 24 px | 40 px |

Review existing layouts and touch targets when adopting these sizes; a control height alone does not establish complete target-size compliance.

```html
<html lang="ar" dir="rtl" data-nq-theme="dga" data-nq-mode="light">
  <!-- Application content uses the shared nq- component contract. -->
</html>
```

The [token package](../packages/tokens/README.md) describes the current mapping and public variables. [Extension guidance](extension.md) explains safe customization. [Validation](validation.md) records checks actually run; the existence of this reference record is not a test result.

## Publication boundaries

Only the implementation, focused source references, and documented mappings belong in the public package/guide. The raw `.fig` inputs and bulk exported assets are research material, not package contents. Fonts, icons, official marks, and other assets require their own provenance and redistribution terms. Nasaq's Apache 2.0 license does not automatically relicense those materials.

Recheck the [official design portal](https://design.dga.gov.sa/) and applicable DGA requirements for a deployment. Keep snapshot identity, implementation scope, known gaps, and official recognition separate in any public compliance statement.

### Opt-in mobile control sizing

Set `data-nq-density="mobile"` on an application or subtree, or pass
`{ density: 'mobile' }` to `createThemeVariables`. At a 16 px root size,
small/default/large buttons are 32/40/44 px. Single-line `.nq-input` and
`.nq-select` controls have a 44 px minimum across size variants, using the
additive `--nq-control-field-min-height` token. Existing control-height overrides
still apply when larger. Textareas remain multiline and grow independently.
Comfortable/compact scopes reset the field minimum, including inside mobile.
This is an explicit profile shared by all four adapters; viewport width does not
automatically select it. Nasaq/custom palettes, corners and dark mode remain
application choices; this does not establish source mobile dark-mode parity.

Source: supplied Mobile Components input set `3149:54894`, body `11167:15771`
(320 × 44, radius 4); button nodes `407:510377`, `407:510548`, `407:510617`
(large/medium/small: 44/40/32). These are decoded dimensions. A single source
input size informs a shared minimum, not a claim that every Nasaq variant is an
exact source component. The source small button is not a blanket 44 px touch
target; applications must still evaluate target spacing and interaction needs.

## Component motion follow-up — 2026-11-01

The supplied Mobile Components export provides decoded motion properties, not
verified prototype playback. Motion roles are additive; generic duration tokens
and dialog/drawer behavior remain unchanged.

| Source node → destination | Evidence | Implementation / status | Confidence |
| --- | --- | --- | --- |
| Switch `5403:403606` → `5403:403570` | SMART_ANIMATE 200 ms, cubic-bezier(.42,0,.58,1); thumb x2→22 in a 52×32 track | DGA/custom switch track and thumb now use component-specific 200 ms ease-in-out. Existing web switch geometry is retained; timing correspondence does not establish shape parity | High, decoded timing |
| Spinner `5698:11137` → `11143` → `11149` → `11155` → `11137` | Four 250 ms linear quarter-turns; each follows a 1 ms timeout | DGA/custom CSS cycle is 1000 ms, omitting four prototype scheduling waits (1004 ms with waits). This is a documented web mapping, not a 250 ms full rotation | High for segments, explicit cycle mapping |
| Input `3149:55032` → `3149:55105`; underline `11167:15723` → `11167:15747` | 150 ms ease-out, centered 35%→100% expansion | Historical Figma measurement; NIC web now uses 500ms ease and 50%→100%. Validation colors remain an approved adaptation; see nic-inputs.md | High, decoded properties |
| Nasaq reduced-motion stylesheet | Zero-specificity rule lost to button/switch defaults; pseudo-element was inside the functional selector | Corrected explicit selectors stop button, switch track and switch thumb transitions. Existing loading/field suppression retained; state changes remain immediate | High, runtime regression |
| Tab Bar `8332:24202` → `8332:24242` → `8332:24282` | 300 ms ease-out; Normal hover goes to a variant named Pressed, then click to Selected | Not applied to generic tab panels; source naming/trigger mismatch retained as evidence caveat | High, narrow scope |
| Accordion `1147:62359` → `1147:60867` | 300 ms ease-in-out, 56→256 px example | Enhanced disclosure now uses measured intrinsic-height motion with native adapter lifecycles, immediate reduced-motion settlement and inert closing content; native unenhanced fallback remains immediate | High for this source edge only |
| Button-Close `2763:420142` → `2763:420174`; toast child `1730:37107` → `2763:420400` | 200 ms linear hover, destination variants in imported caches | Not applied to toast entry/exit or generic buttons. Most local button hover actions have no explicit timing | High for decoded actions; mixed-library caveat |

`--nq-duration-switch`, `--nq-ease-switch` (thumb),
`--nq-ease-switch-track`, and `--nq-duration-spinner` allow scoped overrides.
The original Nasaq theme explicitly retains 180 ms switch timing (standard thumb
easing, CSS ease for the track) and a 700 ms spinner cycle. Custom starts from
DGA. Reduced motion removes transitions/animations rather than delaying state
changes; it is an accessibility adaptation, not a property proven by Figma.
All four adapters use shared CSS and continue to own their DOM. Hajj is excluded.
