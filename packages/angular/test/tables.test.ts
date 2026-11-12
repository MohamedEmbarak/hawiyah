import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { contentOf, page } from './fixtures/page';
import { missingTextWarnings } from './fixtures/texts';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); });

const rows = [{ id: 'R-1', title: 'Beta', state: 'open' }, { id: 'R-2', title: 'Alpha', state: null }, { id: 'R-3', title: 'Gamma', state: undefined }];
const cellTemplates = `<ng-template #reference let-row let-index="index" let-column="column"><a [href]="'https://example.org/' + row.id" [attr.data-index]="index" [attr.data-column]="column.key">{{ row.id }}</a></ng-template><ng-template #state let-row><span class="hw-badge">{{ row.state }}</span> <a href="https://example.org/state">Why</a></ng-template>`;
/** Column objects are built in the page so that they can hold its templates. */
class Columns { columnsOf(reference: unknown, state: unknown) { return this.cached ??= [{ key: 'id', label: 'Reference', rowHeader: true, cell: reference }, { key: 'title', label: 'Title', sortable: true }, { key: 'state', label: 'State', cell: state }]; } private cached?: unknown[]; }
const forwarded = ['aria-label', 'aria-labelledby', 'aria-describedby'];

describe('hw-table', () => {
  it('[RICH-01][RICH-02][disclosure-data-13] a cell template renders inside td or th[scope=row]; a column without one prints the row value as text', () => {
    const helper = new Columns();
    const { root } = page(`<hw-table caption="Requests" emptyMessage="None" [columns]="columnsOf(reference, state)" [rows]="rows" />${cellTemplates}`, { rows, columnsOf: helper.columnsOf.bind(helper) });
    const body = [...root.querySelectorAll('tbody tr')];
    expect(body).toHaveLength(3);
    const header = body[0]!.querySelector(':scope > th[scope=row]')!;
    expect(header.querySelector('a')!.getAttribute('href')).toBe('https://example.org/R-1'); expect(header.querySelector('a')!.getAttribute('data-index')).toBe('0'); expect(header.querySelector('a')!.getAttribute('data-column')).toBe('id');
    expect(body[1]!.querySelector('th a')!.getAttribute('data-index')).toBe('1');
    const cells = [...body[0]!.querySelectorAll(':scope > td')];
    expect(contentOf(cells[0]!).map(node => node.nodeType)).toEqual([Node.TEXT_NODE]); expect(cells[0]!.textContent).toBe('Beta');
    expect(cells[1]!.querySelector('.hw-badge')!.textContent).toBe('open'); expect(cells[1]!.querySelector('a')!.textContent).toBe('Why');
    expect([...root.querySelectorAll('thead th')].map(cell => [cell.getAttribute('scope'), cell.textContent])).toEqual([['col', 'Reference'], ['col', 'Title'], ['col', 'State']]);
  });

  it('[RICH-02][SHAPE-01] the shared shape {key, label, rowHeader} prints values as text; null and undefined print nothing', () => {
    const { root } = page(`<hw-table caption="Requests" emptyMessage="None" [columns]="[{key: 'id', label: 'Reference', rowHeader: true}, {key: 'title', label: 'Title'}, {key: 'state', label: 'State'}, {key: 'count', label: 'Count'}]" [rows]="rows" />`, { rows: [{ id: 'R-1', title: 'Beta', state: null, count: 0 }, { id: 'R-2', title: 'Alpha', count: 12 }] });
    expect([...root.querySelectorAll('tbody tr')].map(row => [...row.children].map(cell => `${cell.localName}:${cell.textContent}`))).toEqual([['th:R-1', 'td:Beta', 'td:', 'td:0'], ['th:R-2', 'td:Alpha', 'td:', 'td:12']]);
  });

  it('[RICH-02] a cell that is not a template, as in a column array shared with another adapter, is ignored: the value is printed as text', () => {
    const shared = [{ key: 'id', label: 'Reference', rowHeader: true, cell: (row: { id: string }) => row.id.toLowerCase() }, { key: 'title', label: 'Title', cell: 'text' }];
    const { root } = page(`<hw-table caption="Requests" emptyMessage="None" [columns]="columns" [rows]="rows" /><hw-data-table caption="Requests" emptyMessage="None" locale="en" [columns]="columns" [rows]="rows" />`, { rows, columns: shared as never });
    for (const table of root.querySelectorAll('table')) expect([...table.querySelector('tbody tr')!.children].map(cell => `${cell.localName}:${cell.textContent}`)).toEqual(['th:R-1', 'td:Beta']);
  });

  it('[TABLE-01] with rowKey the row elements are reused when the rows are reordered', () => {
    const { root, update } = page(`<hw-table caption="Requests" emptyMessage="None" [columns]="[{key: 'id', label: 'Reference'}]" [rows]="rows" [rowKey]="key" />`, { rows, key: (row: { id: string }, index: number) => typeof index === 'number' ? row.id : '' });
    const before = [...root.querySelectorAll('tbody tr')];
    update({ rows: [rows[2]!, rows[0]!, rows[1]!] });
    const after = [...root.querySelectorAll('tbody tr')];
    expect(after.map(row => row.textContent)).toEqual(['R-3', 'R-1', 'R-2']); expect(after).toEqual([before[2], before[0], before[1]]);
  });

  it('[TABLE-02][NAME-02][ATTR-03] the wrapper is a region named by the caption only while there is one; aria-label on the host names the table', () => {
    const { root } = page(`<h2 id="heading">Heading</h2><hw-table caption="Requests" emptyMessage="None" [columns]="[]" [rows]="[]" /><hw-table aria-label="Requests" aria-describedby="heading" emptyMessage="None" [columns]="[]" [rows]="[]" /><hw-table aria-labelledby="heading" emptyMessage="None" [columns]="[]" [rows]="[]" />`);
    const hosts = [...root.querySelectorAll('hw-table')];
    for (const host of hosts) for (const name of forwarded) expect(host.hasAttribute(name), name).toBe(false);
    const [captioned, labelled, labelledBy] = hosts.map(host => ({ wrap: host.querySelector('div.hw-table-wrap')!, table: host.querySelector('table.hw-table')!, caption: host.querySelector('caption') }));
    expect(captioned!.wrap.getAttribute('role')).toBe('region'); expect(captioned!.wrap.getAttribute('aria-labelledby')).toBe(captioned!.caption!.id); expect(captioned!.caption!.id).toMatch(/^hw-table-caption-/); expect(captioned!.wrap.hasAttribute('aria-label')).toBe(false); expect(captioned!.wrap.getAttribute('tabindex')).toBe('0');
    expect(labelled!.caption).toBeNull(); expect(labelled!.wrap.hasAttribute('role')).toBe(false); expect(labelled!.wrap.hasAttribute('aria-labelledby')).toBe(false);
    expect(labelled!.table.getAttribute('aria-label')).toBe('Requests'); expect(labelled!.table.getAttribute('aria-describedby')).toBe('heading');
    expect(labelledBy!.table.getAttribute('aria-labelledby')).toBe('heading'); expect(labelledBy!.caption).toBeNull();
  });

  it('[NAME-04] a table with neither caption nor forwarded name renders no caption and warns once, naming caption', () => {
    const warnings = missingTextWarnings();
    const { root, update } = page(`<hw-table emptyMessage="None" [columns]="[]" [rows]="[]" />`);
    update();
    expect(root.querySelector('caption')).toBeNull(); expect(root.querySelector('table')!.hasAttribute('aria-label')).toBe(false);
    expect(warnings.map(warning => warning.split('.')[0])).toEqual(['Hawiyah: hw-table requires "caption"']);
  });
});

