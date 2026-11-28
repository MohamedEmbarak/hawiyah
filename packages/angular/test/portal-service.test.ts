import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { contentOf, page } from './fixtures/page';
import { missingTextWarnings } from './fixtures/texts';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); });

const group = (name: string) => [{ label: 'Popular', links: [{ label: `${name} one`, href: `/${name}/one` }, { label: `${name} two`, href: `/${name}/two` }] }];
const links = [{ label: 'Services', href: '/services', groups: group('services') }, { label: 'Permits', href: '/permits', groups: group('permits') }, { label: 'About', href: '/about' }];
const press = (target: Element) => target.dispatchEvent(new Event('pointerdown', { bubbles: true }));
const leave = (from: Element, to: Element | null) => from.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: to }));

function header(attributes = '', state: Record<string, unknown> = {}) {
  const opened = vi.fn();
  const view = page(`<hw-portal-header brand="Portal" menuLabel="Menu" navigationLabel="Main navigation" [links]="links" ${attributes} (openChange)="opened($event)"><button type="button" id="sign-in">Sign in</button></hw-portal-header><button type="button" id="outside">Outside</button>`, { links, opened, ...state });
  const host = view.root.querySelector('hw-portal-header')!;
  const branches = [...host.querySelectorAll<HTMLDetailsElement>('details[data-hw-portal-branch]')];
  return { ...view, opened, host, branches, headings: branches.map(branch => branch.querySelector<HTMLElement>(':scope > summary')!), toggle: host.querySelector<HTMLButtonElement>('.hw-portal-menu-toggle')!, nav: host.querySelector('nav')!, outside: view.root.querySelector<HTMLElement>('#outside')! };
}

describe('hw-portal-header branches', () => {
  it('[PORTAL-01][portal-shell-1] a press on another branch heading closes nothing by itself; its click opens that branch and closes the open one', () => {
    const { fixture, branches, headings } = header();
    headings[0]!.click(); fixture.detectChanges(); expect(branches.map(branch => branch.open)).toEqual([true, false]);
    press(headings[1]!); fixture.detectChanges(); expect(branches.map(branch => branch.open)).toEqual([true, false]);
    // With a mouse the heading takes focus before the click is dispatched.
    leave(branches[0]!.querySelector('a')!, headings[1]!); fixture.detectChanges(); expect(branches.map(branch => branch.open)).toEqual([true, false]);
    headings[1]!.click(); fixture.detectChanges(); expect(branches.map(branch => branch.open)).toEqual([false, true]);
  });

  it('[PORTAL-02] without a press, focus that moves from an open branch to another heading closes the branch', () => {
    const { fixture, branches, headings } = header();
    headings[0]!.click(); fixture.detectChanges();
    leave(branches[0]!.querySelector('a')!, headings[1]!); fixture.detectChanges(); expect(branches.map(branch => branch.open)).toEqual([false, false]);
  });

  it('[PORTAL-03] a cancelled press, a key and the click itself clear the press', () => {
    for (const clear of ['pointercancel', 'keydown', 'click'] as const) {
      const { fixture, branches, headings } = header();
      headings[0]!.click(); fixture.detectChanges(); press(headings[1]!); fixture.detectChanges();
      if (clear === 'pointercancel') document.dispatchEvent(new Event('pointercancel', { bubbles: true }));
      else if (clear === 'keydown') headings[1]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
      else { headings[1]!.click(); fixture.detectChanges(); expect(branches.map(branch => branch.open)).toEqual([false, true]); }
      const open = clear === 'click' ? 1 : 0;
      leave(branches[open]!.querySelector('a')!, headings[1 - open]!); fixture.detectChanges(); expect(branches.map(branch => branch.open), clear).toEqual([false, false]);
      TestBed.resetTestingModule(); document.body.replaceChildren();
    }
  });

  it('[PORTAL-01] a press outside a heading still closes the open branch', () => {
    const { fixture, branches, headings, outside } = header();
    headings[0]!.click(); fixture.detectChanges(); press(outside); fixture.detectChanges(); expect(branches[0]!.open).toBe(false);
  });
});

