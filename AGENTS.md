# Nasaq — نسق

Public source preview, licensed under Apache 2.0. Start with README.md,
CONTRACT.md, EXPANSION.md, llms.txt, and the actual exports in packages/.

## Architecture

- tokens → styles; core → native vanilla, React, Vue and Angular adapters.
- Frameworks own their DOM. Never enhance framework-owned trees with vanilla.
- Keep core framework-independent and browser globals out of module evaluation.
- Public classes use `nq-`; variables use `--nq-`. Reset remains opt-in.
- Preserve Arabic/English, independent locale/direction, logical CSS, keyboard,
  accessible names, validation, focus return, and reduced-motion behavior.
- Extend through semantic tokens, documented variants and composition first.
  Keep behavior, styles, APIs, examples and component guidance synchronized.
- Calendar values remain ISO dates. Preserve the pinned Umm al-Qura provider,
  supported range and exhaustive conversion oracle; no silent Intl fallback.
- Current logo is Arabic-only outlined Aref Ruqaa. No runtime logo-font download.
- The NIC header logo keeps its original colors in light mode; in dark mode use
  `filter: brightness(0) invert(1)` to make all artwork white, preserving transparency.
- DGA-informed does not mean endorsed or certified. Document evidence and gaps.

## Development and verification

Use the pinned Node/pnpm setup in README.md. Run focused behavior tests for
behavior changes, typecheck changed adapters, and build real consumers when
exports or packaging change. `pnpm build:docs` builds the public guide;
`NASAQ_BASE_PATH=/nasaq/ pnpm build:docs` checks the GitHub Pages deployment path.
`pnpm check:packages` creates and verifies local tarballs without publishing.

Never commit credentials, .env values, local absolute paths, real applicant data,
or test artifacts. Preserve bundled third-party licenses and provenance.
Package manifests remain `private: true` while npm release preparation is pending.
GitHub Pages deploys the guide from main; npm publication is a separate action.
