# AppShell

AppShell arranges the regions of an application page: a skip link, a header, a sidebar, the main region and a footer. The application supplies the content of each region and the text of the skip link; the shell supplies the grid and the target of the skip link.

## Example

The shell places the header above the page, the sidebar at the reading start and the footer below. The first element of the shell is the skip link, which is visually hidden until it takes focus and moves focus to the main region. The page marks the main region with `mainId`, and the skip link points to it.

```html live example=basic static differences=app-shell-adapter-side frame
<div class="hw-app-shell">
  <a class="hw-skip-link" data-hw="skip-link" href="#requests-content">Skip to main content</a>
  <div class="hw-app-shell-header"><header><strong>Service portal</strong></header></div>
  <aside class="hw-app-shell-sidebar">
    <nav aria-label="Account"><ul><li><a class="hw-link" href="/requests">Requests</a></li><li><a class="hw-link" href="/documents">Documents</a></li><li><a class="hw-link" href="/profile">Profile</a></li></ul></nav>
  </aside>
  <main class="hw-app-shell-main" id="requests-content" tabindex="-1">
    <h1>Service requests</h1>
    <p>Review the requests you have submitted and start a new one.</p>
  </main>
  <div class="hw-app-shell-footer"><footer><p>Help and contact details</p></footer></div>
</div>
```

```tsx live example=basic
<AppShell
  mainId="requests-content"
  skipLabel="Skip to main content"
  header={<header><strong>Service portal</strong></header>}
  sidebar={
    <nav aria-label="Account">
      <ul>
        <li><a className="hw-link" href="/requests">Requests</a></li>
        <li><a className="hw-link" href="/documents">Documents</a></li>
        <li><a className="hw-link" href="/profile">Profile</a></li>
      </ul>
    </nav>
  }
  footer={<footer><p>Help and contact details</p></footer>}
>
  <h1>Service requests</h1>
  <p>Review the requests you have submitted and start a new one.</p>
</AppShell>
```

```vue live example=basic
<AppShell main-id="requests-content" skip-label="Skip to main content">
  <template #header><header><strong>Service portal</strong></header></template>
  <template #sidebar>
    <nav aria-label="Account">
      <ul>
        <li><a class="hw-link" href="/requests">Requests</a></li>
        <li><a class="hw-link" href="/documents">Documents</a></li>
        <li><a class="hw-link" href="/profile">Profile</a></li>
      </ul>
    </nav>
  </template>
  <h1>Service requests</h1>
  <p>Review the requests you have submitted and start a new one.</p>
  <template #footer><footer><p>Help and contact details</p></footer></template>
</AppShell>
```

```ts live example=basic framework=angular
template: `<hw-app-shell mainId="requests-content" skipLabel="Skip to main content">
  <header hwShellHeader><strong>Service portal</strong></header>
  <nav hwShellSidebar aria-label="Account">
    <ul>
      <li><a class="hw-link" href="/requests">Requests</a></li>
      <li><a class="hw-link" href="/documents">Documents</a></li>
      <li><a class="hw-link" href="/profile">Profile</a></li>
    </ul>
  </nav>
  <h1>Service requests</h1>
  <p>Review the requests you have submitted and start a new one.</p>
  <footer hwShellFooter><p>Help and contact details</p></footer>
</hw-app-shell>`
```

## Variants and states

### Without a sidebar

A shell without sidebar content gives the main region the full width. Use this form for a page that does not need navigation beside its content, such as a form that fills the page.

```html live example=nosidebar static differences=app-shell-adapter-side frame
<div class="hw-app-shell">
  <a class="hw-skip-link" data-hw="skip-link" href="#form-content">Skip to main content</a>
  <div class="hw-app-shell-header"><header><strong>Service portal</strong></header></div>
  <main class="hw-app-shell-main" id="form-content" tabindex="-1">
    <h1>New request</h1>
    <p>Describe the service you need. You can review the request before you submit it.</p>
  </main>
  <div class="hw-app-shell-footer"><footer><p>Help and contact details</p></footer></div>
</div>
```

```tsx live example=nosidebar
<AppShell
  mainId="form-content"
  skipLabel="Skip to main content"
  header={<header><strong>Service portal</strong></header>}
  footer={<footer><p>Help and contact details</p></footer>}
>
  <h1>New request</h1>
  <p>Describe the service you need. You can review the request before you submit it.</p>
</AppShell>
```

