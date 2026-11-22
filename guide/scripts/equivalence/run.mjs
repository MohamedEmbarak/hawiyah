#!/usr/bin/env node
// Equivalence harness runner (contentPipeline.equivalence).
//
//   node scripts/equivalence/run.mjs [--dir dist/browser] [--base /hawiyah/] [--only <id>/<lang>/<example>,...]
//                                    [--pages <id>,...] [--shard <i>/<n>] [--report <file>] [--workers <n>] [--draft]
//
// --draft leaves HWE-KEYS out (a local run, such as the shards of the scale fixture,
// whose generated pages have no keyboard checks); merge.mjs refuses such a report.
//
// --pages compares only the groups of the named pages (build option --pages).
// --shard i/n compares the i-th of n parts of the sorted group keys (key k of the
// sorted list belongs to shard (k mod n) + 1), writes its report to --report
// (default .cache/equivalence/shard-<i>-of-<n>.json) and its diff images to
// .cache/equivalence/shard-<i>/; scripts/equivalence/merge.mjs joins the reports
// and fails unless together they compared exactly the groups of the content manifest.
// --workers (or HAWIYAH_EQUIVALENCE_WORKERS) sets the number of groups compared at
// once (default 2).
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
// that could not run or pressed other keys than it declares, or a group of a
// component with a controller that names no check and is not static), HWE-EXPECT
// (a step's documented outcome failed in a frame, 5a.8), HWE-KEYS (the keys of a
// page's keyboard table differ from the keys its checks press, keys.mjs), HWE-AXE
// (axe found a WCAG 2.2 AA violation in a frame document at rest), HWE-KD
// (known-differences.json invalid or not found), HWE-SCOPE (no group, an --only key
// that names none, or groups that differ from the content manifest).
//
// A framed group (frame on its html block, 5a.9) is compared in frames 1280 px
// wide, and at rest a second time at 390 px when its html block names width=390.
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { chromium } from '@playwright/test';
import { contentManifestHash } from '../build-scope.mjs';
import { createPagesServer } from '../serve.mjs';
import { FRAMEWORKS, compareAria, compareScreenshots, compareStructure, structureMessages, withoutDesigned } from './compare.mjs';
import { generatedNamePattern } from './generated-names.mjs';
import { keyName, keyboardReportLines, keyboardRule, keyboardScope, readKeyboardExceptions, stepErrors, uncheckedLine } from './keys.mjs';
import { normalize } from './normalize.js';
import { styledAttributes } from './styled-attributes.mjs';

const here = dirname(fileURLToPath(import.meta.url));
export const GUIDE_DIR = resolve(here, '..', '..');
export const HARNESS_PATH = '__harness/';
export const VIEWPORT = { width: 1280, height: 900 };
export const ASPECTS = ['structure', 'aria', 'screenshot'];
const ASPECT_CODES = { structure: 'HWE-STRUCT', aria: 'HWE-ARIA', screenshot: 'HWE-SHOT' };

/** Width of the result frames: 720 px, 1280 px for a framed group (5a.9), and 390 px for its second pass. */
export const FRAME_WIDTH = 720;
export const FRAMED_WIDTH = 1280;

/** The WCAG 2.2 AA tags of axe, as the browser tests of the guide use them. */
export const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
let axeSource = null;
/** The source of axe-core (the copy @axe-core/playwright installs), evaluated in each frame through the DevTools protocol. */
export function readAxeSource() {
  const require = createRequire(import.meta.url);
  axeSource ??= readFileSync(require.resolve('axe-core/axe.min.js', { paths: [dirname(require.resolve('@axe-core/playwright'))] }), 'utf8');
  return axeSource;
}

/**
 * Runs axe in the frame document of each framework (HWE-AXE): WCAG 2.2 AA, the
 * whole document of the result. Returns { violations: { framework, lines }[], frames }.
 */
export async function axeFrames(page, frameworks = FRAMEWORKS) {
  const source = readAxeSource();
  const out = [];
  for (const framework of frameworks) {
    const frame = await frameOf(page, framework);
    await frame.evaluate(source);
    const lines = await frame.evaluate(async (tags) => {
      const axe = /** @type {any} */ (globalThis).axe;
      const result = await axe.run(document, { runOnly: { type: 'tag', values: tags }, preload: false });
      return result.violations.map((rule) => `${rule.id}: ${rule.help} (${rule.nodes.map((node) => node.target.join(' ')).join(', ')})`);
    }, AXE_TAGS);
    if (lines.length > 0) out.push({ framework, lines });
  }
  return { violations: out, frames: frameworks.length };
}

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

/** The repository's package READMEs a designed difference may cite, read from the installed packages. */
const README_SOURCE = /^@hawiyah\/(vanilla|react|vue|angular|styles|core|tokens) README\.md: "(.+)"$/s;

