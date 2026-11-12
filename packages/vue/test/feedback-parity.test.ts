// Feedback cases shared by the four adapters (milestone 3: service-patterns-12, -13, R05).
import { afterEach, beforeEach, expect, expectTypeOf, it, vi } from 'vitest';
import { createApp, createSSRApp, defineComponent, h, nextTick, ref, type App } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { resetTextWarnings, type FeedbackValue as CoreFeedbackValue } from '@hawiyah/core';
import { Feedback, type FeedbackValue } from '../src/index.js';

let app: App | undefined;
let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => { resetTextWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
afterEach(() => { app?.unmount(); app = undefined; document.body.replaceChildren(); warn.mockRestore(); });
const warnings = () => (warn.mock.calls as unknown[][]).map(call => String(call[0])).filter(message => message.startsWith('Hawiyah:'));
function mount(render: () => ReturnType<typeof h>) {
  const host = document.createElement('div'); document.body.append(host);
  app = createApp(defineComponent(() => render)); app.mount(host); return host;
}
const texts = { label: 'Was this page helpful?', yesLabel: 'Yes', noLabel: 'No', commentLabel: 'Tell us more', submitLabel: 'Send', successMessage: 'Thank you' };
const choice = (host: Element, text: string) => [...host.querySelectorAll<HTMLButtonElement>('.hw-feedback-actions > button')].find(button => button.textContent === text)!;
const submit = (host: Element) => host.querySelector<HTMLButtonElement>('.hw-feedback-comment > button')!;
const type = async (host: Element, text: string) => { const area = host.querySelector('textarea')!; area.value = text; area.dispatchEvent(new Event('input', { bubbles: true })); await nextTick(); };

it('[FEEDBACK-01][service-patterns-13] first render: a group labelled by the p, two pressed-state choices, no comment step, an empty status', () => {
  const host = mount(() => h(Feedback, texts));
  const root = host.querySelector('div.hw-feedback[role=group]')!;
  const question = root.firstElementChild!;
  expect(question.tagName).toBe('P'); expect(question.textContent).toBe('Was this page helpful?');
  expect(root.getAttribute('aria-labelledby')).toBe(question.id); expect(question.id).not.toBe('');
  expect(root.getAttribute('data-choice-variant')).toBe('text');
  const actions = root.querySelector(':scope > .hw-feedback-actions')!;
  expect(actions.hasAttribute('role')).toBe(false); expect(actions.hasAttribute('aria-label')).toBe(false);
  const buttons = [...actions.children];
  expect(buttons.map(button => [button.matches('button.hw-button[data-variant=secondary]'), button.getAttribute('aria-pressed'), button.querySelector('.hw-feedback-icon')!.getAttribute('data-icon'), button.querySelector('.hw-feedback-label')!.textContent])).toEqual([[true, 'false', 'thumbs-up', 'Yes'], [true, 'false', 'thumbs-down', 'No']]);
  expect(root.querySelector('textarea')).toBeNull();
  const status = root.querySelector('p[role=status]')!; expect(status.textContent).toBe('');
  expect(root.querySelector('form, fieldset, legend, input[type=radio], h2')).toBeNull();
});

it('[FEEDBACK-02][service-patterns-12][R05] choosing yes presses it, notifies once, shows the labelled comment step; yes again notifies nothing', async () => {
  const change = vi.fn();
  const host = mount(() => h(Feedback, { ...texts, 'onUpdate:modelValue': change }));
  choice(host, 'Yes').click(); await nextTick();
  expect(change).toHaveBeenCalledExactlyOnceWith({ helpful: true, comment: '' });
  expect(choice(host, 'Yes').getAttribute('aria-pressed')).toBe('true'); expect(choice(host, 'No').getAttribute('aria-pressed')).toBe('false');
  const area = host.querySelector<HTMLTextAreaElement>('.hw-feedback-comment textarea')!;
  expect(document.querySelector(`label[for="${area.id}"]`)!.textContent).toContain('Tell us more');
  expect(submit(host).textContent).toBe('Send');
  expect(host.querySelector('p[role=status]')!.textContent).toBe('');
  choice(host, 'Yes').click(); await nextTick();
  expect(change).toHaveBeenCalledOnce();
});

it('[FEEDBACK-03][service-patterns-12] typing then submit notifies feedback once and fills the status; a new choice empties it', async () => {
  const feedback = vi.fn(); const change = vi.fn();
  const host = mount(() => h(Feedback, { ...texts, onFeedback: feedback, 'onUpdate:modelValue': change }));
  choice(host, 'Yes').click(); await nextTick();
  await type(host, 'Thanks');
  submit(host).click(); await nextTick();
  expect(feedback).toHaveBeenCalledExactlyOnceWith({ helpful: true, comment: 'Thanks' });
  expect(host.querySelector('p[role=status]')!.textContent).toBe('Thank you');
  choice(host, 'No').click(); await nextTick();
  expect(host.querySelector('p[role=status]')!.textContent).toBe('');
  expect(change).toHaveBeenLastCalledWith({ helpful: false, comment: 'Thanks' });
});

it('[STATE-02][STATE-03][STATE-04][service-patterns-12] controlled value: the DOM follows the application only; changes from it do not notify; v-model round-trips', async () => {
  const change = vi.fn();
  const fixed = mount(() => h(Feedback, { ...texts, modelValue: { helpful: null, comment: '' }, 'onUpdate:modelValue': change }));
  choice(fixed, 'No').click(); await nextTick();
  expect(change).toHaveBeenCalledExactlyOnceWith({ helpful: false, comment: '' });
  expect(choice(fixed, 'No').getAttribute('aria-pressed')).toBe('false'); expect(fixed.querySelector('textarea')).toBeNull();
  app!.unmount(); app = undefined; change.mockClear();
  const value = ref<FeedbackValue>({ helpful: null, comment: '' });
  const host = mount(() => h(Feedback, { ...texts, modelValue: value.value, 'onUpdate:modelValue': (next: FeedbackValue) => { change(next); value.value = next; } }));
  value.value = { helpful: false, comment: 'From the application' }; await nextTick();
  expect(change).not.toHaveBeenCalled();
  expect(choice(host, 'No').getAttribute('aria-pressed')).toBe('true');
  expect(host.querySelector('textarea')!.value).toBe('From the application');
  choice(host, 'Yes').click(); await nextTick();
  expect(value.value).toEqual({ helpful: true, comment: 'From the application' });
  expect(choice(host, 'Yes').getAttribute('aria-pressed')).toBe('true');
});

it('[FEEDBACK-04][service-patterns-12] disabled disables every control and nothing notifies; DOM order is yes, no, textarea, submit', async () => {
  const change = vi.fn(); const feedback = vi.fn();
  const host = mount(() => h(Feedback, { ...texts, disabled: true, defaultValue: { helpful: true, comment: '' }, onFeedback: feedback, 'onUpdate:modelValue': change }));
  const controls = [...host.querySelectorAll<HTMLButtonElement | HTMLTextAreaElement>('button, textarea')];
  expect(controls.map(control => control.tagName === 'TEXTAREA' ? 'textarea' : control.textContent)).toEqual(['Yes', 'No', 'textarea', 'Send']);
  expect(controls.every(control => control.disabled)).toBe(true);
  for (const control of controls) control.click();
  await nextTick();
  expect(change).not.toHaveBeenCalled(); expect(feedback).not.toHaveBeenCalled();
  app!.unmount(); app = undefined;
  const live = mount(() => h(Feedback, texts));
  choice(live, 'Yes').focus(); choice(live, 'Yes').click(); await nextTick();
  expect(document.activeElement).toBe(choice(live, 'Yes'));
});

it('[TEXT-01][NAME-02][service-patterns-13] each missing text renders nothing in its place and warns once naming Feedback; aria-label alone needs no label', async () => {
  for (const name of Object.keys(texts) as (keyof typeof texts)[]) {
    resetTextWarnings(); warn.mockClear(); app?.unmount(); app = undefined; document.body.replaceChildren();
    const host = mount(() => h(Feedback, { ...texts, [name]: undefined, defaultValue: { helpful: true, comment: '' } } as never));
    if (name === 'successMessage') { submit(host).click(); await nextTick(); expect(host.querySelector('p[role=status]')!.textContent).toBe(''); }
    if (name === 'label') { expect(host.querySelector('.hw-feedback > p:not([role])')).toBeNull(); expect(host.querySelector('.hw-feedback')!.hasAttribute('aria-labelledby')).toBe(false); }
    if (name === 'submitLabel') expect(submit(host).textContent).toBe('');
    if (name === 'yesLabel') expect(choice(host, '')).toBeDefined();
    const own = warnings().filter(message => message.includes('Feedback'));
    expect(own, name).toHaveLength(1); expect(own[0]).toContain(name);
  }
  resetTextWarnings(); warn.mockClear(); app?.unmount(); app = undefined;
  const named = mount(() => h(Feedback, { ...texts, label: undefined, 'aria-label': 'Page feedback' }));
  expect(named.querySelector('.hw-feedback')!.getAttribute('aria-label')).toBe('Page feedback');
  expect(named.querySelector('.hw-feedback')!.hasAttribute('aria-labelledby')).toBe(false);
  expect(warnings()).toEqual([]);
});

it('[SHAPE-03][service-patterns-12] Vue: FeedbackValue is the core type, readonly is gone, @submit is replaced by @feedback', () => {
  expectTypeOf<FeedbackValue>().toEqualTypeOf<CoreFeedbackValue>();
  expectTypeOf<InstanceType<typeof Feedback>['$props']['modelValue']>().toEqualTypeOf<FeedbackValue | undefined>();
  expect(Object.keys(Feedback.props)).not.toContain('readonly');
  expect(Object.keys(Feedback.emits as object)).toEqual(['update:modelValue', 'feedback']);
});

it('[SSR-01][service-patterns-13] server HTML without a choice and with {helpful: false, comment: "x"} equals the first client render', async () => {
  const render = () => h('div', [h(Feedback, texts), h(Feedback, { ...texts, modelValue: { helpful: false, comment: 'x' } })]);
  const html = await renderToString(createSSRApp(defineComponent(() => render)));
  const host = document.createElement('div'); host.innerHTML = html; document.body.append(host); const server = host.innerHTML;
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  app = createSSRApp(defineComponent(() => render)); app.mount(host); await nextTick();
  // data-hw-filled is the presence marker the textarea gains after mount, not part of the server HTML.
  expect(host.innerHTML.replace(' data-hw-filled="true"', '')).toBe(server);
  expect(host.querySelectorAll('textarea')).toHaveLength(1);
  expect([...warn.mock.calls, ...errors.mock.calls].map(call => String(call[0])).filter(message => /hydration/i.test(message))).toEqual([]);
  errors.mockRestore();
});
