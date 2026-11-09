# Changelog

All seven `@nasaq/*` packages share one version. Versions below 1.0 may change
APIs in a minor release; read the notes before upgrading.

## 0.2.0 — 2026-11-09

First npm release of `@nasaq/tokens`, `@nasaq/styles`, `@nasaq/core`,
`@nasaq/vanilla`, `@nasaq/react`, `@nasaq/vue`, and `@nasaq/angular`.

- Packages install from npm: `npm install @nasaq/styles @nasaq/<adapter>`.
- Internal `@nasaq/*` dependencies are pinned to the exact matching version.
- `pnpm release:packages` builds, verifies, and publishes the checked tarballs;
  source manifests stay `private: true`. Pushing a `v*` tag publishes through
  GitHub Actions with npm provenance.
- The guide's install commands and downloaded example projects use the
  published packages instead of local tarballs.

There is no migration from 0.1, which was a source-only preview and was never
published to npm.
