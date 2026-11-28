# PortalHeader

PortalHeader is the header of a service portal: the identity of the product, the main navigation, an optional skip link and notice, and the actions of the application. Below 48rem the navigation collapses behind a menu button.

## Example

The brand is the identity of the product and links to the home page. The navigation has a name, and the link of the current page carries `aria-current="page"`. The application supplies every text, including the name of the menu button, which shows below 48rem. The actions stand after the navigation.

```html live example=basic static differences=portal-header-adapter-markup frame
<header class="hw-portal-header" data-hw="portal-header">
  <a class="hw-portal-brand" href="/">Example Portal</a>
  <button class="hw-button hw-portal-menu-toggle" type="button" aria-expanded="false" aria-controls="basic-navigation" data-hw-portal-toggle><span class="hw-icon" data-icon="menu-01" aria-hidden="true"></span>Menu</button>
  <nav id="basic-navigation" aria-label="Main navigation" data-hw-portal-navigation>
    <ul>
      <li><a class="hw-link" href="/services">Services</a></li>
      <li><a class="hw-link" href="/requests" aria-current="page">Requests</a></li>
      <li><a class="hw-link" href="/help">Help</a></li>
    </ul>
  </nav>
  <div class="hw-portal-header-actions"><button class="hw-button" type="button" data-variant="secondary" data-size="md">Sign in</button></div>
</header>
```

```tsx live example=basic
<PortalHeader
  brand="Example Portal"
  navigationLabel="Main navigation"
  menuLabel="Menu"
  links={[
    { label: 'Services', href: '/services' },
    { label: 'Requests', href: '/requests', current: true },
    { label: 'Help', href: '/help' },
  ]}
  actions={<Button variant="secondary">Sign in</Button>}
/>
```

```vue live example=basic
<PortalHeader
  brand="Example Portal"
  navigation-label="Main navigation"
  menu-label="Menu"
  :links="[
    { label: 'Services', href: '/services' },
    { label: 'Requests', href: '/requests', current: true },
    { label: 'Help', href: '/help' },
  ]"
>
  <template #actions><Button variant="secondary">Sign in</Button></template>
</PortalHeader>
```

```ts live example=basic framework=angular
template: `<hw-portal-header
  brand="Example Portal"
  navigationLabel="Main navigation"
  menuLabel="Menu"
  [links]="[
    { label: 'Services', href: '/services' },
    { label: 'Requests', href: '/requests', current: true },
    { label: 'Help', href: '/help' },
  ]"
>
  <button hwButton variant="secondary">Sign in</button>
</hw-portal-header>`
```

## Variants and states

### Grouped navigation

An item can open a group of links. The group is a native `details` element, and its panel starts with the link to the page of the group, then lists of links under visible headings.

```html live example=grouped static differences=portal-header-adapter-markup frame
<header class="hw-portal-header" data-hw="portal-header">
  <a class="hw-portal-brand" href="/">Example Portal</a>
  <button class="hw-button hw-portal-menu-toggle" type="button" aria-expanded="false" aria-controls="grouped-navigation" data-hw-portal-toggle><span class="hw-icon" data-icon="menu-01" aria-hidden="true"></span>Menu</button>
  <nav id="grouped-navigation" aria-label="Main navigation" data-hw-portal-navigation>
    <ul>
      <li>
        <details class="hw-portal-branch" data-hw-portal-branch data-current="true">
          <summary>Services</summary>
          <div class="hw-portal-branch-panel">
            <a class="hw-link hw-portal-branch-overview" href="/services">Services</a>
            <section class="hw-portal-branch-group">
              <h2>Documents</h2>
              <ul>
                <li><a class="hw-link" href="/services/document-copy" aria-current="page">Copy of a document</a></li>
                <li><a class="hw-link" href="/services/document-status">Document status</a></li>
              </ul>
            </section>
          </div>
        </details>
      </li>
      <li><a class="hw-link" href="/help">Help</a></li>
    </ul>
  </nav>
</header>
```

```tsx live example=grouped
<PortalHeader
  brand="Example Portal"
  navigationLabel="Main navigation"
  menuLabel="Menu"
  links={[
    { label: 'Services', href: '/services', groups: [
      { label: 'Documents', links: [
        { label: 'Copy of a document', href: '/services/document-copy', current: true },
        { label: 'Document status', href: '/services/document-status' },
      ] },
    ] },
    { label: 'Help', href: '/help' },
  ]}
/>
```

