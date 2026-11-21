// The negative control of an interaction check (G6 of the 5a fix round). Every
// check module of checks/ ships negative: { fixture, wrong }: the vanilla markup of
// the component the check is written for, and a deliberately wrong oracle.
// scripts/equivalence/test/negative.test.mjs renders the fixture with the installed
// @hawiyah/vanilla (enhance()) and @hawiyah/styles in one sandboxed frame shaped as
// the harness mounts a vanilla result, then runs the check twice through runChecks:
// with its documented oracle every step holds, and with the wrong one every step
// that declares keys fails (HWE-EXPECT). A check whose assertion reads nothing, or
// whose oracle follows what the frame shows, cannot pass the second run.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { build } from 'esbuild';
import { GUIDE_DIR, runChecks } from './run.mjs';

let bundled = null;
/** The installed @hawiyah/vanilla bundled with an entry that enhances #app, and the installed stylesheet. */
export async function vanillaRuntime(guideDir = GUIDE_DIR) {
  if (bundled) return bundled;
  const result = await build({
    stdin: { contents: "import { enhance } from '@hawiyah/vanilla';\nenhance(document.getElementById('app'));\n", resolveDir: guideDir, loader: 'js' },
    bundle: true, format: 'iife', platform: 'browser', target: 'es2022', write: false, logLevel: 'silent',
  });
  bundled = {
    script: result.outputFiles[0].text.replace(/<\/script/gi, '<\\/script'),
    css: readFileSync(join(guideDir, 'node_modules', '@hawiyah', 'styles', 'dist', 'styles.css'), 'utf8').replace(/<\/style/gi, '<\\/style'),
  };
  return bundled;
}

/** The frame document of a fixture: the mount shape of the harness (#hawiyah-preview-root > #app), enhanced by the installed package. */
export function fixtureDocument(fixture, { dir, runtime }) {
  return `<!doctype html><html lang="${dir === 'rtl' ? 'ar' : 'en'}" dir="${dir}"><head><title>Negative control</title><style>${runtime.css}</style></head>`
    + `<body style="margin:0;padding:8px"><div id="hawiyah-preview-root"><div id="app">${fixture}</div></div><script>${runtime.script}</script></body></html>`;
}

/** Writes a stand-in harness page with one vanilla frame holding the fixture. */
export async function openFixture(page, fixture, { dir = 'ltr', guideDir = GUIDE_DIR } = {}) {
  const runtime = await vanillaRuntime(guideDir);
  await page.setContent('<!doctype html><html lang="en"><head><title>Negative control</title></head><body style="margin:0;padding:16px"><main><iframe data-framework="vanilla" sandbox="allow-scripts" title="vanilla" style="display:block;inline-size:720px;block-size:300px;border:0"></iframe></main></body></html>');
  const element = page.locator('iframe[data-framework="vanilla"]');
  await element.evaluate((frame, html) => {
    frame.srcdoc = html;
    return new Promise((done) => frame.addEventListener('load', () => done(undefined), { once: true }));
  }, fixtureDocument(fixture, { dir, runtime }));
  const frame = await (await element.elementHandle()).contentFrame();
  const height = await frame.evaluate(() => Math.ceil(document.documentElement.getBoundingClientRect().height));
  await element.evaluate((node, value) => { node.style.blockSize = `${Math.max(80, value)}px`; }, height);
}

/**
 * Runs a check on its fixture with its documented oracle and with its wrong one, in
 * one direction. Returns { documented, negative, keyed } where documented and
 * negative are the results of runChecks and keyed lists the names of the steps that
 * declare keys.
 */
export async function negativeControl(page, check, { dir = 'ltr', outcomeTimeout = 300, guideDir = GUIDE_DIR } = {}) {
  const group = { id: 'negative-control', lang: dir === 'rtl' ? 'ar' : 'en', example: check.name, blocks: { vanilla: { line: 1 } } };
  await openFixture(page, check.negative.fixture, { dir, guideDir });
  const documented = await runChecks({ page, group, checks: [check], frameworks: ['vanilla'], outcomeTimeout: 2_000 });
  await openFixture(page, check.negative.fixture, { dir, guideDir });
  const negative = await runChecks({ page, group, checks: [check], frameworks: ['vanilla'], outcomeTimeout, finalSettle: 0, oracle: 'negative' });
  return { documented, negative, keyed: check.steps.filter((step) => Array.isArray(step.keys)).map((step) => step.name) };
}
