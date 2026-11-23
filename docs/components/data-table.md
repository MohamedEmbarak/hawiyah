# DataTable

DataTable is a native table whose column headers can sort the rows: it keeps the caption, the scoped headers and the scroll wrapper of Table, sets `aria-sort` on the sortable headers and sorts in the locale that the application supplies. It has no paging, no editing and no remote data.

## Example

A table lists the service requests of an applicant. The reference and the service columns are sortable, and each sort button is named by its column label. The first activation of a header sorts the rows in ascending order and the next one in descending order.

```html live example=basic static differences=data-table-adapter-markup,data-table-sort-indicator
<div class="hw-table-wrap hw-data-table" tabindex="0" role="region" aria-labelledby="basic-caption" data-hw="data-table" data-hw-locale="en">
  <table class="hw-table">
    <caption id="basic-caption">Service requests</caption>
    <thead>
      <tr>
        <th scope="col" data-hw-key="reference"><button class="hw-button" type="button" data-variant="ghost" data-size="md" data-hw-sort="reference">Reference<span class="hw-table-sort-icon" aria-hidden="true"></span></button></th>
        <th scope="col" data-hw-key="service"><button class="hw-button" type="button" data-variant="ghost" data-size="md" data-hw-sort="service">Service<span class="hw-table-sort-icon" aria-hidden="true"></span></button></th>
        <th scope="col">Status</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>REQ-1042</td><td>Copy of a document</td><td>Under review</td></tr>
      <tr><td>REQ-1043</td><td>Change of address</td><td>Completed</td></tr>
      <tr><td>REQ-1044</td><td>Update of a profile</td><td>Awaiting documents</td></tr>
    </tbody>
  </table>
</div>
```

```tsx live example=basic
<DataTable
  caption="Service requests"
  emptyMessage="No service requests."
  locale="en"
  columns={[
    { key: 'reference', label: 'Reference', sortable: true },
    { key: 'service', label: 'Service', sortable: true },
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
<DataTable
  caption="Service requests"
  empty-message="No service requests."
  locale="en"
  :columns="[
    { key: 'reference', label: 'Reference', sortable: true },
    { key: 'service', label: 'Service', sortable: true },
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
template: `<hw-data-table
  caption="Service requests"
  emptyMessage="No service requests."
  locale="en"
  [columns]="[
    { key: 'reference', label: 'Reference', sortable: true },
    { key: 'service', label: 'Service', sortable: true },
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

`variant="striped"` shades every second row of the body. The size `sm` lowers the cells; without `size` no `data-size` is written and the cells keep the default minimum height. `variant="bordered"` draws the borders of the cells; the examples of this page do not show it.

```html live example=striped static differences=data-table-adapter-markup,data-table-sort-indicator
<div class="hw-table-wrap hw-data-table" tabindex="0" role="region" aria-labelledby="striped-caption" data-hw="data-table" data-hw-locale="en">
  <table class="hw-table" data-variant="striped" data-size="sm">
    <caption id="striped-caption">Recent payments</caption>
    <thead>
      <tr>
        <th scope="col" data-hw-key="receipt"><button class="hw-button" type="button" data-variant="ghost" data-size="md" data-hw-sort="receipt">Receipt<span class="hw-table-sort-icon" aria-hidden="true"></span></button></th>
        <th scope="col">Description</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>RC-201</td><td>Fee for a copy of a document</td></tr>
      <tr><td>RC-202</td><td>Fee for a change of address</td></tr>
      <tr><td>RC-203</td><td>Fee for an update of a profile</td></tr>
    </tbody>
  </table>
</div>
```

```tsx live example=striped
<DataTable
  caption="Recent payments"
  emptyMessage="No payments."
  locale="en"
  variant="striped"
  size="sm"
  columns={[
    { key: 'receipt', label: 'Receipt', sortable: true },
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
<DataTable
  caption="Recent payments"
  empty-message="No payments."
  locale="en"
  variant="striped"
  size="sm"
  :columns="[
    { key: 'receipt', label: 'Receipt', sortable: true },
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
template: `<hw-data-table
  caption="Recent payments"
  emptyMessage="No payments."
  locale="en"
  variant="striped"
  size="sm"
  [columns]="[
    { key: 'receipt', label: 'Receipt', sortable: true },
    { key: 'description', label: 'Description' },
  ]"
  [rows]="[
    { receipt: 'RC-201', description: 'Fee for a copy of a document' },
    { receipt: 'RC-202', description: 'Fee for a change of address' },
    { receipt: 'RC-203', description: 'Fee for an update of a profile' },
  ]"
