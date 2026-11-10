# Contributing to Hawiyah

Hawiyah is an early public source preview. Use Node 24 and the pnpm version pinned
in package.json, then run `pnpm install --frozen-lockfile`, `pnpm build:packages`,
and `pnpm dev`. The guide includes live examples and the API for all 77 entries.

For a visual change, prefer semantic token overrides or an existing variant.
For application-specific UI, compose the primitives or use
`pnpm new:component your-block`. A new reusable primitive needs shared styling,
framework-native APIs, accessible behavior, RTL support, cleanup, examples and
component documentation. Read AGENTS.md and the implementation contracts first.

Run focused tests while editing. Before submitting changes affecting public
behavior or packaging, run `pnpm build`, `pnpm test`, `pnpm test:browser`, and
`pnpm check:packages`. Playwright uses system Chromium when available or the
browser installed with `pnpm exec playwright install chromium`. The CI workflow
runs the package build, unit, type, tarball and root browser checks on every push
and pull request; it does not replace the manual framework and portal checks.

Use fictional data in examples. Preserve the calendar reference source and
third-party notices. Documentation must describe actual behavior and known
limits; DGA alignment and accessibility targets are not certifications.

Contributions are licensed under Apache 2.0. npm release work is tracked
separately from public source and documentation deployment.
