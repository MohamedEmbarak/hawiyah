# Home page

The home page template of a service portal places a page header, a search field and a grid of service cards between the header with its navigation and the footer. The application supplies every text, destination and service.

## Example

The page header names the page and states what the reader can do there. The search field stands below it, and the service cards follow in a grid that has one column in a narrow viewport and three columns from the `md` step of [Grid](../components/grid.md). The header and the footer come from [PortalLayout](../components/portal-layout.md), which also provides the skip link and the main container that holds the page content.

### Default

The search field has a visible label and a search button, and each card is a service with a category, a description and one action link whose name includes the service.

```html live example=default differences=portal-layout-adapter-markup,portal-layout-footer-brand-tree,portal-layout-footer-brand-weight,search-field-adapter-markup,grid-vue-layout-attributes,stack-vue-layout-attributes frame
<div class="hw-portal-layout">
  <header class="hw-portal-header" data-hw="portal-header">
    <a class="hw-skip-link" href="#home-content">Skip to main content</a>
    <a class="hw-portal-brand" href="/">Example Portal</a>
    <button class="hw-button hw-portal-menu-toggle" type="button" data-hw-portal-toggle><span class="hw-icon" data-icon="menu-01" aria-hidden="true"></span>Menu</button>
    <nav aria-label="Main navigation" data-hw-portal-navigation>
      <ul><li><a class="hw-link" href="/services" aria-current="page">Services</a></li><li><a class="hw-link" href="/requests">Requests</a></li><li><a class="hw-link" href="/documents">Documents</a></li></ul>
    </nav>
  </header>
  <main class="hw-portal-layout-main hw-container" id="home-content" tabindex="-1">
    <div class="hw-stack">
      <header class="hw-page-header">
        <div class="hw-page-header-main">
          <div><h1>Services</h1><p>Find a service and start a request.</p></div>
        </div>
      </header>
      <div class="hw-field hw-search-field" data-hw="search-field">
        <label class="hw-label" for="home-query">Search services</label>
        <div class="hw-input-group">
          <div class="hw-search-control">
            <input class="hw-input" id="home-query" name="query" type="search" data-hw-search-input>
            <button class="hw-button hw-search-clear" type="button" data-variant="ghost" data-size="md" aria-label="Clear search" data-hw-search-clear></button>
          </div>
          <button class="hw-button hw-search-submit" type="button" data-variant="primary" data-size="md" aria-label="Search"><span class="hw-search-submit-icon" aria-hidden="true"></span></button>
        </div>
      </div>
      <h2>Available services</h2>
      <div class="hw-grid" style="--hw-layout-columns: 1; --hw-layout-columns-md: 3">
        <article class="hw-card hw-service-card">
          <header class="hw-card-header"><div><span class="hw-badge" data-tone="neutral">Documents</span><h3>Copy of a document</h3></div></header>
          <div class="hw-card-body">
            <p>Request a certified copy of a document held on your record.</p>
          </div>
          <footer class="hw-card-footer"><a class="hw-link" href="/services/document-copy">Request a copy of a document</a></footer>
        </article>
        <article class="hw-card hw-service-card">
          <header class="hw-card-header"><div><span class="hw-badge" data-tone="neutral">Residence</span><h3>Residence permit renewal</h3></div></header>
          <div class="hw-card-body">
            <p>Renew a residence permit before it expires.</p>
          </div>
          <footer class="hw-card-footer"><a class="hw-link" href="/services/residence-renewal">Renew a residence permit</a></footer>
        </article>
        <article class="hw-card hw-service-card">
          <header class="hw-card-header"><div><span class="hw-badge" data-tone="neutral">Transport</span><h3>Vehicle registration</h3></div></header>
          <div class="hw-card-body">
            <p>Register a vehicle or renew its registration.</p>
          </div>
          <footer class="hw-card-footer"><a class="hw-link" href="/services/vehicle-registration">Register a vehicle</a></footer>
        </article>
      </div>
    </div>
  </main>
  <footer class="hw-portal-footer">
    <div class="hw-portal-footer-main">
      <div class="hw-portal-footer-brand"><div class="hw-portal-footer-brand-marks">Example Portal</div></div>
      <nav class="hw-portal-footer-group" aria-label="Footer links"><h2>Footer links</h2><ul class="hw-portal-footer-links"><li><a class="hw-link" href="/privacy">Privacy policy</a></li><li><a class="hw-link" href="/terms">Terms of use</a></li></ul></nav>
    </div>
  </footer>
</div>
```

