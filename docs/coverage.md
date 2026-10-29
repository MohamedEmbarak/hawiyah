# Component and input coverage

Nasaq's expanded catalog has **77 named entries: the initial 27 plus 50 additions**. The count represents distinct public components and layout primitives. Native input-type aliases, visual variants, editable blocks, and external integration recipes are documented separately.

This is a defined, extensible scope for modern interfaces and Saudi service platforms. It is not an exhaustive list of every possible UI, an official DGA component count, or a certification claim. [components.json](../components.json) records planned, built, and verified coverage independently for each adapter. [EXPANSION.md](../EXPANSION.md) defines the expansion contract; the [validation record](validation.md) identifies the tested snapshot.

## Supplied DGA reference coverage

The default `dga` foundation is mapped from verified values in the supplied **2026-10-29** snapshot; `nasaq` is an opt-in visual theme. The reference review decoded **17 files**, with detailed inspection focused on Foundations, the Service Page template, and the Form template. Six files exceeded the 32 MiB transfer limit and were unavailable for this review. No standalone web component library was supplied.

The 77-entry catalog remains Nasaq's implementation scope. Embedded template components, resolved foundation variables, and a rendered gallery do not establish complete official component coverage. Source-version reconciliation, per-variant visual comparison, template behavior, and application-level requirements have separate evidence gates in [the reference record](dga-reference.md) and [roadmap](roadmap.md). Raw source exports remain local research inputs.

## Catalog groups

| Group | Entries |
|---|---|
| Initial controls | Button, Field, TextField, Textarea, Select, Checkbox, Radio, Switch, Combobox, FileUpload |
| Initial interaction/navigation | Tabs, Dialog, Accordion, Pagination, Breadcrumb, Tooltip, Stepper |
| Initial presentation | Card, Badge, Alert, Table, Progress, Skeleton, Spinner, Avatar, Divider, EmptyState |
| Additional controls | InputGroup, PasswordField, SearchField, NumberField, Slider, RangeSlider, Rating, PinInput, TagInput, MultiSelect, Calendar, DatePicker, FileDropzone |
| Additional interaction | ToggleGroup, Popover, Menu, Drawer, ToastRegion, Collapsible, TreeView, Carousel |
| Additional content | Link, IconButton, ButtonGroup, Chip, DescriptionList, Stat, Timeline, Meter, AvatarGroup, DataTable |
| Platform patterns | ServiceCard, ServiceDetails, PortalHeader, PortalFooter, Feedback, CookieConsent, NotificationList |
| Layout | Container, Stack, Inline, Grid, Columns, Sidebar, Center, Spacer, AspectRatio, Section, AppShell, PageHeader |

Framework adapters render native framework components. Vanilla uses semantic HTML/CSS recipes where native behavior is sufficient, and explicit controllers for richer interaction. A static recipe is a valid implementation; it should not be represented as a JavaScript controller that does not exist.

## Implementation types

| Type | What it means | Examples |
|---|---|---|
| Native | Browser semantics provide the main interaction | Button, Select, Slider, Collapsible, Meter |
| Static | Semantic composition or CSS layout; content/actions come from the application | Card, Stat, PortalFooter, Grid |
| Interactive | Nasaq implements additional state, keyboard behavior, or lifecycle | Combobox, Calendar, Menu, TreeView, DataTable |
| Integration | The application owns a specialist engine or service; Nasaq supplies surrounding UI recipes | Maps, charts, editors, identity verification, payments |

The first three types appear in the 77-component catalog. Integrations have a separate boundary and are not counted as implemented components. Native elements still require labels, appropriate attributes, and application validation.

## All 22 native input types

