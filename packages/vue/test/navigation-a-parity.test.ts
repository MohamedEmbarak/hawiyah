// Breadcrumb and Stepper cases shared by the four adapters (milestone 3: nav-a-11, nav-a-14, nav-a-15).
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createApp, createSSRApp, defineComponent, h, nextTick, type App } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { resetTextWarnings } from '@hawiyah/core';
import { Breadcrumb, Stepper } from '../src/display.js';
import { stepperText } from './texts.js';

let app: App | undefined;
let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => { resetTextWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
afterEach(() => { app?.unmount(); app = undefined; document.body.replaceChildren(); warn.mockRestore(); });
const warnings = () => (warn.mock.calls as unknown[][]).map(call => String(call[0])).filter(message => message.startsWith('Hawiyah:'));
function mount(render: () => ReturnType<typeof h>) {
  const host = document.createElement('div'); document.body.append(host);
  app = createApp(defineComponent(() => render)); app.mount(host); return host;
}
const crumbs = (host: Element) => [...host.querySelectorAll('li')].map(item => item.firstElementChild!.outerHTML);

it('[BREADCRUMB-01][nav-a-11] the last item with an href is a span with aria-current=page, not a link and not a tab stop', () => {
  const host = mount(() => h(Breadcrumb, { label: 'Breadcrumb', items: [{ label: 'Home', href: '/' }, { label: 'Services', href: '/services' }] }));
  const current = host.querySelector('li:last-child > *')!;
  expect(current.tagName).toBe('SPAN'); expect(current.getAttribute('aria-current')).toBe('page');
  expect(current.hasAttribute('href')).toBe(false); expect(current.hasAttribute('tabindex')).toBe(false);
  expect(host.querySelectorAll('[aria-current]')).toHaveLength(1);
});

it('[BREADCRUMB-02][BREADCRUMB-03][SHAPE-01] a flagged item alone is current; the last item is then a link; a disabled item keeps role=link without href', () => {
  const host = mount(() => h(Breadcrumb, { label: 'Breadcrumb', items: [{ label: 'Home', href: '/' }, { label: 'Services', href: '/services', current: true }, { label: 'Passport', href: '/passport', disabled: true }] }));
  expect(crumbs(host)).toEqual(['<a href="/">Home</a>', '<span aria-current="page">Services</span>', '<span role="link" aria-disabled="true">Passport</span>']);
  app!.unmount(); document.body.replaceChildren();
  const second = mount(() => h(Breadcrumb, { label: 'Breadcrumb', items: [{ label: 'Home', href: '/' }, { label: 'Services', href: '/services', current: true }, { label: 'Passport', href: '/passport' }] }));
  expect(crumbs(second)).toEqual(['<a href="/">Home</a>', '<span aria-current="page">Services</span>', '<a href="/passport">Passport</a>']);
  expect(second.querySelectorAll('[aria-current]')).toHaveLength(1);
});

const steps = [{ value: 'data', label: 'Data', description: 'Your details' }, { value: 'review', label: 'Review' }, { value: 'send', label: 'Send' }];

it('[STEPPER-01][nav-a-14] complete and upcoming steps carry a hidden state text after the label; the current step has none', () => {
  const host = mount(() => h(Stepper, { ...stepperText, label: 'Progress', items: steps, current: 'review' }));
  const items = [...host.querySelectorAll('li.hw-step')];
  expect(items[0]!.children[1]!.matches('span.hw-sr-only[data-hw-step-status]')).toBe(true);
  expect(items[0]!.children[1]!.textContent).toBe('Completed');
  expect(items[1]!.querySelector('[data-hw-step-status]')).toBeNull(); expect(items[1]!.getAttribute('aria-current')).toBe('step');
  expect(items[2]!.querySelector('[data-hw-step-status]')!.textContent).toBe('Not started');
  expect(warnings()).toEqual([]);
});

it('[STEPPER-02] an explicit status complete on the last step gives it completeLabel', () => {
  const host = mount(() => h(Stepper, { ...stepperText, label: 'Progress', items: [...steps.slice(0, 2), { ...steps[2]!, status: 'complete' as const }], current: 'data' }));
  expect(host.querySelector('li:last-child [data-hw-step-status]')!.textContent).toBe('Completed');
});

it('[TEXT-01][nav-a-14] a missing completeLabel renders no status span on complete steps and warns once', () => {
  const host = mount(() => h(Stepper, { upcomingLabel: 'Not started', label: 'Progress', items: steps, current: 'send' } as never));
  expect(host.querySelectorAll('li[data-state=complete] [data-hw-step-status]')).toHaveLength(0);
  expect(warnings().filter(message => message.includes('completeLabel'))).toHaveLength(1);
});

it('[STEPPER-04][SHAPE-01][nav-a-15] the description is a sibling p.hw-hint of the label span; no small element', () => {
  const host = mount(() => h(Stepper, { ...stepperText, label: 'Progress', items: steps, current: 'review' }));
  const first = host.querySelector('li.hw-step')!;
  expect([...first.children].map(child => child.tagName)).toEqual(['SPAN', 'SPAN', 'P']);
  expect(first.firstElementChild!.textContent).toBe('Data'); expect(first.querySelector('p.hw-hint')!.textContent).toBe('Your details');
  expect(host.querySelector('small')).toBeNull();
});

it('[STEPPER-05] neither current nor activeIndex: every step is upcoming and none has aria-current', () => {
  const host = mount(() => h(Stepper, { ...stepperText, label: 'Progress', items: steps }));
  expect([...host.querySelectorAll<HTMLElement>('li')].map(step => step.dataset.state)).toEqual(['upcoming', 'upcoming', 'upcoming']);
  expect(host.querySelector('[aria-current]')).toBeNull();
});

it('[SSR-01][nav-a-14] server HTML contains the status spans and equals the first client render', async () => {
  const render = () => h(Stepper, { ...stepperText, label: 'Progress', items: steps, current: 'review' });
  const html = await renderToString(createSSRApp(defineComponent(() => render)));
  expect(html).toContain('<span class="hw-sr-only" data-hw-step-status>Completed</span>');
  const host = document.createElement('div'); host.innerHTML = html; document.body.append(host); const server = host.innerHTML;
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  app = createSSRApp(defineComponent(() => render)); app.mount(host); await nextTick();
  expect(host.innerHTML).toBe(server);
  expect([...warn.mock.calls, ...errors.mock.calls].map(call => String(call[0])).filter(message => /hydration/i.test(message))).toEqual([]);
  errors.mockRestore();
});
