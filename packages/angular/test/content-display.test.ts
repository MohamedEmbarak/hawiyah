import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { attributesOf, contentOf, markup, page } from './fixtures/page';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); });

// The Angular side of tests/content-display-parity.test.ts and tests/avatar-parity.test.ts: the same case ids.
describe('Badge and AvatarGroup', () => {
  it('[BADGE-01][feedback-status-14] hw-badge is the badge: tone always, variant only when given, the text as its content', () => {
    const { root } = page(`<div class="hw-badges"><hw-badge>Draft</hw-badge><hw-badge [tone]="'success'" [variant]="'outline'">Approved</hw-badge><hw-badge [tone]="'danger'" [variant]="'dot'">Rejected</hw-badge></div>`);
    expect(markup(root.querySelector('.hw-badges')!)).toBe('<div class="hw-badges"><hw-badge class="hw-badge" data-tone="neutral">Draft</hw-badge><hw-badge class="hw-badge" data-tone="success" data-variant="outline">Approved</hw-badge><hw-badge class="hw-badge" data-tone="danger" data-variant="dot">Rejected</hw-badge></div>');
  });

  it('[SHAPE-01][content-display-7] each member of an avatar group takes the full avatar shape', () => {
    const items = [{ name: 'Rana Cole', initials: 'RC', size: '64', variant: 'square' }, { name: 'Sami' }];
    const { root } = page(`<hw-avatar-group label="Team" [getOverflowLabel]="overflow" [items]="items" />`, { items, overflow: (count: number) => `${count} more` });
    const group = root.querySelector('.hw-avatar-group')!;
    expect(group.localName).toBe('hw-avatar-group'); expect(group.getAttribute('role')).toBe('group'); expect(group.getAttribute('aria-label')).toBe('Team');
    const [first, second] = contentOf(group) as Element[];
    expect(attributesOf(first!)).toEqual({ 'aria-label': 'Rana Cole', class: 'hw-avatar', 'data-size': '64', 'data-variant': 'square', role: 'img' }); expect(first!.textContent).toBe('RC');
    expect(attributesOf(second!)).toEqual({ 'aria-label': 'Sami', class: 'hw-avatar', role: 'img' }); expect(second!.textContent).toBe('S');
  });

  it('[SHAPE-01] the avatars beyond max are counted in a marker named by getOverflowLabel', () => {
    const { root } = page(`<hw-avatar-group label="Team" [max]="2" [getOverflowLabel]="overflow" [items]="[{name: 'Sara Ali'}, {name: 'Omar Hassan'}, {name: 'Lina Saleh'}, {name: 'Nora'}]" />`, { overflow: (count: number) => `${count} more` });
    const members = contentOf(root.querySelector('.hw-avatar-group')!) as Element[];
    expect(members.map(member => member.localName)).toEqual(['hw-avatar', 'hw-avatar', 'span']); expect(attributesOf(members[2]!)).toEqual({ 'aria-label': '2 more', class: 'hw-avatar', role: 'img' }); expect(members[2]!.textContent).toBe('+2');
  });
});

describe('DescriptionList', () => {
  it('[DESCRIPTION-LIST-01][content-display-11] without variant the dl has no data-variant; each of the three values is written', () => {
    const { root } = page(`<hw-description-list [items]="items" />@for (variant of variants; track variant) {<hw-description-list [variant]="variant" [items]="items" />}`, { items: [{ term: 'Fee', description: 'No fee' }], variants: ['stacked', 'horizontal', 'compact'] });
    const lists = [...root.querySelectorAll('dl.hw-description-list')];
    expect(lists.map(list => list.getAttribute('data-variant'))).toEqual([null, 'stacked', 'horizontal', 'compact']);
    expect(markup(lists[0]!)).toBe('<dl class="hw-description-list"><div><dt>Fee</dt><dd>No fee</dd></div></dl>');
  });
});