/**
 * Validates the two lists of designed differences (G11 of the 5a fix round), both the
 * lead's: empty-elements.json, [{ component, class, reason, reference, approvedBy }]
 * (an element with that hw- class is left out of the structure comparison of the
 * component's groups while it is empty), and vanilla-hooks.json, [{ component,
 * attribute, reason, reference, approvedBy }] (a data-hw-* configuration attribute
 * that the installed @hawiyah/vanilla reads and the stylesheet does not select is
 * left out of the vanilla tree of the component's groups). reference is a CHANGELOG
 * entry ('CHANGELOG.md, <version>, <section>: <text>', for a defect) or the sentence
 * of a package README ('@hawiyah/<name> README.md: "<sentence>"', for a documented
 * behaviour); both are checked against the files. Returns { empty, hooks, errors }.
 */
export function validateDesignedDifferences({ empty, hooks }, { changelog = readChangelog(), readme = () => null, vanillaText = '', styled = new Map() } = {}) {
  const errors = [];
  const check = (list, name, field, form) => {
    if (!Array.isArray(list)) {
      errors.push(`HWE-KD scripts/equivalence/${name}:1: the file must hold an array`);
      return [];
    }
    list.forEach((entry, index) => {
      const at = `HWE-KD scripts/equivalence/${name}:1: entry ${index + 1}`;
      const keys = ['component', field, 'reason', 'reference', 'approvedBy'];
      if (!entry || typeof entry !== 'object' || Object.keys(entry).sort().join() !== [...keys].sort().join() || keys.some((key) => typeof entry[key] !== 'string' || entry[key].trim() === '')) {
        errors.push(`${at} must be { ${keys.join(', ')} } with non-empty values`);
        return;
      }
      if (!form.test(entry[field])) errors.push(`${at}: ${field} ${entry[field]} is not one ${field === 'class' ? 'hw- class name' : 'data-hw-* attribute name'}`);
      const fromChangelog = changelogSourceError(entry.reference, changelog);
      const readmeMatch = README_SOURCE.exec(entry.reference);
      if (fromChangelog && !readmeMatch) errors.push(`${at}: reference must be a CHANGELOG.md entry (${fromChangelog}) or '@hawiyah/<name> README.md: "<sentence>"'`);
      if (readmeMatch && !squeeze(readme(readmeMatch[1]) ?? '').includes(squeeze(readmeMatch[2]))) errors.push(`${at}: the sentence is not in the README of the installed @hawiyah/${readmeMatch[1]}`);
      if (field === 'attribute' && form.test(entry.attribute)) {
        if (!new RegExp(`${entry.attribute}(?![\\w-])|dataset\\.${entry.attribute.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())}(?![\\w$])`).test(vanillaText)) errors.push(`${at}: the installed @hawiyah/vanilla does not read ${entry.attribute}`);
        if (styled.has(entry.attribute)) errors.push(`${at}: the stylesheet selects ${entry.attribute}, so the structure comparison keeps it`);
      }
    });
    return list.filter((entry) => entry && typeof entry.component === 'string');
  };
  return {
    empty: check(empty, 'empty-elements.json', 'class', /^hw-[a-z0-9-]+$/),
    hooks: check(hooks, 'vanilla-hooks.json', 'attribute', /^data-hw-[a-z0-9-]+$/),
    errors,
  };
}

/** Reads and validates the lists of designed differences against the installed packages. */
export function readDesignedDifferences(guideDir = GUIDE_DIR) {
  const json = (name) => JSON.parse(readFileSync(join(here, name), 'utf8'));
  const lists = { empty: json('empty-elements.json'), hooks: json('vanilla-hooks.json') };
  // Empty lists need nothing of the installed packages.
  if (Array.isArray(lists.empty) && Array.isArray(lists.hooks) && lists.empty.length === 0 && lists.hooks.length === 0) return { empty: [], hooks: [], errors: [] };
  const packages = join(guideDir, 'node_modules', '@hawiyah');
  const readme = (name) => {
    try {
      return readFileSync(join(packages, name, 'README.md'), 'utf8');
    } catch {
      return null;
    }
  };
  const dist = join(packages, 'vanilla', 'dist');
  const vanillaText = existsSync(dist) ? readdirSync(dist).filter((file) => file.endsWith('.js')).map((file) => readFileSync(join(dist, file), 'utf8')).join('\n') : '';
  const styled = new Map(Object.entries(normalizerInputs(guideDir).styled ?? {}));
  return validateDesignedDifferences(lists, { readme, vanillaText, styled });
}

/** A reader of the README of an installed @hawiyah package by its short name, or null. */
export function installedReadme(guideDir = GUIDE_DIR) {
  return (name) => {
    try {
      return readFileSync(join(guideDir, 'node_modules', '@hawiyah', name, 'README.md'), 'utf8');
    } catch {
      return null;
    }
  };
}

/**
 * The problem of a reference of a lead's list entry, or null: a CHANGELOG.md entry
 * ('CHANGELOG.md, <version>, <section>: <text>') that changelogSourceError accepts, or
 * the sentence of a package README ('@hawiyah/<name> README.md: "<sentence>"') that the
 * README of the installed package holds (the keyboard-exceptions.json entries that leave
 * a component's keyboard outcomes unchecked).
 */
export function documentReferenceError(reference, { changelog = readChangelog(), readme = () => null } = {}) {
  const fromReadme = README_SOURCE.exec(String(reference));
  if (fromReadme) return squeeze(readme(fromReadme[1]) ?? '').includes(squeeze(fromReadme[2])) ? null : `quotes a sentence that the README of the installed @hawiyah/${fromReadme[1]} does not hold`;
  const fromChangelog = changelogSourceError(reference, changelog);
  return fromChangelog ? `must be '@hawiyah/<name> README.md: "<sentence>"' or a CHANGELOG.md entry (${fromChangelog})` : null;
}

