# Validation record

This record covers the Nasaq `0.1.0` library development snapshot checked on **2026-10-29**. It distinguishes source coverage, targeted behavior tests, package-consumer checks, and browser evidence. A passing check applies to its stated scope; it is not a declaration of complete accessibility, DGA compliance, or production certification.

## Environment

| Tool | Tested version or configuration |
|---|---|
| Node.js | `24.19.0` |
| pnpm | `11.25.0`, pinned in the workspace |
| TypeScript | Workspace TypeScript 6 toolchain |
| React / React DOM | `19.3.1` |
| Vue / server renderer | `3.5.44` |
| Angular | `22.2.3`, library packaged through `ng-packagr` |
| Browser | Chromium on Linux; browser tests use the configured executable |

These exact versions were exercised. Declared peer ranges are broader than a single run and should not be read as a fully tested version matrix.

## Recorded checks

| Check | Result | Scope |
|---|---|---|
| `pnpm build:packages` | Passed | All seven packages, including Angular Package Format output |
| `pnpm build` | Passed | Seven packages and four Vite application builds: vanilla playground, React, Vue, and Angular examples |
| Playground TypeScript check | Passed | Run inside `pnpm build`; also available through `pnpm typecheck:playground` |
| `pnpm test` | Passed | 8 token-contrast checks and 142 Vitest tests across 21 files, including calendar reference conversion and focused React/Vue hydration cases |
| `pnpm test:browser` | Passed: 67 tests | 17 original, 10 expansion, 3 component-reference, 5 guide-experience, 5 editor, 3 RTL-icon, 2 hero-control 12 mobile-navigation, 8 DGA-template and 2 DGA-theme tests: vanilla journeys, selected component behavior, calendar switching, input/layout labs, responsive layout, wordmark-loader reduced motion, and scoped axe scans in Chromium |
| `pnpm check:packages` | Passed | Seven local tarballs installed in an isolated consumer; ESM imports, canonical calendar conversion, React/Vue Button and DatePicker/Grid SSR, Angular APF import, split CSS and bundled wordmark/GIF asset exports, TypeScript consumers, calendar-data license, and two minimal-import bundle budgets |
| React example browser suite | Passed: 2 tests | Conditional service application, modal review/focus, local request state, independent preferences, narrow Arabic layout, and selected axe scans |
| Angular example browser script | Passed | Native form/Angular forms integration, Arabic combobox, conditional application, modal/Escape/focus, local request state, RTL, theme change, and mobile layout |
| Vue example session browser check | Passed | Full local service flow, review/focus, request filtering/pagination/reset, mobile Arabic dark mode, 1280/832/416/32 desktop geometry and four selected axe scans; session check, not an additional committed browser suite |
| Framework calendar browser script | Passed for React, Vue, and Angular | Calendar switching, canonical labels, keyboard selection, reopening, invalid-range submission, responsive RTL/dark layout, and scoped axe scans |
| Browser-test TypeScript check | Passed | Root browser test source type checking |

The refreshed guide's **67 root browser cases** passed in one complete run. The
[component-reference tests](../tests/browser/guide.spec.ts) cover setup navigation,
all 77 references, reset/remount and narrow RTL accessibility. Five
[guide-experience tests](../tests/browser/guide-experience.spec.ts) cover Arabic
as the default, persisted English preference, the white transparent dark logo,
keyboard search and mobile navigation focus. Five
[editor tests](../tests/browser/component-ide.spec.ts) cover HTML/CSS/JavaScript
editing, automatic/manual updates, error recovery, reset, real enhancement,
iframe isolation, CSP blocking, Arabic editor search, keyboard navigation,
mobile layout, draft preservation through shell redraws and custom themes. Three [directional-icon tests](../tests/browser/rtl-icons.spec.ts) cover forward/back arrows, nested RTL/LTR regions and working carousel navigation while non-directional symbols remain unchanged. Two [hero-control tests](../tests/browser/hero-controls.spec.ts) verify touch/keyboard changes, switch-thumb containment in both directions and modes, and preservation of unsaved input when opening the menu. Twelve [mobile-navigation cases](../tests/browser/mobile-navigation.spec.ts) verify full viewport bounds, real pointer targets, scrolling, focus, same-route close and navigation at 390px, 820px and 900px in both languages and themes.

