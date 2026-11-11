# Hawiyah component expansion contract

This extends CONTRACT.md. Every entry below must be a working native component,
not an advertised placeholder. Frameworks own rendering. Publish to npm only through scripts/publish-packages.mjs.

## Additional public components

Controls: InputGroup, PasswordField, SearchField, NumberField, Slider,
RangeSlider, Rating, PinInput, TagInput, MultiSelect, Calendar, DatePicker,
FileDropzone.

Interaction: ToggleGroup, Popover, Menu, Drawer, ToastRegion, Collapsible,
TreeView, Carousel, ContentNavigation, CopyButton.

Content: Link, IconButton, ButtonGroup, Chip, DescriptionList, Stat, Timeline,
Meter, AvatarGroup, DataTable.

Platform patterns: ServiceCard, ServiceDetails, PortalHeader, PortalFooter,
Feedback, CookieConsent, NotificationList, SiteVerification, SecondaryNav, PortalLayout, MobileTopBar, NavigationDrawer,
SideNavigation.

Layout: Container, Stack, Inline, Grid, Columns, Sidebar, Center, Spacer,
AspectRatio, Section, AppShell, PageHeader.

These 58 additions (including five portal/mobile compositions) supplement the existing 27 entries, 85 in all. Native TextField also
covers all standard HTML input types; document per-type semantics rather than
inflating component counts with aliases. Heavy engines (maps, rich text, charts,
code editors, PDF viewers, CAPTCHA, payments) require a documented integration
boundary, not a simulated implementation.

## Shared conventions

- CSS uses the kebab-case name, e.g. `.hw-range-slider`, `.hw-service-card`.
- Layout primitives use `.hw-container`, `.hw-stack`, `.hw-inline`, `.hw-grid`,
  `.hw-columns`, `.hw-sidebar`, `.hw-center`, `.hw-spacer`, `.hw-aspect-ratio`,
  `.hw-section`, `.hw-app-shell`, `.hw-page-header`.
- InputGroup uses `.hw-input-group` and `.hw-input-addon`.
- ToggleGroup: native radio group for single selection; buttons with aria-pressed
  for multiple selection. `.hw-toggle-group`; data-variant=segmented|outline.
- MultiSelect: searchable checkbox list, explicit label, checked values; name
  produces repeated native form values. Do not pretend it is a single combobox.
- PinInput: one accessible native input with autocomplete=one-time-code and
  numeric keyboard; optional visual slots are decorative. Support paste and
  Arabic-Indic digits. No six-field focus trap.
- RangeSlider: two labelled native ranges, enforce lower <= upper. NumberField
  delegates native input number semantics (step/min/max/empty).
- Calendar: labelled month toolbar, weekday headings, focusable date grid;
  arrows/Home/End/PageUp/PageDown; min/max and disabled selection; locale and
  calendar independent of direction. `locale` is required, has no default and
  only formats: month names, weekday names and the era come from Intl, every
  other label from the application. Values are ISO Gregorian dates.
- DatePicker: editable Gregorian ISO text plus accessible labelled dialog Calendar;
  display calendar can be gregory or islamic-umalqura. No handwritten conversions.
  The custom calendar is the only picker popup. Malformed drafts stay visible and
  invalid; a hidden named input submits canonical ISO. See docs/date-input.md.
- FileDropzone: honor the native input's effective disabled state, including an
  ancestor disabled fieldset and its first-legend exception. A blocked drop must
  not change files, report a selection or reject files; clear transient dragging
  and prevent the drop's browser default. Check state at event time so a fieldset
  can be disabled while a drag is in progress. File selection is not upload transport.
- Popover: a disclosure with a trigger, labelled region, outside press/Escape;
  interactive children use normal Tab. Menu: menu/menuitem keyboard semantics,
  Home/End/ArrowUp/ArrowDown, focus return. Drawer composes native modal dialog
  with data-side=start|end|bottom and proper focus behavior. Dialog/Drawer backdrop
  dismissal requires a primary pointer gesture that starts and ends outside the
  panel. Content drags, cancelled gestures and prevented events do not dismiss it;
  close/reopen clears the gesture state. Escape and explicit close remain available.
