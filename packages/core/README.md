# @nasaq/core

`normalizeRatingMax(max)` provides a finite integer capacity from 1 to 20
(default/fallback 5). `normalizeRatingValue(value, max)` bounds a finite score
without discarding fractions; invalid numbers become 0. Rating inputs floor
that value to an integer, while `RatingDisplay` preserves aggregate fractions.

Framework-independent behavior utilities for Nasaq. No browser globals
are accessed at import, so pure helpers and package imports work in SSR.

See [API.md](./API.md) for the complete API and behavior contract. Locale, text
direction, numbering system and calendar are independent settings. General
`formatDate` uses runtime Intl for instants and defaults to Arabic Saudi locale,
Gregorian calendar, and Asia/Riyadh time zone. It is not the canonical Hijri
conversion API: an operating system's ICU data can differ from the date picker.

`getCalendarLabels(locale)` returns read-only Arabic or English UI strings for navigation, calendar selection and validation. The default locale is `ar-SA`.

For date-only values, use `getCalendarDateParts`, `convertCalendarDate`,
`formatCalendarDate`, `getCalendarMonth`, and `moveCalendarDate`. Their Saudi
Umm al-Qura provider uses the pinned published HijriDate 2.3.0 reference table
with @internationalized/date calendar math. The supported range is AH 1343–1500
(Gregorian 1924-08-01 through 2077-11-16). Conversions and movement reject dates
outside that range; month grids clamp their display anchor and disable unsupported
spillover cells. There is no fallback to the civil Islamic calendar.

The picker and canonical formatter obtain numeric year/month/day from that same
reference. Intl supplies localized names and ordering. Formatted dates use Latin digits in both languages. A display
calendar switch retains the selected Gregorian ISO date. See
[provenance](./third-party/provenance.json) and the bundled third-party license;
the published reference is not a certification of exact parity with every current
official service or a determination of religious moon-sighting dates.

The shared combobox reducer covers local single selection with manual commitment.
It does not fetch data, render DOM, create a general state engine, or implement
virtualization. Framework adapters remain responsible for native events, ARIA
bindings, form reset and focus cleanup.

Other shared helpers normalize Arabic digits, clamp two-thumb native ranges, and
sort records immutably with stable localized comparison. Layout helpers emit CSS
variables without reading the viewport; responsive behavior stays in CSS.

Project code is licensed under Apache-2.0. Bundled third-party data retains its
documented MIT license. The package is published on npm as a pre-1.0 release, so
a minor version may still change its API. The framework adapters depend on it;
install it directly only when application code imports these helpers.