Eight [DGA-template tests](../tests/browser/dga-templates.spec.ts) cover local application validation/review/confirmation, draft retention through language and mode changes, FAQ filtering, feedback, cookie preferences, mobile navigation/reflow and keyboard visibility of clipped tabs in both directions. Two [DGA-theme tests](../tests/browser/dga-theme.spec.ts) cover the fresh DGA default, nested legacy/custom themes and dark surfaces, explicit legacy preferences, stable input geometry on focus, and reduced motion. Finish package builds before browser testing to avoid Vite reloads during an active scenario.

Production template checks covered service, form and gallery in four locale/mode/viewport combinations, plus 13 other templates in English/dark at 320px and Arabic/light at 1440px. Initial findings in accessible brand names, heading order and the preview toolbar landmark were corrected. The final 16-case audit covered service, form, gallery and support in English/light and Arabic/dark at 320px, plus English/dark and Arabic/light at 1440px: no axe violations, viewport overflow or runtime errors in those cases. Keyboard-selected tabs remained fully visible in both directions, and service/form sidebars matched the 416px desktop column without duplicate framing. Selected revealed and success states were also scanned. These are scoped automated checks, not exhaustive visual parity or a manual assistive-technology audit.

The guide production build passed with the `/nasaq/` GitHub Pages base path.
All 77 Arabic component examples initialized inside the production editor's
sandbox without runtime errors or failed resource responses. Scoped Chromium
axe scans passed in light/dark and Arabic/English views; these automated checks
do not replace manual screen-reader testing. The Arabic content audit covered
77 component pages, 12 articles and nine guide/example routes. Both standalone
brand guides were checked at desktop and mobile widths. Additional narrow (320×568) and landscape (844×390) drawer checks and production touch checks passed. Current screenshots
are under [previews](previews/).

All seven packages were rebuilt for the refreshed guide, and the playground
TypeScript check passed. The editor loads on demand and adds no dependency to
the published-library package manifests. Its complete runtime license notices
are collected from the installed dependency graph and included in the deployed
guide, together with the calendar-data and font notices.

For this DGA migration, all four application builds, 142 unit tests, eight
contrast checks and seven packed-consumer checks passed. Tokens, shared styles,
framework examples and the vanilla Tabs keyboard-reveal behavior were updated. Package
archives include Apache-2.0 LICENSE and NOTICE files, and fonts/calendar data
retain their original notices.

The package-consumer script packs files locally and performs no publication. Its Angular import check loads the compiler for the consumer smoke test; it is not a production Angular AOT application build.

The subsequent input-focus refinement removed the duplicate outer ring from DGA fields. The Pages-base guide build and two focused theme browser tests passed. A production browser check covered 36 field/theme/mode combinations (text, select, textarea, read-only, filled and invalid fields across DGA/custom/Nasaq and light/dark), plus the forced-colors fallback, without field-size changes. Compound tag/search fields use a single inset indicator.

## Representative bundle checks

The isolated tarball consumer builds two minimal ESM imports with Vite, minification, and gzip. Both passed their configured size budgets and output guards for unrelated widget markers:

| Import | Measured JavaScript gzip | Budget |
|---|---:|---:|
| React `Button` | 380 bytes | 4,096 bytes |
| Vanilla `createTabs` | 2,089 bytes | 6,144 bytes |

The React build leaves React/React DOM external. These numbers exclude framework runtime, CSS, tokens, fonts, images, and application code; they are not complete download sizes or general performance guarantees. The output guards check the configured unrelated Dialog/Combobox/Tabs markers for the React import and Combobox/Tooltip markers for the vanilla import. Other components and combinations have not received individual budgets.

## Unit and server-rendering scope

