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

describe('Angular server rendering', () => {
  it('has a scenario for every exported component and directive', () => {
    const covered = new Set(scenarios.flatMap(scenario => scenario.covers));
    expect(declarations.map(({ name }) => name).filter(name => !covered.has(name))).toEqual([]);
    expect(declarations.length).toBeGreaterThanOrEqual(87);
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