- ToastRegion: stable live region, caller-owned messages, dismiss buttons,
  no automatic expiry by default. Alert tone only assertive for urgent messages.
- TreeView: flattened visible nodes, roving focus, RTL-aware arrows, expansion,
  selection; items {id,label,disabled?,children?}. No drag/drop claim.
- Carousel: previous/next buttons and current slide status, no autoplay by default.
- ContentNavigation: semantic nested section links with scroll-following current
  state, a configurable offset and an optional bounded scroll root. Keep IDs and
  content application-owned. Ordinary selection scrolls locally without changing
  the host route; disabled items, keyboard focus and reduced motion are preserved.
  Framework adapters own their DOM and observer cleanup.
- DataTable: native table with sortable column headers and aria-sort. Columns
  {key,label,sortable?}; rows record values. Sorting is stable and uses the
  required `locale`; `emptyMessage` is required. No
  virtualization/editing claim. Existing Table remains fully composable.
- National patterns are configurable ordinary content. Do not invent government
  seals, trust verification, actual identity verification or backend integrations.
- PortalHeader: native page-link disclosure below 48rem; Escape closes with
  focus return, outside press/link selection/focus leaving close it, and Tab is
  never trapped. This breakpoint is Hawiyah policy. Vanilla exports
  createPortalHeader and enhances data-hw="portal-header".
- SecondaryNav: named ordinary page links with aria-current; no tab/menu roles.
  PortalLayout composes header, optional secondary links/breadcrumb, focusable
  main target and footer. It has no default strings and sets no direction of
  its own: the application supplies every label and, where it wants one, `dir`.
  Its skip link follows the in-page link contract in CONTRACT.md. Follow the
  adapter PORTAL.md for exact props. Angular generates ids from one `HwIdSource`
  per application, so server and hydrated ids match; explicit id inputs win.
- All controls: disabled/readonly where meaningful, form values/reset, accessible
  names, error/hint associations, no unsafe HTML, SSR-safe imports, RTL.
- All locales: no component in this expansion chooses a locale. Calendar,
  DatePicker and DataTable take a required `locale` (vanilla: the option or
  `data-hw-locale`); the vanilla RangeSlider takes one when it has an output
  element. A missing locale warns through `requireText` in development and
  the Intl-derived output is left out; see CONTRACT.md "Text and localisation".
- All text: no component in this expansion ships a string. Accessible names,
  labels of internal controls, status, empty and validation messages and
  templated text (page, slide, count and remove labels) are inputs the
  application supplies, under the rules in CONTRACT.md "Text and localisation".
- Variants via data-variant/data-tone/data-size, shared tokens, CSS logical props.

## Shared behavior

