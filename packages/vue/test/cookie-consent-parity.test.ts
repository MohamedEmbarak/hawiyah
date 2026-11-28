// CookieConsent cases shared by the four adapters (milestone 3: R04, service-patterns-19, -21).
import { afterEach, beforeEach, expect, expectTypeOf, it, vi } from 'vitest';
import { createApp, createSSRApp, defineComponent, h, nextTick, ref, type App } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { resetTextWarnings, type ConsentChoice as CoreConsentChoice } from '@hawiyah/core';
import { CookieConsent, type ConsentChoice } from '../src/index.js';

let app: App | undefined;
let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => { resetTextWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
afterEach(() => { app?.unmount(); app = undefined; document.body.replaceChildren(); warn.mockRestore(); });
const warnings = () => (warn.mock.calls as unknown[][]).map(call => String(call[0])).filter(message => message.startsWith('Hawiyah:'));
function mount(render: () => ReturnType<typeof h>) {
  const host = document.createElement('div'); document.body.append(host);
  app = createApp(defineComponent(() => render)); app.mount(host); return host;
}
const texts = { title: 'Cookies', description: 'We use optional analytics.', acceptLabel: 'Accept', rejectLabel: 'Reject' };
const button = (host: Element, text: string) => [...host.querySelectorAll<HTMLButtonElement>('button')].find(item => item.textContent === text)!;

it('[CONSENT-01][service-patterns-19] Accept (primary), Reject (secondary), Preferences (ghost, only with a handler) inside div.hw-button-group', () => {
  const host = mount(() => h(CookieConsent, { ...texts, policyHref: '/privacy', policyLabel: 'Privacy policy', preferencesLabel: 'Preferences', onPreferences: () => {} }));
  const group = host.querySelector('section.hw-cookie-consent > div.hw-button-group')!;
  expect([...group.children].map(child => [child.textContent, child.getAttribute('data-variant')])).toEqual([['Accept', 'primary'], ['Reject', 'secondary'], ['Preferences', 'ghost']]);
  // Tab order: the policy link, then the buttons in DOM order.
  expect([...host.querySelectorAll('a[href], button')].map(item => item.textContent)).toEqual(['Privacy policy', 'Accept', 'Reject', 'Preferences']);
});

it('[CONSENT-02][R04] the region is labelled by its h2; an application aria-label replaces the reference', () => {
  const host = mount(() => h('div', [h(CookieConsent, texts), h(CookieConsent, { ...texts, 'aria-label': 'Cookie choices' })]));
  const [own, labelled] = [...host.querySelectorAll('section')];
  const heading = own!.querySelector('h2')!;
  expect(heading.textContent).toBe('Cookies'); expect(heading.id).not.toBe('');
  expect(own!.getAttribute('aria-labelledby')).toBe(heading.id);
  expect(own!.hasAttribute('aria-label')).toBe(false); expect(own!.hasAttribute('role')).toBe(false);
  expect(labelled!.getAttribute('aria-label')).toBe('Cookie choices'); expect(labelled!.hasAttribute('aria-labelledby')).toBe(false);
  expect(labelled!.querySelector('h2')).not.toBeNull();
});

it('[STATE-01][R04] uncontrolled: Reject notifies consent("rejected") once, then open false once, and the root is hidden', async () => {
  const events: unknown[] = [];
  const host = mount(() => h(CookieConsent, { ...texts, onConsent: (choice: ConsentChoice) => events.push(['consent', choice]), 'onUpdate:open': (open: boolean) => events.push(['open', open]) }));
  button(host, 'Reject').click(); await nextTick();
  expect(events).toEqual([['consent', 'rejected'], ['open', false]]);
  expect(host.querySelector<HTMLElement>('section')!.hidden).toBe(true);
});

it('[STATE-02][STATE-03][STATE-04][R04] controlled: consent fires and the region stays; changes from the application do not notify; v-model:open round-trips', async () => {
  const consent = vi.fn(); const update = vi.fn();
  const kept = mount(() => h(CookieConsent, { ...texts, open: true, onConsent: consent, 'onUpdate:open': update }));
  button(kept, 'Accept').click(); await nextTick();
  expect(consent).toHaveBeenCalledExactlyOnceWith('accepted'); expect(update).toHaveBeenCalledExactlyOnceWith(false);
  expect(kept.querySelector<HTMLElement>('section')!.hidden).toBe(false);
  app!.unmount(); app = undefined; update.mockClear();
  const open = ref(false);
  const host = mount(() => h(CookieConsent, { ...texts, open: open.value, 'onUpdate:open': (next: boolean) => { update(next); open.value = next; } }));
  expect(host.querySelector<HTMLElement>('section')!.hidden).toBe(true);
  open.value = true; await nextTick();
  expect(update).not.toHaveBeenCalled(); expect(host.querySelector<HTMLElement>('section')!.hidden).toBe(false);
  button(host, 'Accept').click(); await nextTick();
  expect(open.value).toBe(false); expect(host.querySelector<HTMLElement>('section')!.hidden).toBe(true);
});

it('[TEXT-03][TEXT-01][R04] no Preferences without a handler; missing title, description, acceptLabel, rejectLabel render nothing and warn once each', () => {
  const plain = mount(() => h(CookieConsent, { ...texts, preferencesLabel: 'Preferences' }));
  expect(button(plain, 'Preferences')).toBeUndefined(); expect(warnings()).toEqual([]);
  app!.unmount(); app = undefined;
  const host = mount(() => h(CookieConsent, {} as never));
  const section = host.querySelector('section')!;
  expect(section.querySelector('h2')).toBeNull(); expect(section.querySelector(':scope > p')).toBeNull();
  expect(section.hasAttribute('aria-labelledby')).toBe(false);
  expect([...section.querySelectorAll('button')].map(item => item.textContent)).toEqual(['', '']);
  const own = warnings();
  expect(own).toHaveLength(4);
  for (const name of ['title', 'description', 'acceptLabel', 'rejectLabel']) expect(own.some(message => message.includes('CookieConsent') && message.includes(name)), name).toBe(true);
  app!.unmount(); app = undefined; resetTextWarnings(); warn.mockClear();
  mount(() => h(CookieConsent, { ...texts, policyHref: '/privacy', onPreferences: () => {} }));
  expect(warnings().map(message => /policyLabel|preferencesLabel/.exec(message)?.[0])).toEqual(['policyLabel', 'preferencesLabel']);
});

it('[STATE-05][R04] server render open and closed equals the first client render', async () => {
  const render = () => h('div', [h(CookieConsent, texts), h(CookieConsent, { ...texts, open: false })]);
  const html = await renderToString(createSSRApp(defineComponent(() => render)));
  const host = document.createElement('div'); host.innerHTML = html; document.body.append(host); const server = host.innerHTML;
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  app = createSSRApp(defineComponent(() => render)); app.mount(host); await nextTick();
  expect(host.innerHTML).toBe(server);
  expect([...host.querySelectorAll<HTMLElement>('section')].map(section => section.hidden)).toEqual([false, true]);
  expect([...warn.mock.calls, ...errors.mock.calls].map(call => String(call[0])).filter(message => /hydration/i.test(message))).toEqual([]);
  errors.mockRestore();
});

it('[RENAME-02][R04] Vue: @accept and @reject are replaced by @consent with the core ConsentChoice', () => {
  expectTypeOf<ConsentChoice>().toEqualTypeOf<CoreConsentChoice>();
  expect(Object.keys(CookieConsent.emits as object)).toEqual(['update:open', 'consent', 'preferences']);
  const accept = vi.fn();
  const host = mount(() => h(CookieConsent, { ...texts, onAccept: accept } as never));
  button(host, 'Accept').click();
  expect(accept).not.toHaveBeenCalled();
});

it('[CONSENT-04][service-patterns-21] variant=banner writes data-variant on .hw-cookie-consent; no attribute without it', () => {
  const host = mount(() => h('div', [h(CookieConsent, { ...texts, variant: 'banner' }), h(CookieConsent, texts)]));
  expect([...host.querySelectorAll('.hw-cookie-consent')].map(item => item.getAttribute('data-variant'))).toEqual(['banner', null]);
});
