# @nasaq/tokens

Semantic tokens for Nasaq. The default DGA profile maps to the supplied Platforms
Code Foundations snapshot, with primary green `#1B8354`, explicit light/dark
semantic colors, and IBM Plex Sans Arabic. This package does not fetch fonts.
The original Woven Rhythm palette remains opt-in with `theme: 'nasaq'`.

```ts
import { tokens, tokenNames, createThemeVariables } from '@nasaq/tokens';
import type { TokenName, TokenPath, Theme, ColorMode, Density } from '@nasaq/tokens';
import '@nasaq/tokens/tokens.css';

tokens.color.primary;      // '#1B8354'
tokenNames.color.primary;  // '--nq-color-primary'

const agencyVariables = createThemeVariables({
  '--nq-color-primary': '#1754a6',
  '--nq-color-primary-hover': '#12458b',
  '--nq-color-on-primary': '#ffffff',
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
<main data-nq-theme="dga" data-nq-mode="light" data-nq-density="comfortable"
      lang="ar" dir="rtl">
  <!-- Components -->
</main>
```

Theme (`nasaq | dga | custom`), mode (`light | dark`), and density
(`comfortable | compact`) can each be scoped to a subtree. Locale and direction
remain independent native HTML attributes. The CSS does not automatically follow
system dark mode: applications choose and persist the mode explicitly.

Nested themes and modes use CSS `light-dark()` and `color-scheme`, supported by
Chrome/Edge 123+, Firefox 120+, and Safari 17.5+. Older browsers receive light and
explicit dark fallbacks but do not support every nested combination. Internal
`--nq-palette-*` variables are implementation details. Override the public
`--nq-color-*` variables on a custom theme boundary:

```css
.agency-theme {
  --nq-color-primary: #1754a6;
  --nq-color-primary-hover: #12458b;
  --nq-color-primary-active: #103c78;
  --nq-color-primary-subtle: #eaf2ff;
  --nq-color-primary-text: #134585;
  --nq-color-on-primary: #fff;
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
pnpm --filter @nasaq/tokens generate
```

Do not edit generated output by hand. The root build regenerates and copies CSS
into the built package. Public tokens are an API: changes should include migration
notes when names or meanings change.

## DGA reference boundary

The mapping is recorded in [reference/dga-foundations.json](reference/dga-foundations.json),
including snapshot hash, export date, source node IDs and explicit adaptations.
An export date is not an official release number. The mapping is independently
implemented and is not a certification or complete component-parity claim.

`theme: 'nasaq'` preserves the original palette and foundation metrics. Shared
control densities use the reference sizes in both profiles: comfortable defaults
to 40px (`sm`:32px, `lg`:40px), compact to 32px (`sm`:24px, `lg`:40px). Existing
`lg` is retained as an alias for the reference large size. Custom profiles inherit
DGA; callers who need the old palette should explicitly select `nasaq`.

The shared light subtle-text role uses Neutral/600 so text remains readable on
muted surfaces. Field placeholders retain a separate reference role. Actual input
boundaries use the stronger control-border for contrast; the original field-border
value remains traceable. Review all application content and custom overrides
against the applicable requirements before making a deployment compliance claim.

This Apache-2.0 public 0.1 source preview is available through the workspace.
Packages remain marked private to prevent accidental npm publication; no npm
release is available yet.
