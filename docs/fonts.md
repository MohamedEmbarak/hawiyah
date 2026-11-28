# Opt-in fonts

The tokens name IBM Plex Sans Arabic (`--hw-font-sans`) and IBM Plex Mono
(`--hw-font-mono`). `@hawiyah/styles` ships both as an opt-in stylesheet,
`fonts.css`. The component stylesheet `styles.css` never imports it and still
fetches no text font: font loading stays an application choice, as
`docs/dga-reference.md` records.

```ts
import '@hawiyah/styles/styles.css';
import '@hawiyah/styles/fonts.css'; // optional
```

```html
<link rel="stylesheet" href="/vendor/hawiyah/styles.css">
<link rel="stylesheet" href="/vendor/hawiyah/fonts.css">
```

The font files are referenced relative to the stylesheet (`./assets/fonts/…`),
so serve the package's `dist` directory as it is.

## What the file declares

| Family | Weights | Files | `unicode-range` |
| --- | --- | --- | --- |
| IBM Plex Sans Arabic | 400, 500, 600, 700 | One complete file per weight (Arabic and basic Latin) | None; IBM publishes these files without one |
| IBM Plex Mono | 400 | IBM's five split files: Latin1, Latin2, Latin3, Pi, Cyrillic | IBM's values, copied from its split stylesheet |
| Hawiyah Code Arabic | 400 | The IBM Plex Sans Arabic regular file again | Arabic blocks only |

Every rule sets `font-display: swap`: text shows in the fallback face until the
font has loaded. A browser downloads a file only when the page uses a character
in its range at that weight. A page of Latin code downloads the first IBM Plex
Mono file (17.5 kB) only. IBM's `local()` sources are omitted so that every
visitor receives the recorded files.

## Arabic inside code

IBM Plex Mono has no Arabic letters, so Arabic string literals and comments in
code would fall to the platform's monospace fallback, where joining is often
poor. `--hw-font-mono` therefore lists a second family after IBM Plex Mono:

```
"IBM Plex Mono", "Hawiyah Code Arabic", "SFMono-Regular", Consolas, monospace
```

`Hawiyah Code Arabic` is a second CSS family name for the unchanged IBM Plex
Sans Arabic regular file, limited by `unicode-range` to
`U+0600-06FF, U+0750-077F, U+0870-08FF, U+FB50-FDFF, U+FE70-FEFC`. Only Arabic
characters in code use it. Latin code can never fall into the proportional sans
face, including on a device that has IBM Plex Sans Arabic installed and none of
the listed monospace faces. Without `fonts.css` the name is unknown to the
browser and is skipped, so nothing changes for applications that do not import
the file. The browser reuses the file it fetched for the sans family.

The monospace family and the Arabic face inside code are not covered by in-repo
Platforms Code references; they are Hawiyah design choices.

## Licence and provenance

The fonts are Copyright © 2017 IBM Corp. with Reserved Font Name "Plex", under
the SIL Open Font License 1.1. That licence is separate from Hawiyah's
Apache 2.0 licence.

- The files are byte-for-byte copies from IBM's packages on the npm registry:
  `@ibm/plex-sans-arabic` 1.1.0 (`fonts/complete/woff2`) and `@ibm/plex-mono`
  2.5.0 (`fonts/split/woff2`). Nothing is subset, renamed or re-compressed. A
  modified file could not keep the reserved name.
- `packages/styles/src/assets/fonts/ibm-plex-LICENSE.txt` is IBM's licence text,
  unchanged.
- `packages/styles/src/assets/fonts/ibm-plex-provenance.json` records, for each
  package, its name, version, licence, registry tarball, tarball hash and
  integrity value, and for each file its path in the package, size and SHA-256.
- `NOTICE` at the repository root and in the styles package names the fonts.

`packages/styles/test/fonts-and-code.test.ts` fails when a shipped file differs
from its record, when `fonts.css` references a file that is absent or
unrecorded, when a `unicode-range` differs from the record, or when any other
stylesheet declares a font or imports `fonts.css`.

To update a font: download the new package version from the registry, replace
the files without processing them, and update the version, hashes and, for
IBM Plex Mono, the `unicode-range` values in both the provenance record and
`fonts.css`.

## Size

The nine font files total 366,128 bytes. WOFF2 files do not compress further, so
the packed `@hawiyah/styles` tarball grows by about that much: from
266,596 bytes to 645,539 bytes (`npm pack --dry-run`).

## Open items

- `scripts/check-packages.mjs` does not yet repeat the two rules above against
  the packed tarball (every `url()` in `fonts.css` resolves inside it, and
  `styles.css` declares no font other than the riyal symbol face). The unit test
  checks the same rules against the sources and the built `dist`.
- A deployed guide that uses `fonts.css` must carry the IBM licence text beside
  its own notices, as it does for the riyal symbol font.
- Only weight 400 of IBM Plex Mono is shipped. Bold code is synthesised by the
  browser.
