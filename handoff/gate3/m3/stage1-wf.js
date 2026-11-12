export const meta = {
  name: 'hawiyah-m3-triage',
  description: 'Milestone 3, stage 1: check which of the 160 recorded P1 and parity findings are still open on the current tree, then write the cross-adapter conventions the fixes will follow',
  phases: [
    { title: 'Triage', detail: 'four read-only agents verify each recorded finding against the current source' },
    { title: 'Conventions', detail: 'one agent fixes the cross-cutting rules and the work split' },
  ],
}
const S = args.scratch
const REPO = '<repo>'
const BASE = `
Repository: ${REPO} (pnpm monorepo, Node 24, pnpm 11.25.0; start every shell command with: export PATH=<node24-bin>:$PATH). Read AGENTS.md first; its rules apply. Branch claude/zen-rubin-wtib31 at commit ${args.base}; the packages are built (packages/*/dist). This step is READ-ONLY for the repository: do not edit, create or delete any file under ${REPO}, do not commit, do not run builds. Write only under ${S}/gate3/m3/. Be economical: targeted reads and searches; load JSON with a script and print only what you need.
Background: Hawiyah is a UI component library built to comply with the DGA Platforms Code: tokens, styles, core, and vanilla, React, Vue and Angular adapters (seven packages, one version, 85 catalogue components). An audit of the published 0.2.1 packages recorded P1 findings (parity between adapters, accessibility, behaviour, visual differences). Since then three milestones changed the packages a great deal: (1) P0 fixes; (2a) no built-in strings and no default locale, every text a required input with the same name in the four adapters, missing text renders nothing and warns in development (CONTRACT.md "Text and localisation"), flat stylesheet, packaged icons, deterministic Angular ids (HwIdSource), fragment links under a base href; (2b) code and prose styles, opt-in fonts, CopyButton, SideNavigation, bindLinkNavigation, ToggleGroup labelHidden, PortalHeader notice and actions regions in all adapters, Angular layout primitives carry class and attributes on the host. CHANGELOG.md "Unreleased" lists what changed. Milestone 3 closes what is still open before version 0.3.0, which is already a breaking release.
`
const buckets = ['forms', 'dates-files-overlays', 'navigation-shell', 'feedback-content']

phase('Triage')
const triagePrompt = (b) => `${BASE}
TASK: triage the findings in ${S}/gate3/m3/input-${b}.json against the CURRENT source. Ids like "actions-2" come from the audit of 0.2.1 (fields: adapters, description, evidence, expected, fix, verifierNote); ids starting with R or E were recorded during milestones 2 and 2b and were open on 2026-11-11.
For every finding decide, by reading the current source of each adapter it names (packages/react/src, packages/vue/src, packages/angular/src, packages/vanilla/src, packages/core/src, packages/styles/src) and, where a claim is cheap to check by running something against the built packages (a small node script under ${S}/gate3/m3/tmp-${b}/, or an existing test), by running it:
- "fixed": the described defect or difference no longer exists. Cite file:line or a test that proves it.
- "partly": some adapters or some parts are fixed. Say exactly what remains, per adapter.
- "open": still as described (adjust the description to today's names and files).
- "obsolete": the thing described no longer exists or the finding concerned the old guide only.
Do not guess: a finding you could not verify is "open" with note "not verified". Two findings that describe the same remaining work get the same "sameAs" id. For each finding that is open or partly, add: remaining (what must change, per adapter, with file:line of the code concerned), kind (a11y | behaviour | api | visual | ssr | keyboard), breaking (true when closing it renames or removes a public input, changes a default or changes rendered markup that applications can depend on), size (S: under an hour for one adapter; M; L: new mechanism or new public surface in several adapters), and themes: zero or more of form-reset, angular-host-attributes, name-without-visible-label, required-marker, validation-message, open-state, value-display, read-only, rich-content, item-shape, type-ahead, layout-difference, other.
Write ${S}/gate3/m3/triage-${b}.json: { bucket: "${b}", items: [{ id, subject, title, status, evidence, remaining, kind, breaking, size, themes, sameAs, note }] } covering EVERY id of the input, and return only counts per status and the three largest open items.`
const triage = await parallel(buckets.map((b) => () => agent(triagePrompt(b), { label: `triage:${b}`, phase: 'Triage', model: 'tier-2' })))

phase('Conventions')
const conventions = await agent(`${BASE}
Four agents triaged the recorded findings: ${S}/gate3/m3/triage-<bucket>.json for ${buckets.join(', ')} (inputs with the full audit records: ${S}/gate3/m3/input-<bucket>.json; cross-cutting records: ${S}/gate3/m3/input-cross.json). The open and partly items will be specified per component family by several agents who cannot see each other, then implemented per adapter by others. Your job is to make their results consistent.
PART 1, conventions. For each cross-cutting theme that the open items share, read how each adapter does it today (cite file:line), decide ONE rule, and write the exact mechanics per adapter (React, Vue, Angular, vanilla) so that two specifiers working apart produce the same public names and the same rendered result. At least:
- native form reset: what each adapter's control shows, holds in its model and emits after a reset, controlled and uncontrolled;
- Angular host attributes: how class, id, aria-* and data-* written on a host reach the element that needs them, and how a component is named without a visible label (owner decision: aria-label / aria-labelledby written on the host are forwarded; milestone 2b already did this for hw-section and made layout hosts the root: see packages/angular/src/layouts.ts and CONTRACT.md); when the host becomes the root and when attributes are moved;
- required marker; hint, error and validation message (order, element, role, when aria-invalid is set: owner decision is after a failed submission or an explicit invalid input, never merely because a message text is missing);
- controlled and observable open, visibility and query state: one naming pattern per adapter;
- value display and formatting without a built-in locale (the application passes a formatter or the text);
- read-only semantics; rich content (nodes, slots, templates, projection) and what an Angular component must accept where React takes a node; item shapes of list-like components (one field name per meaning across adapters); type-ahead shared in core; keyboard focus when a control disables itself;
- which adapter is the reference when adapters differ: the Platforms Code guidance recorded in this repository (docs/, components.json, CONTRACT.md) decides before a majority does; if silent, the behaviour with the better accessibility result; say how to record the choice;
- renames and removals: 0.3.0 is breaking already, so no deprecated aliases; every rename is listed for the changelog with a migration line;
- the text contract for any new text; tests: the same case ids in the four adapters; what must hold under server rendering and hydration.
PART 2, plan. From the triage: (a) list items you judge wrongly triaged, with evidence; (b) merge duplicates; (c) propose the split of all open and partly items into at most five specification clusters of similar weight that minimise overlap in source files (give ids per cluster and the source files each cluster touches per adapter); (d) list items that should NOT be closed in 0.3.0, each with a concrete reason (for example it needs a new component, or closing it is purely additive and large while nothing in the guide needs it), and say what is lost by waiting; (e) list decisions only the owner can take, each with a recommendation, at most eight.
Write ${S}/gate3/m3/conventions.json { conventions: [{ theme, rule, perAdapter: { react, vue, angular, vanilla }, evidence, tests }], wronglyTriaged: [], duplicates: [], clusters: [{ name, ids, files: { react, vue, angular, vanilla, core, styles } }], notIn030: [{ id, reason, lost }], ownerDecisions: [{ question, recommendation, why }], counts: { open, partly, fixed, obsolete } } and return a summary under 400 words with the counts, the clusters with their sizes, the notIn030 ids and the owner decisions.`, { label: 'conventions', phase: 'Conventions', model: 'tier-1' })
return { triage, conventions }
