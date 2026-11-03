# Framework project editor

The component editor now uses real package imports and framework-owned DOM.
Vanilla offers JavaScript and TypeScript; React offers JSX and TSX; Vue offers
JavaScript and TypeScript script-setup SFCs; Angular uses standalone TypeScript
components and templates. The subheader identifies the framework and language,
with decorative brand icons alongside text labels. Code stays LTR in either
guide language.

Each combination preserves its own edits when switching. Entry points, local
styles and component files are editable. Project downloads include those edits,
an HTML entry, package manifest, Vite configuration, TypeScript configuration
and setup instructions. Nasaq is still a private source preview: downloads use
local package tarballs, not nonexistent npm releases.

Native projects run the actual installed adapters in a unique-origin sandbox.
Framework bundles are generated locally and loaded on demand. TypeScript/JSX
and Vue SFC compilation happens locally; edited application code runs only in
the iframe. Angular's JIT compiler may evaluate code inside that sandbox. Both
CSP policies restrict external resource loads. The sandbox blocks navigation of
the guide, and demo link clicks are contained.
Framework previews do not run the vanilla enhancer on framework-owned DOM.

## Coverage and remaining work

Native project recipes currently cover Button, IconButton, TextField, Textarea,
Checkbox, Switch, ToggleGroup, Badge, Alert, Divider and Spinner. Other component
pages explicitly identify their native recipes as pending and retain the
vanilla project. Extending native recipes to every catalog entry is required
before the overall alignment/editor goal is complete.

The browser compiler checks syntax and executes the example; it is not a full
project type-checker. External dependencies, preprocessors and server code are
outside the isolated browser runtime. Downloaded applications use ordinary
browser navigation/form behavior and need application-owned routes and handlers.
Angular's included Vite example uses JIT; normal production Angular projects
should retain their CLI/AOT pipeline. SSR/hydration coverage is separate.

Brand silhouettes come from Simple Icons under CC0, with license and source
mapping in the guide's third-party directory and published license assets.
The icons identify compatibility and do not imply endorsement.

## Validation

Sixteen Chromium regression cases passed, including all 11 native recipes in
each framework, JSX/TSX and Vue JS/TS execution, typed vanilla imports, state
updates, mobile layout, downloads, scoped Vue styles, draft preservation and sandbox isolation.
React's 11 recipes passed TypeScript checking; Angular's 11 passed strict
template checking. Seven exported framework/language projects built, and the
downloaded ZIP passed an independent integrity/readback check. The guide built
successfully. Reproduce project validation after `pnpm check:packages` with
`node scripts/check-editor-projects.mjs`. Vue SFCs are compiled and exercised;
full Vue language-service type checking remains separate work.
