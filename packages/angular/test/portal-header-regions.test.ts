import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { contentOf, page } from './fixtures/page';
import { missingTextWarnings } from './fixtures/texts';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); });

const links = [{ label: 'Services', href: '/services', current: true }, { label: 'About', href: '/about' }];
const header = `brand="Portal" mainId="content" skipLabel="Skip to content" menuLabel="Menu" navigationLabel="Main navigation" [links]="links"`;
const order = (root: Element) => [...root.querySelector('header.hw-portal-header')!.children].map(child => child.matches('nav') ? 'nav' : `${child.localName}.${child.classList.item(child.classList.length - 1)}`);

describe('portal header notice and actions', () => {
  it('[ph-notice] renders the notice between the skip link and the brand, holding exactly the application content', () => {
    const { root } = page(`<hw-portal-header ${header}><p hwPortalNotice>This is a <a href="/beta">beta</a> service.</p><button type="button">Sign in</button></hw-portal-header><main id="content"></main>`, { links });
    const notice = root.querySelector('.hw-portal-notice')!;
    expect(notice.localName).toBe('div'); expect(notice.parentElement!.matches('header.hw-portal-header')).toBe(true);
    expect(order(root)).toEqual(['a.hw-skip-link', 'div.hw-portal-notice', 'a.hw-portal-brand', 'button.hw-portal-menu-toggle', 'nav', 'div.hw-portal-header-actions']);
    expect(contentOf(notice)).toHaveLength(1); expect(notice.firstElementChild!.matches('p[hwPortalNotice]')).toBe(true); expect(notice.textContent).toBe('This is a beta service.');
    // Focusable content of the notice comes before the brand in the tab order.
    const focusable = [...root.querySelectorAll('header a[href], header button')];
    expect(focusable.indexOf(notice.querySelector('a')!)).toBe(1); expect(focusable.indexOf(root.querySelector('.hw-portal-brand')!)).toBe(2);
    // Without mainId there is no skip link and the notice is the first child.
    const bare = page(`<hw-portal-header brand="Portal" menuLabel="Menu" navigationLabel="Main navigation"><p hwPortalNotice>Notice</p></hw-portal-header>`);
    expect(order(bare.root)).toEqual(['div.hw-portal-notice', 'a.hw-portal-brand', 'div.hw-portal-header-actions']);
  });

  it('[ph-notice-absent] keeps an empty notice container, which the stylesheet hides', () => {
    const { root } = page(`<hw-portal-header ${header}><button type="button">Sign in</button></hw-portal-header><main id="content"></main>`, { links });
    const notice = root.querySelector('header.hw-portal-header > .hw-portal-notice')!;
    expect(contentOf(notice)).toEqual([]); expect(notice.textContent).toBe('');
  });

  it('[ph-notice-no-text-contract] asks for no text and adds no semantics to the notice', () => {
    const warnings = missingTextWarnings();
    const { root, update } = page(`<hw-portal-header ${header}><p hwPortalNotice>Notice</p></hw-portal-header><hw-portal-header ${header.replace('mainId="content" skipLabel="Skip to content"', '')} /><main id="content"></main>`, { links });
    update();
    for (const notice of root.querySelectorAll('.hw-portal-notice')) expect([...notice.attributes].map(attribute => attribute.name).filter(name => name === 'role' || name.startsWith('aria-'))).toEqual([]);
    expect(root.querySelectorAll('.hw-portal-notice')).toHaveLength(2); expect(warnings).toEqual([]);
  });

  it('[ph-actions-class] renders the actions in hw-portal-header-actions, after the navigation', () => {
    const { root } = page(`<hw-portal-header ${header}><button type="button" id="sign-in">Sign in</button><a href="/en" id="language">English</a></hw-portal-header><main id="content"></main>`, { links });
    const actions = root.querySelector('header.hw-portal-header > div.hw-portal-header-actions')!;
    expect([...actions.children].map(child => child.id)).toEqual(['sign-in', 'language']);
    expect(root.querySelector('header nav')!.compareDocumentPosition(actions) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy(); expect(actions).toBe(root.querySelector('header.hw-portal-header')!.lastElementChild);
    expect(root.querySelector('.hw-portal-actions')).toBeNull();
  });

  it('[ph-actions-absent] keeps an empty actions container, which the stylesheet hides', () => {
    const { root } = page(`<hw-portal-header ${header}><p hwPortalNotice>Notice</p></hw-portal-header><main id="content"></main>`, { links });
    expect(contentOf(root.querySelector('header.hw-portal-header > .hw-portal-header-actions')!)).toEqual([]); expect(root.querySelector('.hw-portal-actions')).toBeNull();
  });

  it('[ph-layout-notice] passes a notice projected into hw-portal-layout to its header', () => {
    const { root } = page(`<hw-portal-layout brand="Portal" mainId="layout-main" skipLabel="Skip to content" menuLabel="Menu" navigationLabel="Main navigation" externalLabel="opens in a new window" [links]="links"><p hwPortalNotice id="notice">Scheduled maintenance tonight.</p><button hwPortalActions type="button" id="sign-in">Sign in</button><p id="body">Content</p></hw-portal-layout>`, { links });
    const notice = root.querySelector('hw-portal-header header.hw-portal-header > .hw-portal-notice')!;
    expect([...notice.children].map(child => child.id)).toEqual(['notice']); expect(notice.textContent).toBe('Scheduled maintenance tonight.');
    expect(order(root)).toEqual(['a.hw-skip-link', 'div.hw-portal-notice', 'a.hw-portal-brand', 'button.hw-portal-menu-toggle', 'nav', 'div.hw-portal-header-actions']);
    expect(root.querySelector('.hw-portal-header-actions > #sign-in')).not.toBeNull(); expect(root.querySelector('main > #body')).not.toBeNull(); expect(root.querySelectorAll('#notice')).toHaveLength(1);
    // Without one the header keeps its empty container.
    const plain = page(`<hw-portal-layout brand="Portal" skipLabel="Skip to content" menuLabel="Menu" navigationLabel="Main navigation" externalLabel="opens in a new window" [links]="links"><p>Content</p></hw-portal-layout>`, { links });
    expect(contentOf(plain.root.querySelector('.hw-portal-notice')!)).toEqual([]);
  });

  it('[ph-menu-unchanged] opens and closes the navigation and returns focus on Escape with both regions filled', () => {
    const { root, fixture } = page(`<hw-portal-header ${header}><p hwPortalNotice><a href="/status">Status</a></p><button type="button">Sign in</button></hw-portal-header><main id="content"></main>`, { links });
    const toggle = root.querySelector<HTMLButtonElement>('.hw-portal-menu-toggle')!, nav = root.querySelector('header nav') as HTMLElement, link = nav.querySelector('a')!;
    expect(toggle.getAttribute('aria-controls')).toBe(nav.id); expect(toggle.getAttribute('aria-expanded')).toBe('false'); expect(nav.dataset.open).toBe('false');
    toggle.click(); fixture.detectChanges(); expect(toggle.getAttribute('aria-expanded')).toBe('true'); expect(nav.dataset.open).toBe('true'); expect(toggle.querySelector('.hw-icon')!.getAttribute('data-icon')).toBe('cancel-01');
    toggle.click(); fixture.detectChanges(); expect(toggle.getAttribute('aria-expanded')).toBe('false'); expect(nav.dataset.open).toBe('false');
    toggle.click(); fixture.detectChanges(); link.focus();
    link.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })); fixture.detectChanges();
    expect(nav.dataset.open).toBe('false'); expect(document.activeElement).toBe(toggle);
    toggle.click(); fixture.detectChanges(); document.body.dispatchEvent(new Event('pointerdown', { bubbles: true })); fixture.detectChanges(); expect(nav.dataset.open).toBe('false');
  });
});
