// AvatarGroup, DescriptionList, Stat, Timeline and Link cases shared by the four adapters
// (milestone 3: content-display-7, -11, -13, -14, -16, actions-7).
import { afterEach, beforeEach, expect, expectTypeOf, it, vi } from 'vitest';
import { createApp, createSSRApp, defineComponent, h, nextTick, ref, type App } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { resetTextWarnings } from '@hawiyah/core';
import { AvatarGroup, DescriptionList, Link, Stat, Timeline, type TimelineItem } from '../src/content.js';

let app: App | undefined;
let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => { resetTextWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
afterEach(() => { app?.unmount(); app = undefined; document.body.replaceChildren(); warn.mockRestore(); });
const warnings = () => (warn.mock.calls as unknown[][]).map(call => String(call[0])).filter(message => message.startsWith('Hawiyah:'));
function mount(render: () => ReturnType<typeof h>) {
  const host = document.createElement('div'); document.body.append(host);
  app = createApp(defineComponent(() => render)); app.mount(host); return host;
}
const riyal = () => h('bdi', [h('span', { class: 'hw-riyal', 'aria-hidden': 'true' }), '120 ', h('span', { class: 'hw-sr-only' }, 'riyals')]);

it('[SHAPE-01][content-display-7] each avatar of the group takes size and variant from its item', () => {
  const host = mount(() => h(AvatarGroup, { label: 'Team', getOverflowLabel: (count: number) => `${count} more`, items: [{ name: 'Rana Cole', initials: 'RC', size: '64', variant: 'square' }, { name: 'Sami' }] }));
  const [first, second] = [...host.querySelectorAll('.hw-avatar-group > .hw-avatar')];
  expect([first!.textContent, first!.getAttribute('data-size'), first!.getAttribute('data-variant')]).toEqual(['RC', '64', 'square']);
  expect([second!.textContent, second!.hasAttribute('data-size'), second!.hasAttribute('data-variant')]).toEqual(['S', false, false]);
});

it('[DESCRIPTION-LIST-01][content-display-11] without variant the dl has no data-variant; each of the three values is written', () => {
  const items = [{ term: 'Fee', description: 'SAR 100' }];
  const host = mount(() => h('div', [h(DescriptionList, { items }), ...(['stacked', 'horizontal', 'compact'] as const).map(variant => h(DescriptionList, { items, variant }))]));
  expect([...host.querySelectorAll('dl.hw-description-list')].map(list => list.getAttribute('data-variant'))).toEqual([null, 'stacked', 'horizontal', 'compact']);
});

it('[STAT-01][content-display-13] string inputs render label, value, description and trend in that order; no dl', () => {
  const host = mount(() => h(Stat, { label: 'Requests', value: 1284, description: 'This month', trend: '+12%' }));
  const root = host.querySelector('div.hw-stat')!;
  expect([...root.children].map(child => `${child.tagName}.${child.className}:${child.textContent}`)).toEqual(['SPAN.hw-stat-label:Requests', 'STRONG.hw-stat-value:1284', 'P.hw-stat-description:This month', 'SPAN.hw-stat-trend:+12%']);
  expect(root.querySelector('dl')).toBeNull();
});

it('[RICH-01][content-display-14] a rich value and trend sit inside strong.hw-stat-value and span.hw-stat-trend; the slot wins over the prop', () => {
  const host = mount(() => h(Stat, { label: 'Fee', value: 'ignored' }, { value: riyal, trend: () => [h('span', { class: 'hw-icon', 'data-icon': 'arrow-up-01', 'aria-hidden': 'true' }), '5%'] }));
  const value = host.querySelector('strong.hw-stat-value')!;
  expect(value.innerHTML).toBe('<bdi><span class="hw-riyal" aria-hidden="true"></span>120 <span class="hw-sr-only">riyals</span></bdi>');
  const trend = host.querySelector('span.hw-stat-trend')!;
  expect(trend.querySelector('.hw-icon')).not.toBeNull(); expect(trend.textContent).toBe('5%');
});

it('[STAT-02][content-display-14] trendTone writes data-tone on the trend; tone on the root; variant plain', () => {
  const host = mount(() => h(Stat, { label: 'A', value: 1, trend: 'up', trendTone: 'success', tone: 'danger', variant: 'plain' }));
  const root = host.querySelector('.hw-stat')!;
  expect([root.getAttribute('data-tone'), root.getAttribute('data-variant')]).toEqual(['danger', 'plain']);
  expect(root.querySelector('.hw-stat-trend')!.getAttribute('data-tone')).toBe('success');
  app!.unmount(); app = undefined;
  const bare = mount(() => h(Stat, { label: 'B' }));
  expect(bare.querySelector('.hw-stat')!.hasAttribute('data-tone')).toBe(false);
  expect(bare.querySelector('.hw-stat-value')!.textContent).toBe('');
  expect(bare.querySelector('.hw-stat-trend')).toBeNull();
});

it('[RICH-04][content-display-14] the server render of a rich value equals the first client render', async () => {
  const render = () => h(Stat, { label: 'Fee' }, { value: riyal });
  const html = await renderToString(createSSRApp(defineComponent(() => render)));
  const host = document.createElement('div'); host.innerHTML = html; document.body.append(host); const server = host.innerHTML;
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  app = createSSRApp(defineComponent(() => render)); app.mount(host); await nextTick();
  expect(host.innerHTML).toBe(server);
  expect([...warn.mock.calls, ...errors.mock.calls].map(call => String(call[0])).filter(message => /hydration/i.test(message))).toEqual([]);
  errors.mockRestore();
});

const timeline: TimelineItem[] = [
  { id: 'submitted', title: 'Submitted', description: 'Request received', dateTime: '2026-10-27', dateLabel: '27 October 2026', status: 'complete' },
  { id: 'review', title: 'In review', status: 'current' },
  { id: 'decision', title: 'Decision', status: 'upcoming' },
];

it('[TIMELINE-01][content-display-16] every li has class hw-timeline-item; children are h3, time, p in that order', () => {
  const host = mount(() => h(Timeline, { label: 'Progress', items: timeline }));
  const items = [...host.querySelectorAll('ol.hw-timeline > li')];
  expect(items.every(item => item.classList.contains('hw-timeline-item'))).toBe(true);
  expect([...items[0]!.children].map(child => child.tagName)).toEqual(['H3', 'TIME', 'P']);
});

it('[SHAPE-01][content-display-16] the shared fixture renders text, data-state, aria-current and datetime', () => {
  const host = mount(() => h(Timeline, { label: 'Progress', items: timeline }));
  const items = [...host.querySelectorAll('li')];
  expect(items.map(item => item.getAttribute('data-state'))).toEqual(['complete', 'current', 'upcoming']);
  expect(items.map(item => item.getAttribute('aria-current'))).toEqual([null, 'step', null]);
  expect(items.map(item => item.querySelector('h3')!.textContent)).toEqual(['Submitted', 'In review', 'Decision']);
  const time = items[0]!.querySelector('time')!;
  expect([time.getAttribute('datetime'), time.textContent]).toEqual(['2026-10-27', '27 October 2026']);
});

it('[TIMELINE-02][content-display-16] dateTime without dateLabel renders no time element and no raw date', () => {
  const host = mount(() => h(Timeline, { label: 'Progress', items: [{ id: 'a', title: 'A', dateTime: '2026-10-27' }] }));
  expect(host.querySelector('time')).toBeNull();
  expect(host.textContent).not.toContain('2026');
});

it('[SHAPE-03][content-display-16] type tests: status active and the Vue date field are not accepted', () => {
  // @ts-expect-error status 'active' is not a timeline status
  const active: TimelineItem = { id: 'a', title: 'A', status: 'active' };
  // @ts-expect-error date was renamed dateTime
  const dated: TimelineItem = { id: 'b', title: 'B', date: '2026-01-01' };
  expectTypeOf<TimelineItem['dateTime']>().toEqualTypeOf<string | undefined>();
  expect([active.id, dated.id]).toEqual(['a', 'b']);
});

it('[LINK-01][actions-7] native attributes land on a.hw-link; variant, current and external with the authored rel kept', () => {
  const host = mount(() => h('div', [
    h(Link, { href: '/a', class: 'mine', 'aria-label': 'Annual report', hreflang: 'ar', download: '', variant: 'subtle', 'aria-current': 'page' }, () => 'A'),
    h(Link, { href: 'https://example.org', external: true, rel: 'author' }, () => 'B'),
    h(Link, { href: 'https://example.org', external: true }, () => 'C'),
  ]));
  const [first, second, third] = [...host.querySelectorAll('a.hw-link')];
  expect(first!.classList.contains('mine')).toBe(true);
  expect([first!.getAttribute('aria-label'), first!.getAttribute('hreflang'), first!.hasAttribute('download'), first!.getAttribute('data-variant'), first!.getAttribute('aria-current')]).toEqual(['Annual report', 'ar', true, 'subtle', 'page']);
  expect([second!.getAttribute('target'), second!.getAttribute('rel')]).toEqual(['_blank', 'author noopener noreferrer']);
  expect(third!.getAttribute('rel')).toBe('noopener noreferrer');
});

it('[LINK-02][actions-7] disabled: no href, role=link, aria-disabled, tabindex -1, click cancelled; enabling restores the href', async () => {
  const click = vi.fn(); const disabled = ref(true);
  const host = mount(() => h(Link, { href: '/a', disabled: disabled.value, onClick: click }, () => 'A'));
  const link = host.querySelector('a')!;
  expect([link.hasAttribute('href'), link.getAttribute('role'), link.getAttribute('aria-disabled'), link.getAttribute('tabindex')]).toEqual([false, 'link', 'true', '-1']);
  const event = new MouseEvent('click', { bubbles: true, cancelable: true });
  link.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(true); expect(click).not.toHaveBeenCalled();
  disabled.value = false; await nextTick();
  expect([link.getAttribute('href'), link.hasAttribute('role'), link.hasAttribute('aria-disabled'), link.hasAttribute('tabindex')]).toEqual(['/a', false, false, false]);
  expect(warnings()).toEqual([]);
});
