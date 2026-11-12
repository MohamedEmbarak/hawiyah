// Alert, Progress, Meter, Skeleton, Spinner, EmptyState, Chip, ButtonGroup, ToastRegion and Button cases shared by the four adapters
// (milestone 3: feedback-status-1, -2, -7 to -12, -14, R00, R20, actions-6).
import { afterEach, beforeEach, expect, expectTypeOf, it, vi } from 'vitest';
import { createApp, createSSRApp, defineComponent, h, nextTick, ref, type App } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { resetTextWarnings } from '@hawiyah/core';
import { Alert, EmptyState, Progress, Skeleton, Spinner } from '../src/display.js';
import { ButtonGroup, Chip, Meter } from '../src/content.js';
import { Button } from '../src/forms.js';
import { ToastRegion } from '../src/expansion-interactive.js';

let app: App | undefined;
let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => { resetTextWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
afterEach(() => { app?.unmount(); app = undefined; document.body.replaceChildren(); warn.mockRestore(); vi.useRealTimers(); });
const warnings = () => (warn.mock.calls as unknown[][]).map(call => String(call[0])).filter(message => message.startsWith('Hawiyah:'));
function mount(render: () => ReturnType<typeof h>) {
  const host = document.createElement('div'); document.body.append(host);
  app = createApp(defineComponent(() => render)); app.mount(host); return host;
}
async function hydrates(render: () => ReturnType<typeof h>) {
  const html = await renderToString(createSSRApp(defineComponent(() => render)));
  const host = document.createElement('div'); host.innerHTML = html; document.body.append(host); const server = host.innerHTML;
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  app = createSSRApp(defineComponent(() => render)); app.mount(host); await nextTick();
  expect(host.innerHTML).toBe(server);
  expect([...warn.mock.calls, ...errors.mock.calls].map(call => String(call[0])).filter(message => /hydration/i.test(message))).toEqual([]);
  errors.mockRestore();
  return host;
}
const key = (element: Element, name: string) => element.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));

it('[ALERT-01][feedback-status-1] tone=danger without role renders role=alert; every other tone renders role=status', () => {
  const host = mount(() => h('div', (['danger', 'info', 'success', 'warning', 'neutral'] as const).map(tone => h(Alert, { tone }, () => tone))));
  expect([...host.querySelectorAll('.hw-alert')].map(alert => alert.getAttribute('role'))).toEqual(['alert', 'status', 'status', 'status', 'status']);
  expect(host.querySelector('.hw-alert')!.hasAttribute('data-variant')).toBe(false);
});

it('[ALERT-02] an explicit role="status" on a danger alert is kept', () => {
  const host = mount(() => h(Alert, { tone: 'danger', role: 'status' }, () => 'Saved with warnings'));
  expect(host.querySelector('.hw-alert')!.getAttribute('role')).toBe('status');
});

it('[SSR-01][feedback-status-1] server HTML of a danger and an info alert equals the first client render', async () => {
  const host = await hydrates(() => h('div', [h(Alert, { tone: 'danger', title: 'Error' }, () => 'Failed'), h(Alert, { tone: 'info' }, () => 'Note')]));
  expect([...host.querySelectorAll('.hw-alert')].map(alert => alert.getAttribute('role'))).toEqual(['alert', 'status']);
});

it('[TEXT-03][R00] no dismiss button without a handler; one with it, with the documented classes and icon', () => {
  const host = mount(() => h('div', [h(Alert, { class: 'without', closeLabel: 'Close' }, () => 'A'), h(Alert, { class: 'with', closeLabel: 'Close', onDismiss: () => {} }, () => 'B')]));
  expect(host.querySelector('.without button')).toBeNull();
  const buttons = host.querySelectorAll('.with button');
  expect(buttons).toHaveLength(1);
  const button = buttons[0]!;
  expect(button.matches('button[type=button].hw-button.hw-alert-dismiss[data-variant=ghost][data-size=md][aria-label="Close"]')).toBe(true);
  expect(button.previousElementSibling!.matches('div.hw-alert-content')).toBe(true);
  expect(button.innerHTML).toBe('<span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span>');
});