describe('hw-portal-header open state', () => {
  it('[STATE-01][portal-shell-4] the toggle changes open and reports each change once', () => {
    const { fixture, toggle, nav, opened } = header();
    expect(toggle.getAttribute('aria-expanded')).toBe('false'); expect(nav.getAttribute('data-open')).toBe('false'); expect(toggle.querySelector('.hw-icon')!.getAttribute('data-icon')).toBe('menu-01');
    toggle.click(); fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('true'); expect(nav.getAttribute('data-open')).toBe('true'); expect(toggle.querySelector('.hw-icon')!.getAttribute('data-icon')).toBe('cancel-01');
    toggle.click(); fixture.detectChanges(); expect(opened.mock.calls).toEqual([[true], [false]]);
  });

  it('[STATE-03][STATE-04][STATE-05] a bound change reports nothing, [(open)] round-trips, and a header that starts open renders open', () => {
    const { fixture, toggle, nav, opened, state, update } = header('[(open)]="open"', { open: true });
    expect(toggle.getAttribute('aria-expanded')).toBe('true'); expect(nav.getAttribute('data-open')).toBe('true'); expect(opened).not.toHaveBeenCalled();
    update({ open: false }); expect(nav.getAttribute('data-open')).toBe('false'); expect(opened).not.toHaveBeenCalled();
    toggle.click(); fixture.detectChanges(); expect((state as { open?: boolean }).open).toBe(true); expect(opened.mock.calls).toEqual([[true]]);
    // The application closes the menu, for example after a route change.
    update({ open: false }); expect(toggle.getAttribute('aria-expanded')).toBe('false'); expect(opened).toHaveBeenCalledTimes(1);
  });

  it('[PORTAL-05] Escape, an outside press, focus leaving the header and a link each report false exactly once; Escape focuses the toggle', () => {
    const paths: Record<string, (view: ReturnType<typeof header>) => void> = {
      escape: view => { const link = view.nav.querySelector<HTMLElement>(':scope > ul > li > a')!; link.focus(); link.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })); },
      outside: view => { press(view.outside); },
      focus: view => { leave(view.toggle, view.outside); },
      link: view => { const link = view.nav.querySelector<HTMLAnchorElement>(':scope > ul > li > a')!; link.addEventListener('click', event => event.preventDefault()); link.click(); },
    };
    for (const [name, close] of Object.entries(paths)) {
      const view = header();
      view.toggle.click(); view.fixture.detectChanges(); close(view); view.fixture.detectChanges();
      expect(view.opened.mock.calls, name).toEqual([[true], [false]]); expect(view.toggle.getAttribute('aria-expanded'), name).toBe('false');
      if (name === 'escape') expect(document.activeElement).toBe(view.toggle);
      // A second closing event finds nothing to change.
      press(view.outside); view.fixture.detectChanges(); expect(view.opened, name).toHaveBeenCalledTimes(2);
      TestBed.resetTestingModule(); document.body.replaceChildren();
    }
  });
});

