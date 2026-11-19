#!/usr/bin/env node
// Equivalence harness runner (contentPipeline.equivalence).
//
//   node scripts/equivalence/run.mjs [--dir dist/browser] [--base /hawiyah/] [--only <id>/<lang>/<example>,...]
//
// Serves <browserDir> under the base path like scripts/serve.mjs, adds the harness
// page at <base>__harness/ (never written into dist), starts Chromium (1280x900,
// deviceScaleFactor 1, reduced motion, light colour scheme) and, for every live
// group of .cache/content/live-groups.json, runs the vanilla, React, Vue and Angular
// results in four sandboxed frames built with the guide's modulesDocument(). It
// compares the normalised DOM, the aria snapshots and the element screenshots at
// rest and after each step of the group's interaction check, writes
// .cache/equivalence/report.json (and diff images of failed screenshots) and
// throws with one '<code> <file>:<line>: <message>' line per failure.
//
// Codes: HWE-FRAME (a frame failed or reported an error), HWE-STRUCT, HWE-ARIA,
// HWE-SHOT (a comparison failed), HWE-CHECK (unknown interaction check, a step
// that could not run, or a group of a component with a controller that names no
// check and is not static), HWE-KD (known-differences.json invalid or not found),
// HWE-SCOPE (no group, an --only key that names none, or groups that differ from
// the content manifest).
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { chromium } from '@playwright/test';
import { createPagesServer } from '../serve.mjs';
import { FRAMEWORKS, compareAria, compareScreenshots, compareStructure } from './compare.mjs';
import { generatedNamePattern } from './generated-names.mjs';
import { normalize } from './normalize.js';
import { styledAttributes } from './styled-attributes.mjs';

const here = dirname(fileURLToPath(import.meta.url));
export const GUIDE_DIR = resolve(here, '..', '..');
export const HARNESS_PATH = '__harness/';
export const VIEWPORT = { width: 1280, height: 900 };
export const ASPECTS = ['structure', 'aria', 'screenshot'];
const ASPECT_CODES = { structure: 'HWE-STRUCT', aria: 'HWE-ARIA', screenshot: 'HWE-SHOT' };

/** Selector of the mount inside a frame (the host markup of the compiled example). */
export const mountSelector = (framework) => (framework === 'angular' ? '#hawiyah-preview-root > guide-example' : '#hawiyah-preview-root > #app');

/**
 * Element of the screenshot: the frame root that holds the mount. The Angular
 * mount guide-example is an unstyled custom element (display: inline), so its own
 * box is the inline box of its content while #app is a block box 680 px wide; the
 * root is the same block box in all four frames (recorded under specProblems).
 */
export const SCREENSHOT_SELECTOR = '#hawiyah-preview-root';

/** Chromium: HAWIYAH_CHROMIUM, then <PLAYWRIGHT_BROWSERS_PATH>/chromium, else the Playwright cache. */
export function chromiumPath(env = process.env) {
  if (env.HAWIYAH_CHROMIUM) return env.HAWIYAH_CHROMIUM;
  if (env.PLAYWRIGHT_BROWSERS_PATH) {
    const linked = join(env.PLAYWRIGHT_BROWSERS_PATH, 'chromium');
    if (existsSync(linked)) return linked;
  }
  return undefined;
}

/** The Markdown file of a group, relative to the repository. */
export const sourceFile = (group) => `docs/components/${group.id}${group.lang === 'ar' ? '.ar' : ''}.md`;

/** '<code> <file>:<line>: <message>' */
export const failureLine = (code, group, message) => `${code} ${sourceFile(group)}:${group.blocks?.vanilla?.line ?? 1}: ${message}`;

const KD_FIELDS = ['id', 'component', 'aspect', 'description', 'source', 'approvedBy'];
const KD_OPTIONAL = ['ignore'];
const IGNORE_FIELDS = ['class', 'attribute'];