it('[TEXT-01][feedback-status-2] dismiss handler without closeLabel: button without aria-label, one warning naming Alert and closeLabel', () => {
  const host = mount(() => h(Alert, { onDismiss: () => {} }, () => 'A'));
  expect(host.querySelector('button')!.hasAttribute('aria-label')).toBe(false);
  expect(warnings()).toHaveLength(1);
  expect(warnings()[0]).toMatch(/Alert/); expect(warnings()[0]).toMatch(/closeLabel/);
});

it('[TEXT-02][feedback-status-2] closeLabel is not required and not reported while no handler is bound', () => {
  mount(() => h(Alert, {}, () => 'A'));
  expect(warnings()).toEqual([]);
});

it('[ALERT-03][feedback-status-2] click, Enter and Space on the button notify once each; the alert stays in the DOM', async () => {
  const dismiss = vi.fn();
  const host = mount(() => h(Alert, { closeLabel: 'Close', onDismiss: dismiss }, () => 'A'));
  const button = host.querySelector<HTMLButtonElement>('.hw-alert-dismiss')!;
  button.click(); expect(dismiss).toHaveBeenCalledTimes(1);
  // A native button turns Enter and Space into a click; jsdom does not, so the activation is the click.
  key(button, 'Enter'); button.click(); expect(dismiss).toHaveBeenCalledTimes(2);
  key(button, ' '); button.click(); expect(dismiss).toHaveBeenCalledTimes(3);
  expect(dismiss.mock.calls.every(call => call.length === 0)).toBe(true);
  await nextTick();
  expect(host.querySelector('.hw-alert')).not.toBeNull();
});

it('[PROGRESS-01][feedback-status-7] label alone: one native progress with aria-label, no label element, raw values, no value when absent', () => {
  const host = mount(() => h('div', [h(Progress, { label: 'Upload', value: 150, max: 100 }), h(Progress, { label: 'Loading' })]));
  const [first, second] = [...host.querySelectorAll('progress.hw-progress')];
  expect(host.querySelectorAll('progress')).toHaveLength(2);
  expect(host.querySelector('label')).toBeNull();
  expect(host.textContent).toBe('');
  expect(first!.getAttribute('aria-label')).toBe('Upload');
  expect(first!.getAttribute('value')).toBe('150'); expect(first!.getAttribute('max')).toBe('100');
  expect(second!.hasAttribute('value')).toBe(false);
  expect(first!.parentElement).toBe(host.firstElementChild);
});

it('[PROGRESS-02][feedback-status-7] size writes data-size on the progress element', () => {
  const host = mount(() => h('div', [h(Progress, { label: 'A', size: 'sm' }), h(Progress, { label: 'B', size: 'lg' }), h(Progress, { label: 'C' })]));
  expect([...host.querySelectorAll('progress')].map(item => item.getAttribute('data-size'))).toEqual(['sm', 'lg', null]);
});

it('[NAME-02][NAME-03][NAME-04][feedback-status-7][feedback-status-8][feedback-status-14] Progress, Meter and ButtonGroup take their name from the application or warn once', () => {
  for (const component of [Progress, Meter, ButtonGroup] as const) {
    resetTextWarnings(); warn.mockClear(); document.body.replaceChildren(); app?.unmount();
    const host = mount(() => h('div', [h(component as never, { 'aria-label': 'Applied' }), h(component as never, { 'aria-labelledby': 'heading' })]));
    const [labelled, referenced] = [...host.firstElementChild!.children];
    expect(labelled!.getAttribute('aria-label')).toBe('Applied');
    expect(referenced!.hasAttribute('aria-label')).toBe(false); expect(referenced!.getAttribute('aria-labelledby')).toBe('heading');
    expect(warnings()).toEqual([]);
    app!.unmount(); app = undefined;
    const bare = mount(() => h(component as never, {}));
    expect(bare.firstElementChild!.hasAttribute('aria-label')).toBe(false);
    expect(warnings()).toHaveLength(1);
    expect(warnings()[0]).toMatch(/label/);
  }
});

