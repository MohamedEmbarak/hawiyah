import { resetTextWarnings, type CopyResult } from '@hawiyah/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createCopyButton, enhance, type CopyButtonOptions } from '../src/index.js';

const texts = { label: 'نسخ الأمر', copiedMessage: 'تم النسخ', failedMessage: 'تعذّر النسخ' };
const icon = '<span class="hw-icon" data-icon="copy-01" aria-hidden="true"></span>';
const status = '<span class="hw-copy-message" role="status" aria-live="polite" aria-atomic="true"></span>';
const iconMarkup = (attributes = '', button = '') => `<span class="hw-copy" data-hw="copy-button"${attributes}><button type="button" class="hw-button hw-icon-button" data-variant="ghost" data-size="md"${button}>${icon}</button>${status}</span>`;
const textMarkup = (label: string, attributes = '') => `<span class="hw-copy" data-hw="copy-button"${attributes}><button type="button" class="hw-button" data-variant="ghost" data-size="md">${icon}${label}</button>${status}</span>`;
const mount = (html: string) => { document.body.insertAdjacentHTML('beforeend', html); return document.body.lastElementChild as HTMLElement; };
const parts = (root: HTMLElement) => ({ button: root.querySelector('button')!, icon: root.querySelector('.hw-icon')!, status: root.querySelector('.hw-copy-message')! });
let warn: ReturnType<typeof vi.spyOn>;
let clipboard: { writeText: ReturnType<typeof vi.fn>; readText: ReturnType<typeof vi.fn>; read: ReturnType<typeof vi.fn> };
const settle = async () => { for (let index = 0; index < 5; index++) await Promise.resolve(); };
function stubClipboard(writeText: (text: string) => Promise<void> = async () => {}) {
  clipboard = { writeText: vi.fn(writeText), readText: vi.fn(async () => ''), read: vi.fn(async () => []) };
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: clipboard });
}
function create(html = iconMarkup(), options: CopyButtonOptions = {}) {
  const root = mount(html);
  const results: CopyResult[] = [];
  const controller = createCopyButton(root, { text: 'pnpm add @hawiyah/vanilla', ...texts, onCopyResult: result => results.push(result), ...options });
  return { root, controller, results, ...parts(root) };
}
beforeEach(() => { resetTextWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); stubClipboard(); });
afterEach(() => {
  expect(warn.mock.calls.filter(([message]) => String(message).startsWith('Hawiyah:') && !expectedWarnings)).toEqual([]);
  expectedWarnings = false; warn.mockRestore(); vi.useRealTimers(); vi.unstubAllGlobals();
  delete (navigator as { clipboard?: unknown }).clipboard; document.body.replaceChildren();
});
let expectedWarnings = false;