/>`
```

### Empty

When `rows` is empty, the table keeps its header and shows `emptyMessage` in one cell that spans all columns. The message tells the reader why there is nothing to show.

```html live example=empty static differences=data-table-adapter-markup,data-table-sort-indicator
<div class="hw-table-wrap hw-data-table" tabindex="0" role="region" aria-labelledby="empty-caption" data-hw="data-table" data-hw-locale="en">
  <table class="hw-table">
    <caption id="empty-caption">Open service requests</caption>
    <thead>
      <tr>
        <th scope="col" data-hw-key="reference"><button class="hw-button" type="button" data-variant="ghost" data-size="md" data-hw-sort="reference">Reference<span class="hw-table-sort-icon" aria-hidden="true"></span></button></th>
        <th scope="col">Service</th>
      </tr>
    </thead>
    <tbody><tr><td colspan="2">You have no open service requests.</td></tr></tbody>
  </table>
</div>
```

```tsx live example=empty
<DataTable
  caption="Open service requests"
  emptyMessage="You have no open service requests."
  locale="en"
  columns={[
    { key: 'reference', label: 'Reference', sortable: true },
    { key: 'service', label: 'Service' },
  ]}
  rows={[]}
/>
```

```vue live example=empty
<DataTable
  caption="Open service requests"
  empty-message="You have no open service requests."
  locale="en"
  :columns="[
    { key: 'reference', label: 'Reference', sortable: true },
    { key: 'service', label: 'Service' },
  ]"
  :rows="[]"
/>
```

```ts live example=empty framework=angular
template: `<hw-data-table
  caption="Open service requests"
  emptyMessage="You have no open service requests."
  locale="en"
  [columns]="[
    { key: 'reference', label: 'Reference', sortable: true },
    { key: 'service', label: 'Service' },
  ]"
  [rows]="[]"
/>`
```

## API

### JavaScript

Table: Options of createDataTable

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `locale` | `string` | `false` | — |
| `onSortKeyChange` | `(key: string) => void` | `false` | — |
| `onSortDirectionChange` | `(direction: 'ascending' \| 'descending') => void` | `false` | — |

`createDataTable(root, options)` takes a wrapper or a native `table` with a body. A header that can be sorted carries `data-hw-key` with the key of its column and holds a button with `data-hw-sort` set to the same key; the controller sets the scope of the header and an `aria-sort` that states no order on it. `locale` is required when a column is sortable, as a BCP 47 tag, and it can also be written as `data-hw-locale` on the root; without it the rows stay in source order. A column that holds numbers has `data-hw-type` set to `number` on its header, and a cell can state its sort value with `data-hw-sort-value`. The controller returns `sortKey`, `sortDirection`, `sort(key, direction)` and `destroy()`. Activating a sort button sorts ascending, and activating the same one again toggles the direction. The rows are reordered by moving the authored row nodes, so the markup of a row and its listeners are kept, and the sort is stable. `onSortKeyChange` is called when the key changes and `onSortDirectionChange` when the direction changes. The controller also dispatches `hw:change` with `sortKey` and `sortDirection` in its detail. Destroy the controller to restore the original row order.

### React

