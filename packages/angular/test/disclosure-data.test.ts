import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { text, withText } from './fixtures/application-text';
import { contentOf, page } from './fixtures/page';
import { missingTextWarnings } from './fixtures/texts';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); });

const forwarded = ['aria-label', 'aria-labelledby', 'aria-describedby'];
const bare = (host: Element) => { for (const name of forwarded) expect(host.hasAttribute(name), `${host.localName} ${name}`).toBe(false); };
const later = () => new Promise(resolve => setTimeout(resolve, 0));

describe('hw-accordion', () => {
  const items = [{ value: 'fees', title: 'Fees', content: 'No fee.', open: true }, { value: 'time', title: 'Time', content: 'Three days.' }];
  const templates = `<ng-template #title let-item let-index="index"><span class="hw-icon" data-icon="link-04" aria-hidden="true"></span><span class="text">{{ index + 1 }}. {{ item.title }}</span> <a href="https://example.org/help">Help</a></ng-template><ng-template #content let-item><p>{{ item.content }}</p><a href="https://example.org/more">More</a></ng-template>`;

  it('[RICH-01][disclosure-data-3] title and content templates render inside the summary and the content element', () => {
    const { root } = page(`<hw-accordion [items]="items" [titleTemplate]="title" [contentTemplate]="content" />${templates}`, { items });
    const [first, second] = [...root.querySelectorAll('details.hw-accordion-item')];
    const summary = first!.querySelector(':scope > summary.hw-accordion-trigger')!, content = first!.querySelector(':scope > div.hw-accordion-content')!;
    expect(summary.querySelector('.hw-icon[data-icon="link-04"]')).not.toBeNull(); expect(summary.querySelector('a')!.textContent).toBe('Help'); expect(summary.querySelector('.text')!.textContent).toBe('1. Fees');
    expect(content.querySelector('p')!.textContent).toBe('No fee.'); expect(content.querySelector('a')!.getAttribute('href')).toBe('https://example.org/more');
    expect(second!.querySelector('summary .text')!.textContent).toBe('2. Time'); expect(first!.open).toBe(true); expect(second!.open).toBe(false);
  });

  it('[RICH-02] a click on a link inside a rich title does not toggle the item; a click on the title text does', () => {
    const toggled = vi.fn();
    const { root, fixture } = page(`<hw-accordion [items]="items" [titleTemplate]="title" (toggled)="toggled($event)" />${templates}`, { items, toggled });
    const second = root.querySelectorAll<HTMLDetailsElement>('details')[1]!;
    const link = second.querySelector('summary a')!; link.addEventListener('click', event => event.preventDefault());
    (link as HTMLElement).click(); fixture.detectChanges(); expect(second.open).toBe(false); expect(toggled).not.toHaveBeenCalled();
    second.querySelector<HTMLElement>('summary .text')!.click(); fixture.detectChanges(); expect(second.open).toBe(true);
    // [SHAPE-02] the notification carries the value of the item.
    expect(toggled).toHaveBeenCalledExactlyOnceWith({ value: 'time', open: true });
  });

  it('[SHAPE-01] the shared item shape {value, title, content, open} renders text, and content may be left to a template', () => {
    const { root } = page(`<hw-accordion [items]="items" /><hw-accordion [items]="[{value: 'only', title: 'Only'}]" />`, { items });
    const [plain, bare] = [...root.querySelectorAll('hw-accordion')];
    expect([...plain!.querySelectorAll('details')].map(details => [details.querySelector('summary')!.textContent, details.querySelector('.hw-accordion-content')!.textContent, details.open])).toEqual([['Fees', 'No fee.', true], ['Time', 'Three days.', false]]);
    expect(contentOf(plain!.querySelector('summary')!).map(node => node.nodeType)).toEqual([Node.TEXT_NODE]);
    expect(bare!.querySelector('.hw-accordion-content')!.textContent).toBe('');
  });

  it('[ATTR-03] aria-label or aria-labelledby on the host names div.hw-accordion as a group; without one it has no role', () => {
    const { root, update } = page(`<h2 id="faq">Questions</h2><p id="note">Note</p><hw-accordion [items]="items" /><hw-accordion aria-label="Questions" aria-describedby="note" [items]="items" /><hw-accordion aria-labelledby="faq" [items]="items" /><hw-accordion [aria-label]="name" [items]="items" />`, { items, name: 'Bound' as string | null });
    const hosts = [...root.querySelectorAll('hw-accordion')], roots = hosts.map(host => host.querySelector(':scope > div.hw-accordion')!);
    hosts.forEach(bare);
    expect(roots[0]!.hasAttribute('role')).toBe(false); expect(roots[0]!.hasAttribute('aria-label')).toBe(false);
    expect(roots[1]!.getAttribute('role')).toBe('group'); expect(roots[1]!.getAttribute('aria-label')).toBe('Questions'); expect(roots[1]!.getAttribute('aria-describedby')).toBe('note');
    expect(roots[2]!.getAttribute('role')).toBe('group'); expect(roots[2]!.getAttribute('aria-labelledby')).toBe('faq'); expect(roots[2]!.hasAttribute('aria-label')).toBe(false);
    expect(roots[3]!.getAttribute('aria-label')).toBe('Bound'); update({ name: null }); expect(roots[3]!.hasAttribute('aria-label')).toBe(false); expect(roots[3]!.hasAttribute('role')).toBe(false);
  });
});