```tsx live example=default
<PortalLayout
  brand="Example Portal"
  mainId="home-content"
  skipLabel="Skip to main content"
  menuLabel="Menu"
  navigationLabel="Main navigation"
  headerProps={{
    links: [
      { label: 'Services', href: '/services', current: true },
      { label: 'Requests', href: '/requests' },
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
  <Stack>
    <PageHeader title="Services" description="Find a service and start a request." />
    <SearchField label="Search services" name="query" clearLabel="Clear search" showSearchButton searchLabel="Search" />
    <h2>Available services</h2>
    <Grid columns={{ base: 1, md: 3 }}>
      <ServiceCard
        title="Copy of a document"
        category="Documents"
        description="Request a certified copy of a document held on your record."
        href="/services/document-copy"
        actionLabel="Request a copy of a document"
      />
      <ServiceCard
        title="Residence permit renewal"
        category="Residence"
        description="Renew a residence permit before it expires."
        href="/services/residence-renewal"
        actionLabel="Renew a residence permit"
      />
      <ServiceCard
        title="Vehicle registration"
        category="Transport"
        description="Register a vehicle or renew its registration."
        href="/services/vehicle-registration"
        actionLabel="Register a vehicle"
      />
    </Grid>
  </Stack>
</PortalLayout>
```

```vue live example=default
<PortalLayout
  brand="Example Portal"
  main-id="home-content"
  skip-label="Skip to main content"
  menu-label="Menu"
  navigation-label="Main navigation"
  :links="[
    { label: 'Services', href: '/services', current: true },
    { label: 'Requests', href: '/requests' },
    { label: 'Documents', href: '/documents' },
  ]"
  footer-label="Footer links"
  :footer-links="[
    { label: 'Privacy policy', href: '/privacy' },
    { label: 'Terms of use', href: '/terms' },
  ]"
  :footer-props="{ externalLabel: 'Opens in a new window' }"
>
  <Stack>
    <PageHeader title="Services" description="Find a service and start a request." />
    <SearchField label="Search services" name="query" clear-label="Clear search" show-search-button search-label="Search" />
    <h2>Available services</h2>
    <Grid :columns="{ base: 1, md: 3 }">
      <ServiceCard
        title="Copy of a document"
        category="Documents"
        description="Request a certified copy of a document held on your record."
        href="/services/document-copy"
        action-label="Request a copy of a document"
      />
      <ServiceCard
        title="Residence permit renewal"
        category="Residence"
        description="Renew a residence permit before it expires."
        href="/services/residence-renewal"
        action-label="Renew a residence permit"
      />
      <ServiceCard
        title="Vehicle registration"
        category="Transport"
        description="Register a vehicle or renew its registration."
        href="/services/vehicle-registration"
        action-label="Register a vehicle"
      />
    </Grid>
  </Stack>
</PortalLayout>
```

```ts live example=default framework=angular
template: `<hw-portal-layout
  brand="Example Portal"
  mainId="home-content"
  skipLabel="Skip to main content"
  menuLabel="Menu"
  navigationLabel="Main navigation"
  [links]="[
    { label: 'Services', href: '/services', current: true },
    { label: 'Requests', href: '/requests' },
    { label: 'Documents', href: '/documents' },
  ]"
  footerLabel="Footer links"
  [footerLinks]="[
    { label: 'Privacy policy', href: '/privacy' },
    { label: 'Terms of use', href: '/terms' },
  ]"
  externalLabel="Opens in a new window"
>
  <hw-stack>
    <hw-page-header title="Services" description="Find a service and start a request." />
    <hw-search-field label="Search services" name="query" clearLabel="Clear search" [showSearchButton]="true" searchLabel="Search" />
    <h2>Available services</h2>
    <hw-grid [columns]="{ base: 1, md: 3 }">
      <hw-service-card
        title="Copy of a document"
        category="Documents"
        description="Request a certified copy of a document held on your record."
        href="/services/document-copy"
        actionLabel="Request a copy of a document"
      />
      <hw-service-card
        title="Residence permit renewal"
        category="Residence"
        description="Renew a residence permit before it expires."
        href="/services/residence-renewal"
        actionLabel="Renew a residence permit"
      />
      <hw-service-card
        title="Vehicle registration"
        category="Transport"
        description="Register a vehicle or renew its registration."
        href="/services/vehicle-registration"
        actionLabel="Register a vehicle"
      />
    </hw-grid>
  </hw-stack>
</hw-portal-layout>`
```

### Search with suggestions

With a list of `suggestions`, the field of [SearchField](../components/search-field.md) offers local autocomplete while the reader types. The suggestions are strings that the application supplies, and no request is made. The page shows the field at rest. This state has no search button, and its grid holds two cards.

