// @vitest-environment node
import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { controls, controlScenarios, createHost, declarations, hostDocument, scenarios, selectorsOf, valueControls, type Scenario } from './fixtures/scenarios';

const problems: string[] = [];
const describeProblem = (kind: string) => (...values: unknown[]) => { problems.push(`${kind}: ${values.map(value => value instanceof Error ? value.stack ?? value.message : String(value)).join(' ')}`); };
const uncaught = describeProblem('uncaughtException'), rejected = describeProblem('unhandledRejection');
beforeAll(() => {
  process.on('uncaughtException', uncaught); process.on('unhandledRejection', rejected);
  vi.spyOn(console, 'error').mockImplementation(describeProblem('console.error'));
  // A missing required text is reported as a development warning: every scenario supplies its text.
  vi.spyOn(console, 'warn').mockImplementation(describeProblem('console.warn'));
});
afterAll(() => { process.off('uncaughtException', uncaught); process.off('unhandledRejection', rejected); vi.restoreAllMocks(); });

/** Renders one page the way a prerender does and returns its HTML together with everything
 * that went wrong: a rejected render, a logged ERROR, or an exception from a timer. */
async function render(scenario: Scenario): Promise<{ html: string; errors: string[] }> {
  const Host = createHost(scenario, 20);
  problems.length = 0;
  let html = '';
  try {
    html = await renderApplication(context => bootstrapApplication(Host, { providers: [provideServerRendering()] }, context), { document: hostDocument, url: 'http://localhost/', allowedHosts: ['localhost'] });
  } catch (error) { describeProblem('renderApplication')(error); }
  await new Promise(resolve => setTimeout(resolve, 20));
  return { html, errors: [...problems] };
}

