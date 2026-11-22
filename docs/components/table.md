# Table

Table presents data in rows and columns with native table semantics: a caption that names it, scoped column headers and an optional row header, inside a focusable wrapper that scrolls horizontally when the table is wider than its container. Filtering, sorting, pagination and fetching remain behaviour of the application.

## Example

A table lists the service requests of an applicant. The caption names the table and also names the scroll wrapper, the first column is the row header of each row, and, in the components, the application passes the columns and the rows as data.

```html live example=basic
<div class="hw-table-wrap" tabindex="0" role="region" aria-labelledby="basic-caption">
  <table class="hw-table">
    <caption id="basic-caption">Service requests</caption>
    <thead><tr><th scope="col">Reference</th><th scope="col">Service</th><th scope="col">Status</th></tr></thead>
    <tbody>
      <tr><th scope="row">REQ-1042</th><td>Copy of a document</td><td>Under review</td></tr>
      <tr><th scope="row">REQ-1043</th><td>Change of address</td><td>Completed</td></tr>
      <tr><th scope="row">REQ-1044</th><td>Update of a profile</td><td>Awaiting documents</td></tr>
    </tbody>
  </table>
</div>
```

```tsx live example=basic
<Table
  caption="Service requests"
  emptyMessage="No service requests."
  columns={[
    { key: 'reference', label: 'Reference', rowHeader: true },
    { key: 'service', label: 'Service' },
    { key: 'status', label: 'Status' },
  ]}
  rows={[
    { reference: 'REQ-1042', service: 'Copy of a document', status: 'Under review' },
    { reference: 'REQ-1043', service: 'Change of address', status: 'Completed' },
    { reference: 'REQ-1044', service: 'Update of a profile', status: 'Awaiting documents' },
  ]}
/>
```

```vue live example=basic
<Table
  caption="Service requests"
  empty-message="No service requests."
  :columns="[
    { key: 'reference', label: 'Reference', rowHeader: true },
    { key: 'service', label: 'Service' },
    { key: 'status', label: 'Status' },
  ]"
  :rows="[
    { reference: 'REQ-1042', service: 'Copy of a document', status: 'Under review' },
    { reference: 'REQ-1043', service: 'Change of address', status: 'Completed' },
    { reference: 'REQ-1044', service: 'Update of a profile', status: 'Awaiting documents' },
  ]"
/>
```

```ts live example=basic framework=angular
template: `<hw-table
  caption="Service requests"
  emptyMessage="No service requests."
  [columns]="[
    { key: 'reference', label: 'Reference', rowHeader: true },
    { key: 'service', label: 'Service' },
    { key: 'status', label: 'Status' },
  ]"
  [rows]="[
    { reference: 'REQ-1042', service: 'Copy of a document', status: 'Under review' },
    { reference: 'REQ-1043', service: 'Change of address', status: 'Completed' },
    { reference: 'REQ-1044', service: 'Update of a profile', status: 'Awaiting documents' },
  ]"
/>`
```

## Variants and states

### Striped

`variant="striped"` shades every second row of the body. The size `sm` sets the minimum height of a cell to 40 px and lowers the text of the cells; the default minimum is 48 px.

```html live example=striped
<div class="hw-table-wrap" tabindex="0" role="region" aria-labelledby="striped-caption">
  <table class="hw-table" data-variant="striped" data-size="sm">
    <caption id="striped-caption">Recent payments</caption>
    <thead><tr><th scope="col">Receipt</th><th scope="col">Description</th></tr></thead>
    <tbody>
      <tr><th scope="row">RC-201</th><td>Fee for a copy of a document</td></tr>
      <tr><th scope="row">RC-202</th><td>Fee for a change of address</td></tr>
      <tr><th scope="row">RC-203</th><td>Fee for an update of a profile</td></tr>
    </tbody>
  </table>
</div>
```

```tsx live example=striped
<Table
  caption="Recent payments"
  emptyMessage="No payments."
  variant="striped"
  size="sm"
  columns={[
    { key: 'receipt', label: 'Receipt', rowHeader: true },
    { key: 'description', label: 'Description' },
  ]}
  rows={[
    { receipt: 'RC-201', description: 'Fee for a copy of a document' },
    { receipt: 'RC-202', description: 'Fee for a change of address' },
    { receipt: 'RC-203', description: 'Fee for an update of a profile' },
  ]}
/>
```