The inputs lab covers the 22 standard `input` type values. They are browser capabilities, not 22 extra Nasaq components. The type list follows the [HTML Standard](https://html.spec.whatwg.org/multipage/input.html#states-of-the-type-attribute); the Nasaq mapping below is an application recipe.

| Type | Native purpose | Preferred Nasaq composition |
|---|---|---|
| `text` | Plain text | TextField; Field + native input |
| `search` | Search query | SearchField |
| `email` | Email address | TextField with email semantics |
| `tel` | Telephone text | TextField with phone guidance |
| `url` | URL text | TextField with URL semantics |
| `password` | Masked text | PasswordField |
| `number` | Numeric quantity | NumberField |
| `range` | Bounded numeric selection | Slider; RangeSlider for two bounds |
| `date` | Calendar date | DatePicker or native date input |
| `month` | Year and month | Field + native month input |
| `week` | Year and week | Field + native week input |
| `time` | Time of day | Field + native time input |
| `datetime-local` | Local date and time | Field + native local datetime input |
| `color` | Color selection | Field + native color input |
| `checkbox` | Independent checked state | Checkbox; Switch for settings |
| `radio` | Exclusive checked state | Radio; Rating; single ToggleGroup |
| `file` | Local file selection | FileUpload or FileDropzone |
| `hidden` | Nonvisual submitted value | Native input with application-owned value |
| `button` | General action | Button with explicit button type |
| `submit` | Form submission | Button with submit type |
| `reset` | Form reset | Explicitly labelled reset control |
| `image` | Image submit control | Native input with meaningful alternative text |

Browser-provided pickers differ by browser and operating system. The lab exposes native behavior; it does not promise identical browser chrome. Use native attributes appropriate to the type, and check the actual adapter API before forwarding a prop. `datetime-local` does not carry a time zone. Hidden inputs and client-side constraints do not establish trust in submitted values.

## Saudi service input recipes

These are configurable application patterns, not identity or bank verification services.

| Data | UI recipe | Domain boundary |
|---|---|---|
| Phone | TextField with `type="tel"`, a visible country-code hint, and a stable label | Parse/normalize with the application's phone rules; verify ownership through the actual service |
| Saudi IBAN | Text input in LTR direction, with a documented grouping example and copy/paste support | Preserve the value as a string; checksum or format checks do not prove account ownership or existence |
| National ID / residency identifier | Text input with a numeric keyboard hint where applicable | Preserve identifiers as strings; application/server policy decides format and verification; do not use a numeric quantity control |
| Address | Separate, labelled address fields with suitable autocomplete hints and clear optionality | Address lookup/validation and any National Address integration belong to the selected service and backend |
| One-time code | PinInput: one labelled input, paste support, one focus stop, optional decorative slots | Normalizing Arabic-Indic digits is text handling; authentication, expiry, attempts, and replay handling are server concerns |
| Service amount | NumberField or text input selected according to the domain's precision requirements | Currency, precision, rounding, limits, and authoritative calculation belong to application rules |

Keep Arabic and English copy, numeral normalization, display direction, storage format, and validation separate. A successful format check must not be labelled “identity verified.” Use fictional data in examples.

## Calendars and date values

Calendar and DatePicker support Gregorian (`gregory`) and Umm al-Qura (`islamic-umalqura`) display modes. Their values and date bounds use Gregorian ISO `YYYY-MM-DD`; display calendar, locale, numerals, and layout direction are independent. Arithmetic uses pinned `@internationalized/date` with Nasaq's table-backed Umm al-Qura provider; Hijri month starts come from pinned HijriDate reference data. No manual day-offset conversion is used.

Date-only values are not timestamps. Select the application calendar policy and supported range explicitly, especially for historic dates or dates used in official processes. Read [calendar reliability](date-calendars.md) for provenance, range, conversion checks, and source limitations; component support alone does not establish agreement with every religious observance or external authority.

## Layout and variants

The layout studio demonstrates CSS-driven composition through Container, Stack, Inline, Grid, Columns, Sidebar, Center, Spacer, AspectRatio, Section, AppShell, and PageHeader. Responsive values use `base`, `sm`, `md`, `lg`, and `xl`; spacing accepts tokens or CSS lengths. Layout changes do not require JavaScript viewport measurements. See the [style guide](../packages/styles/README.md) and the actual adapter API for examples.

Treat configuration axes separately: component variant, tone, size, theme, mode, density, locale, and direction. A variant must preserve the component's semantics and interaction. The gallery is a way to inspect supported states; it is not evidence that every combination of all axes has passed testing.

## Where to inspect behavior

Open the [interactive guide](https://mohamedembarak.github.io/nasaq/#components)
and select a component for its live preview, markup, API, lifecycle, accessibility,
and limitations. Each component has a shareable `#component/<id>` route;
[DatePicker](https://mohamedembarak.github.io/nasaq/#component/date-picker) is an
example. The catalog records these documentation links for coding tools.

The playground provides `#components` for the catalog, `#inputs` for native/national input recipes, and `#layouts` for composition. Read [core behavior](../packages/core/API.md), [vanilla expansion markup](../packages/vanilla/EXPANSION-API.md), and the framework package READMEs for exact APIs. The [integration guide](integrations.md) describes specialist boundaries.
