# SecondaryNav

SecondaryNav is a navigation landmark of ordinary page links, one of which can be marked as the current page. It has no tab list or menu behaviour: each item is a link that the browser follows.

## Example

The links lead to pages of one service area, and the item for the open page is marked as current. The landmark has a name that tells it apart from the main navigation.

```html live example=basic differences=secondary-nav-adapter-variant
<nav class="hw-secondary-nav" aria-label="Service area">
  <ul>
    <li><a href="/requests" aria-current="page"><span>Requests</span></a></li>
    <li><a href="/documents"><span>Documents</span></a></li>
    <li><a href="/profile"><span>Profile</span></a></li>
  </ul>
</nav>
```

```tsx live example=basic
<SecondaryNav
  label="Service area"
  items={[
    { label: 'Requests', href: '/requests', current: true },
    { label: 'Documents', href: '/documents' },
    { label: 'Profile', href: '/profile' },
  ]}
/>
```

```vue live example=basic
<SecondaryNav
  label="Service area"
  :items="[
    { label: 'Requests', href: '/requests', current: true },
    { label: 'Documents', href: '/documents' },
    { label: 'Profile', href: '/profile' },
  ]"
/>
```

```ts live example=basic framework=angular
template: `<hw-secondary-nav
  label="Service area"
  [items]="[
    { label: 'Requests', href: '/requests', current: true },
    { label: 'Documents', href: '/documents' },
    { label: 'Profile', href: '/profile' },
  ]"
/>`
```

## Variants and states

### Mobile bar

The `mobile` variant lays the links out as equal-width items with a packaged icon above each label, for a bar of the main destinations on a narrow screen. The icon is decorative and the label stays required. The icon name of an item is used only by this variant.

```html live example=mobile
<nav class="hw-secondary-nav" data-variant="mobile" aria-label="Quick links">
  <ul>
    <li><a href="/" aria-current="page"><span class="hw-icon" data-icon="home-01" aria-hidden="true"></span><span>Home</span></a></li>
    <li><a href="/documents"><span class="hw-icon" data-icon="file-01" aria-hidden="true"></span><span>Documents</span></a></li>
    <li><a href="/messages"><span class="hw-icon" data-icon="message-01" aria-hidden="true"></span><span>Messages</span></a></li>
  </ul>
</nav>
```

```tsx live example=mobile
<SecondaryNav
  label="Quick links"
  variant="mobile"
  items={[
    { label: 'Home', href: '/', icon: 'home-01', current: true },
    { label: 'Documents', href: '/documents', icon: 'file-01' },
    { label: 'Messages', href: '/messages', icon: 'message-01' },
  ]}
/>
```

```vue live example=mobile
<SecondaryNav
  label="Quick links"
  variant="mobile"
  :items="[
    { label: 'Home', href: '/', icon: 'home-01', current: true },
    { label: 'Documents', href: '/documents', icon: 'file-01' },
    { label: 'Messages', href: '/messages', icon: 'message-01' },
  ]"
/>
```

```ts live example=mobile framework=angular
template: `<hw-secondary-nav
  label="Quick links"
  variant="mobile"
  [items]="[
    { label: 'Home', href: '/', icon: 'home-01', current: true },
    { label: 'Documents', href: '/documents', icon: 'file-01' },
    { label: 'Messages', href: '/messages', icon: 'message-01' },
  ]"
/>`
```

## API

### JavaScript

Table: Attributes of the hw-secondary-nav element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-secondary-nav'` | `true` | — |
| `data-variant` | `'mobile'` | `false` | — |

> [!NOTE]
> These classes and attributes are read from the published stylesheet and are outside the stable contract of 0.3.0.

SecondaryNav has no JavaScript controller. The markup is the API: write a `nav` element with the class `hw-secondary-nav` and a name from `aria-label` or `aria-labelledby`, a `ul` inside it, and one `li` with an `a` for each link. Write `aria-current="page"` on the link of the open page; the application owns that update. `data-variant="mobile"` selects the mobile bar, whose links hold a decorative `hw-icon` element with `aria-hidden="true"` before the label. Without `data-variant` the links have the default appearance.

### React

Table: Props of SecondaryNav

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `items` | `readonly SecondaryNavItem[]` | `true` | — |
| `variant` | `'default' \| 'mobile'` | `false` | `'default'` |
| `label` | `string` | `false` | — |

Each item of `items` has a `label` and an `href`, and optionally `current` and `icon`. An item with `current` renders its link with `aria-current="page"`. The landmark is named by `label`, or by the `aria-label` or `aria-labelledby` prop. With `variant` set to `'mobile'` an item that has an `icon` renders a decorative packaged icon before its label; with the default variant `icon` is not rendered. The component renders a `nav` element, so the other props of a native `nav` reach it.

### Vue

Table: Props, events and slots of SecondaryNav

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `variant` | prop | `'default' \| 'mobile'` | `false` | `'default'` |
| `items` | prop | `readonly SecondaryNavItem[]` | `true` | — |
| `label` | prop | `string` | `false` | — |

`items` has the same fields as in React, with a string `label`. An item with `current` renders its link with `aria-current="page"`. The landmark is named by `label`, or by `aria-label` or `aria-labelledby` written on the component. The `icon` of an item is rendered only with `variant` set to `'mobile'`. The component declares no slot.

### Angular

Table: Inputs, outputs and content of hw-secondary-nav

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `label` | input | `string` | `false` | `''` |
| `variant` | input | `'default' \| 'mobile'` | `false` | `'default'` |
| `items` | input | `readonly HwSecondaryNavItem[]` | `false` | `[]` |

`HwSecondaryNavComponent` applies to `hw-secondary-nav`. `items` takes objects with `label` and `href`, and optionally `current` and `icon`. `label` is required unless `aria-label` or `aria-labelledby` is written on `hw-secondary-nav`; these attributes and `aria-describedby` are forwarded to the `nav` element and are not kept on the host. The `variant` input is written to the `data-variant` attribute, and the `icon` of an item is rendered only with the `mobile` variant.

## Accessibility

SecondaryNav renders a `nav` element, so the browser exposes a navigation landmark, and each item is a native link. Keyboard use follows the links: <kbd>Tab</kbd> moves to the next link and <kbd>Enter</kbd> follows it.

- The links are not a tab list and not a menu, and the component adds no arrow-key handling or roving focus.
- The current page is marked with `aria-current="page"` on its link; the link stays focusable and keeps its destination.
- The landmark needs a name that tells it apart from the main navigation and the other navigation landmarks of the page.
- The icon of the mobile variant is hidden from assistive technology, so the label alone names the link.
- In the default theme the stylesheet gives the mobile variant a colour transition on the links; the transition is immediate in the original Hawiyah theme, and the stylesheet removes it when the reader asks for reduced motion.

> [!NOTE]
> Use Tabs to switch panels within one page. SecondaryNav leads to other pages and has no panels.

## RTL and localisation

SecondaryNav has no built-in text. The label of the landmark and the label of every item are written by the application in the language of the page, and the list of links is a flex row that follows the inline direction of the page, so the first link stands at the reading start in Arabic and in English.

- The icon name of an item is an identifier of a packaged icon, not text, and stays the same in both languages.
- The order of `items` is the reading order. Keep the same links in the same order in both languages of a service.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of SecondaryNav; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- SecondaryNav is listed among the platform patterns of the component scope in the [coverage notes](../coverage.md), where it is described as ordinary current-page links and is distinguished from Tabs and from content navigation.
- The mobile variant is documented in the [mobile navigation notes](../mobile-navigation.md): equal-width items, a decorative icon above each label and a current-page indicator.
