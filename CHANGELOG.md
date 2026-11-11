# Changelog

All seven `@hawiyah/*` packages share one version. Versions below 1.0 may change
APIs in a minor release; read the notes before upgrading.

## Unreleased

- Button groups keep their content width inside flex and grid containers.
  In plain HTML, React and Vue a group stretched to the full width of a stack;
  Angular hid this behind its host element. In vertical attached groups, icon
  buttons now share the other segments' width.
- The button group preview, code tab and all four live editor projects render
  one shared example, and the preview style control switches whole groups.
- The guide header links to GitHub with the DGA set's `github` icon instead of
  the word GitHub and an external-link mark.
- The release script reports when every package was already on npm instead of
  claiming it published them.

### Angular server rendering and hydration

Found by server-rendering and hydrating every component of the published
0.2.1 packages in a prerendered Angular 22 application.

- `hw-tabs` and `hw-content-navigation` no longer end a prerender. Both
  started layout measurement during server rendering; a timer then called
  `getBoundingClientRect`, which the server DOM does not have, and the uncaught
  exception stopped the render worker and unrelated routes with it. The Angular
  adapter now starts the observers only in the browser, and
  `observeTabOverflow` / `observeContentNavigation` in `@hawiyah/core` return
  inert handles when the DOM has no layout.
- `hw-combobox`, `hw-tag-input`, `hw-multi-select` and `hw-date-picker` no
  longer throw `setCustomValidity is not a function` on the server (an unhandled
  rejection when bound through `ngModel`). The date picker's dialog now receives
  its id on the server, so `aria-controls` resolves in the prerendered page.
- `hw-toggle-group` in single-select mode and `hw-accordion` (and
  `details[hwAccordionOpen]`) no longer throw on the server, where the failed
  pass left later accordion items and following components empty.
  `observeReadonlyChoice` falls back to the owner document without
  `getRootNode`, and `createAccordionMotion` no longer spreads
  `details.children`. Choice guards and accordion motion start in the browser;
  the server keeps `<details open>` and the native `name` of an exclusive group.
- `hw-tabs` can be hydrated. Each `hw-tab` now renders its own
  `section.hw-tab-panel` instead of handing a template to `hw-tabs`, which
  Angular could only locate from `document.body` and which failed with NG0509,
  leaving the tabs inert. **Markup change:** panels are children of their
  `hw-tab` element (given `display: contents` by `@hawiyah/styles`) instead of
  direct children of `.hw-tabs`; roles, ids, `aria-controls`,
  `aria-labelledby` and panel order are unchanged. **API change:** the
  `content` template reference on `HwTabComponent` is removed, and the
  component gains the signals `panelId`, `tabId` and `active`, which the
  owning tabset sets. Inputs, outputs and selectors are unchanged.
- A package test now server-renders every exported Angular component and
  directive with `@angular/platform-server`, value controls through
  `[(value)]`, `ngModel` and `formControl`, and fails on any thrown or logged
  error; a second test hydrates the same pages in jsdom. React and Vue were
  checked for the same hazards and needed no change.

### Typed values and accessible names

- Angular `hw-number-field` and `hw-text-field` no longer rewrite text while
  it is typed. Replacing `12` with `-5` committed `5`, typing `1e2` committed
  `2`, and editing one segment of a `type="date"` field cleared the whole date,
  because the model was bound back into the input on every keystroke. The input
  is now written only when the model changes from outside and does not already
  show that value; a form reset still clears a draft. Values emitted match the
  other adapters: `-5` and `100` from NumberField, the typed string from
  TextField.
- A FileDropzone without a label has an accessible name in Angular and Vue.
  Angular rendered an empty `<label>` and Vue none, so the file input was
  announced without a name (Angular) or with the browser's own button text
  (Vue). As in React, the visible instruction (`instruction` / `dropLabel`) is
  now the input's label when no label is given; with a label nothing changes.

### Choice styles, clean package builds and continuous integration

