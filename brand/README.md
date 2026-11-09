# هوية — Brand guidelines

تم التطوير بواسطة فريق التطوير في قطاع المنصات الوطنية - مركز المعلومات الوطني

Developed by the Development Team in the National Platforms Sector — National Information Center.

Hawiyah is a UI component library built to comply with the Digital Government
Authority (DGA) Platforms Code. Its logo is the Arabic word **هوية** in
**Aref Ruqaa Bold**, converted to SVG paths, with no separate symbol or Latin
lettering. The identity uses the Platforms Code theme variables for color and
IBM Plex Sans Arabic, the Platforms Code typeface, for interface text.
[decision.json](decision.json) records the identity, typography, palette, and
motion specification.

Open the guidelines in [Arabic](index.html) or [English](index-en.html), or view
[the preview](previews/arabic-wordmark.png). The logo stays Arabic in either
interface language. The earlier teal palette remains available to products only
as the opt-in Signature theme (`data-hw-theme="hawiyah"`); it is not part of the
brand identity.

## Current artwork

| File | Use |
| --- | --- |
| `assets/hawiyah-wordmark.svg` | Primary wordmark, `#1B8354` |
| `assets/hawiyah-wordmark-reverse.svg` | Primary-50 `#F3FCF6` on primary or dark backgrounds |
| `assets/hawiyah-wordmark-mono.svg` | Monochrome, default text `#161616` |
| `assets/hawiyah-wordmark-white.svg` | White on primary or dark backgrounds |
| `assets/favicon.svg` | White wordmark on a primary browser tile |
| `assets/hawiyah-pattern.svg` | Decorative wordmark repetition |
| `editable-wordmark.svg` | Editable Arabic outline group |

All wordmarks use a **144 × 112** view box. The older `hawiyah-symbol`,
`hawiyah-lockup-ar`, `hawiyah-lockup-en`, and `hawiyah-lockup-bilingual` filenames and
their color variants are compatibility aliases containing **exactly the same
Arabic-only artwork**. They no longer denote separate symbols or language variants.
Use `hawiyah-wordmark` for new integrations.

Every current SVG contains outlined Arabic lettering. No installed font, CSS,
font download, package dependency, or network request is needed to display it.
The source Aref Ruqaa TTF is used only by the offline generator and is bundled
with its original OFL notice for reproducibility. It is not loaded by application
styles or component packages.

Prefer 48 CSS pixels or wider for normal logo placement. Smaller samples are
provided for inspection and the dedicated favicon handles browser tabs. Preserve
the view-box proportions and at least 12 units of clear space around the artwork.
Do not mirror, stretch, rotate, separate the letters, or add another symbol or
Latin word to the logo. A linked logo needs a translated accessible name such as
“Hawiyah home”; decorative repeats use empty alt text.

## Animated wordmark loader

The Arabic lettering follows a reconstructed handwriting sequence: the initial
hāʾ forms its hook, outer bowl and inner stroke, then joins the wāw head and
tail. After a pen lift, the initial yāʾ flows into the stem and loop of the
final tāʾ marbūṭa, and the two-dot strokes are added below yāʾ and above tāʾ
marbūṭa. The exact outline is retained and the letter counters stay open; the
build fails if any solid pixel of the finished word is left uninked.

The transparent GIF loop lasts **3.6 seconds**, with **90 frames at 25 fps**.
It holds the complete wordmark, clears, and restarts without reverse erasing.

- `assets/hawiyah-wordmark-loader.gif`: primary `#1B8354`, 128 × 128 pixels.
- `assets/hawiyah-wordmark-loader-256.gif`: primary `#1B8354`, 256 × 256 pixels.
- `assets/hawiyah-wordmark-loader-white.gif`: white, 128 × 128 pixels.
- `assets/hawiyah-wordmark-loader-white-256.gif`: white, 256 × 256 pixels.

Use a static wordmark for reduced motion and supply the loading status in text.
Translate the status and remove the loader when the operation finishes.

