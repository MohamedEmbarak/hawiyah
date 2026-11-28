# Collapsible

Collapsible is a single disclosure that shows or hides a region of content under a visible label. It renders a native details element with a summary, so the browser provides the open state and the toggle.

## Example

The label names the content that opens. Write it as a short phrase that tells a reader what the region holds.

```html live example=basic differences=collapsible-adapter-markup
<details class="hw-collapsible">
  <summary>Documents required for this request</summary>
  <div><p>Attach a copy of your identity document and a proof of address.</p></div>
</details>
```

```tsx live example=basic
<Collapsible label="Documents required for this request">
  <p>Attach a copy of your identity document and a proof of address.</p>
</Collapsible>
```

```vue live example=basic
<Collapsible label="Documents required for this request">
  <p>Attach a copy of your identity document and a proof of address.</p>
</Collapsible>
```

```ts live example=basic framework=angular
template: `<hw-collapsible label="Documents required for this request">
  <p>Attach a copy of your identity document and a proof of address.</p>
</hw-collapsible>`
```

## Variants and states

### Open

A collapsible starts closed. To start it open, set the initial state: the native `open` attribute in the vanilla markup, `defaultOpen` in React, `defaultValue` in Vue and `open` in Angular.

```html live example=open differences=collapsible-adapter-markup
<details class="hw-collapsible" open>
  <summary>Processing time</summary>
  <div><p>A request is reviewed within five working days of submission.</p></div>
</details>
```

```tsx live example=open
<Collapsible label="Processing time" defaultOpen>
  <p>A request is reviewed within five working days of submission.</p>
</Collapsible>
```

```vue live example=open
<Collapsible label="Processing time" default-value>
  <p>A request is reviewed within five working days of submission.</p>
</Collapsible>
```

```ts live example=open framework=angular
template: `<hw-collapsible label="Processing time" [open]="true">
  <p>A request is reviewed within five working days of submission.</p>
</hw-collapsible>`
```

### Disabled

A disabled collapsible keeps its label and its place in the tab order. In React, Vue and Angular a click, <kbd>Enter</kbd> or <kbd>Space</kbd> on the summary changes nothing. The summary carries `aria-disabled="true"` and the stylesheet shows the disabled colour. The vanilla markup has no script to stop the toggle, so the four results are equal at rest only: the `html` block still opens on activation.

```html live example=disabled differences=collapsible-adapter-markup
<details class="hw-collapsible">
  <summary aria-disabled="true">Payment details</summary>
  <div><p>Payment details are available after the request is submitted.</p></div>
</details>
```

```tsx live example=disabled
<Collapsible label="Payment details" disabled>
  <p>Payment details are available after the request is submitted.</p>
</Collapsible>
```

```vue live example=disabled
<Collapsible label="Payment details" disabled>
  <p>Payment details are available after the request is submitted.</p>
</Collapsible>
```

```ts live example=disabled framework=angular
template: `<hw-collapsible label="Payment details" [disabled]="true">
  <p>Payment details are available after the request is submitted.</p>
</hw-collapsible>`
```

## API

### JavaScript

Table: Attributes of the hw-collapsible element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-collapsible'` | `true` | — |
| `open` | `boolean` | `false` | — |

> [!NOTE]
> These classes and attributes are read from the published stylesheet and are outside the stable contract of 0.3.0.

Collapsible has no JavaScript controller. The markup is the API: write a native `details` element with the class `hw-collapsible`, a `summary` as its first child that holds the label, and one `div` with the content after it. `open` is the native boolean attribute that shows the content; without it the content is hidden. The stylesheet draws the plus or minus indicator in the summary and a border between the summary and the content. For a disabled appearance write `aria-disabled="true"` on the `summary`; no script then stops the toggle, so a hand-written disabled collapsible still opens on activation.

### React

Table: Props of Collapsible

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `label` | `ReactNode` | `true` | — |
| `open` | `boolean` | `false` | — |
| `defaultOpen` | `boolean` | `false` | `false` |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |
| `disabled` | `boolean` | `false` | — |

`label` is the content of the summary and is required. Use `open` with `onOpenChange` for a controlled collapsible, or `defaultOpen`, which is `false` unless set, for an uncontrolled one. `onOpenChange` receives the new state after the reader toggles the summary. While `disabled` is set the summary has `aria-disabled="true"` and stays focusable, a click does nothing, and `onOpenChange` is not called; `open` still follows the application. The children render in a `div` after the summary. The other props reach the `details` element.

### Vue

Table: Props, events and slots of Collapsible

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `label` | prop | `string` | `true` | — |
| `modelValue` | prop | `boolean` | `false` | — |
| `defaultValue` | prop | `boolean` | `false` | `false` |
| `disabled` | prop | `boolean` | `false` | `false` |
| `update:modelValue` | event | `(value: boolean) => void` | `false` | — |
| `default` | slot | — | `false` | — |

`label` is the text of the summary and is required. Use `v-model` for a controlled boolean state, or `defaultValue`, which is `false` unless set, for an uncontrolled one; `update:modelValue` carries the new state after the reader toggles the summary. While `disabled` is set the summary has `aria-disabled="true"` and stays focusable, a click does nothing, and the application can still change the value. The default slot fills the `div` after the summary. The other attributes reach the `details` element. The table lists the `default` slot because the published build reads it; the declaration types no slot.

### Angular

Table: Inputs, outputs and content of hw-collapsible

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `label` | input | `string` | `true` | — |
| `open` | input | `boolean` | `false` | `false` |
| `disabled` | input | `boolean` | `false` | `false` |
| `openChange` | output | `boolean` | `false` | — |
| `*` | content | — | `false` | — |

`HwCollapsibleComponent` applies to `hw-collapsible`. `label` is the text of the summary and is required. Bind `[(open)]` for a two-way state: the component writes `open` and emits `openChange` with the new state when the reader toggles the summary. `open` is `false` unless set. While `disabled` is set the summary has `aria-disabled="true"` and stays focusable, activation is cancelled, no `openChange` is emitted, and `open` still follows the application. Projected content fills the `div` after the summary.

## Accessibility

Collapsible is a native `details` element with a `summary`, so the browser provides the role of the disclosure, the focus on the summary and the toggle, and the label is the accessible name of the summary. Place the collapsible where its label makes sense without the content; a reader who does not open it should still know what it holds.

- <kbd>Enter</kbd> and <kbd>Space</kbd> on the focused summary open or close the content, as for any native `summary`.
- In React, Vue and Angular a disabled collapsible keeps its summary in the tab order and keeps its name. It carries `aria-disabled="true"`, and click, <kbd>Enter</kbd> and <kbd>Space</kbd> change nothing and notify nothing. The vanilla markup has no script: a summary with `aria-disabled="true"` still opens on activation.
- In React the summary has `aria-controls` that names the content element.
- The stylesheet draws the indicator as a mask on the summary and replaces the native marker; it carries no text, so the label alone names the control.

## RTL and localisation

Collapsible has no built-in text. The label and the content are written by the application in the language of the page. The element inherits the language and the direction of the page, and the packaged styles use logical properties: the label is aligned to the reading start and the indicator stands at the reading end, in Arabic and in English.

- Write the label and the content in the same language and direction; mark a passage in another language with its own `lang` attribute.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Collapsible; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- Collapsible is listed among the native components and among the additional interaction components in the [coverage notes](../coverage.md): the browser provides the disclosure, and the library adds the styles and the adapters.