```html live example=suggestions differences=portal-layout-adapter-markup,portal-layout-footer-brand-tree,portal-layout-footer-brand-weight,search-field-adapter-markup,grid-vue-layout-attributes,stack-vue-layout-attributes frame
<div class="hw-portal-layout">
  <header class="hw-portal-header" data-hw="portal-header">
    <a class="hw-skip-link" href="#suggest-content">Skip to main content</a>
    <a class="hw-portal-brand" href="/">Example Portal</a>
    <button class="hw-button hw-portal-menu-toggle" type="button" data-hw-portal-toggle><span class="hw-icon" data-icon="menu-01" aria-hidden="true"></span>Menu</button>
    <nav aria-label="Main navigation" data-hw-portal-navigation>
      <ul><li><a class="hw-link" href="/services" aria-current="page">Services</a></li><li><a class="hw-link" href="/requests">Requests</a></li><li><a class="hw-link" href="/documents">Documents</a></li></ul>
    </nav>
  </header>
  <main class="hw-portal-layout-main hw-container" id="suggest-content" tabindex="-1">
    <div class="hw-stack">
      <header class="hw-page-header">
        <div class="hw-page-header-main">
          <div><h1>Services</h1><p>Find a service and start a request.</p></div>
        </div>
      </header>
      <div class="hw-field hw-search-field" data-hw="search-field" data-hw-suggestions='["Residence permit","Residence renewal","Vehicle registration"]' data-hw-results-message="{count} suggestions">
        <label class="hw-label" for="suggest-query">Search services</label>
        <div class="hw-input-group">
          <div class="hw-search-control">
            <input class="hw-input" id="suggest-query" name="query" type="search" data-hw-search-input>
            <button class="hw-button hw-search-clear" type="button" data-variant="ghost" data-size="md" aria-label="Clear search" data-hw-search-clear></button>
          </div>
        </div>
      </div>
      <h2>Available services</h2>
      <div class="hw-grid" style="--hw-layout-columns: 1; --hw-layout-columns-md: 3">
        <article class="hw-card hw-service-card">
          <header class="hw-card-header"><div><span class="hw-badge" data-tone="neutral">Residence</span><h3>Residence permit renewal</h3></div></header>
          <div class="hw-card-body">
            <p>Renew a residence permit before it expires.</p>
          </div>
          <footer class="hw-card-footer"><a class="hw-link" href="/services/residence-renewal">Renew a residence permit</a></footer>
        </article>
        <article class="hw-card hw-service-card">
          <header class="hw-card-header"><div><span class="hw-badge" data-tone="neutral">Transport</span><h3>Vehicle registration</h3></div></header>
          <div class="hw-card-body">
            <p>Register a vehicle or renew its registration.</p>
          </div>
          <footer class="hw-card-footer"><a class="hw-link" href="/services/vehicle-registration">Register a vehicle</a></footer>
        </article>
      </div>
    </div>
  </main>
  <footer class="hw-portal-footer">
    <div class="hw-portal-footer-main">
      <div class="hw-portal-footer-brand"><div class="hw-portal-footer-brand-marks">Example Portal</div></div>
      <nav class="hw-portal-footer-group" aria-label="Footer links"><h2>Footer links</h2><ul class="hw-portal-footer-links"><li><a class="hw-link" href="/privacy">Privacy policy</a></li><li><a class="hw-link" href="/terms">Terms of use</a></li></ul></nav>
    </div>
  </footer>
</div>
```

```tsx live example=suggestions
<PortalLayout
  brand="Example Portal"
  mainId="suggest-content"
  skipLabel="Skip to main content"
  menuLabel="Menu"
  navigationLabel="Main navigation"
  headerProps={{
    links: [
      { label: 'Services', href: '/services', current: true },
      { label: 'Requests', href: '/requests' },
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
  <Stack>
    <PageHeader title="Services" description="Find a service and start a request." />
    <SearchField
      label="Search services"
      name="query"
      clearLabel="Clear search"
      suggestions={['Residence permit', 'Residence renewal', 'Vehicle registration']}
      getResultsMessage={(count) => count + ' suggestions'}
    />
    <h2>Available services</h2>
    <Grid columns={{ base: 1, md: 3 }}>
      <ServiceCard
        title="Residence permit renewal"
        category="Residence"
        description="Renew a residence permit before it expires."
        href="/services/residence-renewal"
        actionLabel="Renew a residence permit"
      />
      <ServiceCard
        title="Vehicle registration"
        category="Transport"
        description="Register a vehicle or renew its registration."
        href="/services/vehicle-registration"
        actionLabel="Register a vehicle"
      />
    </Grid>
  </Stack>
</PortalLayout>
```

