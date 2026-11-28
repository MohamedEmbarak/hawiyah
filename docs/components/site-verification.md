# SiteVerification

SiteVerification is a native disclosure that stands above a site header and lets a reader open information about the site: its domain, its use of HTTPS and, where the application supplies one, a registration link. The component holds no wording of its own, and the application owns every label and value.

## Example

The summary line names the disclosure and a second label tells the reader that it opens. The open panel gives the domain and the HTTPS statement as two headed groups. The application supplies every text and is responsible for what the panel states.

```html live example=basic
<aside class="hw-site-verification" aria-label="Site information">
  <details open>
    <summary><span>Site information</span><span class="hw-verification-toggle">Show details<span class="hw-icon" data-icon="arrow-down-01" aria-hidden="true"></span></span></summary>
    <div class="hw-verification-content">
      <div class="hw-verification-checks">
        <section><span class="hw-icon" data-icon="link-04" aria-hidden="true"></span><div><h2>Domain name: <bdi>portal.example.test</bdi></h2><p>Check that the address in the browser matches this domain before you enter personal information.</p></div></section>
        <section><span class="hw-icon" data-icon="lock-password" aria-hidden="true"></span><div><h2>Secure connection over HTTPS</h2><p>The address of this site starts with https and the browser shows its lock indicator.</p></div></section>
      </div>
    </div>
  </details>
</aside>
```

```tsx live example=basic
<SiteVerification
  label="Site information"
  detailsLabel="Show details"
  domain="portal.example.test"
  domainLabel="Domain name:"
  domainDescription="Check that the address in the browser matches this domain before you enter personal information."
  httpsLabel="Secure connection over HTTPS"
  httpsDescription="The address of this site starts with https and the browser shows its lock indicator."
  defaultOpen
/>
```

```vue live example=basic
<SiteVerification
  label="Site information"
  details-label="Show details"
  domain="portal.example.test"
  domain-label="Domain name:"
  domain-description="Check that the address in the browser matches this domain before you enter personal information."
  https-label="Secure connection over HTTPS"
  https-description="The address of this site starts with https and the browser shows its lock indicator."
  default-open
/>
```

```ts live example=basic framework=angular
template: `<hw-site-verification
  label="Site information"
  detailsLabel="Show details"
  domain="portal.example.test"
  domainLabel="Domain name:"
  domainDescription="Check that the address in the browser matches this domain before you enter personal information."
  httpsLabel="Secure connection over HTTPS"
  httpsDescription="The address of this site starts with https and the browser shows its lock indicator."
  [open]="true"
/>`
```

## Variants and states

### Collapsed without a domain

Without `domain` the panel omits the domain group and shows only the HTTPS statement. The React and Vue examples and the Angular example still pass `domainLabel` and `domainDescription`, because these props stay required whether or not `domain` is set. The disclosure is closed until the reader opens it, which is the default state. Without `registrationHref` no registration link is rendered.

```html live example=collapsed
<aside class="hw-site-verification" aria-label="Site information">
  <details>
    <summary><span>Site information</span><span class="hw-verification-toggle">Show details<span class="hw-icon" data-icon="arrow-down-01" aria-hidden="true"></span></span></summary>
    <div class="hw-verification-content">
      <div class="hw-verification-checks">
        <section><span class="hw-icon" data-icon="lock-password" aria-hidden="true"></span><div><h2>Secure connection over HTTPS</h2><p>The address of this site starts with https and the browser shows its lock indicator.</p></div></section>
      </div>
    </div>
  </details>
</aside>
```

```tsx live example=collapsed
<SiteVerification
  label="Site information"
  detailsLabel="Show details"
  domainLabel="Domain name:"
  domainDescription="Check that the address in the browser matches this domain before you enter personal information."
  httpsLabel="Secure connection over HTTPS"
  httpsDescription="The address of this site starts with https and the browser shows its lock indicator."
/>
```

