# Fixture-host cases

The fixture host (`apps/fixture-host`) renders the built workspace packages of
Hawiyah on one page, with the vanilla, React, Vue and Angular adapters side by
side, for the browser tests in `tests/host`. It tests the packages of the
branch, not the published ones, and it is not the public guide.

## Page

`/?case=<id>&lang=ar|en&dir=rtl|ltr&mode=light|dark&adapters=vanilla,react,vue,angular`

- `case` names a module in this folder (`<id>.ts`).
- `lang` sets the language; `dir` defaults to `rtl` for Arabic and `ltr` for
  English and can be set on its own.
- `mode` sets `data-hw-mode`; the theme is `dga` and the density `comfortable`.
- `adapters` limits the adapters rendered, in the order given.

Each adapter renders into
`section[data-adapter][lang][dir][data-hw-theme][data-hw-mode][data-hw-density]`
with an `h2` naming the adapter. The page loads `@hawiyah/styles/styles.css` and
sets `body[data-fixture-ready="true"]` two frames after the last mount, or
`body[data-fixture-error]` when a case fails to mount. `tests/host/support.ts`
(`openCase`) waits for either.

## Writing a case

A case module exports, as default, an object with one mount function per
adapter it covers: `vanilla(root, context)`, `react(root, context)`,
`vue(root, context)` and `angular(root, context)`. Each returns a teardown, or a
promise of one. `src/host.ts` provides `html`, `mountReact`, `mountVue` and
`mountAngular` (standalone component, JIT, zoneless change detection).

- Vanilla fixtures are the documented package markup, enhanced with
  `enhance(root)` or the named controller.
- The packages ship no built-in strings: every visible text and accessible name
  comes from `context.t(english, arabic)`.
- A case never styles or patches a package component. Layout of the fixture's
  own wrapper elements is allowed (`src/host.css`, or the `styles` of the
  Angular fixture component).
- The first comment of the module restates the case, so a test depends on no
  specification outside the repository.

## Tests and known defects

Each spec in `tests/host` names the case id and the adapter at the start of the
test title. A case that fails because of a package defect is not skipped: it is
marked `test.fail()` with a reference to an entry of `tests/host/gaps.json`
(`{ id: 'GAP-<case>-<adapter>', case, adapter, observed, expected, evidence }`,
evidence as `file:line`), read through `knownGap(id)` in `support.ts`.
Playwright then fails once the defect is fixed, and the marker and the entry
are removed together.

`tests/host/inventory.json` records the disposition of every spec in
`tests/browser` (move, port or retire); `tests/host-inventory.test.ts` keeps it
complete.

## Running

```sh
pnpm build:packages
pnpm test:host -- --output <directory outside the repository>
```

`HAWIYAH_HOST_PORT` changes the port (4190 by default) and `HAWIYAH_CHROMIUM`
names a Chromium executable. In CI the results are written to
`test-results/host`.