/** Errors of the optional ignore list of an entry (leadAmendments A8). */
function ignoreErrors(entry, at) {
  if (!('ignore' in entry)) return [];
  const errors = [];
  if (entry.aspect !== 'structure') errors.push(`${at}: ignore is allowed only on an entry of aspect structure`);
  if (!Array.isArray(entry.ignore) || entry.ignore.length === 0) return [...errors, `${at}: ignore must be a non-empty array`];
  entry.ignore.forEach((rule, n) => {
    const where = `${at} ignore ${n + 1}`;
    if (!rule || typeof rule !== 'object' || Array.isArray(rule)) {
      errors.push(`${where} is not an object`);
      return;
    }
    const extra = Object.keys(rule).filter((name) => !IGNORE_FIELDS.includes(name));
    if (extra.length > 0) errors.push(`${where} has unknown fields ${extra.join(', ')}`);
    for (const field of IGNORE_FIELDS) {
      if (typeof rule[field] !== 'string' || rule[field].trim() === '') errors.push(`${where} needs a non-empty ${field}`);
    }
    if (typeof rule.class === 'string' && rule.class !== '' && !/^hw-[a-z0-9-]+$/.test(rule.class)) errors.push(`${where}: class must be one hw- class name (got ${rule.class})`);
    if (typeof rule.attribute === 'string' && rule.attribute !== '' && !/^[a-z][a-z0-9-]*$/.test(rule.attribute)) {
      errors.push(`${where}: attribute must be one lower-case attribute name (got ${rule.attribute})`);
    }
  });
  return errors;
}

/** The repository CHANGELOG.md, which every known difference must cite. */
export const CHANGELOG_FILE = resolve(GUIDE_DIR, '..', 'CHANGELOG.md');

const SOURCE_FORM = /^CHANGELOG\.md, (\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?), ([^,:]+?): (.+)$/;
const squeeze = (text) => text.replace(/\s+/g, ' ').trim();

/**
 * Checks a source "CHANGELOG.md, <version>, <section>: <text of the entry>"
 * against the CHANGELOG text: the version has a "## <version>" section, it holds
 * a heading "<section>", and the quoted text appears in that subsection.
 * Returns an error message or null.
 */