```vue live example=striped
<Table
  caption="Recent payments"
  empty-message="No payments."
  variant="striped"
  size="sm"
  :columns="[
    { key: 'receipt', label: 'Receipt', rowHeader: true },
    { key: 'description', label: 'Description' },
  ]"
  :rows="[
    { receipt: 'RC-201', description: 'Fee for a copy of a document' },
    { receipt: 'RC-202', description: 'Fee for a change of address' },
    { receipt: 'RC-203', description: 'Fee for an update of a profile' },
  ]"
/>
```

```ts live example=striped framework=angular
template: `<hw-table
  caption="Recent payments"
  emptyMessage="No payments."
  variant="striped"
  size="sm"
  [columns]="[
    { key: 'receipt', label: 'Receipt', rowHeader: true },
    { key: 'description', label: 'Description' },
  ]"
  [rows]="[
    { receipt: 'RC-201', description: 'Fee for a copy of a document' },
    { receipt: 'RC-202', description: 'Fee for a change of address' },
    { receipt: 'RC-203', description: 'Fee for an update of a profile' },
  ]"
/>`
```

### Bordered

`variant="bordered"` draws a border between the columns. The size `lg` sets the minimum height of a cell to 56 px and the padding of the cells to a larger step.

```html live example=bordered
<div class="hw-table-wrap" tabindex="0" role="region" aria-labelledby="bordered-caption">
  <table class="hw-table" data-variant="bordered" data-size="lg">
    <caption id="bordered-caption">Documents on record</caption>
    <thead><tr><th scope="col">Document</th><th scope="col">Issued</th></tr></thead>
    <tbody>
      <tr><th scope="row">Birth certificate</th><td>12 March 2019</td></tr>
      <tr><th scope="row">Residence record</th><td>4 June 2023</td></tr>
    </tbody>
  </table>
</div>
```

```tsx live example=bordered
<Table
  caption="Documents on record"
  emptyMessage="No documents on record."
  variant="bordered"
  size="lg"
  columns={[
    { key: 'document', label: 'Document', rowHeader: true },
    { key: 'issued', label: 'Issued' },
  ]}
  rows={[
    { document: 'Birth certificate', issued: '12 March 2019' },
    { document: 'Residence record', issued: '4 June 2023' },
  ]}
/>
```

```vue live example=bordered
<Table
  caption="Documents on record"
  empty-message="No documents on record."
  variant="bordered"
  size="lg"
  :columns="[
    { key: 'document', label: 'Document', rowHeader: true },
    { key: 'issued', label: 'Issued' },
  ]"
  :rows="[
    { document: 'Birth certificate', issued: '12 March 2019' },
    { document: 'Residence record', issued: '4 June 2023' },
  ]"
/>
```

```ts live example=bordered framework=angular
template: `<hw-table
  caption="Documents on record"
  emptyMessage="No documents on record."
  variant="bordered"
  size="lg"
  [columns]="[
    { key: 'document', label: 'Document', rowHeader: true },
    { key: 'issued', label: 'Issued' },
  ]"
  [rows]="[
    { document: 'Birth certificate', issued: '12 March 2019' },
    { document: 'Residence record', issued: '4 June 2023' },
  ]"
/>`
```

### Empty

When `rows` is empty, the table keeps its header and shows `emptyMessage` in one cell that spans all columns. The message tells the reader why there is nothing to show.

```html live example=empty
<div class="hw-table-wrap" tabindex="0" role="region" aria-labelledby="empty-caption">
  <table class="hw-table">
    <caption id="empty-caption">Open service requests</caption>
    <thead><tr><th scope="col">Reference</th><th scope="col">Service</th></tr></thead>
    <tbody><tr><td colspan="2">You have no open service requests.</td></tr></tbody>
  </table>
</div>
```

```tsx live example=empty
<Table
  caption="Open service requests"
  emptyMessage="You have no open service requests."
  columns={[
    { key: 'reference', label: 'Reference' },
    { key: 'service', label: 'Service' },
  ]}
  rows={[]}
/>
```