```vue live example=nosidebar
<AppShell main-id="form-content" skip-label="Skip to main content">
  <template #header><header><strong>Service portal</strong></header></template>
  <h1>New request</h1>
  <p>Describe the service you need. You can review the request before you submit it.</p>
  <template #footer><footer><p>Help and contact details</p></footer></template>
</AppShell>
```

```ts live example=nosidebar framework=angular
template: `<hw-app-shell mainId="form-content" skipLabel="Skip to main content">
  <header hwShellHeader><strong>Service portal</strong></header>
  <h1>New request</h1>
  <p>Describe the service you need. You can review the request before you submit it.</p>
  <footer hwShellFooter><p>Help and contact details</p></footer>
</hw-app-shell>`
```

## API

### JavaScript

Table: Attributes of the hw-app-shell element and options of createSkipLink

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-app-shell'` | `true` | — |
| `data-side` | `'end'` | `false` | — |

> [!NOTE]
> These classes and attributes are read from the published stylesheet and are outside the stable contract of 0.3.0.

The shell is markup with a small controller for its skip link. Write a `div` with the class `hw-app-shell` whose children are, in this order, the skip link, an optional `div` with the class `hw-app-shell-header`, an optional `aside` with the class `hw-app-shell-sidebar`, a `main` with the class `hw-app-shell-main`, and an optional `div` with the class `hw-app-shell-footer`. Give `main` an `id` and a `tabindex` of minus one so that it can take focus, and point the skip link at that `id`. The skip link is an `a` with the class `hw-skip-link` and the hook `data-hw="skip-link"`; `enhance()` binds it. `createSkipLink(link)` binds one link directly: it takes the `a` element, has no options, and returns `activate()` and `destroy()`. It throws unless the element is an `a`; an `a` with neither text nor an `aria-label` is bound, and a warning is written once in development. The header and the footer are `div` elements, so the banner and contentinfo landmarks come from the elements that the application places in them. `data-side="end"` moves the sidebar to the reading end; without it the sidebar stands at the reading start.

### React

Table: Props of AppShell

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `header` | `ReactNode` | `false` | — |
| `sidebar` | `ReactNode` | `false` | — |
| `footer` | `ReactNode` | `false` | — |
| `mainId` | `string` | `false` | — |
| `skipLabel` | `string` | `true` | — |

`skipLabel` is required and is the text of the skip link. The skip link targets the main region, whose `id` is `mainId`; without `mainId` the component generates one. `header`, `sidebar` and `footer` render in a `div` with the class `hw-app-shell-header`, an `aside` with the class `hw-app-shell-sidebar` and a `div` with the class `hw-app-shell-footer`, each only when the prop is given. Children render in the `main` element. The component has no side prop, and it passes the other props to the root element, so a `data-side="end"` attribute written on `AppShell` reaches it.

### Vue

Table: Props, events and slots of AppShell

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `mainId` | prop | `string` | `false` | — |
| `skipLabel` | prop | `string` | `true` | — |
| `as` | prop | `string` | `false` | `'div'` |
| `gap` | prop | `LayoutProps['gap']` | `false` | — |
| `padding` | prop | `LayoutProps['padding']` | `false` | — |
| `align` | prop | `'center' \| 'start' \| 'end' \| 'stretch' \| 'baseline'` | `false` | — |
| `justify` | prop | `'center' \| 'start' \| 'end' \| 'between' \| 'around' \| 'evenly'` | `false` | — |
| `wrap` | prop | `boolean` | `false` | — |
| `columns` | prop | `LayoutProps['columns']` | `false` | — |
| `minItemWidth` | prop | `string` | `false` | — |
| `side` | prop | `'start' \| 'end'` | `false` | `'start'` |
| `sidebarWidth` | prop | `string` | `false` | — |
| `collapseAt` | prop | `'md' \| 'sm' \| 'lg'` | `false` | `'md'` |
| `maxWidth` | prop | `string` | `false` | — |
| `ratio` | prop | `number` | `false` | — |
| `header` | slot | — | `false` | — |
| `sidebar` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |
| `footer` | slot | — | `false` | — |

