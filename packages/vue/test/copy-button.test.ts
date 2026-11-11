import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createApp, createSSRApp, h, nextTick, ref } from 'vue';
import type { App, Component } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { resetTextWarnings } from '@hawiyah/core';
import type { CopyResult } from '../src/index.js';
import { CopyButton } from '../src/index.js';

// Application text: Hawiyah ships none.
const texts = { label: 'نسخ الرمز', copiedMessage: 'تم النسخ', failedMessage: 'تعذر النسخ، انسخ النص يدويا' } as const;
const loose = (component: unknown) => component as Component;
const apps: App[] = [];
let warn: ReturnType<typeof vi.spyOn>; let error: ReturnType<typeof vi.spyOn>;
const warnings = () => (warn.mock.calls as unknown[][]).map(call => String(call[0])).filter(message => message.startsWith('Hawiyah:'));
function mount(render: () => ReturnType<typeof h>) { const root = document.createElement('div'); document.body.append(root); const app = createApp({ render }); apps.push(app); app.mount(root); return { root, app }; }
const flush = async () => { for (let index = 0; index < 10; index += 1) await Promise.resolve(); await nextTick(); };
function deferred() { let resolve!: () => void; let reject!: (reason: unknown) => void; const promise = new Promise<void>((done, fail) => { resolve = done; reject = fail; }); return { promise, resolve, reject }; }
function clipboard(write: (text: string) => Promise<void> = async () => {}) {
  const spy = { writeText: vi.fn(write), readText: vi.fn(async () => ''), read: vi.fn(async () => []) };
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: spy }); return spy;
}
const parts = (root: Element) => ({ copy: root.querySelector<HTMLElement>('.hw-copy')!, button: root.querySelector<HTMLButtonElement>('button')!, icon: root.querySelector<HTMLElement>('.hw-icon')!, status: root.querySelector<HTMLElement>('.hw-copy-message')! });

beforeEach(() => { resetTextWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); error = vi.spyOn(console, 'error').mockImplementation(() => {}); });
afterEach(() => { apps.splice(0).forEach(app => app.unmount()); document.body.replaceChildren(); delete (navigator as unknown as Record<string, unknown>).clipboard; vi.useRealTimers(); vi.restoreAllMocks(); });

