import { act, StrictMode } from 'react';
import type { ReactNode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { resetTextWarnings } from '@hawiyah/core';
import { CopyButton } from './src/index.js';
import type { CopyButtonProps, CopyResult } from './src/index.js';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const texts = { label: 'نسخ الأمر', copiedMessage: 'تم النسخ', failedMessage: 'تعذّر النسخ' };
let container: HTMLDivElement; let root: Root | undefined; let warn: ReturnType<typeof vi.spyOn>;
const warnings = () => (warn.mock.calls as unknown[][]).map(call => String(call[0])).filter(message => message.startsWith('Hawiyah:'));
type Writer = { writeText: ReturnType<typeof vi.fn>; readText: ReturnType<typeof vi.fn>; read: ReturnType<typeof vi.fn> };
function clipboard(writeText: (text: string) => Promise<void> = () => Promise.resolve()): Writer {
  const spy = { writeText: vi.fn(writeText), readText: vi.fn(() => Promise.resolve('')), read: vi.fn(() => Promise.resolve([])) };
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: spy });
  return spy;
}
function deferred() { let resolve!: () => void; let reject!: (error: unknown) => void; const promise = new Promise<void>((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; }
async function render(node: ReactNode) { root ??= createRoot(container); await act(async () => root!.render(node)); }
const rootElement = () => container.querySelector<HTMLElement>('.hw-copy')!;
const button = () => rootElement().querySelector('button')!;
const icon = () => button().querySelector('.hw-icon')!;
const status = () => rootElement().querySelector('.hw-copy-message')!;
async function activate() { await act(async () => { button().click(); }); }
const copy = (props: Partial<CopyButtonProps> = {}) => <CopyButton text="pnpm add @hawiyah/react" {...texts} {...props} />;

beforeEach(() => { resetTextWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined); container = document.createElement('div'); document.body.append(container); });
afterEach(async () => { if (root) await act(async () => root!.unmount()); root = undefined; container.remove(); delete (navigator as { clipboard?: unknown }).clipboard; warn.mockRestore(); vi.useRealTimers(); vi.restoreAllMocks(); });

it('[cb-idle-markup] renders the idle icon markup', async () => {
  clipboard(); await render(copy());
  expect(container.innerHTML).toBe('<span class="hw-copy" data-state="idle"><button type="button" class="hw-button hw-icon-button" data-variant="ghost" data-size="md" aria-label="نسخ الأمر"><span class="hw-icon" data-icon="copy-01" aria-hidden="true"></span></button><span class="hw-copy-message" role="status" aria-live="polite" aria-atomic="true"></span></span>');
  expect(button().childNodes).toHaveLength(1); expect(status().textContent).toBe(''); expect(warnings()).toEqual([]);
});
it('[cb-text-display] renders the label as text after the icon', async () => {
  clipboard(); await render(copy({ display: 'text' }));
  expect(button().className).toBe('hw-button'); expect(button().hasAttribute('aria-label')).toBe(false);
  expect(button().innerHTML).toBe('<span class="hw-icon" data-icon="copy-01" aria-hidden="true"></span>نسخ الأمر');
  expect(button().lastChild!.nodeType).toBe(Node.TEXT_NODE);
});
it('[cb-variant-size] writes variant and size to the button', async () => {
  clipboard(); await render(copy({ variant: 'secondary', size: 'sm', className: 'extra', style: { marginInlineStart: '4px' }, id: 'copy-command' }));
  expect(button().dataset.variant).toBe('secondary'); expect(button().dataset.size).toBe('sm');
  expect(rootElement().className).toBe('hw-copy extra'); expect(rootElement().style.marginInlineStart).toBe('4px'); expect(button().id).toBe('copy-command'); expect(button().hasAttribute('class')).toBe(true);
});
it('[cb-nothing-on-mount] touches neither the clipboard nor the text function on mount and re-render', async () => {
  vi.useFakeTimers(); const writer = clipboard(); const source = vi.fn(() => 'value');
  await render(<StrictMode>{copy({ text: source })}</StrictMode>); await render(<StrictMode>{copy({ text: source, variant: 'outline' })}</StrictMode>);
  expect(source).not.toHaveBeenCalled(); expect(writer.writeText).not.toHaveBeenCalled(); expect(writer.readText).not.toHaveBeenCalled(); expect(writer.read).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);
});
it('[cb-copies-on-activation] writes the current text once and reports the result', async () => {
  const writer = clipboard(); const results: CopyResult[] = []; let value = 'first';
  await render(copy({ text: () => value, onCopyResult: result => results.push(result) }));
  value = 'changed after mount'; await activate();
  expect(writer.writeText).toHaveBeenCalledTimes(1); expect(writer.writeText).toHaveBeenCalledWith('changed after mount');
  expect(rootElement().dataset.state).toBe('copied'); expect(icon().getAttribute('data-icon')).toBe('tick-02'); expect(status().textContent).toBe('تم النسخ');
  expect(results).toEqual([{ status: 'copied', text: 'changed after mount' }]);
});
it('[cb-native-button] is a native button that keeps focus', async () => {
  clipboard(); await render(copy());
  expect(button().tagName).toBe('BUTTON'); expect(button().getAttribute('type')).toBe('button');
  button().focus(); await activate(); expect(rootElement().dataset.state).toBe('copied'); expect(document.activeElement).toBe(button());
});
it('[cb-timed-reset] returns to idle after feedbackDuration', async () => {
  vi.useFakeTimers(); clipboard();
  await render(copy()); await activate();
  await act(async () => { await vi.advanceTimersByTimeAsync(2999); }); expect(rootElement().dataset.state).toBe('copied');
  await act(async () => { await vi.advanceTimersByTimeAsync(1); });
  expect(rootElement().dataset.state).toBe('idle'); expect(icon().getAttribute('data-icon')).toBe('copy-01'); expect(status().textContent).toBe('');
  await render(copy({ feedbackDuration: 500 })); await activate();
  await act(async () => { await vi.advanceTimersByTimeAsync(499); }); expect(rootElement().dataset.state).toBe('copied');
  await act(async () => { await vi.advanceTimersByTimeAsync(1); }); expect(rootElement().dataset.state).toBe('idle');
});
it.each([
  ['denied', (): void => { clipboard(() => Promise.reject(new DOMException('No', 'NotAllowedError'))); }, 'value'],
  ['unavailable', (): void => undefined, 'value'],
  ['failed', (): void => { clipboard(() => Promise.reject(new Error('broken'))); }, 'value'],
  ['empty', (): void => { clipboard(); }, '  '],
] as const)('[cb-failures] shows the failed state for %s until the next activation', async (reason, setup, value) => {
  vi.useFakeTimers(); setup(); const results: CopyResult[] = [];
  await render(copy({ text: value, onCopyResult: result => results.push(result) })); await activate();
  expect(rootElement().dataset.state).toBe('failed'); expect(icon().getAttribute('data-icon')).toBe('alert-02'); expect(status().textContent).toBe('تعذّر النسخ');
  expect(results.map(result => result.status)).toEqual([reason]);
  await act(async () => { await vi.advanceTimersByTimeAsync(60_000); }); expect(rootElement().dataset.state).toBe('failed');
  clipboard(); await render(copy({ text: 'ok', onCopyResult: result => results.push(result) })); await activate();
  expect(rootElement().dataset.state).toBe('copied'); expect(status().textContent).toBe('تم النسخ');
});
it('[cb-repeat-announces] empties the status before a repeated result', async () => {
  vi.useFakeTimers(); const pending = deferred(); let calls = 0;
  clipboard(() => (++calls === 1 ? Promise.resolve() : pending.promise));
  await render(copy()); await activate(); expect(status().textContent).toBe('تم النسخ');
  await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
  await activate(); expect(rootElement().dataset.state).toBe('idle'); expect(status().textContent).toBe('');
  await act(async () => { pending.resolve(); await pending.promise; });
  expect(rootElement().dataset.state).toBe('copied'); expect(status().textContent).toBe('تم النسخ');
  await act(async () => { await vi.advanceTimersByTimeAsync(2999); }); expect(rootElement().dataset.state).toBe('copied');
  await act(async () => { await vi.advanceTimersByTimeAsync(1); }); expect(rootElement().dataset.state).toBe('idle');
});
it('[cb-latest-wins] reports only the latest activation', async () => {
  const first = deferred(); const second = deferred(); const writes = [first, second]; const results: CopyResult[] = []; let count = 0;
  clipboard(() => writes[count++]!.promise);
  await render(copy({ text: () => `value ${count + 1}`, onCopyResult: result => results.push(result) }));
  await activate(); await activate();
  await act(async () => { second.resolve(); await second.promise; }); await act(async () => { first.resolve(); await first.promise; });
  expect(rootElement().dataset.state).toBe('copied'); expect(results).toEqual([{ status: 'copied', text: 'value 2' }]);
});
it('[cb-destroy-pending] ignores a result after unmount and leaves no timer', async () => {
  vi.useFakeTimers(); const pending = deferred(); const results: CopyResult[] = []; const error = vi.spyOn(console, 'error');
  clipboard(() => pending.promise);
  await render(copy({ onCopyResult: result => results.push(result) })); await activate();
  await act(async () => root!.unmount()); root = undefined;
  await act(async () => { pending.resolve(); await pending.promise; await vi.advanceTimersByTimeAsync(0); });
  expect(results).toEqual([]); expect(error).not.toHaveBeenCalled(); expect(warnings()).toEqual([]);
  clipboard(); await render(copy()); await activate(); expect(rootElement().dataset.state).toBe('copied');
  await act(async () => root!.unmount()); root = undefined; expect(vi.getTimerCount()).toBe(0);
});
it('[cb-name-constant] keeps the accessible name in every state', async () => {
  for (const display of ['icon', 'text'] as const) {
    const name = () => (display === 'icon' ? button().getAttribute('aria-label') : button().textContent);
    if (root) { await act(async () => root!.unmount()); root = undefined; }
    clipboard(); await render(copy({ display })); const idle = name();
    await activate(); expect(rootElement().dataset.state).toBe('copied'); expect(name()).toBe(idle);
    delete (navigator as { clipboard?: unknown }).clipboard; await activate(); expect(rootElement().dataset.state).toBe('failed'); expect(name()).toBe(idle);
    expect(idle).toBe('نسخ الأمر');
  }
});
it('[cb-disabled] writes nothing when disabled', async () => {
  const writer = clipboard(); const results: CopyResult[] = []; const onClick = vi.fn();
  await render(copy({ disabled: true, onClick, onCopyResult: result => results.push(result) }));
  expect(button().hasAttribute('disabled')).toBe(true); await activate();
  expect(writer.writeText).not.toHaveBeenCalled(); expect(results).toEqual([]); expect(rootElement().dataset.state).toBe('idle');
});
it('[cb-missing-text] renders nothing for a missing text and warns once', async () => {
  const Untyped = CopyButton as unknown as (props: Record<string, unknown>) => ReactNode;
  clipboard(); await render(<Untyped text="value" copiedMessage="تم" failedMessage="تعذّر" />);
  expect(button().hasAttribute('aria-label')).toBe(false);
  expect(warnings()).toEqual([expect.stringContaining('Hawiyah: CopyButton requires "label"')]);
  await act(async () => root!.unmount()); root = undefined; resetTextWarnings(); warn.mockClear();
  await render(<Untyped text="value" display="text" copiedMessage="تم" failedMessage="تعذّر" />);
  expect(button().innerHTML).toBe('<span class="hw-icon" data-icon="copy-01" aria-hidden="true"></span>');
  expect(warnings()).toEqual([expect.stringContaining('Hawiyah: CopyButton requires "label"')]);
  await act(async () => root!.unmount()); root = undefined; resetTextWarnings(); warn.mockClear();
  await render(<Untyped text="value" label="نسخ" failedMessage="تعذّر" />); await activate();
  expect(rootElement().dataset.state).toBe('copied'); expect(icon().getAttribute('data-icon')).toBe('tick-02'); expect(status().textContent).toBe('');
  expect(warnings()).toEqual([expect.stringContaining('Hawiyah: CopyButton requires "copiedMessage"')]);
  await act(async () => root!.unmount()); root = undefined; resetTextWarnings(); warn.mockClear();
  delete (navigator as { clipboard?: unknown }).clipboard;
  await render(<Untyped text="value" label="نسخ" copiedMessage="تم" />); await activate();
  expect(rootElement().dataset.state).toBe('failed'); expect(icon().getAttribute('data-icon')).toBe('alert-02'); expect(status().textContent).toBe('');
  expect(warnings()).toEqual([expect.stringContaining('Hawiyah: CopyButton requires "failedMessage"')]);
  await act(async () => root!.unmount()); root = undefined; resetTextWarnings(); warn.mockClear();
  clipboard(); await render(copy()); await activate(); expect(warnings()).toEqual([]);
});
it('[cb-server] renders the idle markup on the server and hydrates without a mismatch', async () => {
  const getter = vi.fn(() => undefined); Object.defineProperty(navigator, 'clipboard', { configurable: true, get: getter });
  const source = vi.fn(() => 'value'); const node = <CopyButton text={source} {...texts} />;
  const html = renderToString(node);
  expect(html).toBe('<span class="hw-copy" data-state="idle"><button type="button" class="hw-button hw-icon-button" data-variant="ghost" data-size="md" aria-label="نسخ الأمر"><span class="hw-icon" data-icon="copy-01" aria-hidden="true"></span></button><span class="hw-copy-message" role="status" aria-live="polite" aria-atomic="true"></span></span>');
  container.innerHTML = html; const serverButton = button(); const recoverable = vi.fn(); const error = vi.spyOn(console, 'error');
  await act(async () => { root = hydrateRoot(container, <StrictMode>{node}</StrictMode>, { onRecoverableError: recoverable }); });
  expect(recoverable).not.toHaveBeenCalled(); expect(error).not.toHaveBeenCalled(); expect(button()).toBe(serverButton); expect(container.innerHTML).toBe(html);
  expect(getter).not.toHaveBeenCalled(); expect(source).not.toHaveBeenCalled(); expect(warnings()).toEqual([]);
});
