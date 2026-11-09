# Hawiyah — هوية

A UI component library built to comply with the DGA Platforms Code, licensed
under Apache 2.0. Start with README.md,
CONTRACT.md, EXPANSION.md, llms.txt, and the actual exports in packages/.

## Architecture

- tokens → styles; core → native vanilla, React, Vue and Angular adapters.
- Frameworks own their DOM. Never enhance framework-owned trees with vanilla.
- Keep core framework-independent and browser globals out of module evaluation.
- Public classes use `hw-`; variables use `--hw-`. Reset remains opt-in.
- Preserve Arabic/English, independent locale/direction, logical CSS, keyboard,
  accessible names, validation, focus return, and reduced-motion behavior.
- Extend through semantic tokens, documented variants and composition first.
  Keep behavior, styles, APIs, examples and component guidance synchronized.
- Calendar values remain ISO dates. Preserve the pinned Umm al-Qura provider,
  supported range and exhaustive conversion oracle; no silent Intl fallback.
- Current logo is the Arabic word هوية in outlined Aref Ruqaa, colored with
  Platforms Code variables. No runtime logo-font download. Regenerate artwork
  with brand/build-assets.py and the loader with brand/build-loader.mjs.
- The NIC header logo keeps its original colors in light mode; in dark mode use
  `filter: brightness(0) invert(1)` to make all artwork white, preserving transparency.
- Describe Hawiyah as built to comply with the DGA Platforms Code, in a formal
  register. It is not an official DGA product and holds no certification:
  document compliance evidence and open items instead of claiming either.

## Development and verification

Use the pinned Node/pnpm setup in README.md. Run focused behavior tests for
behavior changes, typecheck changed adapters, and build real consumers when
exports or packaging change. `pnpm build:docs` builds the public guide;
`HAWIYAH_BASE_PATH=/hawiyah/ pnpm build:docs` checks the GitHub Pages deployment path.
`pnpm check:packages` creates and verifies local tarballs without publishing.

Never commit credentials, .env values, local absolute paths, real applicant data,
or test artifacts. Preserve bundled third-party licenses and provenance.
Source package manifests stay `private: true`. Publish only through
`pnpm release:packages`, which strips it from the verified staged tarballs, and
only when explicitly authorized. The seven packages share one version.
GitHub Pages deploys the guide from main; npm publication is a separate action.
