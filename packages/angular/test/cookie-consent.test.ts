import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { attributesOf, contentOf, page } from './fixtures/page';
import { missingTextWarnings } from './fixtures/texts';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); });

const texts = 'title="Cookies" description="We use cookies to improve the service." acceptLabel="Accept" rejectLabel="Reject"';

// The Angular side of tests/cookie-consent-parity.test.ts: the same case ids and assertions on the DOM.
describe('CookieConsent', () => {
  it('[CONSENT-01][service-patterns-19] the buttons are inside div.hw-button-group in the order Accept (primary), Reject (secondary), Preferences (ghost, only with a listener)', () => {
    const { root } = page(`<hw-cookie-consent ${texts} policyHref="/cookies" policyLabel="Cookie policy" preferencesLabel="Preferences" (preferences)="seen = true"><p id="extra">More</p></hw-cookie-consent>`, { seen: false });
    const region = root.querySelector('.hw-cookie-consent')!;
    expect(contentOf(region).map(node => (node as Element).localName)).toEqual(['h2', 'p', 'a', 'p', 'div']); expect(region.querySelector('p')!.textContent).toBe('We use cookies to improve the service.');
    expect(attributesOf(region.querySelector('a')!)).toEqual({ class: 'hw-link', href: '/cookies' }); expect(region.querySelector('a')!.textContent).toBe('Cookie policy');
    const group = region.lastElementChild!; expect(attributesOf(group)).toEqual({ class: 'hw-button-group' });
    expect([...group.children].map(button => [button.localName, button.getAttribute('type'), button.className, button.getAttribute('data-variant'), button.textContent])).toEqual([['button', 'button', 'hw-button', 'primary', 'Accept'], ['button', 'button', 'hw-button', 'secondary', 'Reject'], ['button', 'button', 'hw-button', 'ghost', 'Preferences']]);
    // Tab order is the document order: the policy link, then the three buttons; nothing carries a tabindex.
    expect([...region.querySelectorAll('a, button')].map(control => control.textContent)).toEqual(['Cookie policy', 'Accept', 'Reject', 'Preferences']); expect(region.querySelector('[tabindex]')).toBeNull();
  });

  it('[CONSENT-02][R04] the region is labelled by its h2 and carries no aria-label; an application aria-label replaces the reference', () => {
    const { root } = page(`<hw-cookie-consent ${texts} /><hw-cookie-consent ${texts} aria-label="Cookie choices" />`);
    const [region, named] = [...root.querySelectorAll('hw-cookie-consent')];
    const heading = region!.querySelector('h2')!; expect(heading.textContent).toBe('Cookies'); expect(heading.id).not.toBe('');
    expect(region!.getAttribute('aria-labelledby')).toBe(heading.id); expect(region!.className).toBe('hw-cookie-consent'); expect(region!.getAttribute('role')).toBe('region'); expect(region!.hasAttribute('aria-label')).toBe(false); expect(region!.hasAttribute('title')).toBe(false);
    expect(named!.getAttribute('aria-label')).toBe('Cookie choices'); expect(named!.hasAttribute('aria-labelledby')).toBe(false); expect(named!.querySelector('h2')!.textContent).toBe('Cookies');
    expect(heading.id).not.toBe(named!.querySelector('h2')!.id);
  });

  it('[STATE-01] Reject notifies consent(\'rejected\') once, then open false once, and the region is hidden', () => {
    const { root, state, update } = page(`<hw-cookie-consent ${texts} (consent)="events.push($event)" (openChange)="events.push($event)" />`, { events: [] as unknown[] });
    const region = root.querySelector<HTMLElement>('hw-cookie-consent')!; expect(region.hidden).toBe(false);
    [...region.querySelectorAll('button')].find(button => button.textContent === 'Reject')!.click(); update();
    expect(state.events).toEqual(['rejected', false]); expect(region.hasAttribute('hidden')).toBe(true); expect(region.isConnected).toBe(true);
  });

  it('[STATE-01] Accept notifies consent(\'accepted\'); Preferences only notifies and keeps the region open', () => {
    const { root, state, update } = page(`<hw-cookie-consent ${texts} preferencesLabel="Preferences" (consent)="events.push($event)" (openChange)="events.push($event)" (preferences)="events.push('preferences')" />`, { events: [] as unknown[] });
    const region = root.querySelector<HTMLElement>('hw-cookie-consent')!, button = (name: string) => [...region.querySelectorAll('button')].find(entry => entry.textContent === name)!;
    button('Preferences').click(); update(); expect(state.events).toEqual(['preferences']); expect(region.hasAttribute('hidden')).toBe(false);
    button('Accept').click(); update(); expect(state.events).toEqual(['preferences', 'accepted', false]); expect(region.hasAttribute('hidden')).toBe(true);
  });

  // Convention controlled-and-observable-state for Angular: a written value is the initial state and the component then
  // updates its own field, so an open that the application does not write back still closes with the choice.
  it('[STATE-02] a bound open that the application keeps is the initial state: consent and open false are each reported once and the region closes', () => {
    const { root, state, update } = page(`<hw-cookie-consent ${texts} [open]="open" (openChange)="events.push($event)" (consent)="events.push($event)" />`, { open: true, events: [] as unknown[] });
    const region = root.querySelector<HTMLElement>('hw-cookie-consent')!;
    region.querySelectorAll('button')[1]!.click(); update();
    expect(state.events).toEqual(['rejected', false]); expect(state.open).toBe(true); expect(region.hasAttribute('hidden')).toBe(true);
  });

  it('[STATE-03][STATE-04] setting open from the application does not notify; [(open)] round-trips', () => {
    const { root, state, update } = page(`<hw-cookie-consent ${texts} [(open)]="open" (openChange)="events.push($event)" (consent)="events.push($event)" />`, { open: false, events: [] as unknown[] });
    const region = root.querySelector<HTMLElement>('hw-cookie-consent')!;
    expect(region.hasAttribute('hidden')).toBe(true); expect(region.querySelector('h2')!.textContent).toBe('Cookies');
    update({ open: true }); expect(region.hasAttribute('hidden')).toBe(false); expect(state.events).toEqual([]);
    region.querySelector('button')!.click(); update(); expect(state.open).toBe(false); expect(state.events).toEqual(['accepted', false]); expect(region.hasAttribute('hidden')).toBe(true);
    update({ open: true }); expect(region.hasAttribute('hidden')).toBe(false); expect(state.events).toHaveLength(2);
  });

  it('[TEXT-03] no Preferences button and no policy link without their switch; their texts are then not required', () => {
    const { root, update } = page(`<hw-cookie-consent ${texts} />`); update();
    expect(root.querySelectorAll('button')).toHaveLength(2); expect(root.querySelector('a')).toBeNull();
  });

  it('[TEXT-01] title, description, acceptLabel and rejectLabel missing: nothing in their place and one warning each; policyLabel and preferencesLabel only under their condition', () => {
    const warnings = missingTextWarnings();
    const { root, update } = page(`<hw-cookie-consent [title]="''" [description]="''" [acceptLabel]="''" [rejectLabel]="''" policyHref="/cookies" (preferences)="seen = true" />`, { seen: false }); update();
    const region = root.querySelector('hw-cookie-consent')!;
    expect(region.textContent).toBe(''); expect(region.querySelector('h2')).toBeNull(); expect(region.hasAttribute('aria-labelledby')).toBe(false); expect(region.querySelectorAll('button')).toHaveLength(3);
    expect(warnings.map(warning => warning.split('.')[0])).toEqual(['title', 'description', 'acceptLabel', 'rejectLabel', 'policyLabel" when policyHref is set', 'preferencesLabel" when a preferences listener is bound'].map(name => `Hawiyah: hw-cookie-consent requires "${name}${name.includes('"') ? '' : '"'}`));
  });

  it('[CONSENT-04][service-patterns-21] variant=banner writes data-variant on .hw-cookie-consent; no attribute without it', () => {
    const { root } = page(`<hw-cookie-consent ${texts} variant="banner" /><hw-cookie-consent ${texts} />`);
    expect([...root.querySelectorAll('.hw-cookie-consent')].map(region => region.getAttribute('data-variant'))).toEqual(['banner', null]);
  });
});
