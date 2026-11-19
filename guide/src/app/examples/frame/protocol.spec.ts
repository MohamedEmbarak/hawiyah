import { describe, expect, it } from 'vitest';
import {
  CHANNEL,
  MAX_HEIGHT,
  MAX_MESSAGES,
  MAX_OUTCOME_MESSAGES,
  MAX_TEXT,
  MIN_HEIGHT,
  MessageBudget,
  PROTOCOL_VERSION,
  acceptMessage,
  needsBundledRuntime,
  randomHex128,
  type MessageLike,
} from './protocol';

const frameWindow = { name: 'frame' };
const token = 'a1b2c3d4e5f60718293a4b5c6d7e8f90';
const expected = { source: frameWindow, token, run: 2 };

function event(data: Record<string, unknown>, overrides: Partial<MessageLike> = {}): MessageLike {
  return { source: frameWindow, origin: 'null', data: { channel: CHANNEL, version: PROTOCOL_VERSION, token, run: 2, ...data }, ...overrides };
}

const marks = { start: 1, styles: 2, modules: 3, content: 4, painted: 5 };

describe('acceptMessage', () => {
  it('accepts the six message types of the current run', () => {
    expect(acceptMessage(event({ type: 'ready', marks }), expected)).toEqual({ type: 'ready', marks });
    expect(acceptMessage(event({ type: 'error', text: 'boom' }), expected)).toEqual({ type: 'error', text: 'boom' });
    expect(acceptMessage(event({ type: 'console', level: 'warn', text: 'w' }), expected)).toEqual({ type: 'console', level: 'warn', text: 'w' });
    expect(acceptMessage(event({ type: 'height', height: 240 }), expected)).toEqual({ type: 'height', height: 240 });
    expect(acceptMessage(event({ type: 'navigation', href: 'https://example.org/' }), expected)).toEqual({ type: 'navigation', href: 'https://example.org/' });
    expect(acceptMessage(event({ type: 'submit' }), expected)).toEqual({ type: 'submit' });
  });

  it('ignores a message from another window', () => {
    expect(acceptMessage(event({ type: 'submit' }, { source: {} }), expected)).toBeNull();
    expect(acceptMessage(event({ type: 'submit' }, { source: null }), { ...expected, source: null })).toBeNull();
  });

  it('ignores a message whose origin is not opaque', () => {
    expect(acceptMessage(event({ type: 'submit' }, { origin: 'http://127.0.0.1:5640' }), expected)).toBeNull();
    expect(acceptMessage(event({ type: 'submit' }, { origin: '' }), expected)).toBeNull();
  });

  it('ignores a wrong channel, version, token or run', () => {
    expect(acceptMessage(event({ type: 'submit', channel: 'other' }), expected)).toBeNull();
    expect(acceptMessage(event({ type: 'submit', version: 2 }), expected)).toBeNull();
    expect(acceptMessage(event({ type: 'submit', token: 'f'.repeat(32) }), expected)).toBeNull();
    expect(acceptMessage(event({ type: 'submit', token: undefined }), expected)).toBeNull();
    expect(acceptMessage(event({ type: 'submit', run: 1 }), expected)).toBeNull();
    expect(acceptMessage(event({ type: 'submit', run: '2' }), expected)).toBeNull();
  });

  it('ignores unknown types and malformed fields', () => {
    expect(acceptMessage(event({ type: 'eval', text: 'x' }), expected)).toBeNull();
    expect(acceptMessage(event({ type: 'console', level: 'debug', text: 'x' }), expected)).toBeNull();
    expect(acceptMessage(event({ type: 'error', text: 42 }), expected)).toBeNull();
    expect(acceptMessage(event({ type: 'height', height: Number.NaN }), expected)).toBeNull();
    expect(acceptMessage(event({ type: 'ready', marks: { start: 1 } }), expected)).toBeNull();
    expect(acceptMessage({ source: frameWindow, origin: 'null', data: 'hawiyah-guide-frame' }, expected)).toBeNull();
    expect(acceptMessage({ source: frameWindow, origin: 'null', data: [CHANNEL] }, expected)).toBeNull();
  });

  it('cuts oversize text to the limit', () => {
    const long = 'x'.repeat(MAX_TEXT + 500);
    const error = acceptMessage(event({ type: 'error', text: long }), expected);
    expect(error).toEqual({ type: 'error', text: 'x'.repeat(MAX_TEXT) });
    const navigation = acceptMessage(event({ type: 'navigation', href: long }), expected);
    expect(navigation && 'href' in navigation ? navigation.href.length : 0).toBe(MAX_TEXT);
  });

  it('clamps the height', () => {
    expect(acceptMessage(event({ type: 'height', height: 2 }), expected)).toEqual({ type: 'height', height: MIN_HEIGHT });
    expect(acceptMessage(event({ type: 'height', height: 99999 }), expected)).toEqual({ type: 'height', height: MAX_HEIGHT });
    expect(acceptMessage(event({ type: 'height', height: 120.2 }), expected)).toEqual({ type: 'height', height: 121 });
  });
});