```vue live example=collapsed
<SiteVerification
  label="Site information"
  details-label="Show details"
  domain-label="Domain name:"
  domain-description="Check that the address in the browser matches this domain before you enter personal information."
  https-label="Secure connection over HTTPS"
  https-description="The address of this site starts with https and the browser shows its lock indicator."
/>
```

```ts live example=collapsed framework=angular
template: `<hw-site-verification
  label="Site information"
  detailsLabel="Show details"
  domainLabel="Domain name:"
  domainDescription="Check that the address in the browser matches this domain before you enter personal information."
  httpsLabel="Secure connection over HTTPS"
  httpsDescription="The address of this site starts with https and the browser shows its lock indicator."
/>`
```

### Mark

A mark before the label identifies the disclosure visually. It is supplied by the application: the `mark` prop in React, the `mark` slot in Vue and content marked `hwVerificationMark` in Angular. The stylesheet sizes an `img` or `svg` inside the mark region to fit it. When the mark only repeats the label, as the lock icon here does, hide it from assistive technology.

```html live example=mark
<aside class="hw-site-verification" aria-label="Site information">
  <details>
    <summary><span class="hw-verification-mark"><span class="hw-icon" data-icon="lock-password" aria-hidden="true"></span></span><span>Site information</span><span class="hw-verification-toggle">Show details<span class="hw-icon" data-icon="arrow-down-01" aria-hidden="true"></span></span></summary>
    <div class="hw-verification-content">
      <div class="hw-verification-checks">
        <section><span class="hw-icon" data-icon="lock-password" aria-hidden="true"></span><div><h2>Secure connection over HTTPS</h2><p>The address of this site starts with https and the browser shows its lock indicator.</p></div></section>
      </div>
    </div>
  </details>
</aside>
```

```tsx live example=mark
<SiteVerification
  label="Site information"
  detailsLabel="Show details"
  domainLabel="Domain name:"
  domainDescription="Check that the address in the browser matches this domain before you enter personal information."
  httpsLabel="Secure connection over HTTPS"
  httpsDescription="The address of this site starts with https and the browser shows its lock indicator."
  mark={<span className="hw-icon" data-icon="lock-password" aria-hidden="true" />}
/>
```

```vue live example=mark
<SiteVerification
  label="Site information"
  details-label="Show details"
  domain-label="Domain name:"
  domain-description="Check that the address in the browser matches this domain before you enter personal information."
  https-label="Secure connection over HTTPS"
  https-description="The address of this site starts with https and the browser shows its lock indicator."
>
  <template #mark><span class="hw-icon" data-icon="lock-password" aria-hidden="true"></span></template>
</SiteVerification>
```

```ts live example=mark framework=angular
template: `<hw-site-verification
  label="Site information"
  detailsLabel="Show details"
  domainLabel="Domain name:"
  domainDescription="Check that the address in the browser matches this domain before you enter personal information."
  httpsLabel="Secure connection over HTTPS"
  httpsDescription="The address of this site starts with https and the browser shows its lock indicator."
>
  <span hwVerificationMark class="hw-icon" data-icon="lock-password" aria-hidden="true"></span>
</hw-site-verification>`
```

## API

### JavaScript

Table: Attributes of the hw-site-verification and hw-portal-masthead elements

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-site-verification' \| 'hw-portal-masthead'` | `true` | — |
| `data-variant` | `'sticky'` | `false` | — |

> [!NOTE]
> These classes and attributes are read from the published stylesheet and are outside the stable contract of 0.3.0.

