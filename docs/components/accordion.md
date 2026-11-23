# Accordion

Accordion stacks sections of related content, each behind a trigger that shows or hides it. It is built on the native `details` and `summary` elements, so a section opens and closes without script.

## Example

Each section has a short title that names its content. Several sections can be open at the same time.

```html live example=basic static
<div class="hw-accordion" data-hw="accordion">
  <details class="hw-accordion-item" data-hw-value="who">
    <summary class="hw-accordion-trigger">Who can submit a request</summary>
    <div class="hw-accordion-content">An applicant, or a representative who holds a signed authorisation, can submit a request.</div>
  </details>
  <details class="hw-accordion-item" data-hw-value="documents">
    <summary class="hw-accordion-trigger">Which documents are needed</summary>
    <div class="hw-accordion-content">Attach a copy of the identity document and one proof of address.</div>
  </details>
  <details class="hw-accordion-item" data-hw-value="duration">
    <summary class="hw-accordion-trigger">How long a review takes</summary>
    <div class="hw-accordion-content">A review usually takes five working days from the date of submission.</div>
  </details>
</div>
```

```tsx live example=basic
<Accordion
  items={[
    { value: 'who', title: 'Who can submit a request', content: 'An applicant, or a representative who holds a signed authorisation, can submit a request.' },
    { value: 'documents', title: 'Which documents are needed', content: 'Attach a copy of the identity document and one proof of address.' },
    { value: 'duration', title: 'How long a review takes', content: 'A review usually takes five working days from the date of submission.' },
  ]}
/>
```

```vue live example=basic
<Accordion
  :items="[
    { value: 'who', title: 'Who can submit a request', content: 'An applicant, or a representative who holds a signed authorisation, can submit a request.' },
    { value: 'documents', title: 'Which documents are needed', content: 'Attach a copy of the identity document and one proof of address.' },
    { value: 'duration', title: 'How long a review takes', content: 'A review usually takes five working days from the date of submission.' },
  ]"
/>
```

```ts live example=basic framework=angular
template: `<hw-accordion
  [items]="[
    { value: 'who', title: 'Who can submit a request', content: 'An applicant, or a representative who holds a signed authorisation, can submit a request.' },
    { value: 'documents', title: 'Which documents are needed', content: 'Attach a copy of the identity document and one proof of address.' },
    { value: 'duration', title: 'How long a review takes', content: 'A review usually takes five working days from the date of submission.' },
  ]"
/>`
```

## Variants and states

### Open section

A section is open from the start when the application asks for it. React takes `defaultOpen` on an item for an uncontrolled section, and Vue and Angular take `open` on an item as the initial state; the reader can still toggle the section. In plain HTML markup the native `open` attribute on the `details` element does the same.

```html live example=open static
<div class="hw-accordion" data-hw="accordion">
  <details class="hw-accordion-item" open>
    <summary class="hw-accordion-trigger">Submission status</summary>
    <div class="hw-accordion-content">The request has been submitted and is waiting for review.</div>
  </details>
  <details class="hw-accordion-item">
    <summary class="hw-accordion-trigger">Attached documents</summary>
    <div class="hw-accordion-content">Two documents are attached to the request.</div>
  </details>
</div>
```

```tsx live example=open
<Accordion
  items={[
    { value: 'status', title: 'Submission status', content: 'The request has been submitted and is waiting for review.', defaultOpen: true },
    { value: 'documents', title: 'Attached documents', content: 'Two documents are attached to the request.' },
  ]}
/>
```

```vue live example=open
<Accordion
  :items="[
    { value: 'status', title: 'Submission status', content: 'The request has been submitted and is waiting for review.', open: true },
    { value: 'documents', title: 'Attached documents', content: 'Two documents are attached to the request.' },
  ]"
/>
```

```ts live example=open framework=angular
template: `<hw-accordion
  [items]="[
    { value: 'status', title: 'Submission status', content: 'The request has been submitted and is waiting for review.', open: true },
    { value: 'documents', title: 'Attached documents', content: 'Two documents are attached to the request.' },
  ]"
