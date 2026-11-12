import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { attributesOf, contentOf, markup, page } from './fixtures/page';
import { missingTextWarnings } from './fixtures/texts';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); });

interface Item { id: string; title: string; href?: string; description?: string; dateTime?: string; dateLabel?: string; read?: boolean }
const fixture: Item[] = [{ id: 'a', title: 'Ready', href: '/x', description: 'D', dateTime: '2026-10-28T09:00:00+03:00', dateLabel: '28 October', read: false }, { id: 'b', title: 'Received', read: true }];
const three: Item[] = [{ id: 'a', title: 'First' }, { id: 'b', title: 'Second' }, { id: 'c', title: 'Third', read: true }, { id: 'd', title: 'Fourth' }];
const texts = { markRead: (item: Item) => `Mark ${item.title} as read`, dismiss: (item: Item) => `Dismiss ${item.title}` };
const base = 'label="Notifications" emptyMessage="No notifications" unreadLabel="Unread"';
const icon = '<span aria-hidden="true" class="hw-icon" data-icon="cancel-01" data-size="md"></span>';

// The Angular side of tests/notification-list-parity.test.ts: the same case ids and assertions on the DOM.
describe('NotificationList', () => {
  it('[SHAPE-01][R14] one fixture passed unchanged renders the text, data-state unread and read, one a.hw-link and one time with datetime', () => {
    const { root } = page(`<hw-notification-list ${base} [items]="items" />`, { items: fixture });
    const [unread, read] = [...root.querySelectorAll('section.hw-notification-list > ul > li')];
    expect(markup(unread!)).toBe('<li data-state="unread"><h3><a class="hw-link" href="/x">Ready</a></h3><hw-badge class="hw-badge" data-tone="info">Unread</hw-badge><p>D</p><time datetime="2026-10-28T09:00:00+03:00">28 October</time></li>');
    expect(markup(read!)).toBe('<li data-state="read"><h3>Received</h3></li>');
    expect(root.querySelectorAll('a.hw-link')).toHaveLength(1); expect(root.querySelectorAll('time')).toHaveLength(1);
  });

  it('[NOTIFICATION-01][content-display-22] the section is labelled by a visible h2; titles are h3; no li has a class', () => {
    const { root } = page(`<hw-notification-list ${base} [items]="items" />`, { items: fixture });
    const section = root.querySelector('section.hw-notification-list')!, heading = section.querySelector('h2')!;
    expect(heading.textContent).toBe('Notifications'); expect(heading.id).not.toBe(''); expect(attributesOf(section)).toEqual({ 'aria-labelledby': heading.id, class: 'hw-notification-list' });
    expect(contentOf(section).map(node => (node as Element).localName)).toEqual(['h2', 'ul']);
    for (const item of section.querySelectorAll('li')) { expect(item.hasAttribute('class')).toBe(false); expect(item.firstElementChild!.localName).toBe('h3'); expect(item.querySelector('strong, div')).toBeNull(); }
  });

  it('[NOTIFICATION-02] items = []: no ul, one p with emptyMessage and no role', () => {
    const { root } = page(`<hw-notification-list ${base} [items]="[]" />`);
    const section = root.querySelector('section.hw-notification-list')!;
    expect(section.querySelector('ul, li')).toBeNull(); expect(contentOf(section).map(node => markup(node as Element))).toEqual([expect.stringMatching(/^<h2 id="[^"]+">Notifications<\/h2>$/), '<p>No notifications</p>']);
  });

  it('[NOTIFICATION-02] a dateTime without dateLabel renders no time element and no raw date', () => {
    const { root } = page(`<hw-notification-list ${base} [items]="[{id: 'a', title: 'Sent', dateTime: '2026-10-28', read: true}]" />`);
    expect(root.querySelector('time')).toBeNull(); expect(root.querySelector('li')!.textContent).toBe('Sent');
  });

  it('[NOTIFICATION-05][content-display-23] an item with href renders exactly one a.hw-link inside the h3', () => {
    const { root } = page(`<hw-notification-list ${base} [items]="items" />`, { items: fixture });
    const links = root.querySelectorAll('li a'); expect(links).toHaveLength(1);
    expect(links[0]!.parentElement!.localName).toBe('h3'); expect(attributesOf(links[0]!)).toEqual({ class: 'hw-link', href: '/x' });
  });

  it('[NOTIFICATION-06][R13] an unread item contains one .hw-badge[data-tone=info] with the unreadLabel text directly after the h3 and no .hw-sr-only; a read item contains none', () => {
    const { root } = page(`<hw-notification-list ${base} [items]="items" />`, { items: fixture });
    const [unread, read] = [...root.querySelectorAll('li')];
    expect(unread!.querySelectorAll('.hw-badge[data-tone=info]')).toHaveLength(1); expect(unread!.querySelector('h3')!.nextElementSibling).toBe(unread!.querySelector('.hw-badge')); expect(unread!.querySelector('.hw-badge')!.textContent).toBe('Unread');
    expect(root.querySelector('.hw-sr-only')).toBeNull(); expect(read!.querySelector('.hw-badge')).toBeNull();
  });

  it('[TEXT-03][content-display-21][R11][R12] without listeners no button; a text button per unread item with (read); an icon button per item with (dismissed)', () => {
    const { root } = page(`<hw-notification-list id="plain" ${base} [items]="items" [getMarkReadLabel]="texts.markRead" [getDismissLabel]="texts.dismiss" />
      <hw-notification-list id="read" ${base} [items]="items" [getMarkReadLabel]="texts.markRead" (read)="seen.push($event)" /><hw-notification-list id="dismiss" ${base} [items]="items" [getDismissLabel]="texts.dismiss" (dismissed)="seen.push($event)" />
      <hw-notification-list id="both" ${base} [items]="items" [getMarkReadLabel]="texts.markRead" [getDismissLabel]="texts.dismiss" (read)="seen.push($event)" (dismissed)="seen.push($event)" />`, { items: three, texts, seen: [] as string[] });
    const list = (id: string) => root.querySelector(`#${id} section`)!;
    expect(list('plain').querySelector('button')).toBeNull(); expect(list('plain').hasAttribute('tabindex')).toBe(false);
    expect([...list('read').querySelectorAll('li')].map(item => item.querySelectorAll('button').length)).toEqual([1, 1, 0, 1]); expect(list('read').getAttribute('tabindex')).toBe('-1');
    expect(markup(list('read').querySelector('button')!)).toBe('<button class="hw-button" data-hw-mark-read="" data-size="md" data-variant="ghost" type="button">Mark First as read</button>');
    expect([...list('dismiss').querySelectorAll('li')].map(item => item.querySelectorAll('button').length)).toEqual([1, 1, 1, 1]); expect(list('dismiss').getAttribute('tabindex')).toBe('-1');
    expect(markup(list('dismiss').querySelector('button')!)).toBe(`<button aria-label="Dismiss First" class="hw-button" data-hw-dismiss="" data-size="md" data-variant="ghost" type="button">${icon}</button>`);
    // Both actions are the last children of the item, mark-read first.
    expect([...list('both').querySelector('li')!.children].slice(-2).map(button => button.hasAttribute('data-hw-mark-read') ? 'read' : 'dismiss')).toEqual(['read', 'dismiss']);
  });

  it('[NOTIFICATION-03] activating each button notifies once with the item id; nothing changes until the application updates items', () => {
    const { root, state, update } = page(`<hw-notification-list ${base} [items]="items" [getMarkReadLabel]="texts.markRead" [getDismissLabel]="texts.dismiss" (read)="read.push($event)" (dismissed)="dismissed.push($event)" />`, { items: three, texts, read: [] as string[], dismissed: [] as string[] });
    const before = root.querySelector('section')!.innerHTML.replace(/<!--[^>]*-->/g, '');
    root.querySelectorAll<HTMLElement>('[data-hw-mark-read]')[1]!.click(); update(); root.querySelectorAll<HTMLElement>('[data-hw-dismiss]')[2]!.click(); update();
    expect(state.read).toEqual(['b']); expect(state.dismissed).toEqual(['c']); expect(root.querySelector('section')!.innerHTML.replace(/<!--[^>]*-->/g, '')).toBe(before);
  });

  it('[FOCUS-04] dismissing the focused item moves focus to the next item\'s dismiss button, then to the previous one, then to the section', () => {
    const { root, update } = page(`<hw-notification-list ${base} [items]="items" [getDismissLabel]="texts.dismiss" (dismissed)="dismiss($event)" />`, { items: three.slice(0, 3), texts, dismiss(this: { items: Item[] }, id: string) { this.items = this.items.filter(item => item.id !== id); } });
    const press = (name: string) => { const button = root.querySelector<HTMLButtonElement>(`button[aria-label="Dismiss ${name}"]`)!; button.focus(); button.click(); update(); };
    press('Second'); expect(document.activeElement).toBe(root.querySelector('button[aria-label="Dismiss Third"]'));
    press('Third'); expect(document.activeElement).toBe(root.querySelector('button[aria-label="Dismiss First"]'));
    press('First');
    const section = root.querySelector('section.hw-notification-list')!; expect(section.getAttribute('tabindex')).toBe('-1'); expect(document.activeElement).toBe(section); expect(section.querySelector('p')!.textContent).toBe('No notifications');
  });

  it('[FOCUS-04] marking the focused unread item read moves focus to the next unread item\'s mark-read button, and to the section when none is left', () => {
    const { root, update } = page(`<hw-notification-list ${base} [items]="items" [getMarkReadLabel]="texts.markRead" (read)="read($event)" />`, { items: three, texts, read(this: { items: Item[] }, id: string) { this.items = this.items.map(item => item.id === id ? { ...item, read: true } : item); } });
    const press = (name: string) => { const button = [...root.querySelectorAll<HTMLButtonElement>('[data-hw-mark-read]')].find(entry => entry.textContent === `Mark ${name} as read`)!; button.focus(); button.click(); update(); };
    press('First'); expect(document.activeElement!.textContent).toBe('Mark Second as read');
    press('Second'); expect(document.activeElement!.textContent).toBe('Mark Fourth as read');
    press('Fourth'); expect(root.querySelector('[data-hw-mark-read]')).toBeNull(); expect(document.activeElement).toBe(root.querySelector('section.hw-notification-list'));
  });

  it('[FOCUS-04] nothing moves while the application keeps the item', () => {
    const { root, update } = page(`<hw-notification-list ${base} [items]="items" [getDismissLabel]="texts.dismiss" (dismissed)="seen.push($event)" />`, { items: three, texts, seen: [] as string[] });
    const button = root.querySelector<HTMLButtonElement>('[data-hw-dismiss]')!; button.focus(); button.click(); update(); update();
    expect(document.activeElement).toBe(button);
  });

  it('[TEXT-01] (read) without getMarkReadLabel: no mark-read button and one warning; (dismissed) without getDismissLabel: a button without aria-label and one warning', () => {
    const warnings = missingTextWarnings();
    const { root, update } = page(`<hw-notification-list ${base} [items]="items" (read)="seen.push($event)" (dismissed)="seen.push($event)" />`, { items: three, seen: [] as string[] });
    update();
    expect(root.querySelector('[data-hw-mark-read]')).toBeNull(); expect(root.querySelectorAll('[data-hw-dismiss]')).toHaveLength(4); for (const button of root.querySelectorAll('[data-hw-dismiss]')) expect(button.hasAttribute('aria-label')).toBe(false);
    expect(warnings.map(warning => warning.split('.')[0])).toEqual(['Hawiyah: hw-notification-list requires "getMarkReadLabel" when a read listener is bound', 'Hawiyah: hw-notification-list requires "getDismissLabel" when a dismissed listener is bound']);
  });

  it('[TEXT-02] neither text is required without its listener', () => {
    const { root, update } = page(`<hw-notification-list ${base} [items]="items" />`, { items: three }); update();
    expect(root.querySelector('button')).toBeNull();
  });

  it('[TEXT-01][R13] unreadLabel missing with an unread item: no badge and one warning; emptyMessage missing: no paragraph and one warning', () => {
    const warnings = missingTextWarnings();
    const { root, update } = page(`<hw-notification-list label="Notifications" emptyMessage="None" [unreadLabel]="''" [items]="items" /><hw-notification-list label="Empty" unreadLabel="Unread" [emptyMessage]="''" [items]="[]" />`, { items: three }); update();
    expect(root.querySelector('.hw-badge')).toBeNull(); expect(root.querySelectorAll('section')[1]!.querySelector('p')).toBeNull();
    expect(warnings.map(warning => warning.split('.')[0])).toEqual(['Hawiyah: hw-notification-list requires "unreadLabel"', 'Hawiyah: hw-notification-list requires "emptyMessage"']);
  });

  it('[NAME-02][NAME-03][NAME-04] an application aria-label or aria-labelledby alone renders no h2 and does not warn; neither gives one warning, no h2 and no aria-labelledby', () => {
    const warnings = missingTextWarnings();
    const { root, update } = page(`<h2 id="heading">Heading</h2><hw-notification-list aria-label="Notifications" emptyMessage="None" unreadLabel="Unread" /><hw-notification-list aria-labelledby="heading" emptyMessage="None" unreadLabel="Unread" />`); update();
    expect(root.querySelector('section h2')).toBeNull(); expect(warnings).toEqual([]);
    const unnamed = page(`<hw-notification-list emptyMessage="None" unreadLabel="Unread" />`); unnamed.update();
    const section = unnamed.root.querySelector('section')!; expect(section.querySelector('h2')).toBeNull(); expect(section.hasAttribute('aria-labelledby')).toBe(false); expect(section.hasAttribute('aria-label')).toBe(false);
    expect(warnings.map(warning => warning.split('.')[0])).toEqual(['Hawiyah: hw-notification-list requires "label"']);
  });
});
