# Hawiyah guide rebuild: handoff

Written 12 November 2026, 23:00 UTC, at a pause requested by the owner. Read this file first, then `brief.md` (the original task, verbatim), then the last section of `gate1/notes.md` if a detail is missing.

This directory is working material for resuming the task. It is not part of the library or of the guide: nothing imports it, no build or test reads it, and it is removed before the branch is merged into `main`.

Local paths in these files were replaced by placeholders: `<scratch>` is the scratch directory the work used (its layout is mirrored here, so read `<scratch>/gate3/m3/x.json` as `handoff/gate3/m3/x.json`), `<repo>` is the repository root, `<session>` is the session that did the work. Model names were replaced by `tier-1` (most capable), `tier-2` and `tier-3`.

## 1. Where the work stands

About 48% complete by effort. The work is stopped inside milestone 3 of Gate 3, after verification and before the two independent reviews.

| Part | State |
| --- | --- |
| Gate 1: audit, architecture, content model, ideas | Done, approved |
| Gate 2: three landing directions and editor proposals as prototypes | Done, approved |
| Milestone 1: package P0 fixes, build hygiene, CI | Done, verified |
| Milestone 2a: no built-in strings, no default locale, flat stylesheet, icons, ids, fragment links | Done, verified |
| Milestone 2b: components the guide needs | Done, verified by the lead's own full run only |
| Milestone 3: 127 parity, accessibility and behaviour items | Built, migrated, verified with one failure; reviews and fix round not run |
| Release 0.3.0 | Not started; needs explicit owner approval |
| Milestones 4 to 6: new guide, content, switch | Not started |

Repository: `MohamedEmbarak/hawiyah`, branch `claude/zen-rubin-wtib31`, HEAD `5033ddf`, pushed, working tree clean. The four newest commits are labelled work in progress. `main` is untouched and still deploys the old guide. No pull request exists. The seven packages are still at version 0.2.1 in their manifests.

## 2. Rules that hold for all remaining work

The non-negotiable constraints are in `brief.md` under "Constraints". The ones most easily broken:

- Every commit is authored and committed as `Mohamed Hussein <16551319+MohamedEmbarak@users.noreply.github.com>`. No `Co-Authored-By`, no session link, no other trailer, no other identity. This overrides any default attribution a tool suggests. No model name in commits, pull requests, code comments or any pushed file.
- Never publish to npm without the owner's explicit approval for that specific release, and only through `pnpm release:packages`.
- Never commit credentials, tokens, `.env` values, local absolute paths or test artifacts. Playwright output goes outside the repository.
- Describe Hawiyah as a UI component library built to comply with the DGA Platforms Code, in a formal register. Not an official DGA product, no certification, not "for government platforms". No marketing copy.
- Icons: only Hugeicons Stroke Rounded at the commit pinned in `packages/styles/src/assets/icons/provenance.json`. Framework logos keep the Simple Icons marks.
- Arabic and English, full RTL and LTR. Locale and direction stay independent.
- WCAG 2.2 AA, keyboard and screen-reader paths, visible focus.

Standing instructions from the owner during the work:

- Develop only on `claude/zen-rubin-wtib31`. No pull request unless asked. The current guide stays deployed from `main` until the owner approves the switch.
- Commit and push at every stop, with an honest label when the tree is not green.
- Stop at decision gates and at meaningful milestones. Report passed, failed (with output) and not checked. Reviewers who did not write the code verify each milestone and receive the code, not conclusions.
- Be economical with usage (section 9).
- Reply style: conclusion or recommendation first, short paragraphs, no preamble or closing summary, no em dashes, no filler, push back when logic is weak.

## 3. Decisions already taken

### Gate 1 (all seven recommendations approved)

1. Package fixes and a 0.3.0 release come first; ask again before publishing.
2. The new guide lives in `guide/` at the repository root, outside the workspace, with its own lockfile and a registry-resolution check.
3. One Markdown file per component, `docs/components/<id>.md`, with an Arabic sibling `<id>.ar.md`, live fenced blocks, and a CI check of the API tables against the published type declarations.
4. "Same example in every framework" means the same rendered result and behaviour, enforced by an equivalence test (structure, accessibility tree, screenshot).
5. Editor runs the published files through an import map in a sandboxed frame; bundles are the fallback.
6. Trusted publishing with one GitHub environment approval per release. The owner runs the `npm trust` setup (section 7).
7. Scope: keep 13 templates, merge or drop 4, drop the discover and apply journeys, ideas as proposed.

