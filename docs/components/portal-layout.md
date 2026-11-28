# PortalLayout

PortalLayout is the page shell of a portal: a header with a skip link and main navigation, an optional secondary navigation and breadcrumb, a focusable main container for the page content and a footer. The application supplies every text, destination and the page content.

## Example

The skip link leads to the main container, so a keyboard reader reaches the page content without passing the navigation. The brand, the navigation and the footer links are supplied as data, and the page content is placed inside the layout.

```html live example=basic differences=portal-layout-adapter-markup,portal-layout-footer-brand-tree,portal-layout-footer-brand-weight frame
<div class="hw-portal-layout">
  <header class="hw-portal-header" data-hw="portal-header">
    <a class="hw-skip-link" href="#main-content">Skip to main content</a>
    <a class="hw-link hw-portal-brand" href="/">Example Portal</a>
    <button class="hw-button hw-portal-menu-toggle" type="button" data-hw-portal-toggle><span class="hw-icon" data-icon="menu-01" aria-hidden="true"></span>Menu</button>
    <nav aria-label="Main navigation" data-hw-portal-navigation>
      <ul><li><a class="hw-link" href="/requests" aria-current="page">Requests</a></li><li><a class="hw-link" href="/documents">Documents</a></li></ul>
    </nav>
  </header>
  <main class="hw-portal-layout-main hw-container" id="main-content" tabindex="-1">
    <h1>Requests</h1>
    <p>Your submitted requests and their status appear here.</p>
  </main>
  <footer class="hw-portal-footer">
    <div class="hw-portal-footer-main">
      <div class="hw-portal-footer-brand"><div class="hw-portal-footer-brand-marks">Example Portal</div></div>
      <nav class="hw-portal-footer-group" aria-label="Footer links"><h2>Footer links</h2><ul class="hw-portal-footer-links"><li><a class="hw-link" href="/privacy">Privacy policy</a></li><li><a class="hw-link" href="/terms">Terms of use</a></li></ul></nav>
    </div>
  </footer>
</div>
```

```tsx live example=basic
<PortalLayout
  brand="Example Portal"
  mainId="main-content"
  skipLabel="Skip to main content"
  menuLabel="Menu"
  navigationLabel="Main navigation"
  headerProps={{
    links: [
      { label: 'Requests', href: '/requests', current: true },
      { label: 'Documents', href: '/documents' },
    ],
  }}
  footerLabel="Footer links"
  footerProps={{
    externalLabel: 'Opens in a new window',
    links: [
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Terms of use', href: '/terms' },
    ],
  }}
>
  <h1>Requests</h1>
  <p>Your submitted requests and their status appear here.</p>
</PortalLayout>
```

```vue live example=basic
<PortalLayout
  brand="Example Portal"
  main-id="main-content"
  skip-label="Skip to main content"
  menu-label="Menu"
  navigation-label="Main navigation"
  :links="[
    { label: 'Requests', href: '/requests', current: true },
    { label: 'Documents', href: '/documents' },
  ]"
  footer-label="Footer links"
  :footer-links="[
    { label: 'Privacy policy', href: '/privacy' },
    { label: 'Terms of use', href: '/terms' },
  ]"
  :footer-props="{ externalLabel: 'Opens in a new window' }"
>
  <h1>Requests</h1>
  <p>Your submitted requests and their status appear here.</p>
</PortalLayout>
```

```ts live example=basic framework=angular
template: `<hw-portal-layout
  brand="Example Portal"
  mainId="main-content"
  skipLabel="Skip to main content"
  menuLabel="Menu"
  navigationLabel="Main navigation"
  [links]="[
    { label: 'Requests', href: '/requests', current: true },
    { label: 'Documents', href: '/documents' },
  ]"
  footerLabel="Footer links"
  [footerLinks]="[
    { label: 'Privacy policy', href: '/privacy' },
    { label: 'Terms of use', href: '/terms' },
  ]"
  externalLabel="Opens in a new window"
