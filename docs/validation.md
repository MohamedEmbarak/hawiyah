# Validation record

## 2026-11-01 integrated password visibility

Focused password and existing controls/expansion tests passed (32 cases in
React/Vue/vanilla), plus the rebuilt Angular password tests. Four Chromium guide
cases verify icon geometry inside the input, logical placement, localized names,
keyboard activation, unchanged form values, reset and forced-colors focus at
320px/1280px in Arabic and English. The guide Inputs page uses this composition.
The icon/text API and licensed artwork customization are documented in
[password visibility](password-field.md).

## 2026-11-01 custom-only date inputs

All four adapters use editable ISO text drafts plus canonical hidden form values.
Focused React/Vue/vanilla date tests passed (19 cases); Angular date draft and
expansion tests passed (16 cases). Three native consumer browser cases passed
for malformed/valid drafts, canonical submission, required clearing and keyboard
opening/focus return. The framework calendar script passed all three adapters,
including mobile RTL/dark layout, calendar switching, invalid-range submission
and scoped axe. Three guide calendar/input cases passed in Arabic/English and
320/390/1280px layouts. Packages and consumers built. The browser trigger owns
expanded state; the editable textbox does not expose unsupported aria-expanded.
See [the date-input contract](date-input.md). Provider calculations are unchanged.

## 2026-11-01 navigation drawer

Six focused native adapter/controller tests passed, including disabled groups,
route cancellation, modifier clicks, disclosure behavior and cleanup. Five
Chromium cases passed: two vanilla RTL/LTR cases at 320px across themes/modes,
forced-colors focus and scoped axe; three native framework consumers at 390px
verify user slots, nested links, 327px width, RTL placement, route closing and
Escape focus return. Final focus after following a real fragment link is owned
by browser/router navigation, not required to stay on the trigger. The Arabic
drawer screenshot was visually inspected. All packages and consumers built.
See [the composition contract](navigation-drawer.md); no source entrance timing
or exhaustive visual parity is claimed.

## 2026-11-01 mobile top bar

Five Chromium cases passed: two guide RTL/LTR cases at 320px with DGA/Nasaq/custom,
light/dark, enlarged text, forced colors, minimum 44px actions and back navigation;
three native framework consumer cases with heading/action slots, keyboard order,
locale changes and scoped axe scans. The Arabic narrow-screen screenshot was
visually inspected. All packages, the guide and native consumers built. Source
title roles are decoded evidence; the 60px minimum, intrinsic height and 44px
targets are accessibility adaptations. No source playback or pixel-parity claim
is made. See [MobileTopBar](mobile-top-bar.md).

## 2026-11-01 disabled file-drop state

React, Vue and Angular FileDropzone wrappers previously checked only component
props, allowing drops when their native file inputs inherited disabled state
from a fieldset. Each now checks the input's effective state at event time.
Six new adapter regressions cover inherited disablement, re-enabling, disabling
during a drag, unchanged files/callbacks, cancelled drop defaults and the native
first-legend exception. Those six plus 32 existing React/Vue expansion tests
passed. The final React dragover amendment passed its two focused cases again.

All packages, the guide and native consumers built; React was recompiled and its
consumer rebuilt after the final dragover change. JSDOM tests use real `:disabled`
matching but stub DataTransfer/file-list assignment; they do not establish an
OS-level file-drag or upload-transport audit. Vanilla already used effective
disabled checks and is unchanged. Calendar logic and public APIs are unchanged.

## 2026-11-01 modal backdrop gestures

Before the fix, real Chromium content-to-backdrop drags dismissed the date-picker
dialogs in all three native framework consumers. Ten dedicated unit cases now
pass across vanilla, React, Vue and Angular Dialog/Drawer implementations,
covering gesture origin, cancellation, prevented events and stale-state reset
after reopening. Six existing dialog lifecycle tests also passed. Five Chromium
cases passed: vanilla Dialog/Drawer at 390 px plus real React/Vue/Angular
date-picker dialogs, covering content drags, deliberate backdrop dismissal,
Escape and focus return. The full package, guide and native consumer build
passed. These checks do not establish touch-device or cross-browser coverage;
source motion/parity is not inferred.

## 2026-11-01 guide mobile reflow

Long, unbroken API names in DatePicker guidance reproduced a 349 px Arabic
document width on a 320 px viewport (344 px in English). Guide prose now permits
wrapping within those names; preformatted code keeps its own scroll container.
Two Chromium cases passed Arabic/RTL and English/LTR at 320 px, including the
live date picker inside the complete guide, popup containment, Escape focus
return and focusable scrolling API tables. The Arabic popup screenshot was
visually inspected. The Pages-path Vite guide build passed. This resolves the
documentation-host limitation recorded in the earlier calendar run; library
calendar calculations and package behavior are unchanged.

