# Nasaq component expansion contract

This extends CONTRACT.md. Every entry below must be a working native component,
not an advertised placeholder. Frameworks own rendering. Keep npm publication disabled until release preparation is complete.

## Additional public components

Controls: InputGroup, PasswordField, SearchField, NumberField, Slider,
RangeSlider, Rating, PinInput, TagInput, MultiSelect, Calendar, DatePicker,
FileDropzone.

Interaction: ToggleGroup, Popover, Menu, Drawer, ToastRegion, Collapsible,
TreeView, Carousel.

Content: Link, IconButton, ButtonGroup, Chip, DescriptionList, Stat, Timeline,
Meter, AvatarGroup, DataTable.

Platform patterns: ServiceCard, ServiceDetails, PortalHeader, PortalFooter,
Feedback, CookieConsent, NotificationList, SecondaryNav, PortalLayout, MobileTopBar, NavigationDrawer.

Layout: Container, Stack, Inline, Grid, Columns, Sidebar, Center, Spacer,
AspectRatio, Section, AppShell, PageHeader.

These 54 additions (including four portal/mobile compositions) supplement the existing 27 entries. Native TextField also
covers all standard HTML input types; document per-type semantics rather than
inflating component counts with aliases. Heavy engines (maps, rich text, charts,
code editors, PDF viewers, CAPTCHA, payments) require a documented integration
boundary, not a simulated implementation.

## Shared conventions

- CSS uses the kebab-case name, e.g. `.nq-range-slider`, `.nq-service-card`.
- Layout primitives use `.nq-container`, `.nq-stack`, `.nq-inline`, `.nq-grid`,
  `.nq-columns`, `.nq-sidebar`, `.nq-center`, `.nq-spacer`, `.nq-aspect-ratio`,
  `.nq-section`, `.nq-app-shell`, `.nq-page-header`.
- InputGroup uses `.nq-input-group` and `.nq-input-addon`.
- ToggleGroup: native radio group for single selection; buttons with aria-pressed
  for multiple selection. `.nq-toggle-group`; data-variant=segmented|outline.
- MultiSelect: searchable checkbox list, explicit label, checked values; name
  produces repeated native form values. Do not pretend it is a single combobox.
- PinInput: one accessible native input with autocomplete=one-time-code and
  numeric keyboard; optional visual slots are decorative. Support paste and
  Arabic-Indic digits. No six-field focus trap.
- RangeSlider: two labelled native ranges, enforce lower <= upper. NumberField
  delegates native input number semantics (step/min/max/empty).
- Calendar: labelled month toolbar, weekday headings, focusable date grid;
  arrows/Home/End/PageUp/PageDown; min/max and disabled selection; locale and
  calendar independent of direction. Values are ISO Gregorian dates.
- DatePicker: ISO text/native date input plus accessible labelled dialog Calendar;
  display calendar can be gregory or islamic-umalqura. No handwritten conversions.
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
- DataTable: native table with sortable column headers and aria-sort. Columns
  {key,label,sortable?}; rows record values. Sorting stable and localized. No
  virtualization/editing claim. Existing Table remains fully composable.
- National patterns are configurable ordinary content. Do not invent government
  seals, trust verification, actual identity verification or backend integrations.
- PortalHeader: native page-link disclosure below 48rem; Escape closes with
  focus return, outside press/link selection/focus leaving close it, and Tab is
  never trapped. This breakpoint is Nasaq policy. Vanilla exports
  createPortalHeader and enhances data-nq="portal-header".
- SecondaryNav: named ordinary page links with aria-current; no tab/menu roles.
  PortalLayout composes header, optional secondary links/breadcrumb, focusable
  main target and footer. Defaults are Arabic and RTL independently. Follow the
  adapter PORTAL.md for exact props and stable explicit Angular SSR IDs.
- All controls: disabled/readonly where meaningful, form values/reset, accessible
  names, error/hint associations, no unsafe HTML, SSR-safe imports, RTL.
- Variants via data-variant/data-tone/data-size, shared tokens, CSS logical props.

## Shared behavior

`CalendarSystem = 'gregory' | 'islamic-umalqura'`.
`getCalendarMonth({month?,value?,min?,max?,locale?,calendar?,weekStartsOn?})`
returns `{label,weekdays:string[],days:CalendarDay[],previous,next}`.
CalendarDay = `{value:string,label:string,disabled:boolean,outside:boolean,
selected:boolean,today:boolean}`. month, value, min, max and prev/next use ISO
Gregorian date strings. Weeks contain seven days. weekStartsOn defaults Sunday 0.
`moveCalendarDate(value,amount,unit:'day'|'month'|'year',calendar?)` returns ISO.
`isDateInRange(value,min?,max?)` validates actual dates and bounds.
Use pinned @internationalized/date for date-only arithmetic with Nasaq’s published-reference Umm al-Qura provider. Month starts come from the versioned HijriDate table, never hand-written astronomical approximations or implicit runtime fallback. See docs/date-calendars.md for provenance and limits.
`normalizeDigits(value)` converts Arabic-Indic and Eastern Arabic digits.
`clampRange([lower,upper],min,max,changed:'lower'|'upper')` returns numeric pair.
`sortRows(rows,key,direction:'ascending'|'descending',locale?)` immutable stable sort.

## Layout contract

Core exports `layoutStyles(props): Record<string,string|number>` and types from
`src/layout.ts`. Gap/padding uses token space number 0..16 or CSS length string.
`Responsive<T> = T | {base?:T,sm?:T,md?:T,lg?:T,xl?:T}`.
Common props: gap, padding, align (start|center|end|stretch|baseline), justify
(start|center|end|between|around|evenly), wrap boolean. Responsive gap/padding.
Grid/Columns columns=Responsive<number>, minItemWidth?:string; Sidebar
side?:start|end, sidebarWidth?:string, collapseAt?:sm|md|lg; Container
maxWidth?:string; AspectRatio ratio?:number; Stack/Inline use flex.
Variables: --nq-layout-gap[-sm|-md|-lg|-xl], --nq-layout-padding[...],
--nq-layout-columns[...], --nq-layout-align, --nq-layout-justify,
--nq-layout-wrap, --nq-layout-min-item, --nq-layout-sidebar-width,
--nq-layout-max-width, --nq-layout-ratio. CSS breakpoints sm40rem md48rem
lg64rem xl80rem with mobile-first fallbacks. Sidebar data-side and
data-collapse-at control placement/breakpoint. No JS viewport measurements.

## Coordinating changes

Keep dependency and lockfile edits coordinated. Shared behavior, styles, native
adapters, examples and guide entries should describe the same public contract.
Angular names use Nq{Name}Component and selectors use nq-kebab-case; value inputs
integrate with Angular forms. Branding stays independent of framework runtimes.

Write focused regression tests for new behavioral contracts and real examples.
Use the pinned pnpm version for dependency changes.