describe('hw-collapsible', () => {
  it('[COLLAPSIBLE-01][disclosure-data-5] a disabled collapsible keeps its summary focusable and named, and does not open', async () => {
    const changed = vi.fn();
    const { root, fixture } = page(`<hw-collapsible label="More" (openChange)="changed($event)"><p>Details</p></hw-collapsible><hw-collapsible label="Unavailable" disabled (openChange)="changed($event)"><p>Details</p></hw-collapsible>`, { changed });
    const [open, disabled] = [...root.querySelectorAll<HTMLDetailsElement>('details.hw-collapsible')];
    const summary = disabled!.querySelector('summary')!;
    expect(summary.getAttribute('aria-disabled')).toBe('true'); expect(summary.textContent).toBe('Unavailable'); expect(summary.hasAttribute('tabindex')).toBe(false); expect(open!.querySelector('summary')!.hasAttribute('aria-disabled')).toBe(false);
    summary.focus(); expect(document.activeElement).toBe(summary);
    summary.click(); for (const key of ['Enter', ' ']) summary.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    await later(); fixture.detectChanges();
    expect(disabled!.open).toBe(false); expect(changed).not.toHaveBeenCalled(); expect(document.activeElement).toBe(summary);
    // The same press opens a collapsible that is not disabled.
    open!.querySelector('summary')!.click(); await later(); fixture.detectChanges(); expect(open!.open).toBe(true); expect(changed).toHaveBeenCalledExactlyOnceWith(true);
  });

  it('[COLLAPSIBLE-02] disabled and opened by the application: it stays open and the reader cannot close it', async () => {
    const changed = vi.fn();
    const { root, fixture, update } = page(`<hw-collapsible label="More" disabled [open]="open" (openChange)="changed($event)"><p>Details</p></hw-collapsible>`, { changed, open: true });
    const details = root.querySelector('details')!;
    expect(details.open).toBe(true);
    details.querySelector('summary')!.click(); await later(); fixture.detectChanges(); expect(details.open).toBe(true);
    // A toggle that reaches the element another way is put back.
    details.open = false; details.dispatchEvent(new Event('toggle')); expect(details.open).toBe(true); expect(changed).not.toHaveBeenCalled();
    update({ open: false }); expect(details.open).toBe(false);
  });
});

