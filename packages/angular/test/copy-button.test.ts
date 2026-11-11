import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, describe, expect, it, vi, type Mock } from 'vitest';
import type { CopyResult } from '@hawiyah/angular';
import { attributesOf, contentOf, page } from './fixtures/page';
import { missingTextWarnings } from './fixtures/texts';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); delete (navigator as { clipboard?: unknown }).clipboard; vi.useRealTimers(); vi.restoreAllMocks(); });

const texts = 'label="Copy the command" copiedMessage="Copied" failedMessage="Copy failed. Select the text and copy it."';
const failedMessage = 'Copy failed. Select the text and copy it.';
/** A spy clipboard. jsdom has none, which is the "unavailable" case. */
interface ClipboardSpy { writeText: Mock<(text: string) => Promise<void>>; readText: Mock<() => Promise<string>>; read: Mock<() => Promise<never[]>> }
function clipboard(writeText: (text: string) => Promise<void> = async () => {}): ClipboardSpy {
  const spy = { writeText: vi.fn(writeText), readText: vi.fn(async () => ''), read: vi.fn(async () => []) };
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: spy });
  return spy;
}
function deferred() { let resolve!: () => void, reject!: (reason: unknown) => void; const promise = new Promise<void>((done, fail) => { resolve = done; reject = fail; }); return { promise, resolve, reject }; }
/** Lets an awaited write reach the component. The component renders its own state: no test here asks Angular to. */
const settle = async () => { for (let turn = 0; turn < 12; turn++) await Promise.resolve(); };
function parts(root: HTMLElement, index = 0) {
  const host = root.querySelectorAll<HTMLElement>('hw-copy-button')[index]!;
  return { host, button: host.querySelector<HTMLButtonElement>(':scope > button')!, icon: host.querySelector<HTMLElement>(':scope > button > .hw-icon')!, status: host.querySelector<HTMLElement>(':scope > .hw-copy-message')! };
}
const shown = (root: HTMLElement, index = 0) => { const { host, icon, status } = parts(root, index); return [host.getAttribute('data-state'), icon.getAttribute('data-icon'), status.textContent]; };
const about = (warnings: string[], name: string) => warnings.filter(warning => warning.startsWith(`Hawiyah: hw-copy-button requires "${name}"`));

