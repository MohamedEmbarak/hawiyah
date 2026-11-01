# Portal layout

`PortalLayout` composes `PortalHeader`, optional `SecondaryNav`, `Breadcrumb`,
a focusable main container and `PortalFooter`. It defaults to Arabic and RTL.
It is a public portal shell; keep application routing and page content in the app.

```tsx
import { PortalLayout } from '@nasaq/react';
import '@nasaq/styles/styles.css';

<PortalLayout brand="نسق"
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

The 48rem disclosure breakpoint is an intentional Nasaq policy. The layout uses
shared tokens in DGA, Nasaq and custom themes, and introduces no animation.
Source-informed composition does not claim pixel parity or DGA certification.
