// @vitest-environment node
import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { DOCUMENT, inject } from '@angular/core';
import { controls, controlScenarios, createHost, declarations, hostDocument, scenarios, selectorsOf, text, valueControls, type Scenario } from './fixtures/scenarios';

const cities = [{ value: 'riyadh', label: 'Riyadh' }, { value: 'jeddah', label: 'Jeddah' }];

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
    const { html, errors } = await render({ name: 'ids', covers: [], template: `<hw-tooltip text="Hint" tooltipId="hint"><span hwTooltipTrigger tabindex="0">Target</span></hw-tooltip><hw-popover label="Filters" triggerLabel="Filters" panelId="filters"><p>Body</p></hw-popover><hw-menu label="Actions" triggerLabel="Actions" panelId="actions" [items]="[{value: 'edit', label: 'Edit'}]" /><hw-calendar label="Date" locale="en-SA" calendar="islamic-umalqura" previousLabel="Previous month" nextLabel="Next month" rangeLabel="Supported dates" unsupportedMessage="Outside the supported range" rangeTooltipId="range" value="2024-03-11" /><hw-navigation-drawer title="Menu" titleId="drawer-title" navigationLabel="Main" closeLabel="Close" [items]="[]" /><hw-portal-layout brand="Portal" navigationId="site-navigation" mainId="site-main" skipLabel="Skip" menuLabel="Menu" navigationLabel="Main" externalLabel="external" [links]="[{label: 'Home', href: 'https://example.org/'}]" />` });
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
    expect(html).not.toMatch(/hw-calendar-toolbar|hw-calendar-grid|<th scope="col">/); expect(html.match(/<div class="hw-field hw-calendar"/g)).toHaveLength(2);
    expect(html).toMatch(/<input type="hidden"[^>]*name="day"[^>]*value="2024-03-11"/); expect(html).toMatch(/<input type="hidden"[^>]*name="date"[^>]*value="2024-03-11"/);
    expect(html).toMatch(/<output[^>]*hidden=""[^>]*><\/output>/); expect(html).toMatch(/<input[^>]*type="text"[^>]*value="2024-03-11"/);
    expect([...html.replace(/<!--.*?-->/g, '').matchAll(/<td[^>]*>([^<]*)<\/td>/g)].map(match => match[1])).toEqual(['b', 'c', 'a']); expect(html).toMatch(/<th[^>]*aria-sort="ascending"/);
    // With a locale the same page renders the grids, the formatted date and the sorted rows, and reports nothing.
    const localized = await render({ name: 'locale', covers: [], template: template('en-SA') });
    expect(localized.errors).toEqual([]); expect(localized.html.match(/hw-calendar-grid/g)).toHaveLength(2); expect(localized.html).toMatch(/<output[^>]*>[^<]*2024[^<]*<\/output>/);
    expect([...localized.html.replace(/<!--.*?-->/g, '').matchAll(/<td(?![^>]*role=)[^>]*>([^<]*)<\/td>/g)].map(match => match[1])).toEqual(['a', 'b', 'c']);
  });

  it('keeps rendering what follows an accordion and gives every item its content', async () => {
    const { html } = await render(scenarios.find(scenario => scenario.name === 'accordion and collapsible')!);
    expect(html.match(/First answer/g)).toHaveLength(3); expect(html.match(/Second answer/g)).toHaveLength(3);
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

  const named = (name: string) => scenarios.find(scenario => scenario.name === name)!;
  /** The open tag and the content of each host element of a selector, in document order. */
  const hostsOf = (html: string, tag: string) => [...canonical(html).matchAll(new RegExp(`<${tag}((?:\\s[^>]*)?)>(.*?)</${tag}>`, 'gs'))].map(match => ({ attributes: match[1]!, content: match[2]! }));

  it('[ATTR-05][SSR-04] forwards aria-label, aria-labelledby, aria-describedby and aria-invalid to the inner control on the server and leaves none on the host', async () => {
    const { html, errors } = await render(named('forwarded aria attributes'));
    expect(errors).toEqual([]);
    const tags = ['hw-text-field', 'hw-textarea', 'hw-select', 'hw-checkbox', 'hw-switch', 'hw-radio-group', 'hw-number-field', 'hw-slider', 'hw-range-slider', 'hw-rating', 'hw-toggle-group', 'hw-file-upload'];
    for (const tag of tags) for (const host of hostsOf(html, tag)) { expect(host.attributes, tag).not.toMatch(/\saria-(label|labelledby|describedby|invalid)=/); expect(host.content, tag).toMatch(/\saria-(label|labelledby)="(Static name|Bound name|heading|City|Agree|Notify|Amount|Volume|Range|Rating|View|Documents)"/); expect(host.content, tag).not.toMatch(/<legend|<label class="hw-label" [^>]*for=/); }
    const [first, bound] = hostsOf(html, 'hw-text-field');
    expect(first!.content).toMatch(/<input[^>]*aria-describedby="note"[^>]*aria-invalid="true"[^>]*aria-label="Static name"/); expect(bound!.content).toMatch(/<input[^>]*aria-label="Bound name"/);
    expect(hostsOf(html, 'hw-toggle-group')[0]!.content).toMatch(/^<fieldset[^>]*aria-describedby="note"[^>]*aria-label="View"/);
  });

  it('[SSR-01][fields-basic-3] renders a field with a nested control on the server: one label, the field id on the control, its descriptions, required and invalid state', async () => {
    const { html, errors } = await render(named('field with Hawiyah controls'));
    expect(errors).toEqual([]);
    const [name, city, amount] = hostsOf(html, 'hw-field').map(host => host.content);
    const id = /<label class="hw-label" for="([^"]+)" id="\1-label">Name<span aria-hidden="true" class="hw-required-marker"> \*<\/span><\/label>/.exec(name!)![1]!;
    expect(id).toMatch(/^hw-field-/); expect(name!.match(/<label/g)).toHaveLength(1);
    const input = /<input[^>]*>/.exec(name!)![0];
    expect(input).toContain(`id="${id}"`); expect(input).toContain(`aria-labelledby="${id}-label"`); expect(input).toContain('required=""'); expect(input).toContain('aria-invalid="true"');
    const described = /aria-describedby="([^"]+)"/.exec(input)![1]!.split(' ');
    expect(described.slice(0, 2)).toEqual([`${id}-hint`, `${id}-error`]); expect(described).toHaveLength(3); expect(name).toContain(`<p class="hw-hint" id="${described[2]}">Own hint</p>`);
    expect(name).toMatch(new RegExp(`<p class="hw-hint" id="${id}-hint">As in the passport</p><p class="hw-error" id="${id}-error">Enter the name</p></div>$`));
    expect(city).toMatch(/<select[^>]*aria-labelledby="hw-field-\d+-label"/); expect(city).not.toContain('aria-invalid'); expect(amount).toMatch(/<input[^>]*aria-describedby="outside"/);
  });

  it('[SELECT-04][RICH-04] renders projected options inside the select after the options of the input, and projected content after a file input', async () => {
    const select = await render(named('select with projected options'));
    expect(select.errors).toEqual([]);
    expect(canonical(select.html)).toMatch(/<select[^>]*>(<option[^>]*value="(riyadh|jeddah|dammam)"[^>]*>[^<]*<\/option>){3}<option value="abha">Abha<\/option><optgroup label="North"><option value="tabuk">Tabuk<\/option><\/optgroup><\/select>/);
    const files = await render(named('file upload and dropzone with projected content'));
    expect(files.errors).toEqual([]);
    const upload = hostsOf(files.html, 'hw-file-upload')[0]!.content, zone = hostsOf(files.html, 'hw-file-dropzone')[0]!.content;
    expect(upload).toMatch(/^<div class="hw-field hw-upload"><label[^>]*>Documents<span[^>]*> \*<\/span><\/label><input[^>]*><hw-file-upload-list>.*<\/hw-file-upload-list><\/div>$/s);
    expect(upload).toMatch(/<input[^>]*capture="environment"[^>]*form="outer"/); expect(upload).not.toMatch(/<input[^>]*\saccept=/);
    // The dropzone on the server: read-only without disabled, an empty status, no file list, no error and no invalid state.
    expect(zone).toMatch(/^<div class="hw-field hw-file-dropzone" data-hw-readonly="true"><label[^>]*>Attachments<\/label><p class="hw-file-dropzone-instruction"[^>]*>Drop files here<\/p><input[^>]*><p role="status"><\/p><hw-file-upload-list>/);
    expect(zone).toMatch(/<input[^>]*accept="\.pdf"[^>]*aria-disabled="true"/); expect(zone).not.toMatch(/hw-error|aria-invalid|<input[^>]*\sdisabled|data-state/);
  });

  it('[SSR-01][choices-6][choices-9][actions-9] renders slider outputs, value texts and both modes of a toggle group with hint, error and required', async () => {
    const sliders = canonical((await render(named('slider and range slider with formatted values'))).html);
    expect(sliders).toMatch(/<input[^>]*aria-valuetext="30 percent"[^>]*><output class="hw-slider-value" for="[^"]+">30 percent<\/output>/); expect(sliders).toMatch(/<output class="hw-slider-value" for="[^"]+">10<\/output>/);
    expect(sliders).toMatch(/<legend class="hw-label">Price<span[^>]*> \*<\/span><\/legend><label class="hw-label">Minimum<input[^>]*aria-valuetext="20 percent"[^>]*><\/label><label class="hw-label">Maximum<input[^>]*aria-valuetext="60 percent"[^>]*><\/label><output class="hw-range-slider-value" for="[^"]+-lower [^"]+-upper">20 to 60<\/output><p class="hw-hint"/);
    expect(sliders).not.toMatch(/<input[^>]*type="range"[^>]*\srequired/);
    const groups = await render(named('toggle group with hint, error and required'));
    expect(groups.errors).toEqual([]);
    const [single, multiple] = hostsOf(groups.html, 'hw-toggle-group').map(host => host.content);
    expect(single).toMatch(/^<fieldset[^>]*aria-describedby="([^" ]+)-hint \1-error"[^>]*aria-invalid="true"[^>]*><legend class="hw-label">City<span aria-hidden="true" class="hw-required-marker"> \*<\/span><\/legend><label><input[^>]*form="outer"[^>]*name="city"[^>]*required=""[^>]*>Riyadh<\/label>/);
    expect(single).toMatch(/<p class="hw-hint" id="[^"]+">Hint<\/p><p class="hw-error" id="[^"]+">Error<\/p><\/fieldset>$/);
    expect(multiple).toMatch(/<legend class="hw-label">Cities<\/legend><input disabled="" form="outer" type="hidden"><button aria-pressed="true" class="hw-button" data-size="md" data-variant="secondary" type="button">Riyadh<\/button>/);
    expect(multiple).toMatch(/<p class="hw-error" id="[^"]+">Error<\/p><input form="outer" name="cities" type="hidden" value="riyadh"><\/fieldset>$/);
  });

  it('[STATE-05][SSR-01][E01][R09] renders an open combobox and a visible password as given, and required rich inputs without an invalid state', async () => {
    const { html, errors } = await render(named('combobox open and password visible'));
    expect(errors).toEqual([]);
    const [open, required] = hostsOf(html, 'hw-combobox').map(host => host.content);
    expect(open).toMatch(/^<div class="hw-field"><label[^>]*>City<\/label><div class="hw-combobox"><input[^>]*aria-expanded="true"[^>]*><input[^>]*type="hidden"[^>]*><ul[^>]*class="hw-listbox"[^>]*>/); expect(/<ul[^>]*>/.exec(open!)![0]).not.toContain('hidden');
    expect(open).toMatch(/<span aria-atomic="true" aria-live="polite" class="hw-sr-only" role="status">3 results<\/span><\/div><p class="hw-hint"[^>]*>Hint<\/p><p class="hw-error"[^>]*>Error<\/p><\/div>$/);
    expect(required).not.toContain('aria-invalid'); expect(required).toMatch(/<ul[^>]*hidden=""/);
    expect(hostsOf(html, 'hw-password-field')[0]!.content).toMatch(/<input[^>]*type="text"[^>]*value="secret"[^>]*><button[^>]*aria-label="Hide password"[^>]*aria-pressed="true"/);
    const rich = await render(named('required rich inputs before any submission'));
    expect(rich.errors).toEqual([]); expect(rich.html).not.toContain('aria-invalid'); expect(rich.html).not.toContain('maxlength');
    const multi = hostsOf(rich.html, 'hw-multi-select')[0]!.content;
    expect(multi).toMatch(/<\/div><span aria-atomic="true" aria-live="polite" class="hw-sr-only" role="status"><\/span><\/fieldset>$/); expect(multi).toMatch(/<label class="hw-label" for="[^"]+">Filter cities<\/label><input[^>]*aria-required="true"/);
    expect(hostsOf(rich.html, 'hw-tag-input')[0]!.content).toMatch(/<div class="hw-tag-input"><ul role="list"><li class="hw-chip">alpha<button[^>]*aria-label="Remove alpha"/);
    expect(hostsOf(rich.html, 'hw-search-field')[0]!.content).toMatch(/<input[^>]*aria-label="Search the site"/); expect(rich.html).not.toContain('hw-search-submit');
  });

  it('[SSR-03] registers no reset listener on the server for a form with every control of the two clusters', async () => {
    const types: string[] = [];
    let restore = () => {};
    const { errors } = await render({ name: 'reset listeners', covers: [], state: () => {
      // Every node of the server document shares one addEventListener; Angular's own template listeners go through it too,
      // so the form opts out of NgForm, which listens for reset itself.
      let owner: object | null = inject(DOCUMENT);
      while (owner && !Object.prototype.hasOwnProperty.call(owner, 'addEventListener')) owner = Object.getPrototypeOf(owner) as object | null;
      const target = owner as { addEventListener: (...args: unknown[]) => unknown }, original = target.addEventListener;
      target.addEventListener = function (this: unknown, ...args: unknown[]) { types.push(String(args[0])); return original.apply(this, args); };
      restore = () => { target.addEventListener = original; };
      return { cities, rating: text.rating, remove: text.remove, results: text.results, files: text.files };
    }, template: `<form id="f" ngNoForm><hw-text-field name="a" /><hw-textarea name="b" /><hw-select name="c" [options]="cities" /><hw-checkbox name="d" label="D" /><hw-switch name="e" label="E" /><hw-radio-group name="g" [options]="cities" /><hw-number-field name="h" /><hw-slider name="i" /><hw-range-slider name="j" lowerLabel="Minimum" upperLabel="Maximum" /><hw-rating name="k" [getRatingLabel]="rating" /><hw-toggle-group name="l" label="L" [options]="cities" /><hw-toggle-group name="m" label="M" multiple [options]="cities" />
      <hw-combobox name="n" label="N" [options]="cities" emptyMessage="None" [getResultsMessage]="results" /><hw-password-field name="o" label="O" showLabel="Show" hideLabel="Hide" /><hw-search-field name="p" label="P" clearLabel="Clear" /><hw-pin-input name="q" label="Q" /><hw-tag-input name="r" label="R" [getRemoveLabel]="remove" /><hw-multi-select name="s" label="S" [options]="cities" searchLabel="Filter" emptyMessage="None" [getResultsMessage]="results" /><hw-file-upload name="t" label="T" /><hw-file-dropzone name="u" label="U" dropLabel="Drop" /></form>` });
    restore();
    expect(errors).toEqual([]); expect(types.filter(type => type === 'reset')).toEqual([]);
  });
  // Milestone 3: dates, overlays, disclosure, data, navigation, menus and shell.
  it('[SSR-01][ATTR-05][R01][dates-7] renders calendars and pickers with the status element, without a produced error, the names on the inner element', async () => {
    const { html, errors } = await render(named('calendar and date picker with predicate, status and names'));
    expect(errors).toEqual([]);
    for (const tag of ['hw-calendar', 'hw-date-picker']) for (const host of hostsOf(html, tag)) expect(host.attributes, tag).not.toMatch(/\saria-(label|labelledby|describedby|invalid)=/);
    const [named1, hijri] = hostsOf(html, 'hw-calendar');
    expect(named1!.content).toMatch(/<table[^>]*aria-describedby="calendar-note [^"]*-hint"[^>]*aria-label="Day"[^>]*class="hw-calendar-grid"/); expect(named1!.content).toMatch(/<\/table><p class="hw-sr-only" role="status"><\/p>/);
    // Friday 2024-03-15 is rejected by the predicate on the server as on the client.
    expect(named1!.content).toMatch(/<button[^>]*data-date="2024-03-15"[^>]*disabled=""/); expect(named1!.content).not.toMatch(/<button[^>]*data-date="2024-03-14"[^>]*disabled=""/);
    expect(hijri!.content).toMatch(/<table[^>]*aria-labelledby="calendar-heading"/); expect(hijri!.content).not.toMatch(/<table[^>]*aria-label=/);
    expect(hijri!.content).toMatch(/<p class="hw-sr-only" role="status">Choose a date from <bdi dir="ltr">1900-04-30<\/bdi>\.<\/p>/);
    expect(hijri!.content).toMatch(/<span[^>]*aria-describedby="[^"]*-range"[^>]*aria-label="Supported dates"[^>]*class="hw-tooltip-trigger hw-calendar-info-icon"[^>]*role="img"[^>]*tabindex="0"/);
    const [picker, withError] = hostsOf(html, 'hw-date-picker');
    expect(picker!.content).not.toMatch(/class="hw-error"/); expect(picker!.content).not.toMatch(/<label class="hw-label"/); expect(picker!.content).toMatch(/<input[^>]*aria-label="Appointment"[^>]*type="text"/); expect(picker!.content).not.toMatch(/<input[^>]*aria-invalid=[^>]*type="text"/);
    expect(picker!.content).toMatch(/aria-label="Day 2024-03-11"/); expect(picker!.content).toMatch(/<input[^>]*form=""[^>]*type="hidden"/);
    expect(withError!.content.match(/class="hw-error"/g)).toHaveLength(1); expect(withError!.content).toMatch(/<p class="hw-error" id="[^"]*-error">Choose another date<\/p>/); expect(withError!.content).toMatch(/<span aria-hidden="true" class="hw-required-marker"> \*<\/span><\/label>/);
  });

  it('[SSR-04][SSR-02][overlays-10][overlays-14] renders the description on the native dialog and the tooltip id on the marked trigger', async () => {
    const dialogs = await render(named('dialog and drawer, closed and open'));
    expect(dialogs.errors).toEqual([]);
    for (const tag of ['hw-dialog', 'hw-drawer']) for (const host of hostsOf(dialogs.html, tag)) expect(host.attributes, tag).not.toMatch(/\s(aria-(label|labelledby|describedby)|title)=/);
    expect(hostsOf(dialogs.html, 'hw-drawer').at(-1)!.content).toMatch(/^<dialog[^>]*aria-describedby="drawer-note"[^>]*aria-labelledby="own-title"[^>]*class="hw-dialog hw-drawer"/);
    expect(hostsOf(dialogs.html, 'hw-dialog').at(-1)!.content).toMatch(/^<dialog[^>]*aria-describedby="dialog-note"[^>]*aria-label="Review"[^>]*aria-labelledby="hw-dialog-title-\d+"/);
    // An empty footer holds nothing at all, so :empty matches it.
    expect(dialogs.html.replace(/<!--.*?-->/g, '')).toContain('<footer class="hw-dialog-footer"></footer>');
    const tips = await render(named('tooltip, popover and menu'));
    expect(tips.errors).toEqual([]);
    const [first] = hostsOf(tips.html, 'hw-tooltip');
    expect(first!.attributes).toMatch(/class="[^"]*hw-tooltip-anchor[^"]*"/); expect(first!.attributes).toMatch(/id="tip-host"/); expect(first!.attributes).not.toMatch(/tabindex|aria-describedby/);
    expect(first!.content).toMatch(/^<button[^>]*aria-describedby="more (hw-tooltip-\d+)"[^>]*class="hw-tooltip-trigger"[^>]*>Target<\/button><span[^>]*hidden=""[^>]*id="\1"[^>]*role="tooltip"[^>]*>Hint<\/span>$/);
  });

  it('[SSR-01][RICH-04][STATE-05][nav-a-14][layout-3][portal-shell-4][E04] renders templates, state texts, the heading level, the open menu and the brand as the client does', async () => {
    const steps = await render(named('breadcrumb, pagination and stepper'));
    const stepsHtml = canonical(steps.html);
    expect(stepsHtml).toContain('<span>Details</span><span class="hw-sr-only" data-hw-step-status="">Complete</span><p class="hw-hint">About you</p>');
    expect(stepsHtml).toMatch(/<li[^>]*aria-current="step"[^>]*><span>Review<\/span><\/li>/); expect(stepsHtml).toContain('<span>Send</span><span class="hw-sr-only" data-hw-step-status="">Not started</span>');
    expect(stepsHtml).toMatch(/<nav[^>]*aria-labelledby="trail"/); expect(stepsHtml).toContain('<span aria-current="page">Permits</span>'); expect(stepsHtml).toMatch(/<a href="https:\/\/example.org\/archive">Archive<\/a>/);
    // The last page: Next is aria-disabled and not disabled.
    expect(canonical(steps.html)).toMatch(/<button aria-disabled="true" aria-label="Next page" class="hw-button hw-pagination-arrow" data-hw-next="" data-variant="ghost" type="button">/);
    const tables = await render(named('tables with cell templates'));
    expect(tables.errors).toEqual([]);
    expect(tables.html.replace(/<!--.*?-->/g, '')).toContain('<th scope="row"><a href="https://example.org/R-1">1. R-1</a></th><td>Beta</td>');
    expect(hostsOf(tables.html, 'hw-data-table')[0]!.content).toMatch(/<a href="https:\/\/example.org\/R-1">1\. R-1<\/a>.*<a href="https:\/\/example.org\/R-2">2\. R-2<\/a>/s);
    const accordion = await render(named('accordion and collapsible'));
    expect(canonical(accordion.html)).toMatch(/<div[^>]*aria-label="Questions"[^>]*role="group"[^>]*>.*<summary class="hw-accordion-trigger"><span[^>]*data-icon="link-04"[^>]*><\/span>1\. First question <a href="https:\/\/example.org\/help">Help<\/a><\/summary><div class="hw-accordion-content"><p>First answer<\/p><a href="https:\/\/example.org\/more">More<\/a><\/div>/s);
    expect(accordion.html).toMatch(/<summary[^>]*aria-disabled="true"[^>]*>Unavailable<\/summary>/);
    const shell = await render(named('portal header open, brand without a link and page header level'));
    expect(shell.errors).toEqual([]);
    const [open, plainBrand, linked] = hostsOf(shell.html, 'hw-portal-header');
    expect(open!.content).toMatch(/<button[^>]*aria-expanded="true"[^>]*class="hw-button hw-portal-menu-toggle"/); expect(open!.content).toMatch(/<nav[^>]*data-open="true"/);
    expect(open!.content).toMatch(/<div aria-label="National portal" class="hw-portal-brand" role="img"><span[^>]*hwbrand=""/); expect(open!.content.match(/hwbrand=""/g)).toHaveLength(1);
    expect(plainBrand!.content).toMatch(/<div class="hw-portal-brand"><span>Plain<\/span><\/div>/); expect(plainBrand!.content).toMatch(/<nav[^>]*data-open="false"/);
    expect(linked!.content).toMatch(/<a aria-label="Linked" class="hw-portal-brand" href="https:\/\/example.org\/"><span[^>]*hwbrand=""/);
    expect(canonical(shell.html)).toMatch(/<h3>Embedded<\/h3><p>Inside a page<\/p>/); expect(hostsOf(shell.html, 'hw-page-header')[0]!.content).not.toMatch(/<h1/);
  });

  it('[SSR-01][ATTR-05][nav-b-1][E08] renders named roots, link items and tree toggles, and starts no type-ahead timer on the server', async () => {
    const delays: unknown[] = [];
    const timeout = globalThis.setTimeout;
    const spy = vi.spyOn(globalThis, 'setTimeout').mockImplementation(((handler: () => void, delay?: number, ...rest: unknown[]) => { delays.push(delay); return timeout(handler, delay, ...rest); }) as typeof setTimeout);
    const { html, errors } = await render(named('named roots, menu links and tree toggles'));
    spy.mockRestore();
    expect(errors).toEqual([]); expect(delays).not.toContain(500);
    for (const tag of ['hw-popover', 'hw-menu', 'hw-tabs', 'hw-secondary-nav', 'hw-tree-view', 'hw-content-navigation', 'hw-carousel']) for (const host of hostsOf(html, tag)) expect(host.attributes, tag).not.toMatch(/\saria-(label|labelledby|describedby)=/);
    const [popover, bound] = hostsOf(html, 'hw-popover');
    expect(popover!.content).toMatch(/^<div class="hw-popover"><button[^>]*aria-expanded="true"[^>]*data-variant="ghost"/); expect(popover!.content).toMatch(/<div[^>]*aria-labelledby="popover-heading"[^>]*class="hw-popover-panel"[^>]*role="region"/);
    expect(bound!.content).toMatch(/<div[^>]*aria-describedby="root-note"[^>]*aria-label="Bound filters"[^>]*class="hw-popover-panel"[^>]*hidden=""/); expect(bound!.content).toMatch(/<button[^>]*data-variant="secondary"/);
    const menu = hostsOf(html, 'hw-menu')[0]!.content;
    expect(menu).toMatch(/<div[^>]*aria-label="Actions"[^>]*class="hw-menu-content"[^>]*role="menu"/); expect(menu).not.toMatch(/hw-menu-panel|<ul|<li/);
    expect(menu).toMatch(/<button class="hw-menu-item" role="menuitem" tabindex="0" type="button">Edit<\/button><a class="hw-menu-item" href="https:\/\/example.org\/help" role="menuitem" tabindex="-1">Help<\/a><a aria-disabled="true" class="hw-menu-item" role="menuitem" tabindex="-1">Gone<\/a>/);
    expect(hostsOf(html, 'hw-tabs')[0]!.content).toMatch(/<div[^>]*aria-labelledby="root-heading"[^>]*role="tablist"/); expect(hostsOf(html, 'hw-secondary-nav')[0]!.content).toMatch(/^<nav aria-label="Section"/);
    const tree = hostsOf(html, 'hw-tree-view')[0]!.content;
    expect(tree).toMatch(/^<ul[^>]*aria-label="Sections"[^>]*role="tree"/); expect(tree).toMatch(/<li[^>]*aria-labelledby="(hw-control-\d+-a%2F1)"[^>]*aria-level="2"[^>]*style="--hw-tree-depth: ?1;?"[^>]*><button aria-label="Collapse Permits" class="hw-tree-toggle" tabindex="-1" type="button">.*?<\/button><span id="\1">Permits<\/span>/s);
    expect(tree).not.toMatch(/padding-inline-start/); expect(tree).toMatch(/<input[^>]*name="section"[^>]*type="hidden"[^>]*value="a\/1"/);
    expect(hostsOf(html, 'hw-content-navigation')[0]!.content).toMatch(/<nav[^>]*aria-labelledby="root-heading"/); expect(hostsOf(html, 'hw-content-navigation')[0]!.content).not.toMatch(/<h2/);
    expect(canonical(html)).toMatch(/<hw-side-navigation aria-label="Documentation" class="hw-side-navigation hw-navigation-drawer-nav"[^>]*role="navigation"/); expect(canonical(html)).toMatch(/<nav aria-labelledby="root-heading" class="hw-side-navigation hw-navigation-drawer-nav"/);
    const carousel = hostsOf(html, 'hw-carousel')[0]!.content;
    expect(carousel).toMatch(/<section[^>]*aria-describedby="root-note"[^>]*aria-label="Highlights"[^>]*class="hw-carousel"/); expect(carousel).toMatch(/<button aria-disabled="true" aria-label="Next slide" class="hw-button hw-carousel-arrow" data-hw-next="" type="button">/); expect(carousel).not.toMatch(/<button[^>]*data-hw-previous=""[^>]*(aria-disabled|disabled)/);
  });

  it('[SSR-01][service-patterns-2][service-patterns-7] renders the service card and details anatomy with empty regions that hold nothing', async () => {
    const { html, errors } = await render(named('service content, feedback and consent'));
    expect(errors).toEqual([]);
    const bare = html.replace(/<!--.*?-->/g, '');
    const [card, plainCard, own] = hostsOf(bare, 'hw-service-card');
    expect(card!.content).toMatch(/^<article class="hw-card hw-service-card" data-variant="default"><header class="hw-card-header"><div aria-hidden="true" class="hw-service-card-icon"><\/div><div><span class="hw-badge" data-tone="neutral">Community<\/span><h3>Event permit<\/h3><\/div><\/header><div class="hw-card-body"><p>Apply\.<\/p><dl class="hw-description-list"><div><dt>Duration<\/dt><dd>3 days<\/dd><\/div><div><dt>Fee<\/dt><dd>No fee<\/dd><\/div><\/dl><\/div><footer class="hw-card-footer"><a class="hw-link" href="https:\/\/example.org\/permit">View<\/a><\/footer><\/article>$/);
    expect(plainCard!.content).toContain('<div class="hw-card-body"></div><footer class="hw-card-footer"></footer>');
    expect(own!.content).toMatch(/<footer class="hw-card-footer"><a[^>]*hwserviceaction=""[^>]*>Start<\/a><\/footer>/); expect(own!.content).not.toMatch(/class="hw-link"/);
    const [details, withAction] = hostsOf(bare, 'hw-service-details');
    expect(details!.content).toMatch(/^<article class="hw-service-details"><header><h2>Event permit<\/h2><p>Details\.<\/p><\/header><dl class="hw-description-list"><div><dt>Fee<\/dt><dd>No fee<\/dd><\/div><\/dl><section><h3>Requirements<\/h3><ul><li>National ID<\/li><\/ul><\/section><footer><\/footer><\/article>$/);
    expect(withAction!.content).toMatch(/<li>1\. <a href="https:\/\/example.org\/id">National ID<\/a><\/li><li>2\. <a href="https:\/\/example.org\/id">Address<\/a><\/li>/); expect(withAction!.content).toMatch(/<p>Body<\/p><footer><button[^>]*>Start<\/button><\/footer><\/article>$/);
  });
});
