import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, useState } from 'react';
import type { ReactNode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import { resetTextWarnings } from '@hawiyah/core';
import type { FeedbackValue } from '@hawiyah/core';
import { Alert, AvatarGroup, Badge, Button, ButtonGroup, Chip, CookieConsent, DescriptionList, EmptyState, Feedback, Link, Meter, NotificationList, Progress, Skeleton, Spinner, Stat, Timeline, ToastRegion } from './src/index.js';
import type { NotificationItem, TimelineItem } from './src/index.js';

// Cross-adapter case ids of the feedback, content and service-pattern family (milestone 3).
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let container: HTMLDivElement; let root: Root; let warn: ReturnType<typeof vi.spyOn>;
const warnings = () => (warn.mock.calls as unknown[][]).map(call => String(call[0])).filter(message => message.startsWith('Hawiyah:'));
const untyped = (component: unknown) => component as (props: Record<string, unknown>) => ReactNode;
async function render(node: ReactNode) { await act(async () => root.render(node)); }
async function click(element: Element) { await act(async () => (element as HTMLElement).click()); }
const $ = <T extends Element = HTMLElement>(selector: string) => container.querySelector<T>(selector)!;
const $$ = <T extends Element = HTMLElement>(selector: string) => Array.from(container.querySelectorAll<T>(selector));
async function hydrates(node: ReactNode) {
  const html = renderToString(node);
  await act(async () => root.unmount()); const errors = vi.fn(); const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  container.innerHTML = html; await act(async () => { root = hydrateRoot(container, node, { onRecoverableError: errors }); });
  expect(errors).not.toHaveBeenCalled(); expect(error).not.toHaveBeenCalled(); error.mockRestore();
  return html;
}
const feedbackTexts = { label: 'Was this helpful?', yesLabel: 'Yes', noLabel: 'No', commentLabel: 'Tell us more', submitLabel: 'Send', successMessage: 'Thank you' };
const consentTexts = { title: 'Optional cookies', description: 'Choose a preference', acceptLabel: 'Accept', rejectLabel: 'Reject' };
const listTexts = { label: 'Notifications', emptyMessage: 'No notifications', unreadLabel: 'Unread' };

beforeEach(() => { resetTextWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined); container = document.createElement('div'); document.body.append(container); root = createRoot(container); });
afterEach(async () => { await act(async () => root.unmount()); container.remove(); warn.mockRestore(); });

describe('Alert', () => {
  it('[ALERT-01][feedback-status-1] tone=danger without role renders role=alert; every other tone renders role=status', async () => {
    await render(<>{(['danger', 'neutral', 'info', 'success', 'warning'] as const).map(tone => <Alert key={tone} tone={tone}>{tone}</Alert>)}<Alert>default</Alert></>);
    expect($$('.hw-alert').map(alert => alert.getAttribute('role'))).toEqual(['alert', 'status', 'status', 'status', 'status', 'status']);
    expect($$('.hw-alert').some(alert => alert.hasAttribute('data-variant'))).toBe(false);
  });
  it('[ALERT-02] an explicit role="status" on a danger alert is kept', async () => {
    await render(<Alert tone="danger" role="status">Saved with problems</Alert>);
    expect($('.hw-alert').getAttribute('role')).toBe('status');
  });
  it('[TEXT-03][R00] no button without a dismiss handler; one button with it, with the documented classes and icon', async () => {
    await render(<><Alert id="plain">Saved</Alert><Alert id="closable" onDismiss={() => undefined} closeLabel="Close">Saved</Alert></>);
    expect($('#plain button')).toBeNull();
    const buttons = $$('#closable button'); expect(buttons).toHaveLength(1);
    const button = buttons[0]!;
    expect(button.previousElementSibling!.className).toBe('hw-alert-content');
    expect(button.className).toBe('hw-button hw-alert-dismiss'); expect(button.getAttribute('type')).toBe('button');
    expect(button.dataset.variant).toBe('ghost'); expect(button.dataset.size).toBe('md'); expect(button.getAttribute('aria-label')).toBe('Close');
    expect(button.innerHTML).toBe('<span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span>');
  });
  it('[ALERT-03][feedback-status-2] each activation of the native button notifies once without payload; the alert stays', async () => {
    const dismiss = vi.fn(); await render(<Alert onDismiss={dismiss} closeLabel="Close">Saved</Alert>);
    const button = $<HTMLButtonElement>('.hw-alert-dismiss'); expect(button.tagName).toBe('BUTTON');
    await click(button); await click(button);
    expect(dismiss).toHaveBeenCalledTimes(2); expect(dismiss.mock.calls[0]).toEqual([]);
    expect($('.hw-alert')).not.toBeNull();
  });
  it('[TEXT-01] handler bound and closeLabel missing: button without aria-label, one warning; [TEXT-02] not reported without a handler', async () => {
    const Untyped = untyped(Alert);
    await render(<Alert>Saved</Alert>); expect(warnings()).toEqual([]);
    await render(<><Untyped onDismiss={() => undefined}>Saved</Untyped><Untyped onDismiss={() => undefined}>Again</Untyped></>);
    expect($$('.hw-alert-dismiss').every(button => !button.hasAttribute('aria-label'))).toBe(true);
    expect(warnings()).toEqual([expect.stringMatching(/^Hawiyah: Alert requires "closeLabel" when onDismiss is given/)]);
  });
  it('[SSR-01] server HTML of a danger and an info alert equals the first client render', async () => {
    const html = await hydrates(<><Alert tone="danger" title="Error">Failed</Alert><Alert onDismiss={() => undefined} closeLabel="Close">Saved</Alert></>);
    expect(html).toContain('role="alert"'); expect(html).toContain('hw-alert-dismiss');
  });
});