it('[METER-01][feedback-status-8] label and value only: min 0, max 100, the value, no low / high / optimum, no label and no text', () => {
  const host = mount(() => h(Meter, { label: 'Storage', value: 10 }));
  const meter = host.querySelector('meter.hw-meter')!;
  expect(meter.getAttribute('aria-label')).toBe('Storage');
  expect([meter.getAttribute('min'), meter.getAttribute('max'), meter.getAttribute('value')]).toEqual(['0', '100', '10']);
  for (const name of ['low', 'high', 'optimum']) expect(meter.hasAttribute(name)).toBe(false);
  expect(host.querySelector('label')).toBeNull(); expect(host.textContent).toBe('');
  const empty = mount(() => h(Meter, { label: 'Default' }));
  expect(empty.querySelector('meter')!.getAttribute('value')).toBe('0');
});

it('[METER-02][feedback-status-8] low, high and optimum are written when given', () => {
  const host = mount(() => h(Meter, { label: 'Storage', value: 70, low: 20, high: 80, optimum: 10 }));
  const meter = host.querySelector('meter')!;
  expect([meter.getAttribute('low'), meter.getAttribute('high'), meter.getAttribute('optimum')]).toEqual(['20', '80', '10']);
});

it('[SKELETON-01][feedback-status-9] variant writes data-variant on the aria-hidden element with class hw-skeleton', () => {
  const host = mount(() => h('div', [h(Skeleton, { variant: 'circle' }), h(Skeleton, { variant: 'text', style: 'inline-size: 70%' }), h(Skeleton)]));
  const items = [...host.querySelectorAll('span.hw-skeleton')];
  expect(items.map(item => item.getAttribute('data-variant'))).toEqual(['circle', 'text', null]);
  expect(items.every(item => item.getAttribute('aria-hidden') === 'true')).toBe(true);
  expect((items[1] as HTMLElement).style.inlineSize).toBe('70%');
});

it('[SPINNER-01][feedback-status-10] the hw-spinner element has role=status and contains span.hw-sr-only with the label; no other wrapper', () => {
  const host = mount(() => h(Spinner, { label: 'Loading' }));
  const spinner = host.firstElementChild!;
  expect(spinner.matches('span.hw-spinner[role=status]')).toBe(true);
  expect(spinner.innerHTML).toBe('<span class="hw-sr-only">Loading</span>');
});

it('[SPINNER-02][feedback-status-10] size writes data-size on that element', () => {
  const host = mount(() => h('div', [h(Spinner, { label: 'A', size: 'sm' }), h(Spinner, { label: 'B', size: 'lg' })]));
  expect([...host.querySelectorAll('.hw-spinner')].map(item => item.getAttribute('data-size'))).toEqual(['sm', 'lg']);
});

it('[NAME-02][NAME-04][SPINNER-03][feedback-status-10] Spinner names: aria-label alone, neither, aria-hidden', () => {
  const named = mount(() => h(Spinner, { 'aria-label': 'Loading' }));
  expect(named.querySelector('.hw-sr-only')).toBeNull(); expect(warnings()).toEqual([]);
  app!.unmount(); app = undefined;
  const decorative = mount(() => h(Spinner, { 'aria-hidden': 'true' }));
  expect(decorative.querySelector('.hw-sr-only')).toBeNull(); expect(warnings()).toEqual([]);
  app!.unmount(); app = undefined;
  const bare = mount(() => h(Spinner));
  expect(bare.querySelector('.hw-sr-only')).toBeNull();
  expect(warnings()).toHaveLength(1); expect(warnings()[0]).toMatch(/Spinner/);
});

