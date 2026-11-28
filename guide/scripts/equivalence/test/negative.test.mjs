// Every interaction check of checks/ ships a negative control: rendered with the installed @hawiyah/vanilla, its documented oracle holds
// in both directions, and with its deliberately wrong oracle every step that
// declares keys fails. A check without one fails here (and in step 80, stepErrors).
import { readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { stepErrors } from '../keys.mjs';
import { negativeControl } from '../negative.mjs';
import { chromiumPath } from '../run.mjs';

const dir = new URL('../checks/', import.meta.url);
const files = readdirSync(dir).filter((name) => name.endsWith('.mjs')).sort();
const checks = await Promise.all(files.map(async (name) => (await import(pathToFileURL(new URL(name, dir).pathname).href)).default));

describe('the negative control of every interaction check', () => {
  let browser;
  let page;
  beforeAll(async () => {
    browser = await chromium.launch({ executablePath: chromiumPath() });
    page = await (await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })).newPage();
  }, 60_000);
  afterAll(async () => browser?.close());

  it('finds the checks of the guide', () => {
    expect(files.length).toBeGreaterThan(0);
    expect(checks.map((check) => `${check.name}.mjs`)).toEqual(files);
  });

  it.each(files.map((file, index) => [file, checks[index]]))('%s has the form of a check and a negative control', (_file, check) => {
    expect(stepErrors(check)).toEqual([]);
  });

  for (const [index, file] of files.entries()) {
    for (const direction of ['ltr', 'rtl']) {
      it(`${file}: the documented oracle holds and the wrong one fails every keyed step (${direction})`, async () => {
        const check = checks[index];
        const result = await negativeControl(page, check, { dir: direction });
        expect(result.documented.failures).toEqual([]);
        expect(result.documented.asserted).toBe(check.steps.length);
        const failedSteps = new Set(result.negative.failures.filter((line) => line.startsWith('HWE-EXPECT ')).map((line) => /\) [a-z0-9-]+\/([a-z0-9-]+) in /.exec(line)?.[1]));
        for (const name of result.keyed) expect(failedSteps.has(name), `${check.name}/${name} fails under the wrong oracle`).toBe(true);
        expect(result.negative.failures.every((line) => line.startsWith('HWE-EXPECT '))).toBe(true);
      }, 120_000);
    }
  }
});
