# Roadmap and acceptance gates

Nasaq is in `0.1` development. This roadmap defines outcomes and evidence rather than declaring unfinished work complete. Implementation can proceed in parallel where the shared contracts are settled, but later adapters must be checked against the working foundation.

The [validation record](validation.md) identifies tested snapshots, exact counts, environments, and limitations. Evidence covers both the initial 27 components and targeted cases for the 50 additions; each claim remains limited to the named behavior or consumer check.

## Status vocabulary

- **Planned:** the work is in scope; this does not imply source exists.
- **Built:** the implementation exists for the named package or example; this does not imply all promised behavior has been verified.
- **Verified:** identified checks have passed for a stated configuration and scope. Record the evidence and remaining limitations.

The machine-readable [component catalog](../components.json) tracks these fields separately. A component can be built in one adapter and still planned in another.

## DGA reference migration

The default appearance is now `dga`, using mapped, verified foundation values from the supplied snapshot exported on **2026-10-29**; the teal/ivory `nasaq` theme is opt-in. This is a source-based visual migration, with its own checkpoints in addition to the existing component implementation. The export date identifies the supplied snapshot, not an official release version.

| Checkpoint | Source or implementation scope | Acceptance gate |
|---|---|---|
| Reference inventory | 17 files decoded; six files over the 32 MiB transfer limit remain unavailable; no standalone web component library supplied | Preserve source hashes and node references in the evidence record; do not present uninspected files as covered |
| Foundation mapping | Use the local foundation collections; resolve imported component-version conflicts separately; make mapped DGA values the default and keep Nasaq opt-in | Value/alias checks, contrast checks, representative rendering, and explicit treatment of implementation choices |
| Vanilla service and form templates | Referenced header/footer, conditional secondary navigation, service-information card, feedback and mobile radial-step presentation | Compare the inspected 1440px/430px examples and test 320px/intermediate reflow, Arabic/English content and keyboard behavior |
| Input states and motion | Trace supported states and transitions to valid source destinations; do not invent unspecified timings | State/keyboard checks, focus behavior and reduced-motion equivalents; unresolved prototype records remain unverified |
| Framework and template expansion | Apply the shared foundation to native React, Vue and Angular; review additional readable templates; keep seasonal designs opt-in | Per-adapter visual and behavioral checks, stable APIs and unchanged calendar conversion/value contracts |
| Guide and requirement evidence | Update defaults, live examples and reference guidance alongside implementation | Record applicable requirements, deviations, tested revisions and remaining gaps; official recognition remains separate |

[The reference record](dga-reference.md) holds the source boundary and mapping evidence. The earlier implementation and test history below does not automatically verify the new default theme, all source variants, or full template parity. Keep new results scoped to the configurations actually checked; no checkpoint alone establishes certification.

## Phases

| Phase | Deliverable | Planned | Built | Verified |
|---|---|---|---|---|
| 0. Product and contracts | Independent identity, DGA evidence model, package boundaries | Yes | Brand kit, initial/expansion contracts, and documentation | Brand/source/API evidence recorded separately |
| 1. Shared foundation | Tokens, themes, styles, core helpers, exports | Yes | Seven package sources, responsive layout helpers, table-backed calendar provider | Targeted helpers, contrast pairs, canonical calendar reference checks, and isolated package consumers passed |
| 2. Vanilla reference | Semantic HTML, explicit enhancement, cleanup | Yes | Recipes/controllers cover the 77-entry scope | Per-controller assertions and tested browser states belong in catalog/validation; native/static recipes need no invented controllers |
| 3. Native adapters | React, Vue, and Angular rendering/forms | Yes | All three adapters export the expanded component scope | Targeted behavior, SSR/hydration, forms, and real consumers are separate checks; no blanket parity guarantee |
| 4. Blocks and journeys | Discovery, application/review, requests | Yes | Three editable blocks, generator, playground, and three framework examples | Journey and separate framework-flow evidence recorded; each applies to its documented states |
| 5. Expanded inspection tools | 77-component gallery, 22 native inputs, Saudi recipes, layout studio | Yes | Playground routes and coverage/integration guides | Validate every route and representative state; gallery presence is not a full variant audit |
| 6. Release hardening | API stability, accessibility, archives, documentation | Yes | Local tarball checks and documented gates | Current consumers, manual accessibility, cross-browser and supported-version matrices remain distinct gates |
| 7. Public source and guide | Standalone repository and GitHub Pages documentation | Yes | Public source and comprehensive guide prepared; deployment is verified separately | npm publication remains a separate future release |

## Component scope

The catalog contains **77 entries: the initial 27 plus 50 additions**. The [coverage guide](coverage.md) lists them by category and separately maps all 22 standard HTML input types. Field is label/help/error composition; TextField is text entry. Layout primitives, service patterns, and advanced interactions have explicit contracts. Aliases and cosmetic variants do not inflate the count.

This is Nasaq's defined scope, not a claim to reproduce the complete current DGA catalog or every possible modern UI. Prioritize further primitives by real product needs, a clear composition boundary, and maintenance cost.

Calendar and DatePicker support Gregorian and Umm al-Qura display with date-only ISO values; [calendar reliability](date-calendars.md) defines the reference and limits. MultiSelect provides searchable checkboxes; Combobox stays local and single-select. DataTable adds sorting, not virtualization/editing. Maps, charts, rich/code editors, PDF, CAPTCHA, uploads, authentication, and payments follow [specialist integration recipes](integrations.md); engines and backends are application dependencies.

Shared interaction logic is project-owned; Zag is not a dependency. The Angular example is a Vite JIT consumer of the APF library, not evidence for production AOT/SSR/hydration support.

## Prove the foundation before expanding

Use representative components to expose architectural problems early: a Button for styles and events, a TextField for forms, Tabs for keyboard navigation, a Dialog for focus and lifecycle, and a Combobox for search, selection, and accessibility. Verify their behavior across adapters before treating shared patterns as stable.

## Journeys that demonstrate usefulness

| Journey | Expected behavior | Verification focus |
|---|---|---|
| Service discovery | Search/filter, service information, requirements, and clear next action | Keyboard navigation, empty states, narrow screens, translated content |
| Application and review | Data entry, conditional fields, validation, review, and confirmation | Error recovery, preserved data, focus movement, state consistency |
| Request management | Request list, filtering, status detail, and next actions | Table semantics, empty/error states, filtering, responsive presentation |

Examples use fictional data. Any simulated submission, upload, authentication, or persistence must be described accurately in the example documentation and UI where it affects the user.

## Release gates

The first npm release needs a clean package-consumer build for each claimed adapter, documented peer support, meaningful behavioral checks, browser coverage, keyboard and accessibility review, source-to-package export checks, and a reviewed scope matrix. SSR and hydration are verified separately wherever claimed. Measure bundle output rather than promise an unsupported size budget.

Themes require contrast and state review; RTL/LTR, mode, and density need a stated tested matrix. Source/API changes require documentation updates. DGA alignment needs its own evidence review; ordinary tests do not certify compliance.

The expansion adds form reset and repeated-value checks, readonly/disabled semantics, calendar switching/range boundaries and conversion provenance, overlays/focus restoration, tree navigation, sorting, responsive layout, and source-to-export reconciliation. Native browser widgets and specialist engine integrations require evaluation in the actual consuming environment.

## Evidence record

For each validation run, record the revision or build, date, command or manual scenario, environment/framework/browser, outcome, and known limitations. Keep a failed or unperformed check visible. Marking an item verified means the named scope passed, not that every possible integration is guaranteed.
