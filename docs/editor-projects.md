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

The Calendar project links Gregorian and Umm al-Qura views to one ISO value. The DatePicker project accepts typed ISO dates, switches the displayed calendar and shows the value submitted by its form. Both projects follow the chosen guide language.

Native project recipes currently cover 62 components: Calendar, DatePicker, Field, InputGroup, PasswordField, NumberField, Slider, RangeSlider, Button, ButtonGroup, IconButton,
TextField, Textarea, Select, Checkbox, Radio, Switch, ToggleGroup, Badge, Alert,
Divider, Spinner, Card, Accordion, Carousel, Rating (including RatingDisplay), Table, DataTable, Breadcrumb, Pagination, Stepper, Tabs,
Progress, Skeleton, Avatar, EmptyState, Link, Feedback, SiteVerification, PortalHeader, PortalFooter, ContentNavigation, SearchField, Chip, DescriptionList, Stat, Timeline, Meter, AvatarGroup, ToastRegion and the 12 layout primitives listed below. Other component
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

Rating adds the 33rd native recipe. Its controlled integer selection appears
alongside unselected, read-only, disabled and required/error examples. The
separate RatingDisplay shows zero, fractional (3.5) and full scores without
creating form controls. Examples use actual native imports in React JSX/TSX,
Vue JS/TS and Angular TypeScript; Arabic/English labels use Latin digits.
All five native editor combinations pass focused rating browser tests. All 33
React recipes pass TypeScript checking, all 33 Angular recipes pass strict
template checking, and all seven exported framework/language projects build.
This does not claim a fresh 165-preview catalog run. See
[rating evidence and validation](nic-rating.md).

The existing Pagination recipe now includes first, middle, last, single-page,
disabled and large-range cases. Its first example is controlled and reports the
selected page without navigation. Ellipsis disclosures expose hidden pages;
ranges exceeding 100 pages use a bounded numeric jump instead of rendering
thousands of controls. All examples use actual adapter imports, and native
recipe coverage remains 33. See [pagination source evidence](nic-pagination.md)
for presentation, keyboard behavior and intentional adaptations.
All five native editor combinations pass the pagination browser checks. All 33
React recipes pass TypeScript checking, all 33 Angular recipes pass strict
template checking, and all seven exported framework/language projects build
against the updated clean tarball consumer. This does not claim a fresh full
165-preview catalog run.


The existing Tabs recipe now shows six native compositions: the original
controlled three-tab example with a disabled destination, eight long labels
with responsive overflow, manual activation, vertical tabs, explicit scrolling,
and an initially selected overflow destination. Ready examples provide the same
six cases in all four adapter syntaxes with localized overflow labels. Native
project files include the real adapter imports; recipe coverage remains 33.
The default overflow disclosure keeps
panel state in the owning adapter; it does not navigate the guide or replace
native tab semantics with links. See [NIC tabs alignment](nic-tabs.md) for source
values, keyboard behavior and intentional adaptations.
All five native framework/language previews pass focused tab browser checks.
All 33 React recipes pass TypeScript checking, all 33 Angular recipes pass strict
template checking and all seven exported framework/language projects build
against clean tarball consumers. No fresh full 165-preview run is claimed.


ContentNavigation adds the 34th native project recipe. Two compositions show
nested section tracking with a disabled destination and a hidden heading with a
custom navigation label. Every composition supplies its own bounded scroll root
and target sections, with callback-ref state in React, template refs in Vue and
Angular, and a target element ID in vanilla. Native examples report the current
section ID through their real callback/event APIs. Selection and scrolling stay
inside the example without changing the surrounding guide route. Ready examples
include complete native imports and setup. See
[content-navigation evidence](nic-content-navigation.md) for source values,
scoped verification and limits.
All five native framework/language previews pass the focused content-navigation
browser checks. All 34 React recipes pass TypeScript checks, all 34 Angular
recipes pass strict template checks, and all seven exported framework/language
projects build against the final clean tarball consumer. Clean packages also
pass ESM, SSR, Angular APF, declaration, CSS-export and tree-shaking checks.
This does not claim a fresh full 170-preview catalog run.