## 2026-11-01 accordion motion

The final focused suite passed 24 tests across core motion, all four adapters
and tokens. Five browser cases passed: two vanilla RTL/LTR cases inspect real
WAAPI intermediate frames, reversal, content resizing, inert closing content,
focus return and reduced-motion settlement; three native React/Vue/Angular
cases cover animated exclusive groups and keyboard operation. Additional unit
regressions protect React exclusivity changes, independent shadow-root groups
and focus return before hiding shadow content. Browser animations are paused
by the fixture for deterministic intermediate-frame inspection.

Full consumer builds and the subsequent all-package/Pages-path guide rebuild
passed. Seven local tarballs passed isolated ESM, SSR, Angular APF, CSS export
and TypeScript checks; both minimal-consumer bundle budgets passed. Nothing was
published to npm. Native fallback remains immediate without WAAPI or enhancement;
Chromium checks do not establish a complete cross-browser or screen-reader audit.
See [the motion contract](accordion-motion.md).

## 2026-11-01 date-picker presentation

The supplied screenshot led to a narrower titled dialog, larger day targets,
RTL-aware arrow controls, isolated date ranges, wrapped popup copy and formatted
output below the input. Calendar/provider calculations and ISO values are
unchanged. Focused vanilla/React/Vue units passed 28 tests; Angular expansion
passed 14 tests. The browser picker case passed RTL/LTR at 320, 390 and 1280 px
with native modal/focus checks, image-mask loading and six geometry combinations.
The live enhanced recipe is isolated from guide prose for the screenshot fixture;
the documentation host itself has a pre-existing long-paragraph overflow at
320 px. Final 320/390/1280 px Arabic popup screenshots were visually inspected.

The React/Vue/Angular calendar browser script passed calendar switching, canonical
labels, keyboard selection, reopening, unsupported-range validation and recovery,
open-popup geometry at 320/390 px, formatted-output placement, Escape focus return
and scoped axe checks. Geometry checks wait for dialog entry animation to finish.
All packages/consumers and the Pages-path guide build passed. These are UI and
behavior checks, not source calendar parity or official certification.

## 2026-11-01 mobile navigation bar

The opt-in SecondaryNav mobile presentation passed two shared-CSS browser cases
(RTL/LTR, light/dark, color interpolation, native link focus, reduced motion,
forced colors, theme timing isolation and enlarged labels) and three native
React/Vue/Angular consumer cases. All packages and four consumers built.
The existing 79-entry catalog is retained: this is a navigation variant, not a
new tab-panel controller. Source/color mapping and icon override limits are in
[mobile navigation](mobile-navigation.md).

## 2026-11-01 component motion

Five token tests and two focused Chromium motion cases passed. The browser
fixture removes guide-only CSS so its global reduced-motion fallback cannot
mask the package rules. Checks cover DGA/Nasaq/custom in a nested theme, RTL/LTR,
normal and reduced motion, switch interpolation and containment, live preference
changes during an active transition, keyboard toggling and Tab movement. Spinner
cycle duration and spinner/skeleton suppression are checked. The first test run
exposed the guide fallback in the fixture; isolating library CSS resolved that
test-harness issue.

All packages and the guide built successfully with `NASAQ_BASE_PATH=/nasaq/`.
The preceding mobile task also built all four consumers and passed eight browser
cases. Shared CSS changes require no framework DOM or calendar changes. Source
prototype playback and exact switch geometry parity are not claimed. Accordion
height animation and mobile tab-bar motion remain separate follow-up work.

## 2026-11-01 mobile density

All packages and four consumer builds passed. Four token tests and eight browser
cases (two mobile-density cases plus six existing DGA-theme regressions) passed.
Measured control geometry covers a 320 px viewport, RTL/LTR, DGA/Nasaq/custom,
light/dark, default/filled/disabled/read-only/invalid fields, nested compact and
comfortable scopes, consumer height overrides and enlarged field text. Read-only
and forced-colors focus regressions remain green. These are rendered Nasaq
checks, not a full Figma visual comparison or mobile dark-mode parity claim.

## 2026-11-01 Home and Search follow-up

The bilingual gallery adds Home and Search and uses the public vanilla header
controller. Home presents a hero, service links, illustrative statistics,
guidance and an explicit empty partner section. Search uses local demonstration
data with retained query, category filter/reset/removal, sorting, pagination and
empty/loading/error/retry rendering. Its injectable loader remains application
code, not a service integration in the component library.