describe('Progress, Meter, Skeleton, Spinner, EmptyState', () => {
  it('[PROGRESS-01][feedback-status-7] one progress named by aria-label with raw values; no value means indeterminate', async () => {
    await render(<><Progress label="Upload" value={150} max={100} /><Progress label="Waiting" /></>);
    expect(container.children).toHaveLength(2); expect($('label')).toBeNull(); expect(container.textContent).toBe('');
    const [over, waiting] = $$<HTMLProgressElement>('progress.hw-progress');
    expect(over!.getAttribute('aria-label')).toBe('Upload'); expect(over!.getAttribute('value')).toBe('150'); expect(over!.getAttribute('max')).toBe('100');
    expect(waiting!.hasAttribute('value')).toBe(false); expect(waiting!.hasAttribute('data-size')).toBe(false);
  });
  it('[PROGRESS-02] size writes data-size on the progress element', async () => {
    await render(<><Progress label="A" size="sm" /><Progress label="B" size="lg" /></>);
    expect($$('progress').map(element => element.dataset.size)).toEqual(['sm', 'lg']);
  });
  it('[METER-01][feedback-status-8] label and value only: min 0, max 100, no regions, no label and no text', async () => {
    await render(<Meter label="Storage" value={10} />);
    const meter = $('meter.hw-meter');
    expect([meter.getAttribute('min'), meter.getAttribute('max'), meter.getAttribute('value')]).toEqual(['0', '100', '10']);
    expect(['low', 'high', 'optimum'].some(name => meter.hasAttribute(name))).toBe(false);
    expect($('label')).toBeNull(); expect(container.textContent).toBe(''); expect(meter.getAttribute('aria-label')).toBe('Storage');
  });
  it('[METER-02] low, high and optimum are written when given', async () => {
    await render(<Meter label="Storage" value={10} low={25} high={75} optimum={100} />);
    expect(['low', 'high', 'optimum'].map(name => $('meter').getAttribute(name))).toEqual(['25', '75', '100']);
  });
  it('[NAME-02][NAME-03][NAME-04] Progress, Meter, Spinner and ButtonGroup take aria-label or aria-labelledby, else warn once', async () => {
    const [P, M, S, G] = [untyped(Progress), untyped(Meter), untyped(Spinner), untyped(ButtonGroup)];
    await render(<><P aria-label="Upload" /><M aria-label="Storage" /><S aria-label="Loading" /><G aria-label="Actions" /></>);
    expect(warnings()).toEqual([]); expect($$('[aria-label]').map(element => element.getAttribute('aria-label'))).toEqual(['Upload', 'Storage', 'Loading', 'Actions']);
    expect($('.hw-spinner .hw-sr-only')).toBeNull();
    await render(<><span id="name">Name</span><P aria-labelledby="name" /><M aria-labelledby="name" /><S aria-labelledby="name" /><G aria-labelledby="name" /></>);
    expect(warnings()).toEqual([]); expect($$('[aria-label]')).toHaveLength(0);
    await render(<><P /><M /><S /><G /></>);
    expect($$('[aria-label]')).toHaveLength(0); expect($('.hw-spinner .hw-sr-only')).toBeNull();
    expect(warnings().map(message => message.match(/^Hawiyah: (\w+) requires "(\w+)"/)!.slice(1).join('.')).sort()).toEqual(['ButtonGroup.label', 'Meter.label', 'Progress.label', 'Spinner.label']);
  });
  it('[SKELETON-01][feedback-status-9] variant writes data-variant on the aria-hidden .hw-skeleton', async () => {
    await render(<><Skeleton variant="circle" /><Skeleton variant="text" /><Skeleton /></>);
    expect($$('.hw-skeleton').map(element => [element.tagName, element.getAttribute('aria-hidden'), element.dataset.variant])).toEqual([['SPAN', 'true', 'circle'], ['SPAN', 'true', 'text'], ['SPAN', 'true', undefined]]);
  });
  it('[SPINNER-01][feedback-status-10] .hw-spinner has role=status and contains only span.hw-sr-only with the label', async () => {
    await render(<Spinner label="Loading" />);
    const spinner = $('.hw-spinner');
    expect(container.firstElementChild).toBe(spinner); expect(spinner.getAttribute('role')).toBe('status');
    expect(spinner.innerHTML).toBe('<span class="hw-sr-only">Loading</span>');
  });
  it('[SPINNER-02] size writes data-size on the spinner', async () => {
    await render(<><Spinner label="A" size="sm" /><Spinner label="B" size="lg" /></>);
    expect($$('.hw-spinner').map(element => element.dataset.size)).toEqual(['sm', 'lg']);
  });
  it('[SPINNER-03] aria-hidden=true needs no name and reports none', async () => {
    await render(<Spinner aria-hidden="true" />); expect(warnings()).toEqual([]); expect($('.hw-spinner .hw-sr-only')).toBeNull();
  });
  it('[RICH-01][feedback-status-11] the EmptyState icon is in span.hw-empty-icon before the h3 and the action is the last child', async () => {
    await render(<EmptyState title="Nothing yet" icon={<svg data-testid="icon" />} action={<Button>Start</Button>} description="Add an item" />);
    const root = $('.hw-empty'); const icon = root.firstElementChild as HTMLElement;
    expect(icon.className).toBe('hw-empty-icon'); expect(icon.getAttribute('aria-hidden')).toBe('true'); expect(icon.querySelector('svg')).not.toBeNull();
    expect(icon.nextElementSibling!.tagName).toBe('H3'); expect(root.lastElementChild!.tagName).toBe('BUTTON');
  });
  it('[RICH-04] EmptyState server render with and without icon equals the first client render', async () => {
    await hydrates(<><EmptyState title="A" icon={<span>i</span>} /><EmptyState title="B" /></>);
  });
});

