import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, useState } from 'react';
import type { ReactNode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import { resetTextWarnings } from '@hawiyah/core';
import { Accordion, Breadcrumb, Button, Carousel, Collapsible, DataTable, Dialog, Drawer, PageHeader, Pagination, Stepper, Table, Tooltip } from './src/index.js';
import type { StepperProps } from './src/index.js';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let container: HTMLDivElement; let root: Root; let warn: ReturnType<typeof vi.spyOn>;
const warnings = () => (warn.mock.calls as unknown[][]).map(call => String(call[0])).filter(message => message.startsWith('Hawiyah:'));
async function render(node: ReactNode) { await act(async () => root.render(node)); }
async function key(element: Element, name: string) { await act(async () => { element.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true })); }); }
async function click(element: Element) { await act(async () => (element as HTMLElement).click()); }
async function hydrates(node: ReactNode) {
  const html = renderToString(node);
  await act(async () => root.unmount()); const errors = vi.fn(); const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  container.innerHTML = html; await act(async () => { root = hydrateRoot(container, node, { onRecoverableError: errors }); });
  expect(errors).not.toHaveBeenCalled(); expect(error).not.toHaveBeenCalled(); error.mockRestore();
  return html;
}
const pageTexts = { label: 'Pages', previousLabel: 'Previous', nextLabel: 'Next', getPageLabel: (page: number) => `Page ${page}`, getGapLabel: (start: number, end: number) => `${start}–${end}`, jumpLabel: 'Page number', goLabel: 'Go' };
const carouselTexts = { label: 'News', previousLabel: 'Previous slide', nextLabel: 'Next slide', getSlideLabel: (position: number, total: number) => `${position} of ${total}`, indicatorsLabel: 'Slides', emptyLabel: 'No slides' };
const stepTexts = { label: 'Progress', completeLabel: 'Complete', upcomingLabel: 'Not started' };

beforeAll(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: function (this: HTMLDialogElement) { this.open = false; this.dispatchEvent(new Event('close')); } });
});
beforeEach(() => { resetTextWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined); container = document.createElement('div'); document.body.append(container); root = createRoot(container); });
afterEach(async () => { await act(async () => root.unmount()); container.remove(); warn.mockRestore(); });

describe('Dialog and Drawer', () => {
  it('[DIALOG-01][overlays-1] without footer content no footer element is rendered', async () => {
    await render(<><Dialog title="T" closeLabel="Close">Body</Dialog><Drawer title="T" closeLabel="Close">Body</Drawer></>);
    expect(container.querySelector('.hw-dialog-footer, footer')).toBeNull();
  });
  it('[DIALOG-02][overlays-10] description is associated with the native dialog through aria-describedby', async () => {
    await render(<><Dialog title="T" closeLabel="Close" description="About">Body</Dialog><Drawer title="T" closeLabel="Close" description="About">Body</Drawer></>);
    for (const dialog of container.querySelectorAll('dialog')) expect(document.getElementById(dialog.getAttribute('aria-describedby')!)!.textContent).toBe('About');
  });
});

describe('Tooltip', () => {
  it('[TOOLTIP-01][TOOLTIP-02][TOOLTIP-03][overlays-14] one tab stop, kept descriptions first, focus shows and Escape hides', async () => {
    await render(<><button id="before">Before</button><p id="own">Own</p><Tooltip content="Saves the draft"><button aria-describedby="own">Save</button></Tooltip></>);
    const trigger = container.querySelector<HTMLButtonElement>('button[aria-describedby]')!; const tooltip = container.querySelector<HTMLElement>('[role=tooltip]')!;
    expect(container.querySelector('[data-hw=tooltip]')!.hasAttribute('tabindex')).toBe(false);
    expect(container.querySelectorAll('[tabindex]:not([tabindex="-1"]), button')).toHaveLength(2);
    expect(trigger.getAttribute('aria-describedby')).toBe(`own ${tooltip.id}`);
    await act(async () => trigger.focus()); expect(tooltip.hidden).toBe(false);
    await key(trigger, 'Escape'); expect(tooltip.hidden).toBe(true); expect(document.activeElement).toBe(trigger);
  });
});

