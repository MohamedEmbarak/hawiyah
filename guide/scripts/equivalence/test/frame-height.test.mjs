// The frames of a group are laid out at one fixed height when a frame document has an
// element whose minimum block size follows the viewport (min-block-size: 100dvh on
// .hw-app-shell and .hw-portal-layout). Before the change such a frame took every height
// its document reported and grew until the bound of the protocol, and each framework
// stopped at another height, so the screenshots of App shell and Portal layout differed.
import { chromium } from '@playwright/test';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { FRAMEWORKS } from '../compare.mjs';
import { FIXED_FRAME_HEIGHT, PROBE_HEIGHTS, chromiumPath, layOutFrames } from '../run.mjs';

const moduleFile = fileURLToPath(new URL('../harness/frame-height.ts', import.meta.url));

/** frame-height.ts of the harness, as a script that defines the global frameHeight. */
async function frameHeightScript() {
  const result = await build({ entryPoints: [moduleFile], bundle: true, format: 'iife', globalName: 'frameHeight', write: false, logLevel: 'silent' });
  return result.outputFiles[0].text;
}

/** A frame document of the stand-in: body padding as in the result frames, and a height report at load and on every resize. */
const frameDocument = (framework, style) => `<!doctype html><html><head><style>body{margin:0;padding:20px}.part{min-block-size:${style}}</style></head><body>`
  + `<div id="hawiyah-preview-root"><div class="part"><p>${framework}</p></div></div>`
  + `<script>const report = () => parent.postMessage({ framework: '${framework}', height: Math.ceil(document.documentElement.getBoundingClientRect().height) }, '*');`
  + 'report(); new ResizeObserver(report).observe(document.documentElement);</script></body></html>';

/**
 * A stand-in for the harness page: four frames, each taking the height its document
 * reports (bounded at 4000 px, as the protocol bounds it) through frame-height.ts, and
 * __harnessFixHeight as the harness defines it.
 */
const standIn = (script, styles, offset = 0) => `<!doctype html><html><body style="margin:0"><div style="block-size:${offset}px"></div>`
  + FRAMEWORKS.map((framework) => `<iframe data-framework="${framework}" sandbox="allow-scripts" style="inline-size:720px;border:0" srcdoc="${frameDocument(framework, styles[framework]).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"></iframe>`).join('')
  + `<script>${script}
const heights = new Map();
window.__harness = { frames: {} };
for (const framework of ${JSON.stringify(FRAMEWORKS)}) {
  heights.set(framework, { element: document.querySelector('iframe[data-framework="' + framework + '"]'), reported: 0, fixed: null });
  window.__harness.frames[framework] = {};
}
window.__reported = {};
window.addEventListener('message', (event) => {
  window.__reported[event.data.framework] = event.data.height;
  frameHeight.reportHeight(heights.get(event.data.framework), Math.min(4000, Math.max(80, event.data.height)));
});
window.__harnessFixHeight = (framework, height) => {
  frameHeight.fixHeight(heights.get(framework), height);
  if (height === null) delete window.__harness.frames[framework].fixed;
  else window.__harness.frames[framework].fixed = height;
  return true;
};
</script></body></html>`;

const frameHeights = (page) => page.evaluate((names) => names.map((name) => document.querySelector(`iframe[data-framework="${name}"]`).getBoundingClientRect().height), FRAMEWORKS);
const pause = (ms) => new Promise((done) => setTimeout(done, ms));

describe('frame-height.ts', () => {
  it('lets a frame take each reported height until the runner fixes it, and back after release', async () => {
    const { fixHeight, reportHeight } = await import('../harness/frame-height.ts');
    const element = { style: { blockSize: '' } };
    const frame = { element, reported: 0, fixed: null };
    reportHeight(frame, 300);
    expect(element.style.blockSize).toBe('300px');
    fixHeight(frame, 720);
    reportHeight(frame, 760);
    expect(element.style.blockSize).toBe('720px');
    expect(frame.reported).toBe(760);
    fixHeight(frame, null);
    expect(element.style.blockSize).toBe('760px');
    const fresh = { element: { style: { blockSize: '' } }, reported: 0, fixed: null };
    fixHeight(fresh, 600);
    fixHeight(fresh, null);
    expect(fresh.element.style.blockSize).toBe('');
  });
});