it('[cb-idle-markup] renders the idle icon markup with an empty status', () => {
  const { root } = mount(() => h(CopyButton, { text: 'npm i @hawiyah/vue', ...texts }));
  const { copy, button, icon, status } = parts(root);
  expect(copy.tagName).toBe('SPAN'); expect(copy.className).toBe('hw-copy'); expect(copy.getAttribute('data-state')).toBe('idle');
  expect(copy.children).toHaveLength(2); expect(copy.firstElementChild).toBe(button); expect(copy.lastElementChild).toBe(status);
  expect(button.getAttribute('type')).toBe('button'); expect(button.className).toBe('hw-button hw-icon-button');
  expect(button.getAttribute('data-variant')).toBe('ghost'); expect(button.getAttribute('data-size')).toBe('md'); expect(button.getAttribute('aria-label')).toBe(texts.label);
  expect(button.childNodes).toHaveLength(1); expect(button.firstChild).toBe(icon);
  expect(icon.tagName).toBe('SPAN'); expect(icon.getAttribute('data-icon')).toBe('copy-01'); expect(icon.getAttribute('aria-hidden')).toBe('true');
  for (const name of ['aria-pressed', 'aria-busy', 'aria-describedby', 'title', 'disabled', 'id']) expect(button.hasAttribute(name)).toBe(false);
  expect(status.tagName).toBe('SPAN'); expect(status.getAttribute('role')).toBe('status'); expect(status.getAttribute('aria-live')).toBe('polite'); expect(status.getAttribute('aria-atomic')).toBe('true');
  expect(status.textContent).toBe(''); expect(root.querySelector('[id]')).toBeNull(); expect(warnings()).toEqual([]);
});
it('[cb-text-display] shows the label as a text node after the icon', () => {
  const { root } = mount(() => h(CopyButton, { text: 'value', display: 'text', ...texts }));
  const { button, icon } = parts(root);
  expect(button.className).toBe('hw-button'); expect(button.hasAttribute('aria-label')).toBe(false);
  expect(button.childNodes).toHaveLength(2); expect(button.childNodes[0]).toBe(icon);
  expect(button.childNodes[1]!.nodeType).toBe(Node.TEXT_NODE); expect(button.childNodes[1]!.textContent).toBe(texts.label);
});
it('[cb-variant-size] writes variant and size to the button', () => {
  const { root } = mount(() => h(CopyButton, { text: 'value', variant: 'outline', size: 'sm', ...texts }));
  expect(parts(root).button.getAttribute('data-variant')).toBe('outline'); expect(parts(root).button.getAttribute('data-size')).toBe('sm');
});
it('[cb-nothing-on-mount] touches neither the clipboard nor the text function before an activation', async () => {
  vi.useFakeTimers(); const spy = clipboard(); const text = vi.fn(() => 'value'); const variant = ref<'ghost' | 'outline'>('ghost');
  mount(() => h(CopyButton, { text, variant: variant.value, ...texts }));
  variant.value = 'outline'; await nextTick();
  expect(spy.writeText).not.toHaveBeenCalled(); expect(spy.readText).not.toHaveBeenCalled(); expect(spy.read).not.toHaveBeenCalled();
  expect(text).not.toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0);
});
it('[cb-copies-on-activation] writes the current text once and reports the result', async () => {
  const spy = clipboard(); const results: CopyResult[] = []; let value = 'first';
  const { root } = mount(() => h(CopyButton, { text: () => value, ...texts, onCopyResult: (result: CopyResult) => results.push(result) }));
  value = 'pnpm add @hawiyah/vue\n  --save'; parts(root).button.click(); await flush();
  expect(spy.writeText).toHaveBeenCalledTimes(1); expect(spy.writeText).toHaveBeenCalledWith(value);
  const { copy, icon, status } = parts(root);
  expect(copy.getAttribute('data-state')).toBe('copied'); expect(icon.getAttribute('data-icon')).toBe('tick-02'); expect(status.textContent).toBe(texts.copiedMessage);
  expect(results).toEqual([{ status: 'copied', text: value }]);
});
it('[cb-native-button] keeps focus on the native button', async () => {
  clipboard(); const { root } = mount(() => h(CopyButton, { text: 'value', ...texts }));
  const { button } = parts(root); expect(button.tagName).toBe('BUTTON'); expect(button.type).toBe('button');
  button.focus(); button.click(); await flush();
  expect(parts(root).copy.getAttribute('data-state')).toBe('copied'); expect(document.activeElement).toBe(button);
});
it('[cb-timed-reset] returns to idle after the feedback duration', async () => {
  vi.useFakeTimers(); clipboard();
  for (const duration of [undefined, 1200]) {
    const { root, app } = mount(() => h(CopyButton, { text: 'value', ...texts, ...(duration ? { feedbackDuration: duration } : {}) }));
    parts(root).button.click(); await vi.advanceTimersByTimeAsync(0); await nextTick();
    expect(parts(root).copy.getAttribute('data-state')).toBe('copied');
    await vi.advanceTimersByTimeAsync((duration ?? 3000) - 1); await nextTick(); expect(parts(root).copy.getAttribute('data-state')).toBe('copied');
    await vi.advanceTimersByTimeAsync(1); await nextTick();
    const { copy, icon, status } = parts(root);
    expect(copy.getAttribute('data-state')).toBe('idle'); expect(icon.getAttribute('data-icon')).toBe('copy-01'); expect(status.textContent).toBe('');
    app.unmount(); root.remove();
  }
});
it('[cb-failures] shows the failure message for every failed status until the next activation', async () => {
  vi.useFakeTimers();
  const cases: { status: string; text: string; install: () => void }[] = [
    { status: 'denied', text: 'value', install: () => { clipboard(() => Promise.reject(new DOMException('Denied', 'NotAllowedError'))); } },
    { status: 'unavailable', text: 'value', install: () => { delete (navigator as unknown as Record<string, unknown>).clipboard; } },
    { status: 'failed', text: 'value', install: () => { clipboard(() => Promise.reject(new Error('Write failed'))); } },
    { status: 'empty', text: '', install: () => { clipboard(); } },
    { status: 'empty', text: '   \n', install: () => { clipboard(); } },
  ];
  for (const item of cases) {
    item.install(); const results: CopyResult[] = []; let value = item.text;
    const { root, app } = mount(() => h(CopyButton, { text: () => value, ...texts, onCopyResult: (result: CopyResult) => results.push(result) }));
    parts(root).button.click(); await vi.advanceTimersByTimeAsync(0); await nextTick();
    const check = () => { const { copy, icon, status } = parts(root); expect(copy.getAttribute('data-state')).toBe('failed'); expect(icon.getAttribute('data-icon')).toBe('alert-02'); expect(status.textContent).toBe(texts.failedMessage); };
    check(); expect(results).toEqual([{ status: item.status, text: item.text }]);
    await vi.advanceTimersByTimeAsync(60_000); await nextTick(); check();
    clipboard(); value = 'value'; parts(root).button.click(); await vi.advanceTimersByTimeAsync(0); await nextTick();
    expect(parts(root).copy.getAttribute('data-state')).toBe('copied'); expect(parts(root).status.textContent).toBe(texts.copiedMessage);
    app.unmount(); root.remove();
  }
  expect(warnings()).toEqual([]);
});
it('[cb-repeat-announces] empties the status before a repeated result and restarts the duration', async () => {
  vi.useFakeTimers(); let pending: ReturnType<typeof deferred> | undefined;
  clipboard(() => pending ? pending.promise : Promise.resolve());
  const { root } = mount(() => h(CopyButton, { text: 'value', ...texts }));
  parts(root).button.click(); await vi.advanceTimersByTimeAsync(0); await nextTick();
  expect(parts(root).status.textContent).toBe(texts.copiedMessage);
  await vi.advanceTimersByTimeAsync(2000);
  pending = deferred(); parts(root).button.click(); await nextTick();
  expect(parts(root).copy.getAttribute('data-state')).toBe('idle'); expect(parts(root).status.textContent).toBe('');
  pending.resolve(); await vi.advanceTimersByTimeAsync(0); await nextTick();
  expect(parts(root).copy.getAttribute('data-state')).toBe('copied'); expect(parts(root).status.textContent).toBe(texts.copiedMessage);
  await vi.advanceTimersByTimeAsync(2999); await nextTick(); expect(parts(root).copy.getAttribute('data-state')).toBe('copied');
  await vi.advanceTimersByTimeAsync(1); await nextTick(); expect(parts(root).copy.getAttribute('data-state')).toBe('idle');
});
it('[cb-latest-wins] keeps only the latest activation', async () => {
  const writes = [deferred(), deferred()]; let index = 0; clipboard(() => writes[index++]!.promise);
  const results: CopyResult[] = [];
  const { root } = mount(() => h(CopyButton, { text: 'value', ...texts, onCopyResult: (result: CopyResult) => results.push(result) }));
  parts(root).button.click(); parts(root).button.click(); await flush();
  writes[1]!.reject(new Error('Second failed')); await flush(); writes[0]!.resolve(); await flush();
  expect(parts(root).copy.getAttribute('data-state')).toBe('failed'); expect(results).toEqual([{ status: 'failed', text: 'value' }]);
});
it('[cb-destroy-pending] ignores a result after unmount and leaves no timer', async () => {
  const pending = deferred(); clipboard(() => pending.promise); const results: CopyResult[] = [];
  const first = mount(() => h(CopyButton, { text: 'value', ...texts, onCopyResult: (result: CopyResult) => results.push(result) }));
  parts(first.root).button.click(); await flush(); first.app.unmount();
  pending.resolve(); await flush();
  expect(results).toEqual([]); expect(warn).not.toHaveBeenCalled(); expect(error).not.toHaveBeenCalled();
  vi.useFakeTimers(); clipboard();
  const second = mount(() => h(CopyButton, { text: 'value', ...texts }));
  parts(second.root).button.click(); await vi.advanceTimersByTimeAsync(0); await nextTick();
  expect(parts(second.root).copy.getAttribute('data-state')).toBe('copied'); expect(vi.getTimerCount()).toBe(1);
  second.app.unmount(); expect(vi.getTimerCount()).toBe(0);
});
it('[cb-name-constant] keeps the accessible name in every state', async () => {
  let fail = false; clipboard(() => fail ? Promise.reject(new Error('x')) : Promise.resolve());
  const { root } = mount(() => h('div', [h(CopyButton, { text: 'value', ...texts }), h(CopyButton, { text: 'value', display: 'text', ...texts })]));
  const [icon, text] = [...root.querySelectorAll('button')] as HTMLButtonElement[];
  const names = () => [icon!.getAttribute('aria-label'), text!.textContent];
  expect(names()).toEqual([texts.label, texts.label]);
  icon!.click(); text!.click(); await flush(); expect(root.querySelectorAll('[data-state="copied"]')).toHaveLength(2); expect(names()).toEqual([texts.label, texts.label]);
  fail = true; icon!.click(); text!.click(); await flush(); expect(root.querySelectorAll('[data-state="failed"]')).toHaveLength(2); expect(names()).toEqual([texts.label, texts.label]);
});
it('[cb-disabled] writes the native disabled attribute and copies nothing', async () => {
  const spy = clipboard(); const results: CopyResult[] = [];
  const { root } = mount(() => h(CopyButton, { text: 'value', disabled: true, ...texts, onCopyResult: (result: CopyResult) => results.push(result) }));
  const { button } = parts(root); expect(button.disabled).toBe(true); expect(button.hasAttribute('aria-disabled')).toBe(false);
  button.click(); await flush();
  expect(spy.writeText).not.toHaveBeenCalled(); expect(results).toEqual([]); expect(parts(root).copy.getAttribute('data-state')).toBe('idle');
});
it('[cb-missing-text] renders nothing in place of a missing text and warns once', async () => {
  const { root } = mount(() => h('div', [h(loose(CopyButton), { text: 'value', copiedMessage: texts.copiedMessage, failedMessage: texts.failedMessage }), h(loose(CopyButton), { text: 'value', display: 'text', copiedMessage: texts.copiedMessage, failedMessage: texts.failedMessage })]));
  const [icon, text] = [...root.querySelectorAll('button')] as HTMLButtonElement[];
  expect(icon!.hasAttribute('aria-label')).toBe(false); expect(text!.hasAttribute('aria-label')).toBe(false);
  expect([...text!.childNodes].filter(node => node.nodeType !== Node.COMMENT_NODE)).toEqual([text!.querySelector('.hw-icon')]); expect(text!.textContent).toBe('');
  expect(warnings()).toEqual([expect.stringContaining('CopyButton requires "label"')]);
  for (const [name, fail] of [['copiedMessage', false], ['failedMessage', true]] as const) {
    resetTextWarnings(); warn.mockClear(); clipboard(() => fail ? Promise.reject(new Error('x')) : Promise.resolve());
    const props: Record<string, unknown> = { text: 'value', ...texts }; delete props[name];
    const { root: missing } = mount(() => h(loose(CopyButton), props));
    expect(warnings()).toEqual([expect.stringContaining(`CopyButton requires "${name}"`)]);
    parts(missing).button.click(); await flush();
    expect(parts(missing).copy.getAttribute('data-state')).toBe(fail ? 'failed' : 'copied'); expect(parts(missing).icon.getAttribute('data-icon')).toBe(fail ? 'alert-02' : 'tick-02'); expect(parts(missing).status.textContent).toBe('');
    expect(warnings()).toHaveLength(1);
  }
  resetTextWarnings(); warn.mockClear(); clipboard();
  const { root: complete } = mount(() => h(CopyButton, { text: 'value', ...texts })); parts(complete).button.click(); await flush();
  expect(warnings()).toEqual([]);
});
it('[cb-server] renders the idle markup on the server and hydrates without a mismatch', async () => {
  const read = vi.fn(() => undefined); Object.defineProperty(navigator, 'clipboard', { configurable: true, get: read });
  const text = vi.fn(() => 'value');
  const application = { render: () => h('main', [h(CopyButton, { text, ...texts }), h(CopyButton, { text, display: 'text', ...texts })]) };
  const markup = await renderToString(createSSRApp(application));
  expect(read).not.toHaveBeenCalled(); expect(text).not.toHaveBeenCalled();
  const container = document.createElement('div'); container.innerHTML = markup; document.body.append(container);
  for (const copy of container.querySelectorAll('.hw-copy')) { expect(copy.getAttribute('data-state')).toBe('idle'); expect(copy.querySelector('.hw-copy-message')!.textContent).toBe(''); expect(copy.querySelector('[data-icon]')!.getAttribute('data-icon')).toBe('copy-01'); }
  expect(container.querySelector('button')!.getAttribute('aria-label')).toBe(texts.label);
  const before = container.innerHTML; const buttons = [...container.querySelectorAll('button')];
  const app = createSSRApp(application); apps.push(app); app.mount(container); await nextTick();
  expect(warn).not.toHaveBeenCalled(); expect(error).not.toHaveBeenCalled();
  expect(container.innerHTML).toBe(before); expect([...container.querySelectorAll('button')]).toEqual(buttons);
  expect(read).not.toHaveBeenCalled(); expect(text).not.toHaveBeenCalled();
});