describe('Accordion', () => {
  const items = (changed = vi.fn()) => [{ value: 'faq-1', title: <><span className="hw-icon" data-icon="help-circle" aria-hidden="true" />Fees <a href="#fees">details</a></>, content: <><p>Paragraph</p><a href="#more">More</a></>, onOpenChange: changed }];
  it('[RICH-01][disclosure-data-3] rich title and content render inside the summary and the content region', async () => {
    await render(<Accordion items={items()} />);
    expect(container.querySelector('summary.hw-accordion-trigger a[href="#fees"]')).not.toBeNull(); expect(container.querySelector('summary.hw-accordion-trigger .hw-icon')).not.toBeNull();
    expect(container.querySelector('div.hw-accordion-content p')!.textContent).toBe('Paragraph'); expect(container.querySelector('div.hw-accordion-content a[href="#more"]')).not.toBeNull();
  });
  it('[RICH-02][SHAPE-02] a click on the title link does not toggle; a click on the title text toggles and notifies with the item', async () => {
    const changed = vi.fn();
    await render(<Accordion items={items(changed)} />);
    container.querySelector('a[href="#fees"]')!.addEventListener('click', event => event.preventDefault());
    await click(container.querySelector('a[href="#fees"]')!); expect(changed).not.toHaveBeenCalled();
    await click(container.querySelector('summary')!); expect(changed).toHaveBeenCalledWith(true); expect(container.querySelector('details')!.open).toBe(true);
  });
  it('[SHAPE-01] one fixture {value, title, content, open} renders the text and open state', async () => {
    await render(<Accordion items={[{ value: 'a', title: 'A', content: 'Alpha', open: true }, { value: 'b', title: 'B', content: 'Beta' }]} />);
    expect(Array.from(container.querySelectorAll('details'), details => [details.querySelector('summary')!.textContent, details.open])).toEqual([['A', true], ['B', false]]);
  });
  it('[RICH-04] server render with rich title and content equals the first client render', async () => {
    await hydrates(<Accordion items={items()} />);
  });
});

describe('Collapsible', () => {
  it('[COLLAPSIBLE-01][COLLAPSIBLE-02][disclosure-data-5] disabled: focusable summary with aria-disabled; the reader cannot toggle', async () => {
    const changed = vi.fn();
    await render(<Collapsible label="More" disabled onOpenChange={changed}>Body</Collapsible>);
    const summary = container.querySelector('summary')!;
    expect(summary.getAttribute('aria-disabled')).toBe('true'); expect(summary.tabIndex).not.toBe(-1);
    await click(summary); await key(summary, 'Enter'); await key(summary, ' ');
    expect(container.querySelector('details')!.open).toBe(false); expect(changed).not.toHaveBeenCalled();
    await render(<Collapsible label="More" disabled open onOpenChange={changed}>Body</Collapsible>);
    await click(summary); expect(container.querySelector('details')!.open).toBe(true); expect(changed).not.toHaveBeenCalled();
  });
});

describe('Carousel and Pagination arrows', () => {
  it('[FOCUS-01][FOCUS-02][FOCUS-03][disclosure-data-10] Carousel Next keeps focus at the last slide as aria-disabled', async () => {
    const changed = vi.fn();
    await render(<Carousel {...carouselTexts} slides={['A', 'B']} onIndexChange={changed} />);
    const next = container.querySelector<HTMLButtonElement>('[data-hw-next]')!; const previous = container.querySelector<HTMLButtonElement>('[data-hw-previous]')!;
    expect(previous.getAttribute('aria-disabled')).toBe('true'); expect(previous.disabled).toBe(false);
    act(() => next.focus()); await click(next);
    expect(document.activeElement).toBe(next); expect(next.getAttribute('aria-disabled')).toBe('true'); expect(next.disabled).toBe(false);
    changed.mockClear(); await click(next); expect(changed).not.toHaveBeenCalled();
    await click(previous); expect(next.hasAttribute('aria-disabled')).toBe(false);
  });
  it('[CAROUSEL-01] one slide disables both arrows; a looping carousel has neither attribute at the ends', async () => {
    await render(<Carousel {...carouselTexts} slides={['A']} />);
    for (const arrow of container.querySelectorAll<HTMLButtonElement>('.hw-carousel-arrow')) { expect(arrow.disabled).toBe(true); expect(arrow.hasAttribute('aria-disabled')).toBe(false); }
    await render(<Carousel {...carouselTexts} slides={['A', 'B']} loop />);
    for (const arrow of container.querySelectorAll<HTMLButtonElement>('.hw-carousel-arrow')) { expect(arrow.disabled).toBe(false); expect(arrow.hasAttribute('aria-disabled')).toBe(false); }
  });
  it('[FOCUS-01][FOCUS-02][FOCUS-03] Pagination Next keeps focus at the last page as aria-disabled', async () => {
    const changed = vi.fn();
    await render(<Pagination {...pageTexts} totalPages={2} onPageChange={changed} />);
    const next = container.querySelector<HTMLButtonElement>('[data-hw-next]')!; const previous = container.querySelector<HTMLButtonElement>('[data-hw-previous]')!;
    act(() => next.focus()); await click(next);
    expect(document.activeElement).toBe(next); expect(next.getAttribute('aria-disabled')).toBe('true'); expect(next.disabled).toBe(false);
    changed.mockClear(); await click(next); await key(next, 'Enter'); expect(changed).not.toHaveBeenCalled();
    await click(previous); expect(next.hasAttribute('aria-disabled')).toBe(false); expect(previous.getAttribute('aria-disabled')).toBe('true');
  });
  it('[PAGINATION-01] a disabled pagination disables the arrows without a bound aria-disabled', async () => {
    await render(<Pagination {...pageTexts} totalPages={3} disabled />);
    for (const arrow of container.querySelectorAll<HTMLButtonElement>('.hw-pagination-arrow')) { expect(arrow.disabled).toBe(true); expect(arrow.hasAttribute('aria-disabled')).toBe(false); }
  });
});

