# Public source, guide, and package releases

Hawiyah is available from [MohamedEmbarak/hawiyah](https://github.com/MohamedEmbarak/hawiyah)
as a **0.2 source preview**, with an interactive guide at
[GitHub Pages](https://mohamedembarak.github.io/hawiyah/). Original project code,
documentation, and artwork use [Apache License 2.0](../LICENSE). Bundled fonts
and calendar reference data retain their own licenses and attribution; see
[NOTICE](../NOTICE) and their adjacent third-party notices.

**Version 0.2.0 is on npm** as the first registry release of all seven
`@hawiyah/*` packages. It is a pre-1.0 release: a minor version may still change
APIs, and publication is not a production-readiness or DGA certification claim.

```sh
npm install @hawiyah/styles @hawiyah/react   # or vanilla, vue, angular
```

The source manifests keep `private: true`, so running `npm publish` inside a
package directory fails. Releases go through one script that publishes the
same tarballs the package check verified.

## The public guide

The guide contains getting-started instructions, live component recipes,
component APIs and lifecycles, framework setup, themes, Arabic/RTL behavior,
calendar provenance, layout composition, and extension guidance. The source
lives in `apps/playground`; the brand guide is in `brand`.

GitHub Pages serves this project beneath `/hawiyah/`. A deployment must use that
base path for scripts, styles, images, fonts, downloads, and guide navigation.
Check direct links to component pages, reloads, search, narrow screens,
Arabic/RTL, and reduced-motion behavior against the built site. Deploy only
reviewed build output from this public repository. The documentation site does
not perform npm publication or connect its simulated service journeys to a
backend.

The [Pages workflow](../.github/workflows/pages.yml) builds with:

```sh
pnpm install --frozen-lockfile
HAWIYAH_BASE_PATH=/hawiyah/ pnpm build:docs
```

It publishes `apps/playground/dist` through GitHub Pages. The separate `pnpm build`
command also builds the three native framework examples for local verification.

## Publishing a release

All seven packages share one version and release together.

1. Bump `version` in the root, library, playground, and example manifests,
   `components.json`, and `packages/tokens/tokens.json`. The guide reads its
   version from `apps/playground/package.json`.
2. Run the focused checks for what changed, then the dry run:

   ```sh
   pnpm release:packages
   ```

   This rebuilds the packages, runs the full `check:packages` consumer check
   with `HAWIYAH_RELEASE=1` (which drops `private` from the staged manifests
   only), and runs `npm publish --dry-run` on each verified tarball.
3. Record the release in the [validation record](validation.md) and
   [changelog](../CHANGELOG.md), commit, and confirm the working tree is clean.
4. Push the tag `v<version>` on the release commit, for example by creating a
   GitHub release. The [publish workflow](../.github/workflows/publish.yml)
   checks that the tag matches the package version, repeats the build and
   consumer check, and runs `node scripts/publish-packages.mjs --publish` with
   npm provenance. It authenticates with the `NPM_TOKEN` repository secret: a
   granular npm token with read and write access to the `@hawiyah` scope and
   two-factor bypass enabled. Once the packages exist, a trusted publisher for
   this workflow can be configured on each npm package and the token removed.
   A manual run of the workflow is a dry run unless **publish** is checked.

   Packages publish in dependency order (tokens, styles, core, vanilla, react,
   vue, angular). Versions already on the registry are skipped, so an
   interrupted release resumes by running it again. Prerelease versions such
   as `0.3.0-beta.1` publish under the `next` dist-tag and leave `latest` alone.
   The same script can publish from a maintainer machine logged in to npm.
5. Merge the release commit to `main` only after the packages are on npm: the
   Pages guide deploys from `main` and tells readers to `npm install` them.

A published version cannot be reused, even after `npm unpublish`. Fix a bad
release with a new patch version, and use `npm deprecate` to warn consumers
away from the broken one.

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

Describe **Hawiyah — هوية** as a UI component library built to comply with the
DGA Platforms Code, with JavaScript, React, Vue, and Angular adapters. Relevant searchable terms include
**DGA**, **DGA compliance**, **Platforms Code**, **Saudi design system**, **KSA**,
**Unified Design System**, **RTL**, **هيئة الحكومة الرقمية**, and **كود المنصات**.
Use those terms to explain the reference and documented evidence; they do not
suggest official ownership or certification. Read [DGA alignment](alignment.md)
before making a deployment-specific compliance statement.

Track changes to types, exports, behavior, CSS contracts, and adapter support.
Breaking changes need migration instructions. The [validation record](validation.md)
distinguishes passing checks from remaining evaluation; keep that distinction in
release notes and package descriptions.