describe('hw-portal-header brand and structure', () => {
  it('[PORTAL-08][E04] without a home link the brand is a div, an image with a name when brandLabel is given; with one it is a link without a role', () => {
    const { root } = page(`<hw-portal-header brand="Portal" menuLabel="Menu" navigationLabel="Main" /><hw-portal-header homeHref="" brandLabel="National portal" menuLabel="Menu" navigationLabel="Main"><svg hwBrand viewBox="0 0 1 1"></svg></hw-portal-header><hw-portal-header homeHref="" brand="Portal" menuLabel="Menu" navigationLabel="Main" /><hw-portal-header homeHref="/home" brandLabel="National portal" menuLabel="Menu" navigationLabel="Main"><svg hwBrand viewBox="0 0 1 1"></svg></hw-portal-header>`);
    const brands = [...root.querySelectorAll('.hw-portal-brand')];
    expect(brands).toHaveLength(4);
    expect([brands[0]!.localName, brands[0]!.getAttribute('href'), brands[0]!.hasAttribute('role'), brands[0]!.hasAttribute('aria-label'), brands[0]!.textContent]).toEqual(['a', '/', false, false, 'Portal']);
    expect([brands[1]!.localName, brands[1]!.getAttribute('role'), brands[1]!.getAttribute('aria-label'), brands[1]!.hasAttribute('href')]).toEqual(['div', 'img', 'National portal', false]);
    expect([brands[2]!.localName, brands[2]!.hasAttribute('role'), brands[2]!.hasAttribute('aria-label'), brands[2]!.textContent]).toEqual(['div', false, false, 'Portal']);
    expect([brands[3]!.localName, brands[3]!.getAttribute('href'), brands[3]!.hasAttribute('role'), brands[3]!.getAttribute('aria-label')]).toEqual(['a', '/home', false, 'National portal']);
    // [SSR-03] the projected artwork exists once, in whichever element the brand is.
    expect(brands[1]!.querySelectorAll('svg[hwBrand]')).toHaveLength(1); expect(brands[3]!.querySelectorAll('svg[hwBrand]')).toHaveLength(1); expect(root.querySelectorAll('svg[hwBrand]')).toHaveLength(2);
  });

  it('[PORTAL-08] the brand follows a change of homeHref and keeps its projected artwork', () => {
    const { root, update } = page(`<hw-portal-header [homeHref]="home" brandLabel="National portal" menuLabel="Menu" navigationLabel="Main"><svg hwBrand viewBox="0 0 1 1"></svg></hw-portal-header>`, { home: '/' });
    expect(root.querySelector('a.hw-portal-brand > svg')).not.toBeNull();
    update({ home: '' }); expect(root.querySelector('a.hw-portal-brand')).toBeNull(); expect(root.querySelector('div.hw-portal-brand[role=img] > svg')).not.toBeNull();
  });

  it('[PORTAL-06][SHAPE-01][E06] brand, menu toggle, navigation and actions are direct children of the header, in the documented order', () => {
    const { host } = header('brandLabel="National portal" homeHref="/home"');
    const root = host.querySelector(':scope > header.hw-portal-header')!;
    expect([...root.children].map(child => child.matches('nav') ? 'nav' : `${child.localName}.${child.classList.item(child.classList.length - 1)}`)).toEqual(['div.hw-portal-notice', 'a.hw-portal-brand', 'button.hw-portal-menu-toggle', 'nav', 'div.hw-portal-header-actions']);
    expect(host.querySelector('.hw-portal-header-main, .hw-portal-header-inner')).toBeNull();
    expect([...root.querySelectorAll('nav > ul > li')].map(item => item.firstElementChild!.localName === 'details' ? `branch:${item.querySelector('summary')!.textContent}` : `link:${item.textContent}`)).toEqual(['branch:Services', 'branch:Permits', 'link:About']);
  });

  it('[LAYOUT-01][E06] the regions of an app shell are direct children of the shell', () => {
    const { root } = page(`<hw-app-shell skipLabel="Skip" mainId="main"><nav hwAppShellSidebar>Side</nav><p>Body</p></hw-app-shell>`);
    const shell = root.querySelector('.hw-app-shell')!;
    expect(shell.querySelector(':scope > main.hw-app-shell-main')).not.toBeNull(); expect(shell.querySelector(':scope > aside.hw-app-shell-sidebar')).not.toBeNull(); expect(shell.querySelector('.hw-app-shell-body')).toBeNull();
  });
});

