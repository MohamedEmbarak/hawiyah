# Tabs

Tabs divide related content into panels and show one panel at a time. A tab list names the panels, and the selected tab shows its panel while the other panels stay in the document with the hidden attribute.

## Example

A tab list has a name that describes the group of panels. Each tab label names its panel in one or two words.

```html live example=basic check=tabs-keyboard differences=tabs-bar-orientation
<div class="hw-tabs" data-hw="tabs" data-hw-overflow="scroll">
  <div class="hw-tab-list" role="tablist" aria-label="Request details" aria-orientation="horizontal">
    <button class="hw-tab" type="button" role="tab" id="basic-tab-overview" aria-controls="basic-panel-overview" aria-selected="true" data-hw-value="overview">Overview</button>
    <button class="hw-tab" type="button" role="tab" id="basic-tab-documents" aria-controls="basic-panel-documents" aria-selected="false" data-hw-value="documents">Documents</button>
    <button class="hw-tab" type="button" role="tab" id="basic-tab-history" aria-controls="basic-panel-history" aria-selected="false" data-hw-value="history">History</button>
  </div>
  <section class="hw-tab-panel" id="basic-panel-overview" role="tabpanel" aria-labelledby="basic-tab-overview"><p>The request is under review.</p></section>
  <section class="hw-tab-panel" id="basic-panel-documents" role="tabpanel" aria-labelledby="basic-tab-documents" hidden><p>Two documents are attached to the request.</p></section>
  <section class="hw-tab-panel" id="basic-panel-history" role="tabpanel" aria-labelledby="basic-tab-history" hidden><p>The request was submitted and assigned to a reviewer.</p></section>
</div>
```

```tsx live example=basic
<Tabs
  label="Request details"
  overflow="scroll"
  items={[
    { value: 'overview', label: 'Overview', content: <p>The request is under review.</p> },
    { value: 'documents', label: 'Documents', content: <p>Two documents are attached to the request.</p> },
    { value: 'history', label: 'History', content: <p>The request was submitted and assigned to a reviewer.</p> },
  ]}
/>
```

```vue live example=basic
<Tabs
  label="Request details"
  overflow="scroll"
  :items="[
    { value: 'overview', label: 'Overview' },
    { value: 'documents', label: 'Documents' },
    { value: 'history', label: 'History' },
  ]"
>
  <template #overview><p>The request is under review.</p></template>
  <template #documents><p>Two documents are attached to the request.</p></template>
  <template #history><p>The request was submitted and assigned to a reviewer.</p></template>
</Tabs>
```

```ts live example=basic framework=angular
template: `<hw-tabs label="Request details" overflow="scroll">
  <hw-tab value="overview" label="Overview"><p>The request is under review.</p></hw-tab>
  <hw-tab value="documents" label="Documents"><p>Two documents are attached to the request.</p></hw-tab>
  <hw-tab value="history" label="History"><p>The request was submitted and assigned to a reviewer.</p></hw-tab>
</hw-tabs>`
```

## Variants and states

### Vertical

A vertical tab list places the tabs in a column, before the panels. Up Arrow and Down Arrow move between the tabs in every direction, and a vertical list never moves its tabs into the overflow disclosure.

```html live example=vertical check=tabs-click differences=tabs-bar-orientation
<div class="hw-tabs" data-hw="tabs" data-hw-overflow="scroll">
  <div class="hw-tab-list" role="tablist" aria-label="Account settings" aria-orientation="vertical">
    <button class="hw-tab" type="button" role="tab" id="vertical-tab-profile" aria-controls="vertical-panel-profile" aria-selected="true" data-hw-value="profile">Profile</button>
    <button class="hw-tab" type="button" role="tab" id="vertical-tab-security" aria-controls="vertical-panel-security" aria-selected="false" data-hw-value="security">Security</button>
    <button class="hw-tab" type="button" role="tab" id="vertical-tab-notifications" aria-controls="vertical-panel-notifications" aria-selected="false" data-hw-value="notifications">Notifications</button>
  </div>
  <section class="hw-tab-panel" id="vertical-panel-profile" role="tabpanel" aria-labelledby="vertical-tab-profile"><p>Name, email address and mobile number.</p></section>
  <section class="hw-tab-panel" id="vertical-panel-security" role="tabpanel" aria-labelledby="vertical-tab-security" hidden><p>Password and verification methods.</p></section>
  <section class="hw-tab-panel" id="vertical-panel-notifications" role="tabpanel" aria-labelledby="vertical-tab-notifications" hidden><p>Messages about requests and appointments.</p></section>
</div>
```

