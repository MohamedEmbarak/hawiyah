# MobileTopBar

MobileTopBar is the header of a page on a narrow screen: a title, an optional subtitle, a back link and the actions of the page. It stays in the normal flow of the page, and the application owns every destination and every action.

## Example

An internal page shows a back link to its parent, the title of the page, a subtitle that gives context, and one action. The back link takes a name through `backLabel`, because its arrow carries none.

```html live example=basic differences=mobile-top-bar-adapter-variant frame width=390
<header class="hw-mobile-top-bar">
  <div class="hw-mobile-top-bar-leading"><a class="hw-mobile-top-bar-back" href="/requests" aria-label="Back to requests"><span class="hw-icon" data-icon="arrow-left-01" data-directional="true" aria-hidden="true"></span></a></div>
  <div class="hw-mobile-top-bar-copy"><h1 class="hw-mobile-top-bar-title">Request SR-2041</h1><p class="hw-mobile-top-bar-subtitle">Submitted on 4 March</p></div>
  <div class="hw-mobile-top-bar-actions"><button class="hw-button" type="button" data-variant="secondary" data-size="md">Edit</button></div>
</header>
```

```tsx live example=basic
<MobileTopBar
  title="Request SR-2041"
  subtitle="Submitted on 4 March"
  backHref="/requests"
  backLabel="Back to requests"
  actions={<Button variant="secondary">Edit</Button>}
/>
```

```vue live example=basic
<MobileTopBar title="Request SR-2041" subtitle="Submitted on 4 March" back-href="/requests" back-label="Back to requests">
  <template #actions><Button variant="secondary">Edit</Button></template>
</MobileTopBar>
```

```ts live example=basic framework=angular
template: `<hw-mobile-top-bar title="Request SR-2041" subtitle="Submitted on 4 March" backHref="/requests" backLabel="Back to requests">
  <button hwTopBarActions hwButton variant="secondary">Edit</button>
</hw-mobile-top-bar>`
```

## Variants and states

### Main page

The `main` variant is the top level of an application. Its title is larger, and the application supplies the leading control instead of a back link: here a button for the navigation, with an accessible name, because it holds an icon alone. The application connects the button to its navigation; the examples show the markup only.

```html live example=main frame width=390
<header class="hw-mobile-top-bar" data-variant="main">
  <div class="hw-mobile-top-bar-leading"><button class="hw-button" type="button" data-variant="secondary" data-size="md" aria-label="Open navigation"><span class="hw-icon" data-icon="menu-01" aria-hidden="true"></span></button></div>
  <div class="hw-mobile-top-bar-copy"><h1 class="hw-mobile-top-bar-title">Services</h1></div>
  <div class="hw-mobile-top-bar-actions"><button class="hw-button" type="button" data-variant="secondary" data-size="md" aria-label="Search services"><span class="hw-icon" data-icon="search-01" aria-hidden="true"></span></button></div>
</header>
```

```tsx live example=main
<MobileTopBar
  variant="main"
  title="Services"
  leading={
    <Button variant="secondary" aria-label="Open navigation">
      <span className="hw-icon" data-icon="menu-01" aria-hidden="true" />
    </Button>
  }
  actions={
    <Button variant="secondary" aria-label="Search services">
      <span className="hw-icon" data-icon="search-01" aria-hidden="true" />
    </Button>
  }
/>
```

```vue live example=main
<MobileTopBar variant="main" title="Services">
  <template #leading>
    <Button variant="secondary" aria-label="Open navigation">
      <span class="hw-icon" data-icon="menu-01" aria-hidden="true"></span>
    </Button>
  </template>
  <template #actions>
    <Button variant="secondary" aria-label="Search services">
      <span class="hw-icon" data-icon="search-01" aria-hidden="true"></span>
    </Button>
  </template>
</MobileTopBar>
```

