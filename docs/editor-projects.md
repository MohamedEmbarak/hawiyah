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

Native project recipes currently cover 29 components: Button, IconButton,
TextField, Textarea, Select, Checkbox, Radio, Switch, ToggleGroup, Badge, Alert,
Divider, Spinner, Card, Accordion, Table, Breadcrumb, Pagination, Stepper, Tabs,
Progress, Skeleton, Avatar, EmptyState, Link, Feedback, SiteVerification, PortalHeader and PortalFooter. Other component
pages explicitly identify their native recipes as pending and retain the
vanilla project. Extending native recipes to every catalog entry is required
before the overall alignment/editor goal is complete.

Examples use each adapter's actual composition and state API: React props and
callbacks, Vue slots and models, and Angular projected content, inputs and
outputs. Table examples retain captions and row headers; radio examples show a
named group; tab examples include a disabled item. Accordion, pagination and
stepper examples expose state changes. Links remain contained in the preview.

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

The initial sixteen Chromium regression cases passed, including the original
11 native recipes, JSX/TSX and Vue JS/TS execution, typed vanilla imports, state
updates, mobile layout, downloads, scoped Vue styles, draft preservation and sandbox isolation.
The expanded matrix now exercises all 24 recipes in React JSX/TSX, Vue JS/TS
and Angular TypeScript: five passing cases covering 120 rendered previews.
Checks require each component's real DOM, exercise radio keyboard selection,
exclusive accordion expansion, RTL tab navigation, disabled tabs, pagination
and stepper state, and verify table semantics and breadcrumb containment.
Rendered Angular table and Vue tab examples were also visually inspected.
React's 24 recipes passed TypeScript checking; Angular's 24 passed strict
template checking. Seven exported framework/language projects built, and the
downloaded ZIP passed an independent integrity/readback check. The guide built
successfully. Reproduce project validation after `pnpm check:packages` with
`node scripts/check-editor-projects.mjs`. Vue SFCs are compiled and exercised;
full Vue language-service type checking remains separate work.

Feedback adds text, thumbs-with-text and accessible thumbs-only recipes; Link demonstrates an inline directional icon. Focused Chromium checks cover all three native TypeScript previews and vanilla RTL/LTR at desktop/mobile sizes.

The verification strip, composed portal header and grouped footer bring native
coverage to 29 recipes. All 29 React recipes passed TypeScript checking and all
29 Angular recipes passed strict template checking against fresh package
tarballs. All seven exported framework/language combinations built. Five focused
Chromium cases cover disclosure state, mobile navigation, footer layout and
contained demo actions across all four adapters.

The full native browser matrix also passes: five cases cover all 29 recipes in
React JSX/TSX, Vue JS/TS and Angular TypeScript, totaling 145 rendered previews.
These checks verify mounting and the named interaction assertions in
`tests/browser/project-editor.spec.ts`; they do not establish exhaustive behavior
coverage for every component.
