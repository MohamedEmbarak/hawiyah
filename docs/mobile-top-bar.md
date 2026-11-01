# Mobile top bar

`MobileTopBar` (React/Vue), `nq-mobile-top-bar` (Angular), and the shared
`.nq-mobile-top-bar` HTML recipe provide page chrome in normal flow. Supply
`title`, optional `subtitle`, `variant="main|internal"` (default internal) and
`headingLevel={1|2|3}` (default 1). Choose the level for the surrounding page.

`backHref` provides an explicit destination, with Arabic `backLabel="رجوع"`
by default. The curated back icon mirrors in RTL. No history or routing behavior
is assumed. React `leading`/`actions`, Vue named slots, and Angular
`[nqTopBarLeading]`/`[nqTopBarActions]` allow application-owned controls. Leading
content replaces the built-in back link. Give icon-only actions accessible names.
Vanilla uses the same semantic header, links and CSS without enhancement.

```tsx
<MobileTopBar title="طلباتي" subtitle="تابع طلباتك" backHref="/services"
  actions={<Button onClick={openNavigation} aria-label="القائمة">
    <span className="nq-icon" data-icon="menu-01" aria-hidden="true" />
  </Button>} />
```

Vue uses `<MobileTopBar title="طلباتي" back-href="/services">` with an
`#actions` slot. Angular uses `<nq-mobile-top-bar title="طلباتي"
backHref="/services"><button nqTopBarActions>…</button></nq-mobile-top-bar>`.
Use one appropriate page heading; embedded demonstrations can set heading level 2.

## Source mapping and adaptations

Decoded Mobile Top Bar set `8335:15376` contains device compositions; the 44px OS
status area is not application UI. Application rows `8335:15397`, `8335:15564`
and `8335:15514` are 58/48/57px. Main title `8335:15565` is 26px bold; internal
title/subtitle `8335:15402`/`8335:15403` are 14px semibold/12px. RTL arrangement
is represented in `8335:15596`.

Nasaq uses those title roles at a 16px root with semantic theme colors and fonts.
The web header has a 60px minimum, intrinsic height, wrapping actions and 44px
minimum targets instead of source 32px actions. These are explicit accessibility
adaptations. Safe-area padding avoids device cutouts; no OS status area, fixed
device height, sticky positioning or new motion is inferred. Light/dark and
original/custom themes inherit existing semantic colors. Keyboard focus and
forced colors remain visible. This mapping does not claim rendered source parity
or official certification. Hajj is excluded.
