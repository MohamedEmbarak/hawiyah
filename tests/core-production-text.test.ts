// @vitest-environment node
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

// The built core module as a browser receives it: no `process` global. A bundler
// replaces the expression `process.env.NODE_ENV` and nothing else.
const built = readFileSync(new URL('../packages/core/dist/text.js', import.meta.url), 'utf8');
function warnings(nodeEnv?: string, globals: Record<string, unknown> = {}) {
  const messages: string[] = [];
  const source = (nodeEnv === undefined ? built : built.replaceAll('process.env.NODE_ENV', JSON.stringify(nodeEnv))).replace(/^export /gm, '');
  const context: Record<string, unknown> = { console: { warn: (message: string) => messages.push(message) }, ...globals };
  expect(runInNewContext(`${source}\n[typeof process, requireText('Dialog', 'closeLabel', ''), requireText('Dialog', 'closeLabel', 'Close')].join()`, context)).toBe('undefined,false,true');
  return messages;
}

describe('requireText in a browser bundle', () => {
  it('leaves the NODE_ENV expression whole for the bundler to replace', () => {
    expect(built).toMatch(/return process\.env\.NODE_ENV !== 'production';/);
    expect(built).not.toMatch(/typeof process/);
  });

  it('is silent in a production bundle', () => {
    expect(warnings('production')).toEqual([]);
  });

  it('warns in a development bundle', () => {
    expect(warnings('development')).toEqual([expect.stringMatching(/^Hawiyah: Dialog requires "closeLabel"\./)]);
  });

  it('warns on a page without a bundler, unless the page switches it off', () => {
    expect(warnings()).toHaveLength(1);
    expect(warnings(undefined, { __HAWIYAH_DEV__: false })).toEqual([]);
    expect(warnings('production', { __HAWIYAH_DEV__: true })).toHaveLength(1);
  });
});