describe('layOutFrames', () => {
  let browser;
  let script;
  beforeAll(async () => {
    script = await frameHeightScript();
    browser = await chromium.launch({ executablePath: chromiumPath() });
  });
  afterAll(async () => {
    await browser?.close();
  });

  const open = async (styles, offset = 0) => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.setContent(standIn(script, styles, offset));
    // Each frame has reported its height once (the frames are sandboxed, as the result frames are).
    await page.waitForFunction((names) => names.every((name) => typeof window.__reported[name] === 'number'), FRAMEWORKS);
    return page;
  };

  it('fixes the four frames at one height when one document has an element with a minimum block size of 100dvh, which otherwise grows its frame', async () => {
    const page = await open({ vanilla: '100dvh', react: '0px', vue: '0px', angular: '0px' });
    try {
      // The frame grows with every report: the body padding adds to a block as tall as the viewport.
      await page.waitForFunction(() => document.querySelector('iframe[data-framework="vanilla"]').getBoundingClientRect().height > 1500, null, { timeout: 10_000 });
      expect(await layOutFrames(page)).toBe(FIXED_FRAME_HEIGHT);
      expect(await frameHeights(page)).toEqual(FRAMEWORKS.map(() => FIXED_FRAME_HEIGHT));
      await pause(500);
      expect(await frameHeights(page)).toEqual(FRAMEWORKS.map(() => FIXED_FRAME_HEIGHT));
      const viewport = await page.frameLocator('iframe[data-framework="vanilla"]').locator('body').evaluate(() => window.innerHeight);
      expect(viewport).toBe(FIXED_FRAME_HEIGHT);
      expect(await page.evaluate(() => Object.values(window.__harness.frames).map((frame) => frame.fixed))).toEqual(FRAMEWORKS.map(() => FIXED_FRAME_HEIGHT));
    } finally {
      await page.close();
    }
  });

  // The frames below the viewport of the page get no animation frames, so the probe waits on a timer.
  it('finds a viewport-relative minimum block size in any frame, and of any viewport fraction, also below the viewport of the page', async () => {
    const page = await open({ vanilla: '0px', react: '0px', vue: '0px', angular: '50vh' }, 2000);
    try {
      expect(await layOutFrames(page)).toBe(FIXED_FRAME_HEIGHT);
      expect(await frameHeights(page)).toEqual(FRAMEWORKS.map(() => FIXED_FRAME_HEIGHT));
    } finally {
      await page.close();
    }
  });

  it('leaves the frames at their reported heights when no minimum block size follows the viewport', async () => {
    const page = await open({ vanilla: '300px', react: '300px', vue: '300px', angular: '300px' });
    try {
      expect(PROBE_HEIGHTS).toHaveLength(2);
      expect(await layOutFrames(page)).toBeNull();
      // Each frame takes the height of its document again: a block of 300 px with the body padding.
      const fit = () => Array.from(document.querySelectorAll('iframe')).every((frame) => frame.getBoundingClientRect().height === window.__reported[frame.dataset.framework]);
      await page.waitForFunction(fit, null, { timeout: 5_000 });
      await pause(300);
      expect(await page.evaluate(fit)).toBe(true);
      const heights = await frameHeights(page);
      expect(heights.every((height) => height > 340 && height < PROBE_HEIGHTS[0])).toBe(true);
      expect(await page.evaluate(() => Object.values(window.__harness.frames).map((frame) => frame.fixed))).toEqual(FRAMEWORKS.map(() => undefined));
    } finally {
      await page.close();
    }
  });
});
