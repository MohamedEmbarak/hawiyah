// The clipboard is written only inside copyText, which runs when the reader activates a
// control. Nothing here reads the clipboard, and no global is touched at module evaluation.

/** Outcome of one copy attempt. Everything but `copied` is a failure the reader is told about. */
export type CopyStatus = 'copied' | 'denied' | 'unavailable' | 'failed' | 'empty';
/** What a copy control shows: `data-state`, the icon and the status text follow it. */
export type CopyFeedbackState = 'idle' | 'copied' | 'failed';
export interface CopyResult { status: CopyStatus; text: string }

/** Packaged icon per state (Hugeicons names in the Hawiyah icon stylesheet). */
export const copyFeedbackIcons: Readonly<Record<CopyFeedbackState, string>> = { idle: 'copy-01', copied: 'tick-02', failed: 'alert-02' };
/** Milliseconds the copied state lasts when the application gives no usable duration. */
export const COPY_FEEDBACK_DURATION = 3000;

type ClipboardWriter = { writeText?: (text: string) => Promise<void> };

/** Writes `text` to the clipboard as given, without trimming it.
 * `empty`: nothing but white space, so nothing is written. `unavailable`: no asynchronous
 * Clipboard API (a server, an insecure context, an old browser). `denied`: the browser
 * refused permission. `failed`: any other rejection. It never reads the clipboard, never
 * falls back to document.execCommand and never throws. */
export async function copyText(text: string): Promise<CopyStatus> {
  if (typeof text !== 'string' || !text.trim()) return 'empty';
  let clipboard: ClipboardWriter | undefined;
  try { clipboard = (globalThis as { navigator?: { clipboard?: ClipboardWriter } }).navigator?.clipboard; } catch { clipboard = undefined; }
  if (typeof clipboard?.writeText !== 'function') return 'unavailable';
  try { await clipboard.writeText(text); return 'copied'; }
  catch (error) {
    const name = (error as { name?: unknown } | null)?.name;
    return name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'failed';
  }
}

export interface CopyFeedbackOptions {
  /** The text to copy, read at each activation and never before. */
  getText: () => string;
  /** Milliseconds the copied state lasts, read when a copy succeeds. A value that is not a
   * finite number above zero means COPY_FEEDBACK_DURATION. */
  getDuration?: () => number | undefined;
  /** Called synchronously on every state change. `status` is the outcome behind `copied` or
   * `failed` and is undefined for `idle`. The adapter renders each call before the next. */
  onStateChange: (state: CopyFeedbackState, status?: CopyStatus) => void;
  /** Called once per activation whose result still counts, after onStateChange. */
  onResult?: (result: CopyResult) => void;
  /** Replaces copyText, for tests or an application-owned writer. It must not throw synchronously;
   * a rejection counts as `failed`. */
  write?: (text: string) => Promise<CopyStatus>;
}
export interface CopyFeedback {
  readonly state: CopyFeedbackState;
  /** Outcome of the latest finished activation, undefined while idle. */
  readonly status: CopyStatus | undefined;
  /** One activation. Resolves to its result, or to undefined when a later activation, reset()
   * or destroy() overtook it: then no state changes and onResult is not called. */
  copy(): Promise<CopyResult | undefined>;
  /** Back to idle now; a pending activation is forgotten. */
  reset(): void;
  /** Clears the timer and ignores every later result. No state change is reported. */
  destroy(): void;
}

/** State behind a copy control. Creating it touches nothing: no clipboard, no timer, no global.
 * An activation first returns to `idle`, which empties the status so that a repeated message
 * is announced again, then reports `copied` or `failed`. `copied` returns to `idle` after the
 * duration; `failed` stays until the next activation. Only the latest activation counts. */
export function createCopyFeedback(options: CopyFeedbackOptions): CopyFeedback {
  let state: CopyFeedbackState = 'idle';
  let status: CopyStatus | undefined;
  let sequence = 0;
  let destroyed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const clearTimer = () => { if (timer !== undefined) { clearTimeout(timer); timer = undefined; } };
  const set = (next: CopyFeedbackState, outcome?: CopyStatus) => {
    if (state === next && status === outcome) return;
    state = next; status = outcome;
    options.onStateChange(next, outcome);
  };
  const duration = () => { const value = options.getDuration?.(); return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : COPY_FEEDBACK_DURATION; };
  return {
    get state() { return state; },
    get status() { return status; },
    async copy() {
      if (destroyed) return undefined;
      const run = ++sequence;
      clearTimer();
      set('idle');
      let text = '';
      let outcome: CopyStatus;
      try {
        const value = options.getText();
        text = typeof value === 'string' ? value : '';
        outcome = await (options.write ?? copyText)(text);
      } catch { outcome = 'failed'; }
      if (destroyed || run !== sequence) return undefined;
      set(outcome === 'copied' ? 'copied' : 'failed', outcome);
      if (outcome === 'copied') timer = setTimeout(() => { timer = undefined; if (!destroyed && run === sequence) set('idle'); }, duration());
      const result: CopyResult = { status: outcome, text };
      options.onResult?.(result);
      return result;
    },
    reset() {
      if (destroyed) return;
      sequence++; clearTimer(); set('idle');
    },
    destroy() {
      destroyed = true; sequence++; clearTimer();
    },
  };
}