describe('Chip', () => {
  function Chips({ onRemove }: { onRemove?: (value: string) => void }) {
    const [chips, setChips] = useState(['one', 'two', 'three']);
    return <div className="hw-inline">{chips.map(value => <Chip key={value} removeLabel={`Remove ${value}`} onRemove={() => { onRemove?.(value); setChips(current => current.filter(item => item !== value)); }}>{value}</Chip>)}<Chip>plain</Chip></div>;
  }
  it('[CHIP-01][feedback-status-12] the remove control is a plain button with the icon; variant and size are data attributes', async () => {
    await render(<><Chip id="removable" variant="outline" size="lg" removeLabel="Remove" onRemove={() => undefined}>A</Chip><Chip id="plain">B</Chip></>);
    const button = $<HTMLButtonElement>('#removable > button');
    expect(button.hasAttribute('class')).toBe(false); expect(button.type).toBe('button'); expect(button.getAttribute('aria-label')).toBe('Remove');
    expect(button.innerHTML).toBe('<span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span>');
    expect([$('#removable').dataset.variant, $('#removable').dataset.size, $('#removable').dataset.tone]).toEqual(['outline', 'lg', 'neutral']);
    expect($('#plain').hasAttribute('data-variant')).toBe(false);
  });
  it('[TEXT-03] no button without a remove handler; [TEXT-01] handler without removeLabel: no aria-label, one warning', async () => {
    await render(<Chip>A</Chip>); expect($('button')).toBeNull(); expect(warnings()).toEqual([]);
    await render(<>{[1, 2].map(key => { const C = untyped(Chip); return <C key={key} onRemove={() => undefined}>A</C>; })}</>);
    expect($$('button')).toHaveLength(2); expect($$('button[aria-label]')).toHaveLength(0);
    expect(warnings()).toEqual([expect.stringMatching(/^Hawiyah: Chip requires "removeLabel" when onRemove is given/)]);
  });
  it('[FOCUS-04] removing a focused chip moves focus to the next chip, else the previous one, else leaves it to the application', async () => {
    const removed = vi.fn(); await render(<Chips onRemove={removed} />);
    const button = (value: string) => $$<HTMLButtonElement>('.hw-chip').find(chip => chip.textContent === value)?.querySelector('button');
    button('two')!.focus(); await click(button('two')!);
    expect(removed).toHaveBeenCalledWith('two'); expect(document.activeElement).toBe(button('three'));
    await click(button('three')!); expect(document.activeElement).toBe(button('one'));
    await click(button('one')!); expect($$('.hw-chip')).toHaveLength(1);
    expect(document.activeElement).not.toBe($('.hw-chip'));
    expect($('.hw-chip').contains(document.activeElement)).toBe(false);
  });
  it('[SSR-03] no listener and no timer during the server render of a removable chip', () => {
    const timers = [vi.spyOn(globalThis, 'setTimeout'), vi.spyOn(globalThis, 'queueMicrotask')];
    const listen = vi.spyOn(EventTarget.prototype, 'addEventListener');
    const html = renderToString(<Chip removeLabel="Remove" onRemove={() => undefined}>A</Chip>);
    expect(html).toContain('aria-label="Remove"');
    for (const spy of [...timers, listen]) { expect(spy).not.toHaveBeenCalled(); spy.mockRestore(); }
  });
});

