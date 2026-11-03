# @nasaq/styles

Framework-neutral presentation for Nasaq. The same styles serve semantic vanilla
HTML and the React, Angular, and Vue adapters. Every component is opt-in; no global
application reset or external font fetch occurs in the component stylesheet.

```ts
import '@nasaq/styles/styles.css';
// Optional, for a new application whose base styling you own:
import '@nasaq/styles/reset.css';
```

The stylesheet imports `@nasaq/tokens/tokens.css`; a bundler must resolve the bare
package import. For direct browser use, bundle once or rewrite that import to your
self-hosted token stylesheet. CSS custom properties provide theming without a
framework, utility-class compiler, or CSS-in-JS runtime.

```html
<main lang="ar" dir="rtl" data-nq-theme="dga" data-nq-mode="light">
  <div class="nq-field">
    <label class="nq-label" for="request-name">اسم الطلب</label>
    <input class="nq-input" id="request-name" aria-describedby="name-hint">
    <p class="nq-hint" id="name-hint">اسم واضح يساعدك على متابعة الطلب.</p>
  </div>
  <button class="nq-button" type="submit">متابعة الطلب</button>
</main>
```

## Stable class and state API

| Family | Classes and attributes |
| --- | --- |
| Actions | `nq-button`; `data-variant="primary|default|secondary|outline|outline-white|light|danger|ghost|soft|link"`; `data-size="sm|md|lg"`; `data-icon-only` |
| Icons | `nq-icon-button`; `data-shape="square|circle"`; `nq-icon-background` with `data-size="xs|md|xl"` |
| Forms | `nq-field`, `nq-label`, `nq-input`, `nq-textarea`, `nq-select`, `nq-hint`, `nq-error`; `aria-invalid="true"` |
| Choices | `nq-choice` on a label; `nq-checkbox`, `nq-radio`, `nq-switch` on native inputs |
| Tabs | `nq-tabs`, `nq-tab-list`, `nq-tab`, `nq-tab-panel`; `aria-selected`; optional vertical `aria-orientation` |
| Dialog | `nq-dialog` on native `dialog`; `nq-dialog-header`, `nq-dialog-body`, `nq-dialog-footer` |
| Combobox | `nq-combobox`, `nq-input`, `nq-listbox`, `nq-option`; `data-active` for keyboard focus, `aria-selected` for committed selection |
| Surfaces | `nq-card`, `nq-card-header`, `nq-card-body`, `nq-card-footer` |
| Feedback | `nq-badge` and `nq-alert`; `data-tone="neutral|success|warning|danger|info"` (neutral is badge default); badges support `data-variant="soft|outline|dot"` and `nq-badges` wrapping groups; [source notes](../../docs/nic-badges.md) |
| Data | `nq-table-wrap`, `nq-table`, `nq-pagination`, `nq-breadcrumb`; native table semantics, `aria-current="page"`; `data-numeric` on numeric cells |
| Disclosure | `nq-accordion`; `nq-accordion-item` on `details`; `nq-accordion-trigger` on `summary`; optional `nq-accordion-content` |
| Status | `nq-progress`, `nq-skeleton`, `nq-spinner`, `nq-avatar`, `nq-divider` |
| Avatar options | `nq-avatar`; `data-size="40|64|80|120|sm|md|lg|xl"`, `data-variant="circle|square"`; [geometry and theme notes](../../docs/nic-avatars.md) |
| Workflow | `nq-toolbar`, `nq-chip`, `nq-empty`, `nq-stepper`, `nq-step`, `nq-timeline`, `nq-upload`, `nq-tooltip` |
| Layout | `nq-stack`, `nq-cluster`, `nq-container`, `nq-sr-only` |

Defaults are primary/medium buttons, comfortable density, light mode, and the
DGA reference theme. Select `data-nq-theme="nasaq"` for the original palette. Use `data-nq-density="compact"` to reduce control and
table spacing. Compact and small controls may require additional hit-area spacing
for touch-heavy applications. Step states are `active`, `complete` (or `completed`),
and `error`; current steps should also use `aria-current="step"`. Steps include a
CSS counter circle, so their content should contain the label without another
visible number. Timelines style direct list items. Upload supports
`data-state="dragging|error"`; drop behavior belongs to application code.

