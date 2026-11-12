// Type fixture for react.disclosure-data.test.tsx. It is compiled, never run: every element marked
// with @ts-expect-error must be rejected by the compiler (an unused marker is itself an error),
// and every unmarked element must compile.
import { Calendar, DataTable, Stepper, Table } from '../src/index.js';

type Row = { id: string; name: string };
const rows: Row[] = [{ id: 'a', name: 'Alpha' }];
const calendarTexts = { locale: 'en-GB', label: 'Date', previousLabel: 'Previous', nextLabel: 'Next' };
const steps = [{ value: 'one', label: 'One' }];

export const accepted = <>
  <Table<Row> emptyMessage="None" rows={rows} columns={[{ key: 'name', label: 'Name' }, { key: 'id', label: 'Id', cell: row => row.id }]} />
  <DataTable<Row> caption="Rows" emptyMessage="None" locale="en" rows={rows} columns={[{ key: 'name', label: 'Name', sortable: true, cell: (row, index) => `${index} ${row.name}` }]} sortKey="name" sortDirection="descending" onSortKeyChange={key => key} onSortDirectionChange={direction => direction} />
  <DataTable<Row> caption="Rows" emptyMessage="None" locale="en" rows={rows} columns={[{ key: 'name', label: 'Name' }]} defaultSortKey="name" defaultSortDirection="ascending" />
  <Calendar {...calendarTexts} />
  <Calendar {...calendarTexts} calendar="islamic-umalqura" rangeLabel="Range" unsupportedMessage="Not shown" />
  <Stepper label="Progress" items={steps} completeLabel="Complete" upcomingLabel="Upcoming" />
</>;

export const rejected = <>
  {/* @ts-expect-error TableColumn.header is renamed to label */}
  <Table<Row> emptyMessage="None" rows={rows} columns={[{ key: 'name', header: 'Name' }]} />
  {/* @ts-expect-error DataTableColumn.render is replaced by cell(row, index) */}
  <DataTable<Row> caption="Rows" emptyMessage="None" locale="en" rows={rows} columns={[{ key: 'name', label: 'Name', render: (value: unknown) => String(value) }]} />
  {/* @ts-expect-error sort is replaced by sortKey and sortDirection */}
  <DataTable<Row> caption="Rows" emptyMessage="None" locale="en" rows={rows} columns={[{ key: 'name', label: 'Name' }]} sort={{ key: 'name', direction: 'ascending' }} />
  {/* @ts-expect-error defaultSort is replaced by defaultSortKey and defaultSortDirection */}
  <DataTable<Row> caption="Rows" emptyMessage="None" locale="en" rows={rows} columns={[{ key: 'name', label: 'Name' }]} defaultSort={{ key: 'name', direction: 'ascending' }} />
  {/* @ts-expect-error onSortChange is replaced by onSortKeyChange and onSortDirectionChange */}
  <DataTable<Row> caption="Rows" emptyMessage="None" locale="en" rows={rows} columns={[{ key: 'name', label: 'Name' }]} onSortChange={() => undefined} />
  {/* @ts-expect-error unsupportedMessage is required with the Umm al-Qura calendar */}
  <Calendar {...calendarTexts} calendar="islamic-umalqura" rangeLabel="Range" />
  {/* @ts-expect-error completeLabel and upcomingLabel are required */}
  <Stepper label="Progress" items={steps} />
</>;