```html
<p role="status">
  <picture>
    <source media="(prefers-reduced-motion: reduce)"
            srcset="./brand/assets/hawiyah-wordmark.svg" type="image/svg+xml">
    <img src="./brand/assets/hawiyah-wordmark-loader.gif" width="64" height="64" alt="">
  </picture>
  <span>Loading…</span>
</p>
```

Resolve asset paths against the consuming application’s base path. The older
`hawiyah-loader*.gif` filenames remain identical compatibility aliases.

For dark surfaces, pair the white GIF with `hawiyah-wordmark-white.svg`.
The animation uses the exact outlined lettering, rendered locally by Chromium
and encoded by ffmpeg. It does not use generated raster lettering.

### Handwriting references

The sequence and timing reconstruct a plausible pen movement through this
specific outline. They are not a universal prescribed Ruqʿah stroke order.

- [El-Sana and Biadsy's Arabic handwriting research](https://patents.google.com/patent/WO2008012824A1/en)
  describes dots and supplementary marks as strokes usually added after the
  word, and records joined forms of multiple dots.

## Color and typography

The identity uses the DGA Platforms Code theme variables: primary `#1B8354`,
primary-50 `#F3FCF6`, body background `#F9FAFB`, and default text `#161616`;
in dark mode, background `#111927`, surface `#1F2A37`, and primary text
`#54C08A`. [palette.json](palette.json) records each variable and the measured
WCAG contrast pairs: white on primary 4.75:1, primary on body 4.55:1, default
text on body 17.32:1, and primary text on the dark background 7.79:1. Test new
states and pairings separately.

**Logo:** Aref Ruqaa Bold 700, Arabic only, outlined into the asset.
**UI:** IBM Plex Sans Arabic, the Platforms Code typeface, and IBM Plex Sans. Arabic body text
normally uses 16px or larger with line height around 1.75; Latin body text uses
around 1.55. Never letter-space connected Arabic or reverse its characters.

Use real Unicode and `lang="ar" dir="rtl"` for Arabic UI content. The logo image
keeps its orientation regardless of surrounding reading direction. The product
may still be named “Hawiyah” in English prose and package names; that spelling is
not a second visual wordmark.

## Sources and rights

The wordmark is typographic artwork shaped with HarfBuzz from unmodified
`third-party/arefruqaa/ArefRuqaa-Bold.ttf`. The original font and its OFL notice
were fetched from Google Fonts. Their Git blob hashes were verified against
GitHub contents metadata, and SHA-256 checksums are recorded in
[third-party/sources.json](third-party/sources.json).

Hawiyah’s original code, documentation, and artwork are distributed under
[Apache License 2.0](https://github.com/MohamedEmbarak/hawiyah/blob/main/LICENSE).
The brand kit includes the project LICENSE and NOTICE. Upstream font software
remains under its own SIL Open Font License; that license does not govern the
finished artwork. Keep the relevant notices with redistributed font sources.
The Aref Ruqaa notice reserves “EURM10”; the IBM notices reserve “Plex” for
modified fonts. No font software has been modified here.

The project license does not grant rights to use trademarks beyond its stated
terms. This guide provides no trademark clearance, official endorsement, or
DGA certification.

## Regeneration

From the Hawiyah project directory:

```sh
python brand/build-assets.py
node brand/build-loader.mjs
python brand/build-kit.py
```

The `strokes` table in `build-loader.mjs` controls pen paths, pressure widths,
and timing. Each trace is clipped to its own original letter contour; the
generator checks the completed silhouette before encoding. Add `--proof` to
save frame images and a sequence sheet under `.artifacts/handwriting` for review.

The SVG generator needs Python fontTools and system HarfBuzz. The GIF generator
needs `@playwright/test`, Chromium and ffmpeg; `HAWIYAH_CHROMIUM` overrides the
browser path. These scripts work locally and make no network requests. The kit
generator includes current artwork, guide, previews, generators, and the font
sources/licenses they use. Only the current identity assets are distributed.