```vue live example=empty
<Table
  caption="Open service requests"
  empty-message="You have no open service requests."
  :columns="[
    { key: 'reference', label: 'Reference' },
    { key: 'service', label: 'Service' },
  ]"
  :rows="[]"
/>
```

```ts live example=empty framework=angular
template: `<hw-table
  caption="Open service requests"
  emptyMessage="You have no open service requests."
  [columns]="[
    { key: 'reference', label: 'Reference' },
    { key: 'service', label: 'Service' },
  ]"
  [rows]="[]"
/>`
```

## API

### JavaScript

Table: Attributes of the hw-table-wrap and hw-table elements

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-table-wrap' \| 'hw-table'` | `true` | — |
| `data-numeric` | `boolean` | `false` | — |
| `data-variant` | `'bordered' \| 'striped'` | `false` | — |
| `data-size` | `'lg' \| 'sm'` | `false` | — |

Table has no JavaScript controller. The markup is the API: write a native `table` with the class `hw-table` inside a `div` with the class `hw-table-wrap`. The wrapper needs `tabindex` set to zero so that a keyboard user can scroll it, `role="region"`, and an `aria-labelledby` that names the `id` of the `caption`, which is the visible name of the table. Give every column header a scope of col and the header cell of a row a scope of row. `data-variant` selects the striped or bordered appearance and `data-size` takes `sm` or `lg`; both are written on the `table`, and without them the table is plain and medium. `data-numeric` is a presence attribute for a cell that holds a number; it aligns the cell to the end and uses tabular figures. A sortable header is written by the application: place a `span` with the class `hw-table-sort-icon` and `aria-hidden="true"` inside the header button, and write `aria-sort` on the `th`, which the icon follows.

### React

Table: Props of Table

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `variant` | `'default' \| 'striped' \| 'bordered'` | `false` | — |
| `size` | `'sm' \| 'md' \| 'lg'` | `false` | — |
| `data-variant` | `string` | `false` | — |
| `data-size` | `string` | `false` | — |
| `rows` | `readonly Row[]` | `false` | `[]` |
| `rowKey` | `(row: Row, index: number) => Key` | `false` | — |
| `caption` | `ReactNode` | `false` | — |
| `children` | `ReactNode` | `false` | — |
| `wrapperProps` | `HTMLAttributes<HTMLDivElement>` | `false` | — |
| `columns` | `readonly TableColumn<Row>[]` | `false` | — |
| `emptyMessage` | `ReactNode` | `false` | — |

Table works in one of two ways. With `columns` and `rows` it renders the header, the body and an empty row itself; without `columns` it renders its `children`, so write a native `thead` and `tbody` inside it. A `TableColumn` has `key`, which names the field of the row, `label`, `rowHeader`, which makes the cell of that column a row header, and `cell`, an optional function that receives the row and its index, in that order, and returns the content; without `cell`, the value of the field is printed as text. `rowKey` returns the React key of a row and is the index of the row unless given. While `columns` is given, `emptyMessage` is required, and it is shown in one cell that spans the columns when `rows` is empty. `caption` is the visible name: the wrapper is a region named by the caption only while a caption is given, and it is focusable either way. `wrapperProps` reach the wrapper `div`, and the other props reach the `table`. `variant` and `size` write `data-variant` and `data-size`; `data-variant` and `data-size` themselves are accepted as native attributes.

### Vue

Table: Props, events and slots of Table

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `columns` | prop | `readonly TableColumn[]` | `false` | — |
| `rows` | prop | `readonly Record<string, unknown>[]` | `false` | — |
| `caption` | prop | `string` | `false` | — |
| `variant` | prop | `'default' \| 'striped' \| 'bordered'` | `false` | — |
| `size` | prop | `'sm' \| 'md' \| 'lg'` | `false` | — |
| `emptyMessage` | prop | `string` | `false` | — |
| `wrapperProps` | prop | `Record<string, unknown>` | `false` | — |
| `rowKey` | prop | `(row: Record<string, unknown>, index: number) => string \| number` | `false` | — |
| `default` | slot | — | `false` | — |
| `cell-<key>` | slot | — | `false` | — |

