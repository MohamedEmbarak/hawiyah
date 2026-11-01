# Portal layout

`PortalLayout` composes `PortalHeader`, optional `SecondaryNav`, `Breadcrumb`,
a focusable main container and `PortalFooter`. It defaults to `lang="ar" dir="rtl"`.

```vue
<script setup lang="ts">
import { PortalLayout } from '@nasaq/vue';
import '@nasaq/styles/styles.css';
const links = [{ label: 'الخدمات', href: '/services', current: true }];
</script>
<template>
  <PortalLayout brand="نسق" :links="links" :secondary-navigation="links"
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

The 48rem mobile breakpoint is Nasaq policy. Shared tokens preserve DGA, Nasaq
and custom themes. The shell introduces no animations. Source-informed
composition does not establish pixel parity or DGA certification.