SiteVerification has no JavaScript controller. The markup is the API: write an `aside` with the class `hw-site-verification` and an `aria-label`, and inside it a native `details` element, with the attribute `open` for the open state. The `summary` holds the label and a `span` with the class `hw-verification-toggle` that holds the details label and a packaged arrow icon. The panel is a `div` with the class `hw-verification-content`; a `div` with the class `hw-verification-checks` holds one `section` for each statement, with an icon, a second-level heading and a paragraph, and a paragraph with the class `hw-verification-registration` holds the registration link. The link opens in a new window when it carries the link target and the link types noopener and noreferrer; omit them when the record belongs to the same application, and the link then needs no hidden new-window text. A `span` with the class `hw-verification-mark` before the label holds an optional mark. The class `hw-portal-masthead` wraps the disclosure and a portal header, and `data-variant="sticky"` on it holds the whole masthead at the start of its scroll container, which is the viewport when the page itself scrolls. The state of the disclosure is the native `open` attribute and the native toggle event.

### React

Table: Props of SiteVerification

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `mark` | `ReactNode` | `false` | — |
| `open` | `boolean` | `false` | — |
| `defaultOpen` | `boolean` | `false` | `false` |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |
| `label` | `string` | `true` | — |
| `domain` | `string` | `false` | — |
| `registrationNumber` | `string` | `false` | — |
| `detailsLabel` | `string` | `true` | — |
| `domainLabel` | `string` | `true` | — |
| `domainDescription` | `string` | `true` | — |
| `httpsLabel` | `string` | `true` | — |
| `httpsDescription` | `string` | `true` | — |
| `registrationHref` | `string` | `false` | — |
| `registrationLabel` | `string` | `false` | — |
| `registrationExternal` | `boolean` | `false` | `true` |
| `externalLabel` | `string` | `false` | — |

The component renders its own `aside`, and `label` is its accessible name unless `aria-label` is passed. `label`, `detailsLabel`, `domainLabel`, `domainDescription`, `httpsLabel` and `httpsDescription` are required text. The domain group renders only when `domain` is set, and its heading is `domainLabel` followed by the domain. `registrationHref` renders the registration link, and `registrationLabel` is then required, with `registrationNumber` shown after it. With `registrationExternal` on, which is its default, the link opens in a new window and `externalLabel` is required and appended to the link name for assistive technology. `open` with `onOpenChange` controls the disclosure, and `defaultOpen` sets the initial state of an uncontrolled one; in a controlled use the component calls `onOpenChange` with the requested state and the application sets `open`. `mark` fills the mark region before the label, and the children are rendered at the end of the panel, after the registration link. The component also accepts the attributes of an `aside` element.

### Vue

Table: Props, events and slots of SiteVerification

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `label` | prop | `string` | `true` | — |
| `detailsLabel` | prop | `string` | `true` | — |
| `domainLabel` | prop | `string` | `true` | — |
| `domainDescription` | prop | `string` | `true` | — |
| `httpsLabel` | prop | `string` | `true` | — |
| `httpsDescription` | prop | `string` | `true` | — |
| `registrationLabel` | prop | `string` | `false` | — |
| `domain` | prop | `string` | `false` | — |
| `registrationHref` | prop | `string` | `false` | — |
| `registrationNumber` | prop | `string` | `false` | — |
| `externalLabel` | prop | `string` | `false` | — |
| `registrationExternal` | prop | `boolean` | `false` | `true` |
| `open` | prop | `boolean` | `false` | — |
| `defaultOpen` | prop | `boolean` | `false` | `false` |
| `update:open` | event | `(open: boolean) => void` | `false` | — |
| `mark` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |

The required props are `label`, `detailsLabel`, `domainLabel`, `domainDescription`, `httpsLabel` and `httpsDescription`; `registrationLabel` is required when `registrationHref` is set, and `externalLabel` is required when `registrationExternal`, which is on by default, applies. The domain group renders only when `domain` is set. `open` controls the disclosure, and the component emits `update:open` with the requested state, so that `v-model` binds it with the argument `open`, and `defaultOpen` sets the state of an uncontrolled one. The `mark` slot fills the region before the label, and the default slot is rendered at the end of the panel, after the registration link. The attributes that are not props, such as `aria-label`, fall through to the `aside`. The table lists the `mark` and `default` slots because the published build reads them; the declaration types no slot.

