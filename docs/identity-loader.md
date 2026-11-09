# Animated identity loader demo

The Spinner guide demonstrates two alternatives: the compact CSS spinner and
Hawiyah's existing animated Arabic identity. The catalog, component preview,
copyable HTML and isolated live editor now use the same recipe. The light and
white GIFs are existing Hawiyah brand assets, not official DGA artwork.

Use the `.hw-brand-loader` composition with one localized status label, empty
decorative image alt text and the supplied static SVG images for
`prefers-reduced-motion`. Dark mode selects the white asset. Both image choices
retain their dimensions when motion preference changes. Applications should
select one loader for an operation and remove it when work settles.

All four adapters can own this ordinary image/status markup. No runtime DOM
enhancement or logo-font request is required. Copy assets from the packaged
`@hawiyah/styles/assets/` exports to the application's public asset directory and
adjust the recipe URLs; the guide's `brand/assets/` prefix is its own host path.
Scope `--hw-brand-loader-size` to customize the default 4rem image size.

The editor embeds only the bundled GIF/SVG assets and remaps their image sources. Its existing network restrictions remain in place.
The supplied GIF contains 90 frames; browser checks verify loading and dynamic
reduced-motion fallback in Arabic/English and light/dark mode. This identity
animation is a Hawiyah product choice, not DGA prototype timing evidence.
