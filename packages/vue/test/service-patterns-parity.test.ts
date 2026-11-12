// ServiceCard and ServiceDetails cases shared by the four adapters (milestone 3: service-patterns-1, -2, -7, R17, R18).
import { afterEach, beforeEach, expect, expectTypeOf, it, vi } from 'vitest';
import { createApp, defineComponent, h, type App } from 'vue';
import { resetTextWarnings } from '@hawiyah/core';
import { ServiceCard, ServiceDetails } from '../src/patterns.js';
import type { DescriptionItem } from '../src/content.js';

let app: App | undefined;
let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => { resetTextWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
afterEach(() => { app?.unmount(); app = undefined; document.body.replaceChildren(); warn.mockRestore(); });
const warnings = () => (warn.mock.calls as unknown[][]).map(call => String(call[0])).filter(message => message.startsWith('Hawiyah:'));
function mount(render: () => ReturnType<typeof h>) {
  const host = document.createElement('div'); document.body.append(host);
  app = createApp(defineComponent(() => render)); app.mount(host); return host;
}
// The fixture shared with React and Angular.
const metadata = [{ term: 'Duration', description: '3 working days' }, { term: 'Fee', description: 'SAR 100' }];
const pairs = (list: Element) => [...list.children].map(entry => [entry.tagName, ...[...entry.children].map(child => `${child.tagName}:${child.textContent}`)]);
const focusables = (root: Element) => root.querySelectorAll('a[href], button, input, [tabindex]');

it('[SHAPE-01][service-patterns-1] metadata renders a stacked dl with one dt/dd pair per entry in ServiceCard and ServiceDetails', () => {
  const host = mount(() => h('div', [h(ServiceCard, { title: 'Passport', metadata }), h(ServiceDetails, { title: 'Passport', metadata })]));
  const lists = [...host.querySelectorAll('dl.hw-description-list')];
  expect(lists).toHaveLength(2);
  for (const list of lists) { expect(list.hasAttribute('data-variant')).toBe(false); expect(pairs(list)).toEqual([['DIV', 'DT:Duration', 'DD:3 working days'], ['DIV', 'DT:Fee', 'DD:SAR 100']]); }
  expect(lists[0]!.parentElement!.matches('.hw-card-body')).toBe(true);
  expect(lists[1]!.previousElementSibling!.tagName).toBe('HEADER');
});

it('[SERVICE-00] no dl when metadata is absent or empty', () => {
  const host = mount(() => h('div', [h(ServiceCard, { title: 'A' }), h(ServiceCard, { title: 'B', metadata: [] }), h(ServiceDetails, { title: 'C' }), h(ServiceDetails, { title: 'D', metadata: [] })]));
  expect(host.querySelector('dl')).toBeNull();
});

it('[SHAPE-03][service-patterns-1][service-patterns-2] Vue: ServiceCard takes description items and category; ServiceDetails has no items prop', () => {
  expectTypeOf<InstanceType<typeof ServiceCard>['$props']['metadata']>().toEqualTypeOf<readonly DescriptionItem[] | undefined>();
  expect(Object.keys(ServiceCard.props)).not.toContain('badge');
  expect(Object.keys(ServiceDetails.props)).not.toContain('items');
  // A former `badge` falls through as an attribute instead of rendering a badge.
  const host = mount(() => h(ServiceCard, { title: 'A', badge: 'New' } as never));
  expect(host.querySelector('.hw-badge')).toBeNull();
});

it('[SERVICE-01][service-patterns-2] the card outline: header with the badge before a text-only h3, body with p and dl, footer with one a.hw-link', () => {
  const host = mount(() => h(ServiceCard, { title: 'Passport', description: 'Renew a passport', category: 'Travel', metadata, href: '/passport', actionLabel: 'Start' }, { icon: () => h('span', { class: 'hw-icon', 'data-icon': 'passport' }) }));
  const card = host.querySelector('article.hw-card.hw-service-card')!;
  const header = card.querySelector(':scope > header.hw-card-header')!;
  expect(header.firstElementChild!.matches('div.hw-service-card-icon[aria-hidden=true]')).toBe(true);
  const heading = header.querySelector(':scope > div > h3')!;
  expect(heading.previousElementSibling!.matches('span.hw-badge[data-tone=neutral]')).toBe(true);
  expect(heading.previousElementSibling!.textContent).toBe('Travel');
  expect(heading.children).toHaveLength(0);
  expect([...card.querySelector(':scope > div.hw-card-body')!.children].map(child => child.tagName)).toEqual(['P', 'DL']);
  const actions = card.querySelectorAll(':scope > footer.hw-card-footer > a.hw-link');
  expect(actions).toHaveLength(1); expect(actions[0]!.getAttribute('href')).toBe('/passport'); expect(actions[0]!.textContent).toBe('Start');
});

it('[SERVICE-02][R18] the action: none without href; a.hw-link with href; the action slot replaces it; one focusable element with an action', () => {
  const host = mount(() => h('div', [
    h(ServiceCard, { title: 'A' }),
    h(ServiceCard, { title: 'B', href: '/b', actionLabel: 'Open' }),
    h(ServiceCard, { title: 'C', href: '/c', actionLabel: 'Open' }, { action: () => h('button', { type: 'button' }, 'Apply') }),
  ]));
  const [plain, linked, custom] = [...host.querySelectorAll('.hw-service-card')];
  expect(plain!.querySelector('footer')).toBeNull(); expect(focusables(plain!)).toHaveLength(0);
  expect(focusables(linked!)).toHaveLength(1); expect(linked!.querySelector('a.hw-link')).not.toBeNull();
  expect(focusables(custom!)).toHaveLength(1); expect(custom!.querySelector('footer > button')!.textContent).toBe('Apply'); expect(custom!.querySelector('a')).toBeNull();
  expect(warnings()).toEqual([]);
});

it('[TEXT-02][R18] actionLabel is asked for only with href and no action: an empty link text and one warning', () => {
  const host = mount(() => h(ServiceCard, { title: 'A', href: '/a' }));
  expect(host.querySelector('a.hw-link')!.textContent).toBe('');
  expect(warnings()).toHaveLength(1); expect(warnings()[0]).toContain('actionLabel');
});

it('[SERVICE-04][service-patterns-7] the details outline: article, header, dl, requirements section, action in a footer as the last child', () => {
  const host = mount(() => h(ServiceDetails, { title: 'Passport', description: 'Renewal', metadata, requirements: ['National ID', 'Photo'], requirementsLabel: 'Requirements' }, { action: () => h('a', { href: '/start' }, 'Start') }));
  const root = host.querySelector('article.hw-service-details')!;
  expect([...root.children].map(child => child.tagName)).toEqual(['HEADER', 'DL', 'SECTION', 'FOOTER']);
  expect(root.querySelector('header > h2')!.textContent).toBe('Passport'); expect(root.querySelector('header > p')!.textContent).toBe('Renewal');
  expect(root.querySelector('section > h3')!.textContent).toBe('Requirements');
  expect([...root.querySelectorAll('section > ul > li')].map(item => item.textContent)).toEqual(['National ID', 'Photo']);
  expect(root.lastElementChild!.querySelector('a')!.textContent).toBe('Start');
  expect(root.querySelector('.hw-service-details-action')).toBeNull();
});

it('[TEXT-01][R17] requirements without requirementsLabel: the list without h3 and one warning', () => {
  const host = mount(() => h(ServiceDetails, { title: 'Passport', requirements: ['National ID'] }));
  expect(host.querySelector('section > h3')).toBeNull(); expect(host.querySelectorAll('section > ul > li')).toHaveLength(1);
  expect(warnings()).toHaveLength(1); expect(warnings()[0]).toContain('ServiceDetails'); expect(warnings()[0]).toContain('requirementsLabel');
});

it('[TEXT-02][R17] requirementsLabel is not asked for without requirements; no section', () => {
  const host = mount(() => h(ServiceDetails, { title: 'Passport' }));
  expect(host.querySelector('section')).toBeNull(); expect(warnings()).toEqual([]);
});

it('[SERVICE-05] requirements and requirements-label do not fall through as attributes', () => {
  const host = mount(() => h(ServiceDetails, { title: 'Passport', requirements: ['A'], requirementsLabel: 'Needed' }));
  const root = host.querySelector('.hw-service-details')!;
  expect(root.hasAttribute('requirements')).toBe(false); expect(root.hasAttribute('requirementslabel')).toBe(false); expect(root.hasAttribute('requirements-label')).toBe(false);
});

it('[RICH-01][RICH-02][R17] the #requirement slot renders a link inside its li; without it the strings are listed', () => {
  const host = mount(() => h('div', [
    h(ServiceDetails, { title: 'A', requirements: ['ID', 'Photo'], requirementsLabel: 'Needed' }, { requirement: ({ item, index }: { item: string; index: number }) => h('a', { href: `#r${index}` }, item) }),
    h(ServiceDetails, { title: 'B', requirements: ['ID', 'Photo'], requirementsLabel: 'Needed' }),
  ]));
  const [rich, plain] = [...host.querySelectorAll('.hw-service-details ul')];
  expect([...rich!.querySelectorAll('li > a')].map(link => [link.getAttribute('href'), link.textContent])).toEqual([['#r0', 'ID'], ['#r1', 'Photo']]);
  expect([...plain!.children].map(item => item.innerHTML)).toEqual(['ID', 'Photo']);
});