describe('Content display', () => {
  it('[BADGE-01] Badge writes class, data-tone and data-variant on one span', async () => {
    await render(<div className="hw-badges"><Badge tone="info" variant="outline">A</Badge><Badge>B</Badge></div>);
    expect($('.hw-badges').innerHTML).toBe('<span class="hw-badge" data-tone="info" data-variant="outline">A</span><span class="hw-badge" data-tone="neutral">B</span>');
  });
  it('[SHAPE-01][content-display-7] AvatarGroup members take the full avatar shape', async () => {
    await render(<AvatarGroup label="Team" getOverflowLabel={count => `${count} more`} items={[{ name: 'Rana Cole', initials: 'RC', size: '64', variant: 'square' }, { name: 'Sami' }]} />);
    const [first, second] = $$('.hw-avatar-group > .hw-avatar');
    expect([first!.textContent, first!.dataset.size, first!.dataset.variant]).toEqual(['RC', '64', 'square']);
    expect([second!.textContent, second!.hasAttribute('data-size'), second!.hasAttribute('data-variant')]).toEqual(['S', false, false]);
  });
  it('[DESCRIPTION-LIST-01][content-display-11] without variant no data-variant; each value is written', async () => {
    const items = [{ term: 'A', description: 'B' }];
    await render(<><DescriptionList items={items} />{(['stacked', 'horizontal', 'compact'] as const).map(variant => <DescriptionList key={variant} items={items} variant={variant} />)}</>);
    expect($$('dl.hw-description-list').map(list => list.getAttribute('data-variant'))).toEqual([null, 'stacked', 'horizontal', 'compact']);
  });
  it('[STAT-01][content-display-13] label, value, description and trend render in order without a dl', async () => {
    await render(<Stat label="Requests" value={1284} description="This month" trend="+12%" />);
    expect(Array.from($('.hw-stat').children).map(element => `${element.tagName.toLowerCase()}.${element.className}:${element.textContent}`)).toEqual(['span.hw-stat-label:Requests', 'strong.hw-stat-value:1284', 'p.hw-stat-description:This month', 'span.hw-stat-trend:+12%']);
    expect($('dl')).toBeNull();
  });
  const riyal = <bdi><span className="hw-riyal" aria-hidden="true"></span>120 <span className="hw-sr-only">riyals</span></bdi>;
  it('[RICH-01][content-display-14] rich value and trend are inside strong.hw-stat-value and span.hw-stat-trend', async () => {
    await render(<Stat label="Fee" value={riyal} trend={<><span className="hw-icon" data-icon="arrow-up-02" aria-hidden="true" />3%</>} />);
    expect($('strong.hw-stat-value > bdi > .hw-riyal')).not.toBeNull(); expect($('strong.hw-stat-value .hw-sr-only').textContent).toBe('riyals');
    expect($('span.hw-stat-trend > .hw-icon')).not.toBeNull();
  });
  it('[STAT-02] trendTone writes data-tone on the trend; tone on the root; variant plain', async () => {
    await render(<Stat label="A" value="1" trend="+1" trendTone="success" tone="danger" variant="plain" />);
    expect($('.hw-stat-trend').dataset.tone).toBe('success'); expect($('.hw-stat').dataset.tone).toBe('danger'); expect($('.hw-stat').dataset.variant).toBe('plain');
  });
  it('[RICH-04] Stat server render of a rich value equals the first client render', async () => {
    await hydrates(<Stat label="Fee" value={riyal} trend="+1" />);
  });
  const timeline: TimelineItem[] = [{ id: 'a', title: 'Submitted', description: 'Received', dateTime: '2026-10-27', dateLabel: '27 October 2026', status: 'complete' }, { id: 'b', title: 'Review', status: 'current' }, { id: 'c', title: 'Decision', status: 'upcoming' }];
  it('[TIMELINE-01][content-display-16] every li has class hw-timeline-item; children are h3, time, p', async () => {
    await render(<Timeline label="Progress" items={timeline} />);
    expect($$('.hw-timeline > li').every(item => item.className === 'hw-timeline-item')).toBe(true);
    expect(Array.from($('.hw-timeline-item').children).map(element => element.tagName)).toEqual(['H3', 'TIME', 'P']);
  });
  it('[SHAPE-01] the shared timeline fixture renders text, data-state, aria-current and datetime', async () => {
    await render(<Timeline label="Progress" items={timeline} />);
    const items = $$('.hw-timeline-item');
    expect(items.map(item => item.dataset.state)).toEqual(['complete', 'current', 'upcoming']);
    expect(items.map(item => item.getAttribute('aria-current'))).toEqual([null, 'step', null]);
    expect($('time').getAttribute('datetime')).toBe('2026-10-27'); expect($('time').textContent).toBe('27 October 2026');
    expect(items.map(item => item.querySelector('h3')!.textContent)).toEqual(['Submitted', 'Review', 'Decision']);
  });
  it('[TIMELINE-02] dateTime without dateLabel renders no time element and no raw date', async () => {
    await render(<Timeline label="Progress" items={[{ id: 'a', title: 'A', dateTime: '2026-10-27' }]} />);
    expect($('time')).toBeNull(); expect(container.textContent).not.toContain('2026');
  });
  it('[SHAPE-01][R20] a toast message renders title in strong and message in p with the shared dismiss name', async () => {
    await render(<ToastRegion label="Notifications" messages={[{ id: 'saved', title: 'Draft saved', message: 'You can return later.', tone: 'success' }]} onDismiss={() => undefined} getDismissLabel={message => `Dismiss ${message.title}`} />);
    expect($('.hw-toast-content > strong').textContent).toBe('Draft saved'); expect($('.hw-toast-content > p').textContent).toBe('You can return later.');
    expect($('[aria-label="Dismiss Draft saved"]')).not.toBeNull();
  });
});

