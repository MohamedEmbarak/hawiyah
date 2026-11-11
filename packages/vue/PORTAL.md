# Portal layout

`PortalLayout` composes `PortalHeader`, optional `SecondaryNav`, `Breadcrumb`,
a focusable main container and `PortalFooter`. It renders `dir` only when the
application passes one, and it never sets `lang`.

```vue
<script setup lang="ts">
import { PortalLayout } from '@hawiyah/vue';
import '@hawiyah/styles/styles.css';
const links = [{ label: 'الخدمات', href: '/services', current: true }];
</script>
<template>
  <PortalLayout dir="rtl" brand="هوية" :links="links" :secondary-navigation="links"
    :breadcrumbs="[{ label: 'الرئيسية', href: '/' }, { label: 'الخدمات', current: true }]"
    :footer-links="[{ label: 'الخصوصية', href: '/privacy' }]"
    skip-label="انتقل إلى المحتوى" menu-label="القائمة" navigation-label="التنقل الرئيسي"
    secondary-label="التنقل الثانوي" breadcrumb-label="مسار التنقل" footer-label="روابط التذييل"
    :footer-props="{ externalLabel: 'يفتح في نافذة جديدة' }">
    <h1>الخدمات</h1>
  </PortalLayout>
</template>
```

Props: `brand`, `brandLabel`, `homeHref`, `links`, `secondaryNavigation`, `footerLinks`,
`breadcrumbs`, `copyright`, `mainId`, `dir`, `footerProps` (further `PortalFooter`
props such as `externalLabel`, `legalLinksLabel`, `supportLabel`). Required text:
`skipLabel`, `menuLabel` and `navigationLabel` always; `secondaryLabel` when
`secondaryNavigation` is given; `breadcrumbLabel` when `breadcrumbs` are given;
`footerLabel` (the footer's `navigationLabel`) when `footerLinks` are given; and
`footerProps.externalLabel` always, because footer links may be marked external.
`mainId` uses Vue `useId` by default. Slots: `brand`, `actions`, `footer`, default
(page content).

## Text is supplied by the application

The shell ships no built-in strings and does not read `lang` or a locale. Every
label above is application text; a missing required label renders nothing in
its place (the attribute is omitted) and warns once in development with a
`Hawiyah:` console message.

## Brand

The brand is application content. Pass plain text with `brand`, artwork through
the `brand` slot, or both. A brand made of artwork alone takes its accessible
name from `brandLabel`, which is written as `aria-label` on the brand link (or on
the brand container when `homeHref` is empty, in which case no link, `href` or
link role is rendered). When visible brand text is supplied and `brandLabel` is
absent, nothing is added. In development, after mounting in a browser, a brand
with no text, no `aria-label` and no image with a non-empty `alt` warns that it
needs `brandLabel`. `PortalFooter` follows the same rules, and renders its
support section only when its `support` slot is supplied.

```vue
<PortalLayout brand-label="هوية، الصفحة الرئيسية" skip-label="انتقل إلى المحتوى"
  menu-label="القائمة" navigation-label="التنقل الرئيسي" :footer-props="{ externalLabel: 'يفتح في نافذة جديدة' }">
  <template #brand><img src="/logo.svg" alt="" width="96" height="40" /></template>
  <h1>الخدمات</h1>
</PortalLayout>
```

## Header and secondary navigation

Standalone `PortalHeader` takes `brand`, `brandLabel`, `homeHref`, `links`,
required `navigationLabel` and `menuLabel`, and `navigationId`. Its skip link is
rendered only when `mainId` names a target; `skipLabel` is then required. The
skip link is a packaged fragment link: it is rendered as `href="#id"` on the
server and on first render, is bound with core `bindFragmentLink` after mounting,
and from the first interaction resolves against the current document under any
`<base href>`. Escape returns focus to the toggle; selection, outside press and
focus leaving close the mobile disclosure. Tab is native. Desktop links remain
visible. `SecondaryNav` uses `items`, a required `label` (or `aria-label` /
`aria-labelledby`) and ordinary page links with `aria-current`, not menu/tablist
semantics.

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