describe('Table and DataTable', () => {
  type Row = { id: string; name: string; fee?: number | null };
  const rows: Row[] = [{ id: 'b', name: 'Beta', fee: null }, { id: 'a', name: 'Alpha', fee: 10 }];
  it('[RICH-01][RICH-02][SHAPE-01][TABLE-02][disclosure-data-13] Table cells, row headers, plain values and the caption region', async () => {
    await render(<Table<Row> caption="Services" emptyMessage="None" rows={rows} columns={[{ key: 'name', label: 'Name', rowHeader: true, cell: row => <a href={`#${row.id}`}>{row.name}</a> }, { key: 'fee', label: 'Fee' }]} />);
    expect(container.querySelector('th[scope=row] a[href="#b"]')!.textContent).toBe('Beta');
    expect(Array.from(container.querySelectorAll('th[scope=col]'), cell => cell.textContent)).toEqual(['Name', 'Fee']);
    expect(Array.from(container.querySelectorAll('tbody td'), cell => cell.textContent)).toEqual(['', '10']);
    const wrap = container.querySelector('.hw-table-wrap')!; expect(wrap.getAttribute('role')).toBe('region'); expect(wrap.getAttribute('aria-labelledby')).toBe(container.querySelector('caption')!.id);
    await render(<Table<Row> emptyMessage="None" rows={rows} columns={[{ key: 'name', label: 'Name' }]} />);
    expect(container.querySelector('.hw-table-wrap')!.hasAttribute('role')).toBe(false); expect(container.querySelector('.hw-table-wrap')!.hasAttribute('aria-labelledby')).toBe(false);
  });
  it('[TABLE-01] rowKey keeps the same tr elements after a reorder', async () => {
    const columns = [{ key: 'name', label: 'Name' }];
    await render(<Table<Row> emptyMessage="None" rows={rows} rowKey={row => row.id} columns={columns} />);
    const [first, second] = container.querySelectorAll('tbody tr');
    await render(<Table<Row> emptyMessage="None" rows={[...rows].reverse()} rowKey={row => row.id} columns={columns} />);
    expect(Array.from(container.querySelectorAll('tbody tr'))).toEqual([second, first]);
  });
  it('[STATE-01][disclosure-data-15] uncontrolled sort notifies sortKey once, then only sortDirection', async () => {
    const onKey = vi.fn(); const onDirection = vi.fn();
    await render(<DataTable<Row> caption="Services" emptyMessage="None" locale="en" rows={rows} columns={[{ key: 'name', label: 'Name', sortable: true }]} onSortKeyChange={onKey} onSortDirectionChange={onDirection} />);
    await click(container.querySelector('th button')!);
    expect(onKey.mock.calls).toEqual([['name']]); expect(onDirection).not.toHaveBeenCalled();
    expect(Array.from(container.querySelectorAll('tbody td'), cell => cell.textContent)).toEqual(['Alpha', 'Beta']);
    await click(container.querySelector('th button')!);
    expect(onKey).toHaveBeenCalledTimes(1); expect(onDirection.mock.calls).toEqual([['descending']]); expect(container.querySelector('th')!.getAttribute('aria-sort')).toBe('descending');
  });
  it('[STATE-02][STATE-03] controlled sort ignored by the application keeps rows and aria-sort; changing it does not notify', async () => {
    const onKey = vi.fn(); const onDirection = vi.fn(); const columns = [{ key: 'name' as const, label: 'Name', sortable: true }];
    await render(<DataTable<Row> caption="Services" emptyMessage="None" locale="en" rows={rows} columns={columns} sortKey="" onSortKeyChange={onKey} onSortDirectionChange={onDirection} />);
    await click(container.querySelector('th button')!);
    expect(onKey).toHaveBeenCalledWith('name'); expect(container.querySelector('th')!.getAttribute('aria-sort')).toBe('none');
    expect(Array.from(container.querySelectorAll('tbody td'), cell => cell.textContent)).toEqual(['Beta', 'Alpha']);
    onKey.mockClear();
    await render(<DataTable<Row> caption="Services" emptyMessage="None" locale="en" rows={rows} columns={columns} sortKey="name" sortDirection="descending" onSortKeyChange={onKey} onSortDirectionChange={onDirection} />);
    expect(onKey).not.toHaveBeenCalled(); expect(onDirection).not.toHaveBeenCalled(); expect(container.querySelector('th')!.getAttribute('aria-sort')).toBe('descending');
  });
  it('[RICH-01][RICH-02][DATA-TABLE-01][DATA-TABLE-02][SHAPE-01] DataTable cells, row keys and wrapper', async () => {
    const columns = [{ key: 'name' as const, label: 'Name', sortable: true, rowHeader: true, cell: (row: Row) => <><span className="hw-badge">New</span><a href={`#${row.id}`}>{row.name}</a></> }, { key: 'fee' as const, label: 'Fee' }];
    await render(<DataTable<Row> caption="Services" emptyMessage="None" locale="en" rows={rows} rowKey={row => row.id} columns={columns} />);
    expect(container.querySelector('th[scope=row] .hw-badge + a[href="#b"]')).not.toBeNull(); expect(Array.from(container.querySelectorAll('tbody td'), cell => cell.textContent)).toEqual(['', '10']);
    const wrap = container.querySelector('.hw-table-wrap')!;
    expect(wrap.classList.contains('hw-data-table')).toBe(true); expect(wrap.getAttribute('role')).toBe('region'); expect(wrap.getAttribute('aria-labelledby')).toBe(container.querySelector('caption')!.id);
    expect(container.querySelector('table')!.className).toBe('hw-table');
    const [first, second] = container.querySelectorAll('tbody tr');
    await click(container.querySelector('th button')!);
    expect(Array.from(container.querySelectorAll('tbody tr'))).toEqual([second, first]);
  });
  it('[SHAPE-03][RENAME-02][disclosure-data-13][disclosure-data-15] removed column and sort names are type errors', () => {
    const fixture = resolve('packages/react/fixtures/disclosure-data-types.tsx');
    const program = ts.createProgram([fixture], { strict: true, noEmit: true, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, lib: ['lib.es2022.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'], skipLibCheck: true, isolatedModules: true });
    const diagnostics = ts.getPreEmitDiagnostics(program).map(diagnostic => `${diagnostic.file?.fileName.split('/').pop() ?? ''}:${diagnostic.file && diagnostic.start !== undefined ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line + 1 : 0} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`);
    expect(diagnostics).toEqual([]);
    expect(readFileSync(fixture, 'utf8').match(/@ts-expect-error/g)!.length).toBeGreaterThanOrEqual(5);
  }, 60_000);
  it('[RICH-04] server render with a cell template equals the first client render', async () => {
    await hydrates(<Table<Row> caption="Services" emptyMessage="None" rows={rows} columns={[{ key: 'name', label: 'Name', cell: row => <a href={`#${row.id}`}>{row.name}</a> }]} />);
  });
});

