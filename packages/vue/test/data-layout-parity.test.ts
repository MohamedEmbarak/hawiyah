// Table, DataTable and PageHeader cases shared by the adapters (milestone 3: disclosure-data-13, disclosure-data-15, layout-3).
import { afterEach, beforeEach, expect, expectTypeOf, it, vi } from 'vitest';
import { createApp, createSSRApp, defineComponent, h, nextTick, ref, type App } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { resetTextWarnings } from '@hawiyah/core';
import { Table, type TableColumn } from '../src/display.js';
import { DataTable, type DataColumn } from '../src/content.js';
import { AppShell, PageHeader } from '../src/layout.js';

let app: App | undefined;
let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => { resetTextWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
afterEach(() => { app?.unmount(); app = undefined; document.body.replaceChildren(); warn.mockRestore(); });
const warnings = () => (warn.mock.calls as unknown[][]).map(call => String(call[0])).filter(message => message.startsWith('Hawiyah:'));
function mount(render: () => ReturnType<typeof h>) {
  const host = document.createElement('div'); document.body.append(host);
  app = createApp(defineComponent(() => render)); app.mount(host); return host;
}
async function hydrates(render: () => ReturnType<typeof h>) {
  const html = await renderToString(createSSRApp(defineComponent(() => render)));
  const host = document.createElement('div'); host.innerHTML = html; document.body.append(host);
  const server = host.innerHTML;
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  app = createSSRApp(defineComponent(() => render)); app.mount(host); await nextTick();
  const mismatches = [...warn.mock.calls, ...errors.mock.calls].map(call => String(call[0])).filter(message => /hydration/i.test(message));
  errors.mockRestore();
  return { host, server, mismatches };
}
// The fixture shared with React and Angular.
const columns = [{ key: 'name', label: 'Service', rowHeader: true }, { key: 'status', label: 'Status' }] as const;
const rows = [{ id: 'a', name: 'Passport', status: 'Open' }, { id: 'b', name: 'Visa', status: null }, { id: 'c', name: 'Licence' }];

it('[RICH-01][disclosure-data-13] Table: a cell slot or a column cell renders inside td or th[scope=row]', () => {
  const host = mount(() => h(Table, { caption: 'Services', emptyMessage: 'None', rows, columns: [...columns, { key: 'link', label: 'Link', cell: (row: Record<string, unknown>) => h('a', { href: `/${row.id}` }, 'Open') }] }, {
    'cell-name': ({ row, column }: { row: Record<string, unknown>; column: TableColumn }) => h('a', { href: `#${row.id}`, 'data-column': column.key }, String(row.name)),
  }));
  const first = host.querySelector('tbody tr')!;
  expect(first.querySelector('th[scope=row] > a')!.getAttribute('data-column')).toBe('name');
  expect(first.querySelector('td > a[href="/a"]')).not.toBeNull();
});

it('[RICH-02][SHAPE-01] Table: without cell the value is text, null and undefined print nothing; the shared fixture renders the same text', () => {
  const host = mount(() => h(Table, { caption: 'Services', emptyMessage: 'None', rows, columns: [...columns] }));
  expect([...host.querySelectorAll('thead th')].map(cell => cell.textContent)).toEqual(['Service', 'Status']);
  expect([...host.querySelectorAll('tbody tr')].map(row => [...row.children].map(cell => cell.textContent))).toEqual([['Passport', 'Open'], ['Visa', ''], ['Licence', '']]);
});

it('[TABLE-01] Table: rowKey reuses the same tr elements after a reorder', async () => {
  const list = ref([...rows]);
  const host = mount(() => h(Table, { caption: 'Services', emptyMessage: 'None', rows: list.value, columns: [...columns], rowKey: (row: Record<string, unknown>) => String(row.id) }));
  const before = [...host.querySelectorAll('tbody tr')];
  list.value = [...list.value].reverse(); await nextTick();
  expect([...host.querySelectorAll('tbody tr')]).toEqual([...before].reverse());
});

it('[TABLE-02] Table: the wrapper is a region named by the caption only while a caption is given', async () => {
  const caption = ref<string | undefined>('Services');
  const host = mount(() => h(Table, { caption: caption.value, emptyMessage: 'None', rows, columns: [...columns] }));
  const wrapper = host.querySelector('div.hw-table-wrap[tabindex="0"]')!;
  expect(wrapper.getAttribute('role')).toBe('region');
  expect(wrapper.getAttribute('aria-labelledby')).toBe(host.querySelector('caption')!.id);
  caption.value = undefined; await nextTick();
  expect(wrapper.hasAttribute('role')).toBe(false); expect(wrapper.hasAttribute('aria-labelledby')).toBe(false); expect(host.querySelector('caption')).toBeNull();
});

it('[SHAPE-03][RENAME-02] TableColumn and DataColumn take `label`; TableColumn has no `header`', () => {
  expectTypeOf<TableColumn>().toHaveProperty('label');
  expectTypeOf<TableColumn>().not.toHaveProperty('header');
  expectTypeOf<DataColumn>().toHaveProperty('cell');
  // @ts-expect-error `header` was renamed to `label`.
  const old: TableColumn = { key: 'name', header: 'Service' };
  expect(old.key).toBe('name');
});

it('[RICH-04] Table: server HTML with a cell slot equals the first client render', async () => {
  const { server, host, mismatches } = await hydrates(() => h(Table, { caption: 'Services', emptyMessage: 'None', rows, columns: [...columns] }, { 'cell-status': ({ row }: { row: Record<string, unknown> }) => h('strong', {}, String(row.status ?? '-')) }));
  expect(mismatches).toEqual([]); expect(host.innerHTML).toBe(server); expect(server).toContain('<strong>Open</strong>');
});

const dataTable = (props: Record<string, unknown> = {}) => h(DataTable, { caption: 'Services', emptyMessage: 'None', locale: 'en', rows, columns: columns.map(column => ({ ...column, sortable: true })), ...props });
const firstColumn = (host: Element) => [...host.querySelectorAll('tbody tr')].map(row => row.firstElementChild!.textContent);

it('[STATE-01][disclosure-data-15] DataTable uncontrolled: the first activation sorts and notifies sortKey once; the second notifies only sortDirection', async () => {
  const keys = vi.fn(); const directions = vi.fn();
  const host = mount(() => dataTable({ 'onUpdate:sortKey': keys, 'onUpdate:sortDirection': directions }));
  const button = host.querySelector<HTMLButtonElement>('thead th button')!;
  button.click(); await nextTick();
  expect(firstColumn(host)).toEqual(['Licence', 'Passport', 'Visa']);
  expect(keys.mock.calls).toEqual([['name']]); expect(directions).not.toHaveBeenCalled();
  button.click(); await nextTick();
  expect(firstColumn(host)).toEqual(['Visa', 'Passport', 'Licence']);
  expect(keys).toHaveBeenCalledTimes(1); expect(directions.mock.calls).toEqual([['descending']]);
});

it('[STATE-02][STATE-03] DataTable controlled: an ignored notification keeps rows and aria-sort; changing the controlled values notifies nothing', async () => {
  const keys = vi.fn(); const sortKey = ref('');
  const host = mount(() => dataTable({ sortKey: sortKey.value, sortDirection: 'ascending', 'onUpdate:sortKey': keys }));
  host.querySelector<HTMLButtonElement>('thead th button')!.click(); await nextTick();
  expect(keys).toHaveBeenCalledWith('name');
  expect(firstColumn(host)).toEqual(['Passport', 'Visa', 'Licence']);
  expect(host.querySelector('thead th')!.getAttribute('aria-sort')).toBe('none');
  keys.mockClear(); sortKey.value = 'name'; await nextTick();
  expect(keys).not.toHaveBeenCalled(); expect(firstColumn(host)).toEqual(['Licence', 'Passport', 'Visa']);
});

it('[STATE-04] DataTable v-model:sort-key and v-model:sort-direction round-trip', async () => {
  const sortKey = ref(''); const sortDirection = ref<'ascending' | 'descending'>('ascending');
  const host = mount(() => dataTable({ sortKey: sortKey.value, 'onUpdate:sortKey': (value: string) => { sortKey.value = value; }, sortDirection: sortDirection.value, 'onUpdate:sortDirection': (value: 'ascending' | 'descending') => { sortDirection.value = value; } }));
  const button = host.querySelector<HTMLButtonElement>('thead th button')!;
  button.click(); await nextTick(); expect([sortKey.value, sortDirection.value]).toEqual(['name', 'ascending']);
  button.click(); await nextTick(); expect([sortKey.value, sortDirection.value]).toEqual(['name', 'descending']);
  expect(host.querySelector('thead th')!.getAttribute('aria-sort')).toBe('descending');
});

it('[RICH-01][RICH-02][SHAPE-01] DataTable: cell slot and column cell render inside the cell; without cell the value is text', () => {
  const host = mount(() => dataTable({ columns: [...columns, { key: 'link', label: 'Link', cell: (row: Record<string, unknown>) => h('a', { href: `/${row.id}` }, 'Open') }] }, ));
  expect([...host.querySelectorAll('thead th')].map(cell => cell.textContent)).toEqual(['Service', 'Status', 'Link']);
  expect(host.querySelector('tbody tr td > a[href="/a"]')).not.toBeNull();
  expect([...host.querySelectorAll('tbody tr')][1]!.children[1]!.textContent).toBe('');
  app!.unmount(); document.body.replaceChildren();
  const slotted = mount(() => h(DataTable, { caption: 'Services', emptyMessage: 'None', locale: 'en', rows, columns: [...columns] }, { 'cell-name': ({ row, column }: { row: Record<string, unknown>; column: DataColumn }) => [h('span', { class: 'hw-badge' }, column.label), h('a', { href: `#${row.id}` }, String(row.name))] }));
  expect(slotted.querySelector('tbody th[scope=row] > .hw-badge + a')!.textContent).toBe('Passport');
});

it('[DATA-TABLE-01] DataTable: rowKey reuses the same tr elements after sorting', async () => {
  const host = mount(() => dataTable({ rowKey: (row: Record<string, unknown>) => String(row.id) }));
  const before = [...host.querySelectorAll('tbody tr')];
  host.querySelector<HTMLButtonElement>('thead th button')!.click(); await nextTick();
  const after = [...host.querySelectorAll('tbody tr')];
  expect(new Set(after)).toEqual(new Set(before)); expect(after[0]).toBe(before[2]);
});

it('[DATA-TABLE-02] DataTable: the wrapper has hw-table-wrap and hw-data-table, role=region and the caption as its name', () => {
  const host = mount(() => dataTable());
  const wrapper = host.querySelector('div.hw-table-wrap.hw-data-table[tabindex="0"]')!;
  expect(wrapper.getAttribute('role')).toBe('region');
  expect(wrapper.getAttribute('aria-labelledby')).toBe(host.querySelector('caption')!.id);
});

it('[PAGE-HEADER-01][layout-3] level picks the heading; it is truncated and clamped to 1..6', async () => {
  const level = ref<number>(2);
  const host = mount(() => h(PageHeader, { title: 'Services', level: level.value }));
  expect(host.querySelector('h2')!.textContent).toBe('Services'); expect(host.querySelector('h1')).toBeNull();
  for (const [value, tag] of [[0, 'H1'], [9, 'H6'], [2.5, 'H2'], [Number.NaN, 'H1']] as const) {
    level.value = value; await nextTick();
    expect(host.querySelector('.hw-page-header-main h1, .hw-page-header-main h2, .hw-page-header-main h3, .hw-page-header-main h4, .hw-page-header-main h5, .hw-page-header-main h6')!.tagName).toBe(tag);
  }
  app!.unmount(); document.body.replaceChildren();
  expect(mount(() => h(PageHeader, { title: 'Services' })).querySelector('header.hw-page-header > div.hw-page-header-main > div > h1')).not.toBeNull();
});

it('[RICH-01][layout-3] the #title slot renders a rich title inside the heading without a warning', () => {
  const host = mount(() => h(PageHeader, {}, { title: () => ['Services ', h('a', { href: '/all' }, 'all')] }));
  expect(host.querySelector('h1 > a')!.textContent).toBe('all');
  expect(warnings()).toEqual([]);
  app!.unmount(); document.body.replaceChildren();
  mount(() => h(PageHeader, {}));
  expect(warnings().filter(message => message.includes('title'))).toHaveLength(1);
});

it('[SSR-01][layout-3] server HTML with level 3 equals the first client render', async () => {
  const { server, host, mismatches } = await hydrates(() => h(PageHeader, { title: 'Services', level: 3 }));
  expect(mismatches).toEqual([]); expect(host.innerHTML).toBe(server); expect(server).toContain('<h3>Services</h3>');
});

it('[LAYOUT-01][E06] AppShell: main and the sidebar are direct children of .hw-app-shell; no body wrapper', () => {
  const host = mount(() => h(AppShell, { skipLabel: 'Skip to content' }, { sidebar: () => h('nav', { 'aria-label': 'Sections' }, 'Links'), default: () => 'Content' }));
  const shell = host.querySelector('.hw-app-shell')!;
  expect(shell.querySelector(':scope > main.hw-app-shell-main')).not.toBeNull();
  expect(shell.querySelector(':scope > aside.hw-app-shell-sidebar')).not.toBeNull();
  expect(shell.querySelector('.hw-app-shell-body')).toBeNull();
});
