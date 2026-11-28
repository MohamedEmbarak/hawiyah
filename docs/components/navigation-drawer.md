# NavigationDrawer

NavigationDrawer is a modal drawer that holds the page navigation of an application: native page links and native group disclosures with the current page marked. It composes the modal drawer of the library, so Escape and the containment of focus follow the native dialog, and the closing click on the backdrop comes from the drawer.

## Example

The application supplies the title of the drawer, the name of the navigation landmark, the name of the close button and the list of items, and a control that opens it. The drawer is closed at first. When the reader opens it, the group that holds the current page is already open.

```html live example=basic static differences=navigation-drawer-adapter-markup
<button class="hw-button" type="button" data-variant="primary" data-size="md" aria-haspopup="dialog" data-hw-dialog-open="service-menu">Menu</button>
<dialog class="hw-dialog hw-drawer hw-navigation-drawer" id="service-menu" data-hw="navigation-drawer" data-side="start" aria-labelledby="service-menu-title">
  <header class="hw-dialog-header"><h2 id="service-menu-title">Service menu</h2><button class="hw-button" type="button" data-variant="ghost" data-size="md" aria-label="Close menu" data-hw-dialog-close><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button></header>
  <div class="hw-dialog-body">
    <nav class="hw-navigation-drawer-nav" aria-label="Service sections">
      <ul>
        <li data-hw-value="overview"><a class="hw-navigation-drawer-row" href="/service/overview"><span class="hw-navigation-drawer-label">Overview</span></a></li>
        <li data-hw-value="requests"><details class="hw-navigation-drawer-group"><summary class="hw-navigation-drawer-row"><span class="hw-navigation-drawer-label">Requests</span></summary><ul>
          <li data-hw-value="open-requests"><a class="hw-navigation-drawer-row" href="/service/requests/open" aria-current="page"><span class="hw-navigation-drawer-label">Open requests</span></a></li>
          <li data-hw-value="closed-requests"><a class="hw-navigation-drawer-row" href="/service/requests/closed"><span class="hw-navigation-drawer-label">Closed requests</span></a></li>
        </ul></details></li>
        <li data-hw-value="profile"><a class="hw-navigation-drawer-row" href="/service/profile"><span class="hw-navigation-drawer-label">Profile</span></a></li>
      </ul>
    </nav>
  </div>
</dialog>
```

```tsx live example=basic
<NavigationDrawer
  title="Service menu"
  navigationLabel="Service sections"
  closeLabel="Close menu"
  trigger={<Button variant="primary">Menu</Button>}
  items={[
    { id: 'overview', label: 'Overview', href: '/service/overview' },
    { id: 'requests', label: 'Requests', children: [
      { id: 'open-requests', label: 'Open requests', href: '/service/requests/open', current: true },
      { id: 'closed-requests', label: 'Closed requests', href: '/service/requests/closed' },
    ] },
    { id: 'profile', label: 'Profile', href: '/service/profile' },
  ]}
/>
```

```vue live example=basic
<NavigationDrawer
  title="Service menu"
  navigation-label="Service sections"
  close-label="Close menu"
  :items="[
    { id: 'overview', label: 'Overview', href: '/service/overview' },
    { id: 'requests', label: 'Requests', children: [
      { id: 'open-requests', label: 'Open requests', href: '/service/requests/open', current: true },
      { id: 'closed-requests', label: 'Closed requests', href: '/service/requests/closed' },
    ] },
    { id: 'profile', label: 'Profile', href: '/service/profile' },
  ]"
>
  <template #trigger="{ open }"><Button variant="primary" aria-haspopup="dialog" @click="open">Menu</Button></template>
</NavigationDrawer>
```

```ts live example=basic framework=angular
import { Component } from '@angular/core';
import { HwButtonDirective, HwNavigationDrawerComponent, type HwNavigationDrawerItem } from '@hawiyah/angular';

@Component({
  selector: 'app-basic-example',
  imports: [HwButtonDirective, HwNavigationDrawerComponent],
  template: `<button hwButton variant="primary" aria-haspopup="dialog" (click)="menuOpen = true">Menu</button>
<hw-navigation-drawer
  title="Service menu"
  navigationLabel="Service sections"
  closeLabel="Close menu"
  [items]="pages"
  [(open)]="menuOpen"