### Angular

Table: Inputs, outputs and content of hw-site-verification

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `label` | input | `string` | `true` | — |
| `detailsLabel` | input | `string` | `true` | — |
| `domain` | input | `string` | `false` | `''` |
| `domainLabel` | input | `string` | `true` | — |
| `domainDescription` | input | `string` | `true` | — |
| `httpsLabel` | input | `string` | `true` | — |
| `httpsDescription` | input | `string` | `true` | — |
| `registrationHref` | input | `string` | `false` | `''` |
| `registrationLabel` | input | `string` | `false` | `''` |
| `registrationNumber` | input | `string` | `false` | `''` |
| `registrationExternal` | input | `boolean` | `false` | `true` |
| `externalLabel` | input | `string` | `false` | `''` |
| `open` | input | `boolean` | `false` | `false` |
| `openChange` | output | `boolean` | `false` | — |
| `[hwVerificationMark]` | content | — | `false` | — |
| `*` | content | — | `false` | — |

`HwSiteVerificationComponent` applies to `hw-site-verification` and renders the `aside` inside the host element. `label`, `detailsLabel`, `domainLabel`, `domainDescription`, `httpsLabel` and `httpsDescription` are required text, and there is no input for a locale. The domain group renders only when `domain` is not empty. A non-empty `registrationHref` renders the registration link and needs `registrationLabel`; with `registrationExternal` on, which is its default, the link opens in a new window and needs `externalLabel`. `open` is the state of the disclosure, written as `[(open)]` for two-way binding, and `openChange` emits the new state when the reader toggles it. Content marked `hwVerificationMark` fills the mark region before the label, and the other content is rendered at the end of the panel, after the registration link.

## Accessibility

SiteVerification renders an `aside` landmark whose accessible name is `label`, and a native `details` element with a `summary`. The browser provides the expanded state and the activation of the summary with <kbd>Enter</kbd> and <kbd>Space</kbd>, and it keeps the content of a closed disclosure out of the tab order.

- The summary holds the `label` text and the `detailsLabel` text. The arrow beside the details label is hidden from assistive technology and rotates when the disclosure is open; the stylesheet removes that transition when the reader asks for reduced motion.
- Each statement of the panel has a second-level heading, the domain label with the domain and the HTTPS label. These headings stand inside the landmark, so check the heading order of the page where the component is placed.
- The domain and the registration number are written in a `bdi` element, so a Latin value keeps its direction inside Arabic text.
- A registration link that opens a new window is written with the link types noopener and noreferrer, and the text of `externalLabel` is appended to its name for assistive technology and hidden visually.
- The summary has a minimum height of 2.75rem, and the summary and the link have a visible focus outline.
- The component states only what the application writes. It does not check the domain, the state of the connection or the registration, so write only statements that the deployment can support.

## RTL and localisation

SiteVerification has no built-in text. The labels, the descriptions, the details label and the new-window label are supplied by the application in the language of the page; the required ones are listed in the tables above, and there is no input for a locale.

- The component follows the direction of the page through logical properties, so the mark, the label and the toggle begin at the reading start in Arabic and in English.
- `domain` and `registrationNumber` are values and not translated text. Write them as they are issued; the `bdi` element isolates them from the surrounding text.
- A long domain wraps inside the panel instead of overflowing it.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of SiteVerification; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The [site verification notes](../site-verification.md) compare the structure of the supplied script, a disclosure at the top of the page with domain guidance, HTTPS guidance and a registration link, with the implementation, and state the confidence of each mapping.
- The [site verification notes](../site-verification.md) record that the component has no text of its own, and that the application supplies its labels, domain, registration data and artwork. They also state the limits of the comparison: the supplied files did not hold the exact stamp styles, and the live pages could not be retrieved when the notes were written.