>
  <h1>Requests</h1>
  <p>Your submitted requests and their status appear here.</p>
</hw-portal-layout>`
```

## Variants and states

### Secondary navigation and breadcrumbs

A secondary navigation stands between the header and the main container, and a breadcrumb stands at the start of the main container. Each needs its own label, `secondaryLabel` and `breadcrumbLabel`, because each is a navigation region. The last breadcrumb item is the current page and has no `href`.

```html live example=secondary differences=portal-layout-adapter-markup,portal-layout-footer-brand-tree,portal-layout-footer-brand-weight frame
<div class="hw-portal-layout">
  <header class="hw-portal-header" data-hw="portal-header">
    <a class="hw-skip-link" href="#secondary-content">Skip to main content</a>
    <a class="hw-link hw-portal-brand" href="/">Example Portal</a>
    <button class="hw-button hw-portal-menu-toggle" type="button" data-hw-portal-toggle><span class="hw-icon" data-icon="menu-01" aria-hidden="true"></span>Menu</button>
    <nav aria-label="Main navigation" data-hw-portal-navigation>
      <ul><li><a class="hw-link" href="/requests" aria-current="page">Requests</a></li><li><a class="hw-link" href="/documents">Documents</a></li></ul>
    </nav>
  </header>
  <nav class="hw-secondary-nav" aria-label="Request sections" data-variant="default"><ul><li><a href="/requests" aria-current="page"><span>All requests</span></a></li><li><a href="/requests/drafts"><span>Drafts</span></a></li></ul></nav>
  <main class="hw-portal-layout-main hw-container" id="secondary-content" tabindex="-1">
    <nav class="hw-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><span aria-current="page">Requests</span></li></ol></nav>
    <h1>Requests</h1>
    <p>Your submitted requests and their status appear here.</p>
  </main>
  <footer class="hw-portal-footer">
    <div class="hw-portal-footer-main">
      <div class="hw-portal-footer-brand"><div class="hw-portal-footer-brand-marks">Example Portal</div></div>
    </div>
  </footer>
</div>
```

```tsx live example=secondary
<PortalLayout
  brand="Example Portal"
  mainId="secondary-content"
  skipLabel="Skip to main content"
  menuLabel="Menu"
  navigationLabel="Main navigation"
  headerProps={{
    links: [
      { label: 'Requests', href: '/requests', current: true },
      { label: 'Documents', href: '/documents' },
    ],
  }}
  secondaryNavigation={[
    { label: 'All requests', href: '/requests', current: true },
    { label: 'Drafts', href: '/requests/drafts' },
  ]}
  secondaryLabel="Request sections"
  breadcrumbs={[
    { label: 'Home', href: '/' },
    { label: 'Requests', current: true },
  ]}
  breadcrumbLabel="Breadcrumb"
  footerProps={{ externalLabel: 'Opens in a new window' }}
>
  <h1>Requests</h1>
  <p>Your submitted requests and their status appear here.</p>
</PortalLayout>
```

```vue live example=secondary
<PortalLayout
  brand="Example Portal"
  main-id="secondary-content"
  skip-label="Skip to main content"
  menu-label="Menu"
  navigation-label="Main navigation"
  :links="[
    { label: 'Requests', href: '/requests', current: true },
    { label: 'Documents', href: '/documents' },
  ]"
  :secondary-navigation="[
    { label: 'All requests', href: '/requests', current: true },
    { label: 'Drafts', href: '/requests/drafts' },
  ]"
  secondary-label="Request sections"
  :breadcrumbs="[
    { label: 'Home', href: '/' },
    { label: 'Requests', current: true },
  ]"
  breadcrumb-label="Breadcrumb"
  :footer-props="{ externalLabel: 'Opens in a new window' }"
>
  <h1>Requests</h1>
  <p>Your submitted requests and their status appear here.</p>
</PortalLayout>
```