All eight existing DGA-template browser cases and both new Arabic/English
discovery cases passed across targeted serial runs. A service-form case exceeded
its timeout under machine pressure, then passed in the isolated rerun. Checks
cover application-state preservation, mobile navigation, filtering, keyboard
focus, narrow overflow and scoped axe scans. The search loader unit test passed
for loading, failure/retry and ignoring completion after disposal. Arabic Home
and Search screenshots were inspected for rendering; this is not Figma pixel
parity. The final playground TypeScript check and `/nasaq/` production build
passed. Calendar calculations, original/custom themes and branding contracts
remain unchanged.

## 2026-11-01 portal and package follow-up

`PortalLayout` and `SecondaryNav` extend the current catalog to 79 entries.
Responsive PortalHeader behavior is native to each adapter; vanilla also exposes
`createPortalHeader` through `enhance`. Eight focused portal unit tests passed
across the four adapters. Two shared-layout Chromium tests passed for RTL/LTR,
DGA/Nasaq light/dark, narrow/desktop visibility and forced-colors focus.
Three production-consumer cases (`pnpm test:portals`) passed for React, Vue and
Angular: Arabic/English, visible wordmark sizing, mobile disclosure, Escape focus
return, link dismissal, skip-target focus, desktop navigation and scoped axe scans.
These checks exposed and fixed footer legal-text contrast and example heading
order. They do not establish Angular SSR/hydration or full Figma visual parity.

All seven packages and all four applications built successfully. The guide also
built with `/nasaq/`, and all 79 live references passed the guide-content checks.
`pnpm check:packages` passed for seven tarballs, new exports/SSR composition,
TypeScript consumers, bundled icon notices and both existing bundle budgets.
The package-check script now invokes an absolute Windows `.exe` without a shell,
fixing a failed check when Node's path contained spaces. No npm publication ran.
Browser checks used installed Chrome 156; machine pressure required serial runs
and longer test timeouts. Only the stated cases are verified.

## 2026-11-01 curated icon follow-up

Ten unchanged Hugeicons Stroke Rounded SVGs are bundled from a pinned MIT-licensed
upstream commit, with license, SHA-256 hashes and DGA component-name/node mappings.
They are not direct DGA Figma exports; only the search glyph received a geometry
comparison. SVG structure/hash checks passed for all ten. Package and four
application builds passed. A Chromium regression passed for mask asset loading,
24px geometry, inherited color, nested RTL/LTR arrow direction and forced colors.
The original solid/custom/branded Figma exports remain outside the package.

## 2026-11-01 input follow-up

The read-only RangeSlider now preserves Tab/Shift+Tab while blocking value-changing
keys. Filled read-only inputs keep one inset keyboard focus cue. Angular TextField,
Textarea and Select forward `size` and `visualVariant` to their native controls.
Node 24.21.0 and the pinned pnpm 11.25.0 were used on Windows. Package compilation
and all four application builds passed. The vanilla controls suite (10 tests),
Angular native components suite (8 tests), and six DGA-theme Chromium cases passed,
including RTL/LTR traversal, light/dark read-only focus, green/red editable
underlines and forced colors. Vitest used `--pool=threads --maxWorkers=1` after
the default fork workers timed out during startup; that startup failure ran no
tests. The Angular input regression uses `ComponentRef.setInput` to exercise
public input updates directly. These checks do not establish full visual parity.

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

The subsequent input-focus refinement removed the duplicate outer ring from DGA fields. The Pages-base guide build and two focused theme browser tests passed. A production browser check covered 36 field/theme/mode combinations (text, select, textarea, read-only, filled and invalid fields across DGA/custom/Nasaq and light/dark), plus the forced-colors fallback, without field-size changes. Compound tag/search fields use a single inset indicator. The follow-up green underline change passed the Pages-base build and 24 production field/variant/mode/state checks, plus native invalid-state checks in both modes; invalid underlines remain red.

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

Firefox and WebKit have not been covered by these runs. Manual screen-reader testing, a complete keyboard/accessibility audit, exhaustive mode/theme/density combinations, and a broader framework-version matrix remain open. Angular production AOT consumer integration and Angular SSR/hydration are not established. React/Vue hydration coverage is limited to the focused cases described above. The [DGA reference](dga-reference.md) records reviewed source mappings and accessibility adaptations. The local audit decoded all 23 supplied exports; the standalone web Components Library was not found. Hajj is excluded by product scope; exhaustive template parity, live official-version checking and asset redistribution permissions remain separate work in [alignment](alignment.md).

These checks describe this source and guide snapshot; later changes require relevant checks again. The GitHub Pages workflow builds and deploys the guide independently. npm packages are not yet published. Follow the [release gates](publication.md) before distributing registry packages.