it('[RICH-01][feedback-status-11] the icon is inside span.hw-empty-icon[aria-hidden=true] before the h3; the action is the last child', () => {
  const host = mount(() => h(EmptyState, { title: 'No requests', description: 'Start one' }, { icon: () => h('span', { class: 'hw-icon', 'data-icon': 'file-01' }), action: () => h(Button, {}, () => 'New request') }));
  const root = host.querySelector('div.hw-empty')!;
  const icon = root.firstElementChild!;
  expect(icon.matches('span.hw-empty-icon[aria-hidden=true]')).toBe(true);
  expect(icon.querySelector('.hw-icon')).not.toBeNull();
  expect(icon.nextElementSibling!.tagName).toBe('H3');
  expect(root.lastElementChild!.matches('button.hw-button')).toBe(true);
});

it('[RICH-04][feedback-status-11] server render with and without icon equals the first client render', async () => {
  await hydrates(() => h('div', [h(EmptyState, { title: 'A' }, { icon: () => h('span', { class: 'hw-icon' }) }), h(EmptyState, { title: 'B' })]));
});

it('[CHIP-01][feedback-status-12] the remove control is a type=button button without hw-button, holding the icon span', () => {
  const host = mount(() => h('div', { class: 'hw-chips' }, [h(Chip, { removeLabel: 'Remove Riyadh', onRemove: () => {} }, () => 'Riyadh'), h(Chip, {}, () => 'Jeddah')]));
  const button = host.querySelector('.hw-chip > button')!;
  expect(button.getAttribute('type')).toBe('button');
  expect(button.classList.contains('hw-button')).toBe(false);
  expect(button.getAttribute('aria-label')).toBe('Remove Riyadh');
  expect(button.innerHTML).toBe('<span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span>');
});

it('[CHIP-02][feedback-status-12] Vue: removable is gone; variant and size are typed; disabled disables the button', () => {
  expect(Object.keys(Chip.props)).not.toContain('removable');
  expectTypeOf<InstanceType<typeof Chip>['$props']['variant']>().toEqualTypeOf<'soft' | 'outline' | undefined>();
  expectTypeOf<InstanceType<typeof Chip>['$props']['size']>().toEqualTypeOf<'sm' | 'lg' | undefined>();
  const host = mount(() => h(Chip, { variant: 'outline', size: 'sm', tone: 'info', disabled: true, removeLabel: 'Remove', onRemove: () => {} }, () => 'A'));
  const chip = host.querySelector('.hw-chip')!;
  expect([chip.getAttribute('data-variant'), chip.getAttribute('data-size'), chip.getAttribute('data-tone')]).toEqual(['outline', 'sm', 'info']);
  expect(chip.querySelector('button')!.disabled).toBe(true);
});

it('[TEXT-03][TEXT-01][feedback-status-12] no button without a remove handler; handler without removeLabel: no aria-label, one warning', () => {
  const plain = mount(() => h(Chip, { removable: true } as never, () => 'A'));
  expect(plain.querySelector('button')).toBeNull(); expect(warnings()).toEqual([]);
  app!.unmount(); app = undefined;
  const host = mount(() => h(Chip, { onRemove: () => {} }, () => 'A'));
  expect(host.querySelector('button')!.hasAttribute('aria-label')).toBe(false);
  expect(warnings()).toHaveLength(1); expect(warnings()[0]).toMatch(/Chip/); expect(warnings()[0]).toMatch(/removeLabel/);
});

it('[FOCUS-04][feedback-status-12] removing the focused chip hands focus to the next chip, then the previous; the last chip leaves it to the application', async () => {
  const chips = ref(['a', 'b', 'c']);
  const removed: string[] = [];
  const host = mount(() => h('div', { class: 'hw-chips' }, chips.value.map(value => h(Chip, { key: value, removeLabel: `Remove ${value}`, onRemove: () => { removed.push(value); chips.value = chips.value.filter(item => item !== value); } }, () => value))));
  const button = (value: string) => host.querySelector<HTMLButtonElement>(`[aria-label="Remove ${value}"]`)!;
  button('b').focus(); button('b').click(); await nextTick();
  expect(document.activeElement).toBe(button('c'));
  button('c').click(); await nextTick();
  expect(document.activeElement).toBe(button('a'));
  button('a').click(); await nextTick();
  expect(removed).toEqual(['b', 'c', 'a']);
  expect(host.querySelector('.hw-chip')).toBeNull();
  expect(document.activeElement).toBe(document.body);
});