```ts live example=secondary framework=angular
template: `<hw-portal-layout
  brand="Example Portal"
  mainId="secondary-content"
  skipLabel="Skip to main content"
  menuLabel="Menu"
  navigationLabel="Main navigation"
  [links]="[
    { label: 'Requests', href: '/requests', current: true },
    { label: 'Documents', href: '/documents' },
  ]"
  [secondaryNavigation]="[
    { label: 'All requests', href: '/requests', current: true },
    { label: 'Drafts', href: '/requests/drafts' },
  ]"
  secondaryLabel="Request sections"
  [breadcrumbs]="[
    { label: 'Home', href: '/' },
    { label: 'Requests', current: true },
  ]"
  breadcrumbLabel="Breadcrumb"
  externalLabel="Opens in a new window"
>
  <h1>Requests</h1>
  <p>Your submitted requests and their status appear here.</p>
</hw-portal-layout>`
```

## API

### JavaScript

Table: Attributes of the hw-portal-layout and hw-portal-layout-main elements

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-portal-layout' \| 'hw-portal-layout-main'` | `true` | — |

> [!NOTE]
> These classes and attributes are read from the published stylesheet and are outside the stable contract of 0.3.0.

PortalLayout has no JavaScript controller of its own. The markup is the API: write a `div` with the class `hw-portal-layout` that holds, in this order, a `header` with the class `hw-portal-header`, an optional `nav` with the class `hw-secondary-nav`, a `main` with the classes `hw-portal-layout-main` and `hw-container`, and a `footer` with the class `hw-portal-footer`. The `main` element carries an `id` that the skip link names and a `tabindex` attribute with the value -1, so the skip link can move focus to it. An optional breadcrumb, a `nav` with the class `hw-breadcrumb`, stands first inside the `main` element. Mark the header with `data-hw="portal-header"` so that `enhance()` of `@hawiyah/vanilla` binds the mobile menu; the toggle button carries `data-hw-portal-toggle` and the navigation `data-hw-portal-navigation`. The header holds, in reading order, a skip link with the class `hw-skip-link`, the brand link with the class `hw-portal-brand`, the menu toggle with the classes `hw-button` and `hw-portal-menu-toggle`, and the navigation. The navigation stays visible until enhancement, so write no `hidden` and no `data-open="false"` in the initial markup. The footer follows the markup of the [PortalFooter](portal-footer.md) page.

### React

Table: Props of PortalLayout

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `brand` | `ReactNode` | `true` | — |
| `brandLabel` | `string` | `false` | — |
| `headerProps` | `Omit<PortalHeaderBaseProps, 'brand' \| 'brandLabel' \| 'navigationLabel' \| 'menuLabel'>` | `false` | — |
| `mainId` | `string` | `false` | — |
| `skipLabel` | `string` | `true` | — |
| `menuLabel` | `string` | `true` | — |
| `navigationLabel` | `string` | `true` | — |
| `footerProps` | `PortalFooterContentProps & { links?: undefined } \| PortalFooterContentProps` | `true` | — |
| `footerLabel` | `string` | `false` | — |
| `secondaryNavigation` | `readonly PortalNavItem[]` | `false` | — |
| `secondaryLabel` | `string` | `false` | — |
| `breadcrumbs` | `readonly BreadcrumbItem[]` | `false` | — |
| `breadcrumbLabel` | `string` | `false` | — |

`brand` is required and is passed to both the header and the footer; it is text, artwork or both, and `brandLabel` is the accessible name of a brand that is artwork only. `skipLabel`, `menuLabel` and `navigationLabel` are required in every use. `mainId` is the id of the main container, which the skip link names; without it the layout generates one. `headerProps` carries the remaining props of `PortalHeader` that the layout does not set itself, such as its links, the address of the brand link, its actions, its notice and the open state of its menu. `footerProps` carries the footer content under the names of the [PortalFooter](portal-footer.md) props; its `externalLabel` is required, and `footerLabel` is required with `footerProps.links` and is passed to the footer as its navigation label. `secondaryNavigation` renders a secondary navigation and needs `secondaryLabel`, and `breadcrumbs` renders a breadcrumb and needs `breadcrumbLabel`. Children are rendered in the main container after the breadcrumb. The layout sets no `lang` and no `dir`: pass them as attributes of the layout, as for any element, or set them on an ancestor. The other attributes reach the root `div`.