SearchField adds the 35th native recipe without adding a catalog component.
Four compositions demonstrate free-text clearing, a local bilingual dictionary,
read-only/disabled/error states, and a Dialog with suggested terms and an
advanced-search action. The dictionary includes Arabic diacritics/Alef variants
and a literal HTML-looking string to demonstrate safe text rendering. Each native
project imports its actual SearchField and Dialog, binds query/status state, and
uses one form-submit path with the internal search button explicitly disabled.
The dialog autofocuses search and restores its opener; suggestion Escape is
handled before dialog dismissal. Vanilla projects include separate application
listeners and cleanup rather than inline event attributes. Examples report local
status, never fetch dictionaries/results or navigate the guide. See
[NIC search evidence](nic-search.md) for the implementation and scoped checks.

Search verification covered both React and Vue languages and Angular TypeScript in Chromium. Native form validation and submit events execute inside the opaque preview. Its content security policy blocks external form submissions, including direct calls to the native submit method.


The existing Select project now demonstrates six cases. A controlled single
choice reports its value. The other examples show a required empty prompt,
an application error with associated instructions, a disabled control, a
multiple select and a visible single-selection list. React uses Select for
both native list modes. Vue and Angular keep their scalar Select models and
use native HTML for multiple values. Angular also uses native HTML for the
visible row count because its component size input sets visual size. The
same cases appear in vanilla HTML and the bilingual ready examples. Native
project coverage remains 35.


The editor includes projects for all 12 layout primitives. Container and Stack
show responsive padding and gaps. Inline wraps service statuses. Grid changes
from one to two to three columns, while Columns uses a two-column review at the
medium breakpoint. Sidebar places a request summary beside a secondary panel
and collapses at medium widths. Center positions an empty state, Spacer separates
a heading and count, AspectRatio contains a document illustration, and Section
labels the instructions for preparing an application.

AppShell composes a header, sidebar, main and footer around a localized skip
link. PageHeader adds a breadcrumb and a button that toggles request details
inside the example. React supplies composition props, Vue uses named slots, and
Angular uses standalone imports and projected content. The projects include
JSX, TSX, Vue JavaScript and TypeScript, and Angular TypeScript source files.

The clean consumer check compiled all 47 React TSX recipes and 47 strict Angular
templates. Vite also bundled each of the 47 exported Vue applications in both
JavaScript and TypeScript, including the application bootstrap and component
template. This checks package resolution and compilation. Vue language-service
type checking remains a separate check.

The six content display recipes bring coverage from 47 to 53. Chip demonstrates all five tones, a protected filter, a removable filter and focus recovery on restore. DescriptionList pairs labels with values, Stat shows two figures with trends, Timeline shows three dated stages, Meter shows usage at three thresholds, and AvatarGroup limits the visible members and names the overflow count. The examples use native adapter props and events, including the different Timeline state and date contracts.

The application files exported by the guide rendered in 84 Chromium cases covering six components, two languages and all seven supported framework/language combinations. Checks exercised chip removal and restoration, description pairs, stat values, dated stages, meter bounds and avatar overflow. Each timeline identified its current step. Chromium's accessibility tree exposed the overflow as a named image in vanilla, React, Vue and Angular. Those focused checks are separate from the 47-recipe clean consumer verification above.

ToastRegion adds the 54th native recipe. Five service notices demonstrate the banner presentation inside the preview, including a persistent maintenance notice, three ordinary dismissible notices and an urgent failure. Each adapter shows its public dismissal API and a restore action. Keyboard dismissal moves focus through the available controls and returns it to the region when only the protected notice remains. The vanilla project uses `createToastRegion` and the native projects import their own ToastRegion component.

## Basic input projects

Field demonstrates labeling, help text, and validation after blur. InputGroup places the Saudi riyal symbol inside a numeric amount input. PasswordField keeps the reveal button inside the control and reports only whether the field is filled. NumberField compares editable, read-only and disabled form values. Slider demonstrates keyboard increments, and RangeSlider uses distinct field names and keeps each thumb within the other thumb’s current bound. Each project includes a form reset and shows its current value or password entry status.
