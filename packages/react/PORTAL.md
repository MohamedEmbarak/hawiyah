# Portal layout

`PortalLayout` composes `PortalHeader`, optional `SecondaryNav`, `Breadcrumb`,
a focusable main container and `PortalFooter`. It defaults to Arabic and RTL.
It is a public portal shell; keep application routing and page content in the app.

```tsx
import { PortalLayout } from '@hawiyah/react';
import '@hawiyah/styles/styles.css';

<PortalLayout brand="هوية"
  headerProps={{ brandHref: '/', navigation: [{ label: 'الخدمات', href: '/services', current: true }] }}
  secondaryNavigation={[{ label: 'دليل الخدمات', href: '/services', current: true }]}
  breadcrumbs={[{ label: 'الرئيسية', href: '/' }, { label: 'الخدمات', current: true }]}
  footerProps={{ links: [{ label: 'الخصوصية', href: '/privacy' }] }}>
  <h1>الخدمات</h1>
</PortalLayout>
```

`headerProps` accepts the existing header API plus `menuLabel`, `navigationId`,
and `navigationLabel`. `actions`/`notice` remain composable React nodes. Supply
your actual brand SVG as `brand`; no government artwork is inferred. `footerProps`
accepts the existing footer's brand, description, links, linksLabel and legal.
`mainId` is generated with React `useId` unless supplied. `skipLabel`,
`breadcrumbLabel` and `secondaryLabel` override the Arabic accessible labels.

For English, set `lang="en" dir="ltr"` and translate the content and labels,
including `skipLabel`, `breadcrumbLabel`, `secondaryLabel`,
`headerProps.navigationLabel`, `headerProps.menuLabel`, `footerProps.linksLabel`.
Language and direction are independent props.

Standalone `PortalHeader` adds a mobile disclosure when `navigation` has items;
set `mainId` to render its skip link. Escape closes and focuses the toggle;
selection, outside press and focus leaving close it. Tab is not trapped. The
links stay visible at desktop widths. Multiple headers receive separate IDs.
`SecondaryNav` takes `items` and `label`; these are ordinary page links with
`aria-current`, not tabs or menus.

The 48rem disclosure breakpoint is an intentional Hawiyah policy. The layout uses
shared tokens in DGA, Hawiyah and custom themes, and introduces no animation.
Source-informed composition does not claim pixel parity or DGA certification.

## Mobile navigation bar

Use `variant="mobile"` on `SecondaryNav` (React/Vue) or `hw-secondary-nav`
(Angular). Items accept an optional decorative `icon` name from the bundled icon
stylesheet, such as `home-01`, `search-01` or `menu-01`; labels remain required.
Vanilla uses `data-variant="mobile"` and the same semantic HTML:

```html
<nav class="hw-secondary-nav" data-variant="mobile" aria-label="تنقل الجوال">
  <ul>
    <li><a href="/" aria-current="page"><span class="hw-icon" data-icon="home-01" aria-hidden="true"></span><span>الرئيسية</span></a></li>
    <li><a href="/services"><span class="hw-icon" data-icon="search-01" aria-hidden="true"></span><span>الخدمات</span></a></li>
  </ul>
</nav>
```

The bar uses equal-width items, 24 px icons, a 70 px minimum height, wrapped labels
and a top current-page indicator. It is in normal flow and does not cover page
content. Safe-area bottom padding accommodates mobile devices; the source OS
home indicator is not reproduced. The application owns route/current updates.
These are page links, not content tabs: preserve native Tab/Enter navigation.

DGA/custom color transitions use `--hw-duration-tab-bar: 300ms` and
`--hw-ease-tab-bar: cubic-bezier(0, 0, 0.58, 1)`. Hawiyah remains immediate by
default. Reduced motion removes transitions; forced colors retains the selected
top border and keyboard focus. Hover does not mark a route selected.

Source Mobile `8332:24202` → `8332:24242` → `8332:24282` supports color changes,
not a sliding indicator or tab-panel animation. Semantic colors adapt to theme;
icon color follows the label, since imported icon override endpoints were not
resolved. Arabic width differs from English in the source, so no fixed item
width is imposed. This is a source-informed composition, not certified parity.
