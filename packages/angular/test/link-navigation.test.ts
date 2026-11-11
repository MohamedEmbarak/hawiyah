import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { bindLinkNavigation, type LinkNavigation } from '@hawiyah/core';
import { page } from './fixtures/page';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value(this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value(this: HTMLDialogElement) { this.open = false; this.dispatchEvent(new Event('close')); } });
  window.addEventListener('click', last);
});
afterEach(() => { links?.destroy(); links = undefined; window.removeEventListener('click', last); seen.length = 0; paths.length = 0; TestBed.resetTestingModule(); document.head.querySelector('base')?.remove(); document.body.replaceChildren(); });

// A memory router: it records where the application was asked to go. No router package is involved.
const paths: string[] = [];
let links: LinkNavigation | undefined;
const route = (base?: string) => { links = bindLinkNavigation(document, { navigate: ({ path }) => { paths.push(path); }, base }); };
// The last listener of every click: it records whether anything prevented the default, then cancels it so that the test DOM never navigates.
const seen: boolean[] = [];
const last = (event: Event) => { seen.push(event.defaultPrevented); event.preventDefault(); };
const click = (link: Element, init: MouseEventInit = {}) => { const event = new MouseEvent('click', { bubbles: true, cancelable: true, ...init }); link.dispatchEvent(event); return event; };

const crumbs = [{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides?tab=install#steps' }, { label: 'Install' }];
const items = [{ id: 'start', label: 'Start', href: '/start' }, { id: 'guides', label: 'Guides', href: '/guides', children: [{ id: 'install', label: 'Install', href: '/guides/install', current: true }] }];
const template = `<hw-breadcrumb label="Breadcrumb" [items]="crumbs" /><hw-side-navigation label="Documentation" [items]="items" />`;

describe('client-side routing with core bindLinkNavigation', () => {
  it('[ln-routed] hands a plain click on a packaged link to the router once, with the path, and prevents the default', () => {
    const { root } = page(template, { crumbs, items }); route();
    const breadcrumb = [...root.querySelectorAll('hw-breadcrumb a')], side = [...root.querySelectorAll('hw-side-navigation a')];
    expect(breadcrumb.map(link => link.getAttribute('href'))).toEqual(['/', '/guides?tab=install#steps']); expect(side.map(link => link.getAttribute('href'))).toEqual(['/start', '/guides', '/guides/install']);
    for (const link of [...breadcrumb, ...side]) expect(click(link).defaultPrevented).toBe(true);
    expect(paths).toEqual(['/', '/guides?tab=install#steps', '/start', '/guides', '/guides/install']); expect(seen).toEqual([true, true, true, true, true]);
    // An activation from inside the link (its label span) is the same navigation.
    click(side[0]!.querySelector('.hw-navigation-drawer-label')!); expect(paths.at(-1)).toBe('/start'); expect(paths).toHaveLength(6);
  });

  it('[ln-routed] gives the path relative to <base href>, and leaves links outside it to the browser', () => {
    const base = document.createElement('base'); base.href = '/hawiyah/'; document.head.append(base);
    const { root } = page(`<hw-side-navigation label="Documentation" [items]="items" />`, { items: [{ id: 'install', label: 'Install', href: 'guides/install' }, { id: 'root', label: 'Root', href: '/elsewhere' }, { id: 'out', label: 'Out', href: 'https://example.org/' }] }); route();
    const [inside, outside, external] = [...root.querySelectorAll('hw-side-navigation a')];
    expect(inside!.getAttribute('href')).toBe('guides/install');
    expect(click(inside!).defaultPrevented).toBe(true); click(outside!); click(external!);
    expect(paths).toEqual(['/guides/install']); expect(seen).toEqual([true, false, false]);
  });

  it('[ln-modified] leaves a modified or middle click to the browser', () => {
    const { root } = page(template, { crumbs, items }); route();
    for (const link of [root.querySelector('hw-breadcrumb a')!, root.querySelector('hw-side-navigation a')!]) for (const init of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }]) click(link, init);
    expect(paths).toEqual([]); expect(seen).toEqual(Array.from({ length: 10 }, () => false));
  });

  it('[ln-prevented] does not route a click that an application listener already prevented', () => {
    const { root } = page(template, { crumbs, items }); route();
    const link = root.querySelector('hw-side-navigation a')!; const guard = (event: Event) => event.preventDefault(); link.addEventListener('click', guard);
    click(link); expect(paths).toEqual([]); expect(seen).toEqual([true]);
    link.removeEventListener('click', guard); click(link); expect(paths).toEqual(['/start']);
  });

  it('[ln-no-handler-prevents] no component handler prevents a plain navigation', async () => {
    const portal = [{ label: 'Home', href: '/home' }, { label: 'Services', href: '/services', groups: [{ label: 'Popular', links: [{ label: 'Permits', href: '/services/permits' }] }] }];
    const { root, fixture } = page(`<hw-portal-header brand="Portal" menuLabel="Menu" navigationLabel="Main navigation" [links]="portal" /><hw-navigation-drawer title="Menu" navigationLabel="Pages" closeLabel="Close" open [items]="items" /><hw-link href="/policy">Policy</hw-link><hw-card href="/card"><p>Card</p></hw-card>`, { portal, items });
    const header = [...root.querySelectorAll('hw-portal-header nav a')], drawer = [...root.querySelectorAll('hw-navigation-drawer nav a')];
    // The plain link, the overview link of a branch and a link of its group; the drawer's top-level link, its group's own page and a child.
    expect(header.map(link => link.getAttribute('href'))).toEqual(['/home', '/services', '/services/permits']); expect(drawer.map(link => link.getAttribute('href'))).toEqual(['/start', '/guides', '/guides/install']);
    for (const link of [...header, ...drawer, root.querySelector('hw-link a')!, root.querySelector('hw-card a')!]) { const event = click(link); await Promise.resolve(); fixture.detectChanges(); expect(event.cancelable).toBe(true); }
    expect(seen).toEqual(Array.from({ length: 8 }, () => false)); expect(paths).toEqual([]);
  });
});