/>`,
})
export class BasicExample {
  menuOpen = false;
  pages: HwNavigationDrawerItem[] = [
    { id: 'overview', label: 'Overview', href: '/service/overview' },
    { id: 'requests', label: 'Requests', children: [
      { id: 'open-requests', label: 'Open requests', href: '/service/requests/open', current: true },
      { id: 'closed-requests', label: 'Closed requests', href: '/service/requests/closed' },
    ] },
    { id: 'profile', label: 'Profile', href: '/service/profile' },
  ];
}
```

## API

### JavaScript

Table: Options of createNavigationDrawer

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `navigationLabel` | `string` | `false` | — |
| `closeOnBackdrop` | `boolean` | `false` | — |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |

`createNavigationDrawer(dialog, options)` enhances a native `dialog` element with `data-hw="navigation-drawer"`, which `enhance()` does for every such element. It enhances markup that the application owns and does not render an array of items. The dialog needs an accessible name and its own `nav` element with the class `hw-navigation-drawer-nav`, which holds lists, native links and optional `details` groups. Use `hw-navigation-drawer-row` for rows and `hw-navigation-drawer-group` for disclosures. The controller adds the classes `hw-dialog`, `hw-drawer` and `hw-navigation-drawer` and `data-side="start"` when they are missing. The `navigationLabel` option names the `nav` element; an authored name is kept when the option is absent. `closeOnBackdrop` and `onOpenChange` are options of the drawer that the controller extends. The returned controller has `open`, `show(trigger)`, `close(returnValue)`, `refresh()` and `destroy()`. A control with `data-hw-dialog-open` opens the dialog whose `id` equals its value, so the dialog needs an `id`; a control with `data-hw-dialog-close` inside the dialog closes it. Each time the drawer is shown, the group that holds `a[aria-current="page"]` opens, and `refresh()` recomputes the groups while the drawer is open. A disabled entry is a `span` with `aria-disabled="true"`; the controller removes `href` and the tab stop from the entry and from the controls inside it, makes those inner controls inert, and `destroy()` restores the original attributes. A click on a link closes the drawer unless the click was prevented or modified, or the link opens another browsing context or downloads.

### React

Table: Props of NavigationDrawer

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `items` | `readonly NavigationDrawerItem[]` | `true` | — |
| `navigationLabel` | `string` | `true` | — |
| `userContent` | `ReactNode` | `false` | — |
| `side` | `'start' \| 'end'` | `false` | `'start'` |
| `footer` | `ReactNode \| ((context: { close: () => void }) => ReactNode)` | `false` | — |
| `title` | `ReactNode` | `true` | — |
| `open` | `boolean` | `false` | — |
| `defaultOpen` | `boolean` | `false` | — |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |
| `description` | `ReactNode` | `false` | — |
| `trigger` | `ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>` | `false` | — |
| `closeOnBackdrop` | `boolean` | `false` | — |
| `closeLabel` | `string` | `true` | — |

`items` is the list: each `NavigationDrawerItem` has an `id`, a `label` and optional `href`, `icon`, `current`, `disabled`, `expanded` and `children`. An item with `href` is a link, an item with `children` is a group, and a disabled item is text. A group renders open when it holds the current page or has `expanded` set to true, and the toggles of the reader stand until that value changes. `navigationLabel` names the navigation landmark and `closeLabel` names the close button; both are required, and so is `title`. Use `open` with `onOpenChange` for a controlled drawer and `defaultOpen` for an uncontrolled one. `trigger` is an element that opens the drawer and receives the attribute `aria-haspopup`. `userContent` renders before the list, and `footer` renders after it, either as content or as a function that receives a context object with a function that closes the drawer. The drawer sits on the logical start side unless `side` is `'end'`. `closeOnBackdrop` closes the drawer on a click outside it.

### Vue

Table: Props, events and slots of NavigationDrawer

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `title` | prop | `string` | `true` | — |
| `items` | prop | `readonly NavigationDrawerItem[]` | `true` | — |
| `navigationLabel` | prop | `string` | `true` | — |
| `closeLabel` | prop | `string` | `true` | — |
| `open` | prop | `boolean` | `false` | — |
| `defaultOpen` | prop | `boolean` | `false` | `false` |
| `closeOnBackdrop` | prop | `boolean` | `false` | `true` |
| `side` | prop | `'start' \| 'end'` | `false` | `'start'` |
| `description` | prop | `string` | `false` | — |
| `update:open` | event | `(value: boolean) => void` | `false` | — |
| `trigger` | slot | — | `false` | — |
| `footer` | slot | — | `false` | — |
| `user` | slot | — | `false` | — |