describe('Button and Link', () => {
  it('[BUTTON-01][actions-6] a button without type does not submit its form; type="submit" submits', async () => {
    const submit = vi.fn((event: SubmitEvent) => event.preventDefault());
    await render(<form onSubmit={event => submit(event.nativeEvent as SubmitEvent)}><Button>Save draft</Button><Button type="submit">Send</Button></form>);
    const [draft, send] = $$<HTMLButtonElement>('button');
    expect(draft!.type).toBe('button'); await click(draft!); expect(submit).not.toHaveBeenCalled();
    await click(send!); expect(submit).toHaveBeenCalledTimes(1);
  });
  it('[BUTTON-02] loading disables the button and sets aria-busy; clearing loading removes both', async () => {
    const press = vi.fn(); const submit = vi.fn((event: Event) => event.preventDefault());
    await render(<form onSubmit={event => submit(event.nativeEvent)}><Button type="submit" loading onClick={press}>Send</Button></form>);
    const button = $<HTMLButtonElement>('button');
    expect(button.disabled).toBe(true); expect(button.getAttribute('aria-busy')).toBe('true');
    await click(button); expect(press).not.toHaveBeenCalled(); expect(submit).not.toHaveBeenCalled();
    await render(<form onSubmit={event => submit(event.nativeEvent)}><Button type="submit" onClick={press}>Send</Button></form>);
    expect(button.hasAttribute('disabled')).toBe(false); expect(button.hasAttribute('aria-busy')).toBe(false);
  });
  it('[LINK-01][actions-7] native attributes stay on a.hw-link; variant, aria-current and external are written', async () => {
    await render(<Link href="/guide" className="extra" aria-label="Guide" hrefLang="ar" download variant="neutral" aria-current="page" external rel="author">Guide</Link>);
    const link = $('a');
    expect(link.className).toBe('hw-link extra'); expect([link.getAttribute('aria-label'), link.getAttribute('hreflang'), link.hasAttribute('download')]).toEqual(['Guide', 'ar', true]);
    expect([link.dataset.variant, link.getAttribute('aria-current'), link.getAttribute('target'), link.getAttribute('rel')]).toEqual(['neutral', 'page', '_blank', 'author noopener noreferrer']);
  });
  it('[LINK-02] disabled: no href, role=link, aria-disabled, tabindex=-1, activation cancelled; enabling restores the href', async () => {
    const press = vi.fn(); await render(<Link href="/a" disabled onClick={press}>A</Link>);
    const link = $<HTMLAnchorElement>('a');
    expect([link.hasAttribute('href'), link.getAttribute('role'), link.getAttribute('aria-disabled'), link.getAttribute('tabindex')]).toEqual([false, 'link', 'true', '-1']);
    const event = new MouseEvent('click', { bubbles: true, cancelable: true }); await act(async () => { link.dispatchEvent(event); });
    expect(event.defaultPrevented).toBe(true); expect(press).not.toHaveBeenCalled();
    const aux = new MouseEvent('auxclick', { bubbles: true, cancelable: true }); await act(async () => { link.dispatchEvent(aux); }); expect(aux.defaultPrevented).toBe(true);
    await render(<Link href="/b" onClick={press}>A</Link>);
    expect([link.getAttribute('href'), link.hasAttribute('role'), link.hasAttribute('aria-disabled'), link.hasAttribute('tabindex')]).toEqual(['/b', false, false, false]);
  });
});

