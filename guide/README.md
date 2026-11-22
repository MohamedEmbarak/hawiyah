# Hawiyah guide

This directory holds the public guide of Hawiyah (هوية), a UI component
library built to comply with the DGA Platforms Code. Hawiyah is not an official
DGA product and holds no certification; the guide documents compliance
evidence and open items.

The guide is an Angular application that is prerendered as static files for
GitHub Pages under `/hawiyah/`. It is a standalone npm project outside the pnpm
workspace and consumes only the published `@hawiyah/*` packages.

## The honest-render rule

Every component the guide shows is rendered by the packages published on
`https://registry.npmjs.org/` at the pinned version, never by the source in
this repository. The rule is enforced as follows:

- `package.json` pins all seven packages (`@hawiyah/tokens`, `styles`, `core`,
  `vanilla`, `react`, `vue`, `angular`) at the same exact version. No range, tag,
  alias, `file:`, `link:` or `workspace:` value, and no `overrides` or
  `resolutions` key, is accepted.
- `package-lock.json` is committed and installs use `npm ci` only. Every lock
  entry, not only the seven, resolves to the registry tarball whose path names
  the entry's own package and version, with a `sha512` integrity; no entry is a
  link, a file, a Git source or on another host. No `@hawiyah` package is
  installed anywhere but in the seven directories `node_modules/@hawiyah/<name>`.
- `guide/` matches no glob of `pnpm-workspace.yaml` and must never be added to
  it; pnpm would otherwise link the workspace packages into the guide.
- No file in `guide/` imports, reads or copies anything from `packages/`,
  `apps/` or `examples/`. This is enforced structurally: `guide.yml` builds and
  tests the guide from a sparse checkout that holds only the paths of
  `build-inputs.json` (`guide/`, `docs/`, `components.json`, `NOTICE`,
  `CHANGELOG.md`, `pnpm-workspace.yaml` and the workflow file: every input of
  the build and its tests), and fails if `packages/`, `apps/` or `examples/`
  exist; a read of them fails on the runner. `build-inputs.json` is the single
  source of that list: `scripts/test/build-inputs.test.mjs` requires the two path
  filters and the sparse checkout of `guide.yml` to equal it, and step 20 accepts
  a link to a repository file outside it only when `link-targets.json` lists the
  file (`tests/guide-link-targets.test.ts` at the repository root checks in the
  full checkout that each listed file exists), so a page builds the same way on a
  developer machine and on the runner. The registry check (HWREG-R6) adds an early, readable message for a
  literal path to those directories, a remote `@hawiyah` address or a script
  or stylesheet loaded from another host under `src/`, and a style file other
  than `.css` under `src/`; it does not see paths built at run time, which
  the sparse checkout catches. `guide-preview.yml` builds the packages and is
  not sparse.
- Nothing redirects module resolution inside `guide/`: the effective compiler
  options (with `extends` followed) of every root tsconfig and of every
  tsconfig that `angular.json` names have no `paths` or `baseUrl`;
  `angular.json` has no `fileReplacements` and lists styles and scripts only
  from `src/`; `package.json` has no `imports`; no `node_modules` directory
  exists below `guide/` other than `guide/node_modules`.
- The registry check (`npm run check:registry`) runs before and after every
  build. It compares `package.json`, the lockfile, the registry metadata, the
  downloaded tarballs and the installed files. After the build (step 90) it
  checks what the build actually resolved: every input recorded in the esbuild
  metafiles of the Angular build (`browser-stats.json`, `server-stats.json`)
  and of the runtime bundles lies in `guide/`, every `@hawiyah` input lies in
  `guide/node_modules/@hawiyah/<name>/`, and every import of `@hawiyah/<name>`
  resolves there. It then derives the served runtime again from the verified
  packages (steps 60 and 62 into `.cache/registry-dist/`) and requires every
  file of `dist/browser/runtime/`, `manifest.json` and `import-map.json`
  included, to equal the derived file byte for byte; the labels of the
  manifest are not trusted. In the production build it also bundles the three
  `@hawiyah/styles` imports again and requires the served `styles-*.css` and
  every file of `media/` to equal that bundle byte for byte. A failure stops
  the build.
