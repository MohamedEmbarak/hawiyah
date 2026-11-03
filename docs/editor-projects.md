# Framework project editor

The component editor now uses real package imports and framework-owned DOM.
Vanilla offers JavaScript and TypeScript; React offers JSX and TSX; Vue offers
JavaScript and TypeScript script-setup SFCs; Angular uses standalone TypeScript
components and templates. Framework/language selectors and the project download
sit inside the preview card, directly below its view tabs. Visible labels and
decorative brand icons identify the options; the native selects retain keyboard
and assistive-technology behavior. Controls reflow within the card on narrow
screens. Code stays LTR in either guide language.

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

Native project recipes currently cover 32 components: Button, ButtonGroup, IconButton,
TextField, Textarea, Select, Checkbox, Radio, Switch, ToggleGroup, Badge, Alert,
Divider, Spinner, Card, Accordion, Carousel, Table, DataTable, Breadcrumb, Pagination, Stepper, Tabs,
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

ButtonGroup brings current coverage to 30 native recipes, with mixed icon/text
horizontal and vertical attached groups. ToggleGroup now demonstrates six
selection/state combinations. The final 18-case Chromium run passes, including
all 150 native recipe previews (React JSX/TSX, Vue JS/TS and Angular TypeScript),
focused RTL/LTR segmented checks and editor regressions. All 30 React recipes
pass TypeScript checks, all 30 Angular recipes pass strict template checks,
and all seven exported framework/language projects build. See
[NIC segmented controls](nic-segmented.md) for source evidence and limitations.

IconButton recipes now show seven size/shape/state cases, decorative background
circles and an unsized projected SVG. Their TypeScript previews were checked in
React, Vue and Angular for geometry, loading protection and controlled toggle
behavior. Native defaults use ghost consistently; use an explicit primary
variant to preserve the former React default. See [icon evidence](nic-icons.md).

The integrated editor card is checked at 320, 390, 768 and 1543px in Arabic/light
and English/dark modes, including contiguous card edges, selector/icon geometry,
keyboard order, Angular's fixed TypeScript option, forced-colors focus and
toolbar contrast at rest and on hover. The editor/branding/project regression
cases also pass, including all 150 native recipe previews, downloads, preserved
drafts, custom themes and Vue scoped styles. The Vue scope test now waits for
compilation readiness before checking styles; it previously raced compilation.

DataTable brings coverage to 31 native recipes. Table/DataTable previews were
checked in all five React JSX/TSX, Vue JS/TS and Angular TypeScript combinations
for geometry, sorting, empty data, row headers and horizontal keyboard scrolling.
All 31 React recipes passed TypeScript checks and all 31 Angular recipes passed
strict template checks against clean tarball consumers; all seven exported
framework/language projects built. This table task does not claim a fresh full
155-preview catalog run. See [table evidence](nic-tables.md).

Carousel brings coverage to 32 native recipes. Five cases demonstrate bounded
navigation, looping, omitted indicators, empty data and one slide; native
examples include controlled state and Angular's optional content template.
All five React JSX/TSX, Vue JS/TS and Angular TypeScript previews pass focused
browser interactions and geometry checks. All 32 React recipes pass TypeScript
checks, all 32 Angular recipes pass strict template checks, and all seven
exported framework/language projects build against clean tarball consumers.
This does not claim a fresh 160-preview catalog run. See
[carousel evidence](nic-carousel.md).
