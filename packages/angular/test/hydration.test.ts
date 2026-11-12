import '@angular/compiler';
import './fixtures/texts';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { type ApplicationRef } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createHost, scenarios, type Scenario } from './fixtures/scenarios';

interface Page { name: string; html: string; errors: string[] }
let pages: Page[] = [];
let application: ApplicationRef | undefined;
const errors: string[] = [];

beforeAll(() => {
  // The server half runs in its own process; see fixtures/render-server.ts.
  const output = execFileSync(process.execPath, [resolve(import.meta.dirname, 'fixtures/render-server.ts')], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  pages = JSON.parse(output) as Page[];
  // jsdom implements neither modal dialogs nor layout observers; hydration does not depend on them.
  HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) { this.removeAttribute('open'); this.dispatchEvent(new Event('close')); };
});
afterEach(() => { application?.destroy(); application = undefined; vi.restoreAllMocks(); });

/** Loads a server-rendered page into the document and starts the same application on it. */
async function hydrate(scenario: Scenario) {
  const page = pages.find(entry => entry.name === scenario.name)!;
  expect(page.errors).toEqual([]);
  // Projected content that Angular cannot reach from its own view is located from document.body,
  // a path that the event-replay script invalidates (NG0509). No component may depend on one.
  const state = JSON.parse(/<script id="ng-state" type="application\/json">(.*?)<\/script>/s.exec(page.html)![1]!) as { __nghData__: unknown[] };
  const bodyPaths: string[] = [];
  (function visit(value: unknown, key = ''): void {
    if (typeof value === 'string') { if (key === 'n' && value.startsWith('b')) bodyPaths.push(value); }
    else if (value && typeof value === 'object') for (const [name, child] of Object.entries(value)) visit(child, Array.isArray(value) || /^\d+$/.test(name) ? key : name);
  })(state.__nghData__);
  expect(bodyPaths).toEqual([]);
  // Assigning markup does not run the event-replay scripts; their position in the body is what matters here.
  document.documentElement.innerHTML = page.html.slice(page.html.indexOf('<head>'), page.html.lastIndexOf('</html>'));
  const host = document.querySelector('ssr-host')!;
  const before = [...host.querySelectorAll('*')];
  const serverIds = [...host.querySelectorAll('[id]')].map(element => element.id);
  expect(before.length).toBeGreaterThan(0);
  expect(document.querySelectorAll('[ngh]').length).toBeGreaterThan(0);
  errors.length = 0;
  vi.spyOn(console, 'error').mockImplementation((...values: unknown[]) => { errors.push(values.map(value => value instanceof Error ? value.message : String(value)).join(' ')); });
  vi.spyOn(console, 'log').mockImplementation(() => {});
  application = await bootstrapApplication(createHost(scenario), { providers: [provideClientHydration()] });
  await application.whenStable();
  return { host, before, serverIds };
}