- A radio group with no selection no longer shows every radio as selected in
  the DGA and custom themes. Browsers match `:indeterminate` on every radio of
  a group with no checked member, and the shared choice styles showed the mark
  for it; this happened in all four adapters, and in Angular also after a
  native form reset. Only a checkbox now uses the mixed presentation. A
  Chromium test loads only the package stylesheet and checks an unselected,
  a selected and a reset group, and a mixed checkbox, in every theme and mode.
- `pnpm build:packages` empties each package's `dist` before building it. The
  0.2.1 `@hawiyah/styles` tarball shipped 12 asset files that had been deleted
  from the sources and survived in `dist` from earlier builds.
- `pnpm check:packages` fails when a tarball contains a file the last clean
  build did not produce or that changed since, and when an `exports` target is
  not in the tarball. Files other than `dist` are now staged from each
  package's `files` field, so `@hawiyah/tokens` ships
  `reference/dga-foundations.json`, which 0.2.1 exported without containing.
- A CI workflow runs the package build, unit and token-contrast tests, the
  guide typecheck, the tarball check and the Chromium browser suite on every
  push and pull request. Before this, no workflow ran a test.

### One flat stylesheet, more icons and style-only fixes

- `@hawiyah/styles/styles.css` is now one flat file. The build inlines the
  tokens and every component file in source order, so the published entry has
  no `@import` and a page can link it directly, without a bundler; 0.2.1
  started with a bare `@import '@hawiyah/tokens/tokens.css'` that a browser
  cannot resolve, followed by 47 more imports. Font and icon URLs stay relative
  to the file. `reset.css` remains separate and opt-in, and the individual
  files stay available as `@hawiyah/styles/<file>.css`. The source files are
  unchanged. `node scripts/build.mjs --only <package>` rebuilds one package.
- `pnpm check:packages` checks that the packed `styles.css` contains no
  `@import`, defines `--hw-color-primary`, contains `.hw-button`, leaves the
  reset out and references only files that are in the tarball.
- 28 icons, each an unchanged Hugeicons Stroke Rounded file from the pinned
  commit with its SHA-256 and upstream URL: `book-open-01`, `briefcase-01`,
  `building-03`, `certificate-01`, `clock-01`, `code`, `copy-01`,
  `download-01`, `file-01`, `folder-01`, `github`, `globe-02`, `grid-view`,
  `layers-01`, `left-to-right-list-bullet`, `location-01`, `message-01`,
  `moon-02`, `paint-board`, `play`, `reload`, `right-to-left-list-bullet`,
  `shield-01`, `source-code`, `sparkles`, `sun-03`, `translate` and
  `upload-01`. The pinned commit has no dedicated text-direction icon, so the
  two list-bullet icons stand for left-to-right and right-to-left text.
  `calendar-03`, `view` and `view-off-slash` now have `data-icon` rules too,
  and `arrow-up-right-01` mirrors with `data-directional="true"`, as its
  provenance already declared.
- A `progress` without a value shows a segment moving along the inline axis,
  with static stripes under reduced motion; it looked the same as 0% before.
- In dark mode, progress and meter tracks and skeletons are visible on
  surfaces. The DGA dark palette gives surface and surface-muted one value, so
  they had disappeared; light mode is unchanged.
- Forced colours: the progress value is drawn in `Highlight`, carousel arrows
  keep their glyph, and a pressed icon button takes the selection colours.
- Segmented toggle groups: keyboard focus no longer gives an unpressed button
  in multiple mode the pressed colours. Outline groups keep 4.5:1 label
  contrast on hover and focus. At 576px and below the segments share one row,
  so a four-option group no longer wraps to a second row at 390px or 320px.
- The upload-list remove action no longer turns green on hover or focus, where
  its glyph had 2.74:1 contrast.
- The file upload and dropzone native inputs shrink inside a narrow card
  instead of widening the page at 320px. The vanilla dropzone's
  `data-dragover` marker now shows the drag-over state.
- A calendar month button that contains icon markup (React and Angular) shows
  one chevron, not two. An empty-state icon wrapped in a decorative span
  (React and Vue) gets the icon tile.
- Field hints use 12px, the smallest step of the documented type scale,
  instead of the 10px of the NIC source.

