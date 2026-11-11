// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCarousel, createCookieConsent, createDataTable, createFeedback, createToggleGroup, createTreeView } from '../src/content.js';

afterEach(() => { document.body.innerHTML = ''; localStorage.clear(); vi.restoreAllMocks(); vi.useRealTimers(); });
function mount(html: string): HTMLElement { document.body.innerHTML = html; return document.body.firstElementChild as HTMLElement; }
function key(element: HTMLElement, value: string, extra: KeyboardEventInit = {}): KeyboardEvent { const event = new KeyboardEvent('keydown', {key: value, bubbles: true, cancelable: true, ...extra}); element.dispatchEvent(event); return event; }

describe('toggle groups and feedback', () => {
  it('uses native radio changes, skips disabled choices, resets and restores checked state', async () => {
    const form = mount(`<form><fieldset data-hw="toggle-group"><legend>View</legend><label><input type="radio" name="view" value="list" checked>List</label><label><input type="radio" name="view" value="grid">Grid</label><label><input type="radio" name="view" value="blocked" disabled>Unavailable</label></fieldset></form>`) as HTMLFormElement;
    const root = form.firstElementChild as HTMLElement; const before = root.outerHTML; const changed = vi.fn(); const callback = vi.fn(); form.addEventListener('hw:change', changed);
    const controller = createToggleGroup(root, {onValueChange: callback});
    const radios = [...root.querySelectorAll<HTMLInputElement>('input')]; radios[1]!.click();
    expect(controller.value).toBe('grid'); expect(new FormData(form).get('view')).toBe('grid'); expect(changed).toHaveBeenCalledTimes(1); expect(callback).toHaveBeenCalledWith('grid');
    controller.select('blocked'); expect(controller.value).toBe('grid');
    form.reset(); await Promise.resolve(); expect(controller.value).toBe('list'); expect(radios[0]!.checked).toBe(true);
    controller.destroy(); controller.destroy(); expect(root.outerHTML).toBe(before);
    controller.select('grid'); expect(radios[0]!.checked).toBe(true);
  });

  it('supports multiple pressed values and repeated form entries without submitting buttons', async () => {
    const form = mount(`<form><div data-hw="toggle-group" data-hw-multiple="true" data-hw-name="format" role="group" aria-label="Format"><button data-hw-value="bold" aria-pressed="true">Bold</button><button data-hw-value="italic" aria-pressed="false">Italic</button></div></form>`) as HTMLFormElement;
    const root = form.firstElementChild as HTMLElement; const before = root.outerHTML; const submitted = vi.fn(event => event.preventDefault()); form.addEventListener('submit', submitted);
    const controller = createToggleGroup(root); root.querySelectorAll<HTMLButtonElement>('button')[1]!.click();
    expect(controller.value).toEqual(['bold', 'italic']); expect(new FormData(form).getAll('format')).toEqual(['bold', 'italic']); expect(submitted).not.toHaveBeenCalled();
    root.dataset.hwReadonly = 'true'; controller.select('bold'); expect(controller.value).toEqual(['bold', 'italic']); root.removeAttribute('data-hw-readonly');
    form.reset(); await Promise.resolve(); expect(controller.value).toEqual(['bold']);
    controller.destroy(); expect(root.outerHTML).toBe(before);
  });

  it('announces feedback once, submits its hidden value, and restores authored status on cleanup', async () => {
    const form = mount(`<form><div data-hw="feedback" data-hw-success-message="Thank you for your feedback."><button data-hw-value="yes" aria-pressed="false">Yes</button><button data-hw-value="no" aria-pressed="false">No</button><input type="hidden" name="helpful" data-hw-feedback-value><span data-hw-feedback-status role="status">Choose an answer</span></div></form>`) as HTMLFormElement;
    const root = form.firstElementChild as HTMLElement; const before = root.outerHTML; const changed = vi.fn(); root.addEventListener('hw:change', changed); const controller = createFeedback(root);
    root.querySelector<HTMLButtonElement>('button')!.click(); expect(controller.value).toBe('yes'); expect(new FormData(form).get('helpful')).toBe('yes'); expect(root.querySelector('[data-hw-feedback-status]')!.textContent).toContain('Thank you');
    controller.select('yes'); expect(changed).toHaveBeenCalledTimes(1);
    root.setAttribute('aria-disabled', 'true'); controller.select('no'); expect(controller.value).toBe('yes'); await Promise.resolve(); expect(new FormData(form).has('helpful')).toBe(false); root.removeAttribute('aria-disabled'); await Promise.resolve();
    form.reset(); await Promise.resolve(); expect(controller.value).toBe('');
    controller.select('no'); controller.destroy(); controller.destroy(); expect(root.outerHTML).toBe(before);
  });
});

