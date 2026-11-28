import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyText, createCopyFeedback, copyFeedbackIcons, COPY_FEEDBACK_DURATION, type CopyFeedbackState, type CopyStatus } from '../src/copy.js';

const clipboard = (writeText?: (text: string) => Promise<void>) => vi.stubGlobal('navigator', { clipboard: writeText ? { writeText } : undefined });
const rejection = (name: string) => Object.assign(new Error(name), { name });
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('copyText', () => {
  it('writes the text as given and reports copied', async () => {
    const writeText = vi.fn(async () => {}); clipboard(writeText);
    expect(await copyText('  pnpm add @hawiyah/core\n')).toBe('copied');
    expect(writeText).toHaveBeenCalledExactlyOnceWith('  pnpm add @hawiyah/core\n');
  });
  it('reports empty without touching the clipboard', async () => {
    const writeText = vi.fn(async () => {}); clipboard(writeText);
    expect(await copyText('')).toBe('empty'); expect(await copyText(' \n\t')).toBe('empty'); expect(await copyText(undefined as unknown as string)).toBe('empty');
    expect(writeText).not.toHaveBeenCalled();
  });
  it('reports unavailable without a navigator, a clipboard or writeText', async () => {
    vi.stubGlobal('navigator', undefined); expect(await copyText('a')).toBe('unavailable');
    clipboard(); expect(await copyText('a')).toBe('unavailable');
    vi.stubGlobal('navigator', { clipboard: {} }); expect(await copyText('a')).toBe('unavailable');
    vi.stubGlobal('navigator', { get clipboard() { throw new Error('blocked'); } }); expect(await copyText('a')).toBe('unavailable');
  });
  it('separates a refused permission from other failures and never throws', async () => {
    clipboard(async () => { throw rejection('NotAllowedError'); }); expect(await copyText('a')).toBe('denied');
    clipboard(async () => { throw rejection('SecurityError'); }); expect(await copyText('a')).toBe('denied');
    clipboard(async () => { throw rejection('DataError'); }); expect(await copyText('a')).toBe('failed');
    clipboard(() => Promise.reject(null)); expect(await copyText('a')).toBe('failed');
    clipboard(() => { throw new Error('sync'); }); expect(await copyText('a')).toBe('failed');
  });
  it('never reads the clipboard and has no execCommand fallback', async () => {
    const readText = vi.fn(), read = vi.fn(), exec = vi.fn();
    vi.stubGlobal('navigator', { clipboard: { readText, read } }); document.execCommand = exec;
    expect(await copyText('a')).toBe('unavailable');
    expect(readText).not.toHaveBeenCalled(); expect(read).not.toHaveBeenCalled(); expect(exec).not.toHaveBeenCalled();
    delete (document as { execCommand?: unknown }).execCommand;
  });
  it('does not read navigator while the module is evaluated', async () => {
    const access = vi.fn(() => ({}));
    Object.defineProperty(globalThis, 'navigator', { configurable: true, get: access });
    vi.resetModules(); await import('../src/copy.js'); await import('../src/index.js');
    expect(access).not.toHaveBeenCalled();
    Object.defineProperty(globalThis, 'navigator', { configurable: true, writable: true, value: window.navigator });
  });
});