describe('CopyButton', () => {
  it('[cb-idle-markup] renders the idle icon markup', () => {
    const { root, button, icon: span, status: message, controller } = create();
    expect(root.className).toBe('hw-copy'); expect(root.dataset.state).toBe('idle');
    expect(button.getAttribute('type')).toBe('button'); expect(button.className).toBe('hw-button hw-icon-button');
    expect(button.dataset.variant).toBe('ghost'); expect(button.dataset.size).toBe('md'); expect(button.getAttribute('aria-label')).toBe(texts.label);
    expect([...button.childNodes]).toEqual([span]); expect(span.getAttribute('data-icon')).toBe('copy-01'); expect(span.getAttribute('aria-hidden')).toBe('true');
    expect(message.getAttribute('role')).toBe('status'); expect(message.getAttribute('aria-live')).toBe('polite'); expect(message.getAttribute('aria-atomic')).toBe('true'); expect(message.textContent).toBe('');
    expect(controller.state).toBe('idle');
  });
  it('[cb-text-display] keeps the visible label after the icon and adds no aria-label', () => {
    const { button, icon: span } = create(textMarkup('Copy'));
    expect(button.classList.contains('hw-button')).toBe(true); expect(button.classList.contains('hw-icon-button')).toBe(false);
    expect(button.hasAttribute('aria-label')).toBe(false); expect(button.firstChild).toBe(span); expect(button.childNodes[1]!.nodeType).toBe(3); expect(button.childNodes[1]!.textContent).toBe('Copy');
  });
  it('[cb-variant-size] keeps the authored variant and size on the button', () => {
    const { button } = create(iconMarkup().replace('data-variant="ghost" data-size="md"', 'data-variant="outline" data-size="sm"'));
    expect(button.dataset.variant).toBe('outline'); expect(button.dataset.size).toBe('sm');
  });
  it('[cb-nothing-on-mount] touches no clipboard, text function or timer when created', () => {
    vi.useFakeTimers(); const value = vi.fn(() => 'x');
    const { controller } = create(iconMarkup(), { text: value });
    expect(value).not.toHaveBeenCalled(); expect(clipboard.writeText).not.toHaveBeenCalled(); expect(clipboard.readText).not.toHaveBeenCalled(); expect(clipboard.read).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0); controller.destroy();
  });
  it('[cb-copies-on-activation] writes the current text once and shows the copied state', async () => {
    let value = 'first'; const events: unknown[] = [];
    const { root, button, icon: span, status: message, results } = create(iconMarkup(), { text: () => value });
    root.addEventListener('hw:change', event => events.push((event as CustomEvent).detail));
    value = 'second'; button.click(); await settle();
    expect(clipboard.writeText).toHaveBeenCalledTimes(1); expect(clipboard.writeText).toHaveBeenCalledWith('second');
    expect(root.dataset.state).toBe('copied'); expect(span.getAttribute('data-icon')).toBe('tick-02'); expect(message.textContent).toBe(texts.copiedMessage);
    expect(results).toEqual([{ status: 'copied', text: 'second' }]); expect(events).toEqual([{ status: 'copied', text: 'second' }]);
  });
  it('[cb-native-button] keeps focus on the native button', async () => {
    const { button } = create();
    expect(button.localName).toBe('button'); expect(button.type).toBe('button');
    button.focus(); button.click(); await settle(); expect(document.activeElement).toBe(button);
  });
  it('[cb-timed-reset] returns to idle after the feedback duration', async () => {
    vi.useFakeTimers();
    for (const [duration, html] of [[3000, iconMarkup()], [500, iconMarkup(' data-hw-feedback-duration="500"')]] as const) {
      const { root, button, icon: span, status: message, controller } = create(html);
      button.click(); await settle(); expect(root.dataset.state).toBe('copied');
      await vi.advanceTimersByTimeAsync(duration - 1); expect(root.dataset.state).toBe('copied');
      await vi.advanceTimersByTimeAsync(1); expect(root.dataset.state).toBe('idle'); expect(span.getAttribute('data-icon')).toBe('copy-01'); expect(message.textContent).toBe('');
      controller.destroy();
    }
    const { root, button } = create(iconMarkup(), { feedbackDuration: 1200 });
    button.click(); await settle(); await vi.advanceTimersByTimeAsync(1200); expect(root.dataset.state).toBe('idle');
  });
  it('[cb-failures] shows the failed state for every failure until the next activation', async () => {
    vi.useFakeTimers();
    const denied = () => { const error = new Error('denied'); error.name = 'NotAllowedError'; return Promise.reject(error); };
    const cases: [string, () => void, string][] = [
      ['denied', () => stubClipboard(denied), 'x'], ['unavailable', () => { delete (navigator as { clipboard?: unknown }).clipboard; }, 'x'],
      ['failed', () => stubClipboard(() => Promise.reject(new Error('other'))), 'x'], ['empty', () => stubClipboard(), ''], ['empty', () => stubClipboard(), '  \n '],
    ];
    for (const [expected, setup, value] of cases) {
      setup();
      const { root, button, icon: span, status: message, results, controller } = create(iconMarkup(), { text: value });
      button.click(); await settle();
      expect(root.dataset.state).toBe('failed'); expect(span.getAttribute('data-icon')).toBe('alert-02'); expect(message.textContent).toBe(texts.failedMessage); expect(results.at(-1)!.status).toBe(expected);
      await vi.advanceTimersByTimeAsync(60_000); expect(root.dataset.state).toBe('failed');
      stubClipboard(); (controller as unknown as { destroy(): void }).destroy();
    }
    let value = '';
    const { root, button, status: message } = create(iconMarkup(), { text: () => value });
    button.click(); await settle(); expect(root.dataset.state).toBe('failed');
    value = 'ok'; button.click(); await settle(); expect(root.dataset.state).toBe('copied'); expect(message.textContent).toBe(texts.copiedMessage);
  });
  it('[cb-repeat-announces] empties the status before a repeated result', async () => {
    vi.useFakeTimers();
    let resolve!: () => void;
    const { root, button, status: message } = create();
    button.click(); await settle(); expect(message.textContent).toBe(texts.copiedMessage);
    clipboard.writeText.mockImplementationOnce(() => new Promise<void>(done => { resolve = done; }));
    await vi.advanceTimersByTimeAsync(2000);
    button.click(); await settle();
    expect(root.dataset.state).toBe('idle'); expect(message.textContent).toBe('');
    resolve(); await settle(); expect(root.dataset.state).toBe('copied'); expect(message.textContent).toBe(texts.copiedMessage);
    await vi.advanceTimersByTimeAsync(2999); expect(root.dataset.state).toBe('copied');
    await vi.advanceTimersByTimeAsync(1); expect(root.dataset.state).toBe('idle');
  });
  it('[cb-latest-wins] reports only the latest activation', async () => {
    const pending: (() => void)[] = [];
    stubClipboard(() => new Promise<void>(done => { pending.push(done); }));
    const { root, button, results } = create(iconMarkup(), { text: (() => { let count = 0; return () => `value ${++count}`; })() });
    button.click(); await settle(); button.click(); await settle();
    pending[1]!(); await settle(); pending[0]!(); await settle();
    expect(root.dataset.state).toBe('copied'); expect(results).toEqual([{ status: 'copied', text: 'value 2' }]);
  });
  it('[cb-destroy-pending] ignores a result after destroy and leaves no timer', async () => {
    vi.useFakeTimers();
    let resolve!: () => void; stubClipboard(() => new Promise<void>(done => { resolve = done; }));
    const events: unknown[] = [];
    const first = create(); first.root.addEventListener('hw:change', event => events.push(event));
    first.button.click(); await settle(); first.controller.destroy(); resolve(); await settle();
    expect(first.root.hasAttribute('data-state')).toBe(false); expect(first.results).toEqual([]); expect(events).toEqual([]);
    stubClipboard();
    const second = create(); second.button.click(); await settle(); expect(second.root.dataset.state).toBe('copied');
    second.controller.destroy(); expect(vi.getTimerCount()).toBe(0);
  });
  it('[cb-name-constant] keeps the accessible name in every state', async () => {
    vi.useFakeTimers();
    for (const html of [iconMarkup(), textMarkup('Copy')]) {
      let value = 'x';
      const { button, root, controller } = create(html, { text: () => value });
      const name = () => button.getAttribute('aria-label') ?? button.textContent;
      const idle = name(); button.click(); await settle(); expect(root.dataset.state).toBe('copied'); expect(name()).toBe(idle);
      value = ''; button.click(); await settle(); expect(root.dataset.state).toBe('failed'); expect(name()).toBe(idle);
      controller.destroy();
    }
  });
  it('[cb-disabled] does nothing when the button is disabled', async () => {
    for (const attribute of [' disabled', ' aria-disabled="true"']) {
      const { button, root, results } = create(iconMarkup('', attribute));
      button.click(); await settle();
      expect(clipboard.writeText).not.toHaveBeenCalled(); expect(results).toEqual([]); expect(root.dataset.state).toBe('idle');
    }
    expect(create(iconMarkup('', ' disabled')).button.hasAttribute('disabled')).toBe(true);
  });
  it('[cb-missing-text] renders nothing for a missing text and warns once', async () => {
    expectedWarnings = true;
    const count = (name: string) => warn.mock.calls.filter(([message]) => String(message).startsWith(`Hawiyah: CopyButton requires "${name}"`)).length;
    const icon = mount(iconMarkup()); createCopyButton(icon, { text: 'x', copiedMessage: 'c', failedMessage: 'f' });
    const text = mount(textMarkup('')); createCopyButton(text, { text: 'x', copiedMessage: 'c', failedMessage: 'f' });
    expect(icon.querySelector('button')!.hasAttribute('aria-label')).toBe(false); expect(text.querySelector('button')!.hasAttribute('aria-label')).toBe(false); expect(text.querySelector('button')!.textContent).toBe('');
    expect(count('label')).toBe(1);
    const copied = mount(iconMarkup()); createCopyButton(copied, { text: 'x', label: 'l', failedMessage: 'f' });
    expect(count('copiedMessage')).toBe(1);
    copied.querySelector('button')!.click(); await settle();
    expect(copied.dataset.state).toBe('copied'); expect(copied.querySelector('.hw-icon')!.getAttribute('data-icon')).toBe('tick-02'); expect(copied.querySelector('.hw-copy-message')!.textContent).toBe('');
    const failed = mount(iconMarkup()); createCopyButton(failed, { text: '', label: 'l', copiedMessage: 'c' });
    expect(count('failedMessage')).toBe(1);
    failed.querySelector('button')!.click(); await settle();
    expect(failed.dataset.state).toBe('failed'); expect(failed.querySelector('.hw-icon')!.getAttribute('data-icon')).toBe('alert-02'); expect(failed.querySelector('.hw-copy-message')!.textContent).toBe('');
    expect(count('copiedMessage')).toBe(1); expect(count('failedMessage')).toBe(1);
    warn.mockClear(); resetTextWarnings();
    const complete = create(); complete.button.click(); await settle();
    expect(warn.mock.calls.filter(([message]) => String(message).startsWith('Hawiyah:'))).toEqual([]);
  });
  it('[cb-server] creates without navigator and fails as unavailable', async () => {
    vi.stubGlobal('navigator', undefined);
    const { root, button, results } = create();
    button.click(); await settle();
    expect(root.dataset.state).toBe('failed'); expect(results).toEqual([{ status: 'unavailable', text: 'pnpm add @hawiyah/vanilla' }]);
  });
  it('[cb-vanilla-sources] reads texts and values from markup, the option winning', async () => {
    const source = mount('<pre id="install-command">pnpm add one</pre>');
    const attributes = ` data-hw-target="install-command" data-hw-label="${texts.label}" data-hw-copied-message="${texts.copiedMessage}" data-hw-failed-message="${texts.failedMessage}"`;
    const order: string[] = [];
    const root = mount(iconMarkup(attributes));
    const before = root.cloneNode(true);
    const controller = createCopyButton(root, { onCopyResult: () => order.push('option') });
    root.parentElement!.addEventListener('hw:change', event => order.push(`event:${JSON.stringify((event as CustomEvent).detail)}`));
    expect(root.querySelector('button')!.getAttribute('aria-label')).toBe(texts.label);
    source.textContent = 'pnpm add two'; root.querySelector('button')!.click(); await settle();
    expect(clipboard.writeText).toHaveBeenLastCalledWith('pnpm add two'); expect(root.querySelector('.hw-copy-message')!.textContent).toBe(texts.copiedMessage);
    expect(order).toEqual(['option', 'event:{"status":"copied","text":"pnpm add two"}']);
    controller.destroy(); expect(root.isEqualNode(before)).toBe(true);
    root.setAttribute('data-hw-text', 'from attribute'); const fromAttribute = createCopyButton(root);
    root.querySelector('button')!.click(); await settle(); expect(clipboard.writeText).toHaveBeenLastCalledWith('from attribute'); fromAttribute.destroy();
    const fromOption = createCopyButton(root, { text: 'from option' });
    root.querySelector('button')!.click(); await settle(); expect(clipboard.writeText).toHaveBeenLastCalledWith('from option'); fromOption.destroy();
    const named = mount(iconMarkup(attributes.replace(` data-hw-label="${texts.label}"`, ''), ' aria-label="Authored name"'));
    const authoredStatus = mount(`<span class="hw-copy" data-hw-text="x" data-hw-copied-message="c" data-hw-failed-message="f" data-hw-feedback-duration="10"><button aria-label="n">${icon}</button><span class="hw-copy-message">authored</span></span>`);
    const authoredBefore = authoredStatus.cloneNode(true);
    const kept = createCopyButton(named); expect(named.querySelector('button')!.getAttribute('aria-label')).toBe('Authored name'); kept.destroy();
    vi.useFakeTimers();
    const timed = createCopyButton(authoredStatus);
    const message = authoredStatus.querySelector('.hw-copy-message')!;
    expect(message.getAttribute('role')).toBe('status'); expect(message.getAttribute('aria-live')).toBe('polite'); expect(message.getAttribute('aria-atomic')).toBe('true'); expect(message.textContent).toBe('');
    expect(authoredStatus.querySelector('button')!.getAttribute('type')).toBe('button');
    authoredStatus.querySelector('button')!.click(); await settle(); expect(message.textContent).toBe('c');
    await vi.advanceTimersByTimeAsync(10); expect(authoredStatus.dataset.state).toBe('idle');
    timed.destroy(); expect(authoredStatus.isEqualNode(authoredBefore)).toBe(true);
    vi.useRealTimers();
    const enhanced = mount(iconMarkup(attributes)); const release = enhance(enhanced);
    expect(enhanced.dataset.state).toBe('idle'); enhanced.querySelector('button')!.click(); await settle(); expect(enhanced.dataset.state).toBe('copied');
    release(); expect(enhanced.hasAttribute('data-state')).toBe(false);
  });
});