```vue live example=suggestions
<PortalLayout
  brand="Example Portal"
  main-id="suggest-content"
  skip-label="Skip to main content"
  menu-label="Menu"
  navigation-label="Main navigation"
  :links="[
    { label: 'Services', href: '/services', current: true },
    { label: 'Requests', href: '/requests' },
    { label: 'Documents', href: '/documents' },
  ]"
  footer-label="Footer links"
  :footer-links="[
    { label: 'Privacy policy', href: '/privacy' },
    { label: 'Terms of use', href: '/terms' },
  ]"
  :footer-props="{ externalLabel: 'Opens in a new window' }"
>
  <Stack>
    <PageHeader title="Services" description="Find a service and start a request." />
    <SearchField
      label="Search services"
      name="query"
      clear-label="Clear search"
      :suggestions="['Residence permit', 'Residence renewal', 'Vehicle registration']"
      :get-results-message="(count) => count + ' suggestions'"
    />
    <h2>Available services</h2>
    <Grid :columns="{ base: 1, md: 3 }">
      <ServiceCard
        title="Residence permit renewal"
        category="Residence"
        description="Renew a residence permit before it expires."
        href="/services/residence-renewal"
        action-label="Renew a residence permit"
      />
      <ServiceCard
        title="Vehicle registration"
        category="Transport"
        description="Register a vehicle or renew its registration."
        href="/services/vehicle-registration"
        action-label="Register a vehicle"
      />
    </Grid>
  </Stack>
</PortalLayout>
```

```ts live example=suggestions framework=angular
template: `<hw-portal-layout
  brand="Example Portal"
  mainId="suggest-content"
  skipLabel="Skip to main content"
  menuLabel="Menu"
  navigationLabel="Main navigation"
  [links]="[
    { label: 'Services', href: '/services', current: true },
    { label: 'Requests', href: '/requests' },
    { label: 'Documents', href: '/documents' },
  ]"
  footerLabel="Footer links"
  [footerLinks]="[
    { label: 'Privacy policy', href: '/privacy' },
    { label: 'Terms of use', href: '/terms' },
  ]"
  externalLabel="Opens in a new window"
>
  <hw-stack>
    <hw-page-header title="Services" description="Find a service and start a request." />
    <hw-search-field
      label="Search services"
      name="query"
      clearLabel="Clear search"
      [suggestions]="['Residence permit', 'Residence renewal', 'Vehicle registration']"
      [getResultsMessage]="(count) => count + ' suggestions'"
    />
    <h2>Available services</h2>
    <hw-grid [columns]="{ base: 1, md: 3 }">
      <hw-service-card
        title="Residence permit renewal"
        category="Residence"
        description="Renew a residence permit before it expires."
        href="/services/residence-renewal"
        actionLabel="Renew a residence permit"
      />
      <hw-service-card
        title="Vehicle registration"
        category="Transport"
        description="Register a vehicle or renew its registration."
        href="/services/vehicle-registration"
        actionLabel="Register a vehicle"
      />
    </hw-grid>
  </hw-stack>
</hw-portal-layout>`
```

## Composition

- [PortalLayout](../components/portal-layout.md) renders the header with the skip link and the main navigation, the focusable main container and the footer. The page content is placed inside it.
- [PageHeader](../components/page-header.md) opens the main container with the title of the page, an `h1`, and its description.
- [SearchField](../components/search-field.md) holds the query of the reader. The application runs the search and writes the search button in the vanilla markup.
- [Grid](../components/grid.md) arranges the cards in one column and in three columns from the `md` step.
- [ServiceCard](../components/service-card.md) summarises one service with a category, a description and one action. Its title is a third-level heading, so a second-level heading names the grid of cards and keeps the heading order of the page.
- [Stack](../components/stack.md) places the page header, the search field and the grid in one column with equal space between them.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of the home page template; the evidence of each component is on its own page.

### Sources

- The [coverage notes](../coverage.md) list PortalLayout and ServiceCard among the platform patterns of the component scope, SearchField among the additional controls, and Stack, Grid and PageHeader among the layout components. The source mapping of each component is on its own page.
- The header and the footer follow the [portal navigation notes](../nic-portal-navigation.md) and the [footer notes](../nic-footer.md), and the service cards follow the [card notes](../nic-cards.md).
- The search field follows the [search notes](../nic-search.md).
