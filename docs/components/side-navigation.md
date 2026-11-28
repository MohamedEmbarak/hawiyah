# SideNavigation

SideNavigation is the list of pages of NavigationDrawer shown in the page itself, as links and native group disclosures inside a navigation landmark. It adds no keyboard behaviour of its own, and one array of items can feed both this list and a drawer.

## Example

The navigation lists the sections of a service. Each entry is a link, a group of links or, when a section is not available, text. The application marks the current page, and the group that holds it opens.

```html live example=basic static differences=side-navigation-adapter-markup
<nav class="hw-side-navigation hw-navigation-drawer-nav" data-hw="side-navigation" aria-label="Service sections">
  <ul>
    <li data-hw-value="overview"><a class="hw-navigation-drawer-row" href="/service/overview"><span class="hw-navigation-drawer-label">Overview</span></a></li>
    <li data-hw-value="requests"><details class="hw-navigation-drawer-group"><summary class="hw-navigation-drawer-row"><span class="hw-navigation-drawer-label">Requests</span></summary><ul>
      <li data-hw-value="open-requests"><a class="hw-navigation-drawer-row" href="/service/requests/open" aria-current="page"><span class="hw-navigation-drawer-label">Open requests</span></a></li>
      <li data-hw-value="closed-requests"><a class="hw-navigation-drawer-row" href="/service/requests/closed"><span class="hw-navigation-drawer-label">Closed requests</span></a></li>
    </ul></details></li>
    <li data-hw-value="profile"><a class="hw-navigation-drawer-row" href="/service/profile"><span class="hw-navigation-drawer-label">Profile</span></a></li>
    <li data-hw-value="payments"><span class="hw-navigation-drawer-row" aria-disabled="true"><span class="hw-navigation-drawer-label">Payments</span></span></li>
  </ul>
</nav>
```

```tsx live example=basic
<SideNavigation
  label="Service sections"
  items={[
    { id: 'overview', label: 'Overview', href: '/service/overview' },
    { id: 'requests', label: 'Requests', children: [
      { id: 'open-requests', label: 'Open requests', href: '/service/requests/open', current: true },
      { id: 'closed-requests', label: 'Closed requests', href: '/service/requests/closed' },
    ] },
    { id: 'profile', label: 'Profile', href: '/service/profile' },
    { id: 'payments', label: 'Payments', disabled: true },
  ]}
/>
```

```vue live example=basic
<SideNavigation
  label="Service sections"
  :items="[
    { id: 'overview', label: 'Overview', href: '/service/overview' },
    { id: 'requests', label: 'Requests', children: [
      { id: 'open-requests', label: 'Open requests', href: '/service/requests/open', current: true },
      { id: 'closed-requests', label: 'Closed requests', href: '/service/requests/closed' },
    ] },
    { id: 'profile', label: 'Profile', href: '/service/profile' },
    { id: 'payments', label: 'Payments', disabled: true },
  ]"
/>
```

```ts live example=basic framework=angular
import { Component } from '@angular/core';
import { HwSideNavigationComponent, type HwNavigationDrawerItem } from '@hawiyah/angular';

@Component({
  selector: 'app-basic-example',
  imports: [HwSideNavigationComponent],
  template: `<nav hwSideNavigation label="Service sections" [items]="pages"></nav>`,
})
export class BasicExample {
  pages: HwNavigationDrawerItem[] = [
    { id: 'overview', label: 'Overview', href: '/service/overview' },
    { id: 'requests', label: 'Requests', children: [
      { id: 'open-requests', label: 'Open requests', href: '/service/requests/open', current: true },
      { id: 'closed-requests', label: 'Closed requests', href: '/service/requests/closed' },
    ] },
    { id: 'profile', label: 'Profile', href: '/service/profile' },
    { id: 'payments', label: 'Payments', disabled: true },
  ];
}
```

## API

### JavaScript

Table: Options of createSideNavigation

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `label` | `string` | `false` | — |

`createSideNavigation(nav, options)` enhances a `nav` element with `data-hw="side-navigation"`, which `enhance()` does for every such element, and returns a controller with `refresh()` and `destroy()`. The markup is the list of NavigationDrawer outside a drawer: a link is `a.hw-navigation-drawer-row`, with `aria-current="page"` on the current page; a group is `details.hw-navigation-drawer-group` with a `summary` row; a disabled entry is a `span` with `aria-disabled="true"` and no children; other text is a plain `span`. The `label` option names the landmark when the `nav` has neither `aria-label` nor `aria-labelledby`; an authored name is kept, and without any name the controller writes none and warns in development. `data-sticky="true"` makes the navigation sticky from 64rem, and the package README documents the custom properties that place it. The controller opens every group that holds `a[aria-current="page"]`, treats an authored `open` attribute as the open state that the application chose for the group, and removes `href` and the tab stop from disabled rows. It adds no listener and dispatches no event. After the application moves `aria-current`, `refresh()` opens the group that now holds the current page and returns a group that no longer does to its authored state. `destroy()` restores the authored attributes.

