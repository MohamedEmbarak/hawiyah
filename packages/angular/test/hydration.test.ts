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
});
