// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createAccordion, createCarousel, createDataTable, createPagination, createTooltip, enhance } from '../src/index.js';

// Vanilla fixtures of the cross-adapter overlay, disclosure and data cases: the documented authored markup and its controllers.
afterEach(() => { document.body.innerHTML = ''; vi.restoreAllMocks(); });
function mount(markup: string): HTMLElement { document.body.innerHTML = markup; return document.body.firstElementChild as HTMLElement; }
// A keyboard activation of a button: jsdom has no default action for Space, so the click it causes is dispatched as the browser would.
const press = (button: HTMLElement) => { const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }); button.dispatchEvent(event); if (!event.defaultPrevented) button.click(); };

describe('carousel and pagination arrows at a bound', () => {
  const carousel = (attrs = '', slides = 3) => mount(`<section class="hw-carousel" data-hw="carousel" aria-label="Featured" data-hw-slide-label="{position} of {total}" data-hw-empty-label="No slides" ${attrs}>${Array.from({ length: slides }, (_, index) => `<article data-hw-slide>Slide ${index + 1}</article>`).join('')}<button class="hw-button hw-carousel-arrow" type="button" data-hw-previous aria-label="Previous slide"></button><button class="hw-button hw-carousel-arrow" type="button" data-hw-next aria-label="Next slide"></button></section>`);
  it('[FOCUS-01] [FOCUS-02] [FOCUS-03] carousel: Next keeps focus and becomes aria-disabled on the last slide', () => {
    const root = carousel(); const changed = vi.fn(); const controller = createCarousel(root, { onValueChange: changed });
    const next = root.querySelector<HTMLButtonElement>('[data-hw-next]')!; const previous = root.querySelector<HTMLButtonElement>('[data-hw-previous]')!;
    next.focus(); press(next); press(next);
    expect(document.activeElement).toBe(next); expect(next.getAttribute('aria-disabled')).toBe('true'); expect(next.hasAttribute('disabled')).toBe(false); expect(next.getAttribute('aria-label')).toBe('Next slide');
    changed.mockClear(); press(next); expect(controller.index).toBe(2); expect(changed).not.toHaveBeenCalled();
    previous.click(); expect(next.getAttribute('aria-disabled')).toBe('false'); controller.destroy();
  });
  it('[CAROUSEL-01] one slide disables both arrows; a looping carousel has neither state at the ends', () => {
    let root = carousel('', 1); let controller = createCarousel(root);
    root.querySelectorAll<HTMLButtonElement>('.hw-carousel-arrow').forEach(arrow => expect(arrow.disabled).toBe(true)); controller.destroy();
    root = carousel('data-hw-loop="true"'); controller = createCarousel(root);
    root.querySelectorAll<HTMLButtonElement>('.hw-carousel-arrow').forEach(arrow => { expect(arrow.disabled).toBe(false); expect(arrow.getAttribute('aria-disabled')).toBe('false'); }); controller.destroy();
  });
  const pagination = (attrs = '') => mount(`<nav class="hw-pagination" data-hw="pagination" aria-label="Pages" data-hw-total="3" ${attrs}><button class="hw-button hw-pagination-arrow" type="button" data-hw-page="previous" aria-label="Previous page"></button><button type="button" data-hw-page="1">1</button><button type="button" data-hw-page="2">2</button><button type="button" data-hw-page="3">3</button><button class="hw-button hw-pagination-arrow" type="button" data-hw-page="next" aria-label="Next page"></button></nav>`);
  it('[FOCUS-01] [FOCUS-02] [FOCUS-03] pagination: Next keeps focus and becomes aria-disabled on the last page', () => {
    const root = pagination(); const changed = vi.fn(); const controller = createPagination(root, { onPageChange: changed });
    const next = root.querySelector<HTMLButtonElement>('[data-hw-page="next"]')!; next.focus(); press(next); press(next);
    expect(controller.page).toBe(3); expect(document.activeElement).toBe(next); expect(next.getAttribute('aria-disabled')).toBe('true'); expect(next.hasAttribute('disabled')).toBe(false);
    changed.mockClear(); press(next); expect(controller.page).toBe(3); expect(changed).not.toHaveBeenCalled();
    root.querySelector<HTMLButtonElement>('[data-hw-page="previous"]')!.click(); expect(next.getAttribute('aria-disabled')).toBe('false'); controller.destroy();
  });
  it('[PAGINATION-01] a disabled pagination disables its arrows natively', () => {
    const root = pagination(); const controller = createPagination(root, { disabled: true });
    for (const arrow of root.querySelectorAll<HTMLButtonElement>('.hw-pagination-arrow')) { expect(arrow.disabled).toBe(true); }
    controller.destroy();
  });
});