/>`
```

### Exclusive sections

With `exclusive`, opening a section closes the one that is open. The adapters give the sections one native `name`; in plain HTML markup write the same `name` attribute on each `details` element.

```html live example=exclusive static
<div class="hw-accordion" data-hw="accordion">
  <details class="hw-accordion-item" name="request-steps">
    <summary class="hw-accordion-trigger">Step 1: Identify the applicant</summary>
    <div class="hw-accordion-content">Enter the full name and the identity number of the applicant.</div>
  </details>
  <details class="hw-accordion-item" name="request-steps">
    <summary class="hw-accordion-trigger">Step 2: Attach documents</summary>
    <div class="hw-accordion-content">Attach the documents that support the request.</div>
  </details>
</div>
```

```tsx live example=exclusive
<Accordion
  exclusive
  items={[
    { value: 'applicant', title: 'Step 1: Identify the applicant', content: 'Enter the full name and the identity number of the applicant.' },
    { value: 'documents', title: 'Step 2: Attach documents', content: 'Attach the documents that support the request.' },
  ]}
/>
```

```vue live example=exclusive
<Accordion
  exclusive
  :items="[
    { value: 'applicant', title: 'Step 1: Identify the applicant', content: 'Enter the full name and the identity number of the applicant.' },
    { value: 'documents', title: 'Step 2: Attach documents', content: 'Attach the documents that support the request.' },
  ]"
/>
```

```ts live example=exclusive framework=angular
template: `<hw-accordion
  [exclusive]="true"
  [items]="[
    { value: 'applicant', title: 'Step 1: Identify the applicant', content: 'Enter the full name and the identity number of the applicant.' },
    { value: 'documents', title: 'Step 2: Attach documents', content: 'Attach the documents that support the request.' },
  ]"
/>`
```

## API

### JavaScript

Table: Options of createAccordion

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `onOpenChange` | `(value: string, open: boolean) => void` | `false` | — |

`createAccordion(root, options)` enhances existing markup, and `enhance()` does the same for an element with `data-hw="accordion"`. Each direct child of the root with the class `hw-accordion-item` is written as a `details` element that holds a `summary` and exactly one content wrapper; the controller throws when an item has no summary or does not have exactly one other child, or when two values repeat. Write `data-hw-value` on each `details` element for a stable value, which otherwise is its zero-based index, and keep the values unique. The controller returns `setOpen(value, open)` and `destroy()`. `onOpenChange` receives the value and the logical state, and the same change is dispatched as the `hw:change` event on the root with `{ value, open }`. A click on a link, button or form control inside the `summary` does not toggle the section. Native markup without the controller works as it is; the controller adds the height animation.

### React

Table: Props of Accordion

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `items` | `readonly AccordionItem[]` | `true` | — |
| `exclusive` | `boolean` | `false` | — |

`items` lists the sections. An `AccordionItem` has a `value` that keys it, a `title` and a `content`, both renderable React content, and optionally `open`, `defaultOpen` and `onOpenChange`. Use `open` with `onOpenChange` for a controlled section, or `defaultOpen` for an uncontrolled one. When one item is controlled in an exclusive group, the application accepts the close request of the previous item when it accepts the opening of another. `exclusive` makes the sections one group: the component writes one native `name` on them, and once a section is enhanced the helper removes that name and keeps one section open by asking the open peer to close. Other props reach the root element.

### Vue

Table: Props, events and slots of Accordion

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `items` | prop | `readonly AccordionItem[]` | `true` | — |
| `exclusive` | prop | `boolean` | `false` | `false` |
| `toggle` | event | `(value: string, open: boolean) => void` | `false` | — |
| `content` | slot | — | `false` | — |
| `title` | slot | — | `false` | — |

