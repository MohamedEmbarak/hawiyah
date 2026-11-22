# PortalHeader

## Example

```html live example=basic check=portal-header-tab-order frame width=390
<header class="hw-portal-header" data-hw="portal-header">
  <a class="hw-skip-link" href="#main-content">Skip to main content</a>
  <a class="hw-portal-brand" href="/"><span>Service portal</span></a>
  <button class="hw-button hw-portal-menu-toggle" type="button" data-hw-portal-toggle><span class="hw-icon" data-icon="menu-01" aria-hidden="true"></span>Menu</button>
  <nav id="primary-navigation" aria-label="Main navigation" data-hw-portal-navigation>
    <ul>
      <li><a class="hw-link" href="/requests" aria-current="page">Requests</a></li>
      <li>
        <details class="hw-portal-branch" data-hw-portal-branch>
          <summary>Services</summary>
          <div class="hw-portal-branch-panel">
            <a class="hw-link hw-portal-branch-overview" href="/services">Services</a>
            <section class="hw-portal-branch-group">
              <h2>Records</h2>
              <ul>
                <li><a class="hw-link" href="/services/records/new">Request a record</a></li>
                <li><a class="hw-link" href="/services/records/track">Track a request</a></li>
              </ul>
            </section>
          </div>
        </details>
      </li>
      <li><a class="hw-link" href="/documents">Documents</a></li>
      <li><a class="hw-link" href="/help">Help</a></li>
    </ul>
  </nav>
  <div class="hw-portal-header-actions"><button class="hw-button" type="button" data-variant="secondary" data-size="md">Sign in</button></div>
</header>
<main class="hw-container" id="main-content">
  <h1>Service requests</h1>
  <p>Submit a new request or follow an existing one.</p>
</main>
```

```tsx live example=basic
<>
  <PortalHeader
    brand={<span>Service portal</span>}
    mainId="main-content"
    skipLabel="Skip to main content"
    menuLabel="Menu"
    navigationLabel="Main navigation"
    navigationId="primary-navigation"
    links={[
      { label: 'Requests', href: '/requests', current: true },
      {
        label: 'Services',
        href: '/services',
        groups: [
          {
            label: 'Records',
            links: [
              { label: 'Request a record', href: '/services/records/new' },
              { label: 'Track a request', href: '/services/records/track' },
            ],
          },
        ],
      },
      { label: 'Documents', href: '/documents' },
      { label: 'Help', href: '/help' },
    ]}
    actions={<Button variant="secondary">Sign in</Button>}
  />
  <main className="hw-container" id="main-content">
    <h1>Service requests</h1>
    <p>Submit a new request or follow an existing one.</p>
  </main>
</>
```

```vue live example=basic
<PortalHeader
  brand="Service portal"
  main-id="main-content"
  skip-label="Skip to main content"
  menu-label="Menu"
  navigation-label="Main navigation"
  navigation-id="primary-navigation"
  :links="[
    { label: 'Requests', href: '/requests', current: true },
    {
      label: 'Services',
      href: '/services',
      groups: [
        {
          label: 'Records',
          links: [
            { label: 'Request a record', href: '/services/records/new' },
            { label: 'Track a request', href: '/services/records/track' },
          ],
        },
      ],
    },
    { label: 'Documents', href: '/documents' },
    { label: 'Help', href: '/help' },
  ]"
>
  <template #actions><Button variant="secondary">Sign in</Button></template>
</PortalHeader>
<main class="hw-container" id="main-content">
  <h1>Service requests</h1>
  <p>Submit a new request or follow an existing one.</p>
</main>
```

```ts live example=basic framework=angular
template: `<hw-portal-header
  brand="Service portal"
  mainId="main-content"
  skipLabel="Skip to main content"
  menuLabel="Menu"
  navigationLabel="Main navigation"
  navigationId="primary-navigation"
  [links]="[
    { label: 'Requests', href: '/requests', current: true },
    {
      label: 'Services',
      href: '/services',
      groups: [
        {
          label: 'Records',
          links: [
            { label: 'Request a record', href: '/services/records/new' },
            { label: 'Track a request', href: '/services/records/track' },
          ],
        },
      ],
    },
    { label: 'Documents', href: '/documents' },
    { label: 'Help', href: '/help' },
  ]"
>
  <button hwButton variant="secondary">Sign in</button>
</hw-portal-header>
<main class="hw-container" id="main-content">
  <h1>Service requests</h1>
  <p>Submit a new request or follow an existing one.</p>
</main>`
```

## Variants and states

### Grouped navigation