describe('NotificationList', () => {
  const fixture: NotificationItem[] = [{ id: 'a', title: 'Ready', href: '/x', description: 'D', dateTime: '2026-10-28T09:00:00+03:00', dateLabel: '28 October', read: false }, { id: 'b', title: 'Received', read: true }];
  it('[SHAPE-01][R14] the shared fixture renders text, data-state, one link and one time', async () => {
    await render(<NotificationList {...listTexts} items={fixture} />);
    expect($$('li').map(item => item.dataset.state)).toEqual(['unread', 'read']);
    expect($$('a.hw-link')).toHaveLength(1); expect($('time').getAttribute('datetime')).toBe('2026-10-28T09:00:00+03:00');
    expect($$('h3').map(heading => heading.textContent)).toEqual(['Ready', 'Received']);
  });
  it('[NOTIFICATION-01][content-display-22] the section is labelled by its visible h2; titles are h3; no li has a class', async () => {
    await render(<NotificationList {...listTexts} items={fixture} />);
    const section = $('section.hw-notification-list');
    expect(section.getAttribute('aria-labelledby')).toBe($('h2').id); expect(section.hasAttribute('aria-label')).toBe(false); expect($('h2').textContent).toBe('Notifications');
    expect($$('li').every(item => !item.hasAttribute('class'))).toBe(true); expect(section.hasAttribute('tabindex')).toBe(false);
  });
  it('[NOTIFICATION-02] no items: no ul, one p with emptyMessage and no role', async () => {
    await render(<NotificationList {...listTexts} items={[]} />);
    expect($('ul')).toBeNull(); expect($$('section > p').map(p => [p.textContent, p.getAttribute('role')])).toEqual([['No notifications', null]]);
  });
  it('[NOTIFICATION-05][content-display-23] an item with href renders exactly one a.hw-link inside the h3', async () => {
    await render(<NotificationList {...listTexts} items={fixture} />);
    expect($$('h3 > a.hw-link')).toHaveLength(1); expect($('h3 > a').getAttribute('href')).toBe('/x');
  });
  it('[NOTIFICATION-06][R13] an unread item has one visible info badge with unreadLabel; a read item none', async () => {
    await render(<NotificationList {...listTexts} items={fixture} />);
    const [unread, read] = $$('li');
    expect(Array.from(unread!.querySelectorAll('.hw-badge')).map(badge => [badge.getAttribute('data-tone'), badge.textContent])).toEqual([['info', 'Unread']]);
    expect(unread!.querySelector('.hw-sr-only')).toBeNull(); expect(read!.querySelector('.hw-badge')).toBeNull();
    expect(unread!.querySelector('h3')!.nextElementSibling!.className).toBe('hw-badge');
  });
  it('[TEXT-03][content-display-21][R11][R12] buttons are rendered only with their handlers', async () => {
    await render(<NotificationList {...listTexts} items={fixture} />); expect($('button')).toBeNull();
    await render(<NotificationList {...listTexts} items={fixture} onRead={() => undefined} getMarkReadLabel={item => `Mark ${item.title} read`} />);
    expect($$('button').map(button => [button.closest('li')!.dataset.state, button.textContent, button.hasAttribute('data-hw-mark-read')])).toEqual([['unread', 'Mark Ready read', true]]);
    expect($('section').getAttribute('tabindex')).toBe('-1');
    await render(<NotificationList {...listTexts} items={fixture} onDismiss={() => undefined} getDismissLabel={item => `Dismiss ${item.title}`} />);
    const dismiss = $$('button[data-hw-dismiss]');
    expect(dismiss.map(button => button.getAttribute('aria-label'))).toEqual(['Dismiss Ready', 'Dismiss Received']);
    expect(dismiss[0]!.className).toBe('hw-button'); expect(dismiss[0]!.dataset.variant).toBe('ghost');
    expect(dismiss[0]!.innerHTML).toBe('<span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span>');
  });
  it('[NOTIFICATION-03] each activation notifies once with the item id; nothing changes until the application updates items', async () => {
    const read = vi.fn(); const dismiss = vi.fn();
    await render(<NotificationList {...listTexts} items={fixture} onRead={read} getMarkReadLabel={() => 'Mark read'} onDismiss={dismiss} getDismissLabel={() => 'Dismiss'} />);
    await click($('[data-hw-mark-read]')); await click($$('[data-hw-dismiss]')[1]!);
    expect(read.mock.calls).toEqual([['a']]); expect(dismiss.mock.calls).toEqual([['b']]); expect($$('li')).toHaveLength(2); expect($$('[data-hw-mark-read]')).toHaveLength(1);
  });
  it('[FOCUS-04] focus moves to the same control of the next item, then the previous one, then the section', async () => {
    const items: NotificationItem[] = [{ id: 'a', title: 'A' }, { id: 'b', title: 'B' }, { id: 'c', title: 'C' }];
    function List() {
      const [list, setList] = useState(items);
      return <NotificationList {...listTexts} items={list} getDismissLabel={item => `Dismiss ${item.title}`} onDismiss={id => setList(current => current.filter(item => item.id !== id))} getMarkReadLabel={item => `Read ${item.title}`} onRead={id => setList(current => current.map(item => item.id === id ? { ...item, read: true } : item))} />;
    }
    await render(<List />);
    const control = (name: string) => $<HTMLButtonElement>(`[aria-label="${name}"]`);
    const read = (title: string) => $$<HTMLButtonElement>('[data-hw-mark-read]').find(button => button.textContent === `Read ${title}`)!;
    read('A').focus(); await click(read('A')); expect(document.activeElement).toBe(read('B'));
    await click(read('B')); expect(document.activeElement).toBe(read('C'));
    await click(read('C')); expect(document.activeElement).toBe($('section'));
    control('Dismiss B').focus(); await click(control('Dismiss B')); expect(document.activeElement).toBe(control('Dismiss C'));
    await click(control('Dismiss C')); expect(document.activeElement).toBe(control('Dismiss A'));
    await click(control('Dismiss A')); expect(document.activeElement).toBe($('section'));
  });
  it('[TEXT-01] missing action texts: no mark-read button, a dismiss button without name, one warning each; [TEXT-02] not required without handlers', async () => {
    const List = untyped(NotificationList);
    await render(<NotificationList {...listTexts} items={fixture} />); expect(warnings()).toEqual([]);
    await render(<List {...listTexts} items={fixture} onRead={() => undefined} onDismiss={() => undefined} />);
    expect($('[data-hw-mark-read]')).toBeNull(); expect($$('[data-hw-dismiss]').every(button => !button.hasAttribute('aria-label'))).toBe(true);
    expect(warnings().map(message => message.match(/^Hawiyah: (\w+) requires "(\w+)"/)!.slice(1).join('.')).sort()).toEqual(['NotificationList.getDismissLabel', 'NotificationList.getMarkReadLabel']);
  });
  it('[TEXT-01][R13] unreadLabel missing with an unread item: no badge, one warning', async () => {
    const List = untyped(NotificationList);
    await render(<List label="Notifications" emptyMessage="None" items={fixture} />);
    expect($('.hw-badge')).toBeNull(); expect(warnings()).toEqual([expect.stringMatching(/^Hawiyah: NotificationList requires "unreadLabel"/)]);
  });
  it('[NAME-02][NAME-03][NAME-04] aria-label or aria-labelledby replaces the heading; neither warns once', async () => {
    const List = untyped(NotificationList); const rest = { emptyMessage: 'None', unreadLabel: 'Unread', items: [] };
    await render(<List {...rest} aria-label="Inbox" />);
    expect($('h2')).toBeNull(); expect($('section').getAttribute('aria-label')).toBe('Inbox'); expect($('section').hasAttribute('aria-labelledby')).toBe(false);
    await render(<><h2 id="inbox">Inbox</h2><List {...rest} aria-labelledby="inbox" /></>);
    expect($('section').getAttribute('aria-labelledby')).toBe('inbox'); expect($('section h2')).toBeNull(); expect(warnings()).toEqual([]);
    await render(<List {...rest} />);
    expect($('h2')).toBeNull(); expect($('section').hasAttribute('aria-labelledby')).toBe(false);
    expect(warnings()).toEqual([expect.stringMatching(/^Hawiyah: NotificationList requires "label"/)]);
  });
});

