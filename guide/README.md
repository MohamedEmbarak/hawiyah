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
  tests the guide from a sparse checkout that holds only `guide/`, `docs/`,
  `components.json`, `NOTICE`, `CHANGELOG.md` and `pnpm-workspace.yaml` (every
  input of the build and its tests, and the path filters of the workflow), and fails if
  `packages/`, `apps/` or `examples/` exist; a read of them fails on the
  runner. The registry check (HWREG-R6) adds an early, readable message for a
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
  manifest are not trusted. A failure stops the build.
- The guide adds no CSS or behaviour to restyle, imitate or repair a package
  component. A package defect is recorded and fixed in the package (see
  [The styling rule](#the-styling-rule)).
- No built-in string comes from the packages: every text the guide shows is in
  its own text sources, in Arabic and in English.

Unreleased package work is shown only through the preview build (see
[Preview build](#preview-build)), which cannot pass the strict registry check
and is never deployed.

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
`@hawiyah/styles` imports (bundle `styles-*.css`), and the guide's document
rules are in `src/guide.css` (bundle `guide-*.css`). The proof is the outcome
test `tests/e2e/pages/package-styles.spec.ts`: on every prerendered page, in
both colour modes and at 1280 and 390 px (the editor after its first run), it
reads the computed appearance properties (display, wrapping and white space,
colours, backgrounds, borders, radii, padding, font properties, line height,
text decoration, box shadow, opacity, outline) of every element with an `hw-`
class or tag, once with every stylesheet on and once with every stylesheet,
style element and adopted sheet disabled except the package bundle, and
requires them to be equal. Placement properties are not compared (a fixed list
in the test, each with its reason): margins, sizes, position, flex and grid
item properties, `text-align` and `visibility`. Two consequences of placement
are judged by rule: the blockified `display` of an item of a guide flex or grid
container, and colours that follow `currentColor`. An inherited difference that
starts at a guide element is accepted only when every guide declaration of that
property there is a package token (today: `color` and `font-family` on `html`
in `src/guide.css`). The test prints how many elements and properties it
compared per page.

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

Messages of a run: `ready`, `error`, `navigation` and `submit` are always
accepted; console output and height reports each have a budget of 500 messages
per run. Console messages past the budget are counted, and the editor shows
the count in one log entry per run, updated at most four times a second.

## Editor

The editor (`src/app/features/editor/`) shows, in the order of the document at
every width: the toolbar with Run, the status line, the code, the result and
the log. The status line (`role="status"`) is the one live region of a run's
outcome; the log (`role="log"`, `aria-live="off"`) is read, not announced; the
notice under the frame (`role="status"`, in the document and empty until it has
text) announces only a link or a form of the example that did not leave the
preview, with the address shown left to right in a `bdi` element.

A run fails at once, with the message of its cause, when the code throws, when
an Angular template does not compile (the generated `main.ts` lets the
rejected bootstrap reach the frame as an unhandled rejection), when the code
tries to navigate the frame, and when the code replaces the frame's document
(a repeated load of the frame after which the bootstrap does not post again
within 3 seconds); a run that is not ready within 20 seconds fails with the
time limit. Compile errors carry the file, line and column of the file the
reader wrote, also for a script error of a Vue file and for an import the
editor does not serve. A compile request that takes longer than 60 seconds
stops the compile worker, fails the run with that message, and the next
request creates a new worker.

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
| `npm run test:scripts` | `vitest run --config vitest.scripts.config.ts`: tests of the Node scripts. | Vitest summary with 0 failed; exit 0. |
| `HAWIYAH_BASE_PATH=/hawiyah/ npm run build` | `node scripts/build.mjs`: every step of the production configuration, output `dist/`. | One line per step `build: <id> ok (<ms> ms)`, then `build: production OK, <n> prerendered pages, 404.html, base /hawiyah/, 19 steps: <ids of the steps that ran>`; `dist/browser/index.html` contains `<base href="/hawiyah/">`; exit 0. |
| `npm run build:dev-check` | Development build into `dist-dev/` under `/hawiyah/`, then `playwright test --project=dev`. | `build: development OK ...`, `log-scan: 0 findings (development)`, Playwright `N passed`; exit 0. |
| `npm run scan:log -- .cache/logs/build-production.log` | Scans a saved build log. | `log-scan: 0 findings (production)`; exit 0. A finding prints `log-scan: <rule id> line <n>: <text>` and exits 1. |
| `npm run test:unit` | Generation steps, then `ng test --no-watch` (Vitest with jsdom). | Vitest summary with 0 failed; exit 0. |
| `npm run test:e2e` | `playwright test --project=prod` against `dist/browser` served under `/hawiyah/`. Requires a prior production build with `HAWIYAH_BASE_PATH=/hawiyah/`. | `N passed` with 0 failed and 0 flaky; exit 0. Output goes to `GUIDE_TEST_OUTPUT` or `<os tmpdir>/hawiyah-guide-e2e`, never into the repository. |
| `npm run serve` | `node scripts/serve.mjs [--dir dist/browser] [--base /hawiyah/] [--port 4300]`. | `serve: http://127.0.0.1:4300/hawiyah/ -> dist/browser`; the process stays up. |
| `npm start` | Generation steps, then `ng serve` (development server, base `/`). | The Angular development server prints its URL; pages render with server rendering in development. |
| `npm run content:hash -- <id> [--docs <dir>]` | Prints the YAML front matter block of section hashes for `docs/components/<id>.ar.md`; edits nothing. | A `---` delimited YAML block with the key `source` and one entry per section id. |
| `npm run preview:local` | `node scripts/preview/build-preview.mjs`: preview build from local tarballs. Requires `pnpm build:packages && pnpm check:packages` at the repository root first. | `preview: built from local tarballs at commit <sha7> in ../.artifacts/guide-preview/guide/dist/browser`; exit 0. |

`HAWIYAH_BASE_PATH` must start and end with `/` (default `/`). The deployed
guide and its checks use `/hawiyah/`.

## Build steps

`scripts/build.mjs` runs the steps in `scripts/build-steps/` in order. Options:
`--configuration production|development` (default `production`),
`--generate-only` (steps 00, 10, 20, 25, 30, 32 and 35, used by `npm start` and
`npm run test:unit`), `--only <id,id>` (debugging only, never in CI) and
`--preview <commit>` (preview builds). A step that fails prints
`build: <id> FAILED` with the error message, and the build exits 1. The files
of `scripts/build-steps/` must be exactly the planned steps (`PLANNED_STEPS`
in `scripts/build.mjs`): a missing planned step, a step file that is not
planned, an unknown `--only` id, or a step whose declared configurations
disagree with the plan fails the build before any step runs. The final line
lists the steps that ran; `scripts/test/build.test.mjs` asserts the plan.

| Step | Purpose |
| --- | --- |
| `00-env` | Validates `HAWIYAH_BASE_PATH`, empties the output and log directories, writes `src/generated/build-info.json`. |
| `03-lint` | Runs the CSS, template and source lint. |
| `05-registry` | Runs the registry check (strict, or preview mode in preview builds). |
| `10-features` | Writes `src/generated/features.ts`, `features.json` and `pages.json`. |
| `20-content` | Parses and checks the component Markdown, writes `src/generated/content/`. |
| `25-examples` | Wraps, type-checks and compiles the live example groups; writes `src/generated/examples/` and `.cache/examples/`. |
| `30-api-tables` | Checks the API tables against the published declarations: the member names of each table (as a set), the kind (Vue and Angular tables) and the required flag (not for stylesheet-contract tables of components without a controller). The Type and Default columns are not compared yet (first stage of milestone 5). The success line says so: `<n> API tables of <m> page models: member names, kinds (Vue and Angular tables) and required flags match the declarations (...); Type and Default columns are not compared`. |
| `32-install` | Writes `src/generated/install.json`. |
| `35-index-html` | Writes `src/generated/index.html` from the template with the pre-paint script. |
| `40-angular` | Runs `ng build --stats-json` with the base href, the configuration and the preview define; saves the output to `.cache/logs/`. The esbuild metafiles `browser-stats.json` and `server-stats.json` are written to `dist/` (not deployed). |
| `45-example-files` | Copies example payloads and downloadable sources into `<out>/browser/examples/`. |
| `50-log-scan` | Scans the `ng build` log; any warning fails the build. |
| `60-runtime` | Writes `<out>/browser/runtime/`: published, linked and bundled files, import map, manifest, fallback bundles. Checks the inputs of its esbuild runs. |
| `62-editor-runtime` | Writes `<out>/browser/runtime/compilers/`. Checks the inputs of its esbuild run. |
| `70-postbuild` | Writes `404.html`, removes `index.csr.html`, adds licences and preview files, verifies the prerendered routes. |
| `72-page-guards` | Icon and text guards over the prerendered pages and the guide sources: every `data-icon` value has a rule in the installed `@hawiyah/styles`; no `svg` element, icon-font class or emoji; on Arabic pages no run of four or more Latin-script words in reader text outside `code`, `kbd`, `pre`, `samp` and elements with their own non-Arabic `lang`, unless `scripts/page-guards/latin-allowlist.json` lists it with a reason (an entry that matches nothing fails). |
| `75-llms` | Writes `<out>/browser/llms.txt` (production only). |
| `80-equivalence` | Runs the equivalence harness on every live group (production only). |
| `90-registry-dist` | The registry check after the build: the inputs of the Angular metafiles, then the served runtime against a fresh derivation from the verified installed packages. It prints `registry-check: RESOLVED ...` and `registry-check: DIST <n> runtime files in dist/browser equal byte for byte the files derived again from the verified packages (...)`. |

Step 80 can be run alone on an existing production output while debugging:
`node scripts/equivalence/run.mjs [--dir dist/browser] [--base /hawiyah/] [--only <id>/<lang>/<example>,...]`.
`HAWIYAH_EQUIVALENCE_PORT` sets the port of its internal server (default: a
free port) and `HAWIYAH_EQUIVALENCE_WORKERS` the number of parallel groups
(default 2). Failures are reported with the codes `HWE-FRAME`, `HWE-STRUCT`,
`HWE-ARIA`, `HWE-SHOT`, `HWE-CHECK`, `HWE-KD` and `HWE-SCOPE`; the report and the diff
images are written to `.cache/equivalence/`.

Screenshots are compared with pixelmatch at threshold 0.02 (anti-aliasing
excluded) and at most `max(16, 0.05 % of the pixels)` differing pixels; 0.02 was
green in three full runs in a row, and an adjacent step of a colour scale over
an area now fails.

The structure comparison (`scripts/equivalence/normalize.js`) keeps every
attribute except a short written list of framework noise, each with its
reason: Vue `data-v-*`, Angular `_ngcontent-*`, `_nghost-*`, `ng-version`,
`ng-reflect-*`, `ng-server-context`, `ngh`, `jsaction` and `data-ng*`, the
attribute-directive selectors of `@hawiyah/angular` (`hwbutton`), the static
input values Angular leaves as attributes on those elements (attributes that
the element does not reflect as a property and that are not `role`, `aria-*`
or `data-*`), and the `data-hw`/`data-hw-*` enhancement hooks of
`@hawiyah/vanilla`, whose behaviour the group's checks compare. `class` keeps
every token but Angular's `ng-*` state classes; `style` is compared as the
browser serialises it; `name` values are compared as written unless they look
generated (React `useId`, numbered `hw-...-<n>`); a custom element is
unwrapped only when it has no `hw-` class and carries no `role` or `aria-*`.
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
values and `ignore` on another aspect fail with `HWE-KD`. The only entry is
`tabs-bar-orientation`: `@hawiyah/vanilla` 0.3.0 creates `.hw-tab-bar` without
the `data-orientation` attribute that the other adapters write (CHANGELOG.md,
Known defects in 0.3.0).

A group names its interaction checks on its `html` block with
`check=<name>[,<name>...]` (files in `scripts/equivalence/checks/`, run one
after the other in the same frames), or declares itself `static`. Every group of
a component with a controller (`sourceType: "interactive"` in
`components.json`) names at least one check or is `static`, otherwise
`HWE-CHECK`. The Tabs groups name `tabs-keyboard` and, where their text
describes it, `tabs-click`, `tabs-activate` (manual activation: arrow keys move
focus only, Enter and Space select) and `tabs-disabled` (a disabled tab cannot
be selected). A run fails with `HWE-SCOPE` when it has no group, when an
`--only` key names no group, or when `.cache/content/live-groups.json` and
`src/generated/content/manifest.json` list different groups. A passing run
ends with
`equivalence: <n> groups x 2 languages x 4 frameworks equal (<a> compared after interaction, <r> at rest only; <c> interaction checks, <d> documented difference(s))`.

The production output is `dist/` and the development check output is
`dist-dev/`; `dist/server/` is written by Angular and is not deployed.

The initial bundle budget in `angular.json` is 1000 kB. Every page is loaded
lazily, but `@hawiyah/angular` 0.3.0 is published as one module, so each package
component used by any page is placed in the initial script; the package
stylesheet accounts for 346 kB of the total. The budget returns to 700 kB when
the package is published with secondary entry points.

## Lint

`npm run lint` reads the guide's own CSS (`src/**/*.css`), templates (inline
templates of `@Component`, `*.html` under `src/`) and sources (`src/`,
`scripts/`). It gives an early, readable message; it is not the proof that
the guide leaves package components alone. That proof is a test on the
outcome (see [The styling rule](#the-styling-rule)): with the guide
stylesheets disabled, the computed appearance of every `hw-` element stays the
same.

- CSS: no `hw-` class, element or `data-hw-*` attribute in a selector; no
  selector that matches part of a class or id value (`[class*=`, `[class^=`,
  `[class$=`, `[class|=`); tokens instead of raw colours; logical properties,
  with no four-value side shorthand (`margin`, `padding`, `border-width`,
  `border-style`, `border-color`, `scroll-margin`, `scroll-padding`) and no
  multi-value `border-radius`; no package custom property; imports only in
  `src/styles.css`; no `url()` or `@font-face`; no `::ng-deep`; motion only
  inside a media query list whose every query has
  `(prefers-reduced-motion: no-preference)` as a plain conjunct (no `not`, no
  `or`).
- Templates: decorator metadata must be readable (an object literal without
  spread or computed keys, a `template` that is a string literal, a `host`
  object literal); no package class, `style` attribute or binding,
  `data-hw-*` hook, `innerHTML`, `ngSkipHydration`, `<script>`, `on*`
  attribute, `<style>` or stylesheet `<link>`; no class or style set through
  `host` or `@HostBinding`.
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
| `scripts/` | Build runner, build steps, registry check, lint, log scan, content pipeline, example compilation, API tables, runtime, page guards, equivalence, install data, `llms.txt`, preview, editor compilers. |
| `tests/e2e/` | Playwright suites. |

`node_modules/`, `dist/`, `dist-dev/`, `.angular/`, `.cache/` and
`src/generated/` are build output: ignored by Git, never committed and
recreated by the build.

## Adding a component page

Component pages are generated from the Markdown in `docs/components/`; no
Angular code is written per component.

1. Confirm that the component id is in `components.json` at the repository
   root. A page is built for every `docs/components/<id>.md` whose id is listed
   there (`src/generated/pages.json`).
2. Write `docs/components/<id>.md` (English, no front matter) and
   `docs/components/<id>.ar.md` (Arabic) following the authoring contract in
   `docs/components/README.md`: one h1 equal to the `components.json` name
   (`labelAr` in Arabic), a one- or two-sentence summary, then the sections
   Example, Variants and states (optional), API (with JavaScript, React, Vue
   and Angular tables), Accessibility, RTL and localisation, and Platforms Code
   reference, in that order.
3. Write each live example as a group of four consecutive fenced blocks with
   the same `example=<name>`: `html`, `tsx` or `jsx`, `vue`, and
   `ts framework=angular`. Live examples in Arabic pages carry Arabic text.
4. Both files must have the same heading tree, code blocks, live groups, tables
   and alerts. Generate the Arabic front matter with
   `npm run content:hash -- <id>` and copy the printed block to the top of
   `<id>.ar.md`; rerun it whenever the English text of a section changes.
5. Run `HAWIYAH_BASE_PATH=/hawiyah/ npm run build`. The content, example, API
   table and equivalence steps report each failure with its code (`HWC-...`),
   file and section. The pages appear at `/<lang>/components/<id>/` (brief) and
   `/<lang>/components/<id>/reference/` (reference) in both languages.

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
