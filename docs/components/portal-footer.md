# PortalFooter

PortalFooter is the footer landmark of a portal page: it arranges a brand region with a description, groups of navigation links, a support section, a line of legal text, a list of legal links and a partner region. The application supplies every text and destination.

## Example

The footer names each group of links with a heading and gives each navigation region a name that matches its heading. The first set of links, `links`, is the first navigation group, the groups that follow are named by their titles, and the legal links stand in a region of their own at the bottom.

```html live example=basic differences=portal-footer-adapter-markup frame
<footer class="hw-portal-footer">
  <div class="hw-portal-footer-main">
    <div class="hw-portal-footer-brand"><p>Submit and follow requests, and keep your documents and profile in one place.</p></div>
    <nav class="hw-portal-footer-group" aria-label="Services"><h2>Services</h2><ul class="hw-portal-footer-links"><li><a class="hw-link" href="/services/requests">Requests</a></li><li><a class="hw-link" href="/services/documents">Documents</a></li></ul></nav>
    <nav class="hw-portal-footer-group" aria-label="Help"><h2>Help</h2><ul class="hw-portal-footer-links"><li><a class="hw-link" href="/help/contact">Contact us</a></li><li><a class="hw-link" href="/help/questions">Common questions</a></li></ul></nav>
  </div>
  <div class="hw-portal-footer-bottom">
    <small>Example Portal, all rights reserved.</small>
    <nav class="hw-portal-footer-legal" aria-label="Legal"><ul class="hw-portal-footer-links"><li><a class="hw-link" href="/privacy">Privacy policy</a></li><li><a class="hw-link" href="/terms">Terms of use</a></li></ul></nav>
  </div>
</footer>
```

```tsx live example=basic
<PortalFooter
  description="Submit and follow requests, and keep your documents and profile in one place."
  links={[
    { label: 'Requests', href: '/services/requests' },
    { label: 'Documents', href: '/services/documents' },
  ]}
  navigationLabel="Services"
  groups={[
    {
      title: 'Help',
      links: [
        { label: 'Contact us', href: '/help/contact' },
        { label: 'Common questions', href: '/help/questions' },
      ],
    },
  ]}
  legal="Example Portal, all rights reserved."
  legalLinks={[
    { label: 'Privacy policy', href: '/privacy' },
    { label: 'Terms of use', href: '/terms' },
  ]}
  legalLinksLabel="Legal"
  externalLabel="Opens in a new window"
/>
```

```vue live example=basic
<PortalFooter
  description="Submit and follow requests, and keep your documents and profile in one place."
  :links="[
    { label: 'Requests', href: '/services/requests' },
    { label: 'Documents', href: '/services/documents' },
  ]"
  navigation-label="Services"
  :groups="[
    {
      title: 'Help',
      links: [
        { label: 'Contact us', href: '/help/contact' },
        { label: 'Common questions', href: '/help/questions' },
      ],
    },
  ]"
  copyright="Example Portal, all rights reserved."
  :legal-links="[
    { label: 'Privacy policy', href: '/privacy' },
    { label: 'Terms of use', href: '/terms' },
  ]"
  legal-links-label="Legal"
  external-label="Opens in a new window"
/>
```

```ts live example=basic framework=angular
template: `<hw-portal-footer
  description="Submit and follow requests, and keep your documents and profile in one place."
  [links]="[
    { label: 'Requests', href: '/services/requests' },
    { label: 'Documents', href: '/services/documents' },
  ]"
  navigationLabel="Services"
  [groups]="[
    {
      title: 'Help',
      links: [
        { label: 'Contact us', href: '/help/contact' },
        { label: 'Common questions', href: '/help/questions' },
      ],
    },
  ]"
  copyright="Example Portal, all rights reserved."
  [legalLinks]="[
    { label: 'Privacy policy', href: '/privacy' },
    { label: 'Terms of use', href: '/terms' },
  ]"
  legalLinksLabel="Legal"
  externalLabel="Opens in a new window"
