# Public source, guide, and package releases

Nasaq is available from [MohamedEmbarak/nasaq](https://github.com/MohamedEmbarak/nasaq)
as a **0.2 source preview**, with an interactive guide at
[GitHub Pages](https://mohamedembarak.github.io/nasaq/). Original project code,
documentation, and artwork use [Apache License 2.0](../LICENSE). Bundled fonts
and calendar reference data retain their own licenses and attribution; see
[NOTICE](../NOTICE) and their adjacent third-party notices.

**The npm packages are not published.** The seven library manifests keep
`private: true` to prevent accidental registry publication. Clone the public
repository and use the documented workspace build or inspected local tarballs.
Do not advertise an `npm install @nasaq/...` flow until those packages exist in
the verified registry scope.

## The public guide

The guide contains getting-started instructions, live component recipes,
component APIs and lifecycles, framework setup, themes, Arabic/RTL behavior,
calendar provenance, layout composition, and extension guidance. The source
lives in `apps/playground`; the brand guide is in `brand`.

GitHub Pages serves this project beneath `/nasaq/`. A deployment must use that
base path for scripts, styles, images, fonts, downloads, and guide navigation.
Check direct links to component pages, reloads, search, narrow screens,
Arabic/RTL, and reduced-motion behavior against the built site. Deploy only
reviewed build output from this public repository. The documentation site does
not perform npm publication or connect its simulated service journeys to a
backend.

The [Pages workflow](../.github/workflows/pages.yml) builds with:

```sh
pnpm install --frozen-lockfile
NASAQ_BASE_PATH=/nasaq/ pnpm build:docs
```

It publishes `apps/playground/dist` through GitHub Pages. The separate `pnpm build`
command also builds the three native framework examples for local verification.

## Before the first npm release

1. Confirm ownership of the npm scope and every package name. Keep package
   names provisional until this is verified.
2. Define the intended API stability and supported runtime/framework versions.
   Use prerelease versions while contracts or verification remain incomplete.
3. Review repository, homepage, bugs, license, exports, peer dependencies, and
   explicit file allowlists for every package.
4. Build and inspect the actual archives, including source maps, declarations,
   CSS, assets, and licenses. Exclude credentials, local paths, private data,
   caches, and unrelated development output.
5. Install those archives in clean consumer projects and verify exported APIs,
   native framework examples, styles, calendar data, and accessibility behavior.
6. Record release-specific results and remaining limits in the validation and
   component catalog. A source preview is not a production-readiness claim.
7. Prepare version notes and migrations. Remove the publication guards only as
   part of an explicitly authorized registry release to the verified scope.

## Release readiness

| Gate | Evidence expected |
|---|---|
| Package contents | Reviewed archive file list with source, types, CSS, required assets and notices only |
| Framework support | Clean consumer builds against declared peer ranges; Angular package-format validation |
| Runtime behavior | Browser checks for keyboard, focus, state updates, forms, and teardown |
| Server rendering | Import and hydration checks for adapters that claim SSR support |
| Accessibility | Automated findings plus manual keyboard and relevant screen-reader review |
| Design | Evaluated theme, density, direction, and responsive combinations |
| Documentation | Runnable examples, API reference, known limits, and extension guidance |
| DGA statements | Versioned evidence and explicit gaps; no unsupported certification claim |
| Ownership and licensing | Confirmed package scope, Apache-2.0 metadata, asset provenance and upstream notices |

## Discoverability and accuracy

Describe **Nasaq — نسق** as an independent, Arabic-first system with vanilla
JavaScript, React, Vue, and Angular adapters. Relevant searchable terms include
**DGA**, **DGA compliance**, **Platforms Code**, **Saudi design system**, **KSA**,
**Unified Design System**, **RTL**, **هيئة الحكومة الرقمية**, and **كود المنصات**.
Use those terms to explain the reference and documented evidence; they do not
suggest official ownership or certification. Read [DGA alignment](alignment.md)
before making a deployment-specific compliance statement.

Track changes to types, exports, behavior, CSS contracts, and adapter support.
Breaking changes need migration instructions. The [validation record](validation.md)
distinguishes passing checks from remaining evaluation; keep that distinction in
release notes and package descriptions.