### Vue

Table: Props, events and slots of PortalLayout

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `brand` | prop | `string` | `false` | — |
| `brandLabel` | prop | `string` | `false` | — |
| `homeHref` | prop | `string` | `false` | `'/'` |
| `links` | prop | `readonly PortalLink[]` | `false` | — |
| `secondaryNavigation` | prop | `readonly PortalLink[]` | `false` | — |
| `footerLinks` | prop | `readonly PortalLink[]` | `false` | — |
| `breadcrumbs` | prop | `readonly BreadcrumbItem[]` | `false` | — |
| `copyright` | prop | `string` | `false` | — |
| `mainId` | prop | `string` | `false` | — |
| `dir` | prop | `'rtl' \| 'ltr' \| 'auto'` | `false` | — |
| `skipLabel` | prop | `string` | `true` | — |
| `menuLabel` | prop | `string` | `true` | — |
| `navigationLabel` | prop | `string` | `true` | — |
| `secondaryLabel` | prop | `string` | `false` | — |
| `breadcrumbLabel` | prop | `string` | `false` | — |
| `footerLabel` | prop | `string` | `false` | — |
| `footerProps` | prop | `Record<string, unknown> & { externalLabel?: string; legalLinksLabel?: string; supportLabel?: string }` | `false` | — |
| `brand` | slot | — | `false` | — |
| `notice` | slot | — | `false` | — |
| `actions` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |
| `footer` | slot | — | `false` | — |

`skipLabel`, `menuLabel` and `navigationLabel` are required. `brand` is text that the header and the footer both show, and the content of the `brand` slot is rendered before that text in both; `brandLabel` names a brand that is artwork only. `homeHref` is the address of the brand link and defaults to `'/'`. `links` is the main navigation, `secondaryNavigation` needs `secondaryLabel`, `breadcrumbs` needs `breadcrumbLabel`, and `footerLinks` needs `footerLabel`; each of these arrays defaults to an empty array. `copyright` is the line of text in the footer. `footerProps` carries the further props of the footer, and the text that the footer adds to its external links is required there. `mainId` is the id of the main container, and the layout generates one without it. `dir` is written as the `dir` attribute of the root element; `lang` is not a prop and falls through to the root element with the other attributes. The `notice` slot renders above the brand and the `actions` slot after the navigation. The default slot is the page content, and the `footer` slot adds content to the footer. The table lists the five slots because the published build reads them; the declaration types none.

### Angular

Table: Inputs, outputs and content of hw-portal-layout

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `brand` | input | `string` | `false` | `''` |
| `brandLabel` | input | `string` | `false` | `''` |
| `homeHref` | input | `string` | `false` | `'/'` |
| `dir` | input | `'rtl' \| 'ltr'` | `false` | — |
| `mainId` | input | `string` | `false` | — |
| `links` | input | `readonly HwPortalNavItem[]` | `false` | `[]` |
| `navigationId` | input | `string` | `false` | — |
| `secondaryNavigation` | input | `readonly HwLinkItem[]` | `false` | `[]` |
| `footerLinks` | input | `readonly HwPortalFooterLink[]` | `false` | `[]` |
| `breadcrumbs` | input | `readonly HwBreadcrumbItem[]` | `false` | `[]` |
| `copyright` | input | `string` | `false` | `''` |
| `skipLabel` | input | `string` | `true` | — |
| `menuLabel` | input | `string` | `true` | — |
| `navigationLabel` | input | `string` | `true` | — |
| `secondaryLabel` | input | `string` | `false` | `''` |
| `breadcrumbLabel` | input | `string` | `false` | `''` |
| `footerLabel` | input | `string` | `false` | `''` |
| `externalLabel` | input | `string` | `true` | — |
| `[hwPortalNotice]` | content | — | `false` | — |
| `[hwBrand]` | content | — | `false` | — |
| `[hwPortalActions]` | content | — | `false` | — |
| `*` | content | — | `false` | — |
| `[hwFooterBrand]` | content | — | `false` | — |
| `[hwPortalFooter]` | content | — | `false` | — |

