# React service example

A native React 19 consumer of the built `@hawiyah/react`, `@hawiyah/core`, and
`@hawiyah/styles` packages. Start from the workspace root after building packages:

```sh
pnpm exec vite --config examples/react/vite.config.ts
```

Open `http://localhost:4174`. The bilingual service flow includes conditional
individual/business fields, city search, file selection, review/submit dialog,
request management with filters and pagination, and a service guide. Language,
direction and dark mode have independent controls. Data is illustrative and held
in memory; no application or file is sent to a server.

The app uses shared component CSS; `src/app.css` only lays out the example using
Hawiyah tokens. `tsconfig.json` checks app types without emitting files. Production
Vite output is local to `examples/react/dist`.

The Hawiyah wordmark and local IBM Plex fonts come from the workspace
brand assets. Fonts remain unmodified; their OFL notices live under
`brand/third-party` and are copied into the example build under `licenses/`.

Run the focused browser suite from the workspace root:

```sh
pnpm exec playwright test --config examples/react/playwright.config.ts
```

The suite checks the complete form/review/submission flow, native modal behavior,
mobile Arabic layout, independent preferences, and WCAG A/AA axe scans in light
and dark modes. It uses system Chromium when available, otherwise Playwright’s installed browser.
Set `HAWIYAH_CHROMIUM` to select another executable, or run
`pnpm exec playwright install chromium` once when no browser is installed.