Full text of the approved architecture, content model and ideas: `gate1/partials/architecture.html`, `content.html`, `ideas.html`. Summary in section 8.

### Gate 2

- Landing direction C ("two languages, one system") with direction A's install chooser.
- Editor direction D: a page block plus a full editor with A's toolbar and C's log panel.
- Prototype sources are in `gate2/prototypes/` (section 11). They were built on 0.2.1 and are references for design, not code to copy unchanged.

### Owner instructions after Gate 2 (latest wins)

- The guide's top line is the NIC attribution, exactly: "Developed by the Development Team in the National Platforms Sector — National Information Center" and "تم التطوير بواسطة فريق التطوير في قطاع المنصات الوطنية - مركز المعلومات الوطني".
- In the navbar and footer the Arabic wordmark artwork alone is the identity. No "Hawiyah" text beside it, and the logo is never typed text. The English name appears only in prose, page titles and non-visible accessible names.
- The guide has an Arabic/English switch and a light/dark switch. No separate direction toggle: direction follows the chosen language in the guide.
- Packages are agnostic to localisation: no built-in strings, no default language, no default locale. Every visible or accessible-name string is required content (child text, prop, or required Angular input) with the same name in all four adapters. Missing text renders nothing and warns in development only.
- Core formatting helpers require the locale. `Asia/Riyadh` stays the documented default time zone. Vue Stat no longer formats. DataTable `locale` is always required.
- Milestone 2b: CopyButton and SideNavigation added (catalogue is 85); core `bindLinkNavigation`; opt-in `@hawiyah/styles/fonts.css` (styles tarball about 647 kB packed with fonts, accepted); syntax colour tokens alias existing Platforms Code colours, with function and type both plain text; header not sticky and wrapping at 320px accepted for the first release.

### Milestone 3 decisions, built on recommendation, not yet confirmed by the owner

The owner was shown these twice and has not objected. Each can be reversed before the release.

1. Native form reset changes the value and notifies the application in every adapter, including controlled React and Angular without Angular Forms. Reverses `docs/input-review.md` and `docs/nic-segmented.md`.
2. Angular wrapper hosts forward `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-invalid` as inputs; `describedBy` becomes `aria-describedby`; `hw-link` becomes `a[hwLink]`.
3. Angular `hw-radio` is renamed `hw-radio-group`. Other radio components wait for 0.4.
4. TagInput: Angular's Add button and required `addLabel` are removed.
5. TreeView: expand and collapse is a named button in every adapter; Angular gains two required texts.
6. Popover and Collapsible: the text is `label` everywhere; React renames `title` and renders no Popover heading.
7. Menu and Popover trigger: both mechanisms stay; Vue and Angular gain `triggerVariant`, default `secondary`.
8. Feedback and CookieConsent get one contract each, based on React's.

Choices the specifications made beyond the audit wording:

- FileDropzone: one rejected file empties the whole selection, in every adapter.
- TagInput: after removal by button, focus goes to the neighbouring remove button. Reverses `docs/tag-input-interaction.md`.
- MultiSelect: the filter label is visible in React, Vue and Angular.
- DataTable sort is `sortKey` and `sortDirection` everywhere.
- The vanilla standalone Calendar loses its Gregorian/Hijri switch.
- Angular Stepper `current` is a step value, not an index. Vue Accordion uses `#title` and `#content`.
- Angular Tooltip: the application marks its trigger with `hwTooltipTrigger`.
- PortalHeader `homeHref` defaults to `'/'` in React as in Vue and Angular.
- ServiceDetails facts are a stacked list everywhere.

Recommended and not built; ask the owner or include in the fix round only on their word:

- Angular Slider starting at the midpoint, as React and Vue do (it starts at 0).
- CookieConsent with equal emphasis for Accept and Reject (Accept is primary today).

## 4. Milestone 3 in detail

Source: 160 recorded findings (audit P1 records plus gaps recorded in milestones 2 and 2b). Triage against the tree at `a0ed9b0`: 26 already fixed, 3 obsolete, 131 open or partly open, merged into 127 work items in five families.

| Family | Items | Specification |
| --- | --- | --- |
| forms-core | 24 | `gate3/m3/spec-forms-core.json` |
| rich-inputs-files | 23 | `gate3/m3/spec-rich-inputs-files.json` |
| dates-overlays-disclosure-data | 21 | `gate3/m3/spec-dates-overlays-disclosure-data.json` |
| navigation-menus-shell | 26 | `gate3/m3/spec-navigation-menus-shell.json` |
| feedback-content-patterns | 33 | `gate3/m3/spec-feedback-content-patterns.json` |