| Area | Tests | Evidence |
|---|---|---|
| Tokens | 3 | Default/custom DGA values, explicit legacy theme foundation metrics, source mappings and caller overrides |
| Core | 17 | Arabic search/digit normalization, navigation, explicit formatting, combobox transitions, cleanup, ordered ranges, stable sorting, calendar limits and labels, and the independent reference oracle |
| Vanilla | 41 | Native forms and cleanup; tabs, combobox, modal, tooltip, pagination, expanded input controls, popover/menu/toasts, toggle groups, feedback/consent, tree, carousel, sorting, Calendar/DatePicker, and imports without browser globals |
| React | 34 | Initial form/interaction cases and focused hydration; expanded form/reset behavior, calendars and unsupported-date validity, menu/popover/tree, sorting, notifications/consent/feedback, all 77 entries server-rendered, and layout variable assertions |
| Vue | 28 | Initial forms/interaction and focused hydration; expanded input/reset/readonly cases, file rejection, calendars and controlled calendar-policy/error associations, overlays/tree, sorting/platform actions, and server-rendered layout variables |
| Angular | 19 | Initial forms/combobox/tabs; expanded CVAs and form reset, repeated values, range constraints, calendar/date-picker switching and reactive/template validation, menu/tree, stable sorting, and layout variables |

Sources: [core tests](../packages/core/test/core.test.ts), [vanilla behavior](../packages/vanilla/test/vanilla.test.ts), [vanilla server imports](../packages/vanilla/test/ssr.test.ts), [React behavior](../packages/react/react.interaction.test.tsx), [React server rendering](../packages/react/react.ssr.test.tsx), [Vue behavior](../packages/vue/test/components.test.ts), [Vue server rendering](../packages/vue/test/ssr.test.ts), and [Angular behavior](../packages/angular/test/components.test.ts).

Expansion sources: [core helpers](../packages/core/test/expansion.test.ts), [calendar oracle](../packages/core/test/calendar-oracle.test.ts), vanilla [controls](../packages/vanilla/test/controls.test.ts), [calendars](../packages/vanilla/test/calendar.test.ts), and [content](../packages/vanilla/test/content.test.ts); React [behavior](../packages/react/react.expansion.test.tsx) and [SSR/layout](../packages/react/react.expansion.ssr.test.tsx); Vue [behavior/layout](../packages/vue/test/expansion.test.ts) and [calendar policy](../packages/vue/test/datepicker-policy.test.ts); Angular [expansion behavior/forms](../packages/angular/test/expansion.test.ts).

The calendar oracle checks **55,991 supported days**, matching the pinned Python HijriDate conversion digest and every reverse conversion. This establishes agreement with that reference dataset. It does not certify agreement with the latest live official KACST service, which was not bulk-verified. [Calendar reliability](date-calendars.md) documents provenance, hard bounds, historical/future limitations, and why generic host `Intl` conversion is not the canonical source.

The [React hydration case](../packages/react/react.hydration.test.tsx) and [Vue hydration case](../packages/vue/test/hydration.test.ts) render server markup, hydrate it, verify stable accessible IDs and retained server DOM, check the absence of mismatch/recovery warnings, and exercise RTL Tabs and Combobox selection after hydration. They include Field/TextField and a closed Dialog. They establish those cases on the tested versions, not every component state, framework integration, or native modal lifecycle during hydration.

Targeted DatePicker regressions also assert canonical selected-date output while the popup is closed: associations with the native input/help text, calendar switching without rewriting ISO values, and hiding unavailable output for empty or unsupported values. Vanilla additionally checks typed-input updates and native form reset.

DOM-based unit and hydration tests use a simulated DOM. Dialog methods are mocked where that environment lacks native modality; real browser checks provide the complementary modal/focus evidence.

## Playground browser matrix

The [original 17-test suite](../tests/browser/playground.spec.ts) exercises three product journeys: service discovery, a conditional application with review and local completion, and request management with filtering, selected-record export, and actionable detail. It also directly checks RTL Tabs, explicit Combobox commitment, native modal focus containment/restoration, and Tooltip focus/hover/Escape behavior.

Layout checks cover **32 route/configuration combinations**: eight routes (`overview`, `foundations`, `components`, `discover`, `apply`, `workspace`, `docs`, and `brand`) at 1440 and 390 CSS pixels, in English/light/LTR and Arabic/dark/RTL. These checks assert no horizontal document overflow and exercise mobile navigation. They do not exhaust every language, theme, density, viewport, or mixed-direction configuration.

The suite performs **eight axe scans**: `overview`, `components`, `apply`, and `workspace`, each in English/light and Arabic/dark. It uses the WCAG 2 A/AA, 2.1 A/AA, and 2.2 AA tags and reported no violations in those evaluated states. These scans use the Nasaq theme and the default density. They do not constitute a complete WCAG audit or assess every interactive state.