describe('hw-service-card', () => {
  const metadata = [{ term: 'Duration', description: '3 days' }, { term: 'Fee', description: 'No fee' }];
  const facts = (root: Element) => [...root.querySelectorAll('dl.hw-description-list > div')].map(row => [...row.children].map(child => `${child.localName}:${child.textContent}`));

  it('[SERVICE-01][SHAPE-01][service-patterns-1][service-patterns-2] one outline: header with category and title, body with description and facts, footer with one link', () => {
    const { root } = page(`<hw-service-card title="Event permit" description="Apply for a permit." category="Community" [metadata]="metadata" href="/permit" actionLabel="View the service" variant="featured" />`, { metadata });
    const card = root.querySelector('hw-service-card > article.hw-card.hw-service-card')!;
    expect(card.getAttribute('data-variant')).toBe('featured');
    expect([...card.children].map(child => `${child.localName}.${child.className}`)).toEqual(['header.hw-card-header', 'div.hw-card-body', 'footer.hw-card-footer']);
    const [icon, heading] = [...card.querySelector('header')!.children];
    expect(icon!.className).toBe('hw-service-card-icon'); expect(icon!.getAttribute('aria-hidden')).toBe('true'); expect(contentOf(icon!)).toEqual([]);
    expect([...heading!.children].map(child => `${child.localName}.${child.className}`)).toEqual(['span.hw-badge', 'h3.']); expect(heading!.firstElementChild!.getAttribute('data-tone')).toBe('neutral'); expect(heading!.firstElementChild!.textContent).toBe('Community');
    const title = card.querySelector('h3')!; expect(title.textContent).toBe('Event permit'); expect(title.querySelector('a')).toBeNull(); expect(contentOf(title).map(node => node.nodeType)).toEqual([Node.TEXT_NODE]);
    const body = card.querySelector('.hw-card-body')!;
    expect([...body.children].map(child => child.localName)).toEqual(['p', 'dl']); expect(body.querySelector('p')!.textContent).toBe('Apply for a permit.');
    expect(facts(body)).toEqual([['dt:Duration', 'dd:3 days'], ['dt:Fee', 'dd:No fee']]); expect(body.querySelector('dl')!.hasAttribute('data-variant')).toBe(false);
    expect(card.querySelector('.hw-service-card-meta, hw-description-list')).toBeNull();
    const action = card.querySelector('footer > a.hw-link')!; expect(action.getAttribute('href')).toBe('/permit'); expect(action.textContent).toBe('View the service');
    expect(card.querySelectorAll('a, button, [tabindex]')).toHaveLength(1);
  });

  it('[SERVICE-00] no description list without metadata, no paragraph without a description, no badge without a category', () => {
    const { root } = page(`<hw-service-card title="Plain" /><hw-service-card title="Empty" [metadata]="[]" />`);
    expect(root.querySelector('dl, p, .hw-badge')).toBeNull();
  });

  it('[SERVICE-02][TEXT-02][R18][RICH-03] the action: none without href, a link with href, or the application\'s own; actionLabel is asked for with href alone', () => {
    const warnings = missingTextWarnings();
    const { root, update } = page(`<hw-service-card title="No action" /><hw-service-card title="Own action" href="/own"><span hwServiceIcon class="hw-icon" data-icon="link-04"></span><a hwButton variant="secondary" hwServiceAction href="/start">Start</a></hw-service-card><hw-service-card title="Own without href"><button type="button" hwServiceAction>Start</button></hw-service-card>`);
    update();
    const [none, own, button] = [...root.querySelectorAll('hw-service-card')];
    expect(none!.querySelector('a, button')).toBeNull(); expect(contentOf(none!.querySelector('footer')!)).toEqual([]); expect(none!.querySelector('footer')!.matches(':empty')).toBe(true); expect(none!.querySelector('.hw-service-card-icon')!.matches(':empty')).toBe(true);
    expect([...own!.querySelectorAll('a, button')].map(element => [element.parentElement!.localName, element.getAttribute('href'), element.textContent])).toEqual([['footer', '/start', 'Start']]); expect(own!.querySelector('a.hw-link')).toBeNull();
    expect(own!.querySelector('.hw-service-card-icon > [hwServiceIcon]')).not.toBeNull();
    expect([...button!.querySelectorAll('a, button')].map(element => element.parentElement!.localName)).toEqual(['footer']);
    expect(warnings).toEqual([]);
    const missing = page(`<hw-service-card title="Missing" href="/permit" />`); missing.update();
    expect(missing.root.querySelector('footer > a.hw-link')!.textContent).toBe(''); expect(warnings.map(warning => warning.split('.')[0])).toEqual(['Hawiyah: hw-service-card requires "actionLabel" when href is set and no [hwServiceAction] content is projected']);
  });
});

