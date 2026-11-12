# Gate 1 working notes (my own; not a project document)

## Session facts
- Branch: claude/zen-rubin-wtib31 == origin/main == 3ac5022. Nothing committed so far. Repo untouched (only node_modules, dist, apps/playground/public are generated and ignored).
- Commit identity set in repo-local git config: Mohamed Hussein <16551319+MohamedEmbarak@users.noreply.github.com>. No trailers on commits (user rule overrides harness default).
- Node 24 at <node24-bin> (v24.22.1, npm 11.19.1); pnpm 11.25.0. Machine: 4 cores -> workflow concurrency 2 per workflow.
- Dev server for current guide: http://127.0.0.1:4173 (detached vite).
- Scratch: <scratch>

## Baseline evidence (2026-11-10, HEAD 3ac5022, Node 24.22.1)
- pnpm install --frozen-lockfile: ok. pnpm build:packages: ok (22.6s).
- pnpm test: node:test 8 pass; vitest 117 files / 637 tests pass. (logs/unit.log)
- pnpm typecheck:playground: exit 0.
- pnpm check:packages: exit 0 (clean tarball consumer ESM/SSR/APF/CSS; tree-shake budgets). (logs/check-packages.log)
- HAWIYAH_BASE_PATH=/hawiyah/ pnpm build:docs: exit 0; dist 17 MB. (logs/build-docs-base.log)
- NOT yet run: pnpm test:browser (83 spec files, 157 test() calls) and test:portals. Run when load drops.