describe('cookie consent', () => {
  it('persists only with an explicit storage key and restores visibility on cleanup', () => {
    const root = mount(`<section data-hw="cookie-consent"><button data-hw-consent="accepted">Accept optional</button><button data-hw-consent="rejected">Reject optional</button></section>`);
    const before = root.outerHTML; const writes = vi.spyOn(Storage.prototype, 'setItem'); const changed = vi.fn(); root.addEventListener('hw:change', changed);
    const controller = createCookieConsent(root); root.querySelector<HTMLButtonElement>('button')!.click();
    expect(controller.value).toBe('accepted'); expect(root.hidden).toBe(true); expect(writes).not.toHaveBeenCalled(); expect(changed).toHaveBeenCalledTimes(1);
    controller.destroy(); controller.destroy(); expect(root.outerHTML).toBe(before);
    const persistent = createCookieConsent(root, {storageKey: 'hawiyah-test-consent'}); persistent.choose('rejected'); expect(localStorage.getItem('hawiyah-test-consent')).toBe('rejected'); persistent.destroy();
    const restored = createCookieConsent(root, {storageKey: 'hawiyah-test-consent'}); expect(restored.value).toBe('rejected'); expect(root.hidden).toBe(true); restored.destroy(); expect(root.outerHTML).toBe(before);
  });

  it('still emits a choice when the browser denies persistence', () => {
    const root = mount(`<section><button data-hw-consent="accepted">Accept</button></section>`); const changed = vi.fn();
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('Blocked'); }); vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Blocked'); });
    const controller = createCookieConsent(root, {storageKey: 'denied', onValueChange: changed}); controller.choose('accepted'); expect(changed).toHaveBeenCalledWith('accepted'); expect(root.hidden).toBe(true); controller.destroy();
  });
});

const treeMarkup = `<ul data-hw="tree-view" role="tree" aria-label="Services" dir="rtl"><li role="treeitem" data-hw-value="business" aria-expanded="false"><button type="button" data-hw-tree-toggle tabindex="-1" aria-label="Toggle business">+</button><span data-hw-tree-label>Business</span><ul role="group"><li role="treeitem" data-hw-value="blocked" aria-disabled="true"><span data-hw-tree-label>Blocked</span></li><li role="treeitem" data-hw-value="license"><span data-hw-tree-label>License</span></li></ul></li><li role="treeitem" data-hw-value="personal"><span data-hw-tree-label>Personal</span></li></ul>`;
describe('tree navigation', () => {
  it('expands in RTL, skips disabled nodes, selects by keyboard, and restores the DOM', () => {
    const root = mount(treeMarkup); const before = root.outerHTML; const changed = vi.fn(); const controller = createTreeView(root, {onValueChange: changed});
    const business = root.querySelector<HTMLElement>('[data-hw-value="business"]')!; business.focus(); expect(root.querySelector<HTMLElement>('[role="group"]')!.hidden).toBe(true);
    key(business, 'ArrowLeft'); expect(business.getAttribute('aria-expanded')).toBe('true'); key(business, 'ArrowLeft');
    expect((document.activeElement as HTMLElement).dataset.hwValue).toBe('license'); key(document.activeElement as HTMLElement, ' '); expect(controller.value).toBe('license'); expect(changed).toHaveBeenCalledWith('license');
    key(document.activeElement as HTMLElement, 'ArrowRight'); expect(document.activeElement).toBe(business); key(business, 'ArrowRight'); expect(business.getAttribute('aria-expanded')).toBe('false');
    key(business, 'ArrowDown'); expect((document.activeElement as HTMLElement).dataset.hwValue).toBe('personal');
    controller.destroy(); controller.destroy(); expect(root.outerHTML).toBe(before);
  });

  it('supports visible-node typeahead and leaves modified shortcuts alone', () => {
    vi.useFakeTimers(); const root = mount(treeMarkup); const controller = createTreeView(root); const business = root.querySelector<HTMLElement>('[data-hw-value="business"]')!;
    business.focus(); key(business, 'l'); expect(document.activeElement).toBe(business); vi.advanceTimersByTime(501);
    key(business, 'p'); expect((document.activeElement as HTMLElement).dataset.hwValue).toBe('personal');
    expect(key(document.activeElement as HTMLElement, 'Home', {ctrlKey: true}).defaultPrevented).toBe(false);
    controller.toggle('business'); vi.advanceTimersByTime(501); controller.focus('business'); key(business, 'l'); expect((document.activeElement as HTMLElement).dataset.hwValue).toBe('license');
    controller.toggle('business'); expect(document.activeElement).toBe(business);
    controller.destroy(); vi.runAllTimers(); expect(root.querySelectorAll('[tabindex="0"]')).toHaveLength(0);
  });

  it('rejects duplicate item values without partially modifying markup', () => {
    const root = mount(`<ul><li role="treeitem" data-hw-value="same">One</li><li role="treeitem" data-hw-value="same">Two</li></ul>`); const before = root.outerHTML;
    expect(() => createTreeView(root)).toThrow('unique'); expect(root.outerHTML).toBe(before);
  });
});