- The guide adds no CSS or behaviour to restyle, imitate or repair a package
  component. A package defect is recorded and fixed in the package (see
  [The styling rule](#the-styling-rule)).
- No built-in string comes from the packages: every text the guide shows is in
  its own text sources, in Arabic and in English.

Unreleased package work is shown only through the preview build (see
[Preview build](#preview-build)), which cannot pass the strict registry check
and is never deployed.

A group with `frame` (a page-level component, see the live examples of
`docs/components/README.md`) renders its Angular result in the sandboxed frame,
from the same compiled payload as the equivalence step, and not in the guide page.
What such a framed Angular result does not prove: that the example renders on the
server and hydrates natively in an Angular application. The guide prerenders and
hydrates the native result of every other group; for a framed group it shows the
frame after hydration and, without script, its Angular listing and one sentence (no status, since the frame cannot load).
Server rendering and hydration of a page-level component remain covered only by
the package's own tests (`components.json` lists them in the evidence panel where
they exist).

## The styling rule

The guide shows every package element exactly as the published stylesheet
renders it, including its defects (for example `hw-code` values broken into
fragments inside a table cell, recorded in `CHANGELOG.md` under Known defects
in 0.3.0). Guide CSS places package elements and styles the guide's own
elements; it never sets an appearance property on an element with an `hw-`
class, and a guide class never shares an element with an `hw-` class to change
how it renders. Muted text and similar needs use the package's documented
variants (`data-tone="muted"` on `hw-type`).

The package stylesheet is its own bundle: `src/styles.css` holds only the three
`@hawiyah/styles` imports (bundle `styles-*.css`); the lint fails on any other
node in it, and build step 90 requires the served `styles-*.css` and its media
files to equal, byte for byte, the bundle derived again from the installed
`@hawiyah/styles` with the options of the Angular build. The guide's document
rules are in `src/guide.css` (bundle `guide-*.css`), the guide components' rules
in their own style sheets.

Package element, first clause: an element whose tag starts with `hw-` or whose
class list has a class starting with `hw-`, and every descendant of such an
element down to a projected guide element. A projected guide element is an
element that a guide template wrote: its tag starts with `guide-` (or is
`app-root`), or it carries an Angular emulation attribute (`_ngcontent-*`,
`_nghost-*`). `@hawiyah/angular` 0.3.0 declares no component styles, so Angular
writes no emulation attribute on what a package component renders. A guide
component with styles marks what its template writes with its emulation
attribute; a guide component without styles of its own (the inline renderer, for
example) writes no such attribute, but its host is a `guide-` element, so the
descent stops there as well. A plain `span`, `button`, `li` or `td` that a package
component renders without an `hw-` class therefore belongs to the package.

Second clause: every element, whoever wrote it, that a rule of the package
stylesheet the page serves (`styles-*.css`) matches when the rule's selector
names an `hw-` class or an `hw-` tag in a compound outside `:not()` and `:has()`:
a heading or paragraph that a guide template writes inside `.hw-prose`, the
`code` element of a code block, a paragraph inside an alert, an image inside the
portal brand, a column of `hw-sidebar`. The set is derived in the browser from
the served stylesheet, with states and pseudo-elements stripped as below, except
that `data-*` attributes other than the colour mode, theme and density stay in
the package's selectors (the package's scripts write `data-*` states only on the
elements they render, so a guide element is selected through one only when the
guide writes it, and then at rest). A rule that selects only by `data-hw-mode`,
`data-hw-theme` or `data-hw-density`, by `:root` or by an element name alone
makes no element a package element. On today's pages the second clause adds 14
elements on a landing page, 3 on the catalogue and the editor, 16 on a brief page,
47 on a Button reference page and 42 on a Tabs reference page.

The proof has two halves, both over every prerendered page in both languages
(`tests/e2e/support/styling-rule.ts` holds the definitions and lists).

- Structural half (`tests/e2e/pages/styling-structure.spec.ts`, at 1280 and
  390 px, with the header menu open, the side drawer open and the editor after
  its first run): every rule of every guide stylesheet, style element and
  adopted sheet is read in the browser, under every condition (all `@media`,
  `@supports`, `@container`, `@layer`, `@scope` and `@starting-style` blocks,
  so print, forced colours, both motion preferences and every width range), with
  CSS nesting resolved. States are removed from the selector: pseudo-classes
  that are not structural (`:hover`, `:focus`, `:focus-visible`, `:focus-within`,
  `:active`, `:checked`, `:disabled`, `:target`, `:open`, `:visited` and the
  others), every attribute selector whose name starts with `aria-` or `data-`,
  and `open`, `hidden`, `disabled`, `checked`, `selected`, `readonly`,
  `required` and `inert`; so are all pseudo-elements, also inside `:is()`,
  `:where()`, `:not()` and `:has()` (a `:not()` that held a state is dropped).
  `lang`, `dir`, `role`, `class`, `id`, `type`, `href` and the emulation
  attributes stay. The result is matched with `querySelectorAll`. A rule that
  matches a package element may declare margins; any other placement property
  (sizes, position and inset, flex and grid item properties, `visibility`,
  scroll margins, and `display` only as `none`) only through an entry of
  `PLACEMENT_ALLOWED`, and nothing else. A rule that matches an ancestor of a
  package element may declare an inherited property (the list is derived from
  the browser when the test runs, together with a written floor for properties
  the derivation cannot change), a package custom property (`--hw-*`, `--_hw-*`)
  or a property that changes how every descendant paints (opacity, filter,
  transforms, masks, clipping, blending, `text-decoration-line`, the offset path
  properties and `animation-name`) only through an entry of `INHERITED_ALLOWED`;
  a token value is not a reason. Each entry names stylesheet, selector,
  property, value and condition (the enclosing `@media` or `@supports`), with a
  reason, and the test fails on an entry that no rule on any page uses. Each
  page test records the entries its rules used (`tests/e2e/support/structure-used.ts`
  writes them to `structure-used/` in the test output); the union over every
  page and both opened states is judged by the global teardown of the browser
  tests when every page ran in the run (an error there fails the run), and by
  `scripts/e2e/merge.mjs` over the shards of `guide.yml`. Today
  `PLACEMENT_ALLOWED` holds the line length of the article on the brief and
  reference pages and the side column of the component pages, which is not
  rendered below 64 rem while the drawer offers the same navigation;
  `INHERITED_ALLOWED` holds the document colour and font family on `html`, the
  same two on the stage of a native result (it reproduces the result frame's
  document) and of a landing pane (it carries its own mode and theme), the
  sticky offset of the side navigation, the hidden install cell, the pause slot
  and the reserved command of the landing, and the three animations of a
  landing pane (only when the reader allows motion). A selector the stripper
  cannot handle (`:host`, `::slotted()`, `::part()`, `:nth-child(... of S)`), a
  rule type it does not know and a guide `@keyframes` with a package name
  (`hw-*`) fail the test.
- Computed half (`tests/e2e/pages/package-styles.spec.ts`, in both colour modes
  at 1280 and 390 px, the editor after its first run): every computed property
  (custom properties aside) of every package element (both clauses), and of its
  `::before`, `::after` and `::marker` when they exist, is read once with every
  stylesheet on and once with every stylesheet, style element and adopted sheet
  disabled except the package bundle; the values must be equal, except the
  margins and, on the elements a `PLACEMENT_ALLOWED` rule reaches, the property
  it allows. Consequences of placement are judged by rule: the blockified
  `display` of an item of a guide flex or grid container; `min-*` sizes whose
  `auto` resolves to `0px` when the element is no longer such an item or is
  rendered in one state only; colours that follow `currentColor`; values
  resolved against the element's own box (used sizes, `transform-origin`,
  `perspective-origin`, the used grid tracks) when that box differs; and the
  insets of a positioned box when its box or its containing block differs. The
  `min-*` rule applies to a pseudo-element as well when its element is rendered
  in one state only (the groups of the side navigation in the side column below
  64 rem, which `PLACEMENT_ALLOWED` hides). An
  inherited difference is accepted only when it starts at a guide element on
  which an `INHERITED_ALLOWED` rule declares that property. The test prints how
  many elements (by clause), pseudo-elements and properties it compared.

The style block the guide writes into a result frame (`examples/frame/document.ts`)
styles only the document, the body and the mount root. A unit test in
`document.spec.ts` compares the whole text of the block, with the colour mode as
its only variable, so a nested rule, another selector, another property or
another value fails; it also parses the block and reports each selector,
property, nested rule and at-rule outside its written list.

What the two halves do not cover: browsers other than Chromium (selector support
and computed values of Firefox and Safari are not read); DOM states the tests do
not open (an opened dialog of an example, a validation message, a date picker's
calendar, a menu of a package component), where a rule could match elements that
exist only then; the look a listed placement declaration gives (a size or a
hidden column can change how a component looks, which is why each one is listed
with its value and reason rather than allowed by property); animations declared
on an ancestor, whose keyframes are not judged (the declaration of
`animation-name` on an ancestor is, through `INHERITED_ALLOWED`); `data-*`
attributes that guide script would set at run time on its own elements inside a
package container; an element the guide writes inside a package container that
no rule of the package stylesheet matches (the plain runs of a code listing, a
`span.run` inside the code block), where a guide rule is not judged although it
changes how the listing reads; a state carried by an attribute outside the
stripped set (`tabindex`, which the package moves with the selected tab), where
a rule is tested only against the elements in that state at rest; and styles set
by script at run time (the lint refuses style
attributes and class or style bindings, including `classList`).

## Result frames

A live example runs in a sandboxed `iframe` (`sandbox="allow-scripts
allow-forms"`, an opaque origin, `referrerpolicy="no-referrer"`) whose document
the guide writes as `srcdoc` (`src/app/examples/frame/`). The guide never sends
a message to a frame; it accepts the frame's messages only from that frame's
window, with the run's token, and ignores anything else.

What the frame boundary holds: code in the frame cannot read or change the
guide page, its storage or its cookies. Its fetch and XHR, images, scripts,
styles, fonts, forms and navigation are limited by the frame policy (two
Content-Security-Policy values: `default-src 'none'`, scripts only with the
run's nonce or from the guide's `runtime/` directory, `connect-src 'none'`,
`frame-src 'none'`, `form-action 'none'`, `base-uri 'none'` and the other
directives in `document.ts`), and the page policy `frame-src 'none'` refuses a
navigation of the frame before a request is sent.

What it does not hold: WebRTC and a `<link rel="prerender">` hint are not
covered by any Content-Security-Policy directive in Chromium, so code in a
frame can send data to another host through them. As defence in depth, not as
a boundary, the frame bootstrap removes `RTCPeerConnection`,
`webkitRTCPeerConnection` and `RTCDataChannel` before the example code runs (a
nested frame created by the code gets fresh globals). The directive
`webrtc 'block'` is not added: Chromium does not recognise it and logs
`Unrecognized Content-Security-Policy directive 'webrtc'` for every frame. The
prerender hint remains a residual channel. The guide therefore never runs code
the reader did not start: the code in a frame is the guide's own example or
what the reader typed and ran.

Messages of a run: `ready` (and `emptied`, see below) is always accepted, and so
are the first error of a run and every error while the run is loading (the
first error ends a run that is loading); console output and height reports each
have a budget of 500 messages per run; later errors, `navigation` and `submit`
together have a budget of 50 per run. Console messages past their budget are
counted, and so are error, link and form messages past theirs; the editor shows
each count in one log entry per run, updated at most four times a second.

## Editor

The editor (`src/app/features/editor/`) shows, in the order of the document at
every width: the toolbar with Run, the status line, the code, the result and
the log. The status line (`role="status"`) is the one live region of a run's
outcome; the log (`role="log"`, `aria-live="off"`) is read, not announced; the
notice under the frame (`role="status"`, in the document and empty until it has
text) announces only a link or a form of the example that did not leave the
preview, with the address shown left to right in a `bdi` element. The focused
code shows the focus ring of the code surface; while focus is in the result
frame, its container shows the focus ring (the frame has an opaque origin, so
`:focus-within` does not reach it; the page notes that its window lost focus to
the frame).

A run fails at once, with the message of its cause, when the code throws, when
an Angular template does not compile (the generated `main.ts` lets the
rejected bootstrap reach the frame as an unhandled rejection), when the code
tries to navigate the frame, when the code replaces the frame's document (a
repeated load of the frame after which the bootstrap does not post `ready`
again within 3 seconds; a height report or other message does not count, so
`document.open()`, `write()` and `close()` after the load are reported at every
width; a bare `document.write()` without `close()` leaves the written text shown
and ends as run), when the code empties the
document (after `ready` the mount root has left the document and the document
shows nothing any more: no body, or a body without a child element and without
text; the bootstrap then posts `emptied`, while code that rewrites the body and
leaves something shown ends as run, with its result), and when the run document
loads more than four times (a result that reloads itself without end); a run
that is not ready within 20 seconds fails with the time limit. Compile errors carry the file, line and column of the file the
reader wrote, also for a script error of a Vue file and for an import the
editor does not serve. A compile request that takes longer than 60 seconds
stops the compile worker, fails the run with that message, and the next
request creates a new worker.

Without script (`@media (scripting: none)`) the editor page shows its heading,
a description and a link that name no example (one prerendered page answers
every address of the editor; the link leads to the component pages, and after
hydration both name the example of the address) and one sentence in the page
language: the editor needs JavaScript to edit and run code, and the component
pages show every example without it. The guide's toolbar, status line, code and result are
not shown. The example blocks of the component pages stay as they are: the
prerendered Angular result and its Angular listing are shown; the framework tabs
are the package Tabs component, which needs script, so the JavaScript, React and
Vue listings are not reachable without it.

## On this page

The reference pages pass `updateHash` to `hw-content-navigation`: activating an
entry writes the section into the address, under the base path, with
`history.replaceState`. No history entry is added, so Back leaves the page
instead of returning to the earlier position (`CHANGELOG.md`, Known defects in
0.3.0). After a history move to an address with a fragment (Forward to the
address an entry wrote, or Back to a fragment link), the guide's viewport
scroller (`src/app/core/viewport-scroller.ts`) shows and focuses the section the
address names, where the router alone would restore the top of the page
(`scrollPositionRestoration: 'top'`). `tests/e2e/routing/fragments.spec.ts`
checks the address, Back, Forward and a reload, in both languages.

## Requirements

- Node 24 (see `.nvmrc`) with the bundled npm 11. `.npmrc` sets
  `engine-strict=true`, so other versions are refused.
- `.npmrc` contains exactly five lines: `engine-strict=true`,
  `save-exact=true`, `fund=false`, `audit=false` and
  `registry=https://registry.npmjs.org/`.
- npm does not run install scripts of dependencies; the build does not need
  them.
- Playwright uses an installed Chromium. Locally, set
  `HAWIYAH_CHROMIUM` (or `PLAYWRIGHT_BROWSERS_PATH`) to an existing browser
  instead of downloading one.

## Commands

Run in `guide/` unless stated otherwise.