```tsx live example=vertical
<Tabs
  label="Account settings"
  orientation="vertical"
  overflow="scroll"
  items={[
    { value: 'profile', label: 'Profile', content: <p>Name, email address and mobile number.</p> },
    { value: 'security', label: 'Security', content: <p>Password and verification methods.</p> },
    { value: 'notifications', label: 'Notifications', content: <p>Messages about requests and appointments.</p> },
  ]}
/>
```

```vue live example=vertical
<Tabs
  label="Account settings"
  orientation="vertical"
  overflow="scroll"
  :items="[
    { value: 'profile', label: 'Profile' },
    { value: 'security', label: 'Security' },
    { value: 'notifications', label: 'Notifications' },
  ]"
>
  <template #profile><p>Name, email address and mobile number.</p></template>
  <template #security><p>Password and verification methods.</p></template>
  <template #notifications><p>Messages about requests and appointments.</p></template>
</Tabs>
```

```ts live example=vertical framework=angular
template: `<hw-tabs label="Account settings" orientation="vertical" overflow="scroll">
  <hw-tab value="profile" label="Profile"><p>Name, email address and mobile number.</p></hw-tab>
  <hw-tab value="security" label="Security"><p>Password and verification methods.</p></hw-tab>
  <hw-tab value="notifications" label="Notifications"><p>Messages about requests and appointments.</p></hw-tab>
</hw-tabs>`
```

### Manual activation

With manual activation the arrow keys move focus between the tabs without changing the panel; Enter or Space selects the focused tab. Use it when showing a panel is slow or changes other content on the page.

```html live example=manual check=tabs-keyboard differences=tabs-bar-orientation
<div class="hw-tabs" data-hw="tabs" data-hw-overflow="scroll" data-hw-activation="manual">
  <div class="hw-tab-list" role="tablist" aria-label="Service steps" aria-orientation="horizontal">
    <button class="hw-tab" type="button" role="tab" id="manual-tab-apply" aria-controls="manual-panel-apply" aria-selected="true" data-hw-value="apply">Apply</button>
    <button class="hw-tab" type="button" role="tab" id="manual-tab-pay" aria-controls="manual-panel-pay" aria-selected="false" data-hw-value="pay">Pay</button>
    <button class="hw-tab" type="button" role="tab" id="manual-tab-receive" aria-controls="manual-panel-receive" aria-selected="false" data-hw-value="receive">Receive</button>
  </div>
  <section class="hw-tab-panel" id="manual-panel-apply" role="tabpanel" aria-labelledby="manual-tab-apply"><p>Fill in the application form.</p></section>
  <section class="hw-tab-panel" id="manual-panel-pay" role="tabpanel" aria-labelledby="manual-tab-pay" hidden><p>Pay the service fee.</p></section>
  <section class="hw-tab-panel" id="manual-panel-receive" role="tabpanel" aria-labelledby="manual-tab-receive" hidden><p>Receive the document by email.</p></section>
</div>
```

```tsx live example=manual
<Tabs
  label="Service steps"
  activationMode="manual"
  overflow="scroll"
  items={[
    { value: 'apply', label: 'Apply', content: <p>Fill in the application form.</p> },
    { value: 'pay', label: 'Pay', content: <p>Pay the service fee.</p> },
    { value: 'receive', label: 'Receive', content: <p>Receive the document by email.</p> },
  ]}
/>
```