`HwPortalLayoutComponent` applies to `hw-portal-layout` and renders the layout `div` inside the host element. `skipLabel`, `menuLabel`, `navigationLabel` and `externalLabel` are required text, and `externalLabel` is the text that the footer adds to its external links. `brand` is text that the header and the footer both show; content marked `hwBrand` is rendered before it in the header and content marked `hwFooterBrand` before it in the footer, and `brandLabel` names a brand that is artwork only. `links` is the main navigation, `secondaryNavigation` needs `secondaryLabel`, `breadcrumbs` needs `breadcrumbLabel`, and `footerLinks` needs `footerLabel`. `copyright` is the line of text in the footer. `homeHref` is the address of the brand link. `dir` is written as the `dir` attribute of the layout. `mainId` and `navigationId` are generated from one id source for each application; pass explicit, stable ids where Angular roots are serialised independently. Content marked `hwPortalNotice` renders above the brand and content marked `hwPortalActions` after the navigation. Other content is the page content in the main container, and content marked `hwPortalFooter` is added to the footer.

## Accessibility

PortalLayout renders the landmarks of a page: a `header`, the navigation regions, a single `main` element and a `footer`. Use one layout for each page, and do not nest a second `main` element inside it.

- The skip link is the first focusable element of the header. It leads to the main container, which has a `tabindex` attribute with the value -1, so that the browser can move focus to it. The text of the link is `skipLabel`.
- Each navigation region has its own accessible name: `navigationLabel` for the main navigation, `secondaryLabel` for the secondary navigation, `breadcrumbLabel` for the breadcrumb and `footerLabel` for the footer links. Give each a different text, so that a reader of landmarks can tell them apart.
- The link of the current page carries `aria-current="page"`.
- Where the header has links, it renders a menu toggle button that carries `aria-expanded` and `aria-controls`, and the links stay visible at desktop widths. Below 48rem the toggle opens and closes the navigation. <kbd>Escape</kbd> closes the open navigation and returns focus to the toggle, and <kbd>Tab</kbd> is not trapped.
- Without enhancement, the vanilla navigation stays visible, because the initial markup carries no `hidden` attribute.
- A header link that has groups renders a disclosure whose arrow rotates with a transition, and the breadcrumb links change colour with a transition whose duration is 0ms unless the application sets a duration. The stylesheet removes both transitions when the reader asks for reduced motion.

## RTL and localisation

PortalLayout has no built-in text, and it sets no `lang` and no `dir` of its own. The application writes every label and the content in the language of the page, sets `lang` and `dir` on the layout or on an ancestor, and may set them independently of each other.

- In React and in the markup, pass `lang` and `dir` as attributes of the layout. In Vue, `dir` is a prop, and in Angular it is an input; `lang` is an attribute in both.
- The layout follows the direction in force through logical properties, so the header, the navigation, the breadcrumb and the footer begin at the reading start in Arabic and in English.
- Write the navigation items in reading order for each language; the layout does not reorder them.
- Brand artwork is supplied by the application. Provide the artwork for each language where it differs, and name it with `brandLabel` where it has no text.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of PortalLayout; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- PortalLayout is listed among the platform patterns of the component scope in the [coverage notes](../coverage.md). The notes describe it as a composition of the header, the secondary navigation, the breadcrumb, a focusable main container and the footer, and state that the 48rem disclosure breakpoint is a Hawiyah adaptation.
- The navigation groups of the header follow the [portal navigation notes](../nic-portal-navigation.md), and the footer follows the [footer notes](../nic-footer.md). The footer notes record a source mapping and do not claim full visual parity, and the portal navigation notes record that the panel spacing, elevation and columns of the header are Hawiyah design choices.