Other inputs: `conventions.json` (18 cross-adapter rules, the triage corrections, the nine items left out of 0.3.0, the eight owner decisions), `spec-amendments.json` (where the foundation step reconciled the five specifications), `triage-*.json`, `input-*.json` (the full audit records), `result-<adapter>-<n>.json` and `result-foundation.json` (what each builder implemented, its deviations and what it left undone).

What ran, in order: five specifications, one foundation step in core, styles and tokens, three steps per adapter for React, Vue and Angular and two for vanilla, five migration agents (root tests, examples, playground projects, guide, documents), one verification agent.

### Verification at `5033ddf`

Reported by the verifying agent in `gate3/m3/verify.json`. Not rerun by the lead, and no reviewer has read the code.

| Check | Result |
| --- | --- |
| `pnpm build` | pass |
| `pnpm test` | pass, 2,574 tests in 217 files |
| `pnpm typecheck:playground` | pass |
| `pnpm check:packages` | pass, seven tarballs |
| `HAWIYAH_BASE_PATH=/hawiyah/ pnpm build:docs` | pass |
| `pnpm test:portals` | pass, 81 of 81 |
| `pnpm test:browser` | fail, 634 of 635 |

The failing case: `tests/browser/playground.spec.ts`, "WCAG components en light", axe rule `label-content-name-mismatch` on the expanded vanilla tree item. Its accessible name does not contain its visible text. This comes from the new named toggle button in TreeView. Fix the component; do not relax the test.

### What remains in milestone 3

1. Two independent reviews, read-only, by agents that did not write the code, on the most capable model. Review 1: forms-core, rich-inputs-files, dates-overlays-disclosure-data. Review 2: navigation-menus-shell, feedback-content-patterns. Each also re-checks the triage's "fixed" claims. The prompts are the Review phase of `gate3/m3/stage2-wf.js`; outputs go to `gate3/m3/review-1/review.json` and `review-2/review.json`.
2. One fix round on the review findings (Fix phase of the same script; `fix-progress.json`, `fix-result.json`).
3. The lead reruns every suite: build, test, `typecheck:playground`, `check:packages`, the guide build under `/hawiyah/`, the full browser suite, portals.
4. Move the seven packages to 0.3.0, finish `CHANGELOG.md` (section "Unreleased" already holds the 2a and 2b changes; every rename needs a migration line; no deprecated aliases).
5. Report passed, failed, not checked. Then ask for approval to publish.

Points the reviews must settle, noticed by the lead and not yet checked:

- The verifier put `maxlength="4"` back on the vanilla PinInput playground project, while the specification says PinInput carries no `maxlength`. Either the example or the vanilla controller is off the specification.
- Angular reports it cannot meet the "controlled, notification ignored" case (STATE-02) for DataTable sort, Menu and Popover open, TreeView expanded and PortalHeader open, because Angular inputs have no controlled mode in React's sense. Probably a documented adapter difference; confirm.
- `apps/playground/src/main.ts` gained a guard so the `hashchange` handler does nothing once `#app` is detached. Check it hides no real error.

### Left out of 0.3.0 on purpose (state each in the changelog as open)

Only the breaking half of each was done:

- `layout-2`: typed `as` prop for React layout primitives and attribute selectors.
- `portal-shell-8`: PortalLayout pass-through of header and footer options in Vue and Angular.
- `nav-a-3`: rich tab labels in Angular.
- `choices-5`: only the rename to `hw-radio-group` is done.
- `fields-basic-10`: no general native-attribute pass-through for Angular text controls; forwarded ARIA, `form`, blur and focus outputs are done.
- `fields-basic-5`: Angular Select `multiple`; option and optgroup projection is done.
- `disclosure-data-13`: projected rows in Angular `hw-table`; cell templates and `rowKey` are done.
- `nav-b-17`: native form participation for TreeView in React and Vue; the Angular renames are done.
- `R15`: projected Menu and Popover triggers in Vue and Angular; `triggerVariant` is done.

Deferred from milestone 2b and still open:

- CopyButton status re-announcement on a second copy (needs a screen reader to verify).
- A class-less `pre` inside `.hw-prose` gets no `tabindex`, role or name; the guide's Markdown pipeline must add them (milestone 4).
- `scripts/prepare-demo.mjs` must copy the IBM Plex licence and provenance once the guide imports the fonts.

Not verified anywhere so far: screen readers, Firefox, Safari, and an Angular CLI ahead-of-time consumer build of the components added in 2b and 3.

