# ServiceDetails

ServiceDetails presents one service in full in an article: a heading with a description, a list of facts, a list of requirements, further content and one action. The application owns the requirements and the action.

## Example

The title names the service, and the facts and the requirements state what a reader needs before starting. The action sits last, in the footer.

```html live example=basic
<article class="hw-service-details">
  <header><h2>Copy of a document</h2><p>Request a certified copy of a document held on your record.</p></header>
  <dl class="hw-description-list"><div><dt>Duration</dt><dd>3 days</dd></div><div><dt>Fee</dt><dd>Free</dd></div></dl>
  <section><h3>Requirements</h3><ul><li>An identity document</li><li>The reference number of the document</li></ul></section>
  <footer><button class="hw-button" type="button" data-variant="primary" data-size="md">Request a copy</button></footer>
</article>
```

```tsx live example=basic
<ServiceDetails
  title="Copy of a document"
  description="Request a certified copy of a document held on your record."
  metadata={[
    { term: 'Duration', description: '3 days' },
    { term: 'Fee', description: 'Free' },
  ]}
  requirementsLabel="Requirements"
  requirements={['An identity document', 'The reference number of the document']}
  action={<Button>Request a copy</Button>}
/>
```

```vue live example=basic
<ServiceDetails
  title="Copy of a document"
  description="Request a certified copy of a document held on your record."
  :metadata="[
    { term: 'Duration', description: '3 days' },
    { term: 'Fee', description: 'Free' },
  ]"
  requirements-label="Requirements"
  :requirements="['An identity document', 'The reference number of the document']"
>
  <template #action><Button>Request a copy</Button></template>
</ServiceDetails>
```

```ts live example=basic framework=angular
template: `<hw-service-details
  title="Copy of a document"
  description="Request a certified copy of a document held on your record."
  [metadata]="[
    { term: 'Duration', description: '3 days' },
    { term: 'Fee', description: 'Free' },
  ]"
  requirementsLabel="Requirements"
  [requirements]="['An identity document', 'The reference number of the document']"
>
  <button hwButton hwServiceAction>Request a copy</button>
</hw-service-details>`
```

## Variants and states

### Additional content

Content that the application places inside the component renders after the requirements and before the footer. Use it for a note or a block of text that the other parts do not cover.

```html live example=content
<article class="hw-service-details">
  <header><h2>Profile update</h2><p>Update the contact details on your profile.</p></header>
  <p>Changes take effect after you confirm them.</p>
  <footer><button class="hw-button" type="button" data-variant="primary" data-size="md">Start update</button></footer>
</article>
```

```tsx live example=content
<ServiceDetails title="Profile update" description="Update the contact details on your profile." action={<Button>Start update</Button>}>
  <p>Changes take effect after you confirm them.</p>
</ServiceDetails>
```

```vue live example=content
<ServiceDetails title="Profile update" description="Update the contact details on your profile.">
  <p>Changes take effect after you confirm them.</p>
  <template #action><Button>Start update</Button></template>
</ServiceDetails>
```

```ts live example=content framework=angular
template: `<hw-service-details title="Profile update" description="Update the contact details on your profile.">
  <p>Changes take effect after you confirm them.</p>
  <button hwButton hwServiceAction>Start update</button>
</hw-service-details>`
```

### Rich requirements

The adapters let the application render each requirement itself, so an entry can hold a link. React takes renderable nodes in `requirements`; Vue and Angular take strings in `requirements`, and Vue renders each through the `requirement` slot and Angular through a template in `requirementTemplate`. The Vue and Angular examples choose the address by position because they have two entries; in an application, read the address from the data of each entry.

```html live example=rich
<article class="hw-service-details">
  <header><h2>Document status</h2><p>Check the status of a document request.</p></header>
  <section><h3>Before you start</h3><ul><li><a class="hw-link" href="/guidance/reference-number">Find the reference number</a></li><li><a class="hw-link" href="/guidance/identity">Prepare an identity document</a></li></ul></section>
  <footer><button class="hw-button" type="button" data-variant="primary" data-size="md">Check status</button></footer>
</article>
```

```tsx live example=rich
<ServiceDetails
  title="Document status"
  description="Check the status of a document request."
  requirementsLabel="Before you start"
  requirements={[
    <a className="hw-link" href="/guidance/reference-number">Find the reference number</a>,
    <a className="hw-link" href="/guidance/identity">Prepare an identity document</a>,
  ]}
  action={<Button>Check status</Button>}
/>
```

```vue live example=rich
<ServiceDetails
  title="Document status"
  description="Check the status of a document request."
  requirements-label="Before you start"
  :requirements="['Find the reference number', 'Prepare an identity document']"
>
  <template #requirement="{ item, index }">
    <a class="hw-link" :href="index === 0 ? '/guidance/reference-number' : '/guidance/identity'">{{ item }}</a>
  </template>
  <template #action><Button>Check status</Button></template>
</ServiceDetails>
```

```ts live example=rich framework=angular
template: `<hw-service-details
  title="Document status"
  description="Check the status of a document request."
  requirementsLabel="Before you start"
  [requirements]="['Find the reference number', 'Prepare an identity document']"
  [requirementTemplate]="requirement"
>
  <button hwButton hwServiceAction>Check status</button>
