# Addendum to m2-spec.json (decided by the owner after the specification was written)

These rules apply to every adapter in addition to m2-spec.json. Where they overlap with the specification, this file wins.

## A. Brand is the application's content and may be artwork alone

Applies to PortalHeader, PortalLayout (which passes it to the header and footer), PortalFooter, and any other component that renders a brand (check MobileTopBar and NavigationDrawer).

1. No component prints brand text by itself. Today the Angular header always renders `<span>{{ brand }}</span>` beside projected artwork (packages/angular/src/content.ts, hw-portal-header template), so a logo cannot stand alone. That span is rendered only when the application supplies non-empty brand text.
2. The brand accepts artwork in every adapter: React `brand` as a node; Vue a `brand` slot (the `brand` prop stays for plain text); Angular projected `[hwBrand]` content (the `brand` input stays for plain text and becomes optional); vanilla authored markup inside `.hw-portal-brand`.
3. `brandLabel` (string, optional input with the same name in all adapters; vanilla `data-hw-brand-label` on the controller root or an `aria-label` already on the brand link) is written as `aria-label` on the brand link or brand container. It is how an artwork-only brand gets its accessible name without visible text. When visible brand text is supplied and `brandLabel` is absent, nothing is added.
4. In development, after the component is mounted in a browser, warn through core `requireText(component, 'brandLabel', …, 'the brand has no text')` when the brand element has no text content, no `aria-label`/`aria-labelledby` and no image with a non-empty `alt`. Never during server rendering.
5. A brand that is not a link (no home href) is not given a link role or an href.
6. PortalFooter follows the same rules for its brand line, and renders its support section (heading and container) only when the application supplies support content.

## B. Angular only: deterministic and overridable ids (audit findings spike-GAP-6 and spike-GAP-7)

1. Replace the module-level id counters (forms.ts, interactions.ts, navigation.ts, overlays.ts, content.ts, portal.ts, presentation.ts and any other) with one injectable id source provided per application (root injector), so that a server render and the client hydration of the same page produce the same sequence, and so that two server renders of the same page produce identical HTML. Existing inputs that let the application pass an id keep working and still win.
2. Expose id inputs for the nested parts that have none today: the tooltip inside hw-calendar, the drawer title in hw-navigation-drawer and the header navigation in hw-portal-layout.
3. hw-popover, hw-menu and hw-tooltip must not leave a static `id` attribute on the host element duplicated on the inner element: rename the inputs (for example `panelId`, `menuId`, `tooltipId`) or remove the host attribute, and document the change.
4. Extend packages/angular/test/ssr.test.ts or hydration.test.ts so that rendering the same scenario twice on the server gives identical ids, and that ids are identical after hydration.

## C. Parity reminders that fall out of the text contract

- The Angular wrappers that take `title` as an input must not leave a native `title` attribute on the host element (it shows a browser tooltip over the whole component). Same for `role` on hw-alert and `align` on hw-tooltip.
- No adapter may read `lang`, `document.documentElement.lang` or `navigator.language`.

## D. No default locale (owner decision, 2026-11-11): implemented AFTER the four adapter agents finish, by one agent across core and all adapters

1. Core `formatNumber`, `formatDate`, `sortRows` and any other helper that calls `Intl` take a REQUIRED locale. The `ar-SA` default is removed. No helper falls back to a built-in locale or to the host default.
2. No adapter chooses a locale. A component that formats a number or a date, or sorts text, takes a required `locale` input with the same name in all four adapters whenever that feature is used (vanilla: `data-hw-locale` on the controller root or the controller option), or takes a formatter function from the application where one already exists. The development-time warning from core `requireText` is used for a missing locale in Vue and vanilla.
3. No call to `Intl.*` or `toLocaleString` anywhere in packages/*/src without a locale that came from the application.
4. Tests: a missing locale is a type error in React and Angular and warns in Vue and vanilla; formatting output is unchanged when the application passes the locale that used to be the default.