## 5. What the earlier milestones changed (for the changelog and the guide)

- Milestone 1: server rendering and hydration fixes (Tabs, ContentNavigation, ToggleGroup, Combobox, TagInput, MultiSelect, DatePicker, Accordion), unselected radios, clean builds before packing, `ci.yml`.
- Milestone 2a: text contract (core `requireText`), locale required, one flat published stylesheet, 28 packaged icons, deterministic Angular ids (`HwIdSource`), fragment links that work under a base href, brand as artwork alone with a required non-visible label.
- Milestone 2b: `--hw-color-code-*` tokens (13, names frozen), `code.css` (`hw-code-block`, `hw-code`, `hw-kbd`, `hw-code-token-*`), `prose.css` (`.hw-prose`), `.hw-type[data-tone]`, opt-in `fonts.css` (IBM Plex Sans Arabic 400 to 700 and IBM Plex Mono 400 with licence and provenance), CopyButton, SideNavigation, core `copy.ts`, `link-navigation.ts`, `navigation-list.ts`, ToggleGroup `labelHidden`, PortalHeader notice and actions regions (`hw-portal-header-actions`), Angular layout primitives carry class and attributes on the host (`<section hwSection>`), NavigationDrawer closes on a timer and opens the group of the current page.
- Milestone 3: section 4, plus new core helpers (`observeFormReset`, `evaluateFileSelection`, `createTypeahead`, `isTypeaheadKey`, `prepareRemovalFocus`, `getDateViolation`, `normalizePinInput`, `getPortalBranchSummary`, `sameValue`) and Angular `HwTooltipTriggerDirective`, `HwLinkDirective`, `HW_FIELD`.

## 6. Environment and commands

- Node 24 and pnpm 11.25.0, as pinned in `README.md`. In the cloud container used so far, Node 24 was not on the default path and each shell command started by prepending its bin directory to `PATH`.
- `pnpm install --frozen-lockfile`, then `pnpm build`.
- Suites: `pnpm test`, `pnpm typecheck:playground`, `pnpm check:packages`, `HAWIYAH_BASE_PATH=/hawiyah/ pnpm build:docs`, `pnpm test:browser`, `pnpm test:portals`.
- Playwright: use the preinstalled Chromium (`HAWIYAH_CHROMIUM` points at it), pick a free port with `HAWIYAH_TEST_PORT`, and pass `--trace off --reporter=line --output <a directory outside the repository>`. The full browser suite takes 35 to 40 minutes.
- Commit identity: pass it per commit, for author and committer both, and check with `git log -1 --format='%an <%ae> | %cn <%ce>'`.
- A machine with 4 cores runs two workflow agents at a time. Never hard-link a workspace that agents will edit.
- Blocked from that environment: the DGA design site and the SDAIA files host (both refuse the connection), CDNs, StackBlitz. Comparison with the Platforms Code used in-repository references only.

## 7. Release 0.3.0

1. Tree green on the lead's own run, versions at 0.3.0, changelog complete.
2. Owner's one-time step, immediately before the release because a new configuration expires after two days without a successful publish. For each of the seven packages, with npm 11.15 or later and 2FA:
   `npm trust github @hawiyah/<name> --file publish.yml --repo MohamedEmbarak/hawiyah --env npm --allow-publish --yes`
   The first call asks for 2FA and offers to skip it for five minutes, which covers the rest. A GitHub environment named `npm` lists the owner as required reviewer.
3. Ask the owner for explicit approval for this release. Publish only through `pnpm release:packages`. Source manifests stay `private: true`; the release script strips it from the staged tarballs.
4. Afterwards: set each package to require 2FA and disallow tokens, delete the `NPM_TOKEN` secret, remove the token line from `publish.yml`.

## 8. Milestones 4 to 6

Start only after 0.3.0 is on npm.

Milestone 4, foundation:

- `guide/` at the repository root, outside the workspace globs, own lockfile, exact versions of `@hawiyah/angular`, `styles`, `tokens` (and the others the editor needs) from the registry.
- Registry check in CI: fails if any `@hawiyah/*` comes from a link, tarball, override, alias, path import or a version other than the pin, and compares installed integrity with the registry. Runs before the build and before deploy. The prerender log is scanned too, because a build can exit 0 with server errors.
- Angular CLI 22, static prerender, client hydration, base href from `HAWIYAH_BASE_PATH`, generated `404.html`, locale in the route (`/ar/…`, `/en/…`), colour mode applied by a small inline script before first paint, old hash links redirected. Critical-CSS inlining off.
- Lint for guide CSS: no selector targeting `.hw-*`, no raw colours, no physical properties. No server DOM shim and no skipped hydration.
- Content pipeline: Markdown rendered through package components, live fenced blocks grouped by example name, build fails when a framework is missing from a group, a block does not compile, or the four do not render the same result. It also gives class-less `pre` blocks their `tabindex`, role and name.
- Shell: NIC attribution line on top, wordmark alone as brand, language switch, mode switch.
- Landing C with A's install chooser. Editor D.
- Preview of unreleased work: a separate workflow builds against local tarballs, shows a persistent notice naming the commit, sets `noindex`, uploads a workflow artifact, has no Pages permission.
- The 83 existing browser specs test the packages through the old guide; they need a fixture host or a port before the old guide is removed.

Milestone 5, content: 85 component files in English and Arabic (brief page at `/components/<id>`, reference at `/components/<id>/reference`), guides under `docs/guides/`, 13 templates, brand pages, one Arabic glossary, generated install commands and `llms.txt`, structure parity check between the two languages.

Milestone 6: independent verification (axe, RTL and LTR, reduced motion, keyboard), production build under `/hawiyah/`, then switch GitHub Pages only on the owner's approval.

Approved ideas to include: per-example controls for language, direction, mode and density; install path chooser; evidence panel per component from `components.json`; adapter parity table; recipes by task; shareable editor links; keyboard notes that also drive a test; fixed and tested starter downloads.

## 9. Usage budget

Usage is limited by a 5-hour window and by weekly allowances, with the most capable model metered separately and most tightly. Ask the owner for the current figures before planning runs.

- Spent so far: about 12.2M output tokens, a little over half of it on the most capable model. The lead session is 4% of output.
- Estimated remaining: about 9.5M output (7.5M to 12.5M). The previous estimate for milestone 3 was off by a factor of two.
- Milestone 3 was launched as one run of 2.4M output and crossed a limit twice. No single run above about 1.5M output; one run per 5-hour window.

Tiers, agreed in principle:

- Most capable model only for the release reviews and fix round, guide architecture, editor and landing design, final review.
- Second tier for other agents, including Angular adapter work and verification, and for the Arabic pages, where register matters.
- A cheaper tier at medium effort for the 85 English component pages, backed by a mechanical check (every live block compiles against the published package; every prop named exists in the exports) and a sampled review.
- Lead session on the second tier during the content phase, on the most capable model at decision points.
- Proposed and not yet confirmed by the owner: a weekly cap for this project, with a stop and a report when the share for that week is spent.

## 10. How the multi-agent runs were organised

The pattern that worked: specify (read-only, most capable model) → build with disjoint file ownership per agent → migrate consumers with disjoint ownership → one verifier that keeps a progress file → independent read-only reviewers → one fix agent that keeps a progress file → the lead reruns everything. Every long agent writes a progress or result file so that an interrupted run continues instead of restarting. `gate3/m3/stage2-wf.js` is the most recent full example; `gate3/integration-wf.js` and `gate3/m2b-build-wf.js` are earlier ones.

A run's cache can be replayed only in the session that started it. From a new session, copy the phases still needed into a new script, pass the scratch directory as an argument, and map the `tier-1`, `tier-2`, `tier-3` placeholders in the `model` options to real models.

## 11. What is in this directory

Paths mirror the scratch directory the work used. To continue, copy this directory into the new session's scratch directory and let agents write their outputs there, not here.

| Path | Content |
| --- | --- |
| `HANDOFF.md`, `RESUME-PROMPT.md`, `brief.md` | This file, the prompts, the original task |
| `gate1/notes.md` | The lead's running notes, oldest first; the last section is the pause |
| `gate1/merged.json` | The Gate 1 audit, 747 findings with evidence and verdicts |
| `gate1/partials/` | Approved architecture, content model, ideas, as presented |
| `gate2/` | Gate 2 configuration and notes; `prototypes/*.json` hold the sources of the base app, landing A, landing C and the editor as `{files: {path: content}}` (the editor leaves out its copies of the published packages and vendored framework builds) |
| `gate3/m3/` | Milestone 3: specifications, conventions, triage, inputs, results, verification, both workflow scripts, the run journal |
| `gate3/` (other files) | Milestone 2 and 2b specifications, reconciliation, reviews, earlier workflow scripts |

Two reports published earlier are private pages on the owner's account and are not in this directory: the Gate 1 report and the Gate 2 prototypes page. Their content is covered by `gate1/merged.json`, `gate1/partials/` and `gate2/`.