```html live example=grouped check=portal-header-branch,portal-header-escape,portal-header-panel-tab frame width=390
<header class="hw-portal-header" data-hw="portal-header">
  <a class="hw-portal-brand" href="/"><span>Service portal</span></a>
  <button class="hw-button hw-portal-menu-toggle" type="button" data-hw-portal-toggle><span class="hw-icon" data-icon="menu-01" aria-hidden="true"></span>Menu</button>
  <nav id="grouped-navigation" aria-label="Main navigation" data-hw-portal-navigation>
    <ul>
      <li>
        <details class="hw-portal-branch" data-hw-portal-branch>
          <summary>Services</summary>
          <div class="hw-portal-branch-panel">
            <a class="hw-link hw-portal-branch-overview" href="/services">Services</a>
            <section class="hw-portal-branch-group">
              <h2>Records</h2>
              <ul>
                <li><a class="hw-link" href="/services/records/new">Request a record</a></li>
                <li><a class="hw-link" href="/services/records/track">Track a request</a></li>
              </ul>
            </section>
            <section class="hw-portal-branch-group">
              <h2>Permits</h2>
              <ul>
                <li><a class="hw-link" href="/services/permits/new">Apply for a permit</a></li>
                <li><a class="hw-link" href="/services/permits/renew">Renew a permit</a></li>
              </ul>
            </section>
          </div>
        </details>
      </li>
      <li>
        <details class="hw-portal-branch" data-hw-portal-branch>
          <summary>Documents</summary>
          <div class="hw-portal-branch-panel">
            <a class="hw-link hw-portal-branch-overview" href="/documents">Documents</a>
            <section class="hw-portal-branch-group">
              <h2>My documents</h2>
              <ul>
                <li><a class="hw-link" href="/documents/uploaded">Uploaded documents</a></li>
                <li><a class="hw-link" href="/documents/issued">Issued documents</a></li>
              </ul>
            </section>
          </div>
        </details>
      </li>
      <li><a class="hw-link" href="/help">Help</a></li>
    </ul>
  </nav>
  <div class="hw-portal-header-actions"><button class="hw-button" type="button" data-variant="secondary" data-size="md">Sign in</button></div>
</header>
```

```tsx live example=grouped
<PortalHeader
  brand={<span>Service portal</span>}
  menuLabel="Menu"
  navigationLabel="Main navigation"
  navigationId="grouped-navigation"
  links={[
    {
      label: 'Services',
      href: '/services',
      groups: [
        {
          label: 'Records',
          links: [
            { label: 'Request a record', href: '/services/records/new' },
            { label: 'Track a request', href: '/services/records/track' },
          ],
        },
        {
          label: 'Permits',
          links: [
            { label: 'Apply for a permit', href: '/services/permits/new' },
            { label: 'Renew a permit', href: '/services/permits/renew' },
          ],
        },
      ],
    },
    {
      label: 'Documents',
      href: '/documents',
      groups: [
        {
          label: 'My documents',
          links: [
            { label: 'Uploaded documents', href: '/documents/uploaded' },
            { label: 'Issued documents', href: '/documents/issued' },
          ],
        },
      ],
    },
    { label: 'Help', href: '/help' },
  ]}
  actions={<Button variant="secondary">Sign in</Button>}
/>
```

```vue live example=grouped
<PortalHeader
  brand="Service portal"
  menu-label="Menu"
  navigation-label="Main navigation"
  navigation-id="grouped-navigation"
  :links="[
    {
      label: 'Services',
      href: '/services',
      groups: [
        {
          label: 'Records',
          links: [
            { label: 'Request a record', href: '/services/records/new' },
            { label: 'Track a request', href: '/services/records/track' },
          ],
        },
        {
          label: 'Permits',
          links: [
            { label: 'Apply for a permit', href: '/services/permits/new' },
            { label: 'Renew a permit', href: '/services/permits/renew' },
          ],
        },
      ],
    },
    {
      label: 'Documents',
      href: '/documents',
      groups: [
        {
          label: 'My documents',
          links: [
            { label: 'Uploaded documents', href: '/documents/uploaded' },
            { label: 'Issued documents', href: '/documents/issued' },
          ],
        },
      ],
    },
    { label: 'Help', href: '/help' },
  ]"
>
  <template #actions><Button variant="secondary">Sign in</Button></template>
</PortalHeader>
```

```ts live example=grouped framework=angular
template: `<hw-portal-header
  brand="Service portal"
  menuLabel="Menu"
  navigationLabel="Main navigation"
  navigationId="grouped-navigation"
  [links]="[
    {
      label: 'Services',
      href: '/services',
      groups: [
        {
          label: 'Records',
          links: [
            { label: 'Request a record', href: '/services/records/new' },
            { label: 'Track a request', href: '/services/records/track' },
          ],
        },
        {
          label: 'Permits',
          links: [
            { label: 'Apply for a permit', href: '/services/permits/new' },
            { label: 'Renew a permit', href: '/services/permits/renew' },
          ],
        },
      ],
    },
    {
      label: 'Documents',
      href: '/documents',
      groups: [
        {
          label: 'My documents',
          links: [
            { label: 'Uploaded documents', href: '/documents/uploaded' },
            { label: 'Issued documents', href: '/documents/issued' },
          ],
        },
      ],
    },
    { label: 'Help', href: '/help' },
  ]"
>
  <button hwButton variant="secondary">Sign in</button>
</hw-portal-header>`
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

## Accessibility

Table: Keyboard interaction of PortalHeader

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves focus through the skip link, the brand, the menu toggle below 48rem, the navigation entries, the links of an expanded branch and the actions in document order, and collapses a branch or the navigation that focus leaves. |
| <kbd>Enter</kbd>, <kbd>Space</kbd> | Expands or collapses the branch of the focused summary, or below 48rem the navigation of the focused menu toggle, and keeps focus on that control. |
| <kbd>Escape</kbd> | Collapses the expanded branch and moves focus to its summary, or below 48rem, with no branch expanded, collapses the navigation and moves focus to the menu toggle. |

## RTL and localisation

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification.
