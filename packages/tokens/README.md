# @hawiyah/tokens

Semantic tokens for Hawiyah. The default DGA profile maps to the supplied Platforms
Code Foundations snapshot, with primary green `#1B8354`, explicit light/dark
semantic colors, and IBM Plex Sans Arabic. This package does not fetch fonts.
The original Signature palette remains opt-in with `theme: 'hawiyah'`.

```ts
import { tokens, tokenNames, createThemeVariables } from '@hawiyah/tokens';
import type { TokenName, TokenPath, Theme, ColorMode, Density } from '@hawiyah/tokens';
import '@hawiyah/tokens/tokens.css';

tokens.color.primary;      // '#1B8354'
tokenNames.color.primary;  // '--hw-color-primary'

const agencyVariables = createThemeVariables({
  '--hw-color-primary': '#1754a6',
  '--hw-color-primary-hover': '#12458b',
  '--hw-color-on-primary': '#ffffff',
}, { theme: 'custom', mode: 'light', density: 'comfortable' });
```

`createThemeVariables(overrides?, options?)` returns a complete plain object of
all public CSS variables listed by `cssVariableNames`. It has no DOM dependency and is safe during SSR.
Unknown object keys are ignored. Options default to DGA, light, comfortable;
`custom` starts from the DGA profile. Consumers must provide accessible companion colors
when changing a brand. `themes`, `densities`, and `cssVariableNames` are also
exported as immutable typed data. `TokenPath` uses dotted paths such as
`color.primary`; `TokenName` uses complete CSS names.

```html
<main data-hw-theme="dga" data-hw-mode="light" data-hw-density="comfortable"
      lang="ar" dir="rtl">
  <!-- Components -->
</main>
```

Theme (`hawiyah | dga | custom`), mode (`light | dark`), and density
(`comfortable | compact | mobile`) can each be scoped to a subtree. Locale and direction
remain independent native HTML attributes. The CSS does not automatically follow
system dark mode: applications choose and persist the mode explicitly.

Nested themes and modes use CSS `light-dark()` and `color-scheme`, supported by
Chrome/Edge 123+, Firefox 120+, and Safari 17.5+. Older browsers receive light and
explicit dark fallbacks but do not support every nested combination. Internal
`--hw-palette-*` variables are implementation details. Override the public
`--hw-color-*` variables on a custom theme boundary:

```css
.agency-theme {
  --hw-color-primary: #1754a6;
  --hw-color-primary-hover: #12458b;
  --hw-color-primary-active: #103c78;
  --hw-color-primary-subtle: #eaf2ff;
  --hw-color-primary-text: #134585;
  --hw-color-on-primary: #fff;
}
```

The default `:where()` selectors have zero specificity. Consumer classes and
ordinary attribute selectors can override them without `!important`.

## Token groups

| Group | Purpose |
| --- | --- |
| `color` | Surfaces, text, boundaries, brand, semantic feedback, focus, disabled and inverse roles |
| `font`, `text`, `weight`, `leading` | Arabic-aware font stack, type scale, font weights and line heights |
| `space`, `radius`, `shadow` | Spacing scale, corners and elevation |
| `control`, `density` | Control heights, inline padding, layout gap and table cell density |
| `duration`, `ease` | Motion timing; component CSS respects reduced motion |
| `focus`, `z`, `content` | Focus ring, stacking levels and content width |

## Source and generation

`tokens.json` is the source of truth. It uses DTCG-inspired `$type`, `$value`,
`$description`, and `$extensions` fields. CSS-oriented string values (such as
shadows and dimensions) mean this is **not a claim of full DTCG 2025.10
conformance**. Regenerate `src/generated.ts` and `src/tokens.css` with:

```sh
pnpm --filter @hawiyah/tokens generate
```

Do not edit generated output by hand. The root build regenerates and copies CSS
into the built package. Public tokens are an API: changes should include migration
notes when names or meanings change.

## DGA reference boundary

The mapping is recorded in [reference/dga-foundations.json](reference/dga-foundations.json),
including snapshot hash, export date, source node IDs and explicit adaptations.
An export date is not an official release number. The mapping is independently
implemented and is not a certification or complete component-parity claim.

`theme: 'hawiyah'` preserves the original palette and foundation metrics. Shared
control densities use the reference sizes in both profiles: comfortable defaults
to 40px (`sm`:32px, `lg`:40px), compact to 32px (`sm`:24px, `lg`:40px). Existing
`lg` is retained as an alias for the reference large size. Custom profiles inherit
DGA; callers who need the old palette should explicitly select `hawiyah`.

The shared light subtle-text role uses Neutral/600 so text remains readable on
muted surfaces. Field placeholders retain a separate reference role. Actual input
boundaries use the stronger control-border for contrast; the original field-border
value remains traceable. Review all application content and custom overrides
against the applicable requirements before making a deployment compliance claim.

This Apache-2.0 package is published on npm as a pre-1.0 release, so a minor
version may still rename or revise tokens. Most applications receive it through
`@hawiyah/styles`; install it directly only when code imports the token values:
`npm install @hawiyah/tokens`.

### Opt-in mobile control sizing

Set `data-hw-density="mobile"` on an application or subtree, or pass
`{ density: 'mobile' }` to `createThemeVariables`. At a 16 px root size,
small/default/large buttons are 32/40/44 px. Single-line `.hw-input` and
`.hw-select` controls have a 44 px minimum across size variants, using the
additive `--hw-control-field-min-height` token. Existing control-height overrides
still apply when larger. Textareas remain multiline and grow independently.
Comfortable/compact scopes reset the field minimum, including inside mobile.
This is an explicit profile shared by all four adapters; viewport width does not
automatically select it. Hawiyah/custom palettes, corners and dark mode remain
application choices; this does not establish source mobile dark-mode parity.

Source: supplied Mobile Components input set `3149:54894`, body `11167:15771`
(320 × 44, radius 4); button nodes `407:510377`, `407:510548`, `407:510617`
(large/medium/small: 44/40/32). These are decoded dimensions. A single source
input size informs a shared minimum, not a claim that every Hawiyah variant is an
exact source component. The source small button is not a blanket 44 px touch
target; applications must still evaluate target spacing and interaction needs.

### Component motion

DGA/custom switches use `--hw-duration-switch: 200ms` and ease-in-out for both
track (`--hw-ease-switch-track`) and thumb (`--hw-ease-switch`). Spinners use
`--hw-duration-spinner: 1000ms` for a linear full rotation. Hawiyah keeps its original
180 ms switch and 700 ms spinner defaults. Override these roles independently
of generic durations. Reduced-motion preferences stop button/switch/field
transitions and loading animations while preserving state and focus behavior.
The reference JSON records source nodes and the four-segment spinner mapping;
these values do not establish universal DGA motion or visual parity.