/>`
```

## Variants and states

### External link

A link with `external` set to `true` opens in a new window with the link types noopener and noreferrer, shows a small indicator after its label and adds the text of `externalLabel` to its name for assistive technology.

```html live example=external differences=portal-footer-adapter-markup frame
<footer class="hw-portal-footer">
  <div class="hw-portal-footer-main">
    <nav class="hw-portal-footer-group" aria-label="Help"><h2>Help</h2><ul class="hw-portal-footer-links"><li><a class="hw-link" href="https://example.test/guides" target="_blank" rel="noopener noreferrer">User guides<span class="hw-portal-footer-external hw-icon" data-icon="link-square-02" data-size="sm" aria-hidden="true"></span><span class="hw-sr-only"> Opens in a new window</span></a></li><li><a class="hw-link" href="/help/contact">Contact us</a></li></ul></nav>
  </div>
</footer>
```

```tsx live example=external
<PortalFooter
  groups={[
    {
      title: 'Help',
      links: [
        { label: 'User guides', href: 'https://example.test/guides', external: true },
        { label: 'Contact us', href: '/help/contact' },
      ],
    },
  ]}
  externalLabel="Opens in a new window"
/>
```

```vue live example=external
<script setup lang="ts">
import { PortalFooter } from '@hawiyah/vue';

const groups = [
  {
    title: 'Help',
    links: [
      { label: 'User guides', href: 'https://example.test/guides', external: true },
      { label: 'Contact us', href: '/help/contact' },
    ],
  },
];
</script>

<template>
  <PortalFooter :groups="groups" external-label="Opens in a new window" />
</template>
```

```ts live example=external framework=angular
template: `<hw-portal-footer
  [groups]="[
    {
      title: 'Help',
      links: [
        { label: 'User guides', href: 'https://example.test/guides', external: true },
        { label: 'Contact us', href: '/help/contact' },
      ],
    },
  ]"
  externalLabel="Opens in a new window"
/>`
```

### Support content

Support content, such as a contact action, stands in a section of its own. It needs `supportLabel`, which names the section and is its heading. It is the `support` prop in React, the `support` slot in Vue and content marked `hwFooterSupport` in Angular.

```html live example=support differences=portal-footer-adapter-markup frame
<footer class="hw-portal-footer">
  <div class="hw-portal-footer-main">
    <section class="hw-portal-footer-support" aria-label="Support"><h2>Support</h2><div class="hw-portal-footer-support-content"><a class="hw-link" href="/help/contact">Contact the service desk</a></div></section>
  </div>
</footer>
```

```tsx live example=support
<PortalFooter
  support={<a className="hw-link" href="/help/contact">Contact the service desk</a>}
  supportLabel="Support"
  externalLabel="Opens in a new window"
/>
```

```vue live example=support
<PortalFooter support-label="Support" external-label="Opens in a new window">
  <template #support><a class="hw-link" href="/help/contact">Contact the service desk</a></template>
</PortalFooter>
```

```ts live example=support framework=angular
template: `<hw-portal-footer supportLabel="Support" externalLabel="Opens in a new window">
  <a hwFooterSupport class="hw-link" href="/help/contact">Contact the service desk</a>
</hw-portal-footer>`
```

## API

### JavaScript

Table: Attributes of the hw-portal-footer element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-portal-footer'` | `true` | — |

> [!NOTE]
> These classes and attributes are read from the published stylesheet and are outside the stable contract of 0.3.0.