`items` lists the sections. An `AccordionItem` has a `value`, a string `title`, an optional `content` and an optional `open` that sets the initial state and updates the section when it changes. `toggle` fires once for each logical change by the reader or by an exclusive group, with the value and the new state; the sections toggle without a listener. The scoped slots `title` and `content` receive the item and its index and render rich content; a title slot must contain text, because it names the summary. The table lists the two slots because the published build reads them; the declaration types none.

### Angular

Table: Inputs, outputs and content of hw-accordion and details[hwAccordionOpen]

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `items` | input | `readonly HwAccordionItem[]` | `false` | `[]` |
| `titleTemplate` | input | `TemplateRef<{ $implicit: HwAccordionItem; index: number }>` | `false` | — |
| `contentTemplate` | input | `TemplateRef<{ $implicit: HwAccordionItem; index: number }>` | `false` | — |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `exclusive` | input | `boolean` | `false` | `false` |
| `groupName` | input | `string` | `false` | — |
| `toggled` | output | `{ value: string; open: boolean }` | `false` | — |
| `*` | content | — | `false` | — |
| `details[hwAccordionOpen] hwAccordionOpen` | input | `boolean \| undefined` | `false` | — |
| `details[hwAccordionOpen] hwAccordionGroup` | input | `string \| undefined` | `false` | — |
| `details[hwAccordionOpen] hwAccordionChange` | output | `boolean` | `false` | — |

`HwAccordionComponent` (`hw-accordion`) takes `items`, where an `HwAccordionItem` has a `value`, a plain-text `title`, an optional string `content` and an optional `open` for the initial state. `toggled` emits the value and the new state once for each logical change. `titleTemplate` and `contentTemplate` display rich content inside the summary and the content wrapper; a title template must render text, because it names the summary. When `aria-label` or `aria-labelledby` is written on `hw-accordion`, it reaches the root element, which then has `role="group"`; an `aria-describedby` reaches the root element too, but gives it no role. `groupName` is the native `name` of an exclusive group; without it a generated id is used. The directive `HwAccordionMotionDirective` (`details[hwAccordionOpen]`) animates a `details` element that the application writes itself, which needs a `summary` and a direct child with the class `hw-accordion-content`, with `hwAccordionOpen` for its state, `hwAccordionGroup` for an exclusive group and `hwAccordionChange` for the logical change. The `*` row is the content projected into the component.

## Accessibility

Each section is a native `details` element with a native `summary` as its trigger, so the browser provides the role, the expanded state and the focus behaviour; once a section is enhanced, the helper writes `aria-expanded` on the `summary` itself, as the first item below describes. The title of a section is its accessible name.

Table: Keyboard interaction of Accordion

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | As in any HTML page, moves focus to the next trigger, or to the next focusable element inside an open section. |
| <kbd>Enter</kbd>, <kbd>Space</kbd> | The native `summary` opens or closes the section of the focused trigger. |

- While a section closes, its `summary` already exposes `aria-expanded="false"` and the content becomes inert and hidden from assistive technology; the `open` attribute stays until the height animation ends. Focus inside the closing content returns to the summary.
- The height animation settles immediately when the reader asks for reduced motion, and the original Hawiyah theme has no animation.
- Every `summary` needs text, including one built from a title slot or a title template, because the text is the accessible name of the section.

## RTL and localisation

Accordion has no built-in text: the titles and the contents are written by the application in the language of the page. The element inherits the language and the direction of the page, and the packaged styles use logical properties, so the trigger text, the section content and the position of the indicator follow the reading direction. The native `details` element needs no direction setting of its own.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Accordion; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The header and body spacing, the hover and focus surfaces, the indicator and the transition timings of the supplied Platforms Code style sheet are mapped onto the native disclosure markup in the [accordion notes](../nic-accordion.md), with the confidence of each mapping; the notes state that the source mapping establishes style requirements and not official visual parity.
- The height animation, the reduced-motion behaviour and the exclusive groups of the adapters are described in the [motion notes](../accordion-motion.md); the notes state that their evidence establishes source-informed behaviour and not visual parity.