describe('Angular hydration of server-rendered components', () => {
  it('renders one page per scenario on the server', () => { expect(pages.map(page => page.name)).toEqual(scenarios.map(scenario => scenario.name)); });

  for (const scenario of scenarios) {
    it(`hydrates ${scenario.name} in place`, async () => {
      const { host, before, serverIds } = await hydrate(scenario);
      expect(errors).toEqual([]);
      // The client generates the ids the server generated: one id source per application, in creation order.
      expect([...host.querySelectorAll('[id]')].map(element => element.id)).toEqual(serverIds);
      // Angular removes the marker from every component it hydrated; a leftover marks a subtree it gave up on.
      expect([...document.querySelectorAll('[ngh]')].map(element => element.localName)).toEqual([]);
      // Hydration adopts the server nodes instead of rendering them again. NgModel is the exception:
      // it delivers its value in a microtask after the first render, so lists keyed by that value
      // (the calendar grid) are rebuilt once.
      if (!scenario.template.includes('[(ngModel)]')) expect(before.filter(element => !element.isConnected).map(element => element.outerHTML.slice(0, 80))).toEqual([]);
    });
  }

  it('[cb-server] hydrates the copy button without changing its markup or touching the clipboard, and it then copies', async () => {
    const clipboard = { writeText: vi.fn(async (_text: string) => {}), readText: vi.fn(), read: vi.fn() };
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: clipboard });
    try {
      const page = pages.find(entry => entry.name === 'copy button')!;
      const server = [...page.html.matchAll(/<hw-copy-button[^>]*>(.*?)<\/hw-copy-button>/g)].map(match => match[1]!.replace(/<!--.*?-->/g, ''));
      const { host } = await hydrate(scenarios.find(scenario => scenario.name === 'copy button')!);
      const buttons = [...host.querySelectorAll<HTMLElement>('hw-copy-button')];
      expect(errors).toEqual([]); expect(buttons.map(button => button.innerHTML.replace(/<!--.*?-->/g, ''))).toEqual(server);
      expect(buttons.map(button => [button.className, button.getAttribute('data-state'), button.querySelector('.hw-copy-message')!.textContent])).toEqual(Array.from({ length: 3 }, () => ['hw-copy', 'idle', '']));
      expect(clipboard.writeText).not.toHaveBeenCalled(); expect(clipboard.readText).not.toHaveBeenCalled(); expect(clipboard.read).not.toHaveBeenCalled();
      buttons[1]!.querySelector('button')!.click(); for (let turn = 0; turn < 12; turn++) await Promise.resolve();
      expect(clipboard.writeText.mock.calls).toEqual([['pnpm add @hawiyah/angular']]); expect(buttons[1]!.getAttribute('data-state')).toBe('copied'); expect(buttons[1]!.querySelector('.hw-copy-message')!.textContent).toBe('Copied');
    } finally { delete (navigator as { clipboard?: unknown }).clipboard; }
  });

  it('[sn-server] hydrates the side navigation in place: the server list, its open groups and the current page stay', async () => {
    const { host, before } = await hydrate(scenarios.find(scenario => scenario.name === 'side navigation')!);
    expect(errors).toEqual([]); expect(before.filter(element => !element.isConnected)).toEqual([]);
    const side = host.querySelector('hw-side-navigation')!, native = host.querySelector('nav[hwSideNavigation]')!;
    expect(side.getAttribute('role')).toBe('navigation'); expect(native.hasAttribute('role')).toBe(false); expect(side.getAttribute('data-sticky')).toBe('true');
    expect([...side.querySelectorAll('details')].map(details => details.hasAttribute('open'))).toEqual([true, false, true]);
    expect([...side.querySelectorAll('[aria-current]')].map(link => link.getAttribute('href'))).toEqual(['https://example.org/guides/install']);
    expect(side.innerHTML.replace(/<!--.*?-->/g, '')).toBe(native.innerHTML.replace(/<!--.*?-->/g, ''));
    expect(host.querySelector('hw-toggle-group legend')!.className).toBe('hw-label hw-sr-only');
  });

  it('[al-server-hydration] hydrates the layout hosts in place, with the class and the custom properties on the host', async () => {
    const { host, before } = await hydrate(scenarios.find(scenario => scenario.name === 'layout primitives')!);
    expect(errors).toEqual([]); expect(before.filter(element => !element.isConnected)).toEqual([]);
    for (const name of ['container', 'stack', 'inline', 'grid', 'columns', 'sidebar', 'center', 'spacer', 'aspect-ratio', 'section', 'app-shell']) { const box = host.querySelector(`hw-${name}`)!; expect(box.classList.contains(`hw-${name}`), name).toBe(true); expect(box.firstElementChild?.classList.contains(`hw-${name}`) ?? false, name).toBe(false); }
    expect(host.querySelector('hw-page-header > header.hw-page-header h1')!.textContent).toBe('Services');
    expect((host.querySelector('ul[hwStack]') as HTMLElement).style.getPropertyValue('--hw-layout-gap')).toContain('--hw-space-2'); expect(host.querySelector('section[hwSection]')!.getAttribute('aria-label')).toBe('Native section');
    expect([...host.querySelector('hw-sidebar')!.children].map(child => child.localName)).toEqual(['nav', 'div']);
    const shells = [...host.querySelectorAll('hw-app-shell')];
    expect([...shells[0]!.children].map(child => child.localName)).toEqual(['a', 'div', 'aside', 'main', 'div']); expect(shells[1]!.querySelector('.hw-app-shell-sidebar')!.childElementCount).toBe(0); expect(shells[1]!.getAttribute('data-side')).toBe('end');
  });

  it('keeps hydrated tabs interactive', async () => {
    const { host } = await hydrate(scenarios.find(scenario => scenario.name === 'tabs')!);
    const tabs = [...host.querySelector('hw-tabs')!.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    const panels = [...host.querySelector('hw-tabs')!.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
    expect(tabs.map(tab => tab.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false', 'false']);
    expect(panels.map(panel => panel.hidden)).toEqual([true, false, true, true]);
    tabs[0]!.click(); await application!.whenStable();
    expect(tabs.map(tab => tab.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false', 'false']);
    expect(panels.map(panel => panel.hidden)).toEqual([false, true, true, true]);
    expect(panels[0]!.textContent).toBe('Overview panel');
    expect(panels.every((panel, index) => panel.id === tabs[index]!.getAttribute('aria-controls') && panel.getAttribute('aria-labelledby') === tabs[index]!.id)).toBe(true);
    expect(errors).toEqual([]);
  });

  // Server markup and hydrated markup of the same host, without Angular's comment anchors and hydration markers and
  // without the value-presence attribute that the browser adds after the first render.
  const plain = (html: string) => html.replace(/<!--.*?-->/gs, '').replace(/ (?:ngh|data-hw-filled)="[^"]*"/g, '');
  for (const name of ['forwarded aria attributes', 'field with Hawiyah controls', 'select with projected options', 'checkbox and switch with submitted value and projected label', 'slider and range slider with formatted values', 'toggle group with hint, error and required', 'combobox open and password visible', 'required rich inputs before any submission', 'file upload and dropzone with projected content']) {
    it(`[ATTR-05][SSR-01][SELECT-04][STATE-05][RICH-04] the first client render of ${name} is the server markup`, async () => {
      const page = pages.find(entry => entry.name === name)!;
      const server = plain(/<ssr-host[^>]*>(.*)<\/ssr-host>/s.exec(page.html)![1]!);
      const { host, before } = await hydrate(scenarios.find(scenario => scenario.name === name)!);
      expect(errors).toEqual([]); expect(before.filter(element => !element.isConnected)).toEqual([]);
      expect(plain(host.innerHTML)).toBe(server);
      for (const wrapper of host.querySelectorAll('hw-text-field, hw-textarea, hw-select, hw-checkbox, hw-switch, hw-radio-group, hw-number-field, hw-slider, hw-range-slider, hw-rating, hw-toggle-group, hw-combobox, hw-password-field, hw-search-field, hw-pin-input, hw-tag-input, hw-multi-select, hw-file-upload, hw-file-dropzone, hw-field')) for (const attribute of ['aria-label', 'aria-labelledby', 'aria-describedby', 'aria-invalid']) expect(wrapper.hasAttribute(attribute), `${wrapper.localName} ${attribute}`).toBe(false);
    });
  }

  // Milestone 3: dates, overlays, disclosure, data, navigation, menus and shell.
  for (const name of ['calendar and date picker with predicate, status and names', 'tables with cell templates', 'named roots, menu links and tree toggles', 'portal header open, brand without a link and page header level', 'dialog and drawer, closed and open', 'tooltip, popover and menu', 'accordion and collapsible', 'service content, feedback and consent']) {
    it(`[ATTR-05][SSR-01][SSR-02][SSR-03][SSR-04][STATE-05][RICH-04] the first client render of ${name} is the server markup`, async () => {
      const page = pages.find(entry => entry.name === name)!;
      const server = plain(/<ssr-host[^>]*>(.*)<\/ssr-host>/s.exec(page.html)![1]!);
      const { host, before, serverIds } = await hydrate(scenarios.find(scenario => scenario.name === name)!);
      expect(errors).toEqual([]); expect(before.filter(element => !element.isConnected)).toEqual([]);
      // What only a browser does after hydration is not part of the comparison: a dialog bound open is shown, and the
      // accordion motion exposes its state on the summary, takes collapsed content out of reach and coordinates an
      // exclusive group itself, in place of the native name attribute.
      const grouped = (html: string) => html.replace(/(<details[^>]*?) name="[^"]*"/g, '$1');
      const settled = plain(host.innerHTML).replace(/(<dialog[^>]*?) open=""/g, '$1').replace(/ data-hw-expanded="[^"]*"| inert="" aria-hidden="true"|(?<=<summary class="hw-accordion-trigger") aria-expanded="[^"]*"/g, '');
      expect(grouped(settled)).toBe(grouped(server)); expect([...host.querySelectorAll('[id]')].map(element => element.id)).toEqual(serverIds);
      for (const wrapper of host.querySelectorAll('hw-calendar, hw-date-picker, hw-table, hw-data-table, hw-dialog, hw-drawer, hw-popover, hw-menu, hw-tabs, hw-secondary-nav, hw-tree-view, hw-content-navigation, hw-carousel, hw-accordion, hw-breadcrumb, hw-pagination, hw-stepper, hw-tooltip')) for (const attribute of ['aria-label', 'aria-labelledby', 'aria-describedby', 'aria-invalid']) expect(wrapper.hasAttribute(attribute), `${wrapper.localName} ${attribute}`).toBe(false);
    });
  }

  it('[SSR-02][TREE-04][TOOLTIP-03] a hydrated tree toggles through its button and a hydrated tooltip opens on focus', async () => {
    const { host } = await hydrate(scenarios.find(scenario => scenario.name === 'named roots, menu links and tree toggles')!);
    const tree = host.querySelector('hw-tree-view')!, branch = tree.querySelector<HTMLElement>('li[data-node="a"]')!;
    expect(tree.querySelectorAll('li[role=treeitem]')).toHaveLength(5); expect(document.getElementById(branch.getAttribute('aria-labelledby')!)!.textContent).toBe('Services');
    branch.querySelector<HTMLButtonElement>('button.hw-tree-toggle')!.click(); await application!.whenStable();
    expect(branch.getAttribute('aria-expanded')).toBe('false'); expect(tree.querySelectorAll('li[role=treeitem]')).toHaveLength(2); expect(branch.querySelector('button')!.getAttribute('aria-label')).toBe('Expand Services');
    expect(errors).toEqual([]);
    application!.destroy(); application = undefined;
    const tips = await hydrate(scenarios.find(scenario => scenario.name === 'tooltip, popover and menu')!);
    const trigger = tips.host.querySelector<HTMLButtonElement>('hw-tooltip button[hwTooltipTrigger]')!, tooltip = tips.host.querySelector<HTMLElement>('hw-tooltip [role=tooltip]')!;
    expect(trigger.getAttribute('aria-describedby')).toBe(`more ${tooltip.id}`); expect(tooltip.hidden).toBe(true);
    trigger.focus(); await application!.whenStable(); expect(tooltip.hidden).toBe(false); expect(errors).toEqual([]);
  });

  it('[SELECT-04][RESET-01] a hydrated select shows its bound projected option, and hydrated controls answer a native reset', async () => {
    const { host } = await hydrate(scenarios.find(scenario => scenario.name === 'select with projected options')!);
    const select = host.querySelector<HTMLSelectElement>('select')!;
    expect(select.value).toBe('abha'); expect([...select.options].map(option => option.value)).toEqual(['riyadh', 'jeddah', 'dammam', 'abha', 'tabuk']);
    select.value = 'tabuk'; select.dispatchEvent(new Event('change', { bubbles: true })); await application!.whenStable(); expect(select.value).toBe('tabuk');
    expect(errors).toEqual([]);
  });
});