With `columns` the component renders the header, the body and an empty row; without `columns` it renders the `default` slot, so write a native `thead` and `tbody` there. A `TableColumn` has `key`, `label`, `rowHeader` and an optional `cell` function that receives the row and its index. A column without `cell` and without a slot prints the value as text, and nothing for `null` or `undefined`. The scoped slot `cell-<key>`, where `<key>` is the key of the column, receives the row, its index and the column, and it wins over `cell`. `rows` is an empty array and `rowKey` is the index of the row unless given, and neither has a literal default in the table. `emptyMessage` is required while `columns` is given. The wrapper is a region named by the caption only while `caption` is given. `wrapperProps` reach the wrapper `div`. The table lists the slots because the published build reads them; the declaration types none.

### Angular

Table: Inputs, outputs and content of hw-table

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `caption` | input | `string` | `false` | `''` |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `columns` | input | `readonly HwTableColumn<Row>[]` | `false` | `[]` |
| `rows` | input | `readonly Row[]` | `false` | `[]` |
| `rowKey` | input | `(row: Row, index: number) => string \| number` | `false` | — |
| `variant` | input | `'default' \| 'striped' \| 'bordered'` | `false` | — |
| `size` | input | `'sm' \| 'md' \| 'lg'` | `false` | — |
| `emptyMessage` | input | `string` | `true` | — |

`HwTableComponent` (`hw-table`) renders the table from `columns` and `rows`. It needs a `caption`, or `aria-label` or `aria-labelledby` written on `hw-table`; both reach the table. With a caption the wrapper is a region named by it, and without one the wrapper has neither the role nor the attribute. A column has `key`, `label`, `rowHeader` and an optional `cell`, which is a template reference rendered inside the cell, with the row, its index and the column as its context. A column without `cell` prints the value as text. `rowKey` tracks the rows and is the index of the row unless given. `emptyMessage` is required. `hw-table` ignores a projected `thead` or `tbody`: a table with rows written by hand is a native table with the classes `hw-table-wrap` and `hw-table`. A row type must be assignable to a record of unknown values, so declare it as a type alias and not as an interface.

## Accessibility

Table is a native `table`, so the browser provides its roles and its table navigation for assistive technology. The `caption` is the visible name of the table. Column headers are `th` elements with a scope of col, and a column with `rowHeader` produces a `th` with a scope of row for each row, so a cell is announced together with its headers.

- The scroll wrapper is a region named by the caption through `aria-labelledby`, and it is focusable through `tabindex`, so a keyboard user can scroll a table that is wider than its container with the arrow keys of the browser. The stylesheet draws a focus indicator on the wrapper.
- Without a caption, the wrapper of the components is not a region and has no name. Write a caption, or in Angular `aria-label` or `aria-labelledby` on `hw-table`.
- The empty row is one cell that spans all columns, so the message is read in the place of the data.
- Colour and shading, as in the striped and bordered variants, are decoration: the structure of the table does not depend on them.
- The rows highlight on hover in the stylesheet, and the table adds no selection and no sorting. A table with such behaviour is written by the application, with `aria-sort` on a sortable header; for sorting, the packages also offer DataTable. `aria-selected` on a row is supported by WAI-ARIA only in a grid or a tree grid, not in a native table, so a selectable table needs that structure.

## RTL and localisation

Table has no built-in text: the caption, the column labels, the cell values and `emptyMessage` are written by the application in the language of the page. The table inherits the language and the direction of the page, and the native table runs its columns from the start of the line, while the packaged styles use logical properties so that the cells align to the start. In a right-to-left page the first column is on the right and the scroll starts at the right edge.

- A numeric cell with `data-numeric` aligns to the end and uses tabular figures, so figures line up in both directions.
- Dates, currency and numbers in a cell are formatted by the application for the locale of the page; the component does not format a value.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Table; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The border, the radius, the header and the cell spacing of the supplied Platforms Code style sheet are mapped in the [table notes](../nic-tables.md), with the confidence of each mapping and the adaptations that Hawiyah makes.
- The striped and bordered variants, the sizes and the sorting icon are Hawiyah extensions; the [table notes](../nic-tables.md) record them as such.