describe('carousel', () => {
  it('bounds navigation, announces position, and preserves slide content and authored state', () => {
    const root = mount(`<section data-hw="carousel" data-hw-slide-label="{position} of {total}" data-hw-empty-label="No slides" aria-label="Featured"><div><article data-hw-slide><a href="#one">First</a></article><article data-hw-slide hidden><a href="#two">Second</a></article></div><button data-hw-previous>Previous</button><span data-hw-carousel-status role="status">Ready</span><button data-hw-next>Next</button></section>`); const before = root.outerHTML; const changed = vi.fn(); const controller = createCarousel(root, {onValueChange: changed});
    const previous = root.querySelector<HTMLButtonElement>('[data-hw-previous]')!; const next = root.querySelector<HTMLButtonElement>('[data-hw-next]')!;
    expect(previous.disabled).toBe(true); expect(root.querySelector('[data-hw-carousel-status]')!.textContent).toBe('1 of 2');
    next.click(); expect(controller.index).toBe(1); expect(next.disabled).toBe(true); expect(root.querySelector<HTMLElement>('[data-hw-slide]')!.hidden).toBe(true); expect(changed).toHaveBeenCalledWith(1);
    controller.next(); expect(changed).toHaveBeenCalledTimes(1); controller.destroy(); controller.destroy(); expect(root.outerHTML).toBe(before);
    const looping = createCarousel(root, {loop: true}); looping.previous(); expect(looping.index).toBe(1); looping.next(); expect(looping.index).toBe(0); looping.destroy();
  });
});

describe('data table sorting', () => {
  it('sorts native row nodes numerically and stably, exposes aria-sort, and restores original order', () => {
    const root = mount(`<table data-hw="data-table" data-hw-locale="en"><caption>Requests</caption><thead><tr><th data-hw-key="name"><button data-hw-sort="name">Name</button></th><th data-hw-key="count" data-hw-type="number"><button data-hw-sort="count">Count</button></th></tr></thead><tbody>\n<tr id="a"><td>Item 10</td><td>١٠</td></tr><!-- retain --><tr id="b"><td>Item 2</td><td data-hw-sort-value="2">two</td></tr><tr id="c"><td>Item 2</td><td>٢</td></tr>\n</tbody></table>`); const before = root.outerHTML; const callback = vi.fn(); const controller = createDataTable(root, {onSortChange: callback}); const rowB = root.querySelector('#b');
    const ids = () => [...root.querySelectorAll('tbody tr')].map(row => row.id);
    controller.sort('count'); expect(ids()).toEqual(['b', 'c', 'a']); expect(root.querySelector('[data-hw-key="count"]')!.getAttribute('aria-sort')).toBe('ascending'); expect(root.querySelector('#b')).toBe(rowB);
    controller.sort('count'); expect(ids()).toEqual(['a', 'b', 'c']); expect(controller.sortDirection).toBe('descending');
    root.querySelector<HTMLButtonElement>('[data-hw-sort="name"]')!.click(); expect(ids()).toEqual(['b', 'c', 'a']); expect(root.querySelector('[data-hw-key="count"]')!.getAttribute('aria-sort')).toBe('none'); expect(callback).toHaveBeenLastCalledWith({key: 'name', direction: 'ascending'});
    controller.destroy(); controller.destroy(); expect(root.outerHTML).toBe(before); controller.sort('count'); expect(ids()).toEqual(['a', 'b', 'c']);
  });
});