describe('Feedback', () => {
  it('[FEEDBACK-01][service-patterns-13] first render: a group labelled by the question, two unpressed choices, an empty status', async () => {
    await render(<Feedback {...feedbackTexts} />);
    const root = $('div.hw-feedback');
    expect(root.getAttribute('role')).toBe('group'); expect(root.getAttribute('aria-labelledby')).toBe($('.hw-feedback > p').id); expect($('.hw-feedback > p').textContent).toBe('Was this helpful?');
    const choices = $$('.hw-feedback-actions > button.hw-button[data-variant=secondary]');
    expect(choices.map(button => [button.getAttribute('aria-pressed'), button.textContent])).toEqual([['false', 'Yes'], ['false', 'No']]);
    expect(choices.map(button => button.querySelector('.hw-icon')!.getAttribute('data-icon'))).toEqual(['thumbs-up', 'thumbs-down']);
    expect($('textarea')).toBeNull(); expect($('p[role=status]').textContent).toBe('');
    expect($('form, fieldset, legend, input[type=radio], h2')).toBeNull(); expect($('.hw-feedback-actions').hasAttribute('role')).toBe(false);
  });
  it('[FEEDBACK-02][service-patterns-12][R05] choosing yes presses it, notifies once and shows the comment step', async () => {
    const change = vi.fn(); await render(<Feedback {...feedbackTexts} onValueChange={change} />);
    const [yes] = $$('.hw-feedback-actions > button'); await click(yes!);
    expect(yes!.getAttribute('aria-pressed')).toBe('true'); expect(change.mock.calls).toEqual([[{ helpful: true, comment: '' }]]);
    const textarea = $<HTMLTextAreaElement>('.hw-feedback-comment textarea'); expect(container.querySelector(`label[for="${textarea.id}"]`)!.textContent).toBe('Tell us more');
    expect($('.hw-feedback-comment > button').textContent).toBe('Send'); expect($('p[role=status]').textContent).toBe('');
    await click(yes!); expect(change).toHaveBeenCalledTimes(1);
  });
  it('[FEEDBACK-03] submit reports the value and shows the success message; a later choice empties it', async () => {
    const change = vi.fn(); const feedback = vi.fn(); await render(<Feedback {...feedbackTexts} onValueChange={change} onFeedback={feedback} />);
    await click($$('.hw-feedback-actions > button')[0]!);
    const textarea = $<HTMLTextAreaElement>('textarea');
    await act(async () => { Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(textarea, 'Thanks'); textarea.dispatchEvent(new Event('input', { bubbles: true })); });
    await click($('.hw-feedback-comment > button'));
    expect(feedback.mock.calls).toEqual([[{ helpful: true, comment: 'Thanks' }]]); expect($('p[role=status]').textContent).toBe('Thank you');
    await click($$('.hw-feedback-actions > button')[1]!);
    expect($('p[role=status]').textContent).toBe(''); expect(change.mock.calls.at(-1)).toEqual([{ helpful: false, comment: 'Thanks' }]);
  });
  it('[STATE-02] a controlled value that is not updated keeps the DOM but still notifies; [STATE-03] changing it does not notify', async () => {
    const change = vi.fn(); const value: FeedbackValue = { helpful: null, comment: '' };
    await render(<Feedback {...feedbackTexts} value={value} onValueChange={change} />);
    await click($$('.hw-feedback-actions > button')[0]!);
    expect(change).toHaveBeenCalledTimes(1); expect($('[aria-pressed=true]')).toBeNull(); expect($('textarea')).toBeNull();
    await render(<Feedback {...feedbackTexts} value={{ helpful: false, comment: 'x' }} onValueChange={change} />);
    expect(change).toHaveBeenCalledTimes(1); expect($$('.hw-feedback-actions > button')[1]!.getAttribute('aria-pressed')).toBe('true'); expect($<HTMLTextAreaElement>('textarea').value).toBe('x');
  });
  it('[FEEDBACK-04] disabled disables every control and nothing notifies; focus stays on the pressed choice', async () => {
    const change = vi.fn(); const feedback = vi.fn();
    await render(<Feedback {...feedbackTexts} disabled defaultValue={{ helpful: true, comment: '' }} onValueChange={change} onFeedback={feedback} />);
    expect($$<HTMLButtonElement | HTMLTextAreaElement>('button, textarea').every(control => control.disabled)).toBe(true);
    for (const button of $$('button')) await click(button);
    expect(change).not.toHaveBeenCalled(); expect(feedback).not.toHaveBeenCalled();
    await render(<Feedback {...feedbackTexts} />);
    const yes = $$<HTMLButtonElement>('.hw-feedback-actions > button')[0]!; yes.focus(); await click(yes);
    expect(document.activeElement).toBe(yes);
    expect($$('button, textarea').map(control => control.tagName === 'TEXTAREA' ? 'textarea' : control.textContent)).toEqual(['Yes', 'No', 'textarea', 'Send']);
    expect($$('[tabindex]')).toHaveLength(0);
  });
  it('[TEXT-01] each missing text renders nothing and warns once; [NAME-02] aria-label alone needs no label', async () => {
    const Form = untyped(Feedback);
    for (const name of Object.keys(feedbackTexts)) {
      const props: Record<string, unknown> = { ...feedbackTexts, defaultValue: { helpful: true, comment: '' } }; delete props[name];
      await render(<Form {...props} />);
      expect(warnings(), name).toEqual([expect.stringMatching(new RegExp(`^Hawiyah: Feedback requires "${name}"`))]);
      warn.mockClear(); resetTextWarnings();
    }
    await render(<Form {...{ ...feedbackTexts, label: undefined }} aria-label="Rate this page" />);
    expect(warnings()).toEqual([]); expect($('.hw-feedback > p:not([role])')).toBeNull(); expect($('.hw-feedback').hasAttribute('aria-labelledby')).toBe(false);
  });
  it('[SSR-01] server HTML without a choice and with a value equals the first client render', async () => {
    const html = await hydrates(<><Feedback {...feedbackTexts} /><Feedback {...feedbackTexts} defaultValue={{ helpful: false, comment: 'x' }} /></>);
    expect(html.match(/<textarea/g)).toHaveLength(1);
  });
});