`nq-stack` and `nq-cluster` accept the scoped `--nq-gap` property. This is a
layout customization hook, not a global design token. Components otherwise use
the semantic `--nq-*` variables documented by `@nasaq/tokens`.

## Semantics and behavior

Use genuine disabled controls where possible. An `aria-disabled` attribute changes
presentation and communicates state but does not suppress click behavior by itself.
Keep inactive panels and closed tooltips/listboxes `hidden`; component display
rules preserve that attribute. The stylesheet does not assign roles, manage focus,
trap dialogs, announce errors, or implement keyboard navigation. Use native HTML
and Nasaq adapters for those responsibilities.

Native `select`, `checkbox`, and `radio` preserve platform behavior. Labels and
messages must be associated in markup. Native progress needs a label; loading
spinners and skeletons need suitable surrounding loading announcements. A tooltip
must supplement an accessible control name. Its wrapper uses `data-nq="tooltip"`
and must have room for the positioned tooltip; adapters do not promise collision
avoidance. Make horizontally overflowing table wrappers keyboard focusable with an
accessible label when scrolling is needed.

All layout uses logical inline/block properties. Focus rings remain visible in
both directions. Reduced-motion preferences remove animation and transitions;
forced-colors mode preserves visible controls and selection boundaries. The
package styles target WCAG-oriented use, but CSS alone cannot certify an application.

New visual recipes should use existing semantic tokens, retain native semantics,
respect hidden/disabled/invalid states, and be checked in Arabic/English,
RTL/LTR, light/dark, both densities, keyboard and forced-colors modes. The reset
stays a separate opt-in entry point.

## Self-contained branding assets

The package also exports the Arabic-only outlined logo and transparent loaders:

```ts
import wordmark from '@nasaq/styles/assets/nasaq-wordmark.svg';
import loader from '@nasaq/styles/assets/nasaq-loader.gif';
import whiteLoader from '@nasaq/styles/assets/nasaq-loader-white.gif';
```

Asset imports depend on the application's bundler; vanilla projects can copy the
files into their public directory. Use the static SVG in a `<picture>` source
with `media="(prefers-reduced-motion: reduce)"`, give the decorative image empty
alt text, and provide separate localized `role="status"` loading text. 256px GIF
variants use `nasaq-loader-256.gif` and `nasaq-loader-white-256.gif`. Font outlines
are embedded in the SVG; Aref Ruqaa is not a runtime dependency or a font request.

## Curated interface icons

The shared stylesheet includes 17 self-hosted Hugeicons Stroke Rounded icons.
They work in vanilla, React, Vue and Angular without a renderer dependency; each
framework owns the ordinary `span` it renders. In React use `className` in place
of `class` in this example:

```html
<button type="button" class="nq-button nq-icon-button" data-variant="ghost" aria-label="بحث">
  <span class="nq-icon" data-icon="search-01" aria-hidden="true"></span>
</button>
<a href="/next">
  التالي
  <span class="nq-icon" data-icon="arrow-right-01"
        data-directional="true" aria-hidden="true"></span>
</a>
```

Available `data-icon` names: `search-01`, `menu-01`, `cancel-01`, `arrow-left-01`, `arrow-right-01`, `arrow-down-01`, `filter-horizontal`, `sorting-05`, `home-01`, `checkmark-circle-02`, `view`, `view-off-slash`, `calendar-03`, `thumbs-up`, `thumbs-down`, `link-04`, `lock-password`. The CSS alpha mask uses `currentColor` and defaults to
`1.5rem` (24px at the usual root size). Set the scoped `--nq-icon-size` variable
to change rendered size; icon size does not establish an accessible touch target.
Provide a visible label or an accessible name on the containing control; these
decorative spans must remain `aria-hidden="true"`.

