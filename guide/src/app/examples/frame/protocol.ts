// Messages from an example frame to the guide (editor.frame.protocol). The frame
// only posts; the guide never sends a message to a frame. A message is accepted
// only from the frame's own window, with the opaque origin 'null', the channel,
// version, token and run of the current run, one of the seven types, and bounded
// text; anything else is ignored.

export const CHANNEL = 'hawiyah-guide-frame';
export const PROTOCOL_VERSION = 1;

/** Longest string kept from a message; longer strings are cut. */
export const MAX_TEXT = 4000;
/** Bounds of a reported frame height, in CSS pixels. */
export const MIN_HEIGHT = 80;
export const MAX_HEIGHT = 4000;
/**
 * Console messages accepted per run, and height messages per run; later ones of
 * that kind are dropped and counted.
 */
export const MAX_MESSAGES = 500;
/**
 * Error, navigation and submit messages accepted per run, together: the first ones
 * are shown (the first error ends a run that is loading), later ones are dropped and
 * counted in one log entry. ready and emptied are always accepted.
 */
export const MAX_OUTCOME_MESSAGES = 50;
/** A dropped-message count is reported at most this often (one log entry per run, updated). */
export const DROPPED_REPORT_MS = 250;
/** A run that is not ready within this time fails. */
export const READY_TIMEOUT_MS = 20000;

export const MESSAGE_TYPES = ['ready', 'error', 'console', 'height', 'navigation', 'submit', 'emptied'] as const;
export type FrameMessageType = (typeof MESSAGE_TYPES)[number];

export const CONSOLE_LEVELS = ['log', 'info', 'warn', 'error'] as const;
export type ConsoleLevel = (typeof CONSOLE_LEVELS)[number];

export const MARK_NAMES = ['start', 'styles', 'modules', 'content', 'painted'] as const;
export type ReadyMarks = Readonly<Record<(typeof MARK_NAMES)[number], number>>;

export type FrameMessage =
  | { readonly type: 'ready'; readonly marks: ReadyMarks }
  | { readonly type: 'error'; readonly text: string }
  | { readonly type: 'console'; readonly level: ConsoleLevel; readonly text: string }
  | { readonly type: 'height'; readonly height: number }
  | { readonly type: 'navigation'; readonly href: string }
  | { readonly type: 'submit' }
  /** The bootstrap saw the mount root leave the document (the code emptied the document). */
  | { readonly type: 'emptied' };

/** What the guide expects of a message of the current run. */
export interface ExpectedSender {
  /** contentWindow of the run's iframe. */
  readonly source: unknown;
  readonly token: string;
  readonly run: number;
}

/** The parts of a MessageEvent the check reads. */
export interface MessageLike {
  readonly source: unknown;
  readonly origin: string;
  readonly data: unknown;
}

/** Cuts a string to MAX_TEXT characters. */
export function boundText(value: string): string {
  return value.length > MAX_TEXT ? value.slice(0, MAX_TEXT) : value;
}

export function clampHeight(value: number): number {
  return Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.ceil(value)));
}

function text(value: unknown): string | null {
  return typeof value === 'string' ? boundText(value) : null;
}

function finite(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/**
 * Validates a message event of a run. Returns the message, with strings cut to
 * MAX_TEXT and the height clamped, or null when the event is not from the run's
 * frame or does not follow the protocol.
 */
export function acceptMessage(event: MessageLike, expected: ExpectedSender): FrameMessage | null {
  if (!expected.source || event.source !== expected.source) return null;
  if (event.origin !== 'null') return null;
  const data = event.data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const message = data as Record<string, unknown>;
  if (message['channel'] !== CHANNEL || message['version'] !== PROTOCOL_VERSION) return null;
  if (typeof message['token'] !== 'string' || message['token'] !== expected.token) return null;
  if (message['run'] !== expected.run) return null;
  const type = message['type'];
  switch (type) {
    case 'ready': {
      const raw = message['marks'];
      if (!raw || typeof raw !== 'object') return null;
      const marks: Record<string, number> = {};
      for (const name of MARK_NAMES) {
        const value = finite((raw as Record<string, unknown>)[name]);
        if (value === null) return null;
        marks[name] = value;
      }
      return { type, marks: marks as ReadyMarks };
    }
    case 'error': {
      const value = text(message['text']);
      return value === null ? null : { type, text: value };
    }
    case 'console': {
      const level = message['level'];
      const value = text(message['text']);
      if (typeof level !== 'string' || !(CONSOLE_LEVELS as readonly string[]).includes(level) || value === null) return null;
      return { type, level: level as ConsoleLevel, text: value };
    }
    case 'height': {
      const value = finite(message['height']);
      return value === null ? null : { type, height: clampHeight(value) };
    }
    case 'navigation': {
      const value = text(message['href']);
      return value === null ? null : { type, href: value };
    }
    case 'submit':
    case 'emptied':
      return { type };
    default:
      return null;
  }
}

/**
 * Counts the messages of one run. Console output and height reports each have a
 * budget of MAX_MESSAGES; error, navigation and submit together a budget of
 * MAX_OUTCOME_MESSAGES; past it a message of that kind is dropped and counted.
 * ready and emptied are always accepted.
 */
export class MessageBudget {
  private readonly accepted: Record<'console' | 'height' | 'outcome', number> = { console: 0, height: 0, outcome: 0 };
  /** Console messages dropped (reported to the reader); dropped height reports are not counted. */
  dropped = 0;
  /** Error, navigation and submit messages dropped (reported to the reader). */
  droppedOutcome = 0;

  take(type: FrameMessageType): boolean {
    if (type === 'ready' || type === 'emptied') return true;
    if (type === 'error' || type === 'navigation' || type === 'submit') {
      if (this.accepted.outcome >= MAX_OUTCOME_MESSAGES) {
        this.droppedOutcome += 1;
        return false;
      }
      this.accepted.outcome += 1;
      return true;
    }
    if (this.accepted[type] >= MAX_MESSAGES) {
      if (type === 'console') this.dropped += 1;
      return false;
    }
    this.accepted[type] += 1;
    return true;
  }
}

/** Errors after which a modules run is retried once with the bundled runtime (editor.fallback.when). */
export const MODULE_FAILURES = [
  'Failed to fetch dynamically imported module',
  'Failed to resolve module specifier',
  'Importing a module script failed',
] as const;

/** Prefix of the error text the frame reports for a securitypolicyviolation event. */
export const POLICY_VIOLATION = 'securitypolicyviolation';

/** Whether an error of a modules run calls for the bundled runtime. */
export function needsBundledRuntime(errorText: string, runtimeBase: string): boolean {
  if (MODULE_FAILURES.some((failure) => errorText.includes(failure))) return true;
  if (errorText.startsWith(POLICY_VIOLATION)) {
    const blocked = errorText.split(' ').slice(2).join(' ');
    return blocked.startsWith(runtimeBase);
  }
  return false;
}

/** 128 random bits in hex. */
export function randomHex128(crypto: Pick<Crypto, 'getRandomValues'>): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}