export function changelogSourceError(source, changelog) {
  const match = String(source).match(SOURCE_FORM);
  if (!match) return 'source must read "CHANGELOG.md, <version>, <section>: <text of the entry>"';
  const [, version, section, quoted] = match;
  if (typeof changelog !== 'string') return 'CHANGELOG.md cannot be read';
  const lines = changelog.split('\n');
  const start = lines.findIndex((line) => line.startsWith(`## ${version} `) || line === `## ${version}`);
  if (start === -1) return `CHANGELOG.md has no section ## ${version}`;
  let end = lines.findIndex((line, index) => index > start && /^## /.test(line));
  if (end === -1) end = lines.length;
  const heading = lines.findIndex((line, index) => index > start && index < end && /^#{3,6} /.test(line) && line.replace(/^#+ /, '').trim() === section.trim());
  if (heading === -1) return `CHANGELOG.md ## ${version} has no heading "${section}"`;
  const level = lines[heading].match(/^#+/)[0].length;
  let sectionEnd = lines.findIndex((line, index) => index > heading && index < end && new RegExp(`^#{1,${level}} `).test(line));
  if (sectionEnd === -1) sectionEnd = end;
  const body = squeeze(lines.slice(heading + 1, sectionEnd).join(' '));
  if (!body.includes(squeeze(quoted))) return `the text "${quoted}" is not in CHANGELOG.md ## ${version} ${section}`;
  return null;
}

function readChangelog() {
  try {
    return readFileSync(CHANGELOG_FILE, 'utf8');
  } catch {
    return null;
  }
}

/**
 * Validates known-differences.json; returns { entries: Map<id, entry>, errors: string[] }.
 * Every source is checked against CHANGELOG.md (the repository file unless
 * options.changelog gives its text).
 */
export function validateKnownDifferences(value, options = {}) {
  const changelog = 'changelog' in options ? options.changelog : readChangelog();
  const errors = [];
  const entries = new Map();
  if (!Array.isArray(value)) return { entries, errors: ['HWE-KD scripts/equivalence/known-differences.json:1: the file must hold an array'] };
  value.forEach((entry, index) => {
    const at = `HWE-KD scripts/equivalence/known-differences.json:1: entry ${index + 1}`;
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      errors.push(`${at} is not an object`);
      return;
    }
    const extra = Object.keys(entry).filter((name) => !KD_FIELDS.includes(name) && !KD_OPTIONAL.includes(name));
    if (extra.length > 0) errors.push(`${at} has unknown fields ${extra.join(', ')}`);
    for (const field of KD_FIELDS) {
      if (typeof entry[field] !== 'string' || entry[field].trim() === '') errors.push(`${at} needs a non-empty ${field}`);
    }
    errors.push(...ignoreErrors(entry, at));
    if (typeof entry.aspect === 'string' && !ASPECTS.includes(entry.aspect)) errors.push(`${at}: aspect must be structure, aria or screenshot (got ${entry.aspect})`);
    if (typeof entry.approvedBy === 'string' && entry.approvedBy !== 'lead') errors.push(`${at}: approvedBy must be 'lead'`);
    if (typeof entry.source === 'string' && entry.source.trim() !== '') {
      const problem = changelogSourceError(entry.source, changelog);
      if (problem) errors.push(`${at}: ${problem}`);
    }
    if (typeof entry.id === 'string') {
      if (entries.has(entry.id)) errors.push(`${at}: id ${entry.id} is repeated`);
      entries.set(entry.id, entry);
    }
  });
  return { entries, errors };
}

/** The documented difference a group names, or a failure line. */
export function differenceOf(group, entries) {
  if (group.differences === undefined) return { entry: null };
  const entry = entries.get(group.differences);
  if (!entry) return { error: failureLine('HWE-KD', group, `differences=${group.differences} names no entry of scripts/equivalence/known-differences.json`) };
  if (entry.component !== group.id) {
    return { error: failureLine('HWE-KD', group, `differences=${group.differences} documents component ${entry.component}, not ${group.id}`) };
  }
  return { entry };
}

/** Bundles harness.ts with esbuild (the frame sources are imported as text, as the Angular build does). */
export async function bundleHarness(outFile) {
  const frameText = {
    name: 'frame-text',
    setup(builder) {
      builder.onResolve({ filter: /\.frame\.js$/ }, (args) => ({ path: resolve(args.resolveDir, args.path), namespace: 'frame-text' }));
      builder.onLoad({ filter: /.*/, namespace: 'frame-text' }, (args) => ({ contents: readFileSync(args.path, 'utf8'), loader: 'text' }));
    },
  };
  await build({
    entryPoints: [join(here, 'harness', 'harness.ts')],
    outfile: outFile,
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    logLevel: 'silent',
    plugins: [frameText],
  });
}

/**
 * The pages server of scripts/serve.mjs with the harness added at <base>__harness/:
 * index.html (base inserted) and harness.js from the cache. Listens on 127.0.0.1.
 */
export async function startHarnessServer({ dir, base, harnessFile, port = 0 }) {
  const pages = createPagesServer({ dir, base }).listeners('request')[0];
  const page = readFileSync(join(here, 'harness', 'index.html'), 'utf8').replace('%BASE%', base);
  const script = readFileSync(harnessFile);
  const server = createServer((request, response) => {
    const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
    if (pathname === `${base}${HARNESS_PATH}` || pathname === `${base}${HARNESS_PATH}index.html`) {
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      response.end(page);
      return;
    }
    if (pathname === `${base}${HARNESS_PATH}harness.js`) {
      response.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8', 'cache-control': 'no-store' });
      response.end(script);
      return;
    }
    pages(request, response);
  });
  await new Promise((ready, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', ready);
  });
  const address = server.address();
  return { server, origin: `http://127.0.0.1:${address.port}`, close: () => new Promise((done) => server.close(() => done())) };
}

/** Address of the harness page of a group. */
export function harnessUrl(origin, base, group, pin, frameworks = FRAMEWORKS) {
  const query = new URLSearchParams({ id: group.id, lang: group.lang, example: group.example, pin, frameworks: frameworks.join(',') });
  return `${origin}${base}${HARNESS_PATH}?${query}`;
}

/** Opens the harness for a group and waits until every frame is ready or failed. */
export async function openGroup(page, url) {
  await page.goto(url);
  await page.waitForFunction(() => window.__harness && window.__harness.done, null, { timeout: 60_000 });
  // The pointer stays where the last click of the previous group left it; over a frame
  // of this group it would show a hover state in one framework only.
  await page.mouse.move(0, 0);
  return page.evaluate(() => window.__harness);
}

/** The Playwright Frame of a framework's iframe in the harness page. */
export async function frameOf(page, framework) {
  const handle = await page.locator(`iframe[data-framework="${framework}"]`).elementHandle();
  const frame = await handle?.contentFrame();
  if (!frame) throw new Error(`no frame for ${framework}`);
  return frame;
}

/** Two rendering steps in a frame (each also ends after 100 ms: a frame outside the viewport gets no animation frames). */
async function settleFrame(frame) {
  await frame.evaluate(
    () =>
      new Promise((done) => {
        let count = 0;
        const step = () => {
          let finished = false;
          const next = () => {
            if (finished) return;
            finished = true;
            count += 1;
            if (count >= 2) done();
            else step();
          };
          requestAnimationFrame(next);
          setTimeout(next, 100);
        };
        step();
      }),
  );
}

/** Waits until the iframe has the height its document reports (screenshots are not clipped). */
async function settleHeight(page, frame, framework) {
  const wanted = await frame.evaluate(() => Math.ceil(document.documentElement.getBoundingClientRect().height));
  await page
    .waitForFunction(
      ([name, height]) => {
        const element = document.querySelector(`iframe[data-framework="${name}"]`);
        return element && Math.abs(element.getBoundingClientRect().height - Math.min(4000, Math.max(80, height))) < 1;
      },
      [framework, wanted],
      { timeout: 5_000 },
    )
    .catch(() => undefined);
}

/**
 * Normalised tree, aria snapshot and screenshot of each framework. before(framework),
 * when given, runs first in that framework's frame (an interaction step), so each
 * result is read while its own frame still has focus: only the focused frame of a
 * page matches :focus and :focus-visible.
 */
let normalizeInputs = null;
/** What the normaliser reads from the installed packages: generated names and styled data-hw-* attributes. */
export function normalizerInputs(guideDir = GUIDE_DIR) {
  normalizeInputs ??= { generatedName: generatedNamePattern(guideDir), styled: styledAttributes(guideDir) };
  return normalizeInputs;
}

export async function capture(page, frameworks = FRAMEWORKS, before = null) {
  const out = { trees: {}, snapshots: {}, images: {} };
  const inputs = normalizerInputs();
  for (const framework of frameworks) {
    if (before) await before(framework);
    const frame = await frameOf(page, framework);
    await settleFrame(frame);
    await settleHeight(page, frame, framework);
    const selector = mountSelector(framework);
    out.trees[framework] = await frame.evaluate(normalize, { target: selector, ...inputs });
    const mount = page.frameLocator(`iframe[data-framework="${framework}"]`).locator(selector);
    out.snapshots[framework] = await mount.ariaSnapshot();
    out.images[framework] = await page
      .frameLocator(`iframe[data-framework="${framework}"]`)
      .locator(SCREENSHOT_SELECTOR)
      .screenshot({ animations: 'disabled', caret: 'hide' });
  }
  return out;
}

/**
 * Runs the three comparisons on a capture; returns report rows (skipped aspects
 * included). difference is the known-differences entry of the group or null: an
 * entry without ignore skips its aspect; a structure entry with ignore leaves only
 * the listed attributes out of the structure comparison (leadAmendments A8).
 */
export function compareCapture(captured, difference = null) {
  const rows = [];
  const skip = difference && !difference.ignore ? difference.aspect : null;
  const ignore = difference?.aspect === 'structure' && difference.ignore ? difference.ignore : [];
  const add = (aspect, results) => {
    for (const result of results) {
      if (skip === aspect) rows.push({ aspect, pair: result.pair, result: 'skipped' });
      else rows.push({ aspect, ...result, result: result.equal ? 'equal' : 'different', ...(aspect === 'structure' && ignore.length > 0 ? { ignored: ignore } : {}) });
    }
  };
  add('structure', compareStructure(captured.trees, ignore));
  add('aria', compareAria(captured.snapshots));
  add('screenshot', compareScreenshots(captured.images));
  return rows;
}

async function loadChecks(names) {
  const checks = new Map();
  for (const name of names) {
    const file = join(here, 'checks', `${name}.mjs`);
    if (!/^[a-z][a-z0-9-]*$/.test(name) || !existsSync(file)) continue;
    const check = (await import(pathToFileURL(file).href)).default;
    if (check?.name === name && Array.isArray(check.steps)) checks.set(name, check);
  }
  return checks;
}

const groupKey = (group) => `${group.id}/${group.lang}/${group.example}`;
const stem = (group, state) => [group.id, group.lang, group.example, ...(state === 'rest' ? [] : state.split('/'))].join('-');

/** Runs one group; returns { rows, failures, applied }. */
async function runGroup({ page, origin, base, pin, group, checks, difference, outDir }) {
  const rows = [];
  const failures = [];
  const harness = await openGroup(page, harnessUrl(origin, base, group, pin));
  if (harness.error) return { rows, failures: [failureLine('HWE-FRAME', group, harness.error)] };
  for (const framework of FRAMEWORKS) {
    const frame = harness.frames[framework];
    if (!frame || frame.state !== 'ready') failures.push(failureLine('HWE-FRAME', group, `${framework} frame ${frame?.state ?? 'missing'}: ${frame?.message ?? ''}`));
  }
  if (failures.length > 0) return { rows, failures };

  const evaluate = async (state, before = null, given = null) => {
    const captured = given ?? (await capture(page, FRAMEWORKS, before));
    for (const row of compareCapture(captured, difference)) {
      const entry = { group: groupKey(group), state, ...row };
      delete entry.equal;
      delete entry.diff;
      if (row.result === 'different') {
        // Screenshot messages do not name the pair; the framework is added so every failure line names it.
        const message = row.aspect === 'screenshot' ? `vanilla and ${row.framework} screenshots differ: ${row.message}` : row.message;
        failures.push(failureLine(ASPECT_CODES[row.aspect], group, `${group.example} (${group.lang}, ${state}) ${message}`));
        if (row.aspect === 'screenshot') {
          const base = stem(group, state);
          writeFileSync(join(outDir, `${base}-vanilla.png`), captured.images.vanilla);
          writeFileSync(join(outDir, `${base}-${row.framework}-actual.png`), captured.images[row.framework]);
          if (row.diff) {
            writeFileSync(join(outDir, `${base}-${row.framework}.png`), row.diff);
            entry.diffImage = `.cache/equivalence/${base}-${row.framework}.png`;
          }
        }
      }
      rows.push(entry);
    }
  };

  await evaluate('rest');
  // The checks run one after the other in the same frames.
  for (const check of checks) {
    // A check starts with the pointer outside the frames (a click of the check before leaves it over a tab).
    await page.mouse.move(0, 0);
    // Per-frame state a check keeps between its steps (for example the focused tab).
    const states = Object.fromEntries(FRAMEWORKS.map((framework) => [framework, {}]));
    for (const step of check.steps) {
      let failed = null;
      const before = async (framework) => {
        if (failed) return;
        const mount = page.frameLocator(`iframe[data-framework="${framework}"]`).locator(mountSelector(framework));
        try {
          await step.run({ page, mount, dir: group.lang === 'ar' ? 'rtl' : 'ltr', lang: group.lang, framework, state: states[framework] });
          // The pointer leaves the results before they are read. A click leaves it
          // over the clicked element, and the page scrolls before the screenshot, so
          // which element it then rests on (and shows as hovered) depends on the
          // heights of the page's own text, not on the framework: on the GitHub
          // runner the tab hover line appeared on a different tab in each frame.
          // The page's inline padding (16 px) is never covered by a frame. A step
          // that tests a hover state sets keepPointer.
          if (!step.keepPointer) await page.mouse.move(4, 4);
        } catch (error) {
          failed = `${check.name} step ${step.name} failed in ${framework}: ${error instanceof Error ? error.message.split('\n')[0] : String(error)}`;
        }
      };
      const captured = await capture(page, FRAMEWORKS, before);
      if (failed) {
        failures.push(failureLine('HWE-CHECK', group, failed));
        return { rows, failures };
      }
      await evaluate(`${check.name}/${step.name}`, null, captured);
    }
  }
  const after = await page.evaluate(() => window.__harness.frames);
  for (const framework of FRAMEWORKS) {
    for (const line of after[framework]?.log ?? []) failures.push(failureLine('HWE-FRAME', group, `${framework} frame reported ${line}`));
  }
  return { rows, failures };
}

/**
 * Runs the harness over every group. Options: guideDir, browserDir (relative to
 * guideDir), basePath, cacheDir, only (array of '<id>/<lang>/<example>'), port,
 * workers, log. Returns the report; throws with the failure lines.
 */
export async function runEquivalence(options) {
  const guideDir = options.guideDir ?? GUIDE_DIR;
  const log = options.log ?? ((message) => console.log(message));
  const base = options.basePath ?? '/';
  const browserDir = resolve(guideDir, options.browserDir ?? 'dist/browser');
  const cacheDir = resolve(guideDir, options.cacheDir ?? '.cache');
  const outDir = join(cacheDir, 'equivalence');
  if (!existsSync(join(browserDir, 'runtime', 'import-map.json'))) throw new Error(`${relative(guideDir, browserDir)}/runtime/import-map.json does not exist; build step 60-runtime writes it`);
  const groupsFile = join(cacheDir, 'content', 'live-groups.json');
  if (!existsSync(groupsFile)) throw new Error(`${relative(guideDir, groupsFile)} does not exist; build step 20-content writes it`);
  const allGroups = JSON.parse(readFileSync(groupsFile, 'utf8'));
  // The groups must be those of the pages that were built (src/generated/content/manifest.json).
  const manifestFile = resolve(guideDir, options.manifestFile ?? 'src/generated/content/manifest.json');
  const scope = scopeErrors(allGroups, existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, 'utf8')) : null, options.only);
  if (scope.length > 0) throw new Error(scope.join('\n'));
  const groups = options.only ? allGroups.filter((group) => options.only.includes(groupKey(group))) : allGroups;

  const pin = readPin(guideDir);
  const known = validateKnownDifferences(JSON.parse(readFileSync(join(here, 'known-differences.json'), 'utf8')));
  const failures = [...known.errors];
  const checks = await loadChecks([...new Set(groups.flatMap(checkNames))]);
  const withController = controllerComponents(options.componentsFile ?? resolve(guideDir, '..', 'components.json'));
  const plan = [];
  for (const group of groups) {
    const difference = differenceOf(group, known.entries);
    if (difference.error) failures.push(difference.error);
    for (const name of checkNames(group)) {
      if (!checks.has(name)) failures.push(failureLine('HWE-CHECK', group, `check=${name} has no scripts/equivalence/checks/${name}.mjs`));
    }
    if (withController.has(group.id) && checkNames(group).length === 0 && !group.static) {
      failures.push(failureLine('HWE-CHECK', group, `${group.example}: ${group.id} has a controller, so the group names at least one check (check=<name>[,<name>]) or declares itself static`));
    }
    plan.push({ group, difference: difference.entry ?? null, checks: checkNames(group).map((name) => checks.get(name)).filter(Boolean) });
  }
  if (failures.length > 0) throw new Error(failures.join('\n'));

  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(join(outDir, 'harness'), { recursive: true });
  const harnessFile = join(outDir, 'harness', 'harness.js');
  await bundleHarness(harnessFile);
  const served = await startHarnessServer({ dir: browserDir, base, harnessFile, port: options.port ?? Number(process.env.HAWIYAH_EQUIVALENCE_PORT ?? 0) });
  const browser = await chromium.launch({ executablePath: chromiumPath() });
  const rows = [];
  const applied = new Map();
  try {
    const queue = [...plan];
    const worker = async () => {
      const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1, reducedMotion: 'reduce', colorScheme: 'light' });
      const page = await context.newPage();
      const pageErrors = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));
      try {
        for (let item = queue.shift(); item; item = queue.shift()) {
          pageErrors.length = 0;
          const result = await runGroup({ page, origin: served.origin, base, pin, outDir, ...item });
          for (const message of pageErrors) result.failures.push(failureLine('HWE-FRAME', item.group, `harness page error: ${message}`));
          rows.push(...result.rows);
          failures.push(...result.failures);
          if (item.difference) {
            const list = applied.get(item.difference.id) ?? [];
            list.push(groupKey(item.group));
            applied.set(item.difference.id, list);
          }
          log(`equivalence: ${groupKey(item.group)} ${result.failures.length === 0 ? 'equal' : `${result.failures.length} failure(s)`}`);
        }
      } finally {
        await context.close();
      }
    };
    const workers = Math.max(1, Math.min(options.workers ?? Number(process.env.HAWIYAH_EQUIVALENCE_WORKERS ?? 2), plan.length));
    await Promise.all(Array.from({ length: workers }, worker));
  } finally {
    await browser.close();
    await served.close();
  }

  const sortKey = (row) => `${row.group} ${row.state} ${ASPECTS.indexOf(row.aspect)} ${row.pair}`;
  rows.sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
  const pages = new Set(plan.map(({ group }) => `${group.id}/${group.example}`));
  const languages = new Set(plan.map(({ group }) => group.lang));
  const interactionChecks = plan.reduce((sum, item) => sum + item.checks.length, 0);
  const interacted = new Set(plan.filter((item) => item.checks.length > 0).map(({ group }) => `${group.id}/${group.example}`));
  const documented = [...applied.keys()].map((id) => ({ ...known.entries.get(id), groups: applied.get(id).sort() }));
  const report = {
    pin,
    environment: { viewport: VIEWPORT, deviceScaleFactor: 1, reducedMotion: 'reduce', colorScheme: 'light', frameWidth: 720 },
    groups: pages.size,
    languages: [...languages].sort(),
    frameworks: FRAMEWORKS,
    interactionChecks,
    comparedAfterInteraction: interacted.size,
    comparedAtRestOnly: pages.size - interacted.size,
    documentedDifferences: documented,
    failures: [...failures].sort(),
    comparisons: rows,
  };
  writeFileSync(join(outDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  for (const entry of documented) {
    const scope = entry.ignore ? `ignores ${entry.ignore.map((rule) => `${rule.attribute} on .${rule.class}`).join(', ')}` : 'skipped';
    log(`equivalence: documented difference ${entry.id} (${entry.component}, ${entry.aspect}, approved by ${entry.approvedBy}, ${entry.source}) ${scope} for ${entry.groups.join(', ')}: ${entry.description}`);
  }
  if (failures.length > 0) throw new Error([...failures].sort().join('\n'));
  report.summary = summaryLine({
    groups: pages.size, languages: languages.size, frameworks: FRAMEWORKS.length, interactionChecks,
    afterInteraction: interacted.size, restOnly: pages.size - interacted.size, documented: documented.length,
  });
  return report;
}

/** The checks a group names (check=<a>[,<b>...]). */
export const checkNames = (group) => (typeof group.check === 'string' && group.check !== '' ? group.check.split(',') : []);

/** Ids of components.json whose components have a controller (sourceType interactive). */
export function controllerComponents(file) {
  if (!existsSync(file)) return new Set();
  const catalogue = JSON.parse(readFileSync(file, 'utf8'));
  return new Set((catalogue.components ?? []).filter((entry) => entry.sourceType === 'interactive').map((entry) => entry.id));
}

/**
 * The run must compare exactly the groups of the built pages: the live groups
 * file and the content manifest list the same groups, there is at least one,
 * and every --only key names one of them. Returns failure lines.
 */
export function scopeErrors(groups, manifest, only) {
  const errors = [];
  const keys = new Set(groups.map(groupKey));
  if (keys.size === 0) errors.push('HWE-SCOPE .cache/content/live-groups.json:1: no live group to compare');
  if (!manifest) errors.push('HWE-SCOPE src/generated/content/manifest.json:1: the content manifest does not exist; build step 20-content writes it');
  else {
    const expected = new Set();
    for (const page of manifest.pages ?? []) {
      for (const lang of page.langs ?? []) for (const group of page.liveGroups ?? []) expected.add(`${page.id}/${lang}/${group.example}`);
    }
    const missing = [...expected].filter((key) => !keys.has(key)).sort();
    const extra = [...keys].filter((key) => !expected.has(key)).sort();
    if (missing.length > 0) errors.push(`HWE-SCOPE .cache/content/live-groups.json:1: the built pages have the groups ${missing.join(', ')}, which the live groups file lacks`);
    if (extra.length > 0) errors.push(`HWE-SCOPE .cache/content/live-groups.json:1: the groups ${extra.join(', ')} belong to no built page`);
  }
  for (const key of only ?? []) {
    if (!keys.has(key)) errors.push(`HWE-SCOPE --only:1: ${key} names no live group (keys are <id>/<lang>/<example>)`);
  }
  return errors;
}

/** The closing line of a passing run. */
export function summaryLine({ groups, languages, frameworks, interactionChecks, afterInteraction, restOnly, documented }) {
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  return `equivalence: ${groups} groups x ${languages} languages x ${frameworks} frameworks equal `
    + `(${afterInteraction} compared after interaction, ${restOnly} at rest only; `
    + `${plural(interactionChecks, 'interaction check', 'interaction checks')}, ${plural(documented, 'documented difference', 'documented differences')})`;
}

/** The pinned package version the frames load (build-info.json of step 00, else package.json). */
export function readPin(guideDir) {
  const info = join(guideDir, 'src', 'generated', 'build-info.json');
  if (existsSync(info)) {
    const pin = JSON.parse(readFileSync(info, 'utf8')).pin;
    if (typeof pin === 'string' && pin) return pin;
  }
  return JSON.parse(readFileSync(join(guideDir, 'package.json'), 'utf8')).dependencies['@hawiyah/styles'];
}

export function parseArgs(argv) {
  const options = { browserDir: 'dist/browser', basePath: process.env.HAWIYAH_BASE_PATH ?? '/hawiyah/', only: null };
  for (let i = 0; i < argv.length; i += 1) {
    const [flag, inline] = argv[i].split('=', 2);
    const value = inline ?? argv[++i];
    if (value === undefined) throw new Error(`${flag} needs a value`);
    if (flag === '--dir') options.browserDir = value;
    else if (flag === '--base') options.basePath = value;
    else if (flag === '--only') options.only = value.split(',').filter(Boolean);
    else throw new Error(`unknown option ${flag}`);
  }
  return options;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const report = await runEquivalence({ ...parseArgs(process.argv.slice(2)), guideDir: GUIDE_DIR });
    console.log(report.summary);
  } catch (error) {
    console.log(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