```ts live example=main framework=angular
template: `<hw-mobile-top-bar variant="main" title="Services">
  <button hwTopBarLeading hwButton variant="secondary" aria-label="Open navigation">
    <span class="hw-icon" data-icon="menu-01" aria-hidden="true"></span>
  </button>
  <button hwTopBarActions hwButton variant="secondary" aria-label="Search services">
    <span class="hw-icon" data-icon="search-01" aria-hidden="true"></span>
  </button>
</hw-mobile-top-bar>`
```

### Heading level

The title is an `h1` by default. A bar that is embedded in a page that already has its `h1`, such as a preview inside documentation, takes `headingLevel` 2 or 3. The level changes the element only.

```html live example=level differences=mobile-top-bar-adapter-variant
<header class="hw-mobile-top-bar">
  <div class="hw-mobile-top-bar-leading"><a class="hw-mobile-top-bar-back" href="/requests" aria-label="Back to requests"><span class="hw-icon" data-icon="arrow-left-01" data-directional="true" aria-hidden="true"></span></a></div>
  <div class="hw-mobile-top-bar-copy"><h2 class="hw-mobile-top-bar-title">Submitted documents</h2></div>
  <div class="hw-mobile-top-bar-actions"><button class="hw-button" type="button" data-variant="secondary" data-size="md">Add</button></div>
</header>
```

```tsx live example=level
<MobileTopBar
  headingLevel={2}
  title="Submitted documents"
  backHref="/requests"
  backLabel="Back to requests"
  actions={<Button variant="secondary">Add</Button>}
/>
```

```vue live example=level
<MobileTopBar :heading-level="2" title="Submitted documents" back-href="/requests" back-label="Back to requests">
  <template #actions><Button variant="secondary">Add</Button></template>
</MobileTopBar>
```

```ts live example=level framework=angular
template: `<hw-mobile-top-bar [headingLevel]="2" title="Submitted documents" backHref="/requests" backLabel="Back to requests">
  <button hwTopBarActions hwButton variant="secondary">Add</button>
</hw-mobile-top-bar>`
```

## API

### JavaScript

Table: Attributes of the hw-mobile-top-bar element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-mobile-top-bar'` | `true` | — |
| `data-variant` | `'main'` | `false` | — |

> [!NOTE]
> These classes and attributes are read from the published stylesheet and are outside the stable contract of 0.3.0.

MobileTopBar has no JavaScript controller and needs no call to `enhance()`. The markup is the API: write a `header` with the class `hw-mobile-top-bar`. The optional leading region is a `div` with the class `hw-mobile-top-bar-leading`, which holds the back link (an `a` with the class `hw-mobile-top-bar-back`) or a control of the application. The `div` with the class `hw-mobile-top-bar-copy` holds the title, a heading element with the class `hw-mobile-top-bar-title`, and the subtitle, a paragraph with the class `hw-mobile-top-bar-subtitle`. The optional `div` with the class `hw-mobile-top-bar-actions` holds the actions. The back link has no text, so the author writes its `aria-label` and a packaged icon with `data-directional="true"`, which the stylesheet mirrors in right-to-left pages. `data-variant="main"` enlarges the title; without it the bar has the internal appearance.

### React

Table: Props of MobileTopBar

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `title` | `ReactNode` | `true` | — |
| `subtitle` | `ReactNode` | `false` | — |
| `variant` | `'main' \| 'internal'` | `false` | `'internal'` |
| `headingLevel` | `1 \| 2 \| 3` | `false` | `1` |
| `leading` | `ReactNode` | `false` | — |
| `actions` | `ReactNode` | `false` | — |
| `backHref` | `string` | `false` | — |
| `backLabel` | `string` | `false` | — |

The title renders in the heading element that `headingLevel` selects, and `subtitle` renders below it. With `backHref` the bar renders a back link, and `backLabel`, which is required in that case, is its accessible name. `leading` replaces the back link. The leading region renders only when `leading` or `backHref` is given, and the actions region only when `actions` is given. Other child content renders after the actions. The `variant` prop is written as `data-variant` on the header in every case, including the default `'internal'`. The bar assumes no history: the application owns the destination of the back link.

### Vue