describe('Stat', () => {
  it('[STAT-01][content-display-13] label, value, description and trend given as strings render span, strong, p and span in that order; no dl', () => {
    const { root } = page(`<hw-stat [label]="'Requests'" [value]="1284" [description]="'This month'" [trend]="'12%'" />`);
    const stat = root.querySelector('.hw-stat')!;
    expect(stat.localName).toBe('hw-stat'); expect(attributesOf(stat)).toEqual({ class: 'hw-stat' }); expect(stat.querySelector('dl, dt, dd')).toBeNull();
    expect(contentOf(stat).map(node => markup(node as Element))).toEqual(['<span class="hw-stat-label">Requests</span>', '<strong class="hw-stat-value">1284</strong>', '<p class="hw-stat-description">This month</p>', '<span class="hw-stat-trend">12%</span>']);
  });

  it('[RICH-01][content-display-14] a rich value and a rich trend are inside strong.hw-stat-value and span.hw-stat-trend; other content follows the trend', () => {
    const { root } = page(`<hw-stat label="Fee"><p>Updated today</p><bdi hwStatValue><span class="hw-riyal" aria-hidden="true"></span>120 <span class="hw-sr-only">riyals</span></bdi><span hwStatTrend><span class="hw-icon" data-icon="arrow-up-02" aria-hidden="true"></span>12%</span></hw-stat>`);
    const stat = root.querySelector('.hw-stat')!;
    expect(contentOf(stat).map(node => (node as Element).localName)).toEqual(['span', 'strong', 'span', 'p']);
    const value = stat.querySelector('strong.hw-stat-value')!; expect(contentOf(value)).toHaveLength(1); expect(value.firstElementChild!.localName).toBe('bdi'); expect(value.querySelector('.hw-riyal')).not.toBeNull(); expect(value.querySelector('.hw-sr-only')!.textContent).toBe('riyals');
    const trend = stat.querySelector('span.hw-stat-trend')!; expect(trend.querySelector('.hw-icon')!.getAttribute('data-icon')).toBe('arrow-up-02'); expect(trend.textContent).toBe('12%');
    expect(stat.lastElementChild!.textContent).toBe('Updated today');
  });

  it('[STAT-02] trendTone writes data-tone on the trend element, tone and variant on the root', () => {
    const { root } = page(`<hw-stat [label]="'Requests'" [value]="3" [trend]="'Up'" [trendTone]="'success'" [tone]="'danger'" [variant]="'plain'" />`);
    expect(attributesOf(root.querySelector('.hw-stat')!)).toEqual({ class: 'hw-stat', 'data-tone': 'danger', 'data-variant': 'plain' }); expect(attributesOf(root.querySelector('.hw-stat-trend')!)).toEqual({ class: 'hw-stat-trend', 'data-tone': 'success' });
  });
});

describe('Timeline', () => {
  const items = [{ id: 'received', title: 'Received', description: 'We have your request.', dateTime: '2026-10-27', dateLabel: '27 October 2026', status: 'complete' }, { id: 'review', title: 'In review', status: 'current' }, { id: 'decision', title: 'Decision', status: 'upcoming' }];

  it('[TIMELINE-01][content-display-16] every li has class hw-timeline-item; its children are h3, time, p in that order', () => {
    const { root } = page(`<hw-timeline label="Request history" [items]="items" />`, { items });
    const entries = [...root.querySelectorAll('ol.hw-timeline > li')];
    expect(entries.map(entry => entry.className)).toEqual(['hw-timeline-item', 'hw-timeline-item', 'hw-timeline-item']);
    expect(contentOf(entries[0]!).map(node => (node as Element).localName)).toEqual(['h3', 'time', 'p']); expect(contentOf(entries[1]!).map(node => (node as Element).localName)).toEqual(['h3']);
  });

  it('[SHAPE-01] one fixture passed unchanged renders the text, the data-state values, aria-current on the current item and datetime', () => {
    const { root } = page(`<hw-timeline label="Request history" [items]="items" />`, { items });
    expect(markup(root.querySelector('ol')!)).toBe('<ol aria-label="Request history" class="hw-timeline"><li class="hw-timeline-item" data-state="complete"><h3>Received</h3><time datetime="2026-10-27">27 October 2026</time><p>We have your request.</p></li><li aria-current="step" class="hw-timeline-item" data-state="current"><h3>In review</h3></li><li class="hw-timeline-item" data-state="upcoming"><h3>Decision</h3></li></ol>');
  });

  it('[TIMELINE-02] a dateTime without dateLabel renders no time element and no raw date; a dateLabel alone renders a time without datetime', () => {
    const { root } = page(`<hw-timeline label="History" [items]="[{id: 'a', title: 'Sent', dateTime: '2026-10-27'}, {id: 'b', title: 'Read', dateLabel: 'Yesterday'}]" />`);
    const [machine, visible] = [...root.querySelectorAll('li')];
    expect(machine!.querySelector('time')).toBeNull(); expect(machine!.textContent).toBe('Sent'); expect(machine!.hasAttribute('data-state')).toBe(false);
    expect(visible!.querySelector('time')!.hasAttribute('datetime')).toBe(false); expect(visible!.querySelector('time')!.textContent).toBe('Yesterday');
  });

  it('[SHAPE-01] items are keyed by id: reordering moves the rendered elements', () => {
    const { root, update } = page(`<hw-timeline label="History" [items]="items" />`, { items });
    const first = root.querySelector('li')!; update({ items: [items[1]!, items[0]!, items[2]!] });
    expect([...root.querySelectorAll('li')].indexOf(first)).toBe(1);
  });
});
