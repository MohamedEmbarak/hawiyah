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
| Actions | `nq-button`; `data-variant="primary|secondary|ghost|danger"`; `data-size="sm|md|lg"`; `data-icon-only` |
| Forms | `nq-field`, `nq-label`, `nq-input`, `nq-textarea`, `nq-select`, `nq-hint`, `nq-error`; `aria-invalid="true"` |
| Choices | `nq-choice` on a label; `nq-checkbox`, `nq-radio`, `nq-switch` on native inputs |
| Tabs | `nq-tabs`, `nq-tab-list`, `nq-tab`, `nq-tab-panel`; `aria-selected`; optional vertical `aria-orientation` |
| Dialog | `nq-dialog` on native `dialog`; `nq-dialog-header`, `nq-dialog-body`, `nq-dialog-footer` |
| Combobox | `nq-combobox`, `nq-input`, `nq-listbox`, `nq-option`; `data-active` for keyboard focus, `aria-selected` for committed selection |
| Surfaces | `nq-card`, `nq-card-header`, `nq-card-body`, `nq-card-footer` |
| Feedback | `nq-badge` and `nq-alert`; `data-tone="neutral|success|warning|danger|info"` (neutral is badge default) |
| Data | `nq-table-wrap`, `nq-table`, `nq-pagination`, `nq-breadcrumb`; native table semantics, `aria-current="page"`; `data-numeric` on numeric cells |
| Disclosure | `nq-accordion`; `nq-accordion-item` on `details`; `nq-accordion-trigger` on `summary`; optional `nq-accordion-content` |
| Status | `nq-progress`, `nq-skeleton`, `nq-spinner`, `nq-avatar`, `nq-divider` |
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

## DGA reference compositions

The stylesheet includes the mapped DGA profile, input state transitions and portal
compositions. `nq-service-container` provides the 1280px content region;
`nq-service-layout` composes `nq-service-main` and `nq-service-aside` with a 32px gap.
`nq-form-layout` supports a desktop progress column and a single-column mobile
flow. `nq-stepper-responsive` groups the desktop list with a mobile summary;
`nq-stepper-ring` uses `--nq-step-progress` for its decorative progress ring.
Provide an accessible current/total label alongside that ring.

Keep source order meaningful: progress summary, form, then contextual guidance.
Portal headers/footers retain their public `nq-portal-*` classes. Template content,
menu behavior, validation and integrations remain application responsibilities.
The Figma-derived examples are available in the guide's template gallery.
