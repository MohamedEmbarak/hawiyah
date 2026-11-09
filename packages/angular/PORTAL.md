# Portal layout

Import the standalone `HwPortalLayoutComponent` to get the header, optional
secondary navigation, breadcrumb, focusable main container and footer together.

```html
<hw-portal-layout brand="هوية" [links]="links" [secondaryNavigation]="links"
  [breadcrumbs]="breadcrumbs" [footerLinks]="footerLinks">
  <h1>الخدمات</h1>
</hw-portal-layout>
```

```ts
links = [{ label: 'الخدمات', href: '/services', current: true }];
breadcrumbs = [{ label: 'الرئيسية', href: '/' }, { label: 'الخدمات' }];
footerLinks = [{ label: 'الخصوصية', href: '/privacy' }];
```

Inputs: `brand` (required), `homeHref`, `links`, `secondaryNavigation`, `footerLinks`,
`breadcrumbs`, `copyright`, `mainId`, `lang` (ar), `dir` (rtl). Labels default to
Arabic: `skipLabel`, `menuLabel`, `navigationLabel`, `secondaryLabel`,
`breadcrumbLabel`, `footerLabel`. Set `lang="en" dir="ltr"` and translate labels
and content for English. Language and direction remain independent. Use explicit
stable `mainId`/standalone `navigationId` when serializing independent app roots.

Content projection: `[hwBrand]` for actual brand artwork, `[hwPortalActions]`
for header actions, `[hwPortalFooter]` for additional footer content, default for
main page content. `HwSecondaryNavComponent` is independently available with
`items` and `label`. It uses ordinary links with `aria-current`, not tab/menu roles.

Standalone `HwPortalHeaderComponent` retains its inputs. Escape closes the mobile
disclosure and focuses its toggle; link selection, outside press and focus
leaving close it. Tab remains native and desktop links stay visible. Each header
gets a distinct navigation ID unless supplied explicitly. No vanilla controller
is attached to Angular-owned DOM.

The 48rem mobile breakpoint is a Hawiyah adaptation. Shared tokens support DGA,
Hawiyah and custom themes. No animation is added by this layout. Source-informed
composition does not establish exact visual parity or DGA certification.

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