Table: Props of DataTable

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `variant` | `'default' \| 'striped' \| 'bordered'` | `false` | — |
| `size` | `'sm' \| 'md' \| 'lg'` | `false` | — |
| `data-variant` | `string` | `false` | — |
| `data-size` | `string` | `false` | — |
| `wrapperProps` | `HTMLAttributes<HTMLDivElement>` | `false` | — |
| `columns` | `readonly DataTableColumn<Row>[]` | `true` | — |
| `rows` | `readonly Row[]` | `true` | — |
| `caption` | `ReactNode` | `true` | — |
| `rowKey` | `(row: Row, index: number) => Key` | `false` | — |
| `sortKey` | `string` | `false` | — |
| `defaultSortKey` | `string` | `false` | — |
| `onSortKeyChange` | `(key: string) => void` | `false` | — |
| `sortDirection` | `'ascending' \| 'descending'` | `false` | — |
| `defaultSortDirection` | `'ascending' \| 'descending'` | `false` | — |
| `onSortDirectionChange` | `(direction: 'ascending' \| 'descending') => void` | `false` | — |
| `locale` | `string` | `true` | — |
| `emptyMessage` | `ReactNode` | `true` | — |
| `getSortLabel` | `(column: DataTableColumn<Row>, direction: 'ascending' \| 'descending') => string` | `false` | — |

`caption`, `columns`, `rows`, `locale` and `emptyMessage` are required. A column has a `key`, a `label`, and optionally `sortable`, `rowHeader` and a `cell` function that receives the row and its position; without `cell` the value is printed as text. The sort has two parts that are notified separately: use `sortKey` with `onSortKeyChange` and `sortDirection` with `onSortDirectionChange` for a controlled table, or `defaultSortKey` and `defaultSortDirection` for an uncontrolled one. An empty string as the key means unsorted, and the direction applied by default is `'ascending'`. Each callback is called only when its own value changes. The rows are sorted in a copy, so the array of the application is not changed. `locale` has no default: without it the rows stay in source order and a warning is logged in development. `getSortLabel` names a sort button and receives the direction that the button will apply; without it the button is named by the column label. `rowKey` returns the key of a row; without it the index of the row is the key. `variant` and `size` write `data-variant` and `data-size` on the table, and the other props reach the native table; `wrapperProps` reach the wrapper.

### Vue

Table: Props, events and slots of DataTable

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `variant` | prop | `'default' \| 'striped' \| 'bordered'` | `false` | — |
| `size` | prop | `'sm' \| 'md' \| 'lg'` | `false` | — |
| `wrapperProps` | prop | `Record<string, unknown>` | `false` | — |
| `emptyMessage` | prop | `string` | `true` | — |
| `columns` | prop | `readonly DataColumn[]` | `true` | — |
| `rows` | prop | `readonly Record<string, unknown>[]` | `true` | — |
| `caption` | prop | `string` | `true` | — |
| `sortKey` | prop | `string` | `false` | — |
| `defaultSortKey` | prop | `string` | `false` | `''` |
| `sortDirection` | prop | `'ascending' \| 'descending'` | `false` | — |
| `defaultSortDirection` | prop | `'ascending' \| 'descending'` | `false` | `'ascending'` |
| `locale` | prop | `string` | `true` | — |
| `rowKey` | prop | `(row: Record<string, unknown>, index: number) => string \| number` | `false` | — |
| `getSortLabel` | prop | `(column: DataColumn, direction: 'ascending' \| 'descending') => string` | `false` | — |
| `update:sortKey` | event | `(value: string) => void` | `false` | — |
| `update:sortDirection` | event | `(value: 'ascending' \| 'descending') => void` | `false` | — |
| `cell-<key>` | slot | — | `false` | — |

Bind the sort key and the sort direction with `v-model` for a controlled table, one binding for each; `defaultSortKey` and `defaultSortDirection` set the initial state, and each update event is emitted only when its value changed. `caption`, `columns`, `rows`, `locale` and `emptyMessage` are required. A column has a `key`, a `label` and optionally `sortable`, `rowHeader` and a `cell` function that receives the row and its position. A scoped slot named `cell-<key>` receives the row, its position and the column, and takes precedence over `cell`. Sorting is stable, uses the `locale` of the application and does not change the `rows` array; without `locale` the rows keep their source order. `getSortLabel` names a sort button and receives the direction that the button will apply; without it the column label names the button and `aria-sort` carries the state. `rowKey` returns the key of a row.

### Angular