`skipLabel` is required and is the text of the skip link, and `mainId` is the `id` of the main region that it targets; without `mainId` the component generates one. The `header`, `sidebar` and `footer` slots render in a `div` with the class `hw-app-shell-header`, an `aside` with the class `hw-app-shell-sidebar` and a `div` with the class `hw-app-shell-footer`, each only when the slot is given; the default slot renders in the `main` element. `side` is written as `data-side` on the root element, and `as` sets its tag, which is `div` by default. The layout props are written as layout custom properties on the root element, but the stylesheet of the shell reads only `sidebarWidth`; `gap`, `columns`, `minItemWidth`, `maxWidth` and `ratio` have no effect on it. `collapseAt` is written as `data-collapse-at`, which no rule of the shell reads: the sidebar becomes a column at the fixed width of 64rem.

### Angular

Table: Inputs, outputs and content of hw-app-shell

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `gap` | input | `Responsive<LayoutSpacing>` | `false` | — |
| `padding` | input | `Responsive<LayoutSpacing>` | `false` | — |
| `align` | input | `'start' \| 'center' \| 'end' \| 'stretch' \| 'baseline'` | `false` | — |
| `justify` | input | `'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly'` | `false` | — |
| `wrap` | input | `boolean` | `false` | — |
| `columns` | input | `Responsive<number>` | `false` | — |
| `minItemWidth` | input | `string` | `false` | — |
| `maxWidth` | input | `string` | `false` | — |
| `sidebarWidth` | input | `string` | `false` | — |
| `ratio` | input | `number` | `false` | — |
| `mainId` | input | `string` | `false` | `'main-content'` |
| `skipLabel` | input | `string` | `true` | — |
| `side` | input | `'start' \| 'end'` | `false` | `'start'` |
| `[hwShellHeader]` | content | — | `false` | — |
| `[hwShellSidebar]` | content | — | `false` | — |
| `*` | content | — | `false` | — |
| `[hwShellFooter]` | content | — | `false` | — |

`HwAppShellComponent` applies to `hw-app-shell` and carries the class `hw-app-shell` on its host. `skipLabel` is required and is the text of the skip link, and `mainId` is the `id` of the main region that it targets, `'main-content'` by default. Content marked `hwShellHeader`, `hwShellSidebar` and `hwShellFooter` fills the header, the sidebar and the footer, and all other content fills the `main` element. The three regions are always rendered, because Angular cannot tell whether content was projected; the stylesheet hides an empty region, so omitting one leaves the main region at the full width. `side` is written as `data-side` on the host, and `sidebarWidth` and the other layout inputs are written as layout custom properties on it.

## Accessibility

AppShell renders the skip link, the main region and, when they are given, a header region, a sidebar region and a footer region; Angular always renders the three regions. It is a layout, not a widget: it has no state, and the elements that the application places in it keep their own keyboard behaviour and names.

Table: Keyboard interaction of AppShell

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Pressed from the start of the page, moves focus to the skip link, which is the first element of the shell and is visually hidden until it has focus. |
| <kbd>Enter</kbd> | Activates the focused skip link, which scrolls to the main region and moves focus to it without writing the address fragment. |

- The skip link is a native link. Its text is the `skipLabel` that the application writes in the language of the page, and its target is the `main` element, which takes focus because it carries a `tabindex` of minus one.
- The shell renders the header and the footer as `div` elements, not as `header` and `footer`. The banner and contentinfo landmarks come from the elements that the application projects into them, such as a portal header or its own `header` and `footer`; project them once for each page.
- The sidebar is an `aside` element. Name the navigation that it holds with `aria-label`, as the examples do, so that a reader of the landmark list can tell it from the other navigations of the page.
- Keep the `mainId` unique in the document when more than one shell can be present, so that the skip link reaches the right region.
- The source order is the reading order and the tab order: skip link, header, sidebar, main, footer. The grid changes only the visual position of the regions at wide widths.

## RTL and localisation

AppShell has no built-in text: the skip link text and the content of every region are written by the application in the language of the page.

- The sidebar stands at the reading start, so it is at the right in a right-to-left page and at the left in a left-to-right page, and it moves to the opposite side with the `side` prop in Vue, the `side` input in Angular and a `data-side="end"` attribute in React and in the markup. The border of the sidebar sits on the side that faces the main region.
- The skip link appears at the reading start of the page when it takes focus.
- The sidebar becomes a second column from 64rem; below that width it stands above the main region, in the same order in both directions.
- Write the skip link text in the language of the page, and in the same language as the landmarks that the application projects.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of AppShell; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- AppShell is listed in the Layout group of the component scope in the [coverage notes](../coverage.md), and not among the platform patterns.
- The anatomy of the regions and the width at which the sidebar becomes a column are described in the [layout notes](../layout.md).