```vue live example=manual
<Tabs
  label="Service steps"
  activation-mode="manual"
  overflow="scroll"
  :items="[
    { value: 'apply', label: 'Apply' },
    { value: 'pay', label: 'Pay' },
    { value: 'receive', label: 'Receive' },
  ]"
>
  <template #apply><p>Fill in the application form.</p></template>
  <template #pay><p>Pay the service fee.</p></template>
  <template #receive><p>Receive the document by email.</p></template>
</Tabs>
```

```ts live example=manual framework=angular
template: `<hw-tabs label="Service steps" activationMode="manual" overflow="scroll">
  <hw-tab value="apply" label="Apply"><p>Fill in the application form.</p></hw-tab>
  <hw-tab value="pay" label="Pay"><p>Pay the service fee.</p></hw-tab>
  <hw-tab value="receive" label="Receive"><p>Receive the document by email.</p></hw-tab>
</hw-tabs>`
```

### Disabled tab

A disabled tab stays in the list and shows that its panel exists but is not available. The arrow keys skip it, and it cannot be selected. State the reason in the page text.

```html live example=disabled-tab differences=tabs-bar-orientation
<div class="hw-tabs" data-hw="tabs" data-hw-overflow="scroll">
  <div class="hw-tab-list" role="tablist" aria-label="Request details" aria-orientation="horizontal">
    <button class="hw-tab" type="button" role="tab" id="disabled-tab-tab-overview" aria-controls="disabled-tab-panel-overview" aria-selected="true" data-hw-value="overview">Overview</button>
    <button class="hw-tab" type="button" role="tab" id="disabled-tab-tab-decision" aria-controls="disabled-tab-panel-decision" aria-selected="false" data-hw-value="decision" disabled>Decision</button>
    <button class="hw-tab" type="button" role="tab" id="disabled-tab-tab-history" aria-controls="disabled-tab-panel-history" aria-selected="false" data-hw-value="history">History</button>
  </div>
  <section class="hw-tab-panel" id="disabled-tab-panel-overview" role="tabpanel" aria-labelledby="disabled-tab-tab-overview"><p>The decision is available after the review.</p></section>
  <section class="hw-tab-panel" id="disabled-tab-panel-decision" role="tabpanel" aria-labelledby="disabled-tab-tab-decision" hidden><p>No decision has been issued.</p></section>
  <section class="hw-tab-panel" id="disabled-tab-panel-history" role="tabpanel" aria-labelledby="disabled-tab-tab-history" hidden><p>The request was submitted and assigned to a reviewer.</p></section>
</div>
```

```tsx live example=disabled-tab
<Tabs
  label="Request details"
  overflow="scroll"
  items={[
    { value: 'overview', label: 'Overview', content: <p>The decision is available after the review.</p> },
    { value: 'decision', label: 'Decision', content: <p>No decision has been issued.</p>, disabled: true },
    { value: 'history', label: 'History', content: <p>The request was submitted and assigned to a reviewer.</p> },
  ]}
/>
```

```vue live example=disabled-tab
<Tabs
  label="Request details"
  overflow="scroll"
  :items="[
    { value: 'overview', label: 'Overview' },
    { value: 'decision', label: 'Decision', disabled: true },
    { value: 'history', label: 'History' },
  ]"
>
  <template #overview><p>The decision is available after the review.</p></template>
  <template #decision><p>No decision has been issued.</p></template>
  <template #history><p>The request was submitted and assigned to a reviewer.</p></template>
</Tabs>
```

```ts live example=disabled-tab framework=angular
template: `<hw-tabs label="Request details" overflow="scroll">
  <hw-tab value="overview" label="Overview"><p>The decision is available after the review.</p></hw-tab>
  <hw-tab value="decision" label="Decision" disabled><p>No decision has been issued.</p></hw-tab>
  <hw-tab value="history" label="History"><p>The request was submitted and assigned to a reviewer.</p></hw-tab>
</hw-tabs>`
```

## API

### JavaScript

Table: Options of createTabs

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `value` | `string` | `false` | — |
| `activationMode` | `'automatic' \| 'manual'` | `false` | `'automatic'` |
| `overflow` | `'menu' \| 'scroll'` | `false` | `'menu'` |
| `overflowLabel` | `string` | `false` | — |
| `onValueChange` | `(value: string) => void` | `false` | — |

