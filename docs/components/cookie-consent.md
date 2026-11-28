# CookieConsent

CookieConsent is a region that asks the reader to accept or reject optional cookies. It reports the choice to the application and closes; the application decides what is stored and which scripts run.

## Example

The region is named by its title and holds a short description and two actions, Accept and Reject, with the accept action first. Both actions report a choice and close the region. Write labels that say what the choice does, so that the reader can make it without reading the policy first.

```html live example=basic static differences=cookie-consent-adapter-markup
<section class="hw-cookie-consent" data-hw="cookie-consent" aria-labelledby="basic-consent-title">
  <h2 id="basic-consent-title">Cookie preferences</h2>
  <p>We use cookies to keep you signed in and to remember your language. Choose whether to allow cookies that are not required.</p>
  <div class="hw-button-group">
    <button class="hw-button" type="button" data-variant="primary" data-size="md" data-hw-consent="accepted">Accept all cookies</button>
    <button class="hw-button" type="button" data-variant="secondary" data-size="md" data-hw-consent="rejected">Reject optional cookies</button>
  </div>
</section>
```

```tsx live example=basic
<CookieConsent
  title="Cookie preferences"
  description="We use cookies to keep you signed in and to remember your language. Choose whether to allow cookies that are not required."
  acceptLabel="Accept all cookies"
  rejectLabel="Reject optional cookies"
/>
```

```vue live example=basic
<CookieConsent
  title="Cookie preferences"
  description="We use cookies to keep you signed in and to remember your language. Choose whether to allow cookies that are not required."
  accept-label="Accept all cookies"
  reject-label="Reject optional cookies"
/>
```

```ts live example=basic framework=angular
template: `<hw-cookie-consent
  title="Cookie preferences"
  description="We use cookies to keep you signed in and to remember your language. Choose whether to allow cookies that are not required."
  acceptLabel="Accept all cookies"
  rejectLabel="Reject optional cookies"
/>`
```

## Variants and states

### Policy link and preferences

A policy link follows the description when the application gives its address and its label. A third, ghost action opens the application's own preferences when the application listens for it; the action only notifies, and the application shows the preferences.

```html live example=preferences static differences=cookie-consent-adapter-markup
<section class="hw-cookie-consent" data-hw="cookie-consent" aria-labelledby="preferences-consent-title">
  <h2 id="preferences-consent-title">Cookie preferences</h2>
  <p>We use cookies to keep you signed in and to remember your language. Choose whether to allow cookies that are not required.</p>
  <a class="hw-link" href="/cookie-policy">Read the cookie policy</a>
  <div class="hw-button-group">
    <button class="hw-button" type="button" data-variant="primary" data-size="md" data-hw-consent="accepted">Accept all cookies</button>
    <button class="hw-button" type="button" data-variant="secondary" data-size="md" data-hw-consent="rejected">Reject optional cookies</button>
    <button class="hw-button" type="button" data-variant="ghost" data-size="md">Manage preferences</button>
  </div>
</section>
```

```tsx live example=preferences
<CookieConsent
  title="Cookie preferences"
  description="We use cookies to keep you signed in and to remember your language. Choose whether to allow cookies that are not required."
  acceptLabel="Accept all cookies"
  rejectLabel="Reject optional cookies"
  policyHref="/cookie-policy"
  policyLabel="Read the cookie policy"
  preferencesLabel="Manage preferences"
  onPreferences={() => undefined}
/>
```

```vue live example=preferences
<CookieConsent
  title="Cookie preferences"
  description="We use cookies to keep you signed in and to remember your language. Choose whether to allow cookies that are not required."
  accept-label="Accept all cookies"
  reject-label="Reject optional cookies"
  policy-href="/cookie-policy"
  policy-label="Read the cookie policy"
  preferences-label="Manage preferences"
  @preferences="() => undefined"
/>
```

```ts live example=preferences framework=angular
template: `<hw-cookie-consent
  title="Cookie preferences"
  description="We use cookies to keep you signed in and to remember your language. Choose whether to allow cookies that are not required."
  acceptLabel="Accept all cookies"
  rejectLabel="Reject optional cookies"
  policyHref="/cookie-policy"
  policyLabel="Read the cookie policy"
  preferencesLabel="Manage preferences"
  (preferences)="null"
