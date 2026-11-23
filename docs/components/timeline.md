# Timeline

Timeline lists events or stages in order as an ordered list. Each item has a title and an optional date, description and state of complete, current or upcoming.

## Example

The label names the list. Each item has a title, and the current item is marked for assistive technology. A date is shown with its machine-readable value.

```html live example=basic
<ol class="hw-timeline" aria-label="Progress of your request">
  <li class="hw-timeline-item" data-state="complete"><h3>Request submitted</h3><time datetime="2026-03-02">2 March 2026</time><p>The request was received.</p></li>
  <li class="hw-timeline-item" data-state="current" aria-current="step"><h3>Under review</h3><time datetime="2026-03-04">4 March 2026</time><p>The documents are being checked.</p></li>
  <li class="hw-timeline-item"><h3>Decision</h3></li>
</ol>
```

```tsx live example=basic
<Timeline
  label="Progress of your request"
  items={[
    { id: 'submitted', title: 'Request submitted', dateTime: '2026-03-02', dateLabel: '2 March 2026', description: 'The request was received.', status: 'complete' },
    { id: 'review', title: 'Under review', dateTime: '2026-03-04', dateLabel: '4 March 2026', description: 'The documents are being checked.', status: 'current' },
    { id: 'decision', title: 'Decision' },
  ]}
/>
```

```vue live example=basic
<Timeline
  label="Progress of your request"
  :items="[
    { id: 'submitted', title: 'Request submitted', dateTime: '2026-03-02', dateLabel: '2 March 2026', description: 'The request was received.', status: 'complete' },
    { id: 'review', title: 'Under review', dateTime: '2026-03-04', dateLabel: '4 March 2026', description: 'The documents are being checked.', status: 'current' },
    { id: 'decision', title: 'Decision' },
  ]"
/>
```

```ts live example=basic framework=angular
template: `<hw-timeline
  label="Progress of your request"
  [items]="[
    { id: 'submitted', title: 'Request submitted', dateTime: '2026-03-02', dateLabel: '2 March 2026', description: 'The request was received.', status: 'complete' },
    { id: 'review', title: 'Under review', dateTime: '2026-03-04', dateLabel: '4 March 2026', description: 'The documents are being checked.', status: 'current' },
    { id: 'decision', title: 'Decision' },
  ]"
/>`
```

## Variants and states

### Stages without dates

An item needs no date or description. Here no item is current, so only the marker shows that two steps are complete, and the marker reaches sighted readers only. Assistive technology reads the titles in order; when a reader must know which steps are done, say so in the title or the description, or mark the current item.

```html live example=stages
<ol class="hw-timeline" aria-label="Steps of an application">
  <li class="hw-timeline-item" data-state="complete"><h3>Fill in the form</h3></li>
  <li class="hw-timeline-item" data-state="complete"><h3>Attach documents</h3></li>
  <li class="hw-timeline-item"><h3>Confirm and submit</h3></li>
</ol>
```

```tsx live example=stages
<Timeline
  label="Steps of an application"
  items={[
    { id: 'form', title: 'Fill in the form', status: 'complete' },
    { id: 'documents', title: 'Attach documents', status: 'complete' },
    { id: 'confirm', title: 'Confirm and submit' },
  ]}
/>
```

```vue live example=stages
<Timeline
  label="Steps of an application"
  :items="[
    { id: 'form', title: 'Fill in the form', status: 'complete' },
    { id: 'documents', title: 'Attach documents', status: 'complete' },
    { id: 'confirm', title: 'Confirm and submit' },
  ]"
/>
```

```ts live example=stages framework=angular
template: `<hw-timeline
  label="Steps of an application"
  [items]="[
    { id: 'form', title: 'Fill in the form', status: 'complete' },
    { id: 'documents', title: 'Attach documents', status: 'complete' },
    { id: 'confirm', title: 'Confirm and submit' },
  ]"
/>`
```

## API

### JavaScript