describe('createCopyFeedback', () => {
  type Write = (text: string) => Promise<CopyStatus>;
  const setup = (write: Write, extra: { text?: () => string; duration?: () => number | undefined } = {}) => {
    const states: Array<[CopyFeedbackState, CopyStatus | undefined]> = [];
    const onResult = vi.fn();
    const feedback = createCopyFeedback({ getText: extra.text ?? (() => 'value'), getDuration: extra.duration, write, onResult, onStateChange: (state, status) => states.push([state, status]) });
    return { feedback, states, onResult };
  };
  const deferred = () => { let resolve!: (status: CopyStatus) => void; const promise = new Promise<CopyStatus>(done => { resolve = done; }); return { promise, resolve }; };

  it('names the packaged icons and the default duration', () => {
    expect(copyFeedbackIcons).toEqual({ idle: 'copy-01', copied: 'tick-02', failed: 'alert-02' }); expect(COPY_FEEDBACK_DURATION).toBe(3000);
  });
  it('touches nothing when it is created: no text, no clipboard, no timer, no state change', () => {
    vi.useFakeTimers(); const writeText = vi.fn(async () => {}); clipboard(writeText); const text = vi.fn(() => 'value');
    const { feedback, states } = setup(undefined as unknown as Write, { text });
    expect(feedback.state).toBe('idle'); expect(feedback.status).toBeUndefined(); expect(states).toEqual([]);
    expect(text).not.toHaveBeenCalled(); expect(writeText).not.toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0);
  });
  it('uses copyText by default and reads the text at activation', async () => {
    const writeText = vi.fn(async () => {}); clipboard(writeText); let value = 'first';
    const { feedback, onResult } = setup(undefined as unknown as Write, { text: () => value });
    value = 'second';
    expect(await feedback.copy()).toEqual({ status: 'copied', text: 'second' });
    expect(writeText).toHaveBeenCalledExactlyOnceWith('second'); expect(onResult).toHaveBeenCalledExactlyOnceWith({ status: 'copied', text: 'second' });
    feedback.destroy();
  });
  it('shows copied, then returns to idle after the duration', async () => {
    vi.useFakeTimers();
    const { feedback, states } = setup(async () => 'copied');
    await feedback.copy();
    expect(states).toEqual([['copied', 'copied']]); expect(feedback.status).toBe('copied');
    vi.advanceTimersByTime(2999); expect(feedback.state).toBe('copied');
    vi.advanceTimersByTime(1); expect(states).toEqual([['copied', 'copied'], ['idle', undefined]]); expect(feedback.status).toBeUndefined();
  });
  it('reads the duration when a copy succeeds and falls back for unusable values', async () => {
    vi.useFakeTimers(); let duration: number | undefined = 500;
    const { feedback } = setup(async () => 'copied', { duration: () => duration });
    await feedback.copy(); vi.advanceTimersByTime(499); expect(feedback.state).toBe('copied'); vi.advanceTimersByTime(1); expect(feedback.state).toBe('idle');
    for (const value of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, undefined]) {
      duration = value; await feedback.copy(); vi.advanceTimersByTime(2999); expect(feedback.state).toBe('copied'); vi.advanceTimersByTime(1); expect(feedback.state).toBe('idle');
    }
  });
  it.each(['denied', 'unavailable', 'failed', 'empty'] as const)('keeps the failed state for %s until the next activation, with no timer', async status => {
    vi.useFakeTimers(); let next: CopyStatus = status;
    const { feedback, states, onResult } = setup(async () => next);
    expect(await feedback.copy()).toEqual({ status, text: 'value' });
    expect(states).toEqual([['failed', status]]); expect(vi.getTimerCount()).toBe(0); expect(onResult).toHaveBeenCalledExactlyOnceWith({ status, text: 'value' });
    vi.advanceTimersByTime(60_000); expect(feedback.state).toBe('failed');
    next = 'copied'; await feedback.copy();
    expect(states).toEqual([['failed', status], ['idle', undefined], ['copied', 'copied']]);
  });
  it('returns to idle before a repeated result, so the same message is announced again', async () => {
    vi.useFakeTimers();
    const { feedback, states } = setup(async () => 'copied');
    await feedback.copy(); const pending = feedback.copy();
    expect(states).toEqual([['copied', 'copied'], ['idle', undefined]]);
    await pending; expect(states.at(-1)).toEqual(['copied', 'copied']);
    vi.advanceTimersByTime(2999); expect(feedback.state).toBe('copied'); vi.advanceTimersByTime(1); expect(feedback.state).toBe('idle');
  });
  it('lets only the latest activation update the state and report a result', async () => {
    const first = deferred(), second = deferred(); const writes = [first, second]; let call = 0;
    const { feedback, states, onResult } = setup(() => writes[call++]!.promise);
    const one = feedback.copy(), two = feedback.copy();
    second.resolve('copied'); expect(await two).toEqual({ status: 'copied', text: 'value' });
    first.resolve('denied'); expect(await one).toBeUndefined();
    expect(states).toEqual([['copied', 'copied']]); expect(onResult).toHaveBeenCalledExactlyOnceWith({ status: 'copied', text: 'value' });
    feedback.destroy();
  });
  it('does not let an earlier timer clear a later result', async () => {
    vi.useFakeTimers(); let next: CopyStatus = 'copied';
    const { feedback } = setup(async () => next);
    await feedback.copy(); vi.advanceTimersByTime(2000);
    next = 'denied'; await feedback.copy();
    vi.advanceTimersByTime(5000); expect(feedback.state).toBe('failed'); expect(feedback.status).toBe('denied');
  });
  it('ignores a result that arrives after destroy and clears the timer', async () => {
    vi.useFakeTimers(); const write = deferred();
    const { feedback, states, onResult } = setup(() => write.promise);
    const pending = feedback.copy(); feedback.destroy(); write.resolve('copied');
    expect(await pending).toBeUndefined(); expect(states).toEqual([]); expect(onResult).not.toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0);
    expect(await feedback.copy()).toBeUndefined();
    const second = setup(async () => 'copied'); await second.feedback.copy(); expect(vi.getTimerCount()).toBe(1);
    second.feedback.destroy(); second.feedback.destroy(); expect(vi.getTimerCount()).toBe(0); expect(second.states).toEqual([['copied', 'copied']]);
  });
  it('resets to idle and forgets a pending activation', async () => {
    vi.useFakeTimers(); const write = deferred(); let call = 0;
    const { feedback, states } = setup(() => call++ ? write.promise : Promise.resolve('copied' as const));
    await feedback.copy(); const pending = feedback.copy(); feedback.reset(); write.resolve('denied');
    expect(await pending).toBeUndefined(); expect(feedback.state).toBe('idle'); expect(states.at(-1)).toEqual(['idle', undefined]); expect(vi.getTimerCount()).toBe(0);
  });
  it('reports failed when the text getter or the writer throws', async () => {
    const thrown = setup(async () => 'copied', { text: () => { throw new Error('gone'); } });
    expect(await thrown.feedback.copy()).toEqual({ status: 'failed', text: '' });
    const rejected = setup(() => Promise.reject(new Error('writer')));
    expect(await rejected.feedback.copy()).toEqual({ status: 'failed', text: 'value' }); expect(rejected.states).toEqual([['failed', 'failed']]);
    const notText = setup(undefined as unknown as Write, { text: () => 42 as unknown as string });
    expect(await notText.feedback.copy()).toEqual({ status: 'empty', text: '' });
  });
});