describe('hw-carousel', () => {
  const slides = [{ id: 'a', title: 'One' }, { id: 'b', title: 'Two' }, { id: 'c', title: 'Three' }];
  const mount = (attributes = '', state: Record<string, unknown> = {}) => {
    const changed = vi.fn();
    const view = page(`<hw-carousel label="Highlights" ${withText.carousel} [slides]="slides" ${attributes} (currentChange)="changed($event)" />`, { text, slides, changed, ...state });
    return { ...view, changed, previous: view.root.querySelector<HTMLButtonElement>('[data-hw-previous]')!, next: view.root.querySelector<HTMLButtonElement>('[data-hw-next]')! };
  };

  it('[FOCUS-01][FOCUS-02][FOCUS-03][disclosure-data-10] at the last slide Next keeps focus and its name, is aria-disabled and ignores activation', () => {
    const { fixture, changed, previous, next } = mount();
    expect(previous.getAttribute('aria-disabled')).toBe('true'); expect(previous.disabled).toBe(false); expect(next.hasAttribute('aria-disabled')).toBe(false);
    next.focus(); next.click(); fixture.detectChanges(); next.click(); fixture.detectChanges();
    expect(changed.mock.calls).toEqual([[1], [2]]);
    expect(document.activeElement).toBe(next); expect(next.getAttribute('aria-disabled')).toBe('true'); expect(next.disabled).toBe(false); expect(next.getAttribute('aria-label')).toBe('Next slide');
    next.click(); fixture.detectChanges(); expect(changed).toHaveBeenCalledTimes(2); expect(document.activeElement).toBe(next);
    previous.click(); fixture.detectChanges(); expect(next.hasAttribute('aria-disabled')).toBe(false); expect(previous.hasAttribute('aria-disabled')).toBe(false);
  });

  it('[CAROUSEL-01] one slide disables both arrows; a looping carousel has neither attribute at its ends', () => {
    const single = mount('', { slides: [slides[0]] });
    for (const arrow of [single.previous, single.next]) { expect(arrow.disabled).toBe(true); expect(arrow.hasAttribute('aria-disabled')).toBe(false); }
    const loop = mount('loop');
    for (const arrow of [loop.previous, loop.next]) { expect(arrow.disabled).toBe(false); expect(arrow.hasAttribute('aria-disabled')).toBe(false); }
    loop.previous.click(); loop.fixture.detectChanges(); expect(loop.changed).toHaveBeenCalledExactlyOnceWith(2); expect(loop.next.hasAttribute('aria-disabled')).toBe(false);
  });

  it('[NAME-01][NAME-02][NAME-03][ATTR-03][E08] label, aria-label or aria-labelledby names the region; the host keeps none of them', () => {
    const { root, update } = page(`<h2 id="heading">Heading</h2><p id="note">Note</p>
      <hw-carousel label="Highlights" ${withText.carousel} [slides]="slides" />
      <hw-carousel aria-label="Static name" aria-describedby="note" ${withText.carousel} [slides]="slides" />
      <hw-carousel aria-labelledby="heading" ${withText.carousel} [slides]="slides" />
      <hw-carousel [aria-label]="name" label="Ignored" ${withText.carousel} [slides]="slides" />
      <hw-carousel aria-labelledby="heading" label="Both" ${withText.carousel} [slides]="slides" />`, { text, slides, name: 'Bound name' });
    const hosts = [...root.querySelectorAll('hw-carousel')], regions = hosts.map(host => host.querySelector('section.hw-carousel[role=region]')!);
    hosts.forEach(bare);
    expect(regions[0]!.getAttribute('aria-label')).toBe('Highlights'); expect(regions[0]!.hasAttribute('aria-labelledby')).toBe(false);
    expect(regions[1]!.getAttribute('aria-label')).toBe('Static name'); expect(regions[1]!.getAttribute('aria-describedby')).toBe('note');
    expect(regions[2]!.getAttribute('aria-labelledby')).toBe('heading'); expect(regions[2]!.hasAttribute('aria-label')).toBe(false);
    expect(regions[3]!.getAttribute('aria-label')).toBe('Bound name'); update({ name: 'Other' }); expect(regions[3]!.getAttribute('aria-label')).toBe('Other');
    expect(regions[4]!.getAttribute('aria-labelledby')).toBe('heading'); expect(regions[4]!.getAttribute('aria-label')).toBe('Both');
  });

  it('[NAME-04][E08] a carousel without any name writes no aria-label and warns once', () => {
    const warnings = missingTextWarnings();
    const { root, update } = page(`<hw-carousel ${withText.carousel} [slides]="slides" />`, { text, slides });
    update();
    expect(root.querySelector('section')!.hasAttribute('aria-label')).toBe(false);
    expect(warnings.map(warning => warning.split('.')[0])).toEqual(['Hawiyah: hw-carousel requires "label"']);
  });
});

describe('hw-pagination', () => {
  const mount = (attributes: string, state: Record<string, unknown> = {}) => {
    const changed = vi.fn();
    const view = page(`<hw-pagination ${withText.pagination} ${attributes} (pageChange)="changed($event)" />`, { text, changed, ...state });
    return { ...view, changed, previous: view.root.querySelector<HTMLButtonElement>('[data-hw-previous]')!, next: view.root.querySelector<HTMLButtonElement>('[data-hw-next]')! };
  };

  it('[FOCUS-01][FOCUS-02][FOCUS-03][disclosure-data-10] at the last page Next keeps focus and its name, is aria-disabled and ignores activation', () => {
    const { fixture, changed, previous, next } = mount('[totalPages]="3" [page]="1"');
    expect(previous.getAttribute('aria-disabled')).toBe('true'); expect(previous.disabled).toBe(false); expect(next.hasAttribute('aria-disabled')).toBe(false);
    next.focus(); next.click(); fixture.detectChanges(); next.click(); fixture.detectChanges();
    expect(changed.mock.calls).toEqual([[2], [3]]);
    expect(document.activeElement).toBe(next); expect(next.getAttribute('aria-disabled')).toBe('true'); expect(next.disabled).toBe(false); expect(next.getAttribute('aria-label')).toBe('Next page');
    next.click(); fixture.detectChanges(); expect(changed).toHaveBeenCalledTimes(2); expect(document.activeElement).toBe(next);
    previous.click(); fixture.detectChanges(); expect(next.hasAttribute('aria-disabled')).toBe(false); expect(previous.hasAttribute('aria-disabled')).toBe(false);
  });

  it('[PAGINATION-01] a disabled pagination has natively disabled arrows and no aria-disabled from a bound', () => {
    const { previous, next } = mount('[totalPages]="3" [page]="1" disabled');
    for (const arrow of [previous, next]) { expect(arrow.disabled).toBe(true); expect(arrow.hasAttribute('aria-disabled')).toBe(false); }
  });
});