`enhance()` from `@hawiyah/vanilla` calls `createTabs(root, options)` for every element with `data-hw="tabs"`; call `createTabs` directly to pass options. The root contains a `[role="tablist"]` with one `[role="tab"]` button for each panel, and each tab names its panel inside the root through `aria-controls`. The value of a tab is its `data-hw-value`, else its id. Without a `value` option the selected tab is the first tab with `aria-selected="true"`, else the first enabled tab. The root attributes `data-hw-activation="manual"`, `data-hw-overflow` and `data-hw-overflow-label` replace the options of the same name, and `aria-orientation="vertical"` on the tab list makes the list vertical. `overflowLabel` is required while `overflow` is `menu`. The controller returns `{ value, select(value), destroy() }`, dispatches `hw:change` with `detail.value` on the root, and `destroy()` restores the authored markup.

### React

Table: Props of Tabs

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `items` | `readonly TabItem[]` | `true` | — |
| `value` | `string` | `false` | — |
| `defaultValue` | `string` | `false` | — |
| `onValueChange` | `(value: string) => void` | `false` | — |
| `label` | `string` | `false` | — |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `orientation` | `'horizontal' \| 'vertical'` | `false` | `'horizontal'` |
| `activationMode` | `'automatic' \| 'manual'` | `false` | `'automatic'` |
| `overflow` | `'menu' \| 'scroll'` | `false` | `'menu'` |
| `overflowLabel` | `string` | `false` | — |

A `TabItem` is `{ value, label, content, disabled? }`; `label` and `content` are React nodes. One of `label`, `aria-label` and `aria-labelledby` is required: it names the tab list, not the `div.hw-tabs` root. `overflowLabel` is required unless `overflow` is `scroll`. Pass `value` with `onValueChange` for a controlled selection, or `defaultValue` for an uncontrolled one. Tabs also accepts the props of a `div` element, which reach the root.

### Vue

Table: Props, events and slots of Tabs

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `items` | prop | `readonly TabItem[]` | `true` | — |
| `modelValue` | prop | `string` | `false` | — |
| `defaultValue` | prop | `string` | `false` | — |
| `label` | prop | `string` | `false` | — |
| `orientation` | prop | `Orientation` | `false` | `'horizontal'` |
| `activationMode` | prop | `'automatic' \| 'manual'` | `false` | `'automatic'` |
| `overflow` | prop | `'menu' \| 'scroll'` | `false` | `'menu'` |
| `overflowLabel` | prop | `string` | `false` | — |
| `update:modelValue` | event | `(value: string) => void` | `false` | — |

A `TabItem` is `{ value, label, content?, disabled? }`, where `label` is a string. A panel shows the slot named after the item value, else `content`; an optional slot `tab:<value>` replaces the text of a tab. The declarations of 0.3.0 do not type these slots, so the table lists none. `v-model` binds the selected value. The tab list is named by `label`, or by an `aria-label` or `aria-labelledby` attribute, which reaches the tab list. `overflowLabel` is required while `overflow` is `menu`.

### Angular

Table: Inputs, outputs and content of hw-tabs and hw-tab

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `id` | input | `string` | `false` | — |
| `value` | input | `string` | `false` | `''` |
| `label` | input | `string` | `false` | `''` |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `orientation` | input | `'horizontal' \| 'vertical'` | `false` | `'horizontal'` |
| `direction` | input | `'ltr' \| 'rtl'` | `false` | — |
| `activationMode` | input | `'automatic' \| 'manual'` | `false` | `'automatic'` |
| `overflow` | input | `'menu' \| 'scroll'` | `false` | `'menu'` |
| `overflowLabel` | input | `string` | `false` | `''` |
| `valueChange` | output | `string` | `false` | — |
| `*` | content | `hw-tab` | `false` | — |
| `hw-tab value` | input | `string` | `true` | — |
| `hw-tab label` | input | `string` | `true` | — |
| `hw-tab disabled` | input | `boolean` | `false` | `false` |
| `hw-tab *` | content | `panel content` | `false` | — |

