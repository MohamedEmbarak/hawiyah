# @hawiyah/core

`normalizeRatingMax(max)` provides a finite integer capacity from 1 to 20
(default/fallback 5). `normalizeRatingValue(value, max)` bounds a finite score
without discarding fractions; invalid numbers become 0. Rating inputs floor
that value to an integer, while `RatingDisplay` preserves aggregate fractions.

Framework-independent behavior utilities for Hawiyah. No browser globals
are accessed at import, so pure helpers and package imports work in SSR.

See [API.md](./API.md) for the complete API and behavior contract. Locale, text
direction, numbering system and calendar are independent settings.

Core chooses no locale and holds no strings. Every helper that calls Intl
(`formatNumber`, `formatDate`, `sortRows`, `getCalendarMonth`,
`formatCalendarDate`) takes a required `locale`, a BCP 47 tag or a priority list
of tags from the application. There is no default and no fallback to a built-in
locale or to the locale of the host: a missing locale is a type error and throws
a `TypeError` at run time.

```ts
formatNumber(1250, { locale: 'ar-SA' });
formatDate('2026-10-28T09:00:00+03:00', { locale: 'ar-SA', dateStyle: 'medium' });
sortRows(rows, 'name', 'ascending', 'ar-SA');
```

General `formatDate` uses runtime Intl for instants. Its Gregorian calendar and
Asia/Riyadh time zone are defaults of the helper, not locale choices; pass
`calendar` or `timeZone` to change them. It is not the canonical Hijri
conversion API: an operating system's ICU data can differ from the date picker.

Calendar, date picker, site verification and file upload text is supplied by the
application; core has no label registry.

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

`copyText(text)` writes to the clipboard when it is called, never before, and
resolves to `copied`, `denied`, `unavailable`, `failed` or `empty`; it does not
read the clipboard and does not throw. `createCopyFeedback` is the state behind
CopyButton: the latest activation wins, the copied state returns to idle after a
duration and a failure stays until the next activation.

```ts
import { bindLinkNavigation } from '@hawiyah/core';

// Once, in the browser: packaged links are handed to the application's router.
const links = bindLinkNavigation(document, { navigate: ({ path }) => { router.navigate(path); } });
// links.destroy() removes the listener.
```

`bindLinkNavigation` adds one delegated click listener and renders nothing.
Links keep their `href`; modified clicks, `target`, `download`,
`rel="external"`, other origins, links outside the base path and in-page
fragments stay with the browser. Focus, announcements and scroll restoration
after a route change remain the application's.

The navigation-list helpers (`getNavigationItemKind`, `getNavigationGroupEntries`,
`isNavigationGroupOpen`, `getNavigationCurrentId`, `revealNavigationCurrent`)
hold the rules NavigationDrawer and SideNavigation share. See [API.md](./API.md).

Milestone helpers shared by the four adapters, each documented in [API.md](./API.md):

| Helper | Purpose |
| --- | --- |
| `observeFormReset(control, onReset)`, `sameValue(a, b)` | One listener for a native form reset, reported after the browser has reset the controls; the comparison behind "notify only when the value changed". |
| `createTypeahead(options?)`, `isTypeaheadKey(event)` | Type-ahead for lists with roving focus (Menu, TreeView). |
| `evaluateFileSelection(files, rules?)`, `matchesFileAccept(file, accept)`, `isFileDrag(transfer)` | One rule for a batch of chosen or dropped files: accepted whole or not at all, with a reason per rejected file. |
| `prepareRemovalFocus(container, control, options)` | Focus goes to the neighbouring item when a control removes its own item. |
| `getDateViolation(draft, options)` | The constraint a typed date violates, in one order for every adapter. |
| `normalizePinInput(raw, length, previous?, inputType?)` | Digits of a one-time code, normalized before the length is applied. |
| `getPortalBranchSummary(target, scope)` | The branch heading a press landed on in PortalHeader. |
| `FeedbackValue`, `ConsentChoice` | Value types shared by Feedback and CookieConsent. |

```ts
import { observeFormReset, sameValue } from '@hawiyah/core';

// In the browser, after the control is mounted.
const resets = observeFormReset(input, () => {
  if (!sameValue(value, target)) setValue(target);
});
// resets.destroy() removes the listener.
```

None of these helpers holds text or chooses a locale, and none reads a browser
global when the module is evaluated.

Project code is licensed under Apache-2.0. Bundled third-party data retains its
documented MIT license. The package is published on npm as a pre-1.0 release, so
a minor version may still change its API. The framework adapters depend on it;
install it directly only when application code imports these helpers.