describe('PageHeader', () => {
  it('[PAGE-HEADER-01][layout-3] level chooses the heading element, clamped and truncated', async () => {
    await render(<PageHeader title="Services" level={2} />);
    expect(container.querySelector('h2')!.textContent).toBe('Services'); expect(container.querySelector('h1')).toBeNull();
    await render(<PageHeader title="Services" />); expect(container.querySelector('h1')).not.toBeNull();
    for (const [level, tag] of [[0, 'h1'], [9, 'h6'], [2.5, 'h2'], [NaN, 'h1']] as const) {
      await render(<PageHeader title="Services" level={level as 1} />); expect(container.querySelector('.hw-page-header-main h1, .hw-page-header-main h2, .hw-page-header-main h6')!.localName).toBe(tag);
    }
  });
  it('[RICH-01] a rich title is rendered inside the heading', async () => {
    await render(<PageHeader title={<>Services <a href="#all">all</a></>} />);
    expect(container.querySelector('h1 a[href="#all"]')).not.toBeNull();
  });
  it('[SSR-01] server HTML with level 3 equals the first client render', async () => {
    expect(await hydrates(<PageHeader title="Services" level={3} />)).toContain('<h3>');
  });
});

describe('Breadcrumb', () => {
  it('[BREADCRUMB-01][nav-a-11] the last item with an href is text with aria-current, not a link', async () => {
    await render(<Breadcrumb label="Path" items={[{ label: 'Home', href: '/' }, { label: 'Fees', href: '/fees' }]} />);
    const current = container.querySelector('[aria-current=page]')!;
    expect(current.localName).toBe('span'); expect(current.textContent).toBe('Fees'); expect(current.hasAttribute('tabindex')).toBe(false);
    expect(container.querySelectorAll('a')).toHaveLength(1);
  });
  it('[BREADCRUMB-02][BREADCRUMB-03][SHAPE-01] a flagged item is current; the last is a link; a disabled item is a link-role span without href', async () => {
    await render(<Breadcrumb label="Path" items={[{ label: 'Home', href: '/' }, { label: 'Fees', href: '/fees', current: true }, { label: 'Archive', href: '/archive', disabled: true }, { label: 'Help', href: '/help' }]} />);
    expect(container.querySelectorAll('[aria-current]')).toHaveLength(1); expect(container.querySelector('[aria-current=page]')!.outerHTML).toBe('<span aria-current="page">Fees</span>');
    expect(container.querySelector('li:last-child a[href="/help"]')).not.toBeNull();
    expect(container.querySelector('li:nth-child(3) > *')!.outerHTML).toBe('<span role="link" aria-disabled="true">Archive</span>');
  });
});