Table: Attributes of the hw-timeline element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-timeline'` | `true` | — |

Timeline has no JavaScript controller. The markup is the API: write an `ol` with the class `hw-timeline` and one `li` with the class `hw-timeline-item` for each item. The item holds a third-level heading with the title, an optional `time` element whose datetime attribute is the machine-readable date and whose text is the visible date, and an optional paragraph with the description. `data-state` takes complete, current or upcoming, and the current item also carries `aria-current="step"`. Name the list with `aria-label` or `aria-labelledby` on the `ol`; the stylesheet styles the direct list items.

### React

Table: Props of Timeline

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `items` | `readonly TimelineItem[]` | `true` | — |
| `label` | `string` | `false` | — |

`items` is required. Each `TimelineItem` has a required `id` and `title` and the optional `description`, `dateTime`, `dateLabel` and `status`. `status` is complete, current or upcoming; it is written as `data-state` on the item, and the current item also has `aria-current="step"`. `dateLabel` is the visible date and `dateTime` is its machine-readable value; an item with `dateTime` and without `dateLabel` renders no date. `description` renders in a paragraph, so it must be phrasing content. `label` names the list; without it, write `aria-label` or `aria-labelledby`. `id` keys the items.

### Vue

Table: Props, events and slots of Timeline

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `items` | prop | `readonly TimelineItem[]` | `true` | — |
| `label` | prop | `string` | `false` | — |
| `<id>` | slot | — | `false` | — |

`items` is required, and `label` names the list. Each `TimelineItem` has a required `id` and `title` and the optional `description`, `dateTime`, `dateLabel` and `status` of complete, current or upcoming; `status` is written as `data-state`, and the current item has `aria-current="step"`. An item with `dateTime` and without `dateLabel` renders no date. A slot named by the `id` of an item adds its content at the end of that item, after the description; the slot receives the item as its item property. The other attributes reach the `ol` element. The table lists the slot as `<id>` because its name is computed from the items; the declaration types no slot.

### Angular

Table: Inputs, outputs and content of hw-timeline

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `label` | input | `string` | `false` | `''` |
| `items` | input | `readonly HwTimelineItem[]` | `false` | `[]` |

`HwTimelineComponent` applies to `hw-timeline`. `items` is a list of `HwTimelineItem` with a required `id` and `title` and the optional `description`, `dateTime`, `dateLabel` and `status`; the `id` keys the items. `status` is written as `data-state`, and the current item has `aria-current="step"`. An item with `dateTime` and without `dateLabel` renders no date. The list is named by `label`, or by `aria-label` or `aria-labelledby` written on `hw-timeline`; `aria-describedby` is forwarded to the list as well.

## Accessibility

Timeline renders an ordered list element, so assistive technology reports the number of items and the position of each. The title of each item is a third-level heading, so place a timeline below a second-level heading of the page to keep the heading order.

- The list needs a name: `label`, `aria-label` or `aria-labelledby`. The accessible name states what the sequence describes, such as the progress of a request.
- The current item carries `aria-current="step"`. The states complete and upcoming are written as `data-state` and have no text or ARIA attribute of their own, so state the stage in the title or the description, in words, and do not rely on the marker alone.
- The marker of each item is drawn by the stylesheet and carries no text. Its colour and size show the state to a sighted reader only.
- A date is a native `time` element with a datetime attribute, shown only when `dateLabel` is given.
- Timeline is not interactive: it has no focusable element and no keyboard behaviour of its own.

## RTL and localisation

Timeline has no built-in text. The label, the titles, the descriptions and the visible dates are written by the application in the language of the page. The list follows the page direction through logical properties: the marker and the connecting line stand at the reading start, in Arabic and in English.

- `dateLabel` is text written by the application, so it controls the language, the calendar and the numerals of the visible date; `dateTime` stays a machine-readable value in the formats of HTML.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Timeline; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- Timeline is listed among the additional content components of the component scope in the [coverage notes](../coverage.md).