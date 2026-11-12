# @hawiyah/styles

Framework-neutral presentation for Hawiyah. The same styles serve semantic vanilla
HTML and the React, Angular, and Vue adapters. Every component is opt-in; no global
application reset or external font fetch occurs in the component stylesheet.

```ts
import '@hawiyah/styles/styles.css';
// Optional, for a new application whose base styling you own:
import '@hawiyah/styles/reset.css';
```

The published `styles.css` is one flat stylesheet: the build inlines the tokens
from `@hawiyah/tokens/tokens.css` and every component file in source order, so it
contains no `@import` and a page can link it directly, without a bundler. Fonts
and icons are referenced relative to the file, so serve the package's `dist`
directory as it is (for example, copy `dist/styles.css` together with
`dist/assets/`):

```html
<link rel="stylesheet" href="/vendor/hawiyah/styles.css">
<!-- Optional, only for a new application whose base styling you own: -->
<link rel="stylesheet" href="/vendor/hawiyah/reset.css">
```

`reset.css` remains a separate, opt-in file. The individual source files
(`components.css`, `extended.css`, `icons.css` and the others) still ship beside
the entry as `@hawiyah/styles/<file>.css` for existing references; they do not
include the tokens, so load `@hawiyah/tokens/tokens.css` first when using one on
its own. Do not combine them with `styles.css`, which already contains them.
CSS custom properties provide theming without a framework, utility-class
compiler, or CSS-in-JS runtime.

```html
<main lang="ar" dir="rtl" data-hw-theme="dga" data-hw-mode="light">
  <div class="hw-field">
    <label class="hw-label" for="request-name">اسم الطلب</label>
    <input class="hw-input" id="request-name" aria-describedby="name-hint">
    <p class="hw-hint" id="name-hint">اسم واضح يساعدك على متابعة الطلب.</p>
  </div>
  <button class="hw-button" type="submit">متابعة الطلب</button>
</main>
```

## Stable class and state API