Icon buttons center 20px artwork (16px for small) in DGA themes, including SVGs
inside framework wrappers. Target dimensions follow the selected density;
`--nq-icon-size` still overrides the artwork. Use `data-shape="circle"` for a round
action. Background icons are noninteractive decoration: `.nq-icon-background`
uses 48px circles; `data-size="xs"` uses 30px and `xl` remains 48px as in the source.
Set `data-size="sm|md|lg|xl|2xl"` on `.nq-icon` for 14/20/24/30/48px artwork.
Keep the wrapper hidden for decoration or give it meaningful image semantics.

Only left/right arrows with `data-directional="true"` mirror in RTL. Use this for
semantic forward/back navigation, not physical direction. Other glyphs keep their
orientation. Do not apply mirroring to logos, flags, text alignment, or media
controls by default. Forced-colors mode retains a system-colored mask.

SVG files are unchanged from a pinned commit of the official MIT-licensed
[Hugeicons repository](https://github.com/hugeicons/hugeicons). The original ten names map to
the supplied DGA Figma Stroke components; these are **not direct Figma exports**.
Additional icons do not imply new Figma geometry comparisons; per-icon evidence
is recorded in provenance. Mapping does not assert pixel parity. The package includes the full MIT
notice and per-icon hashes/node IDs in `assets/icons/LICENSE` and
`assets/icons/provenance.json`. The guide also ships these notices. Solid, custom,
and brand assets from the supplied Figma catalog are not part of this subset.

Direct asset imports are available through the existing asset export:

```ts
import searchIcon from '@nasaq/styles/assets/icons/search-01.svg';
```

## DGA reference compositions

The stylesheet includes the mapped DGA profile, input state transitions and portal
compositions. `nq-service-container` provides the 1280px content region;
`nq-service-layout` composes `nq-service-main` and `nq-service-aside` with a 32px gap.
`nq-form-layout` supports a desktop progress column and a single-column mobile
flow. `nq-stepper-responsive` groups the desktop list with a mobile summary;
`nq-stepper-ring` uses `--nq-step-progress` for its decorative progress ring.
Provide an accessible current/total label alongside that ring.

Keep source order meaningful: progress summary, form, then contextual guidance.
Portal headers/footers retain their public `nq-portal-*` classes. The adapters
provide responsive disclosure behavior; vanilla uses `createPortalHeader` or
`enhance`. Template content, validation and integrations remain application responsibilities.
The Figma-derived examples are available in the guide's template gallery.

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

### Component motion

DGA/custom switches use `--nq-duration-switch: 200ms` and ease-in-out for both
track (`--nq-ease-switch-track`) and thumb (`--nq-ease-switch`). Spinners use
`--nq-duration-spinner: 1000ms` for a linear full rotation. Nasaq keeps its original
180 ms switch and 700 ms spinner defaults. Override these roles independently
of generic durations. Reduced-motion preferences stop button/switch/field
transitions and loading animations while preserving state and focus behavior.
The reference JSON records source nodes and the four-segment spinner mapping;
these values do not establish universal DGA motion or visual parity.

The NIC accordion profile uses 150 ms hover/focus color transitions and the
separate `--nq-duration-accordion-indicator: 200ms` chevron role. Disclosure
height retains `--nq-duration-accordion: 300ms`. Original Nasaq remains immediate.
`--nq-color-accordion-border` and `--nq-color-accordion-focus` support scoped
color overrides; source geometry and accessibility adaptations are documented
in `docs/nic-accordion.md`.


### Table profile

`.nq-table` inside `.nq-table-wrap` uses NIC-informed 48px minimum cells,
8px/16px padding and an 8px outer radius in the DGA/custom profile.
`data-variant="striped|bordered"` and `data-size="sm|lg"` remain explicit
Nasaq extensions. Use `.nq-table-heading` only for the optional 12px/18px
medium-weight heading composition. `--nq-color-table-row-hover` and
`--nq-color-table-row-hover-odd` are themeable semantic colors. Native table
markup needs captions, scoped headers and a named focusable overflow wrapper;
CSS does not add these semantics or selection behavior. See
[table evidence](../../docs/nic-tables.md).

For vanilla sorting, place `<span class="nq-table-sort-icon" aria-hidden="true"></span>`
inside the header button. Its decorative indicator follows `aria-sort` on the
native `th`; the controller supplies that semantic state.