## 0.2.1 — 2026-11-10

### Icons follow the DGA Platforms Code icon library

Every interface icon now comes from Hugeicons Stroke Rounded at the pinned
commit already recorded in `packages/styles/src/assets/icons/provenance.json`,
the set used by the DGA Platforms Code icon library. Files are shipped
unchanged and colored through CSS masks; the two native select arrows keep the
upstream geometry with a fixed text color, as recorded under `derived`.

- Close and remove buttons in every adapter render a `cancel-01` icon element
  instead of a `×` character. Tree toggles use `add-01` / `minus-sign`,
  calendar navigation uses `arrow-left-01` / `arrow-right-01` (mirrored in
  RTL), sortable table headers use `arrow-up-02`, `arrow-down-02` and
  `arrow-data-transfer-vertical`, and external footer links use
  `link-square-02`.
- Stylesheet glyphs became icon masks: accordion and collapsible indicators,
  checkbox ticks, the date-picker information trigger, carousel arrows, table
  sort indicators, external links, pagination arrows and notification icons.
  Completed and error stepper markers are now solid circles with the DGA tick
  or exclamation cut out.
- Where a component's CSS already draws a close icon, it is skipped when the
  button contains its own `.hw-icon`, so markup written for 0.2.0 still shows
  exactly one icon.
- The rating keeps its star glyph: the DGA reference CSS draws stars as a glyph
  with a fractional fill, which the outline-only icon set cannot reproduce.

### Fixes

- The official-site verification toggle uses the DGA link color
  (`--hw-color-link`), raising its contrast on the muted banner from 4.31:1 to
  6.0:1 in light mode.
- Private custom properties that kept the old prefix (`--_nq-*`) are renamed
  `--_hw-*`.
- Guide tab titles use the page name. The overview and layout studio titles were
  built from their two-line headings and ran words together.
- The guide search shortcut hint stays at the inline end of the field in Arabic.

## 0.2.0 — 2026-11-09

First npm release of `@hawiyah/tokens`, `@hawiyah/styles`, `@hawiyah/core`,
`@hawiyah/vanilla`, `@hawiyah/react`, `@hawiyah/vue`, and `@hawiyah/angular`.

- Packages install from npm: `npm install @hawiyah/styles @hawiyah/<adapter>`.
- Internal `@hawiyah/*` dependencies are pinned to the exact matching version.
- `pnpm release:packages` builds, verifies, and publishes the checked tarballs;
  source manifests stay `private: true`. Pushing a `v*` tag publishes through
  GitHub Actions with npm provenance.
- The guide's install commands and downloaded example projects use the
  published packages instead of local tarballs.

### Renamed from Nasaq to Hawiyah

The project was developed as Nasaq (نسق) through 0.1 and is renamed Hawiyah
(هوية) in this release; the `@nasaq` npm scope belongs to another publisher.
The source moved from `MohamedEmbarak/nasaq` to `MohamedEmbarak/hawiyah`.
Code written against the 0.1 source needs these renames:

| 0.1 (Nasaq) | 0.2 (Hawiyah) |
| --- | --- |
| `@nasaq/*` packages | `@hawiyah/*` |
| `.nq-*` classes | `.hw-*` |
| `--nq-*` custom properties | `--hw-*` |
| `data-nq`, `data-nq-*` attributes | `data-hw`, `data-hw-*` |
| `nq:change` and other `nq:` events | `hw:change`, `hw:` |
| Angular `Nq*Component`, `Nq*Directive`, `nq-*` selectors, `nq*` directive attributes | `Hw*`, `hw-*`, `hw*` |
| Theme `nasaq` (Woven Rhythm palette) | Theme `hawiyah` (Signature palette) |
| `nasaq-*` brand assets and loaders | `hawiyah-*` |

The logo is now the Arabic word هوية in outlined Aref Ruqaa Bold, colored with
DGA Platforms Code variables, and the handwriting loader writes the new word.
Hawiyah is described as a UI component library built to comply with the DGA
Platforms Code; compliance evidence and open items remain documented in the
alignment and validation records.