</hw-service-details>
<ng-template #requirement let-item let-index="index">
  <a class="hw-link" [attr.href]="index === 0 ? '/guidance/reference-number' : '/guidance/identity'">{{ item }}</a>
</ng-template>`
```

## API

### JavaScript

Table: Attributes of the hw-service-details element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-service-details'` | `true` | — |

> [!NOTE]
> These classes and attributes are read from the published stylesheet and are outside the stable contract of 0.3.0.

ServiceDetails has no JavaScript controller. The markup is the API: write an `article` with the class `hw-service-details` that holds, in order, a `header` with a second-level heading and a paragraph, a description list element with the class `hw-description-list` for the facts, a `section` with a third-level heading and a `ul` for the requirements, further content, and a `footer` with the action. The action is the element that the application supplies, such as a `button` with the class `hw-button` for a command or a link for a destination. A part the service does not need is left out.

### React

Table: Props of ServiceDetails

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `title` | `ReactNode` | `true` | — |
| `description` | `ReactNode` | `false` | — |
| `metadata` | `readonly DescriptionItem[]` | `false` | — |
| `action` | `ReactNode` | `false` | — |
| `requirements` | `readonly ReactNode[]` | `false` | — |
| `requirementsLabel` | `string` | `false` | — |

`title` is required and renders as a second-level heading. `description` renders in a paragraph after it. Each item of `metadata` has a `term` and a `description`, and a description list renders only when the array has entries. `requirements` is a list of renderable nodes that renders as a list in a section, only when it has entries, and `requirementsLabel` is the heading of that section; it is required when `requirements` is given. Children render after the requirements. `action` renders in a `footer` that is the last child of the article, only when it is given. The other props reach the `article` element.

### Vue

Table: Props, events and slots of ServiceDetails

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `title` | prop | `string` | `true` | — |
| `description` | prop | `string` | `false` | — |
| `metadata` | prop | `readonly DescriptionItem[]` | `false` | — |
| `requirements` | prop | `readonly string[]` | `false` | — |
| `requirementsLabel` | prop | `string` | `false` | — |
| `requirement` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |
| `action` | slot | — | `false` | — |

`title` is required and renders as a second-level heading, and `description` renders in a paragraph after it. Each item of `metadata` has a `term` and a `description`, and a stacked description list renders only when the prop has entries. `requirements` is a list of strings, rendered as a list in a section only when it has entries, and `requirementsLabel` is the heading of that section; it is required when `requirements` is given. The `requirement` slot receives each string as the item and its position as the index, and replaces the plain text of the entry. The default slot adds content after the requirements, and the `action` slot renders in a `footer` that is the last child of the article, only when it is given. The other attributes reach the `article` element. The table lists the three slots because the published build reads them; the declaration types none.

### Angular

Table: Inputs, outputs and content of hw-service-details

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `title` | input | `string` | `true` | — |
| `description` | input | `string` | `false` | `''` |
| `metadata` | input | `readonly HwDescription[]` | `false` | `[]` |
| `requirements` | input | `readonly string[]` | `false` | `[]` |
| `requirementTemplate` | input | `TemplateRef<{ $implicit: string; index: number }>` | `false` | — |
| `requirementsLabel` | input | `string` | `false` | `''` |
| `*` | content | — | `false` | — |
| `[hwServiceAction]` | content | — | `false` | — |

`HwServiceDetailsComponent` applies to `hw-service-details`. `title` is required and renders as a second-level heading, and `description` renders in a paragraph after it. Each item of `metadata` has a `term` and a `description`, and a description list renders only when the input has entries. `requirements` is a list of strings, rendered as a list in a section only when it has entries, and `requirementsLabel` is the heading of that section; it is required when `requirements` is given. `requirementTemplate` takes a template reference that receives each string as the implicit value and its position as the index, and replaces the plain text of the entry. Other projected content is added after the requirements, and content marked `hwServiceAction` renders in the `footer`. The `footer` is always rendered, and the stylesheet hides it while no action is projected. For facts laid out in a row, project the `hw-description-list` element of [DescriptionList](description-list.md) in its horizontal variant as default content; it renders after the requirements, not in place of the list of the `metadata` input.

## Accessibility

ServiceDetails renders an `article`. Its title is a second-level heading and the title of the requirements is a third-level heading, so the headings of the page stay in order when the article stands below a first-level heading. The component is not interactive as a whole: the action in the footer is the element that the application supplies, so its keyboard use, its focus and its name follow that element.

- The facts are a description list element, so each term and its description stand in one group of the list.
- The requirements are a list under their own heading, so assistive technology reports the number of entries. Write `requirementsLabel` as a phrase that names the list, such as "Requirements".
- Write the name of the action so that it includes the service where several services share a page; the component adds nothing to it.
- An entry that the application renders itself, such as a link, keeps its own name and focus behaviour.
- The component has no live region and does not announce changes to its content.

## RTL and localisation

ServiceDetails has no built-in text. The title, the description, the terms and the descriptions of the facts, the heading of the requirements, the requirements and the action are all written by the application in the language of the page. The article follows the page direction through logical properties, so its parts start at the reading start in Arabic and in English.

- Write the terms and the descriptions of the facts in the language of the article; the component does not translate or reorder them.
- A value such as a fee or a duration stays in the text of its `description`, so the application controls its numerals and units.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of ServiceDetails; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- ServiceDetails is listed among the platform patterns of the component scope in the [coverage notes](../coverage.md).