/>`
```

## API

### JavaScript

Table: Options of createCookieConsent

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | — |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |
| `onConsent` | `(choice: 'accepted' \| 'rejected') => void` | `false` | — |
| `storageKey` | `string` | `false` | — |

`createCookieConsent(root, options)` enhances a region that the application wrote; `enhance()` creates it for an element with `data-hw="cookie-consent"`. The markup is the API: a `section` with the class `hw-cookie-consent` named by its `h2` through `aria-labelledby`, a paragraph with the description, an optional link with the class `hw-link` and a `div` with the class `hw-button-group` that holds the buttons. A button with `data-hw-consent` set to `accepted` or `rejected` reports that choice; give the reject button `data-variant="secondary"`, so that the accept action keeps the primary emphasis. A preferences button needs no attribute of the controller, because the application attaches its own handler. The region is open unless `open` is `false`, and the controller sets the `hidden` attribute while it is closed. `setOpen(open)` opens or closes the region, `choose(choice)` reports a choice as a click on a button would, `open` reads the state and `destroy()` removes the listeners. A choice dispatches an `hw:change` event whose detail holds the choice under the key consent, calls `onConsent`, and then closes the region, which dispatches `hw:change` with `open` and calls `onOpenChange`. Persistence is opt-in: with `storageKey` the controller stores the choice in the local storage of the browser under that key, and a region whose key already holds a choice starts closed. When the browser denies storage, the region stays usable and the choice is still reported.

### React

Table: Props of CookieConsent

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `title` | `ReactNode` | `true` | — |
| `description` | `ReactNode` | `true` | — |
| `open` | `boolean` | `false` | — |
| `defaultOpen` | `boolean` | `false` | `true` |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |
| `onConsent` | `(choice: 'accepted' \| 'rejected') => void` | `false` | — |
| `acceptLabel` | `string` | `true` | — |
| `rejectLabel` | `string` | `true` | — |
| `variant` | `'banner'` | `false` | — |
| `policyHref` | `string` | `false` | — |
| `policyLabel` | `string` | `false` | — |
| `onPreferences` | `() => void` | `false` | — |
| `preferencesLabel` | `string` | `false` | — |

`title` renders as the second-level heading that names the region, and `description` renders in a paragraph; both are required, and so are `acceptLabel` and `rejectLabel`. Accept and Reject call `onConsent` with the choice and close the region. The region is open by default; use `open` with `onOpenChange` to control it, or `defaultOpen` to set the initial state. `policyHref` renders a policy link after the description, and `policyLabel` is then required. `onPreferences` renders the last, ghost button, which only calls the handler, and `preferencesLabel` is then required. `children` render after the policy link. The region has the `hidden` attribute while it is closed. The component stores nothing and runs no script; persistence, the activation of cookies and focus after closing belong to the application.

### Vue

Table: Props, events and slots of CookieConsent

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `open` | prop | `boolean` | `false` | — |
| `defaultOpen` | prop | `boolean` | `false` | `true` |
| `title` | prop | `string` | `true` | — |
| `description` | prop | `string` | `true` | — |
| `acceptLabel` | prop | `string` | `true` | — |
| `rejectLabel` | prop | `string` | `true` | — |
| `preferencesLabel` | prop | `string` | `false` | — |
| `policyHref` | prop | `string` | `false` | — |
| `policyLabel` | prop | `string` | `false` | — |
| `variant` | prop | `'banner'` | `false` | — |
| `update:open` | event | `(value: boolean) => void` | `false` | — |
| `consent` | event | `(choice: 'accepted' \| 'rejected') => void` | `false` | — |
| `preferences` | event | `() => void` | `false` | — |
| `default` | slot | — | `false` | — |

