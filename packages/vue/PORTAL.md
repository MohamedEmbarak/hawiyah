# Portal layout

`PortalLayout` composes `PortalHeader`, optional `SecondaryNav`, `Breadcrumb`,
a focusable main container and `PortalFooter`. It defaults to `lang="ar" dir="rtl"`.

```vue
<script setup lang="ts">
import { PortalLayout } from '@hawiyah/vue';
import '@hawiyah/styles/styles.css';
const links = [{ label: 'الخدمات', href: '/services', current: true }];
</script>
<template>
  <PortalLayout brand="هوية" :links="links" :secondary-navigation="links"
    :breadcrumbs="[{ label: 'الرئيسية', href: '/' }, { label: 'الخدمات', current: true }]"
    :footer-links="[{ label: 'الخصوصية', href: '/privacy' }]">
    <h1>الخدمات</h1>
  </PortalLayout>
</template>
```

Props: `brand` (required), `homeHref`, `links`, `secondaryNavigation`, `footerLinks`,
`breadcrumbs`, `copyright`, `mainId`, `lang`, `dir`. Accessible labels:
`skipLabel`, `menuLabel`, `navigationLabel`, `secondaryLabel`, `breadcrumbLabel`,
`footerLabel`. `mainId` uses Vue `useId` by default. Slots: `logo`, `actions`,
`footer`, default (page content). Supply actual artwork through `logo`.

For English, pass `lang="en" dir="ltr"` and translate all content and labels.
Direction and language remain independent. Existing standalone `PortalHeader`
keeps `brand`, `homeHref`, `links`, `navLabel` and its slots, adding `menuLabel`,
`navigationId`, `mainId` and `skipLabel`. Escape returns focus to the toggle;
selection, outside press and focus leaving close the mobile disclosure. Tab is
native. Desktop links remain visible. `SecondaryNav` uses `items`, `label` and
ordinary page links with `aria-current`, not menu/tablist semantics.

The 48rem mobile breakpoint is Hawiyah policy. Shared tokens preserve DGA, Hawiyah
and custom themes. The shell introduces no animations. Source-informed
composition does not establish pixel parity or DGA certification.

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