The `open` prop with the `update:open` event binds the state of the drawer, and `defaultOpen` sets the initial state of an uncontrolled drawer. `title`, `items`, `navigationLabel` and `closeLabel` are required. The `trigger` slot holds the element that opens the drawer and receives `{ open }`: the element opens the drawer only when it calls `open`, because the slot adds no handler, and the application writes `aria-haspopup` on it as it does in vanilla and Angular. The `user` slot renders before the list, and the `footer` slot renders after it. A link click closes the drawer unless it was prevented, or unless `bindLinkNavigation` of `@hawiyah/core` handed it to the router. `closeOnBackdrop` closes the drawer on a click outside it. The component exposes `show()`, `close()` and the dialog `element`. The table lists the three slots because the published build reads them; the declaration types none.

### Angular

Table: Inputs, outputs and content of hw-navigation-drawer

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `title` | input | `string` | `true` | — |
| `items` | input | `readonly HwNavigationDrawerItem[]` | `false` | `[]` |
| `titleId` | input | `string` | `false` | — |
| `navigationLabel` | input | `string` | `true` | — |
| `closeLabel` | input | `string` | `true` | — |
| `side` | input | `'start' \| 'end'` | `false` | `'start'` |
| `open` | input | `boolean` | `false` | `false` |
| `closeOnBackdrop` | input | `boolean` | `false` | `true` |
| `openChange` | output | `boolean` | `false` | — |
| `[hwNavigationDrawerUser]` | content | — | `false` | — |
| `[hwNavigationDrawerFooter]` | content | — | `false` | — |

`HwNavigationDrawerComponent` (`hw-navigation-drawer`) composes the drawer of the library, and its markup is owned by Angular. `title`, `navigationLabel` and `closeLabel` are required. Bind `[(open)]` for the state and use `openChange` for the changes; the component has no trigger of its own, so the application supplies a control that sets `open`, and the component offers `show()` and `close()`. `titleId` sets the id of the title that names the dialog, and its default is generated, so its Default is an em dash. `items` takes `HwNavigationDrawerItem` entries, and a group is open when it holds the current page or has `expanded` set to true. Content marked `hwNavigationDrawerUser` renders before the list, and content marked `hwNavigationDrawerFooter` renders after it. `closeOnBackdrop` closes the drawer on a click outside it.

## Accessibility

The drawer is a native modal `dialog` named by its title, with a close button named by `closeLabel`. Inside it, the list is a `nav` landmark named by `navigationLabel`. The entries are native links and native `details` groups; there are no menu, tree or tablist roles, no roving focus and no custom arrow-key handling. The link of the current page carries `aria-current="page"`. A disabled entry is text with `aria-disabled="true"` and cannot be focused.

Table: Keyboard interaction of NavigationDrawer

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves focus to the next control in the drawer, and keeps focus inside the drawer. |
| <kbd>Shift</kbd> + <kbd>Tab</kbd> | Moves focus to the previous control in the drawer. |
| <kbd>Enter</kbd> | Follows the focused link, or opens or closes the group of the focused summary. |
| <kbd>Space</kbd> | Opens or closes the group of the focused summary. |
| <kbd>Escape</kbd> | Closes the drawer and returns focus to the control that opened it. |

A click on a link closes the drawer after the application has had the chance to prevent it, so a route change can be validated first. Focus after a navigation belongs to the browser or to the router of the application. A click with a modifier key, a download and a link that opens another browsing context leave the drawer open.

## RTL and localisation

NavigationDrawer has no text of its own. The title, the name of the landmark, the name of the close button and the labels of the entries are written by the application in the language of the page, and language and direction stay independent. The drawer sits on the logical start side by default, so the side follows the direction of the page; `side` set to `'end'` places it on the other side. The rows use logical properties for their padding and for the indicator of the current page.

- The disclosure of a group and the nested rows follow the reading direction.
- Write the labels in the language of the page; the component does not translate or reorder them.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of NavigationDrawer; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The [navigation drawer notes](../navigation-drawer.md) map the supplied Mobile Components export of the navigation drawer, its width, the height of its rows, the nested rows and the selected and focused states, and they record where Hawiyah adapts them.
- NavigationDrawer is listed among the platform patterns of the component scope in the [coverage notes](../coverage.md).