PortalFooter has no JavaScript controller. The markup is the API: write a `footer` with the class `hw-portal-footer`. Inside it, a `div` with the class `hw-portal-footer-main` holds the groups, and a `div` with the class `hw-portal-footer-bottom` holds the legal text and the legal links. A brand region is a `div` with the class `hw-portal-footer-brand`, which holds an optional `div` with the class `hw-portal-footer-brand-marks` for artwork or a name, and a paragraph for the description. Each group of links is a `nav` with the class `hw-portal-footer-group`, an `aria-label` and a second-level heading with the same text, followed by a list with the class `hw-portal-footer-links`. A section with the class `hw-portal-footer-support` and a `div` with the class `hw-portal-footer-support-content` hold support content; the legal links stand in a `nav` with the class `hw-portal-footer-legal`, and `hw-portal-footer-partners` holds partner artwork. A link that opens a new window carries the indicator class `hw-portal-footer-external` and a text with the class `hw-sr-only` that names the behaviour. Write `aria-label` on each `nav` and on the support section, and, where a brand holds only artwork, on the brand marks with `role="group"`.

### React

Table: Props of PortalFooter

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `brand` | `ReactNode` | `false` | — |
| `brandLabel` | `string` | `false` | — |
| `description` | `ReactNode` | `false` | — |
| `legal` | `ReactNode` | `false` | — |
| `groups` | `readonly PortalFooterGroup[]` | `false` | `[]` |
| `partners` | `ReactNode` | `false` | — |
| `externalLabel` | `string` | `true` | — |
| `links` | `readonly PortalFooterLink[]` | `false` | — |
| `legalLinks` | `readonly PortalFooterLink[]` | `false` | `[]` |
| `legalLinksLabel` | `string` | `false` | — |
| `support` | `ReactNode` | `false` | — |
| `supportLabel` | `string` | `false` | — |
| `navigationLabel` | `string` | `false` | — |

`externalLabel` is required: it is the text that assistive technology reads after a link marked `external`. `links` renders the first navigation group and needs `navigationLabel`, which names the region and is its heading. Each entry of `groups` has a `title` and its `links`; the title names the region and is its heading, and a group without links is omitted. Each link has a `label`, an `href` and an optional `external` flag; with it the link opens in a new window with the link types noopener and noreferrer and shows an indicator. `legalLinks` renders a navigation region at the bottom and needs `legalLinksLabel`, and `legal` is the line of text before it. `brand` is renderable content for the brand region, such as artwork or a name; `brandLabel` names that region as a group and is the accessible name of an artwork-only brand. `description` is a paragraph in the brand region. `support` renders a section with `supportLabel` as its name and its heading, `partners` renders at the bottom, and children render in an extra region of the main area. Every label, title and text is supplied by the application; `groups` and `legalLinks` default to an empty array, and the component also accepts the attributes of a `footer` element.

### Vue

Table: Props, events and slots of PortalFooter

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `brand` | prop | `string` | `false` | — |
| `brandLabel` | prop | `string` | `false` | — |
| `description` | prop | `string` | `false` | — |
| `copyright` | prop | `string` | `false` | — |
| `links` | prop | `readonly PortalFooterLink[]` | `false` | — |
| `groups` | prop | `readonly PortalFooterGroup[]` | `false` | — |
| `legalLinks` | prop | `readonly PortalFooterLink[]` | `false` | — |
| `navigationLabel` | prop | `string` | `false` | — |
| `legalLinksLabel` | prop | `string` | `false` | — |
| `supportLabel` | prop | `string` | `false` | — |
| `externalLabel` | prop | `string` | `true` | — |
| `brand` | slot | — | `false` | — |
| `support` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |
| `partners` | slot | — | `false` | — |

`externalLabel` is required and is read by assistive technology after a link marked `external`. `links` renders the first navigation group and needs `navigationLabel`, `groups` renders further groups named by their `title`, and `legalLinks` renders the legal navigation and needs `legalLinksLabel`; `links`, `groups` and `legalLinks` default to an empty array. A link has a `label`, an `href` and an optional `external` flag, and an external link opens in a new window with the link types noopener and noreferrer. `copyright` is the line of text at the bottom, which Vue names `copyright` where React names it `legal`. `brand` is a text that the component writes in a `strong` element after the content of the `brand` slot, and `brandLabel` names that region as a group. `description` is a paragraph in the brand region. The `support` slot renders a section named by `supportLabel`, the `partners` slot renders at the bottom, and the default slot renders in an extra region of the main area. The table lists the four slots because the published build reads them; the declaration types none.