`CalendarSystem = 'gregory' | 'islamic-umalqura'`.
`getCalendarMonth({locale,month?,value?,min?,max?,calendar?,weekStartsOn?})`
returns `{label,weekdays:string[],days:CalendarDay[],previous,next}`. `locale` is
required; the month label, including the Hijri era, is Intl output for it.
CalendarDay = `{value:string,label:string,disabled:boolean,outside:boolean,
selected:boolean,today:boolean}`. month, value, min, max and prev/next use ISO
Gregorian date strings. Weeks contain seven days. weekStartsOn defaults Sunday 0.
`moveCalendarDate(value,amount,unit:'day'|'month'|'year',calendar?)` returns ISO.
`isDateInRange(value,min?,max?)` validates actual dates and bounds.
Use pinned @internationalized/date for date-only arithmetic with Hawiyah’s published-reference Umm al-Qura provider. Month starts come from the versioned HijriDate table, never hand-written astronomical approximations or implicit runtime fallback. See docs/date-calendars.md for provenance and limits.
`normalizeDigits(value)` converts Arabic-Indic and Eastern Arabic digits.
`clampRange([lower,upper],min,max,changed:'lower'|'upper')` returns numeric pair.
`sortRows(rows,key,direction:'ascending'|'descending',locale)` immutable stable sort;
`locale` (`string | string[]`) is required and has no default. `formatNumber(value,
{locale,...})` and `formatDate(value,{locale,...})` likewise require `locale`; a
missing locale is a type error and throws a TypeError at run time.
`requireText(component,name,value,when?)` and `hasText(value)` report missing
application text in development; `formatTextTemplate(template,values)` fills
`{name}` placeholders in application templates. `getFragmentHref(id,documentUrl?,
baseUrl?)`, `getFragmentId(href)` and `bindFragmentLink(link,options?)` keep
packaged in-page links on the current document under `<base href>`.
`copyText(text): Promise<'copied'|'denied'|'unavailable'|'failed'|'empty'>` writes
to the clipboard inside the call only. `createCopyFeedback({getText,getDuration?,
onStateChange,onResult?,write?})` returns `{state,status,copy(),reset(),destroy()}`
with state `idle|copied|failed`; `copyFeedbackIcons` names the icon per state.
`bindLinkNavigation(root,{navigate,base?})` returns `{destroy()}`: one delegated
click listener that hands plain same-origin link activations to the application's
router; `isLinkNavigationHandled(event)` tells a component that such a click went
ahead. `NavigationItem = {id,label,href?,icon?,current?,disabled?,expanded?,
children?}`; `getNavigationItemKind(item)` returns `disabled|group|link|text`,
`getNavigationGroupEntries(item)`, `isNavigationGroupOpen(item)` and
`getNavigationCurrentId(items)` are pure, and `revealNavigationCurrent(nav)`
scrolls the current link into view inside the navigation's own scroll box.
`observeContentNavigation` keeps the target of `navigate()` current while the
scroll it started is in progress.

CopyButton: `text` (string or function read at activation), `label`,
`copiedMessage`, `failedMessage` (all required), `display: 'icon'|'text'`,
`variant`, `size`, `feedbackDuration`, `disabled`; result event `copyResult`
(`onCopyResult` in React and vanilla) with `{status,text}`. SideNavigation:
`items`, `label` (required), `sticky`; no outputs. ToggleGroup gains
`labelHidden`. PortalHeader takes a notice in every adapter and names its
actions container `hw-portal-header-actions`.

## Layout contract

Core exports `layoutStyles(props): Record<string,string|number>` and types from
`src/layout.ts`. Gap/padding uses token space number 0..16 or CSS length string.
`Responsive<T> = T | {base?:T,sm?:T,md?:T,lg?:T,xl?:T}`.
Common props: gap, padding, align (start|center|end|stretch|baseline), justify
(start|center|end|between|around|evenly), wrap boolean. Responsive gap/padding.
Grid/Columns columns=Responsive<number>, minItemWidth?:string; Sidebar
side?:start|end, sidebarWidth?:string, collapseAt?:sm|md|lg; Container
maxWidth?:string; AspectRatio ratio?:number; Stack/Inline use flex.
Variables: --hw-layout-gap[-sm|-md|-lg|-xl], --hw-layout-padding[...],
--hw-layout-columns[...], --hw-layout-align, --hw-layout-justify,
--hw-layout-wrap, --hw-layout-min-item, --hw-layout-sidebar-width,
--hw-layout-max-width, --hw-layout-ratio. CSS breakpoints sm40rem md48rem
lg64rem xl80rem with mobile-first fallbacks. Sidebar data-side and
data-collapse-at control placement/breakpoint. No JS viewport measurements.
Every adapter renders a layout primitive as one element that carries the class,
the variables and any native attribute the application writes. In Angular that
element is the component host (`hw-stack`), or a native element through the
attribute selector (`<ul hwStack>`); there is no inner wrapper. AppShell regions
are `div.hw-app-shell-header`, `aside.hw-app-shell-sidebar`,
`main.hw-app-shell-main` and `div.hw-app-shell-footer` in every adapter: banner
and contentinfo landmarks come from what the application places inside.

## Coordinating changes

Keep dependency and lockfile edits coordinated. Shared behavior, styles, native
adapters, examples and guide entries should describe the same public contract.
Angular names use Hw{Name}Component and selectors use hw-kebab-case; value inputs
integrate with Angular forms. Branding stays independent of framework runtimes.

Write focused regression tests for new behavioral contracts and real examples.
Use the pinned pnpm version for dependency changes.