describe('hw-copy-button', () => {
  it('[cb-idle-markup] renders the idle markup on the host: a ghost icon button and an empty polite status', () => {
    const { root } = page(`<hw-copy-button text="pnpm add @hawiyah/angular" ${texts} />`);
    const { host, button, icon, status } = parts(root);
    // Angular also leaves the static inputs of the page template on the host; class and data-state are the component's own.
    expect(host.className).toBe('hw-copy'); expect(host.getAttribute('data-state')).toBe('idle'); expect(host.hasAttribute('role')).toBe(false);
    expect(attributesOf(button)).toEqual({ type: 'button', class: 'hw-button hw-icon-button', 'data-variant': 'ghost', 'data-size': 'md', 'aria-label': 'Copy the command' });
    expect(contentOf(button)).toEqual([icon]); expect(attributesOf(icon)).toEqual({ class: 'hw-icon', 'data-icon': 'copy-01', 'aria-hidden': 'true' });
    expect(attributesOf(status)).toEqual({ class: 'hw-copy-message', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' }); expect(status.childNodes).toHaveLength(0);
    // The host is the root: there is no inner span.hw-copy, and no id anywhere.
    expect([...host.children]).toEqual([button, status]); expect(host.querySelector('.hw-copy, [id]')).toBeNull();
  });

  it('[cb-text-display] shows the label as text after the icon, without an aria-label', () => {
    const { root } = page(`<hw-copy-button text="value" display="text" ${texts} />`);
    const { button, icon } = parts(root);
    expect(attributesOf(button)).toEqual({ type: 'button', class: 'hw-button', 'data-variant': 'ghost', 'data-size': 'md' });
    const content = contentOf(button);
    expect(content).toHaveLength(2); expect(content[0]).toBe(icon); expect(content[1]!.nodeType).toBe(Node.TEXT_NODE); expect(content[1]!.textContent).toBe('Copy the command');
    expect(icon.getAttribute('data-icon')).toBe('copy-01');
  });

  it('[cb-variant-size] writes variant and size to the button', () => {
    const { root } = page(`<hw-copy-button text="value" variant="primary" size="sm" ${texts} /><hw-copy-button text="value" display="text" variant="outline" size="lg" ${texts} />`);
    expect([parts(root).button.dataset.variant, parts(root).button.dataset.size]).toEqual(['primary', 'sm']);
    expect([parts(root, 1).button.dataset.variant, parts(root, 1).button.dataset.size]).toEqual(['outline', 'lg']);
  });

  it('[cb-nothing-on-mount] touches neither the clipboard nor the text function before an activation and starts no timer', async () => {
    vi.useFakeTimers();
    const spy = clipboard(); const read = vi.fn(() => 'value');
    const { update } = page(`<hw-copy-button [text]="read" [label]="label" copiedMessage="Copied" failedMessage="Failed" [variant]="variant" />`, { read, label: 'Copy', variant: 'ghost' });
    update({ label: 'Copy the value', variant: 'primary' }); update();
    await settle(); await vi.advanceTimersByTimeAsync(200);
    expect(read).not.toHaveBeenCalled(); expect(spy.writeText).not.toHaveBeenCalled(); expect(spy.readText).not.toHaveBeenCalled(); expect(spy.read).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('[cb-copies-on-activation] writes the text once, reading the function form at activation, then shows and reports the result', async () => {
    const spy = clipboard(); const source = { value: 'first' }; const results: CopyResult[] = [];
    const { root } = page(`<hw-copy-button [text]="read" ${texts} (copyResult)="results.push($event)" /><hw-copy-button text="  indented\n" ${texts} (copyResult)="results.push($event)" />`, { read: () => source.value, results });
    source.value = 'second';
    parts(root).button.click(); await settle();
    expect(spy.writeText.mock.calls).toEqual([['second']]);
    expect(shown(root)).toEqual(['copied', 'tick-02', 'Copied']); expect(results).toEqual([{ status: 'copied', text: 'second' }]);
    // A string is written as given, without trimming.
    parts(root, 1).button.click(); await settle();
    expect(spy.writeText.mock.calls).toEqual([['second'], ['  indented\n']]); expect(results).toHaveLength(2); expect(results[1]).toEqual({ status: 'copied', text: '  indented\n' });
    expect(spy.readText).not.toHaveBeenCalled(); expect(spy.read).not.toHaveBeenCalled();
  });

  it('[cb-native-button] is a native button that keeps focus through the result', async () => {
    clipboard();
    const { root } = page(`<hw-copy-button text="value" ${texts} />`);
    const { button } = parts(root);
    expect(button.localName).toBe('button'); expect(button.getAttribute('type')).toBe('button'); expect(button.tabIndex).toBe(0);
    button.focus(); button.click(); await settle();
    expect(shown(root)[0]).toBe('copied'); expect(document.activeElement).toBe(button);
  });

  it('[cb-timed-reset] returns to idle after feedbackDuration, 3000 by default', async () => {
    vi.useFakeTimers(); clipboard();
    const { root } = page(`<hw-copy-button text="value" ${texts} /><hw-copy-button text="value" feedbackDuration="500" ${texts} /><hw-copy-button text="value" [feedbackDuration]="0" ${texts} />`);
    for (const [index, duration] of [[0, 3000], [1, 500], [2, 3000]] as const) {
      parts(root, index).button.click(); await settle();
      expect(shown(root, index)).toEqual(['copied', 'tick-02', 'Copied']);
      await vi.advanceTimersByTimeAsync(duration - 1); expect(shown(root, index)).toEqual(['copied', 'tick-02', 'Copied']);
      await vi.advanceTimersByTimeAsync(1); expect(shown(root, index)).toEqual(['idle', 'copy-01', '']);
    }
  });

  it.each([
    ['denied', 'value', (): ClipboardSpy | undefined => clipboard(async () => { throw new DOMException('Write permission denied', 'NotAllowedError'); })],
    ['unavailable', 'value', (): ClipboardSpy | undefined => undefined],
    ['failed', 'value', (): ClipboardSpy | undefined => clipboard(async () => { throw new Error('boom'); })],
    ['empty', '', () => clipboard()],
    ['empty', ' \n\t', () => clipboard()],
  ] as const)('[cb-failures] shows the failure message until the next activation: %s', async (status, text, prepare) => {
    vi.useFakeTimers(); const spy = prepare(); const results: CopyResult[] = [];
    const { root, update } = page(`<hw-copy-button [text]="value" ${texts} (copyResult)="results.push($event)" />`, { value: text as string, results });
    parts(root).button.click(); await settle();
    expect(shown(root)).toEqual(['failed', 'alert-02', failedMessage]); expect(results).toEqual([{ status, text }]);
    if (status === 'empty') expect(spy!.writeText).not.toHaveBeenCalled();
    // A failure has no timer.
    await vi.advanceTimersByTimeAsync(60_000); expect(shown(root)).toEqual(['failed', 'alert-02', failedMessage]);
    // The next successful activation clears it.
    const working = clipboard(); update({ value: 'value' });
    expect(shown(root)).toEqual(['failed', 'alert-02', failedMessage]);
    parts(root).button.click(); await settle();
    expect(working.writeText.mock.calls).toEqual([['value']]); expect(shown(root)).toEqual(['copied', 'tick-02', 'Copied']); expect(results.at(-1)).toEqual({ status: 'copied', text: 'value' });
  });

  it('[cb-repeat-announces] empties the status before a repeated result, and the copied state lasts a full duration from it', async () => {
    vi.useFakeTimers(); const second = deferred(); let call = 0;
    clipboard(() => ++call === 1 ? Promise.resolve() : second.promise);
    const { root } = page(`<hw-copy-button text="value" ${texts} />`);
    parts(root).button.click(); await settle(); expect(shown(root)).toEqual(['copied', 'tick-02', 'Copied']);
    await vi.advanceTimersByTimeAsync(2000);
    parts(root).button.click();
    // Rendered at once, inside the activation: the live region is empty before the message returns.
    expect(shown(root)).toEqual(['idle', 'copy-01', '']);
    await settle(); await vi.advanceTimersByTimeAsync(2000); expect(shown(root)).toEqual(['idle', 'copy-01', '']);
    second.resolve(); await settle(); expect(shown(root)).toEqual(['copied', 'tick-02', 'Copied']);
    await vi.advanceTimersByTimeAsync(2999); expect(shown(root)).toEqual(['copied', 'tick-02', 'Copied']);
    await vi.advanceTimersByTimeAsync(1); expect(shown(root)).toEqual(['idle', 'copy-01', '']);
  });

  it('[cb-latest-wins] shows and reports only the latest of two activations whose writes finish in reverse order', async () => {
    const writes = [deferred(), deferred()]; let call = 0; const values = ['first', 'second']; let read = 0; const results: CopyResult[] = [];
    const spy = clipboard(() => writes[call++]!.promise);
    const { root } = page(`<hw-copy-button [text]="read" ${texts} (copyResult)="results.push($event)" />`, { read: () => values[read++]!, results });
    parts(root).button.click(); await settle(); parts(root).button.click(); await settle();
    expect(spy.writeText.mock.calls).toEqual([['first'], ['second']]);
    writes[1]!.resolve(); await settle();
    expect(shown(root)).toEqual(['copied', 'tick-02', 'Copied']);
    writes[0]!.reject(new Error('late')); await settle();
    expect(shown(root)).toEqual(['copied', 'tick-02', 'Copied']); expect(results).toEqual([{ status: 'copied', text: 'second' }]);
  });

  it('[cb-destroy-pending] ignores a result that arrives after destruction and leaves no timer behind', async () => {
    vi.useFakeTimers(); const errors = vi.spyOn(console, 'error').mockImplementation(() => {}); const warned = vi.spyOn(console, 'warn');
    const write = deferred(); clipboard(() => write.promise); const results: CopyResult[] = [];
    const pending = page(`<hw-copy-button text="value" ${texts} (copyResult)="results.push($event)" />`, { results });
    const { host, button } = parts(pending.root); button.click(); await settle();
    pending.fixture.destroy(); write.resolve(); await settle(); await vi.advanceTimersByTimeAsync(200);
    expect(host.getAttribute('data-state')).toBe('idle'); expect(results).toEqual([]); expect(vi.getTimerCount()).toBe(0);
    // Destroyed during the copied state: the reset timer goes with the component.
    clipboard();
    const copied = page(`<hw-copy-button text="value" ${texts} (copyResult)="results.push($event)" />`, { results });
    parts(copied.root).button.click(); await settle(); await vi.advanceTimersByTimeAsync(200);
    expect(shown(copied.root)[0]).toBe('copied'); expect(vi.getTimerCount()).toBe(1);
    copied.fixture.destroy(); expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(5000);
    expect(results).toEqual([{ status: 'copied', text: 'value' }]); expect(errors).not.toHaveBeenCalled(); expect(warned).not.toHaveBeenCalled();
  });

  it('[cb-name-constant] keeps one accessible name in the idle, copied and failed states', async () => {
    let call = 0; clipboard(() => ++call % 2 ? Promise.resolve() : Promise.reject(new Error('boom')));
    const { root } = page(`<hw-copy-button text="value" ${texts} /><hw-copy-button text="value" display="text" ${texts} />`);
    for (const index of [0, 1]) {
      const { button } = parts(root, index); const name = () => index ? button.textContent : button.getAttribute('aria-label');
      expect(name()).toBe('Copy the command');
      button.click(); await settle(); expect(shown(root, index)[0]).toBe('copied'); expect(name()).toBe('Copy the command');
      button.click(); await settle(); expect(shown(root, index)[0]).toBe('failed'); expect(name()).toBe('Copy the command');
      for (const attribute of ['aria-pressed', 'aria-busy', 'aria-describedby', 'title']) expect(button.hasAttribute(attribute)).toBe(false);
      expect(button.hasAttribute('aria-label')).toBe(!index);
    }
  });

  it('[cb-disabled] disables the native button, which then copies nothing and reports nothing', async () => {
    const spy = clipboard(); const read = vi.fn(() => 'value'); const results: CopyResult[] = [];
    const { root, update } = page(`<hw-copy-button [text]="read" [disabled]="disabled" ${texts} (copyResult)="results.push($event)" /><hw-copy-button text="value" disabled ${texts} />`, { read, disabled: true, results });
    const { button } = parts(root);
    expect(button.disabled).toBe(true); expect(button.hasAttribute('disabled')).toBe(true); expect(parts(root, 1).button.disabled).toBe(true);
    button.click(); await settle();
    expect(read).not.toHaveBeenCalled(); expect(spy.writeText).not.toHaveBeenCalled(); expect(results).toEqual([]); expect(shown(root)).toEqual(['idle', 'copy-01', '']);
    update({ disabled: false }); expect(button.hasAttribute('disabled')).toBe(false);
    button.click(); await settle(); expect(shown(root)[0]).toBe('copied');
    // Disabling does not change the state.
    update({ disabled: true }); expect(shown(root)).toEqual(['copied', 'tick-02', 'Copied']);
  });

  it('[cb-missing-text] renders nothing in place of a missing text, warns once for each, and is silent when all three are supplied', async () => {
    const warnings = missingTextWarnings();
    let fail = false; clipboard(() => fail ? Promise.reject(new Error('boom')) : Promise.resolve());
    const complete = page(`<hw-copy-button text="value" ${texts} /><hw-copy-button text="value" display="text" ${texts} />`);
    parts(complete.root).button.click(); await settle(); complete.update();
    expect(warnings).toEqual([]);
    // Without label: no accessible-name attribute and no text; the control itself stays.
    const unnamed = page(`<hw-copy-button text="value" copiedMessage="Copied" failedMessage="Failed" /><hw-copy-button text="value" display="text" copiedMessage="Copied" failedMessage="Failed" />`);
    unnamed.update();
    expect(parts(unnamed.root).button.hasAttribute('aria-label')).toBe(false); expect(contentOf(parts(unnamed.root).button)).toEqual([parts(unnamed.root).icon]);
    expect(parts(unnamed.root, 1).button.hasAttribute('aria-label')).toBe(false); expect(parts(unnamed.root, 1).button.textContent).toBe(''); expect(parts(unnamed.root, 1).button.querySelector('.hw-icon')).not.toBeNull();
    expect(warnings).toEqual(['Hawiyah: hw-copy-button requires "label". Hawiyah ships no built-in strings, so the application supplies this text; nothing is rendered in its place.']);
    // Without copiedMessage: reported on the first render, before any copy; the state and the icon still change.
    const quiet = page(`<hw-copy-button text="value" label="Copy" failedMessage="Failed" />`);
    expect(about(warnings, 'copiedMessage')).toHaveLength(1);
    parts(quiet.root).button.click(); await settle(); expect(shown(quiet.root)).toEqual(['copied', 'tick-02', '']);
    // Without failedMessage: likewise for a failure.
    const silent = page(`<hw-copy-button text="value" label="Copy" copiedMessage="Copied" />`);
    expect(about(warnings, 'failedMessage')).toHaveLength(1);
    fail = true; parts(silent.root).button.click(); await settle(); expect(shown(silent.root)).toEqual(['failed', 'alert-02', '']);
    expect(warnings).toHaveLength(3); expect(about(warnings, 'label')).toHaveLength(1);
  });

  it('updates the status text when the shown message changes, and exposes focus()', async () => {
    clipboard();
    const { root, update, fixture } = page(`<hw-copy-button #copy text="value" label="Copy" [copiedMessage]="copied" failedMessage="Failed" /><button type="button" id="other" (click)="copy.focus()">Focus</button>`, { copied: 'Copied' });
    parts(root).button.click(); await settle(); expect(shown(root)[2]).toBe('Copied');
    update({ copied: 'تم النسخ' }); expect(shown(root)).toEqual(['copied', 'tick-02', 'تم النسخ']);
    root.querySelector<HTMLButtonElement>('#other')!.click(); expect(document.activeElement).toBe(parts(root).button);
    fixture.destroy();
  });
});