| Family | Classes and attributes |
| --- | --- |
| Actions | `hw-button`; `data-variant="primary|default|secondary|outline|outline-white|light|danger|ghost|soft|link"`; `data-size="sm|md|lg"`; `data-icon-only` |
| Icons | `hw-icon-button`; `data-shape="square|circle"`; `hw-icon-background` with `data-size="xs|md|xl"` |
| Forms | `hw-field`, `hw-label`, `hw-input`, `hw-textarea`, `hw-select`, `hw-hint`, `hw-error`; `aria-invalid="true"` |
| Search | `hw-search-field`, `hw-search-control`, `hw-search-clear`, `hw-search-suggestions`, `hw-search-option`, `hw-search-submit`; composition: `hw-search-form`, `hw-search-terms`, `hw-search-term`, `hw-search-advanced`; active option uses `aria-selected="true"` |
| Choices | `hw-choice` on a label; `hw-checkbox`, `hw-radio`, `hw-switch` on native inputs |
| Tabs | `hw-tabs`, `hw-tab-list`, `hw-tab`, `hw-tab-panel`; `aria-selected`; optional vertical `aria-orientation` |
| Tab overflow | `hw-tab-bar`, `hw-tabs-overflow` (`details`), `hw-tab-overflow-trigger` (`summary`), `hw-tab-overflow-menu`, `hw-tab-overflow-item`; controller-owned `data-hw-overflow-hidden`; [source and keyboard notes](../../docs/nic-tabs.md) |
| Content navigation | `hw-content-nav`, `hw-content-nav-heading`, `hw-content-nav-list`, `hw-content-nav-sublist`, `hw-content-nav-link`, `hw-content-nav-marker`, `hw-content-nav-label`; `aria-current="location"`; optional `data-sticky="true"`, `--hw-content-nav-top`, `--hw-content-nav-bottom-reserve`, `--hw-content-nav-indent` |
| Dialog | `hw-dialog` on native `dialog`; `hw-dialog-header`, `hw-dialog-body`, `hw-dialog-footer` |
| Combobox | `hw-combobox`, `hw-input`, `hw-listbox`, `hw-option`; `data-active` for keyboard focus, `aria-selected` for committed selection |
| Surfaces | `hw-card`, `hw-card-header`, `hw-card-body`, `hw-card-footer` |
| Feedback | `hw-badge` and `hw-alert`; `data-tone="neutral|success|warning|danger|info"` (neutral is badge default); badges support `data-variant="soft|outline|dot"` and `hw-badges` wrapping groups; [source notes](../../docs/nic-badges.md) |
| Data | `hw-table-wrap`, `hw-table`, `hw-pagination`, `hw-breadcrumb`; native table semantics, `aria-current="page"`; `data-numeric` on numeric cells |
| Pagination | `hw-pagination-item`, `hw-pagination-arrow`, `hw-pagination-gap` (`details`), `hw-pagination-gap-trigger` (`summary`), `hw-pagination-menu`, `hw-pagination-jump`; [source and keyboard notes](../../docs/nic-pagination.md) |
| Rating | `hw-rating` for native integer radios; `hw-rating-display`, `hw-rating-stars`, `hw-rating-star`, `hw-rating-fill`, `hw-rating-score` for non-interactive fractional scores; [source and accessibility notes](../../docs/nic-rating.md) |
| Disclosure | `hw-accordion`; `hw-accordion-item` on `details`; `hw-accordion-trigger` on `summary`; optional `hw-accordion-content` |
| Status | `hw-progress`, `hw-skeleton`, `hw-spinner`, `hw-avatar`, `hw-divider` |
| Avatar options | `hw-avatar`; `data-size="40|64|80|120|sm|md|lg|xl"`, `data-variant="circle|square"`; [geometry and theme notes](../../docs/nic-avatars.md) |
| Workflow | `hw-toolbar`, `hw-chip`, `hw-empty`, `hw-stepper`, `hw-step`, `hw-timeline`, `hw-upload`, `hw-tooltip` |
| Layout | `hw-stack`, `hw-cluster`, `hw-container`, `hw-sr-only` |
| Code | `hw-code-block` (`figure`; `data-wrap="true"` wraps lines), `hw-code-block-header`, `hw-code-block-title`, `hw-code-block-actions`, `hw-code-block-content` (`pre`), `hw-code`, `hw-kbd`; syntax roles `hw-code-token-comment`, `-punctuation`, `-keyword`, `-property`, `-string`, `-constant`, `-attribute`, `-tag`, `-type`, `-function`; [contract and accessibility notes](../../docs/code-and-prose.md) |
| Prose | `hw-prose` on a container styles class-less content inside it and leaves classed elements and their contents alone; [mapping and limits](../../docs/code-and-prose.md#prose) |
| Text tone | `hw-type` with `data-tone="muted|subtle"` |
| Sliders | `hw-slider`, `hw-range-slider`; optional value text in `output.hw-slider-value` and `output.hw-range-slider-value` |
| Tree view | `hw-tree-view`, `hw-tree-item`, `hw-tree-toggle` (a `button`, 1.75rem target); a flat tree sets `--hw-tree-depth` on each item and is indented by `--hw-tree-indent` per level |
| File dropzone | `hw-file-dropzone`; `data-state="dragging|error"`; `data-hw-readonly="true"` on the root of a read-only zone, whose file input stays enabled with `aria-disabled="true"` |
| Notifications | `hw-notification-list`; items carry `data-state="read|unread"` |
| Alert dismiss | `hw-alert-dismiss` on the optional dismiss button, a direct child of `hw-alert` |
| Portal header actions | `hw-portal-header-actions` in every adapter; shrinks and wraps its controls. The earlier `hw-portal-actions` is still styled for one release |

Defaults are primary/medium buttons, comfortable density, light mode, and the
DGA reference theme. Select `data-hw-theme="hawiyah"` for the original palette. Use `data-hw-density="compact"` to reduce control and
table spacing. Compact and small controls may require additional hit-area spacing
for touch-heavy applications. Step states are `active`, `complete` (or `completed`),
and `error`; current steps should also use `aria-current="step"`. Steps include a
CSS counter circle, so their content should contain the label without another
visible number. Timelines style direct list items. Upload supports
`data-state="dragging|error"`; drop behavior belongs to application code.

`hw-stack` and `hw-cluster` accept the scoped `--hw-gap` property. This is a
layout customization hook, not a global design token. Components otherwise use
the semantic `--hw-*` variables documented by `@hawiyah/tokens`.

## Semantics and behavior

Use genuine disabled controls where possible. An `aria-disabled` attribute changes
presentation and communicates state but does not suppress click behavior by itself.
A button with `aria-disabled="true"` stays in the tab order and keeps a focus
indicator; the previous and next arrows of Carousel and Pagination use it at a
bound, so that focus is not lost, and show their focus ring at full opacity.
Regions that an adapter always renders (`hw-dialog-footer`, `hw-stat-trend`,
`hw-empty-icon`, the footer of `hw-service-details`) take no space while empty.
Angular wrapper elements (`hw-text-field`, `hw-table`, `hw-popover` and the
others) get their box from zero-specificity rules in `layout.css`, which a
class or a rule of the application overrides and which leave `hidden` alone.
Keep inactive panels and closed tooltips/listboxes `hidden`; component display
rules preserve that attribute. The stylesheet does not assign roles, manage focus,
trap dialogs, announce errors, or implement keyboard navigation. Use native HTML
and Hawiyah adapters for those responsibilities.

Native `select`, `checkbox`, and `radio` preserve platform behavior. Labels and
messages must be associated in markup. Native progress needs a label; a
`progress` without a value shows a segment moving along the inline axis (static
stripes under reduced motion), and forced colours draw the value in `Highlight`.
In dark mode, progress and meter tracks and skeletons use a step lighter than the
surface, because the DGA dark palette gives surface and surface-muted one value. Loading
spinners and skeletons need suitable surrounding loading announcements. A tooltip
must supplement an accessible control name. Its wrapper uses `data-hw="tooltip"`
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

## Opt-in fonts

`fonts.css` loads IBM Plex Sans Arabic (400, 500, 600, 700) and IBM Plex Mono
(400), the families the tokens name. It is never part of `styles.css`:

```ts
import '@hawiyah/styles/fonts.css';
```

```html
<link rel="stylesheet" href="/vendor/hawiyah/fonts.css">
```

The files are IBM's published files, unchanged, under the SIL Open Font License
1.1; the licence text and a provenance record with file hashes ship in
`dist/assets/fonts`. The file also gives Arabic text inside code a joined Arabic
face without making Latin code proportional. Details, sizes and open items:
[docs/fonts.md](../../docs/fonts.md).

## Self-contained branding assets

The package also exports the Arabic-only outlined logo and transparent loaders:

```ts
import wordmark from '@hawiyah/styles/assets/hawiyah-wordmark.svg';
import loader from '@hawiyah/styles/assets/hawiyah-loader.gif';
import whiteLoader from '@hawiyah/styles/assets/hawiyah-loader-white.gif';
```

Asset imports depend on the application's bundler; vanilla projects can copy the
files into their public directory. Use the static SVG in a `<picture>` source
with `media="(prefers-reduced-motion: reduce)"`, give the decorative image empty
alt text, and provide separate localized `role="status"` loading text. 256px GIF
variants use `hawiyah-loader-256.gif` and `hawiyah-loader-white-256.gif`. Font outlines
are embedded in the SVG; Aref Ruqaa is not a runtime dependency or a font request.

## Curated interface icons

The shared stylesheet includes 62 self-hosted Hugeicons Stroke Rounded icons.
They work in vanilla, React, Vue and Angular without a renderer dependency; each
framework owns the ordinary `span` it renders. In React use `className` in place
of `class` in this example:

```html
<button type="button" class="hw-button hw-icon-button" data-variant="ghost" aria-label="بحث">
  <span class="hw-icon" data-icon="search-01" aria-hidden="true"></span>
</button>
<a href="/next">
  التالي
  <span class="hw-icon" data-icon="arrow-right-01"
        data-directional="true" aria-hidden="true"></span>
</a>
```

Available `data-icon` names, each an unchanged file from the pinned upstream
commit recorded with its SHA-256 in `assets/icons/provenance.json`:

| Group | Names |
| --- | --- |
| Navigation and arrows | `arrow-left-01`, `arrow-right-01`, `arrow-left-02`, `arrow-right-02`, `arrow-up-01`, `arrow-up-02`, `arrow-down-01`, `arrow-down-02`, `arrow-up-right-01`, `arrow-data-transfer-vertical`, `home-01`, `menu-01`, `grid-view`, `layers-01` |
| Actions | `search-01`, `filter-horizontal`, `sorting-05`, `add-01`, `minus-sign`, `cancel-01`, `tick-02`, `copy-01`, `download-01`, `upload-01`, `reload`, `play`, `link-04`, `link-square-02` (external link) |
| Status | `checkmark-circle-02`, `information-circle`, `alert-02`, `exclamation-mark`, `cancel-circle`, `minus-sign-circle`, `star`, `thumbs-up`, `thumbs-down` |
| Forms and security | `calendar-03`, `clock-01`, `view`, `view-off-slash`, `lock-password`, `shield-01`, `certificate-01` |
| Content and files | `file-01`, `folder-01`, `book-open-01`, `code`, `source-code`, `message-01`, `paint-board`, `sparkles` |
| Places and organisations | `building-03`, `briefcase-01`, `location-01`, `globe-02` |
| Display preferences | `sun-03`, `moon-02`, `translate`, `left-to-right-list-bullet`, `right-to-left-list-bullet` |
| Brand | `github` |

Only `arrow-left-01`, `arrow-right-01`, `arrow-left-02`, `arrow-right-02` and
`arrow-up-right-01` mirror in right-to-left, and only with `data-directional="true"`
(their `directionalOptIn` in the provenance file). The two text-direction icons,
`play` and the brand mark keep their physical orientation.

The CSS alpha mask uses `currentColor` and defaults to
`1.5rem` (24px at the usual root size). Set the scoped `--hw-icon-size` variable
to change rendered size; icon size does not establish an accessible touch target.
Provide a visible label or an accessible name on the containing control; these
decorative spans must remain `aria-hidden="true"`.

Icon buttons center 20px artwork (16px for small) in DGA themes, including SVGs
inside framework wrappers. Target dimensions follow the selected density;
`--hw-icon-size` still overrides the artwork. Use `data-shape="circle"` for a round
action. Background icons are noninteractive decoration: `.hw-icon-background`
uses 48px circles; `data-size="xs"` uses 30px and `xl` remains 48px as in the source.
Set `data-size="sm|md|lg|xl|2xl"` on `.hw-icon` for 14/20/24/30/48px artwork.
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
import searchIcon from '@hawiyah/styles/assets/icons/search-01.svg';
```

## DGA reference compositions

The stylesheet includes the mapped DGA profile, input state transitions and portal
compositions. `hw-service-container` provides the 1280px content region;
`hw-service-layout` composes `hw-service-main` and `hw-service-aside` with a 32px gap.
`hw-form-layout` supports a desktop progress column and a single-column mobile
flow. `hw-stepper-responsive` groups the desktop list with a mobile summary;
`hw-stepper-ring` uses `--hw-step-progress` for its decorative progress ring.
Provide an accessible current/total label alongside that ring.

Keep source order meaningful: progress summary, form, then contextual guidance.
Portal headers/footers retain their public `hw-portal-*` classes. The adapters
provide responsive disclosure behavior; vanilla uses `createPortalHeader` or
`enhance`. Template content, validation and integrations remain application responsibilities.
The Figma-derived examples are available in the guide's template gallery.

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

The NIC accordion profile uses 150 ms hover/focus color transitions and the
separate `--hw-duration-accordion-indicator: 200ms` chevron role. Disclosure
height retains `--hw-duration-accordion: 300ms`. Original Hawiyah remains immediate.
`--hw-color-accordion-border` and `--hw-color-accordion-focus` support scoped
color overrides; source geometry and accessibility adaptations are documented
in `docs/nic-accordion.md`.


### Table profile

`.hw-table` inside `.hw-table-wrap` uses NIC-informed 48px minimum cells,
8px/16px padding and an 8px outer radius in the DGA/custom profile.
`data-variant="striped|bordered"` and `data-size="sm|lg"` remain explicit
Hawiyah extensions. Use `.hw-table-heading` only for the optional 12px/18px
medium-weight heading composition. `--hw-color-table-row-hover` and
`--hw-color-table-row-hover-odd` are themeable semantic colors. Native table
markup needs captions, scoped headers and a named focusable overflow wrapper;
CSS does not add these semantics or selection behavior. See
[table evidence](../../docs/nic-tables.md).

For vanilla sorting, place `<span class="hw-table-sort-icon" aria-hidden="true"></span>`
inside the header button. Its decorative indicator follows `aria-sort` on the
native `th`; the controller supplies that semantic state.

The DGA Select indicator follows focus and writing direction. Multiple selects,
visible-row listboxes and forced colors use the native indicator treatment.
Scale field descriptions with `--hw-profile-helper-size` and
`--hw-profile-error-size`. The light and dark palettes expose
`--hw-color-field-helper` and `--hw-color-field-error-text`.

Use `hw-type` and a `data-scale` value to choose the NIC display, heading or body metrics independently of the heading level. Use `hw-line-clamp` with `data-lines` for a visual excerpt. When people need the full text, provide a visible way to expand or open it. `hw-divider` supports neutral, primary, gold and tertiary tones with `data-tone`. Use `aria-orientation="vertical"` in inline layouts. See the [foundations measurements](../../docs/nic-foundations.md).
## HTML reading direction

Set `dir="rtl"` or `dir="ltr"` on the document or on the nearest section that changes direction. The carousel track, directional arrows, calendar controls, select indicator, overflow markers and notification entry follow that boundary. A nested override takes effect even when the language stays the same. Physical arrow icons mirror only when explicitly marked directional.

For `dir="auto"`, Hawiyah uses a CSS `@scope` root with the native `:dir(rtl)` selector. This preserves the browser’s first-strong-character decision when the guide or a consumer minifies CSS. Engines without CSS scope still apply explicit direction boundaries. Decorative geometry at an automatic boundary falls back to LTR in those engines. Set an explicit direction when the host already knows the reading order.

The production direction regression loads the minified package stylesheet used by the guide editor. It checks carousel alignment, directional icon mirroring, select indicator placement and an overflow popup at 320px and desktop width.
