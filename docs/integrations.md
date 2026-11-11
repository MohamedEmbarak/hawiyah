# Specialist integrations

Hawiyah supplies interface primitives, layout, status, forms, and service patterns. A specialist rendering engine or remote service remains an application dependency. The recipes here define practical integration boundaries; they do not advertise bundled map, chart, editor, identity, or payment implementations.

## Common boundary

Mount the specialist engine inside an application-owned element, give it explicit inputs, translate its events into application state, and destroy it on unmount. Hawiyah components should own surrounding controls and feedback; the engine should own its internal DOM or canvas. Do not let both renderers mutate the same subtree.

Use public theme values to style supported engine options. A foreign canvas or iframe does not automatically inherit component accessibility or theme behavior. Provide loading, empty, error, and unavailable states, and a meaningful text alternative where the engine's rendering needs one. Document the chosen engine and version in the consuming application.

## Recipes

| Capability | Compose with Hawiyah | Application/engine responsibility |
|---|---|---|
| Maps and location selection | Section, SearchField, MultiSelect filters, Drawer details, EmptyState | Map rendering, geocoding, coordinates, map data/attribution, keyboard alternatives, and a readable selected-location summary |
| Charts and dashboards | Stat, Grid, Card, Select controls, DataTable alternative | Series calculations, chart engine, accessible description, interaction, export, and large-data performance |
| Rich-text editor | Field, a toolbar composed with ButtonGroup/Menu, validation feedback | Document schema, editor state, undo/history, selection, paste handling, sanitization, serialization, and accessible editing |
| Code editor | Tabs, SearchField, Menu, status content/Alert | Editor engine, language services, keyboard model, file state, worker lifecycle, and large-file handling |
| PDF/document viewer | PageHeader, ButtonGroup, Pagination, Drawer metadata, loading/error UI | Parsing/rendering, worker lifecycle, text layer, search, document accessibility, and download permissions |
| Virtualized or editable grid | Filters, selection controls, pagination, EmptyState | Specialized grid engine, focus behavior, virtualization, editing, selection model, and data access; Hawiyah DataTable does not claim these features |
| File transport | FileUpload/FileDropzone, Progress, Alert, retry actions | Upload protocol, server-side validation, cancellation, storage, scanning, resumability, and authoritative progress |
| Authentication / national identity | TextField, PinInput, Button, Dialog, error/status content | Provider authorization, redirects, server session, verification, expiry, rate limits, and authenticated state |
| Payments | ServiceDetails, DescriptionList, review Dialog, processing/confirmation UI | Payment provider, hosted sensitive fields, amount authority, confirmation/webhooks, refunds, and transaction state |
| CAPTCHA / abuse checks | Field help, loading/error states, retry and alternate path | Chosen provider or server-side mechanism, verification, expiry, and an accessible fallback |
| Consent management | CookieConsent, settings Drawer, ToggleGroup/Checkbox | Actual script gating, persistence/versioning, preference changes, and integration with the application's privacy policy |

`DataTable` currently supplies semantic tables with stable sorting in the locale the application passes. `FileDropzone` supplies local selection and input/drop feedback. `CookieConsent` supplies preference UI and events. These components do not silently activate backend features.

## Native framework ownership

In React, initialize an imperative engine through a ref and lifecycle effect, then return cleanup. In Vue, use a template ref with mount/unmount hooks. In Angular, use a host element and view/destroy lifecycle. Vanilla consumers keep the returned cleanup with the page or block that created the integration.

An application-owned adapter can expose a small contract such as `mount`, `update`, and `destroy`; this is a suggested application boundary, not an exported Hawiyah API. Prefer structured data and supported engine options to injecting HTML strings. Lazy-load heavyweight engines where that benefits the actual route and product.

## Government service connections

ServiceCard and ServiceDetails can describe a service and link to a real application route. PortalHeader/Footer can carry the application's own identity and navigation. Feedback and NotificationList can present real application state. None of these components verifies a government domain, produces a digital stamp, connects to Nafath, or confirms an identity by appearance alone.

A national sign-in button should invoke the application's configured provider flow and display success only after the server confirms it. A phone, IBAN, national identifier, or address field collects data; a separate domain service determines validity and ownership. See [coverage](coverage.md) for input semantics.

## Integration acceptance checks

Check mounting and teardown, loading/error/retry, keyboard and focus, narrow screens, Arabic/English and mixed-direction content, theme changes, and application data updates. Verify the real provider interaction in the appropriate test environment before describing the integration as working. Keep demo simulations explicitly distinguishable from connected behavior.

Only components listed as built in [components.json](../components.json) are Hawiyah implementations. These integration recipes remain documentation until the consuming application supplies and verifies the engine or service.