describe('message budget', () => {
  it('drops and counts console messages past their own limit of a run', () => {
    const budget = new MessageBudget();
    for (let i = 0; i < MAX_MESSAGES; i += 1) expect(budget.take('console')).toBe(true);
    expect(budget.take('console')).toBe(false);
    expect(budget.take('console')).toBe(false);
    expect(budget.dropped).toBe(2);
  });

  it('always accepts ready, error, navigation and submit, also after the console budget is spent', () => {
    const budget = new MessageBudget();
    for (let i = 0; i < MAX_MESSAGES + 10; i += 1) budget.take('console');
    for (const type of ['ready', 'error', 'navigation', 'submit'] as const) expect(budget.take(type)).toBe(true);
    // Height reports have a budget of their own and are not counted as dropped output.
    for (let i = 0; i < MAX_MESSAGES; i += 1) expect(budget.take('height')).toBe(true);
    expect(budget.take('height')).toBe(false);
    expect(budget.dropped).toBe(10);
  });
});

describe('message budget of the outcome', () => {
  it('accepts the first error, navigation and submit messages together, then drops and counts them; ready and emptied always', () => {
    const budget = new MessageBudget();
    const types = ['error', 'navigation', 'submit'] as const;
    for (let i = 0; i < MAX_OUTCOME_MESSAGES; i += 1) expect(budget.take(types[i % 3]!)).toBe(true);
    for (const type of types) expect(budget.take(type)).toBe(false);
    expect(budget.droppedOutcome).toBe(3);
    expect(budget.take('ready')).toBe(true);
    expect(budget.take('emptied')).toBe(true);
    expect(budget.dropped).toBe(0);
  });

  it('accepts the emptied message of the run', () => {
    expect(acceptMessage(event({ type: 'emptied' }), expected)).toEqual({ type: 'emptied' });
  });
});

describe('fallback trigger', () => {
  const rt = 'http://127.0.0.1:5640/hawiyah/runtime/';
  it('falls back for module loading failures and policy violations of runtime URLs', () => {
    expect(needsBundledRuntime('TypeError: Failed to fetch dynamically imported module: x', rt)).toBe(true);
    expect(needsBundledRuntime('TypeError: Failed to resolve module specifier "vue"', rt)).toBe(true);
    expect(needsBundledRuntime('TypeError: Importing a module script failed.', rt)).toBe(true);
    expect(needsBundledRuntime(`securitypolicyviolation script-src-elem ${rt}npm/x.js`, rt)).toBe(true);
    expect(needsBundledRuntime('securitypolicyviolation connect-src https://example.org/', rt)).toBe(false);
    expect(needsBundledRuntime('ReferenceError: x is not defined', rt)).toBe(false);
  });
});

describe('randomHex128', () => {
  it('returns 32 hex characters from getRandomValues', () => {
    const value = randomHex128(crypto);
    expect(value).toMatch(/^[0-9a-f]{32}$/);
    expect(randomHex128(crypto)).not.toBe(value);
  });
});