Table: Props, events and slots of MobileTopBar

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `title` | prop | `string` | `true` | — |
| `subtitle` | prop | `string` | `false` | — |
| `variant` | prop | `'main' \| 'internal'` | `false` | `'internal'` |
| `headingLevel` | prop | `1 \| 2 \| 3` | `false` | `1` |
| `backHref` | prop | `string` | `false` | — |
| `backLabel` | prop | `string` | `false` | — |
| `leading` | slot | — | `false` | — |
| `title` | slot | — | `false` | — |
| `subtitle` | slot | — | `false` | — |
| `actions` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |

The `title` and `subtitle` slots replace the props of the same names. With `backHref` the bar renders a back link, and `backLabel` is required in that case; the `leading` slot replaces the link. The leading region renders only when the `leading` slot or `backHref` is given, and the actions region only when the `actions` slot is given. The default slot renders after the actions, as a direct child of the header. The `variant` prop is written as `data-variant` on the header in every case, including the default `'internal'`.

### Angular

Table: Inputs, outputs and content of hw-mobile-top-bar

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `title` | input | `string` | `true` | — |
| `subtitle` | input | `string` | `false` | `''` |
| `variant` | input | `'main' \| 'internal'` | `false` | `'internal'` |
| `headingLevel` | input | `1 \| 2 \| 3` | `false` | `1` |
| `backHref` | input | `string` | `false` | `''` |
| `backLabel` | input | `string` | `false` | `''` |
| `[hwTopBarLeading]` | content | — | `false` | — |
| `[hwTopBarActions]` | content | — | `false` | — |

`HwMobileTopBarComponent` applies to `hw-mobile-top-bar` and renders a `header` element with the class `hw-mobile-top-bar`. With a non-empty `backHref` the bar renders a back link, and `backLabel` is required in that case; content marked `hwTopBarLeading` replaces the link. Content marked `hwTopBarActions` fills the actions region. The leading and actions regions are always rendered and are empty when nothing fills them; the stylesheet hides an empty region. The `variant` input is written as `data-variant` on the header in every case, including the default `'internal'`.

## Accessibility

MobileTopBar renders a native `header` element whose title is a heading element and whose subtitle is a paragraph. The bar is not interactive as a whole: the back link, a leading control and the actions are native links and buttons, so keyboard use and activation follow those elements. The source order is the tab order: the leading control, then the actions.

- The back link is an `a` element whose only content is an icon that is hidden from assistive technology, so `backLabel` is its accessible name. Write a name that says where it leads, such as "Back to requests", not "Back".
- Give an icon-only action or leading control an accessible name of its own, as the examples do with `aria-label`. The bar adds none.
- The title is an `h1` unless `headingLevel` says otherwise. Choose the level from the page that surrounds the bar, so that the page keeps one first-level heading.
- The actions are targets of at least 44 px, and a focused link or button keeps a visible outline, also in forced colours.
- The bar adds no motion and no history behaviour: it never calls the history of the browser, and the back link is an ordinary link.

> [!NOTE]
> A `header` element is a banner landmark only where it is not inside an `article`, `aside`, `main`, `nav` or `section` element. Place the bar so that it is the banner of the page or the heading block of its content, as the structure of the application requires.

## RTL and localisation

MobileTopBar has no built-in text. The title, the subtitle, the back label and the text of the actions are written by the application in the language of the page.

- The leading region stands at the reading start and the actions at the reading end, in the page direction, so the bar mirrors in right-to-left pages without a setting.
- The arrow of the back link points in the direction of travel: the stylesheet mirrors the icon marked `data-directional` in right-to-left pages.
- Long titles and subtitles wrap instead of being cut, and the actions wrap below the title when the width is short.
- Write the `backLabel` in the language of the page.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of MobileTopBar; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- MobileTopBar is listed among the platform patterns of the component scope in the [coverage notes](../coverage.md).
- The mapping of the title roles of the mobile top bar set, the intrinsic 60 px minimum height, the 44 px targets and the safe-area padding, with the adaptations that these choices make, is written in the [mobile top bar notes](../mobile-top-bar.md). The notes state that the mapping does not claim rendered source parity.
