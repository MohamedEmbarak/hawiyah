// NotificationList cases shared by the four adapters (milestone 3: R11 to R14, content-display-21 to -23).
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createApp, createSSRApp, defineComponent, h, nextTick, ref, type App } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { resetTextWarnings } from '@hawiyah/core';
import { NotificationList, type NotificationItem } from '../src/patterns.js';

let app: App | undefined;
let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => { resetTextWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
afterEach(() => { app?.unmount(); app = undefined; document.body.replaceChildren(); warn.mockRestore(); });
const warnings = () => (warn.mock.calls as unknown[][]).map(call => String(call[0])).filter(message => message.startsWith('Hawiyah:'));
function mount(render: () => ReturnType<typeof h>) {
  const host = document.createElement('div'); document.body.append(host);
  app = createApp(defineComponent(() => render)); app.mount(host); return host;
}
const texts = { label: 'Notifications', emptyMessage: 'No notifications', unreadLabel: 'Unread' };
// The fixture shared with React and Angular.
const fixture: NotificationItem[] = [
  { id: 'a', title: 'Ready', href: '/x', description: 'D', dateTime: '2026-10-28T09:00:00+03:00', dateLabel: '28 October', read: false },
  { id: 'b', title: 'Received', read: true },
];

it('[SHAPE-01][R14] the shared fixture renders text, data-state, one a.hw-link and one time with datetime', () => {
  const host = mount(() => h(NotificationList, { ...texts, items: fixture }));
  const items = [...host.querySelectorAll('li')];
  expect(items.map(item => item.getAttribute('data-state'))).toEqual(['unread', 'read']);
  expect(items.map(item => item.querySelector('h3')!.textContent)).toEqual(['Ready', 'Received']);
  expect(host.querySelectorAll('a.hw-link')).toHaveLength(1);
  const times = host.querySelectorAll('time');
  expect(times).toHaveLength(1);
  expect([times[0]!.getAttribute('datetime'), times[0]!.textContent]).toEqual(['2026-10-28T09:00:00+03:00', '28 October']);
  expect(items[0]!.querySelector('p')!.textContent).toBe('D');
  expect(host.querySelector('[data-read]')).toBeNull();
});

it('[NOTIFICATION-01][content-display-22] the section is labelled by a visible h2; titles are h3; no li has a class', () => {
  const host = mount(() => h(NotificationList, { ...texts, items: fixture }));
  const section = host.querySelector('section.hw-notification-list')!;
  const heading = section.firstElementChild!;
  expect(heading.tagName).toBe('H2'); expect(heading.textContent).toBe('Notifications');
  expect(section.getAttribute('aria-labelledby')).toBe(heading.id); expect(heading.id).not.toBe('');
  expect(section.hasAttribute('aria-label')).toBe(false);
  expect([...section.querySelectorAll('li')].every(item => !item.hasAttribute('class'))).toBe(true);
  expect(section.querySelectorAll('li > h3')).toHaveLength(2);
  expect(section.hasAttribute('tabindex')).toBe(false);
});

it('[NOTIFICATION-02][content-display-22] items = []: no ul, one p with emptyMessage and no role', () => {
  const host = mount(() => h(NotificationList, { ...texts, items: [] }));
  expect(host.querySelector('ul')).toBeNull();
  const empty = host.querySelector('section > p')!;
  expect(empty.textContent).toBe('No notifications'); expect(empty.hasAttribute('role')).toBe(false);
});

it('[NAME-02][NAME-03][NAME-04][R14] application aria-label or aria-labelledby alone: no h2, no warning; neither: one warning', () => {
  const host = mount(() => h('div', [
    h(NotificationList, { emptyMessage: 'None', unreadLabel: 'Unread', items: [], 'aria-label': 'Alerts' }),
    h(NotificationList, { emptyMessage: 'None', unreadLabel: 'Unread', items: [], 'aria-labelledby': 'heading' }),
  ]));
  const [labelled, referenced] = [...host.querySelectorAll('section')];
  expect(labelled!.querySelector('h2')).toBeNull(); expect(labelled!.getAttribute('aria-label')).toBe('Alerts'); expect(labelled!.hasAttribute('aria-labelledby')).toBe(false);
  expect(referenced!.querySelector('h2')).toBeNull(); expect(referenced!.getAttribute('aria-labelledby')).toBe('heading');
  expect(warnings()).toEqual([]);
  app!.unmount(); app = undefined;
  const bare = mount(() => h(NotificationList, { emptyMessage: 'None', unreadLabel: 'Unread', items: [] }));
  const section = bare.querySelector('section')!;
  expect(section.querySelector('h2')).toBeNull(); expect(section.hasAttribute('aria-labelledby')).toBe(false);
  expect(warnings()).toHaveLength(1); expect(warnings()[0]).toMatch(/NotificationList/);
});

it('[SHAPE-03][R14] type tests: the Vue date field is not accepted', () => {
  // @ts-expect-error date was renamed dateTime
  const item: NotificationItem = { id: 'a', title: 'A', date: '2026-01-01' };
  expect(item.id).toBe('a');
});

it('[TEXT-03][content-display-21][R11][R12] buttons only with their handlers: mark-read on unread items, dismiss on every item', () => {
  const labels = { getMarkReadLabel: (item: NotificationItem) => `Mark ${item.title} read`, getDismissLabel: (item: NotificationItem) => `Dismiss ${item.title}` };
  const host = mount(() => h('div', [
    h(NotificationList, { ...texts, ...labels, class: 'none', items: fixture }),
    h(NotificationList, { ...texts, ...labels, class: 'read', items: fixture, onRead: () => {} }),
    h(NotificationList, { ...texts, ...labels, class: 'dismiss', items: fixture, onDismiss: () => {} }),
  ]));
  expect(host.querySelectorAll('.none button')).toHaveLength(0);
  const read = [...host.querySelectorAll('.read button')];
  expect(read).toHaveLength(1);
  expect(read[0]!.matches('li[data-state=unread] > button.hw-button[type=button][data-variant=ghost][data-size=md][data-hw-mark-read]')).toBe(true);
  expect(read[0]!.textContent).toBe('Mark Ready read');
  const dismiss = [...host.querySelectorAll('.dismiss button')];
  expect(dismiss.map(button => button.getAttribute('aria-label'))).toEqual(['Dismiss Ready', 'Dismiss Received']);
  expect(dismiss.every(button => button.matches('[data-hw-dismiss].hw-button[data-variant=ghost]') && button.innerHTML === '<span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span>')).toBe(true);
  expect(host.querySelector('.read')!.getAttribute('tabindex')).toBe('-1');
  expect(host.querySelector('.dismiss')!.getAttribute('tabindex')).toBe('-1');
});

it('[NOTIFICATION-03][content-display-21] each activation notifies once with the item id; nothing changes until the application updates items', async () => {
  const read = vi.fn(); const dismiss = vi.fn();
  const host = mount(() => h(NotificationList, { ...texts, items: fixture, getMarkReadLabel: () => 'Mark read', getDismissLabel: () => 'Dismiss', onRead: read, onDismiss: dismiss }));
  host.querySelector<HTMLButtonElement>('[data-hw-mark-read]')!.click();
  host.querySelectorAll<HTMLButtonElement>('[data-hw-dismiss]')[1]!.click();
  await nextTick();
  expect(read).toHaveBeenCalledExactlyOnceWith('a'); expect(dismiss).toHaveBeenCalledExactlyOnceWith('b');
  expect(host.querySelectorAll('li')).toHaveLength(2);
  expect(host.querySelector('[data-hw-mark-read]')).not.toBeNull();
});

it('[FOCUS-04][R11][R12] dismiss moves focus to the next item, then the previous, then the section; mark-read likewise', async () => {
  const items = ref<NotificationItem[]>([{ id: 'a', title: 'A' }, { id: 'b', title: 'B' }, { id: 'c', title: 'C' }]);
  const host = mount(() => h(NotificationList, {
    ...texts, items: items.value, getMarkReadLabel: (item: NotificationItem) => `Read ${item.title}`, getDismissLabel: (item: NotificationItem) => `Dismiss ${item.title}`,
    onDismiss: (id: string) => { items.value = items.value.filter(item => item.id !== id); },
    onRead: (id: string) => { items.value = items.value.map(item => item.id === id ? { ...item, read: true } : item); },
  }));
  const dismiss = (title: string) => host.querySelector<HTMLButtonElement>(`[aria-label="Dismiss ${title}"]`)!;
  const read = (title: string) => [...host.querySelectorAll<HTMLButtonElement>('[data-hw-mark-read]')].find(button => button.textContent === `Read ${title}`)!;
  // Marking read: the next unread item's mark-read button, then the section when none is left.
  read('A').focus(); read('A').click(); await nextTick(); await nextTick();
  expect(document.activeElement).toBe(read('B'));
  items.value = items.value.map(item => item.id === 'c' ? { ...item, read: true } : item); await nextTick();
  read('B').click(); await nextTick(); await nextTick();
  expect(document.activeElement).toBe(host.querySelector('section'));
  dismiss('B').focus(); dismiss('B').click(); await nextTick(); await nextTick();
  expect(document.activeElement).toBe(dismiss('C'));
  dismiss('C').click(); await nextTick(); await nextTick();
  expect(document.activeElement).toBe(dismiss('A'));
  dismiss('A').click(); await nextTick(); await nextTick();
  const section = host.querySelector('section')!;
  expect(document.activeElement).toBe(section); expect(section.getAttribute('tabindex')).toBe('-1');
});

it('[TEXT-01][TEXT-02][content-display-21] missing action texts: no mark-read button and one warning; dismiss without aria-label and one warning; none without handlers', () => {
  const quiet = mount(() => h(NotificationList, { ...texts, items: fixture }));
  expect(quiet.querySelector('button')).toBeNull(); expect(warnings()).toEqual([]);
  app!.unmount(); app = undefined;
  const reading = mount(() => h(NotificationList, { ...texts, items: fixture, onRead: () => {} }));
  expect(reading.querySelector('[data-hw-mark-read]')).toBeNull();
  expect(warnings()).toHaveLength(1); expect(warnings()[0]).toMatch(/getMarkReadLabel/);
  app!.unmount(); app = undefined; resetTextWarnings(); warn.mockClear();
  const dismissing = mount(() => h(NotificationList, { ...texts, items: fixture, onDismiss: () => {} }));
  expect([...dismissing.querySelectorAll('[data-hw-dismiss]')].every(button => !button.hasAttribute('aria-label'))).toBe(true);
  expect(warnings()).toHaveLength(1); expect(warnings()[0]).toMatch(/getDismissLabel/);
});

it('[NOTIFICATION-05][content-display-23] an item with href renders exactly one a.hw-link inside the h3', () => {
  const host = mount(() => h(NotificationList, { ...texts, items: [fixture[0]!] }));
  const links = host.querySelectorAll('h3 > a.hw-link');
  expect(links).toHaveLength(1); expect(links[0]!.getAttribute('href')).toBe('/x');
});

it('[NOTIFICATION-06][R13] an unread item has one info badge with unreadLabel directly after the h3; a read item has none', () => {
  const host = mount(() => h(NotificationList, { ...texts, items: fixture }));
  const [unread, read] = [...host.querySelectorAll('li')];
  const badges = unread!.querySelectorAll('.hw-badge[data-tone=info]');
  expect(badges).toHaveLength(1); expect(badges[0]!.textContent).toBe('Unread');
  expect(badges[0]!.previousElementSibling!.tagName).toBe('H3');
  expect(unread!.querySelector('.hw-sr-only')).toBeNull();
  expect(read!.querySelector('.hw-badge')).toBeNull();
});

it('[TEXT-01][R13] unreadLabel missing with an unread item: no badge, one warning naming NotificationList and unreadLabel', () => {
  const host = mount(() => h(NotificationList, { label: 'Notifications', emptyMessage: 'None', items: fixture } as never));
  expect(host.querySelector('.hw-badge')).toBeNull();
  expect(warnings()).toHaveLength(1); expect(warnings()[0]).toMatch(/NotificationList/); expect(warnings()[0]).toMatch(/unreadLabel/);
});

it('[SSR-01][R14] server render with actions equals the first client render', async () => {
  const render = () => h(NotificationList, { ...texts, items: fixture, getMarkReadLabel: () => 'Mark read', getDismissLabel: () => 'Dismiss', onRead: () => {}, onDismiss: () => {} });
  const html = await renderToString(createSSRApp(defineComponent(() => render)));
  const host = document.createElement('div'); host.innerHTML = html; document.body.append(host); const server = host.innerHTML;
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  app = createSSRApp(defineComponent(() => render)); app.mount(host); await nextTick();
  expect(host.innerHTML).toBe(server);
  expect([...warn.mock.calls, ...errors.mock.calls].map(call => String(call[0])).filter(message => /hydration/i.test(message))).toEqual([]);
  errors.mockRestore();
});