### React

Table: Props of SideNavigation

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `items` | `readonly NavigationDrawerItem[]` | `true` | — |
| `sticky` | `boolean` | `false` | `false` |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `label` | `string` | `false` | — |

`items` is required. Each `NavigationDrawerItem` has an `id`, a `label` and optional `href`, `icon`, `current`, `disabled`, `expanded` and `children`; `SideNavigationItem` is the same type. An item with `href` is a link, an item with `children` is a group, a disabled item is text, and a group with its own `href` repeats it as the first link inside. The application marks the current page through `current` on each route change. A group renders open when `expanded` is true or when it holds the current link; `open` is written again only when that value changes, so the toggles of the reader stand. `label` names the landmark, and `aria-label` or `aria-labelledby` names it instead. `sticky` writes `data-sticky="true"`.

### Vue

Table: Props, events and slots of SideNavigation

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `items` | prop | `readonly NavigationDrawerItem[]` | `true` | — |
| `label` | prop | `string` | `false` | — |
| `sticky` | prop | `boolean` | `false` | `false` |

`items` is required and has the item model of NavigationDrawer; mark the current page through `current` on each route change. A disabled entry is text with `aria-disabled="true"` and its children are not rendered, an entry with children is a group, and a group with its own `href` repeats itself as the first link inside. A group is open when it holds the current page or has its `expanded` field set to true, and the toggles of the reader stand until that value changes. `label` names the landmark, or `aria-label` or `aria-labelledby` does. `sticky` writes `data-sticky="true"`. The component declares no event and no slot.

### Angular

Table: Inputs, outputs and content of hw-side-navigation

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `items` | input | `readonly HwNavigationDrawerItem[]` | `true` | — |
| `label` | input | `string` | `false` | `''` |
| `sticky` | input | `boolean` | `false` | `false` |

`HwSideNavigationComponent` applies to `hw-side-navigation` and to `nav[hwSideNavigation]`. `items` is required; `HwSideNavigationItem` is the same type as `HwNavigationDrawerItem`, so one array can feed the side navigation and the drawer. The application marks the current page through `current` on each route change, and a group is open when `expanded` is true or when a link inside it is the current page. `label` is the accessible name of the landmark; the element can carry `aria-label` or `aria-labelledby` instead. The host element carries the classes `hw-side-navigation` and `hw-navigation-drawer-nav` so that a sticky box is a child of the column of the application, and `hw-side-navigation` receives `role="navigation"`, which `nav[hwSideNavigation]` does not need. `sticky` writes `data-sticky="true"`. The component has no output, because the entries are links.

## Accessibility

The list is a `nav` landmark that holds native links and native `details` groups. The landmark needs a name, because a page can hold more than one navigation. The link of the current page carries `aria-current="page"`, and a group that holds it is open. A disabled entry is text with `aria-disabled="true"`, not a link, and it has no tab stop.

There is no tree role, no roving focus and no arrow-key handling, so the keys are those of the native elements.

Table: Keyboard interaction of SideNavigation

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves focus to the next summary or link, in document order. |
| <kbd>Shift</kbd> + <kbd>Tab</kbd> | Moves focus to the previous summary or link. |
| <kbd>Enter</kbd> | Follows the focused link, or opens or closes the group of the focused summary. |
| <kbd>Space</kbd> | Opens or closes the group of the focused summary. |

The application marks the current page on each route change. After a script moves `aria-current` in the vanilla markup, a call of `refresh()` opens the group that holds the new current page and scrolls the new current link into view; a group that no longer holds the current page returns to its authored state, and any other group stays as the reader left it. The vanilla controller scrolls when it is created and in `refresh()` only. In every adapter the current link is scrolled into view inside the scroll box of the navigation; the page does not scroll and focus does not move.

## RTL and localisation

SideNavigation has no built-in text. The name of the landmark, the labels of the entries and the packaged icons that an item names through `icon` are written by the application in the language of the page. The navigation follows the direction of the page, and its rows, its indentation and its disclosure markers use logical properties.

- Write the labels in the language of the page; the component does not translate or reorder them.
- Keep the order of the entries the same in both directions; the list reads from the start of the line.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of SideNavigation; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- SideNavigation is listed in the [coverage notes](../coverage.md) among the platform patterns of the component scope, and the notes state that it renders the list of NavigationDrawer outside a drawer from the same items.
- The item model, the native groups and the rule for the open group are described in the [navigation drawer notes](../navigation-drawer.md), and SideNavigation renders the same list.