describe('CookieConsent', () => {
  it('[CONSENT-01][service-patterns-19] Accept, Reject, Preferences inside div.hw-button-group', async () => {
    await render(<CookieConsent {...consentTexts} policyHref="/cookies" policyLabel="Cookie policy" onPreferences={() => undefined} preferencesLabel="Preferences"><p id="extra">More</p></CookieConsent>);
    expect($$('.hw-cookie-consent > .hw-button-group > button').map(button => [button.textContent, button.dataset.variant])).toEqual([['Accept', 'primary'], ['Reject', 'secondary'], ['Preferences', 'ghost']]);
    expect(Array.from($('.hw-cookie-consent').children).map(element => element.tagName)).toEqual(['H2', 'P', 'A', 'P', 'DIV']);
    await render(<CookieConsent {...consentTexts} />);
    expect($$('.hw-button-group > button')).toHaveLength(2);
  });
  it('[CONSENT-02][R04] the region is labelled by its h2; an application aria-label replaces it', async () => {
    await render(<CookieConsent {...consentTexts} />);
    expect($('section').getAttribute('aria-labelledby')).toBe($('h2').id); expect($('section').hasAttribute('aria-label')).toBe(false); expect($('section').hasAttribute('role')).toBe(false);
    await render(<CookieConsent {...consentTexts} aria-label="Cookies" />);
    expect($('section').hasAttribute('aria-labelledby')).toBe(false); expect($('section').getAttribute('aria-label')).toBe('Cookies');
  });
  it('[CONSENT-04][service-patterns-21] variant=banner writes data-variant; none without it', async () => {
    await render(<><CookieConsent {...consentTexts} variant="banner" /><CookieConsent {...consentTexts} /></>);
    expect($$('.hw-cookie-consent').map(element => element.getAttribute('data-variant'))).toEqual(['banner', null]);
  });
  it('[STATE-01] uncontrolled: Reject notifies consent once, then open false once, and hides the region', async () => {
    const calls: string[] = [];
    await render(<CookieConsent {...consentTexts} onConsent={choice => calls.push(`consent:${choice}`)} onOpenChange={open => calls.push(`open:${open}`)} />);
    await click($$('button')[1]!);
    expect(calls).toEqual(['consent:rejected', 'open:false']); expect($('section').hidden).toBe(true);
  });
  it('[STATE-02] controlled open that the application keeps stays visible; [STATE-03] setting open does not notify', async () => {
    const consent = vi.fn(); const openChange = vi.fn();
    await render(<CookieConsent {...consentTexts} open onConsent={consent} onOpenChange={openChange} />);
    await click($$('button')[0]!); expect(consent).toHaveBeenCalledWith('accepted'); expect(openChange).toHaveBeenCalledWith(false); expect($('section').hidden).toBe(false);
    openChange.mockClear(); await render(<CookieConsent {...consentTexts} open={false} onConsent={consent} onOpenChange={openChange} />);
    expect($('section').hidden).toBe(true); expect(openChange).not.toHaveBeenCalled();
  });
  it('[TEXT-03] no Preferences button without a handler; [TEXT-01] missing texts render nothing and warn once each', async () => {
    const Cookie = untyped(CookieConsent);
    await render(<CookieConsent {...consentTexts} />); expect(warnings()).toEqual([]);
    await render(<Cookie />);
    expect($('h2')).toBeNull(); expect($('section > p')).toBeNull(); expect($$('button').map(button => button.textContent)).toEqual(['', '']);
    expect(warnings().map(message => message.match(/^Hawiyah: (\w+) requires "(\w+)"/)!.slice(1).join('.')).sort()).toEqual(['CookieConsent.acceptLabel', 'CookieConsent.description', 'CookieConsent.rejectLabel', 'CookieConsent.title']);
    warn.mockClear(); resetTextWarnings();
    await render(<Cookie {...consentTexts} policyHref="/cookies" onPreferences={() => undefined} />);
    expect(warnings().map(message => message.match(/^Hawiyah: (\w+) requires "(\w+)"/)!.slice(1).join('.')).sort()).toEqual(['CookieConsent.policyLabel', 'CookieConsent.preferencesLabel']);
  });
  it('[STATE-05] server render open and closed equals the first client render', async () => {
    const html = await hydrates(<><CookieConsent {...consentTexts} /><CookieConsent {...consentTexts} open={false} /></>);
    expect(html.match(/hidden=""/g)).toHaveLength(1);
  });
});

describe('Types', () => {
  it('[SHAPE-03][RENAME-02][TY] removed and renamed props and fields are type errors', () => {
    const fixture = resolve('packages/react/fixtures/feedback-content-types.tsx');
    const program = ts.createProgram([fixture], { strict: true, noEmit: true, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, lib: ['lib.es2022.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'], skipLibCheck: true, isolatedModules: true });
    const diagnostics = ts.getPreEmitDiagnostics(program).map(diagnostic => `${diagnostic.file?.fileName.split('/').pop() ?? ''}:${diagnostic.file && diagnostic.start !== undefined ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line + 1 : 0} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`);
    expect(diagnostics).toEqual([]);
    expect(readFileSync(fixture, 'utf8').match(/@ts-expect-error/g)!.length).toBeGreaterThanOrEqual(10);
  }, 60_000);
});