The [ten expansion tests](../tests/browser/expansion.spec.ts) assert 77 live catalog recipes, selected input/form behavior, native DatePicker calendar switching and unsupported-date validity, menu/tree/carousel/sorting/feedback interactions, responsive layout editing, and the 22 native input types with local validation/reset. They also verify that the Arabic wordmark GIF loads, reduced-motion preference selects static SVG artwork, and no Aref Ruqaa font request is made. Four mobile cases cover `layouts` and `inputs` at 390 CSS pixels in English/light and Arabic/dark, each with an axe scan. A fifth expansion scan evaluates the open date-picker dialog. Together the root suites include **13 scoped axe scans**, plus the separately recorded framework scans.

The [three-framework calendar script](../tests/browser/framework-calendars.mjs) checks React, Vue, and Angular examples in Chromium at 1280 and 390 CSS pixels. It asserts native modal state, unchanged ISO values on switching, canonical displayed labels, keyboard date selection, reopening at the selection, unsupported-Hijri submission blocking and Gregorian recovery, two-column to one-column layout, no page overflow, and no page errors. Its three axe scans target only the calendar showcase using WCAG 2 A/AA tags. These are focused browser scenarios, not framework-wide accessibility or hydration audits.

## Token contrast scope

The [eight token checks](../packages/tokens/test/contrast.test.mjs) evaluate selected foreground/background pairs in Nasaq and DGA reference themes, in light and dark modes. They assert 4.5:1 for the named text/status pairs and 3:1 for the named control/focus boundaries. Semi-transparent status backgrounds are composited over both canvas and surface. This validates the named pairings, not arbitrary custom overrides or all visual compositions. Source-token correspondence is documented separately in the [DGA reference](dga-reference.md).

## Component catalog interpretation

[components.json](../components.json) lists all **77 entries** as built in all four adapters. A component's `verified` array is narrower: it identifies adapters with direct behavior, semantic-association, or layout-contract assertions mapped in that component's `evidence`. Rendering-only checks and broad journey scans are recorded at the suite level rather than used to mark every component behavior verified. An empty array means no direct component evidence is recorded there; it does not mean the source is absent. No full variant, native-input/browser, or component-by-framework state matrix is implied.

## Reproduce the checks

From the project directory, using the pinned pnpm version:

```sh
pnpm install
pnpm build
pnpm typecheck:playground
pnpm test
pnpm test:browser
pnpm check:packages
```

The root and framework browser configurations use `NASAQ_CHROMIUM` when supplied, otherwise `/usr/bin/chromium` if available, otherwise Playwright's managed Chromium. If neither is installed, install the managed browser with `pnpm exec playwright install chromium`. To select an existing executable in a POSIX shell:

```sh
NASAQ_CHROMIUM=/path/to/chromium pnpm test:browser
```

The separate committed framework browser checks are:

```sh
pnpm exec playwright test --config examples/react/playwright.config.ts
pnpm --filter @nasaq/example-angular test:browser
node tests/browser/framework-calendars.mjs
```

The calendar script accepts an optional `react`, `angular`, or `vue` argument. Run it after package builds; it starts local example servers when needed. `pnpm check` groups build, unit/token, and root browser checks; the isolated package check and separate framework browser commands remain explicit. Re-run relevant checks after implementation changes and update the evidence rather than treating this snapshot as permanent.

## Remaining evaluation

Firefox and WebKit have not been covered by these runs. Manual screen-reader testing, a complete keyboard/accessibility audit, exhaustive mode/theme/density combinations, and a broader framework-version matrix remain open. Angular production AOT consumer integration and Angular SSR/hydration are not established. React/Vue hydration coverage is limited to the focused cases described above. The [DGA reference](dga-reference.md) records reviewed source mappings and accessibility adaptations. Six oversized Figma exports and the missing standalone web Components Library remain unverified; exhaustive template parity, live official-version checking and asset redistribution permissions remain separate work in [alignment](alignment.md).

These checks describe this source and guide snapshot; later changes require relevant checks again. The GitHub Pages workflow builds and deploys the guide independently. npm packages are not yet published. Follow the [release gates](publication.md) before distributing registry packages.