/** The designed differences of one component: { emptyClasses, vanillaAttributes }. */
export function designedOf(id, lists) {
  return {
    emptyClasses: lists.empty.filter((entry) => entry.component === id).map((entry) => entry.class),
    vanillaAttributes: lists.hooks.filter((entry) => entry.component === id).map((entry) => entry.attribute),
  };
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
export async function startHarnessServer({ dir, base, harnessFile, port = 0, examplesDir = null }) {
  const pages = createPagesServer({ dir, base }).listeners('request')[0];
  // check:page serves the payloads it compiled (examplesDir) in place of <dir>/examples/.
  const examples = examplesDir ? createPagesServer({ dir: examplesDir, base: `${base}examples/` }).listeners('request')[0] : null;
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
    if (examples && pathname.startsWith(`${base}examples/`)) {
      examples(request, response);
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
export function harnessUrl(origin, base, group, pin, frameworks = FRAMEWORKS, width = group.frame ? FRAMED_WIDTH : FRAME_WIDTH) {
  const query = new URLSearchParams({ id: group.id, lang: group.lang, example: group.example, pin, frameworks: frameworks.join(','), width: String(width) });
  return `${origin}${base}${HARNESS_PATH}?${query}`;
}

/** Opens the harness for a group and waits until every frame is ready or failed. */
export async function openGroup(page, url) {
  await page.goto(url);
  await page.waitForFunction(() => window.__harness && window.__harness.done, null, { timeout: 60_000 });
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

/**
 * Clears the hover state of a result frame before it is read, so the comparison does
 * not depend on where the pointer was.
 *
 * Cause (measured with scripts outside the repository): a result frame keeps :hover on
 * the element the pointer was last over, because Chromium sends it no mouse leave when
 * the pointer moves out to the page. When the page then scrolls (an element screenshot
 * scrolls its frame into view), Chromium sends the frame that last had the pointer a
 * mouse move at the pointer's old place in the viewport; after the scroll that place
 * lies over another element of the frame, or over none, so that frame alone changes
 * its hover. When the move arrives depends on the load of the machine.
 *
 * The pointer is moved onto the frame's own left padding (2 px inside its left edge,
 * where the frame document's body padding lies at every height, so a later scroll maps
 * the old place onto the padding again), then parked in the harness page's inline
 * padding (4, 4), which no frame covers at any scroll position; then every frame of the
 * group must have no hovered element below its body. A step that tests a hover state
 * sets keepPointer and is read as it left the pointer.
 */
async function clearHover(page, framework, frameworks) {
  const element = page.locator(`iframe[data-framework="${framework}"]`);
  await element.scrollIntoViewIfNeeded();
  const box = await element.boundingBox();
  if (box) await page.mouse.move(box.x + 2, Math.max(box.y, 0) + 2);
  await page.mouse.move(4, 4);
  for (const name of frameworks) {
    const frame = await frameOf(page, name);
    await frame
      .waitForFunction(() => document.querySelector('body :hover') === null, null, { timeout: 5_000 })
      .catch(async () => {
        const hovered = await frame.evaluate(() => Array.from(document.querySelectorAll('body :hover')).map((node) => node.localName + (node.className ? `.${String(node.className).split(' ')[0]}` : '')).join(' > '));
        throw new Error(`the ${name} frame still shows a hover state (${hovered}) after the pointer was parked outside every frame`);
      });
  }
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
 * page matches :focus and :focus-visible. Unless keepPointer is set, the hover state
 * is cleared before each frame is read (clearHover).
 */
let normalizeInputs = null;
/** What the normaliser reads from the installed packages: generated names and styled data-hw-* attributes. */
export function normalizerInputs(guideDir = GUIDE_DIR) {
  normalizeInputs ??= { generatedName: generatedNamePattern(guideDir), styled: styledAttributes(guideDir) };
  return normalizeInputs;
}

export async function capture(page, frameworks = FRAMEWORKS, before = null, { keepPointer = false } = {}) {
  const out = { trees: {}, snapshots: {}, images: {} };
  const inputs = normalizerInputs();
  for (const framework of frameworks) {
    if (before) await before(framework);
    const frame = await frameOf(page, framework);
    await settleFrame(frame);
    await settleHeight(page, frame, framework);
    if (!keepPointer) await clearHover(page, framework, frameworks);
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
export function compareCapture(captured, difference = null, designed = null) {
  const rows = [];
  // The designed differences of the component (G11 of the 5a fix round) change the structure trees only.
  if (designed && (designed.emptyClasses.length || designed.vanillaAttributes.length)) {
    captured = { ...captured, trees: Object.fromEntries(Object.entries(captured.trees).map(([framework, tree]) => [framework, withoutDesigned(tree, designed, framework)])) };
  }
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

/**
 * The failure lines of a comparison row that differs, each '<code> <file>:<line>:
 * <example> (<lang>, <state>) <message>'. Screenshot messages do not name the pair, so
 * the framework is added; a structure row gives one line per printed difference of
 * the pair (at most 20) and one line that counts the rest (structureMessages).
 */
export function comparisonFailures(group, state, row) {
  const messages = row.aspect === 'screenshot' ? [`vanilla and ${row.framework} screenshots differ: ${row.message}`]
    : row.aspect === 'structure' ? structureMessages(row) : [row.message];
  return messages.map((message) => failureLine(ASPECT_CODES[row.aspect], group, `${group.example} (${group.lang}, ${state}) ${message}`));
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

export const groupKey = (group) => `${group.id}/${group.lang}/${group.example}`;
const stem = (group, state) => [group.id, group.lang, group.example, ...(state === 'rest' ? [] : state.split('/'))].join('-');

/** How long the harness waits for the documented outcome of a step (ms, lead decision L16 of 5a). */
export const OUTCOME_TIMEOUT = 5_000;
/** How long the harness waits after the last step of a check before it reads every frame once more (ms, G6 of the 5a fix round). */
export const FINAL_SETTLE = 500;

const firstLine = (error) => (error instanceof Error ? error.message.split('\n')[0] : String(error));

/**
 * The verdict on a step's outcome (lead decision L16 of 5a). An adapter may show the
 * outcome of an event in a later task than the event: @hawiyah/angular renders
 * after zoneless change detection, which Angular schedules in the first animation
 * frame or 0 ms timer after the event, while the vanilla controller writes the state
 * in the event's task and React and Vue in its microtasks; a read of the frame right
 * after the key press is not ordered after that render. So the assertion (which reads
 * the frame and compares it with the state the oracle computed) is applied until it
 * holds or `timeout` ms have passed (every `interval` ms); then the frame renders
 * twice more (settle) and the assertion is applied once again, and that application
 * is the verdict: a wrong outcome fails after the bound with the check's message,
 * and an outcome that held and then changed fails the second application. The step
 * itself is never run again and the expected outcome is never changed. Returns null
 * when the outcome holds, else the message of the miss.
 */
export async function awaitOutcome(expect, settle, { timeout = OUTCOME_TIMEOUT, interval = 20 } = {}) {
  const deadline = Date.now() + timeout;
  let held = false;
  for (;;) {
    try {
      await expect();
      held = true;
    } catch {
      held = false;
    }
    if (held || Date.now() >= deadline) break;
    await new Promise((done) => setTimeout(done, interval));
  }
  await settle();
  try {
    await expect();
    return null;
  } catch (error) {
    return held ? `${firstLine(error)} (the documented outcome was shown, then changed)` : `${firstLine(error)} (not shown within ${timeout} ms)`;
  }
}

/**
 * Key recorder of a frame (G6 of the 5a fix round): a capture listener on the frame's
 * window that records every trusted keydown as a key id of KEY_NAMES (a chord as
 * 'Shift+Tab'; ' ' is Space; a lone modifier is not recorded). The harness reads and
 * clears it around each step, so a key counts whatever API pressed it.
 */
async function recordKeys(frame) {
  await frame.evaluate(() => {
    const target = /** @type {any} */ (window);
    if (!target.__hawiyahKeys) {
      target.__hawiyahKeys = [];
      window.addEventListener('keydown', (event) => {
        if (!event.isTrusted || ['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) return;
        const key = event.key === ' ' ? 'Space' : event.key;
        target.__hawiyahKeys.push([event.ctrlKey && 'Control', event.altKey && 'Alt', event.shiftKey && 'Shift', event.metaKey && 'Meta', key].filter(Boolean).join('+'));
      }, true);
    }
    target.__hawiyahKeys.length = 0;
  });
}
const recordedKeys = (frame) => frame.evaluate(() => [.../** @type {any} */ (window).__hawiyahKeys]);

/**
 * Runs the checks of a group in the open harness page (5a.8; the oracle of G6 of the
 * 5a fix round). A check is { name, read, assert, start?, negative, steps }; a step is
 * { name, run, expect, keys?, outcome, reference, keepPointer? } (README.md, Build
 * steps). In each frame:
 *   - before the first step, read(mount) reads the frame at rest once, and start (or
 *     the read itself) is the state the oracle starts from;
 *   - before each step, assert(read(), expected, { phase: 'before' }) requires the
 *     frame to still show the state the oracle computed for the previous step;
 *   - the step runs; the trusted keydown events the frame recorded must be exactly
 *     the keys the step declares (HWE-CHECK), whatever API pressed them;
 *   - expect(previous, context) returns the state the oracle expects after the step,
 *     from the state it expected before (never from the frame), and the frame must
 *     show it, through awaitOutcome; a miss is HWE-EXPECT with the outcome and its
 *     reference. The chain goes on from the expected state, whatever the frame shows;
 *   - after the last step of a check, the harness waits FINAL_SETTLE ms and asserts
 *     the last expected state once more in every frame.
 * Then the four results are captured and handed to evaluate(state, captured). A step
 * that cannot run ends the checks of the group (HWE-CHECK). Returns { failures,
 * asserted }, where asserted counts the steps whose outcome held in every frame.
 * oracle 'negative' asserts check.negative.wrong(expected) instead of the expected
 * state (the negative control of a check: every keyed step must then fail), while the
 * chain and the before-step assertion keep the documented states.
 */
export async function runChecks({
  page, group, checks, frameworks = FRAMEWORKS, evaluate = async () => {}, outcomeTimeout = OUTCOME_TIMEOUT, finalSettle = FINAL_SETTLE, oracle = 'documented',
}) {
  const failures = [];
  let asserted = 0;
  const dir = group.lang === 'ar' ? 'rtl' : 'ltr';
  const located = (framework) => {
    const frameLocator = page.frameLocator(`iframe[data-framework="${framework}"]`);
    return { frameLocator, mount: frameLocator.locator(mountSelector(framework)) };
  };
  for (const check of checks) {
    // Per frame: the scratch state a check keeps between its steps, and the state the oracle expects.
    const states = Object.fromEntries(frameworks.map((framework) => [framework, { scratch: {}, expected: null }]));
    const contextOf = (framework, extra = {}) => ({
      page, mount: located(framework).mount, dir, lang: group.lang, framework, state: states[framework].scratch, expected: states[framework].expected, ...extra,
    });
    try {
      for (const framework of frameworks) {
        const context = contextOf(framework);
        const observed = await check.read(context.mount, context);
        states[framework].expected = typeof check.start === 'function' ? check.start(observed, context) : observed;
      }
    } catch (error) {
      failures.push(failureLine('HWE-CHECK', group, `${check.name} cannot read the frames at rest: ${firstLine(error)}`));
      return { failures, asserted };
    }
    for (const step of check.steps) {
      let failed = null;
      const missed = [];
      const before = async (framework) => {
        if (failed) return;
        const { frameLocator } = located(framework);
        const frame = await frameOf(page, framework);
        const context = contextOf(framework, {
          /** Presses a key or chord (a key id of KEY_NAMES) on a locator, or on the focused element of the frame (null). */
          press: async (locator, key) => {
            if (locator) await locator.press(key);
            else await page.keyboard.press(key);
          },
          /** Clicks the start of the frame document (its body padding), so the next Tab enters the example from before it. */
          focusFrameStart: async () => {
            // Playwright scrolls the frame into view and checks that the point hits the body (its padding).
            await frameLocator.locator('body').click({ position: { x: 2, y: 2 } });
          },
        });
        const previous = states[framework].expected;
        try {
          check.assert(await check.read(context.mount, context), previous, { phase: 'before', context });
        } catch (error) {
          missed.push(`${framework}: before the step, the frame no longer shows the outcome the oracle computed for the previous step: ${firstLine(error)}`);
        }
        try {
          await recordKeys(frame);
          await step.run(context);
        } catch (error) {
          failed = `${check.name} step ${step.name} failed in ${framework}: ${firstLine(error)}`;
          return;
        }
        const declared = [...new Set(step.keys ?? [])].sort();
        const used = [...new Set(await recordedKeys(frame))].sort();
        if (declared.join(' ') !== used.join(' ')) {
          failed = `${check.name} step ${step.name} pressed ${used.map((key) => keyName(key)).join(', ') || 'no key'} in ${framework} (trusted keydown events of the frame), and declares ${declared.map((key) => keyName(key)).join(', ') || 'no key'}; a step presses exactly the keys it declares`;
          return;
        }
        let next;
        try {
          next = await step.expect(previous, context);
        } catch (error) {
          failed = `${check.name} step ${step.name}: the oracle has no outcome in ${framework}: ${firstLine(error)}`;
          return;
        }
        const verdict = oracle === 'negative' ? check.negative.wrong(next, context) : next;
        const miss = await awaitOutcome(async () => check.assert(await check.read(context.mount, context), verdict, { phase: 'after', context }), () => settleFrame(frame), { timeout: outcomeTimeout });
        if (miss) missed.push(`${framework}: ${miss}`);
        states[framework].expected = next;
      };
      const captured = await capture(page, frameworks, before, { keepPointer: Boolean(step.keepPointer) });
      if (failed) {
        failures.push(failureLine('HWE-CHECK', group, failed));
        return { failures, asserted };
      }
      for (const line of missed) {
        failures.push(failureLine('HWE-EXPECT', group, `${group.example} (${group.lang}) ${check.name}/${step.name} in ${line}; documented outcome: ${step.outcome} [${step.reference}]`));
      }
      if (missed.length === 0) asserted += 1;
      await evaluate(`${check.name}/${step.name}`, captured);
    }
    // The outcome of the last step, once more after a fixed settle: a change that comes later than this is not seen.
    await new Promise((done) => setTimeout(done, finalSettle));
    const last = check.steps.at(-1);
    for (const framework of frameworks) {
      const context = contextOf(framework);
      const expected = oracle === 'negative' ? check.negative.wrong(states[framework].expected, context) : states[framework].expected;
      try {
        check.assert(await check.read(context.mount, context), expected, { phase: 'final', context });
      } catch (error) {
        failures.push(failureLine('HWE-EXPECT', group, `${group.example} (${group.lang}) ${check.name}/${last?.name} in ${framework}: ${firstLine(error)} (the outcome of the last step changed within ${finalSettle} ms); documented outcome: ${last?.outcome} [${last?.reference}]`));
      }
    }
  }
  return { failures, asserted };
}

/** Runs one group; returns { rows, failures, asserted, axeFrames }. */
async function runGroup({ page, origin, base, pin, group, checks, difference, designed = null, outDir, imageDir = '.cache/equivalence' }) {
  const rows = [];
  const failures = [];
  let axeCount = 0;
  const open = async (width) => {
    const harness = await openGroup(page, harnessUrl(origin, base, group, pin, FRAMEWORKS, width));
    if (harness.error) return [failureLine('HWE-FRAME', group, harness.error)];
    return FRAMEWORKS.flatMap((framework) => {
      const frame = harness.frames[framework];
      return !frame || frame.state !== 'ready' ? [failureLine('HWE-FRAME', group, `${framework} frame ${frame?.state ?? 'missing'}: ${frame?.message ?? ''}`)] : [];
    });
  };
  const opened = await open(group.frame ? FRAMED_WIDTH : FRAME_WIDTH);
  if (opened.length > 0) return { rows, failures: opened, asserted: 0, axeFrames: 0 };

  const evaluate = async (state, captured) => {
    for (const row of compareCapture(captured, difference, designed)) {
      const entry = { group: groupKey(group), state, ...row };
      delete entry.equal;
      delete entry.diff;
      if (row.result === 'different') {
        failures.push(...comparisonFailures(group, state, row));
        if (row.aspect === 'screenshot') {
          const base = stem(group, state);
          writeFileSync(join(outDir, `${base}-vanilla.png`), captured.images.vanilla);
          writeFileSync(join(outDir, `${base}-${row.framework}-actual.png`), captured.images[row.framework]);
          if (row.diff) {
            writeFileSync(join(outDir, `${base}-${row.framework}.png`), row.diff);
            entry.diffImage = `${imageDir}/${base}-${row.framework}.png`;
          }
        }
      }
      rows.push(entry);
    }
  };
  /** HWE-AXE: axe in each frame document at rest. */
  const axe = async (state) => {
    const result = await axeFrames(page);
    axeCount += result.frames;
    for (const { framework, lines } of result.violations) {
      for (const line of lines) failures.push(failureLine('HWE-AXE', group, `${group.example} (${group.lang}, ${state}) ${framework} frame: ${line}`));
    }
  };

  await evaluate('rest', await capture(page, FRAMEWORKS));
  await axe('rest');
  // The checks run one after the other in the same frames.
  const checked = await runChecks({ page, group, checks, evaluate });
  failures.push(...checked.failures);
  const after = await page.evaluate(() => window.__harness.frames);
  for (const framework of FRAMEWORKS) {
    for (const line of after[framework]?.log ?? []) failures.push(failureLine('HWE-FRAME', group, `${framework} frame reported ${line}`));
  }
  // A framed group with width=390: the results at rest again in frames 390 px wide.
  if (group.frame && group.width) {
    const narrow = await open(Number(group.width));
    if (narrow.length > 0) failures.push(...narrow);
    else {
      await evaluate(`rest@${group.width}`, await capture(page, FRAMEWORKS));
      await axe(`rest@${group.width}`);
    }
  }
  return { rows, failures, asserted: checked.asserted, axeFrames: axeCount };
}

/**
 * Runs the harness over every group. Options: guideDir, browserDir (relative to
 * guideDir), basePath, cacheDir, only (array of '<id>/<lang>/<example>'), port,
 * workers, log; check:page adds groupsFile, manifestFile, outDir and examplesDir
 * (the payloads it compiled, served in place of <browserDir>/examples/), so it
 * reads and writes nothing of the build output. Returns the report; throws with
 * the failure lines.
 */
export async function runEquivalence(options) {
  const guideDir = options.guideDir ?? GUIDE_DIR;
  const log = options.log ?? ((message) => console.log(message));
  const base = options.basePath ?? '/';
  const browserDir = resolve(guideDir, options.browserDir ?? 'dist/browser');
  const cacheDir = resolve(guideDir, options.cacheDir ?? '.cache');
  const outDir = options.outDir ? resolve(guideDir, options.outDir) : join(cacheDir, 'equivalence');
  if (!existsSync(join(browserDir, 'runtime', 'import-map.json'))) throw new Error(`${relative(guideDir, browserDir)}/runtime/import-map.json does not exist; build step 60-runtime writes it`);
  const groupsFile = options.groupsFile ? resolve(guideDir, options.groupsFile) : join(cacheDir, 'content', 'live-groups.json');
  if (!existsSync(groupsFile)) throw new Error(`${relative(guideDir, groupsFile)} does not exist; build step 20-content writes it`);
  const allGroups = JSON.parse(readFileSync(groupsFile, 'utf8'));
  // The groups must be those of the pages that were built (src/generated/content/manifest.json).
  const manifestFile = resolve(guideDir, options.manifestFile ?? 'src/generated/content/manifest.json');
  const scope = [
    ...scopeErrors(allGroups, existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, 'utf8')) : null, options.only),
    ...pagesErrors(allGroups, options.pages),
  ];
  const shard = options.shard ? parseShard(options.shard) : null;
  if (scope.length > 0) throw new Error(scope.join('\n'));
  let selected = options.only ? allGroups.filter((group) => options.only.includes(groupKey(group))) : allGroups;
  if (options.pages) selected = selected.filter((group) => options.pages.includes(group.id));
  const groups = shard ? shardGroups(selected, shard) : selected;

  const pin = readPin(guideDir);
  const known = validateKnownDifferences(JSON.parse(readFileSync(join(here, 'known-differences.json'), 'utf8')));
  const designedLists = readDesignedDifferences(guideDir);
  const failures = [...known.errors, ...designedLists.errors];
  const componentsFile = options.componentsFile ?? resolve(guideDir, '..', 'components.json');
  // The keyboard rule (HWE-KEYS) reads every check the groups of a page name, also
  // those of groups outside this run's selection or shard.
  const manifest = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, 'utf8')) : { pages: [] };
  const selectedIds = new Set(selected.map((group) => group.id));
  const keyPages = (manifest.pages ?? []).filter((page) => selectedIds.has(page.id));
  const checks = await loadChecks([...new Set([...groups.flatMap(checkNames), ...keyPages.flatMap((page) => (page.liveGroups ?? []).flatMap(checkNames))])]);
  // A component with a controller: its page targets a controller factory of the installed
  // @hawiyah/vanilla (keys.mjs). One definition for HWE-CHECK and HWE-KEYS (G19 of the 5a fix round).
  const controllerScope = options.keyboardScope ?? await keyboardScope({ guideDir, componentsFile });
  // An entry of keyboard-exceptions.json that leaves a component unchecked must match a
  // page: one of the content manifest, or one that check:page names (knownPages).
  const keys = keyboardRule({
    pages: keyPages, checks, scope: controllerScope, exceptions: options.keyboardExceptions ?? readKeyboardExceptions(),
    knownPages: options.knownPages ?? (manifest.pages ?? []).map((page) => page.id),
    referenceError: (reference) => documentReferenceError(reference, { readme: installedReadme(guideDir) }),
  });
  if (options.keys !== false) {
    for (const check of checks.values()) failures.push(...stepErrors(check));
    failures.push(...keys.errors);
  }
  for (const id of keys.unchecked) log(uncheckedLine(id));
  const withController = new Set(controllerScope.keys());
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
    plan.push({ group, difference: difference.entry ?? null, designed: designedOf(group.id, designedLists), checks: checkNames(group).map((name) => checks.get(name)).filter(Boolean) });
  }
  if (failures.length > 0) throw new Error(failures.join('\n'));

  // A shard writes into its own directory, so the reports of the other shards stay.
  const workDir = shard ? join(outDir, `shard-${shard.index}`) : outDir;
  const reportFile = options.report ? resolve(guideDir, options.report) : shard ? join(outDir, `shard-${shard.index}-of-${shard.total}.json`) : join(outDir, 'report.json');
  rmSync(workDir, { recursive: true, force: true });
  mkdirSync(join(workDir, 'harness'), { recursive: true });
  const harnessFile = join(workDir, 'harness', 'harness.js');
  await bundleHarness(harnessFile);
  const served = await startHarnessServer({
    dir: browserDir, base, harnessFile, port: options.port ?? Number(process.env.HAWIYAH_EQUIVALENCE_PORT ?? 0),
    examplesDir: options.examplesDir ? resolve(guideDir, options.examplesDir) : null,
  });
  const browser = await chromium.launch({ executablePath: chromiumPath() });
  const rows = [];
  const applied = new Map();
  let asserted = 0;
  let axeChecked = 0;
  const assertedOf = new Map();
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
          const result = await runGroup({ page, origin: served.origin, base, pin, outDir: workDir, imageDir: relative(guideDir, workDir).split('\\').join('/'), ...item });
          for (const message of pageErrors) result.failures.push(failureLine('HWE-FRAME', item.group, `harness page error: ${message}`));
          rows.push(...result.rows);
          failures.push(...result.failures);
          asserted += result.asserted;
          axeChecked += result.axeFrames;
          assertedOf.set(groupKey(item.group), result.asserted);
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
    const workers = Math.max(1, Math.min(workerCount(options.workers ?? process.env.HAWIYAH_EQUIVALENCE_WORKERS), plan.length));
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
    // The content manifest this run compared (G16 of the 5a fix round); merge.mjs compares it with the build record.
    contentManifest: contentManifestHash(manifestFile),
    scope: { pages: options.pages ?? null, only: options.only ?? null, shard, ...(options.keys === false ? { draft: true } : {}) },
    // The keys this run was to compare (before the shard split) and the keys it compared,
    // each with the number of its interaction checks: what merge.mjs joins.
    selected: selected.map(groupKey).sort(),
    compared: plan.map((item) => ({ key: groupKey(item.group), checks: item.checks.length, asserted: assertedOf.get(groupKey(item.group)) ?? 0 })).sort((a, b) => a.key.localeCompare(b.key)),
    environment: { viewport: VIEWPORT, deviceScaleFactor: 1, reducedMotion: 'reduce', colorScheme: 'light', frameWidth: FRAME_WIDTH, framedWidth: FRAMED_WIDTH, axeTags: AXE_TAGS },
    groups: pages.size,
    languages: [...languages].sort(),
    frameworks: FRAMEWORKS,
    interactionChecks,
    assertedSteps: asserted,
    axeFrames: axeChecked,
    keyboard: keys.report,
    // The pages whose keyboard outcomes keyboard-exceptions.json leaves unchecked.
    keyboardUnchecked: keys.unchecked,
    comparedAfterInteraction: interacted.size,
    comparedAtRestOnly: pages.size - interacted.size,
    documentedDifferences: documented,
    failures: [...failures].sort(),
    comparisons: rows,
  };
  mkdirSync(dirname(reportFile), { recursive: true });
  writeFileSync(reportFile, `${JSON.stringify(report, null, 2)}\n`);
  if (options.keyReport) for (const line of keyboardReportLines(keys.report)) log(line);
  for (const entry of documented) {
    const scope = entry.ignore ? `ignores ${entry.ignore.map((rule) => `${rule.attribute} on .${rule.class}`).join(', ')}` : 'skipped';
    log(`equivalence: documented difference ${entry.id} (${entry.component}, ${entry.aspect}, approved by ${entry.approvedBy}, ${entry.source}) ${scope} for ${entry.groups.join(', ')}: ${entry.description}`);
  }
  if (failures.length > 0) throw new Error([...failures].sort().join('\n'));
  report.summary = summaryLine({
    groups: pages.size, languages: languages.size, frameworks: FRAMEWORKS.length, interactionChecks,
    afterInteraction: interacted.size, restOnly: pages.size - interacted.size, documented: documented.length,
    asserted, axeFrames: axeChecked,
  });
  if (options.keys === false) report.summary = `${report.summary}; HWE-KEYS left out (--draft)`;
  if (shard) report.summary = report.summary.replace(/^equivalence: /, `equivalence shard ${shard.index}/${shard.total} (${plan.length} of ${selected.length} group-languages): `);
  if (options.pages) report.summary = `${report.summary}; only the pages ${options.pages.join(', ')} (--pages)`;
  return report;
}

/** '<i>/<n>' as { index, total }; throws on anything else. */
export function parseShard(value) {
  const match = /^(\d+)\/(\d+)$/.exec(String(value));
  const index = Number(match?.[1]);
  const total = Number(match?.[2]);
  if (!match || total < 1 || index < 1 || index > total) throw new Error(`HWE-SCOPE --shard:1: ${value} is not <i>/<n> with 1 <= i <= n`);
  return { index, total };
}

/**
 * The groups of shard i of n: key k of the sorted list of group keys belongs to
 * shard (k mod n) + 1, so the n shards are a partition of the groups and neighbouring
 * groups of one page are spread over the shards.
 */
export function shardGroups(groups, { index, total }) {
  const sorted = [...groups].sort((a, b) => groupKey(a).localeCompare(groupKey(b)));
  return sorted.filter((_, k) => k % total === index - 1);
}

/** The number of workers: a whole number from 1 to 8, default 2. */
export function workerCount(value) {
  if (value === undefined || value === null || value === '') return 2;
  const count = Number(value);
  if (!Number.isInteger(count) || count < 1 || count > 8) throw new Error(`HWE-SCOPE --workers:1: ${value} is not a whole number from 1 to 8`);
  return count;
}

/** Failure lines for --pages ids that name no page with live groups. */
export function pagesErrors(groups, pages) {
  if (!pages) return [];
  const ids = new Set(groups.map((group) => group.id));
  return pages.filter((id) => !ids.has(id)).map((id) => `HWE-SCOPE --pages:1: ${id} names no built page with live groups`);
}

/** The checks a group names (check=<a>[,<b>...]). */
export const checkNames = (group) => (typeof group.check === 'string' && group.check !== '' ? group.check.split(',') : []);


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
export function summaryLine({ groups, languages, frameworks, interactionChecks, afterInteraction, restOnly, documented, asserted = 0, axeFrames = 0 }) {
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  return `equivalence: ${groups} groups x ${languages} languages x ${frameworks} frameworks equal `
    + `(${afterInteraction} compared after interaction, ${restOnly} at rest only; `
    + `${plural(interactionChecks, 'interaction check', 'interaction checks')}, ${plural(asserted, 'asserted step', 'asserted steps')}, ${plural(documented, 'documented difference', 'documented differences')}; `
    + `axe clean in ${plural(axeFrames, 'frame document', 'frame documents')})`;
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
    // --draft leaves HWE-KEYS out: a local run on pages whose keyboard checks are not written (the scale fixture); never in guide.yml.
    if (argv[i] === '--draft') {
      options.keys = false;
      continue;
    }
    const [flag, inline] = argv[i].split('=', 2);
    const value = inline ?? argv[++i];
    if (value === undefined) throw new Error(`${flag} needs a value`);
    if (flag === '--dir') options.browserDir = value;
    else if (flag === '--base') options.basePath = value;
    else if (flag === '--only') options.only = value.split(',').filter(Boolean);
    else if (flag === '--pages') options.pages = value.split(',').filter(Boolean);
    else if (flag === '--shard') options.shard = value;
    else if (flag === '--report') options.report = value;
    else if (flag === '--workers') options.workers = workerCount(value);
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