```vue live example=grouped
<PortalHeader
  brand="Example Portal"
  navigation-label="Main navigation"
  menu-label="Menu"
  :links="[
    { label: 'Services', href: '/services', groups: [
      { label: 'Documents', links: [
        { label: 'Copy of a document', href: '/services/document-copy', current: true },
        { label: 'Document status', href: '/services/document-status' },
      ] },
    ] },
    { label: 'Help', href: '/help' },
  ]"
/>
```

```ts live example=grouped framework=angular
template: `<hw-portal-header
  brand="Example Portal"
  navigationLabel="Main navigation"
  menuLabel="Menu"
  [links]="[
    { label: 'Services', href: '/services', groups: [
      { label: 'Documents', links: [
        { label: 'Copy of a document', href: '/services/document-copy', current: true },
        { label: 'Document status', href: '/services/document-status' },
      ] },
    ] },
    { label: 'Help', href: '/help' },
  ]"
/>`
```

## API

### JavaScript

Table: Options of createPortalHeader

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |
| `menuLabel` | `string` | `false` | — |
| `navigationLabel` | `string` | `false` | — |
| `brandLabel` | `string` | `false` | — |

`createPortalHeader(header, options)` enhances a `header` element with `data-hw="portal-header"`, which `enhance()` does for every such element, and returns a controller with `open`, `show()`, `close(restoreFocus)` and `destroy()`. The reading and tab order of the header is the skip link, the notice, the brand, the menu toggle, the navigation and the actions. Mark the menu toggle with `data-hw-portal-toggle`, the navigation with `data-hw-portal-navigation` and each group with `data-hw-portal-branch` on a native `details` element. Do not write `hidden` or `data-open="false"` in the initial markup. The header prints no text of its own. A name comes from the markup first, then from an attribute of the header, and the option of the same name wins. `menuLabel` names the toggle when it has no text or `aria-label`, `navigationLabel` names the navigation when it has no `aria-label` or `aria-labelledby`, and `brandLabel` is the `aria-label` of the brand when the brand is artwork alone; the controller then also writes `role="img"` on a brand that is not a link. A name that is missing is not written, and the controller warns once in development. `onOpenChange` receives each change of the disclosure. A skip link with the class `hw-skip-link` inside the header is bound as a packaged fragment link.

### React

Table: Props of PortalHeader

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `brand` | `ReactNode` | `true` | — |
| `homeHref` | `string` | `false` | `'/'` |
| `brandLabel` | `string` | `false` | — |
| `links` | `readonly PortalNavItem[]` | `false` | — |
| `navigationLabel` | `string` | `true` | — |
| `menuLabel` | `string` | `true` | — |
| `navigationId` | `string` | `false` | — |
| `actions` | `ReactNode` | `false` | — |
| `notice` | `ReactNode` | `false` | — |
| `open` | `boolean` | `false` | — |
| `defaultOpen` | `boolean` | `false` | `false` |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |
| `mainId` | `string` | `false` | — |
| `skipLabel` | `string` | `false` | — |

`brand` is required and can be text, artwork or both. `homeHref` makes the brand a link; an empty string renders the brand as a `div`, with `role="img"` when `brandLabel` is given, and `brandLabel` is the accessible name of an artwork-only brand. Each `PortalNavItem` has a `label`, an `href`, an optional `current` and optional `groups`; a group has an optional `label` and its `links`. `navigationLabel` and `menuLabel` are required and name the navigation and the menu button; the menu button and the navigation render only when `links` has entries. Use `open` with `onOpenChange` for a controlled disclosure and `defaultOpen` for an uncontrolled one; close it after a client-side route change with `open`. `notice` renders in a container before the brand, and `actions` render in a container after the navigation; each container exists only when its prop is given. `mainId` adds a skip link to the element with that id and requires `skipLabel`. `navigationId` sets the id of the navigation, and its generated default makes the Default an em dash.

### Vue

Table: Props, events and slots of PortalHeader

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `brand` | prop | `string` | `false` | — |
| `brandLabel` | prop | `string` | `false` | — |
| `homeHref` | prop | `string` | `false` | `'/'` |
| `links` | prop | `readonly PortalLink[]` | `false` | — |
| `navigationLabel` | prop | `string` | `true` | — |
| `menuLabel` | prop | `string` | `true` | — |
| `navigationId` | prop | `string` | `false` | — |
| `mainId` | prop | `string` | `false` | — |
| `skipLabel` | prop | `string` | `false` | — |
| `open` | prop | `boolean` | `false` | — |
| `defaultOpen` | prop | `boolean` | `false` | `false` |
| `update:open` | event | `(value: boolean) => void` | `false` | — |
| `notice` | slot | — | `false` | — |
| `brand` | slot | — | `false` | — |
| `actions` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |

The `brand` prop is text, and the `brand` slot holds artwork; `brandLabel` names an artwork-only brand, and an empty `homeHref` renders the brand as a `div`. Each `PortalLink` has a `label`, an `href`, an optional `current` and optional `groups`. `navigationLabel` and `menuLabel` are required. The `open` prop with the `update:open` event binds the disclosure below 48rem, and `defaultOpen` sets the initial state; the toggle, Escape, a press outside, focus leaving the header and the activation of a link each report a change once. The `notice` slot renders between the skip link and the brand, and the `actions` slot after the navigation; each container exists only when its slot is given. `mainId` adds a skip link and requires `skipLabel`. The table lists the four slots because the published build reads them; the declaration types none.

### Angular

Table: Inputs, outputs and content of hw-portal-header

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `brand` | input | `string` | `false` | `''` |
| `brandLabel` | input | `string` | `false` | `''` |
| `homeHref` | input | `string` | `false` | `'/'` |
| `mainId` | input | `string` | `false` | `''` |
| `skipLabel` | input | `string` | `false` | `''` |
| `menuLabel` | input | `string` | `true` | — |
| `navigationLabel` | input | `string` | `true` | — |
| `navigationId` | input | `string` | `false` | — |
| `links` | input | `readonly HwPortalNavItem[]` | `false` | `[]` |
| `open` | input | `boolean` | `false` | `false` |
| `openChange` | output | `boolean` | `false` | — |
| `[hwPortalNotice]` | content | — | `false` | — |
| `[hwBrand]` | content | — | `false` | — |
| `*` | content | — | `false` | — |

`HwPortalHeaderComponent` (`hw-portal-header`) takes the brand as the `brand` text or as artwork projected with `hwBrand`; no brand text is printed unless `brand` is given, and `brandLabel` names artwork through `aria-label`. An empty `homeHref` renders the brand as a `div`, with `role="img"` while `brandLabel` is given. `menuLabel` and `navigationLabel` are required. `links` takes `HwPortalNavItem` entries, each with a `label`, an `href`, an optional `current` and optional `groups`. `[(open)]` is the disclosure of the navigation below 48rem: `openChange` fires once per change made by the reader and not when the application changes `open`, and `close()` closes the navigation and the open group. Content marked `hwPortalNotice` renders as the notice, and other projected content renders as the actions after the navigation. The skip link renders only when `mainId` is set, and then it needs `skipLabel`. Provide a unique `navigationId` where a page holds several headers.

## Accessibility

The header is a `header` element that holds a named navigation. The menu button shows below 48rem, takes its name from `menuLabel`, and carries `aria-expanded` and `aria-controls` for the navigation. The link of the current page carries `aria-current="page"`. When `mainId` is set, a skip link comes first in the reading and tab order and moves focus to the main container.

Table: Keyboard interaction of PortalHeader

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves focus to the next link, button or group heading in the header, in document order. |
| <kbd>Shift</kbd> + <kbd>Tab</kbd> | Moves focus to the previous link, button or group heading. |
| <kbd>Enter</kbd> | Follows the focused link, or presses the focused button or group heading. |
| <kbd>Space</kbd> | Presses the focused button or group heading. |
| <kbd>Escape</kbd> | Closes the open group and returns focus to its heading, and otherwise closes the open navigation below 48rem and returns focus to the menu button. |

Below 48rem the navigation closes when the reader selects a link, presses outside the header or moves focus out of it, and Tab keeps its native behaviour. The desktop links stay visible.

## RTL and localisation

PortalHeader prints no text of its own. The brand, the names of the menu button and the navigation, the skip link, the notice and the actions are written by the application in the language of the page. The header follows the direction of the page through logical properties, so the brand stands at the start of the line and the actions at its end in both directions.

- Write each name in the language of the page; `brandLabel` is read by a screen reader instead of artwork, so write it in that language too.
- An action that switches the language of the page belongs in `actions`, written with the `lang` attribute of the target language.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of PortalHeader; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- PortalHeader is listed among the platform patterns of the component scope in the [coverage notes](../coverage.md), which describe its mobile disclosure in every adapter.
- The grouped navigation panel is described in the [portal navigation notes](../nic-portal-navigation.md), which map the lines of the reference that handle the mobile toggle.
- The header, the navigation and the mobile toggle follow the [NIC web reference](../nic-web-reference.md), which records its provenance. The 48rem breakpoint of the disclosure is a Hawiyah adaptation, as the [coverage notes](../coverage.md) state.