describe('hw-service-details', () => {
  it('[SERVICE-04][SHAPE-01][service-patterns-7] an article with header, facts, a requirements section and the action in a footer as the last child', () => {
    const { root } = page(`<hw-service-details title="Event permit" description="What you need." [metadata]="[{term: 'Fee', description: 'No fee'}, {term: 'Duration', description: '3 days'}]" [requirements]="['National ID', 'Address']" requirementsLabel="Requirements"><p class="note">Note</p><button hwButton type="button" hwServiceAction>Start</button></hw-service-details>`);
    const details = root.querySelector('hw-service-details > article.hw-service-details')!;
    expect(root.querySelector('section.hw-service-details, hw-description-list')).toBeNull();
    expect([...details.children].map(child => child.localName)).toEqual(['header', 'dl', 'section', 'p', 'footer']);
    expect([...details.querySelector('header')!.children].map(child => `${child.localName}:${child.textContent}`)).toEqual(['h2:Event permit', 'p:What you need.']);
    const list = details.querySelector(':scope > dl.hw-description-list')!; expect(list.hasAttribute('data-variant')).toBe(false); expect([...list.querySelectorAll('dt')].map(term => term.textContent)).toEqual(['Fee', 'Duration']);
    const section = details.querySelector(':scope > section')!;
    expect([...section.children].map(child => child.localName)).toEqual(['h3', 'ul']); expect(section.querySelector('h3')!.textContent).toBe('Requirements'); expect([...section.querySelectorAll('li')].map(item => item.textContent)).toEqual(['National ID', 'Address']);
    expect(details.lastElementChild!.localName).toBe('footer'); expect(details.querySelector(':scope > footer > button[hwServiceAction]')!.textContent).toBe('Start');
  });

  it('[TEXT-01][TEXT-02][R17] requirementsLabel is asked for only with requirements; without it the list has no heading', () => {
    const warnings = missingTextWarnings();
    const { root, update } = page(`<hw-service-details title="Plain" />`);
    update();
    const plain = root.querySelector('article')!;
    expect([...plain.children].map(child => child.localName)).toEqual(['header', 'footer']); expect(plain.querySelector('header p, dl, section')).toBeNull();
    // [RICH-03] the empty footer holds nothing, so the stylesheet hides it.
    expect(contentOf(plain.querySelector('footer')!)).toEqual([]); expect(plain.querySelector('footer')!.matches(':empty')).toBe(true); expect(warnings).toEqual([]);
    const missing = page(`<hw-service-details title="Permit" [requirements]="['National ID']" />`); missing.update();
    expect(missing.root.querySelector('section h3')).toBeNull(); expect([...missing.root.querySelectorAll('section > ul > li')].map(item => item.textContent)).toEqual(['National ID']);
    expect(warnings.map(warning => warning.split('.')[0])).toEqual(['Hawiyah: hw-service-details requires "requirementsLabel" when requirements are given']);
  });

  it('[RICH-01][RICH-02] requirementTemplate displays each requirement in its list item; without it the strings are listed', () => {
    const { root } = page(`<hw-service-details title="Permit" [requirements]="requirements" requirementsLabel="Requirements" [requirementTemplate]="entry" /><hw-service-details title="Permit" [requirements]="requirements" requirementsLabel="Requirements" /><ng-template #entry let-requirement let-index="index">{{ index + 1 }}. <a [href]="'/help/' + index">{{ requirement }}</a></ng-template>`, { requirements: ['National ID', 'Address'] });
    const [rich, plain] = [...root.querySelectorAll('hw-service-details')];
    expect([...rich!.querySelectorAll('li')].map(item => [item.textContent, item.querySelector('a')!.getAttribute('href')])).toEqual([['1. National ID', '/help/0'], ['2. Address', '/help/1']]);
    expect([...plain!.querySelectorAll('li')].map(item => [item.textContent, item.querySelector('a')])).toEqual([['National ID', null], ['Address', null]]);
  });
});