it('[SSR-03][feedback-status-12] no listener and no timer during the server render of a removable chip', async () => {
  vi.useFakeTimers();
  const add = vi.spyOn(EventTarget.prototype, 'addEventListener');
  try {
    const html = await renderToString(createSSRApp(defineComponent(() => () => h(Chip, { removeLabel: 'Remove', onRemove: () => {} }, () => 'A'))));
    expect(html).toContain('aria-label="Remove"');
    expect(vi.getTimerCount()).toBe(0);
    expect(add).not.toHaveBeenCalled();
  } finally { add.mockRestore(); }
});

it('[BADGE-01][feedback-status-14] ButtonGroup keeps an application aria-label; label writes aria-label on role=group', () => {
  const host = mount(() => h('div', [h(ButtonGroup, { label: 'Actions', variant: 'attached' }), h(ButtonGroup, { 'aria-label': 'Applied' })]));
  const [first, second] = [...host.querySelectorAll('.hw-button-group')];
  expect([first!.getAttribute('role'), first!.getAttribute('aria-label'), first!.getAttribute('data-variant'), first!.hasAttribute('data-orientation')]).toEqual(['group', 'Actions', 'attached', false]);
  expect(second!.getAttribute('aria-label')).toBe('Applied');
  expect(warnings()).toEqual([]);
});

it('[SHAPE-01][R20] the shared toast fixture renders the title in strong, the message in p and the dismiss name', () => {
  const host = mount(() => h(ToastRegion, { label: 'Notifications', messages: [{ id: 'saved', title: 'Draft saved', message: 'You can return later.', tone: 'success' }], getDismissLabel: (message: { title?: string }) => `Dismiss ${message.title}`, onDismiss: () => {} }));
  const content = host.querySelector('.hw-toast-content')!;
  expect(content.querySelector('strong')!.textContent).toBe('Draft saved');
  expect(content.querySelector('p')!.textContent).toBe('You can return later.');
  expect(host.querySelector('.hw-toast button')!.getAttribute('aria-label')).toBe('Dismiss Draft saved');
});

it('[BUTTON-01][actions-6] a button without type inside a form is type=button and does not submit; type=submit submits', () => {
  const submit = vi.fn((event: Event) => event.preventDefault());
  const host = mount(() => h('form', { onSubmit: submit }, [h(Button, { class: 'plain' }, () => 'Plain'), h(Button, { class: 'send', type: 'submit' }, () => 'Send')]));
  const plain = host.querySelector<HTMLButtonElement>('.plain')!;
  expect(plain.type).toBe('button');
  plain.click(); expect(submit).not.toHaveBeenCalled();
  host.querySelector<HTMLButtonElement>('.send')!.click(); expect(submit).toHaveBeenCalledOnce();
});

it('[BUTTON-02][actions-6] loading disables the button and sets aria-busy; clearing loading removes both', async () => {
  const loading = ref(true); const click = vi.fn(); const submit = vi.fn((event: Event) => event.preventDefault());
  const host = mount(() => h('form', { onSubmit: submit }, [h(Button, { type: 'submit', loading: loading.value, onClick: click }, () => 'Send')]));
  const button = host.querySelector('button')!;
  expect(button.disabled).toBe(true); expect(button.getAttribute('aria-busy')).toBe('true');
  button.click(); expect(click).not.toHaveBeenCalled(); expect(submit).not.toHaveBeenCalled();
  loading.value = false; await nextTick();
  expect(button.disabled).toBe(false); expect(button.hasAttribute('aria-busy')).toBe(false);
});