`title`, `description`, `acceptLabel` and `rejectLabel` are required strings. Accept and Reject emit `consent` with `'accepted'` or `'rejected'` and close the region. Bind the open state with v-model on `open`, or use `defaultOpen` for an uncontrolled region that starts open. `policyHref` renders a policy link after the description, and `policyLabel` is then required. The `preferences` event renders the last, ghost button while a listener is bound, and `preferencesLabel` is then required. The default slot renders after the policy link. The region has the `hidden` attribute while it is closed; the component stores nothing, and focus after closing belongs to the application. The table lists the slot the published build reads; the declaration types none.

### Angular

Table: Inputs, outputs and content of hw-cookie-consent

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `title` | input | `string` | `true` | — |
| `description` | input | `string` | `true` | — |
| `acceptLabel` | input | `string` | `true` | — |
| `rejectLabel` | input | `string` | `true` | — |
| `preferencesLabel` | input | `string` | `false` | `''` |
| `policyHref` | input | `string` | `false` | `''` |
| `policyLabel` | input | `string` | `false` | `''` |
| `variant` | input | `'banner'` | `false` | — |
| `open` | input | `boolean` | `false` | `true` |
| `openChange` | output | `boolean` | `false` | — |
| `consent` | output | `'accepted' \| 'rejected'` | `false` | — |
| `preferences` | output | `void` | `false` | — |
| `*` | content | — | `false` | — |

`HwCookieConsentComponent` applies to `hw-cookie-consent`, and the host element is the region: it carries `role="region"` and the `hidden` attribute while it is closed. `title`, `description`, `acceptLabel` and `rejectLabel` are required. Bind `[(open)]` for the open state. Accept and Reject emit `consent` with `'accepted'` or `'rejected'` once, close the region and emit `openChange` with `false`; a change of `open` that the application makes emits nothing. `policyHref` renders a policy link after the description, and `policyLabel` is then required. Binding `(preferences)` renders the last, ghost button, and `preferencesLabel` is then required. Projected content renders after the policy link. An `aria-label` or `aria-labelledby` that the application writes on the host replaces the reference to the heading.

## Accessibility

In vanilla, React and Vue, CookieConsent renders a `section` that the browser exposes as a region, named by its title heading through `aria-labelledby`. In Angular the host element `hw-cookie-consent` is the region and carries `role="region"`; no `section` is rendered. In React and Vue, an `aria-label` or `aria-labelledby` that the application writes replaces that reference. The region is not modal and has no focus trap, so the reader can continue to use the page while it is open.

- The content order is the heading, the description, the policy link, the projected content and the buttons, and the buttons are Accept, Reject and Preferences, in that order. Keyboard order follows it.
- Accept and Reject are native buttons. The region does not move focus when it closes, so send focus to the main heading of the page or to the control that reopens the preferences.
- The region has the `hidden` attribute while it is closed, so it leaves the accessibility tree and the tab order.
- A banner fixed at the end of the window must not cover a focused control. Give the page matching padding at its end while the banner is open.
- The region reports a choice and nothing else. It does not show that a choice was stored; write that in the text of the page when the application stores it.

Table: Keyboard interaction of CookieConsent

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd> + <kbd>Tab</kbd> | Moves focus to the next or the previous focusable element, in the order of the content of the region. |
| <kbd>Enter</kbd>, <kbd>Space</kbd> | Activates the focused native button: a choice for Accept or Reject, and the application's handler for Preferences. |
| <kbd>Enter</kbd> | Follows the focused policy link. |

## RTL and localisation

CookieConsent has no built-in text. The title, the description, the policy label and the labels of the actions are written by the application in the language of the page. The region follows the direction of the page and the packaged styles use logical properties, so the text and the actions start at the reading start in Arabic and in English.

- Write the labels of Accept and Reject as plain statements of the choice in the language of the region, and keep the same order of actions in both languages: Accept, Reject, Preferences.
- A banner with `variant="banner"` is fixed at the block end of the window, which does not change with the direction of the page.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of CookieConsent; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- CookieConsent is listed among the platform patterns of the component scope in the [coverage notes](../coverage.md).
- The preference UI gates no script: the region reports a choice, and the application configures persistence and policy handling.
