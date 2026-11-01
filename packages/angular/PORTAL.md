# Portal layout

Import the standalone `NqPortalLayoutComponent` to get the header, optional
secondary navigation, breadcrumb, focusable main container and footer together.

```html
<nq-portal-layout brand="نسق" [links]="links" [secondaryNavigation]="links"
  [breadcrumbs]="breadcrumbs" [footerLinks]="footerLinks">
  <h1>الخدمات</h1>
</nq-portal-layout>
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

Content projection: `[nqBrand]` for actual brand artwork, `[nqPortalActions]`
for header actions, `[nqPortalFooter]` for additional footer content, default for
main page content. `NqSecondaryNavComponent` is independently available with
`items` and `label`. It uses ordinary links with `aria-current`, not tab/menu roles.

Standalone `NqPortalHeaderComponent` retains its inputs. Escape closes the mobile
disclosure and focuses its toggle; link selection, outside press and focus
leaving close it. Tab remains native and desktop links stay visible. Each header
gets a distinct navigation ID unless supplied explicitly. No vanilla controller
is attached to Angular-owned DOM.

The 48rem mobile breakpoint is a Nasaq adaptation. Shared tokens support DGA,
Nasaq and custom themes. No animation is added by this layout. Source-informed
composition does not establish exact visual parity or DGA certification.
