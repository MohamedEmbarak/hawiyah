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
- `package-lock.json` is committed and installs use `npm ci` only. Each package
  resolves to its registry tarball with a `sha512` integrity.
- `guide/` matches no glob of `pnpm-workspace.yaml` and must never be added to
  it; pnpm would otherwise link the workspace packages into the guide.
- No file in `guide/` imports, reads or copies anything from `packages/`,
  `apps/` or `examples/`.
- The registry check (`npm run check:registry`) runs before and after every
  build. It compares `package.json`, the lockfile, the registry metadata, the
  downloaded tarballs and the installed files, and finally the files the guide
  serves to its example frames. A failure stops the build.
- The guide adds no CSS or behaviour to restyle, imitate or repair a package
  component. A package defect is recorded and fixed in the package.
- No built-in string comes from the packages: every text the guide shows is in
  its own text sources, in Arabic and in English.

Unreleased package work is shown only through the preview build (see
[Preview build](#preview-build)), which cannot pass the strict registry check
and is never deployed.

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
| `npm run check:registry:negative` | `node scripts/registry-check/negative.mjs`: real negative controls on temporary copies under `.cache/negative/`. | `registry-check negative controls: 6 of 6 rejected as expected`; exit 0. |
| `npm run lint` | `node scripts/lint/cli.mjs`: CSS, template and source lint. | `lint: css 0 findings in N files; templates 0 findings in N files; sources 0 findings in N files`; exit 0. |
| `npm run lint:negative` | `node scripts/lint/negative.mjs`: bad fixtures that the lint must reject. | `lint negative controls: N of N bad fixtures rejected with the expected rule ids`; exit 0. |
| `npm run test:scripts` | `vitest run --config vitest.scripts.config.ts`: tests of the Node scripts. | Vitest summary with 0 failed; exit 0. |
| `HAWIYAH_BASE_PATH=/hawiyah/ npm run build` | `node scripts/build.mjs`: every step of the production configuration, output `dist/`. | One line per step `build: <id> ok (<ms> ms)`, then `build: production OK, <n> prerendered pages, 404.html, base /hawiyah/`; `dist/browser/index.html` contains `<base href="/hawiyah/">`; exit 0. |
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
`build: <id> FAILED` with the error message, and the build exits 1.

| Step | Purpose |
| --- | --- |
| `00-env` | Validates `HAWIYAH_BASE_PATH`, empties the output and log directories, writes `src/generated/build-info.json`. |
| `03-lint` | Runs the CSS, template and source lint. |
| `05-registry` | Runs the registry check (strict, or preview mode in preview builds). |
| `10-features` | Writes `src/generated/features.ts`, `features.json` and `pages.json`. |
| `20-content` | Parses and checks the component Markdown, writes `src/generated/content/`. |
| `25-examples` | Wraps, type-checks and compiles the live example groups; writes `src/generated/examples/` and `.cache/examples/`. |
| `30-api-tables` | Checks the API tables against the published declarations. |
| `32-install` | Writes `src/generated/install.json`. |
| `35-index-html` | Writes `src/generated/index.html` from the template with the pre-paint script. |
| `40-angular` | Runs `ng build` with the base href, the configuration and the preview define; saves the output to `.cache/logs/`. |
| `45-example-files` | Copies example payloads and downloadable sources into `<out>/browser/examples/`. |
| `50-log-scan` | Scans the `ng build` log; any warning fails the build. |
| `60-runtime` | Writes `<out>/browser/runtime/`: published, linked and bundled files, import map, manifest, fallback bundles. |
| `62-editor-runtime` | Writes `<out>/browser/runtime/compilers/`. |
| `70-postbuild` | Writes `404.html`, removes `index.csr.html`, adds licences and preview files, verifies the prerendered routes. |
| `75-llms` | Writes `<out>/browser/llms.txt` (production only). |
| `80-equivalence` | Runs the equivalence harness on every live group (production only). |
| `90-registry-dist` | Checks the served runtime files against the verified installed packages. |

Step 80 can be run alone on an existing production output while debugging:
`node scripts/equivalence/run.mjs [--dir dist/browser] [--base /hawiyah/] [--only <id>/<lang>/<example>,...]`.
`HAWIYAH_EQUIVALENCE_PORT` sets the port of its internal server (default: a
free port) and `HAWIYAH_EQUIVALENCE_WORKERS` the number of parallel groups
(default 2). Failures are reported with the codes `HWE-FRAME`, `HWE-STRUCT`,
`HWE-ARIA`, `HWE-SHOT`, `HWE-CHECK` and `HWE-KD`; the report and the diff
images are written to `.cache/equivalence/`. A documented difference is an
entry of `scripts/equivalence/known-differences.json` approved by the lead.

The production output is `dist/` and the development check output is
`dist-dev/`; `dist/server/` is written by Angular and is not deployed.

The initial bundle budget in `angular.json` is 1000 kB. Every page is loaded
lazily, but `@hawiyah/angular` 0.3.0 is published as one module, so each package
component used by any page is placed in the initial script; the package
stylesheet accounts for 346 kB of the total. The budget returns to 700 kB when
the package is published with secondary entry points.

## Layout

| Path | Contents |
| --- | --- |
| `package.json`, `package-lock.json`, `.npmrc`, `.nvmrc` | npm project with exact versions and the committed lockfile. |
| `angular.json`, `tsconfig*.json` | Angular CLI project `guide` (builder `@angular/build:application`, static output mode). |
| `vitest.scripts.config.ts` | Vitest configuration for `scripts/**/test/**/*.test.mjs`. |
| `playwright.config.ts` | Browser tests, projects `prod` and `dev`. |
| `src/app/core/`, `src/app/i18n/` | Locale, colour mode, links, head, route focus; shell text in Arabic and English. |
| `src/app/shell/` | Header, footer, attribution, wordmark, language link, mode switch, preview notice, minimal shell. |
| `src/app/pages/` | Root language choice and the not-found page. |
| `src/app/features/` | One folder per feature (catalogue, component pages, landing, editor, frame runtime), each with a `feature.ts` registration. |
| `src/app/content/` | Renders the content model with package components. |
| `src/app/examples/` | Example block, native result and the sandboxed example frame. |
| `src/generated/` | Output of the generation steps (ignored by Git). |
| `scripts/` | Build runner, build steps, registry check, lint, log scan, content pipeline, example compilation, API tables, runtime, equivalence, install data, `llms.txt`, preview, editor compilers. |
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
