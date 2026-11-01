# Saudi riyal display

Use the actual Saudi riyal character `⃁` (U+20C1) with `.nq-riyal`. Nasaq
self-hosts a 2.5KB symbol-only font so rendering does not depend on an operating
system font update. Interface typography and numeric input behavior stay unchanged.

```html
<bdi>200 <span class="nq-riyal" aria-hidden="true">⃁</span><span class="nq-sr-only">ريال سعودي</span></bdi>
```

Keep a localized currency name available to assistive technology. In an amount
input, include “Saudi riyals” / “الريال السعودي” in the input label and make the
symbol addon decorative. Use `bdi` around amounts embedded in mixed-direction
content. Keep numeric values numeric and retain `SAR` in formatting, API and
storage currency codes. Do not substitute the separate older U+FDFC rial sign.

The guide's amount addon, service fees and copyable examples use this pattern.
Its currency formatter retains the existing `Intl.NumberFormat` numeric parts
and replaces only the displayed currency label. Existing number validation,
minimum and decimal-step constraints remain native.

NasaqRiyal is a renamed subset of **Noto Naskh Arabic 2.021**. Only U+20C1 and the
required missing-glyph entry remain; the symbol's outline and advance width are
unchanged. This is font rendering of Unicode text, not an official SVG export.
The original font is Copyright 2022 The Noto Project Authors, under SIL OFL 1.1.
Its complete license, source/archive hashes and reproducible subset recipe are in
`packages/styles/src/assets/fonts/riyal-LICENSE.txt` and `riyal-provenance.json`.
The styles package and deployed guide retain those notices. The font's OFL
license remains separate from Nasaq's Apache 2.0 license.