### Angular

Table: Inputs, outputs and content of hw-portal-footer

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `brand` | input | `string` | `false` | `''` |
| `description` | input | `string` | `false` | `''` |
| `copyright` | input | `string` | `false` | `''` |
| `brandLabel` | input | `string` | `false` | `''` |
| `navigationLabel` | input | `string` | `false` | `''` |
| `links` | input | `readonly HwPortalFooterLink[]` | `false` | `[]` |
| `groups` | input | `readonly HwPortalFooterGroup[]` | `false` | `[]` |
| `legalLinks` | input | `readonly HwPortalFooterLink[]` | `false` | `[]` |
| `legalLinksLabel` | input | `string` | `false` | `''` |
| `supportLabel` | input | `string` | `false` | `''` |
| `externalLabel` | input | `string` | `true` | — |
| `[hwFooterBrand]` | content | — | `false` | — |
| `[hwFooterSupport]` | content | — | `false` | — |
| `*` | content | — | `false` | — |
| `[hwFooterPartners]` | content | — | `false` | — |

`HwPortalFooterComponent` applies to `hw-portal-footer` and renders the `footer` inside the host element. `externalLabel` is required and is read by assistive technology after a link marked `external`. `links` renders the first navigation group and needs `navigationLabel`, `groups` renders further groups named by their `title`, and `legalLinks` renders the legal navigation and needs `legalLinksLabel`. A link has a `label`, an `href` and an optional `external` flag, and an external link opens in a new window with the link types noopener and noreferrer. `copyright` is the line of text at the bottom. `brand` is a text that the component writes in a `strong` element, after any content marked `hwFooterBrand`, and `brandLabel` names that region as a group. `description` is a paragraph in the brand region. Content marked `hwFooterSupport` fills the support section, which is shown only when it has content and then needs `supportLabel`; otherwise the section stays in the document with the `hidden` attribute, no heading and no name. Content marked `hwFooterPartners` renders at the bottom, and other content renders in an extra region of the main area.

## Accessibility

PortalFooter renders a native `footer` element, which the browser exposes as the content information landmark of the page when it is not inside an `article`, `aside`, `main`, `nav` or `section` element. Each group of links is a `nav` element with an accessible name, so a reader of landmarks can tell the groups apart.

- A group has a second-level heading that repeats its name, so the footer is also readable by headings. Place the footer after the main content, in a page whose heading order allows second-level headings there.
- Give every region a different name. Two navigation regions with the same name give a reader of landmarks no way to tell them apart, and the component takes each name from the application.
- A link marked `external` opens a new window, shows an indicator that assistive technology does not read, and carries the text of `externalLabel` in its name, so the reader is told that the link opens a new window.
- Where a brand is artwork only, give `brandLabel` so that the region has a name; React and Vue report an unnamed brand region when the content has none, and Angular reports it only in development mode.
- The links are native `a` elements, so keyboard use and activation follow the browser.

## RTL and localisation

PortalFooter has no built-in text. The description, every label, the titles of the groups, the text of the links, the legal text and the text of `externalLabel` are written by the application in the language of the page.

- The footer follows the direction of the page through logical properties, so the brand, the groups and the legal links begin at the reading start in Arabic and in English.
- Write the groups and their links in the order in which they should be read in each language; the component does not sort or reorder them.
- The brand artwork is supplied by the application. Provide the artwork for each language where it differs, and name it with `brandLabel` where it has no text.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of PortalFooter; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The [footer notes](../nic-footer.md) map the footer titles, links, action rows, spacing and the grouped browse and legal links of the supplied Platforms Code style sheet and script to the classes of the component, with the confidence and the limits of each mapping.
- The [footer notes](../nic-footer.md) state that the component has no text of its own, that the application owns all destinations, support actions and contact details, and that the notes record a source mapping and do not claim full visual parity.