## Published vs source
- All seven @hawiyah/* at 0.2.1 on npm (latest). 0.2.0 2026-11-09, 0.2.1 2026-11-10 06:35Z. No provenance attestation on 0.2.1 (dist has signatures only) -> published from a maintainer machine. 0.0.0-stage placeholder exists (staged publishing was used first).
- HEAD has unreleased package change: packages/styles/src/extended.css (.hw-button-group inline-size: fit-content) and nic-segmented.css (+2 lines). The deployed guide (workspace build) shows it; npm 0.2.1 does not.
- Published @hawiyah/styles@0.2.1 tarball ships 12 asset files that are NOT in source at release commit 0a5092d: dist/assets/external-link.svg, pagination-arrow.svg, notifications/*.svg (10). Removed from source in 2920ff3 (before the release). Not referenced by any CSS. Cause: scripts/build.mjs copies into dist without cleaning; release ran on a dirty tree. Evidence: scratch research/published/styles vs packages/styles/dist (diff -rq).
- Other six packages: published dist identical to local build (diff -rq clean, ignoring maps).

## Network
- npm registry + GitHub reachable. design.dga.gov.sa and files.sdaia.gov.sa were added to env allowlist (user approved) but both origins refuse this network (TLS reset / empty reply). Not circumvented. DGA comparison = in-repo references only.
- CDNs (jsdelivr/unpkg/esm.sh), stackblitz, github pages: blocked by policy (not requested).

## npm trusted publishing (docs fetched from npm/documentation main, see research/)
- Needs npm >= 11.5.1, Node >= 22.14; GitHub-hosted runners; id-token: write; package.json repository.url must match repo.
- Config per package: owner, repo, workflow filename (publish.yml), optional environment name, allowed actions (npm publish and/or npm stage publish; dist-tag separate, needs npm >= 11.21).
- CLI: `npm trust github <pkg> --file publish.yml --repo MohamedEmbarak/hawiyah --env <env> --allow-publish --yes` (npm >= 11.15, account 2FA; first call prompts 2FA and can skip 2FA for 5 minutes -> all seven in one go).
- New trusted publisher config must complete a first successful publish within 2 days or it expires.
- Provenance is automatic with OIDC from a public repo.
- Staged publishing (`npm stage publish`, npm >= 11.15): CI stages, maintainer approves EACH staged package with 2FA (CLI or npmjs.com). That keeps seven approvals -> not what the owner wants; recommend OIDC `npm publish` gated by a protected GitHub Environment (one approval click per release).
- After first OIDC publish: set each package to "Require two-factor authentication and disallow tokens"; delete NPM_TOKEN secret.
- Today publish.yml passes NODE_AUTH_TOKEN from secrets.NPM_TOKEN and NPM_CONFIG_PROVENANCE=true.

## Harness
- evidence/components/<id>/: per framework screenshots, sig, aria, html, summary.json; index.json at end. Known artefacts in README.txt (2px height drift => pixel ratios <5% are noise).
- evidence/pages/<route-key>/: 8 variants per route, summary.json, index.json.
- audit/pointers.json: per-component source pointers.
- Example mismatch already visible: e.g. button vanilla example has two buttons (submit primary + secondary) while React/Vue/Angular show one primary button + <output>.

## Workflows
- wf_271f2694-5ef foundations: spikes (angular, editor) + static audits (content, package-gaps) + verify.
- wf_4d3b89fd-c49 component audit shard 1: actions, dates, nav-a, overlays, layout.
- wf_95a6090d-b59 shard 2: fields-basic, choices, rich-inputs, files, nav-b.
- wf_434dafef-ca7 shard 3: disclosure-data, feedback-status, content-display, portal-shell, service-patterns.
- wf_012e1a08-0eb guide audit: tests, editor, component-pages, shell-home, docs-articles, templates-1/2/3, labs-journeys, brand.
- wf_a5bd6874-44c ideas panel (4 perspectives, 2 judges).
- Journals: <session>/subagents/workflows/<run>/journal.jsonl

## Conflicts / pushback to raise at Gate 1
1. "Markdown is the single source" vs API truth living in code -> keep Markdown as the only authored doc, verify its API tables in CI against the published type declarations.
2. "Each fact in one place" vs two languages -> English + Arabic sibling files; shared generated API tables; structural parity check.
3. "Same example in every framework" -> define as same rendered result and behaviour, enforced by an equivalence test (structure + accessibility tree + screenshot), since code cannot be identical.
4. "Honest render / package gap -> fix, release, then use" vs "no publish without approval" -> guide work blocks on releases; batch gaps into one 0.3.0 (prereleases on `next` if needed), one approval each.
5. "No guide-only CSS that imitates a component" needs an enforceable definition -> composition-only CSS, linted (no .hw-* selectors, tokens only, logical properties).
6. Editor needs compilers in the browser (TypeScript, Vue SFC, Angular JIT): size cost; lazy-load.
7. 83 browser specs test packages through the current guide -> they lose their host when the guide is replaced; need a fixture host or port.
8. No CI runs tests today (only pages.yml and publish.yml exist).
9. Preview of unreleased work must never reach the deployed site -> separate workflow, artifact or separate host, labelled, noindex.
10. Templates (17) and brand pages are plain HTML/CSS today; rebuilding them from Angular components will expose the largest package gaps.

## Tone hits seen so far (to confirm via audits)
- Footer: "Made for the way you build." / "مصمّم للطريقة التي تبني بها."
- Component page headings: "An experience more people can use", "At home in your framework", "Build the next piece".
- Counts drift: README 83; packages/angular/README "77 catalog entries"; docs mention 81 and 82.
- docs/editor-projects.md says downloads use local tarballs because npm releases do not exist (stale).

## 13:10 UTC: after the 5-hour limit hit (~12:47) and container restart (13:08)
- First wave (all tier-1, ~12 agents) burned ~80% of a 5-hour window in ~25 min. Only 6 agents had finished: component audits actions, dates, fields-basic, feedback-status, disclosure-data (27 components) and guide audit "tests". Exported to scratch audit/results/<family>.json and guide-audit/results/tests.json.
- Old runs (do not resume; superseded): wf_271f2694-5ef, wf_4d3b89fd-c49, wf_95a6090d-b59, wf_434dafef-ca7, wf_012e1a08-0eb, wf_a5bd6874-44c, wf_047e7035-752.
- Both captures finished: evidence/components (83 + index.json), evidence/pages (43 routes, index.json).
- Dev server restarted (4173).
- Interrupted Angular spike already showed: prerender of UNPATCHED 0.2.1 fails on some routes: "getBoundingClientRect is not a function" (timer callback), "input.getRootNode is not a function" (21 of 183 probe routes with problems). => package fixes + release needed before an honest prerendered guide.

## Second wave (disk-first, resumable; bulk on tier-2, architecture/design on tier-1)
- Scripts: workflows/scripts/hawiyah-component-audit-v2-wf_d95fc491-882.js ; gate1/guide-audit-v2.js ; gate1/foundations-v2.js
- comp-A wf_d95fc491-882 (task wdwe4z0d1): nav-a, overlays, layout, choices, rich-inputs (audit tier-2, verify tier-2), portBase 4400
- comp-B wf_9fac3fdb-3ac (task ws8tb8ex4): files, nav-b, content-display, portal-shell, service-patterns, portBase 4700
- comp-V wf_e6ea8599-ae1 (task wfhqux7sa): verify-only for actions, dates, fields-basic, feedback-status, disclosure-data, portBase 5000
- guide-A wf_592ac321-189 (task wmf6vs1vp): tests (verify only), editor, component-pages, shell-home, docs-articles
- guide-B wf_d605d8cd-31f (task wekf0yzk7): templates-1/2/3, labs-journeys, brand
- foundations-v2 wf_9dd6fc1a-545 (task wsdwsrqhn): spikes (tier-1 max, continue from disk) -> content + package-gaps audits (tier-1 high) -> verify (tier-2) -> ideas (3 perspectives tier-1 high) -> judge (tier-1 max)
- Result files: audit/results/<family>.json, audit/verdicts/<family>.json, guide-audit/results/<unit>.json, guide-audit/verdicts/<unit>.json, agents/{content-audit,package-gaps}/result.json, agents/verify-*/verdicts.json, spikes/*/result.json + REPORT.md
- To resume any run after a limit hit: Workflow({scriptPath, resumeFromRunId, args}) with the SAME args; agents continue from their checkpoint files.
- Verification scope: P0-P2 individually; P3 marked not-reviewed (stated limit).
- Still owed after these: synthesis + final review on tier-1 (all P0s and top P1s re-checked), baseline run of pnpm test:browser, Gate 1 report (gate1/build-report.cjs + partials), then STOP for the owner.

## 13:56 UTC: second limit hit at ~13:53 (window lasted ~43 min with 10 tier-2 + 2 tier-1 agents); user said Continue
- Verification scope narrowed to P0/P1 for remaining families (P2/P3 = not-reviewed). First 148 verdicts: 0 refuted, 15 corrected.
- Resumed (same run ids, same args): comp-A wf_d95fc491-882 (task wtj68ye1j), comp-B wf_9fac3fdb-3ac (task wmzwrzeh0), guide-A wf_592ac321-189 (task w7fv7xnfu), guide-B wf_d605d8cd-31f (task wi3hxeamc). Foundations wf_9dd6fc1a-545 (task wsdwsrqhn) left running (spikes alive).
- Session effort lowered to high by the owner; raise to max suggested for Gate 1 synthesis.
- Angular spike interim: AOT ok for 87 exports; static prerender build FAILS on unpatched 0.2.1 (tabs, content-navigation crash build; toggle-group, combobox, tag-input, multi-select, date-picker, accordion throw on server). 8 gaps in spikes/angular-guide/result.json.

## 15:10 UTC
- All 15 component families + 10 guide areas audited and P0/P1 verified. merged: 650 findings (13 P0, 155 P1, 378 P2, 104 P3), 0 refuted.
- Both spikes done (REPORT.md + result.json). Browser suite baseline: 530 pass / 1 flaky fail (nic-pagination en; 3/3 pass alone).
- Report: gate1/site/index.html published at <private page> (v1). Rebuild: python3 merge.py --write && python3 make-data.py && node build-report.cjs; republish index.html only (shots already uploaded s000-s199; names may shift if findings change -> republish shots too).
- Pending: content + package-gaps audits (foundations wf_9dd6fc1a-545, task wz3z9eswf) then final republish + Gate 1 message, then STOP.

## Pause/resume protocol (owner asked to prepare for pauses at limits), 15:20 UTC
- Durable copy of state lives on the artifact <private page> under state/: merged.json (all findings+coverage+extras), api-surfaces.json (83 components), pointers.json, tooling.json (notes, merge/build scripts, workflow scripts, harness, partials), evidence summaries, both spike reports and results. Screenshots shots/s000-s199.png.
- If the container is gone on resume: Artifact read with path state/tooling.json etc. to restore scripts; re-run pnpm install/build on Node 24 (<node24-bin>); findings need no re-run.
- If only a limit pause: python3 gate1/merge.py --status shows what is on disk; resume a workflow with its run id and SAME args (see above); checkpoints continue.
- After any change: python3 merge.py --write > /dev/null; python3 make-data.py; node build-report.cjs; python3 bundle-state.py; publish site/index.html with root=site and the state/ files.
- Remaining before Gate 1 stop: content-audit + package-gaps (task wz3z9eswf) -> final rebuild/publish -> Gate 1 message. Nothing committed to git; repo clean.

## Gate 1 outcome (owner, ~15:35 UTC 2026-11-10): "approve recommendations"
All seven recommended decisions approved: (1) package fixes + 0.3.0 release first (ask again before publishing); (2) guide/ outside workspace, own lockfile, registry check; (3) Markdown per component + Arabic sibling files (button.ar.md), live fenced blocks, CI API check; (4) same example = same rendered result, equivalence test; (5) editor: published files via import map, bundles as fallback; (6) trusted publishing with one GitHub environment approval (owner must run npm trust setup); (7) scope: keep 13 templates, merge/drop 4, drop discover/apply, ideas as proposed.
Owner asked to PAUSE until session reset at 9:50 (taken as 21:50 GMT+3 = 18:50 UTC). Next: Gate 2 = three landing directions + editor proposals as working prototypes on the real packages (ar/en, light/dark, desktop/phone), then wait. Be economical: tier-2 for bulk, top model for design; checkpoint to disk; no progress chatter.
Report v3 published (750 findings). Artifact state bundle has notes up to the pause protocol only.

## Gate 2 started 18:40 UTC (owner: "Resume now")
- Base app: gate2/base (Angular 22 client-rendered, @hawiyah/* 0.2.1 from registry, prefs.ts, capture script gate2/capture.cjs). Copies: gate2/landing-a|b|c, gate2/editor. Shots: gate2/shots/<name>/. Results: gate2/<name>/RESULT.json. Reviews: gate2/review/<name>/review.json.
- Workflow script: workflows/scripts/hawiyah-gate2-prototypes-wf_a0746d65-2c9.js. Runs: wf_a0746d65-2c9 (task wyb6jt31s; landing-a port 4510, landing-b 4520) and second run (landing-c 4530, editor 4540). Builders tier-1 high; reviewers tier-2. Resume with same args.
- Directions: A install-first; B from tokens to a page (animated composition); C two languages one system. Editor: /editor/a one toolbar, /editor/b preview first, /editor/c workspace, optional /editor/d.
- After they land: build Gate 2 artifact (screenshots ar/en x light/dark x desktop/phone per prototype + review issues + my recommendation), then STOP for owner's choice.

## Gate 2 presented ~19:45 UTC: <private page>
- Prototypes (not in repo): gate2/landing-a|b|c (route /), gate2/editor (routes /editor/a|b|c|d, /editor/d/workspace). Final captures gate2/final/<name>/ (64 images, all clean). Reviews gate2/review/<name>/review.json. Page built by gate2/build-gate2.cjs.
- My recommendation: landing C + A's install chooser; editor D (page block + full editor with A toolbar and C log).
- WAITING for owner's choice. Then Gate 3: build on branch claude/zen-rubin-wtib31; package fixes + tests first (0.3.0, ask before publishing); guide/ outside workspace; current guide stays deployed from main. Commit as Mohamed Hussein, no trailers.
- Caution learned: never cp -al a workspace that agents will edit (hard links share source files).

## Gate 2 outcome (owner): "approve recommendations" + three instructions
- Landing C with A's install chooser; editor D.
- Keep the top NIC attribution line exactly as written, Arabic and English: "Developed by the Development Team in the National Platforms Sector — National Information Center" / "تم التطوير بواسطة فريق التطوير في قطاع المنصات الوطنية - مركز المعلومات الوطني".
- NO separate direction toggle. Direction is a property of a registered language: developer registers any language with its layout direction; single-language use is the default by design. (My reading: package-level language registry {code, dir, strings}; lang/dir remain separate DOM attributes, dir never derived from locale code; landing C's panes switch language/mode/density only.) Update AGENTS.md wording when implemented.
## Gate 3 plan (pause at each milestone)
M1 package P0 fixes + tests + build hygiene + CI; M2 language registry, label defaults, flat stylesheet, base-href fragments, deterministic ids, icons, code block and other guide-needed components; M3 P1 parity fixes -> ask approval -> release 0.3.0 via trusted publishing; M4 guide/ scaffold, registry check, content pipeline, shell, landing, editor; M5 83 component Markdown files, templates, brand; M6 switch (owner approval).

## Owner decisions after Gate 2 (latest wins)
- Packages are AGNOSTIC to localisation: no language registry, no translations. They offer layout direction (dir) and take strings as props. lang and dir stay separate (AGENTS.md unchanged).
- Guide localises Arabic and English only; its language switch sets language + that language's direction; no direction toggle in the guide.
- Default strings: ONE documented default language across all four adapters, every string overridable by a prop. I chose Arabic (matches most existing defaults and EXPANSION.md "Defaults are Arabic"); owner may override. Milestone 2 work.
- Stop hook requires committing and pushing uncommitted changes: checkpoint commits are OK on the branch (author Mohamed Hussein, no trailers). First checkpoint 19e027e pushed.
- SUPERSEDES the default-language decision: NO default strings in the packages at all. Every user-visible or accessible-name string is REQUIRED content: child/text, prop, or Angular required input. Supplying text is the application's responsibility. Milestone 2: remove hard-coded Arabic/English defaults in all four adapters; required in types (React/Vue props, Angular @Input({required:true})); vanilla reads text from markup/data attributes; breaking change -> document in CHANGELOG and migration notes; tests assert no built-in strings remain.

## Milestone 1 DONE (~21:40 UTC): commits 19e027e, 3d36617, c9b9879 + final on claude/zen-rubin-wtib31 (pushed)
- Independent review PASS (gate3/m1-review/review.json): 8 defects fixed; revert-in-copy proves each test; spike app on local tarballs prerenders 192/192 routes exit 0, 0 ERROR lines, 0 hydration errors, tabs interactive, NumberField keeps typed text.
- Checks: build ok; vitest 825 + 8 contrast; typecheck ok; check:packages ok; browser suite 537 pass / 2 fail (button-group spec bug fixed after; nic-search touch case).
- Minor open: version must become 0.3.0 for release (tabs markup change); CI first run on GitHub unconfirmed; components.json evidence not updated; ids (GAP-6) pending; examples/angular browser.mjs stale locator.
- NEXT: pause for owner review, then Milestone 2 (no default strings -> required props; flat stylesheet; base-href fragments; deterministic ids; icons; code block etc.).

## Milestone 2 started 2026-11-11 08:35 UTC (owner: "continue with milestone 2")
- CI run 2 on 6b3185b: success (M1 green on GitHub).
- M2a plan: stage 1 = spec for no-built-in-strings + base-href fragments (tier-1) and styles agent (flat stylesheet, icons, style-only P1s; tier-2) -> workflow wf_1ab90d9f-32a (task wl4ge2s9z). Spec at gate3/m2-spec.json.
- Stage 2 (after spec lands; launch 2 workflows of 2 agents, package-scoped builds only, disjoint dirs): react, vue, angular (+deterministic id service GAP-6, GAP-7), vanilla implement the spec in their own package dir + own tests + own README.
- Stage 3: integration agent (playground recipes, examples/*, cross-adapter parity tests, docs, CHANGELOG, full verification) then independent reviewer. Commit per stage (stop hook demands commits).
- M2b (later, separate): new components for the guide (code block, prose, side navigation, compact header controls).

## Owner instruction 2026-11-11 (navbar identity)
- In the guide's navbar the Arabic logo ALONE is the identity: no English "Hawiyah" text beside it, and the logo is artwork (outlined SVG wordmark), never typed/regular text. Apply the same to the footer brand line. English name "Hawiyah" stays only in running prose, page titles and non-visible accessible names.
- Root cause in prototypes = PACKAGE GAP: Angular hw-portal-header template always prints <span>{{ brand }}</span> next to projected [hwBrand] artwork (packages/angular/src/content.ts:63); brand is a required text input. React brand is a node (image possible). Fix in milestone 2 stage 2 in ALL adapters consistently: brand may be artwork alone; no visible brand text unless the application supplies it; home link gets its accessible name from a required non-visible label. Add this as an addendum to gate3/m2-spec.json before launching adapter agents (covers PortalHeader, PortalLayout, PortalFooter, MobileTopBar, NavigationDrawer or any component with a brand).

## M2a stage 2 launched 09:05 UTC
- Commits so far today: 0c44d34 (flat stylesheet, icons, style defects), 4e55910 (core: no built-in strings, text contract). Branch build is RED until adapters land (by design: core types removed registries as RemovedExport).
- Spec: gate3/m2-spec.json (44 components, 129 texts, 19 rules, 7 helpers, 381 migration lines). Addendum: gate3/m2-addendum.md (brand artwork-only + brandLabel; Angular deterministic ids; parity reminders).
- Stage 2 script: workflows/scripts/hawiyah-m2-adapters-wf_9908a7ad-5db.js. Runs: wf_9908a7ad-5db (task worg0luvg: angular [tier-1], react [tier-2]) and a second run (vue, vanilla [tier-2]). Pipeline implement -> review -> fix. Per-adapter outputs: gate3/m2-<adapter>-changes.json, gate3/m2-review-<adapter>/review.json. Resume with same args.
- Stage 1 styles agent (wf_1ab90d9f-32a) still finishing docs/checks.
- After stage 2: integration agent (delete core removed.ts; packages/core/README + package.json description; root tests/; playground recipes; examples/*; docs; CHANGELOG; components.json; full verification incl. browser suite) + final independent review. Open owner question: core formatNumber/formatDate/sortRows default locale 'ar-SA' (keep or remove?).
- Owner decision 2026-11-11: REMOVE the ar-SA formatting default in core; locale is REQUIRED (addendum section D). Do it as stage 2b (one agent across core + all adapters) after the four adapter agents finish and before integration.

## PAUSED 2026-11-11 09:10 UTC (owner shutting down). Everything committed and pushed: HEAD 717136a on claude/zen-rubin-wtib31
- Stage 1 of M2a COMPLETE: spec (gate3/m2-spec.json) + styles (flat stylesheet, 28 icons, style defects; commits 0c44d34, 5d4abf3) + core contract (4e55910).
- Stage 2 STOPPED mid-implementation (workflows worg0luvg / wekol4xny stopped by me; runs wf_9908a7ad-5db [angular, react] and wf_c6a06a40-2c8 [vue, vanilla]). WIP committed in 5257632 and 717136a. Per-adapter progress: gate3/m2-<adapter>-progress.json (angular: helpers done, components todo; react: helpers planned, editing; vue: about half the files done; vanilla: source mostly migrated, portal/skip-link/tests/docs todo).
- Branch does NOT build (expected until adapters finish). CI red on these commits.
- TO RESUME: (1) export PATH=<node24-bin>:$PATH; if node_modules missing: pnpm install --frozen-lockfile; node scripts/build.mjs --only core (adapters resolve core via dist); (2) relaunch stage 2 with Workflow({scriptPath: workflows/scripts/hawiyah-m2-adapters-wf_9908a7ad-5db.js, resumeFromRunId: 'wf_9908a7ad-5db', args: {scratch, adapters: ['angular','react']}}) and ({..., resumeFromRunId: 'wf_c6a06a40-2c8', args: {scratch, adapters: ['vue','vanilla']}}): agents read their progress files and continue; if the scratchpad was lost, restore gate3 files from the artifact state bundle (state/gate3.json) first, or relaunch fresh with the spec + addendum.
- Then stage 2b (addendum D: no default locale, one agent across core + adapters), stage 3 integration (delete core removed.ts; core README + package.json description; root tests/; playground recipes; examples/*; docs; CHANGELOG; components.json; full verification incl. browser suite), final independent review, then report M2a and pause.
- Owner rules to remember: navbar/footer brand = Arabic wordmark artwork alone (no "Hawiyah" text beside it); NIC attribution line at top in both languages; guide has ar/en switch, no direction toggle; packages agnostic to localisation (no strings, no default locale); stop hook forces commit+push at every stop; be economical with usage.

## RESUMED 2026-11-11 09:40 UTC (owner: "continue with milestone 2")
- Stage 2 resumed: wf_9908a7ad-5db (task w78a4dyuk: angular, react) and wf_c6a06a40-2c8 (task w0wpvos0n: vue, vanilla). Same args.
- M2b proposal panel launched in parallel (read-only): wf_cbd6083d-48e (task wl2rn2qn0), script workflows/scripts/hawiyah-m2b-proposal-wf_cbd6083d-48e.js, output gate3/m2b-proposal.json.
- Next after stage 2: stage 2b no default locale (addendum D) -> stage 3 integration -> final review -> report M2a + present M2b proposal -> pause.

## PAUSED 2026-11-11 10:14 UTC (owner: "pause"). Tree clean, HEAD 7cc1ba2 pushed.
- Stage 2 status: Vue DONE (b6fe0c4), vanilla DONE (142a6f0), React DONE incl. review+fix (in 7cc1ba2), Angular IMPLEMENTED (in 7cc1ba2) but its independent review was interrupted (stopped task w78a4dyuk; run wf_9908a7ad-5db: resume with args {scratch, adapters:['angular','react']} -> implement/review/fix for react and implement:angular replay from cache; review:angular reruns, then fix:angular).
- M2b proposal panel: both proposals done; judge interrupted (stopped task wl2rn2qn0; run wf_cbd6083d-48e: resume with args {scratch} -> proposals cached, judge reruns; output gate3/m2b-proposal.json).
- Per-adapter change lists: gate3/m2-<adapter>-changes.json; reviews: gate3/m2-review-<adapter>/review.json.
- NEXT on resume: (1) resume the two runs above; (2) stage 2b = ONE agent across core + all four adapters: addendum D (no default locale) AND cross-adapter reconciliation of the choices adapters made differently (RatingDisplay label/getValueLabel, CarouselSlide.label, FileDropzone label/getSelectedMessage/status, DatePicker label rule clash (spec rules 8 vs 10), calendar rangeLabel condition, toast getDismissLabel signature, feedback getStatusMessage vanilla-only, aria-invalid when requiredMessage missing, site-verification space joins, cookie-consent preferencesLabel, features missing in Vue listed under notImplemented) + delete core removed.ts; (3) stage 3 integration (root tests/, playground recipes + generated runtimes, examples/*, docs, CHANGELOG, components.json, core README/package.json description, full verification incl. browser suite, check:packages) + final independent review; (4) report M2a + present M2b proposal; pause.

## 2026-11-11 11:55 UTC (after compaction)
- Angular adapter done incl. review+fix: commit 9f1593a pushed. All four adapters migrated.
- m2b judge resumed as task wpewdclzm (run wf_cbd6083d-48e); writes gate3/m2b-proposal.json.
- Stage 2b reconcile + addendum D: run wf_1990d885-c22, task w91i97j8w, script workflows/scripts/hawiyah-m2-reconcile-wf_1990d885-c22.js, args {scratch}. decide+core (tier-1) writes gate3/m2-reconcile.json then 4 apply agents. Resume with same args.
- Next: integration workflow (apps/playground, examples, root tests, docs, changelog), final independent review, report M2a + 2b proposal, pause.
- 12:40 reconcile + addendum D done (run wf_1990d885-c22): gate3/m2-reconcile.json (26 decisions, 24 parity gaps, 10 owner questions). pnpm build:packages ok, vitest packages pass. Committed. m2b-proposal.json written (10 recommended, 5 owner decisions).
- Integration script: gate3/integration-wf.js, args {scratch}. Launch next; record run id here.
- Integration launched: run wf_8f61d85d-1a3, task w9qyje9hj (5 migrate agents, verify, final-review -> gate3/m2-verify.json, gate3/m2-final-review/review.json). HEAD 55fd1d2.
- OWNER 2026-11-11: "approve recommendations" on reconcile owner questions: keep Asia/Riyadh time zone default (documented); accept Vue Stat no longer formatting; DataTable locale always required. The other 7 questions were not shown in full: proceed on their recommendations (all keep/no-change, or defer to M3: aria-invalid after failed submit, TreeView exposed toggle in Angular, Angular host aria-label forwarding) and list them in the M2a report for veto. 2b proposal's 5 decisions NOT yet approved (not yet presented).
- OWNER 2026-11-11: "approve recommendations" on the 5 milestone 2b decisions: (1) CopyButton + SideNavigation accepted, catalogue 85; (2) core bindLinkNavigation accepted; (3) opt-in fonts.css in @hawiyah/styles accepted (measure tarball size, OFL + provenance); (4) syntax colours alias existing Platforms Code colours (review rendered TS/HTML/CSS sample both modes before freezing names); (5) header not sticky + 320px wrap accepted for first release, revisit with real header. All 10 recommended additions in gate3/m2b-proposal.json are approved to build AFTER M2a is green. Plan: styles agent + core agent, then 4 adapter agents, independent review, docs/catalogue update.
- 16:35 limit hit during integration (5 migrate agents done, results in gate3/m2-migrate-results.json; verify + final-review failed on limit). Resumed same run wf_8f61d85d-1a3 as task wceqjnk50 with verify on tier-2 + progress file gate3/m2-verify-progress.json; final-review on tier-1. HEAD after WIP commits: see git log.
- 18:00 integration done. verify: all pass except nic-segmented.spec.ts:44 x3 (styles regression from 0c44d34). final review (gate3/m2-final-review/review.json): changes required: B1 segmented, M1 requireText not silent in prod browser bundles, M2 vanilla SearchField clear text; 11 minor; 13 parity differences. Next: fix workflow then my own full re-run.
- Review-fix run wf_b2a7799a-104 task wt8ir0lhx (script workflows/scripts/hawiyah-m2-review-fixes-wf_b2a7799a-104.js, args {scratch}) -> gate3/m2-review-fixes.json. After it: I run pnpm build/test/typecheck/check:packages/test:browser (full)/test:portals myself, commit, report M2a, pause for owner. Then 2b build (approved).
- 20:1x M2a GREEN at HEAD d544169: my own run on c3ae07e: build, 980 unit, typecheck, check:packages, build:docs /hawiyah/ pass; browser 574/576 (2 = nic-buttons axe mid-transition flake), portals 80/81 (react custom-date-input timing flake); both made deterministic and pass 6/6 and 3/3 reruns. Logs gate3/m2-final/. Next: launch 2b build gate3/m2b-build-wf.js args {scratch, base:<HEAD>}.
- 2b build launched: run wf_266e9db5-57e, task wlrmfeumr, script gate3/m2b-build-wf.js, args {scratch, base: d544169}. Resume with the SAME args. Outputs: gate3/m2b-spec.json, m2b-styles-result.json, m2b-<adapter>-result.json, m2b-review/review.json, m2b-fix-result.json, m2b-samples/ (syntax colour screenshots for owner).

## 2b build status (after second limit hit)
- Run wf_266e9db5-57e: 7 of 8 agents done; review verdict "changes required" (B1, M1..M4, m1..m10) in gate3/m2b-review/review.json.
- WIP committed and pushed before the fix round (commit after d544169, "WIP: add code and prose styles...").
- fix+integrate resumed with the same run id and args. If it fails again: resume again, same args.
- After it: commit, run all suites myself, show owner gate3/m2b-samples/ (syntax colours, alt-* alternatives) and styles tarball 266,596 -> ~646,804 bytes (fonts 366,128).
- OWNER APPROVED (2b): styles tarball growth accepted (fonts opt-in); syntax mapping frozen as function = text, type = text (names kept). Apply AFTER fix+integrate finishes (tokens.json code-type target danger -> text, regenerate, update docs/tests/samples). Dark comment brightness is the palette's own subtle text; left as is.
- 2b fix round done (gate3/m2b-fix-result.json). Committed with type=text as "Resolve the milestone 2b review..." and pushed. Deferred by fix agent: m2 (copy status gap, needs screen reader), m3 (class-less pre in prose; guide pipeline adds tabindex in M4), m6 (ToggleGroup empty legend React/Vue -> M3), prepare-demo font licence copy (when new guide imports fonts). m1: drawer close moved from microtask to timer, contradicting spec, on browser evidence.
- My full-suite run: background task boelfqec7, logs in gate3/m2b-final/, status.txt. After green: report 2b, pause for owner review, then M3.
- 2b GREEN at a0ed9b0 (my run): build, 1295 unit, typecheck, check:packages, build:docs /hawiyah/, browser 635/635, portals 81/81. Reported to owner; PAUSED for owner review before M3. Fix round not re-reviewed by an independent reviewer.

## Milestone 3 (owner said "Continue" on 2026-11-12)
- Scope = Gate 1 audit P1s (125 in component/packages/architecture areas, gate1/merged.json) + 28 recorded parity gaps (m2-reconcile.json) + E01..E08 (my list from M2/2b reviews). Inputs per bucket: gate3/m3/input-<bucket>.json (forms, dates-files-overlays, navigation-shell, feedback-content), input-cross.json.
- Stage 1 workflow gate3/m3/stage1-wf.js: 4 triage agents (tier-2, read-only) -> conventions agent (tier-1). Run wf_f595c9d7-be8, task w3i65rf3o, args {scratch, base:'a0ed9b0'}. Outputs gate3/m3/triage-<bucket>.json, conventions.json (clusters, notIn030, ownerDecisions).
- Stage 2 (to write after stage 1): spec per cluster (tier-1, read-only) -> foundation core+styles (tier-1) -> adapters (angular tier-1; react/vue/vanilla tier-2; two sequential agents per adapter if large) -> integrate playground/examples/tests/docs (tier-2, disjoint ownership as in integration-wf.js) -> review (2 tier-1) -> fix (tier-1) -> my full suites -> bump 0.3.0 -> ASK OWNER before publishing.
- Told owner M3 is larger than the "about 30 gaps" I stated; revise completion estimate once triage counts are in.
- Stage 1 done: 160 candidates -> 116 open, 15 partly, 26 fixed, 3 obsolete; 127 work items after merging duplicates, in 5 clusters (conventions.json). 9 items notIn030 (only the breaking half done now). 8 ownerDecisions: building on recommendations; PRESENTED to owner for veto on 2026-11-12 (no answer yet = proceed).
- Stage 2 workflow gate3/m3/stage2-wf.js: run wf_332ba090-6e2, task wdh66ur7q, args {scratch, base:'a0ed9b0'}. 26 agents: 5 spec (tier-1) -> foundation (tier-1) -> adapter chains (angular 3 tier-1; react 3, vue 3, vanilla 2 tier-2) -> 5 migrate (tier-2) -> verify (tier-2) -> 2 reviews (tier-1) -> fix (tier-1). Resume with the SAME args after a limit hit. Outputs in gate3/m3/: spec-<cluster>.json, spec-amendments.json, result-*.json, verify.json, review-{1,2}/review.json, fix-result.json.
- While it runs: commit+push WIP when the stop hook asks or at check-ins (label WIP honestly). After it: my full suites, bump seven packages to 0.3.0, then ASK OWNER for publish approval (trusted publishing setup is the owner's).

## 2026-11-12 09:30Z check-in
- Stage 2 run wf_332ba090-6e2: Specify (5) and Foundation done; Adapters phase running (angular:1, react:1 started; vue and vanilla chains not yet started at 09:29).
- WIP committed and pushed: 6bc000a (core/styles foundation + partial React/Angular). Suites not expected green at this commit.
- Stage 1 report with the eight owner decisions and the nine notIn030 items WAS sent to the user (revised estimate 35%). No veto received yet.
- Next check-in scheduled +90 min.

## 2026-11-12 11:02Z check-in
- Stage 2 run wf_332ba090-6e2: adapters react 1-3, vue 1-3, vanilla 1-2, angular 1-2 done; angular:3 running. Then Migrate, Verify, Review, Fix.
- WIP pushed (second WIP commit after 6bc000a). Suites not expected green.
- Next check-in +90 min.

## 2026-11-12 20:15Z resume
- Run wf_332ba090-6e2 hit the 5-hour limit at angular:3 (10 agents failed: angular:3, 5 migrate, verify, 2 reviews, fix). 16 of 26 done.
- WIP a8993c8 pushed (Angular tests of step 3, partial).
- Resumed with same script and args: task w8lid6f5s. Completed agents replay from cache; angular:3 continues from result-angular-3.json.
- Owner said "continue from where you left off" at ~20:14Z. No veto on the eight decisions.
- To check myself after the run: Angular "controlled, notification ignored" (STATE-02) reported impossible for DataTable sort, Menu/Popover open, TreeView expanded, PortalHeader open; Angular Slider starts at 0 vs midpoint in React/Vue (owner point from spec:forms-core); spec questions lists (owner-flagged choices) in each spec-*.json "questions".

## 2026-11-12 21:46Z check-in
- Resumed run (task w8lid6f5s): angular:3 and five migrate agents done; verify running (build, test 2574, typecheck, check:packages, build:docs pass; browser 617/635 then 1 failing: axe label-content-name-mismatch on expanded vanilla tree item). Reviews and fix still to come.
- WIP pushed. Watch: verify re-added maxlength="4" to the vanilla pin-input project although spec says PinInput has no maxlength; check review covers it.
- Next check-in +90 min.

## 2026-11-12 21:48Z container restart
- Container restarted during verify; task w8lid6f5s lost. Scratchpad, journal, node_modules, dist all survived; tree clean at 5033ddf.
- Resumed again: task w1gejst8j (same run id, same args). Verify continues from verify-progress.json; then review 1, review 2, fix.
- Check-in trig_01WrCdmLE5MKksyyVBti6sZi at 23:16Z still scheduled (its message names task w8lid6f5s; the current task is w1gejst8j).

## 2026-11-12 22:50Z PAUSE until Thursday 2026-11-19 (owner request, to save usage for other work)
- Owner: "pause when suitable and continue next Thursday ... unless I change my mind later". Stopped run wf_332ba090-6e2 (task w1gejst8j) right after Verify finished, ~17 min into the two reviews. Reviews did NOT finish (no review.json); fix round not started.
- Tree clean, HEAD 5033ddf pushed (WIP label). Verify result (gate3/m3/verify.json): build, typecheck:playground, test (217 files / 2574), check:packages, build:docs under /hawiyah/, portals 81/81 all pass; browser 634/635. The one failure: playground.spec.ts "WCAG components en light", axe label-content-name-mismatch on the expanded vanilla tree item; verify left it as "owner decision on the tree-item axe failure" (my view: a defect of the new named toggle button, fix it in the fix round, do not relax the test).
- State backup outside the container: private artifact "Hawiyah Pause State" (URL below once published). Restore files into the same scratchpad paths if the scratchpad is gone.
- RESUME (Thursday):
  1. If $S/gate1/notes.md is missing, restore from the artifact (Artifact read with paths, out_dir = scratchpad; state/ maps to: state/notes.md -> gate1/notes.md, state/gate1/* -> gate1/, state/m3/* -> gate3/m3/, state/gate3/* -> gate3/, state/journal.jsonl -> the run's journal). Then in the repo: export PATH=<node24-bin>:$PATH; pnpm install; pnpm build.
  2. If the run journal survived: Workflow({scriptPath: gate3/m3/stage2-wf.js, resumeFromRunId: 'wf_332ba090-6e2', args: {base:'a0ed9b0', scratch:S}}): everything through Verify replays from cache, reviews and fix run live. If resume by run id is refused: new script with only the Review and Fix phases copied from stage2-wf.js (lines ~95-120).
  3. After the fix round: read review-1/review.json, review-2/review.json, fix-result.json; run every suite myself; bump seven packages to 0.3.0; report passed/failed/not checked; ask explicit approval before `pnpm release:packages`.
- Agreed with owner for after 0.3.0: session model unchanged; tiers per agent (scaffold/pipeline/editor/landing/reviews top model; English component pages tier-3 medium + mechanical check + sampled review; Arabic pages tier-2; templates tier-2). Size each workflow to fit one 5-hour window.
- Open with owner, no answer yet (all built on recommendation, reversible before release): eight stage-1 decisions; spec choices (FileDropzone all-or-nothing, TagInput removal focus, visible MultiSelect filter label, DataTable sortKey/sortDirection, vanilla Calendar switch removed, Angular Stepper current = value, Vue Accordion slots, Angular hwTooltipTrigger, PortalHeader homeHref default '/', ServiceDetails stacked). Recommended but NOT built: Slider midpoint default in Angular; CookieConsent equal emphasis.
- Backup artifact published: <private page> (52 files under state/; local staging copy in $S/handoff). editor prototype bundle drops one vendored Angular chunk (public/editor/b/vendor/angular@22.2.3/chunk-DZE6DPAN.js), regenerable.
- Resume scheduled: one-shot 2026-11-19T06:00Z (assumed time; owner did not name one). Old 23:16Z check-in deleted. No workflow or agent is running.

## 2026-11-12 23:05Z handoff prepared (owner: "document the work for whatever future resume and prepare a prompt"; may continue later)
- Handoff written: $S/handoff/HANDOFF.md, RESUME-PROMPT.md, brief.md (original task verbatim). Bundle zip: $S/handoff-bundle/hawiyah-handoff.zip (sent to the owner). NOT committed to the repository on purpose: the repo is public and its history carries no working notes.
- Automatic Thursday resume CANCELLED (trigger deleted): resume is now on the owner's word only.
- Nothing running. Tree clean at 5033ddf.
- Later on 2026-11-12 the owner asked for the work to be pushed to git so that everything needed is there. This directory (handoff/) is that copy, with local paths, private links, plan figures and model names removed. It supersedes the line above that says the handoff is not committed.