describe('Stepper', () => {
  const items = [{ value: 'one', label: 'Details' }, { value: 'two', label: 'Review', description: 'Check the data' }, { value: 'three', label: 'Send' }];
  it('[STEPPER-01][STEPPER-04][nav-a-14][nav-a-15] state text follows the label; the current step has none; the description is a sibling p', async () => {
    await render(<Stepper {...stepTexts} items={items} current="two" />);
    const steps = container.querySelectorAll('li');
    expect(steps[0].children[1].outerHTML).toBe('<span class="hw-sr-only" data-hw-step-status="">Complete</span>');
    expect(steps[2].querySelector('[data-hw-step-status]')!.textContent).toBe('Not started');
    expect(steps[1].querySelector('[data-hw-step-status]')).toBeNull(); expect(steps[1].getAttribute('aria-current')).toBe('step');
    expect(steps[1].querySelector(':scope > span + p.hw-hint')!.textContent).toBe('Check the data'); expect(container.querySelector('small')).toBeNull();
  });
  it('[STEPPER-02] an explicit complete status gives the last step completeLabel', async () => {
    await render(<Stepper {...stepTexts} items={[...items.slice(0, 2), { ...items[2], status: 'complete' }]} current="two" />);
    expect(container.querySelector('li:last-child [data-hw-step-status]')!.textContent).toBe('Complete');
  });
  it('[STEPPER-05][SHAPE-01] neither current nor activeIndex: every step is upcoming', async () => {
    await render(<Stepper {...stepTexts} items={items} />);
    expect(Array.from(container.querySelectorAll('li'), step => step.dataset.state)).toEqual(['upcoming', 'upcoming', 'upcoming']); expect(container.querySelector('[aria-current]')).toBeNull();
  });
  it('[TEXT-01] a missing completeLabel renders no status span on complete steps and warns once', async () => {
    const { completeLabel: _omitted, ...rest } = stepTexts;
    await render(<Stepper {...(rest as StepperProps)} items={items} current="three" />);
    expect(container.querySelectorAll('[data-hw-step-status]')).toHaveLength(0);
    expect(warnings().filter(message => message.includes('completeLabel'))).toHaveLength(1);
  });
  it('[SSR-01] the status spans are in the server HTML, which equals the first client render', async () => {
    expect(await hydrates(<Stepper {...stepTexts} items={items} current="two" />)).toContain('data-hw-step-status');
  });
});