`HwTabsComponent` (`hw-tabs`) contains one `HwTabComponent` (`hw-tab`) for each panel; the rows that start with `hw-tab` are the inputs and the content of `hw-tab`. Bind `[(value)]` for a two-way selection. `label` names the tab list and is required unless `aria-label` or `aria-labelledby` is written on `hw-tabs`; `overflowLabel` is required unless `overflow` is `scroll`. Without an `id` the component generates one for its tabs and panels. Each `hw-tab` renders its projected content in its own `section.hw-tab-panel`, and the stylesheet gives the `hw-tab` element `display: contents`, so the panels keep the layout of the other adapters and the tabset can be hydrated after server rendering.

## Accessibility

Tabs follow the tabs pattern of the WAI-ARIA Authoring Practices. The tab list has the role tablist and an accessible name, each tab is a native button with the role tab, and each panel has the role tabpanel and is labelled by its tab through `aria-labelledby`. The selected tab has `aria-selected="true"` and controls the visible panel through `aria-controls`.

Table: Keyboard interaction of Tabs

| Key | Action |
| --- | --- |
| Tab | Moves focus to the selected tab, then into the visible panel. |
| Right Arrow, Left Arrow | In a horizontal list, moves focus to the next or the previous enabled tab in the reading direction, and wraps. |
| Down Arrow, Up Arrow | In a vertical list, moves focus to the next or the previous enabled tab, and wraps. |
| Home, End | Moves focus to the first or the last enabled tab. |
| Enter, Space | With manual activation, selects the focused tab. |

- Only one tab is in the tab order at a time; the arrow keys move focus within the list.
- With automatic activation, which is the default, moving focus also selects the tab and shows its panel.
- Disabled tabs are skipped by the arrow keys and cannot be selected.
- Each panel is focusable, so a panel without a focusable element can still be reached and read.
- When labels do not fit in a horizontal list and `overflow` is `menu`, the labels that do not fit move into a native disclosure after the list, named by `overflowLabel`. The disclosure is outside the tab list, and its buttons use `aria-pressed` for the selected panel.

> [!IMPORTANT]
> Use tabs for panels of related content on the same page. Use links for navigation between pages, and use a stepper for an ordered process.

## RTL and localisation

Tabs have no built-in text: the name of the tab list, the labels of the tabs, the panel content and `overflowLabel` are written by the application in the language of the page. The component inherits the language and the direction of the page, and the packaged styles use logical properties.

- In a horizontal list the arrow keys follow the visual order of the tabs: in a right-to-left page Left Arrow moves to the next tab and Right Arrow to the previous one.
- The vanilla controller and the React and Vue components read the computed direction of the tab list; the Angular component reads it as well, and its `direction` input sets it explicitly.
- Vertical lists use Up Arrow and Down Arrow in both directions.
- Tab values are identifiers, not text, and stay the same in every language.

## Platforms Code reference

Hawiyah is built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section lists the evidence recorded for Tabs and the items that remain open.

### Evidence

- The tab rail, the label sizes and padding, the hover, pressed and focus states, the selected underline and the responsive overflow of the supplied Platforms Code style sheet and script are mapped in the [tab notes](../nic-tabs.md), with the confidence of each mapping.
- Tabs are built and recorded as verified in the vanilla, React, Vue and Angular adapters in [components.json](../../components.json).
- Behaviour tests of the four adapters cover right-to-left navigation, skipping disabled tabs and manual activation; they passed on 2026-10-28.
- Hydration tests of the React and Vue adapters cover stable linked identifiers and working tabs after hydration; they passed on 2026-10-28.

### Open items

- The tab notes record a rendered fixture of the source style sheet without its official font files and dependencies; they do not establish full visual parity with live government sites.
- The overflow measurement uses the component container instead of the viewport width of the source script; this adaptation is documented in the tab notes.
- No hydration test of the Angular adapter is recorded in `components.json`. The Angular structure was changed after 0.2.1 so that the tabset can be hydrated after server rendering.
- The Vue declarations of 0.3.0 do not type the panel and label slots of Tabs.