| Command | What it does | Expected result |
| --- | --- | --- |
| `npm ci` | Installs exactly `package-lock.json`. | Exit 0; `added N packages`; no `npm warn EBADENGINE` and no `npm error` line. |
| `npm run check:registry` | `node scripts/registry-check/cli.mjs`: the registry check in strict mode. | Seven lines `registry-check: @hawiyah/<name>@0.3.0 ok (lock, registry, files N)`, then `registry-check: OK 7 packages @hawiyah/*@0.3.0 from https://registry.npmjs.org/`; exit 0. |
| `npm run check:registry:negative` | `node scripts/registry-check/negative.mjs`: real negative controls on temporary copies under `.cache/negative/` (among them a tsconfig `extends` with `paths`, `fileReplacements`, a copy in `src/node_modules` and `package.json` `imports`). | `registry-check negative controls: 10 of 10 rejected as expected`; exit 0. |
| `npm run lint` | `node scripts/lint/cli.mjs`: CSS, template and source lint. | `lint: css 0 findings in N files; templates 0 findings in N files; sources 0 findings in N files`; exit 0. |
| `npm run lint:negative` | `node scripts/lint/negative.mjs`: bad fixtures that the lint must reject. | `lint negative controls: N of N bad fixtures rejected with the expected rule ids`; exit 0. |
| `npm run test:scripts` | `vitest run --config vitest.scripts.config.ts`: tests of the Node scripts. Some drive Chromium (the keyboard checks, the outcome assertions and axe of step 80 on a stand-in page, `scripts/equivalence/test/keys.test.mjs`), so an installed Chromium is needed (see [Requirements](#requirements)). | Vitest summary with 0 failed; exit 0. |
| `HAWIYAH_BASE_PATH=/hawiyah/ npm run build` | `node scripts/build.mjs`: every step of the production configuration, output `dist/`. | One line per step `build: <id> ok (<ms> ms)`, then `build: production OK, <n> prerendered pages, 404.html, base /hawiyah/, 19 steps: <ids of the steps that ran>`; `dist/browser/index.html` contains `<base href="/hawiyah/">`; `dist/build-info.json` records a deployable build; exit 0. |
| `HAWIYAH_BASE_PATH=/hawiyah/ npm run build -- --pages <id,...>` | A local gate: every step but 90, step 80 only on the groups of the named pages. `--docs <dir>` reads the component pages from another directory instead (also without step 90). | `build: production OK, not deployable (--pages <ids>), <n> prerendered pages, ..., 18 steps: ...`; `dist/build-info.json` records `"deployable": false`; exit 0. |
| `node scripts/equivalence/run.mjs --shard <i>/<n> --report <file>` | Step 80 on shard i of n of an existing production output (see [Build steps](#build-steps)). | `equivalence shard <i>/<n> (<k> of <m> group-languages): ...`; exit 0. |
| `node scripts/equivalence/merge.mjs [--manifest <file>] [--record <file>] <report> ...` | Joins the shard reports of step 80. Each report carries the hash of the content manifest it compared (`contentManifest`), and so does the build record (`dist/build-info.json`, the default of `--record`); the merge requires them equal to the hash of the manifest given. It also fails on an entry of `scripts/equivalence/angular-hosts.json` whose element no shard found in the Angular result of a group of its component (not judged for a component without a group whose page exists). | The summary line of a run without `--shard`, followed by `; merged from <n> shards`; exit 0. Otherwise one `HWE-MERGE ...` line per problem and exit 1. |
| `node scripts/e2e/merge.mjs --list <list.json> --used <dir> ... <report.json> ...` | Joins the JSON reports of browser test shards (`guide.yml`). | `e2e: <n> tests of the build passed in <k> shards; the structural half of the styling rule ran on <p> pages and 2 opened states, every listed declaration used`; exit 0. Otherwise one `HWT-MERGE ...` or `HWT-UNION ...` line per problem and exit 1. |
| `node scripts/build-scope.mjs --require-deployable [--dir dist]` | The deploy check of `guide.yml`: the record `<dir>/build-info.json` of a complete, deployable production build. | `build-scope: dist/ is the output of a deployable production build (<n> steps...)`; exit 0, else exit 1. |
| `npm run build:dev-check` | Development build into `dist-dev/` under `/hawiyah/`, then `playwright test --project=dev`. | `build: development OK ...`, `log-scan: 0 findings (development)`, Playwright `N passed`; exit 0. |
| `npm run scan:log -- .cache/logs/build-production.log` | Scans a saved build log. | `log-scan: 0 findings (production)`; exit 0. A finding prints `log-scan: <rule id> line <n>: <text>` and exits 1. |
| `npm run test:unit` | Generation steps, then `ng test --no-watch` (Vitest with jsdom). | Vitest summary with 0 failed; exit 0. |
| `npm run test:e2e` | `playwright test --project=prod` against `dist/browser` served under `/hawiyah/`. Requires a prior production build with `HAWIYAH_BASE_PATH=/hawiyah/`. | `N passed` with 0 failed and 0 flaky; exit 0. Output goes to `GUIDE_TEST_OUTPUT` or `<os tmpdir>/hawiyah-guide-e2e`, never into the repository. |
| `npm run check:page -- <id> [--lang en] [--draft] [--docs <dir>] [--workers <n>]` | `node scripts/check-page.mjs`: the proof of one page for its writer, after one production build: the content step for that page only (a finding in another page does not fail it), the glossary and compliance assertions of the script tests and the Latin-script guard of step 72 on the page's own Markdown (`scripts/content/page-rules.mjs`: `HWT-GLOSSARY`, `HWT-COMPLIANCE`, `HWP-LATIN`), the compile of its live groups, the API tables and the vocabulary pass of step 30, the coverage report, and step 80 on its groups in the languages that exist. It does not run the browser tests nor the parts of step 72 that need a prerendered document (icons, `svg`, emoji, the Latin-script guard over the examples and generated text): `npm run build -- --pages <id>` and `npm run test:page -- <id>` do. It writes only below `.cache/page-<id>/` and never into `dist/` or `src/generated/` (step 80 serves `dist/browser` with the page's own payloads in place of `dist/browser/examples/`). Step 80 takes a lock: while another `check:page` compares its groups, a run waits (leadAmendments A8); a second run of the same page waits for the first. `--lang en` checks the English page alone; an English page without its Arabic sibling is checked in English only while `scripts/content/pending-translation.json` lists it (the writer of the English page adds its id, and the writer of the Arabic page removes it; without the entry the run reports `HWC-FILE` and, with `--lang en`, names the file to add the id to). It prints each row of the page's keyboard table with the steps of the checks that press its keys, their outcomes and references. `--draft` leaves out `HWE-KEYS` (the keys of the keyboard table bound to the steps of the checks), for a page whose check is not written yet; the steps that exist still assert their outcomes. A writer's tool, never the gate of a stage. | One line per stage (`check:page: content ok (<ms> ms) ...`, `glossary, compliance and Latin-script rules`, `compile`, `api-tables and vocabulary`, the coverage section, the keyboard report, the summary line of step 80, `equivalence`), then `check:page: <id> OK in <s> s (...)`; exit 0. Otherwise every finding with its code and `check:page: <id> FAILED with <n> finding(s) ...`; exit 1. |
| `npm run test:page -- <id> [<playwright option> ...]` | `node scripts/test-page.mjs`: the browser tests of one page against a production build that contains it: every test whose title names a document of the page (`components/<id>/`, `component page <id> (`), then the page's own specs (`tests/e2e/pages/<id>.spec.ts`, `tests/e2e/<id>/`) when they exist. It does not judge the union of the structural half of the styling rule. | Playwright `N passed` for each run, then `test:page: <id> OK (...)`; exit 0. |
| `npm run test:check-page` | `GUIDE_BUILD_TESTS=1 vitest run --config vitest.scripts.config.ts`: the script tests that need a production build in `dist/` (`scripts/test/build/*.build-test.mjs`): three wrong copies of `tabs.md` read with `--docs` fail `check:page` with `HWC-APIX`, `HWC-R1` and `HWE-STRUCT`, a copy without the Home row of its keyboard table fails with `HWE-KEYS` and passes with `--draft`, and two concurrent runs pass with `dist/browser/examples` and `src/generated` unchanged. Run it after the production build. | Vitest summary with 0 failed; exit 0. |
| `node scripts/test/scale/generate.mjs [--out <dir>] [--groups <n>]` | Writes the scale fixture (see [Scale](#scale)) to `.cache/scale/docs/components/` (ignored by Git). | `scale: 85 pages in 2 languages in ... (83 generated with 6 generic static groups each, 2 copied: button, tabs); build with --docs, never deployable`; exit 0. |
| `node scripts/test/frame/generate.mjs [--out <dir>]` | Writes the frame fixture (see [Frame fixture](#frame-fixture)) to `.cache/frame/docs/components/` (ignored by Git). | `frame: 3 pages in 2 languages in ... (button, tabs copied, page-header generated with one framed group); build with --docs, never deployable`; exit 0. |
| `npm run serve` | `node scripts/serve.mjs [--dir dist/browser] [--base /hawiyah/] [--port 4300]`. | `serve: http://127.0.0.1:4300/hawiyah/ -> dist/browser`; the process stays up. |
| `npm start` | Generation steps, then `ng serve` (development server, base `/`). | The Angular development server prints its URL; pages render with server rendering in development. |
| `npm run content:hash -- <id> [--docs <dir>]` | Prints the YAML front matter block of section hashes for `docs/components/<id>.ar.md`; edits nothing. | A `---` delimited YAML block with the key `source` and one entry per section id. |
| `npm run content:facts -- <id> \| --all [--out <dir>]` | `node scripts/facts/cli.mjs`: the fact sheet of a component for writers, from the installed packages with the readers of step 30 (`scripts/facts/`): members, vanilla markup and part classes, the README section of `@hawiyah/vanilla`, the fields of the item types per adapter, written as `<id>.json` and `<id>.md` to `.cache/facts/` (ignored by Git, read by nothing in the build). | `content:facts: <n> fact sheet(s) in .../.cache/facts (0 reader problem(s))`; exit 0. |
| `npm run content:scaffold -- <id> [--docs <dir>] [--force]` | `node scripts/content/scaffold.mjs`: writes the English skeleton `docs/components/<id>.md`: h1, fixed sections, the four API tables with their captions, and the compliance sentence; no summary, prose or example. An existing file is kept without `--force`. | `content:scaffold: wrote <file>: ...`; exit 0. Exit 1 with the reason when a table cannot be written (a reader problem or a list gap). |
| `npm run content:api-tables -- <id> [--write \| --check] [--docs <dir>]` | `node scripts/content/api-tables.mjs`: writes (`--write`) or checks (`--check`) the four API table bodies of `<id>.md` and `<id>.ar.md` from the installed packages, with the generated note of a table read from the stylesheet; captions, header rows and prose stay. Without a flag it prints the English tables. Run it when the pin moves. | `content:api-tables: docs/components/<id>.md: the four API tables match the installed packages` per file; `--check` exits 1 when a file would change. |
| `npm run content:scaffold-ar -- <id> --strings <map.json> [--docs <dir>] [--force]` | `node scripts/content/scaffold-ar.mjs`: writes `<id>.ar.md` from the English page: front matter hashes, h1, h2, API captions, headers and note from fixed lists; API bodies and code listings copied; live blocks copied with every reader string that `HWC-PAR8` reads replaced from the map `{ "<English>": "<Arabic>" }` in the four blocks of each group (`scripts/content/string-map.mjs`: markup text, reader names, shown values, a component value that the native markup of the group shows as a value, and a string under another name that is not a token name when the group reads it as reader text, such as a one-word `category` or `term`; never an id, a field name, a slot, an option value or the value of an input or component of type `email`, `url`, `tel` or `number`); other text left for the writer to translate in place. | `content:scaffold-ar: wrote <file>; ...`, then one line per reader string of the English blocks that the map does not translate, per other string left in English that renders as reader text (`left in English: ...`) and per unused entry; exit 0. |
| `npm run content:scaffold-ar -- <id> --placeholder --docs <dir> [--strings <map.json>]` | The same with every text left in English and every reader string the map does not translate replaced by the placeholder `نص مؤقت إلى حين الترجمة.`: a stand-in sibling for the browser tests of an English page before its translation. It writes only into a directory outside the repository; the build reads it with `--docs` (not deployable). Step 20 refuses the placeholder in a page of `docs/components/` (`HWC-TODO`). | `content:scaffold-ar: wrote the placeholder sibling <file> (not a translation; ...)`; exit 0. Exit 1 when `--docs` lies inside the repository. |
| `npm run content:sync-ar -- <id> [--docs <dir>] [--check]` | `node scripts/content/sync-ar.mjs`: rewrites the live blocks, code listings and API tables of an existing `<id>.ar.md` from the English page, with the string map that the existing pair gives, replacing the same reader strings as `content:scaffold-ar`; translated prose and the front matter stay. | `content:sync-ar: rewrote ...` or `... is in step with its English page`, then the strings without a translation, the strings left in English that render as reader text, the Arabic strings it kept in place of an English one (`kept the Arabic string ...; check it`) or could not carry, and the stale sections; it never replaces an Arabic string by an English one; `--check` exits 1 when the page would change. |
| `npm run content:coverage -- [<id> ...] [--docs <dir>]` | `node scripts/api-tables/coverage.mjs`: the coverage report of leadAmendments A5, per page: the enumerated values and boolean members of the API that no live group of the same framework shows (the default value counts as shown) and that the section Variants and states does not name. A report, never a gate; `check:page` prints the same section. | `coverage: <id>: <n> of <m> enumerated values and boolean members of the API are shown by no live group and not listed in Variants and states (a report, not a gate)`, then one line per framework with what is missing; exit 0. |
| `node scripts/api-tables/cli.mjs --declared-all` | One line per component and framework of `components.json` with what the readers of step 30 declare. | `api-tables: declared members of 85 ids in 4 frameworks: <n> members; 0 reader errors; 0 ids without a target; <g> list gaps (...)`; exit 0, else exit 1. |
| `npm run preview:local` | `node scripts/preview/build-preview.mjs`: preview build from local tarballs. Requires `pnpm build:packages && pnpm check:packages` at the repository root first. | `preview: built from local tarballs at commit <sha7> in ../.artifacts/guide-preview/guide/dist/browser`; exit 0. |

`HAWIYAH_BASE_PATH` must start and end with `/` (default `/`). The deployed
guide and its checks use `/hawiyah/`.

## Build steps

`scripts/build.mjs` runs the steps in `scripts/build-steps/` in order. Options:
`--configuration production|development` (default `production`),
`--generate-only` (steps 00, 10, 20, 25, 30, 32 and 35, used by `npm start` and
`npm run test:unit`), `--only <id,id>` (debugging only, never in CI),
`--preview <commit>` (preview builds), and three options of the scale of
milestone 5 (`scripts/build-scope.mjs`):

- `--pages <id,...>` (production only): step 80 compares only the live groups of
  the named pages. A local gate.
- `--docs <dir>`: the component pages are read from `<dir>/components/`, or from
  `<dir>` when it has no such directory, instead of `docs/components/`. A local
  gate, for example for a scale fixture. In a directory outside the repository a
  relative link that is not a page of the copy resolves as it would in
  `docs/components/`, where the page is written, so a copy of the pages builds as
  the repository does.
- `--defer-equivalence` (production only, not with `--pages` or `--preview`):
  every step but 80, which the equivalence shards of `guide.yml` run on this
  output. With `--docs` it builds the scale fixture the same way (see
  [Scale](#scale)); `--docs` keeps such an output not deployable. The final line adds `80-equivalence deferred to the shard
  jobs: deployable only with their merged report`.

A build limited by `--pages`, `--docs` or `--only` is not deployable: its final
line reads `not deployable (<options>)`, `src/generated/build-info.json` records
`deployable`, `notDeployable` and `scope`, its plan leaves out step 90, and step 90
refuses to run in it (`--only 90-registry-dist` included). A complete build writes
the record `<outDir>/build-info.json` (outside the deployed `dist/browser/`) with
the steps that ran; an `--only` run removes it, and `guide.yml` refuses an output
whose record is missing or not deployable. `--only` cannot be combined with the
three options. A step that fails prints
`build: <id> FAILED` with the error message, and the build exits 1. The files
of `scripts/build-steps/` must be exactly the planned steps (`PLANNED_STEPS`
in `scripts/build.mjs`): a missing planned step, a step file that is not
planned, an unknown `--only` id, or a step whose declared configurations
disagree with the plan fails the build before any step runs. The final line
lists the steps that ran; `scripts/test/build.test.mjs` asserts the plan.

| Step | Purpose |
| --- | --- |
| `00-env` | Validates `HAWIYAH_BASE_PATH`, empties the output and log directories, writes `src/generated/build-info.json` (with `deployable`, `notDeployable` and `scope`). |
| `03-lint` | Runs the CSS, template and source lint. |
| `05-registry` | Runs the registry check (strict, or preview mode in preview builds). |
| `10-features` | Writes `src/generated/features.ts`, `features.json` and `pages.json`. |
| `20-content` | Parses and checks the component Markdown, with the text gates of `scripts/content/prose.mjs` (`HWC-CLAIM`, `HWC-EMPTY`, `HWC-TODO`, `HWC-TONE`, `HWC-LIVE7` and install text in running text; they prove structure and words, not that a sentence is true) (an English page without its Arabic sibling only while `scripts/content/pending-translation.json` lists it: it gets no route, and the step prints `content: <n> pages pending translation` in every build, deployable or not; the writer of the English page adds the id and the writer of the Arabic page removes it), writes `src/generated/content/`: the page models, `loaders.ts`, `manifest.json` (read by the scripts and tests at build time only), `navigation.json` (the navigation index: id, langs, category, names, summaries and live groups of each page, read by the catalogue, the side navigation, the drawer and the editor from lazy chunks) and `routes.json` (ids and languages, read by the route matcher). The manifest carries the keyboard table of each page and language (keys and actions, read by step 80); each page model carries the data of its evidence panel (`scripts/content/evidence.mjs`: `components.json`, the Known defects of the pinned version in `CHANGELOG.md` that name the component, its documented differences, each shown under the Known defects entry its source cites, and the kinds of evidence that some built adapters have and others do not) and adds the two headings of the panel to its headings. A heading of the section Platforms Code reference that restates the panel (Evidence, Open items and the like, in both languages) fails with `HWC-H2`; a Key cell separated by anything but the comma of the page's language, an arrow cell whose forward key is not first, and an Action cell that is not one sentence fail with `HWC-KEYS` (G20 of the 5a fix round). |
| `25-examples` | Wraps, type-checks and compiles the live example groups; writes `src/generated/examples/` and `.cache/examples/`. |
| `30-api-tables` | Checks the API tables of every built page against the installed packages (`scripts/api-tables/`): the member names of each table (as a set), the kind (Vue and Angular tables), the required flag, the type and the default of every row. Types are compared in the written form of one printer, `types.mjs` (see the API tables section of `docs/components/README.md`), after normalising white space, quotes, union order and parameter names. Defaults are read from the published JavaScript: React destructuring defaults, the Vue runtime props object, Angular field initialisers in the FESM; a default that is absent, generated or computed in a body is an em dash, and so is the default of a vanilla option or stylesheet attribute unless `defaults.json` quotes a line of an installed file that sets it. A component without a vanilla controller is compared with the union of its row in the stable class and state API of the `@hawiyah/styles` README and the attribute selectors that `dist/styles.css` has on its classes (a row that names several classes of `components.json` gives an attribute or value only where `dist/styles.css` selects it on the component's class or inside it); the 26 components without a contract row need the generated note after their JavaScript table. Vue slot rows are compared with the slots the published `@hawiyah/vue` build reads (a computed slot name through `VUE_SLOT_PATTERNS` of `targets.mjs`). The lead's lists (`exclusions.json`, `defaults.json`, `TARGET_OVERRIDES`, `VUE_SLOT_PATTERNS` and `UNOWNED_EXPORTS` of `targets.mjs`, `arabic-exceptions.json`, `claim-exceptions.json`, `live-component-exceptions.json`, `marketing-terms.json`, `latin-allowlist.json`, `scripts/equivalence/keyboard-exceptions.json`; `UNOWNED_EXPORTS` and the marketing terms belong to no page) need `approvedBy` and a reason on every entry and hold at most 5 entries per page (`scripts/api-tables/lists.mjs`); `scripts/test/lead-lists.test.mjs` pins each list by the hash of its content, so the lead renews a pin with every entry. The step writes `src/generated/parity.json` with the members of all components of `components.json`, and fails when a reader cannot read a component. Its second pass is the vocabulary check (`scripts/api-tables/vocabulary.mjs`, `HWC-VOCAB`): every inline code value of a page outside the API tables (prose, lists, headings, link text, alerts, other tables and their captions) and every class, `data-hw` hook, `data-*` attribute with its value and `aria-*` attribute name of its `html` live blocks must exist in the installed packages, as the section Vocabulary of `docs/components/README.md` states (a `--hw-*` custom property that `dist/styles.css` defines or the `@hawiyah/styles` README documents by its whole name, an export of any installed package, the attribute selector of an Angular class of any component in the scope of Angular, among them), or be an entry `{ file, text, reason, approvedBy }` of `vocabulary-exceptions.json` (a lead's list; an entry that matches nothing fails); names that HTML, ARIA, the DOM, CSS and the Vue and Angular template syntax define are read from `vocabulary-allow.json` (its group of HTML elements holds the elements of the HTML Standard), each group with its specification (a list of the guide, not a lead list: an entry is a group of names of one kind with the https address of its specification, and the step and `scripts/api-tables/test/vocabulary-allow.test.mjs` fail on an entry without one). The success line states what was compared, with counts: `api-tables: <n> API tables of <m> page models, <r> rows: names, kinds, required flags, types and defaults match the installed packages (...; <d> defaults.json entries; <s> rows of components without a controller compared with the styles contract and the attribute selectors of dist/styles.css, required flags not compared there; <e> rows of exclusions.json compared by name only; Vue slots read from the published build, <p> slot patterns; <o> target overrides); parity.json: members of <c> components; vocabulary: <v> code values outside the API tables (<t> terms) and <k> classes, hooks and data attributes of html live blocks exist in the installed packages (<x> vocabulary-exceptions.json entries)`. |
| `32-install` | Writes `src/generated/install.json`. |
| `35-index-html` | Writes `src/generated/index.html` from the template with the pre-paint script. |
| `40-angular` | Runs `ng build --stats-json` with the base href, the configuration and the preview define, with `--max-old-space-size=8192` added to its `NODE_OPTIONS` unless the caller set a heap limit (one program holds every page model, listing and native example: the default heap ran out at 85 pages); saves the output to `.cache/logs/` and logs the peak memory of the ng process tree (`40-angular: peak memory <n> MB ...`, where `/proc` exists). The esbuild metafiles `browser-stats.json` and `server-stats.json` are written to `dist/` (not deployed); the step fails when a browser output has `src/generated/content/manifest.json` among its inputs (`scripts/features/bundle.mjs`). |
| `45-example-files` | Copies example payloads and downloadable sources into `<out>/browser/examples/`. |
| `50-log-scan` | Scans the `ng build` log; any warning fails the build. |
| `60-runtime` | Writes `<out>/browser/runtime/`: published, linked and bundled files, import map, manifest, fallback bundles. Checks the inputs of its esbuild runs. |
| `62-editor-runtime` | Writes `<out>/browser/runtime/compilers/`. Checks the inputs of its esbuild run. |
| `70-postbuild` | Writes `404.html`, removes `index.csr.html`, adds licences and preview files, verifies the prerendered routes. |
| `72-page-guards` | Icon and text guards over the prerendered pages and the guide sources: every `data-icon` value has a rule in the installed `@hawiyah/styles`; no `svg` element, icon-font class or emoji; on Arabic pages no run of four or more Latin-script words in reader text outside `code`, `kbd`, `pre`, `samp` and elements with their own non-Arabic `lang` (a hyphen joins the parts of one word only in an `hw-` name, such as the element `hw-mobile-top-bar` in a generated table caption, or a hyphenated name of `vocabulary-allow.json` such as `aria-label`; any other hyphenated word counts as its parts, and a hyphen or dash next to a space separates words), unless `scripts/page-guards/latin-allowlist.json` lists the whole run (12 characters at least) with a reason and `approvedBy` (an entry that matches nothing fails). |
| `75-llms` | Writes `<out>/browser/llms.txt` (production only). |
| `80-equivalence` | Runs the equivalence harness on every live group (production only); with `--pages`, on the groups of the named pages; with `--defer-equivalence` it does not run. It compares the four results at rest and after each step of the group's checks, asserts the documented outcome of each step, binds the keys of each keyboard table to the steps of the page's checks, and runs axe in every frame document at rest. |
| `90-registry-dist` | Refuses a build limited by `--pages`, `--docs` or `--only`. The registry check after the build: the inputs of the Angular metafiles, then the served runtime against a fresh derivation from the verified installed packages, and (production) the package stylesheet `styles-*.css` and its media against the bundle derived again from `@hawiyah/styles`. It prints `registry-check: RESOLVED ...`, `registry-check: DIST <n> runtime files in dist/browser equal byte for byte the files derived again from the verified packages (...)` and `registry-check: STYLES styles-<hash>.css (<n> bytes) and <m> media files in dist/browser equal byte for byte the bundle derived again from the verified @hawiyah/styles`. The step fails when the check passed without these derivations (`scripts/registry-check/test/styles.test.mjs`). |

Two rules of the steps above in detail. Step 25 refuses style attributes and
bindings with `HWC-LIVE6` (`scripts/examples/rules.mjs`), except a `style`
attribute of the `html` block whose declarations all set custom properties named
`--hw-*`, the props of a layout primitive; the attribute is parsed with postcss, and
a declaration of another property, a comment, an attribute without a declaration or
a raw colour in a value fails. Step 20 adds to the evidence panel of a page one open
item of guide text when an entry `{ component, reason, reference, approvedBy }` of
`scripts/equivalence/keyboard-exceptions.json` leaves the keyboard outcomes of the
component unchecked (`scripts/content/evidence.mjs`; the English and Arabic text is
fixed in `src/app/features/component-pages/i18n.ts`).

Step 80 can be run alone on an existing production output:
`node scripts/equivalence/run.mjs [--dir dist/browser] [--base /hawiyah/] [--only <id>/<lang>/<example>,...] [--pages <id>,...] [--shard <i>/<n>] [--report <file>] [--workers <n>] [--draft]`
(`--draft` leaves `HWE-KEYS` out, for a local run on pages whose keyboard checks
are not written, such as the scale fixture; `merge.mjs` refuses its report and
`guide.yml` never uses it).
`HAWIYAH_EQUIVALENCE_PORT` sets the port of its internal server (default: a
free port) and `--workers` or `HAWIYAH_EQUIVALENCE_WORKERS` the number of parallel
groups (a whole number from 1 to 8, default 2; a higher default needs 12 runs
under load without a failure, the standard of the measurement below). `--shard i/n`
compares shard i of n: key k of the sorted list of group keys
(`<id>/<lang>/<example>`) belongs to shard (k mod n) + 1, so the shards are a
partition of the groups. A shard writes its report to `--report` (default
`.cache/equivalence/shard-<i>-of-<n>.json`) and its diff images to
`.cache/equivalence/shard-<i>/`, so shards run one after the other keep each
other's reports. `node scripts/equivalence/merge.mjs [--manifest
src/generated/content/manifest.json] <report> ...` joins them: it fails with
`HWE-MERGE` unless the reports are the shards 1 to n of one split of the same
selection and pin, of the same content manifest as the build record (`contentManifest`), none ran with `--pages` or `--only` or failed, every group was
compared in exactly one shard, together they compared exactly the groups of
the content manifest, and every entry of `angular-hosts.json` matched an element in
the Angular result of a group of its component in one of the shards (an entry of a
component without a group whose page exists is not judged); it then
prints the summary line of a run without `--shard`.
Failures are reported with the codes `HWE-FRAME`, `HWE-STRUCT`,
`HWE-ARIA`, `HWE-SHOT`, `HWE-CHECK`, `HWE-EXPECT`, `HWE-KEYS`, `HWE-AXE`, `HWE-KD` and
`HWE-SCOPE`; the report and the diff images are written to `.cache/equivalence/`.
`HWE-STRUCT` prints one line for every difference of a pair of results, each
`<example> (<lang>, <state>) <a> and <b> differ at <path>: <a> <value>, <b> <value>`
(the wording of the first line is unchanged), at most 20 per pair in the order of
the tree, and then one line `<a> and <b>: <n> further differences not printed (at
most 20 per pair)`; the report row holds the first 20 under `differences` and the
number of the rest under `more` (`scripts/equivalence/compare.mjs`).
The report also holds, per page and language, each row of the keyboard table
with the steps that press its keys (`keyboard`), the number of asserted steps and
the number of frame documents axe checked.

Screenshots are compared with pixelmatch at threshold 0.005 (anti-aliasing
excluded) and at most `max(16, 0.05 % of the pixels)` differing pixels. 0.005 is
the lowest of 0.005 and 0.01 that stayed green in three full runs of step 80 (four
in a row). What it lets through was measured over a uniform 200 x 50 area: of the
112 hex colours of `@hawiyah/tokens`, one pair (`#b54708` and `#b54707`); a light
grey lowered by one level passes, by two fails.

The comparison does not depend on where the pointer is. Cause of the hover that
once showed in one framework only (found with probe pages outside the repository):
a result frame keeps `:hover` on the element the pointer was last over, because
Chromium sends it no mouse leave when the pointer moves out to the harness page;
when an element screenshot then scrolls the page, Chromium sends the frame that
last had the pointer a mouse move at the pointer's old place in the viewport,
which after the scroll lies over another element of that frame (or over none).
Whether that move arrives before or after the screenshot depends on the load of
the machine. In a probe page of four sandboxed frames the frame clicked last
changed its hover after every scroll (32 of 32 checks, and 96 of 96 with the CPU
slowed six times); without a scroll it never did (0 of 32). Before each frame is read, the
harness therefore moves the pointer onto that frame's left padding (where the
frame document's body lies at every height, so a later scroll maps the old place
onto the padding again), parks it in the harness page's inline padding at (4, 4),
which no frame covers at any scroll position, and waits until no element below
the body of any frame of the group matches `:hover`; a frame that still shows one
fails the step with its name. A check step that tests a hover state sets
`keepPointer` and is read as it left the pointer; the capture after such a step
fails with the same message unless the check moves the pointer away first, and
no check uses `keepPointer` today. No script test pins the clearing of the
hover: the measurement that follows is its proof. Measured after the change:
12 runs of step 80 alone while production builds of a copy of the guide ran
in a loop on the same four cores (load average 7 to 12): 12 passed; before the
change, 1 of 10 runs failed with `HWE-SHOT` at the same load (the hover of
`tabs/en/vertical` on another tab in the Vue frame).

The structure comparison (`scripts/equivalence/normalize.js`) keeps every
attribute except a short written list of framework noise, each with its
reason: Vue `data-v-*`, Angular `_ngcontent-*`, `_nghost-*`, `ng-version`,
`ng-reflect-*`, `ng-server-context`, `ngh`, `jsaction` and `data-ng*`, the
attribute-directive selectors of `@hawiyah/angular` (`hwbutton`), the static
input values Angular leaves as attributes on those elements (attributes that
the element does not reflect as a property and that are not `role`, `aria-*`
or `data-*`), and the `data-hw` hook that names a `@hawiyah/vanilla` controller.
The vanilla configuration hooks `data-hw-activation`, `data-hw-overflow` and
`data-hw-overflow-label` (named in the file, each with its reason; a script test
requires each to occur in the installed `@hawiyah/vanilla`) are left out only on
an element that no rule of the package stylesheet can select with them:
activation is compared by the Tabs checks, the overflow mode by the state the
controller writes on the tab list, and the overflow label is the accessible name
of the overflow control, which is compared where that control is rendered (not
at the one width of the harness when the tabs fit). Every other `data-hw-*`
attribute is compared, among them `data-hw-value` (the four adapters write it on
the items of a navigation list; it is left out only on a tab, `.hw-tab`, where
`createTabs` reads it as the tab's value and the React, Vue and Angular adapters
take the value as a prop and write none) and every one that a selector of the
installed `@hawiyah/styles` uses
(`scripts/equivalence/styled-attributes.mjs` reads them, with their compound
selectors, from `node_modules/@hawiyah/styles/dist/styles.css`); a script test
runs `capture()` against a stand-in page and requires that the normaliser
receives the generated-name pattern and these attributes. `class` keeps
every token but Angular's `ng-*` state classes; `style` is compared as the set
of declarations the browser parsed (each `property: value;`, with `!important`
where set, its value with white space collapsed and none next to a comma or a
parenthesis, sorted), so the order, the white space and a trailing semicolon of the
written attribute do not count and another property, value or priority fails with
`HWE-STRUCT`; `name` values are compared as written unless they have
one of the forms the four adapters generate
(`scripts/equivalence/generated-names.mjs` reads them from the installed
packages: the `ensureId` prefixes of `@hawiyah/vanilla`, the `injectId` prefixes
of `@hawiyah/angular`, React 19 `useId` and Vue `useId`, each optionally with the
prefix the adapter writes before it and a suffix of words after it); a custom
element is unwrapped only when it has no `hw-` class, carries no global
attribute with a meaning (`tabindex`, `hidden`, `inert`, `lang`, `dir`, `title`,
`contenteditable`, `draggable`, `style`, `role`, `aria-*`, `accesskey`,
`autofocus`, `popover`, `spellcheck`, `translate`) and no `data-hw-*` attribute
that the stylesheet selects (`data-hw-mode`, `data-hw-theme`, `data-hw-density`
and the others of the derived set): a wrapper or an Angular host that pins the
colour mode is compared, not unwrapped. A compared custom element has the tag
`div`, except in the Angular result, where an element that an entry of
`scripts/equivalence/angular-hosts.json` names for the group's component and that
carries an `hw-` class has the tag of the entry. Text is compared as rendered:
the text of adjacent text nodes, also of those that an unwrapped host or a
comment between them leaves side by side, is joined as written, and only then is
its white space collapsed and trimmed, so React's two text nodes `+` and `2` read
`+2`, as Vue and Angular write it, and `a ` and `b` read `a b`; text that is white
space only is dropped.
A documented difference is an
entry of `scripts/equivalence/known-differences.json` approved by the lead and
named by a group with `differences=<id>`. Its `source` reads
`CHANGELOG.md, <version>, <section>: <text of the entry>` and is checked
against `CHANGELOG.md`: the version section, the heading and the quoted text
must exist there. An entry without `ignore` leaves its
aspect (`structure`, `aria` or `screenshot`) out of the comparison of that
group. An entry of aspect `structure` may carry
`ignore: [{ "class": "hw-...", "attribute": "..." }]` instead: only that
attribute on elements with that class is left out of the structure comparison
with the JavaScript result, which does not write it, and every other difference
still fails with `HWE-STRUCT`. The React, Vue and Angular results are then also
compared with each other in full, so a wrong value in one of them is reported,
and the step fails once the JavaScript result writes the attribute, so the
entry cannot outlive the defect. Unknown fields, empty
values and `ignore` on another aspect fail with `HWE-KD`. Three narrower forms
document a designed difference of a component without a group naming it, all
lists of the lead with `component`, `reason`, `approvedBy` and a `reference`
checked against `CHANGELOG.md` or the README of the installed package it quotes
(`validateDesignedDifferences` in `run.mjs`; a malformed entry or a reference that
the file does not hold fails with `HWE-KD`):
`scripts/equivalence/empty-elements.json` leaves an element with the listed `hw-`
class out of every result's structure tree while it has no child and no text,
`scripts/equivalence/vanilla-hooks.json` leaves the listed `data-hw-*` attribute
out of the vanilla tree only, when the installed `@hawiyah/vanilla` reads it and the
stylesheet does not select it (`withoutDesigned` in `compare.mjs`), and
`scripts/equivalence/angular-hosts.json`, entries `{ component, element, tag,
reason, reference, approvedBy }`, gives the normaliser of the Angular frame of the
component's groups the tag (`span`) with which an element of the listed tag name
(`hw-avatar`) that carries an `hw-` class is compared in place of `div`: a
`@hawiyah/angular` host element that is the component, where the other adapters
render the listed tag. The attributes and children of that element, and every
other element, are compared as before. The harness records which listed elements
the Angular results hold (`hostsIn` in `run.mjs`): an entry whose element is in the
Angular result of none of the groups of its component fails with `HWE-KD`, judged
once a run has compared every group of that component. An entry of a component
without a group in the build is judged only in a run of step 80 over every live
group of the build (without `--only`, `--pages` or `--shard`, and not in
`check:page`), and fails there when `docs/components/` has no page of the
component; a page pending translation has no route and no group in the build, so
its entries are judged by `check:page`. A shard records each entry with the groups
it compared and whether the page exists, and `merge.mjs` fails with `HWE-MERGE`
when no shard found the element, unless the component has no group and its page
exists. None of the three switches off the structure comparison, and
`scripts/equivalence/test/compare.test.mjs` and `normalize.test.mjs` show a
difference outside the listed element, attribute or tag still failing.
`empty-elements.json` lists `hw-empty-icon` (EmptyState), `hw-stat-trend` (Stat),
`hw-card-header` and `hw-card-footer` (Card); `angular-hosts.json` lists
`hw-skeleton`, `hw-spinner`, `hw-badge` and `hw-avatar` (Skeleton, Spinner,
Badge, Avatar and AvatarGroup), each compared as `span`; `vanilla-hooks.json` is
empty. `known-differences.json` holds six entries, each citing the Known defects
in 0.3.0 of `CHANGELOG.md`: `tabs-bar-orientation` (`@hawiyah/vanilla` 0.3.0
creates `.hw-tab-bar` without the `data-orientation` attribute that the other
adapters write) and `progress-adapter-max` (React, Vue and Angular write `max` on
`.hw-progress` where the vanilla markup does not) ignore one attribute;
`text-field-adapter-attributes`, `service-card-angular-variant-icon`,
`stack-vue-layout-attributes` and `icon-button-adapter-markup` (React, Vue and
Angular wrap the icon of IconButton in a `span`, and Angular writes `data-shape`
and an empty `value`) leave the structure aspect out of the groups that name them.

A group names its interaction checks on its `html` block with
`check=<name>[,<name>...]` (files in `scripts/equivalence/checks/`, run one
after the other in the same frames), or declares itself `static`. Every group of
a component with a controller (a component whose page targets a controller
factory of the installed `@hawiyah/vanilla`, the scope of `HWE-KEYS` below; one
definition for both rules since G19 of the 5a fix round) names at least one check
or is `static`, otherwise
`HWE-CHECK`.

A check is `{ name, read, assert, start?, negative, steps }`; a step is `{ name,
run, expect, keys?, outcome?, reference?, keepPointer? }` (5a.8, with the chained
oracle of the 5a fix round). `read(mount)` reads what the frame shows (for Tabs:
the tabs, the selection, the shown panel, the focused tab or panel);
`assert(observed, expected, { phase })` throws with a readable message unless the
frame shows the expected state; `start(observed)` turns the read at rest into the
state the oracle starts from. `run(context)` acts in one frame; `context` holds
`mount` (the mount of the result), `dir` and `lang` of the frame, `framework`, a
per-frame scratch `state`, `expected` (the state the oracle expects before the
step), `press(locator, key)` (a key id of `KEY_NAMES` in
`scripts/content/config.mjs`, a chord joined by `+`; `null` presses on the focused
element) and `focusFrameStart()` (clicks the padding at the start of the frame
document, so that the next Tab enters the example from before it).
`expect(previous, context)` returns the state the oracle expects after the step,
computed from the state it expected before it, the frame's direction and what the
check is written for (an orientation, an activation mode); it reads nothing of the
frame. Every step has an expect; a step that presses keys declares them in `keys`,
with a one-line `outcome` and the `reference` it is taken from (the WAI-ARIA
Authoring Practices pattern, `CONTRACT.md` or `CHANGELOG.md`).
`scripts/equivalence/keys.mjs` fails a check or step without these (`HWE-KEYS`).
`negative` is `{ fixture, wrong }`: the vanilla markup of the component and a
deliberately wrong oracle (`wrong(expected)` returns another state);
`scripts/equivalence/test/negative.test.mjs` renders the fixture of every check
module with the installed `@hawiyah/vanilla` and `@hawiyah/styles` in a frame
shaped as the harness mounts a vanilla result, and requires every step to hold with
the documented oracle and every step that declares keys to fail with the wrong one
(in both directions); a check without a negative control fails there and in step
80. The Tabs checks share `read`, `start`, `assert`, `wrong` and their fixture
markup in `scripts/equivalence/checks/lib/tabs.mjs`.

In each frame the harness reads the frame once at rest, before the first step of a
check, and the oracle starts from that state; from there each step's expected state
is chained to the one before, whatever the frame shows. Before a step runs, the
frame must still show the state the oracle computed for the previous step (`assert`
with phase `before`); the step runs, and the trusted `keydown` events that a capture
listener on the frame's window recorded during it must be exactly the keys it
declares, whatever API pressed them (`HWE-CHECK`); then the expected state is
asserted through `awaitOutcome` in `run.mjs`: applied until it holds or 5 seconds
have passed, then once more after the frame rendered twice; that last application is
the verdict, so a wrong outcome fails (after the bound, `not shown within 5000 ms`)
and an outcome that is shown and then changes before the frame rendered twice
fails too (`shown, then changed`). After the last step of a check, the harness waits
500 ms (`FINAL_SETTLE`) and asserts the last expected state once more in every frame
(phase `final`). A miss is `HWE-EXPECT` with the framework, the outcome and its
reference. The step is never run again and the expected outcome is never changed.
Then the four results are compared as before.

Measured with the chained oracle (fix round of 5a): 12 runs of step 80 alone while
production builds of a copy of the guide ran in a loop on the same four cores (load
average 6.5 to 10), 12 passed, each with 62 asserted steps; the probes of the
verification of 07763ce (an outcome shown and changed 300 or 1000 ms later, an
`aria-selected` changed 300 ms later) now fail with `HWE-EXPECT`, where they passed
before.

What the wait catches: an outcome that is late but documented (shown within 5
seconds); a wrong outcome; an outcome that changes before the frame rendered twice
after it held; an outcome that changes later, before the next step of the check
starts in that frame (the before-step assertion) or, after the last step, within
500 ms. What it does not catch: a change after the last step that comes later than
500 ms; a change of focus between steps or after the last step (a frame's document
loses its focused element once another frame of the page takes the focus, so the
Tabs assertion checks focus only right after a step, and the expected tab is focused
again before the next key); a key that a capture listener on the window does not see
(an example that stops the event in a capture listener of its own registered
earlier, or a key pressed inside a nested frame of the example); and whatever the
check's `read` does not read.

Why the bounded wait (lead decision L16 of milestone 5): `@hawiyah/angular` 0.3.0
renders the state of an event in a later task than the event. Zoneless Angular 22
runs change detection in the first animation frame or 0 ms timer after the event,
while `@hawiyah/vanilla` writes `aria-selected` in the event's task and React and
Vue in its microtasks; focus moves at once in all four. A read of the frame right
after the key press is not ordered after that render, so on a loaded runner the
Angular result was read one step behind (three `HWE-EXPECT` lines in the vertical
Tabs group at 028eced, each with the selection one step behind and focus already
right). Probes outside the repository found the Angular selection correct in both
orientations and directions once rendered, and identical in the horizontal and the
vertical groups (a read in the event task and in its microtasks still shows the old
tab, a read after the first animation frame or timer the documented one); the
vertical group differs only in that its four frames do not fit the harness
viewport, so each Angular press there is preceded by a scroll of the harness page.
Measured after the change: 20 runs of step 80 alone while production builds of a
copy of the guide ran in a loop on the same four cores, 0 failures; a deliberately
wrong expectation (Up Arrow taken as next in the vertical check) failed with 16
`HWE-EXPECT` lines, in all four frameworks and both languages. `HWE-KEYS` also
binds the pages: for each component whose page targets a controller factory of
the installed `@hawiyah/vanilla` (34 ids: the 33 of the inventory and `app-shell`,
which documents `createSkipLink`), the keys of the keyboard table of each language
(from the manifest) equal the union of the keys declared by the steps of every
check that the page's groups name. `scripts/equivalence/keyboard-exceptions.json`
is the lead's list of two forms (`keyboardExceptionErrors` in
`scripts/equivalence/keys.mjs`; any other form fails with `HWE-KEYS`):
`{ component, key, reason, approvedBy }` accepts one documented key that no step
presses (a key a sandboxed frame cannot press), and
`{ component, reason, reference, approvedBy }` leaves the component out of the
binding of its table to checks. The owner's decision for the launch is keyboard
outcome checks for Tabs only; the other components with a controller take the
second form when their pages are written. Under it the page keeps its keyboard
table in both languages (missing, it fails with `HWE-KEYS`), its groups name no
check and are `static`, the reference is a sentence of the README of an installed
package (`@hawiyah/<name> README.md: "<sentence>"`) or a `CHANGELOG.md` entry, both
checked against the files, and step 80 prints `keyboard outcomes not checked: <id>`
for the page (the report lists the ids under `keyboardUnchecked`, and the check
report marks the table `not bound`). An entry of that form fails with `HWE-KEYS`
when the groups of its page name checks, when it matches no page (in a build, none
of the content manifest; in check:page, no English file of the page directory or of
`docs/components/`), when its component has no controller, or when the files do not
hold its reference; an entry of a page outside the run is otherwise not judged. The
list is empty. The Tabs groups name `tabs-keyboard` (horizontal, automatic
activation: Tab into the list, Right Arrow and Left Arrow with wrapping, Down Arrow
and Up Arrow, which a horizontal list does not handle and which keep focus and the
selection, End, Home, Tab to the panel), `tabs-keyboard-vertical` (Down Arrow and Up
Arrow; Right Arrow and Left Arrow keep focus and the selection), `tabs-activate`
(manual activation: arrow keys, End and Home move focus only, Enter and Space
select, and Tab from a tab that is not selected moves focus to the panel of the
selected tab), `tabs-click` and `tabs-disabled` (a disabled tab cannot be selected;
the group has four tabs with the second disabled, so the two reading directions
reach different tabs); the oracle of these steps and its references (the WAI-ARIA
Authoring Practices, `CONTRACT.md` with `packages/core/API.md`, and the HTML
disabled attribute; never the page) are in `scripts/equivalence/checks/lib/tabs.mjs`.
The steps added in G24 of the 5a fix round were written from these references
before they ran, and passed in all four adapters and both directions; the Tabs page
now has 82 asserted steps.

After the comparison at rest, the harness runs axe (the copy that
`@axe-core/playwright` installs, with the WCAG 2.2 AA tags of the browser tests)
in each of the four frame documents and fails with `HWE-AXE` on a violation. A
framed group (`frame` on its `html` block, 5a.9) is compared in frames 1280 px
wide; with `width=390` its results at rest are compared, and checked with axe, a
second time in frames 390 px wide (state `rest@390` in the report). A run fails with `HWE-SCOPE` when it has no group, when an
`--only` key names no group, or when `.cache/content/live-groups.json` and
`src/generated/content/manifest.json` list different groups. A passing run
ends with
`equivalence: <n> groups x 2 languages x 4 frameworks equal (<a> compared after interaction, <r> at rest only; <c> interaction checks, <s> asserted steps, <d> documented difference(s); axe clean in <f> frame documents)`.

The production output is `dist/` and the development check output is
`dist-dev/`; `dist/server/` is written by Angular and is not deployed.

The initial bundle budget in `angular.json` is 1000 kB. The content manifest
is not part of any browser output (step 40 fails otherwise): the initial bundle
holds only `routes.json` (ids and languages of the built pages), and the
navigation index is a shared lazy chunk. Every page is loaded
lazily, but `@hawiyah/angular` 0.3.0 is published as one module, so each package
component used by any page is placed in the initial script; the package
stylesheet accounts for 346 kB of the total. The budget returns to 700 kB when
the package is published with secondary entry points.

### Scale

The guide is built and tested at its final size, 85 component pages in two
languages, on a fixture: `scripts/test/scale/generate.mjs` writes it in one
process from the functions of `content:scaffold` and `content:scaffold-ar`
(83 pages: the scaffold with its four API tables from the installed packages,
a summary, one sentence per prose section and after each API table, and 6
generic static live groups, one in Example and five under Variants and states,
each a paragraph and a package Button in the four frameworks, which
`fixture.json` beside the pages declares for `HWC-LIVE7` (step 20 reads that file
only in a directory outside `docs/components/`); the Arabic page is the
placeholder sibling of `content:scaffold-ar --placeholder`), and copies the Button and
Tabs pages from `docs/components/`, so that their own browser tests and
interaction checks run. The output goes to `.cache/scale/docs/` and is not
committed; the fixture is built only through `--docs`, so its output is not
deployable and step 90 does not run. `scripts/test/scale/test/generate.test.mjs`
keeps the 85 pages passing steps 20 and 30.

```shell
node scripts/test/scale/generate.mjs
HAWIYAH_BASE_PATH=/hawiyah/ npm run build -- --docs .cache/scale/docs --defer-equivalence
node scripts/equivalence/run.mjs --shard 1/4 --draft --report .cache/equivalence/scale-shard.json
npx playwright test --project=prod --shard=1/4
```

Measured on this fixture on a machine with 4 cores (lead decision L10 of
milestone 5, each one run alone):

| Run | Time | Notes |
| --- | --- | --- |
| Production build with `--defer-equivalence` | 1 min 42 s | 170 page models, 1014 live groups, 348 prerendered pages; step 25 37 s, step 40 53 s; peak memory of step 40 5237 MB; initial bundle 824.47 kB of the 1000 kB budget; `dist/` 154 MB, of which `dist/browser/` 150 MB |
| Equivalence shard 1 of 4 | 4 min 42 s | 254 of 1014 group-languages, 2 workers |
| Browser tests shard 1 of 4 | 58 min 12 s | 1422 tests, 2 workers; above the 30 minutes of L10 |

The browser tests are the long part: the computed half of the styling rule
(`package-styles.spec.ts`) reads every property of every package element of a
page twice, in two colour modes at two widths, and most of a shard's time goes
there. The first lever is more shards. Playwright splits a suite into shards by test
count, not by time, so the shards differ widely: of eight shards at 85 pages, the
heaviest measured on this machine (shard 3 of 8: 235 tests of
`package-styles.spec.ts`, 352 of `styling-structure.spec.ts` and 167 deep-link
tests) took 26 minutes, and shard 1 of 8 took 12.6 minutes, each with 754 tests.
The heaviest shard is the one to hold under the 30 minutes of L10. The second
lever is more workers on runners
with more cores. `guide.yml` therefore runs the browser tests in eight shards
(lead decision L11 of milestone 5) and step 80, whose shard of four stays far
below 30 minutes, in four.

What the fixture exercises: steps 20, 25, 30 (API tables of all 85 components
and the vocabulary pass), 40 (memory, prerendering of 348 documents, the
initial budget), 45 to 75 (the page guards over every document), step 80 and
its shards over 1014 group-languages, and the browser suites, data-driven over
every page, with both halves of the styling rule on every prerendered page. What
it cannot show: real examples differ in size and behaviour from the generic
groups (they are static and small, so step 80 and the Angular program of a real
guide take longer and use more memory; interaction checks run only for the two
copied pilots), the prose of a generated page holds almost no code-formatted
names, its Arabic text is a placeholder, so the glossary and the Latin-script
guard see little, the keyboard rule cannot apply (the generated pages of the 32
other components with a controller have static groups and no keyboard table, so
the equivalence shards of the fixture run with `--draft`, which leaves `HWE-KEYS`
out and which `merge.mjs` refuses), step 90 does not run on a `--docs` build, and
the runners of `guide.yml` are not this machine.

### Frame fixture

`scripts/test/frame/generate.mjs` writes the pages of `docs/components/` and one
generated page of PageHeader to `.cache/frame/docs/` (not committed). PageHeader
renders an `h1` of its own, has no controller, no evidence entry in
`components.json` and a Known defects entry, so its one live group carries
`frame width=390` and its page shows the evidence panel of a component without
evidence. The fixture is built only through `--docs` (not deployable):

```shell
node scripts/test/frame/generate.mjs
HAWIYAH_BASE_PATH=/hawiyah/ npm run build -- --docs .cache/frame/docs
npx playwright test --project=prod pages/framed.spec.ts pages/evidence.spec.ts equivalence/native-vs-frame.spec.ts
```

On that build `pages/framed.spec.ts` finds exactly one `main` and one `h1` (the
guide's) in the prerendered and the hydrated brief and reference pages, the
result in a frame, axe clean, and without script the Angular listing and the
sentence and no status; `pages/evidence.spec.ts` finds the sentence that no verification
evidence is recorded; `equivalence/native-vs-frame.spec.ts` finds no native result
for the framed group and one for every other group. On the guide build the same
specs run over its pages, which have no framed group yet. Rebuild the guide
afterwards: the fixture build overwrites `dist/` and `src/generated/`.

## Continuous integration

`.github/workflows/guide.yml` builds the guide once and checks every live group
and every page of that build; nothing is cached and nothing is sampled.

- `build`: the registry check and its negative controls, the lint and its
  negative controls, the installation of Chromium, the script tests (some drive
  Chromium), the production build with
  `--defer-equivalence`, the tests of the single-page check against that build
  (`npm run test:check-page`, which writes only below `.cache/`), the list of
  the browser tests of that build
  (`playwright test --project=prod --list --reporter=json`), then the upload of
  `dist/browser/`, `dist/build-info.json`, `src/generated/`, `.cache/content/` and
  the list; then the development build check and the unit tests.
- `equivalence`, four jobs: step 80 on shard i of 4 of the uploaded build
  (`run.mjs --shard i/4`), each uploading its report.
- `e2e`, eight jobs: `playwright test --project=prod --shard=i/8` with the line
  and JSON reporters on the uploaded build, each uploading its JSON report and its
  `structure-used/` results.
- `complete` needs every other job and runs even when one failed: it fails unless
  every job passed, `node scripts/build-scope.mjs --require-deployable` accepts
  `dist/build-info.json`, `scripts/equivalence/merge.mjs` finds every group of the
  content manifest compared in exactly one shard, and `scripts/e2e/merge.mjs` finds
  every listed test passed in exactly one shard, the structural half of the styling
  rule run on every page and both opened states, and every listed declaration used.

Every job checks out `build-inputs.json` sparsely and fails when the package
sources are present (`scripts/test/build-inputs.test.mjs`);
`scripts/test/workflow.test.mjs` holds the shape above, that no job uses
`--pages`, `--docs` or `--only`, that no job or step has `continue-on-error`, and
that `complete` and each of its steps carry no `if:` other than `always()`.

## Lint

`npm run lint` reads the guide's own CSS (`src/**/*.css`), templates (inline
templates of `@Component`, `*.html` under `src/`) and sources (`src/`,
`scripts/`). It gives an early, readable message; it is not the proof that
the guide leaves package components alone. That proof is the two halves of
[The styling rule](#the-styling-rule).

- CSS: no `hw-` class, element or `data-hw-*` attribute in a selector; no
  selector that matches part of a class or id value (`[class*=`, `[class^=`,
  `[class$=`, `[class|=`); tokens instead of raw colours; logical properties,
  with no four-value side shorthand (`margin`, `padding`, `border-width`,
  `border-style`, `border-color`, `scroll-margin`, `scroll-padding`) and no
  multi-value `border-radius`; no package custom property; imports only in
  `src/styles.css`, which holds nothing but the three `@hawiyah/styles` imports
  and comments; no `url()` or `@font-face`; no `::ng-deep`; motion only
  inside a media query list whose every query has
  `(prefers-reduced-motion: no-preference)` as a plain conjunct (no `not`, no
  `or`).
- Templates: decorator metadata must be readable (an object literal without
  spread or computed keys, a `template` that is a string literal, a `host`
  object literal); no package class, `style` attribute or binding,
  `data-hw-*` hook, `innerHTML`, `ngSkipHydration`, `<script>`, `on*`
  attribute, `<style>` or stylesheet `<link>`; no class or style set through
  `host` or `@HostBinding` (`class`, `className`, `classList`, `style` and their
  `attr.` forms, also when `HostBinding`, `Component` or `Directive` is imported
  from `@angular/core` under another name).
- Sources: no server DOM shim, DOM global on the global object, platform check
  in `src/app/`, banned hydration option, unsafe HTML (`innerHTML`,
  `outerHTML`, `insertAdjacentHTML`, `setHTMLUnsafe`, `parseHTMLUnsafe`,
  `createContextualFragment`, by property or bracket access; `srcdoc` outside
  the preview frame, also through `setAttribute`), `styles` metadata, an
  `encapsulation` other than `ViewEncapsulation.Emulated` written out, or
  `ViewEncapsulation` imported under another name.

`npm run lint:negative` runs every fixture under
`scripts/lint/test/fixtures/bad/` (one per rule form) and requires exactly the
findings in its `expected.json`; the fixtures under `good/` must give none.

## Layout

| Path | Contents |
| --- | --- |
| `package.json`, `package-lock.json`, `.npmrc`, `.nvmrc` | npm project with exact versions and the committed lockfile. |
| `build-inputs.json`, `link-targets.json` | The repository paths the build reads, and the files outside them that a page may link to. |
| `angular.json`, `tsconfig*.json` | Angular CLI project `guide` (builder `@angular/build:application`, static output mode). |
| `vitest.scripts.config.ts` | Vitest configuration for `scripts/**/test/**/*.test.mjs`; its module cache is `.cache/vitest/`. |
| `playwright.config.ts` | Browser tests, projects `prod` and `dev`. |
| `src/app/core/`, `src/app/i18n/` | Locale, colour mode, links, head, route focus; shell text in Arabic and English. |
| `src/app/shell/` | Header, footer, attribution, wordmark, language link, mode switch, preview notice, minimal shell. |
| `src/app/pages/` | Root language choice and the not-found page. |
| `src/app/features/` | One folder per feature (catalogue, component pages, landing, editor, frame runtime), each with a `feature.ts` registration. |
| `src/app/content/` | Renders the content model with package components. |
| `src/app/examples/` | Example block, native result and the sandboxed example frame. |
| `src/generated/` | Output of the generation steps (ignored by Git). |
| `scripts/` | Build runner, build scope (`build-scope.mjs`), the writer's checks of one page (`check-page.mjs`, `test-page.mjs`), the scale and frame fixtures (`test/scale/`, `test/frame/`), build steps, registry check, lint, log scan, content pipeline and the page tools (`content/scaffold.mjs`, `scaffold-ar.mjs`, `sync-ar.mjs`, `api-tables.mjs`, `string-map.mjs`), example compilation, API tables (`api-tables/`: type printer, declaration and default readers, the lead's lists), fact sheets (`facts/`), runtime, page guards, equivalence and its shard merge, the merge of browser test shards (`e2e/`), install data, `llms.txt`, preview, editor compilers. |
| `tests/e2e/` | Playwright suites. |

`node_modules/`, `dist/`, `dist-dev/`, `.angular/`, `.cache/` and
`src/generated/` are build output: ignored by Git, never committed and
recreated by the build.

## Adding a component page

Component pages are generated from the Markdown in `docs/components/`; no
Angular code is written per component.

1. Confirm that the component id is in `components.json` at the repository
   root. A page is built for every `docs/components/<id>.md` whose id is listed
   there and whose Arabic sibling `<id>.ar.md` exists (`src/generated/pages.json`;
   a page pending translation is in no generated file of the build).
2. Read the fact sheet (`npm run content:facts -- <id>`, `.cache/facts/<id>.md`):
   what the installed packages declare for the component (members, the vanilla
   markup with the classes of its parts and the section of the `@hawiyah/vanilla`
   README that documents it, the fields of the item types of each adapter), and
   the READMEs of the installed packages (`node_modules/@hawiyah/*/README.md`):
   the only sources of the API it states. Start the English page with
   `npm run content:scaffold -- <id>`, which fills the four API tables.
   Write `docs/components/<id>.md` (English, no front matter) and
   `docs/components/<id>.ar.md` (Arabic) following the authoring contract in
   `docs/components/README.md`: one h1 equal to the `components.json` name
   (`labelAr` in Arabic), a one- or two-sentence summary, then the sections
   Example, Variants and states (optional), API (with JavaScript, React, Vue
   and Angular tables), Accessibility, RTL and localisation, and Platforms Code
   reference, in that order. A component with a controller has a keyboard
   table in Accessibility, written with the key element `<kbd>` from the check
   report of the checks that a check author wrote before the page (keys and
   outcome lines, printed by `check:page`); the evidence and
   the open items of the component are generated after the section Platforms Code
   reference and are not written in the page.
3. Write each live example as a group of four consecutive fenced blocks with
   the same `example=<name>`: `html`, `tsx` or `jsx`, `vue`, and
   `ts framework=angular`. Live examples in Arabic pages carry Arabic text.
4. Both files must have the same heading tree, code blocks, live groups, tables
   and alerts. Start the Arabic page with
   `npm run content:scaffold-ar -- <id> --strings <map.json>` (the Arabic text
   of each reader string of the examples) and translate the prose in place;
   after a change of the English examples or tables, `npm run content:sync-ar -- <id>`
   brings the Arabic code blocks and tables up to date. Generate the Arabic
   front matter with `npm run content:hash -- <id>` and copy the printed block to
   the top of `<id>.ar.md`; rerun it whenever the English text of a section changes.
5. While writing, after one production build
   (`HAWIYAH_BASE_PATH=/hawiyah/ npm run build`), run
   `npm run check:page -- <id>` as often as needed: it proves the page alone
   (content, compile, API tables and vocabulary, step 80 on its groups) without
   touching the build output, and prints the coverage report. When the four
   results of an example differ because an adapter renders differently, the
   example stays as it is: the page is done when `check:page` reports only the
   `HWE-STRUCT`, `HWE-ARIA` or `HWE-SHOT` lines of that difference, each matched
   in the writer's result by a proposed Known defects entry, the file and line of
   the published code that shows it and the known difference, which the lead
   records (section Who does what of `docs/components/README.md`). An English page
   may wait for its Arabic sibling only while
   `scripts/content/pending-translation.json` lists its id: the writer of the
   English page adds the id, `npm run check:page -- <id> --lang en` then passes,
   and the writer of the Arabic page removes the id with the Arabic page. The
   build gives a listed page no route and prints
   `content: <n> pages pending translation`. For the
   browser tests of an English page before its translation,
   `npm run content:scaffold-ar -- <id> --placeholder --docs <dir>` writes a
   stand-in Arabic sibling into a copy of the pages outside the repository, which
   `npm run build -- --docs <dir>` builds (not deployable); then
   `npm run test:page -- <id>`.
6. Run `HAWIYAH_BASE_PATH=/hawiyah/ npm run build`. The content, example, API
   table and equivalence steps report each failure with its code (`HWC-...`),
   file and section. `npm run build -- --pages <id>` compares only the groups of
   that page in step 80; such a build is not deployable. The pages appear at `/<lang>/components/<id>/` (brief) and
   `/<lang>/components/<id>/reference/` (reference) in both languages.
7. A reviewer who wrote neither the page nor its checks receives the pages and
   the list of changed files from the lead, reads both languages
   against the fact sheet, the check report, the installed packages and the
   other language, and returns findings (section Review of
   `docs/components/README.md`). The page is not merged before that reading.

## Preview build

The preview build shows unreleased package work in the guide without changing
the registry rule of the deployed guide.

1. At the repository root: `pnpm build:packages && pnpm check:packages`. This
   writes the seven tarballs to `.artifacts/package-check/`.
2. In `guide/`: `npm ci`, then
   `HAWIYAH_BASE_PATH=/hawiyah/ npm run preview:local`.
3. The script copies the guide to `../.artifacts/guide-preview/guide/` without
   build output, and the other files of the working tree (`git ls-files
   --cached --others --exclude-standard`, without `guide/` and `.artifacts/`)
   to `../.artifacts/guide-preview/`, so that the build steps that read the
   repository find it beside the copy. It points the copy's `@hawiyah`
   dependencies at the local tarballs, installs, confirms that the strict
   registry check rejects the copy, and builds it in preview mode. The
   repository's `package.json` and `package-lock.json` are never modified.
4. Serve the result with
   `npm run serve -- --dir ../.artifacts/guide-preview/guide/dist/browser --base /hawiyah/`.
   A preview downloaded from a workflow run is served with
   `npm run serve -- --dir <unzipped dir> --base /hawiyah/`.

Every preview page shows a notice with the first seven characters of the
commit, carries a `noindex, nofollow` robots meta, and the output contains
`preview.json` and `robots.txt`. In CI, the `guide-preview.yml` workflow
publishes the preview only as a workflow artifact; it has no path to GitHub
Pages.

## Licence

Apache License 2.0, as the rest of the repository. Licences of the bundled
third-party files are written to `dist/browser/licenses/` and
`dist/browser/NOTICE.txt` by the build.