/** Server markup without Angular's comment anchors and with the attributes of each tag in name order: neither is part of the contract. */
const canonical = (html: string) => html.replace(/<!--.*?-->/gs, '').replace(/<([a-z][\w-]*)((?:\s+[^\s=>]+(?:="[^"]*")?)+)\s*>/g, (_tag, name: string, attributes: string) => `<${name}${attributes.match(/\s+[^\s=>]+(?:="[^"]*")?/g)!.map(attribute => ` ${attribute.trim()}`).sort().join('')}>`);

describe('Angular server rendering', () => {
  it('has a scenario for every exported component and directive', () => {
    const covered = new Set(scenarios.flatMap(scenario => scenario.covers));
    expect(declarations.map(({ name }) => name).filter(name => !covered.has(name))).toEqual([]);
    expect(declarations.length).toBeGreaterThanOrEqual(89);
    expect(valueControls.filter(name => !controls[name])).toEqual([]);
    for (const scenario of scenarios) for (const name of scenario.covers) expect(selectorsOf(name).some(selector => scenario.template.includes(selector)), `${scenario.name} renders ${name}`).toBe(true);
  });

  for (const scenario of scenarios) {
    it(`renders ${scenario.name} without errors`, async () => {
      const { html, errors } = await render(scenario);
      expect(errors).toEqual([]);
      for (const name of scenario.covers) for (const selector of selectorsOf(name)) if (selector.startsWith('hw-')) expect(html).toContain(`<${selector}`);
      const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]));
      for (const match of html.matchAll(/\s(?:for|aria-controls|aria-labelledby|aria-describedby|aria-activedescendant)="([^"]+)"/g)) {
        for (const id of match[1]!.split(/\s+/).filter(Boolean)) expect(ids, `${match[0]!.trim()} resolves`).toContain(id);
      }
      // Ids come from one source per application, so a second render of the page is identical.
      const again = await render(scenario);
      expect(again.errors).toEqual([]); expect(again.html).toBe(html);
    });
  }

  it('[cb-server] renders the idle copy button with an empty status and touches neither navigator nor a timer', async () => {
    const navigatorRead = vi.spyOn(globalThis, 'navigator', 'get'); const timers = vi.spyOn(globalThis, 'setTimeout');
    const read = vi.fn(() => 'value');
    const { html, errors } = await render({ name: 'copy', covers: [], state: () => ({ read }), template: `<hw-copy-button [text]="read" label="Copy the command" copiedMessage="Copied" failedMessage="Copy failed" /><hw-copy-button [text]="read" display="text" variant="primary" size="lg" label="Copy" copiedMessage="Copied" failedMessage="Copy failed" />` });
    const componentTimers = timers.mock.calls.filter(call => call[1] === 3000);
    const reads = navigatorRead.mock.calls.length; navigatorRead.mockRestore(); timers.mockRestore();
    expect(errors).toEqual([]); expect(reads).toBe(0); expect(componentTimers).toEqual([]); expect(read).not.toHaveBeenCalled();
    const hosts = [...html.matchAll(/<hw-copy-button([^>]*)>(.*?)<\/hw-copy-button>/g)];
    expect(hosts).toHaveLength(2);
    for (const host of hosts) { expect(host[1]).toContain('class="hw-copy"'); expect(host[1]).toContain('data-state="idle"'); }
    expect(canonical(hosts[0]![2]!)).toBe(canonical('<button type="button" class="hw-button hw-icon-button" data-variant="ghost" data-size="md" aria-label="Copy the command"><span class="hw-icon" data-icon="copy-01" aria-hidden="true"></span></button><span class="hw-copy-message" role="status" aria-live="polite" aria-atomic="true"></span>'));
    expect(canonical(hosts[1]![2]!)).toBe(canonical('<button type="button" class="hw-button" data-variant="primary" data-size="lg"><span class="hw-icon" data-icon="copy-01" aria-hidden="true"></span>Copy</button><span class="hw-copy-message" role="status" aria-live="polite" aria-atomic="true"></span>'));
  });

  it('[sn-server] renders the whole side navigation, the open groups and the current page', async () => {
    const scrolled = vi.fn(); (globalThis as { scrollTo?: unknown }).scrollTo = scrolled;
    const { html, errors } = await render(scenarios.find(scenario => scenario.name === 'side navigation')!);
    delete (globalThis as { scrollTo?: unknown }).scrollTo;
    expect(errors).toEqual([]); expect(scrolled).not.toHaveBeenCalled();
    const host = /<hw-side-navigation([^>]*)>(.*?)<\/hw-side-navigation>/.exec(html)!, native = /<nav hwsidenavigation([^>]*)>(.*?)<\/nav>/.exec(html)!;
    expect(host[1]).toContain('class="hw-side-navigation hw-navigation-drawer-nav"'); expect(host[1]).toContain('role="navigation"'); expect(host[1]).toContain('aria-label="Documentation"'); expect(host[1]).toContain('data-sticky="true"');
    expect(native[1]).toContain('aria-label="Same pages"'); expect(native[1]).not.toContain('role='); expect(native[1]).not.toContain('data-sticky');
    const list = canonical(host[2]!);
    expect(canonical(native[2]!)).toBe(list); expect(list).toMatch(/^<ul>.*<\/ul>$/); expect(list.match(/aria-current="page"/g)).toHaveLength(1);
    // The group of the current page and the expanded group are open before any script runs; the nested closed group is not.
    expect([...list.matchAll(/<details class="hw-navigation-drawer-group"( open="")?><summary class="hw-navigation-drawer-row"><span class="hw-navigation-drawer-label">([^<]*)</g)].map(match => [match[2], !!match[1]])).toEqual([['Guides', true], ['More', false], ['Reference', true]]);
    expect(list).toContain(canonical('<li data-hw-value="install"><a class="hw-navigation-drawer-row" href="https://example.org/guides/install" aria-current="page">'));
    expect(list).toContain('<li data-hw-value="guides-page"><a class="hw-navigation-drawer-row" href="https://example.org/guides">'); expect(list).toContain(canonical('<span class="hw-navigation-drawer-row" aria-disabled="true"><span class="hw-navigation-drawer-label">Disabled</span></span>')); expect(list).toContain(canonical('<a class="hw-navigation-drawer-row" href="https://example.org/"><span class="hw-icon" data-icon="home-01" aria-hidden="true"></span>'));
  });

  it('[al-server-hydration] renders the class of every layout primitive on its host', async () => {
    const { html, errors } = await render(scenarios.find(scenario => scenario.name === 'layout primitives')!);
    expect(errors).toEqual([]);
    for (const name of ['container', 'stack', 'inline', 'grid', 'columns', 'sidebar', 'center', 'spacer', 'aspect-ratio', 'section', 'app-shell']) {
      expect(html, name).toMatch(new RegExp(`<hw-${name}\\b[^>]*\\sclass="hw-${name}"`));
      // The host is the box: its first child is not a wrapper that repeats the class.
      expect(html, name).not.toMatch(new RegExp(`<hw-${name}\\b[^>]*><(div|section)\\b[^>]*\\sclass="hw-${name}"`));
    }
    expect(html).toMatch(/<hw-page-header\b[^>]*><header[^>]*class="hw-page-header"/); expect(html).not.toMatch(/<hw-page-header\b[^>]*class=/);
    // The same boxes on native elements, and the custom properties in the server markup.
    expect(html).toMatch(/<ul hwstack=""[^>]*class="hw-stack"[^>]*style="[^"]*--hw-layout-gap:/); expect(html).toMatch(/<section hwsection=""[^>]*class="hw-section"[^>]*aria-label="Native section"/); expect(html).not.toMatch(/<section hwsection=""[^>]*role=/);
    expect(html).toMatch(/<hw-section[^>]*role="region"[^>]*aria-label="Summary"|<hw-section[^>]*aria-label="Summary"[^>]*role="region"/); expect(html).toMatch(/<p hwinline=""[^>]*style="[^"]*--hw-layout-wrap:\s*wrap/);
    const plain = canonical(html);
    expect(plain).toMatch(/<hw-app-shell[^>]*><a class="hw-skip-link" href="#shell-main">Skip to content<\/a><div class="hw-app-shell-header">/);
    // A shell without a header, a sidebar or a footer keeps three empty regions for the stylesheet to hide.
    expect(plain).toContain(canonical('<div class="hw-app-shell-header"></div><aside class="hw-app-shell-sidebar"></aside><main class="hw-app-shell-main" tabindex="-1" id="bare-main">')); expect(plain).toContain('<div class="hw-app-shell-footer"></div></hw-app-shell>');
  });

  it('[ln-server] renders packaged links with their href and binds nothing on the server', async () => {
    const listened = vi.fn(); const original = globalThis.addEventListener; (globalThis as { addEventListener?: unknown }).addEventListener = listened;
    const { html, errors } = await render({ name: 'links', covers: [], state: () => ({ items: [{ id: 'guides', label: 'Guides', href: '/guides', children: [{ id: 'install', label: 'Install', href: '/guides/install', current: true }] }] }), template: `<hw-breadcrumb label="Breadcrumb" [items]="[{label: 'Home', href: '/'}, {label: 'Here'}]" /><hw-side-navigation label="Documentation" [items]="items" /><hw-navigation-drawer title="Menu" navigationLabel="Pages" closeLabel="Close" open [items]="items" /><hw-portal-header brand="Portal" menuLabel="Menu" navigationLabel="Main" [links]="[{label: 'Services', href: '/services'}]"><p hwPortalNotice>Notice</p></hw-portal-header>` });
    (globalThis as { addEventListener?: unknown }).addEventListener = original;
    expect(errors).toEqual([]); expect(listened).not.toHaveBeenCalled();
    for (const href of ['/', '/guides', '/guides/install', '/services']) expect(html).toContain(`href="${href}"`);
    expect(canonical(html).match(/aria-current="page" class="hw-navigation-drawer-row" href="\/guides\/install"/g)).toHaveLength(2);
    expect(canonical(html)).toMatch(/<header class="hw-portal-header"><div class="hw-portal-notice"><p hwportalnotice="">Notice<\/p><\/div><a class="hw-portal-brand"/); expect(canonical(html)).toContain('<div class="hw-portal-header-actions"></div></header>');
  });

  it('generates unique ids in creation order', async () => {
    const ids = (html: string) => [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]!);
    const generated = ids((await render(scenarios.find(scenario => scenario.name === 'tooltip, popover and menu')!)).html);
    expect(generated.filter(id => /^hw-(tooltip|popover)-\d+$/.test(id)).length).toBeGreaterThanOrEqual(5);
    expect(new Set(generated).size).toBe(generated.length);
    const numbers = generated.filter(id => /^hw-(tooltip|popover)-\d+$/.test(id)).map(id => Number(id.split('-').at(-1)));
    expect(numbers).toEqual([...numbers].sort((a, b) => a - b)); expect(numbers[0]).toBe(1);
  });

  it('lets the application choose the ids of nested parts and leaves none on a wrapper element', async () => {
    const { html, errors } = await render({ name: 'ids', covers: [], template: `<hw-tooltip text="Hint" tooltipId="hint"><span>Target</span></hw-tooltip><hw-popover label="Filters" triggerLabel="Filters" panelId="filters"><p>Body</p></hw-popover><hw-menu label="Actions" triggerLabel="Actions" panelId="actions" [items]="[{id: 'edit', label: 'Edit'}]" /><hw-calendar label="Date" locale="en-SA" calendar="islamic-umalqura" previousLabel="Previous month" nextLabel="Next month" rangeLabel="Supported dates" rangeTooltipId="range" value="2024-03-11" /><hw-navigation-drawer title="Menu" titleId="drawer-title" navigationLabel="Main" closeLabel="Close" [items]="[]" /><hw-portal-layout brand="Portal" navigationId="site-navigation" mainId="site-main" skipLabel="Skip" menuLabel="Menu" navigationLabel="Main" externalLabel="external" [links]="[{label: 'Home', href: 'https://example.org/'}]" />` });
    expect(errors).toEqual([]);
    for (const id of ['hint', 'filters', 'actions', 'range', 'drawer-title', 'site-navigation', 'site-main']) expect(html.match(new RegExp(`\\sid="${id}"`, 'g')), id).toHaveLength(1);
    expect(html).toMatch(/<span[^>]*role="tooltip"[^>]*id="range"/); expect(html).toMatch(/<h2[^>]*id="drawer-title"/); expect(html).toMatch(/<nav[^>]*id="site-navigation"/);
    expect(html).toMatch(/aria-labelledby="drawer-title"/); expect(html).toMatch(/aria-controls="site-navigation"/); expect(html).toContain('href="#site-main"');
    expect(html).not.toMatch(/<hw-(tooltip|popover|menu|calendar|navigation-drawer|portal-layout)\b[^>]*\sid=/);
  });

  it('renders without a locale and without throwing: no grid, no formatted date, rows in their source order', async () => {
    const template = (locale: string) => `<hw-calendar label="Date" locale="${locale}" previousLabel="Previous month" nextLabel="Next month" name="day" value="2024-03-11" /><hw-date-picker label="Date" locale="${locale}" calendarLabel="Choose a date" openLabel="Open calendar" closeLabel="Close" previousLabel="Previous month" nextLabel="Next month" calendarSystemLabel="Calendar system" gregorianLabel="Gregorian" hijriLabel="Hijri" rangeLabel="Supported dates" invalidMessage="Enter a valid date." unsupportedMessage="Outside the supported range." name="date" value="2024-03-11" /><hw-data-table caption="Requests" emptyMessage="None" locale="${locale}" sortKey="name" [columns]="[{key: 'name', label: 'Name', sortable: true}]" [rows]="[{name: 'b'}, {name: 'c'}, {name: 'a'}]" />`;
    const { html, errors } = await render({ name: 'no locale', covers: [], template: template('') });
    // The only reports are the three development warnings: nothing throws and core is never called without a locale.
    expect(errors.map(error => error.split('. ')[0]).sort()).toEqual(['console.warn: Hawiyah: hw-calendar requires "locale"', 'console.warn: Hawiyah: hw-data-table requires "locale"', 'console.warn: Hawiyah: hw-date-picker requires "locale"']);
    expect(html).not.toMatch(/hw-calendar-toolbar|hw-calendar-grid|<th scope="col"/); expect(html.match(/<div class="hw-field hw-calendar"/g)).toHaveLength(2);
    expect(html).toMatch(/<input type="hidden"[^>]*name="day"[^>]*value="2024-03-11"/); expect(html).toMatch(/<input type="hidden"[^>]*name="date"[^>]*value="2024-03-11"/);
    expect(html).toMatch(/<output[^>]*hidden=""[^>]*><\/output>/); expect(html).toMatch(/<input[^>]*type="text"[^>]*value="2024-03-11"/);
    expect([...html.matchAll(/<td[^>]*>([^<]*)<\/td>/g)].map(match => match[1])).toEqual(['b', 'c', 'a']); expect(html).toMatch(/<th[^>]*aria-sort="ascending"/);
    // With a locale the same page renders the grids, the formatted date and the sorted rows, and reports nothing.
    const localized = await render({ name: 'locale', covers: [], template: template('en-SA') });
    expect(localized.errors).toEqual([]); expect(localized.html.match(/hw-calendar-grid/g)).toHaveLength(2); expect(localized.html).toMatch(/<output[^>]*>[^<]*2024[^<]*<\/output>/);
    expect([...localized.html.matchAll(/<td(?![^>]*role=)[^>]*>([^<]*)<\/td>/g)].map(match => match[1])).toEqual(['a', 'b', 'c']);
  });

  it('keeps rendering what follows an accordion and gives every item its content', async () => {
    const { html } = await render(scenarios.find(scenario => scenario.name === 'accordion and collapsible')!);
    expect(html.match(/First answer/g)).toHaveLength(2); expect(html.match(/Second answer/g)).toHaveLength(2);
    expect(html).toContain('<p id="after-accordion">after</p>');
    expect(html).toMatch(/<details[^>]*name="custom"[^>]*open=""|<details[^>]*open=""[^>]*name="custom"/);
  });

  it('renders every tab panel inside its hw-tab, the selected one visible', async () => {
    const { html } = await render(scenarios.find(scenario => scenario.name === 'tabs')!);
    const panels = [...html.matchAll(/<hw-tab[^>]*><section[^>]*role="tabpanel"[^>]*>/g)].map(match => match[0]);
    expect(panels).toHaveLength(5);
    expect(panels.filter(panel => !/\shidden(=|\s|>)/.test(panel))).toHaveLength(2);
    expect(html).toMatch(/<section[^>]*role="tabpanel"[^>]*hidden=""[^>]*><p>Overview panel<\/p>/);
    expect(html).toMatch(/aria-selected="true"[^>]*>Details</);
  });

  it('writes model values into the server markup', async () => {
    const text = await render(controlScenarios.find(scenario => scenario.name === 'hw-text-field with ngModel')!);
    expect(text.html).toMatch(/<input[^>]*name="field"[^>]*value="Maha"/);
    const number = await render(controlScenarios.find(scenario => scenario.name === 'hw-number-field with ngModel')!);
    expect(number.html).toMatch(/<input[^>]*name="field"[^>]*value="-5"/);
    const date = await render(controlScenarios.find(scenario => scenario.name === 'hw-date-picker with ngModel')!);
    expect(date.html).toMatch(/<dialog[^>]*id="[^"]+-dialog"/);
    expect(date.html).toMatch(/<input type="hidden"[^>]*value="2024-03-11"/);
  });
});