describe('data table', () => {
  const table = () => mount('<div class="hw-table-wrap" tabindex="0" role="region" aria-labelledby="requests-caption"><table class="hw-table" data-hw="data-table" data-hw-locale="en"><caption id="requests-caption">Requests</caption><thead><tr><th data-hw-key="name" scope="col"><button type="button" data-hw-sort="name">Name</button></th><th data-hw-key="count" data-hw-type="number" scope="col"><button type="button" data-hw-sort="count">Count</button></th></tr></thead><tbody><tr><th scope="row">Beta</th><td>1</td></tr><tr><th scope="row">Alpha</th><td>2</td></tr></tbody></table></div>');
  it('[STATE-01] [STATE-06] a header activation notifies sortKey once, then only sortDirection; hw:change carries both', () => {
    const wrap = table(); const root = wrap.querySelector<HTMLElement>('table')!; const keys = vi.fn(); const directions = vi.fn(); const details: unknown[] = [];
    root.addEventListener('hw:change', event => details.push((event as CustomEvent).detail));
    const controller = createDataTable(root, { onSortKeyChange: keys, onSortDirectionChange: directions });
    const button = root.querySelector<HTMLButtonElement>('[data-hw-sort="name"]')!; button.click();
    expect([...root.tBodies[0]!.rows].map(row => row.cells[0]!.textContent)).toEqual(['Alpha', 'Beta']);
    expect(keys.mock.calls).toEqual([['name']]); expect(directions.mock.calls).toEqual([['ascending']]);
    button.click(); expect(keys).toHaveBeenCalledTimes(1); expect(directions.mock.calls).toEqual([['ascending'], ['descending']]);
    expect(details).toEqual([{ sortKey: 'name', sortDirection: 'ascending' }, { sortKey: 'name', sortDirection: 'descending' }]); controller.destroy();
  });
  it('[SHAPE-01] the authored table and data table render the header and cell text of the shared fixture', () => {
    const wrap = table(); const release = enhance(wrap);
    expect([...wrap.querySelectorAll('thead th')].map(cell => cell.textContent)).toEqual(['Name', 'Count']);
    expect([...wrap.querySelectorAll('tbody tr')].map(row => [...row.cells].map(cell => cell.textContent))).toEqual([['Beta', '1'], ['Alpha', '2']]);
    expect(wrap.querySelector('tbody th')!.getAttribute('scope')).toBe('row'); release();
  });
});

describe('tooltip', () => {
  const tooltip = () => mount('<div><button type="button" id="before">Before</button><span class="hw-tooltip-anchor" data-hw="tooltip"><button type="button" class="hw-button" data-hw-tooltip-trigger aria-describedby="note">Save</button><span class="hw-tooltip" role="tooltip" id="save-tip" hidden>Saves a draft</span></span><p id="note">Note</p></div>');
  it('[TOOLTIP-01] [TOOLTIP-02] one tab stop; the authored description comes before the tooltip id', () => {
    const root = tooltip(); const anchor = root.querySelector<HTMLElement>('[data-hw="tooltip"]')!; const controller = createTooltip(anchor);
    const focusable = [...root.querySelectorAll<HTMLElement>('button, [tabindex]')]; expect(focusable.map(node => node.textContent)).toEqual(['Before', 'Save']);
    expect(anchor.hasAttribute('tabindex')).toBe(false); expect(root.querySelector('[data-hw-tooltip-trigger]')!.getAttribute('aria-describedby')).toBe('note save-tip'); controller.destroy();
  });
  it('[TOOLTIP-03] focus shows, Escape hides and keeps focus, blur hides', () => {
    const root = tooltip(); const controller = createTooltip(root.querySelector<HTMLElement>('[data-hw="tooltip"]')!);
    const trigger = root.querySelector<HTMLElement>('[data-hw-tooltip-trigger]')!; const tip = root.querySelector<HTMLElement>('[role=tooltip]')!;
    trigger.focus(); expect(tip.hidden).toBe(false);
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })); expect(tip.hidden).toBe(true); expect(document.activeElement).toBe(trigger);
    trigger.blur(); trigger.focus(); expect(tip.hidden).toBe(false); trigger.blur(); expect(tip.hidden).toBe(true); controller.destroy();
  });
});

describe('accordion', () => {
  const accordion = () => mount('<div class="hw-accordion" data-hw="accordion"><details class="hw-accordion-item" data-hw-value="fees"><summary class="hw-accordion-trigger"><span class="hw-icon" aria-hidden="true"></span>Fees <a href="#fees-policy">policy</a></summary><div class="hw-accordion-content"><p>No fee applies. <a href="#more">More</a></p></div></details><details class="hw-accordion-item" data-hw-value="time" open><summary class="hw-accordion-trigger">Time</summary><div class="hw-accordion-content"><p>Three days.</p></div></details></div>');
  it('[RICH-01] [SHAPE-01] rich title and content stay inside the trigger and the content; the open state follows the fixture', () => {
    const root = accordion(); const controller = createAccordion(root);
    const [fees, time] = [...root.querySelectorAll('details')];
    expect(fees!.querySelector('summary.hw-accordion-trigger > .hw-icon')).not.toBeNull(); expect(fees!.querySelector('summary.hw-accordion-trigger > a')!.textContent).toBe('policy');
    expect(fees!.querySelector('div.hw-accordion-content > p > a')!.textContent).toBe('More');
    expect([fees!.open, time!.open]).toEqual([false, true]); expect([...root.querySelectorAll('summary')].map(node => node.textContent!.trim())).toEqual(['Fees policy', 'Time']); controller.destroy();
  });
  it('[RICH-02] [SHAPE-02] a link in the title does not toggle; the title text toggles and reports the item value', () => {
    const root = accordion(); const changed = vi.fn(); const controller = createAccordion(root, { onOpenChange: changed }); const fees = root.querySelector('details')!;
    const link = fees.querySelector<HTMLAnchorElement>('summary a')!; link.addEventListener('click', event => event.preventDefault()); link.click();
    expect(fees.open).toBe(false); expect(changed).not.toHaveBeenCalled();
    fees.querySelector('summary')!.click(); expect(fees.open).toBe(true); expect(changed).toHaveBeenCalledWith('fees', true); controller.destroy();
  });
});

describe('breadcrumb', () => {
  it('[BREADCRUMB-01] the documented current item is a span with aria-current=page, not a link and not a tab stop', () => {
    const root = mount('<nav class="hw-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="./">Home</a></li><li><span aria-current="page">Requests</span></li></ol></nav>'); const release = enhance(root);
    const current = root.querySelector('[aria-current=page]')!; expect(current.localName).toBe('span'); expect(current.closest('a')).toBeNull(); expect(current.hasAttribute('tabindex')).toBe(false); release();
  });
});