describe('hw-data-table', () => {
  const columns = [{ key: 'id', label: 'Reference', rowHeader: true }, { key: 'title', label: 'Title', sortable: true }, { key: 'state', label: 'State', sortable: true }];
  const titles = (root: Element) => [...root.querySelectorAll('tbody tr')].map(row => row.children[1]!.textContent);
  const sortButton = (root: Element, index: number) => root.querySelectorAll<HTMLButtonElement>('thead th button')[index]!;
  const sorts = (root: Element) => [...root.querySelectorAll('thead th')].map(cell => cell.getAttribute('aria-sort'));

  it('[STATE-01][disclosure-data-15] activating a sortable header sorts the rows and reports the key once; a second activation reports only the direction', () => {
    const key = vi.fn(), direction = vi.fn();
    const { root, fixture } = page(`<hw-data-table caption="Requests" emptyMessage="None" locale="en" [columns]="columns" [rows]="rows" (sortKeyChange)="key($event)" (sortDirectionChange)="direction($event)" />`, { columns, rows, key, direction });
    expect(titles(root)).toEqual(['Beta', 'Alpha', 'Gamma']); expect(sorts(root)).toEqual([null, 'none', 'none']);
    sortButton(root, 0).click(); fixture.detectChanges();
    expect(titles(root)).toEqual(['Alpha', 'Beta', 'Gamma']); expect(sorts(root)).toEqual([null, 'ascending', 'none']); expect(key.mock.calls).toEqual([['title']]); expect(direction).not.toHaveBeenCalled();
    sortButton(root, 0).click(); fixture.detectChanges();
    expect(titles(root)).toEqual(['Gamma', 'Beta', 'Alpha']); expect(sorts(root)).toEqual([null, 'descending', 'none']); expect(key).toHaveBeenCalledTimes(1); expect(direction.mock.calls).toEqual([['descending']]);
    // Another column: the key, then the direction back to ascending.
    sortButton(root, 1).click(); fixture.detectChanges();
    expect(key.mock.calls).toEqual([['title'], ['state']]); expect(direction.mock.calls).toEqual([['descending'], ['ascending']]); expect(sorts(root)).toEqual([null, 'none', 'ascending']);
  });

  it('[STATE-03][STATE-04] a change of the bound sort state reports nothing; [(sortKey)] and [(sortDirection)] round-trip', () => {
    const key = vi.fn(), direction = vi.fn();
    const { root, fixture, state, update } = page(`<hw-data-table caption="Requests" emptyMessage="None" locale="en" [columns]="columns" [rows]="rows" [(sortKey)]="sortKey" [(sortDirection)]="sortDirection" (sortKeyChange)="key($event)" (sortDirectionChange)="direction($event)" />`, { columns, rows, key, direction, sortKey: 'title', sortDirection: 'descending' as 'ascending' | 'descending' });
    expect(titles(root)).toEqual(['Gamma', 'Beta', 'Alpha']); expect(sorts(root)).toEqual([null, 'descending', 'none']);
    update({ sortDirection: 'ascending' }); expect(titles(root)).toEqual(['Alpha', 'Beta', 'Gamma']); expect(key).not.toHaveBeenCalled(); expect(direction).not.toHaveBeenCalled();
    sortButton(root, 0).click(); fixture.detectChanges();
    expect(state.sortKey).toBe('title'); expect(state.sortDirection).toBe('descending'); expect(key).not.toHaveBeenCalled(); expect(direction.mock.calls).toEqual([['descending']]);
    sortButton(root, 1).click(); fixture.detectChanges(); expect(state.sortKey).toBe('state'); expect(state.sortDirection).toBe('ascending');
  });

  it('[RICH-01][RICH-02] a cell template renders inside td or th[scope=row]; a column without one prints text', () => {
    const helper = new Columns();
    const { root } = page(`<hw-data-table caption="Requests" emptyMessage="None" locale="en" [columns]="columnsOf(reference, state)" [rows]="rows" />${cellTemplates}`, { rows, columnsOf: helper.columnsOf.bind(helper) });
    const first = root.querySelector('tbody tr')!;
    expect(first.querySelector('th[scope=row] a')!.getAttribute('href')).toBe('https://example.org/R-1');
    const cells = [...first.querySelectorAll(':scope > td')];
    expect(contentOf(cells[0]!).map(node => node.nodeType)).toEqual([Node.TEXT_NODE]); expect(cells[0]!.textContent).toBe('Beta'); expect(cells[1]!.querySelector('.hw-badge')!.textContent).toBe('open'); expect(cells[1]!.querySelector('a')).not.toBeNull();
    // A header that is not sortable holds its label and nothing else.
    expect(contentOf(root.querySelector('thead th')!).map(node => node.textContent)).toEqual(['Reference']);
  });

  it('[DATA-TABLE-01] with rowKey the row elements are reused in the sorted order', () => {
    const { root, fixture } = page(`<hw-data-table caption="Requests" emptyMessage="None" locale="en" [columns]="columns" [rows]="rows" [rowKey]="key" />`, { columns, rows, key: (row: { id: string }) => row.id });
    const before = [...root.querySelectorAll('tbody tr')];
    sortButton(root, 0).click(); fixture.detectChanges();
    const after = [...root.querySelectorAll('tbody tr')];
    expect(titles(root)).toEqual(['Alpha', 'Beta', 'Gamma']); expect(after).toEqual([before[1], before[0], before[2]]);
  });

  it('[DATA-TABLE-02][ATTR-03] the wrapper is a region named by the caption; forwarded attributes reach the table', () => {
    const { root } = page(`<p id="note">Note</p><hw-data-table caption="Requests" aria-describedby="note" aria-label="Open requests" emptyMessage="None" locale="en" [columns]="columns" [rows]="rows" />`, { columns, rows });
    const host = root.querySelector('hw-data-table')!, wrap = host.querySelector(':scope > div')!, caption = host.querySelector('caption')!;
    for (const name of forwarded) expect(host.hasAttribute(name), name).toBe(false);
    expect(wrap.className).toBe('hw-table-wrap hw-data-table'); expect(wrap.getAttribute('role')).toBe('region'); expect(wrap.getAttribute('tabindex')).toBe('0'); expect(wrap.hasAttribute('aria-label')).toBe(false);
    expect(caption.id).toMatch(/^hw-data-table-caption-/); expect(wrap.getAttribute('aria-labelledby')).toBe(caption.id); expect(caption.textContent).toBe('Requests');
    expect(host.querySelector('table')!.getAttribute('aria-describedby')).toBe('note'); expect(host.querySelector('table')!.getAttribute('aria-label')).toBe('Open requests');
  });
});
