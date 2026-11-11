import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { contentOf, page } from './fixtures/page';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); });

const custom = (element: Element, name: string) => (element as HTMLElement).style.getPropertyValue(name);

describe('Angular layout hosts', () => {
  it('[al-host-class] puts the class and the layout custom properties on the host, whose content is the projected content', () => {
    const { root } = page(`
      <hw-container maxWidth="40rem"><p data-first>Body</p></hw-container>
      <hw-stack [gap]="4"><p data-first>Body</p></hw-stack>
      <hw-inline align="center"><p data-first>Body</p></hw-inline>
      <hw-grid [columns]="{base: 1, md: 3}"><p data-first>Body</p></hw-grid>
      <hw-columns minItemWidth="12rem"><p data-first>Body</p></hw-columns>
      <hw-sidebar sidebarWidth="14rem"><nav hwSidebar data-first aria-label="Section">Side</nav><div>Main</div></hw-sidebar>
      <hw-center justify="center"><p data-first>Body</p></hw-center>
      <hw-spacer [gap]="8" />
      <hw-aspect-ratio [ratio]="2"><p data-first>Body</p></hw-aspect-ratio>
      <hw-section [padding]="4"><p data-first>Body</p></hw-section>
      <hw-app-shell skipLabel="Skip to content" sidebarWidth="16rem"><p>Body</p></hw-app-shell>`);
    const expected: Record<string, [string, string]> = {
      container: ['--hw-layout-max-width', '40rem'], stack: ['--hw-layout-gap', 'var(--hw-space-4, 1rem)'], inline: ['--hw-layout-align', 'center'], grid: ['--hw-layout-columns-md', '3'], columns: ['--hw-layout-min-item', '12rem'],
      sidebar: ['--hw-layout-sidebar-width', '14rem'], center: ['--hw-layout-justify', 'center'], spacer: ['--hw-layout-gap', 'var(--hw-space-8, 2rem)'], 'aspect-ratio': ['--hw-layout-ratio', '2'], section: ['--hw-layout-padding', 'var(--hw-space-4, 1rem)'], 'app-shell': ['--hw-layout-sidebar-width', '16rem'],
    };
    for (const [name, [property, value]] of Object.entries(expected)) {
      const host = root.querySelector(`hw-${name}`)!;
      expect(host.classList.contains(`hw-${name}`), name).toBe(true); expect(host.querySelector(`.hw-${name}`), `${name} has no inner box`).toBeNull(); expect(root.querySelectorAll(`.hw-${name}`), name).toHaveLength(1);
      expect(custom(host, property), `${name} ${property}`).toBe(value);
      if (name === 'spacer') { expect(host.childNodes).toHaveLength(0); expect(host.getAttribute('aria-hidden')).toBe('true'); }
      else if (name === 'app-shell') expect(host.firstElementChild!.matches('a.hw-skip-link')).toBe(true);
      else { expect(host.firstElementChild!.hasAttribute('data-first'), `${name} first child`).toBe(true); expect(contentOf(host)[0]).toBe(host.firstElementChild); }
    }
  });

  it('[al-host-attributes] keeps what the application writes on the element that carries the class', () => {
    const { root } = page(`
      <hw-container class="page" id="page" aria-label="Page" data-variant="narrow"><p>Body</p></hw-container>
      <hw-stack class="list" id="list" aria-label="List" style="color: red" [gap]="2"><p>Body</p></hw-stack>
      <hw-inline class="row" id="row" aria-label="Row"><p>Body</p></hw-inline>
      <hw-grid class="cards" id="cards" aria-label="Cards"><p>Body</p></hw-grid>
      <hw-columns class="cols" id="cols" aria-label="Columns"><p>Body</p></hw-columns>
      <hw-sidebar class="split" id="split" aria-label="Split"><nav hwSidebar aria-label="Section">Side</nav><div>Main</div></hw-sidebar>
      <hw-center class="middle" id="middle" aria-label="Middle"><p>Body</p></hw-center>
      <hw-spacer class="gap" id="gap" />
      <hw-aspect-ratio class="media" id="media" aria-label="Media" data-fit="cover"><p>Body</p></hw-aspect-ratio>
      <hw-section class="band" id="band" aria-label="Band" role="group" data-tone="muted"><p>Body</p></hw-section>
      <hw-app-shell class="shell" id="shell" aria-label="Shell" skipLabel="Skip to content"><p>Body</p></hw-app-shell>`);
    const hosts = { container: 'page', stack: 'list', inline: 'row', grid: 'cards', columns: 'cols', sidebar: 'split', center: 'middle', spacer: 'gap', 'aspect-ratio': 'media', section: 'band', 'app-shell': 'shell' };
    for (const [name, id] of Object.entries(hosts)) {
      const box = root.querySelector(`.hw-${name}`)!;
      expect(box.localName).toBe(`hw-${name}`); expect(box.id, name).toBe(id); expect(box.className, name).toBe(`hw-${name} ${id}`);
      if (name !== 'spacer') expect(box.hasAttribute('aria-label'), name).toBe(true);
    }
    expect(root.querySelector('.hw-columns')!.getAttribute('aria-label')).toBe('Columns'); expect(root.querySelector('.hw-section')!.getAttribute('aria-label')).toBe('Band');
    expect(root.querySelector('.hw-container')!.getAttribute('data-variant')).toBe('narrow'); expect(root.querySelector('.hw-aspect-ratio')!.getAttribute('data-fit')).toBe('cover');
    expect(root.querySelector('.hw-section')!.getAttribute('data-tone')).toBe('muted'); expect(root.querySelector('.hw-section')!.getAttribute('role')).toBe('group');
    // An authored style stays beside the custom properties.
    const stack = root.querySelector<HTMLElement>('.hw-stack')!; expect(stack.style.color).toBe('red'); expect(custom(stack, '--hw-layout-gap')).toBe('var(--hw-space-2, 0.5rem)');
  });

  it('[al-attribute-selectors] places the same box on a native element and keeps its tag', () => {
    const { root } = page(`
      <main hwContainer id="container" maxWidth="40rem"><p>Body</p></main>
      <ul hwStack id="stack" [gap]="2"><li>One</li><li>Two</li></ul>
      <p hwInline id="inline" align="center"><span>One</span></p>
      <ol hwGrid id="grid" [columns]="3"><li>One</li></ol>
      <div hwColumns id="columns" [columns]="2"><p>One</p></div>
      <div hwCenter id="center" maxWidth="30rem"><p>One</p></div>
      <figure hwAspectRatio id="aspect-ratio" [ratio]="1"><img alt="" src="data:,"></figure>
      <section hwSection id="section" [padding]="4"><p>Body</p></section>`);
    const expected: Record<string, [string, string, string]> = {
      container: ['main', '--hw-layout-max-width', '40rem'], stack: ['ul', '--hw-layout-gap', 'var(--hw-space-2, 0.5rem)'], inline: ['p', '--hw-layout-align', 'center'], grid: ['ol', '--hw-layout-columns', '3'],
      columns: ['div', '--hw-layout-columns', '2'], center: ['div', '--hw-layout-max-width', '30rem'], 'aspect-ratio': ['figure', '--hw-layout-ratio', '1'], section: ['section', '--hw-layout-padding', 'var(--hw-space-4, 1rem)'],
    };
    for (const [name, [tag, property, value]] of Object.entries(expected)) {
      const box = root.querySelector(`#${name}`)!;
      expect(box.localName, name).toBe(tag); expect(box.className, name).toBe(`hw-${name}`); expect(custom(box, property), name).toBe(value); expect(box.querySelector(`.hw-${name}`)).toBeNull();
    }
    expect([...root.querySelector('#stack')!.children].map(child => child.localName)).toEqual(['li', 'li']); expect(root.querySelector('#section')!.hasAttribute('role')).toBe(false);
  });

  it('[al-section-label] names a section with label: a region on hw-section, the native landmark on a section element', () => {
    const { root, update } = page(`<hw-section id="named" [label]="label"><p>Body</p></hw-section><hw-section id="plain"><p>Body</p></hw-section><section hwSection id="native" label="Summary"><p>Body</p></section><section hwSection id="bare"><p>Body</p></section>`, { label: 'Summary' });
    const named = root.querySelector('#named')!, plain = root.querySelector('#plain')!, native = root.querySelector('#native')!, bare = root.querySelector('#bare')!;
    expect(named.getAttribute('role')).toBe('region'); expect(named.getAttribute('aria-label')).toBe('Summary');
    expect(plain.hasAttribute('role')).toBe(false); expect(plain.hasAttribute('aria-label')).toBe(false);
    expect(native.getAttribute('aria-label')).toBe('Summary'); expect(native.hasAttribute('role')).toBe(false);
    expect(bare.hasAttribute('aria-label')).toBe(false); expect(bare.hasAttribute('role')).toBe(false);
    update({ label: '' }); expect(named.hasAttribute('role')).toBe(false); expect(named.hasAttribute('aria-label')).toBe(false);
  });

  it('[al-sidebar-children] makes the marked sidebar and the content the two children of the host grid', () => {
    const { root } = page(`<hw-sidebar><div id="main">Main</div><nav hwSidebar id="side" aria-label="Section">Side</nav></hw-sidebar><hw-sidebar side="end" collapseAt="lg"><aside hwSidebar>Side</aside><div>Main</div></hw-sidebar>`);
    const [first, second] = [...root.querySelectorAll('hw-sidebar')];
    expect(first!.getAttribute('data-side')).toBe('start'); expect(first!.getAttribute('data-collapse-at')).toBe('md');
    // The sidebar comes first whatever the source order; nothing is wrapped and no aside is added.
    expect([...first!.children].map(child => child.id)).toEqual(['side', 'main']); expect(first!.querySelector('aside')).toBeNull();
    expect(second!.getAttribute('data-side')).toBe('end'); expect(second!.getAttribute('data-collapse-at')).toBe('lg'); expect([...second!.children].map(child => child.localName)).toEqual(['aside', 'div']);
  });

  it('[al-wrap-attribute] reads the bare wrap attribute as true and writes nothing when wrap is not set', () => {
    const { root, update } = page(`<hw-inline id="bare" wrap><span>One</span></hw-inline><hw-inline id="bound" [wrap]="wrap"><span>One</span></hw-inline><hw-inline id="unset"><span>One</span></hw-inline><hw-inline id="off" wrap="false"><span>One</span></hw-inline>`, { wrap: true as boolean | undefined });
    const wrap = (id: string) => custom(root.querySelector(`#${id}`)!, '--hw-layout-wrap');
    expect(wrap('bare')).toBe('wrap'); expect(wrap('bound')).toBe('wrap'); expect(wrap('unset')).toBe(''); expect(wrap('off')).toBe('nowrap');
    update({ wrap: false }); expect(wrap('bound')).toBe('nowrap');
    update({ wrap: undefined }); expect(wrap('bound')).toBe('');
  });

  it('[al-app-shell-regions] renders the regions as children of the host and leaves the landmarks to the application', () => {
    const { root } = page(`<hw-app-shell id="full" skipLabel="Skip to content" mainId="full-main" side="end"><header hwShellHeader>Header</header><nav hwShellSidebar aria-label="Sections">Sidebar</nav><p>Body</p><footer hwShellFooter>Footer</footer></hw-app-shell><hw-app-shell id="bare" skipLabel="Skip to content" mainId="bare-main"><p>Body</p></hw-app-shell>`);
    const full = root.querySelector('#full')!, bare = root.querySelector('#bare')!;
    const regions = (shell: Element) => [...shell.children].map(child => `${child.localName}.${child.className}`);
    expect(regions(full)).toEqual(['a.hw-skip-link', 'div.hw-app-shell-header', 'aside.hw-app-shell-sidebar', 'main.hw-app-shell-main', 'div.hw-app-shell-footer']); expect(regions(bare)).toEqual(regions(full));
    expect(full.getAttribute('data-side')).toBe('end'); expect(bare.getAttribute('data-side')).toBe('start');
    // The shell renders no header and no footer element: the projected header is the only banner.
    expect([...full.querySelectorAll('header')]).toEqual([full.querySelector('.hw-app-shell-header > header[hwShellHeader]')]); expect([...full.querySelectorAll('footer')]).toEqual([full.querySelector('.hw-app-shell-footer > footer[hwShellFooter]')]);
    expect(full.querySelector('.hw-app-shell-sidebar > nav')!.textContent).toBe('Sidebar'); expect(full.querySelector('main')!.textContent).toBe('Body');
    expect(bare.querySelector('header, footer')).toBeNull();
    // Without content a region holds nothing but Angular's anchors, so the stylesheet's :empty rule hides it.
    for (const region of ['header', 'sidebar', 'footer']) expect(contentOf(bare.querySelector(`.hw-app-shell-${region}`)!), region).toEqual([]);
  });

  it('[al-skip-link] keeps the skip link first, pointing at main, and moves focus there', () => {
    const { root } = page(`<hw-app-shell skipLabel="Skip to content" mainId="shell-main"><div hwShellHeader>Header</div><p>Body</p></hw-app-shell>`);
    TestBed.tick();
    const shell = root.querySelector('hw-app-shell')!, link = shell.firstElementChild as HTMLAnchorElement, main = shell.querySelector('main')!;
    expect(link.matches('a.hw-skip-link')).toBe(true); expect(link.getAttribute('href')).toBe('#shell-main'); expect(link.textContent).toBe('Skip to content');
    expect(main.id).toBe('shell-main'); expect(main.getAttribute('tabindex')).toBe('-1');
    const click = new MouseEvent('click', { bubbles: true, cancelable: true }); link.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true); expect(document.activeElement).toBe(main);
  });

  it('[al-page-header] keeps the header element inside hw-page-header', () => {
    const { root } = page(`<hw-page-header title="Services" description="Find a service" [gap]="4"><button type="button">Start</button></hw-page-header>`);
    const host = root.querySelector('hw-page-header')!, header = host.firstElementChild!;
    expect(host.classList.contains('hw-page-header')).toBe(false); expect(host.hasAttribute('title')).toBe(false);
    expect(header.matches('header.hw-page-header')).toBe(true); expect(custom(header, '--hw-layout-gap')).toBe('var(--hw-space-4, 1rem)');
    expect(header.querySelector('h1')!.textContent).toBe('Services'); expect(header.querySelector('p')!.textContent).toBe('Find a service'); expect(header.querySelector('.hw-page-header-actions > button')).not.toBeNull();
  });
});