Table: Inputs, outputs and content of hw-data-table

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `rowKey` | input | `(row: Row, index: number) => string \| number` | `false` | — |
| `caption` | input | `string` | `true` | — |
| `columns` | input | `readonly HwDataColumn<Row>[]` | `false` | `[]` |
| `rows` | input | `readonly Row[]` | `false` | `[]` |
| `locale` | input | `string` | `true` | — |
| `emptyMessage` | input | `string` | `true` | — |
| `sortKey` | input | `string` | `false` | `''` |
| `sortDirection` | input | `'ascending' \| 'descending'` | `false` | `'ascending'` |
| `variant` | input | `'default' \| 'striped' \| 'bordered'` | `false` | — |
| `size` | input | `'sm' \| 'md' \| 'lg'` | `false` | — |
| `getSortLabel` | input | `(column: HwDataColumn<Row>, direction: 'ascending' \| 'descending') => string` | `false` | — |
| `sortKeyChange` | output | `string` | `false` | — |
| `sortDirectionChange` | output | `'ascending' \| 'descending'` | `false` | — |

`HwDataTableComponent` applies to `hw-data-table`. Bind `[(sortKey)]` and `[(sortDirection)]`; values written once are the initial state. Activating a sortable header emits `sortKeyChange` when the key changed and then `sortDirectionChange` when the direction changed. A column has a `key`, a `label` and optionally `sortable`, `rowHeader` and `cell`, a template whose context holds the row as the implicit value, its position and the column; it renders inside the `td`, or inside the `th` of a row header, and without it the value is text. `locale` is required and has no default, because the rows are sorted with a collator. `getSortLabel` names a sort button and receives the direction that the button will apply. `aria-label`, `aria-labelledby` and `aria-describedby` written on `hw-data-table` reach the table.

## Accessibility

DataTable is a native `table`, so the browser provides its roles and its table navigation for assistive technology. The `caption` is the visible name of the table and, through `aria-labelledby`, the name of the wrapper, which is a focusable region.

- A sortable header is a `th` with a scope of col whose `aria-sort` states the order of the column or that it is unsorted, and the sort button is a native `button` inside it. The packaged styles colour a header whose `aria-sort` is `ascending` or `descending`. In React, Vue and Angular the sort button holds an `hw-icon` whose `data-icon` the adapter chooses from its sort state; in markup for the JavaScript controller, a `hw-table-sort-icon` span inside the button draws the arrow from `aria-sort`. The arrow is hidden from assistive technology, so `aria-sort` carries the meaning.
- Without `getSortLabel` the accessible name of a sort button is the column label. With it, the name states the order that activation will apply.
- The empty row is one cell that spans all columns, so the message is read in the place of the data.
- Sorting moves no focus, so focus stays on the button that was activated.
- Sorting changes the order of the rows only; it adds no selection and no editing, and loading, paging and filtering remain behaviour of the application.

Table: Keyboard interaction of DataTable

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves focus to the next focusable element in the order of the page: the wrapper of the table, then each sort button. |
| <kbd>Enter</kbd>, <kbd>Space</kbd> | Activates the focused sort button, which sorts the rows by its column. |

DataTable defines no other keys. The sort buttons are native buttons, so the keys follow the browser.

## RTL and localisation

DataTable has no built-in text: the caption, the column labels, the cell values, `emptyMessage` and the sort labels are written by the application in the language of the page. The table inherits the language and the direction of the page, and the native table places the first column at the reading start, so in a right-to-left page it is on the right. The packaged styles use logical properties for padding, borders and alignment.

- `locale` is a BCP 47 language tag that the application supplies, and the rows are sorted with a collator for it. There is no default: the order of Arabic text depends on the tag the application passes, for example ar or ar-SA.
- The vanilla controller sorts the text of a cell, or its `data-hw-sort-value`, and sorts numbers for a header marked as numeric after it reads Arabic-Indic digits as digits. The framework adapters sort the value of the row for the key.
- Dates, currency and numbers in a cell are formatted by the application for the locale of the page; the component does not format a value.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of DataTable; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The border, the radius, the header and the cell spacing of the supplied Platforms Code style sheet are mapped in the [table notes](../nic-tables.md), which also cover DataTable.
- The sorting behaviour and the sort arrow are Hawiyah extensions; the [table notes](../nic-tables.md) record them as such.