describe('hw-breadcrumb', () => {
  const trail = (items: unknown[]) => page(`<hw-breadcrumb label="Breadcrumb" [items]="items" />`, { items }).root.querySelector('nav.hw-breadcrumb')!;
  const shape = (nav: Element) => [...nav.querySelectorAll('li')].map(item => { const child = item.firstElementChild!; return [child.localName, child.textContent, ...[...child.attributes].filter(attribute => !attribute.name.startsWith('_ng')).map(attribute => `${attribute.name}=${attribute.value}`).sort()]; });

  it('[BREADCRUMB-01][nav-a-11] the last item is the current page: text, never a link or a tab stop, also with an href', () => {
    const nav = trail([{ label: 'Home', href: 'https://example.org/' }, { label: 'Permit', href: 'https://example.org/permit' }]);
    expect(shape(nav)).toEqual([['a', 'Home', 'href=https://example.org/'], ['span', 'Permit', 'aria-current=page']]);
    expect(nav.querySelectorAll('[aria-current]')).toHaveLength(1); expect(nav.querySelectorAll('a, [tabindex]')).toHaveLength(1);
  });

  it('[BREADCRUMB-02] an earlier item flagged current is the only current one; the last item is then an ordinary link', () => {
    const nav = trail([{ label: 'Home', href: 'https://example.org/' }, { label: 'Permits', href: 'https://example.org/permits', current: true }, { label: 'Archive', href: 'https://example.org/archive' }]);
    expect(shape(nav)).toEqual([['a', 'Home', 'href=https://example.org/'], ['span', 'Permits', 'aria-current=page'], ['a', 'Archive', 'href=https://example.org/archive']]);
  });

  it('[BREADCRUMB-03][SHAPE-01] a disabled item is an unavailable link without an href; the shared shape renders one DOM', () => {
    const nav = trail([{ label: 'Home', href: 'https://example.org/' }, { label: 'Permits', href: 'https://example.org/permits', current: true }, { label: 'Archive', href: 'https://example.org/archive', disabled: true }, { label: 'Plain' }]);
    expect(shape(nav)).toEqual([['a', 'Home', 'href=https://example.org/'], ['span', 'Permits', 'aria-current=page'], ['span', 'Archive', 'aria-disabled=true', 'role=link'], ['span', 'Plain']]);
    // A current item that is also disabled is still the current page.
    expect(shape(trail([{ label: 'Only', href: 'https://example.org/', disabled: true }]))).toEqual([['span', 'Only', 'aria-current=page']]);
  });
});

describe('hw-page-header', () => {
  it('[PAGE-HEADER-01][layout-3] level chooses the heading element; out-of-range and fractional levels are clamped', () => {
    const { root, update } = page(`<hw-page-header title="Services" /><hw-page-header title="Embedded" [level]="level" />`, { level: 2 as number });
    const [first, second] = [...root.querySelectorAll('hw-page-header')];
    const heading = (host: Element) => host.querySelector('header.hw-page-header > .hw-page-header-main > div > :is(h1, h2, h3, h4, h5, h6)')!;
    expect(heading(first!).localName).toBe('h1'); expect(heading(second!).localName).toBe('h2'); expect(heading(second!).textContent).toBe('Embedded'); expect(second!.querySelector('h1')).toBeNull();
    for (const [level, tag] of [[0, 'h1'], [9, 'h6'], [2.5, 'h2'], [Number.NaN, 'h1'], [3, 'h3'], [4, 'h4'], [5, 'h5'], [6, 'h6']] as const) { update({ level }); expect(heading(second!).localName, String(level)).toBe(tag); expect(second!.querySelectorAll('h1, h2, h3, h4, h5, h6')).toHaveLength(1); }
  });
});